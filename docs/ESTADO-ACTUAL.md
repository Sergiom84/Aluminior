# Estado actual de Aluminior

Revisión documental y producción: 12/10/2026. Código `40cedd1` live en Render,
deploy `dep-db6hi2navr4c739d2e4g`, terminado a las 19:31:21 Europe/Madrid
(17:31:21 UTC). Supabase: 33 migraciones, 0031/0032 y carga dirigida aplicadas;
QA técnico remoto y preservación final correctos. Ver
[publicación del 12/10](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md).
La revisión funcional del 09/10 en `487feb1` y la consulta Render del 10/10
son antecedentes conservados; no sustituyen esta comprobación de producción.
Se preservan la cobertura histórica del 03/10 y la investigación E1 del 04/10.
[Auditoría documental](AUDITORIA-DOCUMENTAL-2026-10-10.md) y
[continuación en Windows](CONTINUAR-EN-WINDOWS.md).
Consolidación documental inicial: `ee0dc16`, sobre `9bc879e`.
Este es el único punto de entrada de estado y siguiente trabajo.
El [roadmap operativo](../ROADMAP-PARIDAD-PRODUCTOR.md) conserva el orden y
estado único de las tareas de paridad, con mantenimiento documental obligatorio.


## Reconciliación del main Mac — 13/10/2026

Por petición de Sergio, se revisan todos los cambios pendientes y se integra
el main local `6a29bc4` con `origin/main` `4fb54b3`. De 98 archivos pendientes,
77 ya coincidían con el remoto. Se conservan las versiones publicadas de A3/A4,
miniaturas, teclado, precios dimensionales, migraciones y CI. El único código
nuevo frente al remoto es la herramienta de propuesta de doble acristalamiento,
sus pruebas y la corrección del import de `OpcionCatalogo` para scripts.
La herramienta bloquea propuestas cuyo modelo no reproduce el catálogo.
Verificación local: 1.651 pruebas de paquetes correctas y una omitida por CSV
privado, seis pruebas de propuesta y diez recorridos E2E correctos; build,
tipos de paquetes/E2E/scripts y arquitectura (cero infracciones) correctos.
No se incluyen fuentes privadas ni secretos. Las demás ramas locales ya están
contenidas en `origin/main`; los cambios documentales de la copia de auditoría
son antecedentes ya integrados y actualizados, conservados en esa copia.
[TARIFA-DOBLE-ACRISTALAMIENTO](TARIFA-DOBLE-ACRISTALAMIENTO.md) conserva las
hipótesis y decisiones pendientes; publicar el código no aplica la tarifa.
Esta entrega verifica código local y publicación Git; no reconsulta producción,
no aplica migraciones ni certifica aceptación Productor. El siguiente trabajo
sigue siendo la matriz restante de P.6/P.7 y E1 en Windows.

## ClonerSoft publicado técnicamente — 12/10/2026

[Investigación y cambios](paridad/INVESTIGACION-CLONERSOFT-2026-10-12.md) desde
`origin/main` `9ae7a6e`; [publicación y recibos](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md)
en `40cedd1`. EMP0016=2026 y EMP0015=2025 confirmados; copia del banco
identificada por huella. C1: precio por medidas, acabado de artículo y
contención de tarifa plana publicados y verificados en su alcance acotado.
0031/0032 aplicadas; 17.547 metadatos y dos PVP cargados desde la misma
proyección. Respaldo completo y restauración local comprobados; proyección
original de 59 tablas/462.617 filas y 31 migraciones previas intacta.

Gate remoto final correcto: tres documentos QA nuevos sin clientes previos,
siete líneas, guardado/recarga, edición de cantidad con misma identidad,
copia/revisión y cinco PDF, incluido el posterior a F9. Acabado/medidas/PVP
conservados; falta de medidas produce nulos y «Sin valorar» en web/PDF. Tras QA hay 17 presupuestos/12 líneas;
los 14 presupuestos/cinco líneas anteriores conservan sus firmas. El contenido
de las 60 tablas postcarga permanece intacto salvo los documentos, líneas y
tres recibos QA autorizados.

