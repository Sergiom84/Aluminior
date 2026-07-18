/**
 * Importa los CSV del sistema original a PostgreSQL.
 *
 * Idempotente: se puede ejecutar tantas veces como haga falta. Cada tabla se
 * vacía antes de cargarse y los conflictos de clave se ignoran.
 *
 * Valida por conteo: si el número de filas insertadas no coincide con las
 * filas legibles del CSV, avisa. Los descartes se explican, no se silencian.
 *
 * Uso: npm run etl
 */

import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { rutaTabla, leerLotes, txt, num, ent, bool, fecha, type Fila } from './csv.ts'

// --- Entorno ---
for (const linea of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2].trim()
}

const ORIGEN = process.env.RUTA_CSV_ORIGEN
if (!ORIGEN) throw new Error('Falta RUTA_CSV_ORIGEN en .env')

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 5 })

interface Resultado {
  tabla: string
  leidas: number
  insertadas: number
  descartadas: number
  excluidas: number
  motivos: Map<string, number>
}

/**
 * Descarte: la fila DEBERÍA haber entrado y no pudo. Es un problema.
 */
function descartar(r: Resultado, motivo: string) {
  r.descartadas++
  r.motivos.set(`descartada: ${motivo}`, (r.motivos.get(`descartada: ${motivo}`) ?? 0) + 1)
}

/**
 * Exclusión: la fila NO pertenece a esta tabla y se filtra a propósito.
 * No es un error y no debe hacer fallar la carga. La distinción importa:
 * si todo se cuenta igual, un descarte real se esconde entre el ruido.
 */
function excluir(r: Resultado, motivo: string) {
  r.excluidas++
  r.motivos.set(`excluida: ${motivo}`, (r.motivos.get(`excluida: ${motivo}`) ?? 0) + 1)
}

/**
 * Carga una tabla. `mapear` devuelve null para descartar la fila
 * (con motivo, para poder explicarlo al final).
 */
async function cargar(
  tablaOrigen: string,
  tablaDestino: string,
  mapear: (f: Fila, r: Resultado) => Record<string, unknown> | null,
): Promise<Resultado> {
  const r: Resultado = {
    tabla: tablaDestino, leidas: 0, insertadas: 0, descartadas: 0, excluidas: 0,
    motivos: new Map(),
  }

  const ruta = rutaTabla(ORIGEN!, tablaOrigen)
  if (!ruta) {
    r.motivos.set('CSV no encontrado', 1)
    return r
  }

  for await (const lote of leerLotes(ruta, 500)) {
    r.leidas += lote.length
    const filas = lote.map((f) => mapear(f, r)).filter((x): x is Record<string, unknown> => x !== null)
    if (!filas.length) continue

    try {
      await sql`INSERT INTO ${sql(tablaDestino)} ${sql(filas)} ON CONFLICT DO NOTHING`
      r.insertadas += filas.length
    } catch (e) {
      // Reintento fila a fila para aislar la que falla en lugar de perder el lote
      for (const fila of filas) {
        try {
          await sql`INSERT INTO ${sql(tablaDestino)} ${sql(fila)} ON CONFLICT DO NOTHING`
          r.insertadas++
        } catch (err) {
          descartar(r, `rechazada por la BD: ${(err as Error).message.slice(0, 60)}`)
        }
      }
    }
  }

  return r
}

/**
 * Vacía todas las tablas destino de una sola vez.
 *
 * Hace falta TRUNCATE ... CASCADE en un único enunciado: borrarlas de una en
 * una falla por las claves ajenas (articulos referencia familias), y el orden
 * inverso se rompe en cuanto el esquema crezca.
 */
async function vaciarDestino() {
  const tablas = [
    'lineas_despiece', 'lineas_acristalamiento', 'lineas_opciones_herraje',
    'lineas_estructura', 'lineas', 'presupuestos', 'obras',
    'clientes_potenciales', 'clientes', 'proveedores',
    'estructura_componentes',
    'articulos_coste', 'articulos_pvp', 'articulos', 'estructuras',
    'subfamilias', 'tonalidades', 'acabados', 'familias',
  ]
  await sql`TRUNCATE TABLE ${sql(tablas)} RESTART IDENTITY CASCADE`
}

// --- Carga, en orden de dependencias ---

await vaciarDestino()

