CREATE TABLE IF NOT EXISTS "estructura_parametros_despiece" (
	"estructura_codigo" text PRIMARY KEY NOT NULL,
	"tipo_perfil" text
);
--> statement-breakpoint
ALTER TABLE "estructura_parametros_despiece" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mano_obra_conceptos" ADD COLUMN "categoria" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_parametros_despiece" ADD CONSTRAINT "estructura_parametros_despiece_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- Mismo criterio que 0024: solo el servidor lee el catálogo del motor.
DO $$
DECLARE
  rol text;
BEGIN
  REVOKE ALL ON TABLE public.estructura_parametros_despiece FROM PUBLIC;
  FOREACH rol IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rol) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.estructura_parametros_despiece FROM %I', rol);
    END IF;
  END LOOP;
END $$;
