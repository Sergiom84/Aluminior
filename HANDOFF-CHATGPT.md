# Aluminior — traspaso para una conversación nueva

Actualizado: 8 de agosto de 2026.

Este es el punto de entrada vigente. Leer después `AGENTS.md`,
`ARQUITECTURA.md` y `PARIDAD-PRODUCTOR.md`. `PLAN.md` y `ENTREGA.md` contienen
el registro histórico profundo, pero algunas secciones antiguas fueron
superadas por las decisiones resumidas aquí.

## 0. Estado del repositorio, primero

- Rama `main` con **29 commits locales por delante de `origin/main`**. **Nada se
  ha empujado.** Cadena reciente: T.69 (descomposición de `acciones.ts` en cinco
  extracciones), T.70.1–T.70.3.1 (valoración y emparejamiento del vidrio, y
  extracción de la consulta de galce), T.71.1–T.71.4 (identidad documental y
  numeración transaccional de presupuestos — ver §6 quater).
- **Las migraciones `0018_pale_hulk` y `0019_fixed_ken_ellis` sólo existen en
  local y sólo se han probado contra el Postgres efímero de Docker. NINGUNA de
  las dos está aplicada en el Supabase remoto.** Aplicarlas allí sigue siendo una
  decisión pendiente, con alcance explícito y prueba reversible (§6 de
  `SPEC-MANO-DE-OBRA.md` para la 0018). Orden de despliegue: **migración
  primero, código después**; el código comprueba antes de insertar/reservar.
- `acciones.ts` está en **727 líneas** (era 737 antes de T.71.4 — ver §6 quater).
- G3 (copia de presupuesto con sustitución masiva) sigue **sin consumidor
  productivo**: el módulo `_lib/copia/` existe y está probado, pero ninguna
  server action ni superficie de UI lo invoca todavía. Las sustituciones de
  detalle (`GENERAR_NUEVO`) siguen bloqueadas porque el motor de despiece vive
  en `acciones.ts` y el módulo de copia no lo alcanza.
- El árbol contiene además `design-qa.md` sin versionar, ajeno a esta unidad.

## 1. Objetivo y criterio de producto

Aluminior reconstruye en TypeScript/Next.js el flujo de trabajo autorizado de
Productor Aluminio para ALUMINIOS LARA SLU.

- Productor es la referencia funcional, de vocabulario e interacción.
- El ejecutable no se integra como dependencia ni se automatiza desde la web.
- No se elude la mochila HASP/UniKey ni se copian código o recursos propietarios.
- La estética es moderna; no se replica el acabado Windows XP.
- El configurador de cerramientos es el núcleo del producto. El presupuesto es
  el documento que recibe su resultado como una única línea agregada.

## 2. Evidencia analizada

Se revisaron la instalación autorizada en
`C:\Users\sergi\Desktop\Productor\Aluminio`, ejecutables, manual CHM, informes,
configuración, copias de datos, vídeo del operador y capturas de Productor.

El vídeo confirmó el flujo real:

1. Nuevo presupuesto con cliente opcional, nombre libre y obra.
2. Entrada inmediata al diseñador.
3. Encadenado de ventanas, fijos y uniones.
4. Serie, vidrio, acabado y medidas por elemento.
5. Ajustes manuales de fabricación y colocación.
6. Retorno como una sola línea `GRUPO`, seguido de PDF.

La aplicación original no pudo ejecutarse sin sus componentes/licencia. Esto no
bloquea el desarrollo: la reconstrucción usa observación, datos y comparaciones
controladas. Los COM/OCX antiguos sólo deben probarse en VM y nunca registrarse
en el equipo principal sin un plan de reversión.

## 3. Cambios de producto e interfaz realizados

- Se abandonó el dashboard web genérico como referencia visual.
- Presupuestos, navegación y superficies se acercaron a la densidad y jerarquía
  operativa de Productor con un acabado contemporáneo.
- Se actualizaron `README.md`, `AGENTS.md`, `CLAUDE.md`, `ARQUITECTURA.md` y
  `PARIDAD-PRODUCTOR.md` para fijar esta dirección.
- La creación de presupuesto admite cliente, potencial o nombre libre.
- El selector de cliente busca por prefijo de código o por varios fragmentos
  parciales del nombre en cualquier orden. Por ejemplo, `ser her la` puede
  encontrar `Sergio Hernández Lara`, persistiendo siempre el código canónico.

## 4. Diseñador de cerramientos implementado

El primer diseñador funcional vive en:

- `packages/core/src/estructuras/diseno.ts`
- `packages/core/src/estructuras/diseno.test.ts`
- `packages/web/app/dashboard/presupuestos/[id]/_components/disenador-estructura.tsx`
- `packages/web/app/dashboard/presupuestos/[id]/_components/anyadir-linea.tsx`

Incluye:

- modelo versionado de módulos y uniones;
- composición anidada de marco, hueco, hoja, vidrio y travesaño;
- plantillas verificadas: fijos, oscilobatientes y varias combinaciones;
- alta y eliminación de módulos a la derecha;
- edición individual de ancho y alto;
- cálculo del ancho total incluyendo el grosor de las uniones;
- uniones verificadas `GMU038` y `PSU001`, con longitud y grosor;
- selección global inicial de serie, vidrio, acristalamiento y acabado;
- ajustes manuales separados de fabricación y colocación;
- representación visual original basada en el vocabulario observado, sin copiar
  los renders propietarios de Productor.

