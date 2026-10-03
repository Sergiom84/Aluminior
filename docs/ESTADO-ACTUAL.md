# Estado actual de Aluminior

Revisión documental: 03/10/2026. Consolidación documental: `ee0dc16`, sobre el código
`main` de `9bc879e`.
Este es el único punto de entrada de estado y siguiente trabajo.

## Qué funciona

- Producción: catálogo visual de **160 estructuras**, incluida la entrada
  directa al configurador. Migración `0022_catalogo_diseno` y relleno aplicados
  en Supabase según el cierre autorizado del 02/10 y el contexto del usuario.
  **Verificado por Sergio en la web publicada el 02/10/2026:** 160 modelos
  y composición C2 + C3. Esta observación acredita el catálogo y la composición;
  no certifica la valoración del motor.
- Código: composición bidimensional, configuración por elemento, búsqueda de
  vidrio, uniones, guardado de una línea GRUPO, reapertura, copia y PDF.
  La existencia del código no acredita paridad integral con Productor.
- Motor de catálogo integrado en main: tablas de `0023_motor_catalogo`,
  protección `0024_motor_catalogo_rls`, cargador dirigido y lector compatible.
- Banco local medido el 03/10 con la copia `Anterior.mdb` y los servicios web:
  **91/523 líneas elegibles al mismo precio (17,40 %)**, frente a 5/523 de base.
  434 exclusiones conservadas; 26 cercanas, 321 distintas, 85 sin valorar y 0 errores.
  Iteraciones `363e258`, `f235dfc`, `b21abe6`: Acabado2, escala de cortes del snapshot
  y mapeo de nTAcris 0/1 a la primera opción. Ninguna igualdad anterior perdida.
  [Resultados, mapeo y propuestas](paridad/BANCO-CONTRASTE-2026-10-03.md).
  Catálogo cargado solo en `aluminior_real_test`; precios y márgenes sin modificar.
- Desarrollo en Mac con Docker. En la base local `aluminior_test` se comprobaron el 02/10
  25 migraciones y RLS en las once tablas del motor; catálogo y estructuras
  vacíos. La base con datos reales de ensayos anteriores no estaba disponible el 02/10.

## Qué falta: valoración

- El cierre del importador del 02/10 informa despliegue en Render y 0023/0024
  aplicadas en Supabase, con las once tablas nuevas vacías. **Sin verificar
  directamente aquí**; la carga de datos del motor continúa pendiente.
- La web conserva la vía anterior si falta el catálogo. Tener 160 dibujos
  disponibles no significa que las 160 estructuras tengan precio completo.
- Ensayos locales fechados con catálogo cargado obtuvieron PVP con avisos para
  C2 y PC2; fijo 0, 2O y 1OFI siguieron incompletos en GMC400.
  No se repitieron estos ensayos en la base vacía de esta auditoría.
- Falta contraste integral de artículos, medidas, herrajes, vidrio, mano de
  obra, tarifas y redondeo con iguales entradas en Productor.
  No hay aceptación general de precio ni fabricación.

## Riesgos

- El importador completo vacía tablas y puede destruir documentos.
  Usar únicamente la carga dirigida para el alcance autorizado.
- Un resultado incompleto conserva importe nulo y «Sin valorar»;
  no convertirlo en cero ni aceptar sumas parciales como precio completo.
- Los snapshots `FILA_CENTIMOS` necesitan el lector integrado compatible:
  no revertir a una versión antigua sin revisar documentos guardados.
- Diseños específicos, variantes y flujos sin evidencia siguen pendientes.
  Las capturas y salidas privadas mencionadas en informes pueden no existir
  en otra copia; no reconstruir evidencia ni asumir sus resultados.

## Siguiente paso

Revisar las [propuestas del banco local](paridad/BANCO-CONTRASTE-2026-10-03.md):
acabados, compactos/accesorios, PVP y entradas históricas no representables.
Verificar cada regla antes de corregir el motor y repetir la medición local.
La medición no depende de Supabase: la carga de producción queda después,
con resultados conocidos, destino y respaldo verificados y alcance específico
autorizado. Después, comprobar guardado, recarga y PDF en ese entorno.

## Enlaces

- [Integración, cargador y verificación del motor](paridad/INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).
- [Catálogo visual y observaciones](paridad/CATALOGO-REAL-2026-10-02.md).
- [Mapa y criterios de paridad](paridad/PARIDAD-PRODUCTOR.md).
- [Arquitectura](../ARQUITECTURA.md) · [Contrato](../AGENTS.md).
- [Índice: evidencia e histórico](INDICE-DOCUMENTACION.md).
- [PostgreSQL local y pruebas](../packages/db/README.md).
