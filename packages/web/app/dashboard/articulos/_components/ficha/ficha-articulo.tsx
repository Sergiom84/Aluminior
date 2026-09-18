'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarArticulo, siguienteCodigoArticulo, type EstadoFormulario } from '../../_lib/acciones.ts'
import type { ArticuloFicha, CatalogosFicha, FilaCoste, FilaPvp } from '../../_lib/ficha/consulta.ts'
import { BarraFicha } from './barra-ficha.tsx'
import { CabeceraArticulo } from './cabecera-articulo.tsx'
import { PestanaCoste } from './pestana-coste.tsx'
import { PestanaGeneral } from './pestana-general.tsx'
import { PestanaProduccion, PestanaProveedor, PestanaStock } from './pestanas-complementarias.tsx'
import { PestanasFicha, type IdPestana } from './pestanas-ficha.tsx'
import s from './ficha-articulo.module.css'

const ARTICULO_NUEVO: ArticuloFicha = {
  codigo: '', descripcion: '', familiaCodigo: null, subfamiliaCodigo: null, tipoMetraje: 'ML',
  metrajeMinimo: null, metrajeMultiploLargo: null, metrajeMultiploAncho: null, pesoMl: null,
  grosorPesoVidrio: null, tamJunquilloGoma: null, proveedorHabitual: null,
  apareceEnHojaDespiece: true, apareceEnHojaCorte: true, controlaStock: false,
}

/** `Artículos. Detalle`: alta y edición con la estructura de Productor. */
export function FichaArticulo({
  articulo, pvp = [], costes = [], catalogos, anterior = null, siguiente = null,
}: {
  articulo: ArticuloFicha | null
  pvp?: FilaPvp[]
  costes?: FilaCoste[]
  catalogos: CatalogosFicha
  anterior?: string | null
  siguiente?: string | null
}) {
  const router = useRouter()
  const esNuevo = articulo === null
  const a = articulo ?? ARTICULO_NUEVO
  const formulario = useRef<HTMLFormElement>(null)
  const [pestana, setPestana] = useState<IdPestana>('general')
  const [modificado, setModificado] = useState(false)
  const [confirmandoCierre, setConfirmandoCierre] = useState(false)
  const [codigoPropuesto, setCodigoPropuesto] = useState<string | null>(null)

  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    async (previo, datos) => {
      const r = await guardarArticulo(previo, datos)
      if (r?.ok) router.push(`/dashboard/articulos?q=${encodeURIComponent(r.codigo)}`)
      return r
    },
    null,
  )
  const errores = estado && !estado.ok ? estado.errores : {}

  function cerrar() {
    if (modificado) setConfirmandoCierre(true)
    else router.push('/dashboard/articulos')
  }

  useEffect(() => {
    function atajos(e: KeyboardEvent) {
      if (e.key === 'F9') { e.preventDefault(); formulario.current?.requestSubmit() }
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); cerrar() }
    }
    window.addEventListener('keydown', atajos)
    return () => window.removeEventListener('keydown', atajos)
  })

  useEffect(() => {
    const primerError = Object.keys(errores)[0]
    if (!primerError) return
    if (['pesoMl', 'metrajeMinimo', 'metrajeMultiploLargo', 'metrajeMultiploAncho'].includes(primerError)) setPestana('general')
    if (primerError === 'proveedorHabitual') setPestana('proveedor')
    if (['tamJunquilloGoma', 'grosorPesoVidrio'].includes(primerError)) setPestana('produccion')
  }, [estado])

  return (
    <section className="al-document-window" aria-labelledby="titulo-articulo">
      <header className="al-document-heading">
        <h2 id="titulo-articulo">Artículos. Detalle</h2>
      </header>

      <form ref={formulario} action={accion} noValidate
        onChange={(e) => { if (!(e.target as { name?: string }).name?.startsWith('_')) setModificado(true) }}>
        {esNuevo && <input type="hidden" name="_nuevo" value="1" />}
        <BarraFicha esNuevo={esNuevo} enviando={enviando} anterior={anterior} siguiente={siguiente}
          confirmandoCierre={confirmandoCierre} onCerrar={cerrar}
          onConfirmarCierre={() => router.push('/dashboard/articulos')}
          onCancelarCierre={() => setConfirmandoCierre(false)}
          onSiguienteCodigo={async () => { setCodigoPropuesto(await siguienteCodigoArticulo()); setModificado(true) }} />

        {estado && !estado.ok && estado.mensaje && (
          <p className="al-form-alert" role="alert"
            style={{ borderColor: 'var(--al-error)', background: 'var(--al-error-soft)' }}>
            No se pudo grabar: {estado.mensaje}
          </p>
        )}

        <CabeceraArticulo datos={a} esNuevo={esNuevo} catalogos={catalogos} errores={errores}
          codigoPropuesto={codigoPropuesto} />

        <div className={s.panel}>
          <div id="panel-general" role="tabpanel" aria-labelledby="pestana-general" hidden={pestana !== 'general'}>
            <PestanaGeneral datos={a} pvp={pvp} errores={errores} />
          </div>
          <div id="panel-coste" role="tabpanel" aria-labelledby="pestana-coste" hidden={pestana !== 'coste'}>
            <PestanaCoste costes={costes} />
          </div>
          <div id="panel-proveedor" role="tabpanel" aria-labelledby="pestana-proveedor" hidden={pestana !== 'proveedor'}>
            <PestanaProveedor valor={a.proveedorHabitual} proveedores={catalogos.proveedores}
              errores={errores.proveedorHabitual} />
          </div>
          <div id="panel-stock" role="tabpanel" aria-labelledby="pestana-stock" hidden={pestana !== 'stock'}>
            <PestanaStock valor={a.controlaStock} />
          </div>
          <div id="panel-produccion" role="tabpanel" aria-labelledby="pestana-produccion" hidden={pestana !== 'produccion'}>
            <PestanaProduccion hojaCorte={a.apareceEnHojaCorte} hojaDespiece={a.apareceEnHojaDespiece}
              tamJunquilloGoma={a.tamJunquilloGoma} grosorPesoVidrio={a.grosorPesoVidrio} errores={errores} />
          </div>
        </div>
      </form>

      <PestanasFicha activa={pestana} onCambiar={setPestana} />
      <nav className="al-document-tabs" aria-label="Vistas de artículos">
        <Link href="/dashboard/articulos">Lista</Link>
        <span aria-current="page" style={{ background: 'var(--al-surface)', boxShadow: 'inset 0 2px 0 var(--al-accent)' }}>
          Ficha
        </span>
      </nav>
    </section>
  )
}
