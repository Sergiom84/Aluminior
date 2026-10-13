# Productor: extracción diferencial con ClonerSoft

13/10/2026, Windows. Investigación estática y documental; no implementación,
publicación ni certificación de paridad. Amplía la
[investigación del 12/10](INVESTIGACION-CLONERSOFT-2026-10-12.md).
El [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md) conserva los estados de producto.

## Contrato y protección del trabajo existente

- **Resultado exacto:** recuperar evidencia útil no integrada en Aluminior,
  separándola de datos ya extraídos, funcionalidades existentes e hipótesis.
- **Destinatario y motivo:** desarrollo de Aluminior y operador del taller;
  reducir repetición de investigación y preparar reglas propias verificables.
- **Éxito medible:** inventarios reproducibles de fuentes, esquema, cobertura
  funcional, contratos nuevos y límites; huellas de originales conservadas.
- **Alcance autorizado:** ClonerSoft local, fuentes indicadas por Sergio,
  copia EMP0016/Anterior, lectura remota y navegación de consulta en Aluminior.
- **Fuera de alcance:** importar masivamente, cambiar cálculo/UI, ejecutar
  Productor, registrar COM, resolver el merge, migrar o desplegar.
- **Protegidos:** bases activas, documentos reales, secretos, código propietario,
  WIP, índice Git y documentos con conflictos de la integración Windows–Mac.
- **Comprobaciones:** integridad de fuentes, reconciliación de recuentos,
  cobertura explícita, revisión independiente y ausencia de cambios ajenos.
- **Autorización adicional:** ejecución legacy aislada, cambios de negocio,
  carga/migración/despliegue o modificación de documentos de ensayo pendientes.

El checkout conserva `codex/integracion-windows-mac-20261013`, HEAD `913dd43`,
y 21 rutas sin resolver en el índice. Las pruebas históricas no certifican este
árbol. No se hace commit con ese merge abierto. Estado e índice documental están
en conflicto: quedan intactos; este informe se enlaza desde roadmap y relevo.

## Corpus y resultado medido

| Fuente / comprobación | Resultado | Qué demuestra y qué no |
|---|---:|---|
| Instalación suministrada | 2.651 archivos inventariados; 456 con SHA-256 | Inventario acotado, no lectura semántica de cada archivo |
| Informes y CSV instalados | 294 RPT y 84 CSV | Presencia local; no equivalencia funcional ni suma con inventarios históricos |
| Assemblies empresariales seleccionados | 30 objetivos; 29 inventarios de miembros completos, uno parcial; 31.633 métodos en los completos | Primer barrido de 29 DLL más estructuras para tarifa dinámica; no comprensión semántica de todos los métodos |
| Manual extraído previamente | 664 HTML; 187 contienen EN CONSTRUCCIÓN | Se reutiliza la extracción; los títulos vacíos no son reglas |
| Documentación auxiliar | 2 PDF, 7 páginas; 2 MHT | Texto extraído, fuentes intactas; páginas 2–3 del recargo revisadas visualmente |
| EMP0016/Anterior | 995 tablas, 14.804 columnas, 1.625 índices y 10 relaciones declaradas | Esquema completo de esta copia; no relaciones implícitas inferidas |
| Tablas con contenido en esa copia | 204; restantes 791 vacías | Recuentos de cabecera de tabla, sin exportar filas comerciales |
| Export anterior de Aluminior | 204 CSV de datos más manifiesto | Todas las tablas pobladas tienen CSV y todas sus columnas de cabecera |
| Diferencias copia / manifiesto CSV | 33 tablas con distinto recuento | Instantáneas diferentes; no mezclar filas ni atribuir identidad por nombre |
| Supabase, transacción READ ONLY | 60 tablas públicas, 514 columnas, 33 migraciones; 50 tablas pobladas | Estado de datos consultado ahora; no aceptación del producto |
| Cobertura local | Matriz de 30 dominios; 838 archivos de código barridos para referencias de tablas | Ausencia textual acotada, no prueba universal de ausencia funcional |

La copia tiene SHA-256
`e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`,
igual a la fuente del 12/10. Se lee una copia privada con Jackcess `readOnly`;
original y copia tienen la misma huella antes/después. No se abre `aluminio.mdb`.

