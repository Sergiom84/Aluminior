'use client'

import React, { useMemo, useState } from 'react'
import { TIPO_COTA, TIPO_NODO } from '@aluminior/core/despiece'
import {
  actualizarDivisionDisenoPropio, cambiarBarrotilloHuecoDisenoPropio,
  cambiarHojaHuecoDisenoPropio, cambiarVidrioHuecoDisenoPropio,
  cotasEfectivasModulo, disenoPropioModuloValido, dividirHuecoDisenoPropio,
  eliminarDivisionDisenoPropio, inspeccionarDisenoPropio, plantillaDiseno,
  sembrarDisenoPropioModulo, type DisenoPropioModulo, type ModuloCerramiento,
} from '@aluminior/core/estructuras'
import { DibujoEstructura, type ParteSeleccionada as SeleccionSvg } from '../../dibujo-estructura.tsx'
import { DialogoDisenador } from '../dialogo-disenador.tsx'
import { PanelHuecoDiseno } from './panel-hueco-diseno.tsx'
import { ETIQUETA_POSICION_TRAVESANO, PanelTravesanoDiseno } from './panel-travesano-diseno.tsx'

type FocoDiseno =
  | { readonly tipo: 'hueco'; readonly indice: number }
  | { readonly tipo: 'division'; readonly divisionId: number }

function cotasParaVistaPrevia(modulo: ModuloCerramiento, diseno: DisenoPropioModulo) {
  const base = cotasEfectivasModulo(modulo) ?? {}
  if (plantillaDiseno(modulo.estructuraCodigo)?.codigo !== '1OFI') return Object.keys(base).length ? base : null
  const fiNodo = diseno.nodos.find(
    n => n.tipo === TIPO_NODO.travesano && n.tipoCota === TIPO_COTA.variable && n.simbolo?.trim() === 'FI',
  )?.cota
  return { ...base, ...(typeof fiNodo === 'number' && fiNodo > 0 ? { FI: fiNodo } : {}) }
}

