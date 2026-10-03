# Reglas de catálogo para el despiece completo

27/09/2026. Continuación de [fuentes](02-investigacion-fuentes-2026-09-27.md) y
[barrido de facturas](05-primer-barrido-facturas-2026.md). Investigación sobre
copias verificadas; sin escrituras en Productor, Supabase ni base activa.

Resultado principal: los asociados (herraje, escuadras, juntas de hoja,
patillas, kits), la mano de obra de fabricación, el vidrio, los junquillos y
el metraje facturable se derivan de tablas de catálogo de Productor. No hacen
falta modelos aprendidos del histórico. Esto corrige la conclusión de los
anexos T.31, T.49–T.53 de PLAN.md («bloqueo por datos» del oscilobatiente y de
la escuadra de alineamiento): el tramo y la escuadra se reproducen al medir
sobre el elemento correcto con las reglas de `ConjuntosAsoc`.

## Fuentes y método

| Fuente | Uso |
|---|---|
| `export_datos/EMP0016` (CSV de Anterior verificada) | Catálogo: plantillas, conjuntos, asociaciones, descuentos, PVP |
| `output/facturas-2026/` (180 facturas, 28.480 líneas) | Oráculo: despiece guardado por línea de estructura |
| Manual CHM 5.1.2.12.7.7.1 / .7.2, 5.1.2.1.1, 7.5.2.1.x | Semántica de campos de asociación, opciones y metraje |

Las facturas conservan el despiece completo de cada estructura: filas de
plantilla, asociados, acristalamiento, vidrio y minutos de mano de obra. La
medida de cada elemento se tomó de la fila de plantilla emparejada por
función para aislar cada regla; después se contrastan los cortes calculados.
Ningún dato de factura se usa como entrada del motor del producto.

Los recuentos siguientes son de líneas no marcadas como diseño específico
(`DisEspecificoSN`). Las 73 con diseño específico necesitan el árbol de la
instancia y quedan aparte.

## Asociaciones (`ConjuntosAsoc`)

Ámbito en ejecución, deducido de `ConfigSeriesAsoc.TipoHoja` («Aplicable en»)
y de la generación descrita en CHM 5.1.2.12.7.1:

- El conjunto de la serie se evalúa contra los elementos de marco (tipo de
  hoja −1/0) y los virtuales ANCHO/ALTO.
- Cada grupo de hojas (`DisTipoHoja`) selecciona su código de herraje en
  `Conjuntos.herr<clave>`; la clave sale de `SeriesAsocV2TiposHoja.tipo`
  (10 = t2HC → `herr2HC`, 8 = t2HADO → `herr2HA1O`…). Sus asociaciones se
  evalúan contra los elementos de ese grupo y los virtuales ANCHO/ALTO.
- Las estructuras accesorio (uniones) no reciben asociaciones de serie.

Elementos de «Asociado A»:

- Componente: filas de plantilla cuyo componente coincide (`Articulos.Componente`
  del genérico o `DisComponente`); `A`/`L` son los virtuales ancho y alto.
- Grupo de descuento (`GrupoAsoc` ≠ `!`): filas con ese `DisGrupo`.
- Grupo de asociación (`AsocAGrupoAsoc`): componentes listados en
  `FamiliasGruposAsoc.Componentes` (H, HT, ESC, MT, TP, TG, BI, IB…).
- Módulo (`AsocAModulo`): filas `infMOmof` cuyo módulo está en la lista.

Cálculo por elemento: `Cantidad × cantidad del elemento`; `UnidadesMin/Max`;
filtros `MedidaMin/Max` sobre el corte del elemento, mano, posición de trabajo,
apertura (`AperturaTH` = tipo de hoja) y opción. Una fila emitida por elemento;
`SoloUnaSN` limita a una. Artículos ML toman el corte del elemento menos
`Descuento`. `Articulo = 0` y filas sin «Asociado A» no emiten nada.

Artículo principal (`ArticuloAsoc`) en escuadras: se sustituye el informativo
de escuadra por los perfiles con ese artículo del mismo marco u hoja, y
después se aplica `PosTrab`. Contrastado en 125 + 63 + 19 casos de ELEGANTPVC,
GMA350 y GMA60RL. Hipótesis contrastada, no descrita en el manual.

Opciones: se usan las selecciones guardadas del documento para el conjunto; sin
filas guardadas se aplica `ConjuntosOpcionesHerraje.SelecDefSN`. `FormulaOpcion`
admite O/Y como las fórmulas de opciones.

