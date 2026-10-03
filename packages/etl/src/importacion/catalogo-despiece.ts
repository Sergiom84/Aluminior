/**
 * Catálogo de despiece completo (fase-7/06): plantilla con grupos de extremo,
 * asociaciones, grupos, tipos de hoja, mano de obra, incrementos de precio,
 * datos de artículo y parámetros de serie. Solo catálogo: las filas de
 * documentos (`TipoDoc` informado) se excluyen.
 */
import type { Sql } from 'postgres'
import { bool, ent, leerLotes, num, rutaTabla, txt, type Fila } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import { crearCargadorEstricto } from './cargar-estricto.ts'
import { descartar, excluir, type Resultado } from './resultado.ts'

const cero = (v: string | undefined) => num(v) ?? '0'
const listas = (v: string | undefined) => (v ?? '').split(';').map(s => s.trim()).filter(Boolean)

export function filaPlantilla(f: Fila, r: Resultado, estructuras: ReadonlySet<string> | null) {
  if (txt(f.TipoDoc)) { excluir(r, 'instancia, no catálogo'); return null }
  const estructura = txt(f.Estructura), linea = ent(f.nLin), articulo = txt(f.Articulo)
  if (!estructura || linea === null || !articulo) { descartar(r, 'plantilla sin clave'); return null }
  if (estructuras && !estructuras.has(estructura)) { excluir(r, 'estructura no importada'); return null }
  const perfilAdicional = ent(f.DisIdPerAd)
  return {
    estructura_codigo: estructura, linea_origen: linea, id_pieza: ent(f.id) ?? 0, articulo,
    componente: txt(f.DisComponente), funcion: txt(f.Funcion), cantidad: cero(f.Cantidad),
    posicion_trabajo: txt(f.PosicionTrabajo), tipo_hoja: txt(f.DisTipoHoja), mano: txt(f.DisManoID),
    hoja: ent(f.DisNHoja) ?? 0, dis_vidrio: txt(f.DisVidrio),
    referencia_largo: ent(f.DisIdRefLargo) || null, referencia_ancho: ent(f.DisIdRefAncho) || null,
    formula_largo: txt(f.FormulaLargoCorte) ?? txt(f.FormulaLargo),
    formula_ancho: txt(f.FormulaAnchoCorte) ?? txt(f.FormulaAncho),
    formula_referencia_largo: txt(f.DisFRefLargo), formula_referencia_ancho: txt(f.DisFRefAncho),
    grupo: txt(f.DisGrupo), grupo_izquierdo: txt(f.DisGrupoI), grupo_derecho: txt(f.DisGrupoD),
    grupo_superior: txt(f.DisGrupoSup), grupo_inferior: txt(f.DisGrupoInf),
    grupos_adicionales: [txt(f.DisGrupoAdicional), txt(f.DisGrupoAd2), txt(f.DisGrupoAd3), txt(f.DisGrupoAdIndep)]
      .map(g => g ?? ''),
    perfil_adicional: perfilAdicional === null || perfilAdicional === 0 || perfilAdicional === -1 ? null : perfilAdicional,
    formula_seleccion: txt(f.OPCformulaSelec),
  }
}

export function filaAsociacion(f: Fila, r: Resultado) {
  const id = txt(f.nLin), conjunto = txt(f.Conjunto)
  if (!id || !conjunto) { descartar(r, 'asociación sin clave'); return null }
  const noContrastado: string[] = []
  if (Number(num(f.PlHojasX) ?? 0) || Number(num(f.PlHojasY) ?? 0) || txt(f.PlHojasXYstr)) noContrastado.push('plano de hojas')
  if (Number(num(f.AltoALMin) ?? 0) || Number(num(f.AltoALMax) ?? 0)) noContrastado.push('alto de manilla')
  if (bool(f.PVCrefuerzoSN)) noContrastado.push('refuerzo')
  if (bool(f.SoloPerfPpalSN)) noContrastado.push('solo perfiles principales')
  if (txt(f.TablaHerrajeInsertar) || txt(f.FormulaTablaHerrAlto) || txt(f.FormulaTablaHerrAncho)) noContrastado.push('tabla de herraje')
  const opcion = ent(f.nOpcion)
  return {
    id, conjunto_codigo: conjunto, articulo: txt(f.Articulo) ?? '', cantidad: cero(f.Cantidad),
    acabado: txt(f.Acabado) ?? '', intervalo: cero(f.Intervalo), medida_min: cero(f.MedidaMin),
    medida_max: cero(f.MedidaMax), unidades_min: cero(f.UnidadesMin), unidades_max: cero(f.UnidadesMax),
    tipo_medida: txt(f.TipoMedCV) ?? 'C', descuento: cero(f.Descuento), formula_largo: txt(f.FormulaL),
    formula_ancho: txt(f.FormulaA), solo_una: bool(f.SoloUnaSN), componente: txt(f.ComponenteAsoc) ?? '!',
    grupo: txt(f.GrupoAsoc) ?? '!', grupo_asociacion: txt(f.AsocAGrupoAsoc), modulos: txt(f.AsocAModulo),
    articulo_principal: txt(f.ArticuloAsoc), opcion: opcion === null ? null : String(opcion),
    formula_opcion: txt(f.FormulaOpcion), apertura: ent(f.AperturaTH) ?? 0, mano: txt(f.ManoID),
    posicion_trabajo: txt(f.PosTrab), asociado_a: txt(f.AsociadoA) ?? '', no_contrastado: noContrastado,
  }
}

