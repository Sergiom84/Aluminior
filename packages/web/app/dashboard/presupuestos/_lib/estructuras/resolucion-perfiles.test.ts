/**
 * Pruebas de CARACTERIZACIÓN de la resolución genérico -> perfil real.
 *
 * No describen lo que la resolución debería hacer: describen lo que hacía
 * dentro de `acciones.ts` antes de extraerla (T.69.4), incluidas las decisiones
 * que nadie tomó a propósito —qué pasa con un componente sin `componenteDisenyo`,
 * qué se anota y qué no, cómo distingue mayúsculas la heurística de `funcion`—.
 * Su trabajo es que la extracción no mueva ninguna clasificación sin que se
 * note. Si una de estas expectativas resulta equivocada, se cambia con su propia
 * unidad de trabajo y su evidencia, no de refilón al mover archivos.
 *
 * Lo que se clasifica aquí decide si la línea se valora o no: una ranura en
 * `sinResolver` deja el importe en null. Por eso importa que el reparto entre
 * perfil y asociado esté fijado, y que el caso desconocido caiga siempre del
 * lado ruidoso.
 */
import { describe, expect, it } from 'vitest'
import type { ClienteEscritura } from '../cliente-db.ts'
import { resolverPerfiles } from './resolucion-perfiles.ts'

interface FilaDelegacion { conjuntoCodigo: string; delegadoCodigo: string }
interface FilaResolucion { conjuntoCodigo: string; componente: string; articuloCodigo: string }

interface Componente {
  articuloCodigo: string
  funcion: string | null
  componenteDisenyo: string | null
}

const componente = (
  articuloCodigo: string,
  componenteDisenyo: string | null,
  extra: Partial<Componente> = {},
): Componente => ({ articuloCodigo, funcion: null, componenteDisenyo, ...extra })

const delega = (conjuntoCodigo: string, delegadoCodigo: string): FilaDelegacion =>
  ({ conjuntoCodigo, delegadoCodigo })

const resuelve = (
  conjuntoCodigo: string, componente: string, articuloCodigo: string,
): FilaResolucion => ({ conjuntoCodigo, componente, articuloCodigo })

/**
 * Doble de cliente que responde a las consultas por su orden: delegaciones,
 * resoluciones y artículos genéricos. Registra las llamadas para poder afirmar
 * que la tercera no se hace cuando no hay plantilla.
 *
 * NO filtra: devuelve todas las filas que se le dan. Así, si una prueba afirma
 * que una resolución de un conjunto fuera de la cadena se ignora, lo está
 * comprobando de verdad y no gracias al doble.
 */
function clienteFalso(datos: {
  delegaciones?: FilaDelegacion[]
  resoluciones?: FilaResolucion[]
  genericos?: string[]
}) {
  const llamadas = { select: 0 }
  const respuestas: unknown[][] = [
    datos.delegaciones ?? [],
    datos.resoluciones ?? [],
    (datos.genericos ?? []).map((codigo) => ({ codigo })),
  ]

  const resultado = (valores: unknown[]) => {
    const promesa = Promise.resolve(valores)
    return {
      where: () => promesa,
      then: promesa.then.bind(promesa),
      catch: promesa.catch.bind(promesa),
      finally: promesa.finally.bind(promesa),
    }
  }

  const cliente = {
    select: () => {
      const valores = respuestas[llamadas.select++] ?? []
      return { from: () => resultado(valores) }
    },
  } as unknown as ClienteEscritura

  return { cliente, llamadas }
}

const resolver = (
  cliente: ClienteEscritura,
  plantilla: Componente[],
  variante: '1' | '2' = '2',
) => resolverPerfiles(cliente, { serieCodigo: 'S', plantilla, variante })

