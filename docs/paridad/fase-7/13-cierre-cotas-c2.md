# Continuación local: cotas, discrepancias y C2

27/09/2026. Rama `feat/motor-catalogo-completo`, base `60d050b`.
Alcance: bloque **Ahora** de [09](09-continuacion-local.md). Trabajo local;
no se fusiona main, publica, modifica Supabase, cambia migraciones ni accede
a MDB originales. Se reutilizan CSV y el catálogo PostgreSQL ya cargado.

## Resultado

- [Cotas de instancia](10-cotas-instancia.md): seis de ocho entradas directas
  recuperadas con identidad documental y procedencia. Cinco reproducen 311
  filas materiales; otra conserva una regla B pendiente. Ninguna de las seis
  cierra todavía el importe: falta mano de obra por componente/grupo.
  Dos cotas de presupuestos de origen se documentan como candidatas, sin
  aplicarlas porque no está probada su conservación al facturar.
- [Discrepancias](11-discrepancias-investigadas.md): investigadas las 25
  económicas y nueve geométricas. Una diferencia de piezas era ruido Double
  en el comparador y se corrige manteniendo la precisión de 0,1 mm.
  Las otras ocho permanecen abiertas. No se retocan tarifas, descuentos o
  política de redondeo para ajustar resultados históricos.
- [C2 visual](12-catalogo-visual-c2.md): dos hojas, división invisible,
  flechas horizontales, sin bisagras. Disponible en su categoría, miniatura,
  configurador y geometría PDF. El generador solo admite la forma acreditada
  de ocho nodos, sin interpretar códigos ni extender variantes por parecido.
- GRUPO conserva las opciones por defecto cuando no se envía una selección;
  `[]` sigue siendo una deselección explícita. Se preservan los avisos
  informativos del motor y los bloqueos ante importes no representables.

## Contraste reproducido

421 líneas de factura; 73 diseños específicos fuera de este contrato.

| Estado de las 348 restantes | Líneas |
|---|---:|
| Piezas e importe exactos | 179 |
| Piezas exactas; diferencia explicada por precios unitarios | 118 |
| Piezas exactas; diferencia económica pendiente | 25 |
| Bloqueadas | 18 |
| Despiece diferente | 8 |

Los bloqueos no cuentan como valoración y la comparación no incluye todos
los conceptos comerciales, ajustes manuales ni fabricación de la factura.
El diagnóstico económico separa residuos de exportación, límites de redondeo,
incrementos ya incluidos en precios y superficie facturable histórica.
Los experimentos explicativos no cambian el estado oficial del comparador.

PostgreSQL frente a CSV: **310 importes coincidentes, 16 bloqueos coincidentes,
un rechazo sin plantilla y cero diferencias**. Se excluyen 21 casos con
horas adicionales manuales, ajenas a la entrada de ese caso de uso.

## Verificación ejecutada

| Batería final | Aprobadas |
|---|---:|
| Core | 577 |
| DB | 55 |
| ETL, incluida comprobación CSV opcional | 27 |
| Web | 684 |
| Scripts Vitest | 65 |
| Scripts node:test | 36 |

Total: **1343 de paquetes y 101 de scripts**. Sin omisiones. `npm test`
ejecutó todos los paquetes; tras la corrección final de avisos se repitió
la batería web completa, pasando de 682 a 684 casos. Typecheck de paquetes
y scripts, build web y arquitectura aprobados: 661 archivos, 339 módulos,
40 revisiones de tamaño, cero infracciones. Suite y build en serie.

Dos revisiones independientes, con contrato, artefactos y evidencia:

1. Visual/scripts: un largo ausente se explicaba erróneamente como residuo
   cero. Corregido; valores ausentes y no finitos permanecen pendientes.
2. Adaptador: el aviso informativo impedía crear un bloqueo cuando el metraje
   no cabía en el snapshot. Corregido; test del servicio con helpers reales
   reproduce una excepción antes del arreglo y devuelve un bloqueo válido
   después. Segunda ronda de ambos revisores sin hallazgos pendientes.

Causales medidas: lector de cotas 5 fallos sin entrega de cotas; adaptador,
defaults y conservación de avisos un fallo cada uno; dibujo corredera dos;
compensación Double dos; guard de metraje no representable uno. Las
restauraciones terminaron antes de los gates finales. No se debilitaron tests.

