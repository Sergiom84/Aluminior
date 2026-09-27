# C2P y relevo del catálogo completo

Continuación posterior: [lote 3, cotas absolutas y relevo](08-cotas-absolutas-y-relevo.md).
Este documento conserva la evidencia del lote 2.

Segundo lote desde `b5b79f4`, 27/09/2026. Contrato [04](04-contrato-puerta-corredera.md).
El catálogo completo **sigue pendiente**. Esta entrega habilita siete modelos
nuevos en dos unidades verificadas; no declara completas sus familias.

## Cobertura

| Medida sobre EMP0016 | Antes (`b454919`) | Tras los dos lotes |
|---|---:|---:|
| Registros íntegramente contabilizados | 541 | 541 |
| Con árbol / sin árbol | 393 / 148 | 393 / 148 |
| Nodos de catálogo | 5597 | 5597 |
| Composiciones candidatas | 47 | 54 |
| Plantillas operativas | 15 | 22 |
| Uniones operativas | 14 | 14 |
| Fijos abatibles 005 habilitados | 4 de 8 | 7 de 8 |
| Fijos corredera 009 habilitados | 0 de 6 | 3 de 6 |
| Puertas correderas 002 habilitadas | 0 de 15 | 1 de 15 |

Modelos incorporados: **03H, 03V, 06, CF, CFT, FC y C2P**. El inventario
descubre 36 familias declaradas, más el grupo sin familia; seis familias
declaradas no contienen modelos. No usa la enumeración del encargo como filtro.
Hay una exportación completa de catálogo descubierta y 65 MDB inventariadas
solo por metadatos. Esto no acredita que EMP0016 sea la versión más reciente
ni que agote los catálogos de la instalación.

## Puerta C2P

EMP0016: descripción «PUERTA CORREDERA DE DOS HOJAS», familia 002,
1500 × 2000 mm. Marco NOR, división VI invisible equidistante, dos hojas
16/1 y 16/2 con vidrio simple como nodo. `SeriesAsocV2TiposHoja` acredita
tipo16, dos hojas corredera y perfiles de puerta. No se interpretó el código.

El traductor exige familia/tipo coherentes, marco normal y pareja directa en
la raíz, sin fijos, cotas ni variantes. C2PFS permanece pendiente. La regla
de composición se comparte con C2; comparación profunda ejecutada conserva
las 21 plantillas previas, sus IDs y su orden. El modelo inicial sigue siendo 0.
La firma geométrica coincide con el árbol CSV para C2 y C2P; un barrido de las
15 puertas confirma que solo C2P queda candidata en esta unidad.

## Precio y despiece independientes

Se encontraron cinco líneas originales C2P. Una tiene diseño específico y se
excluye expresamente. En las cuatro restantes coinciden piezas y precio
material entre el resultado original, el motor CSV y el adaptador PostgreSQL:

| GMC400, vidrio V484 | Acabado | Precio material coincidente |
|---|---|---:|
| 2032 × 2027 mm | P | 457,29 € |
| 1000 × 2000 mm | P | 311,29 € |
| 1420 × 2000 mm | L | 346,88 € |
| 1400 × 1999,5 mm | L | 345,96 € |

Las entradas proceden de medidas/configuración/opciones originales. El
despiece guardado únicamente se usa para comparar. Se excluyen otros
conceptos de factura según el clasificador ya probado; no se afirma igualdad
de la factura completa. El script falla ante diferencias, entradas ausentes
o un cambio del conjunto de cuatro casos no específicos.

**Los cuatro casos conservan dos vidrios sin coste y el aviso de junta V1000.**
No acreditan rentabilidad, fabricación ni todas las combinaciones de C2P.
Los seis fijos mantienen 18 casos bloqueados y no tienen oráculo original
en las 421 líneas investigadas. La ausencia de precio sigue siendo ausencia.

La matriz admite ahora evidencia `verificada-en-casos` exclusivamente junto
a `independiente-en-casos`, fuente exacta, alcance y pruebas locales con hash.
Esta extensión sustituye la limitación del esquema del lote 1 descrita en 01.
Ni el cargador ni el resumen convierten esa evidencia en fabricación acreditada
o en una garantía para la familia completa.

## Comprobaciones de cierre ejecutadas

En el presupuesto sintético local 260002: selección de C2P desde «PUERTAS
CORREDERAS 90º», colocación con sus 1500 × 2000 iniciales, edición a
1420 × 2000, GMC400/L/V484 y doble acristalamiento. Guardar y recargar conserva
dos hojas y 346,88 €. Editar a 1430 y volver a 1420 mantiene una sola línea y
recupera el importe original. El aviso y el coste incompleto siguen visibles.

