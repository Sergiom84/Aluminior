# Investigación REA de Productor y comparación con Aluminior

16/10/2026. Trabajo local en Windows, desde `307bf54`, con dos ejecutores
paralelos dirigidos y comprobaciones reproducidas por el arquitecto.
[Comparación por capacidades](COMPARACION-REA-PRODUCTOR-2026-10-16.md).
El [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md) mantiene el orden de producto.

## Resultado y alcance

Se amplía el inventario de instalación y la evidencia de lógica recuperable,
y se contrasta con el código actual de Aluminior. Hay información suficiente
para orientar las siguientes unidades; no se ha recuperado el proyecto original
ni se ha demostrado equivalencia funcional completa. La cobertura semántica de
binarios, comprimidos anidados, informes y ejecución permanece parcial.

El worktree solicitado es
`C:\Users\sergi\.codex\worktrees\rea-productor-20261016\Aluminior`, rama
`codex/rea-productor-20261016`. El checkout inicial conserva su rama y su código.
Se consultaron estado, roadmap, arquitectura, evidencias anteriores, July y el
relevo suministrado de Dudas antes de ampliar la investigación.

**Resultado exacto:** corpus identificable, evidencia estática nueva/reutilizada,
comparación de capacidades y fronteras pendientes. **Destinatario:** Sergio y
el siguiente desarrollador de Aluminior. **Éxito medible:** recuentos reconciliados,
hashes, cuerpos seleccionados cotejados, scripts reproducibles y revisión.
**Alcance autorizado:** lectura de las rutas indicadas y evidencia previa;
escritura de resultados en worktree separado. **Fuera de alcance:** implementar
producto, ejecutar Productor, registrar COM, migrar/importar/desplegar o publicar.
**Protegidos:** originales, bases activas, G6, datos reales, secretos y WIP.
**Comprobaciones:** integridad de lecturas, reconciliación, límites de cada
afirmación y comprobaciones del núcleo. Ejecutar el legado requiere entorno
aislado y un contrato de ensayo; esta entrega no lo hace.

## Identidad y volumen

`C:\Productor\Aluminio` es un alias mediante junction del árbol físico
`C:\Users\sergi\Desktop\MIX\Productor\Aluminio`. No son dos instalaciones
independientes. `aluminioApp.exe`, 45.071.944 bytes, conserva SHA-256
`f7c49752d6c00e61d7a0f56dd4c0347a79b8da1bec26a020321d3ca353e3809b`.
Se cotejaron la instalación, la copia de Dudas y la identidad importada por Ghidra.

| Evidencia medida | Resultado | Límite |
|---|---:|---|
| Inventario recursivo sin seguir enlaces | 211.522 archivos; 26.028.233.665 bytes lógicos; 404 directorios | Metadatos, no lectura semántica ni tamaño único |
| Enlaces excluidos | 16, EMP0001–EMP0016 | No se duplican empresas ni se inspeccionan sus destinos |
| Errores de enumeración | 0 | Dentro del árbol y política declarados |
| BMP / MDB / CSV presentes | 206.076 / 66 / 84 | Solo nombres/metadatos; no se leyeron bytes de negocio |
| Archivos seleccionados leídos, incluidos antecedentes/manual | 1.205; 185.871.317 bytes | Hashes de lecturas, no del corpus entero |
| ZIP inspeccionados | 26; 1.166 entradas; 25 comprimidos internos pendientes | Solo directorios centrales/colas, 121.075 bytes leídos |
| Informes RPT | 303; 298 hashes distintos; firma OLE | No diseño/fórmula/SQL de cada informe |
| Configuración INI/CONFIG/SVC | 95 archivos; 48 hashes distintos | Claves y valores neutrales; secretos/destinos omitidos |
| CHM reutilizado | 664 HTML en extracción previa de 1.686 archivos | Hash del CHM coincidente; no reextracción ni aceptación runtime |
| Inventario PE raíz reutilizado | 136 archivos: 123 managed y 13 nativos | No inventario PE semántico completo de todas las subcarpetas |
| Inspecciones canónicas managed nuevas | 123/123, hashes iguales a referencia | Identidad/metadatos completos; no C# completo |
| Assemblies con prefijo de nombre Productor | 39; 5.591 TypeDef; 46.942 MethodDef | Clasificación nominal, no prueba de autoría ni funcionalidad |
| Cuerpos IL cotejados | 716; 66.669 bytes IL; 26.524 instrucciones | 243 Cut1D reutilizados + 473 nuevos seleccionados |
| Contratos IL detallados | 26 métodos seleccionados | Incluye fórmulas/ramas y llamadas; no comprensión de todos los métodos |
| Pseudocódigo nativo acotado | 1 candidato, 7.852 bytes en 4 rangos, 2.586 instrucciones | Sin identidad de método ni tipos/indirecciones completos |
| Código Aluminior barrido | 641 TS/TSX; 60 pgTable; 17 páginas dashboard; 35 capacidades comparadas | AST estático, sin consulta remota ni prueba UI nueva |

