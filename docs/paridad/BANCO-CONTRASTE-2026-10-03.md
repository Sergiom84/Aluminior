# Banco de contraste de presupuestos — 03/10/2026

> Referencia fechada; conservar evidencia y límites. No ejecutar sus pendientes o permisos como instrucciones actuales. Consultar el [roadmap vigente](../../ROADMAP-PARIDAD-PRODUCTOR.md).

**76,48 % de las líneas elegibles salen al mismo precio efectivo que Productor: 400/523.**
En 2026: **80,65 % (400/496)**.
Se mide coincidencia numérica de la copia y del código actual, no aceptación comercial ni certificación de fabricación.


## Historial

El commit de cada fila identifica el cambio medido. Todas las iteraciones están
publicadas en `main`; cada una conserva todas las igualdades anteriores.

| Fecha | Commit | Causa atacada | Iguales | Cercanas | Distintas | Sin valorar | Errores |
|---|---|---|---:|---:|---:|---:|---:|
| 03/10/2026 | `1274389` | Base reproducida; diagnóstico inicial | 5 | 3 | 172 | 335 | 8 |
| 03/10/2026 | `363e258` | Acabado2 transmitido al núcleo | 73 | 25 | 263 | 154 | 8 |
| 03/10/2026 | `f235dfc` | Escala de cortes en snapshot GRUPO | 73 | 25 | 271 | 154 | 0 |
| 03/10/2026 | `b21abe6` | nTAcris=1 identifica la primera opción | 91 | 26 | 321 | 85 | 0 |
| 03/10/2026 | `80e5bcd` | Compacto de persiana (VAccesorios + VOpciones) | 207 | 50 | 151 | 115 | 0 |
| 03/10/2026 | `928ecda` | Horas manuales por unidad en estructuras | 272 | 59 | 77 | 115 | 0 |
| 03/10/2026 | `3af4198` | Comisión de cabecera sumada al precio de línea | 318 | 71 | 10 | 124 | 0 |
| 03/10/2026 | `4123895` | Cotas de instancia y MO asociada por categoría | 337 | 78 | 11 | 97 | 0 |
| 03/10/2026 | `c862f2e` | Mosquitera y tapajuntas de línea | 352 | 87 | 13 | 71 | 0 |
| 03/10/2026 | `1de6ba1` | Batiente central con extremos distintos | 362 | 91 | 13 | 57 | 0 |
| 03/10/2026 | `2a53fc9` | Incremento por medida aplicado al precio | 373 | 80 | 13 | 57 | 0 |
| 03/10/2026 | `e2468fa` | Vidrio y panel con el acabado principal | 377 | 80 | 9 | 57 | 0 |
| 03/10/2026 | `9792c6d` | Opciones por defecto sin selección guardada | 380 | 81 | 5 | 57 | 0 |
| 03/10/2026 | `e2b0232` | GRUPO: medidas fraccionarias, catálogo ESM y U SIN UNION | 400 | 81 | 5 | 37 | 0 |


## Iteraciones y evidencia

Diagnóstico inicial antes de modificar el motor: distintas ≤1 %: 0; >1–5 %: 31;
>5–10 %: 9; >10 %: 132. Bloqueo principal 2O: segundo acabado 79,
alternativa de acristalamiento 35, valoradas distintas 86 (total 200).
1O: segundo acabado 46, alternativa 12, vidrio/acristalamiento 1,
valoradas distintas 48 (total 107). Denominador conservado.

Acabado2: la pantalla «Elemento seleccionado» tiene «Acabado» y «Aca. Acc.»
([captura documentada](fase-3/01-evidencia-composicion.md)). La configuración
`ConjuntosAsoc.Acabado` contiene 12.103 reglas `---A`, 1.079 `---P` y 163
`UNI`: la asociación elige accesorios, perfiles o acabado literal. No se debe
sustituir ese selector por una regla ciega de familia.

Contraste técnico de la misma copia (sin precios para deducir la regla):
949 estructuras/elementos con Acabado2 distinto, incluidas las excluidas del banco;
hijas enlazadas por documento/estructura y familia por `Articulos.Codigo`.
Se omiten códigos vacíos, artículo 0 y cantidad 0; cada hija se cuenta una vez.

| Familia / unidad | Filas | Acabado principal | Acabado2 | Otro |
|---|---:|---:|---:|---:|
| 001 / ML | 12899 | 12866 | 33 | 0 |
| 001 / UD | 74 | 0 | 54 | 20 |
| 002 / ML | 11319 | 200 | 10997 | 122 |
| 002 / UD | 24832 | 18 | 24582 | 232 |
| 050 / M2 | 1615 | 134 | 1459 | 22 |
| 050 / ML | 98 | 0 | 90 | 8 |
| 054 / UD | 3822 | 6 | 3769 | 47 |
| 052 / M2 | 182 | 181 | 0 | 1 |
| 053 / M2 | 77 | 77 | 0 | 0 |
| 053 / UD | 9 | 9 | 0 | 0 |
| 057 / UD | 15 | 15 | 0 | 0 |

La evidencia confirma el segundo selector, no que toda fila de cada familia
siga siempre el mismo acabado. Las excepciones quedan visibles y las asociaciones
explícitas se conservan. El núcleo ya separaba ambos acabados para asociaciones,
vidrio, juntas, MO y estructuras estándar; la web sustituía siempre el segundo
por UNI. La corrección transmite `acabadoAccesoriosCodigo` opcional al núcleo;
si se omite, conserva UNI. Los GRUPO con segundos acabados heterogéneos siguen
bloqueados porque todavía no tienen representación por elemento.
No se modifican PVP, costes, márgenes, fórmulas ni exclusiones.

Iteración 1: 5→73 iguales, sin perder ninguna identidad anterior; 523 elegibles
y 434 exclusiones. Fixture sintética web roja antes del cambio y verde después;
core 558, db 55, ETL 40 + 1 omitida, web 667; banco 33, typecheck del monorepo
y banco, arquitectura sin infracciones. Incluye degradación sin tablas y sin
catálogo en PostgreSQL local; no es una consulta a producción.
La búsqueda local en July por seminario no devolvió el dossier; no se ha utilizado
como evidencia ni se presupone su contenido.


Iteración 2: los ocho errores de GRUPO se deben a medidas con más de dos decimales:
121 largos y 28 anchos. Contrato comprobado en `resultado-cerramiento/campos.ts`
y `validar-piezas.ts`, persistencia `packages/db/src/schema/lineas.ts` con
`numeric(10,2)`. Se normaliza únicamente la representación del corte en
`completarCostesOrigen`, usando la aritmética decimal existente; no se recalculan
metraje, venta ni coste. Un corte que redondea a cero conserva medida desconocida
y bloqueo de fabricación. Las cadenas que ya cumplen la escala permanecen intactas.
Fixture sintética roja antes, verde después; los ocho casos pasan de error a
distinto. 73 igualdades conservadas; denominador y exclusiones sin cambios.
Suite: core 558, db 55, ETL 40 + 1 omitida, web 669; typecheck y arquitectura verdes.

Contraste pieza a pieza: tres casos representativos de cada modelo, elegidos por
compacto sin diferencia de PVP, compacto con diferencia de PVP y ausencia de compacto.
El detalle íntegro y las entradas de `VAccesorios` están en el artefacto privado
`representativos-2O-1O.json`; reproducción con `investigar-representativos.mjs`
en la carpeta privada del banco. No se publican documentos, clientes ni importes individuales.

