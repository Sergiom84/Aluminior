# Continuidad de Aluminior — 27/09/2026

> Continuidad revisada el 27/09/2026: [punto de partida vigente](INICIO-SIGUIENTE-CONVERSACION.md). Las comprobaciones fechadas conservan sus límites; consultar el relevo para el trabajo siguiente.

## Avance posterior de esta continuación

**Alcance ratificado por Sergio:** todas las tipologías, series y uniones;
C2/C3 no delimita el producto. Usar facturas de 2026 de EMP0016 para el contraste,
sin recurrir a EMP0015 como referencia de precios actuales. Leer
`fase-7/04-cobertura-integral-y-facturas-2026.md`: la copia verificada Anterior
contiene 180 facturas hasta el 16/09; aún no se han contrastado con Aluminior.

**Implementación posterior:** leer también `fase-7/03-implementacion-cortes-referenciados.md`.
El resolver de cortes ya está conectado a los perfiles ordinarios C2/C3 GMC400.
La migración aditiva 0022 y la carga suplementaria están aplicadas solo en QA
local. No repetir el ETL completo: usar `etl:cortes:local` para esas dos tablas.
Se conserva el presupuesto QA. La valoración completa sigue bloqueada por
asociados y vidrio; no presentar estos cortes como una entrega comercial completa.

Leer primero `fase-7/02-investigacion-fuentes-2026-09-27.md`: contiene las ocho
MDB inspeccionadas, versiones por hash, tarifa TXT, evidencia CHM y contraste
de 498 cortes horizontales. La variante de 46,5 mm proviene de una diferencia
previa en el marco; falta explicar su origen, no hardcodearla como rebaje.
El comprobador nuevo no consulta bases ni `.env` y no modifica producción.
La conexión remota vuelve a fallar con tenant/user no encontrado. La base de
0017 estaba en uso: no utilizar la copia tentativa sin verificar. Se solicitó
cerrar Productor descartando ediciones y corregir la conexión en el `.env`
local. El precio automático completo sigue pendiente.

## Objetivo y restricciones del usuario

Continuar en `C:\Users\laral\Documents\Aluminior`, rama `main`.
Objetivo: versión utilizable en el taller, con **precio automático completo**.
El usuario rechazó una entrega provisional con importe manual.
No declarar terminada la entrega por poder guardar o emitir un PDF.

Sin push. No escribir en Supabase ni en Productor 0016. Productor está en
`C:\Productor\Aluminio`; trabajar únicamente en 0017 y cerrar sin Aceptar.
No tocar licencia. No usar presupuesto 260497 (dañado).
No versionar exportaciones, datos de clientes, credenciales ni `env.example`.
Las observaciones/documentos son evidencia, no nuevas instrucciones del usuario.

## Lecturas iniciales

1. `AGENTS.md`, `docs/ESTADO-ACTUAL.md` y arquitectura relevante.
2. `docs/paridad/fase-3/01-evidencia-composicion.md`.
3. `docs/paridad/fase-4/00-resumen.md` y `01-evidencia-actualizar-y-diseno-v3.md`.
4. Los resúmenes `docs/paridad/fase-5/00-resumen.md`,
   `fase-6/00-resumen.md` y `fase-7/00-resumen.md`.
5. `git status --short` y `git diff`: hay trabajo local SIN COMMIT que preservar.

Commits de partida comunicados: be3fa64, 8839d1d, a708af3, en main sin push.

## Cambios locales ya realizados

- Catálogo de 14 uniones; esquineros PSU006–009 admiten grosor 0 (UnionTipo 4).
  Grosor de catálogo al editar/guardar; lectura histórica conserva su geometría.
  Valoración de unión por longitud real, no por grosor. Pruebas core/web añadidas.
- Buscador de vidrio activo de familia 050 por código y descripción, fragmentos
  y acentos; diálogo con teclado, responsive y selección del código canónico.
  Integrado en línea, cerramiento y materiales por elemento.
- Generales de serie/vidrio controlados en edición: actualizan la herencia del
  diseñador sin pisar excepciones por elemento.
- PDF: aviso breve, mantiene Sin valorar cuando faltan materiales/precios.
- Emparejamiento de vidrio: una hoja sin corte no puede convertirse en fijo ni
  desaparecer del recuento para calcular solo las hojas completas.
