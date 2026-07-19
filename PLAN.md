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
| **v5** | **94,5%** | **92,6%** | **34/216** |

Pendiente que concentra el resto: tacos de pilastra (categorías
`TRAVESAÑOS *` sin multiplicador fiable aún), la goma GM4090, el kit de
acristalamiento condicionado al junquillo (GM4353, FP), y los tramos de
cremona/tirante con varias fórmulas por ranura (las 454 filas con rango
descartadas por ranura sin fórmula evaluable).

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
```
