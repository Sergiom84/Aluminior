# Comparación técnica Productor–Aluminior, 16/10/2026

Investigación local en `codex/rea-productor-20261016`, desde `307bf54`.
[Informe y evidencia](INVESTIGACION-REA-PRODUCTOR-2026-10-16.md).
No se ha implementado funcionalidad ni se ha reconsultado producción.

## Cómo interpretar esta comparación

Se han analizado los 641 archivos TypeScript/TSX de `packages/` y `e2e/`
del worktree mediante AST, incluidos sus tests. Se localizaron 60 declaraciones
`pgTable` y 17 páginas bajo dashboard. `source-map.json` conserva todas las
rutas, hashes, declaraciones, imports y títulos estáticos de tests. Estos
títulos no equivalen a pruebas ejecutadas. Los 641 archivos coinciden con el
checkout original tras normalizar LF/CRLF; allí se ejecutaron 964 tests core,
typecheck core y auditoría de arquitectura. Solo existe además su `next-env.d.ts`
generado. No se leyó `.env` ni se abrió una conexión de negocio.

En la tabla, **implementado** significa código localizado e inspeccionado;
**parcial** conserva límites concretos; **sin módulo localizado** significa
que no se encontró una ruta, modelo y caso de uso operativos en ese barrido,
no una demostración universal de inexistencia. Ninguna fila certifica paridad
integral de interfaz, importes o fabricación. No se calcula un porcentaje de
completitud a partir del número de módulos, tablas, métodos o tests.

Las rutas de código son relativas a la raíz del worktree. `core/` abrevia
`packages/core/src/`; `web/` abrevia `packages/web/app/dashboard/`;
`db/` abrevia `packages/db/src/schema/`.

## Mapa de capacidades

