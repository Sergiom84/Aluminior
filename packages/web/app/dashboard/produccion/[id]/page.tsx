import { notFound } from 'next/navigation'
import Link from 'next/link'
import { crearDb } from '@aluminior/db'
import { Shell } from '../../_components/shell'
import { cargarProduccion } from '../_lib/datos-produccion'
import { prepararProduccion } from '../_lib/preparar-produccion'
import { parametrosProduccion } from '../_lib/parametros'
import { FormularioParametros, type ConsultaParametros } from '../_components/parametros'
import { HojaCorteVista } from '../_components/hoja-corte'
import { HojaProduccionVista } from '../_components/hoja-produccion'
import { DespunteVista } from '../_components/despunte'

export const dynamic = 'force-dynamic'
export default async function ProduccionDocumento({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<ConsultaParametros>
}) {
  const { id } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound()
  const consulta = await searchParams
  const datos = await cargarProduccion(crearDb(), id)
  if (!datos) notFound()
  let resultado = null
  let errorParametros: string | null = null
  try { resultado = prepararProduccion(datos, parametrosProduccion(consulta)) }
  catch (error) { errorParametros = error instanceof Error ? error.message : 'Parámetros no válidos' }
  return <Shell moduloActivo="produccion">
    <div className="min-w-0 space-y-5">
      <header>
        <Link href="/dashboard/produccion" className="text-sm underline">Volver a producción</Link>
        <h1 className="mt-3 text-xl font-semibold">Producción · {datos.serie} {datos.documento.numero} · revisión {datos.documento.revision}</h1>
        <p>{datos.destinatario}</p>
        {datos.documento.obra && <p className="break-words">{datos.documento.obra}</p>}
        <Link href={`/dashboard/presupuestos/${id}`} className="text-sm underline">Ver presupuesto</Link>
      </header>
      <FormularioParametros consulta={consulta} />
      {errorParametros && <p role="alert" style={{ color: 'var(--al-error)' }}>Parámetros no válidos: {errorParametros}</p>}
      {resultado && <>
        <section aria-label="Estado de producción">
          <h2 className="font-semibold">{resultado.estado === 'NO_DISPONIBLE' ? 'Producción no disponible' : resultado.estado === 'CON_INCIDENCIAS' ? 'Producción con incidencias' : 'Producción lista'}</h2>
          {resultado.incidencias.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {resultado.incidencias.map((i, n) => <li key={n} className="break-words">{i.referencia}: {i.detalle}</li>)}
          </ul>}
        </section>
        <HojaCorteVista resultado={resultado} />
        <HojaProduccionVista resultado={resultado} />
        <DespunteVista datos={resultado.despunte} />
      </>}
    </div>
  </Shell>
}
