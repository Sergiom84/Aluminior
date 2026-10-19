# Continuar Aluminior en Windows

> **Dirección vigente — 19/10:** [cerrar fases y aplicarlas a Aluminior](paridad/RELEVO-APLICACION-ALUMINIOR-2026-10-18.md). Windows queda archivado. E1 ya contrastado; cargo económico desactivado y prueba comercial aislada pendiente. Producción, errores, retorno de foco y configurador al 200% nativo verificados localmente con componentes reales y respuestas sintéticas. Etiqueta Acristalamiento corregida; capturas completas válidas. Siguiente P.6/P.7: comparación humana del mismo recorrido con Productor y recorrido autenticado aislado, con autorización propia. Aceptación integral abierta. No repetir las unidades anteriores.

Relevo preparado el **10/10/2026** desde `origin/main` `9673659`. Entrada:
[estado actual](ESTADO-ACTUAL.md) → [roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md).
Esta guía organiza el trabajo en Windows; los estados de cada tarea pertenecen
al roadmap. [Auditoría y límites de esta revisión](AUDITORIA-DOCUMENTAL-2026-10-10.md).

## 1. Recibir el trabajo correcto

Investigación local del 16/10 en **otro worktree**, rama
`codex/rea-productor-20261016`, base `307bf54`:
[informe REA](paridad/INVESTIGACION-REA-PRODUCTOR-2026-10-16.md) y
[comparación](paridad/COMPARACION-REA-PRODUCTOR-2026-10-16.md).
Consultar esos resultados antes de repetir inventarios, Cut1D o análisis
global de Ghidra. El pseudocódigo dirigido se obtuvo con advertencias y no
cierra E1 ni sustituye el oráculo funcional. Los artefactos privados están
en el output ignorado del worktree; necesitan transporte separado y autorizado.
Esta rama entrega investigación/documentación, sin cambiar producto ni desplegar.

Actualización local Windows, 13/10: la integración con el catálogo de septiembre
quedó cerrada en `fa32fba`, rama `codex/integracion-windows-mac-20261013`, con
cero conflictos y gates/revisión correctos. El [lote E1](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md)
conserva aparte preparación física y cargo económico. Estos commits locales
todavía no están publicados: recibir `origin/main` no los entrega. Inspeccionar
esta rama antes de crear otro checkout o repetir la integración.

Continuación local del 14/10 en la misma rama: anclajes dirigidos E1 y
[selector de registros de tarifa dinámica](paridad/IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md)
verificados con gate de 2.004 pruebas y la omisión previa por CSV privado,
tipos/arquitectura y revisión independiente. No activar cargos ni tarifa.
La recepción requiere el commit local de esta entrega; recibir main no lo
incluye. Fuentes privadas y actualización local de July necesitan sus canales
propios; no hay publicación o recibo acreditados de esta continuación.

El main principal del Mac se reconcilia el **13/10/2026** con `origin/main`
`4fb54b3`, conservando las mejoras del 09–12/10 y los commits locales pendientes.
Sergio autoriza revisar y subir todos los cambios pendientes. La herramienta
de propuesta de doble acristalamiento pasa a formar parte del código; las tarifas
continúan sin aplicar y requieren las decisiones de su documento.
Recibir `origin/main` mediante los pasos siguientes, conservando trabajo propio.
El estado de producción del 12/10 es evidencia previa: esta reconciliación no
reconsulta Render ni Supabase. Git y recepción en Windows son verificaciones
distintas. El ZIP del 10/10 queda como histórico de lectura, anterior a esta entrega.

Localizar el repositorio real: en un portátil se documentó
`C:\Users\laral\Documents\Aluminior`; en otro,
`C:\Users\sergi\Desktop\Aplicaciones\Aluminior`. Son antecedentes, no rutas universales.
Desde la raíz correcta, en PowerShell:

```powershell
git status --short --branch
git remote -v
git fetch origin
git log -5 --oneline origin/main
git rev-list --left-right --count HEAD...origin/main
```

