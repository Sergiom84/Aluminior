# Aluminior: ejecución y revisión para el uso de Javi

Plan del 8 de septiembre de 2026. No es una certificación de producto terminado.

## 1. Resultado y contrato

**Hito comercial:** Javi puede entrar con su usuario, crear o elegir cliente —o usar nombre libre—, diseñar un cerramiento soportado, obtener un precio trazable, corregirlo, guardar y recuperar el documento, copiarlo como revisión y emitir un PDF con dibujo, medidas, importes y condiciones.

**Hito de fabricación:** ese mismo documento proporciona despiece y hojas de corte/producción correctas para las familias verificadas. Las revisiones se distinguen y los elementos no soportados quedan identificados.

Estos hitos no equivalen a sustituir todo Productor: compras, almacén, facturación, contabilidad y todas las series comerciales requieren sus propios contratos y pruebas.

| Contrato | Alcance |
|---|---|
| Destinatario y motivo | Javi, operador de una carpintería de aluminio, necesita presupuestar trabajos y preparar su fabricación. |
| Éxito medible | Recorridos de la sección 7 ejecutados en navegador, importes contrastados con cálculo independiente, persistencia comprobada en PostgreSQL y revisión independiente apta. |
| Autorizado por el mensaje de inicio | Implementación local, pruebas con datos sintéticos, documentación y evidencias de los lotes descritos. Migraciones nuevas sólo locales y con plan reversible. |
| Fuera de alcance | Publicar, escribir en BD remota, sustituir Productor, cambiar reglas económicas sin evidencia, ampliar roles o abrir registro público. |
| Protegido | Cambios preexistentes, secretos, datos de ALUMINIOS LARA SLU, originales Productor, otras aplicaciones y contenedores. |
| Comprobaciones obligatorias | Tests pertinentes, typecheck, build cuando corresponda, navegador, BD, PDF, diff y revisión independiente. |
| Requiere autorización adicional | Commit/push/despliegue, migración o importación remota, correcciones de datos reales, ejecución del legado en VM y decisiones de negocio que las fuentes no permitan resolver. |

Supuestos: se mantiene la arquitectura activa y se implementa por módulos pequeños. Se preserva «sin valorar» cuando falten datos; no se convierte en cero ni se presenta una suma parcial como total válido.

## 2. Punto de partida y fuentes

Leer, en este orden:

1. `AGENTS.md` y las instrucciones superiores aplicables.
2. `output/auditoria-javi-20260908/INFORME.md` y `referencia-productor.md`.
3. `README.md`, `ARQUITECTURA.md`, `PARIDAD-PRODUCTOR.md`, `PLAN.md`, `ENTREGA.md`, `ROADMAP.md` y `ESTADO-VALORACION.md`, si existen. Distinguir fecha, propuesta e implementación.
4. Las decisiones relevantes de July en modo lectura, utilizando su skill si procede; no escribir memoria ni tomar estados históricos como actuales.
5. El código, tests y migraciones afectados por cada lote.

Estado comprobado al preparar este plan: rama `feat/t73-contrato-precio-acabado`, HEAD `fba5821`. Hay cambios previos de T73, incluidos archivos sin seguimiento, en precios de catálogo, artículos y acristalamiento. **Un worktree creado sólo desde HEAD no contiene ese trabajo.** Registrar el estado actual antes de elegir el aislamiento; no hacer stash/reset/checkout ni sobrescribirlo.

La aplicación activa es Next.js/React; `packages/api` es un scaffold histórico. No construir otra API Fastify porque una descripción antigua la mencione.

Auditoría local: 693 tests y typechecks correctos; esto no demuestra el flujo comercial de cerramientos. Se comprobó que alta y edición de cerramiento mantienen precio nulo, el PDF carece de dibujo y condiciones, los artículos no ofrecen edición y el cerramiento del recorrido no genera cortes. Hubo cinco avisos altos de dependencias; actualizar el diagnóstico antes de decidir su tratamiento, sin equiparar aviso con explotación probada.