| Capacidad | Evidencia Productor | Aluminior localizado | Brecha o siguiente prueba |
|---|---|---|---|
| Artículos, acabados, familias, tarifas | Manual, metadatos Dominio y esquema previo | `db/catalogo.ts`; `web/articulos/` | Implementado; no equiparar ficha/importación con todas las reglas del catálogo |
| Clientes, potenciales, obras y proveedores | Manual y esquema previo | `db/comercial.ts`; `web/clientes/`; búsqueda de cabecera | Implementado parcialmente; validar los mismos recorridos y permisos |
| Cabecera de presupuesto y cliente opcional | Observación/manual y trabajo previo de paridad | `web/presupuestos/_lib/cabecera/`; `presupuestos/crear-presupuesto.ts` | Flujo implementado; no reabrir A3/A4 |
| Configurador y GRUPO agregado | Observación y documentos de paridad | `core/estructuras/composicion-cerramiento.ts`; `web/presupuestos/_lib/cerramientos/` | Implementado; aceptación por familias/opciones sigue acotada |
| Catálogo visual, geometría y composiciones | CHM, árboles y banco anterior | `core/estructuras/diseno/`; `web/presupuestos/_lib/catalogo-diseno/` | Dibujo disponible no demuestra precio ni fabricación de toda estructura |
| Cortes, cotas y referencias | Datos/configuración y evidencias previas | `core/despiece/cortes-referenciados.ts`; `medidas-plantilla.ts` | E2/E4/E5/E8–E11 conservan sus condiciones; no ampliar por parecido |
| Herrajes y asociaciones | CHM, catálogo y banco previo | `core/despiece/asociaciones/`; `core/estructuras/editor-linea/opciones-herraje.ts` | Parcial; tramos/fronteras requieren entradas reales contrastadas |
| Acristalamiento por elemento y alternativas | CHM y análisis previo de tablas/opciones | `core/despiece/acristalamiento-catalogo.ts`; `web/presupuestos/_lib/estructuras/valoracion-vidrio.ts` | E6 conserva contención; alternativa sin receta no recibe precio de opción 1 |
| Doble acristalamiento | Catálogo y evidencia previa; no tarifa comercial nueva | `core/precios/doble-acristalamiento/` | Herramientas presentes; la propuesta de tarifa no está aprobada/aplicada |
| Mano de obra manual y snapshots | Contrato del titular y evidencia de paridad | `core/precios/mano-obra.ts`; `web/presupuestos/_lib/mano-obra/` | Implementado; distinto del registro de jornadas y costes reales de taller |
| PVP por acabado, metraje y superficie | CHM y evidencias económicas anteriores | `core/precios/pvp-catalogo.ts`; `metraje-superficie.ts` | Implementado con guardas; E10/E11 mantienen límites de aceptación |
| PVP dimensional | Contrato C1 anterior | `core/precios/seleccionar-precio-tabla.ts`; `web/presupuestos/_lib/precios-tabla/` | C1 ya entregado; no repetir migraciones 0031/0032 ni cargas |
| Coste dimensional por proveedor | CHM distingue coste/PVP; binario CosteMed no prueba selector | `core/precios/coste-catalogo.ts` resuelve coste ordinario por acabado/unanimidad | No es el selector dimensional. Falta demostrar proveedor, dimensiones, gastos y desempates |
| Tarifa dinámica | IL anterior y selección de registros ya extraída | `core/precios/tarifa-dinamica/seleccionar.ts` | Contrato puro implementado; sin fórmula económica, activación ni caso positivo |
| Comisiones y margen | Contrastes anteriores y metadatos de documentos | `core/precios/comision.ts`; `core/precios/margen/` | Código/test no cierran E3 ni orden completo de redondeo Productor |
| E1 físico y condicional | Contratos estáticos del 13/10 | `core/produccion/despunte-catalogo/` | Contratos puros presentes; no llamar a esto aplicación monetaria en presupuesto |
| E1 monetario y reparto en cabecera | A–F/G1–G5 previos; COM/control/totales 14/10 | `core/produccion/despunte.ts`; vista de producción | Calculador de producción existente; no equivale al contrato de cabecera. Base, escala/configuración/agregados y persistencia general siguen abiertos |
| Optimización de barras 1D | Cut1D y envoltorio gestionado ProduccionNet | `core/produccion/optimizar.ts` usa First-Fit-Decreasing, una longitud y kerf | Diferencia comprobable de entradas/opciones; no demostrar el mismo óptimo ni copiar el algoritmo propietario |
| Retales y varias longitudes disponibles | Contratos de Cut1D: barras/retales y parámetros de restos | El optimizador actual recibe una longitud por llamada | Falta especificar existencias, elegibilidad de retal, límites y objetivo antes de ampliar |
| Hoja de corte y hoja de producción | Manual; módulos nativos y gestionados | `core/produccion/hojas-corte.ts`, `hojas-produccion.ts`; `web/produccion/` | Ambas existen y son distintas; falta aceptación comparativa completa, no empezar de cero |
| Pedido de compra | Manual y metadatos de compras | `db/compras.ts`; `web/compras/_lib/acciones.ts` | Implementado; coste manual/sugerencia inequívoca y estado incompleto. Marcar RECIBIDO no acredita recepción física |
| Recepción parcial y factura de proveedor | CHM permite parciales y factura desde albaranes | Sin tablas/casos operativos localizados para recepciones/albaranes/facturas de compra | Modelar cantidades pendientes, trazabilidad, reversión e idempotencia; el número/fecha de origen es opcional en el manual |
| Movimientos y existencias de almacén | CHM y contratos gestionados de Stock | Flags `controlaStock`/`fabricaStock` en artículo; sin libro operativo localizado | Una casilla no mantiene stock; faltan movimientos, saldos y reversión |
| Reservas, lotes y compromisos | Stock y ProduccionNet gestionados | Sin modelo/caso operativo localizado | Distinguir reserva, consumo y existencia; comprobar transacciones y doble aplicación |
| Venta: pedido, albarán y factura | Manual, Dominio y VentasNet | Presupuestos; sin módulos operativos localizados para ciclo completo de venta | Conversión, estados, numeración y obligaciones fiscales requieren tarea propia; metadatos históricos no acreditan cumplimiento actual |
| Cobros y vencimientos | Manual y métodos de VentasNet | Sin tablas/rutas/casos operativos localizados | Definir aplicación parcial, múltiples cobros, reversión y saldo antes de tesorería |
| Informes configurables y consultas | 303 RPT físicos; manual de listados; metadatos managed | `web/_components/shell.tsx` declara informes pendiente; `web/page.tsx` muestra marcador | El PDF de presupuesto no sustituye un motor de listados. Priorizar informes concretos del taller |
| PDF comercial con dibujo | Observación y contratos anteriores | `web/presupuestos/[id]/pdf/` | Implementado; P.2 conserva aceptación comercial pendiente. No se ha vuelto a renderizar PDF en esta investigación |
| Exportación/importación documental | Manual offline y registro/versiones | Copia interna y ETL; sin flujo legacy equivalente localizado | No confundir ETL/copia con intercambio documental compatible; especificar formato y alcance sin acoplar al EXE |
| Servicios WCF de instalación | Config/.svc declaran Operations, Produccion, Stock y eAlbaranes | Arquitectura Next/servicios internos; sin WCF equivalente localizado | Presencia de endpoint configurado no prueba servicio activo ni obliga a replicar transporte antiguo |
| Jornadas, tareas y gastos reales de obra | CHM de horas y metadatos | MO presupuestada; sin diario de taller localizado | Son dominios diferentes; diseñar seguimiento solo con necesidad confirmada |
| Calidad y no conformidades | Manual histórico | Sin módulo operativo localizado | Funcionalidad documental; no atribuir cumplimiento normativo presente |
| Mecanizado, etiquetas y máquinas | Nombres/componentes nativos y metadatos de producción | Hojas; sin adaptación CNC/etiquetas equivalente localizada | Aún candidatos de interfaz; se necesitan formatos/entradas/salidas y máquina concreta |
| Teclado, móvil, accesibilidad y overflow | Contratos previos P.6/P.7 | Implementación y E2E existentes en árbol | No se ejecutó comparación visual/runtime nueva; matriz restante y recorrido humano siguen pendientes |
| Escritorio y funcionamiento offline | Instalación Windows y manual offline | Aplicación web; sin capacidad offline general | Diferencia arquitectónica deliberada; no cambiarla solo por presencia del legado |

