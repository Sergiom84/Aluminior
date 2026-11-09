import { afterAll, describe, expect, it } from 'vitest'
import { schema } from '@aluminior/db'
import { eq, sql } from 'drizzle-orm'
import { valorarEstructura } from '../valorar-estructura.ts'
import { altaLinea } from '../../lineas/alta-linea.ts'
import { and } from 'drizzle-orm'
import { despiezarLineaCatalogo } from '@aluminior/core/despiece'
import { leerCatalogoLinea } from './leer-catalogo.ts'
import { valorarCerramiento } from '../../cerramientos/valorar-cerramiento.ts'
import { caso, db, entrada, fila, type Tx } from './catalogo-qa-corr.fixture.ts'

afterAll(() => db.$client.end({ timeout: 5 }))

async function alternativaAcristalamiento(tx: Tx) {
  await tx.insert(schema.articulos).values({ codigo: 'QA-J2', descripcion: 'Junquillo alternativo', tipoMetraje: 'ML' })
  await tx.insert(schema.articulosDespiece).values({ articuloCodigo: 'QA-J2', precioEnTabla: false,
    generico: false, dobleAcristalamiento: false, grosorAcristalar: '0', incrementosPrecio: false })
  await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'QA-J2', acabadoCodigo: 'L', tarifa: 1, precio: '2' })
  await tx.insert(schema.tacrisFilas).values({ tabla: 'QA-T2', posicion: '*', grosor: '99', junquillo: 'QA-J2' })
  await tx.insert(schema.conjuntoAcristalamientos).values([
    { conjuntoCodigo: 'QA-SERIE', opcion: 1, tablaHojas: 'QA-T', tablaFijos: 'QA-T' },
    { conjuntoCodigo: 'QA-SERIE', opcion: 2, tablaHojas: 'QA-T2', tablaFijos: 'QA-T2' },
  ])
  await tx.insert(schema.conjuntoDescuentosCorte).values([['HVL', 'JH'], ['HH', 'JV']].map(([grupoPrincipal, grupo]) => ({
    conjuntoCodigo: 'QA-SERIE', familia: '001', grupoPrincipal: grupoPrincipal!, grupo: grupo!, tipoHoja: 'G', descuentoMm: '0',
  })))
}

