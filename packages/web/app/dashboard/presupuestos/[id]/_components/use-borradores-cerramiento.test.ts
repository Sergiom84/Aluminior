import { describe, expect, it } from 'vitest'
import { anadirModuloCerramiento, crearConfiguracionCerramiento, plantillaDiseno,
  UNIONES_VISUALES, esConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { aplicarBorrador, type Borradores } from './use-borradores-cerramiento.ts'

const crear = () => anadirModuloCerramiento(
  crearConfiguracionCerramiento(plantillaDiseno('2O')!), plantillaDiseno('2O')!)
const vacios = (): Borradores => ({ modulos: {}, uniones: {} })

describe('aplicación explícita del cerramiento', () => {
  it('aplica solo el módulo solicitado sin mutar el original ni otro borrador', () => {
    const original = crear()
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm: 1450 }
    borradores.modulos['modulo-2'] = { anchoMm: 1800 }
    const resultado = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(resultado.modulos.map(m => m.anchoMm)).toEqual([1450, 1200])
    expect(original.modulos.map(m => m.anchoMm)).toEqual([1200, 1200])
    expect(borradores.modulos['modulo-2'].anchoMm).toBe(1800)
  })
  it.each([NaN, 0, -10, 1.5])('rechaza ancho inválido %s sin alterar configuración', anchoMm => {
    const original = crear()
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm }
    expect(aplicarBorrador(original, borradores, 'modulos', 'modulo-1')).toBeNull()
    expect(original.modulos[0].anchoMm).toBe(1200)
  })
  it('aplica alto y FI juntos y rechaza un FI fuera del hueco', () => {
    const original = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { altoMm: 900, fiMm: 950 }
    expect(aplicarBorrador(original, borradores, 'modulos', 'modulo-1')).toBeNull()
    borradores.modulos['modulo-1'].fiMm = 250
    const resultado = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(resultado.modulos[0]).toMatchObject({ altoMm: 900, fiMm: 250 })
  })
  it('usa el grosor del catálogo al actualizar sin mutar el snapshot histórico', () => {
    const original = crear()
    original.uniones = [{ ...original.uniones[0], codigo: 'PSU001', grosorMm: 100 }]
    const borradores = vacios()
    borradores.uniones['union-1'] = { longitudMm: 1350 }
    const historico = aplicarBorrador(original, borradores, 'uniones', 'union-1')!
    expect(historico.uniones[0]).toMatchObject({ grosorMm: 2, longitudMm: 1350 })
    expect(esConfiguracionCerramiento(historico)).toBe(true)
    const ps = UNIONES_VISUALES.find(item => item.codigo === 'PSU001')!
    borradores.uniones['union-1'] = { codigo: ps.codigo, grosorMm: ps.grosorMm }
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1')!.uniones[0].grosorMm).toBe(2)
    expect(original.uniones[0].grosorMm).toBe(100)
  })
  it('rechaza longitud vacía e identidades ausentes', () => {
    const original = crear()
    const borradores = vacios()
    borradores.uniones['union-1'] = { longitudMm: NaN }
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1')).toBeNull()
    expect(aplicarBorrador(original, vacios(), 'modulos', 'ausente')).toBeNull()
  })
})

describe('aplicación a modelos iguales (mejora autorizada de fase 4)', () => {
  const tres = () => anadirModuloCerramiento(crear(), plantillaDiseno('0')!)

  it('aplica medidas y materiales exactamente a los destinatarios indicados', () => {
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { altoMm: 1400, serieCodigo: 'GMA350' }
    const r = aplicarBorrador(tres(), borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])!
    expect(r.modulos.map(m => m.altoMm)).toEqual([1400, 1400, 1200])
    expect(r.modulos.map(m => m.materiales?.serieCodigo)).toEqual(['GMA350', 'GMA350', undefined])
    expect(esConfiguracionCerramiento(r)).toBe(true)
  })

  it('no aplica nada si la medida no vale para todos', () => {
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm: 0 }
    expect(aplicarBorrador(tres(), borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])).toBeNull()
  })

  it('vacío devuelve el elemento a la herencia del general', () => {
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { vidrioCodigo: 'PAN16' }
    const conExcepcion = aplicarBorrador(tres(), borradores, 'modulos', 'modulo-1')!
    borradores.modulos['modulo-1'] = { vidrioCodigo: null }
    const general = aplicarBorrador(conExcepcion, borradores, 'modulos', 'modulo-1')!
    expect(general.modulos[0]).not.toHaveProperty('materiales')
  })
})
