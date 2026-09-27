# Estado actual de Aluminior

## Estado consolidado al 27/09/2026

Objetivo ratificado: todas las tipologías, series y uniones de Productor,
con precio automático completo y uso moderno. Implementación parcial;
no hay aceptación integral de fabricación o precio. La instalación todavía
no está agotada como fuente de datos y reglas.

El [barrido de facturas](paridad/fase-7/05-primer-barrido-facturas-2026.md)
aporta 180 facturas / 28.480 líneas; 854 enlaces exactos a albarán y 715
hasta línea de presupuesto, con 14 y 139 pendientes respectivamente.
Revisar discriminadores de tipo de origen antes de certificar trazabilidad.
541 estructuras de catálogo, 495 sin estructura facturada en el periodo;
cero casos acreditados como calculables o contrastados en ese banco.

La nueva implementación de cortes cubre solo perfiles ordinarios C2/C3 GMC400.
Referencias y descuentos base ya se cargan; Dif, variantes, vidrio y herrajes
completos siguen pendientes. El [relevo operativo](paridad/INICIO-SIGUIENTE-CONVERSACION.md)
reúne fuentes, módulos, pruebas y plan de extracción. Main, HEAD observado
a708af3, cambios posteriores sin commit y sin push. Entornos descritos abajo
son observaciones fechadas: verificar disponibilidad antes de usarlos.

Última entrega externa comunicada: 506 pruebas core, pruebas nuevas de
cobertura, typecheck y arquitectura pasan; npm test completo no finalizó
porque db/web no pudieron cargar configuración por acceso denegado.
No se ha repetido esa suite durante esta revisión documental.


> Continuidad revisada el 27/09/2026: [punto de partida vigente](paridad/INICIO-SIGUIENTE-CONVERSACION.md). Las comprobaciones fechadas conservan sus límites; consultar el relevo para el trabajo siguiente.

Revisión local: 27/09/2026. Este es el punto de entrada para el estado del código.

## 27/09/2026 — uniones, búsqueda de vidrio y PDF

Implementado después: [corte por catálogo C2/C3 GMC400](paridad/fase-7/03-implementacion-cortes-referenciados.md),
sin rebaje histórico duplicado, con bloqueo ante datos incompletos. Migración
0022 y carga suplementaria verificadas en QA local; presupuesto conservado.
No equivale a precio completo: asociados y vidrio siguen pendientes.

Continuación: [investigación ampliada de fuentes](paridad/fase-7/02-investigacion-fuentes-2026-09-27.md).
Inspeccionadas ocho MDB mediante copias verificadas, tarifa TXT y manual CHM.
Nuevo comprobador de relaciones de corte, con 498/498 coincidencias retrospectivas
C2/C3 y cuatro pruebas sintéticas. No predice aún el precio completo. Supabase
sigue rechazando la conexión y falta una copia estable de 0017 para el 260499.

- [Fase 6](paridad/fase-6/00-resumen.md): 14 uniones, esquineros a cero,
  grosor de catálogo en edición/guardado y valoración de su longitud.
- [Fase 5 parcial](paridad/fase-5/00-resumen.md): búsqueda de vidrio real por
  código/descripción en línea y elemento; E11 y Diseño V3 siguen pendientes.
- [Fase 7 parcial](paridad/fase-7/00-resumen.md): diagnóstico del bloqueo de
  precio real y avisos breves en PDF, conservando los importes sin valorar.
- Base local aluminior_real_test recreada e importada; web de QA en :3002.
  Main con cambios locales, sin push; env.example permanece sin seguimiento.

Guardado, reapertura y PDF del caso de esquinero verificados. Esto todavía no
acredita una versión comercial lista para el taller: catálogo dibujable,
resolución completa de perfiles/asociados y aceptación integral siguen abiertos.
Sergio exige precio automático completo; no acepta una salida provisional con
importe manual. El contraste C2/C3 + GMC400 y las causas pendientes están en
fase 7. Corregido que las hojas sin medida se confundieran con un fijo al
calcular vidrio; pendiente el desglose verificable del 260499 de Productor 0017.

## 25/09/2026 — fase 4: materiales por elemento

Perfiles y vidrio por elemento como excepción sobre el general de la línea,
respaldado por los datos reales (64 y 55 de 175 cerramientos los mezclan), y
aplicación a modelos iguales con confirmación. Productor quedó bloqueado por
un aviso de licencia y no se observó «Actualizar todos los elementos».
Ver [resumen de fase 4](paridad/fase-4/00-resumen.md).

## 25/09/2026 — fase 3: composición bidimensional

Observado en Productor 0017 (260497, cerrado sin Aceptar): el configurador
compone en dos dimensiones con anclajes a la derecha y debajo, puntos verdes y
uniones nuevas sin configurar de 20 mm. Implementado en Aluminior como
configuración v3 compatible con v1/v2, configurador con la disposición de
Productor y arrastre con alternativa de teclado. Corregidos dos defectos que
impedían guardar cerramientos con el catálogo real. Ver
[resumen de fase 3](paridad/fase-3/00-resumen.md) y
[evidencia](paridad/fase-3/01-evidencia-composicion.md).

Entorno local: `aluminior_real_test` en el Postgres de pruebas (55433) contiene
el catálogo importado de `export_datos/EMP0016` con el ETL existente; es
efímero (tmpfs). Configuración de lanzamiento `web-local-real` (puerto 3002,
opt-in QA local). Nada se escribe en Supabase.
Las observaciones anteriores conservan su fecha y sus límites; no certifican el
estado de producción ni autorizan ejecutar sus antiguos encargos.

