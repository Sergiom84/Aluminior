import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { styles } from './estilos'
import { TextoPdf } from './texto'

export function CondicionesPdf({ formaPago, observaciones }: {
  formaPago: string | null; observaciones: string | null
}) {
  return <View style={{ marginTop: formaPago || observaciones ? 14 : 0 }}>
    {formaPago && <View style={{ marginBottom: 8 }}>
      <Text style={styles.etiqueta} minPresenceAhead={14}>Forma de pago</Text>
      <TextoPdf style={{ fontSize: 9, marginTop: 3 }} orphans={2} widows={2}>{formaPago}</TextoPdf>
    </View>}
    {observaciones && <View>
      <Text style={styles.etiqueta} minPresenceAhead={14}>Observaciones</Text>
      <TextoPdf style={{ fontSize: 9, marginTop: 3 }} orphans={2} widows={2}>{observaciones}</TextoPdf>
    </View>}
  </View>
}
