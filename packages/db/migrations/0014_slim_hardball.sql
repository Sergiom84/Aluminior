CREATE TABLE IF NOT EXISTS "tarifas" (
	"id" integer PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"proveedor" text,
	"fecha_vigencia" timestamp with time zone,
	"fecha_carga" timestamp with time zone DEFAULT now() NOT NULL,
	"activa" boolean DEFAULT true NOT NULL
);
