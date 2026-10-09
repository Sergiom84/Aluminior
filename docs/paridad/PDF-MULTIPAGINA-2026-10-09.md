# PDF multipágina — aceptación local del 09/10/2026

Estado: **corrección publicada y verificada; formato comercial pendiente**.
Registro único: [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md), P.2.
Entrada: [estado actual](../ESTADO-ACTUAL.md). No es un segundo backlog.

## Punto de partida y alcance

Se recuperó la continuación S1/A2 de la conversación anterior, cuyo cierre
estaba en el worktree `auditoria-presupuestos/Aluminior` y aún no se había
reflejado en el checkout principal. Render se volvió a consultar en lectura:
`dep-db4gon142hec73cjfca0`, live, commit `7ad0ee23d666d9ff8835b60aafb4dba261e582a3`,
finalizado el 09/10 a las 15:48:17 UTC. La pestaña publicada conserva 260009 y
805,65 €. Audit independiente sobre la entrega S1: 0 avisos completos y de
producción. No se repiten S1, A1 ni A2.

P.2 se trabaja en `codex/pdf-multipagina`, worktree
`/Users/sergio/.codex/worktrees/pdf-multipagina/Aluminior`, desde `7ad0ee2`.
Los commits de tarifas del main principal permanecen excluidos.
Solo cambia la agrupación visual de un bloque PDF; no cambia valoración,
consultas, importes, dependencias, migraciones versionadas ni datos remotos.

## Evidencia y corrección mínima

- [Contrato PDF](PARIDAD-PRODUCTOR.md): misma configuración persistida, varias
  líneas/páginas, textos largos, decimales y revisión del render.
