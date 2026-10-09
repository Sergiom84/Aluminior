import { urlDePruebasValidada, URL_POSTGRES_EFIMERO } from '@aluminior/db/pruebas'

/** Nunca cargar .env ni aceptar una BD comercial como destino del navegador. */
export function entornoE2e() {
  const origen = urlDePruebasValidada(process.env.TEST_DATABASE_URL ?? URL_POSTGRES_EFIMERO)
  const url = new URL(origen)
  // crearDb habilita TLS salvo hostname localhost.
  if (url.hostname !== 'localhost') throw new Error('E2E requiere localhost')
  url.pathname = '/aluminior_e2e_test'
  return { origen, destino: url.toString() }
}
