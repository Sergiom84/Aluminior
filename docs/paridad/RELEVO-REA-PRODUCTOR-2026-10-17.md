# Relevo de investigación Productor y comparación con Aluminior

Preparado el 17/10/2026 para continuar en otra conversación sin repetir la
investigación del 16/10. El trabajo entregado es investigación estática y
documentación; las brechas encontradas todavía no son nuevas funcionalidades.
El siguiente trabajo de producto sigue siendo E1 económico según el roadmap.

**Continuación del 17/10, posterior a este relevo inicial:** la
[unidad de formato](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contrato-de-formato-varformat)
acredita máscaras/Variant/cadena de conversión y contrato público, con límites
de empates y localización efectiva aún abiertos. La [unidad posterior de configuración](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#proveedor-de-configuración-y-argumento-2)
identifica `gaConfigDAL.Carga` y prueba el fallback condicionado del BSTR `2`;
no demuestra escalas efectivas iguales a dos. La [unidad de procedencia](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-y-precedencia-del-índice-de-configuración)
sigue AbreRS, consulta y carga de lista con índice NombreDato. La [unidad del índice](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#configuración-construcción-y-selección-del-índice)
sigue configuración/construcción, partición/intercambio y selección de posición
ante igualdad; no demuestra prioridad primera/última ni equivalencia de claves.
La [continuación de claves](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves)
sigue inicializador del comparador y bifurcación del normalizador; no repetirlos.
La [unidad de fila y delegados](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#clave-de-fila-y-transformaciones-del-índice)
atribuye `_gaLstItem.x_Clave +0x38` al cuerpo `0x11074c00` por metadata propia
y sigue proveedor/slots/cuerpos de transformación. La [unidad de predicados](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena)
acredita `+0x48/+0x4c`, sus condiciones y efecto en ramas. La [frontera WCTMB](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte)
acredita contrato público y enlace candidato ApiSet. La [procedencia del estado](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-estado-de-kernelbase)
acredita escrituras y fallback condicionados de las dos celdas. Siguiente:
procedencia inmediata del byte `0x102838ce`, leído en `KernelBase.dll 0x1015c40e`.
Estado efectivo, campo `FS:[0x30]+0x228` y resultados del helper siguen abiertos.
No repetir escrituras de las dos celdas, contrato/enlace ni predicados.
Equivalencia, colación y valores efectivos permanecen abiertos; no repetir cuerpos.
No repetir `xConfig`,
construcción, ordenación, búsqueda,
AbreRS/carga, proveedor/argumento `2` ni máscaras/helpers/650. Evidencias nuevas en
`output/e1-config-origin-20261017/`, `output/e1-index-20261017/` y
`output/e1-keys-20261017/` y `output/e1-rowkeys-20261017/`; los cuatro índices
anteriores, 428, 56, 91 y 145 artefactos, conservan tamaño y SHA-256.
El alcance estático, cargo desactivado y protección de G6 siguen vigentes.

## Última unidad estática: procedencia del estado de KernelBase, 17/10

Base comprobada `88f077f4a0646e0a66553599e78ee20297ab9ded`, misma rama exclusiva,
árbol inicial limpio. Ocho documentos propios y evidencia privada nueva en
`output/e1-kernelbase-state-20261017/`. La [unidad de estado](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-estado-de-kernelbase)
acredita escrituras directas, entrega del puntero al helper y fallback condicionado.
La prueba de retorno es de signo; el valor positivo 14 no selecciona el fallback.
No acredita inicialización ejecutada, página de códigos ni conversión efectivas.

Siguiente unidad única: **procedencia inmediata del byte `0x102838ce`, leído
en `KernelBase.dll 0x1015c40e`**. Acreditar su escritor y dependencia inmediata;
detenerse ante otra frontera. Campo `FS:[0x30]+0x228`, resultados del helper,
carga efectiva y equivalencia permanecen pendientes por separado. No repetir
las escrituras de las dos celdas, WCTMB, ApiSet o predicados; no NLS global.

Para continuar en otra conversación:

1. Usar exclusivamente el workdir `C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior`.
   Verificar Git en sólo lectura; rama `codex/rea-productor-20261016`. El HEAD
   de cierre consta en `output/e1-kernelbase-state-20261017/postcommit-receipt.json`.
   Una diferencia exige inspección, nunca reset/checkout/stash para encajarla.
2. Leer AGENTS, estado, roadmap, este relevo y la sección de estado enlazada.
   Leer `CONTRATO.md`, `static/captured/evidence.json`, `review/REPORT.md`,
   gates del director, sello y recibos postcommit de esta unidad.
3. Proteger los nueve árboles anteriores **429/59/92/146/140/77/127/374/189**
   y también el árbol completo de esta entrega, incluidos recibos posteriores
   al sello; el último recibo contiene su inventario final. Crear carpeta nueva.
   No ejecutar/importar scripts históricos ni regenerar sus cuatro índices.
4. Cotejar los seis PE por tamaño/SHA-256 contra manifiestos. ApiSet está en
   System32 y los otros cinco en SysWOW64. Python siempre `-B`; vendor sólo
   lectura y checkout original protegido. No cargar DLL objetivo ni ejecutar legado.
5. Declarar contrato; máximo dos subagentes, propietario único de helpers,
   revisión descontaminada, una corrección máxima y gates reproducidos.
   Congelar ejecutores antes de staging/commit y verificar identidad Sergio.
6. Actualizar estos mismos ocho documentos y el E1 July único por proyecto
   `aluminior` y sync_uid `398049fbd618069e36bb84bab37913ed`, manteniendo historia
   e `in_progress`; lectura posterior exacta, sin sincronizar. ID local no transferible.

Sólo investigación estática/documentación y commit local sin push. E1 abierto,
cargo desactivado y A–F/G1–G5/G6-incidencia preservados. Quedan cuatro bloques
prácticos de E1: investigación pendiente, contrato/implementación, contraste con
Aluminior y pruebas aisladas. No hay un número fijo de lotes estáticos restantes.
El roadmap conserva once frentes económicos abiertos E1–E11 y su orden.

## Antecedente histórico: frontera WCTMB, 17/10

Histórico; no ejecutar como lista de tareas. La continuidad vigente está en
la unidad de estado de KernelBase anterior; sus escrituras ya están seguidas.

Base comprobada `700c9136186583debf22e2f47ab5537af764ef2b`, rama exclusiva
`codex/rea-productor-20261016`, árbol inicial limpio. La entrega sólo cambia
ocho documentos y evidencia privada en `output/e1-widechar-frontier-20261017/`.
Contrato público, enlace candidato kernel32 → ApiSet → KernelBase y selección
acotada para argumento cero acreditados. Un valor de archivo `65001` no
demuestra ACP efectivo; la otra celda carece de bytes raw. No ejecutar legado.

Siguiente unidad única: **procedencia e inicialización del estado leído en
KernelBase.dll `0x10148768 / 0x1014876e`, celdas `0x10282d08 / 0x10284990`**.
Acreditar primero escrituras/inicializadores concretos; mantener pendiente
resolución y carga efectiva y detenerse ante otra frontera. No análisis global
NLS ni repetición del contrato WCTMB, enlace ApiSet o predicados.

Para continuar en otra conversación:

1. Usar explícitamente el workdir `C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior`
   en cada comando. Verificar status, rama y HEAD de sólo lectura; el HEAD de
   cierre consta en `output/e1-widechar-frontier-20261017/postcommit-receipt.json`.
   Una diferencia exige inspección, nunca reset/checkout/stash para encajarla.
2. Leer AGENTS, ESTADO-ACTUAL, roadmap, esta entrega y la sección
   [Frontera WideCharToMultiByte](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte).
   Leer contrato, `static/captured-final/evidence.json`, `public/published/sources.json`,
   `review/REPORT.md`, gates finales, sello y recibo postcommit de la unidad.
3. Preservar los ocho árboles anteriores **429/59/92/146/140/77/127/374** y
   también el árbol completo de esta entrega, incluidos recibos posteriores al
   sello. Su inventario final consta en el recibo. No ejecutar scripts históricos,
   regenerar índices ni escribir allí. Crear otra carpeta de salida nueva.
4. Verificar tamaño/SHA-256 de los seis PE contra los manifiestos. El esquema
   ApiSet está en System32, los otros cinco en SysWOW64; no confundir módulos,
   bases preferidas ni mapa de archivo con estado cargado. Python siempre `-B`;
   vendor existente sólo leído, checkout original protegido.
5. Declarar contrato; máximo dos subagentes, propietario único de helpers,
   revisión descontaminada, una corrección máxima y gates realmente reproducidos.
   Congelar ejecutores antes de staging/commit y verificar identidad Sergio.
6. Actualizar los mismos ocho documentos y el E1 July por proyecto `aluminior`
   y sync_uid `398049fbd618069e36bb84bab37913ed`, único, con historia e `in_progress`.
   ID local no transferible. Lectura posterior exacta, sin sincronizar.

Sólo investigación estática/documentación y commit local sin push. No producto,
COM, DLL cargadas, SQL, bases de negocio, licencias, migraciones o despliegues.
E1 abierto, cargo desactivado y A–F/G1–G5/G6-incidencia preservados. Después:
completar contrato/implementación, comparar Aluminior y probar aislado, por ese orden.

## Antecedente histórico: predicados de rellena, 17/10

Base inicial comprobada `5acc947f8a318abed614f79e3551bbaf4aad8c0b`, misma
rama y árbol limpio. Evidencia nueva exclusivamente en
`output/e1-rellena-predicates-20261017/`; contrato, capturas canónicas, gates,
revisión independiente y recibos de cierre se guardan allí. Los siete árboles
previos completos **429/59/92/146/140/77/127** y los índices **428/56/91/145**
se conservan por tamaño y SHA-256, incluidos recibos posteriores y pyc antiguos.
No ejecutar sus colectores/verificadores ni regenerar índices.

Declaraciones `+0x48/+0x4c`, thunks y cuerpos enlazados; I2 `-1/0` condicionado
por intervalos sobre la conversión signed16 del primer segmento. La segunda
fase de `rellena` conserva una comparación con `*` de la cadena original y
las otras condiciones de la filtrada; no asumir posiciones equivalentes.
En aquella entrega, el siguiente paso era WCTMB desde `msvbvm60.dll 0x6601d79a`, agotado
en la [unidad posterior](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte).
La continuación vigente son las dos lecturas de estado de KernelBase indicadas arriba.
No repetir predicados ni proclamar transformación exacta, equivalencia,
colación, RED, backend o persistencia.

Ocho documentos actualizados; historia y evidencia única conservadas. Mismo
E1 July por proyecto/sync_uid, `in_progress`, sin sincronización. Cierre local
autoriza sólo documentación propia tras gates e identidad Git; sin push.
El sello y los recibos posteriores se registran en la carpeta nueva, fuera
de los siete árboles protegidos. E1 económico permanece abierto y G6 protegido.

## Encargo para la nueva conversación

Actúa como arquitecto de Aluminior y continúa desde el estado descrito aquí.
Trabaja en el worktree existente, conserva originales y cambios ajenos y usa
como máximo dos subagentes simultáneos por lotes independientes. Entrega cada
unidad con contrato, evidencia ejecutada y revisión independiente; máximo dos
rondas. No necesitas crear otra conversación para coordinar a los ejecutores.

Empieza por verificar Git y disponibilidad de evidencias, leer los documentos
indicados y elegir la menor unidad pendiente de E1. La continuación autorizada
conserva el alcance estático/documental: no presupone permiso para ejecutar
Productor, abrir bases activas, activar cargos, cambiar producto, migrar o desplegar.
No empieces ampliando stock o rehaciendo el optimizador por la mera presencia
de contratos en los binarios. El orden de producto pertenece al roadmap.

## Rutas y situación Git

| Recurso | Ruta o identidad |
|---|---|
| Worktree de esta investigación | `C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior` |
| Rama de investigación | `codex/rea-productor-20261016` |
| Commit de investigación | `06b46737709b42f7bedd69b6920097173d4ac59a` |
| Base de código de Aluminior | `307bf54` |
| Checkout original protegido | `C:\Users\sergi\Desktop\Aplicaciones\Aluminior`, rama `codex/integracion-windows-mac-20261013` |
| Árbol físico Productor | `C:\Users\sergi\Desktop\MIX\Productor\Aluminio` |
| Alias y ejecutable indicado | `C:\Productor\Aluminio\aluminioApp.exe` |
| Evidencia privada de esta investigación | `C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior\output\rea-productor-20261016` |
| Evidencia previa de Aluminior | `C:\Users\sergi\Desktop\Aplicaciones\Aluminior\output\clonersoft-20261013` y `output\clonersoft-implementacion-20261013` |
| Relevo previo de Dudas | `C:\Users\sergi\Desktop\Aplicaciones\Dudas\notas\RELEVO-PRODUCTOR-INGENIERIA-INVERSA-2026-10-16.md` |
| Evidencias y muestras de Dudas | `C:\Users\sergi\Desktop\Aplicaciones\Dudas\pruebas\productor-extraccion-20261016` |

El 17/10, antes de escribir este relevo, ambos árboles estaban limpios: el
original seguía en `307bf54` y el worktree en `06b4673`. Este relevo añade
documentación en un commit posterior; comprobar que `06b4673` es antepasado,
no exigir que siga siendo HEAD. No hacer reset, stash, checkout ni merge para
forzar esos valores si han aparecido cambios nuevos. No se hizo push ni despliegue.

La unidad posterior de configuración empezó en `1bb9b29`, misma rama y árbol
limpio, comprobados directamente. La unidad de procedencia parte de `18accbc`,
misma rama y árbol limpio comprobados el 17/10, sin forzar ningún valor Git. Su documentación y evidencias nuevas se
conservan en este worktree; los commits y resultados anteriores mantienen su fecha.

La unidad del índice parte de `a060a09854e77662fd2014ed35abf62498fdf01a`, misma
rama y árbol inicial limpio comprobados. No fuerza esa identidad ni altera WIP.
Su contrato y capturas nuevas están en `output/e1-index-20261017/`; sigue siendo
investigación estática/documental, sin pruebas funcionales del legado.

`C:\Productor\Aluminio` es una junction al árbol MIX anterior: no son dos
instalaciones ni dos muestras independientes. Todas las escrituras de la nueva
unidad deben dirigirse al worktree, aunque la conversación arranque en el
checkout original. Indicar `workdir` explícito o usar rutas absolutas.

## Lectura inicial en orden

1. `AGENTS.md` del worktree y sus instrucciones aplicables.
2. [Estado actual](../ESTADO-ACTUAL.md) y [roadmap operativo](../../ROADMAP-PARIDAD-PRODUCTOR.md).
3. [Informe REA del 16/10](INVESTIGACION-REA-PRODUCTOR-2026-10-16.md).
4. [Comparación de 35 capacidades](COMPARACION-REA-PRODUCTOR-2026-10-16.md).
5. [Contrato y continuación E1](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#control-reparto-y-totales).
6. [Extracción diferencial anterior](EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md), solo para la frontera seleccionada.

Leer `ARQUITECTURA.md` antes de proponer lógica de dominio. Consultar July
para decisiones o punteros que requiera la unidad, sin suponer que conserva
los binarios privados. El [índice](../INDICE-DOCUMENTACION.md) localiza los
antecedentes. Sus listas fechadas no sustituyen al roadmap vigente.

## Trabajo realizado y evidencia

Dos ejecutores investigaron instalación y código gestionado; el arquitecto
contrastó Aluminior, hizo el ensayo nativo acotado y reprodujo verificaciones.
Un revisor independiente ejecutó los verificadores y no encontró defectos
reproducibles dentro de su alcance. No se modificó ningún paquete de producto.

| Unidad completada | Resultado del 16/10 | Qué permite afirmar |
|---|---|---|
| Aislamiento | Worktree y rama separados desde `307bf54` | El checkout original conserva su código y rama |
| Instalación | 211.522 archivos, 404 directorios, 26.028.233.665 bytes lógicos, 16 enlaces excluidos y cero errores | Inventario de metadatos, no lectura semántica de todo el árbol |
| Lecturas seleccionadas | 1.205 archivos, 185.871.317 bytes, incluidos antecedentes/manual | Hashes de esas lecturas; no hash completo de BMP, MDB o CSV de negocio |
| Informes y comprimidos | 303 RPT, 298 hashes únicos; 26 ZIP y 1.166 entradas | RPT son contenedores OLE; ZIP solo directorio central/cola, no sus datos empresariales |
| Configuración y manual | 95 INI/CONFIG/SVC, 48 hashes; reutilizados 664 HTML del CHM | Claves/valores neutrales y documentación; secretos y destinos omitidos |
| Fuente VB6 | Dos copias idénticas de `alContacto.cls`, 730 bytes y ocho campos públicos | Fragmento fuente, sin métodos de negocio ni proyecto recompilable |
| Interfaces de servicios | Operations, Produccion, Stock y eAlbaranes en configuración WCF | Declaraciones, no servicios activos o utilizados |
| Assemblies .NET | 123 identidades y metadatos canónicos completos, hashes coincidentes | Inventario raíz; incluye terceros y no equivale a funcionalidad recuperada |
| Métodos seleccionados | 564 declaraciones nuevas, 558 cuerpos; segundo cotejo de 473 nuevos y 243 Cut1D previos | 716 cuerpos cotejados, 66.669 bytes IL, 26.524 instrucciones y 26 contratos detallados |
| Cobertura que no tiene segundo cotejo | 85 cuerpos nuevos de Dominio/Informes | Evidencia canónica REA guardada, sin segunda verificación propia de bytes/opcodes |
| Fronteras nativas | 47 assemblies seleccionados: cero P/Invoke y 826 declaraciones runtime-provided | Declaraciones, no 826 cuerpos nativos ni ausencia global de COM |
| Análisis nativo | Pseudocódigo de un candidato: 7.852 bytes en cuatro rangos y 2.586 instrucciones | Representación parcial con advertencias; no fuente original ni equivalencia |
| Aluminior | 641 TS/TSX, 60 pgTable, 17 páginas dashboard y matriz de 35 capacidades | Código/contratos presentes y brechas acotadas; no aceptación runtime completa |

La ampliación desde los 2.651 archivos inventariados el 13/10 se explica por
exclusiones diferentes de copias, anuales y temporales. No representa crecimiento
funcional. El esquema de `Anterior.mdb` —995 tablas y 204 pobladas— procede de
JSON anterior: no se reabrió la MDB ni se midió el estado vivo de la empresa.

## Hallazgos que se deben reutilizar

**Corte:** camino estático `ProxyCOM → ProduccionNet → Cut1D`, con opciones de
barras/retales, despunte inicial/final, grosor y resto mínimo/máximo. El coste
observado pondera longitud, coste unitario y cantidad; su porcentaje usa longitud
efectiva. En Aluminior, `packages/core/src/produccion/optimizar.ts` usa FFD con
una longitud por llamada y kerf. La capa de producción también prepara parámetros:
no atribuir toda la diferencia de la API pura a ausencia global de saneamiento.

**Compras y stock:** el IL de `CalculaMetrajePropuestaYPedir` combina necesidad
y compromisos, resta stock y entradas previstas, aplica máximo con cero,
redondeo configurado, mínimo y después máximo; calcula kg mediante el peso.
La disponibilidad de otros almacenes depende de un parámetro.
`MetrajeStockCalculador` pasa `NoMultiplosMinimos=true` al cálculo delegado.
Son contratos estáticos que todavía requieren casos y configuración efectiva.

**Coste dimensional:** las cadenas de `gaProductorCosteMed.exe` describen coste
medio y actualización de documentos. No se ha identificado por ellas el selector
de coste dimensional. No reutilizar automáticamente el selector de PVP.

**Interoperabilidad:** declaraciones COM/WCF, nombres de métodos e IID de
diagnóstico no prueban un objeto vivo ni persistencia. Asociar métodos nativos
mediante TypeLib, slots y constructor, nunca por posición de NativeProcNames.
Los tokens IL solo se reutilizan si coinciden SHA-256/MVID del assembly.

## Ensayo Ghidra que ya funcionó

Se utilizó `scripts/research/ProductorBoundedDecompile.java` sobre una copia,
con Ghidra 12.1.4 y JDK existentes, `-noanalysis -readOnly -deleteProject`.
Entrada candidata `0x01ad83e0`, límite exclusivo `0x01ada390`. El intervalo
lineal previo tiene 8.112 bytes y 2.688 instrucciones; la función recuperada
abarca cuatro rangos con 7.852 bytes y 2.586 instrucciones. Se cotejaron sus
hashes contra offsets PE. El método sigue anónimo en este ensayo.

Conserva las advertencias: tipos sin estabilizar, globals solapados, jumptable
no recuperada en `0x0049034c` y salto indirecto tratado como llamada. No portar
ese pseudocódigo directamente a producción.

No repetir el análisis global que agotó el tiempo y emitió VarnodeContext.
Ghidra rechaza un proyecto alojado bajo un segmento que empieza por punto,
como `.codex`; el proyecto temporal del ensayo se creó en
`C:\Users\sergi\AppData\Local\Temp\aluminior-rea-bounded-01a1465d`.
`native/command.json` y los logs contienen la invocación, su código 0 y el
descarte de la importación bajo `-readOnly -deleteProject`. Estos archivos no
son un recibo del estado actual del servidor REA o de los procesos del equipo.
Comprobar sesión y recursos actuales antes de iniciar otro análisis; no cerrar
ni terminar recursos de otra conversación o proyecto.

## Evidencias privadas y comprobaciones

Dentro de `output/rea-productor-20261016/`:

| Material | Archivos de entrada |
|---|---|
| Índice íntegro de la entrega | `evidence-index.json`: 428 archivos y 100.492.633 bytes, excluido el propio índice |
| Instalación | `installation/INFORME-INSTALACION.md`, `manifest-initial.json`, `read-baseline.json`, `verification.json`, `integrity-after.json` |
| Managed | `managed/INFORME-MANAGED.md`, `managed-summary.json`, `artifact-map.json`, `assembly-reference-graph.json` |
| Métodos y contratos | `managed/il-contracts.json`, `il-contract-verification.json`, `members/`, `boundaries/` |
| Nativo | `native/bounded.pseudo.c.txt`, `bounded.asm.txt`, `body-ranges.tsv`, `bounded-result.txt`, `run-verified.log`, `command.json` |
| Recursos y coste medio | `native/rea-evidence-bundle.json`, `rea-pe-resources.json`, `costemed-static.json` |
| Comparación de código | `source-map.json`, `source-map-original.json`, `verification-root.json` |
| Validación y revisión | `core-tests.log`, `executed-checks.json`, `delivery-verification.json`, `review-independent.md` |

El 17/10 se releen los **428 archivos del índice**: tamaño y SHA-256 coinciden,
cero ausencias o diferencias. Resultado nuevo en
`output/rea-handoff-20261017/evidence-availability.json`; la evidencia del 16/10
permanece intacta. Esta comprobación cubre los artefactos locales generados,
no vuelve a certificar los originales Productor ni producción.

La unidad posterior de configuración revalida los **428** artefactos anteriores,
los **56** del índice de formato y los **19** antecedentes E1 referenciados:
tamaños/SHA-256 coincidentes e índices intactos. Salidas nuevas en
`output/e1-config-20261017/preflight/`; proveedor y verificación en `provider/`.
No ejecutar los scripts de captura para repetir una comprobación: reutilizar
las capturas y usar el verificador con una carpeta de salida nueva.

En el checkout original se ejecutaron el 16/10 las tres comprobaciones de
aplicación: 964/964 tests core en 71 archivos, typecheck core y arquitectura
con 859 archivos/414 módulos/cero infracciones. La identidad textual LF se
verificó para los 641 archivos comunes del worktree; solo existía además
`next-env.d.ts` generado en el original.

En el worktree se ejecutaron el 16/10 los verificadores de integridad, IL,
identidad y entrega, el control de 233 enlaces y la revisión independiente.
El 17/10 no se repiten suites de producto para redactar el relevo. No atribuir
a los resultados de aplicación una fecha de ejecución nueva.

Los verificadores propios están en `scripts/research/`: `verify-rea-productor.py`,
`verify-rea-report.mjs`, `rea-productor-source-map.mjs` y el guion Java citado.
El verificador de entrega del 16/10 tiene un alcance cerrado de 11 archivos;
no espera este relevo posterior. Sus resultados son evidencia de aquella entrega,
no un gate genérico para nuevos cambios. No ampliar su lista solo para ocultar
una discrepancia ni regenerar referencias iniciales de integridad.

Los scripts privados managed dependen del runtime REA local y de JSON/opcodes
de Dudas. Antes de repetirlos, leer sus argumentos y preservar salidas fechadas:
algunos reescriben JSON derivados. Registrar una ejecución nueva en su carpeta
propia, sin sustituir silenciosamente el índice y los resultados del 16/10.

La unidad de procedencia revalida los tres índices anteriores: **428/428**,
**56/56** y **91/91**, sin diferencias ni regeneración. Recibo inicial nuevo en
`output/e1-config-origin-20261017/preflight/integrity.json`; el gate final debe
usar otra carpeta de salida, conservando ese recibo inicial.

Estos artefactos no viajan con Git ni July. En otro equipo, un clone/pull del
commit no entrega los 428 archivos ni las evidencias anteriores. Si faltan,
identificar la ruta exacta y resolver su transporte autorizado; no inventar
resultados, recrear datos empresariales o ejecutar una extracción masiva a ciegas.

**Recibo histórico de fila y delegados, 17/10; no ejecutar como lista de tareas.**
Continuación vigente: [predicados internos](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena). `output/e1-rowkeys-20261017/` conserva
atribución propia de `x_Clave`, rutas/proveedor/slots de transformación y capturas
nuevas; `row/captured-final/` y `transforms/captured-final/` son canónicas.
Gates del director: fila 223/223 y 49 perturbaciones; transformaciones 111/111
y 35 perturbaciones. Revisión independiente 917/917, 53 perturbaciones propias,
sin defectos reproducibles de candidato. Todos estáticos/parciales/solapados,
sin suma de coberturas ni pruebas funcionales. Se conservan límites medidos e
intentos previos de arneses, incluido 108/109 del transformador.
Los seis árboles anteriores 429/59/92/146/140/77 permanecen completos por
tamaño/SHA-256, incluidos índices, sellos, recibos y dos pyc históricos.
La receta `preserve.py --out … --baseline preflight/preservation.json`
pertenece a aquella entrega y queda histórica. En continuaciones no ejecutar
esos scripts ni escribir dentro de los siete árboles ahora protegidos.
Ocho documentos activos actualizados; 1.099 versionados restantes intactos.
Mismo E1 July con historia e `in_progress`, sin sincronizar. Cierre local tras
congelación de los tres agentes, gate final e identidad Git; sin push.
Su siguiente entonces eran `gaVarios +0x48/+0x4c`, continuados en la
[unidad de predicados](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena).
Ese paso queda agotado; no repetir atribución/cuerpo de fila ni proveedor/slots.
El recibo siguiente es histórico; sus instrucciones se subordinan a éste.

**Recibo de la continuación de claves, 17/10:** `output/e1-keys-20261017/`
conserva capturas nuevas, revisión independiente y gate del director. Comparador
68/68 y 17 perturbaciones; normalizador 68/68 y 22 perturbaciones; revisión
propia 2.477/2.477 y 23 perturbaciones en memoria. Son alcances estáticos
parciales/solapados, no coberturas sumables ni pruebas funcionales. Los cinco
árboles anteriores conservan íntegros 429/59/92/146/140 archivos por tamaño y
SHA-256, incluidos índices, dos pyc y recibos posteriores al sellado del índice.
La invocación histórica `python -B output/e1-keys-20261017/preserve.py`
con salida bajo claves pertenece a aquella entrega; no ejecutarla en
continuaciones ni escribir en ese árbol protegido. El siguiente párrafo y su verificador son historia de la unidad del
índice; **no ejecutarlo en continuaciones con salida en el árbol protegido**.
El mismo E1 July conserva historia y `in_progress`, sin sincronización.
Ocho documentos activos actualizados, evidencia histórica preservada, sin
retirar documentos únicos. Cierre local tras congelación de los tres agentes,
gate final e identidad Git; sin push. Su siguiente anclaje entonces era el cuerpo
de `_gaLstItem.x_Clave +0x38` / TypeLib `0xabcd8` y las transformaciones,
continuados en la unidad de fila/delegados enlazada arriba; ese paso es histórico.

La unidad del índice comprueba **428/428, 56/56, 91/91 y 145/145** artefactos
antes de investigar, incluidos los índices sin regenerar; conserva además los
dos `.pyc` antiguos fuera del índice de formato. El verificador nuevo
`output/e1-index-20261017/verify_integrity.py` compara contra
`preflight/integrity.json`, con salida siempre nueva dentro de esa unidad.
La evidencia reproducible del índice está en `behavior/captured-frozen/`;
el director reproduce 130 comprobaciones y 30 perturbaciones en memoria,
con 15 capturas / 3.833 instrucciones únicas. El cotejo PE independiente del
director cubre esas mismas capturas; los conteos no se suman como cobertura.

## Lo que queda por hacer

### Ahora

**E1 económico es la siguiente frontera del roadmap.** El físico/condicional,
despacho, consumidor, receptores COM, control/reparto y totales ya tienen evidencia.
No repetir esas unidades. Elegir una pregunta pendiente y cerrar una sola unidad:

1. Unidad estática/documental de formato ampliada el 17/10 en el enlace inicial:
   máscaras/Variant, flags y contrato público de localización. No repetir esa
   extracción; conservar formato → conversión → escritura. Empates y localización
   efectiva siguen pendientes de un ensayo aislado autorizado, sin redondeo supuesto.
2. Proveedor y argumento `2`, AbreRS, carga de lista y configuración/construcción,
   ordenación y búsqueda del índice seguidos estáticamente. No repetirlos.
   Inicializador del comparador y bifurcación del normalizador seguidos en la
   continuación de claves enlazada arriba; no repetirlos. Cuerpo de fila y
   proveedor/slots de transformación seguidos en la unidad posterior; no repetirlos.
   Predicados `+0x48/+0x4c` seguidos en la unidad nueva enlazada arriba;
   no repetirlos. Contrato WCTMB y enlace candidato seguidos en la unidad nueva.
   Escrituras de las dos celdas seguidas en la unidad de estado. Continuar sólo
   por la procedencia inmediata del byte `0x102838ce`, leído en `KernelBase.dll
   0x1015c40e`; resolución y valores efectivos aún abiertos. No atribuir colación, prioridad primera/última ni
   equivalencia de claves desde condiciones parciales.
   Las cuatro RED efectivas siguen sin demostrar. El BSTR `2` no certifica escala
   dos; el selector BDtipo tampoco prueba backend ni configuración efectiva.
3. Acreditar formación de agregados comerciales, cantidades, descuentos y
   exclusiones del cargo previo para cada modo aplicable.
4. Separar escrituras estáticas de atomicidad, rollback, idempotencia y guardado
   durable. Esta última aceptación requerirá un ensayo autorizado y aislado.

El cargo en cabecera permanece sin activar. A–F y G1–G5 se conservan; G6 tiene
una incidencia y no se borra, modifica o recalcula bajo este relevo.

En corte, la siguiente unidad útil es **especificación de casos sintéticos**:
distintas longitudes/costes de barra, retales, kerf, despuntes, restos mínimo/máximo,
multibarra e imposibles. Fijar unidades y significado de longitud efectiva antes
de comparar porcentajes. Esto no cambia el orden del roadmap ni autoriza ya
implementar otro optimizador o ejecutar el legacy como oráculo.

### Después

La [matriz de 35 capacidades](COMPARACION-REA-PRODUCTOR-2026-10-16.md) contiene
los módulos/localizaciones y el [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md)
conserva los estados y criterios únicos. Consultarlos vivos; esta agrupación no
crea una segunda lista de tareas con otro orden:

- **Economía pendiente:** coste dimensional; precio dinámico completo y caso
  positivo. El selector puro de registros de tarifa dinámica ya existe.
- **E2–E11:** uniones de otra serie, comisión/redondeo, tapajuntas, compacto,
  acristalamiento alternativo, fracciones, herrajes, cotas/referencias, acabado
  efectivo y mínimos/múltiplos/intervalos. Mantener las condiciones de cada ID.
- **Compras y almacén:** recepciones parciales, albaranes/facturas de proveedor,
  trazabilidad, movimientos, saldos, reservas/lotes y reversión.
- **Venta y cobros:** ciclo pedido/albarán/factura, vencimientos, cobros parciales
  y múltiples, aplicación/reversión y extractos.
- **Operación:** listados concretos del taller, intercambio documental, jornadas,
  tareas y gastos reales. La MO presupuestada y el PDF no sustituyen esos módulos.
- **Aceptación:** P.2 mantiene formato comercial pendiente; P.6/P.7 mantienen
  matriz de anchuras, zoom 200 %, reduced motion y recorrido humano comparativo.
  E7 no se cierra por la migración decimal A4 ya publicada.
- **Mantenimiento:** S2 conserva su seguimiento documental pendiente. Consultar
  fuentes oficiales vigentes al abordar esa tarea; aquí no se auditó seguridad.

No rehacer presupuestos, pedidos de compra, hojas de corte/producción, A3/A4,
M0, C1/0031/0032 o integración Windows–Mac. Ya tienen implementaciones/entregas
con alcances concretos que deben preservarse.

### Experimental

Más decompilación/C#, reconstrucción extensa, 25 comprimidos internos, diseño
de RPT, optimización avanzada, CNC/etiquetas/máquinas, calidad y modo offline.
Seleccionar una pregunta útil antes de ampliar. Viabilidad, coste total y retorno
no están medidos; no se adquirieron licencias ni infraestructura nueva.

## Contrato para cada nueva unidad

Declara resultado, destinatario, éxito medible, alcance, exclusiones, protegidos,
comprobaciones y autorizaciones necesarias antes de código no trivial. Si una
ambigüedad cambia materialmente el resultado, aplica la puerta de intención
de `AGENTS.md`; las decisiones rutinarias se resuelven dentro del alcance.

El director reparte por responsabilidad y dependencias. Los ejecutores no hacen
git add/commit/stash/checkout; el director revisa y guarda cada lote terminado.
El revisor recibe artefacto + contrato + evidencia, sin razonamiento del autor.
Máximo dos rondas; si se corrige un bug, medir cuántos tests fallan al revertir
el arreglo. Para investigación sin corrección funcional, esa medición no aplica.

Terminado significa evidencia ejecutada y documentación reconciliada. Distinguir
extraído, especificado, implementado y verificado. No convertir ausencias en
ceros, inventarios en paridad o tests verdes en aceptación Productor.

Antes de cualquier implementación sensible se necesitan worktree y BD de prueba
aislados con destinos efectivos comprobados. Esta investigación no autoriza
cargas, migraciones, datos reales, publicación, push ni despliegue. Conservar
RLS/autorización, snapshots, dinero y arquitectura. No sortear licencias ni
registrar componentes legacy en la estación principal.

Al cerrar, actualizar tarea y siguiente paso existentes; preservar discrepancias
y evidencia. Informar requisito → resultado → comprobación → límite pendiente,
sin presentar consensos de modelos como prueba.

## Primeros comandos

Desde PowerShell, para localizar sin cambiar de rama ni modificar datos:

```powershell
$worktree = 'C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior'
git -C $worktree status --short --branch
git -C $worktree log -3 --oneline
git -C $worktree merge-base --is-ancestor 06b4673 HEAD
if ($LASTEXITCODE -ne 0) { throw 'El worktree no contiene el commit de investigación esperado' }
git -C 'C:\Users\sergi\Desktop\Aplicaciones\Aluminior' status --short --branch
git -C $worktree worktree list
Test-Path -LiteralPath "$worktree\output\rea-productor-20261016\evidence-index.json"
Test-Path -LiteralPath 'C:\Users\sergi\Desktop\Aplicaciones\Dudas\pruebas\productor-extraccion-20261016\evidencia'
```

Si el comando de ancestro devuelve distinto de cero o falta evidencia, describir
la divergencia y resolver únicamente lo que afecta a la unidad. No resetear,
repetir inventarios o asumir recepción/publicación para hacer encajar el relevo.
