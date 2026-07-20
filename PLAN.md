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

---
---

# ANEXO J — Resolución genérico → perfil: RESUELTA y validada contra el oráculo (18/07/2026)

**Cierra la investigación del anexo I. Corrige dos afirmaciones de ese anexo.**

## Correcciones al anexo I

**1. La clave de resolución NO es el código de artículo genérico: es
`EstructurasArticulos.DisComponente`.** El anexo I interpretó "genérico 10 →
GM100", pero GM100 es "CERCO VENTANA 28 S100" —un marco— mientras que el
artículo genérico 10 es una hoja. La coincidencia era un espejismo: el `10` de
`ConjuntosLin.Componente` es el `DisComponente` del MARCO INFERIOR de la
plantilla, no el artículo genérico 10. Con la clave correcta:

```
plantilla 1+1, serie GMA100 (ConjuntosLin, clave DisComponente):
  DisComp 12 (MV, marco vertical)  -> GM100  CERCO VENTANA 28 S100     ✔ semántica
  DisComp 11 (MH, marco superior)  -> GM100  CERCO VENTANA 28 S100     ✔
  DisComp 10 (MH, marco inferior)  -> GM100  CERCO VENTANA 28 S100     ✔
  DisComp 17M (TM, travesaño)      -> GM119  PILASTRA 47 S100          ✔
  DisComp 25/26 (HV/HH, hoja)      -> GM101  HOJA LISA VENTANA S100    ✔
  DisComp 29 (HH, vierteaguas)     -> GM125  VIERTEAGUAS 30 MM         ✔
```

Los genéricos 2, 3, 97 y 105 que "no resolvía ningún conjunto" no existen como
`Componente` en ninguna fila de `ConjuntosLin` (comprobado: 0 filas): nunca
fueron la clave.

**2. `TablaHojas`/`TablaFijos` (`GM08`) no son catálogos de perfiles.** `GM08`
solo existe en `TAcristalamiento*`: son tablas de acristalamiento (junquillos
y juntas por grosor de vidrio). No intervienen en la resolución de perfiles.

## El mecanismo completo

```
1. PERFILES PRINCIPALES (MV, MH, HV, HH, TM):
   ConjuntosLin[ Conjunto ∈ cadena(serie) ][ DisComponente ] -> Articulo real

   cadena(serie) = la serie misma + conjuntos delegados transitivamente por
   los campos de Conjuntos: SubSerieDe, herr* (los TablaHojas/Fijos/DobleH
   apuntan a acristalamiento, no a conjuntos de perfiles).

2. VARIANTES DE ACRISTALAMIENTO: componentes con sufijo ".1" (cristal
   sencillo) / ".2" (doble cristal). Ej. GMC400: 21.1 -> GM445 HOJA LATERAL
   53MM y 21.2 -> GM449 HOJA LAT.D.CRIST.52MM. 278 filas con sufijo en
   ConjuntosLin. En el histórico de la empresa el 100% de los casos usa .2
   (siempre doble cristal), así que el selector no se puede aprender de los
   datos: se deriva del vidrio elegido y, si es ambiguo, la pieza queda
   "sin valorar".

3. ASOCIADOS (escuadras, herrajes, zona apertura, compás):
   ConjuntosAsoc[ Conjunto ∈ cadena(serie) ][ ComponenteAsoc ] -> Articulo,
   con Cantidad (incluye cantidades negativas: correcciones) y fórmulas
   propias. Ej.: GMA100 + 58 (escuadra) -> GM1222.
   ConfigSeriesAsoc añade artículos por TipoHoja (M=marco, H=hojas,
   G=general) con FormulaL/FormulaA y filtros de medida.

4. NO RESUELVEN POR SERIE (elección del usuario o configuración):
   cristal (DisComponente 1: acristalamiento), manilla (130: opciones de
   herraje), mano de obra (39: campos mo* de Conjuntos), infHV (50).
```

## Validación contra el oráculo

El anexo I suponía que las 12.689 instancias de `EstructurasArticulos` con
`TipoDoc` eran el despiece resuelto. **No lo son: guardan aún el genérico.**
El despiece resuelto vive en `VPresupuestosLin`: la línea padre tiene
`EstructuraSN=True` y `Articulo` = código de estructura; las hijas cuelgan por
`nEstr` = `nLinea` del padre y llevan el perfil real con su `Funcion` y sus
medidas de corte. La serie de cada línea está en `VDatosLinEstr.Conjunto1`
(clave `nVDoc`+`nVLinea`).

Prueba sobre las 1.657 líneas de estructura de presupuestos reales con serie
conocida, comparando por (línea, Función) los artículos de perfil predichos
frente a los reales (script `scripts/validar-oraculo2.mjs`):

| Resultado | Piezas | % |
|---|---|---|
| Coincide con lo que eligió GAIA | 5.595 | **96,5%** |
| Predice otro perfil | 67 | 1,2% |
| Sin predicción (→ "sin valorar") | 137 | 2,4% |

Y los restos están explicados:

- **Huecos**: casi todos de estructura código `0` (diseño específico sin
  plantilla, `DisEspecificoSN`); no son resolubles por plantilla.
- **"Fallos" con real 4, 5, 6**: el artículo real del documento ES el
  genérico: GAIA lo dejó sin resolver. No es fallo nuestro.
- **Fallos reales (~1%)**: variantes de apertura de ELEGANTPVC y similares
  (GM8781M frente a GM8787M): la plantilla trae un componente y el documento
  usó la variante de otra apertura (oscilo/practicable). Dimensión pendiente;
  mientras tanto, esas piezas se detectan y quedan "sin valorar" si el
  componente no resuelve, o se valoran con el perfil de la plantilla asumiendo
  el error del ~1% conocido y acotado. Decisión: NO asumir; ver implementación.

## Scripts de esta investigación

```
scripts/resolver-delegados.mjs        hipótesis 1 (delegación): descartada para perfiles
scripts/hipotesis-discomponente.mjs   hipótesis 2 (DisComponente): confirmada
scripts/buscar-componentes-restantes.mjs  asociados en ConjuntosAsoc/ConfigSeriesAsoc
scripts/inspeccionar-doc.mjs          anatomía de un documento real
scripts/inspeccionar-variantes.mjs    sufijos .1/.2 de acristalamiento
scripts/selector-variante.mjs         el histórico usa .2 en el 100% de los casos
scripts/validar-oraculo.mjs           v1: demostró que las instancias guardan el genérico
scripts/validar-oraculo2.mjs          v2: validación real, 96,5% de coincidencia
```

---
---

# ANEXO K — Asociados: fuentes identificadas, selección pendiente (18/07/2026)

**Continúa el anexo J. Los perfiles están resueltos; esto cubre el resto de
piezas: escuadras, herrajes, juntas, junquillos, mano de obra.**

## Descomposición por fuente (medida contra el oráculo)

Sobre 66.046 piezas asociadas de 1.658 líneas reales de documentos
(`scripts/medir-categorias-restantes.mjs`):

| Fuente | Piezas | % |
|---|---|---|
| `ConjuntosAsoc` / `ConfigSeriesAsoc` (cadena de la serie) | 47.127 | 71,4% |
| `TAcristalamiento`/`TAcristalamientoLin` (junquillo + juntas por grosor de vidrio, vía `TablaHojas`/`TablaFijos`) | 10.730 | 16,2% |
| Mano de obra (artículos `MO`, `MOCOL`, `MOCOMP`, en minutos) | 6.571 | 9,9% |
| Sin fuente identificada | 1.618 | 2,4% |

El 2,4% restante: compactos de persiana (elección del usuario: `COM009`,
`PSH100`, `PSESQCOM`), acoples de inversora (variante de apertura) y
artefactos del propio GAIA (el artículo `135` se llama literalmente
"¡HAY PERFILES SIN PRECIO!").

Para eso servía `TablaHojas`: el anexo J ya descartó que resolviera
perfiles; es la tabla de acristalamiento que da junquillo, junta exterior e
interior según el grosor del vidrio elegido (`TAcristalamientoLin`:
`TAcris + Grosor -> Junquillo/JuntaExt/JuntaInt`, más gomas y listas de
junquillos en la ficha `TAcristalamiento`).

## La selección es multifactor — NO implementada a propósito

Tener la fuente no basta: hay que saber qué filas entran en cada línea.
Examinando `ConjuntosAsoc` contra un documento real
(`scripts/seleccion-asociados.mjs`, doc 764, serie GMA350):

- **`ComponenteAsoc`**: ranura de la plantilla a la que se asocia la pieza
  (58/59 escuadras, 52–57 hojas, 71 zona apertura, `OBM`/`OBC` oscilo,
  `A`/`L` = una por ancho/alto — las patillas de anclaje).
- **`AsociadoA`**: texto del elemento padre ("TRAVESAÑO", "BATIENTES",
  "HOJAS"…) cuando `ComponenteAsoc` es `!`.
- **`nOpcion`**: opción de herraje (1, 2, 4, 11–16…) — exige la dimensión
  de opciones del configurador (origen `VOpcionesHerraje`, 25.335 filas).
- **`ArticuloAsoc`**: condicionado a que un perfil concreto esté presente.
- **`MedidaMin`/`MedidaMax`**: por tamaño (bisagra GM5002 solo 1100–1800 mm;
  compases de oscilo por tramos de altura).
- **`Cantidad` negativa**: correcciones que restan.

Hay además contradicciones aún sin explicar (filas con el mismo
`ComponenteAsoc` donde una entra y otra no). **Decisión: no construir la
valoración de asociados sobre esta comprensión parcial.** Un asociado de más
infla el precio en silencio; uno de menos lo acorta. Ambos son peores que el
"sin valorar" honesto que muestra hoy la interfaz.

## Qué hace falta para cerrarlo

1. Modelar las **opciones de herraje** en la línea (grupo/opción, origen
   `ConfigSeriesHerraje` + `VOpcionesHerraje`) — desbloquea `nOpcion`.
2. Modelar el **acristalamiento** de la línea (vidrio por slot y su grosor)
   — desbloquea junquillos/juntas por `TAcristalamientoLin` y la variante
   `.1`/`.2` del anexo J.
3. Con 1 y 2, validar la selección contra el oráculo igual que los perfiles
   (predicción exacta línea a línea) antes de activarla en la valoración.

## Scripts

```
scripts/oraculo-asociados.mjs            cobertura de fuentes: 77,9% con las Asoc
scripts/medir-categorias-restantes.mjs   descomposición 71,4/16,2/9,9/2,4
scripts/seleccion-asociados.mjs          semántica de selección, doc real
```

---
---

# ANEXO L — Vidrio: modelo completo, medido y validado (18/07/2026)

**Primera pieza del acristalamiento (anexo K, punto 2). Implementada.**

## El modelo, en tres reglas

**1. MEDIDA.** El vidrio no sale de las fórmulas de la plantilla: sale de la
hoja que lo aloja, restando el **descuento de galce**:

```
medida del vidrio = medida de corte de la hoja − delta(serie, perfil de hoja)
```

El delta se MIDIÓ del histórico (2.431 vidrios reales, emparejamiento
inequívoco hoja-vidrio): es **constante al 100%** por (serie, perfil de hoja)
en todas las combinaciones con muestras. Ejemplos: ELEGANTPVC·GM8783M =
130,6 mm; GMA350·GM301 = 104,2; GMA350·GM307/GM308 = 144,6; GMPC65·GM10002M
= 123. La primera pasada agrupando sólo por serie daba 60% en GMA350: el
delta es del PERFIL, no de la serie (cada hoja tiene el suyo). La corredera
GMC400 es asimétrica (80,5 / 62,8) y queda excluida de la v1.

Verificación puntual: doc 764, hueco 400×900, hoja GM307 325,6×409,25,
delta 144,6 → vidrio 181×264,65. Exacto.

**2. METRAJE FACTURABLE.** Por dimensión, redondeo HACIA ARRIBA al múltiplo
del artículo (`MetrajeMultiploLargo/Ancho`, en **cm**), producto de áreas, y
`MetrajeMinimo` en m². Validado contra 2.273 vidrios reales: **98,7% exacto**
(los restos: mínimos aplicados a grupos de unidades).

**3. PRECIO.** metraje × PVP por m² de la tarifa (los vidrios tarifan con
acabado `*`).

## Implementación

- Tabla `vidrio_galce` (serie, perfil, delta, muestras): la genera el ETL
  midiendo el histórico; sólo emite filas con ≥3 muestras y ≥90% de
  consistencia (14 filas hoy). Sin fila → "vidrio sin calcular".
- `packages/core/src/precios/vidrio.ts`: `medidasVidrio` y `metrajeVidrioM2`.
- Línea de estructura: campo Vidrio (código familia 050 M2, validado en
  servidor). El importe del vidrio se suma al PVP de la línea; la pieza se
  persiste en `lineas_despiece` (función VIDRIO, largo × ancho, coste m²).
- Casos ambiguos (varias hojas distintas, sin delta medido, galce que no
  cabe) → aviso explícito "vidrio sin calcular", nunca un precio a ojo.

Verificado en vivo: 1+1 + ELEGANTPVC + V420AGS4, hueco 1600×1230 →
2 vidrios de 1469,4 × 484,4 (= 1600−130,6 y 615−130,6), metraje 0,81 m²
(múltiplos de 6 cm), coste 47,43 €/m² → 76,84 €.

## Pendiente del acristalamiento

- Vidrios de FIJOS (delta contra marco, no medido aún) y correderas.
- Junquillos/juntas por `TAcristalamientoLin` (grosor del vidrio elegido).
- Variante `.1`/`.2` de perfiles derivada del vidrio (hoy fija a `.2`).
- Slots múltiples (hasta 5, hojas/fijos por separado).

## Scripts

```
scripts/analizar-cristal.mjs         ranuras de cristal, vidrios reales, redondeos
scripts/medir-descuento-vidrio.mjs   delta por (serie, perfil): 100% consistente
scripts/validar-metraje-vidrio.mjs   regla de metraje: 98,7% exacto
```

---
---

# ANEXO M — Junquillos y juntas por grosor de vidrio (18/07/2026)

**Segunda pieza del acristalamiento (tras el vidrio del anexo L). Implementada.**

## El mecanismo, validado contra el oráculo

**R1 — Artículos.** La serie declara `TablaHojas` -> tabla de
`TAcristalamiento`; `TAcristalamientoLin` da por grosor el junquillo, la
junta exterior y la interior. La clave es el **`TamJunqGoma` del vidrio**
(no `GrosorPesoVid`), y la fila elegida es la de **menor `Grosor` >= TamJunqGoma**:
V420AGS4 (28) -> fila 28,5 -> GM8827+GM4057+GM4091; V48CG4 (16) -> fila 17,5
-> GM8207+GM4057+GM4089. Sobre 990 líneas reales: 76% con los tres artículos
presentes — y el 21,4% de "ninguno" son correderas cuya tabla es
literalmente "SIN JUNQUILLOS" (GM01, junquillo=0, juntas=V1000, un marcador
que ni existe en el catálogo). Excluidas éstas, la regla acierta ~95%+.

**R2 — Longitudes de juntas.** Junta exterior e interior = dimensiones del
MÓDULO del cristal (las fórmulas de la ranura: `L` y `(A)/2`), 2 unidades
por dimensión y por cristal. Verificado en documentos (1200/525, 1284,5/614,5).

**R3 — Longitudes de junquillo.** junqVertical = vidrioLargo + ajusteL;
junqHorizontal = vidrioAncho + ajusteA, con ajustes CONSTANTES por serie
(medidos del histórico, 91–100% de consistencia): ELEGANTPVC −28/+16,
GMA350 −28/+12, GMA65OPT −34/+10, GMA60RL −28/+12…

## Implementación

- `tacris_filas` (2.488 filas de TAcristalamientoLin; artículos '0' o V1000
  se limpian a null) y `conjuntos.tabla_hojas`/`tabla_fijos`.
- `junquillo_ajustes` (serie, ajusteL, ajusteA): lo mide el ETL del
  histórico con el mismo criterio que el galce (≥3 muestras, ≥90% en ambas
  dimensiones): 9 series emitidas, 3 excluidas (GMA65OHS entre ellas, 88%).
- `estructura_componentes` gana `formula_ancho`/`formula_ancho_corte`
  (necesarias para el módulo del cristal).
- En la línea: si el vidrio se calculó, junquillos y juntas entran como
  piezas ML normales (misma valoración con mínimos y múltiplos), se suman al
  PVP y se persisten con funciones JUNQ/JEXT/JINT. Sin fila de tabla, sin
  ajuste medido o fórmulas no evaluables -> aviso "sin calcular".

Verificado en vivo (1+1 + ELEGANTPVC + V420AGS4, 1600×1230): junquillo
GM8827 2×1441,4 + 2×500,4 por cristal (= vidrio −28/+16), juntas GM4057 y
GM4091 2×1600 + 2×615, línea 447,84 -> 507,64 €.

## Pendiente

- Correderas: sin junquillos por tabla (correcto), pero sus felpudos/zócalos
  van por otra vía (probablemente ConjuntosAsoc con los componentes .1/.2).
- Fijos: `TablaFijos` cargada pero sin explotar (los fijos usan su propia
  tabla y su galce contra marco, no medido).
- GMA60RL: la fila elegida no coincide en 17 líneas (junq GM8414 predicho,
  real otro) — grosor límite; revisar cuando se aborden los fijos.

## Scripts

```
scripts/analizar-junquillos.mjs   mecanismo y claves de grosor
scripts/validar-junquillos.mjs    R1 76%/95%, R3 constantes por serie
```

---
---

