# Investigación ampliada de fuentes y cortes

Actualización posterior: la sección «Diferencia frente al ETL actual» describe
el momento de esta investigación. [La implementación posterior](03-implementacion-cortes-referenciados.md)
ya conserva referencias y descuentos base; ConjuntosDescuentosDif continúa
pendiente. [El barrido de facturas](05-primer-barrido-facturas-2026.md) amplía
los datos disponibles sin acreditar todavía el cálculo independiente.


> Continuidad revisada el 27/09/2026: [punto de partida vigente](../INICIO-SIGUIENTE-CONVERSACION.md). Las comprobaciones fechadas conservan sus límites; consultar el relevo para el trabajo siguiente.

27/09/2026. Continuación ejecutada en `main`, sin push. **Precio automático
completo todavía pendiente.** No se ha modificado el motor de producción en
esta investigación, ni se han relajado sus guardas.

## Accesos y conservación

- Lectura de las bibliotecas de `C:\Productor\Aluminio` y de
  `EMP0016\Anterior.mdb` mediante copias locales con SHA-256 idéntico al origen.
  ADODB/ACE en `Mode=Read`; consultas SELECT y timeout de 20 segundos.
- No se abrió `EMP0016\aluminio.mdb`, no se ejecutó Productor ni se tocaron
  licencia, registros COM, migraciones o datos de producción.
- Reintentada la conexión del `.env`: destino Supabase remoto; transacción
  `READ ONLY`, timeout de 15 segundos y cierre de conexión. Tras permitir la
  salida de red, el servidor sigue respondiendo `XX000`,
  `ENOTFOUND tenant/user ... not found`. No se pudieron leer sus tablas.
  No se adivinaron credenciales ni se modificó `.env`.
- La 0017 está abierta: el bloqueo de archivo impidió verificar el hash de su
  base. La copia tentativa **no se utiliza como evidencia**. Se solicitó cerrar
  Productor descartando ediciones para obtener una copia estable del 260499.
- Docker confirma `aluminior_pg_test` en 55433. No se repitió el ETL ni se
  reinició el contenedor. Este estado no confirma el contenido de la base QA.
- July no está disponible entre las herramientas de esta sesión. Se usaron las
  decisiones documentadas en el repositorio, incluidos PLAN S.9, T.26–27 y T.65.

Los originales, exportaciones, copias, consultas exploratorias y manual extraído
permanecen en `output/investigacion-fuentes/`, ignorado por Git. No incluir ese
directorio ni `env.example` en un commit.

## Inventario ampliado y versiones

El recorrido con archivos ocultos incluidos encuentra 68 MDB, 84 CSV, 31 INI,
28 TXT, 303 RPT, 6 PDF, 6 MHT y un CHM. Los 26 archivos `.db` son `Thumbs.db`;
no se localizaron XLS/XLSX, ACCDB ni SQLite en la instalación. Esto no prueba
que no existan fuentes externas referenciadas.

Se inventariaron tablas, columnas y recuentos de estas ocho copias:

| Fuente | Tablas | Pobladas | Resultado relevante |
|---|---:|---:|---|
| ConfigDis.mdb | 71 | 26 | Descripciones y configuración; tablas de descuentos/acristalamiento vacías |
| AluSeries.mdb | 2 | 2 | `Config`: nombres de grupos y componentes; no precios por serie |
| aluMode.mdb | 995 | 126 | Plantilla; 6420 filas ArticulosPVP, no tarifa del taller acreditada |
| IDSeries.mdb | 1 | 1 | 146 identificadores, relaciones e incompatibilidades de importación |
| impexpES.mdb | 861 | 86 | Gramática/configuración; dos tablas no legibles, detalladas abajo |
| ImpexpGM.mdb | 942 | 122 | Biblioteca: 34291 descuentos, 5896 diferencias y 2488 filas de acristalamiento |
| InfoSeries.mdb | 9 | 9 | Bibliotecas, series y actuaciones; 244 bibliotecas y 4104 series |
| EMP0016/Anterior.mdb | 995 | 205 | Catálogo instalado: 35723 descuentos, 5984 diferencias y 2488 filas de acristalamiento |

En `impexpES.mdb`, `ArticulosCadenaClasificacion` devuelve «No es un marcador
válido» y `ArticulosCadenaClasificacionCond` un error de apertura/formato.
No se reparó la fuente ni se contabilizaron estas tablas como vacías.

Los CSV actuales tienen los mismos recuentos de descuentos y acristalamiento
que Anterior. Las cifras 15537/1230/1098 de `esquema/empresa` son históricas:
**no describen este catálogo actual**. La igualdad de recuentos no prueba por
sí sola igualdad fila a fila ni introduce una nueva biblioteca exclusiva.

