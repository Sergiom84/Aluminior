# RECON — El CONFIGURADOR paramétrico (¿puede Aluminior generar el despiece?)

> **Para:** Fable, en local (Windows, con acceso a las MDB originales).
> **De:** sesión Claude Code actuando de arquitecto. Fecha: 2026-07-31.
> **Origen:** vídeo del uso real de Productor por Javi (11:17, un presupuesto completo
> de principio a fin). Cambia el diagnóstico de dónde está el producto.
> **Decisión del titular (Sergio), ya tomada:** Aluminior debe **sustituir** a
> `C:\Users\sergi\Desktop\Productor`, no complementarlo.
>
> **Esto NO es exploración libre.** Es una caza acotada con criterio go/no-go escrito
> ANTES de empezar. Si te desvías, para y anótalo.

Antes de nada: lee `CONTINUACION.md` entero y las reglas 1–9 de `PROMPT-FABLE.md`.
Este documento asume T.24–T.60 conocidos y **corrige dos afirmaciones** (§0.2).

---

## 0. Por qué existe este documento

### 0.1 Lo que enseñó el vídeo

Javi hace un presupuesto entero en 11 minutos (10:02→10:13). El reparto del tiempo:

| Tramo | Qué hace | Tiempo |
|---|---|---|
| 00:00–02:00 | Cabecera: `Nombre: FRAN`, `Obra: CERRAMIENTO`, sin cliente dado de alta | ~2 min |
| 02:00–08:30 | **Diseñador de Cerramientos V2.1**: compone 12 módulos, asigna serie, vidrio, uniones, cotas | **~6,5 min** |
| 08:30–09:20 | Descripción, cantidad, horas adicionales → Aceptar | ~1 min |
| 09:20–11:17 | Emitir PDF y enviar por Gmail | ~2 min |

Resultado: **una sola línea** `GRUPO`, cdad 1, 6.900 × 1.020 mm, 3.868,19 € (4.680,51 €
con IVA). Y un PDF de una página con el dibujo.

**El producto es el configurador.** Todo lo demás (cabecera, PDF, correo) es envoltorio.
Un cerramiento es **una entidad compuesta que se vende como una línea**, no como doce
artículos.

### 0.2 Correcciones (regla 6)

Dos cosas que esta misma sesión afirmó y son **falsas**; quedan corregidas aquí para que
no se persigan:

1. **`MOConceptos` NO tiene curva de mano de obra por ancho/alto.** El esquema de
   `ConfigDisTablas.csv` declara `AnchoMayorMM`, `AnchoTiempo`, `AltoMayorMM`… pero
   **T.32 ya midió que esas columnas están a 0 filas**: la fórmula real es plana
   (`nº módulos × TiempoFabr × 0,5 €/min`). `MOConceptos.csv` en disco lo confirma:
   solo tiene `Codigo;CodSerie;Descripcion;TiempoFabr`. **Vía muerta, no reabrir.**
2. **`InfoSeries.mdb` no es la fuente del despiece.** T.38 lo agotó: es catálogo de
   metadatos (`SerSeries`, `SerBibliotecas`, `SerSeriesCE`). PLAN.md:3330 ya dejó dicho
   dónde vive la BOM: **en los `.mdb` de biblioteca por serie**. No reabrir los 375 MB.

### 0.3 Lo que sí es nuevo, y no es tan nuevo

El anexo **A.4 de `PLAN.md`** ya identificó las **bibliotecas de series** como "la
dependencia estratégica más importante", y **C.5** ya escribió la frase exacta: *"sin la
biblioteca de series, el configurador no tiene datos"*. Eso se sabía desde el principio
del proyecto y luego el foco se fue a reconstruir precios del histórico.

Lo genuinamente nuevo es **dónde están** esas bibliotecas, y que están en disco:

| Fichero | Tamaño | Fecha | Qué es (hipótesis a verificar) |
|---|---|---|---|
| `ImpexpGM.mdb` | **77,8 MB** | oct-2023 | Biblioteca de series **GM** en formato de transferencia. `GM` es el prefijo de todo el catálogo real (`GM4735`, `GMA65OPT`, `GMPC135ME`, `ELEGANTPVC`…). |
| `impexpES.mdb` | 22,7 MB | nov-2022 | Segunda biblioteca (¿otro extrusor / plantilla base?) |
| `ImpexImportar.csv` | 3,3 KB | — | **El manifiesto**: qué tablas componen una biblioteca de series y cómo se filtran/enlazan al importar. |
| `alSeriesListaComp.csv` | 5,1 KB | — | **La gramática de composición**: por tipo de serie, los roles de perfil de cada elemento. |
| `AluSeries.mdb` | 360 KB | **ene-2026** | Vivo. Índice/estado de series instaladas. |
| `aluMode.mdb` | 50,4 MB | feb-2025 | Sin caracterizar. |

Ninguno de los cuatro primeros aparece citado en ningún anexo de `PLAN.md` ni en
`CONTINUACION.md`. **No se han abierto nunca.**

`ImpexImportar.csv` es el hallazgo que ordena todo lo demás, porque lista literalmente las
tablas de una biblioteca: `Conjuntos`, `ConjuntosAsoc`, `ConfigSeries`, `ConfigSeriesAsoc`,
`ConfigSeriesCotas`, `ConfigSeriesHerraje`, `ConfigSeriesOPC`, `Articulos`, `ArticulosLB`,
`Acabados`… Es decir: **exactamente las tablas que T.40–T.47 tuvieron que reconstruir a
mano desde el export de EMP0016**, pero en su forma de fábrica y para el catálogo completo,
no solo para las 57 series que Aluminios Lara usa.

Y `alSeriesListaComp.csv` declara la descomposición paramétrica:

```
TipoSerie;DescrFunción;lstGenericos;perAdicionales;Cotas.Prefijo;Cotas.lstSufijos;...
A,M;Marco Pequeño;perMS,perMI,perML;MP;AbatMP_;A,B,C,D;...
A,M;Hoja Pequeña;perHAS,perHAI,perHAIZ,perHADE;HABAT;AbatHP_;J,J...
```

Traducido: "un marco pequeño se compone de perfil superior, inferior y lateral, y sus cotas
se leen con el prefijo `AbatMP_` y sufijos A/B/C/D". Eso es la mitad de un generador de
despiece. La otra mitad son las cotas y los rebajes, que ya tienes medidos (T.10: 64 reglas,
93,0% cobertura, techo 94,4%).

### 0.4 La distinción que lo cambia todo

- **T.24–T.59 = arqueología.** Dado un presupuesto histórico, reconstruir su importe.
  Techo real medido: **70,5% del € cliente a ±1%**, limitado por **datos** (el ajuste manual
  del comercial no está persistido — T.58). Ese techo es correcto y no se sube midiendo más.
- **Este documento = generación.** Dada una geometría nueva, producir despiece + precio.
  **Es otro problema, con otro corpus, y ese corpus no se ha evaluado.**

El techo del 70,5% **no se hereda**. Puede ser mejor o peor; hay que medirlo.

---

## 1. El objetivo exacto (una frase)

Determinar si, a partir de las **bibliotecas de serie en disco**, Aluminior puede
**generar** el despiece completo (perfiles con cotas + asociados + vidrio + MO) de una
estructura nueva, con precisión suficiente para fabricar — o si esa capacidad vive dentro
del binario de GAIA y no en los datos.

**Lo que NO es el objetivo** (no te distraigas):

- Más precio del histórico (frente cerrado, T.59).
- Más recuento sobre el export de EMP0016 (agotado, T.51–T.54).
- Construir UI de configurador. **Nada de UI en esta fase.**
- Reabrir `InfoSeries.mdb` ni la curva de MO (§0.2).

---

## 2. Fases

Cuatro fases, secuenciales, con una **puerta de decisión al final de cada una**. Si una
puerta da NO-GO, **para y reporta al titular** (regla 7). No encadenes.

