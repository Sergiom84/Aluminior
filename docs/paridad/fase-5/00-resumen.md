# Fase 5 — búsqueda de vidrio (parcial)

> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites. El orden y estado de tareas pertenece al [roadmap vigente](../../../ROADMAP-PARIDAD-PRODUCTOR.md); sus encargos, permisos y pendientes fechados no se reactivan.

27/09/2026. Evidencia: [E10 y E11](../OBSERVACION-PRODUCTOR-2026-09-20.md).

## Implementación verificada

Búsqueda separada por código y descripción sobre los artículos activos de la
familia 050 importados. Admite varios fragmentos en cualquier orden y acentos;
devuelve hasta 50 resultados ordenados por código, indicando el límite. No
restringe los resultados a los códigos usados en las pruebas. Muestra código,
descripción y unidad; elegir conserva el identificador canónico.

Disponible en alta de estructura, alta/edición de cerramiento y vidrio por
elemento. La elección por elemento sigue necesitando Actualizar; vacío sigue
significando heredar el general. En edición, cambiar serie o vidrio general
actualiza también la herencia visible en el diseñador, sin pisar excepciones.

Diálogo modal con búsqueda mediante Enter, selección con Tab/Enter, Escape,
retorno de foco, Reset y error recuperable. Tabla móvil sin desbordamiento del
diálogo; comprobada a 390 × 844 y 1440 × 900. Prueba de integración con catálogo
sintético: múltiples fragmentos, acentos, códigos, comodines y exclusión de
artículos inactivos o de otra familia. No cambia el resolver económico.

## Límites frente a Productor

No cierra E10 completo: faltan DescripcionVentas, orden múltiple, condiciones
avanzadas y acceso a artículos fuera de familia 050. No se ha implementado E11
(cámara/dos vidrios/equivalentes), huecos ni travesaños de Diseño V3.
La selección del catálogo general no equivale a implementar ese editor.

## Discrepancia del código observado

V410ACGF, transcrito en la observación, no existe en la exportación local.
La búsqueda `premium 4/10 argon` devuelve, entre otros, V410ACGP6 con descripción
DOBLE ACRISTALAMIENTO 4/10 ARGON/CLIMAGUARD PREMIUM 6. Esto acredita el catálogo,
no una equivalencia automática ni una corrección retroactiva de la observación.

En el ensayo local, elegir V410ACGP6, guardar y consultar el snapshot acredita
que el código se persiste y el vidrio entra en las partidas. El presupuesto
sigue sin valorar por perfiles/asociados sin resolver y precios ausentes.

Pendiente: confirmar el código completo del ensayo original con el operador.
