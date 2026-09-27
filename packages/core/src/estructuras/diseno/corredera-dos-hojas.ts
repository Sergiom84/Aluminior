import { division, hijo, hueco } from './constructores.ts'
import type { DivisionVisual } from './tipos.ts'

/** Pareja NOR equidistante acreditada para ventanas 10 y puertas 16. */
export function composicionCorrederaDosHojas(): DivisionVisual {
  return division('separacion-correderas', 'vertical', 'division-invisible', [
    hijo(hueco('hoja-1', 'corredera-derecha', false)),
    hijo(hueco('hoja-2', 'corredera-izquierda', false)),
  ])
}
