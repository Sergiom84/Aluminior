/**
 * Minutos de fabricación de una estructura según `MOConceptos`.
 *
 * Las filas `infMOmof` de la plantilla llevan el módulo en `DisVidrio`; cada
 * módulo con concepto (`ModuloAsoc`) aporta `TiempoFabr × cantidad` minutos.
 * Los conceptos asociados a un artículo de plantilla (62, fijo independiente)
 * suman por cada fila con ese artículo. Productor factura una fila `MO` por
 * aportación: C2 GMC400 = módulo 8 (20) + módulo 15 × 2 (40); fijo GMA350 =
 * 25 + 10 + 20 (fase-7/06).
 *
 * Conceptos por componente o grupo (`MOConceptos.Categoria`): se aplican si
 * su categoría es la del tipo de perfil de la estructura (`Estructuras.TipoPerf`)
 * o la común 00010. Contrastado en EMP0016: abatibles (A, 00001) cobran 10 min de
 * 00114 por travesaño TMP y no los 20 de 00010; la corredera C2FI (C, 00002)
 * cobra 00010 y no 00114 (30 líneas). Otras categorías siguen sin contrastar.
 *
 * Sin contrastar en este catálogo: tiempos por dimensión, preparación,
 * conceptos del tipo de apertura con tiempo y categorías de mallorquina o
 * plegable. Si alguno aportaría minutos, se informa y no se inventa.
 */

/** Categoría `MOCategorias` de cada `TipoPerf` contrastado y la común a todos. */
const CATEGORIA_POR_TIPO_PERFIL: Readonly<Record<string, string>> = { A: '00001', C: '00002' }
const CATEGORIA_COMUN = '00010'

export interface ConceptoManoObraCatalogo {
  codigo: string
  minutos: number
  /** Artículo con el que se factura (`CodArticulo`, normalmente `MO`). */
  articulo: string
  modulo: string | null
  articuloAsociado: string | null
  componenteAsociado: string | null
  grupoAsociado: string | null
  /** Tiempo de preparación o incrementos por ancho/alto distintos de cero. */
  conIncrementos: boolean
  /** `MOConceptos.Categoria` (00001 abatibles, 00002 correderas, 00010 comunes…). */
  categoria?: string | null
}

export interface ElementoManoObra {
  /** Módulo de las filas `infMOmof`. */
  modulo: string | null
  /** Artículo genérico de la fila de plantilla. */
  articuloPlantilla: string
  componente: string | null
  grupo: string | null
  cantidad: number
}

export interface MinutosFabricacion {
  articulo: string
  minutos: number
  concepto: string
}

export function minutosFabricacion(entrada: {
  elementos: readonly ElementoManoObra[]
  conceptos: readonly ConceptoManoObraCatalogo[]
  /** Conceptos del tipo de apertura (`Conjuntos.mo*`) de cada grupo de hojas. */
  conceptosApertura: readonly string[]
  /** `Estructuras.TipoPerf` (A abatible, C corredera…); null si se desconoce. */
  tipoPerfil?: string | null
}): { lineas: MinutosFabricacion[]; incidencias: string[] } {
  const categoriaEstructura = entrada.tipoPerfil ? CATEGORIA_POR_TIPO_PERFIL[entrada.tipoPerfil] ?? null : null
  const lineas: MinutosFabricacion[] = []
  const incidencias: string[] = []
  const porCodigo = new Map(entrada.conceptos.map(c => [c.codigo, c]))
  const emitir = (c: ConceptoManoObraCatalogo, cantidad: number) => {
    if (c.conIncrementos) { incidencias.push(`mano de obra ${c.codigo}: incrementos por medida sin contrastar`); return }
    if (c.minutos > 0 && cantidad > 0) lineas.push({ articulo: c.articulo, minutos: c.minutos * cantidad, concepto: c.codigo })
  }

  for (const e of entrada.elementos) {
    if (e.modulo) {
      const c = entrada.conceptos.find(x => x.modulo === e.modulo)
      if (c) emitir(c, e.cantidad)
    }
    for (const c of entrada.conceptos) {
      if (c.articuloAsociado && c.articuloAsociado === e.articuloPlantilla) emitir(c, e.cantidad)
      const porComponente = c.componenteAsociado && c.componenteAsociado !== '!' && c.componenteAsociado === e.componente
      const porGrupo = c.grupoAsociado && c.grupoAsociado !== '!' && c.grupoAsociado === e.grupo
      if ((porComponente || porGrupo) && c.minutos > 0) {
        const contrastada = Object.values(CATEGORIA_POR_TIPO_PERFIL).includes(c.categoria ?? '')
        if (c.categoria === CATEGORIA_COMUN || (categoriaEstructura && c.categoria === categoriaEstructura)) emitir(c, e.cantidad)
        else if (!categoriaEstructura || !contrastada) {
          incidencias.push(`mano de obra ${c.codigo}: asociación por ${porComponente ? 'componente' : 'grupo'} sin contrastar`)
        }
      }
    }
  }
  for (const codigo of entrada.conceptosApertura) {
    const c = porCodigo.get(codigo)
    if (!c) { incidencias.push(`concepto de mano de obra ${codigo} ausente`); continue }
    if (c.minutos > 0 || c.conIncrementos) incidencias.push(`mano de obra ${codigo} de la apertura sin contrastar`)
  }
  return { lineas, incidencias: [...new Set(incidencias)] }
}
