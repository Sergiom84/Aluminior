param(
  [Parameter(Mandatory=$true)][string]$Copia,
  [Parameter(Mandatory=$true)][string]$Anterior,
  [Parameter(Mandatory=$true)][string]$Destino,
  [switch]$Reanudar,
  [string[]]$ForzarTablas = @()
)

$ErrorActionPreference = 'Stop'
$copiaPath = (Resolve-Path -LiteralPath $Copia).Path
$anteriorPath = (Resolve-Path -LiteralPath $Anterior).Path
if ([IO.Path]::GetFileName($anteriorPath) -ne 'Anterior.mdb') {
  throw 'La referencia debe ser Anterior.mdb; nunca usar aluminio.mdb activo.'
}
if ($copiaPath -eq $anteriorPath -or [IO.Path]::GetFileName($copiaPath) -eq 'aluminio.mdb') {
  throw 'La lectura requiere una copia independiente de Anterior.mdb.'
}
$hash = (Get-FileHash -LiteralPath $copiaPath -Algorithm SHA256).Hash
if ($hash -ne (Get-FileHash -LiteralPath $anteriorPath -Algorithm SHA256).Hash) {
  throw 'La copia no coincide con Anterior.mdb.'
}
$destinoPath = [IO.Path]::GetFullPath($Destino)
if (-not $destinoPath.StartsWith([IO.Path]::GetFullPath('output') + [IO.Path]::DirectorySeparatorChar,
    [StringComparison]::OrdinalIgnoreCase)) {
  throw 'El destino debe estar dentro de output/ (ignorado por Git).'
}
[IO.Directory]::CreateDirectory($destinoPath) | Out-Null

$periodo = 'SELECT Id FROM VFacturas WHERE Fecha >= #2026-01-01# AND Fecha < #2027-01-01#'
$consultas = [ordered]@{
  facturas = "SELECT Id, Fecha, Tarifa, Serie, Subtotal, DescuentoPorc, Descuento, DescuentoPPporc, DescuentoPP, Bruto, BaseImponible, IVAPorc, IVA, RecargoPorc, Recargo, RetencionPorc, Retencion, ImporteTotal, nAlbOrigen, RectificativaSN, DespuntePorc, Despunte FROM VFacturas WHERE Id IN ($periodo)"
  lineas = "SELECT nDoc, nLinea, nEstr, nGrupo, EstructuraSN, GrupoSN, Articulo, Acabado, Cdad, Largo, Ancho, LargoCorte, AnchoCorte, CantidadCorte, Funcion, TipoCorte, nAlbaran, nLinAlb, PVPManualSN, RespetarPrecioSN, DescuentoManualSN, MetrajeManualSN, TarifaManualSN, DescripcionManualSN, DescuentoPorc, Descuento, Descuento2Porc, Coste, Precio, ImporteTotal, VentaTotal, nModulo FROM VFacturasLin WHERE nDoc IN ($periodo)"
  configuraciones = "SELECT nLinId, TipoDoc, nVDoc, nVLinea, Familia1, Familia2, Familia3, Familia4, Conjunto1, Conjunto2, Conjunto3, Conjunto4, nTAcris, DisEspecificoSN, DisHerraje, Vidrio2, HorasAdFabr, HorasColoc FROM VDatosLinEstr WHERE TipoDoc='VFAC' AND nVDoc IN ($periodo)"
  detalle_diseno = "SELECT TipoDoc, nVDoc, nVLinea, nVLinEstr, Componente, Grupo, DisTipoHoja, DisVidrio, DisId, DisIdIt, DisIdRefLargo, DisFRefLargo FROM VDatosLinDetDis WHERE TipoDoc='VFAC' AND nVDoc IN ($periodo)"
  diseno = "SELECT TipoDoc, nDoc, nLinEstr, Estructura, Id, Tipo, TipoHoja, Vidrio, Cota, TipoCorredera FROM EstructurasDiseño WHERE TipoDoc='VFAC' AND nDoc IN ($periodo)"
  opciones_herraje = "SELECT TipoDoc, nDoc, nLinEstr, Conjunto, nOpcion, SelecSN FROM VOpcionesHerraje WHERE TipoDoc='VFAC' AND nDoc IN ($periodo)"
  cerramientos = "SELECT id, TipoDoc, nDoc, nLinGrupo, Ancho, Alto FROM VCerramientos WHERE TipoDoc='VFAC' AND nDoc IN ($periodo)"
  uniones = "SELECT nCerr, CodEstr, EsUnionSN, UnionVH, UGrosor, ULongitud FROM VCerramientosLin WHERE nCerr IN (SELECT id FROM VCerramientos WHERE TipoDoc='VFAC' AND nDoc IN ($periodo))"
  catalogo_estructuras = 'SELECT Codigo, Familia, TipoEstructura, desactivadoSN FROM Estructuras'
  catalogo_series = 'SELECT Serie FROM ConfigSeries'
  asociaciones_estructura_serie = 'SELECT Estructura, Serie, SerieUnir FROM EstructurasSeriesAsoc'
  catalogo_acabados = 'SELECT Codigo FROM Acabados'
  catalogo_acristalamiento = 'SELECT Codigo FROM TAcristalamiento'
  catalogo_tipos_hoja = 'SELECT TipoSerie, TipoHoja FROM ConfigSeriesTipoHojaDesc'
  albaranes = "SELECT Id, Numero, nDocOrigen, TipoOrigen FROM VAlbaranes WHERE Numero IN (SELECT nAlbaran FROM VFacturasLin WHERE nDoc IN ($periodo))"
  lineas_albaran = ''
  presupuestos = ''
  lineas_presupuesto = ''
}

