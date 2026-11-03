'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { precioLinealUnion } from '@aluminior/core/estructuras'
import { buscarPerfiles, consultarPrecioPerfil, guardarUnionAction, type EstadoUnion } from '../_lib/acciones.ts'
import { SelectorImagen } from './selector-imagen.tsx'

const TIPOS = [
  ['0', '1 Recto'],
  ['1', '2 Abatible-Corredera'],
  ['2', '3 90º'],
  ['3', '4 Regulable (Tubo)'],
  ['4', '5 Regulable (Macho-Hembra)'],
] as const

export interface ValoresUnion {
  codigo: string
  descripcion: string
  cantidad: number
  perfiles: string[]
  grosor: string
  l1: string
  l2: string
  tipo: string
  manoObra: string
  deUsuario: boolean
  seriesEspecificas: boolean
  series: string[]
  imagen: string
}

export function FichaUnion({ nuevo, valores, series, imagenes, precioInicial, recetaProtegida = false }: {
  nuevo: boolean
  /** Receta importada de Productor: perfiles y mano de obra no se reescriben. */
  recetaProtegida?: boolean
  valores: ValoresUnion
  series: readonly string[]
  imagenes: readonly string[]
  precioInicial: { eurosPorMetro: string; acabado: string } | null
}) {
  const router = useRouter()
  const [estado, setEstado] = useState<EstadoUnion>(null)
  const [precio, setPrecio] = useState(precioInicial)
  const [sugerencias, setSugerencias] = useState<{ codigo: string; descripcion: string }[]>([])
  const [ranura, setRanura] = useState(1)
  const errores = estado && !estado.ok ? estado.errores : {}
  const preview = precio ? precioLinealUnion(0.4, Number(precio.eurosPorMetro)) : null

  async function enviar(formulario: FormData) {
    const resultado = await guardarUnionAction(null, formulario)
    setEstado(resultado)
    if (resultado?.ok) router.push(`/dashboard/articulos/uniones/${encodeURIComponent(resultado.codigo)}`)
  }

  return <form action={enviar} className="al-union-ficha" onKeyDown={evento => {
    if (evento.key === 'F5') { evento.preventDefault(); document.getElementById('perfil1')?.focus() }
    if (evento.key === 'F9') { evento.preventDefault(); evento.currentTarget.requestSubmit() }
  }}>
    {nuevo && <input type="hidden" name="_nuevo" value="1" />}
    <Campo nombre="codigo" etiqueta="Código" defecto={valores.codigo} soloLectura={!nuevo} errores={errores} />
    <Campo nombre="descripcion" etiqueta="Descripción" defecto={valores.descripcion} errores={errores} />
    <label>Cantidad
      <input name="cantidad" type="number" min={1} max={3} defaultValue={valores.cantidad} />
    </label>
    {[1, 2, 3].map(n => (
      <label key={n}>Perfil unión {n}
        <input id={`perfil${n}`} name={`perfil${n}`} defaultValue={valores.perfiles[n - 1] ?? ''} className="cifra"
          readOnly={recetaProtegida}
          onFocus={() => setRanura(n)}
          onChange={async evento => {
            if (recetaProtegida) return
            if (n === 1) setPrecio(await consultarPrecioPerfil(evento.target.value))
            setSugerencias(await buscarPerfiles(evento.target.value))
          }} />
      </label>
    ))}
    {sugerencias.length > 0 && <ul aria-label="Perfiles">
      {sugerencias.map(item => <li key={item.codigo}>
        <button type="button" onClick={() => {
          const campo = document.getElementById(`perfil${ranura}`) as HTMLInputElement | null
          if (campo) campo.value = item.codigo
          if (ranura === 1) void consultarPrecioPerfil(item.codigo).then(setPrecio)
          setSugerencias([])
        }}><span className="cifra">{item.codigo}</span> {item.descripcion}</button>
      </li>)}
    </ul>}
    <Campo nombre="grosor" etiqueta="Grosor" defecto={valores.grosor} errores={errores} />
    <Campo nombre="l1" etiqueta="L1" defecto={valores.l1} errores={errores} />
    <Campo nombre="l2" etiqueta="L2" defecto={valores.l2} errores={errores} />
    <label>Tipo de U.
      <select name="tipo" defaultValue={valores.tipo}>
        {TIPOS.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
      </select>
    </label>
    <Campo nombre="manoObra" etiqueta="Mano obra" defecto={valores.manoObra} errores={errores} soloLectura={recetaProtegida} />
    <label>De usuario
      <input name="deUsuario" type="checkbox" value="1" defaultChecked={valores.deUsuario} />
    </label>
    <label>Series específicas
      <input name="seriesEspecificas" type="checkbox" value="1" defaultChecked={valores.seriesEspecificas} />
    </label>
    <fieldset>
      <legend>Series</legend>
      {series.map(serie => <label key={serie} className="cifra">
        <input type="checkbox" name="series" value={serie} defaultChecked={valores.series.includes(serie)} />
        {serie}
      </label>)}
    </fieldset>
    <SelectorImagen nombres={imagenes} valor={valores.imagen} />
    <label>Precio
      <input readOnly className="cifra" value={precio ? `${precio.eurosPorMetro} €/m ${precio.acabado}` : ''} />
    </label>
    <label>400 mm
      <input readOnly className="cifra" value={preview == null ? '' : preview.toLocaleString('es-ES', { minimumFractionDigits: 2 })} />
    </label>
    {estado && !estado.ok && estado.mensaje && <p role="alert">{estado.mensaje}</p>}
    <button type="submit">Aceptar F9</button>
  </form>
}

function Campo({ nombre, etiqueta, defecto, errores, soloLectura = false }: {
  nombre: string; etiqueta: string; defecto: string; errores: Record<string, string[]>; soloLectura?: boolean
}) {
  return <label>{etiqueta}
    <input name={nombre} defaultValue={defecto} readOnly={soloLectura} aria-invalid={errores[nombre] ? true : undefined} className="cifra" />
    {errores[nombre] && <span role="alert">{errores[nombre].join('. ')}</span>}
  </label>
}
