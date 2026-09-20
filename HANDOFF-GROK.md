# Handoff Grok — 19 de septiembre de 2026

> Revisión documental 20/09/2026: **Relevo histórico**. Fotografía del 19/09, anterior al trabajo de fases 1 y 2 del 20/09.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

Punto de entrada de esta sesión. Léelo antes de tocar presupuestos o artículos.
Después: `AGENTS.md`, `PARIDAD-PRODUCTOR.md`, `RECON-DETALLE-PRESUPUESTO.md`
y `RECON-ARTICULOS.md`.

`HANDOFF-CHATGPT.md` sigue siendo el registro histórico profundo (T.69–T.72,
cerramientos, migraciones). Este archivo describe **lo que hay ahora en el
árbol** tras el trabajo de Grok + las capturas de Claude.

## 1. Contrato de esta sesión

- Destinatario: Javi (ALUMINIOS LARA SLU). Productor es la referencia de
  flujo, no el look de Windows XP.
- Decisión del titular: mismo flujo que Productor, aspecto moderno.
- Arranque: código local ahora; Supabase ya está conectado (solo lectura
  verificada). No se ha escrito en remoto desde esta sesión de Grok.
- No commitear `env` ni `.env`. La plantilla versionada es `.env.example`.

## 2. Qué se ha hecho en presupuestos (Grok)

Objetivo: que crear un presupuesto se reconozca al lado de Productor.

### Lista (`/dashboard/presupuestos`)

- Ventana de documento con pestañas inferiores **Lista / Ficha**.
- Barra: Nuevo, Buscar, y sobre la fila **seleccionada**: Editar, Emitir,
  Revisión.
- Clic selecciona. Enter abre la ficha. El doble clic **no** abre: Claude lo
  observó inactivo en Productor (`RECON-DETALLE-PRESUPUESTO.md`).
- Acciones por fila conservadas (Editar / Emitir / Copiar) para no operar
  sobre `filas[0]`.

### Ficha (`/dashboard/presupuestos/[id]`)

- Título `Presupuestos de Clientes. Detalle`.
- Barra: **Aceptar** (F9 / vuelve a lista; el guardado es por acción),
  Cerrar, Emitir.
- Cabecera visible: Nº+revisión, fecha, serie, tarifa, destinatario, obra.
- Rejilla alineada a la observación viva: Artículo, Descripción, Referencia,
  Acabado, Cdad., Ancho(mm), Alto(mm), Precio, Dto, Total, Dibujo.
- Una estructura de un solo módulo muestra su código (`2O`) como artículo.
  Varios módulos siguen saliendo como `GRUPO`.
- Miniatura SVG propia (no BMP de Gaia).
- Pestañas de ficha: **Presupuesto** activa; Datos Adicionales, Plazos y
  Gastos visibles y deshabilitadas.
- Pestañas Lista/Ficha debajo.

### Alta de línea (núcleo)

Flujo Productor: tipo → escaparate → editor. Tras Aceptar, el escaparate se
reabre.

- Radios **Estructuras / Artículos** y botón aparte **Cerramiento** (no tres
  radios; evidencia de Claude 18/09).
- **Escaparate**: categorías del vídeo Gaia a la izquierda; rejilla 4×3;
  paginación. Catálogo real solo en **Ventanas abatibles** y **Fijos**. El
  resto se lista vacío a propósito (no se finge soporte).
- **Editor de estructura**: código, perfiles (serie), vidrio, acabado,
  acristalamiento, cantidad, referencia (`V-1`), ancho/alto mm, dibujo en
  vivo, horas Fabr./Coloc., descripción generada.
- **Cerramiento**: primera estructura por escaparate, luego el diseñador de
  módulos + uniones ya existente.
- Acabado `L` se preselecciona si existe en el catálogo.

### Núcleo (`packages/core`)

