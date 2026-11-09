CREATE TABLE "agenda_eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"dia" date NOT NULL,
	"hora_inicio" text NOT NULL,
	"hora_fin" text NOT NULL,
	"observaciones" text,
	"origen" text DEFAULT 'local' NOT NULL,
	"externo_id" text,
	"externo_calendario_id" text,
	"sincronizado_en" timestamp with time zone,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" text,
	CONSTRAINT "agenda_eventos_origen_check" CHECK ("agenda_eventos"."origen" in ('local', 'google')),
	CONSTRAINT "agenda_eventos_titulo_check" CHECK (char_length(btrim("agenda_eventos"."titulo")) between 1 and 200),
	CONSTRAINT "agenda_eventos_horas_check" CHECK ("agenda_eventos"."hora_inicio" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and "agenda_eventos"."hora_fin" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' and "agenda_eventos"."hora_fin" > "agenda_eventos"."hora_inicio"),
	CONSTRAINT "agenda_eventos_observaciones_check" CHECK ("agenda_eventos"."observaciones" is null or char_length("agenda_eventos"."observaciones") <= 4000)
);
--> statement-breakpoint
CREATE TABLE "agenda_notas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"texto" text NOT NULL,
	"observaciones" text,
	"urgencia" smallint DEFAULT 3 NOT NULL,
	"hecha" boolean DEFAULT false NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" text,
	CONSTRAINT "agenda_notas_urgencia_check" CHECK ("agenda_notas"."urgencia" between 1 and 5),
	CONSTRAINT "agenda_notas_texto_check" CHECK (char_length(btrim("agenda_notas"."texto")) between 1 and 4000),
	CONSTRAINT "agenda_notas_observaciones_check" CHECK ("agenda_notas"."observaciones" is null or char_length("agenda_notas"."observaciones") <= 4000)
);
--> statement-breakpoint
CREATE INDEX "agenda_eventos_dia_idx" ON "agenda_eventos" USING btree ("dia");--> statement-breakpoint
CREATE UNIQUE INDEX "agenda_eventos_externo_uq" ON "agenda_eventos" USING btree ("origen","externo_id") WHERE "agenda_eventos"."externo_id" is not null;--> statement-breakpoint
CREATE INDEX "agenda_notas_orden_idx" ON "agenda_notas" USING btree ("hecha","urgencia");--> statement-breakpoint
ALTER TABLE "agenda_eventos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agenda_notas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE agenda_eventos FROM anon';
    EXECUTE 'REVOKE ALL ON TABLE agenda_notas FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE agenda_eventos FROM authenticated';
    EXECUTE 'REVOKE ALL ON TABLE agenda_notas FROM authenticated';
  END IF;
END $$;