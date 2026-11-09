import { describe, expect, it } from 'vitest'
import { interpretarFecha, interpretarImporte } from './busqueda-listado.ts'

describe('fecha y precio del listado comercial', () => {
  it('acepta la fecha que ve el operador y rechaza un día imposible', () => {
    expect(interpretarFecha('12/03/2026')).toEqual({ tipo: 'dia', iso: '2026-03-12' })
    expect(interpretarFecha('9/11/26')).toEqual({ tipo: 'dia', iso: '2026-11-09' })
    expect(interpretarFecha('2026-03-12')).toEqual({ tipo: 'dia', iso: '2026-03-12' })
    expect(interpretarFecha('03/2026')).toEqual({ tipo: 'mes', ym: '2026-03' })
    expect(interpretarFecha('12/03')).toEqual({ tipo: 'dia-mes', dm: '12/03' })
    expect(interpretarFecha('2026')).toEqual({ tipo: 'anio', anio: '2026' })
    expect(interpretarFecha('31/04/2026')).toBeNull()
    expect(interpretarFecha('garcia')).toBeNull()
  })

  it('lee el precio en formato español', () => {
    expect(interpretarImporte('1.200,50')).toEqual({ tipo: 'exacto', valor: '1200.50' })
    expect(interpretarImporte('€ 842,5')).toEqual({ tipo: 'exacto', valor: '842.50' })
    expect(interpretarImporte('1.200')).toEqual({ tipo: 'euros', euros: '1200' })
    expect(interpretarImporte('1200.50')).toEqual({ tipo: 'exacto', valor: '1200.50' })
    expect(interpretarImporte('12/03/2026')).toBeNull()
    expect(interpretarImporte('garcia')).toBeNull()
  })
})
