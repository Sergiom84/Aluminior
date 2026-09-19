# Preparación técnica B2: cotas de diseño

## 1. Base, alcance y criterio de evidencia

- Worktree revisado: `C:/Users/laral/Documents/Aluminior-worktrees/preparacion-cotas-b2`.
- Rama: `codex/preparacion-cotas-b2`.
- Base exacta: `4cefd392a340c962518f13287ed0c13a79b5aa23`.
- La base contiene como ancestros `3bbe321`, `f4ca3a6` y `edfc346`.
- B1 está integrado en `9727fe2`; este informe no cambia manos, manillas,
  catálogo operativo, persistencia, motor, web ni PDF.
- No se ha usado escritorio, red, base de datos ni datos empresariales. No se
  han ejecutado pruebas ni comandos que puedan aplicar migraciones.

Fuentes verificadas para este informe: código y pruebas de la base indicada,
`AGENTS.md`, `CLAUDE.md`, `CONTINUACION-ARQUITECTURA-B2.md`,
`RELEVO-SIGUIENTE-SESION.md`, `VERIFICACION-MANOS-B1.md`,
`EVIDENCIA-MANOS-0017.md`, `EVIDENCIA-COTAS-0017.md`, la observación adicional
del arquitecto en Productor 0017 comunicada el 19/09/2026, documentación de
arquitectura/paridad citada por el relevo y el CHM
`5_1_2_2_1_1_2_4_propiedades_de.htm`.

La distinción que debe gobernar B2 es:

1. **Observado en Productor**: puede convertirse en aceptación cuando haya
   segunda medida y referencia inequívoca.
2. **Documentado por el CHM**: define conceptos generales, pero no demuestra
   por sí solo cómo están configuradas estas seis estructuras.
3. **Codificado hoy en Aluminior**: describe el comportamiento presente, no
   prueba que Productor haga lo mismo.
4. **Hipótesis**: no debe entrar en reglas, catálogo operativo ni pruebas que
   pretendan certificar paridad.

En particular, los valores 300 de `FI`, `F` y `FD` sólo están demostrados como
valores por defecto de las cotas variables concretas inspeccionadas. No están
demostrados como cota fija, proporción, mínimo, máximo ni regla universal. El
símbolo tampoco tiene semántica global: `FI` significa `FIJO INFERIOR` en
`1OFI`, pero `FIJO IZQUIERDO` en `1O2FL`.

## 2. Evidencia disponible y ausencia decisiva

| Caso | Observado en Productor 0017 | Codificado hoy | Estado B2 |
| --- | --- | --- | --- |
| `1OFI` | 900×1500; travesaño horizontal desde abajo; cota **variable** `FI`, `FIJO INFERIOR`, default 300 | 800×1500; reparto visual 4:1 | Falta segunda medida y efecto sobre `FI` |
| `2O+ FIJO` | 1200×1200; travesaño horizontal desde abajo; cota **variable** `FI`, default 300 | 1200×1500; reparto visual 4:1 | Falta segunda medida y efecto sobre `FI` |
| `1O1FL` | 1200×1200; travesaño vertical desde la derecha; cota **variable** `F`, `FIJO LATERAL`, default 300 | 1100×1200; reparto visual 8:3 | Falta segunda medida y efecto sobre `F` |
| `1O2FL` | 1300×1200; `FI` = `FIJO IZQUIERDO`, variable 300, `Vertical (Izquierda)`; `FD` = `FIJO DERECHO`, variable 300, `Vertical (Derecha)`; primer travesaño a la izquierda y segundo anidado en el hueco restante; hoja central `Dchas.` | 1400×1200; reparto visual 3:8:3 | Falta segunda medida, referencia concreta del segundo eje y efecto sobre `FI`/`FD` |
| `1O+1F+1O` | 1500×1200; hoja/fijo/hoja; ambas hojas `Dchas.` con manilla a la izquierda; dos travesaños `Ventana` visibles; `Equidistante 3`, `Vertical (Izquierda)` | 2100×1200; tres huecos iguales, divisiones invisibles y manos opuestas | Falta segunda medida y comprobar distancias entre ejes/huecos libres |
| `1O+2F+1O` | 2100×1500; fijo/hoja/fijo/hoja; ambas hojas `Dchas.` con manilla a la izquierda; tres travesaños `Ventana` visibles; `Equidistante 4`, `Vertical (Izquierda)`; `De Usuario` marcada | 2800×1200; hoja/fijo/fijo/hoja, divisiones invisibles y manos opuestas | Falta segunda medida y significado operativo de `De Usuario` |