La conclusión de datos es concreta: **no faltan por exportar tablas pobladas de
esta copia**. Lo pendiente es interpretar, integrar selectivamente y verificar
comportamientos. Tener CSV no implica disponer de la funcionalidad en la web.
Se contaron las filas reales de los 204 CSV: todas coinciden con su manifiesto.
Hay una omisión declarada de contenido binario: `DisForTrazos.Bitmap`.
Cabeceras completas no significa conservar ese payload; no se copia el recurso
propietario ni se declara recuperado.
Las 138 tablas pobladas sin coincidencia literal de nombre en el barrido de
código son pistas de búsqueda; no equivalen a 138 funciones ausentes.

## Información incremental aprovechable

| Tema | Regla o evidencia recuperada | Situación en Aluminior y límite |
|---|---|---|
| Despunte geométrico | ClonerSoft localiza agrupación por artículo, acabado y tonalidad; cantidad de línea participa en metraje y en cantidad de cortes; largo de detalle o estándar cuando es cero | Completa la preparación E1. No demuestra reparto monetario, base bruta/neta ni redondeo |
| Despunte condicional | Filtros conjuntivos por estructura, familia y serie; listas separadas por `;`, igualdad tras minúsculas; booleano de configuración con defecto falso | Contrato estático de selección. No activar automáticamente en presupuesto |
| Recepciones de compra | Un albarán admite pedido entero o cantidades parciales; factura reúne varios albaranes del proveedor y permite insertar una línea opcional con número y fecha de origen | Compras ya tiene pedidos; no rehacerlos. Faltan contratos de recepción/facturación y trazabilidad persistente |
| Stock de pedidos | Reserva previa y consumo posterior; estados sin actualizar/reservado/pendiente/actualizado; propuesta editable de consumos y restos, con deshacer | La casilla StockSN no implementa almacén. Separar reserva, consumo y existencia física |
| Movimientos de almacén | Artículo/acabado, proveedor opcional, dimensiones, entrada/salida, cantidad y precio opcional | Se requiere un modelo de movimientos; no añadir cantidades a una casilla de artículo |
| Cobros | Varios cobros con fecha/importe pueden aplicarse a un vencimiento; filtros de factura, cliente y pendientes | Extraer el contrato de aplicación y reversión antes de construir tesorería |
| Horas y control de obra | Jornadas por trabajador, obra/concepto/tarea; inicio-fin o total de horas; gastos asociados | Es distinto de la mano de obra manual presupuestada ya disponible |
| Calidad | Controles con código, tarea, frecuencia, ámbito y orden; incidencias de no conformidad e historial | Evidencia de software histórico; no acredita cumplimiento normativo actual |
| Listados configurables | Campos visibles, orden, ancho, decimales, agrupación, sumas por grupo y total, condiciones visuales y filtros en cabecera | El módulo Informes continúa en construcción. El PDF de presupuesto no sustituye este sistema |
| Exportación de tablas | Exportar registros visibles o tabla contextual a Excel/Word/HTML, con formato y destino | Función documentada; definir alcance de filtros, columnas y permisos antes de implementarla |
| Recargo energético avanzado | Selección de artículo por familia/subfamilia y medida estándar/corte; artículo general si ninguna condición; mínimo cubierto con línea por diferencia; cálculo al guardar | Se conserva grosor para peso, pero no se localiza motor equivalente. Falta verificar configuración efectiva del taller |
| Precios especiales del recargo | Precio especial de cliente y oferta de documento se vinculan al artículo concreto; cambiar artículo puede dejar de aplicar la excepción | El PDF de actualización 19.69 explica conversión de configuración antigua. No ejecutar una migración histórica |
| Consultas rápidas | 91 plantillas y 59 nombres únicos, con categorías y filtros | Materia prima para informes; SQL inventariado, nunca ejecutado ni copiado como servicio web |
| Tarifa dinámica | Activación global y por artículo/cliente/acabado/tipo; vía dinámica antes de doble vidrio dinámico y precio ordinario en la entrada inspeccionada | Nuevo contrato parcial; no activarla porque existan tablas. Grupo aplicable, desempates y redondeo siguen abiertos |
| Descuentos máximos | Dos descuentos se comparan con límites separados; la rama que excede un límite prepara valores limitados y lanza error | No demuestra el aviso visible, precedencia de límites ni si el llamador permite guardar |

