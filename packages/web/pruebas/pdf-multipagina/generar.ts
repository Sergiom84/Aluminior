/** Desde raíz: npx tsx packages/web/pruebas/pdf-multipagina/generar.ts [directorio]. */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { renderToBuffer } from '@react-pdf/renderer'
import { medidasCerramiento } from '@aluminior/core/estructuras'
import { documentoPresupuesto } from '../../app/dashboard/presupuestos/[id]/pdf/documento'
import { eur } from '../../app/dashboard/presupuestos/[id]/pdf/formato'
import { casosPdfMultipagina, type CasoPdf } from './fixture'

function expectativas({ nombre, minPaginas, datos }: CasoPdf) {
  const textos = [datos.destinatario, datos.obra, datos.formaPago, datos.observaciones,
    ...datos.lineas.flatMap(l => [l.descripcion, l.referencia])].filter(Boolean).join(' ')
  const marcadores = textos.match(/\b(?:L\d{3}(?:INI|FIN)|[BNPHU]\d{3}|OBRAINI|OBRAFIN|PAGOINI|PAGOFIN|OBSINI|OBSFIN)\b/g) ?? []
  if (marcadores.length !== new Set(marcadores).size) throw new Error(`Marcadores repetidos: ${nombre}`)
  const importe = (valor: number) => datos.incompleto ? 'Sin valorar' : eur.format(valor)
  return {
    nombre, archivo: `${nombre}.pdf`, minPaginas, marcadores,
    referencia: `${datos.serie} ${datos.numero} · Revisión ${datos.revision}`,
    totales: { base: importe(datos.baseImponible), iva: importe(datos.cuotaIva), total: importe(datos.total) },
    sumaConocida: datos.baseImponible,
    incompleto: datos.incompleto,
    lineas: datos.lineas.map(l => ({ orden: l.orden,
      inicio: `L${String(l.orden).padStart(3, '0')}INI`, fin: `L${String(l.orden).padStart(3, '0')}FIN`,
      completa: l.valoracionCompleta,
      precio: l.valoracionCompleta && l.precioUnitario !== null ? eur.format(Number(l.precioUnitario)) : 'Sin valorar',
      importe: l.valoracionCompleta && l.total !== null ? eur.format(Number(l.total)) : 'Sin valorar',
    })),
    dibujos: datos.lineas.flatMap(l => {
      if (!l.cerramiento) return []
      const medidas = medidasCerramiento(l.cerramiento.configuracion)
      return [{ orden: l.orden, medidas: `${medidas.anchoMm} × ${medidas.altoMm} mm`,
        modulos: l.cerramiento.configuracion.modulos.length,
        uniones: l.cerramiento.configuracion.uniones.length,
        manoObra: l.cerramiento.manoObra.map(m =>
          `${m.concepto === 'COLOCACION' ? 'Colocación' : 'Fabricación'} ` +
          `${m.horas === null ? '—' : Number(m.horas)} h total línea: ` +
          (m.valoracionCompleta && m.importe !== null ? eur.format(Number(m.importe)) : 'Sin valorar')),
      }]
    }),
  }
}

const directorio = resolve(process.argv[2] ?? 'output/pdf/p2')
await mkdir(directorio, { recursive: true })
const casos = []
for (const caso of casosPdfMultipagina()) {
  const esperado = expectativas(caso)
  const buffer = await renderToBuffer(documentoPresupuesto(caso.datos))
  await writeFile(resolve(directorio, esperado.archivo), buffer)
  await writeFile(resolve(directorio, `${caso.nombre}.json`), JSON.stringify(caso.datos, null, 2) + '\n')
  casos.push({ ...esperado, bytes: buffer.length })
  console.log(`${caso.nombre}: ${buffer.length} bytes`)
}
await writeFile(resolve(directorio, 'manifest.json'), JSON.stringify({ version: 1, casos }, null, 2) + '\n')
console.log(`Manifiesto: ${resolve(directorio, 'manifest.json')}`)
