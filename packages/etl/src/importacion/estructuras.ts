import { bool, ent, num, txt } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import { descartar, excluir, type Resultado } from './resultado.ts'

export async function cargarEstructuras(cargar: Cargar): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  resultados.push(await cargar('Estructuras', 'estructuras', (f, r) => {
    const codigo = txt(f.Codigo)
    if (!codigo) { descartar(r, 'sin código'); return null }
    return {
      codigo,
      descripcion: txt(f.Descripcion) ?? codigo,
      familia: txt(f.Familia),
      observaciones: txt(f.Observaciones),
      es_accesorio: bool(f.AccesorioSN),
      fabrica_stock: bool(f.StFabricacionSN),
    }
  }))

  /**
   * Cotas simbólicas: el origen de las variables de las fórmulas.
   * Sólo interesan las filas de catálogo (sin documento) que llevan símbolo.
   */
  resultados.push(await cargar('EstructurasDiseño', 'estructura_cotas', (f, r) => {
    if (txt(f.TipoDoc)) { excluir(r, 'instancia de documento, no plantilla'); return null }

    const simbolo = txt(f.Simbolo)
    if (!simbolo) { excluir(r, 'fila de diseño sin símbolo'); return null }

    const estructura = txt(f.Estructura)
    if (!estructura) { descartar(r, 'sin estructura'); return null }

    return {
      estructura_codigo: estructura,
      simbolo,
      valor_por_defecto: num(f.Cota),
      nombre: txt(f.nombreDA),
      orientacion: txt(f.TravVP),
      orden_travesano: ent(f.nTrav),
    }
  }))

  /** Ãrbol geomÃ©trico: marco, divisiones, huecos, hojas y vidrios. */
  resultados.push(await cargar('EstructurasDiseño', 'estructura_diseno_nodos', (f, r) => {
    if (txt(f.TipoDoc)) { excluir(r, 'instancia de documento, no plantilla'); return null }
    const estructura = txt(f.Estructura)
    const idItem = ent(f.Id)
    const tipo = ent(f.Tipo)
    if (!estructura || idItem === null || tipo === null) { descartar(r, 'clave incompleta'); return null }
    return {
      estructura_codigo: estructura,
      id_item: idItem,
      tipo,
      contenido_en: ent(f.ContenidoEn),
      id_travesano: ent(f.idTrav),
      posicion_hueco: ent(f.posHueco),
      tipo_travesano: txt(f.TipoTrav),
      invisible: bool(f.bInvisible),
    }
  }))

  /**
   * Plantillas de despiece.
   *
   * `EstructurasArticulos` mezcla plantillas de catálogo (sin documento) con
   * despieces ya calculados de documentos reales. Aquí sólo se cargan las
   * plantillas: las instancias son el oráculo de validación y van aparte.
   */
  resultados.push(await cargar('EstructurasArticulos', 'estructura_componentes', (f, r) => {
    // Filtrado deliberado: si tiene documento, es una instancia, no una plantilla.
    if (txt(f.TipoDoc)) { excluir(r, 'instancia de documento, no plantilla'); return null }

    const estructura = txt(f.Estructura)
    const articulo = txt(f.Articulo)
    if (!estructura) { descartar(r, 'sin estructura'); return null }
    if (!articulo) { descartar(r, 'sin artículo'); return null }

    return {
      estructura_codigo: estructura,
      linea_origen: ent(f.nLin),
      articulo_codigo: articulo,
      cantidad: num(f.Cantidad),
      cantidad_corte: num(f.CantidadCorte),
      formula_largo: txt(f.FormulaLargo),
      formula_largo_corte: txt(f.FormulaLargoCorte),
      formula_ref_largo: txt(f.DisFRefLargo),
      formula_ancho: txt(f.FormulaAncho),
      formula_ancho_corte: txt(f.FormulaAnchoCorte),
      tipo_corte: txt(f.TipoCorte),
      angulo_izquierdo: num(f.AnguloI),
      angulo_derecho: num(f.AnguloD),
      posicion_trabajo: txt(f.PosicionTrabajo),
      funcion: txt(f.Funcion),
      medida_minima: num(f.MedidaMin),
      medida_maxima: num(f.MedidaMax),
      grupo_disenyo: txt(f.DisGrupo),
      componente_disenyo: txt(f.DisComponente),
      id_item_disenyo: ent(f.DisIdIt),
      tipo_hoja_disenyo: ent(f.DisTipoHoja),
      id_hoja_disenyo: ent(f.DisIdHoja),
    }
  }))
  return resultados
}
