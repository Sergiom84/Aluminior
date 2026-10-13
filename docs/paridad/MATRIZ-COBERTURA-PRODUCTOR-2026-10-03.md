# Matriz de cobertura y ensayos mínimos de Productor

> Referencia fechada; conservar evidencia y límites. No ejecutar sus pendientes o permisos como instrucciones actuales. Consultar el [roadmap vigente](../../ROADMAP-PARIDAD-PRODUCTOR.md).

03/10/2026. Revisión del checkout `08310cb`, del relevo de la raíz, del banco
local y del último «RELEVO DEL MAC» del documento compartido. Primera entrega
de la continuación: investigación y contraste; ninguna regla del motor cambia.


## Resultado de esta lectura

La [matriz generada](COBERTURA-MODELO-SERIE-2026-10-03.md) contiene **97 pares
modelo/serie observados**, incluidos excluidos y combinaciones de series en
GRUPO. Cada par elegible tiene diez campos de contraste, fuente/implementación
relacionada y siguiente prueba enlazadas abajo. No es el producto cartesiano del
catálogo ni una matriz de compatibilidad: no se generaliza lo no observado.

Se reconstruyó `banco.json` desde `tablas.json`, verificando recuentos del
manifiesto, huellas de todos los CSV del catálogo, identidades y elegibilidad.
Se leyeron los despieces del motor ya guardados en `resultados.json`; **no se
volvió a ejecutar la valoración**. 957 candidatas = 434 excluidas + 523 elegibles.
El resultado económico sigue siendo 400 iguales, 81 cercanas, 5 distintas,
37 sin valorar y cero errores. Las huellas exactas están en el informe generado.

| Control de despiece por línea | Coincide | Difiere | Sin contraste |
|---|---:|---:|---:|
| Multiconjunto de artículos | 440 | 46 | 37 |
| Cantidades, con todos los artículos presentes | 440 | 0 | 83 |
| Cortes, con todos los artículos presentes | 436 | 4 | 83 |
| Unidad de medida | 440 | 0 | 83 |
| Acabado literal | 5 | 435 | 83 |
| Metraje | 432 | 8 | 83 |
| PVP | 379 | 61 | 83 |
| Importe de fila | 368 | 72 | 83 |
| Coste unitario | 0 | 348 | 175 |
| Función completa de todas las piezas | 0 | 0 | 523 |

**360/523 coinciden simultáneamente en precio, artículos, cantidades, cortes y
unidades.** 436/523 coinciden en esos campos de despiece sin exigir el precio.
Si se exige además acabado literal, quedan 5/523; esto es un criterio de
identidad de campos, no una nueva tasa de aceptación de fabricación.
En los resultados a precio igual se observaron discrepancias `UNI → L` en
herrajes, vidrio y MO. Debe demostrarse si proceden de selección efectiva,
acabado universal de tarifa o representación del snapshot; no se normalizan
silenciosamente ni se atribuye su diferencia al precio sin prueba.

Las funciones históricas vacías aparecen frente a JUNQ/JINT/JEXT y MO en la
salida web. Vacío no significa función diferente ni permite inventar un enlace
semántico. Se mide artículo sin función y se deja esa columna sin contraste.
MO/MOCOL tienen la normalización de función ya usada por el banco.

Estos controles son conservadores: si falta/sobra una pieza, los otros campos
de la línea quedan sin contraste; si el servicio no valoró, su despiece parcial
no acredita igualdad. No incluyen ángulos, mecanizados, coste total ni margen.
Las discrepancias de coste no prueban una regla de venta. Los recuentos de
campos no se suman como causas independientes.

El inventario verificado contiene 541 códigos de estructura y 58 series.
512 modelos y 43 series carecen de línea **independiente elegible** en este banco;
algunos están presentes dentro de GRUPO. Un dibujo disponible, una factura
catalogada o un elemento interno no prueban valoración independiente.

## Fuentes y separación de niveles

