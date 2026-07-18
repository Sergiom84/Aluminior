CREATE TABLE IF NOT EXISTS "conjunto_delegaciones" (
	"conjunto_codigo" text NOT NULL,
	"delegado_codigo" text NOT NULL,
	"campo" text NOT NULL,
	CONSTRAINT "conjunto_delegaciones_conjunto_codigo_delegado_codigo_campo_pk" PRIMARY KEY("conjunto_codigo","delegado_codigo","campo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conjunto_resoluciones" (
	"conjunto_codigo" text NOT NULL,
	"componente" text NOT NULL,
	"familia" text DEFAULT '' NOT NULL,
	"articulo_codigo" text NOT NULL,
	CONSTRAINT "conjunto_resoluciones_conjunto_codigo_componente_familia_pk" PRIMARY KEY("conjunto_codigo","componente","familia")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conjuntos" (
	"codigo" text PRIMARY KEY NOT NULL,
	"serie_codigo" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "series" (
	"codigo" text PRIMARY KEY NOT NULL,
	"es_pvc" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "delegaciones_conjunto_idx" ON "conjunto_delegaciones" USING btree ("conjunto_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resoluciones_conjunto_idx" ON "conjunto_resoluciones" USING btree ("conjunto_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "resoluciones_articulo_idx" ON "conjunto_resoluciones" USING btree ("articulo_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conjuntos_serie_idx" ON "conjuntos" USING btree ("serie_codigo");