'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import {
  cambiarEstructuraModuloCerramiento, crearConfiguracionCerramiento, dependientesModulo,
  eliminarModuloConDependientes, esConfiguracionCerramiento, esModuloRaiz, insertarModuloEnAnclaje,
  medidasCerramiento, moduloDesdePlantilla, plantillaDiseno, PLANTILLAS_DISENO, posicionesCerramiento,
  primerHueco, type AnclajeLibre, type ConfiguracionCerramiento, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { LienzoCerramiento, type ParteSeleccionada } from './lienzo-cerramiento.tsx'
import { useBorradoresCerramiento } from './use-borradores-cerramiento.ts'
import { EditorUnion } from './editor-union.tsx'
import { CatalogoInferior, TIPO_ARRASTRE_ESTRUCTURA } from './disenador/catalogo-inferior.tsx'
import { ListaElementos, entradasCerramiento, type Entrada } from './disenador/lista-elementos.tsx'
import { PanelElemento } from './disenador/panel-elemento.tsx'
import styles from '../presupuesto-movil.module.css'

type Vista = 'catalogo' | 'propiedades'

function seleccionModulo(configuracion: ConfiguracionCerramiento, id: string): ParteSeleccionada {
  const modulo = configuracion.modulos.find((actual) => actual.id === id)!
  const plantilla = plantillaDiseno(modulo.estructuraCodigo) ?? PLANTILLAS_DISENO[0]
  return { moduloId: id, elemento: primerHueco(plantilla.composicion).id, parte: 'vidrio' }
}

/**
 * Configurador de cerramientos con la disposición de Productor: lienzo, lista
 * de elementos y uniones, y barra inferior que alterna catálogo y propiedades.
 * `vacio` abre sin elementos, como el configurador original.
 */
