# Continuación orientada a entregas utilizables de Aluminior

> **Actualización — 19/10:** [auditoría de integración](AUDITORIA-INTEGRACION-REA-2026-10-19.md). Render continúa en `40cedd1`; las últimas entregas son locales. Diez E2E con BD Docker nueva y QA local pasan. Auth Supabase, comparación humana y aceptación integral permanecen abiertos. Esta autorización de pruebas no incluye ejecutar Productor, activar cargos ni publicar.

> **Petición posterior — 19/10, primer arranque observado:** Sergio autoriza E1 aislado y aplicación de lo demostrado, sin G6 ni producción. [Resultado y siguiente dependencia](PASO-E1-DESPUNTE.md#ensayo-autorizado-del-1910-configuración-y-redondeo): reinicio completado, Sandbox operativo y 341 copias verificadas. El comprobador de Productor exige Crystal Reports 13.0.35; primer intento detenido y revisado. MSI local 13.0.0.99; oficial 13.0.35.4870 instalado sólo en el invitado `d8248510-bae0-4a2e-a208-93484eee479c`, salida 0 y sin reinicio. Al reabrir la copia, Crystal ya no bloquea. Parada sin pulsar Aceptar: el programa pide actualizar controles y librerías. No repetir reinicio/activador/inventario ni exigir demo. Licencia, RED/locale y R1 siguen sin observar; ningún cambio monetario nuevo. El aviso anterior conserva el alcance de la auditoría, no revoca esta petición.

> **Continuación — 19/10, tarde:** Sergio comunica que no tiene la mochila USB de
> licencia; el ensayo E1 en el invitado queda parado tras instalar Crystal, registrar
> MSCOMCTL.OCX sólo en el Sandbox y recorrer gaControlesReg (único error: falta
> `C:\Windows\CRYSTAL\`). El frente elegido pasa a ser E2:
> [serie propia de la unión](EVIDENCIA-E2-UNION-SERIE-2026-10-19.md), implementada y
> verificada localmente. Siguiente medición: banco con base cargada, con autorización propia.

## Decisión vigente

Sergio pide cerrar fases y aplicarlas a Aluminior en la vida real. Esta instrucción
sustituye la continuación automática de las cadenas estáticas de Windows.
La rama KernelBase/ntdll/ncryptprov/NtCreateUserProcess queda **detenida y archivada
como referencia**, sin borrar sus pruebas ni presentarla como resuelta.
No está demostrada su conexión con la ruta de Productor que motivó E1.

El roadmap existente conserva el orden E1–E11. Este documento cambia el método
de avance y el siguiente resultado exigible; no crea otro backlog ni declara
paridad completa. Prioridad: una regla de negocio verificable y una entrega
utilizable por lote. Más capturas, hashes o funciones desensambladas no cuentan
como avance funcional por sí solos.

## Punto de partida y trabajo ya realizado

Raíz exclusiva para comandos de esta continuidad:
`C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior`.
Rama `codex/rea-productor-20261016`.
Último cierre estático: `ff4c5be9725071bdf320972b8a7accf71fe03826`.
El commit documental que añade este relevo será posterior: localizarlo con Git,
sin volver al commit antiguo mediante reset, checkout o stash.

| Trabajo | Estado que se puede sostener | Límite |
|---|---|---|
| C1, precio dimensional y tramo de teclado/foco P.6/P.7 | Publicación y QA técnicos registrados el 12/10 en `40cedd1` | Estado histórico, no comprobación de producción hoy; aceptación integral pendiente |
| Presupuestos, miniaturas, decimales, idempotencia y PDF | Entregas técnicas anteriores documentadas en estado/roadmap | No certifican todas las familias, precio, fabricación o aceptación comercial |
| Subcontrato físico/condicional de despunte E1 | Implementado y verificado localmente el 13/10; 67 pruebas en su entrega | No activa el cargo monetario de cabecera |
| Selector de tarifa dinámica | Implementado/verificado localmente el 14/10; 47 pruebas | Selecciona un registro; no calcula precio ni activa la tarifa |
| E1: observaciones A–F y G1–G5 | Evidencia comercial conservada de cálculo, sustitución y reapertura en los casos observados | G6-incidencia protegida; no repetir ni extrapolar esos casos a todas las variantes |
| Investigación estática de E1 | Consumidor, reparto, descuentos, formato, configuración y dependencias documentados | No equivale a configuración efectiva, aceptación matemática ni persistencia real |
| Última rama de Windows | Inicializador local de Flags y un llamador Ex de ncryptprov acreditados | No demuestra ejecución en Productor ni conexión con su PEB consumidor; no continuar por defecto |

Código local que debe inspeccionarse antes de construir: `packages/core/src/produccion/despunte*.ts`,
`packages/core/src/produccion/despunte-catalogo/` y
`packages/core/src/precios/tarifa-dinamica/`. Verificar el estado real del código y
los tests relevantes; las cifras anteriores conservan su fecha y no son gates de hoy.

Los catorce árboles de evidencia existentes se conservan completos:
429/59/92/146/140/77/127/374/189/198/151/223/269/387 = **2.861 archivos**.
Último inventario: `output/e1-processparameters-caller-20261018/postcommit-receipt.json`.
Las evidencias privadas no viajan con Git ni July. Una fuente ausente se declara
ausente; no se reconstruye ni se ejecuta el legado para suplirla sin autorización.

## Resultado local del 18/10 y siguiente entrega

La evaluación de las ocho preguntas está realizada en la
[misma matriz E1](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contraste-de-las-ocho-preguntas):
evidencia, código/pruebas, incertidumbre, caso mínimo y responsable/condición
de cierre. No repetirla como siguiente tarea ni retomar Windows.

Función corregida localmente: en Producción → documento → «Coste técnico de
despunte», costes iguales como `4` y `4.0000` ya no se consideran incompatibles.
Se usa comparación decimal exacta en el adaptador puro; costes distintos,
ausentes y cero explícito conservan su significado. No se cambia el cargo,
la interfaz, el optimizador ni el presupuesto guardado.

Pruebas sintéticas y renderizado React del bloque existente; no se ha abierto
el recorrido autenticado con BD ni certificado navegador, guardado o uso real.
El contrato monetario sigue bloqueado por filas/agregados efectivos,
descuentos/cantidades, escalas y empate/localización, y atomicidad/persistencia.

Siguiente entrega E1 concreta: con nueva autorización para empresa sintética
aislada de Productor, registrar `REDprecio/REDlinea/REDbase/REDtotal` y locale,
fijar predicciones divergentes y observar un caso que discrimine redondeo.
G6 no se modifica y no se necesita continuar ninguna dependencia de Windows.
La integración posterior en Aluminior requiere además BD efímera con URL,
puerto, nombre y ausencia de datos reales verificados antes de toda escritura;
su creación/uso y migraciones necesitan alcance autorizado. Una rama no basta.

El frente independiente de componentes de producción se ha verificado
localmente en la entrega P.6/P.7 siguiente. E2 sigue siendo el siguiente frente
económico del roadmap; necesita su caso positivo de unión material.
Esta entrega queda local; publicación y aceptación real siguen pendientes.

## Resultado local P.6/P.7 de producción — 18/10

Corrección mínima: `break-words` en el título de artículo/acabado de
`produccion/_components/hoja-corte.tsx` y el aviso de coste incompleto de
`despunte.tsx`. Código sintético largo: la página medía 587 px a 375/320 de
viewport; ahora mide 360/305, exactamente el ancho útil tras la barra vertical.
Se conserva todo el texto y las tablas mantienen desplazamiento interior.
No cambia cálculo, formulario, precios, cargos, tipografía ni tokens.

| Comprobación ejecutada en Chromium | Alcance y resultado |
|---|---|
| 1280/768/375/320 y control 640 | Dos casos: fixture J04 normal y perfil largo con costes ausentes coherentes. Diez combinaciones sin desbordamiento de página; títulos, avisos y controles contenidos |
| Tab/Shift+Tab y flechas | Barra → kerf → saneamientos → Recalcular → resumen. Foco visible; resumen al extremo derecho y vuelta al izquierdo por teclado, retorno al botón. No se recorren individualmente las otras nueve regiones de tabla |
| Zoom nativo 200 % | Perfil temporal propio de Chrome, ajuste visible «Zoom de la página: 200%». Ventana 1280, `innerWidth=640`, DPR 2, `visualViewport.scale=1`, zoom CSS 1; controles/foco/tabla accesibles, ancho útil y scroll 632 |
| Movimiento reducido | Preferencia activa en las diez combinaciones; cero animaciones/transiciones activas y mismo contenido entre anchuras |
| Recalcular por teclado | Barra 6400 + Enter: navegación GET con cuatro parámetros, valor conservado y bloque técnico presente; sin escritura |
| Regresión de componentes | 40/40 pruebas puras existentes; tipos de cuatro paquetes y arquitectura sin infracciones |

El gate inicial de foco suponía que el ancho computado sería literalmente
`2px`; Chromium devolvió `1.6px` también para una referencia aislada declarada
de 2px. Se conserva ese fallo y la calibración en los logs. El gate final
exige `:focus-visible` y el mismo ancho computado que esa referencia de 2px,
sin cambiar CSS ni aceptar un contorno menor que la referencia.
Las dos pruebas auxiliares que sólo exigían clases se conservan en privado;
no se versionan ni se usan para acreditar layout.
La matriz final automatizada se ejecutó en Chromium sin interfaz y con
preferencia de movimiento reducido: contorno de 2px y flechas correctos.
Se conservan las ejecuciones visibles donde el desplazamiento por flechas no
avanzó; no se atribuye una causa no demostrada. El zoom nativo 200% y su
teclado hasta el resumen y su desplazamiento a la derecha sí se comprobaron
en el perfil temporal visible, por separado. La vuelta izquierda y Shift+Tab
corresponden a la matriz automatizada. La captura `zoom-nativo-200.png` salió
vacía, comprobado también por el revisor: no sirve como aceptación visual.
El 200% queda acreditado por métricas DOM y snapshot del ajuste de Chrome;
su verificación visual permanece abierta.

Revisión independiente: una ronda, sin defectos bloqueantes en las dos líneas;
reprodujo 40 pruebas, tipos y arquitectura. Una corrección documental delimita
las tablas recorridas y la captura vacía, sin cambiar el código ni los gates.

Evidencia privada: `output/playwright/p67-produccion-20261018/`, métricas antes/
después, diez escenarios, zoom nativo, capturas y salidas crudas. Harness HTTP
en 127.0.0.1, componentes reales y CSS compilado de la aplicación; sin BD,
Shell, cabecera autenticada ni recorrido servidor completo. No ejecutar el
servidor E2E habitual: aplica migraciones y queda fuera de esta autorización.

Mapa de evidencia: `EVIDENCIA-VIDEO-PRESUPUESTO.md:299–353` conserva las dos
hojas y sus campos. El vídeo de ratón no acredita atajos (`402–403`). Tab,
Shift+Tab, flechas y foco son accesibilidad propia de Aluminior; F7/F9 del
contrato de presupuesto del 12/10 no se extienden a producción.

Estado: tramo técnico de estos componentes verificado localmente; P.6/P.7
integral sigue abierto, sin publicación ni aceptación real. La siguiente unidad
de cabecera/configurador está realizada en el apartado posterior.
Sigue pendiente comparación
humana con Productor y recorrido autenticado autorizado. E1 económico conserva
su bloqueo y la prueba mínima ya fijada, sin repetir su evaluación.

## Resultado local P.6/P.7 de cabecera y configurador — 18/10

Función disponible en la cabecera del presupuesto y su configurador:

- Cliente elegido con Tab/Enter conserva el código canónico, cierra la lista y
  devuelve foco a Cliente. F9 vuelve a alcanzar la cabecera activa.
- Rechazo de alta: foco al primer campo inválido; si no existe, a la primera
  alerta del formulario. Artículo, serie, composición, fallo general y opciones
  de herraje/acristalamiento mantienen los valores y configuración del borrador.

Sólo cambian SelectorCliente, AnyadirLinea y la capacidad de enfocar
MensajeError/ErroresSeleccion. Se reutiliza enfocarEdicion sin editarlo. Sin cambios económicos,
de diseño, cálculo, estado de documento o persistencia.

| Evidencia ejecutada | Resultado y alcance |
|---|---|
| Control con fuente c2abcc8b cargada sólo en memoria | Seis casos fallan antes: cliente Tab/Enter/F9 y rechazos de artículo, serie, composición, fallo general y opciones de estructura. Los seis pasan con el cambio. Control adicional: sólo ErroresSeleccion anterior, manteniendo los otros tres cambios, vuelve a perder foco en opciones |
| Matriz Chromium 1280/768/375/320 | Los seis casos por anchura; envío de alta mediante Enter. Foco visible y dentro de viewport, borrador idéntico y una llamada sintética por envío. Sin desbordamiento de página, movimiento reducido activo |
| F7/F9/Escape | F7 no saca foco del modal; Escape vuelve al disparador; F7 fuera enfoca el configurador. F9 no envía una línea ni una cabecera con lista abierta. Cancelar cabecera devuelve foco al botón. Quince alternancias Tab/Shift+Tab dentro del diálogo por anchura, sin acreditar barrido de todos sus controles |
| Respuesta de alta aceptada simulada | Observación histórica de esta entrega: reinicio conservado y foco en body. Corregido posteriormente en la unidad de retorno tras alta que figura más abajo |
| Regresión | 35/35 pruebas puras existentes, sin globalSetup SQL; tipos de cuatro paquetes y arquitectura sin infracciones |

Evidencia privada: output/playwright/p67-cabecera-20261018/; contrato,
fuentes del harness actual, inputs de compilación sin módulos DB/servidor,
navegador-final.log/navegador-final.json, capturas 1280/320 y recibos de preservación.
La primera pasada con ratón se conserva en navegador.log; la matriz final
usa Enter y comprueba :focus-visible. Se inspeccionaron ambas capturas.
El primer fixture de ESTRUCTURA esperaba Ubicación, inexistente en ese modo;
se conserva su timeout en navegador-localizador-fallido.log. El gate corregido
elige Perfiles en el formulario real, sin cambiar ni debilitar sus aserciones.
El harness monta los componentes reales y CSS de Aluminior en 127.0.0.1,
sustituye únicamente acciones servidor por respuestas sintéticas y no persiste.
No es Shell, ruta autenticada, guardado ni aceptación real. No se ha comprobado
zoom nativo en esta unidad; el límite visual 200% de la entrega anterior sigue
abierto. No ejecutar la configuración web estándar/E2E habitual: migra SQL.

Una revisión independiente reprodujo las 35 pruebas, tipos, arquitectura y
diffcheck; detectó la alerta de opciones no enfocable y un puntero documental
agotado. Única corrección: hacer enfocable ErroresSeleccion y actualizar el
puntero. Después se ejecutaron los gates finales, incluido el control aislado
de esa alerta; no se abrió otra ronda ni otro frente.

Mapa de evidencia: INVESTIGACION-CLONERSOFT-2026-10-12.md:114–123 conserva
F7/F9 y selección canónica. El foco de rechazo es accesibilidad propia de
Aluminior, no observación del foco exacto de Productor. El cargo E1 sigue
desactivado y conserva su prueba comercial pendiente.

El siguiente defecto identificado en esta entrega queda atendido por la unidad
posterior. No ampliar a guardado/reapertura hasta concretar y autorizar BD
efímera aislada. P.6/P.7 sigue en curso; no se acredita aceptación real.

## Resultado local P.6/P.7 de retorno tras alta — 18/10

Función disponible localmente: tras una respuesta aceptada de alta de
CERRAMIENTO, se conserva el reinicio existente y el foco pasa al botón
«Añadir primera ventana», una vez remontado el diseñador. Enter abre el
selector real y Escape vuelve a ese botón. No cambia el destino inicial de
foco ni al alternar Artículos/Cerramiento. Los modos ARTICULO/ESTRUCTURA no
reciben este retorno; su comportamiento no se amplía en esta unidad.

| Evidencia ejecutada | Resultado y alcance |
|---|---|
| Control con fuente d0e4b29 cargada sólo en memoria | Cuatro escenarios, dos altas por escenario: ocho comprobaciones de retorno fallan antes y pasan después; el control conserva el fallo BODY sin restaurar archivos ni índice |
| Chromium 1280/768/375/320 | 16 escenarios actuales: alta directa y reintento tras campo inválido, rechazo general o respuesta perdida; segunda alta en cada escenario. Foco visible con contorno y dentro de viewport, sin overflow de página y movimiento reducido activo |
| Borrador y envío | FormData completo y configuración idénticos durante el envío y tras rechazo. Reintento conserva datos y solicitudId; nueva alta posterior a éxito recibe otra identidad. Botón bloqueado mientras la respuesta sintética está retenida; Enter adicional no duplica la llamada |
| Regresión | 35/35 pruebas puras, tipos de cuatro paquetes y arquitectura sin infracciones; sin cargar el globalSetup SQL de web |

Prueba reproducible versionada: `node scripts/pruebas-ui/alta-foco/verificar.mjs`;
instrucciones y suite pura en el README del mismo directorio. Bundle con
AnyadirLinea/diseñador y CSS reales; acciones servidor sintéticas, listener
127.0.0.1 de puerto libre y peticiones limitadas a GET de ese origen. Todos
los inputs de compilación se inspeccionan para excluir BD/acciones reales y
exigir componentes reales. No ejecuta/importa scripts históricos ni configuración
web/E2E habitual. Navegador y listener se cierran al terminar o fallar.

Evidencia privada: `output/playwright/p67-alta-foco-20261018/`, métricas,
inputs de ambos bundles y capturas 1280/320 inspeccionadas. Los campos de
ubicación, serie, cantidad y horas conservan su comportamiento previo tras
éxito; sólo se reinicia la composición existente. No es una prueba de
persistencia, autenticación o guardado real. No se verifica zoom nativo en
esta unidad ni el foco exacto de Productor: el destino es una decisión de
accesibilidad propia de Aluminior para continuar el flujo observado en
INVESTIGACION-CLONERSOFT-2026-10-12.md:114–123. No hay cargos económicos.

Revisión independiente única: reprodujo el navegador y diffcheck, inspeccionó
ambas capturas y revisó código, harness y documentación; sin bloqueantes.
No repitió las 35 pruebas puras ni los tipos; sus salidas ejecutadas por el
arquitecto se conservan como evidencia. No fue necesaria corrección de producto.

Se actualizan estado, roadmap, índice, este relevo y avisos de continuidad
del relevo raíz, guía Windows, relevo REA y matriz E1; la observación de BODY
se conserva identificada como histórica. Los mismos ítems July E1 y P.6/P.7
mantienen historia íntegra e in_progress, con lectura posterior y sin sync.
14 árboles/2.861 archivos y siete binarios protegidos se verifican por hash.
Entrega local: publicación, comparación humana y aceptación integral abiertas.

La siguiente unidad de zoom nativo se ha completado en el apartado posterior.
El recorrido autenticado y guardado/reapertura siguen condicionados a
aislamiento efectivo y autorización; no repetir el retorno de foco.

## Resultado local P.6/P.7 de zoom nativo — 19/10

Corrección mínima en CamposCerramiento: la etiqueta Acristalamiento permite
partir la palabra dentro de su campo. Al 200% nativo, el área CSS de 632 px
quedaba sobre el corte móvil de 620 y el texto invadía Acabado. No se alteran
campos, orden, tokens, tipografía, precios, diseño del documento ni persistencia.

| Evidencia ejecutada | Alcance y resultado |
|---|---|
| Chrome visible 155.0.8059.80, perfil temporal propio | Ajuste de apariencia 100% → 200%, capturado; ventanas 1280/768/640, área CSS 632/376/312, DPR 1 → 2, visualViewport.scale 1 y zoom CSS 1. Sin emular viewport |
| Doce escenarios al 200% | Aceptación directa y rechazo de campo/general/respuesta perdida por ancho; reintento con borrador e identidad conservados, bloqueo pendiente y retorno operativo tras aceptar. Sin overflow de página; movimiento reducido |
| Etiquetas y control negativo | Ocho etiquetas reales por escenario medidas por rectángulos de caracteres. Fuente c46e6c5 de campos-alta.tsx cargada sólo en memoria: cuatro escenarios con Acristalamiento fuera del campo. Actual: cero; no se restauran archivos ni índice |
| Teclado del selector inicial | 28 botones visibles habilitados de su página inicial, recorrido completo interior por Tab y regreso por Shift+Tab, foco visible en viewport. Enter elige C2, Enter tras alta abre selector, Escape retorna. No acredita todas las familias/páginas |
| Capturas | 58 PNG completos de viewport, dimensiones físicas contrastadas con CSS × DPR. Selector, configuración, pendiente, rechazo y aceptación; inspección visual representativa a tres anchos. Las capturas anteriores recortadas/vacías se conservan como fallo, sin usarlas para aceptación |
| Regresión | 35/35 pruebas puras sin globalSetup SQL, tipos de cuatro paquetes y arquitectura sin infracciones |

Prueba reproducible: node scripts/pruebas-ui/zoom-nativo/verificar.mjs;
control negativo e instrucciones en su README. El montaje y gateway sintéticos
vigentes de alta-foco se reutilizan sin ejecutar su verificador ni sobrescribir
sus artefactos. Inputs del bundle inspeccionados: formulario/diseñador reales,
sin BD/acciones servidor reales. Listener 127.0.0.1, puerto libre, sólo GET del
origen; navegador y listener cerrados al terminar o fallar. Sin Shell ni ruta
autenticada, guardado, publicación o aceptación real. Perfiles temporales conservados.

Calibración del teclado: un diálogo HTML mínimo reproduce el paso del último
botón a la barra de Chrome (BODY y document.hasFocus false), seguido del retorno
al primero. El gate inicial suponía un ciclo sin ese paso; se conserva el fallo.
El gate final verifica todos los controles interiores en ambos sentidos desde
Cerrar; no promete impedir el acceso a la barra del navegador. El foco inicial
en familia seleccionada se mide por separado.

Captura nativa: el screenshot ordinario de Playwright recortaba usando el área
CSS a este zoom; sus PNG de configuración salían vacíos. Se conserva la pasada
automatizada previa como evidencia insuficiente. La captura final CDP, sin clip,
toma la superficie completa y comprueba cabecera PNG/dimensiones antes de
guardarla; no se modifica CSS para obtener la imagen.

Evidencia privada final: output/playwright/p67-zoom-nativo-2026-10-19T05-03-08-695Z/.
Control negativo y pasadas fallidas en carpetas hermanas fechadas; logs y recibos
en output/zoom-*. Se preservan por hash 14 árboles/2.861 archivos y siete binarios.
Revisión independiente única: reprodujo 12/12 escenarios y la preservación,
inspeccionó 14 capturas representativas de sus tres anchos/estados y contrastó
el control negativo, fuentes, inputs y salidas; sin bloqueantes. No repitió las
35 pruebas, tipos ni arquitectura: contrastó los logs del arquitecto. Informe
privado output/revision-zoom-20261019.md. Corrección documental final: rotular
como históricos tres punteros genéricos del 12/10; gate posterior sobre todos
los Markdown y diffcheck, sin otra ronda ni cambio de producto.
Mapa de evidencia: INVESTIGACION-CLONERSOFT-2026-10-12.md:110–125 conserva F7/F9
y el flujo de introducción. Teclado/foco/zoom son accesibilidad de Aluminior;
no se ha repetido Productor ni acreditado su foco exacto o su zoom.

Siguiente P.6/P.7 tras este lote de zoom: comparar el mismo recorrido humano
con Productor y verificar Auth real en aislamiento. La auditoría posterior del
19/10 ya ejecuta diez E2E de guardado/reapertura/copia con QA local y BD Docker
nueva; no prueba Supabase Auth ni toda la matriz de foco/zoom. No repetir los
gates entregados sin cambios o fallo nuevo. La captura visual 200% de producción mantiene su límite
histórico; esta unidad sólo cierra configurador. P.6/P.7 integral y E1 siguen
en curso; el cargo económico permanece desactivado.

## Auditoría documental, persistencia aislada y producción — 19/10

[Informe consolidado](AUDITORIA-INTEGRACION-REA-2026-10-19.md): no están completas
todas las fases. Código base auditado `caefa3f`; Render reconsultado live
`40cedd1` del 12/10, mismo proyecto efectivo de BD y 33 migraciones. Lectura
remota con transacción READ ONLY, metadatos/agregados y documentos QA existentes;
sin operaciones comerciales. Hoja QA con incidencias de fabricación y coste
técnico de despunte explícitamente sin cargo al presupuesto.

PostgreSQL Docker nuevo, red bridge exclusiva, sin montajes del host y puerto
loopback: 56 DB, 881 web y diez E2E correctos; 964 core y 68 ETL seleccionados,
tipos y arquitectura correctos. Primera web tuvo cuatro timeouts; los mismos
casos y después toda la suite pasan con dos workers efectivos, sin ampliar
tiempos ni cambiar aserciones. Se conservan ambos resultados. Los diez E2E
usan QA local y precio decimal nulo; no autentican en Supabase ni certifican
precio comercial. Contenedores propios detenidos; ningún contenedor ajeno tocado.

Se reparan las instrucciones activas de repetir la matriz E1/limpiar G6 y el
README E2E desfasado. Su evidencia fechada se conserva. La siguiente frontera
E1 no cambia: nueva empresa sintética, RED/locale y caso discriminante, con
autorización del original; G6 intacto. P.6/P.7: Auth real y comparación humana.
Sin cambios de producto, push, sync, despliegue ni cierre de E1/P.6/P.7.
Evidencia actual privada: `output/auditoria-integracion-rea-20261019/`.

## Continuar en otra conversación

Usar exclusivamente la raíz y rama del inicio de este relevo. Verificar en
solo lectura raíz, rama, HEAD, estado e identidad; no encajar diferencias con
reset/checkout/stash. Leer AGENTS.md, ESTADO-ACTUAL, roadmap y este relevo.
Consultar el último commit local, sin retroceder al cierre documental antiguo.
Zoom nativo verificado y diez E2E con persistencia en Docker ejecutados el
19/10, con QA local; Auth real y comparación humana equivalente pendientes.
E1 sigue requiriendo empresa sintética nueva y RED/locale/caso discriminante,
con autorización del original. No operar G6. No repetir matriz E1, producción,
errores, foco, zoom ni los diez casos Docker sin cambio/fallo nuevo; no reabrir
Windows. Conservar pruebas y límites. La siguiente ejecución del original
necesita autorización propia; esta auditoría no la concede.
Máximo dos subagentes, sin subdelegación; revisión independiente de artefacto,
contrato y evidencia, una corrección y gates; congelar antes de commit Sergio.
Actualizar los mismos items July, E1 sync_uid 398049fbd618069e36bb84bab37913ed
y P.6/P.7 local 195 (redescubrir ambos), historia íntegra e in_progress, lectura
exacta, sin sync. El permiso del 19/10 cubrió consultas READ ONLY y SQL/migraciones
sólo en Docker nuevo sintético, ya ejecutados; no es permiso de operación real.
Sin escrituras ni migraciones remotas, datos reales de prueba, legado/DLL/COM,
licencias, cargo, push, sincronización ni despliegue. Preservar 14 árboles y
2.861 archivos, índices, PE/PDB, vendor, originales, A–F/G1–G5/G6-incidencia;
no ejecutar/importar scripts históricos ni regenerar índices. Python siempre -B.

## Contrato de la evaluación del 18/10 (ejecutado)

Realizar **una única unidad acotada de evaluación de E1**, reutilizando las ocho
preguntas de [la matriz existente](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contraste-de-las-ocho-preguntas).
No volver a inventariar todo el proyecto ni redactar otro plan general.

Para cada pregunta —filas, base, cantidades, descuentos, sustitución, doble
cómputo, redondeo y escritura— registrar en esa matriz existente:

- Qué comportamiento necesita Aluminior y qué evidencia lo sostiene.
- Qué ya implementa el código y qué falta; señalar archivo y prueba.
- Qué incertidumbre cambia realmente el resultado económico o el guardado.
- Un caso discriminante con entradas y salida esperada, o indicar por qué
  todavía no se puede fijar esa salida. No inventarla para poder escribir un test.
- Decisión: aplicable ahora, bloqueante con prueba concreta, o aplazado sin
  bloquear otra entrega independiente. Propietario y condición de cierre.

**Salida obligatoria de esa evaluación:** elegir el menor cambio funcional que
se pueda implementar y verificar con evidencia suficiente, o identificar el
bloqueo exacto y su comprobación mínima. Si el contrato está suficientemente
acreditado, pasar a implementarlo localmente dentro del alcance autorizado;
no entregar sólo otro informe. Si no lo está, no activar el cargo ni rellenar
vacíos con una regla arbitraria. Reutilizar lo ya implementado y mantener el
bloqueo visible mientras se avanza por otro frente independiente autorizado.

## Criterio de corte y prioridad

Una investigación nueva sólo se justifica si se explicita: decisión de producto
que desbloquea, hipótesis alternativas, prueba mínima que las distingue y
condición para terminar. Preferir evidencia de negocio ya disponible y casos
observables a dependencias internas del sistema operativo.

La evaluación inicial acaba con la matriz y una decisión de implementación o
bloqueo; **no abre otra cadena de análisis**. Si una prueba depende de otra sin
acercar una salida observable, detener esa vía y documentar el bloqueo.
Reabrir Windows/NLS/criptografía requiere una justificación causal concreta y
una nueva decisión expresa de Sergio. No seguir NtCreateUserProcess por ser la
última dirección anotada en el relevo histórico.

No convertir E1 en un bloqueo universal: conservar el orden del roadmap y, si
E1 exige una observación aún no autorizada, identificar el siguiente frente
independiente ya autorizado que pueda entregar una función verificable. No
cambiar silenciosamente prioridades, reglas económicas ni criterios de aceptación.

## Qué significa cerrar y usar una fase

Aplicar este ciclo a cada ítem existente; no contarlo como nuevas fases del roadmap:

| Etapa | Evidencia de salida |
|---|---|
| Contrato listo | Entradas, configuración, fórmula/orden, redondeo, errores, límites y ejemplos esperados explícitos |
| Implementado localmente | Cambio mínimo en Aluminior, pruebas discriminantes, tipos y controles pertinentes; revisión independiente |
| Integrado y verificado en entorno aislado | Recorrido de aplicación: introducir/editar, recalcular, repetir, guardar, reabrir y comprobar importes; errores sin escritura parcial; aislamiento efectivo de BD |
| Preparado para publicar | Diferencia revisable, preservación, plan de publicación y reversión; autorización pendiente claramente identificada |
| Publicado y aceptado en uso real | Publicación autorizada, verificación del entorno efectivo y aceptación del recorrido por el titular; límites y seguimiento registrados |

No llamar «cerrado en uso real» a un test puro, un commit o una documentación.
Una función puede quedar cerrada localmente y pendiente de publicación: informar
ambos estados. Mantener todo cálculo de negocio en la arquitectura existente;
Productor no será una dependencia ejecutable de la aplicación web.

## Trabajo restante y forma de medirlo

E1 conserva cuatro bloques prácticos: evidencia pendiente, contrato/implementación,
contraste con Aluminior y pruebas aisladas. No equivalen a cuatro sesiones.
Después siguen E2 unión de otra serie, E3 comisión, E4 tapajuntas, E5 compacto/metraje,
E6 vidrio alternativo, E7 medidas fraccionarias, E8 herraje, E9 cotas/divisiones,
E10 acabado/PVP y E11 mínimos/múltiplos. E8/E9/E11 son condicionados.
También quedan otras brechas de almacén, compras, cobros, informes y aceptación,
con prioridad Ahora/Después/Experimental conservada en el roadmap.

No hay una fecha o un porcentaje fiable de integración completa. Medir el avance
por reglas aceptadas y recorridos utilizables, no por número de sesiones o gates.
Cada lote debe informar: resultado disponible para el usuario, casos cubiertos,
límites, estado local/publicado y siguiente bloqueo concreto.

## Límites y continuidad segura

Antes de cambios: verificar raíz/rama/HEAD/estado/identidad en sólo lectura;
preservar trabajo ajeno y leer AGENTS, estado, roadmap y este relevo.
No reset/checkout/stash para encajar diferencias. No ejecutar/importar scripts
históricos ni regenerar índices; Python siempre `-B`, incluido stdin.
Preservar PE, PDB, vendor, evidencias, originales y A–F/G1–G5/G6-incidencia.

Este relevo no autoriza publicar, activar cargos, usar bases reales, migrar,
ejecutar/cargar Productor o sus DLL, registrar COM, tocar licencias, borrar G6,
hacer push, sincronizar ni desplegar. Esas acciones necesitan alcance y
autorización específicos. Antes de trabajo con persistencia: worktree y BD de
prueba realmente aislados, destinos comprobados; una rama no aísla la BD.

Aplicar la delegación del proyecto: máximo dos subagentes simultáneos, sin
subdelegación; responsabilidades sin colisiones. El revisor recibe artefacto,
contrato y evidencia, no el razonamiento del autor. Una revisión y una corrección
máxima. Congelar ejecutores antes de staging/commit; identidad Git de Sergio.
No convertir el protocolo de investigación binaria en una obligación de nuevas
investigaciones para cada cambio funcional: ejecutar los controles pertinentes
al cambio, preservando la evidencia sellada como referencia de sólo lectura.

Mantener el mismo ítem July: proyecto `aluminior`, sync_uid
`398049fbd618069e36bb84bab37913ed`. Descubrir el ID local, conservar historia y
`in_progress` mientras E1 esté abierto, verificar lectura posterior exacta,
sin sincronizar. Los textos antiguos que ordenan continuar Windows quedan
subordinados a esta decisión vigente.

Actualizar estado, roadmap y punteros al terminar cada entrega; no crear listas
paralelas. Entregar un informe revisado de lo que realmente se puede usar.
