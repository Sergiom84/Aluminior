import { describe, expect, it } from 'vitest'
import { LIMITE_HISTORIAL, accionDeTeclado, deshacer, iniciarHistorial, registrar, rehacer } from './historial.ts'

const tecla = (key: string, extra: Partial<Parameters<typeof accionDeTeclado>[0]> = {}) =>
  accionDeTeclado({ key, ctrlKey: true, metaKey: false, shiftKey: false, altKey: false, target: null, ...extra })

describe('historial del diseñador', () => {
  it('deshace y rehace paso a paso; un cambio nuevo borra lo que se podía rehacer', () => {
    let h = registrar(registrar(iniciarHistorial('a'), 'b'), 'c')
    h = deshacer(h)
    expect(h.presente).toBe('b')
    h = deshacer(h)
    expect(h.presente).toBe('a')
    expect(deshacer(h)).toBe(h)
    h = rehacer(h)
    expect(h.presente).toBe('b')
    h = registrar(h, 'd')
    expect(h.futuro).toEqual([])
    expect(rehacer(h)).toBe(h)
    expect(deshacer(h).presente).toBe('b')
  })

  it('registrar el mismo valor no crea paso y el pasado se limita', () => {
    const h = iniciarHistorial(0)
    expect(registrar(h, 0)).toBe(h)
    let largo = h
    for (let i = 1; i <= LIMITE_HISTORIAL + 20; i++) largo = registrar(largo, i)
    expect(largo.pasado).toHaveLength(LIMITE_HISTORIAL)
    expect(largo.pasado[0]).toBe(20)
  })

  it('atajos: Ctrl+Z, Ctrl+Y y Ctrl+Mayús+Z; no en campos de texto ni sin Ctrl', () => {
    expect(tecla('z')).toBe('deshacer')
    expect(tecla('Z', { shiftKey: true })).toBe('rehacer')
    expect(tecla('y')).toBe('rehacer')
    expect(tecla('z', { ctrlKey: false, metaKey: true })).toBe('deshacer')
    expect(tecla('z', { ctrlKey: false })).toBeNull()
    expect(tecla('z', { altKey: true })).toBeNull()
    expect(tecla('z', { target: { tagName: 'INPUT', isContentEditable: false } as unknown as EventTarget })).toBeNull()
    expect(tecla('x')).toBeNull()
  })
})