| Modelo / muestra | Artículos ausentes | Filas con PVP distinto | Hallazgo |
|---|---|---:|---|
| 2O / A | COM009, MOCOMP | 0 | VAccesorios confirma compacto; faltan sus entradas en el motor |
| 2O / B | COM009, MOCOMP | 19 | Compacto omitido y tarifa posterior: causas separadas |
| 2O / C | Ninguno | 19 | Sin compacto; investigar tarifa, no añadir piezas |
| 1O / A | COM009, MOCOMP | 0 | VAccesorios confirma compacto |
| 1O / B | COM009, MOCOMP | 11 | Compacto omitido y tarifa posterior |
| 1O / C | GM231 | 11 | VAccesorios contiene tapajuntas GMT004; no es un herraje perdido |

La diferencia entre número bruto de filas históricas y del motor incluye ceros
informativos; la tabla utiliza el comparador que los descarta. PVP posterior no
prueba por sí solo la causa completa; cada diferencia queda ligada a artículo y acabado.

Compactos: `VAccesorios` enlaza por `(VPRES,nDoc,nLinEstr)` y conserva código,
acabado, cajón, guías, vuelos y guía central. `EstructurasArticulos` contiene
`COMPVAL` con `L × (A+CVI+CVD)` para `G1O0`, dos paños para `G1O1`, y filas de
MOCOMP condicionales más una incondicional. No se puede sumar toda la plantilla.
La observación de [RECON-CERRAMIENTOS](RECON-CERRAMIENTOS.md) confirma que el
compacto conserva el alto total y el cajón reduce la ventana. El catálogo importado
no conserva `OPCformulaSelec`; falta modelar las condiciones y su selección para
reproducir la receta completa. Se mantiene pendiente: no se añaden importes aprendidos.

Observación pendiente en Windows (hipótesis, sin aplicar):

| Pantalla | Dato concreto / ensayo | Alcance actual |
|---|---|---:|
| Editar estructura → Compacto → opciones y Det.Estructura | Con COM009, activar/desactivar guía central y cambiar accionamiento; registrar opciones G1/G10, paños y minutos de MOCOMP; mantener medidas y tarifa | 283 líneas con diagnóstico de compactos/accesorios, solapadas |
| Editar estructura → selector de acristalamiento | Elegir la segunda y siguientes opciones; registrar nTAcris y tablas de hojas/fijos elegidas. No extrapolar la equivalencia demostrada de 0/1 | 0 bloqueadas en esta copia tras iteración 3; alternativas superiores sin cobertura |
| Det.Estructura → despiece, columnas Aca. y Precio; Artículos → tarifas | Comprobar acabado efectivo frente al solicitado y PVP de esa misma combinación; no restaurar precios por parecido | 101 con diferencia de PVP |
| Composición → elemento y cotas | Comprobar medidas económicas fraccionarias, modelo y unión del grupo frente al dibujo | 31 GRUPO con configuración no admitida |



Iteración 3 — representación de la selección base: las 78 líneas elegibles
bloqueadas por nTAcris llevan `1` (no aparece 2..5). Se contrasta el conjunto de
junquillos y juntas de sus hijas materiales, con función vacía, frente a las
cinco parejas `Conjuntos.TablaHojas[2..5]/TablaFijos[2..5]` y sus filas de
`TAcristalamientoLin`. Se usan códigos de pieza, no importes ni proximidad de precios.

| Serie | Solo primera pareja compatible | Primera y tercera compatibles | Sin artículo discriminante |
|---|---:|---:|---:|
| ELEGANTPVC | 41 | 0 | 0 |
| GMA60RL | 3 | 0 | 0 |
| GMA65OPT | 2 | 0 | 0 |
| GMA65OHS | 1 | 0 | 1 |
| GMA350 | 0 | 9 | 1 |
| GMC400 | 0 | 0 | 5 |
| GMPC65 | 0 | 0 | 10 |
| GMPC76R | 0 | 0 | 5 |
| TOTAL | 47 | 9 | 22 |

Las 47 coincidencias exclusivas identifican `1` como primera opción; los otros
31 casos no aportan evidencia independiente del índice y no lo contradicen.
El adaptador traduce únicamente `0` (base implícita existente) y `1` (primera
explícita) a `opcionAcristalamiento: 1`, ya admitida por el servicio web.
No implementa alternativas superiores ni cambia tablas, despiece o precios:
esta iteración corrige un bloqueo conservador del banco, no un algoritmo económico.
Artefactos privados reproducibles: `evidencia-ntacris.mjs` y `evidencia-ntacris.json`.
Pruebas sintéticas verifican equivalencia y rechazo de selecciones desconocidas.

Resultado: 73→91 iguales (+18), 78 bloqueos de entrada eliminados y 69 líneas
adicionales con precio; nueve siguen sin valorar por otras causas. No se pierde
ninguna igualdad de las iteraciones anteriores. Se mantienen 523 elegibles y
434 exclusiones. Banco: 35 pruebas; core 558, db 55, ETL 40 + 1 omitida,
web 669; typecheck del monorepo y banco, arquitectura y degradación local verdes.

Iteración 4 — compacto de persiana. Tras la iteración 3, el agregado por artículo de
las distintas/cercanas de 2O y 1O señalaba COM009 ausente en 171 y 43 líneas y MOCOMP
en 172 y 43; el resto de diferencias de esas líneas eran PVP de perfiles con
`UltimaAct` posterior al presupuesto (precio antiguo, no fórmula).

| Evidencia (EMP0016, compactos de estructuras independientes) | Resultado |
|---|---:|
| `VAccesorios` COM* con una fila hija COM del mismo código | 357 |
| Corte MV de la ventana = `Largo` de la línea | 357/357 |
| Largo de corte COM = `Largo` + `AltoCajon` (todos con `compDtoHuecoSN`) | 357/357 |
| Ancho de corte COM = `Ancho` + `VueloI` + `VueloD` | 354/357 |
| Acabados de lamas, guías y accesorios iguales al acabado del compacto | 358/358 |
| MOCOMP = 15 min (fila de plantilla sin condición) | 356/357 |
| Metraje COM: múltiplo 5 cm por lado y mínimo 1,5 m² (`Articulos`) | muestras 1,50/2,23/3,71/1,60/3,22 |

`EstructurasArticulos.OPCformulaSelec` condiciona las filas del compacto con productos
`G{grupo}O{opcion}` (434 filas en 46 estructuras accesorias, sin otra gramática);
`EstructurasOpcGrupos/Opciones` los nombran (G1 guía central, G10 accionamiento) y
`VOpciones` guarda la selección por línea: 400 COM009 con G1O0 y 398 con G10O0.
Las 203 filas COM sin hija en la estructura pertenecen a módulos de GRUPO.

Cambio: migración `0025` con `formula_seleccion` en la plantilla y su carga ETL;
módulo puro `core/despiece/linea-catalogo/compacto.ts` (filtra por selección,
exige una opción por grupo condicionante, evalúa `L` = ventana + cajón, `A`, CVI,
CVD, CAJ y CGC) y entrada opcional `compacto` en la valoración web. Sin la columna
0025 la web sigue por la vía anterior (prueba de degradación). El banco traduce
`VAccesorios`/`VOpciones`; otros accesorios de línea (tapajuntas, mosquiteras,
tubos, varios compactos o compactos en GRUPO) quedan sin representar.

