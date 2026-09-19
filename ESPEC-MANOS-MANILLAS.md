# B1: corrección conjunta de manos y manillas

Leer AGENTS.md, CLAUDE.md, EVIDENCIA-MANOS-0017.md, RELEVO-SIGUIENTE-SESION.md.
Repositorio vigente C:/Users/laral/Documents/Aluminior, feature en a77abc3 antes
de este documento, descendiente de edfc346, f4ca3a6 y 3bbe321. El mensaje de
tarea indicará el commit exacto que contiene esta especificación. Verificarlo.

## Alcance y propiedad
Sol implementa únicamente modelo visual de core y consumidores web/PDF:
- packages/core/src/estructuras/diseno.ts, diseno-catalogo.ts, index.ts,
  nuevos módulos pequeños de geometría de apertura y sus pruebas.
- packages/web/app/dashboard/presupuestos/[id]/_components/dibujo-estructura.tsx
  y módulos/tests locales extraídos si ayudan.
- packages/web/app/dashboard/presupuestos/[id]/pdf/geometria-cerramiento.ts,
  dibujo-cerramiento.tsx y pruebas relacionadas.
- Pruebas existentes de catálogo que dependan de estas etiquetas, sin falsear
  divergencias conocidas ni ampliar lista de estructuras activas.
Arquitecto posee documentos de evidencia/relevo y el escritorio. No tocar el
escritorio, DB, acciones de presupuesto, precios, motor, migraciones ni secretos.
No leer/copiar env.example ni .env. No push, cargas, merge o integración propia.
No cambiar package*.json; comunicar si una dependencia resulta imprescindible.

## Resultado exigido
1. Sufijo de AperturaVisual = lado de bisagras. Helper puro público de core
   compartido por web y PDF para lados y trazos, sin duplicar endsWith invertidos.
2. 1OD bisagra derecha/manilla izquierda; 1OI inverso. Parejas 2/2O con bisagras
   exteriores, una sola manilla en hoja derecha; en 2O solo derecha es oscilo.
3. Modelar presencia de manilla explícitamente por hueco (propiedad opcional
   con compatibilidad por defecto aceptable). No inferirla del id, del código
   dentro del renderer ni de que haya una división invisible. Fijos sin herrajes.
   Propagar el atributo al distribuirComposicion.
4. Cambiar etiquetas de TODAS las otras plantillas manuales al mismo tiempo
   que el renderer para conservar su dibujo físico previo. No corregir todavía
   geometría o mano no observadas de combinaciones. En 1O2FL debe conservarse
   bisagra derecha/manilla izquierda. No alterar cotas/proporciones/medidas.
5. Generador experimental: alinear etiquetas de pares 7/8 con bisagras
   exteriores, manteniendo tipo5 derecha y6 izquierda como singles respaldados.
   No generalizar regla de manilla de pares a candidatas no observadas; mantener
   alcance experimental y advertencias. Aclarar limitación de manilla si procede.
6. PDF representará lado de apertura, bisagras y manilla coherentes con web,
   con tamaño gráfico adaptado al soporte y limitado para no desbordar huecos
   pequeños. Web compacta puede seguir omitiendo accesorios; triángulos correctos.
7. No cambiar interacción, selección, teclado, textos de usuario ni layout.
   No añadir microcopy ni estados de paridad certificada.
8. Documentos guardados v1 se reconstruyen corregidos, conforme a decisión de
   evidencia. No migración, escritura o revisión económica; no tocar PDF emitidos.

## Verificación
- Tests independientes de coordenadas físicas, con esperado explícito, para
  cuatro casos observados; contar manillas y triángulos oscilo por hoja.
- Regresión física de las otras diez plantillas: deben mantener lados previos,
  medidas y separadores. No obtener expected llamando al mismo helper probado.
- Pruebas de render web SVG real y PDF real/árbol de primitivas, no solo helper,
  para evitar que consumidores omitan atributo o sigan invertidos.
- Configuración persistida v1 sintética sigue válida y con medidas iguales;
  no cambia snapshot económico ni configuración serializada.
- Generador: actualizar golden de etiquetas justificadamente; no certificar
  catálogo completo ni borrar divergencias geométricas/cotas pendientes.
- Pruebas relevantes core/web y typechecks de ambos; git diff --check.
- Preparar artefactos LOCALES sintéticos para revisión visual de cuatro casos,
  desktop/móvil y PDF si posible sin servidor adicional ni DB. Capturas reales
  del navegador las realiza el arquitecto. No arrancar otra web en 3001.
- Verificar que @aluminior/core se resuelve al propio worktree, nunca al repo
  principal. Dependencias aisladas: no usar junction global de node_modules.

Entregar un commit local limpio, resumen de pruebas/limitaciones y rutas de
artefactos ignorados. Pedir criterio al arquitecto si aparece inferencia no probada.
No ampliar alcance a cotas/herraje/precio por iniciativa propia.

## Adenda B1: evidencia adicional 19/09, antes de cierre de implementación
El responsable ha observado ahora también 1OFI y2O+ FIJO, recogido en
EVIDENCIA-COTAS-0017.md. Esta adenda sustituye SOLO para estos dos casos las
instrucciones de conservar orientación/manillas previas y la alerta provisional
sobre divergencia 1OFI; las otras ocho plantillas siguen conservando aspecto.
- 1OFI: bisagra izquierda, manilla derecha, oscilobatiente. Su etiqueta final
  es oscilobatiente-izquierda (no invertirla para conservar el antiguo error).
- 2O+ FIJO: hoja izquierda abatible/bisagra izquierda/sin manilla;
  hoja derecha oscilobatiente/bisagra derecha/con manilla al encuentro.
- NO cambiar dimensiones ni proporciones de estos casos en B1. Sus diferencias
  de medidas quedan reconocidas hasta B2 y no se declara paridad integral.
- Añadir estos dos casos al expected independiente de geometría y consumidores.
  En 1OFI la firma de apertura puede ahora coincidir con generador: justificar
  desde esta observación, no desde el golden. No inferir cotas ni herraje.
El arquitecto incorporará esta adenda mediante lectura del repo principal;
no necesitas traer commits de documentación ni editar sus archivos en worktree.

## Adenda final de manos: 1O1FL
Consulta directa adicional registrada en EVIDENCIA-COTAS-0017.md:
1O1FL tiene hoja físicamente a la izquierda del fijo, de mano DERECHA
(bisagra derecha, manilla izquierda). Su etiqueta final es oscilo-derecha
con nombre completo oscilobatiente-derecha. Esta observación sustituye la
conservación provisional de su mano antigua. Incluir expected de render.
Conservar medidas1100x1200 y reparto8:3: se verificará otra medida en B2.
Alcance final observado de B1:1OD,1OI,2,2O,1OFI,2O+ FIJO,1O1FL.
Resto siete plantillas: regresión sin cambios físicos. No más ampliaciones B1.