Referencias documentales precisas, relativas al manual privado existente:

- Compras: `5_2_2_1_crear_de_pedido.htm:124-134` y
  `5_2_3_1_crear_de_albaran.htm:124-142`.
- Stock: `5_3_2_1_1_stock.htm:126-188`; movimientos:
  `5_4_1_4_movimientos_de_almacen.htm:124-139`.
- Cobros: `5_3_5_control_de_cobro.htm:124-145`.
- Horas: `5_4_2_2_introduccion_de_horas.htm:124-133`.
- Calidad: `5_0_4_2_5_1_controles_de_fabri.htm:124-140` y
  `5_0_4_2_5_5_gestion_de_no_conf.htm:124-134`.
- Listados/exportación: `Documentos/Manual Listados.mht` y
  `Documentos/Manual Exportar Datos.mht` de la instalación suministrada.
- Recargo: `Documentos/Recargo Energético Avanzado en Ventas.pdf`, páginas 1–5,
  y `Documentos/Actualización Recargo Energético Avanzado.pdf`, páginas 1–2.

El análisis E1 seleccionó 53 métodos/closures y verificó 1.082 instrucciones
contra sus huellas IL. La descripción anterior es una especificación propia
del comportamiento observado estáticamente; no se incorpora CIL ni código GAIA.
El informe privado de fuentes conserva tokens, SHA-256 y Evidence IDs.

Se conserva lo ya demostrado por los ensayos E1 G1–G5 del 04/10: alta independiente,
reparto proporcional por bases sin el cargo anterior y persistencia, para dos
líneas de cantidad uno y sin descuentos. «Abierto» en esta extracción se refiere
al llamador monetario y a generalizar la regla: base bruta/neta, cantidades y
política de redondeo no quedan discriminadas. No invalida ni repite esos ensayos.

### Tarifa dinámica y coste dimensional

La inspección incremental de estructuras (SHA-256
`71033e88beb210d575fae9969edf0543fabc2ac839e60e5f789c0880eaa67f8f`) verificó
16 métodos y 2.302 instrucciones. La selección de precio para grupo sigue
cuatro pasos: tamaño exacto con intervalo inclusivo de metraje; tamaño exacto
con límites 0/0; tamaño `*` con intervalo; tamaño `*` con límites 0/0.
La primera fila encontrada no aporta un desempate demostrado para solapamientos.
El precio base prioriza documento distinto de cero, especial de cliente/tipo y
tipo; la fórmula prioriza cliente/tipo, artículo y tipo. La llamada de redondeo
está identificada, pero su escala/política no queda demostrada.

Fuente positiva pendiente: de 11 tablas TarDin en la copia, diez están vacías
y tamaños tiene una fila. En el export anterior, fuente distinta, los dos flags
globales de precio/descuento dinámico valen 0; no se atribuye ese valor al
programa vivo. El [contrato privado](../../output/clonersoft-20261013/coste-tarifa.md)
conserva requisitos, tokens, ramas, procedencia y fronteras pendientes.

Coste dimensional sigue abierto: 69.972 filas de `ArticulosPrecioTabla` no
demuestran cómo seleccionar proveedor, dimensión, divisa, gastos o precio neto.
No reutilizar automáticamente el selector de PVP. `gaProductorCosteMed.exe`
se identificó como PE x86 no managed, sin ejecutarlo; su nombre no demuestra
que contenga el selector. Próxima investigación dirigida: configuración y CHM,
y solo después el candidato nativo si persiste la pregunta.

