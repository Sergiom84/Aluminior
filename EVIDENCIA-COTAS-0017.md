# B2: cotas observadas y experimento pendiente (19/09/2026)

Productor 0017, consulta sin guardar. Capturas ignoradas en
output/evidencia-manos-20260919/. B1 resuelve únicamente manos y manillas;
este documento separa medidas/cotas de esa corrección.

| Caso | Medida Productor | Medida Aluminior conservada B1 | Regla activa en Posición |
| --- | --- | --- | --- |
| 1OFI | 900 x 1500 | 800 x 1500 | Horizontal (Abajo), Cota Variable, FIJO INFERIOR, FI, default300 mm |
| 2O+ FIJO | 1200 x 1200 | 1200 x 1500 | Horizontal (Abajo), Cota Variable, FIJO INFERIOR, FI, default300 mm |
| 1O1FL | 1200 x 1200 | 1100 x 1200 | Vertical (Derecha), Cota Variable, FIJO LATERAL, F, default300 mm |

En cada caso se seleccionó el travesaño en el dibujo y se leyó Posición.
Los campos deshabilitados de Cota Fija/Fija desde elemento Exterior también
muestran300: NO son la regla activa. No se cambió ningún valor.
Capturas con prefijos1OFI,2O-FIJO,1O1FL, sufijos ficha/diseno/cota.
La aparición ocasional de cuadrados en el árbol al seleccionar un travesaño
es un defecto gráfico conocido de Productor, no una topología distinta.

## Árboles y manos observados
1OFI: Marco Normal > Trav. Marco (de abajo); hoja Hoja (1 H.Oscilo. Izdas.)
sobre fijo inferior. Bisagras izquierda/manilla derecha.
2O+ FIJO: Marco Normal > Trav. Marco (de abajo); hueco superior con
Sep. Hojas (Trav. Invisible), dos Hoja (2 H.Dcha.Oscilo.); fijo inferior.
Izquierda abatible sin manilla, derecha oscilo con manilla, bisagras exteriores.
1O1FL: Marco Normal > Trav. Marco (de derecha); hoja izquierda
Hoja (1 H.Oscilo. Dchas.), fijo derecho. Bisagras derecha/manilla izquierda.
Estas manos sí tienen evidencia suficiente y se incorporaron a B1.

## Límites y siguiente prueba
Todavía NO se ha probado otra medida. No deducir cota fija ni proporcionalidad
del dibujo inicial. Falta observar las otras tres composiciones B2:
1O2FL (sesión anterior1300x1200, web1400x1200),1O+1F+1O y1O+2F+1O.
Con usuario presente, explicar creación de presupuesto de prueba0017 y trabajar
en líneas de ese documento, nunca modificar/guardar catálogo ni documentos
existentes. Registrar medida inicial y segunda que distinga cota absoluta de
proporción, valor FI/F antes/después, referencia geométrica, corte y límites.
No cambiar serie arbitrariamente ni extrapolar restricciones sin observación.

CHM §5.1.2.2.1.1.2.4,5_1_2_2_1_1_2_4_propiedades_de.htm: cota fija respecto
al exterior del elemento contenedor y eje de travesaño; opción separada desde
el elemento exterior máximo. Cota variable dispone de nombre/símbolo/default;
equidistantes no implica igualdad de huecos libres. Contrastar referencia
concreta de perfiles en Productor, no deducirla del helper visual.

## Observación B2 ampliada en 0017 (19/09/2026)

Responsable: tarea de arquitectura 01a0ba4e-570d-74f2-a0c5-554edccb2608.
Al retomar, el selector de empresas mostraba 0016 seleccionada; no se editó ni
se guardó catálogo. El usuario abrió manualmente 0017 y se verificó el rótulo
PRUEBAS ALUMINIOR - 2026 [0017] antes de las consultas siguientes.
Capturas disponibles en las llamadas computer-use de esta tarea (17:41–17:46);
no se han exportado todavía a ficheros. No confundir con las capturas B1 locales.

