-- T.71.1: identidad documental de presupuestos = (serie, numero, revision).
--
-- Reversión local (Postgres efímero únicamente; nunca en remoto):
--   ALTER TABLE presupuestos DROP CONSTRAINT presupuestos_identidad_uq;
--
-- Preflight: aborta la migración si ya existen filas duplicadas en
-- (serie, numero, revision). No borra, fusiona ni renumera nada — sólo
-- informa y detiene, porque decidir cuál de las filas es la buena es una
-- decisión de negocio que no le corresponde a una migración.
DO $$
DECLARE
  duplicados integer;
BEGIN
  SELECT COUNT(*) INTO duplicados FROM (
    SELECT serie, numero, revision
    FROM presupuestos
    GROUP BY serie, numero, revision
    HAVING COUNT(*) > 1
  ) AS grupos;

  IF duplicados > 0 THEN
    RAISE EXCEPTION
      'T.71.1: % grupo(s) de (serie, numero, revision) duplicados en presupuestos. '
      'La migracion 0019 se detiene sin tocar filas: resuelve el duplicado a mano '
      'antes de reintentar.', duplicados;
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_identidad_uq" UNIQUE("serie","numero","revision");