Comparación SHA-256 de bibliotecas, no solo fecha o tamaño:

- IDSeries es idéntica en raíz, instalación 43.35 y actualización de febrero de 2025.
- ConfigDis, impexpES e InfoSeries de raíz coinciden con la copia de esa
  actualización, pero no con la de instalación 43.35.
- AluSeries y aluMode tienen hashes diferentes en las tres ubicaciones.
- ImpexpGM solo aparece una vez con ese nombre.

No se sustituye una versión por otra. El detalle está en `versiones-mdb.json`
y `esquemas.json` locales. Las otras MDB, principalmente empresas y copias,
quedan inventariadas por ruta/tamaño; no se afirma haber leído todas sus tablas.

### Tarifa adicional en TXT

`InfoSeries.SerBibliotecas` enlaza Alugom con `nombre_impexp=impexpGM` y
`ruta_tarifa=GM`. Se verificó `Tarifa/GM/`: 19 archivos, incluyendo
`Articulos.txt` (9533880 bytes), `ArtMedidas.txt`, `SeriesInfo.txt`,
`TarifaConfig.ini` y `TarifaInfo.txt`.

`TarifaConfig.ini`: biblioteca 13, versión 29, fecha 23/06/2022; declara coste,
unidad, peso, dimensiones, TamJunqGoma y altura de perfil. Articulos.txt tiene
registros de ancho fijo con código, acabado, unidad e importes; no es CSV.
`TarifasFormato(Proveedor,Tabla,Campo,Orden,Columna,Ancho)` es la fuente para
interpretar sus columnas. No aplicar offsets supuestos ni tratar esta tarifa
antigua como precio vigente. La nota libre de TarifaInfo conserva una revisión
de 2012: también debe distinguirse de la fecha del INI.

## Hallazgo: cadena de corte GMC400

Fuentes: `EstructurasArticulos`, `ConjuntosDescuentos`, `ConjuntosDescuentosDif`,
`VDatosLinDetDis` y `VPresupuestosLin`. Manual CHM:
`5_1_2_12_3_2_1_pestana_marco_normal.htm` y
`5_1_2_12_3_2_9_pestana_cotas.htm`.

La plantilla C2 enlaza la hoja horizontal con el ítem 3 (marco horizontal)
mediante `DisIdRefLargo=3`, `DisFRefLargo=(REF)/2`; C3 usa `(REF)/3`.
ConjuntosDescuentos declara, para GMC400/familia 001:

| Grupo principal → grupo calculado / tipo | Descuento por extremo |
|---|---:|
| MV → MH / G | 20,5 mm |
| MV → HH / 2HC | −0,25 mm |
| MV → HH / 3HC | aproximadamente 6,083333 mm |
| MH → HVL o HVC / G | 26,5 mm |

La composición de estos datos explica el caso ordinario:

- Marco horizontal: `A − 2×20,5`.
- Hoja C2: `(A−41)/2 − 2×(−0,25) = A/2−20`.
- Hoja C3: `(A−41)/3 − 2×6,083333 ≈ A/3−25,833333`.
- Hoja vertical ordinaria: `L−2×26,5 = L−53`.

Contraste con claves compuestas documento+estructura+ítem, sin proximidad de
medidas: 122 estructuras, 498 registros horizontales GM451. La fórmula
ordinaria explica 444 registros C2 y 30 C3, pero falla en 24 registros C2 de
seis estructuras. Allí **el marco ya es 53 mm menor** que `A−41`; la hoja
hereda la mitad de esa diferencia (26,5 mm). Los descuentos de sus extremos
siguen siendo −0,25, no cambian a otro valor.

Usando el corte observado del ítem referenciado, `REF/divisor−DtoLIni−DtoLFin`
coincide en **498/498 registros**, tolerancia 0,01 mm. Esto es una prueba
retrospectiva de dependencia, **no predicción independiente**. Falta explicar
por qué el marco de esas seis estructuras se acortó 53 mm; no se incorpora
una constante excepcional al motor. Tampoco se generaliza a otras series.

Se afina así S.9.1: FormulaLargo está aplanada respecto de las dimensiones,
pero esa observación no acredita que incluya todos los descuentos aplicados
a la pieza referenciada. No se refuta aquí su estudio de tramos de herraje.

Las cotas geométricas tampoco deben intercambiarse con descuentos generados:
ConfigSeriesCotas conserva valores CorrMS_DL/CorrMI_DL de 23,75 mientras el
descuento MH→HV de esta tabla es 26,5. Hay que resolver precedencia, perfil
alternativo y regeneración, no sumar campos por similitud de nombre.

