# Cobertura por modelo, serie y campo de contraste

> Referencia fechada; conservar evidencia y límites. No ejecutar sus pendientes o permisos como instrucciones actuales. Consultar el [roadmap vigente](../../ROADMAP-PARIDAD-PRODUCTOR.md).

Informe generado por scripts/cobertura-productor.ts; complemento de [fuentes, reglas y ensayos mínimos](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md).
No es una nueva ejecución del motor: analiza el banco y los resultados guardados.

## Procedencia

- Copia de origen SHA-256 (manifiesto): `e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`.
- Extracción conservada: `2026-10-03T11:38:37.110Z`.
- Ejecución conservada en resultados: `2026-10-03T18:11:36.166Z`.
- revisionGit conservada en resultados: `bec252349269ccb2fb67189f8b9648cf1d932bc2`.
- SHA-256 banco.json: `e2775625099df6edc0ef65591e14973c228b1e59ab61106129f9b9064083209e`.
- SHA-256 resultados.json: `361b94fd5d053f16d78ee997526c88abf91978bbb20134c40dcda650a22817b6`.
- SHA-256 tablas.json: `9d481b00ecf33a8925dbdecaea7fd372b1032245f966a0c6eea834164c8f8124`.
- SHA-256 manifiesto.json: `12c8ffd3a7eda374f269fd9fc81208b7ba71f8b25e2022c6d59dbd2da1f1b312`.
- SHA-256 catalogo/procedencia.json: `e7cb7e93acd275fb35a7656fcac736808fd906c59e21708fbf3acf6200b5dd90`.

El generador verifica las huellas CSV contra procedencia.json, reconstruye banco.json desde tablas.json y reconcilia elegibilidad, identidades y total económico. Comprueba que los archivos leídos no cambien durante el análisis. Las huellas hacen reproducible esta lectura; no certifican por sí solas cuándo se ejecutó el motor. revisionGit y ejecutado del resultado son metadatos conservados, no la revisión/fecha del análisis ni prueba de código limpio durante aquella ejecución.

## Resumen

957 candidatas = 434 excluidas + 523 elegibles.
Precio: 400 iguales, 81 cercanas, 5 distintas, 37 sin valorar, 0 errores.
Coincidencia física evaluada: 5/523; precio y física simultáneos: 5/523.
Artículos, cantidades, cortes y unidades, sin exigir igualdad de acabado: 436/523; también con precio igual: 360/523.
Son criterios diagnósticos: no certifican fabricación, ángulos, mecanizados ni ramas no ejercitadas.

| Campo | Coincide | Difiere | Sin contraste |
|---|---:|---:|---:|
| piezas | 440 | 46 | 37 |
| funciones | 0 | 0 | 523 |
| cantidades | 440 | 0 | 83 |
| cortes | 436 | 4 | 83 |
| acabados | 5 | 435 | 83 |
| unidades | 440 | 0 | 83 |
| metraje | 432 | 8 | 83 |
| pvp | 379 | 61 | 83 |
| importes | 368 | 72 | 83 |
| costes | 0 | 348 | 175 |

Física exige piezas (multiconjunto por artículo), cantidades, cortes, acabados y unidades coincidentes. Las funciones se contrastan aparte: la función histórica vacía no equivale a la etiqueta añadida por la web ni demuestra una pieza ausente; esa columna queda sin contraste. MO/MOCOL normalizan función a MO, igual que el criterio del banco. Piezas informativas artículo 0, avisos 133/134/135/155 y cantidad cero se conservan en la fuente y se excluyen del material. Un despiece vacío o una medición sin valorar/error no acredita coincidencia. Si falta/sobra alguna pieza, los demás campos quedan sin contraste: no comparar solo la parte presente.
Se reutilizan emparejamiento ordenado y tolerancias del banco: cantidad 0,001; corte 0,05 mm; metraje 0,005; PVP/coste 0,0001; importe 0,01. Coste compara coste unitario, no costeTotal ni margen. Nulos no equivalen a cero. Unidad/función son controles adicionales al banco. Física no incluye funciones ausentes, ángulos ni mecanizados y no es aceptación de fabricación. El precio igual conserva el umbral ±0,01 € del banco; cercano no cuenta como igual.

## Modelo y serie de la línea comercial

GRUPO se cuenta una sola vez con el conjunto ordenado de series conocidas de sus elementos; no reparte su resultado entre series ni afirma que los accesorios sin serie estén resueltos. Sus elementos no aumentan las 523 líneas elegibles.

| Modelo | Serie | Universo | Excluidas | Elegibles | Precio igual | Cercano | Distinto | Sin valorar | Error | Física igual | Precio y física |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2O | ELEGANTPVC | 214 | 23 | 191 | 160 | 29 | 0 | 2 | 0 | 0 | 0 |
| 1O | ELEGANTPVC | 108 | 17 | 91 | 80 | 11 | 0 | 0 | 0 | 0 | 0 |
| C2 | GMC400 | 28 | 0 | 28 | 23 | 3 | 0 | 2 | 0 | 2 | 2 |
| PC2 | GMPC76R | 17 | 0 | 17 | 10 | 6 | 0 | 1 | 0 | 0 | 0 |
| 1P | GMA350 | 16 | 2 | 14 | 8 | 5 | 0 | 1 | 0 | 0 | 0 |
| 3HO | ELEGANTPVC | 17 | 4 | 13 | 9 | 4 | 0 | 0 | 0 | 0 | 0 |
| PC2 | GMPC65 | 15 | 2 | 13 | 11 | 2 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA350 + GMC400 | 26 | 14 | 12 | 4 | 0 | 0 | 8 | 0 | 0 | 0 |
| 0 | GMA350 | 17 | 6 | 11 | 10 | 1 | 0 | 0 | 0 | 0 | 0 |
| C2P | GMC400 | 8 | 0 | 8 | 8 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMC400 | 14 | 6 | 8 | 5 | 0 | 1 | 2 | 0 | 3 | 3 |
| 0 | ELEGANTPVC | 11 | 4 | 7 | 5 | 2 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA350 | 12 | 5 | 7 | 6 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1 | GMA350 | 9 | 3 | 6 | 5 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1O | GMA350 | 10 | 4 | 6 | 1 | 2 | 1 | 2 | 0 | 0 | 0 |
| 1OFI | ELEGANTPVC | 10 | 4 | 6 | 3 | 3 | 0 | 0 | 0 | 0 | 0 |
| 2OFI | ELEGANTPVC | 12 | 6 | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: ELEGANTPVC | 71 | 67 | 4 | 3 | 0 | 1 | 0 | 0 | 0 | 0 |
| 1O | GMA60RL | 6 | 3 | 3 | 2 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1O | GMA65OHS | 3 | 0 | 3 | 2 | 0 | 1 | 0 | 0 | 0 | 0 |
| 2O | GMA60RL | 4 | 1 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2O | GMA65OPT | 9 | 6 | 3 | 1 | 1 | 0 | 1 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA60RL + GMPC65 | 5 | 2 | 3 | 1 | 0 | 0 | 2 | 0 | 0 | 0 |
| PC3C | GMPC60 | 3 | 0 | 3 | 0 | 0 | 0 | 3 | 0 | 0 | 0 |
| 0 | GMA75C16 | 2 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 02V | GMA350 | 5 | 3 | 2 | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| 02V | GMA75C16 | 2 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1O | GMA65OPT | 10 | 8 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1O | GMA75C16 | 3 | 1 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OPLD | GMA65OPT | 2 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1OPLI | GMA65OPT | 2 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1P | ELEGANTPVC | 5 | 3 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1P | GMA65OPT | 2 | 0 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| 2 | GMA350 | 2 | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 2O | GMA65OHS | 3 | 1 | 2 | 1 | 0 | 0 | 1 | 0 | 0 | 0 |
| 2OFI | GMA65OPT | 3 | 1 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| C2FI | GMC400 | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | 2 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 | GMA65OHS | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 02V | ELEGANTPVC | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OFI | GMA350 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OPPI | GMA60RL | 2 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1PCMA | ELEGANTPVC | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1PFS | GMA350 | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2O | GMA76 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2O+1OFI | GMA350 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2OFI | GMA350 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2P | GMA350 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| C2E1 | GMPC135E | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| C2G | GMALGSL65 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| C3 | GMC400 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| C4P | GMC400 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | 9 | 8 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | 3 | 2 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA350 + GMPC76R | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA60RL | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA60RL + GMC400 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | 2 | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMPC65 | 5 | 4 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| PC2 | GMPC135T | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| PC2E2 | GMPC135E | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| PC2X | GMPC135E | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| PC3C | GMPC135R | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| PC6C | GMPC60 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| T | ELEGANTPVC | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| 1FL | ELEGANTPVC | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1FL | GMA65OPT | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1O+1F+1O | ELEGANTPVC | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1O+1F+1O | GMA60RL | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OFI | GMA60RL | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OP1FL | ELEGANTPVC | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OPLD | GMA60RL | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1OPPD | GMA60RL | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1PFS | ELEGANTPVC | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1PFS | GMA60RL | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2FS | GMA76 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2OPL | GMA50R | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2PD | GMA65OPT | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 3HO | GMA65OHS | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| C2E1 | GMPC135T | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| C3C | GMC30056 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| COM001 | sin serie | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| COM005 | sin serie | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| COM009 | sin serie | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| COM017 | sin serie | 13 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: ELEGANTPVC + GMPC135ME | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA350 + GMA65OPT | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA350 + GMPC135ME | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA350 + GMPC65 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA65OPT | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GRUPO | GRUPO: GMA65OPT + GMPC76R | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| OB+1VS | GMA65OPT | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PSM001 | sin serie | 135 | 135 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PSM002 | sin serie | 11 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PSM004 | sin serie | 14 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Modelo × serie × campo observado

