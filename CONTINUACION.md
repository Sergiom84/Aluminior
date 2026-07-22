# Aluminior — Punto de continuación (2026-07-21)

Documento de arranque para retomar el proyecto sin perder tiempo buscando. Lee
esto PRIMERO; luego, solo si necesitas profundizar, ve a `PLAN.md`.

> **Actualización 2026-07-22 (T.52):** T.48 reproducido de forma independiente desde la
> nube (match limpio: `exactasCdad` 0→40 in-sample / 20-34 held-out). Recon del export
> descarta el despiece por unidad en tablas de producción (`VDespunteDetalle` = barras de
> perfil; `VConceptosMO` = MO por concepto). **El titular (Sergio) ha decidido el camino
> (b)**: buscar/adquirir una fuente con despiece por unidad física antes de aceptar el
> techo (a). Paso decisivo = leer las MDB de fabricación en **local** (la nube no llega).
> Lista de caza acotada + criterio go/no-go + fallback (a) en **`RECON-DESPIECE-UNIDAD.md`**
> (raíz). Ya NO hay que preguntar la decisión (a)/(b): está tomada.
>
> **Actualización 2026-07-22 (T.53) — la caza local está HECHA: NO-GO.** Claude Code leyó
> `EMP0016\Anterior.mdb` (ODBC 32-bit, solo lectura sobre copia). **Todas** las tablas de
> taller/fabricación/optimización/corte están **vacías** (ALUMINIOS LARA presupuesta pero
> no corre el módulo de producción en Productor). Prueba decisiva (regla 8): el oráculo de
> herraje `VOpcionesHerraje` tiene grano **por línea+opción** (`nLinEstr/Conjunto/nOpcion/
> SelecSN`), **sin columna de hoja**; el árbol `VDatosLinDetDis` sí tiene hoja pero no la
> selección de tramo — y **no hay tabla que las una por hoja**. El separador de los 51 pares
> co-reales no está persistido ni poblado ni en esquema. Confirma T.51/T.52 desde la MDB
> autoritativa. **Cae al plan (a)** (valorar solo lo recurrente, resto "sin valorar"), ahora
> defendible. Detalle en anexo **T.53** de `PLAN.md`. Decisión de activar (a) = del titular.
>
> **Actualización 2026-07-22 (T.54) — plan (a) MEDIDO: cobertura marginal.** Fase de medición
> (sin conectar nada). Criterio de calificación MEDIDO (regla 8): clases `(serie, topología)`
> cuyo 100% de líneas del oráculo resuelve EXACTO fuera de muestra (2-fold CV). Cobertura sobre
> el universo REAL (2.071 líneas estructurales / 407 presupuestos, no las 216): **0,4% de
> líneas**, **0% de presupuestos completos**, **0,26% del € histórico**. Dos cuellos apilados:
> (1) **86,5% de las líneas no tienen árbol de diseño** — verificado en la MDB viva, no es
> laguna del export; se tarifan, vía que la topología no cubre y sin precio vigente (T.32) —
> techo estructural 13,5%; (2) el residuo del recuento rompe la exactitud en casi toda clase.
> **A nivel de presupuesto, plan (a) es COSMÉTICO** (0 presupuestos mostrarían total limpio).
> No es fallo del recuento sino de la FUENTE. Guarda "todo o sin valorar" diseñada (dónde va en
> `guardaValoracion.ts` + `acciones.ts`) pero **NO implementada**: decisión de despliegue y
> umbral `minSup` = del titular, con el número delante. Detalle: anexo **T.54**, script
> `scripts/medir-cobertura-plan-a.mjs`.
>
> **Actualización 2026-07-22 (T.55) — PIVOTE al PRECIO: la máquina de tarifa reconstruye ~70%
> del € cliente.** El cuello real de la valoración es el PRECIO, no el recuento (el 86,5% del
> dinero se valora por TARIFA). Medido contra el histórico (`scripts/medir-precio-historico.mjs`,
> SOLO LECTURA): `ImporteTotal = Precio × Metraje` (100% hijas) y **el precio unitario ES
> `ArticulosPVP` tarifa 1** (exacto al céntimo en 96,1% de hijas). Cobertura reconstruida:
> **hija 90,5% del €**, ventana 73,9%, **cliente 70,5% (±1%), 76,9% (±5%)**; solo 0,3% sin
> precio candidato. El hueco restante es manual (colocación MOCOL + VARIOS = 12,3%, "sin valorar"
> por diseño, T.32), recargo por acabado (~4%, recuperable) y márgenes de ventana (~18%, por
> caracterizar). **Costura de swap YA existe y es limpia**: `acciones.ts` lee el precio de
> `articulos_pvp` por `(articulo_codigo, acabado_codigo, tarifa)`; la tarifa 2026 = filas nuevas
> con `tarifa` distinta + apuntar el presupuesto (cero cambios de lógica). Esquema que pedir al
> proveedor: `artículo, acabado, precio (por unidad del TipoMetraje del catálogo), fecha`. Detalle:
> anexo **T.55**. **T.24–T.52 (recuento topológico) NO se tira**: queda como capa de precisión
> para los productos recurrentes.
>
> **Actualización 2026-07-22 (T.56) — cargador de TARIFA (ETL) listo y probado.** Implementa el
> swap: `packages/etl/src/cargar-tarifa.ts` recibe un fichero del proveedor y lo carga en
> `articulos_pvp` como TARIFA NUEVA. Salvaguardas: escribe solo en la tarifa destino, **{1,2,3}
> protegidas** (aborta), **idempotente** (upsert por PK), **DRY-RUN por defecto** (valida + diff
> sin escribir; solo `--apply` escribe), nunca inventa precio. Invocación:
> `npm run etl:tarifa -- --file <csv> --tarifa 2026 [--apply]` (rollback: `--rollback --apply`).
> Esquema fichero: `articulo, acabado (*/UNI=genérico), precio (por unidad del TipoMetraje),
> fecha_vigencia`. Probado end-to-end con `packages/etl/ejemplos/tarifa-ejemplo-2026.csv` (20
> altas, artículo inexistente y precio fuera de rango reportados, **nada escrito** — BD sigue con
> tarifas 1/2/3). Revaloración de un presupuesto: `scripts/probar-revalorar-tarifa.mjs` (764:
> 578,65→611,99 €, in-memory). **NO se ha hecho `--apply` contra la BD compartida** (requiere visto
> bueno del titular). Detalle: anexo **T.56**.
>
> **Actualización 2026-07-22 (T.57) — tabla `tarifas` + el acabado NO recupera el 4%.** (A) Añadida
> tabla `tarifas` (migración aditiva `0014`, no toca `articulos_pvp` ni históricas): id=tarifa,
> descripcion, proveedor, fecha_vigencia, fecha_carga, activa. El cargador la upserta en el mismo
> `--apply` (procedencia+vigencia persistidas); en dry-run la reporta. Args nuevos `--descripcion`,
> `--proveedor`. Migración generada pero **NO aplicada** (pendiente `npm run db:migrate` con OK del
> titular). (B) Medido (regla 6, corrige T.55): "usar acabado exacto" YA es el baseline (recupera 0);
> el remap VS→P **empeora −10,7 pp** (coincidencia, no equivalencia); techo teórico +0,2 pp. **El ~4%
> es ajuste manual/tarifa no equivalente, no recuperable por acabado.** € a ±1% se mantiene: **90,9%
> hija / 70,5% cliente**. BD compartida intacta (`articulos_pvp` 1/2/3, sin escrituras). Anexo **T.57**.
>
> **Actualización 2026-07-22 (T.58) — el "margen de ventana" NO es una regla.** Medido (regla 1):
> el precio de la ventana = Σ(hijas×Cdad) EXACTO en el **91,8%** (sin margen); el "18%" era casi
> todo Cdad (ya resuelto en T.56). El residuo real (8,2% ventanas / 14,4% € ventana / 185.953€) NO
> es estable por serie ni familia (`FamiliasTarifas.Margen` descartado): se parte en 42 ventanas de
> precio manual (`PVPManualSN`) + 118 con un **factor uniforme por presupuesto** (real, ventanas
> distintas, regla 9 verificada; 30/30 docs) que **NO está guardado en ninguna columna**
> (DescuentoPorc/Recargo/PVPManual/PrecioVentaOriginal todos 0/false; el descuento global va sobre el
> total, aplicarlo empeora 70,5→66,5%). No reconstruible sin inventar (regla 3). **€ cliente a ±1%
> NO cambia: 70,5%.** El hueco restante es manual/ajuste-no-capturado, no fallo de la máquina PVP;
> hacia delante ese ajuste sería un input del usuario. Script `scripts/medir-margen-ventana.mjs`.
> Anexo **T.58**.
>
> **Actualización 2026-07-22 (T.59) — frente de precio CERRADO y blindado.** (1) Migración `tarifas`
> APLICADA (`npm run db:migrate`; única escritura autorizada): tabla creada, `articulos_pvp` intacta
> (1/2/3). El `--apply` de precios sigue pendiente de la tarifa 2026 real. (2) La guarda "todo o sin
> valorar" (T.54) YA estaba cableada y correcta en `acciones.ts` (array `problemas` → `precioUnitario
> = null` + aviso, nunca total parcial ni cero); no se reescribió, se **extrajo a función pura
> testeada** `packages/core/src/precios/guarda.ts` (`lineaValorable`). (3) **+21 tests (46 en verde)**:
> identidad del dinero (`ImporteTotal = precio × cantidad`), guarda, y salvaguardas del cargador
> (históricas protegidas, validación de fila, idempotencia del diff) — reglas puras extraídas a
> `core/precios/tarifa.ts` que el cargador ahora importa (dry-run reproducido idéntico, nada escrito).
> Dejado como está con criterio: `scripts/medir-*.mjs` no se movieron (diario, rutas citadas en
> anexos); `ajusteComercial` (opcional) no implementado (no pedido). Anexo **T.59**. **El frente de
> precio queda cerrado**: ~70,5% del € cliente a ±1% (límite por datos), swap listo, vigencia trazable.
>
> **Actualización 2026-07-23 (T.60) — nueva tanda + STOPGAP de seguridad.** Al medir el estado
> real de `packages/web` para el roadmap de los 4 módulos (PDF/auth/compras/producción) se
> confirmó: **cero auth** en la web (ni middleware, ni login, ni sesión) y el servicio **YA está
> vivo en Render** (`srv-d9dprl...`, público por defecto). El dashboard sirve **NIF de clientes**
> (§6.6 ENTREGA) → **exposición de datos personales en producción** (viola regla 4). Decisión del
> titular: **reordenar la tanda a AUTH como módulo #1, PDF #2** (PDF no depende de auth; auth es
> puerta de despliegue por el NIF). **Stopgap aplicado y verificado**: `packages/web/middleware.ts`
> cierra TODA la app tras HTTP Basic Auth, **falla cerrado** (sin `BASIC_AUTH_PASSWORD` → 503, nunca
> público). Probado end-to-end (401 sin/malas credenciales, 200 con buenas, `WWW-Authenticate` OK;
> typecheck limpio). **Pendiente del titular**: fijar `BASIC_AUTH_PASSWORD` en Render y desplegar
> (la web sigue expuesta hasta entonces); **rotar `RENDER_API`**. Roadmap medido T.60 y auth real
> (Supabase, claves ya en `.env`) = trabajo en curso de esta tanda.

---

## 1. Dónde está TODO

| Qué | Dónde |
|---|---|
| **Repositorio** | `C:\Users\sergi\Desktop\Aplicaciones\Aluminior` (rama `main`) |
| **Registro profundo** | `PLAN.md` — anexos A…T.32. Es el diario técnico; cada hallazgo es un anexo. |
| Estado de entrega | `ENTREGA.md` (⚠️ su §8.1 cita el predictor v4, desactualizado a v5 — corregir) |
| Decisiones de arquitectura | `ARQUITECTURA.md` |
| Reglas de trabajo | `PROMPT-FABLE.md` (reglas 1–9, vigentes) |
| **CSV del histórico (oráculo)** | `EMP0016/` (205 ficheros; ruta en `.env` como `RUTA_CSV_ORIGEN`). Fuera de git. |
| Credenciales | `.env` (raíz): `DATABASE_URL` (Supabase compartida) + `RUTA_CSV_ORIGEN` |
| Scripts de medición | `scripts/*.mjs` (`npx tsx scripts/x.mjs`) |
| Motor | `packages/core/src/despiece/` · valoración web en `packages/web/.../presupuestos/_lib/acciones.ts` |

### El sistema ORIGINAL (fuente de verdad, más que los CSV)

`C:\Users\sergi\Desktop\Productor\Aluminio\` — instalación completa de GAIA
Productor Aluminio. Contiene lo que los CSV **no** capturan:

- `InfoSeries.mdb` (375 MB) — catálogo maestro de series. **Agotado (T.38):** no tabula
  BOM/cantidades por serie (solo metadatos: `SerSeries`, `SerBibliotecas`, `SerSeriesCE`
  de marcado CE, `SerActuaciones` con notas en texto libre). No volver a abrir salvo
  nueva pregunta muy específica; su copia en Temp se borró (375 MB liberados, jul-2026).
- `ConfigDis.mdb` — config de diseño: `MOConceptos` (mano de obra), `ConfigSeriesApertDesc`
  (semántica de `AperturaTH`), `ConfigSeriesHerraje`, `DiseñoConfigV2`. **Ojo:** varias
  tablas (`ConfigSeriesAsoc`, `ConjuntosMO`) están **vacías en este catálogo global**;
  la versión poblada real vive en el **export CSV de EMP0016** (`ConfigSeriesAsoc.csv`
  1.137 filas — la fuente de fábrica de T.40/T.41/T.46/T.47), no aquí.
- `EMP00xx/aluminio.mdb` (ACTIVA, NO abrir) + `EMP00xx/Anterior.mdb` (copia estática, sí).
  **`EMP00xx` son EJERCICIOS FISCALES de la misma empresa (ALUMINIOS LARA), NO empresas
  ni usuarios distintos** — verificado en `Empresas.mdb` (tabla `Empresas`: Codigo→
  Descripcion→Ejercicio). `EMP0001`=2010 … `EMP0016`=2026 (el ejercicio en curso, por
  eso es el correcto para `RUTA_CSV_ORIGEN`). Si algún día hace falta más oráculo para
  series con `n_train` pequeño, ahí hay **15 ejercicios previos más** de la misma
  empresa a consultar (con la salvedad de que el esquema pudo variar entre años).
- `Tarifa/GM/Articulos.txt` (9,5 MB) — export de **tarifa de proveedor** (formato ancho
  fijo, sin CSV-parse directo) con coste por artículo (`TarifaConfig.ini`: `Coste=SI`).
  Es la única fuente de precios encontrada en todo `Productor`, pero **está fechada
  23/06/2022** (`FechaTarifa` en el ini) — no es del ejercicio actual, no usable como
  precio vigente sin contrastar con una versión más reciente (o con `articulos_pvp` en
  Supabase, T.32). Resto de `Productor` revisado y sin datos relevantes: `Documentos`
  (manuales/PDFs), `RPT` (plantillas Crystal Reports), `ManualUsr`, `BMP`, `Fuentes`,
  `gaCopiasDeSeguridad` (nivel superior; es la herramienta de backup en sí, no una
  copia de datos distinta).

**Cómo leer las MDB en este portátil** (memoria `leer-mdb-portatil`): ACE OLEDB
**no** está instalado; usar **PowerShell de 32 bits** + driver **ODBC de Access**.
Helper listo: `C:\Users\sergi\AppData\Local\Temp\aluminior_explore\leer-mdb.ps1`
```
"/c/Windows/SysWOW64/WindowsPowerShell/v1.0/powershell.exe" -NoProfile -ExecutionPolicy Bypass \
  -File "C:\...\leer-mdb.ps1" -Mdb "<copia.mdb>" [ -Query "SELECT TOP N ..." | -Columns "Tabla" ]
```
SIEMPRE sobre COPIA, solo lectura, NUNCA `aluminio.mdb` activa. El export CSV fue
fiel en columnas; lo que falta en CSV son tablas de config/semántica y de MO.

---

## 2. Estado actual (arco T.24–T.51)

El **frente de perfil está cerrado**; el frente vivo son los **asociados**, y su
tapón es el **recuento de cantidades**.

- **T.24–T.28** El "oscilobatiente" (42,3%) y las "correderas" (26,9%) que T.21.2
  contaba como perfil sin resolver eran **herraje** (`Articulo=0`). El perfil real
  de hoja resuelve al **100%, 0 fallos**. `BI` = barrotillo de vidrio. T.27 sacó el
  herraje del bucket de perfil en la app (código, verificado).
- **T.29** Despejado el perfil, los **asociados son el único tapón de 82/87 líneas**
  con hoja. Cerrarlos SÍ haría valorar (supera el bloqueo doble de T.20.3).
- **T.30** El recuento de la junta perimetral está **bloqueado por datos** (sin
  atribución diseño→pieza).
- **T.31** ⭐ **El tapón de la valoración es el RECUENTO, no un umbral.** El predictor
  de asociados acierta 96,4% por pieza pero **0/216 líneas exactas en cantidades**.
  Toda política de conexión da "valorada pero MAL". El error se concentra en
  **escuadras** (una por esquina) y **juntas** (infracontadas), más el mecanismo de
  conjunto del oscilobatiente.
- **T.32** La **mano de obra**: fabricación = `nº módulos × TiempoFabr × 0,5 €/min`
  (fórmula plana, la geométrica ancho/alto está muerta), **acoplada al mismo
  recuento**; colocación (68% del dinero) es **entrada manual** del usuario.
- **T.33–T.36 (el RECUENTO de escuadras, atacado a fondo)** El recuento por
  aparición de ranura del v5 infravalora las escuadras. **T.33**: la señal es física
  (×2 por esquina), cierra 63,7% en hueco simple, se rompe en multi-hueco. **T.34**:
  la cuenta de apariciones de v5 es un valor de plantilla que **no escala con la
  geometría** (raíz del fallo). **T.35**: es un multiplicador fijo por artículo, pero
  0 líneas cierran; tapón = `GM4735` (la escuadra más frecuente). **T.36** (refactor:
  extractor de la topología del árbol de la instancia): el recuento se **parte en
  dos** — (a) **escuadras de esquina** = ley `4 × elementos-con-esquina` (marco/hoja/
  travesaño del árbol), robusta cross-serie y single+multi para 3–4 artículos (~50% de
  las apariciones, held-out ~100%); (b) **escuadras de alineamiento** (`GM4735` &c.),
  que **no son fórmula**: las fija **(serie, topología)** al 92% out-of-sample (5/6
  series dan una constante; la ambigüedad vive en `ELEGANTPVC`). **Sigue 0/216
  valoradas**: el alineamiento aparece en casi toda línea y su valor por serie no está
  codificado. Todo verificado adversarialmente.

- **T.37–T.38 (las DOS fuentes del alineamiento, contrastadas)** **T.37** fuente (a),
  tabla aprendida del oráculo: ley de esquinas (T.36) + tabla por (serie,topología)
  para el alineamiento, held-out por línea. Titular 83,2% de líneas con TODAS las
  escuadras OK, **pero inflado por memorización**: la cifra honesta por generalización
  es **48,7%** (la ley de esquinas generaliza al 98%; la tabla de alineamiento
  MEMORIZA configs vistas y no extrapola a topología/serie nuevas). **T.38** fuente
  (b), `InfoSeries.mdb` (ODBC 32-bit sobre copia): **no** tabula el alineamiento por
  serie (es catálogo de metadatos; la BOM vive en las bibliotecas por serie = lo que
  el oráculo refleja), pero sus `notasPublicas` **corroboran** el mecanismo topológico
  y revelan que **Productor daba cuentas de escuadra MAL, corregidas a mano** → parte
  del oráculo son bugs históricos.

- **T.39 (la topología, columna vertebral común del recuento)** El extractor de
  topología transfiere a los otros componentes. **Juntas** (se cuentan en piezas): la
  topología reconstruye las dominantes —`GM4055` JUNTA PERIMETRAL HOJA `4×hoja` 100%,
  `GM5085` 100%, `GM5592` `4×marco`, acristalamiento `4×vidrio`—; held-out 86,1% pero
  generalización honesta 38,9%/línea (parte-fórmula 97%, resto memoria por serie).
  **Refina T.30** (regla 6): el bloqueo era del recuento POR PIEZA; el agregado por
  estructura sí lo da la topología. **Módulos de MO**: el total no encaja en suma
  topológica (35%) porque `MOConceptos` ata cada concepto a un `ComponenteAsoc` — es el
  MISMO recuento por-componente (confirma T.32.3). Todo verificado adversarialmente.

- **T.40 (el residuo por-serie SÍ tiene fuente de fábrica)** Atacando el residuo de
  alineamiento en `C:\Users\sergi\Desktop\Productor`: `InfoSeries.mdb` no lo tabula
  (T.38), pero **`ConfigSeriesAsoc`** sí —la 2ª declaración de asociados por
  `(serie, TipoHoja)` que S.7.4 dejó pendiente—. Vacía en el `ConfigDis` global,
  **poblada en el export de EMP0016** (`ConfigSeriesAsoc.csv`, 1.137 filas), y **v5 la
  ignora** (usa `ConjuntosAsoc`). Sus `Cantidad` reproducen las constantes del oráculo
  por serie a nivel modal (GMA60RL M:2→8, GMPC135 !:6→24/12/36, GMA65OPT M:1→4;
  ELEGANTPVC no encaja). Pero un predictor mecánico ingenuo **falla (1,4%)**: las filas
  no son aditivas (el configurador selecciona por opción/TipoHoja/estructura) y el
  filtro `nOpcion` no cuadra con `VOpcionesHerraje`. **Fuente localizada y parcialmente
  validada; mecanismo de combinación SIN resolver.** Generalizaría (no memoriza), a
  diferencia de la tabla de T.37 — pero no funciona aún.
- **T.41 (INGENIERÍA INVERSA del configurador — el residuo pasa de memoria a fórmula)**
  Reverse-engineering de `ConfigSeriesAsoc`. Gating resuelto: una fila dispara si
  `nOpcion` activa + `ArticuloAsoc` (perfil) presente + `TipoHoja`; acumulativas. El bug
  de T.40 era no filtrar por `ArticuloAsoc` (filas que solo difieren en perfil son
  ALTERNATIVAS, no sumandos). **Descubrimiento: la cuenta de la escuadra de alineamiento
  es una COMBINACIÓN LINEAL ENTERA de la topología, con coeficientes POR SERIE** —
  `ELEGANTPVC·GM4735 = 4·marco + 8·hoja` (98,3%, real 4/12/20/28/36 con hoja 0→4, no
  constante), `GMA60RL = 8·marco`, `GMPC135ME = 4·hueco + 4·trav` (corredera)—. Y
  **GENERALIZA a topologías nuevas** (16/17 en 4 series), a diferencia de la memoria de
  T.37. Verificado y con cifras recortadas: evidencia sólida en 3 (serie,art)
  (`ELEGANTPVC`+`GMA65OPT`×2); el 94,1% global inflado (test 50% ELEGANTPVC). El
  residuo del recuento **deja de ser memorizable y pasa a ser fórmula geométrica**.
- **T.42 (derivar coeficiente ← fila: gating afinado, derivación parcial)** Intento de
  derivar `(a,b,c,d)` directamente de `ConfigSeriesAsoc`. Positivo (regla 6): el filtro
  `nOpcion` de T.41 era **incorrecto** (GMA65OPT declara nOp=11 pero las líneas tienen
  activas 13/980 y la escuadra se cuenta igual → `nOpcion` NO se filtra; gating correcto
  = `ArticuloAsoc` + `TipoHoja`). Negativo honesto: el predictor directo
  `Cdad×F×elemento` reproduce algunas series (GMA350 96%, GMA60RL 50%) pero **falla
  ELEGANTPVC (0%)** por un `4·marco` base sin fila y la combinación comp 58+59.
  **Derivación PARCIAL**; el modelo lineal aprendido de T.41 sigue siendo el que
  funciona.
- **T.43–T.46 (modo arquitecto+trabajadores; los residuos y la derivación, cerrados)**
  Tres ejecutores en segundo plano, cada uno verificado independientemente por el
  arquitecto. **T.43**: el residuo de acristalamiento de las juntas se cuenta por
  `4·marco + 4·trav` (NO por vidrio; GM4057 100% en ELEGANTPVC+GMA350, generaliza) —
  cierra el residuo de T.39.1. **T.44**: el felpudo de corredera (`GM4971`) es NO
  topológico (topología idéntica → real 1/2/4; depende de carril/lado) — límite de T.30.
  **T.45**: los módulos de MO por CONCEPTO son lineales sobre topología (mayormente
  triviales porque marco=1 siempre; la señal real es AJUNQUILLADO = `1·vidrio` /
  `1·marco+1·trav`); refina T.39.2 (16/20 conceptos con `ComponenteAsoc` vacío → la clave
  es el código del concepto). **T.46 (cierra T.42)**: las dos piezas de la derivación de
  escuadra se cierran — el `4·marco` base viene de `ConjuntosAsoc` (filas nOpcion-vacío
  58/59, condicional, no universal) y el factor es `×2` uniforme (el "×4" era base+opción
  sumadas); `nOpcion` NO es gate. Regla medida reproduce el oráculo (ELEGANTPVC 98,3%,
  GMA65OPT/GMA60RL 100%). Queda fuera el comp `!` (corredera, mecanismo distinto).
- **T.47 (el comp `!` de escuadras)** El comp `!` es una familia de wildcards
  `AsociadoA` (HOJAS RODAMIENTO Cdad6, ESCUADRAS ABATIBLES Cdad1, FIJOS, MARCOS CARRIL),
  en ambas tablas, sin gate de `nOpcion`. Regla: `count = Cdad × conteo_topológico(cat)`,
  SIN `×2`. **La corredera se cuenta por HUECOS (carriles), no hojas** (el árbol colapsa
  cada hoja-corredera a 1 Tipo3 por carril): `GMPC135ME·GM4735` real=12=`6·hueco` (2/2),
  deriva de fábrica el coef que T.41 fiteaba con n_train=2. **NO cierra** ESCUADRAS
  ABATIBLES (oscilobatiente): emisión en bloques de 4, `GMA65OHS` constante 20 con hu2/hu4
  → residuo NO topológico (tipo T.44). Verificado.
- **T.48 ⭐ (la composición por línea CRUZA el 0/216)** Primer intento de componer todos
  los componentes por línea: se mete el recuento topológico de escuadras (T.46/T.47) y
  juntas (T.39/T.43) dentro del predictor v5, dejando herraje/MO como v5. **`exactasCdad`
  pasa de 0 (T.31) a 40/72 techo in-sample y ~20/34 held-out** (generaliza). Primer cambio
  de la sesión que despega del 0. Verificado art-a-art (ELEGANTPVC|2O cierra). Honesto: el
  modo estructural-puro cierra 0 (los cierres vienen de los modelos aprendidos que
  generalizan); sinergia escuadra+junta. Bloqueante restante: escuadra residual 24,
  herraje 10, junta 3. Near-miss 0→25 (20 escuadra, 5 herraje).
- **T.49 (el herraje del oscilobatiente es residuo de TRAMO)** El "error de conjunto" de
  GM53xx es casi todo error de tramo (112 swap + 28 overlap; FP puro neto solo 4). Ningún
  gate ignorado por v5; el overlap es estructural (222 familias con rangos solapados). Es
  el residuo de S.9.1 (el discriminante de tramo no está en el árbol). Techo: 72 exactas →
  152 si se resolviera el tramo. Verificado.
- **T.50–T.51 (los frentes restantes son BLOQUEO POR DATOS, no de modelo)** **T.50**: el
  modelo lineal-por-serie NO cierra la escuadra residual —cazado por verificación
  adversarial del arquitecto: el `+9` held-out era suerte del split (multi-salt +6,2
  [2..9]) y ~94% memoria (generalización real ~+0,4)—. La escuadra de esquina ya la cerraba
  T.36; el residuo `GM4710` es NO topológico (confirma T.36: "una tabla, no una ecuación").
  **T.51**: el discriminante de tramo del oscilobatiente **corrige S.9.1** (la colisión
  "810→dos tramos" era mezclar familias: cremona nOpcion=2 vs cerradero acumulativo
  nOpcion vacío; acotando la familia la medida resuelve 23/23). El residuo es un tramo
  fantasma sub-intervalo: dirección limpia (contenedor gana 18/18) pero **indeployable** —
  51 pares co-reales que ningún dato oracle-observable separa; el discriminante es la
  asignación por unidad física, que el oráculo (agregados por artículo) no expone.
  **Bloqueo por datos.**

**Convergencia:** valorar una línea, la MO de fabricación y las cantidades de
asociados **desembocan todas en el RECUENTO**, y tras T.33–T.40 el recuento tiene
**una columna vertebral común: la topología del árbol `EstructurasDiseño`**. Los tres
componentes (escuadras, juntas, módulos de MO) se cuentan por elementos del árbol
(esquina/lado/módulo por hoja/marco/hueco/vidrio) con la MISMA forma: una parte-fórmula
que generaliza (`4 × conteo`) + un residuo por-serie que se memoriza (alineamiento,
felpudos, conceptos de MO de corredera) y NO tiene catálogo de fábrica (T.38). El
recuento pasó de "tapón sin modelo" (T.31) a "algoritmo topológico común con residuo
acotado y caracterizado". Sigue **0/216 valoradas** (T.20.3): el residuo por-serie
aparece en casi toda línea.

---

## 3. Qué hacer, en orden

1. **EL RECUENTO (crux).** Los tres componentes están **medidos y unificados** por la
   topología del árbol (T.33–T.39): escuadras (`scripts/medir-escuadras-topologia.mjs`,
   `-modelo.mjs`), juntas (`scripts/medir-juntas-topologia.mjs`), módulos de MO
   (`scripts/medir-mo-topologia.mjs`). Patrón común: `4 × conteo` generaliza para lo
   dominante; el **residuo por-serie** (alineamiento, felpudos, MO de corredera) se
   memoriza y no tiene catálogo de fábrica (T.38). Lo que queda del crux, en honesto:
   ese residuo por-serie **solo se cierra con más oráculo por serie** (no hay ecuación
   ni catálogo). Y es donde entra la **decisión del titular** (§3, abajo): si valorar
   solo series/estructuras recurrentes (donde el recuento ya reconstruye bien) es
   aceptable. **Lead vivo (T.40):** el residuo SÍ tiene fuente de fábrica que
   generalizaría —`ConfigSeriesAsoc.csv`, que v5 ignora—; falta **ingeniería inversa
   del mecanismo de combinación** de sus filas (selección vs suma; gating real de
   `nOpcion`/`TipoHoja`/estructura; factor de esquina por rol) y el caso duro
   `ELEGANTPVC`. **RESUELTO en T.41:** el gating es (nOpcion + ArticuloAsoc perfil +
   TipoHoja, acumulativo) y la cuenta es una **fórmula lineal-entera por serie sobre la
   topología** (`a·marco+b·hoja+c·hueco+d·trav`), que generaliza. El siguiente paso del
   crux está en gran parte MEDIDO: derivación de escuadra (comp 58/59) cerrada (T.46), el
   comp `!` de corredera cerrado (T.47, por huecos), juntas de acristalamiento (T.43),
   módulos de MO por concepto (T.45). Lo que queda del recuento, en honesto: **(1a)**
   varios residuos son **NO topológicos** —oscilobatiente/ESCUADRAS ABATIBLES (bloques de
   4, T.47), felpudo (carril/lado, T.44)—: el árbol no expone su dimensión (nº de
   hardware oscilo, carriles/mm); requieren otra fuente o quedan "sin valorar" honesto;
   **(1b)** validar el `×marco` para estructuras multi-marco (todo el export tiene
   marco=1); **(1c)** la composición por línea YA cruzó el 0/216 (T.48: ~20 held-out); los
   frentes accionables que quedan, por las 25 near-miss: la **escuadra residual de esquina
   multi-hueco/travesaño** (20 líneas — el `4×conteo` no cierra al 100% ahí) y el herraje
   (5). **(1d) El techo de la valoración lo fija el residuo de TRAMO de S.9.1** (T.49): el
   discriminante que elige el tramo exacto de compás/cremona/tirante NO está en el árbol
   (222 familias con rangos solapados); resolverlo llevaría el conjunto-exacto de 72 a 152.
   Es el frente más profundo y **T.51 lo cerró como BLOQUEO POR DATOS**: el discriminante
   de tramo es la asignación medida→tramo POR UNIDAD FÍSICA, y el oráculo solo expone
   agregados por artículo/línea. Igual el residuo `GM4710` (T.50, no topológico). **El
   límite ha pasado de modelo a FUENTE:** subir de ~20 líneas exactas requeriría un export
   con despiece por unidad (otra MDB o un volcado por hoja), no un modelo mejor.
   **(1e) Lo accionable con el export actual está en gran parte agotado**; el siguiente
   paso real es la **decisión del titular** (§ abajo) o adquirir esa fuente. Scripts de
   partida: `medir-topo-sustituido.mjs` (composición), `cazar-discriminante-tramo.mjs`
   (tramo), `medir-escuadra-lineal-serie.mjs` (escuadra residual), y los de cada
   componente. Rozan S.1–S.9 y T.33–T.51.
2. **MO de colocación (construible ya).** Modelar `HorasColoc`/`HorasAdFabr` como
   **campos de entrada del usuario** valorados a 0,5 €/min (68%+9% del dinero de MO).
   No desbloquea una línea por sí solo, pero es un componente real del total.
3. **Cabos menores:** cerrar `ConjuntosMO` (mapeo módulo→concepto en `InfoSeries.mdb`);
   goma GM4090 en `GMA350` (S.9.7); barrotillo `BI` no emitido (T.28); limpiar
   `ENTREGA.md` §8.1 (v4→v5).

**NO tocar (bloqueado por datos o vía muerta):** atribución de la junta (T.30), los
24 tramos de cremona (S.9.1), bisagra `GM4846` (falla la forma del modelo),
`AperturaTH` como regla (14 filas; su semántica sí está en `ConfigSeriesApertDesc`),
fórmula geométrica de MO (0 filas).

**Decisión del TITULAR (no la toma la IA):** conectar el predictor de asociados a la
valoración. Hoy es **prematura**: con 0/216 exactas no hay umbral que dé líneas
correctas (T.31). Se replantea cuando el recuento avance.

---

## 4. Reglas de trabajo (de `PROMPT-FABLE.md`, resumidas)

1. Mide toda hipótesis contra el oráculo antes de construir. 2. Ejecuta lo que
escribes (compilar ≠ funcionar). 3. Nunca inventes un valor; si falta, "sin
valorar", no cero. 4. Cero datos personales en el repo: barre NIF/emails/móviles
antes de cada commit. 6. Corrige los errores explícitamente en `PLAN.md`. 7. Di lo
que no sabes y para. 8. Desconfía de todo emparejamiento que inventes tú; enlaza por
`VDatosLinDetDis` exacto, nunca por proximidad de medida.

**Entorno:** BD Supabase compartida **solo lectura**; NUNCA `npm run etl`; MDB
originales solo lectura sobre copia. Commits pequeños a `main`, cada paso un anexo
`T.33+` en `PLAN.md`.

---

## 5. Orquestación autónoma (arquitecto + trabajadores)

Para avanzar sin intervención humana: la conversación principal actúa de
**arquitecto** (sostiene el hilo de `PLAN.md`, verifica y commitea) y delega el
trabajo pesado a **subagentes trabajadores** (miden/corrigen en su propio contexto y
reportan destilado). Patrón probado en la sesión T.24–T.32.

Hay un workflow listo: `.claude/workflows/aluminior-autonomo.js` — invócalo con la
herramienta Workflow (o deja que el arquitecto lance subagentes con la herramienta
Agent). El arquitecto SIEMPRE verifica el resultado del trabajador antes de
commitear, y **para y reporta** (no decide) en los puntos marcados "decisión del
titular" o "bloqueado por datos".

**Paraleliza por hipótesis, no marches en secuencia.** Cuando un frente es UN
problema duro (como el RECUENTO), no lo trates como una sola tarea encadenada:
descomponlo en 2–4 **hipótesis/ángulos independientes** y lanza un trabajador por
hipótesis **en paralelo** (p.ej. para el recuento: geometría de línea, topología de
esquinas del árbol `EstructurasDiseño`, y config en `ConfigDis.mdb`). Luego el
arquitecto sintetiza cuál cierra. El workflow ya lo hace si `hipotesis` viene con ≥2
elementos; si lanzas subagentes a mano, aplica el mismo criterio. El paralelismo
secuencial (T.33→T.34) fue correcto porque cada paso dependía del anterior, pero
cuando hay varios ángulos que NO dependen entre sí, pruébalos a la vez.
