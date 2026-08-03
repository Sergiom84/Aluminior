/**
 * El caso de uso completo, con un cliente de escritura de mentira.
 *
 * Aquí se comprueba la frontera que la server action ya no conoce: cuándo NO se
 * toca el catálogo, cuándo se aborta por migración ausente, y qué se devuelve
 * para que la acción lo aplique sin decidir nada. El resultado es una unión
 * discriminada precisamente para que un olvido en la acción no compile.
 */
import { describe, expect, it } from 'vitest'
import type { ClienteEscritura } from '../cliente-db.ts'
import { prepararManoObra } from './preparar-mano-obra.ts'

interface FilaCatalogo { articuloCodigo: string; acabadoCodigo: string; coste: string }

interface OpcionesCliente {
  /** false = el entorno no tiene la migración 0018. */
  conTabla?: boolean
  /**
   * Códigos que la consulta real pediría, según los conceptos con horas. El
   * doble filtra por ellos como haría el `inArray`: devolver filas de artículos
   * no pedidos sería un doble más permisivo que PostgreSQL, y escondería un
   * fallo en vez de provocarlo.
   */
  codigos?: string[]
  precios?: { articuloCodigo: string; precio: string }[]
  costes?: FilaCatalogo[]
}

/**
 * Cliente que responde a las tres consultas de `leerCatalogoManoObra` por el
 * ORDEN en que las pide, y registra cuántas veces se le llamó. Basta para
 * comprobar que sin horas no se consulta nada.
 */
function clienteFalso(opciones: OpcionesCliente = {}) {
  const {
    conTabla = true, codigos = ['MO', 'MOCOL'], precios = [], costes = [],
  } = opciones
  const llamadas = { execute: 0, select: 0 }
  let consulta = 0
  const pedido = (codigo: string) => codigos.includes(codigo)

  const respuestas = () => [
    [
      { codigo: 'MO', descripcion: 'MANO DE OBRA DE TALLER (MINUTOS)' },
      { codigo: 'MOCOL', descripcion: 'MANO DE OBRA DE COLOCACIÓN (MINUTOS)' },
    ].filter((a) => pedido(a.codigo)),
    precios.filter((p) => pedido(p.articuloCodigo)),
    costes.filter((c) => pedido(c.articuloCodigo)),
  ]

  const encadenable = () => {
    const propia = respuestas()[consulta++] ?? []
    const cadena = {
      from: () => cadena,
      where: () => Promise.resolve(propia),
    }
    return cadena
  }

  const cliente = {
    execute: async () => {
      llamadas.execute++
      return [{ tabla: conTabla ? 'lineas_mano_obra' : null }]
    },
    select: () => {
      llamadas.select++
      return encadenable()
    },
  } as unknown as ClienteEscritura

  return { cliente, llamadas }
}

const HORAS_CERO = { fabricacion: '0', colocacion: '0.00' }

describe('sin horas tecleadas', () => {
  it('no consulta nada y devuelve SIN_HORAS', async () => {
    const { cliente, llamadas } = clienteFalso()
    const resultado = await prepararManoObra(cliente, { horas: HORAS_CERO, tarifa: 1 })

    expect(resultado).toEqual({ estado: 'SIN_HORAS' })
    // Ni la comprobación de migración: una línea sin horas no toca esa tabla, y
    // exigirla bloquearía un despliegue que hoy funciona.
    expect(llamadas).toEqual({ execute: 0, select: 0 })
  })
})

describe('entorno sin la migración 0018', () => {
  it('aborta ANTES de leer el catálogo', async () => {
    const { cliente, llamadas } = clienteFalso({ conTabla: false })
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '1.00', colocacion: '0' }, tarifa: 1,
    })

    expect(resultado.estado).toBe('MIGRACION_PENDIENTE')
    if (resultado.estado !== 'MIGRACION_PENDIENTE') return
    expect(resultado.mensaje).toContain('migración')
    expect(llamadas.execute).toBe(1)
    // Comprobar antes de insertar nada es lo que evita la línea huérfana.
    expect(llamadas.select).toBe(0)
  })
})

