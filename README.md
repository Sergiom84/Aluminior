# Aluminior

Sistema de gestión para carpintería de aluminio y PVC.

Reconstrucción del flujo de trabajo de ALUMINIOS LARA SLU sobre una base
moderna: catálogo de series y artículos, clientes, presupuestos con
configurador de estructuras, despiece y documentos comerciales.

## Estado

En construcción. Código para clientes, artículos, estructuras, presupuestos,
compras y producción; valoración parcial, explícitamente marcada cuando faltan
datos. Esto no certifica paridad completa ni aptitud general para fabricación.

Estado revisado, pendientes y orden de lectura:
[docs/ESTADO-ACTUAL.md](docs/ESTADO-ACTUAL.md). El saneamiento precede a las
siguientes fases, que se retomarán cuando lo indique el usuario.

| Componente | Estado |
|---|---|
| Análisis del sistema origen | Investigación histórica extensa; paridad con pendientes — ver [PLAN.md](PLAN.md) |
| Decisiones de arquitectura | Completado — ver [ARQUITECTURA.md](ARQUITECTURA.md) |
| Esquema de base de datos | Migraciones versionadas y pruebas locales; estado remoto no revisado en este saneamiento |
| ETL desde el sistema original | Importador modular; las cifras de carga anteriores son históricas |
| Interfaz web | Next.js: módulos comerciales, diseñador, PDF y producción con alcance parcial |
| Motor de despiece | Pruebas de cálculo; evaluar fórmulas no implica acertar todos los cortes |
| Valoración | Perfiles y vidrio de hoja/fijo puro; incompletos se muestran sin valorar |

## Dirección de producto

**Productor Aluminio es la referencia funcional y de interacción de
Aluminior.** El objetivo no es crear un ERP genérico inspirado en Productor,
sino reconstruir con la máxima fidelidad posible la herramienta que ya conoce
el taller, sobre una arquitectura moderna y mantenible.

La paridad incluye, cuando exista evidencia suficiente:

- arquitectura de pantallas, ventanas, pestañas y diálogos;
- orden de las tareas y transiciones entre estados;
- campos visibles, agrupaciones, tablas, totales y acciones contextuales;
- vocabulario del dominio y significado de estados y documentos;
- densidad operativa, navegación por teclado y atajos de función;
- comportamiento de búsquedas, altas, edición, emisión y configuración de líneas;
- reglas de negocio y resultados, salvo errores conocidos del sistema original.

La paridad no obliga a copiar la estética de Windows XP. Aluminior debe usar una
presentación contemporánea, clara y accesible, sin perder información ni añadir
pasos. Se modernizan superficies, tipografía, iconografía, estados de foco,
responsive y accesibilidad; no se sustituye el flujo probado por dashboards de
tarjetas, navegación genérica o patrones importados de otros proyectos.

En presupuestos, el **configurador de cerramientos es el núcleo del producto**.
La cabecera debe resolverse en segundos —incluido el nombre libre sin alta de
cliente— y llevar directamente al diseño. La selección de cliente permite
buscar por código o por varios fragmentos del nombre (`ser her la`). El
resultado del configurador se
trata como una línea agregada de tipo `GRUPO`, con dibujo, descripción, medidas,
precio y ajustes manuales trazables; la consulta histórica es infraestructura,
no el flujo principal.

Cada módulo se reconstruye a partir de evidencia: observación autorizada de
Productor, capturas y manual CHM, datos y configuraciones propios, informes,
entrevistas con usuarios y pruebas comparativas. Cuando la evidencia no alcance,
la diferencia debe documentarse como hipótesis o decisión consciente, no
presentarse como paridad confirmada.

El mapa de pantallas, fuentes y criterios de aceptación se mantiene en
[`PARIDAD-PRODUCTOR.md`](PARIDAD-PRODUCTOR.md).

## Criterio de modularidad

Aluminior se desarrolla por módulos verticales y archivos pequeños. Cada pieza
debe tener una responsabilidad reconocible: composición de página, estado del
diseñador, dibujo, catálogo, búsqueda, validación, persistencia o cálculo.