Todavía no incluye el editor interno completo de un hueco: travesaños añadidos
interactivamente, barrotillos, venecianas, paneles, mallorquinas y curvas siguen
pendientes hasta disponer de evidencia suficiente.

## 5. Persistencia y Supabase

Se añadió la tabla satélite `lineas_cerramiento` mediante:

- `packages/db/src/schema/lineas.ts`
- `packages/db/migrations/0017_mean_skrulls.sql`
- `packages/db/migrations/meta/0017_snapshot.json`

Guarda la configuración JSON versionada, serie, vidrio, acabado, variante de
acristalamiento y los ajustes manuales. La migración está aplicada en el
proyecto Supabase remoto. RLS está activo y no hay políticas de acceso directo
desde el cliente; la escritura se realiza en servidor.

El cerramiento se persiste en `lineas` como tipo `CERRAMIENTO`, código `GRUPO`,
una descripción agregada, medidas y precio nulo mientras no exista valoración
completa. La regla sigue siendo «todo o sin valorar»: nunca se presenta un cero
ni un total parcial como si fuese correcto.

## 6. Verificación real realizada

Se guardó desde la interfaz un caso reversible con:

- dos módulos `2O`;
- unión `PSU001`, longitud 1020 mm y grosor 100 mm;
- serie `ELEGANTPVC`;
- vidrio `V420AGS4`;
- acabado `L`;
- fabricación 25 euros y colocación 40 euros.

La fila y su JSON se comprobaron directamente en PostgreSQL. La interfaz mostró
una sola línea `CERRAMIENTO SEGÚN DIBUJO · 2O + 2O`, 2500 × 1200, explícitamente
sin valorar. Después se eliminó la prueba y se confirmó `0` líneas residuales y
`0` filas en `lineas_cerramiento`.

Se corrigió además un fallo de estado: tras guardar, el formulario nativo se
reiniciaba pero el dibujo conservaba la composición anterior. Ahora el aviso de
valoración pendiente representa un guardado correcto y formulario y diseñador
vuelven juntos a un módulo `2O` limpio.

Desde el 2 de agosto de 2026 esta verificación es repetible y no depende de un
script manual:

- `_lib/cerramientos/alta-cerramiento.test.ts`: sin base de datos. Descripción,
  medidas, ausencia de precio, rechazo de composición manipulada, escritura por
  el cliente recibido conservando todos los campos, y propagación del fallo.
- `_lib/lineas/persistencia.integracion.test.ts`: contra el Postgres efímero en
  Docker. Ejecuta `guardarLinea`, el mismo servicio que usa `anyadirLinea`; no
  reproduce la transacción por su cuenta. Comprueba el guardado reversible del
  caso `2O + 2O` y tres fallos intermedios reales: dos filas del mismo concepto
  de mano de obra que violan su índice único, cantidad de despiece fuera de rango
  en una ESTRUCTURA, y el cuadre entre cabecera y líneas.
- `_lib/mano-obra/mano-obra.integracion.test.ts` (T.68): catálogo real, cero, una
  y dos filas, tarifa sin PVP, y rollback con la primera fila de mano de obra ya
  escrita. Las migraciones las aplica `pruebas/migrar.ts` una sola vez.

```
docker compose -f packages/db/docker-compose.yml up -d
npm test
```

### Si Docker Desktop no arranca: clúster nativo en 55433 (4/8/2026)

Docker Desktop dejó de arrancar en el portátil con un fallo del **Inference
manager** (Docker Model Runner) al recrear su socket en
`%LOCALAPPDATA%\Docker\run\dockerInference`. No es un problema del motor de
contenedores ni de las pruebas, pero deja toda la integración sin ejecutar.

Vía alternativa verificada, sin instalar nada: la máquina tiene PostgreSQL 16.14
completo en `C:\Program Files\PostgreSQL\16\bin`. Se levanta un clúster PROPIO en
`%TEMP%\aluminior_pg_test\data` con `initdb -U aluminior`, `-E UTF8 --locale=C`,
`port = 55433` y `listen_addresses = 'localhost'`, y se crean `aluminior_test` y
`aluminior_etl_test` (esta última con `packages/db/test-auth-bootstrap.sql`).

Como el puerto y las credenciales son los del compose, **los defaults del
proyecto ya sirven: no hay que definir `TEST_DATABASE_URL`**. Definirla en el
entorno es contraproducente —`packages/etl` la respeta y acabaría corriendo su
`DROP TABLE articulos` contra la base migrada, donde falla por dependencias—.

Dos diferencias con el contenedor, que conviene saber: los datos **persisten**
entre arranques (el compose usa `tmpfs`), así que una corrida limpia exige borrar
y recrear; y vive en `%TEMP%`, que una limpieza de disco de Windows puede barrer.
Se revierte por completo parando el clúster y borrando esa carpeta: no se
registró servicio ni se tocó la instalación existente.

**Aviso de seguridad detectado de paso:** el servicio `postgresql-x64-16` de la
máquina escucha en el puerto **5434 con `listen_addresses = '*'`**, es decir
expuesto a la red local y no sólo a loopback. No se ha tocado ni identificado su
contenido; conviene revisar si esa exposición es intencionada. Por si fuese la
base de trabajo con datos reales, NO se usó para pruebas: `packages/db/README.md`
lo prohíbe, y por eso se creó un clúster aparte.

