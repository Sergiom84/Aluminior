import test from 'node:test'
import assert from 'node:assert/strict'
import {
  compararMateriales,
  ejecutarDiagnosticoMotor,
  type ArticuloMaterialPreparado,
  type ComponentePreparado,
  type ContextoPrecioPreparado,
  type DeclaracionesPendientes,
  type EntradaDiagnosticoMotor,
  type ReglaRebajePreparada,
  type ResultadoDiagnosticoMotor,
} from './lib/banco-motor/index.ts'

const plantillaBase: readonly ComponentePreparado[] = [
  {
    articuloCodigo: 'PERFIL-FICTICIO', cantidad: 2, formulaLargo: 'A - 100',
    tipoCorte: '45', anguloIzquierdo: 45, anguloDerecho: 45, funcion: 'MARCO',
    medidaMinima: null, medidaMaxima: null,
  },
  {
    articuloCodigo: 'ACCESORIO-FICTICIO', cantidad: 3, formulaLargo: null,
    tipoCorte: null, anguloIzquierdo: null, anguloDerecho: null, funcion: 'ACC',
    medidaMinima: null, medidaMaxima: null,
  },
]

const articulosBase: readonly ArticuloMaterialPreparado[] = [
  { codigo: 'PERFIL-FICTICIO', tipoMetraje: 'ML', metrajeMinimo: 2, metrajeMultiploLargo: 0.5 },
  { codigo: 'ACCESORIO-FICTICIO', tipoMetraje: 'UD', metrajeMinimo: null, metrajeMultiploLargo: null },
]

const precioBase: ContextoPrecioPreparado = {
  tarifaId: 'T-FICTICIA',
  fechaReferencia: '2026-09-19',
  vigencia: { desde: '2026-01-01', hasta: '2026-12-31' },
  modo: 'despiece',
  acabadoAplicado: 'BLA',
  filasPvp: [
    { articuloCodigo: 'PERFIL-FICTICIO', tarifaId: 'T-FICTICIA', acabadoCodigo: 'BLA', precio: '10' },
    { articuloCodigo: 'ACCESORIO-FICTICIO', tarifaId: 'T-FICTICIA', acabadoCodigo: 'BLA', precio: '2' },
  ],
}

interface VariantesEntrada {
  readonly plantilla?: readonly ComponentePreparado[]
  readonly articulos?: readonly ArticuloMaterialPreparado[]
  readonly rebajes?: readonly ReglaRebajePreparada[]
  readonly cotas?: Readonly<Record<string, number>>
  readonly declaraciones?: Partial<DeclaracionesPendientes>
  readonly precio?: ContextoPrecioPreparado | false
  readonly ancho?: number
  readonly cantidadComercial?: number
  readonly ajustes?: EntradaDiagnosticoMotor['configuracion']['ajustes']
}

function entrada(variantes: VariantesEntrada = {}): EntradaDiagnosticoMotor {
  return {
    configuracion: {
      codigo: 'ESTRUCTURA-FICTICIA',
      series: ['SERIE-FICTICIA', null, null, null],
      acabados: ['BLA', null],
      medidasMm: { ancho: variantes.ancho ?? 1000, alto: 500 },
      cantidadComercial: variantes.cantidadComercial ?? 2,
      opciones: { opcionFicticia: false },
      acristalamiento: { codigo: null },
      ajustes: variantes.ajustes ?? { horasFabricacion: null, horasInstalacion: null, precioManual: null },
    },
    contextoMaterial: {
      alcance: 'materiales-parciales',
      serieResuelta: 'SERIE-FICTICIA',
      plantilla: variantes.plantilla ?? plantillaBase,
      cotas: variantes.cotas ?? {},
      articulos: variantes.articulos ?? articulosBase,
      rebajes: variantes.rebajes ?? [],
      procedencias: ['fixture sintético banco-motor'],
    },
    declaraciones: {
      disenoEspecificoNoReconstruido: false,
      herrajeDesconocido: false,
      vidrioOSuperficieRequerido: false,
      ajustesManualesPresentes: false,
      ...variantes.declaraciones,
    },
    ...(variantes.precio === false ? {} : { contextoPrecio: variantes.precio ?? precioBase }),
  }
}

function congelar<T>(valor: T): T {
  if (valor !== null && typeof valor === 'object') {
    for (const hijo of Object.values(valor as Record<string, unknown>)) congelar(hijo)
    Object.freeze(valor)
  }
  return valor
}

