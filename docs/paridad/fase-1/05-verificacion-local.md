# Verificación local de fases 1 y 2

Fecha: 20/09/2026. Base del código: a2d62ce; rama codex/cierre-fases-1-2.
Esta evidencia es nueva; no se presenta como recuperación de la sesión ausente.

## Destinos y reversibilidad

Integración: localhost:55433/aluminior_test, validada por urlDePruebasValidada.
Navegador: servidor de desarrollo en 127.0.0.1:3000 con DATABASE_URL explícita
hacia aluminior_qa_test y el opt-in QA existente, limitado a desarrollo/loopback.
No se ha consultado ni escrito Supabase ni ninguna base de Productor.

QA estaba atrasada: faltaba conjunto_acristalamientos de la migración 0021.
El primer intento de alta válido devolvió error SQL y no insertó línea.
Se guardó pg_dump de la base sintética completa antes de ejecutar el migrador
existente exclusivamente contra QA. No se cambió SQL ni se borraron datos.
Reversión disponible: restaurar el dump en otra base local de pruebas y verificar
antes de sustituir QA; no se ejecutó ninguna restauración ni borrado.

Se conservó QA/269901. Se creó QA-F1/269902 para la aceptación de alta.
El PDF y el snapshot de la nueva línea proceden de la misma configuración persistida.

## Comandos

```powershell
$env:TEST_DATABASE_URL='postgres://aluminior:aluminior@localhost:55433/aluminior_test'
npm run -w @aluminior/web test -- --fileParallelism=false --testTimeout=15000
npm run -w @aluminior/core test -- geometria-cerramiento
npm run -w @aluminior/web typecheck
npm run check:architecture
git diff --check
```

El pase focal de 14 ficheros terminó con 84 pruebas correctas. Geometría core:
7/7. Typecheck web correcto. Control modular: 569 archivos, 292 módulos,
0 infracciones. Batería web completa: **91 ficheros y 625 pruebas correctas**,
sin omisiones en web; duración 288,21 s. Log indicado abajo.

La primera ejecución paralela tuvo un timeout de 5 s en una prueba preexistente
que comparte identidades del catálogo J04 con la nueva fixture transaccional.
La ejecución secuencial evita esa contención y usa 15 s por prueba; no se han
reducido aserciones ni cambiado el límite global del repositorio.

## Evidencias locales ignoradas por Git

- output/paridad-fase-1/web-tests.log: batería web completa.
- output/paridad-fase-1/alta-persistida.json: documento/satélites sintéticos verificados.
- output/paridad-fase-1/alta-seis-modulos.pdf y .png: QA-F1/269902.
- output/paridad-fase-1/qa-antes-migraciones.sql: copia reversible de QA.
- output/paridad-fase-1/configuraciones-qa.json: configuración previa conservada.
- output/paridad-fase-2/receta-6640x1020.pdf y .png: QA/269901.
- Capturas y lecturas de accesibilidad/DOM de navegador: registradas en esta tarea.

No se versionan dumps ni exportaciones. env.example sigue fuera del cambio.

## Mapa de evidencia

| Criterio | Fuente | Qué acredita |
|---|---|---|
| Receta 6640×1020 | Plan maestro, fase 1 | Entradas de aceptación solicitadas |
| Conservación/error/reintento | Navegador Aluminior QA | Comportamiento observado en alta y edición |
| Doble clic/Enter | Navegador + controlador + concurrencia PostgreSQL | Una línea y satélites coherentes |
| Geometría y proporciones | Tests core + SVG del navegador + PDF renderizado | Escala uniforme y configuración común |
| Economía sintética | Catálogo J04 y snapshot persistido | Integridad del pipeline; no precio del taller |
| Paridad directa Productor | No repetida en esta continuación | Pendiente; 6900×1020 no es oráculo de esta receta |

La causa histórica exacta de «Guardando…» en la copia ausente no se puede
reconstruir. En esta copia se ha observado que error y reintento finalizan con
el nuevo manejador. No se atribuye el arreglo a una causa histórica no probada.