Coste estimado: F1 medio día · F2 1 día · F3 1–2 días · F4 medio día.
**Ninguna fase escribe en ninguna base de datos.**

### FASE 1 — Inventario de la biblioteca (¿existe el dato?)

**Pregunta:** ¿`ImpexpGM.mdb` contiene, poblada, la estructura que declara
`ImpexImportar.csv`?

1. Copiar `ImpexpGM.mdb` a `%TEMP%` (regla de entorno: **solo lectura sobre copia**,
   nunca el original). Helper: `%TEMP%\aluminior_explore\leer-mdb.ps1` (PowerShell 32-bit
   + ODBC Access; ACE OLEDB **no** está en este portátil — memoria `leer-mdb-portatil`).
2. Listar tablas con recuento de filas. Contrastar contra las ~40 tablas de
   `ImpexImportar.csv`.
3. Perfilar las cinco críticas: `Conjuntos`, `ConjuntosAsoc`, `ConfigSeries`,
   `ConfigSeriesCotas`, `EstructurasArticulos` (o su equivalente).
4. Repetir en corto sobre `impexpES.mdb` y `aluMode.mdb` solo para clasificarlas.

**PUERTA 1 — GO si:** las tablas existen y están **pobladas**, y contienen series que no
están en el export de EMP0016 (prueba de que es catálogo de fábrica y no una copia de lo
que ya tienes).
**NO-GO si:** vacías o son un subconjunto de EMP0016 → la biblioteca real viaja aparte
(la instala GAIA) y **el eje pasa a ser comercial, no técnico** (§5).

### FASE 2 — La gramática de composición (¿se puede leer el despiece?)

**Pregunta:** ¿`alSeriesListaComp.csv` + las tablas de F1 describen la descomposición
completa de una estructura en perfiles con sus cotas?

1. Parsear `alSeriesListaComp.csv` (`;`, cabecera con puntos en los nombres, encoding
   latin-1 — ojo con las `ñ`). Modelar: `TipoSerie → rol → [genéricos] + prefijo/sufijos de cota`.
2. Cruzar con `ConfigSeriesCotas` de F1: ¿cada `Cotas.Prefijo + sufijo` tiene una fórmula
   de cota declarada por serie?
3. Elegir **UNA estructura y una sola**: **ventana abatible de dos hojas, una
   oscilobatiente, serie `ELEGANTPVC` (PVC Elegant Infinity), 1.200 × 1.020 mm**. Es
   literalmente el módulo que Javi repite en el vídeo y la serie con más oráculo.
4. Recorrer a mano (papel, no código todavía) la cadena completa para esa estructura:
   estructura → roles → genéricos → perfiles reales (vía `ConjuntosLin`, ya conocido) →
   fórmula de cota → medida.

**PUERTA 2 — GO si:** la cadena se recorre entera sin ningún salto que haya que rellenar
con una suposición tuya. **Un solo eslabón inventado = NO-GO** (regla 8: si eliges tú el
emparejamiento, fabricas el dato que luego mides).

### FASE 3 — La prueba decisiva (¿acierta?)

**Pregunta:** el despiece generado, ¿coincide con el real?

1. Escribir `scripts/medir-configurador.mjs`. Entrada: serie + tipo de estructura + ancho
   + alto. Salida: lista de piezas `(artículo, cota, cantidad)`.
2. **Oráculo:** las líneas históricas de EMP0016 de esa misma (serie, topología) que **sí
   tienen árbol de diseño** (`VDatosLinDetDis`) — el 13,5% del universo (T.54). Enlaza por
   id exacto, **jamás por proximidad de medida** (regla 8; ha fallado 3 veces en este
   proyecto: S.7.2, T.6, T.15).
3. Aplicar el rebaje de hoja ya medido (T.10, `OpcionesDespiece.rebajeDeHoja`). No lo
   reimplementes.
4. Métricas, las tres separadas y sin mezclar:
   - **% de piezas** con artículo correcto.
   - **% de piezas** con cota correcta a ±1 mm.
   - **% de estructuras completas** exactas (la única que importa de verdad: una hoja
     de corte con una pieza mal es una hoja de corte mal).
