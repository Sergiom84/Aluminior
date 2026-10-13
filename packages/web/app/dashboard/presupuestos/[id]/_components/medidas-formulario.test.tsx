import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { esquemaLinea } from '../../_lib/lineas/esquema-linea.ts'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { EditarCerramiento, type DatosEdicionCerramiento } from './editar-cerramiento.tsx'
import { MedidasElemento } from './medidas-elemento.tsx'
import { PestanaEstructura } from './editor-linea/pestana-estructura.tsx'

vi.mock('./disenador-estructura.tsx', () => ({ DisenadorEstructura: () => null }))
vi.mock('../../_lib/editar-cerramiento-action.ts', () => ({ editarCerramiento: vi.fn() }))
vi.mock('../../_lib/vidrios/acciones.ts', () => ({ buscarVidrios: vi.fn() }))

describe('medidas admitidas por los formularios de líneas', () => {
  it('el editor de módulos admite fracciones ya válidas en la configuración', () => {
    const html = renderToStaticMarkup(<MedidasElemento
      modulo={{ id: 'modulo-1', estructuraCodigo: 'C2', anchoMm: 970, altoMm: 439.5 }}
      pendiente={false} onChange={vi.fn()} onActualizar={vi.fn()} onDescartar={vi.fn()} />)
    expect(html).toContain('step="any" value="439.5"')
  })

  it('la estructura individual acepta medidas fraccionarias', () => {
    const html = renderToStaticMarkup(<PestanaEstructura plantilla={plantillaDiseno('2O')!}
      series={[]} acabados={[]} serie="" setSerie={vi.fn()} anchoMm={1207.25} setAnchoMm={vi.fn()}
      altoMm={439.5} setAltoMm={vi.fn()} vidrio="" setVidrio={vi.fn()}
      acabado="" setAcabado={vi.fn()} variante="2" setVariante={vi.fn()} err={{}} />)
    expect(html).toMatch(/id="anchoMm"[^>]*step="any"[^>]*value="1207.25"/)
    expect(html).toMatch(/id="altoMm"[^>]*step="any"[^>]*value="439.5"/)
  })

  it('editar un GRUPO fraccionario envía su configuración sin duplicarla como metadatos enteros', () => {
    const configuracion = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    configuracion.modulos[0].anchoMm = 970
    configuracion.modulos[0].altoMm = 439.5
    const datos: DatosEdicionCerramiento = {
      configuracion, serieCodigo: 'GMC400', vidrioCodigo: 'VCG4', acabadoCodigo: 'L',
      varianteAcristalamiento: '1', referencia: null, cantidad: '1', horasFabricacion: '0', horasColocacion: '0',
    }
    const html = renderToStaticMarkup(<EditarCerramiento
      presupuestoId="00000000-0000-4000-8000-000000000001" lineaId="00000000-0000-4000-8000-000000000002"
      datos={datos} series={['GMC400']} acabados={[{ codigo: 'L', descripcion: 'Lacado' }]} onCancelar={vi.fn()} />)
    const ocultos = Object.fromEntries([...html.matchAll(/<input type="hidden" name="([^"]+)" value="([^"]*)"/g)]
      .map(([, nombre, valor]) => [nombre, valor.replaceAll('&quot;', '"').replaceAll('&amp;', '&')]))
    expect(esquemaLinea.safeParse(ocultos).success).toBe(true)
    expect(JSON.parse(ocultos.configuracionCerramiento).modulos[0].altoMm).toBe(439.5)
    expect(ocultos).not.toHaveProperty('anchoMm')
    expect(ocultos).not.toHaveProperty('altoMm')
  })
})
