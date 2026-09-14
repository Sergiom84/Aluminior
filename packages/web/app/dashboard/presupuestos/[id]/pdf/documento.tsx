/** Presentación pura de la revisión persistida; no valora ni consulta. */
import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { DatosPresupuestoPdf } from './tipos'
export type { DatosPresupuestoPdf, LineaPdf } from './tipos'
import { styles } from './estilos'
import { FilaPdf } from './fila'
import { CondicionesPdf } from './condiciones'
import { eur, fmtFecha } from './formato'
import { TextoPdf } from './texto'
import { referenciaPresupuesto } from '../../_lib/identidad-documento'

export function PresupuestoPDF({ datos: d }: { datos: DatosPresupuestoPdf }) {
  const ref = referenciaPresupuesto(d.numero, d.revision)
  return (
    <Document title={`Presupuesto ${d.serie} ${ref}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.empresa}>ALUMINIOS LARA</Text>
            <Text style={styles.empresaSub}>Carpintería de aluminio y PVC</Text>
          </View>
          <View>
            <Text style={styles.docTitulo}>PRESUPUESTO Nº {d.numero}</Text>
            <Text style={styles.docMeta}>Serie {d.serie} · Revisión {d.revision}</Text>
            <Text style={styles.docMeta}>Fecha: {fmtFecha(d.fecha)}</Text>
            <Text style={styles.docMeta}>Estado: {d.estado} · Tarifa {d.tarifa}</Text>
          </View>
        </View>

        <View style={styles.destinatario}>
          <Text style={styles.etiqueta}>Destinatario</Text>
          <TextoPdf style={styles.destNombre}>{d.destinatario}</TextoPdf>
          {d.obra && <TextoPdf style={styles.docMeta}>Obra: {d.obra}</TextoPdf>}
        </View>

        {d.incompleto && (
          <View style={styles.avisoIncompleto}>
            <Text style={styles.avisoIncompletoTxt}>
              PRESUPUESTO INCOMPLETO — contiene líneas sin valorar
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
          d.lineas.map((l) => <FilaPdf key={l.id} l={l} />)
        )}

        <View style={styles.totales} wrap={false}>
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

        <CondicionesPdf formaPago={d.formaPago} observaciones={d.observaciones} />

        <Text style={styles.pie} fixed render={({ pageNumber, totalPages }) =>
          `ALUMINIOS LARA · ${d.serie} ${ref} · Página ${pageNumber}/${totalPages} · Documento sin validez fiscal`} />
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
