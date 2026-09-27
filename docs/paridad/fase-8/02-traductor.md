# Traductor de árboles: fijos de corredera y parejas dentro de huecos

27/09/2026. Primera unidad de la ampliación integral. No modifica valoración,
DB, migraciones ni fuentes originales. Un árbol dibujable no acredita precio,
persistencia, fabricación ni la disponibilidad del modelo en la interfaz.

## Contrato

- Resultado: ampliar el traductor puro desde datos de catálogo, conservando
  el vocabulario acreditado y rechazando variantes sin interpretación.
- Destinatario: generador de catálogo y futura selección de modelos del taller.
- Éxito: reconocer fijos NOR de familia 009 y el mismo par tipo 10 ya
  acreditado en C2 cuando un hueco padre incorpora vidrios fijos.
- Alcance: `diseno-catalogo.ts`, `diseno-catalogo-corredera.ts` y regresión
  sintética contigua. El catálogo operativo y la geometría se integran aparte.
- Protegido: manos y plantillas existentes, valoración, datos reales y MDB.
- Obligatorio: casos positivos y rechazo de variantes, causalidad ejecutada,
  conteo actual del catálogo; revisión independiente y gates por el arquitecto.
- Sin autorización en esta unidad: publicación, Supabase o cambios económicos.

## Fuentes y evidencia

Se leen únicamente tablas CSV de catálogo de `export_datos/EMP0016`. El lector
excluye todas las filas con `TipoDoc`; no se usan despieces documentales para
construir entradas. SHA-256 actual:

| Archivo | SHA-256 |
|---|---|
| FamiliasEstr.csv | `429c262d35dd62cf3afd6ef6f13144f1ec0918e8defae1a2eebe93eff17b493c` |
| Estructuras.csv | `df2652e43d38dce3305ed9ca9e873a1f43f8daa0bc7a30e287180cce57b60884` |
| EstructurasDiseño.csv | `43d678147d10370f384831688193ea387cfda0be801500fa2f9076cb3e5a9993` |
| SeriesAsocV2TiposHoja.csv | `254cb92e91d73c17ceec78f869b898d5c136165d76e989de516962549e88f3e3` |

No se afirma que esa exportación de EMP0016 sea el catálogo más reciente de
la instalación. Las versiones y otras fuentes pertenecen al inventario.

| Evidencia por clave | Interpretación y alcance |
|---|---|
| CF y FC: marco raíz `NOR`, único hijo tipo 5, sin variantes | Fijo de un hueco; ambos conservan identidad y código propios aunque su dibujo coincida |
| CFT: `NOR`, división `VI`, `bInvisible=False`, `OperacionEqui=2`, dos huecos con vidrio | Dos fijos equidistantes y parteluz visible |
| C2FI/C2FS: división exterior `HB`/`HA`, `TipoCota=1`, `Cota=300` | Distancia inferior/superior en mm; no se deriva del código del modelo |
| C2FSFI: `HA` de 300 y, en el segundo hueco, `HB` de 300 | Dos distancias independientes en divisiones anidadas |
| Pareja interior de esos tres modelos | Mismo subárbol de C2: `VI` invisible, equidistancia 2, hojas tipo 10 con nHoja 1/2 y un vidrio por hoja |

La observación de Diseño V3 en [fase 4/01](../fase-4/01-evidencia-actualizar-y-diseno-v3.md)
documenta Marco Normal → separación invisible → huecos → hojas → vidrio;
[fase 7/12](../fase-7/12-catalogo-visual-c2.md) acredita el dibujo del par C2.
La composición nueva reutiliza ese par, sin inferir carriles ni herrajes.

## Implementación y límites

- Familia 009 solo se traduce con nodos de marco, división, hueco y vidrio.
  Las mismas guardas rechazan marco 3C, perfiles omitidos, nodos desconocidos,
  árboles incoherentes y cotas no verificadas.
- Familia 001 conserva exactamente dos hojas tipo 10 dentro de un mismo
  contenedor, orden 1/2, división VI invisible equidistante y un vidrio por
  hoja. El traductor completo sigue validando el resto del árbol.
- `TipoCota=1` conserva proporciones iniciales y añade `cotaFija` con distancia
  y extremo de referencia: HA/VI inicio; HB/VD fin. Esta metadata por sí sola
  no habilita redimensionado: requiere integración de geometría, validación
  física y prueba del recorrido antes de ofrecer los modelos cotados.
- Los nombres y códigos nunca deciden forma ni mano. Permanecen opacos.

Barrido ejecutado sobre las 541 entradas: **47 → 53 candidatas dibujables**.
Las seis incorporaciones son CF, CFT, FC, C2FI, C2FS y C2FSFI. El contador no
equivale a seis modelos aceptados operativamente. C3, marcos 3C, guillotina,
hojas subdivididas y las demás variantes conservan sus bloqueos explícitos.

## Verificación ejecutada

39 casos aprobados: 21 anteriores y 18 de ampliación. Incluyen árboles
sintéticos con IDs y códigos diferentes, distancias en ambos ejes, anidación,
parteluz, manos del par, parentesco inválido, tercer hoja, carril no soportado,
superficie no simple y cota imposible.

Causalidad: sustituir temporalmente solo los dos archivos del traductor por
su versión HEAD produce **7 fallos / 18 casos** en la nueva regresión. Tras
restaurar exactamente sus bytes, **39/39** pasan. No se cambia el test durante
el experimento. Evidencia local ignorada:
`output/fase-8/traductor-causal-inicial.json` y
`output/fase-8/traductor-restaurado-inicial.json`.

```powershell
# Desde packages/core
npx vitest run src/estructuras/diseno-catalogo.test.ts src/estructuras/diseno-catalogo-ampliacion.test.ts
```

Typecheck, arquitectura, build, revisión independiente y recorrido operativo
se coordinan en el lote principal; no se atribuyen a estas pruebas unitarias.

## Bloqueos investigados y siguiente unidad

- **Ahora:** integrar los fijos sin cota en catálogo operativo; validar las
  cotas físicas antes de habilitar C2 con fijos. Tipo 16 está descrito como
  `2H_CORR`, dos hojas, perfiles de puerta y corredera en
  `SeriesAsocV2TiposHoja`; C2P reproduce el árbol simple NOR de C2 con ese tipo.
  Permite investigar una unidad de puerta corredera sin carriles especiales.
- **Después:** hojas 1/2 pendientes de resolver mano física. Las descripciones
  de `ConfigSeriesApertDesc` y `SeriesAsocV2TiposHoja` etiquetan 5/6 en sentido
  contrario a la observación de Diseño V3 de 1O2FL (tipo 5, derecha). Se revisó
  también el esquema de ConfigDis y DiseñoConfig/ConfigV2 sin hallar un mapa
  nuevo de mano que resuelva esa discrepancia. No se cambia 5/6 ni se extrapola
  el enum de asociaciones a una mano física por parecido.
- **Experimental:** marcos/carriles especiales, superficies y hojas nuevas
  requieren su interpretación específica y contraste; no se aproximan a fijo
  ni a una corredera convencional para elevar el contador.

La copia local de ConfigDis conservó el SHA-256 registrado
`132A63056E9F188F8A22B4C004E7CFA336A8E281B7D236D837307F890E63A5DD`;
solo se consultó su inventario ya extraído y se verificó el hash. No se abrió
ninguna MDB ni se ejecutó Productor durante esta unidad.
