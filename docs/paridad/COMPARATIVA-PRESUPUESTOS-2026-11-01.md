# Comparativa de presupuestos Productor / Aluminior — 01–02/11/2026

Mismos cerramientos presupuestados en Productor (empresa de pruebas 0017,
presupuesto 260503) y en Aluminior local (base `aluminior_real_test` con el
catálogo real, presupuesto 260002, rama `feat/ds2-composicion-anclajes`).
Sin capturas ni datos de clientes en el repositorio: los importes son de
cerramientos de prueba y las líneas de Productor se leyeron en solo lectura
sobre una copia de `EMP0017\aluminio.mdb` (`VPresupuestosLin`).

Marcas: **Observado** (visto en pantalla o leído en la base), **Hipótesis**
(sin comprobar). Importes sin IVA salvo que se diga.

## Recorrido común

| Paso | Productor | Aluminior |
|---|---|---|
| Cabecera | Ficha con cliente, F.Pago obligatoria | Nombre libre y «Aceptar y continuar» |
| Nueva línea | `+` verde → tipo `Cerramiento` → diseñador | Pestaña `Cerramiento` del configurador, ya abierta |
| Estructura | Escaparate → categoría → arrastrar miniatura | `+` → categoría → clic en la miniatura |
| Materiales | Por elemento: lupas de Perfiles, Vidrio, Acabado; `Actualizar todos los elementos` | Serie, vidrio, acristalamiento y acabado generales del configurador |
| Uniones | Hay que configurarlas: artículo **y** acabado, o no deja aceptar | Opcionales; sin configurar la línea queda «sin valorar» |
| Aceptar | Genera el despiece (30–90 s) y crea la línea `GRUPO` | Crea la línea al momento |

Diferencias de recorrido observadas:

- Orden del escaparate: en Productor, OSCILOBATIENTES muestra la `2O` en la
  primera página; en Aluminior las estructuras salen por orden alfabético y la
  `2O` está en la tercera página.
- Productor, al aceptar con un elemento sin serie/vidrio/acabado, avisa
  «Datos incompletos para el Elemento…». Con uniones sin artículo o sin
  acabado avisa «Debe seleccionar el Perfil de Unión y su Acabado». Aluminior
  no exige ninguna de las dos cosas.
- Productor hereda serie, vidrio y acabado de la última línea dentro de la
  misma sesión; al día siguiente el conjunto nuevo salió sin materiales.

## Caso 1 — 2O 1200 × 1200, ELEGANTPVC, VCG4, acabado L

| Campo | Productor (observado) | Aluminior (observado) | Diferencia |
|---|---|---|---|
| Artículo | `GRUPO` | `2O` | Sí: Aluminior solo pone `GRUPO` con varios módulos |
| Descripción | Generada: estructura y medidas, color, serie, vidrio | «CERRAMIENTO SEGÚN DIBUJO · 2O» | Sí |
| Acabado (columna) | `UNI` (accesorios) | `L` | Sí |
| Medidas | 1200 × 1200 | 1200 × 1200 | No |
| Precio | 514,31 | 514,31 | No |
| Total con IVA | 622,32 | 622,32 | No |
| Dibujo | Miniatura en la rejilla | Miniatura en la rejilla y en el PDF | — |

## Caso 2 — Conjunto 2 × 2: 2O, fijo debajo, 2O a la derecha, fijo debajo

| Campo | Productor (observado) | Aluminior (observado) | Diferencia |
|---|---|---|---|
| Árbol | 0 2O, 1 fijo, 2 unión, 3 2O, 4 unión, 5 fijo, 6 unión | Igual (mismo orden y numeración) | No |
| Uniones | 3, todas `U` SIN UNION, acabado L | 3, todas `U` | No |
| Grosor de `U` | 1 mm (bloqueado) | 1 mm (solo lectura) | No |
| Medida en el diseñador | 2401 × 2401 | 2401 × 2401 | No |
| Medida guardada en la línea | 2400 × 2400 | 2401 × 2401 | **Sí** |
| Longitud de la unión | 1199,5 | 1200 | Sí, menor |
| Descripción | Las cuatro piezas, cada una con medidas, color, serie y vidrio | «CERRAMIENTO SEGÚN DIBUJO · 2O + 0 + 2O + 0» | Sí |
| Precio | 1.391,88 | 1.391,88 | No |
| Base acumulada (casos 1+2) | 1.906,19 | 1.906,19 | No |

