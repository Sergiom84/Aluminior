import type { Sql } from 'postgres'
import { ent, num, rutaTabla, txt } from '../csv.ts'
import { crearCargador, type Cargar } from './cargar.ts'
import { descartar, excluir, type Resultado } from './resultado.ts'

export async function cargarCortesCatalogo(cargar: Cargar): Promise<Resultado[]> {
  const clavesReferencias = new Set<string>()
  const clavesDescuentos = new Set<string>()
  const referencias = await cargar('EstructurasArticulos', 'estructura_referencias_corte', (f, r) => {
    if (txt(f.TipoDoc)) { excluir(r, 'instancia, no catálogo'); return null }
    const estructura = txt(f.Estructura), linea = ent(f.nLin), id = ent(f.id)
    if (!estructura || linea === null || id === null || id <= 0) {
      excluir(r, 'plantilla sin identificador de pieza de diseño'); return null
    }
    const clave = JSON.stringify([estructura, linea])
    if (clavesReferencias.has(clave)) { descartar(r, 'línea de catálogo duplicada'); return null }
    clavesReferencias.add(clave)
    const referencia = ent(f.DisIdRefLargo)
    return {
      estructura_codigo: estructura, linea_origen: linea, id_pieza: id,
      id_referencia: referencia === 0 ? null : referencia,
      formula: txt(f.FormulaLargoCorte) ?? txt(f.FormulaLargo),
      formula_referencia: txt(f.DisFRefLargo), grupo: txt(f.DisGrupo),
      grupo_inicio: txt(f.DisGrupoI), grupo_fin: txt(f.DisGrupoD),
      tipo_hoja: ent(f.DisTipoHoja), perfil_adicional: ent(f.DisIdPerAd),
      grupo_adicional: txt(f.DisGrupoAdicional),
    }
  })
  const descuentos = await cargar('ConjuntosDescuentos', 'conjunto_descuentos_corte', (f, r) => {
    const conjunto = txt(f.Conjunto), familia = txt(f.Familia)
    const principal = txt(f.GrupoPrinc), grupo = txt(f.Grupo), tipo = txt(f.TipoHoja)
    const mm = num(f.Descuento)
    if (!conjunto || !familia || !principal || !grupo || !tipo || mm === null) {
      descartar(r, 'descuento sin clave o valor'); return null
    }
    const clave = JSON.stringify([conjunto, familia, principal, grupo, tipo])
    if (clavesDescuentos.has(clave)) { descartar(r, 'descuento duplicado'); return null }
    clavesDescuentos.add(clave)
    return { conjunto_codigo: conjunto, familia, grupo_principal: principal,
      grupo, tipo_hoja: tipo, descuento_mm: mm }
  })
  return [referencias, descuentos]
}

/** Actualización suplementaria atómica: no vacía presupuestos ni el catálogo previo. */
export async function importarCortesCatalogo(sql: Sql, origen: string) {
  for (const tabla of ['EstructurasArticulos', 'ConjuntosDescuentos']) {
    if (!rutaTabla(origen, tabla)) throw new Error(`Falta ${tabla}; se conserva el catálogo de cortes`)
  }
  return sql.begin(async tx => {
    await tx`DELETE FROM estructura_referencias_corte`
    await tx`DELETE FROM conjunto_descuentos_corte`
    const resultados = await cargarCortesCatalogo(crearCargador(tx as unknown as Sql, origen))
    if (resultados.some(r => r.descartadas > 0 || r.insertadas === 0)) {
      throw new Error('Catálogo de cortes incompleto; actualización revertida')
    }
    return resultados
  })
}
