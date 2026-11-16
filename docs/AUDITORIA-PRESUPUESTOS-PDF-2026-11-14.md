# Auditoría de presupuestos PDF en Aluminior (14/11/2026)

Comparativa ejecutada en local (`http://localhost:3000`) actuando como usuario final sobre 6 presupuestos reales emitidos en Productor Aluminio (`260595`, `260583`, `260472`, `260487`, `260289` y `260465`).

Los nombres de cliente, razones sociales, identificadores fiscales, contactos y direcciones de obra no se conservan. En su lugar:

| Identificador | Código local de la prueba | PDF Productor | Presupuesto local | Obra |
|---|---|---|---|---|
| Cliente A | `00528` | `260595` | `260024` | Obra 1 |
| Cliente B | `00529` | `260583` | `260025` | Obra 2 |
| Cliente C | `00530` | `260472` | `260026` | Obra 3 |
| Cliente D | `00527` | `260487` | `260023` | Obra 4 |
| Cliente E | `00531` | `260289` | `260027` | Obra 5 |
| Cliente F | no consta en esta auditoría | `260465` | `260028` | Obra 6 |

Hay dos capas, y no dicen lo mismo:

- **Secciones 1 y 2:** lo que la prueba de usuario tecleó al reconstruir cada PDF a ciegas, sin leer `aluminio.mdb`. Es el registro de esa prueba. No es una lista de trabajo.
- **Secciones 3 a 5:** contraste de solo lectura contra la copia `C:\Users\sergi\Desktop\MIX\aluminio.mdb` del 14/11/2026 a las 12:13, cruzando `VPresupuestosLin` y `VDatosLinEstr`. Esas cifras las aporta ese contraste; esta unidad no ha vuelto a abrir el MDB.

Para cada PDF la prueba hizo el flujo completo: alta de cliente, presupuesto con obra y forma de pago, todas las líneas en el configurador o en Artículos, y **Emitir**.

---

## 1. Resumen comparativo global

| PDF Productor | Presupuesto Aluminior | Identificador local | Base Imp. PDF | Total PDF | Base Imp. Aluminior | Estado en la prueba | Emisión PDF (`Emitir`) |
|---|---|---|---|---|---|---|---|
| **260595** | `260024` | Cliente A (`00528`) | 3.154,25 € | 3.816,64 € | 290,61 € *(solo L1)* | L1 por debajo del PDF; L2 (`GRUPO` 4 módulos) bloqueada al añadir | OK (HTTP 200) |
| **260583** | `260025` | Cliente B (`00529`) | 1.798,42 € | 2.176,09 € | `sin valorar` | L1 configurada como `C2FI` en `GMC400`; el motor no resolvió `GM487`/`GM492` | OK (sin totales) |
| **260472** | `260026` | Cliente C (`00530`) | 13.180,42 € | 15.948,31 € | `sin valorar` *(4.159,45 € parcial)* | L1 (`1OFI`) y L3 (`PSM001`) sin valorar; L2, L4, L5 y L6 por debajo | OK (HTTP 200) |
| **260487** | `260023` | Cliente D (`00527`) | 3.001,42 € | 3.631,72 € | `sin valorar` | L1 (`1OFI`) y L2 (`C2FI`) sin valorar; L3 (`1O`) 399,94 € vs 735,40 € | OK (HTTP 200) |
| **260289** | `260027` | Cliente E (`00531`) | 6.312,00 € | 7.637,52 € | `sin valorar` | Composición `GRUPO` de 4 módulos guardada, bloqueada por incluir `1OFI` | OK (sin totales) |
| **260465** | `260028` | Cliente F | 13.923,49 € | 16.847,42 € | `sin valorar` *(9.364,00 € parcial)* | 12 líneas valoradas por debajo del PDF; 4 sin valorar (`V3` y mosquiteras) | OK (HTTP 200) |

**Conclusión de la prueba:** con la reconstrucción a ciegas, Aluminior no reprodujo el PDF en ninguno de los 6 presupuestos. Esa frase no es el diagnóstico. El contraste de la sección 3 muestra qué parte de esos descuadres viene de haber tecleado otra estructura, otro vidrio, otras medidas u horas a cero, y qué trabajo de producto queda de verdad. No se abre trabajo desde esta tabla.

---

## 2. Detalle de la prueba de usuario

Lo que sigue es lo que se introdujo a mano desde el PDF. Donde la sección 3 da otra estructura, otro vidrio, otra medida u otras horas, manda la sección 3.

### Caso 1: PDF `260595` → Presupuesto Aluminior `260024`

Este PDF es minutos posterior a la copia del MDB. No está en el contraste de la sección 3.

- **Cliente:** Cliente A (`00528`). Identificador fiscal y dirección postal no se conservan.
- **Cabecera:** Obra 1. Nombre de contacto no se conserva. Forma de pago en la prueba: `Efectivo` *(PDF: `01-CONTADO`)*.
- **Líneas:**
  1. **Ref. `1O` (Cdad. 1):** `1O` 630×640 mm, `ELEGANTPVC`, `L · L. BLANCO`, `V420GS4` (`4/20/GUARDIAN SUN 4`), sin selector de `CON INSTALACIÓN`.
     - PDF: **420,69 €** | Aluminior: **290,61 €** *(17 piezas; diferencia: -130,08 €)*
  2. **Ref. `GRUPO` (Cdad. 1):** cerramiento de terraza, 4 módulos (`1100+1500+500+500 × 600`), doble cristal mate `4-20-GUARDIAN SUN 4`, suplemento superior 10 cm y esquinas 5 cm.
     - PDF: **2.733,56 €**
     - Aluminior: no existe estructura `GRUPO`. Como artículo `GRUPO` queda `sin valorar` (*«El artículo no tiene precio en la tarifa 1»*) y no permite precio manual. Al componer 4 fijos `0` con 3 uniones y pulsar **Aceptar**, el botón se quedó en *«Añadiendo…»* y se canceló el POST. En esa pantalla no había campos para el suplemento superior (10 cm) ni el de esquina (5 cm).
- **Totales:** PDF Base `3.154,25 €` (Total `3.816,64 €`) vs Aluminior Base `290,61 €` (Total `351,64 €`).
- **Emisión:** `presupuesto-A-260024-revision-0.pdf` generado.

---

### Caso 2: PDF `260583` → Presupuesto Aluminior `260025`

