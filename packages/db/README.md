# @aluminior/db

Esquema Drizzle y migraciones del ERP. Aquí vive también el **Postgres efímero**
para desarrollo y tests locales.

## Postgres efímero (Docker) — NO es la Supabase compartida

La Supabase compartida **no es un entorno de pruebas**. Las migraciones y
operaciones de aplicación autorizadas pueden escribir en ella, pero los tests
que escriben (p. ej. los efectos del cargador de tarifa en `@aluminior/etl`)
corren contra un Postgres desechable en Docker, definido en
[`docker-compose.yml`](./docker-compose.yml).

Datos en `tmpfs` (RAM): el contenedor no persiste nada, arranca limpio siempre.
Puerto host **55433**: el 5432 lo ocupa un Postgres nativo, Supabase local usa el
rango 543xx y el 55432 está tomado por la BD de test de MindFit. El reparto de
puertos entre proyectos vive en `Learning/maps/port-map.md`.

```bash
# Levantar (desde la raíz del repo)
docker compose -f packages/db/docker-compose.yml up -d

# Parar
docker compose -f packages/db/docker-compose.yml down
```

Cadena de conexión: `postgres://aluminior:aluminior@localhost:55433/aluminior_test`

## Correr los tests de escritura del ETL

Con el contenedor levantado:

```bash
# Solo el ETL
npm run -w @aluminior/etl test

# Suite completa de workspaces (core, db, etl y web)
npm test
```

Los tests crean su propio esquema mínimo (tablas `articulos`, `articulos_pvp` y
`tarifas`) y siembran las tarifas históricas {1,2,3} en cada corrida, así que no
hace falta migrar el contenedor a mano. Para apuntar a otra BD:
`TEST_DATABASE_URL=postgres://... npm run -w @aluminior/etl test`.

## Tests de persistencia de presupuestos

`@aluminior/web` prueba la escritura de líneas contra este mismo contenedor
(`npm run -w @aluminior/web test`). A diferencia del ETL, aplica las migraciones
reales con el migrador de Drizzle en lugar de crear un esquema mínimo, porque lo
que verifica son las restricciones del esquema y el comportamiento transaccional.

Esa suite valida su destino antes de conectar: rechaza cualquier `TEST_DATABASE_URL`
que no sea local y cuya base no termine en `_test`. La regla de no usar la base
remota como sustituto del Postgres efímero está aplicada en código, no sólo aquí.

## Migraciones (contra la BD real)

Requieren alcance explícito, revisión del SQL y una verificación reversible.
Nunca se usa la base remota como sustituto del Postgres efímero de pruebas.

```bash
npm run db:generate   # genera SQL desde el esquema Drizzle
npm run db:migrate    # aplica migraciones (usa DATABASE_URL de .env)
```
