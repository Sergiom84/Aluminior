# Estado actual de Aluminior

Revisión local: 20/09/2026. Este es el punto de entrada para el estado del código.
Las observaciones anteriores conservan su fecha y sus límites; no certifican el
estado de producción ni autorizan ejecutar sus antiguos encargos.

## Encargo vigente

El usuario ha autorizado continuar cerrando las fases. Esta continuación parte
de `a2d62ce` y aborda guardado/reintento (fase 1) y aceptación local de geometría
(fase 2), sin repetir el saneamiento. Commit e integración local en main están
autorizados; no se hace push.

Resultado: [fase 1](paridad/fase-1/00-resumen.md) aceptada técnicamente en QA;
[fase 2](paridad/fase-2/03-aceptacion-local.md) verificada en navegador y PDF.
El contraste directo con Productor y las reglas de fases posteriores conservan
sus puertas de evidencia. Workspace: `C:/Users/laral/Documents/Aluminior`.

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
   que un Markdown los mencione. No se ha repetido aquí la observación de Productor.
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
