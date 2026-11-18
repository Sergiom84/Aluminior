'use client'

import { useState } from 'react'
import {
  actualizarModuloCerramiento, actualizarFiModuloCerramiento, actualizarCotasModuloCerramiento,
  actualizarTodasLasUniones, asignarComplementosModulos, asignarMaterialesModulos, asignarMaterialesUnion,
  CAMPOS_MATERIAL, CAMPOS_MATERIAL_UNION, esConfiguracionCerramiento, unionConGrosorCatalogo, UNIONES_VISUALES,
  type CambiosComplementosModulo, type CambiosCotasModulo, type CambiosMaterial, type CambiosMaterialUnion, type UnionVisual,
  type ConfiguracionCerramiento, type ModuloCerramiento, type UnionCerramiento,
} from '@aluminior/core/estructuras'

type Medidas = Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm' | 'fiMm'>>
export type BorradorModulo = Medidas & CambiosMaterial & CambiosComplementosModulo & { cotas?: CambiosCotasModulo }
export type BorradorUnion = Partial<Pick<UnionCerramiento, 'codigo' | 'longitudMm' | 'grosorMm'>> & CambiosMaterialUnion
export type Borradores = { modulos: Record<string, BorradorModulo>; uniones: Record<string, BorradorUnion> }

const esCampoMaterialUnion = (campo: string): campo is keyof CambiosMaterialUnion =>
  (CAMPOS_MATERIAL_UNION as readonly string[]).includes(campo)

/**
 * Aplica el borrador de un elemento a él mismo o a los destinos indicados
 * (modelos iguales). Todo o nada: si un destino queda inválido no cambia ninguno.
 */
export function aplicarBorrador(configuracion: ConfiguracionCerramiento, borradores: Borradores,
  tipo: 'modulos' | 'uniones', id: string, destinos: readonly string[] = [id],
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES): ConfiguracionCerramiento | null {
  let siguiente = configuracion
  if (tipo === 'modulos') {
    if (!configuracion.modulos.some(item => item.id === id)) return null
    const borrador = borradores.modulos[id] ?? {}
    const { fiMm, anchoMm, altoMm, cotas } = borrador
    const medidas = Object.fromEntries(Object.entries({ anchoMm, altoMm }).filter(([, v]) => v !== undefined))
    const materiales = Object.fromEntries(CAMPOS_MATERIAL.filter(c => Object.hasOwn(borrador, c))
      .map(c => [c, borrador[c]])) as CambiosMaterial
    const complementos: CambiosComplementosModulo = {}
    if (Object.hasOwn(borrador, 'compacto')) complementos.compacto = borrador.compacto
    if (Object.hasOwn(borrador, 'tapajuntas')) complementos.tapajuntas = borrador.tapajuntas
    for (const destino of destinos) {
      siguiente = actualizarModuloCerramiento(siguiente, destino, medidas)
      if (Object.hasOwn(borrador, 'fiMm')) siguiente = actualizarFiModuloCerramiento(siguiente, destino, fiMm!)
      if (cotas && Object.keys(cotas).length) siguiente = actualizarCotasModuloCerramiento(siguiente, destino, cotas)
    }
    if (Object.keys(materiales).length) siguiente = asignarMaterialesModulos(siguiente, destinos, materiales)
    if (Object.keys(complementos).length) siguiente = asignarComplementosModulos(siguiente, destinos, complementos)
  } else {
    if (!configuracion.uniones.some(item => item.id === id)) return null
    const entradas = Object.entries(borradores.uniones[id] ?? {})
    const medidas = Object.fromEntries(entradas.filter(([campo]) => !esCampoMaterialUnion(campo)))
    const materiales = Object.fromEntries(entradas.filter(([campo]) => esCampoMaterialUnion(campo))) as CambiosMaterialUnion
    siguiente = { ...configuracion, uniones: configuracion.uniones.map(item =>
      item.id === id ? unionConGrosorCatalogo({ ...item, ...medidas }, catalogo) : item) }
    if (Object.keys(materiales).length) siguiente = asignarMaterialesUnion(siguiente, id, materiales)
  }
  return esConfiguracionCerramiento(siguiente, catalogo) ? siguiente : null
}

/**
 * Copia el compacto y el tapajuntas ya aplicados a los modelos iguales.
 * Si hay un borrador válido, lo aplica antes; si es inválido, no copia nada.
 */
