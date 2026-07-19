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
2. **`PLAN.md`** — el análisis completo con sus anexos A a R; los últimos
   contienen el estado vigente del acristalamiento mixto (Q) y de la
   selección de asociados (R).
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
Presupuestos**. Hay **198.819 filas** cargadas en 33 tablas.

Arranca con:

```bash
npm install
npm run dev:web     # http://localhost:3000/dashboard
```

**El evaluador de fórmulas está resuelto: 417 de 417 validadas**, y la cadena
genérico→perfil resuelve el 99,6% de los componentes. **Ojo con leer eso como
"el motor acierta el 99,6% de los cortes": no es lo que mide.** Sin las reglas
de rebaje, el motor reproduce el 25,1% de las piezas del histórico y ninguna de
las 1.003 líneas con hoja (anexo T). Con ellas, el 91,8% de las piezas de hoja.

## Tu tarea

**Lo primero, y es una decisión que no debes tomar tú: pregunta al usuario qué
umbral quiere para las reglas de rebaje de hoja** (ver más abajo). Sin esa
respuesta no se conecta el rebaje a producción, y sin el rebaje ninguna línea
con hoja se corta bien. Todo lo demás está medido y anotado.

Después, si hay margen: los frentes abiertos están clasificados al final de esta
sección por qué los bloquea. Los que dependen de datos que el ERP no exporta
**no se resuelven midiendo más**; están así por medición, no por pereza.

### Contexto de la tarea original

**Completar la valoración de presupuestos sin inventar importes.** La resolución
de perfiles genéricos, los costes y el acristalamiento de hoja y fijo puro ya
están implementados. Una línea incompleta queda persistida como **sin valorar**
—sin precio ni total— y el presupuesto tampoco muestra un total válido.

La plantilla de despiece referencia **artículos genéricos** —`(**MARCO VERTICAL
GENERICO**)`, `(**TRAVESAÑO MARCO GRANDE GENERICO**)`, 311 en total— que no
tienen precio porque son **ranuras**. La serie es la que resuelve cada ranura a
un perfil real.

**Ya confirmado e implementado:**
- La serie *es* un conjunto: las 57 series de la empresa existen como
  `Conjunto` en `ConjuntosLin` (coincidencia 57/57)
- `ConjuntosLin` mapea `Conjunto + Componente(genérico) → Articulo(real)`
- Verificado: serie GMA100, genérico 10 → GM100, con coste

La cadena de delegaciones de la serie y `DisComponente` resuelven los perfiles
reales con un 96,5% de coincidencia frente al oráculo histórico. Los asociados
(herrajes y escuadras), la mano de obra y las correderas siguen sin valoración
y deben seguir mostrando el aviso honesto.

El acristalamiento de **estructuras mixtas** (hoja + fijo) está implementado
para los casos demostrados: el árbol de `EstructurasDiseño` modela los perfiles
que delimitan cada hueco (marco, travesaño exacto, hoja exacta y división
invisible), y `scripts/analizar-mixtas.mjs` obtiene 21 reglas físicas estables
que reproducen 421/540 dimensiones y 49/121 casos completos (anexo Q). Esas
reglas están cargadas (migración 0011 + ETL) y la web valora ranura a ranura;
si a un hueco le falta cualquiera de sus dos reglas, la línea entera queda sin
valorar. La variante de cristal sencillo/doble ya es una elección persistida.

**El siguiente paso es cerrar la selección de asociados** (herrajes y
escuadras). El mecanismo completo está identificado y medido (anexos S.1 a
S.8 de `PLAN.md`): es **resolución de ranuras**, como los perfiles. El
predictor de referencia es `scripts/medir-seleccion-v5.mjs` (ejecutar con
`npx tsx`), que reproduce el oráculo con **96,3% de precisión, 92,6% de
cobertura y 51/216 líneas exactas en artículos**. Sus reglas, todas
validadas:

- Ranura presente en la instancia + `nOpcion` marcada + `ArticuloAsoc`
  (perfil requerido presente) + rango de medida contra la **fórmula de la
  propia ranura** evaluada con las cotas reales (S.6) + mano `I`/`D`
  contra el `DisManoID` real de la instancia.
- Filas acumulativas con cantidades 0 y negativas (S.1); cantidad = filas
  × apariciones que pasan.
- `A`/`L` = patillas por `UnidadesMin`; `!` = categoría en texto con
  multiplicador aprendido de la instancia (rasgos `fn:`/`gen:` ×
  constante k, umbrales ≥5 obs y ≥90%).
- La junta perimetral de hoja copia EXACTAMENTE cada corte de perfil de
  hoja (delta 0, 4.624/4.632 tramos — S.7.2).

Los tres frentes de S.8 **ya se atacaron** y están cerrados o acotados
(anexo S.9): los tacos se resolvieron (76/76, rasgo `trvPeq`), la goma
resultó ser acristalamiento por hueco con delta 0 (S.9.7), y el primero
—"evaluar el ancho real de cada hoja"— **quedó REFUTADO**: `FormulaLargo`
ya es la cadena `REF` aplanada, así que evaluarla ya es evaluar el ancho
real. No repitas ese trabajo.

