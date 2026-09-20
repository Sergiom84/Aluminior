# Evidencia: pestañas del editor de línea

> Revisión documental 20/09/2026: **Evidencia fechada**. CHM, captura y vídeo con límites; implementación posterior no cambia la observación.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Fecha: 19 de septiembre de 2026. Fase 1 de `HANDOFF-GROK.md` §7.2. Sin
observación en vivo (la hace otro agente en la empresa 0017 y la volcará en
`RECON-CERRAMIENTOS.md`). Sin escritura en Supabase ni migraciones.

## Fuentes

| Clave | Fuente | Nota |
|---|---|---|
| CHM | `investigacion_productor_aluminio/kit_tecnico/ManualUsr/Aluminio.chm` | No estaba extraído en el repo; se extrajo con 7-Zip a un directorio temporal fuera del repo. **Las imágenes de 5.3.1.3.x no vienen en el CHM** (sólo el texto); las de 5.1.2.12.x y 5.1.2.13.x sí. |
| REC | `RECON-DETALLE-PRESUPUESTO.md` (18/09, empresa 0016, solo consulta) | Controles literales de las cuatro pestañas. |
| VID | `EVIDENCIA-VIDEO-PRESUPUESTO.md` §3–4 (vídeo de Javi) | Compacto, guías, mosquitera, tubo/ángulo. |
| CSV | `export_datos/EMP0016/*.csv` (ignorado por git) | Sólo recuentos y formas de configuración; no se copian filas de documentos ni de clientes. |

Páginas CHM usadas: `5_3_1_3_2_estructuras_de_disen.htm` (5.3.1.3.2),
`5_3_1_3_2_1_opciones_de_herraj.htm`, `5_3_1_3_2_2_cargos_adicionales.htm`,
`5_3_1_3_2_3_mas_datos.htm`, `5_3_1_3_2_4_acrist_.htm`,
`5_1_2_12_7_7_2_opciones_de_her.htm` (+ capturas `5.1.2.12.7.7.2-004/-006/-010/-012/-013/-014/-015`),
`5_1_2_12_5_tablas_de_acristala.htm` (+ `5.1.2.12.5-010.png`),
`5_1_2_12_5_1_tabla_manual.htm`, `5_1_2_12_5_4_lista_de_junquill.htm`,
`5_1_2_13_1_compactos.htm`, `5_1_2_13_1_1_alturas_cajon.htm` (+ `5.1.2.13.1-005.png`),
`5_1_2_13_1_2_accionamiento.htm`, `5_1_2_13_2_guias_de_persiana.htm`,
`5_1_2_13_5_tapajuntas.htm`, `5_1_2_13_11_mosquiteras.htm`,
`5_1_2_13_11_1_mosquitera_ya_fa.htm`, `5_1_2_13_9_barrotes_de_tubo.htm` y
`5_1_2_13_10_angulos_anadidos.htm` (ambas «EN CONSTRUCCIÓN»).

## Contraste con la observación en vivo (fase 2)

Fuentes nuevas: `RECON-CERRAMIENTOS.md` (19/09, empresa 0017, §5 y §7 bis) y
una **copia** de `EMP0017\aluminio.mdb` leída en solo lectura (Jet 4.0,
`Mode=Read`) y borrada al terminar. Sólo configuración de catálogo.

