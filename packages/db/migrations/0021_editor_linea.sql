CREATE TABLE IF NOT EXISTS "conjunto_acristalamientos" (
	"conjunto_codigo" text NOT NULL,
	"opcion" smallint NOT NULL,
	"tabla_hojas" text,
	"tabla_fijos" text,
	CONSTRAINT "conjunto_acristalamientos_pk" PRIMARY KEY("conjunto_codigo","opcion"),
	CONSTRAINT "conjunto_acristalamientos_opcion_check" CHECK ("conjunto_acristalamientos"."opcion" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opciones_herraje_categorias" (
	"conjunto_codigo" text NOT NULL,
	"codigo" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"excluyentes" boolean DEFAULT false NOT NULL,
	CONSTRAINT "opciones_herraje_categorias_pk" PRIMARY KEY("conjunto_codigo","codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tablas_acristalamiento" (
	"codigo" text PRIMARY KEY NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lineas_cargos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linea_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"articulo_codigo" text NOT NULL,
	"descripcion" text,
	"acabado_codigo" text,
	"tonalidad_codigo" text,
	"cantidad" numeric(10, 3) DEFAULT '0' NOT NULL,
	"ancho_mm" numeric(10, 2),
	"largo_mm" numeric(10, 2),
	"tipo_metraje" text NOT NULL,
	"metraje" numeric(12, 3),
	"precio" numeric(12, 4),
	"total" numeric(14, 2),
	"respetar_precio" boolean DEFAULT false NOT NULL,
	"coste_manual" numeric(12, 4),
	"observaciones" text,
	CONSTRAINT "lineas_cargos_orden_uq" UNIQUE("linea_id","orden"),
	CONSTRAINT "lineas_cargos_cantidad_check" CHECK ("lineas_cargos"."cantidad" >= 0)
);
--> statement-breakpoint
ALTER TABLE "opciones_herraje" ADD COLUMN "activa_solo_si" text;--> statement-breakpoint
ALTER TABLE "opciones_herraje" ADD COLUMN "incompatible" text;--> statement-breakpoint
ALTER TABLE "opciones_herraje" ADD COLUMN "descripcion_auto" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas_estructura" ADD COLUMN "opcion_acristalamiento" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_cargos" ADD CONSTRAINT "lineas_cargos_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_cargos" ADD CONSTRAINT "lineas_cargos_articulo_codigo_articulos_codigo_fk" FOREIGN KEY ("articulo_codigo") REFERENCES "public"."articulos"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lineas_cargos_linea_idx" ON "lineas_cargos" USING btree ("linea_id");--> statement-breakpoint
ALTER TABLE "lineas_estructura" ADD CONSTRAINT "lineas_estructura_opcion_acris_check" CHECK ("lineas_estructura"."opcion_acristalamiento" BETWEEN 1 AND 5);--> statement-breakpoint
ALTER TABLE conjunto_acristalamientos ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE opciones_herraje_categorias ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE tablas_acristalamiento ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE lineas_cargos ENABLE ROW LEVEL SECURITY;
