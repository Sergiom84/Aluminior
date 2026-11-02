# Contraste masivo de GRUPO reales Productor / Aluminior — 02/11/2026

Todos los presupuestos con líneas `GRUPO` de los 17 ejercicios de Productor
(2010–2026, 4.107 GRUPO reales), con detalle de la 0016 (2026) y la 0015
(2025), valorados con el motor de Aluminior sobre el catálogo real local
(`aluminior_real_test`) y clasificados. Continúa la
[comparativa del 01–02/11](COMPARATIVA-PRESUPUESTOS-2026-11-01.md) y reutiliza
el [banco de contraste](BANCO-CONTRASTE-2026-10-03.md).

Marcas: **Observado** (leído en la copia o medido con el motor),
**Hipótesis** (sin comprobar). Importes sin IVA, solo agregados: ningún
documento, cliente ni importe individual de la 0015/0016.

## Fuentes

| Copia (privada, en `export_datos/contraste-2026-11/`, ignorado) | Fecha del archivo | Documentos | GRUPO |
|---|---|---:|---:|
| 0016 `aluminio.mdb`, copia binaria | 31/10/2026 | 591 | 225 |
| 0015 `aluminio.mdb`, copia binaria | 19/10/2026 | 725 | 230 |
| 0017 (pruebas), copia binaria | 02/11/2026 | 524 | 220 |
| 0001–0014 (ejercicios 2010–2024), copias binarias | 2018–2026 | 9.437 | 3.652 |

Productor no guarda copias mensuales: `Copias de Seguridad` conserva solo las
cuatro últimas de cada ejercicio. La serie temporal sale de los propios
ejercicios (uno por año; la 0009 abarca 2018–2020) y de la fecha de cada
documento. En total, **4.107 GRUPO reales de 2010 a 2026** (sin la 0017). La
0009 supera el límite de cadena de Node al guardar el JSON indentado: el
banco guarda ahora `tablas` y `banco` sin sangría, y las tablas que los
ejercicios antiguos no tienen (`VEstructurasVariables`, `VAccesorios`,
`VOpciones`) se leen como vacías y quedan anotadas en el manifiesto.

- La base activa no se abrió con Jet ni con Productor: se copió byte a byte,
  dos veces, con la misma huella SHA-256 y sin cambio de fecha. Las copias se
  leyeron con `mdb-reader` en solo lectura (el lector del banco), no con
  PowerShell + Jet. `leerFuente` admite ahora una copia con nombre propio
  dentro de `export_datos/` y sigue rechazando cualquier `aluminio.mdb`.
- Sin escrituras en Supabase. Postgres local: solo lectura del catálogo.

### Novedades frente a la exportación de julio (0016)

**Observado:** la exportación de julio llega al 23/06/2026 (403 documentos,
167 GRUPO). La copia nueva llega al 30/10: **188 documentos nuevos**, ninguno
desaparecido, **59 GRUPO nuevos en 51 documentos**, todos con tarifa 1.
`ArticulosPVP` es idéntica (83.367 filas, 0 precios cambiados o añadidos): el
catálogo local sigue vigente para la 0016. Serie nueva en un GRUPO: `GMA76`.
La 0015 tiene 10.878 PVP distintos de los de 2026 (última actualización en
2023): sus GRUPO no son comparables en precio con el catálogo actual.

## Método

`scripts/contraste-presupuestos.ts` (sobre la extracción de
`banco-contraste.ts extraer`) valora cada GRUPO dos veces con el servicio de
la web (`valorarCerramiento`, el mismo que el banco):

1. **Medidas guardadas**: cada pieza con la medida económica que guardó
   Productor. Aísla el motor de precios.
2. **Medidas nominales**: cada pieza con el hueco del dibujo
   (`VCerramientosLin.AnchoHueco/AltoHueco`) y el reparto de uniones de
   Aluminior (`repartoUniones: 'PIEZAS'`), como si el operador dibujase el
   mismo conjunto. El cajón del compacto se resta como en Productor para no
   mezclar causas.

Antes se apartan, con su precio de Productor, el compacto y los tapajuntas
(líneas de elemento sin dibujo) y el elemento invisible (se resta el módulo
que Aluminior sí cobra). Así una diferencia se atribuye solo si el resto
coincide al céntimo. Lo que no se puede valorar queda **sin valorar**, nunca a
cero. Las causas se solapan: un GRUPO puede tener varias.

## Resultado 0016 (comparable en precio)