Nota menor: `psql` del PATH está roto (`~/.local/bin/psql.cmd` apunta a una
instalación 17/18 que ya no tiene binarios). Usar la ruta de la 16. El comentario
de `docker-compose.yml` y del README que dice que el 5432 lo ocupa el Postgres
nativo está desactualizado: hoy el nativo está en 5434 y el 5432 está libre.

La prueba valida su destino antes de conectar: sólo Postgres local y base
terminada en `_test`. Apuntar `TEST_DATABASE_URL` a Supabase aborta con un error
explícito, así que la separación no depende de recordarla.

El rollback se validó por mutación **del código de producción**: sustituyendo
`db.transaction` por escrituras sueltas en `guardarLinea`, las tres pruebas de
fallo intermedio fallan (una línea huérfana de cerramiento, otra de estructura,
y la cabecera descuadrada en 1000). Restaurada la transacción, pasan.

- al cerrar T.68: 129 pruebas en `core`, 47 en `db`, 9 en `etl` y 70 en `web`;
- typecheck de todos los workspaces superado;
- build de producción de Next.js superado;
- `git diff --check` sin errores;
- servidor local en `http://localhost:3000`.

## 6 bis. T.68 — contrato decimal y esquema de mano de obra (3/8/2026)

Completada. Es la primera mitad de la fase «Ahora» de `SPEC-MANO-DE-OBRA.md`.

**Qué resuelve.** Medido en T.67.1: lo que el operador teclea en «ajuste de
fabricación» y «colocación» no son euros, son **horas**, y Productor las valora
en minutos con `minutos = horas × 60` sin redondear a entero. Los dos campos en
euros de `lineas_cerramiento` quedan obsoletos, no borrados (migración
sustractiva posterior). Hay 0 filas reales que convertir.

**Aritmética decimal exacta**, `packages/core/src/precios/decimal.ts`. `numeric`
es decimal exacto y Drizzle lo devuelve como cadena; `Math.round(v * 100) / 100`
convierte `1,005` en `1,00`. Todo va con enteros escalados `bigint`, escalas que
se suman al multiplicar y **un único redondeo final a la mitad hacia afuera**,
igual que `ROUND(numeric, n)`.

La frontera es estricta: el tipo público es `Decimal = string` y **ninguna
función acepta `number`**, ni siquiera para convertirlo; tampoco notación
exponencial. `MINUTOS_POR_HORA` es `'60'`, texto. El rechazo se comprueba en
ejecución además de en los tipos. **Consecuencia para la fase siguiente: el
formulario debe conservar el texto que valida y entregarlo tal cual. Un
`parseFloat` en la capa de entrada anula toda la garantía.**

**Valoración pura**, `packages/core/src/precios/mano-obra.ts`. Venta y coste son
independientes: un coste ausente, ambiguo, negativo o desbordado no toca
`valoracion_completa`. El valor defectuoso del catálogo **se conserva siempre**,
con un código estable que dice por qué no hay importe: `SIN_PVP`, `PVP_CERO`,
`PVP_NEGATIVO`, `IMPORTE_FUERA_RANGO`; y para el coste `SIN_COSTE`,
`COSTE_AMBIGUO`, `COSTE_NEGATIVO`, `COSTE_FUERA_RANGO`. Ningún valor absurdo del
catálogo llega a PostgreSQL como excepción: da un documento sin valorar con su
motivo, no una pantalla rota.

**Esquema**, `packages/db/src/schema/mano-obra.ts` y migración
`0018_pale_hulk.sql`. Tabla `lineas_mano_obra`, aditiva, FK a `lineas` con
`ON DELETE CASCADE`, `UNIQUE (linea_id, concepto)`, RLS activo sin políticas de
cliente. Cada código exige exactamente el precio o el coste que le corresponde,
para que la evidencia no se pueda falsear desde la aplicación.

Dos cosas que conviene saber antes de tocarlo:

- Los `CHECK` de rango relajados usan **`IS NOT DISTINCT FROM`, no `=`**. Con el
  motivo a `NULL`, `motivo = 'X'` evalúa a `NULL`, y un `CHECK` que da `NULL` se
  cumple. Escrito con `=`, dejaba pasar un coste por minuto negativo sin código
  que lo declarara. Fue un fallo real, encontrado por mutación.
- `mano_obra_precio_check` es **lógicamente redundante** y se conserva a
  sabiendas, por simetría con el de coste, que sí es necesario. Eliminarlo no
  rompe ninguna prueba y eso está declarado, no presentado como cobertura.

**Verificación.** 106 pruebas en `core`, 47 de integración en `db` contra el
Postgres efímero, 9 en `etl`, 33 en `web`; typecheck y build de producción;
`git diff --check` limpio. Cada prueba de rechazo exige el **nombre exacto** de
la restricción. Mutación ejecutada eliminando los nueve `CHECK` implicados uno a
uno: ocho producen un fallo atribuible a su prueba; el noveno es el redundante
ya citado.

Nota operativa: la base efímera conserva las tablas entre ejecuciones y las
migraciones usan `CREATE TABLE IF NOT EXISTS`. Al regenerar una migración no
aplicada hay que resetear el contenedor, o se prueba contra el esquema viejo:

```
docker exec aluminior_pg_test psql -U aluminior -d aluminior_test \
  -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public; DROP SCHEMA IF EXISTS drizzle CASCADE;'
```

### T.68, segunda mitad: completada

El flujo funciona de punta a punta para `FABRICACION_ADICIONAL` y `COLOCACION`.

