'use client'

import React from 'react'
import type { CambiosComplementosModulo, CompactoModulo, ModuloCerramiento, TapajuntasModulo } from '@aluminior/core/estructuras'

export interface ModeloComplemento {
  codigo: string
  descripcion: string
}

export interface CatalogoComplementosDisenador {
  compactos: readonly ModeloComplemento[]
  tapajuntas: readonly ModeloComplemento[]
}

const CAJONES_ESTANDAR = [155, 185, 200] as const

export function ComplementosElemento({ modulo, borrador, catalogo, onChange }: {
  modulo: ModuloCerramiento
  borrador: CambiosComplementosModulo
  catalogo: CatalogoComplementosDisenador
  onChange: (cambios: CambiosComplementosModulo) => void
}) {
  const compacto: CompactoModulo | null = Object.hasOwn(borrador, 'compacto')
    ? borrador.compacto ?? null : modulo.compacto ?? null
  const tapajuntas: TapajuntasModulo | null = Object.hasOwn(borrador, 'tapajuntas')
    ? borrador.tapajuntas ?? null : modulo.tapajuntas ?? null
  const sinInferior = Boolean(tapajuntas?.opciones?.includes('G2O1'))
  return <>
    {catalogo.compactos.length > 0 && (
      <>
        <label className="al-designer-measure">
          <span className="al-designer-properties-label">Compacto</span>
          <select aria-label="Compacto" value={compacto?.estructuraCodigo ?? ''}
            data-excepcion={Boolean(compacto) || undefined}
            onChange={(e) => {
              const codigo = e.target.value
              onChange({
                compacto: codigo
                  ? {
                      estructuraCodigo: codigo,
                      altoCajonMm: compacto?.altoCajonMm ?? 155,
                      descontarHueco: compacto?.descontarHueco ?? true,
                    }
                  : null,
              })
            }}>
            <option value="">Sin compacto</option>
            {catalogo.compactos.map((m) => (
              <option key={m.codigo} value={m.codigo}>{m.codigo} · {m.descripcion}</option>
            ))}
          </select>
        </label>
        {compacto && (
          <>
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Cajón (mm)</span>
              <select aria-label="Cajón (mm)" value={String(compacto.altoCajonMm)} className="cifra"
                onChange={(e) => onChange({
                  compacto: { ...compacto, altoCajonMm: Number(e.target.value) },
                })}>
                {!CAJONES_ESTANDAR.includes(compacto.altoCajonMm as 155 | 185 | 200) && (
                  <option value={String(compacto.altoCajonMm)}>{compacto.altoCajonMm}</option>
                )}
                {CAJONES_ESTANDAR.map((mm) => (
                  <option key={mm} value={String(mm)}>{mm}</option>
                ))}
              </select>
            </label>
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Descontar cajón</span>
              <input type="checkbox" aria-label="Descontar cajón"
                checked={Boolean(compacto.descontarHueco)}
                onChange={(e) => onChange({
                  compacto: { ...compacto, descontarHueco: e.target.checked },
                })} />
            </label>
          </>
        )}
      </>
    )}
    {catalogo.tapajuntas.length > 0 && (
      <>
        <label className="al-designer-measure">
          <span className="al-designer-properties-label">Tapajuntas</span>
          <select aria-label="Tapajuntas" value={tapajuntas?.estructuraCodigo ?? ''}
            data-excepcion={Boolean(tapajuntas) || undefined}
            onChange={(e) => {
              const codigo = e.target.value
              onChange({
                tapajuntas: codigo
                  ? {
                      estructuraCodigo: codigo,
                      opciones: tapajuntas?.opciones ?? ['G1O0', 'G2O0', 'G3O0', 'G4O0'],
                      descontarHueco: tapajuntas?.descontarHueco ?? true,
                    }
                  : null,
              })
            }}>
            <option value="">Sin tapajuntas</option>
            {catalogo.tapajuntas.map((m) => (
              <option key={m.codigo} value={m.codigo}>{m.codigo} · {m.descripcion}</option>
            ))}
          </select>
        </label>
        {tapajuntas && (
          <>
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Lados tapajuntas</span>
              <select aria-label="Lados tapajuntas" value={sinInferior ? '3' : '4'}
                onChange={(e) => onChange({
                  tapajuntas: {
                    ...tapajuntas,
                    opciones: e.target.value === '3'
                      ? ['G1O0', 'G2O1', 'G3O0', 'G4O0']
                      : ['G1O0', 'G2O0', 'G3O0', 'G4O0'],
                  },
                })}>
                <option value="4">4 lados (con inferior)</option>
                <option value="3">3 lados (sin inferior)</option>
              </select>
            </label>
            <label className="al-designer-measure">
              <span className="al-designer-properties-label">Descontar hueco</span>
              <input type="checkbox" aria-label="Descontar hueco tapajuntas"
                checked={Boolean(tapajuntas.descontarHueco)}
                onChange={(e) => onChange({
                  tapajuntas: { ...tapajuntas, descontarHueco: e.target.checked },
                })} />
            </label>
          </>
        )}
      </>
    )}
  </>
}