| Resultado | GRUPO | Documentos | Importe de las líneas |
|---|---:|---:|---:|
| Coincide al céntimo | 23 | 20 | 38.778,46 |
| Difiere, causa identificada | 66 | 58 | 152.957,00 |
| Sin valorar | 123 | 113 | 406.566,09 |
| No reproducible (no se dibuja) | 13 | 13 | 40.327,66 |
| **Total** | **225** | **186** | **638.629,21** |

GRUPO nuevos desde julio (59): 6 coinciden, 19 difieren, 31 sin valorar, 3 no
reproducibles.

### Por mes (0016)

**Observado:** la tarifa 1 vigente se cargó en enero de 2026 (10.878 PVP con
`UltimaAct` de 2026-01) y no ha cambiado después. Los 7 GRUPO de noviembre y
diciembre de 2025 que viven en la 0016 usan la tarifa anterior y difieren
todos.

| Mes | GRUPO | Coincide | Difiere | Sin valorar | No reproducible | Receta igual |
|---|---:|---:|---:|---:|---:|---:|
| 2025-11/12 | 7 | 0 | 7 | 0 | 0 | 3 |
| 2026-01 | 21 | 3 | 5 | 13 | 0 | 7 |
| 2026-02 | 24 | 1 | 3 | 18 | 2 | 4 |
| 2026-03 | 36 | 6 | 10 | 18 | 2 | 14 |
| 2026-04 | 30 | 3 | 5 | 19 | 3 | 7 |
| 2026-05 | 29 | 3 | 11 | 12 | 3 | 7 |
| 2026-06 | 26 | 1 | 9 | 16 | 0 | 8 |
| 2026-07 | 14 | 3 | 4 | 6 | 1 | 6 |
| 2026-08 | 8 | 2 | 3 | 2 | 1 | 4 |
| 2026-09 | 15 | 0 | 3 | 11 | 1 | 2 |
| 2026-10 | 15 | 1 | 6 | 8 | 0 | 7 |

No hay deriva por mes: la proporción de sin valorar (40–75 %) depende de qué
estructuras se presupuestaron, no de la fecha.

«Receta igual» = valorado con medidas guardadas y con los mismos cortes,
metrajes y cantidades que Productor, aunque cambie el PVP. Es la medida que
permite comparar ejercicios con otra tarifa. Coste, mano de obra, acabado y
pieza ausente no cuentan: el diagnóstico por pieza de un GRUPO los marca
también en los 23 que coinciden al céntimo (23, 21, 15 y 14 de 23), así que
no discriminan.

Coincidir al céntimo exige que todo el conjunto se valore igual; por eso la
tasa es baja frente al banco de estructuras sueltas (80 % en 2026). En los 66
que difieren, el resto del conjunto coincide al céntimo en 24 (compacto) y
en 9 (solo reparto de uniones).

### Causas por importe (0016)

«Principal» = primera causa del GRUPO; «atribuible» = parte medida de la
causa cuando se puede aislar.

| Causa | GRUPO | Principal | Documentos | Importe de las líneas | Atribuible medido | Tarea |
|---|---:|---:|---:|---:|---:|---|
| Cota del fijo `FI`/`FS` sin transmitir | 31 | 31 | 28 | 140.530,91 | — | nueva |
| Módulos de varias series / unión de otra serie | 40 | 40 | 36 | 109.225,53 | — | E2 |
| Compacto | 43 | 35 | 41 | 103.671,58 | 15.214,98 (32) | E5 |
| Reparto de uniones | 44 | 9 | 41 | 114.746,95 | 748,59 (44) | nueva |
| Vidrio distinto por elemento / junquillo | 24 | 24 | 23 | 70.638,37 | — | E6 |
| Diseño específico con precio | 19 | 19 | 16 | 40.496,44 | 7.148,23 (19) | DS3/E9 |
| No se dibuja | 13 | 13 | 13 | 40.327,66 | — | catálogo |
| Despunte de documento | 12 | 12 | 11 | 30.707,59 | — | E1 |
| Tarifa o importe de fila (diagnóstico por pieza) | 38 | 13 | 33 | 98.204,93 | 2.922,90 (12) | E10/E11 |
| Elemento invisible | 2 | 0 | 2 | 2.273,27 | 328,48 (2) | DS3 |
| Tapajuntas | 2 | 1 | 2 | 2.196,49 | 72,49 (2) | E4 |

Detalle observado de cada causa:

- **Cota `FI`/`FS`**: el motor avisa `Variable "FI" sin valor` en 1OFI (16),
  2OFI (22), 2O+1OFI, 1FS, 1PFS y 2OPFS. El banco no transmite la cota de los
  fijos inferior/superior a los módulos del GRUPO, y la web solo admite `fiMm`
  en `1OFI`. Es el mayor importe y probablemente el arreglo más barato
  (hipótesis): leer `VEstructurasVariables` del elemento y llevarla al módulo.