- **Cliente:** Cliente B (`00529`).
- **Cabecera:** Obra 2. Forma de pago en la prueba: `Efectivo` *(PDF: `01-CONTADO`)*.
- **Líneas tecleadas (no es lo que guarda el MDB; ver sección 3.2):**
  1. **Ref. `GRUPO` (Cdad. 2):** la prueba lo configuró como `C2FI` 1160×2160 mm (corredera 1230 + fijo inferior 930), `GMC400` (`SERIE 400 EUR`), acabado `V · L. VARIOS (COLOR)` porque no encontró el literal «Gris», vidrio `V484` (`4/8/4`).
     - PDF: **899,21 €/ud** → **1.798,42 €** | Aluminior: **`sin valorar`**
     - Aviso del motor en esa configuración: `MODULO modulo-1: Importe incompleto: GM487 (FH): pieza 7: perfil adicional pendiente de resolver; GM492 (FH): pieza 8: perfil adicional pendiente de resolver; GM492 (FV): pieza 9: perfil adicional pendiente de resolver; GM487: sin largo; GM492: sin largo.; MODULO modulo-1: Faltan costes o materiales necesarios para este origen` (45 piezas, 5 sin coste). Además, `C2FI` indicó *«C2FI no admite Diseño V3»*.
- **Totales:** PDF Base `1.798,42 €` (Total `2.176,09 €`) vs Aluminior `sin valorar`.
- **Emisión:** `presupuesto-A-260025-revision-0.pdf` generado (sin totales valorados).

---

### Caso 3: PDF `260472` → Presupuesto Aluminior `260026`

- **Cliente:** Cliente C (`00530`).
- **Cabecera:** Obra 3. Forma de pago en la prueba: `Efectivo`.
- **Líneas tecleadas:**
  1. **Ref. `1OFI` (Cdad. 4):** `1OFI` 750×2295 mm (fijo inf. 1000, cajón 185, hoja 1110), `ELEGANTPVC`, `L. BLANCO`, `COM009` (Rectobox lama aluminio térmica), `V420GS4`.
     - PDF: **923,48 €/ud** → **3.693,92 €** | Aluminior: **`sin valorar`** (*«la cota FI de 1OFI aún no dispone de despiece ni cálculo económico verificados»*).
     - La prueba no pudo poner otro vidrio en el fijo inferior desde el configurador principal, ni un mate + Guardian Sun en cámara 20. El código que sí existe se documenta en la sección 3.6; esta línea concreta de `1274` no está contrastada ahí.
  2. **Ref. `1O` (Cdad. 1):** `1O` 730×1080 mm, `ELEGANTPVC`, `L. BLANCO`, `V420GS4`.
     - PDF: **601,62 €** | Aluminior: **350,05 €**
  3. **Ref. `PSM001` (Cdad. 3):** artículo `(PS) MOSQUITERA ENROLLABLE` 745×1095 mm, `L. BLANCO`.
     - PDF: **71,80 €/ud** → **215,40 €** | Aluminior: **`sin valorar`** (*«el artículo requiere cálculo por m² pero la tarifa 1 no define fórmula de superficie»*).
  4. **Ref. `L4` (Cdad. 2):** `1O` 765×1235 mm + `COM009` (cajón 155), `ELEGANTPVC`, `L. BLANCO`, `V420GS4`. El rótulo de estancia del PDF no se conserva.
     - PDF: **697,27 €/ud** → **1.394,54 €** | Aluminior: **487,66 €/ud** → **975,32 €**
  5. **Ref. `2OFI` (Cdad. 1):** `2OFI` 1250×2295 mm (fijo inf. 1000) + `COM009` (cajón 185), `ELEGANTPVC`, `L. BLANCO`, `V416AL44GS` (acústico).
     - PDF: **1.432,36 €** | Aluminior: **1.179,60 €**
  6. **Ref. `GRUPO` (Cdad. 2):** ventanal 3 módulos (`600+1150+600 × 1400`) en PVC blanco (`0 + 0 + 0` con uniones `GMU003`), `V420GS4`, sin persianas en esa composición.
     - PDF: **2.921,29 €/ud** → **5.842,58 €** | Aluminior: **827,24 €/ud** → **1.654,48 €**
- **Totales:** PDF Base `13.180,42 €` (Total `15.948,31 €`) vs Aluminior `sin valorar` (suma parcial de líneas valoradas: `4.159,45 €`).
- **Emisión:** `presupuesto-A-260026-revision-0.pdf` generado.

---

### Caso 4: PDF `260487` → Presupuesto Aluminior `260023`

- **Cliente:** Cliente D (`00527`).
- **Cabecera:** Obra 4. Forma de pago en la prueba: `Efectivo`.
- **Líneas tecleadas (la sección 3.4 corrige L1 y L3):**
  1. **Ref. `1OFI` (Cdad. 2):** `1OFI` 900×1555 mm (fijo inf. 300), `ELEGANTPVC`, `L. BLANCO`, vidrio `V420CG4`. La prueba anotó que no existía `CARGLAS 4/20/GUARDIAN SUN 4`.
     - PDF: **814,50 €/ud** → **1.629,00 €** | Aluminior: **`sin valorar`** (*«la cota FI de 1OFI aún no dispone de despiece ni cálculo económico verificados»*).
  2. **Ref. `C2FI` (Cdad. 1):** `C2FI` 1150×1400 mm (fijo inf. 300), `GMC400`, `L. BLANCO`, `V484`.
     - PDF: **637,02 €** | Aluminior: **`sin valorar`** (mismo aviso `GM487`/`GM492` sin resolver y sin largo; 45 piezas, 3 sin coste). Esta línea no está en el contraste de la sección 3. El aviso no reabre la causa cerrada de la sección 4.
  3. **Ref. `1O` (Cdad. 1):** la prueba usó `1O` 650×2110 mm en `GMA50`, leyendo el texto comercial «serie V8000 de 45 instalada tabicando cajón», `L. BLANCO`, `V4124`.
     - PDF: **735,40 €** | Aluminior: **399,94 €** *(39 piezas, coste materiales 297,44 €)*.
- **Totales:** PDF Base `3.001,42 €` (Total `3.631,72 €`) vs Aluminior `sin valorar`.
- **Emisión:** `presupuesto-A-260023-revision-0.pdf` generado.

---

### Caso 5: PDF `260289` → Presupuesto Aluminior `260027`

