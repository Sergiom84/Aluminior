# Unidad 03V y continuación de TMP/16

27/09/2026. Parte de `b5dc16a`, rama `feat/motor-catalogo-completo`, árbol
limpio al comenzar. Encargo explícito de Sergio: incorporar los originales
03V de 2025, contrastar despiece y valoración, ejecutar la unidad mínima
respaldada y continuar la secuencia de [08](08-cotas-absolutas-y-relevo.md).

- Resultado exacto: contraste reproducible de las tres líneas de presupuesto
  03V no específicas de EMP0015 y regla de mano de obra respaldada por controles,
  conservando bloqueos de material o precio que el contraste no resuelva.
- Destinatario y motivo: continuidad del motor y del mapa de paridad; evitar
  confundir coincidencia de minutos con precio completo o fabricación.
- Éxito medible: selección por entradas de catálogo, sin usar las salidas
  históricas para calcular; comparación posterior de piezas, minutos y
  valoración con tarifas de la misma fuente. Cada cierre debe tener evidencia
  ejecutada y un alcance explícito por modelo, serie y tipo de diseño.
- Alcance autorizado: copias verificadas y extracciones locales, dominio puro,
  adaptadores que conserven metadatos explícitos, pruebas sintéticas, mapas y
  relevo. Commit local de la unidad revisada, con autor y committer Sergio.
- Fuera de alcance: ejecución de Productor, datos remotos, publicación, push,
  main, modificación de migraciones existentes, fabricación certificada y
  ampliación de 03V a otras series o diseños específicos.
- Ficheros o sistemas protegidos: originales MDB, secretos, extracciones,
  tarifas de cada ejercicio, catálogo habilitado y documentos previos de QA.
  Ningún dato empresarial ni extracción entra en Git.
- Comprobaciones obligatorias: hashes y claves únicas de fuente, trazabilidad
  de entradas/tarifa/fecha, controles MO 79/79 y 90/90 sin sumarlos como
  observaciones independientes, pruebas de límites y causal ejecutada,
  suites pertinentes, typecheck, arquitectura y diff final.
- Acciones que requieren autorización: decisiones canónicas sin evidencia y
  actuaciones fuera de los límites locales anteriores.

## Procedencia ratificada

`Base datos Anuales/EMP0015` corresponde a **2025** y `EMP0016` a **2026**.
Una fecha documental fuera del año nominal conserva su carpeta y su fecha.
Las diferencias de tarifa entre ejercicios son esperables; no se corrigen
trasladando precios del otro año.

`export_datos/EMP0016` es una fuente de catálogo exportado. La copia posterior
`output/investigacion-fuentes/EMP0016-Anterior.mdb` usada para facturas C2P es
otra fuente: no se atribuyen sus resultados a las cuatro bases anuales.
Las copias Anterior comparten documentos con las principales; se contrastan
como versiones, nunca se suman como nuevas observaciones independientes.

## Ejecución y revisión

Unidad económica en serie: un ejecutor para contraste e implementación,
arquitecto para contrato, integración y gates; revisor nuevo al terminar.
El revisor recibe artefacto, contrato y evidencia bruta, sin el razonamiento
ni el dictamen del autor. Máximo dos rondas: revisión, una corrección y gate.
Ningún ejecutor hace add, commit, stash o checkout. No se comitea mientras
otro agente escribe.

No se infiere `Categoria` o `TipoPerf` del nombre de serie. Si un consumidor
no conserva los metadatos exigidos por la regla, debe seguir bloqueado. La
unidad de dominio y su contraste no acreditan por sí solos su activación web.
