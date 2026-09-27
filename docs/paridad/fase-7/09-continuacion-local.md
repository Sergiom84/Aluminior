# Continuación local del motor de catálogo

27/09/2026. Rama `feat/motor-catalogo-completo`, base recibida `0ecdc9c`.
Trabajo en `C:\Users\sergi\Desktop\Aplicaciones\Aluminior`. July consultado;
el relevo y los resultados ejecutados prevalecen sobre sus notas antiguas.

## Contrato y alcance

Continuar la implementación del motor a partir del catálogo copiado y
contrastar con documentos como oráculo independiente. Ninguna fila del
despiece histórico entra como material del motor. Cambios locales de core,
adaptador web, pruebas y herramientas reproducibles. Sin modificar `main`,
Supabase, migraciones ni originales de Productor. CSV, MDB, datos de clientes
y artefactos de `output/` permanecen fuera de Git.

## Cambios terminados

- [GM60](07-acristalamiento-gm60.md): ya tenía 19 filas persistidas; su selección
  coincide en 127/127 líneas con acristalamiento. Se corrige el pendiente
  erróneo de generar un algoritmo nuevo. El core ahora rechaza grosores
  inválidos y selecciones empatadas incompatibles.
- [Tres hojas](08-cortes-tres-hojas.md): descuento de extremos TMG/MV y batiente
  B para el módulo HP/2HA1O; mano de obra del grupo TMG por cantidad de elemento.
  Fórmulas, descuentos y tiempos proceden del catálogo. Cinco líneas antes
  bloqueadas generan ahora todo su material y mano de obra.
- Opciones de acristalamiento: el adaptador del motor nuevo ignoraba la opción
  elegida y leía siempre la principal. Ahora consulta la opción 1–5 validada
  por el caso de uso. Una alternativa sin filas deja precio nulo. La opción 1
  mantiene la compatibilidad con catálogos anteriores a la carga de opciones.
- Contraste: compara ambos ejes del vidrio y multiplicidad; empareja precios
  por pieza sin sobrescribir precios de otras medidas del mismo artículo.
  La falta de precio o su ambigüedad no se etiqueta como diferencia de tarifa.
  Igualdad al céntimo exige el mismo entero de céntimos, y las horas manuales
  conservan los minutos fraccionarios al convertirlas.
- La prueba de integración usa `QA-MO` como artículo de su fixture, para no
  colisionar con `MO` que utilizan otras suites. Se mantienen las aserciones
  económicas y de detalle; no se serializa ni relaja la batería.

## Contraste global reproducido

Sobre las mismas 348 líneas no específicas con configuración de serie:

| Estado | Resultado |
|---|---:|
| Piezas coincidentes e importe exacto al céntimo | 179 |
| Piezas coincidentes; importe coincide al aplicar precios unitarios de factura | 117 |
| Piezas coincidentes; diferencia económica aún no atribuida con certeza | 25 |
| Bloqueadas por dato o regla pendiente | 18 |
| Despiece distinto | 9 |

Las 73 líneas con diseño específico siguen fuera. Extras manuales,
compactos, mosquiteras, tapajuntas y avisos se separan según el contrato del
comparador: estas cifras no certifican el importe comercial completo de la
factura ni aptitud para fabricar. Las dimensiones se comparan a 0,1 mm.

La reproducción **previa** del código recibido dio 178 exactas, 115 de tarifa,
23 de importe pendiente, 23 bloqueadas y 9 diferentes. Por tanto, las 138
líneas del mensaje anterior no estaban todas acreditadas como diferencia de
tarifa. Con el comparador endurecido, antes del cambio de 3HO, eran 113 de
tarifa y 25 de importe pendiente. La corrección de 3HO añade una exacta y
cuatro de tarifa, y reduce cinco bloqueos.

En PostgreSQL local, `valorarEstructura` coincide con el motor CSV en **310
importes** y **16 bloqueos**; otra entrada sin plantilla es rechazada por la
web y queda sin importe en CSV. Cero discrepancias económicas entre ambas
vías. Se excluyen 21 líneas con horas adicionales manuales: no forman parte
de la entrada de ese caso de uso. Coincidir en un bloqueo no es valorar.

## Reproducción y entorno

