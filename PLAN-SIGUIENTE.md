# Plan siguiente: catálogo del editor de línea y escaparate completo

Preparado el 19/09/2026 al cerrar la sesión de reconocimiento de cerramientos.
Rama de trabajo: `feat/cerramientos-editor-linea` (commits `4066dc6` y
`bc2758a` sobre `ba1bc9c`). No está unida a `main`.

## Actualización de continuidad

El catálogo de fase 1 ya se cargó con autorización y se verificó en Supabase
y en la web. La fase 2 conserva 14 estructuras operativas y 46 candidatas
visuales aún sin activar. Ese avance quedó en el commit local `3bbe321`.
Las secciones de situación de partida siguientes describen el estado previo.
Para el orden actual delegado por el usuario, consultar
`PLAN-PARIDAD-OPERATIVA.md`; detalle de pruebas y carga en
`VERIFICACION-CODEX-2026-09-19.md`.

## 0. Cómo arrancar la conversación nueva

Pega esto como primer mensaje:

> Continúa Aluminior siguiendo `PLAN-SIGUIENTE.md`. Antes lee, por este orden:
> `CLAUDE.md`, `AGENTS.md`, `PLAN-SIGUIENTE.md`, `HANDOFF-GROK.md` (§7 y
> §7 bis), `RECON-CERRAMIENTOS.md` y `EVIDENCIA-EDITOR-LINEA.md`. Trabaja en
> la rama `feat/cerramientos-editor-linea`. Empieza por las fases 1 y 2 en
> paralelo con subagentes (/subagentes). Háblame en español y avísame antes
> de cualquier acción irreversible.

Reglas que no se negocian (vienen de sesiones anteriores):

- Productor: solo empresa **0017 PRUEBAS ALUMINIOR**. Nunca abrir, grabar ni
  borrar en la 0016 ni en otras. Las contraseñas las teclea Sergio.
- MDB: nunca abrir la activa. Para leer, **copiar** `EMP0017\aluminio.mdb` al
  scratchpad y leer la copia con PowerShell x86 + Jet 4.0 `Mode=Read` y
  `$ErrorActionPreference='Stop'`.
- Supabase es la base real. No grabar datos de prueba. Escrituras solo con
  autorización expresa, con prueba previa en base efímera (PGlite; aquí no
  hay Docker) y con verificación posterior.
- **No usar `npm run -w @aluminior/etl import`**: hace `TRUNCATE` de
  presupuestos, líneas y clientes.
- Un solo `next dev` en `packages/web` (puerto 3001, config `web-3001` o
  `web-3001-existente` de `.claude/launch.json`).
- Editar con Edit/Write, nunca con PowerShell Get-Content/Set-Content.
- Archivos pequeños y cohesivos; `acciones.ts` no crece.
- July no está instalado en este PC: las decisiones van a los `.md` del repo.

## 1. Situación de partida

- El editor de línea tiene pestañas Estructura / Opc.Herraje / Cargos Adic.
  (deshabilitada) / Acristalamiento.
- Migración **0021_editor_linea aplicada en Supabase**. Sus tablas y columnas
  están **vacías**:
  - `opciones_herraje.activa_solo_si`, `incompatible`, `descripcion_auto`
  - `opciones_herraje_categorias`
  - `conjunto_acristalamientos`, `tablas_acristalamiento`
  - `lineas_estructura.opcion_acristalamiento`, `lineas_cargos`
- Mapeos de carga ya escritos, sin conectar:
  `packages/etl/src/propuestas/editor-linea.ts`.
- CSV de origen: `export_datos/EMP0016/` (exportación de la 0016 del 18/07,
  no versionada; ruta en `RUTA_CSV_ORIGEN` del `.env`).
- `herraje_conjuntos` tiene solo **22 reglas** (medidas del histórico con
  ≥3 muestras). Por eso GMA65OPT + estructura `2` sale sin herraje.
- El escaparate sale de **14 plantillas escritas a mano** en
  `packages/core/src/estructuras/diseno.ts`. El catálogo real tiene **541
  estructuras** y su dibujo en `EstructurasDiseño.csv`.

Uso real en la 0016 (2.069 líneas de estructura), familias de ventana/puerta:

| Familia | Código | Líneas | Hoy en Aluminior |
|---|---|---|---|
| Oscilobatientes | 020 | 638 | 3 de 42 (`1OD`, `1OI`, `2O`) |
| Fijos abatibles | 005 | 250 | 4 de 8 |
| Ventanas correderas 90º | 001 | 131 | 0 |
| Correderas perimetrales 45º | 011 | 77 | 0 |
| Ventanas abatibles | 003 | 55 | parcial |
| Puertas balconeras | 004 | 41 | 0 |
| Osciloparalelas / puertas correderas / elevables | 014 / 002 / 012 | 12 / 12 / 5 | 0 |

