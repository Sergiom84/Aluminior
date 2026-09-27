# Cotas económicas C2FI y relevo

27/09/2026. Continuación local desde `f321935`, según el
[contrato 12](12-contrato-cotas-economicas.md). La unidad previa de
[TMP/03V](11-tmp-03v-y-relevo.md) queda cerrada en ese commit. Esta unidad
añade investigación reproducible; no cambia producto, interfaz ni precio.

## Terminado y acreditado

- Localizadas las entradas FI de los dos C2FI/GMC400 estándar en los
  presupuestos de EMP0016 anual, ejercicio 2026. La unión usa tipo documental,
  documento, línea, estructura y nDA; la definición y su símbolo son unívocos.
- Una de las entradas originales difiere de `MedidaStd`. Los 300 mm del
  catálogo gráfico no pueden sustituir la cota del documento.
- Usando solo esa entrada acreditada, el motor pasa de **21/41 a 38/41**
  filas materiales coincidentes en cada caso. Compara artículo, cantidad y
  dimensiones con la precisión de comparación de 0,1 mm; no certifica cortes
  de fabricación. El original se consulta como resultado después del cálculo.
  Desaparecen las siete incidencias por FI ausente de cada caso.
- Las tres piezas restantes son las filas de plantilla 7, 8 y 9: GM487/FH,
  GM492/FH y GM492/FV. Conservan `DisIdPerAd=3` y el bloqueo de medida.
  También persisten los dos bloqueos MO; ambos importes siguen siendo `null`.
- Verificado el enlace `EstructurasArticulos.id → VDatosLinDetDis.DisId`
  dentro de la instancia. `DisIdIt` tiene otra agrupación y no sustituye
  esa clave. Se contrastan grupo, referencia y fórmula además de los IDs.
- El árbol tiene un ID coincidente con `PerfilAdSN=False`. Es una
  correspondencia observada, **no una regla acreditada** para ignorar
  `DisIdPerAd`, seleccionar un perfil adicional o quitar la guarda.

Se cierra la búsqueda de la entrada FI para estos dos originales y se
localiza el siguiente bloqueo. No se cierra su despiece completo, su mano
de obra, su precio ni fabricación. No se incorporan cotas a persistencia
ni se recalculan documentos guardados de Aluminior.

## Fuentes y límites

Fuente: copia verificada de `Base datos Anuales/EMP0016/aluminio.mdb`,
SHA-256 `1ae8c9d0841de47363bb33062b42aaabd3eb352c40518176b935f5d29d49b490`.
Los scripts abren únicamente `copia.mdb` dentro de `output`, en lectura.
Los originales, documentos, medidas y extracciones permanecen fuera de Git.

La extracción contiene 26 CSV. El barrido de sus cabeceras acredita como
tabla documental de esta investigación solo `VPresupuestosLin`: dos C2FI,
cero C2FS y cero C2FSFI. Esa ausencia **no es un barrido global** de otras
tablas, ejercicios o copias. Las columnas y los conjuntos recorridos se
comprueban antes de afirmar enlaces o ausencias.

El CHM de perfiles adicionales describe selección y cotas, pero no
documenta el algoritmo de `DisIdPerAd`. Las referencias de C2FS/C2FSFI
se conservan como candidatos de investigación, sin habilitar cálculo.

EMP0015 corresponde a 2025 y EMP0016 a 2026. Conservar tarifa y fecha de cada
documento aunque quede fuera del año nominal. Las copias Anterior comparten
documentos: no amplían por sí mismas la muestra. Separar estas bases anuales
de `export_datos/EMP0016` y de la copia posterior usada para facturas C2P.

## Comprobaciones ejecutadas

- El coordinador reejecutó el contraste con sus aserciones y comprobó los
  resultados anteriores. Hash de copia y de los 26 CSV antes/después.
- Pruebas pertinentes: **61/61**, sobre resolvedor de cotas, comparación
  material y diagnóstico. Typecheck del script aprobado.
- Arquitectura: **699 archivos, 346 módulos, cero infracciones**; las 40
  revisiones de tamaño existentes no se convierten en excepciones nuevas.
