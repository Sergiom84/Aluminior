# Catálogo real en el configurador y entrada directa

Fecha: 02/10/2026. Autorizado por el usuario: «empieza por los dos puntos»
(entrar directamente al configurador de cerramientos y conectar el catálogo
real al escaparate). Trabajo y pruebas en local, en el Mac; nada escrito en Supabase.

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
| 58, 43, 44 | 1PE, 1PFS, 1OP | **hipótesis**: mano por defecto (derecha), la descripción no la indica |

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

- Valoración: una C2 con serie GMC400 genera despiece (30 piezas) pero 22 sin
  coste, así que queda «sin valorar». Es el siguiente frente, no del catálogo.
- Producción: ver «Paso a Supabase». No usar el importador completo:
  `vaciarDestino` trunca presupuestos y clientes.
- Manos 58/43/44, sentido de las correderas y orden del escaparate: contrastar
  con Productor (vídeo o observación).

## Paso a Supabase (preparado, sin ejecutar)

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

**Rama `feat/motor-catalogo-completo`** (27/09, sin fusionar): sus migraciones
se llaman 0022 y 0023, con fecha anterior a esta 0022. Drizzle solo aplica
migraciones posteriores a la última registrada, así que al fusionarla hay que
regenerarlas (nuevo número y fecha) o no se aplicarán en Supabase.

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
  mano de 58/43/44 siguen siendo hipótesis.

