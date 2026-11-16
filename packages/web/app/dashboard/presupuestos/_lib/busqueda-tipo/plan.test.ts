import { describe, expect, it } from 'vitest'
import { digitosTelefono, fragmentosConsulta, planBusqueda, textoCodigo } from './plan.ts'
import { TIPOS_BUSQUEDA, leerTipoBusqueda } from './tipos.ts'

describe('tipo de búsqueda en la URL', () => {
  it('acepta los siete tipos y vuelve a nombre si falta o es desconocido', () => {
    expect(TIPOS_BUSQUEDA.map((t) => t.valor)).toEqual(
      ['nombre', 'codigo', 'calle', 'telefono', 'obra', 'fecha', 'precio'])
    for (const { valor } of TIPOS_BUSQUEDA) expect(leerTipoBusqueda(valor)).toBe(valor)
    expect(leerTipoBusqueda(undefined)).toBe('nombre')
    expect(leerTipoBusqueda('DROP TABLE')).toBe('nombre')
  })
})

describe('plan de búsqueda por tipo', () => {
  it('sin texto no filtra', () => {
    expect(planBusqueda('nombre', '   ')).toBeNull()
    expect(planBusqueda('precio', '')).toBeNull()
  })

  it('nombre: fragmentos sin acentos ni mayúsculas, en el orden escrito', () => {
    expect(planBusqueda('nombre', '  Agudo   LUIS ')).toEqual({ tipo: 'nombre', fragmentos: ['agudo', 'luis'] })
    expect(planBusqueda('nombre', 'Martínez Ñúñez')).toEqual({ tipo: 'nombre', fragmentos: ['martinez', 'nunez'] })
  })

  it('quita comodines y el escape de LIKE de los fragmentos', () => {
    expect(fragmentosConsulta('gar%cia _ \\ pe\\rez')).toEqual(['garcia', 'perez'])
    expect(planBusqueda('obra', '%% __')).toEqual({ tipo: 'obra', error: 'Texto no válido.' })
  })

  it('codigo: sin espacios ni comodines', () => {
    expect(textoCodigo(' 26 00%_ ')).toBe('2600')
    expect(planBusqueda('codigo', '260012')).toEqual({ tipo: 'codigo', texto: '260012' })
    expect(planBusqueda('codigo', ' % ')).toEqual({ tipo: 'codigo', error: 'Código no válido.' })
  })

  it('calle: abreviaturas como palabra completa', () => {
    expect(planBusqueda('calle', 'C/ Mayor')).toEqual({ tipo: 'calle', fragmentos: ['calle', 'mayor'] })
    expect(planBusqueda('calle', 'avda. Andalucía')).toEqual({ tipo: 'calle', fragmentos: ['avenida', 'andalucia'] })
  })

  it('telefono: compara solo cifras y exige al menos tres', () => {
    expect(digitosTelefono('+34 958.12-34 56')).toBe('34958123456')
    expect(planBusqueda('telefono', '958 12 34')).toEqual({ tipo: 'telefono', digitos: '9581234' })
    expect(planBusqueda('telefono', '9-5')).toEqual({ tipo: 'telefono', error: 'Escribe al menos 3 cifras.' })
  })

  it('obra: fragmentos como el nombre', () => {
    expect(planBusqueda('obra', 'Reforma ático')).toEqual({ tipo: 'obra', fragmentos: ['reforma', 'atico'] })
  })

  it('fecha: día, día de cualquier año, mes y año; rechaza lo que no es fecha', () => {
    expect(planBusqueda('fecha', '17/07/2026')).toEqual({ tipo: 'fecha', fecha: { tipo: 'dia', iso: '2026-07-17' } })
    expect(planBusqueda('fecha', '17/07')).toEqual({ tipo: 'fecha', fecha: { tipo: 'dia-mes', dm: '17/07' } })
    expect(planBusqueda('fecha', '07/2026')).toEqual({ tipo: 'fecha', fecha: { tipo: 'mes', ym: '2026-07' } })
    expect(planBusqueda('fecha', '2026')).toEqual({ tipo: 'fecha', fecha: { tipo: 'anio', anio: '2026' } })
    expect(planBusqueda('fecha', '31/02/2026')).toEqual({ tipo: 'fecha', error: 'Fecha no reconocida.' })
    expect(planBusqueda('fecha', 'ayer')).toEqual({ tipo: 'fecha', error: 'Fecha no reconocida.' })
  })

  it('precio: tres escrituras del mismo céntimo y el euro entero sin decimales', () => {
    const exacto = { tipo: 'precio', importe: { tipo: 'exacto', valor: '2176.09' } }
    expect(planBusqueda('precio', '2176,09')).toEqual(exacto)
    expect(planBusqueda('precio', '2.176,09')).toEqual(exacto)
    expect(planBusqueda('precio', '2176.09')).toEqual(exacto)
    expect(planBusqueda('precio', '2176')).toEqual({ tipo: 'precio', importe: { tipo: 'euros', euros: '2176' } })
    expect(planBusqueda('precio', '2.176')).toEqual({ tipo: 'precio', importe: { tipo: 'euros', euros: '2176' } })
    expect(planBusqueda('precio', '21,76,09')).toEqual({ tipo: 'precio', error: 'Precio no reconocido.' })
  })
})
