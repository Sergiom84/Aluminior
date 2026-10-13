import { leerLotes, num, rutaTabla, txt } from '../csv.ts'
import { booleanoConocido, configuracionPrecioTabla } from '../importacion/precio-en-tabla.ts'
import { medidaExacta, tarifaExacta } from './claves.ts'

export interface ArticuloPrecioTabla {
  articulo_codigo: string
  precio_en_tabla: boolean | null
  politicas_precio_tabla: ReturnType<typeof configuracionPrecioTabla>['politicas_precio_tabla']
}
export interface FilaPrecioTabla {
  articulo_codigo: string; acabado_codigo: string; tarifa: number
  ancho_mm: string; largo_mm: string; precio: string; acabado_dependiente: boolean | null
}
export interface CatalogoPrecioTabla { articulos: ArticuloPrecioTabla[]; precios: FilaPrecioTabla[] }

/** Sólo catálogo y configuración. Lee y valida todo antes de cualquier escritura. */
export async function leerPreciosTabla(origen: string): Promise<CatalogoPrecioTabla> {
  const articulos: ArticuloPrecioTabla[] = [], precios: FilaPrecioTabla[] = []
  const clavesArticulos = new Set<string>(), clavesPrecios = new Set<string>()
  for (const tabla of ['Articulos', 'ArticulosPrecioTablaPVP']) {
    const ruta = rutaTabla(origen, tabla)
    if (!ruta) throw new Error(`Falta ${tabla}; se conserva el catálogo de precio en tabla`)
    for await (const lote of leerLotes(ruta)) for (const f of lote) {
      if (tabla === 'Articulos') {
        const codigo = txt(f.Codigo)
        if (!codigo || clavesArticulos.has(codigo)) throw new Error('Artículo sin código o duplicado')
        clavesArticulos.add(codigo)
        articulos.push({ articulo_codigo: codigo, ...configuracionPrecioTabla(f) })
      } else {
        const articulo = txt(f.Articulo), acabado = txt(f.Acabado), tarifa = tarifaExacta(f.Tarifa)
        const ancho = medidaExacta(f.Ancho), largo = medidaExacta(f.Largo), precio = num(f.PVP)
        if (!articulo || !acabado || tarifa === null || tarifa <= 0 || ancho === null || largo === null ||
          !(Number(ancho) > 0) || !(Number(largo) > 0) || precio === null || Number(precio) < 0)
          throw new Error('PVP por dimensiones sin clave, medidas o precio válidos')
        const clave = JSON.stringify([articulo, acabado, tarifa, Number(ancho), Number(largo)])
        if (clavesPrecios.has(clave)) throw new Error('PVP por dimensiones duplicado')
        clavesPrecios.add(clave)
        precios.push({ articulo_codigo: articulo, acabado_codigo: acabado, tarifa,
          ancho_mm: ancho, largo_mm: largo, precio, acabado_dependiente: booleanoConocido(f.EsAcabadoDependienteSN) })
      }
    }
  }
  if (!articulos.length || !precios.length) throw new Error('CSV de precio en tabla vacío; se conserva el catálogo')
  const porArticulo = new Map(articulos.map(a => [a.articulo_codigo, a]))
  if (precios.some(p => porArticulo.get(p.articulo_codigo)?.precio_en_tabla !== true))
    throw new Error('PVP por dimensiones sin artículo configurado por tabla')
  return { articulos, precios }
}
