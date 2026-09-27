# Cotas absolutas y relevo del catálogo

27/09/2026. Lote 3 desde `e50b06a`, conforme al
[contrato 06](06-contrato-cotas-absolutas.md). Cierre técnico local, no aceptación
integral del catálogo, de precio ni de fabricación.

## Resultado

C2FI, C2FS y C2FSFI disponibles en su familia de ventanas correderas. Conservan
los fijos de **300 mm** al modificar la altura total. Se resuelve primero el
árbol físico en milímetros y después el grosor gráfico: una división anidada
no pierde distancia por el trazo de su padre. Las medidas imposibles se
rechazan en el cerramiento y en el alta de estructura simple.

Las 22 plantillas anteriores conservan datos, composiciones, IDs y orden,
comprobados por igualdad profunda frente a `e50b06a`. El modelo inicial sigue
siendo 0. El reparto sin cotas y la rama de 1OFI con FI de instancia permanecen
iguales. No se ha añadido un campo nuevo de cota editable ni una política de precio.

| Cobertura EMP0016 | Inicio | Cierre |
|---|---:|---:|
| Modelos contabilizados | 541 | 541 |
| Con árbol / sin árbol | 393 / 148 | 393 / 148 |
| Nodos de catálogo | 5597 | 5597 |
| Candidatas dibujables | 54 | 54 |
| Plantillas habilitadas | 22 | 25 |
| Uniones habilitadas | 14 | 14 |
| Modelos con evidencia operativa acumulada en fase 8 | 7 | 10 |

Los tres modelos ya eran candidatos traducibles; ahora tienen consumidor de
cotas, validación y recorrido operativo. El inventario mantiene 36 familias
declaradas más el grupo sin familia y 65 MDB examinadas solo por metadatos.
No acredita que EMP0016 agote la instalación o sea su versión más reciente.

## Mapa de evidencia

| Fuente | Regla / contraste |
|---|---|
| Estructuras y EstructurasDiseño, sin TipoDoc | C2FI: HB 300 desde abajo; C2FS: HA 300 desde arriba; C2FSFI: HA y HB anidados, ambos 300 |
| Mismo árbol y par C2 ya acreditado | Dos hojas 10/1 y 10/2, separación invisible VI, marco NOR, fijos con vidrio |
| Árbol CSV independiente del renderer | 36 casos: altura de catálogo, 900, 1800 y 2317 mm; tres cajas gráficas y grosores por altura |
| QA local 260003, entrada conocida | GMC400/L/V484, doble cristal, 1200 × 1800; edición a 900 y vuelta a 1800 |
| PDF real del mismo documento | Tres dibujos con fijos, dos flechas por modelo, medidas y estado sin valorar |

El script de firma conserva hashes de las tres tablas. Se reutiliza la evidencia
de interacción de fases 3–4 y del par C2; no se ejecutó Productor ni se hizo una
nueva observación de escritorio original. Es contraste de catálogo y recorrido
local, no comparación integral nueva del operador en ambos programas.

## Precio y mano de obra

Nueve casos de los tres modelos, contrastados entre lector CSV y adaptador
PostgreSQL, coinciden en piezas, avisos e importe nulo. Ambos usan el mismo
motor; **no son un oráculo económico independiente**.

Persisten perfiles adicionales sin resolver, variables FI/FS no suministradas
al motor económico, asociados dependientes de esas medidas y selección de
mano de obra por componente/grupo. Los 300 mm del dibujo no se han convertido
silenciosamente en cotas de entrada económica. El precio y el total siguen
sin valorar; no se sustituyen por cero ni por ajuste manual.

La [investigación de mano de obra](07-mano-obra-fijos.md) amplía la búsqueda
a 205 CSV y 158.770 filas documentales. Encuentra dos líneas CF en el mismo
presupuesto, con minutos coincidentes en GMPC76R; no acreditan CF/GMC400.
Una hipótesis de categoría de serie y agregación por concepto reproduce 79
registros de control de TMP/16 (77 A y dos C), con documentos derivados entre
ellos. CFT/TFF sigue sin prueba positiva. Los 18 casos de los seis fijos
anteriores permanecen bloqueados. No se ha cambiado el motor económico.

## Verificación ejecutada

- Paquetes: **core 669, DB 55, ETL 27, web 707 = 1458 correctas**, sin omitidas
  en las ejecuciones de cierre. Scripts: **78 Node + 75 Vitest = 153 correctas**.
- Typecheck aprobado; arquitectura: 691 archivos, 345 módulos, cero infracciones.
  Build Next aprobado con DATABASE_URL local y sin dev compartiendo `.next`.
- Causal de geometría: **30 fallos de 48** al retirar resolución/proyección
  acotadas; restauración exacta de bytes y **48/48** correctas.