| Hipótesis de la fase 1 | Estado | Evidencia |
|---|---|---|
| Incompatibilidad sólo por la fórmula propia (simétrica en la configuración) | **Confirmada**: 1 CREMONA frente a 4 CERRADURA, en rojo y sin poder marcarla, en ambos sentidos | RECON §5 `Opc.Herraje` |
| Descripciones de `ACC` y `TIR` | **Resuelta**: `ACC ACCESORIOS`, `TIR TIRADORES`; la descripción es por conjunto (`CER` = `CERRADURAS` o `CIERRES`) | RECON §5; MDB `ConjuntosCatOH` (2.058 filas) |
| Qué categorías son excluyentes | **Resuelta para la 0017**: ninguna (`OpcExcluyentesSN` falso en las 2.058 de `ConjuntosCatOH` y las 421 de `ConfigSeriesCatOH`) | MDB |
| Qué lista el desplegable `Herraje` | **Parcial**: muestra un conjunto de herraje (`HERR. ALG 65 OPTIMA (RPT) 2H.P.`); falta saber si lista todos los conjuntos de la regla | RECON §5 |
| Opciones por defecto | **Confirmada**: 1, 2 y 980 marcadas de inicio (`Selec.`) | RECON §5 |
| Una opción marcada que deja de cumplir `Activa sólo Si` | **Sigue abierta** | — |
| Prioridad de `*` sobre `+` | **Sigue abierta** (en los datos no hay ninguna fórmula con `*`) | — |
| Acristalamiento: 5 radios, la 1 por defecto, las vacías deshabilitadas | **Confirmada**: GM69..GM72 en Hojas y Fijos, la 5 vacía y deshabilitada | RECON §5; MDB `Conjuntos` de GMA65OPT |
| Fijos sin tabla en una opción | **Sigue abierta** (GMA65OPT tiene las dos en todas) | MDB |
| Columnas de `Cargos Adic.` | **Confirmadas**, con tres casillas de cabecera truncada (HIPÓTESIS: `Cargo Aparte`, `Respetar PVP`, `Es Cantidad Total`) | RECON §5 |
| Cómo suma `Total Cargos` a la línea | **Sigue abierta**: no se añadió ningún cargo | RECON §7 |
| Tramos de altura de cajón | **Resuelta**: `EstructurasAC` de COM001: 155 (1–1600), 185 (1601–2600), 200 (2601–2900); a 1200 propone 155 | RECON §5; MDB |
| Descontar cajón del hueco | **Confirmada**: ventana 1200 x 1045, compacto valorado a 1200 x 1200 | RECON §5 `Compacto` |
| Metraje del compacto | **Explicada**: COM001 es M2, múltiplos 5 x 5 cm, mínimo 1,5 -> 1,44 sube a 1,50 M2 x 74,65 = 111,98 | MDB `Articulos`; RECON §5 |
| Mano de obra del compacto | **Confirmada**: `MOCOMP` 15 min | RECON §5 `Resultado` |
| Aviso sin guías | **Confirmado** con texto literal y `Sí` / `No`; queda abierto si basta una guía | RECON §5, §6 |
| Mosquitera como línea aparte (vídeo 2020) | **Refutada**: hoy es un accesorio dentro de la línea, familia MOSQUITERAS, valorado a la medida de la ventana tras el cajón (`PSM001` 1200 x 1045, 1,25 M2 x 56,76 = 70,95) | RECON §5 `Mosquiteras` |
| Metraje de la mosquitera | **Explicado**: PSM001 M2, mínimo 1,25; 1,254 -> 1,25 (redondeo a 2 decimales; redondear hacia arriba daría 71,52) | MDB `Articulos` |
| Catálogo de mosquiteras | **Resuelto**: PSM001 ENROLLABLE (M2, mín. 1,25), PSM002 CORREDERA y PSM003 CORREDERA CON TIRADOR (M2, mín. 1), PSM004 PLISADA (UD, precio en tabla) | MDB `Articulos`, `Estructuras` familia 101 |
| `Mas Datos` | **Resuelta**: `Observaciones`, `Línea relacionada`, `Opciones`, `Auxiliares` | RECON §5 |

Siguen abiertas: el significado de los códigos de `TubAngPos`, la tabla de
guías y el catálogo de tapajuntas, registros y premarcos.

## 1. `Opc.Herraje`

**Consta**

- CHM 5.3.1.3.2.1: permite modificar el herraje predeterminado de la serie
  (p. ej. quitar manilla y pletina falleba y poner cerradura y tirador).
- CHM 5.1.2.12.7.7.2: rejilla `Selec / Opción / Descripción`. Por opción:
  `Nº Opc.` (≥ 11 para las de usuario; < 11 internas), `Descripción`,
  `Selec.` (marcada por defecto), `Descr. Auto.` (entra en la descripción
  automática vía `#OpcHerr$`), `Categoría`, `F. Opc. Activa sólo Si`,
  `F. Opc. Incompatible`, `Oculta`. Fórmulas: `oN`, `+` = O, `*` = Y,
  paréntesis. Categorías con `Opciones Excluyentes`. Las no operables se
  resaltan en rojo (capturas -010, -014).
- CHM: marcar una opción no garantiza el artículo (se aplican los filtros de
  la asociación); desmarcarla sí garantiza que no sale. Sólo se muestran
  opciones con asociación manual aplicable a la apertura/`Aplicable En`.
- REC: desplegable `Herraje`; lista `Categoría` con `*** TODAS`, `BIS
  BISAGRAS`, `CER CERRADURAS`, `PAS HOJA PASIVA`, `MAN MANILLAS`, `OPC OPCION
  HERRAJE`, `REF REFUERZOS`.
- CSV `ConjuntosOpcionesHerraje` (11.854): columnas `fOpcSoloActiva` (66 con
  valor), `fOpcIncompatible` (4.516), `CategoriaOH` (ACC, CER, BIS, MAN, TIR,
  REF, OPC, PAS), `DescrAutoSN` (837), `OcultaSN` (8.237). Las 60 fórmulas
  distintas son todas `oN(+oM)*`. `VOpcionesHerraje` (28.428) guarda
  `Conjunto, nOpcion, SelecSN` por línea.

**En Aluminior**

