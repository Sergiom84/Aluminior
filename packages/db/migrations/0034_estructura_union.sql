CREATE TABLE IF NOT EXISTS "estructura_union" (
	"estructura_codigo" text PRIMARY KEY NOT NULL,
	"grosor" numeric(10, 3) NOT NULL,
	"l1" numeric(10, 3) DEFAULT '0' NOT NULL,
	"l2" numeric(10, 3) DEFAULT '0' NOT NULL,
	"tipo" integer NOT NULL,
	"mano_obra_minutos" numeric(12, 4) DEFAULT '0' NOT NULL,
	"series_especificas" boolean DEFAULT false NOT NULL,
	"de_usuario" boolean DEFAULT false NOT NULL,
	"imagen" text
);
--> statement-breakpoint
ALTER TABLE "estructura_union" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_union" ADD CONSTRAINT "estructura_union_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estructura_union_series" (
	"estructura_codigo" text NOT NULL,
	"serie_codigo" text NOT NULL,
	CONSTRAINT "estructura_union_series_estructura_codigo_serie_codigo_pk" PRIMARY KEY("estructura_codigo","serie_codigo")
);
--> statement-breakpoint
ALTER TABLE "estructura_union_series" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_union_series" ADD CONSTRAINT "estructura_union_series_estructura_codigo_estructura_union_estructura_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructura_union"("estructura_codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
