import type { FilaCoste } from '../../_lib/ficha/consulta.ts'
import s from './ficha-articulo.module.css'

const eur = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

/** Pestaña `Coste > Coste`: coste por proveedor y acabado. */
export function PestanaCoste({ costes }: { costes: FilaCoste[] }) {
  return (
    <div className={s.rejilla} tabIndex={0} aria-label="Costes por proveedor y acabado">
      <table className="al-data-table">
        <thead><tr>
          <th>Proveedor</th><th>Nombre</th><th>Acabado</th><th>Descripción</th>
          <th className="cifra">Coste</th><th>Actualización</th>
        </tr></thead>
        <tbody>
          {costes.length === 0
            ? <tr><td colSpan={6} className={s.vacio}>Sin costes de proveedor</td></tr>
            : costes.map((c) => (
              <tr key={`${c.proveedor}-${c.acabado}`}>
                <td className={s.codigo}>{c.proveedor}</td>
                <td>{c.nombre ?? ''}</td>
                <td className={s.codigo}>{c.acabado}</td>
                <td>{c.descripcion ?? ''}</td>
                <td className="cifra">{eur.format(Number(c.coste))}</td>
                <td className="cifra" style={{ textAlign: 'left' }}>
                  {c.actualizadoEn ?? ''}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