Referencia: `https://www.gaia-soft.com/programas/productor-aluminio/`, vídeo `https://www.youtube.com/watch?v=EaC4-ubEFCM` y `C:\Users\sergi\Desktop\MIX\Productor`. La auditoría muestreó el vídeo de 53 minutos; no lo vio completo. Comprobó integridad de doce ZIP, no restauración ni equivalencia de datos. Reutilizar manuales extraídos y evidencias existentes antes de repetir inventarios masivos.

No ejecutar el `.exe` ni registrar OCX/COM en el equipo principal. No eludir licencias. `EMP0016\aluminio.mdb` es activo: cualquier investigación posterior usa una copia verificada y sólo lectura. No incorporar binarios, activos propietarios ni datos reales al repositorio.

## 3. Organización y puerta de revisión

La conversación nueva es el **coordinador ejecutor**. Esta conversación es el **revisor independiente**. El coordinador entrega artefacto, contrato y evidencia bruta; el revisor vuelve a ejecutar lo necesario y emite `APTO`, `CAMBIOS REQUERIDOS` o `BLOQUEADO POR EVIDENCIA`.

Usar `superpowers` como disciplina de trabajo y `subagentes` para unidades independientes. Máximo dos ejecutores simultáneos; no dos agentes modificando el mismo contrato, helper, esquema, índice de exportaciones o lockfile. Autenticación, seguridad, migraciones y borrados se realizan en serie. Los ejecutores no hacen operaciones Git de staging, commit, stash o checkout.

Las skills contienen ejemplos dependientes del entorno. En Codex utilizar las herramientas y modelos realmente disponibles; no intentar invocar por nombre una herramienta de Claude que no exista. No instalar ni modificar herramientas globales para cumplir este plan.

Secuencia: contrato del lote → implementación → comprobaciones del coordinador → revisión independiente → una corrección → comprobación final. Máximo dos rondas; tercera sólo en los casos críticos previstos por AGENTS. Un desacuerdo se resuelve con una reproducción o test, no con consenso entre agentes.

No avanzar un lote dependiente si su predecesor no está apto. Se permite investigación independiente durante la espera. Si falta una regla de negocio verificable, cerrar las unidades independientes y elevar una pregunta concreta con alternativas y evidencia; no improvisar la regla.

La revisión entre conversaciones no ocurre por sí sola: enviar el paquete mediante las herramientas de tareas de Codex si están disponibles y se ha identificado inequívocamente esta conversación; en otro entorno, entregar su ruta para revisión aquí. No crear automaciones ni nuevas tareas adicionales. La ausencia de respuesta no equivale a aprobación.

## 4. Lotes de implementación

### J00 — Congelar el estado y reproducir el entorno

**Dependencias:** ninguna. **Trabajo en serie.**

- Registrar rama, HEAD, diff, archivos sin seguimiento, versiones de herramientas y hashes de los archivos preexistentes afectados. Guardar evidencia fuera de los datos reales. No copiar `.env`, credenciales ni dumps al paquete.
- Confirmar los comandos reales del repositorio y las rutas afectadas. Registrar cualquier divergencia respecto de este plan.
- Preparar un arranque local repetible con PostgreSQL y Auth real, usuario sintético y catálogo mínimo. Reutilizar scripts de auditoría sólo después de revisar sus supuestos: `seed.ts` no es idempotente y `verificar.ts` usa identificadores de aquella ejecución.
- Separar `aluminior_test`, `aluminior_etl_test` y la BD del recorrido. Los tests ETL pueden borrar tablas: no compartir su BD con las demás suites ni propagarles un `TEST_DATABASE_URL` común.
- Evitar heredar destinos remotos desde `.env`: validar antes de abrir conexiones el host local, puerto y nombre `_test`; fijar todas las variables necesarias sólo en el proceso de pruebas. No imprimir secretos.
- Comprobar puertos y propiedad de contenedores antes de arrancar/parar. La auditoría usó PostgreSQL 55433, web 3017 y Auth 55199/55121; no asumir que estén libres. Los procesos de auditoría terminaron parados y la BD era efímera.
- Para pruebas de acceso, usar GoTrue/Supabase Auth real y bypass QA desactivado. El stub `auth.users` de suites unitarias no demuestra autenticación.
- Ejecutar baseline: tests canónicos, typecheck y build local con entorno seguro. Registrar comando, duración y código de salida; no ocultar fallos de PowerShell o de procesos hijos.

