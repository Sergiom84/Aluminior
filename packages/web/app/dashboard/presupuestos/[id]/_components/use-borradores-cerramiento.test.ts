import { afterEach, describe, expect, it } from 'vitest'
import { anadirModuloCerramiento, composicionExplicita, crearConfiguracionCerramiento, generarPlantillaCatalogo, plantillaDiseno,
  registrarCatalogoDiseno, UNIONES_VISUALES, esConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { aplicarBorrador, aplicarElementoATodos, aplicarUnionATodas, type Borradores } from './use-borradores-cerramiento.ts'

const crear = () => anadirModuloCerramiento(
  crearConfiguracionCerramiento(plantillaDiseno('2O')!), plantillaDiseno('2O')!)
const vacios = (): Borradores => ({ modulos: {}, uniones: {} })

describe('aplicación explícita del cerramiento', () => {
  it.each([['C2FI', 300], ['C2FS', 300], ['C2FSFI', 600]] as const)(
    '%s conserva el original al rechazar un alto incompatible con sus fijos', (codigo, altoMm) => {
      const original = crearConfiguracionCerramiento(plantillaDiseno(codigo)!)
      const guardado = JSON.stringify(original)
      const borradores = vacios()
      borradores.modulos['modulo-1'] = { altoMm }
      expect(aplicarBorrador(original, borradores, 'modulos', 'modulo-1')).toBeNull()
      expect(JSON.stringify(original)).toBe(guardado)
      borradores.modulos['modulo-1'] = { altoMm: 1800 }
      const resultado = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
      expect(resultado.modulos[0]).toMatchObject({ estructuraCodigo: codigo, altoMm: 1800 })
      expect(esConfiguracionCerramiento(resultado)).toBe(true)
    })
  it('aplica solo el módulo solicitado sin mutar el original ni otro borrador', () => {
    const original = crear()
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm: 1450 }
    borradores.modulos['modulo-2'] = { anchoMm: 1800 }
    const resultado = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(resultado.modulos.map(m => m.anchoMm)).toEqual([1450, 1200])
    expect(original.modulos.map(m => m.anchoMm)).toEqual([1200, 1200])
    expect(borradores.modulos['modulo-2'].anchoMm).toBe(1800)
  })
  it.each([NaN, Infinity, 0, -10])('rechaza ancho inválido %s sin alterar configuración', anchoMm => {
    const original = crear()
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm }
    expect(aplicarBorrador(original, borradores, 'modulos', 'modulo-1')).toBeNull()
    expect(original.modulos[0].anchoMm).toBe(1200)
  })
  it('conserva una medida económica fraccionaria al aplicar otro campo', () => {
    const original = crear()
    original.modulos[0].anchoMm = 439.5
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { altoMm: 1200 }
    expect(aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!.modulos[0].anchoMm).toBe(439.5)
  })
  it('aplica alto y FI juntos y rechaza un FI fuera del hueco', () => {
    const original = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { altoMm: 900, fiMm: 950 }
    expect(aplicarBorrador(original, borradores, 'modulos', 'modulo-1')).toBeNull()
    borradores.modulos['modulo-1'].fiMm = 250
    const resultado = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(resultado.modulos[0]).toMatchObject({ altoMm: 900, fiMm: 250 })
  })
  it('usa el grosor del catálogo al actualizar sin mutar el snapshot histórico', () => {
    const original = crear()
    original.uniones = [{ ...original.uniones[0], codigo: 'PSU001', grosorMm: 100 }]
    const borradores = vacios()
    borradores.uniones['union-1'] = { longitudMm: 1350 }
    const historico = aplicarBorrador(original, borradores, 'uniones', 'union-1')!
    expect(historico.uniones[0]).toMatchObject({ grosorMm: 2, longitudMm: 1350 })
    expect(esConfiguracionCerramiento(historico)).toBe(true)
    const ps = UNIONES_VISUALES.find(item => item.codigo === 'PSU001')!
    borradores.uniones['union-1'] = { codigo: ps.codigo, grosorMm: ps.grosorMm }
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1')!.uniones[0].grosorMm).toBe(2)
    expect(original.uniones[0].grosorMm).toBe(100)
  })
  it('con el catálogo de la base usa su grosor y admite la unión de usuario', () => {
    const original = crear()
    const catalogo = [
      { codigo: 'GMU038', descripcion: 'Tubo editado', grosorMm: 40, unionTipo: 0 as const },
      { codigo: 'QA-U60', descripcion: 'Tubo de usuario', grosorMm: 60, unionTipo: 0 as const },
    ]
    const borradores = vacios()
    borradores.uniones['union-1'] = { codigo: 'GMU038', grosorMm: 40 }
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1', ['union-1'], catalogo)!.uniones[0].grosorMm).toBe(40)
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1')!.uniones[0].grosorMm).toBe(60)
    borradores.uniones['union-1'] = { codigo: 'QA-U60', grosorMm: 60 }
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1', ['union-1'], catalogo)!.uniones[0].codigo).toBe('QA-U60')
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1')).toBeNull()
  })
  it('rechaza longitud vacía e identidades ausentes', () => {
    const original = crear()
    const borradores = vacios()
    borradores.uniones['union-1'] = { longitudMm: NaN }
    expect(aplicarBorrador(original, borradores, 'uniones', 'union-1')).toBeNull()
    expect(aplicarBorrador(original, vacios(), 'modulos', 'ausente')).toBeNull()
  })
})