## 2. Fases

Las fases 1 y 2 son independientes y pueden ir en paralelo. La 3 necesita
Productor abierto en la 0017 y a Sergio presente. La 4 depende de Javi.

### Fase 1. Cargar el catálogo del editor de línea (corta)

**Objetivo.** Llenar las tablas de la 0021 sin tocar documentos ni clientes.

**Pasos.**

1. Crear `packages/etl/src/cargar-editor-linea.ts` (cargador acotado,
   estilo `cargar-tarifa.ts`):
   - `opciones_herraje`: solo `UPDATE` de `activa_solo_si`, `incompatible`,
     `descripcion_auto` por (`conjunto_codigo`, `opcion_codigo`) desde
     `ConjuntosOpcionesHerraje.csv`. No borrar ni insertar opciones.
   - `opciones_herraje_categorias` ← `ConjuntosCatOH.csv`.
   - `conjunto_acristalamientos` ← `Conjuntos.csv` (`TablaHojas`,
     `TablaHojas2..5`, `TablaFijos`, `TablaFijos2..5`).
   - `tablas_acristalamiento` ← `TAcristalamiento.csv`.
   - Todo en una transacción; las tablas nuevas se vacían y se recargan, las
     existentes solo se actualizan. Informe de leídas / cargadas /
     descartadas con motivo, como `importar.ts`.
   - Guarda de destino: rechazar cualquier URL que no sea Supabase o el
     Postgres efímero declarado.
2. Tests del cargador contra PGlite (instalar `@electric-sql/pglite` en el
   scratchpad o como devDependency del paquete etl, a decidir y justificar).
3. Ejecutar primero en PGlite con la cadena completa de migraciones y los
   CSV reales; revisar recuentos.
4. **Pedir autorización a Sergio** y ejecutar en Supabase. Verificar con
   SELECT de solo lectura: recuentos por tabla y el caso GM252 opción 4
   (`CERRADURA`) incompatible con la 1 (`CREMONA + FALLEBA`).
5. Conectar la web:
   - `_lib/estructuras/herraje.ts` debe leer las fórmulas y pasarlas a
     `catalogoDe` en `pestana-herraje.tsx` (hoy fuerza `oculta: false` y sin
     fórmulas).
   - `acristalamiento-serie.ts` debe leer `conjunto_acristalamientos` y
     `tablas_acristalamiento`; guardar la opción elegida en
     `lineas_estructura.opcion_acristalamiento`.

**Criterios de aceptación.**

- En el navegador, GMA65OPT + `2O`: con `1` marcada, `4` sale bloqueada, y
  al revés (igual que Productor, `RECON-CERRAMIENTOS.md` §5).
- Acristalamiento muestra las 4 opciones GM69–GM72 con su nombre y la 5
  deshabilitada.
- Presupuestos, líneas y clientes con los mismos recuentos antes y después.
- Typecheck de core, db, etl y web; tests de core y del cargador verdes.

### Fase 2. Escaparate generado desde los datos

**Objetivo.** Que el escaparate ofrezca todas las estructuras que Aluminior
ya sabe dibujar y valorar, sin escribirlas a mano, y que oculte las demás.

**Pasos.**

1. Investigar (sin tocar código) `EstructurasDiseño.csv`: tipos de nodo
   (1 marco, 2 hueco, 3 hoja, 5 vidrio, 6 división; residuales 4, 9, 16, 19),
   `TipoHoja`, `TipoTrav`, `bInvisible`. Clasificar las 541 estructuras en:
   - **soportadas**: todos sus nodos están en el vocabulario ya implementado
     (`PARIDAD-PRODUCTOR.md`, "Vocabulario del diseñador");
   - **pendientes**: usan un tipo de nodo u hoja sin implementar (correderas,
     plegables, zócalos, mallorquinas...).
   Entregar la tabla por familia en un documento (`EVIDENCIA-ESCAPARATE.md`).
2. Generar en el ETL (o en core, como función pura sobre el árbol) la
   plantilla de dibujo de cada estructura soportada, en vez de
   `PLANTILLAS_DISENO` a mano. Mantener las 14 actuales como golden tests:
   la plantilla generada debe coincidir con la escrita a mano.
3. Cargar las plantillas generadas (tabla o JSON versionado, a decidir en la
   fase de investigación; sin datos de clientes).
4. `escaparate.ts`: categorías con `familias` reales (códigos 001–021 de
   `FamiliasEstr.csv`) y solo estructuras soportadas.
