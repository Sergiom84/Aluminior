# Productor: investigación con ClonerSoft y aplicación local

12/10/2026. Entrega desde `origin/main` `9ae7a6e`, en el worktree
`productor-clonersoft/Aluminior`. Investigación y verificación local conservadas;
publicación técnica posterior comprobada en `40cedd1`, con 0031/0032 y carga
dirigida aplicadas. El [informe de publicación](PUBLICACION-CLONERSOFT-2026-10-12.md)
registra respaldo, migraciones, CI, Render y QA remoto. No acredita aceptación
general de Productor. Registro vigente: [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).

## Objetivo y separación de fuentes

Reproducir el trabajo operativo de Productor con reglas comprobadas, sin sumar
catálogos o fórmulas por el nombre de una tabla o método. Se revisaron la copia
suministrada en `Desktop/MIX/Productor`, el repositorio `ClonerSoft/rea`, CHM,
banco existente, código, July y el relevo de otras conversaciones.

`Empresas.xml` confirma EMP0016 = 2026 y EMP0015 = 2025. La copia Anterior de
0016 tiene fecha 24/06/2026 y SHA-256
`e8518386687cb459ebfa7906c010700f6838e64d36e1bec72ecdc038123721a0`.
Coincide con el manifiesto del banco. La copia 0015 tiene SHA-256
`f85d1d2666983ef4b84500a165c25a41fdd998c36ef8639d508445ebaf38fe21`.
Se usaron sólo estas copias; no se abrió la base activa.

El export genérico EMP0016 contiene 204 tablas y un manifiesto (205 CSV),
frente a 995 tablas en la MDB. Sus filas de documentos/cerramientos proceden
de otro estado: no intercambiarlo con la copia del banco. Las 58 filas de
ConfigSeries incluyen `*`; no demuestran 58 series usadas por el taller.
La biblioteca InfoSeries es otra fuente y no define el catálogo operativo.

El checkout principal tenía código anterior, cambios ajenos y dos propuestas
de tarifas excluidas del remoto; le faltaban 0029/0030. Se trasladó únicamente
el diff propio de UI al worktree de `origin/main` y se restituyeron exactamente
los cambios transitorios del principal. Las comparaciones del diff binario y
lista de no seguidos acreditan su conservación. No publicar ese main antiguo.

## Uso efectivo de la herramienta

REA 6.4.0 verificó la identidad del assembly de estructuras: SHA-256
`71033e88beb210d575fae9969edf0543fabc2ac839e60e5f789c0880eaa67f8f`,
MVID `8b553fe1-3736-453a-b409-ecd0326c1546`.
El inventario general excedió el límite de representación; sus arrays vacíos
no acreditan ausencia de algoritmos. El parser de la fuente descargada
(commit `5190843f8f09ac17cbf79561bd1f708c509cda78`) permitió inspecciones
seleccionadas. Se transpilaron dependencias a una carpeta privada, sin modificar
ClonerSoft ni cargar/ejecutar Productor o DLL. No se eludieron protecciones.

Se distinguieron identidad CLI, resultados del parser seleccionado, lectura
MDB y corroboración de despieces. El informe y scripts reproducibles, tablas
proyectadas, huellas y extractos están exclusivamente en
`/Users/sergio/Desktop/Aplicaciones/Aluminior/output/productor-clonersoft-20261012/`,
ignorado por Git. No copiar CSV, extractos CIL ni resultados empresariales a Git.
La pasada responde preguntas acotadas; no es un análisis exhaustivo del producto.

## Hallazgos y decisiones

| Tema | Evidencia y resultado | Aplicación |
|---|---|---|
| Precio por medidas | ArticulosPrecioTabla contiene costes por proveedor/tamaño; ArticulosPrecioTablaPVP contiene venta. REA demuestra precedencia exclusiva de tabla sobre PVP plano; dos despieces de la misma copia corroboran el escalón dimensional | Selector propio limitado, conservación de marca/políticas y carga dirigida |
| Tarifa dinámica | Es un subsistema distinto de precio en tabla; hay bases e incrementos pero falta contrato completo de aplicabilidad | No importar costes por tamaño como tarifa dinámica |
| Herraje y cotas | Configuración generadora y salidas Conjuntos/Asoc/Descuentos/Opciones ya consumidas por el motor | No duplicar reglas por añadir tablas de origen |
| ConjuntosCV | Mapeos de configuración/componente, no una regla genérica de curvas y variables | No activar geometrías sin evidencia |
| Mano de obra de vidrio | Fórmula y condición de activación verificadas en métodos seleccionados y Constantes | Con los tres coeficientes a cero, no añadir los adicionales aislados |
| E1/E2/E6 | CHM y análisis acotado no resuelven precisión de despunte, unión de otra serie ni alternativa nTAcris | Permanecen abiertas; conservar sus pruebas y estados |

