ALTER TABLE "articulos_despiece" ADD COLUMN "precio_en_tabla" boolean;--> statement-breakpoint
ALTER TABLE "articulos_despiece" ADD COLUMN "politicas_precio_tabla" jsonb;--> statement-breakpoint
CREATE TABLE "articulos_precio_tabla_pvp" (
  "articulo_codigo" text NOT NULL,
  "acabado_codigo" text NOT NULL,
  "tarifa" integer NOT NULL,
  "ancho_mm" numeric(10, 3) NOT NULL,
  "largo_mm" numeric(10, 3) NOT NULL,
  "precio" numeric(12, 4) NOT NULL,
  "acabado_dependiente" boolean,
  CONSTRAINT "articulos_precio_tabla_pvp_articulo_codigo_acabado_codigo_tarifa_ancho_mm_largo_mm_pk"
    PRIMARY KEY("articulo_codigo", "acabado_codigo", "tarifa", "ancho_mm", "largo_mm")
);--> statement-breakpoint
ALTER TABLE "articulos_precio_tabla_pvp" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE "articulos_precio_tabla_pvp" FROM PUBLIC;--> statement-breakpoint
DO $$
DECLARE rol text;
BEGIN
  FOREACH rol IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rol) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.articulos_precio_tabla_pvp FROM %I', rol);
    END IF;
  END LOOP;
END $$;
