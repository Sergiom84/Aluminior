import { esResultadoCerramiento, medidasCerramiento } from '@aluminior/core/estructuras'
import { compararDecimal } from '@aluminior/core/precios'
import type { DatosProduccion, IncidenciaProduccion, PiezaProduccionValidada } from './tipos.ts'
import { etiquetaLineaProduccion } from './identidad-linea'

const canonico = (v: unknown): string => JSON.stringify(v, (_k, x) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x)
const decimalIgual = (a: string | null, b: string | null) =>
  a === null || b === null ? a === b : compararDecimal(a, b) === 0

/** No recompone material: exige igualdad entre foto validada y despiece persistido. */
export function verificarDespiece(datos: DatosProduccion) {
  const incidencias: IncidenciaProduccion[] = []
  const piezas: PiezaProduccionValidada[] = []
  if (!datos.lineas.length) incidencias.push({ referencia: datos.id, detalle: 'Documento sin líneas de producción', bloqueante: true })
  for (const linea of datos.lineas) {
    const etiquetaLinea = etiquetaLineaProduccion(linea)
    const anotar = (detalle: string) => incidencias.push({ referencia: etiquetaLinea, detalle, bloqueante: true })
    if (linea.tipo !== 'CERRAMIENTO') { anotar('Línea sin snapshot de fabricación soportado'); continue }
    const r = linea.resultado
    if (!esResultadoCerramiento(r) || linea.versionResultado !== r.version) { anotar('Snapshot ausente o no válido'); continue }
    if (linea.versionConfiguracion !== r.configuracion.version) { anotar('Versión de configuración no válida'); continue }
    if (canonico(linea.configuracion) !== canonico(r.configuracion)) { anotar('Configuración distinta del snapshot'); continue }
    const medidas = medidasCerramiento(r.configuracion)
    if (linea.anchoMm !== medidas.anchoMm || linea.altoMm !== medidas.altoMm) { anotar('Dimensiones de línea distintas del snapshot'); continue }
    const esperado = r.origenes.flatMap(o => o.piezas.map(p => ({ o, p })))
    for (const o of r.origenes) {
      if (!o.piezas.length || !o.reglaMaterial || o.diagnosticos.some(d => d.bloqueante && d.ambito === 'FABRICACION'))
        anotar(`Material incompleto: ${o.origen.id}`)
    }
    if (linea.piezas.length !== esperado.length) { anotar('Despiece con filas ausentes o sobrantes'); continue }
    const claves = new Set<string>()
    for (const fila of linea.piezas) {
      const clave = JSON.stringify([fila.origenTipo, fila.origenId, fila.origenOrdinal])
      if (claves.has(clave)) { anotar('Procedencia duplicada'); continue }
      claves.add(clave)
      const elemento = esperado.find(({ o, p }) => o.origen.tipo === fila.origenTipo && o.origen.id === fila.origenId && p.ordinal === fila.origenOrdinal)
      if (!elemento) { anotar('Fila relacional ajena al snapshot'); continue }
      const { o, p } = elemento
      const textoCoincide = fila.lineaId === linea.id && fila.articuloCodigo === p.articuloCodigo &&
        fila.acabadoCodigo === p.acabadoCodigo && fila.funcion === p.funcion && fila.posicionTrabajo === p.posicionTrabajo
      const campos = ['cantidad', 'largoCorteMm', 'anchoCorteMm', 'anguloIzquierdo', 'anguloDerecho', 'costeUnitario', 'costeTotal'] as const
      if (!textoCoincide || !campos.every(c => decimalIgual(fila[c], p[c]))) { anotar(`Despiece discordante: ${o.origen.id}/${p.ordinal}`); continue }
      if (o.diagnosticos.some(d => d.bloqueante && d.ambito === 'FABRICACION') || !o.reglaMaterial) { anotar(`Material incompleto: ${o.origen.id}`); continue }
      const modulo = r.configuracion.modulos.find(m => m.id === o.origen.id)
      const union = r.configuracion.uniones.find(u => u.id === o.origen.id)
      piezas.push({ referencia: { documentoId: datos.id, lineaId: linea.id, tipoOrigen: o.origen.tipo,
        origenId: o.origen.id, ordinal: p.ordinal }, etiqueta: `${etiquetaLinea} · ${o.origen.tipo.toLowerCase()} ${o.origen.id} · pieza ${p.ordinal}`,
      pieza: p, cantidadLinea: linea.cantidad, descripcionLinea: linea.descripcion, referenciaLinea: etiquetaLinea,
      anchoMm: modulo?.anchoMm ?? union!.grosorMm, altoMm: modulo?.altoMm ?? union!.longitudMm })
    }
  }
  return { piezas, incidencias }
}
