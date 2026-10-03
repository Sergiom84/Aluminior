# Fase 6 — catálogo de uniones y esquineros

> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites.

27/09/2026. Implementación local en main; sin push. No cierra la paridad integral.

## Evidencia y alcance

Fuente: [observación 26–27/09](../fase-4/01-evidencia-actualizar-y-diseno-v3.md),
contraste de solo lectura de Codigo/Descripcion/UnionGrosor/UnionTipo en la
exportación existente Estructuras.csv. No se abrió ni escribió la base 0016.

Los 14 códigos observados están disponibles: GMU038–041, PSU001–009 y U.
Se conserva el catálogo verificado en core; no se ha añadido una sincronización
dinámica ni una migración de esquema. No se versionan exportaciones.

## Cambios

- Grosor cero válido exclusivamente para esquineros de catálogo UnionTipo 4.
- Grosor de solo lectura para todas las uniones. Al actualizar o guardar una
  edición se toma del catálogo; la provisional conserva 20 mm.
- La lectura de snapshots históricos conserva sus medidas. Una edición posterior
  normaliza el grosor antes de derivar el ancho y calcular/persistir.
- La valoración de materiales admite ancho cero solo en accesorios reconocidos
  como esquineros; su longitud de corte sigue siendo positiva. No se admiten
  huecos de ancho cero ni se sustituye material desconocido por importe cero.
- La receta sintética de aceptación usaba todavía PSU001=100: ahora usa 2 mm;
  su ancho esperado pasa de 6640 a 6542. No se alteran documentos históricos.

## Contraste y verificación

| Operación | Productor documentado | Aluminior comprobado |
|---|---|---|
| Elegir unión | Búsqueda de los 14 códigos | Selector con los mismos códigos |
| Grosor | Catálogo; no editable | Solo lectura; servidor normaliza |
| Esquinero PSU006 | UnionTipo 4, grosor 0 | Aceptado, guardado y reabierto |
| Acceso tras reducir grosor | Junta puede ser difícil de pulsar | Lista lateral y teclado conservan acceso |
| Resultado | Una línea GRUPO | Una GRUPO de 2400 × 1200 para dos elementos 1200 |

Se reutiliza la observación aportada por el operador; no se realizó un nuevo
ensayo nativo en Productor ni se dio por verificada la hipótesis del código de
unión usado en 260499. Prueba local con presupuesto sintético, elementos `2`,
GMA350, acabado L. El snapshot de PSU006 contiene corte de 1200 mm y valoración
de su receta; el agregado continúa sin valorar por otros componentes pendientes.

Core: 493 pruebas. Web tras esta corrección: 647 pruebas. Typecheck y arquitectura
sin errores (0 infracciones). Se añaden casos de cero en ambos anclajes,
rechazo de cero fuera del tipo 4, valores inválidos, normalización de los 14
códigos, alta, integridad y valoración real en PostgreSQL con catálogo sintético.

Docker reiniciado por el usuario. Se creó aluminior_real_test vacía, se aplicaron
las migraciones existentes y se ejecutó el ETL autorizado desde export_datos/EMP0016
con destino fijo localhost:55433. El origen no se modifica. Web de QA en
127.0.0.1:3002. La base sigue siendo efímera, no un almacenamiento de producción.

Capturas y PDF de QA en output/paridad-fase-6 (ignorados), incluido escritorio
1440 × 900 y móvil 390 × 844. No hay cambios de Supabase, licencia o empresa 0017.
