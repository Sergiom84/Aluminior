# Auditoría documental y relevo Windows — 10/10/2026

Resultado: documentación reconciliada con A3/A4 y S3, continuidad Windows
concreta y evidencia histórica preservada. La siguiente lectura es
[CONTINUAR-EN-WINDOWS](CONTINUAR-EN-WINDOWS.md); el
[roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md) sigue siendo el registro de tareas.

## Alcance y método

Corpus original: **84 Markdown versionados** en `origin/main` `9673659`
(22.337 líneas), más `docs/TARIFA-DOBLE-ACRISTALAMIENTO.md`, exclusivo del
main local: **85 documentos previos**. Se excluyen dependencias, builds,
copias internas de otros worktrees y datos privados de `output/export_datos`.
Se añaden esta auditoría, el inventario y la guía Windows.

Se inventariaron todos los archivos, sus encabezados, clasificación, referencias
y afirmaciones/instrucciones de continuidad. Se leyeron en detalle contratos,
estado, roadmap, índice, arquitectura, relevo, procedimientos E1/E7, informes
A1/A3/A4/S3, mapa de paridad, arranque/pruebas y la propuesta local de tarifas.
Los diarios extensos y las tablas de cobertura se revisaron por secciones y
afirmaciones de continuidad; **no se certifican otra vez sus reglas, datos o ensayos**.
[Inventario completo y tratamiento](INVENTARIO-DOCUMENTAL-2026-10-10.md).

Inspección del código pertinente: scripts del package.json, workflows de CI,
bootstrap y compose PostgreSQL, lectores del banco/E1, migraciones del journal
y límites de recibos/medidas documentados. No se modificó código de aplicación,
tests, configuración ni migraciones.

La copia principal Mac seguía en `787d1ad`, con cambios ajenos de producto y
documentación antigua. Se trabajó en `codex/auditoria-documental-windows`,
checkout aislado desde `origin/main` `9673659`, con fetch actual. Se conservaron
los documentos locales anteriores en una copia temporal antes de reconciliarlos;
los cambios ajenos de código se controlan por SHA-256 antes/después.

## Estado contrastado y procedencia