Enter y foco visible correctos; sin excepciones JS durante el recorrido;
`scrollWidth === clientWidth` a 320, 390 y 1440 px, reduced motion activo.
Capturas y las tres páginas del PDF real inspeccionadas. C2P sale con dos
flechas, 1420 × 2000 y 346,88 €; el total del presupuesto continúa sin valorar
porque contiene los fijos pendientes. No se imprimió físicamente en taller.

- Paquetes: **core 621, DB 55, ETL 27, web 695: 1398 correctas**, sin omitidas.
- Scripts: **75 Node + 75 Vitest: 150 correctas**, sin omitidas.
- Typecheck aprobado; arquitectura: 682 archivos, 342 módulos, cero infracciones.
- Build Next aprobado con base local, sin servidor dev compartiendo `.next`.
- Causal de core: cinco fallos de 19 al retirar el cambio, después 86/86 en
  el conjunto focalizado. El cargador de evidencia tiene sus propias causales
  de cuatro fallos al retirar estado y uno al retirar coherencia de contraste.
- Revisión independiente del núcleo y del contraste por ejecutor A: ejecutó
  65 pruebas, las firmas CSV y los cuatro casos originales sin DB. El arquitecto
  ejecutó DB, navegador, PDF, suites generales y revisó la extensión de evidencia.
  No hubo hallazgos pendientes ni una tercera ronda de revisión.

Evidencia local: `output/playwright/fase8/c2p.log`, `C2P-{320,390,1440}.png`,
`presupuesto-c2p.pdf`, `output/fase-8/c2p-valoracion.json`,
`c2p-core-{causal,restaurado}.json`, `c2p-cobertura-core.json` y logs `lote2-*`.
Matriz final: 541 modelos, siete con prueba operativa nueva, seis con valoración
bloqueada y uno con cuatro casos económicos independientes; ninguno acredita
fabricación. La evidencia heredada de otros modelos no se cuenta como nueva.

## Reproducir cálculo y catálogo

```powershell
node --import tsx scripts/verificar-catalogo-c2p.mjs
npx tsx scripts/verificar-c2p-valoracion.ts aluminior_real_test
node --import tsx --test scripts/catalogo-completo/*.test.mjs
node --import tsx scripts/catalogo-completo/inventario.mjs --evidencias output/fase-8/evidencias-final.json
$env:EDITOR_CSV_PRUEBA = 'C:/Users/sergi/Desktop/Aplicaciones/Aluminior/export_datos/EMP0016'
npm test
npm run typecheck
npm run check:architecture
```

Para build: detener únicamente el dev local de esta tarea, fijar `DATABASE_URL`
a PostgreSQL local de QA y ejecutar `npm run build --workspace @aluminior/web`.
El build no requiere ni autoriza publicar. Los comandos de los 150 tests de
scripts están registrados en los logs de ejecución y en fase 7/13; añadir
`scripts/catalogo-completo/*.test.mjs` y `scripts/lib/firma-piezas-catalogo.test.ts`.

Commits locales con autor y committer Sergio: `b5b79f4` (lote 1) y
`feat(catalogo): habilitar puerta corredera C2P` (lote 2, identificable en git log).
Sin push, fusión en main, publicación, migraciones ni cambios remotos.

Fuentes privadas y evidencias completas permanecen bajo `export_datos/` y
`output/`, ignorados por Git. No cambiar `TEST_DATABASE_URL` a la base con
documentos de QA ni ejecutar importadores que la vacíen.

## Siguiente trabajo

- **Ahora:** aplicar cotas absolutas al redimensionado físico antes de activar
  C2FI/C2FS/C2FSFI; contrastar mano de obra por componente/grupo para los seis
  fijos; obtener salidas originales con entradas conocidas para su despiece.
  Resolver la discrepancia de mano de hojas 1/2 antes de ampliar abatibles.
- **Después:** seguir por módulos de hojas, marcos y carriles pendientes según
  la matriz; auxiliares sin árbol con su configuración propia, sin forzarlos
  a ventana; comparar catálogos de copias verificadas por año y procedencia.
  Las 148 entradas sin árbol no se etiquetan automáticamente como perdidas.
- **Experimental:** curvas, plegables, elevables y otras modalidades sin
  interpretación suficiente. Investigar fuentes de reglas y ejemplos controlados
  antes de habilitar su comportamiento, precio o fabricación.

Quedan identificados por modelo los componentes desconocidos, variantes,
marcos, cotas, ausencia de configuración y verificaciones pendientes en
`output/catalogo-completo/matriz.json`. Los detalles no se versionan por
contener el catálogo completo. Esta matriz y el código permiten reproducir
el siguiente lote sin depender del relato de esta conversación.
