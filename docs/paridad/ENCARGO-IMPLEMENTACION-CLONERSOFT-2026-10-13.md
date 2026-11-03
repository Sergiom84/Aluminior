# Encargo: implementar los hallazgos de ClonerSoft en Aluminior

Fecha: 13/10/2026. Documento preparado por petición de Sergio para entregar a otro agente.

## Instrucción principal

Implementa progresivamente los comportamientos de Productor recuperados con ClonerSoft que todavía falten en Aluminior. Actúa como arquitecto: especifica, divide, delega, verifica y entrega unidades terminadas. No te limites a presentar otro plan.

El objetivo es mejorar la gestión real del taller conservando la paridad funcional demostrada. No se trata de copiar todos los archivos, importar todas las tablas o reproducir defectos de Productor. Distingue evidencia, hipótesis y decisiones propias de Aluminior.

Este documento es un encargo de ejecución local, no un certificado de paridad ni una autorización general para intervenir en producción. El roadmap vigente conserva la identidad, prioridad y estado de las tareas. Reconcílialo antes de empezar: no crees una lista paralela que reactive tareas cerradas.

## Contrato de tarea

- **Resultado exacto:** incorporar los comportamientos demostrados que falten y resolver las incógnitas necesarias para implementarlos correctamente.
- **Destinatario y motivo:** operadores del taller; presupuestos fiables, menos trabajo repetido y continuidad entre compras, fabricación y gestión.
- **Éxito medible:** cada función entregada tiene fuente, contrato, pruebas ejecutadas, recorrido real y revisión independiente. Las limitaciones pendientes permanecen visibles.
- **Alcance autorizado por este encargo:** implementación local, pruebas, documentación, análisis estático y preparación de migraciones nuevas en un entorno aislado. Las migraciones históricas se preservan.
- **Fuera de alcance automático:** despliegues, migraciones remotas, importaciones o cambios en datos reales, ejecución de Productor y reparación de su instalación.
- **Protegidos:** WIP, originales, credenciales, datos comerciales, evidencias históricas, índice Git de la integración pendiente y documentos de ensayo.
- **Comprobaciones obligatorias:** pruebas del módulo, tipos, arquitectura cuando corresponda, integridad de datos y comparación funcional de los flujos modificados.
- **Acciones que requieren autorización específica:** producción, datos reales, ejecución legacy aislada y modificación de la incidencia G6. Comprueba primero si existe autorización directa y aplicable de Sergio; no la presupongas por este documento.

Antes de cada unidad no trivial, concreta entradas, salidas, aceptación y límites. Si hay una ambigüedad que cambia materialmente el producto, formula la decisión concreta. No pidas confirmaciones para decisiones rutinarias ya cubiertas por el contrato.

## Rutas y fuentes de trabajo

Rutas del equipo Windows donde se hizo la extracción:

| Recurso | Ruta o referencia |
|---|---|
| Repositorio | `C:\Users\sergi\Desktop\Aplicaciones\Aluminior` |
| ClonerSoft | `C:\Users\sergi\Desktop\Aplicaciones\ClonerSoft` |
| Instalación de referencia | `C:\Users\sergi\Desktop\MIX\Productor\Aluminio` |
| Copia de BD investigada | `C:\Users\sergi\Desktop\MIX\Productor\Aluminio\EMP0016\Anterior.mdb` |
| Evidencia privada | `C:\Users\sergi\Desktop\Aplicaciones\Aluminior\output\clonersoft-20261013` |
| CHM ya extraído | `C:\Users\sergi\Desktop\Aplicaciones\Aluminior\output\investigacion-fuentes\manual` |
| Skill July | `C:\Users\sergi\.agents\skills\july\SKILL.md` |
| Skill subagentes | `C:\Users\sergi\.agents\skills\subagentes\SKILL.md` |
| Aplicación publicada | <https://aluminior.onrender.com/> |

Lee AGENTS.md y las instrucciones de las skills aplicables. Consulta July para decisiones duraderas y punteros de acceso, sin imprimir credenciales. La pestaña de navegador abierta en el chat anterior no está garantizada en otro chat.

Documentación obligatoria, enlazada relativamente a este archivo:

- [Extracción diferencial del 13/10](EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md).
- [Investigación anterior del 12/10](INVESTIGACION-CLONERSOFT-2026-10-12.md).
- [Publicación del 12/10](PUBLICACION-CLONERSOFT-2026-10-12.md).
- [Roadmap operativo](../../ROADMAP-PARIDAD-PRODUCTOR.md).
- [Relevo](../../RELEVO-PARIDAD-PRODUCTOR.md).
- [Estado actual](../ESTADO-ACTUAL.md), [índice documental](../INDICE-DOCUMENTACION.md) y [arquitectura](../../ARQUITECTURA.md).
- [Paridad Productor](PARIDAD-PRODUCTOR.md).
- [Evidencia E1 y límites de G6](EVIDENCIA-E1-DESPUNTE-2026-10-04.md).