# ANEXO N — Vidrio de FIJOS (18/07/2026)

**Tercera pieza del acristalamiento. Implementada. Cierra hojas + fijos.**

## Medición (200 líneas reales de solo-fijo)

- **Galce del fijo**: vidrio = corte del CERCO (MV/MH) − delta, con el MISMO
  delta en ambas dimensiones, **constante al 100%** por (serie, perfil de
  cerco): GMA350·GM300 = 64,4 (n=92), ELEGANTPVC·GM8781M = 86 (n=58),
  GMA60RL·GM8855L = 68, GMA65OPT·GM16068L = 64, GMA75C16·GM16332H = 76.
- **Junquillo del fijo**: sale de `TablaFijos` con la misma regla de grosor
  (menor Grosor >= TamJunqGoma). El esperado estaba presente en **200 de
  200** líneas. Sus ajustes de longitud son PROPIOS, distintos de los de
  hoja: ELEGANTPVC fijo −50/0 (hoja −28/+16) — eran los modos secundarios
  del 7% que se veían en el anexo M. GMA350 fijo −28/+12 (igual que hoja).
- **Juntas**: dimensiones del módulo, como siempre.

En la medición de ajustes se omiten vidrios casi cuadrados
(|largo−ancho| < 60 mm): la asignación corte→dimensión sería ambigua.

## Implementación

- Tablas `vidrio_galce_fijo` (5 filas) y `junquillo_ajustes_fijo` (5), que
  el ETL mide del histórico con los umbrales de siempre (≥3, ≥90%).
- La línea detecta el contexto: con hojas (HV) → vidrio de hoja; sin hojas →
  vidrio de FIJO contra el cerco. La tabla de acristalamiento y los ajustes
  cambian con el contexto (TablaHojas/TablaFijos).
- **Guarda anti-mezcla**: si el nº de cristales no cuadra con el nº de hojas
  (estructuras mixtas hoja+fijo), el vidrio queda "sin calcular" — NO se
  extrapola el vidrio de hoja a los huecos fijos.

Verificado en vivo (estructura 02V + GMA350, 1600×1230):
- V420AGS4 (galce 28): vidrio 1535,6×1165,6 ✔ y aviso honesto de junquillos
  "sin tabla aplicable" — el galce 28 no cabe en la tabla GM02 del fijo.
- V484 (galce 16): vidrio ídem, junquillo GM8207 2×1507,6 + 2×1177,6
  (−28/+12), juntas GM4057/GM4089 (fila 17,5) a 1600/615. Línea 300,57 €.

## Pendiente del acristalamiento

- Estructuras MIXTAS hoja+fijo (requiere emparejar cada ranura de cristal
  con su hueco: DisVidrio/DisIdHoja de la plantilla).
- Correderas (felpudos/zócalos, sin junquillos por tabla).
- Variante `.1`/`.2` derivada del vidrio; slots múltiples.

## Scripts

```
scripts/analizar-fijos.mjs   anatomía de líneas de solo-fijo
scripts/medir-fijos.mjs      deltas 100%, junquillo esperado 200/200
```

---

# ANEXO O — Estructuras mixtas: límite medido (18/07/2026)

La fase de medición confirma que el acristalamiento mixto (hoja + fijo) es
frecuente y que **no se puede valorar como una extensión del caso simple**.

`scripts/analizar-mixtas.mjs` encontró, entre otras, 46 instancias de `2OFI`,
40 de `1OFI` y 22 de `3HO` con hojas y más de una medida de vidrio. En la
plantilla de `2OFI` las ranuras se distinguen por campos como `DisVidrio`,
`DisTipoHoja`, `DisIdHoja` y `DisGrupo`; por tanto, el emparejamiento debe ser
ranura a ranura. Una sola medida derivada de los perfiles de hoja no cubre los
huecos fijos.

**Decisión:** no se activa ninguna valoración adicional para mixtas. La guarda
existente conserva la línea como *sin valorar* cuando el número de cristales no
cuadra con el de hojas. El siguiente trabajo debe contrastar un emparejamiento
explícito con el oráculo antes de escribir lógica de precio.

---

# ANEXO P — Corrección de la medición de mixtas y variante explícita (18/07/2026)

## P.1 La primera clasificación de "mixta" era demasiado amplia

El anexo O clasificaba una estructura como mixta cuando tenía hojas y vidrios
de varias medidas. Esa condición también incluye correderas y estructuras con
varias hojas, aunque no tengan ningún fijo. Por eso aparecían falsos positivos
como `2O`, `1O` y `C3`.

El script `scripts/analizar-mixtas.mjs` se corrigió para exigir la evidencia
autoritaria de la plantilla: al menos una ranura de vidrio con
`DisTipoHoja = -1` (fijo) y otra con un tipo de hoja distinto.

También se corrigió un defecto del informe: mostraba la plantilla de `2OFI`
pero elegía como ejemplo histórico la primera estructura distinta disponible
(en una ejecución, `C3`). Ahora plantilla y ejemplo pertenecen a la misma
estructura.

## P.2 Hipótesis ranura a ranura: insuficiente para valorar

Se evaluaron `FormulaLargo` y `FormulaAncho` de cada ranura con las medidas y
cotas reales de la instancia. Después se midió el descuento entre el módulo y
el vidrio histórico, agrupado por estructura, serie y ranura (`DisTipoHoja`,
`DisIdHoja`, `DisGrupo`, `DisIdIt`). Resultado:

| Medición | Resultado |
|---|---:|
| Casos mixtos emparejables por cantidad | 121 |
| Reglas con >=3 muestras y >=90% de consistencia | 3 |
| Grupos inestables o con pocas muestras | 66 |
| Casos completos reproducidos exactamente | **5 / 121** |

La cobertura es insuficiente. En un `2OFI` real de ELEGANTPVC, por ejemplo,
el fijo limitado por marco y travesaño tiene descuentos distintos en cada eje;
no se puede reutilizar el galce medido de un fijo puro contra cuatro perfiles
de marco.

**Decisión:** no se añade valoración de mixtas. La guarda existente continúa
dejando la línea como *sin valorar*. El siguiente avance requiere modelar los
perfiles que delimitan cada hueco, no una tabla de descuentos aprendida de
cinco casos.

## P.3 Variante de acristalamiento `.1` / `.2`

La variante dejó de estar fijada a `.2` en el servidor. El formulario permite
elegir **cristal sencillo** (`.1`) o **doble cristal** (`.2`); doble sigue como
valor inicial porque representa el 100% del histórico disponible. La elección
se usa al resolver los perfiles variantes y se persiste en
`lineas_acristalamiento.variante` para conservar la trazabilidad.

---

# ANEXO Q — Perfiles que delimitan cada hueco (18/07/2026)

Este anexo corrige y continúa P.2. La cobertura de 5/121 era el resultado de
agrupar por ranura sin recuperar todas las cotas reales ni modelar el árbol de
`EstructurasDiseño`.

## Q.1 Modelo comprobado

`EstructurasDiseño` es un árbol: marco (tipo 1), división o travesaño (6),
hueco resultante (2), hoja (3) y vidrio (5). `ContenidoEn`, `idTrav` y
`posHueco` permiten reconstruir recursivamente los cuatro límites del hueco.
Una división invisible se conserva como límite físico (`@INVISIBLE:*`).

Cada perfil se acepta sólo si es inequívoco: marco `MH`/`MV`, travesaño `TM`
con el mismo `DisIdIt`, y hoja `HH`/`HV` del grupo `HP` y nodo exactos. Si hay
más de un candidato, la observación se excluye.

## Q.2 Resultado medido

Se contrastaron 270 ranuras (151 de hoja y 119 fijas), 540 dimensiones. La
firma es eje + pareja de límites exteriores + perfil de hoja (vacío en fijos).
Con un mínimo de 3 muestras y 90% de consistencia:

| Medición | Resultado |
|---|---:|
| Reglas físicas estables | **21** |
| Dimensiones reproducidas | **421 / 540** |
| Casos mixtos completos reproducidos | **49 / 121** |

Ejemplo ELEGANTPVC `2OFI`: hojas 175,1/168,5 mm; fijo inferior delimitado por
marco y travesaño, 68,5/86 mm.

## Q.3 Implementación y guarda

- `estructura_diseno_nodos` persiste el árbol geométrico limpio.
- `estructura_componentes` conserva `DisIdIt`, `DisTipoHoja` y `DisIdHoja`.
- `vidrio_descuentos_alojamiento` guarda sólo reglas medidas y sus muestras.
- El ETL vuelve a medir desde los CSV; no contiene descuentos manuales.
- El núcleo resuelve marco, travesaño, división invisible y hoja exacta con
  pruebas automatizadas.

La migración 0011 y la recarga completa del ETL están aplicadas. La valoración
web usa estas reglas ranura a ranura, persiste por separado vidrio de hoja y de
fijo y calcula sus junquillos y juntas según el contexto. Si falta cualquiera
de las dos reglas de una ranura, toda la línea queda sin valorar; los 72 casos
no cubiertos continúan protegidos por esa guarda.

Prueba real reversible: `2OFI + ELEGANTPVC + V420AGS4`, 1795×1770 con cotas por
defecto, produjo dos vidrios de hoja de 1319,9×716,5 y un fijo de 231,5×1684,
con tres slots correctamente clasificados. La línea siguió sin total por 13
genéricos ajenos al vidrio que la serie no resuelve; no por el acristalamiento.

---

# ANEXO R — Selección de asociados: medida, aún no resuelta (19/07/2026)

Retoma el anexo K con el prerrequisito 2 (acristalamiento) ya cumplido. La
hipótesis a medir: las **opciones de herraje** históricas
(`VOpcionesHerraje`: `TipoDoc+nDoc+nLinEstr+Conjunto+nOpcion+SelecSN`, 28.428
filas, `VPRES` incluido) más los defaults del catálogo
(`ConjuntosOpcionesHerraje.SelecDefSN`) bastan para decidir qué filas de
`ConjuntosAsoc` entran en cada línea.

## R.1 Medición (scripts/medir-opciones-herraje.mjs)

Sobre 1.234 líneas del oráculo cuyos asociados pertenecen a la población de
`ConjuntosAsoc` (fuera quedan mano de obra, junquillos/juntas —que salen de
`TAcristalamiento`, anexo M— y compactos, que son elección del usuario).
Filtros acumulativos sobre las candidatas de la cadena de la serie:

| Nivel | Precisión | Cobertura | Líneas exactas |
|---|---:|---:|---:|
| F0 cadena (baseline anexo K) | 37,0% | 99,8% | 0/1.234 |
| F1 + `nOpcion` (marcadas o default) | 39,7% | 99,8% | 0/1.234 |
| F2 + `MedidaMin/Max` (heurística "algún eje") | 49,8% | 93,1% | 0/1.234 |
| F3 + `ArticuloAsoc` presente | 52,1% | 93,1% | 0/1.234 |
| F4 + `ComponenteAsoc` en plantilla | 56,5% | 73,8% | 0/1.234 |

Solo el 54,1% de las líneas tiene opciones registradas; el resto depende de
los defaults del catálogo.

## R.2 Lo que la medición establece

- **La fuente queda confirmada**: el 99,8% de los asociados de serie del
  oráculo está entre las candidatas de la cadena.
- **`nOpcion` es un filtro seguro**: apenas pierde cobertura (36 casos de
  GM4090 y 4 de GM4330 en 1.234 líneas) y gana precisión. La contradicción
  del anexo K ("filas iguales donde una entra y otra no") era esto.
- **La selección NO está cerrada**: 0 líneas exactas. Los falsos positivos
  restantes (tacos de pilastra, brazos de compás por tramos 751–1200,
  cerraderos, tirantes) apuntan a tres semánticas sin resolver:
  1. **Medidas por eje**: la heurística "algún eje en rango" pierde un 6,7%
     de cobertura; `Intervalo`, `TipoMedCV` y `AltoALMin/Max` deben decir qué
     dimensión se compara.
  2. **`AperturaTH`**: el tipo de apertura de la hoja (practicable,
     oscilobatiente, fijo…) que el configurador aún no modela.
  3. **`ComponenteAsoc`**: filtrarlo contra la plantilla pierde un 19,3% de
     cobertura — el número no siempre es un slot de plantilla; su semántica
     real está sin identificar (¿genérico del despiece expandido por hoja?).

**Decisión (regla 3): los asociados siguen sin valorar.** Con 56,5% de
precisión, cada línea llevaría de media casi tanta pieza inventada como real.

## R.3 Siguiente paso concreto

1. Resolver la semántica de medidas con los campos `Intervalo`/`TipoMedCV`
   contra los casos de compases y bisagras por tramos (son los FP más
   frecuentes y tienen rangos en la descripción: verificables uno a uno).
2. Modelar la apertura de la línea (origen `VOpcionesHerraje` +
   `ConfigSeriesHerraje`) para activar `AperturaTH`.
3. Investigar `ComponenteAsoc` contra el despiece instanciado del oráculo
   (las instancias de `EstructurasArticulos` llevan `DisComponente`).
4. Solo con precisión y cobertura ~100% línea a línea, pasar cantidades
   (`Cantidad`, `FormulaL`, cantidades negativas) y después implementar.

## R.4 Medidas por eje: la referencia es la HOJA (medido)

`Intervalo` y `TipoMedCV` resultaron constantes en las 13.345 filas ('0' y
'C'): no discriminan nada. La semántica real se midió con los **grupos de
tramos** (`scripts/medir-medidas-asoc.mjs`): filas con el mismo
`Conjunto+ComponenteAsoc+nOpcion`, artículos distintos y rangos distintos.
Cuando una línea real contiene exactamente uno de esos artículos, el rango
del elegido delata contra qué dimensión se comparó.

Sobre 9.150 casos (32 grupos con ≥10 casos):

- **17 grupos (2.016 casos) se explican al ≥90% por una dimensión de la
  hoja**: el mayor corte `HH` (ancho de hoja) en 7 —los brazos de compás
  `OBPH` llegan al 100%— y el mayor corte `HV` (alto de hoja) en 10.
  Las dimensiones de la línea (`L`, `A`) no explican ninguno.
- **Los 15 grupos no explicados son todos CERRADERO ESTANDAR**: sus tramos
  probablemente gradúan la CANTIDAD (más puntos de cierre a más altura), no
  la elección del artículo. Semántica pendiente.

## R.5 Implementado: opciones de herraje en la línea (19/07/2026)

Prerrequisito 1 del anexo K, ahora cumplido. Medición previa: cada línea
histórica registra opciones de VARIOS conjuntos a la vez (la serie + una
tabla de herraje según la apertura), y ese juego es determinista por
(serie, estructura) en 70 de 80 combinaciones — las excepciones son las
variantes de apertura ya conocidas (P.ej. `ELEGANTPVC|2O`: 224× `HU532`,
2× `HU529`).

- `opciones_herraje` (migración 0012): catálogo de
  `ConjuntosOpcionesHerraje`, con defaults (`SelecDefSN`) y ocultas
  (`OcultaSN`).
- `herraje_conjuntos`: juego de conjuntos por (serie, estructura), MEDIDO
  por el ETL (`packages/etl/src/medir-herrajes.ts`) con los umbrales de
  siempre: ≥3 muestras y ≥90% de consistencia. Sin regla, el configurador
  no ofrece opciones.
- Web: al elegir serie y estructura, el alta de línea muestra las opciones
  no ocultas con sus defaults; la elección se persiste en
  `lineas_opciones_herraje` (más los defaults ocultos). **No afecta a la
  valoración**: los asociados siguen "sin valorar" hasta cerrar R.3.

## Scripts

```
scripts/medir-opciones-herraje.mjs   selección contra el oráculo (R.1)
scripts/medir-medidas-asoc.mjs       hipótesis de dimensión por tramos (R.4)
```

---

# ANEXO T — PRUEBA REAL del motor contra el histórico: la hoja no se reproduce (19/07/2026)

Agotados los frentes de medición de asociados, se pasó a probar el código
que valora de verdad. `scripts/probar-motor-contra-oraculo.mjs` llama a
`calcularDespiece` de `packages/core` sobre 1.229 líneas reales de
presupuesto y compara pieza a pieza con lo que el ERP cortó (multiconjunto
de largos por función, tolerancia 0,51 mm).

**Es la primera prueba de extremo a extremo del motor. El resultado obliga
a matizar el estado del proyecto.**

| | |
|---|---:|
| Piezas reales | 18.468 |
| Piezas que el motor reproduce | **4.634 (25,1%)** |
| Líneas con TODAS las piezas correctas | **175/1.229 (14,2%)** |
| Piezas que el motor no supo calcular | 0 |

## T.1 Qué NO dice este resultado

**No contradice el "417 de 417 fórmulas validadas" ni el "99,6% de
componentes resueltos".** Esas cifras miden cosas distintas y siguen
siendo ciertas: que el evaluador resuelve todas las fórmulas del catálogo,
y que la cadena genérico→perfil resuelve el 99,6% de los componentes.
Ninguna de las dos medía si el despiece resultante **coincide con lo que
el ERP cortó**. Esa prueba no se había hecho nunca, y es la que importa
para cortar aluminio.

Conviene por tanto leer "motor operativo al 99,6%" (`ENTREGA.md`) como
*"evalúa el 99,6% de los componentes"*, no como *"acierta el 99,6% de los
cortes"*.

## T.2 El fallo está localizado: es la HOJA, no el motor entero

Control del arnés, separando las líneas por si llevan hoja:

| | líneas | piezas correctas | líneas exactas |
|---|---:|---:|---:|
| SIN hoja (marco/travesaño) | 226 | 888/966 (**91,9%**) | 175/226 (**77,4%**) |
| CON hoja (HV/HH) | 1.003 | 3.746/17.502 (21,4%) | **0/1.003 (0,0%)** |