5. Control de trivialidad (regla 9): comprobar que la muestra abarca **medidas distintas**.
   Si todas las observaciones comparten cota, no has medido nada.

**PUERTA 3 — el criterio, escrito ANTES de ver el número:**

| Estructuras completas exactas | Lectura | Qué se hace |
|---:|---|---|
| **≥ 90%** | GO fuerte | El configurador es viable para fabricar. Se planifica en serio (§4). |
| **60–90%** | GO condicionado | Viable para **presupuestar**, no para cortar. Se construye con la guarda de siempre: pieza sin regla → sin medida → línea "sin valorar" (regla 3). |
| **< 60%** | NO-GO | Las reglas de cota viven en el binario. Cae al plan B (§5). |

### FASE 4 — Verificación adversarial

Antes de dar por bueno cualquier GO, el arquitecto (o un segundo agente) intenta
**refutarlo**, con estas tres preguntas concretas:

1. ¿El acierto viene de la biblioteca, o de que el script está mirando el oráculo?
   Prueba: **held-out por serie** — entrenar/derivar con una serie, medir en otra.
2. ¿La muestra es trivial (regla 9)? ¿Cuántas medidas **distintas** hay realmente?
3. ¿Cuántas de las estructuras "exactas" tienen 1 sola pieza? Recontar excluyéndolas.

Este proyecto tiene un historial de señales preciosas que se evaporaban al verificarlas
(T.37: 83,2% → 48,7% real; T.50: el `+9` era suerte del split). **Da por hecho que el
primer número es optimista.**

---

## 3. Riesgos y casos límite

| # | Riesgo | Probabilidad | Mitigación |
|---|---|---|---|
| R1 | La biblioteca en disco es un **instalador vacío**, no el catálogo poblado | Media | Es justo lo que resuelve la Puerta 1. Barato de descartar. |
| R2 | Las cotas dependen de reglas de **galce/solape/herraje** que no están tabuladas | **Alta** | Es la causa más probable de un NO-GO. Fase 3 lo cuantifica en vez de opinarlo. |
| R3 | Medir sobre el 13,5% de líneas con árbol **sesga** el resultado al alza | Media | Reportar siempre la cobertura del oráculo junto al %. Nunca dar el % a secas. |
| R4 | La serie `ELEGANTPVC` es el caso **más fácil** (más oráculo) | Alta | Por eso F4 exige held-out en una segunda serie antes de declarar GO. |
| R5 | Ampliar el alcance a "sustituir Productor entero" | Alta | El alcance de esta fase es **una estructura**. Nada más. |
| R6 | Tocar la MDB activa o escribir en Supabase | Baja pero **grave** | Solo lectura sobre copia. Cero `npm run etl`. Cero `--apply`. |
| R7 | Datos personales en el repo | Media | Regla 4: barrer NIF/emails/móviles antes de cada commit. El vídeo enseñó direcciones reales de cliente: **no transcribirlas a ningún documento**. |

---

## 4. Si sale GO: qué viene después (no ejecutar aún)

Orden propuesto, para que la decisión de alcance se tome con el número delante:

1. **Motor de composición**: encadenar N estructuras en un cerramiento con sus uniones
   (`CM.038 TUBO 60x60`, `PS.0001 UNIÓN PARA COMPACTOS 100mm` — vistos en el vídeo).
2. **Precio**: Σ del despiece contra la máquina de tarifa ya construida (T.55–T.59). Aquí
   sí se hereda todo el trabajo hecho, y es donde encaja el `--apply` de la tarifa 2026.
3. **Descripción automática**: el texto que genera Productor es determinista y se ve entero
   en el vídeo. Es plantilla, no IA.
4. **Entrada manual del comercial**: horas adicionales de fabricación y colocación. Es el
   input humano que T.58 identificó como no reconstruible; **hacia delante deja de ser un
   problema, porque lo teclea el usuario**.
