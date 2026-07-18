# Prompt para continuar el proyecto Aluminior

> Copia el bloque de abajo tal cual. Está escrito para que quien lo reciba
> pueda arrancar sin contexto previo.

---

Hola. Retomo un proyecto en curso y necesito que continúes desde donde está.

## Contexto

Estoy reconstruyendo el ERP de mi empresa, **ALUMINIOS LARA SLU** (carpintería
de aluminio y PVC). El sistema actual es **Productor Aluminio**, de GAIA
Servicios Informáticos: una aplicación Windows de hace décadas, con 995 tablas
en Microsoft Access, Crystal Reports de 32 bits y licencia por mochila USB.

Los datos son míos. El software no. La reconstrucción se hace **en sala
limpia**: a partir del esquema de datos, de los informes y de observar la
aplicación funcionando. **No se descompila ni se copia código de GAIA, y no se
toca el sistema de licencia.**

## Lo primero que debes hacer

Lee estos tres documentos del repositorio, en este orden:

1. **`ENTREGA.md`** — estado completo: qué se ha hecho, qué se ha descubierto,
   qué falta, y todas las rutas. Es el documento principal.
2. **`PLAN.md`** — el análisis con sus anexos A a I. Los anexos **F, G, H e I**
   son los importantes: contienen el motor de despiece y el problema abierto.
3. **`ARQUITECTURA.md`** — decisiones técnicas y su razonamiento, incluidas las
   que se revirtieron.

No empieces a escribir código hasta haberlos leído.

## Rutas que necesitas

```
Repositorio        C:\Users\laral\OneDrive\Documentos\Aluminior
GitHub             https://github.com/Sergiom84/Aluminior   (privado)
Credenciales       .env en la raíz  (NO versionado)

Sistema original   C:\Productor\Aluminio\AluminioApp.exe    (la app real)
                   C:\Productor\Aluminio\aluminio.exe       (solo lanzador)
Base activa        C:\Productor\Aluminio\EMP0016\aluminio.mdb   (226 MB)
Catálogo series    C:\Productor\Aluminio\InfoSeries.mdb         (358 MB)

CSV exportados     C:\Users\laral\OneDrive\Documentos\Aluminior\export_datos\EMP0016\
                   205 ficheros, 227 MB — es tu fuente de datos
```

Las MDB se leen con `Microsoft.ACE.OLEDB.16.0` (instalado, 64 bits).
**Siempre sobre copia, nunca sobre la base activa.**

## Estado actual

Aplicación **Next.js 15 + TypeScript + Drizzle + PostgreSQL** (Supabase, región
UE). Funcionan cuatro módulos: **Clientes, Artículos, Estructuras y
Presupuestos**. Hay 119.347 filas cargadas.

Arranca con:

```bash
npm install
npm run dev:web     # http://localhost:3000/dashboard
```

**El motor de despiece está resuelto y operativo al 99,6%.** Las fórmulas de
corte (`L-FS-FI`, `(A)/2`…) se evalúan correctamente: 417 de 417 validadas.

## Tu tarea

**Resolver la valoración de presupuestos.** Está bloqueada por un problema
concreto y bien delimitado, descrito en el anexo I de `PLAN.md`:

La plantilla de despiece referencia **artículos genéricos** —`(**MARCO VERTICAL
GENERICO**)`, `(**TRAVESAÑO MARCO GRANDE GENERICO**)`, 311 en total— que no
tienen precio porque son **ranuras**. La serie es la que resuelve cada ranura a
un perfil real.

**Ya confirmado:**
- La serie *es* un conjunto: las 57 series de la empresa existen como
  `Conjunto` en `ConjuntosLin` (coincidencia 57/57)
- `ConjuntosLin` mapea `Conjunto + Componente(genérico) → Articulo(real)`
- Verificado: serie GMA100, genérico 10 → GM100, con coste

