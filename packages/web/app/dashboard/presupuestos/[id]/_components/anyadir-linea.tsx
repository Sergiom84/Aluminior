'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEnvioFormulario } from './use-envio-formulario.ts'
import {
  type ConfiguracionCerramiento,
} from '@aluminior/core/estructuras'
import { anyadirLinea, type Estado } from '../../_lib/acciones.ts'
import { DisenadorEstructura } from './disenador-estructura.tsx'
import { CamposArticulo, CamposCerramiento } from './campos-alta.tsx'
import { MensajeError } from './mensaje-error.tsx'
import { enfocarEdicion } from './foco-edicion.ts'
import { useSeriesValidas } from './use-series-validas.ts'
import { MosquiterasCatalogo, type ModeloMosquitera } from './disenador/mosquiteras-catalogo.tsx'
import type { CatalogoComplementosDisenador } from './disenador/complementos-elemento.tsx'
import { catalogosEstructuraListos, claveCatalogoHerraje, type EstadoCargaCatalogo } from './editor-linea/disponibilidad-catalogos.ts'
import styles from '../presupuesto-movil.module.css'

type TipoLinea = 'CERRAMIENTO' | 'ARTICULO'

/**
 * Alta de línea unificada en `Cerramiento` y `Artículos`. Abre directamente en
 * el configurador de cerramientos (recorrido del operador: 1 o varios elementos,
 * uniones, mosquiteras, Opc.Herraje y Acristalamiento); tras Aceptar se reinicia
 * para seguir añadiendo líneas sin salir del documento.
 */
