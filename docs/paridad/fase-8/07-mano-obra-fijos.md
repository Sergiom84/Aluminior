# Investigación de mano de obra de los seis fijos

27/09/2026. Unidad de lectura del [contrato 06](06-contrato-cotas-absolutas.md).
No cambia el motor, la política económica, la base de datos ni las plantillas.

## Resultado y alcance

Se ha localizado una causa comprobable de las asociaciones ambiguas: los
conceptos coincidentes pertenecen a categorías distintas. En el corpus
investigado, Productor selecciona la categoría acorde al tipo de perfiles y
agrupa la aportación de travesaños por concepto. Esta selección constituye
una **hipótesis contrastada en casos**, todavía no una regla general implementada.

La investigación mantiene los 18 casos de los seis fijos sin valorar. CF y FC
no tienen el bloqueo de mano de obra por componente/grupo: sus incidencias
actuales pertenecen a resolución de perfiles y a descuentos de vidrio.

También corrige el alcance del relevo: hay **dos líneas originales CF en
presupuestos**, aunque no aparezcan entre las 421 facturas investigadas antes.
Son dos líneas del mismo presupuesto con igual configuración, no dos ensayos
controlados independientes. No se encontraron los otros cinco códigos en las
tres tablas documentales descritas abajo. Esto no prueba su ausencia en otras
empresas, copias, ejercicios o documentos no exportados.

## Selección exacta de catálogo

Fuente: filas de `EstructurasArticulos` con `TipoDoc` vacío y `Estructura`
igual al código; relación con `MOConceptos` por coincidencia literal de
`DisComponente/ComponenteAsoc` o `DisGrupo/GrupoAsoc`, excluyendo el comodín `!`.

| Modelos | Ítems de plantilla | Componente / grupo | Conceptos que coinciden | Categorías y tiempo base |
|---|---|---|---|---|
| 03H, 03V | 7, 10; cantidad 1 cada uno | 16 / TMP | 00010 y 00114 | Correderas: 20; abatibles: 10 minutos |
| 06 | 7, 9, 10, 13, 16; cantidad 1 cada uno | 16 / TMP | 00010 y 00114 | Correderas: 20; abatibles: 10 minutos |
| CFT | 5; cantidad 1 | 15 / TFF | 00011 y 00116 | Correderas: 10; abatibles: 10 minutos |
| CF, FC | Ninguno por componente/grupo | — | Ninguno | No aplica a este bloqueo |

Los cuatro conceptos tienen `CodSerie=*`, `FamiliaAsoc=001`,
`AsociadoSN=True`, artículo de salida MO, preparación e incrementos de
ancho/alto a cero. `MOCategorias` identifica 00001 como abatibles y 00002
como correderas. `Conjuntos.TipoPerf` distingue A y C para las series
observadas; GMA50 es A y GMC400 es C.

La mera coincidencia del componente no basta: aplicar 00010 a cualquier
travesaño 16 sumaría tiempo de corredera a una serie abatible. Tampoco debe
deducirse que ambos conceptos se acumulan porque ambos coincidan en la plantilla.

## Oráculo original y comprobaciones

El script descubre los CSV por recorrido del directorio, sin una lista manual
de documentos. Inspecciona las cabeceras de **205 archivos** y encuentra tres
tablas con `EstructuraSN`, `Articulo`, `nDoc`, `nLinea` y `nEstr`:

| Tabla | Filas examinadas | Líneas de estructura | Coincidencias con los seis códigos |
|---|---:|---:|---:|
| VPresupuestosLin | 110158 | 2071 | 2, ambas CF |
| VAlbaranesLin | 24406 | 462 | 0 |
| VFacturasLin | 24206 | 444 | 0 |

El enlace usa el tipo documental acreditado y las claves exactas:
`VDatosLinEstr.TipoDoc/nVDoc/nVLinea` y
`VConceptosMO.TipoDoc/nDoc/nLin`. Una configuración ausente o duplicada no
se elige arbitrariamente. Las hijas de despiece se enlazan por `nDoc/nEstr`.

**CF:** las dos configuraciones son no específicas, de GMPC76R, con ajuste
manual de fabricación cero. Los conceptos originales positivos son 00608=20,
00618=10 y 01000=20 minutos. El motor vigente reproduce las tres aportaciones
y las tres filas MO de cada línea, sin incidencias de mano de obra. Esto
acredita sus minutos en esa configuración, no el despiece completo, la tarifa,
el precio final ni su fabricación; tampoco valida GMC400 para CF.

**Controles de TMP/16 en otros modelos:** se encontraron 200 líneas relacionadas;
79 tienen configuración única y `DisEspecificoSN=False`. Son 63 líneas de
presupuesto, ocho de albarán y ocho de factura, repartidas en 47 documentos.
Los documentos pueden derivar unos de otros: no son 79 observaciones comerciales
independientes.

La hipótesis se fija desde entradas de catálogo, antes de consultar el resultado:
TipoPerf A selecciona categoría 00001; C selecciona 00002. Para cada concepto
seleccionado, minutos = suma de cantidades de sus elementos × TiempoFabr,
emitidos como una aportación por concepto. El despiece y `VConceptosMO` solo
se usan después, para comparar.

- **77 controles A:** 00114 coincide en los 77; 00010 no tiene registro en
  esas líneas. No se convierte esta ausencia en un cero registrado.