Las copias originales están en
`C:\Users\sergi\Desktop\MIX\Productor\Aluminio`; los años anteriores en
`Base datos Anuales`, y EMP0016 corresponde a 2026. No se ejecutó el programa
legacy ni se abrió su MDB activa. Esta unidad reutiliza CSV existentes; las
fuentes y hashes de los nuevos contrastes están en 07 y 08.

Se levantó el PostgreSQL efímero `aluminior_pg_test`, enlazado solo a
`127.0.0.1:55433`. La base vacía `aluminior_real_test` recibió las migraciones
hasta 0023 y el catálogo mediante el script local ya copiado; después, las
dos cargas suplementarias. No reutilizar el importador completo sobre una
base con documentos: vacía el destino. La base de la suite es distinta,
`aluminior_test`; ETL destructivo tiene `aluminior_etl_test`.

Comandos de los contrastes, desde la raíz:

```powershell
npx tsx scripts/verificar-acristalamiento-gm60.ts
node --import tsx scripts/contrastar-cortes-tres-hojas.mjs export_datos/EMP0016 output/facturas-2026
npx tsx scripts/contrastar-despiece-facturas.ts export_datos/EMP0016 output/facturas-2026 output/contraste-final-20260927
npx tsx scripts/verificar-motor-catalogo-db.ts output/facturas-2026 output/contraste-final-20260927/detalle.json aluminior_real_test
```

Para recargar solo los suplementos, con migraciones verificadas y base local:

```powershell
npx tsx packages/etl/src/cargar-cortes-local.ts --origen=export_datos/EMP0016 --base=aluminior_real_test
npx tsx packages/etl/src/cargar-catalogo-despiece-local.ts --origen=export_datos/EMP0016 --base=aluminior_real_test
```

La forma `--opcion=valor` evita la pérdida de argumentos observada con el
envoltorio npm/PowerShell de este equipo. `npm ci` restauró las dependencias
del lockfile, incluida PGlite, sin cambiarlo. No se usan variables remotas.

## Verificación

`npm test` completo: **1310 pruebas aprobadas**, ninguna omitida: core 567,
DB 55, ETL 27 y web 661. Se activó la comprobación opcional con CSV locales
mediante `EDITOR_CSV_PRUEBA`; no se fijó globalmente `TEST_DATABASE_URL`,
pues la prueba de carga de tarifas necesita su propia base destructiva.
La primera ejecución simultánea con build agotó los 5 segundos de un test
J04; la repetición aislada pasó sin modificar tiempos, aserciones ni pruebas.

Scripts: 12 pruebas Vitest y 35 de `node:test` aprobadas. Se ejecutan con sus
respectivos runners; lanzar todos los scripts con Vitest no recoge las suites
de `node:test`. Typecheck de todos los paquetes, arquitectura y build web
aprobados. Logs finales en `output/`, ignorado; el build final usa solo la URL
local. Se repitió tras congelar el código porque una prueba causal del ejecutor
coincidió con la primera compilación; el segundo build ya usa el árbol final.

Pruebas causales ejecutadas: 8 fallos al retirar las guardas GM60, 9 al
retirar cortes/MO, 5 con el comparador anterior y 2 antes de respetar la opción
de acristalamiento. Revisiones independientes de core, adaptador y scripts
sin hallazgos pendientes. Se repitieron sus pruebas y contrastes, no se tomó
el informe del autor como verificación.

## Siguiente trabajo

- **Ahora:** incorporar cotas FI/TD/F desde entradas con procedencia inequívoca.
  Se localizaron seis de ocho casos por `VMedidasDA` → `EstructurasDA`; otros
  dos necesitan reconstruir origen. Investigar 25 diferencias económicas y
  9 despieces distintos. Completar catálogo visual C2 y prueba en navegador.
- **Después:** diseños específicos, compactos, mosquiteras, tapajuntas,
  variantes B3/4HE/4HC y aceptación completa del taller.
- **Experimental:** regeneración editable de tablas de acristalamiento y
  modalidades aún sin evidencia. No confundirla con seleccionar GM60.

La integración en `main`, publicación y cambios remotos requieren autorización.
No se ha realizado recorrido visual nuevo: este lote cambia cálculo y su
adaptador, sin modificar pantallas, estilos, atajos ni disposición.
