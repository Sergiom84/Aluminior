# Asignación de conjuntos de herraje: investigación de catálogo

19/09/2026. Rama `feat/cerramientos-editor-linea`. Investigación de solo
lectura de exportación histórica autorizada; no se abrió ninguna MDB ni se
consultó/modificó Supabase. No cambia el comportamiento del configurador.

## Resultado

La propuesta de leer `Estructuras.Conjunto1..4` no sirve para esta exportación:
las **541 estructuras tienen vacías las cuatro columnas**. No hay que cargar
reglas vacías ni confundirlas con ausencia de herraje.

La fuente relevante es **ConfigSeries**, donde cada columna de apertura
contiene el código del conjunto generado. `ConfigSeriesHerraje` contiene
configuración de accesorios que alimenta esa generación; no es una relación
directa estructura → conjunto.

| Serie | Abat1H | Abat2H | Abat1OB | Abat2OB |
|---|---|---|---|---|
| GMA65OPT | GM248 | GM251 | GM249 | GM252 |
| ELEGANTPVC | HU528 | HU531 | HU529 | HU532 |

La correspondencia GMA65OPT/2O → GM252 concuerda con la observación de la
0017 documentada en `RECON-CERRAMIENTOS.md` §5 y con el histórico medido.
Esto no demuestra todavía el algoritmo para todas las aperturas ni los costes.

## Evidencia documental y recuentos

Manual CHM local, página **5.1.2.12.7.1 General** del asistente de series:
los códigos de herraje se asignan por tipo de apertura; el botón Generar
produce internamente las reglas correspondientes a cada configuración.
La página **5.3.1.3.2.1 Opciones de Herraje** explica que se pueden modificar
las opciones predeterminadas para las series que las tienen.

El manual también advierte de una excepción importante: una serie copiada
sin sus propios códigos puede seguir usando el herraje de la serie original.
Por tanto, un código vacío debe quedar **desconocido**, sin fabricar una regla
de «sin herraje». Tampoco se debe ejecutar Generar en el original para analizarlo.

En la exportación histórica local (no son recuentos de Supabase):

- 58 filas de ConfigSeries.
- 23 series con Abat1H y 23 con Abat2H.
- 17 series con Abat1OB y 17 con Abat2OB.
- Todas estas referencias existen en Conjuntos y tienen opciones.
- 26 series con Corr2H; todas las referencias existen en Conjuntos, una no
  tiene opciones. No se interpreta esa ausencia como herraje gratuito.
- ConfigSeriesHerraje: 18.752 filas, 2.540 con Accesorio informado.
  Ejemplo: GMA65OPT, NombreAcc `aAdPOB`, artículo GM4366.

Reproducción, sin escritura y sin cargar `.env`:

```powershell
node scripts/herraje-catalogo.mjs export_datos/EMP0016
```

El script lee exclusivamente Estructuras, ConfigSeries, ConfigSeriesHerraje,
Conjuntos y ConjuntosOpcionesHerraje. Emite sólo agregados y códigos de catálogo.

## Contraste de hipótesis con las 22 reglas históricas

Este contraste se ejecutó en lectura. La revisión automática bloqueó después
la generación del banco por el alcance previo limitado a cuatro catálogos;
se suspendieron nuevas lecturas documentales y se pidió autorización.
El usuario autorizó explícitamente VPresupuestosLin, VDatosLinEstr y
VOpcionesHerraje en solo lectura, con salida técnica local fuera de Git.
No supone autorización de escritura en Productor ni Supabase.

```powershell
node --import tsx scripts/herraje-contraste.mjs export_datos/EMP0016
```

Reutiliza la medición de reglas existente, leyendo VOpcionesHerraje,
VDatosLinEstr y VPresupuestosLin. No emite clientes, documentos ni sus IDs.
EstructurasDiseño es una tabla mixta: se excluyen todas las filas con TipoDoc
informado para construir los tipos de hoja de la plantilla de catálogo.

Hipótesis de investigación (no resolver operativo): tipos 1/2 → Abat1H,
5/6 → Abat1OB, 7 → Abat2H, 8/9 → Abat2OB. Añadir la propia serie al juego
de conjuntos y comparar conjuntos únicos ordenados. No clasifica por nombre
de estructura, familia ni número total de hojas, que sería incorrecto en mixtas.

Resultado: **12 coincidencias, 1 discrepancia, 9 desconocidas**. Las doce
coincidencias son oscilobatientes: hojas simples 5/6 y parejas 8; el contraste
actual no demuestra los tipos 1/2/7/9 aunque estén incluidos como hipótesis.
Las nueve desconocidas incluyen fijos, puertas y correderas fuera del alcance
de esa hipótesis. No se sustituyen por reglas vacías.

Contraejemplo importante: **GMA65OHS / 3HO**. La plantilla tiene tipos 6 y 8,
de modo que la unión ingenua propone GM306+GM309+GMA65OHS. Las cuatro muestras
históricas usan GM306+GMA65OHS. Puede intervenir un diseño particular de línea,
una selección diferente o una regla de prioridad. No se ha resuelto todavía;
este contraejemplo impide desplegar la unión automática de conjuntos.

## Siguiente cambio seguro

1. Contrastar contra el diseño efectivo de cada línea, no sólo contra su
   plantilla, empezando por 3HO y después los tipos no cubiertos.
2. Revisar semántica de grupos de apertura y prioridad en mixtas, referencias
   heredadas de series y casos sin hojas. Separar opciones ofrecidas de los
   conjuntos necesarios para el despiece.
3. Crear un resolver puro en core con resultado explícito conocido/desconocido
   y trazabilidad de campo de ConfigSeries; fixtures sintéticos de los casos
   comprobados, incluidos vacíos, herencia desconocida y contraejemplo mixto.
4. Sólo después preparar carga limitada y transaccional en PGlite y solicitar
   autorización de Supabase. No reutilizar el importador completo.

No se añade aún el resolver: promover ahora el mapeo propuesto a comportamiento
operativo introduciría una discrepancia conocida y daría falsa certeza a tipos
todavía no contrastados. Los dos scripts son herramientas de investigación.
