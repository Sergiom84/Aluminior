CREATE TABLE IF NOT EXISTS "vidrio_galce" (
	"serie_codigo" text NOT NULL,
	"perfil_codigo" text NOT NULL,
	"delta_mm" numeric(8, 2) NOT NULL,
	"muestras" integer NOT NULL,
	CONSTRAINT "vidrio_galce_serie_codigo_perfil_codigo_pk" PRIMARY KEY("serie_codigo","perfil_codigo")
);
