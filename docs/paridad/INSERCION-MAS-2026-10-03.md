# Inserción contextual de ventanas · 03/10/2026

## Decisión y evidencia

Cambio solicitado y confirmado por Sergio mediante entrevista en esta conversación.
Es una mejora explícita de interacción, no una nueva afirmación de paridad con Productor.

| Comportamiento | Fuente | Resultado |
|---|---|---|
| Familia → modelo → arrastre, con anclajes derecha/debajo | [Observación de Productor](fase-3/01-evidencia-composicion.md), código y observación autorizada de la web publicada en esta sesión | Se conserva catálogo, arrastre, doble clic y composición vertical |
| «+» vacío, selector emergente de familia/modelo, después dos «+» en los extremos | Entrevista y confirmación explícita de Sergio | Añade directamente en la posición elegida; los extremos de una composición 2D son los módulos físicamente más exteriores; desempate por fila superior |
| Primera ventana como referencia de ancho y alto | Entrevista de Sergio | Pregunta después de modificarla; conserva su identidad al añadir a la izquierda |
| «Sí», «Sí para esta y todas», «No y no volver a preguntar» | Entrevista de Sergio | Puntual, copiar siempre o usar modelo; las dos últimas persisten por presupuesto |
| Botón «Medidas de nuevas ventanas» y edición libre | Propuesta aceptada por Sergio | Permite volver a preguntar, copiar o usar el modelo; nunca propaga una modificación a ventanas existentes |

La preferencia es compartida entre altas y ediciones del mismo presupuesto. Cada
cerramiento usa su propia primera ventana, con sus medidas actuales. Cambiar la
preferencia es una operación explícita e independiente del guardado de la línea.
Los presupuestos existentes empiezan en PREGUNTAR. Se detecta una primera ventana
modificada comparando sus medidas con las iniciales del modelo, también al reabrir.
Las medidas copiadas siguen sujetas a la validación existente del modelo y son editables.

## Implementación y compatibilidad

- Core añade el lado izquierda a los anclajes v3; normaliza el origen visual sin
  reordenar módulos, cambiar identidades o alterar las medidas guardadas. v1/v2
  conservan sus posiciones. UI y PDF usan la misma geometría.
- La inserción y sus diálogos están separados del diseñador; las acciones
  conservan autorización, validación y servicio transaccional bajo bloqueo de cabecera.
- Migración nueva `0027_medidas_nuevas_ventanas`: una columna de preferencia con
  default PREGUNTAR. Debe aplicarse antes de desplegar esta rama. Ninguna migración
  previa se modifica. No se ha aplicado en producción.
- El lector anterior a esta rama no admite un anclaje izquierdo: evitar volver a
  ese lector después de guardar composiciones nuevas sin un plan de compatibilidad.
- Revisión de cohesión: composición conserva su responsabilidad de anclajes y
  posicionamiento (278 líneas); no incorpora preferencias, diálogos ni persistencia.
  El diseñador delega los nuevos estados y controles en módulos de la feature.

## Verificación local

Base desechable independiente `aluminior_insercion_test`, con datos sintéticos.
Navegador en loopback, entorno de desarrollo y mecanismo QA local existente.

- «+» inicial y extremos; elección directa; copia puntual vuelve a preguntar;
  copia automática; cambio de primera 900×1500 → 1000×1600 conservando otras
  ventanas de 900×1500 y 700×1500; inserción siguiente con referencia actual.
- Preferencia recuperada al recargar; reinicio manual; «No» incorpora el modelo
  de 1200×1200; guardado como GRUPO y reapertura con las mismas cinco ventanas.
- Enter abre y coloca; foco inicial en familia/acción, Escape cancela y devuelve
  foco; la inserción selecciona el módulo nuevo y abre propiedades.
- Catálogo inferior y anclaje debajo por teclado: 1200×2420 mm. Los manejadores de
  arrastre conservados pasan por la misma solicitud de medidas; el arrastre físico
  no se ensayó en esta sesión.
- Capturas de escritorio 1440×1000 y móvil 390×844 fuera de Git. Móvil: sin
  desbordamiento del documento y botones «+» de 44 px; selector con familias
  desplazables y miniaturas ajustadas a su celda. No se añaden animaciones.
- Los datos sintéticos sin receta permanecen «sin valorar»; no se convierten en cero.
- Pruebas de dominio, autenticación de acción, persistencia y rechazo de estados,
  edición de cerramiento y geometría PDF; typecheck y auditoría modular.

Límite: se contrastó el recorrido original documentado con el nuevo flujo y se
observó la web publicada, pero no se ejecutó Productor en una VM en esta sesión.
No se declara paridad integral ni aceptación del motor económico.