Los 2.651 archivos del inventario del 13/10 siguen presentes: ese trabajo
excluía anuales, copias, TEMP y otras áreas. Las 208.871 rutas adicionales
proceden de ampliar el recorrido, no acreditan crecimiento del producto.
Tampoco se convierten tablas, métodos o tests en porcentaje de paridad.

## Información nueva aprovechable

**Sí existe un fragmento de fuente VB6.** Dos copias físicas de
`alContacto.cls`, 730 bytes, tienen SHA-256
`7643f43cfb6c833ee0feded2c514aa21a1b39cbbdb6662abc1115f016ae979e2`.
Son una clase con ocho campos públicos de contacto, sin métodos de negocio.
Un ZIP declara otro miembro de mismo tamaño/CRC, sin haber leído su payload.
El barrido de extensiones fuente no encontró un proyecto recompilable dentro
del árbol físico recorrido. Los 25 comprimidos internos y otros soportes no
permiten una afirmación universal de ausencia de fuentes.

**La integración legacy tiene componentes declarados.** Se localizaron
cuatro contratos WCF, Operations, Produccion, Stock y eAlbaranes, en `.svc`
y configuración. Se preservan interfaces/bindings; se omiten hosts y credenciales.
No se ha demostrado servicio activo, exposición, autorización o uso. Aluminior
puede reimplementar los casos de negocio en su arquitectura sin copiar WCF.

**Corte 1D tiene un contrato más amplio.** Las firmas y los cuerpos seleccionados
del envoltorio managed enlazan ProxyCOM, ProduccionNet y Cut1D. Hay opciones de
despunte inicial/final, grosor, barras/retales y límites de resto. La matriz
contrasta esas entradas con `optimizarCorte`, que actualmente usa una longitud
por llamada y kerf. La interpretación de las fórmulas está en los artefactos
IL privados; no se ha ejecutado la biblioteca ni demostrado el mismo resultado
de optimización. No se copia su implementación a Aluminior.

**Stock y documentos aportan métodos seleccionados con cuerpo.** Se observaron
564 declaraciones nuevas de siete assemblies, con 558 cuerpos; 473 de estos
tienen segundo cotejo independiente y 85 de Dominio/Informes solo evidencia
canónica REA. Sumados a los 243 Cut1D previos, el segundo cotejo cubre 716.
Las referencias se conservan con tokens, SHA-256 y Evidence IDs; no se confunden
nombres con transacciones o persistencia real.
Las fronteras nativas seleccionadas declaran 826 métodos provistos en ejecución
y cero P/Invoke en ese conjunto: no son 826 cuerpos nativos recuperados ni una
ausencia global de interoperabilidad nativa. La selección de fronteras cubre
47 assemblies; no todos los binarios del árbol.

Tres contratos de comportamiento adicionales se pueden seguir hasta IL:

- Cut1D `Result::GetOptimalCost` (`0x06000061`) suma cantidades de barra por
  longitud y coste unitario, dividido por `Multipl`; no solo cuenta barras.
  `get_OptimizePercentage` (`0x060000c8`) devuelve cero sin longitud de barras;
  en otro caso calcula 100 por longitud efectiva de cortes / longitud de barras.
  Reconciliar esta métrica con el desperdicio bruto de Aluminior antes de
  comparar porcentajes o atribuir calidad óptima al algoritmo.
- Stock `CalculaMetrajePropuestaYPedir` (`0x060000df`) parte del máximo entre
  cero y necesidad + ventas pendientes + lotes asignados − stock actual −
  compras pendientes − fabricaciones pendientes − pedidos de reposición −
  disponibilidad de otros almacenes, esta última condicionada por parámetro.
  Redondea según metraje configurado; si la propuesta es distinta de cero,
  aplica mínimo y después máximo cuando estén definidos. Copia metraje a pedir
  y lo multiplica por peso para kg a pedir. La coherencia de configuración y
  su resultado operativo requieren casos comunes, no están aceptados aquí.
- Stock `MetrajeStockCalculador::CalculaMetraje` (`0x06000690`) pasa
  `NoMultiplosMinimos=true` al calculador delegado. Es evidencia de separación
  entre cálculo físico y mínimos comerciales; falta comprobar el receptor
  completo para cada caso.

Los tokens son locales a cada assembly; sus hashes/MVID y cuerpos están en
`managed/il-contracts.json` y el informe managed. La lectura directa de IL y
el cotejo de bytes sustentan estas descripciones propias, sin ejecutar el sistema.

