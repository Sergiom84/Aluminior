import { afterEach, describe, expect, it } from 'vitest'
import { distribuirModuloCerramiento } from './geometria-modulo-cerramiento.ts'
import { distribuirComposicion, plantillaDiseno, registrarCatalogoDiseno, type ElementoColocado } from './diseno.ts'
import { generarPlantillaCatalogo, type NodoCatalogo } from './diseno-catalogo.ts'
import { geometriaCerramiento } from './geometria-cerramiento.ts'
import { crearConfiguracionCerramiento, type ConfiguracionCerramiento, type ModuloCerramiento } from './cerramiento.ts'

const modulo = (altoMm: number, fiMm: number) => ({
  id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm, fiMm,
})

describe('representación geométrica de módulo 1OFI', () => {
  it.each([
    [1500, 300, 1200],
    [1800, 300, 1500],
    [1800, 400, 1400],
  ])('centra el travesaño en el eje físico para alto %s y FI %s', (altoMm, fiMm, ejeY) => {
    const elementos = distribuirModuloCerramiento(
      modulo(altoMm, fiMm), { x: 0, y: 0, ancho: 900, alto: altoMm }, 18,
    )
    const travesano = elementos.find((elemento) => elemento.tipo === 'separador')!

    expect(travesano.y + travesano.alto / 2).toBe(ejeY)
    expect(altoMm - (travesano.y + travesano.alto / 2)).toBe(fiMm)
  })

  it('mantiene el reparto legado cuando FI está ausente', () => {
    const rect = { x: 0, y: 0, ancho: 900, alto: 1800 }
    const elementos = distribuirModuloCerramiento({
      id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800,
    }, rect, 18)

    expect(elementos).toEqual(distribuirComposicion(
      plantillaDiseno('1OFI')!.composicion, rect, 18,
    ))
  })
})

const nodo = (id: number, tipo: number, padre: number, cambios: Partial<NodoCatalogo> = {}): NodoCatalogo => ({
  id, tipo, padre, division: 0, posicion: 0, travesano: '', invisible: false,
  hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0,
  marco: tipo === 1 ? 'NOR' : '', variantes: [], ...cambios,
})

/** 2OFI sintética: dos hojas arriba y fijo inferior con travesaño `HB` a cota 300 (TipoCota=1). */
function registrar2Ofi() {
  const generada = generarPlantillaCatalogo({
    codigo: '2OFI', descripcion: 'Sintética 2OFI', familiaCodigo: '001', anchoMm: 1250, altoMm: 2295,
    nodos: [
      nodo(0, 1, -1),
      nodo(1, 6, 0, { division: 1, travesano: 'HB', tipoCota: 1, cota: 300 }),
      nodo(2, 2, 0, { division: 1, posicion: 1 }), nodo(3, 2, 0, { division: 1, posicion: 2 }),
      nodo(4, 6, 2, { division: 2, travesano: 'VI', equidistantes: 2 }),
      nodo(5, 2, 2, { division: 2, posicion: 1 }), nodo(6, 2, 2, { division: 2, posicion: 2 }),
      nodo(7, 3, 5, { hoja: 6 }), nodo(8, 5, 7), nodo(9, 3, 6, { hoja: 5 }), nodo(10, 5, 9),
      nodo(11, 5, 3),
    ],
  })
  if (generada.estado !== 'dibujable') throw new Error(`2OFI sintética no dibujable: ${generada.motivos}`)
  registrarCatalogoDiseno([generada.plantilla])
}

const modulo2Ofi = (cotas?: ModuloCerramiento['cotas']): ModuloCerramiento => ({
  id: 'modulo-1', estructuraCodigo: '2OFI', anchoMm: 1250, altoMm: 2295, ...(cotas ? { cotas } : {}),
})
const ejeTravesanoInferior = (elementos: readonly ElementoColocado[]) => {
  const horizontales = elementos.filter(e => e.tipo === 'separador' && e.eje === 'horizontal')
  expect(horizontales).toHaveLength(1)
  return horizontales[0].y + horizontales[0].alto / 2
}

describe('fijo inferior de una plantilla de catálogo con cota FI de línea', () => {
  afterEach(() => registrarCatalogoDiseno([]))
  const rect = { x: 0, y: 0, ancho: 1250, alto: 2295 }

  it('sin FI tecleada dibuja el travesaño a la cota de plantilla (300)', () => {
    registrar2Ofi()
    expect(2295 - ejeTravesanoInferior(distribuirModuloCerramiento(modulo2Ofi(), rect, 18))).toBe(300)
  })

  it('con FI = 1000 dibuja el travesaño a 1000 desde abajo, sin tocar la plantilla', () => {
    registrar2Ofi()
    const elementos = distribuirModuloCerramiento(modulo2Ofi({ FI: 1000 }), rect, 18)
    expect(2295 - ejeTravesanoInferior(elementos)).toBe(1000)
    const fijo = elementos.find(e => e.tipo === 'hueco' && e.apertura === 'fijo')!
    expect(fijo.y + fijo.alto).toBe(2295)
    expect(plantillaDiseno('2OFI')!.composicion).toMatchObject({ cotaFija: { desde: 'fin', mm: 300 } })
  })

  it('la geometría del cerramiento (lienzo y PDF) usa la misma FI', () => {
    registrar2Ofi()
    const configuracion: ConfiguracionCerramiento = {
      ...crearConfiguracionCerramiento(plantillaDiseno('2OFI')!), version: 3, modulos: [modulo2Ofi({ FI: 1000 })], uniones: [],
    }
    const [modulo] = geometriaCerramiento(configuracion).modulos
    const escalaY = modulo.rect.alto / 2295
    const eje = ejeTravesanoInferior(modulo.elementos)
    expect((modulo.rect.y + modulo.rect.alto - eje) / escalaY).toBeCloseTo(1000, 6)
  })

  it('FS no mueve un travesaño medido desde abajo', () => {
    registrar2Ofi()
    expect(2295 - ejeTravesanoInferior(distribuirModuloCerramiento(modulo2Ofi({ FS: 1000 }), rect, 18))).toBe(300)
  })
})