El CHM sí establece, de forma general:

- `Posición` fija orientación y lado desde el que se toma la cota.
- La distancia llega hasta el **eje del travesaño**.
- La referencia normal es el exterior del elemento contenedor; `Fija desde
  elemento Exterior` usa el elemento más exterior.
- `Equidistante` iguala distancias entre ejes, no necesariamente huecos libres.
- `Cota Variable` añade nombre, símbolo y valor por defecto y puede editarse en
  la línea sin entrar en Diseño V3.
- Un mismo símbolo puede estar asociado a varios travesaños.

No está demostrado todavía qué perfil materializa cada eje, qué valores o
distancias conserva Productor al redimensionar, ni qué hace con medidas
inviables. La observación adicional cierra topología y configuración inicial de
las tres composiciones, pero no aporta aún la segunda medida.

## 3. Mapa del código actual

### 3.1 Catálogo y modelo visual en `core`

| Ruta | Símbolos reales | Responsabilidad y límite actual |
| --- | --- | --- |
| `packages/core/src/estructuras/diseno.ts` | `PlantillaDiseno`, `DivisionVisual`, `HijoVisual`, `PLANTILLAS_DISENO`, `distribuirComposicion`, `plantillaDiseno` | Define 14 plantillas manuales. `HijoVisual.proporcion` es el único dato de reparto interior; no conserva símbolo, modo, lado, eje de referencia ni valor editable de una cota. |
| `packages/core/src/estructuras/diseno-catalogo.ts` | `NodoCatalogo`, `EstructuraCatalogo`, `generarPlantillaCatalogo` | Reconstruye candidatas desde el árbol. Para `tipoCota === 1` y dos huecos transforma una medida inicial en dos pesos; después se pierde la semántica absoluta. El mapeo `HB/VD` al último hueco y `HA/VI` al primero es código actual, no una regla B2 observada a dos tamaños. |
| `packages/core/src/estructuras/geometria-apertura.ts` | `geometriaAperturaVisual` | Sólo manos, trazos, bisagras y cierre. B1 lo verificó; no debe recibir reglas de cotas. |
| `packages/core/src/estructuras/cerramiento.ts` | `ModuloCerramiento`, `ConfiguracionCerramiento`, `VERSION_CONFIGURACION_CERRAMIENTO`, `crearConfiguracionCerramiento`, `actualizarModuloCerramiento`, `esConfiguracionCerramiento` | La configuración v1 guarda por módulo sólo `id`, código, ancho y alto. No guarda cotas ni una versión de geometría interna. |
| `packages/core/src/estructuras/resultado-cerramiento/*` | `ResultadoCerramientoV1`, `esResultadoCerramiento` | El snapshot de materiales embebe la configuración; hoy tampoco puede acreditar qué valores de cota entraron al motor. |

Pruebas que protegen ese comportamiento: `diseno.test.ts`,
`diseno-catalogo.test.ts`, `geometria-apertura.test.ts`, `cerramiento.test.ts` y
`resultado-cerramiento/validar.test.ts`.

### 3.2 Importación y catálogo persistido

