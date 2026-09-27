# GM60: selección ya disponible y guardas de integridad

27/09/2026. Investigación local sobre CSV y manual copiados. Sin escribir en
Productor, bases originales o Supabase. Rectifica el pendiente «tabla
automática ELEGANTPVC GM60» del relevo de la fase 7.

## Resultado

**GM60 no necesita un algoritmo nuevo para seleccionar sus junquillos.**
`Conjuntos` asigna GM60 tanto a `TablaHojas` como a `TablaFijos` de ELEGANTPVC.
`TAcristalamientoLin` contiene 19 filas de GM60, todas con posición `*`.
El motor ya las consume como cualquier tabla persistida.

El CHM 5.1.2.12.5.1, apartado «Tabla automática», describe una operación
explícita de generación: sustituye las filas existentes usando galce máximo,
grosores de juntas y lista de junquillos. Que la tabla haya sido generada así
no obliga a regenerarla al presupuestar. La cabecera GM60 conserva galce
49 mm, lista GM07 y sus juntas; las combinaciones resultantes ya están
guardadas. No se ha implementado ni acreditado una regeneración general.

## Contraste ejecutado

Comando reproducible, sin conexiones, escrituras ni datos identificables en
la salida:

```powershell
node node_modules/tsx/dist/cli.mjs scripts/verificar-acristalamiento-gm60.ts
```

El script usa catálogo y grosor del vidrio de la configuración como entrada.
El despiece de la factura sirve solo de oráculo. Para identificar sus
junquillos y juntas, recorre los códigos de **todas** las tablas de
acristalamiento, no únicamente los códigos que espera de GM60. Así detecta
también la selección de artículos de otra tabla dentro de ese universo.
Las dimensiones y descuentos neutros aíslan la selección de artículos;
este ensayo no acredita medidas, cantidades, metraje ni importes.

De 169 líneas ELEGANTPVC no específicas, 42 no tienen acristalamiento
identificado en el oráculo y quedan fuera del contraste. Las otras **127/127**
coinciden en la selección completa de junquillo y ambas juntas:

| Grosor de vidrio | Umbral elegido de la tabla | Junquillo | Junta exterior | Junta interior | Líneas exactas |
|---|---|---|---|---|---:|
| 16 mm | 17,5 mm | GM8624 | GM4057 | GM4089 | 6/6 |
| 22 mm | 24,5 mm | GM8825 | GM4057 | GM4091 | 1/1 |
| 28 mm | 28,5 mm | GM8827 | GM4057 | GM4091 | 120/120 |

No se extrapola esta muestra a otros grosores, tablas por posición,
configuraciones modificadas o todos los artículos posibles de Productor.
El contraste falla si no hay filas de catálogo o casos contrastables; un
conjunto vacío no se registra como paridad. Los bloqueos de cortes, cotas
y mano de obra son responsabilidades distintas de esta selección.

## Corrección implementada en el core

Se identificaron contraejemplos sintéticos en la selección anterior:

- Dos filas del menor grosor aplicable, con distinto junquillo o junta,
  producían piezas diferentes según el orden recibido.
- Un vidrio de grosor cero o negativo podía seleccionar una combinación.
- Una fila con grosor no finito o negativo podía ignorarse silenciosamente
  o actuar como cobertura ilimitada.

`acristalarVidrio` ahora bloquea esos datos con incidencia y sin piezas.
Las filas repetidas equivalentes siguen siendo válidas; `0` y ausencia
representan el mismo artículo omitido. La ambigüedad de un grosor distinto
del seleccionado no invalida una selección inequívoca. La API, el ETL y
las tablas de PostgreSQL no han cambiado.

Pruebas ejecutadas: 15 tests de acristalamiento aprobados y typecheck del
core aprobado. Las 12 pruebas nuevas se ejecutaron también contra una copia
aislada de la función anterior: **8 fallaron y 4 pasaron**. No se revirtió
el árbol compartido. Las dos guardas ya existentes para NaN/infinito de
vidrio cuentan como aprobadas en ese control, no como regresiones nuevas.
El contraste 127/127 se repitió tras la corrección.

## Fuentes y procedencia

Catálogo: `export_datos/EMP0016`, exportación de la copia de Anterior descrita
en [fase 7/02](02-investigacion-fuentes-2026-09-27.md). Oráculo:
`output/facturas-2026`. Los CSV y el detalle local permanecen ignorados.
El script vuelve a calcular los hashes de las fuentes de cálculo/oráculo.

| Archivo | SHA-256 |
|---|---|
| `TAcristalamiento.csv` | `2be257056bb4fcbdca3efbdbbff1edd12e09533bb8887dff8e4d90489d5c134f` |
| `TAcristalamientoLin.csv` | `b5e0111c3d1debdac23a8b163f05dfd8574846d72ea18f9f491aacd0d5c78d11` |
| `TAcrisLstJunqLin.csv` | `ce4713b5d49383478eac28dff745ef2714a8eaf274b1cbd5a00e0c6763ca3f1e` |
| `Articulos.csv` | `a3769ae95a8f3cd83de81f24c70b017a4c4e65d5106bf16159c8cb8bd388d74f` |
| `Conjuntos.csv` | `bba3c9580ca1a8e17bfdb0394bc9bc7b1a294ad25a5ad4deb546d5f74ee392d6` |
| `facturas-2026/lineas.csv` | `0adc49826e0b5fd74589a5be94e340abf26bec6a6139b695a51cc651ffb7a06d` |
| `facturas-2026/configuraciones.csv` | `8cdb045457e8ac46aca8aae7f66e35d061ff9912442339e1fa47095fa944b6b1` |
| CHM extraído: `5_1_2_12_5_1_tabla_manual.htm` | `52ed4f1136ad5287a2f10c298c8ee9d34b78c7cdf060b8309d1a5ed671708a18` |

## Pendientes corregidos

- **Ahora:** concentrar la implementación en cotas/divisiones de huecos y
  discrepancias que el contraste sí demuestra. GM60 dispone de selección.
- **Después:** regeneración editable de tablas, variantes por posición y
  auxiliares de cabecera, cuando exista contrato de producto y evidencia de
  cada modalidad.
- No se necesita migración nueva para esta corrección ni acceso remoto.
