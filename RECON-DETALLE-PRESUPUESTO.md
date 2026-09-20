# Reconocimiento: detalle de presupuesto y edición de línea

> Revisión documental 20/09/2026: **Observación fechada**. Campos y navegación de referencia; no sustituye aceptación actual.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Observación autorizada de Productor Aluminio en ejecución, 18 de septiembre de
2026, empresa 0016 (ejercicio 2026), usuario Administrador. Solo consulta: no se
grabó ningún documento. Los datos de cliente se omiten a propósito.

## Apertura

- Lista `Presupuestos de Clientes. Lista` → botón `Editar` abre la ficha en la
  misma ventana (pestañas inferiores `Lista` / `Ficha`). El doble clic en la
  fila no abrió la ficha durante la observación.
- La ficha carga cabecera primero y líneas después (barra de estado
  «Cargando ArticulosDAcoste...»).

## Ficha `Presupuestos de Clientes. Detalle`

### Barra superior

Izquierda: `Aceptar` (tooltip «Grabar datos (F9)»), `Cerrar`, `Emitir`, icono de
vínculo. Derecha, en orden y con su tooltip literal:

| Orden | Tooltip |
|---|---|
| 1 | Informe de Materiales para este Documento |
| 2 | Importar Líneas desde csv (Excel) |
| 3 | Riesgo del Cliente |
| 4 | Calcular e imprimir Documentación CE |
| 5 | F3: Documentos de Producción |
| 6 | Cambiar medidas para Fabricación y Utilidades sobre las Líneas del documento |
| 7 | Crear Pedido de este Presupuesto |
| 8 | Crear Albarán de este Presupuesto |
| 9 | Pedido de Materiales para este Presupuesto |
| 10 | Coste del Presupuesto |
| 11 | Herramienta Precios y Descuentos |
| 12 | Recalcular Líneas del Documento |
| 13 | Pasar al registro anterior |
| 14 | Pasar al registro siguiente |
| 15 | Eliminar |

### Cabecera fija

`Nº Presupuesto` (solo lectura) · revisión (solo lectura) · `Fecha` · `Serie`
(solo lectura) · `Tarifa` con lupa y nombre resuelto a la derecha (`TARIFA 1`) ·
casilla `Bloqueo Precios`.

### Pestañas de cabecera numeradas 1–6

1. `Cliente` / `Potencial` (radio, código con lupa, nombre resuelto en azul),
   campo libre a la derecha; `Nombre` (dos campos: razón y nombre corto);
   `Obra` con lupa; `Nombre Versión`; `R.Interna`; `F.Pago` (código, candado,
   lupa, descripción); `Tipo Rem.` (código, lupa, descripción). Columna derecha:
   `Estado` (desplegable, p. ej. `PENDIENTE`), `Documentos Destino`, usuario
   creador.
2. `Dirección`, `País` (código + nombre), `eMail`, `Código Postal` con lupa,
   `Población`, `Provincia`, `Contacto`, `C.I.F.`, `Teléfono`, `Teléfono 2`,
   `Fax`.
3. `Dirección de Envío`: `Razón`, `Dirección`, `País`, `Código Postal`,
   `Población`, `Provincia`, `Teléfono`; candado y botón `Direcciones`.
4. `Zona` con lupa, `Idioma` desplegable, `Ofertas` con selector.
5. `Código Fiscal 2`, `Código Fiscal 3`, `Obsv.Cód.Fiscal`, `Cond. Residencia`,
   `Persona Tipo` (`Jurídica` / `Física`).
6. `Observaciones` (memo) con enlace `Ver Observaciones`.

### Rejilla `Líneas del Presupuesto`

Columnas: `Artículo`, `Descripción` (multilínea), `Referencia`, `Acabado`,
`Cdad.`, `Ancho(mm)`, `Alto(mm)`, `Precio`, `Dto`, `Total`, `Dibujo`
(miniatura). Una línea de cerramiento muestra el código de estructura (p. ej.
`2O`) como artículo.

### `Operaciones sobre la Línea`

Iconos de vista (lista / imagen), dos muestras de color y etiqueta de elemento
seleccionado (`MARCO`, `HUECO`). Acciones con tooltip: `Duplica la línea
actual`, subir/bajar línea, `ENTER: Editar la línea actual`, añadir, eliminar.
`Agrupa` (deshabilitado con una sola línea) y `Det.Estructura`.

### Totales

`Subtotal`, `Dto.` (% e importe), `Dto.p.p.` (% e importe), botón
`Precio Final...`; `Base Imponible`, `Tipo IVA` con lupa, `I.V.A.` (% e
importe), `Req.Eq.` (% e importe), `Total`; `Retención` con lupa (% e importe),
radio `Ret. sin IVA` / `Ret. con IVA`; divisa `EUR`.

### Pestañas inferiores

