# Reconocimiento: cerramientos en Productor Aluminio

Fecha: 2026-09-19. Empresa **0017 PRUEBAS ALUMINIOR** (copia de la 0016).
Observación en vivo con control de escritorio y ayuda de Sergio para los
arrastres. Sin datos de clientes. Presupuesto de prueba: **260492**
(Nombre `PRUEBA CERR`, Obra `RECON`).

Estado de la evidencia: **observado** salvo donde pone HIPÓTESIS o PENDIENTE.

## 1. Secuencia observada

1. Lista de presupuestos → `Nuevo` → diálogo `Nuevo Documento` (Fecha,
   Delegación, Cliente, Potencial, Tipo Documento, Divisa `EUR`, Serie,
   Número, Observaciones del Cliente; botones `Aceptar`, `Cerrar`,
   `Riesgo Cliente`). Aceptar sin cliente es válido.
2. La ficha (`Presupuestos de Clientes. Detalle`) se abre ya numerada
   (`260492`, revisión `0`). El número se asigna al aceptar el diálogo.
3. Botón `+` de `Operaciones sobre la Línea` → ventana modal
   `Edición de Línea` (Código con lupa, radios `Estructuras` / `Artículos`,
   botón `Cerramiento`, `Aceptar` deshabilitado, `Cerrar`, casilla `n.r.`).
4. `Cerramiento` → se abre el MDI hijo **`Diseño de Cerramientos V2.1`**
   maximizado, sustituyendo a la ventana de edición de línea. Tarda ~10 s.
5. **Al pulsar `Cerramiento` Productor graba inmediatamente una línea
   `GRUPO` vacía** en el presupuesto: Artículo `GRUPO`, Acabado `UNI`,
   Cdad `1,00`, Ancho `0`, Alto `0`, Precio `0,00`, Dto `0,000`,
   Total `0,00`. Verificado leyendo la MDB de la 0017 en solo lectura y al
   reabrir la ficha tras un cierre inesperado de Productor.
6. El diseño en curso también persiste: tras el cierre, editar la línea
   `GRUPO` reabrió el diseñador con la estructura ya colocada.
7. Editar la línea `GRUPO` (lápiz, tooltip `ENTER: Editar la línea actual
   del Pedido`) abre **directamente el diseñador**, sin pasar por
   `Edición de Línea`.
8. Con una línea `GRUPO` en la rejilla, el botón `Agrupa` pasa a
   **`Det.Grupo`** y `Det.Estructura` queda deshabilitado.

## 2. Diseño de Cerramientos V2.1: estructura de pantalla

- **Barra superior** (izquierda a derecha): Nuevo (icono hoja),
  `Cargar un Cerramiento` (lupa), Grabar (disquete), icono deshabilitado,
  **`Aceptar`** (verde, grande), `Escaparate de ventanas` (ojo; alterna el
  panel inferior entre escaparate y propiedades), botón de panel de
  propiedades, tres iconos de vista/inserción (PENDIENTE: tooltips no
  capturados), `Ancho` mm x `Alto` mm (totales del conjunto), campo de
  cursor en mm (`X : Y`), y a la derecha zoom `ajustar`, `acercar`,
  `alejar`.
- **Lienzo** central blanco con el dibujo a escala. El elemento
  seleccionado se resalta con fondo azul.
- **Árbol de elementos** a la derecha: una fila por elemento
  (`0 - 2 de 1200 x 1200` = índice, código de estructura, medidas). En
  algunas repintadas solo muestra las casillas sin texto (defecto visual).
- **Panel inferior** en modo escaparate: lista de categorías a la izquierda
  y rejilla de 4 miniaturas con paginación `<<` / `>>`, `Pág.` y `Total`.

### Categorías del escaparate observadas (orden)

VENTANAS CORREDERAS 90, PUERTAS CORREDERAS 90º, CORREDERAS PERIMETRALES,
VENTANAS ABATIBLES (11 páginas), OSCILOBATIENTES, PUERTAS BALCONERAS
PRACTICABLES, PUERTAS DE CALLE, FIJOS ABATIBLES (2 páginas),
MALLORQUINAS, y más por debajo (PENDIENTE: desplazar la lista).
VENTANAS CORREDERAS 90 tiene 5 páginas.

## 3. Composición: arrastrar y anclar

- Las estructuras se añaden **arrastrando** la miniatura al lienzo. La
  primera se coloca en el origen con su medida por defecto (la ventana
  de dos hojas entra a 1200 x 1200).
- **Puntos verdes de anclaje**: durante el arrastre se marcan las esquinas
  libres del conjunto (arriba-izquierda y abajo-izquierda de cada pieza y
  arriba-derecha de la última). La pieza nueva se pega al punto de anclaje
  al que se suelta.
  Soltar en zona vacía no añade nada.
- El conjunto de prueba quedó en `Ancho 2420 x Alto 1200` con un fijo de
  1 hueco y un fijo de 4 huecos (añadidos por Sergio a mano). La
  diferencia de 20 mm sobre 2 x 1200 corresponde a la unión (HIPÓTESIS
  hasta ver la pestaña Unión).
- La posición no se edita a mano: `Posición X` / `Y` están bloqueadas en
  `Elemento seleccionado`. La ubicación sale del anclaje.
