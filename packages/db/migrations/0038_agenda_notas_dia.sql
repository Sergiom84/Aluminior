ALTER TABLE "agenda_notas" ADD COLUMN "dia" date;--> statement-breakpoint
CREATE INDEX "agenda_notas_dia_idx" ON "agenda_notas" USING btree ("dia");