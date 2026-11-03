'use client'

import { useMemo, useState } from 'react'
import { esDibujoUnion } from '../../../../../lib/catalogo-uniones/nombres-dibujo.ts'

export function SelectorImagen({ nombres, valor }: { nombres: readonly string[]; valor: string }) {
  const [filtro, setFiltro] = useState('')
  const [elegida, setElegida] = useState(valor)
  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    const base = q ? nombres.filter(nombre => nombre.toLowerCase().includes(q)) : nombres.filter(esDibujoUnion)
    return base.slice(0, 48)
  }, [filtro, nombres])

  return <fieldset>
    <legend>Imagen</legend>
    <input name="imagen" type="hidden" value={elegida} />
    <label>Buscar
      <input value={filtro} onChange={evento => setFiltro(evento.target.value)} aria-label="Buscar imagen" />
    </label>
    <div className="al-union-imagenes" role="listbox" aria-label="Imágenes de unión">
      {visibles.map(nombre => (
        <button key={nombre} type="button" role="option" aria-selected={elegida === nombre}
          onClick={() => setElegida(nombre)}>
          <img src={`/dashboard/articulos/uniones/imagen?archivo=${encodeURIComponent(nombre)}`} alt={nombre} />
          <span className="cifra">{nombre.replace(/\.[^.]+$/, '')}</span>
        </button>
      ))}
    </div>
    {elegida && <img className="al-union-elegida" alt={elegida}
      src={`/dashboard/articulos/uniones/imagen?archivo=${encodeURIComponent(elegida)}`} />}
    <label>Subir
      <input name="archivo" type="file" accept="image/png,image/jpeg,image/webp" />
    </label>
  </fieldset>
}
