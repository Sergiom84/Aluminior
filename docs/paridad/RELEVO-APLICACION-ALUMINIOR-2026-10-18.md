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

## Primera entrega de la siguiente conversación

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
