# Prompt para GPT 5.6 Terra — Aluminior, fase 1

> Revisión documental 20/09/2026: **Encargo histórico inactivo**. Cambios de guardado existentes; aceptación completa sigue sin acreditarse. Ruta OneDrive histórica.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

> Copia este documento completo en una nueva conversación situada en `C:\Users\laral\OneDrive\Documentos\Aluminior`. Quiero que ejecutes la fase 1: diagnosticar y corregir el guardado de cerramientos, su atomicidad y la conservación del formulario ante errores. No te limites a proponer un plan.

## 1. Objetivo y punto de partida

**Actualización de entorno, 20/09/2026:** Sol ya ha hecho cambios de normalización, diagnóstico y conservación de formulario; no reiniciar ni sobrescribirlos. Leer primero `docs/paridad/fase-1/00-resumen.md`, `01-reproduccion-y-validacion.md` y **`02-desbloqueo-entorno.md`**. Docker sí está instalado fuera del PATH; la comprobación directa encontró el motor apagado. Continuar desde verificación del motor e integración local, sin reinstalar herramientas ni volver a bloquear fase 1 por el selector de Productor. El estado actual de otra copia fuera de OneDrive no está auditado; no cambiar de workspace automáticamente.

Aluminior debe guardar una composición válida como una única línea GRUPO, conservar configuración y resultado coherentes, y reconstruirlos al reabrir. Si algo falla, no debe dejar escrituras parciales ni perder datos introducidos. Un resultado sin valoración completa debe seguir siendo explícitamente incompleto o sin valorar; nunca precio cero fingido.

La fase 0 permanece parcialmente abierta por problemas de observación de Productor. **Esto no bloquea esta fase 1:** el fallo web está observado y tiene una receta registrada. No dediques esta conversación a desbloquear Productor ni a implementar funciones nuevas del diseñador.

Tu entrega debe incluir código corregido, pruebas pertinentes y evidencia del recorrido de éxito y error. No declares terminado un arreglo solo porque compile o deje de lanzar una excepción.

## 2. Inspección inicial y documentación

Lee AGENTS.md y las instrucciones aplicables. Comprueba Git, rama, cambios locales, paquetes y scripts antes de modificar. La revisión auditada era `main`, `96c9337b9e5910e7c15030dc26a687ccde5a2f98`; es una referencia histórica, no orden de hacer checkout ni de descartar trabajo posterior.

Lee, en este orden:

1. `docs/paridad/fase-0/00-resumen.md` y `08-control-de-cierre.md`.
2. `docs/paridad/fase-0/04-caso-referencia.md`.
3. `docs/paridad/fase-0/06-handoff-fase-1.md`.
4. `output/auditoria-paridad-20260920/INFORME.md` y sus capturas 02/03, si están disponibles localmente.
5. README.md, ARQUITECTURA.md, PARIDAD-PRODUCTOR.md y secciones pertinentes de PLAN.md/ENTREGA.md.

Verifica el código actual: la web usa Next.js/React y Drizzle/PostgreSQL. No arranques Fastify adicional por una referencia antigua sin comprobar que sea necesario. Los documentos históricos pueden estar superados.

Los archivos de documentación de fase 0 estaban sin seguimiento; consérvalos. No hagas reset, limpieza masiva, commit, push o publicación. No crees otra conversación ni delegues agentes como requisito del trabajo.

## 3. Alcance autorizado y datos

- Trabaja en código local y pruebas con datos sintéticos. Puedes arrancar la web local y usar el navegador para verificar el flujo.
- Usa un entorno de integración local o efímero identificado y aislado. Antes de lanzar pruebas, inspecciona scripts, preparación global y destino efectivo de conexión sin revelar valores secretos.
- No migres ni vacíes una base remota. No modifiques datos reales ni uses 0016 para experimentar. Si falta un entorno seguro, continúa con diagnóstico y pruebas aisladas; explica el bloqueo preciso para la parte de integración.
- `.env` puede leerse localmente si resulta indispensable; no volcarlo, copiarlo a documentación ni registrar credenciales/URLs con secretos. Usa una sesión de prueba ya disponible o pide acceso si falta; este prompt no contiene contraseñas.
- Presupuesto Aluminior 260004 rev. 0 es evidencia existente. Consérvalo; para escritura de regresión crea un documento sintético claramente identificado en el entorno de pruebas y registra su ID. No borres documentos anteriores.
- No operar Productor ni alterar su sesión para corregir el snapshot web. Empresa Productor 0017 y PostgreSQL de Aluminior son sistemas diferentes. El campo Delegación 0016 de la web no acredita acceso a una MDB ni aislamiento multiempresa real.

## 4. Fallo demostrado

Presupuesto observado: `260004`, revisión `0`, ID `11d0cc51-931f-4e7c-a9bc-4eb10212c179`.

Ruta histórica: `/dashboard/presupuestos/11d0cc51-931f-4e7c-a9bc-4eb10212c179#configurador`.

Al guardar se vio:

```text
No se pudo guardar. El detalle queda en el registro del servidor.
```

Registro del servidor:

```text
El motor produjo un snapshot incompatible
```

Punto identificado: `packages/web/app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts`, validación final con `esResultadoCerramiento(resultado)`; en aquella revisión, línea 108. La causa interna exacta **no está diagnosticada**.

Además, tras el error:

- Serie, vidrio y acabado quedaron vacíos.
- La composición se conservó parcialmente.
- El selector de U1 volvió a GMU038 aunque el dibujo seguía mostrando PSU001 y grosor 100 mm.
- No quedó una línea visible persistida. No se comprobó exhaustivamente la ausencia de todos los registros satélite: demuéstralo con integración.

No atribuyas de antemano el error a decimales, migración, tarifas o vidrio. Tampoco elimines la validación para que el guardado aparente funcionar.

## 5. Receta de reproducción

Reconstruye esta configuración en un documento sintético:

| Orden | Módulo | Ancho mm | Alto mm |
|---|---|---:|---:|
| M1 | 2O | 1200 | 1020 |
| M2 | 2O | 1200 | 1020 |
| M3 | 2O | 1200 | 1020 |
| M4 | 0 (fijo) | 300 | 1020 |
| M5 | 2O | 1200 | 1020 |
| M6 | 2O | 1200 | 1020 |

| Unión | Código | Grosor mm | Longitud mm |
|---|---|---:|---:|
| U1 | PSU001 | 100 | 1020 |
| U2–U5 | GMU038 | 60 cada una | 1020 cada una |

Serie ELEGANTPVC; vidrio V420AGS4; variante doble (verificar su representación interna, históricamente `2`); acabado L; cantidad 1; horas adicionales 0. Dimensiones globales esperadas según el modelo actual: **6640×1020 mm**. No añadir PAN16 ni travesaños editados por hueco: no formaban parte del caso web reproducido.

Registra tarifa real, presencia de catálogo y demás parámetros comerciales al repetir; no están todos certificados en la auditoría. Si faltan datos de catálogo, usa fixtures sintéticos equivalentes para aislar el defecto y declara el límite de reproducción con datos originales. No importar un dump real ni inventar un precio esperado.

La referencia Productor de 6900×1020 y 3868,19 EUR tiene entradas incompletas y distintas. **No es el importe objetivo de esta prueba.**

## 6. Ejecución por subfases

### 1A — Reproducir y localizar la incompatibilidad

1. Inspecciona productor y consumidor del snapshot y sus tests existentes.
2. Reproduce el error con el recorrido conocido o reduce a un fixture sintético que falle por la misma condición demostrada.
3. Identifica la propiedad o relación exacta que incumple el contrato, con ruta/campo y valores saneados. Diferencia estructura inválida de datos materialmente incompletos válidos.
4. Escribe una prueba de regresión que falle antes del arreglo. Si el defecto ya está corregido por trabajo posterior, demuéstralo y evalúa los demás criterios; no fuerces una nueva modificación.

Archivos iniciales a inspeccionar, verificando que sigan vigentes:

- `packages/web/app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts`.
- `packages/core/src/estructuras/resultado-cerramiento/validar.ts`.
- `packages/web/app/dashboard/presupuestos/_lib/cerramientos/origen-valorado.ts`.
- Servicios de estructuras y partidas que alimenten los orígenes.

### 1B — Corregir el contrato en su responsable

Aplica el cambio mínimo correcto en la construcción, normalización o validación, según la causa probada. Si el contrato necesita corregirse, explica por qué, protege las invariantes y revisa consumidores/persistencia. No permitir datos inválidos mediante cast, campos ficticios, eliminación de diagnósticos o capturas de errores que devuelvan éxito.

Mantén importes, escalas, estado de cobertura, IDs de origen y configuración coherentes. Diferencia el precio unitario de composición de la cantidad comercial: evita multiplicar piezas o materiales dos veces. Respeta el ámbito ya definido para ajustes manuales de fabricación/montaje.

### 1C — Atomicidad de persistencia

Inspecciona acciones y servicios de creación/edición. Enumera las escrituras reales: línea, configuración, snapshot, resultados y partidas asociadas que existan en este esquema. Verifica una frontera transaccional común y que los servicios utilicen el cliente transaccional.

Prueba fallos inducidos **entre escrituras**, no solo validación previa. Para creación, no debe quedar media línea; para edición, debe sobrevivir íntegro el estado anterior. Respeta autorización, documento correcto e identidad de la línea. No rediseñar numeración ni crear infraestructura general de idempotencia sin necesidad demostrada.

### 1D — Conservar formulario y permitir reintento

Inspecciona `anyadir-linea.tsx`, `disenador-estructura.tsx`, respuesta de acción y posibles remontajes. Conserva una fuente coherente para todo el estado editable relevante.

Después de un fallo deben permanecer módulos, orden, medidas, selección, uniones, códigos/grosores/longitudes, serie, vidrio, variante, acabados, cantidad y ajustes manuales. No basta conservar el dibujo si los controles muestran otros valores.