**Aceptación:** arranque y parada reproducibles sin tocar sistemas ajenos, datos sintéticos identificados, entrada real por login y baseline registrada. Cualquier fallo previo se documenta y reproduce; no se rebaja un test para continuar.

**Entrega:** manifiesto inicial, instrucciones de arranque, logs y lista de destinos permitidos sin credenciales.

### J01 — Cerrar y revisar T73: precio, acabado y vidrio

**Dependencias:** J00. **Trabajo en serie por el contrato económico compartido.**

- Revisar el trabajo existente de `packages/core/src/precios/pvp-catalogo.*`, `index.ts`, valoración de artículos, `pvp-articulos.ts` y valoración/acristalamiento de estructuras.
- Definir con evidencia qué tarifa y acabado corresponden, cómo se expresan unidades y cantidades y qué ocurre cuando no existe un precio exacto. No convertir una tarifa histórica en tarifa vigente por antigüedad o conveniencia.
- Reutilizar los contratos de decimales, coste, PVP y guarda existentes. Separar conceptos de coste y venta; no aplicar margen dos veces ni introducir una segunda política de redondeo.
- Probar acabado existente/ausente, tarifa válida/ausente, cantidad fraccionaria cuando proceda, unidad de artículo frente a superficie/longitud, vidrio y dimensiones no cuadradas.

**Aceptación:** importe esperado calculado independientemente para cada fixture; datos ausentes producen estado incompleto; los cambios previos quedan preservados o sustituidos de manera explícita y verificable. No exigir que el número de tests siga siendo exactamente 693.

### J02 — Resolver los avisos de dependencias

**Dependencias:** J00 y cierre de cualquier lote que esté modificando el lockfile. **En serie.**

- Repetir el análisis de dependencias de producción y desarrollo; revisar avisos y notas oficiales de las versiones candidatas.
- Determinar dependencia directa/transitiva, ruta de uso y versión corregida. Actualizar el conjunto mínimo compatible; no ejecutar una actualización forzada indiscriminada.
- Comprobar tests, typecheck, build, login, diseñador y PDF tras el cambio. Si una corrección exige migración mayor, entregar contrato separado con impacto.

**Aceptación:** avisos corregidos o riesgo residual concreto documentado, sin afirmar seguridad total porque el escáner esté verde. Un riesgo relevante no resuelto bloquea una recomendación de publicación.

### J03 — Contrato y persistencia del cerramiento agregado

**Dependencias:** J01. **En serie; esquema y migraciones.**

- Describir la correspondencia verificable entre módulos, uniones, serie, acabado, vidrio, herrajes, ajustes manuales y una única línea comercial GRUPO. GRUPO no obliga a renombrar el enum SQL CERRAMIENTO.
- Delimitar exactamente las familias soportadas. Una opción visible en un selector no demuestra que exista catálogo suficiente para fabricarla o valorarla.
- Diseñar procedencia estable para cada módulo y unión. Las tablas actuales de acristalamiento y opciones usan claves por línea/slot o categoría: dos módulos con slot 1 no pueden colisionar. No aplanar resultados perdiendo su origen.
- Documentar qué se conserva como snapshot, su versión, cuándo se recalcula y cuándo se copia idéntico. Precios históricos no deben variar silenciosamente al consultar un documento.
- Si es necesaria una migración, hacerla aditiva, compatible con filas actuales y verificable exclusivamente en BD local. Preparar prueba de migración desde el esquema anterior, preservación de datos y recuperación local; no editar migraciones ya aplicadas.