## Prioridad práctica

**Ahora:** continuar la frontera económica E1 ya definida, sin tocar G6;
usar las nuevas opciones de corte para redactar casos discriminantes de
barras/retales y medir el resultado antes de ampliar el motor. Mantener
datos ausentes como no valorados, no como cero. La nueva investigación
resuelve acceso al pseudocódigo acotado, no las preguntas monetarias E1.

**Después:** recepción parcial de compras con trazabilidad, movimientos y
reservas de stock, cobros/vencimientos e informes operativos concretos.
Dividir cada dominio en contrato, función pura, adaptador transaccional y
flujo aceptado por el taller. P.2 y P.6/P.7 conservan su trabajo de aceptación.

**Experimental:** planificación avanzada, optimización por retales, integración
de máquinas, calidad, modo offline o reconstrucción extensa del legado. Las
declaraciones y archivos hallados permiten investigar, no dimensionar todavía
un producto equivalente completo.

No se han añadido licencias, servicios ni infraestructura de pago. El coste
total y el retorno de implementar estas brechas no están medidos: dependen de
su contrato y del tiempo de operación que ahorren. La prioridad recomendada
reduce el riesgo de importes falsos y reutiliza módulos existentes; separar
las reglas puras de datos/UI limita mantenimiento y futuras regresiones.