## ⚠️ Lo más importante que se ha descubierto: el anexo T

Se ejecutó por primera vez el **motor de producción contra el histórico**
(`scripts/probar-motor-contra-oraculo.mjs`, 1.229 líneas reales). Resultado:
reproduce **25,1% de las piezas**, y de las **1.003 líneas con hoja, cero**
son correctas. El marco sí sale bien (91,9%).

Esto **no contradice** el "417/417 fórmulas validadas" ni el "99,6%": esas
cifras miden que el evaluador resuelve las fórmulas, no que los cortes
coincidan con los del ERP. Nadie había hecho esa comprobación.

La causa se midió y se cerró: la hoja va **rebajada** respecto al hueco y el
motor emitía la medida del hueco. La regla es
`rebaje = f(perfil, eje, fórmula, serie)` — 64 reglas, **93,0% de cobertura,
con techo medido del 94,4%** (lo que falta no está en los CSV). Está
**implementada con guarda** en `calcularDespiece`
(`OpcionesDespiece.rebajeDeHoja`): si falta la regla, la pieza queda **sin
medida** y la línea sin valorar, nunca con la medida del hueco. Con ella el
motor pasa de 0,2% a **91,8% de piezas de hoja** correctas.

## Lo único que bloquea avanzar: una decisión que no es técnica

Con umbral del 90% quedan **92 piezas con medida incorrecta y sin aviso**, y
**el 79,3% se desvía más de 10 mm** (máximo 630 mm): hojas que no encajan.
Subir el umbral las elimina pero hunde la cobertura:

| Umbral | piezas correctas | cortes MALOS |
|---:|---:|---:|
| 90% | 91,8% | 92 |
| 99% | 61,9% | 16 |
| 100% | 18,7% | 0 |

**Hay que elegir umbral antes de conectar esto a producción.** El motor no
lo fija: vive en quien construye la tabla de reglas. Recomendación (no
decisión): empezar por 99% y revisar a mano los grupos entre 99% y 90%.

## Frentes abiertos, clasificados por qué los bloquea

**Bloqueados por falta de DATOS** (no de análisis; medido y anotado):
- Variación del rebaje dentro de un mismo grupo — techo 94,4% (T.10).
- **Qué piezas de hoja llevan junta**: los 5.158 tramos de junta **no
  tienen enlace de diseño** (`VDatosLinDetDis`), así que la atribución no
  se puede reconstruir (T.15). `emitirJuntaPerimetral` está implementada y
  probada pero **marcada como NO APTA PARA PRODUCCIÓN**: acierta el largo
  (94,2%) y emite **840 tramos de más**.
- `AperturaTH`: sólo 14 filas en el oráculo, 7 a favor y 7 en contra (S.9.9).
- Los 24 casos de tramos de S.9.1: una misma medida evaluada da dos tramos
  reales distintos. Sin hipótesis.

**Bloqueado por la FORMA del modelo, no por los datos:**
- `BISAGRA PRACTICABLE` (`GM4846`): el contexto SÍ determina la cantidad
  (techo 100%), pero `real = base × rasgo × k` no puede expresarla. Ningún
  rasgo explica ni una de las 26 observaciones no nulas (S.9.8).

**Cerrados como vía muerta** (no volver a mirarlos): `TipoMedCV` es
constante, `FormulaOpcion` afecta a 0 filas del oráculo, `GrupoAsoc` y las
columnas booleanas no son condiciones (S.9.9).

La valoración de asociados **sigue cerrada con aviso**: el predictor v5 va
al 96,4%/94,3% con 72/216 líneas exactas.

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

**8. Desconfía de todo emparejamiento que hayas inventado tú.**
Ha pasado **tres veces** en este proyecto, siempre igual: emparejas piezas por
proximidad de medida, mides sobre las parejas resultantes y sale una señal
preciosa que no existe. Ocurrió en S.7.2 (un ajuste por serie que era delta 0),
en T.6 (el perfil explicaba "seis veces más" que la serie; con la muestra
completa, lo mismo) y en T.15 (un 80% que al quitar la ambigüedad era 41,5%).
Si dos elementos son intercambiables y tú eliges cuál va con cuál, **has
fabricado el dato que luego mides**. Agrupa por algo inequívoco, o usa el
enlace real (`VDatosLinDetDis`) si existe — y si no existe, dilo: eso es
exactamente lo que cierra un frente por falta de datos.

**9. Comprueba que un grupo "estable" no lo es por trivialidad.**
Una regla medida sobre observaciones que comparten todas la misma medida no
demuestra nada. En T.9, 24 de 74 grupos estables eran así: separarlos bajó la
cobertura del 81,5% al 79,6% real. Mide siempre si el grupo abarca valores
distintos.

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