describe('aplicación a modelos iguales (mejora autorizada de fase 4)', () => {
  const tres = () => anadirModuloCerramiento(crear(), plantillaDiseno('0')!)

  it('aplica medidas y materiales exactamente a los destinatarios indicados', () => {
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { altoMm: 1400, serieCodigo: 'GMA350' }
    const r = aplicarBorrador(tres(), borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])!
    expect(r.modulos.map(m => m.altoMm)).toEqual([1400, 1400, 1200])
    expect(r.modulos.map(m => m.materiales?.serieCodigo)).toEqual(['GMA350', 'GMA350', undefined])
    expect(esConfiguracionCerramiento(r)).toBe(true)
  })

  it('no aplica nada si la medida no vale para todos', () => {
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm: 0 }
    expect(aplicarBorrador(tres(), borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])).toBeNull()
  })

  it('vacío devuelve el elemento a la herencia del general', () => {
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { vidrioCodigo: 'PAN16' }
    const conExcepcion = aplicarBorrador(tres(), borradores, 'modulos', 'modulo-1')!
    borradores.modulos['modulo-1'] = { vidrioCodigo: null }
    const general = aplicarBorrador(conExcepcion, borradores, 'modulos', 'modulo-1')!
    expect(general.modulos[0]).not.toHaveProperty('materiales')
  })
})

