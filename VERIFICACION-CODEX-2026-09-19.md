# Continuación del editor y escaparate — 19/09/2026

## Copia de trabajo

El relevo de Claude está en `C:\Users\laral\Documents\Aluminior`, rama
`feat/cerramientos-editor-linea`, sobre `bc2758a`. La copia de OneDrive está
en `main` y es anterior. No se han unido ramas ni publicado cambios.
`PLAN-SIGUIENTE.md` y `env.example` ya estaban sin seguimiento; no se ha
incluido ni inspeccionado el contenido de `env.example`.

## Fase 1: implementación local

- Cargador exclusivo de catálogo, separado del importador completo: dry-run
  por defecto, destinos restringidos, validación previa de fuentes y claves,
  actualización de tres campos de opciones y recarga de tres tablas 0021.
- Transacción con aislamiento repetible, rollback y recuentos protegidos de
  presupuestos, líneas y clientes. No se modifican migraciones.
- Herraje: fórmulas y categorías conectadas; las marcas ocultas participan
  en las condiciones. Validación también en servidor.
- Acristalamiento: opciones y nombres desde 0021, elección persistida y
  usada para seleccionar la tabla. No se reutiliza un ajuste de junquillo
  medido para otra tabla: falta de evidencia mantiene valoración incompleta.

Verificación del subagente: cinco pruebas ETL con PGlite y cadena completa
0000–0021, incluyendo rollback tras escrituras parciales e idempotencia;
45 pruebas unitarias web distintas; typechecks DB, ETL y web aprobados.
Los errores de selección se muestran fuera de pestañas ocultas, con role alert;
se rechazan CSV de conjuntos que omitan columnas de opciones Hojas/Fijos 1–5.
La prueba de integración de valoración no pudo ejecutarse: no hay PostgreSQL
de pruebas escuchando en localhost:55433. No se sustituyó por la base real.

La prueba con CSV reales pasó después de la autorización explícita del usuario
para leer únicamente ConjuntosOpcionesHerraje, ConjuntosCatOH, Conjuntos y
TAcristalamiento de `export_datos/EMP0016` en PGlite. Esto resolvió el bloqueo
previo de revisión automática. No se leyeron documentos ni clientes reales.

Resultado: 6/6 tests ETL aprobados, ninguno omitido. Se cargaron localmente
11.854 opciones, 2.058 categorías, 143 alternativas de acristalamiento
procedentes de 50 conjuntos, y 70 tablas. De 15.063 conjuntos leídos,
15.013 no tenían tablas de acristalamiento y no generaron alternativas.
El test recrea las claves de opciones en PGlite; estos recuentos no prueban
todavía las coincidencias con las claves existentes en Supabase.
La expectativa de incompatibilidad GM252/4 se corrigió de `o1` a la fórmula
real completa `o1+o508+o509`, que el cargador ya conservaba correctamente.
GMA65OPT devuelve las cuatro tablas GM69, GM70, GM71 y GM72 en orden.
Los registros sintéticos protegidos permanecieron en 1 presupuesto, 1 línea
y 1 cliente. La base PGlite fue temporal, sin conexión remota.

Tras autorización explícita del usuario, se ejecutó la carga en Supabase.
La primera simulación detectó doble serialización JSON del adaptador
postgres.js (22023); se corrigió con parámetros `tx.json`, sin escrituras.
La simulación posterior confirmó 11.854 coincidencias y cero opciones ausentes.
Las seis pruebas ETL y el typecheck ETL volvieron a pasar antes de aplicar.
Se guardó respaldo local de las columnas afectadas de opciones y las tres
tablas nuevas en `output/editor-linea-respaldo.json`, ignorado por Git.
Las tres tablas nuevas estaban vacías antes de cargar.

La carga confirmó 11.854 opciones actualizadas, 2.058 categorías, 143
alternativas y 70 tablas. Una consulta posterior confirmó su persistencia.
Antes, durante y después: 3 presupuestos, 1 línea y 504 clientes.
No se ejecutaron migraciones ni guardados de documentos para la verificación.

## Observación visual realizada

Productor abierto: cabecera **PRUEBAS ALUMINIOR - 2026 [0017]** confirmada.
Se consultó Ficheros → Artículos → Estructuras → 1O2FL → Editar → Diseño V3.
La ficha indica familia **020 OSCILOBATIENTES**. El árbol de Diseño V3 dice
literalmente **Hoja (1 H.Oscilo. Dchas.)**; la manilla está a la izquierda
y las bisagras a la derecha. Medidas iniciales visibles: **1300 × 1200 mm**.
Aluminior tenía **1400 × 1200 mm**: no se ha supuesto paridad dimensional.
La orientación interna y su representación tienen una doble inversión.
Se conserva el comportamiento visual anterior: corregirlo globalmente sin
auditar las 14 plantillas podía invertir las parejas de hojas de 2 y 2O.

Se cerró Diseño V3 con la X del título, sin Aceptar ni guardar. No se crearon
presupuestos ni se eliminaron registros. El pegado en el filtro de catálogo
reprodujo la incidencia ya documentada del portapapeles; se restableció el
filtro mediante «Anula todos los filtros actuales». No afectó a una ficha.
Productor sufrió esperas y estados «No responde» durante la consulta.

Aluminior: un solo servidor local en puerto 3001. El usuario inició sesión.
Se abrió la ficha usada por el relevo, sin guardar líneas ni cabecera:

- Estado previo 2O + GMA65OPT: CREMONA marcada y CERRADURA sin bloqueo;
  Acristalamiento ofrece únicamente GM69. Coincide con la falta de carga.
- Nueva categoría OSCILOBATIENTES visible y separada de VENTANAS ABATIBLES.
- Pestañas: flecha izquierda desde Acristalamiento pasa a Opc.Herraje,
  saltando Cargos Adic. deshabilitada.
- Capturas de herramienta a 1440 × 900 y 390 × 844. En móvil, anchura del
  documento 375 frente a viewport 390, sin desbordamiento horizontal.

Después de la carga autorizada se comprobó 2O + GMA65OPT en la web:
GM252 muestra CREMONA + FALLEBA marcada y CERRADURA desmarcada y bloqueada;
las categorías tienen sus descripciones. Acristalamiento ofrece GM69–72
con nombres para hojas/fijos, opción 1 seleccionada y opción 5 deshabilitada.
Se capturaron ambas pestañas y se cerró el editor sin guardar líneas.
Queda acreditado el resultado visible del catálogo; no se afirma paridad
de cortes o precio para las nuevas alternativas sin su evidencia específica.

## Fase 2 y límites

Ver `EVIDENCIA-ESCAPARATE.md`: clasificador/generador conservador y control
de las 14 plantillas. El análisis histórico cuenta 541 estructuras,
46 candidatas visuales a medida inicial y 495 pendientes. Hay 40 registros
de familia 020 en esa exportación, no las 42 mencionadas por el relevo.
Los artefactos de catálogo son locales e ignorados por Git.
Verificación final: 377 pruebas core aprobadas en 33 archivos y typecheck
core aprobado. Diff revisado sin errores de espacios; no hay cambios de
orientación en el renderer ni en la geometría PDF.

Una candidata visual no acredita cortes, precio ni redimensionado con cotas
fijas. No se ha habilitado ninguna estructura nueva. Las discrepancias del
control impiden declarar terminada la fase 2; la corredera C2, la regla de
unión y la unión a main siguen pendientes conforme al plan.
