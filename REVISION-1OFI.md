# Revisión de integración 1OFI

> Revisión documental 20/09/2026: **Auditoría histórica**. Resultados del tramo concreto, no aceptación de todas las estructuras.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Fecha: 2026-09-19
Rama revisada: `codex/1ofi-geometria`
Último commit funcional revisado: `b3f969b1676fd1a46422bd7e0edcf3314ffc18f7`
Cierre transaccional documentado: `e3cf50229280042700bd10d3067512e6689e3708`
Base y ascendencia comprobadas: `bde6a5f` -> `d086021` -> `7741dd6` ->
`b3f969b` -> `47d2315` -> `e3cf502`.

## Veredicto

**Integrado localmente en `feat/cerramientos-editor-linea` por avance rápido hasta
`51e7b75`; no se ha hecho push ni merge a `main`.** Tras las correcciones y la
verificación de flujo completo descritas abajo no queda un defecto concreto
conocido en el alcance revisado. La prueba PostgreSQL real de escritura atómica,
invalidación y rollback se ejecutó contra el contenedor efímero local y aprobó
sus 11 casos.

No se declara paridad económica ni de fabricación.

## Verificación posterior a la integración

Se ejecutó el flujo real de Aluminior contra PostgreSQL 16 efímero local, con el
servidor web en modo desarrollo y bypass de autenticación limitado a loopback:

- alta de un presupuesto sintético y una línea `1OFI` de `900 x 1800 mm`;
- cambio explícito de `FIJO INFERIOR` de 300 a 400 mm y guardado;
- cierre al listado, reapertura del presupuesto y reapertura de la línea;
- conservación de `FI 400`, medidas, ubicación y miniatura;
- bloqueo económico visible en ficha y PDF: precio, base, IVA y total permanecen
  `sin valorar`, sin cero ficticio;
- PDF A4 de una página renderizado e inspeccionado, con geometría FI, aviso de
  documento incompleto y sin recortes ni solapes;
- escritorio 1440x900 y Chrome 390x844 inspeccionados. En móvil el documento no
  desborda (`scrollWidth=375`, `innerWidth=390`), el editor se adapta y FI 400 es
  alcanzable por teclado con foco visible.

La comprobación directa de la fila persistida confirmó configuración y snapshot
de entrada v2, estructura `1OFI`, `fiMm=400`, ancho 900, alto 1800,
`valoracion_completa=false`, precio y total nulos, y cero filas residuales de
resultado, despiece y mano de obra.

Este QA no valida catálogo real, `GMA65OPT`, vidrio `L33I`, despiece, precio ni
fabricación: la base efímera carece de ese catálogo y el bloqueo de valoración es
el comportamiento esperado. Tampoco sustituye una nueva comparación visual lado
a lado con Productor; usa como referencia la evidencia Productor ya documentada.

## Hallazgo corregido

### Miniatura web de la línea ignoraba FI persistido

`LineaPresupuesto` obtenía el módulo persistido, pero llamaba a
`DibujoEstructura` sin pasarlo. Por ello la miniatura de una línea `1OFI` con
FI explícito seguía usando el reparto visual legado, mientras el editor y el PDF
usaban la geometría resuelta.

Corrección: pasar el `modulo` real al renderer y cubrir el consumidor con una
prueba que verifica el eje de `900 x 1800 / FI 400` en la caja compacta.

## Revisión de los criterios prioritarios

1. Las configuraciones v1 se aceptan sin mutación ni default oculto; editar ancho,
   alto u otros campos conserva versión 1 y ausencia de FI. Su renderer mantiene
   expresamente el reparto legado.
2. `fiMm` pertenece al módulo. Las altas y selecciones nuevas de `1OFI` usan
   300 mm; editar FI convierte de forma explícita a v2. Los módulos conservan
   valores independientes.
3. La validación de servidor parte del JSON recibido y rechaza ausencia inválida
   en v2, `null`, cadenas, no finitos y `FI <= 0` o `FI >= altoMm`, sin coerción.
4. Web y PDF consumen `distribuirModuloCerramiento`; el separador se centra sobre
   el eje físico y el grosor visual no altera la referencia exterior-a-eje.
