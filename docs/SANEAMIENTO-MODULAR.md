# Saneamiento modular — 20/09/2026

## Alcance y resultado

Revisión de código de los paquetes y scripts del repositorio, tamaños,
responsabilidades, importaciones y ciclos de ejecución. Se conservan los cambios
sin confirmar que ya existían, el comportamiento y las APIs públicas.

Se elimina también el comando roto `dev:api`: el paquete API ya no existe
y Next.js sirve tanto UI como servidor desde `dev:web`. No se cambian dependencias.

La arquitectura modular reduce el alcance de los cambios; no elimina la necesidad
de probar los contratos compartidos. No se han añadido capacidades de las fases
de construcción ni modificado reglas económicas, migraciones o datos remotos.

## Separaciones realizadas

| Entrada estable | Responsabilidades separadas |
|---|---|
| `packages/etl/src/importar.ts` | CLI y conexión; `importacion/index.ts` coordina carga, maestros, estructuras, series, mediciones, costes, galce y PVP; informe separado |
| `packages/etl/src/importacion/galce.ts` | Lectura del contexto histórico, medición de hojas y medición de fijos en módulos distintos |
| `packages/core/src/estructuras/diseno.ts` | Tipos, constructores internos, catálogo y composición geométrica |
| `packages/core/src/produccion/hojas.ts` | Identidad del documento, parámetros físicos, extremos y orientación |
| `packages/core/src/precios/margen.ts` | Valoración individual y recálculo masivo de tarifas |
| `packages/db/src/schema/series.ts` | Catálogo/resolución, acristalamiento, herraje y rebajes; mismas definiciones SQL |
| `packages/web/app/dashboard/presupuestos/_lib/acciones.ts` | Consulta de clientes extraída a `cabecera/buscar-clientes.ts`, con conexión inyectada |
| `packages/web/app/globals.css` | Composición por imports; base, marco, diseñador, tablas, alta, ficha, escaparate, editor y adaptación |

El importador pasa de 925 líneas a una entrada de unas 30. Los estilos globales
pasan de 1101 líneas a una lista de imports. Las acciones de presupuestos ya
delegaban los casos principales al comenzar: se retira la descripción obsoleta
de que toda la valoración, numeración y escritura permanecían dentro de ellas.

## Revisión de los archivos que se conservan

- `despiece/calcular.ts`: contrato de entrada/salida y algoritmo de despiece;
  cohesión suficiente, protegido por regresiones de junta y rebaje.
- `produccion/despunte.ts`: un único cálculo económico sobre un plan de corte;
  comentarios y tipos explican sus guardas. No se separan artificialmente.
- `estructuras/acristalamiento-estructura.ts`: orquesta las rutas de vidrio y
  junquillos y delega cálculo, resolución de precios y coste. Se mantiene como
  unidad del caso de uso, con pruebas de integración y valoración.
- `etl/medir-mixtas.ts`: medición específica de alojamiento mixto, sin UI ni
  escritura en BD. Mantiene el protocolo de evidencia.
- `etl/cargar-tarifa.ts`: servicio de carga con conexión inyectada y CLI protegida
  contra ejecución al importar; tiene pruebas de dry-run, aplicación y reversión.
- Los ficheros de pruebas cercanos a 250–400 líneas se mantienen por escenario
  de negocio: separar sus fixtures sin necesidad puede introducir dependencias.
- Nueve scripts de investigación superan 400 líneas. Se conservan como
  experimentos históricos congelados, no como módulos del producto; cada uno
  tiene motivo y tamaño máximo en `scripts/modularidad-excepciones.json`.
  Cambiarlos sin repetir sus experimentos alteraría la trazabilidad de PLAN.md.
  Antes de ampliarlos o reutilizarlos hay que extraer el caso correspondiente.
  Por tanto, no se afirma que todos los archivos del repositorio sean pequeños.

## Prevención de regresiones arquitectónicas

`npm run check:architecture` revisa paquetes y scripts. Rechaza nuevos archivos
manuales de más de 400 líneas sin excepción, crecimiento de excepciones, ciclos
de imports de ejecución relativos entre módulos productivos, accesos privados
entre paquetes y dependencias externas en core. Enumera los archivos desde 250
líneas para revisión de cohesión. Excluye dependencias, builds y migraciones.

Es una comprobación estática: no demuestra desacoplamiento semántico completo,
no resuelve imports dinámicos y no sustituye la revisión de responsabilidades.
Los tipos importados no se tratan como ciclos de ejecución.

## Verificación

- Antes del cambio: typecheck completo correcto; core 449, db 55 y ETL 14 pruebas
  correctas, una ETL omitida. Web: 617 correctas y una fallida por asumir una
  descripción concreta de MO sobre un catálogo compartido con fixtures QA.
- Se corrige esa prueba para comprobar que el snapshot conserva la descripción
  realmente leída. Se mantienen las aserciones exactas de horas, minutos,
  precio, coste y estado; no se modifica la lógica productiva.
