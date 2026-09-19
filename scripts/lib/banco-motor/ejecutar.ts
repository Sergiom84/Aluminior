import {
  calcularDespiece,
  type PiezaCortada,
} from '@aluminior/core/despiece'
import {
  resolverPvpCatalogo,
  valorarDespiece,
  type DatosArticuloPrecio,
  type LineaValorada,
} from '@aluminior/core/precios'
import type {
  EntradaDiagnosticoMotor,
  IncidenciaMaterial,
  ResultadoDiagnosticoMotor,
  ResultadoMateriales,
  ResultadoPrecio,
} from './tipos.ts'
import { validarContextoPrecio } from './validacion-precio.ts'
import { validarEntrada } from './validacion.ts'

const precioNoEjecutado = (estado: ResultadoPrecio['estado'], incidencias: readonly string[] = []): ResultadoPrecio => ({
  estado,
  importeMateriales: null,
  lineas: [],
  incidencias,
})

const materialesNoEjecutados: ResultadoMateriales = {
  estado: 'no-ejecutado',
  piezas: [],
  incidencias: [],
  avisos: [],
  variablesFaltantes: [],
}

function claveRebaje(articulo: string, funcion: string, formula: string, serie: string): string {
  return `${articulo}|${funcion}|${formula}|${serie}`
}

function resultadoSeguro(valor: number | null): boolean {
  return valor === null || (Number.isFinite(valor) && valor >= 0 && valor <= Number.MAX_SAFE_INTEGER)
}

function lineaSegura(linea: LineaValorada): boolean {
  return resultadoSeguro(linea.cantidadFacturable)
    && resultadoSeguro(linea.precioUnitario)
    && resultadoSeguro(linea.importe)
}

function materialCompleto(
  piezas: readonly PiezaCortada[],
  tipos: ReadonlyMap<string, 'ML' | 'UD'>,
): boolean {
  return piezas.every((pieza) => {
    if (pieza.largoMm !== null) {
      return Number.isFinite(pieza.largoMm) && pieza.largoMm >= 0
    }
    return tipos.get(pieza.articuloCodigo) === 'UD' && pieza.formula === null
  })
}

function incidenciasDe(piezas: readonly PiezaCortada[]): IncidenciaMaterial[] {
  return piezas.flatMap((pieza, indicePieza) => pieza.incidencia === null
    ? []
    : [{ indicePieza, articuloCodigo: pieza.articuloCodigo, mensaje: pieza.incidencia }])
}

function resolverPrecio(
  entrada: EntradaDiagnosticoMotor,
  materiales: ResultadoMateriales,
): ResultadoPrecio {
  const contexto = entrada.contextoPrecio
  if (contexto === undefined) return precioNoEjecutado('sin-contexto')

  const errores = validarContextoPrecio(contexto)
  if (errores.length) return precioNoEjecutado('contexto-invalido', errores)
  if (materiales.estado !== 'completo') return precioNoEjecutado('material-incompleto')

  const incidencias: string[] = []
  const articulos = new Map<string, DatosArticuloPrecio>()
  for (const articulo of entrada.contextoMaterial.articulos) {
    const filas = contexto.filasPvp
      .filter((fila) => fila.articuloCodigo === articulo.codigo)
      .map((fila) => ({ acabadoCodigo: fila.acabadoCodigo, precio: fila.precio }))
    const resolucion = resolverPvpCatalogo(filas, contexto.acabadoAplicado)
    if (resolucion.estado !== 'RESUELTO') {
      incidencias.push(`${articulo.codigo}: ${resolucion.estado}`)
    }
    articulos.set(articulo.codigo, {
      codigo: articulo.codigo,
      tipoMetraje: articulo.tipoMetraje,
      precio: resolucion.estado === 'RESUELTO' ? Number(resolucion.precio) : null,
      metrajeMinimo: articulo.metrajeMinimo,
      metrajeMultiploLargo: articulo.metrajeMultiploLargo,
    })
  }

  const valoracion = valorarDespiece([...materiales.piezas], articulos)
  if (!resultadoSeguro(valoracion.importe) || valoracion.lineas.some((linea) => !lineaSegura(linea))) {
    return {
      estado: 'desbordamiento',
      importeMateriales: null,
      lineas: valoracion.lineas,
      incidencias: [...incidencias, 'la valoración produjo un resultado no finito o desbordado'],
    }
  }
  const incidenciasLineas = valoracion.lineas.flatMap((linea) =>
    linea.incidencia === null ? [] : [`${linea.articuloCodigo}: ${linea.incidencia}`])
  if (!valoracion.completa) {
    return {
      estado: 'incompleto',
      importeMateriales: null,
      lineas: valoracion.lineas,
      incidencias: [...incidencias, ...incidenciasLineas],
    }
  }
  return {
    estado: 'completo',
    importeMateriales: valoracion.importe,
    lineas: valoracion.lineas,
    incidencias: [],
  }
}

export function ejecutarDiagnosticoMotor(
  entrada: EntradaDiagnosticoMotor,
): ResultadoDiagnosticoMotor {
  const bloqueos = validarEntrada(entrada)
  const procedencias = Array.isArray(entrada?.contextoMaterial?.procedencias)
    ? entrada.contextoMaterial.procedencias
    : []
  if (bloqueos.length) {
    return {
      estado: 'bloqueado',
      entrada,
      procedencias,
      alcance: 'materiales-parciales',
      bloqueos,
      materiales: materialesNoEjecutados,
      precio: precioNoEjecutado('no-ejecutado'),
      paridadComercialVerificada: false,
    }
  }

  const rebajes = new Map(entrada.contextoMaterial.rebajes.map((regla) => [
    claveRebaje(regla.articuloCodigo, regla.funcion, regla.formula, regla.serie),
    { mm: regla.mm, muestras: regla.muestras, totalMuestras: regla.totalMuestras },
  ]))
  const despiece = calcularDespiece(
    entrada.contextoMaterial.plantilla.map((componente) => ({ ...componente })),
    {
      anchoMm: entrada.configuracion.medidasMm.ancho,
      altoMm: entrada.configuracion.medidasMm.alto,
    },
    { ...entrada.contextoMaterial.cotas },
    {
      serie: entrada.contextoMaterial.serieResuelta,
      rebajeDeHoja: (clave) => rebajes.get(claveRebaje(
        clave.articuloCodigo,
        clave.funcion,
        clave.formula,
        clave.serie,
      )) ?? null,
    },
  )
  const tipos = new Map(entrada.contextoMaterial.articulos.map((articulo) => [
    articulo.codigo,
    articulo.tipoMetraje,
  ]))
  const completo = materialCompleto(despiece.piezas, tipos)
  const materiales: ResultadoMateriales = {
    estado: completo ? 'completo' : 'incompleto',
    piezas: despiece.piezas,
    incidencias: incidenciasDe(despiece.piezas),
    avisos: despiece.avisos,
    variablesFaltantes: despiece.variablesFaltantes,
  }
  const precio = resolverPrecio(entrada, materiales)
  const bloqueosPrecio = precio.estado === 'contexto-invalido' ? precio.incidencias : []
  return {
    estado: bloqueosPrecio.length ? 'parcial' : 'ejecutado',
    entrada,
    procedencias,
    alcance: 'materiales-parciales',
    bloqueos: bloqueosPrecio,
    materiales,
    precio,
    paridadComercialVerificada: false,
  }
}
