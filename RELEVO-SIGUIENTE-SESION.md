# Relevo: resolver evidencia antes de ampliar el catálogo

## Abrir la copia correcta

Trabajar en `C:\Users\laral\Documents\Aluminior`, rama
`feat/cerramientos-editor-linea`. NO trabajar en la copia anterior de
`C:\Users\laral\OneDrive\Documentos\Aluminior`.

Al preparar este relevo, los últimos commits de implementación son:

- `3bbe321`: cargador, editor y clasificación conservadora del escaparate.
- `f4ca3a6`: investigación de herrajes y banco local de casos históricos.

Comprobar rama, estado y log antes de editar. Estos commits son locales;
no se ha hecho push ni merge. `env.example` es ajeno y sigue sin seguimiento:
no incluirlo ni sobrescribirlo. No ejecutar reset/clean para obtener una
copia limpia. Si Git señala propiedad dudosa, usar safe.directory acotado
al comando para esta ruta; no cambiar la configuración global.

## Lectura inicial

Leer CLAUDE.md y AGENTS.md; después este relevo, PLAN-PARIDAD-OPERATIVA.md,
HANDOFF-GROK.md §7 bis y su continuación, EVIDENCIA-ASIGNACION-HERRAJE.md,
BANCO-COMPARACION-PRECIOS.md y EVIDENCIA-ESCAPARATE.md. Antes de observar
Productor, leer RECON-CERRAMIENTOS.md y EVIDENCIA-EDITOR-LINEA.md. Consultar
ARQUITECTURA.md y la sección pertinente de ENTREGA.md antes de tocar cálculo.
PLAN-SIGUIENTE.md conserva la historia: su situación de partida ya está superada.

## Lo terminado: no repetir cargas

Catálogo del editor cargado con autorización en Supabase: 11.854 opciones
actualizadas, 2.058 categorías, 143 alternativas y 70 tablas. GM252 bloquea
CERRADURA frente a CREMONA; GMA65OPT muestra GM69–GM72. Recuentos protegidos
en esa comprobación: 3 presupuestos, 1 línea y 504 clientes (referencia histórica,
no asumir que siguen iguales si el usuario ha trabajado después).

El adaptador postgres.js usa tx.json para evitar doble serialización.
Pruebas conocidas: 377 core, 6 cargador, 45 unitarias web, typechecks core/db/
etl/web; posteriormente 4 pruebas del banco y 14 controles de catálogo.
Los 14 controles certifican ocho coincidencias y seis divergencias conocidas,
NO catorce coincidencias con Productor. No repetir toda la suite por rutina;
ejecutar lo relevante a cada cambio y la verificación final correspondiente.

## Autorizaciones ya dadas

- Leer los cuatro CSV históricos de catálogo ConjuntosOpcionesHerraje,
  ConjuntosCatOH, Conjuntos y TAcristalamiento. Su carga acotada en Supabase
  fue autorizada y ya se completó; no es autorización para otras cargas.
- Leer VPresupuestosLin, VDatosLinEstr y VOpcionesHerraje de la exportación
  EMP0016, sin modificar, y generar el banco técnico local en output/,
  fuera de Git y sin nombres ni datos de clientes. Hubo rechazo automático
  previo; el usuario amplió expresamente el alcance y se generó el banco.
  No volver a pedir ese mismo permiso para las mismas operaciones.
- El usuario delega decisiones técnicas y la investigación funcional; permite
  trabajo paralelo con subagentes. No asumir autorización para nuevas tablas
  documentales sensibles si una investigación adicional las requiere.
- Productor únicamente en empresa 0017 PRUEBAS ALUMINIOR. Observar sin guardar
  fichas de catálogo. La sesión en vivo requiere usuario presente; preguntar
  solo si aún no se ha confirmado su disponibilidad para esa sesión.
- Nuevas cargas remotas, merge a main y acciones irreversibles requieren aviso
  y autorización. Preparar primero resultado concreto, prueba local y reversión.

Nunca usar el importador completo ni abrir la MDB activa. Si hace falta MDB,
seguir PLAN-SIGUIENTE: copia de EMP0017 al scratchpad y lectura de la copia.
No eludir licencias ni copiar código/binarios propietarios. No probar guardados
ficticios en Supabase: usar PGlite para persistencia y rollback.

## Estado real de las investigaciones

1. Herrajes: Estructuras.Conjunto1..4 están vacíos en las 541 estructuras.
   ConfigSeries declara Abat1H/Abat2H/Abat1OB/Abat2OB; el CHM documenta
   su generación y posible herencia entre series. Hipótesis de unión por
   tipos de hoja: 12 coincidencias, 1 discrepancia y 9 desconocidas sobre
   22 reglas históricas. No se implementó como regla operativa.
