import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const CAMPOS_DISENO = ['Estructura', 'TipoDoc', 'Id', 'Tipo', 'ContenidoEn', 'idTrav',
  'posHueco', 'TipoTrav', 'bInvisible', 'TipoHoja', 'nHoja', 'TipoCota', 'Cota',
  'OperacionEqui', 'TipoMarco', 'TravMedAbsMRel', 'bApertExt', 'bZocaloOPC',
  'bZocaloAd', 'PerfilAdSN', 'bPerSupAd', 'bVAG', 'TipoCurva', 'barrVert',
  'barrHoriz', 'bPerInf', 'bPerSup', 'bPerIz', 'bPerDe']

export const nodo = (id, tipo, padre, resto = {}) => ({ id, tipo, padre, division: 0,
  posicion: 0, travesano: '', invisible: false, hoja: 0, numeroHoja: 0, tipoCota: 0,
  cota: 0, equidistantes: 0, marco: tipo === 1 ? 'NOR' : '', variantes: [], ...resto })

export function lecturaSintetica() {
  return { fuente: { id: 'sintetica-v1' },
    familias: [{ codigo: '005', descripcion: 'Fijos de prueba', orden: 1 },
      { codigo: 'AUX', descripcion: 'Accesorios de prueba', orden: 2, accesorio: true },
      { codigo: 'VACIA', descripcion: 'Familia sin modelos', orden: 3 }],
    estructuras: [
      { codigo: 'MODELO-SINTETICO', descripcion: 'Fijo de prueba', familiaCodigo: '005',
        anchoMm: 1000, altoMm: 1100, nodos: [nodo(1, 1, -1), nodo(2, 5, 1)],
        accesorio: false, relacionadas: {} },
      { codigo: 'AUX-SINTETICO', descripcion: 'Auxiliar de prueba', familiaCodigo: 'AUX',
        anchoMm: 0, altoMm: 0, nodos: [], accesorio: true, relacionadas: { EstructurasLineas: 2 } },
    ],
    disenos: { filasTotales: 2, nodosCatalogo: 2, nodosDocumentoExcluidos: 0, sinFicha: [] },
  }
}

export function escribirCsv(carpeta, tabla, cabecera, filas) {
  const texto = [cabecera, ...filas.map(f => cabecera.map(c => String(f[c] ?? '')))]
    .map(f => f.map(v => JSON.stringify(v)).join(',')).join('\n')
  writeFileSync(join(carpeta, `${tabla}.csv`), `${texto}\n`)
}

export function crearFuenteSintetica() {
  const raiz = mkdtempSync(join(tmpdir(), 'aluminior-inventario-'))
  const carpeta = join(raiz, 'fuente-a')
  mkdirSync(carpeta)
  escribirCsv(carpeta, 'FamiliasEstr', ['Codigo', 'Descripcion', 'OrdenEsc', 'AccesorioSN'], [
    { Codigo: '005', Descripcion: 'Fijos sintéticos', OrdenEsc: '1', AccesorioSN: 'False' },
    { Codigo: 'AUX', Descripcion: 'Auxiliares sintéticos', OrdenEsc: '2', AccesorioSN: 'True' },
  ])
  escribirCsv(carpeta, 'Estructuras',
    ['Codigo', 'Descripcion', 'Familia', 'DisAncho', 'DisAlto', 'AccesorioSN'], [
      { Codigo: 'MODELO-SINTETICO', Descripcion: 'Prueba', Familia: '005', DisAncho: '1.000', DisAlto: '1.100' },
      { Codigo: 'AUX-SINTETICO', Descripcion: 'Auxiliar', Familia: 'AUX', AccesorioSN: 'True' },
    ])
  escribirCsv(carpeta, 'EstructurasDiseño', CAMPOS_DISENO, [
    { Estructura: 'MODELO-SINTETICO', Id: '1', Tipo: '1', ContenidoEn: '-1', TipoMarco: 'NOR' },
    { Estructura: 'MODELO-SINTETICO', Id: '2', Tipo: '5', ContenidoEn: '1' },
    { Estructura: 'MODELO-SINTETICO', TipoDoc: 'P', Id: '99', Tipo: '9', ContenidoEn: '-1' },
    { Estructura: 'SIN-FICHA', Id: '1', Tipo: '1', ContenidoEn: '-1', TipoMarco: 'NOR' },
  ])
  escribirCsv(carpeta, 'EstructurasLineas', ['Estructura', 'Articulo'], [
    { Estructura: 'AUX-SINTETICO', Articulo: 'PIEZA-SINTETICA' },
  ])
  escribirCsv(carpeta, 'EstructurasArticulos', ['Estructura', 'TipoDoc', 'Articulo'], [
    { Estructura: 'MODELO-SINTETICO', Articulo: 'PIEZA-CATALOGO' },
    { Estructura: 'MODELO-SINTETICO', TipoDoc: 'P', Articulo: 'PIEZA-DOCUMENTO' },
  ])
  return { raiz, carpeta }
}