const resultados: Resultado[] = []

resultados.push(await cargar('Familias', 'familias', (f) => {
  const codigo = txt(f.Codigo)
  if (!codigo) return null
  return { codigo, descripcion: txt(f.Nombre) ?? codigo, grupo: txt(f.LineaNegocio) }
}))

resultados.push(await cargar('Acabados', 'acabados', (f) => {
  const codigo = txt(f.Codigo)
  if (!codigo) return null
  return {
    codigo,
    descripcion: txt(f.Descripcion) ?? codigo,
    admite_tonalidad: bool(f.TonalidadesSN),
  }
}))

resultados.push(await cargar('Articulos', 'articulos', (f, r) => {
  const codigo = txt(f.Codigo)
  if (!codigo) { descartar(r, 'sin código'); return null }
  return {
    codigo,
    descripcion: txt(f.Descripcion) ?? codigo,
    familia_codigo: txt(f.Familia),
    subfamilia_codigo: txt(f.Subfamilia),
    tipo_metraje: txt(f.TipoMetraje) ?? 'UD',
    metraje_minimo: num(f.MetrajeMinimo),
    metraje_multiplo_largo: num(f.MetrajeMultiploLargo),
    metraje_multiplo_ancho: num(f.MetrajeMultiploAncho),
    peso_ml: num(f.PesoML),
    grosor_peso_vidrio: num(f.GrosorPesoVid),
    tam_junquillo_goma: txt(f.TamJunqGoma),
    da_grosor: num(f.DAgrosor),
    da_vidrio_1: txt(f.DAVid1),
    da_vidrio_2: txt(f.DAVid2),
    da_camara_1: txt(f.DACam1),
    da_articulo_base: txt(f.DAArtBase),
    aparece_en_hoja_despiece: bool(f.HojaDespieceSN, true),
    aparece_en_hoja_corte: bool(f.HojaCorteSN, true),
    controla_stock: bool(f.StockSN),
    proveedor_habitual: txt(f.TPproveedor),
  }
}))

resultados.push(await cargar('Clientes', 'clientes', (f, r) => {
  const codigo = txt(f.Codigo)
  if (!codigo) { descartar(r, 'sin código'); return null }
  return {
    codigo,
    nombre: txt(f.Nombre) ?? codigo,
    nombre_comercial: txt(f.NombreComercial),
    nif: txt(f.NIF),
    direccion: txt(f.Direccion),
    cp: txt(f.CP),
    poblacion: txt(f.Poblacion),
    provincia: txt(f.Provincia),
    pais: txt(f.Pais) ?? 'ES',
    persona_contacto: txt(f.Att),
    telefono: txt(f.Telefono),
    telefono_movil: txt(f.TelefonoMovil),
    email: txt(f.eMail),
    tarifa: ent(f.Tarifa) ?? 1,
    tipo_iva: txt(f.TipoIVA),
    descuento: num(f.Descuento),
    descuento_factura: num(f.DescuentoFac),
    persona_fisica_juridica: txt(f.PersonaFisicaJuridica),
    sii_tipo_id_fiscal: txt(f.siiTipoIdFiscal),
    fecha_alta: fecha(f.FechaAlta),
  }
}))

resultados.push(await cargar('AcaTonalidades', 'tonalidades', (f, r) => {
  const acabado = txt(f.Acabado)
  const codigo = txt(f.Tonalidad)
  if (!acabado || !codigo) { descartar(r, 'clave incompleta'); return null }
  return {
    acabado_codigo: acabado,
    codigo,
    descripcion: txt(f.Descripcion) ?? codigo,
  }
}))

resultados.push(await cargar('Proveedores', 'proveedores', (f, r) => {
  const codigo = txt(f.Codigo)
  if (!codigo) { descartar(r, 'sin código'); return null }
  return {
    codigo,
    nombre: txt(f.Nombre) ?? codigo,
    nif: txt(f.NIF),
    contacto: txt(f.Contacto),
    direccion: txt(f.Direccion),
    cp: txt(f.CP),
    poblacion: txt(f.Poblacion),
    provincia: txt(f.Provincia),
    telefono: txt(f.Telefono),
    email: txt(f.eMail),
  }
}))

