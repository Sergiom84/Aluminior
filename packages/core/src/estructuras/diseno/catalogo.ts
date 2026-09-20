import { division, hijo, hueco } from './constructores.ts'
import type { PlantillaDiseno, UnionVisual } from './tipos.ts'

/**
 * Composiciones respaldadas por EMP0016. Las proporciones distintas de 1
 * proceden de cotas visibles de catálogo (por ejemplo FI=300 mm).
 */
export const PLANTILLAS_DISENO: readonly PlantillaDiseno[] = [
  {
    codigo: '0', descripcion: 'FIJO DE 1 HUECO', familia: 'FIJOS', familiaCodigo: '005',
    anchoMm: 1200, altoMm: 1200,
    composicion: hueco('fijo-1', 'fijo'),
  },
  {
    codigo: '02H', descripcion: 'FIJO DE 2 HUECOS HORIZONTALES', familia: 'FIJOS', familiaCodigo: '005',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('travesano-h-1', 'horizontal', 'travesano', [
      hijo(hueco('fijo-superior', 'fijo')),
      hijo(hueco('fijo-inferior', 'fijo')),
    ]),
  },
  {
    codigo: '02V', descripcion: 'FIJO DE 2 HUECOS VERTICALES', familia: 'FIJOS', familiaCodigo: '005',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('travesano-v-1', 'vertical', 'travesano', [
      hijo(hueco('fijo-izquierdo', 'fijo')),
      hijo(hueco('fijo-derecho', 'fijo')),
    ]),
  },
  {
    codigo: '04', descripcion: 'FIJO DE 4 HUECOS (2X2)', familia: 'FIJOS', familiaCodigo: '005',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('travesano-h-1', 'horizontal', 'travesano', [
      hijo(division('travesano-v-superior', 'vertical', 'travesano', [
        hijo(hueco('fijo-superior-izquierdo', 'fijo')),
        hijo(hueco('fijo-superior-derecho', 'fijo')),
      ])),
      hijo(division('travesano-v-inferior', 'vertical', 'travesano', [
        hijo(hueco('fijo-inferior-izquierdo', 'fijo')),
        hijo(hueco('fijo-inferior-derecho', 'fijo')),
      ])),
    ]),
  },
  {
    codigo: '1OD', descripcion: 'VENTANA OSCILOBATIENTE DE UNA HOJA, MANO DERECHA', familiaCodigo: '020',
    familia: 'OSCILOBATIENTES', anchoMm: 800, altoMm: 1200,
    composicion: hueco('hoja-1', 'oscilobatiente-derecha'),
  },
  {
    codigo: '1OI', descripcion: 'VENTANA OSCILOBATIENTE DE UNA HOJA, MANO IZQUIERDA', familiaCodigo: '020',
    familia: 'OSCILOBATIENTES', anchoMm: 800, altoMm: 1200,
    composicion: hueco('hoja-1', 'oscilobatiente-izquierda'),
  },
  {
    codigo: '2', descripcion: 'VENTANA ABATIBLE DE DOS HOJAS', familia: 'VENTANAS ABATIBLES', familiaCodigo: '003',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('division-hojas', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-1', 'abatible-izquierda', false)),
      hijo(hueco('hoja-2', 'abatible-derecha', true)),
    ]),
  },
  {
    codigo: '2O', descripcion: 'VENTANA ABATIBLE DE DOS HOJAS, UNA OSCILOBATIENTE', familiaCodigo: '020',
    familia: 'OSCILOBATIENTES', anchoMm: 1200, altoMm: 1200,
    composicion: division('division-hojas', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-1', 'abatible-izquierda', false)),
      hijo(hueco('hoja-2', 'oscilobatiente-derecha', true)),
    ]),
  },
  {
    codigo: '1OFI', descripcion: 'VENTANA ABATIBLE DE UNA HOJA OSCILOBATIENTE CON FIJO INFERIOR', familiaCodigo: '020',
    familia: 'COMBINACIONES', anchoMm: 800, altoMm: 1500,
    composicion: division('travesano-fi', 'horizontal', 'travesano', [
      hijo(hueco('hoja-superior', 'oscilobatiente-izquierda'), 4),
      hijo(hueco('fijo-inferior', 'fijo'), 1),
    ]),
  },
  {
    codigo: '1O1FL', descripcion: 'VENTANA OSCILOBATIENTE DE UNA HOJA CON FIJO LATERAL', familiaCodigo: '020',
    familia: 'COMBINACIONES', anchoMm: 1100, altoMm: 1200,
    composicion: division('travesano-fl', 'vertical', 'travesano', [
      hijo(hueco('hoja-izquierda', 'oscilobatiente-derecha'), 8),
      hijo(hueco('fijo-derecho', 'fijo'), 3),
    ]),
  },
  {
    codigo: '1O2FL', descripcion: 'VENTANA ABATIBLE DE UNA HOJA OSCILOBATIENTE CON 2 FIJOS LATERALES', familiaCodigo: '020',
    familia: 'COMBINACIONES', anchoMm: 1400, altoMm: 1200,
    composicion: division('travesanos-laterales', 'vertical', 'travesano', [
      hijo(hueco('fijo-izquierdo', 'fijo'), 3),
      hijo(hueco('hoja-central', 'oscilobatiente-derecha'), 8),
      hijo(hueco('fijo-derecho', 'fijo'), 3),
    ]),
  },
  {
    codigo: '1O+1F+1O', descripcion: '2 VENTANAS ABATIBLES OSCILO Y UN FIJO', familiaCodigo: '003',
    familia: 'COMBINACIONES', anchoMm: 2100, altoMm: 1200,
    composicion: division('cadena-3', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-izquierda', 'oscilobatiente-izquierda')),
      hijo(hueco('fijo-central', 'fijo')),
      hijo(hueco('hoja-derecha', 'oscilobatiente-derecha')),
    ]),
  },
  {
    codigo: '1O+2F+1O', descripcion: '2 VENTANAS ABATIBLES OSCILO Y 2 FIJOS', familiaCodigo: '003',
    familia: 'COMBINACIONES', anchoMm: 2800, altoMm: 1200,
    composicion: division('cadena-4', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-izquierda', 'oscilobatiente-izquierda')),
      hijo(hueco('fijo-central-1', 'fijo')),
      hijo(hueco('fijo-central-2', 'fijo')),
      hijo(hueco('hoja-derecha', 'oscilobatiente-derecha')),
    ]),
  },
  {
    codigo: '2O+ FIJO', descripcion: '2 hojas + fijo oscilo', familiaCodigo: '003',
    familia: 'COMBINACIONES', anchoMm: 1200, altoMm: 1500,
    composicion: division('travesano-fijo-inferior', 'horizontal', 'travesano', [
      hijo(division('encuentro-hojas', 'vertical', 'division-invisible', [
        hijo(hueco('hoja-izquierda', 'abatible-izquierda', false)),
        hijo(hueco('hoja-derecha', 'oscilobatiente-derecha', true)),
      ]), 4),
      hijo(hueco('fijo-inferior', 'fijo'), 1),
    ]),
  },
] as const

/** Uniones vistas en el presupuesto filmado y presentes en la familia 103. */
export const UNIONES_VISUALES: readonly UnionVisual[] = [
  { codigo: 'GMU038', descripcion: '(GM) TUBO 60x60', grosorMm: 60 },
  { codigo: 'PSU001', descripcion: '(PS) H UNION PARA COMPACTOS 100mm', grosorMm: 100 },
] as const

export function plantillaDiseno(codigo: string): PlantillaDiseno | null {
  const normalizado = codigo.trim().toUpperCase()
  return PLANTILLAS_DISENO.find((plantilla) => plantilla.codigo === normalizado) ?? null
}
