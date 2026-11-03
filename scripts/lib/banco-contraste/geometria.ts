import { SIMBOLOS_COTA_MODULO, type ConfiguracionCerramientoV3, type CotasModulo, type ModuloCerramiento, type UnionCerramiento } from '@aluminior/core/estructuras'
import { cotasDeCaso } from './cotas.ts'
import { compactosDeGrupo, type CompactoGrupo } from './compacto-grupo.ts'
import { clave, numero, si, texto, type Caso } from './datos.ts'
/**
 * `linea`: medida económica guardada en cada elemento (Productor ya restó las uniones).
 * `nominal`: hueco del dibujo (`AnchoHueco/AltoHueco`) con el reparto de uniones de
 * Aluminior (`repartoUniones: 'PIEZAS'`), como si el operador dibujase el mismo conjunto.
 */
export type MedidasGrupo = 'linea' | 'nominal'
const nominal = (hueco: unknown, dibujo: unknown) => numero(hueco)! > 0 ? numero(hueco)! : numero(dibujo)!

/**
 * Compacto del módulo. `alturaTotalMm` solo cuando el alto del elemento COM de
 * Productor difiere de ventana + cajón (persiana que cubre fijos): medida observada
 * en el resultado, sin regla de cálculo demostrada ni equivalente en la web.
 */
