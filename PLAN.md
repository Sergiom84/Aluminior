# Plan — Reconstrucción de Aluminior

Fecha: 18 de julio de 2026
Situación: cliente/empresa usuaria de Productor Aluminio (GAIA Servicios Informáticos SL).
Objetivo: software propio, con los datos reales, usable en producción.

---

## 0. Hechos verificados (no suposiciones)

| Hecho | Valor | Cómo se verificó |
|---|---|---|
| Instalación original | 24,4 GB, 205.300 archivos | inventario Codex |
| Paquete de investigación | 941 archivos, 817,5 MB | medido |
| ...de los cuales instaladores viejos | 582,7 MB (71%) | medido |
| **`.mdb` en el paquete** | **0** | medido — el paquete NO contiene datos ni esquema |
| Informes Crystal Reports | 291 `.rpt`, 38,5 MB | medido |
| Manual de usuario | CHM, 10,7 MB | medido |
| Bases activas | `EMP0001..EMP0016\aluminio.mdb`, 57–446 MB | medido |
| **Tablas por empresa** | **830** | leído de EMP0003 |
| **Tablas CON datos** | **154 (18,5%)** | contado fila a fila |
| Lectura de MDB | ACE OLEDB 12.0 y 16.0, 64 bits | verificado |
| Git | `C:\Program Files\Git\cmd` en PATH de máquina | verificado |

**Conclusión sobre el paquete de Codex:** el inventario y el informe de arquitectura son correctos y útiles.
Pero como base para reconstruir, está incompleto: le falta lo único imprescindible (esquema y datos)
y el 71% de su peso es lastre. Los activos que sí valen son los 291 `.rpt` y el manual CHM.

---

## 1. Marco legal — la vía que seguimos

- **Los datos son tuyos.** Clientes, obras, artículos, series, presupuestos, costes. Extraerlos y
  migrarlos es tu derecho como titular. Sin discusión.
- **El software es de GAIA.** No se descompilan sus ensamblados ni se copia su código.
- **Vía elegida (sala limpia):** reconstruimos a partir de (a) el esquema de datos, que describe
  *tu negocio*; (b) los `.rpt`, que contienen SQL contra tus tablas; (c) el manual de usuario;
  (d) observación de la aplicación en uso. Replicamos *qué hace*, no *cómo está escrito*.
- Mantener la licencia de GAIA viva durante toda la transición. Es la red de seguridad y la
  referencia de contraste.

---

## 2. Realismo sobre el alcance

Alcance pedido: núcleo + producción + facturación legal (VeriFactu / TicketBAI / SII).

Eso no es una v1. Es un ERP sectorial completo. Secuencia realista:

| Hito | Contenido | Estimación |
|---|---|---|
| **H1 — Catálogo** | Series, perfiles, acabados, artículos, tarifas, costes | 4–6 semanas |
| **H2 — Comercial** | Clientes, obras, presupuestos, generación de equipamiento nuevo | 6–8 semanas |
| **H3 — Uso real en paralelo** | Se usa junto al original, se contrastan resultados | continuo |
| **H4 — Producción** | Despiece, órdenes, stock, optimización de corte 1D/2D | 3–4 meses |
| **H5 — Facturación legal** | VeriFactu / TicketBAI / SII | 2–3 meses + certificación |

Nota sobre H5: VeriFactu ya está en vigor. Es un módulo con requisitos legales estrictos
(registro de facturación encadenado, hash, firma, remisión a AEAT). Se construye **aislado**,
al final, y probablemente convenga integrar una solución certificada en lugar de escribirla.
Hasta entonces se sigue facturando con el sistema actual. Esto no es opcional: facturar con
software propio no conforme es un riesgo sancionable.

**Recomendación:** congelar el objetivo en H1+H2 y no comprometerse con H4/H5 hasta tener
H1+H2 funcionando con datos reales.

---

## 3. Fase 0 — Paquete portátil (esta semana)

### 3a. Paquete depurado → git (~60 MB)

```
Aluminior/
├─ esquema/              # DDL de las 830 tablas + relaciones + índices (SQL)
├─ esquema/con_datos/    # subconjunto: las 154 tablas vivas, documentadas
├─ rpt/                  # 291 Crystal Reports + SQL extraído de cada uno
├─ docs/                 # manual CHM + capturas de flujos
├─ inventarios/          # los CSV de Codex (25,8 MB)
└─ INFORME_TECNICO.md
```

### 3b. Datos reales → disco externo, fuera de git (~3–4 GB)

Las 16 `aluminio.mdb` + `InfoSeries.mdb`, comprimidas. Cifradas si salen del edificio.
Nunca en OneDrive ni en el repositorio.

### 3c. Higiene

- `git init` + `.gitignore` que bloquea `*.mdb`, binarios de GAIA y secretos. **Hecho.**
- El repositorio vive dentro de OneDrive: aceptable con el `.gitignore` puesto, pero
  conviene un remoto privado real (GitHub privado) como copia auténtica.

---

## 4. Fase 1 — Entender los datos (semanas 1–3)

1. **Volcar el esquema completo** de una copia de cada MDB (nunca de la activa).
2. **Descartar las 676 tablas vacías.** Quedan 154. Ese es el sistema real.
3. **Extraer el SQL de los 291 `.rpt`.** Cada informe revela qué tablas se unen y con qué
   claves. Es la mejor documentación de lógica de negocio que existe aquí.
