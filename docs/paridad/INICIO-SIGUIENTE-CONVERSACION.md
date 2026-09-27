# Punto de partida: extracción integral de Productor y paridad

Actualizado el 27/09/2026. Este es el relevo operativo vigente. El estado de
implementación está en [ESTADO-ACTUAL](../ESTADO-ACTUAL.md); el mapa actualizado
de fases, en [ESTADO-FASES](ESTADO-FASES.md). Los prompts antiguos son históricos.

## Encargo y resultado esperado

Continuar en `C:\Users\laral\Documents\Aluminior`, rama `main`, preservando
todos los cambios sin commit. Obtener el máximo de información útil y
verificable de `C:\Productor\Aluminio` para reproducir todas las tipologías,
series, uniones, opciones y operaciones del taller en Aluminior. No limitar
el producto a C2/C3 ni a las estructuras vendidas durante 2026.

El objetivo es paridad funcional, de cálculo e interacción con uso moderno.
No basta guardar una GRUPO o emitir PDF. Sergio requiere precio automático
completo; no acepta sustituirlo por un importe manual provisional.

La instalación NO se ha agotado. No confundir datos todavía no extraídos o
relaciones no entendidas con información inexistente. Investigar primero
catálogo, documentos de origen, configuración, CHM e informes; recurrir al
usuario solo ante un bloqueo concreto que las fuentes disponibles no resuelvan.

## Lectura inicial y comprobaciones

1. Leer `AGENTS.md`, `ARQUITECTURA.md`, `docs/ESTADO-ACTUAL.md` y este relevo.
2. Leer fase 7: `02-investigacion-fuentes-2026-09-27.md`,
   `03-implementacion-cortes-referenciados.md`,
   `04-cobertura-integral-y-facturas-2026.md` y
   `05-primer-barrido-facturas-2026.md`.
3. Consultar resúmenes de fases 1–6 y sus evidencias al abordar ese flujo.
   PLAN anexos S y T contiene investigación extensa con hipótesis rectificadas;
   leer conclusiones posteriores antes de reutilizar sus scripts.
4. Inspeccionar `git status --short`, diff y procesos locales. HEAD observado:
   `a708af3`; no implica que los cambios posteriores estén comprometidos.
5. Comprobar existencia de copias y artefactos locales. Las rutas ignoradas
   no viajan con Git. July no estaba disponible; consultar si vuelve a estarlo.

## Lo obtenido de la instalación

Inventario ampliado: 68 MDB, 84 CSV, 31 INI, 28 TXT, 303 RPT, 6 PDF, 6 MHT,
1 CHM. Los 26 `.db` encontrados eran Thumbs.db. No se localizaron hojas
Excel ni otras bases en ese recorrido; revisar rutas externas referenciadas
antes de concluir que no existen otras fuentes.

Ocho MDB inspeccionadas sobre copias con SHA-256 verificado:

| Fuente | Tablas / pobladas | Uso y límite |
|---|---:|---|
| ConfigDis | 71 / 26 | Configuración y descripciones |
| AluSeries | 2 / 2 | Nombres de grupos y componentes |
| aluMode | 995 / 126 | Plantilla; no acredita tarifa vigente del taller |
| IDSeries | 1 / 1 | Identificadores, relaciones e incompatibilidades |
| impexpES | 861 / 86 | Biblioteca; dos tablas no legibles, sin reparar |
| ImpexpGM | 942 / 122 | Biblioteca de descuentos y acristalamiento |
| InfoSeries | 9 / 9 | Bibliotecas, series y actuaciones |
| EMP0016/Anterior | 995 / 205 | Catálogo y documentos propios; fuente principal |

En Anterior: 35.723 descuentos, 5.984 diferencias, 2.488 filas de
acristalamiento. Variantes de biblioteca con hashes distintos quedan por
comparar. `Tarifa/GM` contiene 19 TXT/INI con fechas de 2022: no asumir vigencia.
CHM extraído con 7-Zip; el índice y contenido permiten seguir investigando.

Hallazgos concretos:

- C2/C3 GMC400: dependencia de corte de hoja respecto al marco y descuentos
  por extremos. Diagnóstico retrospectivo 498/498 HH usando el marco observado;
  NO es una predicción independiente. Seis estructuras tienen el marco 53 mm
  más corto; su causa sigue pendiente, no convertirla en una constante.
- V410ACGP6: D.A. de 20 mm, DABASE + VLS4 + CAM10A + CGP6. V410ACGF no existe
  en el catálogo examinado; no declarar equivalencia. Coste/PVP de D.A. tiene
  modalidades propias y no equivale a sumar vidrios sueltos.
- GMC400: TablaHojas GM01, TablaFijos GM08; junquillo `0`, junta `V1000`
  sin artículo localizado. El marcador de biblioteca no autoriza omitir piezas.
- Herrajes HU315/HU316: 7/9 asociaciones; opciones, condiciones y recuentos
  pendientes. Ranuras 222–229 son herraje aunque lleven función HV/HH.
- TAcristalamiento tiene auxiliares y configuración que el ETL parcial no
  conserva. ConjuntosDescuentosDif y su precedencia siguen sin implementar.

