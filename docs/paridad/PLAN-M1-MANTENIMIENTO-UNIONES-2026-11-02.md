# M1 — Mantenimiento de uniones (Asistente de Configuración) — 02/11/2026

Estado: **implementado en rama** `feat/m1-mantenimiento-uniones` el 03/11/2026. Sin Supabase y sin repetir el contraste de la 0016. Registro de la tarea:
[roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md), fila M1. Entrada: [estado](../ESTADO-ACTUAL.md).

## Por qué

El operador (taller) necesita dar de alta y editar uniones sin programador:
código, descripción, perfil, grosor, tipo, mano de obra, series permitidas e
imagen. Hoy las uniones de Aluminior son una lista fija de 14 en el código
(`UNIONES_VISUALES`, [catalogo.ts](../../packages/core/src/estructuras/diseno/catalogo.ts)),
mientras que Productor tiene 52 en la 0016 y una pantalla para mantenerlas.

## Evidencia

**Manual CHM 5.1.2.13.6 «Uniones»** (Ficheros > Artículos > Asistente de
Configuración > [UNIONES]). Flujo: elegir «Crear una Unión nueva» o «Editar una
Unión existente» → código o [Buscar F5] → [Siguiente...] → ficha. Campos, en este orden:

| Campo | Significado (CHM) |
|---|---|
| Código | Código de la unión, «que se creará como estructura» |
| Descripción | La que ve el cliente en los documentos de venta |
| Cantidad | Cantidad de perfiles que forman la unión |
| Perfil Unión (×3) | Artículo del perfil o perfiles de la unión, con [Buscar F5] |
| Tornillo; Insertar X cada X mm; Mínimo | Tornillos sobre el largo del perfil |
| Grosor | Grosor que muestra la unión al insertarse en un cerramiento |
| L1 / L2 | Alto o grosor del perfil por la izquierda y la derecha (acoplar perfiles de distinto grosor) |
| Tipo de U. | 1 Recto, 2 Abatible-Corredera, 3 90º, 4 Regulable (Tubo), 5 Regulable (Macho-Hembra) |
| Mano Obra | Minutos adicionales de mano de obra |
| De Usuario | Creado por el usuario: las actualizaciones no lo sobrescriben (CHM 5.0.5) |
| Series específicas + [Editar Series] | Limita con qué series se puede usar; tabla de series, [Aceptar F9] |
| Imagen | Imagen pegada; botones [Pegar] y [ X ] |

El Asistente tiene 13 apartados (compactos, guías y cajas de persiana, vidrios,
tapajuntas, uniones, premarcos, bandejas, barrotes, ángulos, mosquiteras,
barandillas y mano de obra). Según el CHM, la configuración avanzada se hace
editando el artículo o la estructura. M1 cubre solo **Uniones**.

**Datos de la 0016** (`export_datos/EMP0016`, solo lectura):

- Una unión es una fila de `Estructuras` con `Familia = 103`, `AccesorioSN`,
  `AccFAncho = A`, `AccFAlto = L`, `UnionGrosor`, `UnionL1`, `UnionL2`,
  `UnionTipo`, `UsuarioSN` y `AsocASeriesSN`. Hay 52 (`GMU001`–`GMU041`,
  `PSU001`–`PSU009`, `PSU10`, `U`).
- Su receta está en `EstructurasArticulos`: un perfil por función `UNION1`,
  `UNION2`… con `FormulaLargo = L` y `Cantidad` = número de perfiles, más una
  fila `MO` cuya `Cantidad` son los minutos. Ejemplos: `GMU038` = `GM60X60`
  ×1 (L) + `MO` 0; `GMU008` = `GM610` + `GM611` + `MO` 10; `PSU006` =
  `PSESQCOM` + `MO` 10; `U` = `MO` 0. Ninguna de las 52 lleva tornillo.
- `UnionTipo` guardado va de 0 a 4. **Hipótesis** (deducida, sin observar):
  guardado = número del CHM − 1. Encaja con 0 = tubos y uniones de cercos
  (recto), 1 = `GMU012` reductor 40/60, 2 = esquineros fijos (90º),
  3 = esquineros regulables de tubo y 4 = regulables por pareja (`GMU017`
  2866M + 2867M, `PSU006`). Confirmar en Productor antes de mostrar el texto.
- Ya contrastado en Aluminior: `GMU038` de 400 mm se despieza como `GM60X60`
  de 400 + MO y vale **4,12 €** ([guía §3](GUIA-DISENADOR-PRODUCTOR.md)).

## Alcance de M1