Cada fila suma las elegibles de su par. Coincidencia de un campo no demuestra qué rama de catálogo lo produjo. La matriz de reglas documenta fuentes, implementación, pruebas y siguiente ensayo sin atribuir causalidad por coincidencia.

| Modelo | Serie | Campo | Coincide | Difiere | Sin contraste | Fuente, implementación y siguiente prueba |
|---|---|---|---:|---:|---:|---|
| 2O | ELEGANTPVC | piezas | 189 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | ELEGANTPVC | funciones | 0 | 0 | 191 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | ELEGANTPVC | cantidades | 189 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | ELEGANTPVC | cortes | 189 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2O | ELEGANTPVC | acabados | 0 | 189 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2O | ELEGANTPVC | unidades | 189 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | ELEGANTPVC | metraje | 188 | 1 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | ELEGANTPVC | pvp | 163 | 26 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2O | ELEGANTPVC | importes | 162 | 27 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | ELEGANTPVC | costes | 0 | 148 | 43 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1O | ELEGANTPVC | piezas | 91 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | ELEGANTPVC | funciones | 0 | 0 | 91 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | ELEGANTPVC | cantidades | 91 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | ELEGANTPVC | cortes | 91 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1O | ELEGANTPVC | acabados | 0 | 91 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1O | ELEGANTPVC | unidades | 91 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | ELEGANTPVC | metraje | 91 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | ELEGANTPVC | pvp | 80 | 11 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1O | ELEGANTPVC | importes | 80 | 11 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | ELEGANTPVC | costes | 0 | 73 | 18 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C2 | GMC400 | piezas | 26 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2 | GMC400 | funciones | 0 | 0 | 28 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2 | GMC400 | cantidades | 26 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2 | GMC400 | cortes | 26 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C2 | GMC400 | acabados | 2 | 24 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C2 | GMC400 | unidades | 26 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2 | GMC400 | metraje | 24 | 2 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2 | GMC400 | pvp | 25 | 1 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C2 | GMC400 | importes | 23 | 3 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2 | GMC400 | costes | 0 | 23 | 5 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC2 | GMPC76R | piezas | 16 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC76R | funciones | 0 | 0 | 17 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC76R | cantidades | 16 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC76R | cortes | 16 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC2 | GMPC76R | acabados | 0 | 16 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC2 | GMPC76R | unidades | 16 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC76R | metraje | 16 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC76R | pvp | 14 | 2 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC2 | GMPC76R | importes | 12 | 4 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC76R | costes | 0 | 8 | 9 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1P | GMA350 | piezas | 13 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | GMA350 | funciones | 0 | 0 | 14 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | GMA350 | cantidades | 13 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | GMA350 | cortes | 10 | 3 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1P | GMA350 | acabados | 0 | 13 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1P | GMA350 | unidades | 13 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | GMA350 | metraje | 10 | 3 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | GMA350 | pvp | 11 | 2 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1P | GMA350 | importes | 8 | 5 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | GMA350 | costes | 0 | 12 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 3HO | ELEGANTPVC | piezas | 13 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 3HO | ELEGANTPVC | funciones | 0 | 0 | 13 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 3HO | ELEGANTPVC | cantidades | 13 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 3HO | ELEGANTPVC | cortes | 13 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 3HO | ELEGANTPVC | acabados | 0 | 13 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 3HO | ELEGANTPVC | unidades | 13 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 3HO | ELEGANTPVC | metraje | 13 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 3HO | ELEGANTPVC | pvp | 9 | 4 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 3HO | ELEGANTPVC | importes | 9 | 4 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 3HO | ELEGANTPVC | costes | 0 | 11 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC2 | GMPC65 | piezas | 13 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC65 | funciones | 0 | 0 | 13 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC65 | cantidades | 13 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC65 | cortes | 13 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC2 | GMPC65 | acabados | 0 | 13 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC2 | GMPC65 | unidades | 13 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC65 | metraje | 12 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC65 | pvp | 12 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC2 | GMPC65 | importes | 11 | 2 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC65 | costes | 0 | 13 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA350 + GMC400 | piezas | 0 | 4 | 8 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 + GMC400 | funciones | 0 | 0 | 12 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 + GMC400 | cantidades | 0 | 0 | 12 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 + GMC400 | cortes | 0 | 0 | 12 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA350 + GMC400 | acabados | 0 | 0 | 12 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA350 + GMC400 | unidades | 0 | 0 | 12 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 + GMC400 | metraje | 0 | 0 | 12 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 + GMC400 | pvp | 0 | 0 | 12 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA350 + GMC400 | importes | 0 | 0 | 12 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 + GMC400 | costes | 0 | 0 | 12 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 0 | GMA350 | piezas | 0 | 11 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA350 | funciones | 0 | 0 | 11 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA350 | cantidades | 0 | 0 | 11 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA350 | cortes | 0 | 0 | 11 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 0 | GMA350 | acabados | 0 | 0 | 11 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 0 | GMA350 | unidades | 0 | 0 | 11 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA350 | metraje | 0 | 0 | 11 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA350 | pvp | 0 | 0 | 11 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 0 | GMA350 | importes | 0 | 0 | 11 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA350 | costes | 0 | 0 | 11 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C2P | GMC400 | piezas | 8 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2P | GMC400 | funciones | 0 | 0 | 8 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2P | GMC400 | cantidades | 8 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2P | GMC400 | cortes | 8 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C2P | GMC400 | acabados | 0 | 8 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C2P | GMC400 | unidades | 8 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2P | GMC400 | metraje | 8 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2P | GMC400 | pvp | 8 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C2P | GMC400 | importes | 8 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2P | GMC400 | costes | 0 | 8 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMC400 | piezas | 6 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMC400 | funciones | 0 | 0 | 8 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMC400 | cantidades | 6 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMC400 | cortes | 6 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMC400 | acabados | 3 | 3 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMC400 | unidades | 6 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMC400 | metraje | 6 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMC400 | pvp | 5 | 1 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMC400 | importes | 5 | 1 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMC400 | costes | 0 | 5 | 3 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 0 | ELEGANTPVC | piezas | 0 | 7 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | ELEGANTPVC | funciones | 0 | 0 | 7 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | ELEGANTPVC | cantidades | 0 | 0 | 7 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | ELEGANTPVC | cortes | 0 | 0 | 7 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 0 | ELEGANTPVC | acabados | 0 | 0 | 7 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 0 | ELEGANTPVC | unidades | 0 | 0 | 7 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | ELEGANTPVC | metraje | 0 | 0 | 7 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | ELEGANTPVC | pvp | 0 | 0 | 7 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 0 | ELEGANTPVC | importes | 0 | 0 | 7 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | ELEGANTPVC | costes | 0 | 0 | 7 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA350 | piezas | 0 | 7 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 | funciones | 0 | 0 | 7 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 | cantidades | 0 | 0 | 7 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 | cortes | 0 | 0 | 7 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA350 | acabados | 0 | 0 | 7 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA350 | unidades | 0 | 0 | 7 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 | metraje | 0 | 0 | 7 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 | pvp | 0 | 0 | 7 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA350 | importes | 0 | 0 | 7 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 | costes | 0 | 0 | 7 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1 | GMA350 | piezas | 6 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1 | GMA350 | funciones | 0 | 0 | 6 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1 | GMA350 | cantidades | 6 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1 | GMA350 | cortes | 6 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1 | GMA350 | acabados | 0 | 6 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1 | GMA350 | unidades | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1 | GMA350 | metraje | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1 | GMA350 | pvp | 5 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1 | GMA350 | importes | 5 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1 | GMA350 | costes | 0 | 5 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1O | GMA350 | piezas | 4 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA350 | funciones | 0 | 0 | 6 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA350 | cantidades | 4 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA350 | cortes | 4 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1O | GMA350 | acabados | 0 | 4 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1O | GMA350 | unidades | 4 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA350 | metraje | 4 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA350 | pvp | 1 | 3 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1O | GMA350 | importes | 1 | 3 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA350 | costes | 0 | 4 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1OFI | ELEGANTPVC | piezas | 6 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OFI | ELEGANTPVC | funciones | 0 | 0 | 6 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OFI | ELEGANTPVC | cantidades | 6 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OFI | ELEGANTPVC | cortes | 6 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1OFI | ELEGANTPVC | acabados | 0 | 6 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1OFI | ELEGANTPVC | unidades | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OFI | ELEGANTPVC | metraje | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OFI | ELEGANTPVC | pvp | 4 | 2 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1OFI | ELEGANTPVC | importes | 4 | 2 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OFI | ELEGANTPVC | costes | 0 | 2 | 4 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2OFI | ELEGANTPVC | piezas | 6 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | ELEGANTPVC | funciones | 0 | 0 | 6 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | ELEGANTPVC | cantidades | 6 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | ELEGANTPVC | cortes | 6 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2OFI | ELEGANTPVC | acabados | 0 | 6 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2OFI | ELEGANTPVC | unidades | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | ELEGANTPVC | metraje | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | ELEGANTPVC | pvp | 6 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2OFI | ELEGANTPVC | importes | 6 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | ELEGANTPVC | costes | 0 | 2 | 4 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: ELEGANTPVC | piezas | 2 | 2 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC | funciones | 0 | 0 | 4 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC | cantidades | 2 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC | cortes | 1 | 1 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: ELEGANTPVC | acabados | 0 | 2 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: ELEGANTPVC | unidades | 2 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC | metraje | 1 | 1 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC | pvp | 1 | 1 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: ELEGANTPVC | importes | 1 | 1 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC | costes | 0 | 2 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1O | GMA60RL | piezas | 3 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA60RL | funciones | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA60RL | cantidades | 3 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA60RL | cortes | 3 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1O | GMA60RL | acabados | 0 | 3 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1O | GMA60RL | unidades | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA60RL | metraje | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA60RL | pvp | 2 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1O | GMA60RL | importes | 2 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA60RL | costes | 0 | 1 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1O | GMA65OHS | piezas | 3 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA65OHS | funciones | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA65OHS | cantidades | 3 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA65OHS | cortes | 3 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1O | GMA65OHS | acabados | 0 | 3 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1O | GMA65OHS | unidades | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA65OHS | metraje | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA65OHS | pvp | 2 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1O | GMA65OHS | importes | 2 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA65OHS | costes | 0 | 3 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2O | GMA60RL | piezas | 3 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA60RL | funciones | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA60RL | cantidades | 3 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA60RL | cortes | 3 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2O | GMA60RL | acabados | 0 | 3 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2O | GMA60RL | unidades | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA60RL | metraje | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA60RL | pvp | 3 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2O | GMA60RL | importes | 3 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA60RL | costes | 0 | 2 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2O | GMA65OPT | piezas | 2 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA65OPT | funciones | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA65OPT | cantidades | 2 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA65OPT | cortes | 2 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2O | GMA65OPT | acabados | 0 | 2 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2O | GMA65OPT | unidades | 2 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA65OPT | metraje | 2 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA65OPT | pvp | 1 | 1 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2O | GMA65OPT | importes | 1 | 1 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA65OPT | costes | 0 | 2 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | piezas | 0 | 1 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | funciones | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | cantidades | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | cortes | 0 | 0 | 3 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | acabados | 0 | 0 | 3 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | unidades | 0 | 0 | 3 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | metraje | 0 | 0 | 3 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | pvp | 0 | 0 | 3 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | importes | 0 | 0 | 3 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL + GMPC65 | costes | 0 | 0 | 3 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC3C | GMPC60 | piezas | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC3C | GMPC60 | funciones | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC3C | GMPC60 | cantidades | 0 | 0 | 3 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC3C | GMPC60 | cortes | 0 | 0 | 3 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC3C | GMPC60 | acabados | 0 | 0 | 3 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC3C | GMPC60 | unidades | 0 | 0 | 3 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC3C | GMPC60 | metraje | 0 | 0 | 3 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC3C | GMPC60 | pvp | 0 | 0 | 3 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC3C | GMPC60 | importes | 0 | 0 | 3 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC3C | GMPC60 | costes | 0 | 0 | 3 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 0 | GMA75C16 | piezas | 0 | 2 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA75C16 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA75C16 | cantidades | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA75C16 | cortes | 0 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 0 | GMA75C16 | acabados | 0 | 0 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 0 | GMA75C16 | unidades | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA75C16 | metraje | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA75C16 | pvp | 0 | 0 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 0 | GMA75C16 | importes | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA75C16 | costes | 0 | 0 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 02V | GMA350 | piezas | 0 | 1 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | GMA350 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | GMA350 | cantidades | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | GMA350 | cortes | 0 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 02V | GMA350 | acabados | 0 | 0 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 02V | GMA350 | unidades | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | GMA350 | metraje | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | GMA350 | pvp | 0 | 0 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 02V | GMA350 | importes | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | GMA350 | costes | 0 | 0 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 02V | GMA75C16 | piezas | 0 | 2 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | GMA75C16 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | GMA75C16 | cantidades | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | GMA75C16 | cortes | 0 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 02V | GMA75C16 | acabados | 0 | 0 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 02V | GMA75C16 | unidades | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | GMA75C16 | metraje | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | GMA75C16 | pvp | 0 | 0 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 02V | GMA75C16 | importes | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | GMA75C16 | costes | 0 | 0 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1O | GMA65OPT | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA65OPT | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA65OPT | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA65OPT | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1O | GMA65OPT | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1O | GMA65OPT | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA65OPT | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA65OPT | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1O | GMA65OPT | importes | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA65OPT | costes | 0 | 2 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1O | GMA75C16 | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA75C16 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA75C16 | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1O | GMA75C16 | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1O | GMA75C16 | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1O | GMA75C16 | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA75C16 | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA75C16 | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1O | GMA75C16 | importes | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1O | GMA75C16 | costes | 0 | 0 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1OPLD | GMA65OPT | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPLD | GMA65OPT | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPLD | GMA65OPT | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPLD | GMA65OPT | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1OPLD | GMA65OPT | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1OPLD | GMA65OPT | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPLD | GMA65OPT | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPLD | GMA65OPT | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1OPLD | GMA65OPT | importes | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPLD | GMA65OPT | costes | 0 | 1 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1OPLI | GMA65OPT | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPLI | GMA65OPT | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPLI | GMA65OPT | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPLI | GMA65OPT | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1OPLI | GMA65OPT | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1OPLI | GMA65OPT | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPLI | GMA65OPT | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPLI | GMA65OPT | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1OPLI | GMA65OPT | importes | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPLI | GMA65OPT | costes | 0 | 2 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1P | ELEGANTPVC | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | ELEGANTPVC | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | ELEGANTPVC | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | ELEGANTPVC | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1P | ELEGANTPVC | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1P | ELEGANTPVC | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | ELEGANTPVC | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | ELEGANTPVC | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1P | ELEGANTPVC | importes | 1 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | ELEGANTPVC | costes | 0 | 2 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1P | GMA65OPT | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | GMA65OPT | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | GMA65OPT | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1P | GMA65OPT | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1P | GMA65OPT | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1P | GMA65OPT | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | GMA65OPT | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | GMA65OPT | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1P | GMA65OPT | importes | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1P | GMA65OPT | costes | 0 | 2 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2 | GMA350 | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2 | GMA350 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2 | GMA350 | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2 | GMA350 | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2 | GMA350 | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2 | GMA350 | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2 | GMA350 | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2 | GMA350 | pvp | 1 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2 | GMA350 | importes | 1 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2 | GMA350 | costes | 0 | 2 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2O | GMA65OHS | piezas | 1 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA65OHS | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA65OHS | cantidades | 1 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA65OHS | cortes | 1 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2O | GMA65OHS | acabados | 0 | 1 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2O | GMA65OHS | unidades | 1 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA65OHS | metraje | 1 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA65OHS | pvp | 1 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2O | GMA65OHS | importes | 1 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA65OHS | costes | 0 | 1 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2OFI | GMA65OPT | piezas | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | GMA65OPT | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | GMA65OPT | cantidades | 2 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | GMA65OPT | cortes | 2 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2OFI | GMA65OPT | acabados | 0 | 2 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2OFI | GMA65OPT | unidades | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | GMA65OPT | metraje | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | GMA65OPT | pvp | 2 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2OFI | GMA65OPT | importes | 2 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | GMA65OPT | costes | 0 | 2 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C2FI | GMC400 | piezas | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2FI | GMC400 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2FI | GMC400 | cantidades | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2FI | GMC400 | cortes | 0 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C2FI | GMC400 | acabados | 0 | 0 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C2FI | GMC400 | unidades | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2FI | GMC400 | metraje | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2FI | GMC400 | pvp | 0 | 0 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C2FI | GMC400 | importes | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2FI | GMC400 | costes | 0 | 0 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | piezas | 0 | 2 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | funciones | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | cantidades | 0 | 0 | 2 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | cortes | 0 | 0 | 2 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | acabados | 0 | 0 | 2 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | unidades | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | metraje | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | pvp | 0 | 0 | 2 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | importes | 0 | 0 | 2 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | costes | 0 | 0 | 2 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 0 | GMA65OHS | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA65OHS | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA65OHS | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 0 | GMA65OHS | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 0 | GMA65OHS | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 0 | GMA65OHS | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA65OHS | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA65OHS | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 0 | GMA65OHS | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 0 | GMA65OHS | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 02V | ELEGANTPVC | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | ELEGANTPVC | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | ELEGANTPVC | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 02V | ELEGANTPVC | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 02V | ELEGANTPVC | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 02V | ELEGANTPVC | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | ELEGANTPVC | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | ELEGANTPVC | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 02V | ELEGANTPVC | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 02V | ELEGANTPVC | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1OFI | GMA350 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OFI | GMA350 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OFI | GMA350 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OFI | GMA350 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1OFI | GMA350 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1OFI | GMA350 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OFI | GMA350 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OFI | GMA350 | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1OFI | GMA350 | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OFI | GMA350 | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1OPPI | GMA60RL | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPPI | GMA60RL | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPPI | GMA60RL | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1OPPI | GMA60RL | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1OPPI | GMA60RL | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1OPPI | GMA60RL | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPPI | GMA60RL | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPPI | GMA60RL | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1OPPI | GMA60RL | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1OPPI | GMA60RL | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1PCMA | ELEGANTPVC | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1PCMA | ELEGANTPVC | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1PCMA | ELEGANTPVC | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1PCMA | ELEGANTPVC | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1PCMA | ELEGANTPVC | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1PCMA | ELEGANTPVC | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1PCMA | ELEGANTPVC | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1PCMA | ELEGANTPVC | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1PCMA | ELEGANTPVC | importes | 0 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1PCMA | ELEGANTPVC | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 1PFS | GMA350 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1PFS | GMA350 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1PFS | GMA350 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 1PFS | GMA350 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 1PFS | GMA350 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 1PFS | GMA350 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1PFS | GMA350 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1PFS | GMA350 | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 1PFS | GMA350 | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 1PFS | GMA350 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2O | GMA76 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA76 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA76 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O | GMA76 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2O | GMA76 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2O | GMA76 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA76 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA76 | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2O | GMA76 | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O | GMA76 | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2O+1OFI | GMA350 | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O+1OFI | GMA350 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O+1OFI | GMA350 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2O+1OFI | GMA350 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2O+1OFI | GMA350 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2O+1OFI | GMA350 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O+1OFI | GMA350 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O+1OFI | GMA350 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2O+1OFI | GMA350 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2O+1OFI | GMA350 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2OFI | GMA350 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | GMA350 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | GMA350 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2OFI | GMA350 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2OFI | GMA350 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2OFI | GMA350 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | GMA350 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | GMA350 | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2OFI | GMA350 | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2OFI | GMA350 | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| 2P | GMA350 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2P | GMA350 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2P | GMA350 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| 2P | GMA350 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| 2P | GMA350 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| 2P | GMA350 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2P | GMA350 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2P | GMA350 | pvp | 0 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| 2P | GMA350 | importes | 0 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| 2P | GMA350 | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C2E1 | GMPC135E | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2E1 | GMPC135E | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2E1 | GMPC135E | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2E1 | GMPC135E | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C2E1 | GMPC135E | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C2E1 | GMPC135E | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2E1 | GMPC135E | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2E1 | GMPC135E | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C2E1 | GMPC135E | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2E1 | GMPC135E | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C2G | GMALGSL65 | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2G | GMALGSL65 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2G | GMALGSL65 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C2G | GMALGSL65 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C2G | GMALGSL65 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C2G | GMALGSL65 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2G | GMALGSL65 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2G | GMALGSL65 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C2G | GMALGSL65 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C2G | GMALGSL65 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C3 | GMC400 | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C3 | GMC400 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C3 | GMC400 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C3 | GMC400 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C3 | GMC400 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C3 | GMC400 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C3 | GMC400 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C3 | GMC400 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C3 | GMC400 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C3 | GMC400 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| C4P | GMC400 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C4P | GMC400 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C4P | GMC400 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| C4P | GMC400 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| C4P | GMC400 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| C4P | GMC400 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C4P | GMC400 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C4P | GMC400 | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| C4P | GMC400 | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| C4P | GMC400 | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA350 + GMPC76R | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 + GMPC76R | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 + GMPC76R | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA350 + GMPC76R | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA350 + GMPC76R | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA350 + GMPC76R | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 + GMPC76R | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 + GMPC76R | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA350 + GMPC76R | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA350 + GMPC76R | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA60RL | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA60RL | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA60RL | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA60RL | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA60RL + GMC400 | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL + GMC400 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL + GMC400 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA60RL + GMC400 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA60RL + GMC400 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA60RL + GMC400 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL + GMC400 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL + GMC400 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA60RL + GMC400 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA60RL + GMC400 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | piezas | 0 | 1 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| GRUPO | GRUPO: GMPC65 | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMPC65 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMPC65 | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| GRUPO | GRUPO: GMPC65 | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| GRUPO | GRUPO: GMPC65 | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| GRUPO | GRUPO: GMPC65 | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMPC65 | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMPC65 | pvp | 0 | 1 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| GRUPO | GRUPO: GMPC65 | importes | 0 | 1 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| GRUPO | GRUPO: GMPC65 | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC2 | GMPC135T | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC135T | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC135T | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2 | GMPC135T | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC2 | GMPC135T | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC2 | GMPC135T | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC135T | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC135T | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC2 | GMPC135T | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2 | GMPC135T | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC2E2 | GMPC135E | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2E2 | GMPC135E | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2E2 | GMPC135E | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2E2 | GMPC135E | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC2E2 | GMPC135E | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC2E2 | GMPC135E | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2E2 | GMPC135E | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2E2 | GMPC135E | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC2E2 | GMPC135E | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2E2 | GMPC135E | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC2X | GMPC135E | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2X | GMPC135E | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2X | GMPC135E | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC2X | GMPC135E | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC2X | GMPC135E | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC2X | GMPC135E | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2X | GMPC135E | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2X | GMPC135E | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC2X | GMPC135E | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC2X | GMPC135E | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC3C | GMPC135R | piezas | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC3C | GMPC135R | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC3C | GMPC135R | cantidades | 1 | 0 | 0 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC3C | GMPC135R | cortes | 1 | 0 | 0 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC3C | GMPC135R | acabados | 0 | 1 | 0 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC3C | GMPC135R | unidades | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC3C | GMPC135R | metraje | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC3C | GMPC135R | pvp | 1 | 0 | 0 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC3C | GMPC135R | importes | 1 | 0 | 0 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC3C | GMPC135R | costes | 0 | 1 | 0 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| PC6C | GMPC60 | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC6C | GMPC60 | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC6C | GMPC60 | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| PC6C | GMPC60 | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| PC6C | GMPC60 | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| PC6C | GMPC60 | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC6C | GMPC60 | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC6C | GMPC60 | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| PC6C | GMPC60 | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| PC6C | GMPC60 | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |
| T | ELEGANTPVC | piezas | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| T | ELEGANTPVC | funciones | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| T | ELEGANTPVC | cantidades | 0 | 0 | 1 | [R2](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r2) |
| T | ELEGANTPVC | cortes | 0 | 0 | 1 | [R1](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r1) |
| T | ELEGANTPVC | acabados | 0 | 0 | 1 | [R3](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r3) |
| T | ELEGANTPVC | unidades | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| T | ELEGANTPVC | metraje | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| T | ELEGANTPVC | pvp | 0 | 0 | 1 | [R10](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r10) |
| T | ELEGANTPVC | importes | 0 | 0 | 1 | [R9](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r9) |
| T | ELEGANTPVC | costes | 0 | 0 | 1 | [R11](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#r11) |

## Variantes presentes en las fuentes

Incluye candidatas excluidas. Rangos no significan cobertura continua; códigos/opciones observados no garantizan compatibilidad de su producto cartesiano. Opciones y fracciones cuentan elementos en GRUPO, líneas en estructuras; comisión/despunte cuentan líneas comerciales elegibles.

| Modelo | Serie | Ancho / alto mm (min..max) | Cantidad | Tarifa | Acabado / accesorios | Vidrios distintos | nTAcris | Con opciones guardadas | Accesorios | Con fracciones | Comisión / despunte |
|---|---|---|---|---|---|---:|---|---:|---|---:|---|
| 2O | ELEGANTPVC | 800..2430 / 540..2720 | 1, 2, 3, 4, 5, 6 | 1 | B, K, L, P, VS / L, UNI | 10 | 0, 1 | 214 | COM009, GMTUB2, GMTUB80X40, PSM001 | 0 | 30 / 0 |
| 1O | ELEGANTPVC | 400..1150 / 520..2400 | 1, 2, 3, 7 | 1 | B, K, L, P, VS / L, UNI | 12 | 0, 1 | 108 | COM009 | 0 | 14 / 0 |
| C2 | GMC400 | 450..2400 / 400..2250 | 1, 2, 3 | 1 | B, L, P, VS / L, UNI | 10 | 0, 1 | 28 | COM005, COM009, GMT002, GMT004, GMTUB2 | 0 | 4 / 1 |
| PC2 | GMPC76R | 900..3050 / 1000..2235 | 1, 2, 3 | 1 | B, K, L, P, UNI, VS / L, UNI | 7 | 0, 1 | 17 | COM009, GMT002 | 0 | 1 / 1 |
| 1P | GMA350 | 580..1000 / 1500..2949 | 1 | 1 | L, UNI, VS / L, UNI | 5 | 0, 1 | 16 | GMT002, GMT004 | 4 | 3 / 1 |
| 3HO | ELEGANTPVC | 1570..3040 / 995..1915 | 1, 2 | 1 | B, L, P, VS / L, UNI | 2 | 0 | 17 | COM009 | 0 | 0 / 0 |
| PC2 | GMPC65 | 670..2100 / 750..2150 | 0, 1 | 1 | I, L, P, VS / L, UNI | 7 | 0, 1 | 15 | COM009 | 0 | 4 / 0 |
| GRUPO | GRUPO: GMA350 + GMC400 | 0..3024 / 299.5..3024 | 1 | 1 | L, P, VS / UNI | 9 | 0, 1 | 8 | GMTUB2, GMTUB40X80, GMTUB60X60 | 42 | 3 / 0 |
| 0 | GMA350 | 410..5100 / 400..2000 | 1, 2 | 1 | L, UNI, VS / L, UNI | 7 | 0, 1 | 17 | GMT004 | 0 | 0 / 0 |
| C2P | GMC400 | 1000..3600 / 2000..2315 | 1 | 1 | L, P / L, UNI | 1 | 0 | 8 | COM005, COM009, GMT002 | 0 | 0 / 0 |
| GRUPO | GRUPO: GMC400 | 0..2600 / 449.5..2650 | 1, 2 | 1 | B, L, VS / UNI | 5 | 0 | 0 | — | 20 | 2 / 2 |
| 0 | ELEGANTPVC | 400..3680 / 900..3800 | 1 | 1 | L, VS / L, UNI | 4 | 0 | 11 | COM009 | 0 | 0 / 0 |
| GRUPO | GRUPO: GMA350 | 0..2199.5 / 449.5..2650 | 1 | 1 | L, P / UNI | 3 | 0 | 0 | — | 10 | 2 / 0 |
| 1 | GMA350 | 330..1100 / 440..1080 | 1, 2 | 1 | L, VS / L, UNI | 4 | 0, 1 | 9 | GMT002 | 0 | 0 / 0 |
| 1O | GMA350 | 367..1097 / 520..2095 | 1, 2 | 1 | L, VS / L, UNI | 6 | 0, 1 | 10 | COM005, GMT001, GMT002, GMT004 | 0 | 1 / 0 |
| 1OFI | ELEGANTPVC | 390..910 / 1095..2080 | 1, 2, 3 | 1 | B, L, VS / L, UNI | 3 | 0 | 10 | COM009 | 0 | 1 / 0 |
| 2OFI | ELEGANTPVC | 900..1820 / 1435..2300 | 1, 2, 4 | 1 | B, L, VS / L, UNI | 3 | 0, 1 | 12 | COM009, PSM001 | 0 | 4 / 0 |
| GRUPO | GRUPO: ELEGANTPVC | 0..2659 / 419..4100 | 1, 2 | 1 | B, L, VS / UNI | 11 | 0 | 9 | GMTUB40X80, GMTUB80X40, PSM001 | 61 | 0 / 0 |
| 1O | GMA60RL | 490..1000 / 670..2050 | 1, 2 | 1 | L, VS / L, UNI | 5 | 0, 1 | 6 | COM009 | 0 | 0 / 0 |
| 1O | GMA65OHS | 650..1100 / 1600..2125 | 1 | 1 | L / L, UNI | 2 | 0, 1 | 3 | GMT002 | 0 | 0 / 0 |
| 2O | GMA60RL | 1150..1450 / 1100..1300 | 1, 2, 3 | 1 | L, VS / L, UNI | 4 | 0, 1 | 4 | COM005, COM009 | 0 | 0 / 0 |
| 2O | GMA65OPT | 1030..1590 / 1095..2150 | 1, 2, 3 | 1 | L / L, UNI | 4 | 0, 1 | 9 | COM009 | 0 | 0 / 0 |
| GRUPO | GRUPO: GMA60RL + GMPC65 | 0..1940 / 349.5..2540 | 1 | 1 | L, VS / UNI | 5 | 0 | 0 | — | 27 | 0 / 0 |
| PC3C | GMPC60 | 2000..3800 / 1400..1800 | 1, 2 | 1 | UNI / UNI | 1 | 0 | 3 | — | 0 | 3 / 3 |
| 0 | GMA75C16 | 1950..3850 / 600..2600 | 1, 2 | 1 | VS / UNI | 1 | 0 | 2 | — | 0 | 0 / 0 |
| 02V | GMA350 | 2320..5000 / 490..1550 | 1 | 1 | L, VS / L, UNI | 5 | 0 | 5 | — | 0 | 0 / 0 |
| 02V | GMA75C16 | 4410..4990 / 2490..2620 | 1 | 1 | VS / UNI | 1 | 0 | 2 | — | 0 | 0 / 0 |
| 1O | GMA65OPT | 400..900 / 520..1425 | 1, 2, 7 | 1 | L / L, UNI | 4 | 0, 1 | 10 | COM009, GMT002 | 0 | 0 / 0 |
| 1O | GMA75C16 | 750..750 / 1350..1990 | 2, 4, 5 | 1 | VS / UNI | 1 | 0 | 3 | — | 0 | 0 / 0 |
| 1OPLD | GMA65OPT | 1880..3100 / 2110..2200 | 1 | 1 | B, L / L, UNI | 1 | 0 | 2 | COM009 | 0 | 0 / 0 |
| 1OPLI | GMA65OPT | 1800..1800 / 2000..2000 | 1 | 1 | L / L | 1 | 0 | 2 | COM009 | 0 | 0 / 0 |
| 1P | ELEGANTPVC | 750..900 / 1230..2100 | 1, 8 | 1 | L, VS / L, UNI | 4 | 0 | 5 | COM009 | 0 | 0 / 0 |
| 1P | GMA65OPT | 900..900 / 1920..1920 | 1 | 1 | L / L | 1 | 0 | 2 | — | 0 | 2 / 0 |
| 2 | GMA350 | 1100..2000 / 1010..2000 | 2, 9 | 1 | L / L | 2 | 0 | 2 | — | 0 | 0 / 0 |
| 2O | GMA65OHS | 1330..2210 / 1360..2200 | 1, 2 | 1 | L, VS / L, UNI | 2 | 0, 1 | 3 | COM009 | 0 | 0 / 0 |
| 2OFI | GMA65OPT | 1075..1125 / 1400..1435 | 2, 3 | 1 | L / UNI | 2 | 0 | 3 | COM005, COM009, PSM001 | 0 | 0 / 0 |
| C2FI | GMC400 | 900..1150 / 1245..1480 | 1, 3 | 1 | L / L, UNI | 2 | 0 | 2 | COM005 | 0 | 0 / 0 |
| GRUPO | GRUPO: GMA65OPT + GMPC65 | 0..2190 / 249.5..2190 | 1 | 1 | B, L / UNI | 3 | 0 | 0 | — | 8 | 1 / 0 |
| 0 | GMA65OHS | 1000..1000 / 2580..2580 | 1 | 1 | L / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 02V | ELEGANTPVC | 2600..2600 / 1000..1000 | 1 | 1 | L / L | 1 | 1 | 1 | — | 0 | 1 / 0 |
| 1OFI | GMA350 | 660..660 / 1620..1620 | 1 | 1 | L / UNI | 1 | 1 | 1 | COM005 | 0 | 0 / 0 |
| 1OPPI | GMA60RL | 1960..2510 / 2175..2185 | 1 | 1 | L, VS / L, UNI | 2 | 1 | 2 | COM009 | 0 | 0 / 0 |
| 1PCMA | ELEGANTPVC | 900..900 / 2100..2100 | 1 | 1 | L / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 1PFS | GMA350 | 925..1120 / 2300..2320 | 1 | 1 | L, VS / L, UNI | 2 | 0 | 2 | — | 0 | 0 / 0 |
| 2O | GMA76 | 1250..1250 / 2330..2330 | 1 | 1 | L / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 2O+1OFI | GMA350 | 2100..2100 / 1560..1560 | 1 | 1 | L / UNI | 1 | 1 | 1 | COM005 | 0 | 0 / 0 |
| 2OFI | GMA350 | 1390..1390 / 1590..1590 | 2 | 1 | L / UNI | 1 | 1 | 1 | COM005 | 0 | 0 / 0 |
| 2P | GMA350 | 900..900 / 400..400 | 1 | 1 | L / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| C2E1 | GMPC135E | 3070..3070 / 2200..2200 | 1 | 1 | VS / UNI | 1 | 0 | 1 | COM013 | 0 | 0 / 0 |
| C2G | GMALGSL65 | 1100..1100 / 1000..1000 | 1 | 1 | VS / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| C3 | GMC400 | 2010..2010 / 1030..1030 | 1 | 1 | VS / UNI | 1 | 0 | 1 | — | 0 | 0 / 1 |
| C4P | GMC400 | 4000..4000 / 2200..2200 | 1 | 1 | L / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| GRUPO | GRUPO: ELEGANTPVC + GMA350 | 0..4849 / 599..4840 | 1 | 1 | L, P / UNI | 7 | 0 | 0 | — | 49 | 0 / 0 |
| GRUPO | GRUPO: ELEGANTPVC + GMPC65 | 0..1945 / 289.5..2500 | 1 | 1 | L / UNI | 6 | 0 | 0 | — | 5 | 0 / 0 |
| GRUPO | GRUPO: GMA350 + GMPC76R | 0..1170 / 939..2440 | 1 | 1 | L / UNI | 2 | 0 | 0 | — | 0 | 0 / 0 |
| GRUPO | GRUPO: GMA60RL | 0..2049.300048828125 / 2090..2090 | 1 | 1 | L / UNI | 1 | 0 | 0 | — | 3 | 0 / 0 |
| GRUPO | GRUPO: GMA60RL + GMC400 | 0..1044.5 / 1310..1310 | 1 | 1 | L / UNI | 2 | 0 | 0 | — | 2 | 0 / 0 |
| GRUPO | GRUPO: GMA75C16 + GMPC135ET | 0..9209.5 / 2620..2620 | 1 | 1 | VS / UNI | 1 | 0 | 0 | — | 2 | 0 / 0 |
| GRUPO | GRUPO: GMA75C16 + GMPC76R | 0..4520 / 1049..4520 | 1 | 1 | VS / UNI | 1 | 0 | 0 | — | 2 | 0 / 0 |
| GRUPO | GRUPO: GMPC135ET + GMPC76R | 0..2359 / 1049.5..2480 | 1 | 1 | VS / UNI | 1 | 0 | 0 | — | 4 | 0 / 0 |
| GRUPO | GRUPO: GMPC65 | 0..2500 / 1175..1580 | 1 | 1 | B, L / UNI | 3 | 0 | 3 | COM001, GMTUB40X80, PSM001 | 0 | 0 / 0 |
| PC2 | GMPC135T | 1170..1170 / 1180..1180 | 1 | 1 | L / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| PC2E2 | GMPC135E | 4400..4400 / 2620..2620 | 1 | 1 | VS / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| PC2X | GMPC135E | 3980..3980 / 2215..2215 | 1 | 1 | VS / UNI | 1 | 0 | 1 | COM013 | 0 | 0 / 0 |
| PC3C | GMPC135R | 3540..3540 / 2500..2500 | 1 | 1 | L / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| PC6C | GMPC60 | 4800..4800 / 2200..2200 | 1 | 1 | VS / L | 1 | 0 | 1 | — | 0 | 1 / 1 |
| T | ELEGANTPVC | 1020..1020 / 1200..1200 | 1 | 1 | L / L | 1 | 0 | 1 | COM009 | 0 | 0 / 0 |
| 1FL | ELEGANTPVC | 1020..2000 / 1000..2200 | 1 | 1 | L, VS / L, UNI | 3 | 0 | 3 | — | 0 | 0 / 0 |
| 1FL | GMA65OPT | 1020..1020 / 2150..2150 | 1 | 1 | L / L | 1 | 1 | 1 | — | 0 | 0 / 0 |
| 1O+1F+1O | ELEGANTPVC | 2140..2300 / 1100..1105 | 1, 2 | 1 | L, P / L, UNI | 2 | 0, 1 | 2 | COM009 | 0 | 0 / 0 |
| 1O+1F+1O | GMA60RL | 2140..2140 / 1105..1105 | 1 | 1 | P / UNI | 1 | 0 | 1 | COM009 | 0 | 0 / 0 |
| 1OFI | GMA60RL | 910..910 / 1095..1095 | 1 | 1 | L / UNI | 1 | 0 | 1 | COM009 | 0 | 0 / 0 |
| 1OP1FL | ELEGANTPVC | 2000..2000 / 2100..2100 | 1 | 1 | VS / UNI | 1 | 0 | 2 | COM009 | 0 | 0 / 0 |
| 1OPLD | GMA60RL | 2630..2630 / 2025..2025 | 1 | 1 | VS / L | 1 | 0 | 2 | COM009 | 0 | 0 / 0 |
| 1OPPD | GMA60RL | 2100..4010 / 2015..2175 | 0, 1 | 1 | L, VS / L, UNI | 2 | 0, 1 | 2 | COM009 | 0 | 0 / 0 |
| 1PFS | ELEGANTPVC | 725..725 / 2395..2395 | 1 | 1 | L / UNI | 1 | 0 | 2 | — | 0 | 0 / 0 |
| 1PFS | GMA60RL | 875..875 / 2340..2340 | 4 | 1 | VS / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 2FS | GMA76 | 1900..1900 / 2910..2910 | 1 | 1 | L / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 2OPL | GMA50R | 2500..2500 / 1100..1100 | 1 | 1 | VS / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 2PD | GMA65OPT | 1050..1050 / 1800..1800 | 1 | 1 | VS / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| 3HO | GMA65OHS | 2430..3570 / 1465..1660 | 1 | 1 | L / L | 1 | 0 | 4 | COM009 | 0 | 0 / 0 |
| C2E1 | GMPC135T | 2500..2500 / 2200..2200 | 2 | 1 | VS / UNI | 1 | 0 | 1 | — | 0 | 0 / 0 |
| C3C | GMC30056 | 2380..2380 / 2080..2080 | 1 | 1 | L / L | 1 | 0 | 1 | — | 0 | 0 / 0 |
| COM001 | sin serie | 1000..1000 / 1150..1150 | 1 | 1 | K / — | 0 | 0 | 0 | — | 0 | 0 / 0 |
| COM005 | sin serie | 1000..1560 / 1200..1300 | 1, 2 | 1 | B, P / L | 0 | 0 | 0 | — | 0 | 0 / 0 |
| COM009 | sin serie | 1780..1780 / 2230..2230 | 1 | 1 | VS / UNI | 0 | 0 | 0 | — | 0 | 0 / 0 |
| COM017 | sin serie | 740..1600 / 1100..2350 | 1, 2 | 1 | K, L / L | 0 | 0 | 0 | — | 0 | 0 / 0 |
| GRUPO | GRUPO: ELEGANTPVC + GMPC135ME | 0..1599.5 / 1500..2400 | 1 | 1 | VS / UNI | 2 | 0 | 0 | — | 2 | 0 / 0 |
| GRUPO | GRUPO: GMA350 + GMA65OPT | 0..1448.5 / 650..2500 | 1 | 1 | L / UNI | 4 | 0, 1 | 5 | GMTUB2, PSM001 | 14 | 0 / 0 |
| GRUPO | GRUPO: GMA350 + GMPC135ME | 0..1384 / 1350..2400 | 1 | 1 | VS / UNI | 1 | 0 | 0 | — | 0 | 0 / 0 |
| GRUPO | GRUPO: GMA350 + GMPC65 | 0..1965 / -6..2500 | 1 | 1 | L, VS / UNI | 4 | 0 | 0 | — | 0 | 0 / 0 |
| GRUPO | GRUPO: GMA65OPT | 0..2000 / 1460..2300 | 1 | 1 | L, VS / UNI | 2 | 0 | 5 | GMTUB60X60, PSM001 | 3 | 0 / 0 |
| GRUPO | GRUPO: GMA65OPT + GMPC76R | 0..3374 / 1475..1475 | 1 | 1 | VS / UNI | 1 | 0 | 2 | — | 0 | 0 / 0 |
| OB+1VS | GMA65OPT | 1200..1200 / 1200..1200 | 1 | 1 | L / L | 1 | 0 | 2 | — | 0 | 0 / 0 |
| PSM001 | sin serie | 470..4990 / 450..2620 | 1, 2, 3, 4, 5 | 1 | B, K, L, P, VS / L, UNI | 0 | 0 | 0 | — | 0 | 0 / 0 |
| PSM002 | sin serie | 270..1100 / 600..2070 | 1, 2 | 1 | K, L, P / L, UNI | 0 | 0 | 0 | — | 0 | 0 / 0 |
| PSM004 | sin serie | 830..2400 / 1270..2403 | 1 | 1 | B, K, L, VS / L, UNI | 0 | 0 | 0 | — | 0 | 0 / 0 |

## Ausencias de contraste elegible en el catálogo

Inventario: 541 modelos en Estructuras.Codigo; 58 series en ConfigSeries.Serie.
Ausencia de línea independiente elegible: 512 modelos y 43 series. Un modelo puede estar dentro de un GRUPO sin medición individual. Ausencia no significa incompatible.
No se fabrica una matriz de compatibilidad con EstructurasSeriesAsoc: su semántica sigue pendiente en la evidencia de fase 7.

Modelos sin contraste independiente: *, 02H, 03H, 03V, 04, 04F, 06, 0IND, 0INI, 0LM, 0M, 0MR, 0PLM, 0PM, 0PMR, 1+1, 1+1C, 1+1CZ, 1+1PC, 1+1PCZ, 1+2, 1+VS, 10101, 12FL, 1C, 1CZ, 1D, 1E, 1FI, 1FL, 1FL2FI, 1FS, 1FSFI, 1FSFIFL, 1HFI, 1I, 1IND, 1INI, 1M, 1MG, 1MR, 1MRG, 1MRS, 1MS, 1MZ, 1MZA, 1O+1F+1O, 1O+1OFI, 1O+2, 1O+2F+1O, 1O+VS, 1O1FL, 1O2FL, 1OD, 1OFL2FI, 1OFSFI, 1OFSFIFL, 1OI, 1OP, 1OP+1OBAN, 1OP+VS, 1OP1FL, 1OP2FL, 1OP2FLFS, 1OPD, 1OPI, 1OPLP+F+1OPLP, 1OPLPD, 1OPLPD2FL, 1OPLPI, 1OPLPI2FL, 1OPPD, 1P+1BAN, 1P+VS, 1P2FL, 1P2FLFS, 1PC, 1PCALLEEXT, 1PCALLEINT, 1PCMA2FLFS, 1PCMAE, 1PCMAFL, 1PCMAFS, 1PCMAU, 1PCZ, 1PE, 1PFL, 1PFLFS, 1PFLFSZ, 1PFLZ, 1PFSZ, 1PMA, 1PMAFS, 1PVVDZ, 1PVVIZ, 1PZ, 1PZR, 1VI, 1VS, 1VVD, 1VVI, 2+1O, 2+2O, 211M, 211MG, 211MR, 211MRG, 211MRS, 211MS, 211MZ, 2C, 2D, 2DESC, 2E, 2FI, 2FL, 2FL2FI, 2FS, 2FSFIFL, 2FSI, 2I, 2IND, 2INI, 2INID, 2M, 2MR, 2MZ, 2MZA, 2O+ FIJO, 2O+1OFIFS, 2O+2O4FI, 2O+2OFI, 2O2FI, 2O2FS2FI, 2OD, 2ODESC, 2OFL, 2OFL2FI, 2OFLFI, 2OFLFSFI, 2OFSFI, 2OFSFIFL, 2OI, 2OP, 2OP+VS, 2OP2FL, 2OPD, 2OPFS, 2OPFSFL, 2OPI, 2OPL, 2OPLP, 2OPP, 2P+VS, 2P2FL, 2PCALLEEXT, 2PCALLEINT, 2PCMA, 2PCMA2FLFS, 2PCMAE, 2PCMAFL, 2PCMAFS, 2PCMAU, 2PD, 2PE, 2PFS, 2PFSFL, 2PMA, 2PVVZ, 2VV, 3, 312M, 312MR, 321M, 321MR, 3M, 3MR, 3O, 3PL0+3, 3PL0+3T, 4, 42+2MT, 422M, 4M, 4MR, 4MT, 4PL1+3, 4PL1+3T, 5PL0+5, 5PL0+5T, 633M, 6M, 6PL1+5, 6PL1+6T, 6PL3+3, BASTIDOR, C2E2, C2FS, C2FSFI, C2PFS, C2PZ, C312, C321, C3C, C3E2, C3F, C3FI, C3FS, C3FSFI, C3FT, C3P, C3PC, C3PFS, C3PZ, C4, C4E2, C4E4, C4FI, C4FS, C4FSFI, C4PFS, C4PZ, C6, C6C, C6FI, C6FS, C6FSFI, C6P, C6PC, C6PFS, C6PZ, CC2, CC3, CC3C, CC4, CC6, CC6C, CF, CFT, CM1MDF, CM1MDR, CM1MIF, CM1MIR, CM2MF, CM2MR, COM001, COM002, COM003, COM004, COM005, COM006, COM007, COM008, COM009, COM010, COM011, COM012, COM013, COM014, COM015, COM016, COM017, CTM3, CTM4, F+1+FC, F+1+FPC, F+2+FC, F+2+FCZ, F+2+FPC, F+2+FPCZ, F1, F10, F11, F12, F13, F14, F15, F16, F17, F2, F2PF, F2PFO, F3, F4, F5, F6, F7, F8, F9, FC, FS+1C, GMBAN001, GMBAN002, GMBAN003, GMBAN004, GMBAN005, GMBAN006, GMBAR001, GMBAR002, GMBAR003, GMBAR004, GMBAR005, GMBAR006, GMBAR007, GMBAR008, GMCON001, GMCON002, GMCON003, GMCON004, GMCON005, GMCON006, GMCON007, GMT001, GMT002, GMT003, GMT004, GMT005, GMT006, GMT007, GMT008, GMT009, GMT010, GMT011, GMT012, GMT013, GMT014, GMT015, GMT016, GMT017, GMT018, GMT019, GMT020, GMT021, GMT022, GMT023, GMTUB001, GMTUB2, GMTUB3, GMTUB40X80, GMTUB60X60, GMTUB80X40, GMU001, GMU002, GMU003, GMU004, GMU005, GMU006, GMU007, GMU008, GMU009, GMU010, GMU011, GMU012, GMU013, GMU014, GMU015, GMU016, GMU017, GMU018, GMU019, GMU020, GMU021, GMU022, GMU023, GMU024, GMU025, GMU026, GMU027, GMU028, GMU029, GMU030, GMU031, GMU032, GMU033, GMU034, GMU035, GMU036, GMU037, GMU038, GMU039, GMU040, GMU041, GRUPO, MAR4F+FH, MAR4G+FH, MF, MLL4F+FH, ND, OB, OB+1VS, P2D, P321, P321O, P330, P431, P431O, P532, P541, P550, P633, P651, P743, P761, P770, PC2E1F1, PC2P, PC2PZ, PC2Z, PC3, PC312, PC321, PC3CX, PC3E1F2, PC3E2F1, PC3X, PC4, PC4E2F2, PC4E4, PC4X, PC6, PC6CX, PC6X, PCM1D, PCM1DE, PCM1DF, PCM1I, PCM1IE, PCM1IF, PCM1MDFE, PCM1MDRE, PCM1MIFE, PCM1MIRE, PCM2, PCM2E, PCM2F, PCM2MFE, PCM2MRE, PCTM3, PCTM4, PIVH, PIVV, PL10010, PL1055, PL11011, PL12012, PL13013, PL14014, PL15015, PL202, PL211, PL220, PL303, PL303T, PL312, PL321, PL330, PL3MT, PL404, PL413, PL413T, PL422, PL431, PL440, PL4MT, PL505, PL505T, PL550, PL5MT, PL606, PL633, PL651, PL707, PL808, PL909, PLM3, PLM4, PLM5, PLM6, PLM7, PLMF303, PLMF303T, PLMF404, PLMF404T, PLMF505, PLMF505T, PLMF606, PLMF707, PLMR303, PLMR303T, PLMR404, PLMR404T, PLMR505, PLMR505T, PLMR606, PSM001, PSM002, PSM003, PSM004, PSU001, PSU002, PSU003, PSU004, PSU005, PSU006, PSU007, PSU008, PSU009, PSU10, T20X20, TAP40, U, XXX.

Series sin contraste independiente: *, CRHP, GMA100, GMA50, GMA5016, GMA50R, GMA55, GMA55C16, GMA6016, GMA65, GMA65OPTC16, GMA75, GMA81, GMAP, GMAPF, GMBASTIDOR, GMC30056, GMC30060, GMC300FI, GMC300J56, GMC300J60, GMC800, GMC800D, GMCGOS, GMI60RL, GMIBIZA, GMM100, GMM350, GMM55, GMPC100, GMPC100R, GMPC110E, GMPC110ER, GMPC135ET, GMPC135M, GMPC135ME, GMPC350FI, GMPC70, GMPC76, GMPCGOS, GMPCM, GMPMU, GMPU.
