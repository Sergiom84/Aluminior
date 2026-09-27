import React from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import { PresupuestoPDF } from './documento.tsx'
import type { DatosPresupuestoPdf, LineaPdf } from './tipos.ts'

interface NodoLayout {
  type: string
  box?: { top: number; left: number; width: number; height: number; paddingBottom?: number }
  props?: { fixed?: boolean }
  lines?: { string: string }[]
  children?: NodoLayout[]
}
interface Colocado { tipo: string; texto: string; pagina: number; y: number; alto: number; fijo: boolean }

const linea = (codigo: string, orden: number): LineaPdf => ({
  id: `sintetica-${orden}`, orden, tipo: 'CERRAMIENTO',
  descripcion: `CERRAMIENTO SEGÚN DIBUJO · ${codigo}`, referencia: `QA-${codigo}`,
  anchoMm: 1220 + orden, altoMm: 300, cantidad: '1', precioUnitario: null, total: null,
  valoracionCompleta: false, avisoValoracion: 'Diagnóstico sintético',
  cerramiento: { estadoSnapshot: 'con-snapshot', manoObra: [], configuracion: {
    version: 1, modulos: [{ id: 'm', estructuraCodigo: codigo, anchoMm: 1220 + orden, altoMm: 300 }], uniones: [],
  } },
})
const datos = (lineas: LineaPdf[]): DatosPresupuestoPdf => ({
  id: 'sintetico', serie: 'QA', numero: 999, revision: 0, fecha: '2026-09-27',
  estado: 'PENDIENTE', destinatario: 'QA PAGINACIÓN', obra: null, formaPago: null, observaciones: null,
  tarifa: 1, tipoIva: 21, baseImponible: 0, cuotaIva: 0, total: 0, incompleto: true, lineas,
})

async function maquetar(lineas: LineaPdf[]) {
  let layout: NodoLayout | undefined
  const documento = React.cloneElement(PresupuestoPDF({ datos: datos(lineas) }), {
    onRender: (resultado: unknown) => {
      layout = (resultado as { _INTERNAL__LAYOUT__DATA_: NodoLayout })._INTERNAL__LAYOUT__DATA_
    },
  } as DocumentProps)
  await renderToBuffer(documento)
  // La aserción impide un falso positivo si cambia la API interna de React-PDF.
  expect(layout?.children?.length).toBeGreaterThan(0)
  const colocados: Colocado[] = []
  const paginas = layout!.children!
  const visitar = (n: NodoLayout, pagina: number, yPadre = 0) => {
    const y = yPadre + (n.box?.top ?? 0)
    if (n.type === 'TEXT' || n.type === 'SVG') colocados.push({ tipo: n.type,
      texto: n.lines?.map(l => l.string).join(' ') ?? '', pagina,
      y, alto: n.box?.height ?? 0, fijo: n.props?.fixed ?? false })
    for (const hijo of n.children ?? []) visitar(hijo, pagina, y)
  }
  paginas.forEach((pagina, i) => visitar(pagina, i))
  return { paginas, colocados }
}

function comprobarDibujos(juego: Awaited<ReturnType<typeof maquetar>>, esperadas: readonly LineaPdf[]) {
  const { paginas, colocados } = juego
  const dibujos = colocados.filter(n => n.tipo === 'SVG')
  const etiquetas = colocados.filter(n => /^Línea \d+$/.test(n.texto))
  expect(dibujos).toHaveLength(esperadas.length)
  expect(etiquetas.map(n => n.texto)).toEqual(esperadas.map(l => `Línea ${l.orden}`))
  esperadas.forEach((l, i) => {
    const cotas = colocados.filter(n => n.texto === `${l.anchoMm} × ${l.altoMm} mm`)
    expect(cotas).toHaveLength(1)
    const [cota] = cotas
    expect(etiquetas[i].pagina, `Etiqueta separada del dibujo de línea ${l.orden}`).toBe(dibujos[i].pagina)
    expect(cota.pagina, `Cota separada del dibujo de línea ${l.orden}`).toBe(dibujos[i].pagina)
    expect(etiquetas[i].y + etiquetas[i].alto).toBeLessThanOrEqual(dibujos[i].y + 0.01)
    expect(dibujos[i].y + dibujos[i].alto).toBeLessThanOrEqual(cota.y + 0.01)
  })
  for (const [i, pagina] of paginas.entries()) {
    const pie = colocados.find(n => n.pagina === i && n.fijo)
    expect(pie, `Pie ausente en página ${i + 1}`).toBeDefined()
    const limite = Math.min(pie!.y, pagina.box!.height - (pagina.box!.paddingBottom ?? 36))
    for (const n of colocados.filter(n => n.pagina === i && !n.fijo)) {
      expect(n.y + n.alto, `${n.tipo} fuera de área útil en página ${i + 1}: ${n.texto}`)
        .toBeLessThanOrEqual(limite + 0.01)
    }
  }
}

describe('paginación real de las líneas del presupuesto', () => {
  it('mantiene cada etiqueta, dibujo y cota juntos y fuera del pie con siete cerramientos', async () => {
    const lineas = ['C2', '03H', '03V', '06', 'CF', 'CFT', 'FC'].map((c, i) => linea(c, i + 1))
    const juego = await maquetar(lineas)
    expect(juego.paginas.length).toBeGreaterThan(1)
    comprobarDibujos(juego, lineas)
    const texto = juego.colocados.map(n => n.texto).join(' ')
    expect(texto.match(/Valoración pendiente\./g)).toHaveLength(lineas.length)
    for (const l of lineas) expect(texto).toContain(l.referencia)
    for (const total of ['Base imponible', 'IVA 21%', 'Total']) expect(texto).toContain(total)
  })

  it('divide una descripción más alta que una página sin perder texto, aviso ni dibujo', async () => {
    const l = linea('CF', 1)
    l.descripcion = `INICIO ${'segmento '.repeat(1200)}FINAL`
    const juego = await maquetar([l])
    expect(juego.paginas.length).toBeGreaterThan(2)
    comprobarDibujos(juego, [l])
    const texto = juego.colocados.map(n => n.texto).join(' ')
    expect(texto.match(/segmento/g)).toHaveLength(1200)
    expect(texto.match(/INICIO/g)).toHaveLength(1)
    expect(texto.match(/FINAL/g)).toHaveLength(1)
    expect(texto).toContain('Valoración pendiente.')
    expect(texto).toContain('Total')
  })
})