| Familia (serie\|estructura) | Líneas exactas en asociados |
|---|---:|
| ELEGANTPVC 2O / 1O / 0 / 1OI / 1OFI | 67/67 · 33/33 · 11/11 · 4/4 · 3/3 |
| GMC400 C2 / C2P / C4 | 31/31 · 4/4 · 1/1 |
| GMA350 0 / 1 / 1P / 1O | 26/26 · 7/7 · 6/6 · 2/4 |
| GMPC65 PC2 · GMPC76R PC2 | 13/13 · 6/6 |
| GMA65OHS 1O · GMA65OPT 2O · GMA60RL 0/02V/1O/2O | 3/3 · 2/2 · 6/6 |
| Uniones (U, PSU001, PSU006, GMU038, GMU040…) | todas salvo avisos 135 |
| ELEGANTPVC 3HO | 3/5 (tramo de compás en hojas de distinto ancho) |

Diferencias restantes: artículos aviso de Productor (133 «no hay junquillo»,
135 «perfiles sin precio»), dos 3HO y una 2O+1OFI. Barrotillo `BI` y colocación
`MOCOL` son entradas de diseño o manuales, no asociaciones.

## Cortes, división de huecos y vidrio

El resolvedor de referencias del core reproduce sin cambios todos los perfiles
y el vidrio de GMA350 1/1O/1P/0, ELEGANTPVC 1O (297/297) y 0, GMA65OHS 1O,
GMA60RL 0/02V/1O, GMA65OPT 1P/0, GMC400 C2P y C4.

Dos regímenes de grupo adicional explican las hojas horizontales de dos o más
hojas (`DisGrupoAdicional`, `DisGrupoAd2`):

- Abatibles con batiente central `B`: `REF/2 − dto(extremo) − dto(B)/2`.
  Exacto en ELEGANTPVC (35; 5,8), GMA350 (20,2; 7,1), GMA65OHS, GMA65OPT, GMA60RL.
- Correderas con verticales de la hoja `HVL`/`HVC`: se restan además ambos
  descuentos (negativos). Exacto en GMPC65, GMPC76R, GMPC135T, GMPC135R (3
  hojas) y GMC400 (descuentos 0).

Otras variantes (B3, independientes 4HE/4HC, travesaños, cotas FI/FD/TD/F de
la instancia) no están contrastadas y deben bloquear el cálculo.

Vidrio: largo con referencia `DisIdRefLargo` y extremos superior/inferior;
ancho con `DisIdRefAncho` y extremos izquierdo/derecho. C2 GMC400:
`502,25 − 2×31,375 = 439,5` y `1257 − 2×40,25 = 1176,5`.

Junquillos: horizontal = ancho de referencia del vidrio − dto(vecino→JH) por
lado; vertical con JV. GMA350 fijo 480 − 2×26,2; hoja 416,6 − 2×46,1;
ELEGANTPVC 722,1 − 2×57,3. Artículo por grosor en la tabla de acristalamiento.
Juntas de acristalamiento: dos por lado a la medida bruta del módulo del vidrio.

## Mano de obra de fabricación

Filas `infMOmof`: la columna `DisVidrio` contiene el módulo; minutos =
`MOConceptos.TiempoFabr` del concepto con ese `ModuloAsoc` × cantidad. Los
conceptos asociados a artículo (p. ej. 62 fijo independiente) suman sus
minutos. C2: módulo 8 (20) + 15 (20 × 2) = 20 y 40 minutos facturados.
Colocación (`MOCOL`) y compactos son entradas o accesorios aparte.

## Metraje e importe

Importe por fila, redondeado a céntimos, sobre PVP tarifa 1 del acabado:

- UD: cantidad (11.427/11.427 hijas).
- ML: cantidad × metros redondeados a dos decimales por pieza (8.942/8.981).
- M2: cada lado al múltiplo en cm hacia arriba, superficie a dos decimales,
  mínimo y porcentaje de `ArticulosIncrPrecio` (MET por metraje, MED por lado
  mayor) (757/787).

El precio de la estructura es la suma de sus hijas en todas las líneas sin
precio manual (C2 34/34). El PVP de la copia coincide con el unitario de la
mayoría de facturas 2026; los documentos 250 (×0,839) y 421 (×1,393) y
algunos perfiles VS (×0,973) usan otra tarifa o precio anterior.

## Límites y siguiente paso

- Las reglas, importación dirigida y valoración web tienen código integrado
  en main `9bc879e`. Falta carga remota autorizada y contraste de cobertura;
  un resultado incompleto conserva precio nulo. Ver [ensayos posteriores](../INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).
- Diseños específicos, compactos (COM*), cotas de instancia y variantes de
  división no contrastadas quedan pendientes.
- Recuentos locales obtenidos con scripts provisionales; se sustituirán por el
  contraste versionado que usa el core.
