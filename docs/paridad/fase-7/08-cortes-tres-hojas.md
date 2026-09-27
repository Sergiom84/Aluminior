# Cortes del módulo de tres hojas con travesaño

27/09/2026. Continuación de [reglas de catálogo](06-reglas-catalogo-despiece-completo.md).
Investigación sobre CSV locales; sin base remota ni ejecución de Productor.

## Evidencia y regla

La plantilla de catálogo `3HO` combina una hoja de ancho fijo con un módulo
de dos hojas. Este módulo tiene grupo `HP`, tipo de descuento `2HA1O`,
extremos `TMG` y `MV`, y un único grupo adicional `B`. No usa `B3`.

| Fuente | Campos y función |
|---|---|
| `EstructurasArticulos` de catálogo (`TipoDoc` vacío) | `DisIdRefLargo`, `DisFRefLargo`, `DisGrupoI/D`, `DisGrupoAdicional`: referencia y reparto del hueco |
| `ConjuntosDescuentos` | `GrupoPrinc`, `Grupo`, `TipoHoja`, `Descuento`: descuentos de ambos extremos y del batiente |
| Facturas 2026, cinco líneas `3HO` no específicas | `LargoCorte`, `AnchoCorte`, artículo y cantidad: resultado independiente |

El corte horizontal del módulo es:

```text
F(REF) − (dto(TMG → HP) + dto(MV → HP) + dto(B → HP)) / 2
```

La fórmula `F`, incluido el ancho reservado a la primera hoja, procede de
la plantilla. Ninguna cota ni descuento del taller se fija en el motor.
Los tres descuentos mantienen la prioridad del tipo de hoja específico y
la alternativa general `G` del resolvedor existente.

La ampliación está limitada a `HP`/`2HA1O`, con ambos extremos `TMG`/`MV`
en cualquier orden y un único adicional `B`. No habilita `B3`, combinaciones
de varios adicionales, otros tipos de hoja ni otros extremos mixtos.
Se mantienen los bloqueos por descuento ausente o ambiguo y su propagación
a perfiles y vidrios dependientes.

## Contraste ejecutado

Las cinco líneas no específicas contienen 707 filas de material:

| Origen del motor | Filas contrastadas |
|---|---:|
| Perfiles de plantilla | 105 |
| Asociados | 497 |
| Vidrios | 15 |
| Junquillos y juntas de acristalamiento | 90 |

Coinciden artículo, cantidad y ambas dimensiones aplicables a la precisión
de una décima usada por el contraste versionado. La igualdad binaria sin
redondeo no se afirma: 12 dimensiones de vidrio conservan residuos numéricos
de hasta 0,0001 mm en los CSV frente al cálculo decimal del motor.

La regla desbloquea específicamente 20 horizontales de hoja, sus diez
perfiles dependientes y el ancho de diez vidrios. Los demás materiales de
las cinco líneas también se han comparado, incluidos asociados y
acristalamiento; no se ha limitado el contraste al perfil corregido.

## Mano de obra del travesaño

`MOConceptos` 00113 declara `GrupoAsoc=TMG`, `TiempoFabr=10` y
`CodArticulo=MO`, sin preparación ni incrementos. Cada una de las cinco
plantillas tiene un elemento TMG de cantidad uno. El multiconjunto de
mano de obra de cada factura, descontadas las aportaciones ya soportadas
de módulos y artículos, deja exactamente una fila de diez minutos.

El motor admite ahora el concepto asociado exclusivamente a `TMG`, con
`TiempoFabr × cantidad` por elemento. No fija el código 00113 ni sus diez
minutos. Mantiene bloqueados otros grupos y los conceptos que combinan
el grupo con módulo, artículo o componente. La guarda de incrementos sigue
activa, y una fila de cantidad cero no emite tiempo.

El contraste completo pasa de 707 materiales a 742 filas, incluyendo 35
aportaciones de mano de obra. Las cinco líneas tienen total calculable y
cero incidencias. Un importe coincide al céntimo con su factura; los otros
cuatro conservan diferencia económica aunque artículos, cantidades,
dimensiones y mano de obra coinciden. Esta prueba no atribuye automáticamente
esa diferencia a tarifas: el contraste general separa sus causas.

Corroboración adicional ejecutada: los 22 presupuestos no específicos con
TMG reproducen el multiconjunto completo de mano de obra: 16 `3HO`, dos
`1PFS` y un `2OPFS` de ELEGANTPVC, un `1PFS` de GMA60RL y dos de GMA350.
Cuatro llevan ajuste manual; uno contiene minutos fraccionarios. El cálculo
conserva `HorasAdFabr × 60` sin redondear a minutos enteros. No se incluyen
documentos ni identificadores en este informe.

