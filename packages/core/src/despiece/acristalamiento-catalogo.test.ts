import { describe, expect, it } from 'vitest'
import { acristalarVidrio, type FilaTablaAcristalamiento, type VidrioParaAcristalar } from './acristalamiento-catalogo.ts'
import type { DescuentoCorte } from './cortes-referenciados.ts'

// Tabla manual sintética: galce 30, junquillos de 8 y 12, juntas de 3 y 5.
const tabla: FilaTablaAcristalamiento[] = [
  { posicion: '*', junquillo: 'JQ8', juntaExterior: 'JE', juntaInterior: 'JI5', grosor: 14 },
  { posicion: '*', junquillo: 'JQ8', juntaExterior: 'JE', juntaInterior: 'JI3', grosor: 16 },
  { posicion: '*', junquillo: 'JQ12', juntaExterior: 'JE', juntaInterior: 'JI3', grosor: 12 },
]
const vidrio: VidrioParaAcristalar = {
  grosorMm: 15, referenciaLargoMm: 1000, referenciaAnchoMm: 600, moduloLargoMm: 1100, moduloAnchoMm: 650,
  grupoIzquierdo: 'HP', grupoDerecho: 'HP', grupoSuperior: 'HP', grupoInferior: 'HP', tipoHoja: '1HO',
}
const descuentos: DescuentoCorte[] = [
  { grupoPrincipal: 'HP', grupo: 'JH', tipoHoja: 'G', mm: 40 },
  { grupoPrincipal: 'HP', grupo: 'JV', tipoHoja: 'G', mm: 60 },
]
const existe = (c: string) => c !== 'NOEXISTE'

describe('acristalarVidrio', () => {
  it('elige el menor grosor que admite el vidrio y corta junquillos por descuentos', () => {
    const r = acristalarVidrio(vidrio, tabla, descuentos, existe)
    expect(r.incidencias).toEqual([])
    expect(r.piezas).toEqual([
      { articulo: 'JQ8', cantidad: 2, largoMm: 520, funcion: 'JUNQ' },
      { articulo: 'JQ8', cantidad: 2, largoMm: 880, funcion: 'JUNQ' },
      { articulo: 'JE', cantidad: 2, largoMm: 650, funcion: 'JEXT' },
      { articulo: 'JE', cantidad: 2, largoMm: 1100, funcion: 'JEXT' },
      { articulo: 'JI3', cantidad: 2, largoMm: 650, funcion: 'JINT' },
      { articulo: 'JI3', cantidad: 2, largoMm: 1100, funcion: 'JINT' },
    ])
  })
  it('un junquillo 0 no genera pieza y una junta inexistente se omite con aviso', () => {
    const r = acristalarVidrio(vidrio, [{ posicion: '*', junquillo: '0', juntaExterior: 'NOEXISTE', juntaInterior: 'NOEXISTE', grosor: 99 }], descuentos, existe)
    expect(r.piezas).toEqual([])
    expect(r.incidencias).toEqual([])
    expect(r.avisos).toHaveLength(2)
  })
  it('bloquea vidrio sin fila, tabla vacía, por posiciones o sin descuento de junquillo', () => {
    expect(acristalarVidrio({ ...vidrio, grosorMm: 20 }, tabla, descuentos, existe).incidencias).toEqual(['sin junquillo para vidrio de 20 mm'])
    expect(acristalarVidrio(vidrio, [], descuentos, existe).incidencias[0]).toMatch(/automática/)
    expect(acristalarVidrio(vidrio, [{ ...tabla[0]!, posicion: 'Sup' }], descuentos, existe).incidencias[0]).toMatch(/posiciones/)
    expect(acristalarVidrio(vidrio, tabla, descuentos.slice(0, 1), existe).incidencias[0]).toMatch(/descuento de junquillo/)
  })
})