4. **Reconstruir las relaciones** entre las 154 tablas vivas → diagrama entidad-relación.
5. **Auditoría visual:** ejecutar Productor Aluminio y grabar los flujos clave
   (alta de cliente, alta de serie, presupuesto completo, generación de equipamiento).
   Cada pantalla se mapea contra las tablas que toca.

Entregable: diccionario de datos + ERD + catálogo de reglas de negocio observadas.

---

## 5. Fase 2 — Base de datos nueva (semanas 3–5)

- Destino: **PostgreSQL** (o SQL Server si prefieres seguir en stack Microsoft).
- Esquema nuevo, normalizado y en castellano coherente — no una copia literal de Access.
- **ETL idempotente y repetible** MDB → nueva BD. Se ejecuta muchas veces, no una.
- **Validación por conteo y por suma:** cada migración compara nº de filas y totales
  monetarios contra el origen. Si no cuadra, falla.

## 6. Fase 3 — Aplicación (semanas 5+)

Propuesta de stack, abierta a discusión:

| Capa | Elección | Motivo |
|---|---|---|
| Backend | .NET 8 + EF Core | Estás en Windows; ecosistema maduro; futuro largo |
| Frontend | Blazor o React | Web = sin instalación en cada puesto, multipuesto real |
| BD | PostgreSQL | Sin límite de 2 GB, concurrencia real, gratis |
| Informes | QuestPDF / Reportes propios | Sustituye Crystal Reports de 32 bits |

Orden de construcción: catálogo → clientes → presupuestos → equipamiento nuevo.
Cada módulo se valida contra el original con los mismos datos de entrada.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Subestimar 830 tablas | Ya reducidas a 154 reales. Revalidar en la EMP grande (EMP0009). |
| Lógica de negocio oculta en el binario | Los `.rpt` + observación + entrevistas a usuarios |
| Facturación legal no conforme | No facturar con lo nuevo hasta H5 certificado |
| Fuga de datos de clientes | `.gitignore`, cifrado en tránsito, nada en OneDrive |
| Proyecto que nunca termina | Congelar alcance en H1+H2. Uso en paralelo desde el mes 3 |

---

## 8. Siguiente paso concreto

Ejecutar Fase 0 completa:
1. Volcar esquema de las 16 MDB (sobre copias).
2. Extraer SQL de los 291 `.rpt`.
3. Montar el paquete depurado de ~60 MB.
4. Primer commit.

---
---

# ANEXO A — Hallazgos de la Fase 0 (18/07/2026)

Ejecutada la extracción de esquema sobre copias de `EMP0009` (446 MB) e `InfoSeries` (358 MB).
Lo encontrado obliga a corregir varias suposiciones del plan original.

## A.1 El esquema NO es igual entre empresas

| Base | Tablas | Con datos |
|---|---|---|
| EMP0003 | 830 | 154 |
| EMP0009 | **968** | **178** |

138 tablas de diferencia. Las empresas están en **versiones distintas del esquema**.
Consecuencia directa: el ETL no puede asumir una estructura única. Hay que perfilar las 16
bases por separado y construir la migración contra la unión de esquemas, no contra una.

## A.2 No existe integridad referencial

**10 claves ajenas declaradas sobre 968 tablas.** Todas apuntan a `Articulos` o `Proveedores`.

Esto es el hallazgo más importante para la reconstrucción: las relaciones entre tablas
**no están en la base de datos**, están en el código de la aplicación. No se pueden
deducir automáticamente. Hay que inferirlas por convención de nombres, por los `.rpt`
y por observación.

Implica además que los datos actuales pueden contener huérfanos e inconsistencias que
la aplicación tolera. El ETL necesita una fase de **perfilado y saneamiento** que no
estaba contemplada. Añadir 2–3 semanas.

## A.3 Tablas extremadamente anchas

| Tabla | Columnas | Filas |
|---|---|---|
| `Articulos` | 235 | 3.120 |
| `VDatosDiseño` | 223 | 6.558 |
| `VPresupuestos` | 152 | 2.335 |
| `VPresupuestosLin` | **147** | **468.838** |
| `EstructurasArticulos` | 129 | 61.674 |

`VPresupuestosLin` es el corazón del sistema. 147 columnas significa que la lógica de
negocio está codificada en la *semántica de cada columna*, no en estructura. Cada una
hay que entender qué representa. Es el trabajo más lento de todo el proyecto y no se
puede automatizar.

## A.4 Dependencia estratégica: las bibliotecas de series

`InfoSeries.mdb` no contiene diseños: es un **catálogo de 4.104 series** de ~100 fabricantes
(Veka, Alumed, Domal, Cortizo…), versionado por GAIA (`version 45.50`, `codigoGaia`).

- EMP0009 solo tiene **29 series** realmente configuradas.
- Las definiciones técnicas se importan a la MDB de empresa (`EstructurasDiseño`,
  `EstructurasArticulos`, `ConfigSeriesCotas`, `ConfigSeriesHerraje`).

**Lo que esto significa:** las series que ya usas están en tus datos y son recuperables.
Pero el *mantenimiento continuo* del catálogo — series nuevas, cambios de tarifa de
fabricante, actualizaciones de herrajes — es un servicio de GAIA, no un fichero que se
copia. Reconstruir la aplicación no te da ese flujo.

Es la decisión estratégica de fondo del proyecto, y hay que tomarla explícitamente:

