# A3 — idempotencia de alta y copia, 09/10/2026

Estado: implementado y verificado localmente. Commit y push de la rama autorizados
por Sergio el 09/10; entrega en rama, sin integración en main, despliegue ni
migración remota. Rama `codex/a3-idempotencia`, checkout administrado
`/Users/sergio/.codex/worktrees/a3-idempotencia/Aluminior`, desde `origin/main`
`d2d07ed`, confirmado con fetch. Main local y sus cambios ajenos no se editaron.
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

## Migración y siguiente paso abierto

`0029_operaciones_presupuesto` sólo añade una tabla de recibos con PK compuesta,
RLS y permisos revocados a PUBLIC/anon/authenticated. No modifica tablas
comerciales ni migraciones aplicadas. El snapshot y journal incluyen la entrada.
Sin 0029, las nuevas acciones fallan de forma segura antes de crear documentos.

Siguiente: autorizar la aplicación remota de 0029 e integración de A3 en main.
El push autorizado se limita a `codex/a3-idempotencia`; no activa el autodeploy de main.
Antes de aplicar: confirmar destino y journal hasta 0028, respaldo recuperable,
rol servidor con acceso y revisión del SQL aditivo. Aplicar 0029 antes del código;
verificar tabla/PK/RLS/permisos y repetir pérdida de respuesta con documentos
sintéticos expresamente autorizados. No usar presupuestos comerciales.

Reversión: el código anterior puede convivir con la tabla; conservar los recibos
si se revierte la app, para no perder la deduplicación al volver a desplegar A3.
No borrar una tabla con recibos. Sólo antes de uso y con tabla vacía, una
reversión DDL puede retirar la tabla y reconciliar journal bajo autorización.
La reversión de app retira la garantía A3: no presentarla como equivalente.
No se ha aplicado este procedimiento remoto.

Documentación actualizada: estado, roadmap, relevo, índice, arquitectura,
README de BD y punteros de A1/S1-A2/P.2. Banco, discrepancias, evidencia económica
E1 y demás fuentes fechadas intactos. A3 no se cierra como publicado.
