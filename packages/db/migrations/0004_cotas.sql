CREATE TABLE IF NOT EXISTS "estructura_cotas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estructura_codigo" text NOT NULL,
	"simbolo" text NOT NULL,
	"valor_por_defecto" numeric(10, 2),
	"nombre" text,
	"orientacion" text,
	"orden_travesano" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_cotas" ADD CONSTRAINT "estructura_cotas_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cotas_estructura_idx" ON "estructura_cotas" USING btree ("estructura_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cotas_simbolo_idx" ON "estructura_cotas" USING btree ("simbolo");