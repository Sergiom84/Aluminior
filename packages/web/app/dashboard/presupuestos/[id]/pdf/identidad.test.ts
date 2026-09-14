import { expect, it } from 'vitest'
import { nombreArchivoPresupuestoPdf } from './identidad'
it('descarga distingue serie y revisión cero sin caracteres de cabecera inyectables', () => {
  expect(nombreArchivoPresupuestoPdf('A', 260006, 0)).toBe('presupuesto-A-260006-revision-0.pdf')
  expect(nombreArchivoPresupuestoPdf('B', 260006, 0)).not.toBe(nombreArchivoPresupuestoPdf('A', 260006, 0))
  expect(nombreArchivoPresupuestoPdf('A', 260006, 1)).not.toBe(nombreArchivoPresupuestoPdf('A', 260006, 0))
  expect(nombreArchivoPresupuestoPdf('A"\r\n/B', 1, 0)).not.toMatch(/["\r\n/]/)
})
