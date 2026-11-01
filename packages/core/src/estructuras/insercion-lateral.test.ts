import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import { crearConfiguracionCerramiento, medidasCerramiento, moduloDesdePlantilla } from './cerramiento.ts'
import { insertarModuloEnAnclaje } from './composicion-cerramiento.ts'
import { anclajeInferior, anclajeLateral } from './insercion-lateral.ts'

const nuevo = (codigo: string) => moduloDesdePlantilla(plantillaDiseno(codigo)!)

describe('colocación lateral por defecto', () => {
  it('con un elemento ofrece su lado derecho', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    expect(anclajeLateral(inicial)).toMatchObject({ moduloId: 'modulo-1', lado: 'derecha', x: 1200, y: 0 })
  })

  it('encadena ventanas en fila: siempre a la derecha de la última', () => {
    let configuracion = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    for (const codigo of ['2O', '0', '2']) {
      configuracion = insertarModuloEnAnclaje(configuracion, nuevo(codigo), anclajeLateral(configuracion)!)
    }
    expect(configuracion.modulos).toHaveLength(4)
    expect(medidasCerramiento(configuracion)).toEqual({ anchoMm: 1200 * 4 + 20 * 3, altoMm: 1200 })
    expect(anclajeLateral(configuracion)?.moduloId).toBe(configuracion.modulos.at(-1)!.id)
  })

  it('con un elemento debajo sigue prefiriendo la fila superior', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    const conDebajo = insertarModuloEnAnclaje(inicial, nuevo('0'), { moduloId: 'modulo-1', lado: 'abajo' })
    expect(anclajeLateral(conDebajo)).toMatchObject({ moduloId: 'modulo-1', lado: 'derecha', y: 0 })
  })
})

describe('colocación debajo', () => {
  it('ofrece el inferior del elemento indicado, alineado a su izquierda', () => {
    const inicial = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    expect(anclajeInferior(inicial, 'modulo-1')).toMatchObject({ moduloId: 'modulo-1', lado: 'abajo', x: 0, y: 1200 })
  })

  it('reproduce el recorrido de Productor: 2O, fijo debajo, 2O a la derecha y fijo bajo esta', () => {
    let c = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    c = insertarModuloEnAnclaje(c, nuevo('0'), anclajeInferior(c, 'modulo-1')!)
    c = insertarModuloEnAnclaje(c, nuevo('2O'), anclajeLateral(c)!)
    expect(anclajeInferior(c, 'modulo-3')).toMatchObject({ moduloId: 'modulo-3', x: 1220, y: 1200 })
    c = insertarModuloEnAnclaje(c, nuevo('0'), anclajeInferior(c, 'modulo-3')!)
    expect(medidasCerramiento(c)).toEqual({ anchoMm: 2420, altoMm: 2420 })
  })

  it('si el inferior del elemento está ocupado, usa el libre más bajo y más a la izquierda', () => {
    let c = crearConfiguracionCerramiento(plantillaDiseno('2')!)
    c = insertarModuloEnAnclaje(c, nuevo('0'), anclajeInferior(c, 'modulo-1')!)
    expect(anclajeInferior(c, 'modulo-1')).toMatchObject({ moduloId: 'modulo-2', y: 2420 })
    expect(anclajeInferior(c)).toMatchObject({ moduloId: 'modulo-2', y: 2420 })
  })
})
