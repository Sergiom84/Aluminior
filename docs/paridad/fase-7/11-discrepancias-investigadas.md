# Discrepancias económicas y de despiece investigadas

27/09/2026. Continuación de [fase 7/09](09-continuacion-local.md), sobre la
selección de **25 diferencias económicas y 9 despieces distintos** de ese
contraste. Catálogo como entrada del motor; despiece histórico exclusivamente
como oráculo. CSV existentes, sin bases remotas ni ejecución de Productor.

## Resultado y cambio acotado

Se corrige un defecto numérico de la comparación de medidas: un resultado
Double situado inmediatamente por debajo de un límite decimal se asignaba
a una décima distinta de su representación decimal. El comparador compensa
un error del orden de la precisión de Double antes de cuantizar.

Se conserva la precisión de **0,1 mm**. No se aceptan como iguales residuos
Single del CSV, ni se cambia el precio, importe, cantidad, fórmula o catálogo.
Las pruebas incluyen diferencias reales a ambos lados del límite y vidrio.

| Selección original de 34 líneas | Después de esta corrección |
|---|---:|
| Piezas coincidentes; importe explicado por precios unitarios de factura | 1 |
| Piezas coincidentes; diferencia económica todavía en el estado pendiente | 25 |
| Despiece distinto | 8 |

La nueva herramienta diagnostica las causas dentro de estos estados. No
reclasifica automáticamente las diferencias económicas como cambios de tarifa.
Tampoco certifica el importe comercial completo ni la fabricación.

## Las 25 diferencias económicas

La investigación empareja piezas preservando multiplicidad y ambos ejes del
vidrio. Ante precios o importes distintos en piezas idénticas conserva la
ambigüedad; no los asigna por orden. Compara cada importe guardado con la
revaloración del metraje calculado, sin alimentar el motor con ese dato.

| Grupo principal | Líneas | Evidencia y límite |
|---|---:|---|
| ML, precios exportados con residuos decimales | 10 | Los céntimos divergentes desaparecen en esas filas al ensayar el precio a cuatro decimales. Ese ensayo queda separado; no cambia el precio oficial. |
| ML, límite de redondeo del producto | 6 | Coinciden las piezas y el metraje. El producto precio por metraje está en un límite de medio céntimo y el importe guardado cae en el otro céntimo. Falta acreditar la política/intermediarios numéricos del original. |
| M2, incremento también presente en el precio guardado | 5 | El catálogo aplica un incremento del 8 % al metraje; el precio de factura coincide al céntimo con el PVP incrementado. Reutilizar ese precio sobre el metraje ya incrementado duplica el efecto. |
| M2, superficie facturable distinta | 4 | El mismo artículo, cantidad y medidas llevan a importes distintos aun sin incremento. Una línea tiene campos históricos completos; tres carecen de esos campos en el CSV completo antiguo. |

Una de las cinco líneas con incremento también contiene residuos de precio
en ML. Por eso el resumen automático devuelve ocho líneas exclusivamente M2
y una mixta; no son categorías adicionales a las 25.

En las cinco líneas del tercer grupo, las filas M2 coinciden al céntimo al
ensayar el **metraje sin incremento** y el precio de factura. En cuatro
líneas, este ensayo reconcilia también el total completo revalorado; la
quinta mantiene tres céntimos de ML. Esto identifica una limitación del
contraste económico actual: sus dos vías colocan el incremento en campos
distintos. No se modifica la API económica en esta unidad.

En la línea de superficie con corroboración completa, `Metraje`,
`LargoConMultiplo`, `AnchoConMultiplo` y los múltiplos aplicados están guardados
en `VFacturasLin.csv`. Los lados guardados conservan restos fraccionarios y
no son múltiplos exactos del paso del catálogo; por ello cambia una centésima
de superficie respecto al cálculo del motor. Es una divergencia observable
del cálculo histórico. No se copia ese comportamiento ni se presupone que
sea la causa de las otras tres líneas sin sus campos completos.

