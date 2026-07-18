'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarArticulo, type EstadoFormulario } from '../_lib/acciones.ts'

export interface DatosArticulo {
  codigo: string
  descripcion: string
  familiaCodigo: string | null
  subfamiliaCodigo: string | null
  tipoMetraje: string
  metrajeMinimo: string | null
  metrajeMultiploLargo: string | null
  metrajeMultiploAncho: string | null
  pesoMl: string | null
  grosorPesoVidrio: string | null
  tamJunquilloGoma: string | null
  proveedorHabitual: string | null
  apareceEnHojaDespiece: boolean
  apareceEnHojaCorte: boolean
  controlaStock: boolean
}

export interface Opcion { codigo: string; descripcion: string }

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'

function estiloEntrada(hayError?: boolean) {
  return {
    background: 'var(--al-surface)',
    borderColor: hayError ? 'var(--al-error)' : 'var(--al-border-strong)',
    color: 'var(--al-text)',
  }
}

function Campo({
  nombre, etiqueta, valor, errores, tipo = 'text', span = 2, requerido = false, ayuda,
}: {
  nombre: string; etiqueta: string; valor?: string | number | null
  errores?: string[]; tipo?: string; span?: number; requerido?: boolean; ayuda?: string
}) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label htmlFor={nombre} className="mb-1 block text-sm font-medium">
        {etiqueta}
        {requerido && <span style={{ color: 'var(--al-error)' }}> *</span>}
      </label>
      <input
        id={nombre} name={nombre} type={tipo} defaultValue={valor ?? ''}
        inputMode={tipo === 'text' && ayuda?.includes('mm') ? 'decimal' : undefined}
        aria-invalid={errores ? true : undefined}
        className={entrada} style={estiloEntrada(!!errores)}
      />
      {ayuda && !errores && (
        <p className="mt-1 text-xs" style={{ color: 'var(--al-text-faint)' }}>{ayuda}</p>
      )}
      {errores && (
        <p className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>{errores.join('. ')}</p>
      )}
    </div>
  )
}

function Casilla({
  nombre, etiqueta, valor, ayuda,
}: { nombre: string; etiqueta: string; valor: boolean; ayuda: string }) {
  return (
    <label className="col-span-2 flex cursor-pointer gap-2.5">
      <input type="checkbox" name={nombre} defaultChecked={valor} className="mt-0.5" />
      <span>
        <span className="block text-sm font-medium">{etiqueta}</span>
        <span className="block text-xs" style={{ color: 'var(--al-text-faint)' }}>{ayuda}</span>
      </span>
    </label>
  )
}

