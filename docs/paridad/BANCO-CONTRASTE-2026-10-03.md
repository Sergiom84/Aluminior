# Banco de contraste de presupuestos — 03/10/2026

**13,96 % de las líneas elegibles salen al mismo precio efectivo que Productor: 73/523.**
En 2026: **14,72 % (73/496)**.
Se mide coincidencia numérica de la copia y del código actual, no aceptación comercial ni certificación de fabricación.

## Historial

El commit de cada fila identifica el cambio medido; `iteración-1` se resuelve mediante
`git log --grep="Acabado2: iguales 5"` (evita un hash autorreferente).

| Fecha | Commit | Causa atacada | Iguales | Cercanas | Distintas | Sin valorar | Errores |
|---|---|---|---:|---:|---:|---:|---:|
| 03/10/2026 | `1274389` | Base reproducida; diagnóstico inicial | 5 | 3 | 172 | 335 | 8 |
| 03/10/2026 | `iteración-1` | Acabado2 transmitido al núcleo | 73 | 25 | 263 | 154 | 8 |


## Iteraciones y evidencia

Diagnóstico inicial antes de modificar el motor: distintas ≤1 %: 0; >1–5 %: 31;
>5–10 %: 9; >10 %: 132. Bloqueo principal 2O: segundo acabado 79,
alternativa de acristalamiento 35, valoradas distintas 86 (total 200).
1O: segundo acabado 46, alternativa 12, vidrio/acristalamiento 1,
valoradas distintas 48 (total 107). Denominador conservado.

Acabado2: la pantalla «Elemento seleccionado» tiene «Acabado» y «Aca. Acc.»
([captura documentada](fase-3/01-evidencia-composicion.md)). La configuración
`ConjuntosAsoc.Acabado` contiene 12.103 reglas `---A`, 1.079 `---P` y 163
`UNI`: la asociación elige accesorios, perfiles o acabado literal. No se debe
sustituir ese selector por una regla ciega de familia.

Contraste técnico de la misma copia (sin precios para deducir la regla):
949 estructuras/elementos con Acabado2 distinto, incluidas las excluidas del banco;
hijas enlazadas por documento/estructura y familia por `Articulos.Codigo`.
Se omiten códigos vacíos, artículo 0 y cantidad 0; cada hija se cuenta una vez.

| Familia / unidad | Filas | Acabado principal | Acabado2 | Otro |
|---|---:|---:|---:|---:|
| 001 / ML | 12899 | 12866 | 33 | 0 |
| 001 / UD | 74 | 0 | 54 | 20 |
| 002 / ML | 11319 | 200 | 10997 | 122 |
| 002 / UD | 24832 | 18 | 24582 | 232 |
| 050 / M2 | 1615 | 134 | 1459 | 22 |
| 050 / ML | 98 | 0 | 90 | 8 |
| 054 / UD | 3822 | 6 | 3769 | 47 |
| 052 / M2 | 182 | 181 | 0 | 1 |
| 053 / M2 | 77 | 77 | 0 | 0 |
| 053 / UD | 9 | 9 | 0 | 0 |
| 057 / UD | 15 | 15 | 0 | 0 |

La evidencia confirma el segundo selector, no que toda fila de cada familia
siga siempre el mismo acabado. Las excepciones quedan visibles y las asociaciones
explícitas se conservan. El núcleo ya separaba ambos acabados para asociaciones,
vidrio, juntas, MO y estructuras estándar; la web sustituía siempre el segundo
por UNI. La corrección transmite `acabadoAccesoriosCodigo` opcional al núcleo;
si se omite, conserva UNI. Los GRUPO con segundos acabados heterogéneos siguen
bloqueados porque todavía no tienen representación por elemento.
No se modifican PVP, costes, márgenes, fórmulas ni exclusiones.

Iteración 1: 5→73 iguales, sin perder ninguna identidad anterior; 523 elegibles
y 434 exclusiones. Fixture sintética web roja antes del cambio y verde después;
core 558, db 55, ETL 40 + 1 omitida, web 667; banco 33, typecheck del monorepo
y banco, arquitectura sin infracciones. Incluye degradación sin tablas y sin
catálogo en PostgreSQL local; no es una consulta a producción.
La búsqueda local en July por seminario no devolvió el dossier; no se ha utilizado
como evidencia ni se presupone su contenido.


