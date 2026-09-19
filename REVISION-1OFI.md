# Revisión de integración 1OFI

Fecha: 2026-09-19  
Rama revisada: `codex/1ofi-geometria`  
Commit revisado: `7741dd6f07eb66c2a727ebe56d457f8e4cf93753`  
Base y ascendencia comprobadas: `bde6a5f` -> `d086021` -> `7741dd6`.

## Veredicto

**Pendiente de integrar.** Tras la corrección descrita abajo no queda un defecto
concreto conocido en el código revisado, pero la prueba PostgreSQL real de la
escritura atómica y su rollback sigue sin poder ejecutarse. La garantía prioritaria
de atomicidad no debe darse por superada sólo con dobles o inspección estática.

No se declara paridad económica ni de fabricación.

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
   límite transaccional existente. La prueba real que demuestra rollback queda
   pendiente por falta de PostgreSQL local disponible.
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

## Pendientes y bloqueos

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