- **Cliente:** Cliente E (`00531`). Identificador fiscal y dirección postal no se conservan.
- **Cabecera:** Obra 5. Forma de pago en la prueba: `Transferencia` *(PDF: `02-TRANSFERENCIA`)*.
- **Líneas tecleadas:**
  1. **Ref. `GRUPO` (Cdad. 1):** 4 módulos (`780+1440+1440+780 × 2220 mm`), montado como `1OFI + 2OFI + 2OFI + 1OFI` con uniones `GMU003` y compactos `COM009`, `ELEGANTPVC`, acabado `V · L. VARIOS (COLOR)` porque no encontró el literal «Burdeos», vidrio global `V420GS4`. La prueba anotó que no podía poner un laminar `3+3-18-GUARDIAN SUN 4` distinto en los fijos inferiores. El contraste solo acredita el acabado `VS` de este documento (sección 3.6); no acredita ni desmiente ese vidrio laminar.
     - PDF: **6.312,00 €** | Aluminior: **`sin valorar`** (bloqueado por incluir módulos `1OFI` con cota `FI` sin despiece verificado).
- **Totales:** PDF Base `6.312,00 €` (Total `7.637,52 €`) vs Aluminior `sin valorar`.
- **Emisión:** `presupuesto-A-260027-revision-0.pdf` generado (sin totales valorados).

---

### Caso 6: PDF `260465` → Presupuesto Aluminior `260028`

- **Cliente:** Cliente F. Identificador fiscal y dirección postal no se conservan. El código de cliente de la prueba no consta en esta auditoría.
- **Cabecera:** Obra 6. Forma de pago en la prueba: `Efectivo`.
- **Líneas tecleadas (16 líneas en `ELEGANTPVC` y `L · L. BLANCO`):**

| # | Ref. | Lo que tecleó la prueba | Medidas (mm) | Cdad. | Importe PDF | Importe Aluminior | Estado en la prueba |
|---|---|---|---|---|---|---|---|
| 1 | `V1` | `2O` + `COM009` motor | 1500 × 1255 | 1 | 1.017,09 € | 741,20 € | Valorado (avisos vidrio 28 mm) |
| 2 | `V2` | `GRUPO` (`1O` 750 + `0` 800 + `1O` 750) + `COM009` motor | 2300 × 1255 | 2 | 2.750,34 € | 2.542,62 € | Valorado (1.271,31 €/ud) |
| 3 | `V3` | `1O1FL` (hoja 540 + fijo 300) | 840 × 720 | 1 | 523,20 € | `sin valorar` | Falta variable `F` en fórmula `GM8783M`. No es la estructura guardada; ver sección 3.3 |
| 4 | `V4` | `2O` + `COM009` motor | 1220 × 1355 | 2 | 1.992,78 € | 1.714,38 € | Valorado (857,19 €/ud) |
| 5 | `ESCALERA` | `1` (abatible 1 hoja) | 830 × 460 | 1 | 446,41 € | 249,19 € | Valorado (avisos vidrio 28 mm) |
| 6 | `V6` | `2O` + `COM009` cinta | 1600 × 1355 | 1 | 928,68 € | 784,12 € | Valorado (avisos vidrio 28 mm) |
| 7 | `V7` | `1O` + `COM009` | 770 × 1355 | 1 | 647,32 € | 496,20 € | Valorado. Alto y horas corregidos en la sección 3.1 |
| 8 | `V8` | `1O` + `COM009` | 785 × 1255 | 1 | 641,66 € | 490,54 € | Valorado. Alto y horas corregidos en la sección 3.1 |
| 9 | `V10` | `1O` | 800 × 750 | 1 | 443,14 € | 313,06 € | Valorado. Vidrio y horas corregidos en la sección 3.1 |
| 10 | `V10` | `1O` (duplicada en el PDF) | 800 × 750 | 1 | 443,14 € | 313,06 € | Valorado (avisos vidrio 28 mm) |
| 11 | `V11` | `1O` | 800 × 1160 | 1 | 490,84 € | 360,76 € | Valorado (avisos vidrio 28 mm) |
| 12 | `ENTRADA` | `1PMA` + `PANHALGA` | 900 × 2100 | 1 | 1.439,15 € | 798,14 € | `Opc.Herraje` deshabilitado. No es la estructura guardada; ver sección 3.3 |
| 13 | `1P` | `1P` + `HU528` + `VL33I16L33M` | 750 × 2100 | 1 | 1.081,51 € | 560,73 € | Valorado (63 piezas, avisos vidrio 28 mm) |
| 14 | `ENTRADA` | `PSM001` | 1500 × 1130 | 1 | 146,49 € | `sin valorar` | La prueba lo trató como artículo sin fórmula de m² |
| 15 | `HABITACIONES` | `PSM001` | 1220 × 1200 | 2 | 265,74 € | `sin valorar` | La prueba lo trató como artículo sin fórmula de m² |
| 16 | `PSM004` | `PSM004` | 2245 × 1200 | 2 | 666,00 € | `sin valorar` | La prueba lo dio por fuera de tabla, sin precio manual |

- **Totales:** PDF Base `13.923,49 €` (Total `16.847,42 €`) vs Aluminior `sin valorar` (suma parcial de las 12 líneas valoradas: `9.364,00 €`).
- **Emisión:** `presupuesto-A-260028-revision-0.pdf` generado (HTTP 200).

---

## 3. Contraste verificado contra `aluminio.mdb` (14/11/2026, 12:13)

Fuente: copia de solo lectura `C:\Users\sergi\Desktop\MIX\aluminio.mdb`, cruce de `VPresupuestosLin` y `VDatosLinEstr` contra lo tecleado en la prueba. Esta unidad no ha reconsultado el fichero. No se versiona.

La copia contiene 5 de los 6 PDF. `260595` es minutos posterior y no está.

| PDF | `Id` / `nDoc` | En la copia |
|---|---|---|
| `260289` | `1083` | sí |
| `260465` | `1267` | sí |
| `260472` | `1274` | sí |
| `260487` | `1289` | sí |
| `260583` | `1391` | sí |
| `260595` | — | no |

`TipoColoc` está vacío en todas las filas de `VDatosLinEstr` leídas en ese contraste. No hay un selector automático de modalidad de instalación (`CON INSTALACIÓN`, `SIN ALBAÑILERIA`, `TABICANDO CAJON`) que explique los descuadres. Las horas de fabricación y de colocación que cambian el importe están tecleadas en la línea.

### 3.1. El descuadre de precios no es margen ni tarifa

