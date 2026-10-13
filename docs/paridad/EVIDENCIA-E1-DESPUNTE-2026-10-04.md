# E1: evidencia documental y contraste de despunte guardado

> Referencia fechada; conservar evidencia y límites. No ejecutar sus pendientes o permisos como instrucciones actuales. Consultar el [roadmap vigente](../../ROADMAP-PARIDAD-PRODUCTOR.md).

04/10/2026. **A–F conservados; complementario G1–G5 observado y verificado.
Alta independiente y reparto por bases distintos demostrados; precisión aún
no discriminada por G4. E1 sigue En curso.** Estado y siguiente trabajo en el
[roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md). No hay cambio del producto web.

## Fuentes y procedencia

- Manual CHM extraído, `5_3_1_6_1_despunte.htm` y
  `5_3_1_6_1_1_despunte_cero.htm`, bajo `output/investigacion-fuentes/manual/`.
  `7_2_4_calcular_despunte.htm` está «EN CONSTRUCCIÓN» y no añade una regla.
- [Gastos observados](RECON-DETALLE-PRESUPUESTO.md) y
  [vídeo, sección 9](EVIDENCIA-VIDEO-PRESUPUESTO.md), con sus límites originales.
- Copia Windows `C:/Productor/Aluminio/EMP0016/Anterior.mdb`, 283.316.224 bytes,
  SHA-256 `0be877011be203d2da7b75637b510d2164663651d4807cc8985e62be890e3477`.
  Lectura exclusiva de una proyección técnica de VPresupuestos y
  VDespunteDetalle, con huella antes/después; sin consultar la base activa.
- **Es otra fuente que la del banco vigente**: su manifiesto conserva
  `e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`,
  234.168.320 bytes y 403 cabeceras, extraídas el 03/10 desde el Mac.
  No se reemplazó el manifiesto, catálogo, tablas ni resultados del banco.
  Los recuentos de esta investigación no describen sus diez candidatas E1.
- Conversaciones «Observar ensayos de Productor» y «Observar contrastes en
  Productor», leídas el 04/10: no contienen resultados nuevos de E1. La primera
  quedó preparando una ventana 1200×1200 para otro ensayo, sin entradas completas.
  Las conversaciones estaban sin ejecución activa. La detección actual de
  ventanas no encontró Productor en esa primera consulta. La continuación
  posterior descrita abajo distingue ese estado histórico del actual.

## Continuación visual del 04/10: A–F

