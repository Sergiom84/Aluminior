import type { EstadoEdicion } from '../../_lib/edicion/estado.ts'

export function enfocarEdicion(estado: EstadoEdicion, formulario: HTMLFormElement | null) {
  const destino = estado
    ? formulario?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      formulario?.querySelector<HTMLElement>('[role="alert"]')
    : formulario?.querySelector<HTMLElement>('[data-foco-inicial]') ??
      formulario?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea') ??
      formulario?.querySelector<HTMLElement>('button:not(:disabled)')
  destino?.focus()
}