- **Varias series**: de 40, 37 son conjuntos con módulos de dos o tres series
  (p. ej. corredera y abatible) cuya unión lleva la serie de uno de ellos; 3
  son uniones de una serie ajena al conjunto. Aluminior valora la unión con la
  serie general.
- **Compacto**: en 24 GRUPO el resto coincide al céntimo y la diferencia es
  exactamente el precio del compacto (observado). Aluminior no puede
  presupuestarlo (E5).
- **Vidrio**: 23 mezclan vidrio simple y doble por elemento; 3 sin junquillo
  para vidrio de 32 mm.
- **No se dibuja**: estructuras sin plantilla visual (`3HO`, `PCM1D`, `PCM1I`,
  `1O+VS`, `1OP+VS`, `1OPLD`, `1PCMA`) y una medida guardada no válida.

## Reparto del grosor de las uniones

**Observado** en 0016 y 0015 (455 GRUPO), comparando la medida guardada de
cada pieza con la que daría la regla de Aluminior desde el hueco:

| | 0016 | 0015 |
|---|---:|---:|
| Coinciden todas las piezas | 148 | 168 |
| Alguna pieza difiere | 76 | 60 |
| — unión que recorre varias piezas | 47 | 35 |
| — reparto asimétrico | 33 | 28 |
| — ajuste a un total con decimales (p. ej. 1399,3) | 15 | 9 |

En precio (0016): 44 GRUPO cambian al dibujarlos desde el hueco, de media
16,87 € y como máximo 219,63 €; 748,59 € en total.

- **Unión que recorre varias piezas** (patrón principal): una unión vertical
  de toda la altura recorta en Productor todas las piezas de la columna; en
  Aluminior solo el par anclado. Ejemplo anónimo: fijo 1000 · `GMU038` · fijo
  700 · `GMU038` · columna de dos C2 de 1000 unidas con `U`: Productor deja
  las dos C2 en 970; Aluminior, la superior en 970 y la inferior en 1000.
- **Ajuste a un total**: Productor reparte decimales para cuadrar el ancho
  total escrito por el operador.

### Uniones con piezas de alturas distintas (punto 4)

Uniones de perfil aisladas (cada pieza solo tiene esa unión en su
dirección), en los 17 ejercicios. Se separan las uniones de guías y
esquineros de compacto, que se comportan de otra forma:

| Uniones | Alturas | Mitad y mitad | Otro reparto | % mitad |
|---|---|---:|---:|---:|
| Catálogo actual (`GMU…`, `PSU…`, 2023–2026) | distintas | 104 | 12 | 89,7 |
| Catálogo actual | iguales | 310 | 27 | 92,0 |
| Antiguas, sin las de compacto (2010–2022) | distintas | 293 | 16 | 94,8 |
| Antiguas, sin las de compacto | iguales | 1.052 | 135 | 88,6 |
| Guías y esquineros de compacto (2010–2022) | distintas | 80 | 69 | 53,7 |
| Guías y esquineros de compacto | iguales | 176 | 300 | 37,0 |

**Observado:**

- Las alturas distintas **no** explican la asimetría: con alturas distintas
  se reparte mitad y mitad tanto o más que con alturas iguales.
- La asimetría se concentra en uniones concretas: `CMU07`/`CMU08` y
  `U16`/`U17` («H-unión para guías de compacto», casi siempre 83/42) y los
  esquineros `ESQCOMP`/`ESQCOMPRPT` (109,5/68,5). Con las uniones actuales:
  `PSU001` 95 %, `GMU040` 93 %, `PSU006` 100 % y `GMU038` 84 % mitad y mitad.
  Es un efecto del compacto (E5), no una regla general.
- Junto a un elemento invisible hay 21 uniones aisladas (17 `U` y 4 de
  perfil) y todas reparten mitad y mitad. El caso 3 de la 0017 (1160/360 en
  vez de 1170/340) sigue siendo **una sola observación**, con el invisible
  entre dos uniones `GMU038`. **Hipótesis** abierta, ya debilitada: depende
  de que el invisible tenga unión a ambos lados. No se cambia la regla; se
  conserva como prueba de la divergencia (`uniones.test.ts`).

## Elemento invisible (DS3): campo identificado

**Observado** (8 de 8 en 0017, 0016 y 0015): el invisible es una línea de
estructura con `DisEspecificoSN` cuyo diseño de documento
(`EstructurasDiseño`, `TipoDoc = VPRES`) es **un único nodo de `Tipo = 19`**;
precio 0, sin despiece, dentro de un GRUPO. Detalle en la
[guía del diseñador](GUIA-DISENADOR-PRODUCTOR.md). `DisEspecificoSN` solo no
basta: 19 GRUPO de la 0016 lo llevan en elementos con precio (diseños
específicos), que difieren en 7.148,23 €.

