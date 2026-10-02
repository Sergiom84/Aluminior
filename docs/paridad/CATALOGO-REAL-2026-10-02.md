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
- Producción: hace falta aplicar `0022` en Supabase y **rellenar solo las
  columnas nuevas**. No usar el importador completo: `vaciarDestino` trunca
  presupuestos y clientes.
- Manos 58/43/44, sentido de las correderas y orden del escaparate: contrastar
  con Productor (vídeo o observación).
