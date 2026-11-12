/**
 * Compactos de un GRUPO (`VAccesorios` familia 100 de la línea GRUPO) asignados a
 * sus módulos por `nModulo`: 1..N numera los módulos de la fila superior por `Orden`
 * (`indiceModuloCompacto`); 0 solo con un único módulo. Se transmiten al motor
 * únicamente con evidencia completa: estructura COM*, cajón sobre hueco, un compacto
 * por módulo y sin medidas manuales. En la 0016, 272 de 276 compactos de GRUPO no
 * guardan `VOpciones`: el motor toma entonces las predeterminadas del catálogo
 * (`EstructurasOpcOpciones`, 0033), como Productor.
 */
import { indiceModuloCompacto } from '@aluminior/core/estructuras'
import { numero, si, texto, type Caso, type Fila } from './datos.ts'

export interface CompactoGrupo { fila: Fila; opciones: string[]; orden: number }

export function compactosDeGrupo(c: Caso, modulos: number): { porModulo: Map<number, CompactoGrupo>; motivos: string[] } {
  const porModulo = new Map<number, CompactoGrupo>(), motivos: string[] = []
  const gs = c.geometria ?? []
  const modsGeo = gs.filter(g => !si(g.EsUnionSN)).sort((a, b) => numero(a.Orden)! - numero(b.Orden)!)
  const estructuraModulos = modsGeo.length === modulos
    ? modsGeo.map((g, i) => {
        const u = i > 0 ? gs.find(x => si(x.EsUnionSN) && texto(x.UOrdenElem2) === texto(g.Orden)) : undefined
        const lado = u && texto(u.UnionVH) === 'H' ? ('abajo' as const) : ('derecha' as const)
        return {
          id: `modulo-${texto(g.Orden)}`,
          ...(u ? { anclaje: { moduloId: `modulo-${texto(u.UOrdenElem1)}`, unionId: `union-${texto(u.Orden)}`, lado } } : {}),
        }
      })
    : Array.from({ length: modulos }, (_, i) => ({ id: `modulo-${i + 1}` }))
  const filas = (c.accesorios ?? []).filter(f => texto(f.FamiliaAcc) === '100')
  const ordenPorFila = new Map(
    [...filas].sort((a, b) => (numero(a.nModulo) ?? 0) - (numero(b.nModulo) ?? 0)).map((f, i) => [f, i]),
  )
  for (const a of filas) {
    if (!/^COM/.test(texto(a.Accesorio))) { motivos.push('compacto-no-representable'); continue }
    const n = numero(a.nModulo)
    const indice = indiceModuloCompacto(estructuraModulos, n)
    if (indice === null) { motivos.push('compacto-sin-modulo'); continue }
    if (porModulo.has(indice)) { motivos.push('compacto-repetido-en-modulo'); continue }
    if (!si(a.compDtoHuecoSN)) motivos.push('compacto-sobre-hueco-no-contrastado')
    if (!(numero(a.AltoCajon)! > 0)) motivos.push('compacto-sin-alto-de-cajon')
    if (numero(a.DtoHuecoH) || numero(a.CerrAltoManual)) {
      motivos.push('accesorio-con-guias-o-medidas-manuales')
    }
    const opciones = (c.opcionesAccesorio ?? []).filter(o => texto(o.CodEstr) === texto(a.Accesorio) && !si(o.GrupoDesactivadoSN) &&
      (numero(o.nModulo) === 0 || numero(o.nModulo) === n)).map(o => `G${numero(o.OPCgrupo)}O${numero(o.OPCnOpcion)}`)
    const acabado = texto(a.Acabado)
    if ((si(a.GuiaCentralSN) || opciones.includes('G1O1')) &&
      [a.CompAccAcaLamas, a.CompAccAcaGuias, a.CompAccAcaAcc].some(x => texto(x) && texto(x) !== acabado)) {
      motivos.push('acabados-de-accesorio-distintos')
    }
    porModulo.set(indice, { fila: a, opciones, orden: ordenPorFila.get(a) ?? 0 })
  }
  return { porModulo, motivos: [...new Set(motivos)] }
}
