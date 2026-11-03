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
la carpeta local `DIBUJOS\ESTRUCTURAS` y no se copian al repositorio. Desde el 02/11/2026 las uniones
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
grosor (editable, no bloqueado). No hay botón «siguiente unión», tipo
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
| Guías | Izquierda / Derecha: código + ojo + lupa | Guías de persiana (Sergio las explicará más adelante) |
| Forzar medidas manuales | Altura total, Largo guía izq., Largo guía der. (mm) | Sustituyen el cálculo automático |
| Botones | `Aceptar`, `Cerrar`, papelera | Aplicar, salir sin aplicar, quitar el compacto |

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

**En Aluminior: catálogo importado, función sin modelar.** Los 17 `COM…`
están en `estructuras` (familia 100) y como artículos, pero no hay botón,
diálogo, resta de cajón ni valoración. Tarea **E5** del roadmap.


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
    piezas distintas. El primer elemento es la referencia y no se mueve. Solo
    se ofrecen destinos sin solapes.
  - Efecto en la lista: los elementos se reordenan para que cada pieza siga a
    aquella de la que cuelga, así que su índice puede cambiar.
  - Verificado en la web local: en el 2 × 2 de las capturas, arrastrar la 2O
    derecha bajo el fijo izquierdo deja el fijo derecho en su sitio
    (2420 × 3640); por teclado vuelve a su posición (2420 × 2420). Guardada,
    recargada y conservada como GRUPO «sin valorar» (sin vidrio ni uniones
    configuradas: no da un falso cero).
  - Pendiente: deshacer (Ctrl+Z) y mover el primer elemento.

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

**En Aluminior: no existe.** No hay elemento invisible ni editor de diseño
específico por elemento. Tarea `DS3` del roadmap. Las preguntas 6 y 8 siguen
siendo del operador; la 7 queda resuelta salvo el PDF.

## Cobertura en Aluminior

| Botón / diálogo | Catálogo en Aluminior | Interacción en Aluminior |
|---|---|---|
| Escaparate de ventanas | Sí: 541 estructuras, 160 dibujables | Sí, con paginación; faltan familias no dibujables |
| Composición a la derecha / debajo | — | Sí: «+» lateral e inferior y botones de la barra (01/11/2026) |
| Mover una pieza colocada | — | Sí: arrastre con ajuste a anclajes y botón «Mover elemento»; sin deshacer (DS2) |
| Elemento seleccionado | — | Sí: posición calculada, medidas, perfiles, vidrio, actualizar, eliminar |
| Perfiles (series) | Sí: 57 series | Desplegable de códigos; falta búsqueda con descripción y filtro |
| Vidrio | Sí: familia 050 | Búsqueda por código y descripción |
| Acabado | Sí: 18 acabados | No hay acabado por elemento en el panel del diseñador |
| Unión | Sí: artículos de unión | Parcial; sin «siguiente unión», tipo fija/variable ni escaparate |
| Insertar tapajuntas cerramientos | Sí: 24 tapajuntas (familia 102) | No; función pendiente de explicar |
| Insertar compacto | Sí: 17 compactos | No (E5) |
| Cartabón / Diseño V3 y elemento invisible | — | No (DS3) |

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
5. Guías de persiana (Sergio las explicará más adelante).
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
