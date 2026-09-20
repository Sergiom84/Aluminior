# Handoff a fase 3

## Interfaces estables

- `geometriaCerramiento(configuracion)` es la fuente de posiciones físicas.
- `proyectarCerramiento(geometria, viewport)` adapta cualquier soporte con escala uniforme.
- `LienzoCerramiento` recibe configuración, módulo activo y selección; no persiste ni valora.
- `DibujoEstructura` representa exclusivamente las miniaturas del catálogo y no participa en la geometría del conjunto.
- La selección se identifica por `{ moduloId, elemento, parte }`.

## Deuda pendiente antes de fase 3

1. Repetir el reintento de edición después de cerrar las pestañas con la petición anterior y reiniciar el servidor local; la doble interceptación del formulario ya se eliminó.
2. Revalorar la línea QA con las recetas sintéticas ampliadas, recargar y examinar su PDF real.
3. Repetir foco/teclado de primer y último módulo y U1 con la acción de guardado desbloqueada.
4. Contrastar alineación e inserción con Productor cuando 0017/260494 sean visibles.

No se implementaron drag and drop, nuevas posiciones de inserción, herencia, travesaños interactivos ni catálogo adicional fuera de los equivalentes QA necesarios para la receta.
