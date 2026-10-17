# Índice de documentación

Entrada de trabajo: [ESTADO-ACTUAL.md](ESTADO-ACTUAL.md).
Clasificación documental inicial sobre `9bc879e` y comprobación local del 02/10.
Revisión del 10/10/2026: 84 Markdown de `origin/main` `9673659` y una
propuesta entonces exclusiva del main local (integrada como herramienta el 13/10, sin aplicar tarifas). A3/A4 y S3 ya entregados; Render live
487feb1 reconsultado, CI S3 correcta.
[Informe e inventario](AUDITORIA-DOCUMENTAL-2026-10-10.md). Estados en el roadmap.


## Lectura operativa

| Documento | Uso |
|---|---|
| [Relevo REA 17/10 para otra conversación](paridad/RELEVO-REA-PRODUCTOR-2026-10-17.md) | Arranque autónomo, trabajo realizado, rutas/evidencias, siguiente unidad y límites; no sustituye los estados del roadmap |
| [Investigación REA 16/10](paridad/INVESTIGACION-REA-PRODUCTOR-2026-10-16.md) | Inventario ampliado, metadatos/contratos managed y pseudocódigo nativo dirigido; evidencia privada, límites e integridad |
| [Comparación REA 16/10](paridad/COMPARACION-REA-PRODUCTOR-2026-10-16.md) | Capacidades Productor frente al código actual; implementado, parcial y sin módulo localizado; prioridades sin porcentaje de paridad |
| [Contrato y lote E1 ClonerSoft 13/10, continuaciones 14/10 y 17/10](paridad/IMPLEMENTACION-CLONERSOFT-E1-2026-10-13.md#comparación-y-normalización-de-claves) | Físico/condicional, layout, consumidor/COM, receptores, control/reparto/totales, formato, proveedor/fallback, carga e índice seguidos; continuación estática de inicializador del comparador y bifurcación del normalizador. Siguiente: cuerpo de clave de fila `+0x38` / TypeLib `0xabcd8` y transformaciones `0x1107094a / +0x3c`, `0x110709d2 / +0x44`; sin prioridad primera/última, equivalencia ni semántica efectiva demostradas. Valores efectivos, agregados y persistencia pendientes |
| [Selector de registros de tarifa dinámica 14/10](paridad/IMPLEMENTACION-CLONERSOFT-TARIFA-DINAMICA-2026-10-14.md) | Cuatro búsquedas, intervalos decimales y ambigüedad; unidad pura local, sin precio ni activación |
| [Encargo ClonerSoft 13/10](paridad/ENCARGO-IMPLEMENTACION-CLONERSOFT-2026-10-13.md) | Alcance de implementación local, fuentes y protecciones; el roadmap conserva etapas/orden |
| [Extracción diferencial 13/10](paridad/EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md) | Evidencia estática/documental reutilizable, inventarios y límites; fotografía de integración abierta anterior a `fa32fba` |
| [Publicación ClonerSoft 12/10](paridad/PUBLICACION-CLONERSOFT-2026-10-12.md) | `40cedd1` live, 0031/0032/carga, respaldo/restauración, CI y QA remoto/preservación; C1 técnico acotado y P.6/P.7 parcial |
| [Investigación ClonerSoft 12/10](paridad/INVESTIGACION-CLONERSOFT-2026-10-12.md) | Fuentes/ejercicios, REA efectiva, contrato C1 dimensional, evidencia local y enlace a su publicación; E1/E2/E6 abiertos |
| [Continuar en Windows](CONTINUAR-EN-WINDOWS.md) | Recepción, fuentes privadas, P.2, E1/E7 y prompt de continuación |
| [Auditoría documental 10/10](AUDITORIA-DOCUMENTAL-2026-10-10.md) | Hallazgos, cambios, verificación y límites |
| [Inventario documental 10/10](INVENTARIO-DOCUMENTAL-2026-10-10.md) | Clasificación y tratamiento de todo el corpus revisado |
| [Tarifa de doble acristalamiento](TARIFA-DOBLE-ACRISTALAMIENTO.md) | Herramienta integrada el 13/10; propuesta no aplicada, hipótesis y decisión del titular pendientes |
| [Medidas y CI 09/10](paridad/MEDIDAS-Y-CI-2026-10-09.md) | A4 publicado/verificado, 0030 aplicada; A5 navegador/CI, S3 validación de paquetes y D1 ficha July |
| [Idempotencia 09/10](paridad/IDEMPOTENCIA-PRESUPUESTOS-2026-10-09.md) | A3: reproducción, implementación, pérdida HTTP real y migración aplicada y publicación verificada |
| [README](../README.md) | Arranque y comandos |
| [PDF multipágina 09/10](paridad/PDF-MULTIPAGINA-2026-10-09.md) | P.2: reproducción, corrección, regresión sintética, endpoint local y publicación 46c613d verificada |
| [Mantenimiento y miniaturas 09/10](paridad/MANTENIMIENTO-Y-MINIATURAS-2026-10-09.md) | S1 y A2: dependencias, evidencia de dibujo y verificación de la continuación |
| [Auditoría funcional 09/10](paridad/AUDITORIA-FUNCIONAL-2026-10-09.md) | Fallos reproducidos, correcciones, aceptación y mejoras propuestas |
| [Estado actual](ESTADO-ACTUAL.md) | Estado, riesgos y siguiente paso |
| [Roadmap de paridad](../ROADMAP-PARIDAD-PRODUCTOR.md) | Registro único de etapas/orden de tareas e instrucciones para actualizar o retirar documentos obsoletos |
| [Paso E1: despunte](paridad/PASO-E1-DESPUNTE.md) | G1–G5 entregados; G6-incidencia preservada. Recuperar dos líneas tras autorización para quitar solo tercer GRUPO y verificar edición antes de precisión |
| [AGENTS](../AGENTS.md) / [CLAUDE](../CLAUDE.md) | Contratos de trabajo |
| [Arquitectura](../ARQUITECTURA.md) | Responsabilidades y fronteras |
| [Paridad](paridad/PARIDAD-PRODUCTOR.md) | Mapa de evidencia y aceptación |
| [BD local](../packages/db/README.md) | Mac/Docker y aislamiento de tests |

## Evidencia y referencias de paridad

Las observaciones y mediciones fechadas se conservan. Sus antiguos «pendientes»
no son una lista de tareas: el estado enlaza al roadmap vigente y su siguiente paso.
Los antecedentes con nombres de prompt o roadmap contienen información única;
se conservan como fuentes inactivas, sin reactivar instrucciones ni permisos.

| Documento | Uso |
|---|---|
| [AUDITORIA-FASE-0-CORRECCIONES-TERRA.md](paridad/AUDITORIA-FASE-0-CORRECCIONES-TERRA.md) | Evidencia o verificación fechada; conservar sus límites |
| [BANCO-COMPARACION-PRECIOS.md](paridad/BANCO-COMPARACION-PRECIOS.md) | Banco diagnóstico; contexto económico pendiente |
| [BANCO-CONTRASTE-2026-10-03.md](paridad/BANCO-CONTRASTE-2026-10-03.md) | Medición local de presupuestos reales, exclusiones, causas y propuestas |
| [MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md](paridad/MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md) | Fuentes, implementación, contraste y variantes por regla; enlaza el detalle por modelo/serie |
| [COBERTURA-MODELO-SERIE-2026-10-03.md](paridad/COBERTURA-MODELO-SERIE-2026-10-03.md) | Informe reproducible de despieces guardados: 97 pares, campos, variantes y ausencias de contraste |
| [ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md](paridad/ENSAYOS-MINIMOS-PRODUCTOR-2026-10-03.md) | Comparaciones discriminantes priorizadas; estados y coordinación con visión |
| [CATALOGO-REAL-2026-10-02.md](paridad/CATALOGO-REAL-2026-10-02.md) | Catálogo visual y ejecución informada de 0022 |
| [CIERRE-JORNADA-2026-09-20.md](paridad/CIERRE-JORNADA-2026-09-20.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-ASIGNACION-HERRAJE.md](paridad/EVIDENCIA-ASIGNACION-HERRAJE.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-COTAS-0017.md](paridad/EVIDENCIA-COTAS-0017.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-EDITOR-LINEA.md](paridad/EVIDENCIA-EDITOR-LINEA.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-ESCAPARATE.md](paridad/EVIDENCIA-ESCAPARATE.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-MANOS-0017.md](paridad/EVIDENCIA-MANOS-0017.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-VIDEO-PRESUPUESTO.md](paridad/EVIDENCIA-VIDEO-PRESUPUESTO.md) | Evidencia o verificación fechada; conservar sus límites |
| [EVIDENCIA-E1-DESPUNTE-2026-10-04.md](paridad/EVIDENCIA-E1-DESPUNTE-2026-10-04.md) | Manual, contraste histórico, A–F y G1–G5 verificados; G6-incidencia conservada y precisión pendiente; E1 abierto |
| [INTEGRACION-MOTOR-CATALOGO-2026-10-02.md](paridad/INTEGRACION-MOTOR-CATALOGO-2026-10-02.md) | Motor integrado, ensayos y procedimiento pendiente |
| [OBSERVACION-PRODUCTOR-2026-09-20.md](paridad/OBSERVACION-PRODUCTOR-2026-09-20.md) | Evidencia o verificación fechada; conservar sus límites |
| [PARIDAD-PRODUCTOR.md](paridad/PARIDAD-PRODUCTOR.md) | Mapa y criterios de aceptación |
| [PREPARACION-LOCAL-A.md](paridad/PREPARACION-LOCAL-A.md) | Evidencia o verificación fechada; conservar sus límites |
| [RECON-ARTICULOS.md](paridad/RECON-ARTICULOS.md) | Evidencia o verificación fechada; conservar sus límites |
| [RECON-CERRAMIENTOS.md](paridad/RECON-CERRAMIENTOS.md) | Evidencia o verificación fechada; conservar sus límites |
| [RECON-CONFIGURADOR.md](paridad/RECON-CONFIGURADOR.md) | Evidencia o verificación fechada; conservar sus límites |
| [RECON-DESPIECE-UNIDAD.md](paridad/RECON-DESPIECE-UNIDAD.md) | Evidencia o verificación fechada; conservar sus límites |
| [RECON-DETALLE-PRESUPUESTO.md](paridad/RECON-DETALLE-PRESUPUESTO.md) | Evidencia o verificación fechada; conservar sus límites |
| [SPEC-MANO-DE-OBRA.md](paridad/SPEC-MANO-DE-OBRA.md) | Contrato de horas manuales y mediciones originales |
| [VERIFICACION-CODEX-2026-09-19.md](paridad/VERIFICACION-CODEX-2026-09-19.md) | Evidencia o verificación fechada; conservar sus límites |
| [VERIFICACION-MANOS-B1.md](paridad/VERIFICACION-MANOS-B1.md) | Evidencia o verificación fechada; conservar sus límites |
| [antecedentes/PROMPT-FASE-0-PARIDAD-PRODUCTOR.md](paridad/antecedentes/PROMPT-FASE-0-PARIDAD-PRODUCTOR.md) | Evidencia o verificación fechada; conservar sus límites |
| [antecedentes/ROADMAP.md](paridad/antecedentes/ROADMAP.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-1/00-resumen.md](paridad/fase-1/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-1/05-verificacion-local.md](paridad/fase-1/05-verificacion-local.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-2/00-resumen.md](paridad/fase-2/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-2/01-geometria-y-evidencias.md](paridad/fase-2/01-geometria-y-evidencias.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-2/03-aceptacion-local.md](paridad/fase-2/03-aceptacion-local.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-3/00-resumen.md](paridad/fase-3/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-3/01-evidencia-composicion.md](paridad/fase-3/01-evidencia-composicion.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-4/00-resumen.md](paridad/fase-4/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-4/01-evidencia-actualizar-y-diseno-v3.md](paridad/fase-4/01-evidencia-actualizar-y-diseno-v3.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-5/00-resumen.md](paridad/fase-5/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-6/00-resumen.md](paridad/fase-6/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-7/00-resumen.md](paridad/fase-7/00-resumen.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-7/02-investigacion-fuentes-2026-09-27.md](paridad/fase-7/02-investigacion-fuentes-2026-09-27.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-7/04-cobertura-integral-y-facturas-2026.md](paridad/fase-7/04-cobertura-integral-y-facturas-2026.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-7/05-primer-barrido-facturas-2026.md](paridad/fase-7/05-primer-barrido-facturas-2026.md) | Evidencia o verificación fechada; conservar sus límites |
| [fase-7/06-reglas-catalogo-despiece-completo.md](paridad/fase-7/06-reglas-catalogo-despiece-completo.md) | Evidencia o verificación fechada; conservar sus límites |

| [07-acristalamiento-gm60.md](paridad/fase-7/07-acristalamiento-gm60.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [08-cortes-tres-hojas.md](paridad/fase-7/08-cortes-tres-hojas.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [09-continuacion-local.md](paridad/fase-7/09-continuacion-local.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [10-cotas-instancia.md](paridad/fase-7/10-cotas-instancia.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [11-discrepancias-investigadas.md](paridad/fase-7/11-discrepancias-investigadas.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [12-catalogo-visual-c2.md](paridad/fase-7/12-catalogo-visual-c2.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [13-cierre-cotas-c2.md](paridad/fase-7/13-cierre-cotas-c2.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [00-contrato.md](paridad/fase-8/00-contrato.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [01-inventario.md](paridad/fase-8/01-inventario.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [02-traductor.md](paridad/fase-8/02-traductor.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [03-fijos-operativos.md](paridad/fase-8/03-fijos-operativos.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [04-contrato-puerta-corredera.md](paridad/fase-8/04-contrato-puerta-corredera.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [05-puerta-corredera-y-relevo.md](paridad/fase-8/05-puerta-corredera-y-relevo.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [06-contrato-cotas-absolutas.md](paridad/fase-8/06-contrato-cotas-absolutas.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [07-mano-obra-fijos.md](paridad/fase-8/07-mano-obra-fijos.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [08-cotas-absolutas-y-relevo.md](paridad/fase-8/08-cotas-absolutas-y-relevo.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [09-contrato-03v-tmp.md](paridad/fase-8/09-contrato-03v-tmp.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [10-contraste-03v-2025.md](paridad/fase-8/10-contraste-03v-2025.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [11-tmp-03v-y-relevo.md](paridad/fase-8/11-tmp-03v-y-relevo.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [12-contrato-cotas-economicas.md](paridad/fase-8/12-contrato-cotas-economicas.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |
| [13-cotas-economicas-y-relevo.md](paridad/fase-8/13-cotas-economicas-y-relevo.md) | Evidencia local de septiembre incorporada el 13/10; estados y pendientes fechados, sin aceptación general de precio/fabricación |

## Histórico

Planes, entregas y propuestas cerradas. Contenido original conservado;
solo se corrigen destinos de enlaces por los movimientos aprobados.
Los originales fusionados también se guardan aquí. PLAN alcanza A–T.68.

| Documento | Procedencia / resolución |
|---|---|
| [ENTREGA.md](historico/ENTREGA.md) | Archivo histórico de ENTREGA.md |
| [ESPEC-ADAPTADOR-BANCO-MOTOR.md](historico/ESPEC-ADAPTADOR-BANCO-MOTOR.md) | Archivo histórico de ESPEC-ADAPTADOR-BANCO-MOTOR.md |
| [ESPEC-IMPLEMENTACION-1OFI.md](historico/ESPEC-IMPLEMENTACION-1OFI.md) | Archivo histórico de ESPEC-IMPLEMENTACION-1OFI.md |
| [ESPEC-MANOS-MANILLAS.md](historico/ESPEC-MANOS-MANILLAS.md) | Archivo histórico de ESPEC-MANOS-MANILLAS.md |
| [ESTADO-VALORACION.md](historico/ESTADO-VALORACION.md) | Hechos vigentes fusionados en ESTADO-ACTUAL |
| [HANDOFF-CHATGPT.md](historico/HANDOFF-CHATGPT.md) | Archivo histórico de HANDOFF-CHATGPT.md |
| [PLAN-EJECUCION-JAVI.md](historico/PLAN-EJECUCION-JAVI.md) | Archivo histórico de PLAN-EJECUCION-JAVI.md |
| [PLAN-PARIDAD-OPERATIVA.md](historico/PLAN-PARIDAD-OPERATIVA.md) | Archivo histórico de PLAN-PARIDAD-OPERATIVA.md |
| [PLAN-SIGUIENTE.md](historico/PLAN-SIGUIENTE.md) | Archivo histórico de PLAN-SIGUIENTE.md |
| [PLAN.md](historico/PLAN.md) | Archivo histórico de PLAN.md |
| [PREPARACION-TECNICA-COTAS-B2.md](historico/PREPARACION-TECNICA-COTAS-B2.md) | Archivo histórico de PREPARACION-TECNICA-COTAS-B2.md |
| [PROMPT-MAESTRO-FASES-0-A-8.md](historico/PROMPT-MAESTRO-FASES-0-A-8.md) | Criterios útiles fusionados en PARIDAD; encargo inactivo |
| [REVISION-1OFI.md](historico/REVISION-1OFI.md) | Archivo histórico de REVISION-1OFI.md |
| [REVISION-DOCUMENTAL-2026-09-27.md](historico/REVISION-DOCUMENTAL-2026-09-27.md) | Archivo histórico de docs/REVISION-DOCUMENTAL-2026-09-27.md |
| [SANEAMIENTO-MODULAR.md](historico/SANEAMIENTO-MODULAR.md) | Reglas vigentes fusionadas en ARQUITECTURA |
| [TRAMO-1OFI-CONEXION.md](historico/TRAMO-1OFI-CONEXION.md) | Archivo histórico de TRAMO-1OFI-CONEXION.md |
| [TRAMO-1OFI-GEOMETRIA.md](historico/TRAMO-1OFI-GEOMETRIA.md) | Archivo histórico de TRAMO-1OFI-GEOMETRIA.md |
| [Relevo local 27/09](historico/paridad/INICIO-SIGUIENTE-CONVERSACION-2026-09-27.md) | Última revisión Windows preservada; instrucciones inactivas, continuidad en estado/roadmap |
| [paridad/ESTADO-FASES.md](historico/paridad/ESTADO-FASES.md) | Cobertura fusionada en PARIDAD y estado en ESTADO-ACTUAL |
| [paridad/IMPLEMENTACION-ACTUALIZAR-2026-09-20.md](historico/paridad/IMPLEMENTACION-ACTUALIZAR-2026-09-20.md) | Archivo histórico de docs/paridad/IMPLEMENTACION-ACTUALIZAR-2026-09-20.md |
| [paridad/fase-1/04-auditoria-74e0c95.md](historico/paridad/fase-1/04-auditoria-74e0c95.md) | Archivo histórico de docs/paridad/fase-1/04-auditoria-74e0c95.md |
| [paridad/fase-7/03-implementacion-cortes-referenciados.md](historico/paridad/fase-7/03-implementacion-cortes-referenciados.md) | Archivo histórico de docs/paridad/fase-7/03-implementacion-cortes-referenciados.md |

## Recuperación de documentos borrados

Prompts y relevos cerrados sin evidencia única. Recuperación desde el commit
`9bc879e1530b076c4e7c17dee8e0a076c76e7b4e`: `git show 9bc879e:ruta-original.md`.
Las referencias que necesitan conservar el texto enlazan a esa versión de Git.

| Ruta original | Recuperación |
|---|---|
| `CONTINUACION-ARQUITECTURA-B2.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/CONTINUACION-ARQUITECTURA-B2.md) |
| `CONTINUACION.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/CONTINUACION.md) |
| `HANDOFF-GROK.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/HANDOFF-GROK.md) |
| `INICIO-NUEVA-CONVERSACION-JAVI.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/INICIO-NUEVA-CONVERSACION-JAVI.md) |
| `PROMPT-CONTINUACION-FASES-0-1-2.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/PROMPT-CONTINUACION-FASES-0-1-2.md) |
| `PROMPT-FABLE.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/PROMPT-FABLE.md) |
| `PROMPT-FASE-1-GUARDADO-ALUMINIOR.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/PROMPT-FASE-1-GUARDADO-ALUMINIOR.md) |
| `PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/PROMPT-FASE-2-GEOMETRIA-ALUMINIOR.md) |
| `RELEVO-SIGUIENTE-SESION.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/RELEVO-SIGUIENTE-SESION.md) |
| `docs/paridad/CONTINUAR-2026-09-27.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/docs/paridad/CONTINUAR-2026-09-27.md) |
| `docs/paridad/INICIO-SIGUIENTE-CONVERSACION.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/docs/paridad/INICIO-SIGUIENTE-CONVERSACION.md) |
| `docs/paridad/fase-2/02-handoff-fase-3.md` | [Versión histórica](https://github.com/Sergiom84/Aluminior/blob/9bc879e1530b076c4e7c17dee8e0a076c76e7b4e/docs/paridad/fase-2/02-handoff-fase-3.md) |

## Referencias históricas ausentes

Los entregables citados de `docs/paridad/fase-0/` y algunos informes antiguos
de fase 1 no están en este checkout. Una mención no acredita su existencia
ni su aceptación; no se reconstruyen resultados a partir de prompts.
Las capturas, PDF, registros y datos bajo `output/` son privados y pueden faltar.

La antigua numeración 0022 de cortes en informes del 27/09 es histórica:
en main, 0022 es diseño y el motor económico corresponde a 0023/0024.

Las citas literales a PLAN/ENTREGA/CONTINUACION en comentarios de código se
conservan sin tocar código: consultar el histórico o el commit indicado.
Las memorias July anteriores también pueden citar esas entradas antiguas:
resolverlas mediante este índice; la antigüedad no cierra una tarea. El relevo
general y E1 se identifican por sync_uid en la guía Windows.
