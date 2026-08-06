import { describe, expect, it } from 'vitest'
import { MAPA_VACIO, normalizarMapa, type MapaSustitucion } from './mapa-sustitucion.ts'
import { seleccionDeLineas, TODAS_LAS_LINEAS } from './seleccion-lineas.ts'
import {
  AVISO_DIBUJO_DERIVADO, ERROR_GENERAR_NUEVO, MOTIVO_DESCRIPCION_MANUAL,
  MOTIVO_DETALLE_DESFASADO, MOTIVO_PRECIO_INVALIDADO, OPCIONES_COPIA_IDENTICA,
  planificarCopia, type LineaOrigen, type OpcionesCopia,
} from './plan-copia.ts'

const sinCodigos = { serie: null, vidrio: null, acabadoAccesorios: null, acabadoMadera: null }

const lineas: LineaOrigen[] = [
  {
    id: 'l1', orden: 1, tipo: 'CERRAMIENTO', descripcionManual: false,
    codigos: { ...sinCodigos, serie: '3300', vidrio: '484' },
  },
  {
    id: 'l2', orden: 2, tipo: 'ESTRUCTURA', descripcionManual: false,
    codigos: { serie: 'ELEGANTPVC', vidrio: '484', acabadoAccesorios: 'BLANCO', acabadoMadera: 'ROBLE' },
  },
  { id: 'l3', orden: 3, tipo: 'ARTICULO', descripcionManual: true, codigos: sinCodigos },
]

function mapa(...pares: { ambito: 'SERIE' | 'VIDRIO' | 'ACABADO_ACCESORIOS' | 'ACABADO_MADERA'; origen: string; destino: string }[]): MapaSustitucion {
  const resultado = normalizarMapa(pares)
  if (!resultado.ok) throw new Error(resultado.errores.join('; '))
  return resultado.mapa
}

const opciones = (parcial: Partial<OpcionesCopia> = {}): OpcionesCopia => ({
  ...OPCIONES_COPIA_IDENTICA, mapa: MAPA_VACIO, ...parcial,
})

function planDe(parcial: Partial<OpcionesCopia> = {}, origen: LineaOrigen[] = lineas) {
  const resultado = planificarCopia(origen, opciones(parcial))
  if (!resultado.ok) throw new Error(resultado.errores.join('; '))
  return resultado.plan
}

