'use client'

import React, { useState } from 'react'
import type { PosicionTravesano } from '@aluminior/core/despiece'
import type { BarrotilloVisual, HuecoEditableDiseno, SeleccionHojaHueco } from '@aluminior/core/estructuras'
import { CampoVidrio } from '../../vidrios/campo-vidrio.tsx'

const OPCIONES_APERTURA = [
  { valor: 'fijo', etiqueta: 'Fijo (sin hoja)' },
  { valor: 'hoja:1', etiqueta: '1 Hoja · Practicable derecha' },
  { valor: 'hoja:2', etiqueta: '1 Hoja · Practicable izquierda' },
  { valor: 'hoja:5', etiqueta: '1 Hoja · Oscilobatiente derecha' },
  { valor: 'hoja:6', etiqueta: '1 Hoja · Oscilobatiente izquierda' },
  { valor: 'pareja:8', etiqueta: '2 Hojas · Oscilobatiente derecha (2O)' },
  { valor: 'pareja:9', etiqueta: '2 Hojas · Oscilobatiente izquierda' },
] as const

function valorSelectorApertura(hueco: HuecoEditableDiseno): string {
  if (hueco.contenido.modo === 'fijo') return 'fijo'
  if (hueco.contenido.modo === 'hoja') return `hoja:${hueco.contenido.tipoHoja}`
  return `pareja:${hueco.contenido.tipoHoja}`
}

function parsearSelectorApertura(valor: string, actual: HuecoEditableDiseno['contenido']): SeleccionHojaHueco {
  if (valor === 'fijo') return { modo: 'fijo' }
  if (valor.startsWith('pareja:')) return { modo: 'pareja', tipoHoja: Number(valor.split(':')[1]) as 8 | 9 }
  return {
    modo: 'hoja',
    tipoHoja: Number(valor.split(':')[1]) as 1 | 2 | 5 | 6,
    vierteaguas: actual.modo === 'hoja' ? actual.vierteaguas : true,
    manilla: actual.modo === 'hoja' ? actual.manilla : true,
  }
}

