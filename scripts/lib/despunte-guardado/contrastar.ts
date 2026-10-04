/** Contrasta resultados almacenados; no calcula barras ni valora presupuestos. */
import { compararDecimal, multiplicarDecimal, normalizarDecimal, restarDecimal,
  sumarDecimal } from '@aluminior/core/precios'
import { agrupar, texto, type Fila, type Tablas } from '../banco-contraste/datos.ts'

type Estado = 'coincide' | 'difiere' | 'sin contraste'
function decimal(v: unknown): string | null {
  if (typeof v !== 'string' && typeof v !== 'number') return null
  if (typeof v === 'number' && !Number.isFinite(v)) return null
  const s = String(v).trim()
  // La frontera de Access ya contiene doubles: se conserva su representación,
  // sin inventar precisión ni sustituir vacío/NaN/exponente por cero.
  return /^[+-]?\d+(\.\d+)?$/.test(s) ? s : null
}
function sumar(valores: string[], porFila: boolean) {
  const escala = porFila ? 2 : Math.max(2, ...valores.map(v => v.split('.')[1]?.length ?? 0))
  return valores.reduce((s, v) => sumarDecimal(s, porFila ? normalizarDecimal(v, 2) : v, escala), '0')
}
const noNegativo = (s: string) => compararDecimal(s, '0') < 0 ? '0.00' : normalizarDecimal(s, 2)
const estado = (a: string | null, b: string | null): Estado =>
  a === null || b === null ? 'sin contraste' : compararDecimal(a, b) === 0 ? 'coincide' : 'difiere'

export function contrastarDocumento(cabecera: Fila, filas: Fila[]) {
  if (filas.some(f => texto(f.TipoDoc) !== 'VPRES' || texto(f.nDoc) !== texto(cabecera.Id)))
    throw new Error('El detalle pertenece a otro documento')
  const perfiles = filas.filter(f => f.Tipo_Perfiles_Barras === 'Perfiles')
  const barras = filas.filter(f => f.Tipo_Perfiles_Barras === 'Barras')
  const causas: string[] = []
  if (!filas.length) causas.push('detalle-ausente')
  else if (!perfiles.length || !barras.length) causas.push('detalle-sin-ambas-modalidades')
  if (perfiles.length + barras.length !== filas.length) causas.push('modalidad-desconocida')
  const valores = (fs: Fila[], campo: string) => fs.map(f => decimal(f[campo]))
  const cp = valores(perfiles, 'CostePerfiles'), cb = valores(barras, 'CosteBarras')
  if ([...cp, ...cb].some(v => v === null)) causas.push('coste-ausente-o-invalido')
  if ([...cp, ...cb].some(v => v !== null && compararDecimal(v, '0') < 0)) causas.push('coste-negativo')
  const importe = decimal(cabecera.Despunte)
  if (importe === null || compararDecimal(importe, '0') < 0) causas.push('cabecera-ausente-o-invalida')
  const observado = importe === null ? null : normalizarDecimal(importe, 2)
  const completo = !causas.length
  const costePerfiles = completo ? sumar(cp as string[], false) : null
  const costeBarras = completo ? sumar(cb as string[], false) : null
  const escala = Math.max(costePerfiles?.split('.')[1]?.length ?? 0, costeBarras?.split('.')[1]?.length ?? 0, 2)
  const diferencia = completo ? restarDecimal(costeBarras!, costePerfiles!, escala) : null
  const final = diferencia === null ? null : noNegativo(diferencia)
  const porFila = completo ? noNegativo(restarDecimal(sumar(cb as string[], true), sumar(cp as string[], true), 2)) : null
  const base = decimal(cabecera.DespunteBase), porc = decimal(cabecera.DespuntePorc)
  const basePorcentaje = base === null || porc === null ? null : multiplicarDecimal(multiplicarDecimal(base, porc, escala + 4), '0.01', 2)
  return { id: texto(cabecera.Id), filas: filas.length, perfiles: perfiles.length, barras: barras.length,
    observado, costePerfiles, costeBarras, diferencia, final, porFila, causas,
    redondeoFinal: estado(final, observado), redondeoPorFila: estado(porFila, observado),
    discriminaRedondeo: final !== null && porFila !== null && final !== porFila,
    base, porcentaje: porc, basePorcentaje: estado(basePorcentaje, observado),
    basePorcentajeInoperante: observado !== null && compararDecimal(observado, '0') > 0 &&
      base !== null && porc !== null && compararDecimal(base, '0') === 0 && compararDecimal(porc, '0') === 0 }
}

export function contrastarDespunteGuardado(tablas: Tablas) {
  const cabeceras = tablas.VPresupuestos, detalle = tablas.VDespunteDetalle
  if (!cabeceras || !detalle) throw new Error('Faltan tablas de cabecera o detalle de despunte')
  const docs = agrupar(cabeceras, f => texto(f.Id))
  if (docs.has('') || [...docs.values()].some(fs => fs.length !== 1)) throw new Error('Cabecera Id ausente o duplicada')
  const filas = detalle.filter(f => texto(f.TipoDoc) === 'VPRES')
  const claves = agrupar(filas, f => texto(f.nLinea))
  if (claves.has('') || [...claves.values()].some(fs => fs.length !== 1)) throw new Error('Detalle nLinea ausente o duplicada')
  const porDoc = agrupar(filas, f => texto(f.nDoc))
  const documentos = cabeceras.map(h => contrastarDocumento(h, porDoc.get(texto(h.Id)) ?? []))
  const positivos = documentos.filter(d => d.observado !== null && compararDecimal(d.observado, '0') > 0)
  const conDetalle = documentos.filter(d => d.filas > 0)
  return { documentos, resumen: {
    cabeceras: cabeceras.length, filasDetalle: detalle.length, filasOtrosDocumentos: detalle.length - filas.length,
    filasHuerfanas: filas.filter(f => !docs.has(texto(f.nDoc))).length,
    documentosConDetalle: conDetalle.length, documentosConDespuntePositivo: positivos.length,
    positivosSinDetalle: positivos.filter(d => !d.filas).length,
    positivosConRestaCoincidente: positivos.filter(d => d.redondeoFinal === 'coincide').length,
    positivosBasePorcentajeInoperante: positivos.filter(d => d.basePorcentajeInoperante).length,
    conDetalleRestaCoincidente: conDetalle.filter(d => d.redondeoFinal === 'coincide').length,
    conDetalleRestaDiferente: conDetalle.filter(d => d.redondeoFinal === 'difiere').length,
    conDetalleSinContraste: conDetalle.filter(d => d.redondeoFinal === 'sin contraste').length,
    redondeoDiscriminante: documentos.filter(d => d.discriminaRedondeo).length,
    negativosAntesDelLimite: documentos.filter(d => d.diferencia !== null && compararDecimal(d.diferencia, '0') < 0).length,
  } }
}