## 0015 y 0017

- **0015**: 0 coinciden; 119 difieren, 88 por tarifa (PVP de 2023 frente al
  catálogo de 2026), 90 sin valorar, 19 no reproducibles, 2 excluidos por
  precio manual. Aparecen las mismas causas ajenas a la tarifa que en la
  0016: varias series 31, vidrio 28, `FI`/`FS` 21, no dibujable 19. En 87 de
  los 119 valorados la receta es igual: solo cambia el PVP.
- **0017** (empresa de pruebas, copia de la 0016 de septiembre más los
  ensayos): 28 coinciden, 62 difieren, 116 sin valorar, 14 no reproducibles.
  Control con los casos de la comparativa del 01/11: el 2O de 1200 (514,31),
  el 2 × 2 con `U` (1.391,88) y las C2 de 439,5 y 1999,5 (150,60 y 267,77)
  coinciden al céntimo; el 2O con compacto da 476,28 + 119,48 del compacto
  = 595,76, como Productor. El caso 3 queda sin valorar porque sus uniones
  `GMU038` no llevan serie en esa línea (E2).

## Todos los ejercicios, 2010–2026

Por año del documento (4.107 GRUPO reales; la 0017 no se suma):

| Año | GRUPO | Coincide | Difiere | Sin valorar | No reproducible | Excluido | Receta igual |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2010 | 277 | 0 | 0 | 11 | 266 | 0 | 0 |
| 2011 | 275 | 0 | 0 | 14 | 261 | 0 | 0 |
| 2012 | 59 | 0 | 0 | 4 | 55 | 0 | 0 |
| 2013 | 136 | 0 | 0 | 0 | 136 | 0 | 0 |
| 2014 | 187 | 0 | 0 | 16 | 171 | 0 | 0 |
| 2015 | 7 | 0 | 0 | 1 | 6 | 0 | 0 |
| 2016 | 379 | 0 | 0 | 28 | 351 | 0 | 0 |
| 2017 | 323 | 0 | 0 | 17 | 306 | 0 | 0 |
| 2018 | 286 | 0 | 0 | 23 | 263 | 0 | 0 |
| 2019 | 281 | 0 | 0 | 50 | 231 | 0 | 0 |
| 2020 | 267 | 0 | 0 | 63 | 204 | 0 | 0 |
| 2021 | 327 | 0 | 0 | 58 | 264 | 5 | 0 |
| 2022 | 276 | 0 | 0 | 32 | 240 | 4 | 0 |
| 2023 | 278 | 0 | 128 | 94 | 55 | 1 | 75 |
| 2024 | 314 | 0 | 153 | 142 | 17 | 2 | 114 |
| 2025 | 215 | 0 | 118 | 76 | 19 | 2 | 82 |
| 2026 | 220 | 23 | 60 | 124 | 13 | 0 | 67 |

**Observado:**

- Hasta 2022 casi nada se puede reproducir con el catálogo de 2026: los
  conjuntos usan uniones que ya no existen (`CMU…`, `ESQCOMP…`, `U4`–`U30`;
  «unión fuera del configurador») y series retiradas («Serie no
  encontrada», 219 GRUPO). Para precio no aportan; para geometría sí.
- Con el catálogo actual (2023–2026, 1.023 GRUPO, 843 documentos), de los
  482 valorados **338 (70 %) tienen la misma receta** que Productor: mismos
  cortes, metrajes y cantidades; difieren por la tarifa de cada año. Solo
  la tarifa de 2026 permite coincidir al céntimo.
- Causas ajenas a la tarifa en 2023–2026, por número de GRUPO: compacto 235,
  reparto de uniones 221, varias series 140, diseño específico 117, vidrio
  117, no dibujable 100, cota `FI`/`FS` 96, tapajuntas 27, despunte 25,
  invisible 5. El orden de la 0016 se mantiene salvo que el compacto pesa
  más en los años anteriores.
- Reparto en los 17 ejercicios: 2.176 GRUPO coinciden pieza a pieza y 1.899
  no; patrones: asimétrico 1.075 (sobre todo uniones de compacto, ver arriba),
  unión que recorre varias piezas 544 y ajuste decimal al total 466.

## Orden recomendado

Por importe en juego en 2026 y frecuencia en 2023–2026, y por coste
estimado (hipótesis):

