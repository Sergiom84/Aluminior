-- T.71.1: identidad documental de presupuestos = (serie, numero, revision).
--
-- Reversión LOCAL del cambio de esquema (Postgres efímero únicamente; nunca
-- en remoto):
--   ALTER TABLE presupuestos DROP CONSTRAINT presupuestos_identidad_uq;
-- Esto quita la restricción, pero NO borra la fila `0019_fixed_ken_ellis` del
-- journal de Drizzle (`__drizzle_migrations`): el migrador seguiría creyendo
-- que 0019 está aplicada y no la repetiría. Para una reversión COMPLETA del
-- Postgres efímero (esquema + journal), recrear la base o el contenedor
-- (`docker compose -f packages/db/docker-compose.yml down -v && up -d`), no
-- editar la tabla de control a mano.
-- 0019 tampoco se puede desplegar de forma aislada si 0018 sigue pendiente
-- en ese entorno: el migrador aplica en orden y 0018 (`lineas_mano_obra`) va
-- antes en el journal.
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
