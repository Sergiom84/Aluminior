/**
 * Compactos de un GRUPO (`VAccesorios` familia 100 de la línea GRUPO) asignados a
 * sus módulos por `nModulo`: 1 = primer módulo por `Orden` (contrastado en
 * `regresion-06`); 0 solo con un único módulo. Se transmiten al motor únicamente
 * con evidencia completa: estructura COM*, opciones guardadas en `VOpciones`,
 * cajón sobre hueco, un compacto por módulo, sin guías ni medidas manuales y un
 * solo acabado. En la 0016, 272 de 276 compactos de GRUPO no guardan opciones:
 * Productor aplica las de `EstructurasOpcGrupos/Opciones`, que Aluminior no
 * carga, así que esos compactos se apartan con su importe en vez de inventarlas.
 */
import { numero, si, texto, type Caso, type Fila } from './datos.ts'

export interface CompactoGrupo { fila: Fila; opciones: string[] }

export function compactosDeGrupo(c: Caso, modulos: number): { porModulo: Map<number, CompactoGrupo>; motivos: string[] } {
  const porModulo = new Map<number, CompactoGrupo>(), motivos: string[] = []
  for (const a of (c.accesorios ?? []).filter(f => texto(f.FamiliaAcc) === '100')) {
    if (!/^COM/.test(texto(a.Accesorio))) { motivos.push('compacto-no-representable'); continue }
    const n = numero(a.nModulo)
    const indice = n === 0 && modulos === 1 ? 0 : n !== null && Number.isInteger(n) && n >= 1 && n <= modulos ? n - 1 : null
    if (indice === null) { motivos.push('compacto-sin-modulo'); continue }
    if (porModulo.has(indice)) { motivos.push('compacto-repetido-en-modulo'); continue }
    if (!si(a.compDtoHuecoSN)) motivos.push('compacto-sobre-hueco-no-contrastado')
    if (!(numero(a.AltoCajon)! > 0)) motivos.push('compacto-sin-alto-de-cajon')
    if (numero(a.DtoHuecoH) || texto(a.CerrCodGuiaI) || texto(a.CerrCodGuiaD) || numero(a.CerrAltoManual)) {
      motivos.push('accesorio-con-guias-o-medidas-manuales')
    }
    const acabado = texto(a.Acabado)
    if ([a.CompAccAcaLamas, a.CompAccAcaGuias, a.CompAccAcaAcc].some(x => texto(x) && texto(x) !== acabado)) motivos.push('acabados-de-accesorio-distintos')
    const opciones = (c.opcionesAccesorio ?? []).filter(o => texto(o.CodEstr) === texto(a.Accesorio) && !si(o.GrupoDesactivadoSN) &&
      (numero(o.nModulo) === 0 || numero(o.nModulo) === n)).map(o => `G${numero(o.OPCgrupo)}O${numero(o.OPCnOpcion)}`)
    if (!opciones.length) motivos.push('opciones-de-compacto-ausentes')
    porModulo.set(indice, { fila: a, opciones })
  }
  return { porModulo, motivos: [...new Set(motivos)] }
}