**Aceptación:** prueba de dos módulos con slots/artículos repetidos sin pérdida de identidad; lectura de documentos anteriores; migración y recuperación local comprobadas si aplica. Contrato aprobado por el revisor antes de implementar consumidores.

### J04 — Valoración y despiece del agregado

**Dependencias:** J03.

- Implementar un caso de uso cohesivo que resuelva módulos y uniones mediante los motores existentes. Mantener cálculo puro en core e I/O en el servicio de aplicación.
- Incorporar sólo reglas de uniones, herrajes y ajustes sustentadas por manual/configuración o pruebas comparables. No inferir mano de obra manual a partir de tablas históricas.
- Componer coste/PVP y despiece sin duplicar perfiles compartidos ni aplicar dos veces la cantidad comercial. Preservar diagnóstico de cada componente pendiente.
- Crear una ficha de fixture: datos de entrada, referencias de reglas, cantidades, precios, unidad, operaciones y resultado esperado calculado fuera de la función productiva.
- Probar un módulo, dos módulos, repetidos, dimensiones no cuadradas, varias unidades, unión, vidrio, acabado y ajustes. Probar ausencia de precio de un solo componente: la línea global queda sin valorar, aunque se conserve el diagnóstico parcial.

**Aceptación:** al menos una composición completa soportada produce precio y despiece contrastados independientemente; todas las ausencias relevantes fallan de forma explícita. El fixture positivo no puede sortear las reglas productivas mediante stubs de valoración.

### J05 — Alta, edición, copia y totales atómicos

**Dependencias:** J04.

- Integrar en alta y edición de cerramiento; no limitarse a retirar el `null` de `alta-cerramiento.ts`.
- Conservar `lineas/guardar-linea.ts` como frontera transaccional: línea, satélites, despiece y totales se escriben juntos. La edición reemplaza coherentemente resultados anteriores.
- Mantener rutas/acciones como composición. Revisar cohesión a 250 líneas y dividir antes de añadir responsabilidades a archivos de más de 400; especial cuidado con `_lib/acciones.ts`.
- Definir copia de revisión como conservación del snapshot, y revaloración como operación explícita si se incorpora. No activar opciones de copia avanzada que no regeneren sus datos derivados.
- Probar rollback por error intermedio, altas concurrentes sin órdenes/números duplicados, edición sin residuos, cambio de completo a incompleto y copia sin alterar origen.

**Aceptación:** crear→recargar→editar→recargar→copiar desde navegador conserva geometría, cantidades y precios correctos en BD. Un fallo intermedio no deja línea huérfana, satélites parciales ni total antiguo.

### J06 — PDF entregable y condiciones visibles

**Dependencias:** contrato J03; integración final tras J05. Puede prepararse el adaptador gráfico en paralelo con J04 si no comparte sus archivos/contratos.

- Incorporar el dibujo de cada cerramiento, medidas, descripción, cantidades e importes mediante un adaptador de la geometría existente compatible con PDF; no crear un segundo motor geométrico.
- Mostrar forma de pago y observaciones guardadas, con tratamiento de saltos de línea y textos largos. Verificar destinatario cliente, nombre libre y cliente potencial si el flujo existe.
- Mantener la indicación de incompleto y las distinciones entre nulo y cero. Un documento sin precio no se presenta como presupuesto comercial completo.
- Probar varias líneas, más de una página, figuras estrechas/anchas, acentos, descripciones largas y ausencia de campos opcionales. Inspeccionar el PDF renderizado, no sólo el texto extraído.

**Aceptación:** PDF regenerado después de editar muestra el nuevo dibujo y medidas; captura del editor, BD y PDF corresponden a la misma revisión. No hay cortes de contenido, importes divergentes ni condiciones perdidas.

### J07 — Completar la operación diaria de presupuestos

**Dependencias:** J05 y contratos económicos cerrados.