- Para quitar una pieza: botón papelera `Eliminar el Elemento
  Seleccionado` → confirmación `¿ Desea eliminar el Elemento
  seleccionado ?` (`Sí` / `No`).
- **El borrado es en cascada**: al eliminar una pieza se eliminan también
  las piezas ancladas a ella y sus uniones, sin aviso adicional. Observado:
  borrar un fijo superpuesto en el origen se llevó el fijo de 4 huecos
  anclado a su derecha y la unión entre ambos.
- Las piezas pueden quedar **superpuestas** si se sueltan en el mismo punto
  de anclaje; Productor no lo impide ni avisa.
- Cada unión es un **elemento propio** del árbol (fila adicional tras las
  estructuras que une). El árbol lista en orden de inserción: estructuras y
  uniones.

## 4. Pestañas del panel inferior (modo propiedades)

Visibles al seleccionar un elemento (clic en el lienzo o en el árbol):
`Elemento seleccionado`, `Unión`, `Módulo`, `Propiedades del Cerramiento`,
`Tapajuntas`. Con un solo elemento, `Unión` y `Tapajuntas` están
deshabilitadas.

### Elemento seleccionado

| Campo | Control | Observado |
|---|---|---|
| Estructura | código (solo lectura) + descripción azul | `2` VENTANA ABATIBLE DE DOS HOJAS; `0` FIJO DE 1 HUECO |
| Posición X / Y | numérico mm, bloqueado | 0 / 0 |
| Ancho x Alto | numérico mm, editable | 1200 x 1200; editar Ancho y `Actualizar` redimensiona |
| PERFILES | código + lupa | vacío en piezas recién añadidas |
| VIDRIO | botón `Seleccionar la Tabla de Acristalamiento` + código + botón de patrón + lupa | vacío |
| Acabado | dos códigos con lupa | vacíos |
| Aca. Acc. | dos códigos con lupa | `UNI` / `*`; texto `UNICO` tras actualizar |
| Muestras de color | dos cuadros (blanco / naranja) + etiqueta `HUECO` | |
| Iconos a la derecha | editor de diseño (triángulo), lápiz, casillas, `P` verde (solo en el fijo), papelera | tooltips PENDIENTE salvo papelera |
| `Actualizar` | botón | aplica al elemento |
| `Actualizar todos los elementos` | botón | propaga a todo el conjunto |

### Módulo

`Nº Módulo` (1), `Ancho` x `Alto` mm, `Referencia (Tipo)`.

### Propiedades del Cerramiento

`Código`, `Cantidad` (1), `Referencia (Tipo)`, `Descripción` multilínea,
casilla `Descripción Manual`, botón `Insertar Descripción Automática`,
recuadro `Horas Adicionales` con botón `€`, `Fabricación` (0) y
`Colocación` (0).

### Unión

Se habilita al seleccionar el elemento unión (clic en la franja entre
piezas o en su fila del árbol).

| Campo | Control | Observado |
|---|---|---|
| Unión | código + lupa + desplegable con descripción + botón ojo | vacío al crearse |
| Acabado | dos códigos con lupa | vacíos |
| `Longitud de la unión Manual` | casilla | desmarcada |
| Longitud | numérico mm | 1200 (alto común) |
| Grosor | numérico mm, bloqueado | 20 sin artículo; 60 con GMU038 |
| Tipo de Unión | dos iconos (variantes gráficas) | PENDIENTE significado |
| Vista previa | recuadro a la derecha + casilla | |
| `Actualizar todas las uniones` / `Actualizar` | botones | |

- El **desplegable** lista: `(GM) TUBO 40x40`, `(GM) TUBO 40x60 (Dto: 40)`,
  `(GM) TUBO 40x60 (Dto: 60)`, `(GM) TUBO 60x60`, `(PS) ESQUINERO PARA
  COMPACTO` (+ `CON SUPLEMENTO`, `RPT`, `RPT CON SUPLEMENTO`),
  `(PS) H UNION PARA COMPACTOS 100mm`, `100mm RPT`, `120mm`, `120mm RPT`,
  `90mm RPT`, `SIN UNION`.
- El **ojo** abre una ventana modal `Escaparate` titulada `UNIONES`,
  `Página 1 de 2`, con flechas, rejilla 4 x 3 de dibujos técnicos y rótulo
  `(familia) descripción [código]`: GMU038 TUBO 60x60, GMU039 TUBO 40x40,
  GMU040 TUBO 40x60 (Dto: 40), GMU041 TUBO 40x60 (Dto: 60), PSU001 H UNION
  COMPACTOS 100mm, PSU002 120mm, PSU003 90mm RPT, PSU004 100mm RPT, PSU005
  120mm RPT, PSU006 ESQUINERO PARA COMPACTO, PSU007 ESQUINERO RPT, PSU008
  ESQUINERO CON SUPLEMENTO. Los tubos GM no tienen dibujo.
- Doble clic en una unión del escaparate la asigna y cierra el escaparate;
  el código y el grosor se rellenan solos.
- La lupa junto al código no abrió nada en esta sesión (PENDIENTE).
- **Efecto en el ancho total**: 1200 + 1200 con unión sin artículo
  (grosor 20) → `Ancho 2420`; con GMU038 (grosor 60) → `Ancho 2400`. El tubo
  de 60 no suma al total. HIPÓTESIS: el tubo va solapado sobre los cercos y
  su grosor no desplaza las piezas; el grosor 20 por defecto sí las separa.

