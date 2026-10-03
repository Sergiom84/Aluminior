CREATE TABLE IF NOT EXISTS "presupuestos_gastos" (
	"presupuesto_id" uuid PRIMARY KEY NOT NULL,
	"comision_porc" numeric(6, 2) DEFAULT '0' NOT NULL,
	"sumar_comision" boolean DEFAULT false NOT NULL,
	CONSTRAINT "presupuestos_gastos_comision_check" CHECK ("presupuestos_gastos"."comision_porc" > -100 AND "presupuestos_gastos"."comision_porc" < 1000)
);
--> statement-breakpoint
ALTER TABLE "presupuestos_gastos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presupuestos_gastos" ADD CONSTRAINT "presupuestos_gastos_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- Mismo criterio que 0024 y 0026: solo el servidor lee y escribe la tabla.
DO $$
DECLARE
  rol text;
BEGIN
  REVOKE ALL ON TABLE public.presupuestos_gastos FROM PUBLIC;
  FOREACH rol IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = rol) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.presupuestos_gastos FROM %I', rol);
    END IF;
  END LOOP;
END $$;
