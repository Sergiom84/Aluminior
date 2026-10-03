/** Solo agregados: ninguna fila documental, identificador, persona ni importe por cliente. */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { clasificar } from './comparar.ts'
import type { ejecutarBanco } from './ejecutar.ts'
type Resultado = Awaited<ReturnType<typeof ejecutarBanco>>
const decimal = (v: number | null) => v === null ? '—' : v.toLocaleString('es-ES', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
const seguro = (v: unknown) => String(v).replaceAll('|', '\\|').replace(/[\r\n]/g, ' ')
export function escribirInforme(destino: string, r: Resultado, manifiesto: { sha256: string }) {
  const rel = relative(resolve('docs/paridad'), resolve(destino))
  if (rel.startsWith('..') || !/^BANCO-CONTRASTE-\d{4}-\d{2}-\d{2}\.md$/.test(rel)) throw new Error('Informe fuera de docs/paridad/BANCO-CONTRASTE-fecha.md')
  const s = r.resumen, e = r.evidencia as Record<string, number>
  const porId = new Map(r.mediciones.map(m => [m.id, m]))
  const coincidenciasParciales = (r.detalles as { id: string; precioDiagnostico: number | null }[]).filter(d => {
    const m = porId.get(d.id)
    return m?.estado === 'sin valorar' && d.precioDiagnostico !== null && clasificar(m.esperado, d.precioDiagnostico) === 'igual'
  }).length
  const modelos = s.porModelo.map(m => `| ${seguro(m.modelo)} | ${m.universo} | ${m.excluidas} | ${m.lineas} | ${m.igual} | ${m.cercano} | ${m.distinto} | ${m['sin valorar']} | ${m.error} | ${decimal(m.porcentajeIgual)} |`).join('\n')
  const causas = s.causas.slice(0, 10).map(c => `| ${c.causa} | ${c.lineas} | ${decimal(c.importeEsperado)} | ${decimal(c.desviacionMedible)} | ${c.sinImporte} |`).join('\n')
  const numeroCausa = (k: string) => s.causas.find(c => c.causa === k)?.lineas ?? 0
  const anos = s.porAno.map(a => `| ${a.ano} | ${a.lineas} | ${a.igual} | ${a.cercano} | ${a.distinto} | ${a['sin valorar']} | ${a.error} | ${decimal(a.porcentajeIgual)} |`).join('\n')
  const fechas = s.porFechaTarifa.map(a => `| ${a.contexto} | ${a.lineas} | ${a.igual} | ${a.cercano} | ${a.distinto} | ${a['sin valorar']} | ${a.error} |`).join('\n')
  const exclusiones = Object.entries(s.excluidasPrimarias).map(([k, n]) => `| ${k} | ${n} | ${s.exclusiones[k]} |`).join('\n')
  const fecha = rel.match(/\d{4}-\d{2}-\d{2}/)![0].split('-').reverse().join('/')
  const anterior = existsSync(destino) ? readFileSync(destino, 'utf8') : ''
  const historial = anterior.match(/## Historial[\s\S]*?(?=\n## |$)/)?.[0] ?? ''
  const seguimiento = anterior.match(/## Iteraciones y evidencia[\s\S]*?(?=\n## |$)/)?.[0] ?? ''
  const distribucion = r.diagnostico.distribucion.map(d => `| ${d.intervalo} | ${d.lineas} |`).join('\n')
  const bloqueos = r.diagnostico.principales.map(b => `| ${b.modelo} | ${b.causa} | ${b.lineas} |`).join('\n')
  const informe = `# Banco de contraste de presupuestos — ${fecha}

**${decimal(s.total.porcentajeIgual)} % de las líneas elegibles salen al mismo precio efectivo que Productor: ${s.total.igual}/${s.total.lineas}.**
En 2026: **${decimal(s.porAno[0]!.porcentajeIgual)} % (${s.porAno[0]!.igual}/${s.porAno[0]!.lineas})**.
Se mide coincidencia numérica de la copia y del código actual, no aceptación comercial ni certificación de fabricación.

${historial}

${seguimiento}

## Diagnóstico de distribución y bloqueos

Intervalos excluyentes, sobre las distintas; error relativo absoluto en céntimos.

| Error | Líneas |
|---|---:|
${distribucion}

Una causa principal por línea: primer impedimento de representación, después primer aviso bloqueante.
Los resultados valorados distintos no tienen bloqueo; sus discrepancias se investigan pieza a pieza.
La asignación por identidad queda en \`resultados.json → diagnostico.bloqueos\`, fuera de Git.

| Modelo | Causa principal | Líneas |
|---|---|---:|
${bloqueos}

## Alcance, fuente y preparación

Copia autorizada \`EMP0016/Anterior.mdb\`, solo lectura con \`mdb-reader\` y proyección de campos técnicos.
SHA-256: \`${manifiesto.sha256}\`. Ejecución: \`${r.ejecutado}\`.
Revisión Git anterior al cambio de trabajo medido: \`${r.revisionGit}\`; el Historial identifica cada corrección posterior.
Confirmados ${e.documentos} presupuestos (22 de 2025, 381 de 2026) y ${e.filas} filas:
${e.independientes} estructuras independientes, ${e.grupos} GRUPO y ${e.elementos} elementos internos
(${e.elementosConPrecio} con Precio > 0). Los ${e.elementos} elementos no se suman de nuevo al denominador del GRUPO.
Las filas de artículo independientes y el despiece no son líneas de estructura reproducidas por este servicio.

Universo de ${s.universo} líneas comerciales de estructura/GRUPO; ${s.excluidas} excluidas y ${s.total.lineas} elegibles.
El porcentaje incluye sin valorar y errores en el denominador. Los excluidos no se dan por acertados ni fallidos.
No extrapolar esta cifra a las 105.011 filas, a todos los modelos ni a los trabajos posteriores de la base activa.

Postgres local \`127.0.0.1:55433/aluminior_real_test\`: 25 migraciones existentes, 541 estructuras,
17.547 artículos, 83.367 PVP y 260.760 filas del motor. Simulación y carga dirigida:
cero descartes, tablas protegidas conservadas. Clientes, proveedores, obras y documentos no importados.
No se cargaron reglas calibradas del histórico para la vía antigua; los resultados de esa vía no pueden ser aciertos.
No se leyó \`.env\`, ni se ejecutaron consultas o escrituras en Supabase. No se modifican los datos del catálogo; los cambios de motor están en el Historial.

Se amplía el banco con una frontera de extracción/ejecución nueva porque el banco v1 no lee cabeceras ni GRUPO
y el adaptador \`banco-motor\` solo admite materiales parciales; se reutilizan normalización, avisos y cargadores existentes,
y se conserva el banco v1. [Contrato anterior](BANCO-COMPARACION-PRECIOS.md),
[reglas de fase 7](fase-7/06-reglas-catalogo-despiece-completo.md),
[integración del motor](INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).

## Evidencia del mapeo

| Regla | Evidencia comprobada en esta copia | Límite |
|---|---|---|
| Cabecera: nDoc → VPresupuestos.Id | Claves únicas; ${e.lineasSinCabecera} filas sin cabecera | Tarifa y fecha salen de la cabecera, nunca se presupone tarifa 1 |
| Hija: (nDoc,nEstr) → (nDoc,nLinea) | ${e.enlacesEstr} enlaces, ${e.huerfanasEstr} huérfanos, ${e.destinoIncorrecto} destinos presentes que no sean estructura; nLinAsoc informado = ${e.nLinAsocInformado} | Huérfanos no usados; falta de despiece excluye. Contraste previo: [PLAN, validación del oráculo](../historico/PLAN.md) |
| Configuración: (VPRES,nVDoc,nVLinea) | ${e.configuracionesDuplicadas} claves duplicadas | No unir solo por línea; no mezclar VFAC/VALB |
| Serie y vidrio: FamiliaN/ConjuntoN | Familia 001 selecciona perfiles, 050 vidrio, 051 guías; se conservan cuatro posiciones | No escoger Conjunto1 por posición. [Evidencia de fase 4](fase-4/00-resumen.md) |
| Opciones: (VPRES,nDoc,nLinEstr,Conjunto,nOpcion) | Las selecciones true/false se conservan | La web recibe las marcadas; alternativas/conflictos no representables bloquean |
| Grupo: (nDoc,nGrupo) → línea GRUPO | Todos los ${e.elementos} elementos enlazados se conservan | ${e.elementosSinGeometria} elementos adicionales fuera de VCerramientosLin, en ${e.gruposConElementosAdicionales} grupos; no omitir compactos |
| Dibujo: (VPRES,nDoc,nLinGrupo) → VCerramientos.id → VCerramientosLin.nCerr | 167 cabeceras únicas; nLinEstr enlaza el elemento por documento y código | El dibujo no sustituye medidas económicas. [Reconocimiento de cerramientos](RECON-CERRAMIENTOS.md) |
| Extremos de unión: UOrdenElem1/2 → Orden | 398 uniones VPRES con ambos extremos en módulos; cero destinos inválidos | V/H da anclaje lógico; no se reconstruye una geometría o accesorio no representable |
| Grosor/longitud de unión | En 104 uniones de GRUPO elegibles, ULongitud coincide con Largo económico; Ancho de línea es 0 | El grosor físico sale de UGrosor explícito, nunca de Ancho=0. Longitud discordante bloquea |
| Medidas económicas | VPresupuestosLin.Ancho/Largo, ya en mm; de 565 módulos dibujados, 560 tienen corte MV igual al alto de su línea | Solo 90 tienen ambas medidas iguales a las del dibujo. Se preservan las dos fuentes y no se convierten unas en otras |
| Despiece y precio padre | ${e.hijasPrecioReconciliado}/${e.estructuras} estructuras tienen suma de hijas = Precio; ${e.padresSinHijas} sin hijas | Diagnóstico, no fórmula de precio. Con todos los elementos de grupo, 133/167 sumas reconciliadas; solo geometría, 65/167 |
| Diseño específico | Bandera DisEspecificoSN y detalle enlazado por (VPRES,nVDoc,nVLinEstr) | Se conserva detalle técnico; no se inventa la instancia |
| Horas | HorasAdFabr/HorasColoc conservadas; la frontera usa el servicio web de MO | REAL de Access se normaliza a dos decimales de formulario; [evidencia de horas/minutos](SPEC-MANO-DE-OBRA.md) |

Selección de acristalamiento: \`nTAcris=0/1\` reproduce la primera opción, según la
evidencia de la iteración 3. Las selecciones superiores siguen sin mapeo demostrado:
${numeroCausa('acristalamiento-alternativo-sin-mapeo')} líneas bloqueadas en esta medición.
Los códigos de guías, segundos acabados y accesorios se conservan como evidencia; no se infieren reglas nuevas de sus precios.
Acabado2 se transmite al núcleo como acabado de accesorios; se respetan los selectores
explícitos de las asociaciones (ver evidencia de la iteración). Quedan bloqueadas las entradas
no representables. Hay ${coincidenciasParciales} coincidencias numéricas adicionales con
entradas parcialmente representadas, que no se cuentan como aciertos.

## Qué precio se compara

El esperado es \`VPresupuestosLin.Precio\`, sin IVA; se conserva además \`ImporteTotal\`.
El obtenido es el **total efectivo que cobraría la web dividido por la cantidad comercial**:
materiales por composición y horas manuales por línea. Se preserva cualquier diferencia de ámbito de MO
frente al histórico. No se multiplica dos veces el despiece y no se usan precios históricos para calcular el motor.
Los descuentos de las 957 líneas de estructura/GRUPO son cero; no se mezclan descuentos de cabecera ni IVA.

Servicios: \`valorarEstructura\`, \`valorarCerramiento\`, \`prepararManoObra\` y reglas decimales existentes.
La validación del configurador forma parte de la reproducción de GRUPO. Entrada conocida sin representación
en la web queda sin valorar; no se cambia el motor ni se fuerza una configuración ficticia.
Igual: ±0,01 €; cercano: >0,01 € y ≤1 %; distinto: resto; incompleto: importe null; excepción: error.
El umbral se evalúa en céntimos para no convertir ruido binario de Access REAL en diferencias comerciales.
La proximidad nunca cuenta como igualdad. Una igualdad de precio puede tener diferencias de piezas o coste.

## Resultados por modelo

| Modelo | Universo | Excluidas | Líneas | Igual | Cercano | Distinto | Sin valorar | Error | Igual % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${modelos}
| **TOTAL** | **${s.universo}** | **${s.excluidas}** | **${s.total.lineas}** | **${s.total.igual}** | **${s.total.cercano}** | **${s.total.distinto}** | **${s.total['sin valorar']}** | **${s.total.error}** | **${decimal(s.total.porcentajeIgual)}** |

## Exclusiones

El motivo primario permite reconciliar exactamente ${s.excluidas} exclusiones; la última columna tiene solapamientos.

| Motivo | Primario | Presente, con solapamiento |
|---|---:|---:|
${exclusiones}

Además, sin despiece: ${s.exclusiones['despiece-no-enlazado'] ?? 0} (ya incluido en diseño específico).
Los 58 precios manuales están excluidos del acierto. PSM001 y otros accesorios sin serie demostrada
quedan fuera por entradas incompletas; eso es falta de cobertura medible, no evidencia de precio correcto.

## Fecha y tarifa

Todos los documentos usan tarifa 1 explícita. Los PVP de la copia tienen actualización entre
24/11/2022 y 26/01/2026; 9 filas carecen de UltimaAct. Se coteja la fecha de las filas seleccionadas,
sin inventar una vigencia ni rescatar una tarifa por proximidad económica.
Actualización anterior no acredita por sí sola toda la historia de precios.

| Año | Líneas | Igual | Cercano | Distinto | Sin valorar | Error | Igual % |
|---|---:|---:|---:|---:|---:|---:|---:|
${anos}

| Fecha de PVP respecto al presupuesto | Líneas | Igual | Cercano | Distinto | Sin valorar | Error |
|---|---:|---:|---:|---:|---:|---:|
${fechas}

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
${causas}

Coste-de-artículo es una discrepancia de coste, **no causa del PVP**: el histórico conserva muchos ceros
y el catálogo actual aporta costes. Acabados diferentes se comparan como el mismo artículo con acabado distinto,
no como una ausencia y un sobrante falsos. La función vacía de MO histórica no crea una pieza diferente de MO web.
Se preservan multiconjuntos, cantidades y cortes; las filas informativas 0 y avisos se conservan en origen pero no se cuentan como material.
El margen no se deduce de costes nulos/cero. \`total-padre-no-reconciliado\` exige investigar precio guardado,
redondeo o reglas de cabecera; no demuestra un margen concreto.

Errores de servicio actuales: ${numeroCausa('error-del-servicio')}. La iteración de snapshot
y sus campos concretos quedan documentados en el Historial.
El catálogo visual y su validación se preparan con la misma función que usa la web.

## Causas pendientes tras la última medición

Las cifras son **líneas candidatas a revisar como máximo**, solapadas; no garantizan desbloqueo tras un único arreglo.

| Prioridad | Causa → líneas candidatas | Dónde investigar/tocar después de verificar |
|---|---|---|
| 1 | Acabados por artículo → hasta ${numeroCausa('acabado-de-articulo')} discrepancias | Acabado2 resuelto en esta iteración; investigar las discrepancias restantes por origen y acabado efectivo, sin generalizar por familia |
| 2 | Compactos/accesorios ausentes → hasta ${numeroCausa('compactos-y-accesorios-adicionales')} medidas; además 206 elementos adicionales en 82 GRUPO | Contrato de configuración y core \`despiece/linea-catalogo/\`; investigar COM*, MOCOMP y accesorios desde sus entradas, no aprender sus importes |
| 3 | PVP/tarifa → hasta ${numeroCausa('pvp-o-tarifa')} | \`estructuras/pvp-articulos.ts\`, \`catalogo-despiece/leer-catalogo.ts\`, importación PVP; separar cambio de acabado de precio antiguo; no cambiar tarifa del catálogo para cuadrar |
| 4 | Alternativa de acristalamiento → ${numeroCausa('acristalamiento-alternativo-sin-mapeo')} bloqueadas | nTAcris 0/1 resuelto; valores superiores requieren CHM/configuración/ensayo y \`acristalamiento-serie.ts\` |
| 5 | GRUPO no representable → ${numeroCausa('configuracion-no-admitida-por-web')} elegibles bloqueados; numerosos excluidos por accesorios incompletos | \`core/estructuras/validar-configuracion-cerramiento.ts\`, catálogo visual, configuración por origen y \`cerramientos/valorar-cerramiento.ts\`; medidas fraccionarias/modelos/uniones se reportan en detalle privado |
| 6 | Metraje facturable → hasta ${numeroCausa('metraje-facturable')} | \`core/precios/importe-fila.ts\`; cotejar mínimos/múltiplos y redondeo por pieza/fila con iguales tarifas |
| 7 | Herrajes, MO y vidrio bloqueantes → hasta ${numeroCausa('resolucion-de-componentes-y-herrajes')}, ${numeroCausa('reglas-de-mano-de-obra')} y ${numeroCausa('vidrio-y-acristalamiento')} | \`core/despiece/asociaciones/\`, \`mano-obra-fabricacion.ts\`, \`acristalamiento-catalogo.ts\` y resolución de serie |
| 8 | Cortes/cotas → hasta ${numeroCausa('longitud-de-corte')} | \`core/despiece/linea-catalogo/diseno.ts\` y referencias de corte; FI/FD y divisiones necesitan instancia verificable |
| 9 | Costes → hasta ${numeroCausa('coste-de-articulo')} discrepancias diagnósticas | \`estructuras/coste-articulos.ts\` y ETL costes; aclarar ceros históricos antes de calcular márgenes. No usar este arreglo para prometer PVP correcto |
| 10 | Snapshot de GRUPO → ${numeroCausa('error-del-servicio')} errores | \`cerramientos/valorar-cerramiento.ts\`, \`origen-valorado.ts\` y \`core/estructuras/resultado-cerramiento/validar.ts\`; localizar el campo que incumple el contrato con una fixture sintética antes de modificarlo |

## Repetición y artefactos

Requisitos: Docker local y \`mdb-reader\` ya instalado en \`export_datos/herramientas\`.
Todos los JSON/CSV/logs detallados quedan en \`export_datos/banco-contraste/\`, ignorado por Git.

\`\`\`sh
docker compose -f packages/db/docker-compose.yml up -d
# Solo la primera vez, si falta la base:
docker exec aluminior_pg_test createdb -U aluminior aluminior_real_test
node --import tsx scripts/banco-contraste.ts extraer --mdb /Users/sergio/Desktop/Productor/Aluminio/EMP0016/Anterior.mdb
node --import tsx scripts/banco-contraste.ts catalogo --mdb /Users/sergio/Desktop/Productor/Aluminio/EMP0016/Anterior.mdb
# Solo sobre la base vacía; rechaza sobreescribir un catálogo existente:
node --import tsx scripts/banco-contraste.ts preparar --origen export_datos/banco-contraste/catalogo
node --import tsx scripts/banco-contraste.ts medir --informe docs/paridad/BANCO-CONTRASTE-2026-10-03.md
node --import tsx --test scripts/lib/banco-contraste/*.test.ts scripts/banco-motor.test.ts scripts/banco-precios.test.mjs
npx tsc -p scripts/tsconfig.banco-contraste.json --noEmit
\`\`\`

Para repetir sobre la misma copia y base basta \`medir\`. El script exige host local, puerto 55433 y base
aluminior_real_test, no carga entorno ni admite parámetros de conexión alternativos.
La exportación guarda huellas de cada CSV y la carga comprueba que banco y catálogo proceden de la misma copia.
No usar el importador completo ni modificar el catálogo para elevar el porcentaje.

Verificación de cierre: 35 pruebas del banco/adaptadores; typecheck específico y del
monorepo, auditoría de arquitectura y suite general (1.322 pruebas pasadas, 1 omitida).
Cada iteración detalla su evidencia y sus logs privados.
Migraciones sin cambios. La base local es efímera y se pierde si se recrea/parada Docker.
`
  writeFileSync(destino, informe)
}
