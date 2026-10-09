# A3 — idempotencia de alta y copia, 09/10/2026

Estado: publicado y verificado el 09/10/2026. Código `a06cd4f` integrado en
`origin/main`; Render live `dep-db4htb6k1f9s73818vcg`, 17:06:26 UTC
(19:06:26 Madrid). Migración 0029 aplicada antes del despliegue.
Rama `codex/a3-idempotencia`, checkout administrado
`/Users/sergio/.codex/worktrees/a3-idempotencia/Aluminior`, desde `origin/main`
`d2d07ed`. El main local y sus cambios ajenos no se editaron.
Estado único de tarea: [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md), A3.

## Evidencia y alcance

Petición de Sergio y propuesta 4 de [A1](AUDITORIA-FUNCIONAL-2026-10-09.md).
La [evidencia de Productor §8](EVIDENCIA-VIDEO-PRESUPUESTO.md) conserva los
conceptos de nuevo número y nueva revisión; no cambia su orden ni economía.
La pérdida HTTP es una condición propia de la web: no se atribuye al original
una garantía técnica no observada. Sin nueva sesión Windows ni aceptación
comparativa completa. S1/A2 y P.2 siguen publicados; no se repitieron.

Reproducción previa en PostgreSQL local: tres pruebas fallaban al descartar el
resultado confirmado y repetir alta, copia nueva o revisión con la misma clave.
Se obtenían IDs distintos y otro número/revisión. Log `/tmp/aluminior-a3-red.log`.

## Contrato implementado

- Clave UUID v4 por intención, obligatoria en las acciones HTTP y validada
  antes de escribir. Usuario resuelto en servidor, nunca desde el formulario.
- Recibo por `(actor, clave)`, huella SHA-256 de la intención canónica y
  resultado original. Cambiar contenido, origen, estrategia o tipo con una
  clave confirmada se rechaza. La fecha que calcula el servidor se excluye:
  reintentar al día siguiente recupera la fecha/numeración ya confirmada.
- Lock transaccional de operación antes del lock de numeración. Recibo,
  cabecera, líneas y satélites confirman o revierten juntos. Funciona entre
  conexiones/procesos, sin caché de idempotencia en memoria.
- Reintento devuelve el resultado guardado antes de releer/copiar el origen,
  reservar números o valorar. No se recalcula ningún precio.
- Recibos sin FK ni caducidad: borrar un presupuesto no permite recrearlo
  mediante un reintento antiguo; se recupera su ID, cuya ficha puede ser 404.
- La UI conserva claves en sessionStorage por pestaña, origen y estrategia.
  En alta conserva también los campos de la solicitud pendiente, porque React
  vacía formularios al resolver la acción. Se eliminan al confirmar o recibir
  una respuesta de validación; tras pérdida de transporte se recuperan al
  reintentar, incluso después de recargar. Durante recuperación se bloquean
  los campos para no mezclar intenciones. Copiar mantiene Cancelar/Reintentar;
  cancelar no descarta una clave incierta.
- Sin sessionStorage no se envía una operación desprotegida. Cerrar la pestaña
  o borrar su almacenamiento pierde la identidad local: no se promete deduplicar
  una nueva intención creada después. Dos claves nuevas permiten dos documentos
  deliberados con contenido idéntico.
- Los servicios internos conservan `operacionId` opcional por compatibilidad
  con las herramientas y tests previos; las acciones HTTP nunca lo omiten.

Responsabilidades: `_lib/idempotencia/` registra/recupera dentro de la transacción;
servicios de alta/copia mantienen numeración y persistencia; acciones validan,
autorizan y revalidan; `nuevo/use-alta-presupuesto.ts` lleva recuperación cliente.

## Verificación

- Suite web completa: **754 pruebas** correctas. Después se añadió una prueba
  de conservación de campos y se amplió rollback de copia; regresión dirigida
  final: **14 pruebas** correctas en una base nueva.
- Paquete DB: **55 pruebas** correctas. Typechecks de los cuatro paquetes,
  arquitectura (0 infracciones) y build Next correctos.
- Migraciones desde cero en `aluminior_a3_schema_test`, PostgreSQL 16 efímero.
  Auth sintética local, sin lectura de .env ni acceso a Supabase.
  Verificados 30 registros de migración, PK y RLS. DDL reversible probado
  localmente con BEGIN/DROP TABLE/ROLLBACK, conservando la tabla.
- A3 cubre reintentos, concurrencia, distinto usuario, cambio de contenido/origen,
  fecha de servidor distinta, nueva intención, borrado posterior, fallo SQL,
  fallo al escribir recibo (revierte alta y copia), línea incompleta con importes
  nulos y conservación de la respuesta tras editar el origen.
