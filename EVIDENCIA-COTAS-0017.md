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
