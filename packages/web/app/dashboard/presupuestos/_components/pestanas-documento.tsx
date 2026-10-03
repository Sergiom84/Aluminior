import Link from 'next/link'

export function PestanasDocumento({
  vista, fichaHref,
}: {
  vista: 'lista' | 'ficha'
  fichaHref?: string | null
}) {
  const fichaActiva = vista === 'ficha'
  const fichaDisponible = Boolean(fichaHref)

  return (
    <nav className="al-document-tabs" aria-label="Vistas del documento">
      <Link href="/dashboard/presupuestos" aria-current={vista === 'lista' ? 'page' : undefined}>
        Lista
      </Link>
      {fichaActiva || fichaDisponible ? (
        <Link href={fichaHref ?? '#'} aria-current={fichaActiva ? 'page' : undefined}>
          Ficha
        </Link>
      ) : (
        <span aria-disabled="true">Ficha</span>
      )}
    </nav>
  )
}

export type PaginaFicha = 'presupuesto' | 'gastos'

export function PestanasFicha({ activa = 'presupuesto', fichaHref }: { activa?: PaginaFicha; fichaHref: string }) {
  return (
    <nav className="al-document-tabs al-ficha-tabs" aria-label="Páginas de la ficha">
      <Link href={fichaHref} aria-current={activa === 'presupuesto' ? 'page' : undefined}>Presupuesto</Link>
      <span aria-disabled="true">Datos Adicionales</span>
      <span aria-disabled="true">Plazos</span>
      <Link href={`${fichaHref}?pagina=gastos`} aria-current={activa === 'gastos' ? 'page' : undefined}>Gastos</Link>
    </nav>
  )
}
