# Auditoría de la integración Productor → Aluminior — 19/10/2026

**No se han implementado, publicado y aceptado todas las fases.** Aluminior
reimplementa partes del comportamiento de Productor en su propia aplicación.
REA aportó evidencia y contratos; no existe una conexión ejecutable con Productor
que transfiera automáticamente sus funciones. La investigación cerrada no implica
que las brechas que identificó estén implementadas.

La versión publicada sigue siendo `40cedd1da30cef9c424bb42d61b2671e7d77d3ac`,
del 12/10. El código auditado es `caefa3f444bdd8e59d4711c3bc4eb93ee3496fb2`,
en `codex/rea-productor-20261016`. Las entregas locales posteriores conservan
su estado local. Esta auditoría no publica código ni cierra E1–E11 o P.6/P.7.

## Encargo y límites

Resultado: responder a Sergio qué se investigó, qué llegó a código, qué funciona
en pruebas aisladas y qué está publicado, revisando la documentación pertinente.
Éxito medible: inventario con huellas y lectura documentada, contraste con código,
destinos de BD comprobados, pruebas ejecutadas y estado de Render consultado.

El permiso de esta conversación incluye consultas de producción y pruebas en
Docker. Las únicas escrituras de pruebas se realizan en una instancia nueva de
PostgreSQL con datos sintéticos. Producción se consulta en transacción de sólo
lectura; el navegador usa documentos QA existentes sin enviar formularios.
No se ejecutan Productor/DLL/COM, no se opera G6, no se activan cargos, no se
migra producción, no se hace push, sincronización ni despliegue. No se modifica
código de producto. Se mantienen los ítems existentes de July y su historia.

Raíz de trabajo: `C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior`.
La copia Desktop se consulta sólo para comparar documentación y resolver los
punteros de acceso existentes; no se modifica. Evidencia privada actual:
`output/auditoria-integracion-rea-20261019/`. No contiene valores de credenciales
ni exportaciones de filas de clientes o de documentos comerciales.

## Revisión documental

El corpus inicial congelado en `caefa3f` contiene **246 Markdown: 122 del árbol
fuente y 124 privados**. Se enumeró el árbol real, buscando también markdown,
mdx, rst y adoc, con exclusión de dependencias, generados y esta auditoría.
El inventario registra ruta, tamaño, líneas, huellas exactas y normalizadas LF.
El detalle de profundidad de lectura se conserva separado del mero parseo.

Lectura semántica completada: **122 fuentes y 71 informes privados íntegros**;
los 48 snapshots históricos se cubren con bloques iguales a esas fuentes y
100 diferencias (193 líneas distintas) leídas íntegramente. Quedan excluidas
las cinco referencias API ajenas a la integración. La constancia final por
archivo enlaza huellas, rangos leídos, reutilización de bloques y conclusión;
leer una afirmación histórica no significa volver a ejecutarla.

Los documentos fuente incluyen planes, fases, evidencia, entregas, README y
reglas. Los privados se dividen en 71 informes/contratos, 48 versiones históricas
de documentos y cinco referencias de API Windows/Unicode. Estas cinco se excluyen
del dictamen funcional: no describen integración Productor. Las versiones
históricas se comparan por bloques y diferencias; no son 48 corroboraciones
independientes ni copias globalmente idénticas al documento actual.

Se contrastó además el checkout Desktop: ocho documentos fuente tienen diferencias
tras normalizar saltos de línea y `design-qa.md` es un antecedente único de agosto.
Dos informes privados citados, ausentes aquí, existen en Desktop y fueron leídos:
`output/clonersoft-20261013/coste-tarifa.md` y `cobertura-aluminior.md`.
No aportan activación de tarifa dinámica ni coste dimensional demostrado.

Barrido adicional Desktop: 153 Markdown privados inventariados por metadatos;
29 pertinentes a ClonerSoft/REA del 13–14/10 leídos íntegramente (incluyen los
dos anteriores). Los otros 124 son antecedentes de septiembre/otras auditorías
fuera de esta ampliación posterior a REA. Las ocho variantes fuente se cubren
por bloques comunes y sus 18 diferencias (39 líneas propias) leídas; no se
confunden con ocho entregas independientes. `design-qa.md` se leyó completo
como antecedente, sin atribuirle una entrega posterior a REA.

