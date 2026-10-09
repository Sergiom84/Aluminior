# Relevo: paridad y fuentes de Productor

Fecha: 03/10/2026. Contexto recibido en Codex Windows; comprobar cambios posteriores antes de actuar.

**Referencia de contexto; no usar sus listas fechadas como tareas vigentes.**
Entrada actual: [estado](docs/ESTADO-ACTUAL.md) →
[roadmap operativo](ROADMAP-PARIDAD-PRODUCTOR.md). La matriz y la lista de
ensayos ya están entregadas (M0 cerrado). Actualización 09/10: A1 y S1/A2 publicados/verificados, último Render live `a06cd4f`.
A3 publicado/verificado en `a06cd4f`, 0029 aplicada: [informe](docs/paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md). Continuación Mac: A4 publicado/verificado en 487feb1, 0030 aplicada, y A5 CI correcta, ver [informe](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md). No repetir A4. S3 verificado en CI sobre 36a47f4: 1.448 tests correctos/uno condicionado a CSV privado, seis recorridos, tipos/arquitectura/build; runs 37978474635 y 37978474739. Siguiente Mac: tramo técnico P.6/P.7, teclado/foco/responsive; P.2 conserva aceptación comercial. E1 conserva procedimiento Windows y autorización pendiente; no repetir A3.
No repetir S1/A2 ni la investigación de paginación. Rama `codex/pdf-multipagina`; P.2 se publicó en `46c613d`; PDF 260009 descargado válido, 1 página y 805,65 €.
S2 conserva el anuncio Next previsto para el 14/10; no repetir mantenimiento ya entregado.
E1 conserva su [procedimiento](docs/paridad/PASO-E1-DESPUNTE.md) para después.
Avance del 04/10: [evidencia parcial E1](docs/paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md).
Manual, diagnóstico histórico y observación A–F entregados; usar copia F de 0017, sin repetirlos
ni atribuir ese corpus Windows al banco vigente. Estado: En curso, no cerrado.
Al terminar cada entrega, actualizar el roadmap y retirar/actualizar documentos
de tareas agotados, preservando la evidencia según AGENTS. No repetir M0.


## Objetivo y siguiente trabajo

Sergio quiere que su tío pueda presupuestar con Aluminior obteniendo resultados equivalentes a Productor Aluminio (GAIA): configuración, piezas, cortes, cantidades, metraje, mano de obra, precios, ajustes y documentos. Productor es la referencia funcional y de interacción; la presentación se moderniza conservando el modelo de trabajo demostrado.

El cuello de botella actual es la interfaz lenta del original. La continuación debe aprovechar bases de datos, configuración, manuales y despieces guardados, y reservar la observación mediante visión para reglas que todavía necesiten un ensayo discriminante.

Complementario G1–G5 del 04/10 observado y verificado: segunda C2 1200×1150
por alta independiente después del cargo conserva primer precio/cargo y entra
sin indirectos. Recálculo reparte por bases sin cargo anterior, frente a reparto
igual/precios cargados; F9/reapertura persisten. Copias privadas por estado en
`output/e1-despunte/complementario-20261004/`. Precisión no discriminada por
G4: variante 1207×1150 con propiedades verificadas produjo error de opciones/
SessionFactory y tercer GRUPO. Copia G6-incidencia conserva fuente y error;
previos intactos, sin otro despunte. Siguiente: quitar solo tercer GRUPO tras
autorización solicitada y verificar edición segura de segunda línea sin alta.
No repetir A–F/G1–G5 ni diagnóstico GID. Descuentos/otras cantidades fuera
del alcance; E1 En curso, motor y banco sin cambios. July 180 mantiene identidad
y resultado local; no acredita publicación ni recepción Mac.

Primer entregable completado: [matriz por modelo/serie/regla](docs/paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md) y [ensayos mínimos](docs/paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md). Resultados visuales E1 en su evidencia del 04/10; consultar el roadmap antes de repetir pruebas.

## Entorno y lecturas

- Repositorio: `C:\Users\laral\Documents\Aluminior`.
- Original: `C:\Productor\Aluminio`.
- July en este portátil: `C:\Users\laral\Documents\Memor-IA`.
- Zona horaria: Europe/Madrid.
- Stack: TypeScript/Node, Drizzle, PostgreSQL/Supabase, Next.js y React. Paquetes `db`, `etl`, `core` y `web`; `packages/api` es histórico.

