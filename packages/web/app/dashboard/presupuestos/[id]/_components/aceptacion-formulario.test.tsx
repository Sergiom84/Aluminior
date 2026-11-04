import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { crearConfiguracionCerramiento, plantillaDiseno } from '@aluminior/core/estructuras'
import { EditarCerramiento, type DatosEdicionCerramiento } from './editar-cerramiento.tsx'
import { AnyadirLinea } from './anyadir-linea.tsx'

const mensaje = 'Datos incompletos para el Elemento 2O de 1200 x 1200: falta vidrio'
vi.mock('./use-envio-formulario.ts', () => ({
  useEnvioFormulario: () => ({
    estado: { ok: false, errores: { configuracionCerramiento: [mensaje] } },
    enviar: vi.fn(),
    enviando: false,
  }),
}))
vi.mock('../../_lib/editar-cerramiento-action.ts', () => ({ editarCerramiento: vi.fn() }))
vi.mock('../../_lib/acciones.ts', () => ({ anyadirLinea: vi.fn() }))
vi.mock('../../_lib/vidrios/acciones.ts', () => ({ buscarVidrios: vi.fn() }))

describe('rechazo al aceptar', () => {
  it('el editor muestra el error y conserva la composición', () => {
    const configuracion = crearConfiguracionCerramiento(plantillaDiseno('2O')!)
    const datos: DatosEdicionCerramiento = {
      configuracion, serieCodigo: 'QA-VA1-SERIE', vidrioCodigo: null, acabadoCodigo: 'QA-VA1-ACABADO',
      varianteAcristalamiento: '2', referencia: 'SALÓN', cantidad: '1',
      horasFabricacion: '0', horasColocacion: '0',
    }
    const cancelar = vi.fn()
    const html = renderToStaticMarkup(<EditarCerramiento
      presupuestoId="00000000-0000-4000-8000-000000000001"
      lineaId="00000000-0000-4000-8000-000000000002"
      datos={datos} series={['QA-VA1-SERIE']} acabados={[{ codigo: 'QA-VA1-ACABADO', descripcion: 'Sintético' }]}
      onCancelar={cancelar} />)
    expect(html).toContain('role="alert"')
    expect(html).toContain(mensaje)
    const oculto = html.match(/name="configuracionCerramiento" value="([^"]*)"/)?.[1]
      ?.replaceAll('&quot;', '"').replaceAll('&amp;', '&')
    expect(oculto).toBeDefined()
    expect(JSON.parse(oculto!)).toEqual(configuracion)
    expect(html).toContain('2O de 1200 x 1200')
    expect(cancelar).not.toHaveBeenCalled()
  })

  it('el alta anuncia el error sin sustituir el configurador', () => {
    const html = renderToStaticMarkup(<AnyadirLinea
      presupuestoId="00000000-0000-4000-8000-000000000001" series={['QA-VA1-SERIE']}
      acabados={[{ codigo: 'QA-VA1-ACABADO', descripcion: 'Sintético' }]} />)
    expect(html).toContain('role="alert"')
    expect(html).toContain(mensaje)
    expect(html).toContain('aria-label="Introducir línea"')
    expect(html).toContain('CERRAMIENTO · 0 ELEMENTOS')
  })
})
