# Integración del motor de catálogo — 02/10/2026

Revisión documental: código integrado comprobado en main `9bc879e`.
Este informe conserva ensayos del cierre del importador del 02/10/2026.
Despliegue, respaldo y estado remoto: **sin verificar directamente en esta auditoría**.
En Docker local se comprobaron el 02/10 25 migraciones, RLS en las once tablas y catálogo
vacío; la base de datos reales de aquellos ensayos no estaba presente.
Siguiente paso: [ESTADO-ACTUAL.md](../ESTADO-ACTUAL.md).

Preparada en `integracion/motor-catalogo`, desde `main` (`da6a537`) y el motor
`0ecdc9c`. Integración publicada en `main` (`a74dabc`) y desplegada en Render.
Migraciones 0023 y 0024 aplicadas en Supabase con respaldo previo y datos
existentes conservados. La carga del catálogo del motor sigue pendiente;
el motor todavía no cubre todas las combinaciones de Productor.

## Fusión y migración

- Se conserva `0022_catalogo_diseno` y su snapshot exactamente como en `main`.
  Las dos migraciones antiguas del motor quedan sustituidas por la regenerada
  `0023_motor_catalogo`: once tablas nuevas, índices y dos claves foráneas;
  sin alterar tablas existentes ni vaciar documentos.
- `when` de la 0023: **1790955411853**, posterior a **1790951000407** de la
  0022 que ya está en producción. SHA-256 del SQL:
  `5e588e93974e6d1fe8681a801368862eacbd65fc23ac34d1fd38dbda9aa793dc`.
- `plantillaDiseno` sigue definida solo en `diseno/registro.ts`. Se conservan
  las 160 estructuras y las 14 uniones incorporadas por el motor.
- `tipos_hoja_catalogo` aporta nombres técnicos para herraje y despiece;
  `tipos-hoja-catalogo.ts` resuelve el dibujo. No se sustituyen entre sí:
  los nombres heredados invierten I/D respecto a las descripciones de las
  estructuras. El tipo 44 se dibuja a la izquierda por la evidencia de 1OPI;
  el tipo 58 conserva su hipótesis pendiente, descrita en el módulo.
- El código detecta la ausencia de las tablas antes de consultarlas y utiliza
  el motor anterior. Evita errores SQL que abortarían el alta transaccional.

## Cargador dirigido

`npm run etl:motor-catalogo -- --origen export_datos/EMP0016`
simula por defecto. Solo `--apply` confirma la sustitución de las once tablas.
Reutiliza los importadores suplementarios dentro de **una única transacción**.
Comprueba CSV y tablas destino; rechaza tablas vacías, descartes y claves
duplicadas. Cuenta las filas realmente insertadas, sin ignorar conflictos.
Verifica recuentos y firmas del contenido de presupuestos, líneas, clientes,
obras, estructuras, componentes, artículos, PVP y series. La lectura repetible
evita confundir escrituras concurrentes de otros operadores con efectos del ETL.

Corregida la serialización JSON de los parámetros de conjunto para conexiones
Postgres también utilizadas por Drizzle. CLI separado del servicio, argumentos
estrictos, destino visible sin credenciales y errores sin volcar la conexión.

Ensayo con el origen local autorizado `EMP0016`, en `aluminior_real_test`:
simulación y aplicación completadas, **260.760 filas, cero descartes**.
Recuentos: referencias 14.039; descuentos 35.723; plantillas 15.263;
asociaciones 13.345; grupos 58; tipos de hoja 76; conceptos MO 116;
incrementos 146.530; artículos 17.547; ranuras vacías 3.000; parámetros 15.063.
Se excluyen instancias documentales y ranuras repetidas explícitas según los
mapeadores existentes. Catálogo base y documentos locales conservados.

## Valoración antes y después

Entradas iguales: **1200 × 1200 mm, GMC400, V420AGS4, acabado L, tarifa 1,
doble cristal, cantidad 1, sin opciones ni horas manuales**. «Antes» es la
vía anterior del mismo código contra la base local sin 0023; reproduce el
resultado conocido de `main` para C2. Piezas = filas del despiece.

| Modelo | Antes: precio | Antes: piezas / sin coste | Después: precio | Después: piezas / sin coste |
|---|---|---:|---|---:|
| C2 | Sin valorar | 30 / 22 | 255,17 € con avisos | 23 / 2 |
| 0 | Sin valorar | 9 / 5 | Sin valorar | 8 / 0 |
| 2O | Sin valorar | 37 / 33 | Sin valorar | 10 / 0 |
| PC2 | Sin valorar | 30 / 22 | 265,17 € con avisos | 24 / 2 |
| 1OFI | Sin valorar | 25 / 21 | Sin valorar | 8 / 0 |

C2 y PC2 tienen PVP de venta, pero carecen del coste de compra de dos vidrios.
Avisan del vidrio de 28 mm fuera del rango de la serie y de la junta V1000
ausente. El fijo 0 carece del descuento de vidrio MH → C. GMC400 no resuelve
los componentes y herrajes de 2O y 1OFI; 1OFI además necesita FI y reglas de MO
contrastadas. Tener cero piezas sin coste en el despiece parcial **no** significa
que la estructura esté completa. Las tres mantienen precio nulo.

Comprobados los cinco resultados en navegador (:3003), guardado y recarga.
C2 se conserva como GRUPO; los otros cuatro se ensayaron por Edición de Línea.
PDF revisado visualmente: una página, C2 con dibujo, los cinco resultados y
total «Sin valorar» por las líneas incompletas. Escritorio 1440 × 1000 y móvil
375 × 812: sin desbordamiento horizontal del documento; tabla desplazable.

