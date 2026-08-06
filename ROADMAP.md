# Roadmap de paridad documental

Cuatro capacidades que Productor tiene, Aluminior no, y el vídeo oficial de Gaia
presenta como el valor operativo real del programa. Evidencia y timestamps en
[`EVIDENCIA-VIDEO-PRESUPUESTO.md`](EVIDENCIA-VIDEO-PRESUPUESTO.md).

## Segunda fuente: documentación oficial de Gaia

`https://docs.gaia-soft.com` publica la base de conocimiento de Productor. El
índice completo, legible por máquina y con cada artículo en Markdown, está en
`https://docs.gaia-soft.com/llms.txt`; a cada artículo se accede añadiendo `.md`
a su URL. Es documentación pública del fabricante: sirve para verificar
comportamiento e interoperar, no sustituye a la observación del taller.

Lo consultado el 06/08/2026 se cita en cada hueco. Documentación es más fiable
que una transcripción automática, pero menos que ver la pantalla: cuando ambas
digan cosas distintas, manda lo observado y se anota la diferencia.

Este documento cubre **documentos, producción y precio**. El vocabulario visual
del diseñador sigue en [`PARIDAD-PRODUCTOR.md`](PARIDAD-PRODUCTOR.md); no se
duplican aquí.

Orden: G1 y G2 primero por ser lógica pura sin dependencia de la interfaz ni de
la base de datos. G3 y G4 después porque tocan `acciones.ts` (deuda conocida) y
requieren una decisión del titular.

## G1 — Despunte como gasto calculado · `Ahora`

**Qué hace Productor** (22:24–24:10). Optimiza el corte a barras completas,
compara el perfil realmente necesario contra el que hay que pedir al proveedor,
y convierte la diferencia en un importe de retal que se carga al presupuesto
como gasto indirecto. Motivo declarado: en color madera el retal no se
reaprovecha, así que lo paga el cliente a precio de coste.

Parámetros observados en pantalla: `Longitud Aprovechable` en mm; casilla
`Seleccionar Longitud de Barra`; **modo de repercusión** `Repartir entre las
líneas` o `Insertar en línea aparte`; ejecución por `Barras Completas` o por
`Longitud Aprovechable (General / Por Perfil)`; opciones de coste (Coste Mínimo,
Coste Máximo, Proveedor Habitual, Coste del Proveedor) con `Restar Descuento del
Proveedor`. Resultados: coste de perfiles y cortes, coste de barras y paneles,
ML de barras e **importe total de despunte**.

**Punto de partida en Aluminior.** `packages/core/src/produccion/optimizar.ts`
ya resuelve el cutting-stock 1D con First-Fit-Decreasing y reporta los cortes
imposibles en vez de silenciarlos. Falta la capa económica encima.

Alcance de la primera unidad: función pura en `core`, sin base de datos ni UI.

Criterios de aceptación:

1. Dado un plan de corte y un precio por metro lineal, devuelve coste del
   material necesario, coste de las barras que hay que comprar, ML de barras e
   importe de despunte.
2. Los dos modos de repercusión producen resultados explícitos y distintos, y el
   modo elegido viaja en el resultado.
3. Un perfil sin precio no se inventa: sale como no valorable con su motivo,
   igual que `optimizar.ts` hace con los cortes imposibles.
4. La suma de lo repercutido entre líneas es igual al importe total, sin
   descuadre por redondeo. Se usa el helper de `precios/decimal.ts`.
5. Tests unitarios con datos sintéticos, incluidos los casos límite: cero
   cortes, un solo corte más largo que la barra, y un perfil con 100% de
   aprovechamiento.

Fuera de alcance de esta unidad: pantalla, persistencia y el efecto en el
informe de coste.

### Lo que confirma y añade la documentación oficial

`docs.gaia-soft.com/docs/calculo-despunte-en-presupuestos-web.md` y
`.../configuracion-calculo-de-despunte-en-presupuestos-web.md` describen el
mismo cálculo para Productor Web y confirman la definición literal: se optimiza
para saber cuántas barras hacen falta de cada perfil y **se compara los metros
en barras con los metros de despiece exactos ya valorados; la diferencia es el
despunte**. Coincide con lo implementado.

Añaden tres cosas que la capa actual todavía no cubre:

1. **El despunte no se aplica a todo.** Se configura por **familias de artículos
   sujetas** y por **acabados sujetos**, y existe además una lista de acabados
   con despunte **obligatorio**. Esto explica el motivo del vídeo: el
   presupuesto en blanco no lleva despunte y el mismo presupuesto en madera sí.
   Hoy `calcularDespunte` valora todo lo que se le pasa: el filtro por acabado
   vive en el llamador y debe existir antes de conectar la interfaz.
