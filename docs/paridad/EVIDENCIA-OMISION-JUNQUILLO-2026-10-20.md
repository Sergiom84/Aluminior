# Vidrio sin fila de acristalamiento: omitir junquillo y juntas

20/10/2026. Unidad local, sin ejecutar Productor y sin mochila de licencia.
Evidencia del volcado privado `EMP0016/Anterior.mdb` (SHA-256 `e8518386…23721a0`)
en solo lectura. El censo queda en `output/censo-junquillo-20261020.json`,
ignorado por Git. No hay commit: la medición es de este árbol de trabajo.

## Qué se eligió y qué no

De los tres candidatos del relevo, ninguno era una regla única demostrada:

- `pvp-o-tarifa` / `importe-de-fila`: la desviación de 670,54 € sale de cuatro
  líneas distintas. Dos tienen PVP posterior al presupuesto y el mismo acabado
  en el perfil; no se cambia la tarifa para cuadrarlas. Las otras dos no
  reconcilian el padre con la suma de piezas.
- `resolucion-de-componentes-y-herrajes`: el cubo mezcla un aviso «sin artículo»
  de la junta V1000 con asociaciones sin medida. La medida de hoja no se
  sustituye por la dimensión exterior.
- `total-padre-no-reconciliado`: diez de las diecisiete líneas son el despunte
  de cabecera, E1, parado por la licencia.

La causa medible está dentro de las doce de tarifa: tres líneas no se valoraban
porque el motor exigía un junquillo que la tabla no tiene. El despiece guardado
no trae ese artículo y aun así tiene precio.

## Evidencia reconstruida

La tabla de posición `*` elige la fila de menor `Grosor` que cubre
`Articulos.TamJunqGoma`. Si ninguna cubre, el motor bloqueaba la línea.

| Hecho | Fuente | Qué no demuestra |
|---|---|---|
| `GM02` (serie `GMA350`) llega a 17,5 mm. `V4104` mide 18 mm y `V4124` mide 20 mm | `TAcristalamientoLin.csv`, `Articulos.csv`, `Conjuntos.TablaHojas` | Que la opción 2–5 cubra ese grosor: `nTAcris` de estos casos es 0 o 1 |
| `GM85` (serie `GMA65OHS`) llega a 29,6 mm. `V418L44GS` mide 30 mm | las mismas tablas | Que 29,6 y 30 sean la misma fila: la comparación es `>=` y 29,6 no cubre 30 |
| 18 contextos superan el máximo de su tabla `*`. Ninguno guarda un junquillo o una junta de esa tabla | `banco.json` + las tablas anteriores | Que usar la última fila sea equivalente: esa fila sí aparece cuando el grosor entra (`GM8207` en `caso-01189`) |
| `caso-01186`, `caso-01187` y `caso-01218` suman sus piezas al precio del padre, dentro de céntimos | `resultados.json` anterior | Que el PVP vigente coincida con el del presupuesto: los tres tienen tarifa posterior |

`GM05` cubre 20,5 mm, pero sus filas son por posición y el despiece de estos
casos no contiene `GM8212` ni `GM8260`. No se traduce esa tabla.

## Cambio entregado

`acristalarVidrio` en `packages/core/src/despiece/acristalamiento-catalogo.ts`:
si ninguna fila cubre el grosor, omite junquillo y juntas y lo deja en aviso.
Sigue bloqueando tabla vacía, posiciones sin contrastar, grosor inválido y
descuento de junquillo ausente. No cambia la fila elegida cuando el grosor sí
entra, ni el redondeo, ni la tarifa.

## Medición

Misma base efímera y misma copia que la variante del 20/10. El contenedor se
reinició: se borró `base-verificada.json` y se preparó el catálogo de nuevo.

| Medición | Antes (`1b3d8f8`) | Con la omisión |
|---|---:|---:|
| Líneas elegibles iguales | 410/523 (78,39 %) | 410/523 (78,39 %) |
| Cercanas | 83 | 84 |
| Distintas | 5 | 8 |
| Sin valorar | 25 | 21 |
| `vidrio-y-acristalamiento` en no iguales ni cercanas | 8 | 4 |

Líneas que pasan de sin valorar a valoradas, sin volverse iguales:

| Línea | Esperado | Obtenido | Estado |
|---|---:|---:|---|
| `caso-01186` | 1.059,02 | 1.272,47 | distinto |
| `caso-01187` | 466,17 | 557,92 | distinto |
| `caso-01218` | 627,98 | 630,43 | cercano |
| `caso-02084` | 5.096,31 | 5.265,41 | distinto |

Control negativo: restaurado el bloqueo, con la misma base, la medición vuelve
a 410/83/5/25. La guarda de no regresión no nombra líneas perdidas porque no
se ganó ni se perdió ninguna igualdad. Las cuatro identidades de arriba vuelven
a sin valorar. No se ajusta el catálogo para convertirlas en iguales.

Verificación: 973 pruebas de core —una nueva de la omisión—, 47 del banco con
`tsx --test`, typecheck de core y cero infracciones de arquitectura.

## Límite

La comparación lateral en Productor sigue pendiente. Las alternativas
`nTAcris` 2–5 y las tablas por posición siguen sin mapeo. La desviación que
queda en estas cuatro líneas es de tarifa o de otras piezas, no del junquillo
omitido. No usar este resultado para cambiar PVP.
