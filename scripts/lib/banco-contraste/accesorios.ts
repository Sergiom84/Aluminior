/**
 * Traduce `VAccesorios` + `VOpciones` de una línea a los accesorios del servicio
 * web. Solo lo contrastado en EMP0016: como máximo un compacto (familia 100, COM*)
 * que descuenta el cajón del hueco, una mosquitera (101) y un tapajuntas (102),
 * sin guías ni alto manual y con un único acabado por accesorio. El descuento de
 * tapajuntas del compacto (`compDtoTap*`) y el de hueco del tapajuntas
 * (`DtoHueco*`) no cambian los cortes observados. Otras familias (tubos 112) o
 * accesorios repetidos quedan sin representar.
 */
import type { AccesorioLineaCatalogo, CompactoLineaCatalogo } from '@aluminior/core/despiece'
import { numero, si, texto, type Caso, type Fila } from './datos.ts'

const FAMILIAS: Readonly<Record<string, string>> = { '100': 'compacto', '101': 'mosquitera', '102': 'tapajuntas' }

export function accesoriosDeCaso(c: Caso): { compacto: CompactoLineaCatalogo | null; accesorios: AccesorioLineaCatalogo[]; motivos: string[] } {
  const filas = c.accesorios ?? []
  const vacio = (motivos: string[]) => ({ compacto: null, accesorios: [], motivos })
  if (!filas.length) return vacio([])
  const tipos = filas.map(a => FAMILIAS[texto(a.FamiliaAcc)])
  if (tipos.some(t => !t) || new Set(tipos).size !== tipos.length ||
    filas.some((a, i) => tipos[i] === 'compacto' && !/^COM/.test(texto(a.Accesorio)))) return vacio(['accesorio-de-linea-no-representable'])
  const motivos: string[] = []
  const opciones = (a: Fila) => (c.opcionesAccesorio ?? []).filter(o => texto(o.CodEstr) === texto(a.Accesorio) && !si(o.GrupoDesactivadoSN))
    .map(o => `G${numero(o.OPCgrupo)}O${numero(o.OPCnOpcion)}`)
  for (const a of filas) {
    const acabado = texto(a.Acabado)
    if ([a.CompAccAcaLamas, a.CompAccAcaGuias, a.CompAccAcaAcc].some(x => texto(x) && texto(x) !== acabado)) motivos.push('acabados-de-accesorio-distintos')
    if (texto(a.CerrCodGuiaI) || texto(a.CerrCodGuiaD) || numero(a.CerrAltoManual) || numero(a.nModulo)) motivos.push('accesorio-con-guias-o-medidas-manuales')
  }
  const [compacto] = filas.filter((_, i) => tipos[i] === 'compacto')
  if (compacto) {
    if (!si(compacto.compDtoHuecoSN)) motivos.push('compacto-sobre-hueco-no-contrastado')
    if (numero(compacto.DtoHuecoH) || ((numero(compacto.compDtoTapH) || numero(compacto.compDtoTapV)) && !tipos.includes('tapajuntas'))) {
      motivos.push('accesorio-con-guias-o-medidas-manuales')
    }
    if (!opciones(compacto).length) motivos.push('opciones-de-compacto-ausentes')
    if (!(numero(compacto.AltoCajon)! > 0)) motivos.push('compacto-sin-alto-de-cajon')
  }
  if (motivos.length) return vacio([...new Set(motivos)])
  return { motivos, accesorios: filas.filter((_, i) => tipos[i] !== 'compacto')
    .map(a => ({ estructura: texto(a.Accesorio), acabado: texto(a.Acabado), opciones: opciones(a) })),
  compacto: compacto ? { estructura: texto(compacto.Accesorio), acabado: texto(compacto.Acabado), opciones: opciones(compacto),
    altoCajonMm: numero(compacto.AltoCajon)!, vueloIzquierdoMm: numero(compacto.VueloI) ?? 0, vueloDerechoMm: numero(compacto.VueloD) ?? 0,
    posicionGuiaCentralMm: numero(compacto.PosGuiaCentral) ?? 0, descuentoVerticalMm: numero(compacto.DtoHuecoV) ?? 0 } : null }
}
