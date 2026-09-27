# Lote 3: cotas absolutas de correderas con fijos

Continuación de [05](05-puerta-corredera-y-relevo.md), base `e50b06a`.
Se mantienen el alcance autorizado y las protecciones de [00](00-contrato.md).

- Resultado exacto: resolver cotas físicas al redimensionar composiciones y
  habilitar C2FI, C2FS y C2FSFI solo tras verificar su recorrido completo.
- Destinatario y motivo: operador; conservar los fijos de 300 mm del catálogo
  cuando cambien las dimensiones totales del cerramiento.
- Éxito medible: ejes físicos a 300 mm del extremo acreditado, también en
  divisiones anidadas; rechazo de medidas imposibles; concordancia de catálogo,
  selección, edición, guardado, reapertura y PDF.
- Alcance autorizado: dominio puro, validación, catálogo y sus consumidores,
  pruebas y documentación; QA sintética local; commit local tras los gates.
- Fuera de alcance: otras familias, nuevas cotas editables, cambio de política
  económica, fabricación certificada, push, main, publicación o migraciones.
- Protegidos: 22 plantillas previas, IDs y orden; 1OFI y sus cotas de instancia;
  avisos y estados sin valorar; documentos previos, originales, MDB y secretos.
- Comprobaciones obligatorias: firmas de fuente y redimensionado, regresiones
  focalizadas y causales ejecutadas, revisión independiente (dos rondas como
  máximo), suites pertinentes, typecheck, arquitectura y build; navegador con
  teclado/foco, 320/390/escritorio, overflow, reduced motion, persistencia y PDF.
- Acciones que requieren autorización: decisiones de producto sin evidencia
  y actuaciones fuera del alcance local ya autorizado.

El contraste de mano de obra es una unidad separada de investigación de fuentes:
no habilita una fórmula económica por ajuste retrospectivo. Se documentarán
entradas, fuentes, resultados y límites; los bloqueos no demostrados se conservan.

Reparto por responsabilidad: ejecutor A geometría física y validación de core;
ejecutor B contraste de fuentes de mano de obra, sin cambios productivos.
Arquitecto: catálogo operativo, consumidores, QA, suites globales y cierre.
Los ejecutores no hacen operaciones Git de escritura. Ningún commit se realiza
mientras otro agente escribe. Revisión: artefacto, contrato y evidencia bruta.
