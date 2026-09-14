import type { ResultadoDespunte } from '@aluminior/core/produccion'
import { euros } from './formato'

export function DespunteVista({ datos }: { datos: ResultadoDespunte | null }) {
  if (!datos) return null
  return <section aria-labelledby="despunte" className="rounded-md border p-3 text-sm" style={{ borderColor: 'var(--al-border)' }}>
    <h2 id="despunte" className="font-semibold">Coste técnico de despunte</h2>
    {datos.noValorables.length > 0 ? <p>Coste incompleto: {datos.noValorables.map(p => p.perfil).join(', ')}</p>
      : <dl className="mt-2 flex flex-wrap gap-6">
        <div><dt>Material necesario</dt><dd className="cifra">{euros(datos.costePerfilesYCortes)}</dd></div>
        <div><dt>Barras compradas</dt><dd className="cifra">{euros(datos.costeBarras)}</dd></div>
        <div><dt>Despunte</dt><dd className="cifra">{euros(datos.importeDespunte)}</dd></div>
      </dl>}
    <p className="mt-2">Sin cargo al presupuesto.</p>
  </section>
}
