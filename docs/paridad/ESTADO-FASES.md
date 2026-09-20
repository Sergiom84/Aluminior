# Auditoría de fases 0–8 y trabajo sin escritorio

Fecha: 20/09/2026. Alcance: código, pruebas, documentación e inventario local;
sin observación visual de Productor ni consultas o escrituras en Supabase.
Plan contrastado: [PROMPT-MAESTRO-FASES-0-A-8.md](../../PROMPT-MAESTRO-FASES-0-A-8.md).
La auditoría inicial no autorizaba implementación. El usuario la ha autorizado después;
la continuación y sus pruebas están en [fase 1](fase-1/00-resumen.md) y
[aceptación local de fase 2](fase-2/03-aceptacion-local.md).

## Evidencia posterior aportada por el operador

Se incorporan [doce capturas y el recorrido del 20/09/2026](OBSERVACION-PRODUCTOR-2026-09-20.md).
Aportan evidencia para las fases 3–6 y el recorrido de presupuesto/pago.
La fase 2 conserva pendiente el contraste equivalente: PSU001 muestra grosor
2 mm, y el documento final 6300 × 1200 difiere de la fixture local 6640 × 1020.
La descripción comercial 100mm no acredita una separación de 100 mm.
Los estados de aceptación técnica local se mantienen; el registro no certifica
implementación de los nuevos requisitos ni cierre integral.

## Identidad de la copia y fiabilidad documental

El archivo solicitado en `C:/Users/laral/OneDrive/Documentos/Aluminior/` no existe
en esa ubicación: la carpeta contiene únicamente `node_modules`. Se ha leído el
plan del mismo nombre en `C:/Users/laral/Documents/Aluminior`.

El checkout auditado parte de `bd764a0`, rama `feat/cerramientos-editor-linea`,
con los cambios locales de geometría y saneamiento descritos en
[SANEAMIENTO-MODULAR.md](../SANEAMIENTO-MODULAR.md). El commit `74e0c95` que cita
el plan no se encuentra en este repositorio, incluso después de `git fetch origin`.
No basta con sus informes para considerar sus correcciones incorporadas.

Faltan los entregables de `docs/paridad/fase-0/` y los documentos 00–03 de fase 1.
Solo está la [auditoría parcial de fase 1](fase-1/04-auditoria-74e0c95.md).
Esto impide certificar el cierre documental, pero no demuestra que el trabajo
nunca se realizara en otra copia.

## Dictamen por fase

| Fase | Estado comprobable en esta copia | Trabajo realizable sin controlar visualmente Productor | Puerta de aceptación pendiente |
|---|---|---|---|
| 0. Evidencia y referencia | Parcial; faltan entregables y entradas completas del caso original | Inventariar evidencias, extraer manual CHM, consultar copias de datos y construir matriz de trazabilidad | Recorrido de 17 pasos, evidencias E01–E16 y prueba de herencia A1/A2/B1/A3; recuperar o realizar observación donde manual y datos no basten |
| 1. Guardado y reintento | Aceptación técnica local completada: error/reintento, UUID de alta, receta seis módulos, reapertura y PDF | Contratos y pruebas en fase-1/00-resumen.md y 05-verificacion-local.md | No certifica precio comercial ni recuperación tras cerrar pestaña |
| 2. Geometría y modularización | Aceptación local de pantalla/PDF y teclado completada; sin overflow de página a tres tamaños | Geometría y pruebas vigentes; aceptación en fase-2/03-aceptacion-local.md | Contraste directo de tarea con Productor y aceptación del operador pendientes |
| 3. Presupuesto, catálogo e inserción | Búsqueda de clientes existente; diseñador secuencial básico | Implementar composición, inserción, selección estable, catálogo y pruebas según contratos verificados | Orden y comportamiento del flujo de Productor donde todavía falte evidencia |
| 4. Configuración por elemento | Modelo actual sin materiales ni excepciones por elemento | Modelo versionado de herencia/excepciones, operaciones colectivas y persistencia con pruebas | Semántica de aplicar, heredar y volver a Genérico conforme a evidencia |
| 5. Vidrio y huecos | Base de estructuras y FI; falta editor interno dinámico | Buscador desde catálogo real, geometría de huecos, identidades y excepciones; implementar reglas ya documentadas | Verificar escuadra, ámbitos contextuales, cotas y efecto de junquillos; no inferir fabricación de controles gráficos |
| 6. Uniones y acabados | Unión lineal con código, longitud y grosor; catálogo visual limitado | Catálogo, validación y valoración de uniones lineales, ampliación versionada del modelo | Reglas de compatibilidad, L1/L2, ángulos y acabados no presentes en el modelo actual |
| 7. GRUPO y valoración | Pipeline, snapshot económico, cantidades, mano de obra y copia existentes | Contrastes reproducibles con iguales entradas, cálculo puro y pruebas de persistencia | Paridad económica y de fabricación del caso real; FI explícito conserva resultado no valorado |
| 8. PDF y aceptación integral | PDF, geometría común y bases de teclado/responsive existentes | Pruebas de PDF, navegador, accesibilidad y recorrido automatizado de Aluminior | Comparación integral con Productor y revisión de renderizado, paginación y uso real |

## Hallazgos históricos de la auditoría inicial

Los puntos 1–2 quedan atendidos por la continuación de fase 1; conservar
`defaultValue` ya no implica reset porque se retiró `form action` en esos formularios.
La evidencia visual nueva está en fase 2. Los límites de Productor siguen vigentes.

