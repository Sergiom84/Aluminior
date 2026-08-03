# Especificación: mano de obra del cerramiento

Fecha: 3 de agosto de 2026. Estado: **propuesta corregida, pendiente de aprobación**.
Evidencia: `PLAN.md` anexos T.32, T.67.1 y T.67.2, más la medición del §13.

Nada de esto está implementado. No hay esquema, migración ni valoración escritos.

## 1. Qué se está resolviendo

El configurador guarda hoy dos importes en euros (`ajuste_fabricacion`,
`ajuste_colocacion`) que el operador teclea a mano. Medido en T.67.1: en
Productor eso son **horas**, y el titular lo confirmó —`1,5` es una hora y
media—. La valoración agregada del cerramiento no puede construirse sobre un
campo cuya unidad no coincide con la del sistema que se reconstruye.

Tres conceptos distintos:

| Concepto | Origen | Se teclea | Se valora en |
|---|---|---|---|
| Fabricación base | Calculada: `Σ (nº módulos × TiempoFabr)` | — | Minutos |
| Fabricación adicional | Manual | Horas con decimales | Minutos = horas × 60 |
| Colocación adicional | Manual | Horas con decimales | Minutos = horas × 60 |

**La fabricación base queda FUERA de esta especificación.** Depende del recuento
de módulos, el tapón abierto de T.31/T.32.3. El modelo se diseña para poder
admitirla después, pero admitirla costará una migración (§4).

## 2. Qué representa cada fila de la tabla

Decisión: **categoría agregada de mano de obra, no línea de artículo real.**

Una fila = un concepto de mano de obra de una línea de presupuesto, con su
snapshot económico. El operador teclea un número por concepto; eso es lo que se
guarda. Productor materializa además líneas de artículo `MO`/`MOCOL` porque su
motor de precios y su hoja de producción trabajan sobre líneas, pero eso es su
representación interna: en Aluminior el cerramiento ya vuelve como una sola
línea `GRUPO` agregada, y desagregar la mano de obra en líneas visibles sería
una decisión de producto distinta, no tomada.

Consecuencias, dichas sin adorno:

- **La invariante actual es una fila por concepto y línea.** Se expresa como
  `UNIQUE (linea_id, concepto)` sobre una clave primaria subrogada `id`, no como
  clave primaria compuesta. Si algún día hacen falta varias entradas del mismo
  concepto —dos partidas de colocación con artículos distintos, por ejemplo—,
  relajarlo es eliminar ese índice único: una migración pequeña, sin conversión
  de datos y sin pérdida. Con clave primaria compuesta habría que reconstruir la
  tabla.
- **Añadir un concepto nuevo SÍ requiere migración.** `concepto` lleva un `CHECK`
  cerrado, y ampliarlo es `ALTER TABLE ... DROP CONSTRAINT / ADD CONSTRAINT`. No
  es cierto que la tabla admita los siete conceptos del catálogo sin tocar el
  esquema; la afirmación anterior era falsa. Lo que sí evita la tabla es añadir
  dos columnas por concepto a `lineas_cerramiento` cada vez.
- El `CHECK` cerrado se mantiene a propósito: un concepto desconocido escrito por
  error es un fallo de escritura, no una fila silenciosa que nadie valora.

## 3. Modelo de datos propuesto

### `lineas_mano_obra`