**Formulario en horas.** `ajusteFabricacion`/`ajusteColocacion` (euros) pasan a
`horasFabricacion`/`horasColocacion`, dos decimales, tope técnico `9.999,99 h`,
errores accesibles por el cableado `aria-invalid`/`aria-describedby` que ya
existía. Cero es válido y significa «no hay mano de obra adicional»: no genera
fila.

**El esquema devuelve el TEXTO validado, no un `number`.** `decimalTecleado` ya
no hace `.transform(Number)`, y el rango se compara con `compararDecimal`, no
con `Number(texto) > maximo`: convertir para comparar reintroducía la coma
flotante justo en la frontera que se quería proteger. `cantidad` conserva su
`.transform(Number)` porque su aritmética aguas abajo sigue siendo flotante y
quedaba fuera de alcance. **Si alguien añade un `parseFloat` o un `Number()` en
la capa de entrada de horas, la garantía decimal se cae entera**; hay una prueba
que compara el resultado exacto contra el que daba la aritmética anterior.

**Módulo `_lib/mano-obra/`**, cinco piezas pequeñas: `conceptos` (cuántas filas),
`catalogo` (lectura), `resolver-mano-obra` (snapshot puro), `preparar-mano-obra`
(caso de uso) y `persistir-mano-obra` (escritura). La server action sólo conoce
`prepararManoObra`, que devuelve `SIN_HORAS | MIGRACION_PENDIENTE | PREPARADA`.

**El desempate del coste es compartido y estable.** Vivía escrito a mano dentro
de `acciones.ts`; ahora es `resolverCosteCatalogo` en `core` y lo usan despiece y
mano de obra. Reglas: mandan las filas del acabado aplicado y sólo ellas —si
coinciden, resuelven; si difieren, `AMBIGUO`—; sin filas de ese acabado, el
fallback mira todas las del artículo. **Nunca la primera fila**: la clave de
`articulos_coste` es `(artículo, proveedor, acabado)` y sin `ORDER BY` PostgreSQL
no promete orden, así que el margen dependía del plan de la consulta. El
resultado se comprueba sobre todas las permutaciones de un caso de tres filas.

**Snapshots transaccionales.** `EscrituraLinea` obliga por tipos a que un
`CERRAMIENTO` lleve `manoObra`; línea, configuración y filas de mano de obra
confirman o se deshacen juntas, por `ClienteEscritura`, sin que ningún módulo
abra su propia conexión. Se guardan horas, minutos, artículo, descripción
congelada, unidad, acabado, tarifa, PVP, importe, coste, coste total y los dos
códigos de motivo. `ajuste_fabricacion` y `ajuste_colocacion` ya no se escriben:
la columna aplica su `DEFAULT 0` hasta la migración sustractiva.

**Todo o sin valorar.** `VeredictoGuarda` gana `advertencias`: los cuatro motivos
de venta tumban la línea; los cuatro de coste no la tocan pero se registran en el
aviso y en la fila.

**`globalSetup` para las migraciones de pruebas.** Cada suite de integración
migraba al arrancar y vitest paraleliza ficheros: al añadir el tercero, el DDL
simultáneo reventaba con `duplicate key ... pg_namespace_nspname_index` y la
suite perdedora se quedaba sin esquema. Con dos ficheros era una carrera latente
que salía bien por poco. Ahora `packages/web/pruebas/migrar.ts` migra una vez
antes del primer worker y las suites sólo leen y escriben. Se descartó un cerrojo
consultivo: es de sesión y el pool no garantiza que el `unlock` salga por la
misma conexión.

### Medición del cambio de coste, hecha (3/8/2026)

Sólo `SELECT` contra el catálogo de producción, sin modificar nada:

| Medida | Valor |
|---|---:|
| Filas de `articulos_coste` | 27.817 |
| Artículos distintos | 17.023 |
| Pares `(artículo, acabado)` con **varias** filas | **0** |
| ...de ellos, con costes distintos | **0** |
| Artículos con algún acabado discrepante | **0** |
| Artículos con más de un coste distinto en total | 1.181 |

**El cambio no altera ningún despiece hoy.** Como no hay ni un par
`(artículo, acabado)` repetido, quedarse con la primera fila y exigir unanimidad
dan exactamente lo mismo, y el fallback global sobre todas las filas coincide con
el que deduplicaba por acabado. Los 1.181 artículos con varios costes los tienen
en acabados DISTINTOS, que es el caso que ambas versiones resuelven igual. La
corrección es defensiva: protege de un dato que el catálogo permite y que hoy no
se da.

Mano de obra, confirmado: `MO`, `MOCOL`, `MOCOMP`, `MOPREM`, `MOTAP` y `MOVID`
tienen **una sola fila de coste**, un proveedor, acabado `UNI`, `0,5000`. El PVP
de `MO` y `MOCOL` existe sólo en acabado `UNI`, con `0,5000` en la tarifa 1 y
`0,0000` en las tarifas 2 y 3 —el caso medido que deja el documento sin valorar
con su motivo—.

### Qué NO incluye T.68

`FABRICACION_BASE`, que sigue bloqueada por el recuento de módulos (T.31), y la
edición de líneas ya guardadas. Mientras la base no exista, la línea `GRUPO`
seguirá sin precio aunque la mano de obra manual se valore bien.

## 6 ter. T.69 — descomposición de `acciones.ts` (4/8/2026)

