'use client'

import React from 'react'
import {
  cotasModuloValidas, resolverGeometriaFi1Ofi, SIMBOLOS_COTA_ANCHO, SIMBOLOS_COTA_MODULO,
  type CambiosCotasModulo, type CotaCatalogo, type ModuloCerramiento, type SimboloCotaModulo,
} from '@aluminior/core/estructuras'
import type { BorradorModulo } from './use-borradores-cerramiento.ts'

type Medidas = Partial<Pick<ModuloCerramiento, 'anchoMm' | 'altoMm' | 'fiMm'>> & { cotas?: CambiosCotasModulo }

/** Lo que emite el input: vacío quita la cota; cualquier otro texto conserva el número. */
export function cambioCotaCampo(simbolo: SimboloCotaModulo, texto: string, numerico: number): CambiosCotasModulo {
  return { [simbolo]: texto === '' ? null : numerico }
}

function etiquetaCota(cota: CotaCatalogo): string {
  const nombre = cota.nombre?.trim()
  return nombre ? nombre : cota.simbolo
}

function cotasDelElemento(estructuraCodigo: string, catalogo: readonly CotaCatalogo[]): CotaCatalogo[] {
  const es1Ofi = estructuraCodigo.trim().toUpperCase() === '1OFI'
  const vistas = new Set<string>()
  const salida: CotaCatalogo[] = []
  for (const cota of catalogo) {
    if (!(SIMBOLOS_COTA_MODULO as readonly string[]).includes(cota.simbolo)) continue
    if (es1Ofi && cota.simbolo === 'FI') continue
    if (vistas.has(cota.simbolo)) continue
    vistas.add(cota.simbolo)
    salida.push(cota)
  }
  return salida.sort((a, b) => SIMBOLOS_COTA_MODULO.indexOf(a.simbolo) - SIMBOLOS_COTA_MODULO.indexOf(b.simbolo))
}

function textoCota(
  simbolo: SimboloCotaModulo, modulo: ModuloCerramiento, borrador: CambiosCotasModulo | undefined,
  defecto: number | null,
): string {
  const draft = borrador?.[simbolo]
  if (draft === null) return ''
  if (typeof draft === 'number') return Number.isFinite(draft) ? String(draft) : ''
  const instancia = modulo.cotas?.[simbolo]
  if (typeof instancia === 'number' && Number.isFinite(instancia)) return String(instancia)
  if (defecto !== null && cotasModuloValidas({ [simbolo]: defecto }, modulo.altoMm, modulo.anchoMm)) return String(defecto)
  return ''
}

function errorCota(simbolo: SimboloCotaModulo, texto: string, altoMm: number, anchoMm: number): string | null {
  if (texto === '') return null
  if (cotasModuloValidas({ [simbolo]: Number(texto) }, altoMm, anchoMm)) return null
  const eje = (SIMBOLOS_COTA_ANCHO as readonly string[]).includes(simbolo) ? 'ancho' : 'alto'
  return `${simbolo} debe ser un número mayor que 0 y menor que el ${eje} del elemento.`
}

export function MedidasElemento({
  modulo, pendiente, cotasCatalogo = [], cotasBorrador, onChange, onActualizar, onDescartar,
}: {
  modulo: ModuloCerramiento
  pendiente: boolean
  cotasCatalogo?: readonly CotaCatalogo[]
  cotasBorrador?: CambiosCotasModulo
  onChange: (cambios: Medidas) => void
  onActualizar: () => void
  onDescartar: () => void
}) {
  const geometriaFi = modulo.estructuraCodigo === '1OFI' && Object.hasOwn(modulo, 'fiMm')
    ? resolverGeometriaFi1Ofi(modulo.anchoMm, modulo.altoMm, modulo.fiMm) : null
  const cotas = cotasDelElemento(modulo.estructuraCodigo, cotasCatalogo)
  // Intro en una medida actualiza el elemento; sin esto enviaría el formulario de la línea.
  const alPulsarTecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key !== 'Enter') return
    evento.preventDefault()
    if (pendiente) onActualizar()
  }
  return <>
    {(['anchoMm', 'altoMm'] as const).map(campo => <label key={campo} className="al-designer-measure">
      <span className="al-designer-properties-label">{campo === 'anchoMm' ? 'Ancho elemento' : 'Alto elemento'}</span>
      <input type="number" min={1} step="any" onKeyDown={alPulsarTecla}
        value={Number.isFinite(modulo[campo]) ? modulo[campo] : ''}
        onChange={evento => onChange({ [campo]: evento.target.valueAsNumber })} />
    </label>)}
    {modulo.estructuraCodigo === '1OFI' && <label className="al-designer-measure">
      <span className="al-designer-properties-label">FIJO INFERIOR</span>
      <input type="number" step="any" onKeyDown={alPulsarTecla} value={Number.isFinite(modulo.fiMm) ? modulo.fiMm : ''}
        aria-invalid={geometriaFi?.valido === false || undefined}
        aria-describedby={geometriaFi?.valido === false ? `fi-error-${modulo.id}` : undefined}
        onChange={evento => onChange({ fiMm: evento.target.valueAsNumber })} />
      <span>mm</span>
      {geometriaFi?.valido === false && <small id={`fi-error-${modulo.id}`} style={{ color: 'var(--al-error)' }}>
        FI debe ser un número mayor que 0 y menor que el alto del elemento.
      </small>}
    </label>}
    {cotas.map(cota => {
      const texto = textoCota(cota.simbolo, modulo, cotasBorrador, cota.valorPorDefecto)
      const error = errorCota(cota.simbolo, texto, modulo.altoMm, modulo.anchoMm)
      const errorId = `cota-error-${modulo.id}-${cota.simbolo}`
      return <label key={cota.simbolo} className="al-designer-measure">
        <span className="al-designer-properties-label">
          {etiquetaCota(cota)}
          {cota.valorPorDefecto !== null && <> <span className="cifra" data-cota-defecto={cota.simbolo}>{cota.valorPorDefecto}</span></>}
        </span>
        <input type="number" step="any" inputMode="decimal" data-cota={cota.simbolo} onKeyDown={alPulsarTecla}
          value={texto === '' ? '' : Number(texto)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={evento => onChange({ cotas: cambioCotaCampo(cota.simbolo, evento.target.value, evento.target.valueAsNumber) })} />
        <span>mm</span>
        {error && <small id={errorId} style={{ color: 'var(--al-error)' }}>{error}</small>}
      </label>
    })}
    <button type="button" className="al-command-primary" disabled={!pendiente} onClick={onActualizar}
      aria-label="Actualizar elemento">Actualizar</button>
    {pendiente && <button type="button" className="al-command" onClick={onDescartar}>Descartar cambios</button>}
  </>
}