| Columna | Tipo | Nulo | Papel |
|---|---|---|---|
| `id` | `uuid` | no | Clave primaria subrogada, `DEFAULT gen_random_uuid()` |
| `linea_id` | `uuid` | no | FK a `lineas.id`, `ON DELETE CASCADE` |
| `concepto` | `text` | no | `FABRICACION_ADICIONAL` · `COLOCACION` (`FABRICACION_BASE` se añade cuando exista) |
| `origen` | `text` | no | `MANUAL` (`CALCULADO` se añade con la base) |
| `horas` | `numeric(6,2)` | sí | Entrada del operador. `null` en lo calculado |
| `minutos` | `numeric(10,2)` | no | Lo que se valora. `horas × 60` en lo manual |
| `articulo_codigo` | `text` | no | `MO`, `MOCOL`. El artículo aplicado |
| `articulo_descripcion` | `text` | no | Descripción del artículo **en el momento de valorar** |
| `unidad` | `text` | no | Unidad valorada. Hoy siempre `MINUTO` |
| `acabado_codigo` | `text` | sí | `UNI` en toda la mano de obra medida |
| `tarifa` | `smallint` | no | La del documento al valorar |
| `precio_minuto` | `numeric(12,4)` | sí | PVP del artículo en esa tarifa, en ese momento |
| `importe` | `numeric(14,2)` | sí | `minutos × precio_minuto`, congelado |
| `coste_minuto` | `numeric(12,4)` | sí | Coste del artículo en ese momento |
| `coste_total` | `numeric(14,2)` | sí | `minutos × coste_minuto`, congelado |
| `valoracion_completa` | `boolean` | no | `false` si el importe de venta no se pudo fijar |
| `motivo_codigo` | `text` | sí | Código estable de por qué no hay importe |
| `motivo_coste_codigo` | `text` | sí | Código estable de por qué no hay coste |
| `evaluado_en` | `timestamptz` | no | Cuándo se intentó valorar. Se escribe también cuando falla |

`UNIQUE (linea_id, concepto)`. Índice por `linea_id`.

### Por qué el snapshot incluye descripción y unidad

Sin clave ajena a `articulos` (§3.1), el código por sí solo no basta: si el
artículo desaparece del catálogo o cambia de descripción, un presupuesto de hace
tres años no podría explicar qué se cobró. `articulo_descripcion` y `unidad`
congelan lo que el documento afirmaba. Es el mismo criterio que ya sigue
`lineas.descripcion`, que no se relee del catálogo.

### Por qué se congela también el coste

Decisión: **sí, se congela.** `coste_minuto` y `coste_total` entran en el
snapshot.

- La rentabilidad histórica es un uso real: sin coste congelado, comparar margen
  de un presupuesto antiguo obliga a suponer que el coste de hoy era el de
  entonces, y eso es inventar.
- Es coherente con lo que ya hace `lineas_despiece`, que guarda `coste_unitario`
  y `coste_total` por pieza.
- Hay un hallazgo que sólo se ve con el coste congelado: hoy coste y PVP de la
  mano de obra son idénticos (`0,5000`), es decir margen cero. Sin registrarlo,
  ese dato se pierde en cuanto alguien toque el catálogo.

Coste ausente **no** invalida la línea: el precio de venta es lo que decide si el
documento está valorado. Un coste que falta deja `coste_minuto` y `coste_total`
en `null` y no toca `valoracion_completa`.

### 3.0 Códigos estables, no frases

Los motivos se guardan como **código**, nunca como texto libre. El texto visible
se deriva del código en la capa de presentación, no se persiste: la lógica y las
restricciones no deben depender de comparar frases, que cambian al reescribir un
mensaje o al traducir.

`motivo_codigo` — por qué no hay importe de venta:

| Código | Causa | `precio_minuto` guardado |
|---|---|---|
| `SIN_PVP` | El artículo no tiene fila en `articulos_pvp` para esa tarifa | `null`, no existe |
| `PVP_CERO` | La tarifa tiene el precio a `0,0000` | `0`, el valor real |
| `IMPORTE_FUERA_RANGO` | `minutos × precio_minuto` no cabe en `numeric(14,2)` | **El precio real**, positivo |

`motivo_coste_codigo` — por qué no hay coste:

| Código | Causa |
|---|---|
| `SIN_COSTE` | El artículo no tiene fila en `articulos_coste` |
| `COSTE_AMBIGUO` | Varias filas con costes distintos y ninguna del acabado aplicado |
| `COSTE_FUERA_RANGO` | `minutos × coste_minuto` no cabe en `numeric(14,2)` |

**El precio defectuoso se conserva.** En `IMPORTE_FUERA_RANGO`, `precio_minuto`
guarda el valor real del catálogo. Ponerlo a `null` borraría la única evidencia
de que ese artículo tiene un precio imposible, que es justo lo que hay que poder
investigar después. Lo mismo con `PVP_CERO`: un cero guardado como cero dice
«tarifa sin rellenar»; un `null` diría «no había fila», que es otra cosa.