De 1.644 enlaces Markdown locales inspeccionados en las fuentes, diez destinos
privados faltan en este worktree. Los dos informes anteriores se recuperaron
para lectura; ocho destinos de publicación del 12/10 tampoco están en Desktop.
La ubicación Mac citada no está disponible desde este equipo. Se conserva esa
laguna; la consulta actual a Render/BD no recrea sus recibos históricos.
Los 561 TXT de desensamblado/IL/logs sólo se inventariaron por nombre/tamaño:
esta revisión no vuelve a decompilar ni recertifica cada afirmación binaria.

Fuentes reproducibles privadas: `documentos-inventario.json`,
`documentos-suplemento.json`, `enlaces-locales.json` y registros finales de lectura.
Constancia completa: `lecturas-completadas.md/json`; registros de lotes y
comparaciones en `lecturas-codigo.json`, `lecturas-completadas-documental.json`,
`lecturas-desktop-revisiones.json`, `snapshots-hunks.json` y
`desktop-fuentes-hunks.json`.
Los informes fechados siguen siendo historia; [estado](../ESTADO-ACTUAL.md) y
[roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md) gobiernan el siguiente trabajo.

## Qué se aplicó después de REA

| Entrega | Resultado que existe | Estado y límite |
|---|---|---|
| ClonerSoft/REA 12/10, C1 | PVP por medidas en el ámbito contrastado, contención de reserva plana, acabado de artículo; cliente, F7/F9 y foco | Publicado en `40cedd1`; dos filas dimensionales. No coste dimensional ni fabricación general |
| Extracción diferencial 13/10 | Contratos y comparación de 30 dominios | Investigación; su alcance excluía implementar todos esos dominios |
| Merge Windows–Mac 13/10 | Catálogo/cotas/TMP/dibujo/PDF reconciliados en `fa32fba` | Integración de código local; no publicación por el mero merge |
| E1 físico/condicional | `prepararDespunteCatalogo` y `seleccionarDespunteCondicional`, 67 pruebas de entrega | Funciones puras locales, sin adaptador comercial web ni cargo de cabecera |
| Tarifa dinámica 14/10 | `seleccionarRegistroTarifaDinamica`, cuatro búsquedas, 47 pruebas de entrega | Selector local; sin fórmula de precio, activación, UI o persistencia comercial |
| REA 16/10 y continuaciones estáticas | 123 identidades managed, contratos y comparación de 35 capacidades; configuración/formato estudiados | Evidencia estática. La cadena Windows está archivada y no prueba ejecución en Productor |
| E1 funcional 18/10 | Costes técnicos decimales equivalentes como `4` y `4.0000` ya son compatibles | Corrección local de Producción; no escribe cargo al presupuesto |
| P.6/P.7 18–19/10 | Overflow, retorno de foco, teclado y etiqueta Acristalamiento a zoom nativo 200% | Verificación local con componentes reales y respuestas sintéticas; no publicación ni aceptación integral |

El barrido actual de `packages` y `scripts` localiza los helpers nuevos E1 y el
selector dinámico en definiciones, pruebas y exportaciones, sin consumidor
comercial web. El despunte técnico que ya muestra Producción es otro cálculo:
mostrarlo no equivale a repartirlo ni guardarlo en el presupuesto.

Referencias: [publicación C1](PUBLICACION-CLONERSOFT-2026-10-12.md),
[extracción](EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md),
[contrato E1](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md),
[selector dinámico](IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md),
[REA](INVESTIGACION-REA-PRODUCTOR-2026-10-16.md) y
[relevo funcional](RELEVO-APLICACION-ALUMINIOR-2026-10-18.md).

## Fases originales y aceptación

Las fases originales 0–8, los lotes de la carpeta `fase-8`, los ensayos antiguos
E01 y los frentes económicos E1–E11 son numeraciones distintas. No se suman.

