# Vuelca una consulta de una COPIA de la MDB a TSV, en solo lectura (PowerShell x86, Jet).
# Uso: powershell -File scripts/volcar-tabla-mdb.ps1 -Db <copia.mdb> -Sql "SELECT ..." -Out export_datos/<extraccion>/<tabla>.tsv
param([string]$Db, [string]$Sql, [string]$Out)
$ErrorActionPreference = "Stop"
$c = New-Object System.Data.OleDb.OleDbConnection "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=$Db;Mode=Read"
$c.Open()
$cmd = $c.CreateCommand(); $cmd.CommandText = $Sql
$r = $cmd.ExecuteReader()
$sw = New-Object System.IO.StreamWriter($Out, $false, (New-Object System.Text.UTF8Encoding $false))
$n = $r.FieldCount; $names = @(); for ($i=0;$i -lt $n;$i++){ $names += $r.GetName($i) }
$sw.WriteLine(($names -join "`t"))
$k=0
while ($r.Read()) {
  $vals = New-Object string[] $n
  for ($i=0;$i -lt $n;$i++){ if ($r.IsDBNull($i)) { $vals[$i] = "" } else { $vals[$i] = ([string]$r.GetValue($i)) -replace "[`t`r`n]"," " } }
  $sw.WriteLine(($vals -join "`t")); $k++
}
$sw.Close(); $c.Close(); Write-Output "$k filas"
