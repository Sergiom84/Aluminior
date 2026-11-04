import { describe, expect, it } from 'vitest'
import type { ConfiguracionCerramiento, ModuloCerramiento, UnionCerramiento } from './cerramiento.ts'
import { descripcionGrupo, type DatosDescripcionGrupo } from './descripcion-grupo.ts'

function modulo(parcial: Partial<ModuloCerramiento> & Pick<ModuloCerramiento, 'id' | 'estructuraCodigo'>): ModuloCerramiento {
  return { anchoMm: 1200, altoMm: 1200, ...parcial }
}

function config(
  modulos: ModuloCerramiento[],
  uniones: UnionCerramiento[] = [],
): ConfiguracionCerramiento {
  return { version: 3, modulos, uniones, repartoUniones: 'PIEZAS' }
}

function datos(parcial: Partial<DatosDescripcionGrupo> = {}): DatosDescripcionGrupo {
  return {
    estructuras: new Map(),
    acabados: new Map(),
    articulos: new Map(),
    serieCodigo: null,
    vidrioCodigo: null,
    acabadoCodigo: null,
    ...parcial,
  }
}

describe('descripción generada del GRUPO', () => {
  it('escribe un bloque de cuatro líneas con la medida nominal agrupada', () => {
    const texto = descripcionGrupo(config([modulo({ id: 'm1', estructuraCodigo: 'QA-1' })]), datos({
      estructuras: new Map([['QA-1', 'Qa-Fijo de un hueco']]),
      acabados: new Map([['QA-L', 'Qa-Blanco']]),
      articulos: new Map([['QA-VID', 'Qa-Laminar']]),
      serieCodigo: 'QA-SERIE',
      vidrioCodigo: 'QA-VID',
      acabadoCodigo: 'QA-L',
    }))

    expect(texto).toBe([
      'Qa-Fijo de un hueco DE MEDIDAS : 1.200,0 x 1.200,0',
      'EN COLOR Qa-Blanco',
      'QA-SERIE',
      'Qa-Laminar',
    ].join('\n'))
  })

  it('separa cuatro elementos por una línea en blanco y no menciona la unión', () => {
    const modulos = ['QA-A', 'QA-B', 'QA-C', 'QA-D'].map((codigo, indice) => modulo({
      id: `m${indice + 1}`,
      estructuraCodigo: codigo,
      anchoMm: 400 + indice,
      altoMm: 500 + indice,
    }))
    const texto = descripcionGrupo(config(modulos, [{
      id: 'u1', codigo: 'QA-UNION-NO', longitudMm: 500, grosorMm: 60,
    }]), datos({
      estructuras: new Map([
        ['QA-A', 'QA pieza A'],
        ['QA-B', 'QA pieza B'],
        ['QA-C', 'QA pieza C'],
        ['QA-D', 'QA pieza D'],
      ]),
      serieCodigo: 'QA-SERIE',
    }))

    expect(texto.split('\n\n')).toEqual([
      'QA pieza A DE MEDIDAS : 400,0 x 500,0\nQA-SERIE',
      'QA pieza B DE MEDIDAS : 401,0 x 501,0\nQA-SERIE',
      'QA pieza C DE MEDIDAS : 402,0 x 502,0\nQA-SERIE',
      'QA pieza D DE MEDIDAS : 403,0 x 503,0\nQA-SERIE',
    ])
    expect(texto).not.toContain('QA-UNION-NO')
  })

  it('usa serie y vidrio del elemento y, si faltan, los generales', () => {
    const texto = descripcionGrupo(config([
      modulo({ id: 'm1', estructuraCodigo: 'QA-1', materiales: { serieCodigo: 'QA-SERIE-PROPIA', vidrioCodigo: 'QA-VID-PROPIO' } }),
      modulo({ id: 'm2', estructuraCodigo: 'QA-1' }),
    ]), datos({
      estructuras: new Map([['QA-1', 'QA elemento']]),
      articulos: new Map([
        ['QA-VID-PROPIO', 'QA vidrio propio'],
        ['QA-VID-GENERAL', 'QA vidrio general'],
      ]),
      serieCodigo: 'QA-SERIE-GENERAL',
      vidrioCodigo: 'QA-VID-GENERAL',
    }))

    expect(texto).toBe([
      'QA elemento DE MEDIDAS : 1.200,0 x 1.200,0',
      'QA-SERIE-PROPIA',
      'QA vidrio propio',
      '',
      'QA elemento DE MEDIDAS : 1.200,0 x 1.200,0',
      'QA-SERIE-GENERAL',
      'QA vidrio general',
    ].join('\n'))
  })

  it('omite el vidrio ausente o no resuelto y no escribe el código en crudo', () => {
    const texto = descripcionGrupo(config([
      modulo({ id: 'm1', estructuraCodigo: 'QA-1' }),
      modulo({ id: 'm2', estructuraCodigo: 'QA-1', materiales: { vidrioCodigo: 'QA-VID-AUSENTE' } }),
    ]), datos({
      estructuras: new Map([['QA-1', 'QA elemento']]),
      serieCodigo: 'QA-SERIE',
      vidrioCodigo: 'QA-VID-GENERAL-AUSENTE',
    }))

    expect(texto).toBe([
      'QA elemento DE MEDIDAS : 1.200,0 x 1.200,0',
      'QA-SERIE',
      '',
      'QA elemento DE MEDIDAS : 1.200,0 x 1.200,0',
      'QA-SERIE',
    ].join('\n'))
    expect(texto).not.toContain('QA-VID-AUSENTE')
    expect(texto).not.toContain('QA-VID-GENERAL-AUSENTE')
  })

  it('añade el compacto al final del bloque de su elemento', () => {
    const texto = descripcionGrupo(config([
      modulo({
        id: 'm1', estructuraCodigo: 'QA-1',
        compacto: { estructuraCodigo: 'QA-COMP', altoCajonMm: 155 },
      }),
      modulo({ id: 'm2', estructuraCodigo: 'QA-2' }),
    ]), datos({
      estructuras: new Map([
        ['QA-1', 'QA elemento'],
        ['QA-2', 'QA segundo'],
        ['QA-COMP', 'QA cajón sintético'],
      ]),
    }))

    expect(texto).toBe([
      'QA elemento DE MEDIDAS : 1.200,0 x 1.200,0',
      'QA cajón sintético',
      '',
      'QA segundo DE MEDIDAS : 1.200,0 x 1.200,0',
    ].join('\n'))
  })

  it('formatea medidas decimales nominales del elemento', () => {
    const texto = descripcionGrupo(config([
      modulo({ id: 'm1', estructuraCodigo: 'QA-1', anchoMm: 970, altoMm: 1999.5 }),
    ]), datos({ estructuras: new Map([['QA-1', 'QA elemento']]) }))

    expect(texto).toBe('QA elemento DE MEDIDAS : 970,0 x 1.999,5')
  })

  it('omite color, serie y compacto no resueltos y cae a la plantilla o al código', () => {
    const conPlantilla = descripcionGrupo(config([
      modulo({ id: 'm1', estructuraCodigo: '0', compacto: { estructuraCodigo: 'QA-COMP-AUSENTE', altoCajonMm: 155 } }),
    ]), datos({ acabadoCodigo: 'QA-L-AUSENTE', serieCodigo: '   ' }))
    expect(conPlantilla).toBe('FIJO DE 1 HUECO DE MEDIDAS : 1.200,0 x 1.200,0')
    expect(conPlantilla).not.toContain('EN COLOR')
    expect(conPlantilla).not.toContain('QA-COMP-AUSENTE')
    expect(conPlantilla).not.toContain('QA-L-AUSENTE')

    const sinPlantilla = descripcionGrupo(config([
      modulo({ id: 'm1', estructuraCodigo: '  QA-SIN-NOMBRE  ' }),
    ]), datos())
    expect(sinPlantilla).toBe('QA-SIN-NOMBRE DE MEDIDAS : 1.200,0 x 1.200,0')
  })
})
