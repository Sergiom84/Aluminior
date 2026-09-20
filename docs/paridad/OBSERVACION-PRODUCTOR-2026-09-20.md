# Productor: recorrido aportado por el operador el 20/09/2026

## Alcance y fuentes

Registro solicitado por el usuario para conservar sus indicaciones y doce capturas.
Documenta comportamiento de referencia y requisitos para Aluminior; no acredita
que estos cambios estén implementados ni cierra por sí solo ninguna fase.

- **Visible:** dato o control legible en una captura.
- **Operador:** acción o resultado explicado expresamente por el usuario.
- **Pendiente:** semántica que una imagen estática o el relato no permiten resolver.

Las capturas originales se conservan localmente en
`output/paridad-productor/20260920-operador/`, fuera de Git por contener datos
comerciales. `manifest.json` relaciona E01–E12 con los nombres originales, tamaño
y SHA256. Se verificó que las doce copias coinciden con los originales de Temp.
Los enlaces de este documento requieren esa carpeta privada en el equipo.
Los identificadores E01–E12 son locales a este registro, no los del plan de fase 0.
No se transcriben los clientes de la lista.

## Recorrido que debe conservarse

1. **Entrada y aceptación inicial.** Desde Presupuestos de Clientes se utiliza
   Nuevo. El usuario describe «cuando se genera un nuevo cliente, se pulsa en
   aceptar». E02 muestra realmente **Nuevo Documento**, con campo Cliente,
   Fecha, Delegación, Potencial, Tipo Documento, Divisa, Serie, Número y
   Observaciones del Cliente. Conservar esta distinción: no hay evidencia de
   un alta completa en el maestro de clientes. Se pulsa **Aceptar**.
2. **Añadir al presupuesto.** Ya en Presupuestos de Clientes · Detalle, pulsar
   el **+ verde** de Operaciones sobre la Línea (E03; confirmado por el operador).
3. **Componer el cerramiento.** Arrastrar los elementos desde la barra inferior
   al área de trabajo (operador). E04 muestra una composición de seis elementos:
   cinco ventanas de dos hojas y un fijo estrecho en cuarta posición.
   La captura no prueba las reglas de inserción o sustitución al soltar.
4. **Modificar un elemento.** Pulsarlo, cambiar sus medidas o cualquier otro
   valor y pulsar **Actualizar** (operador). E04 muestra posición X/Y,
   Ancho/Alto, PERFILES, VIDRIO y campos de acabado en Elemento seleccionado.
   Es una aplicación explícita de los cambios; no asumir aplicación inmediata.
5. **Acceder a uniones.** Pulsar el botón de la barra superior señalado por la
   flecha roja dibujada por el usuario en E07: pictograma de rectángulos,
   inmediatamente a la derecha del ojo. El operador confirma que permite
   acceder a la opción de unión. La flecha es una anotación, no un control.
6. **Seleccionar una unión.** Introducir el código y usar la lupa para buscar.
   E05 contiene **PSU001 — (PS) H UNION PARA COMPACTOS 100mm** y E08 muestra
   ese código seleccionado. Según el operador, solo permite cambiar la
   **longitud**. E08 muestra Longitud 1200 mm y Grosor 2 mm, además de la
   casilla Longitud de la unión Manual, Acabado y Tipo de Unión. La presencia
   de esos controles no demuestra que todos sean editables para esta unión.
7. **Seleccionar perfiles.** Escribir **ELEGANTPVC** o la referencia que
   corresponda en **PERFILES** y pulsar la lupa (operador). E09 muestra
   ELEGANTPVC — PVC SERIE ELEGANT INFINITY THERMOFIBRA y otras muchas series.
   Este campo busca referencias de perfiles; no es texto descriptivo libre.
8. **Seleccionar vidrio y buscar artículos.** Conservar el catálogo amplio
   mostrado en E10 y el acceso adicional mediante el símbolo situado entre
   el campo VIDRIO y la lupa (operador). Este símbolo abre la **Búsqueda de
   Artículos** con la herramienta de doble acristalamiento de E11.
9. **Aplicar al conjunto.** El usuario confirma haber actualizado tanto
   ventanas como uniones. Existen dos acciones distintas: **Actualizar todos
   los elementos** (E04) y **Actualizar todas las uniones** (E08), además de
   Actualizar para la selección. No fusionarlas ni dar por probada la herencia
   exacta o qué propiedades copia cada operación colectiva.
