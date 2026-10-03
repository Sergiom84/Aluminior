# Catálogo real en el configurador y entrada directa

Fecha: 02/10/2026. Autorizado por el usuario: «empieza por los dos puntos»
(entrar directamente al configurador de cerramientos y conectar el catálogo
real al escaparate). Trabajo inicial en local, en el Mac; la ejecución posterior de 0022 y el relleno
en Supabase está registrada más abajo. Estado remoto informado por ese cierre,
sin verificar directamente en esta auditoría.

## Problema observado

- En la web publicada sí se pueden componer varias ventanas (comprobado en el
  260005 sin guardar), pero el alta abría en «Estructuras» (una ventana por
  línea) y colocar la segunda exigía acertar en un punto verde pequeño.
- El escaparate tenía 14 plantillas escritas a mano y dos uniones. Faltaban las
  correderas: C2 (118 usos en cerramientos reales) y PC2 (55).

## Evidencia de datos (EMP0016/Anterior.mdb, solo lectura)

541 estructuras, 393 con árbol de diseño en 20 familias de escaparate.
`OrdenEscap` vale 0 en todas: el escaparate ordena por código.
El tipo de hoja (`TipoHoja`, `nHoja`) codifica la apertura; la descripción de
las estructuras que lo usan da su significado:

| TipoHoja | Ejemplos | Dibujo |
|---|---|---|
| 1 / 2 | 1D «MANO DERECHA» / 1I «MANO IZQUIERDA» | abatible derecha / izquierda |
| 5 / 6 | 1OD / 1OI | oscilobatiente derecha / izquierda (como antes) |
| 7, 15 | 2, 2P (dos hojas) | abatible izquierda + derecha |
| 8, 26 | 2O, 2OP (una oscilobatiente) | abatible izquierda + oscilobatiente derecha |
| 10, 13, 14, 16–20, 70–72, 79, 80 | C2, PC2, C3, C4, C2P, C6, monocarriles | corredera |
| 43 / 44 | 1OPD / 1OPI | oscilobatiente derecha / izquierda por las descripciones del catálogo |
| 58 | 1PE, 1PFS | **hipótesis**: mano derecha por defecto, pendiente de contraste |

`TipoCurva` distinto de 0 marca arcos e inclinaciones (los 25 de la familia 010):
no se dibujan como rectos. Marcos NOR, PTA, 3C, VEN y SOL se dibujan como
perímetro normal; la diferencia es de fabricación.

## Implementado

- Core: apertura `corredera` (flecha doble, sin bisagras ni manilla, sin
  afirmar sentido); `tipos-hoja-catalogo.ts` con el mapeo anterior; el generador
  deja de filtrar por familia y rechaza curvas, tipos de hoja sin evidencia,
  lamas (nodo 9), zócalos (nodo 4) y cotas no verificadas.
- Core: `diseno/registro.ts`. Catálogo disponible = 14 verificadas + generadas;
  una verificada nunca se sustituye. `anclajeLateral`: derecha del último
  elemento de la fila superior.
- BD: migración aditiva `0022_catalogo_diseno` (medida de diseño en
  `estructuras`; hoja, cota, reparto, marco y curva en `estructura_diseno_nodos`).
  ETL: importa esos campos.
- Web: `_lib/catalogo-diseno` lee y genera el catálogo (caché de 5 min) y lo
  registra en página, acciones de alta/edición/copia y PDF; sin la migración
  se queda en las 14 verificadas. El alta solo lee el catálogo si la
  composición usa códigos sin registrar, así una entrada malformada se rechaza
  sin abrir conexión.
- Web: el alta abre en Cerramiento; «Colocar X a la derecha» en la barra del
  configurador con una miniatura preparada; doble clic en la miniatura la
  coloca directamente. Arrastre y puntos verdes se mantienen.

## Resultado medido

160 estructuras dibujables (antes 14) que cubren 728 de 737 elementos de los
cerramientos reales. Sin dibujo: plegables (tipos 29–42), mallorquinas (nodo 9),
zócalos (nodo 4), curvas, oscilantes/proyectantes (21, 22, 49), 3HO y PCM1D/I
(cota tipo 2).

## Verificación

- Pruebas: core 484, web 645, etl 17 (+1 omitida previa), db 55. Typecheck de los
  cuatro paquetes y `check:architecture` sin infracciones. La referencia del
  importador se regeneró comprobando que solo cambian las columnas nuevas.
- Navegador, base local con el catálogo real: alta → configurador directo;
  C2 + C3 con «Colocar a la derecha» y C2FI con doble clic (4240 × 1200);
  guardado como una GRUPO «C2 + C3 + C2FI»; PDF con el dibujo; 375 px sin
  desbordamiento.

## Límites y siguientes pasos

