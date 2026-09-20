# Aluminior — encargo maestro para continuar las fases 0–8

> Revisión documental 20/09/2026: **Encargo histórico inactivo**. Fases futuras conservadas como alcance propuesto, esperando indicación del usuario.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

## Encargo

Continúa Aluminior en `C:\Users\laral\OneDrive\Documentos\Aluminior` hasta completar las fases de paridad 0–8 descritas aquí. Ejecuta investigación, implementación y verificación; no entregues solamente otro plan. Conserva todo el trabajo existente y avanza por criterios de aceptación. No declares completa una fase por compilar, por el título de un commit o por un cierre administrativo.

Este documento contiene el contexto y el alcance de todas las fases. Los documentos del repositorio aportan evidencias y detalle. Las instrucciones actuales del usuario prevalecen sobre prompts anteriores que limitaban el encargo a una fase. No iniciar funciones ajenas a estas fases, no desplegar, no hacer push ni commit, no crear otra tarea ni delegar agentes salvo petición posterior.

## 1. Estado que debes comprobar al empezar

Lectura del workspace del 20/09/2026, **no auditoría nueva del código ni certificación de las pruebas declaradas por otra tarea**:

- HEAD: `74e0c95 fix: completa la paridad de guardado de cerramientos`.
- Hay cambios SIN COMMIT en core, diseñador, lienzo, PDF, CSS, lector de revisiones, fixtures y documentación. Consérvalos; no resetear ni reinstalar para volver al commit.
- Fase 0: parcial. El canal nativo encontró Productor, pero la última captura mostró Codex y el árbol accesible una ventana interna deshabilitada. No se verificaron simultáneamente empresa 0017 y presupuesto 260494. Se pidió al usuario dejarlos visibles sin modal.
- Fase 1: existe una GRUPO sintética de seis módulos, 6640×1020, en `QA-269901`, base `aluminior_qa_test`. La documentación acredita reapertura y U1=PSU001. La primera línea quedó sin valorar por falta de recetas QA; hay una extensión de catálogo sintético. **El reintento de edición queda en «Guardando…» y, según la observación registrada, no envía nueva petición.** Falta resolverlo, valorar y examinar el PDF de esa composición.
- Fase 2: geometría pura y SVG común ya implementados según los documentos actuales. Pantalla y PDF comparten geometría; selección incluye módulo. Hay observación a tres tamaños, pero aceptación final pendiente del bloqueo de fase 1, PDF y teclado.
- Fases 3–8: son el alcance siguiente, no se dan por implementadas ni por ausentes sin inspección.

Primera acción: Git status/log y lectura de los resúmenes actuales. Si otra tarea sigue editando el mismo workspace, coordina con el usuario antes de modificar los mismos archivos; puedes leer y preparar el diagnóstico. No confundir cambios nuevos con cambios ajenos que deban descartarse.

### Documentos que debes leer

- AGENTS.md, README.md, ARQUITECTURA.md, PARIDAD-PRODUCTOR.md y secciones pertinentes de PLAN.md/ENTREGA.md. Distingue el plan histórico de julio de estas fases de paridad.
- `docs/paridad/fase-0/00-resumen.md` a `08-control-de-cierre.md`.
- `docs/paridad/fase-1/00-resumen.md` a `04-auditoria-74e0c95.md`.
- `docs/paridad/fase-2/00-resumen.md`, `01-geometria-y-evidencias.md`, `02-handoff-fase-3.md`.
- Prompts detallados existentes: `PROMPT-FASE-0-PARIDAD-PRODUCTOR.md`, `PROMPT-FASE-1-GUARDADO-ALUMINIOR.md`, `PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md` y `PROMPT-CONTINUACION-FASES-0-1-2.md`.

Las instrucciones antiguas de «no pasar a fase siguiente» quedan ampliadas por este encargo. Sus afirmaciones históricas sobre pendientes deben contrastarse con el estado actual; no rehacer una corrección demostrada.

## 2. Si te bloqueas, para y dime qué necesitas