El usuario abrió Productor y autorizó añadir lo necesario, ofreciendo ayuda
manual. Se confirmó **PRUEBAS ALUMINIOR - 2026 [0017]** y se arrastró la primera
corredera de la galería: selección **C2, VENTANA CORREDERA DE DOS HOJAS**,
1200×1200. Perfiles, vidrio y acabado principal aparecían vacíos; accesorios
UNI/* visibles. No se aceptó la estructura ni se calculó despunte.

El intento de reemplazar el ancho abrió «Artículos»; se cerró esa ventana sin
editar catálogo y volvió el diseñador. La observación siguiente siguió
devolviendo el árbol de «Artículos» pese a mostrar el diseñador. No hay
confirmación de 1500×1150 ni de GMC400, y no se atribuye esa entrada al ensayo.

Se pidió al operador configurar 1500×1150, GMC400 y acabado/vidrio habituales
que permitan valorar, aplicar «Actualizar» y dejar el diseñador sin «Aceptar»
ni despunte. El usuario completó esa entrada y explicó el recorrido por
clic/escritura/lupa/Actualizar, añadido a RECON-CERRAMIENTOS.

Verificado después: C2 GMC400 1500×1150, VCG4; el acabado principal aún vacío
se seleccionó L (blanco) y se aplicó Actualizar. Cantidad 1, descripción
automática, campos de horas adicionales vacíos; los ajustes MO/MOCOL del
GRUPO tienen cantidad cero. No equivale a omitir la mano de obra generada
dentro de la C2. A conserva línea, gastos, totales, GRUPO y las dos pantallas
del despiece en `output/e1-despunte/observacion-20261004/`. Identificadores e
importes comerciales permanecen privados. Gastos/descuentos visibles a cero,
Sumar Comisión y Deducir IVA antes desmarcados. Opciones de herraje no
inspeccionadas; solo su salida de despiece está acreditada.

B ejecutado con Barras Completas y parámetros visibles: Longitud Aprovechable
0, Seleccionar Longitud de Barra desmarcado, Repartir entre las líneas,
Coste Mínimo, Precio de Compra sin gastos, Restar Descuento del Proveedor y
M2 desmarcados. La versión ofrece también **Solo imputar Coste**, además de
los dos modos de repercusión históricos; no se ha ensayado esa variante.
Se esperó el estado «Finalizado» y se pulsó Aceptar; no se interpretaron los
campos vacíos durante «Calculando Coste» como ceros.

| Estado | Resultado acreditado | Límite |
|---|---|---|
| A | Una línea valorada; gastos visibles cero; despiece completo conservado | Costes del despiece aún sin calcular; opciones de herraje sin inspeccionar |
| B | Resta de costes coincide con el cargo; siete perfiles L/*, una barra de 6400 mm por perfil, 44,80 ML; al aceptar cambia el precio del GRUPO | Componente C2 y ventas de piezas mantienen precio; sus costes se rellenan. Incremento visible supera el cargo en 0,02 € |
| C | «Duplica la línea actual» crea dos GRUPO con el precio incrementado; el cargo de cabecera permanece | Es duplicación, no alta independiente; no demuestra arrastre al crear desde cero |
| D | Recalcular conserva las siete barras, duplica material valorado con redondeo agregado distinto y reduce el cargo; lo sustituye en cabecera | Dos líneas iguales reciben el mismo precio. Residuo agregado de 0,02 € frente a dos bases A más cargo |
| E | Repetir mismos parámetros produce los mismos costes, cargo, precios y totales que D tras aceptar | No se observó el stock de retales; acredita ausencia de acumulación visible en este ensayo |
| F | F9, retorno a lista, Editar: persisten cargo, base/% cero, precios, medidas y totales. Primera C2: GRUPO y 16 filas visibles de despiece conservados | Segunda C2 contrastada en copia técnica; no se reabrió el diseñador ni se inspeccionaron sus opciones de herraje |

Cada cálculo conserva parámetros, resultado y 14 filas del Detalle Resultado
(Barras/Perfiles), además de Gastos y documento después de aceptar. Los
importes comerciales, identificadores y capturas originales están solo en
`output/e1-despunte/observacion-20261004/observacion.json` y archivos asociados,
ignorados por Git. El cargo sigue la resta agregada de costes mostrados.
Base y porcentaje de Gastos permanecen cero con cargo positivo; no representan
la base efectiva de reparto. La configuración GID explica el residuo en estos
casos; no fija aún el reparto con importes distintos ni todos sus redondeos.

La consulta incidental de Informe de coste tras reabrir presenta diferencias
de céntimos entre familias, su suma y venta del documento; se conservó sin
pulsar Actualizar. No se confunde con la política del diálogo de despunte.

### Copia técnica del estado F en 0017

Ficha cerrada después de la consulta sin volver a guardar. Se obtuvo una copia
privada con SHA-256 de fuente antes/después y copia coincidentes:
`c2db81d248174c2981e041652d3c507b4f5cb4e24aedae27cb5e87195d7b5585`,
264.933.376 bytes. Procedencia en
`output/e1-despunte/observacion-20261004/fuente/EMP0017/procedencia.json`.
El primer intento de huella con PowerShell no pudo abrir la fuente por uso
concurrente; su copia no verificada no se consultó. La segunda copia verificada
se obtuvo con lectura compartida normal y tres huellas iguales, sin modificar
fuente ni bloqueo. No se consulta la MDB activa con el lector.

`scripts/lib/despunte-guardado/ensayo-0017.ts` exige copia resuelta dentro de
`output/e1-despunte`, empresa y nombre de ensayo explícitos, manifiesto estable,
tamaño y huella antes/después de lectura. Proyecta campos técnicos y filtra un
documento/revisión explícitos; excluye cliente, descripción, dirección y datos
de contacto. Añade proyección de configuración GID, su familia, margen especial
y margen de documento. No relaja el lector histórico ni renombra la activa a Anterior.

Resultado privado `F-guardado-tecnico.json`: 124 filas de documento, dos GRUPO,
tres componentes y 55 filas internas de estructura por GRUPO; 14 de despunte.
No equivalen a 124 líneas comerciales ni a 55 filas visibles resumidas.
Ambas ramas coinciden en artículos, acabados, cantidades, medidas, cortes,
metrajes y campos de venta; GastosIndirectos internos no son idénticos.
Los GRUPO guardan suma de indirectos aproximadamente 0,02 € superior al cargo
(representación flotante). Existe también una fila interna GID en modo reparto;
su presencia **no acredita** «Insertar línea aparte». Se preserva para estudiar
la aplicación, sin sumar otra vez GRUPO, componentes y piezas.

### Causa del residuo: margen de GID

En esta copia, GID pertenece a familia 056, sin fórmula ni margen especial de
artículo o de documento. La familia tiene Margen1 **0,01 %**, TipoMargenCV `C`
(sobre coste), CalculoPVP `MAX`; el documento usa tarifa 1. Su precio interno
GID coincide, con tolerancia de representación flotante, con
`cargo × (1 + 0,01 / 100)`, mientras su coste coincide con el cargo de cabecera.
El redondeo a céntimos después de añadir ese precio en B y después de dividirlo
entre dos en D reproduce exactamente los precios observados. Esto explica
el residuo de 0,02 € en ambos, sin inventar una corrección fija de dos céntimos.
Contraste privado: `F-contraste-margen-GID.json`, configuración y campos
guardados asociados. **No es un margen por defecto:** procede de esta familia
y tarifa. Resta de costes guardados admite aún ambas políticas de redondeo
probadas. Dos líneas iguales sin descuentos no discriminan la base proporcional,
empates ni cuándo se redondea con importes distintos; eso sigue abierto.

## Archivos frente a ventanas: comprobación adicional del 04/10

### Ensayo complementario G1–G5 del 04/10

El usuario confirmó un presupuesto nuevo en 0017. Se conserva intacto el
ensayo A–F. Primera C2 GMC400 1500×1150 y segunda C2 GMC400 1200×1150, ambas
L, VCG4, UNI/*, cantidad 1, descripción automática, horas adicionales vacías
y descuentos cero. La segunda se añadió desde + → Cerramiento → diseñador
vacío → arrastre nuevo, después de aplicar el primer cargo. Ayuda manual del
usuario y Actualizar completaron la altura; se verificó antes de Aceptar.

| Estado | Acción y resultado acreditado | Fuente privada |
|---|---|---|
| G1 | Primera C2 valorada; gastos/descuentos visibles cero | Capturas y observacion.json |
| G2 | Primer Barras Completas finalizado y aplicado; un GRUPO con cargo | Copia estable G2 y proyección técnica |
| G3 | Alta independiente de segunda C2 de distinto importe: primera conserva precio con cargo; segunda entra con base propia e indirecto nulo; cabecera conserva el cargo previo | Capturas, copia G3 y proyección técnica antes de recálculo |
| G4 | Mismos parámetros: sustituye el cargo; reparte según bases sin el cargo anterior; siete barras de 6400 mm, 44,80 ML y 14 filas de detalle | Capturas, copia G4, predicciones-previas.json y G4-contraste.json |
| G5 | F9 → lista → Editar: Gastos, líneas y totales persisten; toda la proyección técnica coincide con G4 salvo procedencia | Capturas, copia G5 y G5-persistencia.json |

Parámetros conservados: Barras Completas, Longitud Aprovechable 0, sin
Selección de Longitud de Barra, Repartir entre líneas, Coste Mínimo, Precio
de Compra sin gastos; sin descuento proveedor ni M2. Base/% visibles de
Gastos permanecen cero, sin representar el peso efectivo del reparto.

Las predicciones se fijaron antes del segundo cálculo: reparto igual, por
bases sin cargo y por precios vigentes con primer cargo; cada modelo con
GID fino/redondeo independiente, GID redondeado/redondeo independiente y
mayor resto. Solo coincide el modelo por bases, proporciones **53,197189 % y
46,802811 %**. Las tres políticas de precisión coinciden en G4: ese estado
no permite escoger una. El GID conserva mayor precisión que los indirectos
finales del GRUPO, almacenados a céntimos con representación flotante MDB.
El margen GID verificado se reutiliza, sin repetir el diagnóstico del residuo.
No se suman niveles GRUPO, C2, piezas y GID. Descuentos cero y cantidad 1
no discriminan base bruta/neta ni reparto por cantidad.

Copias estables: huella de fuente antes = después = copia; lector específico
consulta solo las copias verificadas, dentro de output ignorado. G2: SHA-256
`4fb9c4466e8b1c55e30ae23bd3c36f752fc2411104bbd6478f9d3d3b2fe3e8af`,
265.424.896 bytes; G3: `7a955a5a80eb64ea81cba38523ae134f1f4574e6a821fc5b1e42c3579d85144c`,
265.682.944 bytes; G4: `5cd39ef2697ef8900a6f7ba773353242919808dfd360c77ccb7281c106c57191`,
265.920.512 bytes; G5: `351c43f45e4f4192128c042d3c60e7a851b6605d9b403faab6dfae6774271477`,
265.920.512 bytes. Identificadores e importes individuales quedan exclusivamente
en `output/e1-despunte/complementario-20261004/`. Trece pruebas del lector y
typecheck dirigido correctos. No hay nueva medición del banco.

**Preparación anterior a G6-incidencia, sin resultado de precisión atribuido.**
Variante de precisión preparada antes de recalcular: solo ancho de la segunda
C2, 1200 → 1207 mm. La selección por interpolación es una estimación, no un
resultado; bases y cargo deben comprobarse. El usuario no confirma uso habitual
de descuentos; no se toma como decisión de producto ni regla de reparto.
El control de entrada abrió Artículos; se cerró sin editar catálogo. Después
el usuario dejó medidas 1207×1150 aplicadas; verificado elemento y conjunto.
Al retomar, perfiles/vidrio/acabado estaban vacíos. La búsqueda mostró GMC400
seleccionado, pero Aceptar/Enter y recuperación de ventana no confirmaron el
diálogo; se pidió ayuda manual para confirmar GMC400, VCG4, L y Actualizar,
con UNI/* y cantidad 1, dejando sin Aceptar el cerramiento. En ese punto no había G6 valorado ni G7. La continuación con error se describe
abajo; no acredita el ensayo previsto.

### Variante 1207×1150: incidencia conservada, no comparación válida

Después de ayuda manual, se verificaron GMC400, VCG4, L, UNI/*, cantidad 1,
horas adicionales vacías y descripción automática de 1207×1150. Al pulsar
Aceptar, Productor mostró `alVLinOpciones_codEstr.OpcionesSeleccionadas`,
error `-2146233088`: configuración inválida/incompleta al crear SessionFactory.
No se inspeccionó InnerException ni se alteró la instalación para repararlo.
Cerrar el informe dejó un tercer GRUPO en el presupuesto, sin sustituir la
segunda C2. Se cerró el editor vacío, sin otro cálculo de despunte.

Copia **G6-incidencia** estable: SHA-256
`175da41901df13eb6382dfdf3f26dedb925a493e6b2496ff9843a37d936a1e61`,
265.920.512 bytes, 183 filas técnicas, tres GRUPO y 14 filas del detalle previo.
Las dos líneas anteriores coinciden campo por campo con G4/G5. La tercera
conserva indirecto nulo. Coinciden 58 filas vinculadas de artículos/acabados/
tonalidades/cantidades con la segunda C2; esto no valida opciones afectadas
por el error ni una valoración completa. Registro, capturas, identificadores
y precios permanecen privados. No sumar este estado a resultados válidos ni
atribuir un G7 o precisión discriminada: aún no se ha calculado.

Siguiente operativo: se solicitó autorización para quitar **solo el tercer
GRUPO de la incidencia** y recuperar el ensayo de dos líneas, conservando
esta fuente. Después verificar el recorrido de edición de la segunda línea
sin crear otra. La guía fechada observa lápiz/Enter para editar GRUPO, pero
esta transición de variante acabó en alta; se pidió ayuda al operador. No
repetir A–F ni G1–G5. El caso 1207 fue seleccionado por estimación y no ha
aportado aún una comparación discriminante.

La carpeta `C:/Productor/Aluminio` contiene bases MDB, manual
`ManualUsr/Aluminio.chm`, configuración y plantillas RPT. No se consultaron
credenciales, configuraciones de correo ni documentos personales para este mapa.
Se verificó otra vez la copia F, sin cambio de SHA-256, y la existencia de
estas tablas/campos; mapa privado en `observacion-20261004/mapa-fuentes.json`.

| Información de las ventanas | Fuente comprobada en la copia MDB | Alcance |
|---|---|---|
| Cabecera, totales y gastos guardados | VPresupuestos | Campos económicos del ensayo extraídos; datos personales excluidos |
| Artículos de línea, cantidades, medidas, precios y cortes | VPresupuestosLin | GRUPO, componentes y piezas son niveles distintos; no sumar todos |
| Costes de perfiles/barras del cálculo guardado | VDespunteDetalle | Resultado enlazado al documento; no demuestra parámetros ni clics anteriores |
| Catálogo, descripciones y PVP | Articulos, ArticulosPVP | Tabla/campos confirmados; no se exportó el catálogo completo en esta comprobación |
| Márgenes y reglas configuradas | Familias y márgenes especiales/de documento | Configuración de GID contrastada; no presumir el mismo margen en otros artículos |
| Composición y uniones del cerramiento | VCerramientos, VCerramientosLin | Existencia y campos confirmados; ampliar proyección solo para la pregunta concreta |
| Familias, acristalamiento y opciones | VDatosLinEstr, VOpcionesHerraje | Existencia y campos confirmados; no equivale a haber inspeccionado las opciones del ensayo |

Las cuadrículas del programa presentan datos guardados y resultados calculados.
Leer la MDB permite extraer muchos valores sin recorrer todas sus ventanas.
Las plantillas RPT describen informes; su presencia no acredita una regla
económica ni autoriza copiar sus activos a Aluminior. El CHM aporta descripción
funcional, con los límites de sus páginas incompletas.

La copia F acredita un estado guardado, no un historial completo A–F. No se ha
demostrado que la base conserve todos los valores previos o las entradas aún
sin guardar. Orden de aplicación, recálculos automáticos, interacción y atajos
requieren observación o una fuente específica que los documente. Continuar con
lectura de copias primero y un ensayo discriminante para lo que falta.

## Lo que documenta el manual

| Aspecto | Regla documentada | Límite de esta entrega |
|---|---|---|
| Importe | Coste de barras optimizadas menos coste de perfiles valorados; el total no puede ser negativo | No reconstruye la selección del proveedor, descuentos ni gastos |
| Base material | La medida de valoración puede diferir de la de corte; el ejemplo de mallorquina compensa diferencias entre perfiles antes de limitar el total a cero | No acredita la base efectiva del C2 del ensayo |
| Barras completas | Usa el largo configurado del artículo; el manual indica 6000 mm cuando falta | No se aplica ese valor por defecto al catálogo web ni a datos ausentes |
| General / Por perfil | Distingue el aprovechamiento general del configurado por artículo y describe sus valores de respaldo | No equivale a cambiar el largo útil por saneamiento; parámetros actuales sin observar |
| Reparto | Incremento proporcional al importe de las líneas | Base neta/bruta, descuentos, precisión y redondeo aún sin discriminar |
| Línea aparte | Artículo GID para el cargo calculado, conservando el importe de las demás líneas | No se observó qué ocurre al recalcular o copiar |

En el ejemplo del manual, la valoración de las lamas supera los metros
optimizados. Eso explica por qué no basta multiplicar siempre el corte físico
por el coste por metro para reproducir el despunte de cabecera.

## Contraste de valores guardados

VDespunteDetalle distingue filas `Perfiles` y `Barras`. El diagnóstico suma
CostePerfiles de las primeras y CosteBarras de las segundas, enlazando
`TipoDoc=VPRES` + `nDoc=VPresupuestos.Id`. Conserva registros e importes
individuales únicamente en `output/e1-despunte/`, ignorado por Git.

| Control | Resultado |
|---|---:|
| Cabeceras de la copia Windows | 505 |
| Filas de detalle | 3.852 |
| Filas enlazadas a las cabeceras presentes | 335 |
| Filas huérfanas respecto a esas cabeceras | 3.517 |
| Documentos con detalle enlazado | 21 |
| Documentos con despunte positivo | 14 |
| Positivos con detalle y resta coincidente al céntimo | 13 |
| Positivos sin detalle | 1 |
| Con detalle y resta distinta del cargo guardado | 8 |
| Positivos con base y porcentaje guardados a cero | 14 |
| Casos que discriminan los dos redondeos probados | 0 |
| Diferencias negativas antes del límite | 0 |

Los trece positivos con detalle coinciden tanto al redondear la resta final
como al redondear cada fila antes de sumar. **No discrimina el redondeo.**
La coincidencia acredita la resta de costes almacenados, sin reproducir el
optimizador ni demostrar cuándo o cómo se aplicó a las líneas comerciales.

Los ocho detalles discordantes corresponden a cabeceras con cargo cero pese
a una resta positiva. No se demuestra si el cálculo quedó sin aplicar, fue
retirado, se modificó el documento o existe otra causa. Se conservan como
discrepancias. Tampoco se imputan las filas huérfanas a documentos actuales.
Base y porcentaje a cero con cargo positivo no permiten reconstruir el reparto;
no se propone `DespunteBase × DespuntePorc / 100` como regla de estos registros.

## Código existente y decisión de implementación

`core/src/produccion/despunte.ts` obtiene el material necesario de
`plan.totalUtil`, calcula coste por metro y admite reparto proporcional por
mayor resto. `web/.../produccion/_lib/preparar-produccion.ts` lo utiliza como
coste técnico de corte, sin escribir cargos en el presupuesto.

Ese contrato no representa por sí solo una valoración material distinta del
corte, selección de costes del original, aprovechamiento General/Por Perfil,
paneles ni actualización de líneas guardadas. El reparto por mayor resto de
core tiene pruebas sintéticas; esta investigación no lo certifica como el
redondeo de Productor. **Se mantiene el motor vigente** hasta demostrar la
frontera económica de cabecera. No hay una corrección del banco en esta entrega.

## Reproducción y verificaciones

```powershell
node --import tsx scripts/contrastar-despunte-guardado.ts --mdb C:/Productor/Aluminio/EMP0016/Anterior.mdb --sha256 0be877011be203d2da7b75637b510d2164663651d4807cc8985e62be890e3477
node --import tsx --test scripts/lib/despunte-guardado/*.test.ts
npx tsc -p scripts/tsconfig.despunte-guardado.json --noEmit
```

El lector exige ruta resuelta EMP0016/Anterior.mdb y SHA-256 explícito; rechaza
la base activa, copias de 0017, columnas ausentes y cambio de huella. Esta
frontera histórica no habilita extracción de un ensayo de 0017.
La salida contiene manifiesto, tablas técnicas y contraste privados; stdout
solo muestra huella y agregados. Nulos, modalidades desconocidas, identidades
duplicadas y diferencias se conservan o bloquean, sin producir falsos ceros.

Verificado: trece pruebas sintéticas del diagnóstico y fronteras de lectura; 47 pruebas existentes de
banco/adaptadores/cobertura; typecheck dirigido y del monorepo; arquitectura
sin infracciones. No se ejecutaron integraciones de escritura: no cambia
código del producto. El banco conserva sus archivos y la medición histórica
400/523, 434 exclusiones; no hubo una nueva medición ni aceptación de UI.

## Próxima comparación necesaria

G1–G5 ya demuestran alta independiente, bases distintas y persistencia; no
repetirlos ni A–F. Conservar G6-incidencia y recuperar el ensayo de dos líneas
tras autorización para quitar solo el tercer GRUPO. Verificar edición segura
de segunda C2 y opciones tras error, después variante discriminante con
predicciones previas y bases reales, para separar precisión.
Descuentos, cantidades distintas de 1, empates exactos, stock/retales,
saneamiento/disco, opciones de herraje, otros modos y costes con descuento
no se han ensayado. Usuario no confirmó uso habitual de descuentos; no
transformar esa respuesta en regla de producto.
E1 sigue **En curso**: frontera económica todavía sin aplicación web ni
contraste nuevo del banco. E2 sigue después según roadmap.

Mantenimiento: roadmap, estado, procedimiento, ensayos, matriz, índice, relevo
y banco actualizados, conservando fuentes y discrepancias; no se retiró ningún
documento con trabajo aún abierto. El pendiente July existente de G1/E1 quedó
actualizado localmente en `aluminior`, sin duplicar ni cerrar. No se publicó
esta edición mediante sync y no se acredita recepción en otro equipo.
Avance complementario: pendiente 180 de `aluminior`,
`sync_uid 398049fbd618069e36bb84bab37913ed`, editado localmente sin duplicarlo;
conserva historia A–F, G1–G5 y G6-incidencia; estado `in_progress`.
No se retiró evidencia ni se cerró E1. Las instrucciones operativas ya remiten
a recuperar la incidencia antes de precisión y evitan repetir A–F y G1–G5.
