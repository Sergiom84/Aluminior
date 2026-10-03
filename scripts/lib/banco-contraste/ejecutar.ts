import { execFileSync } from 'node:child_process'
import { asegurarCatalogoDiseno, type ClienteEscritura } from '@aluminior/web/banco-contraste'
import { ejecutarServicio } from './servicio-web.ts'
import { clasificar, diagnosticar, causasAviso, precioComparable } from './comparar.ts'
import { numero, texto, type Caso, type Tablas, type Medicion, type Fila } from './datos.ts'
import { resumir } from './resumen.ts'

export async function ejecutarBanco(db: ClienteEscritura, banco: { casos: Caso[]; elementos: Caso[]; evidencia: unknown }, t: Tablas) {
  await asegurarCatalogoDiseno(db)
  const precios = new Map<string, Fila[]>()
  for (const f of t.ArticulosPVP!) {
    const k = `${texto(f.Articulo)}|${numero(f.Tarifa)}|${texto(f.Acabado)}`, a = precios.get(k) ?? []
    a.push(f); precios.set(k, a)
  }
  function posterior(c: Caso, ps: Medicion['piezas']): boolean | null {
    const filas = ps.flatMap(p => precios.get(`${p.articulo}|${c.tarifa}|${p.acabado}`) ?? [])
    if (!filas.length || !c.fecha) return null
    if (filas.some(f => texto(f.UltimaAct) > c.fecha)) return true
    return filas.every(f => !!texto(f.UltimaAct)) ? false : null
  }
  const mediciones: Medicion[] = [], detalles: unknown[] = []
  async function medir(c: Caso) {
    if (c.exclusiones.length) return
    try {
      const r = await ejecutarServicio(db, c)
      const comparacion = r.piezas.length ? diagnosticar(c.piezas, r.piezas) : { causas: [], detalles: [] }
      // Una relación no representada no puede producir un acierto.
      const precio = precioComparable(r.precio, r.motivos)
      const estado = clasificar(c.esperado!, precio)
      const causas = [...new Set([...r.motivos, ...(r.precio === null ? causasAviso(r.avisos) : []), ...comparacion.causas])]
      const sumaHistorica = c.piezas.every(p => p.importe !== null) ? c.piezas.reduce((s, p) => s + p.importe!, 0) : null
      if (sumaHistorica !== null && Math.abs(sumaHistorica - c.esperado!) > .01 + 1e-6) causas.push('total-padre-no-reconciliado')
      if (estado === 'distinto' && !causas.length) causas.push('redondeo-o-regla-de-total-pendiente')
      const m: Medicion = { id: c.id, tipo: c.tipo, modelo: c.modelo, fecha: c.fecha, estado,
        esperado: c.esperado!, obtenido: precio, diferencia: precio === null ? null : precio - c.esperado!,
        causas, avisos: r.avisos, piezas: r.piezas, tarifaPosterior: posterior(c, r.piezas) }
      mediciones.push(m)
      detalles.push({ id: c.id, totalEsperado: c.totalEsperado, totalObtenido: r.total,
        precioDiagnostico: r.precio, sumaHistorica, piezas: comparacion.detalles })
    } catch (error) {
      mediciones.push({ id: c.id, tipo: c.tipo, modelo: c.modelo, fecha: c.fecha, estado: 'error',
        esperado: c.esperado!, obtenido: null, diferencia: null, causas: ['error-del-servicio'],
        avisos: [error instanceof Error ? error.message : 'Error desconocido'], piezas: [], tarifaPosterior: null })
    }
  }
  for (let i = 0; i < banco.casos.length; i++) {
    await medir(banco.casos[i]!)
    if ((i + 1) % 100 === 0) console.log(`Medidas ${i + 1}/${banco.casos.length} candidatas; sin escrituras`)
  }
  const resumen = resumir(banco.casos, mediciones)
  return { version: 1, ejecutado: new Date().toISOString(), revisionGit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), evidencia: banco.evidencia,
    resumen, mediciones, detalles, servicio: 'valorarEstructura / valorarCerramiento + prepararManoObra; core decimal',
    motorSinCambios: true }
}
