/**
 * Documento PDF de un presupuesto (server-side, @react-pdf/renderer).
 *
 * PRESENTACIÓN PURA: no lee la BD ni valora. Recibe los datos YA valorados y
 * persistidos (los mismos que pinta la página de detalle) y los dibuja. La
 * regla del dinero (regla 3) se respeta aquí sin recalcular nada:
 *  - una línea con `valoracionCompleta = false` sale como "Sin valorar", nunca 0.
 *  - si el documento es `incompleto` (cualquier línea sin valorar), los totales
 *    salen como "Sin valorar" y se pinta el aviso "PRESUPUESTO INCOMPLETO".
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

/** Fila de línea, con exactamente lo que la web ya tiene persistido. */
export interface LineaPdf {
  orden: number
  tipo: string
  descripcion: string
  referencia: string | null
  anchoMm: number | null
  altoMm: number | null
  cantidad: string
  precioUnitario: string | null
  total: string | null
  valoracionCompleta: boolean
  avisoValoracion: string | null
}

export interface DatosPresupuestoPdf {
  numero: number
  revision: number
  fecha: string | null
  estado: string
  destinatario: string
  obra: string | null
  tarifa: number
  tipoIva: number
  baseImponible: number
  cuotaIva: number
  total: number
  /** Único criterio del dinero a nivel documento (core: presupuestoIncompleto). */
  incompleto: boolean
  lineas: LineaPdf[]
}

// Mismo formato que la web (Intl es-ES / EUR): garantiza que el PDF y la
// pantalla coincidan AL CÉNTIMO y con la misma tipografía de importe.
const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const fmtFecha = (f: string | null) => (f ? new Date(f).toLocaleDateString('es-ES') : '')

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  empresa: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  empresaSub: { fontSize: 8, color: '#666', marginTop: 2 },
  docTitulo: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  docMeta: { fontSize: 8, color: '#444', textAlign: 'right', marginTop: 2 },
  destinatario: { marginBottom: 12 },
  etiqueta: { fontSize: 7, color: '#888', textTransform: 'uppercase' },
  destNombre: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 1 },
  avisoIncompleto: { backgroundColor: '#fbeaea', borderWidth: 1, borderColor: '#c0392b',
    padding: 8, marginBottom: 12, borderRadius: 3 },
  avisoIncompletoTxt: { color: '#c0392b', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  avisoIncompletoSub: { color: '#a03024', fontSize: 7.5, marginTop: 2 },
  thead: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1,
    borderBottomColor: '#ccc', paddingVertical: 4 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0',
    paddingVertical: 4, alignItems: 'flex-start' },
  th: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#555', paddingHorizontal: 3 },
  td: { fontSize: 8.5, paddingHorizontal: 3 },
  cNum: { width: '5%' },
  cDesc: { width: '39%' },
  cUbi: { width: '13%' },
  cMed: { width: '13%' },
  cCant: { width: '7%', textAlign: 'right' },
  cPrecio: { width: '11%', textAlign: 'right' },
  cImporte: { width: '12%', textAlign: 'right' },
  sinValorar: { color: '#c0392b', fontFamily: 'Helvetica-Oblique' },
  aviso: { fontSize: 7, color: '#b8860b', marginTop: 1 },
  totales: { marginTop: 14, alignSelf: 'flex-end', width: '45%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalRowFinal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4,
    borderTopWidth: 1, borderTopColor: '#333', marginTop: 3 },
  totalLbl: { fontSize: 9, color: '#444' },
  totalVal: { fontSize: 9 },
  totalFinalLbl: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  totalFinalVal: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  pie: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 6.5,
    color: '#999', textAlign: 'center', borderTopWidth: 0.5, borderTopColor: '#ddd', paddingTop: 4 },
})

