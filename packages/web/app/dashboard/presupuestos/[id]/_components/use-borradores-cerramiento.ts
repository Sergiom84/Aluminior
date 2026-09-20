'use client'

import { useState } from 'react'
import {
  actualizarModuloCerramiento, actualizarFiModuloCerramiento, esConfiguracionCerramiento,
  type ConfiguracionCerramiento, type ModuloCerramiento, type UnionCerramiento,
} from '@aluminior/core/estructuras'

type Medidas = Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm' | 'fiMm'>>
type Union = Partial<Pick<UnionCerramiento, 'codigo' | 'longitudMm' | 'grosorMm'>>
export type Borradores = { modulos: Record<string, Medidas>; uniones: Record<string, Union> }

export function aplicarBorrador(configuracion: ConfiguracionCerramiento, borradores: Borradores,
  tipo: 'modulos' | 'uniones', id: string): ConfiguracionCerramiento | null {
  let siguiente = configuracion
  if (tipo === 'modulos') {
    if (!configuracion.modulos.some(item => item.id === id)) return null
    const { fiMm, ...medidas } = borradores.modulos[id] ?? {}
    siguiente = actualizarModuloCerramiento(configuracion, id, medidas)
    if (Object.hasOwn(borradores.modulos[id] ?? {}, 'fiMm')) {
      siguiente = actualizarFiModuloCerramiento(siguiente, id, fiMm!)
    }
  } else {
    if (!configuracion.uniones.some(item => item.id === id)) return null
    siguiente = { ...configuracion, uniones: configuracion.uniones.map(item =>
      item.id === id ? { ...item, ...borradores.uniones[id] } : item) }
  }
  return esConfiguracionCerramiento(siguiente) ? siguiente : null
}

export function useBorradoresCerramiento(configuracion: ConfiguracionCerramiento,
  onAplicar: (configuracion: ConfiguracionCerramiento) => void) {
  const [borradores, setBorradores] = useState<Borradores>({ modulos: {}, uniones: {} })
  const [error, setError] = useState<string | null>(null)
  const pendientes = configuracion.modulos.some(item => Boolean(borradores.modulos[item.id])) ||
    configuracion.uniones.some(item => Boolean(borradores.uniones[item.id]))
  const editarModulo = (id: string, cambios: Medidas) => {
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
  const aplicar = (tipo: 'modulos' | 'uniones', id: string) => {
    const siguiente = aplicarBorrador(configuracion, borradores, tipo, id)
    if (!siguiente) {
      setError('Revisa las medidas antes de actualizar.')
      return
    }
    onAplicar(siguiente)
    descartar(tipo, id)
  }
  return { borradores, pendientes, error, editarModulo, editarUnion, aplicar, descartar }
}