export function DialogoDisenoPropio({
  modulo, vidrioGeneral, onCerrar, onAceptar, onRestablecer,
}: {
  modulo: ModuloCerramiento
  vidrioGeneral: string | null
  onCerrar: () => void
  onAceptar: (diseno: DisenoPropioModulo) => boolean
  onRestablecer: () => boolean
}) {
  const plantilla = plantillaDiseno(modulo.estructuraCodigo)
  const inicial = useMemo(() => sembrarDisenoPropioModulo(modulo), [modulo])
  const [diseno, setDiseno] = useState<DisenoPropioModulo | null>(inicial)
  const [foco, setFoco] = useState<FocoDiseno>({ tipo: 'hueco', indice: 1 })
  const [rechazo, setRechazo] = useState(false)

  const cotasVista = useMemo(
    () => (diseno ? cotasParaVistaPrevia(modulo, diseno) : cotasEfectivasModulo(modulo)),
    [modulo, diseno],
  )
  const inspeccion = useMemo(
    () => (diseno ? inspeccionarDisenoPropio(diseno, modulo.anchoMm, modulo.altoMm, cotasVista) : null),
    [diseno, modulo.anchoMm, modulo.altoMm, cotasVista],
  )
  const valido = Boolean(
    diseno && inspeccion?.valido && disenoPropioModuloValido(diseno, modulo.anchoMm, modulo.altoMm, cotasVista),
  )

  const moduloVista: ModuloCerramiento = useMemo(() => {
    if (!diseno) return modulo
    const fi = cotasVista?.FI
    return {
      ...modulo,
      ...(plantilla?.codigo === '1OFI' && typeof fi === 'number' ? { fiMm: fi } : {}),
      disenoPropio: diseno,
    }
  }, [modulo, diseno, cotasVista, plantilla?.codigo])

  const huecoActivo = inspeccion
    ? (foco.tipo === 'hueco'
      ? (inspeccion.huecos.find(h => h.indice === foco.indice) ?? inspeccion.huecos[0] ?? null)
      : null)
    : null
  const divisionActiva = inspeccion && foco.tipo === 'division'
    ? (inspeccion.divisiones.find(d => d.divisionId === foco.divisionId) ?? null)
    : null

  const seleccionSvg: SeleccionSvg | undefined = huecoActivo
    ? { elemento: huecoActivo.elementoVisualId, parte: huecoActivo.contenido.modo === 'fijo' ? 'vidrio' : 'hoja' }
    : divisionActiva
      ? { elemento: divisionActiva.elementoVisualId, parte: 'travesano' }
      : undefined
  const alPulsarSvg = (sel: SeleccionSvg) => {
    if (!inspeccion) return
    if (sel.parte === 'travesano') {
      const div = inspeccion.divisiones.find(d => sel.elemento.startsWith(`division-${d.divisionId}-`) || d.elementoVisualId === sel.elemento)
      if (div) setFoco({ tipo: 'division', divisionId: div.divisionId })
      return
    }
    const hueco = inspeccion.huecos.find(h => h.elementoVisualId === sel.elemento)
    if (hueco) setFoco({ tipo: 'hueco', indice: hueco.indice })
  }

  return (
    <DialogoDisenador titulo={`Diseño específico · ${modulo.estructuraCodigo} (${modulo.anchoMm} × ${modulo.altoMm} mm)`} onCerrar={onCerrar}>
      {!plantilla || !diseno || !inspeccion ? (
        <div>
          <p role="status">{modulo.estructuraCodigo} no admite Diseño V3.</p>
          <div className="al-diseno-v3-pie">
            <div className="al-diseno-v3-pie-derecha">
              <button type="button" className="al-command" data-foco-inicial onClick={onCerrar}>Cerrar</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="al-diseno-v3">
            <div className="al-diseno-v3-lienzo">
              <div className="al-diseno-v3-svg">
                <DibujoEstructura plantilla={plantilla} anchoMm={modulo.anchoMm} altoMm={modulo.altoMm}
                  modulo={moduloVista} seleccion={seleccionSvg} onSeleccion={alPulsarSvg} />
              </div>
              <div className="al-diseno-v3-nodos" role="group" aria-label="Elementos del diseño">
                {inspeccion.huecos.map(h => (
                  <button key={`h-${h.indice}`} type="button" className="al-diseno-v3-nodo"
                    aria-pressed={huecoActivo?.indice === h.indice}
                    onClick={() => setFoco({ tipo: 'hueco', indice: h.indice })}>
                    Hueco {h.indice}{h.vidrioPropio ? ` · ${h.vidrioPropio}` : ''}{h.barrotillo ? ' · BI' : ''}
                  </button>
                ))}
                {inspeccion.divisiones.map((d, idx) => (
                  <button key={`d-${d.divisionId}`} type="button" className="al-diseno-v3-nodo"
                    aria-pressed={divisionActiva?.divisionId === d.divisionId}
                    onClick={() => setFoco({ tipo: 'division', divisionId: d.divisionId })}>
                    Travesaño {idx + 1} · {ETIQUETA_POSICION_TRAVESANO[d.posicion].split(' ')[0]} {d.tipoCota === 0 ? `${d.huecos}h` : `${d.cotaMm} mm`}
                  </button>
                ))}
              </div>
            </div>

            {divisionActiva ? (
              <PanelTravesanoDiseno
                division={divisionActiva}
                indice={inspeccion.divisiones.findIndex(d => d.divisionId === divisionActiva.divisionId) + 1}
                valido={valido}
                onCambiar={cambios => setDiseno(actual => actual ? actualizarDivisionDisenoPropio(actual, divisionActiva.divisionId, cambios) : actual)}
                onEliminar={() => {
                  setDiseno(actual => actual ? eliminarDivisionDisenoPropio(actual, divisionActiva.divisionId) : actual)
                  setFoco({ tipo: 'hueco', indice: 1 })
                }} />
            ) : (huecoActivo ?? inspeccion.huecos[0]) ? (
              <PanelHuecoDiseno
                hueco={huecoActivo ?? inspeccion.huecos[0]!}
                vidrioBase={modulo.materiales?.vidrioCodigo ?? vidrioGeneral}
                onCambiarHoja={sel => setDiseno(actual => actual ? cambiarHojaHuecoDisenoPropio(actual, (huecoActivo ?? inspeccion.huecos[0]!).regionId, sel) : actual)}
                onCambiarVidrio={vid => setDiseno(actual => actual ? cambiarVidrioHuecoDisenoPropio(actual, (huecoActivo ?? inspeccion.huecos[0]!).regionSuperficieId, vid) : actual)}
                onCambiarBarrotillo={barr => setDiseno(actual => actual ? cambiarBarrotilloHuecoDisenoPropio(actual, (huecoActivo ?? inspeccion.huecos[0]!).regionSuperficieId, barr) : actual)}
                onDividir={op => {
                  if (!diseno) return
                  const objetivo = huecoActivo ?? inspeccion.huecos[0]!
                  const siguiente = dividirHuecoDisenoPropio(diseno, objetivo.regionId, op)
                  setDiseno(siguiente)
                  const nuevaInsp = inspeccionarDisenoPropio(siguiente, modulo.anchoMm, modulo.altoMm, cotasParaVistaPrevia(modulo, siguiente))
                  const ultimaDiv = nuevaInsp.divisiones.at(-1)
                  if (ultimaDiv) setFoco({ tipo: 'division', divisionId: ultimaDiv.divisionId })
                }} />
            ) : null}
          </div>

          <div className="al-diseno-v3-pie">
            {Boolean(modulo.disenoPropio) ? (
              <button type="button" className="al-command" onClick={() => { if (!onRestablecer()) setRechazo(true) }}>
                Restablecer catálogo
              </button>
            ) : <span />}
            <div className="al-diseno-v3-pie-derecha">
              {rechazo && <p role="alert">El diseño no cabe en la ventana.</p>}
              <button type="button" className="al-command" onClick={onCerrar}>Cancelar</button>
              <button type="button" className="al-command" data-foco-inicial disabled={!valido}
                onClick={() => { if (!onAceptar(diseno)) setRechazo(true) }}>
                Aceptar diseño
              </button>
            </div>
          </div>
        </>
      )}
    </DialogoDisenador>
  )
}