El marco se reproduce bien. **De las 1.003 líneas con hoja no hay una sola
correcta.** Los fallos se concentran ahí: 6.894 HH y 6.282 HV sin pareja,
frente a 292 MH y 12 MV.

## T.3 Los recuentos son correctos; los largos, no

Depuración de una línea real (estructura `2O`, L=1100, A=1140, sin cotas):

```
MV  real (2): 1100, 1100     motor (2): 1100, 1100     ✔
MH  real (2): 1140, 1140     motor (2): 1140, 1140     ✔
HV  real (7): 1030 ×7        motor (7): 1100 ×7        −70
HH  real (8):  532 ×8        motor (8):  570 ×8        −38
```

El motor acierta **cuántas** piezas de hoja hay y falla **cuánto miden**.
La hoja va rebajada respecto al hueco —encaja dentro del marco— y el motor
emite la medida del hueco. `(A)/2 = 570` es exactamente lo que evalúa la
fórmula; el corte real es 532.

## T.4 El rebaje existe pero no es una constante por serie

Medido el rebaje `motor − real` por (serie, función) con los umbrales de
siempre:

| (serie \| función) | rebaje | muestras |
|---|---:|---:|
| `GMPC65` HV | 74 | 424/424 ✔ |
| `GMPC76R` HV | 82 | 196/196 ✔ |
| `GMC400` HV | 53 | 1.116/1.156 ✔ |
| `ELEGANTPVC` HV | 70 | 2.919/3.515 ✘ |
| `ELEGANTPVC` HH | 37,9 | 2.776/3.932 ✘ |
| `GMPC65` HH | 4 | 320/424 ✘ |
| `GMC400` HH | 20 | 992/1.156 ✘ |

**23 de 40 reglas estables, 2.080 de 12.697 piezas cubiertas.** El eje HV
es mucho más consistente que el HH, y los rebajes de HH varían dentro de
una misma serie (4, 5, 20, 24, 37,9). Es decir: **el rebaje no depende
sólo de la serie**, sino probablemente del perfil concreto que resuelve el
genérico, que es información que el motor no recibe hoy.

**No se ha implementado ningún rebaje.** Con 23 de 40 reglas no se toca un
motor que corta material real (regla 3).

## T.6 El rebaje es del PERFIL, no de la serie — confirmado en dirección, sin cerrar

Medido el punto 1 de T.5 (`scripts/medir-rebaje-hoja.mjs`). Primero se
descartó que el descuento venga declarado: **`ConjuntosLin` —la tabla que
resuelve genérico→perfil— sólo tiene 4 columnas** (`Conjunto`,
`Componente`, `Familia`, `Articulo`). No hay campo de descuento.

Comparando la estabilidad del mismo rebaje según cómo se agrupe, sobre las
mismas 148 observaciones:

| Agrupación | grupos | estables | piezas cubiertas |
|---|---:|---:|---:|
| a) serie + función | 6 | 2 | 8/148 (5,4%) |
| **b) PERFIL REAL + función** | 13 | 6 | **52/148 (35,1%)** |
| c) perfil + marco + función | 16 | 8 | **62/148 (41,9%)** |

**La hipótesis de T.5 se confirma en dirección**: el perfil explica más de
seis veces lo que explica la serie. Y que añadir el perfil de MARCO mejore
todavía más encaja con la lectura física: el rebaje es el **solape entre
la hoja y el marco**, y depende de los dos perfiles, no de uno.

Los rebajes por perfil son valores redondos y propios de cada perfil, lo
que refuerza que sean una característica física:

| Perfil | rebaje | muestras |
|---|---:|---:|
| `GM301` HOJA 47 CURVA 350E | 40,4 | 26/28 ✔ |
| `GM308` HOJA APERTURA EXTERNA 350E | 74,4 | 8/8 ✔ |
| `GM8852M` HOJA 47 MM ST.50 RPT | 44 | 4/4 ✔ |
| `GM16218L` HOJA 73 BALCONERA | 96 | 4/4 ✔ |
| `GM8245` HOJA BALCONERA 50 MM | 93 | 4/4 ✔ |
| `GM307` HOJA BALCONERA 47 MM 350E | 74,4 | 30/40 ✘ |

**Pero NO se cierra, y hay que decir por qué.** Dos límites serios:

1. **La muestra es pequeña y sesgada**: 148 observaciones de 2.082
   posibles; **1.934 descartadas** por tener varios perfiles en la misma
   función o por no coincidir el recuento de piezas. El filtro de no
   ambigüedad, que es lo que hace fiable la medición, es también lo que la
   deja sin muestra.
2. **Sólo mide HV**. Ningún grupo de HH sobrevive al filtro: en el eje
   horizontal las líneas casi siempre mezclan perfiles. Y precisamente HH
   era el mayor foco de fallos del anexo T (6.894 piezas).

Con 41,9% de cobertura en el mejor caso, y sin ninguna medida del eje HH,
**no se implementa ningún rebaje**. Sería tocar el motor que corta
material real con una regla medida sobre el 7% de las piezas y ciega en el
eje que más falla.

**Prerrequisito antes de volver aquí**: resolver el emparejamiento de las
líneas con varios perfiles por función —con la maquinaria de
`mejorEmparejamiento` de `packages/etl/src/medir-mixtas.ts`, que ya
resuelve ese problema para los vidrios—. Sin eso, cualquier medición del
rebaje seguirá viendo el 7% de los datos.

## T.7 Muestra desbloqueada (51×) — y T.6 queda corregido

El cuello de botella de T.6 no era estadístico sino estructural, y se
resuelve sin inventar nada: **`VDatosLinDetDis` enlaza cada línea hija real
con su ítem de diseño (`DisIdIt`)** —el mismo enlace que
`packages/etl/src/medir-mixtas.ts` usa para emparejar vidrios—. Con él,
cada pieza real se empareja con su fila de plantilla por
(función, `DisIdIt`): exacto, sin ordenar ni adivinar, y válido aunque la
línea mezcle perfiles (`scripts/medir-rebaje-hoja-v2.mjs`).

| | T.6 | **T.7** |
|---|---:|---:|
| Observaciones | 148 | **7.639** (51×) |
| Eje HV | 148 | 3.250 |
| Eje HH | **0** | **4.389** |
| Descartes | 1.934 | 555 |

**Corrección explícita de T.6.** Con la muestra completa, la ventaja del
perfil sobre la serie **desaparece**:

| Agrupación | T.6 (n=148) | **T.7 (n=7.639)** |
|---|---:|---:|
| serie + función | 5,4% | **14,0%** |
| perfil + función | 35,1% | **15,0%** |
| perfil + marco + función | 41,9% | 10,5% |

T.6 concluía que *"el perfil explica más de seis veces lo que explica la
serie"*. **Era un artefacto de la muestra sesgada**: las 148 observaciones
que sobrevivían al filtro de no ambigüedad eran justamente las líneas de
un solo perfil, donde perfil y serie casi coinciden. Con los datos
completos, perfil (15,0%) y serie (14,0%) explican prácticamente lo mismo,
y añadir el marco **empeora** por dispersión. La hipótesis de T.5 —el
rebaje como solape del perfil— **no queda confirmada**.

## T.8 La cola no es ruido: hay una segunda condición

Lo que sí aporta la muestra completa es la forma de la distribución. Los
grupos mayores son **bimodales con muy pocos valores distintos**, no
dispersos:

| (perfil \| eje) | modas | valores distintos |
|---|---|---:|
| `GM8783M` HV | 70×1616, 44,5×238 | 5 |
| `GM451` HH | 20×474, 25,8×30 | 5 |
| `GM450` HV | 53×284, 0×8 | 3 |
| `GM16064L` HV | 42×84, 28,5×46 | 3 |
| `GM16064L` HH | 24×76, 42×46 | 4 |
| `GM10002M` HV | 74×212 | **1** |

Un rebaje dominante más un segundo valor limpio significa que **falta una
condición que distinga dos casos**, no que el dato sea ruidoso. La
hipótesis con fundamento físico —anotada, **no medida**— es que la pieza
de hoja se rebaja distinto según contra qué apoye: contra el marco o
contra otra hoja (cruce central). El árbol de `EstructurasDiseño` ya
modela esos límites (anexo Q, `limitesDeHueco`), así que es medible con
maquinaria existente.

**Artefacto de medición detectado**: `GM10002M` HH aparece como bimodal
con `4×160` y `4,1×52`, que son el mismo valor separado por redondear a
0,1 mm. La medición debería agrupar con la tolerancia de 0,51 mm que usa
el resto del proyecto; con 0,1 mm se inventan grupos que no existen.
Corregirlo antes de volver a medir.

**Sigue sin implementarse ningún rebaje.** Con 15% de cobertura y una
condición identificada pero sin medir, tocar el motor sería precipitado.

## T.9 La segunda condición es la FÓRMULA de la pieza (79,6%)

Medida la hipótesis de T.8 sobre las 7.639 observaciones
(`scripts/medir-rebaje-hoja-v3.mjs`), probando como discriminantes los
campos con los que la propia plantilla describe cada pieza de hoja. Se
corrigió además el artefacto de T.8: se agrupa con **tolerancia 0,51 mm**,
la del resto del proyecto, en vez de redondear a 0,1 mm.

| Discriminante | grupos | estables | piezas cubiertas |
|---|---:|---:|---:|
| perfil + eje (referencia T.7) | 52 | 26 | 1.358 (17,8%) |
| perfil + eje + `DisPosPerf` | 52 | 26 | 1.358 (17,8%) |
| perfil + eje + vecinos `DisIdPerAd*` | 52 | 26 | 1.358 (17,8%) |
| perfil + eje + `DisGrupo` | 72 | 35 | 1.425 (18,7%) |
| perfil + eje + `DisNHoja` | 145 | 53 | 3.094 (40,5%) |
| perfil + eje + grupos I/D | 93 | 55 | 3.688 (48,3%) |
| perfil + eje + `DisTipoHoja` | 153 | 96 | 4.477 (58,6%) |
| **perfil + eje + FÓRMULA** | 111 | **74** | **6.222 (81,5%)** |

**La hipótesis física de T.8 —marco frente a cruce con otra hoja— NO es la
que manda.** Los vecinos declarados (`DisIdPerAd*`) no aportan **nada**
(17,8%, idéntico a la referencia). Lo que discrimina es la **fórmula de
corte de la pieza**, que codifica su papel en la estructura de forma más
fina que cualquiera de los campos de posición.

Y no es circular: el rebaje se mide como `evaluar(fórmula) − corte real`,
así que agrupar por fórmula no fija el resultado. Dice algo comprobable:
**para un perfil, un eje y una fórmula dados, el rebaje es constante.** Los
tres datos están disponibles al despiezar.

**Prueba de validez (obligatoria aquí).** Un grupo cuyas piezas tengan
todas la misma medida evaluada sería estable por trivialidad, no por
regla. Separando:

| | grupos | piezas |
|---|---:|---:|
| estables con UNA sola medida (no demuestran nada) | 24 | 138 |
| **estables con medidas VARIADAS (regla real)** | **50** | **6.084** |

**Cobertura honesta: 6.084/7.639 = 79,6%** — de 15,0% en T.7 a 79,6%
descartando ya los grupos triviales.

**Sigue sin implementarse.** 79,6% no es reproducir el oráculo, y el 20,4%
restante son piezas reales que se cortarían mal. Pero el camino ya no es
buscar hipótesis: es el patrón que el anexo Q dejó establecido para las
mixtas — cargar las reglas medidas y **dejar sin valorar la línea a la que
le falte cualquiera de sus reglas**, en vez de rellenar con un rebaje
aproximado. Con eso, el 79,6% pasa a valorarse bien y el 20,4% avisa
honestamente en lugar de mentir.

## T.10 Regla del rebaje cerrada al 93,0%, a 1,4 puntos del techo

Analizados los 37 grupos inestables de T.9 (1.417 piezas)
con `scripts/medir-rebaje-hoja-v4.mjs`. ¿Les falta una condición, o son
irreducibles?

| Discriminante adicional | piezas recuperadas de 1.417 |
|---|---:|
| `DisNHoja` | 3 (0,2%) |
| acabado | 131 (9,2%) |
| `DisIdIt` | 658 (46,4%) |
| estructura | 769 (54,3%) |
| `DisTipoHoja` | 789 (55,7%) |
| **serie** | **1.043 (73,6%)** |

**La regla completa es `rebaje = f(perfil, eje, fórmula, serie)`.** Medida
directamente, no estimada, y con la misma prueba de validez de T.9:

| | grupos | piezas |
|---|---:|---:|
| grupos totales | 134 | |
| estables (≥3 muestras, ≥90%) | 93 | |
| de ellos triviales (una sola medida) | 29 | 163 |
| **robustos (medidas variadas)** | **64** | **7.102** |

**Cobertura honesta: 7.102/7.639 = 93,0%** (T.9 sin serie: 79,6%).

**Y hay un techo, medido.** Aplicando el test de determinismo de S.9.8 —si
dos piezas comparten perfil, eje, fórmula, estructura, ítem de diseño y
medida evaluada pero tienen rebajes distintos, ninguna regla sobre estas
entradas puede acertar las dos—: de 2.290 firmas de contexto, **70 son
ambiguas (430 observaciones)**. El techo teórico es **94,4%**.

**El 93,0% está a 1,4 puntos de lo máximo alcanzable con estos datos.** No
merece la pena seguir buscando discriminantes: lo que falta no está en los
CSV. Ese 5,6% irreducible sólo se cerraría con información que el ERP no
exporta.

### Evolución del frente

| | cobertura |
|---|---:|
| T.7 (perfil + eje, muestra completa) | 15,0% |
| T.9 (+ fórmula, tolerancia corregida) | 79,6% |
| **T.10 (+ serie)** | **93,0%** |
| Techo teórico del contexto observable | 94,4% |

### Lo que queda irreducible, anotado

Los grupos inestables restantes son casi todos del eje **HH** y de dos
perfiles: `GM8428` (VIERTEAGUAS HOJA) y `GM8783M` (HOJA CANAL 16). Sus
distribuciones incluyen valores disparatados —`-344,6`, `218,9`,
`156,4`— que no son un segundo rebaje sino, con toda probabilidad, piezas
mal emparejadas o líneas con datos atípicos. **No se ha comprobado cuál de
las dos cosas es**, y se anota como tal.

## T.11 Ahora sí: implementar con guarda

Con 64 reglas robustas y 93,0% de cobertura, el frente pasa de medición a
implementación, siguiendo **exactamente el patrón del anexo Q** para las
mixtas:

1. Migración + ETL que carguen las 64 reglas `(perfil, eje, fórmula,
   serie) → rebaje`.
2. El motor aplica el rebaje cuando existe regla para la pieza.
3. **Si a una pieza de hoja le falta su regla, la línea entera queda sin
   valorar**, con aviso — nunca se rellena con un rebaje aproximado ni se
   emite la medida del hueco como si fuera el corte.

Con eso, el 93,0% se valora bien y el 7,0% avisa honestamente, que es
justo lo que hoy no ocurre: hoy las 1.003 líneas con hoja del anexo T
producen medidas de corte equivocadas sin avisar de nada.

## T.12 Implementado con guarda — y un compromiso que hay que decidir

`calcularDespiece` acepta ahora `OpcionesDespiece.rebajeDeHoja`, que
devuelve el rebaje de una pieza o **`null` cuando no hay regla medida**.
`null` no significa "sin rebaje": la pieza queda **sin medida y con
incidencia**, para que la línea no se valore. Ocho pruebas nuevas
(`packages/core/src/despiece/rebaje.test.ts`) fijan ese comportamiento,
incluida la reproducción del caso real del anexo T (estructura `2O`:
HV 1030, HH 532). Sin tabla de reglas el motor se comporta como antes, así
que el cambio no rompe nada existente.

Prueba de extremo a extremo con las 64 reglas
(`scripts/probar-motor-con-rebaje.mjs`), sólo piezas de hoja:

| | piezas correctas | sin medida | líneas exactas |
|---|---:|---:|---:|
| SIN reglas (anexo T) | 18/7.639 (**0,2%**) | 0 | **0/934** |
| CON reglas (T.10) | 7.010/7.639 (**91,8%**) | 537 | **751/934 (80,4%)** |

La guarda funciona: las 537 piezas sin regla quedan sin medida, no con la
medida del hueco.

### El compromiso: el umbral del 90% deja pasar cortes equivocados

**Hallazgo que obliga a decidir.** Con umbral del 90%, **92 piezas salen
con una medida que no es la correcta y sin ningún aviso**. No es un fallo
de la guarda: la guarda cubre las reglas *ausentes*. Una regla que acierta
el 90% falla, por definición, una de cada diez veces — y el proyecto
sostiene que un corte mal medido es una pieza mal cortada.

Medido el coste de exigir más consistencia:

| Umbral | reglas | piezas correctas | sin medida | **cortes MALOS** | líneas exactas |
|---:|---:|---:|---:|---:|---:|
| 90% | 64 | 91,8% | 537 | **92** | 80,4% |
| 95% | 61 | 88,8% | 778 | **76** | 61,3% |
| 99% | 53 | 61,9% | 2.892 | **16** | 11,0% |
| **100%** | 50 | 18,7% | 6.214 | **0** | 11,0% |

**No es una decisión técnica sino de negocio, y no se toma sola.** El
umbral del 90% que el proyecto usa para *descubrir* reglas no es
necesariamente el que debe usarse para *cortar aluminio*:

- **90%** valora el 91,8% de las piezas, pero 92 piezas al año saldrían
  mal cortadas sin que nadie lo sepa hasta el taller.
- **100%** no permite ni un solo corte equivocado, pero deja el 81,3% de
  las piezas sin valorar, y eso devuelve el problema al presupuesto.

La implementación **no fija ninguno**: el umbral vive en quien construye la
tabla de reglas, no en el motor. Queda **pendiente de decisión explícita**
antes de conectar esto a producción.

## T.13 La cola es variación real, y sus errores son grandes

Antes de elegir el umbral de T.12 había que saber **qué son** las 92 piezas
que se salen de su regla (`scripts/medir-cola-rebaje.mjs`). Dos hipótesis
con consecuencias opuestas: que fueran piezas mal emparejadas (arreglable,
sin coste de cobertura) o variación real del rebaje (compromiso
inevitable).

| ¿Qué son las 92 piezas atípicas? | |
|---|---:|
| Su corte encaja con OTRA fórmula de la misma estructura y eje | 0 (0,0%) |
| Su delta coincide con el rebaje de otra regla del mismo perfil | 2 (2,2%) |
| **Sin explicar — variación real del rebaje** | **90 (97,8%)** |

**El emparejamiento no tiene la culpa.** Las 92 piezas no son un artefacto
de medición: son variación real. **El compromiso de T.12 es inevitable** y
el umbral hay que decidirlo, no esquivarlo.

### Y no son errores de un milímetro

El dato que faltaba para decidir con criterio. "92 cortes malos" no
significa lo mismo si son de 1 mm que si son de 3 cm:

| Error | piezas | |
|---|---:|---:|
| ≤ 1 mm | 6 | 6,5% |
| 5–10 mm | 13 | 14,1% |
| 10–25 mm | 13 | 14,1% |
| 25–50 mm | 31 | 33,7% |
| **> 50 mm** | **29** | **31,5%** |

**El 79,3% se desvía más de 10 mm. El error máximo es 630,5 mm.** No son
redondeos tolerables en carpintería: son hojas que no entran en su marco.

**Esto refuerza la cautela en la decisión pendiente de T.12.** Un umbral
del 90% no reparte 92 pequeñas imprecisiones: reparte 73 piezas
inservibles entre presupuestos que parecerán correctos. La recomendación
—que sigue siendo una recomendación, no una decisión tomada— es empezar
por el 99% (16 piezas atípicas) y revisar a mano los grupos entre el 99% y
el 90%, que están identificados y son pocos.

**Anotado sin resolver**: por qué varía el rebaje dentro de un mismo
(perfil, eje, fórmula, serie). El test de determinismo de T.10 ya dijo que
el techo del contexto observable es 94,4%, así que **esa variación no se
puede explicar con los datos que exporta el ERP**. No es falta de análisis:
es falta de datos.

## T.14 La junta: el largo estaba validado, el RECUENTO no

Implementada `emitirJuntaPerimetral` en `packages/core` con la regla de
S.7.2 (cada tramo copia el corte de una pieza de perfil de hoja, delta 0) y
seis pruebas (`packages/core/src/despiece/junta.test.ts`), incluida la que
exige que una hoja sin medida produzca una junta **sin medida**, no a cero.

Ejecutada contra el histórico (`scripts/probar-junta-contra-oraculo.mjs`),
partiendo de los cortes de hoja REALES para aislar la regla de la junta del
rebaje del anexo T:

| | |
|---|---:|
| Líneas con junta real | 772 |
| Tramos reales | 3.566 |
| **Tramos casados** | **3.360 (94,2%)** |
| **Tramos emitidos DE MÁS** | **840** |
| Líneas exactas | **0/772 (0,0%)** |

**El largo es correcto; el recuento no.** El desajuste dominante es
"faltan 0, sobran 1 ó 2" (462 de las 525 líneas que fallan): la regla emite
una junta por cada pieza de perfil de hoja y **no todas las piezas de hoja
llevan junta**.

**Corrección de alcance de S.7.2.** Aquel anexo midió el delta de los
tramos que *ya estaban emparejados* — es decir, validó **cuánto mide** cada
junta, y de ahí el "delta 0, 4.624/4.632". Nunca midió **cuántas** juntas
hay. La frase *"emitir una junta por cada pieza de perfil de hoja"* era una
extrapolación no medida, y al ejecutarla se ve que sobra material.

Esto sólo aparece al ejecutar el código: ninguna medición lo habría
detectado, porque medir deltas de parejas ya formadas nunca cuestiona el
número de parejas.

**Consecuencia práctica**: emitir juntas de más **infla el presupuesto** con
material que no se usa. Es el error simétrico del que persigue el resto del
proyecto (quedarse corto), y igual de caro. La función queda implementada y
probada pero **marcada como no apta para producción** en su propia
documentación, hasta medir qué piezas de hoja llevan junta.

**Pendiente concreto y medible**: agrupar las piezas de hoja por su función,
su fórmula y su papel en el diseño, y comprobar cuáles tienen tramo de junta
en el oráculo. Es el mismo método que resolvió el rebaje en T.9-T.10, con
maquinaria ya escrita (`VDatosLinDetDis` para el enlace exacto).

**Error de arnés detectado y corregido durante la prueba**: la primera
versión buscaba el artículo de junta indexando `ConjuntosAsoc` por la serie
de la línea (`VDatosLinEstr.Conjunto1`) y no encontraba ninguno en las 772
líneas. El conjunto de `ConjuntosAsoc` **no es** la serie: los conjuntos
aplicables salen de las opciones de herraje de la línea
(`VOpcionesHerraje`), como estableció el anexo S. Es exactamente el mismo
malentendido que se documentó con `GMBASTIDOR` en S.9.3.

## T.15 Qué piezas llevan junta: NO se puede determinar con estos datos

Medido el pendiente de T.14 (`scripts/medir-que-hojas-llevan-junta.mjs`).
Sobre 525 líneas y 4.200 piezas de hoja, **el 80,0% tiene un tramo de junta
de su mismo largo y el 20,0% no**. La pregunta era qué las separa.

**Ningún discriminante lo explica:**

| Discriminante | grupos decididos | piezas explicadas |
|---|---:|---:|
| `DisTipoHoja` | 0 | 0,0% |
| eje (HV/HH) | 1 | 39,7% |
| perfil + eje + fórmula | 29 | 39,7% |
| perfil + eje | 17 | 41,4% |
| **`DisGrupo`** | 4 | **41,5%** |

El mejor llega al 41,5%, muy lejos del umbral. Y el motivo de fondo no es
que falte buscar más: **la atribución no está registrada**.

### El dato que cierra el frente

Los tramos de junta **no tienen enlace de diseño**:

| Tramos de junta en el histórico | 5.158 |
|---|---:|
| con fila en `VDatosLinDetDis` | **0** |
| con `DisIdIt` utilizable | **0** |

`VDatosLinDetDis` fue lo que desbloqueó el rebaje en T.7 (muestra ×51,
emparejamiento exacto). Aquí no existe: el ERP no registra a qué pieza de
hoja pertenece cada tramo de junta. Sin esa atribución, la relación
"pieza → lleva junta" no se puede reconstruir, sólo estimar.

**Anotado como no resoluble con los datos exportados.** No es falta de
análisis. Para cerrarlo haría falta o bien una fuente que registre la
atribución, o bien observar la aplicación original generando un despiece
con juntas y ver qué piezas las reciben.

### Corrección de método (importante)

La primera versión de esta medición emparejaba **pieza a pieza por largo** y
daba un prometedor 80% de piezas explicadas por el perfil. **Era un
artefacto.** Cuando dos piezas de hoja miden lo mismo y sólo hay un tramo de
junta, cuál de las dos queda marcada como "lleva junta" lo decide el orden
del bucle, no los datos — y esa marca arbitraria contamina cualquier
discriminante que se mida después.

Rehecha agrupando por (línea, largo), donde el recuento sí es inequívoco (3
piezas de ese largo y 2 tramos → 2 llevan y 1 no) y descartando las cestas
cuyas piezas no comparten el valor del discriminante, el 80% se desploma al
41,5%. **Es el mismo tipo de error que ya se documentó en S.7.2 y en T.6:
un emparejamiento que parece razonable fabrica la señal que luego se mide.**

## T.16 El filtro de rango de `calcular.ts` es código muerto (cierra T.5 punto 2)

T.5 dejó anotado que `calcularDespiece` decide si un componente condicional
entra comparando su `MedidaMin/MedidaMax` contra `Math.max(ancho, alto)`
(`calcular.ts:94`) — la misma referencia que S.6 **refutó** para los
asociados—, y que para perfiles no se había comprobado.

Medido (`scripts/medir-filtro-rango-perfiles.mjs`). El resultado hace la
pregunta irrelevante:

| Filas de plantilla en `EstructurasArticulos` | 15.263 |
|---|---:|
| con `MedidaMin` o `MedidaMax` distintos de cero | **0** |

**Ninguna fila de plantilla tiene rango.** Las columnas están vacías en todo
el catálogo, así que el filtro **nunca se ejecuta**: es código muerto. No hay
nada que corregir y **T.5 punto 2 queda cerrado**.

(Los rangos que sí existen y sí importan son los de `ConjuntosAsoc` —4.215
filas—, que gobiernan la selección de asociados y ya usan la referencia
correcta desde S.6: la fórmula de la propia ranura.)

**Pero queda una trampa latente, y por eso se documenta en vez de
ignorarse.** El código conserva una heurística refutada. Hoy no hace daño
porque no se activa; el día que alguien rellene `medidaMinima/medidaMaxima`
en `ComponentePlantilla` —al ampliar el ETL, por ejemplo— se activará **con
la referencia equivocada** y fallará en silencio, incluyendo o excluyendo
perfiles sin motivo. Lo correcto sería comparar contra la fórmula del propio
componente, como los asociados. **No se cambia ahora** porque no se puede
probar contra ningún dato real: no hay ni un caso en el histórico.

## T.17 Decisión tomada: umbral 99%, con el riesgo SIEMPRE visible

Decidido por el titular del negocio el 19/07/2026, tras medir el coste de
cada opción (T.12) y la gravedad de los fallos (T.13).

**Umbral: 99%.** Menos cobertura a cambio de menos piezas mal cortadas.

| Umbral | piezas valoradas | cortes malos |
|---:|---:|---:|
| 90% | 91,8% | 92 (el 79,3% se desvía >10 mm) |
| **99%** | **61,9%** | **16** |
| 100% | 18,7% | 0 |

**El riesgo se acepta, pero nunca en silencio.** Dos condiciones, ambas
parte de la decisión:

### Condición 1 — aviso en la valoración (implementada)

Toda línea que use una regla con `muestras < total_muestras` lleva **aviso
informativo**. No bloquea la valoración: la hace honesta.

- `hoja_rebajes` guarda `muestras`/`total_muestras` por regla.
- `OpcionesDespiece.rebajeDeHoja` devuelve `RebajeHoja { mm, muestras,
  totalMuestras }`, no un número suelto: la evidencia viaja con el valor.
- `PiezaCortada.aviso` y `ResultadoDespiece.avisos` exponen el mensaje, con
  el porcentaje real (`1616/1622 = 99.6%`).
- Distinto de `incidencia`, que significa "no hay medida y la línea no se
  valora". Un aviso es "hay medida, y conviene confirmarla".

**Dato a tener presente**: de las 53 reglas cargadas, 50 son exactas y sólo
3 llevan aviso — pero esas 3 respaldan **3.306 de las 4.747 piezas
valoradas**. El aviso NO será raro: aparecerá en la mayoría de líneas de
`ELEGANTPVC`. Es correcto —ahí el riesgo existe— pero conviene no
confundirlo con un fallo del sistema.

### Condición 2 — Producción exigirá 100% (pendiente, anotado aquí)

**La futura hoja de corte de Producción NO puede heredar este umbral.**
Valorar con una medida que falla una de cada cien veces es un riesgo
comercial acotado; cortar aluminio con ella es material perdido.

Requisito para ese módulo, cuando se construya:

> Una pieza de hoja sólo entra en la hoja de corte si su regla es **exacta**
> (`muestras = total_muestras`). Si no lo es, la pieza **exige confirmación
> manual** de la medida antes de cortar, o queda fuera del parte.

Con los datos de hoy eso significa: 50 de 53 reglas pasarían directas, y las
3 de `ELEGANTPVC` —que son las de más volumen— requerirían confirmación.
Incómodo, y correcto.

### Estado de la carga

Migración `0013_minor_exiles.sql` (aditiva, sólo crea `hoja_rebajes`),
aplicada. ETL ejecutado: **53/53 reglas cargadas**, verificadas contra la
base y no sólo contra el log:

| | |
|---|---:|
| Reglas | 53 |
| exactas (sin aviso) | 50 |
| con aviso | 3 |
| piezas respaldadas | 4.747 |
| que violan el umbral o las invariantes | **0** |

**Pendiente inmediato**: los **11 grupos válidos al 90% pero no al 99%**.
Son los que revisar a mano para recuperar cobertura sin bajar el umbral —el
siguiente paso acordado— y el ETL los cuenta en su informe para no perderlos
de vista.

## T.19 El aviso no se pintaba — y hoy ningún dato puede dispararlo

Dos hallazgos, uno de UI y otro de medición. El segundo es el importante.

### T.19.1 La condición 1 de T.17 estaba incumplida en pantalla

`packages/web/app/dashboard/presupuestos/[id]/page.tsx` sólo usaba
`avisoValoracion` como `title` (tooltip) de la rama **"sin valorar"**. Una
línea **valorada con avisos** pintaba su precio y el aviso se perdía: no
aparecía en ninguna parte, ni siquiera como tooltip.

T.17 dejó escrito que el riesgo del umbral 99% se acepta "pero nunca en
silencio". Durante T.17 y T.18 fue exactamente silencio. Las tres capas
—regla en `hoja_rebajes`, `RebajeHoja` con su evidencia, `avisoValoracion`
persistido— estaban bien; la última pulgada no existía. Es el mismo patrón
que T.18: capas correctas y desconectadas.

Corregido: el texto completo del aviso se pinta bajo la descripción (12 px,
`--al-warn`) y una marca corta `con avisos` bajo el precio (10 px). Verificado
en navegador contra una línea real: ambos son `display: block`, color
`rgb(217, 119, 6)`. No es un tooltip.

### T.19.2 Ese estado NO es alcanzable hoy con ningún dato

Al intentar reproducirlo en la aplicación, ninguna línea llegaba a
"valorada con avisos". Medido en vez de supuesto, sobre **las 57 series ×
519 estructuras**:

| Camino al aviso informativo | combinaciones que lo alcanzan |
|---|---:|
| Regla de rebaje no exacta (`GM8783M`, ELEGANTPVC) | **0** |
| Variante de cristal aplicada | **0** |

Bajo ELEGANTPVC, 126 de 519 estructuras resuelven todas sus ranuras — pero
son persianas, compactos y tubos (`PSU*`, `COM*`, `GMTUB*`): **ninguna lleva
pieza de hoja**, así que ninguna puede usar una regla de rebaje. Y toda
estructura con hoja (`2O`, `1+1`…) deja ranuras sin resolver, luego cae en
`problemas` y queda **sin valorar**, que es un estado más fuerte que el aviso.

Comprobado en `2O` bajo ELEGANTPVC: 13 ranuras sin resolver, de dos clases
distintas —asociados (`infHAesc`, `infMOmof`, `infHAB`, `infZApert`,
`AccDisMI`) y perfiles (`94 HV`, `168 HH`, `91 HH`, `92/93 HV`)—.

**Consecuencia para T.17**: la rama informativa de `acciones.ts` es hoy
inalcanzable en la práctica. No es código muerto como el filtro de T.16 —se
vuelve alcanzable en cuanto una línea llegue a cero ranuras sin resolver—,
pero **la afirmación de T.17 de que "el aviso aparecerá en la mayoría de
líneas de ELEGANTPVC" no es cierta todavía**: hoy no aparece en ninguna,
porque esas líneas ni siquiera se valoran. Se corrige aquí explícitamente.

Requiere para desbloquearse: cerrar los asociados (anexo S) **y** las ranuras
de perfil que la serie no resuelve. El arreglo de UI se adelanta a ese momento
en vez de esperarlo, que es lo correcto: cuando la valoración se complete, el
aviso ya estará visible en lugar de descubrirse ausente otra vez.

**Cómo se verificó** (los datos de prueba se borraron después): presupuesto de
prueba en la aplicación con dos líneas ELEGANTPVC tomadas del histórico real
(`1+1` 1600×1230 y `2O` 1200×1050, vidrio `V420AGS4`, acabado `L`); ambas
salieron sin valorar, y el estado "valorada + aviso" hubo que **forzarlo en
la base** para poder ver el renderizado.

**Nota de método**: durante el diagnóstico un `Application error` del cliente
pareció venir del cambio de UI. No venía: lo provocaban los `git stash`/`pop`
del propio experimento, que recompilaban el servidor a mitad de petición. Se
descartó recargando en limpio (3 de 3 respuestas con el aviso presente) antes
de "arreglar" un fallo inexistente.

## T.20 Los 11 grupos están detrás del tapón: cambia el orden de trabajo

Medición pedida antes de empezar con los 11 grupos, para decidir el orden en
vez de suponerlo (regla 1). Script: `scripts/medir-tapon-hoja.mjs`.

### T.20.1 Ninguna estructura con hoja valora, en ninguna serie

