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

## Medición del banco — 20/10/2026

Sergio autoriza levantar la base local y medir. Postgres efímero en
`127.0.0.1:55433/aluminior_real_test` (tmpfs, `packages/db/docker-compose.yml`),
catálogo exportado de la copia autorizada `EMP0016/Anterior.mdb`, SHA-256
`e8518386…23721a0`, con `mdb-reader` en solo lectura. Sin clientes, proveedores,
obras ni documentos; ninguna escritura fuera de ese contenedor.

| Medición | Antes (03/10, `e2b0232`) | Ahora (`2f0d452`) |
|---|---:|---:|
| Líneas elegibles iguales | 400/523 (76,48 %) | 407/523 (77,82 %) |
| GRUPO iguales | 23/45 (51,11 %) | 30/45 (66,67 %) |
| GRUPO sin valorar | 17 | 9 |
| Líneas con `serie-de-union-no-representable` | 11 | 0 |

Control determinista: con el cambio revertido, la misma base y el mismo catálogo,
la guarda de no regresión del propio banco aborta la medición con
«Regresión: 7 líneas antes iguales; identidades: caso-01989, caso-02023,
caso-02046, caso-02048, caso-02071, caso-02106, caso-02110». Esas siete son las
que el cambio gana; sus uniones son `GMU038`, `GMU040` y `PSU001` entre
`GMC400`, `GMA350` y `GMA60RL`, y coinciden al céntimo salvo `caso-02106`, que
queda en 1.217,85 frente a 1.217,86 esperados y entra como igual por el umbral
del banco.

El resto de GRUPO con unión de otra serie no cambia de estado: 37 de los 167
GRUPO llevan al menos una, pero la mayoría ya estaba excluida antes del servicio
por diseño específico o entradas incompletas, y dos siguen bloqueadas por
variantes de vidrio y por resolución de componentes y herrajes.

El informe del banco se ha regenerado con estas cifras; se conservan su nota de
documento fechado y el apartado histórico «Avance E1 — 04/10/2026» que el
generador no reescribe. La base local es efímera: se pierde al parar Docker.

## Límite

No se ha abierto Productor: sin la mochila USB no arranca, así que la
comparación lateral del mismo GRUPO en el original sigue pendiente. La medición
sólo acredita coincidencia numérica con el histórico de la copia, no aceptación
comercial. Las causas `coste-de-articulo`, `acabado-de-articulo`,
`pvp-o-tarifa` y `pieza-ausente` que acompañan a las siete líneas ganadas
siguen abiertas y no las resuelve esta entrega.