La consulta dirigida del CHM distingue otra regla: el coste calculado de perfil
combina precio bruto por kg × peso por metro y coste de acabado por superficie
× superficie de acabado por metro (`5_1_2_1_2_2_coste_calulado.htm:140`).
No es el selector dimensional. La página de precio en tabla describe proveedor,
restricciones y dos tablas coste/PVP por acabado, pero no resuelve desempates
ni selección entre proveedores; Coste Especial está EN CONSTRUCCIÓN.
La ficha de coste calculado ya estaba reconocida en RECON-ARTICULOS; esta lectura
añade la fórmula documental, sin atribuir aceptación o activar nuevos costes.

## Cobertura funcional y trabajo que no debe repetirse

La [matriz detallada local](../../output/clonersoft-20261013/cobertura-aluminior.md)
separa extraído, implementado, verificado en fecha/alcance y abierto en 30 dominios:
maestros, catálogo visual, cabecera/copia, GRUPO 2D, materiales por elemento,
cortes/cotas, herrajes, vidrio, doble acristalamiento, MO, compacto, tapajuntas,
metraje, PVP, precio dimensional, coste dimensional, tarifa dinámica, comisión,
despunte, uniones, fracciones, PDF, teclado, compras, producción, stock, ventas,
tesorería, informes y generadores/bibliotecas.

No repetir C1/0031/0032/carga dirigida, MO vidrio con coeficientes cero,
A3/idempotencia, A4/medidas decimales, la matriz M0 ni ensayos E1 A–F/G1–G5.
Compras, hojas de corte/producción y optimización 1D ya tienen código.
ConfigSeries y ConjuntosCV no se incorporan como recetas adicionales por el
nombre: parte de sus resultados ya está materializada y consumida.

E2, E3, E4, E5, E6, E7, E8–E11 y P.2/P.6/P.7 conservan sus límites del roadmap.
Esta extracción no cambia el banco 400/523 ni sus exclusiones y no demuestra
que las 541 estructuras visibles tengan precio o fabricación completos.

## Comprobación de la web publicada

Consulta en la pestaña proporcionada por Sergio, sin altas ni modificaciones:
estructuras muestra 541; producción ofrece listado por presupuesto; compras
ofrece Nuevo pedido y actualmente no tiene pedidos; Informes muestra
«Módulo en construcción». Los recuentos de BD corroboran cero pedidos de compra.
Esto acredita superficie accesible y estado visible, no aceptación de procesos
ni comparación de teclado/móvil con Productor. No se ha cambiado UI.

## Prioridad para incorporar lo mejor de Productor

- **Ahora:** conservar esta evidencia y terminar la integración Git en su tarea
  propia; convertir E1, coste dimensional y tarifa dinámica en contratos
  discriminantes antes de modificar importes. Aprovechar lectura estática para
  preparar el siguiente ensayo sin repetir observación ya cerrada.
- **Después:** recepción parcial de compras, stock con movimientos/reservas,
  listados operativos y cobros, por módulos con aceptación del taller. Completar
  las pruebas pendientes de interfaz y documentos ya existentes.
- **Experimental:** mecanizado/CNC, optimización avanzada, planificación,
  integraciones externas y calidad. Primero demostrar entradas/salidas y uso real.

Recomendación práctica: priorizar exactitud económica y reducción de trabajo
repetido antes de ampliar pantallas. La extracción utiliza herramientas locales
existentes, sin compras ni infraestructura recurrente añadida; no se atribuye
un coste de desarrollo o rentabilidad numérica sin especificar cada módulo.
El riesgo principal es mezclar instantáneas o convertir una pista estática en
regla operativa. Mantener funciones puras y adaptadores por módulo limita el
coste de mantenimiento.

## Evidencia privada y reproducción

Raíz local ignorada: `output/clonersoft-20261013/`. Los archivos privados no
viajan por Git o July; sus enlaces no implican recepción en otro equipo.