El esperado de la guía (2420 × 2420, uniones de 20 mm) corresponde a uniones
**sin configurar**. Productor no deja aceptar así; con `U` el conjunto mide
2401. Aluminior da 2420 con las uniones sin configurar (línea «sin valorar»).

## Caso 3 — 2O, fijo 400 × 400 invisible, 2O; uniones `GMU038`

Montado por Sergio en Productor (los arrastres a la derecha del agente no
entraron ese día). Uniones: `GMU038` tubo 60 × 60, acabado L.

| Campo | Productor (observado) | Aluminior | Diferencia |
|---|---|---|---|
| Dibujo | Diseñador: hueco del fijo en blanco; al seleccionarlo, contorno azul fino. Uniones dibujadas como tubos de 400 mm (altura del fijo) | PDF: fijo dibujado con vidrio; uniones como tubos de 1200 (toda la altura) | Sí |
| Uniones | `GMU038` con acabado L; también existen en Aluminior, con el mismo despiece (`GM60X60` + MO) | `GMU038`, grosor 60 | No |
| Ancho total | 2800 = 1160 + 60 + 360 + 60 + 1160 | 2920 = 1200 + 60 + 400 + 60 + 1200 | **Sí**: Productor resta el grosor y Aluminior lo suma |
| Medidas guardadas por pieza | 2O: 1200 × 1160; fijo: 400 × 360 | 2O: 1200 × 1200; fijo: 400 × 400 | Sí |
| Longitud de la unión | 400 (lado común) | 1200 | Sí |
| Precio 2O | 511,43 cada una (ancho 1160) | 514,31 cada una (hipótesis: su medida sin restar) | Sí |
| Precio fijo invisible | **0**: línea de estructura sin despiece | Fijo normal valorado (sin invisible, DS3) | Sí |
| Precio uniones | 4,12 cada una (`GM60X60` 400 mm × 10,30 €/m) | Hipótesis: 12,36 cada una (1,2 m × 10,30) | Sí |
| Precio de la línea | 1.031,10 = 2 × 511,43 + 2 × 4,12 | 1.140,28 | **+109,18** |
| Descripción | Lista las tres piezas, **incluido** «FIJO DE 1 HUECO DE MEDIDAS : 400,0 x 400,0» | «CERRAMIENTO SEGÚN DIBUJO · 2O + 0 + 2O» | Sí |
| Medidas de la línea | 2800 × 1200 | 2920 × 1200 | Sí |

Aluminior: presupuesto 260001 de la base recreada el 02/11, guardado, PDF de
una página. El desglose de los 1.140,28 por pieza en Aluminior no se ha leído:
los 12,36 de cada unión son un cálculo a partir de la tarifa y quedan como
hipótesis.

Observado: con un artículo de unión, Productor **resta** su grosor de las
piezas contiguas en lugar de sumarlo (2800 en vez de 2920). Con 60 mm, cada
2O pierde 40 mm de ancho y el fijo 20 mm por lado. Es lo contrario de la
unión sin artículo de 20 mm, que suma (caso 2 y guía). Hipótesis: el reparto
40/20 depende del perfil de cada pieza; hay que contrastarlo con otra serie.

La base local de pruebas es `tmpfs` y se perdió al pararse Docker la noche
del 01/11. Se recreó el 02/11 con las tres cargas: catálogo, despiece
(`etl:catalogo-despiece:local`) y cortes (`etl:cortes:local`). Sin la de
cortes, la 2O sale «sin valorar» por descuentos ausentes, nunca a cero. Con
las tres, el caso 1 vuelve a dar 514,31.

## Caso 4 — Corredera C2 970 × 1999,5, GMC400, VCG4, L (control E7)