export function aplicarComplementosAModelos(configuracion: ConfiguracionCerramiento, borradores: Borradores,
  id: string, destinos: readonly string[], catalogo: readonly UnionVisual[] = UNIONES_VISUALES,
): ConfiguracionCerramiento | null {
  const hayBorrador = Boolean(borradores.modulos[id] && Object.keys(borradores.modulos[id]).length)
  const base = hayBorrador
    ? aplicarBorrador(configuracion, borradores, 'modulos', id, destinos, catalogo)
    : configuracion
  if (!base) return null
  const origen = base.modulos.find((modulo) => modulo.id === id)
  if (!origen) return null
  return asignarComplementosModulos(base, destinos, {
    compacto: origen.compacto ?? null,
    tapajuntas: origen.tapajuntas ?? null,
  })
}

/**
 * «Actualizar todas las uniones»: aplica antes el borrador de la unión, si lo
 * hay, y copia su código y acabados a las demás. Null si el resultado no vale.
 */
export function aplicarUnionATodas(configuracion: ConfiguracionCerramiento, borradores: Borradores,
  id: string, catalogo: readonly UnionVisual[] = UNIONES_VISUALES): ConfiguracionCerramiento | null {
  const hayBorrador = Boolean(borradores.uniones[id] && Object.keys(borradores.uniones[id]).length)
  const base = hayBorrador ? aplicarBorrador(configuracion, borradores, 'uniones', id, [id], catalogo) : configuracion
  if (!base || !base.uniones.some(item => item.id === id)) return null
  const siguiente = actualizarTodasLasUniones(base, id, catalogo)
  return esConfiguracionCerramiento(siguiente, catalogo) ? siguiente : null
}

export function useBorradoresCerramiento(configuracion: ConfiguracionCerramiento | null,
  onAplicar: (configuracion: ConfiguracionCerramiento) => void,
  catalogo: readonly UnionVisual[] = UNIONES_VISUALES) {
  const [borradores, setBorradores] = useState<Borradores>({ modulos: {}, uniones: {} })
  const [error, setError] = useState<string | null>(null)
  const pendientes = Boolean(configuracion) && (configuracion!.modulos.some(item => Boolean(borradores.modulos[item.id])) ||
    configuracion!.uniones.some(item => Boolean(borradores.uniones[item.id])))
  const editarModulo = (id: string, cambios: BorradorModulo) => {
    setError(null)
    setBorradores(actual => {
      const previo = actual.modulos[id] ?? {}
      const cotas = cambios.cotas ? { ...previo.cotas, ...cambios.cotas } : previo.cotas
      return { ...actual, modulos: {
        ...actual.modulos, [id]: { ...previo, ...cambios, ...(cotas ? { cotas } : {}) },
      } }
    })
  }
  const editarUnion = (id: string, cambios: BorradorUnion) => {
    setError(null)
    setBorradores(actual => ({ ...actual, uniones: {
      ...actual.uniones, [id]: { ...actual.uniones[id], ...cambios },
    } }))
  }
  const descartar = (tipo: 'modulos' | 'uniones', id: string) => {
    setError(null)
    setBorradores(actual => {
      const copia = { ...actual[tipo] }
      delete copia[id]
      return { ...actual, [tipo]: copia }
    })
  }
  const aplicar = (tipo: 'modulos' | 'uniones', id: string, destinos?: readonly string[]) => {
    const siguiente = configuracion && aplicarBorrador(configuracion, borradores, tipo, id, destinos, catalogo)
    if (!siguiente) {
      setError(destinos && destinos.length > 1
        ? 'No se aplicó a ningún elemento: la medida no es válida para todos los destinatarios.'
        : 'Revisa las medidas antes de actualizar.')
      return
    }
    onAplicar(siguiente)
    descartar(tipo, id)
  }
  const aplicarATodasLasUniones = (id: string) => {
    const siguiente = configuracion && aplicarUnionATodas(configuracion, borradores, id, catalogo)
    if (!siguiente) {
      setError('No se aplicó a ninguna unión: revisa la unión antes de actualizar.')
      return
    }
    onAplicar(siguiente)
    descartar('uniones', id)
  }
  return { borradores, pendientes, error, editarModulo, editarUnion, aplicar, aplicarATodasLasUniones, descartar }
}