5. Validar valoración: para una muestra de estructuras nuevas de
   oscilobatientes y fijos, comparar el precio de Aluminior con líneas
   históricas equivalentes o con Productor en la 0017.

**Criterios de aceptación.**

- Oscilobatientes y Fijos muestran todas las estructuras soportadas (se
  espera la mayoría de las 42 y las 8).
- Ninguna estructura pendiente aparece como disponible.
- Los 14 golden tests pasan; el dibujo de cada estructura nueva se revisa en
  el navegador a escritorio y móvil.
- Documento con la lista de pendientes por familia y el motivo.

### Fase 3. Correderas (reconocimiento en vivo y después implementación)

**Objetivo.** Primera familia nueva: ventanas correderas 90º (`C2`, 131
líneas) y después perimetrales 45º (`PC2`, 77 líneas).

**Pasos.**

1. Sesión con Productor en la 0017 (mismo método que
   `RECON-CERRAMIENTOS.md`): presupuesto de prueba sin cliente con forma de
   pago `01 CONTADO`; línea `C2` con serie corredera real, 1500 x 1200.
   Capturar: dibujo, `Diseño V3` (tipo de hoja, solapes, carriles),
   `Det.Estructura` completo (perfiles, cortes, herraje, mano de obra,
   precio), `Opc.Herraje` y acristalamiento. Escribir `RECON-CORREDERAS.md`.
2. Leer de la copia de la MDB las reglas de la estructura `C2`
   (`EstructurasDiseño`, `EstructurasLineas`, conjuntos de la serie).
3. Implementar el tipo de hoja corredera en el dibujo y en el despiece
   (core, con tests contra el `Det.Estructura` observado: mismas piezas,
   mismas medidas de corte, mismo precio).
4. Activar `C2` y las correderas que queden soportadas en el escaparate.

**Criterios de aceptación.** Misma línea en Productor y en Aluminior con el
mismo despiece y el mismo precio (diferencias explicadas por escrito).

Orden posterior sugerido por uso: balconeras (004), resto de correderas
(002, 012), osciloparalelas (014).

### Fase 4. Regla de la unión (cuando Javi conteste)

Evidencia en `PARIDAD-PRODUCTOR.md` → "Regla de medida de la unión":
con `GMU038` (60) cada módulo contiguo pierde 30 mm y la línea mide 2400;
sin artículo (20) la unión separa y mide 2420.

- Si Javi confirma: cambiar `medidasCerramiento` y la geometría en
  `packages/core/src/estructuras/cerramiento.ts` (grosor de separación frente
  a solape), con tests del caso observado, y revisar la valoración de módulos
  a medida de fabricación.
- Añadir el catálogo completo de uniones (GMU038–041, PSU001–009,
  `SIN UNION`) con grosor tomado del artículo y acabado propio de la unión.
- Si Javi no confirma o dice otra cosa: reconocer un segundo caso (tubo 40x40
  y H 100) en la 0017 antes de tocar nada.

### Fase 5. Cierre de rama

- Revisar los commits con Sergio y unir `feat/cerramientos-editor-linea` a
  `main` cuando lo apruebe.
- `env.example` está sin seguimiento y no es de Claude: preguntar a Sergio si
  se versiona (comprobar antes que no tenga valores reales).

## 3. Cómo repartir el trabajo

| Unidad | Quién | Toca | Depende de |
|---|---|---|---|
| Fase 1 (cargador + web) | Subagente A | `packages/etl`, `_lib/estructuras/herraje.ts`, `acristalamiento-serie.ts`, `editor-linea/` | Autorización de Sergio para Supabase |
| Fase 2 (investigación + generador) | Subagente B | `packages/core/src/estructuras/diseno*.ts`, `escaparate.ts`, nuevo documento | Nada |
| Fase 3 (correderas) | Sesión principal con Sergio | Productor 0017, después core | Fase 2 terminada |
| Fase 4 (unión) | Sesión principal | `cerramiento.ts` | Respuesta de Javi |

Los subagentes A y B no comparten archivos. El control de escritorio de
Productor lo hace siempre la sesión principal, no un subagente: las
aprobaciones de acceso no llegan bien desde segundo plano.

## 4. Verificación común al final de cada fase

- `npx vitest run` en `packages/core`; typecheck de core, db, etl y web.
- Tests de web sin el globalSetup de Postgres: config vitest temporal en el
  scratchpad, borrada al terminar.
- Comprobación en el navegador (3001) a escritorio y móvil, sin grabar.
- Revisión de `git status` y del diff: sin datos de clientes, sin secretos,
  sin cambios ajenos.
- Actualizar `HANDOFF-GROK.md` §7 bis con lo hecho y lo pendiente.