| Ruta | Símbolos/tablas reales | Situación |
| --- | --- | --- |
| `packages/db/src/schema/despiece.ts` | `estructuraCotas` / `estructura_cotas` | Guarda `simbolo`, `valorPorDefecto`, `nombre`, `orientacion` y `ordenTravesano`. Son defaults de catálogo, no valores de una línea. |
| `packages/db/src/schema/despiece.ts` | `estructuraDisenoNodos` / `estructura_diseno_nodos` | Guarda una proyección parcial del árbol: id, tipo, padre, travesaño, posición e invisibilidad. No guarda todos los campos que consume `NodoCatalogo` (`TipoCota`, `Cota`, equidistancia, hoja, número de hoja, marco, variantes o referencia exterior). |
| `packages/etl/src/importar.ts` | cargas de `estructura_cotas` y `estructura_diseno_nodos` | Separa filas de catálogo de instancias. La carga de cotas extrae defaults; la carga de nodos no basta para regenerar la regla visual completa en runtime. |
| `scripts/lib/catalogo-diseno.mjs` | `leerCatalogoDiseno` | Sólo la herramienta local de clasificación proyecta hoy `TipoCota`, `Cota` y `OperacionEqui` al contrato completo de `NodoCatalogo`. |
| `scripts/clasificar-escaparate.mjs` | `generarPlantillaCatalogo`, `firmaDibujo` | Produce candidatas locales a la medida inicial. Su propia nota niega garantía al redimensionar; no es catálogo operativo. |

Consecuencia: la base relacional conoce variables de fórmula y parte del árbol,
pero no contiene todavía un contrato único capaz de reconstruir, persistir y
dibujar la cota concreta de una línea.

### 3.3 Edición, persistencia, web y PDF

| Ruta | Símbolos reales | Flujo actual |
| --- | --- | --- |
| `packages/web/app/dashboard/presupuestos/[id]/_components/editor-linea/pestana-estructura.tsx` | `PestanaEstructura` | Edita ancho/alto de una línea `ESTRUCTURA` y llama a `DibujoEstructura`; no ofrece campos `FI`/`F`. |
| `packages/web/app/dashboard/presupuestos/[id]/_components/disenador-estructura.tsx` | `DisenadorEstructura` | Edita ancho/alto de cada módulo de un `CERRAMIENTO`; transmite configuración v1, sin cotas. |
| `packages/web/app/dashboard/presupuestos/[id]/_components/dibujo-estructura.tsx` | `DibujoEstructura` | Ajusta el rectángulo exterior a ancho/alto y reparte el interior con `distribuirComposicion`; por tanto, los pesos se escalan proporcionalmente. En miniaturas compactas usa incluso la relación de aspecto de la plantilla, no la medida de la línea. |
| `packages/db/src/schema/lineas.ts` | `lineas`, `lineasEstructura`, `lineasCerramiento` | `lineas` guarda ancho/alto; `lineasEstructura` guarda serie/código/materiales, pero no cotas; `lineasCerramiento.configuracion` guarda el JSON v1. |
| `packages/web/app/dashboard/presupuestos/_lib/cerramientos/validacion.ts` | `validarConfiguracionCerramiento` | Acepta únicamente el contrato reconocido por `esConfiguracionCerramiento`. |
| `packages/web/app/dashboard/presupuestos/_lib/cerramientos/alta-cerramiento.ts` | `prepararAltaCerramiento` | Recalcula medidas exteriores en servidor desde la configuración, pero no resuelve geometría interior. |
| `packages/web/app/dashboard/presupuestos/_lib/cerramientos/persistir-cerramiento.ts` | `persistirCerramiento` | Persiste el snapshot editable v1 sin cotas. |
| `packages/web/app/dashboard/presupuestos/_lib/cerramientos/editar-cerramiento.ts` | `actualizarCerramiento`, `actualizarSatelite` | Sustituye configuración, resultados y totales atómicamente; será el límite correcto para una futura actualización de cotas. |
| `packages/web/app/dashboard/presupuestos/[id]/pdf/geometria-cerramiento.ts` | `geometriaCerramientoPdf` | Vuelve a buscar la plantilla por código y usa el mismo reparto proporcional de core. |
| `packages/web/app/dashboard/presupuestos/[id]/pdf/cerramiento-pdf.ts` | `adaptarCerramientoPdf`, `identidad` | Exige identidad entre línea, configuración y snapshot. Una cota persistida deberá formar parte de esa identidad. |
| `packages/web/app/dashboard/presupuestos/[id]/pdf/fila.tsx` | `FilaPdf` | Dibuja sólo líneas `CERRAMIENTO`. Una línea `ESTRUCTURA` aparece como texto/medidas, sin dibujo PDF específico. |
| `packages/web/app/dashboard/produccion/_lib/verificar-despiece.ts` | `verificarDespiece` | Exige igualdad exacta de configuración, snapshot y despiece. Si las cotas afectan fabricación, deben quedar en el snapshot canónico. |

