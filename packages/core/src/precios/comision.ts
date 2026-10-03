/**
 * Comisión de documento sumada al precio de línea (pestaña `Gastos` de la
 * cabecera de Productor: `Comisión` % y `Sumar Comisión`).
 *
 * Evidencia EMP0016: con `SumarComisionSN`, el `Precio` de cada línea es la
 * suma de su despiece por (1 + `ComisionPorc`/100), en estructuras y GRUPO
 * (0,90 con -10 %, 1,05 con 5 %…); el despiece conserva los importes base y
 * sin `SumarComisionSN` el factor es 1. El orden exacto de redondeo no está
 * demostrado: quedan residuos de 1 a 4 céntimos con el signo de la comisión.
 * Aquí se aplica una vez al precio unitario, redondeado a céntimos.
 */
import { compararDecimal, multiplicarDecimal, normalizarDecimal, sumarDecimal, type Decimal } from './decimal.ts'

export function precioConComision(precio: Decimal, comisionPorc: Decimal | null | undefined, escala = 2): Decimal {
  if (!comisionPorc || compararDecimal(comisionPorc, '0') === 0) return normalizarDecimal(precio, escala)
  const factor = sumarDecimal('1', multiplicarDecimal(normalizarDecimal(comisionPorc, 4), '0.01', 6), 6)
  if (compararDecimal(factor, '0') < 0) throw new Error('Comisión por debajo del -100 %')
  return multiplicarDecimal(precio, factor, escala)
}