function Fila({ l }: { l: LineaPdf }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={[styles.td, styles.cNum]}>{l.orden}</Text>
      <View style={styles.cDesc}>
        <Text style={styles.td}>
          {l.tipo === 'ESTRUCTURA' ? '[EST] ' : ''}{l.descripcion}
        </Text>
        {l.valoracionCompleta && l.avisoValoracion && (
          <Text style={[styles.td, styles.aviso]}>{l.avisoValoracion}</Text>
        )}
      </View>
      <Text style={[styles.td, styles.cUbi]}>{l.referencia ?? '—'}</Text>
      <Text style={[styles.td, styles.cMed]}>
        {l.anchoMm && l.altoMm ? `${l.anchoMm} × ${l.altoMm}` : '—'}
      </Text>
      <Text style={[styles.td, styles.cCant]}>{Number(l.cantidad)}</Text>
      <Text style={[styles.td, styles.cPrecio]}>
        {l.valoracionCompleta && l.precioUnitario !== null
          ? eur.format(Number(l.precioUnitario))
          : <Text style={styles.sinValorar}>Sin valorar</Text>}
      </Text>
      <Text style={[styles.td, styles.cImporte]}>
        {l.valoracionCompleta && l.total !== null
          ? eur.format(Number(l.total))
          : <Text style={styles.sinValorar}>—</Text>}
      </Text>
    </View>
  )
}

export function PresupuestoPDF({ datos: d }: { datos: DatosPresupuestoPdf }) {
  const ref = d.revision > 0 ? `-${d.revision}` : ''
  return (
    <Document title={`Presupuesto ${d.numero}${ref}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.empresa}>ALUMINIOS LARA</Text>
            <Text style={styles.empresaSub}>Carpintería de aluminio y PVC</Text>
          </View>
          <View>
            <Text style={styles.docTitulo}>PRESUPUESTO Nº {d.numero}{ref}</Text>
            <Text style={styles.docMeta}>Fecha: {fmtFecha(d.fecha)}</Text>
            <Text style={styles.docMeta}>Estado: {d.estado} · Tarifa {d.tarifa}</Text>
          </View>
        </View>

        <View style={styles.destinatario}>
          <Text style={styles.etiqueta}>Destinatario</Text>
          <Text style={styles.destNombre}>{d.destinatario}</Text>
          {d.obra && <Text style={styles.docMeta}>Obra: {d.obra}</Text>}
        </View>

        {d.incompleto && (
          <View style={styles.avisoIncompleto}>
            <Text style={styles.avisoIncompletoTxt}>
              PRESUPUESTO INCOMPLETO — contiene líneas sin valorar
            </Text>
            <Text style={styles.avisoIncompletoSub}>
              El total mostrado no es un importe válido: faltan precios de una o más líneas.
            </Text>
          </View>
        )}

        <View style={styles.thead}>
          <Text style={[styles.th, styles.cNum]}>#</Text>
          <Text style={[styles.th, styles.cDesc]}>Descripción</Text>
          <Text style={[styles.th, styles.cUbi]}>Ubicación</Text>
          <Text style={[styles.th, styles.cMed]}>Medidas</Text>
          <Text style={[styles.th, styles.cCant]}>Cdad.</Text>
          <Text style={[styles.th, styles.cPrecio]}>Precio</Text>
          <Text style={[styles.th, styles.cImporte]}>Importe</Text>
        </View>

        {d.lineas.length === 0 ? (
          <View style={styles.row}>
            <Text style={styles.td}>Sin líneas.</Text>
          </View>
        ) : (
          d.lineas.map((l) => <Fila key={l.orden} l={l} />)
        )}

        <View style={styles.totales}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLbl}>Base imponible</Text>
            <Text style={styles.totalVal}>
              {d.incompleto ? 'Sin valorar' : eur.format(d.baseImponible)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLbl}>IVA {d.tipoIva}%</Text>
            <Text style={styles.totalVal}>
              {d.incompleto ? 'Sin valorar' : eur.format(d.cuotaIva)}
            </Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalFinalLbl}>Total</Text>
            <Text style={styles.totalFinalVal}>
              {d.incompleto ? 'Sin valorar' : eur.format(d.total)}
            </Text>
          </View>
        </View>

        <Text style={styles.pie} fixed>
          ALUMINIOS LARA · Presupuesto generado el {new Date().toLocaleDateString('es-ES')} ·
          Documento sin validez fiscal
        </Text>
      </Page>
    </Document>
  )
}

/** Elemento React del documento, para `renderToBuffer`/`renderToStream`. */
export function documentoPresupuesto(
  datos: DatosPresupuestoPdf,
): ReactElement<DocumentProps> {
  return <PresupuestoPDF datos={datos} /> as ReactElement<DocumentProps>
}
