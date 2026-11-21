CREATE TABLE IF NOT EXISTS "preferencias_usuario" (
	"usuario_clave" text PRIMARY KEY NOT NULL,
	"precio_hora_colocacion" numeric(10, 2) DEFAULT '30.00' NOT NULL,
	"ajustes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "preferencias_usuario_precio_colocacion_check" CHECK ("preferencias_usuario"."precio_hora_colocacion" > 0)
);
--> statement-breakpoint
ALTER TABLE "preferencias_usuario" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE preferencias_usuario FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE preferencias_usuario FROM authenticated';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "metodo_pago" text;
--> statement-breakpoint
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "pagado_en" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "pagado_por" text;
--> statement-breakpoint
ALTER TABLE "presupuestos" ADD COLUMN IF NOT EXISTS "guardado_en" timestamp with time zone;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'presupuestos_metodo_pago_check'
  ) THEN
    ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_metodo_pago_check"
      CHECK ("presupuestos"."metodo_pago" IS NULL OR "presupuestos"."metodo_pago" IN ('METALICO', 'TRANSFERENCIA'));
  END IF;
END $$;