### 3.1 Sin clave ajena a `articulos`

`articulo_codigo` queda sin FK, igual que `lineas_despiece.articulo_codigo`. El
catálogo se recarga por ETL y una FK convertiría una reimportación en un fallo
de escritura sobre documentos históricos. El snapshot debe sobrevivir a que el
artículo desaparezca: para eso guarda también descripción y unidad.

### 3.2 Escalas, y el desbordamiento del producto

| Columna | Escala | Motivo |
|---|---|---|
| `horas` | `numeric(6,2)` | Máximo 9.999,99 h. Dos decimales cubren lo observado (§13). Acota el producto |
| `minutos` | `numeric(10,2)` | `9.999,99 h × 60 = 599.999,40 min`. Un decimal basta, dos dan margen |
| `precio_minuto` | `numeric(12,4)` | Misma escala que `articulos_pvp.precio` |
| `importe` | `numeric(14,2)` | Máximo 999.999.999.999,99 |

**El producto puede desbordar aunque cada factor quepa.** `minutos` máximo
(599.999,40) por `precio_minuto` máximo de la columna (99.999.999,9999) da un
número muy por encima de `numeric(14,2)`. El precio viene del catálogo, no del
formulario, así que acotarlo en la entrada no protege.

**El coste desborda igual.** `coste_minuto` tiene la misma escala que
`precio_minuto` y se multiplica por los mismos minutos, así que necesita la misma
protección. Proteger sólo la venta dejaría el fallo crudo de PostgreSQL en la
otra mitad de la escritura.

Protección, en dos capas:

1. **En la aplicación, antes de escribir**: si `minutos × precio_minuto` supera
   el máximo de `numeric(14,2)`, la fila se guarda como **valoración incompleta**
   con `motivo_codigo = 'IMPORTE_FUERA_RANGO'`, conservando el precio real. Si es
   `minutos × coste_minuto` el que desborda, se guarda `coste_total` a `null` con
   `motivo_coste_codigo = 'COSTE_FUERA_RANGO'`, **sin tocar la venta**. En ningún
   caso se lanza el error de PostgreSQL: un catálogo con un valor absurdo debe dar
   un presupuesto sin valorar, no una pantalla rota.
2. **En el esquema**: `CHECK` de no negatividad. La columna ya impone su techo.

Las pruebas correspondientes están en §10.

### 3.3 Restricciones

RLS activado sin políticas de cliente, igual que `lineas_cerramiento`.

```
-- valores admitidos
CHECK (concepto IN ('FABRICACION_ADICIONAL', 'COLOCACION'))
CHECK (origen IN ('MANUAL'))
CHECK (motivo_codigo IS NULL OR motivo_codigo IN ('SIN_PVP', 'PVP_CERO', 'IMPORTE_FUERA_RANGO'))
CHECK (motivo_coste_codigo IS NULL OR motivo_coste_codigo IN ('SIN_COSTE', 'COSTE_AMBIGUO', 'COSTE_FUERA_RANGO'))

-- coherencia horas / minutos / origen
CHECK (origen <> 'MANUAL' OR horas IS NOT NULL)
CHECK (horas IS NULL OR minutos = ROUND(horas * 60, 2))
CHECK (horas IS NULL OR horas > 0)
CHECK (minutos > 0)

-- rangos
CHECK (precio_minuto IS NULL OR precio_minuto >= 0)
CHECK (importe IS NULL OR importe >= 0)
CHECK (coste_minuto IS NULL OR coste_minuto >= 0)
CHECK (coste_total IS NULL OR coste_total >= 0)

-- estado de VENTA, bidireccional. El precio queda libre en la rama incompleta:
-- puede ser null, cero o positivo, y cuál de los tres es lo dice el código.
CHECK (
  (valoracion_completa
     AND precio_minuto IS NOT NULL AND precio_minuto > 0
     AND importe IS NOT NULL
     AND motivo_codigo IS NULL)
  OR
  (NOT valoracion_completa
     AND importe IS NULL
     AND motivo_codigo IS NOT NULL)
)

-- cada código exige el precio que le corresponde, para que la evidencia no se
-- pueda falsear desde la aplicación
CHECK (motivo_codigo <> 'SIN_PVP' OR precio_minuto IS NULL)
CHECK (motivo_codigo <> 'PVP_CERO' OR precio_minuto = 0)
CHECK (motivo_codigo <> 'IMPORTE_FUERA_RANGO'
       OR (precio_minuto IS NOT NULL AND precio_minuto > 0))

-- estado de COSTE, independiente de la venta
CHECK (
  (coste_total IS NOT NULL AND coste_minuto IS NOT NULL AND motivo_coste_codigo IS NULL)
  OR
  (coste_total IS NULL AND motivo_coste_codigo IS NOT NULL)
)
```