Si hay cambios o commits propios, conservarlos. No usar reset, clean ni stash
automáticos. Crear un checkout aislado desde el remoto; elegir un nombre/ruta
libres si ya existen:

```powershell
git worktree add -b codex/continuidad-windows ..\Aluminior-continuidad-windows origin/main
Set-Location ..\Aluminior-continuidad-windows
git status --short --branch
git rev-parse HEAD
```

En una copia limpia de `main` sin commits propios pendientes puede usarse
`git pull --ff-only`. Si no admite avance rápido, conservar la copia y usar
el checkout aislado. La reconciliación del Mac ya está integrada; no aplicar propuestas de tarifas para ponerse al día.

Leer AGENTS, estado, roadmap y esta guía antes de abrir Productor. Para recibir
July, usar su herramienta `july_sync` con acción `pull`, revisar el resultado
y buscar los items por **proyecto + sync_uid + título**, no por ID numérico:

| Seguimiento | Identidad estable | IDs observados, solo orientativos |
|---|---|---|
| Relevo general Aluminior | `aluminior` / `598335364cc40675dda76c8260f4d37d` | Mac 171; Windows de Javi 212 |
| E1/G1: recuperar ensayo tras incidencia de variante | `aluminior` / `398049fbd618069e36bb84bab37913ed` | Mac 192; Windows del ensayo 180 |

El **180 del Mac trata descuentos de mano de obra**, no E1. Comprobar título
y contenido antes de editar. La actualización July de este relevo es local:
sin publicación cifrada del emisor, un `pull` no traerá esta revisión del 10/10.
El fallback de comandos depende de la instalación local de July; su ficha y
skill tienen prioridad sobre rutas antiguas del relevo.

## 2. Preparar Productor y las fuentes privadas

