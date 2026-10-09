# Auditoría funcional de presupuestos — 09/10/2026

Estado: correcciones publicadas y recorrido de prueba verificado el 09/10/2026. Registro de tareas:
[roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md), A1. Entrada:
[estado](../ESTADO-ACTUAL.md). No usar este informe como un segundo backlog.

## Alcance y fuentes

Encargo: hacer utilizable Aluminior mientras se completa el catálogo de Productor.
Auditoría de backend, configurador, copia/PDF y recorrido en navegador con tres
agentes y revisión independiente del diff. Checkout inicial limpio: `787d1ad`.
No se modificaron core, migraciones, tarifas ni catálogos. Sólo se creó y
revaloró el presupuesto sintético autorizado 260009; documentos previos intactos. Original Windows no ejecutado: Mac y ausencia de mochila; no se ha
bypasseado protección ni abierto la MDB activa.

Sergio identifica el ejercicio 2026 como empresa 0016 y la 0017 como pruebas;
0015 y anteriores son ejercicios previos. La copia Mac contiene
`/Users/sergio/Desktop/Productor/Aluminio/EMP0016` y `EMP0015`; no contiene
`EMP0017`. La grafía real difiere de EMP00016/EMP00017 del mensaje.
Esta correspondencia procede del usuario; no se infirió examinando clientes.

Evidencia reutilizada, sin repetir extracciones:

- [Catálogo visual](CATALOGO-REAL-2026-10-02.md): 160 diseños documentados;
  no implica que todas las combinaciones tengan receta, coste y PVP completos.
- [Banco, iteración 12](BANCO-CONTRASTE-2026-10-03.md): herrajes predeterminados;
  el banco ya aplicaba la regla que faltaba conectar al alta/edición web de GRUPO.
- [Matriz](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md) y fases
  [1](fase-1/05-verificacion-local.md), [5](fase-5/00-resumen.md),
  [6](fase-6/00-resumen.md), [7](fase-7/00-resumen.md): persistencia, materiales,
  herrajes y distinción entre importe completo, incompleto y no valorado.
- [Contrato de paridad](PARIDAD-PRODUCTOR.md): misma tarea y terminología,
  sin rediseño ni nueva regla económica asumida.

## Observación de producción antes de publicar

Render consultado en lectura: despliegue `dep-db17kqivcj2c739uorq0`, estado
`live`, commit `d451274956672faf1bb5da31c6e27a2178203fec`, finalizado el
04/10/2026. Esta es la observación previa; la publicación corregida consta más abajo.
No se repitió consulta directa a Supabase; sus conteos históricos siguen
atribuidos al relevo del 03/10.

Con autorización expresa se creó **260009**, destinatario sintético
«PRUEBA AUDITORÍA 2026-10-09», sin cliente real. ID:
`b20dec06-b307-4d7c-846d-f330038ec42a`. No se modificaron documentos previos.
Caso A1: 2O, ELEGANTPVC, 1200×540 mm, L, VCG420AGS4, tarifa 1, cantidad 1,
0 h fabricación y 5 h colocación total de línea.

| Paso | Resultado observado |
|---|---|
| Cabecera nueva → configurador | Correcto, número 260009 |
| Guardar cerramiento | Una línea; material 461,33 €, colocación 150,00 € |
| Recargar | Conserva línea, medidas e importes |
| Totales | Base 611,33 €, IVA 128,38 €, total 739,71 € |
| Emitir PDF | Una página con dibujo, medidas y los mismos importes |
| Revisión técnica | Conserva aviso de costes/materiales pendientes y dos piezas sin coste |

Esto prueba persistencia y emisión del caso, **no certifica precio correcto ni
fabricación**. La producción examinada todavía omite defaults de herraje en
este flujo. No usar 739,71 € como objetivo del código corregido, ni exigir
652,24 € histórico. La revaloración posterior, sólo del documento de prueba, se recoge en el cierre
de publicación; no se tocaron presupuestos anteriores del negocio.

En un documento previo se observó C2+C2 con ELEGANTPVC, DABASE y unión sin
configurar. La aplicación permitía abrirlo, pero no explicaba visiblemente
por qué faltaba el precio. No se revaloró ni alteró ese documento.

