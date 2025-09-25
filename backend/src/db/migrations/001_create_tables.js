/**
 * Migración inicial de la base de datos
 * Crea las tablas según el modelo de datos definido
 */

export const migration001CreateTables = {
  id: '001_create_tables',
  description: 'Crear tablas iniciales: Vivienda, ImagenesVivienda, Mensaje',
  sql: `
-- Tabla Vivienda
CREATE TABLE IF NOT EXISTS Vivienda (
  Id TEXT PRIMARY KEY,
  Name TEXT NOT NULL,
  ShortDescription TEXT,
  Description TEXT,
  Price INTEGER NOT NULL CHECK(Price >= 0),
  Rooms INTEGER DEFAULT 0,
  BathRooms INTEGER DEFAULT 0,
  Garage INTEGER DEFAULT 0,
  SquaredMeters INTEGER CHECK(SquaredMeters >= 0),
  Provincia TEXT,
  Poblacion TEXT,
  Calle TEXT,
  Numero TEXT,
  TipoInmueble TEXT,
  TipoVivienda TEXT,
  Estado TEXT,
  Planta TEXT,
  TipoAnuncio TEXT,
  EstadoVenta TEXT DEFAULT 'Disponible',
  Caracteristicas TEXT, -- JSON string
  Published INTEGER DEFAULT 0,
  FechaPublicacion TEXT,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla ImagenesVivienda
CREATE TABLE IF NOT EXISTS ImagenesVivienda (
  Id TEXT PRIMARY KEY,
  ViviendaId TEXT NOT NULL REFERENCES Vivienda(Id) ON DELETE CASCADE,
  URL TEXT NOT NULL,
  Orden INTEGER DEFAULT 0,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Mensaje
CREATE TABLE IF NOT EXISTS Mensaje (
  Id TEXT PRIMARY KEY,
  ViviendaId TEXT REFERENCES Vivienda(Id) ON DELETE SET NULL,
  Nombre TEXT NOT NULL,
  Email TEXT NOT NULL,
  Telefono TEXT,
  Asunto TEXT,
  Descripcion TEXT,
  Estado TEXT DEFAULT 'Nuevo',
  Pinned INTEGER DEFAULT 0,
  Fecha TEXT NOT NULL,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS IDX_Vivienda_Published ON Vivienda(Published);
CREATE INDEX IF NOT EXISTS IDX_Vivienda_Precio ON Vivienda(Price);
CREATE INDEX IF NOT EXISTS IDX_Vivienda_TipoAnuncio ON Vivienda(TipoAnuncio);
CREATE INDEX IF NOT EXISTS IDX_Vivienda_Poblacion ON Vivienda(Poblacion);
CREATE INDEX IF NOT EXISTS IDX_Vivienda_Rooms ON Vivienda(Rooms);
CREATE INDEX IF NOT EXISTS IDX_Vivienda_FechaPublicacion ON Vivienda(FechaPublicacion);

CREATE INDEX IF NOT EXISTS IDX_ImagenesVivienda_ViviendaId ON ImagenesVivienda(ViviendaId);
CREATE INDEX IF NOT EXISTS IDX_ImagenesVivienda_Orden ON ImagenesVivienda(ViviendaId, Orden);

CREATE INDEX IF NOT EXISTS IDX_Mensaje_ViviendaId ON Mensaje(ViviendaId);
CREATE INDEX IF NOT EXISTS IDX_Mensaje_Estado ON Mensaje(Estado);
CREATE INDEX IF NOT EXISTS IDX_Mensaje_Fecha ON Mensaje(Fecha);
  `
};