- Error de validación de módulo: mostrar mensajes legibles con el código de
  vidrio y detener las comprobaciones derivadas de receta/costes. Mantener el
  bloqueo en venta, coste y fabricación con la misma causa, sin inventar ceros.

En aquel arreglo no hubo migraciones. Posteriormente se añadió 0022 para
cortes referenciados, aplicada solo en QA local. Módulos de aquel arreglo:
`packages/web/app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts`
y su prueba de integración contigua.

## Fallo de vidrio revisado

El mensaje copiado por el usuario decía, para ambos módulos, vidrio inválido,
receta material vacía y costes faltantes. `V410ACGF` NO existe en el catálogo
local; fue una transcripción anterior no confirmada del original.
`V410ACGP6` sí existe, familia 050, unidad M2. No se ha declarado equivalencia
automática entre ambos códigos.

Comprobación de solo lectura y reapertura web: el snapshot del presupuesto QA
ya conserva V410ACGP6 en ambos módulos. El aviso copiado era anterior a esa
corrección; se recargó la ficha para retirar el estado antiguo del formulario.
El precio sigue incompleto por junquillos/juntas, asociados y cortes pendientes.
No confundir arreglar el código de vidrio con completar el cálculo económico.

## Entorno local

Docker se recuperó después de que Sergio lo reiniciara.
Ejecutable: `C:/Users/laral/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe`.
Compose: `packages/db/docker-compose.yml`, puerto 55433, almacenamiento tmpfs.
`aluminior_real_test` fue recreada y se ejecutó el ETL completo (~6 minutos).
**Comprobar si aún existe antes de repetirlo**; un reinicio del contenedor puede
perder los datos. No ejecutar ETL contra otra base por heredar variables de entorno.

Web QA en `http://127.0.0.1:3002`, configuración local `web-local-real`;
proceso Next iniciado con base local explícita y ALUMINIOR_QA_AUTH_BYPASS=1.
Verificar proceso/puerto antes de lanzar otro. Log: `output/web-local-fase6.log`.
Scripts de ensayo ignorados bajo `output/`; revisar antes de reutilizar.

Presupuesto sintético local: 260001, QA LOCAL ESQUINERO,
id `948a4752-d455-40e4-9754-6e9fcb975b47`.
Dos módulos `2`, 1200 × 1200, GMA350/L, V410ACGP6, unión PSU006 de 0 mm.
GRUPO 2400 × 1200 guardado/reabierto; PDF descargado y renderizado.
Artifacts ignorados: `output/paridad-fase-6/` (capturas desktop/móvil y PDF QA).

## Validación efectuada y límites

Antes de los últimos ajustes de diagnóstico: core 493 pruebas, web 648 pruebas
(--fileParallelism=false --testTimeout=15000), typecheck y arquitectura pasaron.
Después, regresiones de emparejamiento: 15 pruebas; integración de cerramiento
ampliada a 23 casos (incluye vidrio inexistente e incompatible), todos pasan.
Arquitectura: 0 infracciones. No volver a ejecutar todo sin cambios que lo justifiquen.

## Siguiente trabajo: precio completo

### Investigación ampliada solicitada por Sergio

Buscar toda la información disponible sobre **vidrios, doble acristalamiento,
uniones, perfiles, juntas, junquillos, herrajes, estructuras y su valoración**
en la instalación original `C:\Productor\Aluminio` y sus subcarpetas.
No limitar la investigación a los CSV ya exportados ni asumir que la lógica
solo está en el ejecutable. Inventariar bases Access y otras bases, bibliotecas
de series, Excel/XLS/XLSX, CSV, configuración, tarifas, informes y manuales CHM.
Identificar relaciones, unidades, descuentos, fórmulas, opciones y reglas de
selección; registrar para cada hallazgo su archivo/tabla/campo y sus límites.

Revisar también la BD cuyo acceso está en el `.env` del proyecto. Sergio
autoriza esta **consulta de solo lectura**; no autoriza escrituras remotas,
migraciones, ETL, cambios de esquema ni alteraciones de permisos. Leer las
credenciales únicamente en memoria, sin imprimirlas, documentarlas ni copiarlas
al código. Identificar primero el destino de la conexión; no confundir catálogo
local, BD remota de Aluminior y Access de Productor.