5. La identidad PDF incluye versión y presencia/valor de FI. Además, los
   resultados valorados con FI explícito son rechazados como incompatibles.
6. Alta y edición con FI omiten el motor, escriben precio y total nulos, marcan
   valoración incompleta y eliminan snapshot, despiece y mano de obra anteriores.
   No se observó cero ficticio.
7. La actualización de línea, configuración, resultados y totales comparte el
   límite transaccional existente. La prueba PostgreSQL real confirmó el rollback
   conjunto ante fallos posteriores a la escritura de satélites.
8. Las pruebas sin DB cubren regresiones de manos/manillas, valoración, copias,
   descuentos e importes. La edición de líneas con descuentos o PVP manual sigue
   bloqueada antes de escribir, como antes del cambio.
9. El resolver y el adaptador geométrico son módulos pequeños y puros; los casos
   de uso y renderers mantienen responsabilidades separadas. No se añadieron
   migraciones ni lógica de despiece/valoración FI.

## Verificación ejecutada

- Estado limpio inicial, rama y ascendencia: correctos.
- Core focalizado: 44 pruebas aprobadas (`geometria-1ofi`, configuración y
  adaptador de representación).
- Web sin PostgreSQL: 439 pruebas aprobadas en 63 ficheros. Se excluyeron las
  suites `*.integracion` y `galce-vidrio.test.ts`, que conecta a PostgreSQL aunque
  su nombre no lo indica.
- Typecheck de `@aluminior/core`: aprobado.
- Typecheck de `@aluminior/web`: aprobado tras retirar la salida temporal `.next`.
- `git diff --check`: aprobado (sólo aviso de normalización LF/CRLF de Git).
- QA PDF sintético, renderizado a PNG y revisado visualmente: páginas para
  `900 x 1500 / FI 300`, `900 x 1800 / FI 300`, `900 x 1800 / FI 400` y dos
  módulos `FI 300 / FI 400`; sin recortes ni solapes, con ejes distintos y
  coherentes. Los artefactos temporales fueron eliminados.
- QA del componente real: escritorio 1440x900 y móvil 390x844. El dibujo no se
  desborda; el catálogo conserva su scroll horizontal. Es QA de componente, no
  del flujo integrado con persistencia.

## Pendientes y bloqueos de la primera revisión

- `docker` no está instalado o no está disponible en `PATH`. El procedimiento
  documentado sí es seguro y aislado (`packages/db/docker-compose.yml`, Postgres
  16 en `localhost:55433`, base `aluminior_test`, almacenamiento `tmpfs`), pero no
  pudo iniciarse sin instalar o reparar componentes del sistema.
- Por lo anterior no se ejecutaron `linea-valorada.integracion.test.ts` ni la
  comprobación transaccional real de rollback. El intento de iniciar la suite
  confirmó `ECONNREFUSED` en `::1/127.0.0.1:55433`; no se usó Supabase ni otra DB.
- No se realizó QA de flujo completo alta/edición/reapertura porque requiere la
  base local. La lectura y representación se verificaron con fixtures sintéticos.

Para levantar el único bloqueo: disponer de Docker, ejecutar
`docker compose -f packages/db/docker-compose.yml up -d`, verificar de nuevo que
`TEST_DATABASE_URL` es `postgres://aluminior:aluminior@localhost:55433/aluminior_test`
y correr al menos la suite de integración de `linea-valorada`.

## Continuación: disponibilidad del PostgreSQL transaccional real

Comprobación realizada desde `b3f969b1676fd1a46422bd7e0edcf3314ffc18f7`,
sin repetir la conexión ya fallida a `localhost:55433`:

- La única topología local soportada por la documentación y los scripts es el
  contenedor de `packages/db/docker-compose.yml`: PostgreSQL 16, host loopback,
  puerto 55433, base `aluminior_test` y datos en `tmpfs`.
- `packages/db/pruebas/entorno-local.mjs` impide usar destinos distintos de
  `localhost:55433` y de las bases permitidas terminadas en `_test`.
- No hay `psql`, `pg_ctl`, `initdb`, `postgres`, `createdb` ni `dropdb` en
  `PATH`, ni instalación bajo las ubicaciones habituales de Windows.