function CampoCsv($valor) {
  if ($null -eq $valor -or $valor -is [DBNull]) { return '' }
  $texto = [Convert]::ToString($valor, [Globalization.CultureInfo]::InvariantCulture)
  return '"' + $texto.Replace('"', '""') + '"'
}

$conexion = New-Object -ComObject ADODB.Connection
$conexion.Mode = 1
$conexion.CommandTimeout = 60
try {
  $conexion.Open("Provider=Microsoft.ACE.OLEDB.12.0;Data Source=$copiaPath;Mode=Read;")
  $recuentos = [ordered]@{}
  $manifiestoPath = [IO.Path]::Combine($destinoPath, 'manifiesto.json')
  $anteriorManifiesto = if ($Reanudar -and [IO.File]::Exists($manifiestoPath)) {
    Get-Content -LiteralPath $manifiestoPath -Raw | ConvertFrom-Json
  } else { $null }
  if ($anteriorManifiesto -and $anteriorManifiesto.fuenteSha256 -ne $hash) {
    throw 'La extracción previa corresponde a otra copia.'
  }
  foreach ($nombre in $consultas.Keys) {
    $archivo = [IO.Path]::Combine($destinoPath, "$nombre.csv")
    if ($anteriorManifiesto -and $nombre -notin $ForzarTablas -and
      $null -ne $anteriorManifiesto.recuentos.$nombre -and
      [IO.File]::Exists($archivo)) {
      $recuentos[$nombre] = [int]$anteriorManifiesto.recuentos.$nombre
      continue
    }
    $consulta = $consultas[$nombre]
    if ($nombre -eq 'lineas_albaran') {
      $ids = @(Import-Csv -LiteralPath ([IO.Path]::Combine($destinoPath, 'albaranes.csv')) |
        ForEach-Object { $_.Id })
      if ($ids.Count -eq 0 -or @($ids | Where-Object { $_ -notmatch '^\d+$' }).Count) {
        throw 'IDs internos de albarán ausentes o inesperados.'
      }
      $consulta = 'SELECT nDoc, nLinea, nLinOrig, nDocOrigen, TipoDocOrig, Articulo, EstructuraSN FROM VAlbaranesLin WHERE nDoc IN (' + ($ids -join ',') + ')'
    }
    if ($nombre -eq 'presupuestos') {
      $numeros = @(Import-Csv -LiteralPath ([IO.Path]::Combine($destinoPath, 'albaranes.csv')) |
        ForEach-Object { $_.nDocOrigen } | Where-Object { $_ } | Sort-Object -Unique)
      if ($numeros.Count -eq 0 -or @($numeros | Where-Object { $_ -notmatch '^\d+$' }).Count) {
        throw 'Números de presupuesto de origen ausentes o inesperados.'
      }
      $consulta = 'SELECT Id, Numero, Fecha, Tarifa FROM VPresupuestos WHERE Numero IN (' + (($numeros | ForEach-Object { "'$_'" }) -join ',') + ')'
    }
    if ($nombre -eq 'lineas_presupuesto') {
      $ids = @(Import-Csv -LiteralPath ([IO.Path]::Combine($destinoPath, 'presupuestos.csv')) |
        ForEach-Object { $_.Id })
      if ($ids.Count -eq 0 -or @($ids | Where-Object { $_ -notmatch '^\d+$' }).Count) {
        throw 'IDs internos de presupuesto ausentes o inesperados.'
      }
      $consulta = 'SELECT nDoc, nLinea, nEstr, EstructuraSN, Articulo, Largo, Ancho, Cdad, Precio, ImporteTotal FROM VPresupuestosLin WHERE nDoc IN (' + ($ids -join ',') + ')'
    }
    $rs = $conexion.Execute($consulta)
    $escritor = New-Object IO.StreamWriter($archivo, $false, (New-Object Text.UTF8Encoding($false)))
    $contador = 0
    try {
      $campos = @($rs.Fields | ForEach-Object { $_.Name })
      $escritor.WriteLine(($campos | ForEach-Object { CampoCsv $_ }) -join ',')
      while (-not $rs.EOF) {
        $valores = for ($i = 0; $i -lt $rs.Fields.Count; $i++) { CampoCsv $rs.Fields.Item($i).Value }
        $escritor.WriteLine($valores -join ',')
        $contador++
        $rs.MoveNext()
      }
    } finally {
      $escritor.Dispose()
      $rs.Close()
    }
    $recuentos[$nombre] = $contador
  }
  [pscustomobject]@{ fuenteSha256=$hash; recuentos=$recuentos } |
    ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifiestoPath -Encoding utf8
  $recuentos | Format-Table -AutoSize
} finally {
  if ($conexion.State -eq 1) { $conexion.Close() }
}