2. Contraejemplo GMA65OHS/3HO: árbol con tipos 6+8 propone GM306+GM309+
   GMA65OHS; cuatro muestras históricas solo usan GM306+GMA65OHS. Falta
   distinguir diseño efectivo, selección de opciones y prioridad/herencia.
3. Banco generado en output/banco-precios/: 888 casos, 14 de 46 candidatas.
   32 sin muestras; 214 diseños específicos, 393 con horas explícitas,
   15 con precio manual/respetado, 1 con medidas inválidas. Todos pendientes
   de reproducción. No hay todavía adaptador que ejecute el motor sobre ellos.
   Tarifa/fecha, modo de valoración y vidrio no están verificados: el banco
   rechaza certificar paridad sin ese contexto. No forzar flags para hacerlo pasar.
4. Generador de catálogo: 46 candidatas visuales a medida inicial, ninguna
   nueva activada. Solo las 14 plantillas anteriores siguen operativas.
5. Manos: doble inversión entre etiquetas y dibujo. 1O2FL observado en 0017
   como hoja Dchas., bisagras derecha, manilla izquierda, 1300×1200; la web
   parte de 1400×1200. No invertir globalmente el renderer: revisar 2/2O y PDF.
6. Las cotas absolutas se proyectan hoy a proporciones en el generador
   experimental. No está validado el comportamiento al redimensionar.

## Objetivo de la próxima sesión

Obtener evidencia suficiente para una primera corrección de manos/cotas y
acotar la asignación de herraje. No terminar todas las familias en una sesión.

### A. Preparación local independiente de Productor

- Revisar el contraejemplo usando los tres CSV autorizados y el banco: diseño
  específico, conjuntos y opciones efectivas; no inferir selección por mayoría.
- Leer manual/configuración pertinente y separar conjunto ofrecido al usuario
  de conjunto que aporta piezas al despiece. Documentar lo que siga desconocido.
- Definir contrato del adaptador del banco al motor: entrada normalizada,
  configuración completa, tarifa identificada, material y precio por separado.
  Implementar y probar solo la parte respaldada por evidencia y fixtures
  sintéticos; no lanzar una comparación general si faltan entradas.
- Puede dividirse entre dos subagentes, sin compartir archivos. La sesión
  principal conserva el control exclusivo del escritorio y las decisiones de dominio.

### B. Observación 0017 con el usuario

Primero confirmar empresa visible y consultar sin guardar:

1. 1OD/1OI y 2/2O: vista interior/exterior, bisagras, manilla, hoja activa,
   texto literal y ubicación de cada tipo de hoja en Diseño V3.
2. 1OFI, 1O1FL, 1O2FL, 1O+1F+1O, 1O+2F+1O y 2O+ FIJO: medidas iniciales,
   posiciones, separadores visibles/invisibles y reglas de cotas. Registrar
   valores observados y ausencia de evidencia por separado.
3. Si queda tiempo, reconocimiento C2 con serie real y 1500×1200 en un
   presupuesto de prueba 0017. Explicar antes que se creará ese documento;
   no tocar documentos existentes. Capturar dibujo, árbol, cortes, herrajes,
   vidrio, tarifa, ajustes y precio. No implica activar correderas todavía.

Para probar otra medida, hacerlo en una línea de prueba autorizada, nunca
guardar cambios de una estructura de catálogo. No inventar una serie para C2.
Las capturas quedan en carpetas ignoradas; el documento versionado contiene
conclusiones y referencias locales, sin datos personales.

Incidencias conocidas: Productor puede tardar y mostrar No responde; observar
antes de repetir acciones. El pegado nativo devolvió texto viejo del portapapeles;
no usar filtros por pegado sin verificar. Evitar Ctrl+A: abrió Artículos.
No aceptar ni guardar una ficha como forma de cerrar la observación.

### C. Implementación posterior a la evidencia

- Resolver puro de asignación con resultados conocido/desconocido; cubrir
  casos simples, herencia ausente y mixtos antes de conectarlo.
- Corregir manos en modelo, composiciones, web y PDF conjuntamente, con
  regresiones de hoja simple y pareja. No cambiar etiquetas aisladamente.
- Mantener cotas fijas al redimensionar según lo observado. Comparar tamaño
  inicial y al menos otra medida que distinga cota absoluta de proporción.
- Activar por lotes solo tras comprobar dibujo, cortes, precio y persistencia.
  Si una pieza o un precio queda sin resolver, mantener resultado incompleto.
- C2, regla de unión y merge son hitos posteriores; la unión espera al taller.