El reintento debe usar esos datos conservados y producir una sola línea. Comprueba doble envío accidental y estado pendiente con el mecanismo adecuado al flujo actual. Los mensajes al usuario deben ser claros y no revelar datos internos; diagnóstico técnico saneado en servidor.

### 1E — Guardar, reabrir y comprobar salida

Ejecuta en navegador local el caso de seis módulos. Tras guardar, verifica una sola GRUPO y recarga completa. Reabre su configuración; contrasta todos los módulos, uniones y materiales con lo enviado, no únicamente el importe.

Verifica el estado valorado/incompleto según los datos disponibles. Si falta material real, un caso sintético completo debe demostrar el camino valorado y otro el incompleto. No equiparar un error de contrato a una falta legítima de tarifa.

Genera/previsualiza PDF de esa línea y comprueba contenido: dibujo, medidas, cantidad, importe o estado explícito permitido, impuestos y total coherentes con lo persistido. HTTP 200 o visor vacío no acreditan éxito. En esta fase se pide una comprobación de regresión del PDF existente; la paridad completa de formatos/maquetación sigue siendo fase 8.

## 7. Arquitectura y límites

- Dominio puro en core; I/O y transacciones en servicios de aplicación; acciones y páginas como composición.
- No ampliar `acciones.ts` como monolito. Extraer una responsabilidad cohesionada cuando el arreglo lo requiera y cubrir su comportamiento.
- Respetar revisión de cohesión a 250 líneas y división/justificación a más de 400 según AGENTS.md.
- No cambiar geometría, catálogo, drag and drop, herencia por modelo, editor por hueco, buscador de vidrio ni acabados de uniones. Son fases 2–6.
- No introducir dependencias o migraciones si el arreglo no las necesita. No modificar migraciones históricas.
- No copiar código/binarios/activos de Productor ni usarlo como dependencia de ejecución.

## 8. Verificación mínima y evidencia

1. Regresión del incumplimiento concreto de snapshot, con caso completo e incompleto válidos y rechazo de entradas realmente inválidas.
2. Integración: éxito, rollback a mitad de creación y rollback a mitad de edición, si ambos recorridos están afectados.
3. UI: error inducido conserva valores y selección; reintento guarda una línea, U1 sigue PSU001 en selector y dibujo.
4. Persistencia: recarga y reapertura reconstruyen el estado desde servidor, sin depender del estado en memoria del navegador.
5. Cantidad distinta de 1 para detectar doble multiplicación, y ajustes manuales explícitos si el cambio toca esos cálculos.
6. PDF: salida con línea real, datos contrastados y estado de valoración honesto.
7. Tests pertinentes y typechecks de paquetes afectados. Inspecciona scripts antes de ejecutar. Las pruebas web de la auditoría anterior fallaron en preparación por PostgreSQL local:55433 inaccesible; comprueba el entorno actual y no confundas ese fallo con una regresión del producto.
8. Diff y Git finales: sin secretos, datos reales, cambios ajenos ni archivos propietarios.

No repitas suites completas sin motivo. Si una parte queda bloqueada, entrega el arreglo y pruebas completadas, indicando exactamente qué aceptación falta; no declares la fase plenamente terminada.

## 9. Entregables

Crea `docs/paridad/fase-1/00-resumen.md` con causa demostrada, módulos cambiados, resultados de prueba, datos sintéticos creados y límites. Añade `01-reproduccion-y-validacion.md` con receta, comandos, resultados y evidencias antes/después; excluye secretos y datos de clientes.

Capturas y salidas locales sensibles en `output/paridad-fase-1/` después de verificar que esté ignorado. Referéncialas con rutas exactas. Actualiza el handoff de fase 0 solo en lo que haya quedado resuelto por evidencia nueva; conserva sus incertidumbres nativas.

Entrega un resumen breve con enlaces: qué se corrigió, por qué fallaba, pruebas ejecutadas, estado real de aceptación y pendientes. No pases a fase 2 automáticamente.

## 10. Contexto Productor que debes conservar

En 0017 se observó 260495 con dos 2O de 1200×1200 y global 2420×1200, en memoria. Guardado/emisión no confirmados; Obra no normalizada. El usuario informa que hacer clic en la fila ELEGANTPVC no navega y el clic derecho ofrece Exportar/Vincular. No se ha establecido que Aceptar aplique el perfil. No confundir ese menú de tabla con el menú del hueco.

El manual confirma puntos de inserción, travesaño contextual inicialmente horizontal equidistante de dos huecos, excepción local de vidrio y junquillo gráfico independiente del despiece de serie. La herencia entre módulos y el alcance de Actualizar todos siguen sin comprobar. Nada de esto es causa demostrada del fallo de snapshot.

**Empieza inspeccionando el estado actual y ejecuta la fase 1 hasta el máximo alcance verificable. Conserva el trabajo anterior y comunica hallazgos y bloqueos concretos sin pedir de nuevo permisos ya incluidos en este encargo.**
