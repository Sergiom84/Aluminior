'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEnvioFormulario } from './use-envio-formulario.ts'
import {
  type ConfiguracionCerramiento,
  type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { anyadirLinea, type Estado } from '../../_lib/acciones.ts'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import { EditorLineaEstructura } from './editor-linea.tsx'
import { Escaparate } from './escaparate.tsx'
import { CamposArticulo, CamposCerramiento, acabadoPorDefecto } from './campos-alta.tsx'
import { MensajeError } from './mensaje-error.tsx'
import { catalogosEstructuraListos, claveCatalogoHerraje, type EstadoCargaCatalogo } from './editor-linea/disponibilidad-catalogos.ts'
import styles from '../presupuesto-movil.module.css'

type TipoLinea = 'ESTRUCTURA' | 'ARTICULO' | 'CERRAMIENTO'

/**
 * Alta de línea. Abre en el configurador de cerramientos, que es el recorrido
 * del operador (cabecera mínima y configurador inmediato); Estructuras y
 * Artículos siguen a un clic. Tras Aceptar, el diálogo se reabre para seguir añadiendo.
 */
export function AnyadirLinea({
  presupuestoId, series, acabados,
}: {
  presupuestoId: string
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
}) {
  const [tipo, setTipo] = useState<TipoLinea>('CERRAMIENTO')
  const [plantilla, setPlantilla] = useState<PlantillaDiseno | null>(null)
  const { estado, enviar, enviando } = useEnvioFormulario<Estado>(anyadirLinea, true)
  const [serie, setSerie] = useState('')
  const [vidrio, setVidrio] = useState('')
  const [acabado, setAcabado] = useState(() => acabadoPorDefecto(acabados))
  const [variante, setVariante] = useState<'1' | '2'>('2')
  const [anchoMm, setAnchoMm] = useState(1200)
  const [altoMm, setAltoMm] = useState(1200)
  const [configuracion, setConfiguracion] = useState<ConfiguracionCerramiento | null>(null)
  const [edicion, setEdicion] = useState(0)
  const [configuracionValida, setConfiguracionValida] = useState(true)
  const [herraje, setHerraje] = useState<EstadoCargaCatalogo | null>(null)
  const [acristalamiento, setAcristalamiento] = useState<EstadoCargaCatalogo | null>(null)
  const actualizarDimensiones = useCallback((ancho: number, alto: number) => {
    setAnchoMm(ancho)
    setAltoMm(alto)
  }, [])

  const resetTrasAlta = useCallback(() => {
    setPlantilla(null)
    setAnchoMm(1200)
    setAltoMm(1200)
    setConfiguracion(null)
    setHerraje(null)
    setAcristalamiento(null)
    setEdicion((actual) => actual + 1)
  }, [])

  useEffect(() => {
    if (estado?.ok) resetTrasAlta()
  }, [estado, resetTrasAlta])

  const elegirTipo = (siguiente: TipoLinea) => {
    setTipo(siguiente)
    setPlantilla(null)
    if (siguiente === 'CERRAMIENTO') resetTrasAlta()
  }

  const elegirPlantilla = (siguiente: PlantillaDiseno) => {
    setHerraje(null)
    setAcristalamiento(null)
    setPlantilla(siguiente)
    setAnchoMm(siguiente.anchoMm)
    setAltoMm(siguiente.altoMm)
    setEdicion((actual) => actual + 1)
  }

  const err = estado && !estado.ok ? estado.errores : {}
  const enEscaparate = tipo === 'ESTRUCTURA' && !plantilla
  const codigoLinea = tipo === 'CERRAMIENTO' ? 'GRUPO' : plantilla?.codigo ?? ''
  const puedeEnviar = tipo === 'ESTRUCTURA'
    ? Boolean(plantilla) && catalogosEstructuraListos(serie, codigoLinea, herraje, acristalamiento)
    : tipo !== 'CERRAMIENTO' || configuracionValida
  const falloCatalogos = herraje?.clave === claveCatalogoHerraje(serie, codigoLinea) && herraje.estado === 'ERROR' ||
    acristalamiento?.clave === serie && acristalamiento.estado === 'ERROR'

  return (
    <form onSubmit={evento => {
      if (!puedeEnviar) { evento.preventDefault(); return }
      void enviar(evento)
    }} id="configurador"
      className={`${styles.formCard} rounded-lg border`}
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <input type="hidden" name="presupuestoId" value={presupuestoId} />
      <input type="hidden" name="tipo" value={tipo} />
      {tipo === 'CERRAMIENTO' && configuracion && (
        <input type="hidden" name="configuracionCerramiento" value={JSON.stringify(configuracion)} />
      )}
      {tipo === 'CERRAMIENTO' && configuracion && (
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
          onHerrajeChange={setHerraje} onAcristalamientoChange={setAcristalamiento}
          err={err} onCambiarEstructura={() => setPlantilla(null)} />
      )}

      {tipo === 'CERRAMIENTO' && (
        <>
          <MensajeError campo="codigo" errores={err} />
          <MensajeError campo="configuracionCerramiento" errores={err} />
          <DisenadorEstructura key={edicion} codigo="2O" anchoMm={anchoMm} altoMm={altoMm} vacio
            onConfiguracionChange={setConfiguracion}
            onDimensionesChange={actualizarDimensiones}
            onValidezChange={setConfiguracionValida} series={series}
            generales={{ serieCodigo: serie || null, vidrioCodigo: vidrio || null }} />
          <CamposCerramiento err={err} series={series} acabados={acabados}
            serie={serie} setSerie={setSerie} vidrio={vidrio} setVidrio={setVidrio} />
        </>
      )}

      {tipo === 'ARTICULO' && <CamposArticulo key={edicion} err={err} acabados={acabados} />}

      {!enEscaparate && (
        <div className={`${styles.formActions} mt-4`}>
          {tipo === 'ESTRUCTURA' && !puedeEnviar && (
            <p role={falloCatalogos ? 'alert' : 'status'} className="text-sm">
              {falloCatalogos
                ? 'No se pudieron cargar las opciones. Reintenta la consulta en Opc.Herraje o Acristalamiento.'
                : 'Cargando opciones de la estructura…'}
            </p>
          )}
          <button type="submit" disabled={enviando || !puedeEnviar}
            className="al-command-primary disabled:opacity-50">
            {enviando ? 'Añadiendo…' : 'Aceptar'}
          </button>
          {(tipo === 'ESTRUCTURA' || tipo === 'CERRAMIENTO') && (
            <button type="button" className="al-command" onClick={() => tipo === 'CERRAMIENTO' ? elegirTipo('ESTRUCTURA') : setPlantilla(null)}>
              Cerrar
            </button>
          )}
        </div>
      )}
    </form>
  )
}
