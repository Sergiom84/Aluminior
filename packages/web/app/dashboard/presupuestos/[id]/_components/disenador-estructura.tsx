'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  anadirModuloCerramiento, buscarHueco, crearConfiguracionCerramiento,
  distribuirComposicion, eliminarModuloCerramiento, medidasCerramiento,
  plantillaDiseno, PLANTILLAS_DISENO, primerHueco, UNIONES_VISUALES,
  type AperturaVisual, type ClaseSeparador, type ConfiguracionCerramiento,
  type PlantillaDiseno,
} from '@aluminior/core/estructuras'

type ParteVisual = 'marco' | 'hoja' | 'vidrio' | 'travesano' | 'union'
type ParteSeleccionada = { elemento: string; parte: ParteVisual }
export function DisenadorEstructura({
  codigo, anchoMm, altoMm, configuracionInicial, onConfiguracionChange, onDimensionesChange,
}: {
  codigo: string
  anchoMm: number
  altoMm: number
  configuracionInicial?: ConfiguracionCerramiento
  onConfiguracionChange: (configuracion: ConfiguracionCerramiento) => void
  onDimensionesChange: (anchoMm: number, altoMm: number) => void
}) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionCerramiento>(() => {
    if (configuracionInicial) return configuracionInicial
    const base = crearConfiguracionCerramiento(plantillaDiseno(codigo) ?? PLANTILLAS_DISENO[0])
    return {
      ...base,
      modulos: [{ ...base.modulos[0], anchoMm, altoMm }],
    }
  })
  const [moduloActivoId, setModuloActivoId] = useState(configuracion.modulos[0].id)
  const moduloActivo = configuracion.modulos.find((modulo) => modulo.id === moduloActivoId)
    ?? configuracion.modulos[0]
  const plantilla = plantillaDiseno(moduloActivo.estructuraCodigo) ?? PLANTILLAS_DISENO[0]
  const inicial = primerHueco(plantilla.composicion)
  const [seleccion, setSeleccion] = useState<ParteSeleccionada>({
    elemento: inicial.id, parte: 'vidrio',
  })

  const elegir = (siguiente: PlantillaDiseno) => {
    setConfiguracion((actual) => ({
      ...actual,
      modulos: actual.modulos.map((modulo) => modulo.id === moduloActivo.id
        ? { ...modulo, estructuraCodigo: siguiente.codigo }
        : modulo),
    }))
    setSeleccion({ elemento: primerHueco(siguiente.composicion).id, parte: 'vidrio' })
  }

  const actualizarModulo = (cambios: Partial<{ anchoMm: number; altoMm: number }>) => {
    setConfiguracion((actual) => ({
      ...actual,
      modulos: actual.modulos.map((modulo) => modulo.id === moduloActivo.id
        ? { ...modulo, ...cambios }
        : modulo),
    }))
  }

  const anadirModulo = () => {
    setConfiguracion((actual) => {
      const siguiente = anadirModuloCerramiento(actual, plantilla)
      setModuloActivoId(siguiente.modulos.at(-1)!.id)
      return siguiente
    })
  }

  const eliminarModulo = () => {
    setConfiguracion((actual) => {
      const indice = actual.modulos.findIndex((modulo) => modulo.id === moduloActivo.id)
      const siguiente = eliminarModuloCerramiento(actual, moduloActivo.id)
      const nuevoActivo = siguiente.modulos[Math.min(indice, siguiente.modulos.length - 1)]
      setModuloActivoId(nuevoActivo.id)
      return siguiente
    })
  }

  useEffect(() => {
    const medidas = medidasCerramiento(configuracion)
    onConfiguracionChange(configuracion)
    onDimensionesChange(medidas.anchoMm, medidas.altoMm)
  }, [configuracion, onConfiguracionChange, onDimensionesChange])

  const huecoSeleccionado = buscarHueco(plantilla.composicion, seleccion.elemento)

  const familias = useMemo(
    () => [...new Set(PLANTILLAS_DISENO.map((item) => item.familia))],
    [],
  )

  return (
    <section className="al-designer" aria-label="Diseñador de cerramientos">
      <aside className="al-designer-catalog" aria-label="Catálogo de estructuras">
        <div className="al-designer-catalog-title">Estructuras</div>
        {familias.map((familia) => (
          <div key={familia} className="al-designer-family">
            <div className="al-designer-family-name">{familia}</div>
            <div className="al-designer-thumbs">
              {PLANTILLAS_DISENO.filter((item) => item.familia === familia).map((item) => (
                <button key={item.codigo} type="button" onClick={() => elegir(item)}
                  className="al-designer-thumb" data-selected={item.codigo === plantilla.codigo}
                  title={item.descripcion} aria-label={`${item.codigo}: ${item.descripcion}`}>
                  <DibujoEstructura plantilla={item} compacto />
                  <span>{item.codigo}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <div className="al-designer-workspace">
        <header className="al-designer-toolbar">
          <strong>CERRAMIENTO · {configuracion.modulos.length} {configuracion.modulos.length === 1 ? 'ELEMENTO' : 'ELEMENTOS'}</strong>
          <span className="cifra">{medidasCerramiento(configuracion).anchoMm} × {medidasCerramiento(configuracion).altoMm} mm</span>
          <span className="al-designer-scale">Escala automática</span>
        </header>
        <div className="al-designer-canvas" data-testid="designer-canvas">
          <div className="al-chain-drawing" role="group" aria-label="Composición del cerramiento">
            {configuracion.modulos.map((modulo, indice) => {
              const dibujo = plantillaDiseno(modulo.estructuraCodigo) ?? PLANTILLAS_DISENO[0]
              return (
                <div key={modulo.id} className="al-chain-segment">
                  <button type="button" className="al-chain-module"
                    data-selected={modulo.id === moduloActivo.id}
                    style={{ flexGrow: modulo.anchoMm }}
                    aria-label={`Elemento ${indice + 1}: ${dibujo.descripcion}`}
                    onClick={() => {
                      setModuloActivoId(modulo.id)
                      setSeleccion({ elemento: primerHueco(dibujo.composicion).id, parte: 'vidrio' })
                    }}>
                    <DibujoEstructura plantilla={dibujo} anchoMm={modulo.anchoMm}
                      altoMm={modulo.altoMm}
                      seleccion={modulo.id === moduloActivo.id ? seleccion : undefined}
                      onSeleccion={modulo.id === moduloActivo.id ? setSeleccion : undefined} />
                  </button>
                  {configuracion.uniones[indice] && (
                    <button type="button" className="al-chain-union"
                      data-selected={seleccion.elemento === configuracion.uniones[indice].id}
                      onClick={() => setSeleccion({
                        elemento: configuracion.uniones[indice].id, parte: 'union',
                      })}
                      aria-label={`Unión ${indice + 1}: ${configuracion.uniones[indice].codigo}`}>
                      <span>{configuracion.uniones[indice].codigo}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="al-designer-properties">
          <div>
            <span className="al-designer-properties-label">Elemento seleccionado</span>
            <strong>{nombreParte(seleccion.parte)}</strong>
          </div>
          <div>
            <span className="al-designer-properties-label">Módulo</span>
            <strong className="cifra">{seleccion.elemento.replaceAll('-', ' ')}</strong>
          </div>
          <div>
            <span className="al-designer-properties-label">Estructura</span>
            <strong className="cifra">{plantilla.codigo}</strong>
          </div>
          <label className="al-designer-measure">
            <span className="al-designer-properties-label">Ancho elemento</span>
            <input type="number" min={100} step={10} value={moduloActivo.anchoMm}
              onChange={(evento) => actualizarModulo({ anchoMm: Number(evento.target.value) })} />
          </label>
          <label className="al-designer-measure">
            <span className="al-designer-properties-label">Alto elemento</span>
            <input type="number" min={100} step={10} value={moduloActivo.altoMm}
              onChange={(evento) => actualizarModulo({ altoMm: Number(evento.target.value) })} />
          </label>
          <div className="al-designer-part-picker" aria-label="Seleccionar elemento">
            {(['marco', 'hoja', 'vidrio'] as const).map((parte) => (
              <button key={parte} type="button"
                disabled={
                  (parte === 'hoja' && (!huecoSeleccionado || huecoSeleccionado.apertura === 'fijo')) ||
                  (parte === 'vidrio' && !huecoSeleccionado)
                }
                data-selected={seleccion.parte === parte}
                onClick={() => setSeleccion({ elemento: seleccion.elemento, parte })}>
                {nombreParte(parte)}
              </button>
            ))}
            <button type="button" onClick={anadirModulo}>Añadir a la derecha</button>
            <button type="button" onClick={eliminarModulo}
              disabled={configuracion.modulos.length === 1}>Eliminar elemento</button>
          </div>
        </div>
        {configuracion.uniones.length > 0 && (
          <div className="al-designer-union-editor" aria-label="Uniones entre elementos">
            {configuracion.uniones.map((union, indice) => (
              <fieldset key={union.id}>
                <legend>Unión {indice + 1}</legend>
                <select value={union.codigo} onChange={(evento) => {
                  const catalogo = UNIONES_VISUALES.find((item) => item.codigo === evento.target.value)!
                  setConfiguracion((actual) => ({
                    ...actual,
                    uniones: actual.uniones.map((item) => item.id === union.id
                      ? { ...item, codigo: catalogo.codigo, grosorMm: catalogo.grosorMm }
                      : item),
                  }))
                }}>
                  {UNIONES_VISUALES.map((item) => (
                    <option key={item.codigo} value={item.codigo}>{item.codigo} · {item.descripcion}</option>
                  ))}
                </select>
                <label>Longitud
                  <input type="number" min={100} step={10} value={union.longitudMm}
                    onChange={(evento) => setConfiguracion((actual) => ({
                      ...actual,
                      uniones: actual.uniones.map((item) => item.id === union.id
                        ? { ...item, longitudMm: Number(evento.target.value) }
                        : item),
                    }))} />
                  <span>mm</span>
                </label>
                <label>Grosor
                  <input type="number" min={1} step={1} value={union.grosorMm}
                    onChange={(evento) => setConfiguracion((actual) => ({
                      ...actual,
                      uniones: actual.uniones.map((item) => item.id === union.id
                        ? { ...item, grosorMm: Number(evento.target.value) }
                        : item),
                    }))} />
                  <span>mm</span>
                </label>
              </fieldset>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function nombreParte(parte: ParteVisual) {
  if (parte === 'marco') return 'Marco exterior'
  if (parte === 'hoja') return 'Hoja'
  if (parte === 'travesano') return 'Travesaño'
  if (parte === 'union') return 'Unión'
  return 'Vidrio'
}

function DibujoEstructura({
  plantilla, compacto = false, anchoMm = plantilla.anchoMm, altoMm = plantilla.altoMm,
  seleccion, onSeleccion,
}: {
  plantilla: PlantillaDiseno
  compacto?: boolean
  anchoMm?: number
  altoMm?: number
  seleccion?: ParteSeleccionada
  onSeleccion?: (seleccion: ParteSeleccionada) => void
}) {
  const viewH = compacto ? 420 : 500
  const margen = compacto ? 24 : 38
  const altoDibujo = viewH - margen * 2
  const proporcionReal = compacto
    ? plantilla.anchoMm / Math.max(1, plantilla.altoMm)
    : anchoMm / Math.max(1, altoMm)
  const proporcion = Math.max(0.25, Math.min(4, proporcionReal))
  const viewW = Math.max(260, Math.min(820, altoDibujo * proporcion + margen * 2))
  const elementos = distribuirComposicion(plantilla.composicion, {
    x: margen, y: margen, ancho: viewW - margen * 2, alto: viewH - margen * 2,
  }, compacto ? 12 : 18)
  const marco = compacto ? 13 : 20

  return (
    <svg className="al-window-drawing" viewBox={`0 0 ${viewW} ${viewH}`}
      role="img" aria-label={plantilla.descripcion} preserveAspectRatio="xMidYMid meet">
      <g onClick={() => onSeleccion?.({ elemento: 'marco', parte: 'marco' })}
        className="al-window-part">
        <rect x={margen} y={margen} width={viewW - margen * 2} height={viewH - margen * 2}
          className={seleccion?.parte === 'marco' ? 'al-frame al-part-selected' : 'al-frame'} />
      </g>
      {elementos.filter((e) => e.tipo === 'hueco').map((hueco) => {
        const { x, y, ancho: w, alto: h } = hueco
        const esFijo = hueco.apertura === 'fijo'
        const relleno = esFijo ? marco * .7 : marco
        return (
          <g key={hueco.id}>
            {!esFijo && (
              <MarcoModulo x={x} y={y} w={w} h={h} grosor={marco}
                seleccionado={seleccion?.elemento === hueco.id && seleccion.parte === 'hoja'}
                onClick={() => onSeleccion?.({ elemento: hueco.id, parte: 'hoja' })} />
            )}
            <Vidrio x={x + relleno} y={y + relleno}
              w={Math.max(3, w - relleno * 2)} h={Math.max(3, h - relleno * 2)}
              seleccionado={seleccion?.elemento === hueco.id && seleccion.parte === 'vidrio'}
              onClick={() => onSeleccion?.({ elemento: hueco.id, parte: 'vidrio' })} />
            <SimboloApertura apertura={hueco.apertura} x={x + marco} y={y + marco}
              w={Math.max(3, w - marco * 2)} h={Math.max(3, h - marco * 2)} />
            {!esFijo && !compacto && (
              <>
                <Tirador apertura={hueco.apertura} x={x} y={y} w={w} h={h} />
                <Bisagras apertura={hueco.apertura} x={x} y={y} w={w} h={h} />
              </>
            )}
          </g>
        )
      })}
      {elementos.filter((e) => e.tipo === 'separador').map((separador) => (
        <Separador key={separador.id} {...separador}
          seleccionado={seleccion?.elemento === separador.id}
          onClick={() => onSeleccion?.({
            elemento: separador.id,
            parte: separador.clase === 'union' ? 'union' : 'travesano',
          })} />
      ))}
    </svg>
  )
}

function Separador({
  x, y, ancho, alto, clase, seleccionado, onClick,
}: {
  x: number; y: number; ancho: number; alto: number; clase: ClaseSeparador
  seleccionado: boolean; onClick: () => void
}) {
  const claseCss = clase === 'union' ? 'al-union' : clase === 'travesano'
    ? 'al-traverse' : 'al-invisible-divider'
  return (
    <g onClick={onClick} className="al-window-part">
      <rect x={x} y={y} width={ancho} height={alto}
        className={`${claseCss}${seleccionado ? ' al-part-selected' : ''}`} />
    </g>
  )
}

function MarcoModulo({ x, y, w, h, grosor, seleccionado, onClick }: {
  x: number; y: number; w: number; h: number; grosor: number
  seleccionado: boolean; onClick: () => void
}) {
  return (
    <g onClick={onClick} className="al-window-part">
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4}
        className={seleccionado ? 'al-sash al-part-selected' : 'al-sash'} />
      <line x1={x} y1={y} x2={x + grosor} y2={y + grosor} className="al-mitre" />
      <line x1={x + w} y1={y} x2={x + w - grosor} y2={y + grosor} className="al-mitre" />
      <line x1={x} y1={y + h} x2={x + grosor} y2={y + h - grosor} className="al-mitre" />
      <line x1={x + w} y1={y + h} x2={x + w - grosor} y2={y + h - grosor} className="al-mitre" />
    </g>
  )
}

function Vidrio({ x, y, w, h, seleccionado, onClick }: {
  x: number; y: number; w: number; h: number; seleccionado: boolean; onClick: () => void
}) {
  return <rect x={x} y={y} width={w} height={h} onClick={onClick}
    className={seleccionado ? 'al-glass al-part-selected' : 'al-glass'} />
}

function SimboloApertura({ apertura, x, y, w, h }: {
  apertura: AperturaVisual; x: number; y: number; w: number; h: number
}) {
  if (apertura === 'fijo') return null
  const derecha = apertura.endsWith('derecha')
  const bisagraX = derecha ? x : x + w
  const cierreX = derecha ? x + w : x
  const oscilo = apertura.startsWith('oscilobatiente')
  return (
    <g pointerEvents="none">
      <path d={`M ${bisagraX} ${y} L ${cierreX} ${y + h / 2} L ${bisagraX} ${y + h}`}
        className="al-opening-line" />
      {oscilo && (
        <path d={`M ${x} ${y + h} L ${x + w / 2} ${y} L ${x + w} ${y + h}`}
          className="al-opening-line al-opening-tilt" />
      )}
    </g>
  )
}

function Tirador({ apertura, x, y, w, h }: {
  apertura: AperturaVisual; x: number; y: number; w: number; h: number
}) {
  const derecha = apertura.endsWith('derecha')
  const tx = derecha ? x + w - 12 : x + 12
  return (
    <g className="al-handle" pointerEvents="none">
      <rect x={tx - 3} y={y + h / 2 - 18} width={6} height={36} rx={2} />
      <line x1={tx} y1={y + h / 2} x2={derecha ? tx - 9 : tx + 9} y2={y + h / 2} />
    </g>
  )
}

function Bisagras({ apertura, x, y, w, h }: {
  apertura: AperturaVisual; x: number; y: number; w: number; h: number
}) {
  const derecha = apertura.endsWith('derecha')
  const bx = derecha ? x - 3 : x + w - 3
  return (
    <g className="al-hinge" pointerEvents="none">
      <rect x={bx} y={y + 24} width={6} height={30} rx={2} />
      <rect x={bx} y={y + h - 54} width={6} height={30} rx={2} />
    </g>
  )
}
