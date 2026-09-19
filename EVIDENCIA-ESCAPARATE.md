# Escaparate: clasificación y generación conservadora

19/09/2026. Fase 2 de `PLAN-SIGUIENTE.md`, **parcial; no habilita estructuras nuevas**.

## Fuentes y alcance

- Exportación histórica local `export_datos/EMP0016/`: únicamente
  `Estructuras`, `EstructurasDiseño` y `FamiliasEstr`. No MDB ni tablas de
  clientes/documentos. Las filas de diseño con `TipoDoc` se excluyen.
- `PARIDAD-PRODUCTOR.md`, vocabulario implementado; las 14 composiciones
  manuales actuales como control, no como autoridad frente a evidencia contraria.
- `RECON-CERRAMIENTOS.md` §2: orden de las primeras categorías observado en
  la 0017. Resto: `FamiliasEstr.EscaparateSN/OrdenEsc`, sin observación visual nueva.
- La exportación es de julio. Sus **40** registros de familia 020 no confirman
  las **42** oscilobatientes citadas en el relevo. No se han confundido con las
  42 de familia 003. Hay que contrastar el catálogo actual de la 0017.

## Qué se ha construido

`diseno-catalogo.ts` recibe catálogo normalizado y genera una composición
visual o motivos explícitos de rechazo. No accede a ficheros ni base de datos.
Reconstruye jerarquía y posiciones desde filas, nunca descifra el código.

Vocabulario conservador: marco NOR, nodos 1/2/3/5/6, hojas 5/6 (mano
oscilobatiente), 7/8 con `nHoja` 1/2 (equivalencia experimental con etiquetas
de `2` y `2O`, pendiente de auditar su mano física),
travesaños HA/HB/VI/VD, divisiones equidistantes y cotas de tipo 1.
Otras hojas, variantes, marcos, nodos huérfanos, duplicados, divisiones
incoherentes y cotas no verificadas quedan pendientes. Se limita profundidad.

**Dibujable significa candidata a la medida inicial**, no valoración correcta,
paridad visual completa ni disponibilidad comercial. Una cota fija se proyecta
a proporción; mantenerla absoluta al redimensionar exige ampliar el modelo.
No se debe cargar este JSON como catálogo operativo antes de resolverlo.

`scripts/clasificar-escaparate.mjs` y `scripts/lib/catalogo-diseno.mjs`
producen artefactos locales en `output/escaparate/` (ignorado por git):

- `catalogo.json`: cada código, familia, composición candidata o motivos.
- `resumen.json`: recuentos por familia (incluida la familia vacía).
- `control-golden.json`: comparación de las 14 plantillas, sin ocultar divergencias.

No se versiona un volcado de catálogo. No se crean tablas ni se escribe en
Supabase. Para regenerar, con acceso autorizado al CSV:

```sh
npx tsx scripts/clasificar-escaparate.mjs
npx tsx --test scripts/control-escaparate.test.mjs
```

El segundo comando comprueba coincidencias y discrepancias conocidas; **no es
un resultado de 14 dibujos iguales**. Sin exportación local, omite los controles.

## Recuento medido: 541 estructuras

46 candidatas visuales iniciales; 495 pendientes. Los motivos son acumulables;
la tabla resume los principales. El detalle por código permanece en el JSON
local para no incorporar el catálogo real completo al repositorio.

| Familia | Total | Candidatas | Pendientes | Motivos principales |
|---|---:|---:|---:|---|
| Sin familia | 4 | 0 | 4 | Sin árbol ni dimensiones |
| 001 Correderas 90º | 20 | 0 | 20 | Hojas correderas, familia sin verificar |
| 002 Puertas correderas | 15 | 0 | 15 | Hojas correderas |
| 003 Ventanas abatibles | 42 | 18 | 24 | Hojas 1/2/21/22/45/58, cotas, apertura exterior |
| 004 Balconeras | 31 | 0 | 31 | Marcos PTA y hojas de puerta |
| 005 Fijos abatibles | 8 | 7 | 1 | `04F`: contenido múltiple sin división |
| 006 Mallorquinas | 42 | 0 | 42 | Nodo 9 y hojas no modeladas |
| 007 Plegables | 75 | 0 | 75 | Hojas plegables y nodo 9 |
| 008 Barandillas | 8 | 0 | 8 | Sin árbol ni dimensiones |
| 009 Fijos corredera | 6 | 0 | 6 | Familia y marcos especiales |
| 010 Curvas/inclinadas | 25 | 0 | 25 | TipoCurva |
| 011 Perimetrales | 11 | 0 | 11 | Hojas correderas, nodo 4, marco 3C |
| 012 Elevables | 11 | 0 | 11 | Hojas correderas/elevables |
| 013 Monocarriles | 21 | 0 | 21 | Perfiles laterales omitidos, nodo 9, hojas |
| 014 Osciloparalelas | 12 | 0 | 12 | Marcos PTA y hojas 55/56/64 |
| 015 Pivotantes | 2 | 0 | 2 | Hojas 23/69 |
| 016 Vaivén | 6 | 0 | 6 | Marcos PTA/VEN y hojas |
| 017 Minimalistas | 6 | 0 | 6 | Marco 3C y correderas |
| 018 Cortina cristal | 6 | 0 | 6 | Perfiles laterales omitidos y correderas |
| 019 Techos móviles | 4 | 0 | 4 | Hojas 85/86 |
| 020 Oscilobatientes | 40 | 21 | 19 | Marcos PTA/hojas de puerta, hoja 9/21 y duplicados |
| 021 Puertas calle | 12 | 0 | 12 | Marco PTA, sin inferior, hojas de puerta |
| 100 Compactos | 17 | 0 | 17 | Sin árbol; otro modelo de accesorio |
| 101 Mosquiteras | 4 | 0 | 4 | Sin árbol; otro modelo de accesorio |
| 102 Tapajuntas | 24 | 0 | 24 | Sin árbol; otro modelo de accesorio |
| 103 Uniones | 52 | 0 | 52 | Sin árbol; otro modelo de unión |
| 106 Bandejas | 6 | 0 | 6 | Sin árbol |
| 107 Condensaciones | 7 | 0 | 7 | Sin árbol |
| 111 Barrotes | 1 | 0 | 1 | Sin árbol |
| 112 Tubos/ángulos | 6 | 0 | 6 | Sin árbol |
| 113 Mamparas | 17 | 0 | 17 | Sin árbol |

