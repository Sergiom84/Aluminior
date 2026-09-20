import { ent, num, txt } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import { descartar, type Resultado } from './resultado.ts'

export async function cargarPvp(cargar: Cargar): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  resultados.push(await cargar('ArticulosPVP', 'articulos_pvp', (f, r) => {
    const articulo = txt(f.Articulo)
    const acabado = txt(f.Acabado)
    const tarifa = ent(f.Tarifa)
    const precio = num(f.PVP ?? f.Precio)
    if (!articulo || !acabado || tarifa === null) { descartar(r, 'clave incompleta'); return null }
    if (precio === null) { descartar(r, 'sin precio'); return null }
    return { articulo_codigo: articulo, acabado_codigo: acabado, tarifa, precio }
  }))
  return resultados
}