- Añadir edición de artículo reutilizando validación/valoración y transacción existentes: cantidad, referencia/acabado y campos realmente soportados. Evitar borrar/recrear como sustituto oculto de editar.
- Mantener búsqueda de cliente por prefijo de código y fragmentos de nombre en cualquier orden, selección por teclado y persistencia del código canónico.
- Resolver coherentemente destinatario en cabecera, detalle y PDF. No sobrescribir un nombre u obra que Javi haya escrito ni aplicar una tarifa por seleccionar cliente sin una regla verificada.
- Permitir corregir los campos de cabecera admitidos por el estado del documento después de guardar: destinatario, obra, forma de pago y observaciones. Reutilizar validaciones; conservar número, revisión y autor. Un cambio de tarifa, si está permitido, debe seguir el contrato explícito de revaloración y no dejar importes incoherentes.
- Mantener posibilidad de presupuesto sin ficha de cliente. Registrar como Después un flujo nuevo de alta rápida con retorno al presupuesto si requiere ampliar interacción no demostrada.

**Aceptación:** artículo de 2 × 20 € conserva base 40 €, IVA de fixture 8,40 € y total 48,40 €; al editar cambia según cálculo independiente. Esta prueba de artículo no sustituye la positiva de cerramientos. Selección por teclado y nombres libres no regresan. Editar cabecera y condiciones, recargar y regenerar PDF: los nuevos valores coinciden en interfaz, BD y PDF sin alterar campos ajenos.

### J08 — Producción del presupuesto verificado

**Dependencias:** J05; contrato de cortes J04.

- Reutilizar `packages/core/src/produccion` —optimización, despunte, hojas de corte y producción—. Comprobar qué falta conectar antes de reescribir motores.
- Consumir despiece persistido con identidad de módulo y revisión. Mostrar número y revisión distinguibles en selección/listado.
- Contrastar cantidades, longitudes, ángulos, material/acabado, despunte y restricciones de barra de los casos soportados. Explicitar las reglas respaldadas por Productor y las diferencias deliberadas.
- Probar el documento editado y su copia; impedir que cortes viejos o de otra revisión se mezclen con los actuales.

**Aceptación:** el cerramiento positivo de J04 genera hojas coherentes con su despiece. Caso no soportado informa de lo que falta; no emite hoja vacía como si fuera correcta. No certificar todavía toda la fabricación ni el ciclo de compras.

### J09 — Usuarios, persistencia y ensayo completo de Javi

**Dependencias:** J02 y J05–J08 aptos. **Autenticación en serie.**

- Repetir alta administrativa local de empleado, acceso real, contraseña incorrecta, rutas sin sesión, cierre de sesión y posterior rechazo de rutas protegidas. No introducir registro público o nuevos permisos por iniciativa propia.
- Comprobar autor real del documento en BD. La existencia de un campo de rol no demuestra control de permisos; verificar el modelo aprobado antes de juzgarlo o ampliarlo.
- Si recuperación/confirmación forma parte del flujo existente, probar con correo capturado localmente; autoconfirmar un usuario de fixture no prueba que los correos se entreguen.
- Ejecutar toda la matriz de la sección 7. Crear clientes y presupuestos mediante interfaz; el seed sólo prepara usuarios y catálogo de prueba.
- Verificar reinicio de la aplicación con BD conservada y recuperación de documentos. Separadamente, realizar backup/restauración de la BD sintética y verificar cantidades/snapshots tras restaurar. No confundir reiniciar Next o validar un ZIP con recuperar datos.

**Aceptación:** evidencias enlazadas por caso, identidad y revisión; ninguna prueba marcada como realizada si sólo hubo inspección estática, stub o captura de otra versión del documento.

### J10 — Cierre revisado y decisión de piloto

**Dependencias:** todos los lotes anteriores aptos.

