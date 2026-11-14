import { describe, expect, it } from 'vitest'
import { generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO, type NodoDiseno } from '../despiece/diseno-propio/index.ts'
import {
  actualizarCotasModuloCerramiento, actualizarDisenoPropioModuloCerramiento,
  cambiarEstructuraModuloCerramiento, composicionVisualDisenoPropio,
  cotasEfectivasModulo, crearConfiguracionCerramiento, disenoPropioModuloValido,
  distribuirModuloCerramiento, esConfiguracionCerramiento,
  plantillaDiseno, plantillaDisenoPropioModulo,
} from './index.ts'

const marco = (): NodoDiseno => ({
  id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'NOR', cortes: [1, 1, 1, 1],
})

/** Caso 3 del 260508: fijo `0` de 1.200 × 1.200 con travesaño horizontal abajo a cota fija 400. */
const disenoFijoCota400: readonly NodoDiseno[] = [
  marco(),
  {
    id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB',
    division: 1, orden: 1, tipoCota: TIPO_COTA.fija, cota: 400, material: 'M', clase: 'V',
  },
  { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
  { id: 3, tipo: TIPO_NODO.vidrio, contenidoEn: 2, vidrio: null },
  { id: 4, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
  { id: 5, tipo: TIPO_NODO.vidrio, contenidoEn: 4, vidrio: 'VCG6' },
]

/** Caso 7 del 260508: travesaño HB a 300 y hoja oscilobatiente en el hueco inferior. */
const disenoHojaEnHueco: readonly NodoDiseno[] = [
  marco(),
  {
    id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB',
    division: 1, orden: 1, tipoCota: TIPO_COTA.fija, cota: 300, material: 'M', clase: 'V',
  },
  { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
  {
    id: 3, tipo: TIPO_NODO.hoja, contenidoEn: 2, tipoHoja: 5,
    clase: 'V', cortes: [1, 1, 1, 1], accesorios: ['MI'],
  },
  { id: 4, tipo: TIPO_NODO.vidrio, contenidoEn: 3, vidrio: null },
  { id: 5, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
  { id: 6, tipo: TIPO_NODO.vidrio, contenidoEn: 5, vidrio: null },
]

/** Caso 10 del 260508: `1OFI` con `Cota por` del fijo inferior `FI` cambiada a 500 en el diseño. */
const diseno1OfiCota500: readonly NodoDiseno[] = [
  marco(),
  {
    id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'HB',
    division: 1, orden: 1, tipoCota: TIPO_COTA.variable, cota: 500, simbolo: 'FI', material: 'M', clase: 'V',
  },
  { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
  {
    id: 3, tipo: TIPO_NODO.hoja, contenidoEn: 2, tipoHoja: 6,
    clase: 'V', cortes: [1, 1, 1, 1], accesorios: ['MI'],
  },
  { id: 4, tipo: TIPO_NODO.vidrio, contenidoEn: 3, vidrio: null },
  { id: 5, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
  { id: 6, tipo: TIPO_NODO.vidrio, contenidoEn: 5, vidrio: null },
]

describe('diseño propio guardado en el módulo del cerramiento (DS4)', () => {
  it('promueve a v3 al guardar, conserva el árbol tras JSON round-trip y genera la misma plantilla que en memoria', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    expect(base.version).toBe(1)

    const guardada = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: disenoFijoCota400 })
    expect(guardada.version).toBe(3)

    const rehidratada = JSON.parse(JSON.stringify(guardada)) as unknown
    expect(esConfiguracionCerramiento(rehidratada)).toBe(true)
    if (!esConfiguracionCerramiento(rehidratada)) throw new Error('inválida')

    const directa = generarPlantillaDisenoPropio({ nodos: disenoFijoCota400 })
    expect(directa.ok).toBe(true)
    if (!directa.ok) throw new Error(directa.motivo)
    expect(plantillaDisenoPropioModulo(rehidratada.modulos[0]!)).toEqual(directa.filas)
  })

  it('proyecta la geometría visual del diseño propio (travesaño a cota fija y hoja en hueco)', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const conHoja = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: disenoHojaEnHueco })
    const elementos = distribuirModuloCerramiento(
      conHoja.modulos[0]!, { x: 0, y: 0, ancho: 1200, alto: 1200 }, 12,
    )
    const separador = elementos.find(e => e.tipo === 'separador')!
    const huecos = elementos.filter(e => e.tipo === 'hueco')

    // Cota fija HB = 300 sobre alto 1200 → eje físico a 900 mm desde arriba.
    expect(separador.y + separador.alto / 2).toBe(900)
    expect(huecos.map(h => h.apertura)).toEqual(['oscilobatiente-derecha', 'fijo'])
  })

  it('transmite la cota variable por defecto del diseño propio (`Cota por` = 500 en `FI`) y permite sobreescribirla con `cotas`', () => {
    const base = {
      ...crearConfiguracionCerramiento(plantillaDiseno('0')!),
      modulos: [{ id: 'modulo-1', estructuraCodigo: '0', anchoMm: 800, altoMm: 2000 }],
    }
    const conCota500 = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: diseno1OfiCota500 })
    expect(cotasEfectivasModulo(conCota500.modulos[0]!)).toEqual({ FI: 500 })

    const elementos500 = distribuirModuloCerramiento(
      conCota500.modulos[0]!, { x: 0, y: 0, ancho: 800, alto: 2000 }, 12,
    )
    const sep500 = elementos500.find(e => e.tipo === 'separador')!
    expect(sep500.y + sep500.alto / 2).toBe(1500)

    const conCotaInstancia = actualizarCotasModuloCerramiento(conCota500, 'modulo-1', { FI: 350 })
    expect(cotasEfectivasModulo(conCotaInstancia.modulos[0]!)).toEqual({ FI: 350 })
  })

  it('quita `disenoPropio` al pasar `null` o al cambiar la estructura de catálogo del módulo', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const conDiseno = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: disenoFijoCota400 })
    const sinDiseno = actualizarDisenoPropioModuloCerramiento(conDiseno, 'modulo-1', null)
    expect(sinDiseno.modulos[0]?.disenoPropio).toBeUndefined()
    expect(plantillaDisenoPropioModulo(sinDiseno.modulos[0]!)).toBeNull()

    const cambiada = cambiarEstructuraModuloCerramiento(conDiseno, 'modulo-1', plantillaDiseno('2O')!)
    expect(cambiada.modulos[0]?.disenoPropio).toBeUndefined()
  })

  it('rechaza diseños fuera de alcance de DS4, cotas fuera de rango y configuraciones v1/v2 con `disenoPropio`', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    // Marco de puerta (`PTA`) está fuera del alcance actual del generador DS4.
    const puerta: readonly NodoDiseno[] = [
      { id: 0, tipo: TIPO_NODO.marco, contenidoEn: -1, tipoMarco: 'PTA', cortes: [1, 1, 1, 1] },
      { id: 1, tipo: TIPO_NODO.vidrio, contenidoEn: 0, vidrio: null },
    ]
    expect(disenoPropioModuloValido({ nodos: puerta }, 1200, 1200)).toBe(false)
    expect(actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: puerta })).toBe(base)

    // Cota fija 400 no cabe en un módulo de 350 mm de alto.
    expect(disenoPropioModuloValido({ nodos: disenoFijoCota400 }, 1200, 350)).toBe(false)
    expect(composicionVisualDisenoPropio({ nodos: disenoFijoCota400 })).not.toBeNull()

    // En v1 no se admite `disenoPropio`.
    const v1Invalida = {
      ...base,
      modulos: [{ ...base.modulos[0]!, disenoPropio: { nodos: disenoFijoCota400 } }],
    }
    expect(esConfiguracionCerramiento(v1Invalida)).toBe(false)
  })
})