P.6/P.7 está parcialmente publicado: búsqueda/teclado/foco verificados con diez
recorridos escritorio/móvil. 1.644 pruebas correctas, una condicionada a CSV
privado; tipos, arquitectura y build correctos. Ambos workflows de `40cedd1`
finalizaron con `success`. Banco nuevo conserva 400/523 y sus exclusiones.
La MO del vidrio no se activa con coeficientes cero. E1/E2/E6, coste dimensional,
fabricación y aceptación comercial siguen abiertos. La restricción sobre el main antiguo quedó superada por la reconciliación
del 13/10 descrita arriba; las tarifas propuestas siguen sin aplicar.

## Entrega funcional de presupuestos verificada

[A1: auditoría del 09/10](paridad/AUDITORIA-FUNCIONAL-2026-10-09.md) publicada y
verificada sobre 260009: editar/guardar, recargar y PDF descargado válido;
base 665,83 €, IVA 139,82 €, total 805,65 €, con avisos técnicos conservados.
El visor PDF interno quedó gris; archivo analizado y renderizado correctamente.
No certifica paridad económica ni fabricación. Correcciones publicadas: herraje por defecto, errores recuperables, estados de
documento, diagnósticos visibles y cargas de opciones seguras. Acristalamiento
alternativo sin receta verificada queda incompleto. El rechazo de exteriores
fraccionarios de A1 quedó superado por A4/0030: alta, edición, copia y PDF
conservan decimales en producción. Ver informes para pruebas y límites.

## Continuación S1/A2 publicada

[Informe de mantenimiento y miniaturas](paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md):
audit npm 11→0 y producción 4→0, 1.431 pruebas, tipos/arquitectura/build correctos.
La miniatura representa todo el GRUPO con posiciones/proporciones guardadas.
QA local de tres módulos, dos uniones, guardado/recarga, teclado, escritorio/móvil
y PDF correcto; 260009 repetido en producción mantiene 805,65 € y sus avisos.
No hay cambios de tarifas, valoración ni migraciones. El anuncio posterior de
Next para el 14/10 conserva seguimiento S2; no queda cubierto por audit 0.

## A3 publicado

[Informe A3](paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md): alta/copia/revisión
idempotentes con recibo transaccional. 0029 aplicada; prueba sintética remota
260010/0, 260011/0 y 260010/1, tres recibos y mismos IDs al reintentar en READ ONLY.
Los nueve documentos anteriores y tres líneas conservan sus huellas.

## Qué funciona

- Producción: catálogo visual de **160 estructuras**, incluida la entrada
  directa al configurador. Migración `0022_catalogo_diseno` y relleno aplicados
  en Supabase según el cierre autorizado del 02/10 y el contexto del usuario.
  **Verificado por Sergio en la web publicada el 02/10/2026:** 160 modelos
  y composición C2 + C3. Esta observación acredita el catálogo y la composición;
  no certifica la valoración del motor.
- Código: composición bidimensional, configuración por elemento, búsqueda de
  vidrio, uniones, guardado de una línea GRUPO, reapertura, copia y PDF.
  La existencia del código no acredita paridad integral con Productor.
- Motor de catálogo integrado en main: tablas de `0023_motor_catalogo`,
  protección `0024_motor_catalogo_rls`, cargador dirigido y lector compatible.