- Tras asignar serie (GMA65OPT) el total pasó a `Ancho 2390` y el fijo de
  4 huecos quedó en `Ancho 1170` dentro del editor de diseño: la unión de
  60 descuenta medio grosor (30 mm) de la pieza contigua. HIPÓTESIS sobre
  la regla exacta de reparto; observado el resultado.

### Tapajuntas

Deshabilitada en todos los casos observados (con dos fijos y una unión
GMU038). PENDIENTE: qué la habilita.

### Asignación de perfiles, vidrio y acabado

- `PERFILES` lupa → ventana `Búsqueda` a pantalla completa: `Buscar en`
  (campo + texto), `y en ...`, `Ordenar por el campo` / `luego por`,
  `Todas las palabras`, `Reset`, rejilla `Codigo` / `Descripcion` /
  `DescripcionVentas`, botones `Aceptar` / `Cerrar`. Series tipo
  `GMA65OPT (GM) ALG 65 OPTIMA (RPT)`.
- `VIDRIO` lupa → `Busqueda de Vidrios`, misma plantilla (p. ej. `L33I
  LAMINAR 3+3 INCOLORO`, `SV04 SIN VIDRIO 4MM`, `PAN16 PANEL SANDWICH`).
- `Acabado` lupa → diálogo `Búsqueda` pequeño (`Codigo` / `Descripcion` /
  `Observaciones`, `N Registros`, `# Máximo 100`, `Aceptar`). Desde el
  elemento lista 13 acabados; desde la unión 18 (incluye `*` comodín, `AN`,
  `AVS`). Tras elegir, la segunda casilla se rellena con `*` y aparece el
  nombre (`L. BLANCO`).
- `Actualizar todos los elementos` propagó serie, vidrio y acabado del
  elemento activo al resto de estructuras (no a la unión, que tiene su
  propio acabado).

## 4 bis. Editor de diseño del componente (`Diseño V3`)

Se abre con el icono triángulo `Modificar el Diseño del Componente` de
`Elemento seleccionado`. Es una **ventana independiente** `Diseño V3`, no
un MDI hijo.

- Barra: `Aceptar`, disquete `Guardar el Diseño actual en una estructura`,
  **X roja = eliminar el elemento seleccionado del diseño** (no es
  cancelar; borró un vidrio sin confirmar), cuadrado, varita, dos iconos
  de hojas, arco, reguladores. Resto de tooltips PENDIENTE (no se mostraron).
  Zoom a la derecha.
- Panel derecho superior: pestañas `Elementos` / `Escaparate`.
  - `Elementos`: árbol del componente (`Marco Normal` › `Trav. Marco (1/2
    de arriba)` › `Hueco` › `Trav. Marco (1/2 de izquierda)` › `Hueco` ›
    `Vidrio`...). A veces se repinta como bloques grises sin texto.
  - `Escaparate`: pestañas `Marco`, `1 Hoja`, `2 Hojas`, `3 y 4 Hojas`,
    `Mas Hojas`, `Plegables`, `Superficies`, `Accesorios`; `Marco` ofrece 8
    variantes de marco dibujadas.
- Panel derecho inferior: propiedades del nodo seleccionado.
  - Sin selección, pestaña `Estructura`: `Ancho` / `Alto` mm, `Perfiles`,
    `Vidrio`, `Acabado` (x2), `Accesorio` (x2), vacíos aunque el elemento del
    cerramiento sí los tenga (se heredan).
  - `Marco` › `Principal`: `Tipo Marco` con combo `Iguales` y lista `Normal`,
    `Solape`, `Ventana (A)`, `Puerta (A)`, `Zocalo (A)`, `Solape Puerta (A)`…;
    `Marco Inferior` (`Marco normal`); `Elemento` (sección dibujada);
    `Perfiles Ref.` (`GM16068L CERCO 27 ALG 65`); `Otros Perfiles...` con
    paginador; `Tipo de Corte` con casilla `Iguales` y cortes por lado 1-4.
  - `Marco` › `Avanzada`: casillas `Marco Inferior`, `Marco Superior`,
    `Marco Izquierdo`, `Marco Derecho` (quitar el inferior = puerta de paso),
    `Perfil Adicional Marco Superior`, `Incremento Marco` mm.
  - `Travesaño` › `Principal`: `Tipo Travesaño` (`Ventana`, `Puerta (A)`,
    `Zocalo (A)`), `Perfiles travesaños de MARCO` (`GM16197L PILASTRA 27 MM
    ALG 65`), `Otros Perfiles...`.
  - `Travesaño` › `Posicion`: cuatro radios gráficos `Horizontal (Arriba)`,
    `Horizontal (Abajo)`, `Vertical (Izquierda)`, `Vertical (Derecha)`;
    `Propiedades`: `Equidistante` `+` / `-` N `huecos`, `Cota Fija` mm,
    `Fija desde elemento Exterior` mm = mm interior, `Cota Variable`
    (`Nombre`, `Símbolo`, `Cota por` mm).
  - `Vidrio` › `Principal`: `Vidrio` (código + patrón + lupa), `Acabado`,
    botón `Genérico`, muestra de color; pestaña `Avanzada`.
