ALTER TABLE "estructuras" ADD COLUMN "dis_ancho_mm" integer;--> statement-breakpoint
ALTER TABLE "estructuras" ADD COLUMN "dis_alto_mm" integer;--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "tipo_hoja" integer;--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "numero_hoja" integer;--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "tipo_cota" integer;--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "cota" numeric(12, 3);--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "equidistantes" integer;--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "tipo_marco" text;--> statement-breakpoint
ALTER TABLE "estructura_diseno_nodos" ADD COLUMN "tipo_curva" integer;