test('ejecuta cortes y valora una composición sin multiplicar cantidad comercial', () => {
  const preparada = congelar(entrada())
  const resultado = ejecutarDiagnosticoMotor(preparada)
  assert.equal(resultado.materiales.estado, 'completo')
  assert.equal(resultado.materiales.piezas[0].largoMm, 900)
  assert.equal(resultado.materiales.piezas[1].largoMm, null)
  assert.equal(resultado.precio.estado, 'completo')
  assert.equal(resultado.precio.importeMateriales, 26)
  assert.equal(resultado.entrada.configuracion.cantidadComercial, 2)
  assert.strictEqual(resultado.entrada, preparada)
  assert.strictEqual(resultado.procedencias, preparada.contextoMaterial.procedencias)
  assert.equal(Object.isFrozen(preparada), true)
  assert.equal(resultado.paridadComercialVerificada, false)
})

test('sin tarifa, precio ausente o ambiguo conserva cortes y deja importe null', () => {
  const sinContexto = ejecutarDiagnosticoMotor(entrada({ precio: false }))
  assert.equal(sinContexto.materiales.piezas[0].largoMm, 900)
  assert.equal(sinContexto.precio.estado, 'sin-contexto')
  assert.equal(sinContexto.precio.importeMateriales, null)

  const sinPrecio = ejecutarDiagnosticoMotor(entrada({ precio: { ...precioBase, filasPvp: [] } }))
  assert.equal(sinPrecio.materiales.estado, 'completo')
  assert.equal(sinPrecio.precio.estado, 'incompleto')
  assert.equal(sinPrecio.precio.importeMateriales, null)
  assert.ok(sinPrecio.precio.incidencias.some((i) => i.includes('SIN_PRECIO')))

  const ambiguo = ejecutarDiagnosticoMotor(entrada({ precio: {
    ...precioBase,
    filasPvp: [
      ...precioBase.filasPvp,
      { articuloCodigo: 'PERFIL-FICTICIO', tarifaId: 'T-FICTICIA', acabadoCodigo: 'BLA', precio: '11' },
    ],
  } }))
  assert.equal(ambiguo.precio.estado, 'incompleto')
  assert.ok(ambiguo.precio.incidencias.some((i) => i.includes('AMBIGUO')))
})

test('cota o rebaje ausente deja material incompleto y rebaje exacto modifica el corte', () => {
  const formulaCota: ComponentePreparado = {
    ...plantillaBase[0], articuloCodigo: 'PERFIL-FICTICIO', formulaLargo: 'A - X',
  }
  const cotaAusente = ejecutarDiagnosticoMotor(entrada({ plantilla: [formulaCota] }))
  assert.equal(cotaAusente.materiales.estado, 'incompleto')
  assert.deepEqual(cotaAusente.materiales.variablesFaltantes, ['X'])
  assert.equal(cotaAusente.precio.estado, 'material-incompleto')

  const hoja: ComponentePreparado = { ...plantillaBase[0], funcion: 'HV', formulaLargo: 'A' }
  const sinRebaje = ejecutarDiagnosticoMotor(entrada({ plantilla: [hoja] }))
  assert.equal(sinRebaje.materiales.estado, 'incompleto')
  assert.match(sinRebaje.materiales.incidencias[0].mensaje, /sin regla de rebaje/)

  const regla: ReglaRebajePreparada = {
    articuloCodigo: 'PERFIL-FICTICIO', funcion: 'HV', formula: 'A',
    serie: 'SERIE-FICTICIA', mm: 40, muestras: 3, totalMuestras: 3,
  }
  const exacto = ejecutarDiagnosticoMotor(entrada({ plantilla: [hoja], rebajes: [regla] }))
  assert.equal(exacto.materiales.estado, 'completo')
  assert.equal(exacto.materiales.piezas[0].largoMm, 960)
  assert.deepEqual(exacto.materiales.avisos, [])
})

test('rebaje no exacto conserva un aviso sin certificar paridad', () => {
  const hoja: ComponentePreparado = { ...plantillaBase[0], funcion: 'HH', formulaLargo: 'L' }
  const regla: ReglaRebajePreparada = {
    articuloCodigo: 'PERFIL-FICTICIO', funcion: 'HH', formula: 'L',
    serie: 'SERIE-FICTICIA', mm: 20, muestras: 4, totalMuestras: 5,
  }
  const resultado = ejecutarDiagnosticoMotor(entrada({ plantilla: [hoja], rebajes: [regla] }))
  assert.equal(resultado.materiales.piezas[0].largoMm, 480)
  assert.equal(resultado.materiales.avisos.length, 1)
  assert.match(resultado.materiales.avisos[0], /regla no exacta/)
  assert.equal(resultado.paridadComercialVerificada, false)
})