## Diagnóstico de distribución y bloqueos

Intervalos excluyentes, sobre las distintas; error relativo absoluto en céntimos.

| Error | Líneas |
|---|---:|
| ≤1 % | 0 |
| >1–5 % | 15 |
| >5–10 % | 11 |
| >10 % | 237 |
| base cero | 0 |

Una causa principal por línea: primer impedimento de representación, después primer aviso bloqueante.
Los resultados valorados distintos no tienen bloqueo; sus discrepancias se investigan pieza a pieza.
La asignación por identidad queda en `resultados.json → diagnostico.bloqueos`, fuera de Git.

| Modelo | Causa principal | Líneas |
|---|---|---:|
| 2O | sin bloqueo: valorado distinto | 151 |
| 1O | sin bloqueo: valorado distinto | 57 |
| 2O | acristalamiento-alternativo-sin-mapeo | 35 |
| 1O | acristalamiento-alternativo-sin-mapeo | 12 |
| 2O | sin bloqueo: valorado | 14 |
| 1O | sin bloqueo: valorado | 37 |
| 1O | vidrio-y-acristalamiento | 1 |

## Alcance, fuente y preparación

Copia autorizada `EMP0016/Anterior.mdb`, solo lectura con `mdb-reader` y proyección de campos técnicos.
SHA-256: `e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`. Ejecución: `2026-10-03T10:40:01.172Z`.
Revisión Git anterior al cambio de trabajo medido: `12743898dd08c51ee5f888a51f080b0dba763c49`; el Historial identifica cada corrección posterior.
Confirmados 403 presupuestos (22 de 2025, 381 de 2026) y 105011 filas:
790 estructuras independientes, 167 GRUPO y 1169 elementos internos
(1068 con Precio > 0). Los 1169 elementos no se suman de nuevo al denominador del GRUPO.
Las filas de artículo independientes y el despiece no son líneas de estructura reproducidas por este servicio.

Universo de 957 líneas comerciales de estructura/GRUPO; 434 excluidas y 523 elegibles.
El porcentaje incluye sin valorar y errores en el denominador. Los excluidos no se dan por acertados ni fallidos.
No extrapolar esta cifra a las 105.011 filas, a todos los modelos ni a los trabajos posteriores de la base activa.

Postgres local `127.0.0.1:55433/aluminior_real_test`: 25 migraciones existentes, 541 estructuras,
17.547 artículos, 83.367 PVP y 260.760 filas del motor. Simulación y carga dirigida:
cero descartes, tablas protegidas conservadas. Clientes, proveedores, obras y documentos no importados.
No se cargaron reglas calibradas del histórico para la vía antigua; los resultados de esa vía no pueden ser aciertos.
No se leyó `.env`, ni se ejecutaron consultas o escrituras en Supabase. No se modifican los datos del catálogo; los cambios de motor están en el Historial.

Se amplía el banco con una frontera de extracción/ejecución nueva porque el banco v1 no lee cabeceras ni GRUPO
y el adaptador `banco-motor` solo admite materiales parciales; se reutilizan normalización, avisos y cargadores existentes,
y se conserva el banco v1. [Contrato anterior](BANCO-COMPARACION-PRECIOS.md),
[reglas de fase 7](fase-7/06-reglas-catalogo-despiece-completo.md),
[integración del motor](INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).

## Evidencia del mapeo

