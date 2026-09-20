# Continuación de arquitectura B2 y encargo preparatorio a Sol

> Revisión documental 20/09/2026: **Relevo histórico**. Preparación B2 y cierre acotado 1OFI; no reactiva delegaciones antiguas.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

## Estado y contrato
Repositorio real C:/Users/laral/Documents/Aluminior, rama feat/cerramientos-editor-linea.
La copia OneDrive/Documentos y el proyecto guardado de Codex NO son esta rama.
Base funcional 3a40b25, con B1 integrado en 9727fe2 (origen Sol 63b9bea).
Verificar ascendencia de 3bbe321, f4ca3a6 y edfc346 antes de trabajar.
No tocar env.example sin seguimiento ni leer/copiar secretos. A y B1 terminados.
Leer AGENTS.md, CLAUDE.md, RELEVO-SIGUIENTE-SESION.md y sus referencias;
después VERIFICACION-MANOS-B1.md y EVIDENCIA-COTAS-0017.md.
El usuario autoriza tareas nuevas Sol, worktrees aislados y revisión del arquitecto.
No nuevas cargas remotas/Supabase, push o merge a main. Avisar antes de acciones
irreversibles. No activar estructuras porque se dibujen ni inferir precios cero.

## Encargo independiente Sol: preparación técnica B2
Todavía falta evidencia de segunda medida. Este encargo NO implementa reglas de
cotas: entrega una propuesta verificable para que el arquitecto cierre el alcance.
Worktree exclusivo C:/Users/laral/Documents/Aluminior-worktrees/preparacion-cotas-b2,
rama codex/preparacion-cotas-b2, desde el commit que contiene este documento.
Único archivo modificable: PREPARACION-TECNICA-COTAS-B2.md en ese worktree.
Sin escritorio, sin red, sin DB, sin otros agentes, sin cambios de código.

Inspeccionar diseno.ts, diseno-catalogo.ts, sus pruebas, configuración/persistencia
v1, dibujo-estructura.tsx, geometria-cerramiento.ts y consumidores pertinentes.
Entregar mapa con rutas y símbolos reales, flujo de medidas hasta web/PDF/motor,
reglas actualmente codificadas (separadas de las observadas), límites de módulos,
propuesta mínima de archivos y pruebas para admitir cotas verificadas, riesgos de
compatibilidad y preguntas concretas que debe resolver Productor. No presentar
FI/F=300 inicial como regla absoluta, proporcional ni referencia ya demostrada.
Incluir matriz de aceptación pendiente: segunda medida, referencia del eje,
valores FI/F, medidas inviables, persistencia, web/PDF, despiece/precio separados.
No ejecutar pruebas que disparen migraciones. Para este informe basta verificar
cada referencia contra código y git diff --check. Informar base exacta, estado y
commit documental. Esperar revisión antes de ampliar alcance o implementar.

## Continuación del arquitecto en tarea nueva
Retomar exclusivamente el escritorio; esta tarea anterior deja de controlarlo.
Supervisar Sol mediante wait_threads, revisar informe/diff y devolver correcciones.
Completar B2 según EVIDENCIA-COTAS-0017.md: consultar 1O2FL y cadenas 1O+1F+1O,
1O+2F+1O, y ensayar otra medida en líneas de presupuesto de prueba 0017.
Avisar antes de crear documento de prueba. No alterar catálogo ni documentos
existentes. El usuario se ofrece a estar presente: comprobar disponibilidad si la
sesión ya no es continua. No volver a solicitar permisos ya concedidos.
Guardar evidencia y especificación de implementación antes de ampliar encargo Sol;
verificar su base y actualizarla sin pisar archivos del arquitecto. Delegar solo
reglas demostradas, con alcance, archivos, pruebas y aceptación explícitos.
Revisar diff, pruebas y comparación real; no declarar paridad total por QA visual.

## Pistas de escritorio y evidencia
Leer skill computer-use antes de observar. Productor ya abierto, empresa 0017,
lista Estructuras, filtro 1o, selección 1O1FL al terminar B1. Redescubrir ventana
por título; IDs antiguos no fiables. No lanzar ejecutable ni registrar OCX.
Diseño V3: X de título cierra; la X roja de barra ELIMINA elementos, no cierra.
No aceptar/guardar catálogo. Ctrl+A en listado abre Artículos; no usarlo para
seleccionar texto. Una acción y nueva captura, esperar aperturas lentas sin duplicar.
Capturas locales ignoradas output/evidencia-manos-20260919; QA B1 en
output/revision-manos-b1. Servidor temporal 3001 detenido y navegador cerrado.
CHM extraído bajo C:/Users/laral/AppData/Local/Temp/claude/C--Users-laral-Documents-Aluminior/bb096a57-b9e1-4737-b1f6-cfc76dc5eee1/scratchpad/chm/;
propiedades de cotas: 5_1_2_2_1_1_2_4_propiedades_de.htm.
Los 888 casos siguen pendientes; 3HO no está en ese banco y su herraje histórico
no demuestra unión de catálogos. Mantener separados dibujo, despiece, precio y uso.

## Continuación B2: observación parcial registrada