El contraste descarta fallo de margen y fallo de tarifa en los dos descuadres que nombró: **-130,08 €** en una `1O` y **-151,12 €** en una `1O` + `COM009`. Esos dos importes son los de la prueba en `260465` (`Id 1267`):

- `V10`, `1O` 800×750: PDF `443,14 €` − prueba `313,06 €` = `130,08 €`.
- `V7`, `1O` + `COM009`: PDF `647,32 €` − prueba `496,20 €` = `151,12 €`. `V8` repite el mismo descuadre (`641,66 €` − `490,54 €`).

Lo que el operador guardó, y la prueba no:

- **`Lin 482318` (`V10`, `1O` 800×750).** Vidrio con argón `V420AGS4`: `85,37 €/m²` × `0,70 m²` = `59,76 €`. La prueba metió `V420GS4`: `71,00 €/m²` × `0,70 m²` = `49,70 €`. Diferencia de vidrio: **+10,06 €**. `HorasColoc = 4`. `MOCOL` se factura con un mínimo de 15 minutos: 4 horas son `240 + 15 = 255` min × `0,50 €` = **127,50 €**. Vidrio más colocación: `10,06 + 127,50 = 137,56 €`, por encima del descuadre de `130,08 €`. No es un fallo de margen.
- **`Lin 482142` y `Lin 482230` (`V7` / `V8`).** El operador metió la ventana de `1200` / `1100` mm y el cajón de `155` mm encima, con altos totales `1355` / `1255` mm, y `HorasColoc = 5`. La prueba restó el cajón al alto total y dejó las horas a `0`. El hueco de `151,12 €` se cierra igual: `300 + 15 = 315` min × `0,50 €` = **157,50 €**, más la diferencia de vidrio y la de alto del cajón.

El `-130,08 €` de la `1O` 630×640 de `260595` es de otro documento, ausente de esta copia; no se le aplican el vidrio ni las horas de `Lin 482318`.

### 3.2. `260583` (`Id 1391`): no es un `C2FI`

El operador no usó `C2FI`. Guardó un `GRUPO` (`Lin 523573`) de dos estructuras `C2` apiladas:

- `Lin 523576`: `C2` `1160 × 1389`
- `Lin 523577`: `C2` `1160 × 999`
- `Lin 523578`: unión `PSU001`

Serie `GMC400`, acabado `VS`, vidrio `V48AGS4`, `HorasColoc = 10` (`MOCOL` 1200 min para `Cdad = 2`).

La prueba configuró un `C2FI` 1160×2160 con `V484` y recibió el aviso `GM487`/`GM492`. Ese aviso sale de una estructura que el documento no tiene. No es una regla nueva de perfiles adicionales. `1389 + 999 = 2388`, que no es el `2160` leído en el PDF (`1230 + 930`); el contraste no explica esa diferencia de texto y no se inventa aquí una tercera medida.

### 3.3. `260465` (`Id 1267`): `V3` y la puerta no son las estructuras tecleadas

- **`Lin 481726` (la línea que la prueba llamó `V3`, 840×720).** El rótulo de obra del MDB no se conserva. El operador usó `1O` con `DisEspecificoSN = True` y `HorasColoc = 4`. No usó `1O1FL`. El `sin valorar` por la variable `F` de `GM8783M` es de la estructura equivocada.
- **`Lin 482520` (la línea que la prueba llamó `ENTRADA`).** El rótulo de obra del MDB no se conserva. El operador usó `1PCMA` `980 × 2100` con `PAN16`, `DisEspecificoSN = True`, `HorasAdFabr = 26,6` (`MO` 1596 min = `798,00 €`) y `HorasColoc = 8` (`MOCOL` 480 min = `240,00 €`). La prueba usó `1PMA` `900 × 2100` con `PANHALGA` y `Opc.Herraje` deshabilitado. Esas horas no son el total de la línea del PDF (`1.439,15 €`); queda material fuera de esta suma.

### 3.4. `260487` (`Id 1289`): el texto «V8000 DE 45» no es la serie

- **`Lin 492586` (`1O` 650×2110).** En `VDatosLinEstr` la serie es `GMA350`, el vidrio es `V48AGS4`, `DisEspecificoSN = True` y `HorasColoc = 9`. El operador editó el texto comercial a «SERIE V8000 DE 45». La prueba leyó ese texto como serie, configuró `GMA50` y vidrio `V4124`, y obtuvo `399,94 €` frente a `735,40 €`. No falta una serie `V8000` en el catálogo por esta línea.
- **`Lin 492419` (`1OFI` 900×1555, `Cdad = 2`, `814,50 €/ud`).** Sí es una `1OFI` estándar: `DisEspecificoSN = False`, serie `ELEGANTPVC`, vidrio `VM420AGS4`, `HorasColoc = 9`. La prueba la dejó `sin valorar` por el bloqueo de la cota `FI` y anotó un vidrio `V420CG4` que no es el guardado. Con el catálogo de despiece cargado ese bloqueo ya no aplica a esta línea (sección 5). No demuestra, por sí solo, las otras `1OFI` de `260472` ni el `GRUPO` de `260289`.

### 3.5. Mosquiteras `PSM001` y `PSM004` (`1267` y `1274`)

En Productor no entran como artículo suelto sin despiece. Se insertan como estructura: `EstructurasArticulos` tiene plantilla para `PSM001` y para `PSM004`.

`PSM001` se tarifa a `56,76 €/m²`, con mínimo `1,25 m²` = `70,95 €`, más un artículo `VARIOS` de cargo adicional en el despiece:

- `1274`, `Lin 485014`: cargo `0,85 €`. `70,95 + 0,85 = 71,80 €`, que es el unitario del PDF de `260472`.
- `1267`: cargo `50,00 €` en cada línea, con importes de línea `146,49 €`, `132,87 €`, `155,01 €` y `120,95 €`.

De esos cuatro importes, la tabla del PDF en la sección 2 solo muestra `146,49 €` (1500×1130) y `132,87 €` (unitario de 265,74 € / 2, medida 1220×1200). `155,01 €` y `120,95 €` no están en esa tabla de 16 líneas. No se reconcilian aquí con una línea del PDF que esta auditoría no transcribió.

`PSM004` `2245 × 1200` (`1267`, `Lin 485709`): la pieza `PSM004` queda a `0 €` porque excede la tabla. La línea padre tiene `PVPManualSN = True` y `Precio = 333,00 €`. Con `Cdad = 2`, `333,00 × 2 = 666,00 €`, que es el total de esa línea en el PDF. La prueba acertó al ver que la tabla no cubre la medida, y falló al no poder guardar el precio manual.

