/**
 * Salvaguarda compartida de las suites que ESCRIBEN en PostgreSQL.
 *
 * La base de trabajo tiene datos reales de la empresa y `packages/db/README.md`
 * prohíbe usarla como sustituto del Postgres efímero. Esta comprobación aplica
 * esa regla en código, para que no dependa de que quien ejecuta se acuerde.
 */

/** Contenedor de `docker-compose.yml`. */
export const URL_POSTGRES_EFIMERO = 'postgres://aluminior:aluminior@localhost:55433/aluminior_test'

/** Sólo Postgres local y base terminada en `_test`. Cualquier otra cosa aborta. */
export function urlDePruebasValidada(valor: string = URL_POSTGRES_EFIMERO): string {
  const url = new URL(valor.replace(/^postgres(ql)?:/, 'http:'))
  const esLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  const esDePruebas = /_test$/.test(url.pathname.replace(/^\//, ''))
  if (!esLocal || !esDePruebas) {
    throw new Error(
      'TEST_DATABASE_URL debe apuntar al Postgres efímero local y a una base ' +
      `terminada en "_test" (recibido host ${url.hostname}, base ${url.pathname}). ` +
      'Levántalo con: docker compose -f packages/db/docker-compose.yml up -d',
    )
  }
  return valor
}
