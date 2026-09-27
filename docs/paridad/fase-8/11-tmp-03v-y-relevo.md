# TMP/16 y 03V: cierre del núcleo y relevo

27/09/2026. Continuación desde `b5dc16a`, conforme al
[contrato 09](09-contrato-03v-tmp.md). Mapa económico y procedencia en
[10](10-contraste-03v-2025.md). Cierre local del núcleo y su contraste CSV;
**no activa el precio en la web** ni acredita fabricación.

## Terminado

- Regla pura TMP/16: selección por categoría explícita, cantidades agregadas
  y una fila de minutos por concepto. TMG conserva su emisión por elemento.
- Metadatos de concepto/serie conservados por el lector CSV. Categoría,
  familia, serie, asociación, selectores y tiempos incompletos o ambiguos
  mantienen el bloqueo. Un tiempo ausente o inválido no se convierte en cero.
- Activación del compositor limitada a 03V/GMA350 y 03V/GMA65OPT con diseño
  estándar explícito. Los demás modelos/series y diseños específicos no
  reciben esa habilitación por parecido o por compartir categoría.
- Tres originales de EMP0015: 105 filas materiales sin MO y las 12
  aportaciones de minutos coinciden; los tres cálculos ya no tienen el
  bloqueo TMP. Dos importes coinciden con PVP de la misma fuente; el tercero
  conserva la diferencia de precio de vidrio de su documento fechado en
  2024. Compararlo con su precio guardado explica la diferencia y no altera
  el catálogo ni el precio calculado.
- `investigar-03v-anual.ts` falla si no reproduce el despiece/minutos y la
  clasificación económica acreditada; las salidas originales se consultan
  después del cálculo. `verificar-tmp-anuales.ts` contrasta la regla pura
  sin extender automáticamente la cobertura económica del compositor.

El catálogo sigue con **25 plantillas y 14 uniones**. No se han cambiado
geometría, interfaces, persistencia, migraciones ni tarifas. La vía web no
aporta los metadatos ni la declaración estándar exigidos y mantiene sus
bloqueos. No se repite el recorrido visual de lotes anteriores como si fuera
evidencia nueva; esta unidad no modifica la interfaz.

## Verificación ejecutada

- Paquetes: core **725**, DB **55**, ETL **27**, web **707**: **1514** pruebas
  correctas, sin omitidas en el cierre. Web con dos workers.
- Scripts: **78 Node + 113 Vitest = 191** correctas. Incluyen 24 pruebas de
  metadatos TMP y 14 de PVP desde CSV hasta el motor.
- Typecheck de paquetes y scripts nuevos aprobado. Arquitectura: 698
  archivos, 346 módulos, cero infracciones. Diff sin errores de whitespace.
- Causal ejecutada: **89/89**, retirada de la integración → **4 fallos
  reales**, restauración exacta por SHA-256 → **89/89**.
- Contraste original 03V reejecutado por el coordinador después de las
  guardas finales: 3/3 minutos y despieces; dos precios exactos y uno con
  diferencia de PVP localizada. No son tres presupuestos necesariamente
  independientes; son tres líneas con sus claves y procedencia.
- Regla pura reejecutada: **79/79** controles de EMP0016 y **90/90** de
  EMP0015, más **3/3** 03V. Fuentes CSV comprobadas antes y después.
- Los cuatro originales anuales y sus cuatro copias conservan los hashes
  del manifest previo. Evidencia: `lote4-gates/fuentes-intactas.json`.

La revisión independiente encontró un P2 en la lectura heredada de PVP:
vacío o inválido se convertía en cero. Corregido conservando las filas y
la selección exacto/genérico del resolvedor; un exacto inválido no cae al
comodín. La adversaria CSV→motor reproduce el fallo y pasa después. Causal
adicional: **8 fallos de 14 antes; 14/14 después**. Cero explícito sigue
siendo cero válido; ausencia o invalidez conserva importe nulo. Evidencia
bruta en `output/fase-8/lote4-revision/`.

Revisión independiente cerrada en dos rondas: 89 focales y contrastes
originales en la primera; P2 corregido y **72/72** en el gate final, incluida
la reproducción original del defecto. Sin hallazgos abiertos dentro del
contrato. Dictámenes: `lote4-revision/REVISION-R1.md` y `REVISION-R2.md`.

La primera ejecución ETL omitía el caso de CSV histórico por no recibir
`EDITOR_CSV_PRUEBA`; se repitió con su ruta local y pasaron las 27. No se
modificaron aserciones, timeouts ni destinos de pruebas para obtener el pase.

## Reproducir

Desde la raíz; Java/Jackcess ya disponibles localmente. La primera orden
extrae solo desde `copia.mdb` dentro de `output`, verifica hash antes/después
y escribe fuera de Git. No abrir la MDB original.

```powershell
java -cp 'output/auditoria-anuales/lib/*' scripts/ExtraerContrasteAnual.java output/auditoria-anuales/EMP0015-aluminio/copia.mdb 30b70d2bcbad66f42e25184595858737c79b45bdadd8ff539552c35994851b47 output/fase-8/lote4-03v/datos
node --import tsx scripts/investigar-03v-anual.ts
node --import tsx scripts/verificar-tmp-anuales.ts
Remove-Item Env:TEST_DATABASE_URL -ErrorAction SilentlyContinue
$env:EDITOR_CSV_PRUEBA = 'C:/Users/sergi/Desktop/Aplicaciones/Aluminior/export_datos/EMP0016'
npm test
npm run typecheck
npm run check:architecture
node node_modules/vitest/vitest.mjs run scripts/lib/catalogo-csv-tmp.test.ts
```

Si la concurrencia general agota un timeout, ejecutar la suite web desde
`packages/web` con `node ../../node_modules/vitest/vitest.mjs run --maxWorkers=2`.
No fijar TEST_DATABASE_URL a `aluminior_real_test` ni reiniciar su contenedor.

Evidencia privada: `output/fase-8/lote4-03v/` (copias de datos, hashes,
baseline, contraste final, controles y causal) y `lote4-gates/` (logs del
coordinador). Los datos empresariales permanecen ignorados por Git.

## Secuencia y pendientes

- **Ahora:** continuar la unidad FI/FS de 08: buscar entradas económicas
  contemporáneas, verificar sus claves y estudiar perfiles adicionales de
  C2 con fijos. No pasar los 300 mm del dibujo como entrada económica.
  Para activar 03V en web, una unidad separada debe conservar los metadatos
  del catálogo, probar carga/adaptador con procedencia y hacer QA local.
- **Después:** ampliar TMP a otros modelos solo tras sus contrastes de
  material/precio; buscar originales de 03H/06, CFT con TFF efectivo y resolver
  mano física de hojas 1/2 antes de ampliar abatibles.
- **Experimental:** categorías, series especiales, preparación, tiempos por
  dimensión, curvas, plegables y elevables sin controles positivos.

CFT/TFF sigue sin evidencia histórica positiva. El recuento de facturas de
fase 7, la aceptación integral de precio y la fabricación no se cierran con
los tres presupuestos 03V. Sin push, main, Productor ni escrituras remotas.
