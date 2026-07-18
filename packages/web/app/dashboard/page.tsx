/**
 * Dashboard. Server Component: la consulta a PostgreSQL ocurre en servidor,
 * nunca en el navegador. Es el requisito que motivó descartar el SDK de
 * cliente de Supabase (ver ARQUITECTURA.md apartado 2).
 */

import { sql } from 'drizzle-orm'
import { crearDb } from '@aluminior/db'
import { Shell, MODULOS } from './_components/shell.tsx'

export const dynamic = 'force-dynamic'

interface Conteo { tabla: string; n: number }

async function conteos(): Promise<Conteo[] | { error: string }> {
  try {
    const db = crearDb()
    const filas = await db.execute(sql`
      SELECT 'Artículos'   AS tabla, COUNT(*)::int AS n FROM articulos
      UNION ALL SELECT 'Estructuras', COUNT(*)::int FROM estructuras
      UNION ALL SELECT 'Clientes',    COUNT(*)::int FROM clientes
      UNION ALL SELECT 'Familias',    COUNT(*)::int FROM familias
      UNION ALL SELECT 'Acabados',    COUNT(*)::int FROM acabados
      UNION ALL SELECT 'Precios',     COUNT(*)::int FROM articulos_pvp
    `)
    return filas as unknown as Conteo[]
  } catch (e) {
    return { error: (e as Error).message }
  }
}

function Tarjeta({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{
        background: 'var(--al-surface)',
        borderColor: 'var(--al-border)',
        boxShadow: 'var(--al-shadow)',
      }}
    >
      <p className="text-sm" style={{ color: 'var(--al-text-muted)' }}>{titulo}</p>
      <p className="cifra mt-2 text-3xl font-semibold" style={{ textAlign: 'left' }}>
        {valor}
      </p>
    </div>
  )
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>
}) {
  const { module } = await searchParams
  const activo = MODULOS.some((m) => m.id === module) ? module! : 'inicio'
  const datos = await conteos()

  return (
    <Shell moduloActivo={activo}>
      {activo === 'inicio' ? (
        'error' in datos ? (
          <div
            className="rounded-lg border p-5"
            style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}
          >
            <p className="font-medium">No se pudo consultar la base de datos</p>
            <p className="mt-1 font-mono text-sm">{datos.error}</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--al-text-muted)' }}>
              Comprueba DATABASE_URL en el fichero .env de la raíz.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm" style={{ color: 'var(--al-text-muted)' }}>
              Datos migrados desde el sistema original.
            </p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {datos.map((c) => (
                <Tarjeta
                  key={c.tabla}
                  titulo={c.tabla}
                  valor={c.n.toLocaleString('es-ES')}
                />
              ))}
            </div>
          </>
        )
      ) : (
        <div
          className="rounded-lg border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}
        >
          <p style={{ color: 'var(--al-text-muted)' }}>Módulo en construcción.</p>
        </div>
      )}
    </Shell>
  )
}
