/**
 * Comercial: clientes, clientes potenciales, obras y presupuestos.
 *
 * Decisión de modelado clave (ver PLAN.md anexo B.5 y C.1): en el sistema
 * original muchos presupuestos NO tienen cliente con ficha — llevan sólo un
 * nombre escrito a mano, o apuntan a un cliente potencial. Si el cliente fuese
 * obligatorio, la migración histórica fallaría en un porcentaje alto.
 * Por eso `presupuestos` admite cliente, potencial o simplemente un nombre.
 */

import {
  pgTable, text, integer, numeric, boolean, timestamp, date, index, uuid, check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/** Clientes. Origen: Clientes (503 filas, 35 de 236 columnas con datos). */
export const clientes = pgTable('clientes', {
  codigo: text('codigo').primaryKey(),
  nombre: text('nombre').notNull(),
  nombreComercial: text('nombre_comercial'),
  nif: text('nif'),

  direccion: text('direccion'),
  cp: text('cp'),
  poblacion: text('poblacion'),
  provincia: text('provincia'),
  pais: text('pais').notNull().default('ES'),

  personaContacto: text('persona_contacto'),
  telefono: text('telefono'),
  telefonoMovil: text('telefono_movil'),
  email: text('email'),

  /** Tarifa de precios aplicable por defecto. */
  tarifa: integer('tarifa').notNull().default(1),
  tipoIva: text('tipo_iva'),
  descuento: numeric('descuento', { precision: 5, scale: 2 }),
  descuentoFactura: numeric('descuento_factura', { precision: 5, scale: 2 }),

  /** 'Fisica' | 'Juridica' — relevante para SII/facturación. */
  personaFisicaJuridica: text('persona_fisica_juridica'),
  siiTipoIdFiscal: text('sii_tipo_id_fiscal'),

  fechaAlta: date('fecha_alta'),
  activo: boolean('activo').notNull().default(true),
}, (t) => ({
  nombreIdx: index('clientes_nombre_idx').on(t.nombre),
  nifIdx: index('clientes_nif_idx').on(t.nif),
}))

/** Clientes potenciales. Entidad separada en el original (ClientesPotenciales). */
export const clientesPotenciales = pgTable('clientes_potenciales', {
  codigo: text('codigo').primaryKey(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  email: text('email'),
  poblacion: text('poblacion'),
  observaciones: text('observaciones'),
  fechaAlta: date('fecha_alta'),
  /** Si se convierte en cliente, se enlaza aquí. */
  convertidoAClienteCodigo: text('convertido_a_cliente_codigo').references(() => clientes.codigo),
})

/** Obras del cliente. Origen: ClientesObras (1.728 filas). */
export const obras = pgTable('obras', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteCodigo: text('cliente_codigo').references(() => clientes.codigo),
  descripcion: text('descripcion').notNull(),
  direccion: text('direccion'),
}, (t) => ({
  clienteIdx: index('obras_cliente_idx').on(t.clienteCodigo),
}))

export const ESTADOS_PRESUPUESTO = [
  'PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'ANULADO',
] as const

/**
 * Presupuestos. Origen: VPresupuestos (439 filas, 51 de 156 columnas con datos).
 *
 * El número sigue el patrón AASSSS (año + secuencia): 260417 = nº 417 de 2026.
 * `revision` permite versionar un mismo presupuesto sin perder el histórico.
 */
export const presupuestos = pgTable('presupuestos', {
  id: uuid('id').primaryKey().defaultRandom(),

  numero: integer('numero').notNull(),
  revision: integer('revision').notNull().default(0),
  serie: text('serie').notNull().default('A'),
  fecha: date('fecha').notNull(),

  // --- Destinatario: cliente, potencial, o sólo un nombre suelto ---
  clienteCodigo: text('cliente_codigo').references(() => clientes.codigo),
  potencialCodigo: text('potencial_codigo').references(() => clientesPotenciales.codigo),
  /** Nombre libre, para el caso frecuente de presupuesto sin ficha. */
  nombreLibre: text('nombre_libre'),

  obraId: uuid('obra_id').references(() => obras.id),
  /** Texto de obra tal cual venía en el original, cuando no hay ficha de obra. */
  obraTexto: text('obra_texto'),

  referenciaInterna: text('referencia_interna'),
  nombreVersion: text('nombre_version'),

  tarifa: integer('tarifa').notNull().default(1),
  bloqueoPrecios: boolean('bloqueo_precios').notNull().default(false),

  estado: text('estado').notNull().default('PENDIENTE'),

  // --- Importes. Se recalculan desde las líneas; se guardan por trazabilidad. ---
  subtotal: numeric('subtotal', { precision: 14, scale: 2 }).notNull().default('0'),
  descuento: numeric('descuento', { precision: 5, scale: 2 }).notNull().default('0'),
  descuentoPp: numeric('descuento_pp', { precision: 5, scale: 2 }).notNull().default('0'),
  baseImponible: numeric('base_imponible', { precision: 14, scale: 2 }).notNull().default('0'),
  tipoIva: numeric('tipo_iva', { precision: 5, scale: 2 }).notNull().default('21'),
  cuotaIva: numeric('cuota_iva', { precision: 14, scale: 2 }).notNull().default('0'),
  recargoEquivalencia: numeric('recargo_equivalencia', { precision: 5, scale: 2 }),
  retencion: numeric('retencion', { precision: 5, scale: 2 }),
  total: numeric('total', { precision: 14, scale: 2 }).notNull().default('0'),
  divisa: text('divisa').notNull().default('EUR'),

  formaPago: text('forma_pago'),
  observaciones: text('observaciones'),

  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  creadoPor: text('creado_por'),
}, (t) => ({
  numeroIdx: index('presupuestos_numero_idx').on(t.numero, t.revision),
  clienteIdx: index('presupuestos_cliente_idx').on(t.clienteCodigo),
  fechaIdx: index('presupuestos_fecha_idx').on(t.fecha),
  // Al menos una forma de identificar al destinatario.
  destinatario: check(
    'presupuestos_destinatario_check',
    sql`${t.clienteCodigo} IS NOT NULL OR ${t.potencialCodigo} IS NOT NULL OR ${t.nombreLibre} IS NOT NULL`,
  ),
}))