- Barra inferior: `Cursor X : Y`, dos cotas, `Recalcular Dimensiones`,
  `Propiedades Estructura`, campo, `Mostrar/Ocultar Propiedades`.
- Cerrar la ventana con la X del título **descarta los cambios sin
  preguntar** (el vidrio borrado volvió a aparecer).

## 4 ter. Descripción, horas y colocación

- `Insertar Descripción Automática` (con la serie aún sin propagar) generó
  solo el **primer elemento**: `FIJO DE 1 HUECO DE MEDIDAS : 1.200,0 x
  1.200,0` / `EN COLOR`.
- Al pulsar `Aceptar` la descripción se **regenera sola** con serie,
  acabado y vidrio, y ahora incluye cada estructura en su propio bloque
  separado por una línea en blanco:

  ```
  FIJO DE 1 HUECO DE MEDIDAS : 1.200,0 x 1.200,0
  EN COLOR L. BLANCO
  ALG 65 OPTIMA (RPT)
  LAMINAR 3+3 INCOLORO

  FIJO DE 4 HUECOS (2X2) DE MEDIDAS : 1.200,0 x 1.200,0
  EN COLOR L. BLANCO
  ALG 65 OPTIMA (RPT)
  LAMINAR 3+3 INCOLORO
  ```

  Las medidas del texto son las nominales (1200) aunque las piezas se
  fabriquen a 1170. La unión no aparece en la descripción.
  No apareció diálogo de descripción obligatoria porque ya había texto.
  PENDIENTE: aceptar con la descripción vacía.
- **Colocación**: no es un botón aparte en este diseñador. Se introduce en
  `Horas Adicionales` › botón `€` (tooltip `Calcular Horas a partir de
  Importe`) → ventana flotante sin título `Cálculo de Horas Adicionales
  introduciendo Importe` / `Indique Importes`, columnas importe y `Horas:`
  para `Fabricación` y `Colocación`. 150 € de colocación → **5 horas**
  (30 €/h, precio de minuto 0,50). Se cierra con `Enter` en la columna de
  horas; `Esc` no la cierra. El resultado queda en `Colocación 5`.
- `Aceptar` muestra una barra `Generando` en la barra superior durante
  ~40 s y vuelve a la ficha del presupuesto, ya grabada (`Aceptar` de la
  ficha queda deshabilitado).

## 4 quater. Resultado en el presupuesto

Rejilla de líneas:

| Artículo | Descripción | Acabado | Cdad. | Ancho | Alto | Precio | Dto | Total | Dibujo |
|---|---|---|---|---|---|---|---|---|---|
| `GRUPO` | primeras 4 líneas del texto (primer elemento) | `UNI` | 1,00 | 2.400 | 1.200 | 761,57 | 0,000 | 761,57 | miniatura del conjunto |

- El acabado de la línea `GRUPO` es `UNI` aunque todos los componentes
  sean `L`.
- `Ancho 2.400` = 1170 + 60 + 1170 (la unión suma su grosor completo aquí,
  mientras que el diseñador mostraba 2390).
- Totales: `Subtotal 761,57`, `Base Imponible 761,57`, `Tipo IVA 4`,
  `I.V.A. 21,00 % 159,93`, `Total 921,50`, `EUR`.

### `Det.Grupo` → ventana `Modificar un Grupo`

MDI hijo con `Referencia`, `Descripción` completa (texto de arriba),
miniatura, rejilla `Líneas que componen el Grupo`, botones `Desagrupar` y
`Det. Estructura`, pestañas `Detalle` / `Utilidades` (deshabilitada),
`Emitir` y `Cerrar`.

Columnas: `Artículo`, `Descripción`, `Referencia`, `Acabado`, `Tonalidad`,
`Cantidad`, `Ancho(mm)`, `Alto (mm)`, `Precio`, `%Dto.`, `Total`.

| Artículo | Descripción | Acab. | Ton. | Cant. | Ancho | Alto | Precio | Total |
|---|---|---|---|---|---|---|---|---|
| `0` | FIJO DE 1 HUECO DE MEDIDAS : 1.200,0 x 1.200,0 EN COLOR L. BLANCO ALG 65… | L | * | 1,00 | 1170 | 1200 | 225,75 | 225,75 |
| `04` | FIJO DE 4 HUECOS (2X2) DE MEDIDAS : 1.200,0 x 1.200,0 EN COLOR L. BLANCO… | L | * | 1,00 | 1170 | 1200 | 373,46 | 373,46 |
| `GMU038` | (GM) TUBO 60x60 DE MEDIDAS : 0,0 x 1.200,0 EN COLOR L. BLANCO PERFILERÍA… | L | * | 1,00 | 0 | 1200 | 12,36 | 12,36 |
| `MO` | MANO DE OBRA DE TALLER (MINUTOS) | UNI | * | 0,00 | 0 | 0 | 0,50 | 0,00 |
| `MOCOL` | MANO DE OBRA DE COLOCACIÓN (MINUTOS) | UNI | * | 300,00 | 0 | 0 | 0,50 | 150,00 |