## Procedencia de los CSV

SHA-256 de las fuentes directas del corte, mano de obra y oráculo de facturas:

| Archivo | SHA-256 |
|---|---|
| `export_datos/EMP0016/EstructurasArticulos.csv` | `99D1889F5754B7E93A611EEA200B7B1325A0FB10DA29CBC30AD8719297C56380` |
| `export_datos/EMP0016/ConjuntosDescuentos.csv` | `474986429551470E85FDC987BC1902235E3419A7669A51D37CA2540CD55D1945` |
| `export_datos/EMP0016/MOConceptos.csv` | `02AB002688751665250070934F76E9FE99BDF2DC3AA105FDCB7D3CC594C48698` |
| `output/facturas-2026/lineas.csv` | `0ADC49826E0B5FD74589A5BE94E340ABF26BEC6A6139B695A51CC651FFB7A06D` |
| `output/facturas-2026/configuraciones.csv` | `8CDB045457E8AC46ACA8AAE7F66E35D061FF9912442339E1FA47095FA944B6B1` |

## Pruebas

La corroboración adicional de los minutos de mano de obra (no precios ni
cortes de esos 22 presupuestos) se reproduce con:

```powershell
node --import tsx scripts/contrastar-mano-obra-tmg.mjs export_datos/EMP0016
```

Fuentes adicionales de ese ensayo:

| Archivo | SHA-256 |
|---|---|
| `VPresupuestosLin.csv` | `720d373a01b34d6c7ad7205e46db58c59e2106964197396515e8e3d99bdd1a62` |
| `VDatosLinEstr.csv` | `ee486a685442de652929d4d4d687f2154087f1935f9cbbe09a768d5df75c7c4a` |

```powershell
npx vitest run packages/core/src/despiece/cortes-referenciados.test.ts packages/core/src/despiece/medidas-plantilla-tres-hojas.test.ts packages/core/src/despiece/medidas-plantilla.test.ts packages/core/src/despiece/mano-obra-fabricacion.test.ts
npm run -w @aluminior/core typecheck
npm run check:architecture
node --import tsx scripts/contrastar-cortes-tres-hojas.mjs export_datos/EMP0016 output/facturas-2026
```

Resultado focal: 41 pruebas correctas. Los tests sintéticos verifican ambos
órdenes de extremos, descuentos específicos, cambios de cota, perfiles
dependientes, ambos ejes del vidrio, propagación de errores y la asociación
de mano de obra por grupo. Revertidos temporalmente los dos bloques nuevos,
se midieron nueve fallos (seis de cortes y tres de mano de obra); restaurados,
pasan los 41. Typecheck y arquitectura también pasan.

El script versionado `scripts/contrastar-cortes-tres-hojas.mjs` recibe las
carpetas por argumento y verifica las filas completas, ambos ejes del vidrio
y la mano de obra. Exige encontrar al menos un caso y ausencia de incidencias;
informa de importes exactos y residuos numéricos sin afirmar igualdad binaria.
Solo imprime agregados. No se versionan documentos, datos personales ni CSV.

## Cotas de instancia: siguiente unidad

El motor ya admite `EntradaLineaCatalogo.cotas`. El contraste y la entrada
web aún deben aportar la cota elegida para cada línea cuando la plantilla
la necesita. En ocho líneas bloqueadas por variable ausente se localizaron
seis entradas explícitas mediante:

```text
VMedidasDA (TipoDoc, nDoc, nLinEstr, Estructura, nDA, Medida)
  → EstructurasDA (Estructura, nDA, SimboloDA)
```

Contienen `FI`, `TD` o `F`. Son medidas de entrada, no cortes extraídos del
despiece. Dos líneas no tienen esta entrada directa en la factura: requieren
seguir la procedencia documental o demostrar el uso del valor de catálogo.
No se deben rellenar con cero ni inferirlas de los cortes guardados.

Un futuro lector debe conservar el tipo de documento en su clave, rechazar
valores no finitos y símbolos duplicados incompatibles, y evitar que las
cotas sustituyan `A`, `L` o `REF`. Si se añaden fuentes de instancia como
`EstructurasDiseño` o `VEstructurasVariables`, su prioridad necesita evidencia
explícita. Esta unidad no cambia formularios, persistencia ni fuentes de entrada.
