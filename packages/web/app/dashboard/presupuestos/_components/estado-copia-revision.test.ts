import { describe, expect, it } from 'vitest'
import { ESTADO_INICIAL, reducirConfirmacion } from './estado-copia-revision.ts'

describe('reducirConfirmacion', () => {
  it('ARMAR abre la confirmación desde INACTIVO', () => {
    expect(reducirConfirmacion(ESTADO_INICIAL, { tipo: 'ARMAR' })).toEqual({ fase: 'ARMADO' })
  })

  it('ARMAR no hace nada si ya no está inactivo', () => {
    const enviando = { fase: 'ENVIANDO' } as const
    expect(reducirConfirmacion(enviando, { tipo: 'ARMAR' })).toBe(enviando)
  })

  it('CANCELAR vuelve a INACTIVO desde ARMADO o ERROR', () => {
    expect(reducirConfirmacion({ fase: 'ARMADO' }, { tipo: 'CANCELAR' })).toEqual({ fase: 'INACTIVO' })
    expect(reducirConfirmacion({ fase: 'ERROR', mensaje: 'x' }, { tipo: 'CANCELAR' })).toEqual({ fase: 'INACTIVO' })
  })

  it('CANCELAR no interrumpe un envío en curso', () => {
    const enviando = { fase: 'ENVIANDO' } as const
    expect(reducirConfirmacion(enviando, { tipo: 'CANCELAR' })).toBe(enviando)
  })

  it('ENVIAR pasa a ENVIANDO desde ARMADO', () => {
    expect(reducirConfirmacion({ fase: 'ARMADO' }, { tipo: 'ENVIAR' })).toEqual({ fase: 'ENVIANDO' })
  })

  it('ENVIAR permite reintentar desde ERROR', () => {
    expect(reducirConfirmacion({ fase: 'ERROR', mensaje: 'x' }, { tipo: 'ENVIAR' })).toEqual({ fase: 'ENVIANDO' })
  })

  it('ENVIAR no hace nada desde INACTIVO ni desde ENVIANDO: guarda de doble envío', () => {
    expect(reducirConfirmacion(ESTADO_INICIAL, { tipo: 'ENVIAR' })).toEqual(ESTADO_INICIAL)
    const enviando = { fase: 'ENVIANDO' } as const
    expect(reducirConfirmacion(enviando, { tipo: 'ENVIAR' })).toBe(enviando)
  })

  it('FALLO conserva la confirmación en ERROR y muestra el mensaje', () => {
    const resultado = reducirConfirmacion({ fase: 'ENVIANDO' }, { tipo: 'FALLO', mensaje: 'no se pudo copiar' })
    expect(resultado).toEqual({ fase: 'ERROR', mensaje: 'no se pudo copiar' })
  })

  it('FALLO fuera de ENVIANDO no hace nada', () => {
    const armado = { fase: 'ARMADO' } as const
    expect(reducirConfirmacion(armado, { tipo: 'FALLO', mensaje: 'x' })).toBe(armado)
  })

  it('EXITO vuelve a INACTIVO desde ENVIANDO', () => {
    expect(reducirConfirmacion({ fase: 'ENVIANDO' }, { tipo: 'EXITO' })).toEqual({ fase: 'INACTIVO' })
  })
})
