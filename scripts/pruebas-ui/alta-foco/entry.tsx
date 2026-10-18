import React from 'react'
import { createRoot } from 'react-dom/client'
import { AnyadirLinea } from '../../../packages/web/app/dashboard/presupuestos/[id]/_components/anyadir-linea.tsx'

createRoot(document.getElementById('root')!).render(
  <main style={{ padding: 12, maxWidth: 1200, margin: 'auto' }}>
    <h1>Presupuesto sintético QA</h1>
    <AnyadirLinea presupuestoId="QA-LOCAL" series={['QA-SERIE']}
      acabados={[{ codigo: 'L', descripcion: 'Acabado QA' }]} />
  </main>,
)
