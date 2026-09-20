# Aluminior — cierre de aceptación de fase 1 y ejecución de fase 2

> Revisión documental 20/09/2026: **Encargo histórico inactivo**. Geometría ya implementada; no reiniciarla. Aceptación final pendiente.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Ejecuta este encargo en `C:\Users\laral\OneDrive\Documentos\Aluminior`. Quiero resultados comprobados, código y evidencias, no otra propuesta. Conserva el trabajo existente. No crees otra tarea, no delegues agentes, no hagas commit, push ni despliegue salvo petición posterior.

## 1. Objetivo y estado de partida

La fase 2 acordada es **geometría correcta a escala común y separación de responsabilidades del diseñador**. No equivale a rehacer todo el configurador ni a implementar las fases 3–8.

Referencia auditada: `74e0c95 fix: completa la paridad de guardado de cerramientos`. Comprueba el HEAD actual; no hagas checkout destructivo de esa referencia. El nombre del commit no significa aceptación completa: la fase 1 conserva pendientes.

La auditoría independiente del 20/09/2026 obtuvo typechecks core/web correctos y **96/97 pruebas**, con un fallo por orden de revisiones en una prueba de copia. El recorrido UI previo solo acredita un fijo sintético. Primero ejecuta el bloque 0 de este documento. Después continúa directamente a fase 2 cuando cumpla sus criterios, sin pedir autorización de nuevo para lo ya incluido.

## 2. Lectura inicial y límites

Lee AGENTS.md, Git status, README.md, ARQUITECTURA.md y las secciones pertinentes de PARIDAD-PRODUCTOR.md, PLAN.md y ENTREGA.md. La secuencia de estas fases es la de paridad de septiembre, no los hitos históricos de julio.

Lee:

1. `docs/paridad/fase-1/04-auditoria-74e0c95.md`.
2. `docs/paridad/fase-1/00-resumen.md`, `01-reproduccion-y-validacion.md`, `02-desbloqueo-entorno.md` y `03-validacion-ui-pdf.md`.
3. `docs/paridad/fase-0/04-caso-referencia.md`, `05-brechas-y-aceptacion.md`, `07-manual-y-reglas-confirmadas.md` y `08-control-de-cierre.md`.
4. `PROMPT-FASE-1-GUARDADO-ALUMINIOR.md` como criterios originales, subordinando su diagnóstico antiguo a los resultados actuales.

Preserva los prompts y la auditoría Terra no versionados. No cambies a otra copia del repositorio. Los antecedentes de una carpeta Documents distinta no acreditan el estado de este workspace.

Solo escribir en código local y bases locales sintéticas. No modificar Productor 0016, MDB activas, catálogos reales ni base remota. No volcar `.env` ni secretos. Productor es referencia funcional, no dependencia de ejecución. No copiar código ni activos propietarios.

## 3. Entorno ya preparado

Docker existe fuera del PATH:

```text
C:/Users/laral/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe
```

El motor se recuperó regenerando dos carpetas de sockets temporales. No repitas factory reset, instalación ni esa recuperación sin diagnosticar un fallo actual. Si hay denegación del sandbox, usa la escalación acotada para el comando autorizado; no confundas permisos con ausencia de Docker.

- Compose: `packages/db/docker-compose.yml`.
- Contenedor: `aluminior_pg_test`, puerto 55433, PostgreSQL efímero.
- Integración: `aluminior_test`.
- UI: `aluminior_qa_test`, separada para evitar colisiones de fixtures.
- Semilla: `packages/web/pruebas/sembrar-qa-cerramiento.ts`.

Inspecciona scripts antes de ejecutarlos. La semilla actual elimina y recrea su presupuesto QA identificado; no la ejecutes sobre una prueba en curso ni destruyas evidencia anterior. Para el nuevo caso de seis módulos usa una identidad sintética distinta o conserva explícitamente la evidencia antes de una recreación autorizada.

TEST_DATABASE_URL configura las pruebas, no necesariamente el servidor web. Verifica el destino efectivo del servidor sin revelar secretos. Reutiliza el bypass QA existente solo con sus gates de desarrollo y loopback; no lo amplíes a producción ni desactives autenticación globalmente. No arrancar una segunda web en un puerto ocupado sin identificar la existente.

