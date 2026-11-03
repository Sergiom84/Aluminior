import Link from 'next/link'
import { Shell } from '../../_components/shell.tsx'
import { leerCatalogoUniones } from '../../../../lib/catalogo-uniones/leer.ts'
import { BuscarUniones } from './_components/buscar-uniones.tsx'
import { etiquetaTipoUnion } from './_lib/tipos-union.ts'

export const dynamic = 'force-dynamic'

export default async function Uniones({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().toLowerCase()
  const catalogo = await leerCatalogoUniones()
  const filas = catalogo.uniones.filter(union => !q || `${union.codigo} ${union.descripcion}`.toLowerCase().includes(q))

  return <Shell moduloActivo="articulos">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <BuscarUniones q={q} />
      {catalogo.tabla
        ? <Link href="/dashboard/articulos/uniones/nueva" className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>Nueva</Link>
        : <span>Migración 0034 pendiente</span>}
    </div>
    <div className="overflow-auto rounded-lg border" style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <table className="w-full text-sm">
        <thead><tr>
          {['Código', 'Descripción', 'Grosor', 'L1', 'L2', 'Tipo', ''].map(titulo =>
            <th key={titulo} className="border-b px-3 py-2 text-left font-medium" style={{ borderColor: 'var(--al-border)' }}>{titulo}</th>)}
        </tr></thead>
        <tbody>
          {filas.map(union => <tr key={union.codigo} className="border-b" style={{ borderColor: 'var(--al-border)' }}>
            <td className="px-3 py-2 cifra">{union.codigo}</td>
            <td className="px-3 py-2">{union.descripcion}</td>
            <td className="px-3 py-2 cifra">{union.grosorMm}</td>
            <td className="px-3 py-2 cifra">{union.l1Mm ?? ''}</td>
            <td className="px-3 py-2 cifra">{union.l2Mm ?? ''}</td>
            <td className="px-3 py-2">{etiquetaTipoUnion(union.unionTipo ?? 0)}</td>
            <td className="px-3 py-2">{catalogo.tabla &&
              <Link href={`/dashboard/articulos/uniones/${encodeURIComponent(union.codigo)}`}>Editar</Link>}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </Shell>
}