**Coste medio requiere su propia interpretación.** En `gaProductorCosteMed.exe`
se observaron cadenas relativas a coste medio, stock y actualización de documentos.
Su nombre y esas cadenas no identifican el selector de coste dimensional
pendiente. El coste ordinario ya resuelto por Aluminior tampoco demuestra ese
selector. No se activó ninguna regla económica a partir de estas pistas.

**El manual distingue información útil de páginas vacías.** Trabajo desconectado
describe exportación/importación de documentos/clientes/estructuras, registro y
versiones iguales; no sincronización moderna automática. Agenda y documentos
vinculados tienen contenido. Terminal de taller, cajas y SQL tienen páginas
«EN CONSTRUCCIÓN»: sus títulos no prueban comportamiento. No se reextrajo el CHM.

El esquema anterior de `Anterior.mdb` —995 tablas, 14.804 columnas, 1.625 índices,
10 relaciones, 204 tablas pobladas— se reutilizó desde JSON comprobado. No se
reabrió la MDB ni se verificó su hash actual. Son resultados de aquella instantánea,
no un recuento vivo. Se conservan las diferencias/omisiones ya documentadas.

## Avance nativo: pseudocódigo dirigido, con advertencias

Se probó la alternativa indicada por el relevo de Dudas: importar la copia con
`-noanalysis`, desensamblar un conjunto permitido y descompilar una función
candidata. `scripts/research/ProductorBoundedDecompile.java` contiene el guion
propio; no incorpora código GAIA. La prueba usa Ghidra 12.1.4 y el JDK ya instalados.

Entrada candidata `0x01ad83e0`, límite exclusivo `0x01ada390`. El intervalo previo
de 8.112 bytes contenía 2.688 instrucciones lineales. Ghidra identifica para
esta función 7.852 bytes en cuatro rangos y 2.586 instrucciones; no son recuentos
contradictorios ni se declara que todo el intervalo pertenezca a una función.
Cada rango cargado se cotejó por SHA-256 contra el offset PE de la copia.

La salida incluye 37.645 bytes de pseudocódigo con advertencias: propagación
de tipos sin estabilizar, símbolos globales solapados, jumptable sin recuperar
en `0x0049034c` y salto indirecto tratado como llamada. El método permanece
anónimo. Esto demuestra que esta vía produce una representación parcial;
no prueba semántica correcta de todo el texto ni equivalencia de ejecución.

La primera invocación falló antes de importar porque Ghidra rechaza proyectos
en rutas con elementos que empiezan por punto, como `.codex`. Se usó un proyecto
temporal propio en `AppData/Local/Temp/aluminior-rea-bounded-01a1465d`, fuera de
esa ruta. Las dos invocaciones posteriores terminaron con código 0; la segunda
añadió hashes por rango. `-readOnly -deleteProject` descartó la importación.
Ghidra escribió su caché de símbolos de MSVBVM60 en AppData; no registró COM ni
modificó el ejecutable. No se repitió el análisis global anterior con errores.

REA inspeccionó además los 10 recursos PE del EXE, Evidence ID
`ev_50d676f4cf8bee576329415c94a91890e3bd8e63f3964fe0647fc74c22850662`.
Ese parser conserva tipos/rangos/hashes; no decodifica ni observa cómo la UI
carga los recursos. Su bundle exportado contiene una evidencia. Las
inspecciones managed de CLI se conservan por separado con sus propios IDs.

## Comparación y prioridad

La [matriz](COMPARACION-REA-PRODUCTOR-2026-10-16.md) evita volver a construir
lo existente: catálogo, configurador/GRUPO, presupuestos, compras, corte,
hoja de producción, PDF, aritmética decimal y guardas económicas ya tienen código.
Tarifa dinámica y E1 físico/condicional tienen contratos puros locales.
No son activación de precio dinámico ni cierre monetario E1.

Las diferencias más claras están en optimización con barras/retales, recepción
parcial/factura de compra, libro de almacén/reservas, ciclo completo de venta,
cobros/vencimientos, listados, jornadas de taller y adaptaciones de máquinas.
No todo tiene igual prioridad ni está suficientemente especificado.

**Ahora:** conservar esta extracción, continuar E1 por configuración efectiva,
VarFormat, agregados y persistencia, y preparar casos discriminantes de corte.
No repetir inventarios, E1 físico/condicional, A–F/G1–G5 ni análisis global.
G6 mantiene su protección; no activar importes o tarifas sin contrato.

**Después:** módulos de recepción, stock, cobros e informes, por unidades
pequeñas aceptadas con el taller. P.2/P.6/P.7 mantienen sus verificaciones
comercial/visual pendientes; esta investigación no las sustituye.