La regla de MO del vidrio usa perímetro, superficie y unidad en metros,
multiplica por cantidad de vidrios y suma el adicional una vez. Sin artículo
MO y al menos un coeficiente activo, Productor no genera esta partida. El
adicional no activa el cálculo por sí solo. No se cambian importes actuales.

## C1: precio dimensional y protección económica

La marca nullable de precio en tabla distingue `false` demostrado, `true` y
configuración desconocida. La migración 0031 añade marca, políticas y tabla de
PVP dimensional con RLS y revocación de permisos públicos. No asigna `false`
a las filas antiguas por defecto: requieren carga de una fuente verificada.

El selector puro admite clave exacta artículo/acabado/tarifa, las cinco
restricciones explícitamente desactivadas, un solo largo y dimensiones únicas.
Exige una fila que cubra ancho y largo pedidos y elige el menor ancho elegible.
No redondea medidas ni usa PVP plano, reserva de tarifa o normalización nueva
de acabado. Dos OrderBy en el original no prueban precedencia entre varios
largos: varias alturas, duplicados, acabados dependientes o restricciones
especiales quedan incompletos. Una fila con precio cero explícito es distinta
de ausencia; una ausencia nunca se convierte en cero.

Coste dimensional sigue sin selector contrastado; el coste plano de un artículo
por tabla permanece desconocido. Una venta resuelta no acredita margen ni
fabricación. Las medidas UD dimensionales se conservan en el despiece.

El lector compartido se usa en catálogo, contención de fallback anterior y
artículo suelto. La ruta de artículo admite medidas opcionales documentadas en
CHM; falta de medidas o tabla mantiene precio/total nulos. La cantidad aplica
al precio unitario elegido; guardar y reabrir conserva el snapshot. 0032 guarda
el acabado solicitado, sin sustituirlo por UNI de la tarifa: se conserva en
fila, edición de cantidad, copia/revisión y PDF. Históricos quedan nulos. La edición
actual de artículo sigue limitada a cantidad y referencia, sin cambio de medidas.

`etl:precio-tabla` es una carga dirigida local, simulación por defecto y
transacción con verificación del contenido protegido. Usa exclusivamente
Articulos + ArticulosPrecioTablaPVP de la misma copia. Actualiza metadata de
artículos existentes y su tabla dimensional; no sustituye el importador completo.
Los CSV proyectados directamente de la copia tienen manifiesto y huella pre/post.

## P.6/P.7: interfaz y evidencia de tarea

| Tarea | Productor | Aluminior y prueba requerida |
|---|---|---|
| Introducir línea | CHM 5_3_1_3_lineas.htm:126, F7 | F7 enfoca el configurador existente y conserva modo/borrador; no crea documento |
| Grabar ficha | Observación RECON-DETALLE-PRESUPUESTO.md:24, F9 | F9 envía sólo cabecera con foco y submit habilitado; no se extiende a líneas/gastos |
| Elegir cliente | Código canónico y búsqueda por prefijo/fragmentos ya implementados | Invalidación inmediata, respuesta obsoleta descartada, error/reintento y recuperación de foco |
| Editar cerramiento | Mismo documento y confirmación/cancelación contextual | Foco inicial, error al campo/alerta y retorno al cerrar |
| Artículo por medidas | CHM 5_3_1_3_1_articulos_sueltos.htm:136/142 | Ancho/alto opcionales, selección dimensional compartida y persistencia |

F9 se bloquea con selector desplegado, modal, envío, repetición, composición o
modificadores. Se retiró la indicación F9 del enlace que sólo vuelve a la lista.
Una revisión independiente detectó pérdida de foco en Reintentar; la corrección
devuelve foco a la entrada antes de desmontar el botón. No hay rediseño ni CSS
nuevo. La comparación usa CHM/observación/snapshots, no Productor vivo en este Mac.
No cerrar aceptación integral, zoom 200% o reduced motion por estas pruebas.