| Fuente | Uso en esta entrega | Límite |
|---|---|---|
| [Banco vigente](BANCO-CONTRASTE-2026-10-03.md), iteraciones 1–13 | Evidencia de entradas, correcciones y contraste económico | 400/523 se refiere a una copia local, no a producción |
| [Reglas de fase 7](fase-7/06-reglas-catalogo-despiece-completo.md) | Asociaciones, cortes, vidrio, MO y metraje contrastados | Recuentos de facturas son históricos y algunos usan cortes observados para aislar una regla |
| [Investigación de fuentes](fase-7/02-investigacion-fuentes-2026-09-27.md) | Catálogo, bibliotecas y CHM 5.1.2.12/13 | ConjuntosDescuentosDif y parte de cabeceras de acristalamiento siguen pendientes |
| [Barrido de facturas](fase-7/05-primer-barrido-facturas-2026.md) | Inventario y relaciones documentales | No se reutilizan sus 715 enlaces como procedencia certificada; falta validar TipoOrigen/TipoDocOrig |
| `export_datos/banco-contraste/` | Banco, despieces de referencia/motor y CSV con huellas | Privado e ignorado por Git; no es entrada del motor del producto |
| July, pendiente 212, sync_uid `598335364cc40675dda76c8260f4d37d` | Último relevo del Mac, decisiones y límites de ensayos | ID local; el contenido antiguo conserva 380/523, sustituido por el relevo final |
| [Documento compartido](https://docs.google.com/document/d/1rgwt5oFt1beE7sePN8dINo1cicgjqkl1lTH9VCue4-U/edit) | Lectura completa, especialmente último relevo | No reactiva permisos, cargas ni instrucciones de su etapa inicial |

Observado/configurado, implementado, contrastado y aceptado son estados
distintos. Las pruebas sintéticas protegen el código; no sustituyen Productor.
Los rangos de variantes del informe incluyen excluidos y no acreditan todos los
valores intermedios. En esta copia solo aparecen nTAcris 0/1 y tarifa 1.

## Reglas, implementación y siguiente prueba

Los enlaces R1–R11 sirven para cada fila modelo × serie × campo del informe.
R4–R8/R12–R15 completan ramas cuya procedencia no se puede determinar solo
desde el multiconjunto final. No se atribuye una coincidencia de campo a una
asociación o receta concreta sin trazabilidad de su origen.

<a id="r1"></a>
**R1. Cortes, referencias, descuentos y cotas.** Fuente: EstructurasArticulos,
ConjuntosDescuentos y detalle de instancia; [fase 7](fase-7/06-reglas-catalogo-despiece-completo.md).
Implementación: [cortes-referenciados.ts](../../packages/core/src/despiece/cortes-referenciados.ts),
con [pruebas](../../packages/core/src/despiece/cortes-referenciados.test.ts), y
`despiece/linea-catalogo/diseno.ts`. Evidencia: abatibles con batiente central y
correderas HVL/HVC; C2/C2P/C4, PC2 y abatibles citados en fase 7. Iteraciones 7/9
añaden cotas y batiente. Ramas B3, hojas independientes, curvas o descuentos
diferenciales no se dan por cubiertas. Siguiente: E7 (fracciones) y E9 (frontera
de referencia/división), comenzando por los cuatro contrastes de corte distintos.

<a id="r2"></a>
**R2. Artículos, cantidades, asociados y funciones.** Fuente: Conjuntos,
ConjuntosAsoc, FamiliasGruposAsoc, SeriesAsocV2TiposHoja y CHM 5.1.2.12.7.7.1.
Implementación: [evaluar.ts](../../packages/core/src/despiece/asociaciones/evaluar.ts)
y [pruebas](../../packages/core/src/despiece/asociaciones/evaluar.test.ts).
Cubierto por evidencia: elementos de marco/hoja, virtuales A/L, artículo
principal y filtros de tramo/mano/opción; fase 7 detalla pares ELEGANTPVC,
GMC400, GMA350 y GMPC65/76R, con límites en 3HO/2O+1OFI.
Las funciones vacías del histórico y las ramas no ejercitadas quedan abiertas.
Siguiente: E8 para el límite real del herraje y revisión privada de las 46
líneas con multiconjunto distinto; no aceptar solo el precio.

<a id="r3"></a>
**R3. Acabado principal, accesorios y acabado efectivo del artículo.** Fuente:
Acabado/Acabado2, selectores de asociación y ArticulosPVP. Iteraciones 1/11
demuestran transmisión del segundo acabado y ámbito del vidrio.
Implementación: `despiece/linea-catalogo/` y adaptador
`web/.../_lib/estructuras/catalogo-despiece/`, pruebas de integración existentes.
La coincidencia literal queda en el informe; `UNI → L` no se declara equivalente.
Siguiente: E10, un artículo con PVP universal y uno con PVP específico, observando
acabado de pieza y fila de precio efectivamente seleccionada sin editar catálogo.

**R4. Opciones de herraje.** Fuente: VOpcionesHerraje,
ConjuntosOpcionesHerraje.SelecDefSN y CHM 5.1.2.12.7.7.2. Implementación:
[opciones.ts](../../packages/core/src/despiece/asociaciones/opciones.ts),
probada en evaluar.test.ts. Iteración 12: valores por defecto solo cuando no hay
selecciones guardadas para ese conjunto. Las variantes de selección están en
el banco privado; contar documentos con opciones no valida todas las ramas.
Siguiente: E8, misma estructura con selección guardada distinta del defecto.

**R5. Vidrio, junquillos y juntas.** Fuente: TAcristalamientoLin,
Conjuntos.TablaHojas/TablaFijos, artículo/espesor y CHM 5.1.2.12.5.1.
Implementación: [acristalamiento-catalogo.ts](../../packages/core/src/despiece/acristalamiento-catalogo.ts)
y su test; `linea-catalogo/vidrios.ts`. Cortes de vidrio y juntas brutas tienen
contraste en fase 7. No se acreditan por ello grapas/calzos, todos los galces ni
la economía dinámica de doble acristalamiento. Siguiente: E6 con hoja/fijo y
espesor constantes; después límites de espesor reales de la tabla.

**R6. Alternativa nTAcris.** Iteración 3: 0 implícito y 1 explícito identifican
la primera opción en esta copia; 47 coincidencias exclusivas, otras 31 no
discriminantes. Implementación:
[acristalamiento.ts](../../scripts/lib/banco-contraste/acristalamiento.ts) y test;
la web lista hasta cinco opciones en acristalamiento-serie.ts. Solo el adaptador
del banco rechaza 2..5 sin mapeo; no se afirma que toda la web carezca de opciones.
Siguiente: E6, registrar posición, nTAcris y tablas guardados para 1/2/3.

**R7. Compacto, cajón, vuelos, guía central y accionamiento.** Fuente:
VAccesorios/VOpciones, EstructurasArticulos.OPCformulaSelec y CHM 5.1.2.13.1.1.
Implementación: [compacto.ts](../../packages/core/src/despiece/linea-catalogo/compacto.ts)
y [test](../../packages/core/src/despiece/linea-catalogo/compacto.test.ts).
Iteración 4: alto ventana+cajón 357/357; ancho+vuelos 354/357; MOCOMP 356/357.
Guía central/motor tienen fixture sintética, no aceptación general del taller.
Descuento vertical adicional bloquea. Siguiente: E5 y, solo si la rama lo exige,
comparación G1/G10 con una opción cambiada y mismos acabados.

**R8. Mosquitera/tapajuntas.** Fuente: accesorios de línea, opciones de lados y
plantillas; iteración 8. Implementación: mismo módulo compacto.ts y
[adaptador](../../scripts/lib/banco-contraste/accesorios.ts), ambos con tests.
Ventana/CAJ tienen evidencia; quitar inferior no demuestra cómo se acorta cada
lateral. Siguiente: E4 para GMT004; no reemplazar L+CAJ+2·ala por una hipótesis.

<a id="r9"></a>
**R9. Unidad, metraje, mínimos, múltiplos e importe.** Fuente: Articulos,
ArticulosIncrPrecio y CHM 5.1.2.1.1/7.5.2.1; fase 7 e iteración 10.
Implementación: [importe-fila.ts](../../packages/core/src/precios/importe-fila.ts)
y [pruebas](../../packages/core/src/precios/importe-fila.test.ts).
UD por cantidad, ML a dos decimales por pieza, M2 por lados redondeados a
múltiplos, mínimo e incremento aplicado al PVP. ML con mínimo/múltiplo permanece
sin contrastar y bloquea. Siguiente: E5 para COMPVAL y E11 a ambos lados de un
mínimo/múltiplo/incremento que realmente exista; no usar un límite inventado.

<a id="r10"></a>
**R10. PVP, tarifa y fecha.** Fuente: ArticulosPVP por artículo/acabado/tarifa;
[banco](BANCO-CONTRASTE-2026-10-03.md), sección Fecha y tarifa.
Implementación: `web/.../estructuras/pvp-articulos.ts`,
[pvp-catalogo.ts](../../packages/core/src/precios/pvp-catalogo.ts) y test.
Solo tarifa 1 contrastada aquí. La fecha posterior no permite reconstruir una
tarifa antigua; las 58 cercanas históricas atribuidas a actualización no se
«corrigen» cambiando PVP. Siguiente: E10 y contraste con tarifa vigente; falta de
PVP/ambigüedad conserva nulo.

<a id="r11"></a>
**R11. Coste.** Fuente: ArticulosCoste y coste guardado; implementación:
`web/.../estructuras/coste-articulos.ts`, coste-despiece.ts y sus tests,
`core/precios/coste-catalogo.ts`. Los ceros/nulos históricos impiden derivar
márgenes; cero coincidencias completas de coste unitario no mide PVP.
Siguiente: cotejar procedencia/fecha/unidad de compra en copia y catálogo antes
de pedir un ensayo visual o modificar la valoración.

**R12. Mano de obra.** Fuente: infMOmof, MOConceptos y horas explícitas;
[spec](SPEC-MANO-DE-OBRA.md), fase 7 e iteraciones 5/7. Implementación:
mano-obra-fabricacion.ts y test, `web/.../mano-obra/` y horas-por-unidad.ts.
117/117 independientes con cantidad>1 facturan MOCOL por unidad; GRUPO cobra
ajustes por línea. No inferir horas manuales. Siguiente: E3 con cantidad 1/2,
MO base y horas separadas si el caso de comisión no discrimina su ámbito.

**R13. Comisión.** Fuente: VPresupuestos.ComisionPorc/SumarComisionSN,
Gastos observados e iteración 6. Implementación:
[comision.ts](../../packages/core/src/precios/comision.ts), test, servicio de
Gastos y migración existente 0027. Despiece base, factor de cabecera al precio;
copia conserva gastos. Orden exacto de redondeo y cambio sobre líneas guardadas
siguen pendientes; la web rechaza cambiar comisión sumada con líneas valoradas.
Siguiente: E3. Los seis residuos de céntimos del relevo son candidatos solapados.

**R14. Despunte.** Fuente: cabecera Despunte y pantalla Gastos; diez elegibles
bloqueadas por el adaptador. [Avance del 04/10](EVIDENCIA-E1-DESPUNTE-2026-10-04.md):
manual y 13 documentos positivos con detalle acreditan resta de costes
guardados en otra copia, sin discriminar redondeo; se preservan discrepancias.
No hay regla completa del reparto económico; el coste técnico de corte no la
sustituye. A–F del 04/10 conserva sustitución, repetición y reapertura en 0017.
Residuo B/D explicado por margen GID 0,01 % sobre coste. Complementario
G1–G5 demuestra alta independiente tras cargo y reparto por bases sin cargo,
frente a reparto igual/precios cargados; persistencia verificada. Tres políticas
de redondeo coinciden en G4. G6-incidencia: variante1207 mostró error de opciones
y añadió tercer GRUPO; previos intactos, sin recálculo. Siguiente: autorización
para retirar solo tercer GRUPO y verificar edición sin alta antes de precisión.
No repetir A–F ni G1–G5; catálogo/banco sin cambios.

**R15. GRUPO, uniones y medidas fraccionarias.** Fuente: VCerramientos/Lin,
medidas económicas de cada elemento y catálogo de unión; iteración 13.
Implementación: validar-configuracion-cerramiento.ts y test,
valorar-cerramiento.ts y pruebas de integración; geometria.ts del banco.
31 grupos pasan configuración, 20 iguales, 11 sin valorar por otras causas.
U solo con cero explícito. Ocho de esos once requieren unión material de otra
serie; no extrapolar U. Geometría y medidas económicas se conservan separadas.
Siguiente: E2 y E7; sigue pendiente la regla de reparto de grosor observada en
[cerramientos](RECON-CERRAMIENTOS.md).

## Ensayos mínimos y coordinación

La conversación **«Observar ensayos de Productor»**
(`01a10373-08ce-7590-945b-6aa2b8b76944`) llegó a insertar una ventana 1200×1200,
pero su último cierre solicita visibilidad de Productor: no confirma modelo,
serie, acabado, vidrio ni resultados. «Observar contrastes en Productor»
(`01a1030f-1467-7c21-8aac-138abd417bef`) preparó el relevo de raíz. Estado leído
durante la entrega del 03/10 (antecedente histórico): ambas conversaciones inactivas; no se operó el programa,
no se les enviaron mensajes ni se copió la base abierta 0017.

La [lista priorizada](ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md) conserva E2–E7
pendientes de evidencia y E8–E11 condicionados a ramas no cubiertas. E1 tiene
observación A–F y complementario G1–G5 del 04/10; precisión pendiente con
G6-incidencia preservada antes de recuperar ensayo dos líneas. Alta
independiente e importes distintos ya contrastados.
Estado vigente en el roadmap; no repetir resultados entregados. Antes de retomar 0017 comprobar progreso del
operador, selector de empresa y documento nuevo. Obtener copia estable solo
coordinando su cierre; 0016/0015 siguen en consulta.

## Reproducción y verificación

```powershell
node --import tsx scripts/cobertura-productor.ts
node --import tsx --test scripts/lib/banco-contraste/*.test.ts scripts/lib/cobertura-productor/*.test.ts
npx tsc -p scripts/tsconfig.banco-contraste.json --noEmit
npm run check:architecture
```

El generador no carga .env, no abre MDB, no conecta a PostgreSQL ni revalora.
Reconstruye la extracción técnica y analiza los resultados existentes; solo
escribe el informe agregado en su destino permitido. Capturas, identificadores,
filas y valores documentales individuales permanecen fuera de Git.
Verificación ejecutada y límites finales: consultar el añadido de esta entrega
al banco. Las migraciones, el catálogo, la UI y el motor conservan su contenido.