Notas sobre lo que estas restricciones deciden:

- **`minutos` cero no se guarda.** `CHECK (minutos > 0)` junto con `horas > 0`:
  un concepto sin horas **no genera fila** (§4). Una fila de cero minutos sería
  ruido que después habría que filtrar en cada consulta.
- **El estado económico no admite mezclas.** No se puede tener
  `valoracion_completa = false` con importe, ni `true` con motivo. Era el agujero
  de la versión anterior.
- **El precio no se falsea para encajar en la restricción.** La rama incompleta
  admite precio nulo, cero o positivo, y el `CHECK` por código obliga a que
  coincida con la causa: `SIN_PVP` sólo con precio nulo, `PVP_CERO` sólo con
  cero, `IMPORTE_FUERA_RANGO` sólo con un precio real positivo. Así el estado
  imposible sigue siendo imposible y la evidencia del catálogo defectuoso se
  conserva.
- **El coste es independiente.** Su estado tiene su propia restricción y su
  propio código. Un coste que falta, es ambiguo o desborda deja `coste_total` en
  `null` con su motivo, y **no** toca `valoracion_completa`: lo que decide si el
  documento está valorado es el precio de venta.

## 4. Cuántas filas escribe cada línea

En esta fase, **cero, una o dos**, nunca tres:

| Situación | Filas |
|---|---|
| Sin horas de fabricación adicional ni de colocación | 0 |
| Sólo una de las dos con horas > 0 | 1 |
| Ambas con horas > 0 | 2 |
| Fabricación base | Ninguna. No se implementa aquí |

Un `0` tecleado es «no hay mano de obra adicional», no «hay cero minutos de
trabajo». No genera fila.

## 5. Compatibilidad con `ajuste_fabricacion` / `ajuste_colocacion`

Hecho verificado el 3/8/2026 contra la base de trabajo: **`lineas_cerramiento`
tiene 0 filas y `lineas` tiene 0 filas.** No hay ni un dato real que convertir.
La compatibilidad es un problema de código, no de datos.

Dos migraciones separadas, nunca en la misma:

1. **Aditiva.** Crea `lineas_mano_obra`. `ajuste_fabricacion` y
   `ajuste_colocacion` se quedan, marcados como obsoletos en el esquema Drizzle
   con un comentario que apunta aquí. El código nuevo escribe la tabla y deja de
   escribir esos dos campos.
2. **Sustractiva, en una iteración posterior.** Los elimina, cuando ningún módulo
   los lea y se haya confirmado en el entorno real que no hay filas con valor
   distinto de cero.

Si al aplicar la primera migración algún entorno tuviera ajustes no nulos —hoy
ninguno—, la conversión **no** es automática: un importe en euros no se puede
pasar a horas sin conocer el precio por minuto que se aplicó, que es justo el
dato que falta. Esas filas se listan para decisión manual y se dejan intactas.

## 6. Migración y reversión

Aplicación, igual que la 0017:

1. Generar el SQL con `drizzle-kit generate` y leerlo entero antes de nada.
2. Aplicar sobre el Postgres efímero y pasar la suite de integración.
3. Aplicar en el entorno real con alcance explícito.
4. Verificación reversible: presupuesto de prueba con sus filas de mano de obra,
   comprobación del snapshot, borrado y confirmación de cero residuo.
5. Orden de despliegue: **migración primero, código después**. Al revés, el
   código escribiría en una tabla inexistente. Se replica la guarda que ya existe
   (`comprobarPersistenciaCerramientos`).

Reversión, y aquí hay dos regímenes distintos que no se pueden prometer igual:

- **Antes de que el código nuevo escriba**: `DROP TABLE lineas_mano_obra` es
  reversión limpia. No hay datos de negocio dentro y nada depende de ella.
- **Después de que el código escriba**: `DROP TABLE` **pierde datos**. La
  reversión correcta es, en este orden: (1) desplegar el código anterior, que no
  lee ni escribe la tabla; (2) exportar las filas existentes; (3) sólo entonces,
  si procede, eliminar la tabla. Volver atrás en ese punto deja los presupuestos
  creados en el intervalo sin su mano de obra, con importes que ya no cuadran.
  No es una reversión sin pérdida y no debe presentarse como tal.

## 7. Snapshot económico

Al guardar una línea, y al cambiar las horas de una existente, por cada concepto
con horas > 0:

1. Resolver el artículo: `FABRICACION_ADICIONAL → MO`, `COLOCACION → MOCOL`.
   Medido en T.67.1.
2. Leer `articulos` (descripción) y `articulos_pvp` por `(articulo_codigo,
   tarifa del documento, acabado 'UNI')`.
3. Convertir: `minutos = ROUND(horas × 60, 2)`.
4. Calcular `importe = ROUND(minutos × precio_minuto, 2)`, con la guarda de
   desbordamiento del §3.2.
5. Leer `articulos_coste` y calcular `coste_total = ROUND(minutos × coste_minuto, 2)`.
   Su ausencia no invalida la venta.
6. Escribir la fila completa con `evaluado_en`.

**Cómo se elige la fila de `articulos_coste`.** La tabla tiene coste por acabado
y el artículo puede tener varios. Se aplica el mismo criterio que ya usa el
despiece en `acciones.ts`, para no inventar un segundo:

1. Si existe fila del acabado aplicado (`UNI` en toda la mano de obra medida), se
   usa esa.
2. Si no, y todas las filas del artículo tienen el MISMO coste, se usa ese valor:
   no hay ambigüedad que resolver.
3. Si no, y hay costes distintos, **no se elige uno**: `coste_total` queda `null`
   con `motivo_coste_codigo = 'COSTE_AMBIGUO'`. Un coste adivinado falsearía el
   margen.
4. Si no hay ninguna fila: `SIN_COSTE`.

Medido hoy: los seis artículos de mano de obra con coste tienen una sola fila,
acabado `UNI`, `0,5000`. El caso ambiguo no se da todavía, y por eso mismo
conviene decidirlo ahora y no cuando aparezca.

Todo dentro de la MISMA transacción que la línea, por `guardarLinea`. Una línea
con mano de obra sin su fila de mano de obra es un documento corrupto, igual que
un `GRUPO` sin configuración.

## 8. Edición, revaloración y precios que cambian

Tres operaciones distintas, y sólo una recalcula sola:

| Acción del operador | Efecto sobre el snapshot |
|---|---|
| Editar referencia, descripción, ubicación, o cualquier campo ajeno a la mano de obra | **Ninguno.** El snapshot se conserva intacto, con su `evaluado_en` original |
| Cambiar las horas de un concepto | Se recalcula **sólo ese concepto**. El otro conserva su snapshot |
| Poner a cero las horas de un concepto | Se elimina la fila de ese concepto. El otro no se toca |
| Cambiar la tarifa del documento | **Ninguno.** El documento queda con una tarifa distinta de la del snapshot, y esa discrepancia debe ser visible |
| Cambiar el PVP en el catálogo | **Ninguno.** Ningún documento existente se toca |
| Revalorar (acción propia, fase posterior) | Recalcula los conceptos elegidos, mostrando importe anterior y nuevo antes de confirmar |

Regla de fondo: guardar una línea **no** es motivo para revalorar. Sólo lo es
cambiar el dato de entrada de ese concepto, o pedirlo explícitamente.

## 9. Precio cero, precio ausente y «todo o sin valorar»

Dos casos reales medidos, no hipotéticos: las tarifas 2 y 3 tienen la mano de
obra a `0,0000`, y `MOMOSQ` no tiene fila de PVP en ninguna tarifa.

