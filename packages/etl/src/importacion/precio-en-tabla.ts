import { txt, type Fila } from '../csv.ts'

/** Un origen ausente o ilegible no acredita una tarifa plana. */
export function booleanoConocido(valor: string | undefined): boolean | null {
  const t = txt(valor)?.toLowerCase()
  if (t === 'true' || t === '-1' || t === '1') return true
  if (t === 'false' || t === '0') return false
  return null
}

export function configuracionPrecioTabla(f: Fila) {
  return {
    precio_en_tabla: booleanoConocido(f.PrecioTablaSN),
    politicas_precio_tabla: {
      noMedidasInferiores: booleanoConocido(f.ptNoMedInfSN),
      noMedidasSuperiores: booleanoConocido(f.ptNoMedSupSN),
      soloMedidasAncho: booleanoConocido(f.ptSoloMedTablaAnchoSN),
      soloMedidasLargo: booleanoConocido(f.ptSoloMedTablaLargoSN),
      noPrecioCero: booleanoConocido(f.ptNoPVPCeroSN),
    },
  }
}
