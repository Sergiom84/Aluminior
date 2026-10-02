/**
 * Tipo de hoja de la plantilla (`DisTipoHoja`, id de `SeriesAsocV2TiposHoja`)
 * -> claves de `Conjuntos.herr*`/`mo*` y de `ConjuntosDescuentos.TipoHoja`.
 *
 * La correspondencia sale de los nombres de ambas tablas (t2HC -> herr2HC).
 * `contrastado` marca los tipos cuyo despiece facturado se ha reproducido; el
 * resto es la misma lectura por nombre, pendiente de un caso que la confirme.
 * Las variantes de puerta usan su columna de herraje propia y el descuento
 * del tipo base: `ConjuntosDescuentos` no tiene claves de puerta.
 */

export interface ClavesTipoHoja {
  /** Sufijo de la columna de herraje (`herr2HCP`). */
  herraje: string
  /** Sufijo de la columna de mano de obra (`mo2HCP`). */
  manoObra: string
  /** Clave de `ConjuntosDescuentos.TipoHoja`; `G` cuando no hay específica. */
  descuento: string
  contrastado: boolean
}

const t = (herraje: string, manoObra: string, descuento: string, contrastado = false): ClavesTipoHoja =>
  ({ herraje, manoObra, descuento, contrastado })

const POR_TIPO: Record<string, ClavesTipoHoja> = {
  t1HAI: t('1HA', '1HA', '1HA', true), t1HAD: t('1HA', '1HA', '1HA', true),
  t1HPCI: t('1HPC', '1HPC', '1HPC'), t1HPCD: t('1HPC', '1HPC', '1HPC'),
  t1HOI: t('1HO', '1HO', '1HO', true), t1HOD: t('1HO', '1HO', '1HO', true),
  t1HOIP: t('1HO', '1HO', '1HO'), t1HODP: t('1HO', '1HO', '1HO'),
  t1HAPI: t('1HAP', '1HAP', '1HA', true), t1HAPD: t('1HAP', '1HAP', '1HA', true),
  t2HA: t('2HA', '2HA', '2HA', true), t2HAP: t('2HAP', '2HAP', '2HA'), t2HAPC: t('2HAPC', '2HAPC', '2HA'),
  t2HADO: t('2HA1O', '2HA1O', '2HA1O', true), t2HAIO: t('2HA1O', '2HA1O', '2HA1O', true),
  t2HADOP: t('2HA1OP', '2HA1OP', '2HA1O'), t2HAIOP: t('2HA1OP', '2HA1OP', '2HA1O'),
  t3HAD: t('3HA', '3HA', '3HA'), t3HAI: t('3HA', '3HA', '3HA'),
  t3HADP: t('3HAP', '3HAP', '3HA'), t3HAIP: t('3HAP', '3HAP', '3HA'),
  t4HA: t('4HA', '4HA', '4HA'), t4HAP: t('4HAP', '4HAP', '4HA'),
  t5HA: t('5HA', '5HA', '5HA'), t5HAP: t('5HAP', '5HAP', '5HA'),
  t6HA: t('6HA', '6HA', '6HA'), t6HAP: t('6HAP', '6HAP', '6HA'),
  t2HC: t('2HC', '2HC', '2HC', true), t2HCP: t('2HCP', '2HCP', '2HC', true),
  t2HC2: t('2HC2', '2HC2', '2HC'),
  t3HC: t('3HC', '3HC', '3HC'), t3HCP: t('3HCP', '3HCP', '3HC'),
  t4HC: t('4HC', '4HC', '4HC', true), t4HCP: t('4HCP', '4HCP', '4HC'),
  t6HC: t('6HC', '6HC', '6HC'), t6HCP: t('6HCP', '6HCP', '6HC'),
  t2HG: t('2HG', '2HG', '2HG'),
  t1HCMI: t('1HCM', '1HCM', '1HCM'), t1HCMD: t('1HCM', '1HCM', '1HCM'), t2HCM: t('2HCM', '2HCM', '2HCM'),
  t1HVA: t('1HV', '1HV', 'G'), t1HVB: t('1HV', '1HV', 'G'),
  t1HVAP: t('1HV', '1HV', 'G'), t1HVBP: t('1HV', '1HV', 'G'),
  t1HPIV: t('1HPI', '1HPI', 'G'), t1HPIH: t('1HPI', '1HPI', 'G'),
  tOPI: t('1HOP', '1HOP', 'G'), tOPD: t('1HOP', '1HOP', 'G'),
  tOPIP: t('1HOP', '1HOPP', 'G'), tOPDP: t('1HOP', '1HOPP', 'G'),
  tOP2H: t('2HOP', '2HOP', 'G'), tOP2HP: t('2HOP', '2HOPP', 'G'),
  tCV1HD: t('CV', '1HCV', '2HCV'), tCV1HI: t('CV', '1HCV', '2HCV'), tCV2H: t('CV', '2HCV', '2HCV'),
  tMCHFija: t('MCHF', 'MCHF', 'G'), tMCHProy: t('MCHP', 'MCHP', 'G'),
}
for (let n = 3; n <= 15; n++) POR_TIPO[`t${n}HPl`] = t(`${n}HPl`, `${n}HPl`, `${n}HPl`)

/** Claves para el nombre de tipo (`SeriesAsocV2TiposHoja.tipo`); null si no hay lectura. */
export function clavesTipoHoja(tipo: string | null | undefined): ClavesTipoHoja | null {
  return tipo ? POR_TIPO[tipo] ?? null : null
}

/** Tipo de hoja de marco o general en la plantilla. */
export const esTipoHojaMarco = (tipoHoja: string | null | undefined) =>
  !tipoHoja || tipoHoja === '-1' || tipoHoja === '0'
