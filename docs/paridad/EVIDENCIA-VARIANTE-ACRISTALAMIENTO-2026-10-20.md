# Variante de acristalamiento por rango de la serie

20/10/2026. Unidad local, sin ejecutar Productor y sin mochila de licencia.
Evidencia del volcado privado `EMP0016` en solo lectura; el detalle queda en
`output/e6-variantes-vidrio-20261020/`, ignorado por Git.

## Qué bloqueaba

El banco de contraste descartaba un GRUPO con
`variantes-de-vidrio-por-elemento-no-representables` cuando sus elementos no
compartían variante de acristalamiento. Para decidirla usaba un atajo —la marca
`DAcrisSN` del artículo— que no es la regla del motor.

El motor aplica el rango de grosor de la serie (`Conjuntos.CorrGrosorVid`,
`grosorMaximoSimple`) sobre el grosor del vidrio (`Articulos.TamJunqGoma`) y
solo recurre a la marca cuando la serie no declara rango
(`packages/core/src/despiece/linea-catalogo/diseno.ts`, CHM 5.1.2.12.3.2).

## Evidencia reconstruida

| Hecho | Fuente | Qué no demuestra |
|---|---|---|
| De los 167 GRUPO con vidrio, 35 mezclan variante según la marca y solo 2 según el rango de la serie | `banco.json` + `Articulos.csv` + `Conjuntos.csv` | Que los otros 33 sean correctos en importe: siguen con sus propias causas |
| Las dos reglas discrepan en 48 GRUPO | el mismo análisis | Que la discrepancia cambie el importe en todos: la mayoría ya estaba excluida |
| Caso típico: serie `ELEGANTPVC` con rango simple 9 mm; `PAN16` mide 16 mm sin marca de doble y `V420AGS4` mide 28 mm con marca. Por rango ambos son variante 2; por marca quedaban separados | `Conjuntos.CorrGrosorVid`, `Articulos.TamJunqGoma`, `Articulos.DAcrisSN` | Que la receta de la variante 2 sea correcta: eso lo mide el banco, no esta regla |
| Los 2 GRUPO que sí mezclan variante por rango (`caso-01960`, `caso-01961`) ya estaban excluidos por entradas incompletas | `banco.json` | Que una mezcla real sea representable: sigue bloqueada |

## Cambio entregado

- `varianteSegunGrosor` en `packages/core/src/despiece/linea-catalogo/diseno.ts`:
  la misma regla, con los datos explícitos, para quien no tiene el catálogo
  cargado. `varianteAcristalamiento` delega en ella y no cambia de conducta.
- `variantesPorElemento` en `scripts/lib/banco-contraste/acristalamiento.ts`:
  calcula la variante por elemento con esa regla; el servicio del banco solo
  lee los datos y la llama, y conserva el bloqueo cuando la mezcla es real.

No cambia ninguna receta, ni el redondeo, ni la valoración de una línea que ya
se valoraba, ni se traduce la alternativa de acristalamiento (`nTAcris` 2–5),
que sigue sin mapeo demostrado.

## Medición

Misma base efímera y misma copia autorizada que la unidad E2 (`Anterior.mdb`,
SHA-256 `e8518386…23721a0`).

| Medición | Antes (`49632c7`) | Ahora |
|---|---:|---:|
| Líneas elegibles iguales | 407/523 (77,82 %) | 410/523 (78,39 %) |
| GRUPO iguales | 30/45 | 33/45 |
| GRUPO sin valorar | 9 | 5 |
| Líneas con `variantes-de-vidrio-por-elemento-no-representables` | 4 | 0 |

Control determinista: restaurado el atajo de la marca, con la misma base, la
guarda de no regresión del banco aborta con «Regresión: 3 líneas antes iguales;
identidades: caso-01991, caso-02067, caso-02107». El cuarto caso que estaba
bloqueado, `caso-01965`, pasa a valorarse pero queda en *cercano*
(1.935,82 frente a 1.921,85 esperados) por causas de coste, acabado y tarifa
que esta unidad no toca.

Verificación: 972 pruebas de core —cuatro nuevas de la regla—, 607 puras de web
sin el `globalSetup` SQL (falla solo `galce-vidrio.test.ts`, que declara
contrastar contra PostgreSQL y no tiene base), 28 del banco con `tsx --test`
—cuatro nuevas—, tipos de los cuatro paquetes, `tsc` del banco y cero
infracciones de arquitectura.

## Límite

La comparación lateral en Productor sigue pendiente: sin la mochila USB no
arranca. La regla se ha contrastado con el catálogo y el histórico de la copia,
no con el original en ejecución. Las alternativas de acristalamiento 2–5 y la
mezcla real de variantes dentro de un mismo GRUPO siguen bloqueadas.
