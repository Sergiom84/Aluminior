/** Datos sintéticos P.2: sin BD, catálogo comercial ni motor de valoración. */
import { medidasCerramiento, type ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import type { DatosPresupuestoPdf, LineaPdf } from '../../app/dashboard/presupuestos/[id]/pdf/tipos'

export interface CasoPdf {
  nombre: string
  minPaginas: number
  datos: DatosPresupuestoPdf
}

const etiqueta = (orden: number) => `L${String(orden).padStart(3, '0')}`
const dinero = (centimos: number) => (centimos / 100).toFixed(2)
const centimos = (importe: string | null) => Math.round(Number(importe ?? 0) * 100)
const textos = (prefijo: string, cantidad: number, frase: string) =>
  Array.from({ length: cantidad }, (_, i) => `${prefijo}${String(i).padStart(3, '0')} ${frase}`).join(' ')

function simple(anchoMm: number, altoMm: number, estructuraCodigo = '0'): ConfiguracionCerramiento {
  return { version: 1, modulos: [{ id: 'M1', estructuraCodigo, anchoMm, altoMm }], uniones: [] }
}

function linea(orden: number, dibujo = true, configuracion?: ConfiguracionCerramiento): LineaPdf {
  const cantidad = orden % 3 + 1
  const material = 10000 + orden * 137
  const fabricacion = 200 + orden * 17
  const colocacion = 500 + orden * 23
  const config = configuracion ?? simple(1200 + orden, 800 + orden, orden % 2 ? '2O' : '0')
  const medidas = medidasCerramiento(config)
  return {
    id: etiqueta(orden), orden, tipo: dibujo ? 'CERRAMIENTO' : 'ARTICULO',
    descripcion: `${etiqueta(orden)}INI ${dibujo ? 'GRUPO' : 'Articulo'} de prueba. ` +
      `Acabado blanco y vidrio transparente. ${etiqueta(orden)}FIN`,
    referencia: `U${String(orden).padStart(3, '0')}`,
    anchoMm: dibujo ? medidas.anchoMm : null, altoMm: dibujo ? medidas.altoMm : null,
    cantidad: String(cantidad), precioUnitario: dinero(material),
    total: dinero(material * cantidad + (dibujo ? fabricacion + colocacion : 0)),
    valoracionCompleta: true, avisoValoracion: dibujo ? 'Prueba tecnica sintetica' : null,
    cerramiento: dibujo ? { configuracion: config, estadoSnapshot: 'con-snapshot', manoObra: [
      { concepto: 'FABRICACION_ADICIONAL', horas: (0.25 + orden / 100).toFixed(2),
        importe: dinero(fabricacion), valoracionCompleta: true },
      { concepto: 'COLOCACION', horas: (0.5 + orden / 100).toFixed(2),
        importe: dinero(colocacion), valoracionCompleta: true },
    ] } : null,
  }
}

/** Sumas en céntimos de importes inventados; nunca predice precios Productor. */
function documento(numero: number, lineas: LineaPdf[]): DatosPresupuestoPdf {
  const base = lineas.reduce((suma, l) => suma + centimos(l.total), 0)
  const iva = Math.round(base * 21 / 100)
  return {
    id: `P${numero}`, serie: 'QA', numero, revision: 2, fecha: '2026-10-09', estado: 'PENDIENTE',
    destinatario: `H${String(numero - 990000).padStart(3, '0')} PRUEBA PDF`,
    obra: 'OBRAINI Ensayo sintetico sin cliente real. OBRAFIN',
    formaPago: 'PAGOINI Abono de prueba. PAGOFIN',
    observaciones: 'OBSINI Documento sintetico sin validez comercial. OBSFIN',
    tarifa: 1, tipoIva: 21, baseImponible: base / 100, cuotaIva: iva / 100,
    total: (base + iva) / 100, incompleto: lineas.some(l => !l.valoracionCompleta), lineas,
  }
}

function composiciones(): LineaPdf[] {
  const bidimensional: ConfiguracionCerramiento = {
    version: 3,
    modulos: [
      { id: 'M1', estructuraCodigo: '2O', anchoMm: 1200.5, altoMm: 800.25 },
      { id: 'M2', estructuraCodigo: '0', anchoMm: 600.25, altoMm: 1400.75,
        anclaje: { moduloId: 'M1', lado: 'derecha', unionId: 'U1' } },
      { id: 'M3', estructuraCodigo: '0', anchoMm: 900.25, altoMm: 400.5,
        anclaje: { moduloId: 'M1', lado: 'abajo', unionId: 'U2' } },
    ],
    uniones: [
      { id: 'U1', codigo: 'GMU038', grosorMm: 20.25, longitudMm: 1400.75 },
      { id: 'U2', codigo: 'GMU038', grosorMm: 20.5, longitudMm: 1200.5 },
    ],
  }
  const cadena: ConfiguracionCerramiento = { version: 2, modulos: [
    { id: 'M1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800, fiMm: 300 },
    { id: 'M2', estructuraCodigo: '1OI', anchoMm: 600, altoMm: 1000 },
  ], uniones: [{ id: 'U1', codigo: 'GMU038', grosorMm: 60, longitudMm: 2400 }] }
  return [simple(100, 6000), simple(12000, 100), bidimensional, cadena]
    .map((config, i) => linea(i + 1, true, config))
}

export function casosPdfMultipagina(): CasoPdf[] {
  const largo = linea(1)
  largo.descripcion = 'L001INI ' + textos('B', 240,
    'descripcion extensa de prueba para comprobar continuidad entre paginas.') + ' L001FIN'
  const condiciones = documento(990004, [linea(1)])
  condiciones.formaPago = 'PAGOINI ' + textos('P', 85,
    'Condicion de pago sintetica completa y visible.') + ' PAGOFIN'
  condiciones.observaciones = 'OBSINI ' + textos('N', 150,
    'Nota extensa de prueba que debe conservarse sin solaparse con el pie.') + ' OBSFIN'
  const mixtas = Array.from({ length: 10 }, (_, i) => linea(i + 1, (i + 1) % 3 !== 0))
  mixtas[0] = { ...linea(1, false), precioUnitario: '0.00', total: '0.00' }
  mixtas[4] = { ...mixtas[4], precioUnitario: null, total: null, valoracionCompleta: false,
    cerramiento: { ...mixtas[4].cerramiento!, manoObra: [
      { concepto: 'FABRICACION_ADICIONAL', horas: null, importe: null, valoracionCompleta: false },
      mixtas[4].cerramiento!.manoObra[1],
    ] } }
  return [
    { nombre: 'vacio', minPaginas: 1, datos: documento(990001, []) },
    { nombre: 'multipagina', minPaginas: 2, datos: documento(990002,
      Array.from({ length: 20 }, (_, i) => linea(i + 1, (i + 1) % 4 !== 0))) },
    { nombre: 'descripcion', minPaginas: 2, datos: documento(990003, [largo, linea(2)]) },
    { nombre: 'condiciones', minPaginas: 2, datos: condiciones },
    { nombre: 'incompleto', minPaginas: 2, datos: documento(990005, mixtas) },
    { nombre: 'composiciones', minPaginas: 2, datos: documento(990006, composiciones()) },
  ]
}