No dediques largos periodos a razonar sobre una aplicación que no responde ni repitas el mismo gesto.

- Máximo una comprobación y un segundo intento sustentado en información nueva por bloqueo, o unos cinco minutos de diagnóstico activo, lo que ocurra antes.
- Si la herramienta nativa falta o su inventario falla/está vacío, informa inmediatamente; no pruebes alternativas para agotar el plazo.
- Detén las acciones sobre la aplicación afectada y pide una intervención concreta. Espera mi respuesta para lo dependiente; puedes avanzar trabajo independiente después de avisar.
- Una prueba o compilación que progresa normalmente no es un bloqueo. Una operación sin progreso requiere revisar su estado, no lanzarla otra vez.
- No reinicies, reinstales, restablezcas a fábrica ni cierres sesiones con cambios sin una instrucción específica. No presentes como necesario un restablecimiento sin haber identificado el fallo.

Comunica así:

```text
Me he detenido en: [aplicación/fase/acción].
Herramienta utilizada: [nombre exacto].
Resultado: [error o estado observado, sin secretos].
He comprobado: [máximo dos comprobaciones].
Necesito que hagas o confirmes: [acción concreta].
Queda pendiente: [criterio de aceptación].
```

No esperes al final para decir que no puedes continuar. No declares una fase cerrada para sortear un bloqueo.

## 3. Control de Productor: canal correcto

Antes de pedir restablecer Computer Use, verifica el canal correcto. Productor se controló mediante **`mcp__node_repl__js` + `@oai/sky`**. `mcp__cua_repl` tiene deshabilitadas las aplicaciones nativas; un inventario vacío allí no demuestra un fallo del acceso nativo.

Lee la skill y las referencias antes de actuar:

```text
C:/Users/laral/.codex/plugins/cache/openai-bundled/computer-use/26.915.31945/skills/computer-use/SKILL.md
C:/Users/laral/.codex/plugins/cache/openai-bundled/computer-use/26.915.31945/docs/guidance.md
C:/Users/laral/.codex/plugins/cache/openai-bundled/computer-use/26.915.31945/docs/api.md
```

Las dos últimas son `../../docs/guidance.md` y `../../docs/api.md` desde el directorio de la skill. Si el catálogo actual apunta a otra versión, verifica sus rutas reales.

Descubre la herramienta node_repl js y ejecuta en ella:

```javascript
if (!globalThis.sky) {
  const { sky } = await import("@oai/sky");
  globalThis.sky = sky;
}
nodeRepl.write(await sky.list_windows());
```

Si aparece Productor, continúa desde su estado actual comprobando **empresa 0017 y presupuesto 260494** antes de escribir. No reinicies Productor ni crees otro documento. Los antecedentes mencionan 260495: si aparece ese número, otro documento, o un modal oculta identidad, pide confirmación o que el usuario sitúe el correcto. No cambies por tu cuenta de documento ni descartes cambios.

Si falta la herramienta, la llamada falla o devuelve vacío, comunica herramienta y resultado exactos. No pruebes otros mecanismos ni pidas reinstalar/restablecer sin identificar el fallo. Tampoco uses automatización nativa por shell como alternativa. Si la captura muestra otra app o el árbol no corresponde con la ventana visible, detente y pide que el usuario deje Productor visible y operativo.

La navegación de Aluminior usa el canal de navegador disponible y sus instrucciones. Que funcione el navegador no demuestra acceso nativo a Productor.

## 4. Reglas de datos, arquitectura y evidencia

