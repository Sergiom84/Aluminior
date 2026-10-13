import { readFileSync } from 'node:fs'
import { afterAll, expect, it } from 'vitest'
import postgres from 'postgres'
import { urlDePruebasValidada } from './pruebas.ts'

const sql = postgres(urlDePruebasValidada(process.env.TEST_DATABASE_URL), { prepare: false })
afterAll(() => sql.end())

it('0030 amplía enteros y nulos sin pérdida, y conserva la fracción enviada', async () => {
  // Una tabla temporal oculta public.lineas solo para esta conexión/transacción.
  // Se ejecuta el SQL real sin reescribirlo y se elimina al confirmar.
  await sql.begin(async tx => {
    await tx`create temporary table lineas (ancho_mm integer, alto_mm integer) on commit drop`
    await tx`insert into lineas values (2147483647, null), (970, 439)`
    const antes = await tx`select * from lineas order by ancho_mm`
    const migracion = readFileSync(new URL('../migrations/0030_medidas_exteriores_decimales.sql', import.meta.url), 'utf8')
    for (const sentencia of migracion.split('--> statement-breakpoint')) await tx.unsafe(sentencia)
    expect(await tx`select * from lineas order by ancho_mm`).toEqual(antes)
    await tx`insert into lineas values (${970.25}, ${439.5}), (${1000 / 3}, ${1999.5})`
    const filas = await tx`select * from lineas where alto_mm in (439.5, 1999.5) order by alto_mm`
    expect(filas).toEqual([{ ancho_mm: 970.25, alto_mm: 439.5 }, { ancho_mm: 1000 / 3, alto_mm: 1999.5 }])
  })
})
