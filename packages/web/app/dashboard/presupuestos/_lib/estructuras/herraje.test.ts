/**
 * Pruebas de CARACTERIZACIÓN del herraje.
 *
 * No describen lo que el herraje debería hacer: describen lo que hacía dentro
 * de `acciones.ts` antes de extraerlo (T.69.1). Su trabajo es que la extracción
 * no cambie nada sin que se note, incluidos los detalles que nadie eligió a
 * propósito —el orden del resultado, qué pasa sin serie, qué se ignora—. Si una
 * de estas expectativas resulta equivocada, se cambia con su propia unidad de
 * trabajo y su evidencia, no de refilón durante un movimiento de archivos.
 */
import { describe, expect, it } from 'vitest'
import type { ClienteEscritura } from '../cliente-db.ts'
import { opcionesHerrajeDe, resolverOpcionesHerraje } from './herraje.ts'

interface FilaOpcion {
  conjuntoCodigo: string
  opcionCodigo: string
  descripcion: string
  porDefecto: boolean
  oculta: boolean
  categoria: string | null
  activaSoloSi?: string | null
  incompatible?: string | null
}

const opcion = (
  conjuntoCodigo: string,
  opcionCodigo: string,
  extra: Partial<FilaOpcion> = {},
): FilaOpcion => ({
  conjuntoCodigo,
  opcionCodigo,
  descripcion: `OPCIÓN ${opcionCodigo}`,
  porDefecto: false,
  oculta: false,
  categoria: null,
  ...extra,
})

/**
 * Doble de cliente que responde a las dos consultas por su orden: primero la
 * regla de `herraje_conjuntos`, después las filas de `opciones_herraje`.
 * Registra las llamadas para poder afirmar que no se consulta de más.
 */
function clienteFalso(regla: { conjuntos: string } | null, filas: FilaOpcion[] = []) {
  const llamadas = { select: 0 }
  const respuestas: unknown[][] = [regla ? [regla] : [], filas]

  const resultado = (valores: unknown[]) => {
    const promesa = Promise.resolve(valores)
    return {
      limit: () => promesa,
      then: promesa.then.bind(promesa),
      catch: promesa.catch.bind(promesa),
      finally: promesa.finally.bind(promesa),
    }
  }

  const cliente = {
    select: () => {
      const valores = respuestas[llamadas.select++] ?? []
      return { from: () => ({ where: () => resultado(valores) }) }
    },
  } as unknown as ClienteEscritura

  return { cliente, llamadas }
}

describe('opciones ofrecidas al configurar', () => {
  it('no consulta nada sin serie o sin estructura', async () => {
    const { cliente, llamadas } = clienteFalso({ conjuntos: 'C1' }, [opcion('C1', '1')])
    expect(await opcionesHerrajeDe(cliente, '', '2O')).toBeNull()
    expect(await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '')).toBeNull()
    expect(llamadas.select).toBe(0)
  })

  // Sin regla medida no se ofrece nada: no se adivina qué herraje lleva una
  // combinación que la empresa nunca ha fabricado.
  it('devuelve null cuando no hay regla medida', async () => {
    const { cliente } = clienteFalso(null)
    expect(await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')).toBeNull()
  })

  it('agrupa por conjunto en el orden de la regla', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'CB+CA' }, [
      opcion('CA', '1'), opcion('CB', '1'),
    ])
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')
    expect(grupos?.map((g) => g.conjuntoCodigo)).toEqual(['CB', 'CA'])
  })

  // Orden por código NUMÉRICO, no alfabético: '10' va después de '9'.
  it('ordena las opciones por su código como número', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '10'), opcion('C1', '2'), opcion('C1', '9'),
    ])
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')
    expect(grupos?.[0].opciones.map((o) => o.codigo)).toEqual(['2', '9', '10'])
  })

  it('conserva las ocultas para evaluar fórmulas sin mostrarlas', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1'), opcion('C1', '2', { oculta: true }),
    ])
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')
    expect(grupos?.[0].opciones.filter(o => !o.oculta).map((o) => o.codigo)).toEqual(['1'])
    expect(grupos?.[0].opciones.find(o => o.codigo === '2')?.oculta).toBe(true)
  })

  it('omite el grupo que se queda sin opciones visibles', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1+C2' }, [
      opcion('C1', '1'), opcion('C2', '1', { oculta: true }),
    ])
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')
    expect(grupos?.map((g) => g.conjuntoCodigo)).toEqual(['C1'])
  })

  // Null y no lista vacía: la interfaz no debe pintar una sección vacía.
  it('devuelve null si ningún grupo tiene opciones visibles', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1', { oculta: true }),
    ])
    expect(await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')).toBeNull()
  })

  it('conserva descripción, marca por defecto y categoría', async () => {
    // La categoría se añadió para la lista `Categoría` de la pestaña Opc.Herraje
    // (RECON-CERRAMIENTOS.md §5); no cambia qué se ofrece ni en qué orden.
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1', { descripcion: 'MANILLA ESTÁNDAR', porDefecto: true, categoria: 'MAN' }),
    ])
    const grupos = await opcionesHerrajeDe(cliente, 'ELEGANTPVC', '2O')
    expect(grupos?.[0].opciones[0])
      .toMatchObject({ codigo: '1', descripcion: 'MANILLA ESTÁNDAR', porDefecto: true, categoria: 'MAN' })
  })
})

