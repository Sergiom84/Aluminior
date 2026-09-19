/**
 * Escaparate de estructuras. Categorías y paginación del diálogo de Productor
 * (galería 4×3). Las categorías sin plantilla verificada se listan vacías:
 * aparecen para reconocer la pantalla, no simulan catálogo.
 */
import { PLANTILLAS_DISENO, type PlantillaDiseno } from './diseno.ts'

export const ITEMS_POR_PAGINA_ESCAPARATE = 12

export interface CategoriaEscaparate {
  readonly id: string
  readonly nombre: string
  readonly familias: readonly string[]
}

export const CATEGORIAS_ESCAPARATE: readonly CategoriaEscaparate[] = [
  { id: 'correderas-no-perimetrales', nombre: 'VENTANAS CORREDERAS 90º', familias: ['001'] },
  { id: 'puertas-correderas', nombre: 'PUERTAS CORREDERAS 90º', familias: ['002'] },
  { id: 'correderas-perimetrales', nombre: 'CORREDERAS PERIMETRALES 45º', familias: ['011'] },
  { id: 'ventanas-abatibles', nombre: 'VENTANAS ABATIBLES', familias: ['003'] },
  { id: 'oscilobatientes', nombre: 'OSCILOBATIENTES', familias: ['020'] },
  { id: 'puertas-abatibles', nombre: 'PUERTAS BALCONERAS PRACTICABLE', familias: ['004'] },
  { id: 'puertas-calle', nombre: 'PUERTAS DE CALLE', familias: ['021'] },
  { id: 'fijos', nombre: 'FIJOS ABATIBLES', familias: ['005'] },
  { id: 'mallorquinas', nombre: 'MALLORQUINAS', familias: ['006'] },
  { id: 'fijos-corredera', nombre: 'FIJOS CORREDERA', familias: ['009'] },
  { id: 'correderas-monocarriles', nombre: 'CORREDERAS MONOCARRILES', familias: ['013'] },
  { id: 'correderas-elevables', nombre: 'CORREDERAS ELEVABLES 45º', familias: ['012'] },
  { id: 'puertas-plegables', nombre: 'PUERTAS PLEGABLES', familias: ['007'] },
  { id: 'osciloparalelas', nombre: 'OSCILOPARALELAS', familias: ['014'] },
  { id: 'correderas-minimalistas', nombre: 'CORREDERAS MINIMALISTAS', familias: ['017'] },
  { id: 'pivotantes', nombre: 'PIVOTANTES', familias: ['015'] },
  { id: 'formas-curvas', nombre: 'FORMAS CURVAS-INCLINADAS', familias: ['010'] },
  { id: 'vaiven', nombre: 'VAIVEN', familias: ['016'] },
  { id: 'cortina-cristal', nombre: 'CORTINA CRISTAL', familias: ['018'] },
  { id: 'techos-moviles', nombre: 'TECHOS MOVILES', familias: ['019'] },
  { id: 'compactos', nombre: 'COMPACTOS', familias: ['100'] },
  { id: 'mosquiteras', nombre: 'MOSQUITERAS', familias: ['101'] },
  { id: 'premarcos', nombre: 'PREMARCOS DE OBRA', familias: ['104'] },
]

export function categoriaEscaparate(id: string): CategoriaEscaparate | null {
  return CATEGORIAS_ESCAPARATE.find((categoria) => categoria.id === id) ?? null
}

export function categoriaInicialEscaparate(): CategoriaEscaparate {
  return CATEGORIAS_ESCAPARATE.find(categoriaConCatalogo)
    ?? CATEGORIAS_ESCAPARATE[0]
}

export function itemsEscaparate(categoriaId: string): readonly PlantillaDiseno[] {
  const categoria = categoriaEscaparate(categoriaId)
  if (!categoria || categoria.familias.length === 0) return []
  return PLANTILLAS_DISENO.filter((plantilla) =>
    plantilla.familiaCodigo !== undefined && categoria.familias.includes(plantilla.familiaCodigo))
}

export interface PaginaEscaparate {
  readonly items: readonly PlantillaDiseno[]
  readonly pagina: number
  readonly totalPaginas: number
  readonly totalItems: number
}

export function paginaEscaparate(
  items: readonly PlantillaDiseno[],
  pagina: number,
  porPagina = ITEMS_POR_PAGINA_ESCAPARATE,
): PaginaEscaparate {
  const totalItems = items.length
  const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina))
  const actual = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (actual - 1) * porPagina
  return {
    items: items.slice(inicio, inicio + porPagina),
    pagina: actual,
    totalPaginas,
    totalItems,
  }
}

export function categoriaConCatalogo(categoria: CategoriaEscaparate): boolean {
  return categoria.familias.length > 0 && itemsEscaparate(categoria.id).length > 0
}
