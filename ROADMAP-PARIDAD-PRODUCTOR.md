# Roadmap operativo de paridad con Productor

Actualizado: 04/10/2026. Entrada del proyecto: [ESTADO-ACTUAL](docs/ESTADO-ACTUAL.md).
Este archivo es el registro único del orden y estado de estas tareas.
Los documentos de ensayo explican cómo realizarlas; los informes fechados
conservan evidencia. Sus antiguas listas de pendientes no sustituyen este registro.


## Siguiente paso

**E1 — demostrar el cálculo y reparto del despunte.**
Continuar [PASO-E1-DESPUNTE](docs/paridad/PASO-E1-DESPUNTE.md) desde los resultados A–F conservados.
La [investigación del 04/10](docs/paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md)
contrastó manual y costes históricos y observó A–F en 0017: C2 GMC400
1500×1150, VCG4, acabado L, cantidad 1; segunda línea por duplicación.
Barras Completas, reparto entre líneas, coste mínimo y compra sin gastos:
recálculo sustituye el cargo; repetición y reapertura conservan resultado.
Copia F privada verificada y lector propio; evidencia comercial fuera de Git.
Residuo 0,02 € explicado en B/D por margen GID 0,01 % sobre coste y redondeo.
Complementario G1–G5 observado y contrastado: alta independiente de segunda C2
1200×1150 tras primer cargo no lo hereda ni activa reparto automático. El
recálculo sustituye cargo y reparte por bases sin cargo anterior; G5 conserva
la proyección técnica de G4 tras F9/reapertura. Copias privadas por estado.
No repetir A–F ni G1–G5. Tres políticas de redondeo coinciden en G4. Variante
1207×1150 verificada produjo error de opciones/SessionFactory y añadió tercer
GRUPO; G6-incidencia conservada, sin recálculo y con previos intactos.
Siguiente: retirar solo tercer GRUPO tras autorización solicitada y comprobar
edición de segunda línea sin crear otra. Después comparación discriminante
con bases reales y predicciones previas; no certificar opciones tras el error.
Descuentos cero/cantidad 1 no discriminan base bruta/neta ni otras cantidades.
Sin aplicación al presupuesto web ni nueva medición del banco.

## Secuencia de trabajo

| ID | Trabajo | Estado actual | Prueba necesaria para avanzar o cerrar |
|---|---|---|---|
| M0 | Matriz por modelo/serie/regla y ensayos mínimos | Cerrado 03/10/2026 | [Matriz](docs/paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md), 97 pares, 47 pruebas, typechecks y arquitectura; no volver a crearla, regenerar si cambian las fuentes |
| E1 | Despunte de cabecera: base, momento y reparto | En curso 04/10/2026; G1–G5 verificados, G6-incidencia preservada | [Evidencia](docs/paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md): alta independiente/reparto por bases/persistencia demostrados. Pendiente autorización para quitar solo tercer GRUPO de incidencia y verificar edición sin alta antes de precisión. Sin aplicación web ni nueva medición |
| E2 | Unión material de otra serie en GRUPO | Pendiente | Selección desde diagnóstico privado de los ocho casos de iteración 13; código/serie/acabado y geometría demostrados, sin extrapolar U |
| E3 | Comisión: orden de redondeo y edición de líneas guardadas | Pendiente | Caso 0/−10/+10, suma de filas y momento de aplicación; separar cantidades/horas; seis residuos comunicados |
| E4 | Tapajuntas de puerta con inferior SI/NO | Pendiente | GMT004, 1P 867×2098 con serie/ala/cajón reales; comparación lateral y travesaño |
| E5 | Compacto y metraje COMPVAL | Pendiente | Identificar hueco/ventana/accesorio, COM009, cajón, vuelos y opciones; discriminar 4,93/4,94 con PVP vigente |
| E6 | Acristalamiento alternativo y vidrio por elemento | Pendiente | Mapeo observado de opción/nTAcris/tablas/junquillos/juntas; iniciar con 1/2/3 y mismo vidrio |
| E7 | Conservación de medidas fraccionarias | Pendiente de observación | C2 970×439,5 y 970×1999,5: entrada, cortes, guardar/reabrir; configuración histórica ya resuelta, no reimplementar |
| E8 | Tramos y opciones de herraje | Condicionado | Solo si falta cobertura tras catálogo/CHM/diagnóstico; límite real del corte de hoja, no dimensión exterior supuesta |
| E9 | Referencias, cotas y divisiones restantes | Condicionado | Aislar cadena en los cortes discrepantes; predicción independiente de la instancia |
| E10 | Acabado efectivo UNI/L y selección PVP | Pendiente de investigación | Comparar acabado de pieza, selector y tarifa; no normalizar por coincidencia económica |
| E11 | Mínimos, múltiplos e intervalos restantes | Condicionado | Usar límites reales de catálogo y entradas compatibles a ambos lados de cada frontera |
| A1 | Aceptación en web publicada | Pendiente; independiente de los ensayos | Valorar, guardar, recargar y PDF del caso recibido; precio actual, sin exigir el antiguo 652,24 € |
| D1 | Reconciliar ficha de acceso de July | Pendiente documental | Actualizar información antigua con fuente/fecha del relevo; distinguir verificación recibida de comprobación directa |