- `estructuras/escaparate.ts` — categorías, paginación, filtro por familia.
- `estructuras/descripcion-linea.ts` — texto de previsualización al estilo
  del editor de Productor. La descripción persistida la sigue decidiendo el
  servidor.

### UI extraída (no inflar `acciones.ts`)

- `dibujo-estructura.tsx` — SVG compartido (escaparate, editor, miniatura).
- `escaparate.tsx`, `editor-linea.tsx`, `campos-alta.tsx`.
- `lista-presupuestos.tsx`, `pestanas-documento.tsx`.
- `disenador-estructura.tsx` ya no pinta el SVG: lo importa.

## 3. Qué ha hecho Claude en paralelo (artículos)

Hay ficha de artículo nueva, alineada a `RECON-ARTICULOS.md` (observación
en empresa **0017 PRUEBAS ALUMINIOR**, no en 0016):

- `packages/web/app/dashboard/articulos/_components/ficha/` — barra, cabecera,
  pestañas General / Coste / Prv.Habitual / Stock / Producción.
- `_lib/ficha/` — consulta, metraje, validación.
- Se eliminó el formulario plano `articulos/_components/formulario.tsx`.

Grok no ha revisado esa ficha línea a línea. Trátala como trabajo de Claude
y contrástala con `RECON-ARTICULOS.md`.

## 4. Evidencia nueva (Claude + visión)

| Archivo | Qué es |
|---|---|
| `RECON-DETALLE-PRESUPUESTO.md` | Ficha y edición de línea, 18/09, empresa 0016, solo consulta |
| `RECON-ARTICULOS.md` | Lista y detalle de artículos, 18/09, empresa 0017 |

Decisiones tomadas a partir de esas notas (no del vídeo de 2020 cuando chocan):

- Cerramiento es **botón**, no radio.
- Editar abre la ficha; el doble clic no.
- Columnas de líneas y código de estructura como artículo en línea simple.
- No reproducir el diálogo de Productor que exige grabar solo por abrir y
  cerrar la edición de línea.

Pendiente de observar (lo dice el propio recon): Mas Datos, diseñador de
cerramiento en Productor, Precio Final, Det.Estructura, Coste del
Presupuesto, atajos además de F9 / F3 / ENTER.

## 5. Base de datos (lectura 18/09)

Supabase UE, `DATABASE_URL` en `.env` de la raíz. Next carga ese `.env`
desde `packages/web/next.config.mjs`.

Recuento (no volcar filas de cliente):

- `articulos` 17.547 · `estructuras` 541 · `clientes` 504 · `series` 57
- `acabados` 18 · `presupuestos` 3 · `lineas` 1 · `lineas_cerramiento` 1
- `tarifas` 0 filas (sigue el hueco de tarifa 2026)

Grok no escribió en remoto. No crear presupuestos de prueba sobre datos
reales sin autorización explícita.

## 6. Cómo arrancar

```bash
cd C:\Users\laral\Documents\Aluminior
npm run dev:web
```

El 18/09 el puerto 3000 ya estaba ocupado; la instancia nueva quedó en
**http://localhost:3001**. Login: empleado de Supabase Auth (no hay registro
público). `.claude/launch.json` tiene configs `web` (3000) y `web-3001`.

Typecheck de `@aluminior/core` y `@aluminior/web`: OK. Tests de core: 319
pasados. Tests de contrato de UI de presupuestos: pasados. La suite web
completa exige Postgres local en 55433 (globalSetup de Vitest); no había
Docker ni clúster local en esta máquina.

## 7. Qué falta (prioridad para Claude)

Orden sugerido, todo sobre presupuestos salvo que el titular pida otra cosa:

1. **Verificar en navegador autenticado** el flujo Lista → Nuevo → Ficha →
   Escaparate → Editor → Aceptar (reabre) → PDF. Grok no tenía usuario.
2. **Editor de línea, pestañas que Productor sí tiene y Aluminior no:**
   Opc. Herraje, Cargos Adic., Acristalamiento (junquillos), compacto /
   guías / tapajuntas / mosquitera / tubos. Datos de herraje ya existen en
   `_lib/estructuras/herraje.ts`.
