# Guía del diseñador de cerramientos de Productor

Referencia viva de lo que hace cada botón, pestaña y diálogo del diseñador de
cerramientos de Productor, y de su equivalente en Aluminior. Se lee **antes de
operar Productor** (observación en la 0017) y **antes de cambiar el
configurador web**, para no volver a descubrir cada icono desde cero.

- Fuente principal: explicación de Sergio (operador habitual) del 01/11/2026,
  con capturas de la 0017. Las capturas no se versionan.
- Contraste: observaciones fechadas en
  [RECON-CERRAMIENTOS](RECON-CERRAMIENTOS.md) y
  [EVIDENCIA-ESCAPARATE](EVIDENCIA-ESCAPARATE.md); recuentos de la exportación
  local `export_datos/EMP0016` (julio de 2026, no versionada).
- Marcas: **Explicado** (lo dice el operador), **Observado** (visto en
  pantalla en una sesión documentada), **Pendiente** (sin explicar todavía).
  Esta guía no fija el orden de trabajo; eso pertenece al
  [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
- Se amplía botón a botón según Sergio vaya explicando el siguiente.
  Al añadir uno, actualizar también la tabla de cobertura del final.

## Barra de vista del diseñador

Grupo de cinco iconos junto a los totales `Ancho` × `Alto` del conjunto.
De izquierda a derecha:

| # | Icono | Nombre (tooltip) | Qué hace | Estado |
|---|---|---|---|---|
| 1 | Ojo | `Escaparate de ventanas` | Muestra en el panel inferior el catálogo de estructuras para arrastrar al lienzo | Explicado |
| 2 | Dos paneles (uno naranja) | Propiedades del cerramiento | Cambia el panel inferior a las pestañas de propiedades; abre en `Elemento seleccionado` | Explicado |
| 3 | Cuadro dividido con trazo azul | Seleccionar la siguiente unión | Selecciona la unión siguiente del conjunto y lleva a la pestaña `Unión` | Explicado |
| 4 | Cuadro dentro de cuadro | `Insertar tapajuntas cerramientos` | Pendiente: Sergio lo confirma con el operador | Nombre explicado |
| 5 | Persiana (lamas horizontales) | Insertar compacto | Con un hueco seleccionado, abre `Compacto / Registro para el Cerramiento` | Explicado |

Los botones 1 y 2 alternan el contenido del mismo panel inferior: escaparate
o propiedades.

## 1. Escaparate de ventanas (ojo)

**Explicado.** Panel inferior con dos zonas:

- Izquierda: lista de categorías (familias de estructuras). Orden observado:
  VENTANAS CORREDERAS 90º, PUERTAS CORREDERAS 90º, CORREDERAS PERIMETRALES,
  VENTANAS ABATIBLES, OSCILOBATIENTES, PUERTAS BALCONERAS PRACTICABLES,
  PUERTAS DE CALLE, FIJOS ABATIBLES, MALLORQUINAS, FIJOS CORREDERA… hasta
  PREMARCOS DE OBRA, desplazando la lista.
- Derecha: al pulsar una categoría aparecen sus estructuras del catálogo como
  miniaturas, cuatro por página, con `<<` / `>>` para pasar de página.
- Las miniaturas se **arrastran** al lienzo; los puntos verdes marcan dónde
  se anclan (ver [RECON-CERRAMIENTOS §3](RECON-CERRAMIENTOS.md)).

Bajo las flechas, `Pág.` (página actual) y `Total` (número de páginas).
Confirmado por Sergio el 01/11: VENTANAS ABATIBLES tiene 11 páginas y 42
estructuras (familia `003`). Encajan también OSCILOBATIENTES, `Total 10`
con las 40 de la familia `020`, y FIJOS ABATIBLES, `Total 2` con las 8 de la
`005`.

**En Aluminior.** Las categorías y estructuras salen de la misma tabla
importada (`Estructuras`, familias de `FamiliasEstr`): 541 estructuras, de
las que 160 son dibujables hoy ([catálogo real](CATALOGO-REAL-2026-10-02.md)).
Las no dibujables (plegables, mallorquinas, zócalos, curvas, algunas hojas)
no aparecen todavía. Componentes:
`packages/web/app/dashboard/presupuestos/[id]/_components/escaparate.tsx` y
`disenador/catalogo-inferior.tsx` (paginación `Página anterior/siguiente`).

**Código (09/11/2026, prueba con el operador).** En Productor, `Edición de
Línea` acepta el código de la estructura y Enter abre el editor
([RECON-CERRAMIENTOS §5](RECON-CERRAMIENTOS.md)). En Aluminior la casilla
`Código` está en el catálogo inferior y en el diálogo `Añadir ventana`. Enter
o `Elegir` coloca esa ventana, o la elige si el diálogo está abierto. No
adivina prefijos: `2` no es `2O` y `C2` no es `C2P`. `2O+FIJO` equivale a
`2O+ FIJO`. Si no hay una plantilla dibujable con ese código, avisa y no
inserta nada. Las no dibujables siguen sin poder elegirse.

## 2. Propiedades del cerramiento → `Elemento seleccionado`

**Explicado.** El botón abre las pestañas `Elemento seleccionado`, `Unión`,
`Módulo`, `Propiedades del Cerramiento` y `Tapajuntas` (esta última
deshabilitada en todo lo observado). Por defecto se abre `Elemento
seleccionado`, con los datos del elemento elegido en el lienzo o en el árbol:

| Campo | Control | Uso |
|---|---|---|
| Estructura | Código (solo lectura) + descripción en azul | Ej. `2O` VENTANA ABATIBLE DE DOS HOJAS, UNA OSCILOBATIENTE |
| Posición X / Y | mm | Posición del elemento en el conjunto (observado bloqueado: la da el anclaje) |
| Ancho × Alto | mm | Medida del elemento |
| PERFILES | Código + lupa | Serie de perfiles. La lupa abre la búsqueda de series |
| VIDRIO | Icono junquillo + código + icono vidrio + lupa | Vidrio del elemento. La lupa abre la búsqueda de vidrios |
| Acabado | Dos códigos con lupa | Acabado y tonalidad de perfiles (la 2.ª casilla se rellena con `*`) |
| Aca. Acc. | Dos códigos con lupa | Acabado de accesorios |
| Muestras de color y `HUECO` | Dos cuadros + rótulo rojo | Tipo de pieza seleccionada (Pendiente de explicar) |
| Iconos a la derecha | `P` verde, puerta, escuadra (cartabón), lápiz, casillas | Cartabón: abre `Diseño V3` del elemento (ver «Diseño específico»); el resto, pendiente |
| `Actualizar` / papelera | Botones | Aplica cambios al elemento / elimina el elemento (borra en cascada lo anclado) |
| `Actualizar todos los elementos` | Botón | Aplica los valores a todos los elementos del conjunto |

### Cotas de fijo y travesaño — hipótesis, 03/11/2026

**No confirmado en Productor.** El contraste del 02/11 anotó que `Elemento
seleccionado` solo muestra `Ancho × Alto` y que las cotas de división se
editan desde el cartabón (`Diseño V3`). La guía no documenta el punto exacto
dentro de un conjunto. El 03/11 el arquitecto decidió, como hipótesis, mostrarlas
en Aluminior en el panel del elemento, junto a Ancho y Alto. Hay que
confirmarlo en Productor antes de tratar esa ubicación como canónica. No
moverlas a otra pantalla sin esa confirmación.

En Aluminior, al seleccionar el elemento, el panel muestra un campo por cada
cota de `estructura_cotas` que pertenezca a `FI`, `FS`, `VS`, `TD`, `F`, `FD`
o `FZ`. La etiqueta es el nombre del catálogo, o el símbolo si falta; el valor
por defecto se ve como referencia; la unidad es mm. Si el operador no lo cambia,
no se guarda: el motor sigue con el catálogo. Vaciar el campo y pulsar
`Actualizar` quita la cota de instancia. `1OFI` no cambia: sigue con `FIJO
INFERIOR` (`fiMm`) y su geometría, sin un segundo FI.

### Lupa de PERFILES: series

Ventana `Búsqueda` con rejilla `Codigo` / `Descripcion` / `DescripcionVentas`.
Para una estructura abatible lista las series GM abatibles y PVC, entre ellas:
`GMA100`, `GMA55`, `GMA55C16`, `GMA65OPTC16`, `GMA65OHS`, `GMA65OPT`, `GMA75`,
`GMA75C16`, `GMA350`, `GMA50`, `GMA5016`, `GMA50R`, `GMA6016`, `GMA60RL`,
`GMA65`, `GMA76`, `GMA81`, `GMAP`, `GMAPF`, `ELEGANTPVC`.
La descripción lleva prefijo de proveedor (`(GM) ALG 65 OPTIMA (RPT)`); la de
ventas lo omite. **Observado el 01/11/2026:** filtra por tipo de estructura.
Con una `C2` seleccionada solo lista series de corredera (`GMC…`, `GMPC…`).
Con la `2O` lista las abatibles y `ELEGANTPVC`.

**En Aluminior: catálogo importado, interacción distinta.** Las 57 series de
`ConfigSeries` (incluidas todas las de la captura; la fila `*` es configuración,
no serie) están en la tabla `series`.
El panel web (`disenador/materiales-elemento.tsx`) ofrece un desplegable solo
con códigos, sin descripción, sin búsqueda y sin filtrar por tipo de estructura.

### Lupa de VIDRIO

`Busqueda de Vidrios`, misma rejilla `Codigo` / `Descripcion` /
`DescripcionVentas`. Catálogo muy grande: monolíticos (`VCG4` CARGLASS 4mm),
chapas y paneles (`CHA2X11C`), y dobles acristalamientos codificados
`V410…` (`V410A4` 4/10 ARGON/4, `V410AL33A` 4/10 ARGON/LAMINAR 3+3 ACUSTICO…).

**En Aluminior: importado.** Son artículos de la familia `050`; la
exportación tiene 14.758 y todos los códigos de la captura están. La web los
busca por código o descripción (`_lib/vidrios/buscar.ts`,
`vidrios/campo-vidrio.tsx`). No hace falta extraerlos de la instalación de
Productor salvo que la 0017 actual tenga vidrios posteriores a la exportación
de julio (pendiente de comprobar si se necesita).

### Lupa de Acabado

Diálogo `Búsqueda` pequeño (`Codigo`, `Descripcion`, `Observaciones`). Los 18
acabados: `*` comodín (todos los acabados, precios y descuentos), `ABI`
bicolor anodizado, `AN` anodizado negro, `AVS` anodizado especial, `B` bronce,
`BI` bicolor, `I` acero inox., `K` madera, `KBI` bicolor madera, `L` lacado
blanco, `LT` texturado, `MET` metalizados, `N` negro, `P` plata (lijado mate),
`SC` sin color (sin anodizar), `UNI` único, `V` lacado varios (color), `VS`
lacado especial. Desde el elemento se observaron 13; desde la unión, 18.

**En Aluminior: importado** (tabla `acabados`, 18 filas, mismos códigos).

## 3. Seleccionar la siguiente unión → pestaña `Unión`

**Explicado.** La unión es la pieza que conecta dos ventanas del conjunto. El
botón selecciona la unión siguiente y muestra su pestaña:

| Campo | Control | Uso |
|---|---|---|
| Unión | Código + lupa + desplegable + ojo | Artículo de unión. El ojo abre el escaparate `UNIONES` con dibujos |
| Acabado | Dos códigos con lupa | Acabado propio de la unión |
| `Longitud de la unión Manual` | Casilla | Permite fijar la longitud a mano |
| Longitud | mm | Por defecto la del lado común (ej. 400) |
| Grosor | mm, bloqueado | 20 sin artículo; el del artículo si lo hay (GMU038 = 60) |
| Tipo de Unión | Dos iconos | **Fija** o **variable** (ver abajo) |
| `Actualizar todas las uniones` / `Actualizar` | Botones | A todas las uniones / solo a esta |
| Vista previa | Recuadro + casilla | Pendiente |

**Tipo de unión.** Dos tipos según Sergio: fija y variable. Pendiente: qué
icono corresponde a cada uno y qué cambia en medida, despiece o precio.

**Observado el 01–02/11/2026** (ver la
[comparativa](COMPARATIVA-PRESUPUESTOS-2026-11-01.md)):

- Productor no acepta el conjunto con uniones sin configurar. Pide artículo
  **y** acabado: «Debe seleccionar el Perfil de Unión y su Acabado».
- `U` SIN UNION tiene grosor 1. El 2 × 2 de 1200 mide 2401 × 2401 en el
  diseñador, pero la línea se guarda con 2400 × 2400. La longitud de cada
  unión es 1199,5.
- `GMU038` (tubo 60 × 60) **resta** su grosor de las piezas contiguas.
  2O + fijo 400 + 2O mide 2800, no 2920: cada 2O queda en 1160 y el fijo en
  360. Cada unión se despieza como `GM60X60` de la longitud del lado común
  (400) más mano de obra, y vale 4,12 €.
- El código se puede teclear en la casilla `Unión`. El desplegable no
  respondió bien al teclado. El acabado de unión se escribe a mano (`L`).

En Aluminior, sin la migración 0034 el desplegable ofrece los 14 códigos de
reserva (`GMU038`–`GMU041`, `PSU001`–`PSU009`, `U`). Con 0034, Artículos →
Uniones mantiene el catálogo y el configurador lo lee; los dibujos salen de
`dibujo_catalogo` (o de la carpeta local `DIBUJOS\ESTRUCTURAS`) y no se copian al repositorio. Desde el 02/11/2026 las uniones
configuradas restan la mitad de su grosor a cada pieza contigua y miden el
lado común, como en los documentos reales: el 2 × 2 con `U` mide 2400 × 2400
y 2O + fijo 400 + 2O con `GMU038` mide 2800. Las líneas anteriores conservan
su geometría (ver
[comparativa](COMPARATIVA-PRESUPUESTOS-2026-11-01.md#reparto-de-uniones-corrección-del-02112026)).

Catálogo observado: `GMU038` tubo 60×60, `GMU039` 40×40, `GMU040`/`GMU041`
40×60 (Dto 40/60), `PSU001`–`PSU008` (H unión para compactos y esquineros) y
`SIN UNION`. Efecto medido en el ancho total y reparto de grosor:
[RECON-CERRAMIENTOS](RECON-CERRAMIENTOS.md), brecha abierta en
[PARIDAD-PRODUCTOR](PARIDAD-PRODUCTOR.md).

**En Aluminior: parcial.** Las uniones existen como elemento entre módulos
(`editor-union.tsx`, lista `Elementos y uniones`) con código, longitud y
grosor (bloqueado en solo lectura). Desde el 07/11/2026 la barra superior del configurador (`disenador/barra-disenador.tsx`, `disenador/opciones-cerramiento.tsx`) incluye el botón explícito `Uniones` (y `Siguiente unión` dentro de `EditorUnion`), que prioriza la primera unión sin configurar y recorre circularmente las uniones del cerramiento, marcando en rojo (`data-pendiente="true"`) cuando queda alguna pendiente; además, el alta de ventanas queda unificada en `Cerramiento` con las pestañas `Catálogo`, `Propiedades`, `Uniones`, `Opc.Herraje`, `Cargos Adic.` y `Acristalamiento` en la misma barra. Quedan pendientes el tipo
fija/variable, acabado de unión, casilla de longitud manual ni escaparate de
uniones con dibujo.

## 5. Insertar compacto

**Explicado.** Con un **hueco** seleccionado, el botón abre el diálogo
`Compacto / Registro para el Cerramiento`, que añade el cajón de persiana:

| Sección | Campos | Uso |
|---|---|---|
| Compacto | Código + lupa + desplegable + dos iconos; `Cajón` (desplegable) | Cajón de persiana y su medida |
| | Acabado: dos códigos con lupa + `#` | Acabado del compacto |
| Registro de Persiana | Código + lupa + desplegable + dos iconos; `Cajón` 300 mm | Alternativa de registro (Pendiente de explicar) |
| | Acabado: dos códigos con lupa + `#` | |
| Guías | Izquierda / Derecha: código + ojo + lupa | Conjunto de guía de persiana (familia 051); su perfil es el componente `GP` |
| Forzar medidas manuales | Altura total, Largo guía izq., Largo guía der. (mm) | Sustituyen el cálculo automático |
| Botones | `Aceptar`, `Cerrar`, papelera | Aplicar, salir sin aplicar, quitar el compacto |

**En Aluminior (09/11/2026):** el panel del elemento agrupa el compacto en un bloque propio: modelo
(COM001–COM017), cajón (155/185/200; por encima de 1.600 mm propone 185), descontar del hueco, guía
izquierda y derecha (familia 051, al elegir la izquierda copia a la derecha si esa está vacía) y las
opciones del catálogo con su título (`Guía Central`, accionamiento, vuelos). El cajón se dibuja sobre la
ventana; las guías laterales, solo si se han elegido. Al elegir un compacto se marcan las opciones
predeterminadas del catálogo, así la ventana se valora sin que el operador conozca `G1O0`. La tabla
`estructura_opciones_accesorio` de la base que usa la web está vacía (0 filas, observado el 09/11/2026);
el despiece usa el catálogo exportado de EMP0016 cuando la base no tiene predeterminadas. Las guías
izquierda/derecha son **conjuntos de la familia 051** (GMG001-GMG014, PSG001-PSG011), como en Productor; el
perfil es su componente `GP` (`GMG010` → `GM6805L`). Desde el 10/11/2026 entran en el precio: por lado,
1 perfil a metro lineal de largo = alto del compacto − cajón y 5 minutos de `MOCOMP`. Desde el 12/11/2026
la regla está contrastada (ver «Contraste del 12/11/2026», abajo) y la línea ya no sale con aviso; además
las guías estrechan la ventana y el compacto toma el acabado de la ventana. `PSG90`, `PSG100`, `PSG120` y
`PSG120L` no tienen PVP en EMP0016: el selector las marca «sin precio» y la línea queda sin valorar.
Productor, en cambio, las suma a 0 (desviación deliberada: un precio ausente no es un cero). Sin
contrastar: el caso sin descontar el cajón. Registro de persiana y medidas manuales siguen sin reproducir.

### Contraste del 12/11/2026 (empresa de pruebas, presupuesto 260504)

**Observado** con la mochila en el equipo del titular. Dos líneas montadas en el diseñador, ambas 2O con
ELEGANTPVC, VCG4, acabado `L` `*`, accesorios `UNI` y `COM001`; despiece leído de la MDB de la 0017 en
solo lectura (volcado privado en `output/contraste-guias-20261112/`).

| | Caso A | Caso B |
|---|---|---|
| Hueco | 1.200 × 1.200 | 1.200 × 1.700 |
| Cajón que propone | 155 | 185 |
| Guías | GMG010 a ambos lados | PSG002 solo a la izquierda |
| Ventana valorada | 1.094 × 1.045 | 1.160 × 1.515 |
| Compacto (`COMPVAL`) | 1.200 × 1.200, 1,50 m² (mínimo) | 1.200 × 1.700, 2,04 m² |
| Guía | 2 × `GM6805L` de 1.045 (1,05 ml cada una) | 1 × `PSG100` de 1.515, sin PVP: suma 0 |
| `MOCOMP` | 15 + 5 + 5 min | 15 + 5 min |
| Línea | 630,47 € | 720,15 € |

Reglas que salen de ahí:

- **Las guías estrechan la ventana.** El ancho de la ventana es el del hueco menos el `DescuentoGuia`
  de cada guía colocada (`Conjuntos`, familia 051): GMG010–014 = 53; GMG001–004 = 40,5; PSG001–005 = 40;
  PSG006/008/009 = 45; PSG007 = 46; PSG010 = 47,5; GMG006–008 = 2; PSG011 = 1,5; GMG005/009 = 0.
  El compacto conserva el ancho del hueco. El dibujo lo refleja: el cajón ocupa todo el ancho y la
  ventana queda más estrecha, con el hueco seleccionado en azul alrededor.
- **El cajón resta su altura** a la ventana (`compDtoHuecoSN` marcado por defecto) y el compacto se
  mide con el alto del hueco. La descripción sigue diciendo 1.200,0 x 1.200,0.
- **Largo de la guía** = alto del hueco − cajón; **5 minutos de `MOCOMP` por guía**, además de los 15 de
  la plantilla del compacto. El metraje se redondea por pieza (1.045 → 1,05).
- **Acabado.** Al elegir el compacto se rellena con el acabado de la ventana (`L` `*`), no con el de
  accesorios (`UNI`); lamas, guías y accesorios del compacto (`CompAccAca…`) van en ese mismo acabado.
- **Cajón:** con alto 1.700 propone 185 (confirma el tramo por encima de 1.600).
- **Copia de guía:** teclear la izquierda y pulsar Tab copia el código a la derecha; elegirla con la lupa
  no. Se puede vaciar la derecha y aceptar con una sola guía.
- La lupa de guías lista 14 `GMG`, 11 `PSG` y `G` SIN GUIAS, con la descripción del conjunto
  («(GM) GUIA PARA RECOGEDOR 110MM RPT (6805L)»). La descripción de la línea añade, tras el compacto,
  la de la guía izquierda.
- La línea `GRUPO` guarda `Ancho` 1.094 (el de la ventana) y `Largo` 1.200.

En una fila de varias piezas con unión, el presupuesto 970 de EMP0016 (copiado en 1034, albarán 280 y
factura 365: cuatro C2 con COM005 y GMG010 a ambos lados) da dos descuentos en la primera pieza
(1.070 → 964) y uno solo en las tres siguientes (1.469 → 1.416; 1.070 → 1.017). Comprobados todos los
`GRUPO` con `CerrCodGuiaI/D` de `EMP0013`–`EMP0016` (25 en `VPRES` más `VALB 280` y `VFAC 365`; 21
cerramientos multicolumna con 59 módulos con guías), el 100 % cumple la regla de `descuento-guias.ts`:
la primera columna por la izquierda descuenta ambas guías y todo módulo con otra pieza a su izquierda
descuenta solo `guiaDerecha`, incluso cuando la pieza contigua izquierda es un fijo sin compacto
(`EMP0013` presupuestos 159 y 269; `EMP0014` presupuestos 1042 y 1074). En los 3 cerramientos que apilan
un módulo debajo de otro que lleva compacto con guías (`EMP0013` 269 y 596; `EMP0015` 330; ninguno en la
0016), las guías verticales estrechan también el módulo inferior en la misma medida.

Además, contrastados los `GRUPO` multifila con compacto de `EMP0013`–`EMP0016` (más de 50 casos):
- **`VAccesorios.nModulo` (`1..N`, familia 100) numera siempre las columnas de la fila superior**
  (`modulosSuperioresCerramiento`, `indiceModuloCompacto` en `compacto-cerramiento.ts`), es decir, los
  módulos cuya cadena de anclajes desde el módulo raíz no pasa por ninguna unión horizontal (`UnionVH = 'H'`),
  incluso cuando un fijo inferior tiene `Orden` menor que una ventana superior (`EMP0016`: presupuestos 871,
  881, 1029, 1124, 1263, 1339 y 1368).
- **Subacabados del compacto (`CompAccAcaLamas`, `CompAccAcaGuias`, `CompAccAcaAcc`):** en las 351 filas de
  plantilla de `COM001`–`COM017`, `COMPVAL` se tarifa siempre en `VAccesorios.Acabado` (o el acabado de la
  ventana si aquel viene vacío, como en `VFAC 365`), mientras que `CompAccAcaGuias` se aplica al perfil de
  las guías laterales (`GUIAIZ`/`GUIADE` en `guias-compacto.ts`). Sin guía central (`!GuiaCentralSN`), un
  valor distinto en `CompAccAca*` no altera `COMPVAL` (confirmado en los 7 `GRUPO` de la 0016: 937, 1234,
  1239, 1264, 1265, 1274 y 1287, que coinciden al céntimo).

**En Aluminior (12/11/2026, commit `30dbc16` + reglas de compacto en GRUPO):** `descuento-guias.ts` (core)
guarda la tabla y `valorarCerramiento` resta el descuento al ancho de la ventana y devuelve el del hueco al
compacto. `compactoEfectivoModulo` toma el acabado de la ventana y pasa `acabadoGuias` cuando existe. En el
banco de contraste de `GRUPO` de la 0016 (225 `GRUPO`, 186 documentos), tras `30dbc16` (72 / 101 / 39 / 13
frente a 24 / 91 / 97 / 13 en `3504eb4`) y estas reglas se alcanzan **83 coinciden al céntimo**
(`190.858,31 €`) / **90 difieren** (`271.666,29 €`) / **39 sin valorar** (`135.776,95 €`) / **13 no
reproducibles** (`40.327,66 €`), con 114 recetas iguales y 172 repartos de unión coincidentes. Mismo caso A
montado en la web local con el catálogo real: 630,47 €, IVA 132,40 € y total 762,87 €, igual que Productor;
antes daba 636,31 € (guías en `UNI` a 20,61 €/m y ventana sin estrechar). Caso B: mismas filas de compacto;
queda sin valorar por `PSG100` sin PVP. Sin compacto con guías: 595,76 €, igual que la observación del
01/11. Diferencias que quedan en la UI: la opción de guía muestra la descripción del perfil («GUIA COMPACTO
DE 110 MM») y no la del conjunto; la descripción de la línea no añade la guía ni la serie con su nombre
(DG1b); el lienzo no estrecha la ventana ni marca el hueco; la fila guarda 1.200 de ancho y no 1.094; el
panel no deja elegir el acabado del compacto.

Lupa de compacto: los 17 de la familia `100`:
`COM001` cajón de PVC con lama de aluminio térmica; `COM002`–`COM004` cajón
cuadrado de PVC con lama térmica (s/g, + 1 tapa c/g, + 1 tapa s/g);
`COM005`–`COM008` Decorbox (misma pauta); `COM009`–`COM012` Rectobox (misma
pauta); `COM013`–`COM016` cajón cuadrado con lama autoblocante (c/g, s/g,
+ 1 tapa c/g, + 1 tapa s/g); `COM017` paño térmico.

Medida del cajón: **155, 185 o 200 mm**. Observado en la ficha de línea:
elegir `COM001` con alto 1200 rellena `Caj 155` solo; según el vídeo, alto
> 1600 fuerza 185. El cajón **resta su altura** al alto de la ventana (1200 →
1045) y el compacto se valora a la medida total. Aceptar sin guías avisa
`Ha seleccionado Compacto o Registro, pero no ha seleccionado Guías de
Persiana. ¿Desea Continuar?`.

Observado el 01/11/2026 en el diseñador (2O de 1200, ELEGANTPVC, VCG4, L):
`COM001` rellena `Cajón` 155 y acabado `L` `*`. Al aceptar sin guías **no**
apareció el aviso. El cajón se dibuja sobre la ventana, cuya descripción
sigue en 1.200,0 x 1.200,0. La línea vale 595,76 € (514,31 de la ventana más
81,45 del compacto) y añade «CAJON DE PVC CON LAMA DE ALUMINIO TERMICA» a la
descripción. Hipótesis: el aviso de guías y la resta del cajón dependen de
entrar por la ficha de línea y no por el diseñador.

**En Aluminior:** el párrafo del 09/11/2026, arriba, es el estado vigente. Esta
frase de «función sin modelar» quedó superada por E5 y por el bloque del panel.


## Recorrido de composición en el lienzo

**Explicado** por Sergio el 01/11/2026 con siete capturas de la 0017, una por
acción. Así se monta un conjunto en Productor:

1. En el escaparate, categoría OSCILOBATIENTES: se arrastra `2O` (dos hojas,
   la derecha oscilobatiente) al lienzo vacío. Queda en el origen.
2. FIJOS ABATIBLES: se arrastra un fijo de un hueco y se suelta en el anclaje
   **inferior izquierdo** de la `2O`. Queda debajo, alineado a la izquierda y
   del mismo ancho.
3. OSCILOBATIENTES: segunda `2O`, soltada en el anclaje **superior derecho**
   de la primera. Fila superior con dos ventanas y el fijo debajo de la primera.
4. FIJOS ABATIBLES: otro fijo a la derecha de la segunda `2O`.
5. Se pulsa en ese fijo y `Elemento seleccionado` muestra `0` FIJO DE 1 HUECO,
   `Posición X 2440`, `Y 0`, perfiles `ELEGANTPVC`, vidrio `V`, acabado `L`
   `*` y accesorios `UNI` `*`. Se cambia a **400 × 400** y se pulsa
   `Actualizar todos los elementos` para que el lienzo lo refleje.
   X 2440 = 1200 + 20 + 1200 + 20: dos ventanas de 1200 más dos uniones sin
   artículo de 20 mm, lo que confirma que la unión por defecto suma su grosor
   ([RECON-CERRAMIENTOS](RECON-CERRAMIENTOS.md)).
6. Con el fijo seleccionado se pulsa el **cartabón** (icono de escuadra a la
   derecha del panel) y se abre `Diseño V3`, el editor del diseño de ese
   elemento (ver abajo).
7. Ahí el elemento se convierte en **invisible**. Al `Aceptar`, el fijo sigue
   en el conjunto pero no se dibuja: en el lienzo queda el hueco vacío y, al
   seleccionarlo, solo se ve una franja azul en el borde.

Limitaciones de Productor que señala Sergio: una pieza solo se coloca en un
anclaje libre (derecha arriba o izquierda abajo de otra). Si no encaja donde
se quería, hay que eliminarla y volver a arrastrarla. Además, eliminar una
pieza borra en cascada todo lo que está anclado a ella.

### En Aluminior

- **Debajo: verificado y hecho visible el 01/11/2026 (DS2, primer paso).**
  En la web local con el catálogo real, la inserción debajo ya funcionaba:
  existe desde la fase 3 (anclaje `abajo` en
  `core/estructuras/composicion-cerramiento.ts`). Pero solo se llegaba a ella
  con dos puntos verdes diminutos, que aparecían únicamente con una miniatura
  preparada. Los `+` visibles solo ofrecían izquierda y derecha, y la barra
  solo «Colocar X a la derecha». Por eso Sergio no lo encontraba. Cambio:
  `anclajeInferior` (core, `insercion-lateral.ts`) elige el anclaje inferior
  del elemento seleccionado y, si está ocupado, el inferior libre más bajo y
  más a la izquierda. El lienzo tiene un tercer `+` («Añadir ventana debajo»)
  y la barra, «Colocar X debajo» junto a «a la derecha». Reproducido el
  recorrido de las capturas (2O, fijo debajo, 2O a la derecha, fijo debajo de
  esta): conjunto de 2420 × 2420 y fijos en Y 1220. Escritorio y 375 px sin
  desbordamiento.
- **Mover una pieza colocada: implementado el 01/11/2026 (DS2), desviación
  deliberada de Productor**, donde hay que eliminarla y volver a arrastrarla.
  Decisiones de Sergio: recolocar en anclajes (no coordenadas libres) y las
  piezas colgadas de la movida **se quedan fijas**.
  - Ratón: se arrastra la pieza; pasados 6 px aparecen los destinos válidos
    (puntos verdes), el más próximo dentro del radio de captura se resalta
    (ajuste magnético) y al soltar se recoloca. Soltar lejos cancela.
  - Teclado: `Mover elemento` en el panel; los destinos son botones
    enfocables («Mover a la derecha del elemento N») y Enter los aplica.
    `Cancelar mover` o Escape cancelan. El foco vuelve a la pieza movida.
  - Reglas (core `mover-modulo.ts`): la pieza conserva identidad, medidas y
    materiales. Cada pieza que colgaba de ella se re-ancla a un vecino que la
    deje exactamente donde estaba; si alguna no puede, el movimiento se
    rechaza con aviso. Las uniones afectadas nacen sin configurar, porque unen
    piezas distintas. Desde el 06/11/2026 el primer elemento también se mueve:
    la referencia pasa al primer elemento restante que deje a todos en su
    sitio. Un elemento único no se mueve. Solo se ofrecen destinos sin solapes.
  - Efecto en la lista: los elementos se reordenan para que cada pieza siga a
    aquella de la que cuelga, así que su índice puede cambiar.
  - Verificado en la web local: en el 2 × 2 de las capturas, arrastrar la 2O
    derecha bajo el fijo izquierdo deja el fijo derecho en su sitio
    (2420 × 3640); por teclado vuelve a su posición (2420 × 2420). Guardada,
    recargada y conservada como GRUPO «sin valorar» (sin vidrio ni uniones
    configuradas: no da un falso cero).
  - Deshacer y rehacer (06/11/2026, decisión de Sergio, sin equivalente
    observado en Productor): un paso por cada cambio del conjunto (colocar,
    mover, eliminar, sustituir, aplicar medidas, materiales o uniones).
    Ctrl+Z deshace; Ctrl+Y o Ctrl+Mayús+Z rehace; botones «Deshacer» y
    «Rehacer» en la barra. No actúan dentro de un campo de texto, ni con
    borradores sin aplicar, una inserción o un movimiento a medias. Se
    conservan 100 pasos mientras el diseñador está abierto.
  - Pendiente: prueba de Sergio.

## Diseño específico (cartabón) y elemento invisible

**Explicado** en el paso 7. La ventana `Diseño V3` (de la estructura
seleccionada) contiene:

- Barra superior: `Aceptar` (verde), grabar (disquete), **X roja** (elimina el
  elemento seleccionado del diseño; no cancela), **cuadrado blanco**, varita,
  dos iconos de hoja, arco, reguladores. A la derecha, zoom (ajustar,
  acercar, alejar).
- Lienzo con el dibujo técnico del elemento.
- Derecha: pestañas `Elementos` y `Escaparate`. El árbol del fijo muestra
  `Marco Normal` → `Vidrio`. Debajo, pestaña `Estructura` con Ancho/Alto,
  Perfiles, Vidrio, Acabado y Accesorio, cada uno con su lupa.
- Pie: `Cursor` (x : y), dos campos de cota, `Recalcular Dimensiones`,
  `Propiedades Estructura` y `Mostrar/Ocultar Propiedades`.

Para el elemento invisible: se pulsa sobre el dibujo y luego el **cuadrado
blanco** junto a la X roja; se acepta. Uso según Sergio: representar en el
conjunto un espacio que **no se instala**, normalmente una viga o un trozo de
pared, pero que debe aparecer en el documento.

Datos (exportación local de julio, solo lectura): `EstructurasDiseño.bInvisible`
solo es `True` en nodos de tipo 6 (divisiones entre hojas): 683 nodos de
catálogo y 143 en documentos. Aluminior ya los modela como
`division-invisible`. Ese campo **no** es el elemento invisible completo.

**Campo identificado el 02/11/2026** (lectura de copias, solo lectura; ver
[contraste de presupuestos](CONTRASTE-PRESUPUESTOS-2026-11-02.md)): el
elemento invisible es una línea de estructura con `DisEspecificoSN` (en
`VDatosLinEstr` y en `VCerramientosLin`) cuyo diseño de documento
(`EstructurasDiseño`, `TipoDoc = VPRES`, misma `nDoc`/`nLinEstr`) tiene **un
único nodo de `Tipo = 19`** en lugar del árbol `Marco Normal` → `Vidrio`.
`VDatosDiseño` conserva su `DisAncho`/`DisAlto` (400 × 400 en el caso 3) y la
línea guarda `anchoHueco`/`largoHueco` nominales. Observado en 8 de 8: 2 en la
0017, 3 en la 0016 y 3 en la 0015; todos con precio 0, sin despiece y dentro
de un `GRUPO`. `DisEspecificoSN` solo no basta: marca también diseños
específicos con precio (cartabones, divisiones).

**Observado el 02/11/2026** en la 0017. Sergio montó 2O + fijo 400 × 400
invisible + 2O con uniones `GMU038`; ver la
[comparativa, caso 3](COMPARATIVA-PRESUPUESTOS-2026-11-01.md):

- **Dibujo:** el hueco del fijo queda en blanco. Al seleccionarlo, solo se ve
  un contorno azul fino. Las uniones a sus lados se dibujan como tubos de
  400 mm, la altura del fijo.
- **Precio y despiece:** la línea de estructura del fijo existe
  (`FIJO DE 1 HUECO`, 400 × 360) con precio **0** y sin piezas de despiece.
  Las uniones sí se valoran: 4,12 € cada una.
- **Ancho y uniones:** cuenta en el ancho total (2800 = 1160 + 60 + 360 + 60
  + 1160) y en las uniones, que se mantienen y restan su grosor.
- **Documento:** la descripción del `GRUPO` incluye «FIJO DE 1 HUECO DE
  MEDIDAS : 400,0 x 400,0» con color, serie y vidrio. El PDF de Productor no
  se ha emitido todavía.
- Al pasar al día siguiente, el conjunto salió sin serie, vidrio ni acabado,
  y Productor no lo aceptó hasta rellenarlos («Datos incompletos para el
  Elemento»).

**En Aluminior (07/11/2026, DS3, rama `feat/ds3-hueco-panel`):** botón
«Convertir en hueco» en el panel del elemento (y «Volver a ventana» para
deshacerlo; también entra en Deshacer/Rehacer). Se guarda como
`invisible: true` en el módulo (composición v3). Valoración: origen completo a
0 € sin piezas y sin consultar catálogo (regla `ELEMENTO_INVISIBLE`); las
uniones a sus lados se valoran (GMU038 = 4,12 €, como en Productor). Cuenta en
el ancho/alto y se mueve como cualquier elemento. La descripción del `GRUPO`
lo incluye como «FIJO DE 1 HUECO DE MEDIDAS : 400,0 x 400,0» con color, serie
y vidrio. Dibujo: en el lienzo, contorno discontinuo para poder seleccionarlo
(desviación deliberada: en Productor solo se ve al seleccionarlo); en la
miniatura y el PDF, en blanco. Sigue sin existir el editor `Diseño V3`
(cartabón). Las preguntas 6 y 8 siguen siendo del operador; el PDF de
Productor con un invisible sigue sin emitirse, así que el blanco del PDF es
hipótesis.

## Cobertura en Aluminior

| Botón / diálogo | Catálogo en Aluminior | Interacción en Aluminior |
|---|---|---|
| Escaparate de ventanas | Sí: 541 estructuras, 160 dibujables | Sí, con paginación y elección por código (09/11/2026); faltan familias no dibujables |
| Composición a la derecha / debajo | — | Sí: «+» lateral e inferior y botones de la barra (01/11/2026) |
| Mover una pieza colocada | — | Sí: arrastre con ajuste a anclajes y botón «Mover elemento», también el primero; deshacer y rehacer (DS2) |
| Elemento seleccionado | — | Sí, en una fila: posición calculada, medidas (Intro actualiza), compacto y guías, perfiles y vidrio propios (solo con varios elementos o excepción ya guardada), mover, convertir en hueco, eliminar |
| Perfiles (series) | Sí: 57 series | Desplegable de códigos; falta búsqueda con descripción y filtro |
| Vidrio | Sí: familia 050 | Búsqueda por código y descripción |
| Acabado | Sí: 18 acabados | No hay acabado por elemento en el panel del diseñador |
| Unión | Sí: artículos de unión | Parcial; sin «siguiente unión», tipo fija/variable ni escaparate |
| Insertar tapajuntas cerramientos | Sí: 24 tapajuntas (familia 102) | No; función pendiente de explicar |
| Insertar compacto | Sí: 17 compactos y guías 051 | Parcial (09/11/2026): bloque en el panel, cajón dibujado y valoración con opciones predeterminadas; sin registro ni medidas manuales; guías valoradas y ventana estrechada por `DescuentoGuia`, contrastado al céntimo el 12/11/2026 |
| Cartabón / Diseño V3 y elemento invisible | — | Invisible sí, como «Convertir en hueco» (DS3, 07/11/2026); Diseño V3 no |

## Pendiente de explicar

Los puntos 1–5 los resolverá Sergio con su tío, que es quien usa Productor a
diario. Mientras tanto se avanza en todo lo demás y se pule después.
Registrado el 01/11/2026. July no estaba disponible en este equipo: pasar
esta lista a July como pendientes desde el equipo donde está instalado.

1. `Insertar tapajuntas cerramientos` (botón 4): qué hace y cuándo se habilita.
2. Tipo de unión: icono de fija y de variable, y qué cambia. Ya observado el
   efecto de `U` y `GMU038` en medida y precio (ver «Unión»); falta el icono
   y el tipo variable.
3. Registro de persiana frente a compacto y su `Cajón` de 300 mm.
4. ~~Lupa de perfiles: si filtra las series por tipo de estructura.~~
   Resuelta el 01/11/2026: sí filtra.
5. ~~Guías de persiana: otra guía, otra altura, `DescuentoGuia` y los 5 minutos.~~
   Resuelta el 12/11/2026 (ver «Contraste del 12/11/2026»). Queda la fila de
   varias piezas con guías (lectura del 970) y el caso sin descontar el cajón.
6. Elemento invisible: qué se selecciona al «pulsar en la imagen» (el marco o
   el vidrio).
7. Elemento invisible: resuelta el 02/11/2026 salvo el dibujo en el PDF
   emitido. Precio 0, sin despiece, cuenta en el ancho y en las uniones,
   aparece en la descripción y en el diseñador es un hueco en blanco.
8. Elemento invisible: si los 400 × 400 son la medida real de la viga o pared.
9. Pestañas `Módulo`, `Propiedades del Cerramiento` y `Tapajuntas`.
10. Iconos de la derecha de `Elemento seleccionado` (además del cartabón) y
    el rótulo `HUECO`.

## Instalación de Productor

Productor está instalado en `C:\Productor\Aluminio` (ejecutables,
`AluSeries.mdb`, `ConfigDis.mdb`, carpeta `BMP`, CSV de configuración). Solo
se consulta en lectura y sobre copias. Las reglas de
[AGENTS.md](../../AGENTS.md) sobre análisis del sistema original siguen
aplicando. Los datos de empresa están en sus carpetas `EMP00xx`; se observa y
prueba en la 0017.
