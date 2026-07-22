# Aluminior — Documento de entrega

**Fecha:** 18 de julio de 2026
**Titular:** ALUMINIOS LARA SLU (CIF omitido — regla 4)
**Repositorio:** https://github.com/Sergiom84/Aluminior (privado)
**Estado:** 4 módulos funcionando · motor de despiece que **evalúa** el 99,6%
de los componentes · resolución genérico → perfil validada (96,5% contra el
oráculo) y valoración de perfiles funcionando

> ⚠️ **Matiz importante (anexo T de `PLAN.md`, 19/07/2026).** El "99,6%" mide
> que el motor **evalúa** los componentes, no que **acierte los cortes**. La
> primera prueba de extremo a extremo contra el histórico
> (`scripts/probar-motor-contra-oraculo.mjs`, 1.229 líneas reales) da 25,1% de
> piezas correctas: el marco se reproduce bien (91,9% de piezas, 77,4% de
> líneas exactas) pero **de las 1.003 líneas con hoja no hay ninguna
> correcta**. El motor acierta cuántas piezas de hoja hay y falla cuánto
> miden: emite la medida del hueco y la hoja va rebajada. Sin resolver.

Este documento recoge todo lo hecho, todo lo encontrado, todo lo que queda y
todas las rutas necesarias para continuar sin repetir trabajo.

---

# 1. RUTAS — dónde está cada cosa

## 1.1 Sistema original (Productor Aluminio, de GAIA)