| | |
|---|---:|
| Estructuras del catálogo | 519 |
| Con pieza de hoja (`HV`/`HH`) | 370 |
| **Que resuelven TODAS sus ranuras, en cualquiera de las 57 series** | **0** |

Cero. No es que valoren pocas: **no valora ninguna**, en ninguna serie. Esto
confirma y generaliza T.19.2, que sólo lo había medido para ELEGANTPVC.

### T.20.2 Los 11 grupos caen todos detrás del tapón

| Serie | grupos 90–99% |
|---|---:|
| GMA350 | 3 |
| ELEGANTPVC | 3 |
| GMC400 | 3 |
| GMA65OPT | 2 |

```
GMA350      GM307     HV  "L"       34/36   (94,4%)
GMA350      GM8428    HH  "(A)/2"   20/22   (90,9%)
GMA350      GM307     HH  "A"       40/42   (95,2%)
ELEGANTPVC  GM8428    HH  "(A)/2"  674/682  (98,8%)
ELEGANTPVC  GM8428    HH  "A"      171/183  (93,4%)
ELEGANTPVC  GM8783M   HV  "L-FI"   220/230  (95,7%)
GMC400      GM451     HH  "(A)/2"  474/498  (95,2%)
GMC400      GM449     HV  "L"      274/278  (98,6%)
GMC400      GM450     HV  "L"      284/292  (97,3%)
GMA65OPT    GM16064L  HH  "A"       46/48   (95,8%)
GMA65OPT    GM16064L  HV  "L-FI"    42/44   (95,5%)
```

Las cuatro series están entre las que no valoran ninguna estructura de hoja
—como todas—. **Grupos que recuperarían cobertura visible hoy: 0.**

El recuento de la copia de la agrupación coincide con el del ETL (11 y 11):
si divergiera, el script avisa.

### T.20.3 El bloqueo es doble, no de una sola clase

Sobre las 21.090 combinaciones serie × estructura-con-hoja bloqueadas:

| Clase de bloqueo | combinaciones |
|---|---:|
| Sólo asociados pendientes (anexo S) | **0** |
| Sólo ranuras de perfil pendientes | **0** |
| **Ambos a la vez** | **21.090** |

Esto **corrige la premisa** con la que se planteó la decisión: no basta con
cerrar las ranuras de perfil. Cerrar cualquiera de los dos frentes por
separado no hace que valore ni una línea; hacen falta los dos. Decirlo ahora
evita prometer un resultado visible que no llegaría.

El frente de perfiles son **178 ranuras distintas** con cola larga. La de más
peso, con diferencia, es `articulo 8 · funcion null · componente 1`, presente
en **47.424** combinaciones serie × estructura — aparece prácticamente en
todas. Las siguientes son ranuras de hoja corrientes (`10 HV`, `15 HH`,
`47 HH`, `226 HV`…). Ninguna de las 178 carece de `componente_disenyo`, así
que todas son en principio resolubles por la cadena del anexo J: lo que falta
es que la cadena las cubra, no que el dato no exista.

### T.20.4 Decisión

**Los 11 grupos esperan.** Su resultado no se puede ver ni medir en la
aplicación hasta que alguna estructura con hoja valore, y ninguna lo hace.
Trabajarlos ahora sería mover un número que nadie puede comprobar — el error
que este proyecto ya cometió al dar por bueno el 99,6% sin ejecutar el motor
de extremo a extremo (anexo T).

**El frente pasa a las ranuras de perfil pendientes**, empezando por la ranura
`8` por volumen. Con la salvedad de T.20.3 anotada: al cerrarlas, seguirá sin
valorar ninguna línea hasta que cierren también los asociados. El criterio
para elegirlas primero no es que desbloqueen solas, sino que tienen mecanismo
demostrado (anexo J, 96,5% contra el oráculo) mientras que los asociados
siguen en 96,3% de precisión con 51/216 líneas exactas (anexo S).

## T.21 Las ranuras pendientes son TRES causas, no 178 casos sueltos

Clasificación por causa de fallo en la cadena del anexo J, con su peso.
Scripts: `scripts/clasificar-ranuras-perfil.mjs` (todas las parejas) y
`scripts/clasificar-ranuras-reales.mjs` (sólo las del histórico).

### T.21.1 Corrección a T.20: el denominador estaba fabricado

T.20 midió sobre **21.090 combinaciones serie × estructura**, que es el
producto cartesiano 57 × 370. **La mayoría de esas parejas no existen**: una
serie de abatibles con una estructura de corredera nunca se configura, y ahí
"sin candidato" es la respuesta correcta, no un fallo.

Es exactamente el error de la regla 8 —medir sobre parejas que uno mismo ha
elegido— por cuarta vez en este proyecto. Repetido sobre las parejas reales:

| | Cartesiano (T.20) | **Real (histórico)** |
|---|---:|---:|
| Parejas serie × estructura | 21.090 | **140** |
| Con pieza de hoja | 21.090 | **87** |
| Ranuras de perfil distintas sin resolver | 178 | **38** |

**El frente es 38 ranuras, no 178.** El "178 con cola larga" de T.20.3 queda
corregido: la cola era el producto cartesiano.

### T.21.2 Peso por causa, sobre las 7.000 apariciones reales

| Causa | líneas | % |
|---|---:|---:|
| **E. sin candidato en la cadena** | 5.136 | 73,4% |
| **B. no toca a la serie por diseño** (cristal) | 1.864 | 26,6% |
| A. sin `componente_disenyo` | 0 | 0% |
| C. sólo existe la variante `.1` | 0 | 0% |

Y la causa E se descompone en familias limpias, no en casos sueltos:

| Familia dentro de E | componentes | líneas | % del total |
|---|---|---:|---:|
| **Oscilobatiente** | `OBC` `OBM` `OBCR` `OBP` `OBPH` | 2.959 | **42,3%** |
| **Correderas** | `222` `224` `226` `228` `22` | 1.886 | **26,9%** |
| Kits de corredera/elevable | `EKCC` `EKEF` `EKEE` | 135 | 1,9% |
| Practicable pasiva y compás | `PRC` `PRPV` `PRPH` | 92 | 1,3% |
| Elevables | `223` `225` `227` `229` | 36 | 0,5% |
| Junquillos curvos, marcos 3 carriles, sueltos | varios | 28 | 0,4% |

**Tres causas concentran el 95,8%**: cristal (26,6%) + oscilobatiente (42,3%)
+ correderas (26,9%) = 6.709 de 7.000.

### T.21.3 `funcion null` no es una clase: la clase es el CRISTAL

La ranura 8 (`(**CRISTAL GENERICO**)`) tiene `funcion` null, pero lo que la
define no es eso: es su `componente_disenyo = 1`. **El paso 4 del anexo J ya
dice que el componente 1 es acristalamiento y NO resuelve por serie por
diseño** — lo elige el usuario, y el acristalamiento ya está implementado por
otra vía (anexos L, M, N, Q).

Es decir: **`acciones.ts` está contando como "ranura genérica que la serie no
resuelve" una ranura que la serie nunca tuvo que resolver.** Eso mete un
`problema` en toda línea con cristal y la deja sin valorar. No es una ranura
pendiente: es una clasificación equivocada por nuestra parte.

Peso real de arreglarlo, medido: de las 87 parejas con hoja, **7 están
bloqueadas SÓLO por el cristal** (12 líneas del histórico). Las otras 80
tienen además alguna ranura de causa E. Así que corregirlo es necesario y
barato, pero **por sí solo desbloquea 7 parejas, no el sistema**.

### T.21.4 Decisión: se implementa por causa

La clasificación demuestra que no son casos sueltos. Orden propuesto, cada uno
validado contra el oráculo como en el anexo J —no contra la intuición—:

1. **Cristal (26,6%)**: dejar de contar el componente 1 como ranura sin
   resolver. Es corregir un error propio, no descubrir un mecanismo.
2. **Oscilobatiente (42,3%)**: `OBC`, `OBM`, `OBCR`, `OBP`, `OBPH` son
   códigos alfanuméricos, y el anexo S.2 ya midió que **50 de los 54 valores
   de `ComponenteAsoc` son `DisComponente`**, citando `OBC` y `OBCR` entre
   ellos. Hipótesis a medir antes de construir: **estas ranuras resuelven por
   `ConjuntosAsoc`, no por `ConjuntosLin`**. Si se confirma, un solo mecanismo
   cubre también `PRC`/`PRPV`/`PRPH` (43,6% juntos).
3. **Correderas (26,9%)**: `222`–`229` son numéricos y simplemente no están en
   la cadena de la serie configurada. Hipótesis a medir: la resolución pasa por
   otro conjunto (delegación de corredera) o por `ConfigSeriesAsoc` vía
   `TipoHoja`. Es el frente que `ENTREGA.md` ya daba por abierto.

**Lo que NO se hace**: ir ranura a ranura. La cola —elevables, kits,
junquillos curvos, marcos de 3 carriles— suma el 4,2% y son 20 ranuras; se
tratan al final o se quedan fuera avisando, que es el comportamiento correcto.

**Recordatorio de T.20.3, que sigue en pie**: ninguna de estas tres cierra por
sí sola una línea, porque toda pareja con hoja tiene además asociados
pendientes. El valor de hacerlas es que son el prerrequisito con mecanismo
demostrable; la línea valorada llega cuando cierren también los asociados.

## T.23 Oscilobatiente: la hipótesis de S.2 queda REFUTADA (y aparece otra)

Medición pura, sin implementar nada. Script `scripts/medir-oscilobatiente.mjs`,
contrastado contra el oráculo con enlace exacto por `VDatosLinDetDis.DisIdIt`
—nunca por proximidad de medida—. **5.501 piezas reales.**

### T.23.1 Las ranuras SÍ están en ConjuntosAsoc… y da igual

| Ranura | filas en `ConjuntosAsoc` | conjuntos | artículos distintos |
|---|---:|---:|---:|
| `OBC` | 474 | 34 | 28 |
| `OBCR` | 429 | 34 | 24 |
| `OBP` | 249 | 17 | 20 |
| `OBM` | 166 | 34 | 11 |
| `OBPH` | 48 | 6 | 5 |
| `PRC` | 84 | 14 | 5 |
| `PRPV` / `PRPH` | **0** | 0 | 0 |

Estar, están (salvo `PRPV`/`PRPH`). Pero el contraste con el oráculo:

| | piezas | % |
|---|---:|---:|
| candidato único y acierta | 0 | 0,0% |
| candidato único y falla | 0 | 0,0% |
| varios candidatos | 5.209 | 94,7% |
| sin candidato | 292 | 5,3% |

Y el dato que cierra la puerta: **el perfil real está entre los candidatos de
`ConjuntosAsoc` en 0 de los 5.209 casos ambiguos.** Cero. No es que falten
condiciones que afinen la elección: **el artículo correcto no está en la lista**,
y ninguna condición lo va a meter.

**Hipótesis de T.21.4 punto 2: REFUTADA.** Tiene sentido a posteriori —
`ConjuntosAsoc` da el herraje (`OBC` = compás, `OBM` = mecanismo, `OBCR` =
cremona), mientras que la pieza que falta es el **perfil de hoja** que lo
lleva. S.2 tenía razón en que esos códigos son `DisComponente`; la
equivocación fue mía al deducir que por eso resolvían por esa tabla.

### T.23.2 Dónde sí está: en ConjuntosLin, bajo el componente de hoja normal

El perfil real está en `ConjuntosLin` dentro de la cadena de la serie en
**5.501 de 5.501** casos.

Ese test sólo demuestra **contención**, no correspondencia: busca cualquier
componente cuyo artículo coincida y se queda con el primero, así que con
varios candidatos el que sale es arbitrario. Sería fabricar el emparejamiento
y medir sobre él (regla 8). El test determinista —fijar el componente
candidato ANTES de mirar— da:

| Ranura | piezas | acierto con comp. `25`/`26` | con `29` |
|---|---:|---:|---:|
| `OBCR` | 1.310 | **99,2%** | — |
| `OBP` | 800 | **99,5%** | — |
| `OBC` | 1.965 | 66,2% | 33,3% |
| `OBPH` | 1.200 | 66,3% | 33,3% |
| `PRPV` | 22 | 63,6% | — |
| `PRPH` | 33 | 42,4% | 33,3% |
| `PRC` | 171 | 24,6% (`25P` 33,9%) | 33,3% |

Lecturas, con cuidado:

- `25` y `26` dan **exactamente el mismo porcentaje** en todas: en estas series
  ambos componentes resuelven al mismo artículo, así que **este test no los
  distingue**. No se puede concluir cuál de los dos es la clave.
- `OBCR` y `OBP` quedan prácticamente explicados por el componente de hoja.
- `OBC` y `OBPH` se parten limpiamente: 66% + 33% ≈ 99,5%. Hay **una segunda
  dimensión** que decide entre hoja (`25`) y vierteaguas (`29`) — coherente
  con que la pieza baja de una hoja sea un vierteaguas.
- La familia practicable (`PRC`, `PRPV`, `PRPH`) **no** encaja aquí: es otro
  mecanismo, y con 226 piezas es el 1,3% del frente. No merece esfuerzo ahora.

### T.23.3 Qué NO se ha hecho, y por qué

**No se ha implementado nada.** Lo medido es prometedor pero no es una regla:
falta separar `25` de `26` con un test que los distinga, e identificar la
segunda dimensión de `OBC`/`OBPH`. Construir con el 66% actual metería la
pieza equivocada en un tercio de los casos, y una hoja mal resuelta es una
pieza mal cortada.

Siguiente medición, cuando se retome: qué distingue el 66% del 33% en `OBC` y
`OBPH` (candidato natural: la posición o el eje de la pieza dentro del
diseño), y un caso donde `25` y `26` resuelvan distinto para poder separarlos.

## T.24 El 66/33 del oscilobatiente NO era una dimensión: era una clave ambigua

Medición pura, sin implementar nada. Script `scripts/medir-oscilobatiente-dim.mjs`
(solo lectura). Se buscaba la "segunda dimensión" que T.23.3 dejó pendiente —qué
separa el 66% del 33% en `OBC`/`OBPH`—. **No existe tal dimensión: el 66/33 es el
propio `DisComponente` de la pieza, y el enlace con el que T.23 lo midió estaba
fabricando el reparto.** Esto corrige T.23 entero (regla 6).

### T.24.1 Ancla de regresión: T.23 se reproduce al decimal

Antes de medir nada nuevo, la versión restringida reproduce el test determinista
de T.23.2 exactamente (si divergiera sería un bug de la restricción, no un
hallazgo):

| Ranura | piezas | acierto comp. 25/26 | T.23.2 esperaba |
|---|---:|---:|---|
| `OBC` | 1.965 | 66,2% | 1.965 / 66,2% ✓ |
| `OBPH` | 1.200 | 66,3% | 1.200 / 66,3% ✓ |
| `OBCR` | 1.310 | 99,2% | 1.310 / 99,2% ✓ |
| `OBP` | 800 | 99,5% | 800 / 99,5% ✓ |

`OBM` no aparece (0 piezas): su clave `HV` pierde siempre el *last-wins*; T.23.2
tampoco lo tabuló.

### T.24.2 La clave del enlace de T.23 es ambigua

T.23 enlaza cada pieza real con la plantilla por `Estructura|Funcion|DisIdIt`,
guardando el último `DisComponente` que casa (*last-wins*). Esa clave **colisiona**:
en una misma estructura, varias filas de plantilla comparten `Funcion` y `DisIdIt`
con `DisComponente` distinto. Ejemplo real: `1O+1F+1O | HH | 6 → {26, 29, OBC}`.
Son 8 claves colisionadas en este frente. Como `26`, `29` y `OBC` son todas
`Funcion=HH`, se aplastan en un único bucket etiquetado arbitrariamente `OBC`.

### T.24.3 La prueba de fuego: el bucket es 25/26/29, no OB*

`VDatosLinDetDis.Componente` da el genérico por pieza **sin ambigüedad** (1:1,
41.610 líneas). El `Componente` REAL de las piezas que la clave mete en cada
bucket OB*:

| Bucket T.23 | Componente real dominante | segundo |
|---|---|---|
| `OBC` (1.965) | `26` = 66,2% | `29` = 33,3% |
| `OBPH` (1.200) | `26` = 66,3% | `29` = 33,3% |
| `OBCR` (1.310) | `25` = 99,2% | — |
| `OBP` (800) | `25` = 99,5% | — |

El "66% resuelve por 25/26 y 33% por 29" es una **tautología**: cada pieza `26`
resuelve a `resol[26]` y cada `29` a `resol[29]` porque *son* esos componentes.
Lo mismo el 99,2%/99,5% de `OBCR`/`OBP`: su bucket es 99% comp. `25` (clave `HV`),
así que ese 99,5% no medía la resolución del oscilobatiente, medía que una pieza
`25` resuelve por `25`. Es el error de la regla 8 —medir sobre un emparejamiento
que uno mismo fabricó— por quinta vez en el proyecto.

### T.24.4 Las ranuras OB* reales son herraje, no perfil

Las líneas hijas cuyo `Componente` REAL es OB* llevan **`Articulo=0` en las 3.022
del oráculo** (0 con perfil):

| Ranura | con perfil | `Articulo=0` |
|---|---:|---:|
| `OBC` | 0 | 724 |
| `OBPH` | 0 | 425 |
| `OBCR` | 0 | 724 |
| `OBP` | 0 | 425 |
| `OBM` | 0 | 724 |

Coherente con T.23.1: `OBC`=compás, `OBM`=mecanismo, `OBCR`=cremona. Son el
**herraje** del oscilobatiente, no la hoja. La pieza de perfil de una hoja
oscilobatiente es el componente de hoja normal (`25` vertical, `26` horizontal,
`29` vierteaguas), que ya resuelve directo por `ConjuntosLin`.

