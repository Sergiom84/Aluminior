# Aluminior — traspaso para una conversación nueva

Actualizado: 2 de agosto de 2026.

Este es el punto de entrada vigente. Leer después `AGENTS.md`,
`ARQUITECTURA.md` y `PARIDAD-PRODUCTOR.md`. `PLAN.md` y `ENTREGA.md` contienen
el registro histórico profundo, pero algunas secciones antiguas fueron
superadas por las decisiones resumidas aquí.

## 1. Objetivo y criterio de producto

Aluminior reconstruye en TypeScript/Next.js el flujo de trabajo autorizado de
Productor Aluminio para ALUMINIOS LARA SLU.

- Productor es la referencia funcional, de vocabulario e interacción.
- El ejecutable no se integra como dependencia ni se automatiza desde la web.
- No se elude la mochila HASP/UniKey ni se copian código o recursos propietarios.
- La estética es moderna; no se replica el acabado Windows XP.
- El configurador de cerramientos es el núcleo del producto. El presupuesto es
  el documento que recibe su resultado como una única línea agregada.

## 2. Evidencia analizada

Se revisaron la instalación autorizada en
`C:\Users\sergi\Desktop\Productor\Aluminio`, ejecutables, manual CHM, informes,
configuración, copias de datos, vídeo del operador y capturas de Productor.

El vídeo confirmó el flujo real:

1. Nuevo presupuesto con cliente opcional, nombre libre y obra.
2. Entrada inmediata al diseñador.
3. Encadenado de ventanas, fijos y uniones.
4. Serie, vidrio, acabado y medidas por elemento.
5. Ajustes manuales de fabricación y colocación.
6. Retorno como una sola línea `GRUPO`, seguido de PDF.

La aplicación original no pudo ejecutarse sin sus componentes/licencia. Esto no
bloquea el desarrollo: la reconstrucción usa observación, datos y comparaciones
controladas. Los COM/OCX antiguos sólo deben probarse en VM y nunca registrarse
en el equipo principal sin un plan de reversión.

## 3. Cambios de producto e interfaz realizados

- Se abandonó el dashboard web genérico como referencia visual.
- Presupuestos, navegación y superficies se acercaron a la densidad y jerarquía
  operativa de Productor con un acabado contemporáneo.
- Se actualizaron `README.md`, `AGENTS.md`, `CLAUDE.md`, `ARQUITECTURA.md` y
  `PARIDAD-PRODUCTOR.md` para fijar esta dirección.
- La creación de presupuesto admite cliente, potencial o nombre libre.
- El selector de cliente busca por prefijo de código o por varios fragmentos
  parciales del nombre en cualquier orden. Por ejemplo, `ser her la` puede
  encontrar `Sergio Hernández Lara`, persistiendo siempre el código canónico.

## 4. Diseñador de cerramientos implementado

El primer diseñador funcional vive en:

- `packages/core/src/estructuras/diseno.ts`
- `packages/core/src/estructuras/diseno.test.ts`
- `packages/web/app/dashboard/presupuestos/[id]/_components/disenador-estructura.tsx`
- `packages/web/app/dashboard/presupuestos/[id]/_components/anyadir-linea.tsx`

Incluye:

- modelo versionado de módulos y uniones;
- composición anidada de marco, hueco, hoja, vidrio y travesaño;
- plantillas verificadas: fijos, oscilobatientes y varias combinaciones;
- alta y eliminación de módulos a la derecha;
- edición individual de ancho y alto;
- cálculo del ancho total incluyendo el grosor de las uniones;
- uniones verificadas `GMU038` y `PSU001`, con longitud y grosor;
- selección global inicial de serie, vidrio, acristalamiento y acabado;
- ajustes manuales separados de fabricación y colocación;
- representación visual original basada en el vocabulario observado, sin copiar
  los renders propietarios de Productor.

Todavía no incluye el editor interno completo de un hueco: travesaños añadidos
interactivamente, barrotillos, venecianas, paneles, mallorquinas y curvas siguen
pendientes hasta disponer de evidencia suficiente.

## 5. Persistencia y Supabase

Se añadió la tabla satélite `lineas_cerramiento` mediante:

- `packages/db/src/schema/lineas.ts`
- `packages/db/migrations/0017_mean_skrulls.sql`
- `packages/db/migrations/meta/0017_snapshot.json`