- Ejecutar suites canónicas y typecheck finales; build y recorrido de producción local con configuración segura. Revisar diff completo, archivos nuevos, secretos/datos y cambios ajenos.
- Actualizar documentación operativa, cobertura de familias/tarifas, limitaciones y matriz Productor→Aluminior. Una evidencia histórica de cobertura no acredita precios actuales.
- Entregar instrucciones de arranque, alta administrativa, copia/restauración y mantenimiento; separar evidencia local de cualquier entorno remoto no probado.
- Clasificar pendientes como Ahora, Después o Experimental, con impacto, dependencia y comprobación de cierre.

**Aceptación:** dictamen del revisor sobre uso local/piloto con catálogo verificado. Para un piloto con precios reales se necesita validar procedencia/vigencia de tarifa y una muestra representativa de presupuestos de referencia mediante copias autorizadas; hasta entonces sólo queda certificado el comportamiento con fixtures. No desplegar ni migrar remoto con este plan.

## 5. Decisiones que no se deben inventar

| Incertidumbre | Cómo resolverla | Qué queda bloqueado |
|---|---|---|
| Tarifa y acabado comerciales vigentes | Contrastar configuración, documentos y fuente de precios autorizada; fecha y unidad explícitas. | Afirmar que los importes son utilizables para ventas reales. |
| Reglas de una unión o familia no documentada | Manual/configuración y comparación controlada con Productor; pregunta concreta si no basta. | Sólo esa familia/unión; no simular soporte. |
| Mano de obra y ajustes | Conservar campos manuales y contrato existente; una automatización nueva requiere decisión. | Automatización nueva del coste. |
| Criterio de revaloración histórica | Contrato explícito de copia/snapshot frente a recálculo. | Cambiar silenciosamente documentos existentes. |
| Estado de migraciones o servicio remoto | Inspección específica dentro de alcance autorizado. | Despliegue o afirmaciones de preparación remota. |
| Operación no observada en Productor | Marcar hipótesis y buscar evidencia, no convertir una propuesta visual en requisito histórico. | Presentarla como paridad comprobada. |

## 6. Paquete de revisión por lote

Crear `output/ejecucion-javi/<lote>/` con:

- `CONTRATO.md`: problema, alcance, criterios numerados, límites y dependencias.
- `ARTEFACTO.md`: referencia de baseline, lista de archivos y hashes, diff del lote y archivos nuevos incluidos. Separar cambios previos de los propios. No incluir secretos ni datos reales.
- `EVIDENCIA.md`: índice caso→criterio→comando/acción→salida/captura/consulta. Identificar qué no se ejecutó.
- `logs/`: salidas originales, comandos, versiones, fecha y códigos de salida. No sustituirlos por «todo verde».
- `capturas/` y PDFs sintéticos cuando haya UI/documentos; tamaño de ventana, ruta e identidad del caso.
- `bd/`: aserciones y resultados sintéticos mínimos, sin volcar tablas reales ni credenciales.
- `REPRODUCIR.md`: pasos desde un entorno limpio y limpieza limitada a los recursos de este lote.

El mensaje al revisor incluye esas tres entradas: contrato, artefacto y evidencia. No anticipa «mi solución es correcta» ni envía el razonamiento del autor como prueba.

El revisor comprueba criterios, ejecuta pruebas pertinentes, revisa diff y reproduce el flujo cuando aplique. Para un arreglo, medir en copia aislada cuántos tests añadidos fallan sin él y pasan con él; nunca revertir cambios sobre el árbol de Sergio. No usar tests que sólo repitan la implementación. No saltar tests, reducir umbrales o introducir supresiones para cerrar un lote.

Tras revisión, registrar `REVISION.md` con dictamen, comprobaciones realmente ejecutadas, hallazgos y condiciones de cierre. Si no se dispone de revisión, el lote queda pendiente de revisión, no terminado.

## 7. Matriz final de pruebas como Javi