Usar la instalación Windows autorizada con su mochila USB/licencia válida.
No instalar ni registrar COM/OCX por instrucciones de informes históricos.
Si falta la licencia, continuar con manual, configuración y copias autorizadas;
no intentar saltar la protección. La observación no exige instalar Aluminior
localmente: puede compararse con la [web publicada](https://aluminior.onrender.com/dashboard/presupuestos).

Confirmar la carpeta y el selector de empresa antes de cualquier acción:

| Empresa | Uso autorizado documentado |
|---|---|
| `EMP0016` / `[0016]` | Ejercicio 2026 del titular; documentos y catálogo solo consulta |
| `EMP0017` / `[0017]` | **PRUEBAS ALUMINIOR - 2026 [0017]**; casos nuevos de ensayo |
| `EMP0015` y anteriores | Ejercicios previos; solo consulta |

Sergio escribió EMP00016/EMP00017 en el prompt; la copia Mac contiene
`Productor/Aluminio/EMP0016`. Buscar la carpeta real y verificar el selector;
no renombrar ni crear empresas por esa diferencia. La copia Mac inspeccionada
no contiene EMP0017: hay que localizar la empresa de pruebas en Windows.

Para investigar 0016, usar una copia verificada de `Anterior.mdb`, nunca su
`aluminio.mdb` activa. Para 0017, coordinar con el operador una copia estable
del estado de pruebas; conservar SHA-256 antes/después de leer, tamaño, fecha,
empresa, versión y procedencia. Un hash diferente identifica otro corpus.

```powershell
Get-FileHash -LiteralPath '<ruta privada de la copia estable>' -Algorithm SHA256
```

No copiar una base abierta mientras se escribe. No renombrar una MDB activa
para eludir el control de un lector. El lector del banco solo admite la copia
de referencia; el lector específico de E1 admite estados de prueba conforme
a su contrato. No instalar otro driver por defecto: comprobar primero los
lectores existentes y el entorno que ya funcionó.

Recuperar por un canal privado las copias F y G2–G6-incidencia, capturas,
`observacion.json` y auxiliares de `output/e1-despunte/`, si se va a continuar E1.
La evidencia fecha hashes y límites en
[EVIDENCIA-E1-DESPUNTE](paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md).
**Git y July no transportan esas fuentes, la sesión de Productor ni sus ventanas.**
Si faltan, registrar cuáles; no reconstruirlas desde importes de un resumen.

## 3. Orden de trabajo en Windows

### P.2: aceptación comercial del PDF con el titular

La paginación, los dibujos y los decimales ya están corregidos. Abrir el PDF
de un presupuesto de prueba existente y contrastar con Productor y el titular:
cabecera, cliente opcional/nombre/obra, descripción, dibujo del GRUPO, medidas,
cantidad, precio, fabricación/colocación, avisos, neto/IVA/total, pie y saltos
de página. Revisar una y varias páginas. No emitir una factura ni recalcular
documentos reales para hacer esta comprobación.

Registrar campos aceptados, discrepancias concretas y decisión del titular.
Un PDF que abre correctamente no acredita precio ni fabricación. Si las
entradas o tarifas difieren, separar formato de comparación económica.
El pendiente P.2 sigue abierto hasta esta aceptación; no repetir su corrección técnica.

### E1: recuperar el ensayo de despunte

Continuación ClonerSoft del 14/10: preparación física/condicional, wrappers,
layout estático de `+0x7ac`, getters y consumidor `DEScalcula` ya verificados
en su alcance; no reconstruirlos ni repetir literales. Receptores delegados de
`alBDADO`, WORD de tabla auxiliar y selector `rsTabla` también acreditados;
no repetir población de `this+0x88/+0x8c` ni enlaces `+0x34/+0x58/+0x3c`.
Las declaraciones TypeLib y cuerpos de control/reparto/totales ya están seguidos
en su alcance estático; no repetirlos. La [unidad de formato del 17/10](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#contrato-de-formato-varformat)
acredita máscaras/Variant y contrato público, sin empates/localización efectiva
observados. La [unidad posterior de configuración](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#proveedor-de-configuración-y-argumento-2)
identifica `gaConfigDAL.Carga` y el fallback condicionado del BSTR `2`; no
demuestra escalas efectivas iguales a dos. La [procedencia de carga](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#procedencia-y-precedencia-del-índice-de-configuración)
ya sigue AbreRS y la petición de índice NombreDato. La [unidad del índice](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#configuración-construcción-y-selección-del-índice)
sigue construcción/ordenación y selección de posición, sin prioridad primera/última
ni equivalencia de claves demostradas. La [continuación de claves](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves)
sigue inicialización del comparador y las dos rutas del normalizador, sin
acreditar sus valores efectivos. La [unidad de fila y delegados](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#clave-de-fila-y-transformaciones-del-índice)
atribuye cuerpo propio de `x_Clave` y proveedor/slots de transformación.
Los [predicados internos de rellena](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#predicados-internos-de-rellena)
ya tienen condiciones y efecto en ramas acreditados estáticamente. La [frontera WCTMB](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#frontera-widechartomultibyte)
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
No repetir escrituras de las dos celdas, contrato/enlace ni predicados;
después equivalencia, valores efectivos, agregados y persistencia.
No repetir `x_Clave`/proveedor/delegados ya seguidos, inicializador/normalizador,
`xConfig`, construcción/búsqueda,
AbreRS/carga de lista, proveedor/argumento `2` ni unidades anteriores.
El selector independiente de registros de tarifa dinámica ya está implementado
y verificado localmente; no activar precios a partir de esa selección.
Los pasos de observación siguientes son una vía separada y conservan la
autorización pendiente de G6; este lote no autoriza ejecutar el original.

Leer [PASO-E1-DESPUNTE](paridad/PASO-E1-DESPUNTE.md) y su evidencia del 04/10.
A–F, G1–G5 y el margen GID que explica los dos céntimos ya están demostrados.
El último intento de variante 1207×1150 dio error de opciones/SessionFactory
y añadió un tercer GRUPO. No hubo recálculo posterior ni G7 válido.

1. Observar la ventana y el documento actuales, cotejar los dos GRUPO válidos
   y el tercero de la incidencia con la copia conservada. No reutilizar
   coordenadas/handles de otra conversación.
2. La petición de limpiar documentación **no autoriza eliminar esa línea**.
   Si no hay autorización humana posterior, solicitarla concretando documento
   de pruebas y tercer GRUPO; las dos líneas válidas se conservan. Mientras
   tanto pueden revisarse las fuentes en lectura.
3. Tras recuperar las dos líneas, comprobar con el operador cómo editar la
   segunda sin darla de alta de nuevo. Si el diseñador vuelve vacío, detener
   esa edición y registrar la incidencia. «Cerramiento» puede persistir un
   GRUPO vacío antes de Grabar; cancelar no demuestra ausencia de escritura.
4. Elegir una variante que discrimine las políticas de precisión; 1207×1150
   era una candidata estimada, no un resultado. Verificar opciones y bases
   reales antes de fijar predicciones; variar un único factor.
5. Mismos parámetros del G4 válido, recalcular una vez, conservar copia
   estable y contraste de coste/reparto, guardar y reabrir. Si las políticas
   predicen lo mismo, documentar «no discriminante» y mantener E1 abierto.

No modificar PVP, márgenes, catálogo ni instalación para arreglar el error.
No incorporar una política al motor web sin evidencia discriminante y pruebas.

### E7: contrastar fracciones después de A4

El soporte web decimal ya está publicado mediante 0030. E7 es la observación
comparada que falta: C2 970×439,5 y 970×1999,5, con serie, acabado, vidrio,
geometría/uniones y cantidad fijados por fuentes reales compatibles.
No completar esos datos por intuición.

Registrar entrada/reparto que origina la fracción, medida económica, cortes,
dibujo, guardado y reapertura en Productor; repetir la misma configuración en
Aluminior. Separar formato decimal de precisión del cálculo. El ensayo A4
970.25×439.5/1999.5 sin serie acredita persistencia web, no esta receta ni su precio.

### Después: E2–E6 y catálogo que falte

Seguir los [ensayos mínimos](paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md)
y el orden del roadmap: uniones materiales de otra serie, comisión y redondeo,
tapajuntas, compacto y acristalamiento. Preparar entradas desde diagnósticos
privados; no repetir observaciones ya resueltas.

Para ventanas, uniones y vidrios, partir de la
[matriz existente](paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md) y los
[97 pares medidos](paridad/COBERTURA-MODELO-SERIE-2026-10-03.md).
Ya hay catálogo visual y motor cargados; falta demostrar cobertura completa.
Inventariar solo la brecha, separando **catálogo, dibujo, receta y precio**:
estructura/serie, manos/apertura, dimensiones/cotas, unión con código/serie/
grosor/acabado, vidrio/espesor/tabla de acristalamiento/junquillos/juntas,
opciones de herraje, PVP/unidad/tarifa/fecha, MO y mínimos/múltiplos.
Para cada ausencia dejar fuente, caso reproducible y estado: no disponible,
incompleto o no contrastado. Un precio ausente permanece nulo.

No ejecutar el importador completo `importar.ts`, ni cargas/migraciones
remotas, ni corregir tarifas para obtener un total histórico. Las 58 cercanas
por PVP posterior no tienen historia recuperable; se conserva el denominador
523 y las 434 exclusiones del banco. Catálogo y tarifas nuevas necesitan alcance
propio y aceptación del titular.

## 4. Formato de entrega de cada ensayo

Guardar en una carpeta privada fechada de `output/`: entradas exactas,
capturas, despiece, estados antes/después, copia estable y manifiesto de hashes.
La ficha debe registrar versión/empresa, tarifa, medidas/cotas, cantidad,
acabados, vidrio, opciones, horas, descuentos/comisión/despunte y secuencia
de teclado. Despiece: artículo, función, cantidad, corte, unidad/metraje,
coste/PVP/importe. Reconciliar línea y documento, neto e IVA por separado.

En Git dejar una síntesis anonimizada con procedencia, hipótesis/predicciones,
resultado, límites y próximo ensayo. Comparar pasos, campos, foco/atajos,
estados, totales y overflow entre ambos sistemas. Para la web: escritorio
1440/1280 y móvil 390/375/320 según alcance; zoom 200 % y reduced motion
cuando se evalúe P.6/P.7. No trasladar importes/clientes/capturas comerciales a Git.

Actualizar la fila existente del roadmap, el puntero del estado, el
procedimiento y el item July correcto. **Evidencia lista** no equivale a
implementado ni verificado. Una corrección de motor necesita prueba sintética
de la causa, tests/tipos y nuevo banco local sin perder igualdades/exclusiones.

## 5. Si se necesita desarrollo local en Windows

Para observar Productor y comparar la web publicada no hace falta instalar
Node/Docker. Para desarrollar o verificar Aluminior: Node 22 como la CI
(mínimo contractual 20.9), npm 10.9.8, Git y Docker con contenedores Linux.
Los comandos siguientes son los del repositorio, traducidos a PowerShell;
**no se han ejecutado en Windows en esta revisión del Mac**.

```powershell
npx --yes --package=npm@10.9.8 npm ci
docker compose -f packages/db/docker-compose.yml up -d
docker compose -f packages/db/docker-compose.yml ps
npm run test:ci
npm run check:architecture
npm run -w @aluminior/web build
npm run typecheck
npm run typecheck:e2e
npx playwright install chromium
npm run test:e2e
```

Revisar el código de salida de **cada** comando y detener la secuencia si falla.
El compose usa `127.0.0.1:55433`, PostgreSQL 16, bootstrap de auth sintético y
base ETL separada. Datos efímeros: detener/recrear pierde su contenido.
No fijar TEST_DATABASE_URL a una base única ni apuntar pruebas a Supabase.
No compilar mientras Playwright/Next dev usa el mismo `.next`.
[Aislamiento de pruebas](../packages/db/README.md) · [harness](../e2e/README.md).

Para abrir desarrollo manual, preparar `.env` **solo si no existe** desde
`.env.example`, revisar que DATABASE_URL sea local y preparar el catálogo
de pruebas elegido antes de `npm run dev:web`. Una base vacía no contiene los
precios del taller. No copiar credenciales del Mac dentro del paquete.

## 6. Punteros de continuación

No repetir M0, A1, S1, A2, paginación técnica P.2, A3/0029, A4/0030, A5 ni S3.
La aceptación comercial P.2 y la observación E7 permanecen abiertas.
P.6/P.7 es el siguiente tramo técnico independiente; no se implementa en esta entrega.
S2 conserva el seguimiento anunciado para el 14/10: consultar advisory oficial
y versiones entonces; el enlace no pudo revalidarse en esta auditoría.
No hay automatización creada para S2.

Accesos a plataformas: leer primero `context/access/aluminior.md` en July.
El esquema hasta 0030 está acreditado por la entrega del 09/10, no reconsultado
en esta revisión. La deuda de hashes antiguos y la restauración completa del
respaldo siguen fuera de esa acreditación; no reescribir migraciones aplicadas.

## Prompt para la siguiente conversación en Windows

> Retoma Aluminior desde docs/CONTINUAR-EN-WINDOWS.md, AGENTS.md,
> docs/ESTADO-ACTUAL.md y ROADMAP-PARIDAD-PRODUCTOR.md. Comprueba git y July;
> conserva cambios propios y usa un checkout limpio desde origin/main si hace falta.
> A3/A4 y S3 ya están entregados; no repetir migraciones ni publicación.
> Primero verifica la recepción y disponibilidad de las fuentes privadas. Para
> trabajar con el titular, realiza la aceptación comercial P.2. Para continuar
> el motor, retoma E1 desde G6-incidencia, con A–F y G1–G5 conservados y precisión
> aún no discriminada. No borres el tercer GRUPO sin autorización humana concreta;
> comprueba edición segura antes de otro cálculo. E7 requiere contraste Productor
> tras A4; no reimplementar el soporte decimal. Trabaja en PRUEBAS ALUMINIOR [0017],
> conserva 0016/0015 en consulta y evita cargas/migraciones/despliegues remotos.
> Entrega evidencia de un ensayo, actualiza los documentos y el item July existente
> por identidad y deja el siguiente paso exacto con sus límites.
