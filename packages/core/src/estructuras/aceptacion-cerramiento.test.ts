import { describe, expect, it } from 'vitest'
import { plantillaDiseno } from './diseno.ts'
import { crearConfiguracionCerramiento, moduloDesdePlantilla } from './cerramiento.ts'
import { insertarModuloEnAnclaje } from './composicion-cerramiento.ts'
import {
  faltasParaAceptar, mensajesParaAceptar, LITERAL_UNION, type GeneralesAceptacion,
} from './aceptacion-cerramiento.ts'

const completos: GeneralesAceptacion = {
  serieCodigo: 'QA-SERIE', vidrioCodigo: 'QA-VIDRIO', acabadoCodigo: 'QA-ACABADO',
}
const nulos: GeneralesAceptacion = { serieCodigo: null, vidrioCodigo: null, acabadoCodigo: null }

function elemento(codigo = '2O') {
  return crearConfiguracionCerramiento(plantillaDiseno(codigo)!)
}

function conUnion(codigo = '') {
  const base = elemento('2O')
  const compuesto = insertarModuloEnAnclaje(base, moduloDesdePlantilla(plantillaDiseno('0')!),
    { moduloId: 'modulo-1', lado: 'derecha' })
  return {
    ...compuesto,
    uniones: compuesto.uniones.map((union) => ({ ...union, codigo })),
  }
}

const identificacion = (configuracion: ReturnType<typeof elemento>, indice = 0) => {
  const modulo = configuracion.modulos[indice]
  return `${modulo.estructuraCodigo} de ${modulo.anchoMm} x ${modulo.altoMm}`
}

describe('faltas para aceptar un cerramiento', () => {
  it('un elemento completo, sin uniones, no tiene faltas', () => {
    expect(faltasParaAceptar(elemento(), completos)).toEqual([])
    expect(mensajesParaAceptar([])).toEqual([])
  })

  it('generales nulos producen un mensaje con la identificación y las tres faltas', () => {
    const configuracion = elemento()
    const faltas = faltasParaAceptar(configuracion, nulos)
    const mensajes = mensajesParaAceptar(faltas)
    expect(mensajes).toEqual([
      `Datos incompletos para el Elemento ${identificacion(configuracion)}: falta serie, vidrio y acabado`,
    ])
  })

  it('el vidrio propio cubre a ese módulo y no al que hereda un general nulo', () => {
    const base = conUnion('U')
    const configuracion = {
      ...base,
      modulos: base.modulos.map((modulo, indice) => indice === 0
        ? { ...modulo, materiales: { vidrioCodigo: 'QA-VIDRIO-PROPIO' } }
        : modulo),
    }
    const faltas = faltasParaAceptar(configuracion, { ...completos, vidrioCodigo: null })
    expect(faltas.map((falta) => falta.tipo === 'elemento' ? falta.moduloId : falta.tipo))
      .toEqual([configuracion.modulos[1].id])
    expect(mensajesParaAceptar(faltas)).toEqual([
      `Datos incompletos para el Elemento ${identificacion(configuracion, 1)}: falta vidrio`,
    ])
  })

  it('un código en blanco cuenta como ausente y no pisa un general presente', () => {
    const configuracion = elemento()
    expect(mensajesParaAceptar(faltasParaAceptar(configuracion, {
      serieCodigo: '  ', vidrioCodigo: '', acabadoCodigo: ' \t ',
    }))).toEqual([
      `Datos incompletos para el Elemento ${identificacion(configuracion)}: falta serie, vidrio y acabado`,
    ])
    const enBlanco = {
      ...configuracion,
      modulos: [{ ...configuracion.modulos[0], materiales: { serieCodigo: '  ' } }],
    }
    expect(faltasParaAceptar(enBlanco, completos)).toEqual([])
  })

  it('la unión vacía avisa una vez; U no es falta', () => {
    const vacia = conUnion('  ')
    expect(mensajesParaAceptar(faltasParaAceptar(vacia, completos))).toEqual([
      `${LITERAL_UNION} (1 sin configurar)`,
    ])
    expect(faltasParaAceptar(conUnion('U'), completos)).toEqual([])
  })

  it('uniones configuradas sin acabado faltan en el elemento y en la unión', () => {
    const configuracion = conUnion('U')
    const faltas = faltasParaAceptar(configuracion, { ...completos, acabadoCodigo: null })
    expect(faltas.map((falta) => falta.tipo)).toEqual(['elemento', 'elemento', 'acabado-union'])
    expect(mensajesParaAceptar(faltas)).toEqual([
      `Datos incompletos para el Elemento ${identificacion(configuracion, 0)}: falta acabado`,
      `Datos incompletos para el Elemento ${identificacion(configuracion, 1)}: falta acabado`,
      LITERAL_UNION,
    ])
  })

  it('varias uniones sin configurar producen un solo aviso, con el recuento', () => {
    const base = conUnion('')
    const tres = insertarModuloEnAnclaje(base, moduloDesdePlantilla(plantillaDiseno('0')!),
      { moduloId: 'modulo-2', lado: 'abajo' })
    const mensajes = mensajesParaAceptar(faltasParaAceptar(tres, completos))
    expect(mensajes).toEqual([`${LITERAL_UNION} (2 sin configurar)`])
  })
})
