# Recorrido web sintético

`npm run test:e2e` prepara una base separada `aluminior_e2e_test`, aplica las
migraciones y siembra el catálogo sintético J04. Requiere el PostgreSQL local
del proyecto (`docker compose -f packages/db/docker-compose.yml up -d`) y
`npx playwright install chromium`. `TEST_DATABASE_URL` solo admite localhost
con base `_test`; nunca lee credenciales de `.env`. El servidor recibe esa URL
validada explícitamente. Requiere permiso CREATEDB en ese Postgres de pruebas.

Playwright inicia Next en desarrollo, loopback:3020, con el acceso QA local
existente. No prueba Supabase Auth ni modifica su gate de producción. No admite
reutilizar un servidor ya abierto. No ejecutar `next build` simultáneamente:
ambos utilizan `.next`. `npm run typecheck:e2e` verifica también el harness.

Tres recorridos, escritorio 1440×900 y móvil 390×844:

- Alta y copia en los dos destinos tras perder la respuesta completa del POST;
  recarga/Enter en alta y Enter en copia, igualdad de IDs y conteos en Postgres.
- Medidas fraccionarias de GRUPO: entrada, guardado, recarga, edición sobre la
  misma línea, descarga PDF y ausencia de overflow exterior. La prueba de
  integración comprueba además las medidas suministradas al modelo PDF.
- Catálogo de estructura: consulta retenida (latencia), fallo de transporte,
  guardado bloqueado y reintento por teclado; alta individual decimal.

`route.fetch()` ejecuta el servidor y consume la respuesta antes de cortarla
para probar el caso postcommit. No se falsea un éxito ni se escribe por un
endpoint de prueba. [Referencia Playwright](https://playwright.dev/docs/api/class-route#route-fetch).

El workflow de GitHub Actions usa Postgres 16 y Node 22, sin secretos ni acceso
remoto; publica trazas de fallos y capturas de datos sintéticos durante siete
días. [Referencia CI](https://playwright.dev/docs/ci-intro).
Los registros sintéticos se conservan en la base E2E local; los nombres incluyen
fecha y proyecto, no se mezclan con suites transaccionales ni datos comerciales.