Resultado: 91→207 iguales (+116), ninguna igualdad perdida; 24 distintas pasan a
cercanas. Cambio de clasificación informado aparte: 30 líneas pasan de distintas a
sin valorar porque llevan accesorios de línea sin modelo y antes se valoraban sin
ellos; elegibles (523) y exclusiones (434) sin cambios. Pruebas sintéticas del core,
web (integración y degradación) y banco; core 563, db 55, ETL 40 + 1 omitida,
web 671; typecheck del monorepo y banco, arquitectura sin infracciones.
Base local recreada con 26 migraciones y catálogo de la misma copia; la huella
anterior (25 migraciones) se conserva como `base-verificada-25-migraciones.json`.

Iteración 5 — horas manuales por unidad. Tras la iteración 4, 150 de las 201
distintas/cercanas tenían la misma suma por artículo que Productor y aun así otro
total. En las estructuras independientes con `Cdad` > 1 y horas, la copia demuestra
que Productor carga las horas en el despiece de cada unidad:

| Evidencia (117 estructuras independientes, `Cdad` > 1, `HorasAdFabr` o `HorasColoc` > 0) | Resultado |
|---|---:|
| Minutos MOCOL hijos = `HorasColoc × 60` | 117/117 |
| `ImporteTotal` = `Cdad × Precio` | 117/117 |
| `Precio` unitario = suma de hijas, MOCOL incluida | 102/117 |

El banco cobraba esas horas una vez por línea, como el cerramiento web; las
líneas de estructura de la web no tienen hoy horas manuales (el alta las ignora).
Cambio: el núcleo añade `MOCOL` por unidad (`minutosColocacion`) junto al MO de
fabricación que ya tenía; la valoración web acepta `horasFabricacion` y
`horasColocacion` por unidad (texto a dos decimales → minutos exactos) solo con
catálogo completo, y el cerramiento las excluye de sus módulos porque las cobra
por línea. El GRUPO conserva su criterio. El alta de estructuras de la UI no se
toca en esta iteración.

Resultado: 207→272 iguales (+65), ninguna igualdad perdida; elegibles y exclusiones
sin cambios. Las 15 líneas restantes del contraste (`Precio` = 0,90 × suma de
hijas sin campo de descuento informado) se dejan como hipótesis; ver pendientes.
Suite: core 563, db 55, ETL 40 + 1 omitida, web 672; banco 18; typecheck y
arquitectura sin infracciones.

Iteración 6 — comisión de cabecera. Las líneas restantes con el mismo despiece que
Productor tenían un factor constante por documento (0,85; 0,90; 1,05; 1,10; 1,20…).
`VPresupuestos.ComisionPorc` con `SumarComisionSN` lo explica: es la pestaña `Gastos`
(`Comisión`, `Sumar Comisión`) documentada en [RECON-DETALLE-PRESUPUESTO](RECON-DETALLE-PRESUPUESTO.md).

| Evidencia (líneas con despiece valorado completo) | Resultado |
|---|---:|
| Estructuras sin comisión sumada: `Precio` = suma de hijas (±1 céntimo) | 613/618 |
| Estructuras con comisión sumada: `Precio` = suma × (1 + `ComisionPorc`/100), ±1 céntimo | 96/105 |
| GRUPO con comisión sumada que siguen el mismo factor | 20/23 |
| Mismo factor aplicado también a MO y MOCOL de la línea | sí (sin él no cuadra) |

Las hijas conservan los importes base. El residuo de 1 a 4 céntimos lleva el signo de
la comisión y crece con el número de filas; ningún orden de redondeo ensayado (total,
por fila, por PVP a 2 o 4 decimales, truncado) lo reproduce: queda como hipótesis.
Cambio: `core/precios/comision.ts` (factor sobre el precio de línea, a céntimos);
`valorarEstructura` y `importesLineaCerramiento` aceptan `comisionPorc` opcional y el
cerramiento no lo propaga a sus módulos. La cabecera web no tiene aún comisión: el
banco pasa la de la copia. Los documentos con `Despunte` > 0 (importe de cabecera
repartido en las líneas, razones 1,49 y 1,86) quedan sin valorar hasta demostrar su regla.

Resultado: 272→318 iguales (+46), ninguna perdida; distintas 77→10. Cambio de
clasificación aparte: 9 líneas de documentos con despunte pasan de distintas o cercanas
a sin valorar. Elegibles y exclusiones sin cambios. Suite: core 565, db 55,
ETL 40 + 1 omitida, web 674; banco 19; typecheck y arquitectura sin infracciones.

Iteración 7 — cotas de instancia y mano de obra asociada. Las 1OFI, 2OFI, 1OPLD/I
y 1PFS se bloqueaban por «Variable FI/F/FS sin valor»: `VEstructurasVariables`
guarda la cota de cada línea (FI 92 en 2OFI, FI/FS 78 en 1OFI…) y el núcleo ya
admitía `cotas`, pero la valoración web no las transmitía. Con las cotas (medido
solo: 0 iguales más) aparecía el bloqueo siguiente, dos conceptos de MO por
componente o grupo «sin contrastar»:

| Evidencia (líneas bloqueadas solo por MO asociada) | Productor añade |
|---|---|
| Abatibles (`TipoPerf` A): 1OFI, 2OFI, 02V, 1OPPI, 1OPLD/I (24) | 10 min por travesaño TMP (00114, categoría 00001); nunca los 20 de 00010 |
| 2O+1OFI, tres travesaños TMP | 30 min |
| Corredera C2FI (`TipoPerf` C) | 20 min de 00010 (categoría 00002); nunca 00114 |

`MOConceptos.Categoria` y `MOCategorias` (00001 «VENTANAS ABATIBLES», 00002
«VENTANAS CORREDERAS», 00010 «COMUNES») con `Estructuras.TipoPerf` lo explican: la
pieza casa con ambos conceptos y se cobra el de la categoría de la estructura.
Cambio: migración `0026` con `mano_obra_conceptos.categoria` y la tabla de motor
`estructura_parametros_despiece` (TipoPerf, con RLS como 0024; no se toca
`estructuras`, que la web lee completa y rompería sin migración); ETL y lectura
tras la guarda de disponibilidad; el núcleo aplica la categoría de la estructura
o la común y descarta la otra categoría contrastada. Mallorquina (M), plegable (P)
y otras combinaciones siguen bloqueando. La valoración web acepta `cotas` de la
instancia; el cerramiento no las propaga a sus módulos.

Resultado: 318→337 iguales (+19), ninguna perdida; sin valorar 124→97. Base local
recreada con 27 migraciones; huella anterior en `base-verificada-26-migraciones.json`.
Suite: core 566, db 55, ETL 41 + 1 omitida, web 676; banco 21; typecheck y
arquitectura sin infracciones.

Iteración 8 — mosquitera y tapajuntas. Son estructuras accesorias como el compacto:
PSM001 (familia 101) tiene `PSM001` a `L × A` y una fila MO sin cantidad; GMT002/GMT004
(familia 102), un perfil por lado condicionado por G1..G4 a `A+2*ala` o `L+CAJ+2*ala`.