describe('valoración con el catálogo de despiece completo', () => {
  it('una opción alternativa no recibe el precio ni el despiece de la opción predeterminada', () => caso(async tx => {
    await tx.insert(schema.conjuntoAcristalamientos).values([
      { conjuntoCodigo: 'QA-SERIE', opcion: 1, tablaHojas: 'QA-T', tablaFijos: 'QA-T' },
      { conjuntoCodigo: 'QA-SERIE', opcion: 2, tablaHojas: 'QA-T-ALTERNATIVA', tablaFijos: 'QA-T-ALTERNATIVA' },
    ])
    await tx.insert(schema.tacrisFilas).values({ tabla: 'QA-T-ALTERNATIVA', grosor: '99',
      junquillo: 'QA-JUNQUILLO-SIN-CATALOGO' })
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, precioUnitario: 139.56 })
    expect(await valorarEstructura(tx, { ...entrada, opcionAcristalamiento: 2 }))
      .toMatchObject({ ok: true, precioUnitario: null, piezas: [], materialCompleto: false,
        aviso: expect.stringContaining('opción de acristalamiento 2') })
    const [p] = await tx.insert(schema.presupuestos).values({ numero: 989529, serie: 'QA-E6',
      fecha: '2026-10-09', nombreLibre: 'QA acristalamiento alternativo', tarifa: 1 }).returning()
    expect((await altaLinea(tx as unknown as Parameters<typeof altaLinea>[0], {
      presupuestoId: p!.id, tipo: 'ESTRUCTURA', codigo: 'QA-CORR', serieCodigo: 'QA-SERIE', referencia: null,
      vidrioCodigo: 'QA-VIDRIO', opcionAcristalamiento: 2, varianteAcristalamiento: '2', cantidad: 1,
      anchoMm: 1200, altoMm: 1300, acabadoCodigo: 'L', configuracionCerramiento: null,
      horasFabricacion: '0', horasColocacion: '0',
    }, ['QA-HERR|1'])).ok).toBe(true)
    const [l] = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, p!.id))
    expect(l).toMatchObject({ precioUnitario: null, total: null, valoracionCompleta: false })
    expect(await tx.select().from(schema.lineasEstructura).where(eq(schema.lineasEstructura.lineaId, l!.id)))
      .toMatchObject([{ opcionAcristalamiento: 2 }])
    expect(await tx.select().from(schema.lineasAcristalamiento).where(eq(schema.lineasAcristalamiento.lineaId, l!.id)))
      .toMatchObject([{ vidrioHojas: 'QA-VIDRIO' }, { vidrioHojas: 'QA-VIDRIO' }])
    expect(await tx.select().from(schema.lineasDespiece).where(eq(schema.lineasDespiece.lineaId, l!.id))).toEqual([])
  }))

  it('sin selección guardada usa las opciones del catálogo en la estructura directa', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, opcionesHerraje: undefined })
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56,
      opcionesHerraje: [{ categoria: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre' }] })
    if (!r.ok) throw new Error('rechazada')
    expect(r.piezas.filter(p => p.articuloCodigo === 'QA-CIERRE')).toHaveLength(2)
  }))
  it('el GRUPO conserva ausencia y selección vacía con el mismo catálogo y precio que la estructura', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    const configuracion = { version: 1 as const, modulos: [{ id: 'sintetico', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] }
    for (const opcionesHerraje of [undefined, [], ['QA-HERR|1']]) {
      const directo = await valorarEstructura(tx, { ...entrada, codigo: 'C2', opcionesHerraje })
      const grupo = await valorarCerramiento(tx, { ...entrada, configuracion, opcionesHerraje })
      if (!directo.ok) throw new Error('rechazada')
      expect(grupo.ventaMateriales).toEqual({ completo: true, importe: opcionesHerraje?.length === 0 ? '131.56' : '139.56' })
      expect(Number(grupo.ventaMateriales.importe)).toBe(directo.precioUnitario)
      expect(grupo.origenes[0]!.piezas.map(p => p.articuloCodigo)).toEqual(directo.piezas.map(p => p.articuloCodigo))
      expect(grupo.origenes[0]!.opcionesHerraje).toEqual(directo.opcionesHerraje)
    }
  }))
  it('el GRUPO conserva los avisos de grosor y junta sin bloquear la venta calculable', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'C2', descripcion: 'Corredera de prueba' })
    await tx.update(schema.estructuraPlantillaCatalogo).set({ estructuraCodigo: 'C2' })
      .where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    await tx.update(schema.articulosDespiece).set({ grosorAcristalar: '20' })
      .where(eq(schema.articulosDespiece.articuloCodigo, 'QA-VIDRIO'))
    await tx.update(schema.tacrisFilas).set({ juntaExterior: 'QA-JUNTA-AUSENTE' })
      .where(eq(schema.tacrisFilas.tabla, 'QA-T'))
    const directo = await valorarEstructura(tx, { ...entrada, codigo: 'C2' })
    if (!directo.ok) throw new Error('rechazada')
    expect(directo.aviso).toContain('vidrio de 20 mm por encima del rango')
    expect(directo.aviso).toContain('junta QA-JUNTA-AUSENTE')
    const grupo = await valorarCerramiento(tx, { ...entrada, configuracion: { version: 1,
      modulos: [{ id: 'sintetico', estructuraCodigo: 'C2', anchoMm: 1200, altoMm: 1300 }], uniones: [] } })
    expect(grupo.ventaMateriales).toEqual({ completo: true, importe: '139.56' })
    expect(grupo.origenes[0]!.diagnosticos.filter(d => d.ambito === 'VENTA')).toEqual([
      { codigo: 'AVISO_VALORACION', ambito: 'VENTA', bloqueante: false, detalle: directo.aviso },
    ])
  }))
  it('aplica FI explícito a perfiles y vidrio; la ausencia no toma un valor estándar', () => caso(async tx => {
    await tx.update(schema.estructuraPlantillaCatalogo).set({ formulaReferenciaLargo: 'REF-FI' }).where(and(
      eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'),
      eq(schema.estructuraPlantillaCatalogo.componente, '21'),
    ))
    const sinCota = await valorarEstructura(tx, entrada)
    expect(sinCota).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: null, materialCompleto: false })
    for (const [FI, largoHoja, largoVidrio] of [[100, 1150, 1070], [200, 1050, 970]]) {
      const r = await valorarEstructura(tx, { ...entrada, cotas: { FI: FI! } })
      expect(r).toMatchObject({ ok: true, motor: 'catalogo', materialCompleto: true, aviso: null })
      if (!r.ok) throw new Error('rechazada')
      expect(r.precioUnitario).not.toBeNull()
      expect(r.piezas.filter(p => p.articuloCodigo === 'QA-HOJA').map(p => Number(p.largoCorteMm))).toEqual([largoHoja, largoHoja])
      expect(r.piezas.filter(p => p.articuloCodigo === 'QA-VIDRIO').map(p => Number(p.largoCorteMm))).toEqual([largoVidrio, largoVidrio])
    }
  }))
  it('si falta catálogo completo no descarta las cotas para usar la vía anterior', () => caso(async tx => {
    await tx.delete(schema.estructuraPlantillaCatalogo).where(eq(schema.estructuraPlantillaCatalogo.estructuraCodigo, 'QA-CORR'))
    expect(await valorarEstructura(tx, { ...entrada, cotas: { FI: 100 } }))
      .toMatchObject({ ok: false, errores: { cotas: ['Las cotas de instancia requieren el catálogo completo'] } })
  }))
  it('el adaptador y core reproducen la tabla alternativa sin activar E6 en web', () => caso(async tx => {
    await alternativaAcristalamiento(tx)
    const base = await valorarEstructura(tx, entrada)
    const catalogo = await leerCatalogoLinea(tx, { estructura: entrada.codigo, serie: entrada.serieCodigo!, vidrio: entrada.vidrioCodigo, tarifa: 1, opcionAcristalamiento: 2 })
    if (!catalogo) throw new Error('Catálogo sintético ausente')
    const alternativa = despiezarLineaCatalogo(catalogo, { estructura: entrada.codigo, serie: entrada.serieCodigo!, anchoMm: 1200, altoMm: 1300, vidrio: entrada.vidrioCodigo, acabado: 'L', acabadoAccesorios: 'UNI', opcionesGuardadas: [] })
    expect(base).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56 })
    expect(alternativa).toMatchObject({ importe: 154.2, incidencias: [] })
    expect(alternativa.filas.filter(p => p.articulo === 'QA-J2')).toHaveLength(4)
    expect(await valorarEstructura(tx, { ...entrada, opcionAcristalamiento: 2 }))
      .toMatchObject({ ok: true, precioUnitario: null, piezas: [], materialCompleto: false })
  }))
  it('una tabla alternativa sin filas bloquea core y web sin usar la opción principal', () => caso(async tx => {
    await alternativaAcristalamiento(tx)
    await tx.delete(schema.tacrisFilas).where(eq(schema.tacrisFilas.tabla, 'QA-T2'))
    const r = await valorarEstructura(tx, { ...entrada, opcionAcristalamiento: 2 })
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: null, materialCompleto: false })
    if (!r.ok) throw new Error('rechazada')
    expect(r.aviso).toContain('opción de acristalamiento 2')
    const catalogo = await leerCatalogoLinea(tx, { estructura: entrada.codigo, serie: entrada.serieCodigo!, vidrio: entrada.vidrioCodigo, tarifa: 1, opcionAcristalamiento: 2 })
    if (!catalogo) throw new Error('Catálogo sintético ausente')
    const calculo = despiezarLineaCatalogo(catalogo, { estructura: entrada.codigo, serie: entrada.serieCodigo!, anchoMm: 1200, altoMm: 1300, vidrio: entrada.vidrioCodigo, acabado: 'L', acabadoAccesorios: 'UNI', opcionesGuardadas: [] })
    expect(calculo.importe).toBeNull()
    expect(calculo.incidencias.join('; ')).toContain('sin filas persistidas')
  }))
  it('valora perfiles, asociados, vidrio y mano de obra desde PostgreSQL', () => caso(async tx => {
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 139.56, aviso: null, materialCompleto: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.piezas.map(p => p.articuloCodigo)).toEqual(['QA-MARCO', 'QA-MARCO', 'QA-ROD', 'QA-HOJA', 'QA-ROD', 'QA-HOJA',
      'QA-FELPUDO', 'QA-FELPUDO', 'QA-CIERRE', 'QA-CIERRE', 'QA-VIDRIO', 'QA-VIDRIO', 'MO'])
    expect(r.opcionesHerraje).toEqual([{ categoria: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre' }])
    // Se conserva la identidad de los dos paños del catálogo publicado en Mac.
    expect(r.piezas.filter(p => p.articuloCodigo === 'QA-VIDRIO')).toHaveLength(2)
    expect(r.acristalamiento).toEqual([1, 2].map(slot => ({ slot, variante: '2', vidrioHojas: 'QA-VIDRIO', vidrioFijos: null })))
  }))
  it('las cotas de la instancia llegan a las fórmulas de la plantilla', () => caso(async tx => {
    // Travesaño sintético con descuento cero entre montantes: el largo depende solo de A y FI.
    await tx.insert(schema.estructuraPlantillaCatalogo).values(fila(40, { articulo: 'QA-G', componente: '12', funcion: 'TM',
      formulaLargo: 'A-FI', grupo: 'TM', grupoIzquierdo: 'MV', grupoDerecho: 'MV', posicionTrabajo: 'A' }))
    await tx.insert(schema.conjuntoDescuentosCorte).values({ conjuntoCodigo: 'QA-SERIE', familia: '001',
      grupoPrincipal: 'MV', grupo: 'TM', tipoHoja: 'G', descuentoMm: '0' })
    const sin = await valorarEstructura(tx, entrada)
    expect(sin).toMatchObject({ ok: true, precioUnitario: null })
    const con = await valorarEstructura(tx, { ...entrada, cotas: { FI: 200 }, trazabilidad: true })
    if (!con.ok) throw new Error('rechazada')
    expect(con.piezas.filter(p => p.funcion === 'TM').map(p => Number(p.largoCorteMm))).toEqual([1000])
    expect(con.precioUnitario).not.toBeNull()
  }))
  it('cobra MO por grupo solo si su categoría es la del tipo de perfil de la estructura', () => caso(async tx => {
    await tx.insert(schema.manoObraConceptos).values({ codigo: 'QA-TRAV', minutos: '10', articulo: 'MO', grupoAsociado: 'MH',
      componenteAsociado: '!', conIncrementos: false, categoria: '00001' })
    const sinTipo = await valorarEstructura(tx, entrada)
    expect(sinTipo).toMatchObject({ ok: true, precioUnitario: null })
    await tx.insert(schema.estructuraParametrosDespiece).values({ estructuraCodigo: 'QA-CORR', tipoPerfil: 'A' })
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, precioUnitario: 144.56 })
    await tx.update(schema.estructuraParametrosDespiece).set({ tipoPerfil: 'C' })
    expect(await valorarEstructura(tx, entrada)).toMatchObject({ ok: true, precioUnitario: 139.56 })
  }))
  it('la comisión sumada cambia solo el precio de la línea, no el despiece', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, comisionPorc: '10', trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.precioUnitario).toBe(153.52)
    expect(r.partidas!.reduce((s, p) => s + Number(p.importeExacto), 0)).toBeCloseTo(139.56, 2)
  }))
  it('cobra las horas manuales por unidad como filas MO y MOCOL del despiece', () => caso(async tx => {
    await tx.insert(schema.articulos).values({ codigo: 'MOCOL', descripcion: 'MOCOL', tipoMetraje: 'UD' }).onConflictDoNothing()
    await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'MOCOL', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5' })
      .onConflictDoUpdate({ target: [schema.articulosPvp.articuloCodigo, schema.articulosPvp.acabadoCodigo, schema.articulosPvp.tarifa],
        set: { precio: sql`excluded.precio` } })
    const r = await valorarEstructura(tx, { ...entrada, horasFabricacion: '1', horasColocacion: '6.07', trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    // 139,56 de material + 60 min y 364,2 min a 0,5 por minuto, dentro del precio unitario.
    expect(r.precioUnitario).toBe(351.66)
    expect(r.partidas!.slice(-2).map(p => [p.articuloCodigo, p.cantidadFacturable])).toEqual([['MO', '60.000000'], ['MOCOL', '364.200000']])
  }))
  it('el alta de la línea cobra las horas tecleadas por unidad y guarda MO y MOCOL en el despiece', () => caso(async tx => {
    await tx.insert(schema.articulos).values({ codigo: 'MOCOL', descripcion: 'MOCOL', tipoMetraje: 'UD' }).onConflictDoNothing()
    await tx.insert(schema.articulosPvp).values({ articuloCodigo: 'MOCOL', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5' })
      .onConflictDoUpdate({ target: [schema.articulosPvp.articuloCodigo, schema.articulosPvp.acabadoCodigo, schema.articulosPvp.tarifa],
        set: { precio: sql`excluded.precio` } })
    const [presupuesto] = await tx.insert(schema.presupuestos).values({ numero: 999998, revision: 0, serie: 'A',
      fecha: '2026-10-03', nombreLibre: 'QA ALTA HORAS', obraTexto: 'QA', tarifa: 1, estado: 'PENDIENTE' })
      .returning({ id: schema.presupuestos.id })
    const alta = await altaLinea(tx as unknown as Parameters<typeof altaLinea>[0], {
      presupuestoId: presupuesto!.id, tipo: 'ESTRUCTURA', codigo: 'QA-CORR', serieCodigo: 'QA-SERIE', referencia: null,
      vidrioCodigo: 'QA-VIDRIO', opcionAcristalamiento: 1, varianteAcristalamiento: '2', cantidad: 2, anchoMm: 1200,
      altoMm: 1300, acabadoCodigo: 'L', configuracionCerramiento: null, horasFabricacion: '1', horasColocacion: '6.07',
    }, ['QA-HERR|1'])
    expect(alta.ok).toBe(true)
    const [linea] = await tx.select().from(schema.lineas).where(eq(schema.lineas.presupuestoId, presupuesto!.id))
    // Precio unitario con MO y MOCOL dentro; ImporteTotal = Cdad × Precio, como Productor.
    expect(linea).toMatchObject({ precioUnitario: '351.6600', total: '703.32', valoracionCompleta: true })
    const despiece = await tx.select().from(schema.lineasDespiece).where(eq(schema.lineasDespiece.lineaId, linea!.id))
    expect(despiece.filter(p => p.funcion === 'MO' || p.funcion === 'MOCOL').map(p => [p.articuloCodigo, Number(p.cantidad)]))
      // 20 min del concepto de fabricación del catálogo; 60 y 364,2, las horas tecleadas.
      .toEqual([['MO', 20], ['MO', 60], ['MOCOL', 364.2]])
  }))
  it('añade el compacto con sus filas seleccionadas a ventana + cajón y bloquea sin catálogo', () => caso(async tx => {
    await tx.insert(schema.estructuras).values({ codigo: 'QA-COMP', descripcion: 'Compacto sintético', esAccesorio: true })
    await tx.insert(schema.articulos).values([
      { codigo: 'QA-LAMA', descripcion: 'QA-LAMA', tipoMetraje: 'M2', metrajeMultiploLargo: '5', metrajeMultiploAncho: '5', metrajeMinimo: '1.5' },
      { codigo: 'QA-MOCOMP', descripcion: 'QA-MOCOMP', tipoMetraje: 'UD' }])
    await tx.insert(schema.articulosPvp).values([{ articuloCodigo: 'QA-LAMA', acabadoCodigo: 'L', tarifa: 1, precio: '80' },
      { articuloCodigo: 'QA-MOCOMP', acabadoCodigo: 'UNI', tarifa: 1, precio: '0.5' }])
    const compactoFila = (lineaOrigen: number, f: Partial<typeof schema.estructuraPlantillaCatalogo.$inferInsert>) =>
      fila(lineaOrigen, { estructuraCodigo: 'QA-COMP', idPieza: 0, ...f })
    await tx.insert(schema.estructuraPlantillaCatalogo).values([
      compactoFila(1, { articulo: 'QA-LAMA', funcion: 'COMPVAL', formulaAncho: 'A+CVI+CVD', formulaSeleccion: 'G1O0' }),
      compactoFila(2, { articulo: 'QA-LAMA', funcion: 'COMPVAL', formulaAncho: 'CGC+CVD', formulaSeleccion: 'G1O1' }),
      compactoFila(3, { articulo: 'QA-MOCOMP', funcion: 'MO', cantidad: '15', formulaLargo: null }),
    ])
    const compacto = { estructura: 'QA-COMP', acabado: 'L', altoCajonMm: 155, vueloIzquierdoMm: 0, vueloDerechoMm: 0,
      posicionGuiaCentralMm: 0, descuentoVerticalMm: 0, opciones: ['G1O0', 'G10O0'] }
    const r = await valorarEstructura(tx, { ...entrada, compacto, trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    // 1200 × 1455 -> 1,20 × 1,50 m2 a 80 + 15 min a 0,5, sobre los 139,56 de la ventana.
    expect(r.precioUnitario).toBe(291.06)
    expect(r.partidas!.slice(-2).map(p => [p.articuloCodigo, p.cantidadFacturable, p.acabadoCodigo]))
      .toEqual([['QA-LAMA', '1.800000', 'L'], ['QA-MOCOMP', '15.000000', 'L']])
    const sinCatalogo = await valorarEstructura(tx, { ...entrada, serieCodigo: 'QA-SIN-SERIE', compacto })
    expect(sinCatalogo.ok).toBe(false)
  }))
  it('usa Acabado2 para accesorios y MO; perfiles y vidrio siguen el acabado principal', () => caso(async tx => {
    await tx.insert(schema.articulosPvp).values(['QA-FELPUDO', 'QA-CIERRE', 'QA-VIDRIO', 'MO'].map(articuloCodigo => ({
      articuloCodigo, acabadoCodigo: 'ACC', tarifa: 1, precio: '2',
    })))
    const r = await valorarEstructura(tx, { ...entrada, acabadoAccesoriosCodigo: 'ACC', trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    // Vidrio sin precio en L: genérico UNI (50), no el de accesorios.
    expect(r.precioUnitario).toBe(170.56)
    expect(r.piezas.map(p => p.acabadoCodigo)).toEqual([...Array(6).fill('L'), 'ACC', 'ACC', 'ACC', 'ACC', 'L', 'L', 'ACC'])
    expect(r.partidas!.filter(p => p.articuloCodigo === 'QA-VIDRIO').map(p => p.precioUnitario)).toEqual(['50.0000', '50.0000'])
  }))
  it('sin selección guardada toma las opciones por defecto del catálogo', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, opcionesHerraje: [], opcionesPorDefecto: true })
    expect(r).toMatchObject({ ok: true, precioUnitario: 139.56,
      opcionesHerraje: [{ categoria: 'QA-HERR', opcionCodigo: '1', descripcion: 'Cierre' }] })
  }))
  it('una opción visible desmarcada en el formulario no vuelve por defecto', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, opcionesHerraje: [] })
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: 131.56, opcionesHerraje: [] })
  }))
  it('sin precio de un asociado no da total y lo explica', () => caso(async tx => {
    await tx.delete(schema.articulosPvp).where(eq(schema.articulosPvp.articuloCodigo, 'QA-FELPUDO'))
    const r = await valorarEstructura(tx, entrada)
    expect(r).toMatchObject({ ok: true, motor: 'catalogo', precioUnitario: null, materialCompleto: false })
    if (!r.ok) throw new Error('rechazada')
    expect(r.aviso).toContain('QA-FELPUDO: sin PVP en la tarifa')
  }))
  it('las partidas de trazabilidad son filas valoradas', () => caso(async tx => {
    const r = await valorarEstructura(tx, { ...entrada, trazabilidad: true })
    if (!r.ok) throw new Error('rechazada')
    expect(r.partidas).toHaveLength(13)
    expect(r.partidas![0]).toMatchObject({ grupoValoracion: 'MATERIALES', articuloCodigo: 'QA-MARCO', cantidadFacturable: '1.300000', precioUnitario: '10.0000' })
  }))
})