- db: `opciones_herraje` (sin fórmulas ni `DescrAuto`), `herraje_conjuntos`
  (medido del histórico), `lineas_opciones_herraje`.
- web: `_lib/estructuras/herraje.ts` (`opcionesHerrajeDe`,
  `resolverOpcionesHerraje`); el formulario aún no emite elección.
- core (nuevo): `estructuras/editor-linea/formula-opciones.ts` y
  `opciones-herraje.ts` — visibles, marca inicial, estado operable/motivo,
  alternar, categorías y filtro.

**Hipótesis**

- Prioridad de `*` sobre `+` sin paréntesis.
- Si una opción marcada deja de cumplir `Activa sólo Si`, el original ¿la
  desmarca? Hoy se informa marcada y no operable.
- Incompatibilidad sólo por la fórmula propia (los ejemplos del CHM y los datos
  son simétricos).
- Qué categorías son excluyentes: la tabla de categorías no está exportada.
- Qué lista el desplegable `Herraje`; descripción de `ACC` y `TIR`.

## 2. `Cargos Adic.`

**Consta**

- CHM 5.3.1.3.2.2: añadir cualquier artículo como cargo (tubos, mano de obra,
  herraje adicional). Por cargo: código, color (acabado + tonalidad),
  cantidad (sin cantidad → 0), medidas, precio cargado de la ficha para color y
  tarifa y editable, `Respetar PVP` (se mantiene al recalcular).
- REC: rejilla `Código Artículo`, `Descripción`, acabado, tono, descripción,
  `Cantidad`, `Ancho (mm)`, `Alto (mm)`, metraje, `Tipo C.`, `Precio`,
  `Total`, casillas de cálculo, `Coste Manual`, `Observaciones`; `Total
  Cargos`.
- CSV `VCargosAd` (269 cargos): `ImporteTotal = Metraje × Precio` en 269/269;
  `Metraje = Cantidad` sin medidas y `Cantidad × Largo/1000` en el único con
  largo. Todas las banderas (`RespetarPrecioSN`, `ManufacturaSN`,
  `ForzarCargoAparteSN`, `EsCantidadTotalSN`…) a falso en la muestra.
  `VPresupuestosLin.OrigenCargoAdicionalSN` existe.

**En Aluminior**

- Nada en db ni web. core (nuevo): `precios/cargos-adicionales.ts` —
  `metrajeCargo`, `valorarCargo`, `totalCargos`, `precioCargoTrasRecalculo`.

**Hipótesis**

- Metraje M2, mínimos y múltiplos en cargos (sin muestra): se devuelve
  incompleto.
- Cómo suma `Total Cargos` al precio de la línea y qué hacen `Tipo C.`,
  `Manufactura`, `Forzar cargo aparte` y `Es cantidad total`.
- Semántica de ancho/alto frente a `Largo/Ancho` del CSV.

## 3. `Acristalamiento`

**Consta**

- CHM 5.3.1.3.2.4 y 5.1.2.12.5: hasta 5 opciones por serie (pestañas 1–5),
  cada una con tabla `Hojas` y `Fijos`; la 1 es la predeterminada; el usuario
  elige otra en la edición de línea. Ejemplos: junquillo recto, curvo clip,
  curvo grapa-clip.
- REC: cinco radios con código y descripción para `Hojas` y `Fijos`.
- CSV `Conjuntos`: `TablaHojas..TablaHojas5`, `TablaFijos..TablaFijos5`
  (usadas hasta la 4; la 5 vacía; hay opciones con hojas y sin fijos).
  `TAcristalamiento` (70 tablas) da la descripción.

**En Aluminior**

- db: `conjuntos.tabla_hojas/tabla_fijos` sólo de la opción 1;
  `tacris_filas`; `lineas_acristalamiento`.
- web: `_lib/estructuras/junquillos.ts` usa la tabla de la opción 1.
- El selector «Acristalamiento: Doble / Sencillo» de `editor-linea.tsx` es la
  variante `.1/.2` de perfiles, **no** esta pestaña. Mismo nombre, otro
  concepto: hay que renombrarlo o moverlo al decidir la fase 2.
- core (nuevo): `estructuras/editor-linea/acristalamiento.ts` —
  `opcionesAcristalamiento`.

**Hipótesis**

- Qué tabla usa el original para fijos cuando la opción no la tiene.
- Si la opción elegida se persiste por línea (probable, `VPresupuestosLin`)
  y en qué columna.

## 4. Complementos del bloque `Estructura`

### Compacto, guías y cajón