### T.24.5 Conclusión: el punto 1 queda disuelto

No hay segunda dimensión que identificar. **El vierteaguas es el componente `29`;
la hoja, `25`/`26`. Son filas distintas de la plantilla y resuelven directas por
`ConjuntosLin`; no dependen de `OBC`/`OBPH`.** Construir con el 66% habría metido
la pieza equivocada en un tercio de los casos por un artefacto de etiquetado.

**Corrección explícita a T.23** (regla 6): la lectura de T.23.2 —"`OBCR` y `OBP`
quedan prácticamente explicados por el componente de hoja" al 99,5%, y "`OBC`/
`OBPH` se parten 66/33 con una segunda dimensión pendiente"— queda **refutada como
regla**: ambas cifras son tautologías del enlace ambiguo. La contención medida en
T.23.2 (el perfil real está en `ConjuntosLin`) sigue siendo cierta; lo que cae es
la interpretación del reparto y de los porcentajes.

**Queda SÓLO puesto en duda, sin medir** (regla 7): el 42,3% de T.21.2 (frente de
perfil del oscilobatiente) se clasificó por `DisComponente` de plantilla, que
incluye estas ranuras OB* de herraje. Si son herraje, ese 42,3% cuenta ranuras que
no son de perfil. **No lo afirmo: es la siguiente medición (T.25)** —reclasificar
el frente de perfil del oscilobatiente por el `Componente` real de las piezas con
`Articulo≠0` y medir su cobertura real por `ConjuntosLin`—, que también dirá si
`25` y `26` aparecen como componentes reales distintos con artículos distintos en
alguna serie (el dato que faltaba para separar `25` de `26`).

## T.25 El perfil del oscilobatiente YA resuelve; el 42,3% de T.21.2 era herraje

Medición pura, sin implementar nada. Script
`scripts/reclasificar-oscilobatiente-perfil.mjs` (solo lectura). Reclasifica el
frente de perfil del oscilobatiente por el `Componente` REAL de cada pieza
—enlace 1:1 por `VDatosLinDetDis.Componente`, nunca por la clave ambigua que T.24
refutó—. Cierra el punto 1 (oscilobatiente) y el punto 2 (separar `25` de `26`).

### T.25.1 Cuadre contra T.21.2: las 2.959 eran herraje, enteras

Reproducido el frente oscilobatiente de T.21.2 con su mismo método (ranura de
plantilla × `veces` sobre parejas reales): **2.959 líneas ✓ cuadra al número**.
Repartidas por la clase empírica de cada componente (lo que produce en la
instancia):

| Clase | líneas |
|---|---:|
| **herraje (`Articulo=0`)** | **2.959** |
| perfil real (`Articulo≠0`) | 0 |
| no clasificable (nunca en instancia) | 0 |
| **suma** | **2.959** (reparto completo) |

Por componente: `OBC`, `OBM`, `OBCR` ×703 cada uno; `OBP`, `OBPH` ×425. Los cinco
son herraje. **El 42,3% que T.21.2 atribuyó al "perfil oscilobatiente sin
resolver" es en realidad herraje** (compás, mecanismo, cremona), que se resuelve
por la vía de asociados (anexo S), no por la de perfiles. T.21.2 lo contó como
perfil porque clasificaba por `DisComponente` de plantilla sin mirar si la ranura
llegaba a llevar artículo. Corrección explícita (regla 6).

### T.25.2 El perfil REAL de esas estructuras resuelve al 100%, 0 fallos

Universo: las **54 estructuras** cuya plantilla tiene ranura OB*. Sus **12.655
piezas de perfil** (`Articulo≠0`), enlazadas a su componente por
`det.Componente` (0 exclusiones: no se toca la clave colisionada):

| Componente | piezas | acierta | falla | sin candidato |
|---|---:|---:|---:|---:|
| `25` (hoja vertical) | 2.204 | **100%** | 0 | 0 |
| `26` (hoja horizontal) | 2.204 | **100%** | 0 | 0 |
| `29` (vierteaguas) | 1.110 | **100%** | 0 | 0 |
| `12` | 1.312 | 100% | 0 | 0 |
| `10` / `11` | 656 / 656 | 100% | 0 | 0 |
| `B` (funcion `BT`) | 413 | 100% | 0 | 0 |
| `16` | 151 | 100% | 0 | 0 |
| `17M` | 30 | 100% | 0 | 0 |
| `25P` / `26P` | 16 / 16 | 100% | 0 | 0 |
| `13` / `14` | 14 / 14 | 100% | 0 | 0 |
| `18.1` | 4 | 100% | 0 | 0 |

**Fallos totales (esperado ≠ real): 0.** Ni una pieza de perfil de hoja mal
resuelta en 12.655. El vierteaguas `29` —la pieza que T.23.3 creía necesitar una
"segunda dimensión"— resuelve directo al 100%. La distribución completa se
imprime en la salida, con `otro/ninguno = 0` (regla 7).

### T.25.3 Lo `sin candidato` es cristal y juntas, por diseño u otra vía

Tres componentes no resuelven por `ConjuntosLin`, y ninguno es perfil de hoja:

| Componente | piezas | qué es |
|---|---:|---|
| `1` | 1.261 | cristal — no toca a la serie por diseño (T.22) |
| `JH` / `JV` | 1.257 / 1.257 | juntas horizontal/vertical — se valoran por su vía (anexo M) |
| `BI` | 80 | **sin identificar** — anotado, no medido aquí |

`BI` (80 piezas) es el único cabo suelto real del frente de perfil
oscilobatiente. Pequeño, y se mira aparte cuando toque.

### T.25.4 `25` vs `26`: la ambigüedad es inofensiva POR CONSTRUCCIÓN

El punto 2 (separar `25` de `26`), medido en dos niveles:

- **(a) Catálogo:** de las 57 series, **0 resuelven `resol[25]` ≠ `resol[26]`**;
  21 los resuelven al mismo artículo, 36 no tienen uno de los dos. Ningún
  conjunto de la biblioteca los distingue.
- **(b) Histórico:** irrelevante — al no diferir en ninguna serie, no hay nada
  que contrastar (0 series con testigo).

**Cuadrante: INOFENSIVA POR CONSTRUCCIÓN.** `25` y `26` nunca resuelven a
artículos distintos, así que confundirlos no puede cortar una pieza mal. Se dice,
no se supone (regla 7): la clave real entre `25` y `26` es indeterminable con
estos datos, pero da igual porque el resultado es el mismo artículo. El punto 2
queda cerrado sin necesidad de separarlos.

### T.25.5 Consecuencia y decisión abierta

Con T.24 + T.25, el frente oscilobatiente queda así:

- **Perfil de hoja (`25`/`26`/`29` + variantes) y marco/travesaño: resuelto,
  100%, 0 fallos.** No hay nada que implementar aquí: ya lo cubre la cadena del
  anexo J.
- **Herraje (`OBC`/`OBM`/`OBCR`/`OBP`/`OBPH`, las 2.959 de T.21.2): sigue en el
  frente de asociados** (anexo S), que continúa cerrado con aviso.
- **Cristal y juntas: por sus vías** (T.22, anexo M).
- **Cabo suelto: `BI`, 80 piezas sin identificar.**

**El 42,3% de T.21.2 se disuelve como "frente de perfil":** no era perfil sin
resolver, era herraje ya contabilizado en el frente de asociados. El frente de
perfil real del oscilobatiente estaba ya resuelto.

**Decisión que NO se toma aquí** (es del titular, con la salida delante): dar el
perfil oscilobatiente por cerrado y pasar `BI` y el recuento de causas de T.21.2
a revisión, o investigar `BI` antes. Recordatorio de T.20.3: esto no hace valorar
ninguna línea todavía — los asociados siguen abiertos en todas las parejas.

## T.26 La tabla de causas de T.21.2, rehecha: el frente de perfil se disuelve

Medición pura. Script `scripts/recuento-frente-perfil.mjs` (solo lectura). T.24 y
T.25 tumbaron la partida mayor de T.21.2 (el 42,3% "oscilobatiente" era herraje).
Como la tabla de causas es la métrica oficial del proyecto (T.20.4), medir
correderas contra ese denominador sería repetir el error de T.21.1. Se rehace
entera con el enlace limpio. **Este anexo sustituye formalmente la tabla de
T.21.2** (regla 6).

Puente de unidades: las 7.000 "apariciones" de T.21.2 son ranuras de PLANTILLA
(`componente_disenyo`) que fallan la resolución, ponderadas por `veces` (nº de
apariciones de cada pareja serie×estructura). Se reproduce ese bucle exacto y se
reclasifica cada ranura por la clase EMPÍRICA de su componente en la instancia
(`VDatosLinDetDis.Componente`, 1:1). El cuadre a 7.000 se conserva.

### T.26.1 Ancla: la tabla vieja se reproduce al número

| Causa (T.21.2) | líneas | % |
|---|---:|---:|
| E. sin candidato en la cadena | 5.136 | 73,4% |
| B. no toca a la serie (cristal) | 1.864 | 26,6% |
| **total** | **7.000** | ✓ cuadra |

### T.26.2 La tabla nueva (enlace limpio), misma base de 7.000

| Clase real | líneas | % |
|---|---:|---:|
| **herraje (`Articulo=0`) → asociados (anexo S)** | **5.108** | **73,0%** |
| cristal → otra vía (T.22) | 1.864 | 26,6% |
| juntas (`J*`) → otra vía (anexo M) | 16 | 0,2% |
| **PERFIL REAL sin resolver** | **10** | **0,1%** |
| resuelve YA 100% por `ConjuntosLin` | 2 | 0,0% |
| **suma** | **7.000** | ✓ cuadra |

El herraje se descompone en: oscilobatiente `OB*` 2.959 (T.24/T.25), **correderas
`222`–`229` 1.920**, kits `EKCC`/`EKEF`/`EKEE` 135, practicables
`PRC`/`PRPV`/`PRPH` 92, sueltos 2. Todas son ranuras con `Articulo=0` en la
instancia: herraje, no perfil. Las 2 líneas de "resuelve YA 100%" (comp `16`) son
fallos fantasma de T.21.2: la plantilla tenía la ranura para una pareja cuya serie
no la resolvía, pero las piezas reales de ese componente resuelven al 100%.

### T.26.3 Correderas: también herraje, y su perfil resuelve al 100%

Igual que el oscilobatiente: `222`–`229`/`22` son la ranura de **herraje** de la
corredera (`Articulo=0`), no la hoja. Medido el perfil REAL de las estructuras de
corredera con el criterio de T.25 (cobertura por la cadena, enlace limpio):

- comps de hoja `23.2` (898), `22.2` (490, 99,6%), `21.2` (462), `12` (445),
  `11` (223), `10` (222), y variantes menores: **cobertura 100%, 0 fallos**.

**Esto refuta la premisa de T.21.4 punto 3**: las correderas no eran "el siguiente
frente de perfil". Su perfil ya resolvía; lo que T.21.2 contó era su herraje.

### T.26.4 El perfil real sin resolver: 10 líneas + colas declaradas

Lo único que queda como perfil que `ConjuntosLin` no resuelve:

- **10 líneas** en la tabla de 7.000: `12C` ×4, `22` ×2, `11C` ×2, `10C` ×2 —
  variantes curvas (`*C`) y bases sueltas.
- Fuera de esas 7.000, medido sobre la instancia, hay colas `sin candidato`
  (nunca un artículo equivocado, sólo "la serie no lo resuelve"):
  - **`BI`: 158 piezas** de perfil real que no resuelven por `ConjuntosLin`. Es el
    cabo suelto que T.25 dejó anotado (allí 80, aquí 158 en todo el histórico).
    Funcion no confirmada; queda como **cola declarada**, pendiente de identificar.
  - Bases `.0` de doble cristal (`23` ×16, `21` ×8): el histórico es 100% doble
    (`.2`), así que la base rara vez se usa y no está resuelta. Cola.
  - Curvas `10C`/`11C`/`12C`: ~75% de cobertura, el resto `sin candidato`.

**Fallos (artículo esperado ≠ real): 0 en todo el frente.** Nunca se corta una
pieza equivocada; lo que falta, falta con aviso.

### T.26.5 Defecto en `acciones.ts` (informe; el cambio sería T.27)

`acciones.ts:362` clasifica una ranura sin resolver como asociado sólo si
`funcion` empieza por `inf`/`Acc`; el resto va a "ranuras de perfil que la serie
no resuelve". Las ranuras de herraje `OB*` y las correderas `222`–`229` tienen
funcion `HV`/`HH`, así que **hoy se cuentan como perfil** — exactamente el defecto
que T.22 corrigió para el cristal. Consecuencia: el aviso "N ranuras de perfil que
la serie no resuelve" está inflado con herraje que pertenece al frente de
asociados (anexo S).

**Sólo informe en este paso.** El cambio, si se decide, sería un **T.27** análogo
a T.22: reclasificar el herraje (`OB*`, `222`–`229`, kits, practicables) fuera del
bucket de perfil, con verificación antes/después sobre las 140 parejas reales,
alarma si cambia cualquier causa que no deba, y ejecución real en la aplicación
con una línea del histórico. No se toca código aquí.

### T.26.6 Conclusión

El "frente de perfil sin resolver" de T.21 **no existe como tal**: el 99,9% era
herraje (73%), cristal (26,6%) y juntas (0,2%), cada uno con su propia vía. El
perfil real de hoja —oscilobatiente y corredera incluidos— **ya resuelve al 100%,
0 fallos**. Lo que queda es cola: `BI` (158, sin identificar), bases `.0` y curvas
`*C`. Recordatorio de T.20.3: nada de esto valora todavía una línea — el frente
vivo son los asociados (5.108 de 7.000, anexo S) y el cristal por su vía.

## T.27 El herraje sale del bucket de perfil (implementado)

Ejecuta el cambio que T.26.5 dejó como informe. Decisión de arquitectura:
**allowlist de los 51 códigos de herraje, AÑADIDA a la heurística `funcion`
inf/Acc, no en sustitución** (regla aditiva: solo puede mover herraje de
perfil→asociado, nunca al revés, así que es imposible que enmascare un hueco de
perfil real).

### T.27.1 Por qué una allowlist y no una regla estructural

Se midió (`scripts/medir-criterio-herraje.mjs`) qué regla en tiempo de
resolución —solo con datos de plantilla/catálogo, nunca del histórico— separa
herraje de perfil. Verdad de campo: **HERRAJE = `componente_disenyo` cuyas piezas
de instancia son TODAS `Articulo=0` en el oráculo** (51 códigos); **PERFIL =
alguna pieza `Articulo≠0`** (42 códigos). Resultado de las candidatas:

- **`ConjuntosAsoc.ComponenteAsoc`** (candidata A): 11 falsos positivos —marca
  como herraje perfiles evidentes (`10`,`11`,`12`,`B`, hoja/marco)— y 28 falsos
  negativos. **Refutada** (coherente con T.23).
- **Señal estructural de plantilla** (candidata B): `StFabricadoSN`, `AsociadoA`,
  `AsociadoAId`, `NoComputarCosteSN`, `Seccion` son **constantes en herraje Y en
  perfil** (cero poder discriminante); `funcion` HV/HH **solapa** las dos clases;
  y "artículo genérico en plantilla" o "no resuelve por la cadena" clasificarían
  como herraje **cualquier perfil no resuelto** —que es justo el hueco que no se
  debe ocultar (26 falsos positivos)—. **No hay señal estructural limpia.**

Por eso se hardcodea la lista medida, igual que T.22 hardcodeó el cristal `'1'`.
Riesgo asumido y por qué es aceptable: la única forma de fallo de la allowlist es
un código de herraje que exista en catálogo pero no en el histórico → se trataría
como perfil no resuelto → **aviso ruidoso y visible**, nunca un hueco silenciado.
Falla en la dirección segura (regla del proyecto: si falta, que se diga). Lo
contrario —un falso positivo que oculta perfil— es imposible con allowlist.

### T.27.2 La lista (51 códigos)

Correderas `222`–`229`; oscilobatiente `OBC`,`OBCR`,`OBM`,`OBP`,`OBPH`;
proyectante `PRC`,`PRPH`,`PRPV`; eje/kit `EKCC`,`EKEE`†,`EKEF`†; cierres y
mecanismos de hoja `39`,`50`,`51`,`52`,`53`,`55`,`56`,`57`,`58`,`58R`,`59`,`71`,
`130`,`133`,`134`,`EHC`,`EHH`,`EHF`†,`EHFH`†,`EMBF`,`CHC`,`CHH`,`JA`,`JB`,`JD`,
`JI`; y muestra fina †(≤6 piezas en el oráculo, menor confianza pero coherentes
con su familia) `30`,`116`,`135`,`139`,`143`,`51MA`. Nota (corrige el contexto
previo, regla 6): **`22` NO es herraje** —es perfil, 8 piezas `Articulo≠0` en el
oráculo—; sí lo son `222`–`229`. No confundir `22` con `222`.

### T.27.3 Verificación antes/después (`scripts/verificar-t27.mjs`)

Sobre las parejas serie×estructura reales del histórico con pieza de hoja (87
con `HV`/`HH`), reproduciendo el `anotarSinResolver` de `acciones.ts` (incluido
el salto del cristal), ponderado por `veces`:

| bucket | antes | después |
| --- | --- | --- |
| PERFIL | 4.019 | **10** |
| ASOCIADO | 6.047 | **10.056** |
| suma total | 10.066 | 10.066 (conservada) |