## Verificación local anterior a la publicación

Revisión independiente económica y de UI, una corrección de cada lote y gate
final del arquitecto. Se corrigieron booleanos con mayúsculas, tarifas
fraccionarias, cotas que numeric(10,3) redondearía y el bypass de precio plano
en uniones de la vía anterior. Los SQL 0031/0032 finales no se modificaron
después de aplicarlos en la base nueva de la verificación.

| Comprobación final | Resultado |
|---|---|
| Core | 57 archivos, 654 pruebas correctas |
| DB | 4 archivos, 56 pruebas correctas; base local nueva y 33 migraciones |
| ETL | 14 archivos, 112 correctas y una condicionada a CSV privado; base propia separada |
| Web | 125 archivos, 822 pruebas correctas |
| Navegador automatizado | 10 recorridos correctos, escritorio 1440×900 y móvil 390×844 |
| Tipos / arquitectura / build | Cuatro paquetes y E2E correctos; 787 archivos, 397 módulos, cero infracciones; Next build correcto |
| Banco histórico medido de nuevo | 400 iguales, 81 cercanas, 5 distintas y 37 sin valorar de 523; cero errores, 434 exclusiones conservadas y sin regresión |
| PVP real dirigido | Dos precios de despiece coinciden usando valorarArticulo en transacción READ ONLY; no se valoró el padre manual ni se inventó su serie ausente |
| Carga local dirigida | 17.547 metadata actualizadas y dos PVP dimensionales; contenido de las 11 tablas protegidas idéntico |
| QA manual local | Alta de artículo con medidas decimales, acabado, cantidad, guardado, recarga, F7/F9 y PDF descargado/renderizado; capturas escritorio/móvil preservadas |
| Supabase, sólo lectura | 31 migraciones hasta 0030, 14 presupuestos y cinco líneas; tabla dimensional aún ausente. Los 17.547 códigos coinciden con la fuente por huella ordenada |

La primera ejecución E2E encontró un selector del test que también alcanzaba
el anunciador interno de Next. Se acotó a la alerta de búsqueda y se repitió
el gate completo: 10/10. El aviso de hidratación observado en el navegador
interno contiene atributos DarkReader de la extensión; el harness sin ella
pasa. No se alteró la extensión ni se atribuyó aceptación visual integral.

Logs crudos, resultados detallados y capturas se conservan en el output privado
mencionado arriba. El resultado nuevo del banco es independiente del anterior;
no se sobrescribieron historia, exclusiones ni fuentes.

## Publicación técnica completada

Autorización recibida y ciclo remoto ejecutado el 12/10/2026; véase el
[informe de publicación](PUBLICACION-CLONERSOFT-2026-10-12.md). Render live
`40cedd1`, terminado a las 19:31:21 Europe/Madrid; 33 migraciones y carga
dirigida de 17.547 metadatos/dos PVP comprobadas. Ambos workflows de CI del
commit publicado finalizaron correctamente. Restauración completa del respaldo
ensayada localmente; seguridad de la tabla nueva verificada en Supabase.

La aceptación final publicada y la conservación de la proyección previa
terminaron con exit 0: tres documentos QA con nombre libre, siete líneas,
tres recibos, precio por medidas, acabado, cantidad, recarga, copia/revisión
y PDF. El caso sin medidas permanece sin valorar. Datos anteriores intactos;
importes empresariales e identificadores quedan en los recibos privados.

Las instrucciones de autorización, migración y carga que seguían aquí ya
se ejecutaron; se retiran para impedir su repetición. La reversión vigente
requiere mantenimiento/lectura y bloqueo de escrituras antes de volver a
una versión compatible; conservar columnas, journal y líneas nuevas, y
restaurar sólo los metadatos/PVP afectados. Volver sólo a código antiguo
puede perder acabados en copias y eludir la contención de precio plano.


Siguiente abierto: matriz pendiente de P.6/P.7 (otras anchuras, zoom 200%,
reduced motion y recorrido humano comparativo). C1 está publicado y verificado
técnicamente en su alcance acotado; no repetir extracción, 0031/0032, carga,
publicación ni gates local/remoto entregados. E1 conserva su procedimiento
Windows; E2/E6 y aceptación comercial no se cierran por esta entrega.