5. **UI del configurador**: lo último. Y con la advertencia de siempre — Cormorant Garamond
   + JetBrains Mono, sin emojis, sin microcopy explicativo, responsive y accesible.

**Alcance que yo recomiendo declarar en voz alta desde ya:** Aluminior sustituye
**presupuestación + configurador**. Productor además hace compras, fabricación, hojas de
corte, control de obra, horas de trabajador, facturación y los informes de 16 ejercicios.
Sustituirlo entero es un proyecto de años; esto es un proyecto acotado y es el que le quita
el tiempo a Javi. Conviene fijar la línea ahora, no a mitad.

---

## 5. Si sale NO-GO: el plan B (que no es un consuelo)

Configurador **comercial**: dibuja el cerramiento, genera la descripción y lo valora por
tipología / m² a partir del histórico propio (2.071 líneas, 468 presupuestos del ejercicio),
sin pretender generar la hoja de corte. Presupuesta y vende; no fabrica.

Y el eje pasa a ser **comercial**: la biblioteca de series es un producto que los extrusores
(Alugom, Exlabesa, Extrual, Itesal, Strugal — sus `CEeit_*.csv` están en la misma carpeta)
distribuyen a los fabricantes de software del sector. Conseguirla por la vía legítima
convierte el NO-GO técnico en un GO comercial. Esa gestión es del titular, no de la IA.

---

## 6. Aviso de licencia (para el titular, no para la IA)

Hasta ahora se leían **datos de Aluminios Lara**. Este plan lee el **catálogo de series y la
configuración de diseño**, que probablemente son de GAIA o de los extrusores, no tuyos. Es
una lectura distinta de "sala limpia".

No es un impedimento técnico y no bloquea la Fase 1 (leer para decidir no es redistribuir).
Pero conviene mirar el contrato de licencia **antes de que el configurador exista**, no
después. Si los datos de serie resultan ser del extrusor y no de GAIA, hay una vía limpia
para obtenerlos, y eso cambiaría el planteamiento entero a mejor.

**Sigue vigente:** no descompilar ensamblados de GAIA, no tocar la mochila HASP/UniKey, no
construir facturación legal (VeriFactu).

---

## 7. Reglas vigentes (recordatorio)

1. Mide toda hipótesis contra el oráculo **antes** de construir.
2. Ejecuta lo que escribes; compilar no es funcionar.
3. Nunca inventes un valor: falta → "sin valorar", nunca cero, nunca una cota supuesta.
4. Cero datos personales en el repo.
6. Corrige los errores **explícitamente** en `PLAN.md` (§0.2 de este documento ya lo hace).
7. Di lo que no sabes y **para**.
8. Desconfía de todo emparejamiento que hayas inventado tú. Enlaza por `VDatosLinDetDis`
   exacto, nunca por proximidad de medida.
9. Un grupo "estable" cuyas observaciones comparten la misma medida no demuestra nada.

**Entorno:** Supabase **solo lectura**. MDB **solo lectura sobre copia**, nunca
`aluminio.mdb` activa. PowerShell 32-bit + ODBC (ACE OLEDB no instalado). Commits pequeños
a `main`; cada fase, un anexo **T.61+** en `PLAN.md`.

---

## 8. Entregable de esta caza

Un anexo **T.61** en `PLAN.md` que responda, con números y no con opiniones:

1. ¿Existe la biblioteca de series en disco, poblada? (Puerta 1)
2. ¿Se puede leer la descomposición estructura → perfiles → cotas sin inventar ningún
   eslabón? (Puerta 2)
3. ¿Con qué precisión reproduce el despiece real, en las tres métricas separadas, con la
   cobertura del oráculo declarada al lado? (Puerta 3)
4. ¿Sobrevive el número a la verificación adversarial? (Fase 4)
5. GO / GO condicionado / NO-GO, y por tanto: ¿existe Aluminior como sustituto de Productor?

Con eso el titular decide si esto es un proyecto de meses o un cambio de rumbo. Es una
prueba de días que decide un proyecto de meses: no la alargues, y no la conviertas en
construcción antes de tener el número.
