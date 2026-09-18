/**
 * Escaparate de estructuras. Categorías y paginación del diálogo de Productor
 * (galería 4×3). Las categorías sin plantilla verificada se listan vacías:
 * aparecen para reconocer la pantalla, no simulan catálogo.
 */
import { PLANTILLAS_DISENO, type FamiliaVisual, type PlantillaDiseno } from './diseno.ts'

export const ITEMS_POR_PAGINA_ESCAPARATE = 12

export interface CategoriaEscaparate {
  readonly id: string
  readonly nombre: string
  readonly familias: readonly FamiliaVisual[]
}

export const CATEGORIAS_ESCAPARATE: readonly CategoriaEscaparate[] = [
  { id: 'correderas-no-perimetrales', nombre: 'CORREDERAS NO PERIMETRALES', familias: [] },
  { id: 'puertas-correderas', nombre: 'PUERTAS CORREDERAS', familias: [] },
  { id: 'correderas-perimetrales', nombre: 'CORREDERAS PERIMETRALES', familias: [] },
  { id: 'correderas-elevables', nombre: 'CORREDERAS ELEVABLES', familias: [] },
  { id: 'correderas-especiales', nombre: 'CORREDERAS ESPECIALES', familias: [] },
  {
    id: 'ventanas-abatibles',
    nombre: 'VENTANAS ABATIBLES',
    familias: ['VENTANAS ABATIBLES', 'OSCILOBATIENTES', 'COMBINACIONES'],
  },
  { id: 'puertas-abatibles', nombre: 'PUERTAS ABATIBLES', familias: [] },
  { id: 'fijos', nombre: 'FIJOS', familias: ['FIJOS'] },
  { id: 'mallorquinas', nombre: 'MALLORQUINAS', familias: [] },
  { id: 'fijos-corredera', nombre: 'FIJOS CORREDERA', familias: [] },
  { id: 'formas-curvas', nombre: 'FORMAS CURVAS-INCLINADAS', familias: [] },
  { id: 'puertas-plegables', nombre: 'PUERTAS PLEGABLES', familias: [] },
  { id: 'osciloparalelas', nombre: 'OSCILOPARALELAS', familias: [] },
  { id: 'pivotantes', nombre: 'PIVOTANTES', familias: [] },
  { id: 'vaiven', nombre: 'VAIVEN', familias: [] },
  { id: 'compactos', nombre: 'COMPACTOS', familias: [] },
  { id: 'mosquiteras', nombre: 'MOSQUITERAS', familias: [] },
  { id: 'premarcos', nombre: 'PREMARCOS DE OBRA', familias: [] },
]

export function categoriaEscaparate(id: string): CategoriaEscaparate | null {
  return CATEGORIAS_ESCAPARATE.find((categoria) => categoria.id === id) ?? null
}

export function categoriaInicialEscaparate(): CategoriaEscaparate {
  return CATEGORIAS_ESCAPARATE.find((categoria) => categoria.familias.length > 0)
    ?? CATEGORIAS_ESCAPARATE[0]
}

export function itemsEscaparate(categoriaId: string): readonly PlantillaDiseno[] {
  const categoria = categoriaEscaparate(categoriaId)
  if (!categoria || categoria.familias.length === 0) return []
  return PLANTILLAS_DISENO.filter((plantilla) =>
    categoria.familias.includes(plantilla.familia))
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
