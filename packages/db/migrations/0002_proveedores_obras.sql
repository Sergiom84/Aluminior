CREATE TABLE IF NOT EXISTS "proveedores" (
	"codigo" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"nif" text,
	"contacto" text,
	"direccion" text,
	"cp" text,
	"poblacion" text,
	"provincia" text,
	"telefono" text,
	"email" text,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "numero" integer;--> statement-breakpoint
ALTER TABLE "obras" ADD COLUMN "observaciones" text;