Capturas privadas ignoradas por Git: `output/auditoria-2026-10-09/`,
`produccion-presupuesto-260009.jpg` y `produccion-pdf-260009.jpg`.

## Defectos y correcciones

| ID | Causa reproducida | Resultado local |
|---|---|---|
| F01 | Alta/edición GRUPO trataban herrajes ausentes del formulario como todos desmarcados | Aplican defaults documentados. Fixture rojo→verde: 12/24 € pasaron a 16/32 €; sin PVP del herraje, precio nulo |
| F02 | Opción de acristalamiento 2 usaba receta/precio de opción 1 en motor catálogo | Guarda opción y vidrio incompletos, sin precio ni despiece falsos. E6 sigue abierto para implementación contrastada |
| F03 | Borrado sin recuperación tras excepción; faltaban guardas de estado en varias escrituras | Resultado explícito y botón recuperable; alta/edición/borrado rechazan documentos fuera de PENDIENTE bajo bloqueo transaccional |
| F04 | Errores de conexión/carga escapaban de acciones; creación dependía sólo del middleware | Autorización explícita y error seguro con registro técnico |
| F05 | Fallo de revalidación posterior a commit se comunicaba como escritura fallida | Crear/añadir/borrar mantienen éxito confirmado; fallo de caché se registra por separado |
| F06 | Diagnóstico de sin valorar sólo en tooltip y errores de configuración ocultos | Motivo y errores de composición visibles |
| F07 | step=10 rechazaba 1207 mm; step=1 impedía fracciones de módulos | Estructura individual usa milímetros enteros; módulos admiten fracciones; JSON conserva precisión |
| F08 | Exterior fraccionario aceptado por motor, rechazado por columnas integer | Validación previa explícita sin redondeo ni pérdida del documento anterior; soporte exterior decimal pendiente |
| F09 | Cambio de serie/modelo conservaba opciones viejas; fallo de carga equivalía a lista vacía | Reinicio por clave, estados de carga/error y reintento; guardar exige catálogos resueltos actuales. Lista vacía legítima sí permite continuar |
| F10 | Copia descartaba excepciones técnicas; PDF con UUID inválido llegaba al SQL | Registro de fallos de copia y 404 previo a consulta de PDF inválido |

La edición elimina los hidden enteros redundantes: la configuración JSON es
la fuente de medidas. Esto por sí solo no resuelve exteriores fraccionarios.
Los paneles de pestañas permanecen montados con `hidden`: las opciones no se
pierden al cambiar de pestaña.

## Verificación local

PostgreSQL Docker efímero, suites separadas y una base `aluminior_audit_test`
exclusiva para navegador. Preparador reproducible:
`packages/web/pruebas/preparar-auditoria-local.ts`; procedimiento en
[README de BD](../../packages/db/README.md). No lee .env, no usa datos reales,
no hace resets y rechaza sembrar una base poblada.

- Batería final: core 599, DB 55, ETL 41 (1 omitida), web 731: **1426 tests
  correctos y 1 omitido**. La suite web completa se repitió tras las últimas
  correcciones de carga de opciones, revalidación y refresco tras borrado.
- Typechecks de los cuatro paquetes y build Next correctos; arquitectura sin
  infracciones. Build final repetida tras el último cambio. Enlaces Markdown
  locales comprobados, diff sin whitespace inválido y evidencia privada ignorada.
- Navegador local: fijo 0, serie QA-J04-S, acabado QA-J04-L, vidrio QA-J04-V,
  1200×800, tarifa 1, sencillo: material 76,84 €, total 92,98 €.
- Edición sin vidrio: conserva configuración y pasa a «sin valorar», con causa
  visible y totales nulos. Reponer vidrio recupera valoración.
- Exterior 800,5 mm: mensaje explícito; presupuesto previo conserva sus valores.
- Edición cantidad 2 + 1 h colocación total: base 183,68 €, IVA 38,57 €, total
  222,25 €, conservados al recargar. Copia como nuevo 260002 conserva línea,
  dibujo, cantidad, colocación y total, sin revaloración.
- Escritorio 1440×900 y móvil 390×844: sin overflow exterior, tabla con
  desplazamiento propio, totales visibles y foco de teclado visible en Eliminar.
  Capturas locales `local-escritorio.jpg` y `local-movil.jpg`. Viewport restablecido.
