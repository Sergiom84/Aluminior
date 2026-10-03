# Aluminior

Sistema de gestión para carpintería de aluminio y PVC. Productor Aluminio es
la referencia funcional y de interacción; las diferencias requieren evidencia.

Para retomar el proyecto, lee [el estado actual](docs/ESTADO-ACTUAL.md):
qué funciona, qué falta y cuál es el siguiente paso. Consulta
[el índice](docs/INDICE-DOCUMENTACION.md) para encontrar evidencia e histórico.

## Desarrollo en Mac

Requisitos: Node.js 20.9+ y Docker para PostgreSQL local. El repositorio fija
npm 10.9.8 en `packageManager`; usa esa versión para instalar dependencias.

```bash
npx --yes --package=npm@10.9.8 npm ci
cp .env.example .env
docker compose -f packages/db/docker-compose.yml up -d
npm run dev:web
```

Configura `.env` para el destino de desarrollo antes de arrancar la web.
La instalación no aplica migraciones ni importa datos. La preparación y el
aislamiento de bases de pruebas están en [packages/db/README.md](packages/db/README.md).
Una base sintética no incluye el catálogo real, que se transfiere por separado.

## Comprobaciones

```bash
npm run test
npm run typecheck
npm run check:architecture
```

Las pruebas de escritura utilizan PostgreSQL local desechable. Conserva los
destinos separados de cada suite; no fuerces una única base para todos los tests.

## Organización

| Paquete | Responsabilidad |
|---|---|
| `packages/core` | Dominio, geometría, despiece y precios sin E/S |
| `packages/db` | Esquema Drizzle, migraciones y acceso PostgreSQL |
| `packages/etl` | Importación y comprobación de datos autorizados |
| `packages/web` | Next.js App Router, React y orquestación de servidor |

[AGENTS.md](AGENTS.md) contiene el contrato de trabajo;
[CLAUDE.md](CLAUDE.md), las instrucciones complementarias;
[ARQUITECTURA.md](ARQUITECTURA.md), las fronteras y decisiones vigentes.
El mapa funcional y sus criterios están en
[PARIDAD-PRODUCTOR.md](docs/paridad/PARIDAD-PRODUCTOR.md).

## Datos y producción

No se versionan datos reales, exportaciones, MDB, credenciales ni resultados
empresariales derivados. `export_datos/` y `output/` son privados e ignorados;
sus artefactos no se presuponen disponibles en otra copia.

El importador completo vacía tablas destino y no debe ejecutarse contra
producción. Una migración o carga remota requiere alcance explícito y un plan
de verificación reversible. El catálogo visual disponible y la valoración
completa son capacidades distintas: consulta el estado antes de intervenir.
