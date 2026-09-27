CREATE TABLE IF NOT EXISTS "conjunto_descuentos_corte" (
	"conjunto_codigo" text NOT NULL,
	"familia" text NOT NULL,
	"grupo_principal" text NOT NULL,
	"grupo" text NOT NULL,
	"tipo_hoja" text NOT NULL,
	"descuento_mm" numeric(16, 8) NOT NULL,
	CONSTRAINT "conjunto_descuentos_corte_conjunto_codigo_familia_grupo_principal_grupo_tipo_hoja_pk" PRIMARY KEY("conjunto_codigo","familia","grupo_principal","grupo","tipo_hoja")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estructura_referencias_corte" (
	"estructura_codigo" text NOT NULL,
	"linea_origen" integer NOT NULL,
	"id_pieza" integer NOT NULL,
	"id_referencia" integer,
	"formula" text,
	"formula_referencia" text,
	"grupo" text,
	"grupo_inicio" text,
	"grupo_fin" text,
	"tipo_hoja" integer,
	"perfil_adicional" integer,
	"grupo_adicional" text,
	CONSTRAINT "estructura_referencias_corte_estructura_codigo_linea_origen_pk" PRIMARY KEY("estructura_codigo","linea_origen")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_referencias_corte" ADD CONSTRAINT "estructura_referencias_corte_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