| Campo | Productor (observado) | Aluminior (observado) | Diferencia |
|---|---|---|---|
| Lupa de perfiles | Solo series de corredera (`GMC…`, `GMPC…`) | Desplegable con las 57 series | Sí: Productor filtra por tipo de estructura |
| Medida en el diseñador | 970 × 2000 (barra superior redondea) | 970 × 1999.5 | Formato |
| Medida guardada | Largo 2000; descripción «970,0 x 1.999,5» | 970 × 1999.5 | Sí: Aluminior conserva el decimal con punto |
| Precio | 267,77 | 267,77 | No (coincide con E7) |
| Base acumulada (1+2+4) | 2.173,96 | 2.173,96 | No |
| Total con IVA | 2.630,49 | 2.630,49 | No |

## Caso 5 — Caso 1 con compacto COM001 (cajón 155)

| Campo | Productor (observado) | Aluminior |
|---|---|---|
| Diálogo | Botón 5 con el hueco seleccionado → `COM001` por lupa; `Cajón` 155 y acabado L se rellenan solos | No existe (E5) |
| Guías | Se aceptó sin guías y no hubo aviso | — |
| Dibujo | Cajón dibujado sobre la ventana | — |
| Descripción | La de la 2O seguida de «CAJON DE PVC CON LAMA DE ALUMINIO TERMICA» | — |
| Medidas de la línea | 1200 × 1200 (la 2O sigue en 1.200,0 x 1.200,0) | — |
| Precio | 595,76 (514,31 + 81,45 del compacto) | Sin valorar: no se puede presupuestar |

Diferencia anotada para E5. Observado aquí, frente a la guía: en el diseñador
la descripción de la ventana no baja a 1045 de alto. Hipótesis: la resta del
cajón solo se aplica en la ficha de línea.

## PDF y recarga en Aluminior

- Recargado el presupuesto 260002: líneas, importes y totales iguales.
- PDF (2 páginas): número, serie, fecha, estado, destinatario, una fila por
  línea con dibujo y medidas, y totales en la página 2. Diferencias: las
  medidas decimales salen con punto («970 × 1999.5»), sin el formato
  español, y la descripción no detalla serie, vidrio ni color.
- El PDF de Productor no se generó (Emitir no se pulsó en la 0017).

## Conclusiones

1. Precio: casos 1, 2 y 4 coinciden al céntimo, también en totales e IVA.
2. Descripción generada: es la mayor diferencia visible. Productor lista cada
   pieza con medidas, color, serie y vidrio; Aluminior pone un texto genérico.
3. Medida de la línea con uniones: Productor guarda 2400 con `U` y resta el
   grosor de las uniones con artículo, que miden lo que el lado común.
   Aluminior sumaba el grosor y daba a la unión la altura entera (caso 3:
   +109,18 €). **Corregido el 02/11/2026** (ver «Reparto de uniones»).
4. Elemento invisible: tiene precio 0 y no tiene despiece, cuenta en el ancho
   y en las uniones y aparece en la descripción. En el dibujo es un hueco en
   blanco. Datos para DS3.
5. Validación: Productor obliga a dar materiales y uniones antes de aceptar.

## Reparto de uniones: corrección del 02/11/2026

Regla, contrastada con los conjuntos reales de la 0016 (`VPresupuestosLin`,
lectura local; 26 grupos revisados): una unión configurada no añade ancho.
Resta la mitad de su grosor a cada pieza contigua y mide lo que el lado
común. Ejemplos: 960 + `GMU038` + 850 = 1810, con piezas de 930 y 820;
1000 + 700 + 1000 = 2700, con el fijo central en 640; con `GMU039`, 500 → 480;
con `U`, cada pieza pierde 0,5; con `PSU001`, pierde 1. El documento
histórico de seis módulos medía 6300, la suma de piezas.

Implementación (core `medidas-uniones.ts`, posiciones en
`composicion-cerramiento.ts`, valoración en `valorar-cerramiento.ts`). Se
aplica solo a configuraciones con `repartoUniones: 'PIEZAS'`, que pone
`crearConfiguracionCerramiento`. Las líneas guardadas antes, también al
editarlas, conservan su geometría. Así producción no rechaza documentos
existentes por «Dimensiones de línea distintas del snapshot». La unión sin
configurar sigue separando 20 mm y dejando la línea sin valorar.