export function FormularioArticulo({
  articulo, esNuevo, familias,
}: {
  articulo?: DatosArticulo
  esNuevo: boolean
  familias: Opcion[]
}) {
  const router = useRouter()
  const [metraje, setMetraje] = useState(articulo?.tipoMetraje ?? 'UD')

  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    async (previo, datos) => {
      const r = await guardarArticulo(previo, datos)
      if (r?.ok) router.push(`/dashboard/articulos/${encodeURIComponent(r.codigo)}`)
      return r
    },
    null,
  )

  const err = estado && !estado.ok ? estado.errores : {}

  return (
    <form action={accion} className="max-w-4xl">
      {esNuevo && <input type="hidden" name="_nuevo" value="1" />}

      {estado && !estado.ok && estado.mensaje && (
        <div className="mb-5 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}>
          No se pudo guardar: {estado.mensaje}
        </div>
      )}

      <fieldset className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <legend className="px-2 text-sm font-semibold">Identificación</legend>
        <div className="grid grid-cols-4 gap-4">
          {esNuevo ? (
            <Campo nombre="codigo" etiqueta="Código" valor={articulo?.codigo}
              errores={err.codigo} span={2} requerido />
          ) : (
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Código</label>
              <input type="hidden" name="codigo" value={articulo!.codigo} />
              <p className="cifra rounded-md border px-3 py-2 text-sm"
                style={{ background: 'var(--al-surface-muted)', borderColor: 'var(--al-border)', textAlign: 'left' }}>
                {articulo!.codigo}
              </p>
            </div>
          )}

          <div className="col-span-2">
            <label htmlFor="familiaCodigo" className="mb-1 block text-sm font-medium">Familia</label>
            <select id="familiaCodigo" name="familiaCodigo"
              defaultValue={articulo?.familiaCodigo ?? ''}
              className={entrada} style={estiloEntrada(!!err.familiaCodigo)}>
              <option value="">— Sin familia —</option>
              {familias.map((f) => (
                <option key={f.codigo} value={f.codigo}>{f.codigo} · {f.descripcion}</option>
              ))}
            </select>
          </div>

          <Campo nombre="descripcion" etiqueta="Descripción" valor={articulo?.descripcion}
            errores={err.descripcion} span={4} requerido />
          <Campo nombre="subfamiliaCodigo" etiqueta="Subfamilia"
            valor={articulo?.subfamiliaCodigo} errores={err.subfamiliaCodigo} />
          <Campo nombre="proveedorHabitual" etiqueta="Proveedor habitual"
            valor={articulo?.proveedorHabitual} errores={err.proveedorHabitual} />
        </div>
      </fieldset>

      <fieldset className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <legend className="px-2 text-sm font-semibold">Medida y consumo</legend>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <label htmlFor="tipoMetraje" className="mb-1 block text-sm font-medium">
              Unidad de medida <span style={{ color: 'var(--al-error)' }}>*</span>
            </label>
            <select id="tipoMetraje" name="tipoMetraje" value={metraje}
              onChange={(e) => setMetraje(e.target.value)}
              className={entrada} style={estiloEntrada(!!err.tipoMetraje)}>
              <option value="UD">UD — Unidad (herrajes, accesorios)</option>
              <option value="ML">ML — Metro lineal (perfiles)</option>
              <option value="M2">M2 — Metro cuadrado (vidrio, paneles)</option>
            </select>
            <p className="mt-1 text-xs" style={{ color: 'var(--al-text-faint)' }}>
              Determina cómo se calcula el consumo en el despiece.
            </p>
          </div>

          {metraje === 'ML' && (
            <>
              <Campo nombre="metrajeMinimo" etiqueta="Metraje mínimo"
                valor={articulo?.metrajeMinimo} errores={err.metrajeMinimo}
                ayuda="Se factura al menos esta longitud aunque el corte sea menor." />
              <Campo nombre="metrajeMultiploLargo" etiqueta="Múltiplo de largo"
                valor={articulo?.metrajeMultiploLargo} errores={err.metrajeMultiploLargo}
                ayuda="El consumo se redondea a múltiplos de este valor." />
              <Campo nombre="pesoMl" etiqueta="Peso por metro lineal"
                valor={articulo?.pesoMl} errores={err.pesoMl} ayuda="kg/m, para transporte." />
            </>
          )}

          {metraje === 'M2' && (
            <>
              <Campo nombre="metrajeMultiploAncho" etiqueta="Múltiplo de ancho"
                valor={articulo?.metrajeMultiploAncho} errores={err.metrajeMultiploAncho} />
              <Campo nombre="grosorPesoVidrio" etiqueta="Grosor"
                valor={articulo?.grosorPesoVidrio} errores={err.grosorPesoVidrio} ayuda="En mm." />
              <Campo nombre="tamJunquilloGoma" etiqueta="Junquillo / goma"
                valor={articulo?.tamJunquilloGoma} errores={err.tamJunquilloGoma}
                ayuda="Condiciona qué perfiles lo admiten." />
            </>
          )}
        </div>
      </fieldset>

      <fieldset className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
        <legend className="px-2 text-sm font-semibold">Comportamiento</legend>
        <div className="grid grid-cols-6 gap-4">
          <Casilla nombre="apareceEnHojaDespiece" etiqueta="Hoja de despiece"
            valor={articulo?.apareceEnHojaDespiece ?? true}
            ayuda="Aparece en el listado de materiales." />
          <Casilla nombre="apareceEnHojaCorte" etiqueta="Hoja de corte"
            valor={articulo?.apareceEnHojaCorte ?? true}
            ayuda="Entra en la optimización de corte." />
          <Casilla nombre="controlaStock" etiqueta="Controla stock"
            valor={articulo?.controlaStock ?? false}
            ayuda="Descuenta existencias al fabricar." />
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={enviando}
          className="rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          {enviando ? 'Guardando…' : esNuevo ? 'Crear artículo' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.push('/dashboard/articulos')}
          className="rounded-md border px-5 py-2 text-sm"
          style={{ borderColor: 'var(--al-border-strong)' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
