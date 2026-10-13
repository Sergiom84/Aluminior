import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { leerPreciosTabla } from './leer.ts'

const carpetas: string[] = []
const articulos = 'Codigo,PrecioTablaSN,ptNoMedInfSN,ptNoMedSupSN,ptSoloMedTablaAnchoSN,ptSoloMedTablaLargoSN,ptNoPVPCeroSN\nQA-T,True,False,False,False,False,False\nQA-F,False,False,False,False,False,False\n'
const cabecera = 'Articulo,Acabado,Tarifa,Ancho,Largo,PVP,EsAcabadoDependienteSN\n'
function origen(precios = cabecera + 'QA-T,L,1,1000,2000,"12,34",False\n', fuenteArticulos = articulos) {
  const p = mkdtempSync(join(tmpdir(), 'aluminior-precio-tabla-')); carpetas.push(p)
  writeFileSync(join(p, 'Articulos.csv'), fuenteArticulos)
  writeFileSync(join(p, 'ArticulosPrecioTablaPVP.csv'), precios)
  return p
}
afterEach(() => { for (const p of carpetas.splice(0)) rmSync(p, { recursive: true, force: true }) })

describe('lectura de PVP por dimensiones', () => {
  it('separa precio, medidas y políticas, sin leer costes ni documentos', async () => {
    const r = await leerPreciosTabla(origen())
    expect(r.articulos.map(a => a.precio_en_tabla)).toEqual([true, false])
    expect(r.precios).toEqual([{ articulo_codigo: 'QA-T', acabado_codigo: 'L', tarifa: 1, ancho_mm: '1000',
      largo_mm: '2000', precio: '12.34', acabado_dependiente: false }])
  })
  it.each(['TRUE', 'TrUe', '-1', '1'])('conserva flags %s y acabado dependiente como true', async valor => {
    const r = await leerPreciosTabla(origen(cabecera + `QA-T,L,1,1000,2000,12,${valor}\n`,
      articulos.replace('QA-T,True,False,False,False,False,False', `QA-T,${valor},${valor},${valor},${valor},${valor},${valor}`)))
    expect(r.articulos[0]).toMatchObject({ precio_en_tabla: true, politicas_precio_tabla: {
      noMedidasInferiores: true, noMedidasSuperiores: true, soloMedidasAncho: true, soloMedidasLargo: true, noPrecioCero: true } })
    expect(r.precios[0].acabado_dependiente).toBe(true)
  })
  it.each(['FALSE', 'FaLsE', '0', '', 'ilegible'])('no confunde el acabado dependiente %s con true', async valor => {
    const r = await leerPreciosTabla(origen(cabecera + `QA-T,L,1,1000,2000,12,${valor}\n`))
    expect(r.precios[0].acabado_dependiente).toBe(['', 'ilegible'].includes(valor) ? null : false)
  })
  it.each(['1,49', '1,5', '1,00000000000000001', '0', '-1', 'ilegible', '2147483648'])('rechaza tarifa %s sin redondear su clave', async tarifa => {
    await expect(leerPreciosTabla(origen(cabecera + `QA-T,L,"${tarifa}",1000,2000,12,False\n`)))
      .rejects.toThrow('sin clave, medidas o precio válidos')
  })
  it.each(['1000,0001', '1000,1234', '0,0001', '10000000', '1000.5', '1e3', 'ilegible'])('rechaza cota %s antes de alterar un umbral', async medida => {
    for (const eje of ['ancho', 'largo']) await expect(leerPreciosTabla(origen(cabecera +
      `QA-T,L,1,"${eje === 'ancho' ? medida : '1000'}","${eje === 'largo' ? medida : '2000'}",12,False\n`)))
      .rejects.toThrow('sin clave, medidas o precio válidos')
  })
  it('conserva cotas representables, incluidos ceros extra, sin redondearlas', async () => {
    const r = await leerPreciosTabla(origen(cabecera + 'QA-T,L,"1,000","1.000,123000","2.000,0000",12,False\n'))
    expect(r.precios[0]).toMatchObject({ tarifa: 1, ancho_mm: '1000.123000', largo_mm: '2000.0000' })
  })
  it('rechaza claves dimensionales duplicadas incluso con escritura decimal distinta', async () => {
    await expect(leerPreciosTabla(origen(cabecera + 'QA-T,L,1,1000,2000,12,False\nQA-T,L,1,"1000,0",2000,12,False\n')))
      .rejects.toThrow('duplicado')
  })
  it('rechaza fuente ausente, vacía y PVP de artículos no configurados por tabla', async () => {
    const p = origen(); rmSync(join(p, 'Articulos.csv'))
    await expect(leerPreciosTabla(p)).rejects.toThrow('Falta Articulos')
    await expect(leerPreciosTabla(origen(cabecera))).rejects.toThrow('vacío')
    await expect(leerPreciosTabla(origen(cabecera + 'QA-F,L,1,1000,2000,12,False\n'))).rejects.toThrow('sin artículo configurado')
  })
})
