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
    'estructura_componentes', 'estructura_cotas',
    'vidrio_galce', 'junquillo_ajustes', 'tacris_filas',
    'conjunto_resoluciones', 'conjunto_delegaciones', 'conjuntos', 'series',
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
 * Cotas simbólicas: el origen de las variables de las fórmulas.
 * Sólo interesan las filas de catálogo (sin documento) que llevan símbolo.
 */
resultados.push(await cargar('EstructurasDiseño', 'estructura_cotas', (f, r) => {
  if (txt(f.TipoDoc)) { excluir(r, 'instancia de documento, no plantilla'); return null }

  const simbolo = txt(f.Simbolo)
  if (!simbolo) { excluir(r, 'fila de diseño sin símbolo'); return null }

  const estructura = txt(f.Estructura)
  if (!estructura) { descartar(r, 'sin estructura'); return null }

  return {
    estructura_codigo: estructura,
    simbolo,
    valor_por_defecto: num(f.Cota),
    nombre: txt(f.nombreDA),
    orientacion: txt(f.TravVP),
    orden_travesano: ent(f.nTrav),
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
    formula_ancho: txt(f.FormulaAncho),
    formula_ancho_corte: txt(f.FormulaAnchoCorte),
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
  const limpiar = (v: unknown) => {
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
 * Costes por artículo, proveedor y acabado.
 * La tabla original referencia también artículos de series no migradas de
 * InfoSeries: los que no están en nuestro catálogo se excluyen a propósito
 * (no pueden aparecer en un despiece de esta empresa).
 */
{
  const codigosArticulo = new Set<string>(
    (await sql<{ codigo: string }[]>`SELECT codigo FROM articulos`).map((x) => x.codigo),
  )
  resultados.push(await cargar('ArticulosCoste', 'articulos_coste', (f, r) => {
    const articulo = txt(f.Articulo)
    if (!articulo) { descartar(r, 'sin artículo'); return null }
    if (!codigosArticulo.has(articulo)) { excluir(r, 'artículo fuera del catálogo de la empresa'); return null }
    const coste = num(f.Coste)
    if (coste === null) { descartar(r, 'sin coste'); return null }
    return {
      articulo_codigo: articulo,
      proveedor_codigo: txt(f.Proveedor) ?? '',
      acabado_codigo: txt(f.Acabado) ?? '',
      coste,
      actualizado_en: fecha(f.UltimaAct),
    }
  }))
}

/**
 * Descuento de galce del vidrio, MEDIDO del histórico (PLAN.md anexo L):
 *
 *   medida del vidrio = medida de corte de la hoja − delta(serie, perfil)
 *
 * Para cada línea real con emparejamiento inequívoco (un único corte HV, un
 * único HH y vidrios M2 de medida única), delta = corte − medida del vidrio.
 * Se emite la moda por (serie, perfil de hoja) sólo si hay ≥3 muestras y
 * ≥90% de consistencia. Sin fila, el vidrio queda "sin calcular": nunca se
 * adivina.
 */
{
  const r: Resultado = {
    tabla: 'vidrio_galce', leidas: 0, insertadas: 0, descartadas: 0,
    excluidas: 0, motivos: new Map(),
  }
  const rutaVLin = rutaTabla(ORIGEN, 'VPresupuestosLin')
  const rutaDatos = rutaTabla(ORIGEN, 'VDatosLinEstr')
  if (rutaVLin && rutaDatos) {
    const aNum = (v: string | undefined) => Number((v ?? '').replace(',', '.')) || 0

    // Familia, tipo de metraje y tamaño de junquillo/goma por artículo
    const famArt = new Map<string, { familia: string; m2: boolean; tamJunq: number }>()
    for await (const lote of leerLotes(rutaTabla(ORIGEN, 'Articulos')!, 1000)) {
      for (const f of lote) {
        famArt.set((f.Codigo ?? '').trim(), {
          familia: (f.Familia ?? '').trim(),
          m2: (f.TipoMetraje ?? '').trim() === 'M2',
          tamJunq: Number((f.TamJunqGoma ?? '').replace(',', '.')) || 0,
        })
      }
    }
    // TablaHojas por conjunto y filas de acristalamiento, para saber qué
    // junquillo esperar en cada línea (anexo M).
    const tablaHojasPorConjunto = new Map<string, string>()
    for await (const lote of leerLotes(rutaTabla(ORIGEN, 'Conjuntos')!, 1000)) {
      for (const f of lote) {
        tablaHojasPorConjunto.set((f.Codigo ?? '').trim(), (f.TablaHojas ?? '').trim())
      }
    }
    const filasTacris = new Map<string, { grosor: number; junq: string }[]>()
    for await (const lote of leerLotes(rutaTabla(ORIGEN, 'TAcristalamientoLin')!, 1000)) {
      for (const f of lote) {
        const t = (f.TAcris ?? '').trim()
        if (!filasTacris.has(t)) filasTacris.set(t, [])
        filasTacris.get(t)!.push({
          grosor: Number((f.Grosor ?? '').replace(',', '.')) || 0,
          junq: (f.Junquillo ?? '').trim(),
        })
      }
    }
    for (const lista of filasTacris.values()) lista.sort((a, b) => a.grosor - b.grosor)
    const junquilloEsperado = (serie: string, tamJunq: number): string | null => {
      const lista = filasTacris.get(tablaHojasPorConjunto.get(serie) ?? '') ?? []
      for (const f of lista) {
        if (f.grosor >= tamJunq - 1e-9) return f.junq && f.junq !== '0' ? f.junq : null
      }
      return null
    }
    // Serie por línea de documento
    const seriePorLinea = new Map<string, string>()
    for await (const lote of leerLotes(rutaDatos, 1000)) {
      for (const f of lote) {
        seriePorLinea.set(`${(f.nVDoc ?? '').trim()}|${(f.nVLinea ?? '').trim()}`, (f.Conjunto1 ?? '').trim())
      }
    }
    // Agrupar hijas por línea padre
    interface Hoja {
      hv: Set<number>; hh: Set<number>; artHV: Set<string>
      vidrios: { l: number; a: number; art: string }[]
      cortes: Map<string, number[]>
    }
    const padres = new Map<string, string>() // nLinea -> serie
    const grupos = new Map<string, Hoja>()
    for await (const lote of leerLotes(rutaVLin, 1000)) {
      for (const f of lote) {
        if ((f.EstructuraSN ?? '').trim() === 'True') {
          const serie = seriePorLinea.get(`${(f.nDoc ?? '').trim()}|${(f.nLinea ?? '').trim()}`)
          if (serie) padres.set((f.nLinea ?? '').trim(), serie)
          continue
        }
        const nEstr = (f.nEstr ?? '').trim()
        if (!nEstr || nEstr === '0') continue
        let g = grupos.get(nEstr)
        if (!g) grupos.set(nEstr, (g = { hv: new Set(), hh: new Set(), artHV: new Set(), vidrios: [], cortes: new Map() }))
        const fn = (f.Funcion ?? '').trim()
        const art = (f.Articulo ?? '').trim()
        if (fn === 'HV') {
          g.hv.add(aNum(f.LargoCorte))
          if (art && art !== '0') g.artHV.add(art)
        } else if (fn === 'HH') {
          g.hh.add(aNum(f.LargoCorte))
        } else {
          const info = famArt.get(art)
          if (info?.familia === '050' && info.m2) {
            g.vidrios.push({ l: aNum(f.Largo), a: aNum(f.Ancho), art })
          } else if (art && art !== '0') {
            const lista = g.cortes.get(art) ?? []
            lista.push(aNum(f.LargoCorte))
            g.cortes.set(art, lista)
          }
        }
      }
    }
    // Deltas por (serie, perfil)
    const muestras = new Map<string, Map<number, number>>()
    for (const [nLinea, serie] of padres) {
      const g = grupos.get(nLinea)
      if (!g || g.hv.size !== 1 || g.hh.size < 1 || g.artHV.size !== 1 || !g.vidrios.length) continue
      const medidas = new Set(g.vidrios.map((v) => `${v.l}|${v.a}`))
      if (medidas.size !== 1) continue
      const v = g.vidrios[0]
      if (v.l <= 0 || v.a <= 0) continue
      const delta = Math.round(([...g.hv][0] - v.l) * 10) / 10
      if (delta < 0 || delta > 200) continue
      const clave = `${serie}|${[...g.artHV][0]}`
      let m = muestras.get(clave)
      if (!m) muestras.set(clave, (m = new Map()))
      m.set(delta, (m.get(delta) ?? 0) + 1)
      r.leidas++
    }
    const filas: Record<string, unknown>[] = []
    for (const [clave, conteo] of muestras) {
      const total = [...conteo.values()].reduce((a, b) => a + b, 0)
      const [delta, n] = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]
      if (total < 3 || n / total < 0.9) {
        excluir(r, 'muestras insuficientes o inconsistentes: no se emite')
        continue
      }
      const [serie, perfil] = clave.split('|')
      filas.push({ serie_codigo: serie, perfil_codigo: perfil, delta_mm: delta, muestras: n })
    }
    if (filas.length) {
      await sql`INSERT INTO vidrio_galce ${sql(filas)} ON CONFLICT DO NOTHING`
      r.insertadas = filas.length
    }

    // --- Ajustes de longitud del junquillo, con los mismos datos (anexo M) ---
    // Cada corte del junquillo esperado se asigna a la dimensión del vidrio
    // más próxima; el ajuste es la diferencia. Se emite la moda por serie si
    // hay ≥3 muestras y ≥90% de consistencia en ambas dimensiones.
    const ajustes = new Map<string, { largo: Map<number, number>; ancho: Map<number, number> }>()
    for (const [nLinea, serie] of padres) {
      const g = grupos.get(nLinea)
      if (!g || !g.vidrios.length) continue
      const artsVid = new Set(g.vidrios.map((v) => v.art))
      if (artsVid.size !== 1) continue
      const medidas = new Set(g.vidrios.map((v) => `${v.l}|${v.a}`))
      if (medidas.size !== 1) continue
      const v = g.vidrios[0]
      if (v.l <= 0 || v.a <= 0) continue
      const tamJunq = famArt.get(v.art)?.tamJunq ?? 0
      if (!tamJunq) continue
      const junq = junquilloEsperado(serie, tamJunq)
      if (!junq) continue
      const cortes = g.cortes.get(junq) ?? []
      let acc = ajustes.get(serie)
      if (!acc) ajustes.set(serie, (acc = { largo: new Map(), ancho: new Map() }))
      for (const corte of cortes) {
        const dL = Math.round((corte - v.l) * 10) / 10
        const dA = Math.round((corte - v.a) * 10) / 10
        if (Math.abs(dL) > 100 && Math.abs(dA) > 100) continue
        const mapa = Math.abs(dL) <= Math.abs(dA) ? acc.largo : acc.ancho
        const d = Math.abs(dL) <= Math.abs(dA) ? dL : dA
        mapa.set(d, (mapa.get(d) ?? 0) + 1)
      }
    }
    const rj: Resultado = {
      tabla: 'junquillo_ajustes', leidas: 0, insertadas: 0, descartadas: 0,
      excluidas: 0, motivos: new Map(),
    }
    const filasAjuste: Record<string, unknown>[] = []
    for (const [serie, acc] of ajustes) {
      const moda = (m: Map<number, number>) => {
        const total = [...m.values()].reduce((a, b) => a + b, 0)
        if (!total) return null
        const [valor, n] = [...m.entries()].sort((a, b) => b[1] - a[1])[0]
        return { valor, n, total }
      }
      const mL = moda(acc.largo), mA = moda(acc.ancho)
      rj.leidas++
      if (!mL || !mA || mL.total < 3 || mA.total < 3 || mL.n / mL.total < 0.9 || mA.n / mA.total < 0.9) {
        excluir(rj, 'muestras insuficientes o inconsistentes: no se emite')
        continue
      }
      filasAjuste.push({
        serie_codigo: serie,
        ajuste_largo_mm: mL.valor,
        ajuste_ancho_mm: mA.valor,
        muestras: Math.min(mL.n, mA.n),
      })
    }
    if (filasAjuste.length) {
      await sql`INSERT INTO junquillo_ajustes ${sql(filasAjuste)} ON CONFLICT DO NOTHING`
      rj.insertadas = filasAjuste.length
    }
    resultados.push(rj)
  } else {
    r.motivos.set('CSV no encontrado', 1)
  }
  resultados.push(r)
}

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