function conPiezas(
  resultado: ResultadoDiagnosticoMotor,
  piezas: ResultadoDiagnosticoMotor['materiales']['piezas'],
): ResultadoDiagnosticoMotor {
  return { ...resultado, materiales: { ...resultado.materiales, piezas } }
}

test('comparación física usa multiconjunto, multiplicidad y cambios concretos', () => {
  const base = ejecutarDiagnosticoMotor(entrada())
  const reordenado = conPiezas(base, [...base.materiales.piezas].reverse())
  assert.equal(compararMateriales(base, reordenado).estado, 'igual-parcial')

  const duplicado = conPiezas(base, [...base.materiales.piezas, base.materiales.piezas[0]])
  const diferenciaDuplicado = compararMateriales(base, duplicado)
  assert.equal(diferenciaDuplicado.estado, 'diferente')
  assert.equal(diferenciaDuplicado.sobrantesEnActual[0].multiplicidad, 1)

  const cambiado = conPiezas(base, [
    { ...base.materiales.piezas[0], cantidad: 4, largoMm: 880, anguloIzquierdo: 90 },
    base.materiales.piezas[1],
  ])
  const diferencia = compararMateriales(base, cambiado)
  assert.equal(diferencia.estado, 'diferente')
  assert.deepEqual(diferencia.cambios[0].diferencias.map((d) => d.campo),
    ['cantidad', 'largoMm', 'anguloIzquierdo'])
  assert.ok(diferencia.camposExcluidos.includes('precios'))
  assert.match(diferencia.advertencia, /no demuestra/)
})

test('cambiar sólo PVP no afecta comparación; cambiar configuración la bloquea', () => {
  const base = ejecutarDiagnosticoMotor(entrada())
  const otroPvp = ejecutarDiagnosticoMotor(entrada({ precio: {
    ...precioBase,
    filasPvp: precioBase.filasPvp.map((fila) => ({ ...fila, precio: '99' })),
  } }))
  assert.equal(compararMateriales(base, otroPvp).estado, 'igual-parcial')
  const otraConfiguracion = ejecutarDiagnosticoMotor(entrada({ ancho: 1200 }))
  assert.equal(compararMateriales(base, otraConfiguracion).estado, 'entrada-distinta')
})

test('pendientes, rangos, valores inválidos y ajustes bloquean antes de core', () => {
  const casos: EntradaDiagnosticoMotor[] = [
    entrada({ declaraciones: { disenoEspecificoNoReconstruido: true } }),
    entrada({ declaraciones: { herrajeDesconocido: true } }),
    entrada({ declaraciones: { vidrioOSuperficieRequerido: true } }),
    entrada({ declaraciones: { ajustesManualesPresentes: true } }),
    entrada({ plantilla: [{ ...plantillaBase[0], medidaMinima: 100 }] }),
    entrada({ ancho: Number.POSITIVE_INFINITY }),
    entrada({ cantidadComercial: -1 }),
    entrada({ ajustes: { horasFabricacion: null, horasInstalacion: null, precioManual: 0 } }),
  ]
  for (const caso of casos) {
    const resultado = ejecutarDiagnosticoMotor(caso)
    assert.equal(resultado.estado, 'bloqueado')
    assert.equal(resultado.materiales.estado, 'no-ejecutado')
    assert.ok(resultado.bloqueos.length > 0)
  }
})

test('UD con fórmula fallida queda incompleto, no valorado como unidad', () => {
  const ud: ComponentePreparado = {
    ...plantillaBase[1], articuloCodigo: 'ACCESORIO-FICTICIO', formulaLargo: 'X',
  }
  const resultado = ejecutarDiagnosticoMotor(entrada({ plantilla: [ud] }))
  assert.equal(resultado.materiales.estado, 'incompleto')
  assert.equal(resultado.precio.estado, 'material-incompleto')
  assert.equal(resultado.precio.importeMateriales, null)
})

