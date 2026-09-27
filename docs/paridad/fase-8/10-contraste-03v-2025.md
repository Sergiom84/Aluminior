# 03V: despiece y valoración de la fuente anual 2025

27/09/2026. Unidad del [contrato 09](09-contrato-03v-tmp.md). Evidencia nueva
desde `b5dc16a`; no repite la habilitación visual de las 25 plantillas.

## Fuente y entradas

Se reextraen las tablas necesarias de la copia verificada de
`Base datos Anuales/EMP0015/aluminio.mdb`. Lectura Jackcess en modo read-only,
sin ejecutar Productor. SHA-256 de la copia, comprobado antes y después:
`30b70d2bcbad66f42e25184595858737c79b45bdadd8ff539552c35994851b47`.

La extracción incorpora cabeceras mínimas, opciones guardadas y cotas de
instancia que no contenía la primera auditoría. Se exige unicidad de
cabecera/configuración y clave documental completa. La tarifa procede de
la cabecera o de una excepción de línea explícita; los tres casos emplean
tarifa 1 de esta fuente. Los originales sirven de oráculo después del
cálculo, nunca para completar parámetros del motor.

EMP0015 es el ejercicio nominal **2025**. Uno de los tres documentos tiene
fecha de **2024**, que se conserva. El catálogo exportado EMP0016, las dos
bases anuales de 2026 y la copia posterior que respaldó C2P son fuentes
distintas; no se usan sus precios para corregir este contraste.

## Mapa de evidencia y cierres posibles

| Ámbito | Resultado ejecutado antes del cambio | Qué acredita |
|---|---|---|
| Tres 03V estándar: dos GMA350 y uno GMA65OPT | 105 filas materiales sin MO coincidentes en artículo, cantidad, multiplicidad y dimensiones | Despiece material de esos tres casos |
| Mano de obra original | 00114=20; multiconjunto positivo 20,20,25,30 | Selección y agregación TMP para esas entradas |
| Motor previo | Tres importes nulos, con bloqueo 00010/00114 | La regla MO impide terminar el cálculo |
| Contrafactual TMP, calculado desde catálogo | Tres multiconjuntos y despieces completos coincidentes | Candidato para la unidad mínima; no sustituye la ejecución del motor final |
| Valoración con PVP de la misma base | Dos coincidencias; una diferencia localizada en el precio de tres vidrios | Dos contrastes exactos; el tercero conserva diferencia histórica de precio |
| Revaloración diagnóstica con el precio guardado en el tercer documento | Coincidencia | Atribución de la diferencia al precio unitario, sin modificar ninguna tarifa |
| Otros ocho 03V del corpus anual | Diseños específicos excluidos | Ninguna ampliación de cobertura |

El tercer documento conserva un precio de vidrio diferente del PVP de la
base anual. No es un error acreditado ni se sustituye por el de 2026. La
comparación con su precio guardado es solo diagnóstico: no alimenta la
valoración del motor y no certifica descuento, margen, impuestos o total
comercial completo del presupuesto.

Se cierra la ausencia de originales estándar **solo para 03V/GMA350 y
03V/GMA65OPT**, y el contraste material de los tres casos. Permanecen
abiertos 03H, 06, CFT/TFF, otras series y diseños específicos. Las versiones
Anterior reproducen documentos compartidos; no multiplican la muestra.

## Frontera de implementación

El algoritmo TMP/16 recibe los metadatos explícitos de concepto y serie,
selecciona categoría A→00001 / C→00002 y agrega por concepto. Sus controles
de regresión son 79 registros de EMP0016 y 90 de EMP0015, además de los tres
03V; no constituyen ese número de observaciones comerciales independientes.

El compositor limita su activación nueva a 03V, las dos series acreditadas
y diseño estándar explícito. Contrastar minutos en otros modelos no abre
automáticamente sus precios. 03H/06 y TFF conservan sus bloqueos.

La base importada y el consumidor web no conservan todavía todos los
metadatos necesarios. Este lote no los adivina ni modifica migraciones:
la activación web queda pendiente de una unidad de persistencia y carga
con procedencia, pruebas de adaptador y recorrido local.

## Evidencia privada

`output/fase-8/lote4-03v/` conserva la extracción, manifest de hashes,
entradas, originales y resultados por clave documental. `baseline.json`
y `baseline-resumen.json` conservan la ejecución anterior al cambio.
La ejecución final y los gates se enlazan en el siguiente relevo.

Los scripts versionables contienen lógica de lectura y contraste, nunca
filas empresariales. Los CSV, identificadores, medidas e importes detallados
permanecen fuera de Git. No se acredita fabricación.
