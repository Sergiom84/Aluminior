import { afterEach, describe, expect, it } from 'vitest'
import { anadirModuloCerramiento, crearConfiguracionCerramiento, generarPlantillaCatalogo, plantillaDiseno,
  registrarCatalogoDiseno, UNIONES_VISUALES, esConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { aplicarBorrador, type Borradores } from './use-borradores-cerramiento.ts'

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
})