export function DisenadorEstructura({
  codigo, anchoMm, altoMm, configuracionInicial, vacio = false, onConfiguracionChange,
  onDimensionesChange, onValidezChange,
}: {
  codigo: string
  anchoMm: number
  altoMm: number
  configuracionInicial?: ConfiguracionCerramiento
  vacio?: boolean
  onConfiguracionChange: (configuracion: ConfiguracionCerramiento) => void
  onDimensionesChange: (anchoMm: number, altoMm: number) => void
  onValidezChange?: (valida: boolean) => void
}) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionCerramiento | null>(() => {
    if (configuracionInicial) return configuracionInicial
    if (vacio) return null
    const base = crearConfiguracionCerramiento(plantillaDiseno(codigo) ?? PLANTILLAS_DISENO[0])
    return { ...base, modulos: [{ ...base.modulos[0], anchoMm, altoMm }] }
  })
  const edicion = useBorradoresCerramiento(configuracion, setConfiguracion)
  const [seleccion, setSeleccion] = useState<ParteSeleccionada | null>(() =>
    configuracion ? seleccionModulo(configuracion, configuracion.modulos[0].id) : null)
  const [vista, setVista] = useState<Vista>(configuracion ? 'propiedades' : 'catalogo')
  const [preparada, setPreparada] = useState<PlantillaDiseno | null>(null)
  const [arrastrada, setArrastrada] = useState<PlantillaDiseno | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const insertando = arrastrada ?? preparada

  useEffect(() => {
    if (!configuracion) {
      onValidezChange?.(false)
      return
    }
    const medidas = medidasCerramiento(configuracion)
    onConfiguracionChange(configuracion)
    onDimensionesChange(medidas.anchoMm, medidas.altoMm)
    onValidezChange?.(esConfiguracionCerramiento(configuracion) && !edicion.pendientes)
  }, [configuracion, edicion.pendientes, onConfiguracionChange, onDimensionesChange, onValidezChange])

  const terminarInsercion = () => { setPreparada(null); setArrastrada(null) }
  const colocar = (plantilla: PlantillaDiseno, anclaje: AnclajeLibre | null) => {
    if (edicion.pendientes) return
    const siguiente = !configuracion || !anclaje
      ? crearConfiguracionCerramiento(plantilla)
      : insertarModuloEnAnclaje(configuracion, moduloDesdePlantilla(plantilla), anclaje)
    if (configuracion && siguiente === configuracion) {
      setAviso(`${plantilla.codigo} no cabe en esa posición sin solapar otro elemento.`)
      return
    }
    setAviso(null)
    setConfiguracion(siguiente)
    setSeleccion(seleccionModulo(siguiente, siguiente.modulos.at(-1)!.id))
    terminarInsercion()
  }

  const seleccionar = (parte: ParteSeleccionada) => { setSeleccion(parte); setVista('propiedades') }
  const seleccionarEntrada = (entrada: Entrada) => seleccionar(entrada.tipo === 'modulo'
    ? seleccionModulo(configuracion!, entrada.id)
    : { moduloId: entrada.id, elemento: entrada.id, parte: 'union' })

  const modulo = configuracion && seleccion?.parte !== 'union'
    ? configuracion.modulos.find((actual) => actual.id === seleccion?.moduloId) ?? null : null
  const union = configuracion && seleccion?.parte === 'union'
    ? configuracion.uniones.find((actual) => actual.id === seleccion.elemento) ?? null : null
  const medidas = configuracion ? medidasCerramiento(configuracion) : { anchoMm: 0, altoMm: 0 }

  const eliminar = () => {
    if (!configuracion || !modulo) return
    const dependientes = dependientesModulo(configuracion, modulo.id).length
    const pregunta = dependientes
      ? `¿Desea eliminar el elemento seleccionado y ${dependientes} ${dependientes === 1 ? 'elemento que depende' : 'elementos que dependen'} de él?`
      : '¿Desea eliminar el elemento seleccionado?'
    if (!window.confirm(pregunta)) return
    const siguiente = eliminarModuloConDependientes(configuracion, modulo.id)
    const quedan = new Set([...siguiente.modulos, ...siguiente.uniones].map((actual) => actual.id))
    configuracion.modulos.filter((m) => !quedan.has(m.id)).forEach((m) => edicion.descartar('modulos', m.id))
    configuracion.uniones.filter((u) => !quedan.has(u.id)).forEach((u) => edicion.descartar('uniones', u.id))
    setConfiguracion(siguiente)
    setSeleccion(seleccionModulo(siguiente, siguiente.modulos[0].id))
  }

  return (
    <section className={`${styles.designer} al-designer`} aria-label="Diseñador de cerramientos"
      onKeyDown={(evento) => { if (evento.key === 'Escape' && insertando) terminarInsercion() }}>
      <header className="al-designer-toolbar">
        <strong>CERRAMIENTO · {configuracion?.modulos.length ?? 0} {configuracion?.modulos.length === 1 ? 'ELEMENTO' : 'ELEMENTOS'}</strong>
        <div className="al-designer-vistas" role="group" aria-label="Barra inferior">
          <button type="button" aria-pressed={vista === 'catalogo'} onClick={() => setVista('catalogo')}>Catálogo</button>
          <button type="button" aria-pressed={vista === 'propiedades'} disabled={!configuracion}
            onClick={() => setVista('propiedades')}>Propiedades</button>
        </div>
        <span className="al-designer-global">
          Ancho <b className="cifra">{medidas.anchoMm}</b> mm × Alto <b className="cifra">{medidas.altoMm}</b> mm
        </span>
      </header>

      <div className="al-designer-canvas" data-testid="designer-canvas" data-insertando={Boolean(insertando) || undefined}>
        {configuracion
          ? <LienzoCerramiento configuracion={configuracion} moduloActivoId={modulo?.id ?? ''}
              seleccion={seleccion ?? { moduloId: '', elemento: '', parte: 'vidrio' }}
              onModuloActivo={() => undefined} onSeleccion={seleccionar}
              insercion={{ activa: Boolean(insertando) && !edicion.pendientes,
                onInsertar: (anclaje) => colocar(insertando!, anclaje) }} />
          : <LienzoVacio preparada={preparada} onColocar={(plantilla) => colocar(plantilla, null)} />}
      </div>

      <aside className="al-designer-lista">
        <ListaElementos configuracion={configuracion}
          seleccionadoId={seleccion?.parte === 'union' ? seleccion.elemento : modulo?.id ?? null}
          onSeleccionar={seleccionarEntrada} />
      </aside>

      <div className="al-designer-inferior">
        {edicion.pendientes && <p role="status">Hay cambios pendientes de actualizar.</p>}
        {edicion.error && <p role="alert">{edicion.error}</p>}
        {aviso && <p role="alert">{aviso}</p>}
        {vista === 'catalogo' || !configuracion
          ? <CatalogoInferior preparada={preparada} onPreparar={setPreparada} onArrastre={setArrastrada} />
          : modulo
            ? <PanelElemento modulo={{ ...modulo, ...edicion.borradores.modulos[modulo.id] }}
                indice={entradasCerramiento(configuracion).find((e) => e.id === modulo.id)!.indice}
                rect={posicionesCerramiento(configuracion).modulos.get(modulo.id)!}
                pendiente={Boolean(edicion.borradores.modulos[modulo.id])} bloqueado={edicion.pendientes}
                preparada={preparada} eliminable={!esModuloRaiz(configuracion, modulo.id)}
                onChange={(cambios) => edicion.editarModulo(modulo.id, cambios)}
                onActualizar={() => edicion.aplicar('modulos', modulo.id)}
                onDescartar={() => edicion.descartar('modulos', modulo.id)}
                onSustituir={() => preparada && setConfiguracion(
                  cambiarEstructuraModuloCerramiento(configuracion, modulo.id, preparada))}
                onEliminar={eliminar} />
            : union && <div className="al-designer-union-editor">
                <EditorUnion union={{ ...union, ...edicion.borradores.uniones[union.id] }}
                  indice={entradasCerramiento(configuracion).find((e) => e.id === union.id)!.indice}
                  pendiente={Boolean(edicion.borradores.uniones[union.id])}
                  onChange={(cambios) => edicion.editarUnion(union.id, cambios)}
                  onActualizar={() => edicion.aplicar('uniones', union.id)}
                  onDescartar={() => edicion.descartar('uniones', union.id)} />
              </div>}
      </div>
    </section>
  )
}

function LienzoVacio({ preparada, onColocar }: {
  preparada: PlantillaDiseno | null
  onColocar: (plantilla: PlantillaDiseno) => void
}) {
  return (
    <div className="al-lienzo-vacio"
      onDragOver={(evento) => { evento.preventDefault(); evento.dataTransfer.dropEffect = 'copy' }}
      onDrop={(evento) => {
        evento.preventDefault()
        const plantilla = plantillaDiseno(evento.dataTransfer.getData(TIPO_ARRASTRE_ESTRUCTURA))
        if (plantilla) onColocar(plantilla)
      }}>
      {preparada && <button type="button" className="al-command-primary" onClick={() => onColocar(preparada)}>
        Colocar {preparada.codigo}
      </button>}
    </div>
  )
}
