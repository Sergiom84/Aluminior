CREATE TABLE IF NOT EXISTS "junquillo_ajustes" (
	"serie_codigo" text PRIMARY KEY NOT NULL,
	"ajuste_largo_mm" numeric(8, 2) NOT NULL,
	"ajuste_ancho_mm" numeric(8, 2) NOT NULL,
	"muestras" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tacris_filas" (
	"tabla" text NOT NULL,
	"posicion" text DEFAULT '*' NOT NULL,
	"grosor" numeric(8, 2) NOT NULL,
	"junquillo" text,
	"junta_exterior" text,
	"junta_interior" text,
	CONSTRAINT "tacris_filas_tabla_posicion_grosor_pk" PRIMARY KEY("tabla","posicion","grosor")
);
--> statement-breakpoint
ALTER TABLE "estructura_componentes" ADD COLUMN "formula_ancho" text;--> statement-breakpoint
ALTER TABLE "estructura_componentes" ADD COLUMN "formula_ancho_corte" text;--> statement-breakpoint
ALTER TABLE "conjuntos" ADD COLUMN "tabla_hojas" text;--> statement-breakpoint
ALTER TABLE "conjuntos" ADD COLUMN "tabla_fijos" text;