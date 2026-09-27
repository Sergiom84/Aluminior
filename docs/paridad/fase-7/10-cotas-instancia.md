# Cotas de instancia verificadas

27/09/2026. Continuación de [08](08-cortes-tres-hojas.md) y
[09](09-continuacion-local.md). Solo CSV existentes y PostgreSQL local de QA.
No se consultaron MDB, bases remotas ni fuentes originales.

## Entrada y trazabilidad

El contraste incorpora medidas elegidas mediante:

```text
VMedidasDA (TipoDoc, nDoc, nLinEstr, Estructura, nDA, Medida)
  → EstructurasDA (Estructura, nDA, SimboloDA)
  → EntradaLineaCatalogo.cotas
```

`scripts/lib/cotas-instancia.ts` conserva tipo documental, documento, línea,
estructura, nDA, símbolo normalizado, valor original, valor numérico y números
de registro de ambas tablas (cabecera = registro 1). La traza por documento
solo se escribe en `output/`, fuera de Git. No se usan `MedidaStd`, cotas de
diseño ni dimensiones de piezas guardadas para completar entradas.

El lector rechaza identidad incompleta, estructura incompatible, nDA sin
definición, símbolos ambiguos o reservados (`A`, `L`, `REF`), valores vacíos o
no finitos y cotas duplicadas incompatibles. Duplicados compatibles conservan
todas las referencias. Un error invalida el conjunto completo; nunca se
entrega un conjunto parcial ni se transforma la ausencia en cero. Cero
explícito sí es una entrada válida. Si no hay entrada, el motor mantiene su
bloqueo por variable ausente cuando la plantilla la requiere.

## Resultado ejecutado

En las mismas 348 líneas no específicas, ocho requerían FI, TD o F:

| Resultado de esta unidad | Líneas |
|---|---:|
| Entrada directa de factura localizada y aplicada | 6 |
| Material completo coincidente, excluida mano de obra | 5 |
| Entrada aplicada, con regla material independiente pendiente | 1 |
| Sin entrada directa; candidato de presupuesto no aplicado | 2 |
| Importe completamente calculable entre las seis directas | 0 |

Los cinco casos de material coincidente suman **311 filas**, comparadas con
artículo, cantidad, multiplicidad y ambas dimensiones aplicables a 0,1 mm.
La sexta línea (`GMA350|2O+1OFI`) ya dispone de FI/TD, pero mantiene la regla
de división con grupo B pendiente. Las seis mantienen incidencias de mano
de obra por componente/grupo aún no soportadas. Eliminar la falta de cota
no equivale a cerrar el despiece completo, el precio ni la fabricación.

Los dos casos sin cota directa sí tienen FI en el presupuesto de origen.
`scripts/verificar-cotas-instancia.ts` reconstruye la cadena con claves
completas y exige unicidad, misma estructura y mismas dimensiones de entrada:

```text
factura.nAlbaran → albaranes.Numero/Id
  → lineas_albaran(nDoc = Id, nLinea = factura.nLinAlb)
  → TipoDocOrig = VPRES, nDocOrigen, nLinOrig
  → presupuestos.Numero/Id
  → lineas_presupuesto(nDoc = Id, nLinea = nLinOrig)
  → VMedidasDA de VPRES → EstructurasDA
```

La distinción entre número comercial e Id interno evita enlazar el documento
incorrecto. Cinco casos con cota directa también tienen esta cadena y sus
cotas coinciden. En los otros dos, la cadena acredita procedencia, pero no
demuestra que FI se conservara al facturar: podría haberse editado sin cambiar
ancho/alto. Los candidatos se registran y **no se aplican**. Para desbloquearlos
falta una entrada contemporánea de factura/albarán o evidencia explícita del
comportamiento de copia y edición. No se infiere FI de sus cortes.

## Adaptador y comprobación PostgreSQL

`EntradaValoracionEstructura.cotas` acepta las mismas entradas explícitas.
El caso de uso valida finitud, símbolos reservados y duplicados antes de leer
la base; el adaptador entrega las cotas al motor. Si falta el catálogo nuevo,
una entrada con cotas se rechaza en lugar de pasar a una vía que las ignore.
No se cambia el formulario ni la persistencia. La guarda existente de FI
del configurador permanece vigente: esta unidad no declara valorable ese
flujo completo.

