'use client'

import Form from 'next/form'
import Link from 'next/link'
import { useState } from 'react'
import {
  TIPOS_BUSQUEDA, TIPO_BUSQUEDA_POR_DEFECTO, ejemploTipoBusqueda, type TipoBusqueda,
} from '../_lib/busqueda-tipo/tipos.ts'

const MODO_TECLADO: Partial<Record<TipoBusqueda, 'tel' | 'decimal'>> = {
  telefono: 'tel',
  precio: 'decimal',
}

/** Un único campo con el tipo de búsqueda elegido; el estado vive en la URL. */
export function BuscadorPresupuestos({
  tipoInicial, consultaInicial, filtrado,
}: {
  tipoInicial: TipoBusqueda
  consultaInicial: string
  filtrado: boolean
}) {
  const [tipo, setTipo] = useState<TipoBusqueda>(tipoInicial)
  const limpiar = tipo === TIPO_BUSQUEDA_POR_DEFECTO
    ? '/dashboard/presupuestos'
    : `/dashboard/presupuestos?tipo=${tipo}`

  return (
    <Form action="/dashboard/presupuestos" className="al-search al-search-tipo" role="search">
      <label htmlFor="buscar-presupuesto-tipo" className="al-search-label">Buscar por</label>
      <select id="buscar-presupuesto-tipo" name="tipo" value={tipo}
        onChange={(evento) => setTipo(evento.target.value as TipoBusqueda)}>
        {TIPOS_BUSQUEDA.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
        ))}
      </select>
      <label htmlFor="buscar-presupuesto" className="sr-only">Texto a buscar</label>
      <input id="buscar-presupuesto" name="q" type="search" defaultValue={consultaInicial}
        placeholder={ejemploTipoBusqueda(tipo)} inputMode={MODO_TECLADO[tipo]} autoComplete="off" />
      <button type="submit" className="al-command">Buscar</button>
      {filtrado && <Link href={limpiar} className="al-command">Limpiar</Link>}
    </Form>
  )
}
