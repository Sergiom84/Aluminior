# Aluminior

Sistema de gestión para carpintería de aluminio y PVC.

Reconstrucción del flujo de trabajo de ALUMINIOS LARA SLU sobre una base
moderna: catálogo de series y artículos, clientes, presupuestos con
configurador de estructuras, despiece y documentos comerciales.

## Estado

En construcción. Cuatro módulos operativos y valoración parcial, explícitamente
marcada cuando faltan datos.

| Componente | Estado |
|---|---|
| Análisis del sistema origen | Completado — ver [PLAN.md](PLAN.md) |
| Decisiones de arquitectura | Completado — ver [ARQUITECTURA.md](ARQUITECTURA.md) |
| Esquema de base de datos | 29 tablas y migraciones Drizzle |
| ETL desde el sistema original | Completado: 178.804 filas aplicables |
| Interfaz web | Clientes, Artículos, Estructuras y Presupuestos operativos |
| Motor de despiece | Operativo: 417/417 fórmulas; 99,6% de componentes |
| Valoración | Perfiles y vidrio de hoja/fijo puro; incompletos se muestran sin valorar |

## Contexto

El sistema original (Productor Aluminio, de GAIA Servicios Informáticos)
tiene 968 tablas en Access, de las cuales sólo 204 contienen datos. El
perfilado de las tablas reales redujo `Articulos` de 237 a 64 columnas útiles
y `Clientes` de 236 a 35. El esquema nuevo parte de ese análisis, no de una
copia literal.

Los datos son propiedad de ALUMINIOS LARA SLU. El software original no se
descompila ni se copia: la reconstrucción se hace desde el esquema de datos,
el mapa de los 291 informes Crystal y la observación de la aplicación.

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15 o superior (local, o Supabase en región UE)

## Puesta en marcha

```bash
npm install

cp .env.example .env
# Edita .env con tu cadena de conexión

npm run db:migrate
```

## Estructura

```
packages/
  db/     Esquema Drizzle y migraciones
  etl/    Importación desde los CSV del sistema original
  core/   Dominio: estructuras, despiece, precios (sin dependencias de E/S)
  api/    Servidor Fastify
  web/    Interfaz React
esquema/  Análisis del sistema original: DDL, perfilado, mapa de informes
```

## Datos

**Los datos reales nunca se versionan.** El `.gitignore` bloquea `*.mdb`,
`export_datos/` y la carpeta de investigación. Los ficheros de perfilado que
sí están versionados tienen los valores de muestra omitidos cuando podían
contener datos de terceros.

Para cargar datos en un entorno de desarrollo hace falta el volcado CSV, que
se transfiere aparte y nunca por este repositorio.
