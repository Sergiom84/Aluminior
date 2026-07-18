ALTER TABLE "lineas" ALTER COLUMN "precio_unitario" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lineas" ALTER COLUMN "precio_unitario" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas" ALTER COLUMN "total" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lineas" ALTER COLUMN "total" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas" ADD COLUMN "valoracion_completa" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "lineas" ADD COLUMN "aviso_valoracion" text;