- **Dos controles C2FI/GMC400 de tipo C:** 00010=20 coincide; 00114 no tiene
  registro. Son controles de esa configuración, no cobertura de todas las correderas.
- **79/79:** el multiconjunto completo de minutos MO positivos coincide al
  añadir esta hipótesis a los módulos/artículos ya soportados y al ajuste
  manual original. Las filas originales de cantidad cero quedan registradas
  en la evidencia y se excluyen solo de esta comparación de minutos positivos.
  El ajuste se multiplica por 60 con aritmética decimal exacta.
- En tres líneas `2O+1OFI` de GMA350, tres elementos TMP producen **una fila
  00114=30**. Emitir tres filas de diez conserva el total, pero no reproduce
  el multiconjunto original. Esta observación impide copiar sin más la emisión
  actual por elemento usada para TMG.

**CFT/TFF:** no hay prueba positiva suficiente. En las 24158 filas de
`VConceptosMO`, 00011 aparece 341 veces, todas a cero; 00116 aparece 1445 veces,
todas a cero. Estos ceros no demuestran cuánto produciría CFT con un TFF real.

## Manual y límites de la interpretación

Se recorren las 664 páginas HTML del CHM extraído y se localizan 33 con texto
relacionado. `5_1_2_13_13_2_tiempos_fabricac.htm` describe tiempos por tipo de
estructura o por montaje de elementos, posibles tiempos por serie y suma
de ambos sistemas si se configuran simultáneamente. No especifica la regla
general de precedencia entre categoría, componente y grupo.

Se inspeccionaron también las imágenes `5.1.2.13.13.2-001.png` y
`5.1.2.13.13.2-004.png`: acreditan los campos de tiempo/serie y los conceptos
de módulos, sin resolver esa precedencia. La página
`5_1_11_3_12_conceptos_de_mano_.htm` está en construcción. No se ejecutaron
Productor, MDB, COM, OCR, consultas remotas ni importadores.

La hipótesis no cubre otras categorías, curvas, tiempos por dimensión,
preparación, conceptos específicos de serie ni combinaciones simultáneas de
módulo/artículo/componente/grupo. Tampoco generaliza el resultado de TMP a TFF.

## Siguiente decisión

- **Ahora:** mantener los bloqueos y abrir una unidad económica en serie para
  resolver selección por categoría y agregación por concepto, limitada a
  TMP/16. Antes de habilitar el precio de 03H/03V/06, exigir salidas originales
  de esos modelos con entradas conocidas; incluir un caso de varios travesaños.
  Los 79 controles y los dos CF quedan disponibles para regresión.
- **Después:** obtener un CFT original con TFF efectivo y estudiar CF/GMC400
  (FILH/FISH/FIIH), CFT/GMC400 (FILH/FISH/FIIM) y FC/GMC400
  (descuento MH→C de tipo G) en sus módulos correspondientes. Resolver MO no
  soluciona esos bloqueos de material.
- **Experimental:** extender la selección a otras categorías y excepciones
  de serie solo con nuevos controles que puedan refutar la hipótesis.

No se ha aplicado una fórmula económica para hacer coincidir un precio.

## Reproducción y procedencia

```powershell
node --import tsx scripts/investigar-mano-obra-fijos.ts
```

Puede recibir las rutas de catálogo CSV y manual extraído como primer y segundo
argumento. Solo escribe en `output/fase-8/lote3-mo`, ignorado por Git.
`investigacion.json` conserva fuentes, hashes, cabeceras descubiertas, selecciones,
enlaces privados, originales, resultados e hipótesis; `resumen.json` y
`ejecucion.log` permiten revisar los agregados. Los hashes se comprueban antes y
después de la lectura de los CSV. Ningún dato documental privado se versiona.

SHA-256 de fuentes principales, bajo `export_datos/EMP0016`:

| Archivo | SHA-256 |
|---|---|
| EstructurasArticulos.csv | `99d1889f5754b7e93a611eea200b7b1325a0fb10da29cbc30ad8719297c56380` |
| MOConceptos.csv | `02ab002688751665250070934f76e9fe99bdf2dc3aa105fdcb7d3cc594c48698` |
| MOCategorias.csv | `d3f22ca475112e9ac000357d6f880b6c55036bc05bab1df0541ed6b78b6940ad` |
| Conjuntos.csv | `bba3c9580ca1a8e17bfdb0394bc9bc7b1a294ad25a5ad4deb546d5f74ee392d6` |
| VConceptosMO.csv | `99155b45d5f7a1670bb7c1fbf86609bc0ae1cf674c336ff413ab0950fa53745d` |
| VDatosLinEstr.csv | `ee486a685442de652929d4d4d687f2154087f1935f9cbbe09a768d5df75c7c4a` |
| VPresupuestosLin.csv | `720d373a01b34d6c7ad7205e46db58c59e2106964197396515e8e3d99bdd1a62` |
| VAlbaranesLin.csv | `7f892912f26da7d85e14f213a6fe81b0bff67733b408c3c6e5f540f66331f98d` |
| VFacturasLin.csv | `59feff7acbc5439b05e5d85749dbb6ee8e76a5c066a05a1ca3b77d8afde9d167` |

Página de tiempos del manual: SHA-256
`e91af7feed95ee0a5c18d3a368ee510dd440125b65c3a86913f4956b1e1a552a`.
Los hashes del resto de las 205 fuentes CSV, de las páginas coincidentes y de
las imágenes inspeccionadas quedan en la evidencia local.
