'use client'

import { useState } from 'react'
import type { FilaPvp } from '../../_lib/ficha/consulta.ts'
import { camposMetraje, type TipoMetraje } from '../../_lib/ficha/metraje.ts'
import s from './ficha-articulo.module.css'

const eur = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

export interface DatosGeneral {
  tipoMetraje: string
  metrajeMinimo: string | null
  metrajeMultiploLargo: string | null
  metrajeMultiploAncho: string | null
  pesoMl: string | null
}

const TIPOS: { valor: TipoMetraje; etiqueta: string }[] = [
  { valor: 'M2', etiqueta: 'M2' }, { valor: 'ML', etiqueta: 'ML' }, { valor: 'UD', etiqueta: 'Unidades' },
]

/**
 * Pestaña `General`: PVP por acabado y tarifa, peso y metraje. Los campos que
 * el tipo de metraje no usa quedan de solo lectura (no deshabilitados) para
 * que el valor guardado viaje en el envío y no se pierda.
 */
export function PestanaGeneral({
  datos, pvp, errores,
}: {
  datos: DatosGeneral
  pvp: FilaPvp[]
  errores: Record<string, string[]>
}) {
  const [tipo, setTipo] = useState<TipoMetraje>((datos.tipoMetraje as TipoMetraje) ?? 'ML')
  const [orden, setOrden] = useState<'acabado' | 'tarifa'>('acabado')
  const campos = camposMetraje(tipo)
  const filas = [...pvp].sort((a, b) => orden === 'tarifa'
    ? a.tarifa - b.tarifa || a.acabado.localeCompare(b.acabado)
    : a.acabado.localeCompare(b.acabado) || a.tarifa - b.tarifa)

  return (
    <div className={s.general}>
      <fieldset className={s.grupo}>
        <legend>PVP</legend>
        <div className={s.rejilla} tabIndex={0} aria-label="Precios de venta por acabado y tarifa">
          <table className="al-data-table">
            <thead><tr><th>Acabado</th><th>Descripción</th><th>Tarifa</th><th className="cifra">P.V.P.</th></tr></thead>
            <tbody>
              {filas.length === 0
                ? <tr><td colSpan={4} className={s.vacio}>Sin precios de venta</td></tr>
                : filas.map((f) => (
                  <tr key={`${f.acabado}-${f.tarifa}`}>
                    <td className={s.codigo}>{f.acabado}</td>
                    <td>{f.descripcion ?? ''}</td>
                    <td className="cifra" style={{ textAlign: 'left' }}>{f.tarifa}</td>
                    <td className="cifra">{eur.format(Number(f.precio))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className={s.orden} role="radiogroup" aria-label="Orden de los precios">
          <label><input type="radio" name="_ordenPvp" checked={orden === 'acabado'}
            onChange={() => setOrden('acabado')} /> Acabado</label>
          <label><input type="radio" name="_ordenPvp" checked={orden === 'tarifa'}
            onChange={() => setOrden('tarifa')} /> Tarifa</label>
        </div>
      </fieldset>

      <fieldset className={s.grupo}>
        <legend>Peso</legend>
        <div className={s.valores}>
          <label htmlFor="pesoMl">Peso</label>
          <input id="pesoMl" name="pesoMl" inputMode="decimal" defaultValue={datos.pesoMl ?? ''}
            aria-invalid={errores.pesoMl ? true : undefined} className={`${s.campo} cifra`} />
          <span>{campos.unidadPeso}</span>
        </div>
      </fieldset>

      <fieldset className={`${s.grupo} ${s.metraje}`}>
        <legend>Metraje</legend>
        <div className={s.radios} role="radiogroup" aria-label="Tipo de metraje">
          {TIPOS.map((t) => (
            <label key={t.valor}>
              <input type="radio" name="tipoMetraje" value={t.valor} checked={tipo === t.valor}
                onChange={() => setTipo(t.valor)} /> {t.etiqueta}
            </label>
          ))}
        </div>
        <div className={s.medidas}>
          <label htmlFor="metrajeMultiploAncho">Multiplo de</label>
          <input id="metrajeMultiploAncho" name="metrajeMultiploAncho" inputMode="decimal"
            readOnly={!campos.multiploAncho} defaultValue={datos.metrajeMultiploAncho ?? ''}
            aria-invalid={errores.metrajeMultiploAncho ? true : undefined} className={`${s.campo} cifra`} />
          <span>cm. ancho</span>
          <label htmlFor="metrajeMultiploLargo">Multiplo de</label>
          <input id="metrajeMultiploLargo" name="metrajeMultiploLargo" inputMode="decimal"
            readOnly={!campos.multiploLargo} defaultValue={datos.metrajeMultiploLargo ?? ''}
            aria-invalid={errores.metrajeMultiploLargo ? true : undefined} className={`${s.campo} cifra`} />
          <span>cm. largo</span>
          <label htmlFor="metrajeMinimo">Metraje Mínimo</label>
          <input id="metrajeMinimo" name="metrajeMinimo" inputMode="decimal"
            readOnly={!campos.metrajeMinimo} defaultValue={datos.metrajeMinimo ?? ''}
            aria-invalid={errores.metrajeMinimo ? true : undefined} className={`${s.campo} cifra`} />
          <span>{campos.unidadMinimo}</span>
        </div>
      </fieldset>
    </div>
  )
}