Detalles E2–E11: [ensayos mínimos](docs/paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md).
A1 y D1: [estado operativo](docs/ESTADO-ACTUAL.md).
Los recuentos se solapan: no sumarlos como previsión de líneas recuperadas.
El orden es una prioridad, no una obligación de detenerse si una fuente concreta
falta: registrar qué falta y avanzar con otra tarea autorizada e independiente.

## Ciclo de cada regla

1. Leer estado, este registro y evidencia actual; comprobar resultados de otras
   conversaciones y cambios del código. Reutilizar lo demostrado.
2. Investigar catálogo, configuración, manual y despiece guardado. Formular las
   hipótesis que siguen abiertas y elegir la comparación mínima que las separa.
3. Observar solo lo necesario en documentos nuevos de 0017, dentro de los
   límites vigentes. Registrar entradas/salidas/capturas privadas y variantes.
4. Si hace falta extracción, obtener copia estable y verificable coordinada con
   el operador. Adaptar explícitamente el lector a esa fuente, conservando su
   proyección técnica y controles; no disfrazar una base activa como Anterior.
5. Con regla demostrada, decidir si el código necesita corrección. Una causa
   por iteración, fixture sintética y módulo propietario. Si no necesita cambio,
   documentar por qué y cubrir el comportamiento cuando corresponda.
6. Ejecutar pruebas/typechecks pertinentes y arquitectura si cambian fronteras;
   medir el banco cuando cambia el motor. Conservar igualdades, denominador y
   exclusiones, o justificar expresamente cualquier cambio de alcance.
7. Cerrar la documentación de la misma entrega mediante el procedimiento de
   mantenimiento siguiente. Después mover el puntero «Siguiente paso» al primer
   trabajo abierto que pueda avanzar, enlazando su evidencia.

Estados: **Pendiente → En curso → Evidencia lista → Implementado → Verificado
→ Cerrado**. Usar solo las etapas aplicables. Observar no equivale a implementar;
implementar no equivale a verificar. «Condicionado» espera una brecha concreta.
Un caso no discriminante conserva la tarea abierta y concreta el próximo ensayo.
Un cierre requiere fecha, alcance, evidencia y verificaciones o motivo demostrado
de no necesitar cambio. No cerrar por haber redactado un plan.

## Instrucción obligatoria de mantenimiento documental

El usuario ha pedido actualizar o eliminar documentos de tareas para evitar
repeticiones y errores. **Forma parte de cada entrega, no se pospone a otra tarea.**

1. Buscar el ID de la tarea, su descripción y enlaces en este roadmap, estado,
   relevos, planes, ensayos e índice. Consultar también el item July existente
   cuando la tarea se siga allí; usar proyecto/sync_uid, no solo ID local.
