# Auditoría de la entrega de fase 0 y devolución a Terra

> Revisión documental 20/09/2026: **Auditoría histórica**. Dictamen parcial; varios entregables que menciona no están en este checkout.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Fecha de revisión: 20/09/2026.

## Dictamen

**La fase 0 no está aprobada como completa.** Hay una base documental útil y están los siete archivos solicitados, pero faltan la investigación dinámica y un caso Productor reproducible. Los propios entregables la declaran parcial.

Esta auditoría revisa la entrega documental y sus evidencias disponibles. No ha vuelto a operar Productor, no ha escrito en bases de datos y no ha modificado los documentos de Terra.

## Comprobaciones realizadas

- Leídos los siete archivos de `docs/paridad/fase-0/` y el README de su carpeta de evidencias.
- Contrastados con `PROMPT-FASE-0-PARIDAD-PRODUCTOR.md` y los antecedentes de esta tarea.
- HEAD actual: `96c9337b9e5910e7c15030dc26a687ccde5a2f98`, coincidente con el declarado por Terra.
- No hay cambios de archivos versionados en el diff. Antes de esta devolución estaban sin seguimiento el prompt de fase 0 y `docs/`.
- Los 22 archivos originales referenciados existen actualmente en Temp. Su disponibilidad actual no demuestra cuándo fueron inspeccionados.
- El CHM existe en `C:\Productor\Aluminio\ManualUsr\Aluminio.chm`.
- La carpeta `output/paridad-fase-0/20260920/` está ignorada por Git, pero contiene únicamente `README.local.md`: no hay capturas nuevas archivadas.
- Se han abierto de nuevo REF-22 y REF-19 para comprobar omisiones concretas de la extracción de evidencia.

## Lo que sí está bien

- Se mantienen separados el caso del vídeo y la composición de prueba de Aluminior.
- Se reconoce que el cerramiento de Aluminior no se guardó.
- No se inventa una causa técnica para el error del snapshot.
- Se distingue la mejora propuesta de medidas masivas de la herencia declarada por el usuario.
- Se identifica la mayoría de las incertidumbres en lugar de afirmar paridad inexistente.
- El handoff de fase 1 conserva las invariantes de atomicidad y de valoración incompleta.
- La entrega declara que detuvo las entradas cuando perdió fiabilidad de control; no debe continuarse con un foco incierto.

## Correcciones necesarias

### R01 — Resolver la contradicción sobre la sesión y el documento 260495

`00-resumen.md` dice que se confirmó 0017, se creó el presupuesto 260495 y se editó su nombre. `output/paridad-fase-0/20260920/README.local.md` dice que no se confirmó 0017 y no se creó ningún documento.

**Trabajo requerido:** contrastar los registros disponibles de la sesión y, si el control es fiable, comprobar en lectura la empresa y el documento. Actualizar resumen, mapa y README con una única versión consistente. Si la creación/persistencia no se puede verificar, distinguir «ficha mostrada» de «documento guardado y reabierto».

**Aceptación:** todos los archivos coinciden sobre las acciones efectuadas y el estado final, con fuente verificable o límite explícito. No eliminar esta contradicción inventando retrospectivamente evidencia.

### R02 — Recuperar trazabilidad de la observación en vivo

LIVE-01 y LIVE-02 apuntan a «captura de sesión no archivada». No hay archivos nuevos de pantalla en la carpeta de evidencias. No puedo auditar esas afirmaciones visuales a partir de la entrega.

**Trabajo requerido:** recuperar las capturas originales de la sesión si la herramienta lo permite o recapturar estados actuales verificables. Una captura posterior debe tener fecha e ID propios; no prueba retrospectivamente un clic anterior. Archivar las capturas aceptadas en `output/`, abrirlas y comprobar ventana, empresa, estado y legibilidad. Usar rutas completas o relativas resolubles en el mapa, sin elipsis. Crear un manifiesto de las 22 referencias originales con nombre exacto; conservar copias locales ignoradas si se necesita evitar dependencia de Temp.