| Caso | Operación real | Aserción imprescindible |
|---|---|---|
| R01 | Alta administrativa y login del empleado | Sesión real, autor persistido, bypass apagado. |
| R02 | Contraseña errónea, anónimo y logout | Rechazo efectivo y error apropiado, sin acceso residual. |
| R03 | Crear cliente y buscarlo por fragmentos invertidos/código | Selección por teclado y código canónico en BD. |
| R04 | Crear presupuesto con nombre libre, obra y condiciones; corregir cabecera después de guardar | No obliga a ficha; cambios conservados tras recarga y coincidentes en BD y PDF, sin sobreescrituras ajenas. |
| R05 | Cerramiento completo de un módulo no cuadrado | Geometría y valoración independiente coinciden. |
| R06 | Dos módulos y unión, con slots repetidos | Identidad conservada, suma correcta, sin duplicación de componentes. |
| R07 | Varias unidades del cerramiento | Cantidad aplicada exactamente una vez en cada nivel correspondiente. |
| R08 | Falta un precio/acabado/componente | Importe global nulo y diagnóstico explícito; no cero. |
| R09 | Editar medidas, vidrio o acabado | Recálculo correcto, sin despiece/satélites antiguos. |
| R10 | Artículo valorado dentro de presupuesto incompleto | La parte valorada no convierte el documento en completo. |
| R11 | Editar artículo y copiar revisión | Totales exactos; origen intacto y snapshot de copia comprobado. |
| R12 | PDF después de editar; varias páginas | Dibujo actualizado, medidas, destinatario, condiciones y totales coherentes. |
| R13 | Producción de original y revisión | Identidades distinguibles, cortes de la revisión seleccionada. |
| R14 | Error transaccional y escrituras concurrentes | Rollback completo, sin duplicados ni pérdida de actualización. |
| R15 | Recarga, reinicio y restauración sintética | Documentos y datos derivados recuperados e íntegros. |
| R16 | Escritorio, móvil 320/390 y teclado | Sin overflow global; tablas con scroll propio, foco visible, controles accesibles. |
| R17 | Zoom 200%, reduced motion y errores de formulario | Operación posible; errores asociados y sin pérdida de datos. |

Para R05–R13 comparar la misma tarea con evidencia Productor: pasos, campos, estados, medidas, importes y salida. Si sólo hay manual o captura, indicar esa fuente; no presentarla como ejecución del programa original. La auditoría anterior comprobó 2460×1000 al unir dos módulos de 1200 y unión de 60, y 2160×1000 tras corregir uno a 900: conservar este caso geométrico, sin asumir por ello precio o despiece comercial correcto.

## 8. Prioridades, coste y mantenimiento

**Ahora:** J00–J10, cerrando primero el presupuesto completo y después su fabricación. El esfuerzo principal está en reglas de valoración, procedencia de componentes y persistencia; el aspecto visual por sí solo no cierra esos riesgos.

**Después:** alta rápida de cliente con retorno, compras/proveedores de principio a fin, ampliación demostrada de familias y atajos, importación/piloto real y despliegue con su propio contrato.

**Experimental:** automatismos no observados, optimizaciones sin medición o ampliaciones del modelo de permisos. No mezclarlos con la aceptación comercial.

No es responsable fijar ahora un coste total o ahorro garantizado: faltan alcance comercial de catálogo y resolución de T73/J03. Al cerrar J00 y J03, entregar estimación por lote y total en rango, incluyendo ejecución, revisión, correcciones, infraestructura y mantenimiento. Separar consumo de agentes de horas humanas. Dos agentes pueden acelerar unidades independientes, pero también duplican contexto y revisión.

Para medir rentabilidad del piloto: comparar tiempo por presupuesto, porcentaje de presupuestos valorados sin intervención, correcciones posteriores y coste de mantenimiento. Calcular ahorro sobre volumen real de Javi; no inventarlo. No se emite dictamen legal/fiscal ni se certifica facturación con las pruebas de presupuestos.

Si se agota la conversación, cerrar la unidad actual con evidencia y escribir `CONTINUIDAD.md`: lotes aptos, lote pendiente, cambios preexistentes, estado de procesos/BD, decisiones sin resolver y siguiente comando seguro. No declarar completado lo que sólo está a medias.