resultados.push(await cargar('ClientesObras', 'obras', (f, r) => {
  const cliente = txt(f.Cliente)
  const nombre = txt(f.Nombre)
  if (!nombre) { descartar(r, 'obra sin nombre'); return null }
  return {
    cliente_codigo: cliente,
    numero: ent(f.nObra),
    descripcion: nombre,
    observaciones: txt(f.Observaciones),
  }
}))

resultados.push(await cargar('Estructuras', 'estructuras', (f, r) => {
  const codigo = txt(f.Codigo)
  if (!codigo) { descartar(r, 'sin código'); return null }
  return {
    codigo,
    descripcion: txt(f.Descripcion) ?? codigo,
    familia: txt(f.Familia),
    observaciones: txt(f.Observaciones),
    es_accesorio: bool(f.AccesorioSN),
    fabrica_stock: bool(f.StFabricacionSN),
  }
}))

/**
 * Plantillas de despiece.
 *
 * `EstructurasArticulos` mezcla plantillas de catálogo (sin documento) con
 * despieces ya calculados de documentos reales. Aquí sólo se cargan las
 * plantillas: las instancias son el oráculo de validación y van aparte.
 */
resultados.push(await cargar('EstructurasArticulos', 'estructura_componentes', (f, r) => {
  // Filtrado deliberado: si tiene documento, es una instancia, no una plantilla.
  if (txt(f.TipoDoc)) { excluir(r, 'instancia de documento, no plantilla'); return null }

  const estructura = txt(f.Estructura)
  const articulo = txt(f.Articulo)
  if (!estructura) { descartar(r, 'sin estructura'); return null }
  if (!articulo) { descartar(r, 'sin artículo'); return null }

  return {
    estructura_codigo: estructura,
    linea_origen: ent(f.nLin),
    articulo_codigo: articulo,
    cantidad: num(f.Cantidad),
    cantidad_corte: num(f.CantidadCorte),
    formula_largo: txt(f.FormulaLargo),
    formula_largo_corte: txt(f.FormulaLargoCorte),
    formula_ref_largo: txt(f.DisFRefLargo),
    tipo_corte: txt(f.TipoCorte),
    angulo_izquierdo: num(f.AnguloI),
    angulo_derecho: num(f.AnguloD),
    posicion_trabajo: txt(f.PosicionTrabajo),
    funcion: txt(f.Funcion),
    medida_minima: num(f.MedidaMin),
    medida_maxima: num(f.MedidaMax),
    grupo_disenyo: txt(f.DisGrupo),
    componente_disenyo: txt(f.DisComponente),
  }
}))

resultados.push(await cargar('ArticulosPVP', 'articulos_pvp', (f, r) => {
  const articulo = txt(f.Articulo)
  const acabado = txt(f.Acabado)
  const tarifa = ent(f.Tarifa)
  const precio = num(f.PVP ?? f.Precio)
  if (!articulo || !acabado || tarifa === null) { descartar(r, 'clave incompleta'); return null }
  if (precio === null) { descartar(r, 'sin precio'); return null }
  return { articulo_codigo: articulo, acabado_codigo: acabado, tarifa, precio }
}))

await sql.end()

// --- Informe ---

console.log('\n=== Importación ===\n')
let totalInsertadas = 0
let totalDescartadas = 0

for (const r of resultados) {
  // El objetivo real son las filas aplicables: leídas menos las excluidas aposta.
  const aplicables = r.leidas - r.excluidas
  const pct = aplicables ? Math.round((100 * r.insertadas) / aplicables) : 0
  const marca = r.leidas === 0 ? '·' : r.descartadas === 0 ? 'ok' : '!'

  console.log(
    `${marca} ${r.tabla.padEnd(24)} ${String(r.insertadas).padStart(7)} / ${String(aplicables).padStart(7)}  (${pct}%)`,
  )
  for (const [motivo, n] of r.motivos) {
    console.log(`     ${String(n).padStart(7)} × ${motivo}`)
  }

  totalInsertadas += r.insertadas
  totalDescartadas += r.descartadas
}

console.log(`\n  Insertadas: ${totalInsertadas.toLocaleString('es-ES')} filas`)

if (totalDescartadas > 0) {
  console.log(`  ${totalDescartadas} filas descartadas que deberían haber entrado. Revísalo.`)
  process.exitCode = 1
} else {
  console.log('  Sin descartes: todas las filas aplicables se cargaron.')
}