- Consola local: avisos de hidratación atribuidos en el diff a atributos
  `data-darkreader-*` de la extensión del navegador. No se suprimieron avisos
  ni se modificó la configuración del usuario para ocultarlos.
- PDF local HTTP 200, 4058 bytes, una página A4; análisis estricto y render
  PDFium correctos, dibujo y totales 222,25 € verificados. El visor IAB local
  quedó gris: no se atribuye ese síntoma al PDF válido. Evidencia privada:
  `qa-presupuesto.pdf` y `qa-presupuesto-pdfium-1.png`.

El fixture de navegador usa la vía económica anterior; el motor completo y
los herrajes defaults se verifican mediante integración sintética separada.
El banco histórico 400/523 no se volvió a medir; no se anuncia nueva cobertura.
Comparación Productor limitada a la evidencia ya conservada; no hay nueva
aceptación simultánea de Windows ni certificación de todas las familias.

## Entrega aislada y publicación autorizada

Sergio autorizó expresamente publicar sólo estas correcciones y repetir el
presupuesto 260009. Rama `codex/auditoria-presupuestos`, basada en producción
`d451274`, worktree administrado `auditoria-presupuestos/Aluminior`. Excluye
los commits previos `8c920aa` y `787d1ad` de scripts/tarifa. Los archivos web
cambiados/nuevos son idénticos a los del checkout de trabajo.

Remoto contrastado el 09/10: `origin/main` sigue en `d451274`. Render tiene
autodeploy de main, build `npm install --include=dev && npm run -w
@aluminior/web build` y arranque `npm run -w @aluminior/web start`, sin
comando de predeploy registrado. No se ejecutan cargas ni migraciones.
La rama aislada compila y supera los cuatro typechecks y arquitectura (742
archivos, 375 módulos, 0 infracciones). Pruebas exactas de esta rama: core
592, DB 55, ETL 41 y web 731: **1419 correctas y 1 omitida**. La diferencia
frente a 1426 del checkout inicial son siete pruebas de los commits excluidos.
Dos ejecuciones paralelas tuvieron un timeout de 5 s en pruebas distintas de
BD; la suite web completa pasó con `--maxWorkers=2`, sin cambiar aserciones ni
timeouts. Logs privados `/tmp/aluminior-release-*.log`. La aceptación de producción se recoge a continuación.

La autorización se limita a esta entrega y al documento sintético; no permite
recalcular presupuestos previos ni cambiar datos de catálogo. El checkout
principal conserva los dos commits locales anteriores, fuera de la publicación.

## Publicación y aceptación posterior

Commit de código `f6d5bcd78ed82f8cd7b4cfa700164e6d33363e1f`, enviado a
`origin/main` sin incluir los dos commits anteriores de tarifas. Render
`dep-db4g8hbbc2fs73bprsj0`, estado **live**, finalizado el 09/10/2026 a las
15:13:43 UTC (17:13:43 Madrid), consultado por API.

Tras recargar la aplicación se editó y guardó únicamente 260009 con las mismas
entradas. Conserva una línea 2O, 1200×540, cantidad 1, ELEGANTPVC, L,
VCG420AGS4, tarifa 1, 0 h fabricación y 5 h colocación total de línea.

| Verificación | Resultado publicado |
|---|---|
| Edición y guardado | Correctos; editor recupera estado normal |
| Herrajes predeterminados | Material 515,83 €; despiece pasa de 66 a 88 piezas |
| Colocación | 150,00 €, mantiene las 5 h de toda la línea |
| Totales | Base 665,83 €, IVA 139,82 €, total **805,65 €** |
| Recarga de página | Conserva datos, una línea y los mismos importes |
| PDF descargado desde Emitir | 4455 bytes, una página A4, lectura estricta y render PDFium correctos; dibujo y totales coinciden |
| Avisos | Siguen dos piezas sin coste y «Pendiente de revisión técnica» en PDF |

El aumento de 54,50 € en material corresponde al cambio de aplicación de
opciones por defecto; no se han actualizado tarifas. Tampoco se certifica
paridad económica o fabricación. A1 queda cerrado para este recorrido y las
correcciones auditadas; E2/E6 y las demás reglas conservan su estado.