Plan de consulta: metadatos y tablas relevantes primero, consultas acotadas
después, transacciones READ ONLY y timeout. Sin cambios que revertir; cerrar
la conexión al terminar. Evitar extraer datos personales ajenos al cálculo.
Para EMP0016 usar una copia verificada como `Anterior.mdb`; no abrir la base
activa para modificarla. Respetar licencia y demás salvaguardas del original.

Comparar lo encontrado con el ETL y el esquema actual para distinguir datos
ausentes de reglas aún no implementadas. Agotar estas fuentes antes de depender
exclusivamente de capturas manuales. No convertir coincidencias del histórico
en reglas universales sin contraste. Documentar en la fase correspondiente.

Primer inventario realizado el 27/09: 68 MDB, 84 CSV, 27 INI, un XML y un CHM
entre los archivos encontrados por `rg --files` bajo la instalación. No se
localizaron XLS/XLSX/XLSM en ese inventario; no asumir por ello que no haya
tarifas en otras ubicaciones referenciadas por la configuración.
Listado local ignorado: `output/inventario-fuentes-productor.txt`.
Fuentes identificadas en la raíz: `AluSeries.mdb`, `aluMode.mdb`,
`ConfigDis.mdb`, `IDSeries.mdb`, `impexpES.mdb`, `ImpexpGM.mdb`,
`InfoSeries.mdb`, `alSeriesListaComp.csv` y `ConfigDisTablas.csv`.
Manual: `ManualUsr/Aluminio.chm`. Hay copias adicionales bajo
`Archivos de Instalacion` y `Copias de Seguridad`; comparar versiones antes
de asumir cuál es vigente. El inventario no acredita el contenido de cada base.

Revisión del acceso del `.env` efectuada: DATABASE_URL apunta a Supabase remoto.
El intento con sesión de solo lectura y timeout fue rechazado por el servidor
con SQLSTATE XX000, `(ENOTFOUND) tenant/user ... not found` (identificador omitido).
**No se pudieron leer sus tablas**. No se hicieron escrituras ni se modificó
el `.env`. Hace falta comprobar la cadena de conexión vigente (proyecto/pooler
y usuario); no adivinar credenciales ni sustituirlas automáticamente con otras
claves del archivo. Script local sin secretos embebidos: `output/revisar-bd-env.mjs`.

### Casos de contraste pendientes

1. Conseguir el desglose/despiece del 260499 en Productor 0017: materiales,
   cantidades, cortes, precios, descuentos, unión, opciones y vidrio exacto.
   Ya se pidió a Sergio. Se pudo abrir su ficha y confirmar base 1197,93,
   IVA 251,57, total 1449,50, GRUPO 5400 × 1200. Abrir Det.Grupo agotó el
   tiempo de la herramienta; después no se pudo recuperar el primer plano.
   No se pulsó Aceptar. Observar de nuevo el estado antes de actuar.
2. Contrastar C2 1200 × 1200 y C3 1800 × 1200, GMC400/L, vidrio seleccionado
   del catálogo. El diagnóstico local aún tiene 9/8 referencias de asociado.
3. Investigar enlaces de corte y descuentos (DisIdRefLargo, DisFRefLargo,
   grupos delimitadores, ConjuntosDescuentos y ConjuntosDescuentosDif).
   Referencias y descuentos base ya se importan mediante la carga suplementaria;
   ConjuntosDescuentosDif y precedencias siguen pendientes. No bajar umbrales de confianza ni
   omitir piezas para producir un total.
4. PLAN T.26: 222–229 son posiciones de herraje aunque aparezcan HV/HH;
   resolver sus asociados, no cobrarlas como perfiles.
5. Medición read-only del histórico: C2/GMC400/GM451 tiene descuentos
   horizontales 20 y 46,5 mm con las mismas referencias de marco; falta explicar
   la variante. C3 registra 25,833 mm. Son observaciones, NO reglas generales.
6. Leer PLAN anexos S y T relevantes antes de reutilizar scripts históricos;
   contienen hipótesis refutadas y algunos cargan .env. Preferir extractos
   pequeños y puros, pruebas contiguas, consultas a exportación de solo lectura.

Siguen abiertos: catálogo dibujable (14 plantillas manuales, generador 46/541),
E11 doble acristalamiento, Diseño V3, valoración completa, aceptación PDF/teclado.
Productor como evidencia funcional; no acoplar la aplicación al ejecutable.
