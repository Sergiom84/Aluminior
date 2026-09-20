# Evidencia: vídeo oficial de Gaia sobre presupuestos en Productor Aluminio

> Revisión documental 20/09/2026: **Evidencia fechada**. Timestamps y conceptos de Productor; no inventario del código actual.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Fuente: "Programa para Carpinterias de Aluminio PRODUCTOR aluminio", canal Gaia
Software, 20/05/2020, 30:13. `https://www.youtube.com/watch?v=DYma4OA9Bug`

Material derivado (local, fuera del repositorio):
`C:\Users\sergi\Desktop\Productor\evidencia-video-DYma4OA9Bug\`
— `transcript.md` (transcripción con marcas de tiempo, Groq whisper-large-v3),
`transcript.json` (segmentos), `frames/` (27 capturas), `productor.mp4`.

El vídeo no tiene subtítulos ni autosubtítulos. La transcripción es automática:
los números y códigos citados están verificados contra las capturas cuando
aparecen en pantalla, y se marcan como no verificados cuando no.

Este documento registra únicamente lo que el vídeo dice o muestra. No es
todavía una decisión de diseño para Aluminior.

## 1. Arquitectura de pantalla observada

- Ventana MDI. Panel izquierdo fijo de navegación con grupos colapsables:
  **Ficheros** (Clientes, Proveedores, Artículos, Estructuras, Cerramientos,
  Acabados, Asistente para Series, Asistente de Configuración), **Compras**,
  **Ventas**, **Utilidades**.
- Cada documento tiene dos vistas conmutadas por pestañas inferiores:
  **Lista** y **Ficha**. La lista muestra columnas Número, Revisión, Fecha,
  Cliente, Tarifa, Serie, Estado, Represent., Nombre Comercial cliente, y un
  expansor `+` por fila. Contador de registros abajo a la derecha
  ("18 Registros").
- Barra de acciones contextual arriba del documento. En Lista: Buscar, Editar,
  Nuevo, Emitir, Express, Revisión. En Ficha: Aceptar, Cerrar, Emitir, más una
  fila de ~13 iconos de acciones sobre el documento (coste, copia, pedido de
  materiales, albarán, factura, despunte, configuración, navegación anterior /
  siguiente, eliminar). Los iconos tienen tooltip descriptivo
  (p. ej. "Pedido de Materiales para este Presupuesto", "Emitir Registro actual").

## 2. Cabecera del presupuesto (00:53 – 02:39)

Campos observados en la Ficha:

| Campo | Comportamiento observado |
|---|---|
| Nº Presupuesto | Correlativo automático (`000011`) + campo de **Revisión** separado (`0`) |
| Fecha | Fecha de hoy por defecto |
| Serie | `A` |
| Tarifa | Numérica (`1`), etiqueta al lado (`TARIFA 1`). Hasta **8 tarifas de venta** con márgenes distintos por tipo de cliente |
| Cliente / Potencial | Radio excluyente. Lupa de búsqueda + botón de alta rápida |
| Nombre | Se rellena solo al elegir cliente, editable |
| Obra | Texto libre con desplegable de históricos. Uso real: describir la obra para localizarla ("REFORMA VIVIENDA LAGUNA") |
| Nombre Versión | Texto libre |
| F. Pago, Tipo Rem. | Con lupa |
| Estado | Desplegable (`PENDIENTE`, `ACEPTADO` visto en la lista) |
| Bloqueo | Checkbox |
| Documentos Destino | Panel informativo con trazabilidad del documento |

Hay pestañas numeradas `1 2 3 4 5 6` sobre la cabecera (páginas de campos
adicionales, no mostradas en el vídeo) y pestañas inferiores del documento:
**Presupuesto, Datos Adicionales, Plazos, Gastos**.

Alta de cliente en línea (01:41 – 02:23): abre la ficha de clientes sin salir del
presupuesto, se rellena solo lo que se quiera (nombre, dirección, móvil),
Aceptar devuelve al presupuesto con el cliente creado y asignado.

Totales al pie: Subtotal, Dto. (importe y %), Dto. p.p., Base Imponible,
Tipo IVA / I.V.A. / Req.Eq., Retención con "Ret. sin IVA / Ret. con IVA",
Total, divisa **EUR**, y botón **Precio Final...**.

## 3. Línea de estructura simple (02:44 – 08:53)

Flujo: `+` → **Escaparate** → categoría → estructura → Edición de Línea.

**Escaparate** (02:56): galería visual paginada. Panel izquierdo de categorías
observadas: CORREDERAS NO PERIMETRALES, PUERTAS CORREDERAS, CORREDERAS
PERIMETRALES, CORREDERAS ELEVABLES, CORREDERAS ESPECIALES, VENTANAS ABATIBLES,
PUERTAS ABATIBLES, FIJOS, MALLORQUINAS, FIJOS CORREDERA, FORMAS
CURVAS-INCLINADAS, PUERTAS PLEGABLES, OSCILOPARALELAS, PIVOTANTES, VAIVEN,
COMPACTOS, MOSQUITERAS, PREMARCOS DE OBRA. Rejilla 4x3 con miniatura, nombre y
**código entre corchetes** (`VENTANA CORREDERA DE DOS HOJAS [C2]`). Paginación
"Página 1 de 2" con flechas. Las estructuras se pueden modificar o crear nuevas
para reutilizarlas.

**Edición de Línea** (04:30). Estructura del diálogo:

- Cabecera: `Código` + lupa; radios de tipo de línea **Estructuras / Artículos /
  Cerramiento**; botón **Más Datos**.
- Pestañas: **Estructura / Opc. Herraje / Cargos Adic. / Acristalamiento**.
- Fila de materiales: `PERFILES` (código `ECA3300`, descripción `3300 (A-96)`),
  `VIDRIO` (`DA484` → `DOBLE`), `Acabado` (`L. BLANCO`) y `Accesorio`
  (`L. BLANCO`), cada uno con lupa. Blanco viene **predeterminado** como acabado
  de venta para ganar velocidad; se puede cambiar por búsqueda.
- Fila de medidas: `Cantidad`, `Metraje`/`UD`, `Referencia (Tipo)` (`V-1`),
  `ANCHO` y `ALTO` en **mm** (configurable a cm), `Alt. Manilla`, marca `HUECO`.
- Panel derecho: **dibujo en vivo** de la estructura y **HORAS ADICIONALES**
  con dos campos, `Fabr.` y `Coloc.`. En el vídeo se introduce la colocación
  manualmente (50 € en esta línea); la **fabricación la calcula el programa**.
- Bloque de complementos con checkbox + código + descripción + lupa + ojo
  (escaparate): **Compacto, Guía Iz., Guía De., Tapajuntas, Registro, Premarco,
  Condensac.**, más `Caj.` y `Altura` del cajón.
- Botones laterales de accesorios: **Mosquitera, Tubo / Angulo, Bandeja,
  Accesorios**.
- Área de **descripción generada** (texto multilínea, con checkbox
  `Descripción Manual`), que se rellena sola a partir de la configuración:
  `VENTANA ABATIBLE DE DOS HOJAS, UNA OSCILOBATIENTE DE MEDIDAS: ... EN COLOR
  L. BLANCO PERFILERÍA: 3300 (A-96) CRISTAL: DOBLE ACRISTALAMIENTO 4/8/4`.
- Precio: `Precio / UD`, `Dto.`, `Dto. 2`, `Total Línea`, `Tarifa` + lupa, y
  checkboxes **PVP Manual**, **%Dto. Manual**, **Tarifa Manual**.

Comportamientos concretos:

- **Altura de cajón automática** (05:05): con compacto seleccionado el programa
  propone 155; está configurado para saltar a 185 cuando el alto supera 1,60 m.
  El operador puede forzar la altura.
- **Búsqueda por descripción** (05:51 – 06:49): el diálogo de búsqueda tiene
  "Buscar en [Descripción]", segundo criterio "y en...", modo
  "Todas las palabras", y "Ordenar por el campo / luego por" + Reset. Escribir
  `100` filtra todo lo que contenga 100 en la descripción. Alternativa visual:
  el botón del ojo abre el escaparate de guías.
- **Mosquitera** (06:55): hereda por defecto el color de la ventana, con opción
  de cambiarlo. Se añade con `+` y se elige por escaparate.
- **Tubo / Ángulo** (07:39): elección de tubo/ángulo, **posición**
  (arriba, inferior, izquierda, derecha, todas) y **tipo de corte** (recto).
- Al Aceptar, la línea se añade al presupuesto y **el diálogo de Edición de
  Línea se vuelve a abrir** para seguir añadiendo estructuras sin fricción.

## 4. Cerramientos: composición de varias estructuras (09:07 – 16:09)

Definición del vídeo: cerramiento = estructuras que se fabrican por separado en
taller pero que en obra van unidas (tornillos, esquineros, uniones).

- El módulo abre un lienzo con el **mismo escaparate** abajo (categorías +
  miniaturas paginadas, "Pág. 1 / Total 3"). Las estructuras se **arrastran y
  sueltan** al lienzo y se colocan una junto a otra.
- Panel derecho: **árbol de elementos del cerramiento** con estado por elemento:
  `0 - 1PFS de 800 x 2100`, `1 - 2 de 1200 x 1200`,
  `2 - *(UNION NO CONFIG.)` en rojo. La unión sin configurar es un estado
  visible y bloqueante hasta resolverlo.
- Panel inferior con pestañas: **Elemento seleccionado / Unión / Módulo /
  Propiedades del Cerramiento / Tapajuntas**. En "Elemento seleccionado":
  Estructura (código + descripción, `1PFS PUERTA BALCONERA ABATIBLE DE UNA HOJA
  CON FIJO SUPERIOR`), Posición X/Y en mm, Ancho x Alto en mm, PERFILES, VIDRIO,
  Acabado, Aca. Acc., y los botones **Actualizar** y **Actualizar todos los
  elementos** (propaga perfilería, vidrio y color a todo el cerramiento).
- **Unión** (14:01): se elige por escaparate o lupa (`unión de cercos de 60`),
  con acabado propio, y se aplica con Actualizar.
- **Compacto por elemento** (14:27): "insertar compacto" sobre la ventana
  seleccionada, con guía izquierda y derecha propias. Se puede poner persiana
  solo en un módulo. En la puerta (alto 2100 > 1,60) el programa fuerza cajón
  **185**; después el operador iguala el de la ventana a 185 por estética.

### Editor de diseño de la estructura (11:33 – 13:56)

Se entra con el botón del triángulo. Es un editor gráfico completo:

- Panel derecho con pestañas **Elementos / Escaparate** y, dentro,
  **Marco, 1 Hoja, 2 Hojas, 3 y 4 Hojas, Mas Hojas, Plegables, Superficies,
  Accesorios**. Las superficies (cristal, panel, lamas, cuarterones...) se
  arrastran al hueco. Existe **"Añadir a Todos los Huecos"**.
- Al pinchar un hueco se puede **quitar el cristal** (queda sin cristal ni
  junquillo) y arrastrar otra apertura (p. ej. ventanillo basculante).
- Al pinchar el **marco**: el programa indica qué perfil está cogiendo
  (`marco de puerta`) y permite cambiarlo a `marco normal`, `marco con solape`,
  **actualizando el dibujo en vivo**. En **avanzada** se puede **quitar el marco
  inferior** (puerta de paso).
- Al pinchar la **hoja**: tipo de hoja (`hoja de puerta`), y la hoja inferior
  puede cambiarse a **zócalo inferior**.
- **Travesaño / manguetón** dibujado a mano alzada. Propiedades:
  **Equidistante** a N huecos, **Cota Fija** (mm), **Fija desde elemento
  Exterior** (mm exterior = mm interior), **Cota Variable**, más
  Nombre / Símbolo / Cota por Def. La pestaña **Posición** ofrece cuatro
  variantes gráficas: Horizontal (Arriba), Horizontal (Abajo), Vertical
  (Izquierda), Vertical (Derecha).
- Se elige el perfil concreto del travesaño (`manguetón central de 140`, no
  pilastra de ventana).
- **Botón derecho → "añadir y dividir a todo"** rellena los nuevos huecos con
  el cristal ya configurado.
- Barra inferior: `Cursor 1827 : 1356`, cotas, **Recalcular Dimensiones**,
  **Propiedades Estructura**, `1/2`, **Mostrar/Ocultar Propiedades**.
- Se cierra con **Grabar Diseño**.

Al grabar el cerramiento el programa **exige una descripción** y ofrece
**"insertar descripción automática"** generada del producto configurado. Después
se añade la **colocación en obra** con un botón dedicado (150 € en el ejemplo).

Resultado en el presupuesto: la línea del cerramiento aparece con artículo
**`GRUPO`** (frente a `20` de la estructura suelta y `ECM001` de la mosquitera).
Esto confirma el modelo de línea agregada que ya usa Aluminior.

## 5. Línea de artículo suelto (16:21 – 16:46)

Mosquitera vendida sin ventana: ojo → sección MOSQUITERAS → aceptar → color
blanco → **Cantidad 2** → 1500 x 1500. La línea sale con código `ECM001`,
cantidad 2 y total = 2 x precio unitario.

Presupuesto resultante (17:05, acabado blanco, tarifa 1):

| Artículo | Descripción | Cdad. | Ancho | Alto | Precio | Total |
|---|---|---|---|---|---|---|
| 20 | VENTANA ABATIBLE DE DOS HOJAS, UNA OSCILO... (`V-1`) | 1,00 | 1.200 | 1.500 | 635,57 | 635,57 |
| GRUPO | PUERTA BALCONERA ABATIBLE DE UNA HOJA CON FIJO | 1,00 | 1.880 | 1.915 | 1.068,95 | 1.068,95 |
| ECM001 | MOSQUITERA ENROLLABLE DE MEDIDAS: 150,0 x 150,0 | 2,00 | 1.500 | 1.500 | 76,52 | 153,04 |

Subtotal 1.857,56 · IVA 21% = 390,09 · **Total 2.247,65 EUR**.

## 6. Emisión al cliente (16:49 – 17:31)

**Emitir → por pantalla → formato con dibujos**. Vista previa imprimible y
exportable, con logotipo y datos del taller. El dibujo de cada línea sale en el
color real: en la revisión en madera el dibujo aparece marrón (28:01) para que
el cliente vea el acabado presupuestado.

## 7. Coste y margen (17:44 – 19:25)

Diálogo **Informe de coste** con botón **Actualizar** (el coste no se recalcula
solo; hay que pedirlo tras cada cambio).

- Rejilla por familia: **ACCESORIOS, COMPACTOS, MANO DE OBRA, MOSQUITERAS
  ENROL., PERFILES, VIDRIOS**, con columnas Coste, Venta, Beneficio, %Coste,
  %Venta, y fila TOTALES.
- **Opciones de Cálculo del Coste**: `Coste Mínimo` / `Coste Máximo` /
  `Proveedor Habitual` / `Coste del Proveedor...`, checkbox
  **Restar Descuento del Proveedor**, y `Precio de Compra sin gastos` vs
  `Precio de Coste con gastos`. Filtros por Proveedor y Periodo.
- Pestañas de cálculo: **Cálculo / Mostrar / Recalcular / Opciones**.
- Informes: **Coste Detallado, Coste Resumido, Coste por Línea,
  Perfilería (Kg), Perfilería (dm3)**. Utilidades: **Valora componentes**,
  **Compactos**.
- Resultado: **Margen Beneficio s/Coste** y **Margen Beneficio s/Venta**, con
  pestañas Resultado / Recalcular Margen / Aumentar/Disminuir.
- Pestañas inferiores: **Coste, Descuentos Adicionales, Proveedor, Detalle
  Coste, Coste Almacenado, Informe Despunte**.

**Coste detallado** (18:12), verificado en pantalla: agrupado por familia, con
`Artículo, Descripción, Acabado/Ton, Metraje, Prov. - Tar. - %Dto - Coste`.
Perfiles del ejemplo: proveedor `00154`, **35% de descuento** en todas las
líneas, TOTAL FAMILIA PERFILES **311,72**; ACCESORIOS **218,51**. Los perfiles
se miden en **ML** y los accesorios en **UD**.

Según la narración (no verificado en captura): vidrio y compactos contemplan
**metraje mínimo y múltiplos de facturación de ancho y alto** del proveedor;
mano de obra de taller **375 minutos**; **200 €** de colocación manual
(150 + 50); coste total **1.175 €** frente a venta **1.857 €**, beneficio
**682 €**.

## 8. Copia con cambio masivo de acabado, serie y vidrio (19:36 – 22:22)

Este es el mecanismo que el vídeo destaca como mayor ahorro de tiempo.

Diálogo **Copia de Presupuesto**:

- **Número de Documento Destino**: Número + **Revisión** + Serie. Si no se indica
  número, propone el siguiente (12); la práctica del operador es conservar el
  **mismo número** y subir la **revisión** (11 rev. 0 → 11 rev. 1).
- Pestaña **Modificaciones Diseño**: tres pares `Cambiar Serie → por Serie`,
  tres pares `Cambiar Vidrio → por Vidrio`, `Acab. Acces. → por Acab.` y
  `Acab. Madera → por Acab.`, todos con lupa. Columna izquierda = lo que hay en
  el origen, derecha = lo que se quiere. **Lo que se deja vacío se conserva.**
  Se pueden introducir códigos directamente (más rápido que la lupa).
- Pestañas **Modificaciones** y **Selección de Líneas** (permite aplicar el
  cambio solo a algunas líneas; en el ejemplo se aplica a todo).
- **Opciones → Detalle de estructuras**: `Copiar actual` / **`Generar nuevo`** /
  `Anular`, más checkboxes **Volver a generar la descripción de cada Línea**,
  **Volver a generar los dibujos de cada Línea**, `Copiar cobros a cuenta`,
  `Actualizar Tipo de IVA`, `Actualizar Descuento`, `Desbloquear presupuesto`,
  `Copiar dirección de entrega`.
- Barra de **Estado / Progreso** durante la generación.

Ejemplo del vídeo: serie 3300 → **3900 con rotura de puente térmico**, vidrio
484 → 4164, accesorios blanco → negro, todo en color madera. El presupuesto
completo se regenera con dibujos y descripciones nuevos.

## 9. Despunte / retal (22:24 – 24:10)

Se accede desde **Gastos** o desde el diálogo **Cálculo de Despunte de un
Presupuesto**, con pestañas **Cálculo / Detalle Resultado**:

- **Configuración**: `Longitud Aprovechable` (mm), checkbox
  `Seleccionar Longitud de Barra`, **Modo de repercusión**:
  `Repartir entre las líneas` o `Insertar en línea aparte`.
- **Ejecutar cálculo**: botón **Barras Completas** o
  `Usar Longitud Aprovechable: General / Por Perfil`.
- Mismas **Opciones de Cálculo del Coste** que el informe de coste
  (Coste Mínimo/Máximo/Proveedor) y **Tipo de Coste (Gastos)**.
- Opción `Incluir artículos por M2 (necesario Optimizador M2)`.
- **Resultados**: `Coste del Presupuesto (Perfiles y cortes)`,
  `Coste del Presupuesto (Barras y Paneles)`, `ML Barras`,
  **`Importe total Despunte`**.

Motivo de negocio declarado: en color madera el retal es difícil de reaprovechar,
así que se factura al cliente a precio de coste. Cifras narradas (no verificadas
en captura): perfil necesario 765 €, pedido real al proveedor 1.375 €, retal
**609 €**; tras aceptar aparece como **"gasto indirecto de despunte 609,32"** en
la página 2 del coste detallado. Tras cargarlo hay que **volver a pulsar
Actualizar** en el informe de coste.

## 10. Documentos de producción (24:10 – 27:45)

Botón del disco de corte → **Documentos de producción**, con casillas para
imprimir **Hoja de Corte** (con optimización en metro lineal) y **Hoja de
Producción**. Ambas se pueden emitir a la vez.

### Hoja de Corte (verificada, 24:50)

Cabecera: logo y datos del taller, Fecha Impresión, **Presupuesto: 000011-1**
(número-revisión), Página x de 3, código y nombre de cliente, Obra,
`Varios Doc.`. Primero un **Resumen de barras**:

| Artículo - Acabado | Largo Barra | Barras | Metros | %Opt |
|---|---|---|---|---|
| EC2348 SOLAPA 40 MM EUR. - MADERA | 6.400 | 1 | 6,40 | 81,23% |
| EC3338 JUNQUILLO RECTO 20 MM. - MADERA | 6.300 | 3 | 18,90 | 92,26% |
| EC3366 ACOPLE MANGUETON - MADERA | 6.300 | 1 | 6,30 | 9,40% |
| EC3900 CERCO VENTANA - MADERA | 6.300 | 3 | 18,90 | 73,29% |
| EC3903 ACOPLE INVERSORA - MADERA | 6.300 | 1 | 6,30 | 34,63% |
| EC3910 HOJA VENTANA - MADERA | 6.300 | 3 | 18,90 | 80,78% |
| EC3955 HOJA PUERTA - MADERA | 6.300 | 1 | 6,30 | 62,17% |

Cada fila lleva el **pictograma de sección del perfil**. Después desglosa barra
a barra cómo cortar, con el **retal sobrante** (ej. 32 mm en el primer
junquillo) y la **posición del palo** referida a la `Referencia (Tipo)` de la
línea: "palo inferior de la V1, palo superior, palo derecho, palo izquierdo".
Las estructuras sin referencia tipo no aparecen identificadas — el vídeo lo
señala como una buena práctica del operador, no como una limitación.

Parámetros de corte configurados en el ejemplo: **saneamiento de punta inicial
30 mm, final 30 mm, grosor de disco 7 mm en inglete y 5 mm en corte recto**.

### Hoja de Producción (verificada, 26:42)

Cabecera más completa: Fecha de Impresión, Presupuesto `000011-1`, **Fecha
Presupuesto, Fecha Aceptación, Fecha prev. Montaje, Usuario**, Obra, Varios
Presupuestos, Página 1 / 8. Lleva **código de barras** del documento.

Se organiza **por estructura** (`Estructura: 1 / 5`), y por cada una:
miniatura acotada del dibujo, `Referencia: V-1`, `Cod. Artículo`, Descripción
generada completa, `Alt.Man`, `Cantidad`, `Color: K - MADERA`,
**Medidas Marco** (105,7 x 134,2) y **Hueco** (120,0 x 150,0).

Tabla de despiece con columnas `Artículo, Descripción, Aca., Cdad., Ancho,
Largo, I - D, Pvc, Func.Pos.` — donde `I - D` es el **tipo de corte por
extremo** con notación gráfica (`| - |` recto-recto, `/ - \` inglete),
`Pvc` marca refuerzo/posición (`MV`, `MH`, `BT`) y `Func.Pos.` la posición
funcional (`L` / `A`).

**Código de color con significado**: las filas **granate** son palos
horizontales (al ancho), las **negras** son palos verticales (al alto).

Diferencia clave frente a la hoja de corte: la de producción **incluye
accesorios, medidas de cristales, medidas de persianas, tubos y solapes**, y
agrupa el material por estructura a fabricar. La de corte optimiza barras.

## 11. Resto del ciclo documental (28:14 – 29:14)

- **Pedido de materiales**: genera **un pedido por proveedor** que interviene en
  la obra (perfil, accesorios, cristalería, persianas).
- **Albarán** de entrega y, a partir del albarán, **factura**.
- **Importe manual por línea** para encarecer o abaratar puntualmente, y
  **Precio Final** para fijar el importe global de todas las líneas.

## 12. Contraste con Aluminior

Confirmado por el vídeo (coincide con lo ya implementado o decidido):

- Cabecera mínima y entrada inmediata al configurador.
- Cerramiento como **una sola línea agregada** con artículo `GRUPO`, dibujo,
  descripción generada, medidas y precio.
- **Fabricación calculada, colocación manual** por línea. El vídeo muestra que
  la fabricación sale de minutos de taller (375 min en el ejemplo) y la
  colocación se teclea a mano (50 € y 150 €). Encaja con `SPEC-MANO-DE-OBRA.md`.
- Búsqueda por fragmentos de descripción como patrón general, no solo en
  clientes.
- Descuento de proveedor (35%) aplicado por línea de coste.

Diferencias / huecos a revisar en Aluminior:

- **Revisión de documento** como campo de primer nivel (número + revisión), con
  la práctica de conservar número y subir revisión.
- **Copia con sustitución masiva** de serie / vidrio / acabados y regeneración
  de descripciones y dibujos. Es la función que el vídeo presenta como el mayor
  ahorro de tiempo real del taller.
- **Despunte** como gasto calculado por optimización, con dos modos de
  repercusión (repartir entre líneas o línea aparte).
- **Hoja de corte vs hoja de producción** como dos documentos distintos con
  contenidos distintos, no dos vistas del mismo.
- **Hasta 8 tarifas de venta** por tipo de cliente.
- Editor de diseño con travesaños por cota (equidistante / cota fija / desde
  exterior) y cambio de tipo de marco y hoja con redibujo en vivo.
- Salto automático de altura de cajón por umbral de alto (155 → 185 a 1,60 m),
  forzable por el operador.
- Metraje mínimo y múltiplos de facturación en vidrio y compactos.

## 13. Límites de esta evidencia

- Es un vídeo comercial de 2020 sobre **una** ruta feliz: presupuesto de venta.
  No cubre compras, stock, series, configuración, ni la mayoría de los ficheros.
- Las cifras que solo se narran (765 / 1.375 / 609 €, 1.175 / 1.857 / 682 €,
  375 min) proceden de transcripción automática y **no** están verificadas
  contra captura.
- No hay atajos de teclado visibles en ningún momento: todo el flujo del vídeo
  es de ratón.
