import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  crearConfiguracionCerramiento, esConfiguracionCerramiento, generarPlantillaCatalogo, plantillaDiseno,
  registrarCatalogoDiseno, type CotaCatalogo, type ConfiguracionCerramiento, type ModuloCerramiento,
} from '@aluminior/core/estructuras'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import { PanelElemento } from './disenador/panel-elemento.tsx'
import { cambioCotaCampo } from './medidas-elemento.tsx'
import { aplicarBorrador, type Borradores } from './use-borradores-cerramiento.ts'

const fi = (valor = 280, nombre: string | null = 'Fijo inferior'): CotaCatalogo => ({
  simbolo: 'FI', nombre, valorPorDefecto: valor, orientacion: 'V',
})

function registrar2Ofi() {
  const generada = generarPlantillaCatalogo({
    codigo: '2OFI', descripcion: 'Sintética 2OFI', familiaCodigo: '001', anchoMm: 1200, altoMm: 2100,
    nodos: [
      { id: 0, tipo: 1, padre: -1, division: 0, posicion: 0, travesano: '', invisible: false,
        hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: 'NOR', variantes: [] },
      { id: 1, tipo: 5, padre: 0, division: 0, posicion: 0, travesano: '', invisible: false,
        hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: '', variantes: [] },
    ],
  })
  if (generada.estado !== 'dibujable') throw new Error('2OFI sintética no dibujable')
  registrarCatalogoDiseno([generada.plantilla])
  return generada.plantilla
}

function modulo2Ofi(cotas?: ModuloCerramiento['cotas']): ModuloCerramiento {
  const base = crearConfiguracionCerramiento(plantillaDiseno('2OFI')!).modulos[0]
  return cotas ? { ...base, cotas } : base
}

function panel(modulo: ModuloCerramiento, cotas: readonly CotaCatalogo[], borrador: Borradores['modulos'][string] = {}) {
  return renderToStaticMarkup(<PanelElemento
    modulo={modulo} borrador={borrador} indice={1}
    rect={{ x: 0, y: 0, ancho: modulo.anchoMm, alto: modulo.altoMm }}
    pendiente={Object.keys(borrador).length > 0} bloqueado={false} preparada={null}
    eliminable={false} generales={{ serieCodigo: null, vidrioCodigo: null }} series={[]} modelos={1}
    cotasCatalogo={cotas} moviendo={false} onChange={vi.fn()} onActualizar={vi.fn()}
    onActualizarModelos={vi.fn()} onDescartar={vi.fn()} onSustituir={vi.fn()}
    onEliminar={vi.fn()} onMover={vi.fn()} />)
}

