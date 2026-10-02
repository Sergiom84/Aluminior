CREATE TABLE IF NOT EXISTS "conjunto_descuentos_corte" (
	"conjunto_codigo" text NOT NULL,
	"familia" text NOT NULL,
	"grupo_principal" text NOT NULL,
	"grupo" text NOT NULL,
	"tipo_hoja" text NOT NULL,
	"descuento_mm" numeric(16, 8) NOT NULL,
	CONSTRAINT "conjunto_descuentos_corte_conjunto_codigo_familia_grupo_principal_grupo_tipo_hoja_pk" PRIMARY KEY("conjunto_codigo","familia","grupo_principal","grupo","tipo_hoja")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estructura_referencias_corte" (
	"estructura_codigo" text NOT NULL,
	"linea_origen" integer NOT NULL,
	"id_pieza" integer NOT NULL,
	"id_referencia" integer,
	"formula" text,
	"formula_referencia" text,
	"grupo" text,
	"grupo_inicio" text,
	"grupo_fin" text,
	"tipo_hoja" integer,
	"perfil_adicional" integer,
	"grupo_adicional" text,
	CONSTRAINT "estructura_referencias_corte_estructura_codigo_linea_origen_pk" PRIMARY KEY("estructura_codigo","linea_origen")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articulos_despiece" (
	"articulo_codigo" text PRIMARY KEY NOT NULL,
	"componente" text,
	"generico" boolean NOT NULL,
	"doble_acristalamiento" boolean NOT NULL,
	"grosor_acristalar" numeric(10, 3) NOT NULL,
	"incrementos_precio" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articulos_incrementos_precio" (
	"id" integer PRIMARY KEY NOT NULL,
	"articulo_codigo" text NOT NULL,
	"tipo" text NOT NULL,
	"desde" numeric(14, 4) NOT NULL,
	"hasta" numeric(14, 4) NOT NULL,
	"porcentaje" numeric(10, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conjunto_asociaciones" (
	"id" text PRIMARY KEY NOT NULL,
	"conjunto_codigo" text NOT NULL,
	"articulo" text NOT NULL,
	"cantidad" numeric(12, 4) NOT NULL,
	"acabado" text NOT NULL,
	"intervalo" numeric(12, 4) NOT NULL,
	"medida_min" numeric(12, 4) NOT NULL,
	"medida_max" numeric(12, 4) NOT NULL,
	"unidades_min" numeric(12, 4) NOT NULL,
	"unidades_max" numeric(12, 4) NOT NULL,
	"tipo_medida" text NOT NULL,
	"descuento" numeric(12, 4) NOT NULL,
	"formula_largo" text,
	"formula_ancho" text,
	"solo_una" boolean NOT NULL,
	"componente" text NOT NULL,
	"grupo" text NOT NULL,
	"grupo_asociacion" text,
	"modulos" text,
	"articulo_principal" text,
	"opcion" text,
	"formula_opcion" text,
	"apertura" integer NOT NULL,
	"mano" text,
	"posicion_trabajo" text,
	"asociado_a" text NOT NULL,
	"no_contrastado" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conjunto_parametros_despiece" (
	"conjunto_codigo" text PRIMARY KEY NOT NULL,
	"herrajes" jsonb NOT NULL,
	"mano_obra" jsonb NOT NULL,
	"grosor_maximo_simple" numeric(10, 3) NOT NULL,
	"grosor_maximo_doble" numeric(10, 3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conjunto_ranuras_vacias" (
	"conjunto_codigo" text NOT NULL,
	"componente" text NOT NULL,
	CONSTRAINT "conjunto_ranuras_vacias_conjunto_codigo_componente_pk" PRIMARY KEY("conjunto_codigo","componente")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estructura_plantilla_catalogo" (
	"estructura_codigo" text NOT NULL,
	"linea_origen" integer NOT NULL,
	"id_pieza" integer NOT NULL,
	"articulo" text NOT NULL,
	"componente" text,
	"funcion" text,
	"cantidad" numeric(12, 4) NOT NULL,
	"posicion_trabajo" text,
	"tipo_hoja" text,
	"mano" text,
	"hoja" integer DEFAULT 0 NOT NULL,
	"dis_vidrio" text,
	"referencia_largo" integer,
	"referencia_ancho" integer,
	"formula_largo" text,
	"formula_ancho" text,
	"formula_referencia_largo" text,
	"formula_referencia_ancho" text,
	"grupo" text,
	"grupo_izquierdo" text,
	"grupo_derecho" text,
	"grupo_superior" text,
	"grupo_inferior" text,
	"grupos_adicionales" text[] NOT NULL,
	"perfil_adicional" integer,
	CONSTRAINT "estructura_plantilla_catalogo_estructura_codigo_linea_origen_pk" PRIMARY KEY("estructura_codigo","linea_origen")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "grupos_asociacion" (
	"familia" text NOT NULL,
	"codigo" text NOT NULL,
	"componentes" text[] NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	CONSTRAINT "grupos_asociacion_familia_codigo_pk" PRIMARY KEY("familia","codigo")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mano_obra_conceptos" (
	"codigo" text PRIMARY KEY NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL,
	"minutos" numeric(12, 4) NOT NULL,
	"articulo" text NOT NULL,
	"modulo" text,
	"articulo_asociado" text,
	"componente_asociado" text,
	"grupo_asociado" text,
	"con_incrementos" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tipos_hoja_catalogo" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"descripcion" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_referencias_corte" ADD CONSTRAINT "estructura_referencias_corte_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estructura_plantilla_catalogo" ADD CONSTRAINT "estructura_plantilla_catalogo_estructura_codigo_estructuras_codigo_fk" FOREIGN KEY ("estructura_codigo") REFERENCES "public"."estructuras"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articulos_incrementos_precio_articulo_idx" ON "articulos_incrementos_precio" USING btree ("articulo_codigo");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conjunto_asociaciones_conjunto_idx" ON "conjunto_asociaciones" USING btree ("conjunto_codigo");