# Tarifa de proveedor de doble acristalamiento

**Referencia local, no publicada ni aplicada.** La herramienta y módulos
de esta propuesta están en el main Mac `787d1ad`, excluidos de `origin/main`
`9673659`. Conservar la evidencia y las decisiones; no ejecutar su comando
desde la versión publicada ni mezclar esos commits para retomar A3/A4.
El pendiente del titular se conserva en July (228 en este Mac).

Fecha: 04/10/2026. Estado: **propuesta calculada, sin aplicar**. Pendiente de
decisión del titular y de confirmar hipótesis con el proveedor.

## Cómo valora hoy la app el vidrio

Cada doble acristalamiento es un artículo de la familia 050 con PVP €/m² por
tarifa (`articulos_pvp`), coste por proveedor (`articulos_coste`), metraje con
múltiplos 6×6 cm y mínimo 0,70 m², y recargos por superficie o lado mayor
(`articulos_incrementos_precio`). La valoración (`valoracion-vidrio.ts`,
`importe-fila.ts`) solo lee esos datos, así que una tarifa nueva de proveedor es
un cambio de **datos del catálogo**, no de la fórmula.

## Evidencia medida (EMP0016, CSV de la copia del catálogo)

- 14.652 de los 14.758 artículos de la familia 050 son dobles acristalamientos
  compuestos «exterior/cámara[ ARGON]/interior» del proveedor actual.
- Su coste guardado es **exactamente aditivo**: base 4/cámara/4 + suplemento
  de cámara y argón + un suplemento por cada vidrio. Los 14.652 costes se
  reproducen sin diferencia.
- PVP = coste × un factor fijo por tarifa de venta, redondeado a céntimo; los
  factores medidos están en el resumen privado. Reproducen los 14.652 PVP de
  cada tarifa.
- Los 14.653 artículos con recargo comparten una misma tabla por superficie y
  por lado mayor de 2.500 mm.

La tarifa impresa nueva usa esa misma estructura (precio base, suplementos por
vidrio y cámara, argón por m², recargos por superficie y lado mayor de
3.210 mm). La transcripción, con su huella SHA-256 y sus hipótesis, queda
privada en `export_datos/tarifas-proveedor/`.

## Herramienta

- `packages/core/src/precios/doble-acristalamiento/`: composición desde la
  descripción y coste por componentes. Sin precio, el resultado lleva el motivo
  (vidrio a consultar o no tarifado, cámara o argón sin precio). Nunca se
  rellena con cero.
- `scripts/tarifa-doble-acristalamiento.ts`: solo lectura. Antes de proponer
  nada, comprueba que el modelo reproduce el catálogo guardado. Escribe en
  `output/tarifa-doble-acristalamiento/<tarifa>/` la propuesta completa y un
  CSV por tarifa con el formato de `etl:tarifa` (en modo de prueba por defecto,
  sin escribir nunca en las tarifas 1, 2 y 3).

```bash
npx tsx scripts/tarifa-doble-acristalamiento.ts --tarifa export_datos/tarifas-proveedor/<fichero>.json
```

Resultado del 04/10 con la tarifa del 27/08/2026: 11.616 artículos con coste
nuevo (11.570 bajan, 46 suben; media −15,98 %). Los 3.036 artículos con
laminar gris/bronce, que la tarifa remite a consultar, quedan sin precio nuevo.

## Hipótesis por confirmar

1. La base incluye dos float de 4 mm y la cámara hasta 16 mm, con
   intercalario de aluminio. Las cámaras de 6 a 12 mm también están incluidas.
2. Cada precio de vidrio es un suplemento por sustituir un float de 4 mm.
3. «Climaguard (bajo emisivo)» corresponde a «Climaguard Premium» del catálogo.
4. El primer tramo de recargo por superficie empieza por encima de 3 m².

## Decisiones del titular antes de aplicar

- Si el proveedor nuevo sustituye al actual o convive con él.
- Si el PVP se recalcula con los mismos factores o con otro margen, y en qué
  tarifa de venta se carga. Una tarifa solo con vidrios dejaría sin precio el
  resto de artículos.
- Qué hacer con el laminar gris/bronce mientras no tenga precio.
- Si se sustituyen los recargos por superficie y el mínimo de 0,70 m² por los de
  la tarifa nueva (mínimo de facturación de 0,50 m²).
- Cualquier escritura en Supabase exige autorización expresa y un dry-run previo.

La propuesta no ha modificado el banco de contraste, medido contra la copia
histórica del catálogo con los precios del proveedor anterior. Una eventual
aplicación requiere mantener ese corpus separado y verificar el destino;
no se promete que una modificación de datos carezca de efectos económicos.