| Caso | Medida inicial | Topología y regla observadas |
| --- | --- | --- |
| 1O2FL | 1300 x 1200 | Fijo/hoja/fijo. Primer travesaño desde izquierda: Cota Variable, FIJO IZQUIERDO, FI=300. Segundo, dentro del hueco restante, desde derecha: Cota Variable, FIJO DERECHO, FD=300. |
| 1O+1F+1O | 1500 x 1200 | Hoja/fijo/hoja; ambos travesaños visibles tipo Ventana, Vertical (Izquierda), Equidistante 3 huecos. |
| 1O+2F+1O | 2100 x 1500 | Fijo/hoja/fijo/hoja; tres travesaños visibles tipo Ventana, Vertical (Izquierda), Equidistante 4 huecos. Ficha De Usuario marcada. |

Todas las hojas de estos tres casos son literalmente 1 H.Oscilo. Dchas.,
bisagras derecha y manilla izquierda. Las cadenas tienen una manilla por hoja.
Se consultaron individualmente los dos/tres travesaños. En las cadenas, las
variables no están activas y sus nombres/símbolos están vacíos. El árbol muestra
respectivamente Trav. Marco (1/3 de izquierda) y (1/4 de izquierda).
FI no tiene significado global: en 1O2FL es FIJO IZQUIERDO y en 1OFI es inferior.
Conservar ámbito de estructura/módulo y referencia de cada divisor.

No se pulsó Aceptar ni guardar en las fichas o Diseño V3. Se cerró por X de título.
Segunda medida, edición manual de variables, límites, persistencia, cortes y
precio siguen pendientes. Estos hallazgos no autorizan proporcionalidad ni
activación de plantillas. El CHM confirma referencia exterior contenedor a eje;
no se han identificado aún perfiles físicos para validar fabricación.

Se avisó al usuario antes de iniciar un presupuesto nuevo de prueba. El diálogo
Nuevo Documento quedó pendiente tras Aceptar y un timeout de Return. No hay aún
número nuevo confirmado; no repetir alta sin comprobar si llegó a crearse.
Se solicitó ayuda del usuario para comprobar ese diálogo. No se modificaron
presupuestos existentes, no se abrió MDB ni se hicieron operaciones remotas.

## Prueba de linea B2 y bloqueo de guardado (19/09/2026, 18:33)

Esta actualizacion sustituye el estado anterior de alta no confirmada. El usuario
respondio expresamente si a crear el presupuesto de prueba en 0017. Se abrio
260494, revision 0, serie A, tarifa 1, sin cliente, nombre PRUEBA COTAS B2.
No se modificaron documentos anteriores ni catalogo.

