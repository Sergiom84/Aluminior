/** Cotas de instancia de la estructura de la línea (`VEstructurasVariables`); las del compacto van aparte. */
import { numero, si, texto, type Caso } from './datos.ts'

export function cotasDeCaso(c: Caso): { cotas: Record<string, number>; motivos: string[] } {
  const propias = (c.variables ?? []).filter(v => texto(v.Estructura) === c.modelo && !si(v.SubestructuraSN))
  const cotas: Record<string, number> = {}
  for (const v of propias) {
    const simbolo = texto(v.SimboloVariable).toUpperCase(), valor = numero(v.Valor)
    if (!simbolo || valor === null || simbolo in cotas || (numero(v.NumeroInstancia) ?? 1) !== 1) {
      return { cotas: {}, motivos: ['cotas-de-instancia-no-representables'] }
    }
    cotas[simbolo] = valor
  }
  return { cotas, motivos: [] }
}
