# Mantenimiento y miniaturas de presupuestos — 09/10/2026

Estado: publicado y verificado el 09/10/2026. Registro de tareas:
[roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md), S1 y A2. Entrada:
[estado](../ESTADO-ACTUAL.md). Este informe conserva evidencia, no otro backlog.

## Alcance

Continuación autorizada por Sergio de las mejoras propuestas en la auditoría,
con Codex coordinando tres agentes. Rama `codex/mantenimiento-dependencias`
desde `11a8d7c`, worktree `/Users/sergio/.codex/worktrees/auditoria-presupuestos/Aluminior`.
Los dos commits anteriores de tarifas siguen fuera. Producción al inicio:
`f6d5bcd`, sin atribuir a producción los cambios locales de esta continuación.

S1 actualiza dependencias vulnerables con las versiones corregidas compatibles
más pequeñas; A2 corrige la miniatura de una línea GRUPO. No incluye cambios
al motor de valoración, tarifas, datos reales, migraciones ni cargas remotas.

## Decisión de producto y evidencia

- [RECON-CERRAMIENTOS, §4 quater](RECON-CERRAMIENTOS.md#4-quater-resultado-en-el-presupuesto)
  documenta una línea GRUPO con miniatura del conjunto. La arquitectura conserva
  una única línea y su configuración agregada. El componente web actual dibujaba
  exclusivamente `configuracion.modulos[0]` y deformaba las proporciones usando
  la medida de plantilla en modo compacto. Se reutiliza geometría existente.
- No se implantará un filtro de «compatibilidad» basado en los 97 pares del
  banco: la [matriz](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md) dice explícitamente
  que no es una matriz de compatibilidad. Tener plantilla y parámetros no prueba
  receta completa, precio ni unión válida. Esa mejora requiere evidencia adicional.
- No se repiten la extracción del catálogo ni la investigación E1. El dibujo
  de una configuración guardada no acredita fabricación ni paridad económica.

## Aviso posterior anunciado por Next.js

El [anuncio oficial del 08/10](https://nextjs.org/blog/upcoming-nextjs-security-update-october-2026)
prevé una actualización extraordinaria el **14/10/2026** para vulnerabilidades
de dependencias. A 09/10 no publica rangos afectados, detalle completo ni
mitigación específica. No permite concluir que esta app esté afectada ni que
la actualización disponible hoy resuelva ese aviso. Un `npm audit` sin alertas
sólo cubrirá el inventario publicado consultado; S2 conserva la revisión del
anuncio y sus versiones cuando se publiquen. No se ha creado un seguimiento
automático ni se promete una comprobación futura sin ejecutarla.

## Dependencias y comprobación independiente

| Paquete | Antes | Después |
|---|---|---|
| Next | 15.5.21 | 15.5.27 |
| Sharp (override de Next) | 0.35.0 | 0.35.5 |
| source-map-js | 1.2.1 | 1.2.2 |
| csv-parse | 5.6.0 | 7.0.3 |
| Vitest | 3.2.6 | 4.1.11 |
| drizzle-kit | 0.28.1 | 0.31.11 |
| esbuild de herramientas heredadas | 0.18.20 / 0.19.12 | 0.25.12 |

Se fija también PostCSS 8.5.23 explícitamente dentro de Next: la resolución
anterior anidada retenía 8.4.31 a pesar del override general. Las ramas no
afectadas conservan versiones: React 19.2.7, PDF 4.5.1, Supabase, ORM,
TypeScript, tsx, Rollup, Vite y Tailwind. Revisión independiente verificó
manifests/lock coherentes y URL/integridad de 243 artefactos conservados.
No se empleó `audit fix --force` ni se adoptó la resolución inicial que
actualizaba indiscriminadamente ramas ajenas.

Fuentes: [Next](https://github.com/vercel/next.js/releases/tag/v15.5.27),
[Sharp](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w),
[Vitest](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9),
[source-map-js](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2),
[CSV](https://raw.githubusercontent.com/adaltas/node-csv/master/packages/csv-parse/CHANGELOG.md),
[esbuild](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99).
Vitest 3.2.7 no cubre el aviso más reciente consultado; por eso se pasa a 4.1.11.

## Verificación local del 09/10

- `npm@10.9.8 ci` desde cero, con manifests definitivos: correcto.
- `npm audit`: **11 → 0**; `--omit=dev`: **4 → 0**. Es el inventario consultado
  en esta fecha, no una certificación de ausencia de vulnerabilidades.
- `npm ls --all`: salida 0, sin dependencias ausentes o inválidas. En macOS npm
  marca dos opcionales WASM de Sharp como extraneous; permanecen en el lock
  multiplataforma. Smoke nativo Sharp crea, redimensiona y decodifica PNG.
- **1.431 pruebas pasan y una omitida**: core 592, DB 55, ETL 43 (+1 omitida),
  web 741. Paquetes secuenciales con `--maxWorkers=2`, PostgreSQL local sintético.
  No se ha relajado ningún timeout. Nuevas regresiones: miniatura completa,
  versiones válidas v1/v2/v3, proporciones, uniones, C2/2O, acceso/teclado y CSV
  BOM/CRLF/comillas/acentos/códigos/precisión decimal mediante stream y sync.
- Typechecks de los cuatro paquetes y build Next 15.5.27: correctos.
- Arquitectura: 745 archivos, 376 módulos, 0 infracciones. Diff revisado limpio.
- Smoke independiente Drizzle en carpeta temporal: export, generate, segunda
  generación sin cambios y check correctos. Transformaciones CJS/ESM con
  core-utils y esbuild 0.25.12 producen 42 y mapas válidos. No leyó `.env`,
  accedió a BD ni generó migraciones en el repositorio. `check` requiere out
  relativo en este ensayo, como la configuración actual del proyecto.
- Host probado: Node 24.14.1. Vitest 4 admite 20/22/24+, no Node 21/23 aunque
  el rango general del repositorio `>=20.9.0` los incluye; no se afirma ensayo
  de otras versiones Node. Render no tiene NODE_VERSION explícita.

Logs privados: `/tmp/aluminior-mejoras-*-tests.log`, `*-typecheck.log`,
`*-architecture.log`, `*-build.log`; auditoría `/tmp/aluminior-s1-*.json`.
Smoke: `/private/tmp/aluminior-s1-drizzle-smoke-H9hoZh/result.json`.

## Recorrido de navegador

Base sintética local `aluminior_audit_test`, copia 260002 (ID
`75bef62b-d106-4644-9cd8-bee518edfcbf`). Antes de editar, el fijo 1200×800,
cantidad 2 y colocación 1 h mantiene 222,25 € de total con las dependencias nuevas.
Se modifica únicamente esa copia de QA para formar:

- Fijo 1200×800 en (0, 0).
- Fijo 600×1400 a la derecha, X=1220.
- Fijo 900×400 debajo del primero, Y=820; insertado con Enter sobre el anclaje.

Guardar, recargar y abrir con Enter conserva una única línea GRUPO,
1820×1400 exterior, tres módulos y dos uniones. Miniatura SVG 240×160 con
escala uniforme; DOM confirma tres marcos/dos uniones. Las uniones de ensayo
están sin configurar: precio y totales quedan **sin valorar**, con causas
visibles y ajuste manual de colocación conservado. No se infiere precio cero.
Escritorio 1440×900 y móvil 390×844: sin desbordamiento del documento; la tabla
conserva desplazamiento interno y dibujo de 72×48. Tab de Editar pasa a Eliminar;
la miniatura es imagen etiquetada, sin otra parada ni animación nueva.

Comparación con Productor basada en evidencia conservada §4 quater: misma
salida agregada GRUPO, dibujo de conjunto, medidas y ajuste manual. No se
reobservó Productor en Windows ni se certificó fabricación. Las capturas tienen
la extensión Dark Reader del navegador del usuario; su aviso de hidratación
existente no se ha ocultado ni se han cambiado sus preferencias.

Evidencia privada fuera de Git:
`output/mejoras-2026-10-09/miniatura-desktop.png`, `miniatura-mobile.png`.
PDF local `local-a2-260002.pdf`: 4.802 bytes, una página A4, parser estricto
y render PDFium correctos. Verificación visual independiente confirma los tres
módulos y dos uniones, sin recorte; descripción, cantidades, ajuste y totales
incompletos coinciden. PNG y metadatos junto al PDF. Esta prueba de una página
no cierra P.2, aceptación multipágina.

## Publicación y aceptación en Render

- `b1682a3`: dependencias y regresión CSV.
- `7ad0ee23d666d9ff8835b60aafb4dba261e582a3`: miniatura completa y pruebas.
- Push normal de estos dos commits a main desde base `11a8d7c`; ninguno de
  los commits de tarifas `8c920aa`/`787d1ad` forma parte de la entrega.
- Render `dep-db4gon142hec73cjfca0`, **live** confirmado por API, finalizado
  el 09/10 a las **15:48:17 UTC / 17:48:17 Madrid**, commit exacto `7ad0ee2`.
- Presupuesto autorizado de prueba **260009**, ID
  `b20dec06-b307-4d7c-846d-f330038ec42a`: abrir, guardar las mismas entradas y
  recargar. Material **515,83 €**, colocación **150,00 €**, base **665,83 €**,
  IVA **139,82 €**, total **805,65 €**, sin variación. 88 piezas, dos sin coste;
  aviso conservado. El nuevo SVG etiquetado aparece también en producción.
- No se modificaron documentos empresariales anteriores. No se ejecutaron
  migraciones ni importaciones. La prueba bidimensional se limitó a la base
  sintética local; producción se comprobó con el 2O ya autorizado.
- PDF de producción descargado de nuevo; evidencia final en
  `output/mejoras-2026-10-09/produccion-260009.pdf`, su render y captura web.
  La limitación del visor PDF interno observada en A1 no se da por corregida.

## Continuación y entrega del contexto

Actualización posterior 09/10: [P.2 verificado localmente](PDF-MULTIPAGINA-2026-10-09.md).
La indicación de ensayar multipágina que sigue conserva el orden de esta entrega;
el siguiente paso vigente es publicar su corrección y verificar el endpoint.

**S1 y A2 cerrados para el alcance comprobado.** Al cerrar esta entrega se
señaló P.2 como siguiente mejora independiente. Su aceptación multipágina
sintética ya está verificada en la continuación enlazada: falta publicación y
aceptación del formato comercial. No repetir la investigación entregada.
Se reutiliza el pendiente July 205, sin duplicarlo. S2 queda fechado para revisar
el anuncio Next cuando publique versiones; E1/E2/E6 conservan sus límites de
observación en Windows y no se convierten en cambios económicos por intuición.

Actualizados informe A1 (continuación de S1/A2), estado, índice, roadmap y relevo.
Historia del banco y evidencia original intactas. Worktree de entrega en rama
`codex/mantenimiento-dependencias`; el main principal sigue en `787d1ad` y
conserva tarifas y cambios previos sin indexar. Solo se refleja allí la
actualización documental, preservando las notas locales de tarifas. No ejecutar
un push desde ese main sin reconciliarlo. July se actualiza localmente;
publicación Git/Render no acredita sincronización o recepción en otro equipo.
