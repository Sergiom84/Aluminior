'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEnvioFormulario } from './use-envio-formulario.ts'
import {
  crearConfiguracionCerramiento, plantillaDiseno, type ConfiguracionCerramiento,
  type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { anyadirLinea, borrarLinea, type Estado } from '../../_lib/acciones.ts'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import { EditorLineaEstructura } from './editor-linea.tsx'
import { Escaparate } from './escaparate.tsx'
import { CamposArticulo, CamposCerramiento, acabadoPorDefecto } from './campos-alta.tsx'
import styles from '../presupuesto-movil.module.css'

type TipoLinea = 'ESTRUCTURA' | 'ARTICULO' | 'CERRAMIENTO'

/**
 * Alta de línea. Flujo de Productor: tipo → escaparate → edición.
 * Tras Aceptar, el diálogo se reabre para seguir añadiendo.
 */
export function AnyadirLinea({
  presupuestoId, series, acabados,
}: {
  presupuestoId: string
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
}) {
  const [tipo, setTipo] = useState<TipoLinea>('ESTRUCTURA')
  const [plantilla, setPlantilla] = useState<PlantillaDiseno | null>(null)
  const { estado, enviar, enviando } = useEnvioFormulario<Estado>(anyadirLinea, true)
  const [serie, setSerie] = useState('')
  const [vidrio, setVidrio] = useState('')
  const [acabado, setAcabado] = useState(() => acabadoPorDefecto(acabados))
  const [variante, setVariante] = useState<'1' | '2'>('2')
  const [anchoMm, setAnchoMm] = useState(1200)
  const [altoMm, setAltoMm] = useState(1200)
  const [configuracion, setConfiguracion] = useState<ConfiguracionCerramiento>(() =>
    crearConfiguracionCerramiento(plantillaDiseno('2O')!),
  )
  const [edicion, setEdicion] = useState(0)
  const [configuracionValida, setConfiguracionValida] = useState(true)
  const actualizarDimensiones = useCallback((ancho: number, alto: number) => {
    setAnchoMm(ancho)
    setAltoMm(alto)
  }, [])

  const resetTrasAlta = useCallback(() => {
    setPlantilla(null)
    setAnchoMm(1200)
    setAltoMm(1200)
    setConfiguracion(crearConfiguracionCerramiento(plantillaDiseno('2O')!))
    setEdicion((actual) => actual + 1)
  }, [])

  useEffect(() => {
    if (estado?.ok) resetTrasAlta()
  }, [estado, resetTrasAlta])

  const elegirTipo = (siguiente: TipoLinea) => {
    setTipo(siguiente)
    setPlantilla(null)
  }

  const elegirPlantilla = (siguiente: PlantillaDiseno) => {
    setPlantilla(siguiente)
    setAnchoMm(siguiente.anchoMm)
    setAltoMm(siguiente.altoMm)
    setConfiguracion(crearConfiguracionCerramiento(siguiente))
    setEdicion((actual) => actual + 1)
  }

  const err = estado && !estado.ok ? estado.errores : {}
  const enEscaparate = (tipo === 'ESTRUCTURA' || tipo === 'CERRAMIENTO') && !plantilla
  const codigoLinea = tipo === 'CERRAMIENTO' ? 'GRUPO' : plantilla?.codigo ?? ''

  return (
    <form onSubmit={enviar} id="configurador"
      className={`${styles.formCard} rounded-lg border`}
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <input type="hidden" name="presupuestoId" value={presupuestoId} />
      <input type="hidden" name="tipo" value={tipo} />
      {tipo === 'CERRAMIENTO' && plantilla && (
        <input type="hidden" name="configuracionCerramiento" value={JSON.stringify(configuracion)} />
      )}
      {tipo === 'CERRAMIENTO' && plantilla && (
        <input type="hidden" name="codigo" value={codigoLinea} />
      )}

      <div className={`${styles.modeTabs} mb-4`}>
        {([
          ['ESTRUCTURA', 'Estructuras'],
          ['ARTICULO', 'Artículos'],
        ] as const).map(([valor, etiqueta]) => (
          <button key={valor} type="button" onClick={() => elegirTipo(valor)}
            className="rounded-md border px-4 py-1.5 text-sm"
            style={{
              background: tipo === valor ? 'var(--al-accent)' : 'var(--al-surface)',
              color: tipo === valor ? 'var(--al-accent-contrast)' : 'var(--al-text)',
              borderColor: tipo === valor ? 'var(--al-accent)' : 'var(--al-border-strong)',
            }}>
            {etiqueta}
          </button>
        ))}
        <button type="button" onClick={() => elegirTipo('CERRAMIENTO')}
          className="rounded-md border px-4 py-1.5 text-sm"
          style={{
            background: tipo === 'CERRAMIENTO' ? 'var(--al-accent)' : 'var(--al-surface)',
            color: tipo === 'CERRAMIENTO' ? 'var(--al-accent-contrast)' : 'var(--al-text)',
            borderColor: tipo === 'CERRAMIENTO' ? 'var(--al-accent)' : 'var(--al-border-strong)',
          }}>
          Cerramiento
        </button>
      </div>

      {estado?.mensaje && (
        <div className="mb-4 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-warn-soft)', borderColor: 'var(--al-warn)' }}>
          {estado.mensaje}
        </div>
      )}

      {enEscaparate && <Escaparate onElegir={elegirPlantilla} />}

      {tipo === 'ESTRUCTURA' && plantilla && (
        <EditorLineaEstructura
          plantilla={plantilla} series={series} acabados={acabados}
          serie={serie} setSerie={setSerie} anchoMm={anchoMm} setAnchoMm={setAnchoMm}
          altoMm={altoMm} setAltoMm={setAltoMm} vidrio={vidrio} setVidrio={setVidrio}
          acabado={acabado} setAcabado={setAcabado} variante={variante} setVariante={setVariante}
          err={err} onCambiarEstructura={() => setPlantilla(null)} />
      )}

      {tipo === 'CERRAMIENTO' && plantilla && (
        <>
          <DisenadorEstructura key={edicion} codigo={plantilla.codigo} anchoMm={anchoMm} altoMm={altoMm}
            configuracionInicial={configuracion}
            onConfiguracionChange={setConfiguracion}
            onDimensionesChange={actualizarDimensiones}
            onValidezChange={setConfiguracionValida} />
          <CamposCerramiento err={err} series={series} acabados={acabados}
            serie={serie} setSerie={setSerie} />
        </>
      )}

      {tipo === 'ARTICULO' && <CamposArticulo key={edicion} err={err} acabados={acabados} />}

      {!enEscaparate && (
        <div className={`${styles.formActions} mt-4`}>
          <button type="submit" disabled={enviando || (tipo === 'CERRAMIENTO' && !configuracionValida)}
            className="al-command-primary disabled:opacity-50">
            {enviando ? 'Añadiendo…' : 'Aceptar'}
          </button>
          {(tipo === 'ESTRUCTURA' || tipo === 'CERRAMIENTO') && (
            <button type="button" className="al-command" onClick={() => setPlantilla(null)}>
              Cerrar
            </button>
          )}
        </div>
      )}
    </form>
  )
}

export function BotonBorrarLinea({
  lineaId, presupuestoId,
}: { lineaId: string; presupuestoId: string }) {
  const [borrando, setBorrando] = useState(false)
  return (
    <button type="button" disabled={borrando}
      onClick={async () => { setBorrando(true); await borrarLinea(lineaId, presupuestoId) }}
      className="text-xs disabled:opacity-40" style={{ color: 'var(--al-error)' }}
      aria-label="Eliminar línea">
      {borrando ? '…' : 'Eliminar'}
    </button>
  )
}