1. **Mantener GAIA para el catálogo** y construir lo propio encima. Sigues pagando algo.
2. **Asumir el mantenimiento del catálogo** — relación directa con cada fabricante.
   Es trabajo continuo y permanente, no un hito.
3. **Limitar el alcance a las 29 series que usas** y mantenerlas a mano.
   Viable si tu catálogo real es estable.

Sin resolver esto, H4 (producción y despiece) no tiene sentido.

## A.5 Detalles técnicos menores

- `aluminio.exe` es solo un lanzador; la aplicación real es `AluminioApp.exe`.
- Los `.rpt` son ficheros compuestos OLE con contenido codificado: no se leen por
  extracción de cadenas. Se leen con el motor oficial de Crystal (presente en el GAC).
- `EMP0009\DIBUJOS`: 36.406 ficheros, 2,7 GB. Solo una empresa. Los dibujos son
  regenerables desde las estructuras — no hay que migrarlos, hay que poder recrearlos.
- Auditoría visual: pendiente. Requiere permiso para `aluminioapp.exe`.

## A.6 Revisión de estimaciones

| Hito | Antes | Ahora | Motivo |
|---|---|---|---|
| H1 Catálogo | 4–6 sem | **6–9 sem** | Tablas de 235 columnas, sin FKs |
| H2 Comercial | 6–8 sem | **10–14 sem** | `VPresupuestosLin` 147 columnas |
| ETL | incluido | **+3 sem** | Perfilado y saneamiento, 16 esquemas distintos |

El proyecto es viable, pero es más grande de lo estimado. La recomendación de congelar
el alcance en H1+H2 se refuerza.

## A.7 Lo que hay que decidir ahora

1. **Bibliotecas de series** (A.4). Bloquea H4. Es la decisión más importante.
2. **Auditoría visual**: sin ver la aplicación, `VPresupuestosLin` es ingeniería inversa
   a ciegas. Conceder acceso o hacer las capturas tú.
3. **Qué empresa es la de referencia.** EMP0009 tiene 9 clientes y 1.037 obras — no parece
   la operativa principal. Hay que identificar cuál lo es antes de modelar sobre ella.

---
---

# ANEXO B — Auditoría visual e informes Crystal (18/07/2026)

## B.1 Identificación resuelta

- Titular de licencia: **ALUMINIOS LARA SLU — B83979179 (28095)**.
- Empresa activa: **ALUMINIOS LARA - 2026 [0016]** → `EMP0016`, no EMP0009.
  **EMP0016 es la base de referencia para todo el modelado.** Corrige el Anexo A.
- Estructura de menús: Ficheros · Compras · Ventas · Utilidades · Ayuda.

## B.2 Mapa funcional real

| Menú | Contenido |
|---|---|
| **Ficheros** | Clientes, Clientes Potenciales, Artículos, Proveedores, Acreedores, Formas de Pago, Textos para Presupuestos, Representantes, Trabajadores, Reparto, Empresa, Listados |
| **Compras** | Pedidos, Albaranes, Facturas, Gastos, Ofertas, Control de Pago, Autorización de Pedidos, Fabricación de Artículos, Cheques/Pagarés, Creación Automática de Pedidos |
| **Ventas** | Presupuestos, Pedidos, Albaranes, Facturas, Albarán Electrónico, Factura Electrónica, **SII**, Documentos Web, Ofertas, Control de Cobro, Comisiones, Producción, Reparto, Control de Producción en Fábrica, Emisión de Recibos |
| **Utilidades** | Cajas, Agenda, Informes y Estadísticas, Documentos Vinculados, Actualizar Precios de Coste, Recalcular Precios de Venta, Importar Tarifa de Coste, **Importar Series**, Trabajo Desconectado, Notificador, Registro de acciones, **Hoja de Corte Múltiple**, **Series. Biblioteca**, **Ejecuta SQL**, WebService Productor, Copia de Seguridad, Reparar y Compactar |

Nota: en el menú aparece **SII**, pero no VeriFactu ni TicketBAI. Hay que verificar cómo
se está cumpliendo hoy la obligación de facturación verificable antes de planificar H5.

## B.3 Anatomía de una serie (pantalla "Series. Biblioteca")

Una biblioteca de serie se compone de: **Estructuras, Artículos, Acabados, Familias,
Familias de Estructuras, Vidrios, Proveedores de Artículo, Coste y Dimensiones,
Tarifas de Coste Bruto, Subfamilias, Mano de obra y Guías de Persiana.**

Ese es el modelo de datos mínimo que debe soportar el catálogo del sistema nuevo.

## B.4 Estructura de una línea de presupuesto

Columnas visibles: `Artículo · Acabado · Tonalidad · Descripción · Referencia ·
Cantidad · Ancho(mm) · Alto(mm) · Precio · Total`.

Una línea es de uno de dos tipos:

1. **Elemento configurado** — se parte de una estructura de serie y se le dan medidas y
   opciones (ej. ventana abatible de dos hojas, 1600×1230, acabado L).
2. **Artículo de catálogo** — producto simple de la tarifa (ej. mosquitera enrollable).

`Referencia` es la ubicación en la obra (SALÓN, BAÑO…). Las 147 columnas restantes de
`VPresupuestosLin` desarrollan la configuración del elemento del tipo 1.

**Este es el núcleo del dominio.** Modelarlo bien es el 80% de H2.

## B.5 Calidad de datos: confirmada la sospecha