Cuatro extracciones consecutivas, una por unidad revisable, **sin cambiar
comportamiento** salvo donde se declara. `acciones.ts` baja de **1.121 a 860
líneas**. Los módulos nuevos viven en
`packages/web/app/dashboard/presupuestos/_lib/estructuras/`, con su punto de
entrada `index.ts`, y cada uno tiene pruebas de caracterización propias.

| Unidad | Commit | Módulo |
|---|---|---|
| T.69.1 opciones de herraje | `7e53cb4` | `herraje.ts` |
| — cierre del pool de migraciones | `3a8a092` | `pruebas/migrar.ts` |
| T.69.2 coste del despiece | `92a1b50` | `coste-despiece.ts` |
| T.69.3 coste del acristalamiento | `ee62703` | `coste-articulos.ts`, `coste-acristalamiento.ts` |
| T.69.4 resolución de perfiles | `523af70` | `resolucion-perfiles.ts`, `componentes-disenyo.ts` |
| T.69.5 junquillos y juntas | este | `junquillos.ts` |

**T.69.4, la mayor.** Saca la resolución genérico → perfil real (anexo J):
lectura de delegaciones, expansión de la cadena de conjuntos, construcción de
resoluciones, detección de artículos genéricos por descripción `(**%`,
aplicación de variante de acristalamiento, y el reparto de lo que no se resuelve
entre perfil y asociado. Devuelve un resultado explícito
—`plantillaResuelta`, `genericos`, `sinResolver`, `sinResolverAsoc`,
`variantesAplicadas`— en vez de mutar variables sueltas dentro de un `map`.
`COMPONENTE_CRISTAL` y `COMPONENTES_HERRAJE` pasan a `componentes-disenyo.ts`,
que son datos con su evidencia y los necesitan dos frentes.

**T.69.5** saca junquillos y juntas (anexos M y N), que ya era una
responsabilidad cerrada: recibe cristales dimensionados y clasificados como HOJA
o FIJO, consulta la tabla de acristalamiento de la serie y devuelve las piezas
`JUNQ`, `JEXT` y `JINT` con sus avisos. Se parte en dos: `piezasDeRanura` es pura
y fija ocho comportamientos sin base de datos; el orquestador conserva las tres
reglas que viven en SQL —qué tabla corresponde al alojamiento, qué fila gana para
el grosor del vidrio y de qué tabla sale el ajuste—, que se prueban contra
PostgreSQL de verdad porque un doble de cliente sólo probaría el doble.

**Pruebas: 354 en total** (129 `core`, 47 `db`, 9 `etl`, 169 `web`). Typecheck de
los cuatro workspaces limpio.

### Omisiones silenciosas del acristalamiento, conservadas

Fijadas por prueba en T.69.5, ninguna corregida:

- un artículo nulo no genera pieza **ni aviso**: es el marcador «sin junquillos»
  (V1000) y los huecos del catálogo;
- una longitud que no sea positiva se descarta **en silencio**. Protege de un
  ajuste que se come la medida, pero la pieza desaparece del despiece y nada lo
  señala;
- si hay junquillo y falta el ajuste medido, las juntas SÍ se emiten y sólo se
  pierde el junquillo, con aviso. Un junquillo nulo no avisa.

### Comportamientos CONSERVADOS y no decididos

Los cinco estaban dentro de `acciones.ts` y ahora están escritos y fijados por
pruebas. Ninguno se corrigió: cambiar cualquiera mueve clasificaciones o
importes y necesita su propia unidad con evidencia.

- **Los avisos cuentan artículos únicos aunque el texto dice «ranuras».**
  `sinResolver` y `sinResolverAsoc` son conjuntos de `articuloCodigo`: el mismo
  genérico en cinco ranuras cuenta uno. El mensaje subestima; la línea queda sin
  valorar igual.
- **La sustitución puede afectar a un artículo real.** `genericos` gobierna sólo
  los avisos; la sustitución se intenta para todo componente con
  `componenteDisenyo`, así que un artículo ya real se sustituye si la serie
  resuelve su componente.
- **`esAsociado` distingue mayúsculas.** `inf*` y `Acc*` van a asociado; `INF` y
  `acc` caen en perfil.
- **El CRISTAL nunca lo resuelve la serie.** La salida ocurre antes de consultar
  la cadena: aunque existiera resolución para el componente `'1'`, no se
  aplicaría. Es lo que T.22 corrigió, y evita que toda línea con cristal quede
  sin valorar.
- **Un genérico sin `componenteDisenyo` entra como perfil sin resolver.** No hay
  ranura que resolver, pero termina en el mismo aviso que un perfil que la serie
  no resuelve.

## 6 quater. T.70.3–T.71.4 — galce extraído y numeración cerrada (7–8/8/2026)

**T.70.3, extracción de galce** (`d1c994b`): la consulta de galce del vidrio sale
de `acciones.ts` a `estructuras/`. **T.70.3.1** (`74a90ff`) refuerza su evidencia:
`valoracion-vidrio.integracion.test.ts` pasa de 5 a 12 pruebas contra Postgres
real (aislamiento por artículo, tarifa sin datos, fallback alfabético en PVP y
coste por separado, prioridad del comodín, `acabadoCodigo` null). Cinco
mutaciones ejecutadas y revertidas, cada una tumba exactamente 1 prueba;
`valoracion-vidrio.ts` queda sin diff.

**T.71 — identidad y numeración de presupuestos.** Cuatro unidades, la misma
frontera: `_lib/numeracion/` pasa a ser la única autoridad para reservar número
o revisión de un presupuesto, dentro de la transacción que escribe la cabecera.

