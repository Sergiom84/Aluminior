CREATE TABLE IF NOT EXISTS "estructuras" (
	"codigo" text PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"familia" text,
	"observaciones" text,
	"es_accesorio" boolean DEFAULT false NOT NULL,
	"fabrica_stock" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estructuras_familia_idx" ON "estructuras" USING btree ("familia");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estructuras_descripcion_idx" ON "estructuras" USING btree ("descripcion");