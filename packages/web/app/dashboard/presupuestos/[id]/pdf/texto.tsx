import React from 'react'
import { Text } from '@react-pdf/renderer'

/** Puntos de partición tipográfica; el renderer conserva el texto fuente completo. */
export function partirPalabraPdf(palabra: string): string[] {
  const caracteres = Array.from(palabra)
  if (caracteres.length <= 8) return [palabra]
  return Array.from({ length: Math.ceil(caracteres.length / 4) }, (_, i) =>
    caracteres.slice(i * 4, i * 4 + 4).join(''))
}

/** Texto libre: admite también identificadores largos sin espacios. */
export function TextoPdf(props: React.ComponentProps<typeof Text>) {
  return <Text {...props} hyphenationCallback={partirPalabraPdf} />
}