test('contextos parciales o inválidos se bloquean sin lanzar', () => {
  const base = entrada()
  const tecnicos: EntradaDiagnosticoMotor[] = [
    { ...base, contextoMaterial: { ...base.contextoMaterial, cotas: undefined } } as unknown as EntradaDiagnosticoMotor,
    { ...base, contextoMaterial: { ...base.contextoMaterial, articulos: undefined } } as unknown as EntradaDiagnosticoMotor,
    { ...base, contextoMaterial: { ...base.contextoMaterial, rebajes: undefined } } as unknown as EntradaDiagnosticoMotor,
    { ...base, contextoMaterial: { ...base.contextoMaterial, plantilla: undefined } } as unknown as EntradaDiagnosticoMotor,
  ]
  for (const caso of tecnicos) assert.equal(ejecutarDiagnosticoMotor(caso).estado, 'bloqueado')

  const precioParcial = {
    ...base,
    contextoPrecio: { ...precioBase, filasPvp: undefined },
  } as unknown as EntradaDiagnosticoMotor
  const resultado = ejecutarDiagnosticoMotor(precioParcial)
  assert.equal(resultado.estado, 'parcial')
  assert.equal(resultado.materiales.estado, 'completo')
  assert.equal(resultado.precio.estado, 'contexto-invalido')
})

test('raíz y campos de plantilla mal tipados se bloquean antes de core', () => {
  const raizNula = null as unknown as EntradaDiagnosticoMotor
  const bloqueado = ejecutarDiagnosticoMotor(raizNula)
  assert.equal(bloqueado.estado, 'bloqueado')
  assert.equal(compararMateriales(bloqueado, bloqueado).estado, 'no-comparable')

  const componentesInvalidos = [
    { ...plantillaBase[0], formulaLargo: 123 },
    { ...plantillaBase[0], funcion: undefined },
    { ...plantillaBase[0], tipoCorte: 45 },
  ]
  for (const componente of componentesInvalidos) {
    const caso = entrada({
      plantilla: [componente as unknown as ComponentePreparado],
    })
    assert.equal(ejecutarDiagnosticoMotor(caso).estado, 'bloqueado')
  }
})

test('cotas reservadas ignoran mayúsculas y las claves normalizadas son únicas', () => {
  const casos: Readonly<Record<string, number>>[] = [{ a: 7 }, { l: 9 }, { fi: 1, FI: 2 }]
  for (const cotas of casos) {
    const resultado = ejecutarDiagnosticoMotor(entrada({ cotas }))
    assert.equal(resultado.estado, 'bloqueado')
  }
})

test('sintaxis léxica inválida bloquea perfiles ML y artículos UD sin lanzar', () => {
  const ml = { ...plantillaBase[0], formulaLargo: 'A@' }
  const ud = { ...plantillaBase[1], formulaLargo: 'A@' }
  assert.equal(ejecutarDiagnosticoMotor(entrada({ plantilla: [ml] })).estado, 'bloqueado')
  assert.equal(ejecutarDiagnosticoMotor(entrada({ plantilla: [ud] })).estado, 'bloqueado')
})

test('PVP decimal inválido se rechaza y cero explícito sigue siendo precio válido', () => {
  for (const precio of ['1e2', '-1', 'NaN']) {
    const contexto = {
      ...precioBase,
      filasPvp: precioBase.filasPvp.map((fila) => ({ ...fila, precio })),
    }
    const resultado = ejecutarDiagnosticoMotor(entrada({
      precio: contexto as ContextoPrecioPreparado,
    }))
    assert.equal(resultado.precio.estado, 'contexto-invalido')
  }
  const cero = ejecutarDiagnosticoMotor(entrada({ precio: {
    ...precioBase,
    filasPvp: precioBase.filasPvp.map((fila) => ({ ...fila, precio: '0' })),
  } }))
  assert.equal(cero.precio.estado, 'completo')
  assert.equal(cero.precio.importeMateriales, 0)
})

test('desbordamiento de resultados nunca expone una suma parcial válida', () => {
  const enorme = `1${'0'.repeat(308)}`
  const resultado = ejecutarDiagnosticoMotor(entrada({ precio: {
    ...precioBase,
    filasPvp: precioBase.filasPvp.map((fila) => ({ ...fila, precio: enorme })),
  } }))
  assert.equal(resultado.precio.estado, 'desbordamiento')
  assert.equal(resultado.precio.importeMateriales, null)
})

test('una entrada o un material incompleto produce comparación no comparable', () => {
  const base = ejecutarDiagnosticoMotor(entrada())
  const incompleto = ejecutarDiagnosticoMotor(entrada({
    plantilla: [{ ...plantillaBase[0], formulaLargo: 'X' }],
  }))
  assert.equal(compararMateriales(base, incompleto).estado, 'entrada-distinta')
  const mismoIncompleto = ejecutarDiagnosticoMotor(entrada({
    plantilla: [{ ...plantillaBase[0], formulaLargo: 'X' }],
  }))
  assert.equal(compararMateriales(incompleto, mismoIncompleto).estado, 'no-comparable')
})