| Regla | Evidencia comprobada en esta copia | Límite |
|---|---|---|
| Cabecera: nDoc → VPresupuestos.Id | Claves únicas; 1 filas sin cabecera | Tarifa y fecha salen de la cabecera, nunca se presupone tarifa 1 |
| Hija: (nDoc,nEstr) → (nDoc,nLinea) | 102390 enlaces, 94 huérfanos, 0 destinos presentes que no sean estructura; nLinAsoc informado = 0 | Huérfanos no usados; falta de despiece excluye. Contraste previo: [PLAN, validación del oráculo](../historico/PLAN.md) |
| Configuración: (VPRES,nVDoc,nVLinea) | 0 claves duplicadas | No unir solo por línea; no mezclar VFAC/VALB |
| Serie y vidrio: FamiliaN/ConjuntoN | Familia 001 selecciona perfiles, 050 vidrio, 051 guías; se conservan cuatro posiciones | No escoger Conjunto1 por posición. [Evidencia de fase 4](fase-4/00-resumen.md) |
| Opciones: (VPRES,nDoc,nLinEstr,Conjunto,nOpcion) | Las selecciones true/false se conservan | La web recibe las marcadas; alternativas/conflictos no representables bloquean |
| Grupo: (nDoc,nGrupo) → línea GRUPO | Todos los 1169 elementos enlazados se conservan | 206 elementos adicionales fuera de VCerramientosLin, en 82 grupos; no omitir compactos |
| Dibujo: (VPRES,nDoc,nLinGrupo) → VCerramientos.id → VCerramientosLin.nCerr | 167 cabeceras únicas; nLinEstr enlaza el elemento por documento y código | El dibujo no sustituye medidas económicas. [Reconocimiento de cerramientos](RECON-CERRAMIENTOS.md) |
| Extremos de unión: UOrdenElem1/2 → Orden | 398 uniones VPRES con ambos extremos en módulos; cero destinos inválidos | V/H da anclaje lógico; no se reconstruye una geometría o accesorio no representable |
| Grosor/longitud de unión | En 104 uniones de GRUPO elegibles, ULongitud coincide con Largo económico; Ancho de línea es 0 | El grosor físico sale de UGrosor explícito, nunca de Ancho=0. Longitud discordante bloquea |
| Medidas económicas | VPresupuestosLin.Ancho/Largo, ya en mm; de 565 módulos dibujados, 560 tienen corte MV igual al alto de su línea | Solo 90 tienen ambas medidas iguales a las del dibujo. Se preservan las dos fuentes y no se convierten unas en otras |
| Despiece y precio padre | 1784/1959 estructuras tienen suma de hijas = Precio; 1 sin hijas | Diagnóstico, no fórmula de precio. Con todos los elementos de grupo, 133/167 sumas reconciliadas; solo geometría, 65/167 |
| Diseño específico | Bandera DisEspecificoSN y detalle enlazado por (VPRES,nVDoc,nVLinEstr) | Se conserva detalle técnico; no se inventa la instancia |
| Horas | HorasAdFabr/HorasColoc conservadas; la frontera usa el servicio web de MO | REAL de Access se normaliza a dos decimales de formulario; [evidencia de horas/minutos](SPEC-MANO-DE-OBRA.md) |

Hipótesis pendiente: la semántica de alternativas `nTAcris != 0`; 78
líneas se bloquean y nunca se declaran iguales. Para `nTAcris=0` se ejecuta la selección base del servicio.
Los códigos de guías, segundos acabados y accesorios se conservan como evidencia; no se infieren reglas nuevas de sus precios.
Acabado2 se transmite al núcleo como acabado de accesorios; se respetan los selectores
explícitos de las asociaciones (ver evidencia de la iteración). Quedan bloqueadas las entradas
no representables. Hay 0 coincidencias numéricas adicionales con
entradas parcialmente representadas, que no se cuentan como aciertos.

## Qué precio se compara

El esperado es `VPresupuestosLin.Precio`, sin IVA; se conserva además `ImporteTotal`.
El obtenido es el **total efectivo que cobraría la web dividido por la cantidad comercial**:
materiales por composición y horas manuales por línea. Se preserva cualquier diferencia de ámbito de MO
frente al histórico. No se multiplica dos veces el despiece y no se usan precios históricos para calcular el motor.
Los descuentos de las 957 líneas de estructura/GRUPO son cero; no se mezclan descuentos de cabecera ni IVA.