2. Actualizar aquí la fila existente, con fecha/evidencia y etapa real. No crear
   otra tarea para el mismo trabajo ni duplicar su estado en nuevos relevos.
3. Actualizar ESTADO-ACTUAL y los procedimientos afectados: quitar instrucciones
   ya satisfechas, corregir condiciones antiguas y enlazar lo que queda pendiente.
   No sustituir un resultado histórico por un resultado reciente sin atribución.
4. **Eliminar** planes/relevos de tareas duplicados o agotados cuando no contengan
   evidencia ni decisiones únicas y toda información útil esté ya integrada.
   Comprobar sus enlaces entrantes y corregirlos antes de eliminar el archivo.
5. **Conservar como histórico** lo que contenga evidencia o decisiones únicas:
   añadir al principio fecha, «Histórico; no ejecutar como lista de tareas» y
   enlace al documento vigente. Actualizar índice y enlaces si se mueve a
   docs/historico. Un documento mixto puede conservar la evidencia y retirar
   únicamente sus instrucciones vencidas.
6. Informes del banco, capturas, fuentes y resultados fechados no se eliminan
   para ocultar una discrepancia. Los archivos privados, secretos y datos reales
   conservan sus límites; la limpieza de tareas no autoriza borrarlos.
7. Actualizar el item July existente cuando corresponda; si hay coordinación
   entre equipos, seguir su flujo de publicación/recepción vigente. Un cambio
   local no acredita publicación ni recepción remota. No mandar mensajes a
   otra conversación sin autorización humana.
8. Revisar enlaces, diff y git status. Entregar una nota breve de documentos
   actualizados, retirados o conservados como histórico y de la siguiente tarea.

Antes de finalizar, comprobar que ninguna instrucción operativa vigente vuelve
a pedir el trabajo cerrado y que las menciones antiguas restantes se identifican
claramente como evidencia histórica. Los detalles históricos no prevalecen
sobre este registro y ESTADO-ACTUAL.

## Cierres registrados

| Fecha | Tarea | Evidencia / mantenimiento realizado |
|---|---|---|
| 03/10/2026 | M0 | Matriz e informe reproducible entregados; estado, paridad, banco e índice actualizados |
| 03/10/2026 | Roadmap y preparación de E1 | Procedimiento de despunte creado; regla de mantenimiento incorporada a AGENTS; relevo de raíz actualizado y ensayos remitidos a este registro. E1 sigue pendiente de ejecución |

Avance sin cierre, 04/10/2026: E1 tiene evidencia documental y un diagnóstico
reproducible de otra copia Windows, observación A–F y copia privada F de 0017.
Trece pruebas de diagnóstico/fronteras y 47 existentes, typechecks y arquitectura.
Complementario posterior G1–G5 demuestra alta y reparto por bases; precisión
sigue abierta tras G6-incidencia, sin recálculo nuevo. No confundir
ese corpus con el banco vigente ni cerrar por la coincidencia de costes.

## Instrucción breve para continuar

> Lee AGENTS.md, docs/ESTADO-ACTUAL.md y ROADMAP-PARIDAD-PRODUCTOR.md.
> Continúa la primera tarea abierta que pueda avanzar; actualmente E1 mediante
> docs/paridad/PASO-E1-DESPUNTE.md, tras leer EVIDENCIA-E1-DESPUNTE-2026-10-04.md.
> Usa copia F y resultados A–F; el residuo B/D ya está explicado por margen GID.
> G1–G5 entregados. Conserva G6-incidencia: quitar solo tercer GRUPO requiere autorización solicitada; verificar edición de segunda línea antes de precisión. No repitas A–F, G1–G5 ni contraste histórico.
> Comprueba evidencia posterior de visión. En cada entrega, actualiza el estado y elimina,
> actualiza o marca como históricos sus documentos obsoletos; repara enlaces y
> deja el siguiente paso concreto. No repitas M0 ni las correcciones ya verificadas.