- ETL: caracterización capturada ejecutando la versión anterior sobre datos
  inventados. La versión modular reproduce las mismas 25 operaciones SQL y 26
  resultados, con exclusiones, descartes, conversiones, delegaciones y galces.
  Pruebas adicionales cubren CSV ausente y recuperación fila a fila tras fallo.
- Búsqueda de clientes: pruebas locales de código canónico, prefijo, varios
  fragmentos desordenados, acentos, nombre comercial e inactivos.
- CSS: compilación con PostCSS/Tailwind antes y después idéntica tras retirar
  comentarios y normalizar espacios (35.191 caracteres). Se conserva cascada,
  selectores, media queries y estados. No se declara una nueva aceptación visual
  de paridad ni se modifica el recorrido del operador.

Las salidas locales de esta ejecución se guardan en `output/saneamiento/`,
ignorado por Git. La batería final completa pasó con 1.142 pruebas correctas y una ETL omitida
preexistente: core 449, db 55, ETL 17 y web 621. El typecheck completo pasó.
Tras corregir además el orden no contractual de revisiones en una aserción de
copia, su fichero pasó 11/11; la regresión ETL pasó 3/3. Se conservó la comparación
del documento completo y de todas las revisiones, sin cambiar consultas productivas. La referencia ETL versionada contiene exclusivamente datos sintéticos.


Las cuatro entradas públicas refactorizadas conservan sus 65 exportaciones
(21 de diseño, 15 de hojas, 13 de margen y 16 de esquema). Las 16 definiciones SQL
de series son idénticas. El formato de las extracciones se revisó por igualdad
del AST. El auditor rechazó ensayos sintéticos de ciclo, dependencia de E/S en
core y exceso de tamaño. No se ejecutó el ETL real ni se modificó el esquema remoto.

## Inventario de cohesión al cierre

563 archivos de código/estilos revisados por el auditor, 288 módulos
productivos analizados y 0 infracciones de sus reglas.
La revisión humana considera responsabilidades y pruebas, además de tamaño.

| Archivo | Líneas | Decisión |
|---|---:|---|
| `packages/core/src/despiece/calcular.ts` | 297 | Responsabilidad específica conservada; ver revisión y pruebas de este informe. |
| `packages/core/src/precios/margen.test.ts` | 254 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/core/src/produccion/despunte.ts` | 294 | Responsabilidad específica conservada; ver revisión y pruebas de este informe. |
| `packages/db/src/schema/mano-obra.integracion.test.ts` | 330 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/etl/src/cargar-tarifa.ts` | 261 | Responsabilidad específica conservada; ver revisión y pruebas de este informe. |
| `packages/etl/src/medir-mixtas.ts` | 303 | Responsabilidad específica conservada; ver revisión y pruebas de este informe. |
| `packages/web/app/dashboard/presupuestos/_lib/copia/copia.integracion.test.ts` | 262 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/acristalamiento-estructura.ts` | 296 | Responsabilidad específica conservada; ver revisión y pruebas de este informe. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/herraje.test.ts` | 253 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/resolucion-perfiles.test.ts` | 380 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/valoracion-vidrio.integracion.test.ts` | 314 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/valoracion-vidrio.test.ts` | 302 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/valorar-estructura.integracion.test.ts` | 301 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/mano-obra/mano-obra.integracion.test.ts` | 306 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/dashboard/presupuestos/_lib/numeracion/reservar.integracion.test.ts` | 295 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `packages/web/app/styles/disenador.css` | 272 | Responsabilidad específica conservada; ver revisión y pruebas de este informe. |
| `scripts/analizar-mixtas.mjs` | 543 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/banco-motor.test.ts` | 334 | Suite cohesiva por escenario; conserva sus pruebas y fixtures. |
| `scripts/cazar-discriminante-tramo.mjs` | 331 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-bisagra-encadenada.mjs` | 269 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-bloqueo-vivo.mjs` | 256 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-cobertura-plan-a.mjs` | 593 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-configurador.mjs` | 599 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-conjunto-oscilobatiente.mjs` | 518 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-desvio-tramos.mjs` | 277 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-escuadra-lineal-serie.mjs` | 870 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-oscilobatiente-dim.mjs` | 362 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-oscilobatiente.mjs` | 272 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-recuento-escuadras.mjs` | 457 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-seleccion-v3.mjs` | 294 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-seleccion-v4.mjs` | 338 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-seleccion-v5.mjs` | 389 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-tapon-hoja.mjs` | 309 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/medir-topo-sustituido.mjs` | 696 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-tramo-tiebreak.mjs` | 581 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/medir-umbral-asociados.mjs` | 583 | Experimento histórico congelado; excepción individual con máximo. |
| `scripts/probar-motor-contra-oraculo.mjs` | 263 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/reclasificar-oscilobatiente-perfil.mjs` | 313 | Investigación local específica; sin dependencia desde el producto. |
| `scripts/recuento-frente-perfil.mjs` | 295 | Investigación local específica; sin dependencia desde el producto. |