2. **La repercusión en línea aparte usa un artículo configurado**, no un
   concepto suelto. Ese artículo pertenece a una familia, y la familia es lo que
   permite darle **un margen propio, distinto del margen general**. En el
   ejemplo de la documentación: 45% de margen general y 15% en el despunte. Es
   decir, el despunte se valora **a coste y después se le aplica margen**; no es
   un gasto que se repercuta a pelo.
3. Se puede fijar una **tarifa específica** para valorar el despunte, distinta
   de la del documento.

Sigue sin respuesta en la documentación: **en proporción a qué reparte** el modo
"repartir entre las líneas". Productor Web solo implementa la línea aparte. La
hipótesis actual (proporcional a la base económica de cada línea) sigue siendo
hipótesis y sigue siendo entrada del llamador.

## G2 — Hoja de corte y hoja de producción como documentos distintos · `Ahora`

**Qué hace Productor** (24:10–27:45). Son dos documentos con contenidos
distintos, no dos vistas del mismo.

*Hoja de corte*: resumen de barras (artículo-acabado, largo de barra, nº de
barras, metros, **%Opt**, pictograma de sección) y después el desglose barra a
barra con el retal sobrante y la posición del palo referida a la
`Referencia (Tipo)` de la línea ("palo inferior de la V1"). Parámetros del
ejemplo: saneamiento de punta inicial 30 mm, final 30 mm, disco 7 mm en inglete
y 5 mm en corte recto.