Suma 225,75 + 373,46 + 12,36 + 0 + 150,00 = **761,57** = precio de la
línea `GRUPO`. Conclusiones:

- El `GRUPO` es un **documento agregado de sublíneas**: una por estructura,
  una por unión y dos de mano de obra (`MO` taller y `MOCOL` colocación)
  expresadas en **minutos** a 0,50 €/min.
- Las horas adicionales se convierten a minutos (5 h → 300 min).
- Cada estructura se valora a su medida de fabricación (1170), no a la
  nominal.
- La unión se valora como artículo con alto = longitud de unión y ancho 0.

### Persistencia observada en la MDB (solo lectura, 0017)

`VPresupuestosLin` guarda el grupo como árbol de líneas del mismo
documento (`nDoc`):

| Nivel | Marca | Enlace | Ejemplo |
|---|---|---|---|
| Línea visible | `GrupoSN = True`, `nOrden = 1` | — | `GRUPO`, `Largo 1200` (alto), `Ancho 2400`, `Precio 761,57` |
| Componente | `EstructuraSN = True`, `nModulo = 1` | `nGrupo` → línea `GRUPO` | `0`, `04`, `GMU038` |
| Mano de obra del grupo | — | `nGrupo` → `GRUPO`, `nEstr = 0` | `MO` 0 min, `MOCOL` 300 min |
| Despiece | `nOrden = 0` | `nEstr` → componente | perfiles `GM16068L`, `GM16197L`, vidrios `L33I` 549,5 x 534,5, junquillos, juntas, escuadras, `MO` por operación |

- Las líneas se escriben **inmediatamente** al grabar el cerramiento; la
  cabecera no se grabó (Nombre/Obra vacíos, Subtotal 0) porque faltaba
  `Forma de Pago` (ver §6). Tras volver del diseñador la ficha del 260492
  quedó en modo solo lectura (`Aceptar` y operaciones de línea
  deshabilitados incluso al reabrirla). HIPÓTESIS: bloqueo por el cierre
  anómalo anterior o por la cabecera pendiente.
- En `VPresupuestosLin` `Largo` es el alto y `Ancho` el ancho.

## 5. Editor de línea de una estructura simple (presupuesto 260493)

`+` → `Edición de Línea` (tarda ~20 s) → `Código` `2` + `Enter` despliega el
editor completo. Pestañas `Estructura`, `Opc.Herraje`, `Cargos Adic.`,
`Acristalamiento` y botón `Mas Datos`.

### Estructura

- `PERFILES` y `VIDRIO` con código, lupa y nombre azul (`GMA65OPT` +
  `(GM) ALG 65 OPTIMA (RPT)`; `L33I` + `LAMINAR 3+3 INCOLORO`). Se pueden
  teclear directamente.
- `Acabado` `L` / `*` y `Accesorios` `L` / `*` preseleccionados; `Madera`
  vacío con `#`.
- `Cantidad 1,00`, `Metraje` (calculado) + unidad `UD`, `Referencia (Tipo)`.
- `ANCHO` / `ALTO` mm. Selector de elemento (`HUECO`) con muestras.
- Miniatura; iconos de diseño y portapapeles; `HORAS ADICIONALES` con
  casilla, `Fabr.`, `Coloc.`, botón mano, combo y X roja.
- **Bloque de complementos**, cada fila con código + lupa + combo +
  botones:
  - `Compacto` (+ icono reguladores, icono cajón, `Caj` combo).
  - `Guía Iz.` (ojo + lupa) y `Guía De.` (ojo + lupa): se habilitan al elegir
    compacto.
  - `Tapajuntas`, `Registro`, `Premarco`, `Condensac.` con ojo.
  - `Altura` mm.
- Botones a la derecha: `Mosquiteras`, `Ángulos y Tubos`,
  `Bandejas/Cond.`, `Accesorios`.
- Descripción con botones de texto automático y portapapeles, casilla
  `Descripción Manual`; `Precio` `/ UD`, `Dto.`, `Dto. 2`, `Total Línea`,
  `Tarifa` + lupa, `Tarifa Manual`, `PVP Manual`, `%Dto. Manual`,
  `Coste Manual`; `Aceptar`, `Cerrar`, casilla `n.r.`.
- El precio no se calcula hasta `Aceptar`.

### Compacto

- Combo con `CAJON DE PVC CON LAMA DE ALUMINIO TERMICA`, `CAJON CUADRADO DE
  PVC CON LAMA DE ...`, `CAJON DECORBOX DE PVC ...` (varias).
- Elegir el primero rellena `COM001` y **`Caj 155`** automáticamente para
  alto 1200. `Caj` ofrece `155`, `185`, `200`. (El vídeo: alto > 1,60 fuerza
  185.)
- Al aceptar sin guías: `Ha seleccionado Compacto o Registro, pero no ha
  seleccionado Guías de Persiana. ¿Desea Continuar?` (`Sí` / `No`).
- El cajón **reduce el alto de la ventana**: `Det.Estructura` muestra
  `Alto 1.045` = 1200 − 155; el compacto se valora a 1200 x 1200.

### Mosquiteras

- Botón `Mosquiteras` → diálogo `Selección de Accesorios` (rejilla
  `Familia`, `Accesorio`, `Descripción`, `Acabado`, `Tonalidad`; lápiz,
  `+`, `x`; `Aceptar`, `Cerrar`).
