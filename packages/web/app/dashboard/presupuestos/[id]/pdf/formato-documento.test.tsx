import React from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import { PresupuestoPDF } from './documento.tsx'
import type { DatosPresupuestoPdf, LineaPdf } from './tipos.ts'

/** Intl separa el símbolo con espacio duro. */
const EUR = '\u00a0€'

interface Nodo { type: string; lines?: { string: string }[]; children?: Nodo[] }

/** Corredera C2 de la comparativa del 01/11/2026: 970 × 1999,5, dos unidades y media. */
const linea: LineaPdf = {
  id: 'formato-1', orden: 1, tipo: 'CERRAMIENTO', descripcion: 'CERRAMIENTO SEGÚN DIBUJO · C2', referencia: 'QA',
  anchoMm: 970, altoMm: 1999.5, cantidad: '2.5', precioUnitario: '1391.88', total: '3479.70',
  valoracionCompleta: true, avisoValoracion: null, acabadoArticuloCodigo: null,
  cerramiento: { estadoSnapshot: 'con-snapshot', manoObra: [
    { concepto: 'FABRICACION', horas: '1.25', importe: '1250.00', valoracionCompleta: true },
  ], configuracion: { version: 1, modulos: [{ id: 'm', estructuraCodigo: 'C2', anchoMm: 970, altoMm: 1999.5 }], uniones: [] } },
}
const datos: DatosPresupuestoPdf = {
  id: 'formato', serie: 'QA', numero: 1, revision: 0, fecha: '2026-11-06', estado: 'PENDIENTE',
  destinatario: 'QA FORMATO', obra: null, formaPago: null, observaciones: null, tarifa: 1, tipoIva: 21,
  baseImponible: 3479.7, cuotaIva: 730.74, total: 4210.44, incompleto: false, lineas: [linea],
}

async function textos() {
  let raiz: Nodo | undefined
  const documento = React.cloneElement(PresupuestoPDF({ datos }), {
    onRender: (r: unknown) => { raiz = (r as { _INTERNAL__LAYOUT__DATA_: Nodo })._INTERNAL__LAYOUT__DATA_ },
  } as DocumentProps)
  await renderToBuffer(documento)
  expect(raiz?.children?.length).toBeGreaterThan(0)
  const salida: string[] = []
  const visitar = (n: Nodo) => {
    if (n.type === 'TEXT') salida.push(n.lines?.map(l => l.string).join(' ') ?? '')
    for (const h of n.children ?? []) visitar(h)
  }
  visitar(raiz!)
  return salida
}

describe('el PDF del presupuesto escribe los números en formato español', () => {
  it('medidas, cantidad, horas e importes de la línea y totales', async () => {
    const t = await textos()
    expect(t).toContain('970,0 × 1.999,5')
    expect(t).toContain('970,0 × 1.999,5 mm')
    expect(t).toContain('2,5')
    expect(t).toContain(`1.391,88${EUR}`)
    expect(t).toContain(`3.479,70${EUR}`)
    expect(t).toContain(`4.210,44${EUR}`)
    expect(t.some(x => x.includes('1,25 h'))).toBe(true)
    // Ninguna medida o importe con punto decimal anglosajón.
    expect(t.filter(x => /\d\.\d{1,2}(?!\d)/.test(x) && !/\d\.\d{3}/.test(x))).toEqual([])
  })
})
