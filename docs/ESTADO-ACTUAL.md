# Estado actual de Aluminior

Producción, 06/11/2026: `main` = `7bd12d3`, live en Render (`dep-dbmcj0ajnfac7399g5l0`, 05/11 18:24 UTC). Todas las ramas de trabajo están integradas en `main`; ningún worktree tiene commits propios. Incluye M1, E2, GR1 (motor y UI), E5, E5b, E6, DS2, DG1 (`8334f60`), VA1 (`5b709ac`), S2 (`5298a7b`), GR2 (`1040a92`, `a3ffc67`) y el arreglo del banco (`7bd12d3`). Sin migraciones nuevas desde la 0035. Los párrafos siguientes que dicen «rama», «local», «sin commit» o «sin publicar» son antecedentes fechados: su código ya está en `main`.

Producción, 03/11/2026: `main` = `46fd472` (M1 uniones + línea E1 de Windows +
DS2/GR1/E5/E5b), live en Render (`dep-dbl2kdp7lnhs738jfc3g`, 120 s, logs sin
errores; `/login` 200 y el resto redirige al login). Supabase: 36 migraciones
(hasta `0035`) y 52 uniones cargadas. Sin QA funcional con sesión en producción.

03/11/2026, `main` = `0a4958b` (fusión `integracion/codex-e2-20261103`): E2 integrado,
sin medir en la 0016. La medición queda pendiente; desde el 05/11 el banco se
monta en este portátil (ver GR2). No reimplementar la serie propia
de la unión. El único siguiente está en [Siguiente paso](#siguiente-paso).

04/11/2026, rama `fix/s2-next-zod-seguridad` (desde `5b709ac`; publicada después en
`main` como `5298a7b`), tarea S2: `next` 15.5.27→15.5.29 exacto y `zod` ^4.4.3→^4.6.7.
GitHub marca 15.5.28 como primera parcheada de GHSA-2464 y GHSA-p3m5; 15.5.29
es la instalada y queda fuera del rango `<=15.5.28` de GHSA-7qx7 y GHSA-f3mh.
GHSA-mrhx se corrige desde 4.6.6; instalada 4.6.7, última 4.x publicada.
GHSA-pc58-hwjq-p385 sigue sin versión parcheada en el advisory (`<16.0.0` y
`>=16.0.0`, `patched_versions` vacío); el release 15.5.29 lo cita, pero no se
sube a 16. Riesgo residual: en `packages/web` no hay `fetch(`, `return fetch(`,
`return await fetch(`, `new Response(res.body` ni `NextResponse.rewrite`.
`npm audit --omit=dev`: 0. `npm audit`: 3 de desarrollo, vitest/@vitest/mocker
<=4.1.11 y vite <=6.4.3, pendiente aparte; el override no se toca. `test:ci`:
core 1041, db 56, etl 114 y 1 omitida, web 928. E2e 10/10. Build Next 15.5.29.
No se prueba un exploit. Producción pasó a 15.5.29 con `5298a7b` (04/11). El puntero no cambia.
No repetir la revisión del anuncio del 14/10.

04/11/2026, rama `feat/va1-validar-aceptar` (desde `8334f60`; en `main` como `5b709ac`),
tarea VA1: al aceptar un cerramiento, Aluminior rechaza elementos sin serie,
vidrio o acabado efectivos y uniones sin configurar. Nada se escribe. La copia
no se valida. Abrir una línea antigua no la reescribe; guardarla exige completar
los materiales. Hipótesis: identificación `código de ancho x alto`, aviso de
todas las faltas a la vez, y vidrio obligatorio también sin hueco acristalado.
`test:ci` del 04/11 en verde: core 1041, db 56, etl 114 y 1 omitida, web 928.
El control negativo, con la llamada desconectada, hace caer 3 pruebas que
afirman el rechazo; otras 10 de la misma pasada en paralelo fueron bloqueos y
pasan aisladas; el arquitecto lo repitió y caen exactamente 3 de 928. E2e local
10/10. Navegador 04/11 en `aluminior_audit_test`, puerto 3006: aceptar
sin vidrio muestra el aviso y deja el dibujo; con vidrio se guarda. Sin mochila
no hay comparación lateral. No mide el banco. El puntero no cambia.

04/11/2026, rama `feat/d1-descripcion-grupo` (`cd3dba4`; en `main` como `8334f60`), tarea DG1: descripción generada
del GRUPO en alta, edición y copia con regeneración. Un bloque por elemento, en
el orden de `modulos`, con medidas nominales (`1.200,0`), color, código de serie
y vidrio resuelto; la unión no entra; el compacto cierra el bloque de su elemento.
Los documentos ya guardados no se reescriben. La serie sale como código: falta
migrar `conjuntos.descripcion` (DG1b). Hipótesis sin confirmar en Productor: texto
de un elemento sin vidrio, orden de bloques cuando la composición no es una
cadena, y por qué el 260499 mostró solo el primer elemento. Sin mochila no hay
comparación lateral. La edición manual de la descripción no entra. `test:ci`
del 04/11: core 1034, db 56, etl 114 (1 omitida), web 923, todos verdes. Al
volver a `descripcionCerramiento` en el alta, cae 1 de 923 pruebas web: guarda
`CERRAMIENTO SEGÚN DIBUJO · 2O`; el arquitecto repitió el control por separado en
edición (cae 1) y copia (caen 2). En navegador, la columna Descripción se
estrechaba a 134 px a 1024 de ancho; corregida con ancho mínimo. No rehacer la función ni medir el banco desde
este portátil.

Anterior — 19/10, auditoría, no es el puntero: Render entonces en `40cedd1`;
diez recorridos con BD Docker y QA local; Auth real y aceptación Productor
pendientes; E1 comercial y tarifa dinámica sin activar; G6 protegido.
[Auditoría](paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md) y
[relevo del 18/10](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#continuar-en-otra-conversación).

Anterior — revisión documental y producción: 12/10/2026. Código `40cedd1` live en Render,
deploy `dep-db6hi2navr4c739d2e4g`, terminado a las 19:31:21 Europe/Madrid
(17:31:21 UTC). Supabase: 33 migraciones, 0031/0032 y carga dirigida aplicadas;
QA técnico remoto y preservación final correctos en la entrega del 12/10. Ver
[publicación del 12/10](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md).
La revisión funcional del 09/10 en `487feb1` y la consulta Render del 10/10
son antecedentes conservados. La auditoría del 19/10 confirma versión, destino
y 33 migraciones; no repite las escrituras QA de aquella publicación.
Se preservan la cobertura histórica del 03/10 y la investigación E1 del 04/10.
[Auditoría documental](AUDITORIA-DOCUMENTAL-2026-10-10.md) y
[continuación en Windows](CONTINUAR-EN-WINDOWS.md).
Consolidación documental inicial: `ee0dc16`, sobre `9bc879e`.
Este es el único punto de entrada de estado y siguiente trabajo.
El [roadmap operativo](../ROADMAP-PARIDAD-PRODUCTOR.md) conserva el orden y
estado único de las tareas de paridad, con mantenimiento documental obligatorio.

## E1: ensayo autorizado y preparación — 19/10/2026

Sergio autoriza el ensayo aislado de configuración/redondeo y la aplicación
de lo demostrado, manteniendo G6 y producción intactos. Caso sintético R1
preparado: cuatro predicciones distintas, reproducidas por cálculo racional
y Decimal independiente. No es una observación de Productor ni cambia dinero.
Inventario administrativo ejecutado por Sergio y verificado: Hyper-V responde,
cero VMs registradas, Sandbox deshabilitado. La consulta por permisos queda
resuelta; no repetir el comando. Sergio indica aprovechar la instalación
existente: copia preparada de 341 archivos/220.429.241 bytes, sin MDB, empresas,
credenciales o enlaces, con hashes de origen/copia verificados. No exigir una
demo antes de probarla. Sandbox habilitado por el activador revisado:
`Disabled → Enabled`, sin error. Reinicio completado y perfil abierto; recibo
invitado verifica los 341 archivos y cero adaptadores de red activos. Al abrir
«Productor copia E1», el comprobador exige Crystal Reports 13.0.35. Primera
unidad detenida y revisada; no es Productor operativo ni R1. El MSI local
declara 13.0.0.99; el paquete oficial firmado declara 13.0.35.4870, coincidente
con el requisito observado. Instalado sólo en el invitado
`d8248510-bae0-4a2e-a208-93484eee479c` como SYSTEM: msiexec terminó en 0, sin
reinicio, y el registro de 32 bits muestra esa versión y el ProductCode
`{E43D7D73-C531-4EB3-ACC9-0EF11E1A84B0}`. El comprobador de Crystal ya no aparece
al reabrir la copia. El siguiente diálogo, sin pulsar Aceptar, dice que es
necesario actualizar los controles y librerías. No repetir
reinicio/activador/inventario ni instalar componentes en el host.
Referencia 46.30.0006; la caché 42.35 queda fuera. Licencia/configuración todavía
sin observar. No se han cambiado cálculos de Aluminior.
[Procedimiento vigente y límites](paridad/PASO-E1-DESPUNTE.md#ensayo-autorizado-del-1910-configuración-y-redondeo).
RED/locale siguen sin capturar; no se ejecuta el original en el host ni se
activa el cargo. No repetir la auditoría o la investigación interna de Windows.

## Auditoría de integración REA — 19/10/2026

No están completas todas las fases. Se contrastan documentos, consumidores del
código, Render/BD en sólo lectura y recorridos QA existentes. En Docker nuevo:
56 DB, 881 web y diez E2E correctos; 964 core y 68 ETL seleccionados, tipos y
arquitectura correctos. Primera pasada web: cuatro timeouts; se conserva el
fallo y la pasada completa con dos workers efectivos, sin cambiar aserciones
ni tiempos. E2E usa acceso QA local y conserva precio decimal nulo: no acredita
Supabase Auth ni precio comercial aceptado. La hoja QA publicada conserva
incidencias de fabricación y despunte sin cargo.
[Informe, fases abiertas y evidencia](paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md).
Se retiran punteros que pedían repetir la matriz E1 o limpiar G6. El 19/10 el siguiente de E1 era
empresa sintética nueva y RED/locale/caso discriminante, con autorización del
original. P.6/P.7: Auth real y comparación humana equivalente; guardado aislado
de los diez casos ya probado. Sin cambios de producto, publicación ni cierre global.


## Configurador al 200% nativo — 19/10/2026

La etiqueta Acristalamiento se parte dentro de su campo, sin invadir Acabado.
Control con fuente anterior sólo en memoria: cuatro escenarios fallan; con
la corrección pasan los doce. Chrome visible, tres anchos de ventana,
aceptación/rechazo/reintento, teclado y 58 capturas completas válidas.
35 pruebas puras, tipos de cuatro paquetes y arquitectura correctos.
[Resultado, prueba y límites](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-p6p7-de-zoom-nativo--1910).
Sólo entrega local sin BD ni persistencia. El 19/10 el siguiente era comparación humana con
Productor y recorrido autenticado con BD efímera autorizada. P.6/P.7 sigue abierto; no es el puntero.

## Retorno de foco P.6/P.7 local — 18/10/2026

Tras un alta aceptada simulada de cerramiento, el diseñador se reinicia y el
foco llega a «Añadir primera ventana»; Enter permite continuar. Rechazo de
campo, rechazo general y respuesta perdida conservan el borrador y permiten
reintentar. Segunda alta comprobada sin reutilizar la identidad confirmada.
16 escenarios actuales a 1280/768/375/320 y ocho comprobaciones de foco que
fallan con el código anterior; 35 pruebas puras, tipos y arquitectura correctos.
[Resultado, prueba reproducible y límites](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-p6p7-de-retorno-tras-alta--1810).
La verificación visual 200% del configurador se completa en la unidad del 19/10 superior.
P.6/P.7 integral continúa en curso. Sin BD, guardado real ni publicación.

## Cabecera y configurador P.6/P.7 local — 18/10/2026

Elegir cliente con Tab/Enter devuelve el foco a Cliente y permite F9 sobre la
cabecera. Al rechazar un alta, el primer campo inválido o la alerta reciben
foco; el borrador se conserva. Seis casos discriminantes fallan con el código
anterior y pasan con el actual. Matriz a 1280/768/375/320, componentes reales,
acciones sintéticas sin persistencia; 35 pruebas puras, tipos y arquitectura.
[Detalle y siguiente unidad](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-p6p7-de-cabecera-y-configurador--1810).
El defecto de foco en body observado en esta entrega se corrige en el apartado
superior. No se acredita guardado real ni recorrido autenticado; sin publicación.

## Producción P.6/P.7 local — 18/10/2026

Título de perfil y aviso de coste incompleto conservan referencias largas sin
desbordar la página. Componentes reales con CSS y fixture sintética: diez
combinaciones a 1280/768/375/320/640, teclado, foco, movimiento reducido y zoom
nativo 200% comprobados. 40 pruebas puras, tipos y arquitectura correctos.
[Alcance, evidencia y siguiente unidad](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-p6p7-de-producción--1810).
Sin BD ni recorrido autenticado; no publicado ni aceptado en uso real.
P.6/P.7 integral sigue abierto. Los errores de cabecera/configurador se
verifican en la entrega superior; no repetir el tramo de producción.

## Corrección funcional local — 18/10/2026

[Ocho preguntas E1 contrastadas](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contraste-de-las-ocho-preguntas).
En Producción → documento → «Coste técnico de despunte», costes iguales con
distinta escala (`4`/`4.0000`) conservan su valoración. Costes distintos o
ausentes siguen sin valorarse. Adaptador puro y vista existente, sin cargo,
SQL ni cambios de presupuesto. Ver [resultado y siguiente entrega](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-del-1810-y-siguiente-entrega).
Estado local; no publicado ni aceptado en uso real. E1 económico sigue abierto.

## Investigación REA — 16/10/2026, worktree separado (histórico)

Continuación E1 del **17/10**: [contrato de formato](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contrato-de-formato-varformat)
con máscaras/Variant y conversión acreditados estáticamente, referencias oficiales
congeladas y verificación propia. No cierra empates, localización efectiva ni
importe comercial. La [unidad posterior de configuración](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#proveedor-de-configuración-y-argumento-2)
identifica `gaConfigDAL.Carga` y demuestra el uso condicionado del BSTR `2`
como fallback; no demuestra escalas efectivas iguales a dos. La [unidad de procedencia](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-y-precedencia-del-índice-de-configuración)
sigue AbreRS, la consulta a gaConfig, la recarga y la petición de índice NombreDato.
La [unidad del índice](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#configuración-construcción-y-selección-del-índice)
sigue configuración, construcción, partición/intercambio y devolución inmediata
de posición ante igualdad. No prueba prioridad primera/última ni equivalencia
de claves. La [continuación de comparación y normalización](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves)
sigue la inicialización del comparador y las dos rutas del normalizador.
No demuestra colación ni normalización efectivas. La [unidad de clave de fila](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#clave-de-fila-y-transformaciones-del-índice)
atribuye `_gaLstItem.x_Clave +0x38` al cuerpo `0x11074c00` y sigue proveedor,
slots y cuerpo de las transformaciones. La [unidad de predicados internos](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena)
acredita `+0x48/+0x4c`, intervalos sobre conversión signed16 y efecto en ramas.
La [frontera WCTMB](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte)
acredita contrato público y enlace candidato ApiSet. La [procedencia del estado](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-estado-de-kernelbase)
acredita escrituras y fallback condicionados de las dos celdas. La
[procedencia del selector](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-byte-selector-de-kernelbase)
acredita una escritura literal condicionada a `1`. La [identidad del DWORD, 18/10](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-inmediata-del-dword-de-kernelbase)
queda atribuida por bytes y tipos x86 a `_RTL_USER_PROCESS_PARAMETERS.Flags`
en `+0x8`, mediante `TEB → PEB → ProcessParameters`. La [inicialización local de Flags, 18/10](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#inicialización-local-de-flags)
acredita en ntdll `_RtlCreateProcessParametersInternal@48` la escritura de `1`
en `0x4b2aa8f8`: bit 31 a cero en ese instante del bloque construido.
No demuestra que sea el bloque del PEB leído ni que se ejecute antes del consumidor.
La entrega interna `0x4b2aa9df` y los wrappers Ex/WithTemplate están seguidos.
La [unidad del llamador Ex](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#llamador-externo-y-destinatario-de-ex)
acredita una llamada en `ncryptprov.dll`, `0x1003da6a`, desde el símbolo
`_CreateSecureProcessEx@28`: el primer argumento es la dirección del slot local
`[EBP-0x64]`. Su lectura posterior y escritura en `+0x29c` están capturadas;
no se atribuye nombre ni valor efectivo a ese offset. El mismo slot vuelve
a leerse para el noveno argumento de una llamada importada a `NtCreateUserProcess`.
**Frontera técnica archivada (no continuar):** esa llamada en `0x1003db34`
(IAT `0x10068438`, lectura del slot en `0x1003dadf`), sin seguir su cuerpo.
El helper intermedio `0x1003da93` no está seguido: no se demuestra conservación
del contenido del slot a través de sus posibles efectos o alias.
No se acredita que este llamador participe en Productor, que el bloque sea el
del PEB leído por KernelBase ni orden previo a su lectura. No repetir la
localización del llamador Ex ni sustituirla por la variante WithTemplate.
No se acredita
escritura del bit 31 a uno, significado del bit, valor efectivo ni ejecución. Campo
`FS:[0x30]+0x228` y resultados del helper siguen abiertos por separado.
Equivalencia y valores efectivos siguen abiertos, después agregados y persistencia.
Cargo desactivado, G6 protegido.
Evidencia privada: `output/e1-varformat-20261017/`, `output/e1-config-20261017/`
y `output/e1-config-origin-20261017/`; índice en `output/e1-index-20261017/`
y continuación en `output/e1-keys-20261017/`; unidad nueva de fila/delegados
en `output/e1-rowkeys-20261017/`; predicados en
`output/e1-rellena-predicates-20261017/`; frontera WCTMB en
`output/e1-widechar-frontier-20261017/`; procedencia de estado en
`output/e1-kernelbase-state-20261017/`; procedencia del selector en
`output/e1-kernelbase-selector-20261017/`; identidad del DWORD en
`output/e1-kernelbase-field-20261018/`; inicialización local de Flags en
`output/e1-flags-writer-20261018/`; llamador Ex y destinatario local en
`output/e1-processparameters-caller-20261018/`. Los trece árboles anteriores completos
429/59/92/146/140/77/127/374/189/198/151/223/269 (2.474 archivos) se preservan por tamaño y SHA-256.

[Relevo completo del 17/10 para otra conversación](paridad/RELEVO-REA-PRODUCTOR-2026-10-17.md):
428, 56, 91 y 145 artefactos privados de los cuatro índices anteriores comprobados por tamaño y SHA-256; resultados de producto
del 16/10 conservados con su fecha, sin nueva ejecución de suites.

[Informe REA](paridad/INVESTIGACION-REA-PRODUCTOR-2026-10-16.md) y
[comparación por capacidades](paridad/COMPARACION-REA-PRODUCTOR-2026-10-16.md),
en `codex/rea-productor-20261016`, desde `307bf54`. Inventario ampliado,
123 identidades managed y contratos seleccionados; pseudocódigo nativo
dirigido obtenido con advertencias, sin repetir análisis global. No cambia
paquetes, datos, producción ni aceptación económica. Fuentes/IL privados en
el output ignorado del worktree; no viajan por Git. Reutilizar antes de extraer.
E1 sigue por configuración, aceptación matemática, agregados y persistencia;
el desglose de formato actualizado es el del 17/10 anterior. G6 protegido.
Las brechas de corte, stock, compras, cobros e informes no son tareas ya
implementadas por haberlas documentado. El roadmap conserva su orden.

## Contraste masivo de GRUPO reales — 02/11/2026

Todos los GRUPO de la 0016 (225, copia del 31/10) y de la 0015 (230),
valorados con el motor sobre el catálogo real local; ver
[contraste](paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md). Desde julio hay
188 documentos y 59 GRUPO nuevos en la 0016; los PVP no han cambiado. 0016:
23 coinciden al céntimo, 66 difieren con causa identificada, 123 sin valorar
y 13 no se dibujan. Por importe pesan la cota `FI`/`FS` de los fijos sin
transmitir (31 GRUPO), los conjuntos de varias series (E2, 40), el compacto
(E5, 43; en 24 el resto coincide al céntimo) y el vidrio por elemento (E6,
24). El reparto de uniones cambia 44 GRUPO por solo 749 € en total; su
patrón principal es la unión que recorre varias piezas. Las alturas
distintas no explican la asimetría: el 89 % reparte mitad y mitad; el caso
3 sigue siendo una sola observación, ligada al invisible (hipótesis). Campo
del invisible identificado: diseño de un nodo `Tipo = 19` (DS3). La 0015 no
es comparable en precio (tarifa de 2023). Nueve GRUPO reales anonimizados
quedan como regresión local. Ampliado el mismo día a los 17 ejercicios
(2010–2026, 4.107 GRUPO): hasta 2022 no son reproducibles con el catálogo
actual (uniones `CMU…` y series retiradas); en 2023–2026 el 70 % de los
valorados tiene la misma receta que Productor y el compacto es la causa más
frecuente (235). La asimetría del reparto se concentra en las uniones de
guías de compacto. Orden entonces: GR1, E5, E2, E6, GR2. GR1 y E5 quedaron
medidos el 02/11; E2 está en `main` (`0a4958b`) y se midió en la 0016 el 06/11.

GR1 implementado y verificado en local el mismo 02/11/2026 ([contraste §GR1](paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#gr1--02112026)): `ModuloCerramiento` v3 admite `cotas?: CotasModulo` (`FI`, `FS`, `VS`, `TD`, `F`, `FD`, `FZ`), `valorarCerramiento` las pasa a `valorarEstructura` y `configuracionGrupo` las lee de `VEstructurasVariables`. En la 0016 los 23 GRUPO que coincidían al céntimo siguen coincidiendo, `cota-fi-fs` baja de 31 (140.530,91 €) a 0 y 26 de los 31 pasan a valorarse (`difiere` sube de 66 a 92 y `sin-valorar` baja de 123 a 97; 10 de los 26 nuevos valorados tienen `receta: igual` y en 5 el resto coincide al céntimo salvo el compacto). Los 5 restantes usan `PSU006` y quedan sin valorar únicamente por `PSESQCOM: sin PVP en la tarifa`. En la 0015 `difiere` sube de 119 a 138 (+19) y `cota-fi-fs` baja de 21 a 3; en 2023–2026 los valorados suben de 482 a 527 (350 con receta igual). El 03/11/2026 la UI del configurador, en `feat/gr1-cotas-ui` (en `main` como `cd3dba4`), muestra junto a Ancho y Alto las cotas de catálogo (`FI`, `FS`, `VS`, `TD`, `F`, `FD`, `FZ`) de las estructuras dibujables; `1OFI` sigue con `fiMm` y no duplica FI. Si el operador no toca el campo, no se escribe `modulo.cotas`. La ubicación es hipótesis y debe confirmarse en Productor. La UI no se ha medido con el banco: no rehacer la UI ni repetir la medición del motor de la 0016. Sin cambios en el motor.

E5 parcial el 02/11/2026 ([contraste §E5, corrección vigente](paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#corrección-del-mismo-02112026-vigente)): `ModuloCerramiento` v3 admite `compacto?: CompactoModulo` y `valorarCerramiento` lo propaga sin suponer opciones. El banco (`scripts/lib/banco-contraste/compacto-grupo.ts`) solo transmite el compacto al módulo con opciones guardadas y evidencia completa; si no, lo aparta con su importe. La primera entrega dejaba 53 GRUPO de la 0016 sin valorar por suponer `G1O0`, y su `regresion-06` usaba opciones de otra línea. Corregido: la 0016 vuelve a 23 / 92 / 97 / 13 y la 0015 a 0 / 137 / 72 / 19; `compacto` queda en 53 GRUPO de la 0016 y los tubos o accesorios repetidos pasan a la causa `otro-accesorio` (11). En la 0016, 272 de 276 compactos de GRUPO no guardan `VOpciones`.

M1, 03/11/2026, implementado en `feat/m1-mantenimiento-uniones` (en `main` y producción desde `46fd472`) y no cerrado: alta y edición de uniones, catálogo inyectado en el configurador y recarga que conserva `de_usuario`. Las imágenes de `ESTRUCTURAS` están en `dibujo_catalogo` de Supabase (494 BMP, 03/11/2026), sin copiarlas al repositorio. No se subieron documentos de presupuesto. No se ha repetido el contraste de la 0016 (la 0034 se aplicó en Supabase el mismo 03/11; ver abajo). El precio no es un campo libre: sale de la receta del perfil. El mismo día se corrigieron los seis defectos de la revisión ([corrección](paridad/PLAN-M1-MANTENIMIENTO-UNIONES-2026-11-02.md#corrección-tras-la-revisión--03112026)): validación de escritura con el catálogo de la base, grosor de la base, receta de Productor protegida e imagen subida a `dibujo_catalogo`. En Supabase quedan aplicadas 0033–0035 (36 migraciones) y cargadas las 52 uniones. El 03/11 el siguiente de paridad era E2; está en `main` y se midió en la 0016 el 06/11.

E5b verificado en local el mismo día ([contraste §E5b](paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#e5b--opciones-predeterminadas-del-catálogo-02112026-vigente)): la migración `0033_estructura_opciones_accesorio` carga `EstructurasOpcOpciones` (430 filas) y el despiece de accesorios aplica la predeterminada al grupo sin opción guardada. En la 0016 quedan 24 / 91 / 97 / 13; `compacto` baja de 53 a 8, el reparto desde el hueco pasa a ser la causa principal de 31 GRUPO (antes 10) y `regresion-06` coincide al céntimo con datos reales (1.410,08 €). La 0015 queda en 0 / 137 / 72 / 19. El 02/11 **0033 no estaba aplicada en Supabase**: la web funciona sin ella, pero la carga dirigida del motor la exige. El 03/11 producción declara 0033–0035 aplicadas. El 02/11 el siguiente era E2 (varias series en GRUPO); el puntero vigente es medirlo en la 0016, no reimplementarlo.

## Guía del diseñador de Productor — 01/11/2026

Sergio empieza a explicar botón a botón el diseñador de cerramientos.
[GUIA-DISENADOR-PRODUCTOR](paridad/GUIA-DISENADOR-PRODUCTOR.md) recoge escaparate,
`Elemento seleccionado` (perfiles, vidrio, acabado), `Unión` e insertar compacto,
con su catálogo y su cobertura en Aluminior. Comprobado contra la exportación local:
series, vidrios (familia 050), 18 acabados y los 17 compactos `COM…` ya están
importados; el compacto sigue sin modelar (E5). Segunda entrega del mismo día:
botón 4 (`Insertar tapajuntas cerramientos`), recorrido de composición en el lienzo,
cartabón/`Diseño V3` y elemento invisible (viga o pared). Abiertas en el roadmap
DS1 (guía, en curso), DS2 (inserción debajo visible y mover piezas libremente,
requisito de Sergio) y DS3 (elemento invisible). Solo documentación: sin cambios de
código. Las preguntas para el operador están en la guía. July no conectó en este
equipo, así que hay que pasarlas a July desde el otro.

DS2, primer paso, mismo día: en la web local con el catálogo real la inserción
debajo funcionaba, pero solo se llegaba con dos puntos verdes diminutos al
preparar una pieza. Ahora el lienzo tiene un `+` inferior y la barra
«Colocar X debajo»: debajo del elemento seleccionado o, si está ocupado, del
inferior libre más bajo. Verificado con el recorrido de las capturas de Sergio
(2420 × 2420), en escritorio y a 375 px. Tests core 664 correctos, test del
diseñador correcto, tipos y arquitectura limpios. La batería web completa dio
17 timeouts de integración PostgreSQL con el servidor de desarrollo abierto;
esos cuatro ficheros pasan al ejecutarlos en serie. Publicado después en `main` (`ba9a5a5`).

DS2, segundo paso, mismo día: Sergio elige recolocar en anclajes y que las piezas
colgadas de la movida se queden fijas. Implementado en core (`mover-modulo.ts`, 6
tests) y en la web (arrastre con ajuste magnético y botón «Mover elemento» con
destinos enfocables). Verificado en local sobre el 2 × 2 de las capturas
(2420 × 3640 y vuelta a 2420 × 2420), con guardado y recarga. Las uniones afectadas
nacen sin configurar. La observación de Productor no se hizo: el acceso al
escritorio no se concedió. Publicado después en `main` (`ba9a5a5`). Falta prueba de Sergio y
deshacer. El orden económico E1–E11 no cambia; E2 se midió el 06/11.


## Comparativa de presupuestos Productor / Aluminior — 01–02/11/2026

Cinco cerramientos presupuestados en Productor (0017, presupuesto 260503) y en
Aluminior local (260002); ver
[comparativa](paridad/COMPARATIVA-PRESUPUESTOS-2026-11-01.md). Coinciden al
céntimo el 2O de 1200 (514,31), el 2 × 2 con uniones `U` (1.391,88) y la C2
de E7 (267,77), con totales e IVA iguales. Diferencias principales: la
descripción generada, el artículo `GRUPO` en conjuntos de una pieza, la
medida guardada (Productor 2400 con `U`, Aluminior 2401), el formato decimal
del PDF y la validación obligatoria de materiales y uniones. El elemento
invisible quedó observado (precio 0, sin despiece, cuenta en el ancho), y
Corregido el mismo día en código: las uniones configuradas restan la mitad de
su grosor a cada pieza y miden el lado común, regla contrastada con 26
conjuntos reales de la 0016. El 2 × 2 con `U` da 2400 × 2400 y 1.391,88 €, y
el caso 3 da 2800 con uniones de 4,12 € (1.117,76 €; queda la diferencia del
fijo invisible, DS3). Solo para configuraciones nuevas: las líneas guardadas
conservan su geometría. Tests core 677, web 812 en serie; publicado después en `main` (`bc0f227`).
Cobertura: 541 estructuras importadas, 160 dibujables. El compacto sigue
siendo E5.

## Portátil con mochila y relevo al equipo del titular — 31/10/2026

Con la mochila Sentinel conectada (licencia válida, `CLU Validado`) se preparó
la observación E1 y se decidió continuarla en el equipo del tío de Sergio, que
tiene Productor original sin fallos de componentes. En el portátil de Sergio,
Configuración del Programa no abre: falta `TODGUB8.DLL` y el aviso de True DBGrid 8
se repite sin fin. Se instaló solo esa DLL (build 2002 del paquete oficial de
ComponentOne), sin probar todavía su efecto. **No hay valores RED/locale
observados, ni R1 ejecutado, ni regla monetaria nueva.** El cargo sigue
desactivado y E1 `in_progress`.

La guía operativa, los pasos y los límites están en
[CONTINUAR-EN-WINDOWS §0](CONTINUAR-EN-WINDOWS.md#0-relevo-del-31102026-equipo-del-titular-con-visión)
y en el [plan R1 de PASO-E1](paridad/PASO-E1-DESPUNTE.md#plan-r1-con-mochila-31102026).
Claude debe operar Productor con visión (Computer Use), no esperar que lo haga
Sergio. Evidencia privada del portátil en `output/` (ignorada por Git): no viaja
con el repositorio.

## ClonerSoft — continuación local, 14/10/2026

[Selector de registros de tarifa dinámica](paridad/IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md)
implementado en `core/precios/tarifa-dinamica/`: cuatro búsquedas ordenadas,
intervalos decimales inclusivos y estados de ausencia, ambigüedad o bloqueo.
Selecciona criterios e identidad; no calcula precio ni activa tarifa.
47 pruebas nuevas; gate ejecutado: 2.004 correctas y la omisión previa por CSV
privado (964 core, 56 DB, 112 ETL, 872 web), tipos y arquitectura correctos;
revisión independiente sin hallazgos reproducibles en el contrato puro.
La aceptación integral Productor y la publicación siguen separadas.

E1, segunda unidad del 14/10: layout del despacho `+0x7ac` validado
estáticamente bajo el constructor VB6 inspeccionado; destino `cargaDetalle`.
Consumidor localizado: `alVDocumentoDespunte.DEScalcula`, con receptor del
formulario demostrado, lectura de `pbAceptar/pDespunte` y transferencia a
`DespuntePorc`/`Despunte`. No prueba reparto ni redondeo comercial.
Las TypeLib de `alBLLvdoc.dll` y `gaBBDD.dll` acreditan las declaraciones
COM del consumidor. La siguiente unidad acredita la creación estática de los
receptores de `alBDADO` como `alRecordset`, WORD `+0x56` de tabla auxiliar,
selector `rsTabla` y cuerpos delegados `rsEdit/rsCampo/rsUpdate`.
Control, reparto y totales también seguidos: selección comercial, sustitución,
descuentos y escrituras estáticas con límites explícitos. La frontera de formato
pasa a `VarFormat` de Automation; configuración efectiva, entrada de agregados
y persistencia durable siguen sin aceptación monetaria. No repetir receptores, selector,
wrappers/getters, declaraciones ya verificadas o inventarios.
[Evidencia y condiciones](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#control-reparto-y-totales).
Fuentes conservadas, verificadores reproducidos y revisión independiente.
Este lote es documental/estático; el gate de paquetes anterior corresponde a
`2a2dc57`, sin cambio nuevo del motor ni aceptación económica.
El timeout Ghidra anterior permanece como antecedente; no se reabrió la sesión.
Sin ejecución Productor, modificación de G6, datos reales, migraciones nuevas,
operación remota de negocio o despliegue. El navegador publicado no se usa
como evidencia de estos cambios locales.

## ClonerSoft E1 — implementación local parcial, 13/10/2026

[Contrato y entrega](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md):
`core/produccion/despunte-catalogo/` prepara grupos artículo/acabado/tonalidad,
metraje decimal exacto, cantidades de cortes y largo de barra explícito.
La selección condicional respeta filtros conjuntivos y prioridad; los empates
y los datos insuficientes bloquean. Son funciones independientes, sin conectar
presupuestos o producción ni escribir cargos. 67 pruebas nuevas y 1.957
pruebas de paquetes correctas, una omisión previa por CSV privado; tipos y
arquitectura correctos, revisión independiente y aserción de origen reforzada.
La aceptación monetaria E1 permanece abierta.
La investigación del 13/10 localizó nombres candidatos; su continuación
estática del 14/10 figura arriba. Siguen sin demostrar base, cantidades
económicas ni redondeo.
Los detalles, fuentes, contenciones y continuidad están en el contrato y
la [reconciliación del roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md).

## Reconciliación Windows — 13/10/2026 (cerrada localmente)

Integración autorizada de `origin/main` `913dd43` con los siete commits
locales de septiembre, hasta `97099bc`. El main posterior del Mac conserva
el estado operativo vigente; las ampliaciones compatibles de catálogo,
cotas, TMP, dibujo y PDF se recuperan sin convertir los ensayos de septiembre
en aceptación económica o fabricación.
Commit `fa32fba`, con ambos padres y cero conflictos; publicado después (está en `main`).

Se preservan los informes [fase 7/07–13](paridad/fase-7/13-cierre-cotas-c2.md)
y [fase 8/00–13](paridad/fase-8/13-cotas-economicas-y-relevo.md) como evidencia
fechada. Los recuentos 25 plantillas/14 uniones y los contrastes de 03V/C2FI
pertenecen a aquella copia y fecha; no sustituyen el catálogo posterior de
160 estructuras, el banco 400/523 ni las verificaciones de producción.
EMP0015 (2025), EMP0016 (2026), tarifas y originales se mantienen separados;
las copias `Anterior` no aportan muestras independientes.

**Verificación local de la integración, 13/10:** `npm run test:ci`: 1.890
pruebas correctas y una condicionada al CSV privado (850 core, 56 DB, 112 ETL,
872 web). Scripts: 123 Vitest y 119 node:test correctos; tipos de paquetes,
E2E y scripts correctos; arquitectura: 851 archivos, cero infracciones.
Diez recorridos E2E en escritorio/móvil correctos con PostgreSQL sintético:
alta, copia, decimales, PDF y teclado. Se corrigieron la fixture incompleta
de acristalamiento, el TipoPerf omitido por el adaptador CSV, la validación
visual de cotas explícitas y el campo del error de cota vertical. Antes del
arreglo se midieron dos fallos de fixture, quince de CSV con la fixture
completa y dos de cotas. Aserciones originales preservadas.
Revisión independiente: dos hallazgos de cotas, una corrección y gate ejecutado.
`packages/db` y sus migraciones coinciden con HEAD: sin SQL nuevo ni operación
remota. El cierre Git se registra en el historial local; publicación, recepción
y aceptación Productor siguen separadas. La verificación remota de 33/33 de
la sesión anterior es un antecedente, no una reconsulta en esta sesión.
La continuidad funcional sigue en el [roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md)
y [guía Windows](CONTINUAR-EN-WINDOWS.md): P.2, E1/E7 y matriz restante P.6/P.7;
no repetir A3/A4 ni las cargas y migraciones ya documentadas.

## Reconciliación del main Mac — 13/10/2026

Por petición de Sergio, se revisan todos los cambios pendientes y se integra
el main local `6a29bc4` con `origin/main` `4fb54b3`. De 98 archivos pendientes,
77 ya coincidían con el remoto. Se conservan las versiones publicadas de A3/A4,
miniaturas, teclado, precios dimensionales, migraciones y CI. El único código
nuevo frente al remoto es la herramienta de propuesta de doble acristalamiento,
sus pruebas y la corrección del import de `OpcionCatalogo` para scripts.
La herramienta bloquea propuestas cuyo modelo no reproduce el catálogo.
Verificación local: 1.651 pruebas de paquetes correctas y una omitida por CSV
privado, seis pruebas de propuesta y diez recorridos E2E correctos; build,
tipos de paquetes/E2E/scripts y arquitectura (cero infracciones) correctos.
No se incluyen fuentes privadas ni secretos. Las demás ramas locales ya están
contenidas en `origin/main`; los cambios documentales de la copia de auditoría
son antecedentes ya integrados y actualizados, conservados en esa copia.
[TARIFA-DOBLE-ACRISTALAMIENTO](TARIFA-DOBLE-ACRISTALAMIENTO.md) conserva las
hipótesis y decisiones pendientes; publicar el código no aplica la tarifa.
Esta entrega verifica código local y publicación Git; no reconsulta producción,
no aplica migraciones ni certifica aceptación Productor. El siguiente trabajo
sigue siendo la matriz restante de P.6/P.7 y E1 en Windows.

Comprobación directa de Supabase el 13/10/2026 tras petición de aplicar cualquier
migración pendiente: journal remoto con las 33 entradas locales hasta `0032`,
fechas concordantes y cero pendientes. Los hashes coinciden salvo `0020`, cuyo
hash remoto coincide exactamente con el SQL local convertido a CRLF; es una
diferencia de saltos de línea, no de contenido. Verificadas las dimensiones
`double precision` de `lineas`, `acabado_articulo_codigo` y la tabla dimensional
con RLS. Consulta de solo lectura; no se aplicaron migraciones ni se modificaron
datos o journal remoto.

## ClonerSoft publicado técnicamente — 12/10/2026

[Investigación y cambios](paridad/INVESTIGACION-CLONERSOFT-2026-10-12.md) desde
`origin/main` `9ae7a6e`; [publicación y recibos](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md)
en `40cedd1`. EMP0016=2026 y EMP0015=2025 confirmados; copia del banco
identificada por huella. C1: precio por medidas, acabado de artículo y
contención de tarifa plana publicados y verificados en su alcance acotado.
0031/0032 aplicadas; 17.547 metadatos y dos PVP cargados desde la misma
proyección. Respaldo completo y restauración local comprobados; proyección
original de 59 tablas/462.617 filas y 31 migraciones previas intacta.

Gate remoto final correcto: tres documentos QA nuevos sin clientes previos,
siete líneas, guardado/recarga, edición de cantidad con misma identidad,
copia/revisión y cinco PDF, incluido el posterior a F9. Acabado/medidas/PVP
conservados; falta de medidas produce nulos y «Sin valorar» en web/PDF. Tras QA hay 17 presupuestos/12 líneas;
los 14 presupuestos/cinco líneas anteriores conservan sus firmas. El contenido
de las 60 tablas postcarga permanece intacto salvo los documentos, líneas y
tres recibos QA autorizados.

P.6/P.7 está parcialmente publicado: búsqueda/teclado/foco verificados con diez
recorridos escritorio/móvil. 1.644 pruebas correctas, una condicionada a CSV
privado; tipos, arquitectura y build correctos. Ambos workflows de `40cedd1`
finalizaron con `success`. Banco nuevo conserva 400/523 y sus exclusiones.
La MO del vidrio no se activa con coeficientes cero. E1/E2/E6, coste dimensional,
fabricación y aceptación comercial siguen abiertos. La restricción sobre el main antiguo quedó superada por la reconciliación
del 13/10 descrita arriba; las tarifas propuestas siguen sin aplicar.

## Entrega funcional de presupuestos verificada

[A1: auditoría del 09/10](paridad/AUDITORIA-FUNCIONAL-2026-10-09.md) publicada y
verificada sobre 260009: editar/guardar, recargar y PDF descargado válido;
base 665,83 €, IVA 139,82 €, total 805,65 €, con avisos técnicos conservados.
El visor PDF interno quedó gris; archivo analizado y renderizado correctamente.
No certifica paridad económica ni fabricación. Correcciones publicadas: herraje por defecto, errores recuperables, estados de
documento, diagnósticos visibles y cargas de opciones seguras. Acristalamiento
alternativo sin receta verificada queda incompleto. El rechazo de exteriores
fraccionarios de A1 quedó superado por A4/0030: alta, edición, copia y PDF
conservan decimales en producción. Ver informes para pruebas y límites.

## Continuación S1/A2 publicada

[Informe de mantenimiento y miniaturas](paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md):
audit npm 11→0 y producción 4→0, 1.431 pruebas, tipos/arquitectura/build correctos.
La miniatura representa todo el GRUPO con posiciones/proporciones guardadas.
QA local de tres módulos, dos uniones, guardado/recarga, teclado, escritorio/móvil
y PDF correcto; 260009 repetido en producción mantiene 805,65 € y sus avisos.
No hay cambios de tarifas, valoración ni migraciones. El anuncio posterior de
Next para el 14/10 quedó revisado el 04/11/2026 en `fix/s2-next-zod-seguridad`;
el audit 0 de S1 no lo cubría. No repetir esa revisión.

## A3 publicado

[Informe A3](paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md): alta/copia/revisión
idempotentes con recibo transaccional. 0029 aplicada; prueba sintética remota
260010/0, 260011/0 y 260010/1, tres recibos y mismos IDs al reintentar en READ ONLY.
Los nueve documentos anteriores y tres líneas conservan sus huellas.

## Qué funciona

- Producción: catálogo visual de **160 estructuras**, incluida la entrada
  directa al configurador. Migración `0022_catalogo_diseno` y relleno aplicados
  en Supabase según el cierre autorizado del 02/10 y el contexto del usuario.
  **Verificado por Sergio en la web publicada el 02/10/2026:** 160 modelos
  y composición C2 + C3. Esta observación acredita el catálogo y la composición;
  no certifica la valoración del motor.
- Código: composición bidimensional, configuración por elemento, búsqueda de
  vidrio, uniones, guardado de una línea GRUPO, reapertura, copia y PDF.
  La existencia del código no acredita paridad integral con Productor.
- Motor de catálogo integrado en main: tablas de `0023_motor_catalogo`,
  protección `0024_motor_catalogo_rls`, cargador dirigido y lector compatible.
- Producción, **verificada por Claude y recibida en el relevo del Mac del 03/10**:
  Render live en `08310cb4ad0af26e332c26941dbc56228d27d834`, que incluye `e2b0232`.
  Consulta Supabase READ ONLY: 29 migraciones hasta `0028_medidas_nuevas_ventanas`,
  261.301 filas en doce tablas del motor; 15.263 filas de plantilla, 15.063
  parámetros de conjunto/serie y 541 parámetros de estructura. Los conteos
  protegidos coinciden con el relevo. Codex leyó el [documento de coordinación](https://docs.google.com/document/d/1rgwt5oFt1beE7sePN8dINo1cicgjqkl1lTH9VCue4-U/edit)
  y el pendiente July 212; no repitió consultas remotas ni verificó el respaldo.
  Esto acredita el estado informado de carga/despliegue, no aceptación funcional.
- Banco local medido el 03/10 con la copia `Anterior.mdb` y los servicios web:
  **400/523 líneas elegibles al mismo precio (76,48 %)**, frente a 5/523 de base.
  434 exclusiones conservadas; 81 cercanas (58 por PVP actualizado después del
  presupuesto, no reproducible), 5 distintas, 37 sin valorar y 0 errores.
  Trece iteraciones con evidencia y ninguna igualdad perdida: Acabado2, cortes del
  snapshot, nTAcris, compacto, horas por unidad, comisión de cabecera, cotas y MO
  por categoría, mosquitera/tapajuntas, batiente, incremento sobre precio, acabado
  del vidrio, opciones por defecto y configuración GRUPO con medidas fraccionarias,
  catálogo de diseño compartido y representación explícita de U («SIN UNION»).
  [Historial, evidencia y pendientes](paridad/BANCO-CONTRASTE-2026-10-03.md).
  Catálogo reconstruido en Windows solo en `aluminior_real_test` (29 migraciones);
  precios y márgenes sin modificar. Los 31 GRUPO antes rechazados ya pasan la
  validación: 20 iguales y 11 aún sin valorar por causas distintas de configuración.
- Análisis de los resultados guardados: [97 pares modelo/serie](paridad/COBERTURA-MODELO-SERIE-2026-10-03.md)
  y [matriz de reglas](paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md).
  440/523 coinciden en artículos y cantidades; 436/523 también en cortes/unidad;
  360/523 coinciden simultáneamente en esos campos y precio. Acabados literales
  y funciones incompletas se separan; no es certificación de fabricación ni
  una nueva ejecución del banco. Denominador y exclusiones conservados.
- Comisión de cabecera (pestaña `Gastos`: `Comisión` % y `Sumar Comisión`) en la ficha
  del presupuesto. Migración `0027_presupuesto_gastos_comision` (tabla aparte, RLS) aplicada en
  `aluminior_real_test` y en Supabase (03/10). Sin
  ella la web lee comisión 0 y rechaza guardar otra. Con `Sumar Comisión`, el alta de
  estructura y el alta o edición de GRUPO aplican el factor al precio; el despiece
  queda en base y la copia arrastra los gastos. Artículos sin comisión (sin evidencia).
  Cambiar la comisión sumada con líneas de estructura o GRUPO valoradas se rechaza:
  no se revalora nada guardado hasta observar en Productor si recalcula.
- Desarrollo en Mac con Docker. En la base local `aluminior_test` se comprobaron el 02/10
  25 migraciones y RLS en las once tablas del motor; catálogo y estructuras
  vacíos. Es un antecedente de ese entorno/fecha, no el estado de producción.

## Qué falta: valoración

- Caso publicado A1 ejecutado el 09/10: 2O ELEGANTPVC 1200×540, L,
  VCG420AGS4, 5 h de colocación y tarifa 1; guardado/recarga/PDF coherentes.
  Repetido con `f6d5bcd`: 805,65 € total; dos piezas siguen sin coste.
  Los defaults de herraje añadieron 54,50 € al material; no se tocaron tarifas.
  Ni 652,24 € histórico ni 739,71 € anterior son objetivos impuestos.
- La web conserva la vía anterior si falta el catálogo. Tener 160 dibujos
  disponibles no significa que las 160 estructuras tengan precio completo.
- Ensayos locales fechados con catálogo cargado obtuvieron PVP con avisos para
  C2 y PC2; fijo 0, 2O y 1OFI siguieron incompletos en GMC400.
  Son observaciones anteriores, no una medición actual de producción.
- Falta contraste integral de artículos, medidas, herrajes, vidrio, mano de
  obra, tarifas y redondeo con iguales entradas en Productor.
  No hay aceptación general de precio ni fabricación.

## Riesgos

- El importador completo vacía tablas y puede destruir documentos.
  Usar únicamente la carga dirigida para el alcance autorizado.
- Un resultado incompleto conserva importe nulo y «Sin valorar»;
  no convertirlo en cero ni aceptar sumas parciales como precio completo.
- Los snapshots `FILA_CENTIMOS` y los acabados de artículo necesitan lectores
  compatibles. Una reversión requiere bloquear escrituras primero y preservar
  columnas/journal/líneas nuevas; restaurar sólo metadata/PVP afectados. Volver
  sólo a web antigua puede perder acabados en copias y eludir la contención
  de PVP plano. Ver [reversión](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md#reversión-compatible).
- Diseños específicos, variantes y flujos sin evidencia siguen pendientes.
  Las capturas y salidas privadas mencionadas en informes pueden no existir
  en otra copia; no reconstruir evidencia ni asumir sus resultados.

## Siguiente paso

**Siguiente:** prueba de Sergio del diseñador y QA con sesión en producción de DG1, VA1, GR2,
PDF1 y DS2; después, los 16 GRUPO con el patrón de GR2 y `caso-02155` de E2.
DS2 (06/11/2026): deshacer y rehacer de todo cambio del conjunto y mover también el primer
elemento dejando fijos a los demás; ver su fila del roadmap. No rehacerlo.
PDF1 (06/11/2026): el PDF escribe medidas, importes, cantidades y horas en formato español
(«970,0 × 1.999,5», «1.391,88 €»); ver su fila del roadmap. No rehacerlo.
E2 medido el 06/11/2026 en la 0016 con el banco local: `coincide` 26 → 33 de 176 GRUPO y
`union-otra-serie` 30 → 1 ([roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md)).
Defecto del banco encontrado: `contraste-presupuestos.ts` termina con código 0 aunque la base no
responda (todos los GRUPO en `error-del-servicio`); comprobar el contenedor antes de leer un resultado.
No reimplementar la serie propia de la unión ni repetir M1, GR1 (motor del 02/11 y UI de cotas del 03/11; no rehacerla), E5 o E5b.
GR2 (unión que recorre varias piezas) está publicado el 05/11/2026 (`1040a92`) y su precio medido en local el mismo día (`coincide` 24 → 33 en 176 GRUPO de la 0016): no rehacer la regla ni la medición; quedan 16 GRUPO con el patrón ([roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md)).
La ubicación de esas cotas en el panel es hipótesis; confirmarla en Productor queda para el equipo de la mochila.
La observación E1 por visión sigue en el equipo del titular
([§0](CONTINUAR-EN-WINDOWS.md#0-relevo-del-31102026-equipo-del-titular-con-visión));
no se reanuda desde este portátil. Los párrafos siguientes son antecedentes
fechados y no ordenan trabajo.

**Antecedente ClonerSoft/E1 local:** preparación física/condicional, layout/getters,
consumidor, declaraciones COM, receptores y cuerpos de control/reparto/totales
entregados en su alcance estático. Máscaras, tipos y contrato público de formato
ampliados el 17/10; empates/localización efectiva permanecen sin ensayo.
Proveedor `gaConfigDAL.Carga` y fallback condicionado del argumento BSTR `2`
seguidos en la [unidad de configuración](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#proveedor-de-configuración-y-argumento-2).
La [procedencia de la carga](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-y-precedencia-del-índice-de-configuración)
ya está seguida en su alcance estático. La [unidad del índice](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#configuración-construcción-y-selección-del-índice)
continúa construcción y selección; no repetir `xConfig`, ordenación ni búsqueda.
La [continuación de claves](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves)
sigue inicializador del comparador y bifurcación del normalizador; no repetirlos.
La [unidad de fila y delegados](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#clave-de-fila-y-transformaciones-del-índice)
atribuye el cuerpo propio `x_Clave` y proveedor/slots de transformación; no repetirlos.
Los [predicados internos](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena)
quedan seguidos en su alcance estático; no repetirlos. La [frontera WCTMB](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte)
acredita contrato público y enlace candidato, sin demostrar resolución runtime.
Las [escrituras de estado](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-estado-de-kernelbase)
ya están seguidas en su alcance condicionado. La escritura literal del selector
también queda seguida. El DWORD queda atribuido a `_RTL_USER_PROCESS_PARAMETERS.Flags`
`+0x8` mediante tipos x86 identificados. Inicialización local a 1 acreditada en
`0x4b2aa8f8`; entrega `0x4b2aa9df` y wrappers seguidos. Llamador Ex en
ncryptprov `0x1003da6a` y slot local `[EBP-0x64]` acreditados. Frontera archivada:
llamada importada NtCreateUserProcess `0x1003db34`; no se acredita continuidad
del contenido tras el helper intermedio ni conexión con el PEB consumidor.
Conversión efectiva, equivalencia,
prioridad de duplicados y valores runtime siguen abiertos.
Las cuatro escalas efectivas siguen sin demostrar. Después, entrada de agregados comerciales.
No repetir integración `fa32fba`, preparación, wrappers/getters, declaraciones,
WORD de tabla auxiliar, selector `rsTabla`, enlaces delegados, máscaras,
proveedor/argumento `2`, AbreRS/carga de lista o cuerpos ya seguidos.
Sin activar cargo ni operar G6.

**Equipo del titular, 31/10 (antecedente, no es el puntero):** Claude opera Productor por
visión según [CONTINUAR-EN-WINDOWS §0](CONTINUAR-EN-WINDOWS.md#0-relevo-del-31102026-equipo-del-titular-con-visión):
F1 (leer RED y locale), después R1 del [plan](paridad/PASO-E1-DESPUNTE.md#plan-r1-con-mochila-31102026),
y afinar Aluminior solo con regla demostrada.

**Windows, observación pendiente:** recepción y fuentes privadas → aceptación comercial P.2 con el
titular; investigación económica E1 desde G6-incidencia y E7 tras A4, según
[la guía](CONTINUAR-EN-WINDOWS.md). No repetir A3/A4 ni migraciones.

S3 verificado localmente y en GitHub Actions (`36a47f4`): 1.448 pruebas correctas,
una condicionada a CSV privado, seis recorridos, tipos, arquitectura y build; ver [evidencia y ejecuciones](paridad/MEDIDAS-Y-CI-2026-10-09.md#s3-validación-completa-de-los-paquetes-en-ci--09102026).
Pendiente registrado el 12/10 (histórico): matriz de P.6/P.7 — anchuras, zoom
200%, reduced motion y comparación humana. Los tramos locales del 18–19/10
figuran arriba; el 12/10 la continuidad entonces era comparación humana y recorrido
autenticado aislado autorizado. No es el puntero. C1/0031/0032/carga/publicación
y QA remoto completados el 12/10; no repetirlos. Teclado/búsqueda/foco de este
tramo están parcialmente publicados; su aceptación integral sigue abierta.

**A3 publicado/verificado el 09/10 en `a06cd4f`, con 0029 aplicada.** A4 publicado/verificado en `487feb1`: 0030 aplicada, conexiones renovadas y alta/edición/recarga/copia/PDF decimales comprobados en producción. A5 verificado en GitHub Actions (run 37971854995, seis recorridos correctos). D1 reconciliado localmente. [Informe](paridad/MEDIDAS-Y-CI-2026-10-09.md). E1 requiere observación aislada del original con alcance propio; la investigación interna de Windows está archivada. P.2 conserva aceptación comercial. S2 quedó verificado en local el 04/11/2026; no repetir la revalidación del 14/10.

Antecedente P.2: rama `codex/pdf-multipagina`, worktree `pdf-multipagina/Aluminior`, desde
`7ad0ee2`. P.2 publicado en `46c613d`; endpoint PDF 260009 comprobado sin escritura, 1 página / 805,65 €. Ese main quedó reconciliado el 13/10 con `origin/main` del 12/10; se conservan
las mejoras publicadas y la herramienta de propuesta, sin aplicar tarifas.

### Investigación económica conservada

Pendientes del [banco local](paridad/BANCO-CONTRASTE-2026-10-03.md): de los 31 GRUPO
de la iteración 13 quedan 8 con unión material de serie distinta, 1 con variantes
de vidrio por elemento, 1 con PVP ausente/ambiguo y 1 con bloqueo de acristalamiento.
E2 atiende los primeros: la unión ya guarda su propia serie y el banco la traslada
([evidencia y límites](paridad/EVIDENCIA-E2-UNION-SERIE-2026-10-19.md), 19–20/10,
local). Desde el 03/11 E2 está en `main` (`0a4958b`), medido en la 0016 el 06/11: las cifras
del 20/10 son del banco de la rama Codex, no de esta integración. Medido el 20/10 con base local y la copia autorizada: 407/523 líneas
iguales (77,82 %) frente a 400/523, GRUPO 30/45 y cero líneas con la causa de
serie de unión. Después, la [variante de acristalamiento por rango de la
serie](paridad/EVIDENCIA-VARIANTE-ACRISTALAMIENTO-2026-10-20.md) deja el banco
en 410/523 (78,39 %) y los GRUPO en 33/45, sin líneas bloqueadas por variantes
de vidrio por elemento. Después, la [omisión de junquillo sin fila](paridad/EVIDENCIA-OMISION-JUNQUILLO-2026-10-20.md)
deja las igualdades en 410/523 y baja sin valorar de 25 a 21: cuatro líneas
pasan a valoradas y ninguna a igual. No repetirla ni ajustar la tarifa para
cuadrarlas. Sigue pendiente la comparación lateral en Productor.
Las causas ya cerradas sin regla y su condición de reapertura están en
[CAUSAS-CERRADAS](paridad/CAUSAS-CERRADAS.md); consultarla antes de elegir
unidad y calcular el techo con `scripts/techo-de-causa.mjs`. El 21/10 se cerró
sin regla [la familia 112 de accesorios](paridad/EVIDENCIA-TUBOS-FAMILIA-112-2026-10-21.md),
tres líneas: la plantilla del tubo ofrece cuatro filas, el despiece guarda una y
los tres casos guardan tres distintas sin dato que lo determine. De las 21 sin
valorar, diez son el despunte de cabecera (E1, parado por la licencia) y solo
`caso-01869` y `caso-01944` quedan como unidades de una línea sin veredicto.
También quedan despunte de cabecera (10) y las observaciones en Windows.
La primera matriz está entregada; seguir la [lista de ensayos mínimos](paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md):
despunte, unión de otra serie, comisión, tapajuntas, compacto, acristalamiento y
fracciones. Coordinar con la conversación de visión antes de operar 0017 u
obtener una copia. Verificar una regla antes de corregir el motor y repetir el
banco conservando igualdades/exclusiones.

**Ensayo económico E1 — despunte (antecedente, no es el puntero),** según el [procedimiento preparado](paridad/PASO-E1-DESPUNTE.md).
En curso: [manual y contraste guardado del 04/10](paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md)
acreditan la resta de costes en 13 documentos positivos con detalle de otra
copia Windows; ocho discrepancias y un cargo sin detalle se conservan.
La huella difiere de la del banco; no sustituye su medición ni resuelve sus diez
candidatas. Motor y UI no cambiaron en aquella observación. No repetir esa investigación; comprobar
evidencia posterior. A–F conservados: C2 GMC400 1500×1150, VCG4 y acabado L;
segunda línea por duplicación. Recálculo sustituye el cargo; repetición y
reapertura conservan resultado. Copia privada F de 0017 verificada y lector
específico, trece pruebas y typecheck dirigido. Margen GID 0,01 % sobre coste
explica residuo B/D de 0,02 €. Complementario G1–G5 verificado: segunda C2
1200×1150 añadida desde configurador después del cargo, sin heredarlo ni
repartirlo automáticamente; primer precio y cargo se conservan hasta recálculo.
Mismos parámetros sustituyen el cargo y reparten por bases sin cargo anterior,
frente a reparto igual o precios cargados. F9/reapertura conserva la proyección
técnica completa. Datos privados en output/e1-despunte/complementario-20261004.
Las tres políticas de redondeo coinciden en G4. Variante 1207×1150 con
propiedades verificadas produjo error de opciones/SessionFactory y tercer
GRUPO, sin sustituir segunda C2; G6-incidencia conservada, sin nuevo despunte.
La propuesta del 04/10 de retirar el tercer GRUPO queda histórica e inactiva.
El 19/10 el siguiente entonces era empresa sintética nueva con RED/locale y predicciones
discriminantes; no modificar G6. Las dos líneas previas siguen idénticas a
G4/G5. No repetir A–F, G1–G5 ni diagnóstico
GID. Descuentos cero/cantidad 1 no discriminan base bruta/neta. E1 sigue En
curso; cargo presupuestario y banco conservados. El subcontrato físico local
del 13/10 se registra por separado arriba. Retirar instrucciones agotadas y preservar
evidencia al completar cada etapa.

Comisión sí está en Gastos. Los campos de horas de fabricación/colocación están
en el alta de estructura (`campos-alta.tsx`) y se transmiten a la valoración por
unidad (`lineas/alta-linea.ts`); GRUPO conserva ajustes por línea. Los accesorios
tienen valoración de catálogo, pero no se afirma cobertura integral de sus
controles UI sin aceptación. La carga de producción informada ya incluye
0025/0026; la vía anterior se conserva para entornos sin catálogo completo.
La aceptación del recorrido A1 con las correcciones publicadas quedó verificada
el 09/10; no equivale a paridad integral de precio ni fabricación. D1: ficha de acceso de July reconciliada localmente el 09/10 con evidencia A4/0030;
sin sync ni recepción Windows acreditados.

## Enlaces

- [Roadmap y reglas de mantenimiento](../ROADMAP-PARIDAD-PRODUCTOR.md).
- [Investigación económica E1: despunte](paridad/PASO-E1-DESPUNTE.md).
- [E1: evidencia parcial y diagnóstico reproducible](paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md).
- [Cobertura, reglas y fuentes](paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md).
- [Ensayos mínimos pendientes](paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md).
- [Integración, cargador y verificación del motor](paridad/INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).
- [Catálogo visual y observaciones](paridad/CATALOGO-REAL-2026-10-02.md).
- [Mapa y criterios de paridad](paridad/PARIDAD-PRODUCTOR.md).
- [Arquitectura](../ARQUITECTURA.md) · [Contrato](../AGENTS.md).
- [Índice: evidencia e histórico](INDICE-DOCUMENTACION.md).
- [PostgreSQL local y pruebas](../packages/db/README.md).