describe('plan de copia', () => {
  it('con el mapa vacío la copia es idéntica línea a línea', () => {
    const plan = planDe()
    expect(plan.sustitucionesAplicadas).toBe(0)
    expect(plan.lineas).toHaveLength(3)
    for (const [indice, cambio] of plan.lineas.entries()) {
      expect(cambio.codigos).toEqual(lineas[indice].codigos)
      expect(cambio.sustituciones).toEqual([])
      expect(cambio.conservarPrecio).toBe(true)
      expect(cambio.regenerarDescripcion).toBe(false)
      expect(cambio.regenerarDibujo).toBe(false)
      expect(cambio.motivos).toEqual([])
    }
  })

  it('sustituye lo que coincide y conserva lo demás', () => {
    const plan = planDe({ mapa: mapa({ ambito: 'SERIE', origen: '3300', destino: '3900RPT' }) })
    expect(plan.lineas[0].codigos).toEqual({ ...sinCodigos, serie: '3900RPT', vidrio: '484' })
    expect(plan.lineas[0].sustituciones).toEqual([
      { ambito: 'SERIE', origen: '3300', destino: '3900RPT' },
    ])
    // La línea 2 tiene otra serie: no la toca nadie.
    expect(plan.lineas[1].codigos).toEqual(lineas[1].codigos)
    expect(plan.sustitucionesAplicadas).toBe(1)
  })

  it('una línea que no coincide con ningún origen del mapa sale intacta', () => {
    const plan = planDe({ mapa: mapa({ ambito: 'SERIE', origen: 'NO-EXISTE', destino: 'OTRA' }) })
    expect(plan.sustitucionesAplicadas).toBe(0)
    for (const [indice, cambio] of plan.lineas.entries()) {
      expect(cambio.codigos).toEqual(lineas[indice].codigos)
      expect(cambio.conservarPrecio).toBe(true)
    }
  })

  it('aplica los cuatro ámbitos sobre la misma línea', () => {
    const plan = planDe({
      mapa: mapa(
        { ambito: 'SERIE', origen: 'ELEGANTPVC', destino: 'ELEGANT70' },
        { ambito: 'VIDRIO', origen: '484', destino: '4164' },
        { ambito: 'ACABADO_ACCESORIOS', origen: 'BLANCO', destino: 'NEGRO' },
        { ambito: 'ACABADO_MADERA', origen: 'ROBLE', destino: 'NOGAL' },
      ),
    })
    expect(plan.lineas[1].codigos).toEqual({
      serie: 'ELEGANT70', vidrio: '4164', acabadoAccesorios: 'NEGRO', acabadoMadera: 'NOGAL',
    })
    expect(plan.lineas[1].sustituciones).toHaveLength(4)
  })

  it('sólo modifica las líneas seleccionadas', () => {
    const plan = planDe({
      mapa: mapa({ ambito: 'VIDRIO', origen: '484', destino: '4164' }),
      seleccion: seleccionDeLineas(['l2']),
    })
    expect(plan.lineas[0].seleccionada).toBe(false)
    expect(plan.lineas[0].codigos.vidrio).toBe('484')
    expect(plan.lineas[1].seleccionada).toBe(true)
    expect(plan.lineas[1].codigos.vidrio).toBe('4164')
    expect(plan.sustitucionesAplicadas).toBe(1)
  })

  it('con la selección vacía se copian todas las líneas y no se cambia ninguna', () => {
    const plan = planDe({
      mapa: mapa({ ambito: 'VIDRIO', origen: '484', destino: '4164' }),
      seleccion: seleccionDeLineas([]),
    })
    expect(plan.lineas).toHaveLength(3)
    expect(plan.sustitucionesAplicadas).toBe(0)
    expect(plan.lineas.every((cambio) => !cambio.seleccionada)).toBe(true)
    expect(plan.lineas.map((cambio) => cambio.codigos)).toEqual(lineas.map((linea) => linea.codigos))
  })

  it('avisa de las líneas seleccionadas que no son del documento', () => {
    const plan = planDe({ seleccion: seleccionDeLineas(['l1', 'de-otro-documento']) })
    expect(plan.avisos).toContain('1 líneas seleccionadas no pertenecen al documento origen')
  })

  it('regenerar descripción y regenerar dibujo son independientes', () => {
    const soloDescripcion = planDe({ regenerarDescripcion: true, seleccion: TODAS_LAS_LINEAS })
    expect(soloDescripcion.lineas[0].regenerarDescripcion).toBe(true)
    expect(soloDescripcion.lineas[0].regenerarDibujo).toBe(false)
    expect(soloDescripcion.avisos).not.toContain(AVISO_DIBUJO_DERIVADO)

    const soloDibujo = planDe({ regenerarDibujo: true })
    expect(soloDibujo.lineas[0].regenerarDescripcion).toBe(false)
    expect(soloDibujo.lineas[0].regenerarDibujo).toBe(true)
    expect(soloDibujo.avisos).toContain(AVISO_DIBUJO_DERIVADO)

    const ambas = planDe({ regenerarDescripcion: true, regenerarDibujo: true })
    expect(ambas.lineas[0].regenerarDescripcion).toBe(true)
    expect(ambas.lineas[0].regenerarDibujo).toBe(true)
  })

  it('no pisa una descripción escrita a mano y lo dice', () => {
    const plan = planDe({ regenerarDescripcion: true })
    expect(plan.lineas[2].regenerarDescripcion).toBe(false)
    expect(plan.lineas[2].motivos).toContain(MOTIVO_DESCRIPCION_MANUAL)
  })

  it('una línea sustituida pierde el precio del original', () => {
    const plan = planDe({ mapa: mapa({ ambito: 'SERIE', origen: '3300', destino: '3900RPT' }) })
    expect(plan.lineas[0].conservarPrecio).toBe(false)
    expect(plan.lineas[0].motivos).toContain(MOTIVO_PRECIO_INVALIDADO)
    expect(plan.lineas[0].motivos).toContain(MOTIVO_DETALLE_DESFASADO)
    // La que no cambia mantiene su valoración.
    expect(plan.lineas[1].conservarPrecio).toBe(true)
  })

  it('rechaza «generar nuevo detalle» en vez de fingir que lo hizo', () => {
    const resultado = planificarCopia(lineas, opciones({ detalleEstructuras: 'GENERAR_NUEVO' }))
    expect(resultado).toEqual({ ok: false, errores: [ERROR_GENERAR_NUEVO] })
  })

  it('un documento sin líneas produce un plan vacío, no un fallo', () => {
    const plan = planDe({}, [])
    expect(plan.lineas).toEqual([])
    expect(plan.sustitucionesAplicadas).toBe(0)
  })
})
