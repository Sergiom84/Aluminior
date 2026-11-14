import { describe, expect, it } from 'vitest'
import { calcularDespiece, type ComponentePlantilla } from '../despiece/calcular.ts'
import { generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO, type NodoDiseno } from '../despiece/diseno-propio/index.ts'
import { valorarDespiece, type DatosArticuloPrecio } from '../precios/calcular.ts'
import {
  actualizarDisenoPropioModuloCerramiento, actualizarFiModuloCerramiento,
  cambiarEstructuraModuloCerramiento, composicionVisualDisenoPropio,
  cotasEfectivasModulo, crearConfiguracionCerramiento, disenoPropioModuloValido,
  distribuirModuloCerramiento, esConfiguracionCerramiento,
  plantillaDiseno, plantillaDisenoPropioModulo, type ModuloCerramiento,
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

/** Precio de las piezas cuya fórmula es FI, con el calculador real y 10 €/m. */
function precioSegunLinea(modulo: ModuloCerramiento): number {
  const filas = plantillaDisenoPropioModulo(modulo)
  if (!filas) throw new Error('sin lista de corte')
  const dependientes = filas.filter(f => f.formulaLargo === 'FI')
  if (dependientes.length === 0) throw new Error('la lista no tiene FI')
  const plantilla: ComponentePlantilla[] = dependientes.map(f => ({
    articuloCodigo: f.articulo, cantidad: f.cantidad, formulaLargo: f.formulaLargo,
    tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, funcion: f.funcion,
  }))
  const despiece = calcularDespiece(
    plantilla, { anchoMm: modulo.anchoMm, altoMm: modulo.altoMm }, cotasEfectivasModulo(modulo) ?? {},
  )
  if (despiece.incalculables !== 0) throw new Error(`sin medida: ${despiece.variablesFaltantes.join(',')}`)
  const articulos = new Map<string, DatosArticuloPrecio>()
  for (const pieza of despiece.piezas) {
    if (!articulos.has(pieza.articuloCodigo)) {
      articulos.set(pieza.articuloCodigo, {
        codigo: pieza.articuloCodigo, tipoMetraje: 'ML', precio: 10,
        metrajeMinimo: null, metrajeMultiploLargo: null,
      })
    }
  }
  const valorado = valorarDespiece(despiece.piezas, articulos)
  if (!valorado.completa) throw new Error('precio incompleto')
  return valorado.importe
}

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

  it('proyecta barrotillos interiores, travesaños anidados y parejas de hojas desde la misma lectura que el despiece', () => {
    const base = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    // Caso 8 del 260508: barrotillo BI con 2 horizontales y 1 vertical sobre vidrio propio.
    const conBarrotillo = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', {
      nodos: [
        marco(),
        { id: 1, tipo: TIPO_NODO.vidrio, contenidoEn: 0, vidrio: 'VGS616AL33I' },
        { id: 2, tipo: TIPO_NODO.barrotillo, contenidoEn: 1, articulo: 'BI', horizontales: 2, verticales: 1 },
      ],
    })
    const colocado = distribuirModuloCerramiento(conBarrotillo.modulos[0]!, { x: 0, y: 0, ancho: 1200, alto: 1200 })
    expect(colocado).toMatchObject([{ tipo: 'hueco', apertura: 'fijo', barrotillo: { horizontales: 2, verticales: 1 } }])

    // Pareja tipo 9 (oscilobatiente a la izquierda, pasiva sin manilla a la derecha).
    const conPareja9 = actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', {
      nodos: [
        marco(),
        { id: 1, tipo: TIPO_NODO.travesano, contenidoEn: 0, posicion: 'VI', division: 1, orden: 1, material: 'M', invisible: true },
        { id: 2, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 1 },
        { id: 3, tipo: TIPO_NODO.hueco, contenidoEn: 0, division: 1, orden: 2 },
        { id: 4, tipo: TIPO_NODO.hoja, contenidoEn: 2, tipoHoja: 9, clase: 'V', cortes: [1, 1, 1, 1], accesorios: ['MI'] },
        { id: 5, tipo: TIPO_NODO.hoja, contenidoEn: 3, tipoHoja: 9, clase: 'V', cortes: [1, 1, 1, 1], accesorios: [] },
        { id: 6, tipo: TIPO_NODO.vidrio, contenidoEn: 4, vidrio: null },
        { id: 7, tipo: TIPO_NODO.vidrio, contenidoEn: 5, vidrio: null },
      ],
    })
    const hojasPareja = distribuirModuloCerramiento(conPareja9.modulos[0]!, { x: 0, y: 0, ancho: 1200, alto: 1200 })
      .filter(e => e.tipo === 'hueco')
    expect(hojasPareja.map(h => ({ apertura: h.apertura, manilla: h.manilla }))).toEqual([
      { apertura: 'oscilobatiente-izquierda', manilla: true },
      { apertura: 'abatible-derecha', manilla: false },
    ])

    // Una cota variable no puede vivir solo en el árbol si la línea no la define (p. ej. fijo '0').
    expect(composicionVisualDisenoPropio({ nodos: diseno1OfiCota500 }, null)).toBeNull()
    expect(actualizarDisenoPropioModuloCerramiento(base, 'modulo-1', { nodos: diseno1OfiCota500 })).toBe(base)
  })

  it('en la 1OFI que nace a 300, guardar el fijo de abajo a 500 deja 500 en la línea y el precio usa 500', () => {
    const nacida = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    expect(nacida.modulos[0]).toMatchObject({ estructuraCodigo: '1OFI', fiMm: 300 })

    const guardada = actualizarDisenoPropioModuloCerramiento(nacida, 'modulo-1', { nodos: diseno1OfiCota500 })
    const modulo = guardada.modulos[0]!
    expect(modulo.fiMm).toBe(500)
    expect(modulo.cotas).toBeUndefined()
    expect(cotasEfectivasModulo(modulo)).toEqual({ FI: 500 })

    const filas = plantillaDisenoPropioModulo(modulo)
    expect(filas?.some(f => f.formulaLargo === 'FI')).toBe(true)
    expect(filas?.some(f => f.formulaLargo === 'L-FI')).toBe(true)
    expect(JSON.stringify(filas)).not.toContain('500')

    const conLineaEn300 = actualizarFiModuloCerramiento(guardada, 'modulo-1', 300)
    expect(conLineaEn300.modulos[0]?.fiMm).toBe(300)
    expect(conLineaEn300.modulos[0]?.disenoPropio?.nodos.some(n => n.cota === 500)).toBe(true)
    expect(precioSegunLinea(modulo)).not.toBe(precioSegunLinea(conLineaEn300.modulos[0]!))
    expect(precioSegunLinea(modulo)).toBeGreaterThan(0)
  })

  it('si la línea sigue a 300, el precio usa 300 aunque el diseño guarde 500', () => {
    const nacida = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const guardada = actualizarDisenoPropioModuloCerramiento(nacida, 'modulo-1', { nodos: diseno1OfiCota500 })
    const lineaEn300 = actualizarFiModuloCerramiento(guardada, 'modulo-1', 300).modulos[0]!
    expect(lineaEn300.fiMm).toBe(300)
    expect(lineaEn300.disenoPropio?.nodos.some(n => n.simbolo === 'FI' && n.cota === 500)).toBe(true)

    const despiece = calcularDespiece(
      [{ articuloCodigo: 'FIJO', cantidad: 1, formulaLargo: 'FI', tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, funcion: null }],
      { anchoMm: lineaEn300.anchoMm, altoMm: lineaEn300.altoMm },
      cotasEfectivasModulo(lineaEn300) ?? {},
    )
    expect(despiece.piezas[0]?.largoMm).toBe(300)
    expect(precioSegunLinea(lineaEn300)).toBeLessThan(precioSegunLinea(guardada.modulos[0]!))
    expect(precioSegunLinea(guardada.modulos[0]!)).toBe(precioSegunLinea({ ...lineaEn300, fiMm: 500 }))
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