| Qué | Ruta | Tamaño |
|---|---|---|
| Acceso directo | `C:\Users\laral\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Productor Aluminio.lnk` | — |
| **Lanzador** | `C:\Productor\Aluminio\aluminio.exe` | 0,9 MB |
| **Aplicación real** | `C:\Productor\Aluminio\AluminioApp.exe` | 43 MB |
| Raíz de instalación | `C:\Productor\Aluminio\` | **24,4 GB** |
| Servicio de copias | `C:\Productor\gaCopiasDeSeguridad\` | — |

**Importante:** `aluminio.exe` es sólo un lanzador. La ventana real la posee
`AluminioApp.exe`. Si se automatiza la aplicación hay que conceder permisos
sobre el segundo, no sobre el primero.

Versión del producto: **46.30.0006**. Firma Authenticode válida de GAIA
SERVICIOS INFORMATICOS SL.

## 1.2 Bases de datos originales (Microsoft Access / JET)

Catálogo global de series, compartido por todas las empresas:

```
C:\Productor\Aluminio\InfoSeries.mdb          358 MB
```

Una base por empresa, 16 en total:

| Empresa | Ruta | Tamaño |
|---|---|---|
| EMP0001 | `C:\Productor\Aluminio\EMP0001\aluminio.mdb` | 111,0 MB |
| EMP0002 | `C:\Productor\Aluminio\EMP0002\aluminio.mdb` | 113,1 MB |
| EMP0003 | `C:\Productor\Aluminio\EMP0003\aluminio.mdb` | 57,5 MB |
| EMP0004 | `C:\Productor\Aluminio\EMP0004\aluminio.mdb` | 83,9 MB |
| EMP0005 | `C:\Productor\Aluminio\EMP0005\aluminio.mdb` | 101,0 MB |
| EMP0006 | `C:\Productor\Aluminio\EMP0006\aluminio.mdb` | 157,4 MB |
| EMP0007 | `C:\Productor\Aluminio\EMP0007\aluminio.mdb` | 183,9 MB |
| EMP0008 | `C:\Productor\Aluminio\EMP0008\aluminio.mdb` | 200,3 MB |
| EMP0009 | `C:\Productor\Aluminio\EMP0009\aluminio.mdb` | 446,0 MB |
| EMP0010 | `C:\Productor\Aluminio\EMP0010\aluminio.mdb` | 176,9 MB |
| EMP0011 | `C:\Productor\Aluminio\EMP0011\aluminio.mdb` | 260,0 MB |
| EMP0012 | `C:\Productor\Aluminio\EMP0012\aluminio.mdb` | 133,8 MB |
| EMP0013 | `C:\Productor\Aluminio\EMP0013\aluminio.mdb` | 264,7 MB |
| EMP0014 | `C:\Productor\Aluminio\EMP0014\aluminio.mdb` | 271,3 MB |
| EMP0015 | `C:\Productor\Aluminio\EMP0015\aluminio.mdb` | 281,3 MB |
| **EMP0016** | `C:\Productor\Aluminio\EMP0016\aluminio.mdb` | **226,6 MB** |

**EMP0016 = ALUMINIOS LARA - 2026.** Es la empresa operativa y la única
migrada. Las otras 15 no se han tocado.

Otras rutas de la instalación:

```
C:\Productor\Aluminio\EMP0016\DIBUJOS\      dibujos BMP (regenerables, NO migrar)
C:\Productor\Aluminio\Copias de Seguridad\  9,98 GB de backups
C:\Productor\Aluminio\RPT\                  303 informes Crystal Reports
C:\Productor\Aluminio\gaActualizaInet\      actualizaciones descargadas
C:\Productor\Aluminio\Gaia.Tools\           herramientas auxiliares
```

## 1.3 Cómo leer las MDB

Los proveedores **ACE OLEDB 12.0 y 16.0 (64 bits)** están instalados en el
equipo. Se leen desde PowerShell o Node sin necesidad de Access:

```
Provider=Microsoft.ACE.OLEDB.16.0;Data Source=<ruta.mdb>;Mode=Read
```

**Regla:** trabajar SIEMPRE sobre copia, nunca sobre la MDB activa. Copiar
primero a un directorio temporal y leer de ahí.

## 1.4 Proyecto nuevo

| Qué | Ruta |
|---|---|
| Repositorio local | `C:\Users\laral\OneDrive\Documentos\Aluminior` |
| Remoto | `https://github.com/Sergiom84/Aluminior.git` (privado) |
| Credenciales | `C:\Users\laral\OneDrive\Documentos\Aluminior\.env` (**NO versionado**) |
| Copia para Next | `packages\web\.env.local` (**NO versionado**) |
| **CSV exportados** | `C:\Users\laral\OneDrive\Documentos\Aluminior\export_datos\EMP0016\` |

La exportación son **205 ficheros, 227,1 MB**. Está fuera de git por contener
datos reales de clientes. Para llevarla a otro equipo: disco externo o
transferencia cifrada, **nunca** por el repositorio ni por OneDrive compartido.

## 1.5 Base de datos nueva

**Supabase**, región `eu-west-1` (UE, por RGPD). Las credenciales están en
`.env`. Contiene `DATABASE_URL`, claves anon y service role, y la URL de JWKS.

**Aviso:** esas claves han circulado durante el desarrollo. Si en algún momento
el repositorio dejara de ser privado, o simplemente por higiene, conviene
rotarlas desde el panel de Supabase.

## 1.6 Herramientas instaladas durante el trabajo

- **Node.js 24.18.0** — se instaló porque no estaba en el equipo
- Git 2.55.0 ya estaba, en `C:\Program Files\Git\cmd` (PATH de máquina)

---

# 2. EL SISTEMA ORIGINAL — qué es y cómo funciona

## 2.1 Arquitectura

Aplicación de escritorio Windows híbrida y veterana:

- Lanzador nativo/VB clásico más numerosos controles COM/OCX
- Módulos .NET Framework 4.0, WinForms
- Persistencia en Microsoft Access/JET, con NHibernate
- Informes Crystal Reports de 32 bits (runtime presente en el GAC)
- Licencia por mochila HASP/UniKey (pendrive físico)
- Servicio Windows separado de copias: `gaCopiaDeSerguridadService`
  (el error ortográfico "Serguridad" está en el nombre real)

## 2.2 Menús de la aplicación

| Menú | Contenido |
|---|---|
| **Ficheros** | Clientes, Clientes Potenciales, Artículos, Proveedores, Acreedores, Formas de Pago, Textos para Presupuestos, Representantes, Trabajadores, Reparto, Empresa, Listados |
| **Compras** | Pedidos, Albaranes, Facturas, Gastos, Ofertas, Control de Pago, Autorización de Pedidos, Fabricación de Artículos, Cheques/Pagarés, Creación Automática de Pedidos |
| **Ventas** | Presupuestos, Pedidos, Albaranes, Facturas, Albarán Electrónico, Factura Electrónica, **SII**, Documentos Web, Ofertas, Control de Cobro, Comisiones, Producción, Reparto, Control de Producción en Fábrica, Emisión de Recibos |
| **Utilidades** | Cajas, Agenda, Informes y Estadísticas, Documentos Vinculados, Actualizar Precios de Coste, Recalcular Precios de Venta, Importar Tarifa de Coste, **Importar Series**, Trabajo Desconectado, Notificador, Registro de acciones, **Hoja de Corte Múltiple**, **Series. Biblioteca**, **Ejecuta SQL**, WebService Productor, Copia de Seguridad, Reparar y Compactar |

**Utilidad práctica:** `Utilidades → Ejecuta SQL` permite consultar la base
desde la propia aplicación. Sirve para validar hipótesis sin tocar las MDB por
fuera. Sólo lectura.

**Nota fiscal:** en el menú aparece **SII** pero **no VeriFactu ni TicketBAI**.
Antes de planificar cualquier módulo de facturación hay que confirmar cómo se
está cumpliendo hoy la obligación de facturación verificable.

## 2.3 El configurador (pantalla "Edición de Línea")

Una línea de presupuesto es de **uno de tres tipos**:

1. **ESTRUCTURA** — elemento configurado a partir de una estructura de serie
2. **ARTICULO** — producto simple de catálogo
3. **CERRAMIENTO** — conjunto acristalado completo

Para el tipo ESTRUCTURA, el configurador tiene cuatro pestañas:

**Estructura:** serie de PERFILES y VIDRIO (la serie es prerrequisito de todo:
la aplicación avisa *"Indique Serie primero"*), acabado, accesorios y madera
—cada uno con tonalidad—, cantidad, metraje, referencia de ubicación en obra,
**ANCHO y ALTO en mm** con conmutador HUECO (medida de hueco frente a medida de
carpintería), vista previa del dibujo en tiempo real, **horas adicionales** de
fabricación y colocación, y complementos: compacto, guías izquierda/derecha,
tapajuntas, registro, premarco, condensación, altura. Más mosquiteras, ángulos
y tubos, bandejas y accesorios.

**Opc. Herraje:** selector de grupo, árbol de categorías y rejilla de opciones
seleccionables.

**Acristalamiento:** cinco slots, cada uno con vidrio separado para **hojas** y
para **fijos**.

**Cargos Adic.**

Cadena de dependencias del cálculo:

```
Serie (perfiles)
  └─> Estructura + Familia
        └─> Medidas (ancho/alto, hueco o carpintería)
              └─> Acabado + Tonalidad
                    └─> Opciones de herraje
                          └─> Acristalamiento (hojas / fijos)
                                └─> Complementos y accesorios
                                      └─> Mano de obra
                                            └─> Despiece → Coste → PVP
