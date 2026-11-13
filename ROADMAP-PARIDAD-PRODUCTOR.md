# Roadmap operativo de paridad con Productor

Actualizado: 06/11/2026, `main` = `ab4c5b9` (producción comprobada: `7bd12d3`; el despliegue de `ab4c5b9` está sin comprobar). Todas las ramas de trabajo están integradas en `main` (M1, E2, GR1, E5, E5b, E6, DS2, DG1, VA1, S2, GR2 y el arreglo del banco) junto con la línea E1 de Windows (31/10). E2 medido en la 0016 el 06/11. Entrada: [ESTADO-ACTUAL](docs/ESTADO-ACTUAL.md).

Antecedente 21/10, rama Codex, no es el puntero: familia 112 cerrada sin regla; firma de base v2; medición de banco 410/84/8/21; omisión de junquillo sin iguales nuevas; zoom 200% local. [Auditoría 19/10](docs/paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md): Render entonces en `40cedd1`; diez E2E con PostgreSQL Docker y QA local; Auth real pendiente; G6 protegido. No repetir esa auditoría.
Este archivo es el registro único del orden y estado de estas tareas.
Los documentos de ensayo explican cómo realizarlas; los informes fechados
conservan evidencia. Sus antiguas listas de pendientes no sustituyen este registro.
Antes de elegir una tarea del banco, consultar
[CAUSAS-CERRADAS](docs/paridad/CAUSAS-CERRADAS.md): recoge las causas ya
investigadas y cerradas sin regla, y qué evidencia nueva reabre cada una.
El techo de una causa se calcula con `scripts/techo-de-causa.mjs`, no se estima.


## Siguiente paso