function compactoDeModulo(c: Caso, compacto: CompactoGrupo | undefined, g: NonNullable<Caso['geometria']>[number],
  e: Caso, porLin: Map<string, Caso>, medidas: MedidasGrupo): ModuloCerramiento['compacto'] {
  if (!compacto) return undefined
  const { fila: comp, opciones } = compacto, acabado = texto(comp.Acabado)
  const porLinCom = new Map((c.compactosElementos ?? []).map(el => [texto(el.padre.nLinea), el]))
  const elemCom = (comp.nLinEstrGrupo ? (porLin.get(texto(comp.nLinEstrGrupo)) ?? porLinCom.get(texto(comp.nLinEstrGrupo))) : null) ??
    (c.compactosElementos ?? c.elementos ?? []).find(el => el.modelo === texto(comp.Accesorio))
  const altoCom = elemCom?.dimensiones.alto
  const altoPrevisto = (medidas === 'nominal' ? nominal(g.AltoHueco, g.Alto) : e.dimensiones.alto!) + numero(comp.AltoCajon)!
  const alturaTotalMm = altoCom && Math.abs(altoCom - altoPrevisto) > 1 ? altoCom : undefined
  return { estructuraCodigo: texto(comp.Accesorio), altoCajonMm: numero(comp.AltoCajon)!,
    ...(acabado ? { acabadoCodigo: acabado } : {}), opciones,
    ...(numero(comp.VueloI) ? { vueloIzquierdoMm: numero(comp.VueloI)! } : {}),
    ...(numero(comp.VueloD) ? { vueloDerechoMm: numero(comp.VueloD)! } : {}),
    ...(numero(comp.PosGuiaCentral) ? { posicionGuiaCentralMm: numero(comp.PosGuiaCentral)! } : {}),
    ...(numero(comp.DtoHuecoV) ? { descuentoVerticalMm: numero(comp.DtoHuecoV)! } : {}),
    ...(alturaTotalMm ? { alturaTotalMm } : {}) }
}
/** UOrdenElem1/2 se resuelven por Orden, nunca por nLinea ni posición de array. */
export function configuracionGrupo(c: Caso, medidas: MedidasGrupo = 'linea'): { configuracion: ConfiguracionCerramientoV3 | null; motivos: string[] } {
  const motivos: string[] = [], modulos: ModuloCerramiento[] = [], uniones: UnionCerramiento[] = []
  const gs = c.geometria ?? [], elementos = c.elementos ?? []
  const porLin = new Map(elementos.map(e => [texto(e.padre.nLinea), e]))
  const mods = gs.filter(g => !si(g.EsUnionSN)).sort((a, b) => numero(a.Orden)! - numero(b.Orden)!)
  const porOrden = new Map(mods.map(g => [texto(g.Orden), g]))
  if (porOrden.size !== mods.length) return { configuracion: null, motivos: ['orden-geometrico-ambiguo'] }
  const compactos = compactosDeGrupo(c, mods.length)
  motivos.push(...compactos.motivos)
  for (let i = 0; i < mods.length; i++) {
    const g = mods[i]!, e = porLin.get(texto(g.nLinEstr))
    if (!e) { motivos.push('elemento-no-enlazado'); continue }
    const { cotas: cotasElemento, motivos: motivosCotas } = cotasDeCaso(e)
    const compacto = compactoDeModulo(c, compactos.porModulo.get(i), g, e, porLin, medidas)
    motivos.push(...motivosCotas)
    const cotas = Object.fromEntries(
      SIMBOLOS_COTA_MODULO.flatMap(s => cotasElemento[s] !== undefined && cotasElemento[s] > 0 ? [[s, cotasElemento[s]]] : []),
    ) as CotasModulo
    // El dibujo guarda hueco/envolvente; la línea guarda la medida económica fabricada.
    // No sustituimos la medida de valoración por la de representación del cerramiento.
    const m: ModuloCerramiento = { id: `modulo-${texto(g.Orden)}`, estructuraCodigo: e.modelo,
      anchoMm: medidas === 'nominal' ? nominal(g.AnchoHueco, g.Ancho) : e.dimensiones.ancho!,
      altoMm: medidas === 'nominal' ? nominal(g.AltoHueco, g.Alto) : e.dimensiones.alto!,
      ...(Object.keys(cotas).length ? { cotas } : {}),
      ...(compacto ? { compacto } : {}),
      materiales: { ...(e.serie ? { serieCodigo: e.serie } : {}), ...(e.vidrio ? { vidrioCodigo: e.vidrio } : {}) } }
    if (i > 0) {
      const candidatas = gs.filter(u => si(u.EsUnionSN) && texto(u.UOrdenElem2) === texto(g.Orden))
      if (candidatas.length !== 1) motivos.push('anclaje-no-representable')
      else {
        const u = candidatas[0]!, previo = porOrden.get(texto(u.UOrdenElem1))
        if (!previo || numero(previo.Orden)! >= numero(g.Orden)! || !['V', 'H'].includes(texto(u.UnionVH))) motivos.push('anclaje-no-demostrado')
        else m.anclaje = { moduloId: `modulo-${texto(previo.Orden)}`, unionId: `union-${texto(u.Orden)}`,
          lado: texto(u.UnionVH) === 'V' ? 'derecha' : 'abajo' }
      }
    }
    modulos.push(m)
  }
  for (const u of gs.filter(g => si(g.EsUnionSN))) {
    const e = porLin.get(texto(u.nLinEstr))
    if (!e || e.modelo !== texto(u.CodEstr) || clave(e.padre.nDoc, e.padre.nGrupo) !== clave(c.padre.nDoc, c.padre.nLinea)) motivos.push('union-no-enlazada')
    // Ancho de la línea de accesorio es 0; grosor físico explícito está en UGrosor.
    // Solo aceptar la longitud si coincide con la medida económica de la línea.
    // En nominal, el motor recalcula la longitud como lado común.
    if (medidas === 'linea' && numero(u.ULongitud) !== e?.dimensiones.alto) motivos.push('longitud-de-union-no-demostrada')
    // La serie de la unión se conserva aunque no sea la del primer módulo.
    uniones.push({ id: `union-${texto(u.Orden)}`, codigo: texto(u.CodEstr), grosorMm: numero(u.UGrosor)!,
      longitudMm: medidas === 'nominal' ? numero(u.ULongitud)! : e?.dimensiones.alto!,
      ...(e?.serie ? { materiales: { serieCodigo: e.serie } } : {}) })
  }
  if (uniones.length !== modulos.length - 1) motivos.push('composicion-no-representable')
  return { configuracion: motivos.length ? null : { version: 3, modulos, uniones,
    ...(medidas === 'nominal' ? { repartoUniones: 'PIEZAS' as const } : {}) }, motivos: [...new Set(motivos)] }
}
