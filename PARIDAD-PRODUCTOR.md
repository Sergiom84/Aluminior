# Paridad con Productor Aluminio

Fecha de decisión: 2 de agosto de 2026.

## Objetivo

Aluminior debe permitir que una persona habituada a Productor complete las
mismas tareas con la misma lógica, terminología, información visible y una
cantidad equivalente o menor de pasos. La presentación se moderniza, pero la
arquitectura de trabajo no se sustituye por patrones genéricos de dashboard.

Productor se integra como referencia funcional, de datos y de validación, no
como binario embebido. Aluminior reimplementa el comportamiento en su propio
stack y no depende de ejecutar el `.exe` para trabajar.

## Fuentes de verdad

Por orden de prioridad:

1. Observación autorizada de Productor en ejecución.
2. Capturas y texto del manual `ManualUsr/Aluminio.chm`.
3. Datos, configuraciones e informes propios de ALUMINIOS LARA SLU.
4. Entrevistas y validación de los usuarios reales del taller.
5. Análisis estático o dinámico autorizado cuando las fuentes anteriores no
   permiten determinar un comportamiento necesario.

Una pantalla no se declara equivalente basándose únicamente en similitud
visual. Deben coincidir también el recorrido de teclado, los estados, las
acciones disponibles y los resultados.

## Lenguaje de interfaz

Se conserva de Productor:

- superficies centradas en documentos y listas;
- barras de acciones próximas al contenido activo;
- tablas compactas con las columnas necesarias para decidir sin abrir cada fila;
- pestañas y agrupaciones que reflejan el orden real del trabajo;
- terminología, estados, numeración, revisiones, series y tarifas;
- atajos verificados y foco de teclado visible;
- totales y estado del documento siempre localizables.

Se moderniza:

- colores, bordes, sombras y superficies de Windows XP;
- iconos antiguos o propietarios;
- contraste, tamaños de interacción y estados de foco;
- adaptación a ventanas pequeñas y desbordamiento;
- semántica HTML y accesibilidad.

## Primera iteración: presupuestos

| Pantalla | Evidencia Productor | Paridad requerida | Estado Aluminior |
|---|---|---|---|
| Lista | `5.3.1.-001.png` | Acciones superiores, tabla densa, número, revisión, fecha, código, cliente, obra, tarifa, serie y estado | Implementación inicial |
| Búsqueda | `5.3.1.-002.png` | Búsqueda por campos del documento y retorno claro a la lista | Parcial: búsqueda unificada |
| Nuevo documento | `5.3.1.1-001.png`, captura de detalle y vídeo real de Javi (11:17) | Cliente/potencial opcionales, búsqueda de cliente por código o fragmentos del nombre, nombre libre, obra, estado pendiente, serie, número, observaciones, aceptar y continuar al configurador | Implementación inicial |
| Detalle | `5.3.1.2-001.jpg` | Cabecera, estado, líneas, operaciones y totales en una sola superficie | Pendiente |
| Edición de línea | sección `5.3.1.3` del CHM | Estructura, serie, acabados, medidas, dibujo, herraje, acristalamiento y cargos | Pendiente |

## Vocabulario del diseñador

La composición visual se modela como un árbol de huecos y divisiones. Los
códigos de estructura son identificadores opacos: la forma nunca se deduce del
texto del código.

### Ahora

| Concepto | Evidencia | Estado |
|---|---|---|
| Marco, hueco, hoja y vidrio | Capturas del diseñador y `EMP0016/EstructurasDiseño.csv` (tipos 1, 2, 3 y 5) | Implementado |
| División vertical y horizontal | Estructuras `02V`, `02H` y `04`; filas tipo 6 | Implementado con composición anidada |
| Travesaño y división invisible | Campo `TipoTrav` y `bInvisible`; estructuras de dos hojas y fijos partidos | Implementado como conceptos distintos |
| Fijo inferior y fijos laterales | `1OFI`, `1O1FL`, `1O2FL` y cotas observadas | Implementado |
| Combinaciones de hojas y fijos | `1O+1F+1O`, `1O+2F+1O` y `2O+ FIJO` | Implementado |
| Unión entre cerramientos | Captura de la pestaña Unión, artículos `GMU038` / `PSU001` y observación en vivo (`RECON-CERRAMIENTOS.md` §4) | Edición de tipo, longitud y grosor implementada. **Regla de medida pendiente de corregir**: ver abajo |
| Línea agregada `GRUPO` | Captura del presupuesto 260446 y vídeo real de Javi | Persistencia inicial como `CERRAMIENTO`; valoración agregada pendiente y explícitamente sin valorar |

