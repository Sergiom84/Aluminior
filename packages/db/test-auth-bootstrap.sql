-- Solo para el PostgreSQL efímero de pruebas.
-- Las migraciones de aplicación enlazan perfiles con auth.users, que en
-- producción lo administra Supabase Auth. Este stub permite aplicar el
-- esquema completo sin simular ni sustituir el servicio de autenticación.
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY
);

-- El test de carga de tarifas crea y destruye su propio esquema mínimo. Va en
-- otra base para poder ejecutar, en la misma batería, el smoke test de todas
-- las migraciones sin que ambos se interfieran.
CREATE DATABASE aluminior_etl_test;
