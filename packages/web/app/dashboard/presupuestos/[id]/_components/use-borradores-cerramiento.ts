'use client'

import { useState } from 'react'
import {
  actualizarModuloCerramiento, actualizarFiModuloCerramiento, asignarMaterialesModulos,
  CAMPOS_MATERIAL, esConfiguracionCerramiento,
  type CambiosMaterial, type ConfiguracionCerramiento, type ModuloCerramiento, type UnionCerramiento,
} from '@aluminior/core/estructuras'

type Medidas = Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm' | 'fiMm'>>
export type BorradorModulo = Medidas & CambiosMaterial
type Union = Partial<Pick<UnionCerramiento, 'codigo' | 'longitudMm' | 'grosorMm'>>
export type Borradores = { modulos: Record<string, BorradorModulo>; uniones: Record<string, Union> }

/**
 * Aplica el borrador de un elemento a él mismo o a los destinos indicados
 * (modelos iguales). Todo o nada: si un destino queda inválido no cambia ninguno.
 */
export function aplicarBorrador(configuracion: ConfiguracionCerramiento, borradores: Borradores,
  tipo: 'modulos' | 'uniones', id: string, destinos: readonly string[] = [id]): ConfiguracionCerramiento | null {
  let siguiente = configuracion
  if (tipo === 'modulos') {
    if (!configuracion.modulos.some(item => item.id === id)) return null
    const borrador = borradores.modulos[id] ?? {}
    const { fiMm, anchoMm, altoMm } = borrador
    const medidas = Object.fromEntries(Object.entries({ anchoMm, altoMm }).filter(([, v]) => v !== undefined))
    const materiales = Object.fromEntries(CAMPOS_MATERIAL.filter(c => Object.hasOwn(borrador, c))
      .map(c => [c, borrador[c]])) as CambiosMaterial
    for (const destino of destinos) {
      siguiente = actualizarModuloCerramiento(siguiente, destino, medidas)
      if (Object.hasOwn(borrador, 'fiMm')) siguiente = actualizarFiModuloCerramiento(siguiente, destino, fiMm!)
    }
    if (Object.keys(materiales).length) siguiente = asignarMaterialesModulos(siguiente, destinos, materiales)
  } else {
    if (!configuracion.uniones.some(item => item.id === id)) return null
    siguiente = { ...configuracion, uniones: configuracion.uniones.map(item =>
      item.id === id ? { ...item, ...borradores.uniones[id] } : item) }
  }
  return esConfiguracionCerramiento(siguiente) ? siguiente : null
}

export function useBorradoresCerramiento(configuracion: ConfiguracionCerramiento | null,
  onAplicar: (configuracion: ConfiguracionCerramiento) => void) {
  const [borradores, setBorradores] = useState<Borradores>({ modulos: {}, uniones: {} })
  const [error, setError] = useState<string | null>(null)
  const pendientes = Boolean(configuracion) && (configuracion!.modulos.some(item => Boolean(borradores.modulos[item.id])) ||
    configuracion!.uniones.some(item => Boolean(borradores.uniones[item.id])))
  const editarModulo = (id: string, cambios: BorradorModulo) => {
    setError(null)
    setBorradores(actual => ({ ...actual, modulos: {
      ...actual.modulos, [id]: { ...actual.modulos[id], ...cambios },
    } }))
  }
  const editarUnion = (id: string, cambios: Union) => {
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
    const siguiente = configuracion && aplicarBorrador(configuracion, borradores, tipo, id, destinos)
    if (!siguiente) {
      setError(destinos && destinos.length > 1
        ? 'No se aplicó a ningún elemento: la medida no es válida para todos los destinatarios.'
        : 'Revisa las medidas antes de actualizar.')
      return
    }
    onAplicar(siguiente)
    descartar(tipo, id)
  }
  return { borradores, pendientes, error, editarModulo, editarUnion, aplicar, descartar }
}
