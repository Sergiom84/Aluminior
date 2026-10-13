# Arquitectura de Aluminior

Revisión inicial: 02/10/2026, contrastada con `main` en `9bc879e`.
Contrato de GRUPO y registro ESM actualizado el 03/10/2026 en `e2b0232`.
El estado de datos, despliegue y aceptación está en
[ESTADO-ACTUAL.md](docs/ESTADO-ACTUAL.md); este documento define responsabilidades.

## Decisiones vigentes

- Aplicación web con Next.js App Router, React y TypeScript. Next.js contiene
  UI y servidor; `packages/api`, Express y Fastify son antecedentes históricos.
- PostgreSQL alojado en Supabase, con esquema y migraciones Drizzle.
  La valoración y las escrituras de negocio se coordinan desde el servidor.
- Render es el destino de despliegue documentado; su disponibilidad actual
  no se deduce de una prueba local.
- Desarrollo en Mac con PostgreSQL efímero en Docker.
- Productor es la referencia de comportamiento y datos autorizados. Su
  ejecutable no es una dependencia de ejecución de Aluminior.
- Escritorio y funcionamiento offline no están implementados como capacidades
  generales; cualquier ampliación necesita requisitos comprobados.

## Paquetes y fronteras

| Paquete | Responsabilidad | Límite |
|---|---|---|
| `packages/core` | Cálculo, geometría, validación y precios | Sin BD, red, filesystem ni UI |
| `packages/db` | Esquema, migraciones y conexión PostgreSQL | No decide el flujo de pantalla |
| `packages/etl` | Lectura y carga de fuentes autorizadas | El ejecutable posee entorno y conexión |
| `packages/web` | UI, autorización y servicios de aplicación | Delega el dominio puro en core |

Las páginas y rutas componen. Las server actions validan, autorizan, llaman a
un servicio de aplicación y revalidan. Consultas, valoración, persistencia y
numeración permanecen en módulos por caso de uso, cercanos a la funcionalidad.
Los consumidores entre paquetes utilizan entradas públicas, no archivos privados.

## Presupuestos y cerramientos

La cabecera admite cliente opcional y nombre libre. El configurador produce
una única línea `GRUPO`, con configuración editable, descripción, dibujo,
medidas y resultado económico.

Los servicios de cabecera, líneas, estructuras, cerramientos, copia y numeración
están bajo `packages/web/app/dashboard/presupuestos/_lib/`. La búsqueda de
clientes vive en `cabecera/buscar-clientes.ts`, con conexión inyectada.

Un caso de uso que escribe varias tablas utiliza una transacción compartida.
Los módulos reciben la conexión o transacción: no abren otra por su cuenta.
La línea agregada, su configuración y sus satélites se guardan de forma coherente.

Alta y copia HTTP exigen una clave de operación. `_lib/idempotencia/` toma un
lock por actor/clave antes de reservar numeración y guarda un recibo en la misma
transacción (0029, aplicada el 09/10/2026). Repetir recupera el resultado
confirmado; cambiar la intención con una clave confirmada se rechaza. El cliente
conserva por pestaña la clave y, en alta incierta, la solicitud para reintentar.

La configuración v3 permite composición bidimensional. Las v1/v2 se interpretan
compatiblemente, sin reescribir las medidas del documento al abrirlo.
Las medidas económicas de módulo admiten números finitos positivos, incluidas
fracciones de milímetro; su validación no las redondea.
0030 amplía las dimensiones exteriores de línea a double precision para conservar
la misma representación numérica; aplicada en producción el 09/10/2026, A4 verificado.
La geometría compartida alimenta UI y PDF; no constituye por sí sola una regla
de fabricación. Las horas manuales de fabricación y colocación tienen valoración
decimal y snapshot propios.

## Catálogo visual y motor económico

- `core/src/estructuras/diseno/registro.ts` conserva las plantillas verificadas
  y registra las generadas sin sustituirlas.
