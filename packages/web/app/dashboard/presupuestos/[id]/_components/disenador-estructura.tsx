'use client'

import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  anadirModuloCerramiento, buscarHueco,
  cambiarEstructuraModuloCerramiento, crearConfiguracionCerramiento,
  eliminarModuloCerramiento, esConfiguracionCerramiento, medidasCerramiento,
  plantillaDiseno, PLANTILLAS_DISENO, primerHueco,
  type ConfiguracionCerramiento, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { DibujoEstructura } from './dibujo-estructura.tsx'
import { LienzoCerramiento, type ParteSeleccionada } from './lienzo-cerramiento.tsx'
import { useBorradoresCerramiento } from './use-borradores-cerramiento.ts'
import { MedidasElemento } from './medidas-elemento.tsx'
import { EditorUnion } from './editor-union.tsx'
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
  const edicion = useBorradoresCerramiento(configuracion, setConfiguracion)
  const [moduloActivoId, setModuloActivoId] = useState(configuracion.modulos[0].id)
  const moduloActivo = configuracion.modulos.find((modulo) => modulo.id === moduloActivoId)
    ?? configuracion.modulos[0]
  const plantilla = plantillaDiseno(moduloActivo.estructuraCodigo) ?? PLANTILLAS_DISENO[0]
  const inicial = primerHueco(plantilla.composicion)
  const [seleccion, setSeleccion] = useState<ParteSeleccionada>({
    moduloId: moduloActivo.id, elemento: inicial.id, parte: 'vidrio',
  })

  const elegir = (siguiente: PlantillaDiseno) => {
    edicion.descartar('modulos', moduloActivo.id)
    setConfiguracion((actual) => cambiarEstructuraModuloCerramiento(
      actual, moduloActivo.id, siguiente,
    ))
    setSeleccion({ moduloId: moduloActivo.id,
      elemento: primerHueco(siguiente.composicion).id, parte: 'vidrio' })
  }


  const anadirModulo = () => {
    setConfiguracion((actual) => {
      const siguiente = anadirModuloCerramiento(actual, plantilla)
      setModuloActivoId(siguiente.modulos.at(-1)!.id)
      return siguiente
    })
  }

  const eliminarModulo = () => {
    edicion.descartar('modulos', moduloActivo.id)
    const indiceActual = configuracion.modulos.findIndex(item => item.id === moduloActivo.id)
    const unionEliminada = configuracion.uniones[indiceActual === configuracion.modulos.length - 1 ? indiceActual - 1 : indiceActual]
    if (unionEliminada) edicion.descartar('uniones', unionEliminada.id)
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
    onValidezChange?.(esConfiguracionCerramiento(configuracion) && !edicion.pendientes)
  }, [configuracion, edicion.pendientes, onConfiguracionChange, onDimensionesChange, onValidezChange])

  const huecoSeleccionado = buscarHueco(plantilla.composicion, seleccion.elemento)

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
                <button key={item.codigo} type="button" disabled={edicion.pendientes} onClick={() => elegir(item)}
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
        {edicion.pendientes && <p role="status">Hay cambios pendientes de actualizar.</p>}
        {edicion.error && <p role="alert">{edicion.error}</p>}
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
          <MedidasElemento modulo={{ ...moduloActivo, ...edicion.borradores.modulos[moduloActivo.id] }}
            pendiente={Boolean(edicion.borradores.modulos[moduloActivo.id])}
            onChange={cambios => edicion.editarModulo(moduloActivo.id, cambios)}
            onActualizar={() => edicion.aplicar('modulos', moduloActivo.id)}
            onDescartar={() => edicion.descartar('modulos', moduloActivo.id)} />
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
            <button type="button" disabled={edicion.pendientes} onClick={anadirModulo}>Añadir a la derecha</button>
            <button type="button" onClick={eliminarModulo}
              disabled={edicion.pendientes || configuracion.modulos.length === 1}>Eliminar elemento</button>
          </div>
        </div>
        {configuracion.uniones.length > 0 && (
          <div className="al-designer-union-editor" aria-label="Uniones entre elementos">
            {configuracion.uniones.map((union, indice) => (
              <EditorUnion key={union.id} indice={indice}
                union={{ ...union, ...edicion.borradores.uniones[union.id] }}
                pendiente={Boolean(edicion.borradores.uniones[union.id])}
                onChange={cambios => edicion.editarUnion(union.id, cambios)}
                onActualizar={() => edicion.aplicar('uniones', union.id)}
                onDescartar={() => edicion.descartar('uniones', union.id)} />
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
