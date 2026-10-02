# Estado actual de Aluminior

Revisión local: 02/10/2026. Este es el punto de entrada para el estado del código.

## 02/10/2026 — catálogo real y entrada directa al configurador

El alta de línea abre en el configurador de cerramientos, con «Colocar X a la
derecha» y doble clic en la miniatura. El escaparate pasa de 14 plantillas a
160 generadas del catálogo importado (correderas incluidas), que cubren 728 de
737 elementos reales. Migración `0022` y relleno dirigido aplicados en Supabase:
la web publicada ofrece las 160 (nunca usar el importador completo contra
Supabase: trunca presupuestos). El trabajo ya se hace en un Mac
con Docker. Ver [catálogo real](paridad/CATALOGO-REAL-2026-10-02.md).

## 25/09/2026 — fase 4: materiales por elemento

Perfiles y vidrio por elemento como excepción sobre el general de la línea,
respaldado por los datos reales (64 y 55 de 175 cerramientos los mezclan), y
aplicación a modelos iguales con confirmación. Productor quedó bloqueado por
un aviso de licencia y no se observó «Actualizar todos los elementos».
Ver [resumen de fase 4](paridad/fase-4/00-resumen.md).

## 25/09/2026 — fase 3: composición bidimensional

Observado en Productor 0017 (260497, cerrado sin Aceptar): el configurador
compone en dos dimensiones con anclajes a la derecha y debajo, puntos verdes y
uniones nuevas sin configurar de 20 mm. Implementado en Aluminior como
configuración v3 compatible con v1/v2, configurador con la disposición de
Productor y arrastre con alternativa de teclado. Corregidos dos defectos que
impedían guardar cerramientos con el catálogo real. Ver
[resumen de fase 3](paridad/fase-3/00-resumen.md) y
[evidencia](paridad/fase-3/01-evidencia-composicion.md).

Entorno local: `aluminior_real_test` en el Postgres de pruebas (55433) contiene
el catálogo importado de `export_datos/EMP0016` con el ETL existente; es
efímero (tmpfs). Configuración de lanzamiento `web-local-real` (puerto 3002,
opt-in QA local). Nada se escribe en Supabase.
Las observaciones anteriores conservan su fecha y sus límites; no certifican el
estado de producción ni autorizan ejecutar sus antiguos encargos.

## Cierre de jornada

Trabajo finalizado por indicación del usuario el 20/09/2026. Commit, integración
en main y push autorizados para este cierre. Consultar el
[relevo de fin de jornada](CIERRE-JORNADA-2026-09-20.md) antes de continuar.

Fase 1 aceptada técnicamente en QA; fase 2 con geometría y navegador/PDF
verificados localmente y contraste directo con Productor iniciado, aún parcial.
Último código: `c756aea`; la observación posterior no cambió código.
En Productor 0017 quedaron tres ventanas y un fijo en el configurador. El ancho
del fijo estaba en edición (último valor visible 30; un envío posterior para
completar 300 fue interrumpido), sin Actualizar ni aceptación final comprobada.
No reanudar acciones a partir de coordenadas o valores de esta sesión.

## Nueva evidencia del operador

El 20/09/2026 el usuario aporta doce capturas y el recorrido de creación del
presupuesto. Ver [registro de Productor](paridad/OBSERVACION-PRODUCTOR-2026-09-20.md):
arrastre, Actualizar, catálogos, uniones, doble acristalamiento y formas de pago.
PSU001 muestra grosor 2 mm aunque su descripción diga 100mm. El caso final
es 6300 × 1200; queda pendiente contrastarlo con iguales entradas en Aluminior.
Es evidencia nueva, no un cierre adicional de fase ni implementación funcional.

## Arquitectura comprobada

