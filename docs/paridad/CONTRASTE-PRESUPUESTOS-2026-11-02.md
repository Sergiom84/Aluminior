# Contraste masivo de GRUPO reales Productor / Aluminior — 02/11/2026

Todos los presupuestos con líneas `GRUPO` de la 0016 (2026) y de la 0015
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

Uniones aisladas (cada pieza solo tiene esa unión en su dirección), suma de
ambas empresas:

| Unión | Alturas | Mitad y mitad | Otro reparto |
|---|---|---:|---:|
| De perfil (`GMU…`, `PSU…`) | distintas | 33 | 4 |
| De perfil | iguales | 146 | 15 |
| `U` | distintas | 22 | 3 |
| `U` | iguales | 110 | 14 |

**Observado:** las alturas distintas **no** explican la asimetría: con
alturas distintas el 89 % reparte mitad y mitad, igual que con alturas
iguales (91 %). El caso 3 de la 0017 (1160/360 en vez de 1170/340) sigue
siendo **una sola observación**: su fijo es invisible y tiene unión de perfil
a ambos lados. En los datos reales, las 8 uniones aisladas junto a un
invisible son `U` y reparten mitad y mitad; no hay ninguna `GMU…` junto a un
invisible con la que contrastarlo. **Hipótesis:** la asimetría del caso 3
depende del elemento invisible (sin marco). No se cambia la regla; se
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
  0016: varias series 31, vidrio 28, `FI`/`FS` 21, no dibujable 19.
- **0017** (empresa de pruebas, copia de la 0016 de septiembre más los
  ensayos): 28 coinciden, 62 difieren, 116 sin valorar, 14 no reproducibles.
  Control con los casos de la comparativa del 01/11: el 2O de 1200 (514,31),
  el 2 × 2 con `U` (1.391,88) y las C2 de 439,5 y 1999,5 (150,60 y 267,77)
  coinciden al céntimo; el 2O con compacto da 476,28 + 119,48 del compacto
  = 595,76, como Productor. El caso 3 queda sin valorar porque sus uniones
  `GMU038` no llevan serie en esa línea (E2).

## Orden recomendado

Por importe en juego y número de presupuestos de la 0016, y por coste
estimado (hipótesis):

1. **Cota `FI`/`FS` en GRUPO** — 31 GRUPO, 140.531 €. Transmitir la cota del
   fijo a los módulos (banco y web: 2OFI, FS además de 1OFI).
2. **E2: conjuntos de varias series** — 40 GRUPO, 109.226 €. Valorar cada
   unión con la serie de su elemento.
3. **E5: compacto** — 43 GRUPO, 103.672 €; 15.215 € medidos, y el resto
   coincide al céntimo en 24.
4. **E6: vidrio por elemento** — 24 GRUPO, 70.638 €.
5. **Reparto: unión que recorre varias piezas** — 44 GRUPO, poco importe
   (749 €) pero frecuente: recortar todas las piezas que toca una unión.
6. Diseño específico (19), no dibujables (13), despunte E1 (12).
7. DS3 invisible y E4 tapajuntas: 2 GRUPO cada uno.

## Reproducir

```bash
node --import tsx scripts/banco-contraste.ts extraer --mdb export_datos/contraste-2026-11/fuentes/EMP0016/copia-aluminio-20261031.mdb --salida export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261031
```

```bash
node --import tsx scripts/contraste-presupuestos.ts --salida export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261031 --julio export_datos/EMP0016
```

`--reclasificar` repite la clasificación sin volver a valorar. Pruebas:
`node --import tsx --test scripts/lib/contraste-presupuestos/*.test.ts`; con
`ALUMINIOR_CONTRASTE_LOCAL=1` corre además la regresión de nueve GRUPO reales
anonimizados (`casos-regresion.json`) contra el catálogo local.

Límites: catálogo local cargado de la exportación de julio (PVP idénticos a
la copia nueva; el resto del catálogo no se ha comparado tabla a tabla). Las
causas por pieza vienen del diagnóstico del banco y pueden solaparse. La
tarea no corrige el motor.
