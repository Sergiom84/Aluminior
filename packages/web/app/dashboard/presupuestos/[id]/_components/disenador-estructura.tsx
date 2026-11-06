'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  cambiarEstructuraModuloCerramiento, crearConfiguracionCerramiento, dependientesModulo,
  eliminarModuloConDependientes, esConfiguracionCerramiento, esModuloRaiz, insertarModuloEnAnclaje,
  medidasCerramiento, moduloDesdePlantilla, plantillaDiseno, PLANTILLAS_DISENO, posicionesCerramiento,
  UNIONES_VISUALES, type UnionVisual,
  anclajeInferior, anclajeLateral, medidasPrimeraVentana, modelosIguales, primerHueco, type AnclajeLibre, type ConfiguracionCerramiento,
  type CotasCatalogoPorEstructura, type MaterialesGenerales, type PlantillaDiseno,
} from '@aluminior/core/estructuras'
import { LienzoCerramiento, type ParteSeleccionada } from './lienzo-cerramiento.tsx'
import { useBorradoresCerramiento } from './use-borradores-cerramiento.ts'
import { EditorUnion } from './editor-union.tsx'
import { CatalogoInferior } from './disenador/catalogo-inferior.tsx'
import { ListaElementos, entradasCerramiento, type Entrada } from './disenador/lista-elementos.tsx'
import { PanelElemento } from './disenador/panel-elemento.tsx'
import { BarraDisenador, type VistaDisenador } from './disenador/barra-disenador.tsx'
import { useInsercionVentanas } from './disenador/use-insercion-ventanas.ts'
import { LienzoVacio, LienzoConExtremos } from './disenador/lienzo-insercion.tsx'
import { useMoverElemento } from './disenador/use-mover-elemento.ts'
import { useHistorialCerramiento } from './disenador/use-historial-cerramiento.ts'
import { accionDeTeclado } from './disenador/historial.ts'
import { SelectorVentana, PreguntaMedidas, OpcionesMedidas } from './disenador/dialogos-insercion.tsx'
import styles from '../presupuesto-movil.module.css'

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
  codigo, anchoMm, altoMm, configuracionInicial, vacio = false, series = [],
  catalogoUniones = UNIONES_VISUALES, cotasCatalogo = {},
  generales = { serieCodigo: null, vidrioCodigo: null }, onConfiguracionChange,
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
  series?: readonly string[]
  catalogoUniones?: readonly UnionVisual[]
  cotasCatalogo?: CotasCatalogoPorEstructura
  /** Materiales generales de la línea, para mostrar lo que heredan los elementos. */
  generales?: MaterialesGenerales
}) {
  const historial = useHistorialCerramiento(() => {
    if (configuracionInicial) return configuracionInicial
    if (vacio) return null
    const base = crearConfiguracionCerramiento(plantillaDiseno(codigo) ?? PLANTILLAS_DISENO[0])
    return { ...base, modulos: [{ ...base.modulos[0], anchoMm, altoMm }] }
  }, (siguiente) => {
    // Tras deshacer o rehacer, la selección vuelve al primero si su elemento ya no existe.
    setAviso(null)
    const existe = siguiente && seleccion && [...siguiente.modulos, ...siguiente.uniones]
      .some((p) => p.id === (seleccion.parte === 'union' ? seleccion.elemento : seleccion.moduloId))
    if (!siguiente) { setSeleccion(null); setVista('catalogo') } else if (!existe) setSeleccion(seleccionModulo(siguiente, siguiente.modulos[0].id))
  })
  const configuracion = historial.configuracion
  const setConfiguracion = historial.registrar
  const region = useRef<HTMLElement>(null)
  const enfocar = useRef<string | null>(null)
  useEffect(() => {
    if (!enfocar.current) return
    region.current?.querySelector<SVGElement>(`[data-modulo-id="${enfocar.current}"]`)?.focus()
    enfocar.current = null
  }, [configuracion])
  const edicion = useBorradoresCerramiento(configuracion, setConfiguracion, catalogoUniones)
  const [seleccion, setSeleccion] = useState<ParteSeleccionada | null>(() =>
    configuracion ? seleccionModulo(configuracion, configuracion.modulos[0].id) : null)
  const [vista, setVista] = useState<VistaDisenador>(configuracion ? 'propiedades' : 'catalogo')
  const [preparada, setPreparada] = useState<PlantillaDiseno | null>(null)
  const [arrastrada, setArrastrada] = useState<PlantillaDiseno | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const insertando = arrastrada ?? preparada
  const historialLibre = !edicion.pendientes && !insertando

  useEffect(() => {
    if (!configuracion) {
      onValidezChange?.(false)
      return
    }
    const medidas = medidasCerramiento(configuracion)
    onConfiguracionChange(configuracion)
    onDimensionesChange(medidas.anchoMm, medidas.altoMm)
    onValidezChange?.(esConfiguracionCerramiento(configuracion, catalogoUniones) && !edicion.pendientes)
  }, [configuracion, catalogoUniones, edicion.pendientes, onConfiguracionChange, onDimensionesChange, onValidezChange])

  const terminarInsercion = () => { setPreparada(null); setArrastrada(null) }
  const colocar = (plantilla: PlantillaDiseno, anclaje: AnclajeLibre | null, copiar = false) => {
    if (edicion.pendientes) return
    if (configuracion && !anclaje) return
    const referencia = copiar ? medidasPrimeraVentana(configuracion) : null
    const nuevo = { ...moduloDesdePlantilla(plantilla), ...referencia }
    const siguiente = !configuracion
      ? crearConfiguracionCerramiento(plantilla)
      : insertarModuloEnAnclaje(configuracion, nuevo, anclaje!)
    if (configuracion && siguiente === configuracion) {
      setAviso(`${plantilla.codigo} no cabe en esa posición sin solapar otro elemento.`)
      return
    }
    setAviso(null)
    enfocar.current = siguiente.modulos.at(-1)!.id
    setConfiguracion(siguiente)
    setVista('propiedades')
    setSeleccion(seleccionModulo(siguiente, siguiente.modulos.at(-1)!.id))
    terminarInsercion()
  }
  const insercion = useInsercionVentanas(configuracion, colocar)
  const mover = useMoverElemento({ configuracion, bloqueado: edicion.pendientes, onAviso: setAviso,
    onMovido: (siguiente, id) => {
      enfocar.current = id
      setConfiguracion(siguiente)
      setSeleccion(seleccionModulo(siguiente, id))
    } })
  /** Lienzo vacío: primer elemento; si no, en el anclaje dado, avisando si no hay sitio. */
  const colocarEn = (plantilla: PlantillaDiseno, anclaje: AnclajeLibre | null, donde: string) => {
    if (configuracion && !anclaje) {
      setAviso(`${plantilla.codigo} no cabe ${donde} sin solapar otro elemento.`)
      return
    }
    if (!edicion.pendientes) insercion.solicitar(plantilla, anclaje)
  }
  const colocarLateral = (plantilla: PlantillaDiseno) =>
    colocarEn(plantilla, configuracion ? anclajeLateral(configuracion) : null, 'a la derecha')

  const seleccionar = (parte: ParteSeleccionada) => { setSeleccion(parte); setVista('propiedades') }
  const seleccionarEntrada = (entrada: Entrada) => seleccionar(entrada.tipo === 'modulo'
    ? seleccionModulo(configuracion!, entrada.id)
    : { moduloId: entrada.id, elemento: entrada.id, parte: 'union' })

  const modulo = configuracion && seleccion?.parte !== 'union'
    ? configuracion.modulos.find((actual) => actual.id === seleccion?.moduloId) ?? null : null
  const union = configuracion && seleccion?.parte === 'union'
    ? configuracion.uniones.find((actual) => actual.id === seleccion.elemento) ?? null : null
  const medidas = configuracion ? medidasCerramiento(configuracion) : { anchoMm: 0, altoMm: 0 }
  const inferior = configuracion ? anclajeInferior(configuracion, modulo?.id ?? null) : null

  /** Mejora autorizada (fase 4): aplicar el borrador a los modelos iguales, anunciando cuántos. */
  const aplicarAModelos = (id: string) => {
    if (!configuracion) return
    const ids = modelosIguales(configuracion, id)
    const indices = entradasCerramiento(configuracion).filter((e) => ids.includes(e.id)).map((e) => e.indice)
    const codigo = configuracion.modulos.find((m) => m.id === id)?.estructuraCodigo
    if (window.confirm(`¿Aplicar los cambios a los ${ids.length} elementos ${codigo} (${indices.join(', ')})?`)) {
      edicion.aplicar('modulos', id, ids)
    }
  }

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
    <section ref={region} className={`${styles.designer} al-designer`} aria-label="Diseñador de cerramientos"
      onKeyDown={(evento) => {
        const accion = accionDeTeclado(evento)
        if (accion && historialLibre && !mover.moviendo) {
          evento.preventDefault()
          historial[accion]()
          return
        }
        if (evento.key !== 'Escape') return
        if (mover.moviendo) mover.cancelar()
        else if (insertando) terminarInsercion()
      }}>
      <BarraDisenador elementos={configuracion?.modulos.length ?? 0} vista={vista} onVista={setVista}
        medidas={medidas} preparada={preparada} onMedidas={insercion.abrirOpciones}
        onColocarDerecha={configuracion && preparada && !edicion.pendientes
          ? () => colocarLateral(preparada) : null}
        onColocarDebajo={configuracion && preparada && !edicion.pendientes
          ? () => colocarEn(preparada, inferior, 'debajo') : null}
        onDeshacer={historial.puedeDeshacer && historialLibre && !mover.moviendo ? historial.deshacer : null}
        onRehacer={historial.puedeRehacer && historialLibre && !mover.moviendo ? historial.rehacer : null} />

      <div className="al-designer-canvas" data-testid="designer-canvas" data-insertando={Boolean(insertando) || undefined}>
        {configuracion
          ? <LienzoConExtremos configuracion={configuracion} inferior={inferior} bloqueado={edicion.pendientes || insercion.preferencia.guardando}
              onAbrir={insercion.abrirSelector}>
            <LienzoCerramiento configuracion={configuracion} moduloActivoId={modulo?.id ?? ''}
              seleccion={seleccion ?? { moduloId: '', elemento: '', parte: 'vidrio' }}
              onModuloActivo={() => undefined} onSeleccion={seleccionar}
              insercion={{ activa: Boolean(insertando) && !edicion.pendientes,
                onInsertar: (anclaje) => insercion.solicitar(insertando!, anclaje) }}
              movimiento={{ moduloId: mover.moviendo, anclajes: mover.anclajes, puedeMover: mover.puedeMover,
                onIniciar: mover.iniciar, onMover: mover.mover, onCancelar: mover.cancelar }} />
            </LienzoConExtremos>
          : <LienzoVacio preparada={preparada} onColocar={(plantilla) => insercion.solicitar(plantilla, null)}
              onAbrir={() => insercion.abrirSelector(null)} />}
      </div>

      <aside className="al-designer-lista">
        <ListaElementos configuracion={configuracion} catalogoUniones={catalogoUniones}
          seleccionadoId={seleccion?.parte === 'union' ? seleccion.elemento : modulo?.id ?? null}
          onSeleccionar={seleccionarEntrada} />
      </aside>

      <div className="al-designer-inferior">
        {edicion.pendientes && <p role="status">Hay cambios pendientes de actualizar.</p>}
        {edicion.error && <p role="alert">{edicion.error}</p>}
        {aviso && <p role="alert">{aviso}</p>}
        {vista === 'catalogo' || !configuracion
          ? <CatalogoInferior preparada={preparada} onPreparar={setPreparada} onArrastre={setArrastrada}
              onColocar={colocarLateral} />
          : modulo
            ? <PanelElemento modulo={modulo} borrador={edicion.borradores.modulos[modulo.id] ?? {}}
                cotasCatalogo={cotasCatalogo[modulo.estructuraCodigo] ?? []}
                generales={generales} series={series}
                modelos={modelosIguales(configuracion, modulo.id).length}
                onActualizarModelos={() => aplicarAModelos(modulo.id)}
                indice={entradasCerramiento(configuracion).find((e) => e.id === modulo.id)!.indice}
                rect={posicionesCerramiento(configuracion).modulos.get(modulo.id)!}
                pendiente={Boolean(edicion.borradores.modulos[modulo.id])} bloqueado={edicion.pendientes}
                preparada={preparada} eliminable={!esModuloRaiz(configuracion, modulo.id)}
                onChange={(cambios) => edicion.editarModulo(modulo.id, cambios)}
                onActualizar={() => edicion.aplicar('modulos', modulo.id)}
                onDescartar={() => edicion.descartar('modulos', modulo.id)}
                onSustituir={() => preparada && setConfiguracion(
                  cambiarEstructuraModuloCerramiento(configuracion, modulo.id, preparada))}
                onEliminar={eliminar} moviendo={mover.moviendo === modulo.id} movible={mover.puedeMover(modulo.id)}
                onMover={() => mover.moviendo === modulo.id ? mover.cancelar() : mover.iniciar(modulo.id)} />
            : union && <div className="al-designer-union-editor">
                <EditorUnion catalogoUniones={catalogoUniones} serieCodigo={generales.serieCodigo}
                  union={{ ...union, ...edicion.borradores.uniones[union.id] }}
                  indice={entradasCerramiento(configuracion).find((e) => e.id === union.id)!.indice}
                  pendiente={Boolean(edicion.borradores.uniones[union.id])}
                  onChange={(cambios) => edicion.editarUnion(union.id, cambios)}
                  onActualizar={() => edicion.aplicar('uniones', union.id)}
                  onDescartar={() => edicion.descartar('uniones', union.id)} />
              </div>}
      </div>
      {insercion.selector && <SelectorVentana onCerrar={insercion.cerrarSelector}
        onElegir={plantilla => insercion.solicitar(plantilla, insercion.selector!.destino)} />}
      {insercion.pregunta && insercion.medidas && <PreguntaMedidas {...insercion.medidas}
        onCerrar={insercion.cerrarPregunta} onElegir={insercion.responder}
        guardando={insercion.preferencia.guardando} error={insercion.preferencia.error} />}
      {insercion.opciones && <OpcionesMedidas preferencia={insercion.preferencia.preferencia}
        onCerrar={insercion.cerrarOpciones} guardando={insercion.preferencia.guardando}
        error={insercion.preferencia.error} onElegir={async opcion => {
          if (await insercion.preferencia.cambiar(opcion)) insercion.cerrarOpciones()
        }} />}
    </section>
  )
}
