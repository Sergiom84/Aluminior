'use client'

import { atributosCampo, bordeCampo } from '../../_lib/campos.ts'
import { MensajeError } from './mensaje-error.tsx'
import styles from '../presupuesto-movil.module.css'

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

export function acabadoPorDefecto(acabados: { codigo: string }[]): string {
  return acabados.some((item) => item.codigo === 'L') ? 'L' : ''
}

export function CamposCerramiento({
  err, series, acabados, serie, setSerie,
}: {
  err: Record<string, string[] | undefined>
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
  serie: string
  setSerie: (valor: string) => void
}) {
  return (
    <div className={styles.fields}>
      <div className="col-span-2">
        <label htmlFor="referencia">Ubicación</label>
        <input {...atributosCampo('referencia', err)} className={entrada}
          style={{ ...estilo, borderColor: bordeCampo('referencia', err, estilo.borderColor) }}
          placeholder="SALÓN" />
        <MensajeError campo="referencia" errores={err} />
      </div>
      <div className="col-span-2">
        <label htmlFor="serieCodigo">Serie</label>
        <select {...atributosCampo('serieCodigo', err)} value={serie}
          onChange={(evento) => setSerie(evento.target.value)} className={entrada}
          style={{ ...estilo, borderColor: bordeCampo('serieCodigo', err, estilo.borderColor) }}>
          <option value="">Elegir…</option>
          {series.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <MensajeError campo="serieCodigo" errores={err} />
      </div>
      <div className="col-span-2">
        <label htmlFor="vidrioCodigo">Vidrio</label>
        <input {...atributosCampo('vidrioCodigo', err)} className={entrada}
          style={{ ...estilo, borderColor: bordeCampo('vidrioCodigo', err, estilo.borderColor) }}
          placeholder="V420AGS4" />
        <MensajeError campo="vidrioCodigo" errores={err} />
      </div>
      <div className="col-span-2">
        <label htmlFor="varianteAcristalamiento">Acristalamiento</label>
        <select id="varianteAcristalamiento" name="varianteAcristalamiento" defaultValue="2"
          className={entrada} style={estilo}>
          <option value="2">Doble cristal</option>
          <option value="1">Cristal sencillo</option>
        </select>
      </div>
      <div className="col-span-2">
        <label htmlFor="acabadoCodigo">Acabado</label>
        <select id="acabadoCodigo" name="acabadoCodigo" defaultValue={acabadoPorDefecto(acabados)}
          className={entrada} style={estilo}>
          <option value="">— sin acabado —</option>
          {acabados.map((item) => (
            <option key={item.codigo} value={item.codigo}>{item.codigo} · {item.descripcion}</option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label htmlFor="cantidad">Cdad.</label>
        <input {...atributosCampo('cantidad', err)} type="number" defaultValue={1} min={1} step={1}
          className={`cifra ${entrada}`}
          style={{ ...estilo, borderColor: bordeCampo('cantidad', err, estilo.borderColor) }} />
        <MensajeError campo="cantidad" errores={err} />
      </div>
      <div className="col-span-2">
        <label htmlFor="horasFabricacion">Fabricación (h)</label>
        <input {...atributosCampo('horasFabricacion', err)} type="number" min={0} step="0.01"
          defaultValue={0} className={`cifra ${entrada}`}
          style={{ ...estilo, borderColor: bordeCampo('horasFabricacion', err, estilo.borderColor) }} />
        <MensajeError campo="horasFabricacion" errores={err} />
      </div>
      <div className="col-span-2">
        <label htmlFor="horasColocacion">Colocación (h)</label>
        <input {...atributosCampo('horasColocacion', err)} type="number" min={0} step="0.01"
          defaultValue={0} className={`cifra ${entrada}`}
          style={{ ...estilo, borderColor: bordeCampo('horasColocacion', err, estilo.borderColor) }} />
        <MensajeError campo="horasColocacion" errores={err} />
      </div>
    </div>
  )
}

export function CamposArticulo({
  err, acabados,
}: {
  err: Record<string, string[] | undefined>
  acabados: { codigo: string; descripcion: string }[]
}) {
  return (
    <div className={styles.fields}>
      <div className="col-span-3">
        <label htmlFor="codigo">Artículo</label>
        <input {...atributosCampo('codigo', err)} className={entrada}
          style={{ ...estilo, borderColor: bordeCampo('codigo', err, estilo.borderColor) }}
          placeholder="PSM001" />
        <MensajeError campo="codigo" errores={err} />
      </div>
      <div className="col-span-3">
        <label htmlFor="acabadoCodigo">Acabado</label>
        <select id="acabadoCodigo" name="acabadoCodigo" defaultValue="" className={entrada} style={estilo}>
          <option value="">Genérico / no aplica</option>
          {acabados.map((item) => (
            <option key={item.codigo} value={item.codigo}>{item.codigo} · {item.descripcion}</option>
          ))}
        </select>
      </div>
      <div className="col-span-3">
        <label htmlFor="referencia">Ubicación</label>
        <input {...atributosCampo('referencia', err)} className={entrada}
          style={{ ...estilo, borderColor: bordeCampo('referencia', err, estilo.borderColor) }}
          placeholder="SALÓN" />
        <MensajeError campo="referencia" errores={err} />
      </div>
      <div className="col-span-3">
        <label htmlFor="cantidad">Cdad.</label>
        <input {...atributosCampo('cantidad', err)} type="number" defaultValue={1} min={1} step={1}
          className={`cifra ${entrada}`}
          style={{ ...estilo, borderColor: bordeCampo('cantidad', err, estilo.borderColor) }} />
        <MensajeError campo="cantidad" errores={err} />
      </div>
    </div>
  )
}
