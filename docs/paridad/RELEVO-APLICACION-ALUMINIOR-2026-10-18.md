# Continuación orientada a entregas utilizables de Aluminior

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
arquitecto se conservan como evidencia. No fue necesaria una corrección.

Se actualizan estado, roadmap, índice y este relevo; la observación de BODY
se conserva identificada como histórica. Los mismos ítems July E1 y P.6/P.7
mantienen historia íntegra e in_progress, con lectura posterior y sin sync.
14 árboles/2.861 archivos y siete binarios protegidos se verifican por hash.
Entrega local: publicación, comparación humana y aceptación integral abiertas.

Siguiente unidad local concreta: verificar visualmente el configurador y sus
estados de aceptación/rechazo al 200% de zoom nativo, con capturas válidas y
recorrido de teclado. Componentes reales y respuestas sintéticas sin BD;
no repetir el retorno de foco ni reabrir Windows. El recorrido autenticado y
guardado/reapertura siguen condicionados a aislamiento efectivo y autorización.

## Continuar en otra conversación

Usar exclusivamente la raíz y rama del inicio de este relevo. Verificar en
solo lectura raíz, rama, HEAD, estado e identidad; no encajar diferencias con
reset/checkout/stash. Leer AGENTS.md, ESTADO-ACTUAL, roadmap y este relevo.
Consultar el último commit local, sin retroceder al cierre documental antiguo.
Continuar la verificación visual del configurador al 200% de zoom nativo,
con capturas válidas, respuestas sintéticas y sin persistencia. El retorno
tras alta está verificado localmente; no repetir matriz E1, producción,
errores ni foco entregados ni reabrir Windows. Conservar pruebas y límites.
Máximo dos subagentes, sin subdelegación; revisión independiente de artefacto,
contrato y evidencia, una corrección y gates; congelar antes de commit Sergio.
Actualizar los mismos items July, E1 sync_uid 398049fbd618069e36bb84bab37913ed
y P.6/P.7 local 195 (redescubrir ambos), historia íntegra e in_progress, lectura
exacta, sin sync. Sin SQL/BD, datos reales, migraciones, legado/DLL/COM,
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