**Aceptación:** cada evidencia visual nueva se puede abrir y relacionar con una afirmación concreta. Si una observación anterior carece de soporte recuperable, queda como registro no corroborado.

### R03 — Retirar la regla no demostrada de «Aceptar dos veces»

El flujo prescribe «Nuevo y Aceptar dos veces» y LIVE-01 afirma que «el primer Aceptar no basta». En una sesión con tiempos de espera y foco problemático, haber pulsado dos veces no demuestra que Productor requiera esa secuencia.

**Trabajo requerido:** describirlo inicialmente como una secuencia de automatización con resultado incierto. Comprobar el comportamiento con un único clic y observar la finalización antes de decidir la siguiente acción. Si hay dos confirmaciones distintas, identificar cada diálogo y su propósito.

**Aceptación:** no queda codificada como requisito funcional una repetición que podría deberse a latencia, activación o fallo de entrada.

### R04 — Completar la investigación funcional crítica

`03-reglas-y-experimentos.md` es fundamentalmente una lista de pendientes. E01 no verifica cierre/reapertura; el resumen reconoce que E02–E16 no tuvieron experimentación en vivo. Crear los siete archivos no completa la investigación pedida.

**Trabajo requerido, por orden:**

1. Resolver herencia de serie/vidrio, excepciones individuales y alcance de medidas: E05–E07.
2. Resolver inserción, puntos verdes y creación inicial de uniones: E02–E04.
3. Identificar escuadra, entidad del menú contextual y botón de recuadros: E08, E09 y E13.
4. Comprobar orientación/cotas del travesaño y relleno por hueco: E10–E12.
5. Comprobar unión/acabado, guardado, reapertura y previsualización: E14–E16 y cierre de E01.

Usar observación autorizada de 0017 y el manual. El CHM se ha localizado, pero la entrega no aporta ninguna sección consultada. Buscar primero extracciones existentes; si procede extraerlo, hacerlo localmente sin ejecutar ni registrar componentes ni versionar sus activos.

Por experimento registrar estado inicial, única variable cambiada, acción, resultado, evidencia y regla sustentada. Documentar también resultados negativos.

**Aceptación:** las reglas críticas quedan sustentadas. Si la automatización sigue bloqueada, registrar el fallo concreto, las recuperaciones intentadas y una lista breve de acciones que el operador puede demostrar; conservar el estado parcial. Un bloqueo real explica el pendiente, pero no lo convierte en una verificación completada.

### R05 — Corregir omisiones de información que sí es visible

`04-caso-referencia.md` declara desconocidos cantidades e importe verificable del caso original. REF-22 permite registrar como valores visibles de captura:

| Campo | Valor visible |
|---|---:|
| Cantidad de línea | 1,00 |
| Ancho agregado | 6900 mm |
| Alto agregado | 1020 mm |
| Precio de línea | 3868,19 |
| Descuento de línea | 0,000 |
| Total de línea | 3868,19 |
| Base imponible | 3868,19 |
| IVA | 21 % / 812,32 |
| Total del documento | 4680,51 EUR |

También se observa `UNI` en Acabado de la línea. Debe diferenciarse del acabado `L` blanco visible en el editor del elemento: no asumir que representan el mismo ámbito o que uno sustituye al otro.

Estos son valores visibles, **no un cálculo validado ni una receta reconstruida**. No permiten deducir todos los anchos, uniones, tarifas o ajustes que los produjeron.

REF-19 añade un matiz omitido: los iconos solo afectan al dibujo y el tipo de corte del junquillo se define en cada serie. Registrar ambos aspectos; no inferir que el corte real de fabricación carece de configuración.

**Aceptación:** extraer lo legible y marcar como desconocido únicamente lo que realmente no pueda determinarse. Separar observación visual, interpretación y validación numérica.

### R06 — Construir un caso controlado de Productor completo

El caso original sigue incompleto y el único caso numérico detallado procede de Aluminior, donde falló el guardado. El documento 260495 no contiene un cerramiento de referencia.

