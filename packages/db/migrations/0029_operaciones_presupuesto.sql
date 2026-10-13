CREATE TABLE "operaciones_presupuesto" (
  "actor" text NOT NULL,
  "clave" uuid NOT NULL,
  "huella" text NOT NULL,
  "resultado" jsonb NOT NULL,
  "creada_en" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "operaciones_presupuesto_actor_clave_pk" PRIMARY KEY ("actor", "clave")
);
--> statement-breakpoint
ALTER TABLE "operaciones_presupuesto" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON TABLE "operaciones_presupuesto" FROM PUBLIC;
--> statement-breakpoint
DO $$
DECLARE rol text;
BEGIN
  FOREACH rol IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rol) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.operaciones_presupuesto FROM %I', rol);
    END IF;
  END LOOP;
END $$;