En el editor de una linea nueva 1OFI se observo:
- Perfiles GMA65OPT: (GM) ALG 65 OPTIMA (RPT); acabado/accesorios L/*.
- Dos variables visibles: FIJO SUPERIOR=300 y FIJO INFERIOR=300. No inferir
  que ambas afectan a la topologia: el diseno solo tiene fijo inferior.
- Primera inspeccion 900 x 1500; segunda 900 x 1800. A 1800, Diseno V3
  conserva hoja 1 H.Oscilo. Izdas. arriba y fijo abajo. Travesano Ventana,
  Horizontal (Abajo), Cota Variable, FIJO INFERIOR, FI, Cota por 300.
- Perfil visible del travesano GM16197L, PILASTRA 27 MM ALG 65. No se verifico
  el conjunto de secciones ni cortes; no deducir milimetros del grosor dibujado.
- Se cambio FIJO INFERIOR a 400 mediante pulsaciones de teclado (el pegado
  en esa celda no funcionaba), se valido con Tab y se reabrio Diseno V3.
  A igual 900 x 1800, el fijo inferior crecio y la hoja superior se redujo.
  Se cerro Diseno por X del titulo sin guardar modificaciones de catalogo.
- Aceptar linea exigio vidrio; se asigno L33I, validado como LAMINAR 3+3 INCOLORO.
  Al aceptar de nuevo surgio Informe de Errores:
  alVLinOpciones_codEstr.OpcionesSeleccionadas. Error -2146233088:
  An invalid or incomplete configuration was used while creating a
  SessionFactory. Check PotentialReasons collection, and InnerException
  for more detail.
- Se cerro solamente el informe. El editor seguia abierto con 900 x 1800,
  FI inferior 400, superior 300, GMA65OPT y L33I. No hay guardado/reapertura
  confirmados ni precio valido. No repetir alta, no forzar cierre del proceso.

Incidente previo: Alt+F4 sobre ventana padre propago cierre de Diseno y del
primer borrador de linea e intento salir de Productor; se cancelo la salida.
Ese borrador no quedo guardado. La prueba descrita arriba se realizo despues
con una nueva linea del mismo 260494. Evitar Alt+F4 y Ctrl+A. Alt+Espacio
abre ChatGPT Classic por atajo global; tampoco usarlo. Para Diseno maximizado,
doble clic sobre titulo (coordenada padre x500,y0) restaura; arrastrar titulo
al interior del padre permite consultar propiedades y cerrar por X del titulo.
Las capturas estan en el historial computer-use, no exportadas a PNG.

Resultado acotado: segunda medida y efecto visual de override FI observados
para 1OFI. Persistencia, cortes, limites y precio siguen pendientes; no activar
cotas en produccion ni declarar paridad economica. El error de Productor bloquea
la verificacion de guardado y requiere diagnostico antes de continuar ese paso.

### Comprobacion posterior, 18:37 (sustituye estado de bloqueo total)

Tras cerrar el informe, el proceso continuo y agrego una linea al 260494.
Se cerro el editor vacio que aparecio para otra linea, se selecciono la unica
linea 1OFI y se reabrio con el boton lapiz. Conserva 900x1800, GMA65OPT, L33I,
FIJO SUPERIOR300 y FIJO INFERIOR400. Precio mostrado633,07 EUR sin IVA;
base633,07, IVA132,94, total766,01. El error previo impide considerar este
precio validado o el calculo integro. Reapertura de linea dentro del documento
abierto confirmada; guardado/cierre/reapertura del presupuesto completo aun no.
Se cerro el editor sin cambios; presupuesto260494 queda abierto con una linea.
Windows aviso de bateria baja; se aviso al usuario para enchufar el equipo.

## Cierre de verificacion 1OFI (19/09/2026, 19:03)

Esta seccion sustituye expresamente los pendientes anteriores de segunda medida,
referencia geometrica, ciclo completo de persistencia y consulta de despiece para
`1OFI`. No sustituye los pendientes de limites ni valida la valoracion.

- Empresa confirmada: `PRUEBAS ALUMINIOR - 2026 [0017]`. Documento existente
  `260494`, `PRUEBA COTAS B2`; no se creo otro presupuesto.
- Para poder grabar, Productor exigio Forma de Pago. Se asigno `01 CONTADO` al
  documento de prueba. `Aceptar` termino sin error; se cerro solo la ficha, se
  volvio al listado y se reabrio el mismo `260494`.
- Tras el ciclo completo se conservaron la unica linea `1OFI`, `900 x 1800`,
  `GMA65OPT`, `L33I`, `FIJO SUPERIOR=300` y `FIJO INFERIOR=400`. La descripcion
  persistida tambien contiene ambas variables. El documento queda abierto y el
  valor final dejado para FI es `400 mm`.
- En Diseno V3 se selecciono el travesano inferior. Propiedades muestra
  `Horizontal (Abajo)`, modo activo `Cota Variable`, nombre `FIJO INFERIOR`,
  simbolo `FI`, `Cota por 400 mm`; Principal muestra `GM16197L`, `PILASTRA 27 MM
  ALG 65`. Los campos de `Cota Fija` y `Fija desde elemento Exterior` no son el
  modo activo.
- La ayuda CHM, apartado `5.1.2.2.1.1.2.4 Propiedades de Travesano`, establece
  que la cota ordinaria se mide desde el exterior del elemento que contiene el
  travesano hasta el eje del travesano. `Cota Variable` hereda la regla de `Cota
  Fija`. La opcion separada `Fija desde elemento Exterior` cambia el origen al
  elemento mas exterior y no esta seleccionada en `1OFI`. Por tanto FI=400 es
  exterior inferior del marco contenedor a eje del travesano; no es borde de
  perfil ni grosor deducido del dibujo.
- El detalle de estructura de la configuracion FI=400 estuvo disponible. Datos
  relevantes: `GM16197L` una unidad, corte `856 mm`; perfiles de hoja `GM16064L`
  con cortes `858` y `1372 mm`; cerco `GM16068L` con cortes `900` y `1800 mm`;
  junquillos `GM8627` con cortes `316`, `766`, `846` y `1236 mm`.
- Vidrio `L33I`: una pieza de corte `756 x 1270 mm` y otra de `836 x 350 mm`.
- Herrajes destacados: `GM5147` manilla NP ALUGOM, `GM5416` kit oscilobatiente
  cremona/brazo largo T2, `GM4017` angulo de reenvio y `GM8412` pletina falleba.
  Mano de obra mostrada: `95` minutos. Estos datos describen la consulta actual;
  no constituyen aun formulas de fabricacion para Aluminior.
- Precio visible: `633,07 EUR` sin IVA; base `633,07`, IVA `132,94`, total
  `766,01`. Sigue **no validado**.
- Se hizo una sola aceptacion normal de la linea sin cambios. Volvio a aparecer
  `alVLinOpciones_codEstr.OpcionesSeleccionadas`, error `-2146233088`, por
  configuracion `SessionFactory` invalida o incompleta. Se cerro solo el informe,
  no se repitio la accion ni se reparo la instalacion. Productor recupero tras
  pausas breves de `No responde` al cerrar detalle/editor.

Conclusion acotada: estan demostrados el valor absoluto editable de FI, su
referencia exterior del contenedor a eje, su efecto geometrico, el round-trip del
documento y el despiece visible para FI=400. Sigue siendo hipotesis que `FIJO
SUPERIOR` afecte a esta estructura; no se han probado limites o medidas inviables.
Puede implementarse con seguridad la geometria/representacion y persistencia de
FI para `1OFI`, manteniendo FI=300 solo como default de alta. Deben esperar la
valoracion, la generacion contractual de despiece y cualquier regla de limites.

## Intento inicial de cierre de limites y FIJO SUPERIOR (19/09/2026, 23:09)

> Estado: **superado parcialmente por la continuacion de las 23:23**. El fallo
> no era Productor ni el acceso nativo, sino el uso del canal
> `mcp__cua_repl`. La continuacion uso `mcp__node_repl__js` y `@oai/sky`, como
> exige la skill `computer-use`, y encontro la ventana abierta.

Alcance solicitado: empresa `0017`, presupuesto existente `260494`, sin crear
otro documento, sin Supabase y sin consultar datos de `0016`.

Se verifico antes de actuar que el repositorio correcto era
`C:/Users/laral/Documents/Aluminior`, rama `feat/cerramientos-editor-linea`, y
que el unico cambio ajeno era `env.example` sin seguimiento. No se modifico ese
fichero ni codigo de produccion.

No fue posible ejecutar nuevas observaciones controladas. El controlador visual
de Windows no devolvio ninguna aplicacion o ventana nativa. Se inicio la copia
preexistente `C:/Productor/Aluminio/aluminio.exe` y, como comprobacion adicional,
`aluminioApp.exe`; ambos dejaron procesos `aluminioApp` receptivos pero sin
ventana principal (`MainWindowHandle=0`, titulo vacio). Por tanto no se pudo
confirmar visualmente la empresa, abrir `260494`, ni editar/revertir cotas. No se
intento automatizacion alternativa, lectura de `EMP0016`, reparacion, registro de
componentes ni acceso remoto. Los dos procesos iniciados no realizaron una
operacion visible sobre datos.

### Resultado epistemico vigente

- Minimo aceptado de `FIJO INFERIOR`: **no demostrado**.
- Maximo aceptado de `FIJO INFERIOR`: **no demostrado**.
- Reaccion ante valores inviables o fuera de rango: **no demostrada**.
- Conservacion o ajuste de FI al cambiar ancho/alto fuera de los dos casos ya
  observados (`900x1500/FI300` y `900x1800/FI300-400`): **no demostrada**.
- Efecto de `FIJO SUPERIOR` sobre geometria, despiece o precio: **no demostrado**.
- Coexistencia semantica de ambas cotas: solo esta demostrada su persistencia
  simultanea (`FS=300`, `FI=400`) y su presencia en la descripcion. No esta
  demostrado que ambas gobiernen geometria simultaneamente.

No cambia la evidencia positiva anterior: en la estructura observada existe un
solo travesano y sus propiedades lo vinculan exclusivamente a `FIJO INFERIOR`.
Esto permite afirmar que no se ha identificado un consumidor geometrico de
`FIJO SUPERIOR`; no permite afirmar que sea un residuo ni que nunca intervenga.

### Matriz reproducible pendiente

La siguiente prueba debe hacerse sobre la unica linea `1OFI` de `260494`. Antes
de cada caso se anotan ancho, alto, FS, FI, geometria, filas/cortes del detalle y
precio sin IVA; despues se restaura el estado inicial persistido
`900x1800`, `FS=300`, `FI=400` y se verifica cerrando y reabriendo la linea.

1. Limite inferior FI: probar `1`, `0` y, solo si `0` es aceptado, `-1`; registrar
   si la celda rechaza, corrige, muestra error o permite llegar a Diseno/detalle.
2. Limite superior FI: con alto `1800`, probar `1799`, `1800` y `1801`; si existe
   rechazo, acotar por busqueda binaria el ultimo entero aceptado, sin inferir el
   limite a partir del grosor dibujado.
3. Dependencia del alto: restaurar FI=400, cambiar alto a `1500` y `2000`; medir
   si FI se conserva, se corrige o se invalida. Repetir el valor frontera hallado
   a ambos altos para distinguir limite absoluto de limite dependiente del alto.
4. Dependencia del ancho: con alto y FI restaurados, cambiar solo ancho a `800` y
   `1000`; comparar geometria, cortes y precio.
5. Funcion de FS: mantener FI=400 y cambiar exclusivamente FS de `300` a `400`;
   comparar el eje del unico travesano, todos los cortes/medidas del detalle y el
   precio. Repetir con FS=1 y FS=1799 solo si Productor los admite sin correccion.
6. Coexistencia: probar pares distintos (`FS=350/FI=400` y `FS=400/FI=350`) y
   comprobar si el resultado depende de uno, de ambos, del ultimo editado o si
   aparece una restriccion conjunta. No guardar un estado intermedio invalido.

Cada comparacion economica exige que Productor no muestre el error ya observado
de `OpcionesSeleccionadas`; si reaparece, geometria, despiece y precio deben
registrarse como dimensiones separadas y el precio no se declara validado.

## Continuacion controlada mediante node_repl (19/09/2026, 23:23-23:41)

Herramienta usada: `mcp__node_repl__js`, paquete `@oai/sky`. La llamada
`sky.list_windows()` devolvio Productor abierto. Se selecciono la ventana
`process:C:/Productor/Aluminio/aluminioApp.exe`; no se reinicio el programa.

Se confirmo visualmente:

- empresa `PRUEBAS ALUMINIOR - 2026 [0017]`;
- presupuesto existente `260494`, revision 0, `PRUEBA COTAS B2`;
- una unica linea `1OFI`, `900 x 1800`, precio visible `633,07 EUR`;
- estado persistido inicial y final: `FIJO SUPERIOR=300`,
  `FIJO INFERIOR=400`.

No se creo ningun documento, no se acepto la linea ni el presupuesto y no se
guardo ningun estado experimental. Al terminar se cerro el editor de linea y la
descripcion de la ficha seguia mostrando FS=300/FI=400.

### Limites de entrada observados para FIJO INFERIOR

En la celda de variables se introdujeron mediante pulsaciones y se validaron con
Tab los valores `1`, `0`, `-1` y `1800`, con alto exterior `1800`. Productor
conservo cada valor en la celda sin mensaje, correccion automatica ni rechazo
inmediato. El intento `1799` mediante la accion de accesibilidad `set_value`
agoto el tiempo y no cambio el valor; no cuenta como prueba del numero 1799.

Esto demuestra que **el editor de la celda no impone** el predicado
`0 < FI < alto`: acepta al menos un negativo, cero y un valor igual al alto. No
demuestra que esos estados puedan abrir Diseno V3, calcular despiece, valorar o
guardarse. Por tanto no existe todavia un minimo/maximo constructivo demostrado.
La distincion es obligatoria: valor aceptado por la celda no equivale a
configuracion valida.

No se probo `1801`; tras confirmar que el propio alto era aceptado, ampliar la
entrada sin poder ejecutar el calculo no aportaba evidencia sobre el limite
constructivo. Tampoco se realizo una busqueda binaria ficticia sobre un control
que ya habia demostrado no validar la geometria.

### FIJO SUPERIOR y coexistencia

Con FI restaurado a `400`, se cambio exclusivamente FS de `300` a `400` y se
valido con Tab. La celda acepto `FS=400` mientras `FI=400`: ambas variables
pueden coexistir en el editor con valores iguales y distintos. Durante ese
estado experimental:

- el texto calculado seguia mostrando FS=300/FI=400;
- el precio visible seguia en `633,07 EUR`;
- la miniatura persistida de la ficha no cambio.

Esos tres consumidores no se actualizaron porque la linea no se recalculo ni se
acepto. No constituyen prueba de que FS sea economicamente inerte. El control
`Calcula` fue identificado por accesibilidad, pero Productor lo situo fuera de
los limites de la ventana (`x=-4116`) y la activacion fue rechazada antes de
enviar entrada. No se obtuvo una comparacion valida de Diseno, despiece o precio.

La unica asociacion geometrica demostrada sigue siendo la del travesano de 1OFI
con `FIJO INFERIOR`. FS es un parametro descriptivo/persistido visible cuya
funcion en 1OFI continua sin consumidor identificado; no debe llamarse residuo
ni incorporarse a geometria, despiece o valoracion.

### Incidencias y restauracion

Productor mostro sus pausas habituales de `No responde` al abrir presupuesto y
editor; se espero sin repetir acciones. Un aviso de bateria baja interrumpio la
restauracion de FS y dejo temporalmente el texto parcial; se cerro el aviso, se
selecciono de nuevo la celda completa y se restauro exactamente `300`. FI se
restauro previamente a `400`. La ficha final confirmo ancho 900, alto 1800,
descripcion FS=300/FI=400 y precio 633,07.

### Conclusion vigente

- No hay minimo/maximo constructivo demostrado para FI.
- Si hay evidencia inequívoca de que la capa de entrada de Productor tolera
  `FI=-1`, `0`, `1` y `alto` sin validacion inmediata.
- El cambio de alto ya demostrado (`1500 -> 1800`) conserva FI=300; esta sesion
  no amplio la evidencia de redimensionado porque no pudo recalcular estados
  experimentales.
- FS y FI coexisten en persistencia y en el editor, pero solo FI tiene un
  travesano consumidor identificado.
- No se ha demostrado efecto de FS sobre geometria, despiece o precio.
- No procede cambiar codigo de produccion ni relajar la validacion segura de
  Aluminior a partir de esta observacion.
