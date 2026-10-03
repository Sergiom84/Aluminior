# Cortes por referencia y descuento de catálogo

> Continuidad revisada el 27/09/2026: [punto de partida vigente](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/docs/paridad/INICIO-SIGUIENTE-CONVERSACION.md). Las comprobaciones fechadas conservan sus límites; consultar el relevo para el trabajo siguiente.

27/09/2026. Implementación solicitada tras la
[investigación de fuentes](../../../paridad/fase-7/02-investigacion-fuentes-2026-09-27.md).
Cambios locales en main, sin push. **No cierra el precio automático completo.**

## Comportamiento implementado

Para los perfiles ordinarios GM440/443/455/449/450/451 de C2/C3, serie GMC400,
el servidor calcula primero el corte de cada antecedente, evalúa `REF` con ese
corte y resta los descuentos de los dos extremos de la pieza dependiente.
No usa cortes observados del histórico como entrada. No aplica después el
rebaje histórico por segunda vez.

El modo nuevo se limita a ese ámbito contrastado. Los demás artículos,
estructuras y series conservan su resolución anterior. Las ranuras 222–229
siguen pendientes de resolver por la vía de herraje; no se convierten en
perfiles ni se omiten del diagnóstico económico.

El resultado se bloquea cuando faltan enlaces, fórmulas, dimensiones o
descuentos, ante referencias cíclicas/ambiguas, perfiles adicionales sin
resolver o medidas no positivas. Una fila de descuento con valor cero es
válida; la ausencia de fila no equivale a cero. El descuento del tipo de hoja
tiene prioridad frente al general `G`; duplicados de la misma clave se rechazan.

La variación histórica de marco de −53 mm no se convierte en otra constante
de hoja. La implementación calcula la plantilla ordinaria actual, no reproduce
ediciones históricas del diseño. Las variantes y `ConjuntosDescuentosDif`
requieren ampliar el contexto y verificar su precedencia antes de habilitarlas.

## Límites modulares

- `core/despiece/cortes-referenciados.ts`: recorrido puro de dependencias y
  selección de descuentos, sin I/O.
- `core/despiece/medir-pieza.ts`: extracción de evaluación/rebaje del módulo
  anterior; 18 pruebas de rebaje/junta pasaron antes de añadir el modo nuevo.
  `calcular.ts` conserva agregación, cantidades y consumo.
- `web/.../estructuras/cortes-catalogo.ts`: carga de datos y delimitación de
  cobertura; `materiales-estructura.ts` lo incorpora a la valoración existente.
- `etl/importacion/cortes-catalogo.ts`: importación suplementaria atómica de
  metadatos de catálogo y descuentos; excluye las instancias de documentos.

Se revisó la cohesión de `calcular.ts` al extraer la medida: deja de acumular
evaluación, rebaje y recorrido de referencias en el mismo archivo. No se ha
movido cálculo ni SQL a las acciones o al diseñador.

## Persistencia y carga

Nueva migración aditiva `0022_cortes_referenciados.sql`, generada por Drizzle,
con dos tablas: `estructura_referencias_corte` y `conjunto_descuentos_corte`.
Las migraciones SQL anteriores permanecen intactas. El journal y el snapshot
incorporan la nueva migración. No se aplicó nada a Supabase.

La carga conserva `id`, `nLin`, `DisIdRefLargo`, `DisFRefLargo`, fórmulas de
corte, grupos de extremos, tipo de hoja y perfil/grupo adicional. No incluye
documentos históricos. Se mantiene la distinción entre ID de pieza y nodo
de diseño: **id no es DisIdIt**.

El CLI completo de ETL incorpora la carga nueva después del catálogo anterior.
La función histórica `importarCatalogo` mantiene su contrato; quien la invoque
directamente deberá invocar también `importarCortesCatalogo`.

Para actualizar únicamente estas dos tablas en una base QA ya migrada:

```powershell
npm run etl:cortes:local -- --origen export_datos/EMP0016 --base aluminior_real_test
```

Este comando no lee `.env`, fuerza localhost:55433 y exige un nombre `_test`.
No ejecuta migraciones ni vacía presupuestos. La sustitución de ambas tablas
ocurre en una transacción; faltas de archivo, reglas duplicadas o descartes
impiden publicar una carga incompleta. No usar el ETL completo para esta
actualización: su vaciado histórico incluye documentos.

Aplicado únicamente en `aluminior_real_test`: 14039 referencias y 35723
descuentos, cero descartes; el presupuesto QA existente se conserva. La
migración se probó también en la base efímera `aluminior_test`.

## Resultado y comprobaciones

Catálogo real, consultas locales sin guardar ni revalorar documentos:

| Caso | Perfiles comprobados | Marco horizontal | Hoja horizontal | Hoja vertical |
|---|---:|---:|---:|---:|
| C2 1200 × 1200 | 12 | 1159 mm | 580 mm | 1147 mm |
| C3 1800 × 1200 | 16 | 1759 mm | 574,166667 mm | 1147 mm |

La valoración completa sigue devolviendo precio `null`: quedan 9/8 referencias
de asociado pendientes y el vidrio sin calcular. En la vía actual de vidrio,
los herrajes genéricos HV/HH pendientes interfieren además con el emparejamiento;
los perfiles laterales/centrales/horizontales de corredera tampoco deben
asimilarse al único perfil de una hoja abatible. Este trabajo no cambia esas
reglas ni descarta piezas para forzar un importe.

Verificación:

- Core completo: 505 pruebas antes de la última guarda; después, 31 pruebas
  dirigidas pasan, incluidas 13 del resolver nuevo y las 18 regresiones previas.
- ETL: 4 pruebas de transformación, equivalencia del importador histórico y
  prueba PostgreSQL de repetición/rollback con valores sintéticos.
- Web: 41 pruebas dirigidas pasan (3 nuevas, 23 de valoración agregada y 15
  de emparejamiento). Se comprueba el precio público nulo cuando hay datos
  ausentes; un subtotal interno parcial no se confunde con precio final.
- Typecheck de todos los paquetes y revisión de arquitectura sin errores.

Sin cambio de interfaz ni nueva aceptación visual de Productor. Continúan
pendientes el desglose 260499 y la conexión remota vigente. Los resultados
no certifican todas las series, diseños editados, fabricación ni precio completo.