| Fase original | Implementación contrastada | Lo que impide declararla completa |
|---|---|---|
| 0. Evidencia | CHM, observaciones y contratos conservados | Evidencia original incompleta en esta copia y variantes sin aceptación |
| 1. Guardado/reintento | Transacciones, identidades de operación, copia y reapertura; pruebas SQL y navegador actuales | No login real, recuperación universal ni aceptación comercial integral |
| 2. Geometría | Milímetros, composición y dibujo compartido web/PDF | Falta contraste equivalente integral; dibujo no acredita receta de fabricación |
| 3. Composición/catálogo | Configuración v3, compatibilidad v1/v2 y plantillas | Catálogo completo y variantes/interacciones no cubiertas |
| 4. Materiales | Serie/vidrio, herencia/excepción y aplicación a modelos iguales | Otras familias y semántica completa de Actualizar todos |
| 5. Vidrio/huecos | Búsqueda canónica, teclado y selección | Editor interno, travesaños, equivalentes y recetas alternativas |
| 6. Uniones/acabados | Catálogo, normalización y persistencia parciales | Compatibilidad, unión material de otra serie y reparto físico del grosor |
| 7. GRUPO/valoración | Motor, snapshots, cantidades/ajustes y C1 | E1–E11 y recetas/acabados/redondeos sin contrato aceptado |
| 8. PDF/aceptación | PDF multipágina, teclado y recorridos aislados | Aceptación comercial P.2, mismo recorrido humano y fabricación integral |

El banco histórico **400/523** corresponde a una muestra de precios; conserva
81 cercanos, cinco distintos, 37 sin valorar y 434 exclusiones. Su 76,48 % no
es el porcentaje de integración del producto. No se ha repetido ese banco.

| Frente económico vigente | Estado y comprobación que falta |
|---|---|
| E1 despunte comercial | En curso: filas/agregados, cantidades/descuentos, configuración RED/locale/redondeo y escritura. Cargo desactivado |
| E2 unión de otra serie | Caso positivo material con serie/acabado/geometría acreditados |
| E3 comisión | Existe cálculo; quedan orden de redondeo, residuos y edición guardada |
| E4 tapajuntas inferior | Caso de puerta SI/NO contrastado por lateral/travesaño |
| E5 compacto/metraje | Discriminar COMPVAL 4,93/4,94 y configuración efectiva |
| E6 vidrio alternativo | Contención publicada: conserva incompleto. Recetas alternativas sin implementar/aceptar |
| E7 fracciones | Persistencia web probada; receta y cortes equivalentes Productor pendientes |
| E8 herraje | Condicionado a brechas: límites reales del tramo de hoja |
| E9 cotas/divisiones | Condicionado: cadenas restantes con predicción independiente |
| E10 acabado/PVP | Acabado efectivo por ámbito y selección; coste dimensional no resuelto |
| E11 mínimos/múltiplos | M2 implementado; ML con mínimos/múltiplos bloqueado y fronteras restantes pendientes |

