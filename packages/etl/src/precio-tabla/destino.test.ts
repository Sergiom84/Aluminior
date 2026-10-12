import { describe, expect, it } from 'vitest'
import { destinoPrecioTabla } from './destino.ts'

describe('destino explícito del cargador dimensional', () => {
  it('por defecto sólo permite pruebas locales', () => {
    expect(destinoPrecioTabla({})).toMatchObject({ ssl: false, resumen: { tipo: 'pruebas locales', host: 'localhost' } })
    expect(() => destinoPrecioTabla({ url: 'postgres://usuario:clave@db.example.com/empresa' })).toThrow(/pruebas|efímero/)
    expect(() => destinoPrecioTabla({ url: 'postgres://usuario:clave@localhost/empresa' })).toThrow(/pruebas|efímero/)
  })
  it('remoto requiere autorización explícita del destino y TLS, con resumen sin credenciales', () => {
    expect(() => destinoPrecioTabla({ remoto: true })).toThrow('--url explícita')
    const d = destinoPrecioTabla({ remoto: true, url: 'postgresql://usuario:secreto@db.example.com:6543/empresa' })
    expect(d).toMatchObject({ ssl: 'require', resumen: { tipo: 'remoto', host: 'db.example.com', puerto: '6543', base: 'empresa' } })
    expect(JSON.stringify(d.resumen)).not.toMatch(/usuario|secreto/)
  })
  it('rechaza URL inválida, modo remoto local y parámetros que alteren el destino', () => {
    expect(() => destinoPrecioTabla({ remoto: true, url: 'no-es-url' })).toThrow('no válida')
    expect(() => destinoPrecioTabla({ remoto: true, url: 'postgres://localhost/empresa' })).toThrow('modo de pruebas')
    expect(() => destinoPrecioTabla({ remoto: true, url: 'postgres://db.example.com/empresa?sslmode=disable' })).toThrow('no válido')
  })
})
