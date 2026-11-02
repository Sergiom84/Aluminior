CREATE TABLE IF NOT EXISTS "estructura_opciones_accesorio" (
	"estructura_codigo" text NOT NULL,
	"grupo" integer NOT NULL,
	"opcion" integer NOT NULL,
	"predeterminada" boolean NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	CONSTRAINT "estructura_opciones_accesorio_estructura_codigo_grupo_opcion_pk" PRIMARY KEY("estructura_codigo","grupo","opcion")
);
--> statement-breakpoint
ALTER TABLE "estructura_opciones_accesorio" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_opciones_accesorio" ADD CONSTRAINT "estructura_opciones_accesorio_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
