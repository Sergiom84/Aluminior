# Continuación de Aluminior: resolver y verificar las fases 0, 1 y 2

> Revisión documental 20/09/2026: **Encargo histórico inactivo**. Superpuesto a prompts previos; no reactiva la construcción desde esta auditoría.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Trabaja en `C:\Users\laral\OneDrive\Documentos\Aluminior`. Quiero que completes las fases 0, 1 y 2 con evidencia verificable. Ejecuta el trabajo; no te limites a elaborar otro plan. Conserva lo ya realizado. No declares una fase completa por cierre administrativo, por compilar o por el título de un commit.

## 1. Instrucción prioritaria: si te bloqueas, para y dime qué necesitas

Si tienes problemas con Productor, con Aluminior o con el acceso visual, **no dediques mucho tiempo a pensar ni repitas intentos equivalentes**.

- Para un mismo bloqueo, realiza una comprobación y, como máximo, un segundo intento justificado por información nueva. Dedica como máximo unos cinco minutos de diagnóstico activo; no es una obligación de esperar cinco minutos si el fallo ya está claro.
- Si no se resuelve, detén las acciones sobre la aplicación afectada y comunícame inmediatamente qué necesitas. No encadenes alternativas, reinicios, instalaciones o reparaciones por iniciativa propia.
- Si no está disponible la herramienta nativa, o `sky.list_windows()` falla o devuelve vacío, informa inmediatamente según el apartado 2; no agotes el plazo probando mecanismos alternativos.
- Una compilación o prueba que muestra progreso real no cuenta como bloqueo. Si una operación queda sin progreso, identifica su estado antes de repetirla.
- No esperes al informe final para avisar. Si hace falta mi intervención, pídela de forma concreta y espera mi respuesta antes de continuar lo que depende de ella. Puedes avanzar trabajo independiente solo después de informar del bloqueo y sin ocultarlo.

Formato de aviso:

```text
Me he detenido en: [aplicación, fase y acción].
Herramienta/canal utilizado: [nombre exacto].
Resultado observado: [error o estado literal, saneado].
He comprobado: [máximo dos comprobaciones].
Necesito que hagas o confirmes: [una acción concreta].
Queda pendiente: [criterio que no puedo verificar].
```

No me digas simplemente «restablece Computer Use». Identifica primero el canal y la operación que fallan. No afirmes que necesitas reinstalar por un inventario vacío en el canal equivocado.

## 2. Acceso visual a Productor: canal correcto obligatorio

Antes de pedir que restablezca Computer Use, verifica el canal correcto.

En sesiones anteriores Productor se controló mediante **`mcp__node_repl__js` y el paquete `@oai/sky`**. El canal **`mcp__cua_repl` tiene deshabilitadas las aplicaciones nativas**; un inventario vacío allí no demuestra un fallo del acceso nativo.

Lee la skill:

```text
C:/Users/laral/.codex/plugins/cache/openai-bundled/computer-use/26.915.31945/skills/computer-use/SKILL.md
```

Lee también las referencias `../../docs/guidance.md` y `../../docs/api.md`, resueltas desde el directorio de esa skill:

```text
C:/Users/laral/.codex/plugins/cache/openai-bundled/computer-use/26.915.31945/docs/guidance.md
C:/Users/laral/.codex/plugins/cache/openai-bundled/computer-use/26.915.31945/docs/api.md
```

Si el catálogo de skills indica una versión distinta, verifica su ubicación y referencias; no asumas que una ruta antigua significa que la capacidad no existe. Aplica las instrucciones actuales de la herramienta antes de controlarla.

Descubre la herramienta **node_repl js** entre las herramientas disponibles. Ejecuta en ella:

```javascript
if (!globalThis.sky) {
  const { sky } = await import("@oai/sky");
  globalThis.sky = sky;
}
nodeRepl.write(await sky.list_windows());
```

Si aparece Productor, continúa desde su estado actual, **comprobando empresa 0017 y presupuesto 260494 antes de modificar**. No reinicies Productor ni crees otro documento.

**Discrepancia histórica importante:** los documentos anteriores mencionan 260495; la instrucción actual del usuario pide comprobar 260494. No sustituyas una referencia por otra en la documentación ni asumas el número. Si ves 260495 u otro presupuesto, o el modal oculta la identidad de empresa/presupuesto, detente antes de escribir y pide que el usuario sitúe o confirme el documento correcto. No cierres ni descartes cambios en memoria para navegar por tu cuenta.

Si la herramienta no está disponible, o `sky.list_windows()` falla o devuelve vacío, comunica exactamente qué herramienta usaste y su resultado. **No pruebes otros mecanismos ni pidas reinstalar o restablecer nada sin identificar primero el fallo.** No recurras a PowerShell, scripts alternativos o automatización de Windows para eludir el canal indicado.

El navegador de Aluminior es una superficie distinta: usa el canal de navegador disponible siguiendo sus instrucciones. No confundas que funcione el navegador con que funcione el acceso nativo a Productor.

