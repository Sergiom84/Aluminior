import { REGLAS, type medirCobertura } from './medir.ts'
type Cobertura = ReturnType<typeof medirCobertura>
const seguro = (s: unknown) => String(s).replaceAll('|', '\\|').replace(/[\r\n]/g, ' ')
const lista = (xs: string[]) => xs.map(seguro).join(', ') || '—'
export function informeCobertura(c: Cobertura, procedencia: Record<string, string>, inventario: {
  modelos: string[]; series: string[]; modelosSinElegibles: string[]; seriesSinElegibles: string[];
}) {
  const t = c.total
  const referencias = { piezas: 'r2', funciones: 'r2', cantidades: 'r2', cortes: 'r1', acabados: 'r3', unidades: 'r9', metraje: 'r9', pvp: 'r10', importes: 'r9', costes: 'r11' }
  const tabla = c.pares.map(p => `| ${seguro(p.modelo)} | ${seguro(p.serie)} | ${p.universo} | ${p.excluidas} | ${p.elegibles} | ${p.precioIgual} | ${p.cercano} | ${p.distinto} | ${p.sinValorar} | ${p.error} | ${p.fisicoIgual} | ${p.precioYFisicoIgual} |`).join('\n')
  const reglas = c.pares.filter(p => p.elegibles).flatMap(p => REGLAS.map(r => {
    const x = p.reglas[r]
    return `| ${seguro(p.modelo)} | ${seguro(p.serie)} | ${r} | ${x.coincide} | ${x.difiere} | ${x.sinContraste} | [${referencias[r].toUpperCase()}](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md#${referencias[r]}) |`
  })).join('\n')
  const variantes = c.pares.map(p => {
    const v = p.variantes
    return `| ${seguro(p.modelo)} | ${seguro(p.serie)} | ${v.ancho} / ${v.alto} | ${lista(v.cantidades)} | ${lista(v.tarifas)} | ${lista(v.acabados)} / ${lista(v.acabadosAccesorios)} | ${v.vidriosDistintos} | ${lista(v.acristalamientos)} | ${v.opcionesGuardadas} | ${lista(v.accesorios)} | ${v.fracciones} | ${v.comision} / ${v.despunte} |`
  }).join('\n')
  return `# Cobertura por modelo, serie y campo de contraste

Informe generado por scripts/cobertura-productor.ts; complemento de [fuentes, reglas y ensayos mínimos](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md).
No es una nueva ejecución del motor: analiza el banco y los resultados guardados.

## Procedencia

${Object.entries(procedencia).map(([k, v]) => `- ${k}: \`${seguro(v)}\`.`).join('\n')}

El generador verifica las huellas CSV contra procedencia.json, reconstruye banco.json desde tablas.json y reconcilia elegibilidad, identidades y total económico. Comprueba que los archivos leídos no cambien durante el análisis. Las huellas hacen reproducible esta lectura; no certifican por sí solas cuándo se ejecutó el motor. revisionGit y ejecutado del resultado son metadatos conservados, no la revisión/fecha del análisis ni prueba de código limpio durante aquella ejecución.

## Resumen

${t.universo} candidatas = ${t.excluidas} excluidas + ${t.elegibles} elegibles.
Precio: ${t.precioIgual} iguales, ${t.cercano} cercanas, ${t.distinto} distintas, ${t.sinValorar} sin valorar, ${t.error} errores.
Coincidencia física evaluada: ${t.fisicoIgual}/${t.elegibles}; precio y física simultáneos: ${t.precioYFisicoIgual}/${t.elegibles}.
Artículos, cantidades, cortes y unidades, sin exigir igualdad de acabado: ${t.piezasYCortesIgual}/${t.elegibles}; también con precio igual: ${t.precioYPiezasYCortesIgual}/${t.elegibles}.
Son criterios diagnósticos: no certifican fabricación, ángulos, mecanizados ni ramas no ejercitadas.

| Campo | Coincide | Difiere | Sin contraste |
|---|---:|---:|---:|
${REGLAS.map(r => `| ${r} | ${t.reglas[r].coincide} | ${t.reglas[r].difiere} | ${t.reglas[r].sinContraste} |`).join('\n')}

Física exige piezas (multiconjunto por artículo), cantidades, cortes, acabados y unidades coincidentes. Las funciones se contrastan aparte: la función histórica vacía no equivale a la etiqueta añadida por la web ni demuestra una pieza ausente; esa columna queda sin contraste. MO/MOCOL normalizan función a MO, igual que el criterio del banco. Piezas informativas artículo 0, avisos 133/134/135/155 y cantidad cero se conservan en la fuente y se excluyen del material. Un despiece vacío o una medición sin valorar/error no acredita coincidencia. Si falta/sobra alguna pieza, los demás campos quedan sin contraste: no comparar solo la parte presente.
Se reutilizan emparejamiento ordenado y tolerancias del banco: cantidad 0,001; corte 0,05 mm; metraje 0,005; PVP/coste 0,0001; importe 0,01. Coste compara coste unitario, no costeTotal ni margen. Nulos no equivalen a cero. Unidad/función son controles adicionales al banco. Física no incluye funciones ausentes, ángulos ni mecanizados y no es aceptación de fabricación. El precio igual conserva el umbral ±0,01 € del banco; cercano no cuenta como igual.

## Modelo y serie de la línea comercial

GRUPO se cuenta una sola vez con el conjunto ordenado de series conocidas de sus elementos; no reparte su resultado entre series ni afirma que los accesorios sin serie estén resueltos. Sus elementos no aumentan las 523 líneas elegibles.

| Modelo | Serie | Universo | Excluidas | Elegibles | Precio igual | Cercano | Distinto | Sin valorar | Error | Física igual | Precio y física |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${tabla}

## Modelo × serie × campo observado

Cada fila suma las elegibles de su par. Coincidencia de un campo no demuestra qué rama de catálogo lo produjo. La matriz de reglas documenta fuentes, implementación, pruebas y siguiente ensayo sin atribuir causalidad por coincidencia.

| Modelo | Serie | Campo | Coincide | Difiere | Sin contraste | Fuente, implementación y siguiente prueba |
|---|---|---|---:|---:|---:|---|
${reglas}

## Variantes presentes en las fuentes

Incluye candidatas excluidas. Rangos no significan cobertura continua; códigos/opciones observados no garantizan compatibilidad de su producto cartesiano. Opciones y fracciones cuentan elementos en GRUPO, líneas en estructuras; comisión/despunte cuentan líneas comerciales elegibles.

| Modelo | Serie | Ancho / alto mm (min..max) | Cantidad | Tarifa | Acabado / accesorios | Vidrios distintos | nTAcris | Con opciones guardadas | Accesorios | Con fracciones | Comisión / despunte |
|---|---|---|---|---|---|---:|---|---:|---|---:|---|
${variantes}

## Ausencias de contraste elegible en el catálogo

Inventario: ${inventario.modelos.length} modelos en Estructuras.Codigo; ${inventario.series.length} series en ConfigSeries.Serie.
Ausencia de línea independiente elegible: ${inventario.modelosSinElegibles.length} modelos y ${inventario.seriesSinElegibles.length} series. Un modelo puede estar dentro de un GRUPO sin medición individual. Ausencia no significa incompatible.
No se fabrica una matriz de compatibilidad con EstructurasSeriesAsoc: su semántica sigue pendiente en la evidencia de fase 7.

Modelos sin contraste independiente: ${lista(inventario.modelosSinElegibles)}.

Series sin contraste independiente: ${lista(inventario.seriesSinElegibles)}.
`
}