| Evidencia (estructuras independientes de EMP0016) | Resultado |
|---|---|
| Mosquitera: corte = `Largo` × `Ancho` de la ventana, acabado del registro | 5/5 líneas revisadas |
| Tapajuntas sin compacto: lados = `Ancho`+2·ala y `Largo`+2·ala | 8/8 líneas revisadas |
| Tapajuntas con compacto: lados verticales = `Largo` + `AltoCajon` + 2·ala | 1/1 |
| `DtoHueco*` del tapajuntas (3) y `compDtoTap*` del compacto (3) | no cambian cortes observados |

Cambio: el módulo del núcleo generaliza el compacto a accesorios de línea
(`despiezarAccesoriosVentana`: ventana y `CAJ` del compacto de la línea); la
valoración web acepta `accesorios`; el banco traduce como máximo un compacto, una
mosquitera y un tapajuntas por línea. Tubos (112), accesorios repetidos y guías
siguen sin representar.

Resultado: 337→352 iguales (+15), ninguna perdida; sin valorar 97→71.
Suite: core 567, db 55, ETL 41 + 1 omitida, web 676; banco 21; typecheck y
arquitectura sin infracciones.

Iteración 9 — batiente central con extremos distintos. 3HO ELEGANTPVC (13 líneas) y
2O+1OFI (1) bloqueaban en «división de hueco con grupos B»: las hojas del par, a
`(REF−600)/2`, tienen extremos TMG y MV. Productor corta las cuatro horizontales
iguales: con A = 2380, 2300, 1950 y 2100, 858,6 / 818,6 / 643,6 / 718,6 mm, es decir,
`F(REF) − (dto(TMG 22) + dto(MV 35))/2 − dto(B 5,8)/2`. Con extremos iguales la
expresión es la regla ya contrastada (`dto(extremo) + dto(B)/2`), así que se
generaliza en `cortes-referenciados.ts` sin cambiar los casos anteriores.

Resultado: 352→362 iguales (+10), ninguna perdida; las 3HO restantes solo difieren
por PVP con `UltimaAct` posterior. Suite verde; typecheck y arquitectura sin infracciones.

Iteración 10 — incremento por medida. Varias cercanas diferían 2–5 céntimos en
vidrios con `ArticulosIncrPrecio`. En las filas M2 con incremento de la copia,
Productor deja el metraje y sube el precio a céntimos: 82/84 filas (importe =
precio × metraje en 82/82) y ninguna con el metraje incrementado. Ejemplo:
VL44I16AL44GS 215,33 + 40 % = 301,46 × 6,05 m2 = 1823,83 (el motor daba
215,33 × 8,47 = 1823,85). `importeFila` devuelve el precio efectivo y la partida
web lo usa. Se contrastó también el redondeo binario de Access: el épsilon actual
acierta 77 400 de 77 484 filas frente a 77 363 sin él; emular el `REAL` añadiría
29 filas en toda la copia y no se adopta sin decisión.

Resultado: 362→373 iguales (+11), ninguna perdida. Suite verde; typecheck y
arquitectura sin infracciones.

Iteración 11 — acabado del vidrio. El panel PAN16, elegido como vidrio de la línea,
se cobraba con el acabado de accesorios (UNI, 144 €/m2) y Productor usa el principal
(L, 63 €/m2). En las filas de vidrio de la copia con Acabado2 distinto: cuando el
artículo tiene precio en el acabado principal, Productor lo usa (PAN16 118/118);
cuando no, cae al genérico (vidrios solo UNI). Ninguna fila contradice «principal
con genérico de reserva» y las 118 refutan «acabado de accesorios», la suposición
de la iteración 1 para el vidrio; se corrigen `vidrios.ts` y sus dos pruebas.

Resultado: 373→377 iguales (+4), ninguna perdida; distintas 13→9. Suite verde;
typecheck y arquitectura sin infracciones.

Iteración 12 — opciones de herraje sin selección guardada. A los módulos de GRUPO
les faltaban herrajes (GM5302–GM5311, GM1161…) que Productor sí despieza. 1137 de los
1169 elementos de GRUPO no tienen filas en `VOpcionesHerraje` (ni bajo la línea
GRUPO); el documento del caso revisado no guarda ninguna selección. La web leía la
lista vacía como un formulario con todo desmarcado; con `opcionesPorDefecto` cada
conjunto toma `SelecDefSN`, como ya hacía el núcleo para conjuntos sin selección.
El banco lo activa cuando la línea, o todos los elementos del GRUPO, carecen de filas.

Reconstrucción: Docker se detuvo y la base `tmpfs` se perdió. Se recreó con las
mismas CSV; solo cambian `articulos.creado_en` y los UUID de `estructura_cotas` y
`estructura_componentes` (valores generados), y la medición de `main` reprodujo
377 iguales con cero diferencias línea a línea antes de medir este cambio. Huella
anterior en `base-verificada-antes-reconstruccion.json`.

Resultado: 377→380 iguales (+3, los primeros GRUPO), ninguna perdida; distintas 9→5.
Suite: core 568, db 55, ETL 41 + 1 omitida, web 677; banco 21; typecheck y
arquitectura sin infracciones.

### Estado al cierre de la sesión (iteración 12)

380/523 iguales (72,66 %), frente a 5/523 de la base. Ninguna igualdad se perdió en
ninguna iteración; elegibles (523) y exclusiones (434) no han cambiado. Las 143 líneas
restantes, con una causa principal cada una:

| Causa pendiente | Líneas | Siguiente paso |
|---|---:|---|
| PVP actualizado después del presupuesto (precio antiguo) | 58 cercanas | No reproducible: la copia solo guarda el PVP vigente. Sin estas líneas la cifra sería 380/465 (81,7 %); se informa aparte y no cambia el denominador |
| GRUPO no admitido por el configurador web | 31 | Contrato del configurador: C2, PC2 y otros sin plantilla visual estática y medidas de módulo con 0,5 mm |
| Despunte de cabecera | 10 | Hipótesis: «Calcular Despunte» suma el coste de sobrantes de barra al precio (doc. con C2: 403,79 + 348,61) |
| Piezas o importes de fila | 16 | Tapajuntas de puerta sin lado inferior (3), superficie COM009 en mitades (4 filas), metraje V484, redondeo binario |
| Residuo de comisión sumada | 6 | 1–4 céntimos con el signo de la comisión; orden de redondeo sin demostrar |
| Otros bloqueos de entrada | 22 | Vidrio sin junquillo (4), tubos y accesorios repetidos (3), uniones de serie distinta (3), perfil adicional C2FI (2)… |

Hipótesis que necesitan observar Productor en Windows (empresa de pruebas, sin guardar):

| Pantalla | Dato concreto | Líneas |
|---|---|---:|
| Cabecera → Gastos: `Comisión`, `Sumar Comisión` | Con -10 % y una línea de suma de despiece conocida, anotar el `Precio` y si el redondeo es por línea o por fila | 6 |
| Cabecera → Gastos: `Despunte`, `Calcular Despunte` | Ejecutar el cálculo en una línea C2 y anotar importe, base y cómo se reparte entre varias líneas | 10 |
| Editar estructura → Accesorios → Tapajuntas en una puerta 1P | Desmarcar el lado inferior y anotar el largo de los laterales (¿`L+CAJ+ala` o `L+CAJ+2·ala`?) | 3 |
| Editar estructura → Compacto COM009 a 2325 × 2140 | Anotar metraje de COMPVAL (¿4,93 o 4,94?) para fijar el redondeo de superficie del compacto | 1–4 |
| Composición de GRUPO con C2 o PC2 | Comprobar si las medidas económicas con 0,5 mm se conservan o se redondean al valorar | 31 |
| Editar estructura → Acristalamiento, opciones 2..5 | Elegir alternativas superiores y anotar nTAcris y tablas usadas | sin casos en esta copia |

