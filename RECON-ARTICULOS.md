# Reconocimiento: Artículos

Observación autorizada de Productor Aluminio en ejecución, 18 de septiembre de
2026, en la empresa de pruebas `0017 PRUEBAS ALUMINIOR` (copia exacta de la
0016). Nunca en la 0016. Los datos de proveedores y precios se omiten salvo
cuando ilustran la estructura.

## Menú `Ficheros > Artículos`

| Entrada | Atajo |
|---|---|
| Artículos | Ctrl+A |
| Estructuras | Ctrl+E |
| Cerramientos | |
| Manufacturas | |
| Líneas de Negocio | |
| Familias | |
| Subfamilias | |
| Familias de Estructuras | |
| Acabados | |
| Tarifas | |
| Otros ▸ | |
| Asistente Doble Acristalamiento | |
| Asistente para Series | Ctrl+S |
| Asistente de Configuración | Ctrl+G |
| Configuración CTE | |

`Otros ▸`, en orden y con sus separadores:

1. Analizador de Tarifas · Consulta de Costes Medios · Curvas. Grupos de
   Series · Tipos de Artículos · Tipos de Artículos RPT · Procesos RPT ·
   Tarifas de Coste Bruto · Familias de Acabados · Grupos para Foliado ·
   Categorías de Gastos para Costes · Utillaje · Periodos de Coste Medio
2. Fases de Fabricación · Fases de Entrega · Fases de Corte y Producción ·
   Configuración Curvas y Diseño · Configuración de Diseño Barrotillos
3. Ubicación almacén · ABC para stock · Embalajes · Partidas Arancelarias ·
   Marcas Comerciales · Materiales · Estados de Artículos · Tipos de
   Contenedores
4. CE. Características · CE. Controles de Fabricación · CE. Laboratorios
5. Genera CES · Catálogo Virtual

Los atajos de menú chocan con los de documentos: con la ventana principal
activa, `Alt+F` abre `Facturas a Clientes` (atajo de Ventas), no el menú
`Ficheros`.

## `Artículos. Lista`

Barra superior: buscar (lupa), `Editar`, `Nuevo`, `Emitir`, `Documentos
Vinculados`, `Consultas Rápidas`, `Permisos del Formulario`; a la derecha un
icono de imagen, un icono de asociaciones y `Copiar`. Barra lateral derecha
común a las listas: mostrar/ocultar fila de filtros, quitar filtro, refrescar,
orden ascendente/descendente, columnas, exportar, Excel y configuración
(tooltips recortados; pendiente de confirmar uno a uno).

Fila de filtros editable encima de cada columna; `Enter` filtra por
contenido (p. ej. `MARCO` en Descripción devolvió 30 registros). Pie:
`N Registros` y `# Máximo` (500 por defecto).

Columnas: `Codigo`, `Descripcion`, `Familia`, `Subfamilia`, `BibliotecaSN`,
`TipoMetraje` (`UD`, `ML`, `M2`), `MetrajeMinimo`, `MetrajeMultiploAncho`,
`MetrajeMultiploLargo`, `CosteCalculadoSN`, `PesoML`, `Perimetro`,
`HojaCorteSN`, `HojaDespieceSN`, `DimLargo`, `StockSN`, `Proveedor`,
`Línea de Negocio`. El primer registro es `*` «ARTICULO COMODIN - TODOS LOS
ARTICULOS - PRECIOS Y DESCUENTOS».

## `Artículos. Detalle`

Barra: `Aceptar`, `Cerrar`, `Emitir`, `Siguiente Código` (deshabilitado al
editar), `Documentos Vinculados`, asociaciones; navegación anterior/siguiente
y `Eliminar`.

Cabecera: `Descripción`, `Usuario`; `Línea Negocio` (código, lupa, nombre),
`Estado` (desplegable, p. ej. `SIN ESTADO`); `Familia` (código, lupa, nombre),
`Subfamilia` (código, lupa, nombre); `Tipo de Art.` con selector y lupa;
`Tipo Impuesto`; imagen del artículo a la derecha.