El [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md#secuencia-de-trabajo) conserva
sus estados y orden; esta tabla explica la auditoría y no crea otro backlog.
Stock/reservas/consumos, compras/recepciones, cobros/vencimientos e informes
tienen además brechas propias. Un pedido o un PDF existentes no cierran esos módulos.

## Producción comprobada hoy

Consulta Render por API: servicio `srv-d9dprl741pts73dlrpd0`, rama `main`,
deploy `dep-db6hi2navr4c739d2e4g`, terminado el 12/10 a las 17:31:21 UTC
(19:31:21 Madrid), estado live `40cedd1`. No hay entrega posterior entre las
cinco últimas. Los arreglos locales del 18–19/10 no están desplegados.

El destino efectivo de Render coincide con el proyecto Supabase de la ficha
July. Se consultó PostgreSQL remoto con `default_transaction_read_only=on` y
transacción `READ ONLY`, comprobando identidad antes de los SELECT. Hay 33
migraciones, como en el código local. Los hashes de 0031/0032 coinciden al
normalizar CRLF a LF; no se afirma igualdad íntegra de esquema por ese recuento.
Las consultas conservan sólo metadatos y agregados: 17 presupuestos, cinco
configuraciones/snapshots, dos filas de PVP dimensional y cero cargos de línea
y gastos de cabecera. Esos recuentos no prueban las reglas ni una aceptación.

En el navegador se abrió el presupuesto QA existente 260013 y su formulario;
F7 lleva a Introducir línea. Se abrió la hoja QA 260009: presenta incidencias
de ángulos/posiciones/datos de fabricación y el bloque «Coste técnico de
despunte» con «Sin cargo al presupuesto». Esto confirma un límite operativo
visible en ese caso. No se recalculó, guardó, copió ni modificó nada en remoto.
La pestaña se devolvió al listado de presupuestos.

Recibos privados: `produccion-metadata.json`, `remoto-lectura.json`,
`produccion-presupuesto-qa.png`, `produccion-incidencias-qa.png` y
`produccion-despunte-sin-cargo.png`. La ficha de acceso conserva un estado
histórico anterior; se usaron sus punteros y se verificaron los destinos actuales,
sin volcar secretos ni actualizar esa ficha fuera del alcance de esta revisión.

## Pruebas ejecutadas en aislamiento

Instancia nueva `aluminior-rea-audit-20261019-b`, PostgreSQL 16, red bridge
exclusiva, sin carpetas del host montadas y puerto publicado sólo en 127.0.0.1.
No es una red Docker interna. Identidad, etiquetas, puerto y base vacía se
comprobaron antes del bootstrap/migraciones. Se aplicaron las 33 migraciones
sólo allí, con `auth.users` sintético; los tests recibieron URLs explícitas.
Los contenedores propios quedaron detenidos. No se tocaron contenedores ajenos.

| Gate actual | Resultado | Alcance |
|---|---:|---|
| Core | 964/964, 71 archivos | Cálculo puro; repetido por el arquitecto con dos workers |
| ETL seleccionado | 68/68, ocho archivos | Transformaciones/CSV sintético y dobles; no toda la suite ETL ni CSV privados |
| DB | 56/56, cuatro archivos | PostgreSQL nuevo y aislamiento transaccional |
| Web completo con dos workers efectivos | 881/881, 131 archivos | Servicios/acciones y persistencia en la instancia nueva |
| Navegador escritorio/móvil | 10/10, sin omitidos ni flaky | Cinco recorridos en cada viewport; servidor local y BD E2E propia |
| Tipos de cuatro paquetes y arquitectura | Correctos; cero infracciones | Arquitectura final: 871 archivos, 414 módulos |

Primera pasada web: **877/881**, con cuatro timeouts de 5 s. npm no transmitió
el límite de workers solicitado. Se conserva ese fallo. Los cuatro casos pasan
aislados; después pasa la suite íntegra invocando Vitest directamente con
`--maxWorkers=2`. No se cambió timeout, aserción ni código. No se afirma haber
corregido la ejecución sin límite ni haber demostrado la causa exacta de contención.
Un primer contenedor con red interna no publicó puerto y fue rechazado antes
de ejecutar SQL; su recibo se conserva separado de la ejecución válida.

Los recorridos de navegador comprueban alta/copia tras perder respuesta
postcommit, medidas decimales/edición/PDF, catálogo con latencia/fallo/reintento
y dos casos de selección canónica de cliente por teclado. Usan el acceso QA
local existente: **no prueban Supabase Auth**. El caso decimal conserva precio
nulo de forma deliberada: prueba persistencia honesta, no precio aceptado.
El PDF se comprueba por transporte/formato; no sustituye su aprobación comercial.

Evidencia: `docker-destino-verificado.json`, `docker-resultado.json`, logs DB/web,
`web-reproduccion.json`, `web-completo-workers2.log`, `e2e-resultados.json`,
trazas/capturas y logs `arquitecto-*`. No hay omisiones nuevas para pasar gates.
Las pruebas previas de foco/zoom conservan sus evidencias y fecha; no se atribuyen
a estos diez recorridos todos sus casos visuales o al 200%.

## Decisión y siguiente trabajo

**Ahora:** mantener E1 comercial y tarifa dinámica sin activar. El siguiente
paso E1 es una nueva empresa sintética aislada de Productor, con RED/locale
efectivos y predicciones que discriminen redondeo; requiere autorización propia
para ejecutar el original. G6 permanece intacto. La ruta autenticada real,
comparación humana equivalente y aceptación del taller siguen abiertas.
Las pruebas de guardado aislado de estos diez casos ya están ejecutadas;
no deben seguir apareciendo como si nunca se hubiesen probado.

**Después:** completar reglas E2–E11 en el orden existente, aceptar P.2/P.6/P.7
y preparar la publicación de un lote concreto con revisión y reversión. Cada
lote necesita alcance y aceptación propios; esta auditoría no autoriza desplegar.

**Experimental:** más reconstrucción binaria, CNC o integración avanzada sólo
si hay una decisión de producto, caso discriminante y condición de corte.

No hay base para dar coste total, plazo o rentabilidad de toda la paridad.
Esta revisión no contrata infraestructura nueva; el mantenimiento más simple
es conservar un solo roadmap y entregar reglas aceptadas en lotes pequeños.
El riesgo principal es usar precio o fabricación parciales como si estuviesen
aceptados. Las incidencias y los importes incompletos deben permanecer visibles.