Dentro de la evidencia privada, utiliza `cobertura-aluminior.md`, `coste-tarifa.md`, `fuentes/RESUMEN-REDACTADO.md`, `revision-independiente.md`, `gate-informe.json` y los artefactos de `datos/` y `coste-tarifa/` citados en el informe.

**Portabilidad:** `output/` está ignorado por Git. Enviar este Markdown o actualizar el repositorio no entrega automáticamente los artefactos privados. Si trabajas en otro equipo, identifica cuáles faltan y solicita su acceso autorizado antes de depender de ellos. No publiques originales ni copies evidencia sensible a Git.

## Punto de partida que debes verificar

Actualización de continuidad, 14/10: la integración quedó cerrada en `fa32fba`
y la preparación física/condicional E1 en `81dcef9`. Su gate histórico está
conservado; la continuación actual tiene wrappers E1 anclados y un selector
puro de registros de tarifa dinámica verificado localmente. Leer estado y
roadmap para el siguiente despacho/consumidor pendiente. No repetir esas unidades;
el contexto de conflictos siguiente es únicamente la fotografía inicial.

En la investigación del 13/10 había un merge Windows–Mac sin resolver, con 21 rutas en conflicto, en `codex/integracion-windows-mac-20261013`. Es una fotografía histórica: comprueba el estado actual, no ejecutes checkout o reset para forzar ese estado.

Respeta la tarea que esté resolviendo la integración. No la resuelvas en paralelo ni añadas funciones sobre un árbol inconsistente. Mientras se cierra, puedes avanzar en contratos y casos de aceptación. Si necesitas aislamiento, verifica primero qué revisión integrada debe servir de base; no pierdas ampliaciones compatibles del trabajo existente.

La extracción comprobó:

- 995 tablas en la copia investigada; 204 con contenido, todas con CSV y cabeceras presentes en el export existente.
- Los 204 CSV tienen las filas declaradas por su manifiesto. Hay una omisión binaria explícita: `DisForTrazos.Bitmap`.
- 33 tablas tienen recuentos distintos entre copia y export: son instantáneas distintas y no se mezclan.
- La presencia de datos o métodos no acredita su implementación ni su aceptación en Aluminior.
- Compras, hojas de producción, optimización 1D y PDF de presupuesto ya tienen implementación. Amplíalos, no los reconstruyas por asumir que faltan.

No repitas C1/0031/0032/carga dirigida, MO vidrio con coeficientes cero, A3/idempotencia, A4/medidas decimales, M0 ni los ensayos E1 A–F/G1–G5. Sus pruebas de regresión sí deben ejecutarse cuando un cambio afecte a ese comportamiento.

## Organización de la ejecución

Usa como máximo dos subagentes ejecutores simultáneos. Divide por responsabilidad y dependencias compartidas, no solo por archivos. Los ejecutores no hacen `git add`, commit, stash ni checkout.

El arquitecto verifica los resultados ejecutando las comprobaciones. No hagas commit mientras otro agente escribe. Seguridad, autenticación, cobros/pagos y borrado se trabajan en serie. Conserva el máximo de rondas de revisión establecido en AGENTS.md.

Para cada hallazgo, incorpora al registro existente: fuente concreta, comportamiento demostrado, incógnitas, módulo propietario, dependencias, pruebas de aceptación y estado. Conserva por separado **extraído**, **especificado**, **implementado** y **verificado**.

Continúa entre unidades que tengan evidencia suficiente. Si una unidad necesita una decisión o fuente ausente, conserva su bloqueo preciso y avanza con otra independiente. No implementes reglas supuestas para aparentar exhaustividad.

## Ahora: exactitud económica

Trabaja las siguientes unidades por separado, respetando el orden del roadmap y las dependencias del motor. Las reglas quedan en funciones puras; la lectura, persistencia y autorización corresponden a servicios y adaptadores.

### Despunte E1

Incorpora agrupación por artículo/acabado/tonalidad, participación de cantidades, longitudes y filtros condicionales demostrados. No confundas despunte técnico de fabricación con cargo económico de cabecera.

Conserva lo ya acreditado en G1–G5: alta independiente, reparto por bases sin cargo anterior y persistencia, para dos líneas de cantidad uno y sin descuentos. Localiza el llamador monetario y resuelve base bruta/neta, cantidades y política de redondeo. No repitas aquellos ensayos ni modifiques G6 sin autorización.

Aceptación: casos discriminantes de los límites pendientes, recálculo sin acumulación, persistencia y ausencia de doble cómputo de GRUPO/componentes/piezas. Define los resultados esperados desde evidencia, antes de ajustar la implementación.

