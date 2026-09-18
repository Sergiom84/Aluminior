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

export function PestanasFicha({ activa = 'presupuesto' }: { activa?: 'presupuesto' }) {
  return (
    <nav className="al-document-tabs al-ficha-tabs" aria-label="Páginas de la ficha">
      <span aria-current={activa === 'presupuesto' ? 'page' : undefined}>Presupuesto</span>
      <span aria-disabled="true">Datos Adicionales</span>
      <span aria-disabled="true">Plazos</span>
      <span aria-disabled="true">Gastos</span>
    </nav>
  )
}