describe('preparación completa', () => {
  const catalogoSano = {
    precios: [
      { articuloCodigo: 'MO', precio: '0.5000' },
      { articuloCodigo: 'MOCOL', precio: '0.5000' },
    ],
    costes: [
      { articuloCodigo: 'MO', acabadoCodigo: 'UNI', coste: '0.5000' },
      { articuloCodigo: 'MOCOL', acabadoCodigo: 'UNI', coste: '0.5000' },
    ],
  }

  it('devuelve una fila por concepto con horas, valorable y sin notas', async () => {
    const { cliente } = clienteFalso(catalogoSano)
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '2.37', colocacion: '1.50' }, tarifa: 1,
    })

    expect(resultado.estado).toBe('PREPARADA')
    if (resultado.estado !== 'PREPARADA') return
    expect(resultado.filas.map((f) => f.concepto))
      .toEqual(['FABRICACION_ADICIONAL', 'COLOCACION'])
    expect(resultado.filas[0]).toMatchObject({
      articuloCodigo: 'MO', horas: '2.37', minutos: '142.20', importe: '71.10', tarifa: 1,
    })
    expect(resultado.valorable).toBe(true)
    expect(resultado.notas).toEqual([])
  })

  it('una sola fila cuando sólo se teclea un concepto', async () => {
    const { cliente } = clienteFalso({ ...catalogoSano, codigos: ['MOCOL'] })
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '0', colocacion: '1.50' }, tarifa: 1,
    })

    expect(resultado.estado).toBe('PREPARADA')
    if (resultado.estado !== 'PREPARADA') return
    expect(resultado.filas).toHaveLength(1)
    expect(resultado.filas[0].articuloCodigo).toBe('MOCOL')
  })

  it('propaga la tarifa del documento al snapshot', async () => {
    const { cliente } = clienteFalso({ ...catalogoSano, codigos: ['MOCOL'] })
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '0', colocacion: '1.00' }, tarifa: 4,
    })
    if (resultado.estado !== 'PREPARADA') throw new Error('esperaba PREPARADA')
    expect(resultado.filas[0].tarifa).toBe(4)
  })

  // La regla del dinero: sin precio no hay importe, y la línea no se valora.
  it('no es valorable cuando falta el PVP, y lo dice', async () => {
    const { cliente } = clienteFalso({ ...catalogoSano, codigos: ['MOCOL'], precios: [] })
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '0', colocacion: '1.50' }, tarifa: 1,
    })

    expect(resultado.estado).toBe('PREPARADA')
    if (resultado.estado !== 'PREPARADA') return
    expect(resultado.valorable).toBe(false)
    expect(resultado.notas).toEqual(['mano de obra de colocación sin precio en la tarifa'])
    expect(resultado.filas[0]).toMatchObject({
      importe: null, valoracionCompleta: false, motivoCodigo: 'SIN_PVP',
    })
  })

  // Un problema de COSTE no cambia lo que se cobra, pero no se calla.
  it('sigue siendo valorable con el coste ambiguo, y lo advierte', async () => {
    const { cliente } = clienteFalso({
      ...catalogoSano,
      codigos: ['MOCOL'],
      costes: [
        { articuloCodigo: 'MOCOL', acabadoCodigo: 'L', coste: '0.5000' },
        { articuloCodigo: 'MOCOL', acabadoCodigo: 'ANOD', coste: '0.9000' },
      ],
    })
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '0', colocacion: '1.50' }, tarifa: 1,
    })

    expect(resultado.estado).toBe('PREPARADA')
    if (resultado.estado !== 'PREPARADA') return
    expect(resultado.valorable).toBe(true)
    expect(resultado.filas[0]).toMatchObject({
      importe: '45.00', costeTotal: null, motivoCosteCodigo: 'COSTE_AMBIGUO',
    })
    expect(resultado.notas).toEqual([
      'mano de obra de colocación con varios costes distintos y ninguno del acabado aplicado',
    ])
  })

  it('acumula motivos y advertencias de los dos conceptos', async () => {
    const { cliente } = clienteFalso({
      precios: [{ articuloCodigo: 'MOCOL', precio: '0.5000' }],
      costes: [{ articuloCodigo: 'MO', acabadoCodigo: 'UNI', coste: '0.5000' }],
    })
    const resultado = await prepararManoObra(cliente, {
      horas: { fabricacion: '1.00', colocacion: '1.00' }, tarifa: 1,
    })

    expect(resultado.estado).toBe('PREPARADA')
    if (resultado.estado !== 'PREPARADA') return
    expect(resultado.valorable).toBe(false)
    // Primero lo que tumba la línea, después lo que sólo se advierte.
    expect(resultado.notas).toEqual([
      'mano de obra de fabricación adicional sin precio en la tarifa',
      'mano de obra de colocación sin coste en el catálogo',
    ])
  })
})
