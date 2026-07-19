CREATE TABLE IF NOT EXISTS "hoja_rebajes" (
	"perfil_codigo" text NOT NULL,
	"eje" text NOT NULL,
	"formula" text NOT NULL,
	"serie_codigo" text NOT NULL,
	"rebaje_mm" numeric(8, 2) NOT NULL,
	"muestras" integer NOT NULL,
	"total_muestras" integer NOT NULL,
	CONSTRAINT "hoja_rebajes_perfil_codigo_eje_formula_serie_codigo_pk" PRIMARY KEY("perfil_codigo","eje","formula","serie_codigo")
);