## Entrega exigible al cerrar

Evidencia de lo observado, módulos y pruebas relevantes, informe de diferencias
por caso (no solo porcentajes), límites pendientes y siguiente experimento.
Actualizar este relevo/HANDOFF y crear commits locales concretos. Sin dumps,
credenciales, clientes ni output en Git. No prometer equivalencia total mientras
existan diferencias de fabricación o valoración sin explicar.

Mantener un único servidor web en puerto 3001. Comprobar si ya existe antes de
arrancar otro. La sesión anterior dejó Aluminior abierto y autenticado; comprobar
el estado actual y pedir al usuario que entre si hace falta, nunca su contraseña.

## Reparto recomendado de modelos

Recomendación de trabajo, no garantía de precisión: Astra para observación,
contradicciones de dominio y revisión de cambios de cálculo; GPT-5.6 Sol para
implementar módulos delimitados con evidencia y pruebas, y Terra para tareas
pequeñas bien especificadas si se prioriza consumo. No basta con un plan para
eliminar incertidumbre: cualquier ejecutor debe parar una inferencia no probada.
Referencia oficial consultada: https://developers.openai.com/api/docs/models/compare
No se deducen créditos de Codex ni límites de cuenta a partir de precios API.

## Actualización tras preparación A (19/09/2026)

Apartado A local completado en su alcance verificable. Leer primero
PREPARACION-LOCAL-A.md y ESPEC-ADAPTADOR-BANCO-MOTOR.md para no repetirlo.
Commits nuevos: bebce2c (especificación), 6907a8c (evidencia), 3d82f03
(adaptador Sol integrado en feature tras revisión; origen 6119eb2).
Las cuatro muestras 3HO tienen diseño específico y sólo registran opciones
GM306+GMA65OHS: no prueban el algoritmo de la plantilla. 3HO no está en el banco.
Registrado, seleccionado, ofrecido y aportación de piezas son hechos distintos.

Adaptador puro local preparado y probado con fixtures sintéticos. Materiales y
precio separados, rebajes explícitos, PVP Decimal y bloqueos conservadores.
19 pruebas y typechecks adaptador/core aprobados por Sol y por el responsable.
No ejecuta los 888 casos ni certifica valoración completa. Ninguna estructura activada.

Siguiente paso: B con presencia del usuario confirmada para la sesión, manos
simples/pareja y después cotas. No hubo observación Productor en este apartado.
Conservar permisos anteriores; no repetir cargas ni pedir otra vez su autorización.
No hubo push, merge a main ni nuevas operaciones Supabase.
Tarea Sol 01a0b9d5-8b3b-7aa3-9ac8-0a2de9f74a30 terminada y revisada;
worktree limpio en C:/Users/laral/Documents/Aluminior-worktrees/banco-motor-local.
## Actualización B1 revisada (19/09/2026)

B1 completado en su alcance de manos/manillas. Commit9727fe2, origen Sol63b9bea,
con revisión independiente y correcciones devueltas durante implementación.
Leer VERIFICACION-MANOS-B1.md, EVIDENCIA-MANOS-0017.md y EVIDENCIA-COTAS-0017.md.
Siete casos observados en0017; modelo/web/PDF corregidos juntos. Se conservan14
plantillas operativas y todas las medidas/proporciones anteriores; no se activó nada.

Verificación:48 core+41 web/PDF y tipos ambos por responsable;406 core por Sol;
14 controles catálogo local tras integración. No confundir estos controles con
paridad completa: firmas omiten manilla y mantienen divergencias conocidas.
PDF real y web1366/375 revisados con fixtures sintéticos; flujo real/despiece/
precio todavía pendientes. Capturas y artefactos ignorados en output/.

Siguiente: completar B2, no repetir A ni B1. Ya consultados1OFI,2O+ FIJO,1O1FL:
FI/F son Cota Variable default300, NO cota fija activa. Falta segundo tamaño en
líneas de presupuesto de prueba0017, con usuario presente y aviso de creación;
nunca cambiar catálogo. Faltan consultas completas de1O2FL y cadenas1O+1F+1O/
1O+2F+1O. Documento de cotas contiene medidas observadas y diferencias exactas.

Tarea Sol01a0ba1f-1b04-70e2-9c52-3b05b74904cc terminada, worktree limpio
C:/Users/laral/Documents/Aluminior-worktrees/manos-manillas-0017.
Productor quedó en lista Estructuras, filtro1o y selección1O1FL, sin guardar.
Servidor QA temporal cerrado; no quedó web activa3001 de esta tarea.
Permisos previos intactos; no nuevas cargas, push ni merge a main.
