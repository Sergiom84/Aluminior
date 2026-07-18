/**
 * Códigos de estructura: identificadores OPACOS.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NO intentes parsear el código para deducir la composición del hueco.
 * Se probó y falla. Ver PLAN.md anexo E.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * La hipótesis inicial era que el código describía la composición:
 *   1+1        -> DOS VENTANAS ABATIBLES DE 1 HOJA          correcto
 *   1O+2F+1O   -> 2 VENTANAS ABATIBLES OSCILO Y 2 FIJOS     correcto
 *   F2PF       -> PUERTA ABATIBLE 2 HOJAS CON 2 FIJOS       correcto
 *
 * Pero al validarla contra las 541 estructuras del catálogo real sólo cubría
 * el 21%, y entre los "reconocidos" había errores graves:
 *   C312       -> el parser leía "312 hojas"; es VENTANA CORREDERA DE TRES
 *                 HOJAS, donde 312 es una referencia de modelo
 *   F16        -> el parser leía "16 hojas"; es MAMPARA PENTAGONAL CON
 *                 2 HOJAS PLEGABLES Y 1 ABATIBLE
 *
 * La composición sólo se codifica en las familias 003 (ventanas) y 004
 * (puertas). En 113 (mamparas) y 001 (correderas) los dígitos son números de
 * modelo. Un parser que acierta a veces y miente con seguridad el resto del
 * tiempo es peor que no tener parser.
 *
 * FUENTES CORRECTAS, por orden de autoridad:
 *   1. `EstructurasDiseño`  - geometría real: hojas, travesaños, cotas, cortes.
 *                             Es el dato con el que calcula el sistema original.
 *   2. `EstructurasArticulos` - despiece y lista de materiales.
 *   3. `Estructuras.Descripcion` - texto escrito por humanos, para mostrar.
 *   4. `Estructuras.Familia` - clasificación (003 ventanas, 004 puertas,
 *                              010 arcos, 113 mamparas, 001 correderas).
 */

/** Familias observadas en el catálogo de EMP0016. */
export const FAMILIAS_ESTRUCTURA = {
  '001': 'Correderas',
  '003': 'Ventanas',
  '004': 'Puertas',
  '010': 'Arcos y formas especiales',
  '103': 'Accesorios de unión',
  '113': 'Mamparas',
} as const

export type CodigoFamilia = keyof typeof FAMILIAS_ESTRUCTURA

export function nombreFamilia(codigo: string): string {
  return FAMILIAS_ESTRUCTURA[codigo as CodigoFamilia] ?? `Familia ${codigo}`
}

/**
 * Normaliza un código para búsqueda y comparación.
 * No lo interpreta: sólo limpia espacios y unifica mayúsculas.
 */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase()
}
