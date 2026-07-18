-- Esquema extraido de: InfoSeries.mdb (358 MB)
-- Tablas: 9  |  Con datos: 9

-- ===== Constantes  (filas: 1) =====
CREATE TABLE [Constantes] (
  [FechaUltimaActualizacion] DATE
);

-- ===== SerActuaciones  (filas: 2817) =====
CREATE TABLE [SerActuaciones] (
  [id] INTEGER,
  [numero] NVARCHAR(6),
  [fechaFin] DATE,
  [horaFin] NVARCHAR(5),
  [notasPublicas] NVARCHAR,
  [trabajador] NVARCHAR(5),
  [biblioteca] INTEGER,
  [versionImp] SMALLINT,
  [versionTar] SMALLINT,
  [versionDib] SMALLINT,
  [tipoTarea] NVARCHAR(15),
  [sqlsIni] NVARCHAR,
  [sqlsFin] NVARCHAR,
  [sqlsTextoIni] NVARCHAR,
  [sqlsTextoFin] NVARCHAR,
  [sqlsIniAutoSN] BOOLEAN NOT NULL,
  [sqlsFinAutoSN] BOOLEAN NOT NULL,
  PRIMARY KEY ([id])
);

-- ===== SerActuacionesEliminarDatos  (filas: 4) =====
CREATE TABLE [SerActuacionesEliminarDatos] (
  [id] INTEGER,
  [nDoc] INTEGER,
  [tabla] NVARCHAR(50),
  [condicion] NVARCHAR(255),
  [tituloPublico] NVARCHAR(50),
  [notasPublicas] NVARCHAR(255),
  PRIMARY KEY ([id])
);

-- ===== SerActuacionesLin  (filas: 21142) =====
CREATE TABLE [SerActuacionesLin] (
  [nLin] INTEGER,
  [nDoc] INTEGER,
  [modif] NVARCHAR(50),
  [descripcion] NVARCHAR,
  [fechaFin] DATE,
  [horaFin] NVARCHAR(5),
  [trabajador] NVARCHAR(5),
  PRIMARY KEY ([nLin])
);

-- ===== SerBibliotecas  (filas: 244) =====
CREATE TABLE [SerBibliotecas] (
  [codigo] SMALLINT,
  [codigoGaia] NVARCHAR(5),
  [version] NVARCHAR(5),
  [nombre] NVARCHAR(50),
  [tipoBiblioteca] NVARCHAR(40),
  [proveedor] NVARCHAR(50),
  [carpeta] NVARCHAR(50),
  [nombre_impexp] NVARCHAR(11),
  [impexDibujos] NVARCHAR(11),
  [letras_tarifa] NVARCHAR(3),
  [ruta_tarifa] NVARCHAR(10),
  [tarifaCB] NVARCHAR(10),
  [serie_pvc] NVARCHAR(2),
  [dibujos] BOOLEAN NOT NULL,
  [valorU] BOOLEAN NOT NULL,
  [bibDependiente1] NVARCHAR(3),
  [bibDependiente2] NVARCHAR(3),
  [impexIncompatibles] NVARCHAR(255),
  [publicaEnWeb] BOOLEAN NOT NULL,
  [herraje] BOOLEAN NOT NULL,
  [WebNombre] NVARCHAR(50),
  [WebDescripcion] NVARCHAR,
  [WebObservaciones] NVARCHAR,
  [WebDireccion] NVARCHAR(255),
  [WebTelefono] NVARCHAR(120),
  [WebWeb] NVARCHAR(255),
  [WebMail] NVARCHAR(255),
  [WebPais] NVARCHAR(3),
  [ProgramaDePrueba] BOOLEAN NOT NULL,
  [ProgramaDePruebaSufijoFichero] NVARCHAR(30),
  PRIMARY KEY ([codigo])
);

-- ===== SerSeries  (filas: 4104) =====
CREATE TABLE [SerSeries] (
  [id] SMALLINT,
  [proveedor] SMALLINT,
  [codigo] NVARCHAR(50),
  [descripcion] NVARCHAR(50),
  [tipo] NVARCHAR(30),
  [fechaAlta] DATE,
  [material] NVARCHAR(30),
  PRIMARY KEY ([id])
);

-- ===== SerSeriesCE  (filas: 982) =====
CREATE TABLE [SerSeriesCE] (
  [Id] INTEGER,
  [IdSerie] INTEGER,
  [CodigoCaracteristica] NVARCHAR(2),
  [DescripcionCaracteristica] NVARCHAR(80),
  [Valor] NVARCHAR(30),
  PRIMARY KEY ([Id])
);

-- ===== SerTextosClientes  (filas: 23) =====
CREATE TABLE [SerTextosClientes] (
  [nLin] INTEGER,
  [cliente] NVARCHAR(5) NOT NULL,
  [biblioteca] SMALLINT NOT NULL,
  [textoImpex] NVARCHAR,
  [textoTarifas] NVARCHAR,
  [sqlsIni] NVARCHAR,
  [sqlsFin] NVARCHAR,
  [sqlsTextoIni] NVARCHAR,
  [sqlsTextoFin] NVARCHAR,
  PRIMARY KEY ([nLin])
);

-- ===== SerTiposBibliotecas  (filas: 4) =====
CREATE TABLE [SerTiposBibliotecas] (
  [TipoBiblioteca] NVARCHAR(40) NOT NULL,
  PRIMARY KEY ([TipoBiblioteca])
);

