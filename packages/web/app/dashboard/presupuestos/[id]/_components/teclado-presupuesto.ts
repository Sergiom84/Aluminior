type Tecla = Pick<KeyboardEvent, 'key' | 'defaultPrevented' | 'repeat' | 'isComposing' | 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'preventDefault'>

/** F7 lleva a la inserción existente; F9 graba exclusivamente la ficha con foco. */
export function ejecutarAtajoPresupuesto(evento: Tecla, documento: Document): boolean {
  if (evento.defaultPrevented || evento.repeat || evento.isComposing ||
    evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey ||
    documento.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return false

  if (evento.key === 'F7') {
    const configurador = documento.getElementById('configurador')
    if (!configurador) return false
    evento.preventDefault()
    configurador.focus()
    return true
  }
  if (evento.key !== 'F9') return false
  const formulario = documento.activeElement?.closest<HTMLFormElement>('form[data-guardar-ficha]')
  if (formulario?.querySelector('[role="combobox"][aria-expanded="true"]')) return false
  const aceptar = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]:not(:disabled):not([aria-disabled="true"])')
  if (!formulario || !aceptar) return false
  evento.preventDefault()
  formulario.requestSubmit(aceptar)
  return true
}
