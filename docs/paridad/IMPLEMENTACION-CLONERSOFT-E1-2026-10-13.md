# E1: contrato físico y selección condicional

> **Dirección vigente — 18/10:** [cerrar fases y aplicarlas a Aluminior](RELEVO-APLICACION-ALUMINIOR-2026-10-18.md). La rama Windows/NtCreateUserProcess queda detenida como referencia histórica. Las instrucciones anteriores que ordenan seguirla no están activas. Evaluación de las ocho preguntas realizada el 18/10; corrección local de costes técnicos decimales equivalentes, sin cargo. Siguiente: caso comercial que discrimine redondeo con configuración efectiva y autorización aislada; mientras tanto puede avanzar P.6/P.7 con fixtures sintéticas. No repetir la matriz ni reabrir Windows.

13/10/2026. Entrega local parcial del [encargo ClonerSoft](ENCARGO-IMPLEMENTACION-CLONERSOFT-2026-10-13.md).
La identidad y el estado global siguen en [E1 del roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
El cargo de cabecera continúa abierto. Este contrato no acredita fabricación,
aceptación Productor, publicación ni producción.
La continuación vigente es [la matriz reevaluada el 18/10](#contraste-de-las-ocho-preguntas).
Las unidades estáticas del 13/10–18/10 conservan su evidencia y fecha como historia.

## Base y contrato

La integración Windows–Mac quedó cerrada localmente en `fa32fba`, con padres
`913dd43` y `97099bc`. Preserva el main posterior y las ampliaciones compatibles.
Se retomó la autorización directa de Sergio conservada en el chat de integración,
interrumpido; no se resolvió en paralelo a otro ejecutor de esa tarea.
Índice y archivos iniciales se conservaron en una copia privada fuera del barrido
de pruebas. Los originales Productor y los datos comerciales permanecen intactos.

- **Resultado exacto:** preparar grupos físicos de detalles seleccionados y
  resolver una regla condicional demostrada, en funciones puras independientes.
- **Destinatario y motivo:** motor del taller; separar identidad, metraje y cortes
  antes de integrar una repercusión económica.
- **Entrada:** origen de línea/detalle, artículo, acabado, tonalidad, metraje del
  detalle, cantidades, corte y largos explícitos; contexto y reglas condicionales.
- **Salida:** grupos completos o bloqueo; selección identificada, inactiva,
  sin coincidencia, inválida o ambigua. Sin importes ni escrituras.
- **Aceptación:** los casos discriminantes siguientes y ausencia de mutación;
  pruebas del núcleo, tipos, arquitectura y revisión independiente.
- **Protegidos:** otros módulos, snapshots, cargos, banco histórico, G6, originales,
  credenciales, migraciones históricas y datos reales.
- **Límites:** no adaptar producción/presupuestos, no expandir acabados dependientes,
  no elegir proveedor/coste, no calcular precio ni reparto monetario.

## Fuentes y decisiones propias

La [extracción diferencial](EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md)
y `output/clonersoft-20261013/fuentes/RESUMEN-REDACTADO.md:69–79` acreditan
agrupación artículo/acabado/tonalidad, metraje × cantidad principal, cantidades
de cortes y largo de artículo distinto de cero o estándar cuando es cero.
La selección estática ordena prioridades de mayor a menor y toma la primera
regla coincidente. Los filtros estructura/familia/serie son conjuntivos;
listas `;`, minúsculas y pertenencia exacta, sin recortar espacios. La familia
ausente incumple solo cuando se filtra por familia.

La coordenada privada de selección es `GetAcabadosDespunte` `0x06000191`,
con selector de prioridad `0x06001078`. Su artefacto existente se reutiliza;
no se incorpora código, CIL, binarios ni recursos propietarios al repositorio.

Son decisiones técnicas de contención de Aluminior: bloquear empates en la
prioridad ganadora, orígenes duplicados, largos incompatibles dentro del grupo,
identidades ausentes, cantidades fraccionarias/no finitas, productos de
cantidades fuera de Int32 y
datos físicos insuficientes. No se atribuyen esos bloqueos al original.
La conversión fraccionaria de `Convert.ToInt32` queda fuera de este lote.
El metraje explícito cero conserva su significado; ausencia no se vuelve cero.
La activación condicional ausente conserva el defecto falso; su estado inactivo
no afirma que el despunte global esté desactivado.

## Casos de aceptación fijados antes de construir

| Entrada sintética | Resultado esperado |
|---|---|
| Mismo artículo/acabado, distinta tonalidad | Dos grupos |
| Mismo artículo/tonalidad, distinto acabado | Dos grupos |
| Metraje detalle 2,4; principal 3; detalle 2 | 7,2 m y seis cortes; no multiplicar otra vez por detalle |
| Metrajes 2,4 × 3 y 1,1 × 2, mismo grupo | 9,4 m |
| Largo artículo 6400; estándar 6000 | 6400 mm |
| Largo artículo 0; estándar 6000 | 6000 mm |
| Largo artículo 0 y estándar ausente | Bloqueo |
| Origen repetido, metraje ausente o no finito | Bloqueo, sin grupos parciales completos |
| Estructuras E1;E2, familia F1, serie S1; entrada e2/f1/s1 | Coincide |
| Misma entrada, serie S2 | No coincide |
| Estructuras E1; E2; entrada E2 | No coincide con el término que conserva espacio |
| Sin restricciones y familia ausente | Coincide |
| Filtro de familia F1 y familia ausente | No coincide |
| Reglas coincidentes, prioridades 2 y 9 | Regla 9 |
| Empate en la prioridad ganadora | Ambiguo, no elegir por orden del array |
| Sin coincidencia | Lista vacía identificada como ausencia de regla |
| Configuración de acabados de regla ausente/vacía | Bloqueo |
| Repetir entradas sin modificarlas | Misma salida, sin acumulación ni mutación |

## Verificación de la base integrada

`npm run test:ci`: 1.890 correctas y una omisión previa condicionada al CSV
privado (850 core, 56 DB, 112 ETL y 872 web). Tipos de paquetes, E2E y scripts
correctos. Arquitectura: 851 archivos, cero infracciones. Scripts: 123 Vitest
y 119 node:test correctos. Diez recorridos E2E correctos, escritorio 1440×900
y móvil 390×844: alta, copia, decimales, PDF y teclado.

Revisión independiente: dos fallos de cotas, una corrección y gate determinista.
Medición antes del arreglo: dos fallos de fixture incompleta, quince del adaptador
CSV con fixture explícita y dos de cotas. No se debilitaron aserciones.
Logs privados en `output/clonersoft-implementacion-20261013/`.
`packages/db` no cambia respecto de la base; ninguna migración nueva o remota.

## Implementación y gate local E1

`prepararDespunteCatalogo` y `seleccionarDespunteCondicional` viven en
`packages/core/src/produccion/despunte-catalogo/`, con pruebas contiguas y
exportación pública desde `@aluminior/core/produccion`. El metraje entra/sale
como texto decimal, usando la aritmética pura ya existente y conservando toda
la escala; no se convierte a coma flotante ni se fija a céntimos.

Gate ejecutado por el arquitecto: `npm run test:ci`, 1.957 correctas y una
omisión previa por CSV privado: 917 core, 56 DB, 112 ETL, 872 web.
Son 67 pruebas nuevas E1. `npm run typecheck` correcto y arquitectura:
855 archivos, 411 módulos, cero infracciones. Los recorridos E2E 10/10 y
los 242 tests de scripts pertenecen al cierre inmediatamente anterior de
la integración; E1 no modifica web, DB, scripts o interacción.

Revisión descontaminada: artefacto, contrato y evidencia; 20 comprobaciones
puras independientes correctas, sin defecto funcional reproducido. Se reforzó
la aserción de conservación de ambos pares línea/detalle, sin cambiar el código
ni reducir la cobertura. Una ronda, una corrección de la prueba y gate focal.
Logs privados: `output/clonersoft-implementacion-20261013/`.

El lote cierra solamente este contrato puro. No hubo recorrido humano nuevo
en Productor ni pantalla nueva para E1; su aceptación integral permanece
pendiente. No se preparó/aplicó migración, cargó dato comercial o desplegó.

Coste del lote: dos funciones pequeñas, cuatro archivos más dos exports,
sin migración ni mantenimiento de infraestructura adicional. La validación
incluye 67 casos nuevos y gates/revisión descritos. No se estima importe total
en euros o rentabilidad sin tarifa de desarrollo y sin uso operativo del adaptador;
el riesgo económico sigue concentrado en el llamador aún sin demostrar.

## Continuidad económica

No repetir A–F/G1–G5, C1, M0, cargas, A3/A4 ni la integración ya cerrada.
G6-incidencia y su autorización de modificación permanecen protegidos.
Los snapshots actuales carecen de tonalidad y metraje valorado explícitos;
la función nueva necesita un contrato de adaptador antes de conectarse.
La repetición de la función pura no prueba persistencia del cargo.

El paso fijado el 13/10 era localizar el controlador que acepta «Repartir entre
las líneas». Los wrappers, despacho y consumidor se acreditaron en las
continuaciones del 14/10; ese paso histórico está agotado. La continuación
vigente figura en [Control, reparto y totales](#control-reparto-y-totales): filas, base,
descuentos/cantidades, retirada del cargo anterior, redondeo y persistencia.
Mientras falte ese enlace, no activar el cargo ni certificar ausencia de
doble cómputo entre GRUPO, componentes y detalles comerciales.

### Investigación dirigida de esta entrega

Se reutilizaron 30 inventarios y 137.441 aristas de llamadas, sin encontrar
un llamador externo de `CalculaDespunte` dentro de ese corpus. Es una ausencia
acotada, no prueba de que el programa carezca de llamador.
Se verificó el helper general de redondeos con escalas separadas de precio,
línea e importe total. Falta el enlace con E1: no fija su política de redondeo.

El candidato nativo `aluminioApp.exe`, SHA-256
`f7c49752d6c00e61d7a0f56dd4c0347a79b8da1bec26a020321d3ca353e3809b`,
conservó su huella antes/después. Sus literales UTF-16 localizan
`VPresupDespunte.cmAceptar_Click` en offset de archivo 3.599.072 y
`VPresupDespunte.FinalCalculo` en 3.599.008. Son nombres candidatos, no
referencias de llamada ni funciones analizadas. La búsqueda dirigida REA quedó
esperando el análisis automático inicial de Ghidra y se canceló al alcanzar
el límite de la unidad. Sesión cerrada: `open:false`, `analysis_run:null`.
No se ejecutó Productor, instaló proveedor ni modificó G6.

El paso estático anterior de búsqueda de referencias quedó cubierto por la
continuación siguiente. No repetir inventarios, literales ni wrappers.

## Continuación estática dirigida — 14/10/2026

- **Resultado exacto:** enlazar los dos nombres candidatos con código y seguir únicamente su salida/despacho para intentar cerrar el contrato monetario.
- **Destinatario y motivo:** motor de presupuestos; impedir un cargo económico basado en literales o cantidades físicas.
- **Éxito medible:** identidad de fuente, anclajes reproducibles, separación de hechos/inferencias/desconocidos y siguiente llamada concreta; solo implementar dinero si se demuestran todas sus reglas.
- **Alcance autorizado:** parsing estático dirigido del mismo EXE, disassembly privado, pruebas locales y documentación; reutilización del corpus ya extraído.
- **Fuera de alcance:** ejecución Productor, G6, cargos supuestos, inventarios generales y mezcla de instantáneas.
- **Ficheros o sistemas protegidos:** WIP, fuente original, datos comerciales, preparación física/condicional entregada, migraciones y producción.
- **Comprobaciones obligatorias:** huella antes/después, anclajes de bytes, gate local y revisión independiente; conservar los límites aunque los wrappers sean legibles.
- **Acciones que requieren autorización:** ejecución legacy aislada, G6, datos reales, publicación/despliegue; ninguna realizada en este lote.

Fuente única: `aluminioApp.exe`, misma SHA-256 anterior; PE32/i386 VB6,
sin CLR. La consulta REA `search_procedures` de `VPresupDespunte` agotó el límite
de transporte de 300 segundos durante el análisis automático inicial Ghidra
12.1.4; no hubo resultado parcial utilizable. No se repitió la consulta.
Se cerró la sesión y se verificó `open:false`, `analysis_run:null`.
El parsing/disassembly dirigido sí permite avanzar sin ejecutar el programa.

| Hecho estático | Anclaje en la misma fuente | Alcance |
|---|---|---|
| Literal FinalCalculo enlazado a push en código | Literal VA `0x0076eaa0`, offset 3.599.008; push `0x019b8426` | Nombre de diagnóstico; no fórmula |
| Handler y thunk FinalCalculo | Entrada `0x019b8390`; thunk `0x0054670b`, celda `0x005455cc` | Wrapper recuperado; llamada virtual `0x019b83d8`, slot `+0x7ac` |
| Literal Aceptar enlazado a push en código | Literal VA `0x0076eae0`, offset 3.599.072; push `0x019b85d7` | Nombre de diagnóstico; no reparto |
| Handler y thunk Aceptar | Entrada `0x019b8490`; thunk `0x00546718`, celda `0x005455d0` | Escribe word en instancia `+0x4a` y float32 en `+0x4c` después de conversión de texto |
| Metadata del formulario | Objeto índice `0x5e`, descriptor `0x0071f580`, ObjectInfo `0x00544e7c` | Une código y campos al formulario seleccionado |
| Nombres públicos de salida | `pbAceptar`: registro `0x018321bc`, offset `+0x4a`, acceso codificado `+0x728`; `pDespunte`: registro `0x01832504`, offset `+0x4c`, acceso codificado `+0x730` | Nombres y offsets; no prueban base, unidades ni persistencia |

La tabla de thunks y la secuencia de campos/métodos ofrecen un candidato
para `+0x7ac`: celda `0x00545618` → thunk `0x005467f5` → `cargaDetalle`
`0x019bc960`. Era una inferencia de aquella unidad, posteriormente validada
en [Layout estático del despacho](#layout-estático-del-despacho) bajo las
condiciones allí descritas; no es un llamador comercial ni una regla de cálculo.
Tres coincidencias de bytes del descriptor resultaron solapamientos de
instrucciones, no referencias de llamadas: sus capturas se conservan como
descartadas en la evidencia privada, sin presentarlas como callers.

El bloqueo monetario queda concretado: falta unir la salida de este formulario
con quien selecciona las filas comerciales y modifica el documento.
Siguen desconocidos base bruta/neta, intervención de cantidad y descuentos,
retirada del cargo anterior, doble cómputo GRUPO/componentes/detalles,
escala/política de redondeo y escritura/persistencia. Las observaciones G1–G5
mantienen su alcance de cantidad uno y descuentos cero; no se generalizan.
Una conversión float32 de interfaz no demuestra el redondeo comercial E1.

Reproducción privada: `output/clonersoft-implementacion-20261013/e1-estatico-20261014/`.
`node .../verificar-anclajes.mjs` verifica SHA-256 antes/después, ambos
literales, pushes, thunks/celdas, llamada virtual y escrituras de offsets,
con resultado en `anclajes-arquitecto.json`. No afirma haber comprobado fórmula.
`python .../repro-directed.py` reproduce dos wrappers, trece campos y veinte
procedimientos con la misma huella. Usa Capstone únicamente en el directorio
privado, sin dependencia de runtime para Aluminior.
El disassembly, metadata y herramientas auxiliares permanecen ignorados.
No se incorpora código, binarios o recursos propietarios a Git.

Revisión independiente descontaminada: anclajes, decodificación completa,
36 llamadas y registros de dos campos/dos controles comprobados contra los
bytes; sin hallazgo reproducible en ese alcance. El arquitecto volvió a
ejecutar la comprobación propia Node del revisor y su decodificación Python.
Una ronda, sin corrección funcional. Evidencia en
`output/clonersoft-implementacion-20261013/revision-e1-estatico-20261014.md`
y `e1-estatico-20261014/verificar-revision-e1.mjs`.
El visto bueno se limita a anclajes estáticos; no cierra el cargo económico.

El siguiente paso de aquella unidad quedó cubierto en el apartado siguiente:
layout estático del despacho, getters y consumidor nativo. La continuación
económica pasa por las llamadas externas de ese consumidor. No repetir
wrappers, inventarios o búsquedas de literales.

Ante este bloqueo se avanzó con el [selector independiente de registros de tarifa
dinámica](IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md): unidad pura
local de 47 pruebas, sin activar precios. Gate actual de paquetes: 2.004
correctas y una omisión previa por CSV privado; tipos y arquitectura correctos.
E1 sigue `in_progress`, sin implementación monetaria ni aceptación Productor.

## Despacho y consumidor nativo

Segunda unidad del 14/10/2026, desde `2a2dc57`; árbol inicial limpio.
Se mantiene el contrato de análisis local: validar el despacho y el consumidor
con pruebas de bytes/flujo y conservar las reglas económicas desconocidas.
Sin ejecutar Productor, cargar COM/CLR, modificar G6, datos, migraciones,
producción o cargo de Aluminior. Los nuevos scripts y capturas son privados.

### Layout estático del despacho

Se inspeccionó el runtime importado `C:/Windows/SysWOW64/msvbvm60.dll`, SHA-256
`898288bd3b21d0e7d5f406df2e0b69a5bbfa4f241baf29a2cdf8a3cf4d4619f2`.
El EXE conserva su SHA-256 anterior. No hay DLL homónima junto al EXE;
no se observó la carga de una ejecución ni se presupone su runtime histórico.

El inicializador nativo `0x6601af12` lee `ObjectInfo+0x62`, añade siete
entradas y copia `WORD(ObjectInfo+0x60)` punteros desde `ObjectInfo+0x68`.
La instancia construida usa `*(ObjectInfo+0x6c)+0x0c` como vtable.
Para este formulario: primera entrada `(0x1b7+7)×4 = 0x6f8`; 46 punteros
desde `0x00545564`. De ahí:

`(0x7ac−0x6f8)/4 = 45` → celda `0x00545618` → thunk `0x005467f5`
→ `cargaDetalle`, `0x019bc960`.

Es validación del layout bajo el constructor inspeccionado, sin depender
de interpretar el descriptor `0x0761`. Conserva la precondición de que el
contexto construido corresponde al ObjectInfo del formulario. Las lecturas
directas de contexto de la fábrica exigen, además del flag interno, global
`0x66114638` cero en dos gates. Las rutas alternativas llaman `0x660eba4e`;
su contexto no quedó resuelto. No se certifica una ruta viva ni todas las
ramas de creación de instancias.

Los getters quedan anclados por sus thunks y helpers reales:

| Campo | Slot / índice | Celda y thunk | Efecto estático |
|---|---|---|---|
| `pbAceptar` | `+0x728` / 12 | `0x00545594` → `0x00546624` | Lee dos bytes de instancia `+0x4a` mediante `GetMem2` |
| `pDespunte` | `+0x730` / 14 | `0x0054559c` → `0x00546642` | Lee cuatro bytes de instancia `+0x4c` mediante `GetMem4` |

Reproducción: `e1-despacho-20261014/verificar-despacho.py` dentro de
`output/clonersoft-implementacion-20261013/`; 46 anclajes, fuentes intactas.
Revisión independiente encontró una condición de fábrica omitida; una
corrección del manifiesto/verificador y gate ejecutado. El arquitecto también
reprodujo el verificador propio del revisor, 49 anclajes correctos.

### Consumidor con receptor demostrado

`alVDocumentoDespunte.DEScalcula`, cuerpo `0x01ad83e0–0x01ada390`
(fin exclusivo), se enlaza desde el objeto `0x0071fd30`, ObjectInfo
`0x00494d24`, celda `0x00494dcc` y thunk `0x00494e1c`.
La instancia del formulario se crea/recupera con `__vbaNew2` y su ObjectInfo
`0x00544e7c`, en global `0x02ef4c04`. El receptor de los getters procede
de esa celda, no de una coincidencia genérica de offsets en otro formulario.

| Paso | Dirección | Conducta acreditada |
|---|---|---|
| Leer aceptación | `0x01ad9e65`, slot `+0x728` | Recibe word; cero salta a salida `0x01ada2cf` |
| Comprobar resultado externo | `0x01ad9f2f`, slot `+0x1c`; gate `0x01ad9f68/6b` | La palabra recibida también debe ser distinta de cero para alcanzar las transferencias |
| Preparar porcentaje | `0x01ada024`, slot `+0x48` | Transfiere `DespuntePorc` con Variant tipo 2 y valor cero |
| Leer valor del formulario | `0x01ada0b2`, slot `+0x730` | Recibe cuatro bytes en local `ebp−0x100` |
| Transferir valor | `0x01ada0ec`, slot `+0x48` | Envía esos mismos cuatro bytes a `Despunte` mediante Variant tipo 4 |
| Continuar | `0x01ada165`, slot `+0x4c` | Llama a `alBDADO.edUpdate`; el reenvío posterior no acredita guardado durable |

El preámbulo llama a `eliminaDetalleDespunte` (`0x01ae06a0`), que afecta
al detalle físico, y a `DESsumaCosteArticulos` (`0x01adb8b0`), que suma
costes físicos. Ninguna de esas dos operaciones se presenta como retirada
del cargo anterior o elección de base comercial.

Reproducción: `e1-consumidor-20261014/repro-consumer.py`, misma raíz privada;
87 anclajes, decodificación completa de 2.688 instrucciones, huella conservada.
Revisión independiente sin hallazgo reproducible: 47 anclajes propios y las
dos secuencias Variant completas, reproducidos por el arquitecto. Los slots
propios `+0x40/+0x2c` quedan enlazados bajo el mismo constructor inspeccionado.
La conversión/transferencia de cuatro bytes no fija política de céntimos.
La aceptación del formulario por sí sola no acredita que se alcance la
mutación: quedan las condiciones y fallos de las llamadas externas.

### Declaraciones COM y frontera económica pendiente

La consulta de lectura al registro COM de 32 bits identifica tres clases
posteriores en `C:/Windows/SysWOW64/alBLLvdoc.dll`, SHA-256
`46f0a73c926a096673ba93fb720779d9221bf1a15b16800d53da7c828d18828c`.
Se trata de otra fuente identificada, sin mezclarla con las MDB/CSV o atribuir
el registro a una ejecución histórica. Se contrastaron las declaraciones de
la TypeLib propia con los GUID compilados, sin atribuir efectos económicos
por el nombre de una clase o método.

| Clase registrada | CLSID | Declaración pública acreditada |
|---|---|---|
| `alVDocumentoBD` | `ff1cddcd-ffb8-42c0-b2ca-a446c39013a5` | `bdDoc`, PropertyGet `+0x1c`; devuelve la interfaz importada de `alBDADO` |
| `alVDocumentosControl` | `3d49e10d-04ed-436e-b081-e99cbb693229` | `marcaDespunteCalculado`, `+0x24`; cuerpo pendiente |
| `alVDocumentoCalculaTotal` | `f9730a8c-029c-421a-adb0-57de1af1509f` | `RegistraCambios`/`RegistraCambiosObservaciones`, PropertyLet `+0x20/+0x28`; `calculaTotalDoc`, `+0x2c`; cuerpos pendientes |

La TypeLib `3492b023-2c15-4823-b7d2-27c0fff92e06` enlaza el retorno de
`bdDoc` con IID `3143e7cb-643e-4e77-b9a1-2cd2bb606d23`, importado de
`gaBBDD.dll`, TypeLib `4c8f78e2-2a97-4e1c-bcc3-6e9025144cfa`, versión `d.1`.
Esta segunda DLL conserva SHA-256
`dc1f4be67fc7b25f8464a686bf890ca7a1bdf15bf267928bbb35fd62169efb95`.
Su TypeLib propia y coclase acreditan `_alBDADO` y estos slots:

| Slot | Declaración |
|---|---|
| `+0x1c` | `bdCarga`, salida booleana; es la segunda condición del consumidor |
| `+0x40` | `edit`, salida booleana |
| `+0x48` | `edCampo`, PropertyLet; nombre de campo y Variant |
| `+0x4c` | `edUpdate`, salida booleana |

Se retiraron las asociaciones de nombres por índice de tabla nativa; la
revisión independiente detectó dos etiquetas falsas. Su verificador falló
antes de corregirlas (una aserción) y pasó después sin modificarlo. El gate
contrasta los nueve slots públicos entre ambos DLL y el enlace de importación.
Los artefactos iniciales se conservan retirados en la raíz privada.

La asociación por slot del constructor inspeccionado conduce a `edit`
`0x1107a440`, `edCampo` `0x1107a750` y `edUpdate` `0x1107ab50`.
Los límites por siguiente prólogo son candidatos; no se afirma cobertura
íntegra de cuerpos. Los reenvíos y sus condiciones se documentan con ese
alcance, sin convertir un retorno booleano en prueba de persistencia.

`edit` reenvía al receptor `this+0x88`, slot `+0x34`; `edCampo`, al slot
`+0x58`; `edUpdate`, al `+0x3c`. WORD `this+0x56` distingue la ruta primaria
de las rutas con receptor secundario `this+0x8c` y alias/selección de campo.
En retorno ordinario, `edit/edUpdate` copian el WORD bajo del último resultado
delegado; no lo combinan con el primero. Excepciones y efectos del tratamiento
HRESULT permanecen abiertos. `edit` pasa un DWORD reiniciado a cero por
referencia y salida; `edUpdate`, valores 0/2 y salida; `edCampo`, nombre BSTR
copiado y Variant preparado. No se atribuye sentido comercial a esos argumentos.

IID `4d004483-d57c-4f2c-89f8-ac20a38162a2` en `0x1100ff30` es argumento
de diagnóstico de `__vbaHresultCheckObj` en la rama HRESULT negativo;
no acredita QueryInterface ni identidad runtime del receptor.
Revisión independiente: 109 comprobaciones, 38 thunks y capturas contrastadas;
seis mutaciones solo en memoria detectadas, un fallo cada una. Una corrección
de alcance y reproducción del verificador propio del revisor. Gate del autor:
32 anclajes, fuentes intactas. Los límites de captura también coinciden con
la siguiente entrada/ret/NOPs/saltos directos, sin acreditar rutas indirectas.

Siguiente de aquella unidad, cubierto en «Receptores delegados»: población y tipos efectivos de los receptores `this+0x88/+0x8c`,
significado del WORD `this+0x56`, selector propio `+0x88` y cuerpos de los slots
delegados `+0x34/+0x58/+0x3c`. El IID diagnóstico es una pista. Después, cuerpos
de `marcaDespunteCalculado` y `calculaTotalDoc` desde sus slots públicos.

Reproducción privada: `e1-com-20261014/verificar-frontera.py`,
`inspeccionar-albdado.py`, `verificar-reenvio-albdado.py` y verificadores
independientes en `output/clonersoft-implementacion-20261013/`.

El consumidor solicitado ya está localizado. El cargo permanece bloqueado:
filas comerciales, base bruta/neta, cantidades/descuentos, retirada monetaria,
doble cómputo, redondeo y persistencia todavía requieren sus cuerpos de aplicación.
No implementar esas reglas desde el nombre del campo o de una clase.

Esta unidad entrega análisis y documentación local; no modifica el motor ni
activa cargos. El gate de 2.004 pruebas/tipos/arquitectura corresponde al código
de `2a2dc57`, anterior a este lote documental. Las nuevas comprobaciones son
estáticas y de hashes; no sustituyen aceptación Productor, publicación o recibo
entre equipos. G6, datos, migraciones y fuentes originales permanecen protegidos.

Revisión documental independiente: corrigió el único puntero activo agotado
de «Siguiente paso» en el estado. Gate del arquitecto tras la corrección:
117 Markdown encontrados en barrido real, siete documentos modificados,
233 enlaces locales y 11 anchors correctos, guard de continuación vigente y
`git diff --check` correctos. Estado, roadmap, relevo, guía Windows,
procedimiento e índice existentes quedan actualizados; no se retiró evidencia
histórica ni se creó otra lista. Arquitectura repetida: 859 archivos,
414 módulos, cero infracciones.

## Receptores delegados

Unidad local del 14/10/2026 desde `a078975d518b72c9e4ed07c6f25df5319c0ff7ec`,
rama `codex/integracion-windows-mac-20261013`, árbol inicial limpio.

- **Resultado exacto:** acreditar población/tipos estáticos de `this+0x88/+0x8c`,
  significado del WORD `this+0x56`, selector propio `+0x88` y cuerpos delegados.
- **Éxito medible:** cadena creación/metadata/TypeLib/slot/celda/thunk/cuerpo,
  verificadores contra bytes y hashes, sensibilidad medida y revisión independiente.
- **Alcance:** lectura y parsing dirigidos de la misma `gaBBDD.dll`; auxiliares
  privados y síntesis propia. Sin inventario general ni repetir unidades cerradas.
- **Protegidos:** WIP, fuentes, G6, datos reales, paquetes, migraciones y producción.
  No ejecutar Productor, DLL/COM o SQL, activar cargo ni publicar/desplegar.

### Creación y tipo

`__vbaNew` recibe ObjectInfo `0x1100d184`; el descriptor `0x1100e2e8`
identifica `alRecordset`. La metadata propia y la TypeLib enlazan coclase
`50400019-03fe-4eda-ad1e-8823558eef2c` e interfaz `_alRecordset`.
La población primaria aparece en `bdCarga`; la secundaria en el cuerpo privado
del slot `+0x98`. El censo dirigido de los 38 métodos copiados de `alBDADO`
también conserva las creaciones de `edAddNew`, limpiezas y aritmética de punteros.
Es un censo de esta clase, no una prueba de alias en todo el programa.

El IID `4d004483-d57c-4f2c-89f8-ac20a38162a2` sigue siendo diagnóstico cuando
se pasa a `__vbaHresultCheckObj`. La identificación anterior procede de la
creación y de los metadatos propios; no atribuye una identidad observada viva.

| Slot delegado de `_alRecordset` | Declaración propia | Celda → thunk → cuerpo |
|---|---|---|
| `+0x34` | `rsEdit` | `0x1100d244` → `0x1100d359` → `0x1102a500` |
| `+0x58` | `rsCampo`, PropertyLet | `0x1100d268` → `0x1100d3ce` → `0x1102c7e0` |
| `+0x3c` | `rsUpdate` | `0x1100d24c` → `0x1100d373` → `0x1102af90` |

Las ventanas candidatas terminan respectivamente en `0x1102aad0`,
`0x1102ca80` y `0x1102bb40`, fin exclusivo. Decodificación y ramas directas
delimitan el alcance; no se certifican rutas indirectas o persistencia durable.

### Tabla auxiliar y selector

`configTablaAuxiliar`, slot público `+0x68`, enlaza celda `0x1100cbc0`
→ thunk `0x1100cd45` → cuerpo `0x1107b4d0`. Recibe tabla auxiliar y dos campos
de código; copia la configuración a `+0x44/+0x4c/+0x50` y escribe WORD
`+0x56=0xffff` en `0x1107b54a`. `Class_Initialize`, cuerpo `0x1107d5a0`,
escribe cero en `0x1107d65d`. El WORD controla la ruta de tabla auxiliar;
no es un importe, porcentaje o marca comercial de despunte.

El selector propio `+0x88` es `rsTabla(campo)`: celda `0x1100cbe0`
→ thunk `0x1100cdc7` → cuerpo `0x1107c6c0`. La TypeLib declara retorno
`_alRecordset`. Con WORD cero devuelve el receptor primario `+0x88`.
Con WORD distinto de cero consulta la lista de campos de la tabla auxiliar:
`gaLst.xcfg_IDX_Indice(0)` y `gaLstIndice.dimeIdxClave(campo, siete BSTR vacíos)`.
Resultado convertido a I2 igual a `-1`: primario; otro resultado: secundario
`+0x8c`. El offset de campo `+0x88` y el slot del selector `+0x88` son conceptos
distintos. La preparación del índice usa campos SQL de la tabla auxiliar;
las excepciones y la política interna de comparación conservan su límite.

Evidencia privada nueva en `output/clonersoft-implementacion-20261013/`:
`e1-receptores-20261014/` y `e1-selector-20261014/`. Reproducción:
`python .../verificar-receptores.py` y `python .../verify-selector.py`.
La fuente conserva SHA-256 `dc1f4be67fc7b25f8464a686bf890ca7a1bdf15bf267928bbb35fd62169efb95`.
No se lleva disassembly, código propietario, SQL o binarios a Git.

Gate del arquitecto: receptores 223/223, siete mutaciones en memoria con
fallos reales `1,1,1,1,1,1,2`; selector 85/85, seis mutaciones con un fallo
cada una. Cinco creaciones explícitas y siete limpiezas de receptores.
La medición inicial de sensibilidad que podía clasificar un falso positivo
fue retirada y corregida antes de la revisión; su nota privada se conserva.
Barrido documental final: 117 Markdown encontrados, siete modificados, 235 enlaces
locales y 13 anchors; puntero vigente y diff correctos. Arquitectura:
859 archivos, 414 módulos, cero infracciones. Paquetes sin cambios;
el gate anterior de 2.004 pruebas no se presenta como ejecutado en esta unidad.

Revisión independiente: 137/137 comprobaciones propias, siete mutaciones
distintas con un fallo cada una; continuidad de creación/argumentos y censo
de cuerpos contrastados. Sin defecto funcional reproducido en este alcance.
La guarda documental propia detectó dos instrucciones históricas agotadas;
una corrección las marca como superadas y enlaza el tramo vigente.
Reproducción privada en `e1-revision-delegados-20261014/`.

Siguiente de U1, seguido en «Control, reparto y totales»: cuerpos de `marcaDespunteCalculado` y `calculaTotalDoc`
en `alBLLvdoc.dll`; demostrar sus filas/base/cantidades/descuentos,
sustitución del cargo anterior, doble cómputo, redondeo y escritura.
No repetir receptores, WORD, selector o enlaces delegados aquí acreditados.
E1 permanece `in_progress`; esta unidad no implementa dinero ni acredita
aceptación Productor, publicación o recepción entre equipos.

## Control, reparto y totales

Segunda unidad de esta continuación del 14/10/2026, después del commit local
`bc7c6ea`. No activa el cargo económico ni modifica paquetes.

- **Resultado exacto:** seguir los cuerpos de control/totales y sus llamadas de
  gastos hasta acreditar reglas monetarias o dejar una frontera concreta sin prueba.
- **Destinatario y motivo:** futura adaptación del presupuesto; evitar confundir
  un total ya valorado, un coste físico y el reparto comercial de un cargo.
- **Éxito medible:** cada pregunta monetaria enlazada con bytes, metadata, condiciones,
  llamadas y escritura; verificadores ejecutados y revisión independiente.
- **Alcance:** análisis estático dirigido y documentación propia, reutilizando
  el corpus privado; sin inventarios, wrappers, getters o ensayos cerrados.
- **Fuera de alcance y protegidos:** cargos activos, G6, datos reales, WIP, fuentes,
  migraciones, producción y despliegue. Sin Productor, DLL/COM o SQL en ejecución.
- **Comprobaciones obligatorias:** hash antes/después, decodificación, argumentos,
  guardas de documentación y sensibilidad medida; separar ejecución observada.
- **Acciones con autorización propia:** observación del original, G6, escritura
  de negocio, publicación o despliegue; ninguna realizada en esta unidad.

Fuente inicial: `alBLLvdoc.dll`, SHA-256
`46f0a73c926a096673ba93fb720779d9221bf1a15b16800d53da7c828d18828c`.
Los enlaces usan las declaraciones propias y el layout condicionado ya
inspeccionado; ninguna identidad runtime se deduce del IID de diagnóstico HRESULT.

### Marca y secuencia de total

| Entrada | Slot | Celda → thunk → cuerpo |
|---|---|---|
| `alVDocumentosControl.marcaDespunteCalculado` | `+0x24` | `0x1102470c` → `0x11024778` → `0x113ab760` |
| `alVDocumentoCalculaTotal.calculaTotalDoc` | `+0x2c` | `0x11026578` → `0x110265e4` → `0x11125b70` |

El primer cuerpo llama al helper propio `+0x30` y exige su WORD distinto de
cero (`0x113ab800/804`). Construye una actualización de
`VDocumentosControl.DespunteCalculadoSN/DespunteCalculadoFecha`, delimitada
por tipo y número de documento, y la envía al receptor externo `+0x44`
en `0x113ab951`. Esto identifica la intención de escritura y su llamada;
no demuestra guardado durable, transacción ni una regla de reparto.

`calculaTotalDoc` carga la cabecera y toma la ruta de edición solo si la carga
devuelve WORD no cero. Conserva `BaseImponible/ImporteTotal` anteriores;
solo la rama `VPRES` llama a parámetros/gastos/resultado y al cálculo externo
de documento. Después prepara parámetros de total mediante helper propio
`+0x38`, ejecuta `alVDocumentoTotal.calculaTotalDoc` y
`traspasaTotal_alBD`, y llama a `edUpdate` en `0x11125fdb`.
La marca `RegistraCambios` controla un tramo posterior de registro; su
booleano o el de `edUpdate` no certifican una transacción durable.

### Bordes comerciales seguidos

`alVDocumentoGastos.calculaGastos`, slot `+0x2c`, cuerpo `0x11150300`,
elige `Subtotal` para `VPRES` e `ImporteTotal` para otros documentos en
`0x11150e45–0x11150e5e`. La agregación de gastos restringe las filas del
documento a `nEstr=0`, `nGrupo=0` y metraje distinto de cero; el total general
en `alVDocumentoTotal.calculaTotalDoc` suma `ImporteTotal` de filas con ambos
identificadores cero y no añade aquella condición de metraje.
Estas selecciones tienen fines distintos: no sustituir una por la otra.

`traspasaTotal_alBD`, slot `+0x24`, cuerpo `0x1115f5d0`, transfiere campos
agregados como `Bruto`, `Subtotal`, descuentos, base imponible e importe total
mediante `edCampo`. No volver a multiplicar esos agregados por una cantidad
inferida ni interpretar su transferencia como prueba de la base de reparto.

Reproducción privada de control y sus bordes en
`output/clonersoft-implementacion-20261013/e1-control-total-20261014/`.
`verificar-control-total.py` comprueba 50 anclajes y 16 literales, ocho capturas
con 13.371 instrucciones y ocho mutaciones en memoria con un fallo cada una.
Las ventanas son candidatas delimitadas por la entrada siguiente; las rutas
indirectas y efectos externos conservan su alcance acotado.

### Ruta E1 y fronteras de aceptación

La transferencia E1 ya acreditada deja `DespuntePorc=0`. En esta ruta,
`calculaGastos` consulta `DocDespuntePorc` y, cuando es cero, transfiere
`DocDespunte` a `TotalDesp` sin reconstruir una fórmula física. La rama
porcentual distinta no se atribuye a este recorrido ni se habilita.

El reparto `VPRES` está en helper propio `+0x3c`, cuerpo `0x11153860`.
Su consulta excluye contenedores internos y filtra `GastosIndSN` verdadero;
`BoolSQL` recibe Boolean `-1` y emite `TRUE` o `1` según la rama de dialecto.
No se deduce el valor del nombre de la bandera. Lee el gasto
indirecto anterior y el subtotal. La reconstrucción de importe usa subtotal
más gasto nuevo y termina escribiendo `GastosIndirectos`; la lectura del
gasto anterior permite entrar en recálculo aunque el nuevo ratio sea cero.
El denominador se prepara en helper `+0x40`, cuerpo `0x111556a0`, con
exclusiones propias y descuentos documentales calculados por separado.
La interpretación comercial completa exige conservar esos pasos previos.

`GastosIndAplicarDescuentoLineaSN` controla la aplicación sucesiva del
primer y del segundo descuento de línea al nuevo gasto. La configuración
`Despunte_AplicaCliDtoSN` conserva su rama propia; no fijar ningún descuento
a cero a partir de los ensayos históricos de cantidad uno.

La línea propia de gastos, `alVDocumentoGastosInsLin.actualizaGI`, tiene
cantidad y metraje uno; no se generaliza esa cantidad al resto de líneas.
La marca de línea oculta se selecciona mediante `rtcImmediateIf`, ordinal
681 del runtime ya inspeccionado. Su ABI y selección se siguen estáticamente;
las operaciones Automation y los errores mantienen su límite ordinario.
La exclusión por identificador debe conciliarse con el modo de repercusión,
sin declarar doble cómputo imposible desde el nombre de una bandera.

El formato numérico usa `D` como `Justificado`. Las escalas proceden de
`REDlinea`, `REDbase` y `REDtotal`. Una conversión float32 o una cadena
alineada no fija el número de decimales, la política de empate o un algoritmo
de reparto de residuos. La aceptación integral continúa separada de estos
enlaces estáticos y del guardado que sugieren las llamadas.

### Dependencias de formato y configuración

Lecturas dirigidas adicionales, con SHA-256 antes/después:

- `gaCodigoBase.dll`:
  `2a030e756ac804631e56324065561b4b8e4ac422e3c28406a59d4eb9190f2e8c`.
- `alAppFramework.dll`:
  `5fb225caa5cca384b05cbad0c259bd0c2a952a4e821bd8d2cf2e298be3e12adf`.
- `msvbvm60.dll`: misma fuente
  `898288bd3b21d0e7d5f406df2e0b69a5bbfa4f241baf29a2cdf8a3cf4d4619f2`.

La factory de `gaVarios`, la coclase/interfaz propias y la importación
`gaCodigoBase.dll` de la TypeLib de `alBLLvdoc` coinciden en GUID y versión
codificada `0x3`. La factory de `alAppF_ManagerGlobal` coincide con la
coclase/interfaz de `alAppFramework`; para este uso interno no hay importación
pública de esa biblioteca que fije una versión requerida. El registro de
32 bits se consultó solo para localizar el servidor, no como prueba de carga
histórica. No se mezclan MDB, CSV ni el helper managed anterior.

`alAppF_ManagerGlobal.alAppF` declara retorno `_alAppFrameworkManager`,
cuya propiedad `ConfigRed` declara `_alConfigRedondeo`. Las propiedades
`REDlinea/REDbase/REDtotal` leen WORD de instancia `+0x36/+0x38/+0x3c`;
el cargador pide `RedondeoLinea/Base/Total` a su proveedor de configuración.
La cadena `2` enviada al proveedor no demuestra una escala efectiva de dos
ni un fallback: falta acreditar el significado de ese parámetro y el valor
configurado. La interfaz de compatibilidad y todas las rutas de creación del
manager conservan su límite; no se atribuye una instancia observada viva.

En la ruta de base, el valor recibido de `REDbase` pasa al argumento `dec`
de `gaVarios.formatoNum`; después `ValorDbl` convierte su resultado y se
escribe el agregado. `formatoNum`, cuerpo `0x1100bca0`, delega en el export
650 `rtcBstrFromFormatVar`; `ValorDbl`, cuerpo `0x1100b2d0`, utiliza
`__vbaR8ErrVar` para la conversión posterior. Las máscaras, variantes y
opciones de separadores forman parte de este recorrido; no sustituirlo por
un redondeo matemático genérico ni eliminar los pasos intermedios.

El export 650 también quedó seguido: entrada `0x6601dde0`, CFG de 91
instrucciones, retorno `ret 0x10`. Su destino se puebla mediante
`GetModuleHandleA("oleaut32.dll")` y `GetProcAddress("VarFormat")`, celda
`0x66114650`, llamada `0x6601de63`. Envía Variant, máscara, dos enteros
`1/1`, flags `0/8` según estado global/TLS y salida BSTR. El retorno ordinario
es BSTR; el HRESULT negativo entra en tratamiento de error.
La ruta Double del caller prepara `BYREF_R8 0x4005`, llama al formatter y
formatea después el BSTR, antes de reconvertirlo. No repetir el cuerpo 650:
la frontera matemática restante es `OLEAUT32.VarFormat` con esos argumentos,
flags y estado de localización, además de los valores configurados efectivos.

### Contraste de las ocho preguntas

Reevaluación acotada del **18/10/2026** contra código, pruebas y evidencia ya
conservada. Esta matriz sustituye su versión estática del 14/10. Fuentes:
[control, reparto y totales](#control-reparto-y-totales), [formato](#contrato-de-formato-varformat),
[fallback de configuración](#proveedor-de-configuración-y-argumento-2) y
[A–F/G1–G5, manual y límites](EVIDENCIA-E1-DESPUNTE-2026-10-04.md).
No se ha ejecutado nuevamente Productor ni leído datos comerciales.

Rutas de código/pruebas de la matriz, relativas a la raíz:

- **Físico:** `packages/core/src/produccion/despunte-catalogo/preparar.ts`
  y `preparar.test.ts`; `condicional.ts` y `condicional.test.ts`.
- **Técnico:** `packages/core/src/produccion/despunte.ts`, `despunte.test.ts`
  y `despunte-barra-comprada.test.ts`.
- **Adaptador puro web:** `packages/web/app/dashboard/produccion/_lib/preparar-produccion.ts`,
  `preparar-produccion.test.ts` y `despunte-costes-equivalentes.test.tsx`; vista existente
  `../_components/despunte.tsx`.

| Pregunta / necesidad | Acreditado y límite de evidencia | Implementado y prueba | Falta / caso discriminante mínimo | Decisión, responsable y cierre |
|---|---|---|---|---|
| Filas comerciales: seleccionar quién recibe cargo | Estática: contenedores cero, metraje no cero y `GastosIndSN`; exclusiones por modo. A–F/G1–G5 distinguen GRUPO, componentes y GID; no certifican todas las filas | Físico agrupa artículo/acabado/tonalidad y conserva origen (`preparar.test.ts`). Web selecciona piezas verificadas para corte, no receptores comerciales E1 | Documento sintético con GRUPO, componente, GID y fila excluida: registrar receptores y agregados efectivos. La salida comercial no está fijada | Bloquea cargo, no corte técnico. Codex prepara contrato; QA autorizada cierra con filas efectivas y exclusiones observadas |
| Base bruta/neta: reconstruir peso sin cargo anterior | `VPRES` parte de subtotal con exclusiones y descuentos documentales. G4 acredita reparto por bases sin cargo anterior frente a reparto igual/precio cargado, solo con descuentos cero | Técnico recibe `LineaDespunte.base` explícita; test «reparte en proporción a la base de cada línea» verifica pesos sintéticos, no reconstrucción comercial | Dos líneas de bases distintas con un descuento no cero y configuración conocida. Registrar subtotal, descuentos y cargo anterior; no hay importe E1 completo esperado aún | Bloquea cargo. Codex/QA autorizada cierran al poder reproducir numerador y denominador sin incógnitas |
| Cantidades: aplicar cada factor una vez | Físico: metraje × principal y cortes × principal × detalle. Estática comercial divide precio por metraje; A–F/G1–G5 tienen cantidad uno | Físico: 2,4 m × 3 = 7,2 m y seis cortes (`preparar.test.ts`). Web J04 cantidad dos: siete barras, 42 m comprados, 29,28 m físicos (`preparar-produccion.test.ts`) | Comercial cantidad uno/dos con mismo detalle, descuentos y configuración. Falta formación de agregados comerciales; no inferirla de cortes | Físico aplicable ahora, comercial bloqueante. Codex mantiene pruebas; QA autorizada cierra la cantidad comercial |
| Descuentos: orden y base de cada uno | Dos descuentos sucesivos bajo bandera; descuento de cliente de despunte separado y `DtoPPsNeto`. Los ensayos observados no discriminan esas ramas | Técnico no aplica descuentos E1; el reparto sintético no demuestra descuentos comerciales | Una línea con descuentos distintos de cero; variar una bandera cada vez conservando entradas y escalas. Falta salida esperada comercial hasta fijar configuración | Bloquea cargo. Codex/QA autorizada cierran orden, bases y extremos sin extrapolar el caso cero |
| Sustitución: recalcular sin acumular | D/E y G4/G5 acreditan reemplazo, repetición y reapertura en casos observados. Estática contempla nuevo ratio cero cuando había cargo | Funciones puras recalculan sin mutar (`preparar.test.ts` y `despunte-costes-equivalentes.test.tsx`). No hay adaptador monetario ni actualización de presupuesto E1 | Cargo previo → nuevo cargo cero, repetir, guardar y reabrir; falta observación de esa variante y contrato de error | Bloquea escritura económica. Codex/QA cierran con persistencia aislada autorizada y cargo retirado, sin duplicados |
| Doble cómputo: excluir niveles y GI previo | Estática: resta GI en INS/CST; REP oculta con `nEstr=-1`, exclusión parcial. No acredita todos los modos/errores | Técnico usa piezas verificadas, no suma importes de GRUPO/GID; prueba J04 distingue siete barras y consumos. No existe receptor comercial | Documento sintético con GI previo, GRUPO y detalle: comprobar cada modo habilitado y su conjunto de filas. Resultado completo pendiente | Bloquea cargo, no producción técnica. Codex/QA cierran exclusión integral del adaptador comercial |
| Redondeo: escalas y empates efectivos | Máscaras/Variant/formato y fallback BSTR `2` acreditados. No se conocen valores efectivos RED ni locale. Tres políticas coinciden en G4; G6 es incidencia, no resultado | Técnico usa céntimos y mayor resto, con pruebas sintéticas; no demuestra política Productor. Comparación de costes iguales no redondea (`despunte-costes-equivalentes.test.tsx`) | Registrar cuatro RED y locale efectivos; elegir antes del cálculo entradas con predicciones divergentes. Sin ello no fijar salida E1 ni usar `2` como escala observada | Bloquea cargo. Codex fija predicciones; QA autorizada cierra con un caso que separe políticas |
| Escritura: aplicación coherente y durable | Setters/update estáticos; F y G5 acreditan reapertura de esos casos. No se acredita atomicidad ni rollback de todos los errores | Adaptador web puro y vista «Sin cargo al presupuesto». Prueba de repetición/inmutabilidad no acredita persistencia | Tras autorización y aislamiento real de BD: aplicar, repetir, guardar, reabrir e inducir fallo; comprobar ausencia de escritura parcial. Sin ese entorno no ejecutar | Bloquea aplicación económica. Codex propone aislamiento y QA; Sergio autoriza alcance y aceptación real |

**Salida de esta evaluación:** corregir únicamente la igualdad decimal de los
costes del despunte técnico en producción. `Set<string|null>` confundía `4`
con `4.0000` como costes distintos para el mismo artículo/acabado. El contrato
decimal existente (`compararDecimal`, también usado por `verificar-despiece.ts`)
permite corregirlo sin escoger proveedor, descuento, precio o cargo nuevos.
Los costes realmente distintos y los ausentes siguen sin valorarse; cero
explícito sigue siendo un coste válido. La prueba compara el resultado y la
vista del caso mixto contra la fixture uniforme, sin tocar datos persistidos.

No conectar aún el contrato físico de catálogo al snapshot: faltan tonalidad,
largo de artículo y metraje valorado separado. Un valor por defecto no suple
esos datos. E1 económico sigue `in_progress`. Frente independiente que puede
avanzar: P.6/P.7, matriz de teclado/overflow de producción con fixtures
sintéticas a 1280/768/375/320, zoom 200% y reduced motion; su aceptación
comparativa permanece separada. E2 conserva su lugar como siguiente frente
económico y necesita el caso positivo de unión material, sin extrapolar U.

Verificación ejecutada del cambio local, 18/10: nueve casos nuevos; antes del
arreglo fallaban cinco y pasaban cuatro, después pasan nueve. El director
reprodujo esos cinco fallos cargando la versión anterior solo en memoria,
sin revertir el árbol. Gate del director:
40/40 pruebas puras de producción (cinco archivos), 964/964 de core,
`npm run typecheck` correcto en los cuatro paquetes y
`npm run check:architecture`: 861 archivos, 413 módulos, cero infracciones.
Enlaces de los ocho documentos modificados: 359 destinos y 116 anchors sin
errores. El primer typecheck detectó un `push` sobre un array readonly en la
fixture nueva; se corrigió construyendo otro array, sin supresiones.

Las pruebas web se ejecutaron con configuración pura en
`output/e1-aplicacion-20261018/vitest.puro.config.mts`: incluye los tests de
producción y excluye integración. No carga `pruebas/migrar.ts`, cuyo setup
ejecuta SQL. No se ha ejecutado el gate de integración/BD, por estar fuera del
alcance autorizado. Logs rojo/verde, gates y preservación en esa misma carpeta
privada; no viajan por Git. No cambia la interfaz: la prueba renderiza el
bloque React existente con los importes calculados, sin certificar navegador,
persistencia, aceptación Productor ni uso real.
Preservación antes/después: catorce árboles, 2.861 archivos y siete binarios
externos comprobados por tamaño/SHA-256, sin diferencias. PE/PDB, índices y
vendor dentro de esos árboles permanecen intactos; originales y evidencia
A–F/G1–G5/G6 no se han operado ni modificado.
Revisión independiente, una ronda sin hallazgos bloqueantes: reprodujo 40/40,
tipos y arquitectura; inspeccionó matriz, diff y salidas de core/control causal/
preservación. No reprodujo esos tres últimos gates ni observó navegador o BD.
Ejecutores congelados antes del commit local; no publicación ni sincronización.

Los párrafos y gates que siguen conservan **la evidencia histórica del 14/10**;
no son instrucciones para retomar Windows ni verificaciones de esta corrección.

La secuencia ordinaria de total parte de la suma de importes de líneas,
resta la deducción anterior, calcula descuento y pronto pago, y obtiene base
imponible. `DtoPPsNeto` decide si el pronto pago parte del subtotal o del
subtotal menos el primer descuento. Subtotal, descuento, descuento de pronto
pago y base imponible atraviesan formato y conversión antes de su escritura.
Bruto recibe directamente los ocho bytes del agregado `TSubtotal` recibido;
la transferencia a su campo, condicionada a `VFAC`, conserva esos bytes como
Variant Double sin formato intermedio. Las ramas de impuestos/retenciones
conservan su alcance parcial.

Los helpers previos de gastos `+0x4c/+0x50` precargan
`MargenGastosIndDesp/DtoGastosIndDesp`. No representan una retirada monetaria
por sí solos ni fijan porcentajes observados. En `actualizaGI`, la marca oculta
no anula la venta: la rama de solo coste y el bloqueo de precio son condiciones
distintas. Conservar esa distinción antes de adaptar el motor.

Gate del arquitecto de gastos: 251/251, nueve capturas verificadas y diez
mutaciones en memoria con un fallo cada una. Reproducción privada:
`e1-gastos-reparto-20261014/verificar-gastos.py`.

Gate del arquitecto de totales y dependencias ampliadas: 247/247,
10.437 instrucciones contrastadas y doce mutaciones con un fallo cada una.
El gate inicial 166 queda como antecedente privado, no como resultado final.
Reproducción: `e1-totales-20261014/verify-totals.py`; fuentes intactas.

**Bloqueo y siguiente abierto al 14/10, histórico:** demostrar contrato de
`OLEAUT32.VarFormat` para las máscaras/Variant/flags/localización acreditados;
resolver proveedor de configuración y valores efectivos `REDprecio/REDlinea/
REDbase/REDtotal`, sin convertir el literal `2` en una escala observada;
acreditar entrada de agregados comerciales y cantidades incorporadas.
Compatibilidad/creación efectiva del manager, todos los errores y persistencia
durable siguen fuera de la evidencia estática. Las observaciones originales
requieren autorización propia; G6 no se modifica.
El cargo permanece desactivado y E1 `in_progress`. Implementación local de
evidencia, aceptación Productor y publicación son etapas distintas.

Revisión independiente U2: 250/250 comprobaciones propias, 41 capturas y
24.846 instrucciones contrastadas, nueve mutaciones con un fallo cada una;
cinco fuentes originales intactas. Reprodujo los gates de autores sin alterar
sus 142 archivos. Único hallazgo: una frase atribuía formato a todos los
agregados; se corrigió distinguiendo el bruto transferido directamente de
subtotal, descuentos y base. Una revisión, una corrección y gate final,
reproducido por el arquitecto. Informe/logs privados en
`e1-revision-control-total-20261014/`.

Cierre documental local: 117 Markdown encontrados, siete modificados,
235 enlaces locales y 13 anchors válidos; puntero vigente y diff correctos.
Arquitectura: 859 archivos, 414 módulos y cero infracciones. Paquetes, scripts
del producto, fuentes de datos y migraciones sin cambios. No se repiten suites
que ejecutan SQL ni se atribuye el gate anterior de 2.004 pruebas a esta unidad.
Estado, roadmap, relevo, guía, procedimiento e índice existentes actualizados;
se preservan historia, evidencia privada y discrepancias. Sin push, despliegue,
sync de July o recepción entre equipos acreditada.

## Contrato de formato VarFormat

Unidad local del **17/10/2026**, desde `2599ee3`, en el worktree
`rea-productor-20261016/Aluminior`. Amplía únicamente la frontera de formato;
no cambia paquetes ni implementa el cargo económico. Reutiliza los cuerpos de
totales/export 650 ya acreditados, sin volver a extraerlos.

- **Resultado exacto:** máscaras y tipos que llegan al formato, sus argumentos,
  postproceso y conversión; contrato público separado de comportamiento observado.
- **Destinatario y motivo:** Sergio y el siguiente desarrollador, para evitar
  sustituir la secuencia real por un redondeo supuesto.
- **Éxito medible:** anclajes contra bytes, hashes antes/después, reproducción de
  construcción de máscaras, sensibilidad y revisión independiente.
- **Alcance autorizado:** lectura estática dirigida y referencias oficiales;
  resultados privados nuevos y síntesis propia en este worktree.
- **Fuera de alcance:** proveedor/configuración efectiva, agregados, persistencia
  y producto. El contrato matemático exacto sigue abierto donde faltan pruebas.
- **Protegidos:** checkout original, fuentes y evidencias anteriores, G6, WIP,
  datos reales, credenciales, paquetes, migraciones y producción.
- **Comprobaciones obligatorias:** Git/ancestro, disponibilidad, hashes, argumentos,
  máscaras, cadena de conversión y guardas documentales con barrido real.
- **Acciones con autorización propia:** ejecutar Productor, DLL/COM o Automation,
  abrir bases de negocio, operar G6, activar cargos, migrar, publicar o desplegar.
  Ninguna forma parte de esta unidad.

### Máscaras y tipos acreditados

La ruta comercial seleccionada pasa `Entera=11`, `SepMiles=-1` y la escala
configurada como `dec` a `gaVarios.formatoNum`; no se presupone que valga dos.
El orden de concatenación queda seguido hasta `__vbaStrCat/VarBstrCat`, y la
repetición de caracteres hasta los helpers correspondientes del runtime.
El wrapper invierte los argumentos antes de delegar; se conserva el orden de
concatenación izquierda/derecha del [contrato público VarBstrCat](https://learn.microsoft.com/en-us/windows/win32/api/oleauto/nf-oleauto-varbstrcat).

| Paso | Contrato estático seleccionado | Límite |
|---|---|---|
| Primera máscara, `dec <= 0` | `###,###,##0` | Construcción de máscara, sin resultado numérico ejecutado |
| Primera máscara, `dec > 0` | La anterior, punto y `dec` caracteres `0`; con `dec=2`, `###,###,##0.00` | El punto es parte de la máscara; no fija el separador regional de salida |
| Entrada numérica | Variant `BYREF_R8`, `0x4005` | Es Double por referencia; no aritmética decimal exacta ni Currency |
| Segunda máscara | `@` repetida 11 veces si `dec <= 0`, o `12+dec` veces si `dec > 0` | Longitud de la máscara, no prueba de longitud/truncamiento de la salida |
| Entrada de la segunda llamada | Variant BSTR, tipo `8`, con el resultado anterior | No es una segunda entrada Double |
| Justificación `D` | Helper propio `just`, con ancho `Entera+dec+1`; para ancho no mayor que 255 llega a otra llamada 650 con `@` repetida y entrada `BYREF_BSTR`, `0x4008` | Tercera llamada, condicionada; no atribuirle salida observada |
| Continuación | Postproceso del formatter y `ValorDbl/__vbaR8ErrVar`, antes de las escrituras de total ya seguidas | No omitir los pasos intermedios ni atribuirles invariancia monetaria sin prueba |

`just`, ventana candidata `0x1100c780–0x1100cca0`, compara la longitud con
el ancho y, si lo excede, llama al helper de substring con inicio uno y longitud
igual al ancho, antes de la tercera llamada de formato. Esto acredita una ruta
de recorte; no una garantía de importe invariable ni un defecto observado con
datos concretos. El ancho de `just` no coincide siempre con el de la segunda
máscara: con `dec=0` se calcula 12 frente a 11. Las sustituciones personalizadas
de separadores se omiten cuando sus argumentos son vacíos en el caller elegido;
los recortes y la justificación permanecen en la secuencia.

Los casos de construcción usan `dec=-1,0,1,2,4,8`. Son entradas sintéticas del
verificador de instrucciones; no son valores configurados observados ni ensayos
de importes en Productor. Tampoco fijan una escala máxima aceptada.

### Contrato público y límites de localización

La llamada ya seguida a `VarFormat` conserva Variant, máscara, enteros `1/1`,
flags `0/8` y salida BSTR. El contrato Win32 no recibe LCID explícito y utiliza
la configuración regional predeterminada del usuario para tokenizar y formatear.
Su tabla documenta `iFirstDay=1` como lunes e `iFirstWeek=1` como semana que
contiene el 1 de enero. Esto describe la API consultada, sin observar una sesión
Productor. [Microsoft: VarFormat](https://learn.microsoft.com/en-us/windows/win32/api/oleauto/nf-oleauto-varformat).

El encabezado público de Microsoft identifica `0x8` como `VAR_CALENDAR_HIJRI`;
`VAR_FORMAT_NOSUBSTITUTE` es `0x20`. Por tanto, el `8` acreditado no declara
una política de empates ni supresión de sustitución. No se ha probado qué rama
global/TLS tomó una ejecución concreta. [Microsoft: OleAuto.h](https://github.com/microsoft/win32metadata/blob/main/generation/WinSDK/RecompiledIdlHeaders/um/OleAuto.h).

La tokenización distingue la interpretación de la máscara de la localización
de salida. No convertir la ubicación de este equipo, la interfaz en español o
el carácter punto de la máscara en un LCID observado.
[Microsoft: VarTokenizeFormatString](https://learn.microsoft.com/en-us/windows/win32/api/oleauto/nf-oleauto-vartokenizeformatstring),
[VarFormatFromTokens](https://learn.microsoft.com/en-us/windows/win32/api/oleauto/nf-oleauto-varformatfromtokens).

Como referencia de lenguaje, Microsoft documenta `@` como posición de carácter
o espacio y rellenado desde la derecha sin `!`. Esto ayuda a interpretar la
segunda máscara, pero la documentación VBA no prueba la salida de la versión
VB6/OleAut32 inspeccionada ni permite trasladar sus constantes de calendario.
[Microsoft: Format de VBA](https://learn.microsoft.com/en-us/office/vba/language/reference/user-interface-help/format-function-visual-basic-for-applications).

**Estado de aceptación:** extraídos y especificados los argumentos/máscaras;
verificada estáticamente su construcción. No se implementa comportamiento nuevo
en Aluminior. Siguen sin acreditar empates, valores cercanos a frontera binaria,
localización efectiva, errores y conversión regional completa con una versión
identificada de Automation. No adoptar `Math.round`, redondeo bancario, mayor
resto o céntimos por defecto desde esta unidad.

### Evidencia y continuidad

Evidencia privada nueva en `output/e1-varformat-20261017/`: `preflight/`,
`static/`, `official/`, `official-vba/` y `official-concat/`. Las seis referencias públicas quedan
congeladas con URL, fecha, tamaño y SHA-256; el encabezado descargado se identifica
por su hash, sin asumir que la rama pública `main` sea inmutable. No se lleva
código, disassembly ni binarios propietarios a Git.

Se volvieron a leer los 428 artefactos del índice anterior: 100.492.633 bytes,
cero ausencias o discrepancias. Hay 19 antecedentes E1 seleccionados disponibles.
Estas medidas acreditan artefactos locales, no semántica global de Productor,
estado de bases activas ni disponibilidad de fuentes en otro equipo.

Reproducción del director: `python output/e1-varformat-20261017/static/verify-static.py
--output-dir output/e1-varformat-20261017/architect-static`, salida 0:
**141/141 comprobaciones**, 81 anclajes, ocho capturas con 1.395 instrucciones
contrastadas, seis casos de construcción y 14 mutaciones solo en memoria.
Fallos medidos por mutación: `7,7,5,7,7,1,1,1,1,5,1,1,1,1`; tres fuentes intactas.
Son comprobaciones estáticas, no tests de producto ni salidas de `VarFormat`.
`architect-static/static-verificado.json` conserva el resultado; la reproducción
de construcción separada está en `architect-mask-replay.jsonl`. No hay corrección
funcional que revertir ni se atribuyen suites antiguas a esta unidad.

**Siguiente unidad al cerrar formato, antecedente histórico:** proveedor de configuración y significado del
argumento `2`; después acreditar valores efectivos de `REDprecio/REDlinea/
REDbase/REDtotal` sin leer bases activas. No repetir máscaras/helpers/650 ni
las unidades cerradas. La aceptación matemática de Automation exige un ensayo
aislado autorizado con entradas y versión/localización identificadas; no queda
cerrada por documentación o construcción de máscaras. Agregados y persistencia
conservan sus fronteras propias. E1 permanece `in_progress`, cargo desactivado
y G6 protegido.

Revisión independiente: **77/77 comprobaciones propias**, 3.959 instrucciones
contrastadas, argumentos y fuentes verificadas; reprodujo además el gate 141/141
y la guarda documental. Sin defectos reproducibles en el alcance estático;
no acepta salidas numéricas ni conservación de importes. El director reprodujo
también ese verificador propio con salida 0. Informe y artefacto revisado en
`review/REVISION-INDEPENDIENTE.md` y `review/reviewed-artifact.json`; reproducción
del director en `architect-review/reproduced/independent.json`.

Cierre documental de la unidad de formato: 119 Markdown encontrados por barrido
real, ocho documentos actualizados, 264 enlaces locales y 22 anclas válidos;
seis referencias oficiales íntegras y diff correcto. Estado, roadmap, contrato,
índice, relevo de raíz, guía Windows, procedimiento y relevo REA apuntaban a la
siguiente unidad de configuración, desarrollada a continuación. No se retiró
documentación, evidencia única ni discrepancias. Sin cambios en paquetes o
fronteras del producto, no se repitieron suites de aplicación ni SQL.
July: mismo pendiente local 181 y sync_uid `398049fbd618069e36bb84bab37913ed`,
actualizado y comprobado por lectura posterior; continuaba `in_progress`, sin sync.

## Proveedor de configuración y argumento 2

Unidad estática/documental del **17/10/2026**, desde `1bb9b29`, en el mismo
worktree y rama `codex/rea-productor-20261016`. Resuelve el proveedor de la
petición de configuración; no observa una instancia Productor ni sus valores
efectivos. El contrato completo se conserva en
`output/e1-config-20261017/CONTRATO.md`; las fuentes/capturas son privadas.

- **Resultado exacto:** identificar proveedor, argumentos y rutas de retorno,
  y separar declaración, carga, valor solicitado y valor efectivo de las cuatro RED.
- **Éxito medible:** identidades y anclajes contra bytes, integridad antes/después,
  verificadores ejecutados, sensibilidad y revisión independiente.
- **Alcance:** investigación dirigida y documentación propia. Checkout original,
  originales, evidencias anteriores, A–F, G1–G5 y G6-incidencia protegidos.
- **Exclusiones:** ejecución Productor/DLL/COM/Automation/SQL, bases de negocio,
  cambios de producto, migraciones, publicación, sincronización y despliegue.
  No se repiten formato, export 650 ni las unidades estáticas cerradas.

### Declaración y proveedor

La creación local del proveedor pasa a `__vbaNew2` el ObjectInfo `0x11007cb0`
de `gaConfigDAL`, en `alAppFramework.dll`. Descriptor `0x1100c068`, coclase
`eb80593b-fbd3-401c-809c-2d35bd971ef0` e interfaz propia
`fbc67c05-86ba-4d8c-8476-0e2a8729b6ae` enlazan la clase; no se deduce su
identidad de un IID de diagnóstico o del registro de Windows.

El slot `+0x20` declara `Carga`, con `sNombreDato` y `sValorSiNulo` de tipo
BSTR y salida BSTR. Su celda `0x11007d5c` lleva al thunk `0x11007dcd` y cuerpo
`0x110619b0`. Delega al helper propio `+0x4c`, cuerpo `0x11061cb0`, pasando
el nombre solicitado, el campo `Valor` y `sValorSiNulo`.

### Qué acredita el argumento 2

La rutina de carga de RED convierte el entero `2` mediante `__vbaStrI2` y
lo pasa como BSTR al segundo argumento de `Carga`. El nombre del parámetro
no basta para interpretar su función. El cuerpo delegado sí contiene una
prueba mediante el import runtime `#560`, identificado por su export como
`rtcIsNull`: tras resultado no cero, copia el tercer argumento del helper
(`sValorSiNulo`) al retorno, en `0x11062199–0x110621a5`.

Esto acredita un fallback **condicionado a esa rama**. No demuestra que una
petición concreta la recorriese ni que las escalas efectivas sean dos. Tampoco
equivale a corregir cualquier dato inválido, vacío o error con dos decimales.

Hay una segunda rama de retorno del mismo fallback: el resultado declarado
Long de `_gaLstIndice.dimeIdxClave`, slot `+0x2c`, se convierte mediante
`__vbaI2I4` y se compara con `-1` en `0x110620a7`. Si coincide, se devuelve
`sValorSiNulo`. Se acredita ese retorno del buscador, sin generalizarlo a
«cualquier ausencia» ni atribuirle un cuerpo por un IID compatible sin resolver.
En la otra ruta se obtiene `_gaLstItem.campo`, slot `+0x20`, con nombre `Valor`
y salida Variant; si no toma la rama `rtcIsNull`, se convierte a BSTR para
el retorno. La secuencia contiene tratamiento de errores; no se afirma que
todo error desemboque en el fallback.

Además, el helper puede devolver cadena vacía cuando la bandera propia del
proveedor `this+0x34` es cero o falla la guarda de longitud del nombre. Ese
campo pertenece a `gaConfigDAL`, una instancia distinta de la que contiene
`REDprecio` también en `+0x34`. No extender la reserva `2` a estas rutas.

### Las cuatro propiedades RED

La interfaz propia `_alConfigRedondeo`, GUID
`3437a004-d736-4b48-b8e1-7756a4fae5ba`, declara los getters siguientes.
La carga privada `+0x54`, cuerpo `0x110297d0`, pide cada clave con el BSTR
`2` en `sValorSiNulo`. El BSTR devuelto se entrega como Variant BSTR a
`ValorDbl`; su Double pasa a `__vbaFpI2` y después al WORD de instancia.
La conversión y la escritura son estáticas: no se ha observado el valor recibido.

| Propiedad / slot declarado | WORD leído por getter | Clave solicitada | Escritura de la rutina de carga | Valor efectivo demostrado |
|---|---|---|---|---|
| `REDprecio / +0x1c` | `this+0x34`, cuerpo `0x110291b0` | `RedondeoPrecio` | `0x110298dd` | Ningún valor de instancia observado |
| `REDlinea / +0x20` | `this+0x36`, cuerpo `0x11029220` | `RedondeoLinea` | `0x11029997` | Ningún valor de instancia observado |
| `REDbase / +0x24` | `this+0x38`, cuerpo `0x11029290` | `RedondeoBase` | `0x11029a51` | Ningún valor de instancia observado |
| `REDtotal / +0x2c` | `this+0x3c`, cuerpo `0x11029370` | `RedondeoTotal` | `0x11029bc5` | Ningún valor de instancia observado |

**Inicialización:** una rutina privada `+0x5c`, cuerpo `0x1102a850`, llama
a `+0x54` y después a `+0x58` en `0x1102a8b7/0x1102a8bd`. Esto fija el orden
de esas llamadas en ese cuerpo; no acredita que sea un constructor/evento
automático ni que una sesión comercial lo ejecutase. No se atribuye un valor
inicial cero o dos a los WORD desde la mera creación del objeto. Las cuatro
propiedades, la petición de reserva y los valores efectivos quedan separados.

### Estado de aceptación y continuidad

Extraído y especificado el proveedor de la petición. No se implementa el cargo
económico ni se certifican empates, localización efectiva, conservación de
importes, agregados comerciales o persistencia durable. E1 permanece
`in_progress`, cargo desactivado y G6 protegido.

**Frontera histórica de esta unidad, seguida en la continuación inferior:**
`gaConfigDAL.AbreRS`, slot `+0x1c`, celda `0x11007d58` → thunk `0x11007dc0`
→ cuerpo `0x110615d0`. La [unidad de procedencia](#procedencia-y-precedencia-del-índice-de-configuración)
acredita su consulta y carga dirigida; no volver a seleccionar AbreRS como tarea
nueva. La continuación de [construcción y selección del índice](#configuración-construcción-y-selección-del-índice)
actualiza su frontera; los valores efectivos siguen abiertos. No reabrir `Carga`, el
argumento `2`, máscaras/helpers/650 o las unidades previas. No se autoriza leer
bases de negocio. Agregados, persistencia y ensayo matemático aislado conservan
sus alcances propios.

### Evidencia ejecutada

Evidencia nueva privada en `output/e1-config-20261017/`. El director reprodujo
la integridad inicial de los dos índices: **428/428** artefactos y
100.492.633 bytes, **56/56** y 836.521 bytes; cero ausencias o diferencias de
tamaño/SHA-256. Los índices y los **19/19** antecedentes referenciados permanecen
intactos. Esto acredita disponibilidad local, no semántica de todas las fuentes.

Gate del proveedor reproducido por el director sobre el verificador congelado:
`python -B output/e1-config-20261017/provider/verify-provider.py --output-dir
output/e1-config-20261017/director-static-frozen`, salida 0, **148/148**.
Nueve capturas, cuatro reutilizadas de la evidencia anterior, con **1.589**
instrucciones cotejadas contra bytes y decodificación. Las **14** mutaciones sólo
en memoria provocan **un fallo cada una**; cuatro fuentes intactas antes/después.
El gate inicial 140 queda como antecedente privado; el final añade el cotejo de
artefactos guardados con sus fuentes. No son pruebas de producto o salidas reales
del proveedor; no existe arreglo funcional de Aluminior que revertir.

Se actualizan los ocho documentos existentes de estado, roadmap, contrato,
índice, relevos, guía y procedimiento. Se preservan evidencias y discrepancias;
las instrucciones agotadas de proveedor/argumento `2` quedan como historia o se
sustituyen por la procedencia del índice. No se modifica ningún paquete, script
de producto o migración, ni se repiten suites que ejecutan SQL.

### Cierre de revisión y entrega

Revisión independiente conforme, sin defecto reproducible ni corrección
solicitada. Verificador propio **135/135**, salida 0, reproducido por el director
con `python -B output/e1-config-20261017/review/independent_verify.py --out
output/e1-config-20261017/review/director-reproduced`. Seis mutaciones hacen
fallar sus predicados locales. Sus 18 capturas suman 4.441 instrucciones con
solapamientos; no representan instrucciones únicas ni cobertura funcional.
Informe y recibo privados: `review/REVISION-INDEPENDIENTE.md` y
`review/review-receipt.json`. Una revisión completa; no hubo corrección funcional.

Gate documental del director: barrido real de 119 Markdown, ocho modificados,
268 enlaces locales y 26 anclas válidos. El extractor independiente cuenta
269 enlaces; ambos verifican todos sus destinos. Se preserva por hash el
artefacto revisado; sólo se añade este recibo de cierre. Integridad anterior
revalidada al final sin diferencias. No se retira evidencia o documentación única.

July: mismo E1 localizado en `aluminior` por
`398049fbd618069e36bb84bab37913ed`, actualización local y lectura posterior
coincidentes; historia conservada, estado `in_progress`, sin sincronización.
El commit local se guarda tras comprobar identidad Git y detener escrituras
de todos los agentes. No hay push, publicación o despliegue. E1 económico sigue
abierto; cargo desactivado, A-F/G1-G5 y G6-incidencia preservados.

## Procedencia y precedencia del índice de configuración

Unidad estática/documental del **17/10/2026**, desde `18accbc`, con rama
`codex/rea-productor-20261016` y árbol limpio comprobados. Mismo worktree;
contrato completo privado en `output/e1-config-origin-20261017/CONTRATO.md`.
Se sigue la entrada AbreRS sin repetir Carga, argumento `2`, formato o las
unidades anteriores. No cambia producto ni se ejecuta software legado, COM,
Automation o SQL; no se abre ninguna base de negocio.

### Declaración, inicialización, carga y valores efectivos

| Etapa | Evidencia estática | Límite |
|---|---|---|
| Declaración | `_gaConfigDAL.AbreRS +0x1c`, celda `0x11007d58` → thunk `0x11007dc0` → cuerpo `0x110615d0` | La declaración no prueba invocación |
| Preparación de estado | AbreRS escribe `0xffff` en el WORD propio `this+0x34`, `0x1106165e`; su ruta de error escribe cero, `0x1106193a` | La bandera se prepara antes de cargar; no certifica éxito |
| Otra inicialización estática | Método privado `+0x58`, cuerpo `0x11064200`, escribe cero en ese WORD en `0x1106425e` | No se ha demostrado que sea evento automático ni que se ejecutase |
| Fuente textual | Consulta a `gaConfig`, con sufijo `WITH (NOLOCK)` sólo en la condición de tipo indicada abajo | No identifica base, empresa, sesión ni filas efectivas |
| Carga de lista | Receptor `gaLstRSado` creado si falta en `this+0x38`; se llama `cargaDatos +0x28`, cuerpo `0x11076ea0` | Carga estática, sin ejecutar la consulta |
| Índice pedido | `gaLstRSado.lst +0x1c`, cuerpo `0x11076530`, devuelve la lista; `gaLst.xcfg_IDX_addIndice +0x64` recibe `NombreDato, 0, 0, 0` | No demuestra unicidad, orden, comparación textual o prioridad de duplicados |
| Valores efectivos | Ninguna observación de filas ni de las cuatro RED | No se atribuyen ceros, dos decimales u otros valores a una instancia |

### Origen del selector y procedencia de la carga

El global de apartamento usado por AbreRS en `base+0x1106d034` se crea
condicionalmente mediante descriptor externo `0x11010530`. Su coclase e
interfaz coinciden con `gaConexion`/`_gaConexion` de `gaBBDD.dll`. El slot
`+0x24` declara `BDtipo`: celda `0x1100c188` → thunk `0x1100c216` → cuerpo
`0x110374e0`. El enum público declara `Access=0` y `SQLServer=1`; AbreRS
compara el resultado con `1` en `0x110616e1` y selecciona el sufijo de la
consulta. Esto acredita el selector estático; no el backend efectivo.

El getter delega al slot `+0x2c` de un objeto creado con ObjectInfo
`0x1100bd00`. Su asociación nativa con la declaración `_gaConexionBD.BDtipo`
no está cerrada: no asignar un cuerpo por nombre, slot o IID de diagnóstico.
Esta compatibilidad es una frontera secundaria antes de seguir el estado del
selector; no se necesita resolverla para identificar el origen textual de la
consulta de AbreRS.

La creación del receptor de carga se acredita mediante descriptor externo
`0x1101c73c`, coclase/interfaz propias de `gaLstRSado`, TypeLib y tabla nativa.
`cargaDatos` guarda el nombre y el SQL de la consulta en campos propios,
solicita vaciar la lista antes de delegar la consulta y contiene la transferencia
de filas/campos a la lista. El getter `lst` y la petición posterior de índice
se siguen por slots y bytes. La identidad de `gaLst` se coteja mediante la
referencia default de la coclase en TypeLib, separada de su interfaz de eventos;
no se modifica el lector ni la evidencia anterior para forzar una coincidencia.
La evidencia privada conserva esas llamadas y
sus límites; no constituye lectura de los resultados del recordset.

### Precedencia acreditada y pendiente

En esta ruta se observa **recarga antes de pedir el índice**, desde una sola
consulta textual a `gaConfig`. El texto no contiene `ORDER BY` ni selección
por empresa/usuario; el cuerpo de AbreRS no acredita superposición de INI,
registro u otra fuente sobre esas filas. Esta ausencia se limita al cuerpo
inspeccionado y no demuestra que todo Productor carezca de otras fuentes.

No se afirma «gana el primero» ni «gana el último». El orden de los registros,
la comparación de claves, la gestión de duplicados, los fallos de recarga y
la selección efectiva de conexión conservan sus fronteras. Tampoco se atribuye
validez a la bandera preparada, ni atomicidad o persistencia a esta secuencia.

### Continuidad y aceptación

**Frontera histórica, seguida en la unidad inferior:** orden y duplicados dentro del índice.
Entrada: `gaLst.xcfg_IDX_addIndice +0x64`, cuerpo `0x110691d0`, que delega en
`gaLstIndice.xConfig +0x3c`, celda `0x1100d600` → thunk `0x1100d81d` →
cuerpo `0x11072920`. La metadata ya cotejada enlaza también `dimeIdxClave +0x2c`,
celda `0x1100d5f0` → thunk `0x1100d781` → cuerpo `0x1106ff20`; su cuerpo no se
había leído en aquella unidad. Los enlaces se reutilizan en
[configuración, construcción y selección](#configuración-construcción-y-selección-del-índice),
sin reabrir Carga ni el argumento `2`. Valores efectivos requieren evidencia propia sin abrir negocio bajo este
alcance. Agregados, aceptación matemática y persistencia siguen en unidades
posteriores; la comparación funcional y las pruebas con software se reservan
para una fase posterior autorizada y aislada.

Queda extraída la procedencia de carga y especificada su secuencia estática;
la precedencia interna y los valores efectivos permanecen abiertos. No se
implementa el cargo económico. E1 sigue `in_progress`, cargo desactivado,
A–F/G1–G5 y G6-incidencia preservados.

### Evidencia ejecutada de esta unidad

El director reproduce los gates sobre capturas guardadas, con salida nueva:

- `python -B output/e1-config-origin-20261017/abre-rs/verify.py --out output/e1-config-origin-20261017/director-abre-rs`:
  salida 0, **1.425 instrucciones**, **12 predicados** y **12 mutaciones** de
  datos de prueba en memoria rechazadas. Cuatro capturas, una previa reutilizada.
- `python -B output/e1-config-origin-20261017/origin/verify-origin.py --out output/e1-config-origin-20261017/director-origin`:
  salida 0, **37/37 comprobaciones**, **552 instrucciones** y **siete mutaciones**
  de bytes sólo en memoria rechazadas. Tres capturas, una previa reutilizada.

Ambos recorridos comparten las 325 instrucciones de AbreRS; sus conteos no son
cobertura única sumable. Las fuentes seleccionadas permanecen intactas por hash.
Se coteja además el import usado para la selección condicional con su entrada
en las exportaciones del runtime, sin cargarlo. Son comprobaciones estáticas,
**cero pruebas funcionales**; no hay arreglo de producto que revertir.

Integridad inicial ejecutada: **428/428**, **56/56** y **91/91** artefactos de
los tres índices anteriores; respectivamente 100.492.633, 836.521 y 2.139.830
bytes, cero diferencias de tamaño/SHA-256. Los índices no se regeneran ni se
sobrescriben. Los recibos y verificadores nuevos están en
`output/e1-config-origin-20261017/`; esa carpeta privada no viaja por Git o July.

Se actualizan los ocho documentos existentes de estado, roadmap, contrato,
índice, relevos, guía y procedimiento. Se preservan historia y discrepancias;
los punteros activos pasan de AbreRS al orden/duplicados de su índice. No se
retira evidencia ni se repiten suites de paquetes o SQL para esta documentación.

### Cierre independiente de la unidad de carga

Una revisión independiente, sin razonamiento ni conclusiones de los autores,
no encuentra defectos accionables dentro del alcance. No se solicita corrección.
El director reproduce `python -B output/e1-config-origin-20261017/review/verify_review.py
--out output/e1-config-origin-20261017/review/director-reproduced`, salida 0:
**664 comprobaciones**, **seis capturas / 1.652 instrucciones únicas** y
**16 perturbaciones** de anclajes rechazadas en memoria. Informe/recibo privados:
`review/REVISION-INDEPENDIENTE.md` y `review/final-gate/receipt.json`.
Los límites de precedencia interna, valores efectivos y aceptación se conservan.

El barrido adicional encuentra dos cachés `.pyc` fuera del índice de formato:
58 archivos frente a 56 indexados, sin ausencias; sus metadatos muestran 07:32 UTC,
anterior a esta unidad. Se registran en `unindexed-files-observed.json` y se
conservan. Esto no cambia los 56 artefactos indexados acreditados ni regenera
su índice. El conjunto documental revisado se congela por hash; después de la
revisión sólo se añade este recibo de cierre.

July: mismo E1 localizado por proyecto `aluminior` y sync_uid
`398049fbd618069e36bb84bab37913ed`, actualizado localmente con historia conservada
y lectura posterior coincidente; sigue `in_progress`, sin sincronización.
Los tres agentes han confirmado el fin de sus escrituras. El commit local se
realiza tras el gate final del director y la comprobación de identidad Git;
sin push, publicación o despliegue. E1 económico sigue abierto, cargo desactivado
y G6-incidencia protegido.

## Configuración, construcción y selección del índice

Unidad estática/documental del **17/10/2026**, desde
`a060a09854e77662fd2014ed35abf62498fdf01a`, rama comprobada
`codex/rea-productor-20261016`, árbol inicial limpio. Contrato previo a las
escrituras en `output/e1-index-20261017/CONTRATO.md`. Se reutiliza la atribución
de `output/e1-config-origin-20261017/abre-rs/evidence.json`; no se repiten
AbreRS/carga, proveedor/argumento `2`, formato ni las otras unidades cerradas.
Sin código de producto, ejecución del legado, carga de DLL, COM, SQL o bases.

### Identidad y etapas separadas

Lectura directa de los PE, sin cargarlos:

| PE seleccionado | Bytes | SHA-256 |
|---|---:|---|
| `gaBBDD.dll` | 794.624 | `dc1f4be67fc7b25f8464a686bf890ca7a1bdf15bf267928bbb35fd62169efb95` |
| `msvbvm60.dll` | 1.436.032 | `898288bd3b21d0e7d5f406df2e0b69a5bbfa4f241baf29a2cdf8a3cf4d4619f2` |

| Etapa | Evidencia y alcance |
|---|---|
| Declaración | TypeLib `_gaLstIndice`, IID `a7492311-f0e2-45ca-b8b9-6415ad6412a9`; enlaces previos `xConfig +0x3c` y `dimeIdxClave +0x2c` reutilizados bajo el mismo hash PE |
| Inicialización/comprobación | `dimeIdxClave` llama al privado `+0x68`, cuerpo `0x11071380`: si `this+0x44` no es cero, solicita reconstruir y limpia ese WORD (`0x110713cd–0x110713f1`). No prueba un evento automático ni una instancia ejecutada |
| Configuración | `xConfig`, cuerpo `0x11072920`, prepara campos y llama `construyeIndice +0x38` en `0x11072e32`; guarda las opciones de actualización/reconstrucción después de construir, en `0x11072e44–0x11072e56` |
| Construcción | `construyeIndice`, cuerpo `0x11070e30`, prepara entradas con paso de 12 bytes y conserva la posición de la lista; llama al ordenador privado `+0x6c`, cuerpo `0x110714a0`, en `0x110711e5` |
| Selección | `dimeIdxClave`, cuerpo `0x1106ff20`, obtiene la clave mediante `xic_dimeClave +0x34` y busca mediante `+0x78`, cuerpo `0x11071b00`; distingue el indicador de coincidencia y el resultado sin coincidencia |
| Valores efectivos | No se han observado filas, las cuatro RED, una conexión activa ni un resultado comercial; las declaraciones y argumentos estáticos no suplen esa evidencia |

### Orden, comparación y duplicados

La ordenación delega en partición `+0x70`, cuerpo `0x11071640`, e intercambio
`+0x74`, cuerpo `0x11071840`. La construcción obtiene la clave de fila mediante
`gaLstItem.x_Clave +0x38` (`0x1107103f`), conserva el string en `+8` y prepara
una clave decorada en `+4`: posición original como Variant `0x4003`, máscara
`0000000000`, llamada al ordinal 660 y concatenación (`0x110710f9–0x11071191`).
Esto acredita los argumentos de decoración, sin reinterpretar su formato ni
deducir por él una prioridad de duplicados. Después de ordenar, copia `+8` a
`+4` (`0x11071274–0x1107127c`); la correspondencia con la fila movida no se
deduce de esa copia.

La consulta obtiene la clave buscada mediante `xic_dimeClave`, cuerpo
`0x11070520`. La búsqueda vuelve a pedir la clave de fila a `gaLstItem.x_Clave`
mediante `gaLstIndice.Item`, que traduce su posición usando el mapa original
(`0x1106fc66–0x1106fc6b`). **La equivalencia de las claves de construcción y
búsqueda sigue abierta** hasta seguir el cuerpo de `gaLstItem.x_Clave` y las
transformaciones delegadas; no se infiere por sus nombres.

Las comparaciones seleccionadas llegan por IAT `0x11001104` a la exportación
`__vbaStrCmp`, entrada `0x6601d8e2`, y al delegado `0x66004fdc` del runtime
identificado por hash. Ese delegado llama indirectamente mediante
`0x6611463c`, en `0x66004ff8`. Queda acreditado el enlace y el uso del signo/
igualdad devueltos; **no una colación textual exacta, sensibilidad a mayúsculas,
acentos o configuración regional**, mientras no se siga ese destino.

En la búsqueda `+0x78`, la igualdad en el punto medio lleva a `0x110720c3`:
se devuelve esa posición y se marca coincidencia sin recorrer los extremos
en esa rama. En el tramo adyacente se comprueba el extremo inferior y después
el superior (`0x11071f13` / `0x11071fb6`). Es una selección de posición del
algoritmo bajo sus premisas; **no demuestra «gana la primera fila» ni «gana la
última fila»** ante duplicados de negocio. No se deduce unicidad, prioridad
estable o valor efectivo de esa secuencia.

### Frontera registrada al cerrar la unidad del índice

**Anclajes pendientes en aquel cierre**, continuados en la unidad de claves
que figura al final de este documento: resolver el despacho de comparación
del runtime mediante `0x6611463c` desde la llamada `0x66004ff8`, y la
normalización delegada desde `0x66040f1c` a `0x66040f46`. En el generador de
claves quedan las rutas de transformación en `0x110708ff` y `0x1107099f`,
con llamadas delegadas en `0x1107094a / +0x3c` y `0x110709d2 / +0x44`.
Para la clave de fila, continuar desde `_gaLstItem.x_Clave +0x38`, registro
TypeLib `0xabcd8`, acreditando su cuerpo antes de afirmar equivalencia.
Conservar identidad PE y separar esos frentes; no repetir `xConfig`,
construcción, partición/intercambio ni búsqueda para llegar a ellos.

Después permanecen valores efectivos, aceptación matemática, agregados y
persistencia. El orden acordado sigue siendo completar contrato e
implementación, comparar con Aluminior y después ensayar el software en un
entorno aislado; esas fases no se autorizan ni ejecutan en esta unidad.
E1 continúa `in_progress`, cargo desactivado y A–F/G1–G5/G6-incidencia preservados.

### Evidencia de esta unidad

Evidencia privada nueva en `output/e1-index-20261017/`, fuera de los cuatro
árboles protegidos. La captura reproducible nueva es
`behavior/capture-index.py --out <carpeta nueva dentro de behavior>`; el conjunto
entregado está en `behavior/captured-frozen/evidence.json`. Los scripts se
ejecutan con `python -B` y rechazan sobrescrituras. No ejecutar colectores
anteriores como verificadores ni escribir en las carpetas protegidas.

El cotejo independiente del director con `verify_frozen_captures.py` verifica
las **15 capturas, 3.833 instrucciones únicas y 11.492 bytes** contra los PE y
su desensamblado. `verify_captures.py` verifica además las 11 capturas
exploratorias de gaBBDD: 3.670 instrucciones; rechaza cuatro perturbaciones
estructurales en memoria (byte capturado, dirección, mnemónico y byte fuente).
Estos conjuntos se solapan y **no se suman** como cobertura. Son verificaciones
estáticas; **cero pruebas funcionales** y ningún arreglo de producto que revertir.

El director reproduce además
`python -B output/e1-index-20261017/behavior/verify-index.py --out output/e1-index-20261017/behavior/director-gate`:
salida 0, **130/130 comprobaciones**, **30 predicados seleccionados** sobre operandos/ramas
y **30/30 perturbaciones rechazadas en memoria**. Cada perturbación registra
los predicados que fallan; se evalúan sin depender del rechazo por hash PE.
Este gate comparte las mismas 15 capturas y no añade cobertura sumable.

Integridad inicial: **428/428, 56/56, 91/91 y 145/145**, respectivamente
100.492.633, 836.521, 2.139.830 y 945.905 bytes, sin diferencias de tamaño/
SHA-256. También se conservan los dos `.pyc` antiguos fuera del índice de
formato. Recibo `preflight/integrity.json`; los índices no se regeneran.
La comprobación final usa una salida nueva y compara con ese recibo.
Las evidencias privadas no viajan en el commit ni mediante July.

### Revisión independiente y cierre local

El candidato de ocho documentos se revisa mediante ARTEFACTO + CONTRATO +
EVIDENCIA, sin razonamiento ni informe del autor. No hay hallazgos accionables
en el alcance estático; se conserva `review/INFORME.md`. El director reproduce
`python -B output/e1-index-20261017/review/review-verifier.py --out output/e1-index-20261017/review/director-reproduced`:
salida 0, **15 capturas / 3.833 instrucciones / 11.492 bytes**, **27 slots**,
ocho grupos de anclajes y **60 perturbaciones estructurales rechazadas**.
El arnés reproduce también el gate 130/130 y los cuatro verificadores raíz.
No son conteos de funcionalidad ni coberturas sumables.

La revisión mide un límite de las 30 reglas: alterar en memoria las llamadas/
saltos de `0x11071d96`, `0x11071f5d` o `0x110719ce` no hace fallar esos
predicados seleccionados; el cotejo completo de sus capturas sí lo rechaza.
No se atribuye cobertura causal exhaustiva al verificador. Los intentos
incompletos de su arnés se conservan, con sus errores y correcciones propios;
no se modifica el lector ni la evidencia anterior para hacerlos pasar.

Tras la revisión sólo se precisa el término «rutas» para los dos anclajes de
transformación y se añade este recibo; no se amplían conclusiones de negocio.
Los ocho documentos activos enlazan la nueva frontera y conservan la historia.
El barrido de 1.107 archivos versionados acredita ocho Markdown cambiados y
1.099 intactos; 280 rutas locales enlazadas existentes y `git diff --check`
correcto. No se repiten suites de producto ni se cambia su fecha histórica.

Los cuatro índices anteriores y todos sus artefactos se cotejan de nuevo con
el recibo inicial; **428/428, 56/56, 91/91 y 145/145**, sin diferencias,
incluidos los dos `.pyc` antiguos conservados fuera del índice de formato.
El gate final del director se guarda en `review/director-final/`, con salida
nueva. El sellado nuevo de esta unidad no regenera ninguno de aquellos índices.

July: mismo E1 de `aluminior`, sync_uid `398049fbd618069e36bb84bab37913ed`,
localizado y actualizado con historia conservada y lectura posterior exacta;
estado `in_progress`, sin sincronización. Recibo privado `july-readback.json`.
Los agentes han terminado y sus escrituras están congeladas. El cierre Git
local se hace tras comprobar identidad de Sergio, diff, integridad y gate;
sin push ni despliegue. Cargo desactivado y G6-incidencia preservado.

## Comparación y normalización de claves

Unidad estática/documental del **17/10/2026**, desde
`6b35327e2f0634f853c80e8a337b1ecf70d4f189`, rama
`codex/rea-productor-20261016` y árbol limpio comprobados antes de escribir.
Contrato en `output/e1-keys-20261017/CONTRATO.md`. Se reutilizan las identidades
y atribuciones anteriores después de comprobar hashes actuales. No se repiten
configuración/construcción, ordenación, búsqueda, AbreRS/carga ni formato.

### Identidad y etapas de esta continuación

| PE leído como bytes | Bytes | SHA-256 |
|---|---:|---|
| `gaBBDD.dll` | 794.624 | `dc1f4be67fc7b25f8464a686bf890ca7a1bdf15bf267928bbb35fd62169efb95` |
| `msvbvm60.dll` | 1.436.032 | `898288bd3b21d0e7d5f406df2e0b69a5bbfa4f241baf29a2cdf8a3cf4d4619f2` |
| `oleaut32.dll` local, SysWOW64 | 664.800 | `d593243c06adc9a1812b0e6ae5b600429d4b1828dcfa6c6b823d5ca3362c0067` |

| Etapa | Acreditado / límite |
|---|---|
| Declaración | IAT gaBBDD `0x11001104` → export `__vbaStrCmp`; IAT `0x110010fc` → ordinal 528. TypeLib `_gaLstIndice` y `_gaLstItem` coinciden con las declaraciones previas bajo el mismo PE |
| Inicialización | Celda comparador `0x6611463c` cero en disco; escritura directa identificada en `0x6602d2ed`. No es lectura del valor de un proceso |
| Configuración y construcción | Evidencia de la unidad del índice conservada, sin volver a extraerla ni atribuirle valores efectivos |
| Comparación | Identidad del símbolo solicitado por el inicializador, argumentos seleccionados y ajuste del retorno seguidos; cuerpo de comparación externo no expandido |
| Normalización | Delegados y bifurcación por `0x6611468c` seguidos; implementación de tablas externas y rama efectiva no demostradas |
| Selección | Resultado algorítmico de la unidad anterior conservado; no demuestra primera/última fila de negocio |
| Valores efectivos | Sin proceso, filas RED, backend, locale ni página de códigos observados; ningún cargo activado |

### Inicializador y destino declarado del comparador

La entrada `0x6601d8e2` pasa modo cero a `0x66004fdc`. El helper prepara
`0x30001` y los tres argumentos de su pila antes de la llamada por
`[0x6611463c]` en `0x66004ff8`. En retorno ordinario no negativo decrementa
EAX; el resultado negativo toma otra rama. No se interpreta `0x30001` como
una política de colación sin seguir el contrato externo y las premisas.

El prefijo capturado de `0x6602ccb6` contiene guardas y la llamada al
inicializador en `0x6602ccf0`. En `0x6602ce61`, el literal `oleaut32.dll`
(`0x66030544`) se pasa a `GetModuleHandleA` por IAT `0x66001230`, llamada
`0x6602ce68`. Su retorno se conserva en EDI; cero sale. ESI se toma de
`GetProcAddress`, IAT `0x66001178`, en `0x6602ce78`. Resoluciones intermedias
tienen salidas si devuelven cero. En la ruta que alcanza `0x6602d2e5` se pasa
el literal `VarBstrCmp` (`0x6603021c`) y EDI, se llama ESI en `0x6602d2eb` y
se guarda EAX en la celda en `0x6602d2ed`, sin comprobación final del retorno.
Esto acredita **quién escribe y qué símbolo solicita**, no ejecución ni éxito.

El PE local de `oleaut32.dll` declara `VarBstrCmp`, ordinal **314**, VA
preferida **`0x100169b0`**, celda EAT **`0x1008f078`**, sin forwarder.
Es un candidato local identificado por hash; no demuestra que ese PE fuera el
módulo cargado por Productor. Su cuerpo no se desensambla en esta unidad.
El barrido de las cuatro bytes literales de la celda encuentra seis referencias:
cinco llamadas y esa escritura directa. No cubre escrituras por alias o
direcciones calculadas ni constituye una prueba de exclusividad global.

### Cuerpo delegado del normalizador

La llamada `0x66040f1c` llega a `0x66040f46`, que delega en `0x66040f64`.
En la rama no nula se lee la longitud en `BSTR−4`, se desplaza un bit y se
pasa junto con la cadena al ordinal 4 de OLEAUT32, IAT `0x66001a08`.
El retorno se guarda por puntero. Si es no nulo, se incrementa la longitud y
se llama a `0x66040f9a` en `0x66040f8f`; después se pone EAX a cero sin
comprobar el estado que haya devuelto ese delegado. Son instrucciones y
argumentos observados estáticamente; no una prueba de conversión sin pérdidas.

En `0x66040fa8`, `[0x6611468c] == 0` continúa hacia la llamada a la IAT de
`USER32.CharUpperBuffW` en `0x66040fba`. El caso no cero salta a
`0x6608d0f9`: llamadas declaradas a `WideCharToMultiByte`,
`CharUpperBuffA` y `MultiByteToWideChar`, con cero en los argumentos de página
de códigos/flags seleccionados. No se recuperan las tablas de Windows, la
página efectiva ni sus resultados para caracteres concretos. La celda vale
cero **en disco**, lo que no permite elegir la rama de una ejecución.

La conversión de entrada `0x660387fc`, el helper de errores `0x6603852c` y
la reserva auxiliar `0x6601170c` quedan sin expandir. No se atribuye una
normalización exacta a partir del nombre `rtcUpperCaseVar` o de las IAT.

### Frontera registrada al cerrar comparación y normalización

**Anclajes de aquel cierre**, continuados en la unidad siguiente: atribuir el
cuerpo de `_gaLstItem.x_Clave +0x38`, registro TypeLib
`0xabcd8`, mediante su propia metadata/slot y anclajes de bytes. La declaración
está cotejada; no hay todavía atribución de cuerpo aceptada. Seguir después
las rutas `0x110708ff / 0x1107099f` de `xic_dimeClave`, llamadas delegadas
`0x1107094a / +0x3c` y `0x110709d2 / +0x44`. No equiparar por nombre las
claves de construcción, ordenación y búsqueda.

Como fronteras secundarias concretas quedan el selector del normalizador
desde `0x6602ce26` y ramas `0x66087fc6 / 0x66087fd7`, la conversión de entrada
`0x660387fc` y el cuerpo externo del candidato `VarBstrCmp` anterior. No
repetir el inicializador del comparador, las rutas del normalizador ya capturadas
ni las unidades anteriores para alcanzar esas fronteras.

**Después:** valores efectivos, agregados comerciales y persistencia durable.
Se mantiene el orden acordado: completar contrato/implementación, comparar con
Aluminior y después probar el software aislado. Ninguna de esas fases se ejecuta
en esta unidad. E1 continúa `in_progress`, cargo desactivado y A–F/G1–G5/
G6-incidencia preservados. Primera/última fila, colación y equivalencia de claves
siguen abiertas. No hay ejecución Productor/DLL, COM, Automation, SQL o bases.

### Evidencia ejecutada y preservación

Evidencia privada nueva en `output/e1-keys-20261017/`. El director reproduce:

- `comparator/verify_comparator.py --out <carpeta nueva dentro de comparator>`:
  **68/68 comprobaciones**, **13 grupos de predicados**, **17/17 perturbaciones
  en memoria rechazadas**, nueve capturas / 433 instrucciones / 1.456 bytes.
- `normalization/verify.py --out <carpeta nueva dentro de normalization>`:
  **68/68**, **22 predicados** y **22/22 perturbaciones en memoria rechazadas**,
  seis capturas / 150 instrucciones / 406 bytes.

Python siempre `-B`. Resultados del director en `comparator/director-initial/`
y `normalization/director-initial/`; evidencia y desensamblados privados en
`comparator/captured/` y `normalization/captured-frozen/`. Se cotejan los rangos
completos contra los PE y predicados seleccionados independientemente de hashes.
Hay solapes con la unidad anterior: **no sumar estas coberturas** ni confundirlas
con exhaustividad causal. Cero pruebas funcionales y ningún arreglo de producto
que revertir; suites de paquetes anteriores conservan sus fechas.

`preserve.py` comprueba los cuatro índices **428/56/91/145**, los dos `.pyc`
históricos y los árboles completos: **429/59/92/146/140 archivos**, incluidos
índices y recibos posteriores. El sellado previo de 134 archivos y ocho documentos
coincide con la línea base inicial. Recibo nuevo `preflight/preservation.json`;
los índices protegidos no se regeneran ni se ejecutan colectores/verificadores
anteriores con salidas en esos árboles. Los siguientes recibos usan carpetas
nuevas y cotejo contra esa línea base. Las fuentes privadas no viajan por Git/July.

### Revisión independiente y recibo de cierre de claves

Revisión descontaminada de los ocho Markdown y artefactos contra contrato y
evidencia cruda, sin informes/razonamiento de autores: `review/REPORT.md`.
Sin hallazgos accionables en el alcance estático; ninguna corrección de candidato.
Parser PE/TypeLib propio y cotejo de los 15 rangos; **2.477/2.477 comprobaciones**,
**23/23 perturbaciones propias rechazadas en memoria**. Son controles estáticos
parciales, sin pruebas funcionales ni cobertura causal exhaustiva.
El control de `0x6602ce7e` no falla los predicados seleccionados y sí el cotejo
completo de captura/hash; ese límite queda medido. Los errores de construcción
del arnés independiente se conservan como intentos propios, no fallos de producto.

El director reproduce el cierre con `python -B output/e1-keys-20261017/director_gate.py
--out director-final --review-script review/gate.py --review-additive-receipts`.
`director-final/gate.json` conserva comandos, códigos y stdout/stderr literales;
los resúmenes iniciales de `review-input.json` se precisan en
`review-input-clarification.json`. La reproducción independiente permite sólo
inserciones de recibos en este documento y el relevo, preservando el texto
revisado íntegro y registrando literalmente ese delta.

Preservación final: cuatro índices 428/56/91/145 y cinco árboles completos
429/59/92/146/140, sin diferencias contra la línea base. Barrido de 1.107
versionados: ocho Markdown cambiados, 1.099 intactos, 292 enlaces locales y
50 anclas válidos; `git diff --check` correcto. Los tres agentes terminaron y
congelaron escrituras antes del commit. July conserva el mismo E1 `aluminior`
por sync_uid, historia e `in_progress`, sin sincronizar. El cierre es un commit
local con identidad de Sergio verificada; sin push. El sellado nuevo y recibos
postcommit están bajo `output/e1-keys-20261017/`, fuera de árboles protegidos.

## Clave de fila y transformaciones del índice

**Entrega histórica conservada.** Sus siguientes pasos de predicados quedan
continuados en [la unidad posterior](#predicados-internos-de-rellena); no
ejecutar como lista de tareas ni escribir en su carpeta de evidencia.

Unidad estática/documental del **17/10/2026**, desde
`c0c77447f35e313754f9fce3bc94a38ac88e956d`, rama
`codex/rea-productor-20261016` y árbol limpio comprobados. Contrato previo en
`output/e1-rowkeys-20261017/CONTRATO.md`. Dos ejecutores con carpetas separadas;
sin código de producto, ejecución legacy, COM, Automation, SQL o bases.
Se reutilizan las atribuciones del índice, comparador, normalizador y `just`
bajo hashes actuales, sin repetir las unidades cerradas.

### Identidad, declaración y atribución del cuerpo

| PE leído como bytes | Bytes | SHA-256 |
|---|---:|---|
| `gaBBDD.dll` | 794.624 | `dc1f4be67fc7b25f8464a686bf890ca7a1bdf15bf267928bbb35fd62169efb95` |
| `gaCodigoBase.dll` | 176.128 | `2a030e756ac804631e56324065561b4b8e4ac422e3c28406a59d4eb9190f2e8c` |
| `msvbvm60.dll` | 1.436.032 | `898288bd3b21d0e7d5f406df2e0b69a5bbfa4f241baf29a2cdf8a3cf4d4619f2` |

La declaración `_gaLstItem.x_Clave +0x38`, registro TypeLib **`0xabcd8`**, se
coteja con sus tipos de parámetro/retorno. La cadena propia nueva es:

| Enlace | Anclaje |
|---|---|
| Descriptor → ObjectInfo | `0x1100e738` → `0x1100a8b4` |
| CLSID | puntero `ObjectInfo+0x3c` → `0x11019038`; `b1089baf-e4d0-4444-bdff-8272912c2fbd` |
| IID propio | celda `ObjectInfo+0x7c = 0x1100a930` → `0x11018be8`; `cc78c427-db0b-4009-a97a-010272032482`, igual a TypeLib |
| Coclass → interfaz | TypeInfo 35 → referencia `0xa1e10`, HREF `0xd48` y flags `0x1` → TypeInfo 34 `_gaLstItem` |
| Tabla → slot → thunk → cuerpo | `0x1100a95c` → celda `0x1100a978` (`+0x38`) → `0x1100aa0b` → **`0x11074c00`** |

El cuerpo capturado termina en el límite exclusivo **`0x1107515d`**.
Diez entradas públicas concuerdan en nombres y slots con TypeLib; la undécima,
slot nativo `+0x44`, permanece sin nombre ni atribución de método público.

La guarda antigua `native('gaLstItem')` sigue rechazando este layout: asumía
un IID en CLSID+16, donde aquí ya hay texto de nombres. No se modifica ni se
suprime. La vía alternativa acredita el IID mediante su celda propia y la
referencia de coclass. No se identifica el receptor desde un IID de diagnóstico
HRESULT ni se generaliza este offset a otras clases.

### Clave de fila: entradas, ramas y resultado estático

`x_Clave` recibe índice por referencia y salida BSTR. Pide `xnCampos +0x40`
en `0x11074c93`; el bucle de contador de 16 bits usa `xCampoIdx +0x44`
en `0x11074d53`. Sobre `[this+0x34]` solicita ancho (`+0x58`, llamada
`0x11074d75`) y tipo (`+0x54`, `0x11074dc4`) para el campo seleccionado.
El valor procede de `[this+0x38]`, con acceso a datos/límites de array y paso
de 16 bytes por Variant. Eso no demuestra qué valores contiene una fila real.

| Condición observada en el cuerpo | Ruta |
|---|---|
| Tipo igual a `1` o `2` | Convierte el valor a string y llama al proveedor `+0x44` en `0x11075013`, con ancho por referencia y salida BSTR |
| Otro tipo, ancho cero | Conversión a string y concatenación directa, sin pasar por los dos slots de transformación |
| Otro tipo, ancho distinto de cero | Proveedor `+0x3c` en `0x11074f31`, valor string, ancho por referencia y BSTR literal `I` por referencia |

Las salidas se concatenan mediante la IAT de `__vbaStrCat`. El acumulador se
pasa como Variant BSTR por referencia `0x4008` al ordinal 528 (`0x11074cdf`),
y la salida se transfiere a `[ebp+0x10]` en `0x11075139`. Existen rutas de
límites/overflow y tratamiento de error: no se declara éxito universal.
Los códigos `1/2`, ancho, orden y valores efectivos no reciben un significado
de negocio supuesto ni se deducen desde los nombres de métodos.

### Proveedor y transformaciones delegadas

Las rutas de consulta `0x110708ff / 0x1107099f` utilizan la celda de receptor
relativa a `0x1109d538`. La petición de creación desde descriptor **`0x110109c4`**
incluye CLSID **`9da39243-bd3d-4f82-bba3-33c1dec7571e`** e IID
**`ac3c4874-c3a9-4bec-8637-3b79ceb84063`**. Coinciden con coclass/referencia
de interfaz propia en `gaCodigoBase.dll`. La creación efectiva no se ha observado.

En ese PE, ObjectInfo `0x11003e54` tiene el IID propio en celda
**`+0x80 = 0x11003ed4`**, que apunta a `0x11004814`; la celda adyacente
`+0x7c` contiene otro GUID y se conserva separada. El IID propio concuerda
con CLSID+16 y con la referencia de interfaz marcada `0x1` en TypeLib.
Esto se acredita para esa clase concreta; no contradice el layout distinto de
`gaLstItem` anterior ni permite imponer un offset universal.

| Declaración acreditada | Celda → thunk → cuerpo | Entrada de consulta |
|---|---|---|
| `_gaVarios.just +0x3c`, registro `0x252b0` | `0x11003f20` → `0x11004020` → `0x1100c780` | llamada `0x1107094a`: string, ancho WORD por referencia, BSTR `I` por referencia, salida BSTR |
| `_gaVarios.rellena +0x44`, registro `0x25344` | `0x11003f28` → `0x1100403a` → `0x1100cfc0` | llamada `0x110709d2`: string, ancho WORD por referencia, salida BSTR |

`just` se reutiliza desde la captura protegida existente, SHA-256
`bfd9f426d9f47470e940642834f2f25d28d45612008467134696846a6509ccc6`,
con cotejo contra el PE y anclajes seleccionados. Sus 398 instrucciones son
**reutilizadas**, no una extracción o cobertura nueva. No se reabre export 650.

La captura nueva de `rellena`, `0x1100cfc0–0x1100d750` exclusivo, acredita
copia inicial, comprobación de ancho cero, comparaciones de longitud, recorridos
condicionados de caracteres y comprobaciones contra los literales `*` y `-`.
Invoca otros predicados mediante `+0x48` y `+0x4c`, cuyos cuerpos estaban
abiertos en esta entrega y se siguen en [la unidad posterior](#predicados-internos-de-rellena).
Hay una ruta condicionada de construcción de máscara/formato y una llamada
al ordinal 528 en `0x1100d60b`; no se atribuyen esos pasos a todas las ramas.
No se equipara `rellena` con una operación genérica de padding ni se afirma
conversión sin pérdidas, semántica numérica exacta o formato efectivo.

La consulta también concatena los componentes y después llama al ordinal 528
en `0x11070a59`. Fila y consulta comparten las formas de transformación
acreditadas, pero difieren en el origen de los valores. **No se ha demostrado
equivalencia universal entre clave de fila, construcción, ordenación y búsqueda.**

Declaración y cuerpo quedan ahora vinculados. Inicialización efectiva,
configuración de campos/ancho/tipo y valores de fila siguen sin observarse.
La construcción/selección conserva la evidencia anterior; comparación externa
y normalización efectiva siguen abiertas. No se infiere primera/última fila,
colación, valores RED o backend efectivo.

### Verificación de la unidad y siguiente anclaje

Gates reproducidos por el director, con Python `-B` y carpetas de salida nuevas:

- `row/verify.py`: **223/223**, **49/49 perturbaciones en memoria rechazadas**,
  23 capturas: dos de código (480 instrucciones) y 21 de metadata/datos.
  El cuerpo abarca 1.373 bytes y el thunk cinco; los 2.384 bytes capturados
  totales incluyen metadata y solapes, no son una cobertura de código única.
- `transforms/verify.py`: **111/111**, **33 predicados / 142 anclajes** y
  **35/35 perturbaciones semánticas rechazadas**, dos rangos / 1.023 instrucciones
  (389 de la ruta de consulta y 634 de `rellena`). La consulta se solapa con
  capturas anteriores; no sumar conjuntos ni añadir las 398 instrucciones de `just`.

Los controles miden límites: el prólogo de `x_Clave` y un NOP de `rellena`
pueden pasar los predicados seleccionados y fallar el cotejo completo de captura.
Cambiar el bit 0 del campo de slot `0x25350` no altera el slot tras `&~3`;
esa aceptación queda registrada. El ataque semántico final cambia el bit 2.
Se conserva el intento inicial 108/109 y 34/35 de ese arnés, sin ocultarlo ni
debilitar aserciones. Ningún resultado es una prueba funcional o cobertura
causal exhaustiva; no hay arreglo de producto que revertir.

Evidencia canónica privada: `output/e1-rowkeys-20261017/row/captured-final/`
y `transforms/captured-final/`; los intentos/capturas preliminares se conservan
separados. Director inicial: `row/director-initial/`, `transforms/director-initial/`.
La preservación comprueba índices 428/56/91/145 y seis árboles completos
429/59/92/146/140/77 por tamaño y SHA-256, con índices/sellos/recibos y los dos
pyc históricos intactos. No se ejecutan verificadores ni colectores antiguos.

**Siguiente de aquella entrega, ya agotado:** predicados `gaVarios +0x48`
en `0x1100d1ae / 0x1100d38a` y `+0x4c` en `0x1100d17b`, continuados
en [predicados internos de rellena](#predicados-internos-de-rellena).
Después quedan las premisas de equivalencia, conversiones/runtime y valores
efectivos; agregados y persistencia mantienen su frontera propia.
No repetir la atribución/cuerpo de `x_Clave`, rutas de consulta o proveedor/slots
ya seguidos para alcanzar esos anclajes. E1 continúa `in_progress`, cargo
desactivado y A–F/G1–G5/G6-incidencia preservados. Completar contrato/implementación,
comparar con Aluminior y probar el software aislado siguen siendo fases posteriores.

### Revisión independiente y cierre de fila y delegados

Revisión descontaminada mediante artefacto + contrato + evidencia cruda,
sin informes/razonamiento de autores ni campos narrativos de sus manifiestos.
`output/e1-rowkeys-20261017/review/REPORT.md`: ningún defecto reproducible de
candidato en el alcance estático/documental; ninguna corrección de candidato.
El gate propio pasa **917/917** con **51 predicados seleccionados** y
**53/53 perturbaciones propias rechazadas sin consultar el hash global**.
Lector PE/TypeLib/VB independiente, cotejo de capturas y herramienta de
desensamblado identificada por 58 hashes; no se ejecutan gates candidatos
desde la revisión. Los intentos fallidos de construcción del arnés se conservan.

El director reproduce los cinco comandos mediante
`python -B output/e1-rowkeys-20261017/director_gate.py --out director-final
--review-additive-receipts`. `director-final/gate.json` conserva comandos,
códigos y stdout/stderr literales. El gate independiente acepta únicamente
inserciones de recibos al final de esta sección y notas en el relevo autorizado,
preservando íntegro el texto revisado y registrando el delta literal. Comprueba
la base inicial como antepasado y el diff contra ella, para permitir también
reproducción postcommit sin forzar Git ni modificar las comprobaciones de fuentes.

Preservación final antes/después: índices **428/56/91/145** y seis árboles
completos **429/59/92/146/140/77** intactos por tamaño/SHA-256. Se conservan
sellos, recibos posteriores, los dos pyc históricos y capturas preliminares;
ningún índice previo regenerado ni verificador anterior ejecutado.
Barrido de 1.107 versionados: ocho Markdown cambiados y 1.099 intactos;
299 enlaces locales y 57 anclas válidos; `git diff --check` correcto.
El barrido de 119 Markdown para las frases de siguiente paso agotadas está
en `active-pointer-scan-corrected.json`, con su alcance limitado explícito.
La documentación de aquella entrega apuntaba a `gaVarios +0x48 / +0x4c`; los anclajes
anteriores quedan marcados como historia. No se retira evidencia única.

Los tres agentes terminaron y congelaron escrituras antes del commit.
July conserva el mismo E1 `aluminior` por sync_uid, historia e `in_progress`,
sin sincronización. Commit local tras gate e identidad de Sergio; sin push.
Sellado nuevo y recibos postcommit en `output/e1-rowkeys-20261017/`;
la evidencia privada no viaja por Git/July. Son verificaciones estáticas
parciales y solapadas, sin pruebas funcionales ni aceptación económica.

## Predicados internos de rellena

Unidad estática/documental del **17/10/2026**, desde
`5acc947f8a318abed614f79e3551bbaf4aad8c0b`, rama
`codex/rea-productor-20261016`, con árbol inicial limpio comprobado.
Contrato y evidencia privada nuevos en `output/e1-rellena-predicates-20261017/`.
Se reutiliza la identidad acreditada de gaVarios y el cuerpo de `rellena`;
no se reabren proveedor, `x_Clave`, `just` ni las unidades anteriores.

### Declaraciones y cuerpos vinculados

Se comprueban de nuevo tamaño y SHA-256 de `gaBBDD.dll`, `gaCodigoBase.dll`
y `msvbvm60.dll`: coinciden con las identidades de la unidad anterior.
En la interfaz propia `ac3c4874-c3a9-4bec-8637-3b79ceb84063` de
`gaCodigoBase.dll`, las declaraciones se enlazan por metadata y bytes:

| Slot y nombre declarado | Registro TypeLib | Celda → thunk → cuerpo, límite exclusivo |
|---|---|---|
| `+0x48`, `isletter` | `0x25380` | `0x11003f2c` → `0x11004047` → `0x1100d750–0x1100d92b` |
| `+0x4c`, `isdigit` | `0x253b0` | `0x11003f30` → `0x11004054` → `0x1100d930–0x1100dad7` |

Ambos declaran un parámetro BSTR por referencia `in/out` y una salida I2 por referencia
marcada `out/retval`; **no declaran retorno Boolean**. Los nombres identifican
las declaraciones, pero no se usan como prueba de las condiciones siguientes.

### Condiciones seguidas estáticamente

En las rutas ordinarias examinadas, cadena vacía produce I2 `0`. Para una
entrada no vacía, ambos solicitan al ordinal 631 el segmento de inicio `1`
y longitud Variant I2 `1`, y pasan el resultado al ordinal 516.
Llamando `C(s)` al resultado de esa conversión, interpretado como entero
con signo de 16 bits, los cuerpos expresan estos intervalos inclusivos:

| Predicado | Condición para escribir I2 `-1`; fuera de ella escribe `0` |
|---|---|
| `+0x48` | `C(A) ≤ C(segmento) ≤ C(Z)` o `C(a) ≤ C(segmento) ≤ C(z)` |
| `+0x4c` | `C(0) ≤ C(segmento) ≤ C(9)` |

Los seis extremos son BSTR literales que pasan por **el mismo convertidor**;
no se sustituyen por códigos numéricos supuestos. Las comparaciones son
`signed16`, con `setg/setl`, combinaciones OR/AND y normalización final a
`-1/0`. No equivalen a una clasificación Unicode universal ni prueban qué
ocurre con cada carácter no ASCII, sustitución de conversión o error.

El import de `gaCodigoBase` en IAT `0x11001038` enlaza al ordinal 516 de
`msvbvm60.dll`, export `rtcAnsiValueBstr` en VA preferida `0x6601d76d`.
Su ruta ordinaria llega a **`0x6601d79a`**, llamada por IAT **`0x660011ac`**
a `KERNEL32!WideCharToMultiByte`, con argumentos efectivos
`(0, 0, BSTR, 1, buffer, 2, 0, 0)`. Cuando el resultado es dos bytes,
el tramo `0x6608e50b` combina `(b0 << 8) + b1`; la otra ruta carga `b0`.
Ese camino no acredita que la conversión haya tenido éxito si retorna cero.
En aquella entrega el seguimiento quedó en esa frontera. Su contrato público y
enlace candidato se continúan en la [unidad WCTMB](#frontera-widechartomultibyte);
página de códigos y retorno efectivos siguen sin demostrar. No se ejecuta legado.

### Argumentos y efecto en rellena

Todas las direcciones `0x1100…` de esta tabla pertenecen a **gaCodigoBase.dll**,
dentro de `0x1100cfc0–0x1100d750`; las direcciones `0x660…` anteriores
pertenecen a **msvbvm60.dll**. No se mezclan sus bases preferidas.

| Llamada | Argumento efectivo y salida | Uso del resultado |
|---|---|---|
| `0x1100d17b`, `+0x4c` | Segmento de longitud `1` de la copia original, eventualmente truncada; BSTR en `ebp-0x34`, salida en `ebp-0xd0` | Se combina mediante OR con `+0x48` y las comparaciones con `*` y `-`; resultado no cero permite concatenar el carácter |
| `0x1100d1ae`, `+0x48` | Otro segmento de la misma posición de esa copia; BSTR en `ebp-0x38`, salida en `ebp-0xd4` | Participa en el mismo OR; `test di,di` y salto `0x1100d286` deciden si se concatena o se omite |
| `0x1100d38a`, `+0x48` | Segmento de longitud `1` de la cadena ya filtrada `ebp-0x20`; BSTR en `ebp-0x34`, salida en `ebp-0xd0` | OR con comparación `-` de la filtrada y `*` de la copia original/truncada; salto `0x1100d444` decide entre ruta de carácter y ruta de formato del resto |

La segunda fase conserva dos fuentes diferentes: en `0x1100d3bf` la
comparación con `*` usa `ebp-0x28`, mientras el predicado y la comparación
con `-` usan `ebp-0x20`. No se corrige esta diferencia por intuición ni se
presupone que ambas cadenas conservan posiciones equivalentes tras filtrar.
Las llamadas se someten a comprobación HRESULT; el I2 se consume aparte.

Esto precisa las ramas que dependen de los predicados, con ancho distinto
de cero y bajo sus rutas ordinarias. No convierte `rellena` en una operación
genérica de padding, no declara su transformación exacta para toda entrada
y no reabre el cuerpo del formateador. Permanecen conversiones externas,
errores, valores efectivos y premisas de equivalencia fila/consulta.

### Evidencia, verificación y continuación

El director reproduce `predicates/verify.py` en `predicates/director-initial/`:
**248/248 comprobaciones**, **73 predicados seleccionados / 320 anclajes**
y **66/66 perturbaciones rechazadas exclusivamente en memoria**, sin consultar
el hash global para decidir esos rechazos. Canónica:
`predicates/captured-final-v3/evidence.json`, **74 capturas**, diez de código
con **1.081 instrucciones**: 634 del llamador ya conocido, 298 de los dos
cuerpos, dos de los thunks y 147 de rutas runtime necesarias. No sumar estos
conjuntos a unidades anteriores ni convertir metadata o solapes en código nuevo.

Tres controles pasan los predicados seleccionados y fallan la comparación
completa de su captura cubriente: bit 0 de slot TypeLib enmascarado por `&~3`,
prólogo no seleccionado y NOP del llamador. La comprobación algebraica de
65.536 valores I2 utiliza umbrales sintéticos; no ejecuta ni emula el legado,
no observa caracteres reales y no demuestra página de códigos.

Se conserva el intento inicial **226/230**, provocado por colisión de nombres
de archivos A/a y Z/z en Windows, junto con su captura. También permanecen
la captura v2 y su **230/230**, y el error inicial al decodificar un nombre
TypeLib perturbado (`predicates/gate-final/error.txt`). El arnés final rechaza
esa metadata malformada; no son defectos funcionales de Productor. Ningún
resultado representa cobertura causal exhaustiva o prueba funcional.

Se conservan por tamaño/SHA-256 los cuatro índices de **428/56/91/145**
artefactos y los siete árboles completos de **429/59/92/146/140/77/127**
archivos. Incluyen índices, sellos, recibos posteriores y los dos pyc antiguos.
No se regeneran índices ni se ejecutan colectores/verificadores antiguos;
Python usa `-B` y las salidas son nuevas en esta unidad.

Se actualizan los ocho documentos activos, conservando evidencia e historia.
Los antiguos siguientes pasos de investigar `+0x48/+0x4c` quedan agotados.
Revisión independiente, reproducción final y cierre se registran en
`review/REPORT.md`, `director-final/gate.json` y `postcommit-receipt.json`
de la carpeta nueva. Los recibos posteriores al sello se enumeran sin
sobrescribirlo. La evidencia privada no viaja por Git ni July.

**Siguiente histórico de aquella entrega, agotado:** frontera WCTMB desde
`msvbvm60.dll 0x6601d79a`, continuada en la [unidad siguiente](#frontera-widechartomultibyte).
La nueva frontera son las lecturas `KernelBase.dll 0x10148768 / 0x1014876e`.
No repetir contrato/enlace, predicados, sus slots/cuerpos, proveedor, `just`,
`x_Clave` ni unidades previas.
**Después:** valores efectivos, equivalencia, agregados y persistencia.
E1 permanece `in_progress`, cargo desactivado; A–F/G1–G5/G6-incidencia
preservados. Completar contrato/implementación, comparar Aluminior y probar
software aislado siguen siendo fases posteriores, fuera de esta unidad.

## Frontera WideCharToMultiByte

Unidad estática/documental del **17/10/2026**, desde commit
`700c9136186583debf22e2f47ab5537af764ef2b`, rama `codex/rea-productor-20261016`,
árbol inicial limpio. Evidencia nueva en `output/e1-widechar-frontier-20261017/`.
Se reutilizan los predicados y la atribución del ordinal 516; no se repiten
proveedor, `just`, `x_Clave` ni las unidades anteriores.

### Contrato público y argumentos ya acreditados

La llamada de **msvbvm60.dll** en `0x6601d79a`, por IAT `0x660011ac`, declara
`KERNEL32!WideCharToMultiByte`. Sus ocho argumentos efectivos son
`(0, 0, BSTR, 1, ebp+0xa, 2, 0, 0)`, en el orden de la API.
La [constante oficial](https://learn.microsoft.com/en-us/windows/win32/intl/locale-idefault-constants)
vincula `0` con `CP_ACP`. No es una página numérica fija acreditada para Productor.

Según el [contrato de la API](https://learn.microsoft.com/en-us/windows/win32/api/stringapiset/nf-stringapiset-widechartomultibyte),
la longitud positiva procesa exactamente la entrada indicada, sin buscar su
terminador. Aquí se solicita una unidad UTF-16; no un grafema completo ni
un par de sustitutos. El tamaño de salida está en bytes; aquí hay capacidad dos y no
consulta previa de tamaño. Los flags cero no solicitan `WC_NO_BEST_FIT_CHARS`.
El carácter de sustitución nulo selecciona el predeterminado del sistema;
el último puntero nulo impide recibir el indicador de sustitución. Por ello
no queda acreditado que la conversión conserve el carácter original.
Éxito devuelve bytes escritos; fallo devuelve cero, incluido buffer insuficiente.
No se deduce contenido válido del buffer cuando falla.

Microsoft documenta también la posibilidad de [página UTF-8 por proceso](https://learn.microsoft.com/en-us/windows/apps/design/globalizing/use-utf8-code-page)
desde Windows 1903 mediante `activeCodePage`. Esta posibilidad contractual
no prueba manifiesto, versión, ACP ni entorno efectivo de Productor.
No se consultó el registro ni se ejecutó `GetACP` o una conversión.

### Enlace candidato en disco, con identidad por módulo

Además de las tres identidades PE anteriores, se fijan estas fuentes nuevas:

| Fuente | Bytes | SHA-256 |
|---|---:|---|
| `SysWOW64/kernel32.dll` | 707744 | `7f04765684de5ecb702afb5c4cfbfde12a4e61a125389ee23166aa66430e62f0` |
| `SysWOW64/KernelBase.dll` | 3007824 | `5be784046dc9731d1c36e872a8022065ed4a733707b1e467b30a96588714b137` |
| `System32/apisetschema.dll` | 204152 | `568c72f6216d83a716d6fa9bec59ae8d93e6728062d969ac362013f3910c0007` |

| Enlace seguido por bytes | Resultado estático |
|---|---|
| `kernel32.dll`, export 1603, RVA `0x1b310` | Thunk `0x1001b310–0x1001b31c`, límite exclusivo; salto por IAT `0x10081ad8` |
| Import de esa IAT | `api-ms-win-core-string-l1-1-0.dll!WideCharToMultiByte` |
| Entrada exacta del contrato en `.apiset`, esquema versión 6 | Un único valor de host: `kernelbase.dll` |
| `KernelBase.dll`, export 1971 | RVA `0x1486b0`, VA preferida `0x101486b0` |

Los dos PE de SysWOW64 son PE32/x86 y comparten base **preferida** `0x10000000`;
no se mezclan sus direcciones. El esquema de System32 es PE32+/AMD64 y sólo
se lee su metadata del contrato exacto. No se asume un archivo físico con
el nombre ApiSet ni un enlace directo a KernelBase por coincidencia de nombre.
Un [ApiSet identifica un contrato que resuelve el cargador](https://learn.microsoft.com/en-us/windows/win32/apiindex/windows-apisets).
El mapa conservado en disco acredita un candidato, **no el mapa ni los módulos
efectivamente cargados por un proceso Productor**.

### Selección acotada de CodePage cero y nueva frontera

En el candidato **KernelBase.dll**, los saltos seleccionados para argumento
`CodePage=0` alcanzan `0x10148764`. Después de la prueba de cero, se siguen:

| Instrucción | Dependencia leída |
|---|---|
| `0x10148768` | Carga ESI desde DWORD `0x10282d08`, RVA `0x282d08` |
| `0x1014876e` | Carga EDI desde DWORD `0x10284990`, RVA `0x284990` |
| `0x10148774` | Salta a `0x101487ef`; el seguimiento se detiene antes de su continuación |

La primera celda contiene el entero DWORD `65001` en el archivo.
La segunda cae dentro del tamaño virtual de `.data`, fuera de sus bytes raw.
No se fabrica una lectura de archivo para esa cola virtual. Ninguno de estos
hechos demuestra los valores después de carga e inicialización; tampoco
demuestran la página o tabla efectiva de Productor. No se siguen inicializadores,
tablas NLS, otras páginas ni otras ramas del selector en esta unidad.

### Consecuencia condicionada para el valor consumido

El código VB compara el retorno con dos. Si coincide, forma
`(b0 << 8) + b1`; en otro caso carga `b0`, también cuando la API retorna cero.
Ese tramo no consulta `GetLastError` ni separa fallo de éxito de un byte.
El buffer `ebp+0xa` se solapa con los dos bytes altos del argumento BSTR
almacenado en `ebp+8`; no hay inicialización independiente en la ruta capturada.
Esto no demuestra qué bytes deja una conversión fallida ni un resultado cero.

**Inferencia condicionada:** con éxito de un byte, los predicados reciben ese
byte; con éxito de dos, reciben la combinación anterior interpretada como I2
con signo. Sus extremos `A/Z/a/z/0/9` pasan por el mismo convertidor ya seguido.
Con fallo no puede fijarse su resultado desde el contrato público. La posible
aproximación o sustitución impide equiparar las bandas con una clasificación
del carácter Unicode original. Se conserva también la diferencia de fuentes
en la segunda fase de `rellena`, acreditada en la unidad anterior.

### Verificación, límites y continuidad

Capturas canónicas: `static/captured-final/evidence.json`; cinco rangos de
código, **204 bytes y 62 instrucciones**, dentro de 37 capturas que incluyen
metadata. No se suma este contexto reutilizado a la cobertura anterior.
Fuentes oficiales publicadas congeladas con URL, fecha, tamaño/SHA-256 y
HTML/texto derivado en `public/published/`; cuatro fuentes y 16 anclajes
literales. Su gate de **34/34** verifica procedencia e integridad, no semántica
de una implementación. Las descargas raw previas y el 404 del header quedan
como antecedentes; el HTML publicado es la fuente canónica de este cotejo.

El director reproduce `static/verify.py` en `static/director-initial/`: **206/206**,
**72 predicados** (45 instrucciones y 27 invariantes de metadata), **72/72
perturbaciones rechazadas**. Los tres controles de límite son los prólogos VB y
kernel32 y el factor hash ApiSet; pasan la selección parcial y cambian la captura
completa. No se acredita por ello toda la ruta del cargador.

Revisión independiente y reproducción final se registran en `review/` y
`director-final/gate.json`; la repetición
postcommit y el cierre en `director-postcommit/gate.json` y
`postcommit-receipt.json`. No se ejecuta código legacy ni pruebas funcionales.
Las perturbaciones se hacen sólo en memoria y su rechazo semántico no utiliza
el hash global. Los controles que pasan una selección parcial se cotejan
además contra la captura completa. No sumar filas de aserciones a cobertura.

Los intentos previos permanecen: preservación inicial **1149/1157**, por cotejar
blobs Git LF contra documentos sellados CRLF, corregida acreditando la conversión
de checkout; gate documental **1686/1687**, por reconocimiento léxico insuficiente
de una frase histórica, aclarada en el texto. No son fallos de Productor ni se
debilitan los verificadores para aceptarlos.

Los ocho árboles históricos completos conservan **429/59/92/146/140/77/127/374**
archivos y los cuatro índices **428/56/91/145**, incluidos pyc, sellos y recibos
posteriores. Se preservan los seis PE, el vendor original y los 1.099 archivos
versionados ajenos a esta documentación. Nuevo sello y recibos posteriores
en la carpeta nueva; ninguna evidencia privada se incorpora a Git o July.

**Antecedente histórico:** la continuación de esta unidad eran las escrituras
de las dos celdas. Se ha seguido en la [unidad de estado](#procedencia-del-estado-de-kernelbase)
posterior, que fija la nueva frontera. No repetir contrato WCTMB, enlace ApiSet,
predicados ni escrituras ya seguidas. Resolución/carga efectiva siguen abiertas.
**Después:** valores efectivos, equivalencia, agregados y persistencia.
E1 sigue `in_progress`, cargo desactivado y A–F/G1–G5/G6-incidencia preservados.
Completar contrato/implementación, comparar Aluminior y probar en entorno
aislado mantienen su orden como fases posteriores fuera de esta unidad.

## Procedencia del estado de KernelBase

Antecedente histórico; no ejecutar como lista de tareas. Su continuidad queda
en la [unidad del selector](#procedencia-del-byte-selector-de-kernelbase).

Unidad estática del **17/10/2026**, base `88f077f4a0646e0a66553599e78ee20297ab9ded`,
rama `codex/rea-productor-20261016`, árbol inicial limpio. Continúa exclusivamente
desde las lecturas `0x10148768 / 0x1014876e` de las celdas `0x10282d08 / 0x10284990`.
Evidencia privada nueva: `output/e1-kernelbase-state-20261017/`.
No se repiten WCTMB, ApiSet ni predicados y no se amplía a NLS global.

### Escrituras localizadas y alcance de la búsqueda

Fuente: `C:\Windows\SysWOW64\KernelBase.dll`, 3.007.824 bytes, SHA-256
`5be784046dc9731d1c36e872a8022065ed4a733707b1e467b30a96588714b137`.
Las direcciones son VA preferidas del PE32/x86 con base `0x10000000`.
No se ha cargado ni ejecutado esta DLL.

El barrido literal de todos los bytes del archivo encuentra **19** ocurrencias
de la dirección de la primera celda y **15** de la segunda. Las ventanas
desensambladas clasifican cuatro escrituras directas a la primera, tres a la
segunda y una transferencia de la dirección de la segunda a un helper.
Es exhaustivo para esos dos patrones de cuatro bytes, **no para alias,
direcciones calculadas, código alcanzable ni todas las escrituras posibles**.
Las ventanas fuera de los cuerpos principales no recuperan funciones completas.

| Celda | Escrituras directas localizadas | Procedencia seguida |
|---|---|---|
| `0x10282d08` | `0x1015c41d`, `0x1015c463`, `0x1015c46b` | Rutina escritora `0x1015c405`; constante 65001 o WORD leído del estado del proceso, según ramas |
| `0x10282d08` | `0x101ff19c` | Rutina `0x101ff172`; constante 65001 bajo condición |
| `0x10284990` | `0x1015c42f`, `0x1015c471` | Cero desde ESI inicializado con XOR |
| `0x10284990` | `0x101ff17f` | Puesta a cero mediante AND, bajo condición |
| Dirección de `0x10284990` | `0x1015c453` → llamada `0x1015c45a` | EDX entrega la dirección al helper `0x101fe820`; no es una escritura directa del llamador |

Se capturan llamadas directas candidatas en `0x1015c20e` y `0x101ff84c`
hacia esas dos rutinas. No se acredita un camino completo desde el entrypoint,
su orden de ejecución ni que hayan sido ejecutadas por Productor.

### Inicialización condicionada en la rutina escritora

En `0x1015c40e` se compara con cero el byte `0x102838ce`. ESI se ha puesto a
cero y EDI contiene `65001`. La tabla describe las escrituras visibles bajo
esas premisas; no afirma valores de un proceso observado.

| Condición en el tramo seguido | Resultado estático para las dos celdas |
|---|---|
| Byte distinto de cero | Escribe `65001` en la primera y cero en la segunda |
| Byte cero | Lee `FS:[0x30]` en `0x1015c43e` y extiende sin signo el WORD `+0x228` en `0x1015c448` |
| Ese WORD es `65001` | Salta sobre la llamada y las escrituras de este par; no fija de nuevo sus valores en ese tramo |
| Otro WORD y retorno del helper no negativo | Escribe el WORD extendido en la primera celda; la segunda depende del helper y del estado previo |
| Otro WORD y retorno negativo | Escribe el fallback `65001 / cero` |

La condición de `0x1015c461` es **JS después de TEST EAX,EAX**: compara signo,
no igualdad con cero. El helper contiene una salida con valor positivo **14**
en `0x101fe8cf / 0x101fe8d1`; ese valor no activaría el fallback del llamador.
Por tanto, «no negativo» no se traduce aquí en «puntero obtenido con éxito».
No se atribuye nombre semántico al campo `FS:[0x30]+0x228` ni al byte selector
sin evidencia adicional. Las otras celdas y el campo `+0x22a` se conservan
como contexto de la captura, fuera del seguimiento de esta unidad.

### Puntero delegado y segundo escritor

El helper `0x101fe820` guarda EDX en EDI y contiene escrituras por `[EDI]`.
Puede copiar una celda existente; también entrega ese destino a helpers
internos que no se expanden. Su cuerpo conserva llamadas y salidas con
dependencias sin resolver. La llamada indirecta `0x101fe93f`, por IAT
`0x1028c248`, declara **`ntdll.dll!NtGetNlsSectionPtr`** según descriptor,
lookup y nombre importados. La declaración no demuestra resolución del cargador,
resultado de esa llamada ni contenido del puntero. No se sigue ntdll ni se
interpretan tablas NLS. Tampoco se descartan efectos de los helpers no expandidos.

En la segunda rutina, `0x101ff172`, la comparación inicial de DWORD
`0x102848f8` con cero omite el cuerpo si vale cero. En la rama no nula se
pone a cero la segunda celda (`0x101ff17f`) y se escribe `65001` en la primera
(`0x101ff19c`). Esto acredita otra fuente condicionada de escrituras;
no demuestra cuándo ocurre ni el estado final tras sus llamadas restantes.

### Evidencia, verificación y límite de cierre

Captura canónica: `static/captured/evidence.json`, con identidad del PE,
offsets, bytes, instrucciones, referencias y metadata importada. Los seis
rangos principales suman **752 bytes y 233 instrucciones**. Las 34 ventanas
de referencias se solapan con esos rangos y no se suman como cobertura.
Los gates propios y del revisor se reproducen en carpetas nuevas; los recibos
con comandos y resultados están en `director-final/gate.json` y
`director-postcommit/gate.json`. La revisión independiente queda en `review/`.
Las perturbaciones semánticas se hacen en memoria, sin depender del hash global;
los controles de límite explicitan lo que no detecta la selección parcial.
No son pruebas funcionales del legado ni aceptación económica de E1.

Los **nueve árboles anteriores completos**, 429/59/92/146/140/77/127/374/189
archivos, se preservan por tamaño/SHA-256, incluidos índices, pyc históricos,
sellos y recibos posteriores. Los cuatro índices 428/56/91/145 no se regeneran.
Se cotejan seis PE, vendor, checkout original y los 1.099 versionados ajenos
a los ocho documentos. Las suites de producto anteriores conservan su fecha;
no se vuelven a presentar como ejecutadas en esta entrega documental.

**Antecedente histórico:** la procedencia del byte fue continuada en la
[unidad del selector](#procedencia-del-byte-selector-de-kernelbase). No repetir
las dos celdas, WCTMB, ApiSet o predicados ni ampliar a NLS global.
**Después:** campo `FS:[0x30]+0x228`, resultados del helper, resolución/carga,
conversión efectiva, equivalencia, escalas, agregados y persistencia.
E1 sigue `in_progress`, cargo desactivado y A–F/G1–G5/G6-incidencia preservados.
Contrato/implementación, contraste con Aluminior y pruebas aisladas permanecen
como bloques posteriores; esta unidad no los ejecuta ni los autoriza.

## Procedencia del byte selector de KernelBase

Unidad estática del **17/10/2026**, base `3dff26755b70a8d72e10fc2aaffbe23b1f94ced9`,
rama `codex/rea-productor-20261016`, árbol inicial limpio. Continúa exclusivamente
desde el byte `0x102838ce`, leído en `KernelBase.dll 0x1015c40e`.
Evidencia privada nueva: `output/e1-kernelbase-selector-20261017/`.

### Escritura del selector y alcance

Fuente: `C:\Windows\SysWOW64\KernelBase.dll`, 3.007.824 bytes, SHA-256
`5be784046dc9731d1c36e872a8022065ed4a733707b1e467b30a96588714b137`,
PE32/x86, base preferida `0x10000000`. Se buscan los cuatro octetos de la VA
literal del selector en todo el archivo y se clasifican las instrucciones
observadas: **18 coincidencias, 17 lecturas de byte y una escritura de byte**.
La escritura está en `0x1015b9b6` y almacena `1`; no se observa una escritura
literal de cero ni escape inmediato literal en ese conjunto. Esto no excluye
alias, direcciones calculadas, escrituras indirectas o más anchas solapadas,
ni acredita alcanzabilidad global, unicidad absoluta o ejecución.

El selector cae en la cola virtual de `.data`, sin bytes raw que correspondan
a su dirección. No se convierte esa ausencia en un valor inicial observado
ni en prueba de que Productor use cero o uno.

### Dependencia inmediata de la escritura

La ruta local capturada parte de `0x1015b8a5`. ESI recibe `FS:[0x30]` en
`0x1015b8bc`; el EDX de entrada se copia a EBX, luego a EAX, y EBX se pone a
cero. El despachador salta a `0x1015b9a8` cuando ese EDX de entrada vale `1`.
No se reconstruyen otras rutas o el ciclo de carga del módulo.

| Punto | Relación acreditada en esa ruta |
|---|---|
| `0x1015b9a8` | EAX recibe el puntero almacenado en `[ESI+0x10]` |
| `0x1015b9b1` | Compara el DWORD dinámico de `[EAX+8]` con EBX, que vale cero en la ruta seguida |
| `0x1015b9b4` | `JGE` omite la escritura cuando ese DWORD es no negativo como entero con signo |
| `0x1015b9b6` | Almacena `1` en el selector si el DWORD es negativo, condicionado a alcanzar el tramo por la ruta descrita |

El criterio es el signo del DWORD, equivalente a su bit 31 bajo esas premisas;
no es una prueba de cualquier valor distinto de cero. El salto conserva el
valor previo del selector; no escribe cero. No se atribuyen nombre de estructura,
nombre del campo, valor real o procedencia externa al DWORD ni al puntero.

Un call relativo candidato en `0x1015b819` apunta a `0x1015b8a5`. El tramo
capturado transmite ESI del llamador a EDX, pero no demuestra que ESI valga uno,
que exista un camino ejecutado desde el entrypoint ni el orden respecto a la
lectura posterior. Las direcciones son del mapa preferido del archivo.

### Evidencia, preservación y límites de verificación

Las capturas y sus bytes privados se conservan en `static/captured/`; el
contrato, baseline fijo, gates, revisión independiente y recibos del director
están en la carpeta nueva. Los gates de relaciones semánticas se acompañan
de perturbaciones en memoria y controles que miden sus límites. Sus conteos
son comprobaciones estáticas parciales y solapadas, nunca pruebas funcionales
de Productor ni porcentajes de paridad. El gate documental recorre el árbol
Markdown real y comprueba enlaces, anchors e instrucciones agotadas.

Se preservan los diez árboles completos **429/59/92/146/140/77/127/374/189/198**,
1.831 archivos, incluidos sellos y recibos posteriores. Los cuatro índices
428/56/91/145 no se regeneran. Se cotejan seis PE, vendor, checkout original
y los 1.099 versionados ajenos a los ocho documentos. Python siempre `-B`,
sin ejecutar/importar scripts históricos, cargar DLL objetivo o ejecutar legado.
Las pruebas de producto anteriores conservan su fecha; no se presentan como
reproducidas en esta entrega documental. Nuevo sello y recibos posteriores
registran el HEAD de cierre y el inventario final de esta unidad privada.

**Continuación histórica del 17/10, atendida en la unidad siguiente:** procedencia inmediata del **DWORD leído en `0x1015b9b1` (`[EAX+8]`)**,
con puntero tomado en **`0x1015b9a8` (`[ESI+0x10]`)** y ESI de `FS:[0x30]` en
`0x1015b8bc`. Acreditar identidad/origen inmediato del campo, deteniéndose
ante otra frontera. No repetir selector, dos celdas, WCTMB, ApiSet o predicados;
no NLS global. **Después:** campo `FS:[0x30]+0x228`, resultados del helper,
resolución/carga, conversión efectiva, equivalencia, escalas, agregados y persistencia.
E1 sigue `in_progress`, cargo desactivado y A–F/G1–G5/G6-incidencia preservados.

## Procedencia inmediata del DWORD de KernelBase

Unidad estática del **18/10/2026**, base `897226b7c71710ea3642e24e04e3829339c4ab8f`,
rama `codex/rea-productor-20261016`, árbol inicial limpio. Evidencia privada:
`output/e1-kernelbase-field-20261018/`. Continúa sólo la identidad y el origen
inmediato del DWORD de `0x1015b9b1`; no reabre el selector ni las unidades previas.

### Identidad acreditada y procedencia inmediata

El DWORD corresponde, en el layout x86 acreditado, al campo
**`_RTL_USER_PROCESS_PARAMETERS.Flags` en `+0x8`**, tipo `unsigned long`
(CodeView `T_ULONG`, `0x22`, 32 bits). Su origen inmediato es el bloque de
parámetros apuntado por `ProcessParameters` del PEB; no es una constante
leída del archivo de KernelBase ni un valor efectivo observado.

| Lectura en KernelBase | Identidad del layout x86 acreditado |
|---|---|
| `0x1015b8bc`: ESI recibe `FS:[0x30]` | `_TEB.ProcessEnvironmentBlock`, offset `0x30`, puntero de 32 bits a `_PEB` |
| `0x1015b9a8`: EAX recibe `[ESI+0x10]` | `_PEB.ProcessParameters`, offset `0x10`, puntero de 32 bits a `_RTL_USER_PROCESS_PARAMETERS` |
| `0x1015b9b1`: lee el DWORD de `[EAX+8]` | `_RTL_USER_PROCESS_PARAMETERS.Flags`, offset `0x8`, `T_ULONG` |

Los bytes y su mapa PE se cotejan de nuevo sólo para estas relaciones. El
vínculo x86 entre las lecturas FS y el TEB se apoya además en el header primario
Microsoft `winnt.h`, donde `NtReadCurrentTebUlong` usa `__readfsdword`.
La atribución combina esa convención con los registros de tipos y los operandos
capturados; no se deduce del parecido entre offsets o de nombres encontrados
como cadenas sueltas.

### Fuentes e identidad de símbolos

KernelBase es el mismo PE32/x86 de 3.007.824 bytes y SHA-256
`5be784046dc9731d1c36e872a8022065ed4a733707b1e467b30a96588714b137`.
Su versión de archivo es `10.0.26100.9711`. El PDB oficial `wkernelbase.pdb`,
identificado mediante RSDS, tiene el flujo TPI sin registros de tipos: **no
se le atribuyen las definiciones de las estructuras anteriores**.

Se lee como fuente auxiliar `C:\Windows\SysWOW64\ntdll.dll`, PE32/x86 de la
misma versión, 1.850.232 bytes, SHA-256
`23d7772221e7a763ccf3f3fe39592086eb3091603554c4981f0ab430fa2ca686`.
Su `wntdll.pdb` oficial contiene las definiciones completas y los enlaces de
tipo de la tabla. Se verifican GUID, edades y arquitectura de cada par PE/PDB,
por separado; la igualdad de versión por sí sola no sustituye ese vínculo.

| Par PE/PDB | GUID RSDS e Info coincidente | Edad PE / Info / DBI |
|---|---|---|
| KernelBase / wkernelbase | `9990A4CB-5207-9BA4-860B-1CB6584BC572` | `1 / 2 / 1` |
| ntdll / wntdll | `DBC4B305-3C0F-3189-895B-2BE009A0D2A4` | `1 / 4 / 1` |

La diferencia de edad Info se conserva expresamente. El [validador primario
de Microsoft](https://github.com/microsoft/microsoft-pdb/blob/805655a28bd8198004be2ac27e6e0290121a5e89/PDB/dbi/pdb.cpp#L848-L878)
permite Info mayor o igual que la edad de imagen y exige DBI igual a ella
salvo el caso histórico DBI cero; aquí DBI es `1` en ambos pares. No se cambia
una edad para hacer coincidir los símbolos. PDB, fuentes públicas, URLs,
hashes, registros CodeView y resultados quedan en la carpeta privada nueva.

El [contrato público de RTL_USER_PROCESS_PARAMETERS](https://learn.microsoft.com/en-us/windows/win32/api/winternl/ns-winternl-rtl_user_process_parameters)
reserva sus primeros 16 bytes y no publica ahí `Flags`; no sería suficiente
para atribuir ese nombre. El nombre y tipo se obtienen del PDB identificado.
La aplicación del layout a la lectura es una atribución estática de esta
arquitectura y versión, no una observación del proceso de Productor.

### Verificación y siguiente frontera

Gates propios, revisión independiente y reproducciones del director se guardan
en la unidad nueva. Las perturbaciones en memoria miden relaciones concretas
de bytes, tipos e identidad, con controles de sus límites; sus recuentos son
parciales y solapados, no pruebas funcionales ni porcentajes de paridad.
Se preservan once árboles históricos completos, **1.982 archivos** con conteos
429/59/92/146/140/77/127/374/189/198/151, incluidos sellos y recibos posteriores.
Cuatro índices, seis PE, vendor, checkout original y 1.099 versionados ajenos
a los ocho documentos permanecen protegidos; el PE auxiliar se coteja aparte.
Python siempre `-B`; no se ejecutan/importan scripts históricos. Las suites
anteriores de producto conservan su fecha y no se presentan como repetidas.

**Frontera histórica de esta unidad, continuada en [inicialización local de Flags](#inicialización-local-de-flags):** acreditar el **escritor o inicialización de
`_RTL_USER_PROCESS_PARAMETERS.Flags` (`+0x8`), en concreto el bit 31, antes
de la lectura en `KernelBase.dll 0x1015b9b1`**. Detenerse ante la siguiente
frontera. Esta unidad no acredita quién lo escribió, cuándo, su significado
semántico, valor efectivo ni ejecución de la ruta; no atribuye al bit una
política de idioma o página de códigos. No repetir identidad del campo,
selector, dos celdas, WCTMB, ApiSet o predicados; no ampliar a NLS global.
**Después:** campo `FS:[0x30]+0x228`, resultados del helper, resolución/carga,
conversión efectiva, equivalencia, escalas, agregados y persistencia.
E1 sigue `in_progress`, cargo desactivado y A–F/G1–G5/G6-incidencia preservados.


## Inicialización local de Flags

Unidad histórica: la continuación vigente está en [llamador externo y destinatario de Ex](#llamador-externo-y-destinatario-de-ex). Sus instrucciones siguientes se conservan como antecedente.

Unidad estática del **18/10/2026**, base `2b2158168da90185a7c1b1bd48a17f14b54d4ad7`,
rama `codex/rea-productor-20261016`, árbol inicial limpio. Evidencia nueva en
`output/e1-flags-writer-20261018/`. Continúa la búsqueda del escritor del campo;
no vuelve a atribuir su identidad ni reabre selector, celdas, WCTMB o predicados.

### Escritura local acreditada

En el ntdll x86 identificado, el símbolo público
**`_RtlCreateProcessParametersInternal@48`** identifica la entrada del candidato. En
**`0x4b2aa8f8`**, la instrucción escribe el DWORD de ECX en `[ESI+8]`.
En esa ventana, `0x4b2aa8de` pone ECX a cero y `0x4b2aa8e3` lo incrementa a
uno; no hay otra escritura intermedia a ECX. Por tanto, el valor escrito en
ese punto es **`1` y su bit 31 es `0`**. No es evidencia de un bit 31 a uno.

| Anclaje | Relación observada y límite |
|---|---|
| `0x4b2aa865` → `0x4b2aa86a` | Resultado EAX de la llamada identificada como `_RtlAllocateHeap@12` pasa a ESI; `test` y salto en `0x4b2aa86c/0x4b2aa86e` separan el retorno nulo |
| `0x4b2aa8c5`–`0x4b2aa8cd` | Se prepara una llamada identificada como `_memset` con ESI, cero y `0x2c8`; no se siguió el cuerpo del helper |
| `0x4b2aa8de` → `0x4b2aa8f8` | Cero, incremento y escritura DWORD en el offset `+0x8` del bloque construido; el layout Flags ya fue acreditado en la unidad anterior |
| `0x4b2aa69c` y `0x4b2aa9dc`–`0x4b2aa9df` | ECX de entrada se guarda en `[EBP-0x30]`; en la entrega local se recupera en EAX y se escribe ESI en `[EAX]` |
| Wrappers Ex y WithTemplate | `[EBP+8]` pasa a ECX en `0x4b39bb00` y `0x4b2aa676`, respectivamente; llamadas al interno en `0x4b39bb18` y `0x4b2aa679`. Sólo queda seguida esta transferencia, no un llamador externo efectivo |

La procedencia de ESI a través de llamadas se interpreta bajo el
[ABI x86 documentado por Microsoft](https://learn.microsoft.com/en-us/cpp/cpp/argument-passing-and-naming-conventions?view=msvc-170),
que preserva ESI en las convenciones ordinarias consideradas. Se separa esa
convención de los bytes observados; no se certifican cuerpos de helpers ni
todos sus efectos. El nombre decorado no se usa para inventar la posición de
un parámetro ni una convención concreta: se informa ECX de entrada porque
así se observa en el cuerpo.

### Identidad, alcance y límites

Se reutiliza como dato el PDB oficial ya preservado y se vuelve a cotejar el
par con ntdll: PE32/x86 `10.0.26100.9711`, 1.850.232 bytes, SHA-256
`23d7772221e7a763ccf3f3fe39592086eb3091603554c4981f0ab430fa2ca686`.
GUID `DBC4B305-3C0F-3189-895B-2BE009A0D2A4`, edades PE/Info/DBI `1/4/1`.
Las direcciones son del mapa estático de ese PE; no direcciones de un proceso
observado. Capturas, símbolos con posición, mapa de archivo y fuentes quedan
en la unidad nueva; no se ejecuta/importa ningún script histórico.

La búsqueda de patrones de escritura es dirigida y sus candidatos requieren
confirmación por instrucciones y flujo local. No encontrar una máscara directa
no descarta escrituras por registros, alias, llamadas, copias, otros módulos o
ramas no seguidas. No se afirma unicidad ni ausencia global de otros escritores.

**No está demostrada la conexión entre este bloque construido y el
`PEB.ProcessParameters` leído por KernelBase en `0x1015b9b1`.** Tampoco se
demuestra que esta inicialización ocurra antes de aquella lectura en una
ejecución concreta. El valor `1` corresponde sólo al instante de la escritura
acreditada, no al retorno, a modificaciones posteriores ni al estado efectivo
de Productor. El origen de un eventual bit 31 a uno sigue sin explicar.

### Verificación y siguiente frontera

Los gates nuevos cotejan identidades, bytes, relaciones locales y mutaciones
semánticas en memoria, con revisión independiente y reproducciones del director
antes/después del commit. Sus recuentos son parciales y solapados; no son
pruebas funcionales ni una medida de paridad. Se conservan los doce árboles
históricos completos: **2.205 archivos**, con conteos
429/59/92/146/140/77/127/374/189/198/151/223. Se cotejan cuatro índices, seis PE
históricos y ntdll auxiliar, vendor, checkout original y 1.099 versionados ajenos.
No se repiten ni se redatan las suites de producto anteriores.

**Frontera histórica, sustituida por la [unidad del llamador Ex](#llamador-externo-y-destinatario-de-ex):**
llamador externo y destinatario del primer argumento de
`_RtlCreateProcessParametersEx@44`, entrada `0x4b39baf0`.
El wrapper ya muestra `[EBP+8] → ECX` en `0x4b39bb00` y la llamada interna
`0x4b39bb18`; el interno entrega el puntero en `0x4b2aa9df`. La frontera es
el origen y uso de ese slot fuera del wrapper, para conectar, si la evidencia
lo permite, el bloque construido con `PEB.ProcessParameters` del consumidor.
Detenerse ante la siguiente dependencia. No repetir inicializador ni wrappers
Ex/WithTemplate, no seleccionar uno como ruta efectiva y no asumir identidad
entre el bloque construido y el objeto del PEB.

**Después:** valores efectivos y escritura de un eventual bit 31 a uno,
significado del bit, campo `FS:[0x30]+0x228`, resultados del helper, resolución,
conversión, equivalencia, escalas, agregados y persistencia. No ampliar a NLS global.
E1 permanece `in_progress`, cargo desactivado y A–F/G1–G5/G6-incidencia protegidos.
Sólo investigación/documentación, July local y commit local; sin push ni sincronización.


## Llamador externo y destinatario de Ex

Unidad estática del **18/10/2026**, base `d2dbe9bc92a64b061f1085e75d253883e8b24d9f`,
rama `codex/rea-productor-20261016`, árbol inicial limpio. Evidencia privada nueva
en `output/e1-processparameters-caller-20261018/`. Se continúa fuera del wrapper
Ex sin repetir inicialización de Flags, entrega interna, identidad del campo,
selector, celdas, WCTMB, ApiSet ni predicados.

### Llamador y destinatario local acreditados

En `ncryptprov.dll` x86, el símbolo público **`_CreateSecureProcessEx@28`**
identifica la entrada `0x1003d949`. La importación normal de `ntdll.dll`
identifica `RtlCreateProcessParametersEx` en la IAT `0x10068430`; el cuerpo
contiene la llamada indirecta a esa celda en **`0x1003da6a`**.
Es una referencia estática por importación: no prueba el contenido efectivo
de la IAT en una ejecución ni que esta función sea usada por Productor.

| Anclaje | Relación local observada |
|---|---|
| `0x1003da66` / `0x1003da69` | `lea eax,[ebp-0x64]` seguido de `push eax`: el primer argumento apunta a un slot local de salida |
| `0x1003da6a` | Llamada por IAT `0x10068430`, importación exacta `RtlCreateProcessParametersEx`; no confundir con WithTemplate |
| `0x1003da70` / `0x1003da72` | Prueba de EAX y salto por signo negativo a `0x1003d9f0`; la continuación local considerada es la no negativa, no una ejecución observada |
| `0x1003da78` / `0x1003da7e` / `0x1003da85` | Lee `[ESI+0x29c]`, recupera el puntero del slot `[EBP-0x64]` y escribe ECX en `[EAX+0x29c]`; no se atribuye nombre de campo ni valor efectivo a `+0x29c` |
| `0x1003dadf` / `0x1003db34` | Vuelve a leer `[EBP-0x64]` para un argumento de pila de una llamada por IAT `0x10068438`, importación `NtCreateUserProcess`; el orden de preparación lo sitúa en la posición novena |

La entrada del wrapper Ex y la entrega del interno se conservan como evidencia
de la unidad anterior. Esta unidad acredita el slot que proporciona este
llamador concreto. No demuestra que sea un llamador único, principal, efectivo
o perteneciente a la cadena de Productor que motivó E1.

Antes de Ex se observa la lectura `FS:[0x30]` y `[EAX+0x10]` en
`0x1003da4a/0x1003da56`; tras el retorno no negativo se copia el DWORD de
`+0x29c` hacia el bloque leído del slot. Esa dirección de copia no demuestra
que el bloque construido sustituya `PEB.ProcessParameters`.

### Procedencia y límites de la prueba

PE adicional: `C:\Windows\SysWOW64\ncryptprov.dll`, PE32/x86, 446.976 bytes,
SHA-256 `aa6ad34237d26a251aa3af2f906ebcee1e7b782cf0c606f0dad7ff0e9592d2bc`.
PDB oficial nuevo `ncryptprov.pdb`, SHA-256
`ca03f0f009c81a8e7f8a4b263575b6e236ea12f39856f9918d4680cc8d09d14e`,
GUID `E3588125-D07C-76B9-E4D6-27CC82EA8F04`, edades PE/Info/DBI **1/2/1**.
La diferencia de edad Info se declara; no se presenta una igualdad inexistente.
URL, respuesta y bytes descargados, mapa PE, importaciones y registros de
símbolos quedan en la evidencia privada. Las direcciones son del mapa estático,
no direcciones de un proceso observado.

La localización emplea un sondeo no recursivo del nombre exacto en DLL/EXE de
SysWOW64, con inventario de los archivos realmente recorridos y sus hashes.
Una coincidencia literal sólo sirve para seleccionar un candidato: la llamada
se acredita aparte mediante importación, instrucciones alineadas y símbolo.
El alcance excluye otros árboles, resolución dinámica y otras arquitecturas;
los negativos no prueban ausencia global. La llamada de KernelBase localizada
en el sondeo importa WithTemplate, por lo que no se usa como prueba de Ex.
Se conservan las sondas y errores previos del parser como evidencia no canónica.

Entre el uso local de salida y la lectura para la llamada siguiente hay un
helper en **`0x1003da93` → `0x100292cc`**, cuyo cuerpo no se sigue.
La prueba demuestra que se vuelve a leer el mismo slot, **no que su contenido
permanezca inalterado a través de llamadas o alias**. Tampoco acredita efectos
de helpers, éxito de la operación siguiente, identidad con el PEB consumidor,
orden anterior a `KernelBase 0x1015b9b1`, estado efectivo o escritura del bit 31
a uno. No asigna significado a ese bit ni implementa comportamiento económico.

### Verificación y siguiente frontera

Gates propios y revisión independiente contrastan identidades, importaciones,
bytes, posiciones de pila y relaciones locales; las mutaciones se aplican sólo
en memoria. Sus recuentos son parciales y solapados, no tests funcionales ni
porcentaje de paridad. El director reproduce los gates antes y después del
commit, con BASE fija. Los registros de cada ejecución conservan resultados
y límites; los intentos fallidos no se borran.

Se preservan trece árboles históricos completos, **2.474 archivos**:
429/59/92/146/140/77/127/374/189/198/151/223/269. Se cotejan inventarios,
cuatro índices, sellos y recibos posteriores, seis PE históricos, ntdll,
vendor, checkout original y trabajo ajeno. Las identidades del PE/PDB nuevo
se cotejan en sus gates; el PDB y las capturas entran en el inventario final.
Ocho documentos existentes reciben el siguiente
paso; no se repiten ni se redatan las suites de producto anteriores.

**Frontera técnica archivada (no continuar):** la llamada importada a **`NtCreateUserProcess` en
`0x1003db34`**, IAT `0x10068438`, y el alcance del noveno argumento preparado
desde `[EBP-0x64]` en `0x1003dadf`. Su cuerpo y destino externo no se siguen
en esta unidad. La continuidad del contenido tras el helper intermedio sigue
siendo un límite explícito, y cualquier conexión con el PEB leído por KernelBase
requiere evidencia propia. No seleccionar este llamador como ruta de Productor.
No repetir la búsqueda de Ex, su caller, el uso local de salida ni los wrappers.

**Después:** pertinencia para el consumidor, continuidad entre objetos, estado
efectivo, eventual bit 31 a uno, campo `FS:[0x30]+0x228`, helpers, equivalencia,
escalas, agregados y persistencia. No ampliar a NLS global ni lógica criptográfica.
E1 abierto, cargo desactivado y A–F/G1–G5/G6-incidencia protegidos. Sólo
investigación/documentación, July local y commit local, sin push ni sincronización.
