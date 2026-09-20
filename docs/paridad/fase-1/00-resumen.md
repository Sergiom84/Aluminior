# Fase 1 — guardado y reintento

20/09/2026. Aceptación técnica local completada en esta continuación de `a2d62ce`.
No reconstruye los entregables perdidos ni atribuye cambios al commit `74e0c95`,
que continúa ausente. La autorización vigente es continuar cerrando las fases.

## Cambio

Alta y edición usan un único `onSubmit`, sin `form action` ni `useActionState`.
Así React no restablece los campos no controlados al resolver una acción que
ha devuelto un error de negocio. Se conserva tanto el DOM de los campos como
el estado del diseñador y su selección. El bloqueo síncrono evita el segundo
clic/Enter antes del siguiente render. `finally` libera el bloqueo incluso si
se pierde la respuesta; el error de transporte permite reintentar.

Cada alta lleva un UUID de solicitud, conservado hasta recibir éxito. El
servicio lo usa como identidad de línea y comprueba su existencia bajo el
bloqueo de cabecera, antes de valorar/escribir los satélites del cerramiento.
Un reenvío devuelve la línea ya confirmada; no vuelve a valorarla ni altera
sus satélites. Un rollback deja libre el UUID. Un UUID de otro presupuesto
se rechaza. No se añade ni se modifica ninguna migración.

Las acciones siguen validando, autorizando y delegando en servicios. La
validación de ubicación ofrece ahora un error en español de máximo 60 caracteres.

## Evidencia de aceptación

- Receta: cinco 2O de 1200×1020, fijo cuarto de 300×1020, U1 PSU001 de 100 mm,
  U2–U5 GMU038 de 60 mm, longitudes 1020. Global 6640×1020.
- Catálogo equivalente **sintético J04**: QA-J04-S / QA-J04-V / QA-J04-L,
  doble cristal, tarifa 9, cantidad 1, horas adicionales 0.
- Alta desde cero en navegador: QA-F1/269902. Error por ubicación de 65
  caracteres conserva los seis módulos, orden, selección del fijo, materiales
  y U1 en selector/dibujo. Corregir y enviar con doble clic más Enter deja una
  sola GRUPO. Recarga y reapertura comprobadas.
- Edición en QA/269901: error conserva cantidad 2, fabricación 1,25 h,
  materiales y selección del sexto módulo. Reintento con cantidad 1 y horas 0
  termina, cierra el editor y permite reabrir la misma línea.
- Base/IVA/total de la receta sintética: 554,08 / 116,36 / 670,44 EUR.
  Hay 64 piezas. No es un precio comercial ni una comparación con Productor.
- PDF real de ambos documentos descargado, renderizado con PDFium y revisado:
  una página, composición completa, dimensiones y totales, sin recortes ni solapes.
- Pruebas nuevas: respuesta perdida, bloqueo mientras está pendiente, rotación
  de UUID, reenvío en PostgreSQL, concurrencia real, rechazo de otro presupuesto,
  rollback y caso explícitamente incompleto. Se mantienen las regresiones
  anteriores de rollback después de escribir satélites de alta y edición.

Ver [verificación y límites](05-verificacion-local.md) y
[aceptación geométrica](../fase-2/03-aceptacion-local.md).

## Límites del contrato

La identidad vive durante el formulario montado: no es un borrador persistente
para recuperar tras cerrar la pestaña. La primera confirmación gana: un reenvío
con ese UUID no edita la línea aunque sus campos sean diferentes. Las llamadas
históricas sin UUID conservan el contrato anterior. Tras borrar una línea ya no
hay registro separado de su solicitud; no se promete deduplicación perpetua.
La edición conserva identidad de línea y transacción; no añade versionado
optimista para conflictos entre operadores. No se cambian fórmulas económicas.
