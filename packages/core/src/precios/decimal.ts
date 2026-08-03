/**
 * Aritmética decimal exacta. Sin coma flotante en ningún punto.
 *
 * `numeric` de PostgreSQL es decimal exacto, y Drizzle lo devuelve como CADENA.
 * Convertirlo a `number` para multiplicar y redondear con
 * `Math.round(valor * 100) / 100` mete el error del binario antes de escribir:
 * `1,005` es `1,00499999999999989...` en doble precisión y redondea a `1,00`,
 * no a `1,01`. Un céntimo por línea, sobre un histórico de 7.245 líneas de mano
 * de obra, es dinero real que además deja el documento descuadrado respecto al
 * sistema que se reconstruye.
 *
 * Aquí todo se calcula con enteros escalados (`bigint`) y se redondea **a la
 * mitad hacia afuera**, que es lo que hace `ROUND(numeric, n)` de PostgreSQL.
 * La entrada y la salida son texto decimal —lo que se persiste—, de modo que un
 * valor leído de la base se puede valorar y volver a escribir sin pasar nunca
 * por `number`.
 */

/**
 * Decimal exacto en su representación persistible: **texto, nunca un `number`**.
 *
 * Es el único tipo que entra y sale de este módulo, y esa es la frontera que
 * hace cierta la garantía de arriba. Admitir `number` la rompería antes de
 * empezar: `1.005` ya es `1,00499999999999989...` en el momento en que el
 * literal se escribe, y ninguna aritmética posterior puede recuperar el valor
 * que se quería. El texto validado del formulario debe llegar hasta aquí sin
 * pasar por `parseFloat` ni `Number()`.
 */
export type Decimal = string

/** Valor = `unidades / 10^escala`. `escala` nunca es negativa. */
interface Escalado {
  unidades: bigint
  escala: number
}

/**
 * Sin notación exponencial a propósito: `numeric` nunca la produce, y admitirla
 * sólo serviría para colar un `String(numero)` por la puerta de atrás.
 */
const PATRON = /^([+-]?)(\d+)(?:\.(\d+))?$/

/** Texto decimal a entero escalado, sin pérdida. */
function escalar(valor: Decimal): Escalado {
  // Comprobación en tiempo de ejecución, no sólo de tipos: el valor viene de la
  // base o de un formulario, y ahí TypeScript no alcanza.
  if (typeof valor !== 'string') {
    throw new Error(`decimal no válido: se esperaba texto y llegó ${typeof valor}`)
  }
  const partes = PATRON.exec(valor.trim())
  if (!partes) throw new Error(`decimal no válido: ${valor}`)

  const [, signo, entera, decimales = ''] = partes
  const digitos = BigInt(entera + decimales)
  return { unidades: signo === '-' ? -digitos : digitos, escala: decimales.length }
}

/** Redondeo a la mitad hacia afuera, igual que `ROUND(numeric, n)`. */
function redondear(valor: Escalado, escala: number): bigint {
  const sobran = valor.escala - escala
  if (sobran <= 0) return valor.unidades * 10n ** BigInt(-sobran)

  const divisor = 10n ** BigInt(sobran)
  const negativo = valor.unidades < 0n
  const absoluto = negativo ? -valor.unidades : valor.unidades
  const cociente = absoluto / divisor
  // `resto * 2 >= divisor` es «la parte descartada llega a la mitad», sin
  // dividir por dos y sin fracciones.
  const sube = (absoluto % divisor) * 2n >= divisor
  const resultado = sube ? cociente + 1n : cociente
  return negativo ? -resultado : resultado
}

function formatear(unidades: bigint, escala: number): Decimal {
  const negativo = unidades < 0n
  const digitos = (negativo ? -unidades : unidades).toString().padStart(escala + 1, '0')
  const corte = digitos.length - escala
  const decimales = escala > 0 ? `.${digitos.slice(corte)}` : ''
  return `${negativo ? '-' : ''}${digitos.slice(0, corte)}${decimales}`
}

/**
 * Deja el valor en la escala pedida, redondeando como PostgreSQL.
 *
 * Es lo que convierte una entrada cualquiera en algo persistible en una columna
 * `numeric(p, escala)` sin que la base tenga que redondear por su cuenta.
 */
export function normalizarDecimal(valor: Decimal, escala: number): Decimal {
  return formatear(redondear(escalar(valor), escala), escala)
}

/**
 * Producto exacto, redondeado una sola vez al final.
 *
 * Los factores se multiplican enteros y las escalas se suman: el producto es
 * exacto hasta el último dígito, y el único redondeo es el de la escala de
 * salida. Redondear los factores antes cambiaría el importe.
 */
export function multiplicarDecimal(
  a: Decimal,
  b: Decimal,
  escala: number,
): Decimal {
  const x = escalar(a)
  const y = escalar(b)
  const producto = { unidades: x.unidades * y.unidades, escala: x.escala + y.escala }
  return formatear(redondear(producto, escala), escala)
}

/** `-1`, `0` o `1`. Sin restar en coma flotante. */
export function compararDecimal(a: Decimal, b: Decimal): -1 | 0 | 1 {
  const x = escalar(a)
  const y = escalar(b)
  const escala = Math.max(x.escala, y.escala)
  const ux = x.unidades * 10n ** BigInt(escala - x.escala)
  const uy = y.unidades * 10n ** BigInt(escala - y.escala)
  if (ux < uy) return -1
  return ux > uy ? 1 : 0
}

/** Signo del valor. `'-0.00'` y `'0'` son cero. */
export function signoDecimal(valor: Decimal): -1 | 0 | 1 {
  const { unidades } = escalar(valor)
  if (unidades < 0n) return -1
  return unidades > 0n ? 1 : 0
}