describe('cadena de conjuntos y precedencia', () => {
  it('sustituye el genérico por el artículo real de la serie', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV', 'PERFIL-MV')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('PERFIL-MV')
    expect(r.variantesAplicadas).toBe(0)
    expect([...r.sinResolver, ...r.sinResolverAsoc]).toEqual([])
  })

  it('la serie gana sobre sus delegados para el mismo componente', async () => {
    const { cliente } = clienteFalso({
      delegaciones: [delega('S', 'D')],
      resoluciones: [resuelve('D', 'MV', 'DEL-MV'), resuelve('S', 'MV', 'SER-MV')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('SER-MV')
  })

  it('hereda del delegado lo que la serie no resuelve, transitivamente', async () => {
    const { cliente } = clienteFalso({
      delegaciones: [delega('S', 'D'), delega('D', 'E')],
      resoluciones: [resuelve('E', 'HV', 'NIETO-HV')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'HV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('NIETO-HV')
  })

  // La consulta productiva filtra por la cadena; la precedencia la impone
  // después `construirResoluciones` recorriéndola. Se comprueba sin el filtro
  // de SQL para que la prueba hable de la regla, no del doble.
  it('ignora la resolución de un conjunto que no está en la cadena', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('OTRA', 'MV', 'AJENO')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('GEN')
    expect([...r.sinResolver]).toEqual(['GEN'])
  })

  it('sin conjuntos ni resoluciones nada se resuelve', async () => {
    const { cliente } = clienteFalso({ genericos: ['GEN'] })
    const r = await resolver(cliente, [componente('GEN', 'MV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('GEN')
    expect([...r.sinResolver]).toEqual(['GEN'])
  })
})

describe('variante de acristalamiento', () => {
  it('resuelve por la variante elegida y la cuenta', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV.2', 'PERFIL-DOBLE')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV')], '2')
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('PERFIL-DOBLE')
    expect(r.variantesAplicadas).toBe(1)
  })

  // Montar un perfil de cristal sencillo donde va doble no es una aproximación,
  // es un error: la variante contraria no se prueba.
  it('no cae en la variante contraria', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV.2', 'PERFIL-DOBLE')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV')], '1')
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('GEN')
    expect(r.variantesAplicadas).toBe(0)
    expect([...r.sinResolver]).toEqual(['GEN'])
  })

  it('el exacto gana a la variante y no cuenta como variante', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV', 'EXACTO'), resuelve('S', 'MV.2', 'DOBLE')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV')], '2')
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('EXACTO')
    expect(r.variantesAplicadas).toBe(0)
  })

  // Cuenta COMPONENTES, no artículos distintos: dos ranuras del mismo genérico
  // resueltas por variante suman dos.
  it('cuenta una vez por componente resuelto por variante', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV.2', 'DOBLE')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', 'MV'), componente('GEN', 'MV')], '2')
    expect(r.variantesAplicadas).toBe(2)
  })
})