- **T.71.1** (`933b7d8`): la identidad de un presupuesto es (serie, número,
  revisión). Migración **0019** (local, no aplicada en remoto) añade
  `presupuestos_identidad_uq` UNIQUE sobre las tres columnas, con preflight que
  aborta sin borrar filas si ya hubiera un duplicado (0 duplicados medidos en el
  Postgres efímero antes de generar la migración). `presupuestos_numero_idx` se
  conserva sin revisar: es un índice de lectura, no de identidad.
- **T.71.2** (`883bf2e`): serialización real. `pg_advisory_xact_lock` con claves
  parametrizadas (nunca concatenadas) serializa la asignación normal;
  `presupuestos_identidad_uq` decide ante cualquier carrera residual.
  `NUMERO_NUEVO` bloquea por ejercicio (de la fecha del documento, nunca de un
  reloj interno) y relee el `MAX` del rango anual con secuencia global;
  `REVISION_NUEVA` bloquea por (serie, número); `MANUAL` comprueba existencia
  dentro de la transacción y nunca elige otro número si está ocupado.
  `ejecutarConNumeracion` detecta `SQLSTATE 23505` por código y por el nombre de
  la restricción — nunca por texto de mensaje — y reintenta una vez sólo si la
  asignación era automática.
- **T.71.3** (`63efa59`): `npm run test` fallaba de forma intermitente porque dos
  suites de integración migraban cada una en su `beforeAll` y vitest las lanza en
  paralelo. `packages/db/vitest.config.ts` + `packages/db/pruebas/migrar.ts`
  replican el patrón de `packages/web`: `globalSetup` migra una sola vez.
  `fileParallelism: false` queda sólo en `packages/db`, porque es el único
  paquete donde una prueba quita y recrea una restricción global a mitad de
  ejecución.
- **T.71.4** (`5b31f7e`): tipo `Tx` exclusivo (no `Db | Tx`) en toda la frontera
  de numeración, con prueba de tipos `@ts-expect-error` que demuestra que
  `reservarNumeracion(db, ...)` no compila. El gancho de pausa para pruebas de
  concurrencia sale del contrato público (`EntradaNumeracion`); guarda de
  ausencia barre los ficheros reales de producción. `validarFechaDocumento`
  sustituye un `slice(0,4)` crudo: formato `YYYY-MM-DD` real, secuencia anual
  agotada da error explícito (nunca `AA+10000`). `presupuestos/crear-presupuesto.ts`
  extrae la escritura de la cabecera de `crearPresupuesto`: recibe `Db`, fecha
  explícita y datos ya validados; `acciones.ts` queda sólo en parseo, validación,
  usuario y `revalidatePath`. **`acciones.ts` pasa de 737 a 727 líneas.**

**Verificación de cierre de T.71**: 564 pruebas totales, typecheck limpio en los
cuatro workspaces, build de producción de `@aluminior/web` correcto,
`git diff --check` limpio. Las migraciones `0018` y `0019` siguen sin aplicarse
en Supabase remoto — sólo se han probado contra el Postgres efímero de Docker.

## 7. Arquitectura modular obligatoria

El usuario quiere evolucionar por módulos pequeños para que una modificación no
afecte áreas independientes. Esta regla ya está incorporada en `AGENTS.md`,
`CLAUDE.md`, `README.md` y `ARQUITECTURA.md`.

- Páginas y server actions sólo coordinan.
- Dominio puro en `packages/core`; persistencia en `packages/db`.
- Separar estado, dibujo, inspector, catálogo, validación y persistencia.
- Revisar cohesión cerca de 250 líneas; un archivo manual de más de 400 líneas
  debe dividirse o justificar la excepción.
- No trocear mecánicamente: extraer responsabilidades con interfaces y pruebas.

Deuda prioritaria: `packages/web/app/dashboard/presupuestos/_lib/acciones.ts`
está en **860 líneas** tras T.69 y todavía mezcla varios casos de uso. Antes de
añadir edición o valoración de cerramientos, extraer incrementalmente:

1. `cerramientos/validacion.ts` — hecho;
2. `cerramientos/persistir-cerramiento.ts` — hecho;
3. `cerramientos/alta-cerramiento.ts` y `cerramientos/index.ts` — hecho el 2 de
   agosto de 2026: validación, descripción, medidas y escritura del satélite
   viven fuera de la acción, que delega por el punto de entrada. La inserción
   de la línea principal es común a los tres tipos y sigue en la acción;
4. `totales.ts` con `actualizarTotales(cliente, id)` — hecho. Acepta conexión o
   transacción, y `recalcularTotales` queda como envoltorio fino;
5. acciones finas que sólo autentiquen, deleguen y revaliden — pendiente.

### Atomicidad de la escritura

Corregido el 2 de agosto de 2026 tras una revisión externa. El alta escribía la
línea, el satélite y los totales en llamadas sueltas: si fallaba la segunda, la
línea `GRUPO` quedaba guardada sin configuración, que no es un documento
incompleto sino uno corrupto —no se puede volver a dibujar, describir ni
valorar—. Ahora `anyadirLinea` y `borrarLinea` abren `db.transaction` y todo
—línea, satélite de cerramiento o de estructura, despiece, acristalamiento,
opciones de herraje y totales— confirma o se deshace junto.

`_lib/cliente-db.ts` define `ClienteEscritura` (conexión o transacción). Todo
módulo que escriba debe aceptarlo en vez de llamar a `crearDb()` por su cuenta;
hacerlo escribiría fuera de la transacción de quien lo invoca.