1. **Cota `FI`/`FS` en GRUPO** — 31 GRUPO y 140.531 € en 2026; 96 en
   2023–2026. Probablemente el arreglo más barato: transmitir la cota del
   fijo a los módulos (banco y web: 2OFI y FS además de 1OFI).
2. **E5: compacto** — 43 GRUPO y 103.672 € en 2026; 235 en 2023–2026, la
   causa más frecuente. En 24 de 2026 el resto coincide al céntimo. Incluye
   el reparto propio de sus uniones de guía.
3. **E2: conjuntos de varias series** — 40 GRUPO y 109.226 € en 2026; 140
   en 2023–2026. Valorar cada unión con la serie de su elemento.
4. **E6: vidrio por elemento** — 24 GRUPO en 2026; 117 en 2023–2026.
5. **Reparto: unión que recorre varias piezas** — 44 GRUPO en 2026 por solo
   749 €; 221 en 2023–2026. Recortar todas las piezas que toca una unión.
6. Diseño específico (117 en 2023–2026), no dibujables (100), despunte E1.
7. DS3 invisible (5) y E4 tapajuntas (27).

## Reproducir

```bash
node --import tsx scripts/banco-contraste.ts extraer --mdb export_datos/contraste-2026-11/fuentes/EMP0016/copia-aluminio-20261031.mdb --salida export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261031
```

```bash
node --import tsx scripts/contraste-presupuestos.ts --salida export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261031 --julio export_datos/EMP0016
```

`--reclasificar` repite la clasificación sin volver a valorar.
`scripts/contraste-presupuestos-agregado.ts` reúne todas las extracciones de
`export_datos/contraste-2026-11/` por ejercicio y año. Pruebas:
`node --import tsx --test scripts/lib/contraste-presupuestos/*.test.ts`; con
`ALUMINIOR_CONTRASTE_LOCAL=1` corre además la regresión de nueve GRUPO reales
anonimizados (`casos-regresion.json`) contra el catálogo local.

Límites: catálogo local cargado de la exportación de julio (PVP idénticos a
la copia nueva; el resto del catálogo no se ha comparado tabla a tabla). Las
causas por pieza vienen del diagnóstico del banco y pueden solaparse. La
tarea no corrige el motor.

## GR1 — 02/11/2026

Transmisión de las cotas de fijo y travesaño de cada elemento (`FI`, `FS`, `VS`
acotadas por `altoMm`; `TD`, `F`, `FD`, `FZ` acotadas por `anchoMm`, según el
catálogo `estructura_cotas` / `estructura_diseno_nodos`) a su módulo del GRUPO
en `packages/core` (`cotas?: CotasModulo` en `ModuloCerramiento` v3, compatible
hacia atrás con snapshots v1–v3 sin `cotas` y con `fiMm` de `1OFI`),
`packages/web` (`valorarCerramiento` pasa `cotasEfectivasModulo(m)` a
`valorarEstructura` en vez de `cotas: null`) y el banco (`configuracionGrupo`
lee las cotas de instancia desde `cotasDeCaso(e)` y `anonimizarGrupo` conserva
`variables`).

### Resultado 0016 tras GR1

| Resultado | Antes de GR1 | Tras GR1 | Documentos | Importe de las líneas |
|---|---:|---:|---:|---:|
| Coincide al céntimo | 23 | 23 | 20 | 38.778,46 |
| Difiere, causa identificada | 66 | 92 | 79 | 269.832,71 |
| Sin valorar | 123 | 97 | 90 | 289.690,38 |
| No reproducible (no se dibuja) | 13 | 13 | 13 | 40.327,66 |
| **Total** | **225** | **225** | **186** | **638.629,21** |

**Observado:**

- Los **23 GRUPO que coincidían al céntimo siguen coincidiendo** (38.778,46 €).
  En los 59 nuevos desde julio: 6 coinciden, 29 difieren (+10), 21 sin valorar
  (−10) y 3 no reproducibles.
- La causa `cota-fi-fs` baja de **31 GRUPO (28 documentos, 140.530,91 €) a 0**
  en la 0016: ningún origen de la 0016 avisa ya de variable de cota sin valor
  (`FI`, `FS` ni `TD`).
- De los 31 GRUPO antes bloqueados por `cota-fi-fs`, **26 pasan a valorarse**
  (`difiere`, 116.875,71 € en líneas):
  - **10 tienen `receta: igual`** (el total de receta igual en la 0016 sube de
    69 a **79**): en **5** el resto del conjunto coincide al céntimo y la única
    diferencia frente a Productor es el compacto (el recuento de compacto con
    resto exacto sube de 24 a **29**, y el total con causa `compacto` sube de
    43 a **65** GRUPO, con 31.975,72 € atribuibles en 54 medidos); los otros 5
    difieren por `importe-de-fila` (4) o `acabado` (1) junto con compacto y
    reparto de uniones.
  - **16 llevan `DisEspecificoSN`** con precio (`diseno-especifico` sube de 19
    a **35** GRUPO, 9.938,13 € atribuibles), incluido el conjunto
    `1OFI+1OFI+2O+1OFI+1OFI` con `GMU038` tras transmitir `TD = 700` junto con
    `FI = 300`.