```

## 2.4 Anatomía de una serie

De la pantalla `Utilidades → Series. Biblioteca`, una biblioteca de serie se
compone de: **Estructuras, Artículos, Acabados, Familias, Familias de
Estructuras, Vidrios, Proveedores de Artículo, Coste y Dimensiones, Tarifas de
Coste Bruto, Subfamilias, Mano de obra y Guías de Persiana.**

---

# 3. LOS DATOS — qué hay y cómo está estructurado

## 3.1 Volumen real

| Métrica | Valor |
|---|---|
| Tablas en EMP0016 | 995 |
| **Tablas con datos** | **204** (20%) |
| Tablas en EMP0009 | 968 |
| Tablas en EMP0003 | 830 |

**El esquema NO es igual entre empresas.** Hasta 138 tablas de diferencia. Si
algún día se migran las otras 15, hay que perfilarlas por separado.

## 3.2 Ausencia de integridad referencial

**Sólo 10 claves ajenas declaradas sobre 968 tablas.** Las relaciones viven en
el código de GAIA, no en la base. Consecuencias:

- No se pueden deducir automáticamente: hay que inferirlas
- Los datos contienen huérfanos que la aplicación tolera en silencio
- Todo ETL necesita fase de perfilado y saneamiento

## 3.3 Tablas extremadamente anchas, y su reducción real

El perfilado de las filas reales reduce drásticamente el modelo:

| Tabla | Columnas en Access | Con datos reales |
|---|---|---|
| `Articulos` | 237 | **64** (27%) |
| `Clientes` | 236 | **35** (15%) |
| `VPresupuestos` | 156 | **51** (33%) |
| `Proveedores` | 131 | **26** (20%) |
| `EstructurasArticulos` | 132 | **72** (55%) |
| `EstructurasDiseño` | 81 | **68** (84%) |

Y de esas, muchas tienen un solo valor distinto en toda la tabla: son
constantes disfrazadas de columna.

**Las tablas del motor son densas (84%), las comerciales dispersas (15-33%).**

## 3.4 Calidad de datos: cliente opcional

En los 439 presupuestos de 2026, **muchos tienen el código de cliente vacío** y
sólo un nombre escrito a mano ("LUISFER", "REBECA", "JORGE"). El diálogo de
alta tiene campos separados para **Cliente** y **Potencial**.

**Si se modela el cliente como obligatorio, la migración histórica falla en un
porcentaje alto de documentos.** El esquema nuevo admite cliente, potencial o
simplemente un nombre libre.

## 3.5 Informes Crystal Reports

291 informes leídos con el motor oficial de SAP (presente en el GAC, 32 bits).
**136.766 referencias campo a campo catalogadas.**

- `esquema/rpt/informe_a_tablas.csv` — qué tablas usa cada informe
- `esquema/rpt/informe_campos.csv` — todas las referencias

**Sirven como sustituto de las claves ajenas ausentes**: si un informe cruza
`Clientes` + `VFacturas` + `VFacturasLin`, ahí está la relación.

**Limitación importante:** cubren **43 de las 178 tablas con datos**. Las otras
135 —las del motor de configuración y despiece— no las toca ningún informe.
`GetSQLStatement` devolvió vacío en los 291 porque los informes no están
conectados a una base viva: tenemos el mapa de tablas y campos, no las
consultas literales.

Los `.rpt` son ficheros compuestos OLE con contenido codificado: **no se leen
por extracción de cadenas**, hay que usar la API de Crystal.

---

# 4. EL MOTOR DE DESPIECE — resuelto

Es el hallazgo central del proyecto y está operativo.

## 4.1 El despiece es un lenguaje de fórmulas

`EstructurasArticulos.FormulaLargo` y `FormulaLargoCorte` no contienen datos:
contienen **expresiones** que el sistema evalúa con las medidas del hueco.

| | |
|---|---|
| Fórmulas distintas | **417** |
| Identificadores (variables) | **23** |
| Operadores | **7**: `+ - * / ( )` y coma decimal |
| Condicionales | ninguno |
| Funciones | ninguna |

Variables por frecuencia:

```
L (31.409)  A (21.316)  REF (17.168)  FI (4.196)  FS (3.568)  FD (1.109)
TD (589)  FZ (431)  F (208)  II (190)  ZO (142)  VS (138)  CAJ (128)
DV (126)  LB (80)  TR (50)  HO (50)  TI (45)  CVI (31)  CVD (31)
CGC (28)  FT (16)  HB (4)
```

Ejemplos reales:

```
L                 23.084 usos
REF               10.288
(A)/2              4.985
L-FS               1.480
L-FS-FI              651
(REF-FI-FD)/2         70
L+CAJ+2*30,00         44    <- la coma es separador DECIMAL, no de argumentos
```

**Evaluador implementado y validado: 417 de 417 fórmulas (100%).**
Código en `packages/core/src/despiece/formula.ts`.

## 4.2 Las variables son cotas de diseño

`EstructurasDiseño` define, por estructura, cotas con nombre simbólico:

```
Estructura  1+2
Simbolo     TR          <- el identificador de las fórmulas
Cota        600         <- valor por defecto en mm
nombreDA    travesaño   <- qué representa
```

Nombres confirmados por el propio sistema:

| Símbolo | Significado | Por defecto |
|---|---|---|
| `FI` | FIJO INFERIOR | 300 mm |
| `FS` | FIJO SUPERIOR | 300 mm |
| `TD` | TRAV DERECHA | 600 mm |

Verificación aritmética: `L-FS-FI` con hueco de 1600 → 1600−300−300 = **1000 mm**.

Son valores **por defecto**: al configurar una línea el usuario los cambia.

## 4.3 Cobertura alcanzada

| | Sólo L y A | Con cotas |
|---|---|---|
| Componentes resueltos | 12.348 / 14.724 (84%) | **14.658 / 14.724 (99,6%)** |
| Estructuras completas | 351 / 518 (68%) | **476 / 518 (92%)** |

Quedan 66 componentes: **`CAJ`** (64, cajón de persiana — depende del compacto
elegido, es contextual) y **`HB`** (2, sin identificar).

## 4.4 Tipos de corte

`TipoCorte` usa notación ASCII que **dibuja** el corte, y correlaciona con los
ángulos:

| Símbolo | Significado | Ángulos |
|---|---|---|
| `!!` | recto / recto | 90° / 90° |
| `/\` | inglete / inglete | 45° / 45° |
| `!\` | recto / inglete | mixto |

## 4.5 Vocabulario de funciones

`Funcion` identifica el papel de la pieza. 110 valores distintos. Los
principales:

```
MV / MH      marco vertical / horizontal
HV / HH      hoja vertical / horizontal
TM           travesaño
infHAesc     escuadra
infMOmof     mano de obra
```

## 4.6 Ejemplo funcionando

Estructura `1+1` con hueco 1600 × 1230:

| Artículo | Función | Fórmula | Medida | Corte |
|---|---|---|---|---|
| MARCO | MV | `L` | 1600 | inglete 45°/45° |
| MARCO | MH | `A` | 1230 | inglete 45°/45° |
| TRAVESAÑO | TM | `L` | 1600 | recto 90°/90° |
| HOJA | HH | `(A)/2` | 615 | inglete 45°/45° |

Las dos hojas repartiéndose el alto. **Verificado en pantalla, 42 de 42
fórmulas resueltas.**

---

# 5. EL PROBLEMA ABIERTO — valoración

> **CERRADO por el frente de PRECIO (22/07/2026, anexos T.55–T.59).** El cuello de
> la valoración NO era el recuento sino el PRECIO, y la mayor parte del dinero se
> tarifa (no se despieza). Medido contra el histórico: **`ImporteTotal = PVP(artículo,
> acabado, tarifa) × Metraje × Cdad`** reconstruye **~70,5% del € cliente a ±1%**
> (90,9% del € de despiece); el resto es manual/ajuste por presupuesto no registrado
> (límite por datos, no de modelo — T.58). Entregado: **máquina de precio** (lookup PVP,
> ya en `acciones.ts`), **cargador de tarifa** `packages/etl/src/cargar-tarifa.ts`
> (`npm run etl:tarifa`; dry-run por defecto, tarifas históricas 1/2/3 protegidas,
> aditivo, idempotente, reversible), tabla **`tarifas`** (registro de vigencia/procedencia,
> migración `0014` aplicada), y la **guarda "todo o sin valorar"** (`core/precios/guarda.ts`,
> testeada). El swap a la tarifa 2026 real = cargar y apuntar el presupuesto, sin tocar
> lógica. Ver PLAN.md **T.55–T.59**. Lo de abajo (recuento topológico T.24–T.52) queda como
> capa de precisión para los productos recurrentes.

> **RESUELTO (18/07/2026, sesión posterior).** El mecanismo de resolución
> genérico → perfil está identificado y validado contra 1.657 líneas de
> documentos reales: **96,5% de coincidencia exacta** con lo que eligió GAIA.
> La clave NO es el código del artículo genérico sino
> `EstructurasArticulos.DisComponente` (la sección 5.2 de abajo contiene esa
> confusión; se conserva como historia). Ver **PLAN.md anexo J** para el
> mecanismo completo, y la sección 6 para lo implementado: la valoración de
> perfiles funciona en la aplicación, con serie obligatoria en la línea.
> El acristalamiento también está valorado: hojas (anexo L), fijos (anexo N),
> junquillos y juntas (anexo M) y mixtas hoja+fijo en los casos demostrados
> (anexo Q). Quedan sin valorar (y avisando) los asociados —herrajes y
> escuadras—, la mano de obra, las correderas y los casos mixtos que las 21
> reglas medidas no cubren.

## 5.1 Los artículos del despiece son GENÉRICOS

Este es el obstáculo actual y está bien delimitado.

La plantilla de despiece no referencia productos reales:

```
1    (**MARCO VERTICAL GENERICO**)
2    (**MARCO SUPERIOR GENERICO**)
3    (**MARCO INFERIOR GENERICO**)
10   (**HOJA ABATIBLE PEQUEÑA VERTICAL APERTURA INTERIOR GENERICO**)
15   (**HOJA ABATIBLE PEQUEÑA HORIZONTAL APERTURA INTERIOR GENERICO**)
97   (**TRAVESAÑO MARCO GRANDE GENERICO**)
105  (**ESCUADRA PEQUEÑA GENERICO**)
```

**Hay 311 artículos genéricos** en el catálogo. No tienen precio ni coste
porque no se venden: son **ranuras**.

La plantilla es **independiente de la serie**. Define geometría y qué tipo de
pieza va en cada sitio, no qué perfil concreto. **La serie resuelve cada
genérico a un perfil real.** Por eso la aplicación exige "Indique Serie
primero".

## 5.2 Lo confirmado de la resolución

**La serie ES un conjunto.** Las 57 series configuradas de EMP0016 existen
todas como `Conjunto` en `ConjuntosLin`. Coincidencia 57/57.

**`ConjuntosLin` resuelve genéricos.** Estructura:

```
Conjunto | Componente | Familia | Articulo
```

donde `Componente` es el genérico y `Articulo` el perfil real. 18.858 de 21.714
filas (87%) llevan artículo real.

Verificado con la serie GMA100:

```
genérico 10  ->  GM100   [con coste]
genérico 15  ->  GM113   [con coste]
genérico 85  ->  GM116   [con coste]
```

**El conjunto de la serie declara sus dependencias.** El registro `GMA100`:

```
FamiliaAsociada   050        (vidrios)
TablaHojas        GM08
TablaFijos        GM08
herr1HA           GM0019     herraje para 1 hoja abatible
herr1HPC          GM0020     1 hoja practicable + corredera
herr2HA           GM0022     2 hojas
```

El **herraje depende del tipo de apertura**. Coherente con los campos
`Abat1H`, `Abat2H`, `Corr2H`… de `ConfigSeries`.

## 5.3 Lo que NO se ha resuelto

De los 14 genéricos del despiece de `1+1`, la serie resuelve **5**. Los otros
nueve —incluidos `2` (MARCO SUPERIOR), `3` (MARCO INFERIOR), `97` (TRAVESAÑO)
y `105` (ESCUADRA)— **no los resuelve ningún conjunto** en `ConjuntosLin`.

Marco y travesaño se resuelven por otro mecanismo, aún sin identificar.

**Candidatos por explorar, en orden de probabilidad:**

1. **`ConfigSeriesAsoc`** (1.137 filas) — `Conjunto + TipoHoja -> Articulo`,
   con fórmulas propias (`FormulaL`, `FormulaA`) y tipo de corte. Es el más
   prometedor: tiene la misma forma que lo que falta.
2. **`TablaHojas` / `TablaFijos`** — el conjunto de serie apunta a `GM08`.
   Debe existir un catálogo de perfiles por tipo de hoja.
3. **`ConjuntosAsoc`** (13.345 filas) — con `ComponenteAsoc` y fórmulas.
4. **`EstructurasSeriesAsoc`** (2.134 filas) — qué series valen para qué
   estructura. Probablemente sólo validación, no resolución.

## 5.4 Evaluación

Esto **no es una tabla de traducción**: es un sistema de resolución en varios
niveles, donde el perfil depende de la serie, del tipo de apertura, del tipo de
hoja y posiblemente de las medidas.

**Decisión tomada: no construir valoración sobre comprensión parcial.** Un
precio mal calculado que parece correcto es peor que un "sin valorar" honesto,
porque se cuela en presupuestos reales y se descubre facturando.

La interfaz muestra **"sin valorar"**, no un cero engañoso.

## 5.5 Pendiente adicional

`ArticulosCoste` (27.817 filas) **no está migrada**. Contiene el coste por
artículo, proveedor y acabado, con columnas `Coste` y `CosteConGastos`. Hace
falta para valorar.

---

# 6. LO CONSTRUIDO

## 6.1 Arquitectura

| Capa | Elección | Motivo |
|---|---|---|
| Base de datos | **PostgreSQL** (Supabase, región UE) | Modelo relacional pesado |
| Aplicación | **Next.js 15 App Router + TypeScript** | Un solo framework, UI y servidor |
| Acceso a datos | **Drizzle ORM** | SQL explícito, migraciones versionadas |
| Validación | **Zod 4** | Esquemas compartidos |
| Estilos | **Tailwind 4 + tokens CSS** | Mismo sistema que F-Gestor-IA |
| Autenticación | **Supabase Auth** (`@supabase/ssr`) | Gate de sesión en servidor; verificación JWT (JWKS), no `getSession()` (T.61) |
| Despliegue | **Render** (live) | `https://aluminior.onrender.com`, auto-deploy desde `main` |

