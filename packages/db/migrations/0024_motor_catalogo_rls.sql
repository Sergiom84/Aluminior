ALTER TABLE "conjunto_descuentos_corte" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "estructura_referencias_corte" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "articulos_despiece" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "articulos_incrementos_precio" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conjunto_asociaciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conjunto_parametros_despiece" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "conjunto_ranuras_vacias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "estructura_plantilla_catalogo" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "grupos_asociacion" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mano_obra_conceptos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tipos_hoja_catalogo" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- El catálogo se consume por el servidor mediante Postgres directo.
-- Los roles del navegador no deben leer, escribir ni truncar estas tablas.
-- Las bases efímeras locales no tienen los roles propios de Supabase.
DO $$
DECLARE
  tabla text;
  rol text;
BEGIN
  FOREACH tabla IN ARRAY ARRAY[
    'estructura_referencias_corte', 'conjunto_descuentos_corte', 'estructura_plantilla_catalogo',
    'conjunto_asociaciones', 'grupos_asociacion', 'tipos_hoja_catalogo', 'mano_obra_conceptos',
    'articulos_incrementos_precio', 'articulos_despiece', 'conjunto_ranuras_vacias', 'conjunto_parametros_despiece'
  ] LOOP
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', tabla);
    FOREACH rol IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rol) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', tabla, rol);
      END IF;
    END LOOP;
  END LOOP;
END $$;
