# Fijos operativos: seis modelos y límites de cálculo

27/09/2026. Contrato en [00](00-contrato.md). Base `b454919`.

## Incorporación

| Familia Productor | Modelos añadidos | Composición acreditada |
|---|---|---|
| 005, fijos abatibles | 03H, 03V, 06 | 3 bandas horizontales, 3 verticales, rejilla 2 × 3 |
| 009, fijos corredera | CF, CFT, FC | fijo perimetral, fijo con parteluz, fijo no perimetral |

Una regla compartida construye las rejillas. El código no descifra los nombres
para deducir geometría. `verificar-catalogo-fijos.mjs` contrasta cada entrada con
el árbol normalizado: identidad única, familia, dimensiones, descripción,
ausencia de variantes y firma geométrica. Resultado ejecutado: seis coincidencias.
El fijo `0` conserva la primera posición y el valor inicial del configurador.

Las plantillas operativas pasan de **15 a 21**. El traductor pasa de **47 a 53**
candidatas: añade CF/CFT/FC y C2FI/C2FS/C2FSFI. Las tres correderas con fijos
siguen sin habilitar: conservan metadatos de cota absoluta, pero falta aplicarlos
al redimensionado físico. No se declara cerrada ninguna familia completa.

## Recorrido ejecutado

Base local de QA con catálogo copiado; presupuesto sintético 260002, sin cliente.
Se conservaron documentos anteriores. No se ejecutó el importador destructivo.

Para las seis entradas: selección desde familia y galería, colocación, edición
de ancho, configuración de serie/acabado/vidrio, aceptación, recarga, reapertura,
segunda edición y guardado sin duplicar línea. Tres huecos en 03H/03V, seis en
06, uno en CF/FC y dos en CFT. GMA50 para 005 y GMC400 para 009; acabado L,
V410ACGP6 y variante de acristalamiento 2. Los precios incompletos permanecen
como «sin valorar».

Enter selecciona el vidrio con foco visible. `scrollWidth === clientWidth` a
320, 390 y 1440 px; reduced motion activo. Capturas de los seis modelos
inspeccionadas. El recorrido final de cinco modelos no registró excepciones JS;
la carga inicial tuvo el 404 del favicon ya conocido. La línea C2 anterior
mantiene 292,59 € al reabrir el presupuesto de fase 7.

Evidencia local ignorada: `output/playwright/fase8/fijos-recorrido-restaurado.log`,
`reabrir-03H.log`, capturas por modelo y anchura, `presupuesto.pdf` y sus renders.
El primer ensayo de 03H dejó además una línea de estructura simple; no se usa
como prueba de edición del GRUPO. Las seis pruebas operativas son cerramientos.

## Fallos encontrados y corregidos

- Un corte periódico como `363.3333333333333` impedía persistir el snapshot.
  La columna y su guarda admiten dos decimales: una medida no representable se
  conserva como desconocida y su valor original queda en el diagnóstico que
  bloquea fabricación. No se redondea el corte ni se modifica el precio.
  La revisión independiente añadió casos de notación exponencial y decimales
  indistinguibles mediante `Number`; la comparación final es decimal exacta.
  Las medidas enteras mantienen su formato anterior.
- El adaptador confundía paños con ranuras de acristalamiento. PLAN C.4 define
  cinco configuraciones posibles, no cinco vidrios máximos. Una entrada con
  vidrio común ocupa la ranura 1, distinguiendo hojas/fijos; cada paño mantiene
  su propia pieza y medidas. El caso de seis huecos ya se guarda.
- El PDF podía dejar el rótulo en una página y el dibujo en otra, o invadir el
  pie. Ahora rótulo, dibujo y cota forman un bloque indivisible; la descripción
  larga continúa pudiendo dividirse. Dos pruebas usan las posiciones del PDF
  realmente renderizado, incluidas siete líneas y un texto de 1200 palabras.
  PDF real de QA regenerado e inspeccionado en sus tres páginas: conserva seis
  dibujos y todos los importes y totales como «Sin valorar».
- La revisión del comparador detectó redondeo indebido de cantidades y NaN
  convertido a ausencia. Se separó la cantidad exacta de la tolerancia de
  medida de 0,1 mm; números no finitos se rechazan. Los 18 casos se repitieron.

## Cálculo: límite explícito

18 casos, tres tamaños por modelo: el lector CSV y el adaptador PostgreSQL
producen las mismas piezas y resultados, con 18 precios bloqueados. Comparten
motor; esto prueba coherencia de integración, **no paridad independiente**.
Persisten asociaciones de mano de obra por componente/grupo sin acreditar,
costes ausentes y, donde procede, cortes sin precisión representable.

Se repitió el contraste independiente existente contra 421 líneas de factura:
73 específicas excluidas; 179 exactas, 118 con diferencia atribuible al precio
unitario, 25 con diferencia económica pendiente, 18 bloqueadas y ocho despieces
distintos. Ninguna de esas 421 líneas corresponde a estos seis códigos.
No se extraen parámetros del despiece histórico para fabricar una coincidencia.
Falta una salida original con entradas conocidas para acreditar su cálculo.

La matriz completa conserva los 541 registros, sus bloqueos y sus fuentes.
Solo los seis casos de este lote reciben evidencia operativa nueva, ligada al
hash de EMP0016 y de los archivos de prueba; todos mantienen fabricación no
acreditada. Los resultados previos de C2 se referencian con su alcance histórico.

## Reproducción

```powershell
node --import tsx scripts/verificar-catalogo-fijos.mjs
npx tsx scripts/verificar-fijos-valoracion.ts aluminior_real_test
node --import tsx --test scripts/catalogo-completo/*.test.mjs
node --import tsx scripts/catalogo-completo/inventario.mjs --evidencias output/fase-8/evidencias-fijos.json
```

El segundo comando es de lectura y requiere el catálogo de QA local ya cargado.
No fijar `TEST_DATABASE_URL` a esa base: las suites usan bases sintéticas propias.
Las fuentes privadas, PDF de QA, matrices y capturas permanecen fuera de Git.

## Pruebas y revisión

Suites: core **602**, DB **55**, ETL **27** y web **693**, todas correctas
(1377). Scripts: 65 contrastes/cotas, 42 bancos y cobertura, 27 inventario y
evidencias, 10 comparador (144). El recuento antiguo de 15 plantillas en una
aserción de regresión se actualizó a las 21 incorporadas; no se retiró la prueba
de reconstrucción v1 ni sus aserciones de medidas e inmutabilidad.

Pruebas causales ejecutadas y restauradas: retirar las seis altas provoca
6 fallos; retirar ampliación del traductor, 7; retirar correcciones de snapshot,
6; retirar bloque PDF, 1; volver al comparador permisivo, 10. Inventario y
evidencias incluyen causales separados en [01](01-inventario.md). No se
estimaron estos números. Logs locales bajo `output/fase-8`.

Revisión independiente: traductor e inventario cruzados entre ejecutores;
catálogo y comparación revisados por ejecutor A; snapshot por ejecutor B;
PDF revisado por el arquitecto con código, posiciones y salida real. Hallazgos
corregidos en una ronda y comprobados por herramientas, sin ampliar el ciclo.

Typecheck, arquitectura y build de Next aprobados. El build usó únicamente
PostgreSQL local, deteniendo antes el servidor de desarrollo para no compartir
`.next`. No hubo push, integración en main, publicación, migraciones ni cambios
remotos. Los datos originales y MDB no se abrieron ni modificaron.
