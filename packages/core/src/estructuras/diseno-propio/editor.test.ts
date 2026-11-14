import { describe, expect, it } from 'vitest'
import { generarPlantillaDisenoPropio, TIPO_COTA, TIPO_NODO } from '../../despiece/diseno-propio/index.ts'
import {
  actualizarDisenoPropioModuloCerramiento, actualizarDivisionDisenoPropio,
  cambiarBarrotilloHuecoDisenoPropio, cambiarHojaHuecoDisenoPropio,
  cambiarVidrioHuecoDisenoPropio, cotasEfectivasModulo, crearConfiguracionCerramiento,
  dividirHuecoDisenoPropio, eliminarDivisionDisenoPropio,
  inspeccionarDisenoPropio, plantillaDiseno, plantillaDisenoPropioModulo,
  sembrarDisenoPropioModulo,
} from '../index.ts'

describe('operaciones del editor `Diseño V3` (DS4 paso 3)', () => {
  it('siembra fijo `0`, `1OFI`, `2O` y rechaza familias aún fuera de alcance (`C2`)', () => {
    const fijo = crearConfiguracionCerramiento(plantillaDiseno('0')!).modulos[0]!
    expect(sembrarDisenoPropioModulo(fijo)?.nodos).toHaveLength(2)

    const unoFi = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!).modulos[0]!
    const sembrado1Ofi = sembrarDisenoPropioModulo(unoFi)!
    expect(sembrado1Ofi.nodos.find(n => n.tipo === TIPO_NODO.travesano)).toMatchObject({
      posicion: 'HB', tipoCota: TIPO_COTA.variable, cota: 300, simbolo: 'FI',
    })

    const dosO = crearConfiguracionCerramiento(plantillaDiseno('2O')!).modulos[0]!
    const sembrado2O = sembrarDisenoPropioModulo(dosO)!
    expect(generarPlantillaDisenoPropio(sembrado2O).ok).toBe(true)

    const corredera = crearConfiguracionCerramiento(plantillaDiseno('C2')!).modulos[0]!
    expect(sembrarDisenoPropioModulo(corredera)).toBeNull()
  })

  it('reproduce desde cero los casos clave del 260508 con las mismas operaciones que haría el operador', () => {
    const base0 = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const inicial0 = sembrarDisenoPropioModulo(base0.modulos[0]!)!

    // Caso 3: fijo con travesaño HB a cota fija 400 y vidrio propio opcional.
    const caso3 = dividirHuecoDisenoPropio(inicial0, 0, { posicion: 'HB', tipoCota: 2, cotaMm: 400 })
    const insp3 = inspeccionarDisenoPropio(caso3, 1200, 1200)
    expect(insp3.valido).toBe(true)
    expect(insp3.huecos.map(h => h.rectMm?.alto)).toEqual([800, 400])

    // Caso 4: subdividir el hueco inferior con vertical equidistante y después eliminar la subdivisión.
    const caso4 = dividirHuecoDisenoPropio(caso3, insp3.huecos[1]!.regionId, { posicion: 'VI', tipoCota: 0, huecos: 2 })
    const insp4 = inspeccionarDisenoPropio(caso4, 1200, 1200)
    expect(insp4.huecos).toHaveLength(3)
    const sinSub = eliminarDivisionDisenoPropio(caso4, insp4.divisiones[1]!.divisionId)
    expect(inspeccionarDisenoPropio(sinSub, 1200, 1200).huecos).toHaveLength(2)

    // Caso 7: travesaño HB a 300 y hoja oscilobatiente izquierda (`tipoHoja = 6`) en el hueco inferior.
    const a300 = actualizarDivisionDisenoPropio(caso3, insp3.divisiones[0]!.divisionId, { cotaMm: 300 })
    const inspA300 = inspeccionarDisenoPropio(a300, 1200, 1200)
    const caso7 = cambiarHojaHuecoDisenoPropio(a300, inspA300.huecos[1]!.regionId, { modo: 'hoja', tipoHoja: 6 })
    const guardada7 = actualizarDisenoPropioModuloCerramiento(base0, 'modulo-1', caso7)
    expect(plantillaDisenoPropioModulo(guardada7.modulos[0]!)?.some(f => f.componente === '29')).toBe(true) // vierteaguas presente
    expect(plantillaDisenoPropioModulo(guardada7.modulos[0]!)?.some(f => f.componente === '130')).toBe(true) // manilla MI presente

    // Caso 8: vidrio propio VGS616AL33I + barrotillo BI 2H × 1V.
    const conVidrio = cambiarVidrioHuecoDisenoPropio(inicial0, 0, 'vgs616al33i')
    const caso8 = cambiarBarrotilloHuecoDisenoPropio(conVidrio, 0, { horizontales: 2, verticales: 1 })
    const filas8 = generarPlantillaDisenoPropio(caso8)
    expect(filas8.ok).toBe(true)
    if (!filas8.ok) throw new Error(filas8.motivo)
    expect(filas8.filas.find(f => f.componente === '1')?.vidrioPropio).toBe('VGS616AL33I')
    expect(filas8.filas.filter(f => f.componente === 'BI').map(f => f.cantidad)).toEqual([2, 1])

    // Caso 10: partir de 1OFI nacida a 300 y cambiar `Cota por` a 500 escribe 500 en la línea.
    const base1Ofi = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const inicial1Ofi = sembrarDisenoPropioModulo(base1Ofi.modulos[0]!)!
    const div1Ofi = inspeccionarDisenoPropio(inicial1Ofi, 800, 1500, cotasEfectivasModulo(base1Ofi.modulos[0]!)).divisiones[0]!
    const caso10 = actualizarDivisionDisenoPropio(inicial1Ofi, div1Ofi.divisionId, { cotaMm: 500 })
    const guardada10 = actualizarDisenoPropioModuloCerramiento(base1Ofi, 'modulo-1', caso10)
    expect(guardada10.modulos[0]?.fiMm).toBe(500)
  })

  it('alterna un hueco entre pareja `2O` y fijo limpiando la división invisible', () => {
    const base0 = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const inicial = sembrarDisenoPropioModulo(base0.modulos[0]!)!
    const enPareja = cambiarHojaHuecoDisenoPropio(inicial, 0, { modo: 'pareja', tipoHoja: 8 })
    const inspPareja = inspeccionarDisenoPropio(enPareja, 1200, 1200)
    expect(inspPareja.huecos).toHaveLength(2)
    expect(inspPareja.huecos.map(h => h.contenido)).toEqual([
      { modo: 'pareja', tipoHoja: 8, indiceHoja: 1 },
      { modo: 'pareja', tipoHoja: 8, indiceHoja: 2 },
    ])

    // Volver a fijo desde cualquiera de las dos hojas de la pareja usa `regionId` del contenedor.
    const deVuelta = cambiarHojaHuecoDisenoPropio(enPareja, inspPareja.huecos[0]!.regionId, { modo: 'fijo' })
    expect(inspeccionarDisenoPropio(deVuelta, 1200, 1200).huecos).toHaveLength(1)
  })
})
