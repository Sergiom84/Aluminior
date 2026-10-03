/**
 * Traduce `VAccesorios` + `VOpciones` de una línea a la entrada de compacto del
 * servicio web. Solo lo contrastado en EMP0016: un compacto (familia 100, COM*)
 * que descuenta el cajón del hueco, sin guías, tapas ni alto manual, con un
 * único acabado. Cualquier otro accesorio de línea queda sin representar.
 */
import type { CompactoLineaCatalogo } from '@aluminior/core/despiece'
import { numero, si, texto, type Caso } from './datos.ts'

export function compactoDeCaso(c: Caso): { compacto: CompactoLineaCatalogo | null; motivos: string[] } {
  const accesorios = c.accesorios ?? []
  if (!accesorios.length) return { compacto: null, motivos: [] }
  const [a] = accesorios
  if (accesorios.length > 1 || texto(a!.FamiliaAcc) !== '100' || !/^COM/.test(texto(a!.Accesorio))) {
    return { compacto: null, motivos: ['accesorio-de-linea-no-representable'] }
  }
  const motivos: string[] = []
  const acabado = texto(a!.Acabado)
  if (!si(a!.compDtoHuecoSN)) motivos.push('compacto-sobre-hueco-no-contrastado')
  if ([a!.CompAccAcaLamas, a!.CompAccAcaGuias, a!.CompAccAcaAcc].some(x => texto(x) && texto(x) !== acabado)) motivos.push('acabados-de-compacto-distintos')
  if (texto(a!.CerrCodGuiaI) || texto(a!.CerrCodGuiaD) || numero(a!.CerrAltoManual) || numero(a!.compDtoTapH) || numero(a!.compDtoTapV) ||
    numero(a!.DtoHuecoH) || numero(a!.nModulo)) motivos.push('compacto-con-guias-tapas-o-medidas-manuales')
  const opciones = (c.opcionesAccesorio ?? []).filter(o => texto(o.CodEstr) === texto(a!.Accesorio) && !si(o.GrupoDesactivadoSN))
    .map(o => `G${numero(o.OPCgrupo)}O${numero(o.OPCnOpcion)}`)
  if (!opciones.length) motivos.push('opciones-de-compacto-ausentes')
  const altoCajonMm = numero(a!.AltoCajon)
  if (!(altoCajonMm! > 0)) motivos.push('compacto-sin-alto-de-cajon')
  if (motivos.length) return { compacto: null, motivos }
  return { motivos, compacto: { estructura: texto(a!.Accesorio), acabado, altoCajonMm: altoCajonMm!,
    vueloIzquierdoMm: numero(a!.VueloI) ?? 0, vueloDerechoMm: numero(a!.VueloD) ?? 0,
    posicionGuiaCentralMm: numero(a!.PosGuiaCentral) ?? 0, descuentoVerticalMm: numero(a!.DtoHuecoV) ?? 0, opciones } }
}