**Requisito irrenunciable:** el cálculo de despiece y precios ocurre **siempre
en servidor**. Si el navegador pudiera calcular precios, cualquiera podría
manipularlos. Por eso se usa Supabase como base de datos, no su SDK de cliente.

**Decisiones revertidas por el camino** (documentadas en `ARQUITECTURA.md`):
Fastify → Express → Next.js. La última por alinearse con F-Gestor-IA.

### Configuración de despliegue en Render (la que FUNCIONA)

El servicio (`srv-d9dprl...`, repo `Sergiom84/Aluminior`, rama `main`, plan free)
sirve `@aluminior/web` del monorepo. Config verificada (T.61):

| Ajuste | Valor |
|---|---|
| `buildCommand` | `npm install --include=dev && npm run -w @aluminior/web build` |
| `startCommand` | `npm run -w @aluminior/web start` |
| `NODE_ENV` | `production` |

Cuatro fallos de config (no de código) que costó desenredar, por si reaparecen:
(1) el `startCommand` apuntaba a `@aluminior/api`, workspace **inexistente**;
(2) el `buildCommand` era solo `npm install`, nunca corría `next build`;
(3) `NODE_ENV=development` rompe `next build` al prerender de `/404`
(«`<Html>` should not be imported…») — debe ser `production`;
(4) con `NODE_ENV=production`, `npm install` **omite** devDependencies
(Tailwind/PostCSS/TS) → falla PostCSS en `app/globals.css`; de ahí el
`--include=dev`. Sanidad: `/` y `/dashboard` → 307 a `/login`; `/login` → 200.