describe('cotas de instancia en el borrador', () => {
  afterEach(() => registrarCatalogoDiseno([]))

  function registrar2Ofi() {
    const generada = generarPlantillaCatalogo({
      codigo: '2OFI', descripcion: 'Sintética 2OFI', familiaCodigo: '001', anchoMm: 1200, altoMm: 2100,
      nodos: [
        { id: 0, tipo: 1, padre: -1, division: 0, posicion: 0, travesano: '', invisible: false,
          hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: 'NOR', variantes: [] },
        { id: 1, tipo: 5, padre: 0, division: 0, posicion: 0, travesano: '', invisible: false,
          hoja: 0, numeroHoja: 0, tipoCota: 0, cota: 0, equidistantes: 0, marco: '', variantes: [] },
      ],
    })
    if (generada.estado !== 'dibujable') throw new Error('2OFI sintética no dibujable')
    registrarCatalogoDiseno([generada.plantilla])
    return generada.plantilla
  }

  it('guarda FI escrito y no escribe nada si el borrador no trae cotas', () => {
    const plantilla = registrar2Ofi()
    const original = { ...crearConfiguracionCerramiento(plantilla), version: 3 as const }
    const guardado = JSON.stringify(original)
    const sinTocar = aplicarBorrador(original, vacios(), 'modulos', 'modulo-1')!
    expect(sinTocar.modulos[0]).not.toHaveProperty('cotas')
    expect(sinTocar.version).toBe(3)
    expect(JSON.stringify(original)).toBe(guardado)

    const borradores = vacios()
    borradores.modulos['modulo-1'] = { cotas: { FI: 450 } }
    const aplicado = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(aplicado.modulos[0].cotas).toEqual({ FI: 450 })
    expect(original.modulos[0].cotas).toBeUndefined()
  })

  it('no aplica una cota inválida y vaciar el campo quita la instancia', () => {
    const plantilla = registrar2Ofi()
    const original = { ...crearConfiguracionCerramiento(plantilla), version: 3 as const,
      modulos: [{ ...crearConfiguracionCerramiento(plantilla).modulos[0], cotas: { FI: 450, FS: 200 } }] }
    const guardado = JSON.stringify(original)
    const invalido = vacios()
    invalido.modulos['modulo-1'] = { cotas: { FI: 0 } }
    expect(aplicarBorrador(original, invalido, 'modulos', 'modulo-1')).toBeNull()
    expect(JSON.stringify(original)).toBe(guardado)

    const vacio = vacios()
    vacio.modulos['modulo-1'] = { cotas: { FI: null } }
    const limpio = aplicarBorrador(original, vacio, 'modulos', 'modulo-1')!
    expect(limpio.modulos[0].cotas).toEqual({ FS: 200 })
    const sinFs = vacios()
    sinFs.modulos['modulo-1'] = { cotas: { FS: null } }
    expect(aplicarBorrador(limpio, sinFs, 'modulos', 'modulo-1')!.modulos[0]).not.toHaveProperty('cotas')
  })

  it('aplica la cota a los modelos iguales o a ninguno', () => {
    const plantilla = registrar2Ofi()
    const dos = anadirModuloCerramiento(crearConfiguracionCerramiento(plantilla), plantilla)
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { cotas: { FI: 320 } }
    const aplicados = aplicarBorrador(dos, borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])!
    expect(aplicados.version).toBe(3)
    expect(aplicados.modulos.map((modulo) => modulo.cotas)).toEqual([{ FI: 320 }, { FI: 320 }])
    borradores.modulos['modulo-1'] = { cotas: { FI: 0 } }
    expect(aplicarBorrador(dos, borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])).toBeNull()
    expect(dos.modulos.every((modulo) => modulo.cotas === undefined)).toBe(true)
  })

  it('1OFI no recibe FI por cotas y un v3 sin cotas no las gana al cambiar el ancho', () => {
    const uno = crearConfiguracionCerramiento(plantillaDiseno('1OFI')!)
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { cotas: { FI: 450 } }
    const intacto = aplicarBorrador(uno, borradores, 'modulos', 'modulo-1')!
    expect(intacto.version).toBe(2)
    expect(intacto.modulos[0].fiMm).toBe(300)
    expect(intacto.modulos[0]).not.toHaveProperty('cotas')

    const v3 = { ...crearConfiguracionCerramiento(plantillaDiseno('2O')!), version: 3 as const }
    const guardado = JSON.stringify(v3)
    borradores.modulos['modulo-1'] = { anchoMm: 1000 }
    const ancho = aplicarBorrador(v3, borradores, 'modulos', 'modulo-1')!
    expect(ancho.modulos[0]).toMatchObject({ anchoMm: 1000 })
    expect(ancho.modulos[0]).not.toHaveProperty('cotas')
    expect(ancho.version).toBe(3)
    expect(JSON.stringify(v3)).toBe(guardado)
  })

  it('actualiza automáticamente el cajón del compacto entre 155 y 185 al cruzar 1600 mm y respeta un cajón manual', () => {
    const base = composicionExplicita(crear())
    const original = {
      ...base,
      modulos: [
        { ...base.modulos[0], altoMm: 1200, compacto: { estructuraCodigo: 'COM001', altoCajonMm: 155, descontarHueco: true } },
        base.modulos[1],
      ],
    }
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { altoMm: 1800 }
    const subido = aplicarBorrador(original, borradores, 'modulos', 'modulo-1')!
    expect(subido.modulos[0].compacto?.altoCajonMm).toBe(185)

    borradores.modulos['modulo-1'] = { altoMm: 1600 }
    const bajado = aplicarBorrador(subido, borradores, 'modulos', 'modulo-1')!
    expect(bajado.modulos[0].compacto?.altoCajonMm).toBe(155)

    const manual = {
      ...original,
      modulos: [
        { ...original.modulos[0], compacto: { estructuraCodigo: 'COM001', altoCajonMm: 200, descontarHueco: true } },
        original.modulos[1],
      ],
    }
    borradores.modulos['modulo-1'] = { altoMm: 1800 }
    expect(aplicarBorrador(manual, borradores, 'modulos', 'modulo-1')!.modulos[0].compacto?.altoCajonMm).toBe(200)
  })

  it('«Actualizar a todos» aplica antes el borrador y copia medidas, materiales y complementos a todos los elementos aunque sean distintos', () => {
    const tres = composicionExplicita(anadirModuloCerramiento(crear(), plantillaDiseno('0')!))
    const preparado = {
      ...tres,
      modulos: [
        { ...tres.modulos[0], compacto: { estructuraCodigo: 'COM001', altoCajonMm: 155, descontarHueco: true, opciones: ['G1O0'] } },
        { ...tres.modulos[1], materiales: { serieCodigo: 'OTRA' } },
        tres.modulos[2],
      ],
    }
    // Sin borrador: copia el compacto y limpia materiales distintos del segundo elemento.
    const sinBorrador = aplicarElementoATodos(preparado, vacios(), 'modulo-1')!
    expect(sinBorrador.modulos.map(m => m.compacto?.estructuraCodigo)).toEqual(['COM001', 'COM001', 'COM001'])
    expect(sinBorrador.modulos.every(m => m.materiales === undefined)).toBe(true)

    // Con borrador pendiente (alto > 1600): primero actualiza el cajón a 185 y propaga todo a los tres.
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { anchoMm: 1500, altoMm: 1800, acabadoCodigo: 'L' }
    const conBorrador = aplicarElementoATodos(preparado, borradores, 'modulo-1')!
    expect(conBorrador.modulos.map(m => [m.anchoMm, m.altoMm, m.compacto?.altoCajonMm, m.materiales])).toEqual([
      [1500, 1800, 185, { acabadoCodigo: 'L' }],
      [1500, 1800, 185, { acabadoCodigo: 'L' }],
      [1500, 1800, 185, { acabadoCodigo: 'L' }],
    ])

    // Rechazo atómico si el cambio no es válido.
    borradores.modulos['modulo-1'] = { anchoMm: 0 }
    expect(aplicarElementoATodos(preparado, borradores, 'modulo-1')).toBeNull()
  })

  it('aplica el acabado propio a modelos iguales y a la unión sin tocar sus medidas', () => {
    const original = crear()
    const borradores = vacios()
    borradores.modulos['modulo-1'] = { acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'L' }
    const modulos = aplicarBorrador(original, borradores, 'modulos', 'modulo-1', ['modulo-1', 'modulo-2'])!
    expect(modulos.modulos.map(m => m.materiales)).toEqual(Array(2).fill({ acabadoCodigo: 'L', acabadoAccesoriosCodigo: 'L' }))
    const union = modulos.uniones[0]!
    borradores.uniones[union.id] = { acabadoCodigo: 'L', longitudMm: union.longitudMm }
    const conUnion = aplicarBorrador(modulos, borradores, 'uniones', union.id)!
    expect(conUnion.uniones[0]).toEqual({ ...union, materiales: { acabadoCodigo: 'L' } })
    borradores.uniones[union.id] = { acabadoCodigo: null }
    expect(aplicarBorrador(conUnion, borradores, 'uniones', union.id)!.uniones[0]).not.toHaveProperty('materiales')
    expect(original.modulos.every(m => m.materiales === undefined)).toBe(true)
  })

  it('«Actualizar todas las uniones» aplica antes el borrador y copia código y acabado a las demás', () => {
    const tres = anadirModuloCerramiento(crear(), plantillaDiseno('2O')!)
    const [primera, segunda] = tres.uniones as [typeof tres.uniones[0], typeof tres.uniones[0]]
    const borradores = vacios()
    borradores.uniones[primera.id] = { codigo: 'PSU006', grosorMm: 0, acabadoCodigo: 'L' }
    const resultado = aplicarUnionATodas(tres, borradores, primera.id)!
    expect(resultado.uniones.map(u => [u.codigo, u.longitudMm, u.materiales])).toEqual([
      ['PSU006', primera.longitudMm, { acabadoCodigo: 'L' }],
      ['PSU006', segunda.longitudMm, { acabadoCodigo: 'L' }],
    ])
    expect(tres.uniones[1]!.codigo).toBe(segunda.codigo)
    expect(aplicarUnionATodas(tres, vacios(), 'no-existe')).toBeNull()
  })
})