## Qué se implementó en esta conversación

Motor puro de cortes referenciados, separación de medición, importación
suplementaria y conexión a valoración SOLO para perfiles ordinarios de C2/C3
GMC400. Los restantes modelos y series conservan su resolución anterior,
sin acreditación universal. Falta precio completo de vidrio y asociados.

Archivos de entrada: `packages/core/src/despiece/cortes-referenciados.ts`,
`medir-pieza.ts`, `packages/etl/src/importacion/cortes-catalogo.ts` y
`packages/web/app/dashboard/presupuestos/_lib/estructuras/cortes-catalogo.ts`.
Migración aditiva 0022: referencias de corte y descuentos. Aplicada solo en
QA local. Cargadas 14.039 referencias y 35.723 descuentos; presupuesto QA
preservado. No se aplicó nada a Supabase ni se modificó Productor.

Perfiles contrastados con catálogo: 12 de C2 y 16 de C3, incluidos cortes
verticales/horizontales. Guardas ante ciclos, referencias ausentes, ambigüedad
y descuentos ausentes. Un cero explícito no equivale a dato ausente.

## Barrido de facturas aportado por otra conversación

Fuente: copia verificada de EMP0016/Anterior, 180 facturas de 2026 entre
13/01 y 16/09, 28.480 líneas. No acredita documentos posteriores a esa fecha.

| Medición | Resultado y alcance |
|---|---|
| Líneas de estructura | 544 en 127 facturas; 543 códigos de catálogo y un `T` pendiente |
| Enlaces a albarán | 854 de 868 exactos por claves; 14 pendientes |
| Enlaces posteriores a presupuesto | 715; otros 139 no llegan a línea |
| Artículos en enlaces resueltos | Sin diferencias de código; no prueba diseño ni precio |
| Catálogo | 541 estructuras, 58 series, 2.134 asociaciones; 495 estructuras sin factura |
| Cerramientos | 42 cabeceras / 240 filas; 35 facturas con unión |
| Opciones de herraje | 5.524 filas técnicas |
| Información incompleta | 123 estructuras sin Conjunto1 resuelto; 73 con dibujo en factura |
| Modificaciones | 73 marcas de diseño específico; 32 líneas de estructura con precio/descuento manual |
| Validación del motor | Cero casos acreditados como calculables o contrastados en este banco |

Los 180 documentos indican tarifa 1; no demuestra precio constante ni vigencia
actual. Cinco cabeceras tienen IVA 0, 175 tienen 21; no corregir por suposición.
El despiece guardado sirve de resultado esperado, nunca de entrada al motor.

Scripts: `scripts/exportar-facturas-2026.ps1`,
`scripts/analizar-facturas-2026.mjs`, `scripts/lib/cobertura-facturas-2026.mjs`
y prueba contigua. Resultados privados: `output/facturas-2026/`.

Revisión pendiente del banco: exporta TipoOrigen/TipoDocOrig pero el analizador
no valida esos discriminadores al enlazar presupuesto por número. Revisar
también origen a nivel de línea frente a cabecera y diferencias Id/Numero.
No elevar los 715 enlaces a trazabilidad definitiva sin esa comprobación.
La reanudación del exportador controla hash de fuente y recuentos, pero no
hash de cada CSV ni versión de consulta: endurecer antes de reutilizar tablas
tras cambiar la extracción. Estos son límites detectados, no arreglos hechos.

## Plan para la siguiente conversación

| Paso | Trabajo | Entrega verificable |
|---|---|---|
| A. Fuentes | Reutilizar inventario; localizar variantes, archivos de configuración y rutas referenciadas; hashes y fecha de cada copia | Mapa fuente→versión→tablas→tema, distinguiendo inspeccionado de pendiente |
| B. Relaciones | Resolver tipos y claves de factura→albarán→presupuesto; explicar 14/139; buscar diseño/configuración en cada origen | Casos con procedencia inequívoca, ambigüedades explícitas y pruebas sintéticas |
| C. Catálogo integral | Investigar 541 estructuras, 58 series y asociaciones; campos FamiliaN/ConjuntoN, herencia, tipos de hoja, uniones y diseño | Matriz de combinaciones válidas/evidencia; ausencia de factura no significa incompatibilidad |
| D. Reglas completas | Cortes y descuentos/Dif, perfiles alternativos, cotas, herrajes/condiciones, vidrio D.A., juntas, junquillos, auxiliares, uniones, consumo, mano de obra y tarifas | Diccionario de reglas con tabla/campo/clave, unidades, precedencia, fórmula y contraejemplo |
| E. Extracción y motor | Comparar cada dato con esquema/ETL/core; importar lo ausente y reimplementar reglas comprobadas por módulos | Cambios acotados, pruebas por responsabilidad, sin reglas por coincidencia histórica |
| F. Contraste independiente | Reproducir casos recuperables de cada familia, serie y unión; separar diseños/precios manuales; comparar por etapas | Diferencias por material, cantidad, corte, consumo, coste y venta; no solo un total |
| G. Cobertura ausente | Casos controlados para combinaciones válidas no facturadas, medidas límite y opciones | Cobertura ampliada y límites pendientes; finalmente flujo, teclado, PDF y responsive |