- Revisión independiente: 127 pruebas core, 36 contrastes CSV, 36 proyecciones
  PDF y tres fronteras inválidas; sin hallazgos. Para MO se recalcularon las
  relaciones y minutos directamente desde CSV, sin funciones productivas.
  Ambas revisiones cerraron en la primera ronda.
- Navegador: las tres entradas conservan geometría al guardar/reabrir y al
  editar 1800 → 900 → 1800. Una sola línea por caso. Alturas de 300/300/600
  rechazadas sin mutar la geometría previa; también rechazadas en estructura
  simple, manteniendo las tres líneas existentes.
- Enter, foco visible, reduced motion y `scrollWidth === clientWidth` a
  320, 390 y 1440 px en los tres modelos; cero excepciones JS en el recorrido.
  Capturas y las dos páginas del PDF inspeccionadas. No se imprimió en taller.

Incidencias de ejecución conservadas en los logs: la primera llamada forzó
TEST_DATABASE_URL a la base general de tests e hizo fallar el esquema mínimo
de tarifa. Se retiró ese override para recuperar las bases separadas; QA nunca
fue destino de tests destructivos. La validación nueva se colocó después de
validar cotas explícitas para conservar ese contrato. Una integración agotó
los cinco segundos con la concurrencia general; la suite web completa pasó
con dos workers, sin aumentar timeout, omitir tests ni alterar aserciones.
El primer guion de navegador esperaba que desapareciera un formulario que el
alta deja abierto; se corrigió la espera para comprobar respuesta y reapertura.

## Reproducir y continuar

```powershell
node --import tsx scripts/verificar-catalogo-correderas-acotadas.mjs
npx tsx scripts/verificar-correderas-acotadas-valoracion.ts aluminior_real_test
node --import tsx scripts/investigar-mano-obra-fijos.ts
Remove-Item Env:TEST_DATABASE_URL -ErrorAction SilentlyContinue
$env:EDITOR_CSV_PRUEBA = 'C:/Users/sergi/Desktop/Aplicaciones/Aluminior/export_datos/EMP0016'
npm test
# Si la carga concurrente agota el timeout: desde packages/web
npx vitest run --maxWorkers=2
# Desde la raíz
npm run typecheck
npm run check:architecture
node --import tsx --test scripts/banco-precios.test.mjs scripts/control-escaparate.test.mjs scripts/banco-motor.test.ts scripts/lib/*.test.mjs scripts/catalogo-completo/*.test.mjs
npx vitest run scripts/lib/contraste-referencias-corte.test.ts scripts/lib/cotas-instancia.test.ts scripts/lib/diagnostico-discrepancias.test.ts scripts/lib/contraste-despiece-facturas.test.ts scripts/lib/firma-piezas-catalogo.test.ts
node --import tsx scripts/catalogo-completo/inventario.mjs --evidencias output/fase-8/evidencias-lote3.json
```

Build: detener solo el dev de esta tarea; fijar DATABASE_URL a PostgreSQL local
de QA y ejecutar `npm run build --workspace @aluminior/web`. No requiere publicar.
No dirigir TEST_DATABASE_URL a `aluminior_real_test` ni reiniciar su contenedor
efímero: contiene los documentos sintéticos 260001–260003 y el catálogo importado.

Evidencia ignorada: `output/fase-8/lote3-*`, `cotas-{causal,restaurado}.json`,
`correderas-acotadas-valoracion.json`, `lote3-mo/`, `revision-cotas/`, `revision-mo/`
y `output/playwright/fase8/cotas-*-final.log`, capturas por código y tamaño,
`presupuesto-cotas.pdf`. Matriz: `output/catalogo-completo/matriz.json`;
estado por modelo y pruebas con hash, sin publicar el catálogo ni documentos.

- **Ahora:** unidad económica en serie para TMP/16: selección por categoría
  y agrupación por concepto, con los 79 controles disponibles y sin extrapolar
  TMG a TMP. Contrastar cotas económicas FI/FS contra entradas originales y
  resolver perfiles adicionales de C2 con fijos antes de habilitar su precio.
  Buscar originales de 03H/03V/06 y un CFT con TFF efectivo; conservar bloqueos.
- **Después:** resolver mano física de hojas 1/2 antes de ampliar abatibles;
  seguir módulos de hojas/marcos/carriles y comparar copias por procedencia.
- **Experimental:** curvas, plegables y elevables sin reglas suficientes;
  no habilitar por parecido visual.

Commit local de este lote: `feat(catalogo): conservar cotas de correderas con fijos`,
con autor y committer Sergio. Sin push, fusión en main, publicación, migraciones
nuevas ni cambios remotos. El catálogo completo sigue pendiente.
