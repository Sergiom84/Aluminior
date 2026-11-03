# Retorno de foco tras alta simulada

Desde la raíz de Aluminior:

```powershell
node scripts/pruebas-ui/alta-foco/verificar.mjs
npx --no-install vitest run --config scripts/pruebas-ui/alta-foco/vitest.config.ts
```

El navegador usa AnyadirLinea, diseñador y CSS reales. Sólo sustituye las
acciones servidor por respuestas sintéticas retenidas hasta que la prueba las
libera. El servidor escucha en 127.0.0.1 con puerto libre; el navegador impide
peticiones ajenas a su origen o métodos distintos de GET. No hay BD, SQL,
migraciones, configuración web habitual ni persistencia. Se cierran navegador y
listener incluso si falla un escenario. Requiere dependencias y Chromium de
Playwright ya instalados; no instala ni descarga nada.

Control predeterminado: d0e4b29bb506e3741397af81f5dec286dd1fb03e. El segundo
bundle carga mediante git show las fuentes de producto cambiadas desde ese
commit, únicamente en memoria. No modifica archivos ni índices Git. Puede
indicarse otro commit como primer argumento. El control debe discriminar
ocho comprobaciones de foco (dos altas por cada uno de cuatro escenarios).

Se comprueba aceptación directa y reintento tras campo inválido, rechazo
general y respuesta perdida, también una segunda alta; borrador completo
incluida configuración, identidad de solicitud, bloqueo pendiente, foco
visible operativo y teclado Enter/Escape. Matriz actual 1280/768/375/320 con
movimiento reducido y control de overflow. El montaje inicial conserva el
foco exterior. Se inspeccionan todos los inputs del bundle para excluir módulos
de BD y acciones reales, exigiendo que se hayan incluido componentes reales.

Artefactos privados en output/playwright/p67-alta-foco-20261018/: métricas,
capturas 1280/320 e inputs de compilación. Cada ejecución sustituye los
artefactos de esta unidad. No acredita guardado, ruta autenticada, paridad
del foco exacto de Productor, zoom nativo ni aceptación real.