La transacción no se abre en la acción: vive en `_lib/lineas/guardar-linea.ts`,
único camino de escritura de una línea. La acción calcula y delega. Así la
atomicidad no depende de que quien llame se acuerde, y las pruebas ejercitan el
mismo código que producción en vez de reproducir la orquestación.

No reescribir todo el archivo de una vez.

En `packages/core` el modelo del cerramiento se separó del vocabulario visual:
`estructuras/diseno.ts` conserva plantillas y reparto geométrico, y
`estructuras/cerramiento.ts` contiene configuración, medidas, validación y la
descripción agregada `descripcionCerramiento`. Ambos se reexportan desde
`estructuras/index.ts`, por lo que ningún importador cambió.

## 8. Siguiente trabajo recomendado

### Ahora — el titular contestó dos de las tres preguntas (5/8/2026)

Recogido en `SPEC-MANO-DE-OBRA.md` §15.1. Es **testimonio de entrevista, no
medición sobre el original**: cada punto debe contrastarse contra Productor antes
de tratarlo como comportamiento verificado.

1. **Descuento de línea sobre la mano de obra.** Sigue sin respuesta útil, y el
   titular decidió **aplazarlo al final**: opera sobre importes ya calculados, así
   que se puede añadir después sin rehacer lo escrito. Lo que sí dijo: el
   descuento se decide línea a línea con un control en la propia línea, y hay un
   ajuste final del documento que puede descontar **o incrementar**. Sus dos
   descripciones se contradicen —«línea por línea» es un porcentaje propio; «si
   le aplica o no» es un sí/no sobre el descuento general— y no deben
   implementarse las dos a ciegas.
2. **Desglose al cliente: CONTESTADO.** Es opcional y elegible, porque el cliente
   puede querer el cerramiento con instalación o sólo el material. Consecuencia:
   el importe de colocación **no puede quedar disuelto en un precio agregado
   opaco** del `GRUPO`. El esquema ya lo permite —una fila por concepto con su
   importe—; lo que cambia es que el total debe componerse a partir de esas filas
   en vez de guardarse como número cerrado.
3. **Mano de obra independiente: CONTESTADO.** Existe, con una opción de vender
   con o sin ella, materializada como una línea. Cabe **sin migración** si esa
   línea es una línea de presupuesto normal con artículo `MO`/`MOCOL`; sólo la
   exigiría si colgara del documento y no de ninguna línea. Cuál de las dos es
   requiere ver la pantalla del original.

Requisito nuevo, sin especificar: **línea de artículo libre y opcional** con
descripción y precio tecleados por el operador («4 tornillos, venta 6 €»).

### Ahora — deuda que toca antes de la siguiente función

`acciones.ts` está en **740 líneas** y sigue siendo **deuda prioritaria**: T.68 lo
dejó de hacer crecer, T.69 le quitó 315 líneas en cinco extracciones y T.70 otras
68 en dos, pero continúa por encima del límite de 400.

**Unidad en curso: el bloque del vidrio** (anexos L, N, Q), que es lo que queda de
la ruta de dinero dentro de la acción. Mezclaba seis responsabilidades y se está
separando **una por una, con caracterización previa** que fija lo que hace hoy,
incluida la aritmética en `number`. Hechas:

- **T.70.1, valoración** (`estructuras/valoracion-vidrio.ts`): metraje, PVP,
  coste y pieza persistible. Era la única responsabilidad **duplicada** —las dos
  rutas repetían ambas consultas, el empujado de la pieza `VIDRIO` y el aviso de
  «sin valorar», con dos formas distintas de sumar el metraje—. Ahora ambas se
  expresan como una lista de cristales con cantidad. El importe sale **sin
  redondear**: el redondeo a céntimo sigue en el acumulador, que es donde estaba.
- **T.70.2, emparejamiento** (`estructuras/emparejamiento-vidrio.ts`): de qué
  perfil y qué cortes sale el vidrio de una estructura no mixta. Función pura
  sobre el despiece ya calculado.

Quedan dentro de `acciones.ts`: validación del artículo, clasificación de ranuras,
la ruta mixta con sus consultas de nodos y reglas de alojamiento, y la consulta de
galce. **No moverlas de golpe**: cada extracción debe ser revisable de una pieza.

Después, cerrar los puntos 4 y 5 del apartado 7: acciones finas que sólo
autentiquen, deleguen y revaliden.

### Ahora — cerramientos, en paralelo

1. Permitir abrir y editar una línea `CERRAMIENTO` ya guardada, reutilizando el
   módulo `cerramientos/` en vez de ampliar la acción.
2. Generar el dibujo estable desde la configuración persistida. La descripción
   ya se deriva de ella con `descripcionCerramiento`.
3. Continuar la descomposición de `acciones.ts` por los puntos 4 y 5 del
   apartado 7.

### Después

1. Valoración agregada por módulos, uniones, vidrio y ajustes, conservando la
   guarda «todo o sin valorar».
2. Editor interno de huecos y travesaños basado en las capturas verificadas.
3. PDF «Presupuesto con dibujos» con la línea agregada.

### Experimental

- Producción y hoja de corte automática. El eje ya está corregido como
  `A=anchoMm` y `L=altoMm`, pero la salida de fabricación todavía requiere
  revisión humana y no debe presentarse como validada.

## 9. Seguridad y límites