Pendientes tras la iteración 3 (diagnósticos solapados, no promesas de mejora): compactos y
accesorios 283; piezas ausentes 325; PVP/tarifa 101; metraje 59; componentes y
herrajes 45; reglas de MO 44; vidrio/acristalamiento 42; configuraciones GRUPO 31.
Los 342 diagnósticos de acabado incluyen acabado solicitado frente al genérico
resuelto; no equivalen automáticamente a 342 errores de precio. Los 369 de coste
no se usan para corregir PVP. El denominador y los criterios de igualdad no cambian.


### Iteración 13: GRUPO fraccionarios y catálogo compartido (Windows)

Antes del cambio se reconstruyó la base local desde los CSV de la misma copia y
se reprodujo exactamente la base de 380 iguales, 81 cercanas, 5 distintas,
57 sin valorar y cero errores. La firma del Mac se apartó en
`base-verificada-mac-previa-20261003.json`: las fechas de alta y los identificadores
generados cambian al recrear la base. No se utilizó la MDB activa del equipo.

Evidencia previa sobre los 31 GRUPO: 117 módulos, 95 con alguna dimensión
fraccionaria; todos los grupos incluyen fracciones. Las medidas coinciden con
`VPresupuestosLin.Ancho/Largo` en los 117 módulos, sin discrepancias. Además de
medios milímetros, hay valores REAL de Access próximos a 0,3 y 0,7 mm: se conservan
exactamente, sin redondearlos para ajustar un precio. Artefacto privado:
`evidencia-grupos-windows.json`.

La carga devuelve los 160 diseños, pero Node/tsx cargaba dos registros de core:
ESM desde el banco y CommonJS desde web. Por eso 27 grupos no veían plantillas
ya generadas. Declarar web como ESM reúne ambos consumidores en el mismo registro;
una prueba sintética que registra un modelo desde core y lo valida desde web
falla antes y pasa después. Los códigos desconocidos siguen rechazados.
La guarda de configuración admite ahora números finitos positivos sin exigir
milímetros enteros; fixtures de versiones 1, 2 y 3 fallaron antes y pasan después.

Tras resolver esos dos impedimentos aparecía el siguiente: U («SIN UNION»).
`Estructuras` acredita familia 103, accesorio, grosor 1 y `AsocASeriesSN=false`;
su plantilla tiene tres filas de cantidad cero (MO y dos filas informativas 0,
con fórmulas A/L). En toda la copia hay 100 elementos U con precio cero y sin
material no nulo; en los 31 GRUPO hay 44, todos con la misma evidencia.
La serie guardada de U no identifica ningún perfil, por lo que no bloquea el
grupo cuando difiere de la serie del módulo. Las otras uniones conservan el bloqueo.

El servicio solo genera `SIN_UNION_U` con catálogo completo, precio cero y filas
explícitas de cantidad cero. El snapshot exige origen UNION, código U, venta y
coste cero, sin piezas, partidas, vidrio, herrajes ni diagnósticos. Recetas ausentes,
importes contradictorios y otras uniones con receta vacía conservan importe nulo
y bloqueo. Fixtures sintéticas del contrato fueron rojas antes de la corrección;
la integración PostgreSQL comprueba también el servicio, la lectura JSON y la
degradación sin receta. No se cambian pantallas, tarifas, márgenes ni fórmulas.

Resultado: **380→400 iguales (+20), ninguna identidad anterior perdida**.
Los 31 GRUPO pasan la validación: 20 iguales y 11 sin valorar. Fuera de estos
31 no cambió ninguna clasificación. Denominador 523 y exclusiones 434 conservados;
81 cercanas, 5 distintas, 37 sin valorar y cero errores. Prueba por identidad en
`no-regresion-grupos-windows.json`, contra `resultados-iteracion-12.json`.

| Causa principal restante dentro de los 31 | Líneas | Límite conservado |
|---|---:|---|
| Unión material de serie distinta | 8 | Se necesita representación económica por unión; no aplicar la excepción de U a perfiles |
| Variantes de vidrio por elemento | 1 | No unificar alternativas sin evidencia |
| PVP ausente o ambiguo | 1 | No completar con un precio histórico |
| Vidrio/acristalamiento | 1 | Investigar la receta y sus entradas antes de corregir |

Estado vigente al cierre de la iteración 13: **400/523 (76,48 %)**; en 2026,
**400/496 (80,65 %)**. Los pendientes de la iteración 12 permanecen arriba como
histórico; el bloqueo de configuración de sus 31 GRUPO está resuelto. No se
han observado ni implementado las hipótesis de despunte, comisión o tapajuntas.

Verificación: core 592, db 55, ETL 41 + 1 omitida, web 701 (1.389 pasadas);
banco/adaptadores 41; typecheck del monorepo y banco; arquitectura con cero
infracciones. Suite completa con `npm run -ws --if-present test -- --maxWorkers=2
--testTimeout=20000`, sin forzar una única base para ETL y web. En Windows,
la concurrencia predeterminada agotó el límite de 5 segundos de algunas pruebas
de integración; el pase con dos workers evita esa saturación. Los primeros
ensayos compartiendo base encontraron tablas de otras suites: se repitieron
con los destinos separados documentados. Los parámetros de ejecución quedan
en los logs privados; la configuración de pruebas versionada permanece intacta.

### Auditoría de cobertura de resultados guardados — 03/10/2026

Continuación del relevo de raíz, con checkout `08310cb`. No cambia el motor ni
ejecuta una nueva medición; complementa el precio con despiece y variantes.
[Matriz de reglas y fuentes](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md),
[detalle de 97 pares modelo/serie](COBERTURA-MODELO-SERIE-2026-10-03.md) y
[ensayos mínimos](ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md).

Lectura reconstruida desde tablas.json, banco.json y resultados.json, con
huellas de catálogo y archivos estables: 957 candidatas, 434 excluidas y 523
elegibles; 400/81/5/37/0 sin cambio. Artículos y cantidades coinciden en 440;
cortes y unidad también en 436. Precio y esos campos coinciden simultáneamente
en 360. El acabado literal coincide en cinco de las líneas de despiece completo;
se documentan discrepancias UNI/L sin asumir equivalencia ni causalidad de PVP.
Funciones vacías impiden acreditar el campo completo. Costes, metraje e importes
se separan; no se deduce margen de costes nulos/cero ni fabricación del total.

Herramienta: `node --import tsx scripts/cobertura-productor.ts`. Solo escribe
el informe agregado; no lee .env/MDB ni conecta a BD. Fuente: copia ya extraída
de Anterior.mdb con la huella de este banco. El informe conserva las huellas de
los cinco JSON de procedencia y el alcance de los metadatos antiguos.

Verificación de esta entrega: 47 pruebas de banco/adaptadores/analizador;
typecheck dirigido del banco y monorepo, arquitectura con cero infracciones.
Las suites de integración del producto no se repiten: no cambia su código.
No se operó Productor ni se obtuvieron resultados nuevos de los seis ensayos.
El progreso leído de la conversación de visión solo acredita la inserción de
una ventana; faltan sus entradas completas y resultados. E1–E7 permanecen
pendientes. Producción consta como verificada por Claude en el relevo recibido,
con aceptación de valorar/guardar/recargar/PDF todavía pendiente.

