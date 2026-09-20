# Continuidad funcional de Productor en Aluminior

> Revisión documental 20/09/2026: **Plan histórico**. Dirección de producto útil; orden inmediato sustituido por el encargo actual.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

## Decisión de trabajo

El usuario delega el orden técnico para que su tío pueda trabajar igual o
mejor que en Productor. Se prioriza reconstrucción funcional: manual,
configuración, documentos históricos y comparación controlada. La
descompilación nativa no es el punto de partida; solo se consideraría ante
un comportamiento concreto que no se pueda explicar por esas fuentes.
Aluminior conserva código propio y no dependerá de ejecutar Productor.

La referencia operativa es una tarea de taller completa: configurar,
despiezar, valorar, guardar, reabrir y emitir. Tener una miniatura no acredita
que una estructura esté lista para presupuestar o fabricar.

## Estado que se conserva

- Rama `feat/cerramientos-editor-linea`; avance anterior guardado en `3bbe321`.
- Catálogo del editor cargado con autorización en Supabase: comprobados
  herrajes incompatibles y las cuatro opciones GM69–GM72.
- 14 plantillas operativas conservadas. El clasificador genera 46 candidatas
  a tamaño inicial, con advertencias de mano, cotas y valoración.
- No se publica ni se une a main como parte de esta investigación.

## Trabajo inmediato

1. Investigar asignación de herrajes por configuración, sin convertir
   frecuencias históricas en reglas universales. Documentar fuentes,
   precedencias y contraejemplos. Probar reglas verificadas localmente.
2. Construir banco local de casos históricos comparables: configuración,
   materiales, cantidades, medidas de corte e importes. Los casos reales
   permanecen fuera de Git; las pruebas usan datos sintéticos.
3. Preparar una sesión de observación 0017 que resuelva las incógnitas
   concretas, evitando recorrer pantallas sin una pregunta verificable.
4. Corregir geometría y manos conjuntamente en modelo, web y PDF. Revisar
   también las parejas 2/2O: arreglar una etiqueta global puede invertirlas.
5. Activar estructuras por lotes pequeños que superen la comprobación;
   continuar con C2 y después las demás familias por uso.

Las dos primeras investigaciones son independientes. Si el histórico no
incluye un código o sus opciones completas, ese caso requiere evidencia
controlada nueva; no se rellena con un ejemplo parecido.

## Hallazgos de esta investigación

- Los cuatro campos Conjunto de las 541 estructuras están vacíos en la
  exportación. No sirven para ampliar directamente las reglas de herraje.
- ConfigSeries sí declara conjuntos por apertura y el manual explica su
  generación, pero las series heredadas y aperturas mixtas requieren más
  evidencia. El contraste inicial de 22 reglas da 12 coincidencias,
  1 discrepancia y 9 desconocidas. Ver `EVIDENCIA-ASIGNACION-HERRAJE.md`.
- La inspección inicial del histórico encuentra 888 líneas de 14 candidatas;
  32 de las 46 no tienen muestras. Esa cobertura no acredita precios iguales.
- La revisión automática bloqueó la generación del banco real porque lee
  tres tablas de documentos fuera de la autorización previa de cuatro CSV
  de catálogo. Se solicitó autorización explícita para VPresupuestosLin,
  VDatosLinEstr, VOpcionesHerraje y su salida técnica local en output/.
  El usuario confirmó después esas lecturas y la salida local; el bloqueo
  de alcance queda resuelto para esos tres CSV, sin autorización remota.

## Guion de observación pendiente en la 0017

Siempre distinguir vista interior/exterior, lado de bisagras y posición de
manilla. Registrar el texto literal del tipo de hoja y su posición en el
árbol. No identificar una mano únicamente por el nombre del código.

| Caso | Incógnita específica |
|---|---|
| 1OD / 1OI | Anclas de mano física para hojas simples y sentido de vista |
| 2 / 2O | Pareja, hoja activa y hoja oscilobatiente; control de regresión |
| 1OFI | Ancho predeterminado y cota fija inferior al cambiar altura |
| 1O1FL | Cota del fijo lateral y mano de hoja |
| 1O2FL | 1300×1200 observado; cotas laterales y coherencia de mano |
| 1O+1F+1O | Travesaños visibles, manos y reparto de huecos |
| 1O+2F+1O | Posición de hojas, separadores y medidas |
| 2O+ FIJO | Tipo de pareja, altura predeterminada y cota inferior |
| C2 | Serie, carriles, solapes, cortes, herrajes y precio de una línea controlada |

Para casos con cotas absolutas: comparar medida inicial y otra medida,
identificando qué dimensión permanece fija. Solo editar en un documento de
prueba autorizado; no modificar ni aceptar cambios en fichas de catálogo.
La sesión de Productor se hace con el usuario presente y empresa 0017 visible.

## Criterio para ofrecer una estructura nueva

- Dibujo y medidas: topología, manos, separadores y cotas a varios tamaños.
- Despiece: artículos y variantes, número de piezas, longitudes y ángulos;
  explicar cualquier discrepancia con la referencia, sin tolerancias globales
  que oculten piezas incorrectas.
- Precio: misma tarifa, acabado, vidrio, opciones, descuentos y ajustes
  explícitos. Separar material, mano de obra y ajustes; no deducir horas
  manuales del histórico. Un importe incompleto nunca equivale a cero.
- Persistencia: guardar y reabrir conserva configuración, dibujo y precio.
  Probar localmente; no crear documentos ficticios en Supabase.
- Interacción: recorrido y teclado reconocibles, PDF coherente, escritorio
  y móvil utilizables. La comparación se hace con los mismos datos de entrada.

Los estados se mantienen separados: candidata visual, cálculo contrastado,
flujo validado y disponible. Ningún recuento de candidatas implica activación.

## Límites operativos

Productor solo 0017; ninguna escritura en la 0016 activa. Investigación
local en exportaciones, sin versionar documentos, clientes, credenciales o
respaldos. No se ejecuta el importador completo. Cada nueva carga remota se
prepara y prueba antes de solicitar autorización; el merge a main también
requiere aprobación. La regla de unión sigue pendiente de evidencia del taller.