- Productor 0016 es activo y solo lectura. 0017 es pruebas; escribir únicamente en el documento confirmado. No modificar maestros para resolver el selector.
- Aluminior: escrituras de prueba solo en PostgreSQL local sintético. No migrar, vaciar ni modificar la base remota. `.env` solo si es imprescindible y sin mostrar valores.
- Base de integración `aluminior_test`; UI `aluminior_qa_test`, puerto local 55433. No mezclar fixtures de UI con integración.
- Docker está instalado fuera del PATH en `C:/Users/laral/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe`. Compose: `packages/db/docker-compose.yml`. La recuperación previa está documentada; no repetirla sin diagnóstico actual.
- Verifica conexión efectiva tanto de tests como del servidor: TEST_DATABASE_URL no configura necesariamente la web. Mantén los gates del bypass QA existente; nunca habilitarlo en producción.
- Las semillas existentes pueden recrear su documento: inspecciónalas antes de ejecutarlas y conserva evidencia/documentos en curso.
- Dominio puro en core; persistencia en servicios transaccionales; acciones/páginas como composición. Respeta los límites de cohesión de AGENTS.md. No engordar `acciones.ts` ni recrear otro diseñador monolítico.
- No copiar código, activos o binarios de Productor, saltar licencias ni convertirlo en dependencia de Aluminior.
- Cada regla necesita fuente: observación, manual, captura, datos autorizados o decisión explícita del usuario. Las hipótesis no son paridad verificada. Las mejoras solicitadas se etiquetan como tales.
- Antes de migraciones nuevas, documenta necesidad, alcance local y reversibilidad; no ejecutar en remoto ni reescribir migraciones históricas.
- Preserva valorado/incompleto/sin valorar. Una falta de tarifa no es cero y un precio provisional no es una valoración cerrada.

## 5. Secuencia y puertas de aceptación

| Fase | Resultado |
|---|---|
| 0 | Evidencia, reglas y caso de referencia comprobables |
| 1 | Guardado fiable, atomicidad, conservación de formulario y reintento |
| 2 | Geometría común y diseñador modular |
| 3 | Flujo de presupuesto, catálogo, inserción y selección |
| 4 | Configuración por elemento, herencia comprobada y medidas masivas opcionales |
| 5 | Buscador de vidrio y edición interna de huecos |
| 6 | Catálogo y propiedades de uniones |
| 7 | GRUPO y valoración contrastada con entradas idénticas |
| 8 | PDF, teclado, adaptación y aceptación completa |

Retoma primero el bloqueo actual de fase 1 y termina la aceptación de fase 2, sin rehacer sus implementaciones. Intenta completar fase 0 por el canal correcto. Si requiere intervención, informa; el código independiente puede avanzar, pero ninguna regla desconocida se inventa. Antes de cada fase posterior comprueba sus dependencias concretas, no uses «fase 0 parcial» como bloqueo indiscriminado.

## Fase 0 — completar evidencia y referencia

### Trabajo

1. Reutiliza las 22 referencias archivadas y el manual extraído en `output/paridad-fase-0/20260920/`. Comprueba rutas/manifiesto; no extraer otra vez por defecto.
2. Con 0017/260494 confirmados, observa el flujo de nuevo presupuesto, nombre/obra, línea y cerramiento desde el estado existente sin crear otro documento.
3. Resuelve por observación el selector ELEGANTPVC. Pulsar la fila no navega y el menú secundario Exportar/Vincular no es el menú del hueco. No repetir gestos fallidos como estrategia.
4. Completa E01–E16 o los experimentos vigentes en `03-reglas-y-experimentos.md`: inserción, selección, propiedades, Actualizar/Actualizar todos, materiales, medidas, escuadra, travesaños, vidrio, junquillos, botón de recuadros y uniones.
5. Para herencia usa A1/A2 del mismo modelo y B1 distinto: cambia A1, registra A2/B1; añade A3; introduce una excepción en A2 y repite. Separa perfil, vidrio, acabado y medidas; no extrapoles resultados entre campos.
6. Registra un caso materialmente completo, guarda, reabre y emite a pantalla/archivo. Comprueba GRUPO, dibujo, dimensiones, cantidad, precio, descuento, impuestos y total. No imprimir físicamente ni enviar a terceros.

### Aceptación

Mapa de 17 pasos con fuente y estado; reglas confirmadas separadas de hipótesis; caso persistido y reabierto; campos y resultados registrados. Una regla inaccesible requiere intervención concreta, no un cierre administrativo.

**Referencia importante:** 6900×1020 y 3868,19 EUR de las capturas Productor no tienen todas las entradas conocidas. No son el oráculo de la receta web 6640×1020.

