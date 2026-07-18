-- Esquema extraido de: EMP0009 (aluminio.mdb, 446 MB)
-- Tablas: 968  |  Con datos: 178

-- ===== Acabados  (filas: 138) =====
CREATE TABLE [Acabados] (
  [Codigo] NVARCHAR(10),
  [Descripcion] NVARCHAR(200),
  [CosteCalcSN] BOOLEAN NOT NULL,
  [CosteCalcProvSN] BOOLEAN NOT NULL,
  [Coste] REAL,
  [LijadoSN] BOOLEAN NOT NULL,
  [PrecioLijaML] REAL,
  [PlastSN] BOOLEAN NOT NULL,
  [FoliadoSN] BOOLEAN NOT NULL,
  [CosteCalPerimetroTE] NVARCHAR(1),
  [OriginalSN] BOOLEAN NOT NULL,
  [Orden] SMALLINT,
  [TarifaProvSN] BOOLEAN NOT NULL,
  [TPproveedor] NVARCHAR(10),
  [TPseleccionadoSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [ColorPerfil] INTEGER,
  [BicolorSN] BOOLEAN NOT NULL,
  [BCacaJunq] NVARCHAR(10),
  [BCacaGuias] NVARCHAR(10),
  [BCacaGuardaP] NVARCHAR(10),
  [BCacaBand] NVARCHAR(10),
  [BCacaCondens] NVARCHAR(10),
  [BCacaTap] NVARCHAR(10),
  [CodProvTransf] NVARCHAR(10),
  [AcaCompRPTsn] BOOLEAN NOT NULL,
  [TransPerimetroMin] REAL,
  [DisPerfilesSN] BOOLEAN NOT NULL,
  [DisAccesoriosSN] BOOLEAN NOT NULL,
  [DisMaderaSN] BOOLEAN NOT NULL,
  [DisPerfAcaAcc] NVARCHAR(10),
  [UsuarioSN] BOOLEAN NOT NULL,
  [CTEabsortividadM] REAL,
  [ColorAcc] INTEGER,
  [FechaHoraAct] DATE,
  [NoTonStdVentasSN] BOOLEAN NOT NULL,
  [NoTonStdComprasSN] BOOLEAN NOT NULL,
  [DescripcionDescrAuto] NVARCHAR(200),
  [ExportaTarSN] BOOLEAN NOT NULL,
  [CosteCalcOrdenCalculo] SMALLINT,
  [CosteCalcAcabadoBaseSN] BOOLEAN NOT NULL,
  [CosteCalcAcabadoBase] NVARCHAR(10),
  [ValidoCopiarCostesSN] BOOLEAN NOT NULL,
  [DivisaCoste] NVARCHAR(5),
  [Observaciones] NVARCHAR,
  [Familia] NVARCHAR(10),
  [DescuentosCliAcabadosDepSN] BOOLEAN NOT NULL,
  [PreciosNetosCliAcabadosDepSN] BOOLEAN NOT NULL,
  [ValidosEstructurasAcabadosDepSN] BOOLEAN NOT NULL,
  [AcabadoRPTsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== AcabadosCodImp  (filas: 110) =====
CREATE TABLE [AcabadosCodImp] (
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10) NOT NULL,
  [CodImp] NVARCHAR(10),
  PRIMARY KEY ([Acabado], [Proveedor])
);

-- ===== AcabadosCodProv  (filas: 0) =====
CREATE TABLE [AcabadosCodProv] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [CodigoProveedor] NVARCHAR(20),
  [DescripcionProveedor] NVARCHAR(200),
  PRIMARY KEY ([Acabado], [AcaTonalidad], [Proveedor])
);

-- ===== AcabadosDependientes  (filas: 0) =====
CREATE TABLE [AcabadosDependientes] (
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcabadoDependiente] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Acabado], [AcabadoDependiente])
);

-- ===== AcabadosGruposFoliado  (filas: 0) =====
CREATE TABLE [AcabadosGruposFoliado] (
  [codigo] NVARCHAR(3),
  [Descripcion] NVARCHAR(40),
  [PrecioFoliadoML] REAL,
  [Divisa] NVARCHAR(5),
  [PrecioPorArticuloAcabadoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([codigo])
);

-- ===== AcabadosGruposFolPrecioArticulo  (filas: 0) =====
CREATE TABLE [AcabadosGruposFolPrecioArticulo] (
  [GrupoFoliado] NVARCHAR(3) NOT NULL,
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [PrecioFoliadoML] REAL,
  PRIMARY KEY ([GrupoFoliado], [Articulo], [Acabado])
);

-- ===== AcaTonalidades  (filas: 138) =====
CREATE TABLE [AcaTonalidades] (
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tonalidad] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [CTEabsortividadM] REAL,
  [ExportaTarSN] BOOLEAN NOT NULL,
  [ColorPerfil] INTEGER,
  [ColorAcc] INTEGER,
  [PublicaProductorWebSN] BOOLEAN NOT NULL,
  [DesactivadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Acabado], [Tonalidad])
);

-- ===== ACompruStock  (filas: 0) =====
CREATE TABLE [ACompruStock] (
  [Numero] NVARCHAR(6),
  [Fecha] DATE,
  [Almacen] NVARCHAR(5),
  [Observaciones] NVARCHAR(255),
  [GenAutoSN] BOOLEAN NOT NULL,
  [nRegu] NVARCHAR(6),
  PRIMARY KEY ([Numero])
);

-- ===== ACompruStockLin  (filas: 0) =====
CREATE TABLE [ACompruStockLin] (
  [nLinea] INTEGER NOT NULL,
  [nCompru] NVARCHAR(6),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(14),
  [Ancho] REAL,
  [Largo] REAL,
  [StockPrg] REAL,
  [StockReal] REAL,
  [BloqueoArtSN] BOOLEAN NOT NULL,
  [AcaTonalidad] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== Acreedores  (filas: 0) =====
CREATE TABLE [Acreedores] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(40),
  [Contacto] NVARCHAR(30),
  [CuentaContable] NVARCHAR(15),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [DiasPago1] SMALLINT,
  [DiasPago2] SMALLINT,
  [DiasPago3] SMALLINT,
  [DesdeSinPagos] DATE,
  [HastaSinPagos] DATE,
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [NombreEntidad] NVARCHAR(40),
  [Observaciones] NVARCHAR,
  [CuentaGastos] NVARCHAR(15),
  [Pais] NVARCHAR(10),
  [CodigoContabilidad] NVARCHAR(15),
  [NIF] NVARCHAR(30),
  [CodigoFiscal2] NVARCHAR(30),
  [CodigoFiscal3] NVARCHAR(30),
  [CodigoFiscalObservaciones] NVARCHAR(30),
  [CuentaBancariaIntl] NVARCHAR(80),
  [eMail] NVARCHAR(150),
  [DiasVtoMaxAjusta] NVARCHAR(10),
  [PersonaFisicaJuridica] NVARCHAR(8),
  [CondicionResidencia] NVARCHAR(1),
  [DomiciliacionSN] BOOLEAN NOT NULL,
  [FechaHoraAct] DATE,
  [TipoNacionalidad] NVARCHAR(15),
  [BIC] NVARCHAR(11),
  [RedondeoEspSN] BOOLEAN NOT NULL,
  [RedondeoPrecio] SMALLINT,
  [RedondeoLinea] SMALLINT,
  [RedondeoTotal] SMALLINT,
  [Divisa] NVARCHAR(5),
  [DivisaImprimir] NVARCHAR(5),
  [TipoIVA] NVARCHAR(2),
  [CategoriaGasto] NVARCHAR(2),
  [TipoRetencion] NVARCHAR(2),
  [siiTipoIdFiscal] NVARCHAR(2),
  [TipoDocumento] NVARCHAR(5),
  [Usuario] NVARCHAR(30),
  [CuentaEfectosPagar] NVARCHAR(15),
  [TipoIDfiscal] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== AcreedoresContactos  (filas: 0) =====
CREATE TABLE [AcreedoresContactos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [NumeroContacto] SMALLINT NOT NULL,
  [Nombre] NVARCHAR(100),
  [Cargo] NVARCHAR(50),
  [Telefono] NVARCHAR(20),
  [TelefonoMovil] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Codigo], [NumeroContacto])
);

-- ===== AcreedoresCuentaPagos  (filas: 0) =====
CREATE TABLE [AcreedoresCuentaPagos] (
  [Acreedor] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [TipoDocumento] NVARCHAR(5) NOT NULL,
  [Prioridad] SMALLINT,
  [CuentaPagos] NVARCHAR(4),
  PRIMARY KEY ([Acreedor], [Serie], [Delegacion], [TipoDocumento])
);

-- ===== AcreedoresDelegaciones  (filas: 0) =====
CREATE TABLE [AcreedoresDelegaciones] (
  [nLinea] INTEGER NOT NULL,
  [Acreedor] NVARCHAR(10) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ActDatosConfig  (filas: 1) =====
CREATE TABLE [ActDatosConfig] (
  [NombreDato] NVARCHAR(60),
  [Biblioteca] SMALLINT,
  [Valor] NVARCHAR(255),
  [Fecha] DATE
);

-- ===== ActInternet  (filas: 1) =====
CREATE TABLE [ActInternet] (
  [DirBase] NVARCHAR(255),
  [ServidorFTP] NVARCHAR(255),
  [NombreUsuario] NVARCHAR(40),
  [Contra] NVARCHAR(40),
  [FicheroAct] NVARCHAR(100),
  [FicheroNov] NVARCHAR(100),
  [FicheroEjec] NVARCHAR(100)
);

-- ===== AEnsamblaje  (filas: 0) =====
CREATE TABLE [AEnsamblaje] (
  [Numero] NVARCHAR(6),
  [Fecha] DATE,
  [Observaciones] NVARCHAR(255),
  [StockActSN] BOOLEAN NOT NULL,
  [StockResSN] BOOLEAN NOT NULL,
  [Almacen] NVARCHAR(5),
  [AlmacenRestos] NVARCHAR(5),
  [TipoAcaCompACAOTR] NVARCHAR(3),
  [AcaCompOtro] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [AlmacenSalidaComp] NVARCHAR(5),
  [FechaEntrada] DATE,
  [nEnsOrigen] NVARCHAR(6),
  [nAlbProv] NVARCHAR(20),
  [nPedCli] NVARCHAR(20),
  [NumeroVDocOrig] NVARCHAR(20),
  [Delegacion] NVARCHAR(2),
  [TipoDocumento] NVARCHAR(6),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [TipoVDocOrig] NVARCHAR(6),
  PRIMARY KEY ([Numero])
);

-- ===== AEnsamblajeLin  (filas: 0) =====
CREATE TABLE [AEnsamblajeLin] (
  [nLinea] INTEGER NOT NULL,
  [nEns] NVARCHAR(6),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Cantidad] REAL,
  [Largo] REAL,
  [Metraje] REAL,
  [AcaTonalidad] NVARCHAR(20),
  [AcabadoInt] NVARCHAR(10),
  [AcabadoExt] NVARCHAR(10),
  [AcabadoIntermedio] NVARCHAR(10),
  [AcaTonalidadInt] NVARCHAR(10),
  [AcaTonalidadExt] NVARCHAR(10),
  [AcaTonalidadIntermedio] NVARCHAR(10),
  [VOrig_TipoDoc] NVARCHAR(6),
  [VOrig_nLinea] INTEGER,
  PRIMARY KEY ([nLinea])
);

-- ===== AgAfinidadComercial  (filas: 0) =====
CREATE TABLE [AgAfinidadComercial] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [Orden] SMALLINT,
  [ColorAplicar] INTEGER,
  PRIMARY KEY ([Codigo])
);

-- ===== AgAvisos  (filas: 0) =====
CREATE TABLE [AgAvisos] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Cliente] NVARCHAR(10),
  [Potencial] NVARCHAR(10),
  [Usuario] NVARCHAR(30),
  [CliNombre] NVARCHAR(100),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliPais] NVARCHAR(10),
  [CliTelefono] NVARCHAR(20),
  [CliTelefonoMovil] NVARCHAR(20),
  [ClieMail] NVARCHAR(150),
  [Representante] NVARCHAR(5),
  [AgZonaComercial] NVARCHAR(3),
  [IdAgenda] GUID,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [TipoTareaAgenda] NVARCHAR(30),
  [FechaAgenda] DATE,
  [Titulo] NVARCHAR(100),
  [Descripcion] NVARCHAR,
  [CliTelefono2] NVARCHAR(20),
  [Delegacion] NVARCHAR(2),
  [VPresNumero] NVARCHAR(20),
  [VPresRevision] NVARCHAR(3),
  [Estado] NVARCHAR(3),
  PRIMARY KEY ([Numero])
);

-- ===== AgCampañas  (filas: 0) =====
CREATE TABLE [AgCampañas] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [FechaEnvio] DATE,
  [Visible] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== AgCampañasDetalle  (filas: 0) =====
CREATE TABLE [AgCampañasDetalle] (
  [CodigoCampaña] NVARCHAR(10) NOT NULL,
  [Tipo_CLI_POT] NVARCHAR(6) NOT NULL,
  [CodigoClienteOPotencial] NVARCHAR(38) NOT NULL,
  PRIMARY KEY ([CodigoCampaña], [Tipo_CLI_POT], [CodigoClienteOPotencial])
);

-- ===== AgClasificacionComercial  (filas: 4) =====
CREATE TABLE [AgClasificacionComercial] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [Orden] SMALLINT,
  [ColorAplicar] INTEGER,
  [PeriodoContactoDias] SMALLINT,
  [TipoTareaContacto1] NVARCHAR(30),
  [TipoTareaContacto2] NVARCHAR(30),
  [TipoTareaContacto3] NVARCHAR(30),
  [AsignaAutoSN] BOOLEAN NOT NULL,
  [AsignaAutoPorcentajeClientes] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== AgDocumentos  (filas: 0) =====
CREATE TABLE [AgDocumentos] (
  [Nombre] NVARCHAR(30) NOT NULL,
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([Nombre])
);

-- ===== AgenciasTransporte  (filas: 0) =====
CREATE TABLE [AgenciasTransporte] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Contacto] NVARCHAR(80),
  [NIF] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  [Observaciones] NVARCHAR,
  [VRepAutoVPedSN] BOOLEAN NOT NULL,
  [VRepAutoRuta] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== Agenda  (filas: 0) =====
CREATE TABLE [Agenda] (
  [nLin] INTEGER NOT NULL,
  [Fecha] DATE,
  [Hora] NVARCHAR(10),
  [Usuario] NVARCHAR(30),
  [TipoTarea] NVARCHAR(30),
  [Cliente] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [PendienteSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR,
  [NumeroPresup] NVARCHAR(20),
  [NumeroPedido] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== AgendaTareas  (filas: 0) =====
CREATE TABLE [AgendaTareas] (
  [Nombre] NVARCHAR(30),
  PRIMARY KEY ([Nombre])
);

-- ===== AgendaUsuarios  (filas: 0) =====
CREATE TABLE [AgendaUsuarios] (
  [Nombre] NVARCHAR(30),
  PRIMARY KEY ([Nombre])
);

-- ===== AgEstados  (filas: 0) =====
CREATE TABLE [AgEstados] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [ColorEstado] INTEGER,
  [ValidoParaAgendaSN] BOOLEAN NOT NULL,
  [ValidoParaAvisosSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== AgMaterialMarketing  (filas: 0) =====
CREATE TABLE [AgMaterialMarketing] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Valor] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== AgSatisfaccion  (filas: 0) =====
CREATE TABLE [AgSatisfaccion] (
  [Nombre] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Nombre])
);

-- ===== AgTiposEntradas  (filas: 1) =====
CREATE TABLE [AgTiposEntradas] (
  [Nombre] NVARCHAR(30) NOT NULL,
  [ResultadoSN] BOOLEAN NOT NULL,
  [RstCreaSeguimientoSN] BOOLEAN NOT NULL,
  [RstCreaSegTipoEntrada] NVARCHAR(30),
  PRIMARY KEY ([Nombre])
);

-- ===== AgTitulos  (filas: 0) =====
CREATE TABLE [AgTitulos] (
  [Titulo] NVARCHAR(100) NOT NULL,
  PRIMARY KEY ([Titulo])
);

-- ===== AgZonasComerciales  (filas: 0) =====
CREATE TABLE [AgZonasComerciales] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(50),
  PRIMARY KEY ([Codigo])
);

-- ===== AgZonasComercialesCP  (filas: 0) =====
CREATE TABLE [AgZonasComercialesCP] (
  [nLinea] INTEGER NOT NULL,
  [Pais] NVARCHAR(10) NOT NULL,
  [CodigoPostal] NVARCHAR(20) NOT NULL,
  [Direccion] NVARCHAR(80),
  [Observaciones] NVARCHAR(40),
  [AgZonaComercial] NVARCHAR(3),
  PRIMARY KEY ([nLinea])
);

-- ===== Almacenes  (filas: 1) =====
CREATE TABLE [Almacenes] (
  [Codigo] NVARCHAR(5),
  [Descripcion] NVARCHAR(30),
  [StContValidoEntradaSN] BOOLEAN NOT NULL,
  [StContValidoConsumoSN] BOOLEAN NOT NULL,
  [StContValidoMovOrigenSN] BOOLEAN NOT NULL,
  [StContValidoMovDestinoSN] BOOLEAN NOT NULL,
  [StContAlmaAcumulacionSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== AlmacenesConfig  (filas: 0) =====
CREATE TABLE [AlmacenesConfig] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [TipoDocumento] NVARCHAR(2) NOT NULL,
  [Prioridad] SMALLINT,
  [Almacen] NVARCHAR(5),
  [AlmacenFabricados] NVARCHAR(5),
  [AlmacenEntrada] NVARCHAR(5),
  PRIMARY KEY ([TipoDoc], [Serie], [Delegacion], [TipoDocumento])
);

-- ===== AMovAlma  (filas: 0) =====
CREATE TABLE [AMovAlma] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Almacen] NVARCHAR(5),
  [Observaciones] NVARCHAR(200),
  [StockActSN] BOOLEAN NOT NULL,
  [StockResSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaPrincipal] NVARCHAR(5),
  [Usuario] NVARCHAR(30),
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [TipoDocumento] NVARCHAR(6),
  [Delegacion] NVARCHAR(2),
  PRIMARY KEY ([Numero])
);

-- ===== AMovAlmaLin  (filas: 0) =====
CREATE TABLE [AMovAlmaLin] (
  [nLin] INTEGER NOT NULL,
  [nMov] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Ancho] REAL,
  [Largo] REAL,
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [TipoES] NVARCHAR(1),
  [Cantidad] REAL,
  [Metraje] REAL,
  [Precio] REAL,
  [Almacen] NVARCHAR(5),
  [AcaTonalidad] NVARCHAR(20),
  [RestoSN] BOOLEAN NOT NULL,
  [Serie] NVARCHAR(1),
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [Lote_Ubicacion] NVARCHAR(10),
  [Lote_UbicacionPosicion] NVARCHAR(10),
  [PesoKg] REAL,
  [PesoKgBruto] REAL,
  [Observaciones] NVARCHAR(80),
  PRIMARY KEY ([nLin])
);

-- ===== APicking  (filas: 0) =====
CREATE TABLE [APicking] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [TipoDocumentoPicking] NVARCHAR(6),
  [NumeroDocumentoPicking] NVARCHAR(20),
  [Delegacion] NVARCHAR(2),
  [Almacen] NVARCHAR(5),
  [Trabajador] NVARCHAR(5),
  [Cliente] NVARCHAR(10),
  [Observaciones] NVARCHAR(200),
  [Prioridad] SMALLINT,
  [CerradoSN] BOOLEAN NOT NULL,
  [CerradoFecha] DATE,
  [NumeroAlbaranGenerado] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== APickingLin  (filas: 0) =====
CREATE TABLE [APickingLin] (
  [nLin] INTEGER NOT NULL,
  [nPicking] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(60),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [NumeroLote] NVARCHAR(30),
  [CantidadSolicitada] REAL,
  [CantidadPreparada] REAL,
  [Observaciones] NVARCHAR(200),
  [nLineaPedidoOrigen] INTEGER,
  PRIMARY KEY ([nLin])
);

-- ===== ARecuentos  (filas: 0) =====
CREATE TABLE [ARecuentos] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Delegacion] NVARCHAR(2),
  [Almacen] NVARCHAR(5),
  [Trabajador] NVARCHAR(5),
  [Observaciones] NVARCHAR(200),
  [CerradoSN] BOOLEAN NOT NULL,
  [CerradoFecha] DATE,
  [NumeroRegularizacion] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== ARecuentosLin  (filas: 0) =====
CREATE TABLE [ARecuentosLin] (
  [nLin] INTEGER NOT NULL,
  [nRecuento] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(60),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [NumeroLote] NVARCHAR(30),
  [Cantidad] REAL,
  [Observaciones] NVARCHAR(200),
  PRIMARY KEY ([nLin])
);

-- ===== ARegularizaciones  (filas: 0) =====
CREATE TABLE [ARegularizaciones] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Almacen] NVARCHAR(5),
  [Observaciones] NVARCHAR(200),
  [StockActSN] BOOLEAN NOT NULL,
  [AperturaEjerSN] BOOLEAN NOT NULL,
  [ReguInventarioSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaPrincipal] NVARCHAR(5),
  [ReguAlmacenCompletoSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [TipoDocumento] NVARCHAR(6),
  [Delegacion] NVARCHAR(2),
  PRIMARY KEY ([Numero])
);

-- ===== ARegularizacionesLin  (filas: 0) =====
CREATE TABLE [ARegularizacionesLin] (
  [nLin] INTEGER NOT NULL,
  [nReg] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Ancho] REAL,
  [Largo] REAL,
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [Almacen] NVARCHAR(5),
  [StockInicial] REAL,
  [StockFinal] REAL,
  [Precio] REAL,
  [RestoSN] BOOLEAN NOT NULL,
  [AcaTonalidad] NVARCHAR(20),
  [ValidaSN] BOOLEAN NOT NULL,
  [ValidaResultado] NVARCHAR,
  [BobinaIncompletaSN] BOOLEAN NOT NULL,
  [Serie] NVARCHAR(1),
  [Metraje] REAL,
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [Lote_PesoKg] REAL,
  [Lote_PesoKgBruto] REAL,
  [Lote_Ubicacion] NVARCHAR(10),
  [Lote_UbicacionPosicion] NVARCHAR(10),
  PRIMARY KEY ([nLin])
);

-- ===== Articulos  (filas: 3120) =====
CREATE TABLE [Articulos] (
  [Codigo] NVARCHAR(15),
  [Familia] NVARCHAR(10),
  [TipoArt] NVARCHAR(3),
  [Componente] NVARCHAR(5),
  [GenericoSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [CosteLBsn] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [ExportaTarSN] BOOLEAN NOT NULL,
  [PrecioTablaSN] BOOLEAN NOT NULL,
  [TipoMetraje] NVARCHAR(3),
  [CdadMetPorEmb] REAL,
  [PrecioKGsn] BOOLEAN NOT NULL,
  [MetrajeMultiploAncho] REAL,
  [MetrajeMultiploLargo] REAL,
  [MetMultBaseL] REAL,
  [MetMultMayorL] REAL,
  [MetrajeMinimo] REAL,
  [CantosSN] BOOLEAN NOT NULL,
  [CantosLargos] SMALLINT,
  [CantosCortos] SMALLINT,
  [PrecioFormulaSN] BOOLEAN NOT NULL,
  [PrecioFormula] NVARCHAR(255),
  [rptEnsambladoSN] BOOLEAN NOT NULL,
  [rptPerfilInt] NVARCHAR(15),
  [rptPerfilExt] NVARCHAR(15),
  [rptPoliam1] NVARCHAR(15),
  [rptPoliam2] NVARCHAR(15),
  [rptArtMO] NVARCHAR(15),
  [HojaCorteSN] BOOLEAN NOT NULL,
  [HojaCorteSepFuncSN] BOOLEAN NOT NULL,
  [OptiActStCPedSN] BOOLEAN NOT NULL,
  [HojaDespieceSN] BOOLEAN NOT NULL,
  [HojaResSN] BOOLEAN NOT NULL,
  [HojaArtSN] BOOLEAN NOT NULL,
  [EtiquetaSN] BOOLEAN NOT NULL,
  [HojaPrepSN] BOOLEAN NOT NULL,
  [CentroMecSN] BOOLEAN NOT NULL,
  [TronzadoraSN] BOOLEAN NOT NULL,
  [CodigoMec] NVARCHAR(15),
  [OptiDtoIni] REAL,
  [OptiDtoFin] REAL,
  [DimProvAcaSN] BOOLEAN NOT NULL,
  [DirVeta] NVARCHAR(1),
  [CosteCalculadoSN] BOOLEAN NOT NULL,
  [PesoML] REAL,
  [Perimetro] REAL,
  [PerimetroInt] REAL,
  [PerimetroExt] REAL,
  [AcaLijaNCaras] SMALLINT,
  [AcaPlastSN] BOOLEAN NOT NULL,
  [AcaPlastNCaras] SMALLINT,
  [Observaciones] NVARCHAR(240),
  [StockSN] BOOLEAN NOT NULL,
  [StockResSN] BOOLEAN NOT NULL,
  [TarifaProvSN] BOOLEAN NOT NULL,
  [AlturaPerfil] REAL,
  [TamJunqGoma] REAL,
  [FamTotFam] NVARCHAR(10),
  [DespunteLonMinOK] REAL,
  [OptiDespunteMin] REAL,
  [OptiDespunteMax] REAL,
  [OrdenHC] SMALLINT,
  [OptinBarrasMult] REAL,
  [TipoIVA] NVARCHAR(2),
  [CompFprecioM2sn] BOOLEAN NOT NULL,
  [CompFprecioM2] REAL,
  [CompFcargoSN] BOOLEAN NOT NULL,
  [compFcargoPVPSN] BOOLEAN NOT NULL,
  [CompFtam] REAL,
  [CompFMedGuiCamEsp] REAL,
  [CompFtamCajGuia] REAL,
  [CompFTGuiaEA] NVARCHAR(1),
  [CompFTGuiaDerEA] NVARCHAR(1),
  [CompFtermFamComp] NVARCHAR(3),
  [CompFsinGuiaSN] BOOLEAN NOT NULL,
  [ExcluirEstadEstrSN] BOOLEAN NOT NULL,
  [DAcrisSN] BOOLEAN NOT NULL,
  [DAfabrSN] BOOLEAN NOT NULL,
  [DAcomponenteSN] BOOLEAN NOT NULL,
  [DAgrosor] SMALLINT,
  [DAArtBase] NVARCHAR(15),
  [DAVid1] NVARCHAR(15),
  [DACam1] NVARCHAR(15),
  [DAVid2] NVARCHAR(15),
  [DACam2] NVARCHAR(15),
  [DAVid3] NVARCHAR(15),
  [DAPerfilInt] NVARCHAR(15),
  [DAcompTipo] NVARCHAR(1),
  [DAcompCodDA] NVARCHAR(5),
  [DAcompDescrDA] NVARCHAR(50),
  [DAcompCamPerf] NVARCHAR(15),
  [DAorden] SMALLINT,
  [FaseEntrega] NVARCHAR(3),
  [DAcompPVPigualSN] BOOLEAN NOT NULL,
  [DAcompPVP] REAL,
  [ABCstock] NVARCHAR(1),
  [prProtegePVPsn] BOOLEAN NOT NULL,
  [CompFejeMotorSN] BOOLEAN NOT NULL,
  [CompFejeDiametro] SMALLINT,
  [CompFpesoKgM2] REAL,
  [soldCodigoSold] NVARCHAR(10),
  [CodigoTron] NVARCHAR(15),
  [GrosorPesoVid] REAL,
  [CompFguiDtoLam] REAL,
  [PesoMLmaximo] REAL,
  [PesoMLmedio] REAL,
  [PesoMLultimo] REAL,
  [PesoMLaplicable] REAL,
  [SoldadoraSN] BOOLEAN NOT NULL,
  [OptiDtoSierra] SMALLINT,
  [MultMetMinAcaSN] BOOLEAN NOT NULL,
  [CompFnOpcAcc] NVARCHAR(2),
  [CompFmotorAnchoMin] SMALLINT,
  [CompFguiaCajSN] BOOLEAN NOT NULL,
  [CompFsinTopesSN] BOOLEAN NOT NULL,
  [CompFlamCodTapon] NVARCHAR(15),
  [CompFlamDtoTapon] SMALLINT,
  [CompFlamConTaponesSN] BOOLEAN NOT NULL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [Descripcion] NVARCHAR(255),
  [margenesArtSN] BOOLEAN NOT NULL,
  [tronFormatoCorte] NVARCHAR(3),
  [CompFdtoAdEje] REAL,
  [CodProvDimSN] BOOLEAN NOT NULL,
  [DespunteFAM_NO_ACA] NVARCHAR(8),
  [compFlamNoCalcCajSN] BOOLEAN NOT NULL,
  [pvpRestarDto_SI_NO_FAM] NVARCHAR(3),
  [ptNoMedInfSN] BOOLEAN NOT NULL,
  [ptNoMedSupSN] BOOLEAN NOT NULL,
  [DimLargo] INTEGER,
  [DimAncho] INTEGER,
  [codigoMecTronAcaSN] BOOLEAN NOT NULL,
  [UbicStock] NVARCHAR(10),
  [PVPCeroEstrSN] BOOLEAN NOT NULL,
  [vidValorU] REAL,
  [vidFactorSolar] REAL,
  [desactivadoSN] BOOLEAN NOT NULL,
  [desactivadoTipoDoc] NVARCHAR(50),
  [ptNoPVPCeroSN] BOOLEAN NOT NULL,
  [PesoProvSN] BOOLEAN NOT NULL,
  [PerimetroProvSN] BOOLEAN NOT NULL,
  [AvisoSN] BOOLEAN NOT NULL,
  [AvisoTipoDoc] NVARCHAR(50),
  [AvisoMsg] NVARCHAR(100),
  [FechaHoraAct] DATE,
  [CLAtarifa] NVARCHAR(5),
  [CLAtipoDto] NVARCHAR(10),
  [CLAgrpAsTarSN] BOOLEAN NOT NULL,
  [CompFTamCajGuiaInf] REAL,
  [CLAgetTarGrpAsTarSN] BOOLEAN NOT NULL,
  [ptSoloMedTablaAnchoSN] BOOLEAN NOT NULL,
  [ptSoloMedTablaLargoSN] BOOLEAN NOT NULL,
  [tldDtoAdEje] SMALLINT,
  [tldDtoAdLona] SMALLINT,
  [TTcalculoPedFabSN] BOOLEAN NOT NULL,
  [DAcalcPVPCompMargenEspSN] BOOLEAN NOT NULL,
  [CompFincrGuiaCM] REAL,
  [CorteSeccion] NVARCHAR(3),
  [OptimizaM2SN] BOOLEAN NOT NULL,
  [DobladoraSN] BOOLEAN NOT NULL,
  [compFcajSinCajSN] BOOLEAN NOT NULL,
  [CompFfuerzaCargoSN] BOOLEAN NOT NULL,
  [FactPorcDividirSN] BOOLEAN NOT NULL,
  [CompFguiNoDtoCajSN] BOOLEAN NOT NULL,
  [StContObligaImputarVPedSN] BOOLEAN NOT NULL,
  [rptProveedor] NVARCHAR(10),
  [TPproveedor] NVARCHAR(10),
  [ProveedorHab] NVARCHAR(10),
  [pvpTipoProv] NVARCHAR(10),
  [CompFguiNoDtoSecCarpSN] BOOLEAN NOT NULL,
  [AliasExportacion] NVARCHAR(15),
  [CentroHerrajesSN] BOOLEAN NOT NULL,
  [centroHerrCodigoArt] NVARCHAR(15),
  [cotaAlaCanalHerraje] REAL,
  [VolumenCalcularSN] BOOLEAN NOT NULL,
  [VolDimAncho] SMALLINT,
  [VolDimAlto] SMALLINT,
  [VolDimFondo] SMALLINT,
  [VolUdsEmbAncho] SMALLINT,
  [VoldUdsEmbAlto] SMALLINT,
  [VolUdsEmbFondo] SMALLINT,
  [Embalaje] NVARCHAR(5),
  [PesoEmbalaje] REAL,
  [BloqueoDimVolPesoEmbalajeSN] BOOLEAN NOT NULL,
  [ActStockSustituyePor] NVARCHAR(15),
  [soldGomaSN] BOOLEAN NOT NULL,
  [CompFlamaCiegaAsoc] NVARCHAR(15),
  [CompFlamCdadTaponesPorLama] REAL,
  [NumeroSerieSN] BOOLEAN NOT NULL,
  [GarantiaSN] BOOLEAN NOT NULL,
  [GarantiaTiempo] SMALLINT,
  [GarantiaTiempoUnidades] NVARCHAR(5),
  [CosteEspecialSN] BOOLEAN NOT NULL,
  [CompFmotorListaLamas] NVARCHAR(255),
  [CompFvaloraSN] BOOLEAN NOT NULL,
  [CompFtipoMotor] NVARCHAR(2),
  [CompFmotorOrden] SMALLINT,
  [fuerzaDimensionesSN] BOOLEAN NOT NULL,
  [fuerzaProvHabitualSN] BOOLEAN NOT NULL,
  [CompFprecioM2aplicaMultipleSN] BOOLEAN NOT NULL,
  [TipoImpuestoRetenido] NVARCHAR(2),
  [PVPErroneoEstrSN] BOOLEAN NOT NULL,
  [ProduccionSeccion] NVARCHAR(10),
  [fuerzaProvHabPesoSN] BOOLEAN NOT NULL,
  [fuerzaProvHabPesoCond] NVARCHAR(2),
  [fuerzaProvHabPeso] REAL,
  [fuerzaDimPesoSN] BOOLEAN NOT NULL,
  [fuerzaDimPesoCond] NVARCHAR(2),
  [fuerzaDimPeso] REAL,
  [fuerzaDimSoloProvHabSN] BOOLEAN NOT NULL,
  [rptTresPerfilesSN] BOOLEAN NOT NULL,
  [TarifaTransformacion] NVARCHAR(1),
  [BobinasSN] BOOLEAN NOT NULL,
  [rptPerfilIntermedio] NVARCHAR(15),
  [rptPoliam3] NVARCHAR(15),
  [rptPoliam4] NVARCHAR(15),
  [IncrementosPrecioSN] BOOLEAN NOT NULL,
  [PackingListSN] BOOLEAN NOT NULL,
  [CLAfechaEntregaEstructuraSN] BOOLEAN NOT NULL,
  [rptArtMObicolor] NVARCHAR(15),
  [OptM2admiteRotacionSN] BOOLEAN NOT NULL,
  [CLAorden] SMALLINT,
  [TipoIVACompras] NVARCHAR(2),
  [CodigoTronSerie] NVARCHAR(15),
  [TipoArticuloImpuesto] NVARCHAR(3),
  [Subfamilia] NVARCHAR(10),
  [Usuario] NVARCHAR(30),
  [DAautoSN] BOOLEAN NOT NULL,
  [TipoArticuloRPT] NVARCHAR(3),
  [PerimetroTotal] REAL,
  [LineaNegocio] NVARCHAR(10),
  [UbicPosicionStock] NVARCHAR(10),
  [MarcaComercial] NVARCHAR(10),
  [Estado] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== ArticulosABCstock  (filas: 0) =====
CREATE TABLE [ArticulosABCstock] (
  [Codigo] NVARCHAR(1),
  [Descripcion] NVARCHAR(40),
  [RotacionDias] SMALLINT,
  [SMDinFactor] REAL,
  [SMDinPeriodoDias] SMALLINT,
  [SMDinFactorReposicion] REAL,
  [SMDinPeriodoDiasRepo] SMALLINT,
  [SMDinFactorExclusion] REAL,
  [SMDinFactorSeguridad] REAL,
  [SMDinFactorEntregaInm] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== ArticulosABCstockMinTipoArt  (filas: 0) =====
CREATE TABLE [ArticulosABCstockMinTipoArt] (
  [ABCstock] NVARCHAR(1) NOT NULL,
  [TipoArt] NVARCHAR(3) NOT NULL,
  [MinimoStockMin] REAL,
  [MinimoStockRepo] REAL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [MinimoStockSeg] REAL,
  PRIMARY KEY ([ABCstock], [TipoArt], [Acabado])
);

-- ===== ArticulosAcabadosValidos  (filas: 0) =====
CREATE TABLE [ArticulosAcabadosValidos] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [OrdenProdWeb] SMALLINT,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosArtAsoc  (filas: 29) =====
CREATE TABLE [ArticulosArtAsoc] (
  [nLinea] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15),
  [AsocA_AL] NVARCHAR(1),
  [AL_MedidaMin] REAL,
  [AL_MedidaMax] REAL,
  [AL_intervalo] REAL,
  [AL_UnidadesMin] REAL,
  [AL_UnidadesMax] REAL,
  [AsocArticulo] NVARCHAR(15),
  [AsocAcabado] NVARCHAR(10),
  [AsocAcabadoOrigSN] BOOLEAN NOT NULL,
  [AsocCantidad] REAL,
  [Descuento] REAL,
  [AsocAcaTonalidad] NVARCHAR(10),
  [AsocCdadIndepSN] BOOLEAN NOT NULL,
  [AsocAcaCompF] NVARCHAR(15),
  [CompFAnulaSi4AccCajSN] BOOLEAN NOT NULL,
  [FiltroMetrajeSN] BOOLEAN NOT NULL,
  [FiltroMetDesde] REAL,
  [FiltroMetHasta] REAL,
  [FormulaCantidadRedondearSN] BOOLEAN NOT NULL,
  [FormulaCantidadNumeroDecimales] SMALLINT,
  [AcabadoAComparar] NVARCHAR(15),
  [Acabado] NVARCHAR,
  [CalcEtiqCorte] NVARCHAR(7),
  [CalcEtiqCorteNumFijo] REAL,
  [ValoracionConfArtAsocSN] BOOLEAN NOT NULL,
  [ValoracionNoComputarCosteSN] BOOLEAN NOT NULL,
  [ValoracionNoComputarVentaSN] BOOLEAN NOT NULL,
  [OPCformulaSelec] NVARCHAR,
  [SoloUnaVezPorEstructuraSN] BOOLEAN NOT NULL,
  [FechaHoraAct] DATE,
  [FormulaAncho] NVARCHAR(200),
  [FormulaLargo] NVARCHAR(200),
  [AL_FormulaDimension] NVARCHAR(200),
  [formulaCantidad] NVARCHAR(200),
  [Estructura] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosBloqueoPVP  (filas: 0) =====
CREATE TABLE [ArticulosBloqueoPVP] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosBloqueoSt  (filas: 0) =====
CREATE TABLE [ArticulosBloqueoSt] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [GenAutoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad])
);

-- ===== ArticulosCadenaClasificacion  (filas: 0) =====
CREATE TABLE [ArticulosCadenaClasificacion] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Tipo] NVARCHAR(15) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100),
  PRIMARY KEY ([Articulo], [Tipo])
);

-- ===== ArticulosCadenaClasificacionCond  (filas: 0) =====
CREATE TABLE [ArticulosCadenaClasificacionCond] (
  [nLinea] INTEGER NOT NULL,
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  [LstAcabados] NVARCHAR,
  [CLAlstEstructurasOrigen] NVARCHAR,
  [CLAusarCadenaEstructuraOrigenSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [CadenaDeClasificacionEstadisticas] NVARCHAR(100),
  [CLAusarRaizOrigenSN] BOOLEAN NOT NULL,
  [CLAusarRaizNumeroNiveles] SMALLINT,
  [CLAusarRaizSufijo] NVARCHAR(100),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosCLAformulaOPCsel  (filas: 0) =====
CREATE TABLE [ArticulosCLAformulaOPCsel] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Estructura] NVARCHAR(60) NOT NULL,
  [FormulaOpcSel] NVARCHAR(255),
  PRIMARY KEY ([Articulo], [Estructura])
);

-- ===== ArticulosCLAGrpAsTar  (filas: 0) =====
CREATE TABLE [ArticulosCLAGrpAsTar] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [GrpAsTar] NVARCHAR(3) NOT NULL,
  [Tarifa] NVARCHAR(5),
  [TipoDto] NVARCHAR(10),
  PRIMARY KEY ([Articulo], [GrpAsTar])
);

-- ===== ArticulosCliDtoConfig  (filas: 4) =====
CREATE TABLE [ArticulosCliDtoConfig] (
  [Orden] SMALLINT NOT NULL,
  [TipoDescuento] NVARCHAR(10) NOT NULL,
  [PararProcesamientoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDescuento])
);

-- ===== ArticulosCodMecTronAca  (filas: 0) =====
CREATE TABLE [ArticulosCodMecTronAca] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [CodigoMec] NVARCHAR(40),
  [CodigoTron] NVARCHAR(40),
  [CodigoSoldadora] NVARCHAR(40),
  [CodigoLimpieza] NVARCHAR(20),
  [ElumatecOption] SMALLINT,
  [ElumatecECW_WW1] REAL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosCodProv  (filas: 85) =====
CREATE TABLE [ArticulosCodProv] (
  [Articulo] NVARCHAR(15),
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10),
  [CdadMetPorEmb] REAL,
  [MetrajeMinPed] REAL,
  [AcaTonalidad] NVARCHAR(255) NOT NULL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [DimLargo] INTEGER NOT NULL,
  [DimAncho] INTEGER NOT NULL,
  [DescrProv] NVARCHAR(255),
  [CodProvEmb] NVARCHAR(40),
  [CodProv] NVARCHAR(40),
  [DescrProvEmb] NVARCHAR(255),
  PRIMARY KEY ([Articulo], [Proveedor], [Acabado], [AcaTonalidad], [DimLargo], [DimAncho])
);

-- ===== ArticulosCompFmotorEjeCondicional  (filas: 0) =====
CREATE TABLE [ArticulosCompFmotorEjeCondicional] (
  [nLinea] INTEGER NOT NULL,
  [ArticuloMotor] NVARCHAR(15),
  [Orden] SMALLINT,
  [lstEstructuras] NVARCHAR(255),
  [lstLamas] NVARCHAR(255),
  [CodigoEje] NVARCHAR(15),
  [AnchoDesde] SMALLINT,
  [AnchoHasta] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosCompFmotorLevanta  (filas: 0) =====
CREATE TABLE [ArticulosCompFmotorLevanta] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [AltoDesde] SMALLINT NOT NULL,
  [AltoHasta] SMALLINT NOT NULL,
  [DiametroEje] SMALLINT NOT NULL,
  [LevantaPesoKg] SMALLINT NOT NULL,
  [CodigoEjeAutomatico] NVARCHAR(15),
  PRIMARY KEY ([Articulo], [AltoDesde], [AltoHasta], [DiametroEje])
);

-- ===== ArticulosCompFmotorMandos  (filas: 0) =====
CREATE TABLE [ArticulosCompFmotorMandos] (
  [nLinea] INTEGER NOT NULL,
  [ArticuloMotor] NVARCHAR(15) NOT NULL,
  [ArticuloMando] NVARCHAR(15),
  [PredeterminadoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosCoste  (filas: 24716) =====
CREATE TABLE [ArticulosCoste] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [UltimaAct] DATE,
  [tmpInfDtoPorc] REAL,
  [CosteVidSinRE] REAL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [CosteNetoSN] BOOLEAN NOT NULL,
  [CosteCalculadoSN] BOOLEAN NOT NULL,
  [CosteCalcTarifaCBorigen] NVARCHAR(3),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [UltimaActCosteDivisaPrincipal] DATE,
  [Gastos] REAL,
  [GastosPorcentaje] REAL,
  [FechaHoraAct] DATE,
  [Coste] DOUBLE,
  [CosteDivisaPrincipal] DOUBLE,
  [CosteConGastos] DOUBLE,
  [CosteConGastosDivisaPrincipal] DOUBLE,
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Proveedor], [Acabado])
);

-- ===== ArticulosCosteAcaTon  (filas: 0) =====
CREATE TABLE [ArticulosCosteAcaTon] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tonalidad] NVARCHAR(10) NOT NULL,
  [Coste] REAL,
  [UltimaAct] DATE,
  [tmpInfDtoPorc] REAL,
  [CosteNetoSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [CosteDivisaPrincipal] REAL,
  [UltimaActCosteDivisaPrincipal] DATE,
  [Gastos] REAL,
  [GastosPorcentaje] REAL,
  [CosteConGastos] REAL,
  [CosteConGastosDivisaPrincipal] REAL,
  PRIMARY KEY ([Articulo], [Proveedor], [Acabado], [Tonalidad])
);

-- ===== ArticulosCosteCalculado  (filas: 748) =====
CREATE TABLE [ArticulosCosteCalculado] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [TarifaCB] NVARCHAR(3) NOT NULL,
  [OrdenCalculo] SMALLINT,
  [CosteBrutoProveedor] NVARCHAR(10),
  [CosteBruto] REAL,
  [CosteBrutoIncrML] REAL,
  [NumeroMatriz] NVARCHAR(15),
  [AcaGrupoFoliado] NVARCHAR(3),
  [AcaPrecioFoliadoML] REAL,
  [CosteCalcSoloAca] NVARCHAR(10),
  [CosteCacaProvCBsn] BOOLEAN NOT NULL,
  [CosteCalcSoloPrvHabSN] BOOLEAN NOT NULL,
  [CosteCalcCBmanualMLSN] BOOLEAN NOT NULL,
  [CosteCalcCBmanAca] NVARCHAR(10),
  [BloqueoIncrML] BOOLEAN NOT NULL,
  [CosteCalcSoloProveedor] NVARCHAR(10),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [CosteBrutoDivisaPrincipal] REAL,
  [UltimaActCosteBrutoDivisaPrincipal] DATE,
  PRIMARY KEY ([Articulo], [TarifaCB])
);

-- ===== ArticulosCosteGastosCategorias  (filas: 0) =====
CREATE TABLE [ArticulosCosteGastosCategorias] (
  [Nombre] NVARCHAR(20) NOT NULL,
  [CalcularGastosSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Nombre])
);

-- ===== ArticulosCosteGastosConfig  (filas: 0) =====
CREATE TABLE [ArticulosCosteGastosConfig] (
  [nLinea] INTEGER NOT NULL,
  [Categoria] NVARCHAR(20) NOT NULL,
  [Familia] NVARCHAR(10),
  [Articulo] NVARCHAR(15),
  [Proveedor] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [PorcentajeGastos] REAL,
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosCosteMed  (filas: 0) =====
CREATE TABLE [ArticulosCosteMed] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [CosteMed] REAL,
  [FechaCalculo] DATE,
  [TipoCosteCalculado] NVARCHAR(20),
  [CosteMedSinGastos] REAL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosCosteMedPeriodo  (filas: 0) =====
CREATE TABLE [ArticulosCosteMedPeriodo] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Periodo] NVARCHAR(3) NOT NULL,
  [CosteMed] REAL,
  [Almacen] NVARCHAR(5) NOT NULL,
  [TipoCosteCalculado] NVARCHAR(20),
  [FechaCalculo] DATE,
  [CosteMedSinGastos] REAL,
  PRIMARY KEY ([Articulo], [Acabado], [Almacen], [Periodo])
);

-- ===== ArticulosCosteMedPorAlmacen  (filas: 0) =====
CREATE TABLE [ArticulosCosteMedPorAlmacen] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Almacen] NVARCHAR(5) NOT NULL,
  [CosteMed] REAL,
  [FechaCalculo] DATE,
  [TipoCosteCalculado] NVARCHAR(20),
  [CosteMedSinGastos] REAL,
  PRIMARY KEY ([Articulo], [Acabado], [Almacen])
);

-- ===== ArticulosCosteTar  (filas: 0) =====
CREATE TABLE [ArticulosCosteTar] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Coste] REAL,
  [CosteNetoSN] BOOLEAN NOT NULL,
  [UltimaAct] DATE,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [CosteDivisaPrincipal] REAL,
  [UltimaActCosteDivisaPrincipal] DATE,
  PRIMARY KEY ([Articulo], [Proveedor], [Tarifa], [Acabado])
);

-- ===== ArticulosCosteTarAcaTon  (filas: 0) =====
CREATE TABLE [ArticulosCosteTarAcaTon] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tonalidad] NVARCHAR(10) NOT NULL,
  [Coste] REAL,
  [CosteNetoSN] BOOLEAN NOT NULL,
  [UltimaAct] DATE,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [CosteDivisaPrincipal] REAL,
  [UltimaActCosteDivisaPrincipal] DATE,
  PRIMARY KEY ([Articulo], [Proveedor], [Tarifa], [Acabado], [Tonalidad])
);

-- ===== ArticulosDAcompMargenEspecial  (filas: 0) =====
CREATE TABLE [ArticulosDAcompMargenEspecial] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [margen] REAL,
  PRIMARY KEY ([Articulo], [Tarifa])
);

-- ===== ArticulosDAcoste  (filas: 0) =====
CREATE TABLE [ArticulosDAcoste] (
  [Articulo] NVARCHAR(15),
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10),
  [Coste] REAL,
  PRIMARY KEY ([Articulo], [Proveedor], [Acabado])
);

-- ===== ArticulosDApvp  (filas: 0) =====
CREATE TABLE [ArticulosDApvp] (
  [Articulo] NVARCHAR(15),
  [Tarifa] NVARCHAR(5) NOT NULL,
  [PVP] REAL,
  PRIMARY KEY ([Articulo], [Tarifa])
);

-- ===== ArticulosDatosAuxiliares  (filas: 3119) =====
CREATE TABLE [ArticulosDatosAuxiliares] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [BarrotilloAncho] REAL,
  [BarrotilloDtoPuntaLanza] REAL,
  [BarrCrucetaTamaño] REAL,
  [BarrIntercalarioDescuento] REAL,
  [MecMultiSN] BOOLEAN NOT NULL,
  [MecMultiAncho] REAL,
  [MecFOMmarca] NVARCHAR(40),
  [MecFOMserie] NVARCHAR(50),
  [MecEmmegiCodSerie] NVARCHAR(15),
  [mecInvertirAngSN] BOOLEAN NOT NULL,
  [TronValorIng1] REAL,
  [TronValorIng2] REAL,
  [TronValorRecto] REAL,
  [TronMedidaExtInt] NVARCHAR(1),
  [TronFuncionSN] BOOLEAN NOT NULL,
  [TronInvertirAngSN] BOOLEAN NOT NULL,
  [DisVidBarrDescr] NVARCHAR(10),
  [CompFcargoSoloEstructuras] NVARCHAR(255),
  [CompFcargoSoloAcabados] NVARCHAR(255),
  [CompFcargoSoloFamEstructuras] NVARCHAR(255),
  [ComprasRepercutirGastosSN] BOOLEAN NOT NULL,
  [StockM2SoloDimensionesEstandarSN] BOOLEAN NOT NULL,
  [CompFmotorCodigoEjeCondicionalSN] BOOLEAN NOT NULL,
  [DescripcionTronzadora] NVARCHAR(255),
  [DimensionesMaximasSN] BOOLEAN NOT NULL,
  [DimMaxAnchoMin] REAL,
  [DimMaxAnchoMax] REAL,
  [DimMaxAltoMin] REAL,
  [DimMaxAltoMax] REAL,
  [DimMaxAvisoSN] BOOLEAN NOT NULL,
  [DimMaxBloqueoSN] BOOLEAN NOT NULL,
  [DimMaxAviso] NVARCHAR(255),
  [CPedAutoExcluirSN] BOOLEAN NOT NULL,
  [CompFlamNoLamaCiegaSN] BOOLEAN NOT NULL,
  [DescripcionProduccion] NVARCHAR(255),
  [PesoM2dimensionesLineaSN] BOOLEAN NOT NULL,
  [CompFlamSinTaponesSN] BOOLEAN NOT NULL,
  [CompFlamDtoTaponNoTerminalSN] BOOLEAN NOT NULL,
  [ArticuloBloqueoPVPsn] BOOLEAN NOT NULL,
  [ForfaitSN] BOOLEAN NOT NULL,
  [DescripcionPackingList] NVARCHAR(255),
  [NombreDimensionAncho] NVARCHAR(20),
  [NombreDimensionAlto] NVARCHAR(20),
  [CPedTipoPedidoML] NVARCHAR(15),
  [ProdWebPublicoSN] BOOLEAN NOT NULL,
  [ProdWebPrecioManualSN] BOOLEAN NOT NULL,
  [ProdWebDescripcionManualSN] BOOLEAN NOT NULL,
  [ProdWebInformacion] NVARCHAR,
  [ProdWebInformacionAdicional] NVARCHAR,
  [fuerzaDimensionesStdVentasSN] BOOLEAN NOT NULL,
  [VentaCosteManualObligatorioSN] BOOLEAN NOT NULL,
  [StockLotesSN] BOOLEAN NOT NULL,
  [BobinaKilosSN] BOOLEAN NOT NULL,
  [BobinaKgAncho] REAL,
  [BobinaKgMetrosPorKg] REAL,
  [DimEspesor] REAL,
  [TarifaDinamicaSN] BOOLEAN NOT NULL,
  [TarDinTipoArticulo] NVARCHAR(10),
  [TarDinTamañoArticulo] NVARCHAR(10),
  [TarDinGrupoIncrementos] NVARCHAR(10),
  [IngorarUdsEmbProveedorSN] BOOLEAN NOT NULL,
  [PVPCeroEstrSoloEnTarifas] NVARCHAR(20),
  [TipoBulto] NVARCHAR(10),
  [TipoMercancia] NVARCHAR(10),
  [IncrementoPreciosPorProveedorSN] BOOLEAN NOT NULL,
  [fuerzaUsuarioSelDimensionComprasSN] BOOLEAN NOT NULL,
  [ActStockLineasValSinCosteSN] BOOLEAN NOT NULL,
  [StockNoAdmiteNegativoSN] BOOLEAN NOT NULL,
  [CLAimpuestoEstructuraSN] BOOLEAN NOT NULL,
  [NumeroSerieAutoSN] BOOLEAN NOT NULL,
  [NumeroSeriePrefijo] NVARCHAR(10),
  [NumeroSerieAncho] SMALLINT,
  [TarDinFormulaPrecioUdMetraje] NVARCHAR(50),
  [CompFmotorAnchoPorEstructuraSN] BOOLEAN NOT NULL,
  [PrecioDtoManSinNotificarSN] BOOLEAN NOT NULL,
  [TarDinVPedAlbActualizaPVPLoteSN] BOOLEAN NOT NULL,
  [StockLotesCompraVentaSN] BOOLEAN NOT NULL,
  [PermiteAñadirABorradorEnTTSN] BOOLEAN NOT NULL,
  [StockMinDimensionesSN] BOOLEAN NOT NULL,
  [StVentasPendResumidasSN] BOOLEAN NOT NULL,
  [StFabricacionesPendResumidasSN] BOOLEAN NOT NULL,
  [DespunteMinMaxPorAcabadoSN] BOOLEAN NOT NULL,
  [DAvalorU] REAL,
  [StockLotesConsumoAsignaAutoSN] BOOLEAN NOT NULL,
  [tldLonaFuerzaIncrDobladilloEnCorteDsn] BOOLEAN NOT NULL,
  [StockLotesVPEDAsignaAutoSN] BOOLEAN NOT NULL,
  [StockLotesVPEDAsignaAutoSufijoLote] NVARCHAR(5),
  [StockLotesNoComputaCosteSN] BOOLEAN NOT NULL,
  [CPedAutoExcluirDespieceSN] BOOLEAN NOT NULL,
  [CPedAutoExcluirCLAsn] BOOLEAN NOT NULL,
  [OptiEstrategiasGrupos] NVARCHAR(100),
  [InformeMaterialesSN] BOOLEAN NOT NULL,
  [CompFmotorAlturaMinimaCajon] REAL,
  [CLAformulaOpcSelSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo])
);

-- ===== ArticulosDespAca  (filas: 0) =====
CREATE TABLE [ArticulosDespAca] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad])
);

-- ===== ArticulosDespunteAca  (filas: 0) =====
CREATE TABLE [ArticulosDespunteAca] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [OptiDespunteMin] REAL,
  [OptiDespunteMax] REAL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosEquivalentes  (filas: 0) =====
CREATE TABLE [ArticulosEquivalentes] (
  [ArticuloPrincipal] NVARCHAR(60) NOT NULL,
  [ArticuloEquivalente] NVARCHAR(60) NOT NULL,
  [Orden] SMALLINT,
  [Observaciones] NVARCHAR(100),
  PRIMARY KEY ([ArticuloPrincipal], [ArticuloEquivalente])
);

-- ===== ArticulosES  (filas: 0) =====
CREATE TABLE [ArticulosES] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(4),
  [nDoc] NVARCHAR(20),
  [Almacen] NVARCHAR(5),
  [Fecha] DATE,
  [TipoES] NVARCHAR(1),
  [Articulo] NVARCHAR(15),
  [Ancho] REAL,
  [Largo] REAL,
  [Acabado] NVARCHAR(10),
  [Cantidad] REAL,
  [Metraje] REAL,
  [Precio] REAL,
  [RestoSN] BOOLEAN NOT NULL,
  [ReguAptEjerSN] BOOLEAN NOT NULL,
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  [IdContenedor] INTEGER,
  [PrecioCosteFIFO] REAL,
  [PrecioCosteFIFOdetalle] NVARCHAR(40),
  [CAlbTransf_E_precioAcabado] REAL,
  [CodProv] NVARCHAR(10),
  [PuestaCeroSN] BOOLEAN NOT NULL,
  [BobinaIncompletaSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [PrecioDivisaPrincipal] REAL,
  [GastosDivisaPrincipal] REAL,
  [PrecioConGastosDivisaPrincipal] REAL,
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [ImportadoSN] BOOLEAN NOT NULL,
  [FechaImportado] DATE,
  [Serie] NVARCHAR(1),
  [CeroAlmacenCompletoSN] BOOLEAN NOT NULL,
  [PrecioUltimaAct] DATE,
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [OFautoConsumoSN] BOOLEAN NOT NULL,
  [Lote_PesoKg] REAL,
  [Lote_PesoKgBruto] REAL,
  [PrecioConGastosParaCosteLotes] REAL,
  [PrecioConGastosParaCosteLotesUltimaAct] DATE,
  [Lote_UnidadesEmbalajeOriginal] NVARCHAR(6),
  [Lote_UdsEmbCantidadOriginal] REAL,
  [Lote_CdadMetPorEmbOriginal] REAL,
  [Lote_NumeroLineaVPedOrigen] INTEGER,
  [Lote_TipoContenedor] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosEstados  (filas: 1) =====
CREATE TABLE [ArticulosEstados] (
  [Estado] NVARCHAR(40) NOT NULL,
  [Observaciones] NVARCHAR,
  PRIMARY KEY ([Estado])
);

-- ===== ArticulosIncrPrecio  (filas: 0) =====
CREATE TABLE [ArticulosIncrPrecio] (
  [nLin] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15),
  [TipoMetMed] NVARCHAR(10),
  [MetrajeDesde] REAL,
  [MetrajeHasta] REAL,
  [IncrementoPorc] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== ArticulosIncrPrecioProveedor  (filas: 0) =====
CREATE TABLE [ArticulosIncrPrecioProveedor] (
  [nLin] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [TipoMetMed] NVARCHAR(10) NOT NULL,
  [MetrajeDesde] REAL,
  [MetrajeHasta] REAL,
  [IncrementoPorc] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== ArticulosInfoWebCond  (filas: 0) =====
CREATE TABLE [ArticulosInfoWebCond] (
  [nLinea] INTEGER NOT NULL,
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  [Articulo] NVARCHAR(60),
  [ProdWebInformacion] NVARCHAR,
  [ProdWebInformacionAdicional] NVARCHAR,
  [TituloFicheroDoc] NVARCHAR(80),
  [NombreFicheroDoc] NVARCHAR(150),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosInfoWebRelacionados  (filas: 0) =====
CREATE TABLE [ArticulosInfoWebRelacionados] (
  [ArticuloPrincipal] NVARCHAR(60) NOT NULL,
  [ArticuloRelacionado] NVARCHAR(60) NOT NULL,
  PRIMARY KEY ([ArticuloPrincipal], [ArticuloRelacionado])
);

-- ===== ArticulosLB  (filas: 17650) =====
CREATE TABLE [ArticulosLB] (
  [Articulo] NVARCHAR(15),
  [Proveedor] NVARCHAR(10),
  [Acabado] NVARCHAR(10),
  [DirVeta] NVARCHAR(1),
  [nLin] INTEGER NOT NULL,
  [DimLargo] INTEGER,
  [DimAncho] INTEGER,
  [NoOptimizacion] BOOLEAN NOT NULL,
  [OrdenVentas] SMALLINT,
  PRIMARY KEY ([nLin])
);

-- ===== ArticulosMargenEspecial  (filas: 0) =====
CREATE TABLE [ArticulosMargenEspecial] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [margen] REAL,
  [BloqueoPVPsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Tarifa])
);

-- ===== ArticulosMM  (filas: 0) =====
CREATE TABLE [ArticulosMM] (
  [Articulo] NVARCHAR(15),
  [Proveedor] NVARCHAR(10) NOT NULL,
  [MultiploAncho] REAL,
  [MultiploLargo] REAL,
  [MetrajeMinimo] REAL,
  PRIMARY KEY ([Articulo], [Proveedor])
);

-- ===== ArticulosMMaca  (filas: 0) =====
CREATE TABLE [ArticulosMMaca] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [MultiploAncho] REAL,
  [MultiploLargo] REAL,
  [MetrajeMinimo] REAL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosPartidasArancelarias  (filas: 0) =====
CREATE TABLE [ArticulosPartidasArancelarias] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Pais] NVARCHAR(10) NOT NULL,
  [PartidaArancelaria] NVARCHAR(20),
  PRIMARY KEY ([Articulo], [Pais])
);

-- ===== ArticulosPerimetroProv  (filas: 0) =====
CREATE TABLE [ArticulosPerimetroProv] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [perimetro] REAL,
  PRIMARY KEY ([Articulo], [Proveedor])
);

-- ===== ArticulosPesoProv  (filas: 0) =====
CREATE TABLE [ArticulosPesoProv] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [pesoML] REAL,
  PRIMARY KEY ([Articulo], [Proveedor])
);

-- ===== ArticulosPrecioTabla  (filas: 361) =====
CREATE TABLE [ArticulosPrecioTabla] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [UltimaActCosteDivisaPrincipal] DATE,
  [Gastos] REAL,
  [GastosPorcentaje] REAL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Divisa] NVARCHAR(5),
  [CosteNetoSN] BOOLEAN NOT NULL,
  [UltimaAct] DATE,
  [Coste] DOUBLE,
  [CosteDivisaPrincipal] DOUBLE,
  [CosteConGastos] DOUBLE,
  [CosteConGastosDivisaPrincipal] DOUBLE,
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Proveedor], [Acabado], [Ancho], [Largo])
);

-- ===== ArticulosPrecioTablaConfiguracion  (filas: 2) =====
CREATE TABLE [ArticulosPrecioTablaConfiguracion] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [AnchoIni] REAL,
  [AnchoFin] REAL,
  [IntervaloAncho] REAL,
  [LargoIni] REAL,
  [LargoFin] REAL,
  [IntervaloLargo] REAL,
  PRIMARY KEY ([Articulo])
);

-- ===== ArticulosPrecioTablaPVP  (filas: 1083) =====
CREATE TABLE [ArticulosPrecioTablaPVP] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [Ancho] REAL NOT NULL,
  [Largo] REAL NOT NULL,
  [UltimaAct] DATE,
  [PVP] DOUBLE,
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [Tarifa], [Ancho], [Largo])
);

-- ===== ArticulosProvDtoConfig  (filas: 5) =====
CREATE TABLE [ArticulosProvDtoConfig] (
  [Orden] SMALLINT NOT NULL,
  [TipoDescuento] NVARCHAR(10) NOT NULL,
  [PararProcesamientoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDescuento])
);

-- ===== ArticulosProvHab  (filas: 0) =====
CREATE TABLE [ArticulosProvHab] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [ProveedorHab] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad])
);

-- ===== ArticulosProvHabCompra  (filas: 0) =====
CREATE TABLE [ArticulosProvHabCompra] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [ProveedorHab] NVARCHAR(20),
  PRIMARY KEY ([Articulo], [Delegacion], [Acabado], [AcaTonalidad])
);

-- ===== ArticulosProvHabPedRepo  (filas: 0) =====
CREATE TABLE [ArticulosProvHabPedRepo] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Almacen] NVARCHAR(5) NOT NULL,
  [ProveedorHab] NVARCHAR(10),
  [DesdeOtroAlmacen] NVARCHAR(5),
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [Almacen], [AcaTonalidad])
);

-- ===== ArticulosPVP  (filas: 58076) =====
CREATE TABLE [ArticulosPVP] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Tarifa] NVARCHAR(5) NOT NULL,
  [UltimaAct] DATE,
  [BloqueoPVPsn] BOOLEAN NOT NULL,
  [FechaHoraAct] DATE,
  [PVP] DOUBLE,
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [Tarifa])
);

-- ===== ArticulosRecEn  (filas: 0) =====
CREATE TABLE [ArticulosRecEn] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Medidas] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Subfamilia], [Medidas])
);

-- ===== ArticulosRecEnC  (filas: 0) =====
CREATE TABLE [ArticulosRecEnC] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Medidas] NVARCHAR(10) NOT NULL,
  [Prioridad] SMALLINT,
  [Articulo] NVARCHAR(15),
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Proveedor], [Familia], [Subfamilia], [Medidas])
);

-- ===== ArticulosReservaStock  (filas: 0) =====
CREATE TABLE [ArticulosReservaStock] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nOF] NVARCHAR(20),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Cdad] REAL,
  [Almacen] NVARCHAR(5),
  [AcaTonalidad] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosRPTaca  (filas: 0) =====
CREATE TABLE [ArticulosRPTaca] (
  [Articulo] NVARCHAR(15),
  [AcaInt] NVARCHAR(10),
  [AcaExt] NVARCHAR(10),
  [AcaRPT] NVARCHAR(10),
  [nLinea] INTEGER NOT NULL,
  [AcaIntermedio] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosStock  (filas: 2) =====
CREATE TABLE [ArticulosStock] (
  [Articulo] NVARCHAR(15),
  [Ancho] REAL,
  [Largo] REAL,
  [Acabado] NVARCHAR(10),
  [Almacen] NVARCHAR(5),
  [Stock] REAL,
  [MetrajeSt] REAL,
  [PrecioCosteVal] REAL,
  [RestoSN] BOOLEAN NOT NULL,
  [idResto] INTEGER,
  [RestoReservSN] BOOLEAN NOT NULL,
  [IdPedRes] INTEGER,
  [ComprasPendtes] REAL,
  [VentasPendtes] REAL,
  [Reservas] REAL,
  [TipoDocRes] NVARCHAR(6),
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [PrecioCosteValTipo] NVARCHAR(15),
  [BobinaIncompletaSN] BOOLEAN NOT NULL,
  [FabricacionesPendtes] REAL,
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [Lote_Ubicacion] NVARCHAR(10),
  [Lote_UbicacionPosicion] NVARCHAR(10),
  [Lote_FechaCaducidad] DATE,
  [Lote_TipoNumero] NVARCHAR(10),
  [Lote_Precio] REAL,
  [Lote_PrecioConGastos] REAL,
  [Lote_PrecioUltimaAct] DATE,
  [NumeroLoteProveedor] NVARCHAR(30),
  [MetrajeComprasPendtes] REAL,
  [MetrajeVentasPendtes] REAL,
  [MetrajeFabricacionesPendtes] REAL,
  [Lote_CantidadOriginal] REAL,
  [Lote_MetrajeOriginal] REAL,
  [Lote_CantidadEtiquetas] SMALLINT,
  [Lote_PesoKg] REAL,
  [Lote_PesoKgBruto] REAL,
  [Lote_PesoKgOriginal] REAL,
  [Lote_PesoKgBrutoOriginal] REAL,
  [LotesAsignadosCantidadDocumentos] SMALLINT,
  [LotesAsignadosMetraje] REAL,
  [LotesAsignadosNumerosDocumentos] NVARCHAR(100),
  [NumeroOFRes] NVARCHAR(20),
  [Lote_CalculadoValorSN] BOOLEAN NOT NULL,
  [Lote_CalculadoValorFecha] DATE,
  [Lote_FechaCreacion] DATE,
  [Lote_NoAsignarAutoSN] BOOLEAN NOT NULL,
  [Lote_PesoKgRecibido] REAL,
  [Lote_UnidadesEmbalajeOriginal] NVARCHAR(6),
  [Lote_UdsEmbCantidadOriginal] REAL,
  [Lote_CdadMetPorEmbOriginal] REAL,
  [Lote_NumeroLineaVPedOrigen] INTEGER,
  [Lote_Descripcion] NVARCHAR(200),
  [Lote_Observaciones] NVARCHAR,
  [Lote_TipoContenedor] NVARCHAR(5),
  PRIMARY KEY ([Articulo], [Ancho], [Largo], [Acabado], [AcaTonalidad], [Proveedor], [Almacen], [NumeroLote])
);

-- ===== ArticulosStockIdInventario  (filas: 0) =====
CREATE TABLE [ArticulosStockIdInventario] (
  [IdInventario] INTEGER NOT NULL,
  [FechaCreacion] DATE,
  [Descripcion] NVARCHAR(100),
  [Usuario] NVARCHAR(30),
  [FiltrosAplicados] NVARCHAR,
  [ValoracionAplicada] NVARCHAR,
  PRIMARY KEY ([IdInventario])
);

-- ===== ArticulosStockInvent  (filas: 0) =====
CREATE TABLE [ArticulosStockInvent] (
  [Articulo] NVARCHAR(15),
  [Ancho] REAL,
  [Largo] REAL,
  [Acabado] NVARCHAR(10),
  [Almacen] NVARCHAR(5),
  [Stock] REAL,
  [MetrajeSt] REAL,
  [PrecioCosteVal] REAL,
  [RestoSN] BOOLEAN NOT NULL,
  [idResto] INTEGER,
  [ComprasPendtes] REAL,
  [VentasPendtes] REAL,
  [Reservas] REAL,
  [TipoDocRes] NVARCHAR(6),
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  [RestoReservSN] BOOLEAN NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [PrecioCosteValTipo] NVARCHAR(15),
  [BobinaIncompletaSN] BOOLEAN NOT NULL,
  [IdInventario] INTEGER NOT NULL,
  [FabricacionesPendtes] REAL,
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [Lote_Ubicacion] NVARCHAR(10),
  [Lote_UbicacionPosicion] NVARCHAR(10),
  [Lote_FechaCaducidad] DATE,
  [Lote_TipoNumero] NVARCHAR(10),
  [Lote_Precio] REAL,
  [Lote_PrecioConGastos] REAL,
  [Lote_PrecioUltimaAct] DATE,
  [MetrajeComprasPendtes] REAL,
  [MetrajeVentasPendtes] REAL,
  [MetrajeFabricacionesPendtes] REAL,
  [LotesAsignadosCantidadDocumentos] SMALLINT,
  [LotesAsignadosMetraje] REAL,
  [LotesAsignadosNumerosDocumentos] NVARCHAR(100),
  [Lote_CantidadOriginal] REAL,
  [Lote_MetrajeOriginal] REAL,
  [Lote_CantidadEtiquetas] SMALLINT,
  [Lote_PesoKg] REAL,
  [Lote_PesoKgBruto] REAL,
  [Lote_PesoKgOriginal] REAL,
  [Lote_PesoKgBrutoOriginal] REAL,
  [Lote_NoAsignarAutoSN] BOOLEAN NOT NULL,
  [Lote_UnidadesEmbalajeOriginal] NVARCHAR(6),
  [Lote_UdsEmbCantidadOriginal] REAL,
  [Lote_CdadMetPorEmbOriginal] REAL,
  [Lote_NumeroLineaVPedOrigen] INTEGER,
  [Lote_CalculadoValorSN] BOOLEAN NOT NULL,
  [Lote_CalculadoValorFecha] DATE,
  [Lote_Descripcion] NVARCHAR(200),
  [Lote_Observaciones] NVARCHAR,
  PRIMARY KEY ([IdInventario], [Articulo], [Ancho], [Largo], [Acabado], [AcaTonalidad], [Proveedor], [Almacen], [NumeroLote])
);

-- ===== ArticulosStockLoteHistorialUbic  (filas: 0) =====
CREATE TABLE [ArticulosStockLoteHistorialUbic] (
  [nLinea] INTEGER NOT NULL,
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [Fecha] DATE,
  [UbicacionOrigen] NVARCHAR(10),
  [PosicionOrigen] NVARCHAR(10),
  [UbicacionDestino] NVARCHAR(10),
  [PosicionDestino] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosStockLotesAsignados  (filas: 0) =====
CREATE TABLE [ArticulosStockLotesAsignados] (
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [CantidadAsignada] REAL,
  [MetrajeAsignado] REAL,
  [TipoDocumento] NVARCHAR(4) NOT NULL,
  [NumeroDocumento] NVARCHAR(15) NOT NULL,
  PRIMARY KEY ([NumeroLote], [TipoDocumento], [NumeroDocumento])
);

-- ===== ArticulosStockLotesEtiquetasTmp  (filas: 0) =====
CREATE TABLE [ArticulosStockLotesEtiquetasTmp] (
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [NumeroEtiqueta] SMALLINT NOT NULL,
  PRIMARY KEY ([NumeroLote], [NumeroEtiqueta])
);

-- ===== ArticulosStockLotesUltimaInfo  (filas: 0) =====
CREATE TABLE [ArticulosStockLotesUltimaInfo] (
  [Almacen] NVARCHAR(5) NOT NULL,
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [Lote_Ubicacion] NVARCHAR(10),
  [Lote_UbicacionPosicion] NVARCHAR(10),
  [Lote_FechaCaducidad] DATE,
  [Lote_TipoNumero] NVARCHAR(10),
  [Lote_Precio] REAL,
  [Lote_PrecioConGastos] REAL,
  [Lote_PrecioUltimaAct] DATE,
  [NumeroLoteProveedor] NVARCHAR(30),
  [InfoUltimaAct] DATE,
  [Lote_Descripcion] NVARCHAR(200),
  [Lote_Observaciones] NVARCHAR,
  PRIMARY KEY ([Almacen], [NumeroLote])
);

-- ===== ArticulosStockMin  (filas: 0) =====
CREATE TABLE [ArticulosStockMin] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [StockMin] REAL,
  [StockReposicion] REAL,
  [Almacen] NVARCHAR(5) NOT NULL,
  [SMDinFactor] REAL,
  [SMDinPeriodoDias] SMALLINT,
  [SMDinFactorReposicion] REAL,
  [SMDinPeriodoDiasRepo] SMALLINT,
  [SMDinBloqueoSN] BOOLEAN NOT NULL,
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  [SMDinNoCalcularSN] BOOLEAN NOT NULL,
  [StockSeguridad] REAL,
  [SMDinFactorSeguridad] REAL,
  [ControlRoturaSN] BOOLEAN NOT NULL,
  [SMDinPeriodoDiasPostAñoAnt] SMALLINT,
  [Ancho] REAL NOT NULL,
  [Largo] REAL NOT NULL,
  [TipoDocReposicion] NVARCHAR(4),
  [MetrajePedidoMinimo] REAL,
  [MetrajePedidoMaximo] REAL,
  PRIMARY KEY ([Almacen], [Articulo], [Acabado], [AcaTonalidad], [Ancho], [Largo])
);

-- ===== ArticulosStockMinDinHst  (filas: 0) =====
CREATE TABLE [ArticulosStockMinDinHst] (
  [Almacen] NVARCHAR(5) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Fecha] DATE NOT NULL,
  [MetrajeVentas] REAL,
  [StockMinCalculado] REAL,
  [StockRepCalculado] REAL,
  [MetrajeExclusion] REAL,
  [ConsumoDia_PtoPed] REAL,
  [ConsumoDia_Repo] REAL,
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  [StockSeguridad] REAL,
  [MetrajeMaxEntregaInm] REAL,
  [MetrajeVentas_PostAñoAnt] REAL,
  [ConsumoDia_PostAñoAnt] REAL,
  [ConsumoDia_Calculo_PtoPed] REAL,
  [ConsumoDia_Calculo_Repo] REAL,
  [PlazoEntregaProveedorDias] SMALLINT,
  PRIMARY KEY ([Almacen], [Articulo], [Acabado], [AcaTonalidad], [Fecha])
);

-- ===== ArticulosStockRecalcular  (filas: 0) =====
CREATE TABLE [ArticulosStockRecalcular] (
  [CalcularVentasPend] BOOLEAN NOT NULL,
  [CalcularComprasPend] BOOLEAN NOT NULL,
  [CalcularFabricacionesPend] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [CalcularReservas] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosStockRecalcularLotesAsig  (filas: 0) =====
CREATE TABLE [ArticulosStockRecalcularLotesAsig] (
  [NumeroLote] NVARCHAR(30) NOT NULL,
  [CalcularLotesAsignados] BOOLEAN NOT NULL,
  PRIMARY KEY ([NumeroLote])
);

-- ===== ArticulosStockResTransfAuto  (filas: 0) =====
CREATE TABLE [ArticulosStockResTransfAuto] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [Almacen] NVARCHAR(5),
  [TipoDoc] NVARCHAR(6),
  [nDoc] NVARCHAR(20) NOT NULL,
  [CdadReserva] REAL,
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad], [Ancho], [Largo], [Almacen], [TipoDoc], [nDoc])
);

-- ===== ArticulosStockTRes  (filas: 0) =====
CREATE TABLE [ArticulosStockTRes] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [MetrajeRes] REAL,
  [AcaTonalidad] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad])
);

-- ===== ArticulosSubFam  (filas: 2250) =====
CREATE TABLE [ArticulosSubFam] (
  [Articulo] NVARCHAR(15),
  [Familia] NVARCHAR(10) NOT NULL,
  [insAutoSN] BOOLEAN NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Articulo], [Familia], [Subfamilia])
);

-- ===== ArticulosTCbruto  (filas: 1) =====
CREATE TABLE [ArticulosTCbruto] (
  [Tarifa] NVARCHAR(3),
  [Descripcion] NVARCHAR(30),
  [Proveedor] NVARCHAR(10),
  [CosteBruto] REAL,
  [IncrPesoPorc] REAL,
  [AcaEspecificosSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [PesoUsar_PXDUA] NVARCHAR(15),
  [IncrCosteML] REAL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [CosteBrutoDivisaPrincipal] REAL,
  [UltimaActCosteBrutoDivisaPrincipal] DATE,
  [CalcSoloProveedor] NVARCHAR(10),
  PRIMARY KEY ([Tarifa])
);

-- ===== ArticulosTCbrutoAcabados  (filas: 0) =====
CREATE TABLE [ArticulosTCbrutoAcabados] (
  [TCbruto] NVARCHAR(3) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([TCbruto], [Acabado])
);

-- ===== ArticulosTCbrutoHistorial  (filas: 0) =====
CREATE TABLE [ArticulosTCbrutoHistorial] (
  [nLinea] INTEGER NOT NULL,
  [TCBruto] NVARCHAR(3) NOT NULL,
  [Fecha] DATE,
  [PrecioKg] REAL,
  [Divisa] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosTipos  (filas: 1) =====
CREATE TABLE [ArticulosTipos] (
  [Codigo] NVARCHAR(3),
  [Descripcion] NVARCHAR(30),
  [Margen1] REAL,
  [Margen2] REAL,
  [Margen3] REAL,
  [Margen4] REAL,
  [Margen5] REAL,
  [Margen6] REAL,
  [Margen7] REAL,
  [Margen8] REAL,
  [ExportaTarSN] BOOLEAN NOT NULL,
  [ColorTipo] INTEGER,
  PRIMARY KEY ([Codigo])
);

-- ===== ArticulosTiposCond  (filas: 0) =====
CREATE TABLE [ArticulosTiposCond] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [TipoArticulo] NVARCHAR(3),
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosTiposRPT  (filas: 0) =====
CREATE TABLE [ArticulosTiposRPT] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(30),
  PRIMARY KEY ([Codigo])
);

-- ===== ArticulosTTFabricacion  (filas: 0) =====
CREATE TABLE [ArticulosTTFabricacion] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Fase] NVARCHAR(3) NOT NULL,
  [Subfase] NVARCHAR(3) NOT NULL,
  [FichadoDetDespieceEstrSN] BOOLEAN NOT NULL,
  [FichadoDetArticulosSueltosSN] BOOLEAN NOT NULL,
  [FichadoDetCLASsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Fase], [Subfase])
);

-- ===== ArticulosUbicAca  (filas: 0) =====
CREATE TABLE [ArticulosUbicAca] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [UbicStock] NVARCHAR(10),
  [UbicStockObservaciones] NVARCHAR(255),
  [Almacen] NVARCHAR(5) NOT NULL,
  [UbicPosicionStock] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ArticulosUbicStock  (filas: 0) =====
CREATE TABLE [ArticulosUbicStock] (
  [Descripcion] NVARCHAR(40),
  [Codigo] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== ArticulosUbicStockPosicion  (filas: 0) =====
CREATE TABLE [ArticulosUbicStockPosicion] (
  [Ubicacion] NVARCHAR(10) NOT NULL,
  [Posicion] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Ubicacion], [Posicion])
);

-- ===== ArticulosUnidadesEmb  (filas: 0) =====
CREATE TABLE [ArticulosUnidadesEmb] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [CodigoUnidadEmb] NVARCHAR(6) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [CdadMetPorEmb] REAL,
  [Embalaje] NVARCHAR(5),
  [PesoEmbalaje] REAL,
  [PredeterminadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [CodigoUnidadEmb])
);

-- ===== ArticulosVenta  (filas: 0) =====
CREATE TABLE [ArticulosVenta] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [PVP1] REAL,
  [PVP2] REAL,
  [PVP3] REAL,
  [PVP4] REAL,
  [PVP5] REAL,
  [PVP6] REAL,
  [PVP7] REAL,
  [PVP8] REAL,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== ArticulosVentaCompF  (filas: 0) =====
CREATE TABLE [ArticulosVentaCompF] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [EstructuraCF] NVARCHAR(14),
  [TipoCargoIncr] NVARCHAR(1),
  [PVP1] REAL,
  [PVP2] REAL,
  [PVP3] REAL,
  [PVP4] REAL,
  [PVP5] REAL,
  [PVP6] REAL,
  [PVP7] REAL,
  [PVP8] REAL,
  PRIMARY KEY ([Articulo], [Acabado], [EstructuraCF], [TipoCargoIncr])
);

-- ===== ArticulosVentaEsp  (filas: 0) =====
CREATE TABLE [ArticulosVentaEsp] (
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Cliente] NVARCHAR(10) NOT NULL,
  [Precio] REAL,
  [FechaActDto] DATE,
  [CargosCompFsn] BOOLEAN NOT NULL,
  [CompFprecio] REAL,
  [IncrCompFsn] BOOLEAN NOT NULL,
  [IncrCompFprecio] REAL,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [PrecioDAsn] BOOLEAN NOT NULL,
  [PrecioDA] REAL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [lstEstructuras] NVARCHAR,
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [Cliente])
);

-- ===== ArticulosVentaEspAcaTon  (filas: 0) =====
CREATE TABLE [ArticulosVentaEspAcaTon] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Precio] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [lstEstructuras] NVARCHAR,
  [EsAcabadoDependienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad], [Cliente])
);

-- ===== ArticulosVentaEspCliPot  (filas: 0) =====
CREATE TABLE [ArticulosVentaEspCliPot] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Precio] REAL,
  [FechaActDto] DATE,
  [CargosCompFsn] BOOLEAN NOT NULL,
  [CompFprecio] REAL,
  [IncrCompFsn] BOOLEAN NOT NULL,
  [IncrCompFprecio] REAL,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [PrecioDAsn] BOOLEAN NOT NULL,
  [PrecioDA] REAL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [lstEstructuras] NVARCHAR,
  PRIMARY KEY ([Articulo], [Acabado], [Cliente])
);

-- ===== ArticulosVentaEspCliPotAcaTon  (filas: 0) =====
CREATE TABLE [ArticulosVentaEspCliPotAcaTon] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Precio] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [lstEstructuras] NVARCHAR,
  PRIMARY KEY ([Articulo], [Acabado], [AcaTonalidad], [Cliente])
);

-- ===== AsegCompañias  (filas: 0) =====
CREATE TABLE [AsegCompañias] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Contacto] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Observaciones] NVARCHAR,
  [NIF] NVARCHAR(30),
  [eMail] NVARCHAR(150),
  [Pais] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== AsegCompañiasDelegaciones  (filas: 0) =====
CREATE TABLE [AsegCompañiasDelegaciones] (
  [Compañia] NVARCHAR(5) NOT NULL,
  [Codigo] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Contacto] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Compañia], [Codigo])
);

-- ===== AsegCompañiasModalidades  (filas: 0) =====
CREATE TABLE [AsegCompañiasModalidades] (
  [Compañia] NVARCHAR(5) NOT NULL,
  [Modalidad] NVARCHAR(40) NOT NULL,
  PRIMARY KEY ([Compañia], [Modalidad])
);

-- ===== AsegCompañiasPeritos  (filas: 0) =====
CREATE TABLE [AsegCompañiasPeritos] (
  [Compañia] NVARCHAR(5) NOT NULL,
  [Perito] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([Compañia], [Perito])
);

-- ===== AsegCorredurias  (filas: 0) =====
CREATE TABLE [AsegCorredurias] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Contacto] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Observaciones] NVARCHAR,
  [NIF] NVARCHAR(30),
  [eMail] NVARCHAR(150),
  [Pais] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== AsegCorreduriasCompañias  (filas: 0) =====
CREATE TABLE [AsegCorreduriasCompañias] (
  [Correduria] NVARCHAR(5) NOT NULL,
  [Compañia] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([Correduria], [Compañia])
);

-- ===== AsegGestoras  (filas: 0) =====
CREATE TABLE [AsegGestoras] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Contacto] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Observaciones] NVARCHAR,
  [NIF] NVARCHAR(30),
  [eMail] NVARCHAR(150),
  [Pais] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== AsegPeritos  (filas: 0) =====
CREATE TABLE [AsegPeritos] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Contacto] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Observaciones] NVARCHAR,
  [NIF] NVARCHAR(30),
  [eMail] NVARCHAR(150),
  [Pais] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== Boletines  (filas: 0) =====
CREATE TABLE [Boletines] (
  [Numero] NVARCHAR(6),
  [Instalador] NVARCHAR(5),
  [FechaInstalador] DATE,
  [Cliente] NVARCHAR(5),
  [CliNIF] NVARCHAR(12),
  [CliNombre] NVARCHAR(40),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliFecha] DATE,
  [Potencia] REAL,
  [SumRepresentante] NVARCHAR(40),
  [SumEmpresa] NVARCHAR(40),
  [SumDomicilio] NVARCHAR(60),
  [SumFecha] DATE,
  [Ap1Cdad] REAL,
  [Ap1Aparatos] NVARCHAR(10),
  [Ap1Potencia] REAL,
  [Ap1Instalado] NVARCHAR(1),
  [Ap1Previsto] NVARCHAR(1),
  [Ap1Agente] NVARCHAR(10),
  [Ap2Cdad] REAL,
  [Ap2Aparatos] NVARCHAR(10),
  [Ap2Potencia] REAL,
  [Ap2Instalado] NVARCHAR(1),
  [Ap2Previsto] NVARCHAR(1),
  [Ap2Agente] NVARCHAR(10),
  [Ap3Cdad] REAL,
  [Ap3Aparatos] NVARCHAR(10),
  [Ap3Potencia] REAL,
  [Ap3Instalado] NVARCHAR(1),
  [Ap3Previsto] NVARCHAR(1),
  [Ap3Agente] NVARCHAR(10),
  [Ap4Cdad] REAL,
  [Ap4Aparatos] NVARCHAR(10),
  [Ap4Potencia] REAL,
  [Ap4Instalado] NVARCHAR(1),
  [Ap4Previsto] NVARCHAR(1),
  [Ap4Agente] NVARCHAR(10),
  [Ap5Cdad] REAL,
  [Ap5Aparatos] NVARCHAR(10),
  [Ap5Potencia] REAL,
  [Ap5Instalado] NVARCHAR(1),
  [Ap5Previsto] NVARCHAR(1),
  [Ap5Agente] NVARCHAR(10),
  [Esquema] BINARY,
  PRIMARY KEY ([Numero])
);

-- ===== BusquedaMemo  (filas: 41) =====
CREATE TABLE [BusquedaMemo] (
  [nLinea] INTEGER NOT NULL,
  [TablaSQL] NVARCHAR(255),
  [Campo1] NVARCHAR(40),
  [Valor11] NVARCHAR(40),
  [Valor12] NVARCHAR(40),
  [Campo2] NVARCHAR(40),
  [Valor21] NVARCHAR(40),
  [Valor22] NVARCHAR(40),
  [CampoOrden] NVARCHAR(40),
  PRIMARY KEY ([nLinea])
);

-- ===== CabecerasDocumentosTransformados  (filas: 0) =====
CREATE TABLE [CabecerasDocumentosTransformados] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Idioma] NVARCHAR(3) NOT NULL,
  [Prioridad] SMALLINT,
  [Formula] NVARCHAR(255),
  PRIMARY KEY ([TipoDoc], [Idioma])
);

-- ===== Cajas  (filas: 1) =====
CREATE TABLE [Cajas] (
  [Descripcion] NVARCHAR(30),
  [CuentaContab] NVARCHAR(15),
  [MetalicoSN] BOOLEAN NOT NULL,
  [Serie] NVARCHAR(1),
  [LimiteEfectivoSN] BOOLEAN NOT NULL,
  [LimiteEfectivo] DOUBLE,
  [Divisa] NVARCHAR(5),
  [Delegacion] NVARCHAR(2),
  [CodigoContabilidad] NVARCHAR(10),
  [VEfectosNoDescuentaCobrosACuentaSN] BOOLEAN NOT NULL,
  [VCobPagareNuevoEfectoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Descripcion])
);

-- ===== CajasArqueos  (filas: 0) =====
CREATE TABLE [CajasArqueos] (
  [Id] INTEGER NOT NULL,
  [Caja] NVARCHAR(30) NOT NULL,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  [FechaSaldoInicial] DATE,
  [Debe] DOUBLE,
  [Haber] DOUBLE,
  [SaldoInicial] DOUBLE,
  [SaldoFinal] DOUBLE,
  [SaldoInicialArqueo] DOUBLE,
  [Resultado] DOUBLE,
  PRIMARY KEY ([Id])
);

-- ===== CajasArqueosMovimientos  (filas: 0) =====
CREATE TABLE [CajasArqueosMovimientos] (
  [nLinea] INTEGER NOT NULL,
  [IdArqueo] INTEGER NOT NULL,
  [Contador] INTEGER,
  [Fecha] DATE,
  [Tipo] NVARCHAR(20),
  [Concepto] NVARCHAR(40),
  [Debe] DOUBLE,
  [Haber] DOUBLE,
  [Saldo] DOUBLE,
  PRIMARY KEY ([nLinea])
);

-- ===== CajasMovimientos  (filas: 0) =====
CREATE TABLE [CajasMovimientos] (
  [Contador] INTEGER NOT NULL,
  [Caja] NVARCHAR(30),
  [Fecha] DATE,
  [Tipo] NVARCHAR(20),
  [Concepto] NVARCHAR(40),
  [Saldo] DOUBLE,
  [CProvFac] NVARCHAR(10),
  [CNumFac] NVARCHAR(20),
  [TipoPagoFG] NVARCHAR(1),
  [VNumFac] NVARCHAR(20),
  [nCobCta] INTEGER,
  [Debe] DOUBLE,
  [Haber] DOUBLE,
  [CuentaContableDestino] NVARCHAR(15),
  [ContabSN] BOOLEAN NOT NULL,
  [FechaContab] DATE,
  [TipoCliProv] NVARCHAR(4),
  [CliProvCodigo] NVARCHAR(10),
  [CliProvNombre] NVARCHAR(100),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [MovimientoManualSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30),
  [IdArqueo] INTEGER,
  [DebeDivisaPrincipal] DOUBLE,
  [HaberDivisaPrincipal] DOUBLE,
  [SaldoDivisaPrincipal] DOUBLE,
  [SaldoCalculadoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Contador])
);

-- ===== CajasTipoMov  (filas: 0) =====
CREATE TABLE [CajasTipoMov] (
  [Descripcion] NVARCHAR(20),
  PRIMARY KEY ([Descripcion])
);

-- ===== CajasTipoMovConceptos  (filas: 0) =====
CREATE TABLE [CajasTipoMovConceptos] (
  [TipoMov] NVARCHAR(20) NOT NULL,
  [Concepto] NVARCHAR(40) NOT NULL,
  [CuentaContable] NVARCHAR(15),
  PRIMARY KEY ([TipoMov], [Concepto])
);

-- ===== CAlbaranes  (filas: 0) =====
CREATE TABLE [CAlbaranes] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Serie] NVARCHAR(1),
  [Almacen] NVARCHAR(5),
  [FechaStock] DATE,
  [Subtotal] DOUBLE,
  [DescuentoPorc] REAL,
  [Descuento] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [OtroImp] REAL,
  [OtroImpDescr] NVARCHAR(20),
  [ImporteTotal] DOUBLE,
  [nFacDestino] NVARCHAR(20),
  [FacturadoSN] BOOLEAN NOT NULL,
  [SeFactura] NVARCHAR(1),
  [nPedOrig] NVARCHAR(20),
  [PedTransfSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2),
  [ObraTraspasadaSN] BOOLEAN NOT NULL,
  [NoActStockSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30),
  [DescuentoPPporc] REAL,
  [DescuentoPP] DOUBLE,
  [COferta] NVARCHAR(255),
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [codObra] NVARCHAR(10),
  [TipoIVA] NVARCHAR(2),
  [TipoDocumento] NVARCHAR(5),
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [IdDireccionEntrega] NVARCHAR(20),
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [ReferenciaObra] NVARCHAR(200),
  [Observaciones] NVARCHAR,
  [NumeroReferenciaProveedor] NVARCHAR(40),
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyTipoDocOrig] NVARCHAR(6),
  [IntercompanyNumeroOrig] NVARCHAR(20),
  [IntercompanyEmpresaSincOrig] NVARCHAR(10),
  [IntercompanyCPedNumeroOrig] NVARCHAR(20),
  [IntercompanyCPedProveedorOrig] NVARCHAR(10),
  [RevisadoSN] BOOLEAN NOT NULL,
  [FechaRevisado] DATE,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [AjustarImportesSN] BOOLEAN NOT NULL,
  [AjusteBaseImponible] REAL,
  [AjusteIVA] REAL,
  [AjusteImporteTotal] REAL,
  [IdGrupoDocumentos] NVARCHAR(6),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [DevolucionSN] BOOLEAN NOT NULL,
  [DevolucionAlbaranOrigen] NVARCHAR(20),
  [DevolucionMotivo] NVARCHAR(2),
  PRIMARY KEY ([Proveedor], [Numero])
);

-- ===== CAlbaranesIVAResumen  (filas: 0) =====
CREATE TABLE [CAlbaranesIVAResumen] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([Proveedor], [Numero], [TipoIVA])
);

-- ===== CAlbaranesLin  (filas: 0) =====
CREATE TABLE [CAlbaranesLin] (
  [nLinea] INTEGER NOT NULL,
  [nAlb] NVARCHAR(20),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Descripcion] NVARCHAR(255),
  [Cdad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [PesoKgTeorico] REAL,
  [AcaOrigTransf] NVARCHAR(10),
  [PrecioDstTransf] REAL,
  [AcaDstFabr] NVARCHAR(10),
  [nLinOrig] INTEGER,
  [tmpAnchoCM] REAL,
  [tmpLargoCM] REAL,
  [AcaOrigTransfTonalidad] NVARCHAR(10),
  [AcaDstFabrTonalidad] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(20),
  [COf_nLin] INTEGER,
  [Proveedor] NVARCHAR(10),
  [codObra] NVARCHAR(10),
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [OrigenCoste] NVARCHAR(15),
  [TipoIVA] NVARCHAR(2),
  [IVAporc] REAL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [Delegacion] NVARCHAR(2),
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [PrecioCosteOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [IntercompanyCPedNLinOrig] INTEGER,
  [NumeroLoteManual] NVARCHAR(30),
  [NumeroLote] NVARCHAR(30),
  [NumeroLoteProveedor] NVARCHAR(30),
  [NumeroFabricacionArt] NVARCHAR(20),
  [Lote_Ubicacion] NVARCHAR(10),
  [Lote_UbicacionPosicion] NVARCHAR(10),
  [Orden] SMALLINT,
  [Precio] DOUBLE,
  [ImporteTotal] DOUBLE,
  [IntercompanyVAlbNLinOrig] INTEGER,
  [CdadMetPorEmb] REAL,
  [Lote_TipoContenedor] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== CAlbaranesLinImpuestos  (filas: 0) =====
CREATE TABLE [CAlbaranesLinImpuestos] (
  [nCLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nCLinea], [CodigoImpuesto])
);

-- ===== CalculoEtiqCorte  (filas: 0) =====
CREATE TABLE [CalculoEtiqCorte] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [CalcEtiqCorte] NVARCHAR(7),
  [CalcEtiqCorteNumFijo] REAL,
  PRIMARY KEY ([Familia], [Articulo])
);

-- ===== CanalesVentas  (filas: 0) =====
CREATE TABLE [CanalesVentas] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Codigo])
);

-- ===== CarrosCorte  (filas: 0) =====
CREATE TABLE [CarrosCorte] (
  [Codigo] NVARCHAR(3),
  [Descripcion] NVARCHAR(40),
  [nHuecos] SMALLINT,
  [nPasadasHueco] SMALLINT,
  [DisponibleSN] BOOLEAN NOT NULL,
  [AdmiteDistintasReferenciasEstrSN] BOOLEAN NOT NULL,
  [AdmiteDiferentesPedidosSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== CarrosCorteHuecos  (filas: 0) =====
CREATE TABLE [CarrosCorteHuecos] (
  [nLin] INTEGER NOT NULL,
  [Carro] NVARCHAR(3),
  [HuecoDesde] SMALLINT,
  [HuecoHasta] SMALLINT,
  [nHuecosRango] SMALLINT,
  [optnHuecoIdx] SMALLINT,
  [optnPasada] SMALLINT,
  [lstDisGrupoAsoc] NVARCHAR(50),
  PRIMARY KEY ([nLin])
);

-- ===== CategoriasBultos  (filas: 0) =====
CREATE TABLE [CategoriasBultos] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [Unidades] SMALLINT,
  [NumeroEtiquetasEmitir] SMALLINT,
  [TipoAgrupacion_LIN_DOC] NVARCHAR(10),
  [NoGenerarBultoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== CategoriasBultosArt  (filas: 0) =====
CREATE TABLE [CategoriasBultosArt] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [Articulo] NVARCHAR(15),
  [AnchoDesde] REAL,
  [AnchoHasta] REAL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [Prioridad] SMALLINT,
  [Categoria] NVARCHAR(3),
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  [FormulaOpcSel] NVARCHAR(100),
  [OrigenLinea] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== CategoriasBultosEstr  (filas: 0) =====
CREATE TABLE [CategoriasBultosEstr] (
  [nLinea] INTEGER NOT NULL,
  [FamEstr] NVARCHAR(10),
  [Estructura] NVARCHAR(14),
  [AnchoDesde] REAL,
  [AnchoHasta] REAL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [Prioridad] SMALLINT,
  [Categoria] NVARCHAR(3),
  [FormulaOpcSel] NVARCHAR(100),
  PRIMARY KEY ([nLinea])
);

-- ===== CategoriasGastos  (filas: 0) =====
CREATE TABLE [CategoriasGastos] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== CatGruposCliDescripcionVidrios  (filas: 0) =====
CREATE TABLE [CatGruposCliDescripcionVidrios] (
  [GrupoClientes] NVARCHAR(5) NOT NULL,
  [ArticuloVidrio] NVARCHAR(15) NOT NULL,
  [DescripcionEspecialSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([GrupoClientes], [ArticuloVidrio])
);

-- ===== CatGruposClientes  (filas: 0) =====
CREATE TABLE [CatGruposClientes] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [EstructurasTipoFiltro] NVARCHAR(15),
  [SeriesTipoFiltro] NVARCHAR(15),
  [SubcategoriasTipoFiltro] NVARCHAR(15),
  [SubfamiliasTipoFiltro] NVARCHAR(15),
  PRIMARY KEY ([Codigo])
);

-- ===== CatGruposCliEstructurasPermitidas  (filas: 0) =====
CREATE TABLE [CatGruposCliEstructurasPermitidas] (
  [GrupoClientes] NVARCHAR(5) NOT NULL,
  [CodigoEstructura] NVARCHAR(15) NOT NULL,
  [PermitidaSN] BOOLEAN NOT NULL,
  [ProhibidaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([GrupoClientes], [CodigoEstructura])
);

-- ===== CatGruposCliSeriesPermitidas  (filas: 0) =====
CREATE TABLE [CatGruposCliSeriesPermitidas] (
  [GrupoClientes] NVARCHAR(5) NOT NULL,
  [CodigoSerie] NVARCHAR(15) NOT NULL,
  [DescripcionEspecialSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(255),
  [PermitidaSN] BOOLEAN NOT NULL,
  [ProhibidaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([GrupoClientes], [CodigoSerie])
);

-- ===== CatGruposCliSubcategoriasPermitidas  (filas: 0) =====
CREATE TABLE [CatGruposCliSubcategoriasPermitidas] (
  [GrupoClientes] NVARCHAR(5) NOT NULL,
  [IdSubcategoria] GUID NOT NULL,
  [PermitidaSN] BOOLEAN NOT NULL,
  [ProhibidaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([GrupoClientes], [IdSubcategoria])
);

-- ===== CatGruposCliSubfamiliasArtPermitidas  (filas: 0) =====
CREATE TABLE [CatGruposCliSubfamiliasArtPermitidas] (
  [GrupoClientes] NVARCHAR(5) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [PermitidaSN] BOOLEAN NOT NULL,
  [ProhibidaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([GrupoClientes], [Familia], [Subfamilia])
);

-- ===== CAutorizaCondicional  (filas: 0) =====
CREATE TABLE [CAutorizaCondicional] (
  [nLinea] INTEGER NOT NULL,
  [Orden] SMALLINT,
  [Serie] NVARCHAR(1),
  [Articulo] NVARCHAR(15),
  [Familia] NVARCHAR(10),
  [BaseImponibleDesde] REAL,
  [BaseImponibleHasta] REAL,
  [RequiereAutorizacionSN] BOOLEAN NOT NULL,
  [NoRequiereAutorizacionSN] BOOLEAN NOT NULL,
  [DetenerProcesoCondicionesSN] BOOLEAN NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== CCuentasContables  (filas: 0) =====
CREATE TABLE [CCuentasContables] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [CuentaContable] NVARCHAR(15),
  [Importe] DOUBLE,
  PRIMARY KEY ([nLinea])
);

-- ===== CDireccionesEntrega  (filas: 0) =====
CREATE TABLE [CDireccionesEntrega] (
  [IdDireccion] NVARCHAR(20) NOT NULL,
  [Nombre] NVARCHAR(100),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [Telefono] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  PRIMARY KEY ([IdDireccion])
);

-- ===== CDireccionesEntregaConfig  (filas: 0) =====
CREATE TABLE [CDireccionesEntregaConfig] (
  [Serie] NVARCHAR(1) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [TipoDocumento] NVARCHAR(5) NOT NULL,
  [Prioridad] SMALLINT,
  [IdDireccion] NVARCHAR(20),
  PRIMARY KEY ([Serie], [Delegacion], [TipoDocumento])
);

-- ===== CDocumentosLinEtiq  (filas: 0) =====
CREATE TABLE [CDocumentosLinEtiq] (
  [nLinea] INTEGER NOT NULL,
  [idOpti] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [Numero] NVARCHAR(20),
  [Proveedor] NVARCHAR(10),
  [nLineaCDoc] INTEGER,
  PRIMARY KEY ([nLinea])
);

-- ===== CESSeriePerfiles  (filas: 0) =====
CREATE TABLE [CESSeriePerfiles] (
  [CodigoSerie] NVARCHAR(15) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [DescripcionVentas] NVARCHAR(50),
  [Orden] SMALLINT,
  [GrosorVidrioMin] SMALLINT,
  [GrosorVidrioMax] SMALLINT,
  PRIMARY KEY ([CodigoSerie])
);

-- ===== CESSeriePerfilesAcabadosValidos  (filas: 0) =====
CREATE TABLE [CESSeriePerfilesAcabadosValidos] (
  [CodigoSerie] NVARCHAR(15) NOT NULL,
  [CodigoEstructura] NVARCHAR(14) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [TipoAcabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([CodigoSerie], [CodigoEstructura], [Acabado], [TipoAcabado])
);

-- ===== CESSeriePerfilesComplementos  (filas: 0) =====
CREATE TABLE [CESSeriePerfilesComplementos] (
  [CodigoSerie] NVARCHAR(15) NOT NULL,
  [CodigoEstructura] NVARCHAR(14) NOT NULL,
  [TipoComplemento] NVARCHAR(20),
  [Orden] SMALLINT,
  PRIMARY KEY ([CodigoSerie], [CodigoEstructura])
);

-- ===== CESSeriePerfilesVidrios  (filas: 0) =====
CREATE TABLE [CESSeriePerfilesVidrios] (
  [CodigoSerie] NVARCHAR(15) NOT NULL,
  [CodigoVidrio] NVARCHAR(15) NOT NULL,
  PRIMARY KEY ([CodigoSerie], [CodigoVidrio])
);

-- ===== CESVidrios  (filas: 0) =====
CREATE TABLE [CESVidrios] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Orden] SMALLINT,
  [Publico] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Articulo])
);

-- ===== CFacturas  (filas: 0) =====
CREATE TABLE [CFacturas] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20),
  [Fecha] DATE,
  [Serie] NVARCHAR(1),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [NumeroControl] INTEGER,
  [ContabilizadaSN] BOOLEAN NOT NULL,
  [Subtotal] DOUBLE,
  [DescuentoPorc] REAL,
  [Descuento] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [OtroImp] REAL,
  [OtroImpDescr] NVARCHAR(20),
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [ImporteTotal] DOUBLE,
  [Observaciones] NVARCHAR(60),
  [InmovilizadoSN] BOOLEAN NOT NULL,
  [nAlbOrigen] NVARCHAR(20),
  [CuentaContable] NVARCHAR(15),
  [Delegacion] NVARCHAR(2),
  [Usuario] NVARCHAR(30),
  [DescuentoPPporc] REAL,
  [DescuentoPP] DOUBLE,
  [COferta] NVARCHAR(255),
  [AjustarImportesSN] BOOLEAN NOT NULL,
  [AjusteBaseImponible] REAL,
  [AjusteIVA] REAL,
  [AjusteImporteTotal] REAL,
  [TipoIVA] NVARCHAR(2),
  [FechaContab] DATE,
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [TipoDocumento] NVARCHAR(5),
  [Id] INTEGER NOT NULL,
  [OtroImpCuentaContable] NVARCHAR(15),
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [CuentaContableProv] NVARCHAR(15),
  [CuentaContableRetencion] NVARCHAR(15),
  [FechaContable] DATE,
  [CuentasContablesManualesSN] BOOLEAN NOT NULL,
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [TipoRetencion] NVARCHAR(2),
  [RectificativaSN] BOOLEAN NOT NULL,
  [RectNumeroRectificada] NVARCHAR(20),
  [RectMotivo] NVARCHAR(2),
  [siiEnviadaSN] BOOLEAN NOT NULL,
  [siiFechaEnvio] DATE,
  [siiEstadoAEAT] NVARCHAR(20),
  [siiTipoDocumento] NVARCHAR(5),
  [siiTipoFacturaRecibida] NVARCHAR(2),
  [siiTipoFactura] NVARCHAR(2),
  [siiClaveRegimenEspecial] NVARCHAR(2),
  [siiTipoRectificativa] NVARCHAR(2),
  [siiFechaOperacion] DATE,
  [siiDescripcionOperacion] NVARCHAR(60),
  [NumeroReferenciaProveedor] NVARCHAR(40),
  [siiClaveRegimenEspecialAdicional1] NVARCHAR(2),
  [siiClaveRegimenEspecialAdicional2] NVARCHAR(2),
  [NumeroDUA] NVARCHAR(40),
  [siiPeriodoMes] SMALLINT,
  [siiPeriodoAño] SMALLINT,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [FechaAsientoContable] DATE,
  [siiForzarPeriodoImpositivoSN] BOOLEAN NOT NULL,
  [IdGrupoDocumentos] NVARCHAR(6),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [IntercompanyEmpresaSincOrig] NVARCHAR(10),
  [IntercompanyNumeroOrig] NVARCHAR(20),
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyTipoDocOrig] NVARCHAR(6),
  [RevisadoSN] BOOLEAN NOT NULL,
  [FechaRevisado] DATE,
  [FacturaElectronicaSN] BOOLEAN NOT NULL,
  [FacturaEfechaRecibida] DATE,
  [FacturaEcodigoQR] NVARCHAR,
  [FacturaEcontenido] NVARCHAR,
  [RegistroFiscal1] NVARCHAR(50),
  [RegistroFiscal2] NVARCHAR(50),
  [RegistroFiscal3] NVARCHAR(50),
  [RegistroFiscal4] NVARCHAR(50),
  [IdERPexterno] NVARCHAR(30),
  PRIMARY KEY ([Proveedor], [Numero])
);

-- ===== CFacturasIVAResumen  (filas: 0) =====
CREATE TABLE [CFacturasIVAResumen] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([Proveedor], [Numero], [TipoIVA])
);

-- ===== CFacturasLin  (filas: 0) =====
CREATE TABLE [CFacturasLin] (
  [nLinea] INTEGER NOT NULL,
  [nFac] NVARCHAR(20),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Descripcion] NVARCHAR(255),
  [Cdad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [tmpAnchoCM] REAL,
  [tmpLargoCM] REAL,
  [Delegacion] NVARCHAR(2),
  [AcaTonalidad] NVARCHAR(20),
  [COf_nLin] INTEGER,
  [cCuentaManualSN] BOOLEAN NOT NULL,
  [cCuenta] NVARCHAR(15),
  [Proveedor] NVARCHAR(10),
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [OrigenCoste] NVARCHAR(15),
  [TipoIVA] NVARCHAR(2),
  [IVAporc] REAL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [PrecioCosteOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [Orden] SMALLINT,
  [nLinOrig] INTEGER,
  [NumeroLote] NVARCHAR(30),
  [Precio] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([nLinea])
);

-- ===== CFacturasLinImpuestos  (filas: 0) =====
CREATE TABLE [CFacturasLinImpuestos] (
  [nCLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nCLinea], [CodigoImpuesto])
);

-- ===== CFormatoCheque  (filas: 0) =====
CREATE TABLE [CFormatoCheque] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(255),
  [Tipo_CH_P] NVARCHAR(2),
  [FormatoFecha] NVARCHAR(50),
  [FormatoVto] NVARCHAR(50),
  [AnchoMaxImp] SMALLINT,
  [papelAncho] REAL,
  [papelAlto] REAL,
  [papelIgnoraConfigSN] BOOLEAN NOT NULL,
  [MargenV] REAL,
  [MargenH] REAL,
  [chequeAncho] REAL,
  [chequeAlto] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== CFormatoChequeCampos  (filas: 0) =====
CREATE TABLE [CFormatoChequeCampos] (
  [nLinea] INTEGER NOT NULL,
  [Formato] NVARCHAR(2) NOT NULL,
  [Nombre] NVARCHAR(30),
  [Tipo] SMALLINT,
  [nEntera] SMALLINT,
  [nDec] SMALLINT,
  [x] REAL,
  [y] REAL,
  [tipoLetra] NVARCHAR(100),
  [tamLetra] SMALLINT,
  [colorLetra] INTEGER,
  [nLineas] SMALLINT,
  [Prefijo] NVARCHAR(30),
  [Sufijo] NVARCHAR(30),
  [Texto] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== CGastos  (filas: 0) =====
CREATE TABLE [CGastos] (
  [Acreedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20),
  [Serie] NVARCHAR(1),
  [Fecha] DATE,
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Categoria] NVARCHAR(2),
  [Descripcion] NVARCHAR(255),
  [ImporteTotal] REAL,
  [InmovilizadoSN] BOOLEAN NOT NULL,
  [ContabilizadaSN] BOOLEAN NOT NULL,
  [CuentaContable] NVARCHAR(15),
  [BaseImponible] DOUBLE,
  [Retencion] DOUBLE,
  [IVA] DOUBLE,
  [NumeroControl] INTEGER,
  [FechaContab] DATE,
  [Id] INTEGER NOT NULL,
  [Delegacion] NVARCHAR(2),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [RepercutirEnComprasSN] BOOLEAN NOT NULL,
  [RepercutirModoReparto] NVARCHAR(10),
  [RepercutidoEnComprasSN] BOOLEAN NOT NULL,
  [RepercutidoFecha] DATE,
  [CuentaContableAcre] NVARCHAR(15),
  [CuentaContableRetencion] NVARCHAR(15),
  [FechaContable] DATE,
  [TipoDocumento] NVARCHAR(5),
  [ImportesManualesSN] BOOLEAN NOT NULL,
  [ImportesTotalesManualesSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [NumeroReferenciaAcreedor] NVARCHAR(40),
  [siiEnviadaSN] BOOLEAN NOT NULL,
  [siiFechaEnvio] DATE,
  [siiEstadoAEAT] NVARCHAR(20),
  [siiTipoDocumento] NVARCHAR(5),
  [siiTipoFacturaRecibida] NVARCHAR(2),
  [siiTipoFactura] NVARCHAR(2),
  [siiClaveRegimenEspecial] NVARCHAR(2),
  [siiTipoRectificativa] NVARCHAR(2),
  [siiFechaOperacion] DATE,
  [siiDescripcionOperacion] NVARCHAR(60),
  [siiClaveRegimenEspecialAdicional1] NVARCHAR(2),
  [siiClaveRegimenEspecialAdicional2] NVARCHAR(2),
  [Usuario] NVARCHAR(30),
  [siiPeriodoMes] SMALLINT,
  [siiPeriodoAño] SMALLINT,
  [RectificativaSN] BOOLEAN NOT NULL,
  [RectNumeroRectificada] NVARCHAR(20),
  [RectMotivo] NVARCHAR(2),
  [NumeroDUA] NVARCHAR(40),
  [FechaAsientoContable] DATE,
  [siiForzarPeriodoImpositivoSN] BOOLEAN NOT NULL,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [RevisadoSN] BOOLEAN NOT NULL,
  [FechaRevisado] DATE,
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [FacturaElectronicaSN] BOOLEAN NOT NULL,
  [FacturaEfechaRecibida] DATE,
  [FacturaEcodigoQR] NVARCHAR,
  [FacturaEcontenido] NVARCHAR,
  [RegistroFiscal1] NVARCHAR(50),
  [RegistroFiscal2] NVARCHAR(50),
  [RegistroFiscal3] NVARCHAR(50),
  [RegistroFiscal4] NVARCHAR(50),
  [IdERPexterno] NVARCHAR(30),
  [OrigenLiquidacionTarjetaSN] BOOLEAN NOT NULL,
  [NumeroLiquidacionTarjeta] NVARCHAR(20),
  PRIMARY KEY ([Acreedor], [Numero])
);

-- ===== CGastosLin  (filas: 0) =====
CREATE TABLE [CGastosLin] (
  [nLinea] INTEGER NOT NULL,
  [Acreedor] NVARCHAR(10) NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(15),
  [BaseImponible] DOUBLE,
  [TipoIVA] NVARCHAR(2),
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [ImporteTotal] DOUBLE,
  [CuentaContableBI] NVARCHAR(15),
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [TipoRetencion] NVARCHAR(2),
  PRIMARY KEY ([nLinea])
);

-- ===== CGastosRepAlbaranes  (filas: 0) =====
CREATE TABLE [CGastosRepAlbaranes] (
  [Acreedor] NVARCHAR(10) NOT NULL,
  [NumeroGasto] NVARCHAR(20) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [NumeroAlbaran] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Acreedor], [NumeroGasto], [Proveedor], [NumeroAlbaran])
);

-- ===== CGastosRepLineaAlbaran  (filas: 0) =====
CREATE TABLE [CGastosRepLineaAlbaran] (
  [Acreedor] NVARCHAR(10) NOT NULL,
  [NumeroGasto] NVARCHAR(20) NOT NULL,
  [nLineaAlbaran] INTEGER NOT NULL,
  [proveedor] NVARCHAR(10),
  [numeroAlbaran] NVARCHAR(20),
  [GastosImporte] REAL,
  [GastosDivisa] NVARCHAR(5),
  [GastosImporteDivisaPrincipal] REAL,
  PRIMARY KEY ([Acreedor], [NumeroGasto], [nLineaAlbaran])
);

-- ===== ClasificacionMultiNivel  (filas: 0) =====
CREATE TABLE [ClasificacionMultiNivel] (
  [Tabla] NVARCHAR(40) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [DescripcionCompleta] NVARCHAR(255),
  PRIMARY KEY ([Tabla], [CadenaDeClasificacion])
);

-- ===== Clientes  (filas: 9) =====
CREATE TABLE [Clientes] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [NombreComercial] NVARCHAR(100),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Direccion2] NVARCHAR(150),
  [CP2] NVARCHAR(20),
  [Poblacion2] NVARCHAR(80),
  [Provincia2] NVARCHAR(80),
  [DatosFacSN] BOOLEAN NOT NULL,
  [RazonSocial] NVARCHAR(100),
  [DireccionF] NVARCHAR(150),
  [CPF] NVARCHAR(20),
  [PoblacionF] NVARCHAR(80),
  [ProvinciaF] NVARCHAR(80),
  [nCopiasFac] SMALLINT,
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Tarifa] NVARCHAR(5),
  [TipoCliente] NVARCHAR(3),
  [Representante] NVARCHAR(5),
  [RespCobro] NVARCHAR(5),
  [recargoSN] BOOLEAN NOT NULL,
  [RetTipo] NVARCHAR(1),
  [Descuento] REAL,
  [DescuentoPP] REAL,
  [DescuentoFac] REAL,
  [DescuentoCargosCF] REAL,
  [compFIncrDto] REAL,
  [compFtipoPrecIncrNT] NVARCHAR(1),
  [DescuentosFamSN] BOOLEAN NOT NULL,
  [DescuentosFamArtSN] BOOLEAN NOT NULL,
  [GrupoPEsp] NVARCHAR(2),
  [GrupoDto] NVARCHAR(2),
  [Observaciones] NVARCHAR,
  [Zona] NVARCHAR(5),
  [OrdenReparto] SMALLINT,
  [RiesgoMaximo] DOUBLE,
  [RefCredito] NVARCHAR(20),
  [BloqueoRiesgoSN] BOOLEAN NOT NULL,
  [DesdeSinPagos] DATE,
  [HastaSinPagos] DATE,
  [DomiciliacionSN] BOOLEAN NOT NULL,
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [NombreEntidad] NVARCHAR(40),
  [CuentaContable] NVARCHAR(15),
  [ContabilizadaSN] BOOLEAN NOT NULL,
  [FechaAlta] DATE,
  [CliContadoSN] BOOLEAN NOT NULL,
  [CompFincrGuiaCM] REAL,
  [FechaActDto] DATE,
  [Idioma] NVARCHAR(3),
  [NoMultiplosSN] BOOLEAN NOT NULL,
  [NoMetMinSN] BOOLEAN NOT NULL,
  [NoMultMetMinPorFamiliasSN] BOOLEAN NOT NULL,
  [RecEnergMinEspSN] BOOLEAN NOT NULL,
  [RecEnergMinEsp] REAL,
  [GrupoCom] NVARCHAR(3),
  [Nombre] NVARCHAR(100),
  [MultMetMinPorFamSN] BOOLEAN NOT NULL,
  [MultMetMinPorArtSN] BOOLEAN NOT NULL,
  [RiesgoAseguradoSN] BOOLEAN NOT NULL,
  [VAlbFacAutoSN] BOOLEAN NOT NULL,
  [VAlbFacAutoPreguntaSN] BOOLEAN NOT NULL,
  [VPedVAlbTipoAgrup] NVARCHAR(5),
  [VAlbVFacTipoAgrup] NVARCHAR(5),
  [VAlbFormato_VSV] NVARCHAR(2),
  [FormaPagoDiasRetroceso] SMALLINT,
  [RepLunesSN] BOOLEAN NOT NULL,
  [RepMartesSN] BOOLEAN NOT NULL,
  [RepMiercolesSN] BOOLEAN NOT NULL,
  [RepJuevesSN] BOOLEAN NOT NULL,
  [RepViernesSN] BOOLEAN NOT NULL,
  [RepSabadoSN] BOOLEAN NOT NULL,
  [RepDiasManualesSN] BOOLEAN NOT NULL,
  [FPObservaciones] NVARCHAR,
  [PreciosEspSN] BOOLEAN NOT NULL,
  [GrupoAsigTar] NVARCHAR(3),
  [DesdeSinPagos2] DATE,
  [HastaSinPagos2] DATE,
  [DatosDirPostalSN] BOOLEAN NOT NULL,
  [DirPostal] NVARCHAR(150),
  [CPPostal] NVARCHAR(20),
  [PoblacionPostal] NVARCHAR(80),
  [ProvinciaPostal] NVARCHAR(80),
  [autorizaVDocSN] BOOLEAN NOT NULL,
  [autorizaVDocTipoDoc] NVARCHAR(15),
  [factOrigenSN] BOOLEAN NOT NULL,
  [NotificaSN] BOOLEAN NOT NULL,
  [NotificaSMS] NVARCHAR(20),
  [FechaHoraAct] DATE,
  [Att] NVARCHAR(255),
  [ClientePotSN] BOOLEAN NOT NULL,
  [CodClientePot] NVARCHAR(10),
  [AsegCliSN] BOOLEAN NOT NULL,
  [AsegGestora] NVARCHAR(5),
  [AsegCorreduria] NVARCHAR(5),
  [AsegCompañia] NVARCHAR(5),
  [AsegDelegacion] NVARCHAR(5),
  [AsegFacturacion] NVARCHAR(15),
  [AsegModalidad] NVARCHAR(40),
  [AsegNumPoliza] NVARCHAR(50),
  [AsegCoberturaMax] DOUBLE,
  [Pais] NVARCHAR(10),
  [Pais2] NVARCHAR(10),
  [PaisF] NVARCHAR(10),
  [PaisPostal] NVARCHAR(10),
  [RecEnerg_ACT_DESC] NVARCHAR(4),
  [RecEnergCalcularEn] NVARCHAR(20),
  [CodigoContabilidad] NVARCHAR(15),
  [DApvpDinamicoSN] BOOLEAN NOT NULL,
  [TelefonoMovil] NVARCHAR(20),
  [TelefonoMovil2] NVARCHAR(20),
  [TipoIVA] NVARCHAR(2),
  [NotificaNoCargaAutoVDocSN] BOOLEAN NOT NULL,
  [CIFF] NVARCHAR(30),
  [NIF] NVARCHAR(30),
  [CodigoFiscal2] NVARCHAR(30),
  [CodigoFiscal3] NVARCHAR(30),
  [CodigoFiscalObservaciones] NVARCHAR(30),
  [CuentaBancariaIntl] NVARCHAR(80),
  [eMail] NVARCHAR(150),
  [NotificaMail] NVARCHAR(150),
  [RiesgoMaximoVencido] DOUBLE,
  [DiasVtoMaxAjusta] NVARCHAR(10),
  [Web] NVARCHAR(255),
  [RepresentanteLegal] NVARCHAR(50),
  [RepresentanteLnif] NVARCHAR(30),
  [RiesgoMaxRemNoVencido] DOUBLE,
  [RiesgoMaxRemNoVencidoDiasAd] SMALLINT,
  [NoCLASsn] BOOLEAN NOT NULL,
  [CodigoFiscalF2] NVARCHAR(30),
  [CodigoFiscalF3] NVARCHAR(30),
  [CodigoFiscalFObservaciones] NVARCHAR(30),
  [TipoDocumento] NVARCHAR(5),
  [PersonaFisicaJuridica] NVARCHAR(8),
  [CondicionResidencia] NVARCHAR(3),
  [DivisaImprimir] NVARCHAR(5),
  [DivisaVPRES] NVARCHAR(5),
  [DivisaVPED] NVARCHAR(5),
  [DivisaVALB] NVARCHAR(5),
  [DivisaVFAC] NVARCHAR(5),
  [SeriesValidasSN] BOOLEAN NOT NULL,
  [RetencionIngresosBrutosPorc] REAL,
  [RiesgoAsegurado] DOUBLE,
  [ClasificacionRiesgoAsegurado] DOUBLE,
  [DiasPagoSN] BOOLEAN NOT NULL,
  [CompFsubfamTipoMotorSN] BOOLEAN NOT NULL,
  [RiesgoMaximoSerieSN] BOOLEAN NOT NULL,
  [RiesgoFechaDesde] DATE,
  [RiesgoCoberturaPorc] REAL,
  [ClienteOrigenCopia] NVARCHAR(10),
  [NoContactarSN] BOOLEAN NOT NULL,
  [DescuentosCMNsn] BOOLEAN NOT NULL,
  [DescuentosCMNacaSN] BOOLEAN NOT NULL,
  [TipoIVAserieSN] BOOLEAN NOT NULL,
  [ProdWebAccesoSN] BOOLEAN NOT NULL,
  [ProdWebLoginEMail] NVARCHAR(100),
  [ProdWebPasswordHash] NVARCHAR(40),
  [NoContactarFechaRegistro] DATE,
  [DescuentosEstrCMNsn] BOOLEAN NOT NULL,
  [DescuentosEstrCMNacaSN] BOOLEAN NOT NULL,
  [Chat] NVARCHAR(80),
  [REMetMinConf] NVARCHAR(4),
  [BIC] NVARCHAR(11),
  [BloqueoAbsolutoSN] BOOLEAN NOT NULL,
  [BloqueoMensaje] NVARCHAR(255),
  [AnulaIVAenArticulosSN] BOOLEAN NOT NULL,
  [ObservacionesProduccion] NVARCHAR,
  [CosteCalculadoEspecialSN] BOOLEAN NOT NULL,
  [BloqueoAbsolutoTipoDoc] NVARCHAR(25),
  [RazonSocial2] NVARCHAR(100),
  [FacturaElectronicaSN] BOOLEAN NOT NULL,
  [FacturaEeMailDestino] NVARCHAR(100),
  [FacturaEfechaAlta] DATE,
  [CuentaContableVEfDescontados] NVARCHAR(15),
  [NoCLAPorFamiliaSN] BOOLEAN NOT NULL,
  [nCopiasAlb] SMALLINT,
  [FacturaEenviarSN] BOOLEAN NOT NULL,
  [FacturaEdestino] NVARCHAR(15),
  [RiesgoAseguradoFechaDesde] DATE,
  [AutorizacionSEPAfirmadaSN] BOOLEAN NOT NULL,
  [AutorizacionSEPAfechaFirmada] DATE,
  [RemesaCSBcuadernoValido] NVARCHAR(30),
  [PortesTipo] NVARCHAR(10),
  [AgenciaTransporte] NVARCHAR(10),
  [VPedFormato] NVARCHAR(5),
  [NotCliFormatoConfVPed] NVARCHAR(2),
  [BloqueoEfectosPendientesSN] BOOLEAN NOT NULL,
  [TipoRetencion] NVARCHAR(2),
  [TarifaDinamicaSN] BOOLEAN NOT NULL,
  [ReferenciaClienteSN] BOOLEAN NOT NULL,
  [ReferenciaClientePorDimensionSN] BOOLEAN NOT NULL,
  [CanalVenta] NVARCHAR(10),
  [siiTipoIdFiscal] NVARCHAR(2),
  [IntercompanyClienteSN] BOOLEAN NOT NULL,
  [TarDinNoIncrementoAcaTonSN] BOOLEAN NOT NULL,
  [TarDinNoIncrementoGrupoSN] BOOLEAN NOT NULL,
  [AlbaranElectronicoSN] BOOLEAN NOT NULL,
  [AlbaranEeMailDestino] NVARCHAR(150),
  [CosteCalculadoEspecialMargenPVPSN] BOOLEAN NOT NULL,
  [TelefonoEnv] NVARCHAR(20),
  [TpteIncoterm] NVARCHAR(5),
  [AutorizacionSEPAreferencia] NVARCHAR(35),
  [ProdWebObservaciones] NVARCHAR(30),
  [EnvioPublicidad] NVARCHAR(15),
  [PublicidadDeTerceros] NVARCHAR(15),
  [Usuario] NVARCHAR(30),
  [TratamientoDeDatos] NVARCHAR(15),
  [EnvioPublicidadFechaAct] DATE,
  [PublicidadDeTercerosFechaAct] DATE,
  [TratamientoDeDatosFechaAct] DATE,
  [SerieAutoSN] BOOLEAN NOT NULL,
  [SerieAutoTipoDoc] NVARCHAR(30),
  [Descuento2] REAL,
  [CatGrupo] NVARCHAR(5),
  [RazonSocialPostal] NVARCHAR(100),
  [ClasificacionComercial] NVARCHAR(2),
  [ClasificacionComercialManualSN] BOOLEAN NOT NULL,
  [PreciosEspAcaTonSN] BOOLEAN NOT NULL,
  [CajaCobros] NVARCHAR(30),
  [CobCtaCobros] NVARCHAR(4),
  [NoActualizaPreciosAlTransformarSN] BOOLEAN NOT NULL,
  [TarifaDinamicaDescuentosSN] BOOLEAN NOT NULL,
  [AfinidadComercial] NVARCHAR(2),
  [RiesgoMaxConfPedidos] NVARCHAR(20),
  [TipoIDfiscal] NVARCHAR(5),
  [TipoIDfiscalF] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesAcabadosReferencia  (filas: 0) =====
CREATE TABLE [ClientesAcabadosReferencia] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Referencia] NVARCHAR(30),
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Cliente], [Acabado])
);

-- ===== ClientesAgenda  (filas: 0) =====
CREATE TABLE [ClientesAgenda] (
  [Fecha] DATE,
  [PendienteSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Resultado] NVARCHAR(30),
  [RstResponsable] NVARCHAR(30),
  [ResultanteSN] BOOLEAN NOT NULL,
  [DocumentoEnvioMedio] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [RstProgTiempo] REAL,
  [RstProgPeriodo] NVARCHAR(10),
  [Resultante_informadoSN] BOOLEAN NOT NULL,
  [RstProgFecha] DATE,
  [RstNotaAlResponsable] NVARCHAR,
  [Satisfaccion] NVARCHAR(20),
  [Responsable] NVARCHAR(30),
  [TipoTarea] NVARCHAR(30),
  [Obra] NVARCHAR(10),
  [EntradaAutomaticaSN] BOOLEAN NOT NULL,
  [Titulo] NVARCHAR(100),
  [FechaFin] DATE,
  [IdAgenda] GUID NOT NULL,
  [Rst_IdTarea] GUID,
  [locLatitud] REAL,
  [locLongitud] REAL,
  [locAltitud] SMALLINT,
  [locPrecision] SMALLINT,
  [Cliente] NVARCHAR(10),
  [FechaRegistro] DATE,
  [FechaUltimaModificacion] DATE,
  [FechaRealizada] DATE,
  [TipoDocOrig] NVARCHAR(6),
  [nDocOrig] INTEGER,
  [Estado] NVARCHAR(3),
  [GeneradaHorasLibresSN] BOOLEAN NOT NULL,
  [NumeroAgAviso] NVARCHAR(20),
  PRIMARY KEY ([IdAgenda])
);

-- ===== ClientesAgendaDoc  (filas: 0) =====
CREATE TABLE [ClientesAgendaDoc] (
  [Documento] NVARCHAR(30),
  [IdAgendaDoc] GUID NOT NULL,
  [IdAgenda] GUID,
  PRIMARY KEY ([IdAgendaDoc])
);

-- ===== ClientesAgendaMaterial  (filas: 0) =====
CREATE TABLE [ClientesAgendaMaterial] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [IdAgendaMaterial] GUID NOT NULL,
  [AgMaterial] NVARCHAR(5),
  [Fecha] DATE,
  [SinCargoSN] BOOLEAN NOT NULL,
  [EnDepositoSN] BOOLEAN NOT NULL,
  [DepositoDevueltoSN] BOOLEAN NOT NULL,
  [FechaDevolucion] DATE,
  PRIMARY KEY ([IdAgendaMaterial])
);

-- ===== ClientesArticulosReferencia  (filas: 0) =====
CREATE TABLE [ClientesArticulosReferencia] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Ancho] REAL NOT NULL,
  [Largo] REAL NOT NULL,
  [Referencia] NVARCHAR(20),
  [Descripcion] NVARCHAR(255),
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [CodigoUnidadEmb] NVARCHAR(6),
  PRIMARY KEY ([Cliente], [Articulo], [Acabado], [AcaTonalidad], [Ancho], [Largo])
);

-- ===== ClientesAsignaSerieAuto  (filas: 0) =====
CREATE TABLE [ClientesAsignaSerieAuto] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Orden] SMALLINT,
  [Porcentaje] REAL,
  PRIMARY KEY ([Cliente], [Serie])
);

-- ===== ClientesAutorizaVDocAutorizadores  (filas: 0) =====
CREATE TABLE [ClientesAutorizaVDocAutorizadores] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [gaNotUsuarioAut] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([Cliente], [gaNotUsuarioAut])
);

-- ===== ClientesBloqueoEfectosPendientes  (filas: 0) =====
CREATE TABLE [ClientesBloqueoEfectosPendientes] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [TipoRemesa] NVARCHAR(5) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [DiasBloqueo] SMALLINT,
  [BloquearSN] BOOLEAN NOT NULL,
  [AvisarSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Serie], [TipoRemesa], [Delegacion])
);

-- ===== ClientesCLAFamilia  (filas: 0) =====
CREATE TABLE [ClientesCLAFamilia] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Cliente], [Familia], [Subfamilia])
);

-- ===== ClientesCLAS  (filas: 0) =====
CREATE TABLE [ClientesCLAS] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Articulo], [Acabado])
);

-- ===== ClientesCompFSelDef  (filas: 0) =====
CREATE TABLE [ClientesCompFSelDef] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [EstructuraCF] NVARCHAR(14),
  [CodTerminal] NVARCHAR(15),
  [CodAccionamiento] NVARCHAR(15),
  [CodGuiaI] NVARCHAR(15),
  [CodGuiaD] NVARCHAR(15),
  [CodLama] NVARCHAR(15),
  [AcaLama] NVARCHAR(10),
  [AcaGuias] NVARCHAR(10),
  [AcaTerminal] NVARCHAR(10),
  [ObservEdLinea] NVARCHAR(100),
  [ConTapones_SN] NVARCHAR(1),
  [ObservHD] NVARCHAR(255),
  [opcTestero] NVARCHAR(2),
  [ConAngulo_SN] NVARCHAR(1),
  [ConGrapas_SN] NVARCHAR(1),
  [DtoAdLam] SMALLINT,
  [DtoAdEje] SMALLINT,
  [CodGuiaC] NVARCHAR(15),
  [cdadLamasCiegas] SMALLINT,
  [CodTopes] NVARCHAR(15),
  [FamiliaMotores] NVARCHAR(10),
  [SubfamiliaMotores] NVARCHAR(10),
  [CodFlejes] NVARCHAR(60),
  [CodContera] NVARCHAR(60),
  PRIMARY KEY ([Cliente], [EstructuraCF])
);

-- ===== ClientesCompFsubfamTipoMotor  (filas: 0) =====
CREATE TABLE [ClientesCompFsubfamTipoMotor] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoMotor] NVARCHAR(2) NOT NULL,
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([Cliente], [TipoMotor])
);

-- ===== ClientesContactos  (filas: 0) =====
CREATE TABLE [ClientesContactos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [NumeroContacto] SMALLINT NOT NULL,
  [Nombre] NVARCHAR(100),
  [Cargo] NVARCHAR(50),
  [Telefono] NVARCHAR(20),
  [TelefonoMovil] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Codigo], [NumeroContacto])
);

-- ===== ClientesCosteCalculado  (filas: 0) =====
CREATE TABLE [ClientesCosteCalculado] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [TarifaCB] NVARCHAR(3) NOT NULL,
  [CosteBruto] REAL,
  [AcaPrecioFoliadoML] REAL,
  [ProveedorTransformacion] NVARCHAR(10),
  PRIMARY KEY ([Cliente], [TarifaCB])
);

-- ===== ClientesCuentasBancarias  (filas: 0) =====
CREATE TABLE [ClientesCuentasBancarias] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Codigo] NVARCHAR(3) NOT NULL,
  [NombreEntidad] NVARCHAR(40),
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [CuentaBancariaIntl] NVARCHAR(80),
  [BIC] NVARCHAR(11),
  [PredeterminadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Codigo])
);

-- ===== ClientesDelegaciones  (filas: 7) =====
CREATE TABLE [ClientesDelegaciones] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDiasFacturacion  (filas: 0) =====
CREATE TABLE [ClientesDiasFacturacion] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1),
  [DiaFacturacion] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDiasPago  (filas: 0) =====
CREATE TABLE [ClientesDiasPago] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1),
  [DiaPago] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDirecciones  (filas: 0) =====
CREATE TABLE [ClientesDirecciones] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [NumeroDireccion] SMALLINT NOT NULL,
  [TipoDireccion] NVARCHAR(20),
  [Descripcion] NVARCHAR(40),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [eMail] NVARCHAR(150),
  [Telefono] NVARCHAR(20),
  [Contacto] NVARCHAR(100),
  [NIF] NVARCHAR(30),
  [RazonSocial] NVARCHAR(100),
  [Zona] NVARCHAR(5),
  [OrdenReparto] SMALLINT,
  [Telefono2] NVARCHAR(20),
  [TipoIDfiscal] NVARCHAR(5),
  PRIMARY KEY ([Cliente], [NumeroDireccion])
);

-- ===== ClientesDtoArt  (filas: 0) =====
CREATE TABLE [ClientesDtoArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Descuento] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoCMN  (filas: 0) =====
CREATE TABLE [ClientesDtoCMN] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoCMNaca  (filas: 0) =====
CREATE TABLE [ClientesDtoCMNaca] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoEstrCMN  (filas: 0) =====
CREATE TABLE [ClientesDtoEstrCMN] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoEstrCMNaca  (filas: 0) =====
CREATE TABLE [ClientesDtoEstrCMNaca] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoFam  (filas: 0) =====
CREATE TABLE [ClientesDtoFam] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoFamAcaArt  (filas: 0) =====
CREATE TABLE [ClientesDtoFamAcaArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesDtoFamArt  (filas: 0) =====
CREATE TABLE [ClientesDtoFamArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesEstructurasOpciones  (filas: 0) =====
CREATE TABLE [ClientesEstructurasOpciones] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [OPCnGrupo] SMALLINT NOT NULL,
  [OPCnOpcion] SMALLINT NOT NULL,
  [OPCpredetSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Estructura], [OPCnGrupo], [OPCnOpcion])
);

-- ===== ClientesFacEcentros  (filas: 0) =====
CREATE TABLE [ClientesFacEcentros] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CodigoOficinaContable] NVARCHAR(20),
  [CodigoOrganoGestor] NVARCHAR(20),
  [CodigoUnidadTramitadora] NVARCHAR(20),
  PRIMARY KEY ([Cliente])
);

-- ===== ClientesFormaPago  (filas: 8) =====
CREATE TABLE [ClientesFormaPago] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [ImporteDesde] DOUBLE,
  [ImporteHasta] DOUBLE,
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Prioridad] SMALLINT,
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesFormatoImpresion  (filas: 0) =====
CREATE TABLE [ClientesFormatoImpresion] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Formato] NVARCHAR(5),
  PRIMARY KEY ([Cliente], [TipoDoc], [Serie])
);

-- ===== ClientesGrpAsigTar  (filas: 0) =====
CREATE TABLE [ClientesGrpAsigTar] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [TarifaEstructuras] NVARCHAR(5),
  [TarifaDimLargo] NVARCHAR(5),
  [TarifaCorte] NVARCHAR(5),
  [TarifaUdsEmb] NVARCHAR(5),
  [UltimaAct] DATE,
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesGrpAsigTarLinArt  (filas: 0) =====
CREATE TABLE [ClientesGrpAsigTarLinArt] (
  [nLinea] INTEGER NOT NULL,
  [GrpAsigTar] NVARCHAR(3),
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [TarifaDimLargo] NVARCHAR(5),
  [TarifaCorte] NVARCHAR(5),
  [TarifaUdsEmb] NVARCHAR(5),
  [Articulo] NVARCHAR(60),
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpAsigTarLinEstr  (filas: 0) =====
CREATE TABLE [ClientesGrpAsigTarLinEstr] (
  [nLinea] INTEGER NOT NULL,
  [GrpAsigTar] NVARCHAR(3),
  [SeriePerfiles] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [TarifaEstructuras] NVARCHAR(5),
  [Prioridad] SMALLINT,
  [FamiliaEstr] NVARCHAR(10),
  [Estructura] NVARCHAR(60),
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpAsigTarLinEstrNoDis  (filas: 0) =====
CREATE TABLE [ClientesGrpAsigTarLinEstrNoDis] (
  [nLinea] INTEGER NOT NULL,
  [GrpAsigTar] NVARCHAR(3),
  [FamiliaEstr] NVARCHAR(10),
  [TarifaEstructuras] NVARCHAR(5),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [Estructura] NVARCHAR(60),
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDto  (filas: 0) =====
CREATE TABLE [ClientesGrpDto] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesGrpDtoArtMaximo  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoArtMaximo] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [DescuentoMax] REAL,
  [Descuento2Max] REAL,
  [Articulo] NVARCHAR(60) NOT NULL,
  PRIMARY KEY ([GrupoDto], [Articulo], [Familia], [Subfamilia], [Tarifa])
);

-- ===== ClientesGrpDtoEstrMaximo  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoEstrMaximo] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(5) NOT NULL,
  [DescuentoMax] REAL,
  [Descuento2Max] REAL,
  [Estructura] NVARCHAR(15) NOT NULL,
  PRIMARY KEY ([GrupoDto], [Estructura], [FamiliaEstr], [Tarifa])
);

-- ===== ClientesGrpDtoLin  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLin] (
  [GrupoDto] NVARCHAR(2),
  [Familia] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [FechaActDto] DATE,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDtoLinArt  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLinArt] (
  [GrupoDto] NVARCHAR(2),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [FechaActDto] DATE,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDtoLinCMN  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLinCMN] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [FechaActDto] DATE,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDtoLinCMNaca  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLinCMNaca] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [FechaActDto] DATE,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDtoLinEstrCMN  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLinEstrCMN] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDtoLinEstrCMNaca  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLinEstrCMNaca] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpDtoLinFE  (filas: 0) =====
CREATE TABLE [ClientesGrpDtoLinFE] (
  [GrupoDto] NVARCHAR(2) NOT NULL,
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Descuento] REAL,
  [Prioridad] SMALLINT,
  [FechaActDto] DATE,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesGrpPEsp  (filas: 0) =====
CREATE TABLE [ClientesGrpPEsp] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesGrpPEspLin  (filas: 0) =====
CREATE TABLE [ClientesGrpPEspLin] (
  [GrupoPEsp] NVARCHAR(2),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Precio] REAL,
  [CargosCompFsn] BOOLEAN NOT NULL,
  [CompFprecio] REAL,
  [IncrCompFsn] BOOLEAN NOT NULL,
  [IncrCompFprecio] REAL,
  [FechaActDto] DATE,
  [PrecioDAsn] BOOLEAN NOT NULL,
  [PrecioDA] REAL,
  PRIMARY KEY ([GrupoPEsp], [Articulo], [Acabado])
);

-- ===== ClientesGrpPEspLinAcaTon  (filas: 0) =====
CREATE TABLE [ClientesGrpPEspLinAcaTon] (
  [GrupoPEsp] NVARCHAR(2) NOT NULL,
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Precio] REAL,
  [FechaActDto] DATE,
  PRIMARY KEY ([GrupoPEsp], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== ClientesGruposCom  (filas: 0) =====
CREATE TABLE [ClientesGruposCom] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesIncrGuiaCompF  (filas: 0) =====
CREATE TABLE [ClientesIncrGuiaCompF] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [incrGuiaCM] REAL,
  PRIMARY KEY ([Cliente], [FamiliaEstr])
);

-- ===== ClientesMultMetMinArt  (filas: 0) =====
CREATE TABLE [ClientesMultMetMinArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [MultiploAncho] REAL,
  [MultiploLargo] REAL,
  [MetrajeMinimo] REAL,
  PRIMARY KEY ([Cliente], [Articulo])
);

-- ===== ClientesMultMetMinFam  (filas: 0) =====
CREATE TABLE [ClientesMultMetMinFam] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [MultiploAncho] REAL,
  [MultiploLargo] REAL,
  [MetrajeMinimo] REAL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Cliente], [Familia], [Subfamilia])
);

-- ===== ClientesNoMultMetMinFam  (filas: 0) =====
CREATE TABLE [ClientesNoMultMetMinFam] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [NoMultiplosSN] BOOLEAN NOT NULL,
  [NoMetMinSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Familia])
);

-- ===== ClientesNotifica  (filas: 0) =====
CREATE TABLE [ClientesNotifica] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoNotificacion] NVARCHAR(40) NOT NULL,
  [MetodoNotificacion] NVARCHAR(5) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [NoNotificarAutoSN] BOOLEAN NOT NULL,
  [eMail] NVARCHAR(255),
  [TelefonoDestino] NVARCHAR(20),
  PRIMARY KEY ([Cliente], [TipoNotificacion], [MetodoNotificacion], [Serie])
);

-- ===== ClientesObras  (filas: 1037) =====
CREATE TABLE [ClientesObras] (
  [nObra] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [Observaciones] NVARCHAR(50),
  [Nombre] NVARCHAR(60),
  PRIMARY KEY ([nObra])
);

-- ===== ClientesObservaciones  (filas: 0) =====
CREATE TABLE [ClientesObservaciones] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Observaciones] NVARCHAR,
  [MostrarEnPantallaSN] BOOLEAN NOT NULL,
  [ImprimirEnDocumentoSN] BOOLEAN NOT NULL,
  [SerieDoc] NVARCHAR(1),
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPot  (filas: 0) =====
CREATE TABLE [ClientesPot] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(100),
  [NombreComercial] NVARCHAR(100),
  [ClienteSN] BOOLEAN NOT NULL,
  [CodCliente] NVARCHAR(10),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Att] NVARCHAR(255),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Representante] NVARCHAR(5),
  [Tarifa] NVARCHAR(5),
  [Observaciones] NVARCHAR,
  [Zona] NVARCHAR(5),
  [Delegacion] NVARCHAR(2),
  [DesdeSinPagos] DATE,
  [HastaSinPagos] DATE,
  [DesdeSinPagos2] DATE,
  [HastaSinPagos2] DATE,
  [DomiciliacionSN] BOOLEAN NOT NULL,
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [NombreEntidad] NVARCHAR(40),
  [FechaAlta] DATE,
  [GrupoAsigTar] NVARCHAR(3),
  [TelefonoMovil] NVARCHAR(20),
  [TelefonoMovil2] NVARCHAR(20),
  [web] NVARCHAR(255),
  [BajaSN] BOOLEAN NOT NULL,
  [FechaBaja] DATE,
  [MotivoBaja] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [TipoCliente] NVARCHAR(3),
  [Descuento] REAL,
  [DescuentoPP] REAL,
  [DescuentoFac] REAL,
  [FechaActDto] DATE,
  [DescuentosFamSN] BOOLEAN NOT NULL,
  [DescuentosFamArtSN] BOOLEAN NOT NULL,
  [GrupoDto] NVARCHAR(2),
  [PreciosEspSN] BOOLEAN NOT NULL,
  [GrupoPEsp] NVARCHAR(2),
  [DApvpDinamicoSN] BOOLEAN NOT NULL,
  [TipoIVA] NVARCHAR(2),
  [NIF] NVARCHAR(30),
  [CodigoFiscal2] NVARCHAR(30),
  [CodigoFiscal3] NVARCHAR(30),
  [CodigoFiscalObservaciones] NVARCHAR(30),
  [CuentaBancariaIntl] NVARCHAR(80),
  [Divisa] NVARCHAR(5),
  [eMail] NVARCHAR(150),
  [NoCLASsn] BOOLEAN NOT NULL,
  [PersonaFisicaJuridica] NVARCHAR(8),
  [CondicionResidencia] NVARCHAR(3),
  [DivisaImprimir] NVARCHAR(5),
  [DiasPagoSN] BOOLEAN NOT NULL,
  [NoContactarSN] BOOLEAN NOT NULL,
  [DescuentosCMNsn] BOOLEAN NOT NULL,
  [DescuentosCMNacaSN] BOOLEAN NOT NULL,
  [Idioma] NVARCHAR(3),
  [TipoIVAserieSN] BOOLEAN NOT NULL,
  [NoContactarFechaRegistro] DATE,
  [DescuentosEstrCMNsn] BOOLEAN NOT NULL,
  [DescuentosEstrCMNacaSN] BOOLEAN NOT NULL,
  [Chat] NVARCHAR(80),
  [BIC] NVARCHAR(11),
  [AnulaIVAenArticulosSN] BOOLEAN NOT NULL,
  [NoCLAPorFamiliaSN] BOOLEAN NOT NULL,
  [CanalVenta] NVARCHAR(10),
  [EnvioPublicidad] NVARCHAR(15),
  [PublicidadDeTerceros] NVARCHAR(15),
  [Usuario] NVARCHAR(30),
  [TratamientoDeDatos] NVARCHAR(15),
  [EnvioPublicidadFechaAct] DATE,
  [PublicidadDeTercerosFechaAct] DATE,
  [TratamientoDeDatosFechaAct] DATE,
  [CatGrupo] NVARCHAR(5),
  [TipoDocumento] NVARCHAR(5),
  [ClasificacionComercial] NVARCHAR(2),
  [ClasificacionComercialManualSN] BOOLEAN NOT NULL,
  [PreciosEspAcaTonSN] BOOLEAN NOT NULL,
  [AfinidadComercial] NVARCHAR(2),
  [TipoIDfiscal] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesPotAgenda  (filas: 0) =====
CREATE TABLE [ClientesPotAgenda] (
  [Fecha] DATE,
  [PendienteSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Resultado] NVARCHAR(30),
  [RstResponsable] NVARCHAR(30),
  [ResultanteSN] BOOLEAN NOT NULL,
  [DocumentoEnvioMedio] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [RstProgTiempo] REAL,
  [RstProgPeriodo] NVARCHAR(10),
  [Resultante_informadoSN] BOOLEAN NOT NULL,
  [RstProgFecha] DATE,
  [RstNotaAlResponsable] NVARCHAR,
  [Satisfaccion] NVARCHAR(20),
  [Responsable] NVARCHAR(30),
  [TipoTarea] NVARCHAR(30),
  [Obra] NVARCHAR(10),
  [EntradaAutomaticaSN] BOOLEAN NOT NULL,
  [Titulo] NVARCHAR(100),
  [FechaFin] DATE,
  [IdAgenda] GUID NOT NULL,
  [Rst_IdTarea] GUID,
  [locLatitud] REAL,
  [locLongitud] REAL,
  [locAltitud] SMALLINT,
  [locPrecision] SMALLINT,
  [Cliente] NVARCHAR(10),
  [FechaRegistro] DATE,
  [FechaUltimaModificacion] DATE,
  [FechaRealizada] DATE,
  [TipoDocOrig] NVARCHAR(6),
  [nDocOrig] INTEGER,
  [Estado] NVARCHAR(3),
  [GeneradaHorasLibresSN] BOOLEAN NOT NULL,
  [NumeroAgAviso] NVARCHAR(20),
  PRIMARY KEY ([IdAgenda])
);

-- ===== ClientesPotAgendaDoc  (filas: 0) =====
CREATE TABLE [ClientesPotAgendaDoc] (
  [Documento] NVARCHAR(30),
  [IdAgendaDoc] GUID NOT NULL,
  [IdAgenda] GUID,
  PRIMARY KEY ([IdAgendaDoc])
);

-- ===== ClientesPotAgendaMaterial  (filas: 0) =====
CREATE TABLE [ClientesPotAgendaMaterial] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [IdAgendaMaterial] GUID NOT NULL,
  [AgMaterial] NVARCHAR(5),
  [Fecha] DATE,
  [SinCargoSN] BOOLEAN NOT NULL,
  [EnDepositoSN] BOOLEAN NOT NULL,
  [DepositoDevueltoSN] BOOLEAN NOT NULL,
  [FechaDevolucion] DATE,
  PRIMARY KEY ([IdAgendaMaterial])
);

-- ===== ClientesPotCLAFamilia  (filas: 0) =====
CREATE TABLE [ClientesPotCLAFamilia] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Cliente], [Familia], [Subfamilia])
);

-- ===== ClientesPotCLAS  (filas: 0) =====
CREATE TABLE [ClientesPotCLAS] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Articulo], [Acabado])
);

-- ===== ClientesPotContactos  (filas: 0) =====
CREATE TABLE [ClientesPotContactos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [NumeroContacto] SMALLINT NOT NULL,
  [Nombre] NVARCHAR(100),
  [Cargo] NVARCHAR(50),
  [Telefono] NVARCHAR(20),
  [TelefonoMovil] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Codigo], [NumeroContacto])
);

-- ===== ClientesPotCuentasBancarias  (filas: 0) =====
CREATE TABLE [ClientesPotCuentasBancarias] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Codigo] NVARCHAR(3) NOT NULL,
  [NombreEntidad] NVARCHAR(40),
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [CuentaBancariaIntl] NVARCHAR(80),
  [BIC] NVARCHAR(11),
  [PredeterminadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Codigo])
);

-- ===== ClientesPotDiasPago  (filas: 0) =====
CREATE TABLE [ClientesPotDiasPago] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1),
  [DiaPago] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDirecciones  (filas: 0) =====
CREATE TABLE [ClientesPotDirecciones] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [NumeroDireccion] SMALLINT NOT NULL,
  [TipoDireccion] NVARCHAR(20),
  [Descripcion] NVARCHAR(40),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [eMail] NVARCHAR(150),
  [Telefono] NVARCHAR(20),
  [Contacto] NVARCHAR(100),
  [NIF] NVARCHAR(30),
  [RazonSocial] NVARCHAR(100),
  [Telefono2] NVARCHAR(20),
  [TipoIDfiscal] NVARCHAR(5),
  PRIMARY KEY ([Cliente], [NumeroDireccion])
);

-- ===== ClientesPotDtoArt  (filas: 0) =====
CREATE TABLE [ClientesPotDtoArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoCMN  (filas: 0) =====
CREATE TABLE [ClientesPotDtoCMN] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoCMNaca  (filas: 0) =====
CREATE TABLE [ClientesPotDtoCMNaca] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoEstrCMN  (filas: 0) =====
CREATE TABLE [ClientesPotDtoEstrCMN] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoEstrCMNaca  (filas: 0) =====
CREATE TABLE [ClientesPotDtoEstrCMNaca] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoFam  (filas: 0) =====
CREATE TABLE [ClientesPotDtoFam] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [Prioridad] SMALLINT,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoFamAcaArt  (filas: 0) =====
CREATE TABLE [ClientesPotDtoFamAcaArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotDtoFamArt  (filas: 0) =====
CREATE TABLE [ClientesPotDtoFamArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [AutoGrpSN] BOOLEAN NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  [BloqueoGrupoSN] BOOLEAN NOT NULL,
  [DtoAvanzadoSN] BOOLEAN NOT NULL,
  [DtoLB] REAL,
  [DtoMedida] REAL,
  [DtoUdEmb] REAL,
  [DescuentoDAsn] BOOLEAN NOT NULL,
  [DescuentoDA] REAL,
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [Prioridad] SMALLINT,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  [Dto2LB] REAL,
  [Dto2Medida] REAL,
  [Dto2UdEmb] REAL,
  [Descuento2DA] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotFormaPago  (filas: 0) =====
CREATE TABLE [ClientesPotFormaPago] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Prioridad] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotObservacionesVDoc  (filas: 0) =====
CREATE TABLE [ClientesPotObservacionesVDoc] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [SerieDoc] NVARCHAR(1),
  [Observaciones] NVARCHAR,
  [MostrarEnPantallaSN] BOOLEAN NOT NULL,
  [ImprimirEnDocumentoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesPotTipoIVA  (filas: 0) =====
CREATE TABLE [ClientesPotTipoIVA] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [TipoIVA] NVARCHAR(2),
  PRIMARY KEY ([Cliente], [Serie])
);

-- ===== ClientesPrePot  (filas: 0) =====
CREATE TABLE [ClientesPrePot] (
  [Nombre] NVARCHAR(100),
  [eMail] NVARCHAR(150),
  [Telefono] NVARCHAR(20),
  [TipoCliente] NVARCHAR(3),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [Grupo] NVARCHAR(30),
  [Representante] NVARCHAR(5),
  [FechaAlta] DATE,
  [ConvertidoPotencialSN] BOOLEAN NOT NULL,
  [Idioma] NVARCHAR(3),
  [NoContactarSN] BOOLEAN NOT NULL,
  [NoContactarFechaRegistro] DATE,
  [IdPrepotencial] GUID NOT NULL,
  PRIMARY KEY ([IdPrepotencial])
);

-- ===== ClientesProdWebUsuarios  (filas: 0) =====
CREATE TABLE [ClientesProdWebUsuarios] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [LoginEMail] NVARCHAR(100) NOT NULL,
  [PasswordHash] NVARCHAR(40),
  [AccesoHabilitadoSN] BOOLEAN NOT NULL,
  [Observaciones] NVARCHAR(30),
  PRIMARY KEY ([Cliente], [LoginEMail])
);

-- ===== ClientesRiesgoDesbloqueoPuntual  (filas: 0) =====
CREATE TABLE [ClientesRiesgoDesbloqueoPuntual] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [PasswordDP] NVARCHAR(10) NOT NULL,
  [CreadaUsuario] NVARCHAR(30),
  [CreadaFecha] DATE,
  [UsadaSN] BOOLEAN NOT NULL,
  [UsadaUsuario] NVARCHAR(30),
  [UsadaTipoDoc] NVARCHAR(4),
  [UsadaNumeroDoc] NVARCHAR(20),
  [UsadaFecha] DATE,
  PRIMARY KEY ([nLinea])
);

-- ===== ClientesRiesgoSerie  (filas: 0) =====
CREATE TABLE [ClientesRiesgoSerie] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [RiesgoMaximo] DOUBLE,
  [RiesgoMaximoVencido] DOUBLE,
  [RiesgoMaxRemNoVencido] DOUBLE,
  [RiesgoMaxRemNoVencidoDiasAd] SMALLINT,
  [BloqueoRiesgoSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [RefCredito] NVARCHAR(20),
  [RiesgoAsegurado] DOUBLE,
  [RiesgoFechaDesde] DATE,
  [RiesgoAseguradoFechaDesde] DATE,
  [RiesgoAseguradoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Delegacion], [Serie])
);

-- ===== ClientesSeriesValidas  (filas: 0) =====
CREATE TABLE [ClientesSeriesValidas] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Series] NVARCHAR(30),
  [ForzarSerie] NVARCHAR(1),
  [NoPermiteCambioSerieSN] BOOLEAN NOT NULL,
  [BloquearVentasSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [TipoDoc])
);

-- ===== ClientesTipoIVA  (filas: 0) =====
CREATE TABLE [ClientesTipoIVA] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [TipoIVA] NVARCHAR(2),
  PRIMARY KEY ([Cliente], [Serie])
);

-- ===== ClientesTipos  (filas: 0) =====
CREATE TABLE [ClientesTipos] (
  [Codigo] NVARCHAR(3),
  [Descripcion] NVARCHAR(80),
  [CuentaContabVtas] NVARCHAR(15),
  PRIMARY KEY ([Codigo])
);

-- ===== ClientesToldoSelDef  (filas: 0) =====
CREATE TABLE [ClientesToldoSelDef] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(60) NOT NULL,
  [tldAccionamiento_MAN_MOT] NVARCHAR(3),
  [FamiliaMotores] NVARCHAR(10),
  [SubfamiliaMotores] NVARCHAR(10),
  [tldFaldillaModelo] NVARCHAR(40),
  [tldFaldillaMedida] REAL,
  [tldLonaDobleCaida_SN] NVARCHAR(1),
  [tldLonaCosidaSoldada] NVARCHAR(1),
  [tldOpcionCortePaños] NVARCHAR(20),
  PRIMARY KEY ([Cliente], [Estructura])
);

-- ===== ClientesVAlbMovInt  (filas: 0) =====
CREATE TABLE [ClientesVAlbMovInt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [MovimientoInternoSN] BOOLEAN NOT NULL,
  [MovIntAlmacenDestino] NVARCHAR(5),
  [DelegacionVALBautoDesdeOF] NVARCHAR(2),
  PRIMARY KEY ([Cliente])
);

-- ===== CManufacturas  (filas: 0) =====
CREATE TABLE [CManufacturas] (
  [id] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [NumDoc] NVARCHAR(20),
  [nLinGrp] INTEGER,
  [Manufactura] NVARCHAR(10),
  [izdaSN] BOOLEAN NOT NULL,
  [dchaSN] BOOLEAN NOT NULL,
  [supSN] BOOLEAN NOT NULL,
  [infSN] BOOLEAN NOT NULL,
  [Cantidad] REAL,
  [barrCdadHoriz] SMALLINT,
  [barrCdadVert] SMALLINT,
  [Acabado] NVARCHAR(10),
  [nLargos] SMALLINT,
  [nCortos] SMALLINT,
  [DiametroTal] REAL,
  [AcaTonalidad] NVARCHAR(10),
  [BarrotilloDiseño] INTEGER,
  [barrCdadHuecosHoriz] SMALLINT,
  [barrCdadHuecosVert] SMALLINT,
  [RadioForma] REAL,
  [NumeroVidrioDAaplicar] SMALLINT,
  PRIMARY KEY ([id])
);

-- ===== CobCuentas  (filas: 0) =====
CREATE TABLE [CobCuentas] (
  [codigo] NVARCHAR(4),
  [Entidad] NVARCHAR(40),
  [CodEnt] NVARCHAR(4),
  [CodSuc] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [CuentaContabDto] NVARCHAR(15),
  [CuentaContabGestCob] NVARCHAR(15),
  [CuentaContabPagos] NVARCHAR(15),
  [RCSBnombre] NVARCHAR(40),
  [RCSBsufijo] NVARCHAR(3),
  [RCSBformato162164] SMALLINT,
  [RCSBtextoRPT] NVARCHAR(100),
  [FormatoCheque] NVARCHAR(2),
  [FormatoPagare] NVARCHAR(2),
  [RCSBnif] NVARCHAR(30),
  [CuentaBancariaIntl] NVARCHAR(80),
  [RCSBdireccion] NVARCHAR(150),
  [RCSBpoblacion] NVARCHAR(80),
  [GenerarMovimientoCajaSN] BOOLEAN NOT NULL,
  [Caja] NVARCHAR(30),
  [BIC] NVARCHAR(11),
  [RCSBidentificador] NVARCHAR(35),
  [RCSBCP] NVARCHAR(10),
  [RCSBProvincia] NVARCHAR(80),
  [RCSBPais] NVARCHAR(10),
  [Delegacion] NVARCHAR(2),
  [CodigoContabilidad] NVARCHAR(10),
  PRIMARY KEY ([codigo])
);

-- ===== CobTiposRemesa  (filas: 1) =====
CREATE TABLE [CobTiposRemesa] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [RCSBsn] BOOLEAN NOT NULL,
  [EfectivoSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(80),
  [TipoFechaCobroPago] NVARCHAR(3),
  [CodigoContabilidad] NVARCHAR(5),
  [RAEBsn] BOOLEAN NOT NULL,
  [CodigoFacturaE] NVARCHAR(2),
  [ContabilidadPrefCliImpago] NVARCHAR(5),
  [VRemesaNoRequiereDomiciliacionSN] BOOLEAN NOT NULL,
  [NoGenerarVencimientosCFacSN] BOOLEAN NOT NULL,
  [NoGenerarVencimientosVFacSN] BOOLEAN NOT NULL,
  [CodigoERPexterno] NVARCHAR(20),
  PRIMARY KEY ([Codigo])
);

-- ===== COfertas  (filas: 0) =====
CREATE TABLE [COfertas] (
  [Numero] NVARCHAR(6) NOT NULL,
  [Fecha] DATE,
  [Proveedor] NVARCHAR(10),
  [ValidezDesde] DATE,
  [ValidezHasta] DATE,
  [Observaciones] NVARCHAR,
  [Descripcion] NVARCHAR(255),
  [AplicaIncrSN] BOOLEAN NOT NULL,
  [Asignacion_AUTO_MAN] NVARCHAR(5),
  [ManAvisarAplicableSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaPrincipal] NVARCHAR(5),
  PRIMARY KEY ([Numero])
);

-- ===== COfertasDescuentoFamArt  (filas: 0) =====
CREATE TABLE [COfertasDescuentoFamArt] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [DescuentoPorc] REAL,
  [DescuentoPorcAdicional] REAL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([nOferta], [Familia], [Subfamilia])
);

-- ===== COfertasDtoCMNaca  (filas: 0) =====
CREATE TABLE [COfertasDtoCMNaca] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [DescuentoAdicional] REAL,
  PRIMARY KEY ([nOferta], [CadenaDeClasificacion], [Acabado])
);

-- ===== COfertasLin  (filas: 0) =====
CREATE TABLE [COfertasLin] (
  [nLinea] INTEGER NOT NULL,
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Coste] REAL,
  [DtoPorcEspSN] BOOLEAN NOT NULL,
  [DtoPorcEsp] REAL,
  [DtoPorcAd] REAL,
  [OfTipo] NVARCHAR(1),
  [CondTipo] NVARCHAR(10),
  [CondLstArt] NVARCHAR(255),
  [CondMetSup] REAL,
  [CondEmbSup] REAL,
  [CondResTipo] NVARCHAR(10),
  [CondResArt] NVARCHAR(15),
  [CondResAca] NVARCHAR(10),
  [CondResPrecio] REAL,
  [CondResDto] REAL,
  [CondResDesc] NVARCHAR(255),
  [CosteEspecialSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ComisCategCond  (filas: 0) =====
CREATE TABLE [ComisCategCond] (
  [nLinea] INTEGER NOT NULL,
  [ComisCat] NVARCHAR(2),
  [TipoCond] NVARCHAR(10),
  [Dato] NVARCHAR(10),
  [ValorDesde] REAL,
  [ValorHasta] REAL,
  [lstDato] NVARCHAR(255),
  [CompFfamiliaArtValSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ComisCategorias  (filas: 0) =====
CREATE TABLE [ComisCategorias] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(40),
  [TipoDocLin] NVARCHAR(1),
  [GrupoBaseAñad] NVARCHAR(1),
  [BasePrioridad] SMALLINT,
  [BaseAñadidasSN] BOOLEAN NOT NULL,
  [BaseLinAñadidasDocSN] BOOLEAN NOT NULL,
  [AñadIncompatible1] NVARCHAR(2),
  [AñadIncompatible2] NVARCHAR(2),
  [LiqMinimoBaseCom] REAL,
  [ComisionesManualesSN] BOOLEAN NOT NULL,
  [LiqMinimoBaseComSN] BOOLEAN NOT NULL,
  [LiqMinimoSoloPositivaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== CompFAcabadosValidos  (filas: 0) =====
CREATE TABLE [CompFAcabadosValidos] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Funcion] NVARCHAR(20),
  [Acabado] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== CompFAsocAca  (filas: 0) =====
CREATE TABLE [CompFAsocAca] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [FuncionOrig] NVARCHAR(20),
  [AcabadoOrig] NVARCHAR(10),
  [FuncionDst] NVARCHAR(20),
  [AcabadoDst] NVARCHAR(10),
  [TonalidadOrig] NVARCHAR(10),
  [TonalidadDst] NVARCHAR(10),
  [TonDstIgualOrigSN] BOOLEAN NOT NULL,
  [LstLama] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== CompFcantidadLamas  (filas: 0) =====
CREATE TABLE [CompFcantidadLamas] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [FormulaCantidadSN] BOOLEAN NOT NULL,
  [FormulaCantidad] NVARCHAR(255),
  [TablaAltoSN] BOOLEAN NOT NULL,
  [TablaAltoFormulaBase] NVARCHAR(255),
  [TipoRedondeo] NVARCHAR(3),
  PRIMARY KEY ([Estructura], [ArticuloLama])
);

-- ===== CompFcantidadLamasTabla  (filas: 0) =====
CREATE TABLE [CompFcantidadLamasTabla] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [CantidadLamas] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== CompFCompactosDef  (filas: 0) =====
CREATE TABLE [CompFCompactosDef] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [idCompDef] SMALLINT NOT NULL,
  [lstCodLama] NVARCHAR(255),
  [lstCodGuia] NVARCHAR(255),
  [ConSinGuiasCS] NVARCHAR(1),
  [AltCaj] SMALLINT,
  [lstAcaCaj] NVARCHAR,
  [lstAcaLam] NVARCHAR,
  [lstAcaGui] NVARCHAR,
  [lstCodTerm] NVARCHAR(255),
  [CompFtipoVal] NVARCHAR(3),
  [Descripcion] NVARCHAR(100),
  [CondTapasExtrusionSN] BOOLEAN NOT NULL,
  [nTapasExtrusion] SMALLINT,
  [CondTapasCajonSN] BOOLEAN NOT NULL,
  [nTapasCajon] SMALLINT,
  [lstCodAccionamiento] NVARCHAR(255),
  [lstCodOpcionAccionamiento] NVARCHAR(60),
  [lstAcaTapExtr] NVARCHAR,
  [lstAcaTapCajon] NVARCHAR,
  [CompFtipoMetMinMult] NVARCHAR(3),
  [Prioridad] SMALLINT,
  [lstTarifas] NVARCHAR(25),
  [nOpcionTestero] SMALLINT,
  PRIMARY KEY ([Estructura], [idCompDef])
);

-- ===== CompFdescuentoAdCondicional  (filas: 0) =====
CREATE TABLE [CompFdescuentoAdCondicional] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [nOrden] SMALLINT,
  [nOpcionTestero] SMALLINT,
  [nOpcionAcc] NVARCHAR(255),
  [lstArticuloAccionamiento] NVARCHAR(255),
  [DescuentoAdEje] REAL,
  [DescuentoAdLama] REAL,
  [DescuentoAdCajon] REAL,
  [lstAltCaj] NVARCHAR(50),
  [nOpcionTesteroCen] SMALLINT,
  [DescuentoAdAislante] REAL,
  [DescuentoAdAislante_GC] REAL,
  [DescuentoAdAislanteVuelo] REAL,
  [FormulaOpcSel] NVARCHAR(100),
  PRIMARY KEY ([nLinea])
);

-- ===== CompFdescuentoAdGuia  (filas: 0) =====
CREATE TABLE [CompFdescuentoAdGuia] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloGuia] NVARCHAR(15) NOT NULL,
  [DescuentoAd] REAL,
  PRIMARY KEY ([Estructura], [ArticuloGuia])
);

-- ===== CompFdescuentoAdLama  (filas: 0) =====
CREATE TABLE [CompFdescuentoAdLama] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [DescuentoAd] REAL,
  PRIMARY KEY ([Estructura], [ArticuloLama])
);

-- ===== CompFDespieceCond  (filas: 0) =====
CREATE TABLE [CompFDespieceCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [Funcion] NVARCHAR(20),
  [lstAltCaj] NVARCHAR(50),
  [lstEje] NVARCHAR(255),
  [PosRecID] NVARCHAR(1),
  [SalidaFI] NVARCHAR(1),
  [nOpcionTestero] SMALLINT,
  [InsArticulo] NVARCHAR(15),
  [lstGuia] NVARCHAR(255),
  [nOrden] SMALLINT,
  [nOpcionAcc] NVARCHAR(100),
  [lstLama] NVARCHAR(255),
  [altoDesde] SMALLINT,
  [altoHasta] SMALLINT,
  [SalAccVueloVP] NVARCHAR(1),
  [InsCantidad] REAL,
  [nOpcionTesteroCen] SMALLINT,
  [anchoDesde] SMALLINT,
  [anchoHasta] SMALLINT,
  [pesoLamDesde] REAL,
  [pesoLamHasta] REAL,
  [DescuentoAdEje] REAL,
  [lstGuiaCentral] NVARCHAR(255),
  [DescuentoAdLama] REAL,
  [DescuentoAdEje_PañoDe] REAL,
  [DescuentoAdLama_PañoDe] REAL,
  [BajadaDF] NVARCHAR(1),
  [lstTesteroDstEje] NVARCHAR(255),
  [lstTerminal] NVARCHAR(255),
  [lstAccionamiento] NVARCHAR(255),
  [DescuentoAdCajon] REAL,
  [ConSinTaponesCS] NVARCHAR(1),
  [ConSinGrapasCS] NVARCHAR(1),
  [FormulaAnchoInsertar] NVARCHAR(100),
  [FormulaLargoInsertar] NVARCHAR(100),
  [FormulaOpcSel] NVARCHAR(100),
  [MotorUnico_SN] NVARCHAR(1),
  [ConSinGuiasCS] NVARCHAR(1),
  [AcabadoFuncionDst] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== CompFDibujoCond  (filas: 0) =====
CREATE TABLE [CompFDibujoCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [lstAltCaj] NVARCHAR(50),
  [lstEje] NVARCHAR(255),
  [lstAccionamiento] NVARCHAR(255),
  [nOpcionAccionamiento] NVARCHAR(100),
  [FormulaOpcSel] NVARCHAR(100),
  [IdDibujo] INTEGER,
  [lstArticulosEnDespiece] NVARCHAR(200),
  [lstArticulosTipoFiltro] NVARCHAR(1),
  PRIMARY KEY ([nLinea])
);

-- ===== CompFDimMaxPanyo  (filas: 0) =====
CREATE TABLE [CompFDimMaxPanyo] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [AnchoMax] SMALLINT,
  [AltoMax] SMALLINT,
  [AvisoSN] BOOLEAN NOT NULL,
  [BloqueoVentaSN] BOOLEAN NOT NULL,
  [AvisoTexto] NVARCHAR(255),
  PRIMARY KEY ([Estructura], [ArticuloLama])
);

-- ===== CompFLamaVinculada  (filas: 0) =====
CREATE TABLE [CompFLamaVinculada] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [ArticuloLamaVinculada] NVARCHAR(15),
  PRIMARY KEY ([Estructura], [ArticuloLama])
);

-- ===== CompFmanoDeObra  (filas: 0) =====
CREATE TABLE [CompFmanoDeObra] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [nOrden] SMALLINT,
  [lstAltCaj] NVARCHAR(50),
  [lstGuia] NVARCHAR(255),
  [lstOpcionAcc] NVARCHAR(100),
  [lstLama] NVARCHAR(255),
  [nOpcionTestero] SMALLINT,
  [ArticuloMO] NVARCHAR(15),
  [CantidadBase] REAL,
  [IncrementoAncho] REAL,
  [IncrementoAnchoIntervalo] REAL,
  [IncrementoAlto] REAL,
  [IncrementoAltoIntervalo] REAL,
  [ConSinGuiasCS] NVARCHAR(1),
  [CantidadDesde] REAL,
  [CantidadHasta] REAL,
  [CantidadPaños] SMALLINT,
  [ConSinVuelosCS] NVARCHAR(1),
  [LamasTotalDesde] SMALLINT,
  [LamasTotalHasta] SMALLINT,
  [IncrementoAnchoDesde] REAL,
  [IncrementoAltoDesde] REAL,
  [PesoLamDesde] REAL,
  [PesoLamHasta] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== CompFMotorAnchoMin  (filas: 0) =====
CREATE TABLE [CompFMotorAnchoMin] (
  [Estructura] NVARCHAR(60) NOT NULL,
  [ArticuloMotor] NVARCHAR(60) NOT NULL,
  [AnchoMin] SMALLINT,
  PRIMARY KEY ([Estructura], [ArticuloMotor])
);

-- ===== CompFopcsAcc  (filas: 0) =====
CREATE TABLE [CompFopcsAcc] (
  [Descripcion] NVARCHAR(40),
  [CodDisco] NVARCHAR(15),
  [nOpc] NVARCHAR(2),
  PRIMARY KEY ([nOpc])
);

-- ===== CompFPerfilBasculacion  (filas: 0) =====
CREATE TABLE [CompFPerfilBasculacion] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [ArticuloPerfilBasculacion] NVARCHAR(15),
  [DescuentoCorte] REAL,
  PRIMARY KEY ([Estructura], [ArticuloLama])
);

-- ===== CompFPerfilBasculacionPosicion  (filas: 0) =====
CREATE TABLE [CompFPerfilBasculacionPosicion] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloLama] NVARCHAR(15) NOT NULL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [Posicion] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== CompFPiezasVal  (filas: 0) =====
CREATE TABLE [CompFPiezasVal] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Funcion] NVARCHAR(20) NOT NULL,
  [lstLama] NVARCHAR(255),
  [lstGuia] NVARCHAR(255),
  [codArticulo] NVARCHAR(15),
  [lstEje] NVARCHAR(255),
  [anchoDesde] SMALLINT,
  [anchoHasta] SMALLINT,
  [SeleccionAutoSN] BOOLEAN NOT NULL,
  [BajadaDF] NVARCHAR(1),
  [pesoLamDesde] REAL,
  [pesoLamHasta] REAL,
  [lstAcabadoLama] NVARCHAR(255),
  [MotorSN] NVARCHAR(1),
  [lstAltCaj] NVARCHAR(50),
  [codArticuloGuiaDerecha] NVARCHAR(15),
  [CambiarGuiasSiCambiaManoSN] BOOLEAN NOT NULL,
  [Orden] SMALLINT,
  [nOpcionTestero] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== CompFSalidaAccionamiento  (filas: 0) =====
CREATE TABLE [CompFSalidaAccionamiento] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Salida] NVARCHAR(1) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [lstOpcionesAccionamiento] NVARCHAR(100),
  [lstGuias] NVARCHAR(255),
  [lstAltCaj] NVARCHAR(50),
  [Orden] SMALLINT,
  [SeleccionAutoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== CompFSubfamiliasMotor  (filas: 0) =====
CREATE TABLE [CompFSubfamiliasMotor] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Estructura], [Familia], [Subfamilia])
);

-- ===== CompFTapasCajon  (filas: 0) =====
CREATE TABLE [CompFTapasCajon] (
  [Estructura] NVARCHAR(60) NOT NULL,
  [TipoTapa] NVARCHAR(15) NOT NULL,
  [Posicion] NVARCHAR(10) NOT NULL,
  [NumeroTapa] SMALLINT,
  PRIMARY KEY ([Estructura], [TipoTapa], [Posicion])
);

-- ===== CompFTiposMotor  (filas: 0) =====
CREATE TABLE [CompFTiposMotor] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== CondicionesResidencia  (filas: 0) =====
CREATE TABLE [CondicionesResidencia] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Nombre] NVARCHAR(60),
  PRIMARY KEY ([Codigo])
);

-- ===== ConfigMecMall  (filas: 260) =====
CREATE TABLE [ConfigMecMall] (
  [nLin] INTEGER NOT NULL,
  [Serie] NVARCHAR(15),
  [ManoID] NVARCHAR(1),
  [HojaDesde] REAL,
  [HojaHasta] REAL,
  [Articulo] NVARCHAR(15),
  PRIMARY KEY ([nLin])
);

-- ===== ConfigSeries  (filas: 30) =====
CREATE TABLE [ConfigSeries] (
  [Serie] NVARCHAR(15),
  [PVCsn] BOOLEAN NOT NULL,
  [gGarra] NVARCHAR(15),
  [gTorGarra] NVARCHAR(15),
  [gGarraAncho] REAL,
  [gGarraAnchoMin] REAL,
  [gGarraAnchoCdad] REAL,
  [gGarraAlto] REAL,
  [gGarraAltoMin] REAL,
  [gGarraAltoCdad] REAL,
  [Corr2H] NVARCHAR(15),
  [Corr3H] NVARCHAR(15),
  [Corr4H] NVARCHAR(15),
  [Corr6H] NVARCHAR(15),
  [CorrGui] NVARCHAR(15),
  [CorrDescr2H] NVARCHAR(50),
  [CorrDescr3H] NVARCHAR(50),
  [CorrDescr4H] NVARCHAR(50),
  [CorrDescr6H] NVARCHAR(50),
  [CorrDescrGui] NVARCHAR(50),
  [aAdP] NVARCHAR(15),
  [opcSN] BOOLEAN NOT NULL,
  [OpcVenSN] BOOLEAN NOT NULL,
  [OpcPtaCSN] BOOLEAN NOT NULL,
  [OpcPCanulaCremSN] BOOLEAN NOT NULL,
  [aCierrap] NVARCHAR(15),
  [aAdPCdad] REAL,
  [Abat1H] NVARCHAR(15),
  [Abat1HPC] NVARCHAR(15),
  [Abat1OB] NVARCHAR(15),
  [Abat1HV] NVARCHAR(15),
  [Abat2H] NVARCHAR(15),
  [Abat2HPC] NVARCHAR(15),
  [Abat2OB] NVARCHAR(15),
  [Abat3H] NVARCHAR(15),
  [Abat4H] NVARCHAR(15),
  [Abat5H] NVARCHAR(15),
  [Abat6H] NVARCHAR(15),
  [AbatOP] NVARCHAR(15),
  [AbatDescr1H] NVARCHAR(50),
  [AbatDescr1HPC] NVARCHAR(50),
  [AbatDescr1OB] NVARCHAR(50),
  [AbatDescr1HV] NVARCHAR(50),
  [AbatDescr2H] NVARCHAR(50),
  [AbatDescr2HPC] NVARCHAR(50),
  [AbatDescr2OB] NVARCHAR(50),
  [AbatDescr3H] NVARCHAR(50),
  [AbatDescr4H] NVARCHAR(50),
  [AbatDescr5H] NVARCHAR(50),
  [AbatDescr6H] NVARCHAR(50),
  [AbatDescrOP] NVARCHAR(50),
  [HerrInclArtSN] BOOLEAN NOT NULL,
  [HerrInclCosteSN] BOOLEAN NOT NULL,
  [HerrBibliotecaSN] BOOLEAN NOT NULL,
  [HerrUsuarioSN] BOOLEAN NOT NULL,
  [PlegHerr] NVARCHAR(15),
  [PlegDescr] NVARCHAR(50),
  [PivHerr] NVARCHAR(15),
  [PivDescr] NVARCHAR(50),
  [MCherrHF] NVARCHAR(15),
  [MCherrHP] NVARCHAR(15),
  [MCHFdescr] NVARCHAR(50),
  [MCHPdescr] NVARCHAR(50),
  [AluminioMaderaSN] BOOLEAN NOT NULL,
  [CodigoSerieMec] NVARCHAR(15),
  [pvcHerrOpcionesSN] BOOLEAN NOT NULL,
  [pvcHerrOpc1descripcion] NVARCHAR(30),
  [pvcHerrOpc2descripcion] NVARCHAR(30),
  [valorUserie] REAL,
  [AcaValPerfilesMVSN] BOOLEAN NOT NULL,
  [PermeabilidadAire] NVARCHAR(10),
  [AbatOP2H] NVARCHAR(15),
  [AbatDescrOP2H] NVARCHAR(50),
  [AbatCV] NVARCHAR(15),
  [AbatDescrCV] NVARCHAR(50),
  [PVCPerfilesAluSN] BOOLEAN NOT NULL,
  [Corr5H] NVARCHAR(15),
  [Corr1HM] NVARCHAR(15),
  [Corr2HM] NVARCHAR(15),
  [CorrDescr5H] NVARCHAR(50),
  [CorrDescr1HM] NVARCHAR(50),
  [CorrDescr2HM] NVARCHAR(50),
  [SubFamPerf] NVARCHAR(10),
  [SubFamAcc] NVARCHAR(10),
  PRIMARY KEY ([Serie])
);

-- ===== ConfigSeriesApert  (filas: 556) =====
CREATE TABLE [ConfigSeriesApert] (
  [Orden] INTEGER NOT NULL,
  [Serie] NVARCHAR(15),
  [Apertura] NVARCHAR(10),
  [PosibleSN] BOOLEAN NOT NULL,
  [AnchoMin] REAL,
  [AltoMin] REAL,
  [AnchoMax] REAL,
  [AltoMax] REAL,
  PRIMARY KEY ([Serie], [Apertura])
);

-- ===== ConfigSeriesApertDesc  (filas: 77) =====
CREATE TABLE [ConfigSeriesApertDesc] (
  [TipoSerie] NVARCHAR(1) NOT NULL,
  [Apertura] NVARCHAR(50) NOT NULL,
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([TipoSerie], [Apertura])
);

-- ===== ConfigSeriesAsoc  (filas: 725) =====
CREATE TABLE [ConfigSeriesAsoc] (
  [nLin] INTEGER NOT NULL,
  [Conjunto] NVARCHAR(15),
  [TipoHoja] NVARCHAR(6),
  [Articulo] NVARCHAR(15),
  [Cantidad] REAL,
  [Acabado] NVARCHAR(10),
  [Intervalo] REAL,
  [MedidaMin] REAL,
  [MedidaMax] REAL,
  [UnidadesMin] REAL,
  [UnidadesMax] REAL,
  [TipoMedCV] NVARCHAR(1),
  [Descuento] REAL,
  [FormulaL] NVARCHAR(20),
  [FormulaA] NVARCHAR(20),
  [TipoCorte] NVARCHAR(2),
  [SoloUnaSN] BOOLEAN NOT NULL,
  [FamiliaAsoc] NVARCHAR(10),
  [ComponenteAsoc] NVARCHAR(5),
  [GrupoAsoc] NVARCHAR(3),
  [ArticuloAsoc] NVARCHAR(15),
  [nOpcion] SMALLINT,
  [AsocAGrupoAsoc] NVARCHAR(3),
  [AperturaTH] SMALLINT,
  [ManoID] NVARCHAR(1),
  [PosTrab] NVARCHAR(1),
  [PlHojasX] SMALLINT,
  [PlHojasY] SMALLINT,
  [AltoALMin] REAL,
  [AltoALMax] REAL,
  [PVCrefuerzoSN] BOOLEAN NOT NULL,
  [SoloPerfPpalSN] BOOLEAN NOT NULL,
  [FormulaOpcion] NVARCHAR(255),
  [AsocAModulo] NVARCHAR(30),
  [AsociadoA] NVARCHAR(255),
  [PlHojasXYstr] NVARCHAR(255),
  [FormulaTablaHerrAlto] NVARCHAR(20),
  [FormulaTablaHerrAncho] NVARCHAR(20),
  [TablaHerrajeInsertar] NVARCHAR(20),
  [LstIdMecOperaciones] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== ConfigSeriesCatOH  (filas: 15) =====
CREATE TABLE [ConfigSeriesCatOH] (
  [Conjunto] NVARCHAR(15) NOT NULL,
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [OpcExcluyentesSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Conjunto], [Codigo])
);

-- ===== ConfigSeriesCotas  (filas: 4378) =====
CREATE TABLE [ConfigSeriesCotas] (
  [Serie] NVARCHAR(15),
  [NombreCota] NVARCHAR(15),
  [valor] REAL,
  PRIMARY KEY ([Serie], [NombreCota])
);

-- ===== ConfigSeriesDescuentos  (filas: 0) =====
CREATE TABLE [ConfigSeriesDescuentos] (
  [Serie] NVARCHAR(15) NOT NULL,
  [GrupoPrincipal] NVARCHAR(5) NOT NULL,
  [Grupo] NVARCHAR(5) NOT NULL,
  [TipoHoja] NVARCHAR(6) NOT NULL,
  [Descuento] REAL,
  [TipoPerfilEspecial] NVARCHAR(50),
  [FormulaDtoEspecial] NVARCHAR(100),
  [DescuentoEspSumar] REAL,
  [TipoPerfilEspecial2] NVARCHAR(50),
  [FormulaDtoEspecial2] NVARCHAR(100),
  PRIMARY KEY ([Serie], [GrupoPrincipal], [Grupo], [TipoHoja])
);

-- ===== ConfigSeriesHerraje  (filas: 6622) =====
CREATE TABLE [ConfigSeriesHerraje] (
  [Serie] NVARCHAR(15),
  [Accesorio] NVARCHAR(15),
  [Cantidad] REAL,
  [Desde] REAL,
  [Hasta] REAL,
  [RefuDesdeA] REAL,
  [RefuHastaA] REAL,
  [CdadMO] REAL,
  [Accesorio_Opc2] NVARCHAR(15),
  [NombreAcc] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([Serie], [NombreAcc])
);

-- ===== ConfigSeriesHerrajeDesc  (filas: 1206) =====
CREATE TABLE [ConfigSeriesHerrajeDesc] (
  [NombreAcc] NVARCHAR(50) NOT NULL,
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([NombreAcc])
);

-- ===== ConfigSeriesHerrajeTMP  (filas: 0) =====
CREATE TABLE [ConfigSeriesHerrajeTMP] (
  [idSesion] INTEGER,
  [Accesorio] NVARCHAR(15),
  [Cantidad] REAL,
  [Desde] REAL,
  [Hasta] REAL,
  [Funcion] NVARCHAR(80),
  [DesdeHastaAL] NVARCHAR(1),
  [CdadCR] NVARCHAR(1),
  [RefuDesdeA] REAL,
  [RefuHastaA] REAL,
  [Accesorio_Opc2] NVARCHAR(15),
  [NombreAcc] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([NombreAcc], [idSesion])
);

-- ===== ConfigSeriesOPC  (filas: 94) =====
CREATE TABLE [ConfigSeriesOPC] (
  [Conjunto] NVARCHAR(15),
  [nOpcion] SMALLINT,
  [SelecDefSN] BOOLEAN NOT NULL,
  [DescrAutoSN] BOOLEAN NOT NULL,
  [OcultaSN] BOOLEAN NOT NULL,
  [CategoriaOH] NVARCHAR(3),
  [fOpcSoloActiva] NVARCHAR(255),
  [fOpcIncompatible] NVARCHAR(255),
  [tipoAcabado] NVARCHAR(3),
  [acabadosValidos] NVARCHAR(255),
  [Descripcion] NVARCHAR(100),
  [NoSelecDefEnCESsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Conjunto], [nOpcion])
);

-- ===== ConfigSeriesOPCconfig  (filas: 0) =====
CREATE TABLE [ConfigSeriesOPCconfig] (
  [Conjunto] NVARCHAR(15),
  [nOpcion] SMALLINT,
  [SelecDefSN] BOOLEAN NOT NULL,
  [DescrAutoSN] BOOLEAN NOT NULL,
  [OcultaSN] BOOLEAN NOT NULL,
  [CategoriaOH] NVARCHAR(3),
  [fOpcSoloActiva] NVARCHAR(255),
  [fOpcIncompatible] NVARCHAR(255),
  [tipoAcabado] NVARCHAR(3),
  [acabadosValidos] NVARCHAR(255),
  [Descripcion] NVARCHAR(100),
  [NoSelecDefEnCESsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Conjunto], [nOpcion])
);

-- ===== ConfigSeriesTipoHojaDesc  (filas: 49) =====
CREATE TABLE [ConfigSeriesTipoHojaDesc] (
  [TipoSerie] NVARCHAR(1) NOT NULL,
  [TipoHoja] NVARCHAR(50) NOT NULL,
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([TipoSerie], [TipoHoja])
);

-- ===== ConfigSeriesValorU  (filas: 362) =====
CREATE TABLE [ConfigSeriesValorU] (
  [codPerfil1] NVARCHAR(15) NOT NULL,
  [codPerfil2] NVARCHAR(15) NOT NULL,
  [valorU] REAL,
  [SeccionMM] REAL,
  [UsuarioSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([codPerfil1], [codPerfil2])
);

-- ===== Conjuntos  (filas: 383) =====
CREATE TABLE [Conjuntos] (
  [Codigo] NVARCHAR(15),
  [CodSerie] NVARCHAR(15),
  [Familia] NVARCHAR(10),
  [FamiliaAsociada] NVARCHAR(10),
  [TablaHojas] NVARCHAR(4),
  [TablaHojas2] NVARCHAR(4),
  [TablaFijos2] NVARCHAR(4),
  [TablaHojas3] NVARCHAR(4),
  [TablaFijos3] NVARCHAR(4),
  [TablaHojas4] NVARCHAR(4),
  [TablaFijos4] NVARCHAR(4),
  [TablaHojas5] NVARCHAR(4),
  [TablaFijos5] NVARCHAR(4),
  [TablaFijos] NVARCHAR(4),
  [GrosorCristal] SMALLINT,
  [ColorVidrio] INTEGER,
  [VidrioMOsn] BOOLEAN NOT NULL,
  [VidrioMOad] REAL,
  [VidrioRecCurSN] BOOLEAN NOT NULL,
  [VidrioBIntSN] BOOLEAN NOT NULL,
  [VidrioBExtSN] BOOLEAN NOT NULL,
  [VidrioNoJuntaSN] BOOLEAN NOT NULL,
  [VidrioNoJunqSN] BOOLEAN NOT NULL,
  [panelMHmoLama] REAL,
  [DescuentoGuia] REAL,
  [ExcesoGuia] REAL,
  [GuiaCajeadoSN] BOOLEAN NOT NULL,
  [GuiaPza2] NVARCHAR(15),
  [GuiaFelp] NVARCHAR(15),
  [GuiaTor] NVARCHAR(15),
  [GuiaTorCdad] REAL,
  [GuiaDescrCompSN] BOOLEAN NOT NULL,
  [DobleHojaSN] BOOLEAN NOT NULL,
  [TablaDobleH] NVARCHAR(4),
  [TablaDobleH2] NVARCHAR(4),
  [TablaDobleH3] NVARCHAR(4),
  [TablaDobleH4] NVARCHAR(4),
  [TablaDobleH5] NVARCHAR(4),
  [TipoPerf] NVARCHAR(3),
  [CorrGrosorVid] REAL,
  [CorrGrosorVidDA] REAL,
  [SubSerieSN] BOOLEAN NOT NULL,
  [SubSerieDe] NVARCHAR(4),
  [SeriePpalSN] BOOLEAN NOT NULL,
  [herr1HA] NVARCHAR(15),
  [herr1HAP] NVARCHAR(15),
  [herr1HO] NVARCHAR(15),
  [herr1HPC] NVARCHAR(15),
  [herr1HV] NVARCHAR(15),
  [herr1HPI] NVARCHAR(15),
  [herr1HOP] NVARCHAR(15),
  [herr2HA] NVARCHAR(15),
  [herr2HAPC] NVARCHAR(15),
  [herr2HA1O] NVARCHAR(15),
  [herr2HAP] NVARCHAR(15),
  [herr2HA1OP] NVARCHAR(15),
  [herr3HA] NVARCHAR(15),
  [herr3HAP] NVARCHAR(15),
  [herr4HA] NVARCHAR(15),
  [herr4HAP] NVARCHAR(15),
  [herr5HA] NVARCHAR(15),
  [herr5HAP] NVARCHAR(15),
  [herr6HA] NVARCHAR(15),
  [herr6HAP] NVARCHAR(15),
  [herr3HPl] NVARCHAR(15),
  [herr4HPl] NVARCHAR(15),
  [herr5HPl] NVARCHAR(15),
  [herr6HPl] NVARCHAR(15),
  [herr7HPl] NVARCHAR(15),
  [herr8HPl] NVARCHAR(15),
  [herr9HPl] NVARCHAR(15),
  [herr10HPl] NVARCHAR(15),
  [herr11HPl] NVARCHAR(15),
  [herr12HPl] NVARCHAR(15),
  [herr13HPl] NVARCHAR(15),
  [herr14HPl] NVARCHAR(15),
  [herr15HPl] NVARCHAR(15),
  [herr2HC] NVARCHAR(15),
  [herr2HCP] NVARCHAR(15),
  [herr2HG] NVARCHAR(15),
  [herr2HC2] NVARCHAR(15),
  [herr3HC] NVARCHAR(15),
  [herr3HCP] NVARCHAR(15),
  [herr4HC] NVARCHAR(15),
  [herr4HCP] NVARCHAR(15),
  [herr6HC] NVARCHAR(15),
  [herr6HCP] NVARCHAR(15),
  [herrMCHF] NVARCHAR(15),
  [herrMCHP] NVARCHAR(15),
  [mo1HA] NVARCHAR(5),
  [mo1HAP] NVARCHAR(5),
  [mo1HO] NVARCHAR(5),
  [mo1HPC] NVARCHAR(5),
  [mo1HV] NVARCHAR(5),
  [mo1HPI] NVARCHAR(5),
  [mo1HOP] NVARCHAR(5),
  [mo1HOPP] NVARCHAR(5),
  [mo2HA] NVARCHAR(5),
  [mo2HA1O] NVARCHAR(5),
  [mo2HAP] NVARCHAR(5),
  [mo2HAPC] NVARCHAR(5),
  [mo2HA1OP] NVARCHAR(5),
  [mo3HA] NVARCHAR(5),
  [mo3HAP] NVARCHAR(5),
  [mo4HA] NVARCHAR(5),
  [mo4HAP] NVARCHAR(5),
  [mo5HA] NVARCHAR(5),
  [mo5HAP] NVARCHAR(5),
  [mo6HA] NVARCHAR(5),
  [mo6HAP] NVARCHAR(5),
  [mo3HPl] NVARCHAR(5),
  [mo4HPl] NVARCHAR(5),
  [mo5HPl] NVARCHAR(5),
  [mo6HPl] NVARCHAR(5),
  [mo7HPl] NVARCHAR(5),
  [mo8HPl] NVARCHAR(5),
  [mo9HPl] NVARCHAR(5),
  [mo10HPl] NVARCHAR(5),
  [mo11HPl] NVARCHAR(5),
  [mo12HPl] NVARCHAR(5),
  [mo13HPl] NVARCHAR(5),
  [mo14HPl] NVARCHAR(5),
  [mo15HPl] NVARCHAR(5),
  [mo2HC] NVARCHAR(5),
  [mo2HCP] NVARCHAR(5),
  [mo2HG] NVARCHAR(5),
  [mo2HC2] NVARCHAR(5),
  [mo3HC] NVARCHAR(5),
  [mo3HCP] NVARCHAR(5),
  [mo4HC] NVARCHAR(5),
  [mo4HCP] NVARCHAR(5),
  [mo6HC] NVARCHAR(5),
  [mo6HCP] NVARCHAR(5),
  [moMCHF] NVARCHAR(5),
  [moMCHP] NVARCHAR(5),
  [BibliotecaSN] BOOLEAN NOT NULL,
  [SinHerrajeSN] BOOLEAN NOT NULL,
  [SoloHerrajeSN] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [IncluirArtSN] BOOLEAN NOT NULL,
  [IncluirCosteLBsn] BOOLEAN NOT NULL,
  [UsuarioEspecSN] BOOLEAN NOT NULL,
  [DtosUsuarioSN] BOOLEAN NOT NULL,
  [Aca2AsocSN] BOOLEAN NOT NULL,
  [Aca2JunqSN] BOOLEAN NOT NULL,
  [ConfiguradorSN] BOOLEAN NOT NULL,
  [AbatTravRetSN] BOOLEAN NOT NULL,
  [AbatTCjunq] NVARCHAR(2),
  [SelecImpSN] BOOLEAN NOT NULL,
  [AbatZocIngleteSN] BOOLEAN NOT NULL,
  [AbatSinInversorSN] BOOLEAN NOT NULL,
  [AbatPlegableSN] BOOLEAN NOT NULL,
  [CorrPerimetralSN] BOOLEAN NOT NULL,
  [GuiaAnguloInf] REAL,
  [AcabadoBicolorSN] BOOLEAN NOT NULL,
  [SerieValidaVentaSN] BOOLEAN NOT NULL,
  [DescuentoGuiaEnCompacto] REAL,
  [herr2HOP] NVARCHAR(15),
  [herrCV] NVARCHAR(15),
  [mo2HOP] NVARCHAR(5),
  [mo2HOPP] NVARCHAR(5),
  [mo1HCV] NVARCHAR(5),
  [mo2HCV] NVARCHAR(5),
  [herr5HC] NVARCHAR(15),
  [herr5HCP] NVARCHAR(15),
  [herr1HCM] NVARCHAR(15),
  [herr2HCM] NVARCHAR(15),
  [panelMHartRef] NVARCHAR(15),
  [panelMHcdadRef] SMALLINT,
  [panelMHdtoRef] REAL,
  [herr2HPl] NVARCHAR(15),
  [mo2HPl] NVARCHAR(5),
  [mo1HCM] NVARCHAR(5),
  [mo2HCM] NVARCHAR(5),
  [mo5HC] NVARCHAR(5),
  [mo5HCP] NVARCHAR(5),
  [CorrPerimetralMarcoSN] BOOLEAN NOT NULL,
  [CorrPerimetralHojaSN] BOOLEAN NOT NULL,
  [FechaHoraAct] DATE,
  [herr1HPl] NVARCHAR(15),
  [herr16HPl] NVARCHAR(15),
  [herr17HPl] NVARCHAR(15),
  [herr18HPl] NVARCHAR(15),
  [herr19HPl] NVARCHAR(15),
  [herr20HPl] NVARCHAR(15),
  [Descripcion] NVARCHAR(150),
  [DescripcionVentas] NVARCHAR(150),
  [ExcesoGuiaPza2] REAL,
  [DescuentoHorizontalMosquitera] REAL,
  [DescuentoVerticalMosquitera] REAL,
  [GeneraDescuentosPendienteSN] BOOLEAN NOT NULL,
  [GeneraHerrajePendienteSN] BOOLEAN NOT NULL,
  [GuiaAsocASeriesSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== ConjuntosAsoc  (filas: 17006) =====
CREATE TABLE [ConjuntosAsoc] (
  [nLin] INTEGER NOT NULL,
  [Conjunto] NVARCHAR(15),
  [Articulo] NVARCHAR(15),
  [Cantidad] REAL,
  [Acabado] NVARCHAR(10),
  [Intervalo] REAL,
  [MedidaMin] REAL,
  [MedidaMax] REAL,
  [UnidadesMin] REAL,
  [UnidadesMax] REAL,
  [TipoMedCV] NVARCHAR(1),
  [Descuento] REAL,
  [FormulaL] NVARCHAR(20),
  [FormulaA] NVARCHAR(20),
  [TipoCorte] NVARCHAR(2),
  [SoloUnaSN] BOOLEAN NOT NULL,
  [InsertadoSN] BOOLEAN NOT NULL,
  [FamiliaAsoc] NVARCHAR(10),
  [ComponenteAsoc] NVARCHAR(5),
  [GrupoAsoc] NVARCHAR(3),
  [ArticuloAsoc] NVARCHAR(15),
  [nOpcion] SMALLINT,
  [AsocAGrupoAsoc] NVARCHAR(3),
  [AperturaTH] SMALLINT,
  [ManoID] NVARCHAR(1),
  [PosTrab] NVARCHAR(1),
  [PlHojasX] SMALLINT,
  [PlHojasY] SMALLINT,
  [AltoALMin] REAL,
  [AltoALMax] REAL,
  [PVCrefuerzoSN] BOOLEAN NOT NULL,
  [SoloPerfPpalSN] BOOLEAN NOT NULL,
  [PlHojasXYstr] NVARCHAR(60),
  [FormulaOpcion] NVARCHAR(255),
  [AsocAModulo] NVARCHAR(30),
  [AsociadoA] NVARCHAR(255),
  [FormulaTablaHerrAlto] NVARCHAR(20),
  [FormulaTablaHerrAncho] NVARCHAR(20),
  [TablaHerrajeInsertar] NVARCHAR(20),
  [LstIdMecOperaciones] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== ConjuntosCatOH  (filas: 120) =====
CREATE TABLE [ConjuntosCatOH] (
  [Conjunto] NVARCHAR(15) NOT NULL,
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [OpcExcluyentesSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Conjunto], [Codigo])
);

-- ===== ConjuntosCV  (filas: 400) =====
CREATE TABLE [ConjuntosCV] (
  [Conjunto] NVARCHAR(15),
  [Familia] NVARCHAR(10) NOT NULL,
  [CV] NVARCHAR(3),
  [Componente] NVARCHAR(5),
  PRIMARY KEY ([Conjunto], [Familia], [CV])
);

-- ===== ConjuntosDescuentos  (filas: 15537) =====
CREATE TABLE [ConjuntosDescuentos] (
  [Conjunto] NVARCHAR(15),
  [Familia] NVARCHAR(10) NOT NULL,
  [GrupoPrinc] NVARCHAR(5) NOT NULL,
  [Grupo] NVARCHAR(5) NOT NULL,
  [TipoHoja] NVARCHAR(6),
  [Descuento] REAL,
  PRIMARY KEY ([Conjunto], [Familia], [GrupoPrinc], [Grupo], [TipoHoja])
);

-- ===== ConjuntosDescuentosDif  (filas: 1230) =====
CREATE TABLE [ConjuntosDescuentosDif] (
  [Conjunto] NVARCHAR(15),
  [GrupoPrinc] NVARCHAR(5) NOT NULL,
  [Grupo] NVARCHAR(5) NOT NULL,
  [TipoHoja] NVARCHAR(6),
  [idPerAdPrinc] INTEGER,
  [Descuento] REAL,
  PRIMARY KEY ([Conjunto], [GrupoPrinc], [Grupo], [TipoHoja], [idPerAdPrinc])
);

-- ===== ConjuntosDescuentosGlob  (filas: 0) =====
CREATE TABLE [ConjuntosDescuentosGlob] (
  [Conjunto] NVARCHAR(15),
  [Familia] NVARCHAR(10) NOT NULL,
  [Componente] NVARCHAR(5) NOT NULL,
  [HF] REAL,
  [VF] REAL,
  [HH] REAL,
  [VH] REAL,
  PRIMARY KEY ([Conjunto], [Familia], [Componente])
);

-- ===== ConjuntosGuiaSeriesAsoc  (filas: 0) =====
CREATE TABLE [ConjuntosGuiaSeriesAsoc] (
  [ConjuntoGuia] NVARCHAR(15) NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  PRIMARY KEY ([ConjuntoGuia], [Serie])
);

-- ===== ConjuntosLin  (filas: 3744) =====
CREATE TABLE [ConjuntosLin] (
  [Conjunto] NVARCHAR(15),
  [Componente] NVARCHAR(5),
  [Familia] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15),
  PRIMARY KEY ([Conjunto], [Componente], [Familia])
);

-- ===== ConjuntosMO  (filas: 0) =====
CREATE TABLE [ConjuntosMO] (
  [nLin] INTEGER NOT NULL,
  [Conjunto] NVARCHAR(15),
  [Concepto] NVARCHAR(5),
  PRIMARY KEY ([nLin])
);

-- ===== ConjuntosOpcionesHerraje  (filas: 1406) =====
CREATE TABLE [ConjuntosOpcionesHerraje] (
  [Conjunto] NVARCHAR(15),
  [nOpcion] SMALLINT,
  [SelecDefSN] BOOLEAN NOT NULL,
  [DescrAutoSN] BOOLEAN NOT NULL,
  [OcultaSN] BOOLEAN NOT NULL,
  [CategoriaOH] NVARCHAR(3),
  [fOpcSoloActiva] NVARCHAR(255),
  [fOpcIncompatible] NVARCHAR(255),
  [tipoAcabado] NVARCHAR(3),
  [acabadosValidos] NVARCHAR(255),
  [Descripcion] NVARCHAR(100),
  [NoSelecDefEnCESsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([Conjunto], [nOpcion])
);

-- ===== ConsSesiones  (filas: 0) =====
CREATE TABLE [ConsSesiones] (
  [idSesion] INTEGER NOT NULL,
  PRIMARY KEY ([idSesion])
);

-- ===== Constantes  (filas: 1) =====
CREATE TABLE [Constantes] (
  [AcabadoUnico] NVARCHAR(10),
  [InsertarMedidas] NVARCHAR(2),
  [insMedDecimales] SMALLINT,
  [EditaLinOrdenAL] NVARCHAR(2),
  [EditaLinUds] NVARCHAR(2),
  [AcabadoPorDefecto] NVARCHAR(10),
  [PrecioPlastML] REAL,
  [FDArticulosSN] BOOLEAN NOT NULL,
  [CopiasVRec] SMALLINT,
  [VAlbaFormato] NVARCHAR(1),
  [VPedFormato] NVARCHAR(1),
  [VEditaLinArtEst] NVARCHAR(1),
  [DespunteFamilia] NVARCHAR(3),
  [DespuntePorcentaje] REAL,
  [DespunteLonMinOK] REAL,
  [DespSiempreSN] BOOLEAN NOT NULL,
  [VValoraACorteSN] BOOLEAN NOT NULL,
  [VValorACsoloFam] NVARCHAR(3),
  [ArticuloGICom] NVARCHAR(15),
  [ArticuloGIFin] NVARCHAR(15),
  [ArticuloGIPor] NVARCHAR(15),
  [ArticuloGIDes] NVARCHAR(15),
  [ArticuloGIOt] NVARCHAR(15),
  [ArticuloDtos] NVARCHAR(15),
  [GastosGenSN] BOOLEAN NOT NULL,
  [UbicDibujos] NVARCHAR(100),
  [UbicImpExp] NVARCHAR(100),
  [BibliotecaSN] BOOLEAN NOT NULL,
  [Enombre] NVARCHAR(80),
  [Edireccion] NVARCHAR(150),
  [Ecp] NVARCHAR(20),
  [EPoblacion] NVARCHAR(80),
  [EProvincia] NVARCHAR(80),
  [ETelefono] NVARCHAR(20),
  [EFax] NVARCHAR(20),
  [ContraUsuarios] NVARCHAR(30),
  [EtiqAltoPapel] SMALLINT,
  [EtiqAnchoPapel] SMALLINT,
  [EtiqIgnoraPapelSN] BOOLEAN NOT NULL,
  [EtiqAltoEtiqueta] REAL,
  [EtiqAnchoEtiqueta] REAL,
  [EtiqMargenX] SMALLINT,
  [EtiqMargenY] SMALLINT,
  [EtiqOrden] NVARCHAR(10),
  [EtiqOrdenOpt] NVARCHAR(5),
  [EtiqArtSunoSN] BOOLEAN NOT NULL,
  [EtiqCodBarEstilo] SMALLINT,
  [EtiqCodBarInfo] SMALLINT,
  [EtiqCodBarAncho] SMALLINT,
  [EtiqCodBarAlto] SMALLINT,
  [desRR] SMALLINT,
  [desRO] SMALLINT,
  [desRI] SMALLINT,
  [desOR] SMALLINT,
  [desOO] SMALLINT,
  [desOI] SMALLINT,
  [desIR] SMALLINT,
  [desIO] SMALLINT,
  [desII] SMALLINT,
  [desInicio] SMALLINT,
  [desFinal] SMALLINT,
  [CorteRedondeoTipo] NVARCHAR(1),
  [CorteRedDec] SMALLINT,
  [CorteFormatoHC] NVARCHAR(1),
  [CorteFormatoHCmedIE] NVARCHAR(1),
  [CorteOrden] NVARCHAR(3),
  [M2RespetarBandasSN] BOOLEAN NOT NULL,
  [M2Descuento] SMALLINT,
  [M2SupInf] SMALLINT,
  [M2Lat] SMALLINT,
  [CorteHCrefSN] BOOLEAN NOT NULL,
  [CorteHCPosTrabSN] BOOLEAN NOT NULL,
  [CorteCodBarPedSN] BOOLEAN NOT NULL,
  [CortePosMarcoM1M2] NVARCHAR(2),
  [CortePosHojaH1H2] NVARCHAR(2),
  [AgUsuarioMontaje] NVARCHAR(30),
  [OrdenarEA] NVARCHAR(10),
  [StockDAncho] REAL,
  [StockDLargo] REAL,
  [Almacen] NVARCHAR(5),
  [AlmacenRestos] NVARCHAR(5),
  [StockPorProvSN] BOOLEAN NOT NULL,
  [OptiLBProv] NVARCHAR(5),
  [ArticuloMO] NVARCHAR(15),
  [ArticuloMOC] NVARCHAR(15),
  [ArticuloMOprem] NVARCHAR(15),
  [ArticuloMOcomp] NVARCHAR(15),
  [ArticuloMOtap] NVARCHAR(15),
  [ArticuloMOmosq] NVARCHAR(15),
  [MOtipo] NVARCHAR(1),
  [ArticuloMOvid] NVARCHAR(15),
  [MOvidTiempoPerim] REAL,
  [MOvidTiempoUnidad] REAL,
  [MOvidTiempoSuperf] REAL,
  [BtnOpc] BOOLEAN NOT NULL,
  [BtnEliFam] BOOLEAN NOT NULL,
  [BtnCorte] BOOLEAN NOT NULL,
  [AlbFacResumSN] BOOLEAN NOT NULL,
  [VPedDiasEnt] SMALLINT,
  [PrefHerr] NVARCHAR(2),
  [AcotMedida] NVARCHAR(3),
  [FactorAcot] REAL,
  [CurDesMP] REAL,
  [CurDesReb] REAL,
  [CurDesCirc] REAL,
  [CurDesCarp2] REAL,
  [CurDesCarp3] REAL,
  [CurDesMPPatas] REAL,
  [CurDesCarp2Patas] REAL,
  [CurDesCarp3Patas] REAL,
  [TapCajSN] BOOLEAN NOT NULL,
  [TapNoDtoSupRegSN] BOOLEAN NOT NULL,
  [TapEliSupSiCajSN] BOOLEAN NOT NULL,
  [TapEliInfSiCajSN] BOOLEAN NOT NULL,
  [BandCondMarcoHueco] NVARCHAR(1),
  [PVCincrSol] REAL,
  [AltRecV] REAL,
  [AltRecVhasta] REAL,
  [AltRecP] REAL,
  [DisAltManSN] BOOLEAN NOT NULL,
  [DisAcotMH] NVARCHAR(1),
  [FamiliaTir] NVARCHAR(10),
  [TiradorGen] NVARCHAR(15),
  [CostePunto] REAL,
  [NumeroSerie] NVARCHAR(50),
  [CLUactualiza] NVARCHAR(50),
  [Version] NVARCHAR(10),
  [ImpExpNombreBBDD] NVARCHAR(40),
  [ImpExpDescripcionBD] NVARCHAR(80),
  [ImpExpEspecialSN] BOOLEAN NOT NULL,
  [TipoMedHM] NVARCHAR(1),
  [BuscaArtEspSN] BOOLEAN NOT NULL,
  [PremCajSN] BOOLEAN NOT NULL,
  [CorteHCCodCliSN] BOOLEAN NOT NULL,
  [CRVer] NVARCHAR(10),
  [InfoImpExp] NVARCHAR,
  [EDatosR] NVARCHAR(255),
  [CorteHCOFnumeroLinSN] BOOLEAN NOT NULL,
  [Ecif] NVARCHAR(30),
  [Eemail] NVARCHAR(150),
  [EWeb] NVARCHAR(150),
  [EPersonaFisicaJuridica] NVARCHAR(8),
  [ECondicionResidencia] NVARCHAR(1),
  [EPais] NVARCHAR(10),
  [BtnOpcEnCompactoF] BOOLEAN NOT NULL,
  [Firma] NVARCHAR(30),
  [nLinea] INTEGER NOT NULL,
  [ArticuloGIgen] NVARCHAR(15),
  [ETelefono2] NVARCHAR(20),
  [EMovil] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== ConstantesInterfaz  (filas: 1) =====
CREATE TABLE [ConstantesInterfaz] (
  [MenusImgSN] BOOLEAN NOT NULL,
  [BarraNavSN] BOOLEAN NOT NULL,
  [FocoIluminaSN] BOOLEAN NOT NULL
);

-- ===== ContaCanales  (filas: 0) =====
CREATE TABLE [ContaCanales] (
  [nLinea] INTEGER NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Prioridad] SMALLINT,
  [Canal] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== ContaCCAC  (filas: 0) =====
CREATE TABLE [ContaCCAC] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Prioridad] SMALLINT,
  [CuentaContable] NVARCHAR(15),
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Subfamilia], [Articulo], [Acabado], [Proveedor], [Delegacion], [Serie])
);

-- ===== ContaCCAG  (filas: 0) =====
CREATE TABLE [ContaCCAG] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acreedor] NVARCHAR(5) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Prioridad] SMALLINT,
  [CuentaContable] NVARCHAR(15),
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Subfamilia], [Articulo], [Acabado], [Acreedor], [Serie])
);

-- ===== ContaCCAV  (filas: 0) =====
CREATE TABLE [ContaCCAV] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Prioridad] SMALLINT,
  [CuentaContable] NVARCHAR(15),
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [TraspasarCuentaSN] BOOLEAN NOT NULL,
  [DescripcionCuentaContable] NVARCHAR(255),
  [Acabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Subfamilia], [Articulo], [Acabado], [Delegacion], [Serie])
);

-- ===== contaCCAVEstr  (filas: 0) =====
CREATE TABLE [contaCCAVEstr] (
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Prioridad] SMALLINT,
  [CuentaContable] NVARCHAR(15),
  [TraspasarCuentaSN] BOOLEAN NOT NULL,
  [DescripcionCuentaContable] NVARCHAR(255),
  [SeriePerfiles] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([FamiliaEstr], [Estructura], [Acabado], [SeriePerfiles], [Delegacion], [Serie])
);

-- ===== ContaConfig  (filas: 1) =====
CREATE TABLE [ContaConfig] (
  [DigSubcta] SMALLINT,
  [PrefCli] NVARCHAR(10),
  [PrefProv] NVARCHAR(10),
  [CVentas] NVARCHAR(15),
  [CCompras] NVARCHAR(15),
  [CCliContado] NVARCHAR(15),
  [CPDescr1] NVARCHAR(30),
  [CCP1] NVARCHAR(10),
  [CPDescr2] NVARCHAR(30),
  [CCP2] NVARCHAR(10),
  [CPDescr3] NVARCHAR(30),
  [CCP3] NVARCHAR(10),
  [CPDescr4] NVARCHAR(30),
  [CCP4] NVARCHAR(10),
  [CPDescr5] NVARCHAR(30),
  [CCP5] NVARCHAR(10),
  [Formato] NVARCHAR(30),
  [CBonific] NVARCHAR(15),
  [CPrefGestCob] NVARCHAR(6),
  [CPrefDescuento] NVARCHAR(6),
  [FormulaConcSN] BOOLEAN NOT NULL,
  [FormulaVenta] NVARCHAR(200),
  [FormulaCompra] NVARCHAR(200),
  [FormulaIVA] NVARCHAR(200),
  [FormulaCobro] NVARCHAR(200),
  [FormulaPago] NVARCHAR(200),
  [CobPagTipoVto] NVARCHAR(1),
  [PrefEfecCob] NVARCHAR(10),
  [FormulaPagare] NVARCHAR(200),
  [FormulaDescEfecCob] NVARCHAR(200),
  [CDtoVentas] NVARCHAR(15),
  [CDtoCompras] NVARCHAR(15),
  [MicrolabCEnlace] INTEGER,
  [VisualNTDiario] NVARCHAR(2),
  [FormulaCobPdte] NVARCHAR(200),
  [FormulaPagPdte] NVARCHAR(200),
  [PrefEfecPag] NVARCHAR(10),
  [FormulaDescEfecPag] NVARCHAR(200),
  [MasterSQLNumAsi] INTEGER,
  [CGastos] NVARCHAR(15),
  [PrefAcre] NVARCHAR(10),
  [FormulaGasto] NVARCHAR(200),
  [CDtoPPVentas] NVARCHAR(15),
  [CDtoPPCompras] NVARCHAR(15),
  [CRetVentas] NVARCHAR(15),
  [CRetCompras] NVARCHAR(15),
  [ContabDtoPPSN] BOOLEAN NOT NULL,
  [ContabRetSN] BOOLEAN NOT NULL,
  [FormulaDtoPP] NVARCHAR(200),
  [FormulaRet] NVARCHAR(200),
  [EquivalenciaSerieSN] BOOLEAN NOT NULL,
  [CGastosImpago] NVARCHAR(15),
  [ConceptoIgualFacGasSN] BOOLEAN NOT NULL,
  [FormulaCli] NVARCHAR(200),
  [FormulaProv] NVARCHAR(200),
  [FormulaCobDesvalorizacion] NVARCHAR(200),
  [FormulaAnticipoCliente] NVARCHAR(200),
  [FormulaAnticipoProveedor] NVARCHAR(200),
  [FormulaCobImpago] NVARCHAR(200)
);

-- ===== ContaEmpresaDestino  (filas: 0) =====
CREATE TABLE [ContaEmpresaDestino] (
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Empresa] NVARCHAR(10),
  [ContawinTipoBBDD] NVARCHAR(10),
  [ContawinRutaAccess] NVARCHAR(255),
  [ContawinBBDD] NVARCHAR(50),
  [ContawinServidor] NVARCHAR(80),
  [ContawinUsuario] NVARCHAR(30),
  [ContawinPwd] NVARCHAR(30),
  PRIMARY KEY ([Delegacion], [Serie])
);

-- ===== ContaEquivalenciaSerie  (filas: 0) =====
CREATE TABLE [ContaEquivalenciaSerie] (
  [SerieOrig] NVARCHAR(1) NOT NULL,
  [SerieDest] NVARCHAR(5),
  PRIMARY KEY ([SerieOrig])
);

-- ===== ContaRegistro  (filas: 0) =====
CREATE TABLE [ContaRegistro] (
  [Id] INTEGER NOT NULL,
  [Fecha] DATE,
  [NumeroElementos] SMALLINT,
  [Usuario] NVARCHAR(30),
  [ComputerName] NVARCHAR(30),
  [Ruta] NVARCHAR(255),
  PRIMARY KEY ([Id])
);

-- ===== ContaRegistroLin  (filas: 0) =====
CREATE TABLE [ContaRegistroLin] (
  [nLin] INTEGER NOT NULL,
  [IdContaReg] INTEGER NOT NULL,
  [TipoElem] NVARCHAR(15),
  [DescripcionElem] NVARCHAR(30),
  [Identificador1] NVARCHAR(20),
  [Identificador2] NVARCHAR(20),
  [IdElemento] INTEGER NOT NULL,
  [Delegacion] NVARCHAR(2),
  [Serie] NVARCHAR(1),
  [CliProv] NVARCHAR(10),
  [CliProvNombre] NVARCHAR(100),
  [Importe] DOUBLE,
  [Resultado] NVARCHAR(10),
  [Observaciones] NVARCHAR(255),
  PRIMARY KEY ([nLin])
);

-- ===== CPagos  (filas: 0) =====
CREATE TABLE [CPagos] (
  [contador] INTEGER NOT NULL,
  [nPagoPend] INTEGER,
  [Fecha] DATE,
  [Importe] DOUBLE,
  [nMovCaja] INTEGER,
  [Caja] NVARCHAR(30),
  [CuentaCob] NVARCHAR(4),
  [ContabSN] BOOLEAN NOT NULL,
  [nPago] SMALLINT,
  [MetalicoSN] BOOLEAN NOT NULL,
  [FechaContab] DATE,
  [nRemesa] NVARCHAR(20),
  [siiEnviadaSN] BOOLEAN NOT NULL,
  [siiFechaEnvio] DATE,
  [siiEstadoAEAT] NVARCHAR(20),
  [siiMedioPago] NVARCHAR(2),
  [siiCuentaOMedio] NVARCHAR(20),
  [Destino] NVARCHAR(10),
  [nLineaCPagosAnticipo] INTEGER,
  [Usuario] NVARCHAR(30),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [ImporteDivisaPrincipal] DOUBLE,
  [DiferenciaCambioDivisaPrincipal] DOUBLE,
  [Archivo] NVARCHAR(20),
  PRIMARY KEY ([contador])
);

-- ===== CPagosAnticipos  (filas: 0) =====
CREATE TABLE [CPagosAnticipos] (
  [nLinea] INTEGER NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Fecha] DATE,
  [Importe] REAL,
  [Concepto] NVARCHAR(140),
  [Delegacion] NVARCHAR(2),
  [Destino_Caja] NVARCHAR(30),
  [Destino_nMovCaja] INTEGER,
  [Destino_CuentaCob] NVARCHAR(4),
  [ContabSN] BOOLEAN NOT NULL,
  [FechaContab] DATE,
  [Divisa] NVARCHAR(5),
  [DivisaPrincipal] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [ImportePendienteCompensar] REAL,
  [PendienteDivisaPrincipal] REAL,
  [TipoRemesa] NVARCHAR(5),
  [AnticipoArchivo] NVARCHAR(20)
);

-- ===== CPagosPend  (filas: 0) =====
CREATE TABLE [CPagosPend] (
  [contador] INTEGER NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Factura] NVARCHAR(20),
  [nVto] SMALLINT,
  [TipoRemesa] NVARCHAR(5),
  [Vencimiento] DATE,
  [Fecha] DATE,
  [Importe] DOUBLE,
  [Pendiente] DOUBLE,
  [Banco] NVARCHAR(30),
  [Pagare] NVARCHAR(10),
  [VencimientoPagare] DATE,
  [Tipo] NVARCHAR(1),
  [CuentaPagosPrev] NVARCHAR(4),
  [Serie] NVARCHAR(1),
  [RemesaSN] BOOLEAN NOT NULL,
  [nRemesa] NVARCHAR(20),
  [tmpProveedor] NVARCHAR(10),
  [tmpAcreedor] NVARCHAR(10),
  [ContabSN] BOOLEAN NOT NULL,
  [PagareContabSN] BOOLEAN NOT NULL,
  [RetencionSN] BOOLEAN NOT NULL,
  [PagoPendManualSN] BOOLEAN NOT NULL,
  [Concepto] NVARCHAR(255),
  [tmp_Dias] SMALLINT,
  [tmp_DiasPago] SMALLINT,
  [tmp_DiasPagoPond] REAL,
  [ImpresoSN] BOOLEAN NOT NULL,
  [tmp_ImpLetra1] NVARCHAR(100),
  [tmp_ImpLetra2] NVARCHAR(100),
  [FechaContab] DATE,
  [FechaPagareContab] DATE,
  [DomicDatosCuenSN] BOOLEAN NOT NULL,
  [domicEntidad] NVARCHAR(4),
  [domicSucursal] NVARCHAR(4),
  [domicDC] NVARCHAR(2),
  [domicCuenta] NVARCHAR(10),
  [domicNombreEntidad] NVARCHAR(40),
  [domicCuentaBancariaIntl] NVARCHAR(40),
  [DelegacionFac] NVARCHAR(2),
  [NumeroControlFac] INTEGER,
  [FormaPagoFac] NVARCHAR(5),
  [DomicBIC] NVARCHAR(11),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [PendienteDivisaPrincipal] REAL,
  [TipoDocumentoFac] NVARCHAR(5),
  [NumerosFacturasAgrupadas] NVARCHAR,
  [GrupoPagosPendSN] BOOLEAN NOT NULL,
  [FechaEmitidoPagare] DATE,
  [UsuarioPagare] NVARCHAR(30),
  [NumeroFacReferenciaProveedor] NVARCHAR(40),
  [NumerosFacReferenciaProveedorAgrupadas] NVARCHAR,
  [PagareArchivo] NVARCHAR(20),
  PRIMARY KEY ([contador])
);

-- ===== CPagosPendAgrupados  (filas: 0) =====
CREATE TABLE [CPagosPendAgrupados] (
  [Contador] INTEGER NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Factura] NVARCHAR(20),
  [nVto] SMALLINT,
  [TipoRemesa] NVARCHAR(5),
  [Fecha] DATE,
  [Vencimiento] DATE,
  [Importe] DOUBLE,
  [Pendiente] DOUBLE,
  [Banco] NVARCHAR(30),
  [Pagare] NVARCHAR(10),
  [VencimientoPagare] DATE,
  [Tipo] NVARCHAR(1),
  [CuentaPagosPrev] NVARCHAR(4),
  [Serie] NVARCHAR(1),
  [RemesaSN] BOOLEAN NOT NULL,
  [nRemesa] NVARCHAR(20),
  [tmpProveedor] NVARCHAR(20),
  [tmpAcreedor] NVARCHAR(20),
  [ContabSN] BOOLEAN NOT NULL,
  [PagareContabSN] BOOLEAN NOT NULL,
  [RetencionSN] BOOLEAN NOT NULL,
  [PagoPendManualSN] BOOLEAN NOT NULL,
  [Concepto] NVARCHAR(255),
  [tmp_Dias] SMALLINT,
  [tmp_DiasPago] SMALLINT,
  [tmp_DiasPagoPond] REAL,
  [ImpresoSN] BOOLEAN NOT NULL,
  [tmp_ImpLetra1] NVARCHAR(100),
  [tmp_ImpLetra2] NVARCHAR(100),
  [FechaContab] DATE,
  [FechaPagareContab] DATE,
  [DomicDatosCuenSN] BOOLEAN NOT NULL,
  [DomicEntidad] NVARCHAR(4),
  [DomicSucursal] NVARCHAR(4),
  [DomicDC] NVARCHAR(2),
  [DomicCuenta] NVARCHAR(10),
  [DomicNombreEntidad] NVARCHAR(40),
  [DomicCuentaBancariaIntl] NVARCHAR(40),
  [DelegacionFac] NVARCHAR(2),
  [NumeroControlFac] INTEGER,
  [FormaPagoFac] NVARCHAR(5),
  [DomicBIC] NVARCHAR(11),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [PendienteDivisaPrincipal] REAL,
  [TipoDocumentoFac] NVARCHAR(5),
  [NumerosFacturasAgrupadas] NVARCHAR,
  [nGrupoPagoPend] INTEGER,
  [FechaEmitidoPagare] DATE,
  [UsuarioPagare] NVARCHAR(30),
  [NumeroFacReferenciaProveedor] NVARCHAR(40),
  [NumerosFacReferenciaProveedorAgrupadas] NVARCHAR,
  [PagareArchivo] NVARCHAR(20),
  PRIMARY KEY ([Contador])
);

-- ===== CPedidos  (filas: 8) =====
CREATE TABLE [CPedidos] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Fecha] DATE,
  [PrevEntrega] DATE,
  [FechaEntrega] DATE,
  [ObsEntrega] NVARCHAR(80),
  [Observaciones] NVARCHAR,
  [Contacto] NVARCHAR(30),
  [Remitente] NVARCHAR(30),
  [ObsFormaPago] NVARCHAR(80),
  [Serie] NVARCHAR(1),
  [TransformacionSN] BOOLEAN NOT NULL,
  [FabricaSN] BOOLEAN NOT NULL,
  [FabricaKgBarr] NVARCHAR(1),
  [FabricaAcaPed] NVARCHAR(10),
  [PedFabricaOrigen] NVARCHAR(20),
  [ReferenciaObra] NVARCHAR(200),
  [Subtotal] DOUBLE,
  [DescuentoPorc] REAL,
  [Descuento] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [ImporteTotal] DOUBLE,
  [Estado] NVARCHAR(10),
  [nOrdenF] NVARCHAR(20),
  [nAlbaran] NVARCHAR(20),
  [Delegacion] NVARCHAR(2),
  [AlmacenDst] NVARCHAR(5),
  [AlmacenOrigTransf] NVARCHAR(5),
  [ObraTraspasadaSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30),
  [ignoraPedRepoSN] BOOLEAN NOT NULL,
  [DescuentoPPporc] REAL,
  [DescuentoPP] DOUBLE,
  [COferta] NVARCHAR(255),
  [CodObra] NVARCHAR(20),
  [autorizaSN] BOOLEAN NOT NULL,
  [autorizaResultado] NVARCHAR(10),
  [autorizaUsuarioSolicita] NVARCHAR(30),
  [autorizaUsuarioAut] NVARCHAR(30),
  [autorizaObservaciones] NVARCHAR(255),
  [TipoPedido] NVARCHAR(10),
  [TipoIVA] NVARCHAR(2),
  [ContPendienteEntradaSN] BOOLEAN NOT NULL,
  [ContPendienteEntradaFecha] DATE,
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [TipoDocumento] NVARCHAR(5),
  [NoActStockTransSN] BOOLEAN NOT NULL,
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [ReferenciaInterna] NVARCHAR(200),
  [IdDireccionEntrega] NVARCHAR(20),
  [EnviadoEMailSN] BOOLEAN NOT NULL,
  [FechaEnvioEMail] DATE,
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [PropuestaOrigen] NVARCHAR(20),
  [PeriodoFiscal] NVARCHAR(8),
  [Idioma] NVARCHAR(3),
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyTipoDocDest] NVARCHAR(6),
  [IntercompanyNumeroDest] NVARCHAR(20),
  [IntercompanyEmpresaSincDest] NVARCHAR(10),
  [IntercompanyTraspasadoSN] BOOLEAN NOT NULL,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [VRepartoSN] BOOLEAN NOT NULL,
  [VRepartoNum] NVARCHAR(20),
  [IdGrupoDocumentos] NVARCHAR(6),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [DevolucionSN] BOOLEAN NOT NULL,
  [DevolucionPedidoOrigen] NVARCHAR(20),
  [DevolucionMotivo] NVARCHAR(2),
  PRIMARY KEY ([Numero])
);

-- ===== CPedidosIVAResumen  (filas: 0) =====
CREATE TABLE [CPedidosIVAResumen] (
  [Numero] NVARCHAR(20) NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([Numero], [TipoIVA])
);

-- ===== CPedidosLin  (filas: 90) =====
CREATE TABLE [CPedidosLin] (
  [nLinea] INTEGER NOT NULL,
  [nPed] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcabadoOrig] NVARCHAR(10),
  [AcabadoPrev] NVARCHAR(10),
  [ObsAcabado] NVARCHAR(15),
  [PrecioOrig] REAL,
  [PrecioDst] REAL,
  [Descripcion] NVARCHAR(255),
  [Cdad] REAL,
  [CdadFacturada] REAL,
  [CdadPasar] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [PesoKgTeorico] REAL,
  [ReferenciaVentas] NVARCHAR(25),
  [FechaPrevEnt] DATE,
  [UnidadesEmb] REAL,
  [tmpCodFam] NVARCHAR(3),
  [tmpAnchoCM] REAL,
  [tmpLargoCM] REAL,
  [GrupoSN] BOOLEAN NOT NULL,
  [nGrupo] INTEGER,
  [ManufacturaSN] BOOLEAN NOT NULL,
  [mfArticuloPPal] NVARCHAR(15),
  [AcabadoOrigTonalidad] NVARCHAR(10),
  [AcabadoPrevTonalidad] NVARCHAR(10),
  [VOrig_TipoDoc] NVARCHAR(6),
  [VOrig_nDoc] INTEGER,
  [VOrig_nLinEstr] INTEGER,
  [VOrig_nLinGrp] INTEGER,
  [CdadFac_corrector] REAL,
  [AcaTonalidad] NVARCHAR(20),
  [COf_nLin] INTEGER,
  [CodObra] NVARCHAR(20),
  [DescrProvEmb] NVARCHAR(40),
  [ProveedorPerimetro] NVARCHAR(10),
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [OrigenCoste] NVARCHAR(15),
  [TipoIVA] NVARCHAR(2),
  [IVAporc] REAL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [tmpDescrProv] NVARCHAR(255),
  [ReferenciaPed] NVARCHAR(255),
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [PrecioCosteOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [CdadFacturadaEnCierre] REAL,
  [CodPrv] NVARCHAR(40),
  [CodProvEmb] NVARCHAR(40),
  [DescripcionIdioma] NVARCHAR(255),
  [Orden] SMALLINT,
  [Precio] DOUBLE,
  [ImporteTotal] DOUBLE,
  [CdadMetPorEmb] REAL,
  [VOrig_nLinea] INTEGER,
  PRIMARY KEY ([nLinea])
);

-- ===== CPedidosLinImpuestos  (filas: 0) =====
CREATE TABLE [CPedidosLinImpuestos] (
  [nCLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nCLinea], [CodigoImpuesto])
);

-- ===== CPedidosStockCalculoNecesidades  (filas: 0) =====
CREATE TABLE [CPedidosStockCalculoNecesidades] (
  [IdCalculo] INTEGER NOT NULL,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  [Descripcion] NVARCHAR(200),
  [ParametrosCalculoJson] NVARCHAR,
  [ResumenBrutJson] NVARCHAR,
  [PropuestaGeneradaSN] BOOLEAN NOT NULL,
  [IdPropuesta] INTEGER,
  PRIMARY KEY ([IdCalculo])
);

-- ===== CPedidosStockCalculoNecesidadesLin  (filas: 0) =====
CREATE TABLE [CPedidosStockCalculoNecesidadesLin] (
  [nLinea] INTEGER NOT NULL,
  [IdCalculo] INTEGER NOT NULL,
  [Almacen] NVARCHAR(5),
  [Articulo] NVARCHAR(60),
  [Acabado] NVARCHAR(10),
  [TipoArticulo] NVARCHAR(3),
  [Ancho] REAL,
  [Largo] REAL,
  [MetrajeConsumoTotal] REAL,
  [MediaDiariaConsumo] REAL,
  [DiasProyeccionNecesidad] REAL,
  [NecesidadInicial] REAL,
  [CorrectorNecesidad] REAL,
  [Necesidad] REAL,
  [MetrajeStockActual] REAL,
  [MetrajeComprasPendientes] REAL,
  [MetrajeVPedidosReposicion] REAL,
  [MetrajeVentasPendientes] REAL,
  [MetrajeLotesAsignados] REAL,
  [MetrajeFabricacionesPendientes] REAL,
  [TipoDocumentoReposicion] NVARCHAR(25),
  [AlmacenOrigenMovimiento] NVARCHAR(5),
  [Proveedor] NVARCHAR(10),
  [MetrajePropuesta] REAL,
  [MetrajePedir] REAL,
  [LineaRevisadaSN] BOOLEAN NOT NULL,
  [Observaciones] NVARCHAR(100),
  [OrigenBrutJson] NVARCHAR,
  [MetrajePedidoMinimo] REAL,
  [MetrajePedidoMaximo] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== CPedidosStockPropuesta  (filas: 0) =====
CREATE TABLE [CPedidosStockPropuesta] (
  [IdPropuesta] INTEGER NOT NULL,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([IdPropuesta])
);

-- ===== CPedidosStockPropuestaLin  (filas: 0) =====
CREATE TABLE [CPedidosStockPropuestaLin] (
  [nLinea] INTEGER NOT NULL,
  [IdPropuesta] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Almacen] NVARCHAR(5),
  [Ancho] REAL,
  [Largo] REAL,
  [Proveedor] NVARCHAR(10),
  [StockActual] REAL,
  [ComprasPend] REAL,
  [FabricacionesPend] REAL,
  [VentasPend] REAL,
  [Reservas] REAL,
  [StockMinimo] REAL,
  [StockSeguridad] REAL,
  [StockReposicion] REAL,
  [CantidadPropuesta] REAL,
  [CantidadPedir] REAL,
  [MetrajePedir] REAL,
  [MovimientoAlmacenOrigen] NVARCHAR(5),
  [Divisa] NVARCHAR(5),
  [TipoDocumento] NVARCHAR(25),
  [MetrajePedidoMinimo] REAL,
  [MetrajePedidoMaximo] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== CPedidoStockConfigOrigenBrut  (filas: 0) =====
CREATE TABLE [CPedidoStockConfigOrigenBrut] (
  [Almacen] NVARCHAR(5) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [AlmacenOrigenBrut] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([Almacen], [Proveedor], [AlmacenOrigenBrut])
);

-- ===== CPedidoStockConfigProvHab  (filas: 0) =====
CREATE TABLE [CPedidoStockConfigProvHab] (
  [Almacen] NVARCHAR(5) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [ProveedorHab] NVARCHAR(10),
  [DesdeOtroAlmacen] NVARCHAR(5),
  PRIMARY KEY ([Almacen], [Familia], [Acabado], [AcaTonalidad])
);

-- ===== CPedidoStockConfigStockMinDias  (filas: 0) =====
CREATE TABLE [CPedidoStockConfigStockMinDias] (
  [Almacen] NVARCHAR(5) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [SMDinPeriodoDiasRepo] SMALLINT,
  [TipoDocReposicion] NVARCHAR(4),
  [Familia] NVARCHAR(10) NOT NULL,
  [MetrajePedidoMinimo] REAL,
  [MetrajePedidoMaximo] REAL,
  PRIMARY KEY ([Almacen], [Familia], [Acabado], [AcaTonalidad])
);

-- ===== CPedVDoc  (filas: 6) =====
CREATE TABLE [CPedVDoc] (
  [nLin] INTEGER NOT NULL,
  [tipoDocOrig] NVARCHAR(6),
  [numDocOrig] NVARCHAR(20),
  [revDocOrig] NVARCHAR(3),
  [CPedDst] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== CRemesas  (filas: 0) =====
CREATE TABLE [CRemesas] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [FechaContable] DATE,
  [TipoRemesa] NVARCHAR(5),
  [CuentaCob] NVARCHAR(4),
  [ImporteTotal] DOUBLE,
  [nRemCSB] NVARCHAR(20),
  [contabPagosSeparadosSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2),
  [EstadoPago] NVARCHAR(10),
  [nLin] INTEGER NOT NULL,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [RemesaArchivo] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== CTotalDeleg  (filas: 0) =====
CREATE TABLE [CTotalDeleg] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [Proveedor] NVARCHAR(10),
  [Numero] NVARCHAR(20),
  [Delegacion] NVARCHAR(2),
  [Porcentaje] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== CTotalFam  (filas: 0) =====
CREATE TABLE [CTotalFam] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [Proveedor] NVARCHAR(10),
  [Numero] NVARCHAR(20),
  [Familia] NVARCHAR(10),
  [CuentaContable] NVARCHAR(15),
  [Total] DOUBLE,
  PRIMARY KEY ([nLin])
);

-- ===== CurvasGrupoSer  (filas: 0) =====
CREATE TABLE [CurvasGrupoSer] (
  [Codigo] NVARCHAR(5),
  [Familia] NVARCHAR(10),
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== CurvasGrupoSerLin  (filas: 0) =====
CREATE TABLE [CurvasGrupoSerLin] (
  [GrupoSer] NVARCHAR(5),
  [Serie] NVARCHAR(15),
  [TipoPerf] NVARCHAR(3),
  PRIMARY KEY ([GrupoSer], [Serie], [TipoPerf])
);

-- ===== CurvasPrecio  (filas: 0) =====
CREATE TABLE [CurvasPrecio] (
  [TipoCurva] SMALLINT,
  [GrupoSer] NVARCHAR(5),
  [Coste] REAL,
  [PVP1] REAL,
  [PVP2] REAL,
  [PVP3] REAL,
  [PVP4] REAL,
  [PVP5] REAL,
  [PVP6] REAL,
  [PVP7] REAL,
  [PVP8] REAL,
  PRIMARY KEY ([TipoCurva], [GrupoSer])
);

-- ===== DAincomp  (filas: 0) =====
CREATE TABLE [DAincomp] (
  [Vidrio1] NVARCHAR(15),
  [Vidrio2] NVARCHAR(15),
  PRIMARY KEY ([Vidrio1], [Vidrio2])
);

-- ===== Delegaciones  (filas: 1) =====
CREATE TABLE [Delegaciones] (
  [Codigo] NVARCHAR(2),
  [Nombre] NVARCHAR(100),
  [TipoLocRem] NVARCHAR(10),
  [IDTD] NVARCHAR(10),
  [ContabDepartamento] NVARCHAR(15),
  [ContabProyecto] NVARCHAR(15),
  [Almacen] NVARCHAR(5),
  [CIF] NVARCHAR(20),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [DatosFacSN] BOOLEAN NOT NULL,
  [CIFF] NVARCHAR(20),
  [RazonSocial] NVARCHAR(40),
  [DireccionF] NVARCHAR(150),
  [CPF] NVARCHAR(20),
  [PoblacionF] NVARCHAR(80),
  [ProvinciaF] NVARCHAR(80),
  [PaisF] NVARCHAR(10),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [CuentaBancariaIntl] NVARCHAR(80),
  [PrefijoClientes] NVARCHAR(4),
  [PrefijoProveedores] NVARCHAR(4),
  [PrefijoAcreedores] NVARCHAR(4),
  [eMail] NVARCHAR(150),
  [TelefonoMovil] NVARCHAR(20),
  [Web] NVARCHAR(255),
  [AFIPnumeroPuntoVenta] SMALLINT,
  [MostrarEnTerminalTallerSN] BOOLEAN NOT NULL,
  [TiposDocumentoValidoSN] BOOLEAN NOT NULL,
  [DatosRegistro] NVARCHAR(255),
  [BIC] NVARCHAR(11),
  [PrefijoClientesPot] NVARCHAR(4),
  [AlmacenFabricados] NVARCHAR(5),
  [AlmacenEntrada] NVARCHAR(5),
  [ServidorMail] NVARCHAR(80),
  [PuertoMail] SMALLINT,
  [SSLMail] BOOLEAN NOT NULL,
  [EngineTypeMail] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== DelegacionesTipoDocumentoValido  (filas: 0) =====
CREATE TABLE [DelegacionesTipoDocumentoValido] (
  [Delegacion] NVARCHAR(2) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [TipoDocumentoValido] NVARCHAR(6) NOT NULL,
  [PredeterminadoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Delegacion], [TipoDoc], [TipoDocumentoValido])
);

-- ===== Demo  (filas: 0) =====
CREATE TABLE [Demo] (
  [frmName] NVARCHAR(30),
  [ctrlName] NVARCHAR(30),
  [ctrlIndex] SMALLINT,
  [txtTitulo] NVARCHAR(40),
  [txtExplicacion] NVARCHAR,
  [imgImagen] BINARY,
  [idDemo] INTEGER NOT NULL,
  PRIMARY KEY ([frmName], [ctrlName], [ctrlIndex])
);

-- ===== DescuentosVentaVariaciones  (filas: 0) =====
CREATE TABLE [DescuentosVentaVariaciones] (
  [nLinea] INTEGER NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Condicion] NVARCHAR(14) NOT NULL,
  [Prioridad] SMALLINT,
  [Descuento] REAL NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== DisDiseñoBarrotillos  (filas: 0) =====
CREATE TABLE [DisDiseñoBarrotillos] (
  [id] INTEGER NOT NULL,
  [Ancho] REAL,
  [Alto] REAL,
  [ModoCruce] NVARCHAR(10),
  [Prioridad] NVARCHAR(10),
  [BarrH_Articulo] NVARCHAR(15),
  [BarrH_Acabado] NVARCHAR(10),
  [BarrH_Tonalidad] NVARCHAR(10),
  [BarrH_ColorDiseño] INTEGER,
  [BarrV_Articulo] NVARCHAR(15),
  [BarrV_Acabado] NVARCHAR(10),
  [BarrV_Tonalidad] NVARCHAR(10),
  [BarrV_ColorDiseño] INTEGER,
  [Cruceta_Articulo] NVARCHAR(15),
  [Cruceta_Acabado] NVARCHAR(10),
  [Cruceta_Tonalidad] NVARCHAR(10),
  [Cruceta_ColorDiseño] INTEGER,
  [PerfilIntercalario_Articulo] NVARCHAR(15),
  [PerfilIntercalario_ColorDiseño] INTEGER,
  [CotaVisible] REAL,
  [RepartoH_ModoReparto] NVARCHAR(25),
  [RepartoH_EquiNumeroBarr] SMALLINT,
  [RepartoH_SepFija] REAL,
  [RepartoH_TamFijo] REAL,
  [RepartoH_ManualListaCotas] NVARCHAR(255),
  [RepartoV_ModoReparto] NVARCHAR(25),
  [RepartoV_EquiNumeroBarr] SMALLINT,
  [RepartoV_SepFija] REAL,
  [RepartoV_TamFijo] REAL,
  [RepartoV_ManualListaCotas] NVARCHAR(255),
  [TamañoCotas] SMALLINT,
  [RepartoH_ListaMedidasCalculadas] NVARCHAR,
  [RepartoV_ListaMedidasCalculadas] NVARCHAR,
  [Reparto_CrucetasCalculadas] SMALLINT,
  [RepartoH_ListaCentrosCalculados] NVARCHAR,
  [RepartoV_ListaCentrosCalculados] NVARCHAR,
  [RepartoH_ListaMedidasCorteCalculadas] NVARCHAR,
  [RepartoV_ListaMedidasCorteCalculadas] NVARCHAR,
  [RepartoH_ListaMedidasCorteAgrupadas] NVARCHAR,
  [RepartoV_ListaMedidasCorteAgrupadas] NVARCHAR,
  [RepartoH_ListaCantidadesCorteAgrupadas] NVARCHAR,
  [RepartoV_ListaCantidadesCorteAgrupadas] NVARCHAR,
  [Tope_Articulo] NVARCHAR(15) NOT NULL,
  PRIMARY KEY ([id])
);

-- ===== DiseñoConfig  (filas: 1) =====
CREATE TABLE [DiseñoConfig] (
  [perMS] NVARCHAR(15),
  [perMSFS] NVARCHAR(15),
  [perMSsol] NVARCHAR(15),
  [perMS3C] NVARCHAR(15),
  [perMI] NVARCHAR(15),
  [perMIsol] NVARCHAR(15),
  [perMI3C] NVARCHAR(15),
  [perMIFI] NVARCHAR(15),
  [perML] NVARCHAR(15),
  [perMLIsol] NVARCHAR(15),
  [perMLDsol] NVARCHAR(15),
  [perML3C] NVARCHAR(15),
  [perMLIguia] NVARCHAR(15),
  [perMLDguia] NVARCHAR(15),
  [perMLIguia2] NVARCHAR(15),
  [perMLDguia2] NVARCHAR(15),
  [perMPSI] NVARCHAR(15),
  [perMPL] NVARCHAR(15),
  [perMPLS] NVARCHAR(15),
  [perMPSIS] NVARCHAR(15),
  [perMarcoAb] NVARCHAR(15),
  [perMarcoAbHMA] NVARCHAR(15),
  [perGuia1descr] NVARCHAR(10),
  [perGuia2descr] NVARCHAR(10),
  [perHAS] NVARCHAR(15),
  [perHAI] NVARCHAR(15),
  [perHAIZ] NVARCHAR(15),
  [perHADE] NVARCHAR(15),
  [perHAC] NVARCHAR(15),
  [perHAPS] NVARCHAR(15),
  [perHAPI] NVARCHAR(15),
  [perHAPIZ] NVARCHAR(15),
  [perHAPDE] NVARCHAR(15),
  [perHAPC] NVARCHAR(15),
  [perHAES] NVARCHAR(15),
  [perHAEI] NVARCHAR(15),
  [perHAEIZ] NVARCHAR(15),
  [perHAEDE] NVARCHAR(15),
  [perHAEC] NVARCHAR(15),
  [perHAEPS] NVARCHAR(15),
  [perHAEPI] NVARCHAR(15),
  [perHAEPIZ] NVARCHAR(15),
  [perHAEPDE] NVARCHAR(15),
  [perHAEPC] NVARCHAR(15),
  [perHAC2] NVARCHAR(15),
  [perHAPC2] NVARCHAR(15),
  [perUmb] NVARCHAR(15),
  [perZApert] NVARCHAR(15),
  [perIMPH] NVARCHAR(15),
  [perIMPV] NVARCHAR(15),
  [perHPH] NVARCHAR(15),
  [perHPV] NVARCHAR(15),
  [perZA] NVARCHAR(15),
  [perZAE] NVARCHAR(15),
  [perZAad] NVARCHAR(15),
  [perHMA] NVARCHAR(15),
  [perHMAE] NVARCHAR(15),
  [perPF] NVARCHAR(15),
  [perVAG] NVARCHAR(15),
  [perHCS] NVARCHAR(15),
  [perHCI] NVARCHAR(15),
  [perZCI] NVARCHAR(15),
  [perHCIZ] NVARCHAR(15),
  [perHCDE] NVARCHAR(15),
  [perHCC] NVARCHAR(15),
  [per4H] NVARCHAR(15),
  [perTM_FF] NVARCHAR(15),
  [perTM_FH] NVARCHAR(15),
  [perTH] NVARCHAR(15),
  [perTMP_FF] NVARCHAR(15),
  [perTMP_FH] NVARCHAR(15),
  [perTHP] NVARCHAR(15),
  [perMZL] NVARCHAR(15),
  [perMZSI] NVARCHAR(15),
  [perTHZ] NVARCHAR(15),
  [perTMZ] NVARCHAR(15),
  [perBat] NVARCHAR(15),
  [perBat3H] NVARCHAR(15),
  [perBatE] NVARCHAR(15),
  [perBatE3H] NVARCHAR(15),
  [perBatC] NVARCHAR(15),
  [perBatC3H] NVARCHAR(15),
  [perVid] NVARCHAR(15),
  [perGuia] NVARCHAR(15),
  [perFijosSN] BOOLEAN NOT NULL,
  [perFS] NVARCHAR(15),
  [perFI] NVARCHAR(15),
  [perFL] NVARCHAR(15),
  [perFS3C] NVARCHAR(15),
  [perFI3C] NVARCHAR(15),
  [perFL3C] NVARCHAR(15),
  [perFISH] NVARCHAR(15),
  [perFIIH] NVARCHAR(15),
  [perFILH] NVARCHAR(15),
  [perFISM] NVARCHAR(15),
  [perFIIM] NVARCHAR(15),
  [perFILM] NVARCHAR(15),
  [perMLF] NVARCHAR(15),
  [perMLR] NVARCHAR(15),
  [perMLT] NVARCHAR(15),
  [perMPBFH] NVARCHAR(15),
  [perMPBFV] NVARCHAR(15),
  [perMPBRH] NVARCHAR(15),
  [perMPBRV] NVARCHAR(15),
  [perMILR] NVARCHAR(15),
  [MallSepLamasF] REAL,
  [MallSepLamasR] REAL,
  [perPanelMH] NVARCHAR(15),
  [perVeneciana] NVARCHAR(15),
  [perPlGI] NVARCHAR(15),
  [perPlHV] NVARCHAR(15),
  [perPlHH] NVARCHAR(15),
  [perBarrM] NVARCHAR(15),
  [perBarrT] NVARCHAR(15),
  [perMCmont1] NVARCHAR(15),
  [perMCmont2] NVARCHAR(15),
  [perMCmont3] NVARCHAR(15),
  [perMCmont4] NVARCHAR(15),
  [perMCrem1] NVARCHAR(15),
  [perMCrem2] NVARCHAR(15),
  [perMCrem3] NVARCHAR(15),
  [perMCrem4] NVARCHAR(15),
  [perMCtrav] NVARCHAR(15),
  [perMCHH] NVARCHAR(15),
  [perMCHV] NVARCHAR(15),
  [perMCHPH] NVARCHAR(15),
  [perMCHPV] NVARCHAR(15),
  [Grp4hAdCentral] NVARCHAR(3),
  [Grp4hAdExt] NVARCHAR(3),
  [infPlHVPatin] NVARCHAR(15),
  [infPlHVCremona] NVARCHAR(15),
  [infPlHVCierre] NVARCHAR(15),
  [infPlHVMarco] NVARCHAR(15),
  [infFI] NVARCHAR(15),
  [infHAV] NVARCHAR(15),
  [infHAH] NVARCHAR(15),
  [infHAB] NVARCHAR(15),
  [infHABP] NVARCHAR(15),
  [infHABE] NVARCHAR(15),
  [infHABEP] NVARCHAR(15),
  [infHACi] NVARCHAR(15),
  [infHACiE] NVARCHAR(15),
  [infHAescP] NVARCHAR(15),
  [infHAescReguP] NVARCHAR(15),
  [infHAescReguG] NVARCHAR(15),
  [infHAescG] NVARCHAR(15),
  [infHApasPleg] NVARCHAR(15),
  [infOBHCom] NVARCHAR(15),
  [infOBHMec] NVARCHAR(15),
  [infOBHCre] NVARCHAR(15),
  [infOBHPas] NVARCHAR(15),
  [infUnMUmb] NVARCHAR(15),
  [infUnTUmb] NVARCHAR(15),
  [infCurvaMP] NVARCHAR(15),
  [infCurvaMPR] NVARCHAR(15),
  [infCurvaCarp2] NVARCHAR(15),
  [infCurvaCarp3] NVARCHAR(15),
  [infCurvaCirc] NVARCHAR(15),
  [infCurvaPlantilla] NVARCHAR(15),
  [infCurvaOvalo] NVARCHAR(15),
  [infCurvaInclin] NVARCHAR(15),
  [infMOmodulo] NVARCHAR(15),
  [infMCHFija] NVARCHAR(15),
  [infMCHProy] NVARCHAR(15),
  [infNoJunq] NVARCHAR(15),
  [infVidNoCabe] NVARCHAR(15),
  [infDtosNulos] NVARCHAR(15),
  [infPerfNoPrecio] NVARCHAR(15),
  [ArtCurva] NVARCHAR(15),
  [herrFamilia] NVARCHAR(3),
  [herrPerfSN] BOOLEAN NOT NULL,
  [HerrPorHojasSN] BOOLEAN NOT NULL,
  [herr1HA] NVARCHAR(4),
  [herr1HO] NVARCHAR(4),
  [herr1HPC] NVARCHAR(4),
  [herr1HV] NVARCHAR(4),
  [herr1HPI] NVARCHAR(4),
  [herr2HA] NVARCHAR(4),
  [herr2HA1O] NVARCHAR(4),
  [herr2HAP] NVARCHAR(4),
  [herr2HA1OP] NVARCHAR(4),
  [herr3HA] NVARCHAR(4),
  [herr3HAP] NVARCHAR(4),
  [herr4HA] NVARCHAR(4),
  [herr4HAP] NVARCHAR(4),
  [herr2HC] NVARCHAR(4),
  [herr2HCP] NVARCHAR(4),
  [herr2HG] NVARCHAR(4),
  [herr2HC2] NVARCHAR(4),
  [herr3HC] NVARCHAR(4),
  [herr3HCP] NVARCHAR(4),
  [herr4HC] NVARCHAR(4),
  [herr4HCP] NVARCHAR(4),
  [herr6HC] NVARCHAR(4),
  [herr6HCP] NVARCHAR(4),
  [ColorVidrio] INTEGER,
  [ColorPerfilesSN] BOOLEAN NOT NULL,
  [FamiliaPers] NVARCHAR(3),
  [FamiliaTap] NVARCHAR(3),
  [FamiliaRegP] NVARCHAR(3),
  [FamiliaUniones] NVARCHAR(3),
  [FamiliaMosq] NVARCHAR(3),
  [FamiliaPre] NVARCHAR(3),
  [FamiliaBarandillas] NVARCHAR(3),
  [FamiliaPerf] NVARCHAR(3),
  [FamiliaCris] NVARCHAR(3),
  [FamiliaGuias] NVARCHAR(3),
  [FamiliaPanelMH] NVARCHAR(3),
  [FamiliaVenec] NVARCHAR(3),
  [FamiliaArtPers] NVARCHAR(3),
  [FamiliaArtCompRec] NVARCHAR(3),
  [FamiliaArtCompRec2] NVARCHAR(3),
  [FamiliaArtCompRec3] NVARCHAR(3),
  [FamiliaArtTerm] NVARCHAR(3),
  [FamiliaArtDiscos] NVARCHAR(3),
  [FamiliaArtPlacas] NVARCHAR(3),
  [FamiliaArtEjes] NVARCHAR(3),
  [FamiliaArtConter] NVARCHAR(3),
  [FamiliaArtMosq] NVARCHAR(3),
  [FamiliaEstrMF] NVARCHAR(3),
  [FamEstrBand] NVARCHAR(3),
  [FamEstrCondens] NVARCHAR(3),
  [FamEstrTuboCort] NVARCHAR(3),
  [FamEstrGuardapolvos] NVARCHAR(3),
  [FamEstrBarrotes] NVARCHAR(3),
  [FamEstrTubAng] NVARCHAR(3),
  [ComponenteJunq] NVARCHAR(5),
  [AcotarSN] BOOLEAN NOT NULL,
  [AcotTravSN] BOOLEAN NOT NULL,
  [compFcajVenHasta] REAL,
  [compFcajVenPos] REAL,
  [compFcajPtaPos] REAL,
  [compFtipoPrecIncrNT] NVARCHAR(1),
  [compDibRecSN] BOOLEAN NOT NULL,
  [compFincrGuiaCM] REAL,
  [FamiliaArtCompGuiasCent] NVARCHAR(3),
  [FamiliaArtCompUnionesG] NVARCHAR(3),
  [infELEVHCierre] NVARCHAR(15),
  [infELEVHHoriz] NVARCHAR(15),
  [infELEVHFija] NVARCHAR(15),
  [infELEVHFijaHoriz] NVARCHAR(15),
  [infHAsMA] NVARCHAR(15),
  [perZAadG] NVARCHAR(15),
  [infHAinvMA] NVARCHAR(15),
  [infHAinvMAHMA] NVARCHAR(15),
  [infMbHFx2] NVARCHAR(15),
  [FamiliaArtTesteros] NVARCHAR(3)
);

-- ===== DiseñoConfigV2  (filas: 338) =====
CREATE TABLE [DiseñoConfigV2] (
  [NombreCampo] NVARCHAR(40) NOT NULL,
  [Valor] NVARCHAR(50),
  PRIMARY KEY ([NombreCampo])
);

-- ===== DisFormas  (filas: 29) =====
CREATE TABLE [DisFormas] (
  [Codigo] NVARCHAR(10),
  [Descripcion] NVARCHAR(50),
  [Ancho] REAL,
  [Alto] REAL,
  [EDAncho] REAL,
  [EDAlto] REAL,
  [EscalableSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [ArticuloAsoc] NVARCHAR(15),
  [EstructuraAsoc] NVARCHAR(14),
  [CdadAsoc] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== DisForTrazos  (filas: 94) =====
CREATE TABLE [DisForTrazos] (
  [nLin] INTEGER NOT NULL,
  [CodForma] NVARCHAR(10),
  [nTrazo] SMALLINT,
  [TipoCurva] SMALLINT,
  [Radio1] REAL,
  [Radio2] REAL,
  [AngIni] REAL,
  [AngFin] REAL,
  [Color] INTEGER,
  [DrawStyle] SMALLINT,
  [DrawWidth] SMALLINT,
  [DrawMode] SMALLINT,
  [FillColor] INTEGER,
  [FillStyle] SMALLINT,
  [NodoAX] REAL,
  [NodoAY] REAL,
  [NodoAFormulaX] NVARCHAR(30),
  [NodoAFormulaY] NVARCHAR(30),
  [NodoBX] REAL,
  [NodoBY] REAL,
  [NodoBFormulaX] NVARCHAR(30),
  [NodoBFormulaY] NVARCHAR(30),
  [Bitmap] BINARY,
  PRIMARY KEY ([nLin])
);

-- ===== Divisas  (filas: 1) =====
CREATE TABLE [Divisas] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [PrincipalSN] BOOLEAN NOT NULL,
  [DivisaCambio] REAL,
  [fechaActCambio] DATE,
  [Simbolo] NVARCHAR(10),
  [SimboloPosicion] NVARCHAR(1),
  [DecimalesEspecialSN] BOOLEAN NOT NULL,
  [DecimalesPrecio] SMALLINT,
  [DecimalesTotalLinea] SMALLINT,
  [DecimalesBaseImponible] SMALLINT,
  [DecimalesIVA] SMALLINT,
  [DecimalesTotalDocumento] SMALLINT,
  [PredeterminadaVentasSN] BOOLEAN NOT NULL,
  [NumLetraParteEntera] NVARCHAR(30),
  [NumLetraComa] NVARCHAR(30),
  [NumLetraDecimales] NVARCHAR(30),
  [CodigoContabilidad] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== DivisasHistorialCambio  (filas: 0) =====
CREATE TABLE [DivisasHistorialCambio] (
  [nLinea] INTEGER NOT NULL,
  [Divisa] NVARCHAR(5) NOT NULL,
  [Fecha] DATE,
  [Cambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== DocumentosM  (filas: 0) =====
CREATE TABLE [DocumentosM] (
  [Codigo] NVARCHAR(5),
  [Descripcion] NVARCHAR(40),
  [Tipo] NVARCHAR(30),
  [Documento] BINARY,
  PRIMARY KEY ([Codigo])
);

-- ===== DocumentosMTipos  (filas: 0) =====
CREATE TABLE [DocumentosMTipos] (
  [Descripcion] NVARCHAR(30),
  PRIMARY KEY ([Descripcion])
);

-- ===== ediSeresClienteDatos  (filas: 0) =====
CREATE TABLE [ediSeresClienteDatos] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [CodigoInterlocutor] NVARCHAR(35),
  [CodigoReceptor] NVARCHAR(35),
  [FTPcarpetaEnvioVALB] NVARCHAR(50),
  [FTPcarpetaEnvioVFAC] NVARCHAR(50),
  [FTPcarpetaRecepcionVPED] NVARCHAR(50),
  [CodigoInterlocutorEntrega] NVARCHAR(35),
  PRIMARY KEY ([Cliente])
);

-- ===== ediSeresCodigoArticulo  (filas: 0) =====
CREATE TABLE [ediSeresCodigoArticulo] (
  [TipoArtEstr] NVARCHAR(5) NOT NULL,
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [ArticuloSeres] NVARCHAR(35),
  [ArticuloProveedorSeres] NVARCHAR(35),
  [ArticuloClienteSeres] NVARCHAR(35),
  [ArticuloFabricanteSeres] NVARCHAR(35),
  [EnviarComoObservacionesSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoArtEstr], [Articulo], [Acabado])
);

-- ===== ediSeresDelegacionDatos  (filas: 0) =====
CREATE TABLE [ediSeresDelegacionDatos] (
  [Delegacion] NVARCHAR(2) NOT NULL,
  [CodigoInterlocutor] NVARCHAR(35),
  [CodigoEmisor] NVARCHAR(35),
  [TipoDocumentoAsignar] NVARCHAR(5),
  PRIMARY KEY ([Delegacion])
);

-- ===== ediSeresDocumentos  (filas: 0) =====
CREATE TABLE [ediSeresDocumentos] (
  [nLinea] INTEGER NOT NULL,
  [IdMensaje] GUID NOT NULL,
  [Direccion] NVARCHAR(10),
  [Fecha] DATE,
  [TipoDocumento] NVARCHAR(6),
  [NumeroDocumento] NVARCHAR(20),
  [Proveedor] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ediSeresTiposRemesa  (filas: 0) =====
CREATE TABLE [ediSeresTiposRemesa] (
  [TipoRemesa] NVARCHAR(5) NOT NULL,
  [FormaPagoSeres] NVARCHAR(20),
  PRIMARY KEY ([TipoRemesa])
);

-- ===== EFacCli  (filas: 0) =====
CREATE TABLE [EFacCli] (
  [nLin] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [BaseImpA] DOUBLE,
  [BaseImpB] DOUBLE,
  [BaseImpC] DOUBLE,
  PRIMARY KEY ([nLin])
);

-- ===== Embalajes  (filas: 0) =====
CREATE TABLE [Embalajes] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [DimAncho] SMALLINT,
  [DimAlto] SMALLINT,
  [DimFondo] SMALLINT,
  [Peso] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== EstrTldCmpSubestructuras  (filas: 0) =====
CREATE TABLE [EstrTldCmpSubestructuras] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(60) NOT NULL,
  [Subestructura] NVARCHAR(60) NOT NULL,
  [Orden] SMALLINT,
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargo] NVARCHAR(255),
  [Cantidad] REAL,
  [FormulaCdad] NVARCHAR(255),
  [OPCformulaSelec] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoAcabadoRibete  (filas: 0) =====
CREATE TABLE [EstrToldoAcabadoRibete] (
  [Estructura] NVARCHAR(15) NOT NULL,
  [Lona] NVARCHAR(15) NOT NULL,
  [AcabadoRibete] NVARCHAR(10),
  [TonalidadRibete] NVARCHAR(10),
  [AcabadoHilo] NVARCHAR(10),
  [TonalidadHilo] NVARCHAR(10),
  [LonaCosidaSoldada] NVARCHAR(1),
  [OpcionCortePaños] NVARCHAR(20),
  PRIMARY KEY ([Estructura], [Lona])
);

-- ===== EstrToldoAsocAca  (filas: 0) =====
CREATE TABLE [EstrToldoAsocAca] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [FuncionOrig] NVARCHAR(20),
  [AcabadoOrig] NVARCHAR(10),
  [FuncionDst] NVARCHAR(20),
  [AcabadoDst] NVARCHAR(10),
  [TonalidadOrig] NVARCHAR(10),
  [TonalidadDst] NVARCHAR(10),
  [TonDstIgualOrigSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoBrazos  (filas: 0) =====
CREATE TABLE [EstrToldoBrazos] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [ArticuloBrazo] NVARCHAR(15),
  [SalidaDesde] SMALLINT,
  [SalidaHasta] SMALLINT,
  [BrazoAdicional] NVARCHAR(15),
  [CantidadBrAd] REAL,
  [CantidadBrazos] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoBrazosCantidad  (filas: 0) =====
CREATE TABLE [EstrToldoBrazosCantidad] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [LineaDesde] SMALLINT,
  [LineaHasta] SMALLINT,
  [SalidaDesde] SMALLINT,
  [SalidaHasta] SMALLINT,
  [CantidadBrazosAd] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoColocacionMaquina  (filas: 0) =====
CREATE TABLE [EstrToldoColocacionMaquina] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Orden] SMALLINT,
  [CofreSN] NVARCHAR(1),
  [Simbolo] NVARCHAR(1),
  [Descripcion] NVARCHAR(40),
  [PredeterminadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoColocacionSoporte  (filas: 0) =====
CREATE TABLE [EstrToldoColocacionSoporte] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [ArticuloAsociado] NVARCHAR(15),
  [AdmiteBrazosAdicionalesSN] BOOLEAN NOT NULL,
  [NumeroOpcion] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoDescuentos  (filas: 0) =====
CREATE TABLE [EstrToldoDescuentos] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Accionamiento_MAN_MOT] NVARCHAR(3) NOT NULL,
  [MaqColoc_DF] NVARCHAR(1) NOT NULL,
  [CofreSN] NVARCHAR(1) NOT NULL,
  [ArticuloCofre] NVARCHAR(15) NOT NULL,
  [DescuentoLona] SMALLINT,
  [DescuentoEje] SMALLINT,
  [DescuentoBarraCarga] SMALLINT,
  [DescuentoCofre] SMALLINT,
  [nOpcionAcc] NVARCHAR(50),
  [FormulaOpcSel] NVARCHAR(100),
  [nOrden] SMALLINT,
  [nLinea] INTEGER NOT NULL,
  [PartidoSN] NVARCHAR(1),
  [lstEje] NVARCHAR(255),
  [SoporteColocacion_NOpcion] SMALLINT,
  [LineaDesde] SMALLINT,
  [LineaHasta] SMALLINT,
  [SalidaDesde] SMALLINT,
  [SalidaHasta] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoDespieceCond  (filas: 0) =====
CREATE TABLE [EstrToldoDespieceCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [Funcion] NVARCHAR(20),
  [nOrden] SMALLINT,
  [anchoDesde] SMALLINT,
  [anchoHasta] SMALLINT,
  [nOpcionAcc] NVARCHAR(50),
  [lstEje] NVARCHAR(255),
  [CofreSN] NVARCHAR(1),
  [InsArticulo] NVARCHAR(15),
  [InsCantidad] REAL,
  [MaqColoc_DF] NVARCHAR(1),
  [lstSoporte] NVARCHAR(255),
  [lstSoporteCentral] NVARCHAR(255),
  [SoporteColocacion_NOpcion] SMALLINT,
  [lstCofre] NVARCHAR(255),
  [NumeroBrazosAdSN] BOOLEAN NOT NULL,
  [NumeroBrazosAd] SMALLINT,
  [lstFaldillaModelo] NVARCHAR(255),
  [altoDesde] SMALLINT,
  [altoHasta] SMALLINT,
  [FormulaOpcSel] NVARCHAR(100),
  [InsFormulaAncho] NVARCHAR(255),
  [InsFormulaLargo] NVARCHAR(255),
  [lstLona] NVARCHAR(255),
  [DobleCaidaLonaSN] NVARCHAR(1),
  [BrazoCruceSN] NVARCHAR(1),
  [gradosInclinacionDesde] REAL,
  [gradosInclinacionHasta] REAL,
  [PartidoSN] NVARCHAR(1),
  [DivideEnToldoPartidoSN] BOOLEAN NOT NULL,
  [lstAccionamiento] NVARCHAR,
  [PosicionAcc] NVARCHAR(30),
  [TipoAcabado_TLD_ACC_BRZ] NVARCHAR(5),
  [LonaCosidaSoldada] NVARCHAR(1),
  [InsFormulaCantidad] NVARCHAR(100),
  [lonaFaldillaDiferenteSN] NVARCHAR(1),
  [lstSubfamiliasLona] NVARCHAR,
  [lstSubfamiliasLonaFaldilla] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoDibujoCond  (filas: 0) =====
CREATE TABLE [EstrToldoDibujoCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [lstEje] NVARCHAR(255),
  [lstCofre] NVARCHAR(255),
  [lstAccionamiento] NVARCHAR(255),
  [nOpcionAccionamiento] NVARCHAR(100),
  [FormulaOpcSel] NVARCHAR(100),
  [IdDibujo] INTEGER,
  [CofreSN] NVARCHAR(1),
  [lstArticulosEnDespiece] NVARCHAR(200),
  [lstArticulosTipoFiltro] NVARCHAR(1),
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoDimensionesMax  (filas: 0) =====
CREATE TABLE [EstrToldoDimensionesMax] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [SalidaDesde] SMALLINT,
  [SalidaHasta] SMALLINT,
  [NumeroBrazosAd] SMALLINT,
  [LineaMaxima] SMALLINT,
  [AvisoSN] BOOLEAN NOT NULL,
  [BloqueoSN] BOOLEAN NOT NULL,
  [nOpcionAcc] NVARCHAR(50),
  [FormulaOpcSel] NVARCHAR(100),
  [nOrden] SMALLINT,
  [CofreSN] NVARCHAR(1),
  [SoporteColocacion_NOpcion] SMALLINT,
  [AvisoTexto] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoFaldillas  (filas: 0) =====
CREATE TABLE [EstrToldoFaldillas] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Modelo] NVARCHAR(40),
  [MedidaEstandar] REAL,
  [IncrementoCorte] REAL,
  [AdmiteRibeteSN] BOOLEAN NOT NULL,
  [PredeterminadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoLineaMinima  (filas: 0) =====
CREATE TABLE [EstrToldoLineaMinima] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [SalidaDesde] SMALLINT,
  [SalidaHasta] SMALLINT,
  [NumeroBrazosAd] SMALLINT,
  [LineaMinima] SMALLINT,
  [AvisoSN] BOOLEAN NOT NULL,
  [BloqueoSN] BOOLEAN NOT NULL,
  [BrazoCruceSN] BOOLEAN NOT NULL,
  [nOpcionAcc] NVARCHAR(50),
  [FormulaOpcSel] NVARCHAR(100),
  [nOrden] SMALLINT,
  [CofreSN] NVARCHAR(1),
  [SoporteColocacion_NOpcion] SMALLINT,
  [AvisoTexto] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoMotor  (filas: 0) =====
CREATE TABLE [EstrToldoMotor] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [ArticuloMotor] NVARCHAR(15),
  [AnchoDesde] SMALLINT,
  [AnchoHasta] SMALLINT,
  [LargoDesde] SMALLINT,
  [LargoHasta] SMALLINT,
  [PermitirMedidaInferiorSN] BOOLEAN NOT NULL,
  [ArticuloEje] NVARCHAR(15),
  [NumeroBrazosAd] SMALLINT,
  [Orden] SMALLINT,
  [NumeroBrazosAdSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoPiezasValidas  (filas: 0) =====
CREATE TABLE [EstrToldoPiezasValidas] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Funcion] NVARCHAR(20) NOT NULL,
  [CofreSN] NVARCHAR(1),
  [codArticulo] NVARCHAR(15),
  [PredeterminadoSN] BOOLEAN NOT NULL,
  [lstSoporte] NVARCHAR(255),
  [anchoDesde] SMALLINT,
  [anchoHasta] SMALLINT,
  [altoDesde] SMALLINT,
  [altoHasta] SMALLINT,
  [nOrden] SMALLINT,
  [lstEje] NVARCHAR(255),
  [Accionamiento_MAN_MOT] NVARCHAR(3),
  [nOpcionAcc] NVARCHAR(50),
  PRIMARY KEY ([nLinea])
);

-- ===== EstrToldoPosicionAccionamiento  (filas: 0) =====
CREATE TABLE [EstrToldoPosicionAccionamiento] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [PosicionAcc] NVARCHAR(30) NOT NULL,
  [PredeterminadaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Estructura], [PosicionAcc])
);

-- ===== EstrToldoSubfamiliasMotor  (filas: 0) =====
CREATE TABLE [EstrToldoSubfamiliasMotor] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [PredeterminadaSN] BOOLEAN NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Orden] SMALLINT,
  PRIMARY KEY ([Estructura], [Familia], [Subfamilia])
);

-- ===== Estructuras  (filas: 394) =====
CREATE TABLE [Estructuras] (
  [Codigo] NVARCHAR(14),
  [Descripcion] NVARCHAR,
  [Familia] NVARCHAR(10),
  [Observaciones] NVARCHAR(240),
  [StFabricacionSN] BOOLEAN NOT NULL,
  [AccesorioSN] BOOLEAN NOT NULL,
  [AccFAncho] NVARCHAR(255),
  [AccFAlto] NVARCHAR(255),
  [AsocASeriesSN] BOOLEAN NOT NULL,
  [Familia1] NVARCHAR(10),
  [Familia2] NVARCHAR(10),
  [Familia3] NVARCHAR(10),
  [Familia4] NVARCHAR(10),
  [Conjunto1] NVARCHAR(15),
  [Conjunto2] NVARCHAR(15),
  [Conjunto3] NVARCHAR(15),
  [Conjunto4] NVARCHAR(15),
  [DisAutoSN] BOOLEAN NOT NULL,
  [DisAncho] REAL,
  [DisAlto] REAL,
  [DisPersianaSN] BOOLEAN NOT NULL,
  [DisTapSN] BOOLEAN NOT NULL,
  [DisRegPSN] BOOLEAN NOT NULL,
  [DisHerraje] NVARCHAR(4),
  [DisMIF] BOOLEAN NOT NULL,
  [DisMSF] BOOLEAN NOT NULL,
  [DisFIsn] BOOLEAN NOT NULL,
  [DisFIsup] NVARCHAR(1),
  [DisFIinf] NVARCHAR(1),
  [DisFIizda] NVARCHAR(1),
  [DisFIdcha] NVARCHAR(1),
  [PVPdirectoSN] BOOLEAN NOT NULL,
  [PVP1] REAL,
  [PVP2] REAL,
  [PVP3] REAL,
  [PVP4] REAL,
  [PVP5] REAL,
  [PVP6] REAL,
  [PVP7] REAL,
  [PVP8] REAL,
  [OriginalSN] BOOLEAN NOT NULL,
  [StdAncho] REAL,
  [StdLargo] REAL,
  [UnionGrosor] REAL,
  [UnionL1] REAL,
  [UnionL2] REAL,
  [UnionTipo] SMALLINT,
  [UnionEsqDtoLat] REAL,
  [UnionEsqDtoFrente] REAL,
  [TapDtoV] REAL,
  [TapDtoH] REAL,
  [TapBordeaRegSN] BOOLEAN NOT NULL,
  [DtoHuecoV] REAL,
  [DtoHuecoH] REAL,
  [ComputoMLsn] BOOLEAN NOT NULL,
  [ComputoMLusar] NVARCHAR(10),
  [BibliotecaSN] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [BibliotecaDibSN] BOOLEAN NOT NULL,
  [BloqueoAsistSN] BOOLEAN NOT NULL,
  [TipoPerf] NVARCHAR(3),
  [DisTCurva] SMALLINT,
  [ManufacturaSN] BOOLEAN NOT NULL,
  [CompNoDibSN] BOOLEAN NOT NULL,
  [compDtoHuecoSN] BOOLEAN NOT NULL,
  [CompactoFSN] BOOLEAN NOT NULL,
  [CompFtipoVal] NVARCHAR(3),
  [compDtoLamas] REAL,
  [compDtoEje] REAL,
  [compDtoCajon] REAL,
  [compDtoPorGC] REAL,
  [compDtoPorGCeje] REAL,
  [compDtoGuias] REAL,
  [compTamLama] REAL,
  [compTamLama2] REAL,
  [compTamLama3] REAL,
  [compCodTerm] NVARCHAR(15),
  [compCodGuia] NVARCHAR(15),
  [TarifaEstrSN] BOOLEAN NOT NULL,
  [TEnombreFich] NVARCHAR(40),
  [DisDefSN] BOOLEAN NOT NULL,
  [DefBloqueoSN] BOOLEAN NOT NULL,
  [DefSerie] NVARCHAR(15),
  [DefVidrio] NVARCHAR(15),
  [DefTap] NVARCHAR(15),
  [DefComp] NVARCHAR(15),
  [DefGuiaI] NVARCHAR(15),
  [DefGuiaD] NVARCHAR(15),
  [DefRegP] NVARCHAR(15),
  [DefAltRegP] REAL,
  [TapIncrH] REAL,
  [TapIncrV] REAL,
  [NoRedibujarSN] BOOLEAN NOT NULL,
  [MosquiteraM2sn] BOOLEAN NOT NULL,
  [OrdenEdLin] SMALLINT,
  [compDtoEjeTes2] REAL,
  [compDtoCajTes2] REAL,
  [AcaValCodArt] NVARCHAR(15),
  [TipoVentaForzarVDoc] NVARCHAR(5),
  [CEnoAplicableSN] BOOLEAN NOT NULL,
  [ToldoSN] BOOLEAN NOT NULL,
  [FechaHoraAct] DATE,
  [DisFCsup] NVARCHAR(15),
  [DisFCinf] NVARCHAR(15),
  [DisFClat] NVARCHAR(15),
  [TldPartidoNoCofreSN] BOOLEAN NOT NULL,
  [CompGCAutoSN] BOOLEAN NOT NULL,
  [CompGCAutoMed] DOUBLE,
  [AcabadosValidos_ART_LISTA] NVARCHAR(5),
  [StFabrArticuloDest] NVARCHAR(15),
  [StFabrGeneraCosteArtDestSN] BOOLEAN NOT NULL,
  [StFabrGeneraCosteTarifa] NVARCHAR(5),
  [StFabrGeneraCosteProveedor] NVARCHAR(10),
  [CategoriasAcaSN] BOOLEAN NOT NULL,
  [StFabrProveedorFabr] NVARCHAR(10),
  [MobileCE_Aplicacion] NVARCHAR(15),
  [compDtoEjeTes3] REAL,
  [compDtoPorGCEjeTes3] REAL,
  [compDtoCajTes3] REAL,
  [CompDtoAdEjeSalDespTes1] REAL,
  [CompDtoAdEjeSalDespTes2] REAL,
  [CompDtoAdEjeSalDespTes3] REAL,
  [NoGenerarModulosSN] BOOLEAN NOT NULL,
  [DimensionesMaximasSN] BOOLEAN NOT NULL,
  [TipoIVA_detallado_fijo] NVARCHAR(10),
  [TipoIVA] NVARCHAR(2),
  [compCdadLamasCiegas] SMALLINT,
  [CompCodGuiaD] NVARCHAR(15),
  [StFabrVentaSN] BOOLEAN NOT NULL,
  [OrdenLineas] NVARCHAR(1),
  [TipoImpuestoRetenido] NVARCHAR(2),
  [ProduccionSeccion] NVARCHAR(3),
  [DefAncho] REAL,
  [DefAlto] REAL,
  [DimensionAncho] BOOLEAN NOT NULL,
  [DimensionAlto] BOOLEAN NOT NULL,
  [PackingListSN] BOOLEAN NOT NULL,
  [NombreDimensionAncho] NVARCHAR(20),
  [NombreDimensionAlto] NVARCHAR(20),
  [tldOpcionCortePaños] NVARCHAR(20),
  [tldLonaIncrementoDobladillo] SMALLINT,
  [tldLonaIncrementoSolapePaños] SMALLINT,
  [tldSalidaNoPermitirIntermediaSN] BOOLEAN NOT NULL,
  [EstructuraConOpcionesSN] BOOLEAN NOT NULL,
  [SeleccionarOpcionesDeSubestructurasSN] BOOLEAN NOT NULL,
  [tldCofre_NUNCA_SIEMPRE_OPCIONAL] NVARCHAR(10),
  [tldTipoCalculoLongitudLona] SMALLINT,
  [tldIncrementoLonaEje] SMALLINT,
  [tldAdmiteDobleCaidaSN] BOOLEAN NOT NULL,
  [tldAdmiteBrazoCruceSN] BOOLEAN NOT NULL,
  [DimensionesMaximasMultiplesRangosSN] BOOLEAN NOT NULL,
  [desactivadoSN] BOOLEAN NOT NULL,
  [desactivadoTipoDoc] NVARCHAR(50),
  [AvisoSN] BOOLEAN NOT NULL,
  [AvisoTipoDoc] NVARCHAR(50),
  [AvisoMsg] NVARCHAR(100),
  [tldDobleBarraCargaSN] BOOLEAN NOT NULL,
  [tldDobleLonaIncrementoLargoSegunda] REAL,
  [DibujosCondicionalesSN] BOOLEAN NOT NULL,
  [tldAdmiteBrazosAdicionalesSN] BOOLEAN NOT NULL,
  [tldAlturaMaxima] REAL,
  [tldDobleCaidaSeleccionadaSN] BOOLEAN NOT NULL,
  [TipoEstructura] NVARCHAR(15),
  [EstructuraCatalogo] NVARCHAR(14),
  [CompactoSN] BOOLEAN NOT NULL,
  [EstrNoGenerarCLAsn] BOOLEAN NOT NULL,
  [ProdWebInformacion] NVARCHAR,
  [ProdWebInformacionAdicional] NVARCHAR,
  [EstructuraConVariablesSN] BOOLEAN NOT NULL,
  [tldGradosInclinacionSN] BOOLEAN NOT NULL,
  [tldGradosInclinacionMin] REAL,
  [tldGradosInclinacionMax] REAL,
  [DescripcionPackingList] NVARCHAR(255),
  [TipoArticuloImpuesto] NVARCHAR(3),
  [tldBrazoStoreLonaNoTriangularSN] BOOLEAN NOT NULL,
  [tldDobleCaidaNoTriangularSN] BOOLEAN NOT NULL,
  [tldPartidoValoraDobleSN] BOOLEAN NOT NULL,
  [tldPartidoDividePerfilesSN] BOOLEAN NOT NULL,
  [ExcelProduccionEmitir] BOOLEAN NOT NULL,
  [ExcelProduccionRuta] NVARCHAR(255),
  [ExcelProduccionHoja] NVARCHAR(100),
  [InformacionWebCondicionalSN] BOOLEAN NOT NULL,
  [tldNoComputarCosteComponentesSN] BOOLEAN NOT NULL,
  [tldNoDescontarStockComponentesSN] BOOLEAN NOT NULL,
  [tldLonaSinConfeccionSN] BOOLEAN NOT NULL,
  [DescripcionParaCatalogo] NVARCHAR,
  [DescripcionParaVentas] NVARCHAR,
  [DescripcionProduccion] NVARCHAR(255),
  [OptimizaCargaLineasFiltroAcabadoSN] BOOLEAN NOT NULL,
  [StFabrGeneraPVPArtDestSN] BOOLEAN NOT NULL,
  [StFabrGeneraPVPLstTarifas] NVARCHAR(50),
  [CompModeloLamaExportacion] NVARCHAR(20),
  [tldFuerzaConMotorSN] BOOLEAN NOT NULL,
  [tldLonaIncrementoDobladilloSoldada] SMALLINT,
  [tldLonaIncrementoSolapePañosSoldada] SMALLINT,
  [tldLonaCosidaSoldada] NVARCHAR(1),
  [StFabrGeneraArticuloFabricadoEnOFsn] BOOLEAN NOT NULL,
  [OrdenEscap] SMALLINT,
  [tldDobleLonaUnicaSN] BOOLEAN NOT NULL,
  [DocumentosProdCondicionalesSN] BOOLEAN NOT NULL,
  [tldAlturaPredeterminada] REAL,
  [NombreAcabado] NVARCHAR(30),
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== EstructurasAC  (filas: 16) =====
CREATE TABLE [EstructurasAC] (
  [nLin] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [AltoCajon] REAL,
  [TamLama] REAL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [TamEje] SMALLINT,
  [CodLama] NVARCHAR(15),
  [AnchoCondicionalSN] BOOLEAN NOT NULL,
  [Orden] SMALLINT,
  [AnchoDesde] REAL,
  [AnchoHasta] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== EstructurasAcabadosVal  (filas: 0) =====
CREATE TABLE [EstructurasAcabadosVal] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [ValidoLocalSN] BOOLEAN NOT NULL,
  [ValidoProductorWebSN] BOOLEAN NOT NULL,
  [OrdenProdWeb] SMALLINT,
  [FechaHoraAct] DATE,
  PRIMARY KEY ([Estructura], [Acabado])
);

-- ===== EstructurasAcabadosValCond  (filas: 0) =====
CREATE TABLE [EstructurasAcabadosValCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(60) NOT NULL,
  [CategoriaSN] BOOLEAN NOT NULL,
  [CategoriaAca] NVARCHAR(5),
  [Acabado] NVARCHAR(10),
  [ValidoLocalSN] BOOLEAN NOT NULL,
  [ValidoProductorWebSN] BOOLEAN NOT NULL,
  [OrdenProdWeb] SMALLINT,
  [FechaHoraAct] DATE,
  [FormulaOpcSel] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasArtAcabadoAsoc  (filas: 0) =====
CREATE TABLE [EstructurasArtAcabadoAsoc] (
  [nLin_EA] INTEGER NOT NULL,
  [AcabadoEstr] NVARCHAR(10) NOT NULL,
  [AcaTonalidadEstr] NVARCHAR(10) NOT NULL,
  [AcabadoArt] NVARCHAR(10),
  [AcaTonalidadArt] NVARCHAR(10),
  PRIMARY KEY ([nLin_EA], [AcabadoEstr], [AcaTonalidadEstr])
);

-- ===== EstructurasArtAd  (filas: 0) =====
CREATE TABLE [EstructurasArtAd] (
  [nLin] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [CodSerie] NVARCHAR(15),
  [CodCompacto] NVARCHAR(14),
  [Articulo] NVARCHAR(15),
  [FormulaAncho] NVARCHAR(40),
  [FormulaLargo] NVARCHAR(40),
  [Cantidad] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== EstructurasArtCantidadIntervalos  (filas: 0) =====
CREATE TABLE [EstructurasArtCantidadIntervalos] (
  [nLinea] INTEGER NOT NULL,
  [nLin_EA] INTEGER NOT NULL,
  [FormulaAncho] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(30),
  [MedidaMin_Ancho] REAL,
  [MedidaMax_Ancho] REAL,
  [MedidaMin_Largo] REAL,
  [MedidaMax_Largo] REAL,
  [Cantidad] REAL,
  [CantidadCorte] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasArticulos  (filas: 61674) =====
CREATE TABLE [EstructurasArticulos] (
  [nLin] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [Cantidad] REAL,
  [PosicionTrabajo] NVARCHAR(1),
  [CantidadCorte] REAL,
  [LargoCorteCurva] REAL,
  [incrH] REAL,
  [TipoCorte] NVARCHAR(2),
  [AnguloI] REAL,
  [AnguloD] REAL,
  [Radio] REAL,
  [DirVeta] NVARCHAR(1),
  [Funcion] NVARCHAR(20),
  [StFabricadoSN] BOOLEAN NOT NULL,
  [AsociadoA] SMALLINT,
  [AsociadoAId] INTEGER,
  [Intervalo] REAL,
  [MedidaMin] REAL,
  [MedidaMax] REAL,
  [UnidadesMin] REAL,
  [UnidadesMax] REAL,
  [OPCsn] BOOLEAN NOT NULL,
  [OPCnGrupo] SMALLINT,
  [OPCnOpcion] SMALLINT,
  [OPCpredetSN] BOOLEAN NOT NULL,
  [OPCtexto] NVARCHAR(30),
  [OPCtitulo] NVARCHAR(20),
  [OPCNOselecUsrSN] BOOLEAN NOT NULL,
  [OPCNOdescrAutoSN] BOOLEAN NOT NULL,
  [id] INTEGER,
  [DisIdIt] INTEGER,
  [DisPosPerf] NVARCHAR(3),
  [DisTipoHoja] SMALLINT,
  [DisManoID] NVARCHAR(1),
  [DisIdHoja] INTEGER,
  [DismoVP] NVARCHAR(1),
  [DisTipoHuecoH] INTEGER,
  [DisTipoHuecoV] INTEGER,
  [Acabado] NVARCHAR(10),
  [DisComponente] NVARCHAR(5),
  [DisIdPerAdSup] INTEGER,
  [DisIdPerAdInf] INTEGER,
  [DisIdPerAdIz] INTEGER,
  [DisIdPerAdDe] INTEGER,
  [DisGrupoAdOp] SMALLINT,
  [DisIdRefLargo] INTEGER,
  [DisIdRefAncho] INTEGER,
  [DisOperacionEquiV] SMALLINT,
  [DisOperacionEquiH] SMALLINT,
  [DisVidrio] NVARCHAR(15),
  [DisTipoCurva] SMALLINT,
  [CompFcdadPanyoSN] BOOLEAN NOT NULL,
  [CompFNoCargoIncrSN] BOOLEAN NOT NULL,
  [DisVidBarrArtic] NVARCHAR(15),
  [DisVidBarrHoriz] SMALLINT,
  [DisVidBarrVert] SMALLINT,
  [DisIdPerAd] INTEGER,
  [AcabadoVinculadoSN] BOOLEAN NOT NULL,
  [AcaVinFuncion] NVARCHAR(20),
  [AcaVinSustituyeSN] BOOLEAN NOT NULL,
  [AsociadoAFormula] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(255),
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargoCorte] NVARCHAR(255),
  [FormulaAnchoCorte] NVARCHAR(255),
  [DisFRefLargo] NVARCHAR(255),
  [DisFRefAncho] NVARCHAR(255),
  [FormulaCdad] NVARCHAR(255),
  [FormulaCdadCorte] NVARCHAR(255),
  [FormulaCdadTipoRed_EXC_DEF] NVARCHAR(3),
  [DisNHoja] SMALLINT,
  [IntervalosMultSN] BOOLEAN NOT NULL,
  [Acabado_ESTR_FIJO_ASOC_VINC] NVARCHAR(4),
  [AcabadoFijo] NVARCHAR(10),
  [AcabadoFijoTonalidad] NVARCHAR(10),
  [Subestructura] NVARCHAR(14),
  [CategoriaAca] NVARCHAR(5),
  [Articulo] NVARCHAR(15),
  [NoComputarCosteSN] BOOLEAN NOT NULL,
  [FormulaCdadNumeroDec] SMALLINT,
  [Orden] SMALLINT,
  [Seccion] NVARCHAR(3),
  [Comentario] NVARCHAR(50),
  [CantidadIntervalosSN] BOOLEAN NOT NULL,
  [MedidasIntervalosSN] BOOLEAN NOT NULL,
  [OPCnOrden] SMALLINT,
  [CalcEtiqCorte] NVARCHAR(7),
  [CalcEtiqCorteNumFijo] REAL,
  [NoComputarVentaSN] BOOLEAN NOT NULL,
  [LonaConfeccionadaSN] BOOLEAN NOT NULL,
  [LonaArticuloMedLona] NVARCHAR(15),
  [LonaOpcionCortePaños_ABC] NVARCHAR(20),
  [LonaOpcionCortePañosDesdeGrupoOpc] SMALLINT,
  [LonaIncrementoDobladillo] SMALLINT,
  [LonaIncrementoSolapePaños] SMALLINT,
  [DisGrupo] NVARCHAR(5),
  [DisGrupoI] NVARCHAR(5),
  [DisGrupoD] NVARCHAR(5),
  [DisGrupoSup] NVARCHAR(5),
  [DisGrupoInf] NVARCHAR(5),
  [DisGrupoAdicional] NVARCHAR(5),
  [DisGrupoAd2] NVARCHAR(5),
  [DisGrupoAd3] NVARCHAR(5),
  [DisGrupoAdIndep] NVARCHAR(5),
  [DisGrupoEquiExtV] NVARCHAR(5),
  [DisGrupoEquiExtH] NVARCHAR(5),
  [DisGrupoEquiCentro] NVARCHAR(5),
  [OPCformulaSelec] NVARCHAR,
  [LonaSinConfeccionSN] BOOLEAN NOT NULL,
  [FiltroAcabadoAComparar] NVARCHAR(15),
  [FiltroAcabados] NVARCHAR,
  [FiltroFamiliasAcabados] NVARCHAR,
  [ComputaFiltroPesoSN] BOOLEAN NOT NULL,
  [FiltroPesoSN] BOOLEAN NOT NULL,
  [PesoDesde] REAL,
  [PesoHasta] REAL,
  [FormulaMedidaMinMax2] NVARCHAR(30),
  [MedidaMin2] REAL,
  [MedidaMax2] REAL,
  [ForzarTonalidadSN] BOOLEAN NOT NULL,
  [ForzarTonalidad] NVARCHAR(10),
  [NoInsertarSiCantidadCeroSN] BOOLEAN NOT NULL,
  [lstSubfamiliasPresentes] NVARCHAR,
  [lstSubfamiliasTipoFiltro] NVARCHAR(1),
  [ProduccionSeccion] NVARCHAR(10),
  [FiltroAcabadoCategoria] NVARCHAR(5),
  PRIMARY KEY ([nLin])
);

-- ===== EstructurasArtIntervalosMult  (filas: 0) =====
CREATE TABLE [EstructurasArtIntervalosMult] (
  [nLinea] INTEGER NOT NULL,
  [nLin_EA] INTEGER NOT NULL,
  [FormulaAncho] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(30),
  [MedidaMin_Ancho] REAL,
  [MedidaMax_Ancho] REAL,
  [MedidaMin_Largo] REAL,
  [MedidaMax_Largo] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasArtMedidasIntervalos  (filas: 0) =====
CREATE TABLE [EstructurasArtMedidasIntervalos] (
  [nLinea] INTEGER NOT NULL,
  [nLin_EA] INTEGER NOT NULL,
  [FormulaAncho] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(30),
  [MedidaMin_Ancho] REAL,
  [MedidaMax_Ancho] REAL,
  [MedidaMin_Largo] REAL,
  [MedidaMax_Largo] REAL,
  [FormulaAnchoVenta] NVARCHAR(30),
  [FormulaLargoVenta] NVARCHAR(30),
  [FormulaAnchoCorte] NVARCHAR(30),
  [FormulaLargoCorte] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasArtSustAca  (filas: 0) =====
CREATE TABLE [EstructurasArtSustAca] (
  [nLin_EA] INTEGER NOT NULL,
  [AcabadoOrig] NVARCHAR(10) NOT NULL,
  [TonalidadOrig] NVARCHAR(10) NOT NULL,
  [AcabadoDst] NVARCHAR(10),
  [TonalidadDst] NVARCHAR(10),
  PRIMARY KEY ([nLin_EA], [AcabadoOrig], [TonalidadOrig])
);

-- ===== EstructurasCadenaClasificacion  (filas: 0) =====
CREATE TABLE [EstructurasCadenaClasificacion] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Tipo] NVARCHAR(15) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100),
  PRIMARY KEY ([Estructura], [Tipo])
);

-- ===== EstructurasCadenaClasificacionCond  (filas: 0) =====
CREATE TABLE [EstructurasCadenaClasificacionCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [LstAcabados] NVARCHAR,
  [FormulaOpcSel] NVARCHAR(100),
  [cfLstCodLama] NVARCHAR(255),
  [cfLstAcaCaj] NVARCHAR,
  [cfLstAcaLam] NVARCHAR,
  [cfLstAcaGui] NVARCHAR,
  [cfConSinGuiasCS] NVARCHAR(1),
  [cfLstCodOpcionAccionamiento] NVARCHAR(60),
  [Prioridad] SMALLINT,
  [CadenaDeClasificacionEstadisticas] NVARCHAR(100),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasCatAca  (filas: 0) =====
CREATE TABLE [EstructurasCatAca] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Categoria] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [AcabadoDef] NVARCHAR(10),
  [AcaTonDef] NVARCHAR(10),
  [SeleccionRequeridaSN] BOOLEAN NOT NULL,
  [ActivaCondicionalSN] BOOLEAN NOT NULL,
  [ActivaFormula] NVARCHAR,
  [NOdescrAutoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Estructura], [Categoria])
);

-- ===== EstructurasCatCategorias  (filas: 0) =====
CREATE TABLE [EstructurasCatCategorias] (
  [Nombre] NVARCHAR(100),
  [IdCategoria] GUID NOT NULL,
  [Orden] SMALLINT,
  PRIMARY KEY ([IdCategoria])
);

-- ===== EstructurasCatSubcategorias  (filas: 0) =====
CREATE TABLE [EstructurasCatSubcategorias] (
  [Nombre] NVARCHAR(100),
  [IdSubcategoria] GUID NOT NULL,
  [IdCategoria] GUID NOT NULL,
  [Orden] SMALLINT,
  PRIMARY KEY ([IdSubcategoria])
);

-- ===== EstructurasCatSubcategoriasLinArt  (filas: 0) =====
CREATE TABLE [EstructurasCatSubcategoriasLinArt] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [IdSubcategoria] GUID NOT NULL,
  [Orden] SMALLINT,
  PRIMARY KEY ([IdSubcategoria], [Articulo])
);

-- ===== EstructurasCatSubcategoriasLinEstr  (filas: 0) =====
CREATE TABLE [EstructurasCatSubcategoriasLinEstr] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [IdSubcategoria] GUID NOT NULL,
  [Orden] SMALLINT,
  PRIMARY KEY ([IdSubcategoria], [Estructura])
);

-- ===== EstructurasCatSubEstrAdd  (filas: 0) =====
CREATE TABLE [EstructurasCatSubEstrAdd] (
  [EstructuraOriginal] NVARCHAR(14) NOT NULL,
  [SubestructuraAñadir] NVARCHAR(14) NOT NULL,
  [Cantidad] SMALLINT,
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargo] NVARCHAR(255),
  PRIMARY KEY ([EstructuraOriginal], [SubestructuraAñadir])
);

-- ===== EstructurasCES  (filas: 0) =====
CREATE TABLE [EstructurasCES] (
  [EstructuraAsociada] NVARCHAR(14),
  [IdCES] GUID NOT NULL,
  [Descripcion] NVARCHAR,
  [AnchoDesde] REAL,
  [AnchoHasta] REAL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [AjustarMedidasAIntervalo] BOOLEAN NOT NULL,
  [IntervaloAncho] REAL,
  [IntervaloAlto] REAL,
  [FechaCreacion] DATE,
  [SeriePerfiles] NVARCHAR(15) NOT NULL,
  [VersionCES] SMALLINT,
  PRIMARY KEY ([IdCES])
);

-- ===== EstructurasCESaperturas  (filas: 0) =====
CREATE TABLE [EstructurasCESaperturas] (
  [Estructura] NVARCHAR(15) NOT NULL,
  [NumeroOpcionApertura] SMALLINT NOT NULL,
  [DescripcionApertura] NVARCHAR(50),
  PRIMARY KEY ([Estructura], [NumeroOpcionApertura])
);

-- ===== EstructurasCESHuecosVidrio  (filas: 0) =====
CREATE TABLE [EstructurasCESHuecosVidrio] (
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargo] NVARCHAR(255),
  [Cantidad] REAL,
  [IdHuecoVidrio] GUID NOT NULL,
  [IdCES] GUID NOT NULL,
  PRIMARY KEY ([IdHuecoVidrio])
);

-- ===== EstructurasCESPuntoItems  (filas: 0) =====
CREATE TABLE [EstructurasCESPuntoItems] (
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargo] NVARCHAR(255),
  [TipoMetraje] NVARCHAR(3),
  [Valor] REAL,
  [IdItem] GUID NOT NULL,
  [IdPunto] GUID NOT NULL,
  [IdCES] GUID NOT NULL,
  PRIMARY KEY ([IdItem])
);

-- ===== EstructurasCESPuntos  (filas: 0) =====
CREATE TABLE [EstructurasCESPuntos] (
  [AnchoHasta] REAL,
  [AltoHasta] REAL,
  [IdPunto] GUID NOT NULL,
  [IdCES] GUID NOT NULL,
  [Acabado] NVARCHAR(10),
  [Tarifa] NVARCHAR(5),
  PRIMARY KEY ([IdPunto])
);

-- ===== EstructurasCESPuntosV2  (filas: 0) =====
CREATE TABLE [EstructurasCESPuntosV2] (
  [AnchoHasta] REAL,
  [AltoHasta] REAL,
  [IdPunto] GUID NOT NULL,
  [IdCES] GUID NOT NULL,
  PRIMARY KEY ([IdPunto])
);

-- ===== EstructurasCESPuntoV2Items  (filas: 0) =====
CREATE TABLE [EstructurasCESPuntoV2Items] (
  [CodigoArticulo] NVARCHAR(15),
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargo] NVARCHAR(255),
  [FormulaCantidad] NVARCHAR(255),
  [Cantidad] REAL,
  [AcabadoValoracion] NVARCHAR(4),
  [IdItem] GUID NOT NULL,
  [IdPunto] GUID NOT NULL,
  [IdCES] GUID NOT NULL,
  [AcabadoFijo] NVARCHAR(10),
  PRIMARY KEY ([IdItem])
);

-- ===== EstructurasCFacc  (filas: 0) =====
CREATE TABLE [EstructurasCFacc] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [nOpcAcc] SMALLINT,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasCFCajones  (filas: 0) =====
CREATE TABLE [EstructurasCFCajones] (
  [Estructura] NVARCHAR(14),
  [nCajon] SMALLINT,
  [CodCajon] NVARCHAR(15),
  [SalidaFrontalSN] BOOLEAN NOT NULL,
  [SalidaInferiorSN] BOOLEAN NOT NULL,
  [SalidaMiniSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Estructura], [nCajon])
);

-- ===== EstructurasCFLamas  (filas: 0) =====
CREATE TABLE [EstructurasCFLamas] (
  [Estructura] NVARCHAR(14),
  [nLama] SMALLINT,
  [CodLama] NVARCHAR(15),
  PRIMARY KEY ([Estructura], [nLama])
);

-- ===== EstructurasCliDtoConfig  (filas: 2) =====
CREATE TABLE [EstructurasCliDtoConfig] (
  [Orden] SMALLINT NOT NULL,
  [TipoDescuento] NVARCHAR(10) NOT NULL,
  [PararProcesamientoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDescuento])
);

-- ===== EstructurasCompactosGuias  (filas: 0) =====
CREATE TABLE [EstructurasCompactosGuias] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Guia] NVARCHAR(15) NOT NULL,
  [Valorar] BOOLEAN NOT NULL,
  [nLin] INTEGER NOT NULL,
  PRIMARY KEY ([Estructura], [Guia])
);

-- ===== EstructurasDA  (filas: 198) =====
CREATE TABLE [EstructurasDA] (
  [Estructura] NVARCHAR(14),
  [nDA] SMALLINT,
  [NombreDA] NVARCHAR(60),
  [SimboloDA] NVARCHAR(3),
  [MedidaStd] REAL,
  [DescrAutoSN] BOOLEAN NOT NULL,
  [OcultarLocalSN] BOOLEAN NOT NULL,
  [OcultarProdWebSN] BOOLEAN NOT NULL,
  [DesdeSubestructuraSN] BOOLEAN NOT NULL,
  [SubestructuraOrigen] NVARCHAR(60),
  PRIMARY KEY ([Estructura], [nDA])
);

-- ===== EstructurasDatosAuxiliares  (filas: 393) =====
CREATE TABLE [EstructurasDatosAuxiliares] (
  [Estructura] NVARCHAR(60) NOT NULL,
  [CompFtipoValVuelo] NVARCHAR(1),
  [CompFtipoValDtoAltCajSN] BOOLEAN NOT NULL,
  [CompFforzarSeleccionarGuiasSN] BOOLEAN NOT NULL,
  [CompFconCerrojillosSN] BOOLEAN NOT NULL,
  [CompFconTaponesSN] BOOLEAN NOT NULL,
  [CompFconGrapasSN] BOOLEAN NOT NULL,
  [CompFaccionamientoObligatorioSN] BOOLEAN NOT NULL,
  [CompFadmiteGuiaCentralSN] BOOLEAN NOT NULL,
  [CompFtipoValDoblePañoSN] BOOLEAN NOT NULL,
  [compfnLini] REAL,
  [CompFtipoCalcNLam] NVARCHAR(4),
  [CompFnLamTerminalSN] BOOLEAN NOT NULL,
  [CompfDtoTaponLam] REAL,
  [CompFejeNoVuelaSN] BOOLEAN NOT NULL,
  [compDtoPorGCEjeTes2] REAL,
  [CompFnumLamRestarAd] SMALLINT,
  [compDtoEjeTesCen2] REAL,
  [compDtoLamaTesCen2] REAL,
  [CompFtipoRedLam] NVARCHAR(3),
  [compFdtoTapLamTerminalSN] BOOLEAN NOT NULL,
  [CompFNoAplicarDtoGuiSN] BOOLEAN NOT NULL,
  [CompFDCembIndividualSN] BOOLEAN NOT NULL,
  [CompFvalVueloIndepIzDeSN] BOOLEAN NOT NULL,
  [CompFanulaCajSi4TapTotSN] BOOLEAN NOT NULL,
  [compDtoLamTes2] REAL,
  [compDtoPorGCLamTes2] REAL,
  [compDtoLamTes3] REAL,
  [compDtoPorGCLamTes3] REAL,
  [CompFDCplacaCentralSN] BOOLEAN NOT NULL,
  [CompFflejesCdadDCSN] BOOLEAN NOT NULL,
  [CompFanulaCajSi4AccSN] BOOLEAN NOT NULL,
  [CompFguiasNODtoTamCajSN] BOOLEAN NOT NULL,
  [CompFdescuentoAdCondicionalSN] BOOLEAN NOT NULL,
  [CompFSalAccVueloVP] NVARCHAR(1),
  [CompFejeCambio] NVARCHAR(15),
  [CompFejeCambioDesdeA] REAL,
  [CompFtituloAccCaj] NVARCHAR(20),
  [CompFnoGenerarECsn] BOOLEAN NOT NULL,
  [compCodAcc] NVARCHAR(15),
  [CompFanchoMax] REAL,
  [CompFnumeroTEmax] SMALLINT,
  [CompFnumeroTapasTotMax] SMALLINT,
  [CompFfamiliaMotores] NVARCHAR(3),
  [CompFacabadoTesterosObligatorioSN] BOOLEAN NOT NULL,
  [CompFacabadoTopesObligatorioSN] BOOLEAN NOT NULL,
  [CompFacabadoGuiacintasObligatorioSN] BOOLEAN NOT NULL,
  [CompFejeObligatorioSN] BOOLEAN NOT NULL,
  [CompFAcabadoTExtrObligatorioSN] BOOLEAN NOT NULL,
  [CompFAcabadoTCajonObligatorioSN] BOOLEAN NOT NULL,
  [CompFAcabadoEmbudosObligatorioSN] BOOLEAN NOT NULL,
  [compFiltroGuias] BOOLEAN NOT NULL,
  [CompFSalidaAccionamientoSN] BOOLEAN NOT NULL,
  [CompFCerrojillosNombre] NVARCHAR(20),
  [CompFprioridadGuias] NVARCHAR(6),
  [CompFbajadaDFSN] BOOLEAN NOT NULL,
  [CompFadmiteVuelosSN] BOOLEAN NOT NULL,
  [SeleccionarCategoriasAcaDeSubestructurasSN] BOOLEAN NOT NULL,
  [CompFAislanteVueloSN] BOOLEAN NOT NULL,
  [CompFAislanteUnaPiezaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Estructura])
);

-- ===== EstructurasDibujoCond  (filas: 0) =====
CREATE TABLE [EstructurasDibujoCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [FormulaOpcSel] NVARCHAR(100),
  [IdDibujo] INTEGER,
  [AnchoDesde] SMALLINT,
  [AnchoHasta] SMALLINT,
  [AltoDesde] SMALLINT,
  [AltoHasta] SMALLINT,
  [lstArticulosEnDespiece] NVARCHAR(200),
  [lstArticulosTipoFiltro] NVARCHAR(1),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasDibujos  (filas: 0) =====
CREATE TABLE [EstructurasDibujos] (
  [IdDibujo] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [NombreFichero] NVARCHAR(50),
  [Tipo_PROD_CLI] NVARCHAR(10),
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([IdDibujo])
);

-- ===== EstructurasDimMax  (filas: 0) =====
CREATE TABLE [EstructurasDimMax] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [DimAnchoMin] REAL,
  [DimAnchoMax] REAL,
  [DimAltoMin] REAL,
  [DimAltoMax] REAL,
  [AvisoSN] BOOLEAN NOT NULL,
  [BloqueoVentaSN] BOOLEAN NOT NULL,
  [AvisoTexto] NVARCHAR(255),
  [IdDimensionMax] GUID NOT NULL,
  [AnchoMaximoBusquedaSN] BOOLEAN NOT NULL,
  [AltoMaximoBusquedaSN] BOOLEAN NOT NULL,
  [FormulaOpcSel] NVARCHAR(255),
  PRIMARY KEY ([IdDimensionMax])
);

-- ===== EstructurasDisAcc  (filas: 0) =====
CREATE TABLE [EstructurasDisAcc] (
  [nLin] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [idItem] INTEGER,
  [CodForma] NVARCHAR(10),
  [x] REAL,
  [y] REAL,
  [Ancho] REAL,
  [Alto] REAL,
  [idAsocAncho] INTEGER,
  [idAsocAlto] INTEGER,
  [ArticuloAsoc] NVARCHAR(15),
  [EstructuraAsoc] NVARCHAR(14),
  [CdadAsoc] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== EstructurasDiseño  (filas: 18603) =====
CREATE TABLE [EstructurasDiseño] (
  [nLin] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [Id] INTEGER,
  [Tipo] INTEGER,
  [ContenidoEn] INTEGER,
  [TipoHoja] INTEGER,
  [moVP] NVARCHAR(1),
  [nHoja] SMALLINT,
  [TipoTrav] NVARCHAR(2),
  [TipoCota] INTEGER,
  [TravMedAbsMRel] NVARCHAR(1),
  [OperacionEqui] SMALLINT,
  [nTrav] SMALLINT,
  [Cota] REAL,
  [Simbolo] NVARCHAR(2),
  [nombreDA] NVARCHAR(20),
  [idTrav] INTEGER,
  [idHoja] INTEGER,
  [posHueco] SMALLINT,
  [TipoHuecoH] INTEGER,
  [TipoHuecoV] INTEGER,
  [bInvisible] BOOLEAN NOT NULL,
  [travMH] NVARCHAR(1),
  [barrVert] SMALLINT,
  [barrHoriz] SMALLINT,
  [barrArtic] NVARCHAR(15),
  [barrAca] NVARCHAR(10),
  [CompHojaInf] SMALLINT,
  [Vidrio] NVARCHAR(15),
  [VidJunqSN] BOOLEAN NOT NULL,
  [TipoCorte1] SMALLINT,
  [TipoCorte2] SMALLINT,
  [TipoCorte3] SMALLINT,
  [TipoCorte4] SMALLINT,
  [bZocaloOPC] BOOLEAN NOT NULL,
  [bApertExt] BOOLEAN NOT NULL,
  [bVAG] BOOLEAN NOT NULL,
  [TravVP] NVARCHAR(1),
  [TipoMarco] NVARCHAR(25),
  [SeparacionLamas] REAL,
  [TipoLama] NVARCHAR(1),
  [PlHojasX] SMALLINT,
  [PlHojasY] SMALLINT,
  [TipoCurva] SMALLINT,
  [c1] REAL,
  [c2] REAL,
  [radio] REAL,
  [posCurva] SMALLINT,
  [Hc] REAL,
  [Hd] REAL,
  [Ld] REAL,
  [Hi] REAL,
  [Li] REAL,
  [PerfilAdSN] BOOLEAN NOT NULL,
  [PerAdSup] NVARCHAR(15),
  [PerAdInf] NVARCHAR(15),
  [PerAdIz] NVARCHAR(15),
  [PerAdDe] NVARCHAR(15),
  [PerAdBat] NVARCHAR(15),
  [idPerAdSup] INTEGER,
  [idPerAdInf] INTEGER,
  [idPerAdIz] INTEGER,
  [idPerAdDe] INTEGER,
  [idPerAdBat] INTEGER,
  [altManilla] REAL,
  [bandIzDe] NVARCHAR(2),
  [barrDtoAncho] REAL,
  [barrDtoAlto] REAL,
  [barrDtoIniX] REAL,
  [barrDtoIniY] REAL,
  [lstAccDis] NVARCHAR(255),
  [bZocaloAd] BOOLEAN NOT NULL,
  [bPerInf] BOOLEAN NOT NULL,
  [bPerSup] BOOLEAN NOT NULL,
  [bPerIz] BOOLEAN NOT NULL,
  [bPerDe] BOOLEAN NOT NULL,
  [TipoCorredera] NVARCHAR(1),
  [bPerSupAd] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLin])
);

-- ===== EstructurasDocumentosProdCond  (filas: 0) =====
CREATE TABLE [EstructurasDocumentosProdCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [FormulaOpcSel] NVARCHAR(100),
  [AnchoDesde] SMALLINT,
  [AnchoHasta] SMALLINT,
  [AltoDesde] SMALLINT,
  [AltoHasta] SMALLINT,
  [SeriePerfiles] NVARCHAR(15),
  [TituloFicheroDoc] NVARCHAR(80),
  [NombreFicheroDoc] NVARCHAR(150),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasExcelProduccion  (filas: 0) =====
CREATE TABLE [EstructurasExcelProduccion] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [TablaBD] NVARCHAR(50),
  [TablaCampoBD] NVARCHAR(50),
  [CampoBD] NVARCHAR(50),
  [CasillaExcel] NVARCHAR(50),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasInfoWebCond  (filas: 0) =====
CREATE TABLE [EstructurasInfoWebCond] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [FormulaOpcSel] NVARCHAR(100),
  [AnchoDesde] INTEGER,
  [AnchoHasta] INTEGER,
  [AltoDesde] INTEGER,
  [AltoHasta] INTEGER,
  [ProdWebInformacion] NVARCHAR,
  [ProdWebInformacionAdicional] NVARCHAR,
  [SeriePerfiles] NVARCHAR(15),
  [TituloFicheroDoc] NVARCHAR(80),
  [NombreFicheroDoc] NVARCHAR(150),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasLinAcabadoAsoc  (filas: 0) =====
CREATE TABLE [EstructurasLinAcabadoAsoc] (
  [AcabadoEstr] NVARCHAR(10) NOT NULL,
  [AcaTonalidadEstr] NVARCHAR(10) NOT NULL,
  [IdLinea] GUID NOT NULL,
  [AcabadoArt] NVARCHAR(10),
  [AcaTonalidadArt] NVARCHAR(10),
  PRIMARY KEY ([IdLinea], [AcabadoEstr], [AcaTonalidadEstr])
);

-- ===== EstructurasLinCantidadIntervalos  (filas: 0) =====
CREATE TABLE [EstructurasLinCantidadIntervalos] (
  [nLinea] INTEGER NOT NULL,
  [IdLinea] GUID NOT NULL,
  [FormulaAncho] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(30),
  [MedidaMin_Ancho] REAL,
  [MedidaMax_Ancho] REAL,
  [MedidaMin_Largo] REAL,
  [MedidaMax_Largo] REAL,
  [Cantidad] REAL,
  [CantidadCorte] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasLineas  (filas: 9) =====
CREATE TABLE [EstructurasLineas] (
  [Funcion] NVARCHAR(20),
  [IdLinea] GUID NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Orden] SMALLINT,
  [Comentario] NVARCHAR(50),
  [Cantidad] REAL,
  [FormulaAncho] NVARCHAR(255),
  [FormulaLargo] NVARCHAR(255),
  [FormulaCantidad] NVARCHAR(255),
  [CantidadNumeroDecimales] SMALLINT,
  [CantidadRedondeo] NVARCHAR(10),
  [CantidadCorte] REAL,
  [FormulaAnchoCorte] NVARCHAR(255),
  [FormulaLargoCorte] NVARCHAR(255),
  [FormulaCantidadCorte] NVARCHAR(255),
  [CantidadNumeroDecimalesCorte] SMALLINT,
  [CantidadRedondeoCorte] NVARCHAR(10),
  [AnguloIzquierdo] REAL,
  [AnguloDerecho] REAL,
  [TipoCorte] NVARCHAR(2),
  [CorteIgualQueValoracion] BOOLEAN NOT NULL,
  [TipoLinea] NVARCHAR(15),
  [IdCES] GUID,
  [UnidadesMin] REAL,
  [UnidadesMax] REAL,
  [FormulaMedidaMinMax] NVARCHAR(30),
  [MedidaMin] REAL,
  [MedidaMax] REAL,
  [Subestructura] NVARCHAR(14),
  [NoComputarCoste] BOOLEAN NOT NULL,
  [NoComputarVenta] BOOLEAN NOT NULL,
  [FormulaSeleccionOpciones] NVARCHAR,
  [FiltroAcabadoAComparar] NVARCHAR(15),
  [FiltroAcabados] NVARCHAR,
  [FiltroFamiliasAcabados] NVARCHAR,
  [ComputaFiltroPesoSN] BOOLEAN NOT NULL,
  [FiltroPesoSN] BOOLEAN NOT NULL,
  [PesoDesde] REAL,
  [PesoHasta] REAL,
  [FormulaMedidaMinMax2] NVARCHAR(30),
  [MedidaMin2] REAL,
  [MedidaMax2] REAL,
  [NoInsertarSiCantidadCeroSN] BOOLEAN NOT NULL,
  [CodigoMOConcepto] NVARCHAR(5),
  [Acabado_ESTR_FIJO_ASOC_VINC] NVARCHAR(4),
  [AcabadoFijo] NVARCHAR(10),
  [AcabadoFijoTonalidad] NVARCHAR(10),
  [CategoriaAca] NVARCHAR(5),
  [lstSubfamiliasPresentes] NVARCHAR,
  [lstSubfamiliasTipoFiltro] NVARCHAR(1),
  [CantidadIntervalosSN] BOOLEAN NOT NULL,
  [IntervalosMultSN] BOOLEAN NOT NULL,
  [MedidasIntervalosSN] BOOLEAN NOT NULL,
  [FiltroAcabadoCategoria] NVARCHAR(5),
  PRIMARY KEY ([IdLinea])
);

-- ===== EstructurasLinIntervalosMult  (filas: 0) =====
CREATE TABLE [EstructurasLinIntervalosMult] (
  [nLinea] INTEGER NOT NULL,
  [IdLinea] GUID NOT NULL,
  [FormulaAncho] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(30),
  [MedidaMin_Ancho] REAL,
  [MedidaMax_Ancho] REAL,
  [MedidaMin_Largo] REAL,
  [MedidaMax_Largo] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasLinMedidasIntervalos  (filas: 0) =====
CREATE TABLE [EstructurasLinMedidasIntervalos] (
  [nLinea] INTEGER NOT NULL,
  [IdLinea] GUID NOT NULL,
  [FormulaAncho] NVARCHAR(30),
  [FormulaLargo] NVARCHAR(30),
  [MedidaMin_Ancho] REAL,
  [MedidaMax_Ancho] REAL,
  [MedidaMin_Largo] REAL,
  [MedidaMax_Largo] REAL,
  [FormulaAnchoVenta] NVARCHAR(30),
  [FormulaLargoVenta] NVARCHAR(30),
  [FormulaAnchoCorte] NVARCHAR(30),
  [FormulaLargoCorte] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasLinSustAca  (filas: 0) =====
CREATE TABLE [EstructurasLinSustAca] (
  [AcabadoOrig] NVARCHAR(10) NOT NULL,
  [TonalidadOrig] NVARCHAR(10) NOT NULL,
  [IdLinea] GUID NOT NULL,
  [AcabadoDst] NVARCHAR(10),
  [TonalidadDst] NVARCHAR(10),
  PRIMARY KEY ([IdLinea], [AcabadoOrig], [TonalidadOrig])
);

-- ===== EstructurasMecOperaciones  (filas: 0) =====
CREATE TABLE [EstructurasMecOperaciones] (
  [IdMecOperacion] INTEGER NOT NULL,
  [TipoOperacion] NVARCHAR(30),
  [Descripcion] NVARCHAR(50),
  [CodigoOp] NVARCHAR(40),
  [CotaOpIni] REAL,
  [CotaOpFin] REAL,
  [Separacion] REAL,
  [lstMaquinas] NVARCHAR(20),
  [Comentario] NVARCHAR(50),
  [ObservacionesEtiq] NVARCHAR(40),
  [CentroSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([IdMecOperacion])
);

-- ===== EstructurasMecTiposOperacion  (filas: 0) =====
CREATE TABLE [EstructurasMecTiposOperacion] (
  [TipoOperacion] NVARCHAR(30) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([TipoOperacion])
);

-- ===== EstructurasOpcCategorias  (filas: 0) =====
CREATE TABLE [EstructurasOpcCategorias] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [NumeroCategoria] SMALLINT NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Estructura], [NumeroCategoria])
);

-- ===== EstructurasOpcGrupos  (filas: 132) =====
CREATE TABLE [EstructurasOpcGrupos] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [OPCnGrupo] SMALLINT NOT NULL,
  [GrpTitulo] NVARCHAR(255),
  [GrpNOselecUsrSN] BOOLEAN NOT NULL,
  [GrpSeleccionEnGridSN] BOOLEAN NOT NULL,
  [GrpValorEscalarSN] BOOLEAN NOT NULL,
  [GrpValorEscalarTipoDatos] NVARCHAR(20),
  [GrpValorEscalarRequeridoSN] BOOLEAN NOT NULL,
  [GrpValorEscalarPredeterminado] NVARCHAR(100),
  [GrpValorEscalarSimbolo] NVARCHAR(3),
  [GrpSeleccionOpcRequeridaSN] BOOLEAN NOT NULL,
  [NumeroCategoria] SMALLINT,
  [GRPnOrden] SMALLINT,
  [GrpOpcionesConDibujosSN] BOOLEAN NOT NULL,
  [GrpActivoCondicionalSN] BOOLEAN NOT NULL,
  [GrpActivoFormula] NVARCHAR(255),
  PRIMARY KEY ([Estructura], [OPCnGrupo])
);

-- ===== EstructurasOpcOpciones  (filas: 298) =====
CREATE TABLE [EstructurasOpcOpciones] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [OPCnGrupo] SMALLINT NOT NULL,
  [OPCnOpcion] SMALLINT NOT NULL,
  [OPCpredetSN] BOOLEAN NOT NULL,
  [OPCtexto] NVARCHAR(255),
  [OPCNOdescrAutoSN] BOOLEAN NOT NULL,
  [OPCnOrden] SMALLINT,
  [OPCIncompatibleSN] BOOLEAN NOT NULL,
  [OPCIncompatibleConLstGroOpc] NVARCHAR(255),
  [OPCIncompatibleFormula] NVARCHAR(255),
  [OPCIncompatibleMensaje] NVARCHAR(255),
  [OPCactivaCondicionalSN] BOOLEAN NOT NULL,
  [OPCactivaFormula] NVARCHAR(255),
  PRIMARY KEY ([Estructura], [OPCnGrupo], [OPCnOpcion])
);

-- ===== EstructurasOpcValorEscalarOpcion  (filas: 0) =====
CREATE TABLE [EstructurasOpcValorEscalarOpcion] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [OPCnGrupo] SMALLINT,
  [ValorDesde] NVARCHAR(100),
  [ValorHasta] NVARCHAR(100),
  [nOpcionSeleccionada] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== EstructurasPartidasArancelarias  (filas: 0) =====
CREATE TABLE [EstructurasPartidasArancelarias] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Pais] NVARCHAR(10) NOT NULL,
  [PartidaArancelaria] NVARCHAR(20),
  PRIMARY KEY ([Estructura], [Pais])
);

-- ===== EstructurasSecciones  (filas: 0) =====
CREATE TABLE [EstructurasSecciones] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(30) NOT NULL,
  [nLin] INTEGER NOT NULL,
  PRIMARY KEY ([Estructura], [Codigo])
);

-- ===== EstructurasSeriesAsoc  (filas: 307) =====
CREATE TABLE [EstructurasSeriesAsoc] (
  [nLin] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14),
  [Serie] NVARCHAR(15),
  [SerieUnir] NVARCHAR(15),
  PRIMARY KEY ([nLin])
);

-- ===== EstructurasTarEstr  (filas: 0) =====
CREATE TABLE [EstructurasTarEstr] (
  [Estructura] NVARCHAR(14),
  [CodSerie] NVARCHAR(15),
  [DesdeA] REAL,
  [HastaA] REAL,
  [IntervaloA] REAL,
  [DesdeL] REAL,
  [HastaL] REAL,
  [IntervaloL] REAL,
  [Acabado1] NVARCHAR(10),
  [Acabado2] NVARCHAR(10),
  [Acabado3] NVARCHAR(10),
  [Destino_XLS_PT] NVARCHAR(3),
  [DestinoPT_codigoArt] NVARCHAR(15),
  [DestinoPT_tarifaDst] NVARCHAR(1),
  [Acabado4] NVARCHAR(10),
  [Acabado5] NVARCHAR(10),
  [Acabado6] NVARCHAR(10),
  [CESnumeroPuntosConfig] NVARCHAR(20),
  [CESnumeroPuntosAncho] SMALLINT,
  [CESnumeroPuntosAlto] SMALLINT,
  [AcabadoAcc1] NVARCHAR(10),
  [AcabadoAcc2] NVARCHAR(10),
  [AcabadoAcc3] NVARCHAR(10),
  [AcabadoAcc4] NVARCHAR(10),
  [AcabadoAcc5] NVARCHAR(10),
  [Acabado7] NVARCHAR(10),
  [Acabado8] NVARCHAR(10),
  [Acabado9] NVARCHAR(10),
  [Acabado10] NVARCHAR(10),
  PRIMARY KEY ([Estructura], [CodSerie])
);

-- ===== EstructurasTTFabricacion  (filas: 0) =====
CREATE TABLE [EstructurasTTFabricacion] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [Fase] NVARCHAR(3) NOT NULL,
  [Subfase] NVARCHAR(3) NOT NULL,
  PRIMARY KEY ([Estructura], [Fase], [Subfase])
);

-- ===== EstructurasVariables  (filas: 0) =====
CREATE TABLE [EstructurasVariables] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [SimboloVariable] NVARCHAR(5) NOT NULL,
  [NombreVariable] NVARCHAR(80),
  [OrdenCalculo] SMALLINT,
  [Formula] NVARCHAR(255),
  [ValorPorIntervaloSN] BOOLEAN NOT NULL,
  [PasarASubestructuraSN] BOOLEAN NOT NULL,
  [Observaciones] NVARCHAR(80),
  PRIMARY KEY ([Estructura], [SimboloVariable])
);

-- ===== EstructurasVariablesIntervalos  (filas: 0) =====
CREATE TABLE [EstructurasVariablesIntervalos] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [SimboloVariable] NVARCHAR(5) NOT NULL,
  [Orden] SMALLINT,
  [MedidaMin_Ancho] SMALLINT,
  [MedidaMax_Ancho] SMALLINT,
  [MedidaMin_Largo] SMALLINT,
  [MedidaMax_Largo] SMALLINT,
  [Formula] NVARCHAR(255),
  [FormulaOpcSel] NVARCHAR(100),
  [Observaciones] NVARCHAR(80),
  PRIMARY KEY ([nLinea])
);

-- ===== EtiquetasCampos  (filas: 22) =====
CREATE TABLE [EtiquetasCampos] (
  [Campo] NVARCHAR(20),
  [nCampo] SMALLINT,
  [ImprimirSN] BOOLEAN NOT NULL,
  [TamLetra] SMALLINT,
  [Horizontal] SMALLINT,
  [Vertical] SMALLINT,
  PRIMARY KEY ([Campo])
);

-- ===== EURO  (filas: 1) =====
CREATE TABLE [EURO] (
  [RedondeoPrecio] SMALLINT,
  [RedondeoLinea] SMALLINT,
  [RedondeoBase] SMALLINT,
  [RedondeoIVA] SMALLINT,
  [RedondeoTotal] SMALLINT,
  [CambioEURO] REAL
);

-- ===== FabricacionArt  (filas: 0) =====
CREATE TABLE [FabricacionArt] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [FechaEntrega] DATE,
  [Descripcion] NVARCHAR,
  [Observaciones] NVARCHAR,
  [EnFabricacionSN] BOOLEAN NOT NULL,
  [DesdeFabricacion] DATE,
  [FechaPrevFabr] DATE,
  [FabricadoSN] BOOLEAN NOT NULL,
  [HastaFabricacion] DATE,
  [ProveedorFabr] NVARCHAR(10),
  [StockActSN] BOOLEAN NOT NULL,
  [StockActPendSN] BOOLEAN NOT NULL,
  [AlmacenSalida] NVARCHAR(5),
  [AlmacenEntrada] NVARCHAR(5),
  [FechaStock] DATE,
  [ContPendienteEntradaSN] BOOLEAN NOT NULL,
  [ContPendienteEntradaFecha] DATE,
  [TipoDocumento] NVARCHAR(5),
  [Delegacion] NVARCHAR(2),
  [Usuario] NVARCHAR(30),
  [StockActParcialSN] BOOLEAN NOT NULL,
  [MontajePlanSN] BOOLEAN NOT NULL,
  [MontajeFecha] DATE,
  [MontajeSemana] NVARCHAR(10),
  [TTbloqueoSN] BOOLEAN NOT NULL,
  [TTobservaciones] NVARCHAR(100),
  [TTPrioridad] SMALLINT,
  [TTFechaPrevista] DATE,
  [TTHoraPrevista] DATE,
  [SeccionProduccion] NVARCHAR(10),
  [ReferenciaInterna] NVARCHAR(50),
  [ImpresoSN] BOOLEAN NOT NULL,
  [FechaImpreso] DATE,
  [VRepartoSN] BOOLEAN NOT NULL,
  [VRepartoNum] NVARCHAR(20),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [NumeroControl] INTEGER,
  [ConsumoExportadoSN] BOOLEAN NOT NULL,
  [FechaConsumoExportado] DATE,
  [ObservacionesConsumoExportado] NVARCHAR,
  [EstadoFabricacion] SMALLINT,
  [EstadoFabricacionDesde] DATE,
  [AlmacenFabricados] NVARCHAR(5),
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([Numero])
);

-- ===== FabricacionArtLin  (filas: 0) =====
CREATE TABLE [FabricacionArtLin] (
  [nLinea] INTEGER NOT NULL,
  [nFabricacionArt] NVARCHAR(20) NOT NULL,
  [Estructura] NVARCHAR(14),
  [Cantidad] REAL,
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [ProveedorFabr] NVARCHAR(10),
  [EstructuraSN] BOOLEAN NOT NULL,
  [nEstr] INTEGER,
  [Articulo] NVARCHAR(15),
  [Descripcion] NVARCHAR,
  [Largo] REAL,
  [Ancho] REAL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [CantidadCorte] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [Funcion] NVARCHAR(20),
  [PosicionTrabajo] NVARCHAR(1),
  [NumeroLinea] SMALLINT,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [CdadMetPorEmb] REAL,
  [BloqueoCdadMetPorEmbSN] BOOLEAN NOT NULL,
  [OrdenEstructura] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== Familias  (filas: 32) =====
CREATE TABLE [Familias] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(80),
  [Margen1] REAL,
  [Margen2] REAL,
  [Margen3] REAL,
  [Margen4] REAL,
  [Margen5] REAL,
  [Margen6] REAL,
  [Margen7] REAL,
  [Margen8] REAL,
  [CalculoPVP] NVARCHAR(5),
  [RestarDtoSN] BOOLEAN NOT NULL,
  [MargenTipoArtSN] BOOLEAN NOT NULL,
  [MultiplesSeriesSN] BOOLEAN NOT NULL,
  [SeleccionEstrSN] BOOLEAN NOT NULL,
  [PedidosAutoSN] BOOLEAN NOT NULL,
  [PedidosAutoOptSN] BOOLEAN NOT NULL,
  [ProveedorHabitual] NVARCHAR(10),
  [ImportadaSN] BOOLEAN NOT NULL,
  [GrupoHDesp] SMALLINT,
  [TarifaProvSN] BOOLEAN NOT NULL,
  [TPproveedor] NVARCHAR(10),
  [TPseleccionadoSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [VPresTotalLineaSN] BOOLEAN NOT NULL,
  [VPresTotalPresSN] BOOLEAN NOT NULL,
  [VPresOrdenTotFam] SMALLINT,
  [VidRecCurMP] REAL,
  [VidRecCurReb] REAL,
  [VidRecCurCarp2R] REAL,
  [VidRecCurCarp3R] REAL,
  [VidRecCurCirc] REAL,
  [OrdenEscap] SMALLINT,
  [CuentaContabSN] BOOLEAN NOT NULL,
  [CuentaContabVentas] NVARCHAR(15),
  [CuentaContabComprasSN] BOOLEAN NOT NULL,
  [CuentaContabCompras] NVARCHAR(15),
  [TarifaAvanzadaSN] BOOLEAN NOT NULL,
  [VidRecCurForma] REAL,
  [TipoMargenCV] NVARCHAR(1),
  [ManufSN] BOOLEAN NOT NULL,
  [CalcDespunteSN] BOOLEAN NOT NULL,
  [VidCalculaPesoSN] BOOLEAN NOT NULL,
  [VidFactorPesoMM] REAL,
  [VidRepercutirREcosteSN] BOOLEAN NOT NULL,
  [VidRepREcosteKg] REAL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [PedidosAutoNoAgruparSN] BOOLEAN NOT NULL,
  [BloqueoPVPsn] BOOLEAN NOT NULL,
  [CuentaContabGastosSN] BOOLEAN NOT NULL,
  [CuentaContabGastos] NVARCHAR(15),
  [ExportaTarSN] BOOLEAN NOT NULL,
  [VidCosteREprovSN] BOOLEAN NOT NULL,
  [PVPTipoCosteConSinGastos] NVARCHAR(10),
  [VidRecCurCosteSN] BOOLEAN NOT NULL,
  [CCreaPedTipoProveedor] NVARCHAR(2),
  [CCreaPedProveedor] NVARCHAR(10),
  [CPedTipoPedidoML] NVARCHAR(15),
  [FechaHoraAct] DATE,
  [ProdWebNoMostrarEnCatalogoSN] BOOLEAN NOT NULL,
  [PedidosAutoAgruparRefVentaSN] BOOLEAN NOT NULL,
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== FamiliasAcabados  (filas: 0) =====
CREATE TABLE [FamiliasAcabados] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [FechaHoraAct] DATE,
  PRIMARY KEY ([Codigo])
);

-- ===== FamiliasCat  (filas: 5) =====
CREATE TABLE [FamiliasCat] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Codigo] NVARCHAR(5),
  [Descripcion] NVARCHAR(30),
  PRIMARY KEY ([Familia], [Codigo])
);

-- ===== FamiliasComponentes  (filas: 249) =====
CREATE TABLE [FamiliasComponentes] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Componente] NVARCHAR(5) NOT NULL,
  [ComponenteVariable] NVARCHAR(5),
  [CVsn] BOOLEAN NOT NULL,
  [FamiliaDefine] NVARCHAR(10),
  [Grupo] NVARCHAR(5),
  [Categoria] NVARCHAR(5),
  [ValidoAsocSN] BOOLEAN NOT NULL,
  [Tipo] NVARCHAR(5),
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([Familia], [Componente])
);

-- ===== FamiliasCV  (filas: 8) =====
CREATE TABLE [FamiliasCV] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Componente] NVARCHAR(3),
  [Descripcion] NVARCHAR(30),
  [PorDefecto] NVARCHAR(5),
  [FamiliaResuelve] NVARCHAR(10),
  PRIMARY KEY ([Familia], [Componente])
);

-- ===== FamiliasEstr  (filas: 31) =====
CREATE TABLE [FamiliasEstr] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [AccesorioSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [BibliotecaDibSN] BOOLEAN NOT NULL,
  [EscaparateSN] BOOLEAN NOT NULL,
  [OrdenEsc] SMALLINT,
  [FamCompFsn] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(80),
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== FamiliasGrupos  (filas: 93) =====
CREATE TABLE [FamiliasGrupos] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Codigo] NVARCHAR(5) NOT NULL,
  [ValidoAsocSN] BOOLEAN NOT NULL,
  [Tipo] NVARCHAR(5),
  [DependeDe] NVARCHAR(255),
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([Familia], [Codigo])
);

-- ===== FamiliasGruposAsoc  (filas: 58) =====
CREATE TABLE [FamiliasGruposAsoc] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Codigo] NVARCHAR(5) NOT NULL,
  [ValidoAsocSN] BOOLEAN NOT NULL,
  [Tipo] NVARCHAR(5),
  [Componentes] NVARCHAR(255),
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([Familia], [Codigo])
);

-- ===== FamiliasProv  (filas: 0) =====
CREATE TABLE [FamiliasProv] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Proveedor])
);

-- ===== FamiliasTarifas  (filas: 2) =====
CREATE TABLE [FamiliasTarifas] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10),
  [Tarifa] NVARCHAR(5) NOT NULL,
  [BaseCosteTar] NVARCHAR(5),
  [BaseTarifa] NVARCHAR(5),
  [BaseProveedor] NVARCHAR(10),
  [BaseCosteBruto] REAL,
  [BaseIncrPesoPorc] REAL,
  [RestarDtoSN] BOOLEAN NOT NULL,
  [CalculoAutoSN] BOOLEAN NOT NULL,
  [Margen] REAL,
  [TipoMargenCV] NVARCHAR(1),
  [IncrementoFijo] REAL,
  [BaseCosteMedCalcDias] SMALLINT,
  [BaseCoste] NVARCHAR(6),
  [BaseCosteMedPeriodo] NVARCHAR(3),
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Subfamilia], [Acabado], [Tarifa])
);

-- ===== FasesEntrega  (filas: 0) =====
CREATE TABLE [FasesEntrega] (
  [codigo] NVARCHAR(3),
  [Nombre] NVARCHAR(30),
  [PrefijoDescr] NVARCHAR(40),
  PRIMARY KEY ([codigo])
);

-- ===== Festivos  (filas: 0) =====
CREATE TABLE [Festivos] (
  [nLinea] INTEGER NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [FechaInicio] DATE,
  [FechaFin] DATE,
  [Observaciones] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== ForfaitCDocConfig  (filas: 0) =====
CREATE TABLE [ForfaitCDocConfig] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [ArticuloForfait] NVARCHAR(15),
  [CantidadMinima] REAL,
  [MetrajeMinimo] REAL,
  [FamiliaArt] NVARCHAR(10) NOT NULL,
  [SubfamiliaArt] NVARCHAR(10),
  [nLinea] INTEGER NOT NULL,
  [LstAcabados] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== ForfaitVDocConfig  (filas: 0) =====
CREATE TABLE [ForfaitVDocConfig] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Aplicacion] NVARCHAR(7),
  [Prioridad] SMALLINT,
  [ArticuloForfait] NVARCHAR(15),
  [CantidadMinima] REAL,
  [MetrajeMinimo] REAL,
  [FamiliaArt] NVARCHAR(10) NOT NULL,
  [SubfamiliaArt] NVARCHAR(10),
  [nLinea] INTEGER NOT NULL,
  [LstAcabados] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== FormasPago  (filas: 2) =====
CREATE TABLE [FormasPago] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Dias1] SMALLINT,
  [Dias2] SMALLINT,
  [Dias3] SMALLINT,
  [Dias4] SMALLINT,
  [Dias5] SMALLINT,
  [Porcentaje1] REAL,
  [Porcentaje2] REAL,
  [Porcentaje3] REAL,
  [Porcentaje4] REAL,
  [Porcentaje5] REAL,
  [NoInformesSN] BOOLEAN NOT NULL,
  [ForzarSerieBsn] BOOLEAN NOT NULL,
  [NVdias1] SMALLINT,
  [NVnumEfectos] SMALLINT,
  [NVnumDias] SMALLINT,
  [Descripcion] NVARCHAR(80),
  [VtoDiasNaturalesSN] BOOLEAN NOT NULL,
  [FormaPagoEscaladaSN] BOOLEAN NOT NULL,
  [DiasVtoMax] SMALLINT,
  [CodigoContabilidad] NVARCHAR(5),
  [CodigoERPexterno] NVARCHAR(20),
  PRIMARY KEY ([Codigo])
);

-- ===== FormasPagoEscalada  (filas: 0) =====
CREATE TABLE [FormasPagoEscalada] (
  [nLinea] INTEGER NOT NULL,
  [FormaPago] NVARCHAR(5) NOT NULL,
  [Desde] DOUBLE,
  [Hasta] DOUBLE,
  [FormaPagoResultado] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== FormulasDescripcion  (filas: 6) =====
CREATE TABLE [FormulasDescripcion] (
  [nLinea] INTEGER NOT NULL,
  [Tipo] NVARCHAR(15),
  [Idiomas] NVARCHAR,
  [Prioridad] SMALLINT,
  [Formula] NVARCHAR,
  [FamiliasArticulos] NVARCHAR,
  [FamiliasEstructuras] NVARCHAR,
  [ListaArticulos] NVARCHAR,
  [ListaEstructuras] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== gaBDcache  (filas: 38) =====
CREATE TABLE [gaBDcache] (
  [Tabla] NVARCHAR(60) NOT NULL,
  [IdCambios] INTEGER,
  PRIMARY KEY ([Tabla])
);

-- ===== gaBusqRapidaConf  (filas: 1) =====
CREATE TABLE [gaBusqRapidaConf] (
  [Usuario] NVARCHAR(30) NOT NULL,
  [VisibleSN] BOOLEAN NOT NULL,
  [ClientesSN] BOOLEAN NOT NULL,
  [ProveedoresSN] BOOLEAN NOT NULL,
  [TrabajadoresSN] BOOLEAN NOT NULL,
  [CDocSN] BOOLEAN NOT NULL,
  [CPedidosSN] BOOLEAN NOT NULL,
  [CAlbaranesSN] BOOLEAN NOT NULL,
  [CFacturasSN] BOOLEAN NOT NULL,
  [VDocSN] BOOLEAN NOT NULL,
  [VPresupuestosSN] BOOLEAN NOT NULL,
  [VPedidosSN] BOOLEAN NOT NULL,
  [VAlbaranesSN] BOOLEAN NOT NULL,
  [VFacturasSN] BOOLEAN NOT NULL,
  [CBusqNombreProvSN] BOOLEAN NOT NULL,
  [VBusqNombreCliSN] BOOLEAN NOT NULL
);

-- ===== gaConfig  (filas: 812) =====
CREATE TABLE [gaConfig] (
  [NombreDato] NVARCHAR(60) NOT NULL,
  [TipoDato] SMALLINT,
  [AnchoDato] SMALLINT,
  [Valor] NVARCHAR(255),
  [ValorMemo] NVARCHAR,
  PRIMARY KEY ([NombreDato])
);

-- ===== gaConfigProdDoc  (filas: 37) =====
CREATE TABLE [gaConfigProdDoc] (
  [Configuracion] NVARCHAR(100) NOT NULL,
  [NombreDato] NVARCHAR(60) NOT NULL,
  [Valor] NVARCHAR(255)
);

-- ===== gaConfigUsuario  (filas: 22) =====
CREATE TABLE [gaConfigUsuario] (
  [ComputerName] NVARCHAR(30) NOT NULL,
  [Usuario] NVARCHAR(30) NOT NULL,
  [NombreDato] NVARCHAR(60) NOT NULL,
  [Valor] NVARCHAR(255),
  PRIMARY KEY ([ComputerName], [Usuario], [NombreDato])
);

-- ===== gaDocGruposUsr  (filas: 0) =====
CREATE TABLE [gaDocGruposUsr] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [DeshabilitadoSN] BOOLEAN NOT NULL,
  [PerExplorarCarpetasSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== gaDocGruposUsrMiembros  (filas: 0) =====
CREATE TABLE [gaDocGruposUsrMiembros] (
  [GrupoUsr] NVARCHAR(5) NOT NULL,
  [Usuario] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([GrupoUsr], [Usuario])
);

-- ===== gaDocPermisosCarpeta  (filas: 0) =====
CREATE TABLE [gaDocPermisosCarpeta] (
  [nLinea] INTEGER NOT NULL,
  [GrupoUsr] NVARCHAR(5) NOT NULL,
  [CarpetaFichRelativa] NVARCHAR(255) NOT NULL,
  [PerAccesoSN] BOOLEAN NOT NULL,
  [PerModificarSN] BOOLEAN NOT NULL,
  [PerEliminarSN] BOOLEAN NOT NULL,
  [PerEnviarMailSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== gaDocPermisosTipoDoc  (filas: 0) =====
CREATE TABLE [gaDocPermisosTipoDoc] (
  [nLinea] INTEGER NOT NULL,
  [GrupoUsr] NVARCHAR(5) NOT NULL,
  [TipoDoc] NVARCHAR(10) NOT NULL,
  [PerAccesoSN] BOOLEAN NOT NULL,
  [PerModificarSN] BOOLEAN NOT NULL,
  [PerEliminarSN] BOOLEAN NOT NULL,
  [PerEnviarMailSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== gaDocTmpEtiquetas  (filas: 0) =====
CREATE TABLE [gaDocTmpEtiquetas] (
  [nLinea] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [tipoDocVin] NVARCHAR(10),
  [Codigo1] NVARCHAR(20),
  [Codigo2] NVARCHAR(20),
  [NumeroPagina] SMALLINT,
  [TotalPaginas] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== gaDocVinculados  (filas: 0) =====
CREATE TABLE [gaDocVinculados] (
  [nLinea] INTEGER NOT NULL,
  [TipoObj] NVARCHAR(6) NOT NULL,
  [idObj_campo1] NVARCHAR(20) NOT NULL,
  [idObj_campo2] NVARCHAR(20) NOT NULL,
  [Descripcion] NVARCHAR(255),
  [Fecha] DATE,
  [Estado] NVARCHAR(10),
  [Seccion] NVARCHAR(30),
  [fechaDoc] DATE,
  [importaTipo_CLI_PROV] NVARCHAR(4),
  [importaCliente] NVARCHAR(10),
  [importaProveedor] NVARCHAR(10),
  [fechaImporta] DATE,
  [usuarioImporta] NVARCHAR(30),
  [usuarioArchiva] NVARCHAR(30),
  [archivoCodBarSN] BOOLEAN NOT NULL,
  [archivoDocAppSN] BOOLEAN NOT NULL,
  [CarpetaFichRelativa] NVARCHAR(255),
  [NombreFich] NVARCHAR(255),
  [TipoDocVin] NVARCHAR(10),
  [PWeb_SubidoSN] BOOLEAN NOT NULL,
  [PWeb_NombreBlob] NVARCHAR(40),
  [PWeb_Uri] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== gaDocVinculadosRegistro  (filas: 0) =====
CREATE TABLE [gaDocVinculadosRegistro] (
  [nLinea] INTEGER NOT NULL,
  [nLineaDoc] INTEGER,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  [RegAccion] NVARCHAR(15),
  [TipoObj] NVARCHAR(6),
  [TipoDocVin] NVARCHAR(10),
  [CarpetaFichRelativa] NVARCHAR(255),
  [NombreFich] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== gaDocVinculadosSecciones  (filas: 0) =====
CREATE TABLE [gaDocVinculadosSecciones] (
  [Nombre] NVARCHAR(30) NOT NULL,
  [UsuarioNotDocImp] NVARCHAR(30),
  PRIMARY KEY ([Nombre])
);

-- ===== gaDocVinculadosTipos  (filas: 0) =====
CREATE TABLE [gaDocVinculadosTipos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Extension] NVARCHAR(10),
  [SubcarpetaImportacion] NVARCHAR(100),
  [SubcarpetaArchivo] NVARCHAR(100),
  [TipoDocProductor] NVARCHAR(6),
  [EtiquetasSN] BOOLEAN NOT NULL,
  [SubcarpetaCliProvSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== gaEtiquetas  (filas: 1) =====
CREATE TABLE [gaEtiquetas] (
  [Codigo] NVARCHAR(5),
  [Descripcion] NVARCHAR(50),
  [papelAncho] REAL,
  [papelAlto] REAL,
  [papelIgnoraConfigSN] BOOLEAN NOT NULL,
  [etiqAncho] REAL,
  [etiqAlto] REAL,
  [margenSup] REAL,
  [margenIz] REAL,
  [etiqSep] REAL,
  [impPuerto] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== gaEtiquetasCampos  (filas: 0) =====
CREATE TABLE [gaEtiquetasCampos] (
  [nLinea] INTEGER NOT NULL,
  [codEtiq] NVARCHAR(5),
  [Nombre] NVARCHAR(30),
  [Tipo] SMALLINT,
  [nEntera] SMALLINT,
  [nDec] SMALLINT,
  [x] REAL,
  [y] REAL,
  [tipoLetra] NVARCHAR(100),
  [tamLetra] SMALLINT,
  [Texto] NVARCHAR(40),
  [colorLetra] INTEGER,
  [nLineas] SMALLINT,
  [prefijo] NVARCHAR(30),
  [sufijo] NVARCHAR(30),
  [CampoUsuarioSN] BOOLEAN NOT NULL,
  [CampoUsuarioNumero] SMALLINT,
  [CampoUsuarioSQL] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== gaFormElementoBloqueado  (filas: 0) =====
CREATE TABLE [gaFormElementoBloqueado] (
  [Tabla] NVARCHAR(50) NOT NULL,
  [Id1] NVARCHAR(80) NOT NULL,
  [Id2] NVARCHAR(20) NOT NULL,
  [IdUsuarioSesion] GUID NOT NULL,
  [FechaBloqueo] DATE,
  [Usuario] NVARCHAR(40) NOT NULL,
  [NombreEquipo] NVARCHAR(30),
  PRIMARY KEY ([Tabla], [Id1], [Id2], [IdUsuarioSesion])
);

-- ===== gaFormPosicionVentana  (filas: 95) =====
CREATE TABLE [gaFormPosicionVentana] (
  [idForm] NVARCHAR(50) NOT NULL,
  [usuario] NVARCHAR(40) NOT NULL,
  [Height] INTEGER,
  [Width] INTEGER,
  [WindowState] SMALLINT,
  [PosLeft] INTEGER,
  [PosTop] INTEGER,
  [ComputerName] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([idForm], [ComputerName], [usuario])
);

-- ===== gaGrdListaCond  (filas: 0) =====
CREATE TABLE [gaGrdListaCond] (
  [id] INTEGER NOT NULL,
  [IdPersoUsr] SMALLINT,
  [Orden] SMALLINT,
  [Campo] NVARCHAR(50),
  [Criterio] NVARCHAR(20),
  [Valor1] NVARCHAR(50),
  [Valor2] NVARCHAR(50),
  [ColorLetra] INTEGER,
  [ColorCelda] INTEGER,
  [NegritaSN] BOOLEAN NOT NULL,
  [CursivaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([id])
);

-- ===== gaGrdListaConfig  (filas: 28) =====
CREATE TABLE [gaGrdListaConfig] (
  [idPersoUsr] SMALLINT NOT NULL,
  [idUsuario] NVARCHAR(30),
  [NombreConf] NVARCHAR(50),
  [CaptionGrid] NVARCHAR(100),
  [MostrarCaptionSN] BOOLEAN NOT NULL,
  [TipoLetraCaption] NVARCHAR(100),
  [TamLetraCaption] SMALLINT,
  [FontBoldCaption] BOOLEAN NOT NULL,
  [TipoLetra] NVARCHAR(100),
  [TamLetra] SMALLINT,
  [FontBold] BOOLEAN NOT NULL,
  [ColorLetra] INTEGER,
  [ColorFilaAltSN] BOOLEAN NOT NULL,
  [ColorFilaAlt] INTEGER,
  [FilterBarSN] BOOLEAN NOT NULL,
  [ViewBarSN] BOOLEAN NOT NULL,
  [CamposOrdenados] NVARCHAR(200),
  PRIMARY KEY ([idPersoUsr])
);

-- ===== gaGrdListaConfigCampo  (filas: 740) =====
CREATE TABLE [gaGrdListaConfigCampo] (
  [idPersoUsr] SMALLINT NOT NULL,
  [Campo] NVARCHAR(50) NOT NULL,
  [idUsuario] NVARCHAR(30),
  [Titulo] NVARCHAR(50),
  [Orden] SMALLINT,
  [MostrarSN] BOOLEAN NOT NULL,
  [TamOriginal] REAL,
  [Ancho] REAL,
  [TipoLetra] NVARCHAR(100),
  [TamLetra] SMALLINT,
  [FontBold] BOOLEAN NOT NULL,
  [FontCursiva] BOOLEAN NOT NULL,
  [ColorLetra] INTEGER,
  [Justificacion] NVARCHAR(1),
  [CampoUsuarioSN] BOOLEAN NOT NULL,
  [CampoUsuarioNumero] SMALLINT,
  [CampoUsuarioSQL] NVARCHAR,
  [OrdenadoSN] BOOLEAN NOT NULL,
  [Orden_ASC_DESC] NVARCHAR(4),
  [TablaOrigen] NVARCHAR(50),
  PRIMARY KEY ([idPersoUsr], [Campo])
);

-- ===== gaGrdVistaConfig  (filas: 0) =====
CREATE TABLE [gaGrdVistaConfig] (
  [IdVista] SMALLINT NOT NULL,
  [IdUsuario] NVARCHAR(30),
  [NombreConf] NVARCHAR(50),
  [NombreVista] NVARCHAR(100),
  [PublicaSN] BOOLEAN NOT NULL,
  [CaptionGrid] NVARCHAR(100),
  [TipoLetra] NVARCHAR(100),
  [TamLetra] SMALLINT,
  [FontBold] BOOLEAN NOT NULL,
  [ColorLetra] INTEGER,
  [ColorFilaAltSN] BOOLEAN NOT NULL,
  [ColorFilaAlt] INTEGER,
  [FilterBarSN] BOOLEAN NOT NULL,
  [CamposOrdenados] NVARCHAR(200),
  [VistaDefSN] BOOLEAN NOT NULL,
  [Filtro] NVARCHAR(255),
  PRIMARY KEY ([IdVista])
);

-- ===== gaGrdVistaConfigCampo  (filas: 0) =====
CREATE TABLE [gaGrdVistaConfigCampo] (
  [IdVista] SMALLINT NOT NULL,
  [Campo] NVARCHAR(50) NOT NULL,
  [Titulo] NVARCHAR(50),
  [Orden] SMALLINT,
  [VisibleSN] BOOLEAN NOT NULL,
  [Ancho] REAL,
  [TipoLetra] NVARCHAR(100),
  [TamLetra] SMALLINT,
  [FontBold] BOOLEAN NOT NULL,
  [FontCursiva] BOOLEAN NOT NULL,
  [ColorLetra] INTEGER,
  [Justificacion] NVARCHAR(1),
  [Filtro] NVARCHAR(100),
  [CampoUsuarioSN] BOOLEAN NOT NULL,
  [CampoUsuarioNumero] SMALLINT,
  [CampoUsuarioSQL] NVARCHAR,
  [OrdenadoSN] BOOLEAN NOT NULL,
  [Orden_ASC_DESC] NVARCHAR(4),
  [TablaOrigen] NVARCHAR(50),
  PRIMARY KEY ([IdVista], [Campo])
);

-- ===== gaGridDescConfig  (filas: 28) =====
CREATE TABLE [gaGridDescConfig] (
  [IDgrid] NVARCHAR(100) NOT NULL,
  [idUsuario] NVARCHAR(30) NOT NULL,
  [NombreConf] NVARCHAR(100),
  [CaptionGrid] NVARCHAR(150),
  [MostrarCaptionSN] BOOLEAN NOT NULL,
  [TipoLetraCaption] NVARCHAR(100),
  [TamLetraCaption] SMALLINT,
  [FontBoldCaption] BOOLEAN NOT NULL,
  [TipoLetra] NVARCHAR(100),
  [TamLetra] SMALLINT,
  [FontBold] BOOLEAN NOT NULL,
  [ColorLetra] INTEGER,
  [ColorFilaAltSN] BOOLEAN NOT NULL,
  [ColorFilaAlt] INTEGER,
  [AnchoCamposAutoSN] BOOLEAN NOT NULL,
  [AltoFila] SMALLINT,
  [AplicarColorFondoSN] BOOLEAN NOT NULL,
  [ColorFondo] INTEGER,
  [CamposOrdenados] NVARCHAR(200),
  PRIMARY KEY ([IDgrid], [idUsuario])
);

-- ===== gaGridDescConfigCampos  (filas: 737) =====
CREATE TABLE [gaGridDescConfigCampos] (
  [IDgrid] NVARCHAR(100) NOT NULL,
  [idUsuario] NVARCHAR(30) NOT NULL,
  [Campo] NVARCHAR(50) NOT NULL,
  [Orden] SMALLINT,
  [Titulo] NVARCHAR(50),
  [MostrarSN] BOOLEAN NOT NULL,
  [TamOriginal] REAL,
  [Ancho] REAL,
  [Justificacion] NVARCHAR(1),
  [TipoLetra] NVARCHAR(100),
  [TamLetra] SMALLINT,
  [FontBold] BOOLEAN NOT NULL,
  [FontCursiva] BOOLEAN NOT NULL,
  [ColorLetra] INTEGER,
  [CampoUsuarioSN] BOOLEAN NOT NULL,
  [CampoUsuarioNumero] SMALLINT,
  [CampoUsuarioSQL] NVARCHAR,
  [AplicarColorLetraSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([IDgrid], [idUsuario], [Campo])
);

-- ===== gaGridDescConfigCamposCondicional  (filas: 0) =====
CREATE TABLE [gaGridDescConfigCamposCondicional] (
  [IdGrid] NVARCHAR(100) NOT NULL,
  [IdCond] GUID NOT NULL,
  [IdUsuario] NVARCHAR(30) NOT NULL,
  [Campo] NVARCHAR(50) NOT NULL,
  [Criterio] NVARCHAR(20),
  [Valor1] NVARCHAR(50),
  [Valor2] NVARCHAR(50),
  [ColorLetra] INTEGER,
  [ColorFondo] INTEGER,
  [NegritaSN] BOOLEAN NOT NULL,
  [CursivaSN] BOOLEAN NOT NULL,
  [AplicarColorLetraSN] BOOLEAN NOT NULL,
  [AplicarColorFondoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([IdCond])
);

-- ===== gaNotCliPlantillas  (filas: 4) =====
CREATE TABLE [gaNotCliPlantillas] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [TextoMail] NVARCHAR,
  [TextoSMS] NVARCHAR,
  [AsuntoMail] NVARCHAR(255),
  [AsuntoSMS] NVARCHAR(255),
  [Idioma] NVARCHAR(3) NOT NULL,
  PRIMARY KEY ([Codigo], [Idioma])
);

-- ===== gaNotCliVariablesUsuario  (filas: 0) =====
CREATE TABLE [gaNotCliVariablesUsuario] (
  [Variable] NVARCHAR(50) NOT NULL,
  [SQL] NVARCHAR,
  PRIMARY KEY ([Variable])
);

-- ===== gaNotCliVEfectos  (filas: 0) =====
CREATE TABLE [gaNotCliVEfectos] (
  [nLinea] INTEGER NOT NULL,
  [lstTipoRemesa] NVARCHAR(255),
  [NumeroDiasPrevios] SMALLINT,
  [plantillaNotificacion] NVARCHAR(3),
  PRIMARY KEY ([nLinea])
);

-- ===== gaNotEvento  (filas: 0) =====
CREATE TABLE [gaNotEvento] (
  [nLinea] INTEGER NOT NULL,
  [cond_lstTablasBD] NVARCHAR(255),
  [cond_lstClientes] NVARCHAR(255),
  [cond_lstProveedores] NVARCHAR(255),
  [cond_ImporteDesde] REAL,
  [cond_ImporteHasta] REAL,
  [accion_Tipo] NVARCHAR(10),
  [accion_lstUsuarios] NVARCHAR(255),
  [cond_lstZonas] NVARCHAR(255),
  [cond_lstTipoInc] NVARCHAR(255),
  [cond_GravedadInc] NVARCHAR(10),
  [cond_lstRepresentantes] NVARCHAR(255),
  [cond_lstDelegaciones] NVARCHAR(100),
  [TipoEvento] NVARCHAR(40),
  [accion_NotificaRepresentanteSN] BOOLEAN NOT NULL,
  [cond_lstUsuarios] NVARCHAR(255),
  [accion_NotificaUsuarioSN] BOOLEAN NOT NULL,
  [cond_esNuevoElemento] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== gaNotEventoRpt  (filas: 0) =====
CREATE TABLE [gaNotEventoRpt] (
  [idEvento] INTEGER NOT NULL,
  [Tabla] NVARCHAR(15) NOT NULL,
  [Informe] NVARCHAR(20),
  [Report] NVARCHAR(40),
  [Impresora] NVARCHAR(100),
  PRIMARY KEY ([idEvento], [Tabla])
);

-- ===== gaNotPush  (filas: 0) =====
CREATE TABLE [gaNotPush] (
  [Fecha] DATE,
  [IdNotificacion] GUID NOT NULL,
  [Cliente] NVARCHAR(10),
  [NotificationType] NVARCHAR(30),
  [NotName] NVARCHAR(100),
  [NotTitle] NVARCHAR(100),
  [NotBody] NVARCHAR,
  [DocNumber] NVARCHAR(20),
  [AdditionalInformation] NVARCHAR(100),
  [AppCenterSent] BOOLEAN NOT NULL,
  [AppCenterNotificationId] NVARCHAR(100),
  PRIMARY KEY ([IdNotificacion])
);

-- ===== gaNotRegistroEventos  (filas: 0) =====
CREATE TABLE [gaNotRegistroEventos] (
  [nLinea] INTEGER NOT NULL,
  [usuarioApp] NVARCHAR(30),
  [fecha] DATE,
  [hora] DATE,
  [tablaBD] NVARCHAR(40),
  [cod1] NVARCHAR(20),
  [cod2] NVARCHAR(20),
  [clienteProveedor] NVARCHAR(10),
  [importe] REAL,
  [sResultadoEnvio] NVARCHAR(20),
  [TipoEvento] NVARCHAR(40),
  PRIMARY KEY ([nLinea])
);

-- ===== gaNotUsuarios  (filas: 0) =====
CREATE TABLE [gaNotUsuarios] (
  [Nombre] NVARCHAR(30) NOT NULL,
  [Fax] NVARCHAR(20),
  [autorizadorVDocSN] BOOLEAN NOT NULL,
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Nombre])
);

-- ===== gaRegistroAccionBBDD  (filas: 39903) =====
CREATE TABLE [gaRegistroAccionBBDD] (
  [id] INTEGER NOT NULL,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  [Accion] NVARCHAR(20),
  [Tabla] NVARCHAR(40),
  [ComputerName] NVARCHAR(30),
  [Observaciones] NVARCHAR,
  [Id1] NVARCHAR(80),
  [Id2] NVARCHAR(80),
  [UsuarioSistema] NVARCHAR(50),
  [TScomputerName] NVARCHAR(30),
  [TSusuarioSistema] NVARCHAR(50),
  [TSip] NVARCHAR(15),
  PRIMARY KEY ([id])
);

-- ===== gaRegistroAccionBBDDweb  (filas: 0) =====
CREATE TABLE [gaRegistroAccionBBDDweb] (
  [Accion] NVARCHAR(20),
  [IdRegistro] GUID NOT NULL,
  [ComputerName] NVARCHAR(30),
  [Fecha] DATE,
  [Id1] NVARCHAR(80),
  [Id2] NVARCHAR(80),
  [Observaciones] NVARCHAR,
  [Tabla] NVARCHAR(40),
  [UsuarioSistema] NVARCHAR(50),
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([IdRegistro])
);

-- ===== gaRegistroEnvioMail  (filas: 0) =====
CREATE TABLE [gaRegistroEnvioMail] (
  [nLinea] INTEGER NOT NULL,
  [UsuarioApp] NVARCHAR(30),
  [Fecha] DATE,
  [Hora] DATE,
  [Remitente] NVARCHAR(50),
  [RemitenteMail] NVARCHAR(50),
  [EMail] NVARCHAR(255),
  [Asunto] NVARCHAR(255),
  [Mensaje] NVARCHAR,
  [ResultadoEnvio] NVARCHAR(20),
  [OrigenEnvio] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== gaRptEmitirInformes  (filas: 0) =====
CREATE TABLE [gaRptEmitirInformes] (
  [Carpeta] NVARCHAR(255) NOT NULL,
  [Report] NVARCHAR(200) NOT NULL,
  [Descripcion] NVARCHAR(255) NOT NULL,
  PRIMARY KEY ([Carpeta], [Report])
);

-- ===== gaRptImpresora  (filas: 0) =====
CREATE TABLE [gaRptImpresora] (
  [Report] NVARCHAR(40) NOT NULL,
  [Usuario] NVARCHAR(30) NOT NULL,
  [Destino] NVARCHAR(15) NOT NULL,
  [Prioridad] SMALLINT,
  [TamPapelImpresoraSN] BOOLEAN NOT NULL,
  [Impresora] NVARCHAR(255),
  PRIMARY KEY ([Report], [Usuario], [Destino])
);

-- ===== gaRptInf  (filas: 2) =====
CREATE TABLE [gaRptInf] (
  [IdInforme] NVARCHAR(40) NOT NULL,
  [NombreInf] NVARCHAR(200),
  [Destino] NVARCHAR(1),
  [nCopias] SMALLINT,
  [PrintCabSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([IdInforme], [Usuario])
);

-- ===== gaRptMod  (filas: 15) =====
CREATE TABLE [gaRptMod] (
  [IdInforme] NVARCHAR(40) NOT NULL,
  [NombreRpt] NVARCHAR(200) NOT NULL,
  [DescRpt] NVARCHAR(100),
  [AdjuntarFicheros] BOOLEAN NOT NULL,
  PRIMARY KEY ([IdInforme], [NombreRpt])
);

-- ===== gaRptModUsr  (filas: 2) =====
CREATE TABLE [gaRptModUsr] (
  [IdInforme] NVARCHAR(40) NOT NULL,
  [NombreRpt] NVARCHAR(200) NOT NULL,
  [Usuario] NVARCHAR(40) NOT NULL,
  [PredeterminadoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([IdInforme], [NombreRpt], [Usuario])
);

-- ===== gaSemaforo  (filas: 1) =====
CREATE TABLE [gaSemaforo] (
  [nombreSem] NVARCHAR(60) NOT NULL,
  [tiempoBloqueo] INTEGER,
  PRIMARY KEY ([nombreSem])
);

-- ===== GastosGen  (filas: 4) =====
CREATE TABLE [GastosGen] (
  [id] INTEGER NOT NULL,
  [Descripcion] NVARCHAR(30),
  [ArticuloAsoc] NVARCHAR(15),
  [AplicarA] NVARCHAR(3),
  [FechaHoraAct] DATE,
  PRIMARY KEY ([id])
);

-- ===== Horarios  (filas: 0) =====
CREATE TABLE [Horarios] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(30),
  [Tipo_CONTINUO_PARTIDO] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== HorariosLin  (filas: 0) =====
CREATE TABLE [HorariosLin] (
  [Horario] NVARCHAR(2) NOT NULL,
  [DiaSemana] NVARCHAR(1) NOT NULL,
  [ManyanaTardeMT] NVARCHAR(1) NOT NULL,
  [HoraEntrada] DATE,
  [HoraSalida] DATE,
  [TodasHorasExtraSN] BOOLEAN NOT NULL,
  [PlanProdPorcentaje] SMALLINT,
  PRIMARY KEY ([Horario], [DiaSemana], [ManyanaTardeMT])
);

-- ===== Horas  (filas: 0) =====
CREATE TABLE [Horas] (
  [id] INTEGER NOT NULL,
  [Fecha] DATE,
  [Trabajador] NVARCHAR(5),
  [Concepto] NVARCHAR(5),
  [HoraIni] DATE,
  [HoraFin] DATE,
  [nOF] NVARCHAR(6),
  [nLinOF] INTEGER,
  [CdadFabr] REAL,
  [Horas] REAL,
  [nObGasto] NVARCHAR(6),
  [UTTfichaInicioSN] BOOLEAN NOT NULL,
  [UTTfichaFinSN] BOOLEAN NOT NULL,
  [Obra] NVARCHAR(10),
  [Trabajo] NVARCHAR(120),
  PRIMARY KEY ([id])
);

-- ===== IdDescripciones  (filas: 0) =====
CREATE TABLE [IdDescripciones] (
  [TipoEl] NVARCHAR(6) NOT NULL,
  [CodigoEl] NVARCHAR(15),
  [Idioma] NVARCHAR(3),
  [Descripcion] NVARCHAR,
  [CodigoEl2] NVARCHAR(15) NOT NULL,
  [FechaHoraAct] DATE,
  PRIMARY KEY ([TipoEl], [CodigoEl], [CodigoEl2], [Idioma])
);

-- ===== Idiomas  (filas: 1) =====
CREATE TABLE [Idiomas] (
  [Codigo] NVARCHAR(3),
  [Descripcion] NVARCHAR(40),
  [DescrStdSN] BOOLEAN NOT NULL,
  [PredetSN] BOOLEAN NOT NULL,
  [CodigoISO] NVARCHAR(3),
  [CodigoFacturaE] NVARCHAR(3),
  PRIMARY KEY ([Codigo])
);

-- ===== ImpexDatos  (filas: 2) =====
CREATE TABLE [ImpexDatos] (
  [Impex] NVARCHAR(15) NOT NULL,
  [CampoTransfConfigSeries] BOOLEAN NOT NULL,
  [CampoGenEstr] BOOLEAN NOT NULL,
  [CampoGenDib] BOOLEAN NOT NULL,
  [CampoGenDtos] BOOLEAN NOT NULL,
  [CampoGenHerr] BOOLEAN NOT NULL,
  [CampoNoDis] BOOLEAN NOT NULL,
  [CampoNoFamEstr] BOOLEAN NOT NULL,
  [CampoForzarMO] BOOLEAN NOT NULL,
  [CampoConfigMec] BOOLEAN NOT NULL,
  [CampoFasesEntrega] BOOLEAN NOT NULL,
  [CampoForzarDeUsuario] BOOLEAN NOT NULL,
  [CampoSobDib] BOOLEAN NOT NULL,
  [CampoGenInfoAccDis] BOOLEAN NOT NULL,
  [CampoFiltroPerfilPrincipal] BOOLEAN NOT NULL,
  [CampoFiltroPerfilAd] BOOLEAN NOT NULL,
  [CampoFiltroCotasDtos] BOOLEAN NOT NULL,
  [CampoFiltroHerraje] BOOLEAN NOT NULL,
  [CampoFiltroAsocMan] BOOLEAN NOT NULL,
  [CampoFiltroApertura] BOOLEAN NOT NULL,
  [CampoFiltroTabAcris] BOOLEAN NOT NULL,
  [CampoFiltroEstrNoDis] BOOLEAN NOT NULL,
  [CampoFiltroEstrIdioma] BOOLEAN NOT NULL,
  [CampoDibujos] BOOLEAN NOT NULL,
  [CampoEstrDisAuto] BOOLEAN NOT NULL,
  [CampoEstrNoDis] BOOLEAN NOT NULL
);

-- ===== ImpexDatosTablas  (filas: 0) =====
CREATE TABLE [ImpexDatosTablas] (
  [Impex] NVARCHAR(15) NOT NULL,
  [Tipo] NVARCHAR(8) NOT NULL,
  [Tabla] NVARCHAR(100) NOT NULL,
  [Seleccionada] BOOLEAN NOT NULL,
  PRIMARY KEY ([Impex], [Tipo], [Tabla])
);

-- ===== Impuestos  (filas: 0) =====
CREATE TABLE [Impuestos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(80) NOT NULL,
  [Orden] SMALLINT,
  [IncluidoEnPVPSN] BOOLEAN NOT NULL,
  [TipoCalculoSiguiente] NVARCHAR(20),
  [BaseCalculo] NVARCHAR(20),
  [BaseCalculoOtroImpuesto] NVARCHAR(10),
  [IgnoraNoAplicableSN] BOOLEAN NOT NULL,
  [BaseCalculoFormula] NVARCHAR(255),
  [CuotaFormula] NVARCHAR(255),
  [NoImputarImpuestoSN] BOOLEAN NOT NULL,
  [SumarImporteTotalVDocSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== ImpuestosCompraCalculo  (filas: 0) =====
CREATE TABLE [ImpuestosCompraCalculo] (
  [Impuesto] NVARCHAR(10) NOT NULL,
  [Orden] SMALLINT,
  [IncluidoEnCosteSN] BOOLEAN NOT NULL,
  [TipoCalculoSiguiente] NVARCHAR(20),
  [BaseCalculo] NVARCHAR(20),
  [BaseCalculoOtroImpuesto] NVARCHAR(10),
  [CalculoPrevio] NVARCHAR(20),
  [CalculoPrevioLstImpuestos] NVARCHAR(255),
  [BaseCalculoFormula] NVARCHAR(255),
  [CuotaFormula] NVARCHAR(255),
  [SumarImporteTotalCDocSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Impuesto])
);

-- ===== ImpuestosCompraConfig  (filas: 0) =====
CREATE TABLE [ImpuestosCompraConfig] (
  [nLinea] INTEGER NOT NULL,
  [Impuesto] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Provincia] NVARCHAR(80),
  [Articulo] NVARCHAR(15),
  [FamiliaArt] NVARCHAR(10),
  [FamiliasArtLista] NVARCHAR,
  [Prioridad] SMALLINT,
  [PorcentajeImpuesto] REAL,
  [BaseReducidaSN] BOOLEAN NOT NULL,
  [PorcentajeImpuestoBaseRed] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  [SubfamiliaArt] NVARCHAR(10),
  [TipoDocumento] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== ImpuestosTipoArticulo  (filas: 0) =====
CREATE TABLE [ImpuestosTipoArticulo] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Codigo])
);

-- ===== ImpuestosVentaConfig  (filas: 0) =====
CREATE TABLE [ImpuestosVentaConfig] (
  [nLinea] INTEGER NOT NULL,
  [Impuesto] NVARCHAR(10) NOT NULL,
  [Cliente] NVARCHAR(10),
  [TipoCliente] NVARCHAR(3),
  [Provincia] NVARCHAR(80),
  [Articulo] NVARCHAR(15),
  [FamiliaArt] NVARCHAR(10),
  [Estructura] NVARCHAR(14),
  [FamiliaEstr] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [PorcentajeImpuesto] REAL,
  [BaseReducidaSN] BOOLEAN NOT NULL,
  [PorcentajeImpuestoBaseRed] REAL,
  [FamiliasArtLista] NVARCHAR,
  [FamiliasEstrLista] NVARCHAR,
  [EstructurasLista] NVARCHAR,
  [TipoArticuloImpuesto] NVARCHAR(3),
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  [SubfamiliaArt] NVARCHAR(10),
  [TipoDocumento] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== LCampos  (filas: 275) =====
CREATE TABLE [LCampos] (
  [id] INTEGER NOT NULL,
  [idListado] INTEGER,
  [Campo] NVARCHAR(40),
  [Titulo] NVARCHAR(40),
  [Orden] SMALLINT,
  [ImprimirSN] BOOLEAN NOT NULL,
  [TamOriginal] REAL,
  [Type] INTEGER,
  [Ancho] REAL,
  [SumarSN] BOOLEAN NOT NULL,
  [TipoLetra] NVARCHAR(60),
  [TamLetra] SMALLINT,
  [Negrita] BOOLEAN NOT NULL,
  [Cursiva] BOOLEAN NOT NULL,
  [Color] INTEGER,
  [ValorLimite] NVARCHAR(30),
  [ColorMenorLim] INTEGER,
  [ColorMayorLim] INTEGER,
  [Entera] SMALLINT,
  [Decimal] SMALLINT,
  [puntosMilesSN] BOOLEAN NOT NULL,
  [Justificacion] NVARCHAR(1),
  [AgruparSN] BOOLEAN NOT NULL,
  [AgruparOrden] NVARCHAR(1),
  [AgruparColor] INTEGER,
  [CriterioLim] NVARCHAR(2),
  [SumarGrpSN] BOOLEAN NOT NULL,
  [TipoFechaHora] NVARCHAR(2),
  [ExpAncho] REAL,
  [ExportarSN] BOOLEAN NOT NULL,
  [ConvertirHHMM] BOOLEAN NOT NULL,
  [PuedeCrecerSN] BOOLEAN NOT NULL,
  [PuedeCrecerNumeroLineas] SMALLINT,
  PRIMARY KEY ([id])
);

-- ===== LineasNegocio  (filas: 1) =====
CREATE TABLE [LineasNegocio] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Codigo])
);

-- ===== LListados  (filas: 10) =====
CREATE TABLE [LListados] (
  [id] INTEGER NOT NULL,
  [idNombre] NVARCHAR(30),
  [Descripcion] NVARCHAR(40),
  [Titulo] NVARCHAR(100),
  [SQL] NVARCHAR,
  [AnchoPapel] REAL,
  [AltoPapel] REAL,
  [Orientacion] NVARCHAR(1),
  [MargenIz] REAL,
  [MargenDe] REAL,
  [MargenSup] REAL,
  [MargenInf] REAL,
  [SepColumnas] REAL,
  [SepLineas] REAL,
  [TituloX] REAL,
  [TituloY] REAL,
  [TituloTam] SMALLINT,
  [EmpresaSN] BOOLEAN NOT NULL,
  [EmpresaX] REAL,
  [EmpresaY] REAL,
  [EmpresaTam] SMALLINT,
  [NumPaginaSN] BOOLEAN NOT NULL,
  [pagX] REAL,
  [pagY] REAL,
  [pagTam] SMALLINT,
  [FechaSN] BOOLEAN NOT NULL,
  [FechaX] REAL,
  [FechaY] REAL,
  [FechaTam] SMALLINT,
  [LetraImpresoraSN] BOOLEAN NOT NULL,
  [TipoLetra] NVARCHAR(60),
  [TamLetra] SMALLINT,
  [Negrita] BOOLEAN NOT NULL,
  [Cursiva] BOOLEAN NOT NULL,
  [TipoSeparador] NVARCHAR(1),
  [SepColor] INTEGER,
  [TitLetra] NVARCHAR(60),
  [TitColor] INTEGER,
  [EmpLetra] NVARCHAR(60),
  [EmpColor] INTEGER,
  [LogoSN] BOOLEAN NOT NULL,
  [LogoAncho] SMALLINT,
  [LogoAlto] SMALLINT,
  [TotGenColor] INTEGER,
  [FiltrosColor] INTEGER,
  [AutoAnchoCmpSN] BOOLEAN NOT NULL,
  [ExpFormato] NVARCHAR(2),
  [ExpSimbDec] NVARCHAR(1),
  [ExpSepMil] NVARCHAR(1),
  [ExpSepCampos] NVARCHAR(5),
  [ExpFormatoFecha] NVARCHAR(20),
  [ExpValorSi] NVARCHAR(20),
  [ExpValorNo] NVARCHAR(20),
  [ExpComillas] NVARCHAR(1),
  [ExpInsertaCabSN] BOOLEAN NOT NULL,
  [ExpCarpeta] NVARCHAR(255),
  [ExpFichero] NVARCHAR(50),
  [ExpAbrirFicheroSN] BOOLEAN NOT NULL,
  [ExpFicheroFormato] NVARCHAR(100),
  [ExpFicheroFormatoFecha] NVARCHAR(20),
  [ExpFicheroFormatoHora] NVARCHAR(20),
  [sqlUsr_consultaOriginal] NVARCHAR,
  [sqlUsr_consultaUsr] NVARCHAR,
  [BloqueoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([id])
);

-- ===== Manufacturas  (filas: 0) =====
CREATE TABLE [Manufacturas] (
  [Codigo] NVARCHAR(10),
  [Descripcion] NVARCHAR(60),
  [TipoMF] NVARCHAR(2),
  [IncrementoMM] REAL,
  [Familia] NVARCHAR(10),
  [TipoIncrSumaMult] NVARCHAR(4),
  [IncrementosClienteSN] BOOLEAN NOT NULL,
  [BarrotilloDiseño] INTEGER,
  [ArticuloAcabadosValidos] NVARCHAR(15),
  [SolicitarRadioFormaSN] BOOLEAN NOT NULL,
  [ValidaGrosorDesde] REAL,
  [ValidaGrosorHasta] REAL,
  [ValidaCamaraDAdesde] REAL,
  [ValidaCamaraDAhasta] REAL,
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== ManufacturasAplic  (filas: 0) =====
CREATE TABLE [ManufacturasAplic] (
  [nLinea] INTEGER NOT NULL,
  [codMF] NVARCHAR(10),
  [TipoApNoAp] NVARCHAR(8),
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ManufacturasIncr  (filas: 0) =====
CREATE TABLE [ManufacturasIncr] (
  [nLinea] INTEGER NOT NULL,
  [codMF] NVARCHAR(10),
  [TipoIncr] NVARCHAR(10),
  [desde] REAL,
  [hasta] REAL,
  [IncrementoPorc] REAL,
  [codManufCond] NVARCHAR(10),
  [codFamCond] NVARCHAR(3),
  [codSubFamCond] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ManufacturasIncrCliente  (filas: 0) =====
CREATE TABLE [ManufacturasIncrCliente] (
  [nLinea] INTEGER NOT NULL,
  [codMF] NVARCHAR(10) NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoIncr] NVARCHAR(10),
  [desde] REAL,
  [hasta] REAL,
  [IncrementoPorc] REAL,
  [codManufCond] NVARCHAR(10),
  [codFamCond] NVARCHAR(3),
  [codSubFamCond] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== ManufacturasLin  (filas: 0) =====
CREATE TABLE [ManufacturasLin] (
  [nLinea] INTEGER NOT NULL,
  [codMF] NVARCHAR(10),
  [GrosorHasta] REAL,
  [Articulo] NVARCHAR(15),
  [IncrementoPVP] REAL,
  [MinimoPVP] REAL,
  [MinimoManuf] REAL,
  [DiametroTaladroDesde] REAL,
  [DiametroTaladroHasta] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== MarcasComerciales  (filas: 0) =====
CREATE TABLE [MarcasComerciales] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Codigo])
);

-- ===== MOCategorias  (filas: 5) =====
CREATE TABLE [MOCategorias] (
  [Codigo] NVARCHAR(5),
  [Descripcion] NVARCHAR(40),
  [BibliotecaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== MOConceptos  (filas: 116) =====
CREATE TABLE [MOConceptos] (
  [Codigo] NVARCHAR(5),
  [CodSerie] NVARCHAR(15),
  [Descripcion] NVARCHAR(200),
  [TiempoFabr] REAL,
  [TiempoPreparacion] REAL,
  [CurMP] REAL,
  [CurReb] REAL,
  [CurCarp2] REAL,
  [CurCarp3] REAL,
  [CurCirc] REAL,
  [CurForma] REAL,
  [AnchoMayorMM] REAL,
  [AnchoTiempo] REAL,
  [AnchoIntervaloMM] REAL,
  [AltoMayorMM] REAL,
  [AltoTiempo] REAL,
  [AltoIntervaloMM] REAL,
  [MOcolocSN] BOOLEAN NOT NULL,
  [Categoria] NVARCHAR(5),
  [Serie] NVARCHAR(4),
  [AsociadoSN] BOOLEAN NOT NULL,
  [FamiliaAsoc] NVARCHAR(10),
  [ComponenteAsoc] NVARCHAR(5),
  [GrupoAsoc] NVARCHAR(3),
  [ArticuloAsoc] NVARCHAR(15),
  [ModuloAsoc] SMALLINT,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [TiempoEnFasesSN] BOOLEAN NOT NULL,
  [AsociadoA] NVARCHAR(255),
  [CodArticulo] NVARCHAR(15) NOT NULL,
  PRIMARY KEY ([Codigo], [CodSerie], [CodArticulo])
);

-- ===== MOConceptosColoc  (filas: 115) =====
CREATE TABLE [MOConceptosColoc] (
  [Codigo] NVARCHAR(5),
  [CodSerie] NVARCHAR(15),
  [TipoColoc] NVARCHAR(3),
  [TiempoColoc] REAL,
  [ColocAplicable] NVARCHAR(2),
  [ColocAnchoMayorMM] REAL,
  [ColocAnchoTiempo] REAL,
  [ColocAnchoIntervaloMM] REAL,
  [ColocAltoMayorMM] REAL,
  [ColocAltoTiempo] REAL,
  [ColocAltoIntervaloMM] REAL,
  [FechaHoraAct] DATE,
  PRIMARY KEY ([Codigo], [CodSerie], [TipoColoc])
);

-- ===== MOFases  (filas: 0) =====
CREATE TABLE [MOFases] (
  [codigo] NVARCHAR(3),
  [Nombre] NVARCHAR(50),
  [PedidoFabrSN] BOOLEAN NOT NULL,
  [GrabaFinalAutoSN] BOOLEAN NOT NULL,
  [ActStockSN] BOOLEAN NOT NULL,
  [SolicitaNBultosSN] BOOLEAN NOT NULL,
  [GeneraAlbaranSN] BOOLEAN NOT NULL,
  [ImprimeAlbaranSN] BOOLEAN NOT NULL,
  [ImprimeEtiqTpteSN] BOOLEAN NOT NULL,
  [ImprimeEtiqCESN] BOOLEAN NOT NULL,
  [FichadoDetalladoSN] BOOLEAN NOT NULL,
  [FichadoDetEstructurasSN] BOOLEAN NOT NULL,
  [FichadoDetDespieceEstrSN] BOOLEAN NOT NULL,
  [FichadoDetArticulosSueltosSN] BOOLEAN NOT NULL,
  [PedidoEnFabricacionIniFaseSN] BOOLEAN NOT NULL,
  [PedidoEnFabricacionFinFaseSN] BOOLEAN NOT NULL,
  [MostrarEnListaPedidosSN] BOOLEAN NOT NULL,
  [FichadoFabricacionSN] BOOLEAN NOT NULL,
  [FicharMismoPedidoVariasVecesSN] BOOLEAN NOT NULL,
  [FichadoDetImprimeEtiqUdSN] BOOLEAN NOT NULL,
  [ImprimeEtiqUdFinFaseSN] BOOLEAN NOT NULL,
  [ImprimeEtiqUdIniFaseSN] BOOLEAN NOT NULL,
  [FichadoDetImprimeEtiqCorteSN] BOOLEAN NOT NULL,
  [RatiosProduccionSN] BOOLEAN NOT NULL,
  [RatiosFicharCantidadArtSN] BOOLEAN NOT NULL,
  [AdmitePedidoFabricadoSN] BOOLEAN NOT NULL,
  [ImprimeEtiqUdNombreReport] NVARCHAR(40),
  [RatiosCalculaCdadArtStdSN] BOOLEAN NOT NULL,
  [Delegaciones] NVARCHAR(150),
  [MostrarCantidadEstrArtSN] BOOLEAN NOT NULL,
  [ImprimeEtiqCorteNombreReport] NVARCHAR(40),
  [RatiosSolicitarCdadUnidadesSN] BOOLEAN NOT NULL,
  [RatiosOcultaCdadArtSN] BOOLEAN NOT NULL,
  [OrdenLista] SMALLINT,
  [FasePausaSN] BOOLEAN NOT NULL,
  [AdmiteFichadoParcialSN] BOOLEAN NOT NULL,
  [RatiosSetCdadFichadaEstandarSN] BOOLEAN NOT NULL,
  [AdmiteEditarFichadoSN] BOOLEAN NOT NULL,
  [PedFabrLstFasesIniciadas] NVARCHAR(255),
  [PedFabrLstFasesFinalizadas] NVARCHAR(255),
  [PedidoFabrIniFaseSN] BOOLEAN NOT NULL,
  [CPFincidenciaTipoProducto] NVARCHAR(30),
  [NoCerrarDatosSN] BOOLEAN NOT NULL,
  [ImprimeReportPersIniFaseSN] BOOLEAN NOT NULL,
  [ImprimeReportPersFinFaseSN] BOOLEAN NOT NULL,
  [ImprimeReportPersNombreRpt] NVARCHAR(50),
  [ImprimeReportPersRecordSelectionFormula] NVARCHAR(100),
  [ImprimeReportPersNombreRpt_OF] NVARCHAR(50),
  [ImprimeReportPersNombreRpt_FA] NVARCHAR(50),
  [IgnoraParaInicioAutoSN] BOOLEAN NOT NULL,
  [FichaDetAutomaticoSN] BOOLEAN NOT NULL,
  [MostrarEnControlRepartoSN] BOOLEAN NOT NULL,
  [FichadoDetTronzadoraMultipleBarrasSN] BOOLEAN NOT NULL,
  [FichadoDetResumenPedidoSN] BOOLEAN NOT NULL,
  [FichadoDetImprimeEtiqCorteUnaEnAgrupadasSN] BOOLEAN NOT NULL,
  [EstadoFabricacion] SMALLINT,
  [FinalizarAnteriorAutoSN] BOOLEAN NOT NULL,
  [FichadoDetPermitirMasCantidadSN] BOOLEAN NOT NULL,
  [ActStockOrdenFabrSN] BOOLEAN NOT NULL,
  [FichadoDetImprimeDocProdCondSN] BOOLEAN NOT NULL,
  [MostrarEnControlRepartoVALBSN] BOOLEAN NOT NULL,
  [ContenedoresSN] BOOLEAN NOT NULL,
  [PermiteTrabajadorEnOtraFaseSN] BOOLEAN NOT NULL,
  [FichadoDetCLASsn] BOOLEAN NOT NULL,
  [FichadoDetConfiguracionPorArticuloSN] BOOLEAN NOT NULL,
  [AsignaDocumentosSN] BOOLEAN NOT NULL,
  [ListaEquiposVisible] NVARCHAR,
  [ListaUsuariosAppVisible] NVARCHAR,
  PRIMARY KEY ([codigo])
);

-- ===== MOFasesEstadosFabricacion  (filas: 1) =====
CREATE TABLE [MOFasesEstadosFabricacion] (
  [NumeroEstado] SMALLINT NOT NULL,
  [Nombre] NVARCHAR(50),
  PRIMARY KEY ([NumeroEstado])
);

-- ===== MOFasesObjetivoPorHora  (filas: 0) =====
CREATE TABLE [MOFasesObjetivoPorHora] (
  [Fase] NVARCHAR(3) NOT NULL,
  [ArticuloObjetivo] NVARCHAR(15) NOT NULL,
  [CantidadPorHora] REAL,
  [FicharCantidadArtSN] BOOLEAN NOT NULL,
  [PorcentajeHorasAsignar] REAL,
  PRIMARY KEY ([Fase], [ArticuloObjetivo])
);

-- ===== MOSubfases  (filas: 0) =====
CREATE TABLE [MOSubfases] (
  [Fase] NVARCHAR(3) NOT NULL,
  [Codigo] NVARCHAR(3) NOT NULL,
  [Nombre] NVARCHAR(50),
  [FichadoDetImprimeEtiqUdSN] BOOLEAN NOT NULL,
  [FichadoDetImprimeEtiqCorteSN] BOOLEAN NOT NULL,
  [FichadoDetImprimeEtiqUdNombreReport] NVARCHAR(40),
  [FichadoDetImprimeEtiqCorteNombreReport] NVARCHAR(40),
  [FichadoDetTronzadoraMultipleBarrasSN] BOOLEAN NOT NULL,
  [DetUnidadLstFamiliaSubfamilia] NVARCHAR(255),
  [FichadoDetImprimeEtiqCorteUnaEnAgrupadasSN] BOOLEAN NOT NULL,
  [DetUnidadLstSeccionProduccion] NVARCHAR(255),
  PRIMARY KEY ([Fase], [Codigo])
);

-- ===== MOSubfasesCamposUsrSQL  (filas: 0) =====
CREATE TABLE [MOSubfasesCamposUsrSQL] (
  [Fase] NVARCHAR(3) NOT NULL,
  [Subfase] NVARCHAR(3) NOT NULL,
  [NumeroCampo] SMALLINT NOT NULL,
  [Titulo] NVARCHAR(30),
  [SQL] NVARCHAR,
  PRIMARY KEY ([Fase], [Subfase], [NumeroCampo])
);

-- ===== MOTiposColoc  (filas: 5) =====
CREATE TABLE [MOTiposColoc] (
  [Codigo] NVARCHAR(3),
  [PredeterminadoSN] BOOLEAN NOT NULL,
  [PredeterminadoCerrSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(200),
  [ValidoProductorWebSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== NovedadesVersionControlUsr  (filas: 1) =====
CREATE TABLE [NovedadesVersionControlUsr] (
  [ComputerName] NVARCHAR(30) NOT NULL,
  [UsuarioSistema] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([ComputerName], [UsuarioSistema])
);

-- ===== ObCategorias  (filas: 0) =====
CREATE TABLE [ObCategorias] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(40),
  [FamiliaArtPorc] REAL,
  [InsertarAutoSN] BOOLEAN NOT NULL,
  [TipoCategoria] NVARCHAR(15),
  [FamiliaArtAsoc] NVARCHAR(255),
  PRIMARY KEY ([Codigo])
);

-- ===== ObConceptos  (filas: 0) =====
CREATE TABLE [ObConceptos] (
  [Codigo] NVARCHAR(5),
  [Descripcion] NVARCHAR(40),
  [Categoria] NVARCHAR(2),
  [Coste] REAL,
  [MOsn] BOOLEAN NOT NULL,
  [TipoMO] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== ObCostePrevisto  (filas: 0) =====
CREATE TABLE [ObCostePrevisto] (
  [id] INTEGER NOT NULL,
  [Categoria] NVARCHAR(2),
  [CostePrevisto] REAL,
  [Obra] NVARCHAR(10),
  PRIMARY KEY ([id])
);

-- ===== ObGastos  (filas: 0) =====
CREATE TABLE [ObGastos] (
  [Numero] NVARCHAR(6),
  [Fecha] DATE,
  [ProveedorAsoc] NVARCHAR(10),
  [TrabajadorAsoc] NVARCHAR(5),
  [Concepto] NVARCHAR(5),
  [Categoria] NVARCHAR(2),
  [Descripcion] NVARCHAR(40),
  [Cantidad] REAL,
  [Coste] REAL,
  [ImporteTotal] REAL,
  [idHoras] INTEGER,
  [Obra] NVARCHAR(10),
  [TipoDocAsoc] NVARCHAR(6),
  [CAlbaranAsoc] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== Obras  (filas: 0) =====
CREATE TABLE [Obras] (
  [Cliente] NVARCHAR(10),
  [Encargado] NVARCHAR(5),
  [Observaciones] NVARCHAR,
  [TipoOrigen] NVARCHAR(6),
  [CompletaSN] BOOLEAN NOT NULL,
  [Descripcion] NVARCHAR(60),
  [Codigo] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== ObrasOrigen  (filas: 0) =====
CREATE TABLE [ObrasOrigen] (
  [RevisDoc] NVARCHAR(3),
  [idDoc] INTEGER,
  [NumeroDoc] NVARCHAR(20) NOT NULL,
  [codObra] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([codObra], [NumeroDoc], [RevisDoc])
);

-- ===== ObservacionesDocumentos  (filas: 0) =====
CREATE TABLE [ObservacionesDocumentos] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Prioridad] SMALLINT,
  [Observaciones] NVARCHAR,
  [TipoDocumento] NVARCHAR(5) NOT NULL,
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [FechaDesde] DATE,
  [FechaHasta] DATE,
  [FiltroFechaAñoSN] BOOLEAN NOT NULL,
  [nLinea] INTEGER NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ObservacionesProdDoc  (filas: 0) =====
CREATE TABLE [ObservacionesProdDoc] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [TipoDocumento] NVARCHAR(5),
  [Prioridad] SMALLINT,
  [Observaciones] NVARCHAR,
  [Delegacion] NVARCHAR(2),
  PRIMARY KEY ([nLinea])
);

-- ===== ObservacionesProdLinArt  (filas: 0) =====
CREATE TABLE [ObservacionesProdLinArt] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [TipoDocumento] NVARCHAR(5),
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [Observaciones] NVARCHAR(255),
  [Articulo] NVARCHAR(60),
  [Acabado] NVARCHAR(10),
  [Delegacion] NVARCHAR(2),
  PRIMARY KEY ([nLinea])
);

-- ===== ObservacionesProdLinEstr  (filas: 0) =====
CREATE TABLE [ObservacionesProdLinEstr] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [TipoDocumento] NVARCHAR(5),
  [Familia] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [Observaciones] NVARCHAR(255),
  [Estructura] NVARCHAR(14),
  [Acabado] NVARCHAR(10),
  [Delegacion] NVARCHAR(2),
  PRIMARY KEY ([nLinea])
);

-- ===== Paises  (filas: 1) =====
CREATE TABLE [Paises] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(60),
  [CodigoISO] NVARCHAR(3),
  [Zona] NVARCHAR(20),
  [ProvinciaDeCodPostalSN] BOOLEAN NOT NULL,
  [ProvinciaDeCodPostalDesde] SMALLINT,
  [ProvinciaDeCodPostalHasta] SMALLINT,
  [PredeterminadoSN] BOOLEAN NOT NULL,
  [CodigoPaisContabilidad] NVARCHAR(5),
  [CodigoIdTerceroContabilidad] NVARCHAR(5),
  [CodigoFacturaE] NVARCHAR(3),
  [TipoPais] NVARCHAR(25),
  [ProvinciaObligatoriaSN] BOOLEAN NOT NULL,
  [DocumentacionExportacionSN] BOOLEAN NOT NULL,
  [CodigoISO3] NVARCHAR(3),
  [KilometrosIntrastat] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== PaisesTipos  (filas: 2) =====
CREATE TABLE [PaisesTipos] (
  [TipoPais] NVARCHAR(25) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([TipoPais])
);

-- ===== PartidasArancelarias  (filas: 0) =====
CREATE TABLE [PartidasArancelarias] (
  [Codigo] NVARCHAR(20) NOT NULL,
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Codigo])
);

-- ===== PeriodosCalculoCM  (filas: 0) =====
CREATE TABLE [PeriodosCalculoCM] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [FechaInicial] DATE,
  [FechaFinal] DATE,
  [VisibleCalculosSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== PeriodosFiscales  (filas: 0) =====
CREATE TABLE [PeriodosFiscales] (
  [Codigo] NVARCHAR(8) NOT NULL,
  [Descripcion] NVARCHAR(150),
  [FechaInicio] DATE,
  [FechaFin] DATE,
  [Estado] NVARCHAR(7),
  PRIMARY KEY ([Codigo])
);

-- ===== Permisos  (filas: 305) =====
CREATE TABLE [Permisos] (
  [Nivel] SMALLINT,
  [Menu] NVARCHAR(250),
  [Acceso] NVARCHAR(1),
  [ImprimirSN] BOOLEAN NOT NULL,
  [ActualizarSN] BOOLEAN NOT NULL,
  [EliminarSN] BOOLEAN NOT NULL,
  [ExportarSN] BOOLEAN NOT NULL,
  [NuevoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Nivel], [Menu])
);

-- ===== PermisosFrm  (filas: 0) =====
CREATE TABLE [PermisosFrm] (
  [Nivel] SMALLINT NOT NULL,
  [idForm] NVARCHAR(50) NOT NULL,
  [tabName] NVARCHAR(20) NOT NULL,
  [nTab] SMALLINT NOT NULL,
  [RutaTab] NVARCHAR(255) NOT NULL,
  [AccesoSN] BOOLEAN NOT NULL,
  [ActualizarSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Nivel], [idForm], [tabName], [nTab])
);

-- ===== PlantillasEMail  (filas: 0) =====
CREATE TABLE [PlantillasEMail] (
  [TipoDoc] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(50) NOT NULL,
  [Asunto] NVARCHAR(255),
  [Mensaje] NVARCHAR,
  [PredeterminadaSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  PRIMARY KEY ([TipoDoc], [Delegacion], [Nombre])
);

-- ===== PlazoEntregaArt  (filas: 0) =====
CREATE TABLE [PlazoEntregaArt] (
  [nLinea] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Prioridad] SMALLINT,
  [PlazoEntrega] SMALLINT,
  [Delegacion] NVARCHAR(2),
  [Acabado] NVARCHAR NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== PlazoEntregaEstr  (filas: 0) =====
CREATE TABLE [PlazoEntregaEstr] (
  [nLinea] INTEGER NOT NULL,
  [Estructura] NVARCHAR(15) NOT NULL,
  [FamiliaEstr] NVARCHAR(10) NOT NULL,
  [LstAltCajon] NVARCHAR(255),
  [LstLamas] NVARCHAR(255),
  [LstGuias] NVARCHAR(255),
  [LstAcaCajon] NVARCHAR(255),
  [LstAcaLamas] NVARCHAR(255),
  [LstAcaGuias] NVARCHAR(255),
  [MetodoCalculo] NVARCHAR(6),
  [Prioridad] SMALLINT,
  [PlazoEntrega] SMALLINT,
  [Delegacion] NVARCHAR(2),
  [Acabado] NVARCHAR NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== PoblacionesCP  (filas: 12) =====
CREATE TABLE [PoblacionesCP] (
  [Codigo] NVARCHAR(10),
  [nombre] NVARCHAR(40),
  [Pais] NVARCHAR(10) NOT NULL,
  [Identificador] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Pais], [Identificador])
);

-- ===== PosicionVentana  (filas: 5) =====
CREATE TABLE [PosicionVentana] (
  [id] INTEGER NOT NULL,
  [Ventana] NVARCHAR(50),
  [PosX] REAL,
  [PosY] REAL,
  PRIMARY KEY ([id])
);

-- ===== Proveedores  (filas: 6) =====
CREATE TABLE [Proveedores] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(100) NOT NULL,
  [Contacto] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Direccion2] NVARCHAR(150),
  [CP2] NVARCHAR(20),
  [Poblacion2] NVARCHAR(80),
  [Provincia2] NVARCHAR(80),
  [NombreRep] NVARCHAR(40),
  [DireccionRep] NVARCHAR(150),
  [CPRep] NVARCHAR(20),
  [PoblacionRep] NVARCHAR(80),
  [ProvinciaRep] NVARCHAR(80),
  [TelefonoRep] NVARCHAR(20),
  [Telefono2Rep] NVARCHAR(20),
  [FaxRep] NVARCHAR(20),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Descuento] REAL,
  [Entidad] NVARCHAR(4),
  [Sucursal] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [Cuenta] NVARCHAR(10),
  [NombreEntidad] NVARCHAR(40),
  [Margen1] REAL,
  [Margen2] REAL,
  [Margen3] REAL,
  [Observaciones] NVARCHAR,
  [DiasPago1] SMALLINT,
  [DiasPago2] SMALLINT,
  [DiasPago3] SMALLINT,
  [DesdeSinPagos] DATE,
  [HastaSinPagos] DATE,
  [CuentaContable] NVARCHAR(15),
  [CuentaGastos] NVARCHAR(15),
  [ContabilizadaSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [UsuarioEspecSN] BOOLEAN NOT NULL,
  [DecimalesDto] REAL,
  [TransformacionSN] BOOLEAN NOT NULL,
  [TransAlmacen] NVARCHAR(5),
  [FabricaSN] BOOLEAN NOT NULL,
  [DiasEntrega] SMALLINT,
  [RedondeoEspSN] BOOLEAN NOT NULL,
  [RedondeoPrecio] SMALLINT,
  [RedondeoLinea] SMALLINT,
  [RedondeoTotal] SMALLINT,
  [ObservacionesPed] NVARCHAR(255),
  [TransPerimetroMin] REAL,
  [FabrPedidoMinKg] REAL,
  [EnsambleSN] BOOLEAN NOT NULL,
  [IVAPorcDifSN] BOOLEAN NOT NULL,
  [FechaHoraAct] DATE,
  [autorizaSN] BOOLEAN NOT NULL,
  [CElabAplicableSN] BOOLEAN NOT NULL,
  [DescuentoPPporc] REAL,
  [Pais] NVARCHAR(10),
  [Pais2] NVARCHAR(10),
  [PaisRep] NVARCHAR(10),
  [CEcodigoLaboratorio] NVARCHAR(5),
  [CodigoContabilidad] NVARCHAR(15),
  [TipoIVA] NVARCHAR(2),
  [NIF] NVARCHAR(30),
  [CodigoFiscal2] NVARCHAR(30),
  [CodigoFiscal3] NVARCHAR(30),
  [CodigoFiscalObservaciones] NVARCHAR(30),
  [CuentaBancariaIntl] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  [eMailRep] NVARCHAR(150),
  [DiasVtoMaxAjusta] NVARCHAR(10),
  [FabricacionArtSN] BOOLEAN NOT NULL,
  [FabricacionArtAlmacen] NVARCHAR(5),
  [NombreComercial] NVARCHAR(80),
  [TransPrecioPlast] REAL,
  [TransTipoPrecioPlast_ML_SUP] NVARCHAR(3),
  [PersonaFisicaJuridica] NVARCHAR(8),
  [CondicionResidencia] NVARCHAR(1),
  [DomiciliacionSN] BOOLEAN NOT NULL,
  [VidRepREcosteKg] REAL,
  [NoActStockCPedTransSN] BOOLEAN NOT NULL,
  [CDocAcaSinCosteSN] BOOLEAN NOT NULL,
  [RecEnerg_ACT_DESC] NVARCHAR(4),
  [RecEnergCalcularEn] NVARCHAR(20),
  [RecEnergMinEspSN] BOOLEAN NOT NULL,
  [RecEnergMinEsp] REAL,
  [DescuentosCMNsn] BOOLEAN NOT NULL,
  [DescuentosCMNacaSN] BOOLEAN NOT NULL,
  [Web] NVARCHAR(255),
  [TipoNacionalidad] NVARCHAR(15),
  [TipoIVAserieSN] BOOLEAN NOT NULL,
  [REMetMinConf] NVARCHAR(4),
  [BIC] NVARCHAR(11),
  [AnulaIVAenArticulosSN] BOOLEAN NOT NULL,
  [DivisaCPED] NVARCHAR(5),
  [DivisaCALB] NVARCHAR(5),
  [DivisaCFAC] NVARCHAR(5),
  [DivisaImprimir] NVARCHAR(5),
  [eMailPedidos] NVARCHAR(150),
  [CPedTipoPedidoPredefinido] NVARCHAR(10),
  [CPedAutorizacionFuerzaPropuestaSN] BOOLEAN NOT NULL,
  [CalculoFechaEntDiasLaboralesSN] BOOLEAN NOT NULL,
  [TipoRetencion] NVARCHAR(2),
  [Idioma] NVARCHAR(3),
  [LoteSufijoSN] BOOLEAN NOT NULL,
  [LoteSufijo] NVARCHAR(5),
  [siiTipoIdFiscal] NVARCHAR(2),
  [IntercompanyProveedorSN] BOOLEAN NOT NULL,
  [IntercompanyCliente] NVARCHAR(10),
  [TipoDocumento] NVARCHAR(5),
  [TpteIncoterm] NVARCHAR(5),
  [Usuario] NVARCHAR(30),
  [OrdenReparto] SMALLINT,
  [CuentaAnticipos] NVARCHAR(15),
  [ProdWebIntegraSN] BOOLEAN NOT NULL,
  [ProdWebIntegraCodigoCliente] NVARCHAR(10),
  [ProdWebIntegraLoginEMail] NVARCHAR(100),
  [ProdWebIntegraTokenIntegracion] NVARCHAR(8),
  [ProdWebIntegraUltimaDescarga] DATE,
  [FabricacionArtAlmacenEntrada] NVARCHAR(5),
  [FabricacionArtAlmacenFabricados] NVARCHAR(5),
  [PedidosAutoSepararAcabadosSN] BOOLEAN NOT NULL,
  [EnsambleAlmacen] NVARCHAR(5),
  [EnsambleAlmacenSalidaComp] NVARCHAR(5),
  [CuentaEfectosPagar] NVARCHAR(15),
  [TipoIDfiscal] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== ProveedoresAutorizaAutorizadores  (filas: 0) =====
CREATE TABLE [ProveedoresAutorizaAutorizadores] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [gaNotUsuarioAut] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([Proveedor], [gaNotUsuarioAut])
);

-- ===== ProveedoresContactos  (filas: 0) =====
CREATE TABLE [ProveedoresContactos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [NumeroContacto] SMALLINT NOT NULL,
  [Nombre] NVARCHAR(100),
  [Cargo] NVARCHAR(50),
  [Telefono] NVARCHAR(20),
  [TelefonoMovil] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Codigo], [NumeroContacto])
);

-- ===== ProveedoresCuentaPagos  (filas: 0) =====
CREATE TABLE [ProveedoresCuentaPagos] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [TipoDocumento] NVARCHAR(5) NOT NULL,
  [Prioridad] SMALLINT,
  [CuentaPagos] NVARCHAR(4),
  PRIMARY KEY ([Proveedor], [Serie], [Delegacion], [TipoDocumento])
);

-- ===== ProveedoresDelegaciones  (filas: 0) =====
CREATE TABLE [ProveedoresDelegaciones] (
  [nLinea] INTEGER NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ProveedoresDtoArt  (filas: 0) =====
CREATE TABLE [ProveedoresDtoArt] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Descuento] REAL,
  [FechaActDto] DATE,
  PRIMARY KEY ([Proveedor], [Articulo], [Acabado])
);

-- ===== ProveedoresDtoCMN  (filas: 0) =====
CREATE TABLE [ProveedoresDtoCMN] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  PRIMARY KEY ([Proveedor], [CadenaDeClasificacion])
);

-- ===== ProveedoresDtoCMNaca  (filas: 0) =====
CREATE TABLE [ProveedoresDtoCMNaca] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  PRIMARY KEY ([Proveedor], [CadenaDeClasificacion], [Acabado])
);

-- ===== ProveedoresDtoFam  (filas: 3) =====
CREATE TABLE [ProveedoresDtoFam] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [FechaActDto] DATE,
  PRIMARY KEY ([Proveedor], [Familia])
);

-- ===== ProveedoresDtoFamAca  (filas: 0) =====
CREATE TABLE [ProveedoresDtoFamAca] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10),
  [Descuento] REAL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [FechaActDto] DATE,
  PRIMARY KEY ([Proveedor], [Familia], [Subfamilia], [Acabado])
);

-- ===== ProveedoresDtoSubFam  (filas: 0) =====
CREATE TABLE [ProveedoresDtoSubFam] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [FechaActDto] DATE,
  PRIMARY KEY ([Proveedor], [Familia], [Subfamilia])
);

-- ===== ProveedoresObservaciones  (filas: 0) =====
CREATE TABLE [ProveedoresObservaciones] (
  [nLinea] INTEGER NOT NULL,
  [Proveedor] NVARCHAR(10) NOT NULL,
  [TipoDoc] NVARCHAR(5) NOT NULL,
  [SerieDoc] NVARCHAR(1),
  [Observaciones] NVARCHAR,
  [MostrarEnPantallaSN] BOOLEAN NOT NULL,
  [ImprimirEnDocumentoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== ProveedoresPlazoEnt  (filas: 0) =====
CREATE TABLE [ProveedoresPlazoEnt] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [PlazoEntrega] SMALLINT,
  PRIMARY KEY ([Proveedor], [Articulo], [Acabado])
);

-- ===== ProveedoresPrecioTransf  (filas: 9) =====
CREATE TABLE [ProveedoresPrecioTransf] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10),
  [Coste] DOUBLE,
  [PrecioLijaML] REAL,
  [PerimetroMin] REAL,
  [PlazoEntregaDias] SMALLINT,
  [TarifaTransformacion] NVARCHAR(1) NOT NULL,
  [DivisaCoste] NVARCHAR(5),
  PRIMARY KEY ([TarifaTransformacion], [Proveedor], [Acabado])
);

-- ===== ProveedoresPrecioTransfAcaTon  (filas: 0) =====
CREATE TABLE [ProveedoresPrecioTransfAcaTon] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tonalidad] NVARCHAR(10) NOT NULL,
  [Coste] REAL,
  [PrecioLijaML] REAL,
  [PerimetroMin] REAL,
  [PlazoEntregaDias] SMALLINT,
  [TarifaTransformacion] NVARCHAR(1) NOT NULL,
  [DivisaCoste] NVARCHAR(5),
  PRIMARY KEY ([TarifaTransformacion], [Proveedor], [Acabado], [Tonalidad])
);

-- ===== ProveedoresPrecioTransfArtAcaTon  (filas: 0) =====
CREATE TABLE [ProveedoresPrecioTransfArtAcaTon] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [TarifaTransformacion] NVARCHAR(1) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tonalidad] NVARCHAR(10) NOT NULL,
  [Coste] REAL,
  [PrecioLijaML] REAL,
  [PerimetroMin] REAL,
  [PlazoEntregaDias] SMALLINT,
  [DivisaCoste] NVARCHAR(5),
  PRIMARY KEY ([Proveedor], [TarifaTransformacion], [Articulo], [Acabado], [Tonalidad])
);

-- ===== ProveedoresTipoIVA  (filas: 0) =====
CREATE TABLE [ProveedoresTipoIVA] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [TipoIVA] NVARCHAR(2),
  PRIMARY KEY ([Proveedor], [Serie])
);

-- ===== Provincias  (filas: 50) =====
CREATE TABLE [Provincias] (
  [Nombre] NVARCHAR(80),
  [Codigo] NVARCHAR(10) NOT NULL,
  [Pais] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Pais], [Codigo])
);

-- ===== RCSBConfig  (filas: 0) =====
CREATE TABLE [RCSBConfig] (
  [PNombre] NVARCHAR(40),
  [PEntidad] NVARCHAR(4),
  [PSucursal] NVARCHAR(4),
  [PDC] NVARCHAR(2),
  [PCuenta] NVARCHAR(10),
  [PNIF] NVARCHAR(9),
  [PSufijo] NVARCHAR(3),
  [C19Formato] SMALLINT
);

-- ===== RCSBRemesas  (filas: 0) =====
CREATE TABLE [RCSBRemesas] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Cuaderno] NVARCHAR(5),
  [Procedimiento] NVARCHAR(2),
  [Fecha] DATE,
  [FechaCargo] DATE,
  [nRecibos] SMALLINT,
  [CuentaCob] NVARCHAR(4),
  [TipoGD] NVARCHAR(1),
  [ImporteTotal] DOUBLE,
  [TipoSecuencia] NVARCHAR(4),
  [RecibosFechaCargoVtoSN] BOOLEAN NOT NULL,
  [RecibosAgrupadosVtoSN] BOOLEAN NOT NULL,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== RCSBRemesasLin  (filas: 0) =====
CREATE TABLE [RCSBRemesasLin] (
  [nLin] INTEGER NOT NULL,
  [nRemesa] NVARCHAR(20) NOT NULL,
  [Referencia] NVARCHAR(30),
  [Nombre] NVARCHAR(100),
  [CEntidad] NVARCHAR(4),
  [CSucursal] NVARCHAR(4),
  [CDC] NVARCHAR(2),
  [CCuenta] NVARCHAR(10),
  [Importe] REAL,
  [CodDev] NVARCHAR(30),
  [RefInt] NVARCHAR(30),
  [Concepto1] NVARCHAR(80),
  [Concepto2] NVARCHAR(80),
  [Concepto3] NVARCHAR(80),
  [Concepto4] NVARCHAR(80),
  [Concepto5] NVARCHAR(80),
  [Concepto6] NVARCHAR(80),
  [Concepto7] NVARCHAR(80),
  [Concepto8] NVARCHAR(80),
  [Fecha] DATE,
  [Vencimiento] DATE,
  [CCuentaBancariaIntl] NVARCHAR(80),
  [CBIC] NVARCHAR(11),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [PaisISO] NVARCHAR(3),
  [nEfecto] INTEGER,
  [Cliente] NVARCHAR(10),
  [NIF] NVARCHAR(30),
  [AutorizacionSEPAreferencia] NVARCHAR(35),
  [AutorizacionSEPAfechaFirmada] DATE,
  PRIMARY KEY ([nLin])
);

-- ===== RCSBRemesasPag  (filas: 0) =====
CREATE TABLE [RCSBRemesasPag] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [FechaCargo] DATE,
  [nRecibos] SMALLINT,
  [CuentaCob] NVARCHAR(4),
  [TipoOperacion] NVARCHAR(15),
  [Gastos] NVARCHAR(12),
  [ConceptoOrden] NVARCHAR(10),
  [ImporteTotal] DOUBLE,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [Cuaderno] NVARCHAR(10),
  PRIMARY KEY ([Numero])
);

-- ===== RCSBRemesasPagLin  (filas: 0) =====
CREATE TABLE [RCSBRemesasPagLin] (
  [nLin] INTEGER NOT NULL,
  [nRemesa] NVARCHAR(20) NOT NULL,
  [Referencia] NVARCHAR(30),
  [Nombre] NVARCHAR(100),
  [NIF] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [CP] NVARCHAR(20),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [CEntidad] NVARCHAR(4),
  [CSucursal] NVARCHAR(4),
  [CDC] NVARCHAR(2),
  [CCuenta] NVARCHAR(10),
  [Concepto1] NVARCHAR(80),
  [Concepto2] NVARCHAR(80),
  [Concepto3] NVARCHAR(80),
  [Concepto4] NVARCHAR(80),
  [Concepto5] NVARCHAR(80),
  [Concepto6] NVARCHAR(80),
  [Concepto7] NVARCHAR(80),
  [Concepto8] NVARCHAR(80),
  [Fecha] DATE,
  [Vencimiento] DATE,
  [VencimientoPagare] DATE,
  [PaisISO] NVARCHAR(2),
  [PaisNombre] NVARCHAR(60),
  [TipoNacionalidad] NVARCHAR(15),
  [NumPagoCuaderno68] NVARCHAR(7),
  [CCuentaBancariaIntl] NVARCHAR(80),
  [CBIC] NVARCHAR(11),
  [nPagoPend] INTEGER,
  [Importe] DOUBLE,
  [Proveedor] NVARCHAR(10),
  PRIMARY KEY ([nLin])
);

-- ===== RegistrosDesactivados  (filas: 1) =====
CREATE TABLE [RegistrosDesactivados] (
  [nLinea] INTEGER NOT NULL,
  [Tabla] NVARCHAR(40) NOT NULL,
  [Id1] NVARCHAR(20) NOT NULL,
  [DesBusquedaSN] BOOLEAN NOT NULL,
  [DesManualSN] BOOLEAN NOT NULL,
  [DesListaRegSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== Representantes  (filas: 0) =====
CREATE TABLE [Representantes] (
  [Codigo] NVARCHAR(5),
  [Nombre] NVARCHAR(40),
  [Direccion] NVARCHAR(150),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [ComisionPorc] REAL,
  [Observaciones] NVARCHAR,
  [PERelemPropiosSN] BOOLEAN NOT NULL,
  [PERelemPropiosListaIniSN] BOOLEAN NOT NULL,
  [NIF] NVARCHAR(30),
  [eMail] NVARCHAR(150),
  [Pais] NVARCHAR(10),
  [TelefonoMovil] NVARCHAR(20),
  [CodigoFiscal2] NVARCHAR(30),
  [CodigoFiscal3] NVARCHAR(30),
  [CodigoFiscalObservaciones] NVARCHAR(30),
  [PERusuario] NVARCHAR(255),
  [ProdWebAccesoSN] BOOLEAN NOT NULL,
  [ProdWebLoginEMail] NVARCHAR(100),
  [ProdWebPasswordHash] NVARCHAR(40),
  [CP] NVARCHAR(20),
  [ProdWebAccesoOtrosRepSN] BOOLEAN NOT NULL,
  [BajaSN] BOOLEAN NOT NULL,
  [FechaBaja] DATE,
  PRIMARY KEY ([Codigo])
);

-- ===== RepresentantesAgZonas  (filas: 0) =====
CREATE TABLE [RepresentantesAgZonas] (
  [Representante] NVARCHAR(5) NOT NULL,
  [AgZonaComercial] NVARCHAR(3) NOT NULL,
  PRIMARY KEY ([Representante], [AgZonaComercial])
);

-- ===== RepresentantesComCat  (filas: 0) =====
CREATE TABLE [RepresentantesComCat] (
  [Representante] NVARCHAR(5),
  [ComisCateg] NVARCHAR(2),
  [ComisionPorc] REAL,
  PRIMARY KEY ([Representante], [ComisCateg])
);

-- ===== RepresentantesMensajes  (filas: 0) =====
CREATE TABLE [RepresentantesMensajes] (
  [Representante] NVARCHAR(5),
  [IdMensaje] GUID NOT NULL,
  [Cliente] NVARCHAR(10),
  [Fecha] DATE,
  [Texto] NVARCHAR,
  [Direccion] NVARCHAR(25),
  PRIMARY KEY ([IdMensaje])
);

-- ===== RepresentantesProdWebAcceso  (filas: 0) =====
CREATE TABLE [RepresentantesProdWebAcceso] (
  [Representante] NVARCHAR(5) NOT NULL,
  [OtroRepresentante] NVARCHAR(5) NOT NULL,
  [AccesoClientesSN] BOOLEAN NOT NULL,
  [AccesoClientesPotSN] BOOLEAN NOT NULL,
  [AccesoClientesPrePotSN] BOOLEAN NOT NULL,
  [AccesoVDocumentosSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Representante], [OtroRepresentante])
);

-- ===== SeriesAsocV2  (filas: 0) =====
CREATE TABLE [SeriesAsocV2] (
  [nLinea] INTEGER NOT NULL,
  [descripcion] NVARCHAR(100),
  [conjunto] NVARCHAR(15),
  [cantidad] SMALLINT,
  [acabado] NVARCHAR(10),
  [asociadoA_ancho] SMALLINT,
  [asociadoA_alto] SMALLINT,
  [nOpcionHerraje] SMALLINT,
  [formulaOpcion] NVARCHAR(20),
  [tipoMedCV] NVARCHAR(1),
  [tipoCorte] NVARCHAR(2),
  [usuarioSN] BOOLEAN NOT NULL,
  [AsociadoA_modulos] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== SeriesAsocV2Articulos  (filas: 0) =====
CREATE TABLE [SeriesAsocV2Articulos] (
  [nLinea] INTEGER NOT NULL,
  [nLinAsoc] INTEGER,
  [articulo] NVARCHAR(15),
  [cantidad] SMALLINT,
  [asociadoA] NVARCHAR(10),
  [acabado] NVARCHAR(10),
  [formulaAncho] NVARCHAR(50),
  [formulaAlto] NVARCHAR(50),
  [descuentoAncho] REAL,
  [descuentoAlto] REAL,
  [intervaloAncho] REAL,
  [intervaloAlto] REAL,
  [tipoCorte] NVARCHAR(2),
  [usuarioSN] BOOLEAN NOT NULL,
  [apertEspecificaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== SeriesAsocV2AsociadoA  (filas: 11) =====
CREATE TABLE [SeriesAsocV2AsociadoA] (
  [id] SMALLINT NOT NULL,
  [tipo] NVARCHAR(5) NOT NULL,
  [tipoSerie] NVARCHAR(1),
  [componentesAsociados] NVARCHAR(255),
  [descripcion] NVARCHAR(50),
  PRIMARY KEY ([id], [tipo])
);

-- ===== SeriesAsocV2Filtros  (filas: 0) =====
CREATE TABLE [SeriesAsocV2Filtros] (
  [nLinea] INTEGER NOT NULL,
  [nLinAsoc] INTEGER,
  [tipo] NVARCHAR(10),
  [conjunto] NVARCHAR(15),
  [pesoMin] REAL,
  [pesoMax] REAL,
  [acabadosEstr] NVARCHAR(255),
  [acabadosAccEstr] NVARCHAR(255),
  [aperturas] NVARCHAR(255),
  [manoIsn] BOOLEAN NOT NULL,
  [manoDsn] BOOLEAN NOT NULL,
  [tipoPerfVentanaSN] BOOLEAN NOT NULL,
  [tipoPerfPuertaSN] BOOLEAN NOT NULL,
  [tipoPerfPcSN] BOOLEAN NOT NULL,
  [apertIntSN] BOOLEAN NOT NULL,
  [apertExtSN] BOOLEAN NOT NULL,
  [articulo] NVARCHAR(15),
  [articuloAsociadoA_ancho] SMALLINT,
  [articuloAsociadoA_alto] SMALLINT,
  [tiposHojaValidos] NVARCHAR(255),
  [marcoAbiertoSN] BOOLEAN NOT NULL,
  [marcoCerradoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== SeriesAsocV2FiltrosMedidas  (filas: 0) =====
CREATE TABLE [SeriesAsocV2FiltrosMedidas] (
  [nLinea] INTEGER NOT NULL,
  [nLinAsoc] INTEGER,
  [tipo] NVARCHAR(10),
  [conjunto] NVARCHAR(15),
  [anchoMin] REAL,
  [anchoMax] REAL,
  [altoMin] REAL,
  [altoMax] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== SeriesAsocV2TiposHoja  (filas: 76) =====
CREATE TABLE [SeriesAsocV2TiposHoja] (
  [id] SMALLINT NOT NULL,
  [tipo] NVARCHAR(10),
  [tipoAsocV2] NVARCHAR(10),
  [descripcion] NVARCHAR(50),
  [numeroHojas] SMALLINT,
  [manoIsn] BOOLEAN NOT NULL,
  [manoDsn] BOOLEAN NOT NULL,
  [tipoPerfVentanaSN] BOOLEAN NOT NULL,
  [tipoPerfPuertaSN] BOOLEAN NOT NULL,
  [tipoPerfPcSN] BOOLEAN NOT NULL,
  [abatibleSN] BOOLEAN NOT NULL,
  [mallorquinaSN] BOOLEAN NOT NULL,
  [correderaSN] BOOLEAN NOT NULL,
  [plegableSN] BOOLEAN NOT NULL,
  [pivotanteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([id])
);

-- ===== SeriesDocumento  (filas: 3) =====
CREATE TABLE [SeriesDocumento] (
  [Codigo] NVARCHAR(1) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [SerieRectificativa] NVARCHAR(1),
  [TipoIVA] NVARCHAR(2),
  [ProdWebPublicaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== SeriesNSerieAut  (filas: 0) =====
CREATE TABLE [SeriesNSerieAut] (
  [id] INTEGER NOT NULL,
  [CodCli] NVARCHAR(10),
  PRIMARY KEY ([id])
);

-- ===== SeriesNumeracion  (filas: 15) =====
CREATE TABLE [SeriesNumeracion] (
  [nLinea] INTEGER NOT NULL,
  [Serie] NVARCHAR(1),
  [Delegacion] NVARCHAR(2),
  [TipoDocumento] NVARCHAR(5),
  [Prioridad] SMALLINT,
  [Prefijo] NVARCHAR(50),
  [NuevoDocumentoSN] BOOLEAN NOT NULL,
  [TransformacionSN] BOOLEAN NOT NULL,
  [CambioSerieSN] BOOLEAN NOT NULL,
  [CuentaCobro] NVARCHAR(4),
  [FormulaNumero] NVARCHAR(100),
  [TipoDoc] NVARCHAR(10) NOT NULL,
  [SiguienteNumero] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== SeriesNumeracionLotes  (filas: 0) =====
CREATE TABLE [SeriesNumeracionLotes] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(10),
  [Familia] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10),
  [Prioridad] SMALLINT,
  [Prefijo] NVARCHAR(40),
  [SufijoAutonumericoSN] BOOLEAN NOT NULL,
  [AnchoRellenar] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== SeriesPerfiles  (filas: 112) =====
CREATE TABLE [SeriesPerfiles] (
  [id] INTEGER NOT NULL,
  [Serie] NVARCHAR(15),
  [TipoPerf] NVARCHAR(10),
  [Articulo] NVARCHAR(15),
  [nOpcionHerr] SMALLINT,
  [CodTAcris] NVARCHAR(4),
  [CorrGrosorVidDesde] SMALLINT,
  [CorrGrosorVidHasta] SMALLINT,
  [Abat_A] REAL,
  [Abat_B] REAL,
  [Abat_C] REAL,
  [Abat_D] REAL,
  [Abat_S] REAL,
  [Abat_J] REAL,
  [Abat_J2] REAL,
  [Abat_H] REAL,
  [Abat_I] REAL,
  [Abat_K] REAL,
  [Abat_L] REAL,
  [Abat_M] REAL,
  [Abat_N] REAL,
  [Abat_DtoHMA] REAL,
  [Corr_DL] REAL,
  [Corr_B] REAL,
  [Corr_C] REAL,
  [Corr_H] REAL,
  [Corr_J] REAL,
  [Corr_J2] REAL,
  [Corr_I] REAL,
  [Corr_DR] REAL,
  [Corr_A] REAL,
  [Marco_Ancho] REAL,
  [Marco_GalceMax] REAL,
  [Hoja_Ancho] REAL,
  [Hoja_GalceMax] REAL,
  [Mall_SepL] REAL,
  [Pleg_DtoMarcoSupInf] REAL,
  [Pleg_DtoMarcoLat] REAL,
  PRIMARY KEY ([id])
);

-- ===== SeriesTablasHerraje  (filas: 0) =====
CREATE TABLE [SeriesTablasHerraje] (
  [Codigo] NVARCHAR(20) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [UsuarioSN] BOOLEAN NOT NULL,
  [UltimaAct] DATE,
  PRIMARY KEY ([Codigo])
);

-- ===== SeriesTablasHerrajeLin  (filas: 0) =====
CREATE TABLE [SeriesTablasHerrajeLin] (
  [nLinea] INTEGER NOT NULL,
  [Tabla] NVARCHAR(20) NOT NULL,
  [ArticuloInsertar] NVARCHAR(60),
  [AcabadoInsertar] NVARCHAR(10),
  [AcabadoFijoInsertar] NVARCHAR(10),
  [AcaTonalidadFijoInsertar] NVARCHAR(10),
  [CantidadInsertar] REAL,
  [AnchoDesde] REAL,
  [AnchoHasta] REAL,
  [AltoDesde] REAL,
  [AltoHasta] REAL,
  [FiltroAcabadoPerfiles] NVARCHAR,
  [FiltroAcabadoAccesorios] NVARCHAR,
  [FormulaOpcion] NVARCHAR,
  [ManoID] NVARCHAR(1),
  PRIMARY KEY ([nLinea])
);

-- ===== siiRegistroEnvios  (filas: 0) =====
CREATE TABLE [siiRegistroEnvios] (
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(4) NOT NULL,
  [NumeroFactura] NVARCHAR(20) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [ContadorCobroPago] INTEGER,
  [FechaEnvio] DATE,
  [EstadoAEAT] NVARCHAR(20),
  [Timestamp] NVARCHAR(20),
  [CSV] NVARCHAR(20),
  [CodigoErrorAEAT] NVARCHAR(10),
  [DescripcionErrorAEAT] NVARCHAR,
  [Acreedor] NVARCHAR(10),
  [siiPeriodoMes] SMALLINT,
  [siiPeriodoAño] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== siiTiposDocumento  (filas: 0) =====
CREATE TABLE [siiTiposDocumento] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(60),
  [siiTipoFacturaEmitida] NVARCHAR(2),
  [siiTipoFacturaRecibida] NVARCHAR(2),
  [siiTipoFactura] NVARCHAR(2),
  [siiClaveRegimenEspecial] NVARCHAR(2),
  [siiTipoRectificativa] NVARCHAR(2),
  [siiSujetaSN] BOOLEAN NOT NULL,
  [siiExentaSN] BOOLEAN NOT NULL,
  [siiTipoNoSujeta] NVARCHAR(2),
  [siiTipoNoExenta] NVARCHAR(2),
  [siiCausaExencion] NVARCHAR(2),
  [AplicableA] NVARCHAR(20),
  [siiDescripcionOperacion] NVARCHAR(60),
  [siiClaveRegimenEspecialAdicional1] NVARCHAR(2),
  [siiClaveRegimenEspecialAdicional2] NVARCHAR(2),
  PRIMARY KEY ([Codigo])
);

-- ===== siiTiposDocumentoConfig  (filas: 0) =====
CREATE TABLE [siiTiposDocumentoConfig] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [TipoDocumento] NVARCHAR(5),
  [Delegacion] NVARCHAR(2),
  [Serie] NVARCHAR(1),
  [TipoPais] NVARCHAR(25),
  [prioridad] SMALLINT,
  [siiTipoDocumento] NVARCHAR(5),
  [ClienteProvAcre] NVARCHAR(10),
  [TipoCliente] NVARCHAR(3),
  [Rectificativa_SN] NVARCHAR(1),
  PRIMARY KEY ([nLinea])
);

-- ===== siiValoresCampos  (filas: 78) =====
CREATE TABLE [siiValoresCampos] (
  [NombreCampo] NVARCHAR(30) NOT NULL,
  [CodigoValor] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([NombreCampo], [CodigoValor])
);

-- ===== siiVCobrosMetalico  (filas: 0) =====
CREATE TABLE [siiVCobrosMetalico] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Ejercicio] SMALLINT NOT NULL,
  [ImporteTotal] REAL,
  [siiEnviadaSN] BOOLEAN NOT NULL,
  [siiFechaEnvio] DATE,
  [siiEstadoAEAT] NVARCHAR(20),
  [Timestamp] NVARCHAR(20),
  [CSV] NVARCHAR(20),
  [CodigoErrorAEAT] NVARCHAR(10),
  [DescripcionErrorAEAT] NVARCHAR,
  PRIMARY KEY ([Cliente], [Delegacion], [Ejercicio])
);

-- ===== SincronizaEmpresa  (filas: 0) =====
CREATE TABLE [SincronizaEmpresa] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [NombreServer] NVARCHAR(80),
  [NombreBD] NVARCHAR(80),
  [bdUsuario] NVARCHAR(80),
  [bdContra] NVARCHAR(80),
  [EmpresaSN] BOOLEAN NOT NULL,
  [SincArtSN] BOOLEAN NOT NULL,
  [SincEstrSN] BOOLEAN NOT NULL,
  [SincCliSN] BOOLEAN NOT NULL,
  [SincProvSN] BOOLEAN NOT NULL,
  [SincAcaSN] BOOLEAN NOT NULL,
  [SincAcreSN] BOOLEAN NOT NULL,
  [SincSerSN] BOOLEAN NOT NULL,
  [FiltroArtFamilia] NVARCHAR(255),
  [FiltroArtTipoArticulo] NVARCHAR(255),
  [FiltroEstrFamilia] NVARCHAR(255),
  [FiltroCliTipoCliente] NVARCHAR(255),
  [FiltroSerieCodigo] NVARCHAR,
  [SincCtoSN] BOOLEAN NOT NULL,
  [SincAcaFamSN] BOOLEAN NOT NULL,
  [SincArtFamSN] BOOLEAN NOT NULL,
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyProveedor] NVARCHAR(10),
  [IntercompanyCliente] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== StockContenedores  (filas: 0) =====
CREATE TABLE [StockContenedores] (
  [Id] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Almacen] NVARCHAR(5),
  [Proveedor] NVARCHAR(10),
  [Albaran] NVARCHAR(10),
  [Cdad] REAL,
  [UnidadesEmbalaje] REAL,
  [MetUdEmb] REAL,
  [Metraje] REAL,
  [Ancho] REAL,
  [Largo] REAL,
  [Observaciones] NVARCHAR(255),
  [ConsumidoSN] BOOLEAN NOT NULL,
  [FechaConsumo] DATE,
  [DevolucionSN] BOOLEAN NOT NULL,
  [DevCliente] NVARCHAR(10),
  [DevIdContOrig] INTEGER,
  [FechaEntrada] DATE,
  [NumFabArt] NVARCHAR(20),
  [AnuladoSN] BOOLEAN NOT NULL,
  [ConsumidoParcialSN] BOOLEAN NOT NULL,
  [ConsumidoCdad] REAL,
  [ConsumidoMetraje] REAL,
  [CAlb_Proveedor] NVARCHAR(10),
  [CAlb_Numero] NVARCHAR(20),
  [CAlb_nLinea] INTEGER,
  [Coste] REAL,
  [AcumulacionSN] BOOLEAN NOT NULL,
  [ArtUdsEmb] NVARCHAR(6),
  [PendienteEntradaSN] BOOLEAN NOT NULL,
  [FechaEntradaPend] DATE,
  [CPed_Numero] NVARCHAR(20),
  [AnuladoMotivo] NVARCHAR(255),
  [ContenedorAjusteSN] BOOLEAN NOT NULL,
  [UbicStock] NVARCHAR(10),
  PRIMARY KEY ([Id])
);

-- ===== StockContenedoresHist  (filas: 0) =====
CREATE TABLE [StockContenedoresHist] (
  [nLinea] INTEGER NOT NULL,
  [IdCont] INTEGER NOT NULL,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  [AlmacenHist] NVARCHAR(11),
  [ConsumidoCdad] REAL,
  [ConsumidoMetraje] REAL,
  [numVPed] NVARCHAR(20),
  [TipoReg] NVARCHAR(7),
  [Consumo_VAlb_Numero] NVARCHAR(20),
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== Subfamilias  (filas: 270) =====
CREATE TABLE [Subfamilias] (
  [Familia] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [MargenesSN] BOOLEAN NOT NULL,
  [Margen1] REAL,
  [Margen2] REAL,
  [Margen3] REAL,
  [Margen4] REAL,
  [Margen5] REAL,
  [Margen6] REAL,
  [Margen7] REAL,
  [Margen8] REAL,
  [TarifaProvSN] BOOLEAN NOT NULL,
  [TPproveedor] NVARCHAR(10),
  [TPseleccionadoSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [UsuarioEspecSN] BOOLEAN NOT NULL,
  [VidRecCurSN] BOOLEAN NOT NULL,
  [VidRecCurMP] REAL,
  [VidRecCurReb] REAL,
  [VidRecCurCarp2R] REAL,
  [VidRecCurCarp3R] REAL,
  [VidRecCurCirc] REAL,
  [VidRecCurForma] REAL,
  [PerfUnicoSN] BOOLEAN NOT NULL,
  [PedidosAutoSubSN] BOOLEAN NOT NULL,
  [PedidosAutoSN] BOOLEAN NOT NULL,
  [PedidosAutoOptSN] BOOLEAN NOT NULL,
  [ObservacionesTarXLS] NVARCHAR(150),
  [UsuarioSN] BOOLEAN NOT NULL,
  [ExportaTarSN] BOOLEAN NOT NULL,
  [Codigo] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Familia], [Codigo])
);

-- ===== TAcrisLstJunq  (filas: 13) =====
CREATE TABLE [TAcrisLstJunq] (
  [Codigo] NVARCHAR(4),
  [Descripcion] NVARCHAR(40),
  [TipoJunq] NVARCHAR(1),
  PRIMARY KEY ([Codigo])
);

-- ===== TAcrisLstJunqLin  (filas: 45) =====
CREATE TABLE [TAcrisLstJunqLin] (
  [nLinea] INTEGER NOT NULL,
  [CodLstJunq] NVARCHAR(4),
  [CodJunquillo] NVARCHAR(15),
  PRIMARY KEY ([nLinea])
);

-- ===== TAcristalamiento  (filas: 88) =====
CREATE TABLE [TAcristalamiento] (
  [Codigo] NVARCHAR(4),
  [Descripcion] NVARCHAR(40),
  [TipoMS] NVARCHAR(1),
  [TipoJunq] NVARCHAR(1),
  [JunqGraPeq] NVARCHAR(1),
  [JunqExtSN] BOOLEAN NOT NULL,
  [BibliotecaSN] BOOLEAN NOT NULL,
  [UsuarioSN] BOOLEAN NOT NULL,
  [IncrJunq] REAL,
  [GrapaH] NVARCHAR(15),
  [GrapaV] NVARCHAR(15),
  [LongitGrapa] REAL,
  [IntervaloGrapa] REAL,
  [CalzoH] NVARCHAR(15),
  [CalzoV] NVARCHAR(15),
  [LongitCalzo] REAL,
  [IntervaloCalzo] REAL,
  [nCalzosMin] REAL,
  [NudosSN] BOOLEAN NOT NULL,
  [CodNudo] NVARCHAR(15),
  [DtoNudoJH] REAL,
  [DtoNudoJV] REAL,
  [GomaIntSN] BOOLEAN NOT NULL,
  [GomaExtSN] BOOLEAN NOT NULL,
  [GomaInt1] NVARCHAR(15),
  [GomaInt2] NVARCHAR(15),
  [GomaInt3] NVARCHAR(15),
  [GomaInt4] NVARCHAR(15),
  [GomaInt5] NVARCHAR(15),
  [GomaInt6] NVARCHAR(15),
  [GomaInt7] NVARCHAR(15),
  [GomaInt8] NVARCHAR(15),
  [GomaExt1] NVARCHAR(15),
  [GomaExt2] NVARCHAR(15),
  [GomaExt3] NVARCHAR(15),
  [GomaExt4] NVARCHAR(15),
  [GomaExt5] NVARCHAR(15),
  [GomaExt6] NVARCHAR(15),
  [GomaExt7] NVARCHAR(15),
  [GomaExt8] NVARCHAR(15),
  [CodLstJunq] NVARCHAR(4),
  [CodLstJunqV] NVARCHAR(4),
  [GalceMax] REAL,
  [SuplemDtoH] REAL,
  [SuplemDtoV] REAL,
  [SuplemIncr] REAL,
  [Suplemento] NVARCHAR(15),
  [CambioDimSN] BOOLEAN NOT NULL,
  [CambioDimHorizCL] NVARCHAR(1),
  [IntervaloGrapaVert] REAL,
  [nGrapasMin] REAL,
  [nGrapasMinVert] REAL,
  [IntervaloCalzoVert] REAL,
  [nCalzosMinVert] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== TAcristalamientoLin  (filas: 1098) =====
CREATE TABLE [TAcristalamientoLin] (
  [nLinea] INTEGER NOT NULL,
  [TAcris] NVARCHAR(4),
  [Pos] NVARCHAR(7),
  [Junquillo] NVARCHAR(15),
  [JuntaExt] NVARCHAR(15),
  [JuntaInt] NVARCHAR(15),
  [Grosor] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== TarDinArticuloGruposIncrementos  (filas: 0) =====
CREATE TABLE [TarDinArticuloGruposIncrementos] (
  [GrupoIncrementos] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([GrupoIncrementos])
);

-- ===== TarDinArticuloTamaños  (filas: 1) =====
CREATE TABLE [TarDinArticuloTamaños] (
  [TamañoArticulo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([TamañoArticulo])
);

-- ===== TarDinArticuloTipos  (filas: 0) =====
CREATE TABLE [TarDinArticuloTipos] (
  [TipoArticulo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [PrecioBase] REAL,
  [UltimaAct] DATE,
  [FormulaPrecioUdMetraje] NVARCHAR(50),
  [IncrementoBase] REAL,
  PRIMARY KEY ([TipoArticulo])
);

-- ===== TarDinClienteArticulosTipos  (filas: 0) =====
CREATE TABLE [TarDinClienteArticulosTipos] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [TipoArticulo] NVARCHAR(10) NOT NULL,
  [TarifaDinamicaSN] BOOLEAN NOT NULL,
  [PrecioBaseEspecialSN] BOOLEAN NOT NULL,
  [PrecioBase] REAL,
  [UltimaAct] DATE,
  [FormulaPrecioUdMetraje] NVARCHAR(50),
  [IncrementoBaseEspecialSN] BOOLEAN NOT NULL,
  [IncrementoBase] REAL,
  PRIMARY KEY ([Cliente], [TipoArticulo])
);

-- ===== TarDinClienteDescuentos  (filas: 0) =====
CREATE TABLE [TarDinClienteDescuentos] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Subfamilia] NVARCHAR(10),
  [PrecioBaseTipoArtDesde] REAL,
  [PrecioBaseTipoArtHasta] REAL,
  [Descuento] REAL,
  [Descuento2] REAL,
  [UltimaAct] DATE,
  [GrupoAcabados] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== TarDinClienteDescuentosVariacion  (filas: 0) =====
CREATE TABLE [TarDinClienteDescuentosVariacion] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [MetrajeDesde] REAL,
  [MetrajeHasta] REAL,
  [DescuentoVariacion] REAL,
  [Descuento2Variacion] REAL,
  [UltimaAct] DATE,
  PRIMARY KEY ([nLinea])
);

-- ===== TarDinClienteGruposAca  (filas: 0) =====
CREATE TABLE [TarDinClienteGruposAca] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [GrupoAcabados] NVARCHAR(10) NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [FamiliaAcabados] NVARCHAR(10),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== TarDinClientePrecios  (filas: 0) =====
CREATE TABLE [TarDinClientePrecios] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [GrupoAcabados] NVARCHAR(10) NOT NULL,
  [TipoArticulo] NVARCHAR(10) NOT NULL,
  [TamañoArticulo] NVARCHAR(10) NOT NULL,
  [MetrajeDesde] REAL NOT NULL,
  [MetrajeHasta] REAL NOT NULL,
  [Precio] REAL,
  [UltimaAct] DATE,
  [nLinea] INTEGER NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== TarDinGruposAcabados  (filas: 0) =====
CREATE TABLE [TarDinGruposAcabados] (
  [GrupoAcabados] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [AcabadoPrincipal] NVARCHAR(10),
  PRIMARY KEY ([GrupoAcabados])
);

-- ===== TarDinIncrementoGrupoIncrementos  (filas: 0) =====
CREATE TABLE [TarDinIncrementoGrupoIncrementos] (
  [TipoArticulo] NVARCHAR(10) NOT NULL,
  [TamañoArticulo] NVARCHAR(10) NOT NULL,
  [GrupoIncrementos] NVARCHAR(10) NOT NULL,
  [Incremento] REAL,
  [UltimaAct] DATE,
  PRIMARY KEY ([TipoArticulo], [TamañoArticulo], [GrupoIncrementos])
);

-- ===== TarDinIncrementoTonalidad  (filas: 0) =====
CREATE TABLE [TarDinIncrementoTonalidad] (
  [TipoArticulo] NVARCHAR(10) NOT NULL,
  [TamañoArticulo] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Incremento] REAL,
  [UltimaAct] DATE,
  PRIMARY KEY ([TipoArticulo], [TamañoArticulo], [AcaTonalidad])
);

-- ===== Tarifas  (filas: 4) =====
CREATE TABLE [Tarifas] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [TarifaVentaSN] BOOLEAN NOT NULL,
  [OrdenCalc] SMALLINT,
  [TarifaCosteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== TarifasDatos  (filas: 1) =====
CREATE TABLE [TarifasDatos] (
  [Proveedor] NVARCHAR(10) NOT NULL,
  [UbicacionFicheros] NVARCHAR(100),
  [PrefijoArts] NVARCHAR(4),
  [FamiliaDeArtEnSerSN] BOOLEAN NOT NULL,
  [AcabadoUnico] NVARCHAR(10),
  [TipoMetrajeFamSN] BOOLEAN NOT NULL,
  [FamUds1] NVARCHAR(10),
  [FamUds2] NVARCHAR(10),
  [FamUds3] NVARCHAR(10),
  [FamUds4] NVARCHAR(10),
  [FamUds5] NVARCHAR(10),
  [FamUds6] NVARCHAR(10),
  [FamUds7] NVARCHAR(10),
  [FamUds8] NVARCHAR(10),
  [FamUds9] NVARCHAR(10),
  [FamUds10] NVARCHAR(10),
  [FamML1] NVARCHAR(10),
  [FamML2] NVARCHAR(10),
  [FamML3] NVARCHAR(10),
  [FamML4] NVARCHAR(10),
  [FamML5] NVARCHAR(10),
  [FamML6] NVARCHAR(10),
  [FamML7] NVARCHAR(10),
  [FamML8] NVARCHAR(10),
  [FamML9] NVARCHAR(10),
  [FamML10] NVARCHAR(10),
  [FamM21] NVARCHAR(10),
  [FamM22] NVARCHAR(10),
  [FamM23] NVARCHAR(10),
  [FamM24] NVARCHAR(10),
  [FamM25] NVARCHAR(10),
  [FamM26] NVARCHAR(10),
  [FamM27] NVARCHAR(10),
  [FamM28] NVARCHAR(10),
  [FamM29] NVARCHAR(10),
  [FamM210] NVARCHAR(10),
  [FamAcaUni1] NVARCHAR(10),
  [FamAcaUni2] NVARCHAR(10),
  [FamAcaUni3] NVARCHAR(10),
  [FamAcaUni4] NVARCHAR(10),
  [FamAcaUni5] NVARCHAR(10),
  [UbicacionBase] NVARCHAR(255),
  [CalcularPVP] BOOLEAN NOT NULL,
  [BorrarPVP] BOOLEAN NOT NULL,
  [FiltrarDatos] BOOLEAN NOT NULL,
  [CambiarCodigosAcabados] BOOLEAN NOT NULL,
  [ForzarDeUsuario] BOOLEAN NOT NULL,
  [ForzarAcabadoUNI] BOOLEAN NOT NULL,
  [ImportarIdiomas] BOOLEAN NOT NULL,
  [CampoCoste] BOOLEAN NOT NULL,
  [CampoDescr] BOOLEAN NOT NULL,
  [CampoFam] BOOLEAN NOT NULL,
  [CampoSubFam] BOOLEAN NOT NULL,
  [CampoTipoMet] BOOLEAN NOT NULL,
  [CampoPeso] BOOLEAN NOT NULL,
  [CampoPerim] BOOLEAN NOT NULL,
  [CampoDimLargoAncho] BOOLEAN NOT NULL,
  [CampoTipoArt] BOOLEAN NOT NULL,
  [CampoAlturaPerf] BOOLEAN NOT NULL,
  [CampoTamJunqGoma] BOOLEAN NOT NULL,
  [CampoUdEmb] BOOLEAN NOT NULL,
  [CampoMetEmb] BOOLEAN NOT NULL,
  [CampoInfoRpt] BOOLEAN NOT NULL,
  [CampoTarifaCB] BOOLEAN NOT NULL,
  [CampoInfoAca] BOOLEAN NOT NULL,
  [CampoMetMult] BOOLEAN NOT NULL,
  [CampoMetMin] BOOLEAN NOT NULL,
  [CampoAcaDescr] BOOLEAN NOT NULL,
  [CampoAcaCosteCalc] BOOLEAN NOT NULL,
  [CampoAcaCoste] BOOLEAN NOT NULL,
  [CampoAcaPlast] BOOLEAN NOT NULL,
  [CampoAcaLijado] BOOLEAN NOT NULL,
  [CampoAcaPrecioLija] BOOLEAN NOT NULL,
  [CampoAcaFoliado] BOOLEAN NOT NULL,
  [CampoArtCodProv] BOOLEAN NOT NULL,
  [CampoArtDescrProv] BOOLEAN NOT NULL,
  [CampoArtCodEmb] BOOLEAN NOT NULL,
  [CampoArtDescrEmb] BOOLEAN NOT NULL,
  [CampoArtUdEmb] BOOLEAN NOT NULL,
  [CampoArtCdadEmb] BOOLEAN NOT NULL,
  [CampoArtMetMinEmb] BOOLEAN NOT NULL,
  [ImportarTiposArt] BOOLEAN NOT NULL,
  [ImportarTonalidades] BOOLEAN NOT NULL,
  [CostesNetos] BOOLEAN NOT NULL,
  [ImportarDobleAcrist] BOOLEAN NOT NULL,
  [ImportarIncrementos] BOOLEAN NOT NULL,
  [ImportarCostesNetos] BOOLEAN NOT NULL,
  [IdBibliotecaGaia] SMALLINT,
  [PrecioTabla] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [ActDivisaPrincipal] BOOLEAN NOT NULL,
  [ActGastosCoste] BOOLEAN NOT NULL,
  PRIMARY KEY ([Proveedor])
);

-- ===== TarifasGuardadas  (filas: 0) =====
CREATE TABLE [TarifasGuardadas] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [NumeroTarifa] SMALLINT NOT NULL,
  [TarifaAplicada] NVARCHAR(5),
  [FechaCalculo] DATE,
  PRIMARY KEY ([Cliente], [NumeroTarifa])
);

-- ===== TarifasGuardadasLineas  (filas: 0) =====
CREATE TABLE [TarifasGuardadasLineas] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [NumeroTarifa] SMALLINT NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Precio] REAL,
  [DescuentoPorc] REAL,
  [PrecioNeto] REAL,
  [OrigenPrecio] NVARCHAR(8),
  [OrigenDescuento] NVARCHAR(30),
  [Descuento2Porc] REAL,
  PRIMARY KEY ([Cliente], [NumeroTarifa], [Articulo], [Acabado])
);

-- ===== TarifasTransformacion  (filas: 1) =====
CREATE TABLE [TarifasTransformacion] (
  [Codigo] NVARCHAR(1) NOT NULL,
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== TDRegistro  (filas: 6080) =====
CREATE TABLE [TDRegistro] (
  [id] INTEGER NOT NULL,
  [Tabla] NVARCHAR(40),
  [CodigoId] NVARCHAR(15),
  [CodigoNum] NVARCHAR(15),
  [Fecha] DATE,
  [Hora] DATE,
  PRIMARY KEY ([id])
);

-- ===== TextosPresupuestos  (filas: 1) =====
CREATE TABLE [TextosPresupuestos] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(30),
  [Texto] NVARCHAR,
  PRIMARY KEY ([Codigo])
);

-- ===== TiposDocumento  (filas: 0) =====
CREATE TABLE [TiposDocumento] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(60),
  [ValidoVPresupuestoSN] BOOLEAN NOT NULL,
  [ValidoVPedidoSN] BOOLEAN NOT NULL,
  [ValidoVAlbaranSN] BOOLEAN NOT NULL,
  [ValidoVFacturaSN] BOOLEAN NOT NULL,
  [ValidoVFacturaRectificativaSN] BOOLEAN NOT NULL,
  [ValidoCPedidoSN] BOOLEAN NOT NULL,
  [ValidoCAlbaranSN] BOOLEAN NOT NULL,
  [ValidoCFacturaSN] BOOLEAN NOT NULL,
  [ValidoCGastoSN] BOOLEAN NOT NULL,
  [CodigoContabilidad] NVARCHAR(5),
  [ValidoFabricacionArtSN] BOOLEAN NOT NULL,
  [NoGenerarVencimientosVFacSN] BOOLEAN NOT NULL,
  [NoGenerarVencimientosCFacSN] BOOLEAN NOT NULL,
  [NoFacturarCAlbCeroSN] BOOLEAN NOT NULL,
  [NoFacturarVAlbCeroSN] BOOLEAN NOT NULL,
  [NoActStockVentasSN] BOOLEAN NOT NULL,
  [NoComputarVentasPendSN] BOOLEAN NOT NULL,
  [BloqueoVFacturaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== TiposIDfiscal  (filas: 0) =====
CREATE TABLE [TiposIDfiscal] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(60),
  PRIMARY KEY ([Codigo])
);

-- ===== TiposImpuestoRetenido  (filas: 0) =====
CREATE TABLE [TiposImpuestoRetenido] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [ImpuestoPorc] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== TiposIVA  (filas: 8) =====
CREATE TABLE [TiposIVA] (
  [IVAporc] REAL,
  [RecargoPorc] REAL,
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [Origen] NVARCHAR(50),
  [CodigoContabilidadCompras] NVARCHAR(5),
  [CodigoContabilidadVentas] NVARCHAR(5),
  [IVAautoSN] BOOLEAN NOT NULL,
  [IVAporcAuto] REAL,
  [CtaIVAautoRep] NVARCHAR(15),
  [CtaIVAautoSop] NVARCHAR(15),
  [TipoIVAauto] NVARCHAR(2),
  [CtaIVARep] NVARCHAR(15),
  [CtaIVARepRE] NVARCHAR(15),
  [CtaIVASop] NVARCHAR(15),
  [CtaIVARE] NVARCHAR(15),
  [Sigla] NVARCHAR(10),
  [CodigoContabilidadOrigen] NVARCHAR(5),
  [CodigoContabilidadImpreso] NVARCHAR(5),
  [CodigoContabilidadVentasRecargo] NVARCHAR(5),
  [NoIncluirModelo347SN] BOOLEAN NOT NULL,
  [CodigoContabilidadClave340] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== TiposIVAarticulos  (filas: 0) =====
CREATE TABLE [TiposIVAarticulos] (
  [nLinea] INTEGER NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(60) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Tonalidad] NVARCHAR(10) NOT NULL,
  [Prioridad] SMALLINT,
  [TipoIVA] NVARCHAR(2),
  [TipoIVAavanzadoSN] BOOLEAN NOT NULL,
  [TipoIVALB] NVARCHAR(2),
  [TipoIVAMedida] NVARCHAR(2),
  PRIMARY KEY ([nLinea])
);

-- ===== TiposLetra  (filas: 16) =====
CREATE TABLE [TiposLetra] (
  [Impresora] NVARCHAR(40),
  [letraNormal] NVARCHAR(50),
  [tamanyoNormal] SMALLINT,
  [letraCompr] NVARCHAR(50),
  [tamanyoCompr] SMALLINT,
  [nLineasPagina] SMALLINT,
  [MargenIzquierdo] SMALLINT,
  PRIMARY KEY ([Impresora])
);

-- ===== TiposRetencion  (filas: 0) =====
CREATE TABLE [TiposRetencion] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(50),
  [RetencionPorcentaje] REAL,
  [CuentaContable] NVARCHAR(15),
  [CodigoContabilidad] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== TiposVenta  (filas: 0) =====
CREATE TABLE [TiposVenta] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(30),
  [AFIPcodigoConcepto] SMALLINT,
  PRIMARY KEY ([Codigo])
);

-- ===== tmpAcabados  (filas: 112) =====
CREATE TABLE [tmpAcabados] (
  [CodImp] NVARCHAR(10),
  [Descripcion] NVARCHAR(40),
  [CodPrg] NVARCHAR(10),
  PRIMARY KEY ([CodImp])
);

-- ===== tmpArticulosSeries  (filas: 0) =====
CREATE TABLE [tmpArticulosSeries] (
  [codArticulo] NVARCHAR(15),
  [codSerie] NVARCHAR(3),
  PRIMARY KEY ([codArticulo], [codSerie])
);

-- ===== Trabajadores  (filas: 0) =====
CREATE TABLE [Trabajadores] (
  [Codigo] NVARCHAR(5),
  [Nombre] NVARCHAR(40),
  [Direccion] NVARCHAR(150),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Observaciones] NVARCHAR,
  [NumSS] NVARCHAR(20),
  [CasadoSN] BOOLEAN NOT NULL,
  [NombreConyuge] NVARCHAR(40),
  [NumeroHijos] SMALLINT,
  [MontadorSN] BOOLEAN NOT NULL,
  [Carnet] NVARCHAR(15),
  [Categoria] NVARCHAR(10),
  [UsuarioAgenda] NVARCHAR(30),
  [ObConcepto] NVARCHAR(5),
  [Grupo] NVARCHAR(5),
  [HorasDiarias] REAL,
  [UTTPrecioUdFabr] REAL,
  [MOfase] NVARCHAR(3),
  [HoraTarde] DATE,
  [FechaAlta] DATE,
  [FechaNacimiento] DATE,
  [Movil] NVARCHAR(20),
  [EmpMovil] NVARCHAR(20),
  [EmpExtension] NVARCHAR(5),
  [BajaSN] BOOLEAN NOT NULL,
  [FechaBaja] DATE,
  [MotivoBaja] NVARCHAR(255),
  [PlanProdSN] BOOLEAN NOT NULL,
  [HorarioEspecificoSN] BOOLEAN NOT NULL,
  [Horario] NVARCHAR(2),
  [UTTrelPrecioDiaExtra] REAL,
  [UTTrelPrecioDiaExtraVac] REAL,
  [UTTrelPrecioHoraExtra] REAL,
  [NIF] NVARCHAR(30),
  [NIFConyuge] NVARCHAR(30),
  [EmpEMail] NVARCHAR(150),
  [eMail] NVARCHAR(150),
  [TerminalTallerSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2),
  [Pais] NVARCHAR(10),
  [CP] NVARCHAR(20),
  [TTListaEquiposVisible] NVARCHAR,
  [RepartidorSN] BOOLEAN NOT NULL,
  [ProdWebAccesoSN] BOOLEAN NOT NULL,
  [ProdWebLoginEMail] NVARCHAR(100),
  [ProdWebPasswordHash] NVARCHAR(40),
  [tmpSeccion] NVARCHAR(30),
  [tmpFuncion] NVARCHAR(30),
  [TTOrden] SMALLINT,
  [eAlbAccesoSN] BOOLEAN NOT NULL,
  [eAlbNombreUsuario] NVARCHAR(40),
  [eAlbPasswordHash] NVARCHAR(40),
  [TTListaUsuariosAppVisible] NVARCHAR(255),
  [TipoContrato] NVARCHAR(20),
  [BloqueoNoCopiarHorarioSN] BOOLEAN NOT NULL,
  [HorarioRotativoSN] BOOLEAN NOT NULL,
  [HorarioExcepcionesSN] BOOLEAN NOT NULL,
  [TTMobileAccesoSN] BOOLEAN NOT NULL,
  [TTMobileNombreUsuario] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== TrabajadoresFasesObCon  (filas: 0) =====
CREATE TABLE [TrabajadoresFasesObCon] (
  [Trabajador] NVARCHAR(5),
  [MOFase] NVARCHAR(3),
  [ObConcepto] NVARCHAR(5),
  PRIMARY KEY ([Trabajador], [MOFase])
);

-- ===== TrabajadoresFormacion  (filas: 0) =====
CREATE TABLE [TrabajadoresFormacion] (
  [nLinea] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5),
  [Ejercicio] INTEGER,
  [Curso] NVARCHAR(50),
  [Descripcion] NVARCHAR(255),
  [Responsable] NVARCHAR(30),
  [FechaIni] DATE,
  [FechaFin] DATE,
  [Resultado] NVARCHAR(20),
  [Evaluacion] SMALLINT,
  [EvaluadoPor] NVARCHAR(30),
  [FechaEvaluacion] DATE,
  PRIMARY KEY ([nLinea])
);

-- ===== TrabajadoresHorario  (filas: 0) =====
CREATE TABLE [TrabajadoresHorario] (
  [Trabajador] NVARCHAR(5) NOT NULL,
  [DiaSemana] NVARCHAR(1) NOT NULL,
  [ManyanaTardeMT] NVARCHAR(1) NOT NULL,
  [HoraEntrada] DATE,
  [HoraSalida] DATE,
  [TodasHorasExtraSN] BOOLEAN NOT NULL,
  [PlanProdPorcentaje] SMALLINT,
  PRIMARY KEY ([Trabajador], [DiaSemana], [ManyanaTardeMT])
);

-- ===== TrabajadoresHorarioExcepcion  (filas: 0) =====
CREATE TABLE [TrabajadoresHorarioExcepcion] (
  [Trabajador] NVARCHAR(5) NOT NULL,
  [FechaDesde] DATE NOT NULL,
  [FechaHasta] DATE NOT NULL,
  [Horario] NVARCHAR(2),
  PRIMARY KEY ([Trabajador], [FechaDesde], [FechaHasta])
);

-- ===== TrabajadoresHorarioRotativo  (filas: 0) =====
CREATE TABLE [TrabajadoresHorarioRotativo] (
  [Trabajador] NVARCHAR(5) NOT NULL,
  [FechaDesde] DATE NOT NULL,
  [FechaHasta] DATE NOT NULL,
  [IntervaloRotacionDias] SMALLINT,
  [ListaHorarios] NVARCHAR(100),
  PRIMARY KEY ([Trabajador], [FechaDesde], [FechaHasta])
);

-- ===== TrabajadoresIncidencias  (filas: 0) =====
CREATE TABLE [TrabajadoresIncidencias] (
  [nLinea] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5),
  [Seccion] NVARCHAR(30),
  [Fecha] DATE,
  [Hora] DATE,
  [Descripcion] NVARCHAR(255),
  [CausaBajaSN] BOOLEAN NOT NULL,
  [BajaFechaIni] DATE,
  [BajaFechaFin] DATE,
  [Observaciones] NVARCHAR,
  [BajaTipo] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== TrabajadoresPrendas  (filas: 0) =====
CREATE TABLE [TrabajadoresPrendas] (
  [nLinea] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5),
  [Prenda] NVARCHAR(30),
  [Talla] NVARCHAR(5),
  [FechaEntrega] DATE,
  [Cantidad] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== TrabajadoresPuestos  (filas: 0) =====
CREATE TABLE [TrabajadoresPuestos] (
  [nLinea] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5),
  [Seccion] NVARCHAR(30),
  [Funcion] NVARCHAR(30),
  [FechaIni] DATE,
  [FechaFin] DATE,
  [Observaciones] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== TrabajadoresSecciones  (filas: 0) =====
CREATE TABLE [TrabajadoresSecciones] (
  [Nombre] NVARCHAR(30) NOT NULL,
  [TrabResponsable] NVARCHAR(5),
  [VCPFAutorizaRecogidaSN] BOOLEAN NOT NULL,
  [VCPFgaNotUsuarioAutRecogida] NVARCHAR(30),
  [VCPFAutorizaAbonoSN] BOOLEAN NOT NULL,
  [VCPFgaNotUsuarioAutAbono] NVARCHAR(30),
  [VCPFAutorizaReposicionSN] BOOLEAN NOT NULL,
  [VCPFgaNotUsuarioAutReposicion] NVARCHAR(30),
  [TrabLunesSN] BOOLEAN NOT NULL,
  [TrabMartesSN] BOOLEAN NOT NULL,
  [TrabMiercolesSN] BOOLEAN NOT NULL,
  [TrabJuevesSN] BOOLEAN NOT NULL,
  [TrabViernesSN] BOOLEAN NOT NULL,
  [TrabSabadoSN] BOOLEAN NOT NULL,
  [TrabDomingoSN] BOOLEAN NOT NULL,
  [PlanProdSN] BOOLEAN NOT NULL,
  [PlanProdPorcentajeMaxHorasPed] SMALLINT,
  [PlanProdDespuesSeccionSN] BOOLEAN NOT NULL,
  [PlanProdDespuesSeccion] NVARCHAR(30),
  [Delegaciones] NVARCHAR(150),
  [NombreAbreviado] NVARCHAR(10),
  [OrdenLista] SMALLINT,
  PRIMARY KEY ([Nombre])
);

-- ===== TrabajadoresSeccionesDiasEsp  (filas: 0) =====
CREATE TABLE [TrabajadoresSeccionesDiasEsp] (
  [Seccion] NVARCHAR(30) NOT NULL,
  [Fecha] DATE NOT NULL,
  [Tipo_LAB_NOLAB] NVARCHAR(5),
  [Observaciones] NVARCHAR(30),
  PRIMARY KEY ([Seccion], [Fecha])
);

-- ===== TrabajadoresSeccionesFunciones  (filas: 0) =====
CREATE TABLE [TrabajadoresSeccionesFunciones] (
  [Seccion] NVARCHAR(30) NOT NULL,
  [Nombre] NVARCHAR(30) NOT NULL,
  PRIMARY KEY ([Seccion], [Nombre])
);

-- ===== TrabajadoresSeccionesPlanProdArtMO  (filas: 0) =====
CREATE TABLE [TrabajadoresSeccionesPlanProdArtMO] (
  [nLinea] INTEGER NOT NULL,
  [Seccion] NVARCHAR(30) NOT NULL,
  [ArticuloMO] NVARCHAR(15),
  PRIMARY KEY ([nLinea])
);

-- ===== TrabajadoresTiposContrato  (filas: 0) =====
CREATE TABLE [TrabajadoresTiposContrato] (
  [Tipo] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Tipo])
);

-- ===== TrabajadoresTiposVacaciones  (filas: 2) =====
CREATE TABLE [TrabajadoresTiposVacaciones] (
  [Tipo] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([Tipo])
);

-- ===== TrabajadoresVac  (filas: 0) =====
CREATE TABLE [TrabajadoresVac] (
  [nLinea] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5),
  [FechaIni] DATE,
  [FechaFin] DATE,
  [Observaciones] NVARCHAR(255),
  [TipoVac] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== TrabGrupos  (filas: 0) =====
CREATE TABLE [TrabGrupos] (
  [Codigo] NVARCHAR(5),
  [Nombre] NVARCHAR(40),
  [Encargado] NVARCHAR(5),
  PRIMARY KEY ([Codigo])
);

-- ===== UAvisosVersion  (filas: 40) =====
CREATE TABLE [UAvisosVersion] (
  [Id] INTEGER NOT NULL,
  [Fecha] NVARCHAR(15),
  [Referencia] NVARCHAR(20),
  [Titulo] NVARCHAR(80),
  [TextoAviso] NVARCHAR,
  [LeidoSN] BOOLEAN NOT NULL,
  [Documentos] NVARCHAR(250),
  [enlace] NVARCHAR(255),
  [idTipoProgramaValido] SMALLINT,
  PRIMARY KEY ([Id])
);

-- ===== UCEcaracteristicas  (filas: 0) =====
CREATE TABLE [UCEcaracteristicas] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [OrdenEtiqueta] SMALLINT,
  [AvisoSinValorSN] BOOLEAN NOT NULL,
  [valorSerieSN] BOOLEAN NOT NULL,
  [valorVidrioSN] BOOLEAN NOT NULL,
  [valorCompactoSN] BOOLEAN NOT NULL,
  [valorTipo_NUM_TXT] NVARCHAR(3),
  [valorNumPeor_MAYOR_MENOR] NVARCHAR(5),
  [asistExcepcionLstEstrSN] BOOLEAN NOT NULL,
  [asistExcepcionLstEstr] NVARCHAR(255),
  [asistExcepcionLstEstrValor] NVARCHAR(30),
  [asistSerieRangoMedidasSN] BOOLEAN NOT NULL,
  [LaboratorioSN] BOOLEAN NOT NULL,
  [MobileCE_Codigo] NVARCHAR(10),
  [FiltroMedMetConjuntoORsn] BOOLEAN NOT NULL,
  [NoIncluirSinValorSN] BOOLEAN NOT NULL,
  [NormaOrigen] NVARCHAR(20),
  [Norma] NVARCHAR(255),
  [asistCalculaSuperficieSN] BOOLEAN NOT NULL,
  [asistIncrementoSuperficie] REAL,
  [CEnoValidoSinValorSN] BOOLEAN NOT NULL,
  [InformeOrigen] NVARCHAR(20),
  [Informe] NVARCHAR(255),
  PRIMARY KEY ([Codigo])
);

-- ===== UCEcaracteristicasEscalaValores  (filas: 0) =====
CREATE TABLE [UCEcaracteristicasEscalaValores] (
  [CEcaracteristica] NVARCHAR(2) NOT NULL,
  [Valor] NVARCHAR(30) NOT NULL,
  [Orden] SMALLINT,
  PRIMARY KEY ([CEcaracteristica], [Valor])
);

-- ===== UCEcaracteristicasValorElemento  (filas: 0) =====
CREATE TABLE [UCEcaracteristicasValorElemento] (
  [TipoElemento] NVARCHAR(10) NOT NULL,
  [codigoElemento] NVARCHAR(15) NOT NULL,
  [CEcaracteristica] NVARCHAR(2) NOT NULL,
  [Valor] NVARCHAR(30),
  [nLinea] INTEGER NOT NULL,
  [AnchoDesde] SMALLINT,
  [AnchoHasta] SMALLINT,
  [AltoDesde] SMALLINT,
  [AltoHasta] SMALLINT,
  [laboratorio] NVARCHAR(5),
  [lstEstructura] NVARCHAR(255),
  [MetrajeDesde] REAL,
  [MetrajeHasta] REAL,
  [Norma] NVARCHAR(30),
  [Informe] NVARCHAR(60),
  PRIMARY KEY ([nLinea])
);

-- ===== UCEcaracteristicasValores  (filas: 0) =====
CREATE TABLE [UCEcaracteristicasValores] (
  [nLinea] INTEGER NOT NULL,
  [CEcaracteristica] NVARCHAR(2) NOT NULL,
  [Serie] NVARCHAR(15),
  [lstEstructura] NVARCHAR(255),
  [lstFamEstr] NVARCHAR(60),
  [Vidrio] NVARCHAR(15),
  [PersianaSiNo] NVARCHAR(2),
  [AnchoDesde] SMALLINT,
  [AnchoHasta] SMALLINT,
  [AltoDesde] SMALLINT,
  [AltoHasta] SMALLINT,
  [MetrajeDesde] REAL,
  [MetrajeHasta] REAL,
  [Prioridad] SMALLINT,
  [Valor] NVARCHAR(30),
  [Compacto] NVARCHAR(15),
  [BloqueoSN] BOOLEAN NOT NULL,
  [lstLaboratorios] NVARCHAR(17),
  [AnchoEnsayo] SMALLINT,
  [AltoEnsayo] SMALLINT,
  [MobileCE_Aplicacion] NVARCHAR(15),
  [MobileCE_Uso] NVARCHAR(15),
  [MobileCE_Material] NVARCHAR(5),
  [EstructuraEnsayo] NVARCHAR(14),
  [CompF_lstLama] NVARCHAR(255),
  [CompF_lstAccionamiento] NVARCHAR(255),
  [Norma] NVARCHAR(255),
  [CEnoValidoSN] BOOLEAN NOT NULL,
  [Informe] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== UCEcontrolesFabricacion  (filas: 0) =====
CREATE TABLE [UCEcontrolesFabricacion] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [AplicableA] NVARCHAR(15),
  [Frecuencia] NVARCHAR(40),
  [Orden] SMALLINT,
  [TipoControl] NVARCHAR(12),
  PRIMARY KEY ([Codigo])
);

-- ===== UCEcontrolesFabricacionIncidencias  (filas: 0) =====
CREATE TABLE [UCEcontrolesFabricacionIncidencias] (
  [CodigoControl] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Tipo_INC_NC] NVARCHAR(30),
  [Gravedad] SMALLINT,
  [CodigoIncidencia] NVARCHAR(5) NOT NULL,
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [SumaUnidadesSiYaExisteEnFaseSN] BOOLEAN NOT NULL,
  [VPedMaterialPendienteSN] BOOLEAN NOT NULL,
  [VCPFTipoIncidencia] NVARCHAR(3),
  PRIMARY KEY ([CodigoControl], [CodigoIncidencia])
);

-- ===== UCEcontrolesFabricacionResponsables  (filas: 0) =====
CREATE TABLE [UCEcontrolesFabricacionResponsables] (
  [CodigoControl] NVARCHAR(3) NOT NULL,
  [CodigoResponsable] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(40),
  PRIMARY KEY ([CodigoControl], [CodigoResponsable])
);

-- ===== UCEcontrolesFabricacionSoluciones  (filas: 0) =====
CREATE TABLE [UCEcontrolesFabricacionSoluciones] (
  [CodigoControl] NVARCHAR(3) NOT NULL,
  [CodigoSolucion] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [VPedAnulaMaterialPendienteSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([CodigoControl], [CodigoSolucion])
);

-- ===== UCEcontrolesFabricacionTTMOFases  (filas: 0) =====
CREATE TABLE [UCEcontrolesFabricacionTTMOFases] (
  [CodigoControl] NVARCHAR(3) NOT NULL,
  [CodigoFase] NVARCHAR(3) NOT NULL,
  PRIMARY KEY ([CodigoControl], [CodigoFase])
);

-- ===== UCEcontrolesFabricacionVariables  (filas: 0) =====
CREATE TABLE [UCEcontrolesFabricacionVariables] (
  [CodigoControl] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [TipoValor] NVARCHAR(10),
  [ValoresLista] NVARCHAR,
  [TipoRegistro] NVARCHAR(10),
  [Orden] SMALLINT,
  [Variable] NVARCHAR(40) NOT NULL,
  [ValorMinimo] REAL,
  [ValorMaximo] REAL,
  [Observaciones] NVARCHAR(50),
  PRIMARY KEY ([CodigoControl], [Variable])
);

-- ===== UCElaboratorios  (filas: 0) =====
CREATE TABLE [UCElaboratorios] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Nombre] NVARCHAR(60),
  [Numero] NVARCHAR(20),
  [Direccion1] NVARCHAR(150),
  [Direccion2] NVARCHAR(150),
  [Telefono] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [Contacto] NVARCHAR(50),
  [eMail] NVARCHAR(150),
  PRIMARY KEY ([Codigo])
);

-- ===== UCentroHerrOperaciones  (filas: 0) =====
CREATE TABLE [UCentroHerrOperaciones] (
  [nLin] INTEGER NOT NULL,
  [CodSerie] NVARCHAR(15) NOT NULL,
  [formulaOpcH] NVARCHAR(255) NOT NULL,
  [Apertura] NVARCHAR(6),
  [PosPerfil] NVARCHAR(3),
  [largoDesde] REAL,
  [largoHasta] REAL,
  [codigoOp] NVARCHAR(20),
  [posicionOp] REAL,
  [refPosOpIFM_I] NVARCHAR(1),
  [refPosOpIFM_D] NVARCHAR(1),
  [comentarioOp] NVARCHAR(30),
  [correccionPos] REAL,
  [medida] REAL,
  [descuento] REAL,
  [dividirDto] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLin])
);

-- ===== UConsultas  (filas: 32) =====
CREATE TABLE [UConsultas] (
  [Nombre] NVARCHAR(80) NOT NULL,
  [Titulo] NVARCHAR(200),
  [Descripcion] NVARCHAR,
  [ConsultaSQL] NVARCHAR,
  [Orden] SMALLINT,
  [SistemaSN] BOOLEAN NOT NULL,
  [FiltroClienteSN] BOOLEAN NOT NULL,
  [FiltroClienteCampo] NVARCHAR(40),
  [FiltroProveedorSN] BOOLEAN NOT NULL,
  [FiltroProveedorCampo] NVARCHAR(40),
  [FiltroRepresentanteSN] BOOLEAN NOT NULL,
  [FiltroRepresentanteCampo] NVARCHAR(40),
  [FiltroDelegacionSN] BOOLEAN NOT NULL,
  [FiltroDelegacionCampo] NVARCHAR(40),
  [FiltroArticuloSN] BOOLEAN NOT NULL,
  [FiltroArticuloCampo] NVARCHAR(40),
  [FiltroAcabadoSN] BOOLEAN NOT NULL,
  [FiltroAcabadoCampo] NVARCHAR(40),
  [FiltroAcaTonalidadSN] BOOLEAN NOT NULL,
  [FiltroAcaTonalidadCampo] NVARCHAR(40),
  [FiltroFechaInicialSN] BOOLEAN NOT NULL,
  [FiltroFechaInicialCampo] NVARCHAR(40),
  [FiltroFechaFinalSN] BOOLEAN NOT NULL,
  [FiltroFechaFinalCampo] NVARCHAR(40),
  [Categoria] NVARCHAR(40),
  [Tipo] NVARCHAR(20),
  [FiltroClienteRequeridoSN] BOOLEAN NOT NULL,
  [FiltroProveedorRequeridoSN] BOOLEAN NOT NULL,
  [FiltroRepresentanteRequeridoSN] BOOLEAN NOT NULL,
  [FiltroDelegacionRequeridoSN] BOOLEAN NOT NULL,
  [FiltroArticuloRequeridoSN] BOOLEAN NOT NULL,
  [FiltroAcabadoRequeridoSN] BOOLEAN NOT NULL,
  [FiltroAcaTonalidadRequeridoSN] BOOLEAN NOT NULL,
  [FiltroFechaInicialRequeridoSN] BOOLEAN NOT NULL,
  [FiltroFechaFinalRequeridoSN] BOOLEAN NOT NULL,
  [FiltroFamiliaSN] BOOLEAN NOT NULL,
  [FiltroFamiliaCampo] NVARCHAR(40),
  [FiltroFamiliaRequeridoSN] BOOLEAN NOT NULL,
  [FiltroSubfamiliaSN] BOOLEAN NOT NULL,
  [FiltroSubfamiliaCampo] NVARCHAR(40),
  [FiltroSubfamiliaRequeridoSN] BOOLEAN NOT NULL,
  [FiltroZonaSN] BOOLEAN NOT NULL,
  [FiltroZonaCampo] NVARCHAR(40),
  [FiltroZonaRequeridoSN] BOOLEAN NOT NULL,
  [FiltroLoteSN] BOOLEAN NOT NULL,
  [FiltroLoteCampo] NVARCHAR(40),
  [FiltroLoteRequeridoSN] BOOLEAN NOT NULL,
  [ImprimirVDocumentoSN] BOOLEAN NOT NULL,
  [ImprimirVDocNombreCampoId] NVARCHAR(20),
  [ImprimirVDocTipoDoc] NVARCHAR(10),
  [FiltroPaisSN] BOOLEAN NOT NULL,
  [FiltroPaisCampo] NVARCHAR(40),
  [FiltroPaisRequeridoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Nombre])
);

-- ===== UCorteFormatos  (filas: 0) =====
CREATE TABLE [UCorteFormatos] (
  [Codigo] NVARCHAR(3),
  [Marca] NVARCHAR(30),
  [Modelo] NVARCHAR(30),
  [VersionSW] NVARCHAR(10),
  [SepDecimal] NVARCHAR(1),
  [FormatoAng] NVARCHAR(3),
  [ValorIng1] REAL,
  [ValorIng2] REAL,
  [ValorRecto] REAL,
  [TipoAC] NVARCHAR(1),
  [NombreTrabAncho] SMALLINT,
  [NombreTrabAntes] NVARCHAR(100),
  [NombreTrabDespues] NVARCHAR(100),
  [FSinOptSN] BOOLEAN NOT NULL,
  [BarraAntes] NVARCHAR(100),
  [BarraDespues] NVARCHAR(100),
  [CorteAntes] NVARCHAR(100),
  [CorteDespues] NVARCHAR(100),
  [PredeterminadoSN] BOOLEAN NOT NULL,
  [UdsLongit] NVARCHAR(3),
  [MedidaExtInt] NVARCHAR(1),
  [NombreFich] NVARCHAR(40),
  [IncluirRestoSN] BOOLEAN NOT NULL,
  [NombreNDextension] NVARCHAR(3),
  [nDecMedidas] SMALLINT,
  [nDecAng] SMALLINT,
  [AgrupaIgSN] BOOLEAN NOT NULL,
  [mecZonaEnDescrSN] BOOLEAN NOT NULL,
  [CorreccionesSN] BOOLEAN NOT NULL,
  [EtiqInicializaJob] NVARCHAR(255),
  [EtiqFinalizaJob] NVARCHAR(255),
  [EtiqInicioEtiq] NVARCHAR(40),
  [EtiqFinalEtiq] NVARCHAR(40),
  [EtiqPosCampo] NVARCHAR(40),
  [EtiqInicioCampo] NVARCHAR(40),
  [EtiqFinalCampo] NVARCHAR(40),
  [EtiqInicioCodBar] NVARCHAR(40),
  [EtiqFinalCodBar] NVARCHAR(40),
  [CorteIniBarraSN] BOOLEAN NOT NULL,
  [NombreNDancho] SMALLINT,
  [CodBarrPersonalizadoSN] BOOLEAN NOT NULL,
  [CodBarrAnchoDoc] SMALLINT,
  [CodBarrAnchoPerf] SMALLINT,
  [CodBarrAnchoTotal] SMALLINT,
  [CodBarrFormatoDoc] NVARCHAR(1),
  [CodBarrFormatoPerf] NVARCHAR(1),
  [CodBarrFormatoTotal] NVARCHAR(1),
  [NombreFichFormulaSN] BOOLEAN NOT NULL,
  [NombreFichFormula] NVARCHAR(255),
  [NombreFichFormatoFecha] NVARCHAR(20),
  [NombreFichFormatoHora] NVARCHAR(20),
  [UbicFichFechaSN] BOOLEAN NOT NULL,
  [UbicFichFechaFormato] NVARCHAR(20),
  [NoGeneraFicheroSN] BOOLEAN NOT NULL,
  [UbicFich] NVARCHAR(255),
  [DescripcionFormulaSN] BOOLEAN NOT NULL,
  [Tipo_M2_ML] NVARCHAR(2),
  [FormatoM2] NVARCHAR(20),
  [Formato] NVARCHAR(4),
  [ExcluirCorteDesde] SMALLINT,
  [ExcluirCorteHasta] SMALLINT,
  [TigerLimiteLineasFichero] SMALLINT,
  [TigerLimiteLineasReferenciaArtAcaton] SMALLINT,
  [OrdenCortesEnBarra] NVARCHAR(15),
  [OmronDireccionIP] NVARCHAR(20),
  [OmronPuerto] INTEGER,
  [ExcluirCorteMedidaExtInt] NVARCHAR(1),
  [ExcluirCorteDesde2] SMALLINT,
  [ExcluirCorteHasta2] SMALLINT,
  PRIMARY KEY ([Codigo])
);

-- ===== UCorteFormatosCamposUsr  (filas: 0) =====
CREATE TABLE [UCorteFormatosCamposUsr] (
  [nLinea] INTEGER NOT NULL,
  [CodFormato] NVARCHAR(3) NOT NULL,
  [CampoProtocolo] NVARCHAR(20),
  [FormulaRellenarCon] NVARCHAR(255),
  [IncluirEnFicheroSN] BOOLEAN NOT NULL,
  [Ancho] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== UCorteFormatosCorrec  (filas: 0) =====
CREATE TABLE [UCorteFormatosCorrec] (
  [nLinea] INTEGER NOT NULL,
  [CodFormato] NVARCHAR(3),
  [Articulo] NVARCHAR(15),
  [Funcion] NVARCHAR(20),
  [TipoCorte] NVARCHAR(2),
  [Correccion] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== UCorteFormatosDescripcion  (filas: 0) =====
CREATE TABLE [UCorteFormatosDescripcion] (
  [nLinea] INTEGER NOT NULL,
  [CodFormato] NVARCHAR(3) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [FormulaDescripcion] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== UCorteMultRPT  (filas: 0) =====
CREATE TABLE [UCorteMultRPT] (
  [id] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(5),
  [TipoInforme] NVARCHAR(20),
  [lstFamiliasEstr] NVARCHAR(150),
  [dstNombreRpt] NVARCHAR(40),
  [dstCopias] SMALLINT,
  PRIMARY KEY ([id])
);

-- ===== UCorteMultRPTart  (filas: 0) =====
CREATE TABLE [UCorteMultRPTart] (
  [id] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(5),
  [TipoInforme] NVARCHAR(20),
  [lstFamiliasArt] NVARCHAR(150),
  [dstNombreRpt] NVARCHAR(40),
  [dstCopias] SMALLINT,
  PRIMARY KEY ([id])
);

-- ===== UCorteSecciones  (filas: 0) =====
CREATE TABLE [UCorteSecciones] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Nombre] NVARCHAR(25),
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== UCTEtabla21  (filas: 0) =====
CREATE TABLE [UCTEtabla21] (
  [ZonaClimatica] NVARCHAR(1) NOT NULL,
  [Uhmax] REAL,
  [UMm_limite_reduce] REAL,
  PRIMARY KEY ([ZonaClimatica])
);

-- ===== UCTEtabla22  (filas: 0) =====
CREATE TABLE [UCTEtabla22] (
  [ZonaClimatica] NVARCHAR(2) NOT NULL,
  [porcHdesde] SMALLINT NOT NULL,
  [porcHhasta] SMALLINT NOT NULL,
  [Uh_N] REAL,
  [Uh_EO] REAL,
  [Uh_S] REAL,
  [Uh_SESO] REAL,
  [FhBCI_EO] REAL,
  [FhBCI_S] REAL,
  [FhBCI_SESO] REAL,
  [FhACI_EO] REAL,
  [FhACI_S] REAL,
  [FhACI_SESO] REAL,
  PRIMARY KEY ([ZonaClimatica], [porcHdesde], [porcHhasta])
);

-- ===== UCTEtabla22UMm  (filas: 0) =====
CREATE TABLE [UCTEtabla22UMm] (
  [ZonaClimatica] NVARCHAR(2) NOT NULL,
  [porcHdesde] SMALLINT NOT NULL,
  [porcHhasta] SMALLINT NOT NULL,
  [Uh_N] REAL,
  [Uh_EO] REAL,
  [Uh_S] REAL,
  [Uh_SESO] REAL,
  [FhBCI_EO] REAL,
  [FhBCI_S] REAL,
  [FhBCI_SESO] REAL,
  [FhACI_EO] REAL,
  [FhACI_S] REAL,
  [FhACI_SESO] REAL,
  PRIMARY KEY ([ZonaClimatica], [porcHdesde], [porcHhasta])
);

-- ===== UCTEtablaD1  (filas: 0) =====
CREATE TABLE [UCTEtablaD1] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Provincia] NVARCHAR(80),
  [zcCapital] NVARCHAR(2),
  [alturaRef] SMALLINT,
  [zc200_400] NVARCHAR(2),
  [zc400_600] NVARCHAR(2),
  [zc600_800] NVARCHAR(2),
  [zc800_1000] NVARCHAR(2),
  [zc1000_9999] NVARCHAR(2),
  PRIMARY KEY ([Codigo])
);

-- ===== UEtiqUdTMP  (filas: 0) =====
CREATE TABLE [UEtiqUdTMP] (
  [nLinea] INTEGER NOT NULL,
  [idOpti] INTEGER NOT NULL,
  [nVLinea] INTEGER,
  [NombreRPT] NVARCHAR(50),
  PRIMARY KEY ([nLinea])
);

-- ===== UMecCodOp  (filas: 0) =====
CREATE TABLE [UMecCodOp] (
  [nLin] INTEGER NOT NULL,
  [Serie] NVARCHAR(15),
  [DinTipoOpMec] SMALLINT,
  [Funcion] NVARCHAR(10),
  [PosTrab] NVARCHAR(3),
  [PosTrabVH] NVARCHAR(1),
  [AperturaTH] SMALLINT,
  [funcionMec] NVARCHAR(10),
  [medDesde] REAL,
  [medHasta] REAL,
  [TravSopTipo] NVARCHAR(2),
  [TravSopDesde] REAL,
  [TravSopHasta] REAL,
  [Prioridad] SMALLINT,
  [CotaOp] REAL,
  [SeparacionDes] REAL,
  [CodArticulo] NVARCHAR(15),
  [DesCentroSN] BOOLEAN NOT NULL,
  [ManoID] NVARCHAR(1),
  [CotaOpBisInf] REAL,
  [ForzarArrAba_AB] NVARCHAR(1),
  [TipoMInf] NVARCHAR(6),
  [DesIntDesplaza] REAL,
  [PerfilDestino] NVARCHAR(5),
  [TravIF] NVARCHAR(1),
  [talTravSep] REAL,
  [desBandCondSN] NVARCHAR(1),
  [lstPerfilHoja] NVARCHAR(40),
  [CodOp] NVARCHAR(40),
  [CodOpTravCruz] NVARCHAR(40),
  [lstGuia] NVARCHAR(40),
  [ObservacionesEtiq] NVARCHAR(40),
  [BisIntH_nBis] SMALLINT,
  [OperacionesAdSN] BOOLEAN NOT NULL,
  [AcabadosAplicSN] BOOLEAN NOT NULL,
  [ArticulosAplicSN] BOOLEAN NOT NULL,
  [OpsAdTravDesdeCentroSN] BOOLEAN NOT NULL,
  [CodOpSufijo] NVARCHAR(40),
  [CotaOpY] REAL,
  [OpAncho] REAL,
  [OpAlto] REAL,
  [OpDiametro] REAL,
  [OpCotaMinima] REAL,
  [AperturaIE] NVARCHAR(1),
  [DobleEtiquetaSN] BOOLEAN NOT NULL,
  [formulaOpcH] NVARCHAR(255),
  [Comentario] NVARCHAR(50),
  [DesplazaInicio] REAL,
  [DesplazaFinal] REAL,
  [CotaOpZ] REAL,
  [OpProfundidad] REAL,
  [TipoHojaCorredera] SMALLINT,
  [lstMaquinas] NVARCHAR(20),
  [TipoCerradero] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== UMecCodOpAcabadosAplicable  (filas: 0) =====
CREATE TABLE [UMecCodOpAcabadosAplicable] (
  [nLin] INTEGER NOT NULL,
  [nLinUMecCodOp] INTEGER,
  [Acabado] NVARCHAR(10),
  PRIMARY KEY ([nLin])
);

-- ===== UMecCodOpAD  (filas: 0) =====
CREATE TABLE [UMecCodOpAD] (
  [nLin] INTEGER NOT NULL,
  [nLinUMecCodOp] INTEGER,
  [CotaOpDif] REAL,
  [CodOpIz] NVARCHAR(40),
  [CodOpDe] NVARCHAR(40),
  [CodOpIzSufijo] NVARCHAR(40),
  [CodOpDeSufijo] NVARCHAR(40),
  [CotaOpY] REAL,
  [OpAncho] REAL,
  [OpAlto] REAL,
  [OpDiametro] REAL,
  [formulaOpcH] NVARCHAR(255),
  [Comentario] NVARCHAR(50),
  [CotaOpZ] REAL,
  [OpProfundidad] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== UMecCodOpArticulosAplicable  (filas: 0) =====
CREATE TABLE [UMecCodOpArticulosAplicable] (
  [nLin] INTEGER NOT NULL,
  [nLinUMecCodOp] INTEGER,
  [Articulo] NVARCHAR(15),
  PRIMARY KEY ([nLin])
);

-- ===== UMecConfig  (filas: 1) =====
CREATE TABLE [UMecConfig] (
  [formatoCentro] SMALLINT,
  [TipoEstatDinam] NVARCHAR(1),
  [ISOsn] BOOLEAN NOT NULL,
  [ISOcontra] NVARCHAR(40),
  [invCotaPosPerf] NVARCHAR(40),
  [invCotaPosPerfApExt] NVARCHAR(40),
  [EnlaceSN] BOOLEAN NOT NULL,
  [CodOpTrav] NVARCHAR(6),
  [CodOpRec] NVARCHAR(6),
  [CodOpRefuArr] NVARCHAR(6),
  [CodOpRefuAba] NVARCHAR(6),
  [CodOpCrem] NVARCHAR(6),
  [CodOpManilla] NVARCHAR(6),
  [CodOpBisM] NVARCHAR(6),
  [CodOpCerrArr] NVARCHAR(6),
  [CodOpCerrAba] NVARCHAR(6),
  [TravDobleSN] BOOLEAN NOT NULL,
  [TravDobleSep] REAL,
  [RefuCotaExt] REAL,
  [RefuSep] REAL,
  [RefuCotaExtH] REAL,
  [RefuSepH] REAL,
  [RefuNoRecSN] BOOLEAN NOT NULL,
  [RefuM_AB] NVARCHAR(1),
  [RefuH_AB] NVARCHAR(1),
  [RefuTH_AB] NVARCHAR(1),
  [RefuTM_AB] NVARCHAR(6),
  [AltMan_DtoCrem] REAL,
  [AltMan_DtoMan] REAL,
  [BisMCotaDG] REAL,
  [CerrM_AB] NVARCHAR(1),
  [CerrTM_AB] NVARCHAR(4),
  [GalceM_Trav] REAL,
  [GalceCorr_AltM] REAL,
  [DesMedHoja] REAL,
  [DesMedHCodOpExt] NVARCHAR(6),
  [DesMedHCodOpCentro] NVARCHAR(6),
  [DesMedHCotaExt] REAL,
  [DesMedMarco] REAL,
  [DesMedMCodOpExt] NVARCHAR(6),
  [DesMedMCodOpCentro] NVARCHAR(6),
  [DesMedMCotaExt] REAL,
  [AltRecTravDesde] REAL,
  [AltRecTravHasta] REAL,
  [AltRecPosActHasta] REAL,
  [AltRecPosicion] REAL,
  [AltRecPosRefu] REAL,
  [TamRec] REAL,
  [ISOcodIni] NVARCHAR(255),
  [ISOcodFin] NVARCHAR(255),
  [ISOcodFinZonaB] NVARCHAR(255),
  [ISOcodZonaA] NVARCHAR(255),
  [ISOcodZonaB] NVARCHAR(255),
  [ISOcodNOZona] NVARCHAR(255),
  [ISOzonaBdespl] REAL,
  [ISOzonasSN] BOOLEAN NOT NULL,
  [ISOzonaTipo] NVARCHAR(10),
  [ISOzonaForzarSN] BOOLEAN NOT NULL,
  [ISOzonaForzarLargo] REAL,
  [ISOmultiMecSN] BOOLEAN NOT NULL,
  [ISOmultiMec_N] SMALLINT,
  [ComprimirFichSN] BOOLEAN NOT NULL,
  [CompNombreFich] NVARCHAR(40),
  [CompCopiarFich] NVARCHAR(40),
  [RefuGalceSN] BOOLEAN NOT NULL,
  [BisTM_AB] NVARCHAR(4),
  [NombreFich] NVARCHAR(255),
  [CompEliminarOrigSN] BOOLEAN NOT NULL,
  [DesMarcoNoDivHojasSN] BOOLEAN NOT NULL,
  [TalObraGuiaPSN] BOOLEAN NOT NULL,
  [MecBandCondSN] BOOLEAN NOT NULL,
  [DescompIgnoraTravSN] BOOLEAN NOT NULL,
  [AireacionIgnoraTravSN] BOOLEAN NOT NULL,
  [BisIntHPASsn] BOOLEAN NOT NULL,
  [BisIntHPASOBsn] BOOLEAN NOT NULL,
  [BisIntHPRACTsn] BOOLEAN NOT NULL,
  [Des1IgnoraTravSN] BOOLEAN NOT NULL,
  [Des2IgnoraTravSN] BOOLEAN NOT NULL,
  [DesAnulaAptExtSN] BOOLEAN NOT NULL,
  [DesDesVerticalesSN] BOOLEAN NOT NULL,
  [CodBarrPersonalizadoSN] BOOLEAN NOT NULL,
  [CodBarrAnchoDoc] SMALLINT,
  [CodBarrAnchoPerf] SMALLINT,
  [CodBarrAnchoTotal] SMALLINT,
  [CodBarrFormatoDoc] NVARCHAR(1),
  [CodBarrFormatoPerf] NVARCHAR(1),
  [CodBarrFormatoTotal] NVARCHAR(1),
  [Des2MarcoNoDivHojasSN] BOOLEAN NOT NULL,
  [UbicFich] NVARCHAR(255),
  [CotaMinimaOperacion] DOUBLE,
  [BisIntOPsn] BOOLEAN NOT NULL,
  [TalObra1MarcoNoDivHojasSN] BOOLEAN NOT NULL,
  [TalObra2MarcoNoDivHojasSN] BOOLEAN NOT NULL
);

-- ===== UmecConfigCerr  (filas: 0) =====
CREATE TABLE [UmecConfigCerr] (
  [Apertura] NVARCHAR(6),
  [PosPerfil] NVARCHAR(3),
  [largoDesde] REAL,
  [largoHasta] REAL,
  [posicionOp] REAL,
  [refPosOpIFM_I] NVARCHAR(1),
  [refPosOpIFM_D] NVARCHAR(1),
  [CodSerie] NVARCHAR(15),
  [formulaOpcH] NVARCHAR(255),
  [nLin] INTEGER NOT NULL,
  [correccionPos] REAL,
  [BisIntM_nBis] SMALLINT,
  [TipoCerradero] NVARCHAR(20),
  [Comentario] NVARCHAR(50),
  PRIMARY KEY ([nLin])
);

-- ===== UmecConfigDes  (filas: 0) =====
CREATE TABLE [UmecConfigDes] (
  [TipoPerf] NVARCHAR(4),
  [DescrTPerf] NVARCHAR(20),
  [CodOpIz] NVARCHAR(6),
  [CodOpDe] NVARCHAR(6),
  [CodOpInt] NVARCHAR(6),
  [DesCotaExt] REAL,
  [DesSep] REAL,
  PRIMARY KEY ([TipoPerf])
);

-- ===== UmecConfigDesplaza  (filas: 0) =====
CREATE TABLE [UmecConfigDesplaza] (
  [DistanciaMin] REAL,
  [CodOp1] NVARCHAR(40) NOT NULL,
  [CodOp2] NVARCHAR(40) NOT NULL,
  [EliminarSiNoPuedeDesplazarSN] BOOLEAN NOT NULL,
  [EliminarSiempreSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([CodOp1], [CodOp2])
);

-- ===== UmecConfigEliminaOp  (filas: 0) =====
CREATE TABLE [UmecConfigEliminaOp] (
  [CodOp1] NVARCHAR(40) NOT NULL,
  [CodOp2] NVARCHAR(40) NOT NULL,
  PRIMARY KEY ([CodOp1], [CodOp2])
);

-- ===== UMecInvCotaPosPerf  (filas: 0) =====
CREATE TABLE [UMecInvCotaPosPerf] (
  [TipoPerf] NVARCHAR(1),
  [Funcion] NVARCHAR(10),
  [ApertIntExt] NVARCHAR(3),
  [invCotaPosPerf] NVARCHAR(40),
  PRIMARY KEY ([TipoPerf], [Funcion], [ApertIntExt])
);

-- ===== UMecISO  (filas: 0) =====
CREATE TABLE [UMecISO] (
  [CodOp] NVARCHAR(10),
  [Descripcion] NVARCHAR(80),
  [CodigoISO] NVARCHAR,
  [PosCentroMM] REAL,
  [Herramienta] SMALLINT,
  [Prioridad] SMALLINT,
  [ComandosXVar] NVARCHAR(20),
  [mecMultiSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([CodOp])
);

-- ===== UMecMaquinas  (filas: 1) =====
CREATE TABLE [UMecMaquinas] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(60),
  [FormatoCentro] NVARCHAR(3),
  [UbicacionFichero] NVARCHAR(255),
  [NombreFichero] NVARCHAR(255),
  PRIMARY KEY ([Codigo])
);

-- ===== UMecNumBis  (filas: 0) =====
CREATE TABLE [UMecNumBis] (
  [nLin] INTEGER NOT NULL,
  [Serie] NVARCHAR(15) NOT NULL,
  [nOpcionHerr] SMALLINT,
  [AnchoHdesde] SMALLINT,
  [AnchoHhasta] SMALLINT,
  [AltoHdesde] SMALLINT,
  [AltoHhasta] SMALLINT,
  [numeroBis] SMALLINT,
  [posBisHV] NVARCHAR(1),
  [Apertura] NVARCHAR(10),
  [BisIntMarcoSN] BOOLEAN NOT NULL,
  [BisIntHojaSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLin])
);

-- ===== UMecPosManilla  (filas: 0) =====
CREATE TABLE [UMecPosManilla] (
  [CodSerie] NVARCHAR(15),
  [formulaOpcH] NVARCHAR(255),
  [altoHdesde] REAL,
  [altoHhasta] REAL,
  [posManilla] REAL,
  [bForzar] BOOLEAN NOT NULL,
  [nLin] INTEGER NOT NULL,
  [Apertura] NVARCHAR(10),
  PRIMARY KEY ([nLin])
);

-- ===== UmecRotoxT  (filas: 0) =====
CREATE TABLE [UmecRotoxT] (
  [CodPerfMec] NVARCHAR(15),
  [CodOp] NVARCHAR(6),
  [CodTabla] NVARCHAR(4),
  PRIMARY KEY ([CodPerfMec], [CodOp])
);

-- ===== UOptiID  (filas: 0) =====
CREATE TABLE [UOptiID] (
  [id] INTEGER NOT NULL,
  [Temp] SMALLINT,
  PRIMARY KEY ([id])
);

-- ===== UOptimizacion  (filas: 0) =====
CREATE TABLE [UOptimizacion] (
  [nLIn] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Tipo] NVARCHAR(2),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [idBarra] INTEGER,
  [nBarraAgrup] SMALLINT,
  [Longitud] REAL,
  [LongitudInt] REAL,
  [TipoI] SMALLINT,
  [TipoD] SMALLINT,
  [nOrden] INTEGER,
  [idMec] INTEGER,
  [DesperdicioBarra] SMALLINT,
  [CodCarro] NVARCHAR(3),
  [nHueco] SMALLINT,
  [nPasada] SMALLINT,
  [nLinEstr] INTEGER,
  [nLineaArt] INTEGER,
  [nPanel] SMALLINT,
  [Ancho] SMALLINT,
  [Largo] SMALLINT,
  [PosH] SMALLINT,
  [PosV] SMALLINT,
  [nCorte] INTEGER,
  [DisIdIt] INTEGER,
  [DisPosPerf] NVARCHAR(3),
  [DisFuncion] NVARCHAR(20),
  [bDobleEt] BOOLEAN NOT NULL,
  [nOrden2et] INTEGER,
  [optnArt] INTEGER,
  [optnPer] INTEGER,
  [mecBandInfRestar] REAL,
  [mecEstatCodOp] NVARCHAR(10),
  [mecZonaAB] NVARCHAR(1),
  [mecInvertirInvSN] BOOLEAN NOT NULL,
  [mecMulti_IDprinc] INTEGER,
  [mecMulti_txtIDs] NVARCHAR(30),
  [AcaTonalidad] NVARCHAR(10),
  [LongitudSinSold] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [DisNHoja] SMALLINT,
  [mecObservacionesEtiq] NVARCHAR(40),
  [mecRefuCod] NVARCHAR(15),
  [mecRefuLongit] REAL,
  [estrAnchoM] REAL,
  [estrAltoM] REAL,
  [OFnumero] NVARCHAR(20),
  [OFnumeroLinea] SMALLINT,
  [tronFormatoCorte] NVARCHAR(3),
  [NumeroDocumento] NVARCHAR(20),
  [RefObra] NVARCHAR(60),
  [RefEstr] NVARCHAR(50),
  [nBarra] INTEGER,
  PRIMARY KEY ([nLIn])
);

-- ===== UOptimizacionBarras  (filas: 0) =====
CREATE TABLE [UOptimizacionBarras] (
  [nLin] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [TextoBarra] NVARCHAR,
  [nOrdenBarras] INTEGER,
  [idResto] INTEGER,
  [bRestoTTaller] BOOLEAN NOT NULL,
  [nBarrasMult] SMALLINT,
  [AcaTonalidad] NVARCHAR(10),
  [DespunteIni] SMALLINT,
  [LargoBarra] INTEGER,
  [DesperdicioBarra] INTEGER,
  [tronFormatoCorte] NVARCHAR(3),
  [nBarra] INTEGER,
  [NumeroBarras] INTEGER,
  [DespunteFin] SMALLINT,
  [GrosorSierra] SMALLINT,
  PRIMARY KEY ([nLin])
);

-- ===== UOptimizacionBarrasNeg  (filas: 0) =====
CREATE TABLE [UOptimizacionBarrasNeg] (
  [nLin] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [LargoBarra] INTEGER,
  [NumeroBarras] SMALLINT,
  PRIMARY KEY ([nLin])
);

-- ===== UOptimizacionM2  (filas: 0) =====
CREATE TABLE [UOptimizacionM2] (
  [nLin] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [AnchoPanel] INTEGER,
  [LargoPanel] INTEGER,
  [DibPanel] BINARY,
  [Descripcion] NVARCHAR(255),
  [AcaTonalidad] NVARCHAR(10),
  [RestoSN] BOOLEAN NOT NULL,
  [IdResto] INTEGER,
  [IndicePanel] SMALLINT,
  [SuperficieTotalM2] REAL,
  [SuperficiePiezasCortadasM2] REAL,
  [SuperficieRestosM2] REAL,
  [PorcentajeOptimizacion] REAL,
  [AnchoPanelOrigen] INTEGER,
  [LargoPanelOrigen] INTEGER,
  PRIMARY KEY ([nLin])
);

-- ===== UOptimizacionM2PiezasCortadas  (filas: 0) =====
CREATE TABLE [UOptimizacionM2PiezasCortadas] (
  [nLin] INTEGER NOT NULL,
  [IdOpti] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [IndicePanel] SMALLINT,
  [IndicePiezaEnPanel] SMALLINT,
  [X] REAL,
  [Y] REAL,
  [Ancho] REAL,
  [Largo] REAL,
  [itemCliCodigo] NVARCHAR(10),
  [itemCliNombre] NVARCHAR(100),
  [itemNumDoc] NVARCHAR(20),
  [itemObraDoc] NVARCHAR(60),
  [itemReferencia] NVARCHAR(25),
  [itemOFnumeroLin] SMALLINT,
  PRIMARY KEY ([nLin])
);

-- ===== UOptimizacionM2Restos  (filas: 0) =====
CREATE TABLE [UOptimizacionM2Restos] (
  [nLin] INTEGER NOT NULL,
  [IdOpti] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [IndicePanel] SMALLINT,
  PRIMARY KEY ([nLin])
);

-- ===== UOptRestos  (filas: 0) =====
CREATE TABLE [UOptRestos] (
  [Numero] NVARCHAR(6),
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Fecha] DATE,
  [NumeroOF] NVARCHAR(20),
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([Numero])
);

-- ===== UOptRestosLin  (filas: 0) =====
CREATE TABLE [UOptRestosLin] (
  [id] INTEGER NOT NULL,
  [nResto] NVARCHAR(6),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [Cantidad] REAL,
  [CdadDisponible] REAL,
  [AcaTonalidad] NVARCHAR(10),
  PRIMARY KEY ([id])
);

-- ===== UProcedimientosDatos  (filas: 0) =====
CREATE TABLE [UProcedimientosDatos] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Tabla] NVARCHAR(30),
  [ActivoSN] BOOLEAN NOT NULL,
  [AplicarNuevoRegistoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== UProcedimientosDatosFases  (filas: 0) =====
CREATE TABLE [UProcedimientosDatosFases] (
  [CodigoProcedimiento] NVARCHAR(10) NOT NULL,
  [NumeroFase] SMALLINT NOT NULL,
  [Titulo] NVARCHAR(50),
  [Descripcion] NVARCHAR,
  [Responsable] NVARCHAR(30),
  [InformarSiguienteSN] BOOLEAN NOT NULL,
  [InformarSiguientesFases] NVARCHAR(30),
  [FasesPreviasRequeridas] NVARCHAR(30),
  [BloqueaComprasSN] BOOLEAN NOT NULL,
  [BloqueaVentasSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([CodigoProcedimiento], [NumeroFase])
);

-- ===== UProcedimientosDatosFasesRealizadas  (filas: 0) =====
CREATE TABLE [UProcedimientosDatosFasesRealizadas] (
  [nLinea] INTEGER NOT NULL,
  [CodigoProcedimiento] NVARCHAR(10) NOT NULL,
  [NumeroFase] SMALLINT NOT NULL,
  [ActivaSN] BOOLEAN NOT NULL,
  [Responsable] NVARCHAR(30),
  [Tabla] NVARCHAR(30),
  [Id1Elemento] NVARCHAR(60),
  [Id2Elemento] NVARCHAR(20),
  [Fecha] DATE,
  [FinalizadoSN] BOOLEAN NOT NULL,
  [FinalizadoFecha] DATE,
  [InformadoSiguientesSN] BOOLEAN NOT NULL,
  [InformadoSiguienteFecha] DATE,
  PRIMARY KEY ([nLinea])
);

-- ===== UProduccionSecciones  (filas: 0) =====
CREATE TABLE [UProduccionSecciones] (
  [codigo] NVARCHAR(10) NOT NULL,
  [Nombre] NVARCHAR(25),
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([codigo])
);

-- ===== USoldCodigoSoldEsp  (filas: 0) =====
CREATE TABLE [USoldCodigoSoldEsp] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Tipo] NVARCHAR(15) NOT NULL,
  [CodigoSold] NVARCHAR(15),
  PRIMARY KEY ([Articulo], [Tipo])
);

-- ===== USoldSTBcodigoAca  (filas: 0) =====
CREATE TABLE [USoldSTBcodigoAca] (
  [Acabado] NVARCHAR(10) NOT NULL,
  [CodigoSTBinterior] NVARCHAR(10),
  [CodigoSTBexterior] NVARCHAR(10),
  [CodigoMecalAcabado] NVARCHAR(1),
  PRIMARY KEY ([Acabado])
);

-- ===== Usuarios  (filas: 1) =====
CREATE TABLE [Usuarios] (
  [Nombre] NVARCHAR(30),
  [Nivel] SMALLINT,
  [Delegacion] NVARCHAR(2),
  [gaNotUsuario] NVARCHAR(30),
  [UsuarioAgendaSN] BOOLEAN NOT NULL,
  [UsuarioSistema] NVARCHAR(50),
  [NoSolicitarContraSN] BOOLEAN NOT NULL,
  [Mail] NVARCHAR(255),
  [NombreMail] NVARCHAR(50),
  [VerDocsSeries] NVARCHAR(50),
  [CrearDocsSeries] NVARCHAR(50),
  [PermisosDelegacionesSN] BOOLEAN NOT NULL,
  [CajaCobros] NVARCHAR(30),
  [CobCtaCobros] NVARCHAR(4),
  [UsuarioMail] NVARCHAR(150),
  [DesactivadoSN] BOOLEAN NOT NULL,
  [MailCopiaCCOSN] BOOLEAN NOT NULL,
  [ContraseñaMail] NVARCHAR(150),
  [Contra] NVARCHAR(200),
  [EliminarDocsSeries] NVARCHAR(50),
  [AgGeneraHorasLibresSN] BOOLEAN NOT NULL,
  [AgHorasLibres] NVARCHAR(100),
  [ServidorMail] NVARCHAR(80),
  [PuertoMail] SMALLINT,
  [SSLMail] BOOLEAN NOT NULL,
  [EngineTypeMail] NVARCHAR(10),
  PRIMARY KEY ([Nombre])
);

-- ===== UsuariosPermisosDelegaciones  (filas: 0) =====
CREATE TABLE [UsuariosPermisosDelegaciones] (
  [Usuario] NVARCHAR(30) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [VerSN] BOOLEAN NOT NULL,
  [NuevoSN] BOOLEAN NOT NULL,
  [ActualizarSN] BOOLEAN NOT NULL,
  [EliminarSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Usuario], [Delegacion])
);

-- ===== UsuariosSesiones  (filas: 9) =====
CREATE TABLE [UsuariosSesiones] (
  [Usuario] NVARCHAR(40) NOT NULL,
  [IdUsuarioSesion] GUID NOT NULL,
  [FechaAcceso] DATE,
  [NombreEquipo] NVARCHAR(30),
  [NombreEjecutable] NVARCHAR(40),
  [FinalizadaSN] BOOLEAN NOT NULL,
  [FechaFin] DATE,
  PRIMARY KEY ([IdUsuarioSesion])
);

-- ===== UTablasAuxiliares  (filas: 0) =====
CREATE TABLE [UTablasAuxiliares] (
  [NombreTabla] NVARCHAR(80) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [SQLcarga] NVARCHAR,
  PRIMARY KEY ([NombreTabla])
);

-- ===== UTablasAuxiliaresCampos  (filas: 0) =====
CREATE TABLE [UTablasAuxiliaresCampos] (
  [nLinea] INTEGER NOT NULL,
  [NombreTabla] NVARCHAR(80) NOT NULL,
  [Orden] SMALLINT,
  [NombreCampo] NVARCHAR(80),
  [TituloCampo] NVARCHAR(100),
  [AnchoCampo] SMALLINT,
  [SoloLecturaSN] BOOLEAN NOT NULL,
  [BusquedaTabla] NVARCHAR(80),
  PRIMARY KEY ([nLinea])
);

-- ===== UTablasAuxiliaresEnlaces  (filas: 0) =====
CREATE TABLE [UTablasAuxiliaresEnlaces] (
  [nLinea] INTEGER NOT NULL,
  [NombreTabla] NVARCHAR(80) NOT NULL,
  [EnlaceCampoOrigen1] NVARCHAR(80),
  [EnlaceCampoOrigen2] NVARCHAR(80),
  [EnlaceCampoDestino] NVARCHAR(80),
  [EnlaceTabla] NVARCHAR(80),
  [EnlaceCampoMostrar] NVARCHAR(80),
  [EnlaceGAFormularioSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== UTallCargaLineaVALB  (filas: 0) =====
CREATE TABLE [UTallCargaLineaVALB] (
  [nLin] INTEGER NOT NULL,
  [nCarga] NVARCHAR(20) NOT NULL,
  [OrdenReparto] SMALLINT,
  [CantidadCargada] REAL,
  [Observaciones] NVARCHAR(200),
  [nLineaAlbaran] INTEGER,
  PRIMARY KEY ([nLin])
);

-- ===== UTallCargaVALB  (filas: 0) =====
CREATE TABLE [UTallCargaVALB] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Delegacion] NVARCHAR(2),
  [Trabajador] NVARCHAR(5),
  [NumeroReparto] NVARCHAR(20),
  [Observaciones] NVARCHAR(200),
  [Prioridad] SMALLINT,
  [CerradoSN] BOOLEAN NOT NULL,
  [CerradoFecha] DATE,
  PRIMARY KEY ([Numero])
);

-- ===== UTallConfig  (filas: 0) =====
CREATE TABLE [UTallConfig] (
  [HCdestino] NVARCHAR(1),
  [HCimpresora] NVARCHAR(100),
  [EtiquetasSN] BOOLEAN NOT NULL,
  [EtiqImpresora] NVARCHAR(100),
  [BloqueoVAlbNoFabrSN] BOOLEAN NOT NULL
);

-- ===== UTallConsumoExtra  (filas: 0) =====
CREATE TABLE [UTallConsumoExtra] (
  [nLin] INTEGER NOT NULL,
  [nDoc] NVARCHAR(20) NOT NULL,
  [Trabajador] NVARCHAR(5),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Cantidad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [Observaciones] NVARCHAR(100),
  [tmpMetraje] REAL,
  [tmpCosteTotal] REAL,
  [tmpVentaTotal] REAL,
  [AcaTonalidad] NVARCHAR(10),
  [numeroPed] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== UTallContenedores  (filas: 0) =====
CREATE TABLE [UTallContenedores] (
  [NumeroContenedor] NVARCHAR(20) NOT NULL,
  [ReferenciaContenedor] NVARCHAR(30),
  [Fecha] DATE,
  [Delegacion] NVARCHAR(2),
  [Usuario] NVARCHAR(30),
  [CerradoSN] BOOLEAN NOT NULL,
  [FechaCierre] DATE,
  [UsuarioCierre] NVARCHAR(30),
  [Trabajador] NVARCHAR(5),
  [Fase] NVARCHAR(3),
  [ComputerName] NVARCHAR(30),
  [Ubicacion] NVARCHAR(10),
  [UbicacionPosicion] NVARCHAR(10),
  [Observaciones] NVARCHAR(100),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [PesoBruto] REAL,
  [PesoNeto] REAL,
  [TipoContenedor] NVARCHAR(5),
  PRIMARY KEY ([NumeroContenedor])
);

-- ===== UTallContenedoresLin  (filas: 0) =====
CREATE TABLE [UTallContenedoresLin] (
  [nLin] INTEGER NOT NULL,
  [NumeroContenedor] NVARCHAR(20) NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nVLinea] INTEGER,
  [Cantidad] REAL,
  [FechaEntrada] DATE,
  [Trabajador] NVARCHAR(5),
  [Fase] NVARCHAR(3),
  [ComputerName] NVARCHAR(30),
  PRIMARY KEY ([nLin])
);

-- ===== UTallContenedoresLinLote  (filas: 0) =====
CREATE TABLE [UTallContenedoresLinLote] (
  [nLin] INTEGER NOT NULL,
  [NumeroContenedor] NVARCHAR(20) NOT NULL,
  [Almacen] NVARCHAR(5),
  [NumeroLote] NVARCHAR(30),
  [Cantidad] REAL,
  [FechaEntrada] DATE,
  [Fase] NVARCHAR(3),
  [ComputerName] NVARCHAR(30),
  [Trabajador] NVARCHAR(5),
  [TipoDocOrigen] NVARCHAR(6),
  [NumeroDocOrigen] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== UTallContenedoresTipos  (filas: 0) =====
CREATE TABLE [UTallContenedoresTipos] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Codigo])
);

-- ===== UTallCortes  (filas: 0) =====
CREATE TABLE [UTallCortes] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] NVARCHAR(20) NOT NULL,
  [CodArt] NVARCHAR(15),
  [CodAca] NVARCHAR(10),
  [LargoCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [CantidadCorte] REAL,
  [CantidadCortRestos] REAL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [CodArt], [CodAca], [AcaTonalidad], [LargoCorte], [TipoCorte])
);

-- ===== UTallCPFincidencias  (filas: 0) =====
CREATE TABLE [UTallCPFincidencias] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [NumeroPed] NVARCHAR(20),
  [Fase] NVARCHAR(3),
  [UCEcontrol] NVARCHAR(3),
  [Fecha] DATE,
  [Hora] DATE,
  [solucion] NVARCHAR(100),
  [solucionadaSN] BOOLEAN NOT NULL,
  [UCECodigoIncidencia] NVARCHAR(5),
  [UCECodigoSolucion] NVARCHAR(5),
  [CantidadUnidades] REAL,
  [TipoDoc] NVARCHAR(6),
  [NumeroOF] NVARCHAR(20),
  [NumeroFA] NVARCHAR(20),
  [UCECodigoResponsable] NVARCHAR(5),
  [DescripcionManual] NVARCHAR(200),
  [Trabajador] NVARCHAR(5),
  [FechaSolucionada] DATE,
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== UTallCPFVariables  (filas: 0) =====
CREATE TABLE [UTallCPFVariables] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER,
  [NumeroPed] NVARCHAR(20),
  [NumeroOF] NVARCHAR(20),
  [NumeroFA] NVARCHAR(20),
  [Fase] NVARCHAR(3),
  [UCEcontrol] NVARCHAR(3),
  [Fecha] DATE,
  [Hora] DATE,
  [ValorNumero] REAL,
  [UCEVariable] NVARCHAR(40),
  [ValorTexto] NVARCHAR,
  [Trabajador] NVARCHAR(5),
  PRIMARY KEY ([nLinea])
);

-- ===== UTallDocumentosAsignados  (filas: 0) =====
CREATE TABLE [UTallDocumentosAsignados] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [NumeroDocumento] NVARCHAR(20) NOT NULL,
  [Fase] NVARCHAR(3) NOT NULL,
  [Trabajador] NVARCHAR(5),
  [FechaAsignado] DATE,
  PRIMARY KEY ([TipoDoc], [NumeroDocumento], [Fase])
);

-- ===== UTallLotesCorte  (filas: 0) =====
CREATE TABLE [UTallLotesCorte] (
  [Numero] NVARCHAR(6) NOT NULL,
  [Fecha] DATE,
  [Descripcion] NVARCHAR(50),
  [TrabajadorCrea] NVARCHAR(5),
  [StockActSN] BOOLEAN NOT NULL,
  [StockActPendSN] BOOLEAN NOT NULL,
  [AlmacenSalida] NVARCHAR(5),
  [AlmacenEntrada] NVARCHAR(5),
  [FechaStock] DATE,
  PRIMARY KEY ([Numero])
);

-- ===== UTallLotesCorteLin  (filas: 0) =====
CREATE TABLE [UTallLotesCorteLin] (
  [NumeroLote] NVARCHAR(6) NOT NULL,
  [idPed] INTEGER NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [PedidoCompletoSN] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== UTallLotesCorteLinDetVLin  (filas: 0) =====
CREATE TABLE [UTallLotesCorteLinDetVLin] (
  [NumeroLote] NVARCHAR(6) NOT NULL,
  [idPed] INTEGER NOT NULL,
  [nVLinea] INTEGER NOT NULL,
  PRIMARY KEY ([NumeroLote], [idPed], [nVLinea])
);

-- ===== UTallProceso  (filas: 0) =====
CREATE TABLE [UTallProceso] (
  [nLin] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [TipoFT] NVARCHAR(1),
  [Fecha] DATE,
  [Hora] DATE,
  [Trabajador] NVARCHAR(5),
  [Fase] NVARCHAR(3),
  [FinalizadoSN] BOOLEAN NOT NULL,
  [FechaFin] DATE,
  [HoraFin] DATE,
  [Observaciones] NVARCHAR(80),
  [Incidencias] NVARCHAR(80),
  [ObConcepto] NVARCHAR(5),
  [TiempoBruto] REAL,
  [TiempoPausa] REAL,
  [TiempoHoras] REAL,
  [PausadoSN] BOOLEAN NOT NULL,
  [nLinProcCreaPausa] INTEGER,
  [CreaPausaSN] BOOLEAN NOT NULL,
  [nLinProcPausado] INTEGER,
  [numeroPed] NVARCHAR(20),
  [TiempoAusenciaReloj] REAL,
  [TiempoEnFasesPausa] REAL,
  [MultiplesPedidosSN] BOOLEAN NOT NULL,
  [MultiplesPedidosCantidad] REAL,
  [MultiplesPedidosPorcentaje] REAL,
  [FichadoParcialSN] BOOLEAN NOT NULL,
  [ParcialAutomaticoSN] BOOLEAN NOT NULL,
  [ParcialUnidadesTotales] REAL,
  [ParcialUnidadesFichadas] REAL,
  [ParcialPorcentaje] REAL,
  [TipoDoc] NVARCHAR(6),
  [NumeroOF] NVARCHAR(20),
  [NumeroFA] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== UTallProcesoCantidadArt  (filas: 0) =====
CREATE TABLE [UTallProcesoCantidadArt] (
  [nLinea] INTEGER NOT NULL,
  [nLinea_UTallProceso] INTEGER NOT NULL,
  [Fecha] DATE,
  [Trabajador] NVARCHAR(5),
  [Fase] NVARCHAR(3),
  [ArticuloObjetivo] NVARCHAR(15),
  [HoraInicio] DATE,
  [HoraFin] DATE,
  [CantidadFabricada] REAL,
  [CantidadUnidades] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== UTallProcesoDet  (filas: 0) =====
CREATE TABLE [UTallProcesoDet] (
  [nLin] INTEGER NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [nLinPed] INTEGER NOT NULL,
  [CantidadFabr] REAL,
  [Fecha] DATE,
  [Hora] DATE,
  [Trabajador] NVARCHAR(5),
  [Fase] NVARCHAR(3),
  [Subfase] NVARCHAR(3),
  [numeroPed] NVARCHAR(20),
  [FinalizadoSN] BOOLEAN NOT NULL,
  [FechaFin] DATE,
  [HoraFin] DATE,
  [TiempoHoras] REAL,
  [TiempoBruto] REAL,
  [TiempoAusenciaReloj] REAL,
  [TiempoEnFasesPausa] REAL,
  [MultiplesLineasSN] BOOLEAN NOT NULL,
  [MultiplesLineasPorcentaje] REAL,
  [FichajeDetAutoSN] BOOLEAN NOT NULL,
  [FabricadoExportadoSN] BOOLEAN NOT NULL,
  [FabricadoExportadoFecha] DATE,
  [FabricadoExportadoObservaciones] NVARCHAR(200),
  PRIMARY KEY ([nLin])
);

-- ===== UTallProcesoRegistro  (filas: 0) =====
CREATE TABLE [UTallProcesoRegistro] (
  [nLinea] INTEGER NOT NULL,
  [Tipo_DET_RES] NVARCHAR(3),
  [Fecha] DATE,
  [Accion] NVARCHAR(10),
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [NumeroPed] NVARCHAR(20),
  [NumeroOF] NVARCHAR(20),
  [NumeroFA] NVARCHAR(20),
  [nLinea_UTallProcesoDet] INTEGER,
  [orig_nLinPed] INTEGER,
  [orig_CantidadFabr] REAL,
  [orig_Trabajador] NVARCHAR(5),
  [orig_Fase] NVARCHAR(3),
  [orig_Subfase] NVARCHAR(3),
  [orig_Fecha] DATE,
  [orig_Hora] DATE,
  [TrabajadorRegistro] NVARCHAR(5),
  [UsuarioRegistro] NVARCHAR(30),
  [ComputerName] NVARCHAR(30),
  [UsuarioSistema] NVARCHAR(50),
  [TScomputerName] NVARCHAR(30),
  [TSusuarioSistema] NVARCHAR(50),
  [TSip] NVARCHAR(15),
  PRIMARY KEY ([nLinea])
);

-- ===== Utillaje  (filas: 0) =====
CREATE TABLE [Utillaje] (
  [Codigo] NVARCHAR(15) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Dimensiones] NVARCHAR(40),
  [FechaAlta] DATE,
  [NumeroPiezas] SMALLINT,
  [Observaciones] NVARCHAR,
  [NumeroSerie] NVARCHAR(50),
  [FechaFabricacion] DATE,
  [CuentaContable] NVARCHAR(15),
  [BajaSN] BOOLEAN NOT NULL,
  [BajaFecha] DATE,
  [BajaMotivo] NVARCHAR(100),
  [FechaCompra] DATE,
  [ProveedorCompra] NVARCHAR(10),
  [Coste] REAL,
  [Tipo] NVARCHAR(30),
  [Proyecto] NVARCHAR(100),
  PRIMARY KEY ([Codigo])
);

-- ===== UtillajeArticulos  (filas: 0) =====
CREATE TABLE [UtillajeArticulos] (
  [Utillaje] NVARCHAR(15) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Observaciones] NVARCHAR(255),
  PRIMARY KEY ([Utillaje], [Articulo])
);

-- ===== UtillajeInstrucciones  (filas: 0) =====
CREATE TABLE [UtillajeInstrucciones] (
  [nLinea] INTEGER NOT NULL,
  [Utillaje] NVARCHAR(15) NOT NULL,
  [Descripcion] NVARCHAR(255),
  [Cadencia] NVARCHAR(20),
  [Responsable] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== UtillajeMovimientos  (filas: 0) =====
CREATE TABLE [UtillajeMovimientos] (
  [nLinea] INTEGER NOT NULL,
  [Utillaje] NVARCHAR(15) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Cliente] NVARCHAR(10),
  [FechaSalida] DATE,
  [FechaEntrada] DATE,
  [CdadSalida] REAL,
  [CdadEntrada] REAL,
  [NumeroMovimiento] SMALLINT,
  PRIMARY KEY ([nLinea])
);

-- ===== UtillajeReparaciones  (filas: 0) =====
CREATE TABLE [UtillajeReparaciones] (
  [nLinea] INTEGER NOT NULL,
  [Utillaje] NVARCHAR(15) NOT NULL,
  [Fecha] DATE,
  [Descripcion] NVARCHAR(255),
  [Coste] REAL,
  [DescripcionDetallada] NVARCHAR,
  [Tipo] NVARCHAR(40),
  PRIMARY KEY ([nLinea])
);

-- ===== UtillajeRevisiones  (filas: 0) =====
CREATE TABLE [UtillajeRevisiones] (
  [nLinea] INTEGER NOT NULL,
  [Utillaje] NVARCHAR(15) NOT NULL,
  [Descripcion] NVARCHAR(255),
  [Periodicidad] NVARCHAR(20),
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== UTTreloj  (filas: 0) =====
CREATE TABLE [UTTreloj] (
  [nLin] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5),
  [Concepto] NVARCHAR(2),
  [Fecha] DATE,
  [Hora] DATE,
  [EntTiempoBrutoH] REAL,
  [EntTiempoPausaH] REAL,
  [EntTiempoH] REAL,
  [PausaHFin] DATE,
  [PausaTiempoHoras] REAL,
  [SalPausaNLinEnt] INTEGER,
  [CerradoSN] BOOLEAN NOT NULL,
  [EntRetrasoMin] SMALLINT,
  [EntHEntHorario] DATE,
  [EntHEntExtraHoras] REAL,
  [EntHSalHorario] DATE,
  [EntHSalExtraHoras] REAL,
  [EntHSalida] DATE,
  [EntHEntFueraHorarioSN] BOOLEAN NOT NULL,
  [EntHSalFueraHorarioSN] BOOLEAN NOT NULL,
  [SalAntesTiempoMin] SMALLINT,
  [PausaTiempoHorasHHMM] NVARCHAR(7),
  [EntTiempoBrutoHHMM] NVARCHAR(7),
  [EntTiempoPausaHHMM] NVARCHAR(7),
  [EntTiempoHHMM] NVARCHAR(7),
  [EntRetrasoHHMM] NVARCHAR(7),
  [EntHEntExtraHorasHHMM] NVARCHAR(7),
  [EntHSalExtraHorasHHMM] NVARCHAR(7),
  [SalHAntesTiempoHHMM] NVARCHAR(7),
  [EntCodigoHorario] NVARCHAR(10),
  [LocalizacionSN] BOOLEAN NOT NULL,
  [locLatitud] REAL,
  [locLongitud] REAL,
  [locAltitud] SMALLINT,
  [locPrecision] SMALLINT,
  [ObservacionesTrabajador] NVARCHAR(50),
  PRIMARY KEY ([nLin])
);

-- ===== UTTrelojConceptos  (filas: 2) =====
CREATE TABLE [UTTrelojConceptos] (
  [Codigo] NVARCHAR(2),
  [Descripcion] NVARCHAR(30),
  [TipoConc] NVARCHAR(1),
  PRIMARY KEY ([Codigo])
);

-- ===== UTTrelojMotivosAusencia  (filas: 3) =====
CREATE TABLE [UTTrelojMotivosAusencia] (
  [MotivoAusencia] NVARCHAR(50) NOT NULL,
  PRIMARY KEY ([MotivoAusencia])
);

-- ===== UTTrelojResumenDia  (filas: 0) =====
CREATE TABLE [UTTrelojResumenDia] (
  [Trabajador] NVARCHAR(5) NOT NULL,
  [Fecha] DATE NOT NULL,
  [TipoDia] NVARCHAR(20),
  [AusenciaSN] BOOLEAN NOT NULL,
  [HorasTeoricas] REAL,
  [HorasFichadas] REAL,
  [HorasComputar] REAL,
  [HorasExtra] REAL,
  [HorasRetraso] REAL,
  [ValorExtra] REAL,
  [DiaExtraSN] BOOLEAN NOT NULL,
  [DiaExtraVacSN] BOOLEAN NOT NULL,
  [MotivoAusencia] NVARCHAR(50),
  PRIMARY KEY ([Trabajador], [Fecha])
);

-- ===== UTTretribuciones  (filas: 0) =====
CREATE TABLE [UTTretribuciones] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Trabajador] NVARCHAR(5),
  [Mes] SMALLINT,
  [Año] SMALLINT,
  [Devengado] REAL,
  [RetencionIRPFporc] REAL,
  [RetencionIRPF] REAL,
  [Aportaciones] REAL,
  [OtrosImportes] REAL,
  [Liquido] REAL,
  [ConceptoLibre1] NVARCHAR(50),
  [ImporteLibre1] REAL,
  [ConceptoLibre2] NVARCHAR(50),
  [ImporteLibre2] REAL,
  [HorasExtra] REAL,
  [DiasExtra] REAL,
  [DiasExtraVac] REAL,
  [PrecioHoraExtra] REAL,
  [PrecioDiaExtra] REAL,
  [PrecioDiaExtraVac] REAL,
  [ImporteHorasExtra] REAL,
  [ImporteDiasExtra] REAL,
  [ImporteDiasExtraVac] REAL,
  [Extraordinario] REAL,
  PRIMARY KEY ([Codigo])
);

-- ===== UTTtmpRelojObra  (filas: 0) =====
CREATE TABLE [UTTtmpRelojObra] (
  [Trabajador] NVARCHAR(5) NOT NULL,
  [Fecha] DATE,
  [RelojBrutoH] REAL,
  [RelojPausaH] REAL,
  [RelojTiempoH] REAL,
  [ObraH] REAL
);

-- ===== VAcabadosCat  (filas: 0) =====
CREATE TABLE [VAcabadosCat] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [nLinEstr] INTEGER NOT NULL,
  [CategoriaAca] NVARCHAR(5) NOT NULL,
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [CategoriaAca])
);

-- ===== VAcabadosVbles  (filas: 191) =====
CREATE TABLE [VAcabadosVbles] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [nLinEstrArt] INTEGER,
  [Acabado] NVARCHAR(10),
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [nLinEstrArt])
);

-- ===== VAccesorios  (filas: 3093) =====
CREATE TABLE [VAccesorios] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [nModulo] SMALLINT,
  [FamiliaAcc] NVARCHAR(10),
  [Accesorio] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AltoCajon] REAL,
  [CerrCodGuiaI] NVARCHAR(15),
  [CerrCodGuiaD] NVARCHAR(15),
  [DtoHuecoH] REAL,
  [DtoHuecoV] REAL,
  [VueloI] REAL,
  [VueloD] REAL,
  [GuiaCentralSN] BOOLEAN NOT NULL,
  [PosGuiaCentral] REAL,
  [compDtoHuecoSN] BOOLEAN NOT NULL,
  [compDtoTapH] REAL,
  [compDtoTapV] REAL,
  [InsEdLinSN] BOOLEAN NOT NULL,
  [TubAngPos] NVARCHAR(1),
  [CompAccTipo] SMALLINT,
  [CompAccPosID] NVARCHAR(1),
  [CompAccAltura] REAL,
  [CompAccAlturaDcha] REAL,
  [AcaTonalidad] NVARCHAR(10),
  [CompAccAcaLamas] NVARCHAR(15),
  [CompAccAcaGuias] NVARCHAR(15),
  [CompAccAcaAcc] NVARCHAR(15),
  [CompAccAcaTonLamas] NVARCHAR(15),
  [CompAccAcaTonGuias] NVARCHAR(15),
  [CompAccAcaTonAcc] NVARCHAR(15),
  [nLinEstrGrupo] INTEGER,
  [TipoCorte] NVARCHAR(2),
  [CerrAltoManual] REAL,
  [CerrLargoGuiaI] REAL,
  [CerrLargoGuiaD] REAL,
  [CompBloqueoAccAlt] BOOLEAN NOT NULL,
  [CompBloqueoAccAltDcha] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLin])
);

-- ===== VActStock  (filas: 0) =====
CREATE TABLE [VActStock] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nOF] NVARCHAR(20),
  [TipoES] NVARCHAR(1),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [Cdad] REAL,
  [PrecioCosteE] REAL,
  [RestoSN] BOOLEAN NOT NULL,
  [AcaTonalidad] NVARCHAR(20),
  [nFabricacionArt] NVARCHAR(20),
  [nLote] NVARCHAR(6),
  [Proveedor] NVARCHAR(10),
  [ArticuloFabricadoSN] BOOLEAN NOT NULL,
  [CantidadOrigen] REAL,
  [NumeroLineaOrigen] SMALLINT,
  [ActualizarSN] BOOLEAN NOT NULL,
  [NumeroLoteGenerado] NVARCHAR(30),
  [NumeroLineaDestino] SMALLINT,
  [GeneraAlbaranDestinoSN] BOOLEAN NOT NULL,
  [Fabricado_idPedOrigen] INTEGER,
  [Fabricado_nLinPedOrigen] INTEGER,
  [OrdenLinea] SMALLINT,
  [AlbaranDestinoGeneradoSN] BOOLEAN NOT NULL,
  [Fabricado_NumeroLoteManual] NVARCHAR(30),
  [Fabricado_SufijoLoteManual] NVARCHAR(5),
  [Fabricado_PesoKg] REAL,
  [Fabricado_PesoKgBruto] REAL,
  [GeneraBorradorAlbaranSN] BOOLEAN NOT NULL,
  [BorradorAlbaranGeneradoSN] BOOLEAN NOT NULL,
  [Fabricado_LoteUbicacion] NVARCHAR(10),
  [Fabricado_LoteUbicacionPosicion] NVARCHAR(10),
  [Fabricado_LoteProveedor] NVARCHAR(30),
  [Fabricado_AlmacenEntrada] NVARCHAR(5),
  [Fabricado_UnidadesEmbalaje] NVARCHAR(6),
  [Fabricado_UdsEmbCantidad] REAL,
  [Fabricado_CdadMetPorEmb] REAL,
  [Fabricado_NumeroLoteManualPermitidoSN] BOOLEAN NOT NULL,
  [Fabricado_NumeroContenedor] NVARCHAR(20),
  [Fabricado_DescripcionLote] NVARCHAR(200),
  [Fabricado_ObservacionesLote] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== VActStockBultosFabr  (filas: 0) =====
CREATE TABLE [VActStockBultosFabr] (
  [nLinea] INTEGER NOT NULL,
  [nLineaVActStock] INTEGER NOT NULL,
  [NumeroBulto] SMALLINT,
  [CantidadEnBulto] REAL,
  [PesoKg] REAL,
  [PesoKgBruto] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VActStockDimensionMin  (filas: 0) =====
CREATE TABLE [VActStockDimensionMin] (
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [DimAncho] INTEGER,
  [DimLargo] INTEGER,
  PRIMARY KEY ([Articulo], [Acabado])
);

-- ===== VAlbaranes  (filas: 1) =====
CREATE TABLE [VAlbaranes] (
  [Id] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliTelefono] NVARCHAR(20),
  [CliFax] NVARCHAR(20),
  [CliTipo] NVARCHAR(3),
  [Tarifa] NVARCHAR(5),
  [Serie] NVARCHAR(1),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Fecha] DATE,
  [FacturadoSN] BOOLEAN NOT NULL,
  [PendteServirSN] BOOLEAN NOT NULL,
  [Subtotal] DOUBLE,
  [DescuentoPorc] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPPporc] REAL,
  [DescuentoPP] REAL,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [RecargoPorc] REAL,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  [ImporteTotalEU] DOUBLE,
  [FechaMontaje] DATE,
  [Montador1] NVARCHAR(5),
  [Montador2] NVARCHAR(5),
  [RecibidoACuenta] REAL,
  [TipoOrigen] NVARCHAR(6),
  [RevPresOrigen] NVARCHAR(3),
  [FechaOrigen] DATE,
  [TipoVenta] NVARCHAR(5),
  [Representante] NVARCHAR(5),
  [ComisionPorc] REAL,
  [Comision] REAL,
  [TptePesoKg] REAL,
  [TpteFechaSal] DATE,
  [CodigoTextoFin] NVARCHAR(2),
  [TextoFin] NVARCHAR,
  [nOrdenF] NVARCHAR(20),
  [TipoMedHM] NVARCHAR(1),
  [VRepartoSN] BOOLEAN NOT NULL,
  [VRepartoNum] NVARCHAR(255),
  [Idioma] NVARCHAR(3),
  [Delegacion] NVARCHAR(2),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [ExportadoSN] BOOLEAN NOT NULL,
  [CliNombre] NVARCHAR(100),
  [Almacen] NVARCHAR(5),
  [Obra] NVARCHAR(60),
  [Observaciones] NVARCHAR,
  [Usuario] NVARCHAR(30),
  [DirEnvRazon] NVARCHAR(100),
  [DirEnvDireccion] NVARCHAR(150),
  [DirEnvCP] NVARCHAR(20),
  [DirEnvPoblacion] NVARCHAR(80),
  [DirEnvProvincia] NVARCHAR(80),
  [nDocOrigen] NVARCHAR(20),
  [Numero] NVARCHAR(20) NOT NULL,
  [nFacDestino] NVARCHAR(20),
  [autorizaVDocSN] BOOLEAN NOT NULL,
  [autorizaVDocResultado] NVARCHAR(10),
  [autorizaVDocUsuarioSolicita] NVARCHAR(30),
  [autorizaVDocUsuarioAut] NVARCHAR(30),
  [autorizaVDocObservaciones] NVARCHAR(255),
  [UTTnEtiquetasManuales] SMALLINT,
  [TptePortesSN] BOOLEAN NOT NULL,
  [TptePortes] REAL,
  [TptePortesTipo] NVARCHAR(10),
  [TpteCReembolso] REAL,
  [TpteHoraRecogida] DATE,
  [TpteObservaciones] NVARCHAR(255),
  [Zona] NVARCHAR(5),
  [AsegSiniestroSN] BOOLEAN NOT NULL,
  [AsegNumParte] NVARCHAR(20),
  [CliPais] NVARCHAR(10),
  [DirEnvPais] NVARCHAR(10),
  [CliTelefono2] NVARCHAR(20),
  [ServidoSN] BOOLEAN NOT NULL,
  [ServidoFecha] DATE,
  [ServidoTrabajador] NVARCHAR(5),
  [VOfertas] NVARCHAR(255),
  [COferta] NVARCHAR(255),
  [costeMemo_baseImp] REAL,
  [costeMemo_nLineas] SMALLINT,
  [CliNIF] NVARCHAR(30),
  [CliCodigoFiscal2] NVARCHAR(30),
  [CliCodigoFiscal3] NVARCHAR(30),
  [CliCodigoFiscalObservaciones] NVARCHAR(30),
  [FechaExportado] DATE,
  [ClieMail] NVARCHAR(150),
  [NoActStockSN] BOOLEAN NOT NULL,
  [CosteSelProvSubfamSN] BOOLEAN NOT NULL,
  [CosteSelProvArticuloSN] BOOLEAN NOT NULL,
  [TipoIVA] NVARCHAR(2),
  [TipoDocumento] NVARCHAR(5),
  [CliPersonaFisicaJuridica] NVARCHAR(8),
  [CliCondicionResidencia] NVARCHAR(3),
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [ImpresoSN] BOOLEAN NOT NULL,
  [FechaImpreso] DATE,
  [BloqueoFormaPagoSN] BOOLEAN NOT NULL,
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [RetTipo] NVARCHAR(1),
  [RetBase] REAL,
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [RevisadoSN] BOOLEAN NOT NULL,
  [FechaRevisado] DATE,
  [BloqueoNumeroLineaSN] BOOLEAN NOT NULL,
  [AbonoSN] BOOLEAN NOT NULL,
  [BultosCalculadosSN] BOOLEAN NOT NULL,
  [BultosModificadosPorElUsuarioSN] BOOLEAN NOT NULL,
  [NecesarioRecalcularBultosSN] BOOLEAN NOT NULL,
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [BloqueoDireccionSN] BOOLEAN NOT NULL,
  [BloqueoDireccionEnvioSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [BloqueoVFacSN] BOOLEAN NOT NULL,
  [AbonoMotivo] NVARCHAR(2),
  [NumeroDireccion] SMALLINT,
  [NumeroDireccionEnv] SMALLINT,
  [NumeroDireccionFac] SMALLINT,
  [TipoRetencion] NVARCHAR(2),
  [enviadoEMailSN] BOOLEAN NOT NULL,
  [FechaEnvioEMail] DATE,
  [TpteAgencia] NVARCHAR(10),
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyEmpresaSincOrig] NVARCHAR(10),
  [IntercompanyCPedNumeroOrig] NVARCHAR(20),
  [IntercompanyCPedProveedorOrig] NVARCHAR(10),
  [IntercompanyTipoDocDest] NVARCHAR(6),
  [IntercompanyNumeroDest] NVARCHAR(20),
  [IntercompanyProveedorDest] NVARCHAR(10),
  [IntercompanyEmpresaSincDest] NVARCHAR(10),
  [IntercompanyTraspasadoSN] BOOLEAN NOT NULL,
  [CliAtt] NVARCHAR(255),
  [BloqueoTptePesoKgSN] BOOLEAN NOT NULL,
  [AlbaranElectronicoSN] BOOLEAN NOT NULL,
  [AlbaranEentregadoSN] BOOLEAN NOT NULL,
  [AlbaranEenviadoEMailSN] BOOLEAN NOT NULL,
  [AlbaranEenviadoEMailFecha] DATE,
  [AlbaranEenviadoEMailDestino] NVARCHAR(150),
  [DirEnvTelefono] NVARCHAR(20),
  [ClienteRiesgoPuntualAutorizadoSN] BOOLEAN NOT NULL,
  [TptePesoKgBruto] REAL,
  [BloqueoTptePesoKgBrutoSN] BOOLEAN NOT NULL,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [DevolucionSN] BOOLEAN NOT NULL,
  [DevolucionNDocOrigen] INTEGER,
  [DevolucionAlbaranOrigen] NVARCHAR(20),
  [DevolucionMotivo] NVARCHAR(2),
  [BorradorSN] BOOLEAN NOT NULL,
  [BorradorFinalizadoSN] BOOLEAN NOT NULL,
  [BorradorFinalizadoFecha] DATE,
  [BorradorFinalizadoUsuario] NVARCHAR(30),
  [IdGrupoDocumentos] NVARCHAR(6),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [FechaStock] DATE,
  [AlbaranE_PWeb_NombreBlob] NVARCHAR(40),
  [AlbaranE_PWeb_Uri] NVARCHAR(255),
  [TpteNumExped] NVARCHAR(30),
  [BorradorFacAutoSN] BOOLEAN NOT NULL,
  [BorradorFacAutoPreguntaSN] BOOLEAN NOT NULL,
  [LastModified] DATE,
  [HoraMontaje] DATE,
  [nBultos] SMALLINT,
  [DespuntePorc] REAL,
  [Despunte] REAL,
  [ReferenciaInterna] NVARCHAR(60),
  [TpteAgencia2] NVARCHAR(10),
  [MovimientoInternoSN] BOOLEAN NOT NULL,
  [MovIntAlmacenDestino] NVARCHAR(5),
  [MovIntRecibidoSN] BOOLEAN NOT NULL,
  [MovIntRecibidoFecha] DATE,
  [TarDinPrecioBase] REAL,
  [TarDinIncrementoBase] REAL,
  [OrigenWebSN] BOOLEAN NOT NULL,
  [AlbaranEcodigoQR] NVARCHAR,
  [AlbaranEcontenido] NVARCHAR,
  [AlbaranEDescripcion] NVARCHAR(60),
  [AlbaranEobservaciones] NVARCHAR,
  [RegistroFiscal1] NVARCHAR(50),
  [RegistroFiscal2] NVARCHAR(50),
  [RegistroFiscal3] NVARCHAR(50),
  [RegistroFiscal4] NVARCHAR(50),
  PRIMARY KEY ([Id])
);

-- ===== VAlbaranesEntrega  (filas: 0) =====
CREATE TABLE [VAlbaranesEntrega] (
  [NumeroAlbaran] NVARCHAR(20) NOT NULL,
  [FechaEntrega] DATE,
  [NIFrecoge] NVARCHAR(30),
  [NombreRecoge] NVARCHAR(100),
  [ImagenFirma] BINARY,
  [locLatitud] REAL,
  [locLongitud] REAL,
  [locAltitud] SMALLINT,
  [locPrecision] SMALLINT,
  [IdDispositivo] NVARCHAR(40),
  PRIMARY KEY ([NumeroAlbaran])
);

-- ===== VAlbaranesIVAResumen  (filas: 0) =====
CREATE TABLE [VAlbaranesIVAResumen] (
  [nDoc] INTEGER NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [RecargoPorc] DOUBLE,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([nDoc], [TipoIVA])
);

-- ===== VAlbaranesLin  (filas: 1) =====
CREATE TABLE [VAlbaranesLin] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nEstr] INTEGER,
  [EstructuraSN] BOOLEAN NOT NULL,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Acabado2] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [Cdad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [PrecioCompacto] REAL,
  [MetrajeCompacto] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [Coste] REAL,
  [StArtFabrSN] BOOLEAN NOT NULL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [CantidadCorte] REAL,
  [Funcion] NVARCHAR(20),
  [PosicionTrabajo] NVARCHAR(1),
  [Familia] NVARCHAR(10),
  [nLinOrig] INTEGER,
  [nLinAsoc] INTEGER,
  [VPedLinPend] REAL,
  [Aca2Tonalidad] NVARCHAR(10),
  [AcabadoMad] NVARCHAR(10),
  [AcaMadTonalidad] NVARCHAR(10),
  [CosteMedioFechaDoc] REAL,
  [CosteDtoPorc] REAL,
  [CosteManual] REAL,
  [CosteMetrajeTotal] REAL,
  [asocArt_nLineaOrigen] INTEGER,
  [AcaTonalidad] NVARCHAR(20),
  [MetrajeMaxEntregaInm] REAL,
  [nDocOrigen] NVARCHAR(20),
  [PVPManualSN] BOOLEAN NOT NULL,
  [nLinRelacionada] INTEGER,
  [nLinRelTipoDoc] NVARCHAR(6),
  [RespetarPrecioSN] BOOLEAN NOT NULL,
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [NoComputarCosteSN] BOOLEAN NOT NULL,
  [DescuentoManualSN] BOOLEAN NOT NULL,
  [costeQuePrv] NVARCHAR(10),
  [ColorAcc] INTEGER,
  [ColorPerfil] INTEGER,
  [costeOrigen] NVARCHAR(10),
  [TarifaManualSN] BOOLEAN NOT NULL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [DescripcionIdioma] NVARCHAR,
  [TipoIVA] NVARCHAR(2),
  [ComisionPorcManualSN] BOOLEAN NOT NULL,
  [ComisionPorcManual] REAL,
  [ComisionManualSN] BOOLEAN NOT NULL,
  [ComisionManual] REAL,
  [TipoDocOrig] NVARCHAR(6),
  [MetrajeMinimoAplicado] REAL,
  [MultiploAnchoAplicado] REAL,
  [MultiploLargoAplicado] REAL,
  [MetrajeMinimoEspecialSN] BOOLEAN NOT NULL,
  [MetrajeMinimoEspecial] REAL,
  [MultiploEspecialSN] BOOLEAN NOT NULL,
  [MultiploAnchoEspecial] REAL,
  [MultiploLargoEspecial] REAL,
  [AnchoConMultiplo] REAL,
  [LargoConMultiplo] REAL,
  [MetrajeManualSN] BOOLEAN NOT NULL,
  [Tarifa] NVARCHAR(5),
  [CLAorden] SMALLINT,
  [TipoIVA_detallado_fijo] NVARCHAR(10),
  [IVAporc] REAL,
  [RecargoPorc] REAL,
  [NumeroLinea] INTEGER,
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [CosteMedioOrigen] NVARCHAR(10),
  [CosteMedioManual] REAL,
  [CosteMedioUltimaAct] DATE,
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [NoComputarVentaSN] BOOLEAN NOT NULL,
  [PrecioVentaOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [TipoArticuloImpuesto] NVARCHAR(3),
  [Capitulo] SMALLINT,
  [CapituloPadre] SMALLINT,
  [CapituloTitulo] NVARCHAR(7),
  [CapituloDescripcion] NVARCHAR(50),
  [tldMedidaAltura] REAL,
  [CompFnumPanyo] SMALLINT,
  [EstructuraOrigen] NVARCHAR(15),
  [CdadEnReparto] REAL,
  [CadenaDeClasificacionEstadisticas] NVARCHAR(100),
  [nModulo] SMALLINT,
  [IntercompanyCPedNLinOrig] INTEGER,
  [NumeroLote] NVARCHAR(30),
  [CorteSinValoracionSN] BOOLEAN NOT NULL,
  [ValoracionSinCorteSN] BOOLEAN NOT NULL,
  [CdadMetPorEmb] REAL,
  [BloqueoCdadMetPorEmbSN] BOOLEAN NOT NULL,
  [FechaLinea] DATE,
  [PesoComputado] REAL,
  [Descuento2Porc] REAL,
  [ReferenciaInterna] NVARCHAR(30),
  [LastModified] DATE,
  [nEtiquetasUdFabr] REAL,
  [Precio] DOUBLE,
  [ImporteTotal] DOUBLE,
  [VentaTotal] DOUBLE,
  [CdadHC] REAL,
  [TipoCorte] NVARCHAR(2),
  [AnguloI] REAL,
  [AnguloD] REAL,
  [DirVeta] NVARCHAR(1),
  [SeleccionadoHCsn] BOOLEAN NOT NULL,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [OrdenEstructura] SMALLINT,
  [AcabadoInt] NVARCHAR(10),
  [AcabadoExt] NVARCHAR(10),
  [AcabadoIntermedio] NVARCHAR(10),
  [AcaTonalidadInt] NVARCHAR(10),
  [AcaTonalidadExt] NVARCHAR(10),
  [AcaTonalidadIntermedio] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VAlbaranesLinImpuestos  (filas: 0) =====
CREATE TABLE [VAlbaranesLinImpuestos] (
  [nVLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [nDoc] INTEGER,
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nVLinea], [CodigoImpuesto])
);

-- ===== VAlbaranesUTTEtiqMan  (filas: 0) =====
CREATE TABLE [VAlbaranesUTTEtiqMan] (
  [idAlbaran] INTEGER NOT NULL,
  [idPedidoOrig] INTEGER NOT NULL,
  [UTTnEtiquetasManuales] SMALLINT,
  PRIMARY KEY ([idAlbaran], [idPedidoOrig])
);

-- ===== VAlbTrab  (filas: 0) =====
CREATE TABLE [VAlbTrab] (
  [Id] INTEGER NOT NULL,
  [Fecha] DATE,
  [Cliente] NVARCHAR(10),
  [Obra] NVARCHAR(30),
  [Trabajador] NVARCHAR(5),
  [Articulo] NVARCHAR(15),
  [Descripcion] NVARCHAR,
  [Metraje] REAL,
  [TipoMetraje] NVARCHAR(3),
  [ImporteTotal] REAL,
  [Numero] NVARCHAR(20),
  PRIMARY KEY ([Id])
);

-- ===== VAutorizaCondicional  (filas: 0) =====
CREATE TABLE [VAutorizaCondicional] (
  [nLinea] INTEGER NOT NULL,
  [Orden] SMALLINT,
  [Serie] NVARCHAR(1),
  [RiesgoMaxSuperadoSN] BOOLEAN NOT NULL,
  [RiesgoMaxSuperadoDesde] REAL,
  [RiesgoMaxSuperadoHasta] REAL,
  [Articulo] NVARCHAR(15),
  [Familia] NVARCHAR(10),
  [BaseImponibleDesde] REAL,
  [BaseImponibleHasta] REAL,
  [RequiereAutorizacionSN] BOOLEAN NOT NULL,
  [NoRequiereAutorizacionSN] BOOLEAN NOT NULL,
  [DetenerProcesoCondicionesSN] BOOLEAN NOT NULL,
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VBultos  (filas: 0) =====
CREATE TABLE [VBultos] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [NumeroBulto] SMALLINT NOT NULL,
  [Alto] REAL,
  [Ancho] REAL,
  [Largo] REAL,
  [Volumen] REAL,
  [Peso] REAL,
  [PesoBruto] REAL,
  [Observaciones] NVARCHAR(255),
  PRIMARY KEY ([TipoDoc], [nDoc], [NumeroBulto])
);

-- ===== VBultosVDoc  (filas: 0) =====
CREATE TABLE [VBultosVDoc] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nVLinea] INTEGER,
  [Categoria] NVARCHAR(3),
  [Bulto] SMALLINT,
  [Unidades] REAL,
  [PartidaArancelaria] NVARCHAR(20),
  [Peso] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VCargosAd  (filas: 0) =====
CREATE TABLE [VCargosAd] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [Articulo] NVARCHAR(15),
  [Cantidad] REAL,
  [Acabado] NVARCHAR(10),
  [Largo] REAL,
  [Ancho] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [Precio] REAL,
  [ImporteTotal] REAL,
  [RespetarPrecioSN] BOOLEAN NOT NULL,
  [ManufacturaSN] BOOLEAN NOT NULL,
  [TipoCorte] NVARCHAR(2),
  [AnguloI] REAL,
  [AnguloD] REAL,
  [AcaTonalidad] NVARCHAR(10),
  [Descripcion] NVARCHAR(255),
  [ForzarCargoAparteSN] BOOLEAN NOT NULL,
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [CosteManual] REAL,
  PRIMARY KEY ([nLin])
);

-- ===== VCEcaracteristicas  (filas: 0) =====
CREATE TABLE [VCEcaracteristicas] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [idCaracteristicas] SMALLINT NOT NULL,
  [CEcaracteristica] NVARCHAR(2) NOT NULL,
  [valor] NVARCHAR(30),
  [UsuarioSN] BOOLEAN NOT NULL,
  [nLineaCaracteristicaValor] INTEGER,
  [CEnoValidoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [idCaracteristicas], [CEcaracteristica])
);

-- ===== VCEinformes  (filas: 0) =====
CREATE TABLE [VCEinformes] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [idCaracteristicas] SMALLINT NOT NULL,
  [Informe] NVARCHAR(255),
  PRIMARY KEY ([TipoDoc], [nDoc], [idCaracteristicas])
);

-- ===== VCElaboratorios  (filas: 0) =====
CREATE TABLE [VCElaboratorios] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [AplicableSN] BOOLEAN NOT NULL,
  [CElaboratorio] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [CElaboratorio])
);

-- ===== VCElaboratoriosDet  (filas: 0) =====
CREATE TABLE [VCElaboratoriosDet] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [idCaracteristicas] SMALLINT NOT NULL,
  [CElaboratorio] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [idCaracteristicas], [CElaboratorio])
);

-- ===== VCEnormas  (filas: 0) =====
CREATE TABLE [VCEnormas] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [idCaracteristicas] SMALLINT NOT NULL,
  [Norma] NVARCHAR(255),
  PRIMARY KEY ([TipoDoc], [nDoc], [idCaracteristicas])
);

-- ===== VCerramientos  (filas: 843) =====
CREATE TABLE [VCerramientos] (
  [id] INTEGER NOT NULL,
  [Codigo] NVARCHAR(14),
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinGrupo] INTEGER,
  [Ancho] REAL,
  [Alto] REAL,
  [DescripcionCerr] NVARCHAR,
  [equinHH] SMALLINT,
  [equinHV] SMALLINT,
  [equiAncho] REAL,
  [equiAlto] REAL,
  [CodTapajuntas] NVARCHAR(15),
  [TapajuntasSup] BOOLEAN NOT NULL,
  [TapajuntasInf] BOOLEAN NOT NULL,
  [TapajuntasIzq] BOOLEAN NOT NULL,
  [TapajuntasDer] BOOLEAN NOT NULL,
  [AcaTapajuntas] NVARCHAR(10),
  [AcaTonTapajuntas] NVARCHAR(10),
  [DescripcionManualSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([id])
);

-- ===== VCerramientosLin  (filas: 4103) =====
CREATE TABLE [VCerramientosLin] (
  [nLinea] INTEGER NOT NULL,
  [nCerr] INTEGER,
  [nLinEstr] INTEGER,
  [Orden] SMALLINT,
  [nModulo] SMALLINT,
  [CodEstr] NVARCHAR(14),
  [x] REAL,
  [y] REAL,
  [Ancho] REAL,
  [Alto] REAL,
  [AnchoHueco] REAL,
  [AltoHueco] REAL,
  [EsUnionSN] BOOLEAN NOT NULL,
  [UnionVH] NVARCHAR(1),
  [UOrdenElem1] SMALLINT,
  [UOrdenElem2] SMALLINT,
  [UGrosor] REAL,
  [ULongitud] REAL,
  [ULongitUsr] BOOLEAN NOT NULL,
  [DisEspecificoSN] BOOLEAN NOT NULL,
  [bPersiana] BOOLEAN NOT NULL,
  [bRegP] BOOLEAN NOT NULL,
  [TipoLatFrente] NVARCHAR(1),
  [ULongitMax] REAL,
  [UbIE] BOOLEAN NOT NULL,
  [U_nMod1] SMALLINT,
  [U_nMod2] SMALLINT,
  [Uancho1] REAL,
  [Uancho2] REAL,
  [DisAltoCaj] REAL,
  [DisAltoRegP] REAL,
  [bBloqueoDim] BOOLEAN NOT NULL,
  [IncrAnchoDib] REAL,
  [IncrAltoDib] REAL,
  [UnionOrXdib] REAL,
  [UnionOrYdib] REAL,
  [bTapSup] BOOLEAN NOT NULL,
  [bTapInf] BOOLEAN NOT NULL,
  [bTapIz] BOOLEAN NOT NULL,
  [bTapDe] BOOLEAN NOT NULL,
  [tapIncrH] REAL,
  [tapIncrV] REAL,
  [tapParcDeHIni] REAL,
  [tapParcIzHIni] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VCerramientosPI  (filas: 7957) =====
CREATE TABLE [VCerramientosPI] (
  [nLinea] INTEGER NOT NULL,
  [nCerr] INTEGER,
  [x] REAL,
  [y] REAL,
  [nOrden_elOcup] SMALLINT,
  [nOrden_elOrigen] SMALLINT,
  [PosSOrigen] NVARCHAR(4),
  PRIMARY KEY ([nLinea])
);

-- ===== VClienteRiesgoTmp  (filas: 0) =====
CREATE TABLE [VClienteRiesgoTmp] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Delegacion] NVARCHAR(2) NOT NULL,
  [Serie] NVARCHAR(1) NOT NULL,
  [RiesgoMaximo] DOUBLE,
  [TotalPendiente] DOUBLE,
  [RiesgoMaximoVencido] DOUBLE,
  [TotalPendienteVencido] DOUBLE,
  [RiesgoMaximoRemNoVencido] DOUBLE,
  [TotalRemesadoNoVencido] DOUBLE,
  [RiesgoAseguradoSN] BOOLEAN NOT NULL,
  [ReferenciaCredito] NVARCHAR(20),
  [RiesgoAsegurado] DOUBLE,
  [RiesgoFechaDesde] DATE,
  [RiesgoBloqueoVentasSN] BOOLEAN NOT NULL,
  [RiesgoCondicionalSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente], [Delegacion], [Serie])
);

-- ===== VCobros  (filas: 0) =====
CREATE TABLE [VCobros] (
  [contador] INTEGER NOT NULL,
  [nEfecto] INTEGER,
  [Fecha] DATE,
  [Importe] DOUBLE,
  [Tipo] NVARCHAR(12),
  [nMovCaja] INTEGER,
  [Caja] NVARCHAR(30),
  [ContabSN] BOOLEAN NOT NULL,
  [nCobro] SMALLINT,
  [MetalicoSN] BOOLEAN NOT NULL,
  [nRemesa] NVARCHAR(20),
  [CuentaCob] NVARCHAR(4),
  [GastosImpago] REAL,
  [GastosRenov] REAL,
  [CobTipoRemesa] NVARCHAR(5),
  [CobNumDocPago] NVARCHAR(10),
  [CobVtoDocPago] DATE,
  [FechaContab] DATE,
  [GastosImpagoRepercutidosSN] BOOLEAN NOT NULL,
  [Divisa] NVARCHAR(5),
  [DivisaPrincipal] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaVEfecto] NVARCHAR(5),
  [DivisaVEfectoCambio] REAL,
  [DivisaVEfectoFechaActCambio] DATE,
  [CobroDesvalorizacionSN] BOOLEAN NOT NULL,
  [EstadoAnteriorEfecto] NVARCHAR(10),
  [EstadoDestinoEfecto] NVARCHAR(10),
  [siiEnviadaSN] BOOLEAN NOT NULL,
  [siiFechaEnvio] DATE,
  [siiEstadoAEAT] NVARCHAR(20),
  [siiMedioCobro] NVARCHAR(2),
  [siiCuentaOMedio] NVARCHAR(20),
  [Destino] NVARCHAR(10),
  [nLineaVCobrosAnticipo] INTEGER,
  [ImporteDivisaPrincipal] DOUBLE,
  [ImporteDivisaVEfecto] DOUBLE,
  [TipoCobroAnterior] NVARCHAR(12),
  [Usuario] NVARCHAR(30),
  [CuentaContableCliente] NVARCHAR(15),
  [ComisCalculadaSN] BOOLEAN NOT NULL,
  [ComisPorcentajeFactura] REAL,
  [Comision] REAL,
  [Archivo] NVARCHAR(20),
  [Pagare] NVARCHAR(10),
  [PagareVencimiento] DATE,
  [PagareNombreEntidad] NVARCHAR(40),
  [PagareGeneraEfectoAutoSN] BOOLEAN NOT NULL,
  [PagareVEfectoDestino] INTEGER,
  [ImpresoSN] BOOLEAN NOT NULL,
  [LiquidacionTarjetaSN] BOOLEAN NOT NULL,
  [NumeroLiquidacionTarjeta] NVARCHAR(20),
  PRIMARY KEY ([contador])
);

-- ===== VCobrosACta  (filas: 0) =====
CREATE TABLE [VCobrosACta] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Fecha] DATE,
  [Importe] REAL,
  [ReciboEmitidoSN] BOOLEAN NOT NULL,
  [Concepto] NVARCHAR(140),
  [nCobro] NVARCHAR(2),
  [Caja] NVARCHAR(30),
  [nMovCaja] INTEGER,
  [ContabSN] BOOLEAN NOT NULL,
  [FechaContab] DATE,
  [Divisa] NVARCHAR(5),
  [DivisaPrincipal] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [DivisaVDocumento] NVARCHAR(5),
  [DivisaVDocCambio] REAL,
  [DivisaVDocFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [ImporteDivisaVDocumento] REAL,
  [FacturaSN] BOOLEAN NOT NULL,
  [FacturaId] INTEGER,
  [FacturaNumero] NVARCHAR(20),
  [nLinCobCtaOrigen] INTEGER,
  [Serie] NVARCHAR(1),
  [Destino] NVARCHAR(10),
  [CuentaCob] NVARCHAR(4),
  [Archivo] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== VCobrosAnticipos  (filas: 0) =====
CREATE TABLE [VCobrosAnticipos] (
  [nLinea] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [Fecha] DATE,
  [Importe] REAL,
  [Concepto] NVARCHAR(140),
  [Delegacion] NVARCHAR(2),
  [Destino_Caja] NVARCHAR(30),
  [Destino_nMovCaja] INTEGER,
  [Destino_CuentaCob] NVARCHAR(4),
  [ContabSN] BOOLEAN NOT NULL,
  [FechaContab] DATE,
  [Divisa] NVARCHAR(5),
  [DivisaPrincipal] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [ImportePendienteCompensar] REAL,
  [PendienteDivisaPrincipal] REAL,
  [TipoRemesa] NVARCHAR(5),
  [AnticipoArchivo] NVARCHAR(20)
);

-- ===== VCobrosLiquidaciones  (filas: 0) =====
CREATE TABLE [VCobrosLiquidaciones] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Representante] NVARCHAR(5),
  [CobrosConfirmadosSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30),
  [Destino] NVARCHAR(10),
  [Caja] NVARCHAR(30),
  [CuentaCob] NVARCHAR(4),
  [Delegacion] NVARCHAR(2),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== VCobrosLiquidacionesCobros  (filas: 0) =====
CREATE TABLE [VCobrosLiquidacionesCobros] (
  [nLiquidacion] NVARCHAR(20) NOT NULL,
  [nEfecto] INTEGER NOT NULL,
  [Factura] NVARCHAR(20),
  [nVto] NVARCHAR(4),
  [Vencimiento] DATE,
  [Pendiente] DOUBLE,
  [Cobrado] DOUBLE,
  [FechaCobro] DATE,
  [TipoRemesa] NVARCHAR(5),
  [VtoPagare] DATE,
  PRIMARY KEY ([nLiquidacion], [nEfecto])
);

-- ===== VCobrosLiquidacionesTarjeta  (filas: 0) =====
CREATE TABLE [VCobrosLiquidacionesTarjeta] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Delegacion] NVARCHAR(2),
  [Usuario] NVARCHAR(30),
  [Descripcion] NVARCHAR(100),
  [LiquidacionCerradaSN] BOOLEAN NOT NULL,
  [Caja] NVARCHAR(30),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [Accreedor] NVARCHAR(10),
  [Gastos] DOUBLE,
  [TipoIVA] NVARCHAR(2),
  [IVAporc] REAL,
  [IVA] DOUBLE,
  [TipoRetencion] NVARCHAR(2),
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [GastosTotal] DOUBLE,
  [Comision] DOUBLE,
  [ComisionTipoIVA] NVARCHAR(2),
  [ComisionIVAporc] REAL,
  [ComisionIVA] DOUBLE,
  [ComisionTipoRetencion] NVARCHAR(2),
  [ComisionRetencionPorc] REAL,
  [ComisionRetencion] DOUBLE,
  [ComisionTotal] DOUBLE,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== VCobrosLiquidacionesTarjetaCobros  (filas: 0) =====
CREATE TABLE [VCobrosLiquidacionesTarjetaCobros] (
  [nLiquidacion] NVARCHAR(20) NOT NULL,
  [VCobContador] INTEGER NOT NULL,
  [Factura] NVARCHAR(20),
  [nVto] NVARCHAR(4),
  [FechaCobro] DATE,
  [Cliente] NVARCHAR(10),
  [CliNombre] NVARCHAR(100),
  [CodigoCobroTarjeta] NVARCHAR(10),
  [Vencimiento] DATE,
  [Importe] DOUBLE,
  PRIMARY KEY ([nLiquidacion], [VCobContador])
);

-- ===== VComisionesFac  (filas: 0) =====
CREATE TABLE [VComisionesFac] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [FechaCalculo] DATE,
  [ComisCateg] NVARCHAR(2),
  [BaseCom] REAL,
  [ComisionPorc] REAL,
  [Comision] REAL,
  [NumeroFac] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== VComLiqMinimoBase  (filas: 0) =====
CREATE TABLE [VComLiqMinimoBase] (
  [nLinea] INTEGER NOT NULL,
  [nLiquidacion] NVARCHAR(20) NOT NULL,
  [Cliente] NVARCHAR(10),
  [ComisCateg] NVARCHAR(2),
  [BaseCom] REAL,
  [MinBase] REAL,
  [DiferenciaBase] REAL,
  [ComisionPorc] REAL,
  [DiferenciaComision] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VComLiquidaciones  (filas: 0) =====
CREATE TABLE [VComLiquidaciones] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Representante] NVARCHAR(5),
  [ComisionCobrSN] BOOLEAN NOT NULL,
  [ComisionFechaCobr] DATE,
  [DiferenciaComisionMin] REAL,
  [Tipo] NVARCHAR(10),
  [Delegacion] NVARCHAR(2),
  [TotalComision] REAL,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [Descripcion] NVARCHAR(200),
  PRIMARY KEY ([Numero])
);

-- ===== VComLiquidacionesLin  (filas: 0) =====
CREATE TABLE [VComLiquidacionesLin] (
  [nLinea] INTEGER NOT NULL,
  [nComLiquidacion] NVARCHAR(20) NOT NULL,
  [VEfecto_Contador] INTEGER,
  [VFactura_Id] INTEGER,
  [Tipo] NVARCHAR(10),
  [NumeroFactura] NVARCHAR(20),
  [NumeroVencimiento] SMALLINT,
  [ComisionBase] REAL,
  [FactorAplicar] REAL,
  [ComisionLiquida] REAL,
  [ComentarioLinea] NVARCHAR(40),
  [VCobro_Contador] INTEGER,
  PRIMARY KEY ([nLinea])
);

-- ===== VCompFinfoM2  (filas: 0) =====
CREATE TABLE [VCompFinfoM2] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [PrecioBaseM2] REAL,
  [PrecioIncrM2] REAL,
  [DetalleIncr] NVARCHAR,
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr])
);

-- ===== VCompFpanyos  (filas: 0) =====
CREATE TABLE [VCompFpanyos] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [nPanyo] SMALLINT,
  [ancho] REAL,
  [alto] REAL,
  [GuiaI] NVARCHAR(15),
  [GuiaD] NVARCHAR(15),
  [ArtRec] NVARCHAR(15),
  [PosRecID] NVARCHAR(1),
  [SalRecFI] NVARCHAR(1),
  [GIunidaConPanyo] SMALLINT,
  [GItipoCentralUnionCU] NVARCHAR(1),
  [GIartUnion] NVARCHAR(15),
  [GDunidaConPanyo] SMALLINT,
  [GDtipoCentralUnionCU] NVARCHAR(1),
  [GDartUnion] NVARCHAR(15),
  [GCajeadaSN] BOOLEAN NOT NULL,
  [GCajPosCM] REAL,
  [AcaAcc] NVARCHAR(10),
  [AcaAccTonalidad] NVARCHAR(10),
  [cfInfoMedLama] REAL,
  [cfInfoMedEje] REAL,
  [cfInfoCdadLamas] REAL,
  [ArtEje] NVARCHAR(15),
  [MotorSN] BOOLEAN NOT NULL,
  [artMotor] NVARCHAR(15),
  [cfInfoCodEmbudoI] NVARCHAR(15),
  [cfInfoCodEmbudoD] NVARCHAR(15),
  [cfInfoMedGuiaI] REAL,
  [cfInfoMedGuiaD] REAL,
  [cfInfoCdadFlejes] SMALLINT,
  [cfInfoCodEje] NVARCHAR(15),
  [cfInfoCodFleje] NVARCHAR(15),
  [cfInfoMedPerfilBasculacion] REAL,
  [cfInfoPosicionPerfilBasculacion] REAL,
  [artMando] NVARCHAR(15),
  [descuentoAdLama] SMALLINT,
  [descuentoAdEje] SMALLINT,
  [pañoDchoSeparacionCentral] SMALLINT,
  [cfInfoMedLamaVinculada] REAL,
  [cfInfoCdadLamasVinculadas] REAL,
  [cfInfoCodEmbudoCen] NVARCHAR(15),
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [nPanyo])
);

-- ===== VConceptosMO  (filas: 62812) =====
CREATE TABLE [VConceptosMO] (
  [nRegistro] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLin] INTEGER,
  [Concepto] NVARCHAR(5),
  [Cantidad] REAL,
  PRIMARY KEY ([nRegistro])
);

-- ===== VCopiaTmp  (filas: 0) =====
CREATE TABLE [VCopiaTmp] (
  [TipoDoc] NVARCHAR(6),
  [nDocOrig] INTEGER,
  [nDocDst] INTEGER,
  PRIMARY KEY ([TipoDoc], [nDocOrig])
);

-- ===== VCoste  (filas: 0) =====
CREATE TABLE [VCoste] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] NVARCHAR(8),
  [Familia] NVARCHAR(10) NOT NULL,
  [Coste] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Familia])
);

-- ===== VCosteCodEstr  (filas: 196) =====
CREATE TABLE [VCosteCodEstr] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [EstructuraSN] BOOLEAN NOT NULL,
  [Coste] REAL,
  [Venta] REAL,
  [Cdad] REAL,
  [MetrajeCompacto] REAL,
  [AnchoMedio] REAL,
  [AltoMedio] REAL,
  [tmpDescripcion] NVARCHAR(255),
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [EstructuraSN])
);

-- ===== VCPFcausas  (filas: 0) =====
CREATE TABLE [VCPFcausas] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Codigo])
);

-- ===== VCPFincidencias  (filas: 0) =====
CREATE TABLE [VCPFincidencias] (
  [Numero] NVARCHAR(6) NOT NULL,
  [Fecha] DATE,
  [Estado] NVARCHAR(10),
  [Tipo] NVARCHAR(3),
  [Gravedad] SMALLINT,
  [Titulo] NVARCHAR(100),
  [Descripcion] NVARCHAR,
  [Origen] NVARCHAR(15),
  [ClienteOrigen] NVARCHAR(10),
  [ProveedorOrigen] NVARCHAR(10),
  [TrabajadorOrigen] NVARCHAR(5),
  [TrabajadorDetecta] NVARCHAR(5),
  [Causas] NVARCHAR,
  [Seccion] NVARCHAR(30),
  [Solucion] NVARCHAR,
  [OrigenContacto] NVARCHAR(40),
  [RecogidaSN] BOOLEAN NOT NULL,
  [RecogidaAutorizaVDocSN] BOOLEAN NOT NULL,
  [RecogidaAutorizaVDocResultado] NVARCHAR(10),
  [RecogidaAutorizaVDocUsuarioSolicita] NVARCHAR(30),
  [RecogidaAutorizaVDocUsuarioAut] NVARCHAR(30),
  [RecogidaAutorizaVDocObservaciones] NVARCHAR(255),
  [AbonoSN] BOOLEAN NOT NULL,
  [AbonoAutorizaVDocSN] BOOLEAN NOT NULL,
  [AbonoAutorizaVDocResultado] NVARCHAR(10),
  [AbonoAutorizaVDocUsuarioSolicita] NVARCHAR(30),
  [AbonoAutorizaVDocUsuarioAut] NVARCHAR(30),
  [AbonoAutorizaVDocObservaciones] NVARCHAR(255),
  [ReposicionSN] BOOLEAN NOT NULL,
  [ReposicionAutorizaVDocSN] BOOLEAN NOT NULL,
  [ReposicionAutorizaVDocResultado] NVARCHAR(10),
  [ReposicionAutorizaVDocUsuarioSolicita] NVARCHAR(30),
  [ReposicionAutorizaVDocUsuarioAut] NVARCHAR(30),
  [ReposicionAutorizaVDocObservaciones] NVARCHAR(255),
  [Tipo_INC_NC] NVARCHAR(30),
  [Coste] DOUBLE,
  [Funcion] NVARCHAR(30),
  [FechaCierre] DATE,
  [DiasIncidencia] SMALLINT,
  [MaterialRecogidoSN] BOOLEAN NOT NULL,
  [FechaRecogida] DATE,
  [TrabajadorRecogida] NVARCHAR(5),
  [Delegacion] NVARCHAR(2),
  [Usuario] NVARCHAR(30),
  [FechaInicioTrabajo] DATE,
  [TipoDocumento] NVARCHAR(5),
  [TrabajadorGestiona] NVARCHAR(5),
  [AbonoVDocGeneradoSN] BOOLEAN NOT NULL,
  [AbonoVDocNumeroDoc] NVARCHAR(20),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [TipoCausa] NVARCHAR(10),
  PRIMARY KEY ([Numero])
);

-- ===== VCPFincidenciasAccionesCorr  (filas: 0) =====
CREATE TABLE [VCPFincidenciasAccionesCorr] (
  [nLinea] INTEGER NOT NULL,
  [nIncidencia] NVARCHAR(6) NOT NULL,
  [Fecha] DATE,
  [Vencimiento] DATE,
  [Usuario] NVARCHAR(30),
  [TrabajadorResp] NVARCHAR(5),
  [Descripcion] NVARCHAR(255),
  [Estado] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFincidenciasAccionesCorrRevisiones  (filas: 0) =====
CREATE TABLE [VCPFincidenciasAccionesCorrRevisiones] (
  [nLinea] INTEGER NOT NULL,
  [nIncidencia] NVARCHAR(6) NOT NULL,
  [nLinAccCorr] INTEGER NOT NULL,
  [Fecha] DATE,
  [Trabajador] NVARCHAR(5),
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFincidenciasAuto  (filas: 0) =====
CREATE TABLE [VCPFincidenciasAuto] (
  [nLinea] INTEGER NOT NULL,
  [TipoEvento] NVARCHAR(20),
  [cond_lstClientes] NVARCHAR(255),
  [cond_lstProveedores] NVARCHAR(255),
  [Inc_Tipo] NVARCHAR(30),
  [Inc_Gravedad] SMALLINT,
  [Inc_TipoInc] NVARCHAR(3),
  [Inc_Titulo] NVARCHAR(100),
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFincidenciasHistorial  (filas: 0) =====
CREATE TABLE [VCPFincidenciasHistorial] (
  [nLinea] INTEGER NOT NULL,
  [nIncidencia] NVARCHAR(6) NOT NULL,
  [Fecha] DATE,
  [Descripcion] NVARCHAR(255),
  [Trabajador] NVARCHAR(5),
  [SistemaSN] BOOLEAN NOT NULL,
  [Hora] DATE,
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFincidenciasOrigenDoc  (filas: 0) =====
CREATE TABLE [VCPFincidenciasOrigenDoc] (
  [nIncidencia] NVARCHAR(6) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [NumeroDoc] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([nIncidencia], [TipoDoc], [NumeroDoc])
);

-- ===== VCPFincidenciasOrigenLin  (filas: 0) =====
CREATE TABLE [VCPFincidenciasOrigenLin] (
  [nIncidencia] NVARCHAR(6) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nLinea] INTEGER NOT NULL,
  PRIMARY KEY ([nIncidencia], [TipoDoc], [nLinea])
);

-- ===== VCPFincidenciasRecogidaLin  (filas: 0) =====
CREATE TABLE [VCPFincidenciasRecogidaLin] (
  [nLinea] INTEGER NOT NULL,
  [nIncidencia] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Descripcion] NVARCHAR(255),
  [Cantidad] REAL,
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [Precio] REAL,
  [DescuentoPorc] REAL,
  [ImporteTotal] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFmaquinas  (filas: 0) =====
CREATE TABLE [VCPFmaquinas] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [FechaCompra] DATE,
  [Marca] NVARCHAR(40),
  [Modelo] NVARCHAR(40),
  [NumeroSerie] NVARCHAR(30),
  [SATtelefono] NVARCHAR(20),
  [SATcontacto] NVARCHAR(40),
  [Observaciones] NVARCHAR,
  [BajaSN] BOOLEAN NOT NULL,
  [FechaBaja] DATE,
  [MotivoBaja] NVARCHAR(255),
  [Descripcion] NVARCHAR(255),
  [FechaFabr] DATE,
  [Fabricante] NVARCHAR(100),
  [MarcadoCESN] BOOLEAN NOT NULL,
  [ConformidadSN] BOOLEAN NOT NULL,
  [ManualEspSN] BOOLEAN NOT NULL,
  [Seccion] NVARCHAR(30),
  [Funcion] NVARCHAR(30),
  [CodContable] NVARCHAR(10),
  [Potencia] NVARCHAR(20),
  [LineaNegocio] NVARCHAR(10),
  PRIMARY KEY ([Codigo])
);

-- ===== VCPFmaquinasArticulos  (filas: 0) =====
CREATE TABLE [VCPFmaquinasArticulos] (
  [Maquina] NVARCHAR(10) NOT NULL,
  [Articulo] NVARCHAR(60) NOT NULL,
  [Referencia] NVARCHAR(50),
  [Observaciones] NVARCHAR,
  PRIMARY KEY ([Maquina], [Articulo])
);

-- ===== VCPFmaquinasRegistro  (filas: 0) =====
CREATE TABLE [VCPFmaquinasRegistro] (
  [nLinea] INTEGER NOT NULL,
  [Maquina] NVARCHAR(10) NOT NULL,
  [Fecha] DATE NOT NULL,
  [Descripcion] NVARCHAR NOT NULL,
  [Firma] NVARCHAR(30) NOT NULL,
  [Titulo] NVARCHAR(100),
  [UsuarioRegistra] NVARCHAR(30),
  [TrabajadorDetecta] NVARCHAR(5),
  [TrabajadorSoluciona] NVARCHAR(5),
  [Observaciones] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFmaquinasRevisiones  (filas: 0) =====
CREATE TABLE [VCPFmaquinasRevisiones] (
  [nLinea] INTEGER NOT NULL,
  [Maquina] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(255) NOT NULL,
  [Periodicidad] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== VCPFtipos  (filas: 0) =====
CREATE TABLE [VCPFtipos] (
  [Codigo] NVARCHAR(3) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [Origen] NVARCHAR(15),
  [ProdWebPublicoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== VCTEOrientaciones  (filas: 0) =====
CREATE TABLE [VCTEOrientaciones] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Orientacion] NVARCHAR(2) NOT NULL,
  [porcHuecos] SMALLINT,
  [UMm] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Orientacion])
);

-- ===== VCTEvaloresLimiteYmedios  (filas: 0) =====
CREATE TABLE [VCTEvaloresLimiteYmedios] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Orientacion] NVARCHAR(2) NOT NULL,
  [CargaInt] NVARCHAR(4) NOT NULL,
  [UHlim] REAL,
  [FHlim] REAL,
  [UHm] REAL,
  [FHm] REAL,
  [sumArea] REAL,
  [sumAporU] REAL,
  [sumAporF] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Orientacion], [CargaInt])
);

-- ===== VDatosDiseño  (filas: 6558) =====
CREATE TABLE [VDatosDiseño] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [DA3sn] BOOLEAN NOT NULL,
  [DA4sn] BOOLEAN NOT NULL,
  [DA5sn] BOOLEAN NOT NULL,
  [NombreDA3] NVARCHAR(15),
  [NombreDA4] NVARCHAR(15),
  [NombreDA5] NVARCHAR(15),
  [SimboloDA3] NVARCHAR(3),
  [SimboloDA4] NVARCHAR(3),
  [SimboloDA5] NVARCHAR(3),
  [DisAncho] REAL,
  [DisAlto] REAL,
  [DisPersianaSN] BOOLEAN NOT NULL,
  [DisTapSN] BOOLEAN NOT NULL,
  [DisRegPSN] BOOLEAN NOT NULL,
  [DisHerraje] NVARCHAR(15),
  [DisMIF] BOOLEAN NOT NULL,
  [DisMSF] BOOLEAN NOT NULL,
  [DisFIsn] BOOLEAN NOT NULL,
  [DisFIsup] NVARCHAR(1),
  [DisFIinf] NVARCHAR(1),
  [DisFIizda] NVARCHAR(1),
  [DisFIdcha] NVARCHAR(1),
  [DisTCurva] SMALLINT,
  [CurCurvadoSN] BOOLEAN NOT NULL,
  [CurMaterialSN] BOOLEAN NOT NULL,
  [CurFabrSN] BOOLEAN NOT NULL,
  [compfAltCaj] REAL,
  [compfAcaCaj] NVARCHAR(10),
  [compfAcaLama] NVARCHAR(10),
  [CompfAcaTerm] NVARCHAR(10),
  [compfGuiaI] NVARCHAR(15),
  [compfGuiaD] NVARCHAR(15),
  [compfAcaGuias] NVARCHAR(10),
  [compfAcaTes] NVARCHAR(10),
  [compfGCsn] BOOLEAN NOT NULL,
  [compfPosGC] REAL,
  [compCajGsn] BOOLEAN NOT NULL,
  [compCajAltura] REAL,
  [CompArtRec] NVARCHAR(15),
  [compfAcaAcc] NVARCHAR(10),
  [CompArtTerm] NVARCHAR(15),
  [compSalRecFI] NVARCHAR(1),
  [compPosCable] REAL,
  [compTamLama] REAL,
  [compCodLama] NVARCHAR(15),
  [CompAcaLama] NVARCHAR(10),
  [compFsecCarp] REAL,
  [compFsecCamara] REAL,
  [CompFnPanyos] SMALLINT,
  [CompFincrGuiaCM] REAL,
  [CompFCodDisco] NVARCHAR(15),
  [CompFCodPlacas] NVARCHAR(15),
  [CompFCodEje] NVARCHAR(15),
  [CompFCodContera] NVARCHAR(15),
  [CompFnumSaltosCaj] SMALLINT,
  [cfInfoMedCajon] REAL,
  [cfInfoMedLama] REAL,
  [cfInfoMedEje] REAL,
  [cfInfoMedGuia] REAL,
  [cfInfoCdadLamas] REAL,
  [compAcaAcc] NVARCHAR(10),
  [CompFprecioM2] REAL,
  [compfVI] REAL,
  [compfVD] REAL,
  [compfAcaCajTonalidad] NVARCHAR(10),
  [compfAcaLamaTonalidad] NVARCHAR(10),
  [CompfAcaTermTonalidad] NVARCHAR(10),
  [compfAcaGuiasTonalidad] NVARCHAR(10),
  [compfAcaTesTonalidad] NVARCHAR(10),
  [compfAcaAccTonalidad] NVARCHAR(10),
  [CompAcaLamaTonalidad] NVARCHAR(10),
  [CompfAcaTapExtr] NVARCHAR(10),
  [CompfAcaTapExtrTonalidad] NVARCHAR(10),
  [CompFCodTestero] NVARCHAR(15),
  [compfAcaGuiacin] NVARCHAR(10),
  [compfAcaGuiacinTonalidad] NVARCHAR(10),
  [CompFdtoAdLam] SMALLINT,
  [cfInfoTapLamaSN] BOOLEAN NOT NULL,
  [compfAcaAcc1] NVARCHAR(10),
  [compfAcaAcc1Tonalidad] NVARCHAR(10),
  [compfAcaAcc2] NVARCHAR(10),
  [compfAcaAcc2Tonalidad] NVARCHAR(10),
  [compfAcaAcc3] NVARCHAR(10),
  [compfAcaAcc3Tonalidad] NVARCHAR(10),
  [cfInfoAnchoMultiplos] REAL,
  [cfInfoAltoMultiplos] REAL,
  [CompFacaTopes] NVARCHAR(10),
  [CompFacaTopesTonalidad] NVARCHAR(10),
  [CompFSalAccVueloVP] NVARCHAR(1),
  [cfInfoCodEmbudo] NVARCHAR(15),
  [cfInfoCodTope] NVARCHAR(15),
  [cfInfoCerrojillosSN] BOOLEAN NOT NULL,
  [cfInfoAccCaj1] NVARCHAR(15),
  [cfInfoAccCaj2] NVARCHAR(15),
  [cfInfoAccCaj3] NVARCHAR(15),
  [cfInfoTapExtr1] NVARCHAR(15),
  [cfInfoTapExtr2] NVARCHAR(15),
  [cfInfoTapExtr3] NVARCHAR(15),
  [CompfAcaTapExtr2] NVARCHAR(10),
  [CompfAcaTapExtr2Tonalidad] NVARCHAR(10),
  [CompfAcaTapExtr3] NVARCHAR(10),
  [CompfAcaTapExtr3Tonalidad] NVARCHAR(10),
  [CompFsinTopesSN] BOOLEAN NOT NULL,
  [CompFDiseñoSN] BOOLEAN NOT NULL,
  [CompFmotorSN] BOOLEAN NOT NULL,
  [CompFmotorUnicoSN] BOOLEAN NOT NULL,
  [CompFmotorPaño1] NVARCHAR(15),
  [CompFmotorPaño2] NVARCHAR(15),
  [cfInfoOpcTesNombre] NVARCHAR(20),
  [compfAcaAcc4] NVARCHAR(10),
  [compfAcaAcc4Tonalidad] NVARCHAR(10),
  [cfInfoAccCaj4] NVARCHAR(15),
  [compPosRecID] NVARCHAR(4),
  [cfInfoMedLama_P2] REAL,
  [cfInfoMedEje_P2] REAL,
  [cfInfoCdadLamas_P2] REAL,
  [CompFdtoAdEje] SMALLINT,
  [cfInfoOpcTesCenNombre] NVARCHAR(20),
  [CompfDemasiaCajI] REAL,
  [CompfDemasiaCajD] REAL,
  [CompFCodTopes] NVARCHAR(15),
  [cfInfoAnguloSN] BOOLEAN NOT NULL,
  [tldAccionamiento_MAN_MOT] NVARCHAR(3),
  [tldAccionamiento] NVARCHAR(15),
  [tldAcaAccionamiento] NVARCHAR(10),
  [tldAcaCofre] NVARCHAR(10),
  [tldAcaLona] NVARCHAR(10),
  [tldAcaAccionamientoTonalidad] NVARCHAR(10),
  [tldAcaCofreTonalidad] NVARCHAR(10),
  [tldAcaLonaTonalidad] NVARCHAR(10),
  [tldCofreSN] BOOLEAN NOT NULL,
  [tldLona] NVARCHAR(15),
  [tldBarraCarga] NVARCHAR(15),
  [tldSoporte] NVARCHAR(15),
  [tldInfoCodEje] NVARCHAR(15),
  [DisFCsup] NVARCHAR(15),
  [DisFCinf] NVARCHAR(15),
  [DisFClat] NVARCHAR(15),
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  [cfInfoCodEmbudoD] NVARCHAR(15),
  [TldMaqColoc_DF] NVARCHAR(1),
  [TldPartidoSN] BOOLEAN NOT NULL,
  [TldPartMedida] REAL,
  [tldSoporteCentral] NVARCHAR(15),
  [cfInfoCodTestero] NVARCHAR(15),
  [cfInfoGrapLamaSN] BOOLEAN NOT NULL,
  [CompFSalAccVueloVPD] NVARCHAR(1),
  [CompFvueloDesplI] REAL,
  [CompFvueloDesplD] REAL,
  [CompfAcaAngulo] NVARCHAR(10),
  [CompfAcaAnguloTonalidad] NVARCHAR(10),
  [compfGuiaC] NVARCHAR(15),
  [CompFcdadLamasCiegas] SMALLINT,
  [compBajadaDF] NVARCHAR(1),
  [CompFCodPasacintas] NVARCHAR(15),
  [CompFPlacaRetenedoraSN] BOOLEAN NOT NULL,
  [cfInfoCdadFlejes] SMALLINT,
  [cfInfoCdadFlejes_P2] SMALLINT,
  [CompFCodFlejes] NVARCHAR(15),
  [cfInfoCodEje] NVARCHAR(15),
  [cfInfoCodFleje] NVARCHAR(15),
  [cfInfoCodFleje_P2] NVARCHAR(15),
  [cfInfoCodCajon] NVARCHAR(15),
  [cfInfoCodAngulo] NVARCHAR(15),
  [CompFAcaPerfilBasculacion] NVARCHAR(10),
  [CompFAcaPerfilBasculacionTonalidad] NVARCHAR(10),
  [CompFdtoAdPerfilBasculacion] SMALLINT,
  [cfInfoCodPerfilBasculacion] NVARCHAR(15),
  [cfInfoMedPerfilBasculacion] REAL,
  [cfInfoMedPerfilBasculacion_P2] REAL,
  [cfInfoPosicionPerfilBasculacion] REAL,
  [CompFCodCinta] NVARCHAR(15),
  [cfInfoCodCinta] NVARCHAR(15),
  [CompFmotorMandoPaño1] NVARCHAR(15),
  [CompFmotorMandoPaño2] NVARCHAR(15),
  [CompFbloqueoEjeSN] BOOLEAN NOT NULL,
  [CompFanularCajonSN] BOOLEAN NOT NULL,
  [CompFacaEmbudos] NVARCHAR(10),
  [CompFacaEmbudosTonalidad] NVARCHAR(10),
  [CompFmotorMandoCantidad] SMALLINT,
  [tldCofre] NVARCHAR(15),
  [tldBrazosAdicionales] SMALLINT,
  [tldFaldillaModelo] NVARCHAR(40),
  [tldFaldillaMedida] REAL,
  [tldRibeteSN] BOOLEAN NOT NULL,
  [tldOpcionCortePaños] NVARCHAR(20),
  [tldEje] NVARCHAR(15),
  [tldMandoMotor] NVARCHAR(15),
  [tldAcaRibete] NVARCHAR(10),
  [tldAcaRibeteTonalidad] NVARCHAR(10),
  [tldLonaDobleCaidaSN] BOOLEAN NOT NULL,
  [tldPosicionAccionamiento] NVARCHAR(30),
  [tldBrazoCruceSN] BOOLEAN NOT NULL,
  [CompFTipoMedAncho] NVARCHAR(8),
  [CompFTipoMedAlto] NVARCHAR(8),
  [CompFcantidadMandosIgualMotSN] BOOLEAN NOT NULL,
  [CompFbloqueoGuiasSN] BOOLEAN NOT NULL,
  [CompFbloqueoAltCajSN] BOOLEAN NOT NULL,
  [cfInfoLamaVinculada] NVARCHAR(15),
  [tldRibete] NVARCHAR(15),
  [cfInfoMedLamaVinculada] REAL,
  [cfInfoCdadLamasVinculadas] REAL,
  [cfInfoMedLamaVinculada_P2] REAL,
  [cfInfoCdadLamasVinculadas_P2] REAL,
  [tldGradosInclinacion] REAL,
  [cfInfoCodPasacintas] NVARCHAR(15),
  [cfInfoCodEmbudoCen] NVARCHAR(15),
  [cfInfoCodTesteroVuelo] NVARCHAR(15),
  [cfInfoCodDisco] NVARCHAR(15),
  [cfInfoCodPlacas] NVARCHAR(15),
  [tldAutomatismo] NVARCHAR(15),
  [tldMotorMandoCantidad] SMALLINT,
  [tldCantidadMandosIgualMotSN] BOOLEAN NOT NULL,
  [cfInfoCodContera] NVARCHAR(15),
  [tldLonaSinConfeccionSN] BOOLEAN NOT NULL,
  [tldLonaCosidaSoldada] NVARCHAR(1),
  [tldAcaHilo] NVARCHAR(10),
  [tldAcaHiloTonalidad] NVARCHAR(10),
  [tldLonaFaldilla] NVARCHAR(60),
  PRIMARY KEY ([nLinea])
);

-- ===== VDatosLinAuxiliares  (filas: 0) =====
CREATE TABLE [VDatosLinAuxiliares] (
  [nLinId] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nVDoc] INTEGER,
  [nVLinea] INTEGER,
  [NumeroDato] SMALLINT,
  [DatoAuxiliar1] NVARCHAR(50),
  [DatoAuxiliar2] NVARCHAR(50),
  [DatoAuxiliar3] NVARCHAR(50),
  PRIMARY KEY ([nLinId])
);

-- ===== VDatosLinDetDis  (filas: 196267) =====
CREATE TABLE [VDatosLinDetDis] (
  [nLinId] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nVDoc] INTEGER,
  [nVLinea] INTEGER,
  [nVLinEstr] INTEGER,
  [Componente] NVARCHAR(5),
  [CV] NVARCHAR(3),
  [Grupo] NVARCHAR(3),
  [DisTipoHoja] SMALLINT,
  [DisTipoCurva] SMALLINT,
  [DisManoID] NVARCHAR(1),
  [DisIdHoja] INTEGER,
  [DismoVP] NVARCHAR(1),
  [DisTipoHuecoH] INTEGER,
  [DisTipoHuecoV] INTEGER,
  [DisVidrio] NVARCHAR(15),
  [DisId] INTEGER,
  [DisIdIt] INTEGER,
  [DisPosPerf] NVARCHAR(3),
  [DisIdPerAdSup] INTEGER,
  [DisIdPerAdInf] INTEGER,
  [DisIdPerAdIz] INTEGER,
  [DisIdPerAdDe] INTEGER,
  [DisGrupoAdOp] SMALLINT,
  [DisIdRefLargo] INTEGER,
  [DisIdRefAncho] INTEGER,
  [DisOperacionEquiV] SMALLINT,
  [DisOperacionEquiH] SMALLINT,
  [DisDtoAd] REAL,
  [nLinRefuerzo] INTEGER,
  [DisIdPerAd] INTEGER,
  [DisFRefLargo] NVARCHAR(255),
  [DisFRefAncho] NVARCHAR(255),
  [DisNHoja] SMALLINT,
  [refuCodArt] NVARCHAR(15),
  [refuLongit] REAL,
  [DisGrupo] NVARCHAR(5),
  [DisGrupoI] NVARCHAR(5),
  [DisGrupoD] NVARCHAR(5),
  [DisGrupoSup] NVARCHAR(5),
  [DisGrupoInf] NVARCHAR(5),
  [DisGrupoAdicional] NVARCHAR(5),
  [DisGrupoAd2] NVARCHAR(5),
  [DisGrupoAd3] NVARCHAR(5),
  [DisGrupoAdIndep] NVARCHAR(5),
  [DisGrupoEquiExtV] NVARCHAR(5),
  [DisGrupoEquiExtH] NVARCHAR(5),
  [DisGrupoEquiCentro] NVARCHAR(5),
  PRIMARY KEY ([nLinId])
);

-- ===== VDatosLinEstr  (filas: 10752) =====
CREATE TABLE [VDatosLinEstr] (
  [nLinId] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nVDoc] INTEGER,
  [nVLinea] INTEGER,
  [HorasAdFabr] REAL,
  [HorasColoc] REAL,
  [TipoColoc] NVARCHAR(3),
  [Familia1] NVARCHAR(10),
  [Familia2] NVARCHAR(10),
  [Familia3] NVARCHAR(10),
  [Familia4] NVARCHAR(10),
  [Conjunto1] NVARCHAR(15),
  [Conjunto2] NVARCHAR(15),
  [Conjunto3] NVARCHAR(15),
  [Conjunto4] NVARCHAR(15),
  [nTAcris] SMALLINT,
  [FamiliaElim1] NVARCHAR(10),
  [FamiliaElim2] NVARCHAR(10),
  [DisEspecificoSN] BOOLEAN NOT NULL,
  [DisHerraje] NVARCHAR(15),
  [Vidrio2] NVARCHAR(15),
  [PendienteGenSN] BOOLEAN NOT NULL,
  [CTEvalorUhm] REAL,
  [CTEvalorUhv] REAL,
  [CTEvalorUh] REAL,
  [CTEorientacion] NVARCHAR(2),
  [CTE_cargaInt] NVARCHAR(4),
  [CTEvalorUhmax] REAL,
  [CTEfactorSombra] REAL,
  [CTEvalorFh] REAL,
  [CEaplicableSN] BOOLEAN NOT NULL,
  [CEuso] NVARCHAR(10),
  [CEproductoPorUnidadSN] BOOLEAN NOT NULL,
  [CEidVCEcaracteristicas] SMALLINT,
  [DAcamara] SMALLINT,
  [CEnoValidoSN] BOOLEAN NOT NULL,
  [CEEEVpermeabilidadAireClase] SMALLINT,
  [CEEEVclaseEEInvierno] NVARCHAR(1),
  [CEEEVclaseEEVerano] NVARCHAR(3),
  [CEEEVtransmitanciaTermica] REAL,
  [CEEEVtransmitanciaMarco] REAL,
  [CEEEVtransmitanciaVidrio] REAL,
  [CEEEVfactorSolarVidrio] REAL,
  [MecRecogedorSN] BOOLEAN NOT NULL,
  [MecRecogedorPosicion_IZ_DE_ID] NVARCHAR(2),
  [MecRecogedorAltura] SMALLINT,
  [MecRecogedorAltura2] SMALLINT,
  PRIMARY KEY ([nLinId])
);

-- ===== VDatosLinMecanizados  (filas: 0) =====
CREATE TABLE [VDatosLinMecanizados] (
  [nLinId] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nVDoc] INTEGER,
  [nVLinea] INTEGER,
  [nVLinEstr] INTEGER,
  [IdMecOperacion] INTEGER,
  PRIMARY KEY ([nLinId])
);

-- ===== VDespunteDetalle  (filas: 2212) =====
CREATE TABLE [VDespunteDetalle] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER,
  [Tipo_Perfiles_Barras] NVARCHAR(10),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [LargoBarra] REAL,
  [CantidadBarras] REAL,
  [MetrajeBarras] REAL,
  [CosteBarras] REAL,
  [CostePerfiles] REAL,
  [AnchoPanel] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VDibujos  (filas: 0) =====
CREATE TABLE [VDibujos] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [IdDibujo] INTEGER,
  PRIMARY KEY ([nLinea])
);

-- ===== VDocCosteSelProvArticulo  (filas: 0) =====
CREATE TABLE [VDocCosteSelProvArticulo] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VDocCosteSelProvSubfamilia  (filas: 0) =====
CREATE TABLE [VDocCosteSelProvSubfamilia] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Proveedor] NVARCHAR(10),
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Familia], [Subfamilia])
);

-- ===== VDocNotifica  (filas: 0) =====
CREATE TABLE [VDocNotifica] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [TipoNotificacion] NVARCHAR(40) NOT NULL,
  [MetodoNotificacion] NVARCHAR(5) NOT NULL,
  [NotificarSN] BOOLEAN NOT NULL,
  [NotificadoSN] BOOLEAN NOT NULL,
  [FechaNotificado] DATE,
  [NoNotificarAutoSN] BOOLEAN NOT NULL,
  [eMail] NVARCHAR(255),
  [TelefonoDestino] NVARCHAR(20),
  PRIMARY KEY ([nLinea])
);

-- ===== VDocOptimizacion  (filas: 0) =====
CREATE TABLE [VDocOptimizacion] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Tipo] NVARCHAR(2),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [nBarra] SMALLINT,
  [idBarra] INTEGER,
  [nBarraAgrup] SMALLINT,
  [Longitud] REAL,
  [LongitudInt] REAL,
  [TipoI] SMALLINT,
  [TipoD] SMALLINT,
  [nOrden] INTEGER,
  [idMec] INTEGER,
  [DesperdicioBarra] SMALLINT,
  [CodCarro] NVARCHAR(3),
  [nHueco] SMALLINT,
  [nPasada] SMALLINT,
  [nLinEstr] INTEGER,
  [nLineaArt] INTEGER,
  [nPanel] SMALLINT,
  [Ancho] SMALLINT,
  [Largo] SMALLINT,
  [PosH] SMALLINT,
  [PosV] SMALLINT,
  [nCorte] INTEGER,
  [DisIdIt] INTEGER,
  [DisPosPerf] NVARCHAR(3),
  [DisFuncion] NVARCHAR(20),
  [bDobleEt] BOOLEAN NOT NULL,
  [nOrden2et] INTEGER,
  [optnArt] INTEGER,
  [optnPer] INTEGER,
  [mecBandInfRestar] REAL,
  [mecEstatCodOp] NVARCHAR(10),
  [mecZonaAB] NVARCHAR(1),
  [mecInvertirInvSN] BOOLEAN NOT NULL,
  [mecMulti_IDprinc] INTEGER,
  [mecMulti_txtIDs] NVARCHAR(30),
  [AcaTonalidad] NVARCHAR(10),
  [LongitudSinSold] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [tronFormatoCorte] NVARCHAR(3),
  [nOrdenF] NVARCHAR(20),
  [RefEstr] NVARCHAR(50),
  PRIMARY KEY ([nLin])
);

-- ===== VDocOptimizacionBarras  (filas: 0) =====
CREATE TABLE [VDocOptimizacionBarras] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Proveedor] NVARCHAR(10),
  [nBarra] SMALLINT,
  [TextoBarra] NVARCHAR,
  [LargoBarra] SMALLINT,
  [DesperdicioBarra] SMALLINT,
  [NumeroBarras] SMALLINT,
  [nOrdenBarras] INTEGER,
  [idResto] INTEGER,
  [bRestoTTaller] BOOLEAN NOT NULL,
  [nBarrasMult] SMALLINT,
  [AcaTonalidad] NVARCHAR(10),
  [tronFormatoCorte] NVARCHAR(3),
  [nOrdenF] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== VDocOptimizacionBarrasNeg  (filas: 0) =====
CREATE TABLE [VDocOptimizacionBarrasNeg] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [LargoBarra] INTEGER,
  [NumeroBarras] SMALLINT,
  [nOrdenF] NVARCHAR(20),
  PRIMARY KEY ([nLin])
);

-- ===== VDocumentosControl  (filas: 1089) =====
CREATE TABLE [VDocumentosControl] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nVDoc] INTEGER NOT NULL,
  [CosteMedCalculadoSN] BOOLEAN NOT NULL,
  [CosteMedCalculadoFecha] DATE,
  [LastModified] DATE,
  [DespunteCalculadoSN] BOOLEAN NOT NULL,
  [DespunteCalculadoFecha] DATE,
  PRIMARY KEY ([TipoDoc], [nVDoc])
);

-- ===== VDocumentosGrupos  (filas: 0) =====
CREATE TABLE [VDocumentosGrupos] (
  [TipoDoc] NVARCHAR(6),
  [Fecha] DATE,
  [Descripcion] NVARCHAR(100),
  [AdvertenciaEliminarSN] BOOLEAN NOT NULL,
  [AdvertenciaTransformarSN] BOOLEAN NOT NULL,
  [BloqueaEliminarSN] BOOLEAN NOT NULL,
  [BloqueaTransformarSN] BOOLEAN NOT NULL,
  [AdvertenciaModificarSN] BOOLEAN NOT NULL,
  [IdGrupo] NVARCHAR(6) NOT NULL,
  [AdvertenciaAccionesRepartoSN] BOOLEAN NOT NULL,
  [BloqueaAccionesRepartoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([IdGrupo])
);

-- ===== VDocumentosImagenes  (filas: 0) =====
CREATE TABLE [VDocumentosImagenes] (
  [IdImagen] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [NumeroDocumento] NVARCHAR(20),
  [Fecha] DATE,
  [Trabajador] NVARCHAR(5),
  [Titulo] NVARCHAR(80),
  [Descripcion] NVARCHAR(200),
  [NombreBlob] NVARCHAR(40),
  [UrlImagen] NVARCHAR(255),
  PRIMARY KEY ([IdImagen])
);

-- ===== VEfectos  (filas: 0) =====
CREATE TABLE [VEfectos] (
  [contador] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [nVto] NVARCHAR(4),
  [Estado] NVARCHAR(10),
  [Concepto] NVARCHAR(255),
  [FechaImpago] DATE,
  [DocumImpago] NVARCHAR(10),
  [impNominal] REAL,
  [GastosImpago] REAL,
  [GastosRenov] REAL,
  [TipoRemesa] NVARCHAR(5),
  [Fecha] DATE,
  [Vencimiento] DATE,
  [Importe] DOUBLE,
  [Pendiente] DOUBLE,
  [CodEnt] NVARCHAR(4),
  [CodSuc] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [CodCuenta] NVARCHAR(10),
  [numDocPago] NVARCHAR(10),
  [VtoDocPago] DATE,
  [SelecSN] NVARCHAR(1),
  [RemesaSN] BOOLEAN NOT NULL,
  [nRemesa] NVARCHAR(20),
  [ImpresoSN] BOOLEAN NOT NULL,
  [NoInformesSN] BOOLEAN NOT NULL,
  [Serie] NVARCHAR(1),
  [RespCobro] NVARCHAR(5),
  [EfectoManualSN] BOOLEAN NOT NULL,
  [DomicDatosCuenSN] BOOLEAN NOT NULL,
  [DomicEntidad] NVARCHAR(4),
  [DomicSucursal] NVARCHAR(4),
  [DomicDC] NVARCHAR(2),
  [DomicCuenta] NVARCHAR(10),
  [DomicNombreEntidad] NVARCHAR(40),
  [tmp_ImpLetra1] NVARCHAR(100),
  [tmp_ImpLetra2] NVARCHAR(100),
  [PagareContabSN] BOOLEAN NOT NULL,
  [Representante] NVARCHAR(5),
  [CliNombre] NVARCHAR(100),
  [ContabSN] BOOLEAN NOT NULL,
  [nFac] NVARCHAR(20),
  [Obra] NVARCHAR(60),
  [RetencionSN] BOOLEAN NOT NULL,
  [tmp_Dias] SMALLINT,
  [tmp_DiasCobro] SMALLINT,
  [tmp_DiasCobroPond] REAL,
  [CuentaBancariaIntl] NVARCHAR(80),
  [DomicCuentaBancariaIntl] NVARCHAR(80),
  [FechaContab] DATE,
  [FechaPagareContab] DATE,
  [FechaEntregaFac] DATE,
  [ComisCalculadaSN] BOOLEAN NOT NULL,
  [ComisPorcentajeFactura] REAL,
  [Comision] REAL,
  [DelegacionFac] NVARCHAR(2),
  [FechaRecibidoDocPago] DATE,
  [FormaPagoFac] NVARCHAR(5),
  [BIC] NVARCHAR(11),
  [DomicBIC] NVARCHAR(11),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [PendienteDivisaPrincipal] REAL,
  [TipoDocumentoFac] NVARCHAR(5),
  [DesvalorizacionSN] BOOLEAN NOT NULL,
  [NumerosFacturasAgrupadas] NVARCHAR,
  [GrupoEfectosSN] BOOLEAN NOT NULL,
  [ZonaFac] NVARCHAR(5),
  [NotificadoClienteSN] BOOLEAN NOT NULL,
  [DomicClienteCuentaBancaria] NVARCHAR(3),
  [PagareNegociadoNombreEntidad] NVARCHAR(40),
  [PagareNegociadoFecha] DATE,
  [PagareNegociadoFechaCobro] DATE,
  [UsuarioPagare] NVARCHAR(30),
  [PagareArchivo] NVARCHAR(20),
  [EfectoPagareAutoSN] BOOLEAN NOT NULL,
  [EfectoVCobroPagareOrigen] INTEGER,
  [OrigenLiquidacionTarjetaSN] BOOLEAN NOT NULL,
  [NumeroLiquidacionTarjeta] NVARCHAR(20),
  PRIMARY KEY ([contador])
);

-- ===== VEfectosAgrupados  (filas: 0) =====
CREATE TABLE [VEfectosAgrupados] (
  [Contador] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [nVto] NVARCHAR(4),
  [Estado] NVARCHAR(10),
  [Concepto] NVARCHAR(255),
  [FechaImpago] DATE,
  [DocumImpago] NVARCHAR(10),
  [impNominal] REAL,
  [GastosImpago] REAL,
  [GastosRenov] REAL,
  [TipoRemesa] NVARCHAR(5),
  [Fecha] DATE,
  [Vencimiento] DATE,
  [Importe] DOUBLE,
  [Pendiente] DOUBLE,
  [CodEnt] NVARCHAR(4),
  [CodSuc] NVARCHAR(4),
  [DC] NVARCHAR(2),
  [CodCuenta] NVARCHAR(10),
  [numDocPago] NVARCHAR(10),
  [VtoDocPago] DATE,
  [SelecSN] NVARCHAR(1),
  [RemesaSN] BOOLEAN NOT NULL,
  [nRemesa] NVARCHAR(20),
  [ImpresoSN] BOOLEAN NOT NULL,
  [NoInformesSN] BOOLEAN NOT NULL,
  [Serie] NVARCHAR(1),
  [RespCobro] NVARCHAR(5),
  [EfectoManualSN] BOOLEAN NOT NULL,
  [DomicDatosCuenSN] BOOLEAN NOT NULL,
  [DomicEntidad] NVARCHAR(4),
  [DomicSucursal] NVARCHAR(4),
  [DomicDC] NVARCHAR(2),
  [DomicCuenta] NVARCHAR(10),
  [DomicNombreEntidad] NVARCHAR(40),
  [tmp_ImpLetra1] NVARCHAR(100),
  [tmp_ImpLetra2] NVARCHAR(100),
  [PagareContabSN] BOOLEAN NOT NULL,
  [Representante] NVARCHAR(5),
  [CliNombre] NVARCHAR(100),
  [ContabSN] BOOLEAN NOT NULL,
  [nFac] NVARCHAR(20),
  [Obra] NVARCHAR(60),
  [RetencionSN] BOOLEAN NOT NULL,
  [tmp_Dias] SMALLINT,
  [tmp_DiasCobro] SMALLINT,
  [tmp_DiasCobroPond] REAL,
  [CuentaBancariaIntl] NVARCHAR(80),
  [DomicCuentaBancariaIntl] NVARCHAR(80),
  [FechaContab] DATE,
  [FechaPagareContab] DATE,
  [FechaEntregaFac] DATE,
  [ComisCalculadaSN] BOOLEAN NOT NULL,
  [ComisPorcentajeFactura] REAL,
  [Comision] REAL,
  [DelegacionFac] NVARCHAR(2),
  [FechaRecibidoDocPago] DATE,
  [FormaPagoFac] NVARCHAR(5),
  [BIC] NVARCHAR(11),
  [DomicBIC] NVARCHAR(11),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [DivisaFechaActCambio] DATE,
  [ImporteDivisaPrincipal] REAL,
  [PendienteDivisaPrincipal] REAL,
  [TipoDocumentoFac] NVARCHAR(5),
  [DesvalorizacionSN] BOOLEAN NOT NULL,
  [NumerosFacturasAgrupadas] NVARCHAR,
  [nGrupoEfecto] INTEGER,
  [ZonaFac] NVARCHAR(5),
  [NotificadoClienteSN] BOOLEAN NOT NULL,
  [DomicClienteCuentaBancaria] NVARCHAR(3),
  [PagareNegociadoNombreEntidad] NVARCHAR(40),
  [PagareNegociadoFecha] DATE,
  [PagareNegociadoFechaCobro] DATE,
  [UsuarioPagare] NVARCHAR(30),
  [PagareArchivo] NVARCHAR(20),
  PRIMARY KEY ([Contador])
);

-- ===== VEstructurasVariables  (filas: 0) =====
CREATE TABLE [VEstructurasVariables] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [nLinEstr] INTEGER NOT NULL,
  [Estructura] NVARCHAR(60) NOT NULL,
  [SimboloVariable] NVARCHAR(5) NOT NULL,
  [Valor] REAL,
  [SubestructuraSN] BOOLEAN NOT NULL,
  [CodPadreSubestructura] NVARCHAR(60),
  [NumeroInstancia] SMALLINT NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [Estructura], [SimboloVariable], [NumeroInstancia])
);

-- ===== VEstudioCTE  (filas: 0) =====
CREATE TABLE [VEstudioCTE] (
  [id] INTEGER NOT NULL,
  [Numero] NVARCHAR(10) NOT NULL,
  [Cliente] NVARCHAR(10),
  [CliNombre] NVARCHAR(100),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliAtt] NVARCHAR(30),
  [CliTelefono] NVARCHAR(20),
  [CliFax] NVARCHAR(20),
  [Fecha] DATE,
  [Obra] NVARCHAR(60),
  [Observaciones] NVARCHAR,
  [CTEzonaClimatica] NVARCHAR(2),
  [CTEcodigoProvincia] NVARCHAR(2),
  [CTEaltitud] SMALLINT,
  [CliNIF] NVARCHAR(30),
  PRIMARY KEY ([id])
);

-- ===== VEstudioCTELin  (filas: 0) =====
CREATE TABLE [VEstudioCTELin] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nEstr] INTEGER,
  [EstructuraSN] BOOLEAN NOT NULL,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Acabado2] NVARCHAR(10),
  [ColorPerfil] INTEGER,
  [Descripcion] NVARCHAR,
  [Cdad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [AcaTonalidad] NVARCHAR(20),
  [Aca2Tonalidad] NVARCHAR(10),
  [ColorAcc] INTEGER,
  [nLinAsoc] INTEGER,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [HojaDespieceSN] BOOLEAN NOT NULL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [LargoCorteCurva] REAL,
  [CantidadCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [Radio] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [DirVeta] NVARCHAR(1),
  [Funcion] NVARCHAR(20),
  [DtoNuloA] NVARCHAR(1),
  [DtoNuloL] NVARCHAR(1),
  [DtoLIni] REAL,
  [DtoLFin] REAL,
  [PosicionTrabajo] NVARCHAR(1),
  [Familia] NVARCHAR(10),
  [AcabadoMad] NVARCHAR(10),
  [AcaMadTonalidad] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VFacRectMotivos  (filas: 0) =====
CREATE TABLE [VFacRectMotivos] (
  [Codigo] NVARCHAR(2) NOT NULL,
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Codigo])
);

-- ===== VFacturas  (filas: 0) =====
CREATE TABLE [VFacturas] (
  [Id] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliTelefono] NVARCHAR(20),
  [CliFax] NVARCHAR(20),
  [CliTipo] NVARCHAR(3),
  [Tarifa] NVARCHAR(5),
  [Serie] NVARCHAR(1),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [ContabilizadaSN] BOOLEAN NOT NULL,
  [EntregadaSN] BOOLEAN NOT NULL,
  [FechaEntrega] DATE,
  [Fecha] DATE,
  [Subtotal] DOUBLE,
  [DescuentoPorc] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPPporc] REAL,
  [DescuentoPP] REAL,
  [Bruto] DOUBLE,
  [DeduccionAnt] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [RecargoPorc] REAL,
  [Recargo] DOUBLE,
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [RetTipo] NVARCHAR(1),
  [RetBase] REAL,
  [ImporteTotal] DOUBLE,
  [ImporteTotalEU] DOUBLE,
  [NumeroCert] SMALLINT,
  [RecibidoACuenta] REAL,
  [FechaAlbOrigen] DATE,
  [TipoVenta] NVARCHAR(5),
  [Representante] NVARCHAR(5),
  [RespCobro] NVARCHAR(5),
  [ComisionPorc] REAL,
  [Comision] REAL,
  [ComisionCobrSN] BOOLEAN NOT NULL,
  [ComisionFechaCobr] DATE,
  [ComisionManualSN] BOOLEAN NOT NULL,
  [CuentaContable] NVARCHAR(15),
  [TipoMedHM] NVARCHAR(1),
  [Idioma] NVARCHAR(3),
  [Delegacion] NVARCHAR(2),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [CliNombre] NVARCHAR(100),
  [Obra] NVARCHAR(60),
  [Observaciones] NVARCHAR,
  [Usuario] NVARCHAR(30),
  [RectificativaSN] BOOLEAN NOT NULL,
  [RectMotivo] NVARCHAR(2),
  [RectificadaSN] BOOLEAN NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [nAlbOrigen] NVARCHAR(20),
  [RectNumeroRectificada] NVARCHAR(20),
  [Zona] NVARCHAR(5),
  [AsegSiniestroSN] BOOLEAN NOT NULL,
  [AsegNumParte] NVARCHAR(20),
  [CliPais] NVARCHAR(10),
  [DeduccionNFAC] NVARCHAR(20),
  [CliTelefono2] NVARCHAR(20),
  [DocArchivadoSN] BOOLEAN NOT NULL,
  [VOfertas] NVARCHAR(255),
  [costeMemo_baseImp] REAL,
  [costeMemo_nLineas] SMALLINT,
  [CliNIF] NVARCHAR(30),
  [CliCodigoFiscal2] NVARCHAR(30),
  [CliCodigoFiscal3] NVARCHAR(30),
  [CliCodigoFiscalObservaciones] NVARCHAR(30),
  [ClieMail] NVARCHAR(150),
  [CosteSelProvSubfamSN] BOOLEAN NOT NULL,
  [CosteSelProvArticuloSN] BOOLEAN NOT NULL,
  [TipoIVA] NVARCHAR(2),
  [FechaContab] DATE,
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [TipoDocumento] NVARCHAR(5),
  [AFIPautorizadaSN] BOOLEAN NOT NULL,
  [AFIPCAE] NVARCHAR(20),
  [AFIPnumeroComprobante] INTEGER,
  [AFIPfechaEmision] DATE,
  [AFIPfechaVencimientoCAE] DATE,
  [AFIPobservaciones] NVARCHAR,
  [CliPersonaFisicaJuridica] NVARCHAR(8),
  [CliCondicionResidencia] NVARCHAR(3),
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [BloqueoFormaPagoSN] BOOLEAN NOT NULL,
  [ImpuestoRetenido] DOUBLE,
  [RectIdRectificada] INTEGER,
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [COferta] NVARCHAR(255),
  [BloqueoNumeroLineaSN] BOOLEAN NOT NULL,
  [CliRefCredito] NVARCHAR(20),
  [CliRiesgoAsegurado] DOUBLE,
  [FacturaElectronicaSN] BOOLEAN NOT NULL,
  [EnviadaEMailSN] BOOLEAN NOT NULL,
  [EnviadaEMailFecha] DATE,
  [EnviadaEmailDestino] NVARCHAR(255),
  [FacturaE_PWeb_NombreBlob] NVARCHAR(40),
  [FacturaE_PWeb_Uri] NVARCHAR(255),
  [CliRiesgoFechaDesde] DATE,
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [BloqueoDireccionSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [FacturaEdestino] NVARCHAR(15),
  [FacturaEenviadaSN] BOOLEAN NOT NULL,
  [FacturaEfechaEnvio] DATE,
  [ComisionCalculadaSN] BOOLEAN NOT NULL,
  [ComisionFechaCalculo] DATE,
  [RegistroFiscal1] NVARCHAR(50),
  [RegistroFiscal2] NVARCHAR(50),
  [RegistroFiscal3] NVARCHAR(50),
  [RegistroFiscal4] NVARCHAR(50),
  [ImpresoSN] BOOLEAN NOT NULL,
  [FechaImpreso] DATE,
  [NumeroDireccion] SMALLINT,
  [NumeroDireccionFac] SMALLINT,
  [TipoRetencion] NVARCHAR(2),
  [enviadoEMailSN] BOOLEAN NOT NULL,
  [FechaEnvioEMail] DATE,
  [TraspasadaCierreEjercicioSN] BOOLEAN NOT NULL,
  [VCobCtaSN] BOOLEAN NOT NULL,
  [VCobCtaNLin] INTEGER,
  [VCobCtaTipoDoc] NVARCHAR(5),
  [VCobCtaNumero] NVARCHAR(20),
  [VCobCtaRevision] NVARCHAR(3),
  [ClienteCuentaBancaria] NVARCHAR(3),
  [siiEnviadaSN] BOOLEAN NOT NULL,
  [siiFechaEnvio] DATE,
  [siiEstadoAEAT] NVARCHAR(20),
  [siiTipoDocumento] NVARCHAR(5),
  [siiTipoFacturaEmitida] NVARCHAR(2),
  [siiTipoFactura] NVARCHAR(2),
  [siiClaveRegimenEspecial] NVARCHAR(2),
  [siiTipoRectificativa] NVARCHAR(2),
  [siiSujetaSN] BOOLEAN NOT NULL,
  [siiExentaSN] BOOLEAN NOT NULL,
  [siiTipoNoSujeta] NVARCHAR(2),
  [siiTipoNoExenta] NVARCHAR(2),
  [siiCausaExencion] NVARCHAR(2),
  [siiFechaOperacion] DATE,
  [siiDescripcionOperacion] NVARCHAR(60),
  [siiClaveRegimenEspecialAdicional1] NVARCHAR(2),
  [siiClaveRegimenEspecialAdicional2] NVARCHAR(2),
  [siiReferenciaCatastral1] NVARCHAR(30),
  [siiReferenciaCatastral2] NVARCHAR(30),
  [siiSituacionInmueble1] NVARCHAR(2),
  [siiSituacionInmueble2] NVARCHAR(2),
  [CliAtt] NVARCHAR(255),
  [siiPeriodoMes] SMALLINT,
  [siiPeriodoAño] SMALLINT,
  [ClienteRiesgoPuntualAutorizadoSN] BOOLEAN NOT NULL,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [siiEmitidaPorTercerosSN] BOOLEAN NOT NULL,
  [siiForzarPeriodoImpositivoSN] BOOLEAN NOT NULL,
  [IdGrupoDocumentos] NVARCHAR(6),
  [FacturaInalterableSN] BOOLEAN NOT NULL,
  [HashValidacion] INTEGER,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [FacturaEDescripcion] NVARCHAR(60),
  [LastModified] DATE,
  [TicketBaiSN] BOOLEAN NOT NULL,
  [NumeroFacturaAnterior] NVARCHAR(20),
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyEmpresaSincDest] NVARCHAR(10),
  [IntercompanyEmpresaSincOrig] NVARCHAR(10),
  [IntercompanyProveedorOrig] NVARCHAR(10),
  [IntercompanyTipoDocDest] NVARCHAR(6),
  [IntercompanyNumeroDest] NVARCHAR(20),
  [IntercompanyProveedorDest] NVARCHAR(10),
  [IntercompanyTraspasadoSN] BOOLEAN NOT NULL,
  [DespuntePorc] REAL,
  [Despunte] REAL,
  [ReferenciaInterna] NVARCHAR(60),
  [RevisadoSN] BOOLEAN NOT NULL,
  [FechaRevisado] DATE,
  [TarDinPrecioBase] REAL,
  [TarDinIncrementoBase] REAL,
  [OrigenWebSN] BOOLEAN NOT NULL,
  [FacturaEcodigoQR] NVARCHAR,
  [FacturaEcontenido] NVARCHAR,
  [FacturaEobservaciones] NVARCHAR,
  [IdERPexterno] NVARCHAR(30),
  PRIMARY KEY ([Id])
);

-- ===== VFacturasImpuestoRetenidoResumen  (filas: 0) =====
CREATE TABLE [VFacturasImpuestoRetenidoResumen] (
  [nDoc] INTEGER NOT NULL,
  [TipoImpuestoRetenido] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [ImpuestoPorc] REAL,
  [Impuesto] DOUBLE,
  PRIMARY KEY ([nDoc], [TipoImpuestoRetenido])
);

-- ===== VFacturasIVAResumen  (filas: 0) =====
CREATE TABLE [VFacturasIVAResumen] (
  [nDoc] INTEGER NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [RecargoPorc] DOUBLE,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([nDoc], [TipoIVA])
);

-- ===== VFacturasLin  (filas: 0) =====
CREATE TABLE [VFacturasLin] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nEstr] INTEGER,
  [EstructuraSN] BOOLEAN NOT NULL,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Acabado2] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [Cdad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [PrecioCompacto] REAL,
  [MetrajeCompacto] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [CantidadCorte] REAL,
  [Funcion] NVARCHAR(20),
  [PosicionTrabajo] NVARCHAR(1),
  [Familia] NVARCHAR(10),
  [nLinAsoc] INTEGER,
  [Aca2Tonalidad] NVARCHAR(10),
  [AcabadoMad] NVARCHAR(10),
  [AcaMadTonalidad] NVARCHAR(10),
  [CosteMedioFechaDoc] REAL,
  [asocArt_nLineaOrigen] INTEGER,
  [AcaTonalidad] NVARCHAR(20),
  [nAlbaran] NVARCHAR(20),
  [PVPManualSN] BOOLEAN NOT NULL,
  [nLinRelacionada] INTEGER,
  [nLinRelTipoDoc] NVARCHAR(6),
  [RespetarPrecioSN] BOOLEAN NOT NULL,
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [DescuentoManualSN] BOOLEAN NOT NULL,
  [ColorAcc] INTEGER,
  [ColorPerfil] INTEGER,
  [TarifaManualSN] BOOLEAN NOT NULL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [DescripcionIdioma] NVARCHAR,
  [TipoIVA] NVARCHAR(2),
  [ComisionPorcManualSN] BOOLEAN NOT NULL,
  [ComisionPorcManual] REAL,
  [ComisionManualSN] BOOLEAN NOT NULL,
  [ComisionManual] REAL,
  [nLinAlb] INTEGER,
  [MetrajeMinimoAplicado] REAL,
  [MultiploAnchoAplicado] REAL,
  [MultiploLargoAplicado] REAL,
  [MetrajeMinimoEspecialSN] BOOLEAN NOT NULL,
  [MetrajeMinimoEspecial] REAL,
  [MultiploEspecialSN] BOOLEAN NOT NULL,
  [MultiploAnchoEspecial] REAL,
  [MultiploLargoEspecial] REAL,
  [AnchoConMultiplo] REAL,
  [LargoConMultiplo] REAL,
  [TipoImpuestoRetenido] NVARCHAR(2),
  [MetrajeManualSN] BOOLEAN NOT NULL,
  [Tarifa] NVARCHAR(5),
  [CLAorden] SMALLINT,
  [TipoIVA_detallado_fijo] NVARCHAR(10),
  [IVAporc] REAL,
  [RecargoPorc] REAL,
  [Coste] REAL,
  [CosteDtoPorc] REAL,
  [CosteQuePrv] NVARCHAR(10),
  [CosteManual] REAL,
  [CosteMetrajeTotal] REAL,
  [costeOrigen] NVARCHAR(10),
  [NoComputarCosteSN] BOOLEAN NOT NULL,
  [NumeroLinea] INTEGER,
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [CosteMedioOrigen] NVARCHAR(10),
  [CosteMedioManual] REAL,
  [CosteMedioUltimaAct] DATE,
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [NoComputarVentaSN] BOOLEAN NOT NULL,
  [PrecioVentaOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [TipoArticuloImpuesto] NVARCHAR(3),
  [Capitulo] SMALLINT,
  [CapituloPadre] SMALLINT,
  [CapituloTitulo] NVARCHAR(7),
  [CapituloDescripcion] NVARCHAR(50),
  [tldMedidaAltura] REAL,
  [CompFnumPanyo] SMALLINT,
  [EstructuraOrigen] NVARCHAR(15),
  [CadenaDeClasificacionEstadisticas] NVARCHAR(100),
  [nModulo] SMALLINT,
  [ArticuloCobroACtaSN] BOOLEAN NOT NULL,
  [CuentaContableManualSN] BOOLEAN NOT NULL,
  [CuentaContableManual] NVARCHAR(15),
  [CorteSinValoracionSN] BOOLEAN NOT NULL,
  [ValoracionSinCorteSN] BOOLEAN NOT NULL,
  [CdadMetPorEmb] REAL,
  [BloqueoCdadMetPorEmbSN] BOOLEAN NOT NULL,
  [NumeroLote] NVARCHAR(30),
  [PesoComputado] REAL,
  [Descuento2Porc] REAL,
  [ReferenciaInterna] NVARCHAR(30),
  [LastModified] DATE,
  [Precio] DOUBLE,
  [ImporteTotal] DOUBLE,
  [VentaTotal] DOUBLE,
  [CdadHC] REAL,
  [TipoCorte] NVARCHAR(2),
  [AnguloI] REAL,
  [AnguloD] REAL,
  [DirVeta] NVARCHAR(1),
  [SeleccionadoHCsn] BOOLEAN NOT NULL,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [OrdenEstructura] SMALLINT,
  [AcabadoInt] NVARCHAR(10),
  [AcabadoExt] NVARCHAR(10),
  [AcabadoIntermedio] NVARCHAR(10),
  [AcaTonalidadInt] NVARCHAR(10),
  [AcaTonalidadExt] NVARCHAR(10),
  [AcaTonalidadIntermedio] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VFacturasLinImpuestos  (filas: 0) =====
CREATE TABLE [VFacturasLinImpuestos] (
  [nVLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [nDoc] INTEGER,
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nVLinea], [CodigoImpuesto])
);

-- ===== VFacturasTBAI  (filas: 0) =====
CREATE TABLE [VFacturasTBAI] (
  [nDoc] INTEGER NOT NULL,
  [FirmaTBAI] NVARCHAR,
  [IdentificativoTBAI] NVARCHAR(40),
  [CodigoQR] NVARCHAR(255),
  PRIMARY KEY ([nDoc])
);

-- ===== VIncrPrecio  (filas: 0) =====
CREATE TABLE [VIncrPrecio] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLineaIncr] INTEGER,
  [PrecioBase] REAL,
  [IncrementoPorc] REAL,
  [TipoMetMed] NVARCHAR(8),
  PRIMARY KEY ([nLinea])
);

-- ===== VManufacturas  (filas: 0) =====
CREATE TABLE [VManufacturas] (
  [id] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [Manufactura] NVARCHAR(10),
  [izdaSN] BOOLEAN NOT NULL,
  [dchaSN] BOOLEAN NOT NULL,
  [supSN] BOOLEAN NOT NULL,
  [infSN] BOOLEAN NOT NULL,
  [Cantidad] REAL,
  [barrCdadHoriz] SMALLINT,
  [barrCdadVert] SMALLINT,
  [Acabado] NVARCHAR(10),
  [nLargos] SMALLINT,
  [nCortos] SMALLINT,
  [DiametroTal] REAL,
  [AcaTonalidad] NVARCHAR(10),
  [BarrotilloDiseño] INTEGER,
  [barrCdadHuecosHoriz] SMALLINT,
  [barrCdadHuecosVert] SMALLINT,
  [RadioForma] REAL,
  [NumeroVidrioDAaplicar] SMALLINT,
  PRIMARY KEY ([id])
);

-- ===== VMargenBenef  (filas: 0) =====
CREATE TABLE [VMargenBenef] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Familia] NVARCHAR(10) NOT NULL,
  [Margen] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Familia])
);

-- ===== VMargenMinAlarma  (filas: 0) =====
CREATE TABLE [VMargenMinAlarma] (
  [Tarifa] NVARCHAR(5) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [margenMin] REAL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Tarifa], [Articulo], [Familia], [Subfamilia])
);

-- ===== VMargenMinAlarmaEstr  (filas: 0) =====
CREATE TABLE [VMargenMinAlarmaEstr] (
  [Tarifa] NVARCHAR(5) NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [MargenMin] REAL,
  PRIMARY KEY ([Tarifa], [Estructura], [Familia])
);

-- ===== VMedidasDA  (filas: 244) =====
CREATE TABLE [VMedidasDA] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [nDA] SMALLINT,
  [Estructura] NVARCHAR(14),
  [Medida] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [nDA])
);

-- ===== VNumerosSerie  (filas: 0) =====
CREATE TABLE [VNumerosSerie] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER,
  [Fecha] DATE,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [NumeroSerie] NVARCHAR(40),
  [GarantiaTiempo] SMALLINT,
  [GarantiaTiempoUnidades] NVARCHAR(5),
  [GarantiaFechaValor] DATE,
  [GarantiaVencimiento] DATE,
  [nVLinea] INTEGER,
  [nVLinEstr] INTEGER,
  [AutomaticoSN] BOOLEAN NOT NULL,
  [ModificadoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== VOfertas  (filas: 0) =====
CREATE TABLE [VOfertas] (
  [Numero] NVARCHAR(6) NOT NULL,
  [Fecha] DATE,
  [Cliente] NVARCHAR(10),
  [Descripcion] NVARCHAR(255),
  [validezDesde] DATE,
  [validezHasta] DATE,
  [Observaciones] NVARCHAR,
  [Asignacion_AUTO_MAN] NVARCHAR(5),
  [ManAvisarAplicableSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Numero])
);

-- ===== VOfertasCLAS  (filas: 0) =====
CREATE TABLE [VOfertasCLAS] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([nOferta], [Articulo], [Acabado])
);

-- ===== VOfertasDescuentoEsp  (filas: 0) =====
CREATE TABLE [VOfertasDescuentoEsp] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [Descuento2] REAL,
  PRIMARY KEY ([nOferta], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VOfertasDescuentoFamArt  (filas: 0) =====
CREATE TABLE [VOfertasDescuentoFamArt] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [Subfamilia] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([nOferta], [Familia], [Subfamilia])
);

-- ===== VOfertasDescuentoFamEstr  (filas: 0) =====
CREATE TABLE [VOfertasDescuentoFamEstr] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Familia] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [Descuento2] REAL,
  PRIMARY KEY ([nOferta], [Familia])
);

-- ===== VOfertasDtoArtCMNaca  (filas: 0) =====
CREATE TABLE [VOfertasDtoArtCMNaca] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [Descuento2] REAL,
  PRIMARY KEY ([nOferta], [CadenaDeClasificacion], [Acabado])
);

-- ===== VOfertasDtoEstrCMNaca  (filas: 0) =====
CREATE TABLE [VOfertasDtoEstrCMNaca] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [CadenaDeClasificacion] NVARCHAR(100) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [Descuento2] REAL,
  PRIMARY KEY ([nOferta], [CadenaDeClasificacion], [Acabado])
);

-- ===== VOfertasMetrajeMinimo  (filas: 0) =====
CREATE TABLE [VOfertasMetrajeMinimo] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [MetrajeMinimo] REAL,
  PRIMARY KEY ([nOferta], [Articulo], [Acabado])
);

-- ===== VOfertasMuliplos  (filas: 0) =====
CREATE TABLE [VOfertasMuliplos] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [MultiploAncho] REAL,
  [MultiploLargo] REAL,
  PRIMARY KEY ([nOferta], [Articulo], [Acabado])
);

-- ===== VOfertasPrecioEsp  (filas: 0) =====
CREATE TABLE [VOfertasPrecioEsp] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [PVP] REAL,
  PRIMARY KEY ([nOferta], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VOfertasPrecioIncrCompF  (filas: 0) =====
CREATE TABLE [VOfertasPrecioIncrCompF] (
  [nOferta] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [PrecioEspecialSN] BOOLEAN NOT NULL,
  [PVP] REAL,
  PRIMARY KEY ([nOferta], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VOpciones  (filas: 8150) =====
CREATE TABLE [VOpciones] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [CodEstr] NVARCHAR(15),
  [nLinEstr] INTEGER,
  [OPCgrupo] SMALLINT,
  [OPCnOpcion] SMALLINT,
  [nModulo] SMALLINT NOT NULL,
  [ValorEscalar] NVARCHAR(100),
  [SubestructuraSN] BOOLEAN NOT NULL,
  [CodEstrOrigenOPCgrupo] NVARCHAR(15),
  [CodPadreSubestructura] NVARCHAR(15),
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [CodEstr], [OPCgrupo], [nModulo])
);

-- ===== VOpcionesHerraje  (filas: 25335) =====
CREATE TABLE [VOpcionesHerraje] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [Conjunto] NVARCHAR(15),
  [nOpcion] SMALLINT,
  [SelecSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinEstr], [Conjunto], [nOpcion])
);

-- ===== VOptiArticulosLB  (filas: 59) =====
CREATE TABLE [VOptiArticulosLB] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [LstDimLargo] NVARCHAR(255),
  [nDoc] NVARCHAR(20) NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VOptiConfig  (filas: 0) =====
CREATE TABLE [VOptiConfig] (
  [TipoDoc] NVARCHAR(6),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [DespunteMin] REAL,
  [DespunteMax] REAL,
  [DirVeta] NVARCHAR(1),
  [desInicio] SMALLINT,
  [desFinal] SMALLINT,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [nBarrasMult] SMALLINT,
  [LstDimLargo] NVARCHAR(255),
  [nDoc] NVARCHAR(20) NOT NULL,
  [DimLargo] INTEGER,
  [DimAncho] INTEGER,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VOrdenesF  (filas: 0) =====
CREATE TABLE [VOrdenesF] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Descripcion] NVARCHAR,
  [PedidosNumTxt] NVARCHAR(50),
  [FechaEntrega] DATE,
  [EnFabrSN] BOOLEAN NOT NULL,
  [FechaIniFabr] DATE,
  [FabrSN] BOOLEAN NOT NULL,
  [FechaFinFabr] DATE,
  [CPedidoSN] BOOLEAN NOT NULL,
  [EntregadoSN] BOOLEAN NOT NULL,
  [StockActSN] BOOLEAN NOT NULL,
  [StockActPendSN] BOOLEAN NOT NULL,
  [StockResSN] BOOLEAN NOT NULL,
  [AlmacenSalida] NVARCHAR(5),
  [AlmacenEntrada] NVARCHAR(5),
  [FechaStock] DATE,
  [MontajePlanSN] BOOLEAN NOT NULL,
  [MontajeFecha] DATE,
  [MontajeSemana] NVARCHAR(10),
  [MontajeGrupoTrab] NVARCHAR(5),
  [CodigoObra] NVARCHAR(10),
  [TTbloqueoSN] BOOLEAN NOT NULL,
  [TTobservaciones] NVARCHAR(100),
  [SeccionProduccion] NVARCHAR(10),
  [TTPrioridad] SMALLINT,
  [TTFechaPrevista] DATE,
  [TTHoraPrevista] DATE,
  [Delegacion] NVARCHAR(2),
  [CortesRestosSN] BOOLEAN NOT NULL,
  [ObservacionesProduccion] NVARCHAR,
  [StockActParcialSN] BOOLEAN NOT NULL,
  [Usuario] NVARCHAR(30),
  [ReferenciaInterna] NVARCHAR(50),
  [ImpresoSN] BOOLEAN NOT NULL,
  [FechaImpreso] DATE,
  [TipoDocumento] NVARCHAR(5),
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [NumeroControl] INTEGER,
  [ConsumoExportadoSN] BOOLEAN NOT NULL,
  [FechaConsumoExportado] DATE,
  [ObservacionesConsumoExportado] NVARCHAR,
  [EstadoFabricacion] SMALLINT,
  [EstadoFabricacionDesde] DATE,
  [AlmacenFabricados] NVARCHAR(5),
  [LineaNegocio] NVARCHAR(10),
  [VAlbMovIntGeneradoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Numero])
);

-- ===== VOrdenesFcortes  (filas: 0) =====
CREATE TABLE [VOrdenesFcortes] (
  [nLinea] INTEGER NOT NULL,
  [nOrden] NVARCHAR(20) NOT NULL,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [CantidadEnOrden] REAL,
  [CantidadCortada] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VOrdenesFLimiteArticulos  (filas: 0) =====
CREATE TABLE [VOrdenesFLimiteArticulos] (
  [Articulo] NVARCHAR(60) NOT NULL,
  [MetrajeMaximoDia] REAL,
  PRIMARY KEY ([Articulo])
);

-- ===== VOrdenesFLin  (filas: 0) =====
CREATE TABLE [VOrdenesFLin] (
  [nLinea] INTEGER NOT NULL,
  [nOrden] NVARCHAR(20),
  [nDoc] INTEGER,
  [nLinPed] INTEGER,
  [Tipo] NVARCHAR(25),
  [Cantidad] REAL,
  [CdadFabr] REAL,
  [FabrSN] BOOLEAN NOT NULL,
  [CdadFacturada] REAL,
  [CdadPasar] REAL,
  [NumeroLinea] SMALLINT,
  [TipoConsumo_Fabr_Stock] NVARCHAR(15),
  PRIMARY KEY ([nLinea])
);

-- ===== VPackingList  (filas: 0) =====
CREATE TABLE [VPackingList] (
  [Id] INTEGER NOT NULL,
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Delegacion] NVARCHAR(2),
  [Tipo] NVARCHAR(12),
  [Descripcion] NVARCHAR(200),
  [DescripcionIdioma] NVARCHAR(200),
  [Cliente] NVARCHAR(10),
  [Idioma] NVARCHAR(3),
  [Divisa] NVARCHAR(5),
  [NumeroVFactura] NVARCHAR(20),
  [Peso] REAL,
  [numBultos] SMALLINT,
  [Importe] DOUBLE,
  [Precinto] NVARCHAR(15),
  [NumeroContenedor] NVARCHAR(15),
  [CodigoTextoFinalPL] NVARCHAR(2),
  [CodigoTextoFinalFC] NVARCHAR(2),
  [ImporteFOB] DOUBLE,
  [BaseImponible] DOUBLE,
  [TipoIVA] NVARCHAR(2),
  [IVAporc] REAL,
  [IVA] DOUBLE,
  [UnidadMedidaPeso] NVARCHAR(20),
  [UnidadMedidaMedida] NVARCHAR(20),
  [UnidadMedidaMedidaFactura] NVARCHAR(20),
  [CodigoIncoterm] NVARCHAR(3),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  PRIMARY KEY ([Id])
);

-- ===== VPackingListBultos  (filas: 0) =====
CREATE TABLE [VPackingListBultos] (
  [Id] INTEGER NOT NULL,
  [numPackingList] NVARCHAR(20) NOT NULL,
  [Nivel] SMALLINT,
  [idBultoRel] INTEGER,
  [NumeroBulto] SMALLINT,
  [NumeroBultoRel] SMALLINT,
  [Descripcion] NVARCHAR(100),
  [DescripcionIdioma] NVARCHAR(100),
  [Ancho] REAL,
  [Largo] REAL,
  [Alto] REAL,
  [Peso] REAL,
  [numBultos] SMALLINT,
  [TipoBulto] NVARCHAR(10),
  [TipoMercancia] NVARCHAR(10),
  PRIMARY KEY ([Id])
);

-- ===== VPackingListBultosLin  (filas: 0) =====
CREATE TABLE [VPackingListBultosLin] (
  [nLinea] INTEGER NOT NULL,
  [numPackingList] NVARCHAR(20) NOT NULL,
  [nLinVPLDocLin] INTEGER NOT NULL,
  [idBulto] INTEGER,
  [Cantidad] REAL,
  [Peso] REAL,
  [Importe] DOUBLE,
  [TipoBulto] NVARCHAR(10),
  [TipoMercancia] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VPackingListCodigosIncoterm  (filas: 0) =====
CREATE TABLE [VPackingListCodigosIncoterm] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([Codigo])
);

-- ===== VPackingListDocumentos  (filas: 0) =====
CREATE TABLE [VPackingListDocumentos] (
  [numPackingList] NVARCHAR(20) NOT NULL,
  [TipoDoc] NVARCHAR(5) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Numero] NVARCHAR(20),
  [Revision] NVARCHAR(3),
  [Descripcion] NVARCHAR(100),
  PRIMARY KEY ([numPackingList], [TipoDoc], [nDoc])
);

-- ===== VPackingListDocumentosLin  (filas: 0) =====
CREATE TABLE [VPackingListDocumentosLin] (
  [nLinea] INTEGER NOT NULL,
  [numPackingList] NVARCHAR(20) NOT NULL,
  [TipoDoc] NVARCHAR(5),
  [nVDoc] INTEGER,
  [nVLinea] INTEGER,
  [Codigo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [DescripcionIdioma] NVARCHAR,
  [PartidaArancelaria] NVARCHAR(20),
  [Cantidad] REAL,
  [CantidadEnBultos] REAL,
  [Ancho] REAL,
  [Largo] REAL,
  [Peso] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Precio] REAL,
  [Importe] DOUBLE,
  [TipoBulto] NVARCHAR(10),
  [TipoMercancia] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(20),
  [nVLinOrden] INTEGER,
  [DescripcionOriginal] NVARCHAR,
  [DescripcionIdiomaOriginal] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== VPackingListPlantillasDescripcion  (filas: 0) =====
CREATE TABLE [VPackingListPlantillasDescripcion] (
  [Nombre] NVARCHAR(80) NOT NULL,
  [Texto] NVARCHAR(255),
  [Codigo] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== VPackingListResumenPartidaArancelaria  (filas: 0) =====
CREATE TABLE [VPackingListResumenPartidaArancelaria] (
  [numPackingList] NVARCHAR(20) NOT NULL,
  [PartidaArancelaria] NVARCHAR(20) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [DescripcionIdioma] NVARCHAR(100),
  [Peso] REAL,
  [Importe] DOUBLE,
  [PesoBruto] REAL,
  PRIMARY KEY ([numPackingList], [PartidaArancelaria])
);

-- ===== VPackingListTiposBulto  (filas: 0) =====
CREATE TABLE [VPackingListTiposBulto] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(80),
  PRIMARY KEY ([Codigo])
);

-- ===== VPackingListTiposMercancia  (filas: 0) =====
CREATE TABLE [VPackingListTiposMercancia] (
  [Codigo] NVARCHAR(10) NOT NULL,
  [Descripcion] NVARCHAR(255),
  PRIMARY KEY ([Codigo])
);

-- ===== VPedidos  (filas: 0) =====
CREATE TABLE [VPedidos] (
  [Id] INTEGER NOT NULL,
  [Cliente] NVARCHAR(10),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliTelefono] NVARCHAR(20),
  [CliFax] NVARCHAR(20),
  [CliTipo] NVARCHAR(3),
  [Tarifa] NVARCHAR(5),
  [Serie] NVARCHAR(1),
  [AlmacenSalida] NVARCHAR(5),
  [AlmacenEntrada] NVARCHAR(5),
  [FechaStock] DATE,
  [StFabricacionSN] BOOLEAN NOT NULL,
  [Fecha] DATE,
  [AlbaranSN] BOOLEAN NOT NULL,
  [Subtotal] DOUBLE,
  [DescuentoPorc] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPPporc] REAL,
  [DescuentoPP] REAL,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [RecargoPorc] REAL,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  [BloqueoPreciosSN] BOOLEAN NOT NULL,
  [ImporteTotalEU] DOUBLE,
  [RecibidoACuenta] REAL,
  [FechaMontaje] DATE,
  [HoraMontaje] NVARCHAR(10),
  [SemanaPrevMontaje] SMALLINT,
  [Montador1] NVARCHAR(5),
  [Montador2] NVARCHAR(5),
  [UsuarioAgenda] NVARCHAR(30),
  [RevPresOrigen] NVARCHAR(3),
  [FechaOrigen] DATE,
  [TipoVenta] NVARCHAR(5),
  [Representante] NVARCHAR(5),
  [ComisionPorc] REAL,
  [Comision] REAL,
  [StockActSN] BOOLEAN NOT NULL,
  [StockActPendSN] BOOLEAN NOT NULL,
  [StockResSN] BOOLEAN NOT NULL,
  [EnFabricacionSN] BOOLEAN NOT NULL,
  [DesdeFabricacion] DATE,
  [FechaPrevFabr] DATE,
  [FabricadoSN] BOOLEAN NOT NULL,
  [HastaFabricacion] DATE,
  [MaterialSN] BOOLEAN NOT NULL,
  [FechaMaterial] DATE,
  [TTobservaciones] NVARCHAR(100),
  [TTbloqueoSN] BOOLEAN NOT NULL,
  [TptePesoKg] REAL,
  [TpteFechaSal] DATE,
  [EnFabrCompletoSN] BOOLEAN NOT NULL,
  [TipoMedHM] NVARCHAR(1),
  [ObservHC_HD] NVARCHAR,
  [Idioma] NVARCHAR(3),
  [DibCodBar] BINARY,
  [ServidoFasesSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [CliNombre] NVARCHAR(100),
  [Obra] NVARCHAR(60),
  [Observaciones] NVARCHAR,
  [Usuario] NVARCHAR(30),
  [ObservacionesProduccion] NVARCHAR,
  [VAlbFacAutoSN] BOOLEAN NOT NULL,
  [VAlbFacAutoPreguntaSN] BOOLEAN NOT NULL,
  [DirEnvRazon] NVARCHAR(100),
  [DirEnvDireccion] NVARCHAR(150),
  [DirEnvCP] NVARCHAR(20),
  [DirEnvPoblacion] NVARCHAR(80),
  [DirEnvProvincia] NVARCHAR(80),
  [FechaMontManualSN] BOOLEAN NOT NULL,
  [FechaEntLinManualSN] BOOLEAN NOT NULL,
  [nPresOrigen] NVARCHAR(20),
  [nAlbDestino] NVARCHAR(20),
  [Numero] NVARCHAR(20) NOT NULL,
  [CTEzonaClimatica] NVARCHAR(2),
  [CTEcodigoProvincia] NVARCHAR(2),
  [CTEaltitud] SMALLINT,
  [autorizaVDocSN] BOOLEAN NOT NULL,
  [autorizaVDocResultado] NVARCHAR(10),
  [autorizaVDocUsuarioSolicita] NVARCHAR(30),
  [autorizaVDocUsuarioAut] NVARCHAR(30),
  [autorizaVDocObservaciones] NVARCHAR(255),
  [UTTnEtiquetasManuales] SMALLINT,
  [UTTnEtiqManFacturadas] SMALLINT,
  [PlanProdSN] BOOLEAN NOT NULL,
  [PlanProdFechaIniDeseada] DATE,
  [PlanProdFechaIni] DATE,
  [PlanProdFechaFin] DATE,
  [Zona] NVARCHAR(5),
  [AsegSiniestroSN] BOOLEAN NOT NULL,
  [AsegNumParte] NVARCHAR(20),
  [AsegDescripcionSiniestro] NVARCHAR(255),
  [AsegDiasDemora] SMALLINT,
  [AsegFechaHoraRecepcion] DATE,
  [AsegUrgenteSN] BOOLEAN NOT NULL,
  [AsegUrgenteVBSN] BOOLEAN NOT NULL,
  [AsegUrgenteVBFecha] DATE,
  [AsegDenunciaSN] BOOLEAN NOT NULL,
  [AsegDenunciaVBSN] BOOLEAN NOT NULL,
  [AsegDenunciaVBFecha] DATE,
  [AsegPeritajeSN] BOOLEAN NOT NULL,
  [AsegPeritajeVBSN] BOOLEAN NOT NULL,
  [AsegPeritajeVBFecha] DATE,
  [AsegPerito] NVARCHAR(5),
  [AsegDirSiniestro] NVARCHAR(80),
  [AsegCPSiniestro] NVARCHAR(20),
  [AsegPoblacionSiniestro] NVARCHAR(80),
  [AsegProvinciaSiniestro] NVARCHAR(80),
  [AsegRefCompañia] NVARCHAR(20),
  [CliPais] NVARCHAR(10),
  [DirEnvPais] NVARCHAR(10),
  [CliTelefono2] NVARCHAR(20),
  [EnFabrTrabajador] NVARCHAR(5),
  [VOfertas] NVARCHAR(255),
  [COferta] NVARCHAR(255),
  [costeMemo_baseImp] REAL,
  [costeMemo_nLineas] SMALLINT,
  [CliNIF] NVARCHAR(30),
  [CliCodigoFiscal2] NVARCHAR(30),
  [CliCodigoFiscal3] NVARCHAR(30),
  [CliCodigoFiscalObservaciones] NVARCHAR(30),
  [AnuladoSN] BOOLEAN NOT NULL,
  [AnuladoFecha] DATE,
  [AnuladoUsuario] NVARCHAR(30),
  [CEcalculadoSN] BOOLEAN NOT NULL,
  [CEcalculadoFecha] DATE,
  [ClieMail] NVARCHAR(150),
  [SeguimientoSN] BOOLEAN NOT NULL,
  [FechaSeguimiento] DATE,
  [UsuarioMarcaSeguimiento] NVARCHAR(30),
  [SeguimientoCompletoSN] BOOLEAN NOT NULL,
  [CosteSelProvSubfamSN] BOOLEAN NOT NULL,
  [CosteSelProvArticuloSN] BOOLEAN NOT NULL,
  [TipoIVA] NVARCHAR(2),
  [VRepartoSN] BOOLEAN NOT NULL,
  [VRepartoNum] NVARCHAR(255),
  [TpteObservaciones] NVARCHAR(255),
  [ComprobadoStockDispSN] BOOLEAN NOT NULL,
  [ComprobadoStockDispFecha] DATE,
  [ComprobadoStockDispUsuario] NVARCHAR(30),
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [TipoDocumento] NVARCHAR(5),
  [CliPersonaFisicaJuridica] NVARCHAR(8),
  [CliCondicionResidencia] NVARCHAR(3),
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [BloqueoFormaPagoSN] BOOLEAN NOT NULL,
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [RetTipo] NVARCHAR(1),
  [RetBase] REAL,
  [EtiqUdEmitidasSN] BOOLEAN NOT NULL,
  [EtiqTpteEmitidasSN] BOOLEAN NOT NULL,
  [EtiqCEemitidasSN] BOOLEAN NOT NULL,
  [FechaSeguimientoCompleto] DATE,
  [AlbaranParcialSN] BOOLEAN NOT NULL,
  [BultosCalculadosSN] BOOLEAN NOT NULL,
  [NecesarioRecalcularBultosSN] BOOLEAN NOT NULL,
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [BultosModificadosPorElUsuarioSN] BOOLEAN NOT NULL,
  [TptePortesSN] BOOLEAN NOT NULL,
  [TptePortes] REAL,
  [TptePortesTipo] NVARCHAR(10),
  [TpteCReembolso] REAL,
  [TpteHoraRecogida] DATE,
  [BloqueoVAlbSN] BOOLEAN NOT NULL,
  [BloqueoVAlbFechaFin] DATE,
  [BloqueoNumeroLineaSN] BOOLEAN NOT NULL,
  [ObraCodigo] NVARCHAR(20),
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [BloqueoVPedSN] BOOLEAN NOT NULL,
  [BloqueoDireccionSN] BOOLEAN NOT NULL,
  [BloqueoDireccionEnvioSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [BloqueoVFacSN] BOOLEAN NOT NULL,
  [FechaSolicitadaMontaje] DATE,
  [TpteAgencia] NVARCHAR(10),
  [NumeroDireccion] SMALLINT,
  [NumeroDireccionEnv] SMALLINT,
  [NumeroDireccionFac] SMALLINT,
  [TipoWDocOrigen] NVARCHAR(15),
  [NumeroWDocOrigen] NVARCHAR(20),
  [RevisionWDocOrigen] SMALLINT,
  [TipoRetencion] NVARCHAR(2),
  [enviadoEMailSN] BOOLEAN NOT NULL,
  [FechaEnvioEMail] DATE,
  [StockActParcialSN] BOOLEAN NOT NULL,
  [IntercompanySN] BOOLEAN NOT NULL,
  [IntercompanyTipoDocOrig] NVARCHAR(6),
  [IntercompanyNumeroOrig] NVARCHAR(20),
  [IntercompanyProveedorOrig] NVARCHAR(10),
  [IntercompanyEmpresaSincOrig] NVARCHAR(10),
  [CliAtt] NVARCHAR(255),
  [BloqueoTptePesoKgSN] BOOLEAN NOT NULL,
  [DirEnvTelefono] NVARCHAR(20),
  [ClienteRiesgoPuntualAutorizadoSN] BOOLEAN NOT NULL,
  [TptePesoKgBruto] REAL,
  [BloqueoTptePesoKgBrutoSN] BOOLEAN NOT NULL,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [ImpresoSN] BOOLEAN NOT NULL,
  [FechaImpreso] DATE,
  [IdGrupoDocumentos] NVARCHAR(6),
  [FechaPrevistaMontajeObservaciones] NVARCHAR(50),
  [FechaPrevistaMontaje] DATE,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [MaterialPendienteSN] BOOLEAN NOT NULL,
  [BloqueoVPedObservaciones] NVARCHAR(50),
  [AceptadoSN] BOOLEAN NOT NULL,
  [AceptadoFecha] DATE,
  [AceptadoUsuario] NVARCHAR(30),
  [ObservacionesExportado] NVARCHAR,
  [EstadoFabricacion] SMALLINT,
  [EstadoFabricacionDesde] DATE,
  [LastModified] DATE,
  [ObservacionesMaterial] NVARCHAR(100),
  [IncidenciaSN] BOOLEAN NOT NULL,
  [IncidenciaObservaciones] NVARCHAR,
  [TpteNumExped] NVARCHAR(30),
  [AlmacenFabricados] NVARCHAR(5),
  [nBultos] SMALLINT,
  [DespuntePorc] REAL,
  [Despunte] REAL,
  [ReferenciaInterna] NVARCHAR(60),
  [TTPrioridad] SMALLINT,
  [TpteAgencia2] NVARCHAR(10),
  [TarDinPrecioBase] REAL,
  [TarDinIncrementoBase] REAL,
  [OrigenWebSN] BOOLEAN NOT NULL,
  [DevolucionSN] BOOLEAN NOT NULL,
  [DevolucionNDocOrigen] INTEGER,
  [DevolucionPedidoOrigen] NVARCHAR(20),
  PRIMARY KEY ([Id])
);

-- ===== VPedidosAsegSeguimiento  (filas: 0) =====
CREATE TABLE [VPedidosAsegSeguimiento] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Descripcion] NVARCHAR(100),
  [Fecha] DATE,
  [Hora] DATE,
  [VistoBuenoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([nLinea])
);

-- ===== VPedidosIVAResumen  (filas: 0) =====
CREATE TABLE [VPedidosIVAResumen] (
  [nDoc] INTEGER NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [RecargoPorc] DOUBLE,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([nDoc], [TipoIVA])
);

-- ===== VPedidosLin  (filas: 0) =====
CREATE TABLE [VPedidosLin] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nEstr] INTEGER,
  [EstructuraSN] BOOLEAN NOT NULL,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Acabado2] NVARCHAR(10),
  [ColorPerfil] INTEGER,
  [Descripcion] NVARCHAR,
  [Cdad] REAL,
  [CdadHC] REAL,
  [CdadFacturada] REAL,
  [CdadPasar] REAL,
  [CdadEnFabr] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [PrecioCompacto] REAL,
  [MetrajeCompacto] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [Coste] REAL,
  [StArtFabrSN] BOOLEAN NOT NULL,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [HojaDespieceSN] BOOLEAN NOT NULL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [LargoCorteCurva] REAL,
  [CantidadCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [Radio] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [DirVeta] NVARCHAR(1),
  [Funcion] NVARCHAR(20),
  [DtoNuloA] NVARCHAR(1),
  [DtoNuloL] NVARCHAR(1),
  [DtoLIni] REAL,
  [DtoLFin] REAL,
  [PosicionTrabajo] NVARCHAR(1),
  [SeleccionadoHCsn] BOOLEAN NOT NULL,
  [Familia] NVARCHAR(10),
  [nLinOrig] INTEGER,
  [nLinAsoc] INTEGER,
  [precioServFases] REAL,
  [NoRedibujarSN] BOOLEAN NOT NULL,
  [Aca2Tonalidad] NVARCHAR(10),
  [AcabadoMad] NVARCHAR(10),
  [AcaMadTonalidad] NVARCHAR(10),
  [CosteMedioFechaDoc] REAL,
  [CosteDtoPorc] REAL,
  [CosteManual] REAL,
  [CosteMetrajeTotal] REAL,
  [asocArt_nLineaOrigen] INTEGER,
  [FechaEntrega] DATE,
  [AcaTonalidad] NVARCHAR(20),
  [MetrajeMaxEntregaInm] REAL,
  [nPresup] NVARCHAR(20),
  [PVPManualSN] BOOLEAN NOT NULL,
  [nLinRelacionada] INTEGER,
  [nLinRelTipoDoc] NVARCHAR(6),
  [ColorAcc] INTEGER,
  [RespetarPrecioSN] BOOLEAN NOT NULL,
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [NoComputarCosteSN] BOOLEAN NOT NULL,
  [OFnumeroLinea] SMALLINT,
  [DescuentoManualSN] BOOLEAN NOT NULL,
  [costeQuePrv] NVARCHAR(10),
  [costeOrigen] NVARCHAR(10),
  [TarifaManualSN] BOOLEAN NOT NULL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [DescripcionIdioma] NVARCHAR,
  [TipoIVA] NVARCHAR(2),
  [ComisionPorcManualSN] BOOLEAN NOT NULL,
  [ComisionPorcManual] REAL,
  [ComisionManualSN] BOOLEAN NOT NULL,
  [ComisionManual] REAL,
  [TipoDocOrig] NVARCHAR(6),
  [tronFormatoCorte] NVARCHAR(3),
  [MetrajeMinimoAplicado] REAL,
  [MultiploAnchoAplicado] REAL,
  [MultiploLargoAplicado] REAL,
  [MetrajeMinimoEspecialSN] BOOLEAN NOT NULL,
  [MetrajeMinimoEspecial] REAL,
  [MultiploEspecialSN] BOOLEAN NOT NULL,
  [MultiploAnchoEspecial] REAL,
  [MultiploLargoEspecial] REAL,
  [AnchoConMultiplo] REAL,
  [LargoConMultiplo] REAL,
  [CalcEtiqCorte] NVARCHAR(7),
  [CalcEtiqCorteNumFijo] REAL,
  [MetrajeManualSN] BOOLEAN NOT NULL,
  [Tarifa] NVARCHAR(5),
  [CLAorden] SMALLINT,
  [TipoIVA_detallado_fijo] NVARCHAR(10),
  [IVAporc] REAL,
  [RecargoPorc] REAL,
  [NumeroLinea] INTEGER,
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [CosteMedioOrigen] NVARCHAR(10),
  [CosteMedioManual] REAL,
  [CosteMedioUltimaAct] DATE,
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [nVAccesorio] INTEGER,
  [NoComputarVentaSN] BOOLEAN NOT NULL,
  [PrecioVentaOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [TipoArticuloImpuesto] NVARCHAR(3),
  [Capitulo] SMALLINT,
  [CapituloPadre] SMALLINT,
  [CapituloTitulo] NVARCHAR(7),
  [CapituloDescripcion] NVARCHAR(50),
  [tldMedidaAltura] REAL,
  [CompFnumPanyo] SMALLINT,
  [BloqueoMedidasCorteSN] BOOLEAN NOT NULL,
  [EstructuraOrigen] NVARCHAR(15),
  [CdadEnReparto] REAL,
  [DespieceArticuloGeneradoSN] BOOLEAN NOT NULL,
  [CadenaDeClasificacionEstadisticas] NVARCHAR(100),
  [nModulo] SMALLINT,
  [OFnumero] NVARCHAR(20),
  [tmpNumeroOF] NVARCHAR(20),
  [IntercompanyCPedNLinOrig] INTEGER,
  [CorteSinValoracionSN] BOOLEAN NOT NULL,
  [ValoracionSinCorteSN] BOOLEAN NOT NULL,
  [CdadFac_corrector] REAL,
  [CdadMetPorEmb] REAL,
  [BloqueoCdadMetPorEmbSN] BOOLEAN NOT NULL,
  [NumeroLotePrevisto] NVARCHAR(30),
  [PesoComputado] REAL,
  [Descuento2Porc] REAL,
  [ReferenciaInterna] NVARCHAR(30),
  [LastModified] DATE,
  [nEtiquetasUdFabr] REAL,
  [nEtiquetasUdFabrFacturadas] REAL,
  [Precio] DOUBLE,
  [ImporteTotal] DOUBLE,
  [VentaTotal] DOUBLE,
  [ProduccionSeccion] NVARCHAR(10),
  [OrdenEstructura] SMALLINT,
  [AcabadoInt] NVARCHAR(10),
  [AcabadoExt] NVARCHAR(10),
  [AcabadoIntermedio] NVARCHAR(10),
  [AcaTonalidadInt] NVARCHAR(10),
  [AcaTonalidadExt] NVARCHAR(10),
  [AcaTonalidadIntermedio] NVARCHAR(10),
  [ObservHD] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== VPedidosLinImpuestos  (filas: 0) =====
CREATE TABLE [VPedidosLinImpuestos] (
  [nVLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [nDoc] INTEGER,
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nVLinea], [CodigoImpuesto])
);

-- ===== VPedTrabajadoresFabricacion  (filas: 0) =====
CREATE TABLE [VPedTrabajadoresFabricacion] (
  [nDoc] INTEGER NOT NULL,
  [Trabajador] NVARCHAR(5) NOT NULL,
  [Observaciones] NVARCHAR,
  PRIMARY KEY ([nDoc], [Trabajador])
);

-- ===== VPlanProdRecursosDisp  (filas: 0) =====
CREATE TABLE [VPlanProdRecursosDisp] (
  [Fecha] DATE NOT NULL,
  [Seccion] NVARCHAR(30) NOT NULL,
  [horas_disp] REAL,
  [horas_asignadas] REAL,
  [horas_libres] REAL,
  PRIMARY KEY ([Fecha], [Seccion])
);

-- ===== VPlanProdRecursosDispPedidosAsignados  (filas: 0) =====
CREATE TABLE [VPlanProdRecursosDispPedidosAsignados] (
  [nLinea] INTEGER NOT NULL,
  [Fecha] DATE,
  [Seccion] NVARCHAR(30),
  [numeroPed] NVARCHAR(20),
  [horas_asignadas] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VPrecioEspecial  (filas: 0) =====
CREATE TABLE [VPrecioEspecial] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Coste] REAL,
  [PVP] REAL,
  [RespetarPrecioSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado])
);

-- ===== VPresupuestos  (filas: 2335) =====
CREATE TABLE [VPresupuestos] (
  [Id] INTEGER NOT NULL,
  [Revision] NVARCHAR(3),
  [Cliente] NVARCHAR(10),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliTelefono] NVARCHAR(20),
  [CliFax] NVARCHAR(20),
  [CliTipo] NVARCHAR(3),
  [Tarifa] NVARCHAR(5),
  [Serie] NVARCHAR(1),
  [IVAincluidoSN] BOOLEAN NOT NULL,
  [Estado] NVARCHAR(10),
  [Fecha] DATE,
  [FechaAcept] DATE,
  [Subtotal] DOUBLE,
  [DescuentoPorc] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPPporc] REAL,
  [DescuentoPP] REAL,
  [BaseImponible] DOUBLE,
  [IVAPorc] REAL,
  [IVA] DOUBLE,
  [RecargoPorc] REAL,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  [ImporteTotalEU] DOUBLE,
  [SemanaPrevMontaje] INTEGER,
  [FechaMontaje] DATE,
  [Montador1] NVARCHAR(5),
  [Montador2] NVARCHAR(5),
  [UsuarioAgenda] NVARCHAR(30),
  [RecibidoACuenta] REAL,
  [TipoDestino] NVARCHAR(12),
  [TipoVenta] NVARCHAR(5),
  [Representante] NVARCHAR(5),
  [ComisionPorc] REAL,
  [Comision] REAL,
  [SumarComisionSN] BOOLEAN NOT NULL,
  [GastosFinancPorc] REAL,
  [GastosFinanc] REAL,
  [DeducirIVAsn] BOOLEAN NOT NULL,
  [Portes] REAL,
  [OtrosGastos] REAL,
  [DespuntePorc] REAL,
  [DespunteBase] REAL,
  [Despunte] REAL,
  [NoInformesSN] BOOLEAN NOT NULL,
  [BloqueoPreciosSN] BOOLEAN NOT NULL,
  [BloqueoCosteSN] BOOLEAN NOT NULL,
  [PresentSN] BOOLEAN NOT NULL,
  [TipoMedHM] NVARCHAR(1),
  [ObservHC_HD] NVARCHAR,
  [Idioma] NVARCHAR(3),
  [ServidoFasesSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [ExportadoSN] BOOLEAN NOT NULL,
  [CliNombre] NVARCHAR(100),
  [Obra] NVARCHAR(60),
  [Observaciones] NVARCHAR,
  [Usuario] NVARCHAR(30),
  [nDocDestino] NVARCHAR(20),
  [Numero] NVARCHAR(20) NOT NULL,
  [CTEzonaClimatica] NVARCHAR(2),
  [CTEcodigoProvincia] NVARCHAR(2),
  [CTEaltitud] SMALLINT,
  [autorizaVDocSN] BOOLEAN NOT NULL,
  [autorizaVDocResultado] NVARCHAR(10),
  [autorizaVDocUsuarioSolicita] NVARCHAR(30),
  [autorizaVDocUsuarioAut] NVARCHAR(30),
  [autorizaVDocObservaciones] NVARCHAR(255),
  [ClientePot_CLI_POT] NVARCHAR(3),
  [Potencial] NVARCHAR(10),
  [EntregadoSN] BOOLEAN NOT NULL,
  [FechaEntrega] DATE,
  [FactProformaSN] BOOLEAN NOT NULL,
  [Zona] NVARCHAR(5),
  [CliPais] NVARCHAR(10),
  [CliTelefono2] NVARCHAR(20),
  [VOfertas] NVARCHAR(255),
  [COferta] NVARCHAR(255),
  [costeMemo_baseImp] REAL,
  [costeMemo_nLineas] SMALLINT,
  [CliNIF] NVARCHAR(30),
  [CliCodigoFiscal2] NVARCHAR(30),
  [CliCodigoFiscal3] NVARCHAR(30),
  [CliCodigoFiscalObservaciones] NVARCHAR(30),
  [ClieMail] NVARCHAR(150),
  [CosteSelProvSubfamSN] BOOLEAN NOT NULL,
  [CosteSelProvArticuloSN] BOOLEAN NOT NULL,
  [TipoIVA] NVARCHAR(2),
  [FormaPago] NVARCHAR(5),
  [FechaExportado] DATE,
  [TipoDocumento] NVARCHAR(5),
  [CliPersonaFisicaJuridica] NVARCHAR(8),
  [CliCondicionResidencia] NVARCHAR(3),
  [DivisaFechaActCambio] DATE,
  [DivisaImprimir] NVARCHAR(5),
  [DivisaImprimirCambio] REAL,
  [DivisaPrincipal] NVARCHAR(5),
  [BloqueoFormaPagoSN] BOOLEAN NOT NULL,
  [RetencionPorc] REAL,
  [Retencion] DOUBLE,
  [RetTipo] NVARCHAR(1),
  [RetBase] REAL,
  [NoCalcularRecargoEnergeticoSN] BOOLEAN NOT NULL,
  [BloqueoNumeroLineaSN] BOOLEAN NOT NULL,
  [NoAplicarForfaitSN] BOOLEAN NOT NULL,
  [VAlbFacAutoSN] BOOLEAN NOT NULL,
  [VAlbFacAutoPreguntaSN] BOOLEAN NOT NULL,
  [PeriodoFiscal] NVARCHAR(8),
  [PortesPorc] REAL,
  [GastosGeneralesPorc] REAL,
  [GastosGenerales] REAL,
  [SeguimientoSN] BOOLEAN NOT NULL,
  [FechaSeguimiento] DATE,
  [UsuarioMarcaSeguimiento] NVARCHAR(30),
  [SeguimientoCompletoSN] BOOLEAN NOT NULL,
  [FechaSeguimientoCompleto] DATE,
  [TipoWDocOrigen] NVARCHAR(15),
  [NumeroWDocOrigen] NVARCHAR(20),
  [RevisionWDocOrigen] SMALLINT,
  [TipoRetencion] NVARCHAR(2),
  [CEcalculadoSN] BOOLEAN NOT NULL,
  [CEcalculadoFecha] DATE,
  [CliAtt] NVARCHAR(255),
  [NumeroDireccionEnv] SMALLINT,
  [BloqueoDireccionEnvioSN] BOOLEAN NOT NULL,
  [DirEnvRazon] NVARCHAR(100),
  [DirEnvDireccion] NVARCHAR(150),
  [DirEnvPais] NVARCHAR(10),
  [DirEnvCP] NVARCHAR(20),
  [DirEnvPoblacion] NVARCHAR(80),
  [DirEnvProvincia] NVARCHAR(80),
  [DirEnvTelefono] NVARCHAR(20),
  [IdGrupoDocumentos] NVARCHAR(6),
  [NombreVersion] NVARCHAR(100),
  [FechaPrevistaMontajeObservaciones] NVARCHAR(50),
  [FechaPrevistaMontaje] DATE,
  [TipoRemesa] NVARCHAR(5),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [LastModified] DATE,
  [ReferenciaInterna] NVARCHAR(60),
  [ObservacionesProduccion] NVARCHAR,
  [BorradorSN] BOOLEAN NOT NULL,
  [TarDinPrecioBase] REAL,
  [TarDinIncrementoBase] REAL,
  [OrigenWebSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Id])
);

-- ===== VPresupuestosCap  (filas: 0) =====
CREATE TABLE [VPresupuestosCap] (
  [nLin] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [Capitulo] SMALLINT,
  [Descripcion] NVARCHAR(250),
  PRIMARY KEY ([nLin])
);

-- ===== VPresupuestosDtos  (filas: 0) =====
CREATE TABLE [VPresupuestosDtos] (
  [nLin] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [Familia] NVARCHAR(10),
  [DescuentoPorc] REAL,
  [DescuentoPorKg] REAL,
  [DescuentoCosteAca] REAL,
  [Subfamilia] NVARCHAR(10),
  PRIMARY KEY ([nLin])
);

-- ===== VPresupuestosGastos  (filas: 0) =====
CREATE TABLE [VPresupuestosGastos] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [Descripcion] NVARCHAR(40),
  [Importe] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VPresupuestosIVAResumen  (filas: 0) =====
CREATE TABLE [VPresupuestosIVAResumen] (
  [nDoc] INTEGER NOT NULL,
  [TipoIVA] NVARCHAR(2) NOT NULL,
  [Subtotal] DOUBLE,
  [Descuento] DOUBLE,
  [DescuentoPP] DOUBLE,
  [BaseImponible] DOUBLE,
  [IVAporc] DOUBLE,
  [IVA] DOUBLE,
  [RecargoPorc] DOUBLE,
  [Recargo] DOUBLE,
  [ImporteTotal] DOUBLE,
  PRIMARY KEY ([nDoc], [TipoIVA])
);

-- ===== VPresupuestosLin  (filas: 468838) =====
CREATE TABLE [VPresupuestosLin] (
  [nLinea] INTEGER NOT NULL,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nEstr] INTEGER,
  [EstructuraSN] BOOLEAN NOT NULL,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Acabado2] NVARCHAR(10),
  [ColorPerfil] INTEGER,
  [Cdad] REAL,
  [CdadHC] REAL,
  [Descripcion] NVARCHAR,
  [CdadFacturada] REAL,
  [CdadPasar] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [PrecioKg] REAL,
  [PesoKg] REAL,
  [PrecioCompacto] REAL,
  [MetrajeCompacto] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [GastosIndirectos] REAL,
  [Coste] REAL,
  [CosteDtoPorc] REAL,
  [CosteManual] REAL,
  [RespetarPrecioSN] BOOLEAN NOT NULL,
  [CosteMetrajeTotal] REAL,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [HojaDespieceSN] BOOLEAN NOT NULL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [LargoCorteCurva] REAL,
  [CantidadCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [Radio] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [DirVeta] NVARCHAR(1),
  [Funcion] NVARCHAR(20),
  [DtoNuloA] NVARCHAR(1),
  [DtoNuloL] NVARCHAR(1),
  [DtoLIni] REAL,
  [DtoLFin] REAL,
  [PosicionTrabajo] NVARCHAR(1),
  [SeleccionadoHCsn] BOOLEAN NOT NULL,
  [Capitulo] SMALLINT,
  [ComputoMetSN] BOOLEAN NOT NULL,
  [nLinAsoc] INTEGER,
  [GastosIndSN] BOOLEAN NOT NULL,
  [precioServFases] REAL,
  [NoRedibujarSN] BOOLEAN NOT NULL,
  [Aca2Tonalidad] NVARCHAR(10),
  [AcabadoMad] NVARCHAR(10),
  [AcaMadTonalidad] NVARCHAR(10),
  [CosteMedioFechaDoc] REAL,
  [asocArt_nLineaOrigen] INTEGER,
  [ObservHD] NVARCHAR(255),
  [AcaTonalidad] NVARCHAR(20),
  [PVPManualSN] BOOLEAN NOT NULL,
  [nLinRelacionada] INTEGER,
  [nLinRelTipoDoc] NVARCHAR(6),
  [ColorAcc] INTEGER,
  [RecargoEnergeticoArtSN] BOOLEAN NOT NULL,
  [NoComputarCosteSN] BOOLEAN NOT NULL,
  [DescuentoManualSN] BOOLEAN NOT NULL,
  [costeQuePrv] NVARCHAR(10),
  [costeOrigen] NVARCHAR(10),
  [TarifaManualSN] BOOLEAN NOT NULL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [Volumen] REAL,
  [PesoKgbruto] REAL,
  [DescripcionIdioma] NVARCHAR,
  [TipoIVA] NVARCHAR(2),
  [ComisionPorcManualSN] BOOLEAN NOT NULL,
  [ComisionPorcManual] REAL,
  [ComisionManualSN] BOOLEAN NOT NULL,
  [ComisionManual] REAL,
  [MetrajeMinimoAplicado] REAL,
  [MultiploAnchoAplicado] REAL,
  [MultiploLargoAplicado] REAL,
  [MetrajeMinimoEspecialSN] BOOLEAN NOT NULL,
  [MetrajeMinimoEspecial] REAL,
  [MultiploEspecialSN] BOOLEAN NOT NULL,
  [MultiploAnchoEspecial] REAL,
  [MultiploLargoEspecial] REAL,
  [AnchoConMultiplo] REAL,
  [LargoConMultiplo] REAL,
  [CalcEtiqCorte] NVARCHAR(7),
  [CalcEtiqCorteNumFijo] REAL,
  [MetrajeManualSN] BOOLEAN NOT NULL,
  [Tarifa] NVARCHAR(5),
  [CLAorden] SMALLINT,
  [TipoIVA_detallado_fijo] NVARCHAR(10),
  [IVAporc] REAL,
  [RecargoPorc] REAL,
  [NumeroLinea] INTEGER,
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [CosteMedioOrigen] NVARCHAR(10),
  [CosteMedioManual] REAL,
  [CosteMedioUltimaAct] DATE,
  [ArticuloForfaitSN] BOOLEAN NOT NULL,
  [nVAccesorio] INTEGER,
  [NoComputarVentaSN] BOOLEAN NOT NULL,
  [PrecioVentaOriginal] REAL,
  [PrecioConImpuestos] REAL,
  [ImporteTotalConImpuestos] REAL,
  [TipoArticuloImpuesto] NVARCHAR(3),
  [CapituloPadre] SMALLINT,
  [CapituloTitulo] NVARCHAR(7),
  [CapituloDescripcion] NVARCHAR(50),
  [tldMedidaAltura] REAL,
  [CompFnumPanyo] SMALLINT,
  [BloqueoMedidasCorteSN] BOOLEAN NOT NULL,
  [EstructuraOrigen] NVARCHAR(15),
  [CadenaDeClasificacionEstadisticas] NVARCHAR(100),
  [nModulo] SMALLINT,
  [CorteSinValoracionSN] BOOLEAN NOT NULL,
  [ValoracionSinCorteSN] BOOLEAN NOT NULL,
  [DespieceArticuloGeneradoSN] BOOLEAN NOT NULL,
  [CdadMetPorEmb] REAL,
  [BloqueoCdadMetPorEmbSN] BOOLEAN NOT NULL,
  [PesoComputado] REAL,
  [Descuento2Porc] REAL,
  [ReferenciaInterna] NVARCHAR(30),
  [LastModified] DATE,
  [Familia] NVARCHAR(10),
  [Precio] DOUBLE,
  [Subtotal] DOUBLE,
  [ImporteTotal] DOUBLE,
  [VentaTotal] DOUBLE,
  [ProduccionSeccion] NVARCHAR(10),
  [OrdenEstructura] SMALLINT,
  [AcabadoInt] NVARCHAR(10),
  [AcabadoExt] NVARCHAR(10),
  [AcabadoIntermedio] NVARCHAR(10),
  [AcaTonalidadInt] NVARCHAR(10),
  [AcaTonalidadExt] NVARCHAR(10),
  [AcaTonalidadIntermedio] NVARCHAR(10),
  PRIMARY KEY ([nLinea])
);

-- ===== VPresupuestosLinEtiq  (filas: 0) =====
CREATE TABLE [VPresupuestosLinEtiq] (
  [nLinea] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [OrigNLinea] INTEGER,
  [nEstr] INTEGER,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [Cdad] REAL,
  [CdadHC] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [ancho] REAL,
  [largo] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [HojaDespieceSN] BOOLEAN NOT NULL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [LargoCorteCurva] REAL,
  [CantidadCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [Radio] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [LongitudInt] REAL,
  [PosicionTrabajo] NVARCHAR(1),
  [Funcion] NVARCHAR(20),
  [DtoNuloA] NVARCHAR(1),
  [DtoNuloL] NVARCHAR(1),
  [AcaTonalidad] NVARCHAR(10),
  [EstructuraSN] BOOLEAN NOT NULL,
  [nLinAsoc] INTEGER,
  [nLinEstr_VDD] INTEGER,
  [ObservHD] NVARCHAR(255),
  [EtiqTpte_numUd_TotalLin] NVARCHAR(10),
  [BultoNLinea] INTEGER,
  [CompFnumPanyo] SMALLINT,
  [FechaHoraAct] DATE,
  PRIMARY KEY ([nLinea])
);

-- ===== VPresupuestosLinHD  (filas: 0) =====
CREATE TABLE [VPresupuestosLinHD] (
  [nLinea] INTEGER NOT NULL,
  [idOpti] INTEGER,
  [nDoc] INTEGER,
  [nOrden] INTEGER,
  [nGrupo] INTEGER,
  [GrupoSN] BOOLEAN NOT NULL,
  [OrigNLinea] INTEGER,
  [nEstr] INTEGER,
  [Articulo] NVARCHAR(15),
  [Referencia] NVARCHAR(25),
  [Acabado] NVARCHAR(10),
  [Descripcion] NVARCHAR,
  [Cdad] REAL,
  [CdadHC] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [Precio] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [ImporteTotal] REAL,
  [ancho] REAL,
  [largo] REAL,
  [largoHueco] REAL,
  [anchoHueco] REAL,
  [coste] REAL,
  [costeQuePrv] NVARCHAR(10),
  [CosteMetrajeTotal] REAL,
  [HojaCorteSN] BOOLEAN NOT NULL,
  [HojaDespieceSN] BOOLEAN NOT NULL,
  [LargoCorte] REAL,
  [AnchoCorte] REAL,
  [LargoCorteCurva] REAL,
  [CantidadCorte] REAL,
  [TipoCorte] NVARCHAR(2),
  [Radio] REAL,
  [AnguloI] REAL,
  [AnguloD] REAL,
  [LongitudInt] REAL,
  [PosicionTrabajo] NVARCHAR(1),
  [Funcion] NVARCHAR(20),
  [DtoNuloA] NVARCHAR(1),
  [DtoNuloL] NVARCHAR(1),
  [SeleccionadoHCsn] BOOLEAN NOT NULL,
  [Mano] NVARCHAR(1),
  [estrInfoCurMat] BOOLEAN NOT NULL,
  [estrInfoCurCurv] BOOLEAN NOT NULL,
  [estrInfoCurFabr] BOOLEAN NOT NULL,
  [EstrInfoCompSalRecFI] NVARCHAR(1),
  [AcaTonalidad] NVARCHAR(10),
  [CosteDtoPorc] REAL,
  [EstructuraSN] BOOLEAN NOT NULL,
  [MetrajeCompacto] REAL,
  [PrecioCompacto] REAL,
  [nLinAsoc] INTEGER,
  [nLinEstr_VDD] INTEGER,
  [EstrInfoCompPosRecID] NVARCHAR(2),
  [ObservHD] NVARCHAR(255),
  [tronFormatoCorte] NVARCHAR(3),
  [nVAccesorio] INTEGER,
  [TipoDoc] NVARCHAR(6),
  [CompFnumPanyo] SMALLINT,
  [EstructuraOrigen] NVARCHAR(15),
  PRIMARY KEY ([nLinea])
);

-- ===== VPresupuestosLinImpuestos  (filas: 0) =====
CREATE TABLE [VPresupuestosLinImpuestos] (
  [nVLinea] INTEGER NOT NULL,
  [CodigoImpuesto] NVARCHAR(10) NOT NULL,
  [nDoc] INTEGER,
  [NumeroDocumento] NVARCHAR(20),
  [BaseCalculo] REAL,
  [Porcentaje] REAL,
  [CuotaImpuesto] REAL,
  [BaseParaSiguiente] REAL,
  [CodigoFiscal1] NVARCHAR(40),
  [CodigoFiscal2] NVARCHAR(40),
  PRIMARY KEY ([nVLinea], [CodigoImpuesto])
);

-- ===== VPryDtosCLAs  (filas: 0) =====
CREATE TABLE [VPryDtosCLAs] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [NoGenerarCLAsn] BOOLEAN NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado])
);

-- ===== VPryDtosCLAsInteriorizados  (filas: 0) =====
CREATE TABLE [VPryDtosCLAsInteriorizados] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [nLinea] INTEGER NOT NULL,
  [Precio] REAL,
  [ImporteTotal] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [nLinea])
);

-- ===== VPryDtosDescuentoEsp  (filas: 0) =====
CREATE TABLE [VPryDtosDescuentoEsp] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [Descuento] REAL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  [Descuento2] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VPryDtosMetrajeMinimo  (filas: 0) =====
CREATE TABLE [VPryDtosMetrajeMinimo] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [MetrajeMinimo] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado])
);

-- ===== VPryDtosMuliplos  (filas: 0) =====
CREATE TABLE [VPryDtosMuliplos] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [MultiploAncho] REAL,
  [MultiploLargo] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado])
);

-- ===== VPryDtosPrecioEsp  (filas: 0) =====
CREATE TABLE [VPryDtosPrecioEsp] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Articulo] NVARCHAR(15) NOT NULL,
  [Acabado] NVARCHAR(10) NOT NULL,
  [PVP] REAL,
  [AcaTonalidad] NVARCHAR(10) NOT NULL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Articulo], [Acabado], [AcaTonalidad])
);

-- ===== VPryDtosPrecioM2  (filas: 0) =====
CREATE TABLE [VPryDtosPrecioM2] (
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Estructura] NVARCHAR(15) NOT NULL,
  [PrecioM2especialSN] BOOLEAN NOT NULL,
  [PrecioM2] REAL,
  [DescuentoEspecialSN] BOOLEAN NOT NULL,
  [Descuento] REAL,
  [Descuento2] REAL,
  PRIMARY KEY ([TipoDoc], [nDoc], [Estructura])
);

-- ===== VRegistroCambios  (filas: 0) =====
CREATE TABLE [VRegistroCambios] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [Fecha] DATE,
  [SolicitadoPor] NVARCHAR(30),
  [Descripcion] NVARCHAR,
  [TipoDocOrig] NVARCHAR(6),
  [NuevoDoc_TipoDoc] NVARCHAR(6),
  [NuevoDoc_nDoc] INTEGER,
  [NumeroDocOrig] NVARCHAR(20),
  [NuevoDoc_Numero] NVARCHAR(20),
  [Usuario] NVARCHAR(30),
  PRIMARY KEY ([nLinea])
);

-- ===== VRemesas  (filas: 0) =====
CREATE TABLE [VRemesas] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [FechaContable] DATE,
  [TipoRemesa] NVARCHAR(5),
  [CuentaCob] NVARCHAR(4),
  [TipoGD] NVARCHAR(1),
  [nRemCSB] NVARCHAR(20),
  [ImporteTotal] DOUBLE,
  [contabCobrosSeparadosSN] BOOLEAN NOT NULL,
  [Delegacion] NVARCHAR(2),
  [ContabilizadaSN] BOOLEAN NOT NULL,
  [FechaContabilizada] DATE,
  [EstadoCobro] NVARCHAR(10),
  [nLin] INTEGER NOT NULL,
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [RemesaArchivo] NVARCHAR(20),
  PRIMARY KEY ([Numero])
);

-- ===== VReparto  (filas: 0) =====
CREATE TABLE [VReparto] (
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [TrabRepartidor] NVARCHAR(5),
  [CodRuta] NVARCHAR(5),
  [Vehiculo] NVARCHAR(10),
  [TipoDoc] NVARCHAR(6),
  [Delegacion] NVARCHAR(2),
  [RepartoServidoSN] BOOLEAN NOT NULL,
  [VehiculoRemolque] NVARCHAR(10),
  [PesoKg] REAL,
  [IdDispositivoAsignado] NVARCHAR(40),
  [AlbaranElectronicoAsignadoSN] BOOLEAN NOT NULL,
  [PesoKgBruto] REAL,
  [DescargadoEnDispositivoSN] BOOLEAN NOT NULL,
  [DescargadoEnDispositivoFecha] DATE,
  [TpteIncoterm] NVARCHAR(5),
  [TpteIncotermObservaciones] NVARCHAR(80),
  [TipoDocumento] NVARCHAR(5),
  [CorreccionPesoKg] REAL,
  [CorreccionPesoKgBruto] REAL,
  [Observaciones] NVARCHAR,
  [Precinto] NVARCHAR(100),
  [TipoPorte_NAC_INTL] NVARCHAR(4),
  [Usuario] NVARCHAR(30),
  [CerradoSN] BOOLEAN NOT NULL,
  [ObservacionesRepartidor] NVARCHAR(50),
  [SeriesNumNLin] INTEGER,
  [SeriesNumPrefijo] NVARCHAR(20),
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [KilometrosTotales] REAL,
  [TiempoRepartoTotalHoras] REAL,
  [NumeroEntregas] SMALLINT,
  [UltimoOrdenRepartoLin] SMALLINT,
  PRIMARY KEY ([Numero])
);

-- ===== VRepartoGastos  (filas: 0) =====
CREATE TABLE [VRepartoGastos] (
  [nReparto] NVARCHAR(20) NOT NULL,
  [IdGasto] GUID NOT NULL,
  [TipoGasto] NVARCHAR(5),
  [Fecha] DATE,
  [Importe] REAL,
  [Observaciones] NVARCHAR(255),
  [IdDispositivo] NVARCHAR(40),
  PRIMARY KEY ([IdGasto])
);

-- ===== VRepartoIncidencias  (filas: 0) =====
CREATE TABLE [VRepartoIncidencias] (
  [nReparto] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [TipoDoc] NVARCHAR(6),
  [NumeroDoc] NVARCHAR(20),
  [TipoIncidencia] NVARCHAR(5),
  [Observaciones] NVARCHAR,
  [IdIncidencia] GUID NOT NULL,
  [Origen] NVARCHAR(10),
  [IdDispositivo] NVARCHAR(40),
  PRIMARY KEY ([IdIncidencia])
);

-- ===== VRepartoLin  (filas: 0) =====
CREATE TABLE [VRepartoLin] (
  [nLinea] INTEGER NOT NULL,
  [nReparto] NVARCHAR(20) NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [NumeroDoc] NVARCHAR(20),
  [OrdenRepartoLin] SMALLINT,
  [FechaHoraAddDoc] DATE,
  PRIMARY KEY ([nLinea])
);

-- ===== VRepartoLinDet  (filas: 0) =====
CREATE TABLE [VRepartoLinDet] (
  [nLinea] INTEGER NOT NULL,
  [nLineaRepLin] INTEGER NOT NULL,
  [nReparto] NVARCHAR(20) NOT NULL,
  [TipoDoc] NVARCHAR(6) NOT NULL,
  [nDoc] INTEGER NOT NULL,
  [NumeroDoc] NVARCHAR(20) NOT NULL,
  [nLineaVDoc] INTEGER NOT NULL,
  [Cantidad] REAL,
  [PesoKg] REAL,
  [PesoKgBruto] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VRepRutas  (filas: 0) =====
CREATE TABLE [VRepRutas] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(40),
  [Repartidor] NVARCHAR(5),
  [RepLunesSN] BOOLEAN NOT NULL,
  [RepMartesSN] BOOLEAN NOT NULL,
  [RepMiercolesSN] BOOLEAN NOT NULL,
  [RepJuevesSN] BOOLEAN NOT NULL,
  [RepViernesSN] BOOLEAN NOT NULL,
  [RepSabadoSN] BOOLEAN NOT NULL,
  [RepDiasActualizaCliSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== VRepRutasZonas  (filas: 0) =====
CREATE TABLE [VRepRutasZonas] (
  [CodRuta] NVARCHAR(5) NOT NULL,
  [CodZona] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([CodRuta], [CodZona])
);

-- ===== VRepTiposGastos  (filas: 0) =====
CREATE TABLE [VRepTiposGastos] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== VRepTiposIncidencias  (filas: 0) =====
CREATE TABLE [VRepTiposIncidencias] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(100),
  [QuitarRepartoSN] BOOLEAN NOT NULL,
  [AnularAlbaranServidoSN] BOOLEAN NOT NULL,
  [AsignarNuevoTipoDocumentoSN] BOOLEAN NOT NULL,
  [NuevoTipoDocumento] NVARCHAR(5),
  [EnviarEmailClienteSN] BOOLEAN NOT NULL,
  [PlantillaEmailCliente] NVARCHAR,
  [EnviarEmailInternoSN] BOOLEAN NOT NULL,
  [EmailInterno] NVARCHAR(255),
  [PlantillaEmailInterno] NVARCHAR,
  [InsertarObservacionesSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Codigo])
);

-- ===== VRepVehiculoKm  (filas: 0) =====
CREATE TABLE [VRepVehiculoKm] (
  [Matricula] NVARCHAR(10) NOT NULL,
  [Fecha] DATE NOT NULL,
  [Kms] INTEGER,
  [IdDispositivo] NVARCHAR(40),
  PRIMARY KEY ([Matricula], [Fecha])
);

-- ===== VRepVehiculos  (filas: 0) =====
CREATE TABLE [VRepVehiculos] (
  [Matricula] NVARCHAR(10),
  [Modelo] NVARCHAR(40),
  [Marca] NVARCHAR(40),
  [FechaCompra] DATE,
  [FechaAlta] DATE,
  [BajaSN] BOOLEAN NOT NULL,
  [FechaBaja] DATE,
  [Tara] REAL,
  [PMA] REAL,
  PRIMARY KEY ([Matricula])
);

-- ===== VServFases  (filas: 0) =====
CREATE TABLE [VServFases] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [FaseEntrega] NVARCHAR(3),
  PRIMARY KEY ([TipoDoc], [nDoc], [FaseEntrega])
);

-- ===== VStockDisp  (filas: 0) =====
CREATE TABLE [VStockDisp] (
  [nLinea] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] NVARCHAR(20),
  [Articulo] NVARCHAR(15),
  [Acabado] NVARCHAR(10),
  [Ancho] REAL,
  [Largo] REAL,
  [CantidadPed] REAL,
  [Stock] REAL,
  [ComprasPend] REAL,
  [VentasPend] REAL,
  [StockDisp] REAL,
  [BrutoStockDisp] REAL,
  [BrutoStockFisico] REAL,
  [Saldo] REAL,
  [RPTsn] BOOLEAN NOT NULL,
  [RPTcomponenteSN] BOOLEAN NOT NULL,
  [RPTnLinPerfil] INTEGER,
  [AcaTonalidad] NVARCHAR(10),
  [ProvFabrStockDisp] REAL,
  [ProvFabrStockFisico] REAL,
  [ProvFabrSaldoTotal] REAL,
  [Almacen] NVARCHAR(5),
  [AlmacenProvFabr] NVARCHAR(5),
  [Descripcion] NVARCHAR(255),
  [Reservas] REAL,
  [FabricacionesPend] REAL,
  [LotesAsignados] REAL,
  PRIMARY KEY ([nLinea])
);

-- ===== VTextos  (filas: 5) =====
CREATE TABLE [VTextos] (
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [CodigoTextoIni] NVARCHAR(2),
  [CodigoTextoFin1] NVARCHAR(2),
  [CodigoTextoFin2] NVARCHAR(2),
  [CodigoTextoMem] NVARCHAR(2),
  [TextoIni] NVARCHAR,
  [TextoFin1] NVARCHAR,
  [TextoFin2] NVARCHAR,
  [TextoMemoria] NVARCHAR,
  PRIMARY KEY ([TipoDoc], [nDoc])
);

-- ===== VTotalFam  (filas: 122) =====
CREATE TABLE [VTotalFam] (
  [nLin] INTEGER NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [nLinEstr] INTEGER,
  [Familia] NVARCHAR(10),
  [CuentaContable] NVARCHAR(15),
  [Total] DOUBLE,
  [TraspasarCuentaSN] BOOLEAN NOT NULL,
  [DescripcionCuentaContable] NVARCHAR(255),
  PRIMARY KEY ([nLin])
);

-- ===== WCategoriasAca  (filas: 0) =====
CREATE TABLE [WCategoriasAca] (
  [Estructura] NVARCHAR(14) NOT NULL,
  [IdDocumento] GUID NOT NULL,
  [IdLinea] GUID NOT NULL,
  [Categoria] NVARCHAR(5) NOT NULL,
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  PRIMARY KEY ([IdDocumento], [IdLinea], [Estructura], [Categoria])
);

-- ===== WClientesConfig  (filas: 0) =====
CREATE TABLE [WClientesConfig] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [FuncionesPremium] BOOLEAN NOT NULL,
  [AplicarWTarifa] BOOLEAN NOT NULL,
  [CodigoWTarifaPredeterminada] NVARCHAR(5),
  [PuedeCambiarWTarifaCliente] BOOLEAN NOT NULL,
  [PasswordHashConfig] NVARCHAR(100),
  [CabRptImprimirLogoSN] BOOLEAN NOT NULL,
  [CabRptIdLogo] GUID,
  [CabRptNombre] NVARCHAR(100),
  [CabRptDireccion] NVARCHAR(150),
  [CabRptCodigoPostal] NVARCHAR(20),
  [CabRptPoblacion] NVARCHAR(80),
  [CabRptProvincia] NVARCHAR(80),
  [CabRptTelefono] NVARCHAR(20),
  [CabRpteMail] NVARCHAR(150),
  [CabRptWeb] NVARCHAR(255),
  [PrefijoNumWPresupuesto] NVARCHAR(20),
  [PrefijoNumWPedido] NVARCHAR(20),
  [PrecioManualEnEstructuras] BOOLEAN NOT NULL,
  [ProdWebIntegraActivoSN] BOOLEAN NOT NULL,
  [ProdWebIntegraTokenIntegracion] NVARCHAR(8),
  [ProdWebIntegraTokenValidezHasta] DATE,
  [MailRemitenteNombre] NVARCHAR(50),
  [MailDireccion] NVARCHAR(100),
  [MailUsuario] NVARCHAR(100),
  [MailContraseña] NVARCHAR(50),
  [MailServidor] NVARCHAR(100),
  [MailPuerto] SMALLINT,
  [MailUsarSSLSN] BOOLEAN NOT NULL,
  [MailCopiaCCOSN] BOOLEAN NOT NULL,
  [AplicarDescuentosSN] BOOLEAN NOT NULL,
  [PermitirDescuentosManualesSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([Cliente])
);

-- ===== WClientesFinales  (filas: 0) =====
CREATE TABLE [WClientesFinales] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [IdClienteFinal] GUID NOT NULL,
  [Nombre] NVARCHAR(100),
  [NombreComercial] NVARCHAR(100),
  [Att] NVARCHAR(30),
  [FechaAlta] DATE,
  [EntregaNombre] NVARCHAR(100),
  [EntregaTelefono] NVARCHAR(20),
  [Observaciones] NVARCHAR,
  [Idioma] NVARCHAR(3),
  [Telefono] NVARCHAR(20),
  [Telefono2] NVARCHAR(20),
  [Fax] NVARCHAR(20),
  [TelefonoMovil] NVARCHAR(20),
  [eMail] NVARCHAR(150),
  [web] NVARCHAR(255),
  [Nif] NVARCHAR(30),
  [CodigoFiscal2] NVARCHAR(30),
  [CodigoFiscal3] NVARCHAR(30),
  [CodigoFiscalObservaciones] NVARCHAR(30),
  [Direccion] NVARCHAR(150),
  [Poblacion] NVARCHAR(80),
  [Provincia] NVARCHAR(80),
  [Pais] NVARCHAR(10),
  [EntregaDireccion] NVARCHAR(150),
  [EntregaCP] NVARCHAR(20),
  [EntregaPoblacion] NVARCHAR(80),
  [EntregaProvincia] NVARCHAR(80),
  [EntregaPais] NVARCHAR(10),
  [CP] NVARCHAR(20),
  [AplicarWTarifa] BOOLEAN NOT NULL,
  [CodigoWTarifa] NVARCHAR(5),
  [TipoIVA] NVARCHAR(2),
  [DivisaImprimir] NVARCHAR(5),
  [Divisa] NVARCHAR(5),
  PRIMARY KEY ([IdClienteFinal])
);

-- ===== WClientesFinalesDtoFamArt  (filas: 0) =====
CREATE TABLE [WClientesFinalesDtoFamArt] (
  [FamiliaArticulos] NVARCHAR(10) NOT NULL,
  [IdClienteFinal] GUID NOT NULL,
  [Descuento] REAL,
  PRIMARY KEY ([IdClienteFinal], [FamiliaArticulos])
);

-- ===== WClientesFinalesDtoFamEstr  (filas: 0) =====
CREATE TABLE [WClientesFinalesDtoFamEstr] (
  [FamiliaEstructuras] NVARCHAR(10) NOT NULL,
  [IdClienteFinal] GUID NOT NULL,
  [Descuento] REAL,
  PRIMARY KEY ([IdClienteFinal], [FamiliaEstructuras])
);

-- ===== WDocumentos  (filas: 0) =====
CREATE TABLE [WDocumentos] (
  [TipoWDocumento] NVARCHAR(15),
  [IdDocumento] GUID NOT NULL,
  [Serie] NVARCHAR(5),
  [Numero] NVARCHAR(20) NOT NULL,
  [Fecha] DATE,
  [Cliente] NVARCHAR(10),
  [CliNombre] NVARCHAR(100),
  [CliTelefono] NVARCHAR(20),
  [CliTelefono2] NVARCHAR(20),
  [CliEMail] NVARCHAR(150),
  [CliFax] NVARCHAR(20),
  [CliPersonaFisicaJuridica] NVARCHAR(8),
  [CliNif] NVARCHAR(30),
  [CliCodigoFiscal2] NVARCHAR(30),
  [CliCodigoFiscal3] NVARCHAR(30),
  [CliCodigoFiscalObservaciones] NVARCHAR(30),
  [CliCondicionResidencia] NVARCHAR(3),
  [CliDireccion] NVARCHAR(150),
  [CliCP] NVARCHAR(20),
  [CliPoblacion] NVARCHAR(80),
  [CliProvincia] NVARCHAR(80),
  [CliPais] NVARCHAR(10),
  [Tarifa] NVARCHAR(5),
  [Obra] NVARCHAR(60),
  [Divisa] NVARCHAR(5),
  [DivisaCambio] REAL,
  [Subtotal] REAL,
  [DescuentoPorc] REAL,
  [DescuentoPPPorc] REAL,
  [Descuento] REAL,
  [DescuentoPP] REAL,
  [BaseImponible] REAL,
  [IVAPorc] REAL,
  [IVA] REAL,
  [TipoIVA] NVARCHAR(2),
  [RecargoPorc] REAL,
  [Recargo] REAL,
  [RetBase] REAL,
  [RetencionPorc] REAL,
  [Retencion] REAL,
  [RetTipo] REAL,
  [ImporteTotal] REAL,
  [Zona] NVARCHAR(5),
  [Representante] NVARCHAR(5),
  [ComisionPorc] REAL,
  [Comision] REAL,
  [RecibidoACuenta] REAL,
  [ExportadoSN] BOOLEAN NOT NULL,
  [FechaExportado] DATE,
  [TipoVenta] NVARCHAR(5),
  [FormaPago] NVARCHAR(5),
  [TipoRemesa] NVARCHAR(5),
  [Idioma] NVARCHAR(3),
  [Usuario] NVARCHAR(30),
  [ObservacionesInternas] NVARCHAR,
  [ObservacionesPublicas] NVARCHAR,
  [IdClienteFinal] GUID,
  [AplicarWTarifa] BOOLEAN NOT NULL,
  [CodigoWTarifa] NVARCHAR(5),
  [Estado] NVARCHAR(5),
  [MedicionRealizadaSN] BOOLEAN NOT NULL,
  [MedicionFechaPrevista] DATE,
  [MedicionFechaRealizada] DATE,
  [NumeroRevision] SMALLINT,
  [TipoDocDestino] NVARCHAR(6),
  [NumeroDocDestino] NVARCHAR(20),
  [ConvertidoEnWPedidoSN] BOOLEAN NOT NULL,
  [NumeroWPedido] NVARCHAR(20),
  [TipoRetencion] NVARCHAR(2),
  [NombreClienteFinal] NVARCHAR(100),
  [TelefonoClienteFinal] NVARCHAR(20),
  [eMailClienteFinal] NVARCHAR(150),
  [CliAtt] NVARCHAR(255),
  [OrigenIntegracionWebSN] BOOLEAN NOT NULL,
  [DespunteRepercutidoSN] BOOLEAN NOT NULL,
  [DespunteRepercutidoFecha] DATE,
  [Delegacion] NVARCHAR(2),
  [ClientePot_CLI_POT] NVARCHAR(3),
  [Potencial] NVARCHAR(10),
  PRIMARY KEY ([IdDocumento])
);

-- ===== WDocumentosComplementos  (filas: 0) =====
CREATE TABLE [WDocumentosComplementos] (
  [Acabado] NVARCHAR(10),
  [IdDocumento] GUID NOT NULL,
  [IdLinea] GUID NOT NULL,
  [CodigoEstructura] NVARCHAR(14) NOT NULL,
  [PersianaAlturaCajon] SMALLINT,
  [PersianaPosicionRecogedor] NVARCHAR(20),
  [PersianaGuiaCentralSN] BOOLEAN NOT NULL,
  [PersianaCtoGuiaIzquierda] NVARCHAR(15),
  [PersianaCtoGuiaDerecha] NVARCHAR(15),
  [TipoComplemento] NVARCHAR(20),
  [PersianaSeccionTabique] SMALLINT,
  [AcaTonalidad] NVARCHAR(10),
  PRIMARY KEY ([IdDocumento], [IdLinea], [CodigoEstructura])
);

-- ===== WDocumentosEstados  (filas: 0) =====
CREATE TABLE [WDocumentosEstados] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(40),
  PRIMARY KEY ([Codigo])
);

-- ===== WDocumentosImagenes  (filas: 0) =====
CREATE TABLE [WDocumentosImagenes] (
  [TipoImagen] NVARCHAR(40),
  [IdImagen] GUID NOT NULL,
  [IdDocumento] GUID,
  [Titulo] NVARCHAR(80),
  [Descripcion] NVARCHAR,
  [NombreBlob] NVARCHAR(40),
  [UrlImagen] NVARCHAR(255),
  PRIMARY KEY ([IdImagen])
);

-- ===== WDocumentosLineas  (filas: 0) =====
CREATE TABLE [WDocumentosLineas] (
  [Orden] SMALLINT,
  [IdLinea] GUID NOT NULL,
  [IdDocumento] GUID,
  [ReferenciaLinea] NVARCHAR(25),
  [TipoLinea] NVARCHAR(20),
  [Articulo] NVARCHAR(15),
  [Estructura] NVARCHAR(14),
  [Descripcion] NVARCHAR,
  [DescripcionIdioma] NVARCHAR,
  [Acabado] NVARCHAR(10),
  [AcaTonalidad] NVARCHAR(10),
  [Cantidad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [Precio] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [ImporteTotal] REAL,
  [TipoIVA] NVARCHAR(2),
  [PesoKg] REAL,
  [PesoKgBruto] REAL,
  [Volumen] REAL,
  [UnidadesEmbalaje] NVARCHAR(6),
  [UdsEmbCantidad] REAL,
  [CodigoSeriePerfiles] NVARCHAR(15),
  [CodigoVidrio] NVARCHAR(15),
  [DescripcionManualSN] BOOLEAN NOT NULL,
  [PrecioManualSN] BOOLEAN NOT NULL,
  [PrecioCoste] REAL,
  [DescuentoPorcCoste] REAL,
  [DescuentoCoste] REAL,
  [ImporteTotalCoste] REAL,
  [MargenPorcAplicado] REAL,
  [IdDibujoEstructura] INTEGER,
  [ObservacionesProduccion] NVARCHAR,
  [NumeroOpcionApertura] SMALLINT,
  [EsCLA] BOOLEAN NOT NULL,
  [CLAIdLineaPrincipal] GUID,
  [CEaplicableSN] BOOLEAN NOT NULL,
  [CEnoValidoSN] BOOLEAN NOT NULL,
  [CEEEVclaseEEInvierno] NVARCHAR(1),
  [CEEEVclaseEEVerano] NVARCHAR(3),
  [CEEEVfactorSolarVidrio] REAL,
  [CEEEVpermeabilidadAireClase] SMALLINT,
  [CEEEVtransmitanciaMarco] REAL,
  [CEEEVtransmitanciaTermica] REAL,
  [CEEEVtransmitanciaVidrio] REAL,
  [ToldoAltura] REAL,
  [ToldoGradosInclinacion] REAL,
  [ToldoCofreSN] BOOLEAN NOT NULL,
  [ToldoTipoAccionamiento] NVARCHAR(3),
  [ToldoPosicionAccionamiento] NVARCHAR(30),
  [ToldoFaldilla] NVARCHAR(40),
  [ToldoFaldillaMedida] SMALLINT,
  [ToldoRibeteSN] BOOLEAN NOT NULL,
  [ToldoCofre] NVARCHAR(15),
  [ToldoCofreAcabado] NVARCHAR(10),
  [ToldoCofreTonalidad] NVARCHAR(10),
  [ToldoAccionamiento] NVARCHAR(15),
  [ToldoAccionamientoAcabado] NVARCHAR(10),
  [ToldoAccionamientoTonalidad] NVARCHAR(10),
  [ToldoLona] NVARCHAR(15),
  [ToldoLonaAcabado] NVARCHAR(10),
  [ToldoLonaTonalidad] NVARCHAR(10),
  [ToldoMotor] NVARCHAR(15),
  [ToldoMando] NVARCHAR(15),
  [ToldoAutomatismo] NVARCHAR(15),
  [ToldoRibete] NVARCHAR(15),
  [ToldoRibeteAcabado] NVARCHAR(10),
  [ToldoBarraCarga] NVARCHAR(15),
  [ToldoSoporte] NVARCHAR(15),
  [ToldoEje] NVARCHAR(15),
  [AplicarWTarifa] BOOLEAN NOT NULL,
  [CodigoWTarifa] NVARCHAR(5),
  [DescripcionAdicional] NVARCHAR,
  [ToldoColocacionSoporteOpcion] SMALLINT,
  [ToldoColocacionMaquinaSimbolo] NVARCHAR(1),
  [ToldoBrazoCruceSN] BOOLEAN NOT NULL,
  [ToldoBrazosAdicionales] SMALLINT,
  [ToldoLonaDobleCaidaSN] BOOLEAN NOT NULL,
  [ToldoColocacionSoporte] NVARCHAR(1),
  [ToldoColocacionMaquina] NVARCHAR(1),
  [CodigoTipoColocacion] NVARCHAR(3),
  [Tarifa] NVARCHAR(5),
  [AcabadoAccesorios] NVARCHAR(10),
  [PersianaCajon] NVARCHAR(15),
  [PersianaLama] NVARCHAR(15),
  [PersianaCajonAcabado] NVARCHAR(10),
  [PersianaCajonTonalidad] NVARCHAR(10),
  [PersianaLamaAcabado] NVARCHAR(10),
  [PersianaLamaTonalidad] NVARCHAR(10),
  [PersianaAccionamiento] NVARCHAR(15),
  [PersianaAccionamientoAcabado] NVARCHAR(10),
  [PersianaAccionamientoTonalidad] NVARCHAR(10),
  [PersianaPosicionAccionamiento] NVARCHAR(4),
  [PersianaSalidaAccionamiento] NVARCHAR(1),
  [PersianaGuiaIzda] NVARCHAR(15),
  [PersianaGuiaDcha] NVARCHAR(15),
  [PersianaGuiaAcabado] NVARCHAR(10),
  [PersianaGuiaTonalidad] NVARCHAR(10),
  [PersianaGuiaCajeadaSN] BOOLEAN NOT NULL,
  [PersianaGuiaCajeadaPosicion] REAL,
  [PersianaDivididoGuiaCentralSN] BOOLEAN NOT NULL,
  [PersianaDivididoMedidaPañoIzdo] REAL,
  [PersianaEje] NVARCHAR(15),
  [PersianaTerminal] NVARCHAR(15),
  [PersianaTerminalAcabado] NVARCHAR(10),
  [PersianaTerminalTonalidad] NVARCHAR(10),
  [PersianaConMotorSN] BOOLEAN NOT NULL,
  [PersianaMotorUnicoSN] BOOLEAN NOT NULL,
  [PersianaMotorPaño1] NVARCHAR(15),
  [PersianaMotorMandoPaño1] NVARCHAR(15),
  [PersianaMotorPaño2] NVARCHAR(15),
  [PersianaMotorMandoPaño2] NVARCHAR(15),
  [PersianaMotorMandoCantidad] SMALLINT,
  [PersianaAnguloCajonSN] BOOLEAN NOT NULL,
  [PersianaAnguloAcabado] NVARCHAR(10),
  [PersianaAnguloTonalidad] NVARCHAR(10),
  [PersianaTesteroNumeroOpcion] SMALLINT,
  [PersianaCerrojillosSN] BOOLEAN NOT NULL,
  [PersianaLamasTaponesSN] BOOLEAN NOT NULL,
  [PersianaLamasGrapadoSN] BOOLEAN NOT NULL,
  [IdLineaGrupo] GUID,
  [GrupoSN] BOOLEAN NOT NULL,
  [DescuentoManualSN] BOOLEAN NOT NULL,
  [ToldoHiloAcabado] NVARCHAR(10),
  [ToldoLonaCosidaSoldada] NVARCHAR(1),
  [PersianaSinTopesSN] BOOLEAN NOT NULL,
  [PersianaLamasCiegasCantidad] SMALLINT,
  [PersianaEjeBloqueadoSN] BOOLEAN NOT NULL,
  [Descuento2Porc] REAL,
  [Descuento2PorcCoste] REAL,
  PRIMARY KEY ([IdLinea])
);

-- ===== WDocumentosLineasDetalle  (filas: 0) =====
CREATE TABLE [WDocumentosLineasDetalle] (
  [Descripcion] NVARCHAR,
  [IdLineaDetalle] GUID NOT NULL,
  [IdDocumento] GUID NOT NULL,
  [IdLineaPrincipal] GUID NOT NULL,
  [AcaTonalidad] NVARCHAR(10),
  [Cantidad] REAL,
  [Largo] REAL,
  [Ancho] REAL,
  [TipoMetraje] NVARCHAR(3),
  [Metraje] REAL,
  [Precio] REAL,
  [DescuentoPorc] REAL,
  [Descuento] REAL,
  [ImporteTotal] REAL,
  [Articulo] NVARCHAR(60),
  [Acabado] NVARCHAR(10),
  [Descuento2Porc] REAL,
  PRIMARY KEY ([IdLineaDetalle])
);

-- ===== WDocumentosTiposImagenes  (filas: 0) =====
CREATE TABLE [WDocumentosTiposImagenes] (
  [Descripcion] NVARCHAR(40) NOT NULL,
  PRIMARY KEY ([Descripcion])
);

-- ===== WebServiceRegistroSincronizacion  (filas: 0) =====
CREATE TABLE [WebServiceRegistroSincronizacion] (
  [nLinea] INTEGER NOT NULL,
  [TipoDocumento] NVARCHAR(20),
  [NumeroDocumento] NVARCHAR(40),
  [Fecha] DATE,
  [IdDispositivo] NVARCHAR(40),
  [Accion] NVARCHAR(20),
  [Mensaje] NVARCHAR,
  PRIMARY KEY ([nLinea])
);

-- ===== WIncidencias  (filas: 0) =====
CREATE TABLE [WIncidencias] (
  [Fecha] DATE,
  [IdWIncidencia] GUID NOT NULL,
  [TipoDoc] NVARCHAR(6),
  [nDoc] INTEGER,
  [NumeroDoc] NVARCHAR(20),
  [TipoIncidencia] NVARCHAR(3),
  [Titulo] NVARCHAR(80),
  [Descripcion] NVARCHAR,
  PRIMARY KEY ([IdWIncidencia])
);

-- ===== WIncidenciasImagenes  (filas: 0) =====
CREATE TABLE [WIncidenciasImagenes] (
  [Titulo] NVARCHAR(80),
  [IdImagen] GUID NOT NULL,
  [IdWIncidencia] GUID,
  [Descripcion] NVARCHAR,
  [NombreBlob] NVARCHAR(40),
  [UrlImagen] NVARCHAR(255),
  PRIMARY KEY ([IdImagen])
);

-- ===== WLiquidacionesCobro  (filas: 0) =====
CREATE TABLE [WLiquidacionesCobro] (
  [NumeroLiquidacion] NVARCHAR(10) NOT NULL,
  [Fecha] DATE,
  [Observaciones] NVARCHAR,
  [NumeroDocumentoCobro] NVARCHAR(20),
  [VencimientoDocumentoCobro] DATE,
  [CerradaSN] BOOLEAN NOT NULL,
  [CerradaFecha] DATE,
  [CerradaUsuario] NVARCHAR(30),
  [TipoRemesaCobro] NVARCHAR(5),
  [Cliente] NVARCHAR(10),
  [Representante] NVARCHAR(5),
  PRIMARY KEY ([NumeroLiquidacion])
);

-- ===== WLiquidacionesCobroLineas  (filas: 0) =====
CREATE TABLE [WLiquidacionesCobroLineas] (
  [Origen] NVARCHAR(10),
  [IdLinea] GUID NOT NULL,
  [ImporteCobrado] REAL,
  [NumeroLiquidacion] NVARCHAR(10) NOT NULL,
  [ContadorEfecto] INTEGER,
  [IdAlbaran] INTEGER,
  PRIMARY KEY ([IdLinea])
);

-- ===== WMedidasDA  (filas: 0) =====
CREATE TABLE [WMedidasDA] (
  [Medida] REAL,
  [IdDocumento] GUID NOT NULL,
  [IdLinea] GUID NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [NumeroDimension] SMALLINT NOT NULL,
  PRIMARY KEY ([IdDocumento], [IdLinea], [Estructura], [NumeroDimension])
);

-- ===== WOpcionsSeleccionadas  (filas: 0) =====
CREATE TABLE [WOpcionsSeleccionadas] (
  [NumeroOpcionSeleccionada] SMALLINT,
  [IdDocumento] GUID NOT NULL,
  [IdLinea] GUID NOT NULL,
  [Estructura] NVARCHAR(14) NOT NULL,
  [NumeroGrupo] SMALLINT NOT NULL,
  [ValorEscalarSeleccionado] NVARCHAR(100),
  PRIMARY KEY ([IdDocumento], [IdLinea], [Estructura], [NumeroGrupo])
);

-- ===== WTarifaMargenFamArt  (filas: 0) =====
CREATE TABLE [WTarifaMargenFamArt] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(255) NOT NULL,
  [FamiliaArticulos] NVARCHAR(10) NOT NULL,
  [Margen] REAL,
  PRIMARY KEY ([Cliente], [Tarifa], [FamiliaArticulos])
);

-- ===== WTarifaMargenFamEstr  (filas: 0) =====
CREATE TABLE [WTarifaMargenFamEstr] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(255) NOT NULL,
  [FamiliaEstructuras] NVARCHAR(10) NOT NULL,
  [Margen] REAL,
  PRIMARY KEY ([Cliente], [Tarifa], [FamiliaEstructuras])
);

-- ===== WTarifas  (filas: 0) =====
CREATE TABLE [WTarifas] (
  [Cliente] NVARCHAR(10) NOT NULL,
  [Tarifa] NVARCHAR(255) NOT NULL,
  [Descripcion] NVARCHAR(80),
  [Activa] BOOLEAN NOT NULL,
  [MargenGeneral] REAL,
  [TipoMargen] NVARCHAR(20),
  PRIMARY KEY ([Cliente], [Tarifa])
);

-- ===== WVariables  (filas: 0) =====
CREATE TABLE [WVariables] (
  [Valor] REAL,
  [IdDocumento] GUID NOT NULL,
  [IdLinea] GUID NOT NULL,
  [SimboloVariable] NVARCHAR(5) NOT NULL,
  PRIMARY KEY ([IdDocumento], [IdLinea], [SimboloVariable])
);

-- ===== Zonas  (filas: 0) =====
CREATE TABLE [Zonas] (
  [Codigo] NVARCHAR(5) NOT NULL,
  [Descripcion] NVARCHAR(60),
  [PrecioDesplazamiento] REAL,
  PRIMARY KEY ([Codigo])
);