No esperar a resolver todos los enlaces para calcular los casos con entradas
fiables. No detenerse tras inventariar: profundizar hasta obtener reglas
implementables y contrastes nuevos. Priorizar diversidad de familias y causas
de bloqueo, no repetir C2/C3 ni procesar miles de filas sin nueva información.
Los pasos son líneas de trabajo de investigación, no reemplazan las fases 0–8.

Cada hallazgo debe indicar fuente/hash, consulta o sección de manual, claves,
unidades, alcance, excepciones, grado de certeza y módulo destino. Agotar
fuentes legibles antes de afirmar que una regla solo está en el ejecutable.
Preferir observación autorizada y entrada/salida controlada al análisis nativo.

## Entorno, seguridad y verificación

- EMP0016/aluminio.mdb es activo: trabajar con copia verificada de Anterior;
  no reparar ni escribir originales. No consultar EMP0015 como tarifa vigente.
- EMP0017-copia.mdb quedó sin verificar por uso; no emplearla como evidencia.
  No reutilizar 260497, dañado. 260499 tiene total observado, falta desglose.
  Estos casos no bloquean la investigación de 0016 y sus bibliotecas.
- No tocar licencia ni registrar COM/OCX; no ejecutar legacy fuera del entorno
  aislado permitido por AGENTS. No copiar código o activos propietarios al producto.
- Sin push; sin escribir Supabase; no versionar `env.example`, datos reales,
  CSV, MDB ni secretos. Credenciales solo en memoria si son necesarias.
- Supabase devolvía tenant/user no encontrado; no es impedimento para investigar
  fuentes locales. No asumir que sigue fallando sin comprobar si fuera necesario.
- PostgreSQL QA localhost:55433, contenedor `aluminior_pg_test`, base
  `aluminior_real_test`, tmpfs. Comprobar antes de arrancar/recrear. Web QA :3002.
  No repetir ETL completo: vacía documentos. Para las dos tablas nuevas usar
  `npm run etl:cortes:local -- --origen export_datos/EMP0016 --base aluminior_real_test`
  únicamente si la base y la migración ya están verificadas y hace falta cargar.
- Scripts exploratorios previos bajo `output/` pueden cargar .env: leer antes
  de ejecutar. `output/investigacion-fuentes/consultar.ps1` limita a SELECT
  sobre copias locales con Mode=Read. No volcar datos de clientes al chat.
- Verificación de cortes documentada: core 505 antes de última guarda y 31
  dirigidas después; ETL transformación/integración/rollback; web 41 dirigidas;
  typecheck y arquitectura pasan. Otra conversación comunica core 506 y nuevas
  pruebas de cobertura, typecheck/arquitectura; suite completa db/web no arrancó
  por acceso denegado. No confundir ese fallo de entorno con fallo de cálculo,
  ni afirmar suite completa verde. Resolver entorno al necesitar esas pruebas.

Cerrar cada avance actualizando el estado, el mapa de fases y el informe
técnico correspondiente. Publicar solo agregados y pruebas sintéticas;
mantener casos reales y resultados identificables en output ignorado.

## Mensaje para iniciar la próxima conversación

«Lee y ejecuta docs/paridad/INICIO-SIGUIENTE-CONVERSACION.md. Continúa desde el
barrido de facturas existente y extrae el máximo de reglas y datos verificables
de C:\Productor\Aluminio. Investiga las fuentes locales antes de pedirme datos;
avanza en reconstrucción de entradas, cobertura integral e implementación
cuando exista evidencia suficiente. Conserva los cambios locales y todas las
restricciones. No declares paridad por un inventario o un total coincidente.»

## Avance del 27/09/2026 (tarde): motor de catálogo completo

Ver [fase-7/06](fase-7/06-reglas-catalogo-despiece-completo.md). Asociados,
cortes con división de huecos, vidrio 2D, junquillos, MO por módulos e importe
por fila derivados del catálogo. Contraste versionado
(`scripts/contrastar-despiece-facturas.ts`): 348 líneas no específicas →
178 exactas al céntimo, 138 con piezas idénticas (diferencia solo de tarifa),
23 bloqueadas, 9 distintas. Vía web (PostgreSQL) = CSV en 327/327.

Código: `core/despiece/{asociaciones,linea-catalogo}`, `medidas-plantilla`,
`acristalamiento-catalogo`, `mano-obra-fabricacion`, `precios/importe-fila`;
migración aditiva 0023 + `npm run etl:catalogo-despiece:local`; web
`_lib/estructuras/catalogo-despiece/` conectado en `valorarEstructura` y
cerramientos (snapshot `FILA_CENTIMOS`). 0023 NO aplicada en Supabase.

Pendiente: tabla de acristalamiento automática (ELEGANTPVC GM60), cotas de
instancia (FI/TD/F), divisiones B3/TMG (3HO), diseños específicos (73),
compactos/mosquiteras/tapajuntas, marco −53 en 6 C2, catálogo visual del
configurador (C2 no dibujable), verificación en navegador y suite completa.