Servicios: `valorarEstructura`, `valorarCerramiento`, `prepararManoObra` y reglas decimales existentes.
La validación del configurador forma parte de la reproducción de GRUPO. Entrada conocida sin representación
en la web queda sin valorar; no se cambia el motor ni se fuerza una configuración ficticia.
Igual: ±0,01 €; cercano: >0,01 € y ≤1 %; distinto: resto; incompleto: importe null; excepción: error.
El umbral se evalúa en céntimos para no convertir ruido binario de Access REAL en diferencias comerciales.
La proximidad nunca cuenta como igualdad. Una igualdad de precio puede tener diferencias de piezas o coste.

## Resultados por modelo

| Modelo | Universo | Excluidas | Líneas | Igual | Cercano | Distinto | Sin valorar | Error | Igual % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 2O | 231 | 31 | 200 | 8 | 6 | 151 | 35 | 0 | 4,00 |
| 1O | 140 | 33 | 107 | 30 | 7 | 57 | 13 | 0 | 28,04 |
| GRUPO | 167 | 122 | 45 | 0 | 0 | 1 | 36 | 8 | 0,00 |
| PC2 | 33 | 2 | 31 | 5 | 3 | 8 | 15 | 0 | 16,13 |
| C2 | 28 | 0 | 28 | 7 | 1 | 15 | 5 | 0 | 25,00 |
| 0 | 31 | 10 | 21 | 12 | 1 | 7 | 1 | 0 | 57,14 |
| 1P | 23 | 5 | 18 | 3 | 3 | 10 | 2 | 0 | 16,67 |
| 3HO | 21 | 8 | 13 | 0 | 0 | 0 | 13 | 0 | 0,00 |
| 2OFI | 16 | 7 | 9 | 0 | 0 | 0 | 9 | 0 | 0,00 |
| C2P | 8 | 0 | 8 | 4 | 0 | 4 | 0 | 0 | 50,00 |
| 1OFI | 12 | 5 | 7 | 0 | 0 | 0 | 7 | 0 | 0,00 |
| 1 | 9 | 3 | 6 | 2 | 0 | 2 | 2 | 0 | 33,33 |
| 02V | 8 | 3 | 5 | 0 | 0 | 0 | 5 | 0 | 0,00 |
| PC3C | 4 | 0 | 4 | 0 | 1 | 3 | 0 | 0 | 0,00 |
| 1OPLD | 4 | 2 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 1OPLI | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 2 | 2 | 0 | 2 | 1 | 0 | 1 | 0 | 0 | 50,00 |
| C2FI | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 1OPPI | 2 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 1PCMA | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0,00 |
| 1PFS | 5 | 4 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 2O+1OFI | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 2P | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0,00 |
| C2E1 | 2 | 1 | 1 | 0 | 0 | 1 | 0 | 0 | 0,00 |
| C2G | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| C3 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0,00 |
| C4P | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 100,00 |
| PC2E2 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0,00 |
| PC2X | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0,00 |
| PC6C | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0,00 |
| T | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 1FL | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 1O+1F+1O | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 1OP1FL | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 1OPPD | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 2FS | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 2OPL | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 2PD | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| C3C | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM001 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM005 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM009 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| COM017 | 13 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| OB+1VS | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| PSM001 | 135 | 135 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| PSM002 | 11 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| PSM004 | 14 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| **TOTAL** | **957** | **434** | **523** | **73** | **25** | **263** | **154** | **8** | **13,96** |

## Exclusiones

El motivo primario permite reconciliar exactamente 434 exclusiones; la última columna tiene solapamientos.

| Motivo | Primario | Presente, con solapamiento |
|---|---:|---:|
| diseno-especifico-no-reproducible | 173 | 192 |
| precio-manual | 58 | 58 |
| entradas-incompletas | 201 | 262 |
| medidas-o-cantidad-no-positivas | 2 | 2 |

Además, sin despiece: 1 (ya incluido en diseño específico).
Los 58 precios manuales están excluidos del acierto. PSM001 y otros accesorios sin serie demostrada
quedan fuera por entradas incompletas; eso es falta de cobertura medible, no evidencia de precio correcto.

## Fecha y tarifa

Todos los documentos usan tarifa 1 explícita. Los PVP de la copia tienen actualización entre
24/11/2022 y 26/01/2026; 9 filas carecen de UltimaAct. Se coteja la fecha de las filas seleccionadas,
sin inventar una vigencia ni rescatar una tarifa por proximidad económica.
Actualización anterior no acredita por sí sola toda la historia de precios.

