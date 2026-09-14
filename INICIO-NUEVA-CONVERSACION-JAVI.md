# Mensaje para iniciar la conversación ejecutora

Copia el siguiente texto en una conversación nueva situada en `C:\Users\sergi\Desktop\Aplicaciones\Aluminior`:

---

Quiero que implementes y pruebes el plan `C:\Users\sergi\Desktop\Aplicaciones\Aluminior\PLAN-EJECUCION-JAVI.md` para que mi tío Javi pueda presupuestar cerramientos y preparar su fabricación en Aluminior.

Utiliza `$superpowers` y `$subagentes`, leyendo sus SKILL.md en `C:\Users\sergi\.agents\skills`. Sigue AGENTS.md. Tú eres el coordinador ejecutor; la conversación donde se realizó la auditoría y se preparó este plan es el revisor independiente.

Empieza por leer el plan y `output\auditoria-javi-20260908\INFORME.md`. Verifica el estado actual: el plan parte de HEAD fba5821 y de cambios T73 sin commit, incluidos archivos nuevos. Presérvalos; no asumas que la documentación histórica refleja el estado presente.

Autorizo implementación local, documentación, pruebas y migraciones exclusivamente en bases locales sintéticas con aislamiento y plan reversible. No autorizo commits, push, despliegues, escrituras remotas, cambios globales, uso de datos reales para fixtures ni ejecutar Productor en mi equipo principal. No cambies reglas económicas sin evidencia ni abras registro público.

Ejecuta por lotes J00–J10. Máximo dos subagentes a la vez en unidades independientes; autenticación, seguridad, migraciones y borrados en serie. Los subagentes no hacen operaciones Git. Verifica sus resultados ejecutando pruebas y reproducciones.

Cada lote debe entregar contrato, artefacto/diff y evidencias brutas en `output\ejecucion-javi\<lote>\`, conforme al plan. Solicita revisión de la conversación auditora mediante las herramientas de tareas disponibles, identificándola de forma inequívoca. Autorizo enviarle esos paquetes de revisión dentro de Codex. Si no puedes localizarla o comunicarte con ella, deja el paquete preparado y dame su ruta para entregarlo allí; no suplantes la revisión ni asumas aprobación por silencio.

No avances lotes dependientes sin dictamen APTO. Durante la espera puedes investigar trabajo independiente. No me pidas confirmación para decisiones rutinarias ya cubiertas por este contrato; pregunta sólo si una regla de negocio no puede resolverse con las fuentes o si necesitas ampliar autorización.

El éxito se demuestra con navegador real, Auth real sin bypass, PostgreSQL, importes calculados independientemente y PDFs inspeccionados. Tests verdes por sí solos no bastan. Datos ausentes significan «sin valorar», nunca cero ni total parcial válido.

Empieza por J00 y entrega su primer paquete revisable. Continúa el plan tras las revisiones, conservando un registro de continuidad si cambia la conversación.

---

## Mensaje para solicitar revisión manual en la conversación auditora

«Revisa el lote JXX de `C:\Users\sergi\Desktop\Aplicaciones\Aluminior\output\ejecucion-javi\JXX`. Ahí están contrato, artefacto y evidencias. Contrasta los criterios del plan, reproduce las comprobaciones necesarias y emite APTO, CAMBIOS REQUERIDOS o BLOQUEADO POR EVIDENCIA. No implementes el siguiente lote.»
