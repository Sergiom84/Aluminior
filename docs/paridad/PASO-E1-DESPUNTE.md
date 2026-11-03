# Siguiente paso E1: cálculo y reparto del despunte

> **Dirección vigente — 19/10, primer arranque observado:** ensayo E1 aislado autorizado. [Resultado y siguiente dependencia](#ensayo-autorizado-del-1910-configuración-y-redondeo): Sandbox operativo tras el reinicio; el comprobador de Productor exige Crystal Reports 13.0.35. No repetir reinicio/activador/inventario ni exigir demo. Primera unidad de arranque detenida y revisada; resolver únicamente ese requisito dentro del invitado antes de reintentar. Cargo comercial desactivado, G6 y producción intocables. Windows interno archivado.

Procedimiento preparado el 03/10/2026 y actualizado el 04/10. Estado vigente:
[roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md). La [continuación estática del 14/10](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#control-reparto-y-totales)
ya recuperó wrappers/campos y, en su segunda unidad, layout estático y
consumidor DEScalcula, declaraciones COM y receptores/selector de alBDADO.
Los cuerpos de control/reparto/totales también están seguidos. La
[unidad del 17/10](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contrato-de-formato-varformat)
amplía máscaras/Variant y contrato público de formato, sin cerrar empates ni
localización efectiva. La [unidad posterior de configuración](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#proveedor-de-configuración-y-argumento-2)
identifica `gaConfigDAL.Carga` y acredita el fallback condicionado del BSTR `2`,
sin demostrar las cuatro escalas efectivas. La [unidad de procedencia](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-y-precedencia-del-índice-de-configuración)
sigue AbreRS y la carga de lista con índice NombreDato. La [unidad del índice](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#configuración-construcción-y-selección-del-índice)
sigue configuración/construcción, ordenación y selección de posición; no prueba
prioridad primera/última ni equivalencia de claves. La [continuación de claves](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves)
sigue inicializador del comparador y bifurcación del normalizador; no repetirlos.
La [unidad de fila y delegados](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#clave-de-fila-y-transformaciones-del-índice)
atribuye el cuerpo propio de `x_Clave` y sigue proveedor/slots de transformación.
Los [predicados internos de rellena](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena)
ya tienen condiciones y ramas seguidas estáticamente. La [frontera WCTMB](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte)
acredita contrato público y enlace candidato ApiSet. La [procedencia del estado](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-estado-de-kernelbase)
acredita escrituras y fallback condicionados de las dos celdas. La
[procedencia del selector](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-del-byte-selector-de-kernelbase)
acredita una escritura literal condicionada a `1`. La [identidad del DWORD, 18/10](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-inmediata-del-dword-de-kernelbase)
queda atribuida por bytes y tipos x86 a `_RTL_USER_PROCESS_PARAMETERS.Flags`
en `+0x8`, mediante `TEB → PEB → ProcessParameters`. La [inicialización local de Flags, 18/10](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#inicialización-local-de-flags)
acredita en ntdll `_RtlCreateProcessParametersInternal@48` la escritura de `1`
en `0x4b2aa8f8`: bit 31 a cero en ese instante del bloque construido.
No demuestra que sea el bloque del PEB leído ni que se ejecute antes del consumidor.
La entrega interna `0x4b2aa9df` y los wrappers Ex/WithTemplate están seguidos.
La [unidad del llamador Ex](IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#llamador-externo-y-destinatario-de-ex)
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
No repetir escrituras de las dos celdas, contrato/enlace ni predicados.
Después valores efectivos, equivalencia y entrada de agregados. No repetir estos cuerpos ni `xConfig`,
construcción/búsqueda, AbreRS/carga de lista ni
inventarios/literales/preparación pura/declaraciones ni proveedor/argumento `2`. El procedimiento
de observación siguiente es una vía separada y necesita autorización propia.
Ya se entregó la
[investigación documental y contraste guardado](EVIDENCIA-E1-DESPUNTE-2026-10-04.md);
no repetirla. G1–G5 demuestran alta independiente, reparto por bases distintas
y persistencia. La variante 1207×1150 produjo error de opciones/SessionFactory
y un tercer GRUPO; se conserva como G6-incidencia, sin nuevo despunte.
La propuesta del 04/10 de retirar el tercer GRUPO queda histórica e inactiva.
El siguiente ensayo vigente usa una nueva empresa sintética aislada con
RED/locale efectivos y predicciones discriminantes; no operar G6.
No repetir A–F ni G1–G5 ni atribuir G6-incidencia a un recálculo válido.

Continuidad entre equipos: [guía Windows](../CONTINUAR-EN-WINDOWS.md).
Item E1 por proyecto `aluminior` + sync_uid
`398049fbd618069e36bb84bab37913ed`: los números Windows 180/Mac 192 son
referencias históricas del ensayo, no identidad vigente. Redescubrir el ítem
por sync_uid/proyecto antes de editarlo; el 180 del Mac trataba descuentos.
Las fuentes privadas no
viajan por Git/July; comprobar copias y autorización antes de operar.

## Ensayo autorizado del 19/10: configuración y redondeo

Petición posterior a la auditoría: ejecutar el ensayo en aislamiento y aplicar
en Aluminior sólo lo demostrado, usando subagentes y sin tocar G6 ni producción.
La autorización para ese alcance ya está recibida; no volver a pedirla por los
antiguos avisos de esta documentación. El ensayo **todavía no está ejecutado**.

**Inventario administrativo completado por Sergio:** recibo del 19/10 a las
06:32:45 UTC, script/hash/destino verificados. `Get-VM -ComputerName localhost`
responde correctamente y devuelve **cero VMs registradas**. Windows 11 Pro tiene
Hyper-V instalado y Sandbox deshabilitado. El bloqueo inicial de consulta por
permisos queda superado; no pedir repetir
`output/e1-ensayo-config-20261019/preparacion/Comprobar-entorno-E1.ps1`.
La sesión del agente sigue sin elevar: este recibo no le concede administración.
Docker usa Linux; los servicios de licencia activos del host no demuestran
licencia utilizable dentro de un invitado.

**Vía elegida por Sergio: aprovechar la instalación existente** en
`C:/Users/sergi/Desktop/MIX/Productor/Aluminio`. No se ha demostrado que requiera
un instalador completo para probar su copia. Se preparan **341 archivos,
220.429.241 bytes**, con manifiesto y hashes de origen/copia verificados:
ejecutables actuales, bibliotecas, configuración neutra de runtime y paquete
de componentes GAIA. La aplicación de referencia conserva **46.30.0006**.
No se copian MDB, empresas `EMP*`, índices/configuración de Empresas, correo,
credenciales, logs, backups, estado de licencia ni enlaces/junctions.
La caché histórica `43.35/43.35` contiene otra versión, **42.35.0002**;
no se usa como sustituto ni se ejecuta su actualizador.

**Activación y reinicio completados:** el activador revisado se ejecutó
elevado el 19/10 a las 06:56 UTC. Recibo: `Disabled → Enabled`, `restartNeeded=true`,
sin error; CIM confirma `InstallState=1`. Sergio reinició Windows: arranque del
host a las 10:51:42 UTC, posterior a la activación. `WindowsSandbox.exe` ya
disponible. El perfil `Arranque-E1.wsb` se abrió a las 11:04:38 UTC; Windows
completó su instalación de primer uso y abrió el invitado. No repetir el
activador, el inventario ni solicitar otro reinicio por este paso.
[Microsoft documenta](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file)
el control de red/carpetas y el descarte al cerrar. El perfil desactiva red,
portapapeles, audio, vídeo, impresora y vGPU. Sólo comparte el paquete preparado
como lectura y una salida nueva acotada; no comparte instalación original,
empresas ni repositorio completo. Copia de trabajo dentro del disco invitado.
El preparador invitado rechaza ejecutarse en el host y no lanza Productor.
El recibo invitado del 19/10 a las 11:05:25 UTC confirma el modelo de máquina
virtual, cuenta `WDAGUtilityAccount`, 341 archivos verificados en
`C:/E1Guest/Aluminio` y cero adaptadores de red activos. No se copiaron MDB.
Los campos `legacyExecuted=false` y `databasesCopied=false` pertenecen a esa
preparación previa; no son una medición del intento posterior.
Revisión independiente de preparación PASS tras un único lote de corrección
(lectura UTF-8 explícita y política
RemoteSigned sólo del proceso invitado). Sin Bypass ni política persistente.
Con lectura anterior faltaban dos archivos con «ñ»; con UTF-8 se resuelven los
341. Guardas del host y del activador, hashes, perfil y enlaces verificados.

**Resultado del primer arranque:** doble clic sobre «Productor copia E1» en el
escritorio invitado. El comprobador muestra «No es posible ejecutar la
aplicación Productor Aluminio» y el requisito visible incumplido **Crystal
Reports para Visual Studio. Versión 13.0.35**. Se capturó la pantalla y se detuvo
esa unidad, sin pulsar su enlace ni registrar componentes. El lanzador alcanza
la comprobación de requisitos; no demuestra aplicación operativa, licencia,
empresa nueva, RED/locale ni ensayo económico R1.

El MSI que acompaña la instalación original está firmado por SAP, pero su
tabla Property declara **13.0.0.99**: no asumir versión por su nombre genérico.
Lectura exclusivamente `MSIDBOPEN_READONLY`, sin instalar o reparar productos.
GAIA publica un paquete explícito 13.0.35 de 32 bits en su
[soporte oficial](https://www.gaia-soft.com/soporte). Se ha descargado al área
privada de pruebas, con firma válida de SAP SE y propiedades leídas sin escritura:
**13.0.35.4870**, ProductCode `{E43D7D73-C531-4EB3-ACC9-0EF11E1A84B0}`.

**Instalación invitada completada y parada en la dependencia siguiente.**
El mismo Sandbox, UUID `d8248510-bae0-4a2e-a208-93484eee479c`, recibió el MSI
oficial por `wsb exec` como `NT AUTHORITY\SYSTEM`. Recibo
`salida/crystal-13.0.35-20261019T113449349Z-09a9e4d0435e45739dd1c7d5559d73d7/recibo.json`:
estado `installed-verified-stop`, salida 0, sin reinicio, una sola entrada
Registry32 con DisplayVersion `13.0.35.4870`. Los 341 archivos del payload y
su manifiesto no cambiaron. No se ejecutó msiexec en el host ni se usó el MSI
13.0.0.99. Se cerró el comprobador que seguía abierto y se reabrió una vez
`aluminio.exe`. Crystal Reports ya no figura como requisito incumplido. El
diálogo nuevo, capturado y no aceptado, dice: «Es necesario actualizar los
controles y librerías para el correcto funcionamiento del programa. Vuelva a
ejecutar la aplicación Productor Aluminio al finalizar este proceso.» Esa
actualización queda fuera de esa unidad: no se pulsó Aceptar ni se registraron
componentes. Licencia, RED/locale y R1 siguen sin observar.

**Unidad de controles y librerías — 19/10, parada por falta de mochila.**
En el mismo invitado `d8248510-bae0-4a2e-a208-93484eee479c` se aceptó el diálogo
y se observó la cadena completa de dependencias, sin tocar el host:

| Observación | Evidencia | Límite |
|---|---|---|
| Al aceptar, el registrador `gaControlesReg` arranca y cae con «Run-time error '339': Component 'MSCOMCTL.OCX' or one of its dependencies not correctly registered» | `salida/controles-estado-20261019T133625237Z/` | El invitado no trae MSCOMCTL.OCX ni su CLSID; el payload de 341 archivos tampoco |
| MSCOMCTL.OCX 6.00.8862 del host, firma Microsoft válida, SHA256 `09f126e6…b9712`, copiado a `SysWOW64` del invitado y registrado con `regsvr32 /s` | `salida/mscomctl-registro-20261019T133936925Z/` y `salida/mscomctl-verificacion-20261019T134128454Z.json`: 26 CLSID y la TypeLib `{831FDD16-…}` | Registro sólo en el invitado; el host no se modificó. El primer recibo se marcó `failed` por consultar un CLSID equivocado, corregido en la verificación posterior |
| Reabierto `aluminio.exe`, vuelve a pedir actualizar controles; aceptado, el registrador recorre los componentes con RegAsm | `salida/reapertura-controles-20261019T134208324Z/` y `salida/controles-aceptar-20261019T134245870Z/` | Sigue sin acreditar aplicación operativa |
| Único error final del registrador: «Error CRUFLGaia.dll: Error copiando CRUFLGaia.dll. No existe destino: C:\Windows\CRYSTAL\» | `salida/registrador-textos-*.json` | Falta la carpeta UFL heredada de Crystal; no se creó en esta unidad |

Parada: Sergio comunica que **no dispone ahora de la mochila USB** de licencia
(HASP/UniKey). Sin ella la copia no puede llegar a licencia, empresas ni al
ensayo económico, así que la cadena RED/locale y el caso discriminante quedan
bloqueados por hardware, no por preparación. No se instaló nada en el host, no
se tocaron licencias ni salvaguardas y G6 sigue intacto. El aviso de batería
crítica del equipo anfitrión quedó encima del invitado durante los últimos
intentos y bloqueó el teclado/ratón sintético: se conserva en las capturas.

Preparación privada y contrato detallado:
`output/e1-ensayo-config-20261019/continuacion-admin/copia-instalada/`.
Recibo de activación conservado allí:
`sandbox-feature-20261019T065658248Z-510aaa62d052454ca2c8f055220ad53b.json`.
Evidencia posterior:
`output/e1-ensayo-config-20261019/post-reinicio-20261019/primer-arranque.png`,
recibo invitado en `salida/`, revisión independiente y propiedades MSI en
`post-reinicio-20261019/`. La verificación paralela conserva 369/370 guardas:
«salida vacía» falla porque el invitado escribió su recibo durante el barrido;
integridad del paquete, perfil y preservación sí pasan. No debilitar esa guarda
ni presentar la ejecución completa del verificador como verde.
La [demo oficial](https://landing.gaia-soft.com/pc-productor-aluminio-prueba/)
queda como alternativa si un impedimento observado justifica usarla, no como
requisito actual. No se ha solicitado ni enviado formulario alguno. El acceso
de la licencia al invitado sigue sin observar; no se copia ni sustituye una llave.
Antes de R1 siguen siendo obligatorios runtime/licencia legítimos, configuración
efectiva RED/locale, empresa sintética y capacidad de despunte/guardado verificadas.

Recibo privado de entrada:
`output/e1-ensayo-config-20261019/preparacion/entorno-E1-20261019T063245234Z-7697d2a51ffe4737a0ac372a2998c986.json`
(SHA256 `9634d0515bf10a66f4b6081ba473c14b2d8ff0885e6088a152a50930e0374cea`).
Validación con cinco controles negativos e inventario de medios:
`output/e1-ensayo-config-20261019/continuacion-admin/`.

**Caso preparado R1, condicionado y no observado:** tres líneas con bases
40/60/400 €, perfil ML sintético, barra 6.000 mm y cortes 400/600/4.000 mm.
Coste candidato 16,68 €/m y PVP 100 €/m; sin descuentos, kerf, saneado o retales.
El coste candidato de barras menos perfiles es 16,68 €. Con margen GID
hipotético 0,01 % sobre coste resulta 16,681668 €. Las cuatro RED y el locale
efectivos siguen sin capturar; las predicciones siguientes requieren escalas
de dos decimales y las bases/agregados descritos. No son valores por defecto.

| Hipótesis | Cargo L1 | Cargo L2 | Cargo L3 | Suma |
|---|---:|---:|---:|---:|
| A: GID fino y cuotas independientes | 1,33 | 2,00 | 13,35 | 16,68 |
| B: GID a céntimos y cuotas independientes | 1,33 | 2,00 | 13,34 | 16,67 |
| C: GID a céntimos y mayor resto | 1,34 | 2,00 | 13,34 | 16,68 |
| D: precio unitario ML antes de importe | 1,34 | 2,00 | 13,36 | 16,70 |

Los vectores distinguen las hipótesis por identidad, aunque A/C compartan suma.
A/B/C no tienen empates monetarios ni de restos; la separación mínima de media
unidad es 0,0003344 €. D advierte que el precio visible puede introducir otra
etapa: registrar `GastosIndirectos` precisos, precio/unidad, metraje e importe.
Un resultado fuera de las hipótesis exige corregirlas, no un ajuste de céntimos.
No se clasifica nada si faltan RED/locale, entradas o formación de agregados.

Preparación privada: `output/e1-ensayo-config-20261019/casos/PROTOCOLO.md`,
`predecir.py`, `predicciones.json` y `captura-pendiente.json`. Generador racional
independiente y contraste Decimal del arquitecto coinciden; ejecución sin
conexiones. La captura mantiene configuración/observación/clasificación nulas.
No se modifica `repartirDecimal`, el coste técnico ni un cargo comercial por
estas simulaciones. No hay cambio funcional demostrado que aplicar todavía.

## Antes de abrir un ensayo

Leer AGENTS, [estado](../ESTADO-ACTUAL.md) y roadmap. Consultar la conversación
«Observar ensayos de Productor» y cualquier evidencia posterior de E1; reutilizar
un ensayo completo. Si el original está siendo operado, coordinar el turno
antes de tocarlo. Las conversaciones no se pueden mensajear automáticamente
sin autorización humana; se puede leer su progreso y registrar lo que falta.

Revisar [ensayos mínimos](ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md), E1,
[Gastos observados](RECON-DETALLE-PRESUPUESTO.md) y
[vídeo, sección 9](EVIDENCIA-VIDEO-PRESUPUESTO.md).
La evidencia histórica describe dos modos de repercusión y ejecución por
Barras Completas o Longitud Aprovechable. El manual demuestra la resta de
costes, con límite total a cero y medidas de valoración distintas del corte;
13 documentos positivos con detalle la reconcilian en la copia Windows del
04/10. Sus huellas difieren de las del banco: no mezclar corpus. G1–G5 demuestra
reparto por bases distintas sin cargo anterior, alta independiente y persistencia;
precisión aún no discriminada, con el alcance detallado en su evidencia.
En la primera consulta del 04/10 las conversaciones no aportaron E1 completo
y Productor no estaba abierto. Después el usuario lo abrió y autorizó continuar:
empresa 0017 confirmada y configuración manual recibida. Se verificó C2
GMC400 1500×1150, VCG4; se aplicó acabado L y cantidad 1. A–F conservados en
`output/e1-despunte/observacion-20261004/`: línea, gastos, totales, GRUPO,
despiece. B/D/E por Barras Completas, reparto entre líneas, coste mínimo,
compra sin gastos, sin descuento de proveedor ni M2. C por duplicación;
D sustituye cargo, E y F conservan resultado. Copia F privada verificada:
usar el lector específico `scripts/lib/despunte-guardado/ensayo-0017.ts`.
No repetir el alta, cálculos ni reapertura ya capturados. Opciones de herraje
no inspeccionadas; solo despiece generado acreditado. En esta versión aparece
también «Solo imputar Coste», pendiente como variante propia.
Sergio indicó la entrada por clic/escritura/lupa/Actualizar; queda en
[guía de cerramientos](RECON-CERRAMIENTOS.md#elemento-seleccionado).
Si la accesibilidad corresponde a otra ventana, no usar sus índices;
reactivar Productor y observar la pantalla actual antes de la siguiente entrada.

Si la evidencia disponible ya explica la regla, comenzar por contrastarla
automáticamente. La visión solo debe resolver datos o comportamiento que falten.
Usar la skill Computer Use cuando se opere el original, observando pantalla y
controles actuales; estas instrucciones no fijan coordenadas.

## Plan R1 con mochila, 31/10/2026

Estado: **plan; ninguna fase ejecutada con resultado.** Sustituye en la práctica
a los pasos 1–5 de la sección siguiente mientras G6 no tenga autorización
humana. Se ejecuta en el equipo del titular (§0 de
[CONTINUAR-EN-WINDOWS](../CONTINUAR-EN-WINDOWS.md#0-relevo-del-31102026-equipo-del-titular-con-visión)),
con Claude operando Productor por visión. En el portátil de Sergio solo se
llegó a E1V0 vacía y Configuración del Programa no abre por falta de
`TODGUB8.DLL`; RED y locale siguen sin observar.

| Fase | Qué hace | Condición |
|---|---|---|
| F0 | Mochila, instalación y empresa de pruebas; hash previo de la MDB de producción y `Empresas.mdb` | Nunca aceptar ni operar 0016 |
| F1 | Solo lectura: Ficheros > Otros > Configuración del Programa; anotar `REDprecio/REDlinea/REDbase/REDtotal`; locale de Windows (separadores) | Cerrar antes todas las ventanas; no guardar |
| F2 | Comprobar si el modo restringido (copia de seguridad > 7 días) impide crear o calcular | Copia solo de la empresa de pruebas y con autorización |
| F3 | Montar R1 por el recorrido normal en empresa de pruebas | Nada por SQL; si no se puede, registrar la limitación |
| F4 | Congelar predicciones, calcular el despunte, repetir, guardar y reabrir | Decidir demostrada / refutada / no discriminante |
| F5 | Contrastar con el contrato E1 y, solo con regla demostrada, afinar `core` | Fixture, control negativo, gates; cargo sigue desactivado |
| F6 | Comparación lateral P.6/P.7 con Sergio presente | Tras E1 |

**Caso R1** (sintético, tres líneas para separar políticas sin depender de un
empate): perfil ML sintético, barra de 6000 mm, cortes 400/600/4000 mm para
L1/L2/L3, cantidad 1, sin descuentos, kerf, saneado, stock ni retales; coste
16,68 €/m y PVP 100 €/m; bases candidatas 40,00 / 60,00 / 400,00 €. Barras
6 × 16,68 = 100,08 €; perfiles agrupados 5 × 16,68 = 83,40 €; cargo GID con
margen 0,01 % sobre coste: 16,68 × 1,0001 = 16,681668 €. Solo son bases reales
las que el documento previo al cálculo acredite.

Predicciones previas (condicionadas a escalas de dos decimales, que **no** se
atribuyen al runtime hasta F1):

| Modelo | L1 | L2 | L3 | Suma |
|---|---:|---:|---:|---:|
| A: GID fino, cada cuota se redondea | 1,33 | 2,00 | 13,35 | 16,68 |
| B: GID a céntimos, cada cuota se redondea | 1,33 | 2,00 | 13,34 | 16,67 |
| C: GID a céntimos, mayor resto | 1,34 | 2,00 | 13,34 | 16,68 |
| D: PVP unitario ML redondeado primero | 1,34 | 2,00 | 13,36 | 16,70 |

Un resultado fuera de A–D significa hipótesis insuficientes: no se fuerza una
regla ni se etiqueta como error de Productor. Sondas de empate (0,125 / 0,375 /
0,625 y 1,005 / 2,675) separan mitad hacia afuera de mitad al par, pero solo
valen si pasan por la misma ruta real con tipo y locale capturados.

Frontera de aplicación: solo RED y locale → registrar, sin cambiar reglas. A o B
con persistencia al reabrir → función pura E1 específica con escalas explícitas,
sin tocar `repartirDecimal` global ni el coste técnico. C → ya existe esa
aritmética; faltan adaptador, receptores y persistencia. D u otro → fijar antes
la secuencia de precio y conversión. Ningún resultado cierra descuentos,
cantidad ≠ 1, retirada a cero, errores ni atomicidad.

Los artefactos privados del 19–31/10 (predicciones en JSON, protocolo completo,
capturas, plan del portátil) están en `output/` del portátil y no viajan por Git;
esta sección es lo que se conserva en el repositorio.

## Complementario G1–G5 entregado; recuperar variante de precisión

La [evidencia E1](EVIDENCIA-E1-DESPUNTE-2026-10-04.md) conserva transiciones
y copias: alta independiente de segunda C2 1200×1150 tras cargo, predicciones
previas, reparto por bases sin cargo anterior y F9/reapertura. G4 discrimina
bases frente a reparto igual/precios cargados, pero no las tres políticas de
precisión. No repetir G1–G5 ni A–F; descuentos cero/cantidad 1 son sus límites.

**Incidencia posterior conservada:** medidas 1207×1150, GMC400, VCG4, L, UNI/*,
cantidad 1, horas vacías y descripción verificados. Aceptar mostró error de
opciones/SessionFactory y añadió un tercer GRUPO sin modificar segunda línea.
No hubo G7 ni recálculo. G6-incidencia conserva error, copia estable y proyección;
las dos líneas anteriores son idénticas a G4/G5. No asumir configuración de
opciones completa por haber generado un precio.

**Procedimiento propuesto el 04/10, inactivo:** se conserva para explicar
la incidencia y sus precauciones. No constituye el siguiente paso ni un
permiso de borrado. Gobierna la dirección del inicio: empresa nueva y G6 intacto.

1. Se propuso solicitar autorización de borrar **solo el tercer GRUPO de 1207×1150 de la
   incidencia**, con evidencia ya conservada; nunca retirar las dos líneas
   previas. Verificar estado restaurado mediante copia estable y proyección.
2. Confirmar recorrido de edición de segunda línea sin alta nueva (se consultó
   al operador); guía fechada observa lápiz/Enter, pero esta variante acabó
   creando otra línea. Si el diseñador vuelve vacío, no aceptar otro alta.
3. Cambiar un único factor que discrimine precisión, manteniendo códigos,
   cantidad y opciones verificados. 1207×1150 fue una candidata por estimación,
   no resultado discriminante. Verificar bases reales, dos GRUPO y valoración
   completa antes de formular predicciones previas al siguiente cálculo.
4. Mismos parámetros que G4 → Finalizado → Aceptar. Conservar copia y contraste
   de políticas, reconciliar costes y comprobar guardado/persistencia. Si no
   discrimina, conservar límite y seleccionar otro caso; no decidir por igualdad.

Lector específico de 0017 consulta solo copias privadas verificadas. Mantener
capturas, IDs e importes en output ignorado. No modificar catálogo, PVP ni
instalación nativa para resolver el error. Pedir ayuda manual si falla control.

## Caso controlado A–F: recorrido ya ejecutado el 04/10

Referencia del ensayo conservado; no es una instrucción de repetirlo.
Resultados y límites en la evidencia fechada. C usa duplicación; G3 demuestra
por separado el alta independiente después del cargo.

Comprobar empresa **PRUEBAS ALUMINIOR - 2026 [0017]**, documento nuevo, tarifa 1.
Modelo **C2**, serie **GMC400**, **1500×1150 mm**, cantidad comercial **1**.
Determinar y registrar acabado principal/accesorios, vidrio, opciones, horas,
gastos y descuentos efectivos antes de valorar. Conservarlos entre estados.
No completar un dato desconocido con cero ni editar catálogo/documentos reales.

| Estado | Acción | Captura necesaria |
|---|---|---|
| A | Valorar una línea, antes de calcular despunte | Cabecera/Gastos, precio unitario/total, despiece completo, condiciones de coste y parámetros de barras |
| B | Abrir Gastos → Calcular Despunte y ejecutar con el modo observado | Parámetros exactos, Detalle Resultado, importes/base/%, barras, metros, sobrantes; precio y gastos después de aplicar |
| C | Añadir segunda línea idéntica, cantidad 1, antes de volver a calcular | Precio y gastos de ambas líneas; detectar si arrastra el gasto anterior o recalcula automáticamente |
| D | Recalcular con exactamente los parámetros de B | Resultado agregado, base/reparto por cada línea o gasto separado, despieces y precios después de aplicar |
| E | Repetir el cálculo sin cambiar entradas | Detectar sustitución o acumulación del despunte; mismo estado de barras/retales y misma política de coste |
| F | Guardar y reabrir el documento de prueba | Persistencia de gasto, precios, despieces y configuración; cambios automáticos al abrir |

Usar el modo actual como primera comparación; no cambiar varios parámetros
a la vez. Si el modo de repercusión alternativo sigue siendo necesario,
repetirlo en otro documento nuevo equivalente, registrando el modo exacto.
No extender automáticamente esa observación a otros modos de ejecución.
Si un retal se incorpora al stock de prueba o cambia su disponibilidad,
registrarlo: repetir el botón con ese cambio no prueba idempotencia por sí solo.

## Valores que hacen el ensayo reproducible

Registrar los siguientes controles cuando existan en esa versión:

- Longitud comercial/aprovechable por perfil, barras pedidas, metros necesarios
  y sobrantes; saneamiento inicial/final y disco por tipo de corte.
- Retales permitidos/disponibles y política de aprovechamiento; proveedor,
  tarifa/unidad de compra, descuento y tipo de coste usado por el cálculo.
- Seleccionar Longitud de Barra, Longitud Aprovechable, ejecución por Barras
  Completas o General/Por Perfil; modo Repartir entre líneas o Insertar aparte.
- Inclusión de artículos por M2/paneles cuando esté activa; importe necesario
  frente a pedido, Importe total Despunte, base y porcentaje de cabecera.
- Momento de aplicar/aceptar, cambios al volver al documento y necesidad de
  Actualizar/recalcular; precio base, gasto y neto total, separados de IVA.

La regla documentada «coste pedido menos coste de material valorado», limitada
a cero en el total, debe contrastarse con el detalle y política de coste real
del ensayo. Capturar metraje de valoración y de corte por separado; no asumir
que «material necesario» equivale a `plan.totalUtil`. Una igualdad de total
no demuestra el reparto, el uso de retales ni que cambie el precio de cada pieza.
Si dos hipótesis predicen lo mismo, registrar «no discriminante» y seleccionar
un caso que las separe, usando fuentes existentes antes de crear otro ensayo.
Dos líneas idénticas no discriminan reparto por importe frente a reparto por
línea: si esa duda permanece, usar otra comparación con importes distintos y
entradas verificadas, sin editar el catálogo ni inventar precios.

## Registro entregado y continuación

Registro A–F con valores y capturas en
`output/e1-despunte/observacion-20261004/observacion.json`; despiece y detalle de
cálculo asociados. Síntesis sin importes individuales en
[evidencia](EVIDENCIA-E1-DESPUNTE-2026-10-04.md).
Los valores comerciales e identificadores permanecen privados.

1. Usar campos técnicos F y configuración GID: el margen 0,01 % sobre coste
   explica el residuo B/D de 0,02 € con redondeo por línea. No repetir ese
   diagnóstico ni sumar niveles GRUPO/C2/piezas/GID.
2. Usar G1–G5 entregados y completar solo la variante de precisión descrita
   arriba; la duplicación C ya no es la única evidencia de alta tras cargo.
3. Mantener fuera de alcance herrajes no inspeccionados, stock/retales y otros
   modos salvo comparación específica con sus propias entradas.

## Qué hacer con el resultado

Si E1 queda observado, marcar **Evidencia lista** en la fila existente del
roadmap y documentar regla, fuente y variantes. Una observación incompleta o no
discriminante conserva trabajo abierto con la pregunta exacta que falta resolver.

Para extracción de 0017, coordinar cierre/estabilidad y verificar copia y huellas.
El lector del banco vigente exige Anterior.mdb: cualquier nueva frontera debe
admitir explícitamente la copia de prueba y preservar los controles de lectura,
empresa y procedencia. No cambiar el nombre de una base activa para sortearlo.

Después, una causa demostrada por corrección: fixture sintética, servicio de
gastos/reparto del documento como frontera de aplicación y cálculo puro en core
si procede. No introducir la regla económica de cabecera en el diseñador ni
en acciones amplias. Revisar primero el código de despunte existente.
Ejecutar pruebas/typechecks pertinentes, arquitectura al cambiar módulos y
nueva medición local: conservar todas las igualdades y 523/434 salvo alcance
justificado. No prometer que las diez candidatas se resolverán con un cambio.

E1 solo se cierra cuando su alcance está demostrado y la corrección necesaria
está verificada, o cuando se demuestra que no requiere cambio. Al entregar,
aplicar la limpieza documental del roadmap: actualizar estado/banco, retirar
instrucciones agotadas y enlazar evidencia; pasar a E2 cuando corresponda.
