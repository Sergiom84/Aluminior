export interface UnionFormulario {
  codigo: string
  descripcion: string
  cantidad: 1 | 2 | 3
  perfiles: [string, string, string]
  grosor: number
  l1: number
  l2: number
  tipo: 0 | 1 | 2 | 3 | 4
  manoObraMinutos: number
  deUsuario: boolean
  seriesEspecificas: boolean
  series: string[]
  imagen: string
}

export type ErroresUnion = Record<string, string[]>

const CODIGO = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,20}$/
const NOMBRE = /^[^\\/:*?"<>|]{1,80}\.(bmp|png|jpe?g|webp)$/i

function numero(valor: string | undefined) {
  if (valor === undefined || valor.trim() === '') return Number.NaN
  return Number(valor.replace(',', '.'))
}

export function validarUnion(entrada: Record<string, string | string[]>): { ok: true; datos: UnionFormulario } | { ok: false; errores: ErroresUnion } {
  const errores: ErroresUnion = {}
  const texto = (clave: string) => {
    const valor = entrada[clave]
    return (Array.isArray(valor) ? valor[0] : valor ?? '').trim()
  }
  const codigo = texto('codigo')
  const descripcion = texto('descripcion')
  const cantidad = Number(texto('cantidad'))
  const perfiles = [1, 2, 3].map(n => texto(`perfil${n}`)) as [string, string, string]
  const grosor = numero(texto('grosor'))
  const l1 = numero(texto('l1'))
  const l2 = numero(texto('l2'))
  const tipo = Number(texto('tipo'))
  const manoObraMinutos = numero(texto('manoObra'))
  const series = (Array.isArray(entrada.series) ? entrada.series : texto('series') ? [texto('series')] : [])
    .map(serie => serie.trim()).filter(Boolean)
  const imagen = texto('imagen')

  if (!CODIGO.test(codigo)) errores.codigo = ['Código no válido']
  if (!descripcion || descripcion.length > 120) errores.descripcion = ['Descripción obligatoria']
  if (![1, 2, 3].includes(cantidad)) errores.cantidad = ['Cantidad 1, 2 o 3']
  else perfiles.slice(0, cantidad).forEach((perfil, indice) => {
    if (!CODIGO.test(perfil)) errores[`perfil${indice + 1}`] = ['Perfil obligatorio']
  })
  if (!Number.isFinite(grosor) || grosor < 0) errores.grosor = ['Grosor no válido']
  if (!Number.isFinite(l1) || l1 < 0) errores.l1 = ['L1 no válido']
  if (!Number.isFinite(l2) || l2 < 0) errores.l2 = ['L2 no válido']
  if (![0, 1, 2, 3, 4].includes(tipo)) errores.tipo = ['Tipo no válido']
  if (!Number.isFinite(manoObraMinutos) || manoObraMinutos < 0) errores.manoObra = ['Mano de obra no válida']
  if (texto('seriesEspecificas') === '1' && series.length === 0) errores.series = ['Elige al menos una serie']
  if (imagen && !NOMBRE.test(imagen)) errores.imagen = ['Imagen no válida']

  if (Object.keys(errores).length) return { ok: false, errores }
  return {
    ok: true,
    datos: {
      codigo, descripcion, cantidad: cantidad as 1 | 2 | 3, perfiles,
      grosor, l1, l2, tipo: tipo as UnionFormulario['tipo'], manoObraMinutos,
      deUsuario: texto('deUsuario') === '1',
      seriesEspecificas: texto('seriesEspecificas') === '1',
      series, imagen,
    },
  }
}
