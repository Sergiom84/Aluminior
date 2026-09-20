import { schema } from '@aluminior/db'
import { eq } from 'drizzle-orm'
import type { ClienteEscritura } from '../cliente-db.ts'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'

/** Catálogo declarado de pruebas: no representa mediciones ni tarifas reales. */
export const J04 = { serie: 'QA-J04-S', acabado: 'QA-J04-L', vidrio: 'QA-J04-V', tarifa: 9 }
export const configuracionJ04 = (): ConfiguracionCerramiento => ({ version: 1,
  modulos: [{ id: 'm1', estructuraCodigo: '0', anchoMm: 1200, altoMm: 800 },
    { id: 'm2', estructuraCodigo: '0', anchoMm: 700, altoMm: 800 }],
  uniones: [{ id: 'u1', codigo: 'GMU038', longitudMm: 800, grosorMm: 60 }],
})

/** Se invoca dentro de transacción reversible; nunca sobrescribe identidades existentes. */
export async function sembrarCatalogoJ04(db: ClienteEscritura) {
  if ((await db.select().from(schema.tarifas).where(eq(schema.tarifas.id, J04.tarifa))).length)
    throw new Error('Fixture J04: tarifa 9 existente protegida')
  await db.insert(schema.tarifas).values({ id: J04.tarifa, descripcion: 'Tarifa SINTÉTICA J04', activa: true })
  for (const codigo of ['0', 'GMU038']) {
    if ((await db.select().from(schema.estructuras).where(eq(schema.estructuras.codigo, codigo))).length)
      throw new Error(`Fixture J04: identidad protegida existente ${codigo}`)
  }
  if (!(await db.select().from(schema.familias).where(eq(schema.familias.codigo, '050'))).length)
    await db.insert(schema.familias).values({ codigo: '050', descripcion: 'Vidrio sintético de prueba' })
  await db.insert(schema.acabados).values({ codigo: J04.acabado, descripcion: 'Acabado sintético J04' })
  await db.insert(schema.series).values({ codigo: J04.serie })
  await db.insert(schema.estructuras).values([
    { codigo: '0', descripcion: 'Fijo sintético J04', familia: '003' },
    { codigo: 'GMU038', descripcion: 'Receta SINTÉTICA de unión J04', familia: '103', esAccesorio: true },
  ])
  const materiales = [
    ['P', 'ML', '10', '4'], ['J', 'ML', '2', '0.8'], ['E', 'ML', '1', '0.4'],
    ['I', 'ML', '0.5', '0.2'], ['V', 'M2', '25', '8'], ['U', 'ML', '12', '5'], ['T', 'UD', '0.2', '0.1'],
  ] as const
  for (const [sufijo, tipoMetraje, precio, coste] of materiales) {
    const codigo = `QA-J04-${sufijo}`
    await db.insert(schema.articulos).values({ codigo, descripcion: `Material sintético J04 ${sufijo}`, tipoMetraje,
      apareceEnHojaCorte: ['P', 'J', 'U'].includes(sufijo), apareceEnHojaDespiece: true,
      familiaCodigo: sufijo === 'V' ? '050' : null, tamJunquilloGoma: sufijo === 'V' ? '4' : null,
      metrajeMultiploLargo: sufijo === 'V' ? '1' : null, metrajeMultiploAncho: sufijo === 'V' ? '1' : null })
    await db.insert(schema.articulosPvp).values({ articuloCodigo: codigo, acabadoCodigo: J04.acabado, tarifa: J04.tarifa, precio })
    await db.insert(schema.articulosCoste).values({ articuloCodigo: codigo, acabadoCodigo: J04.acabado, proveedorCodigo: 'QA-J04-PROV', coste })
  }
  await db.insert(schema.estructuraComponentes).values([
    { estructuraCodigo: '0', articuloCodigo: 'QA-J04-P', cantidad: '2', formulaLargo: 'L', funcion: 'MV', anguloIzquierdo: '45', anguloDerecho: '45' },
    { estructuraCodigo: '0', articuloCodigo: 'QA-J04-P', cantidad: '2', formulaLargo: 'A', funcion: 'MH', anguloIzquierdo: '45', anguloDerecho: '45' },
    { estructuraCodigo: '0', articuloCodigo: 'QA-J04-SLOT', cantidad: '1', formulaLargo: 'L', formulaAncho: 'A', componenteDisenyo: '1', tipoHojaDisenyo: -1, idItemDisenyo: 1 },
    { estructuraCodigo: 'GMU038', articuloCodigo: 'QA-J04-U', cantidad: '1', formulaLargo: 'L', funcion: 'UNION' },
    { estructuraCodigo: 'GMU038', articuloCodigo: 'QA-J04-T', cantidad: '4', funcion: 'TORNILLO' },
  ])
  await db.insert(schema.vidrioGalceFijo).values({ serieCodigo: J04.serie, perfilCodigo: 'QA-J04-P', deltaMm: '20', muestras: 3 })
  await db.insert(schema.conjuntos).values({ codigo: J04.serie, serieCodigo: J04.serie, tablaFijos: 'QA-J04-TAC' })
  await db.insert(schema.tacrisFilas).values({ tabla: 'QA-J04-TAC', posicion: '*', grosor: '4', junquillo: 'QA-J04-J', juntaExterior: 'QA-J04-E', juntaInterior: 'QA-J04-I' })
  await db.insert(schema.junquilloAjustesFijo).values({ serieCodigo: J04.serie, ajusteLargoMm: '0', ajusteAnchoMm: '0', muestras: 3 })
  await ampliarCatalogoReferenciaJ04(db)
}

/** Equivalentes sintéticos para la receta de aceptación; nunca son precios comerciales. */
export async function ampliarCatalogoReferenciaJ04(db: ClienteEscritura) {
  const nuevas = [
    { codigo: '2O', descripcion: 'Dos hojas sintético J04', familia: '003', esAccesorio: false },
    { codigo: 'PSU001', descripcion: 'Unión 100 mm sintética J04', familia: '103', esAccesorio: true },
  ] as const
  for (const estructura of nuevas) {
    const existe = (await db.select({ codigo: schema.estructuras.codigo }).from(schema.estructuras)
      .where(eq(schema.estructuras.codigo, estructura.codigo)).limit(1)).length > 0
    if (!existe) await db.insert(schema.estructuras).values(estructura)
  }
  for (const [estructuraCodigo, componentes] of [
    ['2O', [
      { articuloCodigo: 'QA-J04-P', cantidad: '2', formulaLargo: 'L', funcion: 'MV' },
      { articuloCodigo: 'QA-J04-P', cantidad: '2', formulaLargo: 'A', funcion: 'MH' },
      { articuloCodigo: 'QA-J04-SLOT', cantidad: '1', formulaLargo: 'L', formulaAncho: 'A', componenteDisenyo: '1', tipoHojaDisenyo: -1, idItemDisenyo: 1 },
    ]],
    ['PSU001', [
      { articuloCodigo: 'QA-J04-U', cantidad: '1', formulaLargo: 'L', funcion: 'UNION' },
      { articuloCodigo: 'QA-J04-T', cantidad: '4', funcion: 'TORNILLO' },
    ]],
  ] as const) {
    const existe = (await db.select({ id: schema.estructuraComponentes.id })
      .from(schema.estructuraComponentes)
      .where(eq(schema.estructuraComponentes.estructuraCodigo, estructuraCodigo)).limit(1)).length > 0
    if (!existe) await db.insert(schema.estructuraComponentes).values(
      componentes.map((componente) => ({ estructuraCodigo, ...componente })),
    )
  }
}
