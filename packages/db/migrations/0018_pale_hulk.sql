CREATE TABLE IF NOT EXISTS "lineas_mano_obra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linea_id" uuid NOT NULL,
	"concepto" text NOT NULL,
	"origen" text NOT NULL,
	"horas" numeric(6, 2),
	"minutos" numeric(10, 2) NOT NULL,
	"articulo_codigo" text NOT NULL,
	"articulo_descripcion" text NOT NULL,
	"unidad" text DEFAULT 'MINUTO' NOT NULL,
	"acabado_codigo" text,
	"tarifa" smallint NOT NULL,
	"precio_minuto" numeric(12, 4),
	"importe" numeric(14, 2),
	"coste_minuto" numeric(12, 4),
	"coste_total" numeric(14, 2),
	"valoracion_completa" boolean NOT NULL,
	"motivo_codigo" text,
	"motivo_coste_codigo" text,
	"evaluado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mano_obra_linea_concepto_uq" UNIQUE("linea_id","concepto"),
	CONSTRAINT "mano_obra_concepto_check" CHECK ("lineas_mano_obra"."concepto" IN ('FABRICACION_ADICIONAL', 'COLOCACION')),
	CONSTRAINT "mano_obra_origen_check" CHECK ("lineas_mano_obra"."origen" IN ('MANUAL')),
	CONSTRAINT "mano_obra_motivo_check" CHECK ("lineas_mano_obra"."motivo_codigo" IS NULL OR "lineas_mano_obra"."motivo_codigo" IN ('SIN_PVP', 'PVP_CERO', 'PVP_NEGATIVO', 'IMPORTE_FUERA_RANGO')),
	CONSTRAINT "mano_obra_motivo_coste_check" CHECK ("lineas_mano_obra"."motivo_coste_codigo" IS NULL OR "lineas_mano_obra"."motivo_coste_codigo" IN ('SIN_COSTE', 'COSTE_AMBIGUO', 'COSTE_NEGATIVO', 'COSTE_FUERA_RANGO')),
	CONSTRAINT "mano_obra_manual_horas_check" CHECK ("lineas_mano_obra"."origen" <> 'MANUAL' OR "lineas_mano_obra"."horas" IS NOT NULL),
	CONSTRAINT "mano_obra_horas_check" CHECK ("lineas_mano_obra"."horas" IS NULL OR "lineas_mano_obra"."horas" > 0),
	CONSTRAINT "mano_obra_minutos_check" CHECK ("lineas_mano_obra"."minutos" > 0),
	CONSTRAINT "mano_obra_conversion_check" CHECK ("lineas_mano_obra"."horas" IS NULL OR "lineas_mano_obra"."minutos" = ROUND("lineas_mano_obra"."horas" * 60, 2)),
	CONSTRAINT "mano_obra_precio_check" CHECK ("lineas_mano_obra"."precio_minuto" IS NULL OR "lineas_mano_obra"."precio_minuto" >= 0
        OR "lineas_mano_obra"."motivo_codigo" IS NOT DISTINCT FROM 'PVP_NEGATIVO'),
	CONSTRAINT "mano_obra_importe_check" CHECK ("lineas_mano_obra"."importe" IS NULL OR "lineas_mano_obra"."importe" >= 0),
	CONSTRAINT "mano_obra_coste_minuto_check" CHECK ("lineas_mano_obra"."coste_minuto" IS NULL OR "lineas_mano_obra"."coste_minuto" >= 0
        OR "lineas_mano_obra"."motivo_coste_codigo" IS NOT DISTINCT FROM 'COSTE_NEGATIVO'),
	CONSTRAINT "mano_obra_coste_total_check" CHECK ("lineas_mano_obra"."coste_total" IS NULL OR "lineas_mano_obra"."coste_total" >= 0),
	CONSTRAINT "mano_obra_venta_check" CHECK (
    ("lineas_mano_obra"."valoracion_completa" AND "lineas_mano_obra"."precio_minuto" IS NOT NULL AND "lineas_mano_obra"."precio_minuto" > 0
       AND "lineas_mano_obra"."importe" IS NOT NULL AND "lineas_mano_obra"."motivo_codigo" IS NULL)
    OR
    (NOT "lineas_mano_obra"."valoracion_completa" AND "lineas_mano_obra"."importe" IS NULL AND "lineas_mano_obra"."motivo_codigo" IS NOT NULL)),
	CONSTRAINT "mano_obra_sin_pvp_check" CHECK ("lineas_mano_obra"."motivo_codigo" <> 'SIN_PVP' OR "lineas_mano_obra"."precio_minuto" IS NULL),
	CONSTRAINT "mano_obra_pvp_cero_check" CHECK ("lineas_mano_obra"."motivo_codigo" <> 'PVP_CERO' OR "lineas_mano_obra"."precio_minuto" = 0),
	CONSTRAINT "mano_obra_fuera_rango_check" CHECK ("lineas_mano_obra"."motivo_codigo" <> 'IMPORTE_FUERA_RANGO'
        OR ("lineas_mano_obra"."precio_minuto" IS NOT NULL AND "lineas_mano_obra"."precio_minuto" > 0)),
	CONSTRAINT "mano_obra_pvp_negativo_check" CHECK ("lineas_mano_obra"."motivo_codigo" <> 'PVP_NEGATIVO'
        OR ("lineas_mano_obra"."precio_minuto" IS NOT NULL AND "lineas_mano_obra"."precio_minuto" < 0)),
	CONSTRAINT "mano_obra_coste_check" CHECK (
    ("lineas_mano_obra"."coste_total" IS NOT NULL AND "lineas_mano_obra"."coste_minuto" IS NOT NULL AND "lineas_mano_obra"."motivo_coste_codigo" IS NULL)
    OR
    ("lineas_mano_obra"."coste_total" IS NULL AND "lineas_mano_obra"."motivo_coste_codigo" IS NOT NULL)),
	CONSTRAINT "mano_obra_sin_coste_check" CHECK ("lineas_mano_obra"."motivo_coste_codigo" <> 'SIN_COSTE' OR "lineas_mano_obra"."coste_minuto" IS NULL),
	CONSTRAINT "mano_obra_coste_ambiguo_check" CHECK ("lineas_mano_obra"."motivo_coste_codigo" <> 'COSTE_AMBIGUO' OR "lineas_mano_obra"."coste_minuto" IS NULL),
	CONSTRAINT "mano_obra_coste_fuera_rango_check" CHECK ("lineas_mano_obra"."motivo_coste_codigo" <> 'COSTE_FUERA_RANGO'
        OR ("lineas_mano_obra"."coste_minuto" IS NOT NULL AND "lineas_mano_obra"."coste_minuto" > 0)),
	CONSTRAINT "mano_obra_coste_negativo_check" CHECK ("lineas_mano_obra"."motivo_coste_codigo" <> 'COSTE_NEGATIVO'
        OR ("lineas_mano_obra"."coste_minuto" IS NOT NULL AND "lineas_mano_obra"."coste_minuto" < 0))
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_mano_obra" ADD CONSTRAINT "lineas_mano_obra_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mano_obra_linea_idx" ON "lineas_mano_obra" USING btree ("linea_id");--> statement-breakpoint
ALTER TABLE "lineas_mano_obra" ENABLE ROW LEVEL SECURITY;