## 4. Bloque 0 — terminar la aceptación pendiente de fase 1

### 0A. Resolver la prueba de revisiones

Reproduce el fallo de `linea-valorada.integracion.test.ts:121`: `[1,0]` recibido frente a `[0,1]`. Revisa `_lib/copia/leer-origen.ts` y sus consumidores. Si el orden forma parte del contrato, garantiza un orden explícito; si es un conjunto, compara como conjunto conservando cardinalidad y todas las demás aserciones. No debilites las comprobaciones de importes, snapshot, claves técnicas ni ausencia de mutación del documento origen.

Ejecuta la prueba afectada y después la batería pertinente una vez con la corrección. No atribuyas el fallo al guardado ni a una regresión nueva sin demostrarlo.

### 0B. Caso completo obligatorio

Construye en UI local la siguiente composición con catálogo sintético suficiente. Los códigos de referencia deben quedar representados explícitamente; si necesitas equivalentes sintéticos de materiales, documenta la correspondencia y no presentes sus precios como precios comerciales reales.

| Elemento | Tipo | Ancho mm | Alto mm |
|---|---|---:|---:|
| M1 | 2O | 1200 | 1020 |
| M2 | 2O | 1200 | 1020 |
| M3 | 2O | 1200 | 1020 |
| M4 | 0, fijo | 300 | 1020 |
| M5 | 2O | 1200 | 1020 |
| M6 | 2O | 1200 | 1020 |

U1=PSU001, grosor 100, longitud 1020. U2–U5=GMU038, grosor 60 cada una, longitud 1020. Ancho global: `5×1200 + 300 + 100 + 4×60 = 6640`; alto 1020. Referencia de materiales: ELEGANTPVC, V420AGS4, doble acristalamiento, acabado L, cantidad 1, horas adicionales 0.

No confundir con la captura Productor de 6900×1020 y 3868,19 EUR: sus entradas no están completas y no es el oráculo económico de este caso.

### 0C. Error, reintento y doble envío

1. Completa materiales, configuración y selección de U1. Registra valores previos.
2. Provoca un error controlado recuperable, por ejemplo la validación de ubicación ya usada. Distingue ese error de uno posterior del servidor; la atomicidad a mitad de escritura se verifica por integración.
3. Verifica módulos, medidas, orden, selección, materiales y U1 simultáneamente en selector, dibujo y configuración enviada. Comprobar solo el texto visible no basta.
4. Corrige únicamente el campo inválido. Ensaya doble clic y envío por teclado mientras la petición esté pendiente, con latencia controlada si el entorno lo permite. Registra cómo se produjo el intento.
5. Comprueba una sola GRUPO persistida y satélites sin duplicación. El bloqueo transaccional de cabecera y un botón disabled no demuestran por sí mismos deduplicación.
6. Si se reproduce duplicación, corrige la frontera responsable con el cambio mínimo y una regresión significativa. No añadas infraestructura general de idempotencia sin justificarla.
7. Recarga completamente, reabre esa línea y contrasta configuración y materiales con lo enviado. Genera su PDF y examina visualmente el dibujo de seis módulos, cotas, cantidad y totales.

El recorrido de un fijo no sustituye esta prueba. La atribución histórica exacta a 260004 es opcional; no bloquear esta tarea por ella ni escribir en aquel documento.

### 0D. Puerta de entrada a geometría

Actualiza fase 1 con resultados actuales, identidad del documento sintético y rutas a evidencias. Solo marcarla completa con las comprobaciones anteriores superadas. Si surge un fallo real, resolverlo antes de cambiar el dibujo; no trasladarlo silenciosamente a fase 2. Si hay un bloqueo externo, especificar operación y evidencia que faltan, sin reiniciar fase 0 ni hacer intentos repetidos sin información nueva.

## 5. Problema concreto de fase 2

