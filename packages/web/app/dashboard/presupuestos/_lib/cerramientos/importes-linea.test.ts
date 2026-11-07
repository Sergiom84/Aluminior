import { describe, expect, it } from 'vitest'
import { snapshotSintetico } from '../../../../../../core/src/estructuras/resultado-cerramiento/snapshot.fixture.ts'
import { importesLineaCerramiento } from './importes-linea.ts'

describe('adaptación de estados MO a total de línea', () => {
  const r = () => ({ ...snapshotSintetico(), ventaMateriales: { completo: true, importe: '10.00' } })
  it('sin horas no requiere filas ni tarifa manual', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'SIN_HORAS' })).toEqual({
      precioUnitario: '10.00', total: '30.00', valoracionCompleta: true })
  })
  it('incluye las horas manuales en precioUnitario y las multiplica por cantidad en total', () => {
    expect(importesLineaCerramiento(r(), '3', {
      estado: 'PREPARADA',
      valorable: true,
      notas: [],
      filas: [{
        concepto: 'COLOCACION',
        origen: 'MANUAL',
        articuloCodigo: 'MOCOL',
        articuloDescripcion: 'Colocación',
        unidad: 'UD',
        acabadoCodigo: 'UNI',
        tarifa: 1,
        horas: '2.00',
        minutos: '120.00',
        precioMinuto: '0.5000',
        importe: '60.00',
        costeMinuto: null,
        costeTotal: null,
        valoracionCompleta: true,
        motivoCodigo: null,
        motivoCosteCodigo: null,
      }],
    })).toEqual({
      precioUnitario: '70.00', total: '210.00', valoracionCompleta: true })
  })
  it('Sumar Comisión multiplica precio y total de la línea; sin comisión no cambia nada', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'SIN_HORAS' }, '-10')).toEqual({
      precioUnitario: '9.00', total: '27.00', valoracionCompleta: true })
    expect(importesLineaCerramiento(r(), '3', { estado: 'SIN_HORAS' }, null).total).toBe('30.00')
  })
  it('PREPARADA vacía no se confunde con SIN_HORAS', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'PREPARADA', filas: [], valorable: true, notas: [] }).total).toBeNull()
  })
  it('migración pendiente no se convierte en ajuste cero', () => {
    expect(importesLineaCerramiento(r(), '3', { estado: 'MIGRACION_PENDIENTE', mensaje: 'Pendiente' }).total).toBeNull()
  })
  it('reproduce los casos reales de GRUPO con cantidad 2 y mano de obra en EMP0016 (nDoc 1132 y nDoc 887)', () => {
    // nDoc 1132 (caso-02225): Cdad = 2, 7 h colocación (210 €/ud), materiales = 632,52 €/ud -> Precio = 842,52 €, Total = 1.685,04 €
    expect(importesLineaCerramiento({
      ...snapshotSintetico(),
      ventaMateriales: { completo: true, importe: '632.52' },
    }, '2', {
      estado: 'PREPARADA',
      valorable: true,
      notas: [],
      filas: [{
        concepto: 'COLOCACION',
        origen: 'MANUAL',
        articuloCodigo: 'MOCOL',
        articuloDescripcion: 'MANO DE OBRA DE COLOCACION (MINUTOS)',
        unidad: 'UD',
        acabadoCodigo: 'UNI',
        tarifa: 1,
        horas: '7.00',
        minutos: '420.00',
        precioMinuto: '0.5000',
        importe: '210.00',
        costeMinuto: null,
        costeTotal: null,
        valoracionCompleta: true,
        motivoCodigo: null,
        motivoCosteCodigo: null,
      }],
    })).toEqual({
      precioUnitario: '842.52',
      total: '1685.04',
      valoracionCompleta: true,
    })

    // nDoc 887 (caso-02119): Cdad = 2, 30 h colocación (900 €/ud), materiales = 3.650,68 €/ud + comisión 15 %
    // Productor guarda Precio = 5.233,35 € y Total = 10.466,70 €; la diferencia de 0,07 €/ud (0,14 € total)
    // frente a 5.233,28 € / 10.466,56 € corresponde al residuo de comisión sumada documentado en BANCO-CONTRASTE-2026-10-03.md.
    const caso887 = importesLineaCerramiento({
      ...snapshotSintetico(),
      ventaMateriales: { completo: true, importe: '3650.68' },
    }, '2', {
      estado: 'PREPARADA',
      valorable: true,
      notas: [],
      filas: [{
        concepto: 'COLOCACION',
        origen: 'MANUAL',
        articuloCodigo: 'MOCOL',
        articuloDescripcion: 'MANO DE OBRA DE COLOCACION (MINUTOS)',
        unidad: 'UD',
        acabadoCodigo: 'UNI',
        tarifa: 1,
        horas: '30.00',
        minutos: '1800.00',
        precioMinuto: '0.5000',
        importe: '900.00',
        costeMinuto: null,
        costeTotal: null,
        valoracionCompleta: true,
        motivoCodigo: null,
        motivoCosteCodigo: null,
      }],
    }, '15')
    expect(caso887.valoracionCompleta).toBe(true)
    expect(Math.abs(Number(caso887.precioUnitario) - 5233.35)).toBeLessThanOrEqual(0.10)
    expect(Math.abs(Number(caso887.total) - 10466.70)).toBeLessThanOrEqual(0.20)
  })
  it('material cero legítimo y sin horas conserva total cero', () => {
    expect(importesLineaCerramiento({ ...r(), ventaMateriales: { completo: true, importe: '0.00' } }, '3',
      { estado: 'SIN_HORAS' }).total).toBe('0.00')
  })
})
