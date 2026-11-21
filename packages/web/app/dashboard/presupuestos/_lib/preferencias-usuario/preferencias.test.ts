import { describe, expect, it, vi } from 'vitest'
import {
  guardarPrecioHoraColocacion, leerPrecioHoraColocacion, normalizarClaveUsuario, validarPrecioHoraColocacion,
} from './preferencias.ts'

describe('preferencias exclusivas por usuario', () => {
  it('normaliza la clave de usuario y rechaza vacíos', () => {
    expect(normalizarClaveUsuario('  Usuario02@Taller.ES ')).toBe('usuario02@taller.es')
    expect(normalizarClaveUsuario('   ')).toBeNull()
    expect(normalizarClaveUsuario(null)).toBeNull()
  })

  it('valida el precio por hora con máximo 2 decimales y mayor que cero', () => {
    expect(validarPrecioHoraColocacion('40')).toBe('40.00')
    expect(validarPrecioHoraColocacion('35.5')).toBe('35.50')
    expect(validarPrecioHoraColocacion('0')).toBeNull()
    expect(validarPrecioHoraColocacion('-30')).toBeNull()
    expect(validarPrecioHoraColocacion('30.123')).toBeNull()
    expect(validarPrecioHoraColocacion('40,5')).toBeNull()
  })

  it('devuelve 30.00 por defecto sin consultar la BD cuando no hay usuario', async () => {
    const select = vi.fn()
    expect(await leerPrecioHoraColocacion({ select } as never, null)).toBe('30.00')
    expect(select).not.toHaveBeenCalled()
  })

  it('lee el precio guardado o cae a 30.00 si el usuario aún no tiene fila', async () => {
    const porUsuario = new Map<string, string>([['usuario02@taller.es', '40.00']])
    const crearDbFalsa = (claveConsultada: string) => ({
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => porUsuario.has(claveConsultada)
              ? [{ precioHoraColocacion: porUsuario.get(claveConsultada)! }]
              : [],
          }),
        }),
      }),
    })
    expect(await leerPrecioHoraColocacion(crearDbFalsa('usuario02@taller.es') as never, 'Usuario02@Taller.ES')).toBe('40.00')
    expect(await leerPrecioHoraColocacion(crearDbFalsa('usuario01@taller.es') as never, 'usuario01@taller.es')).toBe('30.00')
  })

  it('guarda exclusivamente bajo la clave del usuario actual', async () => {
    const onConflictDoUpdate = vi.fn(async () => undefined)
    const values = vi.fn(() => ({ onConflictDoUpdate }))
    const insert = vi.fn(() => ({ values }))

    const guardado = await guardarPrecioHoraColocacion({ insert } as never, 'Usuario02@Taller.ES', '40')
    expect(guardado).toBe('40.00')
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      usuarioClave: 'usuario02@taller.es',
      precioHoraColocacion: '40.00',
    }))
    expect(onConflictDoUpdate).toHaveBeenCalledOnce()
  })
})