### Coste dimensional y coste calculado

Demuestra selección de proveedor, tamaño, unidades, gastos y precedencias. No reutilices automáticamente el selector dimensional de PVP ni deduzcas el algoritmo de las filas de `ArticulosPrecioTabla`.

La fórmula documental de coste calculado combina material por peso y acabado por superficie. Verifica unidades, configuración y condiciones de aplicación antes de incorporarla. Es un contrato distinto del selector dimensional.

Aceptación: casos de frontera, ausencia de proveedor/precio, unidades y resultado explicable con procedencia. Un coste desconocido no se transforma en cero ni en margen ficticio.

### Tarifa dinámica

Respeta la activación global y por artículo/cliente/acabado/tipo y las precedencias de la evidencia privada. Conserva las cuatro búsquedas: tamaño exacto con intervalo inclusivo; tamaño exacto con límites 0/0; tamaño `*` con intervalo; tamaño `*` con límites 0/0.

Resuelve grupo aplicable, solapamientos y redondeo antes de activarla. No inventes un orden de desempate a partir de `FirstOrDefault`. Exige un caso positivo verificable: diez de once tablas TarDin estaban vacías en la copia y los flags a cero procedían de otro export, no del programa vivo.

Aceptación: activación y desactivación, cada precedencia, fronteras, ausencia de coincidencia y no regresión de la tarifa ordinaria.

### Descuentos máximos y recargo energético

Trata los dos descuentos máximos por separado. Demuestra el efecto visible y al guardar; preparar un valor limitado antes de lanzar error no autoriza a implementar un recorte silencioso.

Para el recargo, implementa cuando se confirme su configuración: selección por familia/subfamilia y medida estándar/corte, alternativa general, mínimo por diferencia y cálculo al guardar. Los precios especiales dependen del artículo concreto seleccionado. No ejecutes la migración histórica descrita en el PDF de actualización.

Aceptación: cambio de artículo, excepciones de precio, mínimo, recálculo sin duplicados y tratamiento explícito de datos insuficientes.

## Después: almacén, compras y fabricación

Define primero el contrato compartido de movimientos, reservas y consumos. Después ejecuta unidades pequeñas:

1. Movimientos por artículo, acabado, dimensiones y almacén, con proveedor y precio opcionales según el contrato demostrado.
2. Reserva previa, consumo real, restos, estados y reversión.
3. Recepciones completas y parciales de los pedidos de compra existentes.
4. Facturas de compra que agrupan albaranes del proveedor.
5. Integración con producción y optimización existentes.

La línea con número y fecha del albarán de origen es opcional. La trazabilidad persistente necesita su propio contrato; el CHM no la demuestra por sí solo. Una casilla `StockSN` no constituye un sistema de almacén.

Como decisiones técnicas de Aluminior, exige integridad de cantidades, reintentos sin duplicación, control de concurrencia y reversión coherente. No presentes estas decisiones como hechos observados en Productor sin fuente.

Aceptación: pedido recibido en varias entregas, pendientes correctos, reservas diferenciadas de existencias, consumos parciales, restos y reversión sin pérdida de historial. No provoques movimientos reales para probarlo.

## Después: documentos de venta y cobros

Antes de cobros, demuestra y especifica la relación entre documentos, facturas y vencimientos. Comprueba qué parte falta realmente; no amplíes todo el ciclo comercial por inferencia de nombres de tablas.

Implementa aplicaciones parciales y varios cobros por vencimiento, fecha e importe, saldo pendiente, filtros, historial y reversión conforme al contrato. Esta unidad se trabaja en serie.

Aceptación: importes conciliados, ausencia de doble aplicación, edición/reversión consistente y permisos comprobados. Usa datos sintéticos o fixtures autorizadas.

Separa gestión comercial de emisión fiscal y bancaria. El manual histórico no acredita normativa vigente. No implementes remesas ni afirmes conformidad fiscal a partir de páginas vacías o formatos antiguos: requieren especificación propia y verificación actual antes de uso real.

## Después: informes, consultas y exportación

Convierte las 91 plantillas inventariadas, correspondientes a 59 nombres únicos, en necesidades de información. No ejecutes el SQL legado ni lo trasplantes como servicio web.

Implementa por incrementos: columnas visibles, orden, anchuras, precisión, filtros, agrupaciones, sumas, presentación condicional y exportación de las columnas/filas autorizadas.

Prioriza informes útiles para el taller con datos ya disponibles; esta unidad puede avanzar antes que otros módulos si no comparte dependencias en modificación. El PDF de presupuesto existente no sustituye los listados operativos.

Aceptación: filtros y totales conciliados con documentos fuente, permisos respetados, exportación fiel a la selección y rendimiento probado con volumen representativo. Identifica como decisión de producto cualquier sustitución de los formatos documentados.