- `+` → `Editar accesorio`: `Familia` = `MOSQUITERAS` (fija), `Accesorio`
  código + lupa + combo + reguladores + ojo, `Acabado` `L` / `*`,
  `Grabar` / `Cancelar`.
- Catálogo: `(PS) MOSQUITERA CORREDERA`, `(PS) MOSQUITERA CORREDERA CON
  TIRADOR`, `(PS) MOSQUITERA ENROLLABLE` (`PSM001`), `MOSQUITERA PLISADA`.
- La mosquitera **no crea línea aparte**: se añade al texto (`(PS)
  MOSQUITERA ENROLLABLE ; CAJON DE PVC CON LAMA DE ALUMINIO TERMICA ;
  Accionamiento: ...`) y al despiece de la estructura (`PSM001` 1200 x 1045,
  1,25 M2 a 56,76 = 70,95). En el vídeo de 2020 aparecía como línea propia
  `ECM001`; hoy el camino observado es este.

### Opc.Herraje

- Combo `Herraje` (`HERR. ALG 65 OPTIMA (RPT) 2H.P.`), lista `Categoría`
  (`*** TODAS`, `ACC ACCESORIOS`, `BIS BISAGRAS`, `CER CERRADURAS`,
  `MAN MANILLAS`), rejilla `Opciones de Herraje` (`Selec.`, `Opción`,
  `Descripción`).
- Estructura `2` con GMA65OPT: `1 CREMONA + FALLEBA` ✓, `2 BISAGRAS
  ESTÁNDAR` ✓, `4 CERRADURA` (fila roja), `6 MANILLA UNIDAD`, `503
  RETENEDOR`, `980 PATILLAS ANCLAJE` ✓.
- **Incompatibilidad simétrica verificada**: con `1` marcada, `4` sale en
  rojo y no se puede marcar (clic sin efecto ni aviso). Al desmarcar `1`,
  `4` deja de estar en rojo; al marcar `4`, `1` pasa a rojo. Se restauró
  el estado por defecto.

### Cargos Adic.

Rejilla editable con fila nueva: `Código Artículo` + lupa, `Descripcion`,
`Acabado` + lupa, `Tonalidad` + lupa, `Descr...`, `Cantidad`, `Ancho (mm)`,
`Alto (mm)`, `Metraje`, `Tipo C.`, `Precio`, `Total`, tres casillas
(cabeceras truncadas: HIPÓTESIS `Cargo Aparte`, `Respetar PVP`, `Es Cantidad
Total`), `Coste Manual`, `Observaciones`. Pie `Total Cargos 0,00`. No se
añadió ningún cargo.

### Acristalamiento

Cinco radios, cada uno con `Hojas` y `Fijos` (código de tabla de junquillo
+ descripción): `1` GM69 `RECTOS CLIP 22MM (GM 61)` (por defecto),
`2` GM70 `CURVOS GRAPA-CLIP 22MM (GM 61)`, `3` GM71 `CURVOS CLIP 22MM`,
`4` GM72 `CURVOS GRAPA 22MM`, `5` vacío y deshabilitado.

### Mas Datos (`Línea. Más datos`)

- `Observaciones`: texto para la hoja de despiece, `Etiquetas Ud.
  impresas`, `Referencia Interna`.
- `Línea relacionada`: `Tipo Documento` (`Presupuesto`), `Número` +
  revisión + lupa, casilla `Ocultar cargos en línea aparte` (marcada),
  rejilla `Seleccione la línea relacionada`.
- `Opciones`: `Repercutir Gastos Indirectos` ✓, `Cómputo de Metraje` ✓,
  `Impuestos / Tipo Impuesto`, `Comisiones` (`% Comisión manual`,
  `Comisión manual`), `Múltiplos y Metraje Mínimo` (`Metraje Mínimo
  especial`, `Múltiplos especiales`, `Múltiplo Ancho/Largo` cm), `Número de
  Línea`, `Capítulo` (`Capítulo padre`, `Capítulo`, `Descripción`).
- `Auxiliares`: rejilla `Número Dato`, `Dato Auxiliar 1..3`.

### Resultado

- `Aceptar` recalcula (~35 s) y **reabre `Edición de Línea` vacía** con el
  último código preseleccionado.
- Línea: Artículo `2` (fondo rosa), Acabado `L`, 1,00, 1.200 x 1.200,
  **726,59**. Total presupuesto 879,17 (IVA 21 % 152,58).
- `Det.Estructura` → `Detalle de la Estructura`: cabecera (Código, Ancho,
  Alto, Referencia, Número de Línea, Descripción, dibujo acotado), rejilla
  (`Cod.Art.`, `Descripcion`, `Aca.`, `Tonalidad`, `Cantidad`, `Ancho`,
  `Largo`, `Ancho Corte`, `Largo Corte`, `Metraje`, `TipoMet`,
  `Total Coste`, `Precio`, `%Dto`, `%Dto2`, `Total Venta`), pestañas
  `Detalle`, `Asociados`, `Más Datos`, `Mano de Obra`, `Dibujos`,
  `Incrementos`, `Variables`; `Ordenar por`, `Formato` (`Detallado` /
  `Resumido`), `Incluir dibujos de artículos`, `Mostrar líneas` (`Con Valor`
  / `Sin Valor` / `Todas`); `Cerrar`, `Emitir`.
