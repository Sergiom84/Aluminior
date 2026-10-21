# Accesorios de familia 112 (tubos): cerrado sin regla

21/10/2026. Etapa A sin implementar nada, sin ejecutar Productor y sin mochila
de licencia. Evidencia del volcado privado `EMP0016/Anterior.mdb` (SHA-256
`e8518386…23721a0`) en solo lectura, más el catálogo cargado en la base efímera
local. No hay cambio de código: la causa queda cerrada, no resuelta.

## Qué se investigó

`accesorio-de-linea-no-representable`, tres líneas del banco: `caso-01430`,
`caso-01577` y `caso-01871`, 2.664,34 € esperados, las tres sin valorar y sin
ninguna co-causa compartida por todas (`techo-de-causa.mjs accesorio`).

Las tres se rechazan por el mismo motivo y no por tres distintos: el adaptador
del banco solo admite las familias 100 (compacto), 101 (mosquitera) y 102
(tapajuntas), y estas líneas llevan un accesorio de **familia 112, tubos**
(`scripts/lib/banco-contraste/accesorios.ts`). El rechazo es del adaptador de
medición, no de `packages/core`.

## Lo que queda acreditado y es reutilizable

| Hecho | Fuente | Qué no demuestra |
|---|---|---|
| El artículo del tubo sale de `estructura_componentes` del propio accesorio: `GMTUB2`/`GMTUB3` → `GM60X40`, `GMTUB80X40`/`GMTUB40X80` → `GM80X40`, `GMTUB60X60` → `GM60X60` | catálogo local, tabla `estructura_componentes` | Que esas seis estructuras agoten la familia 112 fuera de EMP0016 |
| Unidad `ML`, sin mínimo ni múltiplo, y el importe es `round(largo_m, 2) × PVP(artículo, acabado, tarifa)` redondeado a céntimos | `articulos`, `articulos_pvp` y `core/precios/importe-fila.ts` | Nada sobre el redondeo en el límite: los tres casos caen donde `round` y `ceil` coinciden |
| Verificado al céntimo en las tres líneas: 2,16 × 9,71 = 20,97; 1,09 × 8,08 = 8,81; 1,30 × 13,91 = 18,08 | piezas históricas de `banco.json` | Que la línea completa quede igual: las tres arrastran otras causas |
| Cada estructura de tubo tiene **cuatro** filas de pieza más una de MO: `TUBO` y `TUBOINF` con fórmula `A` (ancho), `TUBOIZ` y `TUBODE` con fórmula `L` (alto) | `estructura_componentes` | Que las cuatro sean excluyentes entre sí |
| Las tres líneas guardan **una sola** pieza de tubo | `banco.json` | Que una sola sea el máximo: tres casos no son una cota |

## Por qué no hay regla

La plantilla ofrece cuatro filas y el despiece guardado conserva una. Nada en
los datos extraídos dice cuál:

- Las filas de `VAccesorios` de `caso-01430` y `caso-01577` son **idénticas**
  campo a campo salvo documento, línea y acabado, y eligen filas distintas
  (`TUBODE` y `TUBOIZ`).
- Ninguna fila de `VOpciones` referencia una estructura de tubo en ninguno de
  los tres casos. Las opciones de línea solo citan la serie y el hueco.
- El modelo no lo determina: `caso-01577` y `caso-01871` son los dos `2O` y
  eligen `TUBOIZ` y `TUBO`.
- `DtoHuecoH`/`DtoHuecoV` solo repiten el descuento nominal del tubo (40 o 80),
  igual en los dos casos `2O` que difieren.

Y la elección **cambia el importe**, porque `TUBO`/`TUBOINF` miden el ancho y
`TUBOIZ`/`TUBODE` miden el alto. No es un detalle de hoja de corte.

## Predicción a ciegas y su fallo

Derivado con `caso-01430` y `caso-01577`, con `caso-01871` reservado, se predijo
para este último: `GM80X40`, cantidad 1, largo 1520 mm (alto), metraje 1,52,
precio 13,91, importe **21,14 €**, fila vertical.

Lo real: fila `TUBO`, largo **1300 mm** (ancho), metraje 1,30, importe
**18,08 €**. Acertados artículo, cantidad, acabado, unidad y cadena de precio;
falló la fila, que es justo lo que decide el importe.

El holdout hizo su trabajo. Con los dos casos de derivación se habría
implementado «un tubo vertical a la altura del hueco» y habría dado un importe
erróneo en un tercio de la población conocida.

Contaminación declarada: al censar la familia 112 se vio que las tres líneas
guardan una sola pieza de tubo, incluido el caso reservado. La cantidad no era
ciega; la fila, el largo y el importe sí.

## Qué reabre la causa

Cualquiera de estas, no una conjetura:

- Un campo o tabla que codifique la posición del tubo y que no esté en la
  extracción actual: el diseño de la línea (`VDatosLinDetDis`), una tabla de
  accesorios no exportada, o una cota por accesorio.
- Observación en Productor con mochila de licencia: crear la línea con un tubo
  y ver qué controla la posición.
- Más líneas con familia 112 que revelen un patrón por serie, hueco o
  geometría. Tres casos con tres filas distintas no lo dan.

Mientras no haya una de las tres, **no se amplía la lista blanca de familias**:
admitir la familia 112 sin saber qué fila aplica produciría cuatro piezas donde
Productor guarda una, o una pieza con la medida equivocada.