export function PanelHuecoDiseno({
  hueco, vidrioBase, onCambiarHoja, onCambiarVidrio, onCambiarBarrotillo, onDividir,
}: {
  hueco: HuecoEditableDiseno
  vidrioBase: string | null
  onCambiarHoja: (seleccion: SeleccionHojaHueco) => void
  onCambiarVidrio: (vidrio: string | null) => void
  onCambiarBarrotillo: (barrotillo: BarrotilloVisual | null) => void
  onDividir: (opciones: { posicion: PosicionTravesano; tipoCota: 0 | 2; huecos: number; cotaMm: number }) => void
}) {
  const [posicion, setPosicion] = useState<PosicionTravesano>('HB')
  const [tipoCota, setTipoCota] = useState<0 | 2>(2)
  const [huecosDiv, setHuecosDiv] = useState(2)
  const [cotaMm, setCotaMm] = useState(300)

  const hBarr = hueco.barrotillo?.horizontales ?? 0
  const vBarr = hueco.barrotillo?.verticales ?? 0
  const medidas = hueco.rectMm ? `${Math.round(hueco.rectMm.ancho)} × ${Math.round(hueco.rectMm.alto)} mm` : ''

  return (
    <div className="al-diseno-v3-panel" aria-label={`Propiedades de Hueco ${hueco.indice}`}>
      <div className="al-diseno-v3-bloque">
        <div className="al-diseno-v3-cabecera">
          <h4 className="al-diseno-v3-titulo">Hueco {hueco.indice}</h4>
          {medidas && <span className="cifra">{medidas}</span>}
        </div>
        <label className="al-designer-measure">
          <span className="al-designer-properties-label">Hoja en hueco</span>
          <select aria-label="Hoja en hueco" value={valorSelectorApertura(hueco)}
            onChange={e => onCambiarHoja(parsearSelectorApertura(e.target.value, hueco.contenido))}>
            {OPCIONES_APERTURA.map(op => <option key={op.valor} value={op.valor}>{op.etiqueta}</option>)}
          </select>
        </label>
        {hueco.contenido.modo === 'hoja' && (
          <div className="al-diseno-v3-checks">
            <label>
              <input type="checkbox" checked={hueco.contenido.vierteaguas}
                onChange={e => onCambiarHoja({
                  modo: 'hoja', tipoHoja: hueco.contenido.modo === 'hoja' ? hueco.contenido.tipoHoja : 6,
                  vierteaguas: e.target.checked, manilla: hueco.contenido.modo === 'hoja' ? hueco.contenido.manilla : true,
                })} />
              Vierteaguas
            </label>
            <label>
              <input type="checkbox" checked={hueco.contenido.manilla}
                onChange={e => onCambiarHoja({
                  modo: 'hoja', tipoHoja: hueco.contenido.modo === 'hoja' ? hueco.contenido.tipoHoja : 6,
                  vierteaguas: hueco.contenido.modo === 'hoja' ? hueco.contenido.vierteaguas : true, manilla: e.target.checked,
                })} />
              Manilla
            </label>
          </div>
        )}
      </div>
      <div className="al-diseno-v3-bloque">
        <div className="al-diseno-v3-fila">
          <label className="al-designer-measure">
            <span className="al-designer-properties-label">Vidrio del hueco</span>
            <CampoVidrio aria-label="Vidrio del hueco" value={hueco.vidrioPropio ?? ''}
              placeholder={`General · ${vidrioBase || 'sin asignar'}`}
              data-excepcion={Boolean(hueco.vidrioPropio) || undefined} className="cifra"
              onChange={codigo => onCambiarVidrio(codigo || null)} />
          </label>
          {hueco.vidrioPropio && (
            <button type="button" className="al-command" onClick={() => onCambiarVidrio(null)}>
              Heredar vidrio
            </button>
          )}
        </div>
      </div>

      <div className="al-diseno-v3-bloque">
        <span className="al-designer-properties-label">Barrotillo interior (BI)</span>
        <div className="al-diseno-v3-fila">
          <label className="al-designer-measure">
            <span className="al-designer-properties-label">Horizontales</span>
            <span className="al-diseno-v3-pasos">
              <button type="button" className="al-command" aria-label="Menos barrotillos horizontales"
                disabled={hBarr <= 0} onClick={() => onCambiarBarrotillo({ horizontales: hBarr - 1, verticales: vBarr })}>−</button>
              <input aria-label="Barrotillos horizontales" type="number" min={0} max={12} step={1} className="cifra"
                value={hBarr} onChange={e => onCambiarBarrotillo({ horizontales: Number(e.target.value) || 0, verticales: vBarr })} />
              <button type="button" className="al-command" aria-label="Más barrotillos horizontales"
                disabled={hBarr >= 12} onClick={() => onCambiarBarrotillo({ horizontales: hBarr + 1, verticales: vBarr })}>+</button>
            </span>
          </label>
          <label className="al-designer-measure">
            <span className="al-designer-properties-label">Verticales</span>
            <span className="al-diseno-v3-pasos">
              <button type="button" className="al-command" aria-label="Menos barrotillos verticales"
                disabled={vBarr <= 0} onClick={() => onCambiarBarrotillo({ horizontales: hBarr, verticales: vBarr - 1 })}>−</button>
              <input aria-label="Barrotillos verticales" type="number" min={0} max={12} step={1} className="cifra"
                value={vBarr} onChange={e => onCambiarBarrotillo({ horizontales: hBarr, verticales: Number(e.target.value) || 0 })} />
              <button type="button" className="al-command" aria-label="Más barrotillos verticales"
                disabled={vBarr >= 12} onClick={() => onCambiarBarrotillo({ horizontales: hBarr, verticales: vBarr + 1 })}>+</button>
            </span>
          </label>
        </div>
      </div>

      {hueco.contenido.modo === 'fijo' && (
        <div className="al-diseno-v3-bloque">
          <span className="al-designer-properties-label">Añadir travesaño</span>
          <div className="al-diseno-v3-fila">
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Posición</span>
              <select aria-label="Posición del nuevo travesaño" value={posicion}
                onChange={e => setPosicion(e.target.value as PosicionTravesano)}>
                <option value="HB">Horizontal (Abajo)</option>
                <option value="HA">Horizontal (Arriba)</option>
                <option value="VI">Vertical (Izquierda)</option>
                <option value="VD">Vertical (Derecha)</option>
              </select>
            </label>
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Reparto</span>
              <select aria-label="Reparto del nuevo travesaño" value={String(tipoCota)}
                onChange={e => setTipoCota(Number(e.target.value) as 0 | 2)}>
                <option value="2">Cota fija (mm)</option>
                <option value="0">Equidistante</option>
              </select>
            </label>
            {tipoCota === 2 ? (
              <label className="al-designer-measure">
                <span className="al-designer-properties-label">Cota (mm)</span>
                <input aria-label="Cota del nuevo travesaño" type="number" min={1} step={1} className="cifra"
                  value={cotaMm} onChange={e => setCotaMm(Number(e.target.value) || 0)} />
              </label>
            ) : (
              <label className="al-designer-measure">
                <span className="al-designer-properties-label">Huecos</span>
                <input aria-label="Huecos equidistantes" type="number" min={2} max={6} step={1} className="cifra"
                  value={huecosDiv} onChange={e => setHuecosDiv(Number(e.target.value) || 2)} />
              </label>
            )}
            <button type="button" className="al-command"
              onClick={() => onDividir({ posicion, tipoCota, huecos: huecosDiv, cotaMm })}>
              Añadir travesaño
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

