'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { precioLinealUnion } from '@aluminior/core/estructuras'
import { buscarPerfiles, consultarPrecioPerfil, guardarUnionAction, type EstadoUnion } from '../_lib/acciones.ts'
import { SelectorImagen } from './selector-imagen.tsx'
import { TIPOS_UNION } from '../_lib/tipos-union.ts'

const importe = (valor: number, decimales = 2) =>
  valor.toLocaleString('es-ES', { minimumFractionDigits: decimales, maximumFractionDigits: 4 })

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
    <Campo nombre="descripcion" etiqueta="Descripción" defecto={valores.descripcion} errores={errores} texto />
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
    {sugerencias.length > 0 && <ul aria-label="Perfiles" className="al-union-sugerencias">
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
        {TIPOS_UNION.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
      </select>
    </label>
    <Campo nombre="manoObra" etiqueta="Mano obra" defecto={valores.manoObra} errores={errores} soloLectura={recetaProtegida} />
    <label className="al-union-casilla">
      <input name="deUsuario" type="checkbox" value="1" defaultChecked={valores.deUsuario} />De usuario
    </label>
    <label className="al-union-casilla">
      <input name="seriesEspecificas" type="checkbox" value="1" defaultChecked={valores.seriesEspecificas} />Series específicas
    </label>
    <fieldset>
      <legend>Series</legend>
      {series.map(serie => <label key={serie} className="al-union-casilla cifra">
        <input type="checkbox" name="series" value={serie} defaultChecked={valores.series.includes(serie)} />
        {serie}
      </label>)}
    </fieldset>
    <SelectorImagen nombres={imagenes} valor={valores.imagen} />
    <label>Precio
      <input readOnly className="cifra" value={precio ? `${importe(Number(precio.eurosPorMetro))} €/m ${precio.acabado}` : ''} />
    </label>
    <label>400 mm
      <input readOnly className="cifra" value={preview == null ? '' : `${importe(preview)} €`} />
    </label>
    {estado && !estado.ok && estado.mensaje && <p role="alert">{estado.mensaje}</p>}
    <button type="submit" className="al-union-aceptar">Aceptar F9</button>
  </form>
}

function Campo({ nombre, etiqueta, defecto, errores, soloLectura = false, texto = false }: {
  nombre: string; etiqueta: string; defecto: string; errores: Record<string, string[]>; soloLectura?: boolean
  /** Texto libre: sin la alineación de cifras. */
  texto?: boolean
}) {
  return <label>{etiqueta}
    <input name={nombre} defaultValue={defecto} readOnly={soloLectura} aria-invalid={errores[nombre] ? true : undefined}
      className={texto ? undefined : 'cifra'} />
    {errores[nombre] && <span role="alert">{errores[nombre].join('. ')}</span>}
  </label>
}
