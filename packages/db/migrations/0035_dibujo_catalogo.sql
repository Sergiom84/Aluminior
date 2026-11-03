CREATE TABLE IF NOT EXISTS "dibujo_catalogo" (
	"nombre" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"bytes" integer NOT NULL,
	"contenido" bytea NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dibujo_catalogo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE dibujo_catalogo FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE dibujo_catalogo FROM authenticated';
  END IF;
END $$;