## Después y Experimental: operación del taller

Especifica e implementa cuando haya evidencia suficiente:

- Horas por trabajador, obra y tarea; intervalos o total de horas y gastos asociados. No confundirlas con horas manuales del presupuesto.
- Agenda con tipos de tarea y asignación de usuarios.
- Controles de calidad, incidencias, orden de controles e historial.

Mantén como **Experimental** planificación avanzada, CNC, mecanizados, integraciones y módulos con documentación incompleta. Cada uno necesita entradas, salidas, uso real y aceptación antes de construirlo. No conviertas títulos o páginas «EN CONSTRUCCIÓN» en especificaciones.

Calidad operativa no equivale a certificación legal, CTE o marcado CE. Separa explícitamente esas responsabilidades.

## Arquitectura, interfaz y tratamiento de datos

- Mantén módulos verticales, archivos cohesionados, acciones delgadas y páginas de composición. Sigue los límites y comprobaciones de AGENTS.md.
- Reutiliza el diseño de Aluminior y conserva el recorrido operativo demostrado de Productor. No hagas un rediseño general ni importes patrones ajenos.
- Incluye teclado, foco, móvil, overflow, zoom y reduced motion en cada flujo afectado. Sin emojis ni microcopy innecesario.
- Las mejoras respecto a Productor llevan motivo, decisión de producto y aceptación propios. No reproduzcas defectos conocidos como requisito de compatibilidad.
- Importa solo los datos necesarios para contratos demostrados, con procedencia y reconciliación. No mezcles empresas, años o instantáneas.
- Conserva la distinción entre valorado, incompleto y sin valorar. La ausencia o invalidez económica permanece `null` o bloqueada según el contrato; nunca se oculta con cero.
- No copies código GAIA, binarios, informes o recursos propietarios. Reimplementa comportamiento demostrado en código y activos propios.
- No abras la base activa, ejecutes legacy en la estación principal, registres COM/OCX ni intervengas en protecciones. La lectura adicional parte de copias verificadas y del análisis estático autorizado.

## Definition of Done de cada lote

1. Contrato y fuentes concretos; hipótesis pendientes identificadas.
2. Pruebas relevantes ejecutadas, typechecks y `npm run check:architecture` cuando cambien límites de módulos. Ejecuta las comprobaciones requeridas por el repositorio; no atribuyas una suite verde al árbol actual por resultados antiguos.
3. Para una corrección de bug, mide de forma segura y aislada qué pruebas fallan sin el arreglo. No reviertas WIP compartido ni estimes esa cifra.
4. Si cambia un flujo, compara la misma tarea Productor–Aluminior: pasos, campos, teclado, estados, importes y capturas de escritorio/móvil. Si falta observación autorizada, declara implementación local y aceptación pendiente por separado.
5. Revisor independiente recibe artefacto, contrato y evidencia, sin razonamiento ni conclusión del autor. Máximo dos rondas ordinarias: revisión, una corrección y gate determinista; aplica las excepciones explícitas de AGENTS.md.
6. Revisa diff y estado Git: sin secretos, datos reales, cambios ajenos ni efectos remotos. No omitas tests, debilites aserciones, añadas supresiones ni dejes stubs para aparentar cierre.
7. Actualiza la tarea existente en roadmap, estado, índice y relevo según corresponda, cuando esos archivos estén libres de conflictos. Conserva evidencia histórica y retira instrucciones agotadas sin borrar discrepancias.
8. Entrega unidad revisada y reproducible. Solo el arquitecto integra o comitea cuando el árbol y la coordinación lo permitan; un commit local no prueba publicación, recepción en otros equipos ni despliegue.

Formato de entrega: resultado, módulos cambiados, evidencia ejecutada, revisión independiente, límites, documentación actualizada y siguiente tarea exacta. Informa por separado del estado de migraciones, publicación y aceptación cuando aplique.

## Prioridad, coste y finalización global

Prioriza exactitud económica y reducción de trabajo repetido. Estima por lote desarrollo, validación, migración y mantenimiento una vez cerrado su contrato; no inventes un presupuesto total o rentabilidad numérica sin esa base.

El objetivo de esta ejecución no se cierra con un inventario ni con todas las pantallas visibles. Solo se declara completado para el alcance implementado y verificado. Mantén una relación exhaustiva de los hallazgos del informe: reutilizado, implementado/verificado, pendiente de evidencia, pendiente de autorización o descartado por decisión explícita.

Empieza por comprobar la integración y las fuentes. Después toma la primera unidad económica abierta del roadmap, sin repetir ensayos cerrados. Continúa autónomamente entre lotes verificables y deja un relevo exacto si una limitación de sesión impide seguir.
