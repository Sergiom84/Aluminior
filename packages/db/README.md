# @aluminior/db

Esquema Drizzle, migraciones y acceso PostgreSQL. El estado del proyecto está
en [ESTADO-ACTUAL.md](../../docs/ESTADO-ACTUAL.md).

## PostgreSQL local en Mac con Docker

El contenedor de [docker-compose.yml](docker-compose.yml) usa PostgreSQL 16,
escucha en `127.0.0.1:55433` y guarda datos en `tmpfs`.
Los datos se pierden al detener/recrear el contenedor: no es almacenamiento
persistente para datos reales.

Desde la raíz del repositorio:

```bash
docker compose -f packages/db/docker-compose.yml up -d
docker compose -f packages/db/docker-compose.yml down
```

La base inicial es `aluminior_test`. Usuario y contraseña sintéticos:
`aluminior`. URL local:
`postgres://aluminior:aluminior@localhost:55433/aluminior_test`.

## Bases de pruebas separadas

| Suite | Destino habitual | Preparación |
|---|---|---|
| DB y persistencia web | `aluminior_test` | Migraciones reales; destino local validado |
| ETL de tarifa | `aluminior_etl_test` | Tablas mínimas que el test borra y recrea |
| Motor de catálogo, relleno y degradación | Bases efímeras propias según cada suite | Fixtures sintéticos y preparación aislada |

El compose crea únicamente la base inicial. Si falta la base exclusiva del
test de tarifa, créala dentro del contenedor desechable:

```bash
docker exec aluminior_pg_test createdb -U aluminior aluminior_etl_test
```

No fuerces un único `TEST_DATABASE_URL` para todos los paquetes. En particular,
el test de tarifa contiene `DROP TABLE` y no puede compartir el catálogo
migrado de web. Nunca apuntes una suite de escritura a Supabase o a datos reales.
Las comprobaciones de destino no son idénticas en todas las suites; revisa
la prueba antes de cambiar sus variables de conexión.

```bash
npm run -w @aluminior/etl test
npm run -w @aluminior/web test
npm run test
```

Las pruebas web de persistencia aplican las migraciones Drizzle y validan
rollback, copia y restricciones. Un catálogo real cargado en una sesión
anterior no se presupone disponible en este entorno efímero.

## Migraciones

El journal versionado llega a `0025_plantilla_formula_seleccion` (26 entradas).
`0022_catalogo_diseno` corresponde al catálogo visual;
`0023_motor_catalogo`, a las once tablas del motor económico;
`0024`, a sus permisos y RLS; `0025`, a `formula_seleccion` (`OPCformulaSelec`) de la
plantilla, que exige el compacto: sin esa columna la web sigue por la vía anterior.
El estado de producción se consulta por separado.

`npm run db:generate` genera SQL; `npm run db:migrate` aplica migraciones
utilizando `DATABASE_URL`. Revisa el destino antes de ejecutar.
Las migraciones o cargas remotas necesitan alcance explícito, revisión del SQL,
respaldo y verificación reversible; los comandos locales de pruebas no las autorizan.