Pestañas inferiores: `General`, `Coste`, `Prv.Habitual`, `Stock` (deshabilitada
en este artículo), `Cod.Prv.&Dim.`, `Producción`, `Mas Datos`, `CLA`.

### General

- Rejilla `PVP`: `Acabado` (código + lupa), `Descripción`, `Tarifa`, `P.V.P.`,
  `Actualización` (fecha y hora), `Bloqueo PVP`, `Acabado Dependiente`. Una fila
  por acabado y tarifa (tres tarifas observadas). Radio de agrupación
  `Acabado` / `Tarifa`.
- Panel derecho: `Peso` (Kg./ML), `Perím. Int.`, `Perím. Ext.`,
  `P. Valoracion`, `P. Total`; `Precio en Tabla`; `Editar Precios`.
- `Metraje`: radio `M2` / `ML` / `Unidades`; `Multiplo de` (cm. ancho),
  `Multiplo de` (cm. largo), `Largo >` con `Múltiplo` (cm.), `Metraje Mínimo`
  con unidad.
- `Metraje. Avanzadas`: `Uds.Emb.` (desplegable + cantidad), `Unidades de
  Embalaje: (n)`, `Contar los Cantos (ML)`, `Bobinas de metros`, `Largos`,
  `Cortos`, `Ignorar Unidades de Embalaje por Proveedor`.

### Coste

Subpestañas `Coste`, `Coste Especial`, `Coste Calculado`, `Incrementos`,
`Más Datos`, `Descuentos`, `Bloqueo PVP`.

- `Coste`: rejilla `Proveedor` (código + lupa), `Nombre`, `Acabado`,
  `Descripción`, `Coste`, `Es Neto`, `Actualización`, `Acabado Dependiente`;
  `Mostrar costes netos al cargar el artículo`; `Informe Costes`,
  `Actualizar PVP`.
- `Coste Especial`: casilla `Coste Especial`; rejilla «Precio de Coste
  especial por Tonalidad»: `Cod.Prv.`, `Proveedor`, `Acabado`, `Tonalidad`,
  `Descripción Tonalidad`, `Coste`, `Es Neto`, `Actualización`,
  `Coste con Gastos`.
- `Coste Calculado`: subpestañas `Coste`, `Más Datos`, `Peso por Proveedor`,
  `Perímetro por Proveedor`; `Coste Calculado a partir de...`, `Recalcular
  Coste`; rejilla `Orden Cálculo`, `Tarifa Coste Bruto`, `Descripción`,
  `Coste Bruto/Kg.`, `Divisa`, `Incremento ML`, `Bloqueo Incremento ML`;
  detalle de la tarifa seleccionada: `Coste ML`, `del Proveedor`, `Sólo
  Acabado`, `Grupo Foliado`, `Nº Matriz`, `Precio Foliado` (/ML), `Sólo
  Proveedor/Acabado Habitual`, `Sólo Proveedor`, `Obtener Precio Acabados del
  Proveedor de Coste Bruto`, `Coste Bruto manual por ML`, `Obtener de
  Acabado`.
- `Incrementos`: casilla `Incrementos según Medidas o Metraje`; subpestañas
  `Incrementos` / `Incrementos por Proveedor`; rejilla `Tipo`, `Desde`,
  `Hasta`, `% Incremento`.
- `Más Datos`: `Márgenes especiales`; rejilla `Tarifa`, `Descripción`,
  `Margen`, `Bloqueo PVP`; `Proveedor a utilizar`, `Restar descuento`,
  `Actualizar PVP`.
- `Descuentos`: «Especial Proveedores»: `Proveedor`, `Nombre`, `Aca.`, `Dto.`
- `Bloqueo PVP`: `Bloqueo cálculo PVP`; rejilla `Acabado`, `Descripción`.

### Prv.Habitual

`Proveedor Habitual` con lupa; `Pedidos de Compra. Forzar Proveedor Habitual`;
`Sólo si Peso` con desplegable y Kg.; subpestañas `Estándar`, `Pedidos de
Reposición`, `Pedidos de Compra`; rejilla `Acabado`, `Descripción`,
`Tonalidad`, `Prv.Hab.`, `Nombre`.