Guarda la configuración JSON versionada, serie, vidrio, acabado, variante de
acristalamiento y los ajustes manuales. La migración está aplicada en el
proyecto Supabase remoto. RLS está activo y no hay políticas de acceso directo
desde el cliente; la escritura se realiza en servidor.

El cerramiento se persiste en `lineas` como tipo `CERRAMIENTO`, código `GRUPO`,
una descripción agregada, medidas y precio nulo mientras no exista valoración
completa. La regla sigue siendo «todo o sin valorar»: nunca se presenta un cero
ni un total parcial como si fuese correcto.

## 6. Verificación real realizada

Se guardó desde la interfaz un caso reversible con:

- dos módulos `2O`;
- unión `PSU001`, longitud 1020 mm y grosor 100 mm;
- serie `ELEGANTPVC`;
- vidrio `V420AGS4`;
- acabado `L`;
- fabricación 25 euros y colocación 40 euros.

La fila y su JSON se comprobaron directamente en PostgreSQL. La interfaz mostró
una sola línea `CERRAMIENTO SEGÚN DIBUJO · 2O + 2O`, 2500 × 1200, explícitamente
sin valorar. Después se eliminó la prueba y se confirmó `0` líneas residuales y
`0` filas en `lineas_cerramiento`.

Se corrigió además un fallo de estado: tras guardar, el formulario nativo se
reiniciaba pero el dibujo conservaba la composición anterior. Ahora el aviso de
valoración pendiente representa un guardado correcto y formulario y diseñador
vuelven juntos a un módulo `2O` limpio.

Desde el 2 de agosto de 2026 esta verificación es repetible y no depende de un
script manual:

- `_lib/cerramientos/alta-cerramiento.test.ts`: sin base de datos. Descripción,
  medidas, ausencia de precio, rechazo de composición manipulada, escritura por
  el cliente recibido conservando todos los campos, y propagación del fallo.
- `_lib/lineas/persistencia.integracion.test.ts`: contra el Postgres efímero en
  Docker, aplicando las migraciones reales. Ejecuta `guardarLinea`, el mismo
  servicio que usa `anyadirLinea`; no reproduce la transacción por su cuenta.
  Comprueba el guardado reversible del caso `2O + 2O` y tres fallos intermedios
  reales: ajuste negativo que viola el CHECK del satélite, cantidad de despiece
  fuera de rango en una ESTRUCTURA, y el cuadre entre cabecera y líneas.

```
docker compose -f packages/db/docker-compose.yml up -d
npm test
```

La prueba valida su destino antes de conectar: sólo Postgres local y base
terminada en `_test`. Apuntar `TEST_DATABASE_URL` a Supabase aborta con un error
explícito, así que la separación no depende de recordarla.

El rollback se validó por mutación **del código de producción**: sustituyendo
`db.transaction` por escrituras sueltas en `guardarLinea`, las tres pruebas de
fallo intermedio fallan (una línea huérfana de cerramiento, otra de estructura,
y la cabecera descuadrada en 1000). Restaurada la transacción, pasan.

- 73 pruebas de `@aluminior/core` superadas;
- 7 pruebas de `@aluminior/web` superadas con base de datos (4 sin ella);
- typecheck de todos los workspaces superado;
- build de producción de Next.js superado;
- `git diff --check` sin errores;
- servidor local en `http://localhost:3000`.

## 7. Arquitectura modular obligatoria

El usuario quiere evolucionar por módulos pequeños para que una modificación no
afecte áreas independientes. Esta regla ya está incorporada en `AGENTS.md`,
`CLAUDE.md`, `README.md` y `ARQUITECTURA.md`.

- Páginas y server actions sólo coordinan.
- Dominio puro en `packages/core`; persistencia en `packages/db`.
- Separar estado, dibujo, inspector, catálogo, validación y persistencia.
- Revisar cohesión cerca de 250 líneas; un archivo manual de más de 400 líneas
  debe dividirse o justificar la excepción.
- No trocear mecánicamente: extraer responsabilidades con interfaces y pruebas.

Deuda prioritaria: `packages/web/app/dashboard/presupuestos/_lib/acciones.ts`
supera las mil líneas y mezcla demasiados casos de uso. Antes de añadir edición
o valoración de cerramientos, extraer incrementalmente:

1. `cerramientos/validacion.ts` — hecho;
2. `cerramientos/persistir-cerramiento.ts` — hecho;
3. `cerramientos/alta-cerramiento.ts` y `cerramientos/index.ts` — hecho el 2 de
   agosto de 2026: validación, descripción, medidas y escritura del satélite
   viven fuera de la acción, que delega por el punto de entrada. La inserción
   de la línea principal es común a los tres tipos y sigue en la acción;
4. `totales.ts` con `actualizarTotales(cliente, id)` — hecho. Acepta conexión o
   transacción, y `recalcularTotales` queda como envoltorio fino;
5. acciones finas que sólo autentiquen, deleguen y revaliden — pendiente.

### Atomicidad de la escritura

Corregido el 2 de agosto de 2026 tras una revisión externa. El alta escribía la
línea, el satélite y los totales en llamadas sueltas: si fallaba la segunda, la
línea `GRUPO` quedaba guardada sin configuración, que no es un documento
incompleto sino uno corrupto —no se puede volver a dibujar, describir ni
valorar—. Ahora `anyadirLinea` y `borrarLinea` abren `db.transaction` y todo
—línea, satélite de cerramiento o de estructura, despiece, acristalamiento,
opciones de herraje y totales— confirma o se deshace junto.

`_lib/cliente-db.ts` define `ClienteEscritura` (conexión o transacción). Todo
módulo que escriba debe aceptarlo en vez de llamar a `crearDb()` por su cuenta;
hacerlo escribiría fuera de la transacción de quien lo invoca.

La transacción no se abre en la acción: vive en `_lib/lineas/guardar-linea.ts`,
único camino de escritura de una línea. La acción calcula y delega. Así la
atomicidad no depende de que quien llame se acuerde, y las pruebas ejercitan el
mismo código que producción en vez de reproducir la orquestación.

No reescribir todo el archivo de una vez.

En `packages/core` el modelo del cerramiento se separó del vocabulario visual:
`estructuras/diseno.ts` conserva plantillas y reparto geométrico, y
`estructuras/cerramiento.ts` contiene configuración, medidas, validación y la
descripción agregada `descripcionCerramiento`. Ambos se reexportan desde
`estructuras/index.ts`, por lo que ningún importador cambió.

## 8. Siguiente trabajo recomendado

### Ahora

1. Permitir abrir y editar una línea `CERRAMIENTO` ya guardada, reutilizando el
   módulo `cerramientos/` en vez de ampliar la acción.
2. Generar el dibujo estable desde la configuración persistida. La descripción
   ya se deriva de ella con `descripcionCerramiento`.
3. Continuar la descomposición de `acciones.ts` por los puntos 4 y 5 del
   apartado 7.

### Después

1. Valoración agregada por módulos, uniones, vidrio y ajustes, conservando la
   guarda «todo o sin valorar».
2. Editor interno de huecos y travesaños basado en las capturas verificadas.
3. PDF «Presupuesto con dibujos» con la línea agregada.

### Experimental

- Producción y hoja de corte automática. El eje ya está corregido como
  `A=anchoMm` y `L=altoMm`, pero la salida de fabricación todavía requiere
  revisión humana y no debe presentarse como validada.

## 9. Seguridad y límites

- No mostrar, guardar ni versionar contraseñas o claves de `.env`.
- No usar `EMP0016\aluminio.mdb` activa; investigar sólo sobre una copia como
  `EMP0016\Anterior.mdb`.
- No ejecutar migraciones remotas sin alcance explícito y prueba reversible.
- No mezclar datos de clientes reales con fixtures, capturas o commits.
- El árbol Git contiene cambios sin confirmar de esta iteración. Revisar el diff
  por rutas y no descartar cambios ajenos antes de continuar.

## 10. Prompt corto para la conversación nueva

> Continúa Aluminior desde `HANDOFF-CHATGPT.md`. Lee primero `AGENTS.md`,
> `ARQUITECTURA.md` y `PARIDAD-PRODUCTOR.md`. Conserva la paridad funcional con
> Productor y la regla «todo o sin valorar». Antes de añadir edición o valoración,
> extrae la persistencia de cerramientos de `acciones.ts` en módulos pequeños y
> verifica que el guardado reversible actual sigue funcionando.