| Capa | Evidencia | Alcance real |
|---|---|---|
| Git remoto | Fetch del 10/10; `origin/main` `9673659` | Incluye A3/A4, cierre `eb3b53c` y corrección CI `36a47f4`; el main local no se adelanta |
| Render | API autenticada del 10/10: `dep-db4j4mui0phs73csggrg`, live `487feb179c2885e811d3f1cf183cb9e2c085c1b4`, terminó 09/10 18:30:14 UTC | Código desplegado confirmado hoy; no hubo despliegue nuevo ni otro recorrido funcional en esta auditoría |
| CI completa S3 | [37978474635](https://github.com/Sergiom84/Aluminior/actions/runs/37978474635), consulta directa: completed/success sobre `36a47f4` | La entrega documenta 1.448 tests correctos/uno condicionado a CSV privado, tipos, arquitectura y build |
| CI navegador | [37978474739](https://github.com/Sergiom84/Aluminior/actions/runs/37978474739), consulta directa: completed/success sobre `36a47f4` | Seis recorridos sintéticos; no aceptación comercial |
| Supabase/migraciones | Informe A3/A4 del 09/10 y ficha de acceso July: 31 entradas hasta 0030 | Evidencia fechada conservada; no se abrió BD ni repitió el preflight en esta auditoría |
| Banco | Informe del 03/10: 400/523 iguales, 434 exclusiones | Medición local histórica, sin nueva ejecución ni extrapolación a toda producción |
| Productor | Fuentes y ensayo E1 del 04/10 | No se ejecutó en Mac ni se eliminaron líneas; falta observación de precisión y E7 |
| Tarifas | Propuesta local del 04/10 | No publicada/aplicada; sus módulos están excluidos del remoto auditado |

El Render desplegado y `origin/main` tienen commits distintos porque los cambios
posteriores son CI/documentación. No es evidencia de un despliegue fallido.
La primera CI fallida y el límite de tipos comunicado en A4 se conservan en
[MEDIDAS-Y-CI](paridad/MEDIDAS-Y-CI-2026-10-09.md); el resultado posterior correcto
no borra esa historia.

## Hallazgos y correcciones

| Hallazgo | Riesgo para la continuación | Corrección |
|---|---|---|
| Main Mac antiguo anunciaba A3 como siguiente | Reimplementar idempotencia o publicar tarifas ajenas | Reconciliación desde remoto; A3/0029 y A4/0030 acreditados y checkout aislado explícito |
| Relevo nombraba a06cd4f como último live y luego 487feb1 | Confundir entrega A3 con despliegue actual | a06cd4f fechado como antecedente; API Render actual contrastada |
| Índice solo cerraba A3, aunque contenía A4/S3 | Punteros incompatibles | Encabezado e índice reconciliados; guía, auditoría e inventario enlazados |
| E7 no distinguía observación Productor de persistencia A4 | Volver a migrar/implementar decimales | E7 permanece comparativo; A4 web cerrado, caso sintético sin serie separado de receta C2 |
| E1 citado como July 180 entre equipos | Editar el pendiente de descuentos del Mac | Identidad por proyecto/sync_uid; Windows del ensayo 180, Mac 192, título cotejado |
| Relevo daba fuentes G2–G6 exclusivamente en Windows | Suponer que Git/July contiene MDB/capturas | Relevo de recepción fechado y guía de canal privado, hashes y disponibilidad por equipo |
| RECON-CONFIGURADOR apuntaba a handoff ausente como siguiente vigente | Seguir encargos agotados | Entrada actual estado/roadmap; encargo histórico conservado |
| Resumen fase 7 usaba un blob antiguo como «estado operativo» | Retomar carga/diagnóstico ya resueltos | Enlace vigente y blob identificado como antecedente |
| Reglas fase 7 e integración decían «carga pendiente» sin suficiente contexto | Repetir carga remota | Afirmación del 27/09–02/10 fechada y cierre del 03/10 enlazado |
| Informes con pendientes/permisos de sesiones anteriores | Reabrir trabajo o aplicar autorizaciones caducadas | Aviso uniforme de referencia fechada y subordinación al roadmap |
| Dos históricos sin aviso inicial inequívoco | Interpretar dictamen de fases 27/09 como actual | Encabezado histórico inactivo, sin borrar su contenido |
| 12 referencias a capturas privadas ausentes en checkout limpio | Parecer enlaces/documentación pública rota | Ruta y descripción conservadas como inventario privado no transportado |
| Propuesta de tarifa local describía herramientas que faltan en remoto | Ejecutar comandos de otra versión o dar propuesta por aplicada | Documento preservado con procedencia local/excluida y condiciones del titular; no se traslada código |

No se eliminan archivos: los candidatos conservan fuentes, reglas, decisiones,
resultados o coordinación únicos. Se retiran **instrucciones activas agotadas**
y se marcan sus antecedentes. No se borra historial del banco ni discrepancias
para presentar la paridad como terminada. Las listas dentro de informes fechados
sirven para interpretar su ensayo; el estado actual se consulta en el roadmap.

Las 12 capturas del 20/09 se conservan como rutas privadas y descripciones,
no se inventan ni se transfieren. La carpeta Mac Productor contiene EMP0016,
EMP0015 y su manual CHM; no contiene EMP0017. Windows debe verificar empresa
de pruebas y nombre real de carpeta (EMP00017 en el prompt no autoriza renombrarla).

## Continuación concreta y mejoras pendientes

Windows: recibir versión y fuentes privadas; aceptación comercial P.2 con el
titular; E1 desde G6-incidencia y autorización concreta de borrado aún pendiente;
contraste E7 de fracciones tras A4. E2–E6 siguen el orden existente y sus
entradas verificadas. Catálogo/dibujo/receta/precio se inventarían por brecha,
sin repetir M0 ni ajustar precios para igualar documentos históricos.

P.6/P.7 conserva teclado/foco, responsive, zoom y reduced motion como tramo
técnico independiente. S2 sigue el anuncio fechado para 14/10; el enlace
oficial no pudo revalidarse mediante web en esta revisión: no se afirma
alcance ni solución actuales y no se creó seguimiento automático.

La ficha July conserva deuda de comparación estructural por hashes antiguos
de migraciones y respaldo con índice legible, sin ensayo completo de restauración.
No se dan por resueltos. Los checks de CI tampoco son protección obligatoria
de ramas; esa configuración no se cambió. Ninguna de estas observaciones
autoriza alterar producción por sí sola.

## Verificación y entrega

Verificación documental correcta: **88 documentos y 1.296 enlaces locales**,
cero destinos o anclas ausentes (incluidas las anclas HTML de la matriz),
referencias entrantes e identidades cotejadas y `git diff --check` correcto.
Parche comprobado con `git apply --check` en una copia limpia de `9673659`;
paquete ZIP comprobado con test de integridad y manifiesto SHA-256 por archivo.
Solo Markdown y el parche documental; sin MDB, exportaciones, secretos ni capturas.
No se ejecutan otra vez tests/build por un cambio exclusivamente Markdown:
se comprobó en remoto la CI existente y su atribución a la versión correcta.
Los comandos PowerShell se contrastan con scripts del repo; no se atribuye
ejecución de Windows a esta revisión realizada en Mac.

La revisión se completó primero como entrega local. Sergio autorizó después
**commit + push** el 10/10: publicación documental desde el checkout aislado
a `main`, con `[skip ci] [skip render]`, sin nuevo despliegue ni mutación de BD.
La guía Windows se recibe por Git; verificar el commit remoto y la recepción
por separado. El paquete ZIP queda como alternativa de lectura.
Los archivos de producto ajenos permanecen intactos; el main local del Mac
conserva su HEAD y no se utiliza para publicar esta entrega.

July: items existentes de relevo/P.2/E1 actualizados con historial e identidad
conservados. No se sincroniza ni se acredita recepción en otro equipo. Para
continuar allí, verificar recepción de Git, documentos, July y fuentes privadas
por separado. La guía incluye el prompt listo para la siguiente conversación.
