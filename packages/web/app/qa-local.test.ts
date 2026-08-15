import { describe, expect, it } from 'vitest'
import { qaLocalActiva } from '../lib/qa-local.ts'

describe('qaLocalActiva', () => {
  it.each(['localhost', 'localhost:3000', '127.0.0.1:3000', '[::1]:3000'])(
    'sólo acepta loopback en desarrollo con opt-in: %s',
    (host) => {
      expect(qaLocalActiva({ entorno: 'development', flag: '1', host })).toBe(true)
    },
  )

  it.each([
    { entorno: 'production', flag: '1', host: 'localhost:3000' },
    { entorno: 'test', flag: '1', host: 'localhost:3000' },
    { entorno: 'development', flag: '0', host: 'localhost:3000' },
    { entorno: 'development', flag: undefined, host: 'localhost:3000' },
    { entorno: 'development', flag: '1', host: 'aluminior.onrender.com' },
    { entorno: 'development', flag: '1', host: '192.168.1.25:3000' },
    { entorno: 'development', flag: '1', host: null },
  ])('falla cerrado fuera del contrato local: $host / $entorno / $flag', (entrada) => {
    expect(qaLocalActiva(entrada)).toBe(false)
  })
})
