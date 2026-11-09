'use client'

import React from 'react'
import {
  compactoAlElegir, gruposOpcionesVisibles, marcarOpcionCompacto, opcionMarcadaCompacto,
  opcionesPredeterminadasCompacto,
  type CambiosComplementosModulo, type CompactoModulo, type ModuloCerramiento, type TapajuntasModulo,
} from '@aluminior/core/estructuras'

export interface ModeloComplemento {
  codigo: string
  descripcion: string
}

export interface CatalogoComplementosDisenador {
  compactos: readonly ModeloComplemento[]
  tapajuntas: readonly ModeloComplemento[]
  /** Guías de persiana, familia 051. Vacío si el catálogo no las tiene. */
  guias?: readonly ModeloComplemento[]
}

const CAJONES_ESTANDAR = [155, 185, 200] as const

function textoOpcion(texto: string): string {
  if (texto === 'NO') return 'No'
  if (texto === 'SI') return 'Sí'
  return texto
}

function conOpciones(compacto: CompactoModulo): CompactoModulo {
  return compacto.opciones?.length
    ? compacto
    : { ...compacto, opciones: opcionesPredeterminadasCompacto(compacto.estructuraCodigo) }
}

function asignarGuia(compacto: CompactoModulo, lado: 'izquierda' | 'derecha', codigo: string): CompactoModulo {
  const siguiente = conOpciones({ ...compacto })
  if (lado === 'izquierda') {
    if (codigo) siguiente.guiaIzquierda = codigo
    else delete siguiente.guiaIzquierda
    if (codigo && !siguiente.guiaDerecha) siguiente.guiaDerecha = codigo
  } else if (codigo) siguiente.guiaDerecha = codigo
  else delete siguiente.guiaDerecha
  return siguiente
}

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
  const grupos = compacto ? gruposOpcionesVisibles(compacto.estructuraCodigo) : []
  const guias = [...catalogo.guias ?? []].sort((a, b) =>
    Number(a.codigo === '27') - Number(b.codigo === '27') || a.codigo.localeCompare(b.codigo))
  return <>
    {catalogo.compactos.length > 0 && (
      <fieldset className="al-complementos">
        <legend>Compacto</legend>
        <label className="al-designer-measure al-complemento">
          <span className="al-designer-properties-label">Compacto</span>
          <select aria-label="Compacto" value={compacto?.estructuraCodigo ?? ''}
            data-excepcion={Boolean(compacto) || undefined}
            onChange={(e) => {
              const codigo = e.target.value
              onChange({
                compacto: codigo ? compactoAlElegir(codigo, modulo.altoMm, compacto) : null,
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
            <label className="al-designer-measure al-complemento-corto">
              <span className="al-designer-properties-label">Cajón (mm)</span>
              <select aria-label="Cajón (mm)" value={String(compacto.altoCajonMm)} className="cifra"
                onChange={(e) => onChange({
                  compacto: { ...conOpciones(compacto), altoCajonMm: Number(e.target.value) },
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
              <span className="al-designer-properties-label">Descontar del hueco</span>
              <input type="checkbox" aria-label="Descontar cajón del hueco"
                checked={Boolean(compacto.descontarHueco)}
                onChange={(e) => onChange({
                  compacto: { ...conOpciones(compacto), descontarHueco: e.target.checked },
                })} />
            </label>
            {guias.length > 0 && (['izquierda', 'derecha'] as const).map((lado) => {
              const valor = lado === 'izquierda' ? compacto.guiaIzquierda ?? '' : compacto.guiaDerecha ?? ''
              const etiqueta = lado === 'izquierda' ? 'Guía izquierda' : 'Guía derecha'
              return (
                <label key={lado} className="al-designer-measure al-complemento">
                  <span className="al-designer-properties-label">{etiqueta}</span>
                  <select aria-label={etiqueta} value={valor}
                    data-excepcion={Boolean(valor) || undefined}
                    onChange={(e) => onChange({ compacto: asignarGuia(compacto, lado, e.target.value) })}>
                    <option value="">Sin guía</option>
                    {guias.map((guia) => (
                      <option key={guia.codigo} value={guia.codigo}>{guia.codigo} · {guia.descripcion}</option>
                    ))}
                  </select>
                </label>
              )
            })}
            {grupos.map((grupo) => {
              const marcada = opcionMarcadaCompacto(compacto.opciones, grupo.grupo)
              const valor = marcada ?? grupo.opciones.find((opcion) => opcion.predeterminada)?.opcion ?? ''
              return (
                <label key={grupo.grupo} className="al-designer-measure al-complemento">
                  <span className="al-designer-properties-label">{grupo.titulo}</span>
                  <select aria-label={grupo.titulo} value={String(valor)}
                    onChange={(e) => onChange({
                      compacto: {
                        ...conOpciones(compacto),
                        opciones: marcarOpcionCompacto(conOpciones(compacto).opciones, grupo.grupo, Number(e.target.value)),
                      },
                    })}>
                    {grupo.opciones.map((opcion) => (
                      <option key={opcion.opcion} value={String(opcion.opcion)}>{textoOpcion(opcion.texto)}</option>
                    ))}
                  </select>
                </label>
              )
            })}
          </>
        )}
      </fieldset>
    )}
    {catalogo.tapajuntas.length > 0 && (
      <>
        <label className="al-designer-measure al-complemento">
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
