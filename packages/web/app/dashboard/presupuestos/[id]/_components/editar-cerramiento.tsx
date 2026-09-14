'use client'

import { useActionState, useCallback, useEffect, useState } from 'react'
import { medidasCerramiento, type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { editarCerramiento, type EstadoEdicionCerramiento } from '../../_lib/editar-cerramiento-action.ts'
import { MAXIMO_HORAS } from '../../_lib/lineas/esquema-linea.ts'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import styles from '../presupuesto-movil.module.css'

export interface DatosEdicionCerramiento {
  configuracion: ConfiguracionCerramiento
  serieCodigo: string | null
  vidrioCodigo: string | null
  acabadoCodigo: string | null
  varianteAcristalamiento: '1' | '2'
  referencia: string | null
  cantidad: string
  horasFabricacion: string
  horasColocacion: string
}

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

export function EditarCerramiento({
  presupuestoId, lineaId, datos, series, acabados, onCancelar,
}: {
  presupuestoId: string
  lineaId: string
  datos: DatosEdicionCerramiento
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
  onCancelar: () => void
}) {
  const [estado, accion, guardando] = useActionState<EstadoEdicionCerramiento, FormData>(
    editarCerramiento, null,
  )
  const [configuracion, setConfiguracion] = useState(datos.configuracion)
  const medidasIniciales = medidasCerramiento(datos.configuracion)
  const [anchoMm, setAnchoMm] = useState(medidasIniciales.anchoMm)
  const [altoMm, setAltoMm] = useState(medidasIniciales.altoMm)
  const actualizarDimensiones = useCallback((ancho: number, alto: number) => {
    setAnchoMm(ancho)
    setAltoMm(alto)
  }, [])
  useEffect(() => { if (estado?.ok) onCancelar() }, [estado, onCancelar])

  const errores = estado && !estado.ok ? estado.errores : {}
  const identificador = (campo: string) => `${campo}-${lineaId}`
  const campo = (nombre: string) => ({
    id: identificador(nombre), name: nombre,
    'aria-invalid': errores[nombre]?.length ? true : undefined,
    'aria-describedby': errores[nombre]?.length ? `${identificador(nombre)}-error` : undefined,
  })
  const ErrorCampo = ({ nombre }: { nombre: string }) => errores[nombre]?.length ? (
    <p id={`${identificador(nombre)}-error`} className="mt-1 text-xs" style={{ color: 'var(--al-error)' }}>
      {errores[nombre].join('. ')}
    </p>
  ) : null

  return (
    <form action={accion} className={`${styles.editorForm} rounded-md border p-4`}
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-accent)' }}>
      <input type="hidden" name="presupuestoId" value={presupuestoId} />
      <input type="hidden" name="lineaId" value={lineaId} />
      <input type="hidden" name="tipo" value="CERRAMIENTO" />
      <input type="hidden" name="codigo" value="GRUPO" />
      <input type="hidden" name="configuracionCerramiento" value={JSON.stringify(configuracion)} />

      <DisenadorEstructura codigo={configuracion.modulos[0].estructuraCodigo}
        anchoMm={anchoMm} altoMm={altoMm} configuracionInicial={datos.configuracion}
        onConfiguracionChange={setConfiguracion} onDimensionesChange={actualizarDimensiones} />

      {estado?.mensaje && (
        <div className="mb-3 mt-4 rounded-md border p-3 text-sm"
          style={{ borderColor: estado.ok ? 'var(--al-accent)' : 'var(--al-error)' }}>
          {estado.mensaje}
        </div>
      )}

      <div className={`${styles.fields} mt-4`}>
        <div className="col-span-2">
          <label htmlFor={identificador('referencia')} className="mb-1 block text-sm">Ubicación</label>
          <input {...campo('referencia')} defaultValue={datos.referencia ?? ''} className={entrada} style={estilo} />
          <ErrorCampo nombre="referencia" />
        </div>
        <div className="col-span-2">
          <label htmlFor={identificador('serieCodigo')} className="mb-1 block text-sm">Serie</label>
          <select {...campo('serieCodigo')} defaultValue={datos.serieCodigo ?? ''} className={entrada} style={estilo}>
            <option value="">— sin serie —</option>
            {series.map((serie) => <option key={serie} value={serie}>{serie}</option>)}
          </select>
          <ErrorCampo nombre="serieCodigo" />
        </div>
        <div className="col-span-2">
          <label htmlFor={identificador('vidrioCodigo')} className="mb-1 block text-sm">Vidrio</label>
          <input {...campo('vidrioCodigo')} defaultValue={datos.vidrioCodigo ?? ''} className={entrada} style={estilo} />
          <ErrorCampo nombre="vidrioCodigo" />
        </div>
        <div className="col-span-2">
          <label htmlFor={identificador('varianteAcristalamiento')} className="mb-1 block text-sm">Acristalamiento</label>
          <select {...campo('varianteAcristalamiento')} defaultValue={datos.varianteAcristalamiento}
            className={entrada} style={estilo}>
            <option value="2">Doble cristal</option>
            <option value="1">Cristal sencillo</option>
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor={identificador('acabadoCodigo')} className="mb-1 block text-sm">Acabado</label>
          <select {...campo('acabadoCodigo')} defaultValue={datos.acabadoCodigo ?? ''} className={entrada} style={estilo}>
            <option value="">— sin acabado —</option>
            {acabados.map((acabado) => (
              <option key={acabado.codigo} value={acabado.codigo}>
                {acabado.codigo} · {acabado.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label htmlFor={identificador('cantidad')} className="mb-1 block text-sm">Cdad.</label>
          <input {...campo('cantidad')} type="number" min={1} step={1} defaultValue={datos.cantidad}
            className={`cifra ${entrada}`} style={estilo} />
          <ErrorCampo nombre="cantidad" />
        </div>
        <input type="hidden" name="anchoMm" value={anchoMm} />
        <input type="hidden" name="altoMm" value={altoMm} />
      </div>

      <fieldset className="mt-4 rounded-md border p-3" style={{ borderColor: 'var(--al-border)' }}>
        <legend className="px-1 text-sm">Mano de obra adicional · total de línea</legend>
        <div className={styles.workFields}>
          {([
            ['horasFabricacion', 'Fabricación (h)', datos.horasFabricacion],
            ['horasColocacion', 'Colocación (h)', datos.horasColocacion],
          ] as const).map(([nombre, etiqueta, valor]) => (
            <div key={nombre}>
              <label htmlFor={identificador(nombre)} className="mb-1 block text-sm">{etiqueta}</label>
              <input {...campo(nombre)} type="number" min={0} max={MAXIMO_HORAS} step="0.01"
                defaultValue={valor} className={`cifra ${entrada}`} style={estilo} />
              <ErrorCampo nombre={nombre} />
            </div>
          ))}
        </div>
      </fieldset>

      <div className={`${styles.formActions} mt-4`}>
        <button type="button" onClick={onCancelar} disabled={guardando}
          className="rounded-md border px-4 py-2 text-sm" style={{ borderColor: 'var(--al-border-strong)' }}>
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="rounded-md px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
