# RECON — Fuente de despiece POR UNIDAD FÍSICA (camino b)

> **Para:** Claude Code en local (Windows, con acceso a las MDB del sistema original).
> **De:** sesión Cowork (nube) actuando de arquitecto. Fecha: 2026-07-22.
> **Decisión del titular (Sergio):** tomada. Se elige el **camino (b)** — buscar/adquirir
> una fuente con despiece por unidad física antes de conceder que el techo es (a).
> **Este documento NO es exploración libre.** Es una lista de caza acotada con criterio
> go/no-go. Si te desvías a otra cosa, para y anótalo.

Antes de nada: lee `CONTINUACION.md` entero (punto de arranque) y las reglas de
`PROMPT-FABLE.md`. Este documento asume T.24–T.52 ya conocidos.

---

## 0. Qué se ha hecho en la nube (para que no lo repitas)

La sesión de nube NO tiene acceso a las MDB (corre en Linux, sin PowerShell/ODBC ni la
BD Supabase). Lo que sí hizo, sobre copia de solo lectura del export CSV de `EMP0016`:

1. **Reprodujo T.48 de forma independiente** (`medir-topo-sustituido.mjs`), match limpio y
   determinista: `exactasCdad` 0 (v5 puro) → **40/216** techo in-sample, **20/34 held-out**,
   modo estructural puro 0. Anexo **T.52**. El anexo T.48 es fiel.
2. **Rastreó el propio export** buscando el despiece por unidad. Confirmado que **NO está**:
   - `VDespunteDetalle` (3.852 filas): despiece de **barras de perfil** con coste
     (`LargoBarra`, `CantidadBarras`, `CosteBarras`, `CostePerfiles`), enlazado por
     `TipoDoc/nDoc/nLinea`. Es per-barra de PERFIL, y está **a medio poblar** (el
     optimizador no corrió en muchos presupuestos: `LargoBarra=0`). No toca herraje/escuadra.
   - `VConceptosMO` (24.158 filas, 53 conceptos, enlace `TipoDoc/nDoc/nLin`): es el
     **oráculo de MO por concepto** (probablemente ya lo consume T.45). No es despiece de
     unidad física.
   - `VDatosLinDetDis` (41.610 filas): el árbol de diseño por componente, el **enlace exacto**
     (regla 8). T.49/T.51 ya lo agotaron para el tramo (verificado adversarialmente): expone
     conteos AGREGADOS por artículo/línea, no la asignación por hoja.

**Conclusión:** el dato que cierra el residuo no está en el export. De ahí esta caza en la MDB.

---

## 1. El objetivo exacto (qué buscas, en una frase)

Una tabla del sistema Productor que registre, **por unidad física** (por hoja / por pieza
fabricada), **qué artículo concreto de herraje/tramo se asignó** — y que sea **enlazable a
`VDatosLinDetDis`** (por `nLinId`, o por `TipoDoc/nDoc/nLinea` + `DisIdHoja`/`DisNHoja`).

Concretamente debe permitir separar los dos residuos que hoy son bloqueo por datos:

- **(R1) Tramo del oscilobatiente (T.49/T.51).** Familias `GM53xx` (cremona/compás/cerradero).
  El problema son **51 pares de contención con AMBOS artículos reales** (p.ej. `GM5334`[796-1545]
  contiene a `GM5335`[996-1495]) que **ningún dato oracle-observable separa**: misma medida
  (1045) → contenedor en una línea de 1 hoja, contenido en una de 2 hojas. El separador real
  es la asignación medida→tramo POR HOJA. Cerrar esto sube el conjunto-exacto del oscilobatiente
  de **72 → 152** líneas (T.49).
- **(R2) Escuadra residual `GM4710` (T.50).** No topológica ("una tabla, no una ecuación").
  Necesita el conteo de escuadra por unidad, no el agregado por línea.

Si una tabla resuelve (R1), casi seguro sirve también para (R2): ambas son "reparto de un
agregado de línea entre las unidades físicas".

**Lo que NO es el objetivo** (no te distraigas): más precios (Tarifa/GM está a 2022, T.32),
más metadatos de serie (`InfoSeries.mdb` agotado, T.38), ni pulir el recuento actual (agotado).

---

## 2. Dónde cazar (fuentes, por orden de probabilidad)

Todo **SOLO LECTURA sobre COPIA**, nunca `aluminio.mdb` activa. Helper listo:
`%TEMP%\aluminior_explore\leer-mdb.ps1` (PowerShell 32-bit + ODBC Access).

1. **`EMP0016\Anterior.mdb`** (copia estática del ejercicio en curso) — primera parada. Es la
   MISMA empresa/ejercicio que el export, así que cualquier tabla de fabricación enlaza directo
   con las líneas que ya medimos.
2. **La app de producción**: el módulo de **fabricación / hoja de corte / optimización** es
   donde vive el despiece por pieza. Busca tablas cuyo nombre contenga (case-insensitive):
   `Despiece`, `Fabri`, `Orden`, `Corte`, `Opti`, `Barr`, `Pieza`, `Unidad`, `Herraje`,
   `Mecaniz`, `Parte`, `Prod`, `LB` (lista de barras). El export solo trajo las **vistas `V*`**
   (`VDespunteDetalle`, `VOpti*`); las **tablas base** de esas vistas suelen tener más grano.