- Producción, **verificada por Claude y recibida en el relevo del Mac del 03/10**:
  Render live en `08310cb4ad0af26e332c26941dbc56228d27d834`, que incluye `e2b0232`.
  Consulta Supabase READ ONLY: 29 migraciones hasta `0028_medidas_nuevas_ventanas`,
  261.301 filas en doce tablas del motor; 15.263 filas de plantilla, 15.063
  parámetros de conjunto/serie y 541 parámetros de estructura. Los conteos
  protegidos coinciden con el relevo. Codex leyó el [documento de coordinación](https://docs.google.com/document/d/1rgwt5oFt1beE7sePN8dINo1cicgjqkl1lTH9VCue4-U/edit)
  y el pendiente July 212; no repitió consultas remotas ni verificó el respaldo.
  Esto acredita el estado informado de carga/despliegue, no aceptación funcional.
- Banco local medido el 03/10 con la copia `Anterior.mdb` y los servicios web:
  **400/523 líneas elegibles al mismo precio (76,48 %)**, frente a 5/523 de base.
  434 exclusiones conservadas; 81 cercanas (58 por PVP actualizado después del
  presupuesto, no reproducible), 5 distintas, 37 sin valorar y 0 errores.
  Trece iteraciones con evidencia y ninguna igualdad perdida: Acabado2, cortes del
  snapshot, nTAcris, compacto, horas por unidad, comisión de cabecera, cotas y MO
  por categoría, mosquitera/tapajuntas, batiente, incremento sobre precio, acabado
  del vidrio, opciones por defecto y configuración GRUPO con medidas fraccionarias,
  catálogo de diseño compartido y representación explícita de U («SIN UNION»).
  [Historial, evidencia y pendientes](paridad/BANCO-CONTRASTE-2026-10-03.md).
  Catálogo reconstruido en Windows solo en `aluminior_real_test` (29 migraciones);
  precios y márgenes sin modificar. Los 31 GRUPO antes rechazados ya pasan la
  validación: 20 iguales y 11 aún sin valorar por causas distintas de configuración.
- Análisis de los resultados guardados: [97 pares modelo/serie](paridad/COBERTURA-MODELO-SERIE-2026-10-03.md)
  y [matriz de reglas](paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md).
  440/523 coinciden en artículos y cantidades; 436/523 también en cortes/unidad;
  360/523 coinciden simultáneamente en esos campos y precio. Acabados literales
  y funciones incompletas se separan; no es certificación de fabricación ni
  una nueva ejecución del banco. Denominador y exclusiones conservados.
- Comisión de cabecera (pestaña `Gastos`: `Comisión` % y `Sumar Comisión`) en la ficha
  del presupuesto. Migración `0027_presupuesto_gastos_comision` (tabla aparte, RLS) aplicada en
  `aluminior_real_test` y en Supabase (03/10). Sin
  ella la web lee comisión 0 y rechaza guardar otra. Con `Sumar Comisión`, el alta de
  estructura y el alta o edición de GRUPO aplican el factor al precio; el despiece
  queda en base y la copia arrastra los gastos. Artículos sin comisión (sin evidencia).
  Cambiar la comisión sumada con líneas de estructura o GRUPO valoradas se rechaza:
  no se revalora nada guardado hasta observar en Productor si recalcula.
- Desarrollo en Mac con Docker. En la base local `aluminior_test` se comprobaron el 02/10
  25 migraciones y RLS en las once tablas del motor; catálogo y estructuras
  vacíos. Es un antecedente de ese entorno/fecha, no el estado de producción.

## Qué falta: valoración

- Caso publicado A1 ejecutado el 09/10: 2O ELEGANTPVC 1200×540, L,
  VCG420AGS4, 5 h de colocación y tarifa 1; guardado/recarga/PDF coherentes.
  Repetido con `f6d5bcd`: 805,65 € total; dos piezas siguen sin coste.
  Los defaults de herraje añadieron 54,50 € al material; no se tocaron tarifas.
  Ni 652,24 € histórico ni 739,71 € anterior son objetivos impuestos.
- La web conserva la vía anterior si falta el catálogo. Tener 160 dibujos
  disponibles no significa que las 160 estructuras tengan precio completo.
- Ensayos locales fechados con catálogo cargado obtuvieron PVP con avisos para
  C2 y PC2; fijo 0, 2O y 1OFI siguieron incompletos en GMC400.
  Son observaciones anteriores, no una medición actual de producción.
- Falta contraste integral de artículos, medidas, herrajes, vidrio, mano de
  obra, tarifas y redondeo con iguales entradas en Productor.
  No hay aceptación general de precio ni fabricación.

## Riesgos

- El importador completo vacía tablas y puede destruir documentos.
  Usar únicamente la carga dirigida para el alcance autorizado.
- Un resultado incompleto conserva importe nulo y «Sin valorar»;
  no convertirlo en cero ni aceptar sumas parciales como precio completo.
- Los snapshots `FILA_CENTIMOS` y los acabados de artículo necesitan lectores
  compatibles. Una reversión requiere bloquear escrituras primero y preservar
  columnas/journal/líneas nuevas; restaurar sólo metadata/PVP afectados. Volver
  sólo a web antigua puede perder acabados en copias y eludir la contención
  de PVP plano. Ver [reversión](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md#reversión-compatible).
- Diseños específicos, variantes y flujos sin evidencia siguen pendientes.
  Las capturas y salidas privadas mencionadas en informes pueden no existir
  en otra copia; no reconstruir evidencia ni asumir sus resultados.

## Siguiente paso

**Windows:** recepción y fuentes privadas → aceptación comercial P.2 con el
titular; investigación económica E1 desde G6-incidencia y E7 tras A4, según
[la guía](CONTINUAR-EN-WINDOWS.md). No repetir A3/A4 ni migraciones.

S3 verificado localmente y en GitHub Actions (`36a47f4`): 1.448 pruebas correctas,
una condicionada a CSV privado, seis recorridos, tipos, arquitectura y build; ver [evidencia y ejecuciones](paridad/MEDIDAS-Y-CI-2026-10-09.md#s3-validación-completa-de-los-paquetes-en-ci--09102026).
Siguiente desde Mac: matriz restante de P.6/P.7 — otras anchuras, zoom 200%,
reduced motion y recorrido humano comparativo. C1/0031/0032/carga/publicación
y QA remoto completados el 12/10; no repetirlos. Teclado/búsqueda/foco de este
tramo están parcialmente publicados; su aceptación integral sigue abierta.

**A3 publicado/verificado el 09/10 en `a06cd4f`, con 0029 aplicada.** A4 publicado/verificado en `487feb1`: 0030 aplicada, conexiones renovadas y alta/edición/recarga/copia/PDF decimales comprobados en producción. A5 verificado en GitHub Actions (run 37971854995, seis recorridos correctos). D1 reconciliado localmente. [Informe](paridad/MEDIDAS-Y-CI-2026-10-09.md). E1 depende de Windows; P.2 conserva aceptación comercial y S2 el anuncio del 14/10.

Antecedente P.2: rama `codex/pdf-multipagina`, worktree `pdf-multipagina/Aluminior`, desde
`7ad0ee2`. P.2 publicado en `46c613d`; endpoint PDF 260009 comprobado sin escritura, 1 página / 805,65 €. Ese main quedó reconciliado el 13/10 con `origin/main` del 12/10; se conservan
las mejoras publicadas y la herramienta de propuesta, sin aplicar tarifas.

### Investigación económica conservada

Pendientes del [banco local](paridad/BANCO-CONTRASTE-2026-10-03.md): de los 31 GRUPO
de la iteración 13 quedan 8 con unión material de serie distinta, 1 con variantes
de vidrio por elemento, 1 con PVP ausente/ambiguo y 1 con bloqueo de acristalamiento.
También quedan despunte de cabecera (10) y las observaciones en Windows.
La primera matriz está entregada; seguir la [lista de ensayos mínimos](paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md):
despunte, unión de otra serie, comisión, tapajuntas, compacto, acristalamiento y
fracciones. Coordinar con la conversación de visión antes de operar 0017 u
obtener una copia. Verificar una regla antes de corregir el motor y repetir el
banco conservando igualdades/exclusiones.

**Siguiente ensayo económico: E1 — despunte**, según el [procedimiento preparado](paridad/PASO-E1-DESPUNTE.md).
En curso: [manual y contraste guardado del 04/10](paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md)
acreditan la resta de costes en 13 documentos positivos con detalle de otra
copia Windows; ocho discrepancias y un cargo sin detalle se conservan.
La huella difiere de la del banco; no sustituye su medición ni resuelve sus diez
candidatas. Motor y UI sin cambios. No repetir esa investigación; comprobar
evidencia posterior. A–F conservados: C2 GMC400 1500×1150, VCG4 y acabado L;
segunda línea por duplicación. Recálculo sustituye el cargo; repetición y
reapertura conservan resultado. Copia privada F de 0017 verificada y lector
específico, trece pruebas y typecheck dirigido. Margen GID 0,01 % sobre coste
explica residuo B/D de 0,02 €. Complementario G1–G5 verificado: segunda C2
1200×1150 añadida desde configurador después del cargo, sin heredarlo ni
repartirlo automáticamente; primer precio y cargo se conservan hasta recálculo.
Mismos parámetros sustituyen el cargo y reparten por bases sin cargo anterior,
frente a reparto igual o precios cargados. F9/reapertura conserva la proyección
técnica completa. Datos privados en output/e1-despunte/complementario-20261004.
Las tres políticas de redondeo coinciden en G4. Variante 1207×1150 con
propiedades verificadas produjo error de opciones/SessionFactory y tercer
GRUPO, sin sustituir segunda C2; G6-incidencia conservada, sin nuevo despunte.
Siguiente: autorización solicitada para retirar solo tercer GRUPO y confirmar
edición segura de segunda línea antes de comparación de precisión. Las dos
líneas previas siguen idénticas a G4/G5. No repetir A–F, G1–G5 ni diagnóstico
GID. Descuentos cero/cantidad 1 no discriminan base bruta/neta. E1 sigue En
curso; motor y banco sin cambios. Retirar instrucciones agotadas y preservar
evidencia al completar cada etapa.

Comisión sí está en Gastos. Los campos de horas de fabricación/colocación están
en el alta de estructura (`campos-alta.tsx`) y se transmiten a la valoración por
unidad (`lineas/alta-linea.ts`); GRUPO conserva ajustes por línea. Los accesorios
tienen valoración de catálogo, pero no se afirma cobertura integral de sus
controles UI sin aceptación. La carga de producción informada ya incluye
0025/0026; la vía anterior se conserva para entornos sin catálogo completo.
La aceptación del recorrido A1 con las correcciones publicadas quedó verificada
el 09/10; no equivale a paridad integral de precio ni fabricación. D1: ficha de acceso de July reconciliada localmente el 09/10 con evidencia A4/0030;
sin sync ni recepción Windows acreditados.

## Enlaces

- [Roadmap y reglas de mantenimiento](../ROADMAP-PARIDAD-PRODUCTOR.md).
- [Investigación económica E1: despunte](paridad/PASO-E1-DESPUNTE.md).
- [E1: evidencia parcial y diagnóstico reproducible](paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md).
- [Cobertura, reglas y fuentes](paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md).
- [Ensayos mínimos pendientes](paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md).
- [Integración, cargador y verificación del motor](paridad/INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).
- [Catálogo visual y observaciones](paridad/CATALOGO-REAL-2026-10-02.md).
- [Mapa y criterios de paridad](paridad/PARIDAD-PRODUCTOR.md).
- [Arquitectura](../ARQUITECTURA.md) · [Contrato](../AGENTS.md).
- [Índice: evidencia e histórico](INDICE-DOCUMENTACION.md).
- [PostgreSQL local y pruebas](../packages/db/README.md).
