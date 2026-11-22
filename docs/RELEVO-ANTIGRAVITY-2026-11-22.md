# Relevo a Antigravity — 22/11/2026

Documento de traspaso desde la sesión de Claude Code. Léelo entero antes de tocar nada. Si algo de aquí contradice `AGENTS.md`, `docs/ESTADO-ACTUAL.md` o el código, manda el código y se reporta la contradicción.

## 0. Reglas que no se negocian

1. Carpeta: `C:\Users\sergi\Desktop\Aplicaciones\Aluminior`, rama `main`. Antes de nada: `git status --short --branch` y `git log --oneline -5`.
2. Lee `AGENTS.md` (contrato del proyecto) y `docs/ESTADO-ACTUAL.md` (solo las entradas de arriba, hasta la del 18/11).
3. Idioma de respuesta: español con acentos. Sin emojis en la interfaz ni en textos de usuario.
4. No publiques (`git push`), no despliegues, no toques Render ni Supabase sin que Sergio lo pida en ese momento. El último push fue `972a4bb`; `7ad002e` (solo documentación) está commiteado en local y sin subir.
5. Nunca versiones datos reales: `export_datos/`, `output/`, `.env` y los MDB están ignorados por Git. No imprimas valores del `.env`.
6. Un arreglo de motor exige: prueba que falle sin el arreglo, control negativo (revertir y comprobar que cae), `npm run typecheck`, `npm run check:architecture` y la prueba del módulo. No debilites pruebas existentes para que pasen: si una cae, tu cambio es el que está mal (me pasó el 22/11 y se corrigió el arreglo, no la prueba).
7. Después de tres commits seguidos en la misma tarea, para y revisa el conjunto.
8. Documenta cada entrega en `docs/ESTADO-ACTUAL.md` (entrada fechada arriba, con evidencia y lo que queda) y no dejes instrucciones que mandan repetir trabajo hecho.

## 1. Estado al cierre (22/11/2026)

- `main` en local: `7ad002e` (docs). `origin/main` y Render live: `972a4bb`.
- `972a4bb` arregla el herraje del `2OFI` dentro de un `GRUPO` (−73,23 €). Detalle:
  - Causa: la pestaña `Opc.Herraje` de un `GRUPO` ofrece solo los conjuntos de una estructura (`ELEGANTPVC` y `HU529`). `seleccionGuardada` (`packages/web/app/dashboard/presupuestos/_lib/estructuras/catalogo-despiece/valorar-con-catalogo.ts`) dejaba `HU532`, el conjunto del `2OFI`, entero desmarcado.
  - Arreglo: si el formulario marcó otros conjuntos pero de uno ninguno, ese conjunto usa el catálogo (`SelecDefSN`). Una selección totalmente vacía sigue significando «nada marcado» (lo exigen dos pruebas de integración existentes).
  - Límite conocido: desmarcar por completo un conjunto mientras otro conserva marcas es indistinguible de no haberlo ofrecido.
  - Prueba nueva: `seleccion-guardada.test.ts` (4 casos; sin el arreglo falla 1).
  - Verificado en producción: presupuesto `260002` (corresponde al `260472` de Productor), línea `GRUPO` de 2.848,06 € a 2.921,29 €, 262 piezas en vez de 240, total 15.945,22 €. Las líneas guardadas antes del despliegue conservan su importe hasta reabrirlas y guardarlas.
- Verificaciones del 22/11: pruebas de `catalogo-despiece` y `estructuras` 257 en verde; web `presupuestos` 1022 pruebas con los 2 fallos de mi primera versión ya corregidos; tipos y arquitectura limpios. No ejecuté core/db/etl (no se tocaron).

## 2. Hallazgos del 22/11 que no debes repetir

