import { describe, expect, it } from 'vitest'
import { ESTADO_INICIAL, reducirConfirmacion } from './estado-copia-revision.ts'

describe('reducirConfirmacion', () => {
  it('ARMAR abre la elección de destino desde INACTIVO', () => {
    expect(reducirConfirmacion(ESTADO_INICIAL, { tipo: 'ARMAR' })).toEqual({ fase: 'ELIGIENDO' })
  })

  it('ARMAR no hace nada si ya no está inactivo', () => {
    const enviando = { fase: 'ENVIANDO', operacion: 'REVISION' } as const
    expect(reducirConfirmacion(enviando, { tipo: 'ARMAR' })).toBe(enviando)
  })

  it('elegir revisión inicia SÓLO esa operación', () => {
    const resultado = reducirConfirmacion({ fase: 'ELIGIENDO' }, { tipo: 'ENVIAR', operacion: 'REVISION' })
    expect(resultado).toEqual({ fase: 'ENVIANDO', operacion: 'REVISION' })
  })

  it('elegir nuevo inicia SÓLO esa operación', () => {
    const resultado = reducirConfirmacion({ fase: 'ELIGIENDO' }, { tipo: 'ENVIAR', operacion: 'NUEVO' })
    expect(resultado).toEqual({ fase: 'ENVIANDO', operacion: 'NUEVO' })
  })

  it('ENVIAR permite reintentar desde ERROR con la operación pedida', () => {
    const error = { fase: 'ERROR', operacion: 'NUEVO', mensaje: 'x' } as const
    expect(reducirConfirmacion(error, { tipo: 'ENVIAR', operacion: 'NUEVO' }))
      .toEqual({ fase: 'ENVIANDO', operacion: 'NUEVO' })
  })

  it('ENVIANDO ignora cualquier segundo envío, sea la misma operación o la otra', () => {
    const enviando = { fase: 'ENVIANDO', operacion: 'REVISION' } as const
    expect(reducirConfirmacion(enviando, { tipo: 'ENVIAR', operacion: 'REVISION' })).toBe(enviando)
    expect(reducirConfirmacion(enviando, { tipo: 'ENVIAR', operacion: 'NUEVO' })).toBe(enviando)
  })

  it('ENVIAR no hace nada desde INACTIVO', () => {
    expect(reducirConfirmacion(ESTADO_INICIAL, { tipo: 'ENVIAR', operacion: 'REVISION' })).toEqual(ESTADO_INICIAL)
  })

  it('FALLO conserva la operación elegida para reintentar y muestra el mensaje', () => {
    const resultado = reducirConfirmacion(
      { fase: 'ENVIANDO', operacion: 'NUEVO' }, { tipo: 'FALLO', mensaje: 'no se pudo copiar' },
    )
    expect(resultado).toEqual({ fase: 'ERROR', operacion: 'NUEVO', mensaje: 'no se pudo copiar' })
  })

  it('FALLO fuera de ENVIANDO no hace nada', () => {
    const eligiendo = { fase: 'ELIGIENDO' } as const
    expect(reducirConfirmacion(eligiendo, { tipo: 'FALLO', mensaje: 'x' })).toBe(eligiendo)
  })

  it('CANCELAR vuelve a INACTIVO desde ELIGIENDO o ERROR', () => {
    expect(reducirConfirmacion({ fase: 'ELIGIENDO' }, { tipo: 'CANCELAR' })).toEqual({ fase: 'INACTIVO' })
    expect(reducirConfirmacion({ fase: 'ERROR', operacion: 'REVISION', mensaje: 'x' }, { tipo: 'CANCELAR' }))
      .toEqual({ fase: 'INACTIVO' })
  })

  it('CANCELAR no interrumpe una escritura ya iniciada', () => {
    const enviando = { fase: 'ENVIANDO', operacion: 'NUEVO' } as const
    expect(reducirConfirmacion(enviando, { tipo: 'CANCELAR' })).toBe(enviando)
  })

  it('EXITO vuelve a INACTIVO desde ENVIANDO, antes de navegar', () => {
    expect(reducirConfirmacion({ fase: 'ENVIANDO', operacion: 'REVISION' }, { tipo: 'EXITO' }))
      .toEqual({ fase: 'INACTIVO' })
  })
})
