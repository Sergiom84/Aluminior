# Auditoría del commit 74e0c95

> Adenda de saneamiento, 20/09/2026: la aserción de revisiones se ha corregido
> para comparar el conjunto completo, sin asumir orden SQL. El fichero de
> integración pasó 11/11; se mantienen todas las comprobaciones del documento.
> El fallo observado abajo se conserva como registro histórico. Esto no cierra
> los pendientes de aceptación UI de fase 1. Ver [estado actual](../../ESTADO-ACTUAL.md).

Fecha: 20/09/2026. Workspace: OneDrive/Documentos/Aluminior. Revisión de código, documentación y ejecución de pruebas; no se ha repetido el recorrido UI en esta auditoría.

## Dictamen

Fase 1 parcialmente aceptada, no cerrada. El commit contiene normalización decimal, diagnóstico saneado, formularios controlados y siembra QA aislada. La documentación reconoce correctamente que el recorrido UI/PDF comprobado usa un fijo, no la composición completa de referencia. El título del commit no constituye evidencia de aceptación completa.

## Verificación independiente

- Typecheck de core: correcto.
- Typecheck de web: correcto.
- `git diff --check`: correcto.
- PostgreSQL local, TEST_DATABASE_URL explícita en localhost:55433/aluminior_test.
- Batería de guardado, normalización y PDF: **13 ficheros, 96 pruebas correctas y 1 fallida**, salida 1. Incluye rollback y concurrencia correctos.
- No se modificó código de aplicación ni se accedió a la base remota durante esta auditoría.

Comando ejecutado:

```powershell
$env:TEST_DATABASE_URL = 'postgres://aluminior:aluminior@localhost:55433/aluminior_test'
npm run -w @aluminior/web test -- app/dashboard/presupuestos/_lib/estructuras/coste-despiece.test.ts app/dashboard/presupuestos/_lib/cerramientos app/dashboard/presupuestos/[id]/pdf
```

## Hallazgo que requiere corrección

`packages/web/app/dashboard/presupuestos/_lib/cerramientos/linea-valorada.integracion.test.ts:121`, caso «copia exacta congela valoración incluso si cambia el catálogo y remapea sólo claves técnicas»: esperaba `revisionesUsadas: [0, 1]` y recibió `[1, 0]`. Esa fue la diferencia del diff de aserción. El lector se encuentra en `_lib/copia/leer-origen.ts`.

Revisar el contrato de orden: si el lector debe devolver revisiones ordenadas, explicitarlo en su consulta; si son un conjunto, comparar su contenido sin asumir orden y mantener todas las aserciones económicas y de identidad. No eliminar la prueba ni repetir hasta obtener un verde casual. Este resultado no demuestra un fallo económico ni permite atribuir la discrepancia al nuevo commit: la aserción ya existía.

## Aceptación funcional todavía pendiente

1. Composición completa de seis módulos, 6640×1020.
2. U1=PSU001 conservada en selector, dibujo y configuración serializada tras error.
3. Doble envío accidental durante el reintento: una sola línea GRUPO y satélites coherentes.
4. Recarga, reapertura y PDF de esa misma composición.

Los handlers `enviar` de alta/edición despachan la acción y los botones usan `disabled={enviando}`. Esto no es una prueba del doble envío ni de idempotencia del servidor. Verificar el recorrido real antes de afirmar que está cubierto.

La atribución histórica a 260004 es opcional y separada. No bloquea el cierre si el defecto y la receta sintética quedan demostrados.

## Entrada a fase 2

Se entrega `PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md` con un bloque previo que resuelve estos pendientes antes de modificar geometría. El diseñador actual monta SVG por módulo, limita su proporción y aplica mínimos CSS por módulo. El PDF ya dispone de una transformación común en `geometria-cerramiento.ts`. La fase 2 debe aprovechar ese conocimiento sin hacer depender core de un módulo privado de PDF.