- `Desktop\MIX\aluminio17.mdb` es idéntico (SHA-256 `6ed9ceae…e8f6`) a la copia de EMP0017 del 13/11 que ya está en `export_datos/contraste-2026-11/fuentes/EMP0017/copia-aluminio-20261113.mdb`. No aporta datos nuevos.
- Los 6 PDF de `Desktop\MIX\Productor\Aluminio\Presupuestos\Sin precio\limpios_v2_*.pdf` ya se contrastaron el 18/11 (presupuestos `260001`–`260007`, «PRUEBA CLAUDE»): de 28 líneas, 14 exactas. Detalle en `docs/ESTADO-ACTUAL.md` (entrada del 18/11). Los PDF con precio de Productor están en `...\Presupuestos\Precio\`.
- La EMP0016 que abre Productor en este portátil (`Base datos Anuales\EMP0016\aluminio.mdb`) es una versión vieja: 439 presupuestos, hasta el `260417` (julio). La copia con 613 presupuestos (hasta `260592`) es `Desktop\MIX\Anterior.mdb`. Por eso los casos `260472`, `260465`, `260487`, etc. no se pueden abrir en Productor aquí.
- En Productor creé a mano el presupuesto `260418` («PRUEBA CLAUDE», serie A, forma de pago 01, vacío). El diseñador de cerramientos quedó abierto con un `1OFI` sin guardar y campos Ancho/Alto corruptos. Para limpiarlo: cerrar el diseñador sin aceptar; si pide guardar el documento, es el `260418` vacío.

## 3. Cómo se trabaja con Productor (importante: no te fíes de la visión)

Productor (`aluminioApp.exe`) responde con retraso de varios segundos y pierde o desordena pulsaciones. Con visión se atascó al montar un `GRUPO` (campos de medida que anexan texto en vez de reemplazarlo; un `L` tecleado abrió la lista de Artículos). Reglas:

1. Prefiere deducir desde datos: MDB de solo lectura (sección 4) y CSV en `export_datos/EMP0016/`. Es más rápido, exacto y repetible.
2. Si hace falta observar Productor, pide a Sergio que monte el caso a mano y tú solo lees la pantalla y los datos. Entrégale una ficha exacta: serie, acabado, vidrio, medidas por módulo, opciones.
3. Si aun así lo manejas tú: una acción, espera 5 s, captura, verifica; nunca encadenes pulsaciones. Verifica cada campo tras teclearlo (los de medida no se reemplazan con Ctrl+A: usa el panel `Elemento seleccionado`). No pulses nada en Configuración ni en Utilidades (SQL, copia, compactar, actualizar precios).
4. `Cargar un Cerramiento` por código solo carga cerramientos guardados, no plantillas del catálogo. Una plantilla se coloca arrastrándola desde el catálogo inferior al lienzo (por ejemplo `1OFI`: familia `OSCILOBATIENTES`, página 3, segunda miniatura).
5. Al crear un presupuesto nuevo, Productor no deja salir de la ficha sin guardar y exige `F.Pago`. Una ficha nueva no se descarta con «Cerrar»: guarda con forma de pago `01` o usa el icono de papelera (pregunta «¿Desea eliminar este Presupuesto?»; solo si está vacío y es tuyo).
6. Guía de la interfaz: `docs/paridad/GUIA-DISENADOR-PRODUCTOR.md`. Operativa del equipo: `docs/CONTINUAR-EN-WINDOWS.md` §0.

## 4. Herramientas para deducir desde el MDB (solo lectura, sobre copia)

Lectura de Access: PowerShell de 64 bits (`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`) con el driver `Microsoft Access Driver (*.mdb, *.accdb)`. Nunca sobre `aluminio.mdb` activo: copia a temp o usa `Desktop\MIX\Anterior.mdb` con `ReadOnly=1`. Llama siempre con `-File` (desde Git Bash `-Command` rompe los `$`). Ayudante mínimo `q.ps1`:

```powershell
param([string]$mdb,[string]$sql)
$cs="Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=$mdb;ReadOnly=1;"
$c=New-Object System.Data.Odbc.OdbcConnection($cs); $c.Open()
$cmd=$c.CreateCommand(); $cmd.CommandText=$sql
$r=$cmd.ExecuteReader()
while($r.Read()){ $o=@(); for($i=0;$i -lt $r.FieldCount;$i++){ $o+=("{0}={1}" -f $r.GetName($i),$r.GetValue($i)) }; $o -join " | " }
$c.Close()
```

Notas de esquema (verificadas el 22/11):
- `VPresupuestos`: `Id`, `Numero` (texto, usa `LIKE` o comillas), `Fecha`.
- `VPresupuestosLin`: `nLinea`, `nDoc` (= `VPresupuestos.Id`), `GrupoSN`, `nGrupo` (= `nLinea` del GRUPO), `Articulo`, `Acabado`, `Cdad`, `Ancho`, `Largo`, `Precio`.
- `VDatosLinEstr`: clave `nVDoc`/`nVLinea`; `Conjunto1..4` (serie, vidrio…), `HorasColoc`, `DisEspecificoSN`.
- `VOpcionesHerraje`: `nDoc`, `nLinEstr`, `Conjunto`, `nOpcion`, `SelecSN`. Si un módulo no tiene filas, Productor usó los valores por defecto.
- Los nombres de columna que no existan dan el error engañoso «Pocos parámetros. Se esperaba 1»: lista columnas con `SELECT TOP 1 *`.
- Catálogo exportado: `export_datos/EMP0016/*.csv` (`ConjuntosOpcionesHerraje.csv`, `ConjuntosAsoc.csv`, `EstructurasArticulos.csv`…).

## 5. Banco de contraste local (valorar GRUPO reales con el motor de Aluminior)

Solo Postgres local en `127.0.0.1:55433`, base `aluminior_real_test` (la herramienta rechaza cualquier otro destino).

```powershell
docker start aluminior_pg_test
# solo si la base no existe (se perdió el 22/11 y la recreé):
docker exec aluminior_pg_test psql -U aluminior -d aluminior_test -c "CREATE DATABASE aluminior_real_test"
node --import tsx scripts/banco-contraste.ts preparar --salida export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261113 --origen export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261113/catalogo
node --import tsx scripts/contraste-presupuestos.ts --salida export_datos/contraste-2026-11/EMP0016-copia-aluminio-20261113
```

- La base `aluminior_real_test` ya está cargada ahora mismo con la copia del 13/11 (si el contenedor sigue vivo, salta el `preparar`). Los resultados quedan en `contraste-grupos.json` y `contraste-resumen.json` de esa carpeta. Copias previas en `export_datos/contraste-2026-11/tmp/respaldo-22-11/`.
- `preparar` sobre una base ya cargada falla a propósito («La base ya tiene catálogo»).
- Para probar una hipótesis sobre un caso: carga `banco.json`, localiza el GRUPO (`caso.padre.nDoc`), cambia en memoria `opciones` y `elementos[].opciones` (en un GRUPO el servicio lee las opciones de los elementos, no de la raíz) y llama a `contrastarGrupos(db, [caso], () => false, leerPlantillasDocumento(D))` desde un script temporal en `scripts/` que borras al terminar. Siempre con un control negativo que demuestre que tu cambio llega al motor (en el caso del herraje, marcar solo `ELEGANTPVC|13` daba −174,55 €).
- Resultados de referencia al 22/11 (13/11 copia, motor `972a4bb`): `caso-03038` (nDoc `1274`, 260472) coincide a 2.921,29 €.

Pruebas de la web (necesitan Postgres de pruebas en `127.0.0.1:55433`, base `aluminior_test`, contenedor `aluminior_pg_test`): ejecuta en serie y sin definir `TEST_DATABASE_URL`.

```powershell
cd packages/web
npx vitest run --maxWorkers=1 app/dashboard/presupuestos/_lib/estructuras
```

Otros gates: `npm run typecheck`, `npm run check:architecture`. En paralelo los tests de integración se bloquean entre sí y fallan al azar.

## 6. Qué queda por hacer, en orden

1. **Subir la nota de estado** (`7ad002e`) solo si Sergio lo confirma: `git push origin main`. Render despliega solo (`srv-d9dprl741pts73dlrpd0`); comprobar con `GET https://api.render.com/v1/services/<id>/deploys?limit=1` usando `RENDER_API` del `.env` sin imprimirla; `/login` debe dar 200.
2. **`1O+1F+1O` con dos travesaños `VI` (−5,93 €).** Es una regla de `Diseño V3`: el módulo no admite Diseño V3 y la diferencia es de 5,93 €. Localiza el caso en `docs/AUDITORIA-PRESUPUESTOS-PDF-2026-11-14.md` y en `contraste-grupos.json` (busca desviación −5,93), léelo desde `VPresupuestosLin`/`EstructurasDiseño`/`EstructurasArticulos` de `Anterior.mdb`, y propone la regla antes de implementarla. Si hace falta una observación en Productor, pide a Sergio que la haga.
3. **`PSM004` fuera de tabla.** Hoy la pieza vale 0 € con aviso; Productor guarda además `PVPManualSN` y el precio manual de la línea padre (en el `260465`: 333,00 € por unidad, ×2 = 666,00 €, ver auditoría 3.5). Falta decidir si el precio manual debe entrar al guardar; no hay regla para inventarlo.
4. **`260001` y `260004` sin valorar:** `GM487`/`GM492` (causa cerrada, sin regla: `docs/paridad/CAUSAS-CERRADAS.md`) y `PSM004`. No tocar `GM487`/`GM492`.
5. **Mejora Después:** los importes con `Intl` `es-ES` no agrupan miles en cifras de cuatro dígitos («7637,52 €» junto a «15.768,01 €»); Productor imprime «6.312,00». Local, sin migraciones.
6. **Limpieza opcional en Productor:** cerrar el diseñador y el `260418` (sección 2).
7. Pendientes más antiguos que siguen abiertos (ver `ROADMAP-PARIDAD-PRODUCTOR.md`): aceptación comercial del PDF (P.2) con el titular, E1 (despunte, necesita mochila y el equipo del titular), E7.

## 7. Qué NO hacer

- No repetir: el contraste de los 6 PDF, el herraje del `2OFI`, el editor `Diseño V3` ni el generador de plantillas, `Actualizar todas las uniones`, el acabado por elemento.
- No ejecutar el importador completo, cargas ni migraciones remotas.
- No cambiar `DATABASE_URL` de Render ni el catálogo/tarifas en producción.
- No operar Utilidades ni Configuración de Productor, ni registrar DLL/OCX en este equipo.
- No inventar reglas: sin evidencia (MDB, observación, PDF) se documenta como hipótesis y se pide decisión.