### 3.6. Acabados y vidrios que la prueba dio por inexistentes

- «Gris» (`1391`, `260583`) y «Burdeos» (`1083`, `260289`) no son códigos de acabado distintos. Los dos documentos usan `VS` (`LACADO VARIOS ESTANDAR`).
- Mate/Carglas + Guardian Sun sí tienen código en el catálogo: `VM420AGS4` y `V48AGS4`. La prueba los buscó como `V420CG4`, `V420GS4` o como un literal que no es el código. Eso no crea vidrios nuevos.
- No queda acreditado el laminar `3+3-18-GUARDIAN SUN 4` del `260289`. No se da por existente ni por ausente.

### 3.7. Qué no demuestra el contraste del MDB

- El contraste de 3.1–3.6 no revalora por sí solo las líneas dentro de Aluminior. La igualdad al céntimo, cuando existe, está en 3.8.
- No cubre `260595`.
- No demuestra una modalidad automática de instalación. `TipoColoc` vacío significa que esa columna no elige las horas.
- No es evidencia nueva para reabrir una causa cerrada. Ver sección 4. `Lin 492514` sigue en la causa cerrada `GM487`/`GM492`.

### 3.8. Valoración en `aluminior_real_test` (14/11/2026)

32 líneas de `banco.json` (`nDoc` `1083`, `1267`, `1274`, `1289`, `1391`): 29 `ESTRUCTURA` y 3 `GRUPO`. Servicio real (`ejecutarServicio` / `contrastarGrupos`) contra `127.0.0.1:55433`. Si `DisEspecificoSN`, la plantilla es la de `plantillas-documento.tsv`; el generador no hizo falta. Igualdad al céntimo: desviación `0`. Resultado: **18 coinciden / 3 difieren / 11 sin valorar**.

| `nDoc` | `Lin` | Caso | Modelo | `Precio` | Obtenido | Estado |
|---|---|---|---|---|---|---|
| `1267` | `481433` | `caso-02566` | `2O` | `1.017,09 €` | `1.017,09 €` | coincide |
| `1267` | `481559` | `caso-02567` | `1O+1F+1O` | `1.375,17 €` | `1.375,17 €` | coincide, con plantilla de documento |
| `1267` | `481726` | `caso-02568` | `1O` | `523,20 €` | `523,20 €` | coincide, con plantilla; sin ella `443,87 €` |
| `1267` | `481806` | `caso-02569` | `2O` | `996,39 €` | `996,39 €` | coincide |
| `1267` | `482016` | `caso-02575` | `2O` | `928,68 €` | `928,68 €` | coincide |
| `1267` | `482142` | `caso-02576` | `1O` | `647,32 €` | `647,32 €` | coincide |
| `1267` | `482230` | `caso-02577` | `1O` | `641,66 €` | `641,66 €` | coincide |
| `1267` | `482318` | `caso-02578` | `1O` | `443,14 €` | `443,14 €` | coincide |
| `1267` | `483829` | `caso-02581` | `1O` | `443,14 €` | `443,14 €` | coincide, con plantilla |
| `1267` | `483988` | `caso-02582` | `1O` | `490,84 €` | `490,84 €` | coincide, con plantilla |
| `1274` | `484829` | `caso-02587` | `1OFI` | `923,48 €` | `923,48 €` | coincide, con plantilla |
| `1274` | `484929` | `caso-02588` | `1O` | `601,62 €` | `601,62 €` | coincide |
| `1274` | `485018` | `caso-02590` | `1O` | `697,27 €` | `697,27 €` | coincide |
| `1274` | `485106` | `caso-02591` | `2OFI` | `1.432,36 €` | `1.432,36 €` | coincide, con plantilla; sin ella `1.343,77 €` |
| `1274` | `484811` | `caso-03038` | `GRUPO` | `2.921,29 €` | `2.921,29 €` | coincide |
| `1289` | `492419` | `caso-02644` | `1OFI` | `814,50 €` | `814,50 €` | coincide |
| `1289` | `492586` | `caso-02646` | `1O` | `735,40 €` | `735,40 €` | coincide, con plantilla |
| `1391` | `523573` | `caso-03066` | `GRUPO` | `899,21 €` | `899,21 €` | coincide |

Difieren, con la causa medida:

- `1267` `Lin 481932` (`caso-02574`, `1O`, `PVPManualSN` y `RespetarPrecioSN`). El `Precio` guardado es `446,41 €`. La suma de piezas del banco y el motor con plantilla de documento dan `438,83 €`. Sin plantilla, `426,90 €`. El servicio valora el despiece; no aplica el precio manual del padre. `PrecioVentaOriginal` está a `0`.
- `1267` `Lin 482520` (`caso-02579`, `1PCMA`). `Precio` y suma de piezas `1.439,15 €`; motor `1.439,17 €` con y sin plantilla. Dos filas `GM8787M` salen a `30,35 €` frente a `30,34 €` guardados. No es el herraje ni el diseño específico. No se abre regla nueva.
- `1267` `Lin 482583` (`caso-02580`, `1P`). Igual: `Precio` `1.081,51 €`, motor `1.081,53 €`. Al menos una fila `GM8787M` a `30,35 €` frente a `30,34 €`. El unitario queda a `+0,02 €`. No se abre regla nueva.

Sin valorar, con la causa medida:

- `1083` `Lin 406272` (`caso-02967`, `GRUPO`, `6.312,00 €`): `acabados-por-elemento-no-representables`. Sigue `sin-valorar`.
- `1289` `Lin 492514` (`caso-02645`, `C2FI`, `637,02 €`): importe incompleto por `GM487`/`GM492`, perfil adicional pendiente. Causa cerrada. No se reabre.
- `PSM001` (`1267` `Lin 484151`, `484159`, `488149`, `488153`, `488157`, `488161`, `488165`; `1274` `Lin 485014`) y `PSM004` (`1267` `Lin 485709`): el servicio de estructura para en `Indique Serie primero` (`entradas-incompletas`; el caso no trae familia `001`). `485709` tiene además `PVPManualSN`. Esta pasada no ejecuta el cargo `VARIOS` ni el precio manual; eso sigue siendo la lectura del MDB en 3.5, no un importe de este motor.

---

## 4. Qué vino de reconstruir el PDF a ciegas

