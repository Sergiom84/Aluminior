import type { ConfiguracionCerramientoV3, ModuloCerramiento, UnionCerramiento } from '@aluminior/core/estructuras'
import { clave, numero, si, texto, type Caso } from './datos.ts'
/** UOrdenElem1/2 se resuelven por Orden, nunca por nLinea ni posición de array. */
export function configuracionGrupo(c: Caso): { configuracion: ConfiguracionCerramientoV3 | null; motivos: string[] } {
  const motivos: string[] = [], modulos: ModuloCerramiento[] = [], uniones: UnionCerramiento[] = []
  const gs = c.geometria ?? [], elementos = c.elementos ?? []
  const porLin = new Map(elementos.map(e => [texto(e.padre.nLinea), e]))
  const mods = gs.filter(g => !si(g.EsUnionSN)).sort((a, b) => numero(a.Orden)! - numero(b.Orden)!)
  const porOrden = new Map(mods.map(g => [texto(g.Orden), g]))
  if (porOrden.size !== mods.length) return { configuracion: null, motivos: ['orden-geometrico-ambiguo'] }
  for (let i = 0; i < mods.length; i++) {
    const g = mods[i]!, e = porLin.get(texto(g.nLinEstr))
    if (!e) { motivos.push('elemento-no-enlazado'); continue }
    // El dibujo guarda hueco/envolvente; la línea guarda la medida económica fabricada.
    // No sustituimos la medida de valoración por la de representación del cerramiento.
    const m: ModuloCerramiento = { id: `modulo-${texto(g.Orden)}`, estructuraCodigo: e.modelo,
      anchoMm: e.dimensiones.ancho!, altoMm: e.dimensiones.alto!,
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
    if (numero(u.ULongitud) !== e?.dimensiones.alto) motivos.push('longitud-de-union-no-demostrada')
    uniones.push({ id: `union-${texto(u.Orden)}`, codigo: texto(u.CodEstr), grosorMm: numero(u.UGrosor)!, longitudMm: e?.dimensiones.alto! })
  }
  if (uniones.length !== modulos.length - 1) motivos.push('composicion-no-representable')
  return { configuracion: motivos.length ? null : { version: 3, modulos, uniones }, motivos: [...new Set(motivos)] }
}
