import { describe, expect, it, vi } from 'vitest'
import { ejecutarAtajoPresupuesto } from './teclado-presupuesto.ts'

const tecla = (key: string, cambios: Partial<KeyboardEvent> = {}) => ({
  key, defaultPrevented: false, repeat: false, isComposing: false,
  altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, preventDefault: vi.fn(), ...cambios,
})

function ficha({ modal = false, conFoco = true, habilitado = true, insercion = true, comboAbierto = false } = {}) {
  const aceptar = {}
  const configurador = { focus: vi.fn() }
  const formulario = { requestSubmit: vi.fn(), querySelector: vi.fn((selector: string) => {
    if (selector.startsWith('[role="combobox"]')) return comboAbierto ? {} : null
    return habilitado ? aceptar : null
  }) }
  const documento = {
    querySelector: vi.fn(() => modal ? {} : null),
    getElementById: vi.fn(() => insercion ? configurador : null),
    activeElement: { closest: vi.fn(() => conFoco ? formulario : null) },
  } as unknown as Document
  return { documento, formulario, aceptar, configurador }
}

describe('atajos observados del presupuesto', () => {
  it('F7 enfoca la inserción existente sin enviar ni reiniciar una edición', () => {
    const { documento, configurador, formulario } = ficha()
    const evento = tecla('F7')
    expect(ejecutarAtajoPresupuesto(evento, documento)).toBe(true)
    expect(configurador.focus).toHaveBeenCalledOnce()
    expect(formulario.requestSubmit).not.toHaveBeenCalled()
    expect(evento.preventDefault).toHaveBeenCalledOnce()
  })

  it('F9 usa el submit de la ficha con foco para conservar su validación nativa', () => {
    const { documento, formulario, aceptar } = ficha()
    expect(ejecutarAtajoPresupuesto(tecla('F9'), documento)).toBe(true)
    expect(formulario.requestSubmit).toHaveBeenCalledExactlyOnceWith(aceptar)
    expect(documento.activeElement?.closest).toHaveBeenCalledWith('form[data-guardar-ficha]')
  })

  it.each(['F7', 'F9'])('%s no opera sobre el presupuesto mientras un diálogo está abierto', key => {
    const { documento, configurador, formulario } = ficha({ modal: true })
    const evento = tecla(key)
    expect(ejecutarAtajoPresupuesto(evento, documento)).toBe(false)
    expect(configurador.focus).not.toHaveBeenCalled()
    expect(formulario.requestSubmit).not.toHaveBeenCalled()
    expect(evento.preventDefault).not.toHaveBeenCalled()
  })

  it.each([{ conFoco: false }, { habilitado: false }, { comboAbierto: true }])('F9 no busca otro formulario ni sortea un guardado bloqueado: %j', opciones => {
    const { documento, formulario } = ficha(opciones)
    const evento = tecla('F9')
    expect(ejecutarAtajoPresupuesto(evento, documento)).toBe(false)
    expect(formulario.requestSubmit).not.toHaveBeenCalled()
  })

  it('F7 no actúa en documentos que no admiten inserción', () => {
    const { documento, configurador } = ficha({ insercion: false })
    expect(ejecutarAtajoPresupuesto(tecla('F7'), documento)).toBe(false)
    expect(configurador.focus).not.toHaveBeenCalled()
  })

  it.each(['repeat', 'isComposing', 'defaultPrevented', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey'])(
    'ignora F9 cuando %s está activo', propiedad => {
      const { documento, formulario } = ficha()
      expect(ejecutarAtajoPresupuesto(tecla('F9', { [propiedad]: true }), documento)).toBe(false)
      expect(formulario.requestSubmit).not.toHaveBeenCalled()
    },
  )
})