**Diseño específico, 13/11/2026 (sin commit, sin publicar):** la causa mayor de los 90 `difiere` del 12/11 era el diseño específico: elementos que el operador modifica en `Diseño V3` (travesaños, cotas, hojas en un hueco, otro vidrio, barrotillos), para los que Productor guarda una plantilla de despiece propia en el documento. El motor valora ya un módulo con su plantilla propia (`plantillaPropia` / `plantillasPropias`), el vidrio propio de cada hueco (`vidrioPropio`), el barrotillo interior `BI` y el metraje por metro con múltiplo de largo, y admite más de cinco cristales por pieza. Con las plantillas y diseños del documento leídos de la copia, el banco de la 0016 pasa de 83 / 90 / 39 / 13 a **111 coinciden** (`273.023,76 €`) / **60 difieren** (`186.189,44 €`) / **41 sin valorar** (`139.088,35 €`) / **13 no reproducibles**, receta igual en **145**; 28 `GRUPO` pasan a coincidir y ninguno deja de hacerlo. Contrastado en Productor (0017, presupuesto 260507): 236,96 € en ambos. Detalle, reglas y lo que queda en el [informe](docs/paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#actualización-del-13112026-diseño-específico--vigente) y en la [guía, Diseño V3](docs/paridad/GUIA-DISENADOR-PRODUCTOR.md#diseño-v3-observado-el-13112026-empresa-de-pruebas-presupuesto-260507). **Lo que no está hecho:** Aluminior no tiene el editor `Diseño V3` ni genera la plantilla a partir del diseño; es la tarea DS4, la siguiente de paridad de valoración. Los párrafos siguientes conservan los números del 12/11 como antecedente.

**Sesión con mochila y contraste del banco del 12/11/2026 (`30dbc16` + reglas de compacto en GRUPO, sin publicar):** guías de persiana y compacto contrastados en la 0017 (presupuesto 260504) y en toda la exportación `EMP0013`–`EMP0016` (21 `GRUPO` multicolumna con guías, 59 módulos): la ventana se estrecha por `DescuentoGuia` (ambas guías en la primera columna y solo `guiaDerecha` cuando hay otra pieza a la izquierda, aunque sea un fijo sin compacto), el compacto conserva el hueco y toma el acabado de la ventana (`CompAccAcaGuias` en el perfil de guía lateral), y `VAccesorios.nModulo` (`1..N`) numera siempre la fila superior (`modulosSuperioresCerramiento`, `indiceModuloCompacto`). Con ello y con la resolución por orden de `nModulo` de los elementos `COM*` cuando `nLinEstrGrupo` es `0` o copiado (`1124, 1249, 1313`), el banco de `GRUPO` de la 0016 (225 `GRUPO`, 186 docs) pasa de **24 / 91 / 97 / 13** (`3504eb4`) y **72 / 101 / 39 / 13** (`30dbc16`) a **83 coinciden** (`190.858,31 €`) / **90 difieren** (`271.666,29 €`) / **39 sin valorar** (`135.776,95 €`) / **13 no reproducibles** (`40.327,66 €`), con **114** recetas iguales y **172** repartos de unión coincidentes; quedan resueltos los documentos `871, 881, 937, 1234, 1239, 1249, 1264, 1265, 1274, 1287, 1313, 1339, 1368`. Ver [GUIA-DISENADOR §5](docs/paridad/GUIA-DISENADOR-PRODUCTOR.md#contraste-del-12112026-empresa-de-pruebas-presupuesto-260504). Quedan por demostrar o atacar, por importe en los 90 que difieren: `diseno-especifico` (51 `GRUPO`, `151.131,76 €` en líneas, `11.159,76 €` atribuibles: divisiones internas, fijo lateral/inferior o corredera de 3 carriles no representados en la plantilla base), `reparto-uniones` (29 `GRUPO`, 10 principales, `94.158,45 €`: unión asimétrica o redondeo entero de hueco impar), `tarifa` (30 `GRUPO`, 19 principales, `85.116,67 €`: tarifa histórica de presupuestos de nov 2025–feb 2026 o céntimos de `COMPVAL`), `importe-de-fila` (15 principales: mosquitera `PSM001` y `VOpciones` por módulo en `1029`/`1124`, y un único `COM009` de 2.500 mm que cubre dos `PC2` de 1.250 mm en `1019`/`1020`), `vidrio` (10 `GRUPO`, 2 principales en `1080`: junquillo de cámara de 30 mm cuando `CorrGrosorVidDA = 26` en `GMA350`), `mano-de-obra` (3 principales), `compacto` (1 principal: fila huérfana `nModulo=3` con `nLinEstrGrupo=0` en `854`) y `tapajuntas` (2 `GRUPO`, 1 principal: `GMT005` en módulo de `756`). En los 39 `sin-valorar`: 12 por `despunte` (E1), 11 por `otro-accesorio` (tubos `112` o doble accesorio), 10 por `PVP` ausente en tarifa (`PSU006`/`PSESQCOM` en 5, `1OPLD` en 3, `GMA05` en 1, `1811` en 1), 4 por estructura sin despiece en catálogo (`04V` en 3, `C2P` en 1) y 2 por `union-otra-serie` con perfil sin PVP.

**Siguiente:** en paridad de valoración, DS4 (editor `Diseño V3` y generador de la plantilla del diseño propio; ver su fila). En lo demás, observación de Javi del 09/11 sobre búsqueda de cliente por calle, nombre, teléfono y, en el listado de presupuestos, por fecha y precio: hecha en local, sin publicar; no rehacerla. Siguen llegando observaciones. Que Javi pruebe con `Manual/TUTORIAL-JAVI.md` y devuelva observaciones (07/11/2026); QA con sesión en producción de DG1, VA1, GR2, PDF1, DS2 y DS3. Después contrastar el compacto/tapajuntas por elemento (CF1) con un documento real de la 0016. Después, con el banco local, los 16 GRUPO que conservan el patrón de GR2 y `caso-02155` de E2. DS2 (deshacer y mover el primero) y PDF1 quedaron hechos el 06/11: no rehacerlos. E2 quedó medido el 06/11 (ver su fila): no reimplementar la serie propia de la unión ni repetir la medición. Tampoco repetir M1, GR1 (motor del 02/11 y UI de cotas del 03/11; no rehacerla), E5 o E5b. La observación E1 por visión sigue en el equipo del titular y no se lanza desde este portátil. La ubicación de las cotas en el panel es hipótesis y la medición del banco de GR1 no se repite desde este portátil.

**Contraste de GRUPO reales (02/11/2026), antecedente del orden:** [informe](docs/paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md).
Medidos los 17 ejercicios (2010–2026, 4.107 GRUPO); con el catálogo actual
solo son reproducibles 2023–2026. Orden por importe en 2026 y frecuencia en
2023–2026 tras GR1 y E5b: E2 (varias series, 40 en la 0016 / 140), E6 (vidrio por
elemento, 24 / 117), GR2 (unión que recorre varias piezas, 44 / 221, pero 749 € en
2026); el reparto desde el hueco es ya la causa principal de 31 GRUPO de la 0016.
- GR1 motor verificado en local el 02/11: `cota-fi-fs` bajó de 31 a 0 en la 0016; 26 pasaron a valorarse. UI del configurador del 03/11/2026, en `main` desde `cd3dba4`; la ubicación junto a Ancho y Alto es hipótesis y la UI no se ha medido con el banco. No rehacer esa UI.
- E5 parcial el 02/11 ([corrección](docs/paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#corrección-del-mismo-02112026-vigente)): el compacto se valora en su módulo solo con opciones guardadas y evidencia completa; si no, se aparta. La 0016 queda en 23 / 92 / 97 / 13, igual que tras GR1. La primera entrega retrocedía (53 GRUPO sin valorar) y su `regresion-06` usaba opciones de otra línea; ambas cosas están corregidas.
- E5b verificado en local el 02/11 ([informe](docs/paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#e5b--opciones-predeterminadas-del-catálogo-02112026-vigente)): migración 0033 y carga de `EstructurasOpcOpciones`. El despiece aplica la predeterminada al grupo sin opción guardada. En la 0016, 24 coinciden (+1), `compacto` baja de 53 a 8 y `regresion-06` coincide al céntimo con datos reales. El 02/11, 0033 no estaba aplicada en Supabase; el 03/11 producción declara 0033–0035 aplicadas.
El 02/11 el siguiente era E2 (40 GRUPO de la 0016). M1 está en `main` y no está medido contra la 0016 ([plan](docs/paridad/PLAN-M1-MANTENIMIENTO-UNIONES-2026-11-02.md)). De los pendientes menores de E5 anotados el 02/11, el 12/11 quedaron resueltos `881`, `1249` y los 7 casos de acabados distintos de lamas o guías (`937, 1234, 1239, 1264, 1265, 1274, 1287`); solo quedan `1019` y `1020` (un único `COM009` de 2.500 mm que cubre horizontalmente dos `PC2` de 1.250 mm).

### Antecedente 19/10 (no es el puntero)

La evaluación de las ocho preguntas del 18/10 está
[realizada en su matriz existente](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contraste-de-las-ocho-preguntas).
Corrección local: costes decimales equivalentes ya permiten mostrar el coste
técnico en Producción; sin cargo al presupuesto. Sergio ya autoriza el ensayo
aislado de configuración/redondeo el 19/10. R1 y sus cuatro predicciones están
preparados. Inventario administrativo recibido y verificado: Hyper-V responde,
cero VMs registradas, Sandbox deshabilitado; no repetir el comando. Sergio
elige aprovechar la instalación existente: copia sin MDB/empresas preparada
con hashes verificados. Reinicio y apertura de Sandbox completados: recibo
invitado correcto, primer intento detenido por Crystal Reports 13.0.35.
El MSI local es 13.0.0.99; el oficial 13.0.35.4870 quedó instalado sólo en el
invitado, con salida 0 y sin reinicio. Al reabrir la copia, Crystal ya no
bloquea. Parada sin pulsar Aceptar: pide actualizar controles y librerías.
No repetir reinicio/activador/inventario ni exigir demo ni llamar R1 al
comprobador.
[Procedimiento E1](docs/paridad/PASO-E1-DESPUNTE.md#ensayo-autorizado-del-1910-configuración-y-redondeo).
No pedir de nuevo autorización para el alcance concedido ni ejecutar en host.
Tramo P.6/P.7 de componentes de producción verificado
localmente: referencias largas, teclado, anchuras, movimiento reducido y zoom
nativo 200%. Cabecera/configurador: seis rechazos/selecciones discriminados,
foco, borrador y atajos con fixtures sin persistencia a cuatro anchuras.
Retorno de foco tras alta aceptada simulado ya corregido: Añadir primera
ventana, rechazo/reintento/borrador y segunda alta. Zoom nativo 200% del
configurador verificado el 19/10, con etiqueta contenida y capturas completas.
Auditoría del 19/10: diez E2E ya prueban guardado/copia/reapertura en PostgreSQL
Docker nuevo con acceso QA local; no prueban Auth Supabase ni precio aceptado.
El 19/10 el siguiente de P.6/P.7 era Auth real en aislamiento y comparación humana del mismo
recorrido con Productor, con alcance propio. No es el puntero. No repetir los diez casos sin
cambios o un fallo nuevo que lo justifique.
[Alcance y límites](docs/paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-del-1810-y-siguiente-entrega).

### Antecedentes estáticos conservados (no instrucciones de continuidad)

**Unidades E1 de formato y configuración, 17/10:** máscaras, tipos Variant y cadena de conversión
acreditados estáticamente; flags y localización contrastados con contrato público.
[Resultado, verificación y límites](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contrato-de-formato-varformat).
No repetir máscaras, helpers de cadenas ni export 650. No se ha demostrado una
política exacta de empates ni la localización efectiva de una ejecución Productor.
La [unidad posterior de configuración](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#proveedor-de-configuración-y-argumento-2)
identifica `gaConfigDAL.Carga` y prueba el fallback condicionado del BSTR `2`.
No demuestra que `REDprecio/REDlinea/REDbase/REDtotal` valgan dos.
La [unidad de procedencia](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-y-precedencia-del-índice-de-configuración)
sigue AbreRS y la recarga de lista con índice NombreDato. No repetir esa carga.
La [unidad del índice](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#configuración-construcción-y-selección-del-índice)
sigue configuración/construcción, partición/intercambio y selección de posición
ante igualdad; no demuestra prioridad primera/última ni equivalencia de claves.
La [continuación de claves](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves)
sigue inicializador del comparador y bifurcación del normalizador, sin acreditar
semántica externa ni valores runtime. La [unidad de fila y delegados](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#clave-de-fila-y-transformaciones-del-índice)
atribuye `_gaLstItem.x_Clave +0x38` al cuerpo `0x11074c00` y sigue las
transformaciones `+0x3c / +0x44` del proveedor acreditado. La [unidad de predicados](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena)
acredita `+0x48/+0x4c`, condiciones signed16 y ramas del llamador. La [frontera WCTMB](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte)
acredita contrato público y enlace candidato ApiSet. La [procedencia del estado](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-estado-de-kernelbase)
acredita escrituras y fallback condicionados de las dos celdas. La
[procedencia del selector](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-byte-selector-de-kernelbase)
acredita una escritura literal condicionada a `1`. La [identidad del DWORD, 18/10](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-inmediata-del-dword-de-kernelbase)
queda atribuida por bytes y tipos x86 a `_RTL_USER_PROCESS_PARAMETERS.Flags`
en `+0x8`, mediante `TEB → PEB → ProcessParameters`. La [inicialización local de Flags, 18/10](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#inicialización-local-de-flags)
acredita en ntdll `_RtlCreateProcessParametersInternal@48` la escritura de `1`
en `0x4b2aa8f8`: bit 31 a cero en ese instante del bloque construido.
No demuestra que sea el bloque del PEB leído ni que se ejecute antes del consumidor.
La entrega interna `0x4b2aa9df` y los wrappers Ex/WithTemplate están seguidos.
La [unidad del llamador Ex](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#llamador-externo-y-destinatario-de-ex)
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
No repetir contrato/enlace WCTMB, predicados,
cuerpos/proveedor, inicializador/normalizador,
`xConfig`, construcción ni búsqueda. Equivalencia y prioridad de duplicados siguen abiertas.
Después siguen valores efectivos, agregados y persistencia. E1 permanece en curso,
sin cargo activo ni operación sobre G6; el ensayo matemático necesita alcance aislado propio.

**Investigación REA 16/10 cerrada en su alcance estático:**
[informe](docs/paridad/INVESTIGACION-REA-PRODUCTOR-2026-10-16.md) y
[comparación](docs/paridad/COMPARACION-REA-PRODUCTOR-2026-10-16.md), worktree
`codex/rea-productor-20261016` desde `307bf54`. Inventario ampliado, fuentes
parciales, 123 identidades managed, contratos IL seleccionados y pseudocódigo
nativo acotado con advertencias. No repetir extracción ni análisis global;
no se ha recuperado el proyecto original o implementado las brechas.
El 16/10 el siguiente de producto entonces era la frontera E1 que figura abajo;
la nueva vía nativa no cierra configuración, agregados, redondeo ni persistencia. No es el puntero.
Preparar casos discriminantes de barras/retales antes de ampliar optimización.
G6, aceptación P.2/P.6/P.7 y límites de publicación se conservan.

**Continuación local 14/10:** E1 ya tiene layout estático `+0x7ac`, getters
y consumidor nativo `alVDocumentoDespunte.DEScalcula` con receptor demostrado.
Las TypeLib acreditan las declaraciones COM; `alBDADO` reenvía la edición.
Creación estática de receptores `alRecordset`, WORD de tabla auxiliar, selector
`rsTabla` y cuerpos delegados acreditados. Control/reparto/totales seguidos:
selección de filas, descuentos, sustitución y defensa parcial de doble cómputo.
La frontera entonces pendiente de `VarFormat` se desglosa en la unidad del 17/10
anterior; continúan configuración efectiva de escalas, contrato de agregados
comerciales y persistencia, según la
[continuación E1](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#control-reparto-y-totales).
No repetir receptores/selector, declaraciones verificadas, wrappers/getters,
literales, inventarios, preparación física/condicional o cuerpos ya seguidos.
El cargo monetario permanece bloqueado: la matriz de ocho preguntas distingue
lo acreditado de configuración, agregados, formato y persistencia sin contrato completo.
El intento global previo de Ghidra agotó 300 segundos y se cerró; el ensayo
acotado del 16/10 sí obtuvo pseudocódigo parcial. No repetir el análisis global.
En paralelo se entregó el [selector puro de registros](docs/paridad/IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md),
47 pruebas nuevas, sin activar tarifa ni producir precios. Grupo, habilitación,
fórmula, redondeo y caso positivo siguen pendientes. Gate local actual: 2.004
pruebas correctas y la omisión previa por CSV privado; tipos/arquitectura correctos
en `2a2dc57`. La segunda unidad E1 entrega análisis estático/documentación,
sin cambiar el código de paquetes.
G6 mantiene su protección. Sin publicación, aceptación Productor ni despliegue.

**Investigación incremental 13/10, antecedente:** consultar la
[extracción diferencial](docs/paridad/EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md)
antes de volver a inventariar fuentes. Las 204 tablas pobladas de la copia
e851 ya tienen CSV/cabeceras completas; 33 difieren en recuento y no se mezclan.
Se recuperan contratos físicos/condicionales de E1, tarifa dinámica, almacén,
compras, cobros, listados y recargo. El [subcontrato físico de E1](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md)
se implementó como una unidad pura local; la aplicación monetaria conserva su
bloqueo. La continuación del llamador monetario es la del 14/10 anterior;
G6 conserva sus límites de autorización.
El merge Windows–Mac quedó cerrado, revisado y verificado localmente en
`fa32fba`, con cero conflictos. No repetir su resolución. No se ha publicado
esta integración ni reconsultado producción.

**Publicación técnica 12/10:** C1 y el tramo de P.6/P.7 están en Render live
`40cedd1`, con 0031/0032, carga dirigida y QA remoto verificados; ambos CI
correctos. [Recibo de publicación](docs/paridad/PUBLICACION-CLONERSOFT-2026-10-12.md).
No repetir extracción, investigación MO cero, migraciones, carga, despliegue
ni gates entregados. Pendiente registrado el 12/10 (histórico): matriz de
P.6/P.7 — anchuras, zoom 200%, reduced motion y comparación humana. Los tramos
locales del 18–19/10 y el siguiente paso vigente figuran al inicio; no repetirlos.
C1 conserva su alcance
acotado; E1–E11 y su evidencia permanecen.
Diseñador (01/11/2026): DS1–DS3 están en la secuencia, con la
[guía](docs/paridad/GUIA-DISENADOR-PRODUCTOR.md) como referencia. En DS2 la
inserción debajo es visible y las piezas colocadas se recolocan en anclajes
(local, sin publicar). El 01/11 el siguiente de DS2 era que Sergio lo pruebe, decidir sobre deshacer
y publicarlo. No es el puntero de paridad.


**Continuidad Windows del 13/10, antecedente:** seguir [la guía](docs/CONTINUAR-EN-WINDOWS.md),
recibir código/documentación y localizar fuentes privadas. P.2: aceptación
comercial con el titular. E1: conservar G6 y preparar nueva empresa sintética
aislada con RED/locale y caso discriminante, previa autorización del original. E7:
contraste Productor de fracciones, con A4 ya publicado. Esta entrega no
reabre tareas técnicas cerradas ni cambia el orden E1–E11.

**S3 verificado en CI el 09/10:** 1.448 pruebas correctas/una condicionada a CSV privado, seis recorridos de navegador, tipos, arquitectura y build en 36a47f4. El 12/10 el siguiente Mac entonces era la matriz restante de P.6/P.7; C1 ya estaba publicado y verificado técnico. [Evidencia](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md#s3-validación-completa-de-los-paquetes-en-ci--09102026). No es el puntero.

**A3 publicado/verificado el 09/10 en `a06cd4f`, con 0029 aplicada.** A4 publicado/verificado en `487feb1`: 0030 aplicada, conexiones renovadas y alta/edición/recarga/copia/PDF decimales comprobados en producción. A5 verificado en GitHub Actions (run 37971854995, seis recorridos correctos). D1 reconciliado localmente. [Informe](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md). E1 depende de Windows; P.2 conserva aceptación comercial. S2 quedó verificado en local el 04/11/2026 en `fix/s2-next-zod-seguridad`; no repetir la revisión del anuncio del 14/10.

**S1 y A2 publicados y verificados el 09/10**, Render live `7ad0ee2`: dependencias
sin avisos npm publicados a la fecha, 1.431 pruebas y miniaturas de conjunto.
260009 reguardado/recargado conserva 805,65 € y avisos. [Informe y límites](docs/paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md).
**S2, historia 04/11/2026:** el anuncio del 14/10 quedó revisado en
`fix/s2-next-zod-seguridad` (next 15.5.29, zod 4.6.7, audit de producción 0).
No repetir. Sin seguimiento automático. El puntero no cambia.

### Investigación económica E1 conservada (no es el puntero)

**E1 — demostrar el cálculo y reparto del despunte.**
El procedimiento sigue en [PASO-E1-DESPUNTE](docs/paridad/PASO-E1-DESPUNTE.md), desde los resultados A–F conservados. No reanudar esta investigación desde este portátil.
La [investigación del 04/10](docs/paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md)
contrastó manual y costes históricos y observó A–F en 0017: C2 GMC400
1500×1150, VCG4, acabado L, cantidad 1; segunda línea por duplicación.
Barras Completas, reparto entre líneas, coste mínimo y compra sin gastos:
recálculo sustituye el cargo; repetición y reapertura conservan resultado.
Copia F privada verificada y lector propio; evidencia comercial fuera de Git.
Residuo 0,02 € explicado en B/D por margen GID 0,01 % sobre coste y redondeo.
Complementario G1–G5 observado y contrastado: alta independiente de segunda C2
1200×1150 tras primer cargo no lo hereda ni activa reparto automático. El
recálculo sustituye cargo y reparte por bases sin cargo anterior; G5 conserva
la proyección técnica de G4 tras F9/reapertura. Copias privadas por estado.
No repetir A–F ni G1–G5. Tres políticas de redondeo coinciden en G4. Variante
1207×1150 verificada produjo error de opciones/SessionFactory y añadió tercer
GRUPO; G6-incidencia conservada, sin recálculo y con previos intactos.
La vía propuesta el 04/10 de retirar el tercer GRUPO queda histórica e inactiva.
La siguiente observación exige nueva empresa sintética aislada, RED/locale
efectivos y predicciones divergentes; no modificar G6 ni certificar opciones
tras el error. La ejecución del original necesita autorización propia.
Descuentos cero/cantidad 1 no discriminan base bruta/neta ni otras cantidades.
Sin aplicación al presupuesto web ni nueva medición del banco.

## Secuencia de trabajo

Lectura del trabajo restante al **18/10**, sin crear tareas nuevas: E1 conserva
cuatro bloques prácticos — terminar investigación pendiente, completar contrato
e implementación, contrastar con Aluminior y verificar en entorno aislado.
El número de unidades estáticas aún no está fijado. La tabla mantiene **11
frentes económicos abiertos E1–E11**: E1 en curso y diez posteriores, incluidos
los tres condicionados E8/E9/E11. No es una previsión de once sesiones ni
el total de todos los módulos pendientes del producto.

| ID | Trabajo | Estado actual | Prueba necesaria para avanzar o cerrar |
|---|---|---|---|
| M0 | Matriz por modelo/serie/regla y ensayos mínimos | Cerrado 03/10/2026 | [Matriz](docs/paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md), 97 pares, 47 pruebas, typechecks y arquitectura; no volver a crearla, regenerar si cambian las fuentes |
| E1 | Despunte de cabecera: base, momento y reparto | En curso. 04/10: G1–G5 verificados y G6-incidencia preservada; el 31/10 se retiró el tercer GRUPO con autorización (260501 queda en 2 líneas, base 577,49) y se verificó edición sin alta. 31/10: mochila verificada y E1V0 vacía en el portátil; Configuración bloqueada allí por `TODGUB8.DLL`; plan R1 listo; continuación en el equipo del titular con visión. El 19/10 el invitado tenía Crystal 13.0.35.4870 y quedó parado en controles/librerías: esa parada no es el puntero | [§0](docs/CONTINUAR-EN-WINDOWS.md#0-relevo-del-31102026-equipo-del-titular-con-visión), [plan R1](docs/paridad/PASO-E1-DESPUNTE.md#plan-r1-con-mochila-31102026), [evidencia 04/10](docs/paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md), [ensayo 19/10](docs/paridad/PASO-E1-DESPUNTE.md#ensayo-autorizado-del-1910-configuración-y-redondeo). RED/locale, variante discriminante y R1 sin observar. No repetir unidades estáticas ni el ensayo del 19/10. Sin activar cabecera ni operar G6 |
| E2 | Unión material de otra serie en GRUPO | En `main` desde el 03/11/2026 (`0a4958b`, fusión de `integracion/codex-e2-20261103`); medido el 06/11/2026 en la 0016 (copia del 31/10, `d228861b3f01…`), mismo `main` `815207d` con y sin el traslado de la serie de la unión al banco (`geometria.ts`, apagado solo en el worktree de medición), misma base y firma: GRUPO del banco de líneas igual 27 → 36 de 49 y sin valorar 16 → 4 (total 420 → 429 de 544 líneas, 77,21 → 78,86 %); contraste de 176 GRUPO `coincide` 26 → 33, `sin-valorar` 61 → 34, causa `union-otra-serie` 30 → 1; las únicas transiciones son de `sin-valorar` (7 a `coincide`, 20 a `difiere`), ninguna empeora. Queda `caso-02155` (`GMA350`, 2O + PSU001 + 2O) con `serie-de-union-no-representable`, sin investigar. Prioridad tras el contraste del 02/11: 40 GRUPO de la 0016 (37 con módulos de varias series, 3 con unión de serie ajena; 140 en 2023–2026). El 20/10 la rama Codex midió su banco local, no esta integración: 407/523 iguales (77,82 %), GRUPO 30/45, causa `serie-de-union-no-representable` de 11 a 0 | [Evidencia Codex](docs/paridad/EVIDENCIA-E2-UNION-SERIE-2026-10-19.md). Código/serie/acabado y geometría demostrados, sin extrapolar U. Medido el 06/11. No reimplementar. Falta la comparación lateral en Productor |
| E3 | Comisión: orden de redondeo y edición de líneas guardadas | Pendiente | Caso 0/−10/+10, suma de filas y momento de aplicación; separar cantidades/horas; seis residuos comunicados |
| E4 | Tapajuntas de puerta con inferior SI/NO | Pendiente | GMT004, 1P 867×2098 con serie/ala/cajón reales; comparación lateral y travesaño |
| M1 | Mantenimiento de uniones (Asistente de Configuración, CHM 5.1.2.13.6) | Implementado y corregido tras revisión 03/11/2026; en `main` y producción desde `46fd472`. Sin contraste 0016 | [Plan](docs/paridad/PLAN-M1-MANTENIMIENTO-UNIONES-2026-11-02.md). Pantalla en Artículos → Uniones. Validación de escritura con el catálogo de la base, receta de Productor protegida e imágenes en `dibujo_catalogo` ([corrección](docs/paridad/PLAN-M1-MANTENIMIENTO-UNIONES-2026-11-02.md#corrección-tras-la-revisión--03112026)). El plan de esa fecha aún decía sin 0034 en Supabase; el estado de producción del 03/11 declara 0033–0035 aplicadas y 52 uniones cargadas. Falta importar `EstructurasSeriesAsoc` (pares de series, con la medición de E2) y confirmar `UnionTipo` en Productor |
| E5 | Compacto y metraje COMPVAL | Motor verificado en local 02/11/2026 (E5 + E5b). Guías y acabado del compacto contrastados con la mochila el 12/11/2026 (260504 de la 0017, 630,47 € al céntimo); pendiente la fila de varias piezas con guías. El 21/10 aún constaba pendiente: ese estado no rige | `CompactoModulo` en cerramiento v3; el banco lo transmite con evidencia completa (`compacto-grupo.ts`) y el despiece completa los grupos sin opción con las predeterminadas de `EstructurasOpcOpciones` (0033). En la 0016, `compacto` baja de 53 a 8 (7 por acabados de lamas o guías distintos, 1 sin módulo); 11 reetiquetados como `otro-accesorio`. Pendiente: cortes del compacto en los documentos 881, 1019, 1020 y 1249; UI de persiana por módulo. `alturaTotalMm` sin regla demostrada: solo en el banco |
| E6 | Acristalamiento alternativo y vidrio por elemento | Contención publicada 09/10. Variante por rango y omisión sin fila están en `main` (`1b3d8f8`, `ca8401d`; banco local del 20/10: 410/523, GRUPO 33/45; cuatro líneas dejan de bloquearse y ninguna pasa a igual). Contraste 02/11: 23 GRUPO de la 0016 mezclan vidrio simple y doble por elemento (117 en 2023–2026). Paridad de la mezcla pendiente | Motor catálogo rechaza precio falso de opción 1 para opción alternativa y guarda incompleto. [Variante por rango](docs/paridad/EVIDENCIA-VARIANTE-ACRISTALAMIENTO-2026-10-20.md) y [omisión sin fila](docs/paridad/EVIDENCIA-OMISION-JUNQUILLO-2026-10-20.md): no repetirlas ni cambiar PVP. La mezcla real y `nTAcris` 2–5 siguen abiertas |
| E7 | Conservación de medidas fraccionarias | 31/10: precios C2 970×439,5 y 970×1999,5 coinciden Productor-Aluminior (150,60 y 267,77); pendientes cortes y despiece; A4 web verificado 09/10 | C2 970×439,5 y 970×1999,5 con configuración real fijada: entrada, cortes, guardar/reabrir. 0030 y persistencia web ya entregados; no repetir migración ni equiparar el fijo sintético A4 con esta receta |
| E8 | Tramos y opciones de herraje | Condicionado | Solo si falta cobertura tras catálogo/CHM/diagnóstico; límite real del corte de hoja, no dimensión exterior supuesta |
| E9 | Referencias, cotas y divisiones restantes | Condicionado | Aislar cadena en los cortes discrepantes; predicción independiente de la instancia |
| E10 | Acabado efectivo UNI/L y selección PVP | Pendiente de investigación | Comparar acabado de pieza, selector y tarifa; no normalizar por coincidencia económica |
| E11 | Mínimos, múltiplos e intervalos restantes | Condicionado | Usar límites reales de catálogo y entradas compatibles a ambos lados de cada frontera |
| A1 | Aceptación en web publicada | Cerrado el recorrido auditado 09/10 | [Auditoría](docs/paridad/AUDITORIA-FUNCIONAL-2026-10-09.md): Render live f6d5bcd, 260009 guardado/recargado y PDF válido 805,65 €. Visor IAB gris, archivo comprobado aparte. No certifica todas las familias, fabricación ni precio |
| S1 | Mantenimiento de dependencias | Publicado/verificado 09/10 | b1682a3 incluido en Render live 7ad0ee2; audit 11→0 / producción 4→0; ci, 1.431 tests, tipos, arquitectura y build correctos. Guardado/recarga/PDF 260009; no cubre el anuncio futuro S2 |
| S2 | Dependencias de producción con avisos publicados | Verificado 04/11/2026 y publicado en `main` (`5298a7b`, live en Render el 04/11) | next 15.5.27→15.5.29 exacto; zod ^4.4.3→^4.6.7. GitHub: GHSA-2464 `>=10.0.0, <=15.5.27`, primera parcheada 15.5.28; GHSA-p3m5 `>=13.0.0, <=15.5.27`, primera parcheada 15.5.28; GHSA-mrhx `<4.6.6`, primera parcheada 4.6.6. Instalada 15.5.29, fuera del rango `<=15.5.28` de GHSA-7qx7 y GHSA-f3mh. `npm audit --omit=dev` 2→0. `npm audit` deja 3 de desarrollo (vitest/@vitest/mocker <=4.1.11 y vite <=6.4.3, override sin tocar): pendiente aparte, sin arreglar. GHSA-pc58-hwjq-p385: advisory del repo con rango `<16.0.0` y `>=16.0.0`, `patched_versions` vacío el 04/11/2026; el cuerpo del release 15.5.29 lo cita, el advisory no publica parche. Riesgo residual. Búsqueda en `packages/web` de `fetch(`, `return fetch(`, `return await fetch(`, `new Response(res.body` y `NextResponse.rewrite`: 0 coincidencias. Lock: además de next/@next/* y zod, `npm install` movió caniuse-lite 1.0.30001806→1.0.30001820 (rango de next) y semver 7.8.5→7.8.6 (rango de sharp 0.35.5). Overrides de la raíz sin tocar; sharp 0.35.5 y postcss 8.5.23 siguen resueltos. No se prueba exploit. Producción pasó a 15.5.29 con `5298a7b` (04/11). No repetir |
| A2 | Miniatura del GRUPO completo | Publicado/verificado 09/10 | 7ad0ee2; tres módulos desiguales con dos uniones guardados/reabiertos en QA, SVG/PDF completos; teclado y escritorio/móvil. Basado en RECON-CERRAMIENTOS §4 quater; sin cambios de valoración |
| A3 | Idempotencia de nueva cabecera y copia | Publicado/verificado 09/10 | a06cd4f live; 0029 aplicada, RLS y documentos previos conservados. Alta/copia/revisión sintéticas y tres reintentos READ ONLY remotos con mismos IDs; pérdida HTTP física local. Ver informe A3 |
| P.2 | Aceptación PDF multipágina | Paginación publicada/verificada 09/10; formato comercial pendiente | [Informe](docs/paridad/PDF-MULTIPAGINA-2026-10-09.md): 6 escenarios, 21 páginas, 628 marcadores, 28 bloques; endpoint local 12 líneas/4 páginas. 741 tests web, tipos/build/arquitectura. Render live 46c613d, endpoint 260009 verificado (1 página, 805,65 €); formato comercial Productor/titular pendiente. July 205 |
| A4 | Conservar medidas exteriores decimales | Publicado/verificado 09/10 | Render live 487feb1, 0030 aplicada; alta/edición/recarga/copia/PDF decimales en producción, documentos previos intactos. 757 tests web y 56 BD. No cierra E7 |
| A5 | Recorrido sintético de navegador en CI | Verificado local y CI 09/10 | Seis recorridos escritorio/móvil: postcommit, medidas, latencia/fallo de catálogo y teclado; GitHub Actions run 37971854995 correcto |
| S3 | Validación completa de paquetes en CI | Verificado local y CI 09/10 | 9bf9a64/36a47f4: 1.448 tests correctos/uno condicionado a CSV privado; tipos, arquitectura y build, run 37978474635. Seis recorridos, run 37978474739. Corrige test ETL obsoleto y contrato de fixture PDF; no toca producción |
| C1 | PVP por medidas y contención de precio plano | Publicado/verificado técnico 12/10; alcance acotado | [Publicación](docs/paridad/PUBLICACION-CLONERSOFT-2026-10-12.md): `40cedd1` live, 0031/0032 y carga dirigida, CI y QA remoto/preservación correctos. Dos precios dimensionales corroborados; coste/fabricación fuera del cierre y banco 400/523 conservado |
| P.6/P.7 | Teclado, foco y adaptación responsive | Parcialmente publicado 12/10; componentes/foco y zoom locales 18–19/10; diez E2E Docker locales 19/10; aceptación integral abierta | [Auditoría actual](docs/paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md#pruebas-ejecutadas-en-aislamiento) y [zoom](docs/paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-p6p7-de-zoom-nativo--1910): doce escenarios a 200% nativo y 58 capturas; control anterior falla en cuatro. Los diez E2E prueban guardado/copia/decimales/cliente con QA local y BD nueva; no Auth Supabase, precio comercial ni toda la matriz visual. El 19/10 el siguiente era Auth real aislado, comparación humana con Productor y aceptación. No es el puntero. Captura visual 200% de producción conserva su límite histórico. Ítem local 195; no crear otro |
| D1 | Reconciliar ficha de acceso de July | Cerrado local 09/10 | Ficha actualizada con comprobación directa A4, Render live 487feb1 y 31 migraciones; historial fechado preservado. Sin sync/recepción acreditados |
| DS1 | Guía del diseñador de Productor | En curso; observación 01–02/11/2026 en la 0017 | [Guía](docs/paridad/GUIA-DISENADOR-PRODUCTOR.md) con barra, escaparate, Elemento seleccionado, Unión, compacto, recorrido de composición y elemento invisible. Comparativa de presupuestos 01–02/11 ([doc](docs/paridad/COMPARATIVA-PRESUPUESTOS-2026-11-01.md)): resueltas la 4 (la lupa filtra series) y la 7 salvo el PDF emitido; uniones `U` y `GMU038` observadas. Quedan 1–3, 5, 6 y 8–10 para el operador; ampliar con cada botón explicado. July sin conexión: pendientes por pasar |
| DS2 | Composición: inserción debajo visible y mover piezas libremente | Implementado y verificado 01/11/2026; en `main` y producción desde `ba9a5a5` | Debajo: `anclajeInferior`, `+` inferior y «Colocar X debajo»; recorrido 2O/fijo/2O/fijo = 2420 × 2420. Mover (decisión de Sergio: anclajes; las colgadas se quedan fijas): `mover-modulo.ts`, arrastre con ajuste magnético y botón «Mover elemento» con destinos enfocables; 2O movida = 2420 × 3640 con el fijo en su sitio, guardada y recargada. Core 59 ficheros, componentes del diseñador, tipos y arquitectura correctos. El 06/11/2026 (rama `feat/ds2-deshacer-mover`), decisiones de Sergio: deshacer y rehacer de todo cambio del conjunto (un paso por cambio, Ctrl+Z, Ctrl+Y o Ctrl+Mayús+Z y botones en la barra; no actúan dentro de campos de texto ni con borradores, inserción o movimiento a medias; 100 pasos) y mover también el primer elemento dejando fijos a los demás: la referencia pasa al primer elemento restante que permita dejarlos en su sitio. Verificado en navegador local con el catálogo real (mover el primero, deshacer y rehacer con botones y teclado, 375 px sin desbordar). Control negativo: con la regla anterior de mover caen 2 de 8 pruebas de `mover-modulo` (las del primero) y con un deshacer inerte 1 de 3 del historial. `test:ci` core 1048, db 56, etl 114 y 1 omitida, web 936; e2e 10/10. Probado por Sergio en local el 06/11/2026 e integrado en `main` (`ab4c5b9`); falta QA con sesión en producción. Desviación deliberada de Productor |
| DS3 | Elemento invisible (viga o pared) por diseño específico | Implementado y verificado el 07/11/2026; integrado en `main` (`226f130`). El mismo día se corrigió la descripción: un módulo `invisible` convertido desde cualquier ventana (p. ej. C2) se describe como «FIJO DE 1 HUECO» (`eea1917`; antes salía el nombre de la ventana de origen) | Observado: precio 0 sin despiece, cuenta en el ancho y en las uniones, se describe en el GRUPO y se dibuja como hueco en blanco. Campo: diseño de documento con un único nodo `Tipo = 19` (8 de 8 en 0015–0017). Implementado: «Convertir en hueco»/«Volver a ventana» en el panel; `invisible: true` en el módulo v3 (`elemento-invisible.ts`); valoración a 0 completo sin catálogo (`ELEMENTO_INVISIBLE`, el validador del snapshot exige que regla y marca coincidan); lienzo con contorno discontinuo, miniatura y PDF en blanco. Verificado en `aluminior_real_test`: C2 + fijo 400 × 400 hueco + GMU038 = 277,65 € (C2 273,53, unión 4,12, hueco 0,00 con 0 piezas), descripción con «FIJO DE 1 HUECO», hueco movido y conservado al reabrir. Control negativo: con la rama desconectada caen 2 de 8 pruebas nuevas. No se importa el `Tipo = 19` de documentos antiguos (no hay importación de diseños de documento). Falta el PDF emitido por Productor y las preguntas 6 y 8. El reparto 40/20 del caso 3 queda como hipótesis ligada al invisible |
| DS4 | Editor `Diseño V3` y plantilla del diseño propio | Evidencia lista y motor verificado en local el 13/11/2026 (sin commit); editor y generador pendientes | Motor: plantilla propia del módulo, vidrio por hueco, barrotillo `BI`, múltiplo por metro; banco 111 / 60 / 41 / 13 con la plantilla que guardó Productor ([informe](docs/paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#actualización-del-13112026-diseño-específico--vigente)). Observado `Diseño V3` en la 0017 ([guía](docs/paridad/GUIA-DISENADOR-PRODUCTOR.md#diseño-v3-observado-el-13112026-empresa-de-pruebas-presupuesto-260507)). Falta: (1) generar la plantilla desde el árbol de diseño, validándola contra las 170 plantillas de documento de 2026 y las de catálogo; (2) guardar el diseño propio en la configuración del módulo; (3) el editor en el configurador (añadir travesaño con posición y cota, vidrio por hueco, hoja en un hueco, barrotillo). Empezar por el fijo con travesaños a cota fija y vidrio por hueco, que es lo más frecuente. Juego de 9 casos grabado en la 0017 (presupuesto 260508, 13/11/2026; tabla y volcados en la [guía](docs/paridad/GUIA-DISENADOR-PRODUCTOR.md#juego-de-casos-del-13112026-0017-presupuesto-260508-id-1316)): úsalos como contraste del generador. No repetir la medición del banco ni la observación del 260507 ni del 260508 |
| CF1 | Configurador unificado: alta en `Cerramiento`/`Artículos`, compacto y tapajuntas por elemento, serie de unión heredada, mano de obra por cantidad | Implementado (Gemini) y revisado por el arquitecto el 07/11/2026; en `main` (`87476da`, `eea1917`); QA en producción hecha solo con el flujo del tutorial | Implementado: pestañas `Catálogo`, `Propiedades`, `Uniones`, `Opc.Herraje`, `Cargos Adic.` y `Acristalamiento` en la barra del configurador y botón `Uniones` que prioriza la primera unión sin configurar; `TapajuntasModulo` y `descontarHueco` en el módulo v3 (`compacto-cerramiento.ts`); `serieEfectivaUnion`; el banco pasa `descontarHueco` desde `compDtoHuecoSN`. Mano de obra por cantidad: `totalLineaCerramiento` multiplica materiales y horas manuales por unidad. **Demostrado en la 0016** (`Anterior.mdb`, copia, solo lectura): `nDoc 1132`, GRUPO `Cdad = 2`, `MOCOL` 840 min (420 por unidad), `Precio` 842,52 €, total 1.685,04 €, coincide al céntimo; el comportamiento anterior daba 1.475,04 €. **Residuo:** `nDoc 887`, 5.233,35 € frente a 5.233,28 € (7 céntimos por unidad) con 8 filas, `Cdad = 2` y +15 %; test con tolerancia explícita y causa anotada en el [banco](docs/paridad/BANCO-CONTRASTE-2026-10-03.md). Verificado: core 1054, web 969 en serie (en paralelo, interbloqueo de Postgres entre ficheros de integración, ya presente sin estos cambios), typecheck y arquitectura limpios. Falta: contrastar compacto/tapajuntas por elemento y `descontarHueco` con un documento real de Productor; revisar `nowrap` de la lista a 375 px; los tests de `db` necesitan Postgres en 55433. No cambiar el redondeo de la comisión sin una regla demostrada |
| GR1 | Cota del fijo FI/FS en módulos de GRUPO | Motor y banco verificados 02/11/2026. UI del configurador del 03/11/2026 en `main` (`cd3dba4`); ubicación hipótesis, UI sin medir con el banco | [Contraste §GR1](docs/paridad/CONTRASTE-PRESUPUESTOS-2026-11-02.md#gr1--02112026): `cotas?: CotasModulo` (`FI`, `FS`, `VS`, `TD`, `F`, `FD`, `FZ`) en `ModuloCerramiento` v3, `valorarCerramiento` y `configuracionGrupo`. En 0016 `cota-fi-fs` pasa de 31 a 0 (23 coinciden, 92 difieren [+26, 10 con receta igual], 97 sin valorar [−26; los 5 restantes de los 31 quedan por PVP de `PSU006`]). En 0015 `difiere` sube de 119 a 138 (+19). El 03/11 la UI local muestra esas cotas junto a Ancho y Alto, salvo el FI de `1OFI`, que sigue en `fiMm`. La ubicación es hipótesis y debe confirmarse en Productor. No rehacer la UI. La confirmación en Productor queda para el equipo de la mochila |
| GR2 | Unión que recorre varias piezas | Evidencia lista 02/11/2026; prioridad 5. Etapa A aceptada en la puerta el 05/11/2026; Etapa B implementada y verificada por el arquitecto el 05/11/2026 y publicado en main (`1040a92`, live en Render el 05/11/2026); precio medido en local el mismo día | 47 GRUPO de la 0016 y 35 de la 0015: Productor recorta todas las piezas que toca una unión larga y Aluminior solo el par anclado. 221 GRUPO en 2023–2026. Uniones aisladas de perfil 2010–2026: 89–95 % mitad y mitad, también con alturas distintas, salvo las de compacto (37–54 %). Impacto medido 749 € en 44 GRUPO de 2026 (el contraste escribe 748,59 €; sin reconciliar). **Regla (Etapa A, 05/11):** con `'PIEZAS'`, la unión configurada recorre la junta mientras haya pieza a ambos lados, resta la mitad entera de su grosor a cada pieza que toca (sin prorratear) y se valora por la longitud del recorrido en huecos; derivada de `UNION_LARGA`. **Predicción registrada 05/11/2026, no reescribible**, `regresion-07` desde el hueco: `1` arriba 730 × 599,5; `1` abajo 730 × 1999,5; `02H` 730 × 2600; `GMU039` 2600; `U` 750. Reserva no ciega: las medidas guardadas se leyeron en el inventario, y la celda `U` = 750 ya contradice los 730 guardados, así que la subregla «la unión que cruza no se acorta» queda **falsada de antemano** (su única fuente es la `U` de 1000 de `UNION_LARGA`, un ejemplo anónimo escrito a mano). La Etapa B no la implementa: la longitud de la unión que cruza se queda como hoy y la divergencia de 730 queda abierta. **Compatibilidad: (a)**, cambiar la regla de `'PIEZAS'`, porque abrir no revalora y editar solo se permite en `PENDIENTE` y ya revalora con la tarifa vigente. Dibujo (`posicionesCerramiento`) fuera de la Etapa B. **Etapa B (05/11):** `recorridosUniones` (`packages/core/src/estructuras/recorrido-uniones.ts`) lee los rectángulos de módulo y `medidasFabricacionCerramiento` resta por recorrido. Hipótesis sin observación: uniones colineales (cada una su tramo; el tramo libre entre dos es de la primera en orden de anclaje; una pieza pierde una sola mitad por junta) y la simetría horizontal. `UNION_LARGA` pasa de `difiere` a `coincide`. `regresion-07` desde el hueco: la predicción acierta en las 3 piezas y en la `GMU039` (2600); la `U` da 750, como antes de GR2, frente a 730 guardados: divergencia abierta. Control negativo medido: con la regla revertida caen 4 de 1046 pruebas de core (las de recorrido) y 1 de 22 de `contraste-presupuestos`; las de par aislado siguen pasando. **Precio medido 05/11/2026** en este portátil, copia `EMP0016\Anterior.mdb` del 31/10 (sha256 `d228861b3f01…`, sin cambios antes y después), catálogo en `aluminior_real_test`, mismo `banco.json` con `5298a7b` y `1040a92`: 176 GRUPO; `coincide` 24 → 33 y `difiere` 107 → 98, sin ninguna otra transición; reparto `coincide` 111 → 129; patrón `union-recorre-varias-piezas` 37 → 16; causa `reparto-uniones` 80 → 66. Desvío absoluto del precio desde el hueco frente al de medidas guardadas: 2.977,46 → 1.384,22 €; 31 GRUPO se acercan y 2 se alejan (`caso-02113`, con compacto E5, y `caso-02192`, reparto asimétrico de 10 C2 en el que dejan de compensarse dos errores); el precio desde el hueco iguala al guardado en 51 → 65. No comparable con los 748,59 € del 02/11 (otra copia y otra métrica). `regresion-local.test.ts` con `ALUMINIOR_CONTRASTE_LOCAL=1`: los 9 importes guardados son idénticos a los del 02/11; `regresion-07` pasa a `coincide` al céntimo, también con la `U` de 750, y `regresion-08` pierde `reparto-uniones` (expectativas actualizadas). Quedan 16 GRUPO con el patrón: sobre todo restos de 0,5–1 mm con `PSU001`/`U` y altos de 20 mm con `GMU040` horizontal (`caso-02141`, `caso-02150`); sin investigar. Defecto del banco encontrado al medir: `TABLAS_CATALOGO` (`scripts/lib/banco-contraste/catalogo.ts`) no exporta `EstructurasOpcOpciones`, que el ETL exige desde E5b, y `preparar` deja la base a medio cargar si falla; se sorteó exportando esa tabla a mano de la misma copia y recreando la base. Arreglado el mismo 05/11 en `fix/banco-tablas-catalogo`: la tabla entra en `TABLAS_CATALOGO`, `catalogo.test.ts` barre las cargas `cargar('…')` del ETL y falla si el banco no exporta alguna (control negativo: sin la tabla cae 1 de 1), y un fallo del motor tras la carga base explica cómo recrear la base; reconstrucción desde cero sin pasos a mano verificada y `regresion-local` 2/2. El diseñador sigue dibujando la unión larga acortada a su par |
| DG1 | Descripción generada de la línea GRUPO | Implementada y verificada en Postgres efímero el 04/11/2026; sin banco ni comparación lateral | `descripcionGrupo` escribe un bloque por elemento, en el orden de `modulos`, con medidas nominales (`1.200,0`), color, código de serie y vidrio resuelto. La unión no aparece; el compacto cierra el bloque de su elemento. Alta, edición y copia con regeneración la guardan; una copia sin regeneración y los documentos ya guardados conservan el texto anterior. Límites: la serie es el código, no la descripción comercial (DG1b, migración de `conjuntos.descripcion`, no hecha); hipótesis sin confirmar en Productor el texto de un elemento sin vidrio, el orden de bloques si la composición no es una cadena y por qué el 260499 mostró solo el primer elemento. Sin mochila no hay comparación lateral. La edición manual queda para después. `test:ci` del 04/11 en verde (core 1034, db 56, etl 114 y 1 omitida, web 923). El control negativo del alta, medido sobre las 923 pruebas web, hace caer 1 y guarda `CERRAMIENTO SEGÚN DIBUJO · 2O`. Navegador 04/11 con catálogo sintético (`aluminior_audit_test`): alta de 2 elementos guardada con dos bloques; la columna Descripción se quedaba en 134 px a 1024 de ancho (`overflow-wrap: anywhere`) y se corrigió con ancho mínimo de 22rem: 352 px a 1024 y 375, sin desbordar la página; PDF 200. No rehacer la función ni medir el banco desde aquí |
| PDF1 | Números del PDF en formato español | Implementado y verificado el 06/11/2026 (rama `feat/pdf-decimales`) | Observado en la [comparativa del 01/11](docs/paridad/COMPARATIVA-PRESUPUESTOS-2026-11-01.md#pdf-y-recarga-en-aluminior): el PDF imprimía «970 × 1999.5» y, por `Intl` es-ES, importes de cuatro cifras sin punto de miles («1391,88 €») frente a «1.391,88» de Productor. Ahora medidas con `formatoMedida` de core, la misma regla que la descripción de DG1 («970,0 × 1.999,5», también en la cota del dibujo), importes con miles siempre («1.391,88 €») y cantidad y horas con coma («2,5», «1,25 h»). Hipótesis: el PDF de Productor no se ha observado (Emitir no se pulsó), así que el formato de la columna Medidas sigue el de su descripción. `formato-documento.test.tsx` renderiza el documento y busca los textos; control negativo: con el formato anterior caen 3 de 59 pruebas del PDF y sin el cambio en `fila.tsx` y el dibujo caen 3 de 60. PDF renderizado revisado también con cifras extremas (12.000,0 × 3.000,5; 15.462.962,70 €) sin desbordar. `test:ci` core 1046, db 56, etl 114 y 1 omitida, web 932; e2e 10/10; build. Fuera de alcance: los números de las pantallas web |
| VA1 | Validar serie, vidrio, acabado y uniones al aceptar el cerramiento | Implementada y verificada por el arquitecto el 04/11/2026 y publicada en `main` (`5b709ac`); sin banco y sin comparación lateral | `faltasParaAceptar` en core; `prepararAltaCerramiento` rechaza antes de escribir y devuelve los mensajes en `configuracionCerramiento`. La copia no pasa por esa función y no se valida. Las líneas ya guardadas no se reescriben al abrirse; al editarlas hay que completar los materiales para guardar. Hipótesis: el texto tras «Elemento» es `código de ancho x alto`; se avisan todas las faltas a la vez; el vidrio se exige también sin hueco acristalado (en el catálogo dibujable no hay indicador de «sin vidrio»; `division-invisible` es un separador, no esa marca). El aviso de guías del compacto no entra. Seleccionar en el diseñador el elemento que falla queda para después. El sufijo `(n sin configurar)` no está en el literal de Productor. `test:ci` del 04/11: core 1041, db 56, etl 114 y 1 omitida, web 928. Control negativo repetido por el arquitecto: con la llamada desconectada caen exactamente 3 de 928 pruebas web. E2e local 10/10 (selector del vidrio general corregido a `#vidrioCodigo`). Mejora Después: con la estructura `0` el aviso dice «Elemento 0 de …», que se lee como número de orden. Sin mochila no hay comparación lateral. No mide el banco. No rehacer la función ni mover el puntero «Siguiente paso» |

Detalles E2–E11: [ensayos mínimos](docs/paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md).
A1 y D1: [estado operativo](docs/ESTADO-ACTUAL.md).
Los recuentos se solapan: no sumarlos como previsión de líneas recuperadas.
El orden es una prioridad, no una obligación de detenerse si una fuente concreta
falta: registrar qué falta y avanzar con otra tarea autorizada e independiente.

## Reconciliación de hallazgos ClonerSoft — 13/10

Registro de cobertura del encargo dentro de este roadmap; no crea otro orden
ni IDs paralelos. «Implementación pendiente» requiere contrato y aceptación
antes de construir. Extraído no equivale a implementado o verificado.

| Hallazgo | Prioridad / etapa | Frontera o siguiente condición |
|---|---|---|
| Datos y maestros, catálogo, cabecera/GRUPO, materiales, cortes, herrajes, vidrio, MO, compacto, tapajuntas, metraje, PVP, comisión, uniones y fracciones | Reutilizado, con los límites de E1–E11 y M0 | No repetir inventario/carga ni convertir disponibilidad en aceptación; 204 CSV y 33 diferencias de instantánea preservados |
| Precio dimensional y acabado del artículo | Reutilizado: C1 técnico publicado/verificado | Coste dimensional sigue separado; 0031/0032/carga no se repiten |
| Despunte físico/condicional | Ahora — E1, implementado y verificado localmente | [Contrato/entrega](docs/paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md); 67 pruebas y revisión independiente; sin adaptar snapshots ni activar cabecera |
| Despunte monetario | Ahora — E1, control/reparto/totales, formato, proveedor/fallback, índice, comparador/normalizador y cuerpo de fila/transformaciones seguidos en su alcance; cargo desactivado | Ocho preguntas con evidencia parcial; condiciones y ramas de los predicados seguidas estáticamente; contrato WCTMB y enlace candidato acreditados; escrituras condicionadas de las celdas acreditadas; escritura literal condicionada del selector acreditada; identidad del DWORD acreditada; inicialización local de Flags a 1 acreditada en `0x4b2aa8f8`; entrega `0x4b2aa9df` y wrappers seguidos; llamador Ex `0x1003da6a` y slot local acreditados; frontera NtCreateUserProcess `0x1003db34`, equivalencia y semántica efectiva pendientes, sin prioridad primera/última demostrada. Escalas efectivas, empates/localización observados, agregados y persistencia pendientes. G6 conserva autorización propia |
| Coste dimensional | Ahora — pendiente de evidencia | Proveedor, medidas, divisa, gastos y precedencias; no reutilizar selector PVP |
| Coste calculado | Ahora — pendiente de evidencia/configuración | Material por peso + acabado por superficie; unidades y activación sin confirmar |
| Tarifa dinámica | Ahora — selección de registro implementada/verificada localmente 14/10; precio y activación pendientes | [Contrato y gate](docs/paridad/IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md): cuatro búsquedas, decimales exactos y bloqueo de empate; 47 pruebas. Sin precios ni activar motor; grupo, habilitación, fórmula, redondeo y caso positivo pendientes |
| Descuento máximo primero | Ahora — pendiente de evidencia | Límite independiente; falta efecto visible y al guardar; no recorte silencioso |
| Descuento máximo segundo | Ahora — pendiente de evidencia | Límite independiente; falta precedencia y efecto al guardar |
| Recargo energético y precios especiales | Ahora — pendiente de configuración | Familia/subfamilia, medida/corte, alternativa general y mínimo; excepción del artículo concreto; sin migración histórica |
| Pedidos de compra | Reutilizado | Estado RECIBIDO no acredita recepción física |
| Movimientos de almacén | Después — contrato/implementación pendientes | Artículo/acabado/dimensiones/almacén, proveedor y precio; cantidades/reintentos/concurrencia como decisiones técnicas |
| Reservas, consumos y restos | Después — contrato/implementación pendientes | Separar existencias/reserva/consumo, parciales, estados y reversión con historial |
| Recepciones completas/parciales | Después — implementación pendiente | Depende del contrato de movimientos; conciliación de entregas y pendientes |
| Facturas de compra | Después — contrato/implementación pendientes | Agrupar albaranes del mismo proveedor; línea de origen opcional, trazabilidad persistente por especificar |
| Producción y optimización 1D | Reutilizado | Ampliar tras contrato de almacén; no reconstruir hojas ni inferir fabricación aceptada |
| Documentos de venta/facturas/vencimientos | Después — contrato pendiente | Demostrar relaciones antes de ampliar el ciclo comercial |
| Cobros parciales, historial y reversión | Después — contrato/implementación pendientes, en serie | Depende de vencimientos; conciliación, idempotencia y permisos; fiscal/bancario requiere especificación propia |
| PDF de presupuesto | Reutilizado: P.2 técnico | Aceptación comercial pendiente; no sustituye informes operativos |
| Informes configurables | Después — contrato/implementación pendientes | Columnas, filtros, agrupaciones y totales sobre datos disponibles, con permisos |
| Consultas rápidas | Después — extraídas | 91 plantillas / 59 nombres; no ejecutar o trasplantar SQL legado |
| Exportación de tablas | Después — contrato/implementación pendientes | Filas/columnas autorizadas, filtros/selección y formato fiel |
| Horas por trabajador/obra/tarea | Después — contrato/implementación pendientes | Distintas de horas manuales presupuestadas |
| Agenda y asignaciones | Después — contrato/implementación pendientes | Tipos de tarea, usuarios y uso real |
| Calidad e incidencias | Después — contrato/implementación pendientes | Orden, controles e historial; no certificación legal |
| Planificación avanzada, CNC y mecanizados | Experimental — evidencia insuficiente | Entradas/salidas/aceptación antes de construir; páginas vacías no son contrato |
| Integraciones sin documentación completa | Experimental — evidencia insuficiente | Especificación propia; ningún descarte de comportamiento se presume |
| Bitmap propietario omitido de DisForTrazos | Fuera de alcance de copia | Omisión explícita conservada; no publicar o reutilizar recursos propietarios |

## Ciclo de cada regla

1. Leer estado, este registro y evidencia actual; comprobar resultados de otras
   conversaciones y cambios del código. Reutilizar lo demostrado.
2. Investigar catálogo, configuración, manual y despiece guardado. Formular las
   hipótesis que siguen abiertas y elegir la comparación mínima que las separa.
3. Observar solo lo necesario en documentos nuevos de 0017, dentro de los
   límites vigentes. Registrar entradas/salidas/capturas privadas y variantes.
4. Si hace falta extracción, obtener copia estable y verificable coordinada con
   el operador. Adaptar explícitamente el lector a esa fuente, conservando su
   proyección técnica y controles; no disfrazar una base activa como Anterior.
5. Con regla demostrada, decidir si el código necesita corrección. Una causa
   por iteración, fixture sintética y módulo propietario. Si no necesita cambio,
   documentar por qué y cubrir el comportamiento cuando corresponda.
6. Ejecutar pruebas/typechecks pertinentes y arquitectura si cambian fronteras;
   medir el banco cuando cambia el motor. Conservar igualdades, denominador y
   exclusiones, o justificar expresamente cualquier cambio de alcance.
7. Cerrar la documentación de la misma entrega mediante el procedimiento de
   mantenimiento siguiente. Después mover el puntero «Siguiente paso» al primer
   trabajo abierto que pueda avanzar, enlazando su evidencia.

Estados: **Pendiente → En curso → Evidencia lista → Implementado → Verificado
→ Cerrado**. Usar solo las etapas aplicables. Observar no equivale a implementar;
implementar no equivale a verificar. «Condicionado» espera una brecha concreta.
Un caso no discriminante conserva la tarea abierta y concreta el próximo ensayo.
Un cierre requiere fecha, alcance, evidencia y verificaciones o motivo demostrado
de no necesitar cambio. No cerrar por haber redactado un plan.

## Instrucción obligatoria de mantenimiento documental

El usuario ha pedido actualizar o eliminar documentos de tareas para evitar
repeticiones y errores. **Forma parte de cada entrega, no se pospone a otra tarea.**

1. Buscar el ID de la tarea, su descripción y enlaces en este roadmap, estado,
   relevos, planes, ensayos e índice. Consultar también el item July existente
   cuando la tarea se siga allí; usar proyecto/sync_uid, no solo ID local.
2. Actualizar aquí la fila existente, con fecha/evidencia y etapa real. No crear
   otra tarea para el mismo trabajo ni duplicar su estado en nuevos relevos.
3. Actualizar ESTADO-ACTUAL y los procedimientos afectados: quitar instrucciones
   ya satisfechas, corregir condiciones antiguas y enlazar lo que queda pendiente.
   No sustituir un resultado histórico por un resultado reciente sin atribución.
4. **Eliminar** planes/relevos de tareas duplicados o agotados cuando no contengan
   evidencia ni decisiones únicas y toda información útil esté ya integrada.
   Comprobar sus enlaces entrantes y corregirlos antes de eliminar el archivo.
5. **Conservar como histórico** lo que contenga evidencia o decisiones únicas:
   añadir al principio fecha, «Histórico; no ejecutar como lista de tareas» y
   enlace al documento vigente. Actualizar índice y enlaces si se mueve a
   docs/historico. Un documento mixto puede conservar la evidencia y retirar
   únicamente sus instrucciones vencidas.
6. Informes del banco, capturas, fuentes y resultados fechados no se eliminan
   para ocultar una discrepancia. Los archivos privados, secretos y datos reales
   conservan sus límites; la limpieza de tareas no autoriza borrarlos.
7. Actualizar el item July existente cuando corresponda; si hay coordinación
   entre equipos, seguir su flujo de publicación/recepción vigente. Un cambio
   local no acredita publicación ni recepción remota. No mandar mensajes a
   otra conversación sin autorización humana.
8. Revisar enlaces, diff y git status. Entregar una nota breve de documentos
   actualizados, retirados o conservados como histórico y de la siguiente tarea.

Antes de finalizar, comprobar que ninguna instrucción operativa vigente vuelve
a pedir el trabajo cerrado y que las menciones antiguas restantes se identifican
claramente como evidencia histórica. Los detalles históricos no prevalecen
sobre este registro y ESTADO-ACTUAL.

Cierre A3, 09/10/2026: a06cd4f live en Render y migración 0029 aplicada.
Tres operaciones sintéticas y sus recibos comprobados; documentos anteriores intactos.

## Cierres registrados

Auditoría sin cierre de fases, 19/10: documentación/código contrastados,
Render `40cedd1` y BD sólo lectura verificados; 56 DB, 881 web y diez E2E en
Docker nuevo, 964 core y 68 ETL seleccionados correctos. QA local no acredita
Auth real ni precio comercial. [Informe](docs/paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md).
Se actualizan los mismos punteros e ítems; G6 protegido, sin publicación.

| Fecha | Tarea | Evidencia / mantenimiento realizado |
|---|---|---|
| 13/10/2026 | Reconciliación del main Mac | Cambios locales integrados con `4fb54b3`; se conservan A3/A4/C1/CI y evidencia anterior. Herramienta de propuesta de acristalamiento incluida, con bloqueo de modelo incompatible; tarifas sin aplicar. Continuidad Windows, estado, índice y relevo actualizados; P.6/P.7 y E1 siguen abiertos |
| 12/10/2026 | Publicación técnica C1 y tramo parcial P.6/P.7 | `40cedd1` live, 0031/0032 y carga dirigida; respaldo/restauración, ambos CI, QA remoto y datos anteriores preservados. Estado, investigación, índice, arquitectura y relevo reconciliados; siguiente matriz P.6/P.7 y E1 Windows. No cierra fabricación ni paridad integral |
| 09/10/2026 | S1/A2 | Publicadas en 7ad0ee2; audit 0, 1.431 pruebas, QA completa de tres módulos y prueba publicada 260009 con importes conservados. Estado/roadmap/relevo actualizados; siguiente P.2, S2 condicionado a publicación 14/10 |
| 09/10/2026 | A1 | Correcciones f6d5bcd publicadas; 260009 editado/guardado/recargado y PDF descargado válido. Informe, estado, índice y relevo actualizados. Límites de catálogo y visor IAB conservados; S1 siguiente |
| 03/10/2026 | M0 | Matriz e informe reproducible entregados; estado, paridad, banco e índice actualizados |
| 03/10/2026 | Roadmap y preparación de E1 | Procedimiento de despunte creado; regla de mantenimiento incorporada a AGENTS; relevo de raíz actualizado y ensayos remitidos a este registro. E1 sigue pendiente de ejecución |

Avance sin cierre, 04/10/2026: E1 tiene evidencia documental y un diagnóstico
reproducible de otra copia Windows, observación A–F y copia privada F de 0017.
Trece pruebas de diagnóstico/fronteras y 47 existentes, typechecks y arquitectura.
Complementario posterior G1–G5 demuestra alta y reparto por bases; precisión
sigue abierta tras G6-incidencia, sin recálculo nuevo. No confundir
ese corpus con el banco vigente ni cerrar por la coincidencia de costes.

## Instrucción breve para continuar

**Siguiente:** QA con sesión en producción (CF1, mano de obra por cantidad, DS2 y PDF1 hechos; E2 medido el 06/11; mano de obra por cantidad demostrada con `nDoc 1132` y residuo de comisión de `nDoc 887` documentado el 07/11: no cambiar el redondeo sin regla demostrada; E2 medido el 06/11; no reimplementar la serie propia de la unión). Lee `AGENTS.md`, `docs/ESTADO-ACTUAL.md` y este roadmap. No autoriza pull, sincronización, G6, SQL ni publicación.

El bloque siguiente es historia ordenada por fecha, no un segundo puntero. El 18/10 la evaluación E1 y la corrección técnica local ya estaban entregadas; no seguir el relevo de esa fecha como instrucción.

- 03–09/10: S1/A2 en `7ad0ee2`; P.2 en `46c613d` (queda aceptación comercial, July 205; no repetir paginación); A3 en `a06cd4f` con 0029; A4 en `487feb1` con 0030; A5 run 37971854995; D1 cerrado local. No repetir.
- 12/10: C1 y publicación técnica en `40cedd1`. El siguiente Mac de entonces era la matriz P.6/P.7. No repetir la publicación.
- 14/10, cerrado el 04/11/2026: S2 revalidó el anuncio Next en `fix/s2-next-zod-seguridad` (next 15.5.29, zod 4.6.7, audit de producción 0). Este registro ya no manda revisarlo. No repetir S1/A2 ni S2.
- 04–19/10: E1 mediante `docs/paridad/PASO-E1-DESPUNTE.md` y `EVIDENCIA-E1-DESPUNTE-2026-10-04.md`. Copia F y A–F; residuo B/D explicado por margen GID. G1–G5 entregados y G6 protegido. La propuesta de limpieza del 04/10 está inactiva. El 19/10 la observación entonces era empresa sintética, RED/locale y predicciones. No repetir A–F ni G1–G5.
- 31/10: la observación E1 por visión sigue en el equipo del titular. No se reanuda desde este portátil.

En cada entrega, actualiza el estado, marca como histórico lo agotado y deja un solo siguiente. No repitas M0 ni las correcciones ya verificadas.
