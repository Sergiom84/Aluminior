# Roadmap operativo de paridad con Productor

> **Dirección vigente — 19/10:** [auditoría de integración](docs/paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md). Integración parcial; Render sigue en `40cedd1` del 12/10. Diez E2E con PostgreSQL Docker aislado y QA local pasan; Auth real y comparación humana pendientes. E1 comercial y tarifa dinámica sin activar; G6 protegido y Windows archivado. [Continuidad](docs/paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#continuar-en-otra-conversación).

Actualizado: 19/10/2026 (zoom nativo 200% del configurador y etiquetas verificados localmente; formato, proveedor, carga, índice, comparador/normalizador, cuerpo de clave de fila y transformaciones delegadas E1 seguidos estáticamente en su alcance; condiciones de los predicados, contrato WCTMB y enlace candidato ApiSet seguidos estáticamente; escrituras condicionadas de las dos celdas KernelBase seguidas; escritura del selector e identidad del DWORD acreditadas; inicializador local de Flags y llamador Ex acreditados en su alcance; frontera NtCreateUserProcess, estado efectivo y equivalencia pendientes; C1 y P.6/P.7 conservan su etapa del 12/10). Entrada del proyecto: [ESTADO-ACTUAL](docs/ESTADO-ACTUAL.md).
Este archivo es el registro único del orden y estado de estas tareas.
Los documentos de ensayo explican cómo realizarlas; los informes fechados
conservan evidencia. Sus antiguas listas de pendientes no sustituyen este registro.


## Siguiente paso

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
Siguiente P.6/P.7: Auth real en aislamiento y comparación humana del mismo
recorrido con Productor, con alcance propio. No repetir los diez casos sin
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
El siguiente trabajo de producto sigue siendo la frontera E1 que figura abajo;
la nueva vía nativa no cierra configuración, agregados, redondeo ni persistencia.
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


**Continuidad Windows:** seguir [la guía](docs/CONTINUAR-EN-WINDOWS.md),
recibir código/documentación y localizar fuentes privadas. P.2: aceptación
comercial con el titular. E1: conservar G6 y preparar nueva empresa sintética
aislada con RED/locale y caso discriminante, previa autorización del original. E7:
contraste Productor de fracciones, con A4 ya publicado. Esta entrega no
reabre tareas técnicas cerradas ni cambia el orden E1–E11.

**S3 verificado en CI el 09/10:** 1.448 pruebas correctas/una condicionada a CSV privado, seis recorridos de navegador, tipos, arquitectura y build en 36a47f4. Siguiente Mac vigente: matriz restante de P.6/P.7; C1 publicado/verificado técnico, ver recibo 12/10. [Evidencia](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md#s3-validación-completa-de-los-paquetes-en-ci--09102026).

**A3 publicado/verificado el 09/10 en `a06cd4f`, con 0029 aplicada.** A4 publicado/verificado en `487feb1`: 0030 aplicada, conexiones renovadas y alta/edición/recarga/copia/PDF decimales comprobados en producción. A5 verificado en GitHub Actions (run 37971854995, seis recorridos correctos). D1 reconciliado localmente. [Informe](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md). E1 depende de Windows; P.2 conserva aceptación comercial y S2 el anuncio del 14/10.

**S1 y A2 publicados y verificados el 09/10**, Render live `7ad0ee2`: dependencias
sin avisos npm publicados a la fecha, 1.431 pruebas y miniaturas de conjunto.
260009 reguardado/recargado conserva 805,65 € y avisos. [Informe y límites](docs/paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md).
**S2**: revisar el anuncio Next previsto para el 14/10 cuando se publiquen las
versiones afectadas/corregidas. Sin seguimiento automático creado.

### Siguiente investigación económica

**E1 — demostrar el cálculo y reparto del despunte.**
Continuar [PASO-E1-DESPUNTE](docs/paridad/PASO-E1-DESPUNTE.md) desde los resultados A–F conservados.
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
| E1 | Despunte de cabecera: base, momento y reparto | En curso; matriz y corrección técnica local entregadas. R1 preparado; Crystal 13.0.35.4870 instalado sólo en el invitado. Siguiente parada: actualizar controles y librerías, sin aceptar | [Ensayo y siguiente dependencia](docs/paridad/PASO-E1-DESPUNTE.md#ensayo-autorizado-del-1910-configuración-y-redondeo). Recibo invitado verifica 341 archivos sin MDB/empresas y cero adaptadores activos. msiexec del invitado terminó en 0, sin reinicio, y el comprobador de Crystal desapareció al reabrir. No se pulsó Aceptar en el diálogo de controles/librerías. No acredita aplicación operativa ni licencia ni R1. No repetir reinicio/activador/inventario ni exigir demo. Cargo sigue bloqueado por filas/agregados, cantidades/descuentos, precisión/configuración y escritura. G6 y producción intactos; no activar cabecera por simulaciones ni repetir matriz/Windows interno |
| E2 | Unión material de otra serie en GRUPO | Pendiente | Selección desde diagnóstico privado de los ocho casos de iteración 13; código/serie/acabado y geometría demostrados, sin extrapolar U |
| E3 | Comisión: orden de redondeo y edición de líneas guardadas | Pendiente | Caso 0/−10/+10, suma de filas y momento de aplicación; separar cantidades/horas; seis residuos comunicados |
| E4 | Tapajuntas de puerta con inferior SI/NO | Pendiente | GMT004, 1P 867×2098 con serie/ala/cajón reales; comparación lateral y travesaño |
| E5 | Compacto y metraje COMPVAL | Pendiente | Identificar hueco/ventana/accesorio, COM009, cajón, vuelos y opciones; discriminar 4,93/4,94 con PVP vigente |
| E6 | Acristalamiento alternativo y vidrio por elemento | Contención publicada 09/10; paridad pendiente | Motor catálogo rechaza precio falso de opción 1 para opción alternativa y guarda incompleto.  Mapeo observado de opción/nTAcris/tablas/junquillos/juntas; iniciar con 1/2/3 y mismo vidrio |
| E7 | Conservación de medidas fraccionarias | Pendiente de contraste Productor; A4 web verificado 09/10 | C2 970×439,5 y 970×1999,5 con configuración real fijada: entrada, cortes, guardar/reabrir. 0030 y persistencia web ya entregados; no repetir migración ni equiparar el fijo sintético A4 con esta receta |
| E8 | Tramos y opciones de herraje | Condicionado | Solo si falta cobertura tras catálogo/CHM/diagnóstico; límite real del corte de hoja, no dimensión exterior supuesta |
| E9 | Referencias, cotas y divisiones restantes | Condicionado | Aislar cadena en los cortes discrepantes; predicción independiente de la instancia |
| E10 | Acabado efectivo UNI/L y selección PVP | Pendiente de investigación | Comparar acabado de pieza, selector y tarifa; no normalizar por coincidencia económica |
| E11 | Mínimos, múltiplos e intervalos restantes | Condicionado | Usar límites reales de catálogo y entradas compatibles a ambos lados de cada frontera |
| A1 | Aceptación en web publicada | Cerrado el recorrido auditado 09/10 | [Auditoría](docs/paridad/AUDITORIA-FUNCIONAL-2026-10-09.md): Render live f6d5bcd, 260009 guardado/recargado y PDF válido 805,65 €. Visor IAB gris, archivo comprobado aparte. No certifica todas las familias, fabricación ni precio |
| S1 | Mantenimiento de dependencias | Publicado/verificado 09/10 | b1682a3 incluido en Render live 7ad0ee2; audit 11→0 / producción 4→0; ci, 1.431 tests, tipos, arquitectura y build correctos. Guardado/recarga/PDF 260009; no cubre el anuncio futuro S2 |
| S2 | Revisar anuncio de seguridad Next.js del 08/10 | Pendiente de revalidación; fecha anunciada 14/10 ya transcurrida | Revalidar advisory/versiones en su unidad propia; esta auditoría de integración no ejecuta esa revisión ni lo da por corregido. Fuente en informe de mantenimiento; sin automatización creada |
| A2 | Miniatura del GRUPO completo | Publicado/verificado 09/10 | 7ad0ee2; tres módulos desiguales con dos uniones guardados/reabiertos en QA, SVG/PDF completos; teclado y escritorio/móvil. Basado en RECON-CERRAMIENTOS §4 quater; sin cambios de valoración |
| A3 | Idempotencia de nueva cabecera y copia | Publicado/verificado 09/10 | a06cd4f live; 0029 aplicada, RLS y documentos previos conservados. Alta/copia/revisión sintéticas y tres reintentos READ ONLY remotos con mismos IDs; pérdida HTTP física local. Ver informe A3 |
| P.2 | Aceptación PDF multipágina | Paginación publicada/verificada 09/10; formato comercial pendiente | [Informe](docs/paridad/PDF-MULTIPAGINA-2026-10-09.md): 6 escenarios, 21 páginas, 628 marcadores, 28 bloques; endpoint local 12 líneas/4 páginas. 741 tests web, tipos/build/arquitectura. Render live 46c613d, endpoint 260009 verificado (1 página, 805,65 €); formato comercial Productor/titular pendiente. July 205 |
| A4 | Conservar medidas exteriores decimales | Publicado/verificado 09/10 | Render live 487feb1, 0030 aplicada; alta/edición/recarga/copia/PDF decimales en producción, documentos previos intactos. 757 tests web y 56 BD. No cierra E7 |
| A5 | Recorrido sintético de navegador en CI | Verificado local y CI 09/10 | Seis recorridos escritorio/móvil: postcommit, medidas, latencia/fallo de catálogo y teclado; GitHub Actions run 37971854995 correcto |
| S3 | Validación completa de paquetes en CI | Verificado local y CI 09/10 | 9bf9a64/36a47f4: 1.448 tests correctos/uno condicionado a CSV privado; tipos, arquitectura y build, run 37978474635. Seis recorridos, run 37978474739. Corrige test ETL obsoleto y contrato de fixture PDF; no toca producción |
| C1 | PVP por medidas y contención de precio plano | Publicado/verificado técnico 12/10; alcance acotado | [Publicación](docs/paridad/PUBLICACION-CLONERSOFT-2026-10-12.md): `40cedd1` live, 0031/0032 y carga dirigida, CI y QA remoto/preservación correctos. Dos precios dimensionales corroborados; coste/fabricación fuera del cierre y banco 400/523 conservado |
| P.6/P.7 | Teclado, foco y adaptación responsive | Parcialmente publicado 12/10; componentes/foco y zoom locales 18–19/10; diez E2E Docker locales 19/10; aceptación integral abierta | [Auditoría actual](docs/paridad/AUDITORIA-INTEGRACION-REA-2026-10-19.md#pruebas-ejecutadas-en-aislamiento) y [zoom](docs/paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md#resultado-local-p6p7-de-zoom-nativo--1910): doce escenarios a 200% nativo y 58 capturas; control anterior falla en cuatro. Los diez E2E prueban guardado/copia/decimales/cliente con QA local y BD nueva; no Auth Supabase, precio comercial ni toda la matriz visual. Siguiente: Auth real aislado, comparación humana con Productor y aceptación. Captura visual 200% de producción conserva su límite histórico. Ítem local 195; no crear otro |
| D1 | Reconciliar ficha de acceso de July | Cerrado local 09/10 | Ficha actualizada con comprobación directa A4, Render live 487feb1 y 31 migraciones; historial fechado preservado. Sin sync/recepción acreditados |

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

> Vigente al 18/10: evaluación E1 realizada y corrección técnica local entregada.
> Seguir únicamente resultado/siguiente entrega del relevo 18/10 enlazado al inicio.
> Las instrucciones anteriores siguientes son históricas y no autorizan pull,
> sincronización, G6, SQL, publicación ni continuar Windows en esta sesión.

> Lee AGENTS.md, docs/ESTADO-ACTUAL.md y ROADMAP-PARIDAD-PRODUCTOR.md.
> S1/A2 publicados y verificados; lee docs/paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md.
> P.2 publicado y verificado en 46c613d: lee docs/paridad/PDF-MULTIPAGINA-2026-10-09.md.
> A3 publicado/verificado en a06cd4f y 0029 aplicada: lee docs/paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md. No repetir.
> P.2: sólo queda aceptación comercial, July 205; no repetir paginación.
> Checkout aislado a3-idempotencia/Aluminior, rama codex/ci-validacion-completa desde origin/main eb3b53c. Comprobar estado remoto antes de continuar; main local contiene cambios ajenos.
> S2 requiere revisar el anuncio Next cuando se publiquen versiones el 14/10. No repetir S1/A2.
> Mac: A4 publicado/verificado en 487feb1, 0030 aplicada; A5 CI alojada correcta, run 37971854995; D1 cerrado local. No repetir esta entrega. Siguiente Mac vigente: matriz restante P.6/P.7; C1/0031/0032/carga y publicación técnica ya verificados en 40cedd1, no repetir. Lee docs/paridad/PUBLICACION-CLONERSOFT-2026-10-12.md. P.2 conserva aceptación comercial; E1/E7 requieren Windows y S2 espera al 14/10. Lee docs/paridad/MEDIDAS-Y-CI-2026-10-09.md.
> La siguiente investigación económica sigue siendo E1 mediante
> docs/paridad/PASO-E1-DESPUNTE.md, tras leer EVIDENCIA-E1-DESPUNTE-2026-10-04.md.
> Usa copia F y resultados A–F; el residuo B/D ya está explicado por margen GID.
> G1–G5 entregados y G6-incidencia protegido. La propuesta de limpieza del 04/10 está inactiva: no operar G6. La observación vigente usa empresa sintética nueva y RED/locale/predicciones divergentes, con autorización del original. No repetir A–F ni G1–G5.
> Comprueba evidencia posterior de visión. En cada entrega, actualiza el estado y elimina,
> actualiza o marca como históricos sus documentos obsoletos; repara enlaces y
> deja el siguiente paso concreto. No repitas M0 ni las correcciones ya verificadas.
