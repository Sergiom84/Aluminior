# E1: contrato físico y selección condicional

13/10/2026. Entrega local parcial del [encargo ClonerSoft](ENCARGO-IMPLEMENTACION-CLONERSOFT-2026-10-13.md).
La identidad y el estado global siguen en [E1 del roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
El cargo de cabecera continúa abierto. Este contrato no acredita fabricación,
aceptación Productor, publicación ni producción.

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
las líneas». La continuación del 14/10 recuperó los wrappers; ahora falta seguir
su despacho y consumidor: qué filas selecciona, qué base usa, cómo intervienen
descuentos/cantidades y dónde retira el cargo anterior, redondea y persiste.
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
`0x019bc960`. Es una inferencia de mapeo VB6 pendiente de confirmar;
no se transforma en llamador comercial ni en regla de cálculo.
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

Siguiente exacto: población y tipos efectivos de los receptores `this+0x88/+0x8c`,
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