- Los **5 GRUPO restantes** de los 31 (23.655,20 € en líneas: tres
  `2O+1OFI+2O+1OFI` y dos `1OFI+2OFI`) usan la unión `PSU006`: sus módulos
  `2O+1OFI`, `1OFI` y `2OFI` ya se valoran completos y el conjunto queda **sin
  valorar** únicamente por `PSESQCOM: sin PVP en la tarifa` (causa `tarifa`,
  cuya frecuencia como causa principal sube de 7 a **12**, 21 GRUPO en total).
- **0015 (2025)**: `difiere` sube de 119 a **138** (+19, incluidos tres
  conjuntos con fijos laterales `1O1FL` [`F = 300`], `2OFLFI` y `2OP2FL`
  [`FD = 300`]), `sin-valorar` baja de 90 a **71** (−19), `cota-fi-fs` baja de
  21 a **3** (tres GRUPO cuyos elementos `1OFI`/`2OFI`/`1PFS` no tienen fila en
  `VEstructurasVariables`) y `receta: igual` sube de 87 a **89**.
- **0017**: `coincide` se mantiene en **28**, `difiere` sube de 62 a **86**
  (+24), `sin-valorar` baja de 116 a **92** (−24), `cota-fi-fs` queda en **0**
  y `receta: igual` sube a **79**.
- **Agregado 2023–2026 (1.023 GRUPO)**: los GRUPO valorados suben de 482 a
  **527** (23 coinciden + 504 difieren) y los de `receta: igual` de 338 a
  **350**. `cota-fi-fs` baja de 96 a **47**: 44 pertenecen a 2023–2024
  (`EMP0013` y `EMP0014`, donde la tabla `VEstructurasVariables` tiene 0 filas)
  y 3 a `EMP0015` sin fila en esa tabla.
- **Regresión local (`casos-regresion.json`)**: `regresion-01` a `regresion-08`
  no cambian; `regresion-09` (`0 + 1PFS` con `GMU038` y `FS = 300`) pasa de
  `sin-valorar` (`cota-fi-fs`) a `difiere` (1.440,26 €, causas
  `diseno-especifico`, `herraje-o-componentes`, `mano-de-obra`).

**Pendiente y límites:**

- **Observado:** en la interfaz del configurador web (`MedidasElemento`) hoy
  solo `1OFI` expone un campo directo para editar `fiMm`. En Productor, la
  pestaña `Elemento seleccionado` solo muestra `Ancho × Alto` y las cotas de
  división se editan desde el icono de cartabón (`Diseño V3`); falta definir y
  exponer en la interfaz web los controles visibles para que el operador edite
  las cotas (`FI`, `FS`, `TD`, `F`, `FD`…) de las demás estructuras.
- **Hipótesis:** en los ejercicios 2023–2024 (`EMP0013` y `EMP0014`, donde
  `VEstructurasVariables` está vacía) y en los 3 casos de `EMP0015` sin fila en
  `VEstructurasVariables`, Productor guardaba las cotas de instancia en
  `EstructurasDiseño` (`TipoDoc = 'VPRES'`) o en `VMedidasDA`, tablas que la
  proyección actual de `scripts/lib/banco-contraste/fuente.ts` no extrae.

## E5 — 02/11/2026

Modelado del cajón de persiana y despiece de compactos `COM001`–`COM017` por módulo
en cerramientos `GRUPO`:

1. **Modelo en `packages/core`**:
   - `packages/core/src/estructuras/compacto-cerramiento.ts`: define `CompactoModulo`,
     la guarda pura `compactoModuloValido` y el resolutor `compactoEfectivoModulo`
     (hereda acabado de accesorios o general de la carpintería). La primera entrega
     suponía `['G1O0']` sin opciones guardadas; retirado en la corrección de abajo.
   - `ModuloCerramiento.compacto?: CompactoModulo` opcional en v3 (`cerramiento.ts`),
     100 % compatible hacia atrás con v1, v2 y v3 sin persiana.
   - `CompactoLineaCatalogo.alturaTotalMm` opcional en `despiece/linea-catalogo/tipos.ts`
     y `compacto.ts`: cuando el compacto cubre fijos además de la ventana (medida total
     diferente de `altoMm + altoCajonMm`), la fórmula `L` de la persiana usa
     `alturaTotalMm`.