`verificar-motor-catalogo-db.ts` pasa las cotas del detalle CSV al caso de uso.
Con las mismas entradas: 310 importes iguales, 16 bloqueos, una línea sin
plantilla rechazada y cero diferencias; 21 líneas con horas manuales se
excluyen según el contrato anterior. Igualdad de bloqueos no acredita precio.

Durante la comprobación de C2 se cerraron dos pérdidas del adaptador GRUPO:
opciones ausentes conservan los valores de catálogo; una selección vacía
explícita sigue desmarcando las visibles. Los avisos con precio calculable
se conservan como diagnóstico VENTA no bloqueante y llegan al aviso de línea.
No cambian el precio ni requieren migración. Su prueba compara estructura y
GRUPO con la misma entrada, incluidos precio, artículos y opciones.

## Reproducción y pruebas

Desde la raíz:

```powershell
npx vitest run scripts/lib/cotas-instancia.test.ts
npx tsx scripts/verificar-cotas-instancia.ts export_datos/EMP0016 output/facturas-2026 output/cotas-instancia-20260927
npx tsx scripts/contrastar-despiece-facturas.ts export_datos/EMP0016 output/facturas-2026 output/contraste-cotas-20260927
npx tsx scripts/verificar-motor-catalogo-db.ts output/facturas-2026 output/contraste-cotas-20260927/detalle.json aluminior_real_test
npx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions scripts/lib/cotas-instancia.ts scripts/lib/cotas-instancia.test.ts scripts/verificar-cotas-instancia.ts scripts/contrastar-despiece-facturas.ts
npm run -w @aluminior/web typecheck
```

Desde `packages/web`, sobre la base efímera de pruebas:

```powershell
npx vitest run app/dashboard/presupuestos/_lib/estructuras/cotas-entrada.test.ts app/dashboard/presupuestos/_lib/estructuras/catalogo-despiece/valorar-con-catalogo.integracion.test.ts app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.integracion.test.ts
```

35 pruebas del lector y cortes sintéticos; 47 de validación, adaptador y
cerramientos. El ensayo de FI comprueba perfiles y ambos vidrios para dos
entradas distintas, además del bloqueo cuando no se aporta cota. Typecheck
focal y web aprobados. Se corrigió un import de tipo previo del lector CSV:
`OpcionCatalogo` se obtiene de la entrada pública de asociaciones.

Pruebas causales medidas y restauradas:

- Sin entregar las cotas leídas: 5 fallos de las 35 pruebas del lector.
- Sin pasar cotas del adaptador al core: 1 fallo de las 11 de integración.
- Restituyendo `[]` cuando el GRUPO no tiene selección: 1 fallo de las 11.
- Omitiendo el aviso no bloqueante del GRUPO: 1 fallo de las 11.

Los originales se restauraron en `finally` y las pruebas finales se ejecutan
sobre los archivos restaurados. Ninguna prueba se debilitó ni se omitió para
cerrar la unidad. Las suites y compilación globales se coordinan por separado.

## Procedencia de fuentes de entrada

El informe local registra también hashes de plantilla, descuentos, líneas,
configuraciones y opciones. SHA-256 de las fuentes nuevas y su cadena:

| CSV | SHA-256 |
|---|---|
| `export_datos/EMP0016/VMedidasDA.csv` | `b56a59130b6838b5bb7ac0304fd012e92d9f2e431e962ae2423742d2a4eed6d0` |
| `export_datos/EMP0016/EstructurasDA.csv` | `9049fdff45c4a568b06e9d0c0c7f478458cc45df57bfd8d546125473cfe26aca` |
| `output/facturas-2026/albaranes.csv` | `9a3114d91b1e6d7cc16bcdd75d82065c2de2d4d523717d2834e589b624e10648` |
| `output/facturas-2026/lineas_albaran.csv` | `105317527fccf5d07ad9d13048f1b51aeda3bfc9f21d969d5dcf744cb267375a` |
| `output/facturas-2026/presupuestos.csv` | `54042a8b828804c50beca953c66027deef4bd52e11d4717bbf29362420052670` |
| `output/facturas-2026/lineas_presupuesto.csv` | `2451af805f6a569e96bbf3280ac5a6da9d20367a9e2744ceaa977f33dd927eaa` |

No se versionan CSV, identificadores de documentos, medidas de clientes,
salidas detalladas ni credenciales.