No se certifica igualdad de estos precios con Productor: el banco documentado
en [el banco de comparación](BANCO-COMPARACION-PRECIOS.md) exige tarifa, vidrio y contexto verificados;
no hay casos generados y aceptados para esta prueba en la copia actual.
No se ejecutó Productor en el Mac ni se inventaron entradas pendientes.

## Pruebas y simulación de producción

`npm run test`: **core 557, db 55, etl 40 + 1 omitida, web 666**; sin fallos.
`npm run typecheck` y `npm run check:architecture`: pasan, cero infracciones.
ETL tiene diez pruebas nuevas sobre una base efímera propia, con migraciones
reales y filas sintéticas. Su preparación acredita el avance de 23 a 25
migraciones desde la 0022 ya aplicada; cubren simulación vacía/existente, aplicación repetida,
rollback temprano/tardío, duplicados, CSV ausente/vacío, alteración de contenido
protegido, ausencia del esquema del motor y denegación de lectura/escritura a un rol
de navegador con RLS, manteniendo el acceso del servidor. Ninguna usa Supabase.

Ejecutar la suite general con su configuración habitual, sin forzar un único
`TEST_DATABASE_URL` para todos los paquetes: los ensayos ETL de tarifa y relleno
emplean bases separadas para sus tablas de prueba. La prueba web de degradación
sin tablas también usa una base efímera propia: eliminar tablas en la base
compartida provocaba interferencias de bloqueo con otras suites concurrentes.

En el ensayo local, `aluminior_prodsim_test` estaba migrada solo hasta 0022, con máximo
`created_at=1790951000407` y sin `conjunto_parametros_despiece`. En :3004 se
verificaron página, alta nueva de C2, recarga y PDF: **sin errores, precio nulo,
30 piezas / 22 sin coste**, catálogo de 160 y total sin valorar. La prueba web
también acredita que la transacción sigue utilizable sin las once tablas.

Evidencia local ignorada por Git en `output/integracion-motor/`: script de
medición, resultados JSONL, capturas y ambos PDF. Los CSV originales y cualquier
salida empresarial permanecen fuera de versionado. `.claude/launch.json` conserva
el cambio local previo de Claude y queda fuera de esta entrega.

## Producción — aplicación informada por el cierre del importador

El usuario autorizó commit, push y migraciones en Supabase el 02/10/2026.
La rama de integración y `main` se publicaron en `a74dabc`; Render confirmó
el despliegue `dep-davtqn2vcj2c738n7p7g` como `live` para ese commit.

Destino verificado: proyecto Aluminior `cwtyrpqwdbfylqdlydez`. Respaldo privado
`output/integracion-motor/respaldo/antes-0023.dump`: 1.570.593 bytes, formato
custom de PostgreSQL 17, 303 entradas y 46 tablas con datos, incluido el journal
Drizzle. Validado con `pg_restore --list`; no se ha ensayado una restauración
completa. Contiene datos de empresa y permanece ignorado por Git, con permiso 600.

`aplicar-remoto.mjs` aplicó 0023 (registro 24, hash `5e588e93974e`) y después
0024 (registro 25, hash `b813287afd82`). Las 45 tablas existentes mantienen
recuentos y firmas de contenido; se conservan los 5 presupuestos y la línea
preexistente. Las once tablas nuevas están vacías: no se ejecutó ningún ETL
contra Supabase.

La comprobación de permisos detectó grants automáticos de Supabase a `anon`
y `authenticated` y ausencia de RLS en las once tablas de 0023. La migración
aditiva `0024_motor_catalogo_rls`, generada con Drizzle sin modificar 0023,
activa RLS y revoca los permisos de `PUBLIC`, `anon` y `authenticated` solo
sobre esas tablas. No incorpora políticas públicas: el acceso real es mediante
Postgres desde el servidor y el ETL. El esquema Drizzle refleja RLS; la prueba
local acredita selección vacía, inserción/truncado denegados y actualización/
borrado sin efecto para un rol sin bypass, incluso si recibe grants de filas.
Referencia: [RLS y grants de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Procedimiento pendiente — carga del catálogo del motor

La aprobación del saneamiento documental no autoriza ejecutar esta carga.

Requiere autorización de carga de datos, distinta del permiso recibido para
migraciones. Mantener estas tablas vacías conserva la valoración anterior.

1. `npm run etl:motor-catalogo -- --origen export_datos/EMP0016`: simulación
   contra el destino verificado. Esperado 260.760 insertadas, cero descartes,
   protegidas sin cambios y rollback de las once tablas. Si origen/destino no
   coinciden, detenerse y decidir la fuente, sin importar el catálogo base.
2. Tras revisar el resultado y obtener autorización, repetir con `--apply`.
   Confirmar las once tablas, conservación de documentos, 160 estructuras y
   valoración/recarga/PDF con los mismos inputs. Nunca ejecutar `importar.ts`
   contra Supabase.

Reversibilidad: cualquier error o simulación revierte la carga entera. Para
deshacer una primera carga confirmada, vaciar únicamente las once tablas nuevas
en una transacción conserva los documentos y vuelve a la vía anterior; no cambia
los snapshots ya guardados. Una recarga sobre catálogo previo exige restaurar
el respaldo de esas once tablas. Para deshacer el despliegue, revertir el commit
del motor selectivamente **conservando el lector de snapshots compatible**; no
volver directamente a `da6a537` después de guardar resultados `FILA_CENTIMOS`.
Su lector anterior no los acepta: observado en el servidor :3002 que seguía
ejecutando módulos anteriores a la fusión, mientras :3003 abre ese mismo
documento correctamente. No borrar entradas del journal ni modificar migraciones
aplicadas. Para desactivar el motor conservando documentos, mantener el código
integrado y el lector compatible, y revertir solo el catálogo nuevo como arriba.