- No hay servicio, proceso o listener PostgreSQL detectado en 5432 o 55433. La
  referencia del README a un PostgreSQL nativo en 5432 no coincide con el estado
  actual de esta máquina.
- WSL no está instalado. Tampoco están disponibles Docker, Podman o Nerdctl.
- No existe `TEST_DATABASE_URL`, `ALUMINIOR_TEST_DB_URL`, configuración J00 ni
  fichero `.env` local que apunte a otro PostgreSQL de pruebas.

Por tanto, **no existe actualmente una alternativa local ya instalada,
configurada y aislada** que permita ejecutar la prueba sin instalar o reparar
componentes del sistema. No se inició ningún servicio, no se aplicaron
migraciones y no se contactó con Supabase ni con una base remota.

La suite pertinente es:

```powershell
$env:TEST_DATABASE_URL = 'postgres://aluminior:aluminior@localhost:55433/aluminior_test'
npm run -w @aluminior/web test -- app/dashboard/presupuestos/_lib/cerramientos/linea-valorada.integracion.test.ts
```

Sus casos cubren la conservación de FI, la eliminación de precio, total,
snapshot, despiece y mano de obra anteriores, el recálculo de totales dentro de
la transacción, un rollback provocado después de escribir satélites y el flujo
v1 valorado usado como origen y regresión. La suite no se ejecutó en esta
continuación porque el servidor requerido no existe.

### Única propuesta para preparar el entorno

Instalar y dejar operativo Docker Desktop (motor y CLI), y después levantar
exclusivamente el compose efímero versionado con:

```powershell
docker compose -f packages/db/docker-compose.yml up -d
```

Antes de ejecutar la suite se debe comprobar que el contenedor publicado es
`aluminior_pg_test`, que escucha sólo mediante el mapeo local `55433:5432` y que
la URL validada termina en `/aluminior_test`. Esta instalación o cambio de
servicio del sistema requiere aprobación explícita y no se realizó.

## Cierre de la prueba transaccional real

Tras quedar Docker Engine disponible, se comprobó primero la configuración
resuelta del compose. Se detectó que `"55433:5432"` publicaba PostgreSQL en todas
las interfaces pese a que la documentación lo describía como local. Se corrigió
el mapeo a `"127.0.0.1:55433:5432"` antes de iniciar el contenedor.

Destino acreditado antes de migrar o probar:

- contenedor: `aluminior_pg_test`;
- imagen: `postgres:16-alpine`;
- estado: saludable;
- listener: `127.0.0.1:55433` exclusivamente;
- base: `aluminior_test`;
- usuario: `aluminior`;
- directorio de datos: `/var/lib/postgresql/data` sobre `tmpfs`.

Comando ejecutado desde `packages/web`:

```powershell
$env:TEST_DATABASE_URL = 'postgres://aluminior:aluminior@localhost:55433/aluminior_test'
npx vitest run linea-valorada.integracion.test.ts
```

Resultado: **1 fichero y 11 pruebas aprobadas**. La URL usa `localhost` de forma
intencionada porque `crearDb` reconoce esa forma canónica y desactiva TLS para el
PostgreSQL local; el listener continúa limitado a IPv4 loopback.

Quedaron demostrados en PostgreSQL real:

- guardado y recuperación de la configuración con FI explícito;
- invalidación conjunta de precio, total, snapshot, despiece y mano de obra;
- recálculo de totales dentro de la misma transacción;
- rollback de configuración e invalidaciones ante un fallo posterior provocado;
- rollback tras escribir configuración, snapshot y despiece cuando falla la mano
  de obra;
- rechazo del escritor heredado si dejaría snapshot y geometría contradictorios;
- continuidad de los casos v1 valorados, cantidades, mano de obra, copias,
  descuentos y estados incompletos.

Comprobación posterior directa:

- `presupuestos_j05=0`;
- `restriccion_j05=0`;
- 22 migraciones registradas en la base efímera.

La prueba no dejó fixtures ni la restricción temporal usada para provocar el
fallo. No se contactó con Supabase ni con ninguna base remota. La conclusión de
esta revisión pasa de pendiente a apta para integrar, sin declarar paridad
económica ni de fabricación.