**La suma total no cambia: el arreglo solo reetiqueta el aviso, no altera lo que
se valora** (verificado además en `acciones.ts:811-833`: `sinResolver` y
`sinResolverAsoc` entran ambos en `problemas` → la línea queda "sin valorar"
igual; ninguno ramifica otra cosa que el texto del mensaje). Se movieron
perfil→asociado **solo códigos de la lista** (`OB*`, `222`–`229`, `EKCC`, `PR*`,
`JA/JB/JD/JI`, `30`, …); el bucket de perfil baja a **10** ranuras, que son perfil
real sin resolver (cola `BI`/bases `.0`) y siguen —correctamente— en el aviso
ruidoso. **Sin alarma**: ningún `componente_disenyo` fuera de los 51 cambia de
bucket, y no hay ningún movimiento asociado→perfil.

### T.27.4 Estado

`packages/web/.../acciones.ts`: `COMPONENTES_HERRAJE` (51) añadido a
`anotarSinResolver`. Cristal (`'1'`) intacto. Typecheck limpio; tests 25/25.
**Pendiente de ojo**: la ejecución en vivo en la app no se hizo porque produciría
una escritura (crear/editar una línea de presupuesto oscilobatiente) contra la
base compartida en solo lectura; la verificación determinista sobre el histórico
—mismo resolvedor, misma lógica de enrutado— cubre el comportamiento. Anotado, no
inventado.

## T.5 Qué hacer, en orden

1. **Medir de dónde sale el rebaje de hoja.** La hipótesis con fundamento
   es que es un descuento del PERFIL resuelto (solape marco-hoja), no de
   la serie. Hay que cruzarlo con la resolución genérico→perfil ya
   implementada antes de tocar `calcular.ts`.
2. **Revisar el filtro de rango de `calcular.ts:94`**, que compara
   `MedidaMinima/Maxima` contra `Math.max(ancho, alto)`. S.6 demostró que
   esa referencia es incorrecta para los asociados —la medida es la de la
   fórmula de la propia ranura—. Para perfiles no se ha medido todavía si
   también lo es. **Anotado, sin tocar.**
3. Sólo después, las reglas ya validadas que siguen sin implementar: la
   junta perimetral de hoja (S.7.2, delta 0) y la goma GM4090 (S.9.7,
   delta 0 contra el hueco).

**Mientras tanto, el aviso de "sin valorar" cubre este hueco**: una línea
con hoja cuyo despiece no se puede garantizar no debe producir un importe
que parezca bueno.

# ANEXO S — Asociados: el mecanismo es resolución de ranuras (19/07/2026)

Continúa R. Tres descubrimientos que cambian el modelo, y una medición que
acota lo que falta.

## S.1 Las filas de ConjuntosAsoc son ACUMULATIVAS, no excluyentes

Inspección de los cerraderos de `HU531` (ranura 56): cada tramo de altura de
cremona lleva su fila de cremona (cantidad 1) **y** una fila de CERRADERO
ESTANDAR con cantidad 0, 1, 2 o 3 según el tramo. La opción de hoja pasiva
(926/927) aporta filas con **cantidad negativa** que restan los cerraderos
de la cremona. La cantidad final de un artículo es la SUMA de las filas que
pasan sus condiciones. Esto explica por qué los cerraderos no encajaban como
"elección por tramo" en R.4.

## S.2 ComponenteAsoc es una RANURA del despiece — el mismo mecanismo que los perfiles

Las instancias de `EstructurasArticulos` conservan las ranuras genéricas de
asociados con su `DisComponente`: `105 infHAesc → 58` (escuadras),
`85/89 infHAB → 52/56` (herraje abatible), `156 infZApert → 71` (zona de
apertura), `148 infMOmof → 39` (mano de obra), `310 AccDisMI → 130`.

**50 de los 54 valores de `ComponenteAsoc` son exactamente esos
`DisComponente`** (incluidos `OBC`, `OBCR`, `EHC`, `PRC`…, que parecían
códigos especiales). El modelo completo:

1. La plantilla genera ranuras de asociado (funciones `inf*`) igual que
   genera perfiles.
2. `ConjuntosAsoc` resuelve cada ranura presente con condiciones: `nOpcion`
   marcada, medida de la HOJA en rango, `ArticuloAsoc` presente.
3. La cantidad es la suma de las filas que pasan (S.1).

Solo `!`, `A`, `L` y `59R` no son ranuras:

- **`!`** ancla por categoría de elemento en texto (`AsociadoA`): 32 valores
  ("HOJAS", "MARCOS INFERIORES", "TRAVESAÑOS PEQUEÑOS", "BISAGRA
  PRACTICABLE"…). La cantidad depende del nº de elementos de esa categoría;
  algunos encadenan sobre otros asociados.
- **`A`/`L`** = una por ancho / por alto (patillas de anclaje GM1161).

## S.3 Predictor v2 medido (scripts/medir-seleccion-v2.mjs)

Sobre las 146 líneas del oráculo con opciones + instancia + asociados:
filtro de ranura presente + `nOpcion` + eje aprendido por grupo (8 de 27
grupos alcanzan ≥90% con ≥5 muestras):

| Métrica | v1 (sin ranuras) | v2 (con ranuras) |
|---|---:|---:|
| Precisión | 56,2% | 61,5% |
| Cobertura | 99,5% | 82,2% |
| Líneas exactas | 0 | 0 |

La cobertura que pierde v2 es EXACTAMENTE los mecanismos aún no modelados:
`GM1161` (patillas `A`/`L`, en las 146 líneas), `GM4337` (salida de agua,
`!` MARCOS INFERIORES), juntas por `!` HOJAS, y `ConfigSeriesAsoc` (por
`TipoHoja`), que todavía no entra en el predictor.

**Decisión (regla 3): los asociados siguen sin valorar.** El mecanismo está
identificado pero la selección no reproduce ninguna línea exacta todavía.

## S.4 Predictor v3: mecanismos completos, dos políticas (19/07/2026)

`scripts/medir-seleccion-v3.mjs` añade sobre v2: oráculo ampliado a
VALB+VFAC (216 líneas con opciones+instancia+asociados), patillas `A`/`L`
por `UnidadesMin` (verificado antes: 8 por línea en 1.150 casos históricos,
4 en series con una fila por lado), y multiplicador de las categorías `!`
APRENDIDO por consistencia (5 de 14 categorías alcanzan ≥90%: zócalos,
batientes de apertura interior…).

| Política con rangos sin eje aprendido | Precisión | Cobertura | Exactas (artículos) |
|---|---:|---:|---:|
| Aceptarlos | 64,2% | 92,4% | 5/216 |
| Excluirlos | **94,1%** | 75,9% | 5/216 |

Diagnóstico ya preciso de lo que impide cerrar:

- **El eje de los rangos debe anclarse a la HOJA DE LA RANURA**, no al
  máximo de la línea: con varias hojas distintas la consistencia no llega
  al 90% y solo 11 de 27 grupos aprenden eje. La instancia trae
  `DisIdHoja` por ranura; falta unirla con la medida real de esa hoja
  (las hijas de `VPresupuestosLin` tienen el corte pero no el `DisIdHoja`).
  Agrupar por ranura ignorando el conjunto se probó y es peor (2/10):
  cada serie tiene fórmulas de hoja distintas.
- **Las juntas perimetrales (GM4055/GM5085, el mayor FN) no son un fallo
  de selección**: su cantidad va en METROS. Pertenecen a la fase de
  longitudes (`FormulaL`), como los junquillos.
- Bisagras de rebajo izquierda/derecha (FP bajo la política estricta)
  necesitan la MANO de la línea (`ManoID`), aún sin modelar.

## S.6 Predictor v4: la medida es la fórmula de la PROPIA RANURA (19/07/2026)

Resuelve el punto 1 de S.5 sin aprender nada. Dos hechos verificados:

1. **Cada ranura de la plantilla lleva su propia fórmula de medida**
   (`FormulaLargoCorte`/`FormulaLargo`): la ranura 56 (cremona) mide
   `L-FS-FI` (altura de hoja), `OBC` mide `(A)/2` (ancho de hoja), `71`
   (zona apertura) `A-FI-FD`… `MedidaMin/Max` se compara contra ESA
   medida, evaluada con las cotas reales de la línea. Determinista;
   ningún eje que aprender. (Correlar instancia ↔ hijas por orden se
   probó antes y es imposible: 0 de 279 líneas coinciden en nº de filas.)
2. **La mano por fila (`ManoID` = `I`/`D`, 1.920 filas) se filtra contra
   la mano REAL de cada aparición** (`DisManoID` de la instancia — el
   usuario puede invertir la de la plantilla; usar la plantilla invierte
   izquierda por derecha).

La ranura aparece una vez por elemento (una por hoja, una por zona), así
que la cantidad natural es filas × apariciones que pasan el rango y la mano.

| Predictor (216 líneas) | Precisión | Cobertura |
|---|---:|---:|
| v3 aceptar / excluir | 64,2% / 94,1% | 92,4% / 75,9% |
| v4 fórmula de ranura | 90,2% | 88,3% |
| v4 + mano real | **94,1%** | **88,3%** |

Los fallos restantes ya no son de mecanismo desconocido: juntas
perimetrales en METROS (171 casos, fase `FormulaL`), tacos de pilastra
(categorías `!` sin multiplicador fiable), la goma por grosor de vidrio, y
solapes de tramos con fórmulas distintas entre apariciones de una misma
ranura.

## S.8 Predictor v5: categorías '!' con rasgos de la instancia (19/07/2026)

`scripts/medir-seleccion-v5.mjs` amplía el aprendizaje de multiplicadores
de las categorías `!` con rasgos derivados de la instancia — recuentos por
FUNCIÓN (`fn:HV` = piezas de perfil de hoja…) y por GENÉRICO (`gen:97` =
travesaños grandes…) — más una constante `k` aprendida como moda de
`real/(base×rasgo)`. Con eso las juntas perimetrales (S.7.2) se aprenden
solas ("una por pieza de hoja") sin codificar nada a mano.

| Predictor (216 líneas) | Precisión | Cobertura | Exactas (artículos) |
|---|---:|---:|---:|
| v4 | 94,1% | 88,3% | 5/216 |
| v5 (rasgos + k) | 94,5% | 92,6% | 34/216 |
| **v5 + `ArticuloAsoc`** | **96,3%** | **92,6%** | **51/216** |

Reincorporar el filtro `ArticuloAsoc` (condición de perfil presente, que
v1 ya tenía y se perdió al reescribir) eliminó de golpe los falsos
positivos de escuadras y del kit de acristalamiento GM4353.

Pendiente que concentra el resto (depurado con `DEPURAR_ART=GM5320`):

- **Tramos de cremona/tirante/pletina**: tres causas medidas — estructuras
  cuya plantilla no trae fórmula para la ranura (`medidas=` vacío, parte
  de las 454 filas descartadas), cotas de instancia recuperadas
  incompletas que desvían la medida lo justo para caer en el tramo vecino
  (evaluado 800 con rango 546–795 y el artículo real dentro), y líneas
  con dos ranuras en rango a la vez. Es afinado del contexto de cotas,
  no mecanismo nuevo.
- **Tacos de pilastra**: regla dominante "2 por travesaño" (~83%); las
  excepciones parecen ancladas a la PILASTRA, no al travesaño.
- **Goma GM4090** (`A`/`L`): unidades con largo aparte, sin emparejar.

## S.9 Los tres frentes de S.8, medidos (19/07/2026)

Se atacaron en orden. Uno se resuelve, otro cambia de causa y el primero
**queda refutado**: su premisa era falsa. Las correcciones van explícitas.

### S.9.1 Tramos de cremona/pletina — la premisa de S.8 era FALSA

S.8 afirmaba: *"la fórmula genérica `(A)/2` no vale; hay que evaluar el
ancho REAL de cada hoja con el árbol de `EstructurasDiseño`"*. **Es
incorrecto, y construir sobre ello habría sido trabajo perdido.**

`EstructurasArticulos` guarda la fórmula por partida doble:
`DisFRefLargo` la expresa contra un ítem referenciado (`REF` = medida de
`DisIdRefLargo`: `REF`, `(REF)/2`, `REF-FS-FI`…) y `FormulaLargo` /
`FormulaLargoCorte` es **esa misma fórmula ya aplanada** contra las cotas
de la estructura. El aplanado no es genérico: las estructuras de hojas
desiguales traen `(A-TR)/2`, `(A-HO)/2`, `A-FZ`… es decir, ya resuelven la
cadena `REF`. Evaluar `FormulaLargo` —lo que v5 hacía— **ya es** evaluar
el ancho real de cada hoja. No hay ancho de hoja que recuperar.

Medición sobre las 364 familias de tramos
(`scripts/medir-desvio-tramos.mjs`; una familia son las filas de
`ConjuntosAsoc` que sólo difieren en `MedidaMin/Max`, y el artículo que el
oráculo trae declara el intervalo en que cayó la medida verdadera):

| De 112 casos familia × línea | |
|---|---:|
| la medida evaluada YA cae en el tramo correcto | 69 |
| cae fuera del tramo correcto | 24 |
| la plantilla no trae fórmula para la ranura | 19 |

Y las otras dos causas que S.8 daba por medidas **tampoco se sostienen**:

- *"cotas de instancia recuperadas incompletas"*: **0 de los 24 fallos**
  usan una cota rellenada con el valor por defecto de la plantilla. El
  contexto está completo; la desviación no viene de ahí.
- *"desvío que cae en el tramo vecino"*: el desvío **no es constante**
  (8 valores distintos en 10 observaciones de `HU529|OBCR`), así que no
  hay ajuste aprendible con los umbrales de siempre.

Se probó además sustituir la fórmula por los **cortes reales** de la línea
—la vía que resolvió la junta perimetral (S.7.2)—. Aparente éxito
(`corte:cualquiera` acierta 91/93 = 97,8%) que **es un artefacto**: con
muchos cortes por línea, alguno cae siempre dentro. Exigiendo además que
la fuente **excluya** los demás tramos de la familia:

| Fuente de medida | acierta | y descarta los demás tramos |
|---|---:|---:|
| `corte:cualquiera` | 97,8% | **5,4%** |
| `corte:HV` | 62,4% | 48,4% |
| **fórmula de la ranura** | **74,2%** | 47,3% |
| `corte:HH` | 39,8% | 37,6% |

Ninguna fuente alternativa mejora a la fórmula. **Conclusión honesta: la
fórmula de la ranura es la medida correcta y ya está bien implementada.**
Lo que queda son dos colas distintas, y no sé explicar la primera:

1. **24 casos sin mecanismo identificado**: la medida evaluada cae fuera
   del tramo que el oráculo eligió, sin desvío constante, sin cotas por
   defecto y sin mejor fuente. Una misma medida evaluada (810) aparece con
   dos tramos reales distintos (`GM5333`[636-795] y `GM5347`[996-1995]),
   así que la medida evaluada **no es** el discriminante en estos casos.
   Falta una condición que no está identificada. **No se construye nada
   encima hasta saber cuál es.**
2. **19 casos (y las 454 filas descartadas) sin fórmula en la plantilla**:
   pérdida de cobertura pura, no error de selección.

### S.9.2 Tacos de pilastra — RESUELTO, 76/76

S.8 conjeturaba que las excepciones estaban *"ancladas a la PILASTRA"*.
**No hay tal ancla**: `AsociadoA` no contiene ninguna categoría con
"PILASTRA" (se listaron las 100 existentes). Los tres tacos se declaran
idénticos y el ancla está escrita en los datos:

```
GM4870 / GM5102 / GM4726   comp='!'   Cantidad=2   AsociadoA='TRAVESAÑOS PEQUEÑOS'
```

Lo que faltaba era contar bien esa categoría. Medido sobre las 76
apariciones del oráculo (`scripts/medir-tacos-goma.mjs`):

| Rasgo de la instancia | acierta `real = 2 × rasgo` |
|---|---:|
| `gen:11` (genérico travesaño pequeño) | 66/76 (86,8%) |
| `fn:TM` | 54/76 (71,1%) |
| **`gen:11` ó `fn:TH`** (rasgo combinado) | **76/76 (100%)** |

Los 10 casos que `gen:11` no explica tienen `gen:11 = 0` y `fn:TH` = 2 ó 3,
y `2 × fn:TH` da exactamente el real: son estructuras que no usan el
genérico 11 y montan el travesaño pequeño como travesaño horizontal.
El rasgo `trvPeq` está incorporado a `scripts/medir-seleccion-v5.mjs` y lo
aprende el mecanismo de siempre, sin codificar el multiplicador a mano.
La regla dominante *"2 por travesaño (~83%)"* de S.8 queda sustituida.

### S.9.3 Goma GM4090 — la causa NO son los largos

S.8 pedía *"emparejar sus largos como se hizo con las juntas"*. La
medición dice que el problema es anterior y de otra naturaleza:

- `GM4090` se declara en **un solo conjunto: `GMBASTIDOR`**, con dos filas
  (`comp='A'` cdad 2, `comp='L'` cdad 2).
- En **0 de las 18 líneas** en que la goma es real aparece `GMBASTIDOR`
  entre las opciones de la línea.

Es decir: la goma **no se selecciona por el mecanismo de `ConjuntosAsoc`
de la línea**. Llega desde un bastidor que es **subestructura anidada**
(`EstructurasArticulos.Subestructura`), con su propio conjunto y sus
propios asociados. Emparejar largos no habría arreglado nada porque el
artículo no llega siquiera a proponerse.

Se descartó también la lectura fácil: las cantidades son múltiplos de 4
(4×10, 8×5, 16×3) y las dos filas suman 4 por hueco, pero la hipótesis
`cantidad = 4 × nº de vidrios` sólo acierta **5/18 (27,8%)**. No se
codifica.

**Pendiente**: identificar por dónde llega. Ver S.9.5, que corrige la
conjetura de este apartado. Mientras tanto la goma sigue siendo falso
negativo declarado.

### S.9.5 Goma GM4090: la subestructura anidada tampoco (corrige S.9.3)

**Corrección explícita**: S.9.3 conjeturaba que la goma llegaba desde *"un
bastidor que es subestructura anidada
(`EstructurasArticulos.Subestructura`)"*. **Es falso.** La columna
`Subestructura` está **vacía en las 15.263 filas de plantilla** (0 filas
con valor). No hay anidamiento de estructuras en estos datos. Era una
conjetura escrita sin comprobar, y se comprobó antes de codificar nada.

Lo que sí establecen los datos (`scripts/medir-goma-vidrio.mjs`, 50 líneas
con goma y 158 filas):

- La goma sale en **parejas por vidrio**: 1 vidrio → 2 filas (15 líneas de
  15), 2 vidrios → 4 filas (13 de 20). Cada fila lleva `Cdad=2`
  (152 de 158 filas). Es exactamente lo que declara `GMBASTIDOR`:
  `comp='A'` cdad 2 (ANCHO) + `comp='L'` cdad 2 (ALTO) → **4 gomas por
  hueco acristalado, dos por cada eje**.
- Los largos emparejan con las dimensiones del vidrio: 156 de 158 filas
  tienen una dimensión de vidrio a menos de 200 mm.

**Conclusión: GM4090 no pertenece a la selección de asociados de la línea.
Es un artículo de la fase de ACRISTALAMIENTO, por hueco, como el junquillo
y la junta por grosor de vidrio (anexo M).** Por eso su conjunto nunca
aparece entre las opciones de herraje: no se selecciona ahí.

El ajuste todavía **no alcanza los umbrales** y no se codifica. Midiendo
sólo las 15 líneas inequívocas (un vidrio y dos filas, sin emparejamiento
que adivinar — el error de medición que S.7.2 documenta):

| (serie \| eje) | delta | muestras |
|---|---:|---:|
| `GMA350` mayor / menor | **64,4** | 4/4 ✔ |
| `GMA60RL` | 68 | 3/4 ✘ |
| `GMA75C16` | 76 | 3/6 ✘ |
| `ELEGANTPVC` | 255,8 | 1/1 ✘ |

Sólo 2 de 8 reglas estables (8/30 filas). El delta es el mismo en ambos
ejes dentro de cada serie —dato consistente— y ronda 64-76 mm, pero con
15 líneas no hay muestra suficiente. **Anotado como no resuelto**: hace
falta ampliar el oráculo de goma o resolver el emparejamiento de las 35
líneas ambiguas antes de fijar ningún valor.

**Ampliación medida (y negativa)**: se resolvió el emparejamiento de forma
global —cada vidrio aporta sus dos dimensiones, y con coste
`|largo − dimensión|` ordenar ambas listas y emparejar por rango *es* el
emparejamiento óptimo, sin nada que adivinar—. La muestra sube de 15 a 31
líneas y de 30 a 100 filas, pero la consistencia **empeora**: de 2 reglas
estables de 8 a **1 de 8**. Separado por eje, el patrón es claro y sigue
sin bastar:

| Serie | eje L | eje A |
|---|---:|---:|
| `GMA350` | 64,4 — 8/8 ✔ | 51,8 — 4/8 |
| `GMA60RL` | 68 — 15/18 | 54 — 12/18 |
| `GMA75C16` | 76 — 11/14 | 61 — 8/14 |

El eje L ronda el 79-100% y el eje A el 57-67%, con deltas distintos por
eje (~64-76 frente a ~51-61). Dos estrategias de emparejamiento probadas y
ninguna alcanza los umbrales contra el vidrio. **Resuelto en S.9.7: el
vidrio era la referencia equivocada.**

### S.9.7 La goma copia el HUECO con delta 0 (resuelve el ajuste de S.9.5)

La hipótesis física anotada en S.9.5 se midió
(`scripts/medir-goma-hueco.mjs`) y **es correcta**. La goma no sigue la
dimensión del vidrio sino la del HUECO: las ranuras de hoja
(`DisComponente='1'`) con sus `FormulaLargo`/`FormulaAncho` evaluadas con
las cotas reales de la línea — la maquinaria de
`packages/etl/src/medir-mixtas.ts`. El vidrio es menor que el hueco por el
alojamiento (anexo Q), y ese alojamiento es justo lo que ensuciaba el
delta.

Medido sobre las mismas 31 líneas emparejables y las mismas 100 filas, con
el mismo emparejamiento por rango, cambiando **sólo** la referencia:

| Referencia | reglas estables | filas cubiertas |
|---|---:|---:|
| VIDRIO (S.9.5) | 1/8 | 8/100 |
| **HUECO (módulo)** | **6/8** | **80/100** |

Y el delta no es una constante ajustada: **es 0 en las ocho reglas**, las
seis estables y las dos que no lo son.

| (serie \| eje) | delta | muestras |
|---|---:|---:|
| `ELEGANTPVC` L / A | 0 | 10/10 ✔ / 10/10 ✔ |
| `GMA60RL` L / A | 0 | 18/18 ✔ / 18/18 ✔ |
| `GMA75C16` L / A | 0 | 12/12 ✔ / 12/12 ✔ |
| `GMA350` L / A | 0 | 5/10 ✘ / 4/10 ✘ |

**Es el mismo resultado que la junta perimetral de hoja (S.7.2): delta 0,
la pieza copia exactamente la medida del elemento que bordea.** No hay
constante que inventar, que es la señal de que la referencia es la buena.

**Excepción anotada, sin resolver**: la serie `GMA350` (20 de las 100
filas) sólo alcanza 4-5 de 10 aun con delta 0 como moda. No se codifica
regla para esa serie; el resto queda cubierto con los umbrales de siempre.
La causa no está medida — la sospecha razonable es un desajuste de
recuento entre módulos y filas de goma en esa serie, pero **no se ha
comprobado y no se afirma**.

### S.9.6 Las categorías '!' pendientes: cuatro de siete son SIEMPRE cero

`scripts/medir-categorias-bang.mjs` repite para las 13 categorías el
análisis que resolvió los tacos, con un repertorio de rasgos ampliado
(`perfilHoja`, `perfilMarco`, `travesano`, `ranurasInf`, `fg:función:genérico`).
Ninguno de los rasgos nuevos gana en ninguna categoría: las 6 que aprenden
lo hacen con `trvPeq`, `dis:17M`, `dis:51`, `dis:222`, `dis:B` y `const1`.
**El repertorio ampliado no aporta nada y no se incorpora.**

Lo que sí aporta es el diagnóstico de las 7 pendientes, que **corrige el
punto 6 de S.7** (*"las 9 categorías `!` aún sin multiplicador fiable —
más muestras o mapeo manual verificado"*). No son 9 sino 7, y no les falta
muestra: cuatro de ellas **valen cero siempre**.

| Categoría pendiente | n | observaciones con `real = 0` |
|---|---:|---:|
| `ZOCALO HORIZONTAL` | 162 | **162 de 162** |
| `TRAVESAÑOS ZOCALO` | 18 | **18 de 18** |
| `FIJOS INDEPENDIENTES (TODOS)` | 4 | **4 de 4** |
| `BISAGRA PRACTICABLE` | 162 | 134 de 162 |
| `MARCOS SUPERIORES` | 3 | 0 de 3 |
| `TRAVESAÑOS (TODOS)` | 2 | 0 de 2 |
| `MARCOS (TODOS)` | 1 | 0 de 1 |

El aprendizaje exige `k > 0`, así que **no puede expresar "no emitir"** y
esas categorías nunca aprenderán por construcción. No es un fallo: v5 las
salta (`if (!regla) continue`) y el resultado coincide con el oráculo. Pero
la razón es otra de la que S.7 daba, y conviene no seguir buscando muestras
que no arreglarían nada.

De las tres restantes, `MARCOS SUPERIORES`, `TRAVESAÑOS (TODOS)` y
`MARCOS (TODOS)` tienen n = 3, 2 y 1: por debajo del umbral de ≥5
observaciones. No se tocan.

**El único frente con señal real es `BISAGRA PRACTICABLE`** (n=162,
artículos `GM5002` y `GM4846` — este último es el 4.º falso negativo más
frecuente, 16 apariciones). Tiene 28 observaciones con `real > 0` y su
mejor rasgo, `dis:PRPV × 2`, llega a **136/162 (84,0%)**: acierta los ceros
pero falla la cantidad cuando la bisagra sí va. Queda **anotado como no
resuelto**; no se codifica un 84%.

### S.9.8 `BISAGRA PRACTICABLE`: el contexto basta, el modelo no

Único frente `!` con señal según S.9.6. Se atacó con la hipótesis de S.2
—*"algunas categorías `!` encadenan sobre otros asociados"*— añadiendo
rasgos `asoc:<código>` = cantidad real de cada otro asociado de la línea
(`scripts/medir-bisagra-encadenada.mjs`). Es un diagnóstico, no un
predictor: usa el oráculo como entrada.

**No cierra.** Los 162 casos son `GM5002` (CERRADERO COMPLEMENTARIO) y
`GM4846` (PUNTO CIERRE COMPLEMENT.), 81 cada uno, con 26 de real > 0. Y
todos los candidatos —de instancia y encadenados, con `base` y sin ella—
se detienen en **exactamente 136/162 (84,0%)**, que es el número de
observaciones con `real = 0`:

> **Ningún rasgo explica ni una sola de las 26 observaciones no nulas.**
> El 84% es enteramente el mérito de acertar los ceros.

Se probó también quitar `base` del modelo, porque la columna `Cantidad`
vale 1, 5 ó 10 mientras el real vale 1, 2 ó 3 —no se comporta como
multiplicador—. Mismo techo: 136/162.

**Pero el problema NO es de datos.** Prueba de determinismo: se agruparon
las 162 observaciones por (artículo, `base`, todos los rasgos) y se
comprobó si algún grupo de contexto idéntico tiene cantidades distintas.

| Grupos de contexto idéntico | 94 |
|---|---:|
| Grupos con cantidades reales DISTINTAS | **0** |
| Techo teórico con estas entradas | **162/162 (100%)** |

**Corrección de una lectura precipitada**: al ver dos líneas con las
mismas bisagras (`GM4390×2`, `base=5`) y reales distintos (2 y 3) se
concluyó de entrada que faltaba un dato en los CSV y que el frente no era
cerrable. **Es falso**: esas líneas difieren en otros rasgos, y la prueba
de determinismo sale limpia. El contexto observable SÍ determina la
cantidad.

Lo que falla es la **forma del modelo**: `real = base × rasgo × k`, un
único rasgo multiplicativo, es estructuralmente incapaz de expresar esta
relación. Con 26 observaciones no nulas repartidas entre dos artículos,
ajustar un modelo más rico (varios rasgos, condiciones, umbrales por
tramo) tiene mucho más riesgo de sobreajuste que valor: son importes de
presupuestos reales.

**Anotado como no resuelto, y cerrable en principio.** Lo que hace falta
no son más muestras sino un modelo distinto, y antes de escribirlo hay
que entender qué distingue las 26 no nulas — no buscarlo por fuerza bruta
sobre 26 casos.

### S.9.9 Las condiciones restantes de `ConjuntosAsoc`: ninguna es filtro

Buscando el discriminante que falta en los 24 casos de S.9.1 se revisaron
las columnas de `ConjuntosAsoc` sin semántica asignada
(`scripts/explorar-medida-conjuntos.mjs`,
`scripts/medir-condiciones-restantes.mjs`). Ninguna resuelve nada, y
conviene dejarlo escrito para no volver a mirarlas.

**`TipoMedCV` — vía muerta.** Era el mejor candidato a declarar el eje
contra el que se compara `MedidaMin/Max`. Vale **`"C"` en las 4.203 filas
con rango** que lo traen: constante, sin información.

**`FormulaOpcion` — mecanismo entendido, impacto nulo.** Condición de
opciones compuesta que el predictor no implementa: `O<n>` = "opción n
marcada". Sólo 3 valores distintos (`O926*O4`, `O927*O4`, `O925*O4`), 120
filas, y **un único operador: `*`** (conjunción). Afecta a **2 artículos**
(`GM5314`, `GM5315`, bisagra oculta) y a **0 filas del oráculo**. No se
implementa: sería código sin una sola prueba que lo respalde.

**`AperturaTH` — cierra el punto 5 de S.7, por falta de presencia.** S.7
la listaba como *"190 filas, última condición sin semántica"*. En el
oráculo sólo aparece en **14 filas**, y el reparto es exactamente
**7 artículos ausentes / 7 presentes**: aplicarla como filtro cambiaría 7
falsos positivos por 7 aciertos perdidos, a cara o cruz. No hay muestra
para inferir su semántica ni beneficio esperado en hacerlo. **Anotada como
no determinable con el oráculo actual**; requeriría ampliarlo con
correderas (los artículos afectados son todos RUEDA REGULABLE).

**`AsocAGrupoAsoc` — no es un filtro.** 1.747 filas del oráculo, con
838 ausentes frente a **909 presentes**: descartar las filas que la llevan
perdería más aciertos de los que evitaría. Es una clave de agrupación con
semántica propia, no una condición de descarte. Sin resolver.

**`GrupoAsoc`, `SoloUnaSN`, `PVCrefuerzoSN`, `SoloPerfPpalSN`,
`InsertadoSN` — descartadas como condiciones.** `PVCrefuerzoSN`,
`SoloPerfPpalSN` e `InsertadoSN` valen `False` en las 13.345 filas;
`SoloUnaSN` sólo 63 veces `True`; `GrupoAsoc` vale `'!'` en 13.047. Son
campos poblados, no condiciones que filtren.

**Corrección de método**: la primera versión de esta medición contaba
`"False"` como condición marcada, lo que arrastraba el catálogo entero al
recuento y daba cifras idénticas y sin sentido para las cuatro columnas
booleanas. Corregido en el script; las cifras de arriba son las buenas.

### S.9.4 Resultado

| Predictor (216 líneas) | Precisión | Cobertura | Exactas (artículos) |
|---|---:|---:|---:|
| v5 + `ArticuloAsoc` | 96,3% | 92,6% | 51/216 |
| **v5 + rasgo `trvPeq`** | **96,4%** | **94,3%** | **72/216** |

Las exactas suben un 41% con un solo rasgo medido. Sigue sin reproducirse
el oráculo línea a línea, así que **la valoración de asociados sigue
cerrada con aviso** (regla 3).

## S.7 Qué falta, en orden (revisado tras v4)

1. ~~Anclar los ejes de rango~~ **RESUELTO en S.6**: la medida es la
   fórmula de la propia ranura; la mano real, la de la instancia.
2. **Juntas perimetrales de hoja** (GM4055/GM5085, el mayor falso
   negativo): semántica RESUELTA y validada
   (`scripts/medir-ajuste-junta.mjs`): NO van en metros — cada tramo es
   una pieza (Cdad=1) que **copia exactamente un corte de perfil de
   hoja: delta = 0 en las 21 reglas estables, 4.624/4.632 tramos**,
   agrupado por (serie, junta, perfil de hoja, eje). Implementación: al
   despiezar, emitir una junta por cada pieza de perfil de hoja con su
   mismo largo; el artículo de junta sale de la fila `'!' HOJAS` de
   `ConjuntosAsoc`.
   **Corrección explícita**: una versión anterior de este punto afirmaba
   un ajuste por serie (−64/−90, −44/−70…). Era un artefacto de un bug de
   medición (con varias filas HV por hoja se comparaba contra la fórmula
   equivocada). El delta real es 0.
   La goma GM4090 (`A`/`L` ×2): unidades con largo aparte, pendiente de
   emparejar igual.
3. **La mano** (`ManoID`): bisagras izquierda/derecha.
4. **`ConfigSeriesAsoc`** (por `TipoHoja`) como segunda fuente.
5. **`AperturaTH`** (190 filas): última condición sin semántica.
6. Las 9 categorías `!` aún sin multiplicador fiable (más muestras o
   mapeo manual verificado).
7. Con exactitud línea a línea: activar la valoración.

Hecho ya: `A`/`L` (patillas por `UnidadesMin`), 5 categorías `!`
aprendidas, oráculo triplicado con VALB+VFAC.

## Scripts

```
scripts/medir-seleccion-completa.mjs   predictor v1: opciones + ejes (56,2%/99,5%)
scripts/medir-seleccion-v2.mjs         predictor v2: ranuras (61,5%/82,2%)
scripts/medir-seleccion-v3.mjs         predictor v3: completo, dos políticas
scripts/medir-seleccion-v4.mjs         predictor v4: fórmula de ranura + mano real
scripts/medir-seleccion-v5.mjs         predictor v5: rasgos '!' + trvPeq (96,4%/94,3%, 72/216)
scripts/medir-desvio-tramos.mjs        S.9.1: desvío de tramos y fuentes de medida
scripts/medir-tacos-goma.mjs           S.9.2/S.9.3: ancla de los tacos y origen de GM4090
scripts/explorar-ancho-hoja.mjs        S.9.1: DisIdRef*/DisFRef* y hojas desiguales
scripts/explorar-ref-largo.mjs         S.9.1: ¿el aplanado FormulaLargo pierde información?
scripts/explorar-tacos-goma.mjs        S.9.2/S.9.3: declaración en ConjuntosAsoc
```
