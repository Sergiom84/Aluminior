CREATE TABLE IF NOT EXISTS "herraje_conjuntos" (
	"serie_codigo" text NOT NULL,
	"estructura_codigo" text NOT NULL,
	"conjuntos" text NOT NULL,
	"muestras" integer NOT NULL,
	"total_muestras" integer NOT NULL,
	CONSTRAINT "herraje_conjuntos_serie_codigo_estructura_codigo_pk" PRIMARY KEY("serie_codigo","estructura_codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opciones_herraje" (
	"conjunto_codigo" text NOT NULL,
	"opcion_codigo" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"por_defecto" boolean DEFAULT false NOT NULL,
	"oculta" boolean DEFAULT false NOT NULL,
	"categoria" text,
	CONSTRAINT "opciones_herraje_conjunto_codigo_opcion_codigo_pk" PRIMARY KEY("conjunto_codigo","opcion_codigo")
);
