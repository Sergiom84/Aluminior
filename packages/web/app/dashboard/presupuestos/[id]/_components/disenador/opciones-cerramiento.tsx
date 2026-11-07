'use client'

import React from 'react'
import { unionConfigurada, type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { PestanaHerraje } from '../editor-linea/pestana-herraje.tsx'
import { PestanaAcristalamiento } from '../editor-linea/pestana-acristalamiento.tsx'
import { ErroresSeleccion } from '../editor-linea/errores-seleccion.tsx'
import { claveCatalogoHerraje, type EstadoCargaCatalogo } from '../editor-linea/disponibilidad-catalogos.ts'
import type { VistaDisenador } from './barra-disenador.tsx'

const ignorarEstado = () => undefined

/**
 * Selecciona la siguiente unión del cerramiento (botón «Seleccionar la siguiente
 * unión» de Productor): cuando no hay una unión activa, prioriza la primera sin
 * configurar; cuando ya hay una unión seleccionada, avanza circularmente.
 */
export function siguienteUnionId(
  configuracion: ConfiguracionCerramiento,
  actualId: string | null,
): string | null {
  if (!configuracion.uniones.length) return null
  if (actualId) {
    const indice = configuracion.uniones.findIndex((u) => u.id === actualId)
    if (indice >= 0) return configuracion.uniones[(indice + 1) % configuracion.uniones.length].id
  }
  return (configuracion.uniones.find((u) => !unionConfigurada(u)) ?? configuracion.uniones[0]).id
}

export interface PropsOpcionesCerramiento {
  readonly onHerrajeChange?: (estado: EstadoCargaCatalogo) => void
  readonly onAcristalamientoChange?: (estado: EstadoCargaCatalogo) => void
  readonly errores?: Record<string, string[]>
}

/**
 * Paneles de `Opc.Herraje` y `Acristalamiento` integrados en el configurador de
 * cerramientos. Permanecen montados mientras hay elementos para conservar sus
 * campos en el formulario al alternar de pestaña y pulsar `Aceptar`.
 */
export function OpcionesCerramiento({
  vista, serie, estructuraCodigo,
  onHerrajeChange = ignorarEstado,
  onAcristalamientoChange = ignorarEstado,
  errores = {},
}: PropsOpcionesCerramiento & {
  vista: VistaDisenador
  serie: string
  estructuraCodigo: string
}) {
  return (
    <>
      <div id="panel-herraje" hidden={vista !== 'herraje'}>
        <PestanaHerraje key={claveCatalogoHerraje(serie, estructuraCodigo)} serie={serie}
          estructuraCodigo={estructuraCodigo} onEstadoChange={onHerrajeChange} />
      </div>
      <div id="panel-acristalamiento" hidden={vista !== 'acristalamiento'}>
        <PestanaAcristalamiento key={serie} serie={serie} onEstadoChange={onAcristalamientoChange} />
      </div>
      <ErroresSeleccion errores={errores} />
    </>
  )
}