3. **Cabecera de ficha** pestañas 1–6 (cliente, dirección, envío, zona,
   fiscal, observaciones) y totales (Subtotal, Dto, Dto.p.p., IVA, Req.Eq.,
   retención, Precio Final).
4. **Lienzo de cerramiento**: arrastrar desde el escaparate; hoy se añade
   con clic. Uniones `GMU038` / `PSU001` ya están.
5. Familias del escaparate vacías (correderas, puertas, plegables): no
   inventar plantillas. Hace falta evidencia de `EstructurasDiseño`.
6. No mezclar el motor de despiece en `acciones.ts` (710 líneas, deuda
   conocida). Extraer antes de añadir regeneración de copia masiva.

## 7 bis. Actualización Claude, 19/09/2026 (tarde)

- Reconocimiento en vivo de cerramientos y del editor de línea en la 0017:
  `RECON-CERRAMIENTOS.md` (incluye comparación con Aluminior y propuesta
  ordenada en §7 ter). Evidencia del editor: `EVIDENCIA-EDITOR-LINEA.md`.
- §7.2 avanzado: el editor de línea ya tiene pestañas Estructura /
  Opc.Herraje / Cargos Adic. (deshabilitada) / Acristalamiento
  (`[id]/_components/editor-linea/`). Core: fórmulas y opciones de herraje,
  acristalamiento 1–5, compacto (tramos 155/185/200), mosquitera y metraje
  por superficie, cargos adicionales.
- Migración **0021_editor_linea aplicada en Supabase** el 19/09 tras probar la
  cadena completa en PGlite: `opciones_herraje.activa_solo_si /
  incompatible / descripcion_auto`, `opciones_herraje_categorias`,
  `conjunto_acristalamientos`, `tablas_acristalamiento`,
  `lineas_estructura.opcion_acristalamiento`, `lineas_cargos`. Tablas
  nuevas vacías hasta cargar datos.
- Carga pendiente: el importador completo (`npm run -w @aluminior/etl
  import`) hace `TRUNCATE` de presupuestos, líneas y clientes; para las
  tablas nuevas hace falta un cargador de catálogo acotado
  (`packages/etl/src/propuestas/editor-linea.ts` tiene los mapeos).
  `herraje_conjuntos` solo tiene 22 reglas medidas del histórico.
- Regla de unión observada (tubo 60 → módulos a 1170, total 2400):
  `PARIDAD-PRODUCTOR.md`, pendiente de confirmar con Javi.

### Continuación Codex, 19/09/2026

La copia vigente es `C:\Users\laral\Documents\Aluminior`; la carpeta de
OneDrive contiene otra copia anterior en main. Se continúa en
`feat/cerramientos-editor-linea`, sin unir ni publicar.

- Fase 1 implementada localmente: cargador de catálogo acotado con dry-run,
  transacción y rollback; fórmulas/categorías de herraje y elección de tabla
  de acristalamiento conectadas hasta persistencia y valoración. No se
  reutilizan ajustes de corte medidos para otra tabla.
- Pruebas PGlite con cadena completa 0000–0021: 6/6 aprobadas, incluida la
  prueba real tras autorización explícita para los cuatro CSV de catálogo
  históricos EMP0016. Resultado local: 11.854 opciones, 2.058 categorías,
  143 alternativas de 50 conjuntos y 70 tablas. GM252/4 conserva la fórmula
  completa `o1+o508+o509`; GMA65OPT ofrece GM69–72. Carga Supabase aplicada
  después de autorización explícita, simulación con 11.854 coincidencias sin
  ausentes y respaldo local ignorado. Se corrigió doble serialización JSON en
  el adaptador postgres.js; 6/6 ETL y typecheck ETL aprobados de nuevo.
  Recuentos protegidos antes/después: 3 presupuestos, 1 línea y 504 clientes.
  Web verificada: CERRADURA bloqueada frente a CREMONA y cuatro opciones con
  nombres GM69–72; editor cerrado sin guardar documentos.
