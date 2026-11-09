/**
 * Dashboard operativo. La agenda se lee en servidor; el navegador no toca
 * PostgreSQL. Informes sigue en el marcador hasta que tenga pantalla propia.
 */

import { fechaMadrid, rangoVisible, seleccionAgenda } from '@aluminior/core/agenda'
import { Shell, MODULOS } from './_components/shell.tsx'
import { PanelAgenda } from './agenda/_components/panel.tsx'
import { leerAgenda } from './agenda/_lib/consultas.ts'

export const dynamic = 'force-dynamic'

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; dia?: string; mes?: string }>
}) {
  const { module, dia, mes } = await searchParams
  const activo = MODULOS.some((m) => m.id === module) ? module! : 'dashboard'

  if (activo !== 'dashboard') {
    return (
      <Shell moduloActivo={activo}>
        <div
          className="rounded-lg border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--al-border-strong)' }}
        >
          <p style={{ color: 'var(--al-text-muted)' }}>Módulo en construcción.</p>
        </div>
      </Shell>
    )
  }

  const hoy = fechaMadrid()
  const seleccion = seleccionAgenda(hoy, dia, mes)
  const rango = seleccion ? rangoVisible(seleccion.dia, seleccion.mes) : null
  const datos = rango
    ? await leerAgenda(rango.desde, rango.hasta)
    : { ok: false as const, mensaje: 'No se pudo abrir la agenda' }

  return (
    <Shell moduloActivo="dashboard">
      {datos.ok && seleccion ? (
        <PanelAgenda
          dia={seleccion.dia}
          mes={seleccion.mes}
          hoy={hoy}
          eventos={datos.eventos}
          notas={datos.notas}
        />
      ) : (
        <p role="alert">{datos.ok ? 'No se pudo abrir la agenda' : datos.mensaje}</p>
      )}
    </Shell>
  )
}