**Trabajo requerido:** construir en 0017 un caso sintético documentado con módulos, medidas, materiales, uniones y una edición de hueco; guardar, cerrar/reabrir y previsualizar. Si no se pueden recuperar las entradas exactas del vídeo, mantener dos casos claramente separados:

- Caso original: evidencia visual y entradas desconocidas.
- Caso controlado nuevo: entradas explícitas y resultados observados, apto para pruebas futuras.

No forzar el importe final a coincidir con REF-22 si las entradas no son idénticas. No introducir precios manuales para simular coincidencia.

**Aceptación:** otra persona puede repetir el caso sin adivinar parámetros y comprobar su resultado. Mientras no exista, no declarar satisfecho el criterio de caso reproducible Productor.

### R07 — Documentar y resolver el incidente del campo Obra

El resumen declara que se introdujo texto ajeno a la prueba en Obra y que la sustitución no se aplicó.

**Trabajo requerido:** describir en el registro local sensible qué se observó, si el texto llegó a guardarse y en qué empresa/documento. No copiar el texto ajeno a documentos versionables. Con foco y empresa verificados, corregir únicamente el documento de prueba dentro del alcance autorizado o indicar exactamente la intervención mínima del operador si el control no es fiable.

No borrar el presupuesto ni continuar experimentando sobre un formulario de estado incierto.

**Aceptación:** el documento tiene un estado conocido; si queda pendiente de corrección, el resumen no lo presenta como un caso controlado limpio.

### R08 — Fortalecer las pruebas de aceptación y las fuentes del contraste

Algunos criterios son demasiado amplios, como «mismo resultado con pasos equivalentes». La matriz usa casi exclusivamente la auditoría anterior y CODE-01 para capacidades distintas, sin ubicar el componente responsable de varias afirmaciones.

**Trabajo requerido:** para cada operación crítica indicar entrada, acción, salida esperada y evidencia. Añadir referencias de archivo/función del código actual donde se afirme presencia o ausencia, distinguiéndolas de comprobaciones en interfaz. No exigir un menú distinto por marco/hoja/hueco hasta observar si Productor realmente lo distingue. Registrar teclas y orden de foco cuando puedan verificarse, dejando lo restante como no comprobado.

**Aceptación:** los criterios pueden ejecutarse y producir un resultado de aprobado/fallido; ninguna hipótesis se transforma en comportamiento canónico.

## Qué no hace falta repetir

- No recrear los siete documentos desde cero: corregir y ampliar los existentes conservando lo útil.
- No rehacer la auditoría general de Aluminior ni reintentar su guardado en remoto durante fase 0.
- No arrancar bases, aplicar migraciones ni ejecutar suites completas para mejorar estos documentos.
- No introducir cambios de UI o lógica de negocio.

## Mensaje de devolución para Terra

Continúa exclusivamente la fase 0. Lee esta auditoría y el prompt original. La entrega no está aprobada como completa: corrige R01–R08 y actualiza los siete documentos existentes. Empieza por consistencia documental, trazabilidad y extracción de las capturas; después completa los experimentos críticos en Productor 0017 con control fiable. Mantén intacta 0016 y las bases de Aluminior. No implementes fase 1.

Devuelve una tabla `Corrección | Trabajo realizado | Evidencia | Estado`. Conserva como pendientes los puntos no comprobables y explica la intervención concreta necesaria. No declares completa la fase porque los archivos existan; debe existir la evidencia que sustenta las reglas y el caso reproducible.

## Relación con fase 1

El handoff actual es suficiente como punto de partida para investigar por separado el fallo de guardado de Aluminior. Ese diagnóstico no depende de resolver los puntos verdes o la herencia de Productor. Sin embargo, esto no equivale a aprobar fase 0.

La petición actual condiciona la entrega de fase 1 a una fase 0 correcta. Por ello esta revisión entrega las correcciones, no un prompt de fase 1 presentado como si la investigación previa estuviera cerrada.
