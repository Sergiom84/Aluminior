/**
 * La tarifa como REGISTRO, no como entero suelto (G4).
 *
 * OJO CON LA PALABRA «TARIFA»: en este repositorio tiene dos usos y sólo uno
 * está aquí.
 *
 *   - `precios/tarifa.ts` valida el fichero de tarifa que manda el PROVEEDOR y
 *     protege las históricas 1/2/3 de que el cargador de ETL las machaque. Es
 *     el lado de la COMPRA.
 *   - Este módulo es el lado de la VENTA: la lista de precios con la que se
 *     valora un presupuesto.
 *
 * No son dos numeraciones distintas. La documentación oficial del fabricante
 * (docs.gaia-soft.com/docs/tarifas-de-precios-de-venta.md, consultada el
 * 06/08/2026) describe **una sola tabla de tarifas**, con un nombre descriptivo
 * y una casilla `Tarifa válida para Ventas`. Los ejemplos son del propio
 * fabricante —PARTICULARES, DISTRIBUIDORES, GRANDES SUPERFICIES, PRECIOS 2025,
 * COSTE— y dejan claro que una de esas ocho listas puede ser precisamente el
 * coste. Lo que separa venta de coste es la marca, no un concepto paralelo.
 *
 * Consecuencia práctica: no basta con leer un `int`. Sin la marca, valorar una
 * venta contra la tarifa de coste es un error silencioso que se vende a precio
 * de compra, y nadie lo ve hasta que se cierra el ejercicio.
 *
 * Funciones PURAS. La lectura de la tabla es de quien llama.
 *
 * QUÉ NO ESTÁ AQUÍ: qué tarifas usa realmente el taller y con qué nombre. Eso
 * es un dato del titular, todavía sin confirmar, y no se inventa.
 */

/**
 * Una tarifa tal y como se configura, con su identidad y sus dos marcas.
 *
 * `codigo` comparte espacio de numeración con `articulos_pvp.tarifa` y con las
 * tarifas del cargador de ETL: es la MISMA numeración, y por eso hacen falta
 * las marcas para distinguir el propósito.
 */
export interface TarifaVenta {
  codigo: number
  /** Nombre descriptivo configurable ("Tarifa 2 DISTRIBUIDORES"). */
  nombre: string
  /** La casilla `Tarifa válida para Ventas`. Sin ella no valora documentos de venta. */
  validaParaVentas: boolean
  /** Bloqueo del fabricante: la tarifa se consulta, pero no se reescribe. */
  bloqueada: boolean
}

/** Motivos por los que una tarifa no puede valorar un documento de venta. */
export type MotivoRechazoVenta = 'TARIFA_NO_VALIDA_PARA_VENTAS'

/** Motivos por los que una tarifa no admite que se le reescriban precios. */
export type MotivoRechazoActualizacion = 'TARIFA_BLOQUEADA'

export type AdmisionEnVentas =
  | { estado: 'ADMITIDA'; tarifa: TarifaVenta }
  | { estado: 'RECHAZADA'; motivo: MotivoRechazoVenta; codigo: number }

/**
 * ¿Puede esta tarifa poner precio a un documento de venta?
 *
 * Devuelve el rechazo con su motivo en lugar de un booleano pelado para que
 * quien llama no pueda tratarlo como «no hay precio» y seguir adelante: una
 * tarifa de coste usada en una venta no es una falta de dato, es un error de
 * configuración que hay que enseñar.
 */
export function admitirTarifaEnVentas(tarifa: TarifaVenta): AdmisionEnVentas {
  if (!tarifa.validaParaVentas) {
    return { estado: 'RECHAZADA', motivo: 'TARIFA_NO_VALIDA_PARA_VENTAS', codigo: tarifa.codigo }
  }
  return { estado: 'ADMITIDA', tarifa }
}

export type PermisoActualizacion =
  | { estado: 'PERMITIDA'; tarifa: TarifaVenta }
  | { estado: 'DENEGADA'; motivo: MotivoRechazoActualizacion; codigo: number }

/**
 * ¿Se pueden reescribir los precios de esta tarifa?
 *
 * El bloqueo existe para que una actualización masiva —copiar otra tarifa,
 * subir un porcentaje, recalcular desde el coste— no arrase una lista de
 * precios ya emitida a clientes. Se comprueba ANTES de calcular nada: un
 * proceso que calcula y luego decide si escribe ya ha gastado el trabajo y
 * tiende a que alguien reutilice el resultado.
 */
export function permitirActualizacionTarifa(tarifa: TarifaVenta): PermisoActualizacion {
  if (tarifa.bloqueada) {
    return { estado: 'DENEGADA', motivo: 'TARIFA_BLOQUEADA', codigo: tarifa.codigo }
  }
  return { estado: 'PERMITIDA', tarifa }
}

/**
 * Variante que revienta en vez de devolver el motivo.
 *
 * Es para el borde de un caso de uso que ya ha decidido escribir: llegar ahí
 * con una tarifa bloqueada es un fallo de programación, no un desenlace del
 * dominio, y un `throw` lo deja donde se ve. Dentro del cálculo se usa la
 * variante que devuelve resultado.
 */
export function exigirTarifaModificable(tarifa: TarifaVenta): void {
  const permiso = permitirActualizacionTarifa(tarifa)
  if (permiso.estado === 'DENEGADA') {
    throw new Error(
      `tarifa ${tarifa.codigo} (${tarifa.nombre}) está bloqueada: no admite actualización de precios`,
    )
  }
}