- Ensayo de valoración anterior a la integración del motor: una C2 con serie GMC400 genera despiece (30 piezas) pero 22 sin
  coste, así que queda «sin valorar». El [ensayo posterior](INTEGRACION-MOTOR-CATALOGO-2026-10-02.md) obtuvo PVP con
  avisos para C2/PC2 con el motor cargado; no acredita paridad general.
  La carga remota del motor sigue pendiente según el cierre del importador.
- Producción: ver «Procedimiento y ejecución fechada de 0022». No usar el importador completo:
  `vaciarDestino` trunca presupuestos y clientes.
- Mano 58, sentido de las correderas y orden del escaparate: contrastar
  con Productor (vídeo o observación).

## Procedimiento y ejecución fechada de 0022

La secuencia siguiente registra trabajo ya realizado según el cierre autorizado;
no es una lista de operaciones pendientes ni autorización para repetirlas.

Desplegado `d5c87ce` en Render: abre en Cerramiento y, sin la migración en
Supabase, sigue con las 14 verificadas sin errores (comprobado 02/10/2026).

`packages/etl/src/rellenar-diseno.ts` rellena solo los nueve campos de dibujo
en filas existentes: no vacía ni inserta, salta nodos cuya identidad (tipo y
padre) no coincida, va en una transacción y **simula por defecto**. Ensayo en
local con los campos vaciados: 541 estructuras y 5596 nodos, cero ausentes o
con identidad distinta; repetirlo no cambia nada; el escaparate vuelve a 160.

Con el `.env` de la empresa en la raíz y el origen `export_datos/EMP0016`:

1. `node packages/db/pruebas/preflight-remoto.mjs`: revisar las migraciones
   aplicadas.
2. `node packages/db/pruebas/aplicar-remoto.mjs`: aplica `0022` (aditiva).
3. `npx tsx packages/etl/src/rellenar-diseno.ts --origen export_datos/EMP0016`:
   simulación. Esperado: sin filas ausentes ni identidades distintas; si las
   hay, el catálogo de Supabase procede de otra exportación y hay que decidir
   el origen antes de seguir.
4. Repetir con `--apply`. Reversible poniendo a NULL esas columnas.

La web recoge el catálogo en un máximo de 5 minutos (caché por proceso).

**Ejecución en Supabase (02/10/2026, autorizada por el usuario):** antes, 22
migraciones (hasta `0021_editor_linea`), 541 estructuras, 5596 nodos, 5
presupuestos y 1 línea. Aplicada `0022_catalogo_diseno` (registro 23, hash
`05b992b5814d`, igual al fichero). Simulación del relleno: 541 estructuras y
5596 nodos a actualizar; 0 ausentes, 0 sin origen, 0 con identidad distinta.
Comprobado después: ninguna fila escrita y la web publicada sigue con las 14.
Relleno aplicado con `--apply` tras confirmación: 541 estructuras y 5596
nodos en una transacción; una segunda pasada no encuentra cambios; siguen 5
presupuestos y 1 línea. La web publicada ofrece 160 estructuras (mismo reparto
por familia que en local) y compone C2 + C3 (3020 × 1200).

**Integración resuelta:** la rama `feat/motor-catalogo-completo` ya es antecesora
de main `9bc879e`. Se conserva `0022_catalogo_diseno` y el motor se regeneró
como `0023_motor_catalogo`, seguido de `0024_motor_catalogo_rls`.
No aplicar las migraciones antiguas como una segunda 0022.

## Contraste con el seminario de GAIA (2020)

Material del usuario en `Desktop/Aluminior/Presentación programa` (fuera del
repositorio). Confirma:

- Escaparate con familias a la izquierda, rejilla 4 × 3, «Página X de Y» y
  etiqueta `DESCRIPCIÓN [CÓDIGO]`, como el de Aluminior.
- Convención de dibujo: líneas desde las esquinas del lado de bisagras (marcas
  en el marco) hasta el vértice del lado de manilla; la oscilobatiente añade el
  triángulo con vértice arriba. Coincide con el dibujo de Aluminior y con el
  mapeo de los tipos 7 (2 hojas) y 8 (2 hojas, una oscilo).
- En la base de demostración el orden del escaparate no es por código
  ([1], [2], [3], [4], [10], [20], [30], [99], [1+1]…): parece `OrdenEscap`
  mantenido a mano. En EMP0016 vale 0, así que se mantiene el orden por código.
- Varias ventanas se presentan como líneas de estructura consecutivas; al
  aceptar, Intro reutiliza las características de la anterior. Aluminior ya
  conserva serie, vidrio y acabado entre altas; queda por medir foco y teclado.
- No muestra correderas, GRUPO ni uniones: sentido de las hojas correderas y
  mano 58 siguen pendientes. Los tipos 43/44 se resuelven por las descripciones
  de 1OPD/1OPI, no por este seminario.

