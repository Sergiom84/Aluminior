# Banco de contraste de presupuestos — 03/10/2026

**0,96 % de las líneas elegibles salen al mismo precio efectivo que Productor: 5/523.**
En 2026: **1,01 % (5/496)**.
Se mide coincidencia numérica de la copia y del código actual, no aceptación comercial ni certificación de fabricación.

## Alcance, fuente y preparación

Copia autorizada `EMP0016/Anterior.mdb`, solo lectura con `mdb-reader` y proyección de campos técnicos.
SHA-256: `e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`. Ejecución: `2026-10-03T10:26:13.664Z`.
Revisión base del motor medido: `3b30b59453d7bc168527d0f43a18bcc2c02e7bde`; el banco y las entradas públicas de esta entrega reutilizan los servicios sin cambiar sus cálculos.
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
No se leyó `.env`, ni se ejecutaron consultas o escrituras en Supabase. Motor y precios sin modificaciones.

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
Acabado2 distinto del principal tampoco tiene semántica demostrada: 240
líneas quedan sin valorar. Se conserva el cálculo con acabado principal exclusivamente como diagnóstico,
incluidas sus coincidencias numéricas; ninguna se incorpora al porcentaje de aciertos.
Hay 34 coincidencias adicionales con entradas parcialmente representadas,
excluidas expresamente del acierto por esta regla.

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
| 2O | 231 | 31 | 200 | 0 | 0 | 86 | 114 | 0 | 0,00 |
| 1O | 140 | 33 | 107 | 0 | 0 | 48 | 59 | 0 | 0,00 |
| GRUPO | 167 | 122 | 45 | 0 | 0 | 0 | 37 | 8 | 0,00 |
| PC2 | 33 | 2 | 31 | 0 | 1 | 1 | 29 | 0 | 0,00 |
| C2 | 28 | 0 | 28 | 3 | 0 | 7 | 18 | 0 | 10,71 |
| 0 | 31 | 10 | 21 | 1 | 1 | 9 | 10 | 0 | 4,76 |
| 1P | 23 | 5 | 18 | 0 | 0 | 9 | 9 | 0 | 0,00 |
| 3HO | 21 | 8 | 13 | 0 | 0 | 0 | 13 | 0 | 0,00 |
| 2OFI | 16 | 7 | 9 | 0 | 0 | 0 | 9 | 0 | 0,00 |
| C2P | 8 | 0 | 8 | 1 | 0 | 3 | 4 | 0 | 12,50 |
| 1OFI | 12 | 5 | 7 | 0 | 0 | 0 | 7 | 0 | 0,00 |
| 1 | 9 | 3 | 6 | 0 | 0 | 2 | 4 | 0 | 0,00 |
| 02V | 8 | 3 | 5 | 0 | 0 | 0 | 5 | 0 | 0,00 |
| PC3C | 4 | 0 | 4 | 0 | 1 | 3 | 0 | 0 | 0,00 |
| 1OPLD | 4 | 2 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 1OPLI | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 2 | 2 | 0 | 2 | 0 | 0 | 2 | 0 | 0 | 0,00 |
| C2FI | 2 | 0 | 2 | 0 | 0 | 0 | 2 | 0 | 0,00 |
| 1OPPI | 2 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 1PCMA | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0,00 |
| 1PFS | 5 | 4 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 2O+1OFI | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| 2P | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0,00 |
| C2E1 | 2 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| C2G | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| C3 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| C4P | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| PC2E2 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| PC2X | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
| PC6C | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0,00 |
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
| **TOTAL** | **957** | **434** | **523** | **5** | **3** | **172** | **335** | **8** | **0,96** |

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
| 2026 | 496 | 5 | 3 | 165 | 317 | 6 | 1,01 |
| 2025 | 27 | 0 | 0 | 7 | 18 | 2 | 0,00 |

