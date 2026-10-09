# Roadmap operativo de paridad con Productor

Actualizado: 09/10/2026. Entrada del proyecto: [ESTADO-ACTUAL](docs/ESTADO-ACTUAL.md).
Este archivo es el registro único del orden y estado de estas tareas.
Los documentos de ensayo explican cómo realizarlas; los informes fechados
conservan evidencia. Sus antiguas listas de pendientes no sustituyen este registro.


## Siguiente paso

**S3 verificado en CI el 09/10:** 1.448 pruebas correctas/una condicionada a CSV privado, seis recorridos de navegador, tipos, arquitectura y build en 36a47f4. Siguiente Mac: tramo técnico P.6/P.7, teclado/foco/responsive. [Evidencia](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md#s3-validación-completa-de-los-paquetes-en-ci--09102026).

**A3 publicado/verificado el 09/10 en `a06cd4f`, con 0029 aplicada.** A4 publicado/verificado en `487feb1`: 0030 aplicada, conexiones renovadas y alta/edición/recarga/copia/PDF decimales comprobados en producción. A5 verificado en GitHub Actions (run 37971854995, seis recorridos correctos). D1 reconciliado localmente. [Informe](docs/paridad/MEDIDAS-Y-CI-2026-10-09.md). E1 depende de Windows; P.2 conserva aceptación comercial y S2 el anuncio del 14/10.

**S1 y A2 publicados y verificados el 09/10**, Render live `7ad0ee2`: dependencias
sin avisos npm publicados a la fecha, 1.431 pruebas y miniaturas de conjunto.
260009 reguardado/recargado conserva 805,65 € y avisos. [Informe y límites](docs/paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md).
**S2**: revisar el anuncio Next previsto para el 14/10 cuando se publiquen las
versiones afectadas/corregidas. Sin seguimiento automático creado.

### Siguiente investigación económica

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
| E6 | Acristalamiento alternativo y vidrio por elemento | Contención publicada 09/10; paridad pendiente | Motor catálogo rechaza precio falso de opción 1 para opción alternativa y guarda incompleto.  Mapeo observado de opción/nTAcris/tablas/junquillos/juntas; iniciar con 1/2/3 y mismo vidrio |
| E7 | Conservación de medidas fraccionarias | Pendiente de observación | C2 970×439,5 y 970×1999,5: entrada, cortes, guardar/reabrir; configuración histórica ya resuelta, no reimplementar |
| E8 | Tramos y opciones de herraje | Condicionado | Solo si falta cobertura tras catálogo/CHM/diagnóstico; límite real del corte de hoja, no dimensión exterior supuesta |
| E9 | Referencias, cotas y divisiones restantes | Condicionado | Aislar cadena en los cortes discrepantes; predicción independiente de la instancia |
| E10 | Acabado efectivo UNI/L y selección PVP | Pendiente de investigación | Comparar acabado de pieza, selector y tarifa; no normalizar por coincidencia económica |
| E11 | Mínimos, múltiplos e intervalos restantes | Condicionado | Usar límites reales de catálogo y entradas compatibles a ambos lados de cada frontera |
| A1 | Aceptación en web publicada | Cerrado el recorrido auditado 09/10 | [Auditoría](docs/paridad/AUDITORIA-FUNCIONAL-2026-10-09.md): Render live f6d5bcd, 260009 guardado/recargado y PDF válido 805,65 €. Visor IAB gris, archivo comprobado aparte. No certifica todas las familias, fabricación ni precio |
| S1 | Mantenimiento de dependencias | Publicado/verificado 09/10 | b1682a3 incluido en Render live 7ad0ee2; audit 11→0 / producción 4→0; ci, 1.431 tests, tipos, arquitectura y build correctos. Guardado/recarga/PDF 260009; no cubre el anuncio futuro S2 |
| S2 | Revisar anuncio de seguridad Next.js del 08/10 | Pendiente de publicación prevista 14/10 | Consultar advisory y versiones cuando estén publicados; alcance aún desconocido. No darlo por corregido porque el audit actual quede limpio. Fuente en informe de mantenimiento; sin automatización creada |
| A2 | Miniatura del GRUPO completo | Publicado/verificado 09/10 | 7ad0ee2; tres módulos desiguales con dos uniones guardados/reabiertos en QA, SVG/PDF completos; teclado y escritorio/móvil. Basado en RECON-CERRAMIENTOS §4 quater; sin cambios de valoración |
| A3 | Idempotencia de nueva cabecera y copia | Publicado/verificado 09/10 | a06cd4f live; 0029 aplicada, RLS y documentos previos conservados. Alta/copia/revisión sintéticas y tres reintentos READ ONLY remotos con mismos IDs; pérdida HTTP física local. Ver informe A3 |
| P.2 | Aceptación PDF multipágina | Paginación publicada/verificada 09/10; formato comercial pendiente | [Informe](docs/paridad/PDF-MULTIPAGINA-2026-10-09.md): 6 escenarios, 21 páginas, 628 marcadores, 28 bloques; endpoint local 12 líneas/4 páginas. 741 tests web, tipos/build/arquitectura. Render live 46c613d, endpoint 260009 verificado (1 página, 805,65 €); formato comercial Productor/titular pendiente. July 205 |
| A4 | Conservar medidas exteriores decimales | Publicado/verificado 09/10 | Render live 487feb1, 0030 aplicada; alta/edición/recarga/copia/PDF decimales en producción, documentos previos intactos. 757 tests web y 56 BD. No cierra E7 |
| A5 | Recorrido sintético de navegador en CI | Verificado local y CI 09/10 | Seis recorridos escritorio/móvil: postcommit, medidas, latencia/fallo de catálogo y teclado; GitHub Actions run 37971854995 correcto |
| S3 | Validación completa de paquetes en CI | Verificado local y CI 09/10 | 9bf9a64/36a47f4: 1.448 tests correctos/uno condicionado a CSV privado; tipos, arquitectura y build, run 37978474635. Seis recorridos, run 37978474739. Corrige test ETL obsoleto y contrato de fixture PDF; no toca producción |
| P.6/P.7 | Teclado, foco y adaptación responsive | Pendiente; tramo técnico abordable desde Mac | July 206: auditar foco, teclado, overflow, zoom 200% y reduced motion. Correcciones técnicas verificables localmente; contraste integral Productor y aceptación humana separados |
| D1 | Reconciliar ficha de acceso de July | Cerrado local 09/10 | Ficha actualizada con comprobación directa A4, Render live 487feb1 y 31 migraciones; historial fechado preservado. Sin sync/recepción acreditados |

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

Cierre A3, 09/10/2026: a06cd4f live en Render y migración 0029 aplicada.
Tres operaciones sintéticas y sus recibos comprobados; documentos anteriores intactos.

## Cierres registrados

| Fecha | Tarea | Evidencia / mantenimiento realizado |
|---|---|---|
| 09/10/2026 | S1/A2 | Publicadas en 7ad0ee2; audit 0, 1.431 pruebas, QA completa de tres módulos y prueba publicada 260009 con importes conservados. Estado/roadmap/relevo actualizados; siguiente P.2, S2 condicionado a publicación 14/10 |
| 09/10/2026 | A1 | Correcciones f6d5bcd publicadas; 260009 editado/guardado/recargado y PDF descargado válido. Informe, estado, índice y relevo actualizados. Límites de catálogo y visor IAB conservados; S1 siguiente |
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
> S1/A2 publicados y verificados; lee docs/paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md.
> P.2 publicado y verificado en 46c613d: lee docs/paridad/PDF-MULTIPAGINA-2026-10-09.md.
> A3 publicado/verificado en a06cd4f y 0029 aplicada: lee docs/paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md. No repetir.
> P.2: sólo queda aceptación comercial, July 205; no repetir paginación.
> Checkout aislado a3-idempotencia/Aluminior, rama codex/ci-validacion-completa desde origin/main eb3b53c. Comprobar estado remoto antes de continuar; main local contiene cambios ajenos.
> S2 requiere revisar el anuncio Next cuando se publiquen versiones el 14/10. No repetir S1/A2.
> Mac: A4 publicado/verificado en 487feb1, 0030 aplicada; A5 CI alojada correcta, run 37971854995; D1 cerrado local. No repetir esta entrega. Siguiente Mac: tramo técnico P.6/P.7 (foco, teclado y responsive). P.2 conserva aceptación comercial; E1/E7 requieren Windows y S2 espera al 14/10. Lee docs/paridad/MEDIDAS-Y-CI-2026-10-09.md.
> La siguiente investigación económica sigue siendo E1 mediante
> docs/paridad/PASO-E1-DESPUNTE.md, tras leer EVIDENCIA-E1-DESPUNTE-2026-10-04.md.
> Usa copia F y resultados A–F; el residuo B/D ya está explicado por margen GID.
> G1–G5 entregados. Conserva G6-incidencia: quitar solo tercer GRUPO requiere autorización solicitada; verificar edición de segunda línea antes de precisión. No repitas A–F, G1–G5 ni contraste histórico.
> Comprueba evidencia posterior de visión. En cada entrega, actualiza el estado y elimina,
> actualiza o marca como históricos sus documentos obsoletos; repara enlaces y
> deja el siguiente paso concreto. No repitas M0 ni las correcciones ya verificadas.
