import { generarPlantillaCatalogo } from '../../packages/core/src/estructuras/diseno-catalogo.ts'

const unicos = valores => [...new Set(valores)].sort((a, b) => String(a).localeCompare(String(b)))
const contar = valores => Object.fromEntries(unicos(valores).map(v => [v, valores.filter(x => x === v).length]))
const sinVerificar = estado => ['sin-verificar', 'sin-verificacion-por-modelo'].includes(estado)

function componentes(nodos) {
  return {
    tiposNodo: contar(nodos.map(n => n.tipo)),
    hojas: unicos(nodos.filter(n => n.tipo === 3).map(n => `${n.hoja}/${n.numeroHoja}`)),
    marcos: unicos(nodos.filter(n => n.tipo === 1).map(n => n.marco)),
    travesanos: unicos(nodos.filter(n => n.tipo === 6).map(n => n.travesano)),
    cotas: unicos(nodos.filter(n => n.tipo === 6)
      .map(n => `tipo=${n.tipoCota};cota=${n.cota};equi=${n.equidistantes}`)),
    variantes: unicos(nodos.flatMap(n => n.variantes)),
  }
}

/** Las pruebas de una configuración no se convierten en garantía de un modelo. */
export function construirMatriz(lectura, { plantillas = [], uniones = [], evidencias = {} } = {}) {
  const habilitadas = new Set(plantillas.map(p => p.codigo))
  const unionesHabilitadas = new Set(uniones.map(u => u.codigo))
  const repeticiones = contar(lectura.estructuras.map(e => e.codigo))
  const modelos = lectura.estructuras.map((e, indice) => {
    const traduccion = generarPlantillaCatalogo(e)
    const habilitada = habilitadas.has(e.codigo)
    const union = unionesHabilitadas.has(e.codigo)
    const declarada = evidencias[e.codigo]
    const evidencia = declarada?.fuenteId === lectura.fuente.id ? declarada : null
    const motivos = traduccion.estado === 'pendiente' ? [...traduccion.motivos] : []
    if (repeticiones[e.codigo] > 1) motivos.push('código duplicado en Estructuras; identidad ambigua')
    if (!habilitada && !union) motivos.push('no habilitado en catálogo operativo')
    if (!e.nodos.length && !union) motivos.push(
      'sin árbol: resolver mediante configuración propia; no equivale a datos perdidos')
    if (traduccion.estado === 'dibujable' && !habilitada) motivos.push(
      'candidata visual: faltan pruebas de edición, guardado, reapertura, PDF y precio')
    const edicion = evidencia?.edicion ?? 'sin-verificacion-por-modelo'
    const persistencia = evidencia?.persistencia ?? 'sin-verificacion-por-modelo'
    const valoracion = evidencia?.valoracion ?? 'sin-verificacion-por-modelo'
    for (const bloqueo of evidencia?.bloqueosValoracion ?? []) motivos.push(`valoración: ${bloqueo}`)
    if (sinVerificar(edicion)) motivos.push('edición sin prueba individual registrada')
    if (sinVerificar(persistencia)) motivos.push('persistencia sin prueba individual registrada')
    if (sinVerificar(valoracion)) motivos.push(
      'precio/despiece sin prueba independiente individual registrada')
    return {
      id: `${lectura.fuente.id}:${indice + 1}`, fuenteId: lectura.fuente.id,
      filaEstructuras: indice + 1, codigo: e.codigo, descripcion: e.descripcion,
      familia: e.familiaCodigo, accesorioDeclarado: e.accesorio, compactoDeclarado: e.compacto,
      diseno: { disponible: e.nodos.length > 0, nodos: e.nodos.length,
        anchoMm: e.anchoMm, altoMm: e.altoMm },
      componentes: { observados: componentes(e.nodos),
        interpretacion: traduccion.estado === 'dibujable' ? 'candidata-medida-inicial' : 'pendiente',
        bloqueosTraductor: traduccion.estado === 'pendiente' ? traduccion.motivos : [] },
      traduccion: traduccion.estado,
      dibujo: { evidencia: evidencia?.dibujo ?? 'sin-verificacion-por-modelo' },
      habilitacion: { plantilla: habilitada, union, via: union ? 'union' : habilitada ? 'estructura' : null },
      edicion: { disponibleEnInterfaz: habilitada || union, evidencia: edicion },
      persistencia: { disponibleEnInterfaz: habilitada || union, evidencia: persistencia },
      valoracion: { evidencia: valoracion, alcance: evidencia?.alcance ?? null,
        contraste: evidencia?.contrasteValoracion ?? 'ninguno', independiente: false },
      fabricacion: 'no-acreditada', evidencia: evidencia?.fuente ?? null,
      alcanceEvidencia: evidencia?.alcance ?? null, pruebas: evidencia?.pruebas ?? null,
      tablasRelacionadas: e.relacionadas,
      bloqueos: unicos(motivos),
    }
  })
  const familias = [...lectura.familias]
  for (const codigo of unicos(modelos.map(m => m.familia))) if (!familias.some(f => f.codigo === codigo)) {
    familias.push({ codigo, descripcion: codigo ? 'Sin ficha de familia' : 'Sin familia', orden: null,
      accesorio: null })
  }
  const contarGrupo = lista => ({ modelos: lista.length,
    conDiseno: lista.filter(m => m.diseno.disponible).length,
    sinDiseno: lista.filter(m => !m.diseno.disponible).length,
    nodos: lista.reduce((s, m) => s + m.diseno.nodos, 0),
    candidatas: lista.filter(m => m.traduccion === 'dibujable').length,
    plantillasHabilitadas: lista.filter(m => m.habilitacion.plantilla).length,
    unionesHabilitadas: lista.filter(m => m.habilitacion.union).length,
    dibujoVerificadoEnCasos: lista.filter(m => m.dibujo.evidencia === 'verificado-en-casos').length,
    edicionVerificadaEnCasos: lista.filter(m => m.edicion.evidencia === 'verificado-en-casos').length,
    persistenciaVerificadaEnCasos: lista.filter(m => m.persistencia.evidencia === 'verificado-en-casos').length,
    valoracionBloqueadaEnCasos: lista.filter(m => m.valoracion.evidencia === 'bloqueada').length,
  })
  return { fuente: lectura.fuente, disenos: lectura.disenos, familiasDeclaradas: lectura.familias.length,
    resumen: contarGrupo(modelos), familias: familias.map(f => ({ ...f,
      ...contarGrupo(modelos.filter(m => m.familia === f.codigo)) })), modelos }
}
