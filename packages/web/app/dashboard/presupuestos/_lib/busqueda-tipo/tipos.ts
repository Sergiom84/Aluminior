/**
 * Tipos de búsqueda del listado de presupuestos.
 *
 * Sin dependencias de base de datos: lo importa también el buscador del
 * cliente para pintar el desplegable y el texto de ejemplo de cada tipo.
 */

export const TIPOS_BUSQUEDA = [
  { valor: 'nombre', etiqueta: 'Nombre y apellidos', ejemplo: 'Nombre o apellidos' },
  { valor: 'codigo', etiqueta: 'Código o referencia', ejemplo: 'Nº presupuesto, código de cliente o referencia' },
  { valor: 'calle', etiqueta: 'Calle', ejemplo: 'Calle del cliente' },
  { valor: 'telefono', etiqueta: 'Teléfono', ejemplo: 'Teléfono del cliente' },
  { valor: 'obra', etiqueta: 'Obra', ejemplo: 'Obra' },
  { valor: 'fecha', etiqueta: 'Fecha', ejemplo: 'dd/mm/aaaa, dd/mm, mm/aaaa o aaaa' },
  { valor: 'precio', etiqueta: 'Precio', ejemplo: '2.176,09' },
] as const

export type TipoBusqueda = (typeof TIPOS_BUSQUEDA)[number]['valor']

export const TIPO_BUSQUEDA_POR_DEFECTO: TipoBusqueda = 'nombre'

/** Un tipo ausente o desconocido en la URL vuelve al tipo por defecto. */
export function leerTipoBusqueda(valor: string | null | undefined): TipoBusqueda {
  return TIPOS_BUSQUEDA.find((tipo) => tipo.valor === valor)?.valor ?? TIPO_BUSQUEDA_POR_DEFECTO
}

export function ejemploTipoBusqueda(tipo: TipoBusqueda): string {
  return TIPOS_BUSQUEDA.find((opcion) => opcion.valor === tipo)!.ejemplo
}

export function etiquetaTipoBusqueda(tipo: TipoBusqueda): string {
  return TIPOS_BUSQUEDA.find((opcion) => opcion.valor === tipo)!.etiqueta
}
