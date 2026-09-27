# Lote 2: puerta corredera C2P

Base local `b5b79f4`. Continúan las protecciones de [00](00-contrato.md).

- Resultado exacto: habilitar C2P, familia 002, como puerta corredera de dos
  hojas en selección, dibujo, modificación, guardado, reapertura y PDF.
- Destinatario y motivo: operador; abrir la familia de puertas correderas con
  una composición acreditada, sin extrapolar a carriles especiales.
- Evidencia: árbol NOR con dos hojas tipo 16 de EMP0016;
  `SeriesAsocV2TiposHoja` identifica tipo 16 como dos hojas de corredera con
  perfiles de puerta. Dimensiones y descripción se leen del catálogo.
- Éxito medible: firma contra fuente, conservación de dos hojas y sentidos
  al redimensionar; recorrido y PDF real; cálculo contrastado con los datos
  independientes disponibles o bloqueo explícito si no existen.
- Alcance autorizado: traductor, composición compartida con C2, alta C2P,
  pruebas, documentación, QA sintética local y commit tras todos los gates.
- Fuera de alcance: C2P con fijos/cotas, otras puertas, cambios de precios,
  supresión de avisos, fabricación acreditada por apariencia o precio.
- Protegidos: C2 y las 21 plantillas anteriores, opciones/defaults,
  documentos previos, originales, MDB, credenciales, migraciones y remotos.
- Comprobaciones: regresiones focalizadas y causales, revisión independiente,
  suites pertinentes, typecheck, arquitectura, build; teclado/foco, 320/390 y
  escritorio, overflow, reduced motion, persistencia y PDF.
- Autorización adicional: únicamente decisiones de producto sin evidencia o
  acciones expresamente fuera del alcance. No se necesita para esta unidad.

Ejecutor B: traductor y catálogo core, tests y firma de fuente. Arquitecto:
lectura de valoración y contraste, navegador, suites, revisión y cierre.
Ejecutor A: revisión independiente una vez estable el artefacto. Máximo dos
rondas: implementación, revisión, una corrección y gate determinista.