### Cod.Prv.&Dim.

Subpestañas `Código Proveedor`, `Dimensiones`, `Múltiplos`, `Volumen`.
`Código Proveedor`: «Código del Artículo para cada Proveedor» con
`Proveedor`, `Nombre Proveedor`, `Acabado`, `Tonalidad`, `Código Proveedor`,
`Acabado Proveedor`, `Uds. Emb.`, `Cdad./Emb.`, `Met.Min.Ped.`, `Descr.
Proveedor (Pedidos)`, `Código Embalaje`, `Descr. Proveedor Embalaje
(Pedidos)`; `Código de proveedor en función de Dimensiones`.

### Producción

`Documentos`: `Hoja de Corte`, `Hoja Producción`, `Hoja Resumen`, `Hoja Art.
Sueltos`, `Hoja Preparación`, `Etiqueta`, `Informe de Materiales`.
Subpestañas `Hoja de Corte`, `Máquinas`, `Máquinas(2)`, `Más Datos`,
`Barrotillos`. `Hoja de Corte`: `Orden H.Corte`, `Nº Barras Simultáneas`,
`Separar funciones`, `Sección Corte`, `Sección Prod.`; `Descuentos de corte`:
`Inicio Barra`, `Final Barra`, `Descuento Sierra` (mm); `Despunte`:
`Valoración. Longitud aprovechable`, `Optimización. Resto Mínimo` / `Resto
Máximo`; `Resto Mínimo y Máximo por acabado` con rejilla `Acabado`,
`Descripción`, `Resto Mínimo`, `Resto Máximo`.

### Mas Datos

Botones superiores: `Datos de RPT`, `Datos de Doble Acristalamiento`,
`Asociaciones`, `Artículos Equivalentes`, `Productor Web`. Subpestañas
`Datos`, `Despunte y Bultos`, `Observaciones`, `Pedido Compras`,
`Sincronización`. `Datos`: `Incluir en la exportación de Tarifas`, `Alias
Exportación`, `Excluir de Estadística de Ventas`, `Solo en tarifas (lista)`,
`Admite precio cero en estructuras`, `Admite acabado único en estructuras`,
`Venta. Coste Manual Obligatorio`, `Familia Tot.Fam.`, `Artículo desactivado`,
`Artículo con Aviso` + `Aviso`, `Facturación por porcentaje. Permitir dividir
cantidad`, `Tipo Impuesto Retenido`, `Repercutir Gastos sobre entradas de
almacén por compras`, `Registro de Números de Serie`, `Número de serie
automático`, `Prefijo numeración`, `Ancho numeración`, `Garantía` + `Periodo`,
`Aplicar Forfait`, `Calcular peso por M2 a partir de las dimensiones de la
línea`, `Precio y descuento manual sin notificar`, `Marca Comercial`,
`Material`.

### CLA (Cargo en Línea Aparte)

`Insertar como Cargo en línea aparte (CLA)`, `Forzar CLA (aunque se marque "No
generar CLAs")`, `Orden`; `Aplicar solo en estas Familias de Estructuras`,
`... estructuras`, `... Acabados`; `Tarifa`; `Descuento a aplicar`
(`Configuración general`, `Sin descuento`, `Descuento de la línea de
estructura`, `Descuento del artículo`); `Sumar a la valoración de la
estructura`; `Cálculo de Fecha de Entrega: establecer la misma fecha de
entrega que la estructura`; `Aplicar %Impuesto de la línea de estructura
principal`; subpestañas `Tarifa` / `Filtro Opciones de Estructura`;
`Obtener la tarifa del Grupo de Asignación de Tarifa`, `Configuración en
función del Grupo de Asignación de Tarifa`; rejilla `Grupo As. Tar.`,
`Descripción`, `Tarifa`, `Descuento a aplicar`.

### Subpestañas adicionales

