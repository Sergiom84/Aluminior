# Estado actual de Aluminior

Revisión local: 20/09/2026. Este es el punto de entrada para el estado del código.
Las observaciones anteriores conservan su fecha y sus límites; no certifican el
estado de producción ni autorizan ejecutar sus antiguos encargos.

## Encargo vigente

Saneamiento modular y documental, conservando comportamiento, seguido de una
[auditoría de fases 0–8 y alcance sin escritorio](paridad/ESTADO-FASES.md).
El usuario ha autorizado commit e integración en main. Las siguientes fases
de construcción quedan a la espera de su indicación.

Workspace de esta revisión: `C:/Users/laral/Documents/Aluminior`. Se encontraron
cambios previos sin confirmar, incluidos geometría compartida, lienzo y documentos
de fases. Se han conservado. Las rutas OneDrive y las de otros equipos de los
relevos antiguos no deben usarse como destino automático.

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
| Persistencia de cerramientos | Servicios transaccionales, snapshot económico y pruebas de rollback/copia | No sustituye la aceptación del recorrido completo de seis módulos |
| Geometría | `geometriaCerramiento`, `proyectarCerramiento` y adaptadores web/PDF | Fase 2 implementada; aceptación visual final pendiente según su entrega |
| Manos y 1OFI | Geometría y pruebas específicas en core; B1 y tramo 1OFI documentados | No generalizar cotas ni familias sin evidencia |
| Producción | Optimizador, despunte, hojas y componentes de producción | No acredita que todos los cortes sean fabricables |
| Tarifas | Modelo de venta, margen y recálculo puro | No confirma tarifas del taller ni paridad de todas las herramientas masivas |
| ETL | Importador modular y pruebas sintéticas de equivalencia | No se ha ejecutado una importación real en este saneamiento |

## Pendientes conservados

1. Fase 0: la auditoría declara aceptación parcial. Esta copia no contiene los
   documentos de `docs/paridad/fase-0/` citados en los prompts. No se reconstruyen
   ni se dan por aprobados a partir de esas referencias.
2. Fase 1: aceptación completa de composición 6640×1020, conservación de U1,
   reintento/doble envío, reapertura y PDF. La auditoría disponible sigue siendo
   [parcial](paridad/fase-1/04-auditoria-74e0c95.md); faltan en esta copia sus otros
   documentos citados. Las pruebas de servicios no cierran por sí solas el recorrido UI.
3. Fase 2: el [resumen](paridad/fase-2/00-resumen.md) declara implementación
   geométrica terminada con aceptación visual final pendiente. El
   [handoff](paridad/fase-2/02-handoff-fase-3.md) conserva los pasos de aceptación.
   El commit `74e0c95` citado por el plan no existe en este repositorio tras
   actualizar referencias remotas; la auditoría vigente detalla diferencias
   concretas de fase 1 entre el informe y el código disponible.
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
