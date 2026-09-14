import type { PreparacionProduccion } from '../_lib/preparar-produccion'
import { angulo, medida, numero, Tabla } from './formato'

const clases = { BARRA: 'Perfil de barra', CONSUMO_ML: 'Consumo lineal', SUPERFICIE: 'Superficie', ACCESORIO: 'Accesorio' }
export function HojaProduccionVista({ resultado: r }: { resultado: PreparacionProduccion }) {
  if (!r.produccion) return null
  return <section aria-labelledby="hoja-produccion" className="space-y-4">
    <h2 id="hoja-produccion" className="text-xl font-semibold">Hoja de producción</h2>
    <Tabla titulo="Composición del documento" cabeceras={['Origen', 'Cantidad comercial', 'Medidas de marco']}>
      {r.produccion.estructuras.map(e => <tr key={e.indice}><td>{e.referencia}</td><td className="cifra">{numero(e.cantidad)}</td>
        <td className="cifra">{e.medidasMarco ? `${numero(e.medidasMarco.anchoMm)} × ${numero(e.medidasMarco.altoMm)} mm` : 'Sin medidas'}</td></tr>)}
    </Tabla>
    <Tabla titulo="Materiales · cantidades totales de línea" cabeceras={['Origen y pieza', 'Artículo', 'Acabado', 'Clase', 'Piezas totales', 'Largo', 'Ancho', 'Consumo total', 'Ángulos I / D', 'Hoja despiece']}>
      {r.produccion.consumos.map(c => <tr key={JSON.stringify(c.referencia)}>
        <td>{c.etiqueta}</td><td>{c.articuloCodigo}</td><td>{c.acabadoCodigo ?? 'Sin acabado'}</td><td>{clases[c.clase]}</td>
        <td className="cifra">{numero(c.cantidadFisica)}</td><td className="cifra">{c.largoMm === null ? '—' : medida(c.largoMm)}</td>
        <td className="cifra">{c.anchoMm === null ? '—' : medida(c.anchoMm)}</td>
        <td className="cifra whitespace-nowrap">{numero(c.cantidad)} {c.unidad}</td><td>{angulo(c.anguloIzquierdo)} / {angulo(c.anguloDerecho)}</td>
        <td>{c.apareceEnHojaDespiece ? 'Sí' : 'No'}</td>
      </tr>)}
    </Tabla>
  </section>
}