describe('el CRISTAL no lo resuelve la serie', () => {
  // Contarlo como hueco metía un problema en TODA línea con cristal y la dejaba
  // sin valorar: 1.864 de 7.000 apariciones del histórico (T.21.3).
  it('deja la ranura de cristal intacta y fuera de los avisos', async () => {
    const { cliente } = clienteFalso({ genericos: ['GEN-CRISTAL'] })
    const r = await resolver(cliente, [componente('GEN-CRISTAL', '1')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('GEN-CRISTAL')
    expect([...r.sinResolver, ...r.sinResolverAsoc]).toEqual([])
  })

  // La salida es ANTES de consultar la cadena: aunque la serie tuviera una
  // resolución para el componente '1', no se aplica.
  it('no aplica la resolución de la serie al componente de cristal', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', '1', 'NO-DEBE-APLICARSE')],
      genericos: ['GEN-CRISTAL'],
    })
    const r = await resolver(cliente, [componente('GEN-CRISTAL', '1')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('GEN-CRISTAL')
  })

  // La exclusión es del componente '1', no del artículo: el mismo genérico en
  // otra ranura sí cuenta como hueco.
  it('el mismo artículo en otra ranura sí queda sin resolver', async () => {
    const { cliente } = clienteFalso({ genericos: ['GEN'] })
    const r = await resolver(cliente, [componente('GEN', '1'), componente('GEN', 'MV')])
    expect([...r.sinResolver]).toEqual(['GEN'])
  })
})

describe('reparto entre perfil y asociado', () => {
  it('el genérico sin resolver cae en perfil por defecto', async () => {
    const { cliente } = clienteFalso({ genericos: ['GEN'] })
    const r = await resolver(cliente, [componente('GEN', 'DESCONOCIDO')])
    expect([...r.sinResolver]).toEqual(['GEN'])
    expect([...r.sinResolverAsoc]).toEqual([])
  })

  it('mano de obra (inf) y accesorios (Acc) van a asociado por su función', async () => {
    const { cliente } = clienteFalso({ genericos: ['MO', 'ACC'] })
    const r = await resolver(cliente, [
      componente('MO', 'X', { funcion: 'infMO' }),
      componente('ACC', 'Y', { funcion: 'AccPP' }),
    ])
    expect([...r.sinResolverAsoc]).toEqual(['MO', 'ACC'])
    expect([...r.sinResolver]).toEqual([])
  })

  // La heurística distingue mayúsculas y minúsculas. Se fija tal cual está:
  // cambiarla movería ranuras entre los dos avisos sin medirlo.
  it('la heurística de función respeta mayúsculas y minúsculas', async () => {
    const { cliente } = clienteFalso({ genericos: ['A', 'B', 'C'] })
    const r = await resolver(cliente, [
      componente('A', 'X', { funcion: 'INF' }),
      componente('B', 'X', { funcion: 'acc' }),
      componente('C', 'X', { funcion: 'HV' }),
    ])
    expect([...r.sinResolverAsoc]).toEqual([])
    expect([...r.sinResolver]).toEqual(['A', 'B', 'C'])
  })

  // Compases, mecanismos y correderas llevan `funcion` HV/HH igual que una hoja
  // de perfil: sin la lista medida se colarían en el aviso de perfil.
  it('el herraje de la lista medida va a asociado aunque su función sea de hoja', async () => {
    const { cliente } = clienteFalso({ genericos: ['COMPAS', 'CORRE'] })
    const r = await resolver(cliente, [
      componente('COMPAS', 'OBC', { funcion: 'HV' }),
      componente('CORRE', '222', { funcion: 'HH' }),
    ])
    expect([...r.sinResolverAsoc]).toEqual(['COMPAS', 'CORRE'])
    expect([...r.sinResolver]).toEqual([])
  })

  // La regla es ADITIVA: solo mueve de perfil a asociado. Un código que no está
  // en la lista sigue cayendo en el aviso ruidoso de perfil, que es la
  // dirección segura: no puede enmascarar un hueco de perfil real.
  it('un componente parecido pero fuera de la lista sigue siendo perfil', async () => {
    const { cliente } = clienteFalso({ genericos: ['X'] })
    const r = await resolver(cliente, [componente('X', 'OBX', { funcion: 'HV' })])
    expect([...r.sinResolver]).toEqual(['X'])
    expect([...r.sinResolverAsoc]).toEqual([])
  })

  // Conjuntos de artículos, no de ranuras: el mismo genérico en cinco ranuras
  // es UN hueco en el aviso.
  it('agrupa por artículo, no por ranura', async () => {
    const { cliente } = clienteFalso({ genericos: ['GEN'] })
    const r = await resolver(cliente, [
      componente('GEN', 'MV'), componente('GEN', 'MH'), componente('GEN', 'HV'),
    ])
    expect([...r.sinResolver]).toEqual(['GEN'])
  })
})

describe('lo que no es genérico no entra en los avisos', () => {
  it('un artículo real sin resolución no se anota', async () => {
    const { cliente } = clienteFalso({ genericos: [] })
    const r = await resolver(cliente, [componente('PERFIL-REAL', 'MV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('PERFIL-REAL')
    expect([...r.sinResolver, ...r.sinResolverAsoc]).toEqual([])
    expect([...r.genericos]).toEqual([])
  })

  /**
   * Un artículo REAL cuya ranura sí resuelve la serie se sustituye igualmente.
   *
   * Es una rama accidental heredada: el filtro de genéricos gobierna los AVISOS,
   * no la sustitución. Con datos productivos no debería darse —una plantilla
   * lleva el genérico en la ranura que la serie resuelve—, pero la función lo
   * admite y conviene que quede escrito antes de que alguien lo tome por una
   * decisión.
   */
  it('el artículo real también se sustituye si su ranura resuelve', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV', 'DE-LA-SERIE')],
      genericos: [],
    })
    const r = await resolver(cliente, [componente('PERFIL-REAL', 'MV')])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('DE-LA-SERIE')
  })
})

describe('componente sin componenteDisenyo', () => {
  // No tiene ranura que resolver, así que ni se consulta la serie. Si además es
  // genérico, es un hueco: se clasifica con las mismas reglas.
  it('no se resuelve y se anota como perfil si es genérico', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV', 'PERFIL-MV')],
      genericos: ['GEN'],
    })
    const r = await resolver(cliente, [componente('GEN', null)])
    expect(r.plantillaResuelta[0].articuloCodigo).toBe('GEN')
    expect([...r.sinResolver]).toEqual(['GEN'])
  })

  it('sin ranura, la función sigue mandándolo a asociado', async () => {
    const { cliente } = clienteFalso({ genericos: ['MO'] })
    const r = await resolver(cliente, [componente('MO', null, { funcion: 'infMO' })])
    expect([...r.sinResolverAsoc]).toEqual(['MO'])
  })

  it('sin ranura y sin ser genérico, no se anota', async () => {
    const { cliente } = clienteFalso({ genericos: [] })
    const r = await resolver(cliente, [componente('REAL', null)])
    expect([...r.sinResolver, ...r.sinResolverAsoc]).toEqual([])
  })
})

