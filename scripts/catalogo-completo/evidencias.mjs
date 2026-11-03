import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { huellaArchivo } from './fuentes.mjs'

const fallar = mensaje => { throw new Error(`Evidencia de catálogo: ${mensaje}`) }
const texto = (valor, nombre) => {
  if (typeof valor !== 'string' || !valor.trim()) fallar(`${nombre} debe ser texto no vacío`)
}
const campos = (valor, esperados, nombre) => {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor) ||
      Object.keys(valor).some(k => !esperados.includes(k)) ||
      esperados.some(k => !Object.hasOwn(valor, k))) fallar(`campos inválidos en ${nombre}`)
}

export function analizarArgumentos(argumentos) {
  const carpetas = []
  let evidencias = null
  for (let i = 0; i < argumentos.length; i += 1) {
    const valor = argumentos[i]
    if (valor === '--evidencias') {
      if (evidencias || !argumentos[i + 1] || argumentos[i + 1].startsWith('--')) {
        fallar('--evidencias requiere una única ruta')
      }
      evidencias = resolve(argumentos[++i])
    } else if (valor.startsWith('--')) fallar(`opción desconocida ${valor}`)
    else carpetas.push(resolve(valor))
  }
  return { carpetas, evidencias }
}

function leerPruebas(pruebas, raiz, obligatorias, nombre) {
  if (!Array.isArray(pruebas) || (obligatorias && pruebas.length === 0)) {
    fallar(`${nombre} requiere referencias a pruebas ejecutadas`)
  }
  return pruebas.map(ruta => {
    texto(ruta, `${nombre}.pruebas`)
    if (/^[a-z]+:\/\//i.test(ruta)) fallar('las pruebas deben ser archivos locales')
    const absoluta = resolve(raiz, ruta)
    const stat = statSync(absoluta)
    if (!stat.isFile() || stat.size === 0) fallar(`prueba vacía o no es archivo: ${ruta}`)
    return huellaArchivo(absoluta)
  })
}

/** Acredita casos de venta/despiece con referencias; nunca certifica fabricación. */
export function cargarEvidencias(ruta, lecturas, raiz = process.cwd()) {
  if (!ruta) return { porFuente: new Map(), documento: null }
  const documento = JSON.parse(readFileSync(ruta, 'utf8').replace(/^\uFEFF/, ''))
  campos(documento, ['version', 'fuenteId', 'modelos'], 'documento')
  if (documento.version !== 1) fallar('versión no admitida')
  texto(documento.fuenteId, 'fuenteId')
  const lectura = lecturas.find(l => l.fuente.id === documento.fuenteId)
  if (!lectura) fallar('fuenteId no corresponde a ninguna exportación seleccionada')
  if (!Array.isArray(documento.modelos) || !documento.modelos.length) fallar('modelos debe contener evidencia')
  const origen = huellaArchivo(ruta)
  const evidencias = Object.create(null)
  for (const modelo of documento.modelos) {
    campos(modelo, ['codigo', 'alcance', 'dibujo', 'edicion', 'persistencia',
      'valoracion', 'fabricacion'], 'modelo')
    texto(modelo.codigo, 'codigo')
    texto(modelo.alcance, 'alcance')
    if (Object.hasOwn(evidencias, modelo.codigo)) fallar(`modelo repetido ${modelo.codigo}`)
    if (lectura.estructuras.filter(e => e.codigo === modelo.codigo).length !== 1) {
      fallar(`código desconocido o ambiguo ${modelo.codigo}`)
    }
    if (modelo.fabricacion !== false) fallar('fabricación debe permanecer false; no acreditada')
    const pruebas = {}
    for (const capacidad of ['dibujo', 'edicion', 'persistencia']) {
      const declaracion = modelo[capacidad]
      campos(declaracion, ['estado', 'pruebas'], capacidad)
      if (!['sin-verificar', 'verificado-en-casos'].includes(declaracion.estado)) {
        fallar(`estado no admitido en ${capacidad}`)
      }
      pruebas[capacidad] = leerPruebas(declaracion.pruebas, raiz,
        declaracion.estado === 'verificado-en-casos', capacidad)
    }
    const valoracion = modelo.valoracion
    campos(valoracion, ['estado', 'contraste', 'pruebas', 'bloqueos'], 'valoracion')
    if (!['sin-verificar', 'bloqueada', 'incompleta', 'verificada-en-casos'].includes(valoracion.estado) ||
        !['ninguno', 'mismo-motor', 'independiente-en-casos'].includes(valoracion.contraste)) {
      fallar('estado o contraste de valoración no admitido')
    }
    if ((valoracion.estado === 'verificada-en-casos') !==
        (valoracion.contraste === 'independiente-en-casos')) {
      fallar('valoración verificada e independiente deben declararse conjuntamente y solo para los casos')
    }
    if (!Array.isArray(valoracion.bloqueos)) fallar('valoracion.bloqueos debe ser lista')
    valoracion.bloqueos.forEach(b => texto(b, 'bloqueo de valoración'))
    if (['bloqueada', 'incompleta'].includes(valoracion.estado) && !valoracion.bloqueos.length) {
      fallar('valoración bloqueada/incompleta requiere motivos concretos')
    }
    pruebas.valoracion = leerPruebas(valoracion.pruebas, raiz,
      valoracion.estado !== 'sin-verificar' || valoracion.contraste !== 'ninguno', 'valoracion')
    evidencias[modelo.codigo] = { fuenteId: documento.fuenteId,
      dibujo: modelo.dibujo.estado, edicion: modelo.edicion.estado,
      persistencia: modelo.persistencia.estado, valoracion: valoracion.estado,
      contrasteValoracion: valoracion.contraste, bloqueosValoracion: valoracion.bloqueos,
      alcance: modelo.alcance, fuente: origen, pruebas, fabricacion: false }
  }
  return { porFuente: new Map([[documento.fuenteId, evidencias]]), documento: origen }
}
