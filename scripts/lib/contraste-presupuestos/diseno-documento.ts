/**
 * Nodo de `EstructurasDiseño` (CSV del catálogo o volcado TSV del documento)
 * como nodo del diseño propio de `@aluminior/core/despiece`.
 */
import type { NodoDiseno, PosicionTravesano } from '@aluminior/core/despiece'

type Fila = Record<string, string | undefined>
const txt = (v: string | undefined) => v?.trim() ? v.trim() : null
/** Admite el decimal con coma del export y con punto del volcado. */
const num = (v: string | undefined) => { const n = Number((txt(v) ?? '0').replace(',', '.')); return Number.isFinite(n) ? n : 0 }
const POSICIONES = new Set(['HA', 'HB', 'VI', 'VD'])

export function nodoDisenoDeProductor(f: Fila): NodoDiseno {
  const tipo = num(f.Tipo), posicion = txt(f.TipoTrav)
  return {
    id: num(f.Id), tipo, contenidoEn: num(f.ContenidoEn),
    tipoMarco: txt(f.TipoMarco), cortes: [f.TipoCorte1, f.TipoCorte2, f.TipoCorte3, f.TipoCorte4].map(num), curva: num(f.TipoCurva),
    posicion: posicion && POSICIONES.has(posicion) ? posicion as PosicionTravesano : null,
    division: num(f.idTrav), orden: tipo === 6 ? num(f.nTrav) : num(f.posHueco),
    tipoCota: num(f.TipoCota), cota: num(f.Cota), material: txt(f.travMH), clase: txt(f.TravVP),
    vidrio: txt(f.Vidrio), articulo: txt(f.barrArtic), horizontales: num(f.barrHoriz), verticales: num(f.barrVert),
  }
}
