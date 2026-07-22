# @aluminior/db

Esquema Drizzle y migraciones del ERP. Aquí vive también el **Postgres efímero**
para desarrollo y tests locales.

## Postgres efímero (Docker) — NO es la Supabase compartida

La Supabase compartida es **SOLO LECTURA**. Los tests que ESCRIBEN (p. ej. los
efectos del cargador de tarifa en `@aluminior/etl`) corren contra un Postgres
desechable en Docker, definido en [`docker-compose.yml`](./docker-compose.yml).

Datos en `tmpfs` (RAM): el contenedor no persiste nada, arranca limpio siempre.
Puerto host **55432** (el host ya tiene un cluster Postgres en 5432-5434 y Supabase
local usa 54322).

```bash
# Levantar (desde la raíz del repo)
docker compose -f packages/db/docker-compose.yml up -d

# Parar
docker compose -f packages/db/docker-compose.yml down
```

Cadena de conexión: `postgres://aluminior:aluminior@localhost:55432/aluminior_test`

## Correr los tests de escritura del ETL

Con el contenedor levantado:

```bash
# Solo el ETL
npm run -w @aluminior/etl test

# Suite completa (core + etl)
npm test
```

Los tests crean su propio esquema mínimo (tablas `articulos`, `articulos_pvp` y
`tarifas`) y siembran las tarifas históricas {1,2,3} en cada corrida, así que no
hace falta migrar el contenedor a mano. Para apuntar a otra BD:
`TEST_DATABASE_URL=postgres://... npm run -w @aluminior/etl test`.

## Migraciones (contra la BD real)

```bash
npm run db:generate   # genera SQL desde el esquema Drizzle
npm run db:migrate    # aplica migraciones (usa DATABASE_URL de .env)
```