| Situación | `precio_minuto` | `importe` | `valoracion_completa` | `motivo_codigo` |
|---|---|---|---|---|
| PVP presente y > 0 | valor | calculado | `true` | `null` |
| PVP presente = `0,0000` | `0` | `null` | `false` | `PVP_CERO` |
| Sin fila de PVP | `null` | `null` | `false` | `SIN_PVP` |
| Producto fuera de rango (§3.2) | **el precio real** | `null` | `false` | `IMPORTE_FUERA_RANGO` |

El texto que ve el operador se deriva del código —«mano de obra a precio cero en
la tarifa 2»— y no se guarda. Y el coste corre por su cuenta: `SIN_COSTE`,
`COSTE_AMBIGUO` o `COSTE_FUERA_RANGO` dejan `coste_total` en `null` sin afectar a
`valoracion_completa`.

Un cero en la tarifa **no** es mano de obra gratis: es catálogo sin rellenar.

Regla del dinero, sin excepción: si cualquier concepto de mano de obra queda sin
valorar, la línea `GRUPO` entera queda con `precio_unitario` y `total` en `null`
y su aviso. Nunca cero, nunca un total parcial. Se reutiliza `lineaValorable` de
`@aluminior/core/precios`, añadiendo los motivos de mano de obra.

**Tarifas 2 y 3: decisión del titular, tomada.** No se restringen. El
comportamiento correcto es que el documento quede sin valorar con el motivo
visible («mano de obra sin precio en la tarifa 2»), y que el catálogo se corrija.
Ocultar tarifas podría romper otros usos que no se han inventariado.

## 10. Pruebas

**Unitarias, en `packages/core` (puras, sin E/S):**

- `horasAMinutos`: `1,5 → 90`; `0,25 → 15`; `2,37 → 142,2` (caso real del §13);
  rechazo de negativos.
- Valoración de un concepto: importe con precio presente; `null` con `PVP_CERO`;
  `null` con `SIN_PVP`; `null` con `IMPORTE_FUERA_RANGO` **conservando el precio
  real**; redondeo a céntimo.
- Coste: ausente da `SIN_COSTE`; varios costes distintos sin acabado aplicable dan
  `COSTE_AMBIGUO`; producto desbordado da `COSTE_FUERA_RANGO`. Ninguno de los tres
  cambia `valoracion_completa` ni el importe de venta.
- `lineaValorable` con motivos de mano de obra: un concepto sin valorar deja la
  línea sin valorar.

**Unitarias, en `packages/web`:**

- Escala de `horas`: acepta `1.5`, `0.25`, `2.37`; rechaza `0.001`, exponencial,
  coma decimal y negativos, con el mismo tratamiento que T.67.
- Campo vacío = sin horas, no error.
- Errores visibles con `aria-invalid` y `aria-describedby`.

**Integración, contra el Postgres efímero:**

- **Cero filas** cuando no se teclean horas.
- **Una fila** cuando sólo se teclea uno de los dos conceptos.
- **Dos filas** cuando se teclean ambos. *(No hay prueba de tres filas: la
  fabricación base no se implementa en esta fase.)*
- Snapshot íntegro al releer, incluidos descripción, unidad y coste.
- Fallo intermedio en `lineas_mano_obra` no deja línea huérfana, con restricción
  real, como ya hace `persistencia.integracion.test.ts`.
- Tarifa con precio `0,0000`: fila incompleta y `GRUPO` con `total` `null`.
- Artículo sin PVP: idéntico.
- Precio absurdo que desborda `numeric(14,2)`: fila incompleta con
  `IMPORTE_FUERA_RANGO`, el precio real guardado y sin excepción de PostgreSQL.
- Coste absurdo que desborda: `coste_total` `null` con `COSTE_FUERA_RANGO`,
  mientras la venta sigue completa.
- **Editar un campo ajeno no altera `evaluado_en` ni el importe.**
- **Cambiar las horas de un concepto no toca el snapshot del otro.**
- Cambiar el PVP tras guardar no altera el importe del documento.
- El `CHECK` de venta rechaza los cuatro estados imposibles: completa sin
  importe, completa con motivo, incompleta con importe, incompleta sin motivo.
