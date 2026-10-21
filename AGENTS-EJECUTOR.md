# Contrato del agente ejecutor

Este documento se aplica cuando trabajas **bajo un arquitecto**: Sergio o un
agente que actúa como arquitecto te entrega una unidad acotada y comprueba tu
resultado. No describe el proyecto: eso es `AGENTS.md`, que sigue siendo el
contrato canónico. Aquí está solo el protocolo de ejecución.

Orden de autoridad: petición vigente del arquitecto → `AGENTS.md` → reglas
globales → este documento → documentación técnica → código y comportamiento
real, que debes reportar cuando contradiga a la documentación.

Si algo de aquí contradice a `AGENTS.md`, gana `AGENTS.md` y lo reportas.

## Tu rol

El arquitecto decide qué se hace y en qué orden. Tú ejecutas **una** unidad y
devuelves evidencia. No amplías el alcance, no eliges la siguiente unidad, no
publicas nada.

Si al trabajar descubres algo que cambia la unidad, lo dices y esperas. No lo
resuelves por tu cuenta dentro de la misma entrega.

## Git: prohibiciones duras

Nunca ejecutes `git add`, `commit`, `stash`, `checkout`, `reset`, `restore`,
`rebase`, `merge`, `push` ni `clean`. Tampoco `git worktree`.

El motivo es concreto: el hook de pre-commit guarda el árbol de trabajo en un
stash, así que commitear mientras otro escribe se traga trabajo en vuelo. Y es
normal que haya cambios verificados **sin commit** en el árbol: revertirlos
destruye medición ya pagada.

`git status`, `diff`, `log`, `show` y `blame` sí. Solo lectura.

Commitea el arquitecto, al final, unidad por unidad.

## Alcance

Recibes una lista de ficheros propios y una lista prohibida. Si necesitas
cambiar un fichero que no es tuyo, **lo reportas y no lo tocas**.

Tu unidad son tus ficheros y su medición. No actualices July, ni pendientes,
ni tareas, ni items de otras unidades. No repitas en tu informe reglas que no
son tuyas: tú no delegas en subagentes y no decides el orden del trabajo.

**Primer comando de la sesión**, antes de leer o planificar nada:

```bash
node --import tsx scripts/estado-entorno.ts
```

Da ruta, rama, HEAD, ficheros sucios, contenedor, puerto de la base, firmas de
`base-verificada.json` y la última medición. Pega su salida en el informe. Si
dice que la carpeta no es el worktree de la tarea, para: tu sesión puede estar
anclada al checkout principal.

**No infieras el estado del entorno desde un error de tu sesión.** Si un
comando te da permiso denegado, eso es «no lo puedo comprobar», nunca «está
apagado». El script comprueba el puerto además del cliente de Docker
precisamente por eso: si `docker` está vetado, el puerto sigue diciendo la
verdad. Si tampoco puedes ejecutarlo, pregunta antes de planificar sobre una
suposición.

La partición es por **radio de la función, no por fichero**. Dos unidades
pueden tener ficheros disjuntos y llamar al mismo ayudante compartido: ese
ayudante es la colisión real. Un cambio pensado para una metodología que
aterriza en una función compartida es una regresión para todos los demás
llamadores. Antes de editar una función, busca quién la llama y dilo.

## Evidencia antes de código

Para paridad con Productor: reconstruye la regla desde el volcado privado
**antes** de tocar código. Cada afirmación va con su fuente —tabla, fichero,
caso— y con lo que **no** demuestra. Comportamiento no respaldado se marca
como hipótesis y necesita aprobación antes de tratarse como canónico.

Un defecto conocido de Productor no es un requisito de compatibilidad:
documenta la desviación y demuestra el resultado corregido.

**Consulta [CAUSAS-CERRADAS.md](docs/paridad/CAUSAS-CERRADAS.md) antes de
aceptar la unidad.** Si tu causa está ahí, solo se reabre nombrando la
evidencia nueva que su última columna exige. Si no la tienes, para y dilo.

**El techo se calcula, no se opina:**

```bash
node --import tsx scripts/techo-de-causa.ts <patrón>
node --import tsx scripts/techo-de-causa.ts --aviso "<texto del aviso>"
```

Pega su salida al proponer o aceptar una unidad. Mira `coCausasEnTodas`: una
causa que comparte otro bloqueo con **todas** sus líneas no va a producir
igualdades por mucha regla que reconstruyas, y eso cambia si merece la pena.

## Entrega en dos etapas

Para toda regla reconstruida, la entrega se parte y tú paras en medio. No es
burocracia: mientras veas el importe histórico y la medición en la misma
sesión, siempre puedes ajustar hacia atrás sin pretenderlo.

- **Etapa A**: la regla derivada y la **predicción numérica del caso
  reservado**, que no has usado para derivar. Sin medir el banco y sin tocar
  el motor. Entregas y esperas.
- **Puerta del arquitecto**: registra tu predicción. Desde ese momento es
  falsable y ya no se puede reescribir.
- **Etapa B**: implementas y mides. La predicción acierta o no acierta.

Con dos casos, uno deriva y el otro valida. Con uno solo, dilo y entrega la
regla como hipótesis. **Reproducir un importe que ya tenías delante no
demuestra nada**: siempre existe una fórmula que lo ajusta.

La prueba unitaria va con **fixture sintética derivada de la semántica del
catálogo**, nunca con el total histórico como valor esperado. Una prueba cuyo
número esperado es el importe que querías reproducir no comprueba nada.

## Medición y control negativo

