/**
 * Vocabulario visual verificado contra Estructuras/EstructurasDiseño.
 *
 * Los códigos son identificadores opacos. Cada composición se declara a partir
 * de filas observadas; nunca se intenta descifrar la forma leyendo el código.
 */
export type AperturaVisual =
  | 'fijo'
  | 'abatible-izquierda'
  | 'abatible-derecha'
  | 'oscilobatiente-izquierda'
  | 'oscilobatiente-derecha'

export type EjeDivision = 'horizontal' | 'vertical'
export type ClaseSeparador = 'travesano' | 'division-invisible' | 'union'

export interface HuecoVisual {
  tipo: 'hueco'
  id: string
  apertura: AperturaVisual
}

export interface HijoVisual {
  proporcion: number
  nodo: NodoVisual
}

export interface DivisionVisual {
  tipo: 'division'
  id: string
  eje: EjeDivision
  separador: ClaseSeparador
  hijos: readonly HijoVisual[]
}

export type NodoVisual = HuecoVisual | DivisionVisual

export type FamiliaVisual =
  | 'FIJOS'
  | 'OSCILOBATIENTES'
  | 'VENTANAS ABATIBLES'
  | 'COMBINACIONES'

export interface PlantillaDiseno {
  codigo: string
  descripcion: string
  familia: FamiliaVisual
  anchoMm: number
  altoMm: number
  composicion: NodoVisual
}

const hueco = (id: string, apertura: AperturaVisual): HuecoVisual => ({
  tipo: 'hueco', id, apertura,
})

const division = (
  id: string,
  eje: EjeDivision,
  separador: ClaseSeparador,
  hijos: readonly HijoVisual[],
): DivisionVisual => ({ tipo: 'division', id, eje, separador, hijos })

const hijo = (nodo: NodoVisual, proporcion = 1): HijoVisual => ({ nodo, proporcion })

/**
 * Composiciones respaldadas por EMP0016. Las proporciones distintas de 1
 * proceden de cotas visibles de catálogo (por ejemplo FI=300 mm).
 */
