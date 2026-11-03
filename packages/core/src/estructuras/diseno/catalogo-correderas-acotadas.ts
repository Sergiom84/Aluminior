import { division, hijo, hueco } from './constructores.ts'
import { composicionCorrederaDosHojas } from './corredera-dos-hojas.ts'
import type { DivisionVisual, NodoVisual, PlantillaDiseno } from './tipos.ts'

/** EMP0016: HA/HB TipoCota=1, 300 mm desde arriba/abajo, marco NOR. */
function fijoInferior(alto: number): DivisionVisual {
  return { ...division('travesano-inferior', 'horizontal', 'travesano', [
    hijo(composicionCorrederaDosHojas(), alto - 300),
    hijo(hueco('fijo-inferior', 'fijo'), 300),
  ]), cotaFija: { desde: 'fin', mm: 300 } }
}

function fijoSuperior(contenido: NodoVisual, alto: number): DivisionVisual {
  return { ...division('travesano-superior', 'horizontal', 'travesano', [
    hijo(hueco('fijo-superior', 'fijo'), 300), hijo(contenido, alto - 300),
  ]), cotaFija: { desde: 'inicio', mm: 300 } }
}

export const CORREDERAS_ACOTADAS: readonly PlantillaDiseno[] = [
  {
    codigo: 'C2FI', descripcion: 'VENTANA CORREDERA DE DOS HOJAS CON FIJO INFERIOR',
    familia: 'VENTANAS CORREDERAS', familiaCodigo: '001', anchoMm: 1200, altoMm: 1200,
    composicion: fijoInferior(1200),
  },
  {
    codigo: 'C2FS', descripcion: 'VENTANA CORREDERA DE DOS HOJAS CON FIJO SUPERIOR',
    familia: 'VENTANAS CORREDERAS', familiaCodigo: '001', anchoMm: 1200, altoMm: 1200,
    composicion: fijoSuperior(composicionCorrederaDosHojas(), 1200),
  },
  {
    codigo: 'C2FSFI', descripcion: 'VENTANA CORREDERA DE DOS HOJAS CON FIJO SUPERIOR E INFERIOR',
    familia: 'VENTANAS CORREDERAS', familiaCodigo: '001', anchoMm: 1200, altoMm: 1500,
    composicion: fijoSuperior(fijoInferior(1200), 1500),
  },
]