## Fase 1 — cerrar guardado y reintento

### Trabajo prioritario actual

1. Inspecciona el reintento de edición que queda en «Guardando…». Confirma si existe petición, respuesta, error de consola, transición pendiente o validación nativa; no asumas la causa del relato anterior. Aplica el límite de diagnóstico y pide ayuda si el entorno impide observarlo.
2. Corrige la causa mínima en el módulo responsable. Mantén todos los campos y selección ante error; no quites validadores ni captures errores devolviendo éxito.
3. Comprueba la corrección pendiente del orden de `revisionesUsadas`: el fallo auditado fue `[1,0]` frente a `[0,1]`. Hay cambios locales en el lector; verifica su contrato y tests, no repitas la implementación automáticamente.
4. Conserva transacción común de línea, configuración, snapshot, despiece, mano de obra y totales. Prueba rollback después de escrituras, tanto alta como edición.

### Receta obligatoria de regresión

| Módulos | Tipo | Ancho | Alto |
|---|---|---:|---:|
| M1, M2, M3, M5, M6 | 2O | 1200 | 1020 |
| M4 | Fijo 0 | 300 | 1020 |

U1=PSU001, grosor 100, longitud 1020. U2–U5=GMU038, grosor 60, longitud 1020. Global **6640×1020**: 6000+300+100+240. Materiales de referencia ELEGANTPVC/V420AGS4/doble/L; cantidad 1, horas adicionales 0. Se permiten equivalentes sintéticos documentados para verificar el código, sin atribuirles precio comercial real.

### Aceptación

- Error recuperable conserva módulos, medidas, orden, selección, serie, vidrio, acabado, cantidad y horas.
- U1 coincide en selector, dibujo y JSON después del error.
- Reintento con doble clic/Enter durante pendiente crea una sola GRUPO y satélites coherentes; disabled no es prueba suficiente.
- Con catálogo sintético suficiente, valoración completa; otro caso incompleto sigue explícitamente incompleto.
- Recarga/reapertura y PDF inspeccionado de ESA composición. No basta el fijo probado anteriormente ni HTTP 200.
- Integración y typechecks pertinentes correctos. La atribución histórica a 260004 es opcional, no escribir sobre él.

## Fase 2 — terminar geometría y modularización

### Trabajo

Inspecciona lo ya creado: `geometriaCerramiento`, `proyectarCerramiento`, `LienzoCerramiento`, selección con `moduloId` y adaptador PDF. Usa el prompt detallado de fase 2 para completar, no para rehacer.

- Geometría en milímetros con escala uniforme para todo el conjunto.
- Sin clamps ni mínimos CSS por módulo que deformen dimensiones físicas.
- Límites visibles incluyen uniones más largas sin alterar el alto contractual.
- Separación de geometría, proyección, render, estado/selección y paneles. Core no importa React, I/O ni módulos privados del PDF.
- Identidades únicas para piezas seleccionadas en plantillas repetidas. Mantener foco y teclado al cambiar a SVG.

### Aceptación

Relaciones 300:1200=1:4 y 100:60=5:3; alturas diferentes y tamaños extremos permitidos sin deformación; mismos datos al redimensionar; pantalla/PDF consistentes; sin regresión de guardado. Comprobar 1440×900, 1024×768 y 375×812, primer/último módulo y U1 por teclado, sin overflow de página. No cambiar precio/despiece por refactor visual.

## Fase 3 — presupuesto, catálogo, inserción y selección

### Objetivo

Recorrer nombre/obra → añadir línea → cerramiento → catálogo de familias → composición → selección contextual con el modelo operativo de Productor y sin navegación innecesaria.

### Implementación

