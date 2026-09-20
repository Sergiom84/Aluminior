# Fase 2 — resumen

Fecha: 20/09/2026. Estado: **implementación geométrica completada y aceptación local de navegador/PDF realizada; contraste directo con Productor iniciado y parcial**.

## Resultado

- La composición principal usa un único SVG y un sistema común en milímetros.
- `geometriaCerramiento` coloca módulos y uniones sin conocer viewport, React ni PDF.
- `proyectarCerramiento` aplica un único factor uniforme, traslación y márgenes.
- Pantalla y PDF consumen la misma geometría pura desde `@aluminior/core/estructuras`.
- La fixture sintética histórica conserva 1:4 para el fijo 300/1200 y 5:3 para grosores 100/60. No son grosores nativos confirmados: desde c756aea seleccionar PSU001 carga 2 mm, según E08 del operador.
- Las uniones más largas amplían el límite visible sin alterar el alto contractual.
- La selección ahora incluye `moduloId`, evitando colisiones entre huecos con IDs repetidos, y módulos/uniones son operables con Enter/Espacio y foco visible.

## Módulos

- `packages/core/src/estructuras/geometria-cerramiento.ts`: geometría física y proyección.
- `packages/web/app/dashboard/presupuestos/[id]/_components/lienzo-cerramiento.tsx`: SVG común, símbolos y selección.
- `dibujo-estructura.tsx`: representación aislada de las miniaturas del catálogo.
- `disenador-estructura.tsx`: composición, estado, catálogo y paneles existentes; 210 líneas tras la extracción.
- `pdf/geometria-cerramiento.ts`: adaptador del soporte PDF.

## Regresión geométrica

La batería pura cubre siete casos: medidas y razones del caso 6640×1020, factor común, unión más larga, módulo de 12 mm sin mínimo deformante, alturas distintas alineadas arriba, invariancia en viewports 1440×900/1024×768/375×812 y rechazo de límites no representables. El fichero específico ejecutó 7/7 pruebas correctamente; los typechecks de Core y Web también finalizaron correctamente.

## Aceptación vigente

La continuación ha resuelto el bloqueo de guardado, comprobado el reintento,
la selección por teclado, tres viewports y el PDF real de seis módulos valorados
con catálogo sintético. Ver [03-aceptacion-local.md](03-aceptacion-local.md) para
resultados, correcciones y límites. No equivale a cierre de paridad directa con
Productor ni de toda la ergonomía móvil. La descripción histórica del bloqueo
de petición se conserva en los informes anteriores, sin atribuirle una causa
no reproducida en esta copia.

## Fin de jornada

Ver [cierre del 20/09/2026](../../CIERRE-JORNADA-2026-09-20.md): observación directa parcial de cuatro módulos y estado de edición pendiente. No se declara cierre de fase 2.
