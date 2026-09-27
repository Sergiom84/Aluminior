import { describe, expect, it } from 'vitest'
import { crearConfiguracionCerramiento, esConfiguracionCerramiento } from './cerramiento.ts'
import { plantillaDiseno, PLANTILLAS_DISENO } from './diseno.ts'
import { generarPlantillaCatalogo, type EstructuraCatalogo, type NodoCatalogo } from './diseno-catalogo.ts'
import { itemsEscaparate } from './escaparate.ts'
import { geometriaAperturaVisual } from './geometria-apertura.ts'
import { geometriaCerramiento } from './geometria-cerramiento.ts'

const nodo = (id: number, tipo: number, padre: number, cambios: Partial<NodoCatalogo> = {}): NodoCatalogo => ({
  id, tipo, padre, division: 0, posicion: 0, travesano: '', invisible: false,
  hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0,
  marco: tipo === 1 ? 'NOR' : '', variantes: [], ...cambios,
})
const entrada = (): EstructuraCatalogo => ({ codigo: 'SINTETICA-PAR', descripcion: 'Par de prueba',
  familiaCodigo: '002', anchoMm: 1360, altoMm: 2090, nodos: [
    nodo(20, 1, -1),
    nodo(30, 6, 20, { division: 7, travesano: 'VI', invisible: true, equidistantes: 2 }),
    nodo(40, 2, 20, { division: 7, posicion: 1 }), nodo(50, 2, 20, { division: 7, posicion: 2 }),
    nodo(60, 3, 40, { hoja: 16, numeroHoja: 1 }), nodo(70, 3, 50, { hoja: 16, numeroHoja: 2 }),
    nodo(80, 5, 60), nodo(90, 5, 70),
  ],
})

describe('puerta corredera de dos hojas de catálogo', () => {
  it('traduce el par 16 por árbol, familia y posición sin interpretar el código', () => {
    const e = entrada()
    e.nodos = [...e.nodos].reverse()
    expect(generarPlantillaCatalogo(e)).toMatchObject({ estado: 'dibujable', familiaCodigo: '002', plantilla: {
      codigo: 'SINTETICA-PAR', familia: 'PUERTAS CORREDERAS', anchoMm: 1360, altoMm: 2090,
      composicion: { eje: 'vertical', separador: 'division-invisible', hijos: [
        { proporcion: 680, nodo: { apertura: 'corredera-derecha', manilla: false } },
        { proporcion: 680, nodo: { apertura: 'corredera-izquierda', manilla: false } },
      ] },
    } })
  })

  it.each(['familia', 'mezcla', 'ventana', 'mano', 'duplicado', 'posicion', 'cota',
    'travesano', 'visible', 'marco', 'variante', 'superficie', 'huerfano'] as const)(
    'conserva el rechazo de una puerta no acreditada: %s', cambio => {
      const e = entrada()
      if (cambio === 'familia') e.familiaCodigo = '001'
      if (cambio === 'mezcla') e.nodos[4].hoja = 10
      if (cambio === 'ventana') e.nodos.filter(n => n.tipo === 3).forEach(n => { n.hoja = 10 })
      if (cambio === 'mano') e.nodos[5].numeroHoja = 1
      if (cambio === 'duplicado') e.nodos[6].id = e.nodos[7].id
      if (cambio === 'posicion') e.nodos[3].posicion = 3
      if (cambio === 'cota') Object.assign(e.nodos[1], { tipoCota: 1, cota: 400 })
      if (cambio === 'travesano') e.nodos[1].travesano = 'HA'
      if (cambio === 'visible') e.nodos[1].invisible = false
      if (cambio === 'marco') e.nodos[0].marco = '3C'
      if (cambio === 'variante') e.nodos[0].variantes = ['bPerInf']
      if (cambio === 'superficie') e.nodos[6].tipo = 4
      if (cambio === 'huerfano') e.nodos[7].padre = 999
      expect(generarPlantillaCatalogo(e).estado).toBe('pendiente')
    })

  it('mantiene pendiente una puerta con fijo superior aunque su par interior sea correcto', () => {
    const e = entrada()
    e.nodos[0].tipo = 2
    e.nodos[0].padre = 3
    e.nodos = [nodo(0, 1, -1),
      nodo(1, 6, 0, { division: 1, travesano: 'HA', tipoCota: 1, cota: 300 }),
      nodo(2, 2, 0, { division: 1, posicion: 1 }), nodo(3, 2, 0, { division: 1, posicion: 2 }),
      nodo(4, 5, 2), ...e.nodos]
    expect(generarPlantillaCatalogo(e).estado).toBe('pendiente')
  })

  it('habilita solo C2P en la familia002 sin cambiar el modelo inicial ni el par C2', () => {
    expect(PLANTILLAS_DISENO[0].codigo).toBe('0')
    expect(itemsEscaparate('puertas-correderas').map(p => p.codigo)).toEqual(['C2P'])
    expect(plantillaDiseno('C2PFS')).toBeNull()
    const p = plantillaDiseno('C2P')!
    const ventana = plantillaDiseno('C2')!
    expect(p).toMatchObject({ descripcion: 'PUERTA CORREDERA DE DOS HOJAS', familiaCodigo: '002',
      familia: 'PUERTAS CORREDERAS', anchoMm: 1500, altoMm: 2000 })
    expect(ventana).toMatchObject({ familiaCodigo: '001', anchoMm: 1200, altoMm: 1200 })
    expect(p.composicion).toEqual(ventana.composicion)
    expect(p.composicion).not.toBe(ventana.composicion)
  })

  it.each([[1500, 2000], [1670, 2310], [900, 1800]])(
    'conserva el par y su dirección tras cambiar a %s×%s y reabrir la configuración', (anchoMm, altoMm) => {
      const plantilla = plantillaDiseno('C2P')!
      const configuracion = crearConfiguracionCerramiento(plantilla)
      Object.assign(configuracion.modulos[0], { anchoMm, altoMm })
      const copia: unknown = JSON.parse(JSON.stringify(configuracion))
      expect(esConfiguracionCerramiento(copia)).toBe(true)
      if (!esConfiguracionCerramiento(copia)) throw new Error('Configuración sintética inválida')
      expect(copia.modulos[0].estructuraCodigo).toBe('C2P')
      const geometria = geometriaCerramiento(copia)
      expect([geometria.anchoMm, geometria.altoContractualMm]).toEqual([anchoMm, altoMm])
      const elementos = geometria.modulos[0].elementos
      expect(elementos.map(e => [e.tipo, e.ancho, e.alto])).toEqual([
        ['hueco', (anchoMm - 2) / 2, altoMm], ['separador', 2, altoMm],
        ['hueco', (anchoMm - 2) / 2, altoMm],
      ])
      const hojas = elementos.filter(e => e.tipo === 'hueco')
      expect(hojas.map(e => [e.apertura, e.manilla]))
        .toEqual([['corredera-derecha', false], ['corredera-izquierda', false]])
      for (const hoja of hojas) {
        const apertura = geometriaAperturaVisual(hoja.apertura, hoja)!
        expect(apertura.ladoBisagras).toBeNull()
        expect(apertura.trazos).toHaveLength(1)
        const [inicio, fin] = apertura.trazos[0]
        expect(fin.y).toBe(inicio.y)
        expect(Math.sign(fin.x - inicio.x)).toBe(hoja.apertura === 'corredera-derecha' ? 1 : -1)
      }
    })
})
