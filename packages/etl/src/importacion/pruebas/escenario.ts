import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Sql } from 'postgres'
import type { Fila } from '../../csv.ts'

/** Catálogo inventado: ejercita conversiones, exclusiones y galces sin datos del taller. */
export function crearEscenario() {
  const origen = mkdtempSync(join(tmpdir(), 'aluminior-importacion-'))
  const tablas: Record<string, Fila[]> = {
    Familias: [{ Codigo: 'F', Nombre: 'Familia sintética' }, { Codigo: '' }],
    Acabados: [{ Codigo: 'UNI', Descripcion: 'Único', TonalidadesSN: 'False' }],
    Articulos: [
      { Codigo: 'P', Descripcion: 'Perfil sintético', TipoMetraje: 'ML' },
      { Codigo: 'V', Descripcion: 'Vidrio sintético', Familia: '050', TipoMetraje: 'M2', TamJunqGoma: '24' },
      { Codigo: 'J', Descripcion: 'Junquillo sintético', TipoMetraje: 'ML' },
      { Codigo: '' },
    ],
    Clientes: [{ Codigo: 'TEST', Nombre: 'Cliente sintético', Tarifa: '1', FechaAlta: '01/01/2026' }],
    AcaTonalidades: [{ Acabado: 'UNI', Tonalidad: 'T', Descripcion: 'Tono' }, { Acabado: '' }],
    Proveedores: [{ Codigo: 'TEST', Nombre: 'Proveedor sintético' }],
    ClientesObras: [{ Cliente: 'TEST', Nombre: 'Obra sintética', nObra: '1' }, { Nombre: '' }],
    Estructuras: [{ Codigo: 'EST', Descripcion: 'Estructura sintética' }],
    EstructurasDiseño: [
      { Estructura: 'EST', Id: '1', Tipo: '1', Simbolo: 'A', Cota: '1000' },
      { Estructura: 'EST', Id: '2', Tipo: '2' },
      { Estructura: 'EST', TipoDoc: 'VPRES' },
    ],
    EstructurasArticulos: [
      { Estructura: 'EST', Articulo: 'P', Cantidad: '2', FormulaLargo: 'A' },
      { Estructura: 'EST', Articulo: 'P', TipoDoc: 'VPRES' },
      { Estructura: 'EST' },
    ],
    ConfigSeries: [{ Serie: 'S', PVCsn: 'False' }, { Serie: '*' }, { Serie: '' }],
    Conjuntos: [{ Codigo: 'S', CodSerie: 'S', TablaHojas: 'TA', TablaFijos: 'TF', herr1HA: 'H', SubSerieDe: 'S' }],
    TAcristalamientoLin: [
      { TAcris: 'TA', Grosor: '24', Junquillo: 'J', JuntaExt: '0' },
      { TAcris: 'TF', Grosor: '24', Junquillo: 'J' },
    ],
    ConjuntosLin: [{ Conjunto: 'S', Componente: 'MV', Articulo: 'P' }, { Conjunto: 'S', Componente: 'X', Articulo: '0' }],
    ConjuntosOpcionesHerraje: [{ Conjunto: 'S', nOpcion: '1', Descripcion: 'Opción', OcultaSN: 'True' }],
    ArticulosCoste: [{ Articulo: 'P', Coste: '1,50' }, { Articulo: 'FUERA', Coste: '2' }, { Articulo: 'J' }],
    ArticulosPVP: [{ Articulo: 'P', Acabado: 'UNI', Tarifa: '1', PVP: '2,50' }, { Articulo: 'J', Acabado: 'UNI', Tarifa: '1' }],
    VDatosLinEstr: [],
    VPresupuestosLin: [],
  }
  for (let i = 1; i <= 6; i++) {
    const id = String(i)
    const fijo = i > 3
    tablas.VDatosLinEstr.push({ nVDoc: '1', nVLinea: id, Conjunto1: 'S' })
    tablas.VPresupuestosLin.push(
      { nDoc: '1', nLinea: id, EstructuraSN: 'True' },
      { nEstr: id, Funcion: fijo ? 'MV' : 'HV', Articulo: 'P', LargoCorte: '1020' },
      { nEstr: id, Funcion: fijo ? 'MH' : 'HH', Articulo: 'P', LargoCorte: '620' },
      { nEstr: id, Articulo: 'V', Largo: '1000', Ancho: '600' },
      { nEstr: id, Articulo: 'J', LargoCorte: '972' },
      { nEstr: id, Articulo: 'J', LargoCorte: '612' },
    )
  }
  for (const [tabla, filas] of Object.entries(tablas)) {
    const campos = [...new Set(filas.flatMap(Object.keys))]
    const csv = [campos, ...filas.map(f => campos.map(c => f[c] ?? ''))]
      .map(f => f.map(v => JSON.stringify(v)).join(',')).join('\n')
    writeFileSync(join(origen, `${tabla}.csv`), csv)
  }
  const operaciones: { consulta: string; valores: unknown[] }[] = []
  const sql = ((entrada: unknown, ...valores: unknown[]) => {
    if (!Array.isArray(entrada) || !('raw' in entrada)) return entrada
    const consulta = entrada.join('?').replace(/\s+/g, ' ').trim()
    operaciones.push({ consulta, valores })
    return Promise.resolve(consulta.startsWith('SELECT codigo') ? [{ codigo: 'P' }, { codigo: 'J' }, { codigo: 'V' }] : [])
  }) as unknown as Sql
  return { origen, sql, operaciones }
}
