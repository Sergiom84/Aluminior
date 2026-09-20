import { bool, ent, fecha, num, txt } from '../csv.ts'
import type { Cargar } from './cargar.ts'
import { descartar, type Resultado } from './resultado.ts'

export async function cargarMaestros(cargar: Cargar): Promise<Resultado[]> {
  const resultados: Resultado[] = []
  resultados.push(await cargar('Familias', 'familias', (f) => {
    const codigo = txt(f.Codigo)
    if (!codigo) return null
    return { codigo, descripcion: txt(f.Nombre) ?? codigo, grupo: txt(f.LineaNegocio) }
  }))

  resultados.push(await cargar('Acabados', 'acabados', (f) => {
    const codigo = txt(f.Codigo)
    if (!codigo) return null
    return {
      codigo,
      descripcion: txt(f.Descripcion) ?? codigo,
      admite_tonalidad: bool(f.TonalidadesSN),
    }
  }))

  resultados.push(await cargar('Articulos', 'articulos', (f, r) => {
    const codigo = txt(f.Codigo)
    if (!codigo) { descartar(r, 'sin código'); return null }
    return {
      codigo,
      descripcion: txt(f.Descripcion) ?? codigo,
      familia_codigo: txt(f.Familia),
      subfamilia_codigo: txt(f.Subfamilia),
      tipo_metraje: txt(f.TipoMetraje) ?? 'UD',
      metraje_minimo: num(f.MetrajeMinimo),
      metraje_multiplo_largo: num(f.MetrajeMultiploLargo),
      metraje_multiplo_ancho: num(f.MetrajeMultiploAncho),
      peso_ml: num(f.PesoML),
      grosor_peso_vidrio: num(f.GrosorPesoVid),
      tam_junquillo_goma: txt(f.TamJunqGoma),
      da_grosor: num(f.DAgrosor),
      da_vidrio_1: txt(f.DAVid1),
      da_vidrio_2: txt(f.DAVid2),
      da_camara_1: txt(f.DACam1),
      da_articulo_base: txt(f.DAArtBase),
      aparece_en_hoja_despiece: bool(f.HojaDespieceSN, true),
      aparece_en_hoja_corte: bool(f.HojaCorteSN, true),
      controla_stock: bool(f.StockSN),
      proveedor_habitual: txt(f.TPproveedor),
    }
  }))

  resultados.push(await cargar('Clientes', 'clientes', (f, r) => {
    const codigo = txt(f.Codigo)
    if (!codigo) { descartar(r, 'sin código'); return null }
    return {
      codigo,
      nombre: txt(f.Nombre) ?? codigo,
      nombre_comercial: txt(f.NombreComercial),
      nif: txt(f.NIF),
      direccion: txt(f.Direccion),
      cp: txt(f.CP),
      poblacion: txt(f.Poblacion),
      provincia: txt(f.Provincia),
      pais: txt(f.Pais) ?? 'ES',
      persona_contacto: txt(f.Att),
      telefono: txt(f.Telefono),
      telefono_movil: txt(f.TelefonoMovil),
      email: txt(f.eMail),
      tarifa: ent(f.Tarifa) ?? 1,
      tipo_iva: txt(f.TipoIVA),
      descuento: num(f.Descuento),
      descuento_factura: num(f.DescuentoFac),
      persona_fisica_juridica: txt(f.PersonaFisicaJuridica),
      sii_tipo_id_fiscal: txt(f.siiTipoIdFiscal),
      fecha_alta: fecha(f.FechaAlta),
    }
  }))

  resultados.push(await cargar('AcaTonalidades', 'tonalidades', (f, r) => {
    const acabado = txt(f.Acabado)
    const codigo = txt(f.Tonalidad)
    if (!acabado || !codigo) { descartar(r, 'clave incompleta'); return null }
    return {
      acabado_codigo: acabado,
      codigo,
      descripcion: txt(f.Descripcion) ?? codigo,
    }
  }))

  resultados.push(await cargar('Proveedores', 'proveedores', (f, r) => {
    const codigo = txt(f.Codigo)
    if (!codigo) { descartar(r, 'sin código'); return null }
    return {
      codigo,
      nombre: txt(f.Nombre) ?? codigo,
      nif: txt(f.NIF),
      contacto: txt(f.Contacto),
      direccion: txt(f.Direccion),
      cp: txt(f.CP),
      poblacion: txt(f.Poblacion),
      provincia: txt(f.Provincia),
      telefono: txt(f.Telefono),
      email: txt(f.eMail),
    }
  }))

  resultados.push(await cargar('ClientesObras', 'obras', (f, r) => {
    const cliente = txt(f.Cliente)
    const nombre = txt(f.Nombre)
    if (!nombre) { descartar(r, 'obra sin nombre'); return null }
    return {
      cliente_codigo: cliente,
      numero: ent(f.nObra),
      descripcion: nombre,
      observaciones: txt(f.Observaciones),
    }
  }))
  return resultados
}
