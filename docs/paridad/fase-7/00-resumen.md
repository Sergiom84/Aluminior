# Fase 7 — diagnóstico económico y salida comercial (parcial)

Alcance del 27/09/2026, anterior al motor integrado en main `9bc879e`.
El [motor posterior](../INTEGRACION-MOTOR-CATALOGO-2026-10-02.md) incorpora
referencias, descuentos incluidos Dif, asociaciones y valoración por catálogo.
La carga remota sigue pendiente según el cierre. Los diagnósticos siguientes
son resultados fechados; no describen las capacidades actuales del código.

Actualización consolidada: [barrido de facturas 2026](05-primer-barrido-facturas-2026.md),
180 documentos y 28.480 líneas. Ningún caso de ese banco está acreditado aún
como calculable/contrastado. Alcance: todas las tipologías, series y uniones.
Los apartados diagnósticos siguientes conservan el alcance del ensayo original.


> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites.

27/09/2026. No se declara valoración comercial completa.

Implementación posterior solicitada: [cortes por referencias y descuentos](../../historico/paridad/fase-7/03-implementacion-cortes-referenciados.md).
Habilitados los perfiles ordinarios C2/C3 GMC400, con importación suplementaria
y migración aditiva solo aplicada en QA local. Cortes contrastados; precio
completo aún bloqueado por asociados y vidrio. No se modificó Supabase.

Requisito confirmado por Sergio: **precio automático completo**. No acepta una
entrega provisional basada en precio manual. Este requisito sigue pendiente;
el guardado y el PDF operativos no son aceptación de la entrega.

Estado operativo: [estado y siguiente paso](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/docs/paridad/CONTINUAR-2026-09-27.md).

Investigación ampliada: [fuentes y cadena de cortes](02-investigacion-fuentes-2026-09-27.md).
Ocho MDB inspeccionadas sobre copias; localizada tarifa TXT y releído el CHM.
La relación con el marco reproduce retrospectivamente 498/498 cortes horizontales
C2/C3; no es predicción independiente ni cierre del precio. Las seis estructuras
con variante de 46,5 mm ya tienen el marco horizontal acortado. Siguen pendientes
su causa, el desglose 260499 (0017 bloqueada por uso) y el acceso remoto
(tenant/user no encontrado). Sin cambios al motor de producción en esta revisión.

Revisión posterior del aviso de vidrio: la base local ya guarda V410ACGP6 en
ambos módulos, válido (050/M2); el mensaje con V410ACGF pertenecía a un intento
anterior. Se recargó y reabrió la ficha para verificarlo. Ante una entrada inválida,
el agregado ahora informa el código y la causa legible y no añade «Receta material
vacía» ni un segundo motivo genérico de coste. Venta, coste y fabricación quedan
bloqueados por la causa original; no se relaja la validación del snapshot.

El ensayo local de dos elementos `2`, serie GMA350, acabado L y esquinero PSU006
confirma que la unión de grosor cero se calcula. Tras elegir del catálogo
V410ACGP6, también se calcula el vidrio. Permanecen ranuras genéricas de perfiles
y asociados sin resolver, fórmulas sin medida y artículos sin precio.
La decisión del anexo S de PLAN.md sigue vigente: no omitir asociados pendientes
ni presentar sumas parciales como precio válido.

El PDF comercial de cerramientos resume el aviso técnico en «Valoración
pendiente.»; si hay precio completo y avisos, indica «Pendiente de revisión
técnica.». Los diagnósticos detallados permanecen intactos en los datos y el
snapshot. Los importes y totales incompletos siguen mostrando «Sin valorar»,
con el aviso destacado de presupuesto incompleto.

Verificado mediante el endpoint local y renderizado con Poppler: una página A4,
una línea GRUPO, dibujo de dos elementos, medidas 2400 × 1200 y totales sin
valorar, sin texto técnico invadiendo la tabla. No modifica condiciones,
precios, logotipos ni estados de documentos. Es una mejora de presentación,
no la aceptación integral de fase 8 ni una réplica del PDF de Productor.

## Contraste C2/C3 con GMC400

Ensayo de solo lectura en `aluminior_real_test`, tarifa 1, acabado L,
V410ACGP6, doble cristal: C2 1200 × 1200 y C3 1800 × 1200 todavía no tienen
precio completo. Quedan respectivamente 9 y 8 referencias genéricas de asociado
sin resolver. Las opciones de herraje seleccionadas no generan aún sus materiales.

Corrección comprobada: `emparejarVidrio` elegía FIJO cuando todas las piezas HV
tenían largo nulo. Ahora cualquier corte de hoja pendiente impide emparejar el
vidrio; tampoco se descartan hojas incompletas para cuadrar un recuento parcial.
Regresiones: 15 pruebas de emparejamiento y 21 de valoración agregada pasan.
El guard de valoración directa también admite el ancho cero ya validado para
esquineros; la valoración de unión se verifica por su receta específica.

Lectura de los CSV exportados, sin modificar origen ni importar documentos:

- `EstructurasArticulos` C2 conserva referencias a otras piezas (`DisIdRefLargo`,
  `DisFRefLargo`) y grupos delimitadores. En aquel ensayo el ETL no conservaba todos estos enlaces.
  El motor posterior incorpora su importación, incluidos descuentos Dif.
- PLAN T.26 confirma que 222–229 son ranuras de herraje, aunque su función sea
  HV/HH. No se deben cobrar como perfiles ni eliminarlas sin resolver asociados.
- En 122 estructuras históricas C2/C3 con GMC400, las piezas GM449/GM450
  observadas tienen descuento vertical de 53 mm. GM451 horizontal en C2 tiene
  dos resultados: 444 piezas con 20 mm y 24 con 46,5 mm. En C3 se observan 30
  piezas con 25,833 mm. Son resultados observados, **no reglas aprobadas**.
- Hipótesis para investigar: resolver primero las referencias de corte y luego
  los descuentos por ambos bordes explicaría el caso ordinario; falta explicar
  la variante de 46,5 mm y contrastar el vidrio y todos los asociados. No se
  incorpora esa hipótesis al motor ni se reduce el umbral histórico de confianza.

Se confirmó visualmente Productor en `PRUEBAS ALUMINIOR - 2026 [0017]` y la
ficha 260499: GRUPO 5400 × 1200, base 1197,93 y total 1449,50. El intento de
abrir `Det.Grupo` agotó el tiempo de la herramienta; después no se pudo recuperar
su ventana al frente. No se pulsó Aceptar ni se cambió dato alguno. Falta obtener
el despiece/desglose de ese caso para confrontar artículos, cantidades, medidas,
tarifa y unión. El total de la captura por sí solo no valida el cálculo.