1. **Datos.** Migración nueva (la siguiente libre tras `0033`) con una tabla
   1:1 de `estructuras` para los datos de unión (`grosor`, `l1`, `l2`, `tipo`,
   `mano_obra_minutos`, `series_especificas`, `de_usuario`, ruta de imagen) y
   una tabla de series permitidas. La receta se guarda como filas de
   `estructura_plantilla_catalogo` (perfiles `UNION1..3` con `L`, fila `MO`),
   igual que Productor, para que el motor la valore sin código nuevo.
2. **ETL.** Cargar los 52 desde `Estructuras.csv`
   (`packages/etl/src/importacion/`). **Requisito:** una recarga del catálogo
   (`reemplazarCatalogoDespiece`, `motor-catalogo/aplicar.ts`) no puede borrar
   ni modificar estructuras ni filas de plantilla con `de_usuario`. Hoy esas
   cargas hacen `DELETE` de la tabla entera: hay que excluirlas y probarlo.
3. **Core.** Sustituir el uso directo de `UNIONES_VISUALES` en core
   (`validar-configuracion-cerramiento.ts`, `uniones-cerramiento.ts`,
   `cerramiento.ts`) por un catálogo de uniones inyectado, sin E/S en core.
   `UNIONES_VISUALES` queda como dato de prueba o reserva. Los snapshots
   guardados deben seguir siendo válidos.
4. **Web.** Pantalla «Asistente de configuración → Uniones» dentro de Artículos
   (`packages/web/app/dashboard/articulos/`). Lista con búsqueda por código y
   descripción (F5), «Nueva» y «Editar», ficha con los campos en el orden del
   CHM, [Aceptar F9]. Servicio de aplicación y acción fina (parsear, autorizar,
   llamar al servicio, revalidar), como pide `AGENTS.md`. El editor de unión del
   configurador (`editor-union.tsx`, `lista-elementos.tsx`) lee el catálogo de
   la base y muestra la imagen en el escaparate de uniones.
5. **Imagen.** El 03/11/2026 Sergio pidió usar `EMP0016\DIBUJOS\ESTRUCTURAS`
   y subirlas a la base. No se copian al repositorio. Están en `dibujo_catalogo`
   (494 BMP de catálogo, 24.196.892 bytes, RLS activo). No se subieron
   `Articulos` ni `VPresupuestosLin`. En disco no hay dibujo de `GMU038`–`GMU041`,
   `PSU10` ni `U`. Una subida nueva del operador sigue yendo a
   `output/uniones-imagenes/`.

**Fuera de M1:** tornillos (ninguna unión los usa, y el motor no lee aún
`Intervalo`/`UnidadesMin` de la plantilla; mostrar el campo solo cuando se
implemente), los otros 12 apartados del Asistente, la edición de acabados y
cualquier cambio en Supabase.

## Criterios de aceptación

- La lista muestra las 52 uniones de la 0016 con grosor, L1, L2 y tipo.
- Crear «QA-U60» con perfil `GM60X60`, cantidad 1, grosor 60, MO 0 y usarla en
  2O + fijo 400 + 2O da la misma geometría (2800) y el mismo despiece y precio
  (4,12 € por unión) que `GMU038`.
- Editar el grosor de una unión de usuario cambia el reparto en el configurador.
  Los presupuestos ya guardados conservan su snapshot.
- Recargar el catálogo con `etl:catalogo-despiece:local` conserva las uniones
  `de_usuario` y su receta. Test de integración que lo demuestre.
- Una unión con «Series específicas» no se ofrece en una serie no incluida.
- Teclado: F5 busca, F9 acepta, foco visible; sin emojis ni microcopy explicativo.
- `npm run test`, `npm run typecheck`, `npm run check:architecture` y la
  regresión local `ALUMINIOR_CONTRASTE_LOCAL=1` en verde. El contraste de la
  0016 no cambia: 24 / 91 / 97 / 13.

## Reglas para quien lo implemente

- Rama propia `feat/m1-mantenimiento-uniones`, en su propio worktree o equipo.
  E2 se desarrolla en paralelo y toca la serie de las uniones en
  `valorar-cerramiento.ts` y `servicio-web.ts` del banco: M1 no modifica esos
  dos archivos.
- Migraciones solo en la base local (`aluminior_real_test`, puerto 55433)
  con el migrador de Drizzle. Nunca `drizzle-kit migrate`, que lee `.env`.
- Archivos pequeños y por responsabilidad. Tests junto al módulo.
- Al terminar: actualizar la fila M1 del roadmap, `docs/ESTADO-ACTUAL.md` y la
  [guía del diseñador](GUIA-DISENADOR-PRODUCTOR.md) §3, con fecha y evidencia.
  No crear documentos de relevo nuevos en la raíz.