Leer [AGENTS.md](AGENTS.md), [estado](docs/ESTADO-ACTUAL.md), [arquitectura](ARQUITECTURA.md), [índice documental](docs/INDICE-DOCUMENTACION.md), [paridad](docs/paridad/PARIDAD-PRODUCTOR.md) y especialmente [banco](docs/paridad/BANCO-CONTRASTE-2026-10-03.md). Inspeccionar git status e instrucciones aplicables. `env.example` contiene únicamente valores de ejemplo y campos vacíos; .env y datos privados permanecen excluidos.

## Autorización y límites

Sergio aclaró expresamente:

- Crear y modificar únicamente casos nuevos de prueba en **0017**; comprobar el selector **PRUEBAS ALUMINIOR - 2026 [0017]**.
- **0016 y 0015: solo consulta.**
- No modificar catálogo ni documentos reales.
- Se acepta la persistencia automática de los ensayos de 0017. Está documentado que pulsar «Cerramiento» escribe una línea GRUPO vacía aunque no se pulse Grabar.

Para investigar datos: copias verificadas y lectura exclusiva. `EMP0016\aluminio.mdb` es activa; usar `EMP0016\Anterior.mdb`. Obtener cualquier copia nueva de 0017 cuando sea estable, coordinando el momento con quien opera el programa.

Datos empresariales, dumps, exportaciones, capturas comerciales y credenciales quedan fuera de Git. No ejecutar cargas, migraciones o despliegues por encontrar instrucciones antiguas en un documento.

Productor es una referencia, no una dependencia del producto. Reimplementar reglas en código propio; no integrar sus librerías como motor. No eludir licencias, copiar código/activos propietarios ni registrar componentes antiguos en el equipo principal. Un análisis estático autorizado sería un último recurso tras datos, manuales y observación.

## Estado del banco y código

Última medición local documentada: **400/523 iguales (76,48 %)**, 81 cercanas, 5 distintas, 37 sin valorar, cero errores; 434 exclusiones conservadas. Base histórica: 5/523.

- `e2b0232`: medidas fraccionarias de GRUPO, registro de diseños ESM/CommonJS y U «SIN UNION» solo con cero explícito del catálogo; mejora 380→400 sin perder igualdades.
- `08310cb`: informe Windows y actualización parcial del estado/arquitectura; último HEAD comprobado aquí.
- Otros cambios relevantes: `33abcb6` (horas por unidad), `a135c5f` (comisión de cabecera), `3268faa` (inserción desde extremos con «+»), integrado mediante `bec2523` con migración 0028 después de la 0027 de comisión.

Los 31 GRUPO antes rechazados por configuración ya pasan validación: 20 iguales y 11 sin valorar por otras causas. Entre los once: ocho uniones materiales de otra serie, una variante de vidrio por elemento, un PVP ausente/ambiguo y un bloqueo de acristalamiento.

400/523 acredita el banco local documentado, no todo el catálogo, fabricación ni aceptación en producción. Comparar también piezas y cortes: un total igual no basta.

## Producción y documentación pendiente

Claude comunicó verificaciones directas:

- Render live en `08310cb4ad0af26e332c26941dbc56228d27d834`, incluyendo `e2b0232`.
- Supabase: 29 migraciones hasta `0028_medidas_nuevas_ventanas` y 261.301 filas en doce tablas del motor.
- 15.263 filas de plantilla, 15.063 parámetros de conjunto/serie y 541 parámetros de estructura; conteos protegidos coincidentes con el relevo.

Codex recibió estas verificaciones; no las repitió. Observación histórica del 03/10: entonces seguía pendiente la aceptación funcional.
El 09/10 se verificaron guardado, recarga y PDF en el presupuesto de prueba 260009;
se repitió tras publicar f6d5bcd: guardado/recarga y PDF válido, total 805,65 €, con dos piezas sin coste. Visor IAB gris; archivo revisado aparte (ver A1). Caso recibido: 2O ELEGANTPVC 1200×540, L, VCG420AGS4, 5 h de colocación, tarifa 1. **652,24 € es referencia histórica anterior a una subida de PVP, no un resultado actual exigible.**

La continuación S1/A2 en `7ad0ee2` quedó live a las 15:48:17 UTC: 260009 reguardado/recargado conserva 805,65 €, miniatura nueva y PDF descargado. Sin tarifas ni migraciones; ver informe de continuación para pruebas locales y límites.

La reconciliación de `ESTADO-ACTUAL.md` con el relevo fechado está realizada: carga/despliegue atribuidos a Claude, comisión y horas en UI diferenciadas. A1 se verificó el 09/10 con alcance limitado al recorrido auditado. D1: ficha de acceso de July reconciliada localmente el 09/10 con 30 migraciones y Render live A3, distinguiendo verificaciones directas de evidencia recibida; sin sync acreditado. Conservar los informes históricos y no repetir la corrección del estado ya entregada.

