# Estado actual de Aluminior

Revisión funcional: 09/10/2026, checkout inicial `787d1ad`. Producción comprobada
en `a06cd4f` (Render live, 09/10 17:06:26 UTC); A3 y migración 0029 publicados/verificados. Se conserva
la cobertura histórica del 03/10 y la investigación E1 del 04/10.
Consolidación documental inicial: `ee0dc16`, sobre `9bc879e`.
Este es el único punto de entrada de estado y siguiente trabajo.
El [roadmap operativo](../ROADMAP-PARIDAD-PRODUCTOR.md) conserva el orden y
estado único de las tareas de paridad, con mantenimiento documental obligatorio.


## Entrega funcional de presupuestos verificada

[A1: auditoría del 09/10](paridad/AUDITORIA-FUNCIONAL-2026-10-09.md) publicada y
verificada sobre 260009: editar/guardar, recargar y PDF descargado válido;
base 665,83 €, IVA 139,82 €, total 805,65 €, con avisos técnicos conservados.
El visor PDF interno quedó gris; archivo analizado y renderizado correctamente.
No certifica paridad económica ni fabricación. Correcciones publicadas: herraje por defecto, errores recuperables, estados de
documento, diagnósticos visibles y cargas de opciones seguras. Acristalamiento
alternativo sin receta verificada queda incompleto; exterior fraccionario
se rechaza explícitamente, sin redondeo. Ver informe para pruebas y límites.

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
- Los snapshots `FILA_CENTIMOS` necesitan el lector integrado compatible:
  no revertir a una versión antigua sin revisar documentos guardados.
- Diseños específicos, variantes y flujos sin evidencia siguen pendientes.
  Las capturas y salidas privadas mencionadas en informes pueden no existir
  en otra copia; no reconstruir evidencia ni asumir sus resultados.

## Siguiente paso

**A3 publicado/verificado el 09/10 en `a06cd4f`, con 0029 aplicada.** Continuación Mac: A4 medidas exteriores implementado/verificado localmente; siguiente autorizar 0030 remota y despliegue con renovación de conexiones. A5 CI preparado, ejecución alojada pendiente. D1 reconciliado localmente. [Informe](paridad/MEDIDAS-Y-CI-2026-10-09.md). E1 depende de Windows; P.2 conserva aceptación comercial y S2 el anuncio del 14/10.

Antecedente P.2: rama `codex/pdf-multipagina`, worktree `pdf-multipagina/Aluminior`, desde
`7ad0ee2`. P.2 publicado en `46c613d`; endpoint PDF 260009 comprobado sin escritura, 1 página / 805,65 €. El main principal
conserva dos commits de tarifas excluidos y código anterior sin indexar; solo
se sincroniza allí documentación. No publicar desde ese main sin reconciliarlo.

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
el 09/10; no equivale a paridad integral de precio ni fabricación. D1: ficha de acceso de July reconciliada localmente el 09/10 con evidencia A3;
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