## Avance E1 — 04/10/2026, fuera del corpus del banco

[Evidencia y reproducción](EVIDENCIA-E1-DESPUNTE-2026-10-04.md). Manual y
VDespunteDetalle de otra copia Windows: 13 documentos positivos con detalle
reconcilian la resta; ocho cabeceras a cero discrepan y un positivo no tiene
detalle. Base/porcentaje a cero no explican el reparto. Hay 3.517 filas de
detalle sin cabecera presente, conservadas y fuera del contraste económico.
La huella no coincide con la de este banco: no reextraer ni sobrescribir sus
fuentes. Ninguna candidata del banco se da por resuelta por estos resultados.

Nueve pruebas nuevas de diagnóstico y las 47 existentes, typechecks y
arquitectura correctos. Sin cambios del producto ni nueva valoración del banco.
Continuación visual del 04/10: A–F en 0017 conservados; recálculo sustituye,
repetición y reapertura mantienen resultado. Copia F verificada y lector propio,
13 pruebas de diagnóstico/fronteras. Margen GID 0,01 % sobre coste explica
residuo B/D de 0,02 €. Complementario G1–G5 observado en documento nuevo:
alta independiente de segunda C2 de distinto importe no hereda ni reparte el
cargo; recálculo sustituye y reparte por bases sin cargo. F9/reapertura conserva
proyección técnica completa. Copias verificadas por estado y predicciones
anteriores al recálculo; tres políticas de precisión coinciden en G4. E1 sigue
En curso: G6-incidencia conserva variante1207 con propiedades verificadas,
error de opciones/SessionFactory y alta de tercer GRUPO. No se recalculó.
Pendiente autorización para quitar solo tercer GRUPO y confirmar edición sin
alta antes de precisión y frontera económica del presupuesto web. Cantidad 1 y
descuentos cero no prueban base bruta/neta ni otras cantidades. No repetir
A–F ni G1–G5. Sin nueva medición del banco ni cambio del motor; archivos,
discrepancias, 400/523 y 434 exclusiones se conservan.

## Diagnóstico de distribución y bloqueos

Intervalos excluyentes, sobre las distintas; error relativo absoluto en céntimos.

| Error | Líneas |
|---|---:|
| ≤1 % | 0 |
| >1–5 % | 0 |
| >5–10 % | 2 |
| >10 % | 3 |
| base cero | 0 |

Una causa principal por línea: primer impedimento de representación, después primer aviso bloqueante.
Los resultados valorados distintos no tienen bloqueo; sus discrepancias se investigan pieza a pieza.
La asignación por identidad queda en `resultados.json → diagnostico.bloqueos`, fuera de Git.

| Modelo | Causa principal | Líneas |
|---|---|---:|
| 2O | sin bloqueo: valorado | 196 |
| 1O | sin bloqueo: valorado | 103 |
| 2O | vidrio-y-acristalamiento | 1 |
| 1O | vidrio-y-acristalamiento | 2 |
| 1O | sin bloqueo: valorado distinto | 2 |
| 2O | accesorio-de-linea-no-representable | 2 |
| 2O | familia-adicional-no-representable | 1 |

## Alcance, fuente y preparación

Copia autorizada `EMP0016/Anterior.mdb`, solo lectura con `mdb-reader` y proyección de campos técnicos.
SHA-256: `e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`. Ejecución: `2026-10-03T18:11:36.166Z`.
Revisión Git anterior al cambio de trabajo medido: `bec252349269ccb2fb67189f8b9648cf1d932bc2`; el Historial identifica cada corrección posterior.
Confirmados 403 presupuestos (22 de 2025, 381 de 2026) y 105011 filas:
790 estructuras independientes, 167 GRUPO y 1169 elementos internos
(1068 con Precio > 0). Los 1169 elementos no se suman de nuevo al denominador del GRUPO.
Las filas de artículo independientes y el despiece no son líneas de estructura reproducidas por este servicio.

Universo de 957 líneas comerciales de estructura/GRUPO; 434 excluidas y 523 elegibles.
El porcentaje incluye sin valorar y errores en el denominador. Los excluidos no se dan por acertados ni fallidos.
No extrapolar esta cifra a las 105.011 filas, a todos los modelos ni a los trabajos posteriores de la base activa.

Postgres local `127.0.0.1:55433/aluminior_real_test`: 29 migraciones existentes, 541 estructuras,
17.547 artículos, 83.367 PVP y 260.760 filas del motor. Simulación y carga dirigida:
cero descartes, tablas protegidas conservadas. Clientes, proveedores, obras y documentos no importados.
No se cargaron reglas calibradas del histórico para la vía antigua; los resultados de esa vía no pueden ser aciertos.
No se leyó `.env`, ni se ejecutaron consultas o escrituras en Supabase. No se modifican los datos del catálogo; los cambios de motor están en el Historial.

Se amplía el banco con una frontera de extracción/ejecución nueva porque el banco v1 no lee cabeceras ni GRUPO
y el adaptador `banco-motor` solo admite materiales parciales; se reutilizan normalización, avisos y cargadores existentes,
y se conserva el banco v1. [Contrato anterior](BANCO-COMPARACION-PRECIOS.md),
[reglas de fase 7](fase-7/06-reglas-catalogo-despiece-completo.md),
[integración del motor](INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).

## Evidencia del mapeo

| Regla | Evidencia comprobada en esta copia | Límite |
|---|---|---|
| Cabecera: nDoc → VPresupuestos.Id | Claves únicas; 1 filas sin cabecera | Tarifa y fecha salen de la cabecera, nunca se presupone tarifa 1 |
| Hija: (nDoc,nEstr) → (nDoc,nLinea) | 102390 enlaces, 94 huérfanos, 0 destinos presentes que no sean estructura; nLinAsoc informado = 0 | Huérfanos no usados; falta de despiece excluye. Contraste previo: [PLAN, validación del oráculo](../historico/PLAN.md) |
| Configuración: (VPRES,nVDoc,nVLinea) | 0 claves duplicadas | No unir solo por línea; no mezclar VFAC/VALB |
| Serie y vidrio: FamiliaN/ConjuntoN | Familia 001 selecciona perfiles, 050 vidrio, 051 guías; se conservan cuatro posiciones | No escoger Conjunto1 por posición. [Evidencia de fase 4](fase-4/00-resumen.md) |
| Opciones: (VPRES,nDoc,nLinEstr,Conjunto,nOpcion) | Las selecciones true/false se conservan | La web recibe las marcadas; alternativas/conflictos no representables bloquean |
| Grupo: (nDoc,nGrupo) → línea GRUPO | Todos los 1169 elementos enlazados se conservan | 206 elementos adicionales fuera de VCerramientosLin, en 82 grupos; no omitir compactos |
| Dibujo: (VPRES,nDoc,nLinGrupo) → VCerramientos.id → VCerramientosLin.nCerr | 167 cabeceras únicas; nLinEstr enlaza el elemento por documento y código | El dibujo no sustituye medidas económicas. [Reconocimiento de cerramientos](RECON-CERRAMIENTOS.md) |
| Extremos de unión: UOrdenElem1/2 → Orden | 398 uniones VPRES con ambos extremos en módulos; cero destinos inválidos | V/H da anclaje lógico; no se reconstruye una geometría o accesorio no representable |
| Grosor/longitud de unión | En 104 uniones de GRUPO elegibles, ULongitud coincide con Largo económico; Ancho de línea es 0 | El grosor físico sale de UGrosor explícito, nunca de Ancho=0. Longitud discordante bloquea |
| Medidas económicas | VPresupuestosLin.Ancho/Largo, ya en mm; de 565 módulos dibujados, 560 tienen corte MV igual al alto de su línea | Solo 90 tienen ambas medidas iguales a las del dibujo. Se preservan las dos fuentes y no se convierten unas en otras |
| Despiece y precio padre | 1784/1959 estructuras tienen suma de hijas = Precio; 1 sin hijas | Diagnóstico, no fórmula de precio. Con todos los elementos de grupo, 133/167 sumas reconciliadas; solo geometría, 65/167 |
| Diseño específico | Bandera DisEspecificoSN y detalle enlazado por (VPRES,nVDoc,nVLinEstr) | Se conserva detalle técnico; no se inventa la instancia |
| Horas | HorasAdFabr/HorasColoc conservadas; la frontera usa el servicio web de MO | REAL de Access se normaliza a dos decimales de formulario; [evidencia de horas/minutos](SPEC-MANO-DE-OBRA.md) |

