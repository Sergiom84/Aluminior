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

## Recorrido web con datos sintéticos

La base `aluminior_audit_test` está separada de las suites. Para prepararla por
primera vez, con el contenedor anterior en marcha:

```bash
docker exec aluminior_pg_test createdb -U aluminior aluminior_audit_test
npx tsx packages/web/pruebas/preparar-auditoria-local.ts
DATABASE_URL='postgres://aluminior:aluminior@localhost:55433/aluminior_audit_test' ALUMINIOR_QA_AUTH_BYPASS=1 npm run -w @aluminior/web dev -- --hostname 127.0.0.1 --port 3005
```

El preparador aplica las migraciones existentes, reutiliza el catálogo de
pruebas J04 y comprueba sus importes antes de confirmar la siembra. Su destino
es fijo; no carga `.env`, no borra datos y rechaza una base ya poblada. El acceso
QA solo se activa en desarrollo y en loopback.

Caso valorable: tarifa 1, modelo `0`, 1200 × 800 mm, serie `QA-J04-S`, acabado
`QA-J04-L`, vidrio `QA-J04-V` y acristalamiento sencillo. Sin horas, el precio
sintético es 76,84 €; sin vidrio conserva importe nulo. `MO` y `MOCOL` se valoran
a 0,50 €/minuto. Permite ensayar alta, edición, copia, recarga y PDF sin datos
comerciales. Utiliza la vía anterior de valoración: no acredita el motor de
catálogo completo, precios del taller ni aceptación en producción.

## Migraciones

El journal de la rama A3 llega a `0029_operaciones_presupuesto` (30 entradas;
verificado sólo en bases locales nuevas el 09/10/2026). Tabla de recibos con
RLS y PK por actor/clave; no modifica documentos. Aplicación remota pendiente:
ver [plan A3](../../docs/paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md).
El estado remoto anterior informado llega a 0028, no se volvió a consultar.
`0022_catalogo_diseno` corresponde al catálogo visual;
`0023_motor_catalogo`, a las once tablas del motor económico;
`0024`, a sus permisos y RLS; `0025`, a `formula_seleccion` (`OPCformulaSelec`) de la
plantilla, que exige el compacto; `0026`, a la categoría de MO y a la tabla de motor
`estructura_parametros_despiece` (TipoPerf). Sin ellas la web sigue por la vía anterior.
`0027_presupuesto_gastos_comision` añade los gastos de comisión de cabecera y
`0028_medidas_nuevas_ventanas`, la preferencia de medidas al insertar ventanas.
El estado de producción se consulta por separado.

`npm run db:generate` genera SQL; `npm run db:migrate` aplica migraciones
utilizando `DATABASE_URL`. Revisa el destino antes de ejecutar.
Las migraciones o cargas remotas necesitan alcance explícito, revisión del SQL,
respaldo y verificación reversible; los comandos locales de pruebas no las autorizan.