describe('opciones persistidas al añadir la línea', () => {
  const base = { serieCodigo: 'ELEGANTPVC', estructuraCodigo: '2O' }

  it('devuelve lista vacía cuando no hay regla medida', async () => {
    const { cliente } = clienteFalso(null)
    expect(await resolverOpcionesHerraje(cliente, { ...base, elegidas: ['C1|1'] })).toEqual([])
  })

  // Sin serie se consulta con cadena vacía y no se encuentra regla: lista
  // vacía, no un fallo. Es el comportamiento que tenía el `?? ''` original.
  it('sin serie no falla: no encuentra regla y no persiste nada', async () => {
    const { cliente } = clienteFalso(null)
    expect(await resolverOpcionesHerraje(cliente, {
      serieCodigo: null, estructuraCodigo: '2O', elegidas: [],
    })).toEqual([])
  })

  /**
   * El estado real de hoy: el formulario no emite `opcionHerraje`, así que
   * `elegidas` llega vacío y lo único que se persiste son los defaults ocultos.
   */
  it('sin nada marcado, persiste sólo los defaults ocultos', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1'),
      opcion('C1', '2', { oculta: true, porDefecto: true, descripcion: 'CIERRE INTERNO' }),
      opcion('C1', '3', { oculta: true, porDefecto: false }),
    ])
    expect(await resolverOpcionesHerraje(cliente, { ...base, elegidas: [] })).toEqual([
      { categoria: 'C1', opcionCodigo: '2', descripcion: 'CIERRE INTERNO' },
    ])
  })

  it('una opción visible por defecto NO se persiste sola', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1', { porDefecto: true }),
    ])
    // Sólo el default OCULTO entra solo. El visible lo tiene que marcar el
    // formulario, aunque venga premarcado en la interfaz.
    expect(await resolverOpcionesHerraje(cliente, { ...base, elegidas: [] })).toEqual([])
  })

  it('acepta lo marcado que exista en el catálogo', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1'), opcion('C1', '2'),
    ])
    const elegidas = await resolverOpcionesHerraje(cliente, { ...base, elegidas: ['C1|2'] })
    expect(elegidas.map((o) => o.opcionCodigo)).toEqual(['2'])
  })

  it('ignora una clave que no está en el catálogo', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [opcion('C1', '1')])
    expect(await resolverOpcionesHerraje(cliente, {
      ...base, elegidas: ['C1|999', 'INVENTADO', ''],
    })).toEqual([])
  })

  // Una oculta no se puede elegir aunque el formulario la mande: se ignora, y
  // sólo entra si además es default.
  it('ignora una oculta marcada a mano', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
      opcion('C1', '1', { oculta: true }),
    ])
    expect(await resolverOpcionesHerraje(cliente, { ...base, elegidas: ['C1|1'] })).toEqual([])
  })

  it('no duplica una opción marcada dos veces', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1' }, [opcion('C1', '1')])
    const elegidas = await resolverOpcionesHerraje(cliente, {
      ...base, elegidas: ['C1|1', 'C1|1'],
    })
    expect(elegidas).toHaveLength(1)
  })

  /**
   * Orden del resultado: primero lo marcado, en el orden en que llegó del
   * formulario, y después los defaults ocultos en orden de catálogo. No es una
   * decisión deliberada, es lo que produce el `Map` de inserción; se fija aquí
   * porque cambia el orden de las filas escritas.
   */
  it('conserva el orden: marcadas primero, defaults ocultos después', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'C1+C2' }, [
      opcion('C1', '1'),
      opcion('C1', '9', { oculta: true, porDefecto: true }),
      opcion('C2', '5'),
    ])
    const elegidas = await resolverOpcionesHerraje(cliente, {
      ...base, elegidas: ['C2|5', 'C1|1'],
    })
    expect(elegidas.map((o) => `${o.categoria}|${o.opcionCodigo}`))
      .toEqual(['C2|5', 'C1|1', 'C1|9'])
  })

  it('mapea conjunto a categoría y conserva la descripción del catálogo', async () => {
    const { cliente } = clienteFalso({ conjuntos: 'CIERRE' }, [
      opcion('CIERRE', '7', { descripcion: 'CREMONA OSCILOBATIENTE' }),
    ])
    expect(await resolverOpcionesHerraje(cliente, { ...base, elegidas: ['CIERRE|7'] }))
      .toEqual([{
        categoria: 'CIERRE', opcionCodigo: '7', descripcion: 'CREMONA OSCILOBATIENTE',
      }])
  })
})

it('rechaza un formulario que fuerza cremona y cerradura simultáneas', async () => {
  const { cliente } = clienteFalso({ conjuntos: 'GM252' }, [
    opcion('GM252', '1', { incompatible: 'o4' }), opcion('GM252', '4', { incompatible: 'o1' }),
  ])
  await expect(resolverOpcionesHerraje(cliente, { serieCodigo: 'GMA65OPT', estructuraCodigo: '2O', elegidas: ['GM252|1', 'GM252|4'] })).rejects.toThrow('incompatible')
})

it('una opción oculta por defecto participa en Activa sólo Si', async () => {
  const { cliente } = clienteFalso({ conjuntos: 'C1' }, [
    opcion('C1', '8', { activaSoloSi: 'o9' }), opcion('C1', '9', { oculta: true, porDefecto: true }),
  ])
  expect(await resolverOpcionesHerraje(cliente, { serieCodigo: 'S', estructuraCodigo: 'E', elegidas: ['C1|8'] })).toHaveLength(2)
})