- `packages/core`: dominio puro, cálculo y geometría independientes de UI y BD.
- `packages/db`: esquema Drizzle, acceso PostgreSQL y salvaguardas de pruebas.
- `packages/etl`: importación y mediciones; los ejecutables poseen la conexión.
- `packages/web`: Next.js App Router, React y orquestación de servidor.
`packages/api` ya no existe en este checkout. Se retira el script obsoleto
`dev:api`, que apuntaba a ese workspace ausente; `npm run dev:web` inicia
Next.js con la interfaz y su servidor.

Las entradas públicas de los módulos refactorizados siguen siendo compatibles.
El mapa y las excepciones están en [SANEAMIENTO-MODULAR.md](SANEAMIENTO-MODULAR.md).

## Implementado no significa aceptado como paridad completa

| Área | Evidencia local | Límite |
|---|---|---|
| Presupuestos | Cabecera, líneas, servicios de alta/edición, totales, numeración y copia en `_lib` | No garantiza todas las operaciones de Productor |
| Persistencia de cerramientos | Servicios transaccionales, snapshot económico y pruebas de rollback/copia | Receta de seis módulos aceptada en QA local; no certifica precio comercial |
| Geometría | `geometriaCerramiento`, `proyectarCerramiento` y adaptadores web/PDF | Aceptación local de SVG, teclado y PDF realizada; contraste directo con Productor pendiente |
| Manos y 1OFI | Geometría y pruebas específicas en core; B1 y tramo 1OFI documentados | No generalizar cotas ni familias sin evidencia |
| Producción | Optimizador, despunte, hojas y componentes de producción | No acredita que todos los cortes sean fabricables |
| Tarifas | Modelo de venta, margen y recálculo puro | No confirma tarifas del taller ni paridad de todas las herramientas masivas |
| ETL | Importador modular y pruebas sintéticas de equivalencia | No se ha ejecutado una importación real en este saneamiento |

## Pendientes conservados

1. Fase 0: la auditoría declara aceptación parcial. Esta copia no contiene los
   documentos de `docs/paridad/fase-0/` citados en los prompts. No se reconstruyen
   ni se dan por aprobados a partir de esas referencias.
2. Fase 1: receta de seis módulos aceptada localmente: conservación tras error,
   reintento/doble envío, una GRUPO, reapertura, snapshot y PDF inspeccionado.
   Ver [alcance y límites de idempotencia](paridad/fase-1/00-resumen.md).
3. Fase 2: geometría compartida comprobada a tres tamaños, selección por teclado
   corregida y PDF examinado. Queda el contraste directo con Productor y la
   ergonomía integral de fase 8. Ver [aceptación local](paridad/fase-2/03-aceptacion-local.md).
   `74e0c95` sigue ausente: los arreglos de esta continuación son nuevos y no
   se atribuyen al informe histórico de otra copia.
4. La disponibilidad de capturas y registros de otras sesiones no se deduce de
   que un Markdown los mencione. La observación directa posterior es parcial y está en el relevo de cierre.
5. El estado de migraciones remotas y de datos comerciales no se ha verificado
   en este encargo. Los resultados de pruebas locales no lo certifican.

## Lectura y comprobaciones

1. [AGENTS.md](../AGENTS.md): reglas de trabajo.
2. [ARQUITECTURA.md](../ARQUITECTURA.md): decisiones y límites de módulos.
3. [SANEAMIENTO-MODULAR.md](SANEAMIENTO-MODULAR.md): cambios y verificación.
4. [INDICE-DOCUMENTACION.md](INDICE-DOCUMENTACION.md): clasificación de los Markdown.
5. [PARIDAD-PRODUCTOR.md](../PARIDAD-PRODUCTOR.md): criterios de evidencia.

`npm run check:architecture`, `npm run typecheck` y `npm test` son las
comprobaciones del saneamiento. Las pruebas de integración usan exclusivamente
el [PostgreSQL local de pruebas](../packages/db/README.md).

Continuación del 20/09/2026: [Actualización explícita de medidas y corrección de PSU001](paridad/IMPLEMENTACION-ACTUALIZAR-2026-09-20.md). Implementación y verificaciones locales; contraste integral pendiente.