1. Contrasta cabecera mínima: cliente de catálogo opcional, nombre libre y obra; persistencia al reabrir. Búsqueda por prefijo de código y fragmentos parciales del nombre en cualquier orden, guardando código canónico.
2. Mantén Cerramiento como acceso principal. Si está preseleccionado, documenta equivalencia; no añadir clics para imitar automatizaciones históricas.
3. Catálogo de familias/modelos con miniaturas propias y significado correcto: segunda oscilobatiente de referencia y fijo 0 deben ser identificables. No copiar miniaturas propietarias.
4. Implementa arrastre a destinos válidos observados y señales equivalentes a los puntos verdes. No permitir destinos que el dominio no soporte ni fingir geometría bidimensional con una cadena lineal.
5. Añade alternativa de teclado/clic para insertar en un destino explícito, manteniendo el arrastre solicitado. La semántica de clic en miniatura (reemplazar o añadir) necesita evidencia y no debe variar silenciosamente.
6. Inserción y eliminación mantienen IDs estables, orden y uniones coherentes. No sobrescribir códigos/acabados elegidos al recalcular adyacencias sin una regla definida.
7. Lista de módulos/uniones y panel contextual sincronizados con el lienzo. Selección de elemento, unión y hueco claramente diferenciadas.

### Aceptación

Cinco 2O y fijo entre tercero y cuarto, insertados con el flujo previsto; orden estable y geometría común. Destinos ilegales rechazados sin perder estado. Selección correcta en lista/lienzo/panel, teclado y recarga. Pruebas de inserción/eliminación en posiciones soportadas y regresión de guardado.

No incluir aún herencia o edición interna de huecos. Si una posición nativa no está demostrada, recoger evidencia antes de fijarla como contrato.

## Fase 4 — configuración por elemento y aplicación colectiva

### Objetivo

Configurar materiales y dimensiones del elemento seleccionado, respetar excepciones y ofrecer la mejora solicitada de aplicar medidas individualmente o a modelos iguales.

### Implementación

1. Define identidad de modelo usando códigos/reglas verificadas, no solo apariencia ni dimensiones actuales. Distingue valor general, heredado y excepción explícita.
2. Implementa perfil, vidrio, variante y acabados por elemento en el ámbito demostrado. No confundir acabado de perfil con accesorio o unión.
3. Reproduce la herencia únicamente según E05/E06 verificados. «Actualizar todos» no demuestra por sí solo que copie medidas a modelos iguales.
4. Mejora autorizada: al cambiar medidas, permitir «solo este» o «modelos iguales», mostrando destinatarios/cantidad antes de aplicar y sin sobrescritura silenciosa de otros modelos.
5. Documenta si se propaga ancho, alto o ambos; respeta restricciones geométricas y de compatibilidad por elemento. Si alguno no admite el cambio, no dejar una operación colectiva parcialmente aplicada sin información explícita.
6. Persiste el origen/ámbito de valores que sea necesario para preservar excepciones al cambiar el general, reabrir o añadir un módulo nuevo. Evoluciona el contrato de configuración con compatibilidad de documentos existentes si hace falta.

### Aceptación

A1/A2 iguales y B1 distinto; cambio individual solo modifica A1. Operación colectiva afecta exactamente los destinatarios anunciados. Prueba A3 nuevo, excepción A2, cambio de general y vuelta a herencia. Reapertura/PDF/valoración resuelven los mismos materiales. Ningún precio previo queda presentado como vigente tras cambiar configuración.

## Fase 5 — vidrio y editor interno de huecos

### Objetivo

Buscar doble acristalamiento y editar huecos, travesaños, paneles y opciones gráficas según la evidencia.

### Subfases

**5A. Buscador de vidrio.** Abrir desde el campo correspondiente; seleccionar cámara, vidrio 1 y vidrio 2; consultar resultados y equivalentes existentes. Resolver el código desde catálogo, no concatenarlo suponiendo una convención. Sin coincidencias: estado explícito, no crear un artículo ni asignar precio inventado. Confirmar aplica en el ámbito activo; cancelar conserva lo anterior.

**5B. Entrada al editor.** Verificar qué hace la escuadra antes de replicarla. Menú contextual sobre el hueco con Vidrio/Añadir Travesaño y demás opciones solo si están sustentadas. Añadir alternativa visible/teclado para funciones necesarias; no exigir clic secundario en móvil.