## Recorrido de navegador

Chromium local, `127.0.0.1:3002`, PostgreSQL `aluminior_real_test`, bypass QA
de desarrollo ya existente limitado al entorno local. Presupuesto sintético
nuevo sin cliente; tres líneas de prueba, conservadas. No se recarga el
importador completo ni se vacía una base con documentos.

- Selección de C2 desde su categoría y colocación en el lienzo.
- GMC400, acabado L, vidrio V410ACGP6, doble acristalamiento, 1200 × 1200.
- Estructura simple y GRUPO: **292,59 € y 33 piezas**. El precio continúa
  acompañado del aviso de vidrio de 20 mm y junta V1000 ausente.
- Dos vidrios sin coste: el coste sigue incompleto. No se declara rentable
  ni fabricable una línea por tener calculado su precio de venta.
- Edición de ancho a 1210 y vuelta a 1200; actualización, guardado y
  reapertura. Las líneas anteriores no se revaloran solo por abrirlas.
- Guardar y recargar conserva precio, avisos, medidas y dos hojas; editar
  mantiene el número de líneas. Se espera la respuesta POST y el cierre del
  editor, no el cambio de etiqueta del botón a «Guardando».
- Selección del vidrio con Enter y foco visible; reduced motion activo;
  `scrollWidth === clientWidth` a 320, 390 y 1440 px. Capturas inspeccionadas.
- Sin excepciones JavaScript durante el recorrido final. La carga inicial
  registra un 404 del favicon, ajeno a este cambio; no se afirma consola vacía.

Evidencia local ignorada: `output/playwright/c2/cierre-browser.log` y
`final-320-reduced.png`, `final-390-reduced.png`, `final-1440-reduced.png`.
Geometría PDF contrastada por tests; no se certifica aquí una nueva impresión
física. La referencia Productor procede de CSV y observación anterior del
operador, sin ejecutar el legacy. Falta aceptación integral de taller,
atajos y modalidades que no forman parte de este recorrido.

## Reproducir

Desde la raíz, con el PostgreSQL de pruebas local disponible:

```powershell
$env:EDITOR_CSV_PRUEBA = 'C:/Users/sergi/Desktop/Aplicaciones/Aluminior/export_datos/EMP0016'
npm test
npm run typecheck
npm run check:architecture
npx vitest run scripts/lib/contraste-referencias-corte.test.ts scripts/lib/cotas-instancia.test.ts scripts/lib/diagnostico-discrepancias.test.ts scripts/lib/contraste-despiece-facturas.test.ts
node --import tsx --test scripts/control-escaparate.test.mjs scripts/banco-precios.test.mjs scripts/lib/cobertura-facturas-2026.test.mjs scripts/banco-motor.test.ts
node --import tsx scripts/verificar-catalogo-visual-c2.mjs
npx tsx scripts/contrastar-despiece-facturas.ts export_datos/EMP0016 output/facturas-2026 output/continuacion-cotas-c2/contraste
npx tsx scripts/verificar-motor-catalogo-db.ts output/facturas-2026 output/continuacion-cotas-c2/contraste/detalle.json aluminior_real_test
node --import tsx scripts/investigar-discrepancias-facturas.ts export_datos/EMP0016 output/facturas-2026 output/continuacion-cotas-c2/contraste/detalle.json output/continuacion-cotas-c2/discrepancias
```

El build usa solo `DATABASE_URL` local. No fijar `TEST_DATABASE_URL`
globalmente: ETL destructivo utiliza su propia base `aluminior_etl_test`.
Los logs finales llevan el prefijo `output/continuacion-final-`.

## Siguiente unidad

- **Ahora:** acreditar MO por componente/grupo y regla B; resolver la
  procedencia contemporánea de dos cotas; demostrar reglas de incremento,
  redondeo y superficie antes de cambiar valoración; reconstruir las ocho
  geometrías pendientes sin deducir entradas desde el resultado.
- **Después:** diseños específicos, compactos, mosquiteras, tapajuntas,
  B3/4HE/4HC, otras familias visuales y aceptación completa del taller.
- **Experimental:** regeneración editable de tablas de acristalamiento y
  modalidades aún sin evidencia. No sustituir carencias por valores manuales.

Main, push, publicación y cambios remotos permanecen fuera de autorización.