| Artefacto | Contenido |
|---|---|
| `fuentes/inventory.private.json` | Inventario, hashes, exclusiones y errores |
| `fuentes/managed-coverage.md` | Assemblies y cobertura del parser |
| `fuentes/RESUMEN-REDACTADO.md` | Contratos estáticos, coordenadas y Evidence IDs del primer barrido |
| `fuentes/*.private.json` | Evidencia REA con identidad y miembros |
| `coste-tarifa.md` / `coste-tarifa/` | Segunda unidad: estructuras, tarifa dinámica y límite de coste |
| `cobertura-aluminior.md` | Matriz de 30 dominios y apéndice CHM |
| `datos/esquema-productor.json` | Tablas, columnas, índices y relaciones; sin valores de filas |
| `datos/integridad-mdb.json` | Igualdad de hash original/copia antes/después |
| `datos/comparacion-extraccion.json` | Cruce de cada tabla con CSV/código |
| `datos/verificacion-csv.json` | Filas reales de los 204 CSV contra manifiesto y omisiones binarias |
| `datos/supabase-esquema-recuentos.json` | Recuentos y esquema en transacción protegida de lectura |
| `datos/documentos/manifest.json` | Procedencia e integridad de los cuatro documentos |
| `preservacion-inicial.json` / `preservacion-final.json` | Control de archivos previos e índice Git |
| `revision-independiente.md` / `gate-informe.json` | Revisión de afirmaciones y comprobaciones finales |

Comandos desde la raíz de Aluminior, sin carga de datos:

```powershell
java -cp 'output/auditoria-anuales/lib/*' output/clonersoft-20261013/datos/InventarioMdb.java 'C:\Users\sergi\Desktop\MIX\Productor\Aluminio\EMP0016\Anterior.mdb'
node output/clonersoft-20261013/datos/comparar.mjs
node output/clonersoft-20261013/datos/verificar-csv.mjs
node output/clonersoft-20261013/datos/remoto.mjs
node output/clonersoft-20261013/fuentes/verify-evidence.mjs
node output/clonersoft-20261013/verificar-informe.mjs
node output/clonersoft-20261013/preservacion.mjs
```

`remoto.mjs` verifica el proyecto de destino y `transaction_read_only=on`;
solo consulta esquema, recuentos y cantidad de migraciones. Las credenciales
se resuelven localmente desde el puntero de July y no figuran en los artefactos.

## Cierre de esta extracción

La revisión independiente recalculó huellas y recuentos, contrastó los contratos
seleccionados con sus fuentes y señaló una afirmación excesiva: la línea con
número y fecha del albarán es opcional. Se corrigieron el informe y la matriz;
la trazabilidad persistente sigue pendiente de demostrar.

El control de preservación compara 1.088 archivos previos: solo cambian los tres
documentos autorizados, y el índice Git conserva su huella. Se añade este informe.
Las comprobaciones ejecutadas incluyen las 456 huellas del inventario, integridad
MDB, 204 CSV contra manifiesto, 53 métodos de despunte y 16 de tarifa, referencias
del informe y `git diff --check` de los tres documentos modificados.
No se ejecutan tests de producto: no hay cambio de código y el merge sigue abierto.

Documentación actualizada: roadmap, relevo e investigación del 12/10; no se retira
evidencia histórica. Estado e índice documental permanecen protegidos por sus
conflictos. El siguiente trabajo abierto de esta línea es localizar el llamador
que convierte el despunte físico E1 en importe y resolver sus límites pendientes,
sin repetir los ensayos ya cerrados ni modificar el documento G6 pendiente.

## Límites explícitos de exhaustividad

No se afirma haber obtenido toda la semántica de Productor: se excluyen del
inventario recursivo 16 enlaces EMP, bases anuales, copias, logs, temporales y
EMP0017; la copia autorizada EMP0016 se analiza por separado. RPT, assets y
configuraciones no se confunden con reglas demostradas. No se inspeccionan
protecciones/licencias ni se ejecutan binarios.

`gaProductorDominio.dll` supera el límite de representación de 64 MiB en su
inventario general; cuatro tipos seleccionados y 230 métodos sí se recuperan.
Arrays vacíos del fallo no acreditan ausencia. Los demás inventarios completos
son completos respecto a la operación del parser, no un análisis semántico de
cada método. La información disponible ya permite preparar trabajo concreto;
las condiciones abiertas conservan su nombre y evidencia pendiente.

Se mantienen originales, historia del banco y discrepancias. Ninguna regla
fiscal, bancaria o de marcado CE histórica se presenta como vigente. No hay
cambio de producto que justifique ejecutar o atribuir aquí una suite funcional
verde del checkout con conflictos.
