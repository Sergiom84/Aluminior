import React from 'react'
import { Document, Page, renderToBuffer } from '@react-pdf/renderer'
import { expect, it } from 'vitest'
import type { ConfiguracionCerramiento } from '@aluminior/core/estructuras'
import { DibujoCerramientoPdf } from './dibujo-cerramiento.tsx'

it('genera un PDF real sintético con la geometría FI explícita', async () => {
  const configuracion: ConfiguracionCerramiento = {
    version: 2,
    modulos: [{
      id: 'modulo-1', estructuraCodigo: '1OFI', anchoMm: 900, altoMm: 1800, fiMm: 400,
    }],
    uniones: [],
  }
  const buffer = await renderToBuffer(
    <Document><Page><DibujoCerramientoPdf configuracion={configuracion} /></Page></Document>,
  )

  expect(buffer.subarray(0, 5).toString()).toBe('%PDF-')
  expect(buffer.length).toBeGreaterThan(1_000)
})
