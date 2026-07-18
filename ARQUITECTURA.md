# Decisiones de arquitectura

Fecha: 18 de julio de 2026.
Propuesta del usuario: Electron + Supabase o Appwrite + Render.
Respuesta: de acuerdo en dos de tres, con matices. Abajo el razonamiento.

---

## 1. Electron — de acuerdo con el destino, no con el punto de partida

**Decisión: construir primero una aplicación web. Envolver en escritorio después, si hace falta.**

Electron no es una mala elección, pero comprometerse ahora cuesta caro y no aporta nada
todavía:

- Empaquetado, firma de código, actualizador automático y instaladores por plataforma.
  Todo eso es trabajo real que no acerca ni un día la primera pantalla útil.
- Un taller con varios puestos se beneficia de lo contrario: una aplicación web se
  actualiza en un sitio y todos los puestos la tienen. El sistema actual sufre justamente
  de lo opuesto — instalación pesada por equipo.

**Y lo importante:** si la aplicación se construye como web bien hecha, envolverla en
Electron o Tauri después es cuestión de días, no de rearquitecturar. La decisión no se
pierde, se aplaza al momento en que se pueda tomar con información.

Cuándo sí tocaría Electron: si hace falta acceso directo al sistema de ficheros para
maquinaria de corte, puerto serie con CNC, o impresión de etiquetas a bajo nivel. Son
requisitos plausibles en este dominio — por eso el destino es razonable. Pero se confirman
sobre la marcha, no de entrada.

## 2. Supabase vs Appwrite — Supabase, y por una razón concreta

**Decisión: PostgreSQL. Supabase como alojamiento gestionado.**

No es cuestión de gustos. Este modelo de datos tiene 204 tablas con datos, tablas de 132
y 235 columnas, y un motor de cálculo que cruza estructuras, artículos, tarifas y
opciones. Eso es SQL relacional puro y duro.

- **Supabase es PostgreSQL de verdad.** Migraciones, vistas, índices compuestos, CTEs,
  funciones. Todo disponible.
- **Appwrite** orienta a documentos y su capa relacional es más limitada. Pelearía contra
  el modelo en lugar de ayudar.

**Matiz importante:** usar Supabase como base de datos, no como arquitectura. Su SDK de
cliente está pensado para que el navegador hable directo con la base. Aquí no sirve: el
motor de despiece y el cálculo de precios tienen que vivir en un servidor. Si el cliente
calcula precios, cualquiera puede manipularlos.

Además, nada ata: si mañana conviene mover a un Postgres propio o a Render Postgres, es
una cadena de conexión. Supabase no crea dependencia si no se usa su SDK.

## 3. Render — de acuerdo

Correcto para empezar. Despliegue simple, Postgres gestionado si se quiere consolidar,
precio razonable a esta escala.

## 4. Lo que hay que decidir y no estaba en la propuesta

### 4a. ¿Y si se cae internet?

Un taller que no puede presupuestar porque falló la conexión es un problema serio.
El sistema actual funciona en local y eso es una ventaja real que no conviene perder
sin pensarlo.

Opciones, de menos a más esfuerzo:
1. Aceptarlo. Si la conexión es fiable y hay 4G de respaldo, puede bastar.
2. Servidor local en el taller, con réplica a la nube. Mejor latencia y funciona sin línea.
3. Cliente con capacidad offline y sincronización. Es la más cara con diferencia.

**Recomendación: empezar por la 1, diseñar sin cerrar la puerta a la 2.**

### 4b. Datos personales

227 MB con clientes, direcciones, NIF y obras. Al subirlo a un proveedor cloud entra el
RGPD: contrato de encargado de tratamiento, y preferentemente región europea.
Supabase y Render permiten elegir región UE. **Hay que elegirla explícitamente.**

### 4c. Coste

El plan gratuito de Supabase no sostiene esta base. Contar con plan de pago desde el
principio.

## 5. Stack elegido

| Capa | Elección | Motivo |
|---|---|---|
| Base de datos | **PostgreSQL** (Supabase, región UE) | Es un modelo relacional pesado |
| Backend | **Node + TypeScript + Express 5** | El cálculo debe estar en servidor |
| Validación | **Zod** | Esquemas compartidos entre API y frontend |
| Acceso a datos | **Drizzle ORM** | SQL explícito, migraciones versionadas |
| Frontend | **React + TypeScript + Vite** | Envolvible en Electron después |
| Despliegue | **Render** (API + estáticos) | Como propuso el usuario |
| Escritorio | **Electron o Tauri, más adelante** | Cuando haya requisito que lo justifique |

**Un solo lenguaje, TypeScript, de punta a punta.** Reduce el coste de mantenimiento y
encaja con la dirección que marcaste (Electron y Supabase son ambos ecosistema JS).

Esto sustituye a la propuesta de .NET del plan original: aquella era razonable por el
origen Windows del sistema, pero TypeScript encaja mejor con las herramientas que has
elegido y con quien va a mantener esto.

### 5a. Express en lugar de Fastify — decidido el 18/07/2026

La propuesta inicial de este documento era Fastify. Se optó por Express, y el
razonamiento queda aquí para no revisitarlo:

- **El rendimiento no es el criterio.** El cuello de botella será PostgreSQL y
  el motor de despiece, no el enrutado HTTP. Con una decena de usuarios
  concurrentes la diferencia es indetectable.
- **Ecosistema y familiaridad** pesan más a largo plazo: cualquiera que herede
  este código conoce Express.
- **Lo que Fastify aportaba** —validación por esquema integrada— se cubre con
  Zod, que se quiere igualmente para compartir tipos entre API y frontend.

Si algún día el enrutado fuese medible como cuello de botella (no lo será a
esta escala), migrar es cuestión de horas: la lógica vive en `core`, no en la
capa HTTP.

## 6. Estructura del repositorio

```
aluminior/
├─ packages/
│  ├─ db/          Esquema Drizzle, migraciones, seeds
│  ├─ etl/         Importación CSV -> PostgreSQL, validación
│  ├─ core/        Dominio: estructuras, despiece, precios (sin E/S)
│  ├─ api/         Fastify: REST + autenticación
│  └─ web/         React + Vite
├─ docs/           PLAN.md, ARQUITECTURA.md, esquema original
└─ scripts/        Utilidades de desarrollo
```

`core` sin dependencias de infraestructura: es donde vivirá el motor de despiece y donde
se ejecutarán las pruebas contra las 468.838 líneas históricas.
