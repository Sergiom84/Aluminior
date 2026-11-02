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