| Fecha de PVP respecto al presupuesto | Líneas | Igual | Cercano | Distinto | Sin valorar | Error |
|---|---:|---:|---:|---:|---:|---:|
| anterior-o-igual | 0 | 0 | 0 | 0 | 0 | 0 |
| posterior | 54 | 0 | 0 | 24 | 30 | 0 |
| desconocida | 469 | 5 | 3 | 148 | 305 | 8 |

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
| coste-de-articulo | 393 | 377.636,25 | 24.865,77 | 221 |
| acabado-de-articulo | 357 | 345.932,44 | 24.052,28 | 191 |
| pieza-ausente | 275 | 291.938,14 | 21.533,93 | 155 |
| segundo-acabado-sin-mapeo | 240 | 251.922,59 | 0,00 | 240 |
| importe-de-fila | 238 | 239.766,96 | 21.729,90 | 81 |
| compactos-y-accesorios-adicionales | 236 | 254.018,85 | 20.415,24 | 129 |
| pvp-o-tarifa | 236 | 244.223,36 | 22.686,24 | 77 |
| total-padre-no-reconciliado | 84 | 70.802,77 | 3288,78 | 61 |
| acristalamiento-alternativo-sin-mapeo | 78 | 66.698,22 | 0,00 | 78 |
| metraje-facturable | 56 | 103.586,06 | 1632,40 | 50 |

Coste-de-artículo es una discrepancia de coste, **no causa del PVP**: el histórico conserva muchos ceros
y el catálogo actual aporta costes. Acabados diferentes se comparan como el mismo artículo con acabado distinto,
no como una ausencia y un sobrante falsos. La función vacía de MO histórica no crea una pieza diferente de MO web.
Se preservan multiconjuntos, cantidades y cortes; las filas informativas 0 y avisos se conservan en origen pero no se cuentan como material.
El margen no se deduce de costes nulos/cero. `total-padre-no-reconciliado` exige investigar precio guardado,
redondeo o reglas de cabecera; no demuestra un margen concreto.

Errores de GRUPO fuera del top diez: 8 líneas devuelven
«El motor produjo un snapshot incompatible». No se les asigna precio ni se corrige el motor.
El catálogo visual y su validación se preparan con la misma función que usa la web.

## Arreglos propuestos, sin implementar

Las cifras son **líneas candidatas a revisar como máximo**, solapadas; no garantizan desbloqueo tras un único arreglo.

| Prioridad | Causa → líneas candidatas | Dónde investigar/tocar después de verificar |
|---|---|---|
| 1 | Segundo acabado → 240 bloqueadas; acabados por artículo → hasta 357 | Primero demostrar Acabado2; después contrato de configuración, web `estructuras/catalogo-despiece/valorar-con-catalogo.ts`; core `despiece/linea-catalogo/estandar.ts`, `diseno.ts`: accesorio fijo UNI y ---P/---A |
| 2 | Compactos/accesorios ausentes → hasta 236 medidas; además 206 elementos adicionales en 82 GRUPO | Contrato de configuración y core `despiece/linea-catalogo/`; investigar COM*, MOCOMP y accesorios desde sus entradas, no aprender sus importes |
| 3 | PVP/tarifa → hasta 236 | `estructuras/pvp-articulos.ts`, `catalogo-despiece/leer-catalogo.ts`, importación PVP; separar cambio de acabado de precio antiguo; no cambiar tarifa del catálogo para cuadrar |
| 4 | Alternativa de acristalamiento → 78 bloqueadas | Primero demostrar nTAcris con CHM/configuración/ensayo; después contrato de entrada y `acristalamiento-serie.ts` |
| 5 | GRUPO no representable → 31 elegibles bloqueados; numerosos excluidos por accesorios incompletos | `core/estructuras/validar-configuracion-cerramiento.ts`, catálogo visual, configuración por origen y `cerramientos/valorar-cerramiento.ts`; medidas fraccionarias/modelos/uniones se reportan en detalle privado |
| 6 | Metraje facturable → hasta 56 | `core/precios/importe-fila.ts`; cotejar mínimos/múltiplos y redondeo por pieza/fila con iguales tarifas |
| 7 | Herrajes, MO y vidrio bloqueantes → hasta 39, 38 y 36 | `core/despiece/asociaciones/`, `mano-obra-fabricacion.ts`, `acristalamiento-catalogo.ts` y resolución de serie |
| 8 | Cortes/cotas → hasta 33 | `core/despiece/linea-catalogo/diseno.ts` y referencias de corte; FI/FD y divisiones necesitan instancia verificable |
| 9 | Costes → hasta 393 discrepancias diagnósticas | `estructuras/coste-articulos.ts` y ETL costes; aclarar ceros históricos antes de calcular márgenes. No usar este arreglo para prometer PVP correcto |
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
Suite general: core 557, db 55, ETL 40 + 1 omitida, web 666; sin fallos.
Motor y migraciones sin cambios. La base local es efímera y se pierde si se recrea/parada Docker.
