'use client'

import { useState } from 'react'
import { decidirMedidasInsercion, medidasPrimeraVentana, type AnclajeLibre,
  type ConfiguracionCerramiento, type PlantillaDiseno } from '@aluminior/core/estructuras'
import { usePreferenciaMedidas } from './preferencia-medidas.tsx'

type Destino = AnclajeLibre | null
interface Peticion { plantilla: PlantillaDiseno; destino: Destino }

export function useInsercionVentanas(configuracion: ConfiguracionCerramiento | null,
  colocar: (plantilla: PlantillaDiseno, destino: Destino, copiar: boolean) => void) {
  const preferencia = usePreferenciaMedidas()
  const [selector, setSelector] = useState<{ destino: Destino } | null>(null)
  const [pregunta, setPregunta] = useState<Peticion | null>(null)
  const [opciones, setOpciones] = useState(false)
  const solicitar = (plantilla: PlantillaDiseno, destino: Destino) => {
    if (pregunta || preferencia.guardando) return
    setSelector(null)
    const decision = decidirMedidasInsercion(configuracion, preferencia.preferencia)
    if (decision === 'PREGUNTAR') setPregunta({ plantilla, destino })
    else colocar(plantilla, destino, decision === 'COPIAR')
  }
  const responder = async (opcion: 'UNA' | 'TODAS' | 'NO') => {
    if (!pregunta || preferencia.guardando) return
    if (opcion !== 'UNA' && !await preferencia.cambiar(opcion === 'TODAS' ? 'COPIAR_PRIMERA' : 'MODELO')) return
    colocar(pregunta.plantilla, pregunta.destino, opcion !== 'NO')
    setPregunta(null)
  }
  return { preferencia, selector, pregunta, opciones, solicitar, responder,
    medidas: medidasPrimeraVentana(configuracion),
    abrirSelector: (destino: Destino) => setSelector({ destino }),
    cerrarSelector: () => setSelector(null), cerrarPregunta: () => setPregunta(null),
    abrirOpciones: () => setOpciones(true), cerrarOpciones: () => setOpciones(false),
  }
}
