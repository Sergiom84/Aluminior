'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { seriesValidasParaDiseno } from '../../_lib/series-validas/series-validas-action.ts'
import { seriesParaGrupo } from '../../_lib/series-validas/series-validas.ts'

const ESPERA_MS = 350

/**
 * Series que sirven al diseño en pantalla. Mientras llega la respuesta, o si
 * falla, se ofrece la lista completa: la validación al añadir la línea sigue
 * siendo la de siempre.
 */
export function useSeriesValidas(
  todas: readonly string[], estructuras: readonly string[], vidrio: string,
): { grupo: string[]; porEstructura: Record<string, string[]> | undefined } {
  const clave = [...new Set(estructuras)].sort().join('|')
  const [respuesta, setRespuesta] = useState<{ clave: string; vidrio: string; datos: Record<string, string[]> } | null>(null)
  const ultima = useRef('')

  useEffect(() => {
    if (!clave) return
    const identidad = `${clave}#${vidrio}`
    ultima.current = identidad
    const temporizador = setTimeout(async () => {
      const resultado = await seriesValidasParaDiseno(clave.split('|'), vidrio || null)
      if (ultima.current === identidad && resultado.ok) {
        setRespuesta({ clave, vidrio, datos: resultado.porEstructura })
      }
    }, ESPERA_MS)
    return () => clearTimeout(temporizador)
  }, [clave, vidrio])

  const datos = respuesta?.datos
  const grupo = useMemo(
    () => datos ? seriesParaGrupo(todas, datos, estructuras) : [...todas],
    [datos, todas, estructuras],
  )
  return { grupo, porEstructura: datos }
}
