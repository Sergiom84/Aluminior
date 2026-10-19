# E2 — Unión material de otra serie en GRUPO

19/10/2026. Unidad local, sin ejecutar Productor y sin mochila de licencia.
Toda la evidencia procede del volcado privado `export_datos/EMP0016` leído en
solo lectura; los datos no se versionan y el detalle queda en
`output/e2-union-serie-20261019/` (ignorado por Git).

## Qué bloqueaba

El banco de contraste excluía la línea con la causa
`serie-de-union-no-representable` (11 líneas, 20.214,40 € de precio esperado
agregado, ninguna con importe calculado) porque el servicio web sólo admitía
una serie por cerramiento: `valorarCerramiento` recibía `serieCodigo` general y
las uniones no podían llevar la suya.

## Evidencia reconstruida

| Hecho | Fuente | Qué no demuestra |
|---|---|---|
| La familia `103` de `Estructuras` tiene 52 uniones con `UnionGrosor` y `UnionTipo` propios; el catálogo visual de Aluminior conserva las 14 realmente usadas | `Estructuras.csv` | Que las 38 restantes deban añadirse: ninguna aparece en documentos |
| En presupuestos sólo se usan `PSU001`, `U`, `PSU006`, `GMU038`, `GMU040`, `GMU039` y `PSU008` (585 filas de unión en 247 cerramientos) | `VCerramientosLin.csv` | Cobertura de albaranes o facturas |
| 39 GRUPO de presupuesto tienen al menos una unión cuya serie no es la del primer módulo; los pares observados van de `GMA350 → GMC400` (19) a `GMPC65 → GMA65OPT` (1) | `VCerramientosLin` + `VDatosLinEstr` (Familia `001`) | Que el subgrupo de ocho de la iteración 13 sea exactamente este conjunto: el banco aplica además sus propias exclusiones |
| La receta de esas uniones nombra el artículo directamente —`GMU038 → GM60X60` más `MO`, `PSU001 → PSH100` más `MO`— sin subestructura ni resolución por componente | `EstructurasArticulos.csv` | Que ninguna unión del catálogo dependa de la serie: sólo se comprueba en las usadas |
| Caso observado: GRUPO con módulos `GMA350` y unión `GMU038` de serie `GMC400`, 60 mm de grosor y 2440 mm, produce una pieza `GM60X60` de 2440 mm, acabado `L`, 10,03 € | línea de presupuesto y sus hijas | El importe no se ha recalculado con el motor: hace falta la base cargada |

## Cambio entregado

La unión guarda su serie como excepción, igual que ya hacía el módulo:

- `UnionCerramiento.materiales.serieCodigo`, sólo en v3, validado con
  `materialesUnionValidos` (rechaza `vidrioCodigo`, vacíos y minúsculas).
- `origenesGeometriaCerramiento` ordena módulos y uniones y resuelve sus
  materiales efectivos; la unión nunca hereda el vidrio general.
- El banco de contraste traslada la serie de la línea de unión a la
  configuración y sólo excluye si esa serie no llegó a la configuración.

No cambia la receta de ninguna unión, ni el redondeo, ni los importes de una
unión cuya serie coincide con la general, ni se sustituye por `U` una unión no
representable.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| `packages/core` completo | 968 pruebas correctas, incluidas las cuatro nuevas de serie propia de la unión |
| Pruebas puras de `packages/web` sin el `globalSetup` SQL | 607 correctas, 5 omitidas; falla sólo `galce-vidrio.test.ts`, que declara contrastar contra PostgreSQL y no tiene base |
| Banco de contraste con `tsx --test` | 24 correctas, incluidas las dos nuevas de geometría |
| Controles negativos | Ignorando la serie de la unión caen las dos pruebas de valoración; sin trasladarla en el banco cae la de geometría |
| Tipos y arquitectura | `npm run typecheck` en los cuatro paquetes, `tsc -p scripts/tsconfig.banco-contraste.json` y 0 infracciones de modularidad |

## Límite

Queda por medir: ejecutar el banco con la base cargada para confirmar que las
líneas excluidas pasan a valorarse y con qué importe. Esa ejecución necesita
base de datos local con el volcado real y autorización propia; no se ha hecho
aquí. Tampoco se ha abierto Productor: sin la mochila USB no arranca.
