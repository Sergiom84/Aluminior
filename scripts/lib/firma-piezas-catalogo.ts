import assert from 'node:assert/strict'

const finito = (v: unknown): number => {
  assert.ok((typeof v === 'number' || (typeof v === 'string' && v.trim() !== '')) &&
    Number.isFinite(Number(v)), 'La pieza contiene un número ausente o no finito')
  return Number(v)
}
const medida = (v: unknown) => v == null ? null : Math.round(finito(v) * 10) / 10

/** La tolerancia dimensional no se aplica a cantidades ni disfraza datos inválidos. */
export function firmaPiezasCatalogo(filas: unknown[][]): string[] {
  return filas.map(([articulo, cantidad, largo, ancho]) =>
    JSON.stringify([articulo, finito(cantidad), medida(largo), medida(ancho)])).sort()
}
