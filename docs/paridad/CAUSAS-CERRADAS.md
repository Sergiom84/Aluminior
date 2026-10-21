# Causas cerradas sin regla

Registro único de causas del banco que **ya se investigaron y se cerraron sin
regla acreditada**. Consúltalo antes de aceptar o proponer una unidad.

Existe porque estos veredictos vivían enterrados en informes fechados: nadie
los encontraba y cada agente nuevo reabría la misma investigación. El trabajo
cerrado sin esta tabla vuelve a empezar cada pocas sesiones.

Es un registro **append-only**. No se borra una fila: cuando una causa se
resuelve, se marca resuelta con su evidencia y se deja la historia.

La columna que hace el trabajo es la última. Un cierre sin condición de
reapertura es un veto eterno; con ella, es una hipótesis con precio. **Si no
puedes nombrar evidencia nueva que cumpla esa condición, no reabras la causa.**

| Causa | Cierre | Veredicto | Evidencia | Qué evidencia nueva la reabre |
|---|---|---|---|---|
| `DisIdPerAd` como selección de perfil adicional; retirar la guarda de `cortes-referenciados.ts` | 27/09/2026, incorporado el 13/10 | Cerrada sin regla. Existe un ID del árbol que coincide con `PerfilAdSN=False`, pero es correspondencia observada, no regla acreditada. El CHM describe selección y cotas y **no** documenta el algoritmo | [fase-8/13](fase-8/13-cotas-economicas-y-relevo.md) | Un caso donde la medida de GM487/GM492 se **prediga** desde plantilla y cotas antes de ver el importe histórico, y acierte en un caso no usado para derivar. O documentación del algoritmo fuera del CHM. Reproducir 19,85 € a posteriori no cuenta |
| `pvp-o-tarifa` / `importe-de-fila` como una regla única | 20/10/2026 | Cerrada: no es una causa, son cuatro líneas distintas. Dos tienen PVP posterior al presupuesto con el mismo acabado de perfil; las otras dos no reconcilian el padre con la suma de piezas. No se cambia el catálogo para cuadrarlas | [omisión de junquillo](EVIDENCIA-OMISION-JUNQUILLO-2026-10-20.md) | Un caso con tarifa **anterior o igual** al presupuesto que siga discrepando. Mientras la tarifa sea posterior, la discrepancia no prueba error de cálculo |
| `resolucion-de-componentes-y-herrajes` como cubo accionable | 20/10/2026 | Cerrada: el cubo mezcla el aviso «sin artículo» de la junta V1000, que no es un herraje, con asociaciones sin medida. `caso-01332` (asociación `84052`, `GM5568`) pide la medida de la hoja, no el ancho exterior | [omisión de junquillo](EVIDENCIA-OMISION-JUNQUILLO-2026-10-20.md) | La medida de hoja de `84052`/`GM5568` derivada del corte real, no supuesta desde la dimensión exterior. Separar antes el aviso de junta del de asociación |
| `total-padre-no-reconciliado` como unidad propia | 20/10/2026 | Cerrada por dependencia: diez de sus diecisiete líneas son el despunte de cabecera, que es E1 | [omisión de junquillo](EVIDENCIA-OMISION-JUNQUILLO-2026-10-20.md) | Que E1 deje de estar bloqueado, es decir, mochila USB de licencia disponible. Sin ella no hay unidad aquí |
| `accesorio-de-linea-no-representable`: accesorios de familia 112 (tubos) | 21/10/2026 | Cerrada sin regla. Las tres líneas son el mismo motivo, no tres. Cada estructura de tubo tiene cuatro filas —`TUBO`/`TUBOINF` por ancho, `TUBOIZ`/`TUBODE` por alto— y el despiece guarda una; los tres casos guardan tres filas distintas. Las filas de `VAccesorios` de dos de ellos son idénticas salvo acabado y eligen filas distintas, ninguna opción referencia el tubo, y los dos casos `2O` difieren. La elección cambia el importe | [tubos de familia 112](EVIDENCIA-TUBOS-FAMILIA-112-2026-10-21.md) | Un campo o tabla que codifique la posición y no esté en la extracción (diseño de línea `VDatosLinDetDis`, tabla de accesorios no exportada, cota por accesorio), u observación en Productor con mochila, o más líneas de familia 112 que revelen patrón por serie, hueco o geometría. No ampliar la lista blanca de familias sin una de las tres |
| Omisión de junquillo sin fila cubriendo el grosor | 20/10/2026 | **Resuelta**, no cerrada. Omitir junquillo y juntas cuando ninguna fila cubre `TamJunqGoma`. Cuatro líneas dejan de bloquearse, ninguna pasa a igual | [omisión de junquillo](EVIDENCIA-OMISION-JUNQUILLO-2026-10-20.md), commit `ca8401d` | No reabrir sin un fallo nuevo. Pendiente solo la comparación lateral en Productor, bloqueada por licencia |

## Bloqueos de entorno, no de evidencia

Estos no se reabren con evidencia, sino con acceso. No los investigues.

| Bloqueo | Qué desbloquea |
|---|---|
| E1, despunte de cabecera | Mochila USB de licencia de Productor |
| Comparación lateral de cualquier unidad de paridad | La misma mochila |
| Auth real y comparación humana de P.6/P.7 | Decisión y ejecución de Sergio |
| G6 | No se opera |