- Las páginas y server actions coordinan; no concentran reglas de negocio ni SQL.
- El dominio puro y comprobable vive en `packages/core`.
- La persistencia y el esquema viven en `packages/db`.
- Los componentes privados permanecen junto a la funcionalidad que los usa.
- Al aproximarse a 250 líneas se revisa la cohesión; por encima de 400 líneas,
  un archivo manual debe dividirse o justificar expresamente la excepción.
- Los refactors se hacen por responsabilidad y con pruebas, nunca troceando un
  archivo de forma mecánica.

Las acciones delegan en servicios por caso de uso. ETL, diseño, producción,
precios, esquema y estilos tienen fronteras revisadas. Ejecutar
`npm run check:architecture` para detectar crecimiento y dependencias indebidas.
Las excepciones de investigación histórica están justificadas en
[docs/SANEAMIENTO-MODULAR.md](docs/SANEAMIENTO-MODULAR.md).

## Contexto

El sistema original (Productor Aluminio, de GAIA Servicios Informáticos)
tiene 968 tablas en Access, de las cuales sólo 204 contienen datos. El
perfilado de las tablas reales redujo `Articulos` de 237 a 64 columnas útiles
y `Clientes` de 236 a 35. El esquema nuevo parte de ese análisis, no de una
copia literal.

Los datos son propiedad de ALUMINIOS LARA SLU. La reconstrucción puede apoyarse
en análisis estático o dinámico del software original únicamente cuando exista
autorización y sea necesario para comprender interoperabilidad, comportamiento
o datos propios. No se eluden licencias, activaciones ni protecciones, y no se
reutilizan ni distribuyen código o activos propietarios de terceros sin permiso.
La fuente preferente para la interfaz sigue siendo la observación, el manual CHM,
las capturas, los datos propios y las pruebas de comportamiento.

El ejecutable de Productor **no se incrusta ni se ejecuta dentro de Aluminior**.
La integración consiste en reconstruir en código propio sus flujos y reglas
observadas, y en migrar los datos y configuraciones autorizados al modelo de
Aluminior. El `.exe` se conserva únicamente como referencia verificable.

## Requisitos

- Node.js 20.9 o superior
- PostgreSQL 15 o superior (local, o Supabase en región UE)

## Puesta en marcha

```bash
npx --yes --package=npm@10.9.8 npm ci

cp .env.example .env
# Edita .env con tu cadena de conexión

npm run db:migrate
```

Para instalar o actualizar dependencias se utiliza npm 10.9.8 mediante `npx`,
sin cambiar npm global. npm 11 presenta un [defecto con overrides en workspaces](https://github.com/npm/cli/issues/9514)
que puede restablecer versiones vulnerables. `packageManager` documenta la
versión; no la impone. Los comandos `npm run` habituales siguen siendo válidos.
El entorno de pruebas con datos sintéticos se describe en
[packages/db/README.md](packages/db/README.md). Los artefactos de sesiones bajo
`output/` son locales e ignorados; no se presupone su disponibilidad en otra copia.

## Estructura

```
packages/
  db/     Esquema Drizzle y migraciones
  etl/    Importación desde los CSV del sistema original
  core/   Dominio: estructuras, despiece, precios (sin dependencias de E/S)
  web/    Next.js: interfaz y orquestación server-side
esquema/  Análisis del sistema original: DDL, perfilado, mapa de informes
```

Para retomar el proyecto en otra conversación, empezar por
[`docs/ESTADO-ACTUAL.md`](docs/ESTADO-ACTUAL.md). Los relevos anteriores se
clasifican en [el índice documental](docs/INDICE-DOCUMENTACION.md).

## Datos

**Los datos reales nunca se versionan.** El `.gitignore` bloquea `*.mdb`,
`export_datos/` y la carpeta de investigación. Los ficheros de perfilado que
sí están versionados tienen los valores de muestra omitidos cuando podían
contener datos de terceros.

Para cargar datos en un entorno de desarrollo hace falta el volcado CSV, que
se transfiere aparte y nunca por este repositorio.