3. **`ConfigDis.mdb`** (catálogo global) — ya usado en T.51 para cotas; revisar solo si aparece
   una tabla de asignación no vista.
4. **Otros ejercicios** `EMP00xx\Anterior.mdb` (15 previos, misma empresa) — solo si (1) da con
   la tabla y necesitas más muestra; ojo, el esquema pudo variar entre años.

---

## 3. Método (paso a paso)

1. **Listar tablas** de `Anterior.mdb`:
   `leer-mdb.ps1 -Mdb "<copia Anterior.mdb>" -Columns "*"` (o el modo que liste nombres de tabla).
   Filtra por los patrones de §2.2. Anota candidatas con su recuento de filas.
2. **Perfilar cada candidata**: `-Query "SELECT TOP 20 * FROM <tabla>"`. Busca columnas que
   huelan a unidad física: un id de hoja/pieza (`IdHoja`, `NHoja`, `nPieza`, `Unidad`, `DisId*`),
   un artículo de herraje (`GM53xx`, `GM4710`), y un enlace a documento/línea
   (`TipoDoc/nDoc/nLinea` o `nLinId`).
3. **Test decisivo del enlace** (regla 8, NO por proximidad de medida — regla 8/8 de FABLE):
   ¿puedes unir esa tabla a `VDatosLinDetDis` por un id exacto? Si el único "enlace" es la
   medida, **no vale** (fabricaría el dato, ha pasado 3 veces en este proyecto).
4. **Test del discriminante (R1)**: coge los **51 pares co-reales** que `cazar-discriminante-
   tramo.mjs` ya identifica. Para cada par, ¿la tabla candidata dice qué hoja lleva `GM5334`
   y cuál `GM5335`? Si separa la mayoría → tienes la fuente.
5. **NO construyas encima todavía.** Mide primero (regla 1). Manda a la nube el volcado de la
   tabla candidata (CSV) para verificación independiente contra el oráculo antes de integrar.

---

## 4. Criterio GO / NO-GO (esto es lo que decide el camino b)

**GO — la fuente existe:** hay una tabla PERSISTIDA que (i) es por unidad física, (ii) enlaza
por id exacto a `VDatosLinDetDis`, y (iii) separa ≥ la mayoría de los 51 pares co-reales.
→ Entonces sí hay camino (b): planifica **export + ETL de esa tabla** e intégrala en el recuento
(sube el techo 72→~152 en oscilobatiente y desbloquea `GM4710`). Documenta como anexo T.53+.

**NO-GO — el dato se calcula y se tira:** Productor computa la asignación tramo→hoja al generar
la hoja de corte y **no la persiste** en ninguna tabla. Es el desenlace más probable según T.51.
→ Entonces el techo por datos es real y se **cae al plan (a)**, que ya es defendible:

> **Plan (a), fallback:** conectar la valoración SOLO a las series/estructuras recurrentes donde
> el recuento topológico reconstruye (las ~20/216 líneas verificadas hoy, T.48, que generalizan),
> y mantener el resto en **"sin valorar" honesto** (regla 3, nunca cero). Es la primera vez que
> esto es defendible con números. No requiere datos nuevos.

En ambos casos, **para y reporta al titular** con el hallazgo (regla 7). No conviertas un NO-GO
en meses de pulido del recuento: está agotado.

---

## 5. Reglas vigentes (recordatorio, de PROMPT-FABLE.md)

- Mide toda hipótesis contra el oráculo **antes** de construir (regla 1). Ejecuta lo que
  escribes (regla 2). Nunca inventes un valor; falta → "sin valorar", no cero (regla 3).
- Enlaza por `VDatosLinDetDis` **exacto**, nunca por proximidad de medida (regla 8). Si dos
  piezas son intercambiables y eliges tú el emparejamiento, has fabricado el dato.
- Corrige errores explícitamente en `PLAN.md`, no los borres (regla 6). Di lo que no sabes y
  para (regla 7). Barre datos personales antes de cada commit (regla 4).
- Entorno: Supabase **solo lectura**, nunca `npm run etl` de escritura no consentida; MDB solo
  lectura sobre copia (PowerShell 32-bit + ODBC).

---

## 6. Reparto de trabajo nube ↔ local

- **Local (tú):** todo lo que toque MDB/PowerShell/ODBC y Supabase — §2, §3, §4. Es tu terreno.
- **Nube (la otra sesión):** verificación independiente contra el oráculo CSV, medición de
  frentes que salen del export, y redacción/curado de anexos. Si encuentras una tabla candidata,
  **exporta esa tabla a CSV y pásala** para que la nube la mida contra las 51 líneas co-reales
  sin sesgo (segunda cabeza, regla de verificación del modo arquitecto).
- Punto de sincronía: `PLAN.md` (anexos) y `CONTINUACION.md`. El anexo **T.52** ya recoge el
  estado desde el que arrancas.