| Documento | La prueba tecleó | El MDB guarda | Efecto en la prueba |
|---|---|---|---|
| `1267` `Lin 482318` | `V420GS4`, horas de colocación a `0` | `V420AGS4`, `HorasColoc = 4` | `1O` 800×750 a `313,06 €` en vez de `443,14 €` |
| `1267` `Lin 482142` / `482230` | cajón restado al alto total, horas a `0` | ventana `1200`/`1100` + cajón `155` encima, `HorasColoc = 5` | `1O` + `COM009` a `496,20 €` / `490,54 €` |
| `1391` `Lin 523573` | `C2FI`, vidrio `V484`, literal de color «Gris» | dos `C2` apiladas, unión `PSU001`, `V48AGS4`, acabado `VS`, `HorasColoc = 10` | `sin valorar` por `GM487`/`GM492` |
| `1267` `Lin 481726` | `1O1FL` 840×720 | `1O`, `DisEspecificoSN = True`, `HorasColoc = 4` | `sin valorar` por variable `F` |
| `1267` `Lin 482520` | `1PMA` `900 × 2100`, `PANHALGA` | `1PCMA` `980 × 2100`, `PAN16`, diseño específico, `HorasAdFabr = 26,6`, `HorasColoc = 8` | `798,14 €` frente a `1.439,15 €`, herraje deshabilitado |
| `1289` `Lin 492586` | serie `GMA50`, texto «V8000 DE 45» leído como serie, `V4124` | serie `GMA350`, texto comercial editado, `V48AGS4`, diseño específico, `HorasColoc = 9` | `399,94 €` frente a `735,40 €` |
| `1289` `Lin 492419` | `1OFI` bloqueada, vidrio `V420CG4` | `1OFI` estándar, `VM420AGS4`, `HorasColoc = 9` | `sin valorar` por cota `FI` |
| `1267` / `1274` mosquiteras | artículo sin m², o fuera de tabla sin precio manual | estructura con plantilla; `PSM001` a `56,76 €/m²` (mín. `1,25 m²`) más `VARIOS`; `PSM004` con `PVPManualSN` | `sin valorar` |
| `1391` y `1083` | acabados «Gris» y «Burdeos» inexistentes | acabado `VS` | acabado `V · L. VARIOS (COLOR)` por descarte |

No se reabren causas de [CAUSAS-CERRADAS.md](paridad/CAUSAS-CERRADAS.md):

- **`GM487` / `GM492` en un `C2FI`.** La fila cerrada es `DisIdPerAd` como selección de perfil adicional (cierre del 27/09/2026, incorporado el 13/10). Se reabriría solo con un caso en el que la medida de `GM487`/`GM492` se prediga desde plantilla y cotas antes de ver el importe histórico, y acierte en un caso no usado para derivar, o con documentación del algoritmo fuera del CHM. Reproducir un importe a posteriori no cuenta. El aviso de la prueba sale de un `C2FI` que `1391` no usa. Esta evidencia no cumple esa condición. No se retira la guarda de `cortes-referenciados.ts`.
- **Tubos de familia `112`.** La fila `accesorio-de-linea-no-representable` sigue cerrada sin regla (21/10/2026). Ninguna línea de este contraste es un tubo ni aporta el campo, la tabla o la observación que esa fila exige para reabrirse. No se amplía la lista blanca de familias.

Tampoco se convierte en trabajo el resto de hipótesis de la prueba que este contraste ya explica: margen, tarifa, selector automático de instalación, serie «V8000 DE 45» como serie ausente, literales «Gris» y «Burdeos» como acabados ausentes, y `V420CG4` como vidrio ausente cuando el código guardado es `VM420AGS4` o `V48AGS4`.

---

## 5. Trabajo de producto que sí se deriva

Solo estas cuatro piezas. Lo demás de las secciones 1 y 2 no se promociona a unidad. La propuesta anterior de log operativo no forma parte de este trabajo: no hace falta para explicar los descuadres ya leídos en el MDB.

1. **Ya resuelto en local (14/11/2026), no repetir.** Si la línea no trae el símbolo, el despiece usa `estructura_cotas.valor_por_defecto` cuando cabe en el hueco. La cota escrita gana. Sin fila no se inventa un número. Cubre el caso en el que una línea como `1O1FL` llega sin la cota `F`. No valora el `V3` de `1267` (`Lin 481726`): esa línea es un `1O` con `DisEspecificoSN = True`, no un `1O1FL`. El fijo de `1OFI` sigue saliendo solo de `fiMm`. El estado vigente está en [ESTADO-ACTUAL.md](ESTADO-ACTUAL.md).
2. **Resuelto en local (14/11/2026), no repetir.** `Lin 492419` (`nDoc 1289`) es una `1OFI` estándar (`DisEspecificoSN = False`, `ELEGANTPVC`, `900 × 1555`, `fiMm = 300`, vidrio `VM420AGS4`, `HorasColoc = 9`). Con el catálogo de despiece cargado (`FILA_CENTIMOS`), los materiales salen a `544,50 €` y la colocación a `540 min × 0,50 € = 270,00 €`. El unitario es `544,50 + 270,00 = 814,50 €`, idéntico al céntimo al `Precio` de esa línea (`Subtotal` `1.629,00 €` con `Cdad = 2`). `prepararLineaValorada` solo devuelve `FI_PENDIENTE` si la configuración trae `fiMm` y `catalogoDespieceCargado` es falso (`ESTRUCTURA_NUMBER_V1`). No cubre las otras `1OFI` de la prueba (`260472`, `260289`).
3. **Resuelto en local (14/11/2026) para la superficie y el precio manual; no repetir esa parte.** `PSM001`–`PSM003` (`M2`, familia `053`, `precioEnTabla = false`) se valoran por `metrajeSuperficie` y el PVP del acabado. Con `56,76 €/m²` y mínimo `1,25 m²`: `745 × 1095` → `70,95 €`, `1500 × 1130` → `96,49 €`, `1220 × 1200` → `82,87 €`. El alta de artículo y de mosquitera admite `precioUnitarioManual`: la línea queda con ese unitario, `pvpManual = true`, `valoracionCompleta = true` y sin aviso. El caso leído es `1267` `Lin 485709`, `PSM004` `2245 × 1200` a `333,00 €`. No entra el cargo `VARIOS` del despiece (`0,85 €` / `50,00 €`): sin él, el unitario de superficie no reproduce `71,80 €` ni `146,49 €`.
4. **Resuelto en local (14/11/2026) para herraje, etiquetas y la lectura repetida; no repetir esa parte.** `opcionesHerrajeDe` y `resolverOpcionesHerraje` consultan primero `herraje_conjuntos`. Si no hay fila, el respaldo es el catálogo de despiece (`estructura_plantilla_catalogo.tipo_hoja` + `tipos_hoja_catalogo` + `conjunto_parametros_despiece.herrajes`): `1PCMA` → `ELEGANTPVC+HU536` (tipo `4` / `t1HPCD` / `1HPC`; coincide con las 4/4 muestras de `VOpcionesHerraje` en `aluminio.mdb`) y `1PMA` → `ELEGANTPVC+HU528` (tipo `58` / `t1HAPD` / `1HAP`; `1PMA` tiene 0 líneas en `VPresupuestosLin`). La puerta de la prueba sigue siendo `1PCMA` con `PAN16` y horas tecleadas, no un `1PMA` con `PANHALGA`. `SelectorFormaPago` ofrece `01-CONTADO` y `02-TRANSFERENCIA`, como `FormasPago` del MDB y los PDF; un valor ya guardado distinto se conserva. `valorarCerramiento` reutiliza `leerCatalogoLinea` por origen dentro de esa llamada (misma estructura, serie, vidrio, tarifa, adicionales, guías y opción de acristalamiento; no si hay `plantillaPropia`) y suelta la caché al terminar. No cambia el motor de precio. El PDF de `260595` sigue sin estar en la copia.

