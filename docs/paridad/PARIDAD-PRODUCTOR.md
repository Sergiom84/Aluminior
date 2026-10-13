# Paridad con Productor Aluminio

Mapa de evidencia y aceptación: base `9bc879e`, continuidad documental
reconciliada el 10/10/2026 con `origin/main` `9673659`.
El estado operativo se consulta en [ESTADO-ACTUAL.md](../ESTADO-ACTUAL.md).

## Objetivo y fuentes

El alcance ratificado comprende todas las tipologías, series, uniones y opciones
del taller. Las facturas son resultados de contraste, no entradas del cálculo.
Productor es una referencia de comportamiento; su ejecutable no es una
dependencia de Aluminior.

Prioridad: observación autorizada, capturas/manual CHM, datos/configuración
propios, entrevistas del operador y análisis autorizado cuando lo anterior
no resuelve el comportamiento. Distinguir observado, inferido, implementado
y aceptado. Una hipótesis no se convierte en contrato por figurar en un plan.

## Recorrido y mapa de evidencia

Cabecera mínima con cliente opcional, nombre libre y obra; entrada al
configurador. Cliente por prefijo de código o fragmentos de nombre en cualquier
orden, conservando el código canónico. Composición como una línea GRUPO con
dibujo, descripción, medidas, cantidad, precio y horas manuales explícitas.

| Capacidad | Código y evidencia disponibles | Contraste pendiente |
|---|---|---|
| Guardado, reapertura y copia | Servicios transaccionales; [fase 1](fase-1/00-resumen.md) | [A3 publicado](IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md): reintentos y pérdida HTTP locales; publicación y recibos remotos verificados. Resta comparación integral con Productor |
| Medidas fraccionarias | [A4/0030 publicado y verificado](MEDIDAS-Y-CI-2026-10-09.md): alta, edición, recarga, copia y PDF | E7 sigue pendiente con C2 y configuración real idéntica a Productor; no repetir implementación |
| Composición 2D | Configuración v3 compatible; [geometría](fase-2/03-aceptacion-local.md) y [composición](fase-3/01-evidencia-composicion.md) | Mismas tareas y entradas en ambos sistemas |
| Catálogo y correderas | Plantillas verificadas y generadas; [catálogo real](CATALOGO-REAL-2026-10-02.md) | Tipologías no representables, mano 58 y sentido de correderas |
| Materiales por elemento | Excepciones y modelos iguales; [fase 4](fase-4/01-evidencia-actualizar-y-diseno-v3.md) | Herencia y «Actualizar todos» |
| Vidrio | Búsqueda por código/descripción; [fase 5](fase-5/00-resumen.md) | Composición de doble vidrio, equivalentes y editor interno |
| Uniones | Catálogo y longitud; [fase 6](fase-6/00-resumen.md) | Reparto de grosor y compatibilidad |
| Despiece y precio | [Reglas](fase-7/06-reglas-catalogo-despiece-completo.md), [banco](BANCO-CONTRASTE-2026-10-03.md) y [matriz modelo/serie/regla](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md) | Ramas sin contraste, acabados efectivos y ensayos mínimos; aceptación en producción pendiente |
| Horas manuales | [Especificación y mediciones](SPEC-MANO-DE-OBRA.md) | Aceptación integral; fabricación base es otra vía |
| PDF | Configuración y resultados persistidos; [fase 7](fase-7/00-resumen.md); [P.2 publicado 09/10](PDF-MULTIPAGINA-2026-10-09.md), 21 páginas sintéticas y endpoint local de 4 páginas | Endpoint desplegado comprobado (260009, 1 página, 805,65 €); aceptar formato comercial Productor/titular; recorrido integral por teclado |

Código disponible no significa aceptación ni funcionamiento verificado en
producción. Los informes conservan sus fechas y límites.

## Diseño y brechas

El código de estructura es opaco: no se deduce la forma de su texto.
Marco, hueco, hoja, vidrio, división, travesaño y unión son conceptos distintos.
Un dibujo disponible no acredita receta, precio o fabricación.

La [investigación de cerramientos](RECON-CERRAMIENTOS.md) conserva un caso donde
Productor reparte el grosor de una unión con artículo entre módulos y mantiene
el ancho agregado. La composición actual suma la separación. Faltan
confirmación del operador y otro tipo de unión antes de generalizar la regla;
la brecha no se declara corregida.

Plegables, mallorquinas, zócalos, curvas y cotas no verificadas conservan
limitaciones explícitas. No inferir panel, apertura o fabricación por parecido.

## Criterios conservados del plan maestro

El [plan original](../historico/PROMPT-MAESTRO-FASES-0-A-8.md) queda inactivo.
Estos criterios útiles no autorizan trabajo ni afirman implementación:

- Materiales: distinguir general, herencia y excepción; anunciar destinatarios
  de cambios colectivos y conservar compatibilidad tras guardar/reabrir.
- Vidrio: cámara y vidrios resueltos desde catálogo; cancelar conserva el valor,
  sin concatenar códigos ni inventar equivalentes.
- Huecos: acceso, menú, orientación, cota al eje y equidistancia con semántica
  observada; conservar identidad y excepciones al dividir o eliminar.
- Rellenos: panel y vidrio explícitos; cambiar el general conserva excepciones.
  Una opción gráfica no genera coste por inferencia.
- Uniones: código, grosor, longitud, acabado y receta en su ámbito; ángulos y
  regulación requieren contrato probado, sin reemplazos automáticos de artículo.
- Economía: contrastar artículos, medidas, opciones, tarifa, fecha y redondeo
  por partida; cantidades 1/2/3 y medidas mínima/habitual/máxima.
  No usar un factor global para alcanzar el total de Productor.
- Horas y snapshots: entradas manuales explícitas, sin deducirlas del histórico
  ni duplicarlas al reabrir; distinguir conservar de recalcular.
- PDF: misma configuración persistida que la UI; varias líneas/páginas, textos
  largos, composiciones extremas, cliente opcional y decimales; inspección renderizada.
- Interacción: recorrido original documentado, foco y retorno de diálogos,
  confirmar/cancelar, atajos observados, errores, latencia, reintento y recarga.
  Comparar escritorio/móvil, overflow, accesibilidad y reduced motion.

## Aceptación por pantalla

1. Identificar fuente, campos, agrupación, acciones y estados.
2. Comparar ambos sistemas con iguales entradas y tarea.
3. Registrar pasos, teclado, foco, resultados y capturas representativas.
4. Separar implementación, prueba local y aceptación con Productor.
5. Mantener nulo el importe incompleto y avisos coherentes en UI/PDF.
6. Ejecutar pruebas y typechecks pertinentes; revisar fronteras del módulo.
7. Documentar desviaciones y brechas sin declarar paridad total mientras falten.

Modernizar superficies y accesibilidad manteniendo documentos, tablas compactas
y acciones próximas. Los errores conocidos del original no son requisitos.
No eludir protecciones ni copiar código, binarios o activos propietarios.
Investigación sobre copias autorizadas; datos y capturas privados fuera de Git.

Fuentes originales: [índice](../INDICE-DOCUMENTACION.md) y
[recorrido inicial con capturas descritas](antecedentes/PROMPT-FASE-0-PARIDAD-PRODUCTOR.md).