- [RECON-CERRAMIENTOS §4 quater](RECON-CERRAMIENTOS.md#4-quater-resultado-en-el-presupuesto):
  una línea GRUPO con dibujo, medidas e importes asociados.
- [Fase 7](fase-7/00-resumen.md): la prueba histórica de una página no acredita
  réplica integral del documento comercial de Productor. Las hojas de corte
  multipágina no se utilizan como prueba del formato de presupuesto comercial.

Reproducción: en un PDF sintético de veinte cerramientos, «Línea 3» quedó
al final de la página 1, mientras su dibujo, medidas y colocación empezaban
la página 2 sin rótulo. Ocurrió también en líneas 6, 9, 12, 15 y 18.
`minPresenceAhead=150` reservaba menos que el bloque completo.

`pdf/fila.tsx` hace indivisible el bloque existente de rótulo, dibujo, medidas
y mano de obra con `wrap={false}`. El contrato de BD limita la mano de obra
a fabricación adicional y colocación, como máximo dos conceptos por línea.
La descripción continúa siendo divisible; no se obliga a meter una fila de
texto arbitrariamente larga en una página. El verificador rechaza el PDF
anterior por rótulos/medidas separados y acepta los documentos corregidos.

## Verificación reproducible

Generador y verificador en
[packages/web/pruebas/pdf-multipagina](../../packages/web/pruebas/pdf-multipagina/README.md).
Usan el componente PDF real y datos sintéticos, sin BD ni `.env`.

| Escenario | Páginas | Comprobación |
|---|---:|---|
| Vacío | 1 | Nombre libre, sin líneas, cero legítimo y condiciones |
| Veinte líneas mixtas | 6 | Artículos/GRUPO, quince dibujos, cantidades e importes |
| Descripción extensa | 6 | Continuidad de 240 bloques, comienzo/final y dibujo posterior |
| Condiciones extensas | 3 | Forma de pago y observaciones, 235 bloques sin pérdida |
| Incompleto | 3 | Cero legítimo, precio ausente y mano de obra ausente diferenciados |
| Composiciones extremas | 2 | Vertical/horizontal, conjunto bidimensional, FI y fracciones |

Resultado: **6/6 escenarios, 21 páginas, 628 marcadores y 28 bloques de dibujo/MO**.
Parser estricto, A4, numeración de pies, texto y trazos dentro del área útil,
precios/importes, totales únicos juntos, rótulo/medidas/MO en la misma página.
Se renderizaron e inspeccionaron visualmente las 21 páginas. La prueba negativa
con un marcador ausente devuelve código 1. La comprobación geométrica no
sustituye la inspección visual. Se mantienen las cabeceras y el formato existentes;
no se asume una regla nueva de repetición de cabeceras de Productor.

Pruebas web: **741 correctas**. Typechecks de los cuatro paquetes, build Next
15.5.27 y arquitectura correctos; última arquitectura 747 archivos, 376 módulos,
0 infracciones. Tipos web repetidos tras añadir fixture/generador. No se repitió
el banco económico ni se anuncia una nueva cobertura. Core, DB y ETL conservan
sus verificaciones de S1/A2; no se suman aquí como ejecuciones nuevas.

## Endpoint real y persistencia local

Base exclusiva `aluminior_pdf_test`, PostgreSQL Docker local y datos sintéticos.
Se aplicaron las migraciones ya existentes solo en esa base vacía. Preparación
privada en `output/pdf/p2-web/preparar.ts`: rechaza una base poblada y no lee `.env`.
Documento QA 990001 revisión 2, ID `3c5e1380-c740-4c08-aa03-246c1b1b9fb6`:
12 líneas GRUPO con snapshots de la fixture de integración existente, tres
unidades por línea y colocación de 1 h / 1,00 € por línea.

La app local muestra las doce líneas, base 2172,00 €, IVA 456,12 € y total
2628,12 €. Descarga desde el enlace Emitir del navegador: **4 páginas**, tres
bloques completos por página, las doce líneas y el total preservados.
Se inspeccionó el archivo descargado, no se dio por validado el visor IAB.
No se crean ni revaloran documentos en Render. No se cambió la interfaz web.

Evidencia privada ignorada en el worktree:
`output/pdf/p2-antes/` (reproducción), `output/pdf/p2/` (seis PDF, JSON,
manifest, verificacion y PNG), `output/pdf/p2-web/` (snapshot/endpoint).
Logs privados: `/tmp/aluminior-p2-*.log`,
`/tmp/p2-baseline-verificador.json`, `/tmp/p2-endpoint.json`.

## Etapa y siguiente paso

La aceptación sintética local está terminada. Publicación autorizada por Sergio y
completada el 09/10 a las 16:29:21 UTC (18:29:21 Madrid): Render live
`dep-db4hbvp7lnhs739a7l7g`, commit `46c613d8018bf20968115239170229c15c40ccb2`.
Descarga autenticada posterior del PDF 260009: archivo válido, una página,
«Línea 1» y total 805,65 €. Verificación de sólo lectura, sin reguardar ni cambiar datos.
La regresión multipágina de 21 páginas es local; el documento remoto comprobado
tiene una sola página. No confundir ambos alcances.
Queda la aceptación del formato comercial con evidencia Productor/titular.
A3 publicado/verificado en a06cd4f; 0029 aplicada. Siguiente según roadmap.
No repetir los seis escenarios como investigación nueva; son regresión reutilizable.

Se incorporó el cierre previo S1/A2 y se actualizaron roadmap, estado, relevo,
índice, informe A1 y contrato de paridad. En el checkout principal se sincroniza
solo la documentación, preservando sus notas de tarifas y todos los cambios de
código anteriores. Su main sigue en `787d1ad`: no publicar desde ese checkout.
July 205 (`e852cf44a94f7b81f1d9b98817cd53bd`) se mantiene en curso hasta cerrar el
alcance restante; actualización local no acredita sync ni recepción remota.
E1 y S2 conservan sus condiciones. No se eliminó evidencia histórica.

Continuación A3: [publicación y verificación](IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md), a06cd4f y 0029 aplicada; no repetir el trabajo entregado.
