import { beforeEach, describe, expect, it, vi } from 'vitest'

const { redirigir } = vi.hoisted(() => ({
  redirigir: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: redirigir }))

import Inicio from './page.tsx'

describe('entrada de la aplicación', () => {
  beforeEach(() => redirigir.mockClear())

  it('abre la lista operativa de presupuestos en vez de responder 404', () => {
    Inicio()
    expect(redirigir).toHaveBeenCalledOnce()
    expect(redirigir).toHaveBeenCalledWith('/dashboard/presupuestos')
  })
})