## 6.2 Estructura del repositorio

```
Aluminior/
├─ PLAN.md              análisis completo, anexos A a R
├─ ARQUITECTURA.md      decisiones y su razonamiento
├─ ENTREGA.md           este documento
├─ README.md
├─ .env                 credenciales (NO versionado)
├─ .env.example         plantilla
├─ esquema/             análisis del sistema original
│  ├─ empresa/          DDL de las 968 tablas de EMP0009
│  ├─ infoseries/       DDL del catálogo de series
│  ├─ perfil/           perfilado de columnas usadas
│  └─ rpt/              mapa de los 291 informes Crystal
├─ export_datos/        CSV exportados (NO versionado, 227 MB)
├─ scripts/             utilidades de análisis
└─ packages/
   ├─ db/               esquema Drizzle y migraciones
   ├─ core/             dominio puro, sin E/S
   │  ├─ despiece/      evaluador de fórmulas y cálculo
   │  ├─ precios/       valoración
   │  └─ estructuras/   familias y códigos
   ├─ etl/              importación CSV → PostgreSQL
   └─ web/              Next.js
```

## 6.3 Esquema de base de datos

33 tablas. Migraciones en `packages/db/migrations/`:

```
0000_esquema_inicial     16 tablas base
0001_estructuras         catálogo de estructuras
0002_proveedores_obras   proveedores y obras
0003_despiece            plantillas de despiece
0004_cotas               cotas simbólicas
0005_series              conjuntos, resoluciones y delegaciones
0006_vidrio_galce        galces medidos para vidrio de hoja
0007_acristalamiento     persistencia del vidrio por línea
0008_fijos               galce y junquillo de fijos; tablas TACRIS
0009                     variante de acristalamiento en línea
0010                     variante elegida persistida
0011                     árbol de diseño y descuentos por alojamiento (mixtas)
0012                     opciones de herraje: catálogo y juego medido por serie+estructura
```

