# Cierre de jornada — 20/09/2026

El usuario da por finalizado el trabajo por hoy y solicita actualizar la
documentación, commit, integración en main y push. No reanudar automáticamente
la operación de Productor ni el desarrollo al leer este relevo.

## Código y verificaciones terminados

- `a2d62ce`: saneamiento modular y auditoría documental.
- `77f57c7`: guardado/reintento, idempotencia de alta y aceptación local de seis módulos.
- `c756aea`: aplicación explícita de medidas y propiedades de unión mediante
  Actualizar; validación de borradores y bloqueo de guardado mientras están
  pendientes; PSU001 predeterminada de 2 mm, conservando configuraciones antiguas.
- Último bloque: 10 pruebas web y 107 core correctas; TypeScript web correcto;
  arquitectura: 573 archivos, 295 módulos, cero infracciones. Navegador comprobado
  en escritorio/móvil, incluyendo cancelar sin alterar el presupuesto sintético.
- El bloque previo tuvo 625 pruebas web correctas, además de su comprobación
  geométrica, persistencia/reapertura y PDF. Son ejecuciones distintas; no
  presentar aquella batería completa como repetida tras el último cambio.

Ver [implementación de Actualizar](paridad/IMPLEMENTACION-ACTUALIZAR-2026-09-20.md),
[fase 1](paridad/fase-1/00-resumen.md) y
[aceptación local de fase 2](paridad/fase-2/03-aceptacion-local.md).

## Evidencia aportada por el usuario

Se registraron doce capturas y el recorrido de Productor, incluidos los catálogos,
el arrastre, actualizaciones, uniones, doble acristalamiento y formas de pago.
Ver [observación del operador](paridad/OBSERVACION-PRODUCTOR-2026-09-20.md).
Las capturas se conservaron fuera de Git con manifiesto y comprobación SHA256.
Ese recorrido termina en una línea GRUPO 6300 × 1200, base 3150,44 y total 3812,03;
no están completas las entradas finales de cada elemento y unión.

## Observación directa de Productor al final de la jornada

El usuario dejó un presupuesto nuevo abierto y autorizó operar el programa.
Se accedió mediante el complemento Computer Use (`node_repl` y `@oai/sky`),
no mediante el navegador. Ventana: Diseño de Cerramientos V2.1; selector de
empresa visible: **PRUEBAS ALUMINIO - 2026 [0017]**. La cabecera de la ventana
muestra el nombre de la empresa habitual, pero el selector identifica 0017.
No se verificó el número del nuevo presupuesto y no se le atribuye 260496.

Desde el configurador vacío se arrastraron las miniaturas desde la barra inferior:

| Estado observado | Dimensiones globales visibles |
|---|---|
| Una ventana de dos hojas oscilobatiente | 1200 × 1200 |
| Dos ventanas iguales | 2420 × 1200 |
| Tres ventanas iguales | 3640 × 1200 |
| Tres ventanas y un fijo 0 de 1200 × 1200 | 4860 × 1200 |

Al activar el botón de propiedades señalado por el usuario y seleccionar el
cuarto elemento, se leyó **0 — FIJO DE 1 HUECO**, posición **X 3660 / Y 0**,
ancho **1200** y alto **1200**. Los incrementos son compatibles con 20 mm por
unión provisional. No se inspeccionó todavía su código/grosor: no convertir esa
inferencia en una regla universal ni atribuirla a GMU038 o PSU001.

Evidencia privada: `output/paridad-fase-2/20260920-directo/01-fijo-inicial.png`
y `observaciones.txt`. La captura acredita el cuarto elemento y el global 4860.
Los otros globales se observaron durante la interacción, sin archivo individual.

## Punto exacto de interrupción — revisar antes de tocar nada

Se intentó introducir 300 mm en el ancho del fijo. Productor entró repetidamente
en «No responde», con cambios visibles demorados; la entrada de texto no produjo
el valor esperado y se pasó al teclado numérico. **La última captura confirmada
mostraba ancho 30 en el campo, alto 1200 y global 4860 × 1200**. El dibujo seguía
con el fijo de 1200 mm: ese valor de edición aún no se había aplicado.

El último envío de `KP_0`, para completar 300, fue abortado por el usuario.
Su efecto es desconocido: al volver podría haber 30 o 300. No se volvió a operar
el programa después de la interrupción. **No se pulsaron Actualizar, Aceptar ni
Guardar después de editar ese ancho.** No se acredita guardado del conjunto ni
cierre del presupuesto. No asumir tampoco que Productor carece de autoguardado.

Para retomar, observar primero la ventana y su empresa, recuperar el foco y leer
el ancho real; corregir a 300 únicamente si se mantiene esta receta y entonces
Actualizar. No repetir teclas a ciegas ni usar los identificadores/coordenadas de
la sesión anterior sin una nueva observación.

## Estado real y siguiente trabajo

- Fase 1: aceptación técnica local conservada; no equivale a precio comercial.
- Fase 2: geometría común y QA local completas; **contraste directo parcial**.
  El cierre integral sigue pendiente. No se completaron seis módulos ni se
  inspeccionaron/aplicaron las uniones del nuevo caso.
- Para continuar fase 2: terminar un caso controlado de seis módulos, registrar
  medidas, posiciones y uniones finales; reproducir iguales entradas en Aluminior;
  verificar geometría, guardado/reapertura y PDF. No forzar un total de 6300 ni
  trasladar la receta sintética 6640 × 1020 como si fuera el caso de Productor.
- Catálogos completos, inserción/arrastre, materiales por elemento, operaciones
  colectivas, doble acristalamiento y paridad de pago conservan su alcance pendiente.
- No hay cambios remotos de BD, nuevas migraciones ni despliegue en este cierre.

## Git y conservación de datos

El trabajo ya estaba integrado en **main** al iniciar el cierre; no existe una
rama de trabajo pendiente de fusionar. Se actualizó origin mediante fetch antes
de preparar la publicación. El commit documental de cierre se añade a main y
se publica con push normal, sin force. El resultado se verifica con la referencia
remota después del envío; el mensaje final informa del resultado efectivo.

Las imágenes, dumps y exportaciones privadas de output/ no se publican.
`env.example` permanece sin seguimiento y fuera del commit, como antes del cierre.
