'use client'

import { descripcionLineaEstructura, type PlantillaDiseno } from '@aluminior/core/estructuras'
import { atributosCampo, bordeCampo } from '../../_lib/campos.ts'
import { MAXIMO_HORAS } from '../../_lib/lineas/esquema-linea.ts'
import { MensajeError } from './mensaje-error.tsx'
import { DibujoEstructura } from './dibujo-estructura.tsx'
import styles from '../presupuesto-movil.module.css'

const entrada = 'w-full rounded-md border px-3 py-2 text-sm'
const estilo = { background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }

export function EditorLineaEstructura({
  plantilla, series, acabados, serie, setSerie, anchoMm, setAnchoMm, altoMm, setAltoMm,
  vidrio, setVidrio, acabado, setAcabado, variante, setVariante, err, onCambiarEstructura,
}: {
  plantilla: PlantillaDiseno
  series: string[]
  acabados: { codigo: string; descripcion: string }[]
  serie: string
  setSerie: (valor: string) => void
  anchoMm: number
  setAnchoMm: (valor: number) => void
  altoMm: number
  setAltoMm: (valor: number) => void
  vidrio: string
  setVidrio: (valor: string) => void
  acabado: string
  setAcabado: (valor: string) => void
  variante: '1' | '2'
  setVariante: (valor: '1' | '2') => void
  err: Record<string, string[] | undefined>
  onCambiarEstructura: () => void
}) {
  const acabadoEtiqueta = acabados.find((item) => item.codigo === acabado)
  const descripcion = descripcionLineaEstructura({
    plantilla, anchoMm, altoMm, serie: serie || null, vidrio: vidrio || null,
    acabado: acabadoEtiqueta ? `${acabadoEtiqueta.codigo} · ${acabadoEtiqueta.descripcion}` : acabado || null,
    varianteAcristalamiento: variante,
  })

  return (
    <div className="al-line-editor">
      <div className="al-line-editor-code">
        <label htmlFor="codigo">Código</label>
        <input id="codigo" name="codigo" value={plantilla.codigo} readOnly className={entrada} style={estilo} />
        <button type="button" className="al-command" onClick={onCambiarEstructura}>Escaparate</button>
      </div>

      <div className={`${styles.fields} al-line-editor-materials`}>
        <div className="col-span-3">
          <label htmlFor="serieCodigo">Perfiles</label>
          <select {...atributosCampo('serieCodigo', err)} value={serie}
            onChange={(evento) => setSerie(evento.target.value)} className={entrada}
            style={{ ...estilo, borderColor: bordeCampo('serieCodigo', err, estilo.borderColor) }}>
            <option value="">Elegir serie…</option>
            {series.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <MensajeError campo="serieCodigo" errores={err} />
        </div>
        <div className="col-span-3">
          <label htmlFor="vidrioCodigo">Vidrio</label>
          <input {...atributosCampo('vidrioCodigo', err)} value={vidrio}
            onChange={(evento) => setVidrio(evento.target.value)} className={entrada}
            style={{ ...estilo, borderColor: bordeCampo('vidrioCodigo', err, estilo.borderColor) }}
            placeholder="V420AGS4" />
          <MensajeError campo="vidrioCodigo" errores={err} />
        </div>
        <div className="col-span-3">
          <label htmlFor="acabadoCodigo">Acabado</label>
          <select id="acabadoCodigo" name="acabadoCodigo" value={acabado}
            onChange={(evento) => setAcabado(evento.target.value)} className={entrada} style={estilo}>
            <option value="">— sin acabado —</option>
            {acabados.map((item) => (
              <option key={item.codigo} value={item.codigo}>{item.codigo} · {item.descripcion}</option>
            ))}
          </select>
        </div>
        <div className="col-span-3">
          <label htmlFor="varianteAcristalamiento">Acristalamiento</label>
          <select id="varianteAcristalamiento" name="varianteAcristalamiento" value={variante}
            onChange={(evento) => setVariante(evento.target.value === '1' ? '1' : '2')}
            className={entrada} style={estilo}>
            <option value="2">Doble cristal</option>
            <option value="1">Cristal sencillo</option>
          </select>
        </div>
      </div>

      <div className={`${styles.fields} al-line-editor-measures`}>
        <div className="col-span-2">
          <label htmlFor="cantidad">Cantidad</label>
          <input {...atributosCampo('cantidad', err)} type="number" defaultValue={1} min={1} step={1}
            className={`cifra ${entrada}`}
            style={{ ...estilo, borderColor: bordeCampo('cantidad', err, estilo.borderColor) }} />
          <MensajeError campo="cantidad" errores={err} />
        </div>
        <div className="col-span-2">
          <label htmlFor="referencia">Referencia (Tipo)</label>
          <input {...atributosCampo('referencia', err)} className={entrada}
            style={{ ...estilo, borderColor: bordeCampo('referencia', err, estilo.borderColor) }}
            placeholder="V-1" />
          <MensajeError campo="referencia" errores={err} />
        </div>
        <div className="col-span-2">
          <label htmlFor="anchoMm">Ancho (mm)</label>
          <input {...atributosCampo('anchoMm', err)} type="number" min={100} step={10} value={anchoMm}
            onChange={(evento) => setAnchoMm(Number(evento.target.value))}
            className={`cifra ${entrada}`}
            style={{ ...estilo, borderColor: bordeCampo('anchoMm', err, estilo.borderColor) }} />
          <MensajeError campo="anchoMm" errores={err} />
        </div>
        <div className="col-span-2">
          <label htmlFor="altoMm">Alto (mm)</label>
          <input {...atributosCampo('altoMm', err)} type="number" min={100} step={10} value={altoMm}
            onChange={(evento) => setAltoMm(Number(evento.target.value))}
            className={`cifra ${entrada}`}
            style={{ ...estilo, borderColor: bordeCampo('altoMm', err, estilo.borderColor) }} />
          <MensajeError campo="altoMm" errores={err} />
        </div>
      </div>

      <div className="al-line-editor-body">
        <div className="al-line-editor-draw">
          <DibujoEstructura plantilla={plantilla} anchoMm={anchoMm} altoMm={altoMm} />
        </div>
        <fieldset className="al-line-editor-hours">
          <legend>Horas adicionales</legend>
          <label htmlFor="horasFabricacion">Fabr. (h)</label>
          <input {...atributosCampo('horasFabricacion', err)} type="number" min={0} step="0.01"
            max={MAXIMO_HORAS} defaultValue={0} className={`cifra ${entrada}`}
            style={{ ...estilo, borderColor: bordeCampo('horasFabricacion', err, estilo.borderColor) }} />
          <MensajeError campo="horasFabricacion" errores={err} />
          <label htmlFor="horasColocacion">Coloc. (h)</label>
          <input {...atributosCampo('horasColocacion', err)} type="number" min={0} step="0.01"
            max={MAXIMO_HORAS} defaultValue={0} className={`cifra ${entrada}`}
            style={{ ...estilo, borderColor: bordeCampo('horasColocacion', err, estilo.borderColor) }} />
          <MensajeError campo="horasColocacion" errores={err} />
        </fieldset>
      </div>

      <label className="al-line-editor-desc">
        Descripción
        <textarea readOnly rows={3} value={descripcion} />
      </label>
    </div>
  )
}