export function filaManoObra(f: Fila, r: Resultado) {
  const codigo = txt(f.Codigo)
  if (!codigo) { descartar(r, 'concepto sin código'); return null }
  const modulo = ent(f.ModuloAsoc)
  return {
    codigo, descripcion: txt(f.Descripcion) ?? '', minutos: cero(f.TiempoFabr), articulo: txt(f.CodArticulo) ?? 'MO',
    modulo: modulo && modulo > 0 ? String(modulo) : null, articulo_asociado: txt(f.ArticuloAsoc),
    componente_asociado: txt(f.ComponenteAsoc), grupo_asociado: txt(f.GrupoAsoc),
    con_incrementos: [f.TiempoPreparacion, f.AnchoTiempo, f.AltoTiempo, f.AnchoMayorMM, f.AltoMayorMM]
      .some(v => Number(num(v) ?? 0) !== 0),
    categoria: txt(f.Categoria),
  }
}

export function parametrosSerie(f: Fila) {
  const codigo = txt(f.Codigo)
  if (!codigo) return null
  const sufijos = (prefijo: RegExp) => Object.fromEntries(Object.entries(f)
    .filter(([k, v]) => prefijo.test(k) && txt(v)).map(([k, v]) => [k.replace(prefijo, ''), txt(v)!]))
  return {
    conjunto_codigo: codigo, herrajes: sufijos(/^herr/), mano_obra: sufijos(/^mo(?=[0-9M])/),
    grosor_maximo_simple: cero(f.CorrGrosorVid), grosor_maximo_doble: cero(f.CorrGrosorVidDA),
  }
}

export async function cargarCatalogoDespiece(cargar: Cargar, estructuras: ReadonlySet<string> | null): Promise<Resultado[]> {
  const unicas = (nombre: string) => { const vistas = new Set<string>(); return (r: Resultado, ...clave: unknown[]) => {
    const k = JSON.stringify(clave)
    if (vistas.has(k)) { descartar(r, `${nombre} duplicado`); return false }
    vistas.add(k); return true
  } }
  const plantillaUnica = unicas('plantilla'), grupoUnico = unicas('grupo')
  // Las filas `0` repetidas de un mismo conjunto y componente son idénticas (35 en
  // EMP0016, ninguna en conflicto con un artículo): se cuentan como exclusión.
  const vacias = new Set<string>()
  return [
    await cargar('EstructurasArticulos', 'estructura_plantilla_catalogo', (f, r) => {
      const fila = filaPlantilla(f, r, estructuras)
      return fila && plantillaUnica(r, fila.estructura_codigo, fila.linea_origen) ? fila : null
    }),
    await cargar('ConjuntosAsoc', 'conjunto_asociaciones', filaAsociacion),
    await cargar('FamiliasGruposAsoc', 'grupos_asociacion', (f, r) => {
      const familia = txt(f.Familia), codigo = txt(f.Codigo)
      if (!familia || !codigo) { descartar(r, 'grupo sin clave'); return null }
      if (!grupoUnico(r, familia, codigo)) return null
      return { familia, codigo, componentes: listas(f.Componentes), descripcion: txt(f.Descripcion) ?? '' }
    }),
    await cargar('SeriesAsocV2TiposHoja', 'tipos_hoja_catalogo', (f, r) => {
      const id = txt(f.id), tipo = txt(f.tipo)
      if (!id || !tipo) { descartar(r, 'tipo de hoja sin clave'); return null }
      return { id, tipo, descripcion: txt(f.descripcion) ?? '' }
    }),
    await cargar('MOConceptos', 'mano_obra_conceptos', filaManoObra),
    await cargar('Estructuras', 'estructura_parametros_despiece', (f, r) => {
      const codigo = txt(f.Codigo)
      if (!codigo) { descartar(r, 'estructura sin código'); return null }
      if (estructuras && !estructuras.has(codigo)) { excluir(r, 'estructura no importada'); return null }
      return { estructura_codigo: codigo, tipo_perfil: txt(f.TipoPerf) }
    }),
    await cargar('ArticulosIncrPrecio', 'articulos_incrementos_precio', (f, r) => {
      const id = ent(f.nLin), articulo = txt(f.Articulo), tipo = txt(f.TipoMetMed)
      if (id === null || !articulo || (tipo !== 'MET' && tipo !== 'MED')) { descartar(r, 'incremento sin clave o tipo'); return null }
      return { id, articulo_codigo: articulo, tipo, desde: cero(f.MetrajeDesde), hasta: cero(f.MetrajeHasta), porcentaje: cero(f.IncrementoPorc) }
    }),
    await cargar('Articulos', 'articulos_despiece', (f, r) => {
      const codigo = txt(f.Codigo)
      if (!codigo) { descartar(r, 'artículo sin código'); return null }
      return {
        articulo_codigo: codigo, componente: txt(f.Componente), generico: bool(f.GenericoSN),
        doble_acristalamiento: bool(f.DAcrisSN), grosor_acristalar: cero(f.TamJunqGoma), incrementos_precio: bool(f.IncrementosPrecioSN),
      }
    }),
    await cargar('ConjuntosLin', 'conjunto_ranuras_vacias', (f, r) => {
      const conjunto = txt(f.Conjunto), componente = txt(f.Componente)
      if (!conjunto || !componente || txt(f.Articulo) !== '0') { excluir(r, 'no es ranura vacía explícita'); return null }
      const clave = JSON.stringify([conjunto, componente])
      if (vacias.has(clave)) { excluir(r, 'ranura vacía repetida'); return null }
      vacias.add(clave)
      return { conjunto_codigo: conjunto, componente }
    }),
  ]
}

