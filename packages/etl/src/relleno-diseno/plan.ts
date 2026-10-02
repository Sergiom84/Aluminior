import { ent, leerLotes, rutaTabla, txt, type Fila } from '../csv.ts'
import { camposDisenoEstructura, camposDisenoNodo } from '../importacion/campos-diseno.ts'

export interface FilaRellenoEstructura extends ReturnType<typeof camposDisenoEstructura> {
  codigo: string
}

/** `tipo` y `contenido_en` identifican el nodo: solo se rellena si coinciden. */
export interface FilaRellenoNodo extends ReturnType<typeof camposDisenoNodo> {
  estructura_codigo: string
  id_item: number
  tipo: number
  contenido_en: number | null
}

export interface PlanRelleno {
  estructuras: FilaRellenoEstructura[]
  nodos: FilaRellenoNodo[]
  /** Filas descartadas del origen: instancias de documento o claves incompletas. */
  descartadas: number
}

/** Mismo criterio que el importador: solo plantillas de catálogo con clave completa. */
export function planRelleno(estructuras: readonly Fila[], diseno: readonly Fila[]): PlanRelleno {
  let descartadas = 0
  const filasEstructura: FilaRellenoEstructura[] = []
  for (const f of estructuras) {
    const codigo = txt(f.Codigo)
    if (!codigo) { descartadas++; continue }
    filasEstructura.push({ codigo, ...camposDisenoEstructura(f) })
  }
  const filasNodo: FilaRellenoNodo[] = []
  for (const f of diseno) {
    const estructura = txt(f.Estructura)
    const idItem = ent(f.Id)
    const tipo = ent(f.Tipo)
    if (txt(f.TipoDoc) || !estructura || idItem === null || tipo === null) { descartadas++; continue }
    filasNodo.push({
      estructura_codigo: estructura, id_item: idItem, tipo, contenido_en: ent(f.ContenidoEn),
      ...camposDisenoNodo(f),
    })
  }
  return { estructuras: filasEstructura, nodos: filasNodo, descartadas }
}

async function leerTabla(origen: string, tabla: string): Promise<Fila[]> {
  const ruta = rutaTabla(origen, tabla)
  if (!ruta) throw new Error(`No se encuentra ${tabla}.csv en el origen`)
  const filas: Fila[] = []
  for await (const lote of leerLotes(ruta)) filas.push(...lote)
  return filas
}

export async function leerPlanRelleno(origen: string): Promise<PlanRelleno> {
  const [estructuras, diseno] = await Promise.all([
    leerTabla(origen, 'Estructuras'), leerTabla(origen, 'EstructurasDiseño'),
  ])
  return planRelleno(estructuras, diseno)
}