- `Cod.Prv.&Dim. > Dimensiones`: `Dimensiones Comunes (= en todos los
  proveedores)`: `Ancho`, `Alto` (mm), `Espesor`, `Veta`; `Opciones`:
  `Pedidos de Compra. Forzar dimensiones`, `Sólo si Peso`, `Sólo si Pedido
  de Compra a Proveedor Habitual`, `Ventas. Fuerza Dimensiones estándar
  (generales o por proveedor)`, `Compras. Forzar al usuario a elegir
  dimensión`; `Dimensiones por Proveedor y Acabado` con rejilla `Cod.Prv.`,
  `Proveedor`, `Acabado`, `Descripción`, `Ancho (mm)`, `Largo (mm)` (barra de
  6.400 mm observada), `Veta`, `No usar para optimizaciones`, `Orden Ventas`;
  `Dimensiones Máximas. Venta` (`Ancho/Alto Mínimo/Máximo`, `Aviso al
  Usuario`, `Bloqueo Venta`, `Aviso Texto`); `Medidas. Venta` (`Nombre
  Ancho`, `Nombre Alto`); `Bobinas por Kilos (Unidades)` (`Ancho Bobina`,
  `Metros por Kg`).
- `Cod.Prv.&Dim. > Múltiplos`: «Múltiplos (cm.) y Metraje Mínimo por
  Proveedor (Para Compras)»: `Proveedor`, `Nombre`, `Múltiplos Ancho`,
  `Múltiplos Largo`, `Metraje Mínimo`; `Múltiplos y metraje mínimo por
  Acabado` con la misma rejilla por `Acabado`.
- `Cod.Prv.&Dim. > Volumen`: `Cálculo de volumen`; `Dimensiones para volumen`
  (`Ancho`, `Alto`, `Fondo`); `Dimensiones por Unidad de Embalaje`
  (`Embalaje`, `Bloquea dimensiones y peso del embalaje`, `Ancho`, `Alto`,
  `Fondo`, `Peso`).