### 3.4 Motor de despiece y precio

| Ruta | Símbolos reales | Flujo actual |
| --- | --- | --- |
| `packages/core/src/despiece/calcular.ts` | `calcularDespiece` | Ya acepta `cotas: Record<string, number>` y evalúa `L`, `A`, `FI`, `F`, etc. Rechaza cortes negativos como incalculables; esto no equivale a conocer la validación de Productor. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/materiales-estructura.ts` | `resolverMaterialesEstructura` | Lee siempre `estructura_cotas.valor_por_defecto`, crea `cotas` y las pasa al despiece. No recibe valores editados por el operador. Además, `Number(c.valor ?? 0)` convierte un default SQL `NULL` en cero: ausencia y valor cero quedan confundidos. |
| `packages/web/app/dashboard/presupuestos/_lib/estructuras/valorar-estructura.ts` | `EntradaValoracionEstructura`, `valorarEstructura` | La entrada no contiene cotas. El acristalamiento reutiliza los defaults devueltos por materiales. |
| `packages/web/app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts` | `valorarCerramiento` | Valora cada módulo con ancho/alto, pero no con cotas del módulo. Construye `ResultadoCerramientoV1` con la configuración incompleta para este propósito. |

El defecto de alineación actual es concreto: web y PDF escalan pesos; el motor
mantiene defaults de catálogo. A una segunda medida pueden representar huecos
distintos aunque partan del mismo código y ancho/alto. Hay además un defecto de
ausencia: un default `NULL` se transforma hoy en `0`, en vez de conservarse como
variable no resuelta. Una prueba futura debe demostrar explícitamente que
**ausencia no equivale a cero** y que bloquea el cálculo que dependa de ella.

## 4. Reglas actualmente codificadas, sin elevarlas a evidencia

1. `1OFI` y `2O+ FIJO` usan pesos 4:1. A 1500 producen aproximadamente un
   fijo inferior de 300 antes del grosor gráfico; a otra altura conservan 20%,
   no 300 mm.
2. `1O1FL` usa 8:3; a 1100 representa 300 como peso inicial y después escala.
3. `1O2FL` usa 3:8:3; no existe símbolo ni vínculo que obligue a que ambos
   laterales compartan cota.
4. `1O+1F+1O` y `1O+2F+1O` reparten huecos por igual con divisiones invisibles.
   El catálogo local ya documenta divergencias de árbol y medidas para ambas.
5. `distribuirComposicion` descuenta un grosor **gráfico** (12/18; 2 para
   invisible) y reparte el resto por pesos. No calcula ejes ni medidas de
   fabricación.
6. `generarPlantillaCatalogo` sólo admite `tipoCota === 1`, exactamente dos
   huecos y una cota dentro de la longitud inicial; convierte esa cota en pesos.
   No conserva la regla para un redimensionado posterior.
7. El motor usa los defaults de `estructura_cotas` en todas las líneas y no
   permite que el formulario los sustituya. Si un default es `NULL`,
   `Number(c.valor ?? 0)` lo convierte hoy en cero; es comportamiento codificado
   defectuoso, no una regla de Productor.

Ninguno de los puntos anteriores demuestra que Productor conserve 300 mm,
escale proporcionalmente, mida al borde libre o aplique un límite concreto.

## 5. Límite modular propuesto después de cerrar la evidencia

La implementación mínima debe compartir un contrato único de valores y
referencias, pero mantener tres responsabilidades distintas: resolución de
geometría física, proyección gráfica y fórmulas de fabricación. Web y PDF deben
compartir la resolución geométrica pura; el motor debe recibir los mismos
valores persistidos, no derivar sus cortes del dibujo. No debe introducirse
cálculo de dominio en componentes React ni en server actions.

### 5.1 Núcleo de geometría y cotas

Crear `packages/core/src/estructuras/cotas-diseno.ts` con un contrato explícito,
limitado a modos demostrados. Nombres finales sujetos a revisión, pero las
responsabilidades deben ser:

- representar símbolo, valor en mm, eje, lado de origen, referencia al eje del
  travesaño y ámbito (contenedor frente a exterior máximo);
- asociar una misma cota a uno o varios divisores cuando Productor lo confirme;
- resolver posiciones físicas de ejes y medidas interiores desde ancho/alto +
  valores de cota;
- devolver una unión discriminada `resuelta | inviable | no_soportada`, nunca
  recortar, normalizar o convertir en cero silenciosamente;
- mantener separado el grosor visual de la referencia física al eje.

Los límites deben quedar explícitos:

1. `cotas-diseno.ts` resuelve geometría física en mm y referencias observadas.
2. `distribuirComposicion` y sus adaptadores web/PDF proyectan esa geometría a
   píxeles o puntos; los grosores gráficos sólo sirven para legibilidad.
3. `calcularDespiece` sigue evaluando fórmulas de corte con `L`, `A` y el mismo
   mapa de cotas persistidas. No obtiene largos a partir de rectángulos, ejes ni
   grosores dibujados.

`diseno.ts` debe seguir siendo vocabulario/topología. `DivisionVisual` puede
referenciar una regla declarativa, pero no debe contener lógica del motor ni
consultas. `distribuirComposicion` debe consumir un reparto ya resuelto o
delegar en el nuevo resolver; web y PDF no pueden implementar fórmulas propias.

`diseno-catalogo.ts` debe preservar una regla verificable en vez de reducirla a
pesos. Mientras no estén mapeados todos los campos de referencia, el resultado
debe seguir `pendiente`. El generador experimental no debe activar estructuras.

### 5.2 Configuración versionada y compatibilidad

Propuesta conservadora de compatibilidad —no requisito observado en Productor—:

- introducir una configuración nueva para escrituras futuras que persista por
  módulo los valores de cotas usados; usar el número de versión existente en
  vez de cambiar en silencio el significado de v1;
- conservar la lectura de `ConfiguracionCerramiento` v1 y evitar migración o
  revaloración económica masiva. Mantener sus pesos como fallback visual es una
  opción de compatibilidad, no una regla demostrada ni una obligación de
  perpetuar errores de dibujo;
- al editar una v1, actualizarla sólo dentro de la misma transacción que
  revalora y reemplaza el snapshot. Si no se pueden materializar cotas sin
  cambiar el resultado, bloquear la actualización con diagnóstico;
- incluir las cotas en la identidad que comparan
  `adaptarCerramientoPdf`, `esResultadoCerramiento` y
  `verificarDespiece`.

Hay que separar dos compatibilidades: el snapshot económico/físico no debe
revalorarse en silencio, mientras que una representación puede corregir un
error documentado y revisado. B1 ya reconstruye manos de configuraciones v1
con la geometría corregida sin reescribirlas. B2 debe documentar del mismo modo
cualquier corrección visual deliberada, sin presentarla como preservación
económica ni usarla para cambiar cortes o precio históricos.

Para líneas `ESTRUCTURA`, `lineasEstructura` tampoco persiste cotas. Antes de
afirmar aceptación integral hay que escoger una fuente canónica versionada
(un pequeño snapshot JSON reutilizando el mismo contrato de módulo, o una
tabla hija). No se recomienda guardar sólo el valor en el formulario: el PDF,
la copia, la reapertura, el despiece y producción necesitan el mismo dato.

La migración concreta no debe diseñarse definitivamente hasta decidir si B2
abarca a la vez `ESTRUCTURA` y módulos de `CERRAMIENTO`. Esa decisión cambia la
clave y el dueño de los valores, no sólo la UI.

### 5.3 Entrada al motor

Extender `EntradaValoracionEstructura` con cotas validadas y hacer que
`resolverMaterialesEstructura` aplique la precedencia:

1. valor persistido de la línea/módulo;
2. default de catálogo sólo al crear una configuración nueva;
3. ausencia explícita si una variable requerida no tiene valor.

No debe releerse un default cambiante al reabrir una línea ya guardada. Las
mismas cotas deben llegar a `calcularDespiece` y a
`resolverAcristalamientoEstructura`. El snapshot de resultado debe conservar la
configuración exacta usada para que producción pueda verificarla.

### 5.4 Adaptadores web y PDF

- Añadir un componente local pequeño para los campos de cotas verificadas en
  `editor-linea/`, alimentado por metadatos de core; no añadir estado de dominio
  a `pestana-estructura.tsx` ni ampliar `acciones.ts`.
- `DisenadorEstructura` debe editar las cotas del módulo activo, no un mapa
  global del cerramiento.
- `DibujoEstructura` debe recibir geometría resuelta o medidas de cota
  explícitas; las miniaturas de catálogo pueden seguir mostrando sólo el
  estado inicial, claramente separado del dibujo de una línea.
- `geometriaCerramientoPdf` debe usar el mismo resultado puro de core. No debe
  reconstruir proporciones por su cuenta.
- Decidir expresamente si B2 añade dibujo de líneas `ESTRUCTURA` al PDF; hoy no
  existe. Sin esa decisión sólo puede aceptarse coherencia PDF para
  `CERRAMIENTO`.

## 6. Archivos y pruebas mínimas previstas

No es un encargo de implementación; esta lista delimita el siguiente cambio.

| Área | Archivo nuevo/modificado | Prueba necesaria |
| --- | --- | --- |
| Resolver puro | nuevo `core/estructuras/cotas-diseno.ts` | tamaño inicial + segunda medida por cada regla demostrada; eje/lado; cota compartida; inviable/no soportada |
| Topología | `diseno.ts` | regresiones de las 14 plantillas; B1 de manos/manillas intacta; coordenadas exactas sólo para casos con evidencia |
| Generador | `diseno-catalogo.ts` | no degradar cota a proporción; campos incompletos quedan pendientes; ningún código nuevo activado |
| Configuración | `cerramiento.ts` | lectura v1 válida y sin revaloración silenciosa; nueva versión, round-trip, edición/migración controlada y cotas por módulo; correcciones visuales documentadas se prueban aparte |
| Snapshot | `resultado-cerramiento/*` | identidad incluye cotas; rechazo de snapshot/configuración divergentes |
| Motor | `materiales-estructura.ts`, `valorar-estructura.ts`, `valorar-cerramiento.ts` | el mismo valor llega a despiece y acristalamiento; default sólo en alta; `NULL`/ausencia no se convierte en cero; medida negativa queda incompleta |
| Persistencia | `schema/lineas.ts`, migración futura y casos de uso | guardar/reabrir/copiar conserva cotas; rollback atómico; no revaloración parcial |
| Web | componente de cotas, `pestana-estructura.tsx`, `disenador-estructura.tsx`, `dibujo-estructura.tsx` | cambio de ancho/alto y de `FI/F/FD`; equidistancia; teclado; error inviable; web usa coordenadas físicas de core |
| PDF | `geometria-cerramiento.ts`, adaptador y dibujo | igualdad de geometría con web a ambas medidas; identidad persistida; sin recortes |
| Producción | `verificar-despiece.ts` | rechaza cotas/configuración distintas del snapshot |

Las pruebas de persistencia deben ejecutarse sólo en el entorno local aislado
previsto por el proyecto y nunca como parte de este informe. La comparación de
precio debe fijar serie, acabado, vidrio, tarifa, opciones y ajustes; una
diferencia de importe no puede atribuirse a cotas si cambia otra entrada.

## 7. Riesgos de compatibilidad

1. **Históricos y dos compatibilidades**: interpretar v1 con una regla nueva
   puede cambiar web/PDF. Debe decidirse y documentarse si es una corrección
   visual demostrada, como en B1, sin confundirla con revalorar o alterar el
   snapshot económico/físico histórico.
2. **Doble fuente**: guardar cotas en JSON pero seguir usando defaults de DB en
   el motor produciría una imagen y un despiece distintos.
3. **Referencia errónea**: borde de hueco, borde de perfil y eje de travesaño
   no son intercambiables. El CHM fija eje, pero falta el perfil concreto.
4. **Grosor gráfico**: los 12/18 px de `distribuirComposicion` no son mm de
   fabricación y no deben entrar en el cálculo de cota ni en fórmulas de corte.
5. **Símbolos contextuales o compartidos**: `FI` ya significa cosas distintas
   según estructura. Duplicar una variable por travesaño también puede romper
   Productor cuando varios divisores comparten el mismo símbolo.
6. **Casos inviables**: el motor hoy detecta algunas fórmulas negativas, pero
   no prueba la validación de Productor ni garantiza que el dibujo sea válido.
7. **Líneas de dos tipos**: `ESTRUCTURA` y `CERRAMIENTO` comparten dibujo/motor
   pero tienen persistencia distinta. Resolver sólo una deja paridad parcial.
8. **Catálogo parcial**: la tabla de nodos importada no conserva todos los
   campos necesarios; usarla como si fuera completa inventaría reglas.
9. **Precio y despiece**: una geometría correcta no demuestra perfiles,
   herrajes, vidrio ni precio correctos. Deben aceptarse por separado.
10. **Miniaturas**: el modo compacto usa dimensiones de plantilla. No debe
    presentarse como vista exacta de una línea redimensionada.

## 8. Preguntas concretas para la observación de Productor

Registrar siempre literal del campo, captura antes/después y ausencia de
evidencia. No guardar fichas de catálogo.

1. En `1OFI`, `2O+ FIJO`, `1O1FL` y `1O2FL`, al cambiar sólo la dimensión
   pertinente en una línea de prueba, ¿`FI/F/FD` continúa en 300, cambia
   automáticamente o se recalcula al aceptar? Anotar valor antes, durante y
   tras reabrir.
2. Si se cambia primero `FI/F/FD` a otro valor inequívoco y después el ancho/alto,
   ¿se conserva el valor manual? Esta prueba distingue default, proporción y
   cota persistida.
3. Para cada travesaño, ¿la distancia visible se mide desde arriba/abajo/
   izquierda/derecha hasta qué eje exacto? Identificar el perfil resaltado y
   comprobar si el valor mostrado coincide con cursor/cotas de Diseño V3.
4. ¿Está activa `Fija desde elemento Exterior` en alguno de los seis casos?
   Los campos deshabilitados que muestran 300 no cuentan como respuesta.
5. En la segunda medida de `1O2FL`, ¿`FI` y `FD` permanecen ambos en 300? Para
   el segundo travesaño, anidado en el hueco restante, comprobar si
   `Vertical (Derecha)` referencia el exterior de ese contenedor o el exterior
   máximo, y registrar el estado de `Fija desde elemento Exterior`.
6. En la segunda medida de `1O+1F+1O` y `1O+2F+1O`, ¿la distancia entre todos
   los ejes sigue siendo igual y qué huecos libres resultan? Comprobar además
   si `De Usuario` cambia comportamiento o sólo clasifica la estructura.
7. Cuando varios travesaños muestran el mismo nombre/símbolo, ¿editar una sola
   variable mueve todos? Registrar valores y posiciones antes/después.
8. ¿Qué ocurre al introducir una cota igual o mayor que la dimensión disponible
   y una apenas válida: bloqueo de campo, aviso, clamp, dibujo degenerado o
   aceptación? Copiar texto literal; no extrapolar el límite.
9. ¿El límite usa dimensión exterior, interior del contenedor o distancia entre
   ejes? Probar un valor que distinga esas referencias sin guardar catálogo.
10. Tras guardar/reabrir la línea de prueba, ¿se conservan ancho/alto,
    `FI/F/FD` o la equidistancia, dibujo, despiece y precio? Comparar cada
    salida por separado.
11. Al emitir/imprimir desde Productor, ¿el dibujo refleja la misma posición de
    travesaños que la línea reabierta? No inferirlo de la miniatura.
12. Con idéntica serie, acabado, vidrio, tarifa, opciones y ajustes, ¿cambiar
    sólo `FI/F/FD` altera qué cortes y qué partidas? Registrar despiece físico
    y precio como dos resultados independientes.

## 9. Matriz de aceptación pendiente

Todo está pendiente hasta completar la observación. Los valores iniciales 300
de `FI/F/FD` y las equidistancias iniciales no satisfacen por sí solos ninguna
fila.

| Dimensión | Evidencia mínima exigida | Criterio futuro de aceptación | Estado |
| --- | --- | --- | --- |
| Segunda medida | Inicial + otra medida del mismo caso, cambiando una sola dimensión | La geometría resuelta explica ambas sin cambiar de regla ni usar proporción accidental | Pendiente |
| Referencia del eje | Lado, contenedor, perfil/travesaño y eje identificados; estado de `Fija desde elemento Exterior` | Core calcula desde la referencia observada y web/PDF coinciden en mm | Pendiente |
| Valores `FI/F/FD` y equidistancia | Valor/distancias antes y después de redimensionar, tras edición manual y tras reabrir | Se persiste exactamente el estado observado; el default sólo inicia líneas nuevas y un símbolo ausente nunca se sustituye por cero | Pendiente |
| Medidas inviables | Al menos un límite válido y uno inválido con respuesta literal | Resultado explícito; no negativo, `NaN`, clamp ni cero inventado; no se guarda/revalora parcialmente | Pendiente |
| Persistencia | Guardar y reabrir línea de prueba; definir alcance `ESTRUCTURA`/`CERRAMIENTO` | Round-trip conserva configuración y copia; no hay revaloración económica silenciosa de v1; cualquier corrección visual histórica queda documentada; escritura atómica | Pendiente |
| Web | Mismos datos de Productor a dos tamaños | Dibujo, campos y navegación por teclado usan la resolución física de core, sin mezclar grosores gráficos con mm | Pendiente |
| PDF | Emitir el mismo caso tras reabrir | Misma geometría y cotas que web; sin reconstrucción proporcional ni recorte | Pendiente; además hay que decidir dibujo para `ESTRUCTURA` |
| Despiece | Misma configuración, comparar códigos, multiplicidad, largos, anchos y cortes | Coincidencia explicada pieza a pieza; usa el mismo mapa de cotas pero calcula por fórmulas, no por dibujo; faltantes quedan incompletos, nunca a cero | Pendiente e independiente de dibujo |
| Precio | Misma tarifa/fecha, serie, acabado, vidrio, herraje y ajustes | Material, mano de obra y ajustes separados; sólo completo si todas las partidas están resueltas | Pendiente e independiente de despiece |

## 10. Condición para empezar a implementar

El arquitecto puede delimitar un primer lote sólo cuando la observación cierre,
para cada caso incluido: segunda medida, referencia al eje, símbolo/valor,
comportamiento inviable y dueño de persistencia. Los casos no cerrados deben
seguir con comportamiento legado o quedar explícitamente no soportados; no se
debe completar la matriz por analogía entre `FI`, `F`, `FD`, equidistancias,
códigos parecidos o proporciones iniciales.
