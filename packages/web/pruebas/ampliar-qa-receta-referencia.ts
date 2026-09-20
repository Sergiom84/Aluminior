import { crearDb } from '@aluminior/db'
import { urlDePruebasValidada } from '@aluminior/db/pruebas'
import { ampliarCatalogoReferenciaJ04 } from '../app/dashboard/presupuestos/_lib/cerramientos/catalogo-j04.fixture.ts'

function urlQaValidada(valor: string | undefined): string {
  const segura = urlDePruebasValidada(valor)
  const nombre = new URL(segura.replace(/^postgres(ql)?:/, 'http:')).pathname.replace(/^\//, '')
  if (nombre !== 'aluminior_qa_test') throw new Error(`Se esperaba aluminior_qa_test; se recibió ${nombre}`)
  return segura
}

async function main() {
  const db = crearDb(urlQaValidada(process.env.TEST_DATABASE_URL))
  try {
    await db.transaction(async (tx) => ampliarCatalogoReferenciaJ04(tx))
    process.stdout.write('Catálogo sintético de la receta de referencia preparado.\n')
  } finally {
    await db.$client.end()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