- `web/.../_lib/catalogo-diseno/` carga árboles y medidas desde la BD,
  genera plantillas dibujables y mantiene una caché por proceso de cinco minutos.
- `0022_catalogo_diseno` añade campos de dibujo; el relleno dirigido modifica
  únicamente campos de filas existentes.
- `0023_motor_catalogo` incorpora once tablas para referencias, descuentos,
  plantillas, asociaciones y parámetros económicos. `0024_motor_catalogo_rls`
  activa RLS y revoca permisos públicos en esas tablas.
- La valoración pura del catálogo vive en core. La adaptación de BD y elección
  de la vía económica vive en `web/.../_lib/estructuras/catalogo-despiece/`.
- La web comprueba disponibilidad y carga del catálogo antes de usarlo.
  Si falta el esquema o el catálogo, conserva la vía anterior.
- Los snapshots `FILA_CENTIMOS` requieren el lector compatible integrado.
  Revertir el catálogo no autoriza volver a un lector antiguo incompatible.

Todos los paquetes declaran ESM. El banco Node/tsx y los servicios web comparten
así una sola instancia del registro de diseños de core; no se duplica el catálogo
entre cargas ESM y CommonJS. Los códigos desconocidos siguen siendo inválidos.

`resultado-cerramiento/sin-union.ts` representa U («SIN UNION») como origen sin
material y con venta/coste cero explícitos. El servicio solo lo emite tras resolver
un catálogo completo con precio cero y filas de cantidad cero. La marca
`SIN_UNION_U` permite leer ese snapshot sin consultar el catálogo; una receta
ausente o una unión material vacía siguen incompletas.

Un importe ausente permanece nulo. El código distingue venta, coste y avisos;
una suma parcial o un despiece sin costes pendientes no prueba receta completa.
Ver [contraste y límites del motor](docs/paridad/INTEGRACION-MOTOR-CATALOGO-2026-10-02.md).

El cargador dirigido `etl:motor-catalogo` simula por defecto, usa una transacción
y verifica que el contenido protegido no cambia. El importador completo puede
vaciar documentos y no se utiliza como procedimiento de producción.

## Separación modular y comprobación

- ETL: CLI separado de `importacion/index.ts` y cargadores por responsabilidad.
- Diseño: tipos, catálogo, composición y representación separados.
- Producción: documento, parámetros de sierra, extremos y orientación separados.
- Precios: valoración individual separada del recálculo masivo de tarifas.
- Esquema: series compuesta por catálogo, acristalamiento, herraje y rebajes.
- Estilos: `globals.css` compone hojas conservando el orden de cascada.

Se revisa la cohesión al acercarse a 250 líneas. Un archivo manual superior a
400 necesita división o excepción documentada. Las excepciones de investigación
en `scripts/modularidad-excepciones.json` están congeladas: antes de ampliarlas
o reutilizarlas, extraer el caso de uso.

`npm run check:architecture` comprueba tamaños, ciclos relativos de ejecución,
accesos privados entre paquetes y dependencias de infraestructura en core.
Es una comprobación estática; no sustituye la revisión semántica ni las pruebas.
El [informe modular fechado](docs/historico/SANEAMIENTO-MODULAR.md) conserva
las mediciones y verificaciones de aquella entrega.

## Evidencia y seguridad de datos

Las decisiones de interacción se contrastan con Productor, conservando teclado,
densidad y estados. La capa visual se moderniza con una sans-serif legible y
JetBrains Mono para códigos, medidas e importes. El contrato completo está en
[AGENTS.md](AGENTS.md) y el mapa en [paridad](docs/paridad/PARIDAD-PRODUCTOR.md).

Las bases de pruebas son locales y desechables; ver
[su preparación y aislamiento](packages/db/README.md). Datos reales, artefactos
de observación y secretos permanecen fuera de Git. Las migraciones aplicadas
no se reescriben; las operaciones remotas requieren autorización y reversibilidad.
