# Fase 2 — aceptación local de geometría e interacción

20/09/2026. Aceptación técnica en Aluminior completada junto con fase 1.
El contraste de la misma tarea con Productor continúa pendiente; no se declara
paridad global de interfaz, catálogo, inserción ni precio comercial.

## Evidencia posterior de Productor

El [registro del operador del 20/09/2026](../OBSERVACION-PRODUCTOR-2026-09-20.md)
muestra PSU001 con Grosor 2 mm y descripción 100mm, y un GRUPO final 6300 × 1200.
Las uniones 100/60 mm descritas abajo pertenecen a la fixture sintética local;
no son medidas verificadas en Productor por esa descripción comercial.
Esta nueva evidencia requiere un contraste con iguales entradas antes del cierre.

## Resultado observado

El navegador muestra seis módulos y cinco uniones con ancho total 6640 y alto
1020. Rectángulos SVG de módulos: 1200,1200,1200,300,1200,1200 mm; posiciones
0,1300,2560,3820,4180,5440. Uniones: 100,60,60,60,60 mm. Se mantienen 1:4 y 5:3.
No se modificaron geometría core, adaptador PDF ni reglas de despiece/precio.

| Viewport | Ancho scroll de página | Observación |
|---|---:|---|
| 1440×900 | 1425 | Composición visible y proporcional; sin overflow de página |
| 1024×768 | 1009 | Composición visible y proporcional; tabla con scroll interno |
| 375×812 | 360 | Composición completa reducida uniformemente; sin overflow de página |

Las capturas se inspeccionaron en la tarea. El lienzo móvil conserva bastante
altura vacía y la composición ancha se ve pequeña; no se confunde escala
uniforme con cierre de toda la ergonomía móvil de fase 8.

Teclado: Enter en primer módulo, último módulo/segundo vidrio y U1. Selección
e identidad comprobadas. Se corrigieron dos defectos encontrados al inspeccionar
el código y probar el recorrido: la selección interna activa ahora su módulo;
Enter/Espacio del vidrio/travesaño no propaga un clic al módulo que la sustituya.
Se añadieron nombres accesibles a vidrios, separadores y selectores de unión.
No se añaden atajos ni semántica nueva atribuida a Productor.

La reapertura y emisión están descritas en [fase 1](../fase-1/00-resumen.md).
PDF real inspeccionado: seis módulos, fijo cuarto, U1 más gruesa, 6640×1020,
una página, sin recorte/solape. Los siete tests de geometría verifican además
alturas distintas, unión más larga, límites extremos y cambio de viewport.
Esos extremos están probados como dominio; no se afirma haber recorrido cada
combinación extrema en navegador ni disponer de aceptación del operador.

## Puerta de fase 3

Ya no queda el bloqueo técnico de guardado/reintento de seis módulos.
Antes de alterar inserción, arrastre o clic del catálogo, recuperar evidencia
del manual/capturas o decisión explícita. La implementación actual sustituye
el módulo activo al elegir miniatura y añade únicamente al extremo derecho;
este informe no convierte ese comportamiento en paridad confirmada.

Continuación del 20/09/2026: [Actualización explícita de medidas y corrección de PSU001](../IMPLEMENTACION-ACTUALIZAR-2026-09-20.md). Implementación y verificaciones locales; contraste integral pendiente.

Observación directa posterior: [cierre de jornada](../../CIERRE-JORNADA-2026-09-20.md). Comprobados globales 1200, 2420, 3640 y 4860 con alto 1200; ensayo interrumpido al editar el fijo. Conserva pendiente el contraste equivalente completo.
