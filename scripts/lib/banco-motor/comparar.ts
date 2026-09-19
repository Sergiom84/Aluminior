import type {
  CambioFisico,
  CampoFisico,
  ComparacionMateriales,
  DiferenciaMulticonjunto,
  PiezaFisica,
  ResultadoDiagnosticoMotor,
} from './tipos.ts'

export const CAMPOS_EXCLUIDOS_COMPARACION = [
  'ancho',
  'acabado por pieza',
  'vidrio',
  'herraje íntegro',
  'metraje facturado',
  'precios',
] as const

const ADVERTENCIA = 'La igualdad física parcial no demuestra que el despiece completo ni la paridad comercial sean iguales.'

function serializarEstable(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(serializarEstable).join(',')}]`
  if (valor !== null && typeof valor === 'object') {
    const objeto = valor as Record<string, unknown>
    return `{${Object.keys(objeto).sort().map((clave) =>
      `${JSON.stringify(clave)}:${serializarEstable(objeto[clave])}`).join(',')}}`
  }
  return JSON.stringify(valor)
}

function piezaFisica(pieza: ResultadoDiagnosticoMotor['materiales']['piezas'][number]): PiezaFisica {
  return {
    articuloCodigo: pieza.articuloCodigo,
    funcion: pieza.funcion,
    cantidad: pieza.cantidad,
    largoMm: pieza.largoMm,
    tipoCorte: pieza.tipoCorte,
    anguloIzquierdo: pieza.anguloIzquierdo,
    anguloDerecho: pieza.anguloDerecho,
  }
}

function multiconjunto(piezas: readonly PiezaFisica[]): Map<string, DiferenciaMulticonjunto> {
  const resultado = new Map<string, DiferenciaMulticonjunto>()
  for (const pieza of piezas) {
    const clave = serializarEstable(pieza)
    const anterior = resultado.get(clave)
    resultado.set(clave, { pieza, multiplicidad: (anterior?.multiplicidad ?? 0) + 1 })
  }
  return resultado
}

function diferencia(
  referencia: ReadonlyMap<string, DiferenciaMulticonjunto>,
  actual: ReadonlyMap<string, DiferenciaMulticonjunto>,
): DiferenciaMulticonjunto[] {
  const resultado: DiferenciaMulticonjunto[] = []
  for (const [clave, esperado] of referencia) {
    const multiplicidad = esperado.multiplicidad - (actual.get(clave)?.multiplicidad ?? 0)
    if (multiplicidad > 0) resultado.push({ pieza: esperado.pieza, multiplicidad })
  }
  return resultado
}

function expandir(diferencias: readonly DiferenciaMulticonjunto[]): PiezaFisica[] {
  return diferencias.flatMap(({ pieza, multiplicidad }) =>
    Array.from({ length: multiplicidad }, () => pieza))
}

const CAMPOS_FISICOS: readonly CampoFisico[] = [
  'cantidad',
  'largoMm',
  'tipoCorte',
  'anguloIzquierdo',
  'anguloDerecho',
]

function cambiosConcretos(
  faltantes: readonly DiferenciaMulticonjunto[],
  sobrantes: readonly DiferenciaMulticonjunto[],
): CambioFisico[] {
  const disponibles = expandir(sobrantes)
  const cambios: CambioFisico[] = []
  for (const esperado of expandir(faltantes)) {
    const indice = disponibles.findIndex((pieza) =>
      pieza.articuloCodigo === esperado.articuloCodigo && pieza.funcion === esperado.funcion)
    if (indice < 0) continue
    const [actual] = disponibles.splice(indice, 1)
    const diferencias = CAMPOS_FISICOS.flatMap((campo) =>
      Object.is(esperado[campo], actual[campo])
        ? []
        : [{ campo, referencia: esperado[campo], actual: actual[campo] }])
    if (diferencias.length) cambios.push({
      articuloCodigo: esperado.articuloCodigo,
      funcion: esperado.funcion,
      diferencias,
    })
  }
  return cambios
}

function vacia(estado: ComparacionMateriales['estado']): ComparacionMateriales {
  return {
    estado,
    faltantesEnActual: [],
    sobrantesEnActual: [],
    cambios: [],
    camposExcluidos: CAMPOS_EXCLUIDOS_COMPARACION,
    advertencia: ADVERTENCIA,
  }
}

export function compararMateriales(
  referencia: ResultadoDiagnosticoMotor,
  actual: ResultadoDiagnosticoMotor,
): ComparacionMateriales {
  if (referencia.estado === 'bloqueado' || actual.estado === 'bloqueado'
    || referencia.materiales.estado === 'no-ejecutado'
    || actual.materiales.estado === 'no-ejecutado') {
    return vacia('no-comparable')
  }
  const contextoReferencia = {
    configuracion: referencia.entrada.configuracion,
    contextoMaterial: referencia.entrada.contextoMaterial,
  }
  const contextoActual = {
    configuracion: actual.entrada.configuracion,
    contextoMaterial: actual.entrada.contextoMaterial,
  }
  if (serializarEstable(contextoReferencia) !== serializarEstable(contextoActual)) {
    return vacia('entrada-distinta')
  }
  if (referencia.materiales.estado !== 'completo' || actual.materiales.estado !== 'completo') {
    return vacia('no-comparable')
  }

  const piezasReferencia = referencia.materiales.piezas.map(piezaFisica)
  const piezasActuales = actual.materiales.piezas.map(piezaFisica)
  const multiReferencia = multiconjunto(piezasReferencia)
  const multiActual = multiconjunto(piezasActuales)
  const faltantesEnActual = diferencia(multiReferencia, multiActual)
  const sobrantesEnActual = diferencia(multiActual, multiReferencia)
  if (!faltantesEnActual.length && !sobrantesEnActual.length) return vacia('igual-parcial')
  return {
    estado: 'diferente',
    faltantesEnActual,
    sobrantesEnActual,
    cambios: cambiosConcretos(faltantesEnActual, sobrantesEnActual),
    camposExcluidos: CAMPOS_EXCLUIDOS_COMPARACION,
    advertencia: ADVERTENCIA,
  }
}
