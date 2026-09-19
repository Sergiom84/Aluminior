# Banco local de comparación: cobertura y límites

19/09/2026. Herramienta preparada y **banco real generado tras autorización explícita**.
No modifica tarifas, documentos, catálogos operativos ni Supabase. No activa estructuras.

## Cobertura observada y reproducida

Una lectura agregada de CSV históricos encontró **888 líneas de presupuesto de
14 de las 46 candidatas visuales**. Las otras 32 no tienen muestra en esa tabla;
necesitarán ensayos controlados en Productor 0017. No se han leído cabeceras ni clientes.

Las 888 líneas tienen una configuración VPRES única; una carece de hijas de despiece.
214 llevan diseño específico, 65 horas adicionales de fabricación y 371 horas de
colocación. Estos conjuntos se solapan. Hay 15 con precio manual. No se deducen
ajustes ni reglas de esos importes. Las dimensiones incluyen valores no positivos,
que el banco rechaza como entrada reproducible.

Series observadas: ELEGANTPVC 633, GMA350 152, GMA65OPT 51, GMA60RL 33,
GMA75C16 10, GMA65OHS 7 y GMA76 2. Esa distribución evita elegir sólo ejemplos
favorables de una serie, pero no demuestra disponibilidad ni paridad de precio.

## Herramienta reproducible

`scripts/banco-precios.mjs` consume el catálogo candidato local ya generado y
únicamente `VPresupuestosLin`, `VDatosLinEstr` y `VOpcionesHerraje`. Une por
documento **y** línea, y filtra las tablas mixtas a `TipoDoc=VPRES`.

Proyecta dimensiones, cantidades, códigos de estructura/series/acabados/opciones,
horas explícitas, componentes, cortes, ángulos, cantidades facturadas e importes.
Descarta descripciones, referencias, observaciones e identificadores documentales;
los casos reciben un ordinal local. No extrae personas ni obras.

Salida fija en `output/banco-precios/` (ignorada por Git): `casos.json` y
`resumen.json`. Guarda hashes de los tres CSV para identificar la fuente de cada
ejecución. **También esta salida es información empresarial; no debe versionarse.**

Tras autorización explícita para esas tres tablas y la salida técnica local:

```sh
node scripts/banco-precios.mjs export_datos/EMP0016
```

El script no ejecuta el motor de Aluminior todavía: prepara entradas y resultados
históricos minimizados para conectarlo después. No consulta una base remota ni
abre una MDB. La biblioteca pura permite comparar resultados aportados por un
adaptador, siempre que su entrada y contexto estén verificados.

## Qué se compara y qué falta

- Despiece: multiconjunto exacto de códigos, funciones, acabados, medidas/cortes,
  ángulos, cantidades y magnitudes económicas; conserva multiplicidad de piezas.
- Precio: importe total por caso, a céntimos, sólo con valoración completa y
  contexto verificado. Un precio ausente permanece ausente, nunca cero.
- La diferencia padre frente a suma de hijas por cantidad es **un diagnóstico**,
  no una fórmula que se dé por correcta. Puede haber valoración por tarifa,
  precio conservado, ajustes o partidas con reglas especiales.
- Tarifa/fecha vigentes, modo de valoración, vidrio y diseño específico no quedan
  resueltos por estos tres CSV. Se marcan expresamente desconocidos. No se presume
  tarifa 1 por datos históricos ni se seleccionan precios por proximidad de medidas.
- Todos los casos arrancan pendientes de reproducción. La comparación se niega
  mientras existan motivos pendientes, vidrio desconocido o contexto de tarifa/modo
  no verificado; igualdad numérica no implica paridad comercial general.

Para completar: resolver esos campos con evidencia de configuración o una sesión
0017; enlazar el motor mediante un adaptador local; ejecutar al menos tamaños
mínimo/habitual/máximo y opciones incompatibles por familia. Los 32 códigos sin
histórico requieren casos nuevos observados, no equivalencias por parecido.

## Verificación y autorización

Cuatro pruebas sintéticas pasan con `node --test scripts/banco-precios.test.mjs`: números
españoles, aislamiento documental y de tipos, minimización, datos incompletos,
cantidades, multiplicidad y rechazo de contexto no verificado.

La primera ejecución real llegó a la escritura y falló por permisos de carpeta.
La elevación fue rechazada por la revisión automática: las líneas históricas y
configuraciones documentales exceden la autorización anterior de cuatro tablas
de catálogo y generan datos empresariales derivados. Se detuvo hasta recibir
autorización expresa del usuario para esos tres CSV y el banco local. Con ella,
la ejecución fue aprobada y terminó correctamente: **888 casos, 14 códigos de 46**.
La salida está ignorada por Git y la comprobación de campos prohibidos encontró
cero descripciones, referencias, observaciones o identificadores documentales.

393 casos tienen alguna de las dos horas explícitas positivas; 887 tienen alguna
hija sin tarifa explícita, 214 diseño específico, 15 precio manual/respetado y
uno medidas inválidas. Todos siguen pendientes de reproducir: no hay aún ninguna
comparación ejecutada contra el motor de Aluminior ni declaración de igualdad.