- El `CHECK` por código rechaza la evidencia falseada: `SIN_PVP` con precio,
  `PVP_CERO` con precio distinto de cero, `IMPORTE_FUERA_RANGO` con precio nulo.
- El `CHECK` de coste rechaza `coste_total` con motivo y `coste_total` nulo sin él.

**Interfaz:**

- Etiqueta y unidad pasan de euros a horas, con comparación de tarea contra
  Productor: mismos pasos, mismo orden de foco, misma densidad.
- Sin DOM: se verifica el elemento del mensaje de error, como ya se hace.

## 11. Módulos afectados

| Módulo | Cambio |
|---|---|
| `packages/core/src/precios/mano-obra.ts` | **Nuevo.** Conversión y valoración puras |
| `packages/core/src/precios/` | Motivos de mano de obra en `lineaValorable` |
| `packages/db/src/schema/lineas.ts` | Tabla `lineasManoObra`; marcar obsoletos los dos ajustes |
| `packages/db/migrations/` | Migración aditiva |
| `_lib/lineas/esquema-linea.ts` | `ajuste*` → `horas*`, misma disciplina de escala |
| `_lib/cerramientos/alta-cerramiento.ts` | Preparar los conceptos con horas > 0 |
| `_lib/mano-obra/` | **Nuevo.** Resolución de artículo, PVP, coste y snapshot |
| `_lib/lineas/guardar-linea.ts` | Escribir las filas dentro de la transacción |
| `[id]/_components/anyadir-linea.tsx` | Campos en horas |
| PDF del presupuesto | Después: mostrar horas e importe |

`acciones.ts` no crece: coordina.

## 12. Fases

**Ahora**

1. Migración aditiva de `lineas_mano_obra`, probada en efímero y aplicada de
   forma reversible.
2. Conversión y valoración puras en `core`, con sus pruebas.
3. Formulario en horas y persistencia del snapshot para
   `FABRICACION_ADICIONAL` y `COLOCACION`.
4. Regla «todo o sin valorar» conectada.

**Después**

1. `FABRICACION_BASE`, cuando el recuento de módulos (T.31) esté resuelto.
   Requiere ampliar el `CHECK` de `concepto` y el de `origen`.
2. Resto de conceptos: `MOCOMP`, `MOTAP`, `MOVID`, `MOPREM`, `MOMOSQ`.
3. Acción de revaloración explícita con diferencia visible.
4. Migración sustractiva de `ajuste_fabricacion` y `ajuste_colocacion`.
5. Mano de obra en el PDF.

## 13. Medición: escala de horas y de minutos

Sobre `EMP0016\Anterior.mdb` (la copia; la activa no se abrió), ODBC 32-bit con
`ReadOnly=1`, 3 de agosto de 2026.

### Los minutos NO son enteros

`VPresupuestosLin`, artículos de mano de obra:

| Artículo | Líneas con `Cdad` entero | Con decimales |
|---|---:|---:|
| `MO` | 5.375 | **11** |
| `MOCOL` | 1.238 | 0 |
| `MOCOMP` | 597 | 0 |
| `MOTAP` | 24 | 0 |

Las 11 excepciones no son ruido: son exactamente `HorasAdFabr × 60` sin
redondear.

| `HorasAdFabr` | `Cdad` | `× 60` |
|---:|---:|---|
| 2,37 | 142,2 | 142,2 |
| 6,07 | 364,2 | 364,2 |
| 2,61 | 156,6 | 156,6 |
| 2,22 | 133,2 | 133,2 |
| 3,97 | 238,2 | 238,2 |
| 1,79 | 107,4 | 107,4 |
| 2,31 | 138,6 | 138,6 |

**Conclusión: no se redondean los minutos a entero.** El decimal aparece cuando
el operador teclea horas con dos decimales, y el sistema lo arrastra tal cual.
`minutos numeric(10,2)` es la escala correcta; redondear a entero cambiaría el
importe respecto al original.

### Parte decimal de las horas tecleadas

| Concepto | Con horas > 0 | Parte decimal `,00` | Parte decimal `,50` | Otras |
|---|---:|---:|---:|---:|
| `HorasColoc` | 935 | 908 | 13 | 14 |
| `HorasAdFabr` | 199 | 167 | 12 | 20 |