## July y coordinación

[Documento compartido](https://docs.google.com/document/d/1rgwt5oFt1beE7sePN8dINo1cicgjqkl1lTH9VCue4-U/edit): leer especialmente el último «RELEVO DEL MAC». El inicio describe otra etapa; no reactivar automáticamente sus instrucciones o permisos.

Identidades: este portátil `windows-desktop-rcss2b8`; Mac `darwin-macbook-air-local`; otro Windows `windows-ser-gio`.

Pendiente reciente: proyecto `aluminior`, `sync_uid 598335364cc40675dda76c8260f4d37d`, título «3 sept - instrucciones para poner al día al portátil de mi tio». ID Mac 171; ID de este Windows 212. El 171 de este Windows es un pendiente antiguo de descuentos.

Codex importó la publicación del Mac del 03/10 a las 20:33:35 UTC, leyó el pendiente 212 completo y publicó memoria/recibo mediante `sync push`, revisión `fc3cea74f0820f52325c8eedc74044c56c601500`. Consultar estado actual: las publicaciones posteriores requieren nueva recepción.

Flujo: emisor actualiza el pendiente existente → `sync push`; receptor `sync pull` → lectura completa → `sync push`; emisor `sync pull` → comprobar recibo. Usar proyecto + sync_uid + título, no solo ID local. Git del código, memoria, datos privados y conversaciones son canales distintos.

## Fuentes y herramientas existentes

En la instalación se comprobaron `Anterior.mdb`, `ConfigDis.mdb`, `InfoSeries.mdb`, `ImpexpGM.mdb`, `impexpES.mdb`, `AluSeries.mdb`, `aluMode.mdb`, `IDSeries.mdb`, `ManualUsr\Aluminio.chm` y carpetas Tarifa, RPT, Documentos y Copias de Seguridad.

Revisar antes de repetir extracción:

- [Investigación de fuentes](docs/paridad/fase-7/02-investigacion-fuentes-2026-09-27.md).
- [Reglas del catálogo](docs/paridad/fase-7/06-reglas-catalogo-despiece-completo.md).
- [Barrido de facturas](docs/paridad/fase-7/05-primer-barrido-facturas-2026.md).
- `scripts/banco-contraste.ts`, `scripts/lib/banco-contraste/`, `scripts/lib/banco-motor/` y `scripts/contrastar-cortes-referenciados.ts`.

`scripts/lib/banco-contraste/fuente.ts` usa mdb-reader, exige Anterior.mdb, proyecta campos técnicos y verifica SHA-256 antes/después de leer.

Tablas importantes: EstructurasArticulos, Conjuntos, ConjuntosAsoc, ConjuntosDescuentos y variantes, ConjuntosOpcionesHerraje, acristalamiento, ArticulosPVP, VPresupuestosLin, VDatosLinEstr, VDatosLinDetDis, VAccesorios, VOpciones, VCerramientos y VCerramientosLin.

Los documentos guardados conservan despieces de referencia. No alimentar el motor con resultados históricos ni inventar fórmulas para cuadrar importes. Separar PVP antiguos y ajustes manuales. Los pendientes de documentos fechados pueden haber sido resueltos por iteraciones posteriores.

## Método propuesto

1. Auditar cobertura por modelo/serie/regla: fórmulas, asociaciones, cortes, opciones, vidrio, accesorios, mano de obra, metraje, PVP y ajustes.
2. Contrastar automáticamente documentos existentes a nivel de piezas además de precio.
3. Seleccionar casos de frontera: tramos de herraje, mínimos/múltiplos, hojas, espesores, cajones y variantes compatibles. Una prueba por dibujo no valida todas las ramas.
4. Ejecutar mediante visión solo ensayos que distingan reglas pendientes; después leer los resultados completos desde una copia estable de 0017.
5. Si falta una regla inaccesible, valorar una investigación estática específica y autorizada, sin acoplar Aluminior al runtime original.

## Seis ensayos solicitados

Todos en 0017 y tarifa 1, con pasos clic a clic, tabla de valores exactos y capturas:

| Ensayo | Entrada | Datos a observar |
|---|---|---|
| Comisión | 2O ELEGANTPVC 1200×1200, L; inicial, −10 y +10 con Sumar Comisión | Precio, Subtotal, Importe Comisión, cambios del despiece y momento de aplicación: creación/campo/recálculo |
| Despunte | C2 GMC400 1500×1150; una y luego dos líneas | Importe, %, base, Precio antes/después y reparto; parámetros/resultados de barras, retales, saneamiento, disco y modo de repercusión |
| Tapajuntas | 1P 867×2098, GMT004; inferior NO frente a SI | Cortes TAPIZ/TAPDE/TAP; serie, acabado, ala, lados activos y compacto/cajón |
| Compacto | 2O ancho 2100, COM009, cajón 185, alto final de ventana 2140 | Distinguir hueco/ventana/accesorio; cortes, Metraje y Precio COMPVAL (4,93/4,94), vuelos, paños, guía central, accionamiento, opciones, mínimos/múltiplos y MOCOMP |
| Medios milímetros | GRUPO C2 970×439,5 y C2 970×1999,5 | Admisión/conservación en elementos, medidas económicas, dibujo y despiece; geometría/uniones y guardar/reabrir |
| Acristalamiento | 2O ELEGANTPVC, opciones 2 y 3 de Seleccionar la Tabla de Acristalamiento | Nombres/tablas, junquillos y juntas, con opción inicial como referencia y mismo vidrio/espesor |

Ficha común: versión/empresa, modelo/serie, cantidad, medidas/cotas, acabados principal y de accesorios, vidrio, opciones, horas y ajustes iniciales. Despiece completo: pieza, función, cantidad, cortes, metraje, PVP e importe; separar neto de IVA. Identificadores y datos empresariales en evidencia privada.

**Lista histórica del 03/10, sin vigencia como orden de ejecución.** E1 ya tiene A–F y G1–G5 verificados en un presupuesto nuevo; la variante G6 terminó en incidencia. Consultar estado, roadmap y evidencia del 04/10 antes de cualquier observación. Al reanudar visión, observar la ventana actual y usar la skill Computer Use; no reutilizar handles/coordenadas anteriores.

Claude priorizó despunte (10 líneas), uniones de otra serie (8 GRUPO), comisión (6 residuos de 1–4 céntimos), tapajuntas, compacto, vidrio/acristalamiento y medios milímetros. Los diagnósticos se solapan; no sumar sus recuentos como causas independientes.

## Entrega y futuras correcciones

Entregar resultados con procedencia, entradas, capturas y límites como Markdown para añadir al [banco](docs/paridad/BANCO-CONTRASTE-2026-10-03.md).

Cuando se corrija el motor: una causa demostrada por iteración, fixture sintética, módulo responsable, pruebas pertinentes, typecheck, check:architecture y nueva medición. Conservar todas las igualdades anteriores y el denominador salvo cambio justificado e informado. Preservar incompleto/sin valorar: dato ausente no es cero.

## Continuar en otro equipo — 04/10/2026

Este relevo integra la conversación «Completa ensayo E1 de despiece»
(`01a106c5-9076-7763-928c-4b092432a414`), revisada antes de publicar.
Actualizar Aluminior con `git pull --ff-only` y July con `sync pull` en el
receptor; leer estado → roadmap → procedimiento E1 → evidencia E1.

Pendiente vigente: proyecto `aluminior`, ID local Windows **180**, identidad
`398049fbd618069e36bb84bab37913ed`, título «E1/G1: G1-G5 verificados;
recuperar ensayo tras incidencia de variante». Buscar por identidad en el otro
equipo: su ID local puede cambiar. Sigue `in_progress`.

No repetir A–F, G1–G5 ni investigar los dos céntimos: margen configurado GID.
Reparto sobre bases sin cargo anterior y efecto del alta independiente probados;
precisión de reparto todavía no discriminada. El siguiente ensayo requiere
restaurar las dos líneas válidas y verificar cómo editar una GRUPO existente.
La eliminación de la tercera línea 1207×1150 fue solicitada, pero **no está
autorizada todavía**; este encargo de commit no cambia esa situación.
No se ejecutó otro despunte después del error de opciones/SessionFactory.

Git y July transportan este resumen seguro, código y documentación. Las MDB,
capturas, importes e identificadores privados y auxiliares locales de observación
siguen exclusivamente en `output/e1-despunte/` de este Windows y no viajan con
`git pull` ni con July. Antes de reanalizar o continuar Productor desde otro
equipo, asegurar acceso autorizado a esas fuentes por un canal privado y comprobar
las huellas de procedencia. La sesión de Productor y esta conversación local
no quedan trasladadas por publicar Git/July. La publicación tampoco demuestra
recepción: comprobar `sync pull` en el receptor y su recibo posterior.
