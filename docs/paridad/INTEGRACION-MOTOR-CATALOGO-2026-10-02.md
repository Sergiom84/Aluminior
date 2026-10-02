# Integración del motor de catálogo — 02/10/2026

Preparada en `integracion/motor-catalogo`, desde `main` (`da6a537`) y el motor
`0ecdc9c`. Verificación local terminada. No se ha actualizado `main` ni escrito
en Supabase. Esta entrega acredita la integración y su degradación segura;
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
en `BANCO-COMPARACION-PRECIOS.md` exige tarifa, vidrio y contexto verificados;
no hay casos generados y aceptados para esta prueba en la copia actual.
No se ejecutó Productor en el Mac ni se inventaron entradas pendientes.

## Pruebas y simulación de producción

`npm run test`: **core 557, db 55, etl 39 + 1 omitida, web 666**; sin fallos.
`npm run typecheck` y `npm run check:architecture`: pasan, cero infracciones.
ETL tiene nueve pruebas nuevas sobre una base efímera propia, con migraciones
reales y filas sintéticas. Su preparación acredita el avance de 23 a 24
migraciones desde la 0022 ya aplicada; cubren simulación vacía/existente, aplicación repetida,
rollback temprano/tardío, duplicados, CSV ausente/vacío, alteración de contenido
protegido y ausencia del esquema del motor. Ninguna usa Supabase.

Ejecutar la suite general con su configuración habitual, sin forzar un único
`TEST_DATABASE_URL` para todos los paquetes: los ensayos ETL de tarifa y relleno
emplean bases separadas para sus tablas de prueba.

`aluminior_prodsim_test` sigue migrada solo hasta 0022, con máximo
`created_at=1790951000407` y sin `conjunto_parametros_despiece`. En :3004 se
verificaron página, alta nueva de C2, recarga y PDF: **sin errores, precio nulo,
30 piezas / 22 sin coste**, catálogo de 160 y total sin valorar. La prueba web
también acredita que la transacción sigue utilizable sin las once tablas.

Evidencia local ignorada por Git en `output/integracion-motor/`: script de
medición, resultados JSONL, capturas y ambos PDF. Los CSV originales y cualquier
salida empresarial permanecen fuera de versionado. `.claude/launch.json` conserva
el cambio local previo de Claude y queda fuera de esta entrega.

## Paso a producción — pendiente de autorización

1. Tras permiso para integrar: fusionar esta rama en `main` y hacer push.
   Render despliega el código; sin 0023 debe seguir funcionando por degradación.
2. Con permiso separado para Supabase: obtener respaldo de esquema/datos y
   confirmar destino Aluminior en el `.env` existente, sin mostrar credenciales.
   Ejecutar `node packages/db/pruebas/preflight-remoto.mjs`. Esperado según la
   última observación aportada: 23 migraciones hasta 0022, 5 presupuestos y
   1 línea; los recuentos actuales pueden haber cambiado legítimamente.
   Antes de cargar datos, comprobar permisos/RLS de las once tablas nuevas si
   el esquema public está expuesto mediante Data API.
3. `node packages/db/pruebas/aplicar-remoto.mjs`: esperado una sola migración
   nueva (registro 24), hash `5e588e93974e`. Conservar la 0022 anterior intacta.
4. `npm run etl:motor-catalogo -- --origen export_datos/EMP0016`: simulación.
   Esperado 260.760 insertadas, cero descartes y protegidas sin cambios; las
   once tablas del motor siguen como antes por rollback. Si origen/destino no
   coinciden, detenerse y decidir la fuente, sin importar el catálogo base.
5. Tras revisar ese resultado, repetir con `--apply`. Confirmar las once tablas,
   la conservación de documentos, las 160 estructuras y una valoración/recarga/PDF
   con los mismos inputs. No ejecutar `importar.ts` contra Supabase.

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
