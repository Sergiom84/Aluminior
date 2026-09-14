CREATE TABLE IF NOT EXISTS "lineas_cerramiento_resultados" (
	"linea_id" uuid PRIMARY KEY NOT NULL,
	"version" integer NOT NULL,
	"resultado" jsonb NOT NULL,
	CONSTRAINT "cerramiento_resultado_version_check" CHECK ("lineas_cerramiento_resultados"."version" = 1),
	CONSTRAINT "cerramiento_resultado_json_check" CHECK (
    jsonb_typeof("lineas_cerramiento_resultados"."resultado") = 'object'
    AND "lineas_cerramiento_resultados"."resultado" ? 'version'
    AND jsonb_typeof("lineas_cerramiento_resultados"."resultado"->'version') = 'number'
    AND ("lineas_cerramiento_resultados"."resultado"->>'version') IS NOT DISTINCT FROM "lineas_cerramiento_resultados"."version"::text)
);
--> statement-breakpoint
ALTER TABLE "lineas_despiece" ADD COLUMN "origen_tipo" text;--> statement-breakpoint
ALTER TABLE "lineas_despiece" ADD COLUMN "origen_id" text;--> statement-breakpoint
ALTER TABLE "lineas_despiece" ADD COLUMN "origen_ordinal" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_cerramiento_resultados" ADD CONSTRAINT "lineas_cerramiento_resultados_linea_id_lineas_cerramiento_linea_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas_cerramiento"("linea_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "lineas_despiece" ADD CONSTRAINT "despiece_origen_uq" UNIQUE("linea_id","origen_tipo","origen_id","origen_ordinal");--> statement-breakpoint
ALTER TABLE "lineas_despiece" ADD CONSTRAINT "despiece_origen_check" CHECK (
    ("lineas_despiece"."origen_tipo" IS NULL AND "lineas_despiece"."origen_id" IS NULL AND "lineas_despiece"."origen_ordinal" IS NULL)
    OR ("lineas_despiece"."origen_tipo" IS NOT NULL AND "lineas_despiece"."origen_id" IS NOT NULL AND "lineas_despiece"."origen_ordinal" IS NOT NULL
      AND "lineas_despiece"."origen_tipo" IN ('MODULO', 'UNION') AND length(trim("lineas_despiece"."origen_id")) > 0
      AND "lineas_despiece"."origen_ordinal" >= 0));
--> statement-breakpoint
ALTER TABLE lineas_cerramiento_resultados ENABLE ROW LEVEL SECURITY;
