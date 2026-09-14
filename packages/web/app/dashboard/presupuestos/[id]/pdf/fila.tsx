import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { DibujoCerramientoPdf } from './dibujo-cerramiento'
import { styles } from './estilos'
import { eur } from './formato'
import type { LineaPdf } from './tipos'
import { TextoPdf } from './texto'

/** La descripción puede cruzar página; únicamente el dibujo es indivisible. */
export function FilaPdf({ l }: { l: LineaPdf }) {
  return <View>
    <View style={styles.row} minPresenceAhead={24}>
      <Text style={[styles.td, styles.cNum]}>{l.orden}</Text>
      <View style={styles.cDesc}>
        <TextoPdf style={styles.td} orphans={2} widows={2}>
          {l.tipo === 'ESTRUCTURA' ? '[EST] ' : ''}{l.descripcion}
        </TextoPdf>
        {l.avisoValoracion && <TextoPdf style={[styles.td, styles.aviso]}>{l.avisoValoracion}</TextoPdf>}
      </View>
      <TextoPdf style={[styles.td, styles.cUbi]}>{l.referencia ?? '—'}</TextoPdf>
      <Text style={[styles.td, styles.cMed]}>
        {l.anchoMm !== null && l.altoMm !== null ? `${l.anchoMm} × ${l.altoMm}` : '—'}
      </Text>
      <Text style={[styles.td, styles.cCant]}>{Number(l.cantidad)}</Text>
      <View style={styles.cPrecio}>
        <Text style={styles.td}>{l.valoracionCompleta && l.precioUnitario !== null
          ? eur.format(Number(l.precioUnitario)) : 'Sin valorar'}</Text>
        {l.cerramiento?.estadoSnapshot === 'con-snapshot' &&
          <Text style={{ fontSize: 6.5, textAlign: 'right' }}>Material / ud.</Text>}
      </View>
      <Text style={[styles.td, styles.cImporte]}>
        {l.valoracionCompleta && l.total !== null ? eur.format(Number(l.total)) : 'Sin valorar'}
      </Text>
    </View>
    {l.cerramiento && <View style={{ paddingVertical: 6 }}>
      <Text style={{ fontSize: 7, marginBottom: 3 }} minPresenceAhead={150}>Línea {l.orden}</Text>
      <DibujoCerramientoPdf configuracion={l.cerramiento.configuracion} />
      {l.cerramiento.manoObra.map(m => <Text key={m.concepto} style={{ fontSize: 8, marginTop: 3 }}>
        {m.concepto === 'COLOCACION' ? 'Colocación' : 'Fabricación'} {m.horas === null ? '—' : Number(m.horas)} h
        {l.cerramiento?.estadoSnapshot === 'con-snapshot' ? ' total línea: ' : ': '}
        {m.valoracionCompleta && m.importe !== null ? eur.format(Number(m.importe)) : 'Sin valorar'}
      </Text>)}
    </View>}
  </View>
}
