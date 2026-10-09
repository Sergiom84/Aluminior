# Medidas exteriores, recorridos CI y ficha July — 09/10/2026

Estado: A4 publicado/verificado en producción; 0030 aplicada. A5 recorrido
de navegador verificado localmente y en GitHub Actions.
D1 ficha de acceso reconciliada localmente. Trabajo desde origin/main `18701a4`
en `codex/medidas-decimales-ci`, commit `e7aed24`; main principal con cambios ajenos intacto.
[CI 37971854995](https://github.com/Sergiom84/Aluminior/actions/runs/37971854995):
correcta sobre ese commit, seis recorridos en Linux/Postgres nuevo, typecheck
del harness y artefactos publicados. Sin secretos de producción.

## Alcance y evidencia

Sergio pidió continuar los puntos resolubles desde Mac. A4 corresponde a F07/F08
y propuesta 3 de la auditoría del 09/10; A5 a propuesta 6. La conservación de
fracciones ya está acreditada en configuraciones históricas y core; no se
infiere ninguna regla económica ni se cierra la observación E7 en Productor.
E1 continúa condicionado al ensayo Windows y su autorización pendiente.

La causa de F08 eran las columnas integer de `lineas.ancho_mm`/`alto_mm`.
0030 las amplía a double precision, misma representación numérica que TypeScript
y el JSON del configurador. Conserva todos los valores int4 existentes, nulos
y números fraccionarios sin imponer una escala que redondee silenciosamente.
No cambia cálculos económicos, tarifas, catálogo ni snapshots históricos.
La validación de estructura individual conserva rango técnico y finitud y
admite fracciones; su input usa step=any. GRUPO deriva las medidas en servidor
como antes y deja de rechazarlas por no ser enteras.

## Verificación local

- Reproducción previa: tres regresiones rojas (ancho, alto y entrada individual).
- Suite web: 757 pruebas correctas; BD: 56. Typechecks de cuatro paquetes y
  harness E2E; arquitectura sin infracciones; build Next correcto.
- SQL real de 0030 sobre tabla temporal: int4 máximo, enteros y nulos intactos;
  970.25, 439.5, 1999.5 y 1000/3 vuelven con su representación numérica original.
- Servicios reales y PostgreSQL en rollback: alta 970.25×439.5, edición
  970.25×1999.5, copia de revisión, JSON y modelo PDF conservados. Precio
  permanece nulo cuando faltan materiales; nunca se inventa cero.
- Seis recorridos Playwright correctos: escritorio 1440×900 y móvil 390×844;
  alta y ambas copias tras pérdida HTTP postcommit; recarga y teclado;
  guardado/recarga/edición/PDF de GRUPO decimal; latencia/fallo/reintento de
  catálogo y estructura individual decimal. Sin overflow exterior.
- La descarga PDF comprueba estado, MIME y cabecera. La integración comprueba
  dimensiones del modelo PDF; esto no es nueva aceptación comercial Productor.
- [Harness y ejecución](../../e2e/README.md). La build se repitió sola tras una
  colisión inicial con `next dev` en `.next`; la ejecución final fue correcta.

## Publicación y verificación remota — 09/10/2026

Sergio autorizó migración y publicación, y después confirmó expresamente la
pausa/reanudación de Render. La revisión automática rechazó inicialmente la
pausa por no considerar explícita la interrupción; no hubo mutación hasta esa
confirmación. Servicio reanudado inmediatamente después de completar el SQL.

- Respaldo privado previo: `export_datos/respaldos/a4-antes-0030-1791570256401.dump`
  en el checkout principal, ignorado por Git y permisos 600. 2.813.148 bytes,
  SHA-256 `26d01457ef15a6e9bd40e4f780800f7ab376fb0e2c1ac08a4c7b5d42fcdc1d11`.
  Índice pg_restore legible, 313 entradas; no es un ensayo de restauración completa.
- Destino `cwtyrpqwdbfylqdlydez`: 30 entradas previas, sólo 0030 pendiente.
  DDL y journal en una transacción con límites de espera, bloqueo de tablas y
  comprobación antes/después. Las dos columnas son double precision; RLS y ACL
  intactas. Huellas de las 12 tablas documentales idénticas durante la migración:
  12 presupuestos y tres líneas previos conservados.
- Journal posterior: 31 entradas, hash SQL
  `88d5af5dec5350df74f0f115483bb9e807befde691e471397ace4fc8d72ce3b8`, cero pendientes.
- Push main `18701a4→487feb1`; despliegue explícito, ya que el commit documental
  incluía skip render. Render `dep-db4j4mui0phs73csggrg` live en
  `487feb179c2885e811d3f1cf183cb9e2c085c1b4`, 18:30:14 UTC. Estado not_suspended
  y web autenticada accesible. La pausa/reanudación y despliegue renuevan conexiones:
  el cambio de tipo invalidó planes preparados en el ensayo local, de ahí esta ventana.
- Navegador autenticado: presupuesto sintético `260012/0`, fijo 0 sin serie,
  alta 970.25×439.5, guardado y recarga; edición a 970.25×1999.5, guardado y
  recarga; copia `260012/1` conserva las medidas tras reabrir. Se mantienen ambos.
- PDF descargado mediante Emitir: 4.622 bytes, una página, parser estricto pypdf
  correcto; página 1 conserva `970.25 × 1999.5` en fila y dibujo, y declara
  Sin valorar/PRESUPUESTO INCOMPLETO. No certifica formato comercial ni fabricación.
- Consulta READ ONLY posterior: 14 presupuestos, cinco líneas, ninguna migración
  pendiente. Todas las filas previas a QA conservan su huella en las 12 tablas;
  sólo se añadieron el presupuesto sintético y su revisión con sus líneas.
- Evidencia privada: `/tmp/aluminior-a4-{backup,migration}.json`, huellas en
  `/tmp/aluminior-a4-docs-before.json`, captura `/tmp/aluminior-a4-produccion.png`,
  PDF `~/Downloads/presupuesto-A-260012-revision-0.pdf`. Sin datos reales versionados.

Reversión preferente: volver al código anterior conservando columnas ampliadas.
No convertir a integer si hay fracciones: perdería medidas. La app anterior
rechaza nuevos exteriores fraccionarios, pero las filas decimales existentes
requieren atención al editar; no afirmar equivalencia funcional del rollback.
Antes de uso decimal, revertir DDL sólo con autorización y prueba de integridad.

## D1: ficha de acceso July

Actualizado `July_unificada/context/access/aluminior.md`: Render y conexión
Postgres comprobados el 09/10; 31 migraciones, último deploy 487feb1,
respaldo y herramientas Mac, punteros seguros y distinción de evidencia recibida
del motor frente a comprobación directa. Retirada la instrucción caducada de
reconectar GitHub/Render. Auth del 29/09 e historia de hashes conservadas con fecha.
Actualización local: no acredita sync ni recepción en Windows. Sin secretos.

Estado y siguiente paso los gobierna el [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
No repetir A3, A4 ni D1. Siguiente: aceptación comercial P.2 con el titular.
E1/E7 requieren observación Windows; S2 espera el anuncio del 14/10.
