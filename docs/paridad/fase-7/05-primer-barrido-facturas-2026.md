# Primer barrido de cobertura de facturas 2026

Revisión posterior del código: antes de certificar procedencia, validar
TipoOrigen/TipoDocOrig y el origen por línea frente a cabecera. El analizador
actual exporta estos campos pero no los utiliza al enlazar presupuesto.
Los recuentos siguientes describen coincidencias por las claves empleadas;
no sustituyen esa validación ni son una comparación económica. Las mejoras
de integridad de reanudación/CSV están recogidas en el relevo vigente.


> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites. El orden y estado de tareas pertenece al [roadmap vigente](../../../ROADMAP-PARIDAD-PRODUCTOR.md); sus encargos, permisos y pendientes fechados no se reactivan.

27/09/2026. Este barrido inicia el trabajo de
[cobertura integral](04-cobertura-integral-y-facturas-2026.md). **No certifica
paridad de cálculo ni precio automático.** No modifica Productor, Supabase,
migraciones ni documentos comerciales.

## Fuente y método

`scripts/exportar-facturas-2026.ps1` exige una copia independiente de
`EMP0016/Anterior.mdb` y verifica su SHA-256 contra el archivo Anterior. Abre
la copia con ACE/ADODB en modo lectura y exporta únicamente campos técnicos de
facturas fechadas en 2026, catálogo y documentos de origen relacionados. Los
CSV, el manifiesto y los casos quedan en `output/facturas-2026/`, ignorado por
Git. No contienen nombre, dirección ni NIF de clientes, pero sí identificadores
e importes comerciales: no publicar ese directorio.

`scripts/analizar-facturas-2026.mjs` comprueba recuentos, claves compuestas y
produce un resumen y una matriz local. Los resultados de facturas son oráculo
de contraste. Ningún corte ni total histórico entra en el motor de Aluminior.

```powershell
./scripts/exportar-facturas-2026.ps1 `
  -Copia output/investigacion-fuentes/EMP0016-Anterior.mdb `
  -Anterior C:\Productor\Aluminio\EMP0016\Anterior.mdb `
  -Destino output/facturas-2026
node scripts/analizar-facturas-2026.mjs output/facturas-2026
```

La opción `-Reanudar` aprovecha tablas ya exportadas que figuran en el
manifiesto de la misma copia. La cobertura se limita a las facturas que había
en Anterior: 180 documentos, entre el 13 de enero y el 16 de septiembre de
2026. No incluye posibles facturas posteriores del archivo activo.

## Relaciones verificadas

| Nivel | Resultado |
|---|---:|
| Facturas / líneas de factura | 180 / 28.480 |
| Facturas con alguna línea de estructura | 127 |
| Líneas marcadas como estructura | 544 |
| Líneas con número de albarán y línea de origen | 868 |
| Enlaces exactos a cabecera y línea de albarán | 854 |
| De esos enlaces, artículo diferente | 0 |
| Cabeceras de albarán enlazadas a presupuesto por número | 135 / 135 |
| Enlaces exactos adicionales a línea de presupuesto | 715 |
| De esos enlaces, artículo diferente | 0 |

`VFacturasLin.nAlbaran` corresponde a `VAlbaranes.Numero`, no a `Id`. Después
se usa el `Id` interno junto con `nLinAlb`. El albarán enlaza con
`VPresupuestos.Numero`; su `nLinOrig` lleva a la línea del presupuesto. Hay 14
líneas de factura con ambos identificadores de albarán sin enlace exacto y 139
enlaces de albarán que no llegan a una línea de presupuesto. Requieren estudio
de procedencia; no se atribuyen por proximidad de artículo, orden o medida.

## Inventario y cobertura inicial

| Fuente | Recuento | Lectura |
|---|---:|---|
| Estructuras de catálogo | 541 | 495 sin línea de estructura facturada en este periodo |
| Series `ConfigSeries` | 58 | La matriz local registra cada serie observada y ausente |
| Relaciones `EstructurasSeriesAsoc` | 2.134 | Ninguna coincide directamente con el par código de estructura/`Conjunto1` facturado; su semántica queda pendiente |
| Acabados | 18 | Inventario, no validación de compatibilidad |
| Configuraciones de acristalamiento | 70 | Inventario, no selección de vidrio ni valoración |
| Filas `ConfigSeriesTipoHojaDesc` | 49 | Descripciones de tipos; no matriz de validez |
| Cerramientos / filas de cerramiento en facturas | 42 / 240 | 35 facturas contienen al menos una unión |
| Opciones de herraje de factura | 5.524 | Se conserva la selección técnica local para contraste posterior |

De las 544 líneas de estructura, 543 tienen código en `Estructuras`; una línea
con código `T` necesita clasificación. En 123 no se resolvió `Conjunto1`. Solo
73 guardan dibujo en la factura, y 4 tienen alguna fila en
`VDatosLinDetDis` bajo el enlace directo usado aquí. La ausencia de dibujo en
factura **no demuestra** que no exista plantilla en catálogo o en el documento
de origen. Se verificó que las 155 filas de detalle apuntan por
`nVDoc` + `nVLinEstr` a una línea padre de factura; `nVLinEstr` no es el
`nLinId` de `VDatosLinEstr`. Hay 73 marcas de diseño específico y 32 de
precio o descuento manual en líneas de estructura; esos casos necesitan
comparación separada.

Las 180 cabeceras usan el código de tarifa `1`, pero eso no acredita que sus
precios fueran constantes durante 2026 ni que la tarifa actual sea la misma.
Hay 14 facturas con descuento de cabecera positivo y 159 líneas de cualquier
tipo con alguna marca de precio, tarifa o descuento manual. El IVA de cabecera
es 21 en 175 facturas y 0 en 5. Los importes guardados deben contrastarse con
la tarifa y las condiciones vigentes en cada fecha; no se han recalculado.

Los estados del barrido son: **catalogado** 543, **pendiente de catálogo** 1,
**calculable** 0 acreditados y **contrastado** 0. Catalogado solo confirma que
el código se encuentra en el catálogo de esta copia. No afirma que el motor
resuelva materiales, opciones, impuestos o precio. Las relaciones de
`EstructurasSeriesAsoc` y las combinaciones sin factura siguen pendientes de
verificación directa; ninguna se etiqueta incompatible por ausencia de uso.

## Trabajo que falta para la aceptación del plan

1. Explicar los 14 y 139 enlaces ausentes; localizar el diseño en el origen
   correcto y reconstruir cada entrada sin utilizar el despiece histórico.
2. Registrar y comparar por etapa el resultado del motor: perfiles, cantidades,
   cortes, vidrio, juntas, junquillos, herrajes, consumo, coste, venta y
   redondeo. Mantener precio nulo mientras el cálculo esté incompleto.
3. Verificar tarifa y vigencia por documento; separar descuentos, ajustes y
   modificaciones manuales antes de cualquier coincidencia monetaria.
4. Contrastar con Productor los casos válidos ausentes, límites e
   incompatibilidades; completar facturas posteriores con una copia estable.
5. Probar en ambos productos el flujo, teclado, dibujos, documentos y anchos
   representativos de escritorio y móvil.

Este barrido no cambia reglas del motor ni la interfaz porque aún no hay
evidencia suficiente para generalizarlas.
