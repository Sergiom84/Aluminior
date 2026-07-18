CREATE TABLE IF NOT EXISTS "estructura_diseno_nodos" (
	"estructura_codigo" text NOT NULL,
	"id_item" integer NOT NULL,
	"tipo" integer NOT NULL,
	"contenido_en" integer,
	"id_travesano" integer,
	"posicion_hueco" integer,
	"tipo_travesano" text,
	"invisible" boolean DEFAULT false NOT NULL,
	CONSTRAINT "estructura_diseno_nodos_estructura_codigo_id_item_pk" PRIMARY KEY("estructura_codigo","id_item")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vidrio_descuentos_alojamiento" (
	"eje" text NOT NULL,
	"limite_1" text NOT NULL,
	"limite_2" text NOT NULL,
	"perfil_hoja" text DEFAULT '' NOT NULL,
	"delta_mm" numeric(8, 2) NOT NULL,
	"muestras" integer NOT NULL,
	"total_muestras" integer NOT NULL,
	CONSTRAINT "vidrio_descuentos_alojamiento_eje_limite_1_limite_2_perfil_hoja_pk" PRIMARY KEY("eje","limite_1","limite_2","perfil_hoja")
);
--> statement-breakpoint
ALTER TABLE "estructura_componentes" ADD COLUMN "id_item_disenyo" integer;--> statement-breakpoint
ALTER TABLE "estructura_componentes" ADD COLUMN "tipo_hoja_disenyo" integer;--> statement-breakpoint
ALTER TABLE "estructura_componentes" ADD COLUMN "id_hoja_disenyo" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_diseno_nodos" ADD CONSTRAINT "estructura_diseno_nodos_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nodos_diseno_estructura_idx" ON "estructura_diseno_nodos" USING btree ("estructura_codigo");