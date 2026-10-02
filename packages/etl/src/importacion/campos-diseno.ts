import { ent, num, txt, type Fila } from '../csv.ts'

/**
 * Campos de dibujo del catálogo (migración 0022). Los comparten el importador
 * completo y el relleno dirigido, para que ambos escriban exactamente lo mismo.
 */
export const COLUMNAS_DISENO_ESTRUCTURA = ['dis_ancho_mm', 'dis_alto_mm'] as const
export const COLUMNAS_DISENO_NODO = [
  'tipo_hoja', 'numero_hoja', 'tipo_cota', 'cota', 'equidistantes', 'tipo_marco', 'tipo_curva',
] as const

/** Medida inicial del dibujo de catálogo (`Estructuras.DisAncho/DisAlto`). */
export function camposDisenoEstructura(f: Fila) {
  return {
    dis_ancho_mm: ent(f.DisAncho),
    dis_alto_mm: ent(f.DisAlto),
  }
}

/** Hoja, cota, reparto, marco y curva de una fila de `EstructurasDiseño`. */
export function camposDisenoNodo(f: Fila) {
  return {
    tipo_hoja: ent(f.TipoHoja),
    numero_hoja: ent(f.nHoja),
    tipo_cota: ent(f.TipoCota),
    cota: num(f.Cota),
    equidistantes: ent(f.OperacionEqui),
    tipo_marco: txt(f.TipoMarco),
    tipo_curva: ent(f.TipoCurva),
  }
}