- Navegador real contra Next local 3017 y proxy loopback 3018. El proxy consumió
  respuestas HTTP 200 completas y cortó la conexión antes de entregarlas.
  Alta: error recuperable, recarga y reintento por Enter abren el mismo ID.
  Copia nueva y revisión: error y Reintentar por Enter abren sus IDs originales.
  Recuento SQL final exactamente tres documentos sintéticos: `260001/0`,
  `260002/0`, `260001/1`; ninguna cuarta cabecera ni revisión extra.
- Escritorio 1440×900 y móvil 390×844; revisión reintentada en móvil. Documento
  móvil sin overflow exterior (scrollWidth=innerWidth=390), tabla con scroll
  propio. No se añadieron animaciones. Capturas `/tmp/aluminior-a3-desktop.png`
  y `/tmp/aluminior-a3-mobile.png`; logs `/tmp/aluminior-a3-{web,db,types,
  architecture,build,final-target,proxy}.log` (privados, no versionados).
- El recorrido HTTP usa cabeceras vacías sintéticas; conservación de líneas,
  snapshots, avisos e importes queda cubierta por integración/suite de copia.
  No prueba nueva paridad económica ni fabricación. Servidor y proxy detenidos.

## Migración: alcance y reversión

`0029_operaciones_presupuesto` sólo añade una tabla de recibos con PK compuesta,
RLS y permisos revocados a PUBLIC/anon/authenticated. No modifica tablas
comerciales ni migraciones aplicadas. El snapshot y journal incluyen la entrada.
Sin 0029, las nuevas acciones fallan de forma segura antes de crear documentos.

Sergio autorizó aplicar 0029 e integrar A3 en main después del preflight de
solo lectura. Destino contrastado `cwtyrpqwdbfylqdlydez`: 29 migraciones hasta
0028, hash coincidente, tabla A3 ausente y una única migración pendiente.
Se aplicaron SQL y entrada de journal juntos, en una transacción con timeout
de bloqueo y comprobación de huellas de documentos antes/después.

Reversión: el código anterior puede convivir con la tabla; conservar los recibos
si se revierte la app, para no perder la deduplicación al volver a desplegar A3.
No borrar una tabla con recibos. Sólo antes de uso y con tabla vacía, una
reversión DDL puede retirar la tabla y reconciliar journal bajo autorización.
La reversión de app retira la garantía A3: no presentarla como equivalente.
La migración y sus verificaciones remotas sí se aplicaron; no fue necesario revertir.

Documentación actualizada: estado, roadmap, relevo, índice, arquitectura,
README de BD y punteros de A1/S1-A2/P.2. Banco, discrepancias, evidencia económica
E1 y demás fuentes fechadas intactos. A3 queda publicado; E1 y aceptación comercial P.2 conservan sus límites.

## Publicación y aceptación en producción

- Respaldo privado previo: `export_datos/respaldos/a3-antes-0029-1791565411278.dump`
  del checkout principal, ignorado por Git y permisos 600. Public + drizzle,
  2.811.100 bytes, 309 entradas leídas por pg_restore; SHA-256
  `254335803f7d48da8898d30e9ed7a9e2330a0f2ebf2f65bea162bda450f8202b`.
  Archivo legible; no se afirma restauración completa ensayada.
- Migración: 29→30, hash 0029
  `39c610927984136a3b8c455da063102bce6bf408e88cbce15d7fa9234faa766b`.
  Preflight posterior confirma cero pendientes, RLS y denegación a
  anon/authenticated. No cambia datos comerciales.
- Push fast-forward de `a06cd4f2a9d5590248fd974fb338ce5ea500aae9` a main,
  desde el checkout aislado. Render API confirma ese mismo commit live.
- Web autenticada: alta sintética `260010/0`, copia como nuevo `260011/0`,
  copia como revisión `260010/1`, todas «PRUEBA A3 2026-10-09», sin cliente ni
  líneas comerciales. Apertura y recarga correctas; tres recibos persistidos.
  Se conservan estos documentos de prueba; no se borraron ni ocultaron.
- Reejecución de los tres servicios de `a06cd4f` con las mismas claves/actores
  y entradas, sobre BD remota dentro de una transacción READ ONLY: devuelven
  sus mismos IDs sin reservar ni escribir. No es un segundo ensayo de pérdida
  HTTP en Render: esa pérdida física se probó localmente con el proxy.
- Los nueve presupuestos anteriores y tres líneas conservan sus huellas
  exactas tras la migración y la prueba sintética. 260009 sigue en 805,65 €.
  Total posterior: 12 cabeceras, 3 líneas, 3 recibos A3.
- Evidencia privada: `/tmp/aluminior-a3-{backup,migration,prod-qa}.json` y
  `/tmp/aluminior-a3-produccion.png`. El acceso directo al destino autorizado
  funcionó; no se desactivaron protecciones del navegador.

Siguiente abierto: E1, con la coordinación y autorización Windows ya descritas
en el roadmap; P.2 conserva aceptación comercial, y S2 sigue condicionado al
anuncio previsto del 14/10. No repetir A3 ni su migración.
