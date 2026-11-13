/**
 * Plantillas de despiece que Productor guarda con cada diseño específico
 * (`EstructurasArticulos`, `TipoDoc = VPRES`). Se leen de un volcado TSV de la
 * copia (scripts/volcar-tabla-mdb.ps1) y se entregan al motor como plantilla
 * propia del módulo. Mismo mapeo de columnas que el ETL del catálogo.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FilaPlantillaCatalogo } from '@aluminior/core/despiece'

export const ARCHIVO_PLANTILLAS = 'plantillas-documento.tsv'
/** `EstructurasDiseño` del documento: da el vidrio propio de cada hueco. */
export const ARCHIVO_DISENOS = 'disenos-documento.tsv'
type Fila = Record<string, string | undefined>
const txt = (v: string | undefined) => v?.trim() ? v.trim() : null
const ent = (v: string | undefined) => { const n = Number(txt(v)); return txt(v) !== null && Number.isInteger(n) ? n : null }

export function filaPlantillaDocumento(f: Fila, vidrioPropio: string | null = null): FilaPlantillaCatalogo {
  const perfilAdicional = ent(f.DisIdPerAd)
  return {
    id: ent(f.id) ?? 0, articulo: txt(f.Articulo) ?? '', componente: txt(f.DisComponente), funcion: txt(f.Funcion),
    cantidad: Number(txt(f.Cantidad) ?? 0), posicionTrabajo: txt(f.PosicionTrabajo), tipoHoja: txt(f.DisTipoHoja),
    mano: txt(f.DisManoID), hoja: ent(f.DisNHoja) ?? 0, disVidrio: txt(f.DisVidrio),
    referenciaLargo: ent(f.DisIdRefLargo) || null, referenciaAncho: ent(f.DisIdRefAncho) || null,
    formulaLargo: txt(f.FormulaLargoCorte) ?? txt(f.FormulaLargo), formulaAncho: txt(f.FormulaAnchoCorte) ?? txt(f.FormulaAncho),
    formulaReferenciaLargo: txt(f.DisFRefLargo), formulaReferenciaAncho: txt(f.DisFRefAncho),
    grupo: txt(f.DisGrupo), grupoIzquierdo: txt(f.DisGrupoI), grupoDerecho: txt(f.DisGrupoD),
    grupoSuperior: txt(f.DisGrupoSup), grupoInferior: txt(f.DisGrupoInf),
    gruposAdicionales: [txt(f.DisGrupoAdicional), txt(f.DisGrupoAd2), txt(f.DisGrupoAd3), txt(f.DisGrupoAdIndep)],
    perfilAdicional: perfilAdicional === null || perfilAdicional === 0 || perfilAdicional === -1 ? null : perfilAdicional,
    formulaSeleccion: txt(f.OPCformulaSelec),
    ...(vidrioPropio && txt(f.DisComponente) === '1' ? { vidrioPropio } : {}),
  }
}

export const clavePlantilla = (nDoc: unknown, nLinEstr: unknown) => `${String(nDoc).trim()}/${String(nLinEstr).trim()}`

function filasDeTsv(tsv: string): Fila[] {
  const [cabecera, ...lineas] = tsv.split(/\r?\n/).filter(Boolean)
  const columnas = (cabecera ?? '').replace(/^﻿/, '').split('\t')
  return lineas.map(l => { const v = l.split('\t'); return Object.fromEntries(columnas.map((c, i) => [c, v[i]])) as Fila })
}

/** Plantillas por `nDoc/nLinEstr`, en el orden de `nLin`; `disenos` aporta el vidrio de cada nodo de cristal. */
export function plantillasDeTsv(tsv: string, disenos = ''): Map<string, FilaPlantillaCatalogo[]> {
  const vidrios = new Map(filasDeTsv(disenos).filter(n => txt(n.Tipo) === '5' && txt(n.Vidrio))
    .map(n => [`${clavePlantilla(n.nDoc, n.nLinEstr)}/${ent(n.Id) ?? 0}`, txt(n.Vidrio)!]))
  const filas = filasDeTsv(tsv).filter(f => txt(f.Articulo)).sort((a, b) => Number(a.nLin) - Number(b.nLin))
  const salida = new Map<string, FilaPlantillaCatalogo[]>()
  for (const f of filas) {
    const k = clavePlantilla(f.nDoc, f.nLinEstr)
    salida.set(k, [...salida.get(k) ?? [], filaPlantillaDocumento(f, vidrios.get(`${k}/${ent(f.DisIdIt) ?? 0}`) ?? null)])
  }
  return salida
}

/** Sin volcado junto a la extracción no hay plantillas: el diseño específico se valora como el de catálogo. */
export function leerPlantillasDocumento(directorio: string): Map<string, FilaPlantillaCatalogo[]> {
  const ruta = join(directorio, ARCHIVO_PLANTILLAS), disenos = join(directorio, ARCHIVO_DISENOS)
  return existsSync(ruta)
    ? plantillasDeTsv(readFileSync(ruta, 'utf8'), existsSync(disenos) ? readFileSync(disenos, 'utf8') : '') : new Map()
}