En la lista de 439 presupuestos de 2026, **muchas filas tienen el código de Cliente vacío
y el nombre escrito a mano** ("LUISFER", "REBECA", "JORGE"…).

El sistema nuevo debe admitir **cliente ocasional sin ficha**. Si se modela el cliente como
obligatorio, la migración falla en un porcentaje alto de los documentos históricos.

## B.6 Informes Crystal: 291 leídos, 136.766 campos

Extraídos con el motor oficial de SAP presente en el GAC (32 bits). Resultado en
`esquema/rpt/`.

- `informe_a_tablas.csv` — qué tablas usa cada informe. Sustituye a las claves ajenas
  que la base de datos no tiene: si un informe cruza `Clientes` + `VFacturas` +
  `VFacturasLin`, ahí está la relación.
- `informe_campos.csv` — 136.766 referencias campo a campo.

Tablas más referenciadas: `Articulos` (28.743 campos), `Clientes` (16.186),
`Constantes` (15.651), `VPedidos` (11.533), `Estructuras` (9.253).

**Limitación importante:** los informes solo cubren **43 de las 178 tablas con datos**.
Las otras **135 no las toca ningún informe** — y son precisamente las del motor de
configuración: `VDatosLinDetDis` (196.267 filas), `EstructurasDiseño`, `VOpcionesHerraje`,
`ConfigSeriesCotas`, `VCerramientosLin`, `VDespunteDetalle`, `VAccesorios`.

Es decir: **los `.rpt` documentan bien la parte comercial y nada de la parte de
configuración y despiece**, que es justo la difícil. Para esa mitad no hay atajo
documental — hay que ir por observación de la aplicación y entrevistas a quien la usa.
El `GetSQLStatement` volvió vacío en los 291 (los informes no están conectados a una
base viva), así que tenemos el mapa de tablas y campos pero no las consultas literales.

## B.7 Vía de trabajo descubierta

`Utilidades → Ejecuta SQL` permite consultar la base desde la propia aplicación.
Útil para validar hipótesis del modelo sin tocar las MDB por fuera. **Solo lectura.**

## B.8 Estado tras esta sesión

- No se ha modificado ningún dato. La pantalla "Series. Biblioteca" se abrió y se cerró
  sin pulsar ninguna acción (contiene botones de escritura: Marcar/Anular Biblioteca).
- Pendiente: recorrer el configurador de un presupuesto (pestaña Ficha / Editar), que es
  donde vive la lógica de las 135 tablas sin cobertura documental.

---
---

# ANEXO C — El configurador (18/07/2026)

Recorrido sobre un presupuesto de prueba (nº 260418), creado y **eliminado** al terminar.
La lista volvió a 439 registros: no queda rastro.

Esto es lo que faltaba: el modelo de dominio de las 135 tablas que ningún informe cubre.

## C.1 Cabecera del documento

`Nº Presupuesto` · `Revisión` · `Fecha` · `Serie` · `Tarifa` · `Bloqueo Precios`

**Cliente y Potencial son campos distintos y excluyentes** (radio). Un presupuesto puede
dirigirse a un cliente con ficha o a un cliente potencial. Más: `Nombre`, `Obra`,
`Nombre Versión`, `R.Interna`, `F.Pago`, `Tipo Rem.`, `Estado` (PENDIENTE…),
`Documentos Destino`, usuario responsable. Seis pestañas de cabecera (1–6).

Pie: `Subtotal`, `Dto`, `Dto.p.p.`, `Base Imponible`, `Tipo IVA`, `Req.Eq.`, `Retención`,
`Total`, divisa. Pestañas: Presupuesto · Datos Adicionales · Plazos · Gastos.

**Validaciones observadas:** `Forma de Pago` es obligatoria para grabar. Si se han tocado
las líneas, el documento exige grabarse antes de cerrar.

## C.2 Una línea es de UNO DE TRES tipos

Corrige el Anexo B, que decía dos:

1. **Estructura** — elemento configurado a partir de una estructura de serie.
2. **Artículo** — producto de catálogo/tarifa.
3. **Cerramiento** — conjunto acristalado completo (tablas `VCerramientosLin`, `VCerramientosPI`).

## C.3 El código de estructura es una gramática compositiva

No es un identificador opaco. Describe la composición del hueco:

| Código | Significado |
|---|---|
| `1+1` | dos ventanas abatibles de 1 hoja |
| `1O+2F+1O` | 2 ventanas oscilobatientes + 2 fijos |
| `2O+2O4FI` | dos ventanas de 2 hojas, una oscilo, con 4 fijos inferiores |
| `F2PF` | puerta abatible de 2 hojas con 2 fijos laterales |
| `2P` | puerta balconera abatible de dos hojas |

Dígito = nº de hojas · `O` = oscilobatiente · `F` = fijo · `P` = puerta · `I` = inferior.

`Familia` clasifica el tipo: `003` ventanas · `004` puertas · `010` arcos · `113` mamparas ·
`103` accesorios de unión.

**Implicación de diseño:** el catálogo de estructuras no es una lista plana, es un lenguaje.
El sistema nuevo debe modelarlo como composición de vanos, no como códigos sueltos.

## C.4 Anatomía de la línea configurada

Pestañas del editor: **Estructura · Opc.Herraje · Cargos Adic. · Acristalamiento** (+ Mas Datos).