**Experimental:** reconstrucción extensa de código, comprimidos internos,
optimizaciones avanzadas y CNC/offline/calidad. Coste y retorno no medidos.
No se añadieron compras, licencias ni infraestructura de pago. Mantener reglas
puras y adaptadores por módulo evita una dependencia operativa del EXE legacy.

## Evidencia local y reproducción

Raíz privada del worktree: `output/rea-productor-20261016/`, ignorada por Git.
Contiene nombres y evidencia derivada; el IL/pseudocódigo propietario no se
incorpora al repositorio. Esta carpeta no viaja con Git ni acredita entrega
en otro equipo. Los documentos versionables contienen síntesis propia y punteros.

| Archivo relativo a esa raíz | Contenido |
|---|---|
| `installation/manifest-initial.json` | Referencia inicial recursiva, exclusiones y errores; no rebaselinar |
| `installation/INFORME-INSTALACION.md` | Detalle de fuentes, RPT, ZIP, servicios, manual y esquema anterior |
| `installation/read-baseline.json`, `integrity-after.json`, `verification.json` | Identidad de lecturas, metadatos y reconciliación |
| `managed/artifact-map.json`, `artifacts/` | 123 inspecciones de identidad/metadatos, comandos y SHA-256 |
| `managed/INFORME-MANAGED.md`, `managed-summary.json`, `assembly-reference-graph.json` | Contratos detallados, cobertura y 1.257 referencias declaradas; candidatos de dependencias no son cargas observadas |
| `managed/boundaries-map.json`, `members/` | Selecciones, firmas, referencias y fronteras nativas |
| `managed/il-contracts.json`, `il-contract-verification.json` | 26 contratos; cotejo independiente de 716 cuerpos |
| `native/bounded.pseudo.c.txt`, `bounded.asm.txt`, `body-ranges.tsv` | Representación nativa parcial y hashes por rango |
| `native/run-verified.log`, `bounded-result.txt`, `rea-evidence-bundle.json` | Ejecución del analizador y evidencia PE exportada |
| `native/costemed-static.json` | Identidad y seis literales UTF-16 seleccionados; no selector de coste dimensional demostrado |
| `source-map.json`, `source-map-original.json`, `verification-root.json` | Barrido completo de código TS/TSX e identidad entre checkouts |
| `core-tests.log` | 964/964 tests core ejecutados; no suite web/BD/E2E nueva |
| `executed-checks.json`, `delivery-verification.json` | Comandos, salidas conservadas y gate de alcance/enlaces |

Comprobaciones reproducidas por el arquitecto, todas con código 0:

```powershell
python -B output/rea-productor-20261016/installation/verify_outputs.py
python -B output/rea-productor-20261016/installation/inspect_installation.py --verify
python -B output/rea-productor-20261016/managed/recover_contract_il.py
python -B scripts/research/verify-rea-productor.py --worktree . --installation C:/Productor/Aluminio --sample C:/Users/sergi/Desktop/Aplicaciones/Dudas/pruebas/productor-extraccion-20261016/muestras/aluminioApp.exe --prior-native C:/Users/sergi/Desktop/Aplicaciones/Dudas/pruebas/productor-extraccion-20261016/evidencia/native-verification.json
```

Para regenerar el mapa propio se usa `scripts/research/rea-productor-source-map.mjs`
con raíz, JSON de salida y ruta al módulo TypeScript instalado; analiza AST sin
importar módulos de producto. Los scripts managed reutilizan el runtime REA local
y la tabla de opcodes previa de Dudas: sus rutas constan en los scripts privados.
No regenerar una referencia inicial de integridad para hacer pasar un verificador.

En el checkout original, comprobado equivalente en los 641 archivos comunes,
se ejecutaron `npm run -w @aluminior/core test -- --maxWorkers=2` (71 archivos,
964 correctos), `npm run -w @aluminior/core typecheck` y
`npm run check:architecture` (859 archivos, cero infracciones).
No se han ejecutado nuevas pruebas de BD, web publicada, interacción Productor,
móvil, impresión ni fiscalidad. La documentación de producción anterior sigue
siendo histórica, no una verificación actual de despliegue.

El inventario final mantiene 211.522 metadatos, las 1.205 lecturas SHA-256 y
los 26 directorios ZIP sin cambios, cero altas/bajas/errores. Esto no afirma
hash completo de imágenes/bases que solo se enumeraron. Las rutas enlazadas,
la separación de evidencia privada y el diff del worktree se verifican antes
del cierre. La revisión independiente, `review-independent.md`, no encontró
hallazgos reproducibles en su alcance: reejecutó cinco verificadores y los
controles sintácticos. Inspeccionó los logs de aplicación sin repetir sus suites.
No hubo correcciones funcionales ni se necesitó una segunda ronda de revisión.
