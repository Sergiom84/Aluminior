import { describe, expect, it } from 'vitest'
import { validarUnion } from '../../../../../lib/catalogo-uniones/validar.ts'

const base = {
  codigo: 'QA-U60', descripcion: 'Tubo 60', cantidad: '1', perfil1: 'GM60X60',
  grosor: '60', l1: '0', l2: '0', tipo: '0', manoObra: '0', deUsuario: '1', imagen: 'GMU038.bmp',
}

describe('validar unión', () => {
  it('acepta la ficha mínima', () => {
    const r = validarUnion(base)
    expect(r.ok && r.datos.perfiles[0]).toBe('GM60X60')
  })

  it('exige serie cuando la unión queda limitada', () => {
    const r = validarUnion({ ...base, seriesEspecificas: '1' })
    expect(r.ok).toBe(false)
  })

  it('rechaza una imagen con ruta', () => {
    const r = validarUnion({ ...base, imagen: '..\\GMU038.bmp' })
    expect(r.ok).toBe(false)
  })
})