### Estructura
- **PERFILES** (serie) y **VIDRIO** — los dos selectores de biblioteca. `Serie` es
  prerrequisito: sin ella, el resto se bloquea ("Indique Serie primero").
- `Acabado`, `Accesorios`, `Madera` — cada uno con código **y tonalidad**.
- `Cantidad`, `Metraje`, unidad, `Referencia (Tipo)` = ubicación en obra.
- **`ANCHO` / `ALTO` en mm**, con conmutador `HUECO` (medida de hueco vs. de carpintería).
- **Vista previa del dibujo**: la aplicación renderiza el elemento en tiempo real.
- **HORAS ADICIONALES**: `Fabricación` y `Colocación` → tabla `VConceptosMO`.
- Complementos: `Compacto`, `Guía Izq./Der.`, `Tapajuntas`, `Registro`, `Premarco`,
  `Condensación`, `Altura`.
- Añadidos: `Mosquiteras`, `Ángulos y Tubos`, `Bandejas/Cond.`, `Accesorios`.
- `Descripción` autogenerada desde el código, con conmutador de **descripción manual**.
- Precio: `Precio`, `Dto`, `Dto.2`, `Total Línea`, `Tarifa`, y anulaciones manuales
  (`PVP Manual`, `%Dto. Manual`, `Coste Manual`).

### Opc. Herraje
Selector de grupo (`Opciones de Marco`…), árbol de **Categoría**, y rejilla de opciones
seleccionables. → `VOpcionesHerraje`, `ConjuntosOpcionesHerraje`, `ConfigSeriesHerraje`.

### Acristalamiento
Cinco slots, cada uno con vidrio separado para **Hojas** y para **Fijos**. Hasta cinco
composiciones distintas por elemento.

## C.5 Cadena de dependencias del cálculo

```
Serie (perfiles)
  └─> Estructura (código compositivo) + Familia
        └─> Medidas (ancho/alto, hueco o carpintería)
              └─> Acabado + Tonalidad
                    └─> Opciones de herraje (por categoría)
                          └─> Acristalamiento (hojas / fijos)
                                └─> Complementos y accesorios
                                      └─> Mano de obra (fabricación + colocación)
                                            └─> Despiece  ->  Coste  ->  PVP por tarifa
```

Ese es el motor. Reproducirlo es el verdadero proyecto: no es una pantalla, es una cadena
de cálculo cuyos datos maestros vienen de la biblioteca de series de GAIA.

## C.6 Consecuencia para la estrategia

La exportación de datos (clientes, artículos, tarifas, presupuestos) es **mecánica y ya
está resuelta**. No es el cuello de botella.

El cuello de botella es C.5: sin la biblioteca de series, el configurador no tiene datos
maestros con los que calcular. Confirma que la decisión de A.4 bloquea todo lo demás.

**Se puede empezar a construir ya, pero solo esta mitad:**

| Se puede construir ahora | Requiere resolver A.4 primero |
|---|---|
| Clientes y clientes potenciales | Configurador de estructuras |
| Artículos, familias, tarifas | Cálculo de despiece |
| Proveedores, acabados, tonalidades | Optimización de corte |
| Presupuestos con líneas de artículo | Líneas de estructura y cerramiento |
| Documentos: pedidos, albaranes, facturas | Generación de dibujos |
| Informes comerciales | Escandallo de coste real |

---
---

# ANEXO D — CORRECCIÓN IMPORTANTE (18/07/2026)

**Los anexos A.4 y C.6 estaban equivocados. El configurador NO está bloqueado.**

Al exportar EMP0016 y mirar dentro de las tablas, resulta que el motor de despiece
está en la base de datos del cliente:

| Contenido | Cantidad |
|---|---|
| `EstructurasDiseño` — definición geométrica (81 columnas) | **394 estructuras** |
| `EstructurasArticulos` — despiece y lista de materiales (132 columnas) | **520 despieces** |
| Líneas con ángulos de corte (`AnguloI`, `AnguloD`) | **23.197** |
| Series con cotas y herraje configurados | **57 series** |

`EstructurasDiseño` contiene: travesaños, cotas, hojas, huecos, tipos de corte, curvas
con radio, perfiles adicionales, altura de manilla, barrotillos, lamas, correderas.

`EstructurasArticulos` contiene: cantidades, posición de trabajo, cantidad y largo de
corte, ángulos izquierdo y derecho, dirección de veta, rangos mín/máx por medida,
y la lógica condicional de opciones (`OPC*`).

## Dónde estaba el error

Confundí **lo que GAIA suministra en el futuro** (series nuevas, actualizaciones de
tarifas de fabricante) con **lo que el cliente ya posee** (la definición completa de las
57 series que usa). Lo primero es una cuestión de suministro continuo. Lo segundo es lo
que hace falta para construir, y ya está en su poder y exportado.

## Lo que sigue siendo trabajo real

No los datos: la **lógica de interpretación**. Cómo esas 81 + 132 columnas se convierten
en lista de corte y precio. Eso es ingeniería inversa.

**Pero es ingeniería inversa verificable.** Hay 468.838 líneas de presupuesto históricas
con sus despieces y precios ya calculados. Es un banco de pruebas: si el motor nuevo no
reproduce el mismo despiece y el mismo precio, está mal. Eso convierte el problema de
"adivinar" en "iterar contra un oráculo".

**Estrategia de construcción del motor:** test-driven contra el histórico. Se extrae un
conjunto de casos (estructura + medidas + opciones → despiece + precio esperados) y se
construye el motor hasta que pase el mayor porcentaje posible.