**5C. Travesaños.** Orden contextual inicia horizontal equidistante con dos huecos según manual. Implementar orientaciones y referencia arriba/abajo/izquierda/derecha verificadas, cota fija/equidistante y cota al eje. No confundir equidistancia de ejes con igualdad de vidrio útil. Cota variable solo en el ámbito de estructuras genéricas que corresponda, sin prometerla para cualquier línea.

**5D. Relleno.** Vidrio/panel explícito por superficie; Genérico elimina la excepción local. G1 general + PAN16 en S1: cambiar general a G2 conserva PAN16 en S1 y actualiza superficies heredadas. Identidades de huecos estables; al dividir/eliminar, definir y probar destino de excepciones para no perderlas silenciosamente.

**5E. Junquillos gráficos.** Opciones avanzadas de presencia/tipo de corte afectan al dibujo. El despiece depende de la serie. No convertir un control gráfico en una regla de fabricación o precio. Salidas/rejillas descritas solo como gráficas no se cobran por inferencia.

### Aceptación

Dividir un fijo, configurar orientación/cota, poner PAN16 en un hueco, cambiar vidrio general, guardar/reabrir y emitir. Comparar geometría, IDs, rellenos y partidas. Cambiar solo corte gráfico no modifica despiece ni precio. Medidas imposibles y catálogos incompatibles se rechazan conservando el estado.

## Fase 6 — uniones, catálogo y acabados

### Objetivo

Seleccionar y configurar uniones reales del catálogo con su geometría y valoración comprobadas.

### Implementación

1. Identifica la función exacta del botón de recuadros de REF-20 antes de implementarlo. No dar por hecho que activa uniones por estar cerca de Aceptar.
2. Selector de unión independiente, accesible desde lienzo/lista; catálogo filtrado por compatibilidad demostrada.
3. Modelo explícito de código, grosor gráfico, longitud, L1/L2, tipo, acabado y receta cuando proceda. No confundir grosor dibujado con consumo del perfil ni longitud con altura de módulo.
4. Introduce tipos recta/ángulo/regulables solo con contrato geométrico y datos sustentados; no tratar una unión angular como separador lineal si cambia la disposición.
5. Asigna acabado en su ámbito y comprueba conservación tras error, cambio de selección y reapertura.
6. Mantén las recetas y restricciones por series. Catálogo inexistente/incompatible debe quedar explícito, sin reemplazo automático por GMU038.

### Aceptación

U1 y U2 con códigos/acabados diferentes, modificación individual, longitud y medidas globales justificadas, fallo/reintento y reapertura correctos. Comparar piezas, tornillos y mano de obra de la receta sintética contra un oráculo independiente. Para caso real, usar únicamente datos autorizados y mismas entradas en ambos sistemas.

## Fase 7 — línea GRUPO y valoración contrastada

### Objetivo

Una composición persistida se representa como una única GRUPO coherente con su configuración, descripción, dibujo, medidas y resultado económico.

### Implementación y contraste

1. Inventaría el pipeline existente antes de cambiar fórmulas: módulos, uniones, accesorios, vidrio, costes, venta y ajustes manuales.
2. Genera descripción a partir de datos efectivos; no anunciar material, color o vidrio que no esté asignado. Mantén código GRUPO y campos operativos de referencia.
3. Separa cantidad de la línea de consumo de composición. Prueba cantidades 1, 2 y 3, evitando doble multiplicación de material o mano de obra.
4. Fabricación/instalación manuales son ajustes explícitos; no deducirlos de histórico ni aplicarlos de nuevo al reabrir.
5. Documenta tarifa, fecha, divisa, descuento, escalas y puntos de redondeo. Investiga diferencias por componente, no introduzcas un factor global para alcanzar el total de Productor.
6. Estados incompleto/sin valorar/valorado visibles y coherentes con el snapshot. Una edición invalida/recalcula el resultado conforme al contrato; un snapshot histórico no debe cambiar porque cambie el catálogo.
7. Valida guardado, copia/revisión y edición con transacciones, coherencia de satélites e identidad de origen.