### Regla de medida de la unión (observada 19/09/2026, empresa 0017)

Productor no suma el grosor de una unión con artículo al ancho del
cerramiento: lo reparte entre los módulos contiguos.

| Composición | Productor | Aluminior hoy |
|---|---|---|
| 1200 + unión sin artículo (grosor 20) + 1200 | Ancho 2420 (la unión separa) | 2420 |
| 1200 + `GMU038` TUBO 60x60 (grosor 60) + 1200 | Módulos fabricados a **1170** (1200 − 60/2), línea `GRUPO` **2400** | 2460 |

- Evidencia: `Det.Grupo` del presupuesto 260492 (sublíneas `0` y `04` a
  1170 x 1200, `GMU038` 0 x 1200) y `Diseño V3` del fijo (`Ancho 1170`).
- Estado: **observado en un caso**; pendiente de confirmación de Javi y de un
  segundo tipo de unión (tubo 40x40, H 100) antes de fijarlo en
  `packages/core/src/estructuras/cerramiento.ts`.

### Después

- Relacionar y dibujar correderas, puertas y plegables con evidencia específica.
- Añadir zócalos y paneles sin confundirlos con vidrio o hueco vacío.
- Modelar mallorquinas de lama fija, móvil y regulable.
- Determinar el significado visual exacto de los tipos residuales 4, 9, 16 y
  19 antes de incorporarlos. Las descripciones los relacionan con zócalos,
  mallorquinas y galfones, pero esa relación todavía no basta para dibujarlos.

### Verificación de esta iteración

- Pruebas unitarias del reparto geométrico y de la separación entre unión y
  travesaño.
- Typecheck de `core` y `web`.
- Build de producción de Next.js.
- Inspección local de `2O`, `1OFI` y `1O+2F+1O` en el presupuesto de prueba.
- Migración `lineas_cerramiento` probada en PostgreSQL efímero y aplicada en
  Supabase con RLS, restricciones y asesores de seguridad sin incidencias.
- Guardado real verificado de extremo a extremo: línea agregada, configuración,
  unión, acabado y ajustes manuales persistieron; la prueba se eliminó después
  y no dejó líneas ni configuraciones residuales.
- Tras guardar, el formulario y el dibujo vuelven juntos a un cerramiento nuevo
  sin perder el aviso explícito de valoración pendiente.

## Criterios de aceptación por pantalla

1. La fuente visual y funcional está identificada.
2. Los campos visibles y su agrupación están inventariados.
3. Las acciones principales funcionan; las futuras aparecen deshabilitadas, no
   simulan estar disponibles.
4. El flujo se prueba con los mismos datos y estado en Productor y Aluminior.
5. Se compara el número de pasos, el orden del foco y los atajos.
6. Se capturan y comparan ambas pantallas con contenido representativo.
7. Typecheck, build y pruebas relevantes terminan correctamente.
8. Las diferencias intencionales quedan registradas con su motivo.
9. La implementación queda aislada en un módulo cohesivo; una nueva capacidad
   del diseñador no debe aumentar el monolito de acciones de presupuestos.

## Límites

- No se reproducen errores conocidos de Productor.
- No se eluden licencias, activaciones ni protecciones.
- No se copian ni distribuyen código, binarios o activos propietarios.
- Las MDB activas no se usan para investigación; se trabaja sobre copias.