10. **Volver al documento.** El configurador muestra Aceptar (E06/E07).
    El operador relata que, tras actualizar y generar el presupuesto, aparecen
    Edición de línea y Presupuestos de Clientes · Detalle, con la primera
    superpuesta. Pulsa **Cerrar** en Edición de línea para ver el presupuesto.
    Esa superposición y el clic de cierre proceden del relato; no hay una
    captura de la ventana intermedia ni una prueba de cancelación de cambios.
11. **Forma de pago.** En el detalle, seleccionar **01 - Efectivo** o
    **02 - transferencia**, según corresponda, y pulsar **Aceptar** (operador).
    E12 muestra el campo F.Pago todavía vacío: los códigos y el último clic
    están confirmados por el relato, no por una captura del documento guardado.

## Catálogos y buscadores que hay que incluir

Requisito explícito del usuario: las búsquedas ofrecen muchas posibilidades y
Aluminior debe incluirlas. No reducir la referencia funcional a dos uniones o
una sola serie. Las capturas son muestras, no una exportación completa del catálogo.

- **Uniones (E05):** columnas Código y Descripción; aparecen GMU038–GMU041,
  PSU001–PSU009 y U / SIN UNION. Hay búsquedas por campo, segunda condición,
  opción Todas las palabras, orden por Código, segundo orden y Reset.
- **Perfiles (E09):** Código, Descripción y DescripcionVentas; ELEGANTPVC y
  numerosas series. El diálogo también ofrece condiciones de búsqueda y orden.
- **Vidrios/artículos (E10):** Código, Descripción y DescripcionVentas;
  laminados, espejos, paneles, opciones sin vidrio y otros artículos.
  No restringir el selector a unas pocas composiciones predeterminadas.
- **Doble acristalamiento (E11):** Cámara desplegable; dos listas, Vidrio 1 y
  Vidrio 2, con Código, Descripción y filtros; campo Código resultante;
  tabla inferior de resultados; pestañas Doble Acristalamiento y Equivalentes;
  acciones Aceptar, Cerrar y Reset. Es un acceso distinto del catálogo general.
  Quedan pendientes la regla de formación del código, cámaras disponibles,
  selección efectiva y funcionamiento de Equivalentes.

La búsqueda y la selección deben conservar códigos canónicos y las descripciones
correspondientes. Obtener el catálogo completo de fuentes autorizadas; no
reconstruirlo inventando opciones fuera de las capturas.

## Inventario de evidencia

| ID | Captura local | Lo que acredita visualmente |
|---|---|---|
| E01 | [Lista](../../output/paridad-productor/20260920-operador/captura-01.png) | Lista de presupuestos; acciones Editar, Nuevo y Emitir. |
| E02 | [Nuevo Documento](../../output/paridad-productor/20260920-operador/captura-02.png) | Formulario inicial y botones Aceptar/Cerrar; no es pantalla de alta del maestro de clientes. |
| E03 | [Detalle vacío](../../output/paridad-productor/20260920-operador/captura-03.png) | Presupuesto 260496, revisión 0, serie A, tarifa 1; + verde bajo las líneas. |
| E04 | [Composición y elemento](../../output/paridad-productor/20260920-operador/captura-04.png) | Seis módulos; estructura 2O seleccionada, 1200 × 1200; campos y actualizaciones. |
| E05 | [Catálogo de uniones](../../output/paridad-productor/20260920-operador/captura-05.png) | Búsqueda de Estructuras con varias familias y opción sin unión. |
| E06 | [Estado intermedio de unión](../../output/paridad-productor/20260920-operador/captura-06.png) | Global 6400 × 1200; código GMU038 junto a descripción PS 100mm; longitud 1200 y grosor 2. |
| E07 | [Acceso señalado](../../output/paridad-productor/20260920-operador/captura-07.png) | Botón marcado con flecha roja; global 6380 × 1200; unión sin código, grosor 20. |
| E08 | [PSU001 seleccionada](../../output/paridad-productor/20260920-operador/captura-08.png) | Código y descripción coinciden; longitud 1200, grosor 2; actualización individual/colectiva. |
| E09 | [Catálogo de perfiles](../../output/paridad-productor/20260920-operador/captura-09.png) | ELEGANTPVC y otras series; tres columnas de identificación/descripción. |
| E10 | [Catálogo de vidrio/artículos](../../output/paridad-productor/20260920-operador/captura-10.png) | Varias familias de vidrio, paneles y opciones sin vidrio. |
| E11 | [Doble acristalamiento](../../output/paridad-productor/20260920-operador/captura-11.png) | Cámara, dos vidrios, código resultante, resultados y pestaña Equivalentes. |
| E12 | [GRUPO generado](../../output/paridad-productor/20260920-operador/captura-12.png) | Una línea GRUPO, dibujo, medidas, valoración y totales del documento. |