## Sobre la mochila (dongle HASP/UniKey)

Descartada. Es el dispositivo de licencia: valida que hay derecho de ejecución, no
contiene datos de negocio. Además, extraer sus claves o rodear la comprobación sería
elusión de medidas de protección — exactamente el riesgo legal que este plan evita.
No es necesaria: todo lo que hace falta está en los datos del cliente.

## Plan revisado: ya no hay dos mitades

1. Esquema PostgreSQL + ETL de las 204 tablas con datos
2. Catálogo: artículos, familias, acabados, tonalidades, tarifas, series
3. Comercial: clientes, potenciales, obras, presupuestos, documentos
4. Motor de despiece, validado contra las 468.838 líneas históricas
5. Facturación legal, al final y aislada

---
---

# ANEXO E — El anexo C.3 estaba equivocado (18/07/2026)

**Afirmé que el código de estructura es una gramática compositiva. Es falso
en la mayoría de los casos.**

## Qué hice

Escribí un parser basado en esa hipótesis y lo validé contra las **541
estructuras** del catálogo real de EMP0016, en lugar de darlo por bueno.

Resultado: **21% de cobertura**. Y peor que la baja cobertura: entre los
códigos que el parser decía reconocer había errores graves.

| Código | Lectura del parser | Realidad | Familia |
|---|---|---|---|
| `1+1` | 1 hoja + 1 hoja abatible | DOS VENTANAS ABATIBLES DE 1 HOJA ✅ | 003 |
| `1O+2F+1O` | 1 oscilo + 2 fijos + 1 oscilo | 2 VENTANAS OSCILO Y 2 FIJOS ✅ | 003 |
| `F2PF` | fijo + 2 puerta + fijo | PUERTA ABATIBLE 2 HOJAS CON 2 FIJOS ✅ | 004 |
| `C312` | corredera + **312 hojas** | VENTANA CORREDERA DE TRES HOJAS (312) ❌ | 001 |
| `F16` | fijo + **16 hojas** | MAMPARA PENTAGONAL, 2 PLEGABLES Y 1 ABATIBLE ❌ | 113 |
| `F4` | fijo + 4 hojas | MAMPARA LATERAL CORREDERO 2 HOJAS 1 PUERTA ❌ | 113 |

## Por qué me equivoqué

Generalicé desde los primeros ejemplos que vi en pantalla, que casualmente
eran todos de las familias 003 (ventanas) y 004 (puertas) — las únicas donde
el código sí es compositivo. En 113 (mamparas) y 001 (correderas) los dígitos
son referencias de modelo, no cuentas de hojas.

## Decisión

**El parser se elimina.** Un componente que acierta el 21% de las veces y
miente con total seguridad el resto es peor que no tenerlo: introduce errores
silenciosos en el despiece y en los precios.

El código de estructura se trata como **identificador opaco**. Las fuentes
autoritativas, por orden:

1. `EstructurasDiseño` — geometría real (hojas, travesaños, cotas, cortes).
   Es el dato con el que calcula el sistema original.
2. `EstructurasArticulos` — despiece y lista de materiales.
3. `Estructuras.Descripcion` — texto humano, para mostrar al usuario.
4. `Estructuras.Familia` — clasificación.

## Lección para el resto del proyecto

Esto refuerza la estrategia del anexo D: **validar toda hipótesis contra el
histórico antes de construir sobre ella.** El parser costó una hora y se
descartó con datos. Si se hubiera dado por bueno y se hubiera construido el
motor de despiece encima, el error habría aparecido meses después, en
presupuestos reales y con dinero de por medio.

Regla operativa: ninguna regla de negocio inferida entra en el motor sin
haberse contrastado antes contra el catálogo o contra las 468.838 líneas
históricas.

---
---

# ANEXO F — El motor de despiece es un lenguaje de fórmulas (18/07/2026)

**El hallazgo técnico más importante del proyecto hasta ahora.**

Al perfilar `EstructurasArticulos` (27.952 filas, 132 columnas) aparecieron
dos columnas que no contienen datos sino **expresiones**:
`FormulaLargo` y `FormulaLargoCorte`.

El sistema original no tabula las medidas de corte. Las calcula evaluando
fórmulas con las medidas del hueco.

## El lenguaje completo

| | |
|---|---|
| Fórmulas distintas | **417** |
| Identificadores (variables) | **23** |
| Operadores | **7**: `+ - * / ( )` y la coma decimal |
| Condicionales | ninguno |
| Funciones | ninguna |

Variables, por frecuencia de uso:

```
L (31.409)  A (21.316)  REF (17.168)  FI (4.196)  FS (3.568)  FD (1.109)
TD (589)  FZ (431)  F (208)  II (190)  ZO (142)  VS (138)  CAJ (128)
DV (126)  LB (80)  TR (50)  HO (50)  TI (45)  CVI (31)  CVD (31)
CGC (28)  FT (16)  HB (4)
```

Fórmulas reales, de más simple a más compleja:

```
L                 23.084 usos
REF               10.288
(A)/2              4.985
L-FS               1.480
L-FS-FI              651
(REF-FI-FD)/2         70
L+CAJ+2*30,00         44     <- la coma es separador DECIMAL, no de argumentos
```

## Por qué importa tanto

