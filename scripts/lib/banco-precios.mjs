/** Banco de evidencia: nunca convierte un histórico en una regla de valoración. */
export const numeroOrigen = value => {
  const text = String(value ?? '').trim()
  if (!text) return null
  const number = Number(text.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(number) ? number : null
}
const yes = value => ['True', 'true', '-1', '1'].includes(value)
const key = (...parts) => JSON.stringify(parts)
const agrupar = (rows, clave) => {
  const map = new Map()
  for (const row of rows) {
    const k = clave(row)
    map.set(k, [...(map.get(k) ?? []), row])
  }
  return map
}
const camposNumericos = ['Cdad', 'Ancho', 'Largo', 'LargoCorte', 'AnchoCorte',
  'CantidadCorte', 'AnguloI', 'AnguloD', 'Metraje', 'Precio', 'ImporteTotal', 'DescuentoPorc']
const camposCodigo = ['Articulo', 'Funcion', 'Acabado', 'Acabado2', 'TipoMetraje', 'Tarifa', 'TipoCorte']
function pieza(row) {
  return Object.fromEntries([
    ...camposCodigo.map(c => [c, String(row[c] ?? '').trim()]),
    ...camposNumericos.map(c => [c, numeroOrigen(row[c])]),
    ...['PVPManualSN', 'MetrajeManualSN', 'NoComputarVentaSN', 'RespetarPrecioSN']
      .map(c => [c, yes(row[c])]),
  ])
}

/** Proyecta campos técnicos permitidos; no conserva referencias, textos ni IDs de documentos. */
export function construirBanco(candidatas, lineas, configuraciones, opciones) {
  const codigos = new Set(candidatas.map(c => c.codigo))
  const config = agrupar(configuraciones.filter(c => c.TipoDoc === 'VPRES'), c => key(c.nVDoc, c.nVLinea))
  const opts = agrupar(opciones.filter(c => c.TipoDoc === 'VPRES'), c => key(c.nDoc, c.nLinEstr))
  const hijas = agrupar(lineas.filter(c => c.nEstr && c.nEstr !== '0'), c => key(c.nDoc, c.nEstr))
  const padres = lineas.filter(c => yes(c.EstructuraSN) && codigos.has(c.Articulo))
  const casos = padres.map((p, i) => {
    const k = key(p.nDoc, p.nLinea), configs = config.get(k) ?? [], cfg = configs[0]
    const componentes = (hijas.get(k) ?? []).map(pieza)
    const entrada = {
      estructura: p.Articulo, series: [1, 2, 3, 4].map(n => cfg?.[`Conjunto${n}`] ?? ''),
      anchoMm: numeroOrigen(p.Ancho), altoMm: numeroOrigen(p.Largo),
      cantidad: numeroOrigen(p.Cdad), acabado: p.Acabado, acabado2: p.Acabado2,
      opcionAcristalamientoOrigen: numeroOrigen(cfg?.nTAcris),
      opcionesHerraje: (opts.get(k) ?? []).map(o => ({ conjunto: o.Conjunto,
        opcion: o.nOpcion, seleccionada: yes(o.SelecSN) }))
        .sort((a, b) => key(a.conjunto, a.opcion).localeCompare(key(b.conjunto, b.opcion))),
      horasFabricacionExplicitas: numeroOrigen(cfg?.HorasAdFabr),
      horasColocacionExplicitas: numeroOrigen(cfg?.HorasColoc),
      tipoColocacion: cfg?.TipoColoc ?? '',
      vidrioCodigo: null,
      tarifaYFechaVerificadas: false,
      modoValoracionVerificado: null,
    }
    const motivos = ['vidrio-no-identificado', 'tarifa-y-vigencia-no-verificadas', 'modo-valoracion-no-confirmado']
    if (configs.length !== 1) motivos.push('configuracion-ausente-o-ambigua')
    if (!componentes.length) motivos.push('sin-despiece')
    if (!(entrada.anchoMm > 0 && entrada.altoMm > 0 && entrada.cantidad > 0)) motivos.push('medidas-o-cantidad-invalidas')
    if (yes(cfg?.DisEspecificoSN)) motivos.push('diseno-especifico-no-reconstruido')
    if (yes(p.PVPManualSN) || yes(p.RespetarPrecioSN)) motivos.push('precio-manual-o-respetado')
    if (entrada.horasFabricacionExplicitas > 0 || entrada.horasColocacionExplicitas > 0) motivos.push('ajustes-explicitos-de-mano-de-obra')
    // La tarifa de cabecera no se lee ni se presupone; una fila vacía no equivale a tarifa 1.
    if (componentes.some(c => !c.Tarifa)) motivos.push('tarifa-de-componente-no-explicita')
    if (componentes.some(c => c.PVPManualSN || c.MetrajeManualSN || c.RespetarPrecioSN)) motivos.push('componente-con-ajuste-manual')
    const total = numeroOrigen(p.ImporteTotal)
    const suma = componentes.length && componentes.every(c => c.ImporteTotal !== null)
      && entrada.cantidad !== null
      ? componentes.reduce((s, c) => s + c.ImporteTotal, 0) * entrada.cantidad : null
    return { id: `caso-${String(i + 1).padStart(4, '0')}`, entrada,
      historico: { padre: pieza(p), componentes,
        diferenciaPadreSumaHijas: suma !== null && total !== null ? total - suma : null },
      estado: 'pendiente-de-reproduccion', motivos }
  })
  const cobertura = candidatas.map(c => ({ codigo: c.codigo, familia: c.familia,
    casos: casos.filter(x => x.entrada.estructura === c.codigo).length }))
  const motivos = {}
  for (const c of casos) for (const m of c.motivos) motivos[m] = (motivos[m] ?? 0) + 1
  return { version: 1, nota: 'Evidencia histórica, no certificación de precios ni autorización de activación.',
    resumen: { candidatas: candidatas.length, conHistorico: cobertura.filter(c => c.casos).length,
      casos: casos.length, motivos, cobertura }, casos }
}

/** Comparación exacta de multiconjuntos; requiere misma entrada y valoración completa. */
export function compararCaso(caso, resultado) {
  const estable = value => {
    if (Array.isArray(value)) return value.map(estable)
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, estable(value[k])]))
    return value
  }
  const serializar = value => JSON.stringify(estable(value))
  if (serializar(caso.entrada) !== serializar(resultado.entrada)) return { estado: 'entrada-distinta' }
  if (caso.motivos.length || !caso.entrada.vidrioCodigo || !caso.entrada.tarifaYFechaVerificadas
    || !caso.entrada.modoValoracionVerificado) return { estado: 'no-comparable', motivos: caso.motivos,
      motivo: 'contexto-historico-pendiente-de-verificacion' }
  if (resultado.estado !== 'valorado') return { estado: 'no-comparable', motivo: 'valoracion-incompleta' }
  const firma = rows => rows.map(p => serializar(p)).sort()
  const despieceIgual = JSON.stringify(firma(caso.historico.componentes)) === JSON.stringify(firma(resultado.componentes ?? []))
  const esperado = caso.historico.padre.ImporteTotal
  if (esperado === null || !Number.isFinite(resultado.total)) return { estado: 'no-comparable', motivo: 'importe-ausente' }
  return { estado: 'comparado', despieceIgual, diferenciaTotal: resultado.total - esperado,
    precioIgualAlCentimo: Math.round(resultado.total * 100) === Math.round(esperado * 100),
    advertencia: 'Coincidencia de este caso; no demuestra reglas generales ni vigencia de tarifa.' }
}
