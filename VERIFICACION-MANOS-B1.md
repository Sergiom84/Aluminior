# Verificación B1: manos y manillas

> Revisión documental 20/09/2026: **Evidencia de cierre acotado**. B1 comprobado en su fecha; no cierra cotas ni valoración.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

19/09/2026. Implementación Sol63b9bea, revisada e integrada como9727fe2 en
feat/cerramientos-editor-linea. Base de Sol dca402f, correcta y descendiente de
edfc346/f4ca3a6/3bbe321. Worktree aislado manos-manillas-0017, dependencias propias
con @aluminior/core resuelto al propio checkout. Sin ediciones simultáneas de fuentes.
Tarea Sol:01a0ba1f-1b04-70e2-9c52-3b05b74904cc.

## Resultado concreto
Geometría de aperturas compartida por web/PDF, sufijo expresa bisagra física;
manilla explícita por hueco, fijo siempre sin accesorios. Parejas2,2O,2O+ FIJO
con una sola manilla en hoja derecha. Solo derecha oscilo en2O y2O+ FIJO.
Siete casos observados:1OD,1OI,2,2O,1OFI,2O+ FIJO,1O1FL.
Resto siete plantillas conservan su dibujo físico previo; se mantienen14 operativas.
PDF incluye bisagras y manilla dentro de la franja de marco, limitadas en huecos
pequeños. Dibujos v1 se reconstruyen corregidos sin escritura/migración económica.

## Revisión y pruebas
El responsable revisó diff y solicitó correcciones concretas a Sol:
- No colocar herrajes PDF sobre vidrio: limitar posición/ancho por margen de marco.
- Modelo fijo sin manilla aunque entrada declare true.
- Esperados independientes de coordenadas internas y del lado de los accesorios;
  no limitar pruebas a contar tags ni generar expected con el mismo helper.
- Corregir estrechamiento TypeScript en fixture de huecos.
- Separar tests visuales de globalSetup de migración PostgreSQL; config local sin DB.

Verificación del responsable:
-48 pruebas relevantes core, aprobadas.
-41 pruebas web/PDF, aprobadas (incluyen proyección de snapshot y MO existentes).
-Typecheck core y web: exit0.
-Diff de producción revisado y git diff --check limpio.
-14 controles de catálogo local tras integración: aprobados, sin saltos.
Sol ejecutó además406 pruebas totales core, aprobadas, y sus typechecks.
Los14 controles habían quedado saltados en su worktree sin CSV; no se contaron
como aprobados hasta ejecutarlos el responsable en el repo con exportación autorizada.

Comandos relevantes:
```
npm run -w @aluminior/core test -- src/estructuras/diseno.test.ts src/estructuras/geometria-apertura.test.ts src/estructuras/diseno-catalogo.test.ts
node node_modules/vitest/vitest.mjs run --config output/revision-manos-b1/vitest.config.mjs
npm run -w @aluminior/core typecheck
npm run -w @aluminior/web typecheck
node --import tsx --test scripts/control-escaparate.test.mjs
```
El mock de primitivas PDF en ReactDOM emite aviso wrap=false; no aparece como
fallo y el PDF real fue renderizado aparte con @react-pdf/renderer.

## Revisión visual directa
Responsable generó artefactos sintéticos con componentes reales, CSS de dibujo
existente y medidas actuales, sin DB ni valores económicos. Comparó con capturas
Productor0017. HTML escritorio1366x900 y móvil375x812: orientación/manillas
correctas, sin desbordamiento horizontal de SVG. PDF real de2 páginas renderizado
con Poppler e inspeccionado: siete casos, sin recortes; lados/manillas coherentes.
Artefactos, código de generación y capturas locales: output/revision-manos-b1/.
Servidor temporal limitado a dos HTML en loopback cerrado; viewport restaurado.
Productor quedó en lista de estructuras, sin guardar catálogo.

Es verificación del componente de dibujo, NO recorrido integral de presupuesto:
no se revalidaron aquí navegación/teclado, persistencia real, despiece ni precio.
No hubo cambios de interacción. No afirmar uso real completo por estos renders.

## Diferencias que permanecen
-1OFI: Productor900x1500, Aluminior800x1500; FI variable300 pendiente de segundo tamaño.
-1O1FL: Productor1200x1200, Aluminior1100x1200; F variable300 pendiente.
-2O+ FIJO: Productor1200x1200, Aluminior1200x1500; FI variable300 pendiente.
-1O2FL: observación previa1300x1200 frente a1400x1200; cotas pendientes.
-1O+1F+1O y1O+2F+1O: mantener investigación de geometría/cotas y nuevo tamaño.
-Las firmas del control de catálogo omiten manilla; ocho coincidencias y seis
  divergencias conocidas NO significan14 equivalencias completas. Candidatas
  experimentales pueden conservar dos manillas: no activar por dibujo.
-Herrajes, vidrio, tarifa/precio y888 casos siguen pendientes. No cargas remotas,
  push, merge a main, cambios de motor, migraciones ni datos reales versionados.

Siguiente trabajo: B2 según EVIDENCIA-COTAS-0017.md, después pruebas de despiece,
precio y uso real con la misma configuración. C2 y regla de unión siguen posteriores.