- Los cuatro originales anuales y sus cuatro copias mantienen los hashes
  del manifest. Evidencia en `lote5-cotas/fuentes-intactas.json`.
- El cierre productivo anterior, ejecutado en esta misma sesión, mantiene
  **1514 pruebas de paquetes + 191 de scripts**, typecheck y revisión
  independiente aprobados; ver [11](11-tmp-03v-y-relevo.md). Esos recuentos
  no se suman a las 61 focales repetidas aquí.

No hay arreglo productivo nuevo que someter a retirada causal. La
comparación sin/con FI prueba el efecto de la entrada, manteniendo las
guardas del motor. No se repiten pruebas visuales como evidencia nueva:
esta unidad no cambia la interfaz.

Revisión independiente cerrada en una ronda, sin hallazgos abiertos:
reproducción idéntica, comprobación propia de enlaces y multiconjunto
material sin usar el resolvedor/comparadores investigados, y **61/61**
pruebas reejecutadas. El coordinador volvió a ejecutar esa comprobación
independiente. Dictamen: `output/fase-8/lote5-revision/REVISION.md`.

## Reproducción local

Desde la raíz; Java/Jackcess ya disponibles. Las dos extracciones solo se
necesitan para reconstruir los CSV locales. Nunca usar la MDB original como
argumento. No se requieren base de datos, Productor ni acceso remoto.

```powershell
java -cp 'output/auditoria-anuales/lib/*' scripts/ExtraerContrasteAnual.java output/auditoria-anuales/EMP0016-aluminio/copia.mdb 1ae8c9d0841de47363bb33062b42aaabd3eb352c40518176b935f5d29d49b490 output/fase-8/lote5-cotas/datos
java -cp 'output/auditoria-anuales/lib/*' scripts/ExtraerPerfilesAdicionales.java output/auditoria-anuales/EMP0016-aluminio/copia.mdb 1ae8c9d0841de47363bb33062b42aaabd3eb352c40518176b935f5d29d49b490 output/fase-8/lote5-cotas/datos
node --import tsx scripts/investigar-cotas-economicas.ts
node node_modules/vitest/vitest.mjs run scripts/lib/cotas-instancia.test.ts scripts/lib/diagnostico-discrepancias.test.ts scripts/lib/contraste-despiece-facturas.test.ts
node node_modules/typescript/bin/tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions scripts/investigar-cotas-economicas.ts
npm run check:architecture
```

Evidencia privada: `output/fase-8/lote5-cotas/`, con `investigacion.json`,
`resumen.json`, inventario, hashes, datos y logs del coordinador. Conservar
el manual extraído señalado por el script; no redistribuirlo.

## Siguiente unidad exacta

- **Ahora:** acreditar la semántica de `DisIdPerAd` y sus campos direccionales
  frente a las tres piezas C2FI pendientes. Investigar árbol, detalle y
  perfiles de la misma fuente; demostrar con entradas originales cuándo
  aplica un perfil adicional y cómo cambia la medida. Solo después modificar
  el módulo de cortes y exigir 41/41, controles negativos y prueba causal.
  La MO de C2FI requiere su contraste de compositor: los controles de TMP
  por sí solos no autorizan extender la habilitación de 03V.
- **Después:** integración web de 03V en una unidad separada: conservar los
  metadatos y procedencia estándar, probar carga/adaptador y recorrido local.
  Buscar controles positivos propios para C2FS/C2FSFI, 03H/06 y CFT/TFF;
  resolver mano física de hojas 1/2 antes de ampliar abatibles.
- **Experimental:** otras categorías, series especiales, preparación,
  tiempos por dimensión, curvas, plegables y elevables sin controles.

No repetir los lotes de geometría ni los tres originales 03V como trabajo
nuevo. Siguen **25 plantillas y 14 uniones**; catálogo completo, precio
comercial completo y fabricación pendientes. CFT/TFF continúa sin evidencia
histórica positiva. Sin push, main, Productor, migraciones ni remoto.
