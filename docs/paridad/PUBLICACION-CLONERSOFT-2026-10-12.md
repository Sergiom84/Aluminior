# Publicación de ClonerSoft en Aluminior

12/10/2026. Publicación técnica de alcance acotado, autorizada por Sergio y
verificada en Supabase, GitHub, Render y la web autenticada. Código
`40cedd1da30cef9c424bb42d61b2671e7d77d3ac`; Render
`dep-db6hi2navr4c739d2e4g`, estado **live**, terminado a las **19:31:21
Europe/Madrid** (17:31:21 UTC). Entrada vigente: [estado](../ESTADO-ACTUAL.md)
y [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).

La [investigación del 12/10](INVESTIGACION-CLONERSOFT-2026-10-12.md) conserva
fuentes, contratos, evidencia local y límites. Este informe registra el ciclo
remoto realizado; no es una instrucción para repetirlo.

## Publicación y datos preservados

| Etapa | Comprobación directa |
|---|---|
| Preflight | Conexión TLS `verify-full`; código remoto previo `9ae7a6e`; 31 migraciones, 14 presupuestos y cinco líneas |
| Respaldo | Snapshot consistente completo de `public` y journal `drizzle`: 59 tablas y 462.617 filas; archivo privado de 2.813.995 bytes con SHA-256 registrado en su recibo |
| Restauración local | PostgreSQL 16: filas, columnas, DDL, RLS y journal restaurados; firmas de la proyección original idénticas y 129 restricciones validadas |
| Migraciones | 0031 y 0032 aplicadas mediante el migrador canónico; 33 migraciones, con las 31 previas y sus huellas intactas |
| Seguridad | Tabla dimensional con RLS activa, cero políticas y sin permisos para `anon`/`authenticated`; nulabilidad sin defaults falsos y CHECK de acabado de artículo validado |
| Simulación dirigida | 17.547 metadatos y dos PVP de la misma proyección CSV; transacción revertida y contenido previo conservado |
| Carga dirigida | 17.547 metadatos y dos PVP aplicados atómicamente y concordantes con CSV; proyección original de 59 tablas/462.617 filas conservada |
| Snapshot posterior a carga | 60 tablas/462.619 filas congeladas antes del QA |
| Publicación | Push de `40cedd1` a `main`; recibo Render live del mismo commit |
| CI del commit publicado | [Validación completa](https://github.com/Sergiom84/Aluminior/actions/runs/38284581004) y [Recorrido web sintético](https://github.com/Sergiom84/Aluminior/actions/runs/38284580928), ambos `success` |

El respaldo se conservó intacto. Para restaurarlo en PostgreSQL 16 se generó un
SQL derivado retirando únicamente `SET transaction_timeout = 0;`, instrucción
del origen más reciente; las dos huellas están en el recibo privado. El ensayo
usó `-O -x`, por lo que no acredita restauración de propietarios ni ACL, y un
`auth.users` local mínimo con los IDs necesarios para las FK, sin credenciales
ni servicio de autenticación. No se omitieron objetos de `public`/`drizzle`.
La seguridad de la tabla nueva se verificó por separado en el destino remoto.

## Aceptación técnica en producción

Se crearon **tres documentos QA nuevos con nombre libre**, sin asignar ni
editar clientes o potenciales anteriores. Siete líneas nuevas y tres recibos
confirmados explican el cambio a **17 presupuestos/12 líneas**; los 14
presupuestos y cinco líneas anteriores conservan sus firmas.

- Artículo PSM004, acabado L, tarifa 1: dos medidas corroboradas de
  1030 × 2140 y 1250 × 2330 mm; ambos precios dimensionales coinciden con las
  filas publicadas. Los importes empresariales se conservan sólo en el recibo
  privado.
- Guardado y recarga conservan medidas, acabado y precio. Editar la cantidad
  a dos unidades conserva el mismo ID de línea y su PVP unitario; el total
  corresponde a la cantidad nueva.
- Copia como nuevo documento y nueva revisión conservan medidas, acabado,
  cantidad y precios, con identidades propias; el documento origen permanece
  intacto.
- La copia negativa añade una línea sin medidas: dimensiones, precio e
  importe nulos, valoración incompleta y aviso persistido. Detalle, listado y
  PDF muestran «Sin valorar»; el PDF no presenta el total parcial como precio
  completo. Los totales SQL pueden conservar sumas parciales: no se impuso un
  falso cero ni se exigió que la cabecera fuese nula.
- Cinco PDF descargados y comprobados por texto, incluido el posterior a F9;
  imágenes del original y del incompleto renderizadas e inspeccionadas. El verificador privado
  normaliza espacios porque el PDF separa una ubicación QA entre líneas; fue
  un ajuste de comprobación, sin cambiar la aplicación.
- El presupuesto previo 260009 se abrió sólo en lectura y conserva su total
  y avisos.
- F7 enfoca el configurador conservando el artículo y las medidas del borrador,
  sin persistir otra línea. F9 guarda una edición de cabecera de un documento
  QA; recarga y PDF conservan su obra. No se extendió F9 a líneas o gastos.
- Escritorio 1440 px capturado y móvil 390 × 844 comprobado: `scrollWidth`
  de página 390 px, sin overflow exterior y con totales coherentes. El listado
  filtrado distingue dos documentos valorados y uno sin valorar.

El gate final de aceptación y preservación, repetido tras F9, terminó con
**exit 0**. La proyección de 59 tablas/462.617 filas previas sigue idéntica; las 60 tablas
posteriores a la carga sólo difieren en los tres documentos QA, siete líneas
y tres recibos autorizados. No se borraron registros para cerrar la prueba.

## Recibos y límites

Los [recibos privados de publicación](../../export_datos/publicacion-clonersoft-20261012/)
incluyen [respaldo](../../export_datos/publicacion-clonersoft-20261012/respaldo.json),
[restauración](../../export_datos/publicacion-clonersoft-20261012/restauracion-local.json),
[migraciones](../../export_datos/publicacion-clonersoft-20261012/migraciones-aplicadas.json),
[simulación](../../export_datos/publicacion-clonersoft-20261012/carga-simulada.json),
[carga](../../export_datos/publicacion-clonersoft-20261012/carga-aplicada.json),
[Render](../../export_datos/publicacion-clonersoft-20261012/render-ultimo.json) y
[aceptación final](../../export_datos/publicacion-clonersoft-20261012/aceptacion-produccion.json).
Son enlaces locales a contenido ignorado por Git; no viajan con el código.
Los logs crudos del ciclo y una segunda copia completa del respaldo y los
recibos están preservados en
`/Users/sergio/Desktop/Aplicaciones/Aluminior/output/publicacion-clonersoft-20261012/`,
con permisos privados. Las rutas originales `/private/tmp/aluminior-release-*`
no son la única evidencia; los recibos anteriores conservan sus resultados. Capturas y PDF son evidencia
privada del arquitecto y no se incluyen en Git. No versionar dumps, listas de
huellas de filas ni precios o identificadores empresariales para reconstruir
esos recibos en otro equipo.

C1 queda **publicado y verificado técnicamente en su alcance demostrado**.
No es tarifa dinámica general, coste dimensional, margen ni aceptación de
fabricación. El banco permanece en 400/523, con denominador y exclusiones
conservados. P.6/P.7 está parcialmente publicado: siguen otras anchuras,
zoom 200 %, reduced motion y recorrido humano comparativo con Productor.
E1, E2, E6 y aceptación comercial P.2 conservan sus estados.

## Reversión compatible

Si es necesario revertir, primero activar mantenimiento/lectura y bloquear
escrituras hasta disponer de una versión compatible. Volver sólo al código
anterior con escrituras abiertas puede perder el acabado en nuevas copias y
eludir la contención de PVP plano.

Conservar columnas aditivas, journal y documentos/líneas nuevos. Restaurar
únicamente metadatos de precio y PVP dimensional afectados desde el preimage
privado, comprobando firmas y compatibilidad del lector; no sustituir toda la
BD por el respaldo ni eliminar documentos QA o columnas para simular una
reversión. El ensayo acredita la recuperación del respaldo con los límites de
ACL/autenticación anteriores; no acredita una reversión remota ejecutada.

Siguiente trabajo: matriz restante de P.6/P.7 desde Mac y continuación E1 en
Windows tras recuperar el ensayo conservado. No repetir la extracción,
0031/0032, la carga, publicación, CI ni este QA ya completados.
