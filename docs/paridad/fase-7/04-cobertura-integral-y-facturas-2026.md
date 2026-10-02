# Cobertura integral y contraste con facturas de 2026

> Continuidad revisada el 27/09/2026: [punto de partida vigente](../INICIO-SIGUIENTE-CONVERSACION.md). Las comprobaciones fechadas conservan sus límites; consultar el relevo para el trabajo siguiente.

27/09/2026. Alcance confirmado por Sergio: cubrir todas las tipologías,
series y uniones disponibles en su Productor, conservando su funcionamiento
y modernizando el uso en Aluminior. C2/C3 GMC400 es un caso parcial de cortes,
no el alcance del producto ni una acreditación de valoración completa.

## Referencia de aceptación

Usar las facturas de 2026 de EMP0016 como banco de trabajos reales. No tomar
EMP0015 como referencia de precios vigentes. Los documentos históricos son
resultados de contraste: sus cortes y totales no deben entrar como datos
de partida en el cálculo independiente de Aluminior.

Comprobación efectuada en esta fecha: SHA-256 de la copia local coincide con
EMP0016/Anterior.mdb. Consulta ADODB en modo lectura de VFacturas: 180 facturas,
todas de 2026, desde el 13 de enero hasta el 16 de septiembre. Solo se han
consultado recuentos y fechas; no se han publicado clientes ni documentos.
No se ha calculado todavía una tasa de coincidencia contra Aluminior.

La copia Anterior no acredita las facturas posteriores al 16 de septiembre.
El archivo activo aluminio.mdb tiene fecha de modificación del 26 de septiembre;
esa fecha no demuestra qué facturas contiene. No se ha abierto ni modificado.
Para completar el periodo se necesitará una copia consistente verificada.

## Trabajo necesario

1. Inventariar catálogo y configuración completos: estructuras, tipos de hoja,
   series, acabados, uniones, combinaciones, vidrios y opciones de herraje.
   Separar combinaciones permitidas, incompatibles y pendientes de evidencia.
2. Enlazar cada factura con sus líneas, grupos, estructuras y despieces, y con
   presupuestos/albaranes de origen cuando la factura no conserve el detalle.
   Verificar las claves de enlace antes de atribuir resultados a un caso.
3. Crear una matriz de cobertura por tipología, serie, unión y opciones.
   Recorrer todas las facturas disponibles; la frecuencia sirve para priorizar,
   pero los casos poco frecuentes también forman parte del alcance.
4. Reproducir las entradas en el motor independiente y contrastar selección
   de materiales, cantidades, cortes, vidrio, juntas, junquillos, herrajes,
   consumos, costes, venta, descuentos, ajustes, impuestos y redondeos.
   Registrar diferencias por etapa, no únicamente el total final.
5. Distinguir precio guardado a fecha de factura de recálculo con tarifa actual.
   Identificar importes/descuentos manuales y modificaciones de diseño. No
   convertirlos en reglas automáticas ni asumir que todo 2026 comparte tarifa.
6. Cubrir las combinaciones válidas ausentes de las facturas mediante casos
   controlados contrastados con Productor, respetando las restricciones de
   acceso y sin modificar EMP0016. Incluir límites de medidas e incompatibilidades.
7. Generalizar los módulos de cálculo según reglas verificadas del catálogo,
   evitando excepciones por modelo sin evidencia. Comprobar también el flujo,
   teclado, estados, dibujos, documentos y uso responsive de Aluminior.

Estados de cobertura separados: catalogado, calculable, contrastado y pendiente.
Una muestra correcta no certifica toda una serie. La coincidencia monetaria
requiere la misma tarifa, opciones y ajustes; las tolerancias de cálculo deben
proceder de unidades y redondeos verificados, no de márgenes arbitrarios.

## Conservación

Datos reales, copias y resultados identificables permanecen en ubicaciones
locales ignoradas por Git. Las regresiones versionadas utilizarán casos
sintéticos. Mantener sin valorar los resultados incompletos. Sin push, sin
escrituras en Supabase ni Productor y sin repetir el ETL completo sobre QA.