En la revisión auditada, `disenador-estructura.tsx` monta un SVG por módulo. `DibujoEstructura` calcula viewBox por módulo, limita la proporción a 0,25–4 y aplica límites de ancho. CSS añade mínimos por módulo y uniones separadas. Por tanto, indicar «Escala automática» no acredita una escala común.

`[id]/pdf/geometria-cerramiento.ts` ya calcula posiciones en milímetros y una transformación uniforme para el conjunto. Aprovecha su lógica y pruebas como antecedente; core no debe importar un archivo privado del PDF ni la web depender de su renderizador PDF.

Objetivo verificable: todas las dimensiones físicas se proyectan con un mismo factor. Un fijo de 300 mm debe ocupar un cuarto del ancho de un módulo de 1200 mm; las uniones de 100 y 60 mm deben mantener su razón 5:3. Un cambio de viewport no cambia datos de negocio.

## 6. Fase 2A — caracterización y límites de representación

Antes de refactorizar, registra capturas de la receta completa y de módulos con alturas distintas. Inspecciona el diseñador, CSS, cálculos de core, selección, sincronización con el formulario y geometría PDF. Documenta qué falla realmente y qué ya funciona.

Archivos de entrada:

- `packages/web/app/dashboard/presupuestos/[id]/_components/disenador-estructura.tsx`.
- `packages/web/app/dashboard/presupuestos/[id]/_components/anyadir-linea.tsx` y `editar-cerramiento.tsx`.
- `packages/web/app/globals.css` y CSS local del presupuesto.
- `packages/core/src/estructuras/cerramiento.ts`, `diseno.ts` y sus tests.
- `packages/web/app/dashboard/presupuestos/[id]/pdf/geometria-cerramiento.ts` y tests.

Distingue el dibujo exterior físico de símbolos decorativos. Marcos y hojas no son medidas reales de fabricación si el catálogo no aporta esas secciones; no inventarlas ni afectar el despiece. Las áreas invisibles de pulsación pueden ampliarse sin agrandar físicamente una unión.

No inventar reglas nativas de alineación o inserción. Conserva y documenta la alineación actualmente definida en el dominio/PDF cuando no exista evidencia suficiente, identificándola como comportamiento de Aluminior pendiente de contraste.

## 7. Fase 2B — separar responsabilidades

Extrae módulos cohesionados, con nombres acordes al repositorio:

1. Geometría pura del conjunto: rectángulos en milímetros, límites y colocación de módulos/uniones.
2. Adaptación a viewport: escala uniforme, traslación, márgenes y límites visibles.
3. Render SVG y símbolos visuales.
4. Estado y acciones de selección/edición del diseñador.
5. Paneles y catálogo existentes como componentes propios cuando su tamaño lo justifique.

Mantén `DisenadorEstructura` como composición y conserva su contrato con alta/edición salvo cambio necesario explícito. No dupliques estado de configuración ni introduzcas efectos que sobrescriban selección al recibir un error o rehidratar. La identidad seleccionada debe distinguir módulo y parte/hueco, porque las plantillas repetidas comparten IDs internos.

Respeta revisión de cohesión a 250 líneas y justificación/división sobre 400. No fraccionar arbitrariamente por número de líneas. Primero verifica equivalencia del refactor; después cambia geometría. No añadir responsabilidades a `acciones.ts`.

## 8. Fase 2C — proyección a escala común

- Usa un espacio geométrico común y una sola transformación uniforme del conjunto, preferentemente un SVG raíz o solución equivalente demostrable.
- Conserva dimensiones exteriores de módulos y grosores/longitudes de uniones según configuración. No imponer mínimos visuales que deformen esos rectángulos.
- Incluye en los límites visibles las uniones más largas que los módulos, sin cambiar automáticamente el alto contractual del cerramiento.
- Usa ajuste al espacio disponible sin distorsión horizontal/vertical. Si hace falta desplazamiento en pantallas estrechas, que sea interno al lienzo. No introducir un sistema complejo de zoom/pan si no es necesario.
- Acota medidas desde el modelo, no midiendo píxeles. Evita recortes de cotas y superposiciones que oculten elementos.
- Cambiar tamaño de ventana o selección no debe alterar serialización, cantidades, precio, snapshot o fabricación.
- Mantén selección precisa, foco visible y alternativa por teclado para módulos/uniones. No perder las operaciones existentes al pasar a SVG.
- Miniaturas de catálogo pueden ajustarse a sus celdas; no usar ese ajuste individual para la composición principal.
- Mantén el PDF consistente; comparte geometría pura si evita divergencias, conservando su adaptador y sus pruebas. No rehacer la maquetación comercial de fase 8.