La copia CSV completa alcanza menos documentos que la exportación de
facturas usada como oráculo. La herramienta exige concordancia de identidad,
artículo, cantidad, precio, importe y medidas compartidas antes de mostrar
sus campos como corroboración; esos campos nunca sustituyen la entrada del
motor ni convierten una ausencia en cero.

## Los nueve despieces originales

| Causa observada | Líneas | Resolución |
|---|---:|---|
| Error Double en cuantización a una décima | 1 | Corregido en el comparador; todas las piezas coinciden y la revaloración explica el importe. |
| Residuos pequeños de exportación y materiales adicionales | 2 | Residuos de hasta 0,0001 mm, junto con un tubo y una aportación de mano de obra por línea. Se mantienen diferentes. |
| Tubo adicional en la factura | 1 | El motor no lo genera desde la plantilla. Falta acreditar si es edición de instancia o una regla adicional. |
| Geometría pendiente | 5 | Difieren perfiles, asociados y vidrios. Las medidas generales coinciden con las del presupuesto de origen enlazado. |

Los cinco casos geométricos no se explican por haber tomado las medidas
generales de otro documento: el enlace factura → albarán → presupuesto
recupera las mismas medidas de entrada. Esto no prueba qué plantilla,
descuento, edición o versión del catálogo se empleó al guardar el despiece.
No se deducen cotas desde los cortes ni se alteran descuentos para ajustarlo.

Los tubos y su mano de obra tampoco se excluyen del comparador para mejorar
el porcentaje. Se necesita evidencia de su origen antes de tratarlos como
extras manuales o ampliar las asociaciones de catálogo.

## Reproducción y pruebas

```powershell
node --import tsx scripts/investigar-discrepancias-facturas.ts export_datos/EMP0016 output/facturas-2026 output/contraste-final-20260927/detalle.json output/diagnostico-discrepancias/reproducible
npx vitest run scripts/lib/contraste-despiece-facturas.test.ts scripts/lib/diagnostico-discrepancias.test.ts
npx tsc --noEmit --target es2022 --module esnext --moduleResolution bundler --allowImportingTsExtensions --strict --skipLibCheck scripts/lib/diagnostico-discrepancias.ts scripts/investigar-discrepancias-facturas.ts
```

Ejecutado: **25 pruebas aprobadas** y comprobación TypeScript sin diagnósticos.
Prueba causal: retirada solo la compensación Double, **dos pruebas fallan**;
restaurada, pasa la batería. No se han reducido aserciones ni modificado el motor.

La herramienta exige una selección no vacía, entrada inequívoca por línea y
una salida dentro de una subcarpeta ignorada de `output/`. Imprime solamente
agregados. `detalle.json` conserva la trazabilidad por línea y los ensayos;
`fuentes.json` registra SHA-256 de los CSV y la selección usada. Datos y
resultados detallados permanecen fuera de Git. No se ha leído ninguna MDB.

La revisión independiente endureció el enlace al documento de origen: cada
salto debe tener exactamente una coincidencia, incluso si varios caminos
terminasen en la misma línea. Se añaden pruebas por cada salto, documento
incompatible y medida ausente. La reproducción usa también el resolvedor
compartido de cotas de instancia y propaga sus bloqueos; no omite entradas
extendidas de una línea al investigar su discrepancia.

La revisión final corrigió el diagnóstico de residuos: una medida ausente
no se convierte en cero para explicar diferencias. El reproductor con largo
nulo frente a cero y la prueba con ancho ausente permanecen pendientes;
26 pruebas focales de comparador y diagnóstico aprobadas.

## Trabajo restante

- **Ahora:** acreditar la política de redondeo monetario y el contrato de
  revaloración con incrementos; obtener los campos económicos completos de
  las tres líneas M2 pendientes; acreditar tubos y las cinco geometrías.
- **Después:** contraste de versiones históricas del catálogo y ediciones de
  instancia, manteniendo separadas entradas, reglas y resultado guardado.
- **Experimental:** reproducir peculiaridades numéricas del legacy. No debe
  convertirse en regla de precio sin una decisión explícita y pruebas.
