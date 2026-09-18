import type { Opcion } from '../../_lib/ficha/consulta.ts'
import { CampoBusqueda } from './campo-busqueda.tsx'
import s from './ficha-articulo.module.css'

/** Pestaña `Prv.Habitual`. */
export function PestanaProveedor({
  valor, proveedores, errores,
}: { valor: string | null; proveedores: Opcion[]; errores?: string[] }) {
  return (
    <div className={s.cabecera}>
      <label htmlFor="proveedorHabitual" className={s.etiqueta}>Proveedor Habitual</label>
      <div className={s.ancho}>
        <CampoBusqueda id="proveedorHabitual" nombre="proveedorHabitual" valor={valor}
          opciones={proveedores} errores={errores} />
      </div>
    </div>
  )
}

/**
 * Pestaña `Stock`. En Productor la pestaña aparece deshabilitada en la
 * empresa observada aunque la lista marca `StockSN`; la ubicación de la
 * casilla es una hipótesis pendiente de confirmar con Javi.
 */
export function PestanaStock({ valor }: { valor: boolean }) {
  return (
    <div className={s.casillas}>
      <label><input type="checkbox" name="controlaStock" defaultChecked={valor} /> Control de Stock</label>
    </div>
  )
}

/**
 * Pestaña `Producción`: documentos en los que aparece el artículo y datos de
 * vidrio de `Producción > Más Datos`. `Hoja Despiece` sale de la columna
 * `HojaDespieceSN` de la lista; su lugar en la ficha es una hipótesis.
 */
export function PestanaProduccion({
  hojaCorte, hojaDespiece, tamJunquilloGoma, grosorPesoVidrio, errores,
}: {
  hojaCorte: boolean
  hojaDespiece: boolean
  tamJunquilloGoma: string | null
  grosorPesoVidrio: string | null
  errores: Record<string, string[]>
}) {
  return (
    <>
      <fieldset className={s.grupo}>
        <legend>Documentos</legend>
        <div className={s.casillas}>
          <label><input type="checkbox" name="apareceEnHojaCorte" defaultChecked={hojaCorte} /> Hoja de Corte</label>
          <label><input type="checkbox" name="apareceEnHojaDespiece" defaultChecked={hojaDespiece} /> Hoja Despiece</label>
        </div>
      </fieldset>
      <fieldset className={s.grupo}>
        <legend>Más Datos</legend>
        <div className={s.medidas}>
          <label htmlFor="tamJunquilloGoma">Tamaño (Gomos y Junquillos), Grosor Vidrio</label>
          <input id="tamJunquilloGoma" name="tamJunquilloGoma" defaultValue={tamJunquilloGoma ?? ''}
            aria-invalid={errores.tamJunquilloGoma ? true : undefined} className={`${s.campo} cifra`} />
          <span>mm.</span>
          <label htmlFor="grosorPesoVidrio">Grosor para peso vidrio</label>
          <input id="grosorPesoVidrio" name="grosorPesoVidrio" inputMode="decimal" defaultValue={grosorPesoVidrio ?? ''}
            aria-invalid={errores.grosorPesoVidrio ? true : undefined} className={`${s.campo} cifra`} />
          <span>mm.</span>
        </div>
      </fieldset>
    </>
  )
}