1. En `packages/web/app/dashboard/presupuestos/[id]/_components/editar-cerramiento.tsx`
   siguen existiendo `useActionState`, formulario con `action` y campos de materiales,
   cantidad y horas mediante `defaultValue`. No está la implementación de campos
   controlados que atribuye la documentación a `74e0c95`. La conservación después
   de error necesita una regresión en navegador; no se afirma haberla reproducido aquí.
2. `packages/web/app/dashboard/presupuestos/_lib/lineas/guardar-linea.ts` protege
   la transacción y asigna el siguiente orden, pero no presenta una clave de
   idempotencia de solicitud. Atomicidad no acredita que dos solicitudes idénticas
   produzcan una sola línea. No se ha reproducido un doble clic en esta auditoría.
3. `packages/core/src/estructuras/geometria-cerramiento.test.ts` cubre siete casos,
   incluida la composición 6640×1020, proporciones 1:4 y 5:3, alturas distintas e
   invariancia del modelo al viewport. Los adaptadores web/PDF usan ese dominio.
   Son pruebas geométricas; no prueban por sí solas el ciclo de guardado de seis módulos.
4. La fixture ampliada J04 es sintética. Su receta para `2O` no constituye un
   despiece industrial contrastado. No usar un resultado verde de esa fixture
   como certificado de precio o fabricación de Productor.

## Límites estructurales para las fases siguientes

- `anyadir-linea.tsx` inicia el tipo en `ESTRUCTURA`; la incorporación al
  cerramiento en `core/estructuras/cerramiento.ts` añade al extremo derecho.
  La selección del catálogo reemplaza el módulo activo. No hay inserción libre
  ni composición bidimensional equivalente a todo el plan.
- `ModuloCerramiento` contiene identidad, estructura, ancho, alto y FI opcional;
  no contiene serie, acabado o vidrio por elemento. La valoración recibe
  materiales generales. La fase 4 requiere ampliar el contrato de persistencia.
- `UnionCerramiento` contiene identidad, código, longitud y grosor. No modela
  acabado propio, ángulo o L1/L2. El catálogo visual ofrece GMU038 y PSU001.
- La geometría FI predefinida no equivale a un editor arbitrario de superficies,
  travesaños y paneles con herencia de materiales.

## Cuánto se puede avanzar sin visión del equipo

Se puede realizar la mayor parte de la construcción técnica: refactorización,
modelos de dominio, geometría, servicios, validaciones, persistencia, búsqueda,
valoración, PDF y pruebas automáticas. En términos del plan, se pueden abordar
las tareas técnicas de las ocho fases 1–8 y parte de la investigación de fase 0,
conservando abiertas sus puertas de aceptación. No se asigna un porcentaje de
finalización porque no hay desglose estimado ni evidencias suficientes para medirlo.

No controlar el escritorio de Productor permite seguir usando código, manual,
datos y pruebas de navegador de Aluminior. Si «sin visión» excluye también revisar
capturas o PDF renderizados, no se puede certificar el aspecto final, solapamientos
o paginación solo con pruebas estructurales.

Secuencia recomendada para el siguiente encargo:

1. Recuperar la evidencia y aclarar el desfase de copia/commit; inventariar lo
   recuperado frente al código. No importar ciegamente cambios de otra copia.
2. Cerrar las regresiones técnicas de fase 1 y la aceptación de fase 2.
3. Desarrollar 3–6 por contratos pequeños: composición, configuración por
   elemento, huecos y uniones; pruebas y compatibilidad de snapshots en cada paso.
4. Contrastar valoración y recorrido completo en 7–8, solicitando únicamente
   las observaciones de Productor que no resuelvan manual, datos o evidencia existente.

## Fuentes originales y datos

Se ha comprobado la existencia de `C:/Productor/Aluminio/ManualUsr/Aluminio.chm`,
de `EMP0016/Anterior.mdb` y de `EMP0017/aluminio.mdb`, además de EMP0001–EMP0017.
Según el usuario, EMP0016 es la empresa real y EMP0017 la de pruebas; las demás
carpetas corresponden a años. La existencia de los archivos no certifica su contenido.

La investigación posterior debe usar una copia verificada de `Anterior.mdb`
para EMP0016 y una instantánea de EMP0017, en lectura. No se ha abierto la base
activa, ejecutado Productor ni versionado datos originales. No ha sido necesario
leer `.env`, migrar ni escribir en Supabase para esta auditoría.

El caso Productor 6900×1020 y 3868,19 EUR tiene entradas incompletas: no es
un oráculo válido para comparar la receta web 6640×1020.

## Verificación y entrega

El saneamiento de esta sesión verificó 1142 pruebas aprobadas y una omitida
preexistente; typecheck completo correcto. Tras ajustar la comparación de
revisiones como conjunto se repitieron sus 11 pruebas y las tres de extracción
ETL. Equivalencia de CSS compilado y contratos públicos registrada en
[SANEAMIENTO-MODULAR.md](../SANEAMIENTO-MODULAR.md).

La auditoría posterior modifica documentación; no altera las reglas de negocio.
El guardián modular revisa 563 archivos, con cero infracciones y nueve scripts
históricos de investigación exceptuados y congelados. Esto no certifica paridad
completa, datos remotos ni ausencia universal de defectos.

## Cierre del 20/09/2026

[Observación directa y relevo](../CIERRE-JORNADA-2026-09-20.md): Productor 0017 permitió crear tres ventanas y un fijo; global observado 4860 × 1200 y fijo X3660/Y0. Ensayo interrumpido durante edición del ancho, sin aplicación final. Fase 2 mantiene contraste parcial, no cierre integral. Jornada finalizada a petición del usuario.
