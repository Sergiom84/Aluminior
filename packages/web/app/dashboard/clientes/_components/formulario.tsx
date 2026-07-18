'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarCliente, type EstadoFormulario } from '../_lib/acciones.ts'

export interface DatosCliente {
  codigo: string
  nombre: string
  nombreComercial: string | null
  nif: string | null
  direccion: string | null
  cp: string | null
  poblacion: string | null
  provincia: string | null
  pais: string | null
  personaContacto: string | null
  telefono: string | null
  telefonoMovil: string | null
  email: string | null
  tarifa: number
}

function Campo({
  nombre, etiqueta, valor, errores, tipo = 'text', ancho = 'normal', requerido = false,
}: {
  nombre: string
  etiqueta: string
  valor?: string | number | null
  errores?: string[]
  tipo?: string
  ancho?: 'estrecho' | 'normal' | 'ancho'
  requerido?: boolean
}) {
  const span = ancho === 'estrecho' ? 'col-span-1' : ancho === 'ancho' ? 'col-span-4' : 'col-span-2'
  return (
    <div className={span}>
      <label htmlFor={nombre} className="mb-1 block text-sm font-medium">
        {etiqueta}
        {requerido && <span style={{ color: 'var(--al-error)' }}> *</span>}
      </label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        defaultValue={valor ?? ''}
        aria-invalid={errores ? true : undefined}
        aria-describedby={errores ? `${nombre}-error` : undefined}
        className="w-full rounded-md border px-3 py-2 text-sm"
        style={{
          background: 'var(--al-surface)',
          borderColor: errores ? 'var(--al-error)' : 'var(--al-border-strong)',
          color: 'var(--al-text)',
        }}
      />
      {errores && (
        <p id={`${nombre}-error`} className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
          {errores.join('. ')}
        </p>
      )}
    </div>
  )
}

export function FormularioCliente({
  cliente, esNuevo,
}: {
  cliente?: DatosCliente
  esNuevo: boolean
}) {
  const router = useRouter()
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(
    async (previo, datos) => {
      const r = await guardarCliente(previo, datos)
      if (r?.ok) router.push('/dashboard/clientes')
      return r
    },
    null,
  )

  const err = estado && !estado.ok ? estado.errores : {}

  return (
    <form action={accion} className="max-w-4xl">
      {esNuevo && <input type="hidden" name="_nuevo" value="1" />}

      {estado && !estado.ok && estado.mensaje && (
        <div
          className="mb-5 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-error-soft)', borderColor: 'var(--al-error)' }}
        >
          No se pudo guardar: {estado.mensaje}
        </div>
      )}

      <fieldset
        className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
      >
        <legend className="px-2 text-sm font-semibold">Identificación</legend>
        <div className="grid grid-cols-4 gap-4">
          {esNuevo ? (
            <Campo nombre="codigo" etiqueta="Código" valor={cliente?.codigo}
              errores={err.codigo} ancho="estrecho" requerido />
          ) : (
            <div className="col-span-1">
              <label className="mb-1 block text-sm font-medium">Código</label>
              <input type="hidden" name="codigo" value={cliente!.codigo} />
              <p className="cifra rounded-md border px-3 py-2 text-sm"
                style={{ background: 'var(--al-surface-muted)', borderColor: 'var(--al-border)', textAlign: 'left' }}>
                {cliente!.codigo}
              </p>
            </div>
          )}
          <Campo nombre="nif" etiqueta="NIF / CIF" valor={cliente?.nif}
            errores={err.nif} ancho="estrecho" />
          <Campo nombre="nombre" etiqueta="Nombre o razón social" valor={cliente?.nombre}
            errores={err.nombre} requerido />
          <Campo nombre="nombreComercial" etiqueta="Nombre comercial"
            valor={cliente?.nombreComercial} errores={err.nombreComercial} ancho="ancho" />
        </div>
      </fieldset>

      <fieldset
        className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
      >
        <legend className="px-2 text-sm font-semibold">Dirección</legend>
        <div className="grid grid-cols-4 gap-4">
          <Campo nombre="direccion" etiqueta="Dirección" valor={cliente?.direccion}
            errores={err.direccion} ancho="ancho" />
          <Campo nombre="cp" etiqueta="C.P." valor={cliente?.cp} errores={err.cp} ancho="estrecho" />
          <Campo nombre="poblacion" etiqueta="Población" valor={cliente?.poblacion} errores={err.poblacion} />
          <Campo nombre="provincia" etiqueta="Provincia" valor={cliente?.provincia}
            errores={err.provincia} ancho="estrecho" />
        </div>
      </fieldset>

      <fieldset
        className="mb-5 rounded-lg border p-5"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}
      >
        <legend className="px-2 text-sm font-semibold">Contacto y condiciones</legend>
        <div className="grid grid-cols-4 gap-4">
          <Campo nombre="personaContacto" etiqueta="Persona de contacto"
            valor={cliente?.personaContacto} errores={err.personaContacto} />
          <Campo nombre="telefono" etiqueta="Teléfono" valor={cliente?.telefono}
            errores={err.telefono} ancho="estrecho" />
          <Campo nombre="telefonoMovil" etiqueta="Móvil" valor={cliente?.telefonoMovil}
            errores={err.telefonoMovil} ancho="estrecho" />
          <Campo nombre="email" etiqueta="Correo electrónico" valor={cliente?.email}
            errores={err.email} tipo="email" />
          <Campo nombre="tarifa" etiqueta="Tarifa" valor={cliente?.tarifa ?? 1}
            errores={err.tarifa} tipo="number" ancho="estrecho" />
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}
        >
          {enviando ? 'Guardando…' : esNuevo ? 'Crear cliente' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/clientes')}
          className="rounded-md border px-5 py-2 text-sm"
          style={{ borderColor: 'var(--al-border-strong)' }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
