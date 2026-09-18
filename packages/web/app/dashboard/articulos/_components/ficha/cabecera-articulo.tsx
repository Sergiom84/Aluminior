'use client'

import { useState } from 'react'
import type { CatalogosFicha } from '../../_lib/ficha/consulta.ts'
import { CampoBusqueda } from './campo-busqueda.tsx'
import s from './ficha-articulo.module.css'

export interface DatosCabecera {
  codigo: string
  descripcion: string
  familiaCodigo: string | null
  subfamiliaCodigo: string | null
}

/**
 * Fila de código y cabecera de `Artículos. Detalle`. Línea de negocio,
 * estado, tipo de artículo y tipo de impuesto aún no se persisten: se
 * muestran deshabilitados para conservar la estructura de Productor.
 */
export function CabeceraArticulo({
  datos, esNuevo, catalogos, errores, codigoPropuesto,
}: {
  datos: DatosCabecera
  esNuevo: boolean
  catalogos: CatalogosFicha
  errores: Record<string, string[]>
  codigoPropuesto: string | null
}) {
  const [descripcion, setDescripcion] = useState(datos.descripcion)
  const [familia, setFamilia] = useState(datos.familiaCodigo ?? '')
  const subfamilias = catalogos.subfamilias.filter((sf) => !familia || !sf.familiaCodigo || sf.familiaCodigo === familia)

  return (
    <>
      <div className={s.codigoRow}>
        <label htmlFor="codigo" className={s.etiqueta}>Codigo</label>
        <input
          id="codigo" name="codigo" required autoFocus={esNuevo}
          key={codigoPropuesto ?? 'codigo'}
          defaultValue={codigoPropuesto ?? datos.codigo}
          readOnly={!esNuevo}
          aria-invalid={errores.codigo ? true : undefined}
          className={`${s.campo} ${s.codigo}`}
        />
        <output htmlFor="descripcion" className={`${s.campo} ${s.codigo}`} aria-label="Descripción">
          {descripcion}
        </output>
        {errores.codigo && <span className={s.error}>{errores.codigo.join('. ')}</span>}
      </div>

      <div className={s.cabecera}>
        <label htmlFor="descripcion" className={s.etiqueta}>Descripción</label>
        <div className={s.ancho}>
          <input
            id="descripcion" name="descripcion" value={descripcion} maxLength={300}
            autoFocus={!esNuevo}
            aria-invalid={errores.descripcion ? true : undefined}
            className={s.campo}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          {errores.descripcion && <span className={s.error}>{errores.descripcion.join('. ')}</span>}
        </div>

        <label htmlFor="lineaNegocio" className={s.etiqueta}>Línea Negocio</label>
        <input id="lineaNegocio" disabled className={s.campo} />
        <label htmlFor="estado" className={s.etiqueta}>Estado</label>
        <input id="estado" disabled className={s.campo} />

        <label htmlFor="familiaCodigo" className={s.etiqueta}>Familia</label>
        <CampoBusqueda id="familiaCodigo" nombre="familiaCodigo" valor={datos.familiaCodigo}
          opciones={catalogos.familias} errores={errores.familiaCodigo} onCambio={setFamilia} />
        <label htmlFor="subfamiliaCodigo" className={s.etiqueta}>Subfamilia</label>
        <CampoBusqueda id="subfamiliaCodigo" nombre="subfamiliaCodigo" valor={datos.subfamiliaCodigo}
          opciones={subfamilias} errores={errores.subfamiliaCodigo} />

        <label htmlFor="tipoArticulo" className={s.etiqueta}>Tipo de Art.</label>
        <input id="tipoArticulo" disabled className={s.campo} />
        <label htmlFor="tipoImpuesto" className={s.etiqueta}>Tipo Impuesto</label>
        <input id="tipoImpuesto" disabled className={s.campo} />
      </div>
    </>
  )
}