El visor PDF del navegador interno quedó gris tanto al recargar como en una
pestaña nueva. La descarga autenticada produjo el PDF válido, inspeccionado
independientemente. Se conserva como limitación del recorrido visual sin
atribuir una causa no demostrada. Se abrió el archivo descargado en Codex.
Evidencia privada ignorada: `produccion-corregida-260009.png`,
`produccion-corregida-260009.pdf`, `produccion-corregida-260009-1.png`, texto y
verificación JSON dentro de `output/auditoria-2026-10-09/`.

El cierre documental se publica separadamente con `[skip render]`, mecanismo
[documentado por Render](https://render.com/docs/deploys#skipping-an-auto-deploy),
para no repetir un despliegue por Markdown. La versión ejecutable sigue siendo
`f6d5bcd`. Worktree de entrega: `/Users/sergio/.codex/worktrees/auditoria-presupuestos/Aluminior`.
El checkout principal conserva `main` en `787d1ad` y la copia de los cambios de
esta auditoría sin indexar. No publicar ese main local sin reconciliar los dos
commits de tarifas que quedaron expresamente fuera de esta entrega.

## Dependencias preexistentes detectadas durante la entrega

`npm audit` del lock sin modificar: 11 paquetes alertados (6 moderados, 2
altos, 3 críticos); `--omit=dev`: 4 (1 moderado, 2 altos, 1 crítico). Next
15.5.21 es directo, Sharp 0.35.0 transitivo y fijado por override; también
aparecen source-map-js y csv-parse. Los otros avisos afectan herramientas
de desarrollo/pruebas. Lock y manifests idénticos a `d451274`; esta entrega
no introduce ni corrige esos avisos.

No se ha demostrado un vector alcanzable en el flujo auditado. Eso no
certifica ausencia de exposición. La app usa App Router, presupuestos
dinámicos y no se encontraron next/image, cargas de archivos ni fuentes AVIF;
el optimizador continúa habilitado. [Aviso Next Windows](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36),
[aviso AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) y
[aviso Sharp](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w).

S1 resuelto en la [continuación del 09/10](MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md):
Next/Sharp y demás avisos actualizados, verificados y publicados en 7ad0ee2.
Los conteos anteriores son históricos; audit posterior 0. No repetir esta tarea
ni confundirla con S2, el anuncio posterior aún sin versiones. Evidencia privada histórica:
`/tmp/aluminior-release-npm-audit.json` y su variante `-prod.json`.

## Mejoras propuestas y límites

A1 y S1 publicados/verificados. Estado único en el roadmap: P.2 publicado/verificado en 46c613d; A3 implementado/verificado localmente, pendiente de publicación,
A2 (miniatura) cerrado. Las otras propuestas siguen pendientes, sin reabrir investigaciones cerradas:

1. Selección guiada por compatibilidad modelo/serie y disponibilidad real de
   receta/precio. El catálogo de dibujos no debe parecer una garantía económica.
2. Completar E6 (acristalamiento alternativo/por elemento) y E2 (uniones de otra
   serie) con los ensayos existentes. Faltan reglas/opciones, no sólo precios.
3. Migración aditiva revisada para medidas exteriores decimales, con ensayo
   local, respaldo y alcance remoto autorizado; no redondear para ocultar el límite.
4. Idempotencia de nueva cabecera y copia ante pérdida completa de respuesta
   HTTP. Separar caché postcommit no resuelve esa pérdida de transporte.
5. Miniatura completa del GRUPO **entregada como A2** en 7ad0ee2. P.2 tiene [aceptación y publicación posteriores](PDF-MULTIPAGINA-2026-10-09.md); resta formato comercial. Alcance original:
   aceptación PDF multipágina y, por separado, flujos de fabricación antes de usarlos en taller.
6. Automatizar el recorrido sintético de navegador en CI, incluyendo latencia,
   fallo/reintento de catálogos y foco/teclado. Mantenerlo separado del contraste
   económico con datos originales.

La información ya extraída se conserva: no se eliminaron banco, discrepancias,
fuentes ni observaciones E1 A–F/G1–G5/G6. No se duplicó extracción de catálogo.

Continuación A3: [implementación y verificación local](IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md), pendiente de publicación; no repetir el trabajo entregado.