export const PLANTILLAS_DISENO: readonly PlantillaDiseno[] = [
  {
    codigo: '0', descripcion: 'FIJO DE 1 HUECO', familia: 'FIJOS',
    anchoMm: 1200, altoMm: 1200,
    composicion: hueco('fijo-1', 'fijo'),
  },
  {
    codigo: '02H', descripcion: 'FIJO DE 2 HUECOS HORIZONTALES', familia: 'FIJOS',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('travesano-h-1', 'horizontal', 'travesano', [
      hijo(hueco('fijo-superior', 'fijo')),
      hijo(hueco('fijo-inferior', 'fijo')),
    ]),
  },
  {
    codigo: '02V', descripcion: 'FIJO DE 2 HUECOS VERTICALES', familia: 'FIJOS',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('travesano-v-1', 'vertical', 'travesano', [
      hijo(hueco('fijo-izquierdo', 'fijo')),
      hijo(hueco('fijo-derecho', 'fijo')),
    ]),
  },
  {
    codigo: '04', descripcion: 'FIJO DE 4 HUECOS (2X2)', familia: 'FIJOS',
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
    codigo: '1OD', descripcion: 'VENTANA OSCILOBATIENTE DE UNA HOJA, MANO DERECHA',
    familia: 'OSCILOBATIENTES', anchoMm: 800, altoMm: 1200,
    composicion: hueco('hoja-1', 'oscilobatiente-derecha'),
  },
  {
    codigo: '1OI', descripcion: 'VENTANA OSCILOBATIENTE DE UNA HOJA, MANO IZQUIERDA',
    familia: 'OSCILOBATIENTES', anchoMm: 800, altoMm: 1200,
    composicion: hueco('hoja-1', 'oscilobatiente-izquierda'),
  },
  {
    codigo: '2', descripcion: 'VENTANA ABATIBLE DE DOS HOJAS', familia: 'VENTANAS ABATIBLES',
    anchoMm: 1200, altoMm: 1200,
    composicion: division('division-hojas', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-1', 'abatible-derecha')),
      hijo(hueco('hoja-2', 'abatible-izquierda')),
    ]),
  },
  {
    codigo: '2O', descripcion: 'VENTANA ABATIBLE DE DOS HOJAS, UNA OSCILOBATIENTE',
    familia: 'OSCILOBATIENTES', anchoMm: 1200, altoMm: 1200,
    composicion: division('division-hojas', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-1', 'abatible-derecha')),
      hijo(hueco('hoja-2', 'oscilobatiente-izquierda')),
    ]),
  },
  {
    codigo: '1OFI', descripcion: 'VENTANA ABATIBLE DE UNA HOJA OSCILOBATIENTE CON FIJO INFERIOR',
    familia: 'COMBINACIONES', anchoMm: 800, altoMm: 1500,
    composicion: division('travesano-fi', 'horizontal', 'travesano', [
      hijo(hueco('hoja-superior', 'oscilobatiente-izquierda'), 4),
      hijo(hueco('fijo-inferior', 'fijo'), 1),
    ]),
  },
  {
    codigo: '1O1FL', descripcion: 'VENTANA OSCILOBATIENTE DE UNA HOJA CON FIJO LATERAL',
    familia: 'COMBINACIONES', anchoMm: 1100, altoMm: 1200,
    composicion: division('travesano-fl', 'vertical', 'travesano', [
      hijo(hueco('hoja-izquierda', 'oscilobatiente-derecha'), 8),
      hijo(hueco('fijo-derecho', 'fijo'), 3),
    ]),
  },
  {
    codigo: '1O2FL', descripcion: 'VENTANA ABATIBLE DE UNA HOJA OSCILOBATIENTE CON 2 FIJOS LATERALES',
    familia: 'COMBINACIONES', anchoMm: 1400, altoMm: 1200,
    composicion: division('travesanos-laterales', 'vertical', 'travesano', [
      hijo(hueco('fijo-izquierdo', 'fijo'), 3),
      hijo(hueco('hoja-central', 'oscilobatiente-izquierda'), 8),
      hijo(hueco('fijo-derecho', 'fijo'), 3),
    ]),
  },
  {
    codigo: '1O+1F+1O', descripcion: '2 VENTANAS ABATIBLES OSCILO Y UN FIJO',
    familia: 'COMBINACIONES', anchoMm: 2100, altoMm: 1200,
    composicion: division('cadena-3', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-izquierda', 'oscilobatiente-derecha')),
      hijo(hueco('fijo-central', 'fijo')),
      hijo(hueco('hoja-derecha', 'oscilobatiente-izquierda')),
    ]),
  },
  {
    codigo: '1O+2F+1O', descripcion: '2 VENTANAS ABATIBLES OSCILO Y 2 FIJOS',
    familia: 'COMBINACIONES', anchoMm: 2800, altoMm: 1200,
    composicion: division('cadena-4', 'vertical', 'division-invisible', [
      hijo(hueco('hoja-izquierda', 'oscilobatiente-derecha')),
      hijo(hueco('fijo-central-1', 'fijo')),
      hijo(hueco('fijo-central-2', 'fijo')),
      hijo(hueco('hoja-derecha', 'oscilobatiente-izquierda')),
    ]),
  },
  {
    codigo: '2O+ FIJO', descripcion: '2 hojas + fijo oscilo',
    familia: 'COMBINACIONES', anchoMm: 1200, altoMm: 1500,
    composicion: division('travesano-fijo-inferior', 'horizontal', 'travesano', [
      hijo(division('encuentro-hojas', 'vertical', 'division-invisible', [
        hijo(hueco('hoja-izquierda', 'oscilobatiente-derecha')),
        hijo(hueco('hoja-derecha', 'oscilobatiente-izquierda')),
      ]), 4),
      hijo(hueco('fijo-inferior', 'fijo'), 1),
    ]),
  },
] as const

export interface UnionVisual {
  codigo: string
  descripcion: string
  grosorMm: number
}

/** Uniones vistas en el presupuesto filmado y presentes en la familia 103. */
export const UNIONES_VISUALES: readonly UnionVisual[] = [
  { codigo: 'GMU038', descripcion: '(GM) TUBO 60x60', grosorMm: 60 },
  { codigo: 'PSU001', descripcion: '(PS) H UNION PARA COMPACTOS 100mm', grosorMm: 100 },
] as const