describe('cotas del elemento en el panel', () => {
  afterEach(() => registrarCatalogoDiseno([]))

  it('una 2OFI muestra FI con el valor del catálogo y, al cambiarlo y aplicar, guarda modulo.cotas.FI', () => {
    registrar2Ofi()
    const modulo = modulo2Ofi()
    const html = panel(modulo, [fi()])
    expect(html).toContain('Fijo inferior')
    expect(html).toContain('data-cota="FI"')
    expect(html).toContain('data-cota-defecto="FI"')
    expect(html).toContain('>280<')
    expect(html).toContain('value="280"')
    expect(html).toContain('<span>mm</span>')
    expect(html).toMatch(/data-cota="FI"(?![^>]*tabindex="-1")/)

    const config: ConfiguracionCerramiento = {
      ...crearConfiguracionCerramiento(plantillaDiseno('2OFI')!), version: 3, modulos: [modulo], uniones: [],
    }
    const disenador = renderToStaticMarkup(<DisenadorEstructura codigo="2OFI" anchoMm={1200} altoMm={2100}
      configuracionInicial={config} cotasCatalogo={{ '2OFI': [fi()] }}
      onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />)
    expect(disenador).toContain('data-cota="FI"')
    expect(disenador).toContain('value="280"')
    expect(config.modulos[0].cotas).toBeUndefined()

    const borradores: Borradores = { modulos: { 'modulo-1': { cotas: cambioCotaCampo('FI', '450', 450) } }, uniones: {} }
    const aplicado = aplicarBorrador(config, borradores, 'modulos', 'modulo-1')!
    expect(aplicado.modulos[0].cotas).toEqual({ FI: 450 })
    expect(esConfiguracionCerramiento(aplicado)).toBe(true)
  })

  it('una estructura sin cotas de catálogo no muestra ningún campo nuevo', () => {
    const html = panel(crearConfiguracionCerramiento(plantillaDiseno('2O')!).modulos[0], [])
    expect(html).not.toContain('data-cota=')
    expect(html).toContain('Ancho elemento')
    expect(html).toContain('Alto elemento')
  })

  it('una cota inválida no se aplica y el error queda asociado al campo', () => {
    registrar2Ofi()
    const modulo = modulo2Ofi()
    const html = panel(modulo, [fi()], { cotas: { FI: 0 } })
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('aria-describedby="cota-error-modulo-1-FI"')
    expect(html).toContain('id="cota-error-modulo-1-FI"')
    expect(html).toContain('FI debe ser un número mayor que 0 y menor que el alto del elemento.')

    const config: ConfiguracionCerramiento = {
      ...crearConfiguracionCerramiento(plantillaDiseno('2OFI')!), version: 3, modulos: [modulo], uniones: [],
    }
    const guardado = JSON.stringify(config)
    const borradores: Borradores = { modulos: { 'modulo-1': { cotas: cambioCotaCampo('FI', '0', 0) } }, uniones: {} }
    expect(aplicarBorrador(config, borradores, 'modulos', 'modulo-1')).toBeNull()
    expect(JSON.stringify(config)).toBe(guardado)
  })

  it('vaciar el campo quita la cota y el panel vuelve al valor del catálogo', () => {
    registrar2Ofi()
    const conInstancia = modulo2Ofi({ FI: 450 })
    expect(panel(conInstancia, [fi()])).toContain('value="450"')
    const config: ConfiguracionCerramiento = {
      ...crearConfiguracionCerramiento(plantillaDiseno('2OFI')!), version: 3,
      modulos: [conInstancia], uniones: [],
    }
    const borradores: Borradores = { modulos: { 'modulo-1': { cotas: cambioCotaCampo('FI', '', Number.NaN) } }, uniones: {} }
    const limpio = aplicarBorrador(config, borradores, 'modulos', 'modulo-1')!
    expect(limpio.modulos[0]).not.toHaveProperty('cotas')
    expect(panel(limpio.modulos[0], [fi()])).toContain('value="280"')
  })

  it('1OFI sigue usando fiMm y no duplica FI', () => {
    const modulo = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!).modulos[0]
    const html = panel(modulo, [
      fi(280, 'Fijo inferior'),
      { simbolo: 'FS', nombre: 'Fijo superior', valorPorDefecto: 400, orientacion: 'V' },
    ])
    expect(html.match(/>FIJO INFERIOR</g)).toEqual(['>FIJO INFERIOR<'])
    expect(html).not.toContain('data-cota="FI"')
    expect(html).toContain('value="300"')
    expect(html).toContain('data-cota="FS"')
    expect(html).toContain('value="400"')
  })

  it('un snapshot v3 sin cotas sigue igual al abrirlo y al actualizar otra medida', () => {
    const original: ConfiguracionCerramiento = {
      ...crearConfiguracionCerramiento(plantillaDiseno('2O')!), version: 3,
    }
    const guardado = JSON.stringify(original)
    const html = renderToStaticMarkup(<DisenadorEstructura codigo="2O" anchoMm={1200} altoMm={1200}
      configuracionInicial={original} cotasCatalogo={{ '2O': [fi()] }}
      onConfiguracionChange={vi.fn()} onDimensionesChange={vi.fn()} />)
    expect(html).toContain('value="280"')
    expect(JSON.stringify(original)).toBe(guardado)
    expect(original.modulos[0]).not.toHaveProperty('cotas')

    const borradores: Borradores = { modulos: { 'modulo-1': { anchoMm: 1100 } }, uniones: {} }
    const ancho = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(ancho.version).toBe(3)
    expect(ancho.modulos[0]).toMatchObject({ anchoMm: 1100 })
    expect(ancho.modulos[0]).not.toHaveProperty('cotas')
    expect(JSON.stringify(original)).toBe(guardado)
  })

  it('si falta el nombre, la etiqueta es el símbolo', () => {
    registrar2Ofi()
    const html = panel(modulo2Ofi(), [{ simbolo: 'TD', nombre: null, valorPorDefecto: 700, orientacion: 'H' }])
    expect(html).toContain('>TD ')
    expect(html).toContain('data-cota="TD"')
    expect(html).toContain('value="700"')
  })
})