## 3. Estado conocido y lectura de contexto

La revisión auditada es `74e0c95 fix: completa la paridad de guardado de cerramientos`. Comprueba HEAD y Git status; esta referencia no ordena hacer checkout ni descartar cambios posteriores.

Estado al redactar este encargo:

- Fase 0 parcial: evidencia y manual archivados, selector nativo bloqueado, caso Productor completo guardado/reabierto/emitido pendiente.
- Fase 1 con arreglo implementado, integración y un recorrido UI sobre fijo. La auditoría independiente obtuvo **96 de 97 pruebas correctas**; fallo por orden `[1,0]` frente a `[0,1]` en revisiones. Typechecks core/web correctos.
- Faltan receta completa de seis módulos, conservación de U1, doble envío y reapertura/PDF de esa misma composición.
- Fase 2 preparada en un prompt detallado; no hay evidencia de implementación que permita darla por realizada.

Lee AGENTS.md, README.md, ARQUITECTURA.md y las secciones relevantes de PLAN.md, ENTREGA.md y PARIDAD-PRODUCTOR.md. Después:

1. `docs/paridad/fase-0/00-resumen.md` a `08-control-de-cierre.md`, especialmente experimentos, caso y criterios de aceptación.
2. `docs/paridad/fase-1/00-resumen.md`, `01-reproduccion-y-validacion.md`, `02-desbloqueo-entorno.md`, `03-validacion-ui-pdf.md` y `04-auditoria-74e0c95.md`.
3. `PROMPT-FASE-0-PARIDAD-PRODUCTOR.md`.
4. `PROMPT-FASE-1-GUARDADO-ALUMINIOR.md`.
5. **`PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md`**, que contiene el bloque de cierre de fase 1 y los pasos técnicos de fase 2.

Este encargo actual prevalece sobre los límites históricos que decían no pasar a la fase siguiente: autorizo completar las tres fases. Conserva sus restricciones sobre datos y alcance. No iniciar fases 3–8. No crear otra conversación ni delegar agentes. No hacer commit, push o despliegue sin petición posterior.

## 4. Seguridad y continuidad del trabajo

- Empresa Productor 0016: solo lectura; no experimentar ni modificarla.
- Empresa 0017: pruebas autorizadas dentro del documento confirmado; conservar los documentos existentes.
- No escribir en la base remota de Aluminior. Pruebas de escritura solo locales y sintéticas.
- No imprimir `.env`, contraseñas, datos de clientes ni volcar información sensible a Git.
- No cambiar de copia del repositorio, resetear cambios ni limpiar archivos no versionados.
- Capturas y PDF sensibles en `output/` ignorado; documentación saneada en `docs/paridad/`.
- No ejecutar ni registrar componentes legacy adicionales, saltar licencias o usar Productor como dependencia del runtime web.

## 5. Resolver fase 0: evidencia nativa, no nuevas funciones web

Retoma las 22 referencias y el manual ya extraído en `output/paridad-fase-0/20260920/`. No volver a extraer ni reconstruir evidencia disponible. Comprueba manifiesto y rutas antes de depender de ellas.

Una vez confirmados visualmente 0017 y el presupuesto solicitado:

1. Resuelve con observación la selección de perfil. El usuario ha comprobado que pulsar la fila ELEGANTPVC no navega y el botón derecho ofrece Exportar/Vincular. No repetir esos clics como solución ni confundir ese menú de tabla con el del hueco.
2. Si Aceptar no responde o el modal sigue bloqueado, aplica inmediatamente el protocolo de parada. No repetir Intro/Espacio/Esc sin una nueva explicación verificable; ya se intentaron en otra sesión.
3. Normaliza nombre/obra de prueba solo en el documento confirmado y verifica el texto realmente visible después de introducirlo. Hubo antecedentes de escritura incorrecta por el canal de pegado.
4. Completa los experimentos pendientes de `03-reglas-y-experimentos.md`: selección, puntos de inserción, alcance real de Actualizar/Actualizar todos, perfil/vidrio entre modelos iguales y distintos, excepciones por hueco y uniones. Registra entradas y salidas antes/después; no inventes reglas a partir de etiquetas.
5. Obtén un caso nativo materialmente completo: módulos, dimensiones, uniones, perfiles, vidrio, acabado, tarifa y ajustes explícitos. Si el documento ya contiene datos útiles, continúa sobre ellos sin reconstruirlos por comodidad.
6. Guarda, reabre y previsualiza/emite a archivo del documento de pruebas autorizado. No enviar a una impresora física ni a terceros. Captura línea GRUPO, dibujo, medidas, cantidad, precio, descuento, impuestos y total.
7. Actualiza matriz de 17 pasos, mapa de evidencias y control de cierre. Diferencia lo observado, lo confirmado por manual, las mejoras pedidas y las hipótesis.

No equiparar la composición Productor de referencia visual 6900×1020 con la receta web 6640×1020: faltan entradas para establecer esa igualdad. No exigir igualdad de precio entre configuraciones distintas.