Selección de acristalamiento: `nTAcris=0/1` reproduce la primera opción, según la
evidencia de la iteración 3. Las selecciones superiores siguen sin mapeo demostrado:
0 líneas bloqueadas en esta medición.
Los códigos de guías, segundos acabados y accesorios se conservan como evidencia; no se infieren reglas nuevas de sus precios.
Acabado2 se transmite al núcleo como acabado de accesorios; se respetan los selectores
explícitos de las asociaciones (ver evidencia de la iteración). Quedan bloqueadas las entradas
no representables. Hay 0 coincidencias numéricas adicionales con
entradas parcialmente representadas, que no se cuentan como aciertos.

## Qué precio se compara

El esperado es `VPresupuestosLin.Precio`, sin IVA; se conserva además `ImporteTotal`.
El obtenido es el **total efectivo que cobraría la web dividido por la cantidad comercial**:
materiales por composición y horas manuales por línea. Se preserva cualquier diferencia de ámbito de MO
frente al histórico. No se multiplica dos veces el despiece y no se usan precios históricos para calcular el motor.
Los descuentos de las 957 líneas de estructura/GRUPO son cero; no se mezclan descuentos de cabecera ni IVA.

Servicios: `valorarEstructura`, `valorarCerramiento`, `prepararManoObra` y reglas decimales existentes.
La validación del configurador forma parte de la reproducción de GRUPO. Entrada conocida sin representación
en la web queda sin valorar; no se cambia el motor ni se fuerza una configuración ficticia.
Igual: ±0,01 €; cercano: >0,01 € y ≤1 %; distinto: resto; incompleto: importe null; excepción: error.
El umbral se evalúa en céntimos para no convertir ruido binario de Access REAL en diferencias comerciales.
La proximidad nunca cuenta como igualdad. Una igualdad de precio puede tener diferencias de piezas o coste.

## Resultados por modelo

| Modelo | Universo | Excluidas | Líneas | Igual | Cercano | Distinto | Sin valorar | Error | Igual % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2O | 231 | 31 | 200 | 166 | 30 | 0 | 4 | 0 | 83,00 |
| 1O | 140 | 33 | 107 | 89 | 14 | 2 | 2 | 0 | 83,18 |
| GRUPO | 167 | 122 | 45 | 23 | 2 | 3 | 17 | 0 | 51,11 |
| PC2 | 33 | 2 | 31 | 22 | 8 | 0 | 1 | 0 | 70,97 |
| C2 | 28 | 0 | 28 | 23 | 3 | 0 | 2 | 0 | 82,14 |
| 0 | 31 | 10 | 21 | 18 | 3 | 0 | 0 | 0 | 85,71 |
| 1P | 23 | 5 | 18 | 9 | 8 | 0 | 1 | 0 | 50,00 |
| 3HO | 21 | 8 | 13 | 9 | 4 | 0 | 0 | 0 | 69,23 |
| 2OFI | 16 | 7 | 9 | 9 | 0 | 0 | 0 | 0 | 100,00 |
| C2P | 8 | 0 | 8 | 8 | 0 | 0 | 0 | 0 | 100,00 |
| 1OFI | 12 | 5 | 7 | 4 | 3 | 0 | 0 | 0 | 57,14 |
| 1 | 9 | 3 | 6 | 5 | 1 | 0 | 0 | 0 | 83,33 |
| 02V | 8 | 3 | 5 | 4 | 0 | 0 | 1 | 0 | 80,00 |
| PC3C | 4 | 0 | 4 | 1 | 0 | 0 | 3 | 0 | 25,00 |
| 1OPLD | 4 | 2 | 2 | 1 | 1 | 0 | 0 | 0 | 50,00 |
| 1OPLI | 2 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 100,00 |
| 2 | 2 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 50,00 |
| C2FI | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 1OPPI | 2 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 0,00 |
| 1PCMA | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0,00 |
| 1PFS | 5 | 4 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| 2O+1OFI | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| 2P | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0,00 |
| C2E1 | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| C2G | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| C3 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| C4P | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| PC2E2 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| PC2X | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| PC6C | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| T | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 1FL | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 1O+1F+1O | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 1OP1FL | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 1OPPD | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 2FS | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 2OPL | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 2PD | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| C3C | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM001 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM005 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM009 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM017 | 13 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| OB+1VS | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| PSM001 | 135 | 135 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| PSM002 | 11 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| PSM004 | 14 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| **TOTAL** | **957** | **434** | **523** | **400** | **81** | **5** | **37** | **0** | **76,48** |

## Exclusiones

El motivo primario permite reconciliar exactamente 434 exclusiones; la última columna tiene solapamientos.

| Motivo | Primario | Presente, con solapamiento |
|---|---:|---:|
| diseno-especifico-no-reproducible | 173 | 192 |
| precio-manual | 58 | 58 |
| entradas-incompletas | 201 | 262 |
| medidas-o-cantidad-no-positivas | 2 | 2 |

Además, sin despiece: 1 (ya incluido en diseño específico).
Los 58 precios manuales están excluidos del acierto. PSM001 y otros accesorios sin serie demostrada
quedan fuera por entradas incompletas; eso es falta de cobertura medible, no evidencia de precio correcto.

## Fecha y tarifa

Todos los documentos usan tarifa 1 explícita. Los PVP de la copia tienen actualización entre
24/11/2022 y 26/01/2026; 9 filas carecen de UltimaAct. Se coteja la fecha de las filas seleccionadas,
sin inventar una vigencia ni rescatar una tarifa por proximidad económica.
Actualización anterior no acredita por sí sola toda la historia de precios.

| Año | Líneas | Igual | Cercano | Distinto | Sin valorar | Error | Igual % |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2026 | 496 | 400 | 55 | 4 | 37 | 0 | 80,65 |
| 2025 | 27 | 0 | 26 | 1 | 0 | 0 | 0,00 |

| Fecha de PVP respecto al presupuesto | Líneas | Igual | Cercano | Distinto | Sin valorar | Error |
|---|---:|---:|---:|---:|---:|---:|
| anterior-o-igual | 199 | 186 | 11 | 0 | 2 | 0 |
| posterior | 71 | 5 | 60 | 3 | 3 | 0 |
| desconocida | 253 | 209 | 10 | 2 | 32 | 0 |

Desconocida incluye cálculos no ejecutables y cualquier selección con fecha incompleta;
no equivale a tarifa errónea. Los casos con PVP posterior permanecen separados y no demuestran
un error del algoritmo por diferir del presupuesto antiguo. La cifra principal describe la copia cargada.

## Diez diagnósticos principales

Ordenados por líneas y después por suma de precios esperados. Hay solapamiento entre causas.
El importe expuesto es agregado de precios unitarios de líneas afectadas, sin clientes.
Desviación medible solo suma diferencias de resultados valorados; no convierte los sin valorar en cero.
Estos diagnósticos localizan discrepancias; no atribuyen causalidad completa a cada aviso.

| Diagnóstico | Líneas | Precio esperado agregado € | Desviación absoluta medible € | Sin importe calculado |
|---|---:|---:|---:|---:|
| total-padre-no-reconciliado | 18 | 17.609,06 | 670,54 | 14 |
| coste-de-articulo | 14 | 21.748,15 | 1006,10 | 9 |
| acabado-de-articulo | 14 | 21.748,15 | 1006,10 | 9 |
| serie-de-union-no-representable | 11 | 20.214,40 | 0,00 | 11 |
| pvp-o-tarifa | 11 | 12.182,22 | 670,54 | 7 |
| importe-de-fila | 11 | 12.182,22 | 670,54 | 7 |
| despunte-de-documento-sin-regla | 10 | 9947,37 | 0,00 | 10 |
| vidrio-y-acristalamiento | 6 | 8815,35 | 0,00 | 6 |
| pieza-ausente | 5 | 14.802,44 | 335,56 | 4 |
| mano-de-obra | 5 | 3735,70 | 162,61 | 3 |

Coste-de-artículo es una discrepancia de coste, **no causa del PVP**: el histórico conserva muchos ceros
y el catálogo actual aporta costes. Acabados diferentes se comparan como el mismo artículo con acabado distinto,
no como una ausencia y un sobrante falsos. La función vacía de MO histórica no crea una pieza diferente de MO web.
Se preservan multiconjuntos, cantidades y cortes; las filas informativas 0 y avisos se conservan en origen pero no se cuentan como material.
El margen no se deduce de costes nulos/cero. `total-padre-no-reconciliado` exige investigar precio guardado,
redondeo o reglas de cabecera; no demuestra un margen concreto.

Errores de servicio actuales: 0. La iteración de snapshot
y sus campos concretos quedan documentados en el Historial.
El catálogo visual y su validación se preparan con la misma función que usa la web.

## Causas pendientes tras la última medición

Las cifras son **líneas candidatas a revisar como máximo**, solapadas; no garantizan desbloqueo tras un único arreglo.

| Prioridad | Causa → líneas candidatas | Dónde investigar/tocar después de verificar |
|---|---|---|
| 1 | Acabados por artículo → hasta 14 discrepancias | Acabado2 resuelto en esta iteración; investigar las discrepancias restantes por origen y acabado efectivo, sin generalizar por familia |
| 2 | Compactos/accesorios ausentes → hasta 0 medidas; además 206 elementos adicionales en 82 GRUPO | Contrato de configuración y core `despiece/linea-catalogo/`; investigar COM*, MOCOMP y accesorios desde sus entradas, no aprender sus importes |
| 3 | PVP/tarifa → hasta 11 | `estructuras/pvp-articulos.ts`, `catalogo-despiece/leer-catalogo.ts`, importación PVP; separar cambio de acabado de precio antiguo; no cambiar tarifa del catálogo para cuadrar |
| 4 | Alternativa de acristalamiento → 0 bloqueadas | nTAcris 0/1 resuelto; valores superiores requieren CHM/configuración/ensayo y `acristalamiento-serie.ts` |
| 5 | GRUPO no representable → 0 elegibles bloqueados; numerosos excluidos por accesorios incompletos | `core/estructuras/validar-configuracion-cerramiento.ts`, catálogo visual, configuración por origen y `cerramientos/valorar-cerramiento.ts`; medidas fraccionarias/modelos/uniones se reportan en detalle privado |
| 6 | Metraje facturable → hasta 3 | `core/precios/importe-fila.ts`; cotejar mínimos/múltiplos y redondeo por pieza/fila con iguales tarifas |
| 7 | Herrajes, MO y vidrio bloqueantes → hasta 1, 0 y 6 | `core/despiece/asociaciones/`, `mano-obra-fabricacion.ts`, `acristalamiento-catalogo.ts` y resolución de serie |
| 8 | Cortes/cotas → hasta 3 | `core/despiece/linea-catalogo/diseno.ts` y referencias de corte; FI/FD y divisiones necesitan instancia verificable |
| 9 | Costes → hasta 14 discrepancias diagnósticas | `estructuras/coste-articulos.ts` y ETL costes; aclarar ceros históricos antes de calcular márgenes. No usar este arreglo para prometer PVP correcto |
| 10 | Snapshot de GRUPO → 0 errores | `cerramientos/valorar-cerramiento.ts`, `origen-valorado.ts` y `core/estructuras/resultado-cerramiento/validar.ts`; localizar el campo que incumple el contrato con una fixture sintética antes de modificarlo |

## Repetición y artefactos

Requisitos: Docker local y `mdb-reader` ya instalado en `export_datos/herramientas`.
Todos los JSON/CSV/logs detallados quedan en `export_datos/banco-contraste/`, ignorado por Git.

```sh
docker compose -f packages/db/docker-compose.yml up -d
# Solo la primera vez, si falta la base:
docker exec aluminior_pg_test createdb -U aluminior aluminior_real_test
node --import tsx scripts/banco-contraste.ts extraer --mdb /Users/sergio/Desktop/Productor/Aluminio/EMP0016/Anterior.mdb
node --import tsx scripts/banco-contraste.ts catalogo --mdb /Users/sergio/Desktop/Productor/Aluminio/EMP0016/Anterior.mdb
# Solo sobre la base vacía; rechaza sobreescribir un catálogo existente:
node --import tsx scripts/banco-contraste.ts preparar --origen export_datos/banco-contraste/catalogo
node --import tsx scripts/banco-contraste.ts medir --informe docs/paridad/BANCO-CONTRASTE-2026-10-03.md
node --import tsx --test scripts/lib/banco-contraste/*.test.ts scripts/banco-motor.test.ts scripts/banco-precios.test.mjs
npx tsc -p scripts/tsconfig.banco-contraste.json --noEmit
```

Para repetir sobre la misma copia y base basta `medir`. El script exige host local, puerto 55433 y base
aluminior_real_test, no carga entorno ni admite parámetros de conexión alternativos.
La exportación guarda huellas de cada CSV y la carga comprueba que banco y catálogo proceden de la misma copia.
No usar el importador completo ni modificar el catálogo para elevar el porcentaje.

Verificación de cierre: 41 pruebas del banco/adaptadores; typecheck específico y del
monorepo, auditoría de arquitectura y suite general (1.389 pruebas pasadas, 1 omitida).
Cada iteración detalla su evidencia y sus logs privados.
Migraciones sin cambios. La base local es efímera y se pierde si se recrea/parada Docker.
