# E1: contrato físico y selección condicional

13/10/2026. Entrega local parcial del [encargo ClonerSoft](ENCARGO-IMPLEMENTACION-CLONERSOFT-2026-10-13.md).
La identidad y el estado global siguen en [E1 del roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
El cargo de cabecera continúa abierto. Este contrato no acredita fabricación,
aceptación Productor, publicación ni producción.
La continuación vigente del 17/10 está en [Proveedor de configuración y argumento 2](#proveedor-de-configuración-y-argumento-2);
las unidades del 13/10 y 14/10 siguientes conservan su evidencia y fecha.

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

| Requisito | Acreditado estáticamente | Pendiente para aceptación monetaria |
|---|---|---|
| Filas comerciales | Reparto por documento, contenedores a cero, metraje distinto de cero y `GastosIndSN` verdadero; saltos específicos de compacto/mosquitera | El filtro booleano no significa «es GI»; faltan filas efectivas y contrato completo de agregados |
| Base bruta/neta | `VPRES` usa `Subtotal`; el denominador suma subtotales con exclusiones y resta dos descuentos documentales calculados por separado | No reducir todas las rutas a una etiqueta bruto/neto; conservar configuración y formato de cada operación |
| Cantidades | Reparto sobre importes valorados; precio reconstruido dividiendo por `Metraje`; GI propio con cantidad y metraje uno | La formación de los agregados comerciales y cantidades incorporadas no queda certificada; el censo directo no excluye lecturas indirectas |
| Descuentos | Dos descuentos sucesivos de línea bajo su bandera; descuento de cliente de despunte precargado en una ruta propia; totales con `DtoPPsNeto` | Valores efectivos, extremos y enlace de todos los descuentos con los importes de entrada |
| Sustitución anterior | Lee cargo anterior, reconstruye desde subtotal más cargo nuevo y reemplaza `GastosIndirectos`; procesa también nuevo ratio cero cuando había cargo | Idempotencia con la política real de formato, duplicados preexistentes y rutas de error |
| Doble cómputo | En INS/CST resta venta GI del numerador; REP marca el GI oculto con `nEstr=-1`, excluido por el filtro de contenedores cero, bajo retorno ordinario válido | Exclusión integral de componentes/agregados, todos los modos/errores y representación de Aluminior |
| Redondeo | Escalas diferenciadas de precio, línea, base y total; flujo configuración → formato → conversión → escritura | Valores configurados y contrato exacto de formato/empates/localización; no asumir céntimos ni mayor resto |
| Escritura | Setters de importes, precio, descuentos y gasto indirecto; reutilización/alta del GI y llamadas `update/edUpdate` | Resultado efectivo, atomicidad, rollback y persistencia durable no observados |

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

**Siguiente unidad estática:** procedencia y precedencia de la configuración
que puebla la lista/índice consultado. Entrada acotada:
`gaConfigDAL.AbreRS`, slot `+0x1c`, celda `0x11007d58` → thunk `0x11007dc0`
→ cuerpo `0x110615d0`. El cuerpo del buscador `dimeIdxClave` conserva una
frontera de compatibilidad nativa/TypeLib antes de asignarlo. No reabrir
`Carga`, el argumento `2`, máscaras/helpers/650 o las unidades previas.
Demostrar valores efectivos exige además procedencia y estado de configuración;
esta unidad no autoriza leer bases de negocio. Agregados y persistencia conservan
su unidad propia. El ensayo matemático de Automation requiere autorización aislada.

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
