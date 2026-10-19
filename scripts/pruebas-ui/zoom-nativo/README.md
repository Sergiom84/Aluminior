# Configurador al 200% de zoom nativo

Contrato: comprobar selector, configuración, envío pendiente, aceptación y
rechazos de campo/general/respuesta perdida con componentes y CSS reales,
respuestas sintéticas y teclado. Sin BD, autenticación ni persistencia.
Las etiquetas deben permanecer dentro de su campo y el foco debe verse en
el viewport. No cambia el modelo de trabajo de Productor ni acredita su foco.

Desde la raíz del worktree protegido, con dependencias y Chrome instalados:

```powershell
node scripts/pruebas-ui/zoom-nativo/verificar.mjs
```

Chrome visible usa un perfil temporal propio. Su ajuste nativo de apariencia
se cambia de 100% a 200%; no se usa zoom CSS, pinch zoom ni viewport emulado.
Se mide el mismo ancho exterior antes/después: área CSS a la mitad, DPR doble,
escala visual 1 y zoom CSS 1. Ventanas 1280/768/640; el área CSS observada en
Windows es 632/376/312, incluido el espacio de la barra vertical.

Doce escenarios: cuatro respuestas por ancho. En el selector inicial se
recorren los 28 botones visibles habilitados de esa página del catálogo,
desde Cerrar hasta el último y de vuelta mediante Tab/Shift+Tab. No se afirma
haber visitado todas las familias/páginas del catálogo. Enter elige C2 y
permite continuar tras alta; Escape vuelve al disparador. Se conservan los
datos y la identidad en el reintento; la respuesta pendiente bloquea duplicados.

Ocho etiquetas reales por escenario se miden con los rectángulos de sus
caracteres, no sólo con la caja del elemento. El control negativo carga
únicamente campos-alta.tsx anterior mediante git show, en memoria:

```powershell
node scripts/pruebas-ui/zoom-nativo/verificar.mjs c46e6c5
```

Ese comando debe terminar con error: cuatro escenarios con Acristalamiento
fuera de su campo. No restaura fuentes ni modifica el índice Git.

Cada ejecución crea una carpeta nueva output/playwright/p67-zoom-nativo-*
con métricas, inputs del bundle y 58 PNG de viewport, sin recorte CSS. La
captura CDP toma la superficie completa y contrasta tamaño físico con área
CSS × DPR; rechaza PNG demasiado pequeños. Esto no sustituye inspeccionar
visualmente las imágenes. Los screenshots corrientes de Playwright pueden
recortar a este zoom y no se usan para aceptación.

Un diálogo HTML mínimo calibra el límite de Tab de Chrome: tras su último
botón, la barra del navegador recibe foco y document.hasFocus() es false.
El barrido del producto cubre todos los controles interiores en ambos sentidos;
no afirma que el navegador impida salir a su propia barra.

El listener usa 127.0.0.1 y puerto libre; sólo sirve rutas GET explícitas. El
navegador bloquea peticiones ajenas al origen local. El bundle exige diseñador
y formulario reales y excluye BD/acciones reales. No importa verificadores
históricos, no carga la configuración web/E2E y cierra navegador/listener
también ante fallos. El perfil temporal se conserva; no cambia el perfil habitual.

Regresión pura sin globalSetup SQL:

```powershell
npx --no-install vitest run --config scripts/pruebas-ui/alta-foco/vitest.config.ts
npm run typecheck
npm run check:architecture
```

Límites: montaje central sin Shell, ruta autenticada, guardado real, todas las
familias ni comparación humana contemporánea con Productor. La verificación
visual 200% pendiente de producción pertenece a su entrega histórica; esta
unidad cubre el configurador. P.6/P.7 integral y E1 permanecen abiertos.
