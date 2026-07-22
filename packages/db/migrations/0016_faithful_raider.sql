CREATE TABLE IF NOT EXISTS "lineas_pedido_compra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"articulo_codigo" text,
	"descripcion" text NOT NULL,
	"acabado_codigo" text,
	"cantidad" numeric(10, 2) DEFAULT '1' NOT NULL,
	"coste_unitario" numeric(12, 4),
	"importe" numeric(14, 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pedidos_compra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer NOT NULL,
	"fecha" date NOT NULL,
	"proveedor_codigo" text NOT NULL,
	"referencia" text,
	"estado" text DEFAULT 'BORRADOR' NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"coste_completo" boolean DEFAULT true NOT NULL,
	"observaciones" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_pedido_compra" ADD CONSTRAINT "lineas_pedido_compra_pedido_id_pedidos_compra_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos_compra"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_pedido_compra" ADD CONSTRAINT "lineas_pedido_compra_articulo_codigo_articulos_codigo_fk" FOREIGN KEY ("articulo_codigo") REFERENCES "public"."articulos"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_proveedor_codigo_proveedores_codigo_fk" FOREIGN KEY ("proveedor_codigo") REFERENCES "public"."proveedores"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lineas_pedido_compra_pedido_idx" ON "lineas_pedido_compra" USING btree ("pedido_id","orden");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pedidos_compra_numero_idx" ON "pedidos_compra" USING btree ("numero");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pedidos_compra_proveedor_idx" ON "pedidos_compra" USING btree ("proveedor_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pedidos_compra_fecha_idx" ON "pedidos_compra" USING btree ("fecha");