- Mano de obra en minutos a 0,50 €: `MO` 110 min, `MOCOL` 0, **`MOCOMP`
  (compactos) 15 min**.
- Vidrio con metraje mínimo (`L33I` 2 x 474 x 901 → 1,00 M2).

## 6. Validaciones y diálogos observados

- `Debe indicar el campo 'Forma de Pago'.` al aceptar la ficha sin forma de
  pago (lupa: `01 CONTADO`, `02 TRANSFERENCIA`). La cabecera no se graba
  hasta resolverlo; las líneas sí están ya grabadas.
- `¿Desea cerrar sin grabar?` al cerrar la ficha con cambios.
- `¿ Desea eliminar el Elemento seleccionado ?` en el diseñador.
- Aviso de compacto sin guías (arriba).
- `Aceptar` de la ficha devuelve a la lista.

## 7. Pendiente

- `Desagrupar` y `Det. Estructura` dentro de `Modificar un Grupo` (no
  pulsados: `Desagrupar` altera el documento).
- Tapajuntas del cerramiento: qué la habilita.
- Tooltips de la barra del diseñador y de `Diseño V3`.
- Atajos de teclado dentro del diseñador (solo verificados `Enter` en la
  ficha y `F9` sin efecto con la ficha bloqueada).
- Añadir un cargo adicional real y ver cómo suma `Total Cargos` al precio.
- Guías de persiana: catálogo y efecto.
- Aceptar el cerramiento con la descripción vacía.

## 7 bis. Comparación con Aluminior (código a 19/09, commit ba1bc9c)

Comparación por lectura de `packages/core/src/estructuras/cerramiento.ts`,
`presupuestos/[id]/_components/disenador-estructura.tsx`,
`editar-cerramiento.tsx`, `_lib/cerramientos/*` y `_lib/mano-obra/*`. La
comparación en navegador queda PENDIENTE de sesión de empleado (login).

| Tema | Productor (observado) | Aluminior hoy | Brecha |
|---|---|---|---|
| Entrada | `+` → `Edición de Línea` → botón `Cerramiento` | Radios Estructuras/Artículos + botón Cerramiento | Paridad |
| Persistencia inicial | Graba `GRUPO` vacío al entrar | Se graba al guardar | Intencional: no reproducir líneas vacías (defecto) |
| Composición | Arrastrar al lienzo; anclajes verdes en esquinas libres; derecha **y debajo** | Clic `Añadir a la derecha`; solo cadena horizontal | Falta anclaje inferior y arrastre |
| Árbol | Una fila por pieza y por unión (`0 - 2 de 1200 x 1200`) | Cadena de botones elemento/unión | Añadir lista-árbol con el mismo rótulo |
| Serie/vidrio/acabado | **Por elemento** + `Actualizar todos los elementos` | Uno por cerramiento | Modelar por módulo con propagación |
| Unión: medida | GMU038 60 mm: piezas a **1170**, total **2400**; grosor por defecto 20 sí suma | `ancho = Σ módulos + Σ grosores` → 2460 | **Corregir** regla (ver propuesta 1) |
| Unión: selección | Código + lupa + combo + escaparate `UNIONES` con dibujos; `SIN UNION [U]`; acabado propio | Select con código/descr., longitud, grosor editable | Grosor debe venir del artículo (bloqueado); añadir acabado de unión y `SIN UNION` |
| Borrado | En cascada (piezas ancladas y uniones) sin aviso | Elimina el módulo seleccionado | Mantener borrado simple; no reproducir cascada silenciosa (defecto) |
| Editor de diseño | `Diseño V3` con árbol, escaparate de marcos/hojas, travesaño con posición y cotas | Diseñador de huecos propio | Ya documentado en PARIDAD; sin cambio ahora |
| Descripción | Automática por bloques, uno por estructura; se regenera al aceptar | Descripción generada en servidor | Alinear formato por bloques (propuesta 3) |
| Horas | `€` convierte importe → horas (30 €/h) → minutos a 0,50 €/min | Horas Fabr./Coloc. explícitas → `lineas_mano_obra` minutos | Añadir calculadora importe → horas |
| Línea resultante | `GRUPO`, acabado `UNI`, ancho = fabricación + uniones (2.400), precio = Σ sublíneas | `GRUPO` con dibujo y valoración por origen | Comprobar acabado `UNI` y ancho de fabricación |
| Det.Grupo | Sublíneas: una por estructura (a medida de fabricación), una por unión (ancho 0, alto = longitud), `MO`, `MOCOL` | Resultado por origen (MODULO/UNION) + mano de obra | Exponer vista `Det.Grupo` con esas columnas |
| Compacto | `COM001`, `Caj` 155/185/200 automático por alto; resta el cajón al alto de ventana; `MOCOMP` | Sin modelar | Propuesta 5 |
| Mosquitera | Accesorio de familia MOSQUITERAS dentro de la línea (PSM001 1200 x 1045) | Sin modelar | Propuesta 6 |
| Herraje | Rejilla con incompatibles en rojo, simétrico | `herraje.ts` + funciones nuevas de core | Propuesta 4 |