*Hoja de producción*: agrupada **por estructura** (`Estructura: 1 / 5`), con
miniatura acotada, referencia, descripción generada, cantidad, color, medidas de
marco y de hueco, y una tabla con `Artículo, Descripción, Aca., Cdad., Ancho,
Largo, I-D, Pvc, Func.Pos.` donde `I-D` es el tipo de corte por extremo
(`| - |` recto-recto, `/ - \` inglete). **Filas granate = palos horizontales,
filas negras = palos verticales.** Incluye accesorios, medidas de cristales y
persianas, tubos y solapes, que la hoja de corte no lleva.

**Punto de partida.** `packages/core/src/produccion/` y la página
`web/app/dashboard/produccion/[id]`.

Alcance de la primera unidad: modelo de datos y ensamblado, funciones puras.

Criterios de aceptación:

1. Dos tipos de resultado distintos y explícitos; ninguno es un superconjunto
   accidental del otro.
2. La hoja de corte expone %Opt por artículo-acabado y el sobrante por barra.
3. La hoja de producción agrupa por estructura y expone la orientación de cada
   palo (horizontal / vertical) como **dato**, no como color. El color es
   decisión de la vista.
4. Los parámetros de corte (saneamiento inicial y final, grosor de disco en
   inglete y en recto) son entrada explícita, con valores por defecto
   documentados y trazables a la evidencia. No se codifican dentro del cálculo.
5. Una estructura sin `Referencia (Tipo)` se identifica por su índice, no se
   omite en silencio.
6. Tests unitarios con datos sintéticos.

Fuera de alcance de esta unidad: impresión, PDF y maquetación.

### Lo que confirma y añade la documentación oficial

`docs.gaia-soft.com/docs/formato-de-corte-articulos.md` documenta los **Valores
Especiales** de cada perfil, que son los ángulos por tipo de corte:
`\` = 45, `/` = 45, `|` = 90. Confirma la correspondencia entre la notación
`I - D` de la hoja de producción y el ángulo real, que hasta ahora era
deducción. La implementación ya lo resuelve así.

Añade dos cosas:

1. Un artículo entra en la optimización **solo si está marcado** `Hoja de Corte`
   en su ficha (pestaña Producción). Hay perfiles que deliberadamente no se
   optimizan. Es un filtro de entrada que hoy no existe.
2. `productor-aluminio-primeros-pasos` menciona **cuatro** documentos de
   producción, no dos: hoja de corte, optimización en metro lineal, **hoja de
   resumen de cortes** y hoja de producción. El resumen de cortes es un
   documento propio que el vídeo no separa y que no está modelado.

**`Pvc` y `Func.Pos.` siguen sin documentar** en la base de conocimiento
pública. Quedan fuera del modelo hasta tener respuesta del titular.

## G3 — Revisión de documento y copia con sustitución masiva · `Después`

**Qué hace Productor** (19:36–22:22). Copia un presupuesto conservando el número
y subiendo la revisión (11 rev. 0 → 11 rev. 1), y en el mismo paso sustituye
hasta tres series de perfilería, tres vidrios, el acabado de accesorios y el
acabado de madera. Lo que se deja vacío se conserva. Opciones de detalle de
estructuras: `Copiar actual` / `Generar nuevo` / `Anular`, con casillas para
regenerar descripción y dibujos de cada línea, y una pestaña de selección de
líneas para aplicarlo solo a algunas. El vídeo lo presenta como el mayor ahorro
de tiempo del taller.

**Punto de partida.** `db/src/schema/comercial.ts` ya tiene `numero`, `revision`
y el índice `presupuestos_numero_idx` sobre ambos. Falta el flujo.

Riesgo de alcance: toca `web/app/dashboard/presupuestos/_lib/acciones.ts`, 741
líneas de deuda conocida. Antes de añadir aquí, extraer la responsabilidad de
copia a su propio módulo con interfaz pequeña, como manda `AGENTS.md`.

Criterios de aceptación preliminares:

1. La sustitución es un mapa explícito origen → destino; vacío significa
   conservar, nunca "borrar".
2. Regenerar descripción y dibujo son decisiones separadas y opcionales.
3. Se puede aplicar a un subconjunto de líneas.
4. El original queda intacto y ambas revisiones conviven.

## G4 — Tarifas de venta por tipo de cliente · `Después`

**Qué hace Productor** (01:07). Hasta **8 tarifas de venta** con márgenes de
beneficio distintos según el tipo de cliente; la tarifa se elige en la cabecera
del presupuesto y se puede forzar por línea (`Tarifa Manual`).

**Punto de partida.** `presupuestos.tarifa` y `clientes.tarifa` existen como
entero con defecto 1. `core/src/precios/tarifa.ts` protege las tarifas
históricas 1, 2 y 3 del cargador de ETL — **ojo, ese concepto es la tarifa de
compra del proveedor, no la de venta**. No mezclar ambos sin resolver la
terminología antes.

### Desbloqueado por la documentación oficial

`docs.gaia-soft.com/docs/tarifas-de-precios-de-venta.md` responde el modelo:

- Las tarifas se crean y renombran en **Ficheros … Artículos … Tarifas**, con un
  nombre descriptivo. Los ejemplos del propio fabricante son elocuentes:
  *Tarifa 1 PARTICULARES, Tarifa 2 DISTRIBUIDORES, Tarifa 3 GRANDES SUPERFICIES,
  Tarifa 4 PRECIOS 2025, Tarifa 8 COSTE*. No son ocho niveles de descuento: son
  ocho listas de precios con propósitos distintos, y una de ellas puede ser el
  coste.
- **Hay una sola tabla de tarifas, no dos.** Lo que distingue una tarifa de
  venta de una de coste es una casilla, `Tarifa válida para Ventas`. Esto
  resuelve la duda de vocabulario: el `tarifa.ts` actual y la tarifa del
  presupuesto viven en el mismo espacio de numeración; lo que falta es la marca,
  no un concepto paralelo.
- **El margen se relaciona por familia y subfamilia de artículos**, no como un
  porcentaje único de la tarifa. Se ve en las opciones de copia de tarifa:
  `Copiar % Beneficio Familias` y `Copiar % Beneficio Subfamilias`. Es decir, el
  precio de venta es `tarifa × familia (o subfamilia)`.
- Herramientas asociadas: copiar todos los precios de una tarifa a otra (con
  incremento porcentual opcional), aumentar o disminuir una tarifa entera por
  porcentaje o importe fijo, y **bloquear/desbloquear** una tarifa.

Lo que sigue siendo decisión del titular, y es mucho más pequeño que antes: qué
tarifas usa de verdad su taller y con qué nombre. Eso son datos, no diseño.

Criterios de aceptación preliminares:

1. La tarifa es un registro con código, nombre y marca de validez para ventas,
   no un entero suelto.
2. El margen se resuelve por tarifa y familia, con la subfamilia ganando a la
   familia cuando existe.
3. Bloqueo de tarifa respetado por cualquier proceso de actualización masiva.
4. La terminología queda separada de forma explícita de las tarifas de coste del
   ETL antes de tocar `precios/tarifa.ts`.

## Verificación exigida a cada unidad

- `npm test` del paquete afectado en verde, y medir cuántos tests caen al
  revertir el cambio, no estimarlo.
- Typecheck de `core` y `web`.
- Ningún valor inventado: lo que no se puede calcular se reporta con su motivo.
- La unidad queda en un módulo cohesivo; no se engorda `acciones.ts`.