Lo que temía que fuera el trabajo más duro del proyecto —reconstruir el motor
de despiece— resulta ser **un evaluador de expresiones aritméticas sobre 23
variables**. Es un problema acotado y resuelto, no una investigación abierta.

## Estado

Evaluador implementado en `packages/core/src/despiece/formula.ts` y validado:

- **417 de 417 fórmulas del catálogo evaluadas correctamente (100%)**
- 8 casos concretos con resultado numérico verificado
- Falla con error explícito si falta una variable, en lugar de asumir cero.
  Un cero silencioso en una medida de corte es una pieza mal cortada y
  material perdido.

## Lo que queda por averiguar

El evaluador funciona. Lo que aún no sabemos es **qué significa cada variable
y de dónde sale su valor**:

- `L` y `A` son casi con certeza largo y alto del hueco.
- `REF` es una medida de referencia que depende del contexto de la pieza.
- `FI`, `FS`, `FD`, `FZ` parecen holguras o descuentos por posición
  (inferior, superior, derecha…), pero hay que confirmarlo.
- `CAJ` apunta a cajón de persiana.

Esto se resuelve contrastando contra las 468.838 líneas históricas: se toman
casos con despiece ya calculado, se despejan los valores y se verifica la
hipótesis. Es exactamente el método del anexo E, que ya demostró su utilidad.

## Nota sobre `TipoCorte`

Valores observados: `!!`, `/\`, `!\`. Son representaciones ASCII del corte:
`!` recto, `/` y `\` a inglete. **Confirmado** (anexo G): correlacionan con los
ángulos — `/\` va con 45°/45°, `!!` con 90°/90°.

---
---

# ANEXO G — Resueltas las variables del despiece (18/07/2026)

**Las 23 variables de las fórmulas son cotas de diseño de cada estructura.**

## Cómo se encontró

Primero se buscó la medida de corte ya calculada, para despejar las incógnitas
por álgebra. No existe: el sistema original **no persiste los largos de corte**,
los calcula al vuelo para imprimir la hoja. Las filas de instancia de
`EstructurasArticulos` guardan la fórmula, no el resultado.

La vía buena estaba en `EstructurasDiseño`, columnas `Simbolo` y `Cota`:

```
Estructura  1+2
Simbolo     TR          <- el identificador que usan las fórmulas
Cota        600         <- su valor por defecto, en mm
nombreDA    travesaño   <- qué representa
```

## Qué son

Cada estructura declara sus propias cotas con nombre. Confirmado en pantalla
con la estructura `2O+1OFIFS`, donde el propio sistema las describe:

| Símbolo | Significado | Valor por defecto |
|---|---|---|
| `FI` | FIJO INFERIOR | 300 mm |
| `FS` | FIJO SUPERIOR | 300 mm |
| `TD` | TRAV DERECHA | 600 mm |

Comprobación aritmética: fórmula `L-FS-FI` con hueco de 1600 mm →
1600 − 300 − 300 = **1000 mm**. Correcto.

Son valores **por defecto**: al configurar una línea concreta el usuario los
cambia, y ahí es donde el hueco toma su forma real. Eso explica por qué el
configurador de la aplicación original pide medidas adicionales según la
estructura elegida.

## Impacto medido

| | Sólo L y A | Con cotas |
|---|---|---|
| Componentes resueltos | 12.348 / 14.724 (84%) | **14.658 / 14.724 (99,6%)** |
| Estructuras completas | 351 / 518 (68%) | **476 / 518 (92%)** |

Sólo quedan 66 componentes sin resolver, de dos variables:

- **`CAJ` (64)** — cajón de persiana. Su medida viene del compacto que se elija,
  no de la estructura. Es contextual y se resolverá al modelar los compactos.
- **`HB` (2)** — sin identificar. Impacto despreciable.

## Estado

Cargadas 283 cotas simbólicas en `estructura_cotas`, y conectadas a la pantalla
de despiece: se pueden editar y ver el recálculo en vivo.

**El motor de despiece está resuelto.** Queda integrarlo en el flujo de
presupuestos, que es ingeniería normal, no investigación.

## Nota de método

Las tres veces que este proyecto ha avanzado de golpe ha sido por lo mismo:
formular una hipótesis y **medirla contra los datos reales** antes de construir.
En el anexo E la hipótesis era falsa y se descartó un componente; aquí era
cierta y desbloqueó el motor entero. El coste de comprobar fue una hora en
ambos casos.

---
---

# ANEXO H — La plantilla de despiece es GENÉRICA (18/07/2026)

**Descubierto al intentar valorar un presupuesto real. Corrige una suposición
implícita del anexo G.**

## El síntoma

Se creó el presupuesto 260001 y se le añadió una línea de estructura `1+1`
(1600 × 1230). El despiece se calculó correctamente —las medidas de corte
salen bien— pero el importe quedó en **0,00 €**.

## La causa

Los artículos que referencia la plantilla no son productos reales:

```
1    (**MARCO VERTICAL GENERICO**)
2    (**MARCO SUPERIOR GENERICO**)
3    (**MARCO INFERIOR GENERICO**)
10   (**HOJA ABATIBLE PEQUEÑA VERTICAL APERTURA INTERIOR GENERICO**)
97   (**TRAVESAÑO MARCO GRANDE GENERICO**)
105  (**ESCUADRA PEQUEÑA GENERICO**)
```

Hay **311 artículos genéricos** en el catálogo. No tienen precio de venta ni
coste porque no se venden: son **ranuras**.

## Qué significa

La plantilla de despiece de una estructura es **independiente de la serie**.
Define la geometría y qué tipo de pieza va en cada sitio (marco vertical, hoja
horizontal, travesaño), pero no qué perfil concreto.

**La serie es la que resuelve cada genérico a un perfil real.** Por eso la
aplicación original se niega a continuar con "Indique Serie primero": sin serie
no hay artículos reales, y sin artículos reales no hay ni coste ni precio.

La cadena completa es:

```
Estructura  ->  geometría y ranuras genéricas   (EstructurasArticulos)
   + Serie  ->  perfil real para cada ranura    (ConfigSeriesAsoc, Conjuntos)
   + Medidas->  largo de corte de cada pieza    (fórmulas, anexo F/G)
   + Acabado->  precio del perfil               (ArticulosCoste / ArticulosPVP)
                     |
                     v
                  Importe