- `Presupuesto`: lo anterior.
- `Datos Adicionales` con subpestañas `Datos`, `Documentos Destino`,
  `Autorización`, `Divisa`, `Números Línea`, `Fabricación`. En `Datos`:
  `Tipo Documento`, `Tipo de Venta`, `Representante`, `Representantes Comisión`,
  `Delegación`, `Proyecto`, `Oferta Compras`, `Periodo Fiscal`, `Exportado` +
  fecha, `Enviado EMail` + fecha, `No calcular Recargo Energético`,
  `No aplicar Forfait`, `Grupo Documentos` + `Nuevo`; botones `Trabajo
  Desconectado`, `Detalle Dimensiones`, `Marcado CE`, `Textos`,
  `Incidencia CPF`, `CTE`, `Exportar a Word`, `Impuestos`; casillas
  `Carta de presentación`, `Factura Proforma`, `Es Borrador`, `Facturar
  automáticamente Albarán`, `Preguntar antes`, `No Incluir en Informes`;
  `Recibido a Cuenta` + `Cobros a Cuenta`; `Observaciones`.
- `Plazos`: `Fecha aceptación`, `Entregado` + fecha; bloque `Montaje /
  Instalación`: `Fecha prevista` + `Busca Fecha` + `Agenda`, `Observaciones`,
  `Semana Prev.`, `Fecha Entrega`, `Hora entrega`, `Montad.1`, `Montad.2`,
  `Usuario`.
- `Gastos` con subpestañas `Gastos` / `Otros Gastos`: `Comisión`, `Gastos
  Financ.`, `Portes`, `Generales` (% e importe), `Sumar Comisión`, `Deducir IVA
  antes`, `Otros Gastos`, `Despunte` (% sobre base) + `Calcular Despunte`.

## `Edición de Línea` (ENTER sobre una línea)

Ventana modal. Cabecera: `Código` con lupa; radio `Estructuras` / `Artículos`;
botón `Cerramiento`; `Mas Datos`.

Pestañas: `Estructura`, `Opc.Herraje`, `Cargos Adic.`, `Acristalamiento`.

- `Estructura`: `PERFILES` (serie con lupa y nombre), `VIDRIO` (código, lupa,
  nombre); `Acabado`, `Accesorios`, `Madera` (código + lupa + segundo código +
  nombre); miniatura del dibujo; `Cantidad`, `Metraje` + unidad, `Referencia
  (Tipo)`; `ANCHO` / `ALTO` en mm; selector de elemento (`HUECO`);
  `HORAS ADICIONALES` con `Fabr.` y `Coloc.`; accesorios de perímetro
  `Compacto`, `Guía Iz.` / `Guía De.`, `Tapajuntas`, `Registro`, `Premarco`,
  `Condensac.` con `Caj` y `Altura`; botones `Mosquiteras`, `Ángulos y Tubos`,
  `Bandejas/Cond.`, `Accesorios`.
- `Opc.Herraje`: desplegable `Herraje`; lista `Categoría` (`*** TODAS`,
  `BIS BISAGRAS`, `CER CERRADURAS`, `PAS HOJA PASIVA`, `MAN MANILLAS`,
  `OPC OPCION HERRAJE`, `REF REFUERZOS`); rejilla `Opciones de Herraje` con
  `Selec`, `Opción`, `Descripción`; las no seleccionadas se resaltan.
- `Cargos Adic.`: rejilla `Código Artículo`, `Descripción`, acabado, tono,
  descripción, `Cantidad`, `Ancho (mm)`, `Alto (mm)`, metraje, `Tipo C.`,
  `Precio`, `Total`, casillas de cálculo, `Coste Manual`, `Observaciones`;
  `Total Cargos`.
- `Acristalamiento`: cinco opciones radio de junquillo, cada una con código y
  descripción para `Hojas` y `Fijos`.

Pie común: descripción generada (memo) con casilla `Descripción Manual`;
`Precio` / UD, `Dto.` %, `Dto. 2` % e importe, `Total Linea`; `Tarifa` con
lupa y `Tarifa Manual`; `PVP Manual`, `%Dto. Manual`, `Coste Manual`;
`Aceptar`, `Cerrar`; casilla `n.r.`.

## Comportamiento observado

- Abrir la edición de línea y cerrarla con `Cerrar` marca el documento como
  modificado: al cerrar la ficha aparece «Se ha operado sobre las líneas de este
  documento. Debe grabarlo para asegurar su consistencia.» con un único botón
  `Aceptar`, y la ficha sigue abierta. Aluminior no debe reproducir este
  comportamiento: consultar una línea no debe forzar a grabar.
- La interfaz responde con retardos de varios segundos entre acción y
  repintado.

## Pendiente de observar

- Contenido de `Mas Datos`, `Cerramiento` (diseñador), `Precio Final...`,
  `Det.Estructura` y `Coste del Presupuesto`.
- Atajos de teclado además de `F9` (grabar), `F3` (documentos de producción) y
  `ENTER` (editar línea).
