# Preparación local A: diseños efectivos y contrato de diagnóstico

19/09/2026. Copia vigente C:/Users/laral/Documents/Aluminior.
Base de investigación edfc346; especificación delegada en bebce2c.
Lecturas locales solamente. No se regeneró el banco ni se consultó Supabase.
No se abrió Productor, una MDB ni tablas documentales adicionales.

## Contraejemplo 3HO / GMA65OHS

Se contrastaron VPresupuestosLin, VDatosLinEstr y VOpcionesHerraje de la
exportación autorizada EMP0016, uniendo por documento Y línea y restringiendo
las tablas mixtas a VPRES. Los identificadores sólo se usaron en memoria.

Las cuatro muestras declaran DisEspecificoSN=True, DisHerraje vacío y
PendienteGenSN=False. Cada una registra 29 opciones: 19 de GM306 y 10 de
GMA65OHS. No consta GM309 ni seleccionado ni deseleccionado. El responsable
principal reprodujo estos recuentos de forma independiente.

Los tres CSV no contienen el árbol del diseño específico. No está demostrada
la equivalencia entre esos diseños y la plantilla de catálogo con tipos 6+8.
Por tanto, estas muestras no confirman NI refutan por sí solas la unión de
conjuntos deducida del árbol de catálogo. Sigue sin ser una regla operativa.

El banco existente conserva 888 casos y contiene CERO casos 3HO. La investigación
del contraejemplo se hizo directamente sobre los CSV autorizados. No ampliar
automáticamente el banco ni afirmar que 3HO está entre sus 14 estructuras.

Comprobaciones complementarias de la revisión independiente:
- Las selecciones coinciden con los valores por defecto del catálogo exportado;
  esto no demuestra qué hizo el operador ni la vigencia histórica del catálogo.
- GM306 y GM309 tienen las mismas 19 opciones salvo el identificador del conjunto,
  pero sus asociaciones difieren (39 frente a 45). No son conjuntos intercambiables.
- ConfigSeries y los campos de herraje de Conjuntos enlazan las aperturas simple
  y pareja con GM306 y GM309, respectivamente. No explica por sí solo el diseño efectivo.
- Cuatro artículos presentes sólo en asociaciones GM309 no aparecen en las hijas
  de esas muestras. Es compatible con ausencia de aportación, no prueba causalidad.

## Cuatro hechos diferentes

| Hecho | Fuente necesaria | Límite |
|---|---|---|
| Opción registrada | VOpcionesHerraje.Conjunto/nOpcion | No prueba visibilidad ni aportación |
| Opción seleccionada | SelecSN | No garantiza que se genere su artículo |
| Opción ofrecida visiblemente | UI y filtros aplicables/OcultaSN | No deducir solo del registro |
| Conjunto que aporta piezas | Asociaciones cumplidas y trazabilidad de despiece | No inferir por mayoría |

El CHM 5.1.2.12.7.7.2 explica que una opción marcada habilita asociaciones
sujetas a filtros; una desmarcada impide su aportación. Sólo se muestran opciones
con asociaciones aplicables a la apertura y contexto, respetando Oculta.
Se releyeron también 5.1.2.12.7.1 (generación y herencia) y 5.3.1.3.2.1.
El responsable reprodujo la lectura de los párrafos de filtros/visibilidad.

Ruta local del manual ya extraído (no versionar contenido ni imágenes):
C:/Users/laral/AppData/Local/Temp/claude/C--Users-laral-Documents-Aluminior/
bb096a57-b9e1-4737-b1f6-cfc76dc5eee1/scratchpad/chm/
Páginas: 5_1_2_12_7_1_general.htm, 5_1_2_12_7_7_2_opciones_de_her.htm,
5_3_1_3_2_1_opciones_de_herraj.htm.

medir-herrajes.ts mide firmas de conjuntos REGISTRADOS sin resolver el diseño,
SelecSN ni asociaciones efectivas. Sus 22 reglas no certifican el despiece.

## Cambio delimitado para Sol

ESPEC-ADAPTADOR-BANCO-MOTOR.md define entradas, alcance, archivos, bloqueos y pruebas.
Adaptador puro de diagnóstico, separado del comparador histórico v1. Plantilla
resuelta explícita, material y precio independientes, fixtures sintéticos,
rebajes obligatorios y contexto de tarifa identificado. No activa estructuras
ni habilita ninguno de los 888 casos reales para comparación general.

