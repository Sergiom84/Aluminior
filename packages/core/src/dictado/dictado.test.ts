import { describe, expect, it } from 'vitest'
import { camposAltaDictado, normalizarTelefono, sanearDictado } from './index.ts'

describe('teléfono', () => {
  it('acepta formatos españoles y rechaza el resto', () => {
    expect(normalizarTelefono('+34 612 34 56 78')).toBe('612345678')
    expect(normalizarTelefono('0034-952.123.456')).toBe('952123456')
    expect(normalizarTelefono('612345')).toBeNull()
    expect(normalizarTelefono('512345678')).toBeNull()
  })
})

describe('saneado de la respuesta del modelo', () => {
  it('deja vacío lo dudoso y nunca convierte una medida ausente en cero', () => {
    const datos = sanearDictado({
      nombre: '  Juan   Pérez ',
      telefono: '612 34 56 78',
      direccion: '',
      queMontar: 'Corredera de dos hojas',
      medidas: [
        { ancho: 1500, alto: 1200, nota: 'salón' },
        { ancho: 0, alto: null, nota: null },
        { ancho: 0, alto: 1200, nota: null },
        { ancho: 1499.6, alto: 99999, nota: 'baño' },
        'basura',
      ],
      inyectado: 'ignorar',
    })
    expect(datos).toEqual({
      nombre: 'Juan Pérez',
      telefono: '612345678',
      direccion: null,
      queMontar: 'Corredera de dos hojas',
      medidas: [
        { ancho: 1500, alto: 1200, nota: 'salón' },
        { ancho: null, alto: 1200, nota: null },
        { ancho: 1500, alto: null, nota: 'baño' },
      ],
    })
  })

  it('una respuesta que no es un objeto no rompe nada', () => {
    expect(sanearDictado('hola')).toEqual({
      nombre: null, telefono: null, direccion: null, queMontar: null, medidas: [],
    })
  })
})

describe('campos de alta', () => {
  it('reparte los datos en la cabecera y guarda la transcripción', () => {
    const campos = camposAltaDictado({
      nombre: 'Juan Pérez',
      telefono: '612 345 678',
      direccion: 'Calle Real 12, Ronda',
      queMontar: 'Corredera de dos hojas',
      medidas: [{ ancho: 1500, alto: null, nota: 'salón' }],
      transcripcion: 'Llamó Juan...',
    })
    expect(campos.nombreLibre).toBe('Juan Pérez')
    expect(campos.obraTexto).toBe('Corredera de dos hojas')
    expect(campos.observaciones).toBe(
      'Teléfono: 612 345 678\n\nDirección: Calle Real 12, Ronda\n\nMedidas:\n- 1500 x ? mm salón\n\nDictado:\nLlamó Juan...',
    )
  })

  it('una obra larga se recorta en la cabecera y va entera a observaciones', () => {
    const largo = 'ventana '.repeat(40).trim()
    const campos = camposAltaDictado({
      nombre: 'Ana', telefono: '', direccion: '', queMontar: largo, medidas: [], transcripcion: '',
    })
    expect([...campos.obraTexto].length).toBe(200)
    expect(campos.observaciones).toBe(`Qué quiere montar: ${largo}`)
  })
})