| Año | Líneas | Igual | Cercano | Distinto | Sin valorar | Error | Igual % |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2026 | 496 | 73 | 15 | 253 | 149 | 6 | 14,72 |
| 2025 | 27 | 0 | 10 | 10 | 5 | 2 | 0,00 |

| Fecha de PVP respecto al presupuesto | Líneas | Igual | Cercano | Distinto | Sin valorar | Error |
|---|---:|---:|---:|---:|---:|---:|
| anterior-o-igual | 30 | 13 | 0 | 16 | 1 | 0 |
| posterior | 54 | 0 | 18 | 29 | 7 | 0 |
| desconocida | 439 | 60 | 7 | 218 | 146 | 8 |

Desconocida incluye cálculos no ejecutables y cualquier selección con fecha incompleta;
no equivale a tarifa errónea. Los casos con PVP posterior permanecen separados y no demuestran
un error del algoritmo por diferir del presupuesto antiguo. La cifra principal describe la copia cargada.

## Diez diagnósticos principales

Ordenados por líneas y después por suma de precios esperados. Hay solapamiento entre causas.
El importe expuesto es agregado de precios unitarios de líneas afectadas, sin clientes.
Desviación medible solo suma diferencias de resultados valorados; no convierte los sin valorar en cero.
Estos diagnósticos localizan discrepancias; no atribuyen causalidad completa a cada aviso.

| Diagnóstico | Líneas | Precio esperado agregado € | Desviación absoluta medible € | Sin importe calculado |
|---|---:|---:|---:|---:|
| coste-de-articulo | 303 | 311.021,16 | 57.783,11 | 40 |
| acabado-de-articulo | 281 | 291.111,64 | 54.113,32 | 38 |
| pieza-ausente | 264 | 283.802,28 | 53.157,24 | 39 |
| compactos-y-accesorios-adicionales | 236 | 254.018,85 | 51.645,61 | 31 |
| total-padre-no-reconciliado | 84 | 70.802,77 | 10.465,65 | 27 |
| acristalamiento-alternativo-sin-mapeo | 78 | 66.698,22 | 0,00 | 78 |
| importe-de-fila | 77 | 108.289,45 | 12.077,27 | 38 |
| pvp-o-tarifa | 75 | 110.317,23 | 13.035,76 | 38 |
| metraje-facturable | 49 | 88.883,91 | 8206,69 | 38 |
| resolucion-de-componentes-y-herrajes | 39 | 62.241,84 | 0,00 | 39 |

Coste-de-artículo es una discrepancia de coste, **no causa del PVP**: el histórico conserva muchos ceros
y el catálogo actual aporta costes. Acabados diferentes se comparan como el mismo artículo con acabado distinto,
no como una ausencia y un sobrante falsos. La función vacía de MO histórica no crea una pieza diferente de MO web.
Se preservan multiconjuntos, cantidades y cortes; las filas informativas 0 y avisos se conservan en origen pero no se cuentan como material.
El margen no se deduce de costes nulos/cero. `total-padre-no-reconciliado` exige investigar precio guardado,
redondeo o reglas de cabecera; no demuestra un margen concreto.

Errores de GRUPO fuera del top diez: 8 líneas devuelven
«El motor produjo un snapshot incompatible». No se les asigna precio mientras incumplan el contrato.
El catálogo visual y su validación se preparan con la misma función que usa la web.

## Causas pendientes tras la última medición

Las cifras son **líneas candidatas a revisar como máximo**, solapadas; no garantizan desbloqueo tras un único arreglo.

