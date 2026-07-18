CREATE TABLE IF NOT EXISTS "estructura_componentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estructura_codigo" text NOT NULL,
	"linea_origen" integer,
	"articulo_codigo" text NOT NULL,
	"cantidad" numeric(10, 3),
	"cantidad_corte" numeric(10, 3),
	"formula_largo" text,
	"formula_largo_corte" text,
	"formula_ref_largo" text,
	"tipo_corte" text,
	"angulo_izquierdo" numeric(8, 4),
	"angulo_derecho" numeric(8, 4),
	"posicion_trabajo" text,
	"funcion" text,
	"medida_minima" numeric(10, 2),
	"medida_maxima" numeric(10, 2),
	"grupo_disenyo" text,
	"componente_disenyo" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_componentes" ADD CONSTRAINT "estructura_componentes_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "componentes_estructura_idx" ON "estructura_componentes" USING btree ("estructura_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "componentes_articulo_idx" ON "estructura_componentes" USING btree ("articulo_codigo");