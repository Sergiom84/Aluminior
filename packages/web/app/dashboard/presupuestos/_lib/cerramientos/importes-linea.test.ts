import { describe, expect, it } from 'vitest'
import { snapshotSintetico } from '../../../../../../core/src/estructuras/resultado-cerramiento/snapshot.fixture.ts'
import { importesLineaCerramiento } from './importes-linea.ts'

describe('adaptación de estados MO a total de línea', () => {
  const r = () => ({ ...snapshotSintetico(), ventaMateriales: { completo: true, importe: '10.00' } })
  it('sin horas no requiere filas ni tarifa manual', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'SIN_HORAS' })).toEqual({
      precioUnitario: '10.00', total: '30.00', valoracionCompleta: true })
  })
  it('PREPARADA vacía no se confunde con SIN_HORAS', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'PREPARADA', filas: [], valorable: true, notas: [] }).total).toBeNull()
  })
  it('migración pendiente no se convierte en ajuste cero', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'MIGRACION_PENDIENTE', mensaje: 'Pendiente' }).total).toBeNull()
  })
  it('material cero legítimo y sin horas conserva total cero', () => {
    expect(importesLineaCerramiento({ ...r(), ventaMateriales: { completo: true, importe: '0.00' } }, '3',
      { estado: 'SIN_HORAS' }).total).toBe('0.00')
  })
})
