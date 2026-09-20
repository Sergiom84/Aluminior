# Tramo 1OFI: conexión de FI

> Revisión documental 20/09/2026: **Cierre técnico acotado**. Conexión editor/dibujo/PDF documentada; conservar preguntas no demostradas.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

## Alcance y archivos

- `packages/core/src/estructuras`: configuración v1/v2, validación de FI por
  módulo y adaptación de la geometría `1OFI` a rectángulos de representación.
- `packages/web/.../_components`: campo `FIJO INFERIOR` y dibujo del módulo.
- `packages/web/.../pdf`: misma geometría resuelta e identidad de snapshot.
- `packages/web/.../_lib/cerramientos`: persistencia JSON y corte explícito de
  valoración/despiece para configuraciones con FI.

No se modifica el flujo `ESTRUCTURA`, el catálogo, el esquema, migraciones ni
las fórmulas de fabricación o valoración.

## Decisiones

- La configuración v1 se acepta sin mutación y mantiene el reparto visual
  legado. Abrirla o guardar campos ajenos a FI no cambia su versión.
- La v2 almacena `fiMm` únicamente en módulos `1OFI`. Crear o seleccionar un
  `1OFI` nuevo asigna 300 mm. Editar FI convierte explícitamente a v2.
- La ausencia de `fiMm` sigue siendo distinta de 0 y 300. Un módulo legado sin
  FI conserva su representación anterior incluso dentro de una configuración
  parcialmente convertida.
- La representación transforma el eje físico resuelto a la caja visual y
  centra en él el grosor gráfico; el grosor no mueve el eje.
- Una configuración con FI explícito no entra en el motor de valoración. Se
  guarda con precio y total nulos, valoración incompleta y sin snapshot ni
  despiece anteriores. Configuración y limpieza comparten transacción.

## Pruebas

- Core: alta FI=300, módulos independientes, v1 intacta, conversión explícita,
  serialización, altura conservando FI y rechazo geométrico.
- Web/PDF: ejes para 900×1500/FI300, 900×1800/FI300 y FI400; identidad rechaza
  snapshots con FI distinto; regresión de manos y manillas.
- Casos de uso: FI evita el motor, produce importes nulos y la escritura elimina
  resultados/despiece anteriores; un fallo revierte el conjunto mediante el
  límite transaccional existente.
- Typecheck de core y web. Las pruebas PostgreSQL solo se ejecutarán si el
  destino se acredita local y aislado; en otro caso se usarán pruebas puras y
  dobles y se declarará pendiente la comprobación transaccional real.