| Prioridad | Causa → líneas candidatas | Dónde investigar/tocar después de verificar |
|---|---|---|
| 1 | Acabados por artículo → hasta 281 discrepancias | Acabado2 resuelto en esta iteración; investigar las discrepancias restantes por origen y acabado efectivo, sin generalizar por familia |
| 2 | Compactos/accesorios ausentes → hasta 236 medidas; además 206 elementos adicionales en 82 GRUPO | Contrato de configuración y core `despiece/linea-catalogo/`; investigar COM*, MOCOMP y accesorios desde sus entradas, no aprender sus importes |
| 3 | PVP/tarifa → hasta 75 | `estructuras/pvp-articulos.ts`, `catalogo-despiece/leer-catalogo.ts`, importación PVP; separar cambio de acabado de precio antiguo; no cambiar tarifa del catálogo para cuadrar |
| 4 | Alternativa de acristalamiento → 78 bloqueadas | Primero demostrar nTAcris con CHM/configuración/ensayo; después contrato de entrada y `acristalamiento-serie.ts` |
| 5 | GRUPO no representable → 31 elegibles bloqueados; numerosos excluidos por accesorios incompletos | `core/estructuras/validar-configuracion-cerramiento.ts`, catálogo visual, configuración por origen y `cerramientos/valorar-cerramiento.ts`; medidas fraccionarias/modelos/uniones se reportan en detalle privado |
| 6 | Metraje facturable → hasta 49 | `core/precios/importe-fila.ts`; cotejar mínimos/múltiplos y redondeo por pieza/fila con iguales tarifas |
| 7 | Herrajes, MO y vidrio bloqueantes → hasta 39, 38 y 36 | `core/despiece/asociaciones/`, `mano-obra-fabricacion.ts`, `acristalamiento-catalogo.ts` y resolución de serie |
| 8 | Cortes/cotas → hasta 33 | `core/despiece/linea-catalogo/diseno.ts` y referencias de corte; FI/FD y divisiones necesitan instancia verificable |
| 9 | Costes → hasta 303 discrepancias diagnósticas | `estructuras/coste-articulos.ts` y ETL costes; aclarar ceros históricos antes de calcular márgenes. No usar este arreglo para prometer PVP correcto |
| 10 | Snapshot de GRUPO → 8 errores | `cerramientos/valorar-cerramiento.ts`, `origen-valorado.ts` y `core/estructuras/resultado-cerramiento/validar.ts`; localizar el campo que incumple el contrato con una fixture sintética antes de modificarlo |

## Repetición y artefactos

Requisitos: Docker local y `mdb-reader` ya instalado en `export_datos/herramientas`.
Todos los JSON/CSV/logs detallados quedan en `export_datos/banco-contraste/`, ignorado por Git.

```sh
docker compose -f packages/db/docker-compose.yml up -d
# Solo la primera vez, si falta la base:
docker exec aluminior_pg_test createdb -U aluminior aluminior_real_test
node --import tsx scripts/banco-contraste.ts extraer --mdb /Users/sergio/Desktop/Productor/Aluminio/EMP0016/Anterior.mdb
node --import tsx scripts/banco-contraste.ts catalogo --mdb /Users/sergio/Desktop/Productor/Aluminio/EMP0016/Anterior.mdb
# Solo sobre la base vacía; rechaza sobreescribir un catálogo existente:
node --import tsx scripts/banco-contraste.ts preparar --origen export_datos/banco-contraste/catalogo
node --import tsx scripts/banco-contraste.ts medir --informe docs/paridad/BANCO-CONTRASTE-2026-10-03.md
node --import tsx --test scripts/lib/banco-contraste/banco.test.ts scripts/banco-motor.test.ts scripts/banco-precios.test.mjs
npx tsc -p scripts/tsconfig.banco-contraste.json --noEmit
```

Para repetir sobre la misma copia y base basta `medir`. El script exige host local, puerto 55433 y base
aluminior_real_test, no carga entorno ni admite parámetros de conexión alternativos.
La exportación guarda huellas de cada CSV y la carga comprueba que banco y catálogo proceden de la misma copia.
No usar el importador completo ni modificar el catálogo para elevar el porcentaje.

Verificación de esta entrega: 12 pruebas sintéticas nuevas más 19 del banco/adaptador anterior;
typecheck específico y del monorepo, auditoría de arquitectura y suite general.
Los recuentos de pruebas y comandos de cada iteración constan en su evidencia y logs privados.
Migraciones sin cambios. La base local es efímera y se pierde si se recrea/parada Docker.
