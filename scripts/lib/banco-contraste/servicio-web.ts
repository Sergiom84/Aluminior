/** Frontera de ensayo. Usa los casos de uso reales; no implementa valoración. */
import { eq } from 'drizzle-orm'
import { schema } from '@aluminior/db'
import { plantillaDiseno, UNIONES_VISUALES } from '@aluminior/core/estructuras'
import { multiplicarDecimal, normalizarDecimal } from '@aluminior/core/precios'
import { valorarEstructura, prepararManoObra, valorarCerramiento, importesLineaCerramiento, esConfiguracionCerramiento,
  type ClienteEscritura } from '@aluminior/web/banco-contraste'
import { opcionAcristalamientoOrigen } from './acristalamiento.ts'
import { configuracionGrupo } from './geometria.ts'
import { accesoriosDeCaso } from './accesorios.ts'
import { cotasDeCaso } from './cotas.ts'
import { numero, si, texto, type Caso, type Pieza } from './datos.ts'

export interface SalidaServicio { precio: number | null; total: number | null; piezas: Pieza[]; avisos: string[]; motivos: string[] }
const vacia = (motivos: string[], avisos: string[] = []): SalidaServicio => ({ precio: null, total: null, piezas: [], avisos, motivos })
function restricciones(c: Caso) {
  const motivos: string[] = []
  // No traducimos una alternativa de acristalamiento sin semántica demostrada.
  if (opcionAcristalamientoOrigen(c.configuracion?.nTAcris) === null) motivos.push('acristalamiento-alternativo-sin-mapeo')
  // El despunte de cabecera se reparte en las líneas sin regla demostrada.
  if (c.despunte! > 0) motivos.push('despunte-de-documento-sin-regla')
  if (c.tipo === 'GRUPO' && c.accesorios?.length) motivos.push('accesorios-de-grupo-no-representables')
  else motivos.push(...accesoriosDeCaso(c).motivos, ...cotasDeCaso(c).motivos)
  if (texto(c.configuracion?.Vidrio2)) motivos.push('segundo-vidrio-no-representable')
  if (c.familias.some(f => f.familia !== '001' && f.familia !== '050' && f.conjunto)) motivos.push('familia-adicional-no-representable')
  if (c.opciones.some(o => numero(o.nOpcion) === null)) motivos.push('opcion-invalida')
  if ([c.configuracion?.HorasAdFabr, c.configuracion?.HorasColoc].some(h => numero(h) === null || numero(h)! < 0)) motivos.push('horas-no-representables')
  return motivos
}
function opciones(c: Caso) { return c.opciones.filter(o => si(o.SelecSN)).map(o => `${texto(o.Conjunto)}|${numero(o.nOpcion)}`) }
function proyectar(p: { articuloCodigo: string; funcion?: string | null; acabadoCodigo?: string | null;
  cantidad?: string; largoCorteMm?: string | null; anchoCorteMm?: string | null;
  costeUnitario?: string | null; costeTotal?: string | null }, partida?: {
    cantidadFacturable: string | null; precioUnitario: string | null; importeExacto: string | null; unidad: string | null }) : Pieza {
  return { articulo: p.articuloCodigo, funcion: p.funcion ?? '', acabado: p.acabadoCodigo ?? '',
    cantidad: p.cantidad == null ? null : Number(p.cantidad), largo: p.largoCorteMm == null ? null : Number(p.largoCorteMm),
    ancho: p.anchoCorteMm == null ? null : Number(p.anchoCorteMm),
    coste: p.costeUnitario == null ? null : Number(p.costeUnitario), costeTotal: p.costeTotal == null ? null : Number(p.costeTotal),
    precio: partida?.precioUnitario == null ? null : Number(partida.precioUnitario),
    importe: partida?.importeExacto == null ? null : Number(normalizarDecimal(partida.importeExacto, 2)),
    metraje: partida?.cantidadFacturable == null ? null : Number(partida.cantidadFacturable), unidad: partida?.unidad ?? '' }
}
export async function ejecutarServicio(cliente: ClienteEscritura, c: Caso): Promise<SalidaServicio> {
  const motivos = restricciones(c)
  if (motivos.length) return vacia(motivos)
  const acabado = texto(c.padre.Acabado) || null
  const [vidrio] = c.vidrio ? await cliente.select().from(schema.articulosDespiece).where(eq(schema.articulosDespiece.articuloCodigo, c.vidrio)).limit(1) : []
  const varianteAcristalamiento = vidrio?.dobleAcristalamiento ? '2' as const : '1' as const
  const general = { serieCodigo: c.serie, vidrioCodigo: c.vidrio, acabadoCodigo: acabado,
    acabadoAccesoriosCodigo: texto(c.padre.Acabado2) || null,
    varianteAcristalamiento, opcionAcristalamiento: opcionAcristalamientoOrigen(c.configuracion?.nTAcris)!, tarifa: c.tarifa!, opcionesHerraje: opciones(c),
    comisionPorc: c.comision ?? null, opcionesPorDefecto: !c.opciones.length }
  // Access REAL conserva 6,07000017: formato de formulario a dos decimales.
  const horas = { fabricacion: numero(c.configuracion?.HorasAdFabr)!.toFixed(2), colocacion: numero(c.configuracion?.HorasColoc)!.toFixed(2) }
  if (c.tipo === 'GRUPO') {
    // El cerramiento web cobra los ajustes manuales una vez por línea, sin reparto.
    const manoObra = await prepararManoObra(cliente, { tarifa: c.tarifa!, horas })
    const manual = manoObra.estado === 'PREPARADA' ? manoObra.filas.map(f => ({ articulo: f.articuloCodigo,
      funcion: f.articuloCodigo, acabado: f.acabadoCodigo ?? '', cantidad: Number(f.minutos), largo: 0, ancho: 0,
      coste: f.costeMinuto == null ? null : Number(f.costeMinuto), costeTotal: f.costeTotal == null ? null : Number(f.costeTotal),
      precio: f.precioMinuto == null ? null : Number(f.precioMinuto), importe: f.importe == null ? null : Number(f.importe),
      metraje: Number(f.minutos), unidad: 'UD' })) : []
    if ((c.elementos ?? []).some(e => !(c.geometria ?? []).some(g => texto(g.nLinEstr) === texto(e.padre.nLinea)))) return vacia(['elementos-adicionales-sin-geometria'])
    const g = configuracionGrupo(c)
    if (!g.configuracion) return vacia(g.motivos)
    const admite = (v: unknown): boolean => esConfiguracionCerramiento(v)
    if (!admite(g.configuracion)) {
      const razones = ['configuracion-no-admitida-por-web']
      if (g.configuracion.modulos.some(m => !Number.isFinite(m.anchoMm) || m.anchoMm <= 0 ||
        !Number.isFinite(m.altoMm) || m.altoMm <= 0)) razones.push('medidas-no-validas')
      if (g.configuracion.modulos.some(m => !plantillaDiseno(m.estructuraCodigo))) razones.push('modelo-sin-plantilla-visual')
      if (g.configuracion.uniones.some(u => !UNIONES_VISUALES.some(v => v.codigo === u.codigo))) razones.push('union-fuera-del-configurador')
      return vacia(razones)
    }
    const es = c.elementos ?? [], config = es.filter(e => !si(c.geometria?.find(g => texto(g.nLinEstr) === texto(e.padre.nLinea))?.EsUnionSN))
    const incompatibles = config.flatMap(e => restricciones(e))
    if (incompatibles.length) return vacia([...new Set(incompatibles)])
    const acabadosAccesorios = new Set(es.map(e => texto(e.padre.Acabado2) || 'UNI'))
    if (acabadosAccesorios.size > 1) return vacia(['acabados-accesorios-por-elemento-no-representables'])
    const selecciones = new Map<string, Set<boolean>>()
    for (const e of es) for (const o of e.opciones) {
      const k = `${texto(o.Conjunto)}|${numero(o.nOpcion)}`, s = selecciones.get(k) ?? new Set<boolean>()
      s.add(si(o.SelecSN)); selecciones.set(k, s)
    }
    if ([...selecciones.values()].some(s => s.size > 1)) return vacia(['opciones-por-elemento-no-representables'])
    if (config.some(e => numero(e.configuracion?.HorasAdFabr)! > 0 || numero(e.configuracion?.HorasColoc)! > 0)) return vacia(['horas-por-elemento-no-representables'])
    const acabados = new Set(es.map(e => texto(e.padre.Acabado)).filter(Boolean))
    if (acabados.size > 1) return vacia(['acabados-por-elemento-no-representables'])
    const base = config[0]!
    const uniones = es.filter(e => si(c.geometria?.find(g => texto(g.nLinEstr) === texto(e.padre.nLinea))?.EsUnionSN))
    // U = SIN UNION, sin asociación a series ni piezas; el servicio exige su receta cero explícita.
    if (uniones.some(e => e.modelo !== 'U' && e.serie !== base.serie)) return vacia(['serie-de-union-no-representable'])
    // GRUPO no tiene vidrio propio: la selección global pertenece a sus módulos.
    const variantes = new Map<string, '1' | '2'>()
    for (const codigo of new Set(config.map(e => e.vidrio).filter((v): v is string => !!v))) {
      const [articulo] = await cliente.select().from(schema.articulosDespiece).where(eq(schema.articulosDespiece.articuloCodigo, codigo)).limit(1)
      variantes.set(codigo, articulo?.dobleAcristalamiento ? '2' : '1')
    }
    if (new Set(variantes.values()).size > 1) return vacia(['variantes-de-vidrio-por-elemento-no-representables'])
    const r = await valorarCerramiento(cliente, { ...general, serieCodigo: base.serie,
      vidrioCodigo: base.vidrio, acabadoCodigo: [...acabados][0] ?? acabado,
      acabadoAccesoriosCodigo: [...acabadosAccesorios][0],
      varianteAcristalamiento: base.vidrio ? variantes.get(base.vidrio)! : '1',
      opcionesHerraje: [...selecciones].filter(([, s]) => s.has(true)).map(([k]) => k), configuracion: g.configuracion,
      // Ningún elemento guarda selección: Productor usa las opciones por defecto.
      opcionesPorDefecto: es.every(e => !e.opciones.length) })
    const piezas = r.origenes.flatMap(o => {
      const partidas = o.partidasValoracion.filter(p => p.cantidadFacturable === null || Number(p.cantidadFacturable) !== 0)
      return o.piezas.map((p, i) => {
        const partida = partidas[i]?.articuloCodigo === p.articuloCodigo ? partidas[i] : undefined
        return proyectar({ ...p, acabadoCodigo: partida?.acabadoCodigo ?? p.acabadoCodigo }, partida)
      })
    })
    const importes = importesLineaCerramiento(r, String(c.cantidad), manoObra, c.comision ?? null)
    return { precio: importes.total == null ? null : Number(importes.total) / c.cantidad!,
      total: importes.total == null ? null : Number(importes.total), piezas: [...piezas, ...manual],
      avisos: r.origenes.flatMap(o => o.diagnosticos.map(d => d.detalle)), motivos }
  }
  // Horas por unidad dentro del despiece, como Productor (MOCOL en el precio unitario).
  const { compacto, accesorios } = accesoriosDeCaso(c)
  const r = await valorarEstructura(cliente, { ...general, codigo: c.modelo, compacto, accesorios, cotas: cotasDeCaso(c).cotas,
    horasFabricacion: horas.fabricacion, horasColocacion: horas.colocacion,
    anchoMm: c.dimensiones.ancho, altoMm: c.dimensiones.alto, trazabilidad: true })
  if (!r.ok) return vacia(['validacion-del-servicio'], Object.values(r.errores).flat())
  const piezas = r.piezas.map((p, i) => proyectar(p, r.partidas?.[i]))
  const total = r.precioUnitario === null ? null : multiplicarDecimal(String(r.precioUnitario), String(c.cantidad), 2)
  return { precio: total === null ? null : Number(total) / c.cantidad!, total: total === null ? null : Number(total),
    piezas, avisos: r.aviso ? [r.aviso] : [],
    motivos: [...motivos, ...(r.motor === 'anterior' ? ['via-anterior-sin-mediciones-historicas'] : [])] }
}
