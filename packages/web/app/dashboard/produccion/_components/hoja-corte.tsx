import type { PreparacionProduccion } from '../_lib/preparar-produccion'
import { angulo, medida, numero, Tabla } from './formato'

export function HojaCorteVista({ resultado: r }: { resultado: PreparacionProduccion }) {
  if (!r.corte) return null
  const consumoPorRef = new Map(r.consumos.map(c => [JSON.stringify(c.referencia), c]))
  return <section aria-labelledby="hoja-corte" className="space-y-4">
    <h2 id="hoja-corte" className="text-xl font-semibold">Hoja de corte</h2>
    <p className="text-sm">FFD · barra única · {r.corte.referencia}</p>
    <Tabla titulo="Resumen de barras" cabeceras={['Artículo', 'Acabado', 'Barra', 'Barras', 'Comprado (m)', 'Aprovechamiento']}>
      {r.corte.resumen.map(g => <tr key={JSON.stringify([g.articuloCodigo, g.acabadoCodigo])}>
        <td>{g.articuloCodigo}</td><td>{g.acabadoCodigo ?? 'Sin acabado'}</td><td className="cifra">{medida(g.longitudBarraMm)}</td>
        <td className="cifra">{g.nBarras}</td><td className="cifra">{numero(g.metros)}</td>
        <td className="cifra">{g.porcentajeOptimizacion === null ? g.motivoSinOptimizacion : `${numero(g.porcentajeOptimizacion)} %`}</td>
      </tr>)}
    </Tabla>
    {r.planes.length === 0 && <p>Sin artículos marcados para corte en barra.</p>}
    {r.planes.map(g => <div key={JSON.stringify([g.articuloCodigo, g.acabadoCodigo])} className="space-y-3">
      <h3 className="font-medium">{g.articuloCodigo} · {g.acabadoCodigo ?? 'Sin acabado'}</h3>
      {g.plan.barras.map((b, i) => <Tabla key={i} titulo={`${g.articuloCodigo} · barra ${i + 1} · retal ${medida(b.sobrante)}`}
        cabeceras={['Origen y pieza', 'Corte', 'Ángulo izquierdo', 'Ángulo derecho', 'Posición']}>
        {b.cortes.map((c, j) => {
          const pieza = c.ref ? consumoPorRef.get(c.ref) : undefined
          return <tr key={j}><td>{pieza?.etiqueta ?? 'Origen desconocido'}</td><td className="cifra">{medida(c.longitud)}</td>
            <td>{angulo(pieza?.anguloIzquierdo ?? null)}</td><td>{angulo(pieza?.anguloDerecho ?? null)}</td><td>{pieza?.posicion ?? 'Desconocida'}</td></tr>
        })}
      </Tabla>)}
    </div>)}
  </section>
}