---

## 6. Contraste por la web local, generando cada línea desde la app (16/11/2026)

Las secciones 3.8 y 5 miden el motor con lo que Productor guardó (acabado de accesorios, opciones y plantilla de diseño del documento). Esta sección mide otra cosa: lo que sale al teclear el presupuesto en la app (`web-local-real`, `127.0.0.1:3002`, base `aluminior_real_test` remontada ese día porque el contenedor es `tmpfs`; 541 estructuras, 17.547 artículos, 83.367 PVP). Entradas tomadas de `banco.json` de la copia del 13/11 (`nDoc` `1083`, `1267`, `1274`, `1289`, `1391`). El motor repetido ese día da lo mismo que 3.8. `260595` sigue sin estar en `aluminio.mdb` (último `Numero` `260592`).

Presupuestos locales de la prueba: `260001` (PDF `260487`), `260002` (`260583`), `260003` (`260472`), `260004` (`260465`), `260005` (`260595`). Sin datos de cliente. Se pierden al parar Docker.

Regla de entrada comprobada: con compacto, el alto del elemento es el total con cajón, como imprime el PDF (`750 × 2295`), no el de la ventana que guarda `VPresupuestosLin` (`2110`). Con `2110` sale `882,25 €`; con `2295`, `923,48 €`.

| PDF | Línea | PDF €/ud | App €/ud | Estado | Causa medida |
|---|---|---|---|---|---|
| `260487` | `1OFI` 900×1555 ×2 | 814,50 | 814,50 | coincide | |
| `260487` | `C2FI` 1150×1400 | 637,02 | sin valorar | sin valorar | `GM487`/`GM492`, causa cerrada |
| `260487` | `1O` `GMA350` 650×2110 | 735,40 | 735,40 | coincide | la mano de hoja del diseño específico no cambia el precio |
| `260583` | `GRUPO` 2 × `C2` + `PSU001` ×2 | 899,21 | 899,21 | coincide | total `2.176,09 €` igual al PDF |
| `260472` | `1OFI` + `COM009` 750×2295 ×4 | 923,48 | 923,48 | coincide | |
| `260472` | `1O` 730×1080 | 601,62 | 592,66 | difiere −8,96 | acabado de accesorios: documento `UNI`, app `L` |
| `260472` | `PSM001` 745×1095 ×3 | 71,80 | 70,95 | difiere −0,85 | cargo `VARIOS` del despiece |
| `260472` | `1O` + `COM009` 765×1235 ×2 | 697,27 | 697,27 | coincide | |
| `260472` | `2OFI` + `COM009` 1250×2295, vidrio propio en el fijo | 1.432,36 | 1.441,35 | difiere +8,99 | el editor guarda el travesaño a cota fija 300 y pierde `FI = 1000` |
| `260472` | `GRUPO` `1OFI`+`2OFI`+`1OFI` ×2 | 2.921,29 | 2.848,06 | difiere −73,23 | herraje del módulo `2OFI` |
| `260465` | `2O` + `COM009` 1500×1255 | 1.017,09 | 1.031,36 | difiere +14,27 | acabado de accesorios: documento `L`, app `UNI` |
| `260465` | `1O+1F+1O` + `COM009` 2300×1255 ×2 | 1.375,17 | 1.387,16 | difiere +11,99 | sin aislar; lleva compacto (accesorios en `UNI`) y diseño específico |
| `260465` | `1O` 840×720 con travesaño `VD` a 300 | 523,20 | 523,20 | coincide | dibujada con `Diseño específico` en la app |
| `260465` | `2O` + `COM009` 1250×1355 ×2 | 996,39 | 1.010,66 | difiere +14,27 | acabado de accesorios |
| `260465` | `1O` `GMA350` 830×460 (precio manual) | 446,41 | no creada | sin valorar | sin PVP manual en cerramiento ni `TipoHoja` 21 en el editor |
| `260465` | `2O` + `COM009` 1520×1355 | 928,68 | 942,95 | difiere +14,27 | acabado de accesorios |
| `260465` | `1O` + `COM009` 770×1355 | 647,32 | 656,28 | difiere +8,96 | acabado de accesorios |
| `260465` | `1O` + `COM009` 785×1255 | 641,66 | 650,62 | difiere +8,96 | acabado de accesorios |
| `260465` | `1O` 800×750 (dos líneas) | 443,14 | 443,14 | coincide | |
| `260465` | `1O` 800×1160 | 490,84 | 490,84 | coincide | |
| `260465` | `1PCMA` 980×2100 | 1.439,15 | no creada | sin valorar | «No hay una ventana con el código 1PCMA» |
| `260465` | `1P` 750×2100 | 1.081,51 | 1.081,53 | difiere +0,02 | fila `GM8787M`, ya descrita en 3.8 |
| `260465` | `PSM001` 1500×1130 | 146,49 | 96,49 | difiere −50,00 | cargo `VARIOS` |
| `260465` | `PSM001` 1220×1200 ×2 | 132,87 | 82,87 | difiere −50,00 | cargo `VARIOS` |
| `260465` | `PSM004` 2245×1200 ×2 | 333,00 | 333,00 | coincide | PVP manual |
| `260289` | `GRUPO` 4 módulos | 6.312,00 | no creada | sin valorar | acabados por elemento, más el fallo del editor en `2OFI` |
| `260595` | `1O` 630×640 | 420,69 | 420,69 | coincide | entradas deducidas: `V420AGS4` y 4 h de colocación |
| `260595` | `GRUPO` con suplementos | 2.733,56 | no creada | sin valorar | sin datos del documento |