- No mostrar, guardar ni versionar contraseñas o claves de `.env`.
- No usar `EMP0016\aluminio.mdb` activa; investigar sólo sobre una copia como
  `EMP0016\Anterior.mdb`.
- No ejecutar migraciones remotas sin alcance explícito y prueba reversible.
  **`0018_pale_hulk` no está aplicada en remoto.**
- No mezclar datos de clientes reales con fixtures, capturas o commits.
- El árbol Git contiene cambios sin confirmar ajenos a esta unidad
  (`design-qa.md`). Revisar el diff por rutas y no descartar cambios ajenos.

### Límites abiertos, declarados

- **`FABRICACION_BASE` sigue bloqueada** por el recuento de módulos (T.31/T.32).
  Hasta cerrarlo, la valoración agregada del `GRUPO` seguirá incompleta aunque la
  mano de obra manual funcione. Admitirla costará ampliar los `CHECK` de
  `concepto` y `origen`: una migración, no un cambio de datos.
- **Reversión con datos escritos no es limpia.** Antes de que el código escriba,
  `DROP TABLE lineas_mano_obra` revierte sin pérdida. Después, pierde datos: hay
  que desplegar el código anterior, exportar y sólo entonces eliminar (§6 de la
  spec). No presentarlo como reversible sin más.
- **Tarifas 2 y 3 tienen la mano de obra a `0,0000` y `MOMOSQ` no tiene fila de
  PVP.** Decisión del titular, tomada: no se restringen tarifas; el documento
  queda sin valorar con el motivo visible y el catálogo se corrige.
- **Coste igual a PVP (`0,5000` ambos, margen cero)** puede ser deliberado o
  catálogo sin mantener. Sin responder; ahora quedará registrado documento a
  documento.
- **Contestado por Javi el 5/8/2026:** el desglose al cliente es opcional, y la
  mano de obra sí puede venderse como línea propia. **Sigue sin respuesta** si el
  descuento de línea alcanza a la mano de obra, y el titular lo aplazó al final.
  Ver «Ahora — el titular contestó dos de las tres preguntas» y
  `SPEC-MANO-DE-OBRA.md` §15.1. Es testimonio, no medición.
- **El desempate del coste del vidrio NO es el del despiece.** En el vidrio gana
  el acabado de la línea y **siempre se elige uno**; en el despiece, varios
  costes distintos dejan el coste sin resolver. La extracción T.70.1 conservó el
  del vidrio en vez de unificarlos: sólo uno puede ser correcto, pero decidirlo
  cambia costes ya persistidos y necesita su propia medición.
- **Tres asimetrías del emparejamiento del vidrio están conservadas, no
  decididas** (T.70.2): la rama de hoja filtra el corte horizontal por el perfil
  de referencia y la de cerco fijo no; el recuento cristales = hojas sólo se
  exige con hojas; y las hojas se deducen del total de montantes verticales entre
  dos. Están fijadas por pruebas, y el aviso de ambigüedad sigue siendo uno solo
  para las cinco causas.
- **El desempate del coste sólo cambia comportamiento en datos que hoy no
  existen.** Medido el 3/8/2026: cero pares `(artículo, acabado)` con varias
  filas. Si el catálogo empieza a tener varios proveedores por acabado con
  precios distintos, el despiece pasará a dejar el coste sin resolver donde antes
  elegía uno; es lo correcto, pero conviene saberlo antes de que ocurra.
- El «~79%» del anexo T.32.2 **no se ha reproducido y no debe citarse**. Lo
  demostrado con denominador explícito es el 68,4%.
- **Cinco comportamientos de la resolución de perfiles están conservados, no
  decididos** (§6 ter): los avisos cuentan artículos aunque digan «ranuras», la
  sustitución puede afectar a un artículo real, `esAsociado` distingue
  mayúsculas, el CRISTAL nunca se resuelve por serie, y un genérico sin
  componente entra como perfil sin resolver. Están fijados por pruebas: al
  cambiar cualquiera, las pruebas dirán exactamente qué se mueve.

## 10. Prompt corto para la conversación nueva

> Continúa Aluminior desde `HANDOFF-CHATGPT.md`. Lee primero `AGENTS.md`,
> `ARQUITECTURA.md`, `PARIDAD-PRODUCTOR.md` y `SPEC-MANO-DE-OBRA.md`. Conserva la
> paridad funcional con Productor y la regla «todo o sin valorar». T.68 dejó el
> contrato decimal, la valoración pura y la tabla `lineas_mano_obra` con su
> migración 0018 **sólo local** y la mano de obra adicional funcionando de punta
> a punta. T.69–T.70 descompusieron `acciones.ts` de 1.121 a 735 líneas; T.71
> (§6 quater) cerró la identidad documental (serie, número, revisión) y la
> serialización transaccional de la numeración de presupuestos, bajándolo a
> **727 líneas**. `_lib/copia/` (G3) existe y está probado pero **sin consumidor
> productivo**. No apliques la 0018 ni la 0019 en remoto sin alcance explícito,
> no metas `parseFloat` ni `Number()` en el camino de horas ni en la numeración.
> `FABRICACION_BASE` y la edición de líneas guardadas siguen fuera. El titular
> contestó el desglose y la mano de obra como línea propia (§15.1 de la spec,
> testimonio sin medir) y **aplazó el descuento al final**. `main` queda 29
> commits por delante de `origin/main`, sin push, y `design-qa.md` es ajeno a
> esta unidad.
