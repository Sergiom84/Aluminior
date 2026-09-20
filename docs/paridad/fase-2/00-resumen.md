# Fase 2 — resumen

Fecha: 20/09/2026. Estado: **implementación geométrica y modularización completadas; aceptación visual final pendiente del desbloqueo de fase 1**.

## Resultado

- La composición principal usa un único SVG y un sistema común en milímetros.
- `geometriaCerramiento` coloca módulos y uniones sin conocer viewport, React ni PDF.
- `proyectarCerramiento` aplica un único factor uniforme, traslación y márgenes.
- Pantalla y PDF consumen la misma geometría pura desde `@aluminior/core/estructuras`.
- El fijo de 300 mm conserva 1:4 frente a 1200 mm; PSU001 de 100 mm conserva 5:3 frente a GMU038 de 60 mm.
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

## Límite de aceptación

La receta persistida se reabrió con 6640×1020 y U1 correcta y se inspeccionó a 1440×900, 1024×768 y 375×812. En móvil el documento no mostró overflow horizontal de página; la tabla mantiene su desplazamiento interno. No se afirma todavía PDF final ni igualdad económica porque la línea de seis módulos continúa sin valorar. Se eliminó la doble interceptación del envío (`action` más `onSubmit` manual), pero la comprobación posterior quedó retenida por la petición anterior del navegador; debe repetirse tras cerrar esas pestañas y reiniciar el servidor local.