### Comprobación en navegador (Aluminior en 3001, presupuesto 260002, sin grabar)

Misma tarea que en Productor; se cerró sin `Aceptar`, nada escrito en
Supabase.

- `Cerramiento` → escaparate (categorías del vídeo) → elegir estructura abre
  el diseñador con `Elemento 1`, partes `Marco exterior` / `Hoja` /
  `Vidrio`, `Añadir a la derecha`, `Eliminar elemento`, un solo bloque de
  `Serie`, `Vidrio`, `Acristalamiento`, `Acabado`, `Cdad.`, `Fabricación
  (h)`, `Colocación (h)`.
- Dos fijos de 4 huecos + unión: la unión se crea ya con `GMU038`; el
  selector solo ofrece `GMU038` y `PSU001`. Resultado **`2460 × 1200 mm`**
  (Productor: 2400, piezas a 1170).
- Elegir otra estructura en el escaparate del diseñador **sustituye** el
  elemento seleccionado; `Añadir a la derecha` duplica el seleccionado.
- Editor de línea (estructura `2O`, GMA65OPT): pestañas `Estructura`,
  `Opc.Herraje`, `Cargos Adic.` (deshabilitada), `Acristalamiento`.
  - Opc.Herraje: combo con conjuntos `GM252` (1, 2, 4, 6, 503) y
    `GMA65OPT` (980); defaults 1, 2, 980 marcados como en Productor.
    Productor muestra todas las opciones juntas bajo un nombre de herraje
    (`HERR. ALG 65 OPTIMA (RPT) 2H.P.`); `4 CERRADURA` no sale bloqueada
    (faltan fórmulas: migración propuesta).
  - Con estructura `2` + GMA65OPT la pestaña sale **vacía**: Supabase solo
    tiene 22 reglas `herraje_conjuntos` de 10 series (lectura 19/09). Hueco
    de ETL, no de pantalla.
  - Acristalamiento: solo opción 1 `GM69` sin descripción; Productor
    muestra GM69–GM72 con nombre.

## 7 ter. Propuesta de cambios (orden recomendado)

1. **Regla de unión** (`core/estructuras/cerramiento.ts`). Separar
   "grosor de separación" de "solape": una unión con artículo (GMU038 60)
   no añade ancho y descuenta `grosor/2` a cada módulo contiguo
   (1200 → 1170); la unión sin artículo (20) sí separa. Tests con el caso
   observado: 1200 + GMU038 + 1200 → módulos 1170/1170, línea 2400.
   HIPÓTESIS a confirmar con un segundo caso (tubo 40x40, H 100).
2. **Serie, vidrio y acabado por módulo** en `ConfiguracionCerramiento`,
   con acción "Actualizar todos los elementos" y acabado propio de unión.
   Migración compatible (valor del cerramiento como defecto).
3. **Descripción por bloques** (una por estructura, separadas por línea en
   blanco; medidas nominales).
4. **Pestaña Opc.Herraje** en el editor de línea con las funciones puras ya
   añadidas en `core/estructuras/editor-linea/` (incompatibilidad simétrica
   verificada en vivo).
5. **Compacto**: tramos `Caj` 155/185/200 por alto, resta del cajón al
   alto de ventana, aviso sin guías, mano de obra `MOCOMP`. Falta la tabla
   de tramos real (leer de la 0017).
6. **Mosquitera** como accesorio de la línea (familia MOSQUITERAS, catálogo
   PSM*), valorada a ancho x alto de ventana.
7. **Calculadora `€`** de horas adicionales (importe → horas con el precio
   de la mano de obra).
8. **Árbol de elementos** y anclaje inferior en el diseñador.
9. **ETL completo de herraje** (`herraje_conjuntos` tiene 22 reglas) y
   de uniones (catálogo GMU038–041, PSU001–009, `SIN UNION`), más la
   carga de las tablas de la migración `0021_editor_linea` (aplicada)
   (fórmulas de herraje, tablas de acristalamiento 2–5, `lineas_cargos`).
10. **Rejilla de herraje unificada**: todas las opciones de los conjuntos
    de la regla en una sola rejilla, con el nombre del herraje en el combo,
    como Productor.

No se proponen correderas, puertas ni plegables sin catálogo
(`EstructurasDiseño`).

## 8. Escrituras hechas en la 0017

- Presupuesto **260492**: cabecera sin cliente (no grabada), línea `GRUPO`
  con dos fijos, unión GMU038 y colocación 150 €.
- Presupuesto **260493** `PRUEBA HERR` / `RECON`, forma de pago `01
  CONTADO`, línea estructura `2` GMA65OPT L33I 1200 x 1200 con compacto
  COM001 y mosquitera PSM001.
- Ninguna otra empresa abierta. No se borró nada fuera del diseño en
  curso.

## 9. Incidencias de la sesión

- El primer intento se perdió porque Productor se cerró con el diseñador
  abierto; la línea `GRUPO` vacía y la cabecera ya estaban grabadas.
- El arrastre sintético no genera `DragOver` fiable; los arrastres se
  hicieron a mano.
- Pegar texto en Productor vía portapapeles introdujo contenido ajeno en
  `Nombre`; se corrigió antes de grabar y la MDB no lo recogió.