2. **Servicio web de valoración**:
   - `packages/web/app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts`
     transmite `compacto: compactoEfectivoModulo(m, entrada)` en geometría y en cada
     módulo valorado en lugar de `compacto: null`.
3. **Banco de contraste masivo**:
   - `scripts/lib/banco-contraste/geometria.ts` (`compactoDeModulo`): mapea `VAccesorios`
     con `FamiliaAcc === '100'` a su módulo mediante el campo `nModulo` (1-based en
     los módulos de hueco), transmitiendo estructura, opciones, vuelos y altura total.
   - `scripts/lib/contraste-presupuestos/variantes.ts`: transmite accesorios de persiana
     y sus piezas en la variante, de modo que el motor valora el cerramiento íntegro
     con compacto incluido.
   - `scripts/lib/contraste-presupuestos/casos-regresion.json`: la primera entrega
     marcó `regresion-06` como coincidente con opciones que no son de ese GRUPO
     (ver corrección).

### Corrección del mismo 02/11/2026 (vigente)

Revisión de la primera entrega con el contraste repetido sobre la misma extracción
(`931b6ee` y luego con el endurecimiento):

- **Retrocedía en vez de resolver.** La primera entrega dejaba en la 0016 23 / 39 /
  150 / 13 (coincide / difiere / sin valorar / no reproducible) frente a 23 / 92 / 97 /
  13 tras GR1: 53 GRUPO dejaron de valorarse. 51 avisaban «accesorio COM009 (o COM005,
  COM016): grupo G10 sin una opción marcada». El descenso de la causa `compacto` de 43
  a 11 fue porque esos GRUPO pasaron a `sin-valorar` (`otra`), no porque se resolvieran.
  En la 0015, `difiere` bajó de 138 a 82.
- **Causa.** En la 0016, **272 de 276** compactos de GRUPO no guardan ninguna fila en
  `VOpciones`; los 521 compactos de línea suelta sí, y 519 llevan
  `G1O0, G2O2, G3O2, G10O0`. Productor aplica a los de GRUPO las opciones por defecto
  de `EstructurasOpcGrupos/Opciones`, que Aluminior no carga. El `['G1O0']` supuesto
  no decide el grupo G10.
- **`regresion-06` (documento 946) no reflejaba los datos.** La línea GRUPO 344723 no
  tiene `VOpciones`. Sus cuatro opciones se copiaron de la línea suelta 344924 (un 2O)
  del mismo documento. En el contraste real ese GRUPO estaba `sin-valorar`.
- **11 restantes mal etiquetados.** Eran `accesorio-de-linea-no-representable` y
  `accesorios-de-grupo-no-representables` (tubos 112, accesorios repetidos), contados
  como `compacto`.

Endurecimiento:

- `scripts/lib/banco-contraste/compacto-grupo.ts` decide qué compactos de GRUPO se
  transmiten: COM*, `nModulo` de 1 al número de módulos (0 solo con uno), uno por
  módulo, opciones guardadas, `compDtoHuecoSN`, cajón, sin guías ni medidas manuales y
  un acabado. Si falta algo, `variantes.ts` aparta el compacto con su importe, como
  antes de E5, y `configuracionGrupo` lo declara con su motivo.
- `compactoEfectivoModulo` ya no supone opciones: sin ellas el despiece queda incompleto.
- El clasificador separa la causa `otro-accesorio`. Un compacto no COM produce
  `compacto-no-representable`.
- `regresion-06` vuelve a los datos reales: `difiere` por `compacto` y
  `reparto-uniones`, 1.054,43 € con medidas guardadas (igual que el contraste real).
- `alturaTotalMm` se mantiene solo en el banco: se toma del alto del elemento COM de
  Productor, que es un resultado, no una regla. No tiene equivalente en la web.

Resultado tras el endurecimiento:

| Ejercicio | Coincide | Difiere | Sin valorar | No reproducible | Receta igual |
|---|---:|---:|---:|---:|---:|
| 0016 | 23 | 92 | 97 | 13 | 79 |
| 0015 | 0 | 137 | 72 | 19 (+2 excluidos) | 87 |

En la 0016, `compacto` queda en **53 GRUPO** (28 como causa principal; 31.208,80 €
atribuibles en 53 medidos) y `otro-accesorio` en 11 (27.909,76 € en líneas). Solo el
documento 919 tiene compacto con opciones y evidencia completa: se valora en su
módulo y coincide con medidas guardadas (la diferencia es `reparto-uniones`). El
agregado 2023–2026 no se ha vuelto a medir; la cifra de 171 de la primera entrega
queda retirada.