- `Producción > Máquinas`: `Tronzadora` (`Func.`, `Altura del Perfil`,
  `Código para Tronzadora`, `Formato de Corte (Máquina)`, `Descripción
  Tronzadora`, `Valores especiales` `Valor \`, `Valor /`, `Valor |`, `Serie de
  Perfiles`, `Tipo de medida` `Exterior` / `Interior` / `Formato de Corte`,
  `Invertir angulos Izdo./Dcho.`); `Centro Mecanizado` (`Multi-Mecanizado`,
  `Código para Mecanizado`, `Ancho multi-mec.`, `Invertir Mecanizados`);
  `Soldadora` (`Código Soldadora`, `Perfil con goma`); `M2` (`Optimizador de
  M2`, `Admite Rotación`, `Dobladora de Intercalario`).
- `Producción > Máquinas(2)`: `Código en función del Acabado`; «Código para
  Tronzadora y Centro de Mecanizado según el Acabado»: `Acabado`,
  `Descripción`, `Código Mecanizado`, `Código Tronzadora`, `Código
  Soldadora`, `Código de Limpieza`, `Option (Elumatec)`, `WW1 (Elumatec
  ECW)`; `Campos Especiales`: `Emmegi. Codigo Serie`, `POM. Marca`, `POM.
  Serie`.
- `Producción > Más Datos`: `Descripción Producción`, `Tamaño (Gomos y
  Junquillos), Grosor Vidrio`, `Grosor para peso vidrio`, `Vidrio. Valor U`
  (W/m2K), `Vidrio. Factor Solar`, `Terminal de Taller: Tener en cuenta para
  calcular Pedido Fabricado`, `Terminal de Taller. Permitir añadir al
  Borrador de Albarán`, `Fase de entrega`, `Opción Accionamiento`.
- `Producción > Barrotillos`: `Ancho Barrotillo`, `Descuento Punta de
  Lanza`, `Descuento Perfil Intercalario`, `Tamaño Cruceta` (mm).
- `Mas Datos > Despunte y Bultos`: subpestañas `Despunte` / `Bultos`;
  `Despunte` con radio `Familia`, `No Despunte`, `Sólo Acabados...`, `Todos
  Aca. menos...` y rejilla `Acabado`, `Tonalidad`, `Descripción`.
- `Mas Datos > Observaciones`: memo.
- `Mas Datos > Pedido Compras`: `Optimizar en Act.Stock y Pedidos Compras`,
  `Excluir de los Pedidos Automáticos (siempre)`, `Excluir si es despiece de
  Estructura`, `Excluir si es CLA`, `Tipo Pedido (ML)`.
- `Mas Datos > Sincronización`: `Inter-Company`: `Artículo de Despiece de una
  Estructura`, `Artículo Despiece. Estructura`.

### Cabecera completa y botones de la ficha

Encima de `Descripción` hay una fila fija: `Codigo` (solo lectura al editar,
resaltado en amarillo en alta), descripción repetida de solo lectura y casilla
`De Usuario`. Iconos: `Documentos Vinculados`, `Cadena de Clasificación`; globo
junto a `Usuario` abre `Descripción Multi-Idioma` (tipo de elemento, código,
descripción, rejilla `Cód.` / `Idioma` / `Descripción`, `Editar / Añadir
Descripción` con `Idioma` y memo, `Grabar`, `Aceptar`); el icono sobre la
imagen pega un dibujo del portapapeles (sin imagen válida: «Imagen no
válida»). Tooltips: `Aceptar` = «Grabar datos (F9)», `Cerrar` = «Cerrar sin
grabar datos (ESC)», `Siguiente Código` = «Obtener Código Siguiente».

Panel derecho paginado `1` / `2`: página 1 con pesos y perímetros; página 2
con `P. Máximo`, `P. Aplicable`, `P. Último`, `P. Medio` (Kg./ML) y `Calcula`.

El radio `Acabado` / `Tarifa` bajo la rejilla PVP cambia el orden de las filas.

### Variaciones por tipo de metraje

- `ML` (perfil `GM17172`): peso en Kg./ML, múltiplos de ancho deshabilitados,
  `Bobinas de metros` deshabilitado.
- `Unidades` (accesorio `GM4791`): peso en Kg./UD, múltiplos y largo
  deshabilitados, imagen del artículo visible, un único acabado `UNI` con tres
  tarifas.
- `M2` (vidrio `V420AGS4`): `Multiplo de` 6,00 cm ancho y 6,00 cm largo,
  `Metraje Mínimo` 0,70 M2, `Bobinas de metros` habilitado; sin subfamilia.

### Alta, validación y baja

- `Nuevo` abre la ficha vacía con `ML` por defecto, `Usuario` del operador,
  `Siguiente Código` habilitado y `Eliminar` deshabilitado.
  `Siguiente Código` propuso `1001` (siguiente numérico tras `1000`).
- `F9` sin familia: «Debe indicar el campo 'Familia'». Con familia y sin
  descripción, grabó y volvió a la lista. Aluminior debe exigir descripción:
  diferencia intencional.
- La fila de filtros busca por contenido (`1001` también devuelve
  `GMA21001`).
- `Eliminar`: confirmación «¿Desea eliminar este Artículo?» `Sí` / `No`; con
  `Sí` comprueba la integridad contra los documentos («Comprobando
  integridad...: Líneas de Presupuestos») antes de borrar, y tarda.

### Diálogos de `Mas Datos`

- `Datos de RPT`: `Aceptar`, `Recalcular Coste`, `Cerrar`; `Artículo`;
  `Perfil de RPT Ensamblado`, `Proveedor (Coste ensamblado)`, `Tipo de
  Artículo RPT`, `Proceso RPT`; `Componentes`: `Perfil de RPT con Tres
  Perfiles`, `Perfil Interno`, `Perfil Intermedio`, `Perfil Externo`,
  `Poliamida 1`–`4`, `Mano de Obra`, `Mano Obra Bicolor`; `Acabados`:
  `Acabado Interior`, `Acabado Exterior`, `Acabado Ensamblado`,
  `Descripción`; `Generar`, `Crear automáticamente los nuevos acabados`,
  `Crear automáticamente las Tonalidades`.
- `Datos de Doble Acristalamiento`: `Doble Acristalamiento`, `Componente de
  D.A.`; pestañas `Doble Acristalamiento`, `Componente`, `Componente - PVP`,
  `Componente - PVP - Margenes`; `Art. Base`, `Vidrio 1`, `Cámara 1`,
  `Vidrio 2`, `Cámara 2`, `Vidrio 3`, `Perfil Intercal.`, `Fabricación de
  este D.A.`
- `Asociaciones`: «Asociaciones a este artículo en Estructuras»:
  `Estructura`, `Aca.A`, `Acabado Compañ.`, `Artículo asoc.`, `Descripción`,
  `Cantidad`, `A/L`, `Med.M`, `Med.Ma`, `Interv.`, `Uds.M`, `Uds.Ma`,
  `Formula`, `Formula`, `Dto. Med.`; editar, añadir, eliminar.
- `Artículos Equivalentes`: pestañas `Equivalentes` / `Tipo de Artículo`;
  rejilla `Artículo Equivalente`, `Descripción`, `Orden`, `Observaciones`.
  Al abrirlo, Productor muestra un «Informe de Errores» por un fallo de
  sintaxis SQL al cargar los tipos de artículo. No se reproduce.
- `Productor Web`: ventana completa; pestañas `Productor Web` /
  `Información`; `Artículo público`, `Admite precio manual`, `Admite
  descripción manual`; subpestañas `Acabados Válidos` / `Artículos
  Relacionados`; rejilla `Acabado`, `Descripción`, `Orden (web)`.

### Botones de la lista

- `Emitir`: `Opciones de Impresión` con `Número de Copias`, `Ficha` /
  `Etiqueta`, `Destino` (`Impresora`, `Pantalla`, `Exportar`, `Enviar por
  eMail`), `Modalidades` (`articulo.rpt`), `Memorizar Configuración`,
  `Aceptar`, `Cerrar`.
- `Consultas Rápidas`: ventana completa con `Categoría` (`Todas las
  Categorías`, `Clientes`, `Compras`, `Estadísticas`, `Información`,
  `Ventas`), `Consulta`, filtros (`Cliente`, `Proveedor`, `Representante`,
  `Delegación`, `Tipo Docum`, `Zona`, `País`, `Fecha Inicial`, `Fecha
  Final`, `Artículo` precargado, `Acabado`, `Familia`, `Subfamilia`, `Tipos
  Artículos`, `Lote`), `Imprimir Documentos`, `Vincula Excel`; pestañas
  `Consulta` / `Configuración`. Módulo transversal: se documentará aparte.

## Tablas maestras (`Productor. Fichas`)

Las entradas de mantenimiento del menú (líneas de negocio, familias,
subfamilias, acabados, tarifas...) se abren en otro ejecutable,
`gaProductorFichas.exe`, con su propia barra `Ficheros` / `Ventas` /
`Utilidades`, impresora, empresa y usuario. Mismo patrón `Lista` / `Ficha`,
barra `Aceptar` (F9) / `Cerrar` y navegación/`Eliminar`. Al cerrar una ficha
consultada sin cambios pregunta «¿Desea cerrar sin grabar?» (`Sí` / `No`).

- `Líneas de Negocio`: `Código`, `Descripción`. Un único registro: `G
  GENERAL`.
- `Familias` (32): lista `Código`, `Descripción`, `Margen1`–`Margen8`, `Línea
  de Negocio`. Ficha `General`: `Codigo`, `De Usuario`, `Línea Negocio`,
  `Descripción` (multi-idioma); `TARIFA > Márgenes` 1–8 (%); «Cómo se calcula
  el PVP de los artículos...»: `Sobre Mínimo de los Precios de Coste`,
  `Sobre Máximo de los Precios de Coste`, `Proveedor de Coste Bruto`,
  `Proveedor Habitual del Artículo`, `Restar Descuento del Proveedor al
  Coste`; `Tipo de Margen` (`Sobre Coste` / `Sobre Venta`); `Tipo de Coste`
  (`Precio de Compra sin gastos` / `Precio de Coste con gastos`); `Bloqueo
  PVP`, `Tarifa Avanzada`, `Márgenes según Tipo de Artículo`. En `001
  PERFILES`: 85/80/75 %, sobre máximo, restando descuento, sobre coste, compra
  sin gastos. `Modificar Precio Coste`: aumentar/disminuir % o importe,
  filtros por proveedor, artículo, acabado y subfamilia, `Modificar Coste
  Bruto y recalcular coste Final` / `Modificar Coste Final`, `Tarifa Coste
  Bruto`, `Actualizar los PVP`. `Más Datos`: pedidos automáticos, `Grupo Hoja
  Despiece`, `Orden escaparate`, `Familia de Manufacturas`, `Calcular
  Despunte`, `Presupuestos. Total por Familia` (`Total de cada Línea`, `Total
  del Presupuesto`, `Orden familia`), contabilidad especial, dibujo.
  `Herramientas`: eliminar descuentos de clientes, potenciales y grupos.
- `Subfamilias` (380): lista `Familia`, `Subfamilia`, `Descripción`,
  `Margen1`–`Margen8`. Clave compuesta familia + subfamilia. Ficha:
  `Familia` (lupa + nombre), `Subfamilia`, `Descripción`, `De Usuario`,
  `Admite Perfiles en acab. Unico`, `Márgenes de Beneficio diferentes de la
  Familia` + márgenes 1–8, `Pedidos automáticos diferentes de la Familia`,
  `Tarifa de Artículos a Excel` (`Observaciones`); pestaña `Avanzada`:
  `Incluir en la exportación de Tarifas`, dibujo.
- `Acabados` (18): lista `Código`, `Descripción`; barra con `Emitir` y
  `Copiar`. Ficha `General`: `Descripción`, `Orden (Act.Coste)`, `Color
  Perfiles`, `Color Accesorios` (muestras de color), `Familia`, `Descripción
  para Descripción Automática en ventas`, `Observaciones`, `De Usuario`.
  Pestañas `Coste` (coste calculado de perfiles, coste acabado €/dm2, precio
  lijado, perímetro para cálculo, acabado base, proveedor para
  transformaciones), `Diseño` (`Es Acabado Bicolor`, acabados de junquillos,
  guías, guardapolvos, bandeja, condensación, tapajuntas; válido para
  perfiles, accesorios, madera), `Datos Técnicos` (absortividad y tabla
  E.10 del CTE DB HE), `Tonalidades` (`Tonalidad`, `Descripción`,
  `Absortividad Marco`, `Exportar en Tarifas`, `Pública Productor Web`,
  `Desactivada`), `Otros`, `Acabados Dependientes` (subpestañas `Acabados
  Dependientes`, `Grupos Acabados Dependientes`, `Herramienta Copia`).
- `Tarifas` (4): lista `C`, `Descripción`, `OrdenCalc`, `Válida Ventas`,
  `Válida Costes`; accesos `Tarifas Coste`, `Tarifas Guardadas`, `Tarifas`.
  Ficha: `Codigo`, `Descripción`, `Orden Cálculo`, `Tarifa válida para
  Ventas`, `Tarifa válida para Costes`. Pestaña `Herramienta Tarifas`:
  `Tarifa destino`, filtros (`Familia`, `Subfamilia`, `Acabado`,
  `Proveedor`, `Cad. Clasificación`), subpestañas `Aumentar/Disminuir`,
  `Copiar Tarifa`, `Bloquear/Desbloquear`, `Consulta Artículos`. Hay una
  tarifa `X` con descripción basura en los datos reales.
- `Otros` en `Productor. Fichas` coincide con el del programa principal salvo
  que añade `Tarifa Dinámica` y omite `Analizador de Tarifas`, `Consulta de
  Costes Medios`, las configuraciones de curvas y barrotillos y `Genera CES`
  / `Catálogo Virtual`.
- `Tipos de Artículos` (1): `Código`, `Descripción`, `Margen1`–`Margen8`
  (`PEG BARROTILLO BLANCO` 60/55/50 %).
- `Estados de Artículos` (1): `Estado`, `Observaciones` (`SIN ESTADO`).
- `Embalajes` (0): `Código`, `Descripción`, `DimAn`, `DimAlt`, `DimFo`,
  `Peso`; formulario de estilo antiguo con `Número de registros`.

Los catálogos auxiliares de la ficha tienen uno o ningún registro en los datos
de ALUMINIOS LARA; la paridad de la ficha no depende de ellos.

## Comparación con Aluminior (misma tarea: abrir `GM17172`)

| Aspecto | Productor | Aluminior actual |
|---|---|---|
| Lista | Rejilla densa de 18 columnas, fila de filtros por columna, `# Máximo`, barra de acciones y barra lateral | Buscador único + familia, 4 columnas, paginación de 50 |
| Apertura | `Editar` o pestaña `Ficha` en la misma ventana; navegación anterior/siguiente | Enlace a página aparte, sin navegación entre registros |
| Cabecera | Línea de negocio, familia, subfamilia y tipo con lupa y nombre resuelto; estado; tipo de impuesto | Familia en desplegable; subfamilia y proveedor como texto libre |
| PVP | Rejilla editable acabado × tarifa con fecha de actualización, bloqueo y acabado dependiente | Tabla de solo lectura acabado/tarifa/precio, máximo 60 filas |
| Metraje | Radio M2/ML/Unidades, múltiplos ancho/largo, largo con múltiplo, mínimo, embalajes | Selector con campos condicionales y textos de ayuda |
| Coste, proveedor, dimensiones, producción, más datos, CLA | Ocho pestañas con subpestañas | No existen |
| Estilo | Superficie única de documento, sin tarjetas | Tarjetas `fieldset` con microcopia explicativa, contrario a `CLAUDE.md` |

Datos ya disponibles en el esquema de Aluminior: `articulos`, `articulos_pvp`,
`articulos_coste`, `acabados`, `tarifas`, `familias`, `subfamilias`. Faltan,
al menos, línea de negocio, estado, fechas de actualización de PVP, bloqueo
PVP y los datos de producción, dimensiones por proveedor y CLA.

## Primera iteración de la ficha en Aluminior

Implementada en `packages/web/app/dashboard/articulos/_components/ficha/`:
barra (`Aceptar` F9, `Cerrar` Esc, `Siguiente Código`, anterior/siguiente),
fila de código, cabecera con familia y subfamilia resueltas, pestañas en el
orden de Productor (`General`, `Coste`, `Prv.Habitual`, `Stock`,
`Producción`; `Cod.Prv.&Dim.`, `Mas Datos` y `CLA` deshabilitadas).
Verificado con `GM17172`: primera fila PVP `B BRONCE 1 4,07`, 30 filas PVP y
10 costes, igual que Productor. En alta, `Siguiente Código` propone `1001`,
igual que Productor.

Diferencias intencionales: descripción obligatoria; `Cerrar` solo pregunta si
hay cambios; tras grabar vuelve a la lista filtrada por el código.

Huecos de datos: el ETL vacía `subfamilias` pero no la carga, así que el
nombre de subfamilia no se resuelve (Productor muestra `GUÍAS Y PREMARCOS`
para `GM110`). No se persisten fecha de actualización, bloqueo PVP ni acabado
dependiente del PVP, ni línea de negocio, estado, tipo de artículo o tipo de
impuesto.

## Pendiente

- `Stock` en un artículo con stock; `Coste Calculado` (subpestañas `Más
  Datos`, `Peso por Proveedor`, `Perímetro por Proveedor`); `Bultos`.
- Los cinco botones de `Mas Datos` (`Datos de RPT`, `Datos de Doble
  Acristalamiento`, `Asociaciones`, `Artículos Equivalentes`, `Productor
  Web`).
- Ficha de artículos de otros tipos (vidrio `M2`, accesorio `UD`).
- `Nuevo`, `Copiar`, `Emitir`, `Consultas Rápidas`, `Editar Precios`,
  `Informe Costes`, `Actualizar PVP`.
- Resto de entradas del menú Artículos y de `Otros ▸`.