## Vidrio, juntas y herraje: datos y límites

- `Articulos.V410ACGP6` confirma D.A. de 20 mm: base DABASE, vidrio VLS4,
  cámara CAM10A y vidrio CGP6; `DAfabrSN=false`. No acredita que fuera el
  seleccionado en 260499 ni equivalencia con V410ACGF.
- El manual `5_1_2_11_asistente_doble_acris.htm` distingue coste por base y
  sustituciones de coste de fabricante. `5_1_2_11_5_1_doble_acristalami.htm`
  describe PVP dinámico con condiciones específicas del componente. El precio
  del vidrio suelto no sustituye al precio de su incremento en D.A.
- Hay registros de coste de esos componentes en `ArticulosDAcoste`. Deben
  distinguirse de `ArticulosCoste`, `ArticulosDApvp`, precio único por tarifa y
  precio del artículo D.A. ya generado. No se recalcularon ni publicaron tarifas.
- GMC400 enlaza TablaHojas=GM01 y TablaFijos=GM08. GM01 declara junquillo `0`
  y juntas `V1000` hasta grosor 99. V1000 no aparece como artículo en Anterior.
  El manual `5_1_2_12_5_1_tabla_manual.htm` lo describe como goma universal de
  biblioteca: no demuestra que omitir una referencia ausente sea precio completo.
- Las tablas de acristalamiento distinguen posiciones y opciones interior/
  exterior. `TAcristalamiento` contiene grapas, calzos, intervalos, nudos,
  suplementos y listas; importar solo TAcristalamientoLin no conserva todo eso.
- `herr2HC=HU315` y `herr3HC=HU316`; se leyeron sus 7 y 9 asociaciones.
  Hay categorías `!`, rodamiento/lateral, EHC/EHH y opciones. El manual
  `5_1_2_12_7_7_1_creacion_de_aso.htm` documenta condiciones y asociaciones;
  `...7_7_2_opciones_de_her.htm` describe exclusiones y dependencias. El recuento
  por hoja y la selección deben resolverse antes de valorar; no eliminar 222–229.

## Diferencia frente al ETL actual

| Fuente | Conservación actual | Pendiente |
|---|---|---|
| EstructurasArticulos | Fórmulas planas y DisFRefLargo, grupo, componente, ítem y tipo de hoja | ID de referencia y grupos de extremos suficientes para reconstruir la cadena |
| ConjuntosDescuentos/Dif | Sin importador en el ETL actual | Claves, precedencia y descuentos; no una constante histórica por serie |
| Conjuntos/ConjuntosLin | Resolución de artículos y delegaciones de herraje | Aplicación contextual completa de asociados |
| TAcristalamientoLin | tabla, posición, grosor, junquillo y dos juntas | Resto de configuración de cabecera y piezas auxiliares |
| Articulos D.A. | Grosor, base, dos vidrios y cámara 1 ya se importan | Modo económico, costes/PVP específicos y condiciones; E11 |
| Tarifa/GM TXT | Fuente localizada, sin importación en esta sesión | Interpretación por formato y vigencia antes de usar importes |

## Verificación reproducible y continuación

`scripts/contrastar-cortes-referenciados.ts` requiere la ruta CSV explícita;
no lee `.env`, no conecta a ninguna BD y solo imprime recuentos agregados.
Su módulo puro rechaza referencias ambiguas/ausentes, datos no finitos y
fórmulas cuyo contexto falta. Pruebas con datos sintéticos junto al módulo.

```powershell
npx tsx scripts/contrastar-cortes-referenciados.ts export_datos/EMP0016
npx vitest run scripts/lib/contraste-referencias-corte.test.ts
```

Cuatro pruebas pasan; typecheck dirigido pasa; arquitectura: 0 infracciones.
No se repitieron las suites de aplicación: no se cambió su comportamiento.

Siguientes comprobaciones necesarias:

1. Copia estable de 0017 y desglose del 260499, con serie, vidrio, opciones,
   unión, cortes, cantidades y precios. La captura del total sigue sin bastar.
2. Explicar el contexto de marco de las seis estructuras excepcionales.
3. Integrar datos de referencia/descuento solo con cobertura y precedencia
   verificadas, manteniendo el resultado incompleto cuando falte una pieza.
4. Consultar Supabase cuando se corrija su conexión, sin escrituras remotas.

No se declara agotada toda la instalación: están pendientes las variantes de
biblioteca con hash distinto, análisis de informes más allá del mapa existente
y el cierre funcional de asociados, grapas/calzos, D.A. y precio completo.
