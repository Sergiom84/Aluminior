import { and, eq, ilike, or, sql, type SQL, type SQLWrapper } from 'drizzle-orm'
import { schema } from '@aluminior/db'

/**
 * Búsqueda del listado comercial.
 *
 * No hay módulo de facturas. El documento que se crea hoy es el presupuesto;
 * fecha y precio se resuelven aquí, sobre la fecha y el total que ve el operador.
 * Un importe sin decimales casa con la parte entera de euros. Un documento
 * «sin valorar» no casa por precio.
 */

export type FechaConsulta =
  | { tipo: 'dia'; iso: string }
  | { tipo: 'dia-mes'; dm: string }
  | { tipo: 'mes'; ym: string }
  | { tipo: 'anio'; anio: string }

export type ImporteConsulta =
  | { tipo: 'exacto'; valor: string }
  | { tipo: 'euros'; euros: string }

function fechaValida(anio: number, mes: number, dia: number): boolean {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
}

function isoDe(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

function anioCompleto(texto: string): number | null {
  const anio = Number(texto)
  if (texto.length === 4) return anio
  if (texto.length !== 2) return null
  return anio >= 70 ? 1900 + anio : 2000 + anio
}

export function interpretarFecha(consulta: string): FechaConsulta | null {
  const texto = consulta.trim().replace(/\s+/g, '')
  if (!texto) return null

  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const anio = Number(iso[1])
    const mes = Number(iso[2])
    const dia = Number(iso[3])
    return fechaValida(anio, mes, dia) ? { tipo: 'dia', iso: `${iso[1]}-${iso[2]}-${iso[3]}` } : null
  }

  const completa = texto.match(/^(\d{1,2})[/.|-](\d{1,2})[/.|-](\d{2}|\d{4})$/)
  if (completa) {
    const dia = Number(completa[1])
    const mes = Number(completa[2])
    const anio = anioCompleto(completa[3])
    if (anio === null || !fechaValida(anio, mes, dia)) return null
    return { tipo: 'dia', iso: isoDe(anio, mes, dia) }
  }

  const mesAnio = texto.match(/^(\d{1,2})[/.|-](\d{4})$/)
  if (mesAnio) {
    const mes = Number(mesAnio[1])
    const anio = Number(mesAnio[2])
    if (mes >= 1 && mes <= 12 && anio >= 1990 && anio <= 2100) {
      return { tipo: 'mes', ym: `${mesAnio[2]}-${String(mes).padStart(2, '0')}` }
    }
    return null
  }

  const diaMes = texto.match(/^(\d{1,2})[/.|-](\d{1,2})$/)
  if (diaMes) {
    const dia = Number(diaMes[1])
    const mes = Number(diaMes[2])
    if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) {
      return { tipo: 'dia-mes', dm: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}` }
    }
    return null
  }

  if (/^(19|20)\d{2}$/.test(texto)) return { tipo: 'anio', anio: texto }
  return null
}

function gruposMilesValidos(entera: string, separador: string): boolean {
  const grupos = entera.split(separador)
  if (grupos.some((grupo) => !/^\d+$/.test(grupo))) return false
  if (grupos[0].length < 1 || grupos[0].length > 3) return false
  return grupos.slice(1).every((grupo) => grupo.length === 3)
}

export function interpretarImporte(consulta: string): ImporteConsulta | null {
  const limpio = consulta.trim().replace(/[\s\u00a0\u202f€]/g, '').replace(/eur$/i, '')
  if (!limpio || !/^[\d.,]+$/.test(limpio) || /^[.,]|[.,]$/.test(limpio)) return null

  const tieneComa = limpio.includes(',')
  const tienePunto = limpio.includes('.')
  let normalizado = limpio
  let decimales = false

  if (tieneComa && tienePunto) {
    const decimalEsComa = limpio.lastIndexOf(',') > limpio.lastIndexOf('.')
    const decimal = decimalEsComa ? ',' : '.'
    const miles = decimalEsComa ? '.' : ','
    const partes = limpio.split(decimal)
    if (partes.length !== 2 || partes[1].length === 0 || partes[1].length > 2) return null
    if (!gruposMilesValidos(partes[0], miles)) return null
    normalizado = `${partes[0].replaceAll(miles, '')}.${partes[1].padEnd(2, '0')}`
    decimales = true
  } else if (tieneComa || tienePunto) {
    const separador = tieneComa ? ',' : '.'
    const partes = limpio.split(separador)
    if (partes.length === 2 && partes[1].length >= 1 && partes[1].length <= 2) {
      if (!/^\d+$/.test(partes[0]) || !/^\d+$/.test(partes[1])) return null
      normalizado = `${partes[0]}.${partes[1].padEnd(2, '0')}`
      decimales = true
    } else if (!gruposMilesValidos(limpio, separador)) {
      return null
    } else {
      normalizado = limpio.replaceAll(separador, '')
    }
  }

  if (normalizado.replace('.', '').length > 12) return null
  return decimales ? { tipo: 'exacto', valor: normalizado } : { tipo: 'euros', euros: normalizado }
}

function condicionFecha(fecha: FechaConsulta | null): SQL | undefined {
  if (!fecha) return undefined
  const columna = schema.presupuestos.fecha
  if (fecha.tipo === 'dia') return sql`${columna} = cast(${fecha.iso} as date)`
  if (fecha.tipo === 'dia-mes') return sql`to_char(${columna}, 'DD/MM') = ${fecha.dm}`
  if (fecha.tipo === 'mes') return sql`to_char(${columna}, 'YYYY-MM') = ${fecha.ym}`
  return sql`to_char(${columna}, 'YYYY') = ${fecha.anio}`
}

function condicionImporte(importe: ImporteConsulta | null): SQL | undefined {
  if (!importe) return undefined
  const total = schema.presupuestos.total
  const comparado = importe.tipo === 'exacto'
    ? sql`${total} = cast(${importe.valor} as numeric)`
    : sql`trunc(${total}) = cast(${importe.euros} as numeric)`
  return and(
    comparado,
    sql`${total} IS NOT NULL`,
    sql`NOT EXISTS (
      SELECT 1 FROM lineas l
      WHERE l.presupuesto_id = ${schema.presupuestos.id}
        AND (l.valoracion_completa IS NOT TRUE OR l.total IS NULL)
    )`,
  )
}

function textoIgual(columna: SQLWrapper, valor: string): SQL {
  return sql`translate(lower(coalesce(${columna}, '')), 'áéíóúüñ', 'aeiouun') = translate(lower(${valor}), 'áéíóúüñ', 'aeiouun')`
}

/** Documentos del cliente elegido: código canónico o el mismo nombre escrito a mano. */
export function filtroClienteSeleccionado(cliente: {
  codigo: string
  nombre: string
  nombreComercial?: string | null
}): SQL {
  const partes: SQL[] = [eq(schema.presupuestos.clienteCodigo, cliente.codigo)]
  if (cliente.nombre.trim()) partes.push(textoIgual(schema.presupuestos.nombreLibre, cliente.nombre))
  if (cliente.nombreComercial?.trim()) partes.push(textoIgual(schema.presupuestos.nombreLibre, cliente.nombreComercial))
  return or(...partes)!
}

/**
 * El llamador debe hacer left join de `clientes`: el texto sigue mirando su nombre.
 */
export function filtroListadoPresupuestos(consulta: string): SQL | undefined {
  const busqueda = consulta.trim().slice(0, 120)
  if (!busqueda) return undefined
  const patron = `%${busqueda.replace(/[%_]/g, '')}%`
  const texto = or(
    ilike(schema.presupuestos.nombreLibre, patron),
    ilike(schema.presupuestos.obraTexto, patron),
    ilike(schema.clientes.nombre, patron),
    ilike(schema.presupuestos.clienteCodigo, patron),
    sql`CAST(${schema.presupuestos.numero} AS TEXT) ILIKE ${patron}`,
  )
  return or(texto, condicionFecha(interpretarFecha(busqueda)), condicionImporte(interpretarImporte(busqueda)))
}