Tarea: 01a0b9d5-8b3b-7aa3-9ac8-0a2de9f74a30, GPT-5.6 Sol.
Worktree: C:/Users/laral/Documents/Aluminior-worktrees/banco-motor-local.
Rama: codex/banco-motor-local; base exacta bebce2c598fa100142deacc9ef7734feff0176c7.
La tarea se creó sin proyecto guardado porque el único proyecto de la app apunta
a OneDrive; sus instrucciones fijan exclusivamente el worktree correcto.
node_modules enlaza dependencias existentes; no se modifican ni se instala nada.
El arquitecto conserva los documentos; Sol sólo posee los nuevos archivos de diagnóstico.
Implementación y revisión completadas; resultados en la sección final.

## Siguiente evidencia

Mantener el orden B del relevo: manos simples/pareja, después las seis divergencias
de cotas y geometría, con usuario presente y empresa 0017 visible, sin guardar catálogo.
Para herraje: observar 3HO/GMA65OHS de plantilla intacta; registrar árbol, conjunto
ofrecido, opciones visibles y marcas. Un ensayo posterior autorizado puede variar
sólo la pareja/hojas conservando medidas y serie para discriminar dependencia del
diseño frente a filtrado/prioridad. No crear ni alterar documentos ahora.
No hace falta ampliar lecturas históricas para preparar ese experimento.


## Implementación y verificación cerradas

Sol entregó 6119eb24a1fdbd5d4e0de5989bf0f91f6e400741. Tras revisar diff,
corregir los hallazgos y repetir las comprobaciones relevantes, se integró
mediante cherry-pick en la rama feature como 3d82f03. Sin merge a main ni push.

Ocho archivos nuevos: scripts/lib/banco-motor/ (seis módulos),
scripts/banco-motor.test.ts y scripts/tsconfig.banco-motor.json.
El módulo ejecuta las APIs públicas reales de core sobre entradas preparadas;
no consulta tablas, ficheros ni entorno y no altera el comparador v1.

Correcciones exigidas en revisión y cubiertas por regresiones:
- ausencia de cotas/tablas, raíz nula y campos mal tipados: bloqueo explícito;
- precioManual=0 sigue siendo manual; PVP textual "0" puede ser válido;
- PVP conserva Decimal textual hasta resolver catálogo, sin conversión previa;
- cotas a/l no sobrescriben dimensiones y no se admiten claves equivalentes;
- fórmulas léxicamente inválidas no hacen lanzar el diagnóstico;
- comparar un diagnóstico bloqueado es seguro y devuelve no-comparable.

Comprobación independiente del responsable sobre el commit final:
- node --import tsx --test scripts/banco-motor.test.ts scripts/banco-precios.test.mjs:
  19/19 (15 nuevas, 4 banco v1), cero omitidas.
- node node_modules/typescript/bin/tsc -p scripts/tsconfig.banco-motor.json: correcto.
- npm run -w @aluminior/core typecheck: correcto.
- git diff --check: correcto; ocho archivos dentro del alcance, sin datos reales,
  secretos, migraciones ni cambios de aplicación.
- Revisión de cohesión: módulos de ejecución/validación/comparación separados;
  test de 334 líneas conserva una fixture técnica compartida y sus invariantes,
  sin responsabilidades de producción. Ningún archivo nuevo supera 400 líneas.

Límites: importe por una composición de materiales parciales; no total comercial,
vidrio, asociaciones completas de herraje, ajustes manuales ni adaptador general
de las filas históricas. La comparación conserva faltantes/sobrantes exactos;
el resumen de cambios empareja por artículo/función, sin identidad de pieza de fabricación.
La igualdad parcial no certifica fabricación ni paridad Productor.
Los 888 casos reales mantienen sus motivos originales y no se han ejecutado.

La observación B sigue pendiente de confirmación de presencia del usuario.
No se ha controlado Productor ni modificado el servidor web durante este apartado.
env.example permanece ajeno y sin seguimiento. Se conserva el worktree de Sol
limpio para revisión; no borrarlo ni reutilizarlo concurrentemente.