## Resultado visible y correcciones respecto a supuestos anteriores

E12 muestra el presupuesto **260496**, revisión **0**, fecha **20/09/2026**,
serie **A**, tarifa **1**, estado **PENDIENTE**, con una única línea **GRUPO**:

| Campo | Valor visible |
|---|---|
| Cantidad | 1,00 |
| Ancho × alto de línea | 6300 × 1200 mm |
| Acabado de línea | UNI |
| Precio unitario / total de línea | 3150,44 |
| Subtotal / base imponible | 3150,44 |
| IVA | 21 %; 661,59 |
| Total documento | 3812,03 |

La descripción visible incluye ventana abatible de dos hojas, una oscilobatiente,
medidas 1200 × 1200, color L. BLANCO y PVC SERIE ELEGANT INFINITY THERMOFIBRA.
El resto está recortado. No equiparar el código UNI de la columna Acabado con
el texto de color ni completar por inferencia la composición de vidrio.
Hay dibujo del conjunto; Det.Grupo está disponible y Det.Estructura aparece atenuado.

**Corrección relevante de geometría:** «100mm» pertenece a la descripción de
PSU001, mientras que E08 muestra **Grosor 2 mm**. No prueba un hueco de 100 mm
entre ventanas. La receta sintética anterior de Aluminior con uniones 100/60 mm
no debe imponerse como comportamiento demostrado de Productor.

Los globales 6380, 6400 y 6300 de E07, E06 y E12 son estados diferentes; el orden
de adjuntos no demuestra la secuencia exacta de cambios. E06 combina código
GMU038 con descripción de PSU001: conservarlo como discrepancia intermedia,
no como correspondencia válida de catálogo. No deducir la fórmula de ancho
ni la contribución de cada unión a partir de estas diferencias.

Esta sesión usa altura 1200; no reproduce la fixture local 6640 × 1020 ni el
caso histórico 6900 × 1020. E07 identifica PRUEBAS ALUMINIO - 2026 [0017]; la
continuidad del recorrido entre capturas procede del relato del operador.
No hay reapertura final, PDF ni comparación con iguales entradas en Aluminior.

## Cambios pendientes y uso en futuras sesiones

| Área/fase | Requisito registrado | Falta comprobar antes de aceptar paridad |
|---|---|---|
| 1. Guardado | Aceptaciones sucesivas y una línea GRUPO; retorno desde Edición de línea | Reapertura de este caso y conservación de pago, materiales, módulos y uniones. Se mantiene la aceptación técnica local existente. |
| 2. Geometría | Unión seleccionable y distinción descripción/grosor; caso 6300 × 1200 | Entradas finales de cada módulo/unión y misma tarea en ambas aplicaciones; no cerrar por similitud visual. |
| 3. Presupuesto e inserción | Nuevo → Aceptar → + verde; arrastrar desde barra inferior; catálogos amplios; forma de pago | Destinos del arrastre, inserción/sustitución y persistencia del pago. |
| 4. Elementos | Editar y Actualizar; perfiles por código/lupa; Actualizar todos los elementos | Alcance de la actualización colectiva, herencia y excepciones por elemento. |
| 5. Vidrios | Catálogo general y herramienta de doble acristalamiento separados | Código resultante, equivalentes y aplicación efectiva al elemento/hueco. |
| 6. Uniones | Botón de acceso, catálogo completo, longitud y Actualizar todas las uniones | Editabilidad por referencia, grosor efectivo, acabados y compatibilidades. |
| 7. Valoración | Resultado GRUPO y total visible de este caso | Receta final íntegra y valoración reproducible; no convertir 3150,44 en precio esperado universal. |
| 8. Aceptación integral | Recorrido documentado y puntos de actualización explícitos | Teclado, reapertura, PDF y contraste integral con el operador. |

Antes de continuar implementación, leer este registro junto a
[estado de fases](ESTADO-FASES.md) y [aceptación local de fase 2](fase-2/03-aceptacion-local.md).
Las observaciones posteriores deben añadirse fechadas, conservando las diferencias
entre evidencia visible, explicación del operador y reglas aún no verificadas.

Continuación del 20/09/2026: [Actualización explícita de medidas y corrección de PSU001](IMPLEMENTACION-ACTUALIZAR-2026-09-20.md). Implementación y verificaciones locales; contraste integral pendiente.

Observación directa posterior, distinta de estas doce capturas: [cierre de jornada](../CIERRE-JORNADA-2026-09-20.md). No se completó ni guardó de forma comprobada el nuevo caso; leer el punto de interrupción antes de continuar.
