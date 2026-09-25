# Fase 3 — composición, catálogo e inserción

Fecha: 25/09/2026. Evidencia en [01-evidencia-composicion.md](01-evidencia-composicion.md).

## Implementado

**Modelo (core).** Configuración v3 con anclaje explícito por elemento
(`moduloId`, `lado: derecha | abajo`, `unionId`). Las v1/v2 se leen como la
cadena horizontal con la que se guardaron: no se reescriben ni cambian de
medida al abrirlas. `composicion-cerramiento.ts` resuelve posiciones, anclajes
libres, ajuste al anclaje más próximo, inserción, dependientes y eliminación.
La validación pasa a `validar-configuracion-cerramiento.ts` y las versiones a
`versiones-cerramiento.ts` (sin ciclos de importación).

| Regla | Fuente |
|---|---|
| Dos anclajes por elemento: esquina superior derecha e inferior izquierda | Observado |
| Un anclaje usado deja de ofrecerse | Observado |
| Soltar lejos no inserta; cerca, se ajusta al anclaje libre más próximo | Observado; radio exacto no medido (35 % del mayor lado visible) |
| El elemento nuevo conserva la medida de su plantilla | Observado |
| Unión nueva sin código, 20 mm, longitud del lado del padre | Observado |
| Global = caja envolvente de los elementos | Observado (1200 × 2420, 1620 × 2420) |
| Se omiten anclajes cubiertos y se rechazan inserciones que solapan | **Mejora sobre Productor** |
| Eliminar quita el elemento y sus dependientes, avisando de cuántos | **Desviación**: Productor truncó también un elemento no dependiente |
| El primer elemento no se elimina (es la referencia de posición) | Decisión de Aluminior |

La unión sin configurar se admite en la configuración y en el snapshot, pero su
origen queda siempre sin valorar (`Unión … sin configurar`): nunca vale cero.

**Configurador (web).** Disposición de Productor: barra superior con global,
lienzo, lista de elementos y uniones (`0 - 2 de 1200 x 1200`,
`2 - *(UNION NO CONFIG.)` en rojo) y barra inferior que alterna Catálogo y
Propiedades. Catálogo por familias con miniaturas paginadas y arrastrables;
puntos verdes durante el arrastre. Alternativa sin ratón: clic o Enter en la
miniatura la deja preparada, los anclajes pasan a ser botones enfocables y
Escape cancela. «Cerramiento» abre el configurador vacío, sin el paso previo
del escaparate. Pestañas Elemento seleccionado (estructura, posición X/Y
calculada, medidas con Actualizar, sustituir por la miniatura preparada,
eliminar) y Unión (código con opción sin configurar, longitud y grosor).

Carpeta `packages/web/app/dashboard/presupuestos/[id]/_components/disenador/`:
`catalogo-inferior`, `lista-elementos`, `anclajes-lienzo`, `panel-elemento`.

## Defectos previos corregidos con el catálogo real

Al valorar contra el catálogo importado de EMP0016 (base local) fallaba
cualquier cerramiento con «El motor produjo un snapshot incompatible», también
una cadena v1. Dos causas en `origen-valorado.ts`:

1. Pieza con corte 0 mm (artículo `62` en el fijo `0`): medida no calculable.
   Se guarda como `null` y bloquea fabricación y coste.
2. Pieza `MO` de cantidad 0 en la receta de GMU038: no produce pieza.

## Verificación

- Core 461 pruebas; nuevas: 12 de composición (caso observado 1200 × 2420 →
  1620 × 2420, anclajes, solapes, eliminación, conversión de cadena, validación).
- Web: diseñador (render vacío y lista), `origen-valorado`, contrato móvil.
- Navegador, base local `aluminior_real_test`: arrastre con resaltado del
  anclaje e inserción; soltado lejano ignorado; inserción debajo por teclado;
  uniones GMU038 (60) y PSU001 (2, solo lectura); global 2460 × 2402; guardado
  de una única GRUPO «sin valorar»; reapertura con la misma composición; PDF
  con el dibujo 2D; 375 px sin desbordamiento de página.
- `check:architecture`: 0 infracciones.

## Pendiente

- Catálogo: las familias siguen alimentándose de las 14 plantillas verificadas;
  mostrar las estructuras reales de cada familia exige ampliar el generador
  de diseño (`diseno-catalogo.ts`, 46 de 541 dibujables).
- Pestañas Módulo y Propiedades del Cerramiento: semántica de «módulo» sin resolver.
- Radio de captura del arrastre y regla exacta de eliminación de Productor.
- Materiales por elemento, vidrio y catálogo completo de uniones: fases 4–6.