Recuento sobre las 29 líneas de los PDF: **11 coinciden / 13 difieren / 5 sin valorar o no creables**. Solo `260583` cuadra en total.

### 6.1. Causas, con su prueba

1. **Acabado de accesorios (`Acabado2`).** La app no lo pregunta. `prepararLineaValorada` usa `L` si es una estructura sola sin compacto en `L`, y `UNI` en lo demás. En `1274` el operador tenía `UNI` en una `1O` sola; en `1267` tenía `L` con compacto. Cinco herrajes (`GM5376`, `GM5310`, `GM5311`, `GM5302`, `GM5307`) cambian de precio entre `L` y `UNI`: suman `8,96 €` en una hoja y `14,27 €` en dos. En `banco.json`, de las líneas no `GRUPO` en `L`, 632 llevan `L/L` y 210 `L/UNI`.
2. **Cargo `VARIOS` en mosquiteras.** `0,85 €` en `1274` y `50,00 €` en `1267`. El alta de mosquitera no tiene dónde ponerlo; solo el PVP manual.
3. **Editor `Diseño específico` y cota variable.** `sembrarDisenoPropioModulo` solo conserva la cota variable en `1OFI`. En `2OFI` siembra desde la plantilla visual: travesaño `tipoCota = 2`, `cota = 300`, aunque la línea lleve `cotas.FI = 1000`. Guardado así, el vidrio del fijo sale `231,5 × 1164` (Productor `931,5 × 1164`) y las hojas `1634,9` (Productor `934,9`). El total se parece al PDF por casualidad.
4. **Herraje del `2OFI` dentro de un `GRUPO`.** Los dos `1OFI` (`583,33 €` con su compacto) y las dos `PSU006` (`191,20 €`) coinciden. El `2OFI` sale `759,00 €` frente a `685,85 + 146,38 = 832,23 €`. La diferencia son unidades de herraje de la segunda hoja (`GM5300`, `GM5301`, `GM5302`, `GM5303`, `GM5307`, `GM5310`, `GM5311`, `GM5334`, `GM5335`, `GM5347`, `GM5376`…). Productor no guarda opciones en esos elementos. Sin regla derivada todavía.
5. **`1PCMA` fuera del escaparate.** El motor la valora (3.8); la web no la deja elegir.
6. **Sin PVP manual en una línea de cerramiento** y sin `TipoHoja` 21 en el editor (`Lin 481932`).

No se ha cambiado código en esta pasada.

## 7. Arreglo posterior (16/11/2026, local, sin publicar)

La medición de la sección 6 no se repite aquí. Con regla demostrada se ha cambiado el alta, no el motor de precio:

- `Aca. Acc.` se pregunta. Vacío conserva la deducción (`L` en estructura sola sin compacto y acabado `L`; `UNI` en lo demás). El código elegido se guarda en el snapshot.
- El editor siembra `FI`/`FS` como cota variable. Una vertical de catálogo sigue fija: no hay símbolo demostrado.
- El cargo `VARIOS` lo teclea el operador. No se inserta `0,85 €` solo: 13 de 197 `PSM001` no lo llevan, y `50 €` no está en la tarifa.
- `1PCMA` se elige por código. No se dibuja: el tipo de hoja `4` no tiene apertura verificada. El marco muestra el código, no una hoja inventada.
- El cerramiento admite PVP manual en el alta.

Sin regla, y por eso sin cambio: herraje del `2OFI` en un `GRUPO`, `GM487`/`GM492`, `+0,02 €` de `GM8787M`, línea 2 del `260595` y acabados distintos por elemento del `260289`. Render no se ha tocado.

## 8. Verificación en Render tras `c171717` (16/11/2026, noche)

Presupuesto temporal `260029` («PRUEBA CLAUDE - BORRAR») en `https://aluminior.onrender.com`, tecleado desde la web con las entradas de `banco.json` (copia del 13/11). Borrado después por SQL (una fila, cascada a líneas); la numeración vuelve a `260028`.

| Línea | PDF €/ud | Render €/ud | Estado |
|---|---|---|---|
| `1O` 730×1080, `VM420AGS4`, Aca. Acc. `UNI` | 601,62 | 601,62 | coincide (antes 592,66) |
| `2O` + `COM009` 1500×1255, Aca. Acc. `L` | 1.017,09 | 1.017,09 | coincide (antes 1.031,36) |
| `2OFI` + `COM009` 1250×2295, `FI = 1000`, diseño específico con `VGS418AL33M` en el fijo | 1.432,36 | 1.432,36 | coincide (antes 1.441,35); sin diseño específico 1.343,77 |
| `1PCMA` 980×2100 `PAN16` | 1.439,15 | 1.439,17 | +0,02, fila `GM8787M` ya conocida |
| `1O` `GMA350` 830×460 con PVP manual | 446,41 | 446,41 | coincide |
| `PSM001` 745×1095 ×3 + VARIOS 0,85 | 71,80 | 71,80 | coincide |
| `PSM001` 1500×1130 + VARIOS 50 | 146,49 | 146,49 | coincide |

Hallazgos de interfaz:

- `PVP manual` y `Aca. Acc.` del alta de cerramiento se conservaban tras aceptar una línea, y la siguiente ventana heredaba el precio manual. Corregido en local el mismo día: los dos campos se reinician con cada alta aceptada; serie, vidrio, acabado y horas se conservan como antes. Sin verificar en navegador hasta publicar.

Sin corregir:

- Al elegir `1PCMA` por código, el diálogo «Añadir ventana» sigue abierto con «Sin modelos con ese código» aunque el elemento se añade.
- En el lienzo, la `2OFI` con `FI = 1000` sin diseño específico dibuja el fijo a la cota de plantilla (rótulo «FIJO INFERIOR 300»); el despiece sí usa 1000.
- Los presupuestos `260023`–`260028` de producción se crearon antes de cargar el catálogo de despiece y conservan «sin valorar». No se recalculan solos; hay que reeditar o recrear sus líneas.
