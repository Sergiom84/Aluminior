CREATE TABLE IF NOT EXISTS "acabados" (
	"codigo" text PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"admite_tonalidad" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articulos" (
	"codigo" text PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"familia_codigo" text,
	"subfamilia_codigo" text,
	"tipo_metraje" text DEFAULT 'UD' NOT NULL,
	"metraje_minimo" numeric(10, 3),
	"metraje_multiplo_largo" numeric(10, 3),
	"metraje_multiplo_ancho" numeric(10, 3),
	"peso_ml" numeric(10, 3),
	"grosor_peso_vidrio" numeric(10, 2),
	"tam_junquillo_goma" text,
	"da_grosor" numeric(10, 2),
	"da_vidrio_1" text,
	"da_vidrio_2" text,
	"da_camara_1" text,
	"da_articulo_base" text,
	"aparece_en_hoja_despiece" boolean DEFAULT true NOT NULL,
	"aparece_en_hoja_corte" boolean DEFAULT true NOT NULL,
	"controla_stock" boolean DEFAULT false NOT NULL,
	"proveedor_habitual" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articulos_coste" (
	"articulo_codigo" text NOT NULL,
	"proveedor_codigo" text NOT NULL,
	"acabado_codigo" text NOT NULL,
	"coste" numeric(12, 4) NOT NULL,
	"actualizado_en" timestamp with time zone,
	CONSTRAINT "articulos_coste_articulo_codigo_proveedor_codigo_acabado_codigo_pk" PRIMARY KEY("articulo_codigo","proveedor_codigo","acabado_codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articulos_pvp" (
	"articulo_codigo" text NOT NULL,
	"acabado_codigo" text NOT NULL,
	"tarifa" integer NOT NULL,
	"precio" numeric(12, 4) NOT NULL,
	CONSTRAINT "articulos_pvp_articulo_codigo_acabado_codigo_tarifa_pk" PRIMARY KEY("articulo_codigo","acabado_codigo","tarifa")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "familias" (
	"codigo" text PRIMARY KEY NOT NULL,
	"descripcion" text NOT NULL,
	"grupo" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subfamilias" (
	"codigo" text PRIMARY KEY NOT NULL,
	"familia_codigo" text,
	"descripcion" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tonalidades" (
	"acabado_codigo" text NOT NULL,
	"codigo" text NOT NULL,
	"descripcion" text NOT NULL,
	CONSTRAINT "tonalidades_acabado_codigo_codigo_pk" PRIMARY KEY("acabado_codigo","codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clientes" (
	"codigo" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"nombre_comercial" text,
	"nif" text,
	"direccion" text,
	"cp" text,
	"poblacion" text,
	"provincia" text,
	"pais" text DEFAULT 'ES' NOT NULL,
	"persona_contacto" text,
	"telefono" text,
	"telefono_movil" text,
	"email" text,
	"tarifa" integer DEFAULT 1 NOT NULL,
	"tipo_iva" text,
	"descuento" numeric(5, 2),
	"descuento_factura" numeric(5, 2),
	"persona_fisica_juridica" text,
	"sii_tipo_id_fiscal" text,
	"fecha_alta" date,
	"activo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clientes_potenciales" (
	"codigo" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text,
	"email" text,
	"poblacion" text,
	"observaciones" text,
	"fecha_alta" date,
	"convertido_a_cliente_codigo" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "obras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_codigo" text,
	"descripcion" text NOT NULL,
	"direccion" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "presupuestos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"serie" text DEFAULT 'A' NOT NULL,
	"fecha" date NOT NULL,
	"cliente_codigo" text,
	"potencial_codigo" text,
	"nombre_libre" text,
	"obra_id" uuid,
	"obra_texto" text,
	"referencia_interna" text,
	"nombre_version" text,
	"tarifa" integer DEFAULT 1 NOT NULL,
	"bloqueo_precios" boolean DEFAULT false NOT NULL,
	"estado" text DEFAULT 'PENDIENTE' NOT NULL,
	"subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"descuento" numeric(5, 2) DEFAULT '0' NOT NULL,
	"descuento_pp" numeric(5, 2) DEFAULT '0' NOT NULL,
	"base_imponible" numeric(14, 2) DEFAULT '0' NOT NULL,
	"tipo_iva" numeric(5, 2) DEFAULT '21' NOT NULL,
	"cuota_iva" numeric(14, 2) DEFAULT '0' NOT NULL,
	"recargo_equivalencia" numeric(5, 2),
	"retencion" numeric(5, 2),
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"divisa" text DEFAULT 'EUR' NOT NULL,
	"forma_pago" text,
	"observaciones" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"creado_por" text,
	CONSTRAINT "presupuestos_destinatario_check" CHECK ("presupuestos"."cliente_codigo" IS NOT NULL OR "presupuestos"."potencial_codigo" IS NOT NULL OR "presupuestos"."nombre_libre" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lineas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid NOT NULL,
	"orden" integer NOT NULL,
	"tipo" text NOT NULL,
	"articulo_codigo" text,
	"descripcion" text NOT NULL,
	"descripcion_manual" boolean DEFAULT false NOT NULL,
	"referencia" text,
	"cantidad" numeric(10, 2) DEFAULT '1' NOT NULL,
	"ancho_mm" integer,
	"alto_mm" integer,
	"medida_es_hueco" boolean DEFAULT false NOT NULL,
	"precio_unitario" numeric(12, 4) DEFAULT '0' NOT NULL,
	"descuento" numeric(5, 2) DEFAULT '0' NOT NULL,
	"descuento_2" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"pvp_manual" boolean DEFAULT false NOT NULL,
	"coste_manual" numeric(12, 4)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lineas_acristalamiento" (
	"linea_id" uuid NOT NULL,
	"slot" integer NOT NULL,
	"vidrio_hojas" text,
	"vidrio_fijos" text,
	CONSTRAINT "lineas_acristalamiento_linea_id_slot_pk" PRIMARY KEY("linea_id","slot")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lineas_despiece" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"linea_id" uuid NOT NULL,
	"articulo_codigo" text NOT NULL,
	"acabado_codigo" text,
	"cantidad" numeric(10, 3) NOT NULL,
	"largo_corte_mm" numeric(10, 2),
	"ancho_corte_mm" numeric(10, 2),
	"angulo_izquierdo" numeric(6, 2),
	"angulo_derecho" numeric(6, 2),
	"funcion" text,
	"posicion_trabajo" text,
	"coste_unitario" numeric(12, 4),
	"coste_total" numeric(12, 4)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lineas_estructura" (
	"linea_id" uuid PRIMARY KEY NOT NULL,
	"serie_codigo" text NOT NULL,
	"estructura_codigo" text NOT NULL,
	"acabado_codigo" text,
	"tonalidad_codigo" text,
	"accesorios_acabado" text,
	"accesorios_tonalidad" text,
	"madera_codigo" text,
	"compacto" text,
	"guia_izquierda" text,
	"guia_derecha" text,
	"tapajuntas" text,
	"registro" text,
	"premarco" text,
	"condensacion" text,
	"altura_mm" integer,
	"horas_fabricacion" numeric(8, 2) DEFAULT '0' NOT NULL,
	"horas_colocacion" numeric(8, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lineas_opciones_herraje" (
	"linea_id" uuid NOT NULL,
	"categoria" text NOT NULL,
	"opcion_codigo" text NOT NULL,
	"descripcion" text,
	CONSTRAINT "lineas_opciones_herraje_linea_id_categoria_opcion_codigo_pk" PRIMARY KEY("linea_id","categoria","opcion_codigo")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articulos" ADD CONSTRAINT "articulos_familia_codigo_familias_codigo_fk" FOREIGN KEY ("familia_codigo") REFERENCES "public"."familias"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articulos_coste" ADD CONSTRAINT "articulos_coste_articulo_codigo_articulos_codigo_fk" FOREIGN KEY ("articulo_codigo") REFERENCES "public"."articulos"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articulos_pvp" ADD CONSTRAINT "articulos_pvp_articulo_codigo_articulos_codigo_fk" FOREIGN KEY ("articulo_codigo") REFERENCES "public"."articulos"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subfamilias" ADD CONSTRAINT "subfamilias_familia_codigo_familias_codigo_fk" FOREIGN KEY ("familia_codigo") REFERENCES "public"."familias"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tonalidades" ADD CONSTRAINT "tonalidades_acabado_codigo_acabados_codigo_fk" FOREIGN KEY ("acabado_codigo") REFERENCES "public"."acabados"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clientes_potenciales" ADD CONSTRAINT "clientes_potenciales_convertido_a_cliente_codigo_clientes_codigo_fk" FOREIGN KEY ("convertido_a_cliente_codigo") REFERENCES "public"."clientes"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "obras" ADD CONSTRAINT "obras_cliente_codigo_clientes_codigo_fk" FOREIGN KEY ("cliente_codigo") REFERENCES "public"."clientes"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_cliente_codigo_clientes_codigo_fk" FOREIGN KEY ("cliente_codigo") REFERENCES "public"."clientes"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_potencial_codigo_clientes_potenciales_codigo_fk" FOREIGN KEY ("potencial_codigo") REFERENCES "public"."clientes_potenciales"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas" ADD CONSTRAINT "lineas_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas" ADD CONSTRAINT "lineas_articulo_codigo_articulos_codigo_fk" FOREIGN KEY ("articulo_codigo") REFERENCES "public"."articulos"("codigo") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_acristalamiento" ADD CONSTRAINT "lineas_acristalamiento_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_despiece" ADD CONSTRAINT "lineas_despiece_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_estructura" ADD CONSTRAINT "lineas_estructura_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lineas_opciones_herraje" ADD CONSTRAINT "lineas_opciones_herraje_linea_id_lineas_id_fk" FOREIGN KEY ("linea_id") REFERENCES "public"."lineas"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articulos_familia_idx" ON "articulos" USING btree ("familia_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articulos_descripcion_idx" ON "articulos" USING btree ("descripcion");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clientes_nombre_idx" ON "clientes" USING btree ("nombre");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clientes_nif_idx" ON "clientes" USING btree ("nif");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "obras_cliente_idx" ON "obras" USING btree ("cliente_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "presupuestos_numero_idx" ON "presupuestos" USING btree ("numero","revision");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "presupuestos_cliente_idx" ON "presupuestos" USING btree ("cliente_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "presupuestos_fecha_idx" ON "presupuestos" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lineas_presupuesto_idx" ON "lineas" USING btree ("presupuesto_id","orden");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lineas_tipo_idx" ON "lineas" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "despiece_linea_idx" ON "lineas_despiece" USING btree ("linea_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "despiece_articulo_idx" ON "lineas_despiece" USING btree ("articulo_codigo");