Las «otras» son valores de dos decimales: 0,07 · 0,22 · 0,29 · 0,30 · 0,31 ·
0,33 · 0,37 · 0,61 · 0,78 · 0,97. Las pequeñas variaciones que aparecen al leer
(`0,300000190734863`) son la representación `REAL` de 32 bits del original, no
precisión adicional tecleada.

**Conclusión: dos decimales de hora bastan.** `horas numeric(6,2)` cubre todo lo
observado y acota el producto del §3.2. La mayoría teclea horas enteras o
medias, pero el sistema debe admitir dos decimales porque el histórico los tiene.

### Importe de mano de obra, con denominador explícito

`VPresupuestosLin`, todas las líneas con artículo que empieza por `MO`:

| Artículo | Líneas | Minutos | Importe |
|---|---:|---:|---:|
| `MOCOL` | 1.238 | 362.322,00 | **181.290,60 €** |
| `MO` | 5.386 | 158.689,40 | 79.339,25 € |
| `MOCOMP` | 597 | 8.580,00 | 4.288,80 € |
| `MOTAP` | 24 | 0,00 | 0,00 € |
| **Total** | **7.245** | **529.591,40** | **264.918,65 €** |

Colocación es manual por construcción: `MOConceptosColoc.TiempoColoc` está a 0 en
sus 579 filas (T.32.2), así que su único origen es `HorasColoc`. Por tanto
**181.290,60 € de 264.918,65 € —el 68,4% del importe de mano de obra del
histórico— es entrada manual del operador**, con ese denominador exacto.

La parte adicional de fabricación **no se ha podido separar** del cálculo base
dentro del mismo denominador: `VDatosLinEstr` y `VConceptosMO` abarcan tipos de
documento que `VPresupuestosLin` no cubre, y los totales no son comparables sin
acotar por tipo. **El «~79%» del anexo T.32.2 no se ha reproducido y no debe
citarse** hasta medirlo con el mismo recorte. Lo demostrado es el 68,4%.

## 14. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Tarifas 2 y 3 con mano de obra a `0,0000` | Presupuesto en esas tarifas queda sin valorar entero | Es el comportamiento correcto. Corregir catálogo; no restringir tarifas (§9) |
| Cambiar la unidad del campo | Un entorno con datos en euros los tendría reinterpretados como horas | Verificado: 0 filas. Comprobar otra vez antes de migrar y abortar si aparecen |
| Fabricación base atada al recuento | La valoración agregada sigue incompleta tras esta fase | Se declara: el `GRUPO` seguirá sin valorar hasta cerrar T.31 |
| Reversión después de escribir | Pérdida de la mano de obra de los documentos del intervalo | Procedimiento del §6, con exportación previa |
| Producto fuera de rango, en venta o en coste | Error crudo de PostgreSQL en pantalla | Guarda en aplicación para ambos, con su código (§3.2) |
| Coste fuera del snapshot | Sin él, no habría rentabilidad histórica | Resuelto: se congela (§3) |
| Snapshot desalineado con la tarifa del documento | Documento con tarifa N y precio de tarifa M | Hacer visible la discrepancia; revaloración explícita |

## 15. Preguntas abiertas

1. **¿Tope comercial de horas?** Sigue abierto de T.67. Hoy sólo hay tope
   técnico, ahora `9.999,99 h`.
2. **¿Se aplica descuento de línea a la mano de obra?** En el original es línea
   hija con su propio `DescuentoPorc`. No medido.
3. **¿La mano de obra se muestra desglosada al cliente o embebida en el importe
   del `GRUPO`?** El vídeo mostró una sola línea agregada.
4. **¿Coste igual a PVP es intencionado?** Ambos `0,5000`: margen cero. Puede ser
   deliberado o catálogo sin mantener. Ahora quedará registrado documento a
   documento, lo que permitirá responderlo con datos propios.
5. **Las 167 líneas `MO` sin estructura asociada** (`nEstr = 0`, 15.115,8 minutos,
   7.557,90 €) no cuelgan de ninguna línea estructural. Qué son —mano de obra
   suelta del documento, o de otro origen— está sin medir, y afecta a si la mano
   de obra puede existir fuera de una línea.
