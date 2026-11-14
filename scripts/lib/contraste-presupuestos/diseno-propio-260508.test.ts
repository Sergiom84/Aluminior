/**
 * Contraste extremo a extremo del guardado y valoración de `modulo.disenoPropio`
 * (sin inyectar `plantillasPropias`) contra los 9 casos reales grabados en
 * Productor el 13/11/2026 (empresa de pruebas 0017, presupuesto 260508).
 *
 * Lee los árboles de `EstructurasDiseno.tsv` y el `Precio` esperado de cada
 * línea `GRUPO` en `VPresupuestosLin.tsv`. Solo corre con
 * `ALUMINIOR_CONTRASTE_LOCAL=1` y el volcado local presente.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  actualizarDisenoPropioModuloCerramiento, actualizarDivisionDisenoPropio,
  actualizarFiModuloCerramiento, actualizarModuloCerramiento,
  cambiarBarrotilloHuecoDisenoPropio, cambiarHojaHuecoDisenoPropio,
  cambiarVidrioHuecoDisenoPropio, crearConfiguracionCerramiento,
  distribuirModuloCerramiento, dividirHuecoDisenoPropio,
  inspeccionarDisenoPropio, plantillaDiseno, sembrarDisenoPropioModulo,
} from '@aluminior/core/estructuras'
import { nodoDisenoDeProductor } from './diseno-documento.ts'

const DIRECTORIO_CASOS = 'output/diseno-especifico-20261113/casos-0017'
const disponible = process.env.ALUMINIOR_CONTRASTE_LOCAL === '1' &&
  existsSync(join(DIRECTORIO_CASOS, 'EstructurasDiseno.tsv')) &&
  existsSync(join(DIRECTORIO_CASOS, 'VPresupuestosLin.tsv'))

type FilaTsv = Record<string, string>

function leerTsv(ruta: string): FilaTsv[] {
  const [cabecera, ...lineas] = readFileSync(ruta, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  const columnas = (cabecera ?? '').split('\t')
  return lineas.map(l => {
    const v = l.split('\t')
    return Object.fromEntries(columnas.map((c, i) => [c, v[i] ?? '']))
  })
}

/** Serie declarada en la guía y en la descripción generada por Productor en el 260508. */
function serieDeLinea(descripcion: string): 'GMA350' | 'ELEGANTPVC' {
  return descripcion.includes('ELEGANT') ? 'ELEGANTPVC' : 'GMA350'
}
test('260508 (0017): `modulo.disenoPropio` coincide con Productor en precio y dibujo en los casos reales', {
  skip: !disponible && 'requiere ALUMINIOR_CONTRASTE_LOCAL=1, aluminior_real_test y casos-0017',
}, async () => {
  const { conectarLocal, URL_LOCAL } = await import('../banco-contraste/local.ts')
  const { asegurarCatalogoDiseno, importesLineaCerramiento, prepararManoObra, valorarCerramiento } =
    await import('@aluminior/web/banco-contraste')

  const disenos = leerTsv(join(DIRECTORIO_CASOS, 'EstructurasDiseno.tsv'))
  const lineas = leerTsv(join(DIRECTORIO_CASOS, 'VPresupuestosLin.tsv'))
  const grupos = new Map(lineas.filter(l => l.GrupoSN === 'True').map(l => [l.nLinea!, l]))
  const estructuras = lineas
    .filter(l => l.EstructuraSN === 'True')
    .sort((a, b) => Number(a.nOrden) - Number(b.nOrden))

  assert.equal(estructuras.length, 9)

  const { sql, db } = conectarLocal(URL_LOCAL)
  try {
    await asegurarCatalogoDiseno(db)
    const manoObra = await prepararManoObra(db, { tarifa: 1, horas: { fabricacion: '0', colocacion: '0' } })
    assert.notEqual(manoObra.estado, 'MIGRACION_PENDIENTE')

    const valorar = async (nLinEstr: string) => {
      const estr = estructuras.find(e => e.nLinea === nLinEstr)
      assert.ok(estr, `falta estructura ${nLinEstr}`)
      const grupo = grupos.get(estr.nGrupo!)
      assert.ok(grupo, `falta GRUPO de ${nLinEstr}`)
      const esperado = Number(grupo.Precio).toFixed(2)

      const nodos = disenos
        .filter(d => d.nLinEstr === nLinEstr)
        .sort((a, b) => Number(a.nLin) - Number(b.nLin))
        .map(nodoDisenoDeProductor)

      const plantillaBase = plantillaDiseno(estr.Articulo!)
      assert.ok(plantillaBase, `plantilla no dibujable: ${estr.Articulo}`)
      const inicial = actualizarModuloCerramiento(
        crearConfiguracionCerramiento(plantillaBase),
        'modulo-1',
        { anchoMm: Number(estr.Ancho), altoMm: Number(estr.Largo) },
      )
      const configuracion = actualizarDisenoPropioModuloCerramiento(inicial, 'modulo-1', { nodos })
      assert.ok(configuracion.modulos[0]?.disenoPropio, `no se guardó disenoPropio en ${nLinEstr}`)

      const resultado = await valorarCerramiento(db, {
        configuracion,
        serieCodigo: serieDeLinea(estr.Descripcion ?? ''),
        acabadoCodigo: estr.Acabado || 'L',
        acabadoAccesoriosCodigo: estr.Acabado2 || 'UNI',
        vidrioCodigo: 'VCG4',
        varianteAcristalamiento: '1',
        tarifa: 1,
        opcionesPorDefecto: true,
      })
      const importes = importesLineaCerramiento(resultado, '1', manoObra, null)
      assert.equal(importes.valoracionCompleta, true, `incompleta en ${nLinEstr}: ${JSON.stringify(resultado.origenes[0]?.diagnosticos)}`)
      const obtenido = Number(importes.precioUnitario).toFixed(2)
      const dibujo = distribuirModuloCerramiento(
        configuracion.modulos[0]!,
        { x: 0, y: 0, ancho: Number(estr.Ancho), alto: Number(estr.Largo) },
      )
      return { configuracion, obtenido, esperado, dibujo }
    }

    // 1) Caso 3: fijo con travesaño inferior a cota fija 400.
    const caso3 = await valorar('497121')
    assert.equal(caso3.obtenido, caso3.esperado)
    const trav3 = caso3.dibujo.find(e => e.tipo === 'separador')
    assert.ok(trav3 && trav3.tipo === 'separador')
    assert.equal(trav3.y + trav3.alto / 2, 800)
    assert.deepEqual(caso3.dibujo.filter(e => e.tipo === 'hueco').map(h => h.apertura), ['fijo', 'fijo'])

    // 2) Caso 7: hoja oscilobatiente dentro de un hueco inferior a 300.
    const caso7 = await valorar('497300')
    assert.equal(caso7.obtenido, caso7.esperado)
    const trav7 = caso7.dibujo.find(e => e.tipo === 'separador')
    assert.ok(trav7 && trav7.tipo === 'separador')
    assert.equal(trav7.y + trav7.alto / 2, 900)
    assert.deepEqual(caso7.dibujo.filter(e => e.tipo === 'hueco').map(h => h.apertura), ['fijo', 'oscilobatiente-izquierda'])

    // 3) Caso 10 (`497453`): en Productor, cambiar `Cota por` a 500 en Diseño V3
    // guardó `Cota = 500` en el árbol pero dejó la variable de línea en `FI = 300`
    // (`FIJO INFERIOR: 300,0`, cortes 300 y 1700, 460,24 €).
    // Aluminior propaga el 500 a `fiMm` al guardar para no engañar al operador
    // (desviación corregida), y cuando la línea está en 300 clava los 460,24 € de Productor.
    const caso10 = await valorar('497453')
    assert.equal(caso10.configuracion.modulos[0]?.fiMm, 500)
    assert.equal(caso10.obtenido, '449.30')
    assert.notEqual(caso10.obtenido, caso10.esperado)
    const trav10 = caso10.dibujo.find(e => e.tipo === 'separador')
    assert.ok(trav10 && trav10.tipo === 'separador')
    assert.equal(trav10.y + trav10.alto / 2, 1500)
    assert.deepEqual(caso10.dibujo.filter(e => e.tipo === 'hueco').map(h => h.apertura), ['oscilobatiente-izquierda', 'fijo'])

    const lineaEn300 = actualizarFiModuloCerramiento(caso10.configuracion, 'modulo-1', 300)
    const res300 = await valorarCerramiento(db, {
      configuracion: lineaEn300,
      serieCodigo: 'ELEGANTPVC', acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI',
      vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 1, opcionesPorDefecto: true,
    })
    const imp300 = importesLineaCerramiento(res300, '1', manoObra, null)
    assert.equal(Number(imp300.precioUnitario).toFixed(2), caso10.esperado)
    const trav300 = distribuirModuloCerramiento(lineaEn300.modulos[0]!, { x: 0, y: 0, ancho: 800, alto: 2000 })
      .find(e => e.tipo === 'separador')
    assert.ok(trav300 && trav300.tipo === 'separador')
    assert.equal(trav300.y + trav300.alto / 2, 1700)

    // Resto de los 9 casos del 260508 (incluido Caso 8 con barrotillo interior 2H × 1V).
    for (const estr of estructuras) {
      if (['497121', '497300', '497453'].includes(estr.nLinea!)) continue
      const c = await valorar(estr.nLinea!)
      assert.equal(c.obtenido, c.esperado, `diferencia en línea ${estr.nLinea} (orden ${estr.nOrden})`)
      if (estr.nLinea === '497375') {
        const hueco = c.dibujo.find(e => e.tipo === 'hueco')
        assert.deepEqual(hueco?.barrotillo, { horizontales: 2, verticales: 1 })
      }
    }

    // Flujo del operador desde cero con las operaciones del editor (Paso 5):
    // 1) Caso 3 desde fijo `0` -> dividir HB a 400 mm = 192,99 €.
    const baseFijo = crearConfiguracionCerramiento(plantillaDiseno('0')!)
    const op3 = actualizarDisenoPropioModuloCerramiento(
      baseFijo, 'modulo-1',
      dividirHuecoDisenoPropio(sembrarDisenoPropioModulo(baseFijo.modulos[0]!)!, 0, { posicion: 'HB', tipoCota: 2, cotaMm: 400 }),
    )
    const rOp3 = await valorarCerramiento(db, {
      configuracion: op3, serieCodigo: 'GMA350', acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI',
      vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 1, opcionesPorDefecto: true,
    })
    assert.equal(Number(importesLineaCerramiento(rOp3, '1', manoObra, null).precioUnitario).toFixed(2), caso3.esperado)

    // 2) Caso 7 desde fijo `0` -> dividir HB a 300 mm + hoja oscilobatiente izquierda en hueco 2 = 394,16 €.
    const div300 = dividirHuecoDisenoPropio(sembrarDisenoPropioModulo(baseFijo.modulos[0]!)!, 0, { posicion: 'HB', tipoCota: 2, cotaMm: 300 })
    const huecoInf = inspeccionarDisenoPropio(div300, 1200, 1200).huecos[1]!
    const op7 = actualizarDisenoPropioModuloCerramiento(
      baseFijo, 'modulo-1',
      cambiarHojaHuecoDisenoPropio(div300, huecoInf.regionId, { modo: 'hoja', tipoHoja: 6 }),
    )
    const rOp7 = await valorarCerramiento(db, {
      configuracion: op7, serieCodigo: 'GMA350', acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI',
      vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 1, opcionesPorDefecto: true,
    })
    assert.equal(Number(importesLineaCerramiento(rOp7, '1', manoObra, null).precioUnitario).toFixed(2), caso7.esperado)

    // 3) Caso 8 desde fijo `0` -> vidrio VGS616AL33I + barrotillo BI 2H × 1V = 322,40 €.
    const c8Esperado = Number(grupos.get(estructuras.find(e => e.nLinea === '497375')!.nGrupo!)!.Precio).toFixed(2)
    const op8 = actualizarDisenoPropioModuloCerramiento(
      baseFijo, 'modulo-1',
      cambiarBarrotilloHuecoDisenoPropio(
        cambiarVidrioHuecoDisenoPropio(sembrarDisenoPropioModulo(baseFijo.modulos[0]!)!, 0, 'VGS616AL33I'),
        0, { horizontales: 2, verticales: 1 },
      ),
    )
    const rOp8 = await valorarCerramiento(db, {
      configuracion: op8, serieCodigo: 'GMA350', acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI',
      vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 1, opcionesPorDefecto: true,
    })
    assert.equal(Number(importesLineaCerramiento(rOp8, '1', manoObra, null).precioUnitario).toFixed(2), c8Esperado)

    // 4) Caso 10 desde `1OFI` 800 × 2000 -> sembrar (300) + cambiar `Cota por` a 500 -> fiMm = 500 (449,30 €).
    const base1Ofi = actualizarModuloCerramiento(
      crearConfiguracionCerramiento(plantillaDiseno('1OFI')!), 'modulo-1', { anchoMm: 800, altoMm: 2000 },
    )
    const sembrado10 = sembrarDisenoPropioModulo(base1Ofi.modulos[0]!)!
    const div10 = inspeccionarDisenoPropio(sembrado10, 800, 2000, { FI: 300 }).divisiones[0]!
    const op10 = actualizarDisenoPropioModuloCerramiento(
      base1Ofi, 'modulo-1', actualizarDivisionDisenoPropio(sembrado10, div10.divisionId, { cotaMm: 500 }),
    )
    assert.equal(op10.modulos[0]?.fiMm, 500)
    const rOp10 = await valorarCerramiento(db, {
      configuracion: op10, serieCodigo: 'ELEGANTPVC', acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI',
      vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 1, opcionesPorDefecto: true,
    })
    assert.equal(Number(importesLineaCerramiento(rOp10, '1', manoObra, null).precioUnitario).toFixed(2), '449.30')

    const precioDe = (nLin: string) => Number(grupos.get(estructuras.find(e => e.nLinea === nLin)!.nGrupo!)!.Precio).toFixed(2)
    const valorarEditor = async (diseno: NonNullable<ReturnType<typeof sembrarDisenoPropioModulo>>, serie: 'GMA350' | 'ELEGANTPVC') => {
      const configuracion = actualizarDisenoPropioModuloCerramiento(baseFijo, 'modulo-1', diseno)
      const resultado = await valorarCerramiento(db, {
        configuracion, serieCodigo: serie, acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'UNI',
        vidrioCodigo: 'VCG4', varianteAcristalamiento: '1', tarifa: 1, opcionesPorDefecto: true,
      })
      return Number(importesLineaCerramiento(resultado, '1', manoObra, null).precioUnitario).toFixed(2)
    }
    const sembrado = sembrarDisenoPropioModulo(baseFijo.modulos[0]!)!
    const caso1 = dividirHuecoDisenoPropio(sembrado, 0, { posicion: 'VI', tipoCota: 0, huecos: 2 })
    assert.equal(await valorarEditor(caso1, 'GMA350'), precioDe('497020'), 'editor caso 1')
    assert.equal(await valorarEditor(caso1, 'ELEGANTPVC'), precioDe('497406'), 'editor caso 9')
    assert.equal(await valorarEditor(dividirHuecoDisenoPropio(sembrado, 0, { posicion: 'HA', tipoCota: 0, huecos: 3 }), 'GMA350'), precioDe('497065'), 'editor caso 2')
    const a300 = dividirHuecoDisenoPropio(sembrado, 0, { posicion: 'HB', tipoCota: 2, cotaMm: 300 })
    const inferior = inspeccionarDisenoPropio(a300, 1200, 1200).huecos[1]!
    assert.equal(await valorarEditor(dividirHuecoDisenoPropio(a300, inferior.regionId, { posicion: 'VI', tipoCota: 0, huecos: 2 }), 'GMA350'), precioDe('497166'), 'editor caso 4')
    assert.equal(await valorarEditor(cambiarHojaHuecoDisenoPropio(a300, inferior.regionId, { modo: 'hoja', tipoHoja: 1 }), 'GMA350'), precioDe('497221'), 'editor caso 6')
  } finally {
    await sql.end({ timeout: 5 })
  }
})

