CREATE TABLE IF NOT EXISTS "junquillo_ajustes_fijo" (
	"serie_codigo" text PRIMARY KEY NOT NULL,
	"ajuste_largo_mm" numeric(8, 2) NOT NULL,
	"ajuste_ancho_mm" numeric(8, 2) NOT NULL,
	"muestras" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vidrio_galce_fijo" (
	"serie_codigo" text NOT NULL,
	"perfil_codigo" text NOT NULL,
	"delta_mm" numeric(8, 2) NOT NULL,
	"muestras" integer NOT NULL,
	CONSTRAINT "vidrio_galce_fijo_serie_codigo_perfil_codigo_pk" PRIMARY KEY("serie_codigo","perfil_codigo")
);
