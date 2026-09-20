'use client'

import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  actualizarFiModuloCerramiento, actualizarModuloCerramiento, anadirModuloCerramiento, buscarHueco,
  cambiarEstructuraModuloCerramiento, crearConfiguracionCerramiento,
  eliminarModuloCerramiento, esConfiguracionCerramiento, medidasCerramiento,
  plantillaDiseno, PLANTILLAS_DISENO, primerHueco, UNIONES_VISUALES,
  resolverGeometriaFi1Ofi,
  type ConfiguracionCerramiento, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { DibujoEstructura } from './dibujo-estructura.tsx'
import { LienzoCerramiento, type ParteSeleccionada } from './lienzo-cerramiento.tsx'
import styles from '../presupuesto-movil.module.css'

export function DisenadorEstructura({
  codigo, anchoMm, altoMm, configuracionInicial, onConfiguracionChange, onDimensionesChange,
  onValidezChange,
}: {
  codigo: string
  anchoMm: number
  altoMm: number
  configuracionInicial?: ConfiguracionCerramiento
  onConfiguracionChange: (configuracion: ConfiguracionCerramiento) => void
  onDimensionesChange: (anchoMm: number, altoMm: number) => void
  onValidezChange?: (valida: boolean) => void
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
    moduloId: moduloActivo.id, elemento: inicial.id, parte: 'vidrio',
  })

  const elegir = (siguiente: PlantillaDiseno) => {
    setConfiguracion((actual) => cambiarEstructuraModuloCerramiento(
      actual, moduloActivo.id, siguiente,
    ))
    setSeleccion({ moduloId: moduloActivo.id,
      elemento: primerHueco(siguiente.composicion).id, parte: 'vidrio' })
  }

  const actualizarModulo = (cambios: Partial<{ anchoMm: number; altoMm: number }>) => {
    setConfiguracion((actual) => actualizarModuloCerramiento(actual, moduloActivo.id, cambios))
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
    onValidezChange?.(esConfiguracionCerramiento(configuracion))
  }, [configuracion, onConfiguracionChange, onDimensionesChange, onValidezChange])

  const huecoSeleccionado = buscarHueco(plantilla.composicion, seleccion.elemento)
  const geometriaFi = plantilla.codigo === '1OFI' && Object.hasOwn(moduloActivo, 'fiMm')
    ? resolverGeometriaFi1Ofi(moduloActivo.anchoMm, moduloActivo.altoMm, moduloActivo.fiMm)
    : null

  const familias = useMemo(
    () => [...new Set(PLANTILLAS_DISENO.map((item) => item.familia))],
    [],
  )

  return (
    <section className={`${styles.designer} al-designer`} aria-label="Diseñador de cerramientos">
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
          <LienzoCerramiento configuracion={configuracion} moduloActivoId={moduloActivo.id}
            seleccion={seleccion} onModuloActivo={setModuloActivoId} onSeleccion={(parte) => {
              setSeleccion(parte)
              if (configuracion.modulos.some(m => m.id === parte.moduloId)) setModuloActivoId(parte.moduloId)
            }} />
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
          {plantilla.codigo === '1OFI' && (
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">FIJO INFERIOR</span>
              <input type="number" step="any" value={moduloActivo.fiMm ?? ''}
                aria-invalid={geometriaFi?.valido === false || undefined}
                aria-describedby={geometriaFi?.valido === false ? `fi-error-${moduloActivo.id}` : undefined}
                onChange={(evento) => setConfiguracion((actual) => actualizarFiModuloCerramiento(
                  actual, moduloActivo.id,
                  evento.target.value === '' ? Number.NaN : Number(evento.target.value),
                ))} />
              <span>mm</span>
              {geometriaFi?.valido === false && (
                <small id={`fi-error-${moduloActivo.id}`} style={{ color: 'var(--al-error)' }}>
                  FI debe ser un número mayor que 0 y menor que el alto del elemento.
                </small>
              )}
            </label>
          )}
          <div className="al-designer-part-picker" aria-label="Seleccionar elemento">
            {(['marco', 'hoja', 'vidrio'] as const).map((parte) => (
              <button key={parte} type="button"
                disabled={
                  (parte === 'hoja' && (!huecoSeleccionado || huecoSeleccionado.apertura === 'fijo')) ||
                  (parte === 'vidrio' && !huecoSeleccionado)
                }
                data-selected={seleccion.parte === parte}
                onClick={() => setSeleccion({ ...seleccion, parte })}>
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
                <select aria-label={`Código unión ${indice + 1}`} value={union.codigo} onChange={(evento) => {
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

function nombreParte(parte: ParteSeleccionada['parte']) {
  if (parte === 'marco') return 'Marco exterior'
  if (parte === 'hoja') return 'Hoja'
  if (parte === 'travesano') return 'Travesaño'
  if (parte === 'union') return 'Unión'
  return 'Vidrio'
}