## 6.4 Datos cargados

**198.819 filas**, todas al 100% sin descartes:

| Tabla | Filas |
|---|---|
| `articulos_pvp` | 83.367 |
| `articulos_coste` | 27.817 |
| `articulos` | 17.547 |
| `conjunto_resoluciones` | 15.823 |
| `estructura_componentes` | 15.263 |
| `conjuntos` | 15.063 |
| `opciones_herraje` | 11.854 |
| `estructura_diseno_nodos` | 5.597 |
| `tacris_filas` | 2.488 |
| `obras` | 1.728 |
| `conjunto_delegaciones` | 697 |
| `estructuras` | 541 |
| `clientes` | 503 |
| `estructura_cotas` | 283 |
| `series` | 57 |
| `tonalidades` | 57 |
| `familias` | 32 |
| `herraje_conjuntos` | 22 |
| `vidrio_descuentos_alojamiento` | 21 |
| `acabados` | 18 |
| `vidrio_galce` | 14 |
| `junquillo_ajustes` | 9 |
| `proveedores` | 8 |
| `junquillo_ajustes_fijo` | 5 |
| `vidrio_galce_fijo` | 5 |

**Vacías a propósito** (esquema listo, sin cargar): `clientes_potenciales`,
`subfamilias`, y todas las de documentos.

## 6.5 El ETL

`packages/etl/src/importar.ts`. Idempotente: se puede reejecutar siempre.

**Distingue descarte de exclusión.** Un descarte es una fila que debería haber
entrado y no pudo: es un problema y hace fallar la carga con código 1. Una
exclusión es un filtrado deliberado y no es un error. Sin esa distinción, un
descarte real se esconde entre el ruido.

Exclusiones actuales: 12.689 instancias de documento en
`EstructurasArticulos` (no son plantillas) y 5.314 filas de diseño sin símbolo.

**Hallazgo:** `EstructurasArticulos` mezcla **15.263 plantillas de catálogo**
con **12.689 despieces ya calculados** de documentos reales (8.772
presupuestos, 1.972 albaranes, 1.945 facturas). Esas 12.689 son un **oráculo de
validación** aún sin explotar.

## 6.6 Módulos funcionando

**Clientes** — listado con búsqueda por nombre, código, NIF o población. Alta
con código propuesto automáticamente (formato de 5 dígitos como el original).
Edición. Al abrir un cliente se ven sus obras.