export function AnyadirLinea({
  presupuestoId, series, acabados, catalogoUniones, cotasCatalogo, complementosCatalogo, mosquiteras = [],
}: {
  mosquiteras?: readonly ModeloMosquitera[]
  presupuestoId: string
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
  catalogoUniones?: readonly import('@aluminior/core/estructuras').UnionVisual[]
  cotasCatalogo?: import('@aluminior/core/estructuras').CotasCatalogoPorEstructura
  complementosCatalogo?: CatalogoComplementosDisenador
}) {
  const [tipo, setTipo] = useState<TipoLinea>('CERRAMIENTO')
  const { estado, enviar, enviando } = useEnvioFormulario<Estado>(anyadirLinea, true)
  const formulario = useRef<HTMLFormElement>(null)
  const focoTrasAlta = useRef(false)
  const [serie, setSerie] = useState('')
  const [vidrio, setVidrio] = useState('')
  const [anchoMm, setAnchoMm] = useState(1200)
  const [altoMm, setAltoMm] = useState(1200)
  const [configuracion, setConfiguracion] = useState<ConfiguracionCerramiento | null>(null)
  const [edicion, setEdicion] = useState(0)
  const [configuracionValida, setConfiguracionValida] = useState(true)
  const [herraje, setHerraje] = useState<EstadoCargaCatalogo | null>(null)
  const [acristalamiento, setAcristalamiento] = useState<EstadoCargaCatalogo | null>(null)
  const [elementoOpciones, setElementoOpciones] = useState<{ serie: string; estructura: string } | null>(null)
  const actualizarDimensiones = useCallback((ancho: number, alto: number) => {
    setAnchoMm(ancho)
    setAltoMm(alto)
  }, [])

  const resetTrasAlta = useCallback(() => {
    setAnchoMm(1200)
    setAltoMm(1200)
    setConfiguracion(null)
    setHerraje(null)
    setAcristalamiento(null)
    setElementoOpciones(null)
    setEdicion((actual) => actual + 1)
  }, [])

  useEffect(() => {
    focoTrasAlta.current = Boolean(estado?.ok)
    if (estado?.ok) resetTrasAlta()
  }, [estado, resetTrasAlta])

  useEffect(() => {
    if (!focoTrasAlta.current) return
    focoTrasAlta.current = false
    formulario.current?.querySelector<HTMLButtonElement>('[data-foco-configurador-vacio]')?.focus()
  }, [edicion])

  useEffect(() => {
    if (estado && !estado.ok) enfocarEdicion(estado, formulario.current)
  }, [estado])

  const elegirTipo = (siguiente: TipoLinea) => {
    setTipo(siguiente)
    if (siguiente === 'CERRAMIENTO') resetTrasAlta()
  }

  const estructurasEnPantalla = tipo === 'CERRAMIENTO'
    ? configuracion?.modulos.map((modulo) => modulo.estructuraCodigo) ?? []
    : []
  const seriesValidas = useSeriesValidas(series, estructurasEnPantalla, vidrio)

  const err = estado && !estado.ok ? estado.errores : {}
  const serieOpciones = elementoOpciones?.serie ?? ''
  const estructuraOpciones = elementoOpciones?.estructura ?? ''
  const opcionesListas = !serieOpciones || !estructuraOpciones ||
    catalogosEstructuraListos(serieOpciones, estructuraOpciones, herraje, acristalamiento)
  const puedeEnviar = tipo !== 'CERRAMIENTO' || (configuracionValida && opcionesListas)
  const falloCatalogos = Boolean(
    serieOpciones && estructuraOpciones && (
      (herraje?.clave === claveCatalogoHerraje(serieOpciones, estructuraOpciones) && herraje.estado === 'ERROR') ||
      (acristalamiento?.clave === serieOpciones && acristalamiento.estado === 'ERROR')
    ),
  )

  return (
    <form ref={formulario} onSubmit={evento => {
      if (!puedeEnviar) { evento.preventDefault(); return }
      void enviar(evento)
    }} id="configurador" tabIndex={-1} aria-label="Introducir línea" aria-keyshortcuts="F7"
      className={`${styles.formCard} rounded-lg border`}
      style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border)' }}>
      <input type="hidden" name="presupuestoId" value={presupuestoId} />
      <input type="hidden" name="tipo" value={tipo} />
      {tipo === 'CERRAMIENTO' && configuracion && (
        <input type="hidden" name="configuracionCerramiento" value={JSON.stringify(configuracion)} />
      )}
      {tipo === 'CERRAMIENTO' && configuracion && (
        <input type="hidden" name="codigo" value="GRUPO" />
      )}

      <div className={`${styles.modeTabs} mb-4`}>
        {([
          ['CERRAMIENTO', 'Cerramiento'],
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
      </div>

      {estado?.mensaje && (
        <div role={estado.ok ? 'status' : 'alert'} tabIndex={-1} className="mb-4 rounded-md border p-3 text-sm"
          style={{ background: 'var(--al-warn-soft)', borderColor: 'var(--al-warn)' }}>
          {estado.mensaje}
        </div>
      )}

      {tipo === 'CERRAMIENTO' && (
        <>
          <MensajeError campo="codigo" errores={err} />
          <MensajeError campo="configuracionCerramiento" errores={err} />
          <DisenadorEstructura key={edicion} codigo="2O" anchoMm={anchoMm} altoMm={altoMm} vacio
            onConfiguracionChange={setConfiguracion}
            onDimensionesChange={actualizarDimensiones}
            onValidezChange={setConfiguracionValida} series={seriesValidas.grupo}
            seriesPorEstructura={seriesValidas.porEstructura} catalogoUniones={catalogoUniones}
            cotasCatalogo={cotasCatalogo} complementosCatalogo={complementosCatalogo}
            opcionesCatalogo={{
              onHerrajeChange: setHerraje,
              onAcristalamientoChange: setAcristalamiento,
              errores: err,
            }}
            onElementoOpcionesChange={setElementoOpciones}
            panelMosquiteras={mosquiteras.length ? (
              <MosquiterasCatalogo presupuestoId={presupuestoId} modelos={mosquiteras} acabados={acabados} />
            ) : undefined}
            generales={{ serieCodigo: serie || null, vidrioCodigo: vidrio || null }} />
          <CamposCerramiento err={err} series={seriesValidas.grupo} acabados={acabados}
            serie={serie} setSerie={setSerie} vidrio={vidrio} setVidrio={setVidrio} />
        </>
      )}

      {tipo === 'ARTICULO' && <CamposArticulo key={edicion} err={err} acabados={acabados} />}

      <div className={`${styles.formActions} mt-4`}>
        {tipo === 'CERRAMIENTO' && Boolean(configuracion) && !opcionesListas && (
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
        {tipo === 'CERRAMIENTO' && (
          <button type="button" className="al-command" onClick={resetTrasAlta}>
            Cerrar
          </button>
        )}
      </div>
    </form>
  )
}