```

## Estado

- La **geometría es correcta**: medidas, ángulos y tipos de corte salen bien.
  Eso ya está validado y no cambia.
- La **valoración está incompleta** y la interfaz lo dice: las líneas sin
  precio muestran "sin valorar" en vez de un cero engañoso. Un presupuesto que
  se queda corto en silencio es dinero perdido en cada venta.

## Siguiente investigación

Resolver genérico + serie -> artículo real. Los candidatos son
`ConfigSeriesAsoc` (1.137 filas: Conjunto + TipoHoja -> Artículo real),
`Conjuntos`, `ConjuntosLin` y `ConjuntosAsoc` (17.006 filas). También hay que
cargar `ArticulosCoste` (27.817 filas), que aún no está migrada.

Es el mismo tipo de problema que el anexo G y se aborda igual: hipótesis,
medición contra los datos, y sólo entonces construir.

---
---

# ANEXO I — Resolución genérico → perfil: PARCIAL (18/07/2026)

**Investigación abierta. Se documenta lo confirmado y lo que falta, para
poder retomarla sin repetir el trabajo.**

## Confirmado

**1. La serie ES un conjunto.** Las 57 series configuradas de EMP0016 existen
todas como `Conjunto` en `ConjuntosLin`. Coincidencia 57/57, no es casualidad.

**2. `ConjuntosLin` resuelve genéricos.** Estructura: `Conjunto | Componente |
Familia | Articulo`, donde `Componente` es el código genérico y `Articulo` el
perfil real. 18.858 de 21.714 filas (87%) llevan artículo real.

Ejemplo verificado con la serie GMA100:

```
genérico 10  (**HOJA ABATIBLE PEQUEÑA VERTICAL…**)  ->  GM100   [con coste]
genérico 15  (**HOJA ABATIBLE PEQUEÑA HORIZONTAL…**) ->  GM113   [con coste]
genérico 85                                          ->  GM116   [con coste]
```

**3. El conjunto de la serie declara sus dependencias.** El registro `GMA100`
en `Conjuntos` contiene:

```
FamiliaAsociada   050        (vidrios)
TablaHojas        GM08
TablaFijos        GM08
herr1HA           GM0019     herraje para 1 hoja abatible
herr1HPC          GM0020     ídem 1 hoja practicable+corredera
herr2HA           GM0022     ídem 2 hojas
```

Es decir: el herraje se elige **según el tipo de apertura**, no es fijo. Eso
explica los campos `Abat1H`, `Abat2H`, `Corr2H`… de `ConfigSeries`.

## Lo que NO resuelve

De los 14 genéricos del despiece de `1+1`, la serie resuelve **5**. Los otros
nueve —entre ellos `2` (MARCO SUPERIOR), `3` (MARCO INFERIOR), `97`
(TRAVESAÑO) y `105` (ESCUADRA)— **no los resuelve ningún conjunto** en
`ConjuntosLin`.

Los genéricos de marco y travesaño se resuelven por otro mecanismo, todavía
sin identificar. Candidatos por explorar:

- `ConfigSeriesAsoc` (1.137 filas): `Conjunto + TipoHoja -> Articulo`, con
  fórmulas propias (`FormulaL`, `FormulaA`) y tipo de corte.
- `EstructurasSeriesAsoc` (2.134 filas): qué series valen para qué estructura.
- Las tablas `TablaHojas` / `TablaFijos` (`GM08` en el ejemplo), que apuntan a
  algún catálogo de perfiles por tipo de hoja.
- `ConjuntosAsoc` (13.345 filas), con `ComponenteAsoc` y fórmulas.

## Evaluación honesta

Esto no es una sola tabla de traducción: es un **sistema de resolución en
varios niveles**, donde el perfil concreto depende de la serie, del tipo de
apertura, del tipo de hoja y probablemente de las medidas. Es coherente con lo
que hace un configurador de carpintería de verdad, y con que la aplicación
original tenga 968 tablas.

Resolverlo del todo es una sesión de trabajo en sí misma. Lo prudente es no
construir valoración sobre una comprensión parcial: un precio mal calculado
que parece correcto es peor que un "sin valorar" honesto.

## Estado del código

- La interfaz ya muestra **"sin valorar"** en lugar de un cero engañoso.
- La geometría del despiece —medidas, ángulos, cortes— es correcta y no depende
  de esto.
- Scripts de diagnóstico en `scripts/buscar-genericos.mjs` y
  `scripts/resolver-genericos.mjs`, para retomar sin rehacer el análisis.
