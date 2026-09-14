import {describe,expect,it} from 'vitest'
import {DrizzleQueryError} from 'drizzle-orm'
import {diagnosticoPostgres} from './error-postgres.ts'

describe('diagnóstico estructurado de PostgreSQL', () => {
  const original = Object.assign(new Error('dato sensible'), {
    code: '23505', constraint_name: 'presupuestos_identidad_uq', detail: 'dato sensible',
  })
  it('conserva SQLSTATE y restricción de error directo sin exponer otros campos', () => {
    expect(diagnosticoPostgres(original)).toEqual({code:'23505',constraint_name:'presupuestos_identidad_uq'})
  })
  it('atraviesa un DrizzleQueryError real y envoltorios adicionales', () => {
    const drizzle = new DrizzleQueryError('select secreto', ['secreto'], original)
    expect(diagnosticoPostgres(new Error('envoltorio', {cause:drizzle}))).toEqual({code:'23505',constraint_name:'presupuestos_identidad_uq'})
  })
  it('no inventa una restricción ni confunde códigos ajenos', () => {
    expect(diagnosticoPostgres({code:'23503'})).toEqual({code:'23503'})
    expect(diagnosticoPostgres({code:'ECONNRESET'})).toBeUndefined()
  })
  it('termina ante ciclos y entradas sin diagnóstico', () => {
    const cycle: {cause?: unknown} = {}; cycle.cause=cycle
    expect(diagnosticoPostgres(cycle)).toBeUndefined()
    for(const value of [null,undefined,'23505',42,{}])expect(diagnosticoPostgres(value)).toBeUndefined()
  })
})