**Artículos** — listado paginado de los 17.547 (351 páginas), búsqueda y filtro
por familia. **Formulario adaptativo**: al elegir la unidad de medida cambian
los campos (ML → metraje mínimo, múltiplo, peso; M2 → grosor, junquillo; UD →
sin campos de consumo). Detalle con precios reales por acabado y tarifa.

**Estructuras** — catálogo de las 541 con búsqueda y filtro por familia.
**Detalle con despiece en vivo**: se introducen ancho, alto y las cotas
simbólicas, y las medidas de corte se recalculan al instante.

**Presupuestos** — listado, alta de cabecera, líneas de dos tipos, borrado de
líneas, totales con IVA recalculados en SQL.

**Autenticación** (T.61) — gate de sesión Supabase que protege toda la app;
sin sesión → `/login`. Solo empleados internos, alta manual (sin registro
público), login único. Pendiente del titular: crear usuario(s) en Supabase y
`npm run db:migrate` para la tabla `perfiles` (migración `0015`, rol aún sin uso).

## 6.7 Módulos pendientes

Marcados con la etiqueta **"pend."** en el menú lateral: Producción, Compras,
Informes. Orden de trabajo (roadmap T.60): **PDF de presupuestos** (en curso,
módulo #2) → Compras → Producción.

## 6.8 Cómo ejecutarlo

```bash
cd C:\Users\laral\OneDrive\Documentos\Aluminior
npm install
# .env debe existir con DATABASE_URL
npm run db:migrate      # aplicar migraciones
npm run etl             # cargar datos desde CSV
npm run dev:web         # http://localhost:3000/dashboard
```

Scripts de análisis disponibles:

```bash
node scripts/verificar-db.mjs           # estado de las tablas
node scripts/perfilar.mjs <Tabla>       # perfilar columnas usadas
npx tsx scripts/validar-formulas.mjs    # validar el evaluador (417/417)
npx tsx scripts/cobertura-despiece.mjs  # cobertura del despiece
node scripts/analizar-formulas.mjs      # vocabulario de fórmulas
node scripts/buscar-genericos.mjs       # análisis de genéricos
node scripts/resolver-genericos.mjs     # cadena de resolución
```

---

# 7. ERRORES COMETIDOS Y CORREGIDOS

Se documentan porque evitan repetirlos.

## 7.1 El parser de códigos de estructura (Anexo E)

**Hipótesis:** el código de estructura es una gramática compositiva
(`1O+2F+1O` = 1 oscilo + 2 fijos + 1 oscilo).

**Realidad:** cierto sólo en las familias 003 (ventanas) y 004 (puertas). En
113 (mamparas) y 001 (correderas) los dígitos son números de modelo. Validado
contra las 541 estructuras: **21% de cobertura, con errores graves**
(`C312` leído como "312 hojas"; es una corredera de tres hojas modelo 312).

**Decisión:** parser eliminado. Un componente que acierta una de cada cinco
veces y miente con seguridad el resto es peor que no tenerlo.

**Regla derivada:** ninguna regla de negocio inferida entra en el motor sin
contrastarse antes contra el catálogo o el histórico.

## 7.2 Datos personales a punto de subirse a GitHub

Los ficheros de perfilado incluían una columna de muestras con **nombres
reales, NIF, direcciones, emails y teléfonos de clientes**. Detectado antes del
primer push. Se depuraron las muestras y se reescribió el commit para que el
dato nunca existiera en el historial. Barrido de NIF, emails y móviles sobre
todos los commits: limpio.

## 7.3 `.env.local` sin proteger

Al copiar el `.env` a `packages/web/.env.local`, el `.gitignore` cubría `.env`
pero **no** `.env.local` ni variantes en subcarpetas. Corregido a `.env.*` y
`**/.env*`, dejando fuera sólo `.env.example`.

## 7.4 Agotamiento del pool de conexiones

`crearDb()` abría un pool nuevo **en cada petición**. Supabase corta a los 15
clientes. Compilaba perfectamente y en pruebas sueltas no se notaba, pero la
aplicación habría fallado al usarla un rato. Corregido cacheando el pool en
`globalThis` (para sobrevivir a la recarga en caliente). Prueba de esfuerzo: 30
peticiones seguidas, 30 correctas.

## 7.5 Validación fallando en campos invisibles

El alta de artículos fallaba **sin mostrar ningún error**. Causa: al elegir ML,
los campos de M2 no se renderizan, no viajan en el envío y llegan como
ausentes, pero el validador los exigía. La validación fallaba en campos que no
están en pantalla, así que no había dónde mostrar el mensaje.

Corregido, y añadida una **red de seguridad**: si todos los errores caen en
campos no visibles, sale un aviso explícito diciendo que es fallo del
formulario.

## 7.6 BOM de PowerShell

`Set-Content -Encoding utf8` en PowerShell 5.1 escribe marca de orden de bytes.
Un `package.json` con BOM **no es JSON válido** y el build falla con un error
críptico de módulo no encontrado. Usar herramientas que escriban UTF-8 limpio.

## 7.7 Orden de borrado en el ETL

Al reejecutar, borrar `familias` fallaba porque `articulos` la referencia.
Corregido con un `TRUNCATE ... CASCADE` único.

---

# 8. LO QUE HAY QUE HACER

## 8.1 Inmediato — desbloquear la valoración

> **HECHO (18/07/2026, sesión posterior):** resolución genérico → perfil
> identificada y validada contra el oráculo real (96,5%, anexo J);
> `ArticulosCoste` cargada (27.817 filas); valoración de perfiles funcionando
> con serie obligatoria en la línea. Nota: el oráculo NO son las instancias de
> `EstructurasArticulos` (guardan el genérico) sino las líneas hijas de
> `VPresupuestosLin` + la serie de `VDatosLinEstr`.

Lo que queda de la valoración:

1. **Asociados**: mecanismo identificado (anexo S): resolución de RANURAS
   como los perfiles — la plantilla genera ranuras `inf*` con
   `DisComponente`, `ConjuntosAsoc` las resuelve (opción marcada + medida
   de hoja en rango) y la cantidad es la suma de filas, con correcciones
   negativas. Opciones de herraje ya en el configurador (R.5). Predictor
   **v5** (act. 2026-07-22, `scripts/medir-seleccion-v5.mjs`, reejecutado y
   verificado de forma independiente): **96,4% precisión / 94,3% cobertura,
   72/216 líneas exactas en artículos** — pero **0/216 exactas en
   cantidades**: el tapón no es el predictor, es el **RECUENTO**
   (escuadras/juntas/MO), reconstruido sobre la topología del árbol
   `EstructurasDiseño` en T.33–T.48 (que ya cruza el 0: ~20 líneas held-out
   exactas). Lo que quedaba de S.7 está cerrado o caracterizado:
   `ConfigSeriesAsoc` por ingeniería inversa (T.40–T.47), categorías `!`
   (T.47), juntas de acristalamiento (T.43). El techo restante es **bloqueo
   por datos** (T.49–T.51): falta el despiece por unidad física. Estado y
   decisión del titular (camino b) en `CONTINUACION.md` y anexo T.52.
   Hoy quedan "sin valorar" con aviso (regla 3).
2. **Acristalamiento**: el vidrio se elige y se valora tanto en HOJAS
   (anexo L) como en FIJOS (anexo N), con junquillos y juntas por grosor de
   las tablas de la serie y longitudes medidas del histórico (anexo M).
   Mixtas hoja+fijo: **HECHO** para los casos demostrados (anexo Q: 21 reglas,
   49/121 casos completos). ETL cargado y web conectada ranura a ranura; los
   casos no cubiertos quedan sin valorar. Correderas y la elección de vidrios
   distintos por slot siguen pendientes. **Mano de obra**: sin modelar.
3. **Variante de acristalamiento** (`.1`/`.2`): **HECHO**. El configurador
   permite elegir cristal sencillo o doble, usa la variante al resolver los
   perfiles y la persiste. Doble queda como valor inicial porque es el 100%
   del histórico.
4. **El ~1% de fallos conocidos**: variantes de apertura (ELEGANTPVC y
   similares); requiere la dimensión "tipo de apertura" del configurador.

## 8.2 Corto plazo

- Autenticación (Supabase Auth SSR)
- Impresión de presupuestos en PDF
- Módulo de Producción: hoja de corte, optimización
- Módulo de Compras: pedidos a proveedor
- Cargar el resto de tablas comerciales

## 8.3 Medio plazo

- Optimización de corte 1D/2D
- Generación de dibujos
- Informes y estadísticas

## 8.4 Aparte y al final — facturación legal

**VeriFactu está en vigor.** Facturar con software propio no conforme es
sancionable. Este módulo va aislado, al final, y probablemente convenga
integrar una solución ya certificada en lugar de escribirla. Hasta entonces se
sigue facturando con el sistema actual.

## 8.5 Decisión estratégica pendiente

**El catálogo de series es un servicio continuo de GAIA.** `InfoSeries.mdb` es
un catálogo de 4.104 series de ~100 fabricantes, versionado por GAIA
(versión 45.50). La empresa usa 57.

Las series que ya se usan están en los datos y son recuperables. Pero el
**mantenimiento continuo** —series nuevas, cambios de tarifa de fabricante,
actualizaciones de herrajes— es un servicio de GAIA, no un fichero que se
copia.

Tres opciones:

1. Mantener GAIA sólo para el catálogo de series
2. Asumir la relación directa con cada fabricante (trabajo permanente)
3. Congelar las 57 series actuales y mantenerlas a mano

**Sin resolver esto, el módulo de producción no tiene sentido a largo plazo.**

---

# 9. MARCO LEGAL

- **Los datos son de ALUMINIOS LARA SLU.** Extraerlos, migrarlos y usarlos
  donde se quiera es derecho del titular.
- **El software es de GAIA Servicios Informáticos SL**, con binarios firmados.
  No se descompilan sus ensamblados ni se copia su código.
- **Vía seguida (sala limpia):** reconstrucción a partir del esquema de datos,
  de los informes Crystal, del manual y de la observación de la aplicación. Se
  replica *qué hace*, no *cómo está escrito*.
- **La mochila HASP/UniKey queda descartada.** Es el dispositivo de licencia:
  no contiene datos de negocio, y extraer sus claves o rodear la comprobación
  sería elusión de medidas de protección.
- **Mantener la licencia de GAIA viva** durante toda la transición: es la red
  de seguridad y la referencia de contraste.
- **RGPD:** 227 MB con nombres, NIF, direcciones y teléfonos. Región UE
  elegida explícitamente en Supabase. Nada de datos personales en el
  repositorio.
