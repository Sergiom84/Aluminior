# Aluminior — Punto de continuación (2026-07-21)

Documento de arranque para retomar el proyecto sin perder tiempo buscando. Lee
esto PRIMERO; luego, solo si necesitas profundizar, ve a `PLAN.md`.

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

- `InfoSeries.mdb` (375 MB) — catálogo maestro de series.
- `ConfigDis.mdb` — config de diseño: `MOConceptos` (mano de obra), `ConfigSeriesApertDesc`
  (semántica de `AperturaTH`), `ConfigSeriesHerraje`, `DiseñoConfigV2`.
- `EMP00xx/aluminio.mdb` (ACTIVA, NO abrir) + `EMP00xx/Anterior.mdb` (copia estática, sí).

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

## 2. Estado actual (arco T.24–T.32)

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

**Convergencia:** valorar una línea, la MO de fabricación y las cantidades de
asociados **desembocan todas en el RECUENTO** — un algoritmo del configurador
(cuántas escuadras/juntas/módulos por estructura), reconstruible desde el árbol
`EstructurasDiseño`, no un dato almacenado.

---

## 3. Qué hacer, en orden

1. **EL RECUENTO (crux).** Medir si la geometría de `EstructurasDiseño` (huecos,
   hojas, esquinas) reconstruye las cantidades de escuadras/juntas/módulos mejor que
   el conteo por aparición de ranura (el predictor v5, que falla las cantidades).
   Roza los anexos S.1–S.9 — leerlos antes. Es medición → modelado, no solo medición.
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