Tarea responsable 01a0ba4e-570d-74f2-a0c5-554edccb2608, único controlador del
escritorio. Commit 4707a5d registra las consultas de 1O2FL y ambas cadenas.
FI/FD de 1O2FL son dos variables distintas; las cadenas usan travesaños visibles
con equidistancia 3/4 y ambas hojas Dchas. Ver EVIDENCIA-COTAS-0017.md.

El usuario abrió manualmente 0017 al retomar y se verificó el rótulo. Tras aviso,
se inició Nuevo Documento sin cliente para segundo tamaño. Aceptar/Return no
produjeron alta confirmada y Return devolvió timeout. Usuario avisado para
comprobar si responde/aceptar manualmente. No repetir alta hasta conocer resultado;
no hay número de presupuesto nuevo confirmado. No se cerró ni reinició Productor.

Sol entregó preparación 37e85dd en su worktree y recibió revisión: ausencia de
cota no es cero, compatibilidad v1 visual separada de económica y separación
geometría física/render/fórmulas. Sigue autorizado únicamente a corregir el
informe. Falta revisar su commit de corrección final. No hay encargo de código,
porque siguen pendientes segunda medida, edición, límite y persistencia.
No se han hecho cargas, cambios de código, activaciones, push ni merge a main.

Revisión documental terminada: Sol bd9dc05 revisado, diff --check correcto y
worktree limpio. Informe integrado en feature como 0dc0ffb + 3644248; solo
PREPARACION-TECNICA-COTAS-B2.md. Ningún código implementado. La base del worktree
Sol conserva su informe y se actualizará al concretar el encargo de código.
Bloqueo actual: respuesta del usuario sobre Nuevo Documento; no hay alta nueva
confirmada ni segunda medida observada. Estado feature: solo env.example ajeno.

## Estado vigente 19/09/2026 18:33

Sustituye los bloqueos de alta indicados arriba: autorizado explicitamente por
el usuario y confirmado presupuesto nuevo 260494, PRUEBA COTAS B2, empresa0017.
1OFI observado a 900x1500 y 900x1800; FI300 permanece y override FI400 aumenta
el fijo inferior en Diseno V3. Ver detalle en EVIDENCIA-COTAS-0017.md.
Al aceptar la linea con GMA65OPT y L33I, Productor fallo en
alVLinOpciones_codEstr.OpcionesSeleccionadas, error -2146233088, configuracion
SessionFactory invalida/incompleta. Informe cerrado, editor de linea abierto.
No confirmar persistencia, precio ni cortes. No repetir alta ni cerrar proceso.
No se ha encargado codigo a Sol ni cambiado alcance: falta contrato verificado
y pruebas de persistencia/calculo. No hay cargas remotas, push ni merge main.

Actualizacion18:37: el proceso continuo tras el error y anadio una unica linea.
Reabierta con lapiz: 1OFI900x1800, GMA65OPT/L33I, superior300/inferior400,
precio mostrado633,07 sin IVA. Verificada conservacion en reapertura de linea
dentro del presupuesto abierto; no el ciclo completo de cierre del documento.
Error de opciones pendiente, por lo que no dar precio por validado. Editor
cerrado sin cambios; 260494 permanece abierto con esa linea. Bateria baja
notificada al usuario. No hay nuevo bloqueo que autorice reparar instalaciones.

## Estado vigente 19/09/2026 19:03: cierre acotado de 1OFI

Esta actualizacion sustituye expresamente, solo para `1OFI`, los pendientes
obsoletos de segunda medida, referencia al eje, persistencia completa y consulta
de cortes indicados en secciones anteriores. No declara B2 terminado.

En empresa `0017` se grabo, cerro y reabrio el presupuesto existente `260494`.
Productor exigio Forma de Pago y se dejo `01 CONTADO`. El round-trip conserva
`1OFI` a `900x1800`, `GMA65OPT`, `L33I`, superior `300` e inferior `400`; FI queda
en `400`. Propiedades confirma `Horizontal (Abajo)`, `Cota Variable`, `FIJO
INFERIOR`/`FI`, y `GM16197L`. La ayuda confirma que esta cota va del exterior del
elemento contenedor al eje del travesano; no usa borde de perfil ni la excepcion
`Fija desde elemento Exterior`.

Se consulto el despiece FI=400: `GM16197L` corta a `856 mm`; vidrios `L33I` de
`756x1270` y `836x350`; herrajes oscilobatientes y `95` minutos de mano de obra.
Ver detalle y resto de cortes en `EVIDENCIA-COTAS-0017.md`. Precio visible
`633,07 EUR` sin IVA, no validado. Una unica aceptacion normal reprodujo el error
`alVLinOpciones_codEstr.OpcionesSeleccionadas`, `-2146233088`, `SessionFactory`
invalida/incompleta. No repetir ni reparar instalacion.

Puede pasar a implementacion solo el contrato geometrico, grafico y persistente
de FI para `1OFI`, con default `300` en altas y override persistido. Deben esperar
valoracion/despiece calculado, limites inviables y cualquier efecto de `FIJO
SUPERIOR`. Documento `260494` queda abierto; no se creo otro presupuesto.