Fase 0 completa exige cerrar sus criterios pendientes con evidencia. Si una regla sigue sin demostrarse, indica cuál y pide la intervención concreta necesaria; no ocultarla con un cierre administrativo.

## 6. Resolver fase 1: aceptación completa del guardado

Sigue el **bloque 0** de `PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md` y los criterios originales de fase 1.

### Prueba fallida

Revisa `linea-valorada.integracion.test.ts:121` y `_lib/copia/leer-origen.ts`. Si el contrato exige orden, garantiza orden explícito; si las revisiones son un conjunto, compara sin orden conservando cardinalidad y las demás aserciones. No borrar la prueba ni repetir hasta obtener un verde casual. La diferencia observada no demuestra pérdida económica ni que el nuevo commit la causara.

### Receta obligatoria

M1/M2/M3/M5/M6: 2O, 1200×1020. M4: fijo 0, 300×1020. U1: PSU001, 100×1020. U2–U5: GMU038, 60×1020 cada una. Global: **6640×1020**.

Materiales de referencia: ELEGANTPVC, V420AGS4, doble acristalamiento, acabado L, cantidad 1 y horas adicionales 0. Si se usan equivalentes sintéticos de catálogo, documentarlos y no presentar sus precios como comerciales.

Comprueba en navegador:

1. Error recuperable conserva todos los datos, composición y selección.
2. U1 sigue PSU001 en selector, dibujo y configuración serializada.
3. Corrigiendo solo el error, doble clic/envío por teclado durante el reintento produce una sola GRUPO sin satélites duplicados.
4. Recarga completa y reapertura reconstruyen esa misma configuración desde servidor.
5. PDF real de esa composición: inspección visual de dibujo, cotas, cantidad, importes y total. Un HTTP 200 no basta.

Mantén pruebas de rollback entre escrituras, alta/edición, cantidad distinta de uno y ajustes explícitos. La atribución histórica exacta a 260004 es opcional; no bloquea el cierre ni autoriza a modificarlo.

Docker está instalado fuera del PATH; ruta y recuperación previa están documentadas. No reinstalarlo ni restablecerlo por defecto. Si falla ahora, aplica la regla de diagnóstico breve y aviso.

Integración en `aluminior_test`; UI en `aluminior_qa_test`, ambas locales. Verifica la conexión efectiva del servidor aparte de TEST_DATABASE_URL. La semilla QA existente recrea su documento: no ejecutarla sobre evidencia en curso sin preservarla. No debilitar autenticación de producción.

## 7. Resolver fase 2: escala común y diseñador modular

Una vez aceptada fase 1, ejecuta las subfases y la matriz completa de `PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md`.

Resultados obligatorios:

- Geometría del conjunto en milímetros y proyección con un solo factor de escala.
- Fijo 300 frente a módulo 1200: relación 1:4. Uniones 100 frente a 60: relación 5:3.
- Sin clamps de proporción o mínimos CSS por módulo que deformen el conjunto.
- Alturas distintas y uniones más largas representadas sin recortar ni alterar las medidas contractuales.
- Geometría pura, adaptación de viewport, render, selección y paneles separados por responsabilidades; diseñador como composición.
- Estado y selección coherentes para plantillas repetidas; sin regresión del error/reintento.
- PDF y pantalla consistentes, reutilizando geometría pura sin importar desde core módulos privados del PDF.
- Comprobaciones a 1440×900, 1024×768 y 375×812; foco y teclado, sin overflow de página.
- Mismos valores económicos y configuración persistida para el mismo fixture después del refactor visual.

No adelantar catálogo/drag and drop, herencia, buscador de vidrio, travesaños interactivos, catálogo ampliado de uniones ni nueva valoración. Esas funciones corresponden a fases posteriores.

## 8. Entrega y criterio de finalización

Mantén un registro sencillo de criterio, evidencia, resultado y pendiente por fase. Actualiza los documentos existentes y crea los entregables de fase 2 indicados en su prompt.

Verifica tests pertinentes, typechecks, diff y Git status. Reporta los resultados de esta ejecución y separa pruebas heredadas de pruebas repetidas. No afirmar una comprobación visual que no se haya realizado.

Entrega final con tres estados separados:

| Fase | Estado | Evidencia de aceptación | Pendiente si existe |
|---|---|---|---|
| 0 | Completa o pendiente | Observación nativa, reglas y caso persistido/emitido | Concreto |
| 1 | Completa o pendiente | Receta de seis módulos, error/reintento, U1, doble envío, reapertura/PDF e integración | Concreto |
| 2 | Completa o pendiente | Escala común, modularización, regresiones y contraste visual | Concreto |

Mi objetivo es dejar las tres resueltas. Si necesitas que intervenga para lograrlo, **para y dímelo pronto, indicando exactamente qué debo hacer**. No sustituyas esa petición por largos intentos ni por declarar parcial una fase sin avisarme mientras trabajas.