Los fijos nuevos candidatos son `03H`, `03V` y `06`. Los 19 oscilobatientes
pendientes: `2OFLFSFI` (IDs duplicados), `2OFSFIFL` y `2OI` (hoja 9),
`1O+VS` (hoja 21), `2OP`, `2OP+VS`, `2OP2FL`, `2OPD`, `2OPFS`, `2OPFSFL`,
`2OPI`, `1OP`, `1OP+1OBAN`, `1OP+VS`, `1OP1FL`, `1OP2FL`, `1OP2FLFS`,
`1OPD`, `1OPI` (marco PTA y hojas de puerta; algunas también con variantes).

## Las 14 plantillas no son un golden coherente con los datos

La comparación ignora IDs arbitrarios y el anidamiento de divisiones
colineales, pero mantiene aperturas, orden, proporciones y tipo de separador.
Se comparan medidas predeterminadas por separado.

| Control | Dibujo inicial | Medidas | Qué falta contrastar en la 0017 |
|---|---|---|---|
| 0, 02H, 02V, 04, 1OD, 1OI, 2, 2O | Coinciden | Coinciden | Verificación visual final |
| 1OFI | Coincide | Difieren | CSV 900×1500 frente a manual 800×1500 |
| 1O1FL | Difiere | Difieren | Proporción derivada de medidas iniciales |
| 1O2FL | Difiere semánticamente | Difieren | Hoja 5 derecha; etiqueta manual izquierda, compensada por renderer invertido; proporciones pendientes |
| 1O+1F+1O | Difiere | Difieren | CSV travesaños visibles y ambas hojas 5; manual invisible/manos distintas |
| 1O+2F+1O | Difiere | Difieren | CSV hojas en huecos 2 y 4; manual 1 y 4; travesaños |
| 2O+ FIJO | Difiere | Difieren | CSV pareja tipo 8 como 2O; manual dos oscilobatientes; altura 1200/1500 |

El estado anterior a cambios queda registrado: ocho coincidencias completas,
una diferencia solo de medidas y cinco diferencias de dibujo y medidas.
La sesión principal observó después en la **0017**, ficha de `1O2FL`, dos
fijos laterales y la hoja central con manilla a la izquierda (bisagra derecha).
En Diseño V3 el árbol dice literalmente **`Hoja (1 H.Oscilo. Dchas.)`** y
el panel Estructura muestra **1300×1200**; Aluminior parte de 1400×1200.
No se guardó ni aceptó ningún cambio en Productor.

La inspección del código reveló una **doble inversión**: la etiqueta manual
`oscilobatiente-izquierda` de 1O2FL dibuja bisagras a la derecha porque web y
PDF interpretan los nombres de mano al revés. El dibujo actual de 1O2FL por
tanto ya coincide cualitativamente; el defecto demostrado es semántico, no
un fallo visual de esa miniatura. Corregir globalmente sin auditar todas las
parejas 2/2O introduciría regresiones. Se mantienen renderer, PDF y las 14
composiciones anteriores. No se cambiaron para hacer pasar los controles.
Las ocho coincidencias del control comparan etiquetas/geometría, **no prueban
mano física correcta**. También deben revisarse los mapeos 5/6/7/8 del
generador experimental antes de usar sus salidas en la interfaz.
Resolver las divergencias restantes mediante observación es condición para
sustituir las composiciones manuales.

## Cambio operativo limitado

El escaparate mantiene las mismas 14 estructuras. Ahora clasifica por el
código real de familia y separa OSCILOBATIENTES (020) de VENTANAS ABATIBLES
(003); usa los nombres/orden de `FamiliasEstr`. Las familias sin soporte
siguen vacías. La categoría inicial se busca por contenido real.

No se ha comparado precio de nuevas estructuras ni activado ninguna. Faltan:
observación 0017 de discrepancias, geometría a varias medidas con cotas fijas,
comparación despiece/precio, carga del catálogo validado e inspección de cada
estructura nueva en escritorio/móvil. La fase 2 no está terminada.

## Verificación de interfaz comunicada por la sesión principal

- Escritorio 1440×900: categorías actualizadas visibles; miniatura 1O2FL
  contrastada cualitativamente, con la salvedad semántica anterior.
- Móvil 390×844: ancho de documento 375 px, sin desbordamiento horizontal.
- Teclado: flecha izquierda desde Acristalamiento selecciona Opc.Herraje,
  saltando Cargos Adic. deshabilitada (trabajo paralelo de fase 1).
- No se compara ni afirma precio de nuevas estructuras. La carga remota del
  editor se completó posteriormente con autorización y verificación visual;
  consultar `VERIFICACION-CODEX-2026-09-19.md`.

Pruebas: suite core completa **377/377** y typecheck de core correctos.
Tras delegar el usuario la continuidad de la investigación funcional, se
reejecutó `node --import tsx --test scripts/control-escaparate.test.mjs`:
14 controles aprobados, ninguno omitido. Esto acredita que se mantienen
las ocho coincidencias y seis divergencias documentadas, no paridad plena.
