# Aluminior — traspaso para una conversación nueva

Actualizado: 4 de agosto de 2026.

Este es el punto de entrada vigente. Leer después `AGENTS.md`,
`ARQUITECTURA.md` y `PARIDAD-PRODUCTOR.md`. `PLAN.md` y `ENTREGA.md` contienen
el registro histórico profundo, pero algunas secciones antiguas fueron
superadas por las decisiones resumidas aquí.

## 0. Estado del repositorio, primero

- Rama `main` con **11 commits locales por delante de `origin/main`**, que sigue
  en `01a0613`. **Nada se ha empujado.** Los cinco últimos son la descomposición
  T.69 de `acciones.ts`: `7e53cb4` herraje (T.69.1), `3a8a092` cierre del pool de
  migraciones, `92a1b50` coste del despiece (T.69.2), `ee62703` coste del
  acristalamiento (T.69.3) y el de resolución de perfiles (T.69.4).
- **La migración `0018_pale_hulk` sólo existe en local y se ha aplicado
  únicamente al Postgres efímero de Docker. NO está en el Supabase remoto.**
  Aplicarla allí es una decisión pendiente, con alcance explícito y prueba
  reversible (§6 de `SPEC-MANO-DE-OBRA.md`). Orden de despliegue: **migración
  primero, código después**; el código lo comprueba antes de insertar.
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
| T.69.4 resolución de perfiles | este | `resolucion-perfiles.ts`, `componentes-disenyo.ts` |

**T.69.4, la mayor.** Saca la resolución genérico → perfil real (anexo J):
lectura de delegaciones, expansión de la cadena de conjuntos, construcción de
resoluciones, detección de artículos genéricos por descripción `(**%`,
aplicación de variante de acristalamiento, y el reparto de lo que no se resuelve
entre perfil y asociado. Devuelve un resultado explícito
—`plantillaResuelta`, `genericos`, `sinResolver`, `sinResolverAsoc`,
`variantesAplicadas`— en vez de mutar variables sueltas dentro de un `map`.
`COMPONENTE_CRISTAL` y `COMPONENTES_HERRAJE` pasan a `componentes-disenyo.ts`,
que son datos con su evidencia y los necesitan dos frentes.

**Pruebas: 335 en total** (129 `core`, 47 `db`, 9 `etl`, 150 `web`). Typecheck de
los cuatro workspaces limpio.

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

### Ahora — desbloquear T.68 con el titular

Tres preguntas enviadas a Javi, **sin respuesta al 4 de agosto de 2026**. No
conviene anticipar ninguna: cada una cambia el modelo de datos o la
presentación. La descomposición T.69 avanzó en paralelo justamente porque no
depende de ellas.

1. **¿Se aplica descuento de línea a la mano de obra?** En el original es línea
   hija con su propio `DescuentoPorc`. No medido.
2. **¿La mano de obra se muestra desglosada al cliente o embebida en el importe
   del `GRUPO`?** El vídeo mostró una sola línea agregada, pero eso no zanja qué
   debe imprimirse.
3. **¿Puede existir mano de obra independiente de una línea?** Hay 167 líneas
   `MO` sin estructura asociada (`nEstr = 0`, 15.115,8 minutos, 7.557,90 €) cuyo
   origen está sin medir. Si la respuesta es que sí, `linea_id` deja de poder ser
   obligatoria y eso es una migración.

### Ahora — deuda que toca antes de la siguiente función

`acciones.ts` está en **860 líneas** y sigue siendo **deuda prioritaria**: T.68 lo
dejó de hacer crecer y T.69 le quitó 261 líneas en cuatro extracciones, pero
continúa por encima del límite de 400.

**Siguiente unidad recomendada: separar el vidrio y los junquillos**, que es lo
que queda de la ruta de dinero dentro de la acción (anexos L, M, N, Q). Ahí hay
geometría —emparejamiento del cristal con su alojamiento, galces, medidas de
módulo— y aritmética de importes, así que exige **caracterización previa**: fijar
con pruebas lo que hace hoy, incluida la aritmética en `number`, antes de mover
nada. Es la misma secuencia que funcionó en T.69.1–T.69.4, y la única forma de
que la extracción sea revisable de una pieza.

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
- **Preguntado a Javi, sin respuesta:** descuento de línea sobre la mano de obra;
  desglose al cliente frente a importe embebido en el `GRUPO`; y si la mano de
  obra puede existir independiente de una línea (las 167 líneas `MO` sin
  estructura asociada). Ver «Ahora — desbloquear T.68 con el titular».
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
> a punta. T.69 descompuso `acciones.ts` de 1.121 a 860 líneas en cuatro
> extracciones bajo `_lib/estructuras/`, con 335 pruebas y cinco comportamientos
> conservados y declarados en §6 ter que no deben cambiarse de refilón. No
> apliques la 0018 en remoto sin alcance explícito, no metas `parseFloat` ni
> `Number()` en el camino de horas, y sigue reduciendo `acciones.ts`: la
> siguiente unidad es separar vidrio y junquillos, caracterizando antes de mover.
> `FABRICACION_BASE` y la edición de líneas guardadas siguen fuera; tres
> preguntas al titular están sin responder y no deben anticiparse. `main` queda
> 11 commits por delante de `origin/main` (`01a0613`), sin push, y `design-qa.md`
> es ajeno a esta unidad.
