import express from 'express'
import { sql } from 'drizzle-orm'
import { crearDb } from '@aluminior/db'

const app = express()
const port = Number(process.env.PORT) || 3000

app.get('/health', async (_req, res) => {
  try {
    const db = crearDb()
    await db.execute(sql`select 1`)
    res.json({ status: 'ok', db: 'ok' })
  } catch (error) {
    res.status(503).json({ status: 'error', db: 'unreachable', message: (error as Error).message })
  }
})

app.listen(port, () => {
  console.log(`API escuchando en el puerto ${port}`)
})