describe('forma del resultado', () => {
  it('conserva el resto de columnas del componente al sustituir', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV', 'PERFIL-MV')],
      genericos: ['GEN'],
    })
    const plantilla = [{
      ...componente('GEN', 'MV', { funcion: 'MV' }),
      formulaLargo: 'L-10', idItemDisenyo: 3, tipoHojaDisenyo: -1,
    }]
    const r = await resolverPerfiles(cliente, { serieCodigo: 'S', plantilla, variante: '2' })
    expect(r.plantillaResuelta[0]).toEqual({
      articuloCodigo: 'PERFIL-MV', funcion: 'MV', componenteDisenyo: 'MV',
      formulaLargo: 'L-10', idItemDisenyo: 3, tipoHojaDisenyo: -1,
    })
  })

  it('devuelve los genéricos detectados, resueltos o no', async () => {
    const { cliente } = clienteFalso({
      resoluciones: [resuelve('S', 'MV', 'PERFIL-MV')],
      genericos: ['GEN-RESUELTO', 'GEN-HUECO'],
    })
    const r = await resolver(cliente, [
      componente('GEN-RESUELTO', 'MV'), componente('GEN-HUECO', 'ZZ'),
    ])
    expect([...r.genericos].sort()).toEqual(['GEN-HUECO', 'GEN-RESUELTO'])
    expect([...r.sinResolver]).toEqual(['GEN-HUECO'])
  })

  // Sin códigos que consultar no se pregunta por los genéricos: la consulta de
  // la serie sí se hace, porque no depende de la plantilla.
  it('con la plantilla vacía no consulta el catálogo de artículos', async () => {
    const { cliente, llamadas } = clienteFalso({})
    const r = await resolver(cliente, [])
    expect(r).toEqual({
      plantillaResuelta: [],
      genericos: new Set(),
      sinResolver: new Set(),
      sinResolverAsoc: new Set(),
      variantesAplicadas: 0,
    })
    expect(llamadas.select).toBe(2)
  })
})