- Fase 2 parcial: generador conservador, informe de 541 estructuras y
  categorías por familia real. No se habilitan estructuras nuevas. Ver
  `EVIDENCIA-ESCAPARATE.md` para discrepancias del control de 14 plantillas.
- Consulta visual en Productor 0017 de `1O2FL`: Diseño V3 indica
  `Hoja (1 H.Oscilo. Dchas.)`, bisagras a la derecha y 1300 × 1200 mm.
  La semántica de mano de las plantillas y los dibujadores requiere revisión
  conjunta; no basta cambiar una etiqueta sin comprobar las parejas de hojas.
- Detalle de verificaciones y límites: `VERIFICACION-CODEX-2026-09-19.md`.
  C2, regla de unión y merge siguen pendientes; no se ha alterado la 0016.

### Investigación funcional posterior, 19/09/2026

- El usuario delegó el orden técnico para reconstruir comportamiento de
  Productor. Plan actual: `PLAN-PARIDAD-OPERATIVA.md`.
- Avance del editor/escaparate guardado en commit local `3bbe321`, sin push
  ni merge. `env.example` sigue fuera del commit por ser ajeno al trabajo.
- Herrajes: Estructuras.Conjunto1..4 están vacíos en las 541 fichas.
  ConfigSeries contiene referencias por apertura, documentadas en el CHM.
  Hipótesis contrastada contra 22 reglas: 12 coinciden, 1 discrepa, 9 quedan
  desconocidas. No se cambió el resolver ni se cargaron reglas adicionales.
  Ver `EVIDENCIA-ASIGNACION-HERRAJE.md` y sus scripts reproducibles.
- Banco local de comparación preparado con proyección técnica sin datos
  libres ni identificadores de documentos. Cobertura: 888 líneas de 14 de
  las 46 candidatas; las otras 32 requieren evidencia nueva. Todos los casos
  pendientes de reproducción; igualdad numérica no certifica la tarifa,
  vidrio, diseño específico o modo de valoración. Ver `BANCO-COMPARACION-PRECIOS.md`.
- Ante bloqueo automático de generación, se pidió y obtuvo autorización
  explícita para leer VPresupuestosLin, VDatosLinEstr y VOpcionesHerraje
  históricos y guardar el banco técnico local ignorado por Git.
- Verificación: 4 pruebas sintéticas del banco y 14 controles de catálogo
  aprobados; los 14 controles preservan las divergencias conocidas, no
  significan que las 14 plantillas tengan paridad plena.
- Siguiente evidencia necesaria: diseño efectivo del contraejemplo 3HO,
  herencia de series, manos y cotas de las seis plantillas; después C2.
  Sin nuevas escrituras remotas ni modificación de Productor en este trabajo.

## 8. Archivos tocados en este commit

Presupuestos / core: `escaparate.ts`, `descripcion-linea.ts`, componentes
nuevos bajo `presupuestos/`, cambios en lista, ficha, `globals.css`.

Artículos (Claude): ficha modular y borrado de `formulario.tsx`.

Evidencia: `RECON-DETALLE-PRESUPUESTO.md`, `RECON-ARTICULOS.md`.

Este handoff: `HANDOFF-GROK.md`.

### Continuación19/09/2026: B1 manos verificado
Commit9727fe2 integra Sol63b9bea tras observación0017, revisión de diff y
correcciones de accesorios PDF/pruebas. Ver VERIFICACION-MANOS-B1.md para
resultados/límites y EVIDENCIA-COTAS-0017.md para siguiente experimento B2.
A ya completado; no repetir banco ni cargas. Siguen14 estructuras operativas.
Manos/manillas comprobadas en siete casos; no es paridad de despiece/precio.
No guardar catálogo, cargar remoto ni merge a main sin su autorización específica.