### Aceptación

Fixture sintético con oráculo de partidas/importes; comparación Productor/Aluminior solo con entradas idénticas y suficientes. Tabla de diferencias con causa y tolerancia justificada cuando corresponda. Subtotal, descuento, impuestos y total consistentes con línea/PDF. Una falta de evidencia real se declara; no sustituirla con la cifra de REF-22.

## Fase 8 — PDF, interacción y aceptación integral

### Objetivo

Completar el recorrido real de presupuestación hasta previsualización/archivo, con teclado y adaptación sin perder densidad operativa.

### Implementación y verificación

1. Recorre los 17 pasos originales de principio a fin, vinculando cada uno a su acción equivalente y evidencia. Distingue equivalencia funcional de copia de chrome Windows.
2. Emitir/previsualizar según formatos priorizados por el flujo: con dibujo y valoración como mínimo para el caso de referencia. Los formatos adicionales observados se inventarían y se implementan o se registran como brecha explícita, sin afirmar paridad total mientras falten los exigidos.
3. PDF con identidad/revisión, cliente o nombre libre, obra, descripción, dibujo, medidas, cantidad, precio/descuento y totales correspondientes. Estado no valorado nunca debe parecer un presupuesto gratuito.
4. Prueba varias líneas y varias páginas, textos largos, composiciones anchas y estrechas, ausencia opcional de cliente, caracteres españoles y números decimales. Sin recortes, solapes ni dibujo deformado.
5. Comprueba que UI y PDF leen la misma configuración/resultados persistidos. Renderiza y examina el archivo; no basta generar bytes.
6. Teclado completo: foco visible, orden útil, selección, confirmar/cancelar y retorno de foco en diálogos. Preserva atajos de Productor verificados y evita conflictos del navegador. No inventar teclas como si fueran nativas.
7. Desktop y móvil: formularios operables, tablas/lienzo con desplazamiento interno cuando proceda, ningún control inaccesible por overflow, contraste/etiquetas y reduced motion.
8. Verifica errores, reintento, latencia, doble envío, recarga, reapertura y aislamiento de datos en el recorrido completo.

### Aceptación final

Caso completo guardado, reabierto y emitido; 17 pasos cubiertos con evidencia; tests pertinentes/typechecks correctos; ausencia de regresión económica; pendientes y desviaciones explícitos. No enviar a impresora física ni publicar/mandar presupuestos reales sin autorización específica.

## 6. Entregables comunes y forma de avanzar

Por cada fase N conserva o crea:

- `docs/paridad/fase-N/00-resumen.md`: estado real, cambios, evidencia y límites.
- Documentación de pruebas y evidencia con entradas/salidas, fecha, revisión y comandos reproducibles.
- Handoff a la fase siguiente: interfaces, dependencias y pendientes concretos.
- Capturas/PDF/logs saneados en `output/paridad-fase-N/`, comprobando ignore. No versionar datos reales, secretos ni contenido propietario.

Mantén una tabla maestra en `docs/paridad/ESTADO-FASES.md` con fase, estado, criterio pendiente, evidencia y dependencia. Actualiza avances reales; no copies como propias pruebas de otra conversación.

Antes de modificar un módulo: inspecciona código/tests y define el cambio mínimo. Después: pruebas significativas del comportamiento, typecheck afectado, diff/status. No repetir suites completas sin cambios o fallos que lo justifiquen. Las pruebas de DB deben validar explícitamente host/base sintéticos antes de escribir.

Al cerrar cada fase comunica brevemente el resultado y continúa la siguiente autorizada si no hay bloqueos ni decisiones pendientes. Si falta una decisión de producto que la evidencia no resuelve, prepara las alternativas concretas y pregunta; no inventes comportamiento canónico.

El informe final debe distinguir **implementado**, **probado en integración**, **observado en UI** y **contrastado con Productor**. No son sinónimos. Incluye enlaces y una tabla de fases 0–8. El objetivo es cerrar todas con pruebas; si necesitas mi intervención, detente y dímelo pronto.
