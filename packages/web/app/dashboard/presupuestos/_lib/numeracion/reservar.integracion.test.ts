/**
 * Reserva de numeración de presupuestos, contra PostgreSQL de verdad (T.71.2,
 * endurecida en T.71.4).
 *
 *   docker compose -f packages/db/docker-compose.yml up -d
 *   npm run -w @aluminior/web test
 *
 * El advisory lock y `presupuestos_identidad_uq` (T.71.1) sólo se demuestran
 * con Postgres real y dos transacciones que compiten de verdad. Las pruebas
 * de concurrencia usan `reservarNumeracionParaPruebas` (sólo de pruebas, no
 * sale de `index.ts`) para forzar la intercalación que el lock debe impedir:
 * sin ese seam, un `Promise.all` podría pasar por casualidad —las dos
 * transacciones son rápidas y no llegan a solaparse— sin haber probado nada.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { crearDb, schema } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import {
  ejecutarConNumeracion, esColisionIdentidad, MENSAJE_DESTINO_OCUPADO, reservarNumeracion,
} from './index.ts'
import { reservarNumeracionParaPruebas } from './reservar.ts'

const urlPruebas = urlDePruebasValidada(process.env.TEST_DATABASE_URL)
const NOMBRE_PRUEBA = 'PRUEBA AUTOMÁTICA NUMERACIÓN'
// Ejercicio 31 -> rango 310000-319999, aislado de las demás suites (que usan
// 900001, 999998 o `ZZ*`).
const FECHA = '2031-05-20'
const EJERCICIO = 31

type Fila = typeof schema.presupuestos.$inferInsert

describe('reserva de numeración, contra PostgreSQL', () => {
  let db: ReturnType<typeof crearDb>

  const fila = (cambios: Partial<Fila> = {}): Fila => ({
    numero: 310001, revision: 0, serie: 'A',
    fecha: FECHA, nombreLibre: NOMBRE_PRUEBA, tarifa: 1, estado: 'PENDIENTE',
    ...cambios,
  })

  const limpiar = () => db.delete(schema.presupuestos)
    .where(eq(schema.presupuestos.nombreLibre, NOMBRE_PRUEBA))

  const contarFilas = async (numero: number, serie = 'A') => {
    const filas = await db.select().from(schema.presupuestos)
      .where(and(eq(schema.presupuestos.numero, numero), eq(schema.presupuestos.serie, serie)))
    return filas.length
  }

  beforeAll(async () => { db = crearDb(urlPruebas) })
  beforeEach(limpiar)
  afterAll(async () => {
    try {
      await limpiar()
    } finally {
      await db.$client.end({ timeout: 5 })
    }
  })

  describe('número nuevo', () => {
    it('ejercicio vacío: AASSSS con secuencia 0001', async () => {
      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' }))
      expect(resultado).toEqual({ ok: true, numero: 310001, revision: 0, serie: 'A' })
    })

    it('con filas existentes: máximo + 1, es GLOBAL aunque cambien las series', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 310005, serie: 'A' }))
      await db.insert(schema.presupuestos).values(fila({ numero: 310006, serie: 'B' }))

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' }))
      // El máximo es 310006, de la serie B: la secuencia no es por serie.
      expect(resultado).toEqual({ ok: true, numero: 310007, revision: 0, serie: 'A' })
    })

    it('filtra por ejercicio, de forma AUTÓNOMA: un número fuera del rango no debe intervenir', async () => {
      // Esta prueba siembra su propia contaminación (dentro Y fuera del
      // rango de 2031) para que la mutación "quitar el filtro por ejercicio"
      // caiga aunque se ejecute SOLA, sin depender de que otra suite deje
      // datos con numero alto en la base compartida.
      await db.insert(schema.presupuestos).values(fila({ numero: 310050, serie: 'A' }))
      await db.insert(schema.presupuestos).values(fila({ numero: 999500, serie: 'A' })) // fuera de 2031

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' }))
      // Si el filtro por ejercicio fallara, el máximo sería 999500, no 310050.
      expect(resultado).toEqual({ ok: true, numero: 310051, revision: 0, serie: 'A' })
    })

    it('secuencia anual agotada (AA9999): error explícito, no salta de ejercicio', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 319999, serie: 'A' }))

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' }))
      expect(resultado).toEqual({
        ok: false,
        errores: [`Secuencia del ejercicio ${EJERCICIO} agotada (máximo 319999)`],
      })
      expect(await contarFilas(320000)).toBe(0)
    })
  })

  describe('fecha del documento', () => {
    it('formato inválido: no reserva nada', async () => {
      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: 'no-es-una-fecha', serie: 'A' }))
      expect(resultado.ok).toBe(false)
    })

    it('30 de febrero no existe: no reserva nada', async () => {
      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: '2031-02-30', serie: 'A' }))
      expect(resultado.ok).toBe(false)
    })
  })

  describe('revisión nueva', () => {
    it('máximo + 1 sobre (serie, numero)', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 310010, revision: 0, serie: 'A' }))
      await db.insert(schema.presupuestos).values(fila({ numero: 310010, revision: 1, serie: 'A' }))

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'REVISION_NUEVA', serie: 'A', numero: 310010 }))
      expect(resultado).toEqual({ ok: true, numero: 310010, revision: 2, serie: 'A' })
    })

    it('filtra por serie: el mismo número en otra serie no interfiere', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 310011, revision: 0, serie: 'A' }))
      await db.insert(schema.presupuestos).values(fila({ numero: 310011, revision: 5, serie: 'B' }))

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'REVISION_NUEVA', serie: 'A', numero: 310011 }))
      // Si el filtro por serie fallara, el máximo sería 5 (de B), no 0 (de A).
      expect(resultado).toEqual({ ok: true, numero: 310011, revision: 1, serie: 'A' })
    })
  })

  describe('manual', () => {
    it('libre: se acepta tal cual', async () => {
      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'MANUAL', serie: 'A', numero: 310020, revision: 0 }))
      expect(resultado).toEqual({ ok: true, numero: 310020, revision: 0, serie: 'A' })
    })

    it('ocupado: error explícito, nunca elige otro número', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 310021, revision: 0, serie: 'A' }))

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'MANUAL', serie: 'A', numero: 310021, revision: 0 }))
      expect(resultado).toEqual({ ok: false, errores: [MENSAJE_DESTINO_OCUPADO] })
    })

    it('mismo número/revisión en otra serie es válido', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 310022, revision: 0, serie: 'A' }))

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'MANUAL', serie: 'B', numero: 310022, revision: 0 }))
      expect(resultado).toEqual({ ok: true, numero: 310022, revision: 0, serie: 'B' })
    })
  })

  describe('concurrencia forzada: número nuevo', () => {
    it('dos reservas simultáneas con retraso tras leer el máximo dan números consecutivos', async () => {
      const numeros = await Promise.all([
        db.transaction(async (tx) => {
          const r = await reservarNumeracionParaPruebas(
            tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' }, { pausaTrasLecturaMs: 200 },
          )
          if (!r.ok) throw new Error(r.errores.join('; '))
          await tx.insert(schema.presupuestos).values(fila({ numero: r.numero, revision: 0, serie: 'A' }))
          return r.numero
        }),
        (async () => {
          // Arranca cuando la primera ya tiene el lock: fuerza que ÉSTA sea
          // la que espera, no la que lo obtiene primero por azar.
          await new Promise((resolver) => setTimeout(resolver, 40))
          return db.transaction(async (tx) => {
            const r = await reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' })
            if (!r.ok) throw new Error(r.errores.join('; '))
            await tx.insert(schema.presupuestos).values(fila({ numero: r.numero, revision: 0, serie: 'A' }))
            return r.numero
          })
        })(),
      ])

      expect(new Set(numeros).size).toBe(2)
      expect(Math.abs(numeros[0] - numeros[1])).toBe(1)
    })
  })

  describe('concurrencia forzada: revisión nueva', () => {
    it('dos copias del mismo origen con retraso dan revisiones consecutivas', async () => {
      await db.insert(schema.presupuestos).values(fila({ numero: 310030, revision: 0, serie: 'A' }))

      const revisiones = await Promise.all([
        db.transaction(async (tx) => {
          const r = await reservarNumeracionParaPruebas(
            tx, { modo: 'REVISION_NUEVA', serie: 'A', numero: 310030 }, { pausaTrasLecturaMs: 200 },
          )
          if (!r.ok) throw new Error(r.errores.join('; '))
          await tx.insert(schema.presupuestos).values(fila({ numero: 310030, revision: r.revision, serie: 'A' }))
          return r.revision
        }),
        (async () => {
          await new Promise((resolver) => setTimeout(resolver, 40))
          return db.transaction(async (tx) => {
            const r = await reservarNumeracion(tx, { modo: 'REVISION_NUEVA', serie: 'A', numero: 310030 })
            if (!r.ok) throw new Error(r.errores.join('; '))
            await tx.insert(schema.presupuestos).values(fila({ numero: 310030, revision: r.revision, serie: 'A' }))
            return r.revision
          })
        })(),
      ])

      expect(new Set(revisiones).size).toBe(2)
      expect(Math.abs(revisiones[0] - revisiones[1])).toBe(1)
      expect(await contarFilas(310030)).toBe(3) // la 0 del origen + las dos copias
    })
  })

  describe('rollback', () => {
    it('un fallo posterior a reservar numeración deshace la cabecera', async () => {
      await expect(db.transaction(async (tx) => {
        const r = await reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' })
        if (!r.ok) throw new Error(r.errores.join('; '))
        await tx.insert(schema.presupuestos).values(fila({ numero: r.numero, revision: 0, serie: 'A' }))
        throw new Error('fallo forzado posterior a la reserva')
      })).rejects.toThrow('fallo forzado posterior a la reserva')

      expect(await contarFilas(310001)).toBe(0)
    })

    it('sin una sequence consumible, el número que no llegó a persistirse puede reutilizarse', async () => {
      await expect(db.transaction(async (tx) => {
        const r = await reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' })
        if (!r.ok) throw new Error(r.errores.join('; '))
        await tx.insert(schema.presupuestos).values(fila({ numero: r.numero, revision: 0, serie: 'A' }))
        throw new Error('fallo forzado')
      })).rejects.toThrow()

      const resultado = await db.transaction((tx) =>
        reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' }))
      expect(resultado).toEqual({ ok: true, numero: 310001, revision: 0, serie: 'A' })
    })
  })

  describe('reintento automático (SQLSTATE 23505)', () => {
    it('absorbe una colisión puntual de un proceso que no respeta el lock', async () => {
      let primeraLlamada = true
      const numero = await ejecutarConNumeracion(db, async (tx) => {
        const r = await reservarNumeracion(tx, { modo: 'NUMERO_NUEVO', fecha: FECHA, serie: 'A' })
        if (!r.ok) throw new Error(r.errores.join('; '))
        if (primeraLlamada) {
          primeraLlamada = false
          // Proceso externo que NO pasa por `_lib/numeracion/`: cuela la
          // misma numeración por su cuenta, con su propia conexión.
          await db.insert(schema.presupuestos).values(fila({ numero: r.numero, revision: 0, serie: 'A' }))
        }
        await tx.insert(schema.presupuestos).values(fila({ numero: r.numero, revision: 0, serie: 'A' }))
        return r.numero
      }, { automatico: true })

      expect(numero).toBe(310002) // 310001 coló primero; el reintento recalcula sobre él
      expect(await contarFilas(310001)).toBe(1)
      expect(await contarFilas(310002)).toBe(1)
    })

    it('un destino manual no se reintenta: la colisión residual se propaga', async () => {
      let llamadas = 0
      await expect(ejecutarConNumeracion(db, async (tx) => {
        llamadas++
        const r = await reservarNumeracion(tx, { modo: 'MANUAL', serie: 'A', numero: 310040, revision: 0 })
        if (!r.ok) throw new Error(r.errores.join('; '))
        // Coincide con el precheck (todavía libre); un proceso externo lo
        // ocupa justo antes de que esta transacción llegue a insertar.
        await db.insert(schema.presupuestos).values(fila({ numero: 310040, revision: 0, serie: 'A' }))
        await tx.insert(schema.presupuestos).values(fila({ numero: 310040, revision: 0, serie: 'A' }))
      }, { automatico: false })).rejects.toMatchObject({ cause: { code: '23505', constraint_name: 'presupuestos_identidad_uq' } })

      expect(llamadas).toBe(1)
      expect(await contarFilas(310040)).toBe(1)
    })
  })

  describe('esColisionIdentidad', () => {
    it('sólo reconoce el código y la restricción exactos, no el texto del mensaje', () => {
      expect(esColisionIdentidad({ code: '23505', constraint_name: 'presupuestos_identidad_uq' })).toBe(true)
      expect(esColisionIdentidad({ code: '23505', constraint_name: 'otra_restriccion' })).toBe(false)
      expect(esColisionIdentidad({ code: '23503', constraint_name: 'presupuestos_identidad_uq' })).toBe(false)
      expect(esColisionIdentidad(new Error('duplicate key value violates unique constraint'))).toBe(false)
    })
  })
})
