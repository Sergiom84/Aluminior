import { expect, it } from 'vitest'
import { partirPalabraPdf } from './texto'

it('ofrece cortes sin perder caracteres, acentos, espacios ni saltos', () => {
  for (const texto of ['ÁÉÍÓÚÑ'.repeat(50), 'identificadorSinEspacios'.repeat(12), 'Ángulo', 'dos palabras\n']) {
    const partes = partirPalabraPdf(texto)
    expect(partes.join('')).toBe(texto)
    if (Array.from(texto).length > 8) expect(partes.every(p => Array.from(p).length <= 4)).toBe(true)
  }
})