**Consta**: CHM 5.3.1.3.2 (búsqueda, desplegable o escaparate; altura de
cajón automática según la altura de la estructura y la ficha; botones de
accionamiento/opcionales y de propiedades avanzadas: vuelo, acabados, guía
central). CHM 5.1.2.13.1.1: tabla `Alto Cajón / Desde / Hasta`, `Descontar
cajón a la medida de hueco` (1000×1000 → ventana 1000×845 con 155) y `Dto.
Vert. adicional`. Guías: iguales a ambos lados por defecto, distintas si se
indica. VID: 155 → 185 por encima de 1,60 m. CSV `VAccesorios` (965):
familia 100 en 840 filas, `AltoCajon` 155/185/200.

**En Aluminior**: `lineas_estructura.compacto/guia_izquierda/guia_derecha/
altura_mm`; sin UI. core (nuevo): `estructuras/editor-linea/compacto.ts` —
`alturaCajonCompacto`, `medidasConCompacto`.

**Hipótesis**: dónde está la tabla de tramos por compacto (no aparece en la
exportación revisada); accionamientos; vuelo; guía central; si el descuento
adicional aplica sin descontar cajón.

### Tapajuntas, registro, premarco, condensación

**Consta**: CHM 5.3.1.3.2 (selección por búsqueda/desplegable/escaparate y
botón para lados y opcionales) y 5.1.2.13.5 (ficha del tapajuntas: perfiles
por lado, incrementos, `Orden Edición Línea`, `Series específicas`). CSV:
familias de estructura 102 TAPAJUNTAS, 104 PREMARCOS, 105 REGISTROS, 107
CONDENSACIONES.

**En Aluminior**: columnas en `lineas_estructura`; sin UI ni reglas.
**Hipótesis**: todo el cálculo de lados y medidas (capítulo 7.9 del CHM, no
modelado).

### Mosquiteras, Ángulos y Tubos, Bandejas/Cond., Accesorios

**Consta**: CHM 5.3.1.3.2 (botón → rejilla → añadir → familia de estructuras
accesorio → estructura → color → aceptar). VID: mosquitera hereda el color de
la ventana; tubo/ángulo con posición (arriba, inferior, izquierda, derecha,
todas) y tipo de corte. CSV `FamiliasEstr`: 101 MOSQUITERAS, 106 BANDEJAS,
108 TUBOS CORTINEROS, 112 TUBOS/ÁNGULOS AÑADIDOS; `VAccesorios` con
`TubAngPos` D/S/Z/I y `TipoCorte`. CHM 5.1.2.13.9/5.1.2.13.10 «EN
CONSTRUCCIÓN».

**En Aluminior**: nada. **Hipótesis**: correspondencia de `TubAngPos` con las
posiciones del vídeo; catálogo de estructuras accesorio (no se inventa).

## 5. `Mas Datos`

CHM 5.3.1.3.2.3: observaciones para la hoja de producción. Nada en Aluminior.

## Tamaño y encaje en Aluminior

| Archivo | Líneas |
|---|---|
| `[id]/_components/editor-linea.tsx` | 148 |
| `[id]/_components/campos-alta.tsx` | 132 |
| `[id]/_components/anyadir-linea.tsx` | 173 |
| `[id]/_components/disenador-estructura.tsx` | 239 |
| `[id]/_components/editar-cerramiento.tsx` | 158 |
| `_lib/estructuras/herraje.ts` | 142 |
| `_lib/estructuras/junquillos.ts` | 181 |
| `_lib/lineas/guardar-linea.ts` | 181 |
| `_lib/lineas/esquema-linea.ts` | 128 |
| `_lib/acciones.ts` | 165 |

(Tamaños de la fase 1.)

### Estado tras la fase 2

- `editor-linea.tsx` (56) es el marco: `Código`, pestañas `Estructura /
  Opc.Herraje / Cargos Adic. / Acristalamiento` y descripción. Cada pestaña
  vive en `[id]/_components/editor-linea/`. `acciones.ts` no se ha tocado.
- `Opc.Herraje` funciona con la base actual: combo `Herraje` (conjuntos de la
  regla medida), `Categoría` y rejilla; emite `opcionHerraje`, que el alta ya
  persistía. **Limitación**: sin `activa_solo_si` / `incompatible` en la base
  ninguna opción se bloquea todavía.
- `Acristalamiento` muestra las cinco posiciones; **limitación**: sólo la
  opción 1 existe en la base, sin descripción de tabla, y no se persiste la
  elección.
- `Cargos Adic.` visible y deshabilitada: necesita `lineas_cargos`.
- Migración `0021_editor_linea` aplicada en Supabase (19/09), tablas vacías;
  mapeos de carga sin conectar: `packages/etl/src/propuestas/editor-linea.ts`.
- El selector de variante `.1/.2` de la pestaña Estructura se rotula `Cristal`
  para no chocar con la pestaña `Acristalamiento`. En `campos-alta.tsx` y
  `editar-cerramiento.tsx` sigue como `Acristalamiento`.