export function plantillaDiseno(codigo: string): PlantillaDiseno | null {
  const normalizado = codigo.trim().toUpperCase()
  return PLANTILLAS_DISENO.find((plantilla) => plantilla.codigo === normalizado) ?? null
}

export interface RectVisual { x: number; y: number; ancho: number; alto: number }

export interface HuecoColocado extends RectVisual {
  tipo: 'hueco'
  id: string
  apertura: AperturaVisual
}

export interface SeparadorColocado extends RectVisual {
  tipo: 'separador'
  id: string
  eje: EjeDivision
  clase: ClaseSeparador
}

export type ElementoColocado = HuecoColocado | SeparadorColocado

/**
 * Convierte el árbol en rectángulos de dibujo. El grosor es visual; las cotas
 * de fabricación siguen viviendo en el modelo de despiece.
 */
export function distribuirComposicion(
  nodo: NodoVisual,
  rect: RectVisual,
  grosorSeparador = 12,
): ElementoColocado[] {
  if (nodo.tipo === 'hueco') return [{ ...rect, ...nodo }]
  if (nodo.hijos.length === 0) return []

  const grosor = nodo.separador === 'division-invisible' ? 2 : grosorSeparador
  const totalSeparadores = grosor * Math.max(0, nodo.hijos.length - 1)
  const longitud = nodo.eje === 'vertical' ? rect.ancho : rect.alto
  const disponible = Math.max(0, longitud - totalSeparadores)
  const totalProporcion = nodo.hijos.reduce(
    (suma, actual) => suma + Math.max(0, actual.proporcion), 0,
  )
  if (totalProporcion === 0) return []

  const elementos: ElementoColocado[] = []
  let cursor = nodo.eje === 'vertical' ? rect.x : rect.y

  nodo.hijos.forEach((actual, indice) => {
    const ultimo = indice === nodo.hijos.length - 1
    const finalRect = nodo.eje === 'vertical' ? rect.x + rect.ancho : rect.y + rect.alto
    const medida = ultimo
      ? finalRect - cursor
      : disponible * Math.max(0, actual.proporcion) / totalProporcion
    const hijoRect: RectVisual = nodo.eje === 'vertical'
      ? { x: cursor, y: rect.y, ancho: medida, alto: rect.alto }
      : { x: rect.x, y: cursor, ancho: rect.ancho, alto: medida }
    elementos.push(...distribuirComposicion(actual.nodo, hijoRect, grosorSeparador))
    cursor += medida

    if (!ultimo) {
      elementos.push(nodo.eje === 'vertical'
        ? {
            tipo: 'separador', id: `${nodo.id}-${indice + 1}`, eje: nodo.eje,
            clase: nodo.separador, x: cursor, y: rect.y, ancho: grosor, alto: rect.alto,
          }
        : {
            tipo: 'separador', id: `${nodo.id}-${indice + 1}`, eje: nodo.eje,
            clase: nodo.separador, x: rect.x, y: cursor, ancho: rect.ancho, alto: grosor,
          })
      cursor += grosor
    }
  })
  return elementos
}

export function primerHueco(nodo: NodoVisual): HuecoVisual {
  if (nodo.tipo === 'hueco') return nodo
  for (const actual of nodo.hijos) {
    const encontrado = primerHueco(actual.nodo)
    if (encontrado) return encontrado
  }
  throw new Error('La composición no contiene huecos')
}

export function buscarHueco(nodo: NodoVisual, id: string): HuecoVisual | null {
  if (nodo.tipo === 'hueco') return nodo.id === id ? nodo : null
  for (const actual of nodo.hijos) {
    const encontrado = buscarHueco(actual.nodo, id)
    if (encontrado) return encontrado
  }
  return null
}

/** Compone dos cerramientos independientes mediante una unión de catálogo. */
export function unirCerramientos(
  izquierda: NodoVisual,
  derecha: NodoVisual,
  union: UnionVisual,
): DivisionVisual {
  return division(`union-${union.codigo}`, 'vertical', 'union', [
    hijo(izquierda), hijo(derecha),
  ])
}