**Sin resolver:** de los 14 genéricos del despiece de la estructura `1+1`, la
serie resuelve 5. Los de **marco, travesaño y escuadra** (`2`, `3`, `97`, `105`)
no los resuelve ningún conjunto. Se resuelven por otro mecanismo.

**Candidatos, en orden:**
1. `ConfigSeriesAsoc` (1.137 filas) — `Conjunto + TipoHoja → Articulo`, con
   fórmulas propias. El más prometedor.
2. `TablaHojas` / `TablaFijos` — el conjunto de serie apunta a `GM08`
3. `ConjuntosAsoc` (13.345 filas) — con `ComponenteAsoc` y fórmulas
4. `EstructurasSeriesAsoc` (2.134 filas)

Hay scripts de diagnóstico ya escritos en `scripts/buscar-genericos.mjs` y
`scripts/resolver-genericos.mjs`. Úsalos como punto de partida.

Cuando lo resuelvas: cargar `ArticulosCoste` (27.817 filas, aún sin migrar) e
implementar la valoración.

## Cómo quiero que trabajes

Estas reglas salieron de errores reales cometidos en este proyecto. Respétalas.

**1. Mide toda hipótesis contra los datos antes de construir encima.**
Se descartó un parser de códigos que parecía correcto y sólo cubría el 21%, con
errores graves. Comprobarlo costó una hora; construir encima habría costado
meses de errores silenciosos en presupuestos con dinero real.

**2. Ejecuta lo que escribes. Compilar no es funcionar.**
Los tres bugs más serios del proyecto compilaban perfectamente: un pool de
conexiones que se agotaba, una validación que fallaba sin mostrar error, y un
`package.json` con BOM. Ninguno lo habría detectado el typechecker.

**3. Nunca inventes un valor que no sabes.**
Si falta una variable de una fórmula, el sistema **falla con un mensaje**, no
asume cero. Un cero silencioso en una medida de corte es una pieza mal cortada.
Si falta un precio, la línea dice **"sin valorar"**, no cero. Un presupuesto
que se queda corto en silencio es dinero perdido en cada venta. **Mantén ese
criterio.**

**4. Nada de datos personales en el repositorio.**
Ya casi se cuelan nombres, NIF, direcciones y teléfonos de clientes reales.
Antes de cada commit, barre en busca de NIF, emails y móviles. `.env` y
`export_datos/` están en `.gitignore`; que siga así.

**5. Distingue descartar de excluir en el ETL.**
Un descarte es una fila que debería haber entrado y no pudo: eso es un problema
y hace fallar la carga. Una exclusión es un filtrado deliberado. Sin esa
distinción, un descarte real se esconde entre el ruido.

**6. Documenta los errores, no sólo los aciertos.**
`PLAN.md` incluye anexos donde se corrigen afirmaciones anteriores. Si algo de
lo que hay escrito resulta falso, **corrígelo explícitamente** en vez de
disimularlo.

**7. Dime lo que no sabes.**
Si llegas a un punto donde sólo entiendes el problema a medias, dilo y para. Es
preferible a construir sobre una comprensión parcial.

## Detalles operativos

- **PowerShell 5.1**: `Set-Content -Encoding utf8` escribe BOM y rompe los
  JSON. Usa herramientas que escriban UTF-8 limpio.
- El repositorio está dentro de OneDrive. El `.gitignore` protege lo sensible.
- La aplicación original se puede abrir para consultar. Es un sistema en
  producción: **no modifiques datos reales**. Si creas algo de prueba, bórralo
  y confirma que lo has borrado.
- `Utilidades → Ejecuta SQL` dentro de la aplicación permite consultar sin
  tocar las MDB por fuera.

## Lo que NO debes hacer

- No descompiles los ensamblados de GAIA
- No toques la mochila HASP/UniKey ni la comprobación de licencia
- No factures ni construyas facturación legal: VeriFactu está en vigor y
  requiere certificación. Ese módulo va aparte y al final.
- No subas datos de clientes a ningún sitio

Empieza leyendo `ENTREGA.md` y dime cómo lo enfocas antes de escribir código.
