'use client'

import { useState } from 'react'
import { Shell } from '../../_components/shell.tsx'
import { Captura, type Interpretacion } from './_components/captura.tsx'
import { Revision } from './_components/revision.tsx'

/** Presupuesto a partir de una nota dictada o escrita. */
export default function DictadoPresupuesto() {
  const [interpretacion, setInterpretacion] = useState<Interpretacion | null>(null)
  return (
    <Shell moduloActivo="presupuestos">
      <div className="al-dictado">
        <header className="al-document-heading">
          <h1>Dictar presupuesto</h1>
        </header>
        {interpretacion
          ? <Revision interpretacion={interpretacion} onVolver={() => setInterpretacion(null)} />
          : <Captura onInterpretado={setInterpretacion} />}
      </div>
    </Shell>
  )
}