## Cierre histórico de jornada del 20/09/2026

Trabajo finalizado por indicación del usuario el 20/09/2026. Commit, integración
en main y push autorizados para este cierre. Consultar el
[relevo de fin de jornada](CIERRE-JORNADA-2026-09-20.md) antes de continuar.

Fase 1 aceptada técnicamente en QA; fase 2 con geometría y navegador/PDF
verificados localmente y contraste directo con Productor iniciado, aún parcial.
Código de aquel cierre: `c756aea`; la observación posterior no cambió código.
En Productor 0017 quedaron tres ventanas y un fijo en el configurador. El ancho
del fijo estaba en edición (último valor visible 30; un envío posterior para
completar 300 fue interrumpido), sin Actualizar ni aceptación final comprobada.
No reanudar acciones a partir de coordenadas o valores de esta sesión.

## Nueva evidencia del operador

El 20/09/2026 el usuario aporta doce capturas y el recorrido de creación del
presupuesto. Ver [registro de Productor](paridad/OBSERVACION-PRODUCTOR-2026-09-20.md):
arrastre, Actualizar, catálogos, uniones, doble acristalamiento y formas de pago.
PSU001 muestra grosor 2 mm aunque su descripción diga 100mm. El caso final
es 6300 × 1200; queda pendiente contrastarlo con iguales entradas en Aluminior.
Es evidencia nueva, no un cierre adicional de fase ni implementación funcional.

## Arquitectura comprobada

- `packages/core`: dominio puro, cálculo y geometría independientes de UI y BD.
- `packages/db`: esquema Drizzle, acceso PostgreSQL y salvaguardas de pruebas.
- `packages/etl`: importación y mediciones; los ejecutables poseen la conexión.
- `packages/web`: Next.js App Router, React y orquestación de servidor.
`packages/api` ya no existe en este checkout. Se retira el script obsoleto
`dev:api`, que apuntaba a ese workspace ausente; `npm run dev:web` inicia
Next.js con la interfaz y su servidor.

Las entradas públicas de los módulos refactorizados siguen siendo compatibles.
El mapa y las excepciones están en [SANEAMIENTO-MODULAR.md](SANEAMIENTO-MODULAR.md).

## Implementado no significa aceptado como paridad completa

| Área | Evidencia local | Límite |
|---|---|---|
| Presupuestos | Cabecera, líneas, servicios de alta/edición, totales, numeración y copia en `_lib` | No garantiza todas las operaciones de Productor |
| Persistencia de cerramientos | Servicios transaccionales, snapshot económico y pruebas de rollback/copia | Receta de seis módulos aceptada en QA local; no certifica precio comercial |
| Geometría | `geometriaCerramiento`, `proyectarCerramiento` y adaptadores web/PDF | Aceptación local de SVG, teclado y PDF realizada; contraste directo con Productor pendiente |
| Manos y 1OFI | Geometría y pruebas específicas en core; B1 y tramo 1OFI documentados | No generalizar cotas ni familias sin evidencia |
| Producción | Optimizador, despunte, hojas y componentes de producción | No acredita que todos los cortes sean fabricables |
| Tarifas | Modelo de venta, margen y recálculo puro | No confirma tarifas del taller ni paridad de todas las herramientas masivas |
| ETL | Importador modular y pruebas sintéticas de equivalencia | Carga real posterior en QA local; no certifica cobertura de todo el catálogo |

## Pendientes conservados

1. Fase 0: la auditoría declara aceptación parcial. Esta copia no contiene los
   documentos de `docs/paridad/fase-0/` citados en los prompts. No se reconstruyen
   ni se dan por aprobados a partir de esas referencias.
2. Fase 1: receta de seis módulos aceptada localmente: conservación tras error,
   reintento/doble envío, una GRUPO, reapertura, snapshot y PDF inspeccionado.
   Ver [alcance y límites de idempotencia](paridad/fase-1/00-resumen.md).
3. Fase 2: geometría compartida comprobada a tres tamaños, selección por teclado
   corregida y PDF examinado. Queda el contraste directo con Productor y la
   ergonomía integral de fase 8. Ver [aceptación local](paridad/fase-2/03-aceptacion-local.md).
   `74e0c95` sigue ausente: los arreglos de esta continuación son nuevos y no
   se atribuyen al informe histórico de otra copia.
4. La disponibilidad de capturas y registros de otras sesiones no se deduce de
   que un Markdown los mencione. La observación directa posterior es parcial y está en el relevo de cierre.
5. El estado de migraciones remotas y de datos comerciales no se ha verificado
   en este encargo. Los resultados de pruebas locales no lo certifican.

## Lectura y comprobaciones

1. [AGENTS.md](../AGENTS.md): reglas de trabajo.
2. [ARQUITECTURA.md](../ARQUITECTURA.md): decisiones y límites de módulos.
3. [SANEAMIENTO-MODULAR.md](SANEAMIENTO-MODULAR.md): cambios y verificación.
4. [INDICE-DOCUMENTACION.md](INDICE-DOCUMENTACION.md): clasificación de los Markdown.
5. [PARIDAD-PRODUCTOR.md](../PARIDAD-PRODUCTOR.md): criterios de evidencia.

`npm run check:architecture`, `npm run typecheck` y `npm test` son las
comprobaciones del saneamiento. Las pruebas de integración usan exclusivamente
el [PostgreSQL local de pruebas](../packages/db/README.md).

Continuación del 20/09/2026: [Actualización explícita de medidas y corrección de PSU001](paridad/IMPLEMENTACION-ACTUALIZAR-2026-09-20.md). Implementación y verificaciones locales; contraste integral pendiente.
