# Catálogo completo: contrato de continuación

27/09/2026. Base `b454919`, rama `feat/motor-catalogo-completo`, árbol limpio.

- Resultado exacto: inventario reproducible de todas las fuentes descubiertas e
  incorporación progresiva de modelos a selección, edición, guardado y reapertura.
- Destinatario y motivo: operador de Aluminior; continuidad del catálogo Productor.
- Éxito medible: cobertura antes/después por modelo, fuente y estado; ninguna
  candidata visual se declara valorable o fabricable por ese solo hecho.
- Alcance autorizado: código, pruebas, documentación y commits locales con autoría
  de Sergio; exportaciones existentes leídas sin modificación y QA sintética local.
- Fuera de alcance: push, main, publicación, cambios remotos y migraciones nuevas.
- Protegidos: originales y MDB activas, datos de clientes, documentos existentes,
  secretos, cotas y comportamiento C2 ya verificados.
- Comprobaciones obligatorias: pruebas focalizadas y causales, suites pertinentes,
  typecheck, arquitectura, build, revisión independiente (máximo dos rondas),
  recorrido navegador, teclado, foco, móvil, overflow, reduced motion y PDF.
- Autorización adicional: decisiones de producto sin evidencia o cualquier acción
  expresamente fuera de alcance. Los bloqueos técnicos se investigan primero.

## Lote 1: fijos equidistantes

Contrato: incorporar 03H, 03V y 06 (familia 005), CF, CFT y FC (009) mediante
reglas de composición compartidas. Fuente EMP0016, Estructuras y EstructurasDiseño;
sin inferir forma por código. 03H: tres bandas horizontales; 03V: tres verticales;
06: tres bandas horizontales, cada una dividida en dos; CF/FC: un vidrio;
CFT: dos huecos verticales con parteluz. Todos con marco NOR, sin variantes.

Aceptación: firma de composición y dimensiones coinciden con la traducción del
árbol; las seis entradas se seleccionan en su familia, mantienen geometría al
editar dimensiones y sobreviven al guardado/reapertura y al PDF. El precio y el
despiece se contrastan independientemente; bloqueos o coste incompleto se conservan.
No incluye otras variantes de marco ni auxiliares sin árbol.

Reparto: ejecutor A inventario scripts/catalogo-completo; ejecutor B traductor
diseno-catalogo; arquitecto catálogo operativo, composición/UI, QA y coordinación.
Ningún ejecutor comitea. Suites globales, DB, build y navegador en serie.
