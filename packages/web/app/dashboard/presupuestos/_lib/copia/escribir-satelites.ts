import { schema } from '@aluminior/db'
import type { ClienteEscritura } from '../cliente-db.ts'
import { persistirResultadoCerramiento } from '../cerramientos/resultado-persistido.ts'
import type { LineaConSatelites } from './leer-origen.ts'
import type { CambioLinea } from './plan-copia.ts'

export async function escribirSatelites(
  cliente: ClienteEscritura,
  entrada: LineaConSatelites,
  cambio: CambioLinea,
  lineaId: string,
) {
  if (entrada.cerramiento) {
    const { lineaId: _linea, ...resto } = entrada.cerramiento
    await cliente.insert(schema.lineasCerramiento).values({
      ...resto,
      lineaId,
      serieCodigo: cambio.codigos.serie,
      vidrioCodigo: cambio.codigos.vidrio,
    })
  }
  if (entrada.resultadoCerramiento) await persistirResultadoCerramiento(cliente, lineaId, entrada.resultadoCerramiento)
  if (entrada.estructura) {
    const { lineaId: _linea, ...resto } = entrada.estructura
    await cliente.insert(schema.lineasEstructura).values({
      ...resto,
      lineaId,
      serieCodigo: cambio.codigos.serie ?? entrada.estructura.serieCodigo,
      accesoriosAcabado: cambio.codigos.acabadoAccesorios,
      maderaCodigo: cambio.codigos.acabadoMadera,
    })
  }
  if (entrada.acristalamiento.length) {
    const cambiaVidrio = cambio.sustituciones.some((sustitucion) => sustitucion.ambito === 'VIDRIO')
    await cliente.insert(schema.lineasAcristalamiento).values(
      entrada.acristalamiento.map(({ lineaId: _linea, ...ranura }) => ({
        ...ranura,
        lineaId,
        vidrioHojas: cambiaVidrio && ranura.vidrioHojas ? cambio.codigos.vidrio : ranura.vidrioHojas,
        vidrioFijos: cambiaVidrio && ranura.vidrioFijos ? cambio.codigos.vidrio : ranura.vidrioFijos,
      })),
    )
  }
  // Detalle de estructuras «Copiar actual»: el despiece, las opciones de
  // herraje y la mano de obra viajan tal cual. Si la línea cambió de código,
  // el plan ya lo ha dicho y la línea va sin precio.
  if (entrada.despiece.length) {
    await cliente.insert(schema.lineasDespiece).values(
      entrada.despiece.map(({ id: _id, lineaId: _linea, ...pieza }) => ({ ...pieza, lineaId })),
    )
  }
  if (entrada.opcionesHerraje.length) {
    await cliente.insert(schema.lineasOpcionesHerraje).values(
      entrada.opcionesHerraje.map(({ lineaId: _linea, ...opcion }) => ({ ...opcion, lineaId })),
    )
  }
  if (entrada.manoObra.length) {
    await cliente.insert(schema.lineasManoObra).values(
      entrada.manoObra.map(({ id: _id, lineaId: _linea, ...concepto }) => ({ ...concepto, lineaId })),
    )
  }
}

