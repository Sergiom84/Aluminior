import { describe, expect, it, vi } from 'vitest'
import { enfocarEdicion } from './foco-edicion.ts'

function formulario(destinos: Record<string, { focus: () => void }>) {
  return { querySelector: (selector: string) => destinos[selector] ?? null } as unknown as HTMLFormElement
}

describe('foco en la edición del documento', () => {
  it('abre en el primer campo editable cuando no se especifica un foco inicial', () => {
    const entrada = { focus: vi.fn() }
    enfocarEdicion(null, formulario({ 'input:not([type="hidden"]), select, textarea': entrada }))
    expect(entrada.focus).toHaveBeenCalledOnce()
  })

  it('lleva un fallo al campo inválido antes que al mensaje general', () => {
    const campo = { focus: vi.fn() }
    const alerta = { focus: vi.fn() }
    enfocarEdicion({ ok: false, errores: { cantidad: ['Cantidad inválida'] }, mensaje: 'No se guardó' },
      formulario({ '[aria-invalid="true"]': campo, '[role="alert"]': alerta }))
    expect(campo.focus).toHaveBeenCalledOnce()
    expect(alerta.focus).not.toHaveBeenCalled()
  })

  it('enfoca el error del servidor cuando no pertenece a un campo visible', () => {
    const alerta = { focus: vi.fn() }
    enfocarEdicion({ ok: false, errores: {}, mensaje: 'No se pudo confirmar el guardado' },
      formulario({ '[role="alert"]': alerta }))
    expect(alerta.focus).toHaveBeenCalledOnce()
  })
})
