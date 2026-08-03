CREATE TABLE IF NOT EXISTS "lineas_cerramiento" (
	"linea_id" uuid PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"configuracion" jsonb NOT NULL,
	"serie_codigo" text,
	"vidrio_codigo" text,
	"acabado_codigo" text,
	"variante_acristalamiento" text DEFAULT '2' NOT NULL,
	"ajuste_fabricacion" numeric(12, 2) DEFAULT '0' NOT NULL,
	"ajuste_colocacion" numeric(12, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_cerramiento" ADD CONSTRAINT "lineas_cerramiento_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "lineas_cerramiento" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "lineas_cerramiento"
  ADD CONSTRAINT "lineas_cerramiento_version_check" CHECK ("version" >= 1),
  ADD CONSTRAINT "lineas_cerramiento_configuracion_check" CHECK (jsonb_typeof("configuracion") = 'object'),
  ADD CONSTRAINT "lineas_cerramiento_variante_check" CHECK ("variante_acristalamiento" IN ('1', '2')),
  ADD CONSTRAINT "lineas_cerramiento_ajustes_check" CHECK ("ajuste_fabricacion" >= 0 AND "ajuste_colocacion" >= 0);