async function cargarParametrosSerie(sql: Sql, origen: string): Promise<Resultado> {
  const r: Resultado = { tabla: 'conjunto_parametros_despiece', leidas: 0, insertadas: 0, descartadas: 0, excluidas: 0, motivos: new Map() }
  for await (const lote of leerLotes(rutaTabla(origen, 'Conjuntos')!, 500)) {
    r.leidas += lote.length
    for (const f of lote) {
      const p = parametrosSerie(f)
      if (!p) { descartar(r, 'conjunto sin código'); continue }
      await sql`INSERT INTO conjunto_parametros_despiece
        (conjunto_codigo, herrajes, mano_obra, grosor_maximo_simple, grosor_maximo_doble)
        VALUES (${p.conjunto_codigo}, ${JSON.stringify(p.herrajes)}::jsonb, ${JSON.stringify(p.mano_obra)}::jsonb,
          ${p.grosor_maximo_simple}, ${p.grosor_maximo_doble})`
      r.insertadas++
    }
  }
  return r
}

const TABLAS = ['estructura_plantilla_catalogo', 'conjunto_asociaciones', 'grupos_asociacion', 'tipos_hoja_catalogo',
  'mano_obra_conceptos', 'articulos_incrementos_precio', 'articulos_despiece', 'conjunto_ranuras_vacias',
  'conjunto_parametros_despiece', 'estructura_parametros_despiece']
const ORIGENES = ['EstructurasArticulos', 'ConjuntosAsoc', 'FamiliasGruposAsoc', 'SeriesAsocV2TiposHoja', 'MOConceptos',
  'ArticulosIncrPrecio', 'Articulos', 'ConjuntosLin', 'Conjuntos', 'Estructuras']

export function comprobarOrigenDespiece(origen: string) {
  for (const tabla of ORIGENES) if (!rutaTabla(origen, tabla)) throw new Error(`Falta ${tabla}; se conserva el catálogo de despiece`)
}

/** Sustituye las tablas del despiece completo dentro de la transacción del llamante. */
export async function reemplazarCatalogoDespiece(tx: Sql, origen: string) {
  for (const tabla of TABLAS) await tx`DELETE FROM ${tx(tabla)}`
  const estructuras = new Set((await tx`SELECT codigo FROM estructuras`).map(f => String(f.codigo)))
  const resultados = [
    ...await cargarCatalogoDespiece(crearCargadorEstricto(tx, origen), estructuras),
    await cargarParametrosSerie(tx, origen),
  ]
  const fallidas = resultados.filter(r => r.descartadas > 0 || r.insertadas === 0)
  if (fallidas.length) {
    const detalle = fallidas.map(r => `${r.tabla}: ${r.insertadas} insertadas, ${r.descartadas} descartadas ` +
      `(${[...r.motivos].map(([m, n]) => `${n}× ${m}`).join('; ')})`).join(' | ')
    throw new Error(`Catálogo de despiece incompleto; actualización revertida. ${detalle}`)
  }
  return resultados
}

/** Actualización suplementaria atómica: no vacía presupuestos ni el catálogo anterior. */
export async function importarCatalogoDespiece(sql: Sql, origen: string) {
  comprobarOrigenDespiece(origen)
  return sql.begin(tx => reemplazarCatalogoDespiece(tx as unknown as Sql, origen))
}
