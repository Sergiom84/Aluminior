import type { Sql } from 'postgres'
import { bool, leerLotes, num, rutaTabla, txt } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import { descartar, excluir, type Resultado } from './resultado.ts'

export async function cargarSeries(sql: Sql, ORIGEN: string, cargar: Cargar): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  /**
   * Series y resolución de genéricos (PLAN.md anexo J).
   *
   * La serie traduce cada ranura genérica de la plantilla (`DisComponente`) a
   * un perfil real: serie -> cadena de conjuntos -> resolución por componente.
   */
  resultados.push(await cargar('ConfigSeries', 'series', (f, r) => {
    const codigo = txt(f.Serie)
    if (!codigo) { descartar(r, 'sin código'); return null }
    // La fila '*' es la configuración por defecto del programa, no una serie.
    if (codigo === '*') { excluir(r, 'configuración por defecto, no es una serie'); return null }
    return { codigo, es_pvc: bool(f.PVCsn) }
  }))

  resultados.push(await cargar('Conjuntos', 'conjuntos', (f, r) => {
    const codigo = txt(f.Codigo)
    if (!codigo) { descartar(r, 'sin código'); return null }
    return {
      codigo,
      serie_codigo: txt(f.CodSerie),
      tabla_hojas: txt(f.TablaHojas),
      tabla_fijos: txt(f.TablaFijos),
    }
  }))

  /**
   * Tablas de acristalamiento: junquillo y juntas por grosor de galce.
   * La selección en tiempo de cálculo es "menor grosor >= TamJunqGoma del
   * vidrio" (anexo M).
   */
  resultados.push(await cargar('TAcristalamientoLin', 'tacris_filas', (f, r) => {
    const tabla = txt(f.TAcris)
    const grosor = num(f.Grosor)
    if (!tabla || grosor === null) { descartar(r, 'clave incompleta'); return null }
    const limpiar = (v: string | undefined) => {
      const t = txt(v)
      return t && t !== '0' ? t : null
    }
    return {
      tabla,
      posicion: txt(f.Pos) ?? '*',
      grosor,
      junquillo: limpiar(f.Junquillo),
      junta_exterior: limpiar(f.JuntaExt),
      junta_interior: limpiar(f.JuntaInt),
    }
  }))

  /**
   * Delegaciones: cada fila de Conjuntos apunta a otros conjuntos mediante ~74
   * columnas (SubSerieDe, herr1HA…, TablaHojas…). Es una carga 1 -> N, así que
   * no encaja en `cargar`: se extraen aquí las parejas.
   * Los TablaHojas/TablaFijos apuntan a tablas de acristalamiento, no a
   * conjuntos con resoluciones; se cargan igualmente por trazabilidad y la
   * expansión de cadena simplemente no encuentra filas para ellos.
   */
  {
    const r: Resultado = {
      tabla: 'conjunto_delegaciones', leidas: 0, insertadas: 0, descartadas: 0,
      excluidas: 0, motivos: new Map(),
    }
    const ruta = rutaTabla(ORIGEN, 'Conjuntos')
    if (ruta) {
      const ES_DELEGACION = /^(TablaHojas\d?|TablaFijos\d?|TablaDobleH\d?|SubSerieDe|herr.+)$/
      for await (const lote of leerLotes(ruta, 500)) {
        r.leidas += lote.length
        const filas: Record<string, unknown>[] = []
        const vistas = new Set<string>()
        for (const f of lote) {
          const conjunto = txt(f.Codigo)
          if (!conjunto) continue
          for (const [campo, valor] of Object.entries(f)) {
            if (!ES_DELEGACION.test(campo)) continue
            const delegado = txt(valor)
            if (!delegado || delegado === '0' || delegado === conjunto) continue
            const clave = `${conjunto}|${delegado}|${campo}`
            if (vistas.has(clave)) continue
            vistas.add(clave)
            filas.push({ conjunto_codigo: conjunto, delegado_codigo: delegado, campo })
          }
        }
        if (filas.length) {
          await sql`INSERT INTO conjunto_delegaciones ${sql(filas)} ON CONFLICT DO NOTHING`
          r.insertadas += filas.length
        }
      }
    } else {
      r.motivos.set('CSV no encontrado', 1)
    }
    resultados.push(r)
  }

  resultados.push(await cargar('ConjuntosLin', 'conjunto_resoluciones', (f, r) => {
    const conjunto = txt(f.Conjunto)
    const componente = txt(f.Componente)
    if (!conjunto || !componente) { descartar(r, 'clave incompleta'); return null }
    const articulo = txt(f.Articulo)
    // Muchas filas del catálogo global no llevan artículo: el conjunto no
    // resuelve ese componente. No es un error, es la forma normal de la tabla.
    if (!articulo || articulo === '0') { excluir(r, 'componente sin artículo asignado'); return null }
    return {
      conjunto_codigo: conjunto,
      componente,
      familia: txt(f.Familia) ?? '',
      articulo_codigo: articulo,
    }
  }))

  /**
   * Catálogo de opciones de herraje por conjunto (anexo R). Las ocultas
   * también se cargan: el original las usa en la selección de asociados
   * aunque no las muestre; el filtrado de visibilidad es de la interfaz.
   */
  resultados.push(await cargar('ConjuntosOpcionesHerraje', 'opciones_herraje', (f, r) => {
    const conjunto = txt(f.Conjunto)
    const opcion = txt(f.nOpcion)
    if (!conjunto || !opcion) { descartar(r, 'clave incompleta'); return null }
    return {
      conjunto_codigo: conjunto,
      opcion_codigo: opcion,
      descripcion: txt(f.Descripcion) ?? '',
      por_defecto: bool(f.SelecDefSN),
      oculta: bool(f.OcultaSN),
      categoria: txt(f.CategoriaOH),
    }
  }))
  return resultados
}