Verificado en Aluminior local (presupuesto 260001):

| Caso | Antes | Ahora | Productor |
|---|---|---|---|
| 2 × 2 con `U` | 2401 × 2401 · 1.391,88 | **2400 × 2400 · 1.391,88** | 2400 × 2400 · 1.391,88 |
| 2O + fijo 400 + 2O, `GMU038` | 2920 · 1.140,28 | **2800 · 1.117,76** | 2800 · 1.031,10 |
| Cada `GMU038` | — | **4,12** | 4,12 |
| Cada 2O del caso 3 | 514,31 | 512,41 (1170) | 511,43 (1160) |
| Fijo del caso 3 | — | 84,70 | 0 (invisible) |

Diferencias restantes en el caso 3: el fijo invisible (DS3) y el reparto
asimétrico de Productor cuando las piezas tienen alturas distintas (40/20 en
vez de 30/30). Todos los conjuntos históricos revisados reparten 30/30; ese
caso queda abierto con una sola observación. El [contraste del 02/11](CONTRASTE-PRESUPUESTOS-2026-11-02.md) lo confirma: con alturas distintas el 89 % de las uniones reales reparte mitad y mitad; la hipótesis pasa a ser el elemento invisible. La línea antigua del mismo
presupuesto conserva 2920 en el PDF.

## Cobertura del catálogo (02/11/2026)

Pregunta de Sergio: si están guardadas todas las estructuras de cada
categoría del escaparate y si se pueden hacer todas las combinaciones.

- **Guardado:** todo el catálogo está importado: 541 estructuras con sus
  componentes, cotas, árboles de diseño y parámetros de despiece, más los
  artículos con PVP por acabado y tarifa.
- **Uniones:** 52 estructuras de la familia 103; el desplegable ofrece las
  mismas 14 que Productor. 51 tienen todos sus artículos con precio en
  tarifa 1. `GMU038` = `GM60X60` (10,30 €/m en L) + MO, como en Productor.
- **Dibujables en la web:** 160 de 541, contadas en el escaparate local:

| Categoría | En el catálogo | Dibujables en Aluminior |
|---|---:|---:|
| VENTANAS CORREDERAS 90º | 20 | 19 |
| PUERTAS CORREDERAS 90º | 15 | 11 |
| VENTANAS ABATIBLES | 42 | 33 |
| PUERTAS BALCONERAS PRACTICABLE | 31 | 20 |
| FIJOS ABATIBLES | 8 | 7 |
| MALLORQUINAS | 42 | 0 |
| PUERTAS PLEGABLES | 75 | 0 |
| FIJOS CORREDERA | 6 | 5 |
| FORMAS CURVAS-INCLINADAS | 25 | 0 |
| CORREDERAS PERIMETRALES 45º | 11 | 8 |
| CORREDERAS ELEVABLES 45º | 11 | 11 |
| CORREDERAS MONOCARRILES | 21 | 1 |
| OSCILOPARALELAS | 12 | 0 |
| PIVOTANTES | 2 | 0 |
| VAIVEN | 6 | 0 |
| CORREDERAS MINIMALISTAS | 6 | 6 |
| CORTINA CRISTAL | 6 | 6 |
| TECHOS MOVILES | 4 | 0 |
| OSCILOBATIENTES | 40 | 33 |
| PUERTAS DE CALLE | 12 | 0 |
| COMPACTOS | 17 | 0 (función E5) |
| MOSQUITERAS | 4 | 0 |
| PREMARCOS DE OBRA | 0 | 0 |

Las que faltan necesitan dibujo propio: lamas (mallorquinas), plegables,
curvas, zócalos, oscilantes y proyectantes, entre otras
([catálogo real](CATALOGO-REAL-2026-10-02.md)). Que una estructura se dibuje
**no** garantiza que se valore con cualquier serie: el precio depende de la
combinación de estructura, serie, vidrio y acabado. Aquí solo se han
comprobado las cinco de esta comparativa. Las 160 cubrían 728 de los 737
elementos usados en cerramientos reales (medición del 02/10).
