'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CATEGORIA_HERRAJE_TODAS, alternarOpcionHerraje, categoriasOpcionesHerraje, estadoOpcionesHerraje,
  filtrarPorCategoriaHerraje, seleccionInicialHerraje, type OpcionHerrajeCatalogo,
} from '@aluminior/core/estructuras'
import { opcionesHerrajeDe, type GrupoOpcionesHerraje } from '../../../_lib/acciones.ts'
import styles from './editor-linea.module.css'

/**
 * Pestaña `Opc.Herraje` (RECON-CERRAMIENTOS.md §5): combo `Herraje`, lista
 * `Categoría`, rejilla `Selec / Opción / Descripción`. Las opciones que no se
 * pueden marcar se resaltan y su casilla queda inactiva.
 *
 * Emite `opcionHerraje` = `conjunto|opción` por cada opción visible marcada;
 * el servidor añade las ocultas por defecto y descarta lo ajeno al catálogo.
 */
export function PestanaHerraje({ serie, estructuraCodigo }: { serie: string; estructuraCodigo: string }) {
  const [grupos, setGrupos] = useState<GrupoOpcionesHerraje[]>([])
  const [marcas, setMarcas] = useState<Record<string, Set<string>>>({})
  const [conjunto, setConjunto] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIA_HERRAJE_TODAS)

  useEffect(() => {
    let vigente = true
    const cargar = serie && estructuraCodigo
      ? opcionesHerrajeDe(serie, estructuraCodigo)
      : Promise.resolve(null)
    cargar.then((leidos) => {
      if (!vigente) return
      const lista = leidos ?? []
      setGrupos(lista)
      setMarcas(Object.fromEntries(lista.map((g) => [g.conjuntoCodigo, seleccionInicialHerraje(catalogoDe(g))])))
      setConjunto(lista[0]?.conjuntoCodigo ?? '')
      setCategoria(CATEGORIA_HERRAJE_TODAS)
    }).catch(() => { if (vigente) setGrupos([]) })
    return () => { vigente = false }
  }, [serie, estructuraCodigo])

  const grupo = grupos.find((g) => g.conjuntoCodigo === conjunto) ?? null
  const catalogo = useMemo(() => (grupo ? catalogoDe(grupo) : []), [grupo])
  const marcadas = marcas[conjunto] ?? new Set<string>()
  const excluyentes = new Set(grupo?.categorias?.filter(c => c.excluyentes).map(c => c.codigo) ?? [])
  const estados = filtrarPorCategoriaHerraje(estadoOpcionesHerraje(catalogo, marcadas, excluyentes), categoria)

  const alternar = (codigo: string) => setMarcas((actual) => ({
    ...actual, [conjunto]: alternarOpcionHerraje(catalogo, actual[conjunto] ?? new Set(), codigo, excluyentes),
  }))

  return (
    <div>
      {grupos.flatMap((g) => [...(marcas[g.conjuntoCodigo] ?? [])]
        .filter((codigo) => g.opciones.some((o) => String(Number(o.codigo)) === codigo && !o.oculta))
        .map((codigo) => (
          <input key={`${g.conjuntoCodigo}|${codigo}`} type="hidden" name="opcionHerraje"
            value={`${g.conjuntoCodigo}|${g.opciones.find(o => String(Number(o.codigo)) === codigo)?.codigo ?? codigo}`} />
        )))}

      <div className={styles.filtros}>
        <div>
          <label htmlFor="herrajeConjunto">Herraje</label>
          <select id="herrajeConjunto" value={conjunto} disabled={!grupos.length}
            onChange={(evento) => { setConjunto(evento.target.value); setCategoria(CATEGORIA_HERRAJE_TODAS) }}>
            {grupos.map((g) => <option key={g.conjuntoCodigo} value={g.conjuntoCodigo}>{g.conjuntoCodigo}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="herrajeCategoria">Categoría</label>
          <select id="herrajeCategoria" value={categoria} disabled={!grupo}
            onChange={(evento) => setCategoria(evento.target.value)}>
            {categoriasOpcionesHerraje(catalogo, Object.fromEntries((grupo?.categorias ?? []).map(c => [c.codigo, c.descripcion]))).map((c) => <option key={c.codigo} value={c.codigo}>{c.etiqueta}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.rejilla}>
        <table aria-label="Opciones de Herraje">
          <thead>
            <tr><th scope="col">Selec.</th><th scope="col">Opción</th><th scope="col">Descripción</th></tr>
          </thead>
          <tbody>
            {estados.map((estado) => (
              <tr key={estado.codigo} className={styles.fila} data-bloqueada={!estado.operable}>
                <td>
                  <input type="checkbox" checked={estado.seleccionada} disabled={!estado.operable}
                    aria-label={`${estado.codigo} ${estado.descripcion}`}
                    onChange={() => alternar(estado.codigo)} />
                </td>
                <td className={styles.codigo}>{estado.codigo}</td>
                <td>{estado.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Catálogo completo para core: las ocultas conservan sus marcas para fórmulas.
 */
function catalogoDe(grupo: GrupoOpcionesHerraje): OpcionHerrajeCatalogo[] {
  return grupo.opciones.map((o) => ({
    codigo: o.codigo, descripcion: o.descripcion, porDefecto: o.porDefecto, oculta: o.oculta ?? false, categoria: o.categoria,
    activaSoloSi: o.activaSoloSi, incompatible: o.incompatible,
  }))
}
