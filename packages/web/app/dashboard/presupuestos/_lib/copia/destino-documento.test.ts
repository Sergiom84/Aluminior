import { describe, expect, it } from 'vitest'
import { proponerDestino, validarDestino } from './destino-documento.ts'

const origen = { numero: 260011, revision: 0, serie: 'A' }

describe('numeración del documento destino', () => {
  it('conserva el número y sube la revisión (11 rev. 0 -> 11 rev. 1)', () => {
    const resultado = proponerDestino(origen, 'MISMO_NUMERO_NUEVA_REVISION', {
      revisionesUsadas: [0],
    })
    expect(resultado).toEqual({ ok: true, destino: { numero: 260011, revision: 1, serie: 'A' } })
  })

  it('parte de la revisión más alta escrita, no de la del origen', () => {
    const resultado = proponerDestino(origen, 'MISMO_NUMERO_NUEVA_REVISION', {
      revisionesUsadas: [0, 1, 2],
    })
    expect(resultado.ok && resultado.destino.revision).toBe(3)
  })

  it('con número nuevo la revisión vuelve a cero, y sin secuencia no inventa número', () => {
    expect(proponerDestino(origen, 'NUEVO_NUMERO', { revisionesUsadas: [0], siguienteNumero: 260012 }))
      .toEqual({ ok: true, destino: { numero: 260012, revision: 0, serie: 'A' } })

    const sinSecuencia = proponerDestino(origen, 'NUEVO_NUMERO', { revisionesUsadas: [0] })
    expect(sinSecuencia.ok).toBe(false)
    if (sinSecuencia.ok) return
    expect(sinSecuencia.errores[0]).toContain('sin la secuencia')
  })

  it('impide que la copia pise el origen o una revisión ya escrita', () => {
    const contexto = { revisionesUsadas: [0, 1] }
    const mismo = validarDestino(origen, { ...origen }, contexto)
    expect(mismo.ok).toBe(false)
    if (!mismo.ok) expect(mismo.errores[0]).toContain('coincide con el documento origen')

    const ocupada = validarDestino(origen, { numero: 260011, revision: 1, serie: 'A' }, contexto)
    expect(ocupada.ok).toBe(false)
    if (!ocupada.ok) expect(ocupada.errores[0]).toContain('Ya existe la revisión 1')

    expect(validarDestino(origen, { numero: 260011, revision: 2, serie: 'A' }, contexto).ok).toBe(true)
    // Otra serie con el mismo número y revisión no colisiona.
    expect(validarDestino(origen, { numero: 260011, revision: 0, serie: 'B' }, contexto).ok).toBe(true)
  })

  it('rechaza numeraciones imposibles', () => {
    const contexto = { revisionesUsadas: [0] }
    const resultado = validarDestino(origen, { numero: 0, revision: -1, serie: ' ' }, contexto)
    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errores).toHaveLength(3)
  })
})