## 9. Pruebas de aceptación de fase 2

| Caso | Verificación |
|---|---|
| Seis módulos de referencia | 6640×1020, orden intacto; razón 300/1200=1/4 y 100/60=5/3 en geometría proyectada |
| Un módulo muy estrecho o apaisado permitido | Sin clamp que falsee proporción; límites finitos |
| Alturas distintas | Razón de alturas preservada; alineación documentada, sin inventar reglas nativas |
| Unión más larga que módulos | Visible completa y separada de la medida contractual |
| Plantillas repetidas | Selección identifica el módulo correcto y su parte sin colisiones |
| Resize desktop/móvil | Mismo JSON; sin overflow de página, con scroll interno si es necesario |
| Error y reintento | Conserva U1 y composición, no reaparece el reset corregido en fase 1 |
| Reapertura y PDF | Misma disposición y razones geométricas desde datos persistidos |

En tests puros usa entradas y resultados geométricos calculados independientemente; no copies la implementación como supuesto oráculo. Comprueba límites, separación, monotonía de posiciones y factor común con tolerancias explícitas. Las tolerancias de render no deben ocultar deformaciones físicas.

En navegador verifica al menos 1440×900, 1024×768 y 375×812, selección de primer/último módulo y U1, teclado y foco. Revisa reduced motion si introduces movimiento; no añadir animaciones por defecto. Conserva evidencia antes/después comparable. Usa las capturas/manual de Productor para el contraste disponible e identifica qué no se ha podido observar en vivo.

Ejecuta pruebas de core afectadas, tests de geometría PDF, integración de guardado/rollback y typechecks core/web. Inspecciona comandos y URLs antes de ejecutarlos. Después de cambios de dominio, confirma que el precio y despiece no cambian por un refactor visual sobre el mismo fixture.

## 10. Fuera de alcance

No implementar ahora drag and drop ni nuevas ubicaciones de inserción (fase 3); herencia por modelo o medidas masivas (fase 4); buscador de vidrio, PAN16, travesaños interactivos o junquillos (fase 5); catálogo ampliado y acabados de uniones (fase 6); nuevas reglas de valoración (fase 7); rediseño integral del PDF (fase 8).

El selector ELEGANTPVC de Productor no es dependencia de esta corrección geométrica. No volver a bloquearse en él. No introducir migraciones salvo necesidad demostrada y alcance autorizado; una corrección de dibujo no debería cambiar el contrato persistido.

## 11. Entregables y cierre

- Actualiza `docs/paridad/fase-1/00-resumen.md` y añade evidencia del cierre pendiente, conservando el historial y límites de atribución.
- Crea `docs/paridad/fase-2/00-resumen.md`: resultado, módulos, verificaciones y límites.
- Crea `docs/paridad/fase-2/01-geometria-y-evidencias.md`: contrato de coordenadas, casos, capturas antes/después y resultados medibles.
- Crea `docs/paridad/fase-2/02-handoff-fase-3.md`: responsabilidades extraídas, interfaces y deuda realmente pendiente, sin implementar fase 3.
- Capturas/PDF/artefactos locales en `output/paridad-fase-2/`, comprobando que Git los ignore. No versionar datos reales ni activos de Productor.
- Revisa diff/status final. Reporta exactamente las pruebas ejecutadas ahora, no números heredados de otra tarea.

Entrega una respuesta breve con estado separado de fase 1 y fase 2, pruebas y enlaces. Si todos los criterios pasan, decláralo; si falta alguno, enuméralo sin llamarlo cierre administrativo. Empieza por inspeccionar el estado actual y completar el bloque 0.