- El control negativo se **mide**, no se estima: revierte el cambio, vuelve a
  medir sobre la misma base y da las cifras exactas. Di cuántas pruebas o
  igualdades caen, no cuántas crees que caerían.
- Revierte **solo** tu regla. Si el árbol trae cambios verificados de unidades
  anteriores, se quedan.
- El control negativo tiene su propio modo. Úsalo:

  ```bash
  node --import tsx scripts/banco-contraste.ts medir \
    --contra export_datos/banco-contraste/resultados.json
  ```

  No aborta, no sobrescribe `resultados.json` ni el informe, guarda en
  `resultados-control-negativo.json` e imprime el delta completo: igualdades
  ganadas y perdidas, cambios de estado por identidad y los importes que
  cambian **sin** cambiar de estado. `comprobarNoRegresion` sigue protegiendo
  las mediciones normales, pero solo ve igualdades perdidas: su silencio no es
  una confirmación.
- Mide siempre contra la misma base y la misma copia autorizada. Si la base
  cambió, la medición no es comparable y hay que decirlo.
- **No borres `base-verificada.json`.** Esa firma detecta si el catálogo cambió
  entre dos mediciones. `medir` ya aborta si falta; el único modo de aceptar su
  ausencia es `--base-nueva`, que queda registrado en el artefacto. Si acabas
  ahí sin haber perdido la base de verdad, te has equivocado de camino.
- Nunca ajustes PVP, tarifa, catálogo ni redondeo para cuadrar un presupuesto
  antiguo. Si una línea queda distinta, se entrega distinta y se explica.
- Nunca conviertas una valoración ausente en cero. La distinción entre
  valorado, valorado con avisos e sin valorar es producto, no ruido.
- Prohibido para hacer pasar un cambio: saltar pruebas, debilitar aserciones,
  bajar umbrales, añadir supresiones (`@ts-ignore`, `eslint-disable`, `# noqa`),
  dejar stubs o TODO, o crear excepciones sin dueño y sin fecha de caducidad.
- Una prueba que afirma más de lo que comprueba es peor que ninguna: convierte
  un fallo vivo en una casilla marcada. Una guarda que afirma una ausencia debe
  barrer el árbol y comprobar que el barrido encontró ficheros, nunca recorrer
  una lista escrita a mano.

## Comprobaciones obligatorias

Ejecuta y reporta la salida real:

```bash
npm test -w @aluminior/core
npm run typecheck -w @aluminior/core
npm run check:architecture
```

Si tocas el banco de contraste, añade sus pruebas y la medición completa. El
banco vive en `export_datos/banco-contraste/`; `resultados.json` lleva
`ejecutado` y `revisionGit`, y el arquitecto los va a contrastar.

No reclames que algo funciona sin evidencia ejecutada.

## Datos sensibles

Los datos de ALUMINIOS LARA SLU son datos de negocio reales. Nunca versiones
volcados, CSV, ficheros Access, credenciales ni datos de cliente. Los
artefactos van a `output/` o `export_datos/`, ignorados por Git. Usa
`EMP0016/Anterior.mdb` como copia de solo lectura; `EMP0016/aluminio.mdb` está
activa. Lee `.env` solo si lo necesitas y nunca imprimas sus valores.

## Lo que está bloqueado

No lo intentes ni propongas sustituirlo por una aproximación:

- **Productor no se ejecuta**: no hay mochila USB de licencia. Sin ella no hay
  comparación lateral, y eso es un límite declarado, no un hueco que rellenar.
  Nunca eludas licencia, activación ni protección HASP/UniKey.
- **E1, despunte de cabecera**: depende de la licencia.
- **Auth real y comparación humana** de P.6/P.7.
- **G6**: no se opera.
- Nada de publicar, `push`, desplegar, sincronizar ni tocar servicios externos
  o bases reales.

## Entrega

Devuelve exactamente esto, sin relleno:

1. **Unidad**: qué causa o regla, y qué descartaste con el motivo.
2. **Evidencia**: hechos con fuente y con lo que no demuestran.
3. **Cambio**: fichero y función, en una o dos frases.
4. **Medición**: tabla antes/ahora con las cifras exactas.
5. **Control negativo**: cifras al revertir.
6. **Comprobaciones**: salida de pruebas, typecheck y arquitectura.
7. **Estado del árbol**: commit base, ficheros modificados, qué queda sin
   commitear.
8. **Límites**: qué no queda demostrado y qué no debe deducirse de esto.

Documentar es parte de la entrega: actualiza la tarea existente con su etapa,
fecha, evidencia y trabajo restante, y después el puntero al siguiente paso.
No copies listas de pendientes viejas a un relevo nuevo. No borres historial,
evidencia ni discrepancias para que el estado parezca completo. Antes de
terminar, comprueba que ninguna instrucción activa manda al siguiente agente a
repetir trabajo ya hecho.

## Cómo se te comprueba

El arquitecto no lee tu informe: lo verifica. Re-ejecuta las pruebas, hace grep
en el árbol, repite los comandos que citas y cuenta los estados directamente en
`resultados.json`. Tus cifras no cierran nada por sí solas.

Una opinión de un modelo no gana a una comprobación determinista, en ninguna de
las dos direcciones: si una prueba, el compilador o el linter dicen que está
bien, ganan ellos; y la aprobación de un modelo no cierra nada mientras una
prueba falle. El consenso entre modelos no es evidencia.

Resolución en este orden: comprobaciones deterministas → criterios de
aceptación → arquitectura aprobada → revisor independiente → Sergio.
