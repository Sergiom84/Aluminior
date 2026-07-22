-- Perfiles de empleados (auth, modulo #1 - PLAN.md anexo T.61).
-- La identidad la gestiona Supabase Auth (esquema `auth`); aqui solo el `rol`.

CREATE TABLE IF NOT EXISTS "perfiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"rol" text DEFAULT 'empleado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- FK 1:1 con auth.users. drizzle-kit no gestiona el esquema `auth`, por eso
-- esta linea se anade a mano. ON DELETE CASCADE: si se borra el usuario en
-- Supabase Auth, su perfil se va con el.
DO $$ BEGIN
	ALTER TABLE "perfiles"
		ADD CONSTRAINT "perfiles_id_auth_users_fk"
		FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