**Experimento, sin commit.** Aplicar `G1O0, G2O2, G3O2, G10O0` a los compactos de
GRUPO sin opciones da en la 0016: 24 coinciden, y los que solo difieren por
`reparto-uniones` (con medidas guardadas al céntimo) suben de 10 a 31. Es evidencia
de que esos son los valores por defecto de Productor para COM001/005/009/013. Para que
sea canónico hay que leerlos de `EstructurasOpcGrupos/Opciones`: carga ETL, migración y
la entrada por defecto en el catálogo de despiece. Hecho en E5b, a continuación.

### E5b — opciones predeterminadas del catálogo (02/11/2026, vigente)

`EstructurasOpcOpciones` marca la predeterminada de cada grupo (`OPCpredetSN`). Para
COM009 coincide con lo que guardan 519 de las 521 líneas sueltas: `G1O0` (sin guía
central), `G2O2` y `G3O2` (sin recogedor de vuelo) y `G10O0` (recogedor). En las
47 estructuras accesorias del catálogo, cada grupo tiene exactamente una
predeterminada, y ningún grupo ni opción es condicional, escalar ni incompatible.

- Migración `0033_estructura_opciones_accesorio` (local; no aplicada en Supabase) y
  carga en `reemplazarCatalogoDespiece` (430 filas de la 0016). La importación
  suplementaria la omite sin la tabla; la carga dirigida del motor la exige.
- `CatalogoLinea.opcionesPredeterminadas`: `despiezarAccesorio` completa con la
  predeterminada cada grupo sin opción guardada; las guardadas mandan.
  `leer-catalogo.ts` la lee con `opciones-accesorio.ts` si la tabla existe.
- El banco ya no exige `VOpciones` en el compacto de GRUPO.
- `regresion-06` (documento 946, sin `VOpciones`) **coincide al céntimo** con datos
  reales: 1.410,08 € con medidas guardadas y desde el hueco.

| Ejercicio | Coincide | Difiere | Sin valorar | No reproducible | Receta igual | `compacto` |
|---|---:|---:|---:|---:|---:|---:|
| 0016 antes de E5b | 23 | 92 | 97 | 13 | 79 | 53 |
| 0016 con E5b | **24** | 91 | 97 | 13 | 76 | **8** |
| 0015 antes de E5b | 0 | 137 | 72 | 19 | 87 | 55 |
| 0015 con E5b | 0 | 137 | 72 | 19 | 86 | 9 |

- En la 0016, los GRUPO cuya única diferencia es el reparto desde el hueco (con
  medidas guardadas al céntimo) pasan de 10 a **31** como causa principal.
- Los 8 `compacto` restantes de la 0016 se apartan con motivo: 7 por
  `acabados-de-accesorio-distintos` (lamas o guías en otro acabado) y 1 por
  `compacto-sin-modulo` (tres compactos en un GRUPO de dos módulos).
- La receta igual baja de 79 a 76 porque ahora se comparan también las piezas del
  compacto. Sin diseño específico, 4 GRUPO valorados con compacto difieren en longitud
  de corte o metraje (documentos 881, 1019, 1020 y 1249): es lo siguiente a revisar.
- En la 0015 manda la tarifa (PVP de 2026 frente a documentos de 2025).

### Resultado de la primera entrega (retirado; ver corrección)

- **0016 (2026)**:
  - La causa `compacto` cae de **43 GRUPO (103.672 €)** a **11 GRUPO (27.909,76 €)**.
  - **Más de 75.000 € y 32 GRUPO resueltos**.
  - Comprobados los 11 GRUPO restantes con causa `compacto`: ninguno falla por persianas
    `COM*` sin modelar. Todos ellos son casos donde un elemento individual contiene tubos
    de remate (`FamiliaAcc: '112'`, `GMTUB*`) o mosquiteras (`FamiliaAcc: '101'`, `PSM001`),
    que al no tener representación de línea devuelven `accesorio-de-linea-no-representable`
    y son mapeados históricamente a `compacto`. El **100 % de los compactos `COM*` de la
    0016** queda resuelto y valorado.
- **0015 (2025)**:
  - Los casos con causa `compacto` caen a solo **2 GRUPO** (2.311,30 €).
- **Agregado 2023–2026**:
  - Los GRUPO con causa `compacto` caen de 235 a **171**.
- **Batería de tests**:
  - `@aluminior/core`: 702 tests pasando (100 %).
  - Regresión local (`regresion-local.test.ts`): 100 % pasando (todos los casos reales coinciden).
  - Arquitectura: 0 infracciones, módulos limpios.
