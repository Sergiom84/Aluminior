# E1: contrato físico y selección condicional

13/10/2026. Entrega local parcial del [encargo ClonerSoft](ENCARGO-IMPLEMENTACION-CLONERSOFT-2026-10-13.md).
La identidad y el estado global siguen en [E1 del roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
El cargo de cabecera continúa abierto. Este contrato no acredita fabricación,
aceptación Productor, publicación ni producción.

## Base y contrato

La integración Windows–Mac quedó cerrada localmente en `fa32fba`, con padres
`913dd43` y `97099bc`. Preserva el main posterior y las ampliaciones compatibles.
Se retomó la autorización directa de Sergio conservada en el chat de integración,
interrumpido; no se resolvió en paralelo a otro ejecutor de esa tarea.
Índice y archivos iniciales se conservaron en una copia privada fuera del barrido
de pruebas. Los originales Productor y los datos comerciales permanecen intactos.

- **Resultado exacto:** preparar grupos físicos de detalles seleccionados y
  resolver una regla condicional demostrada, en funciones puras independientes.
- **Destinatario y motivo:** motor del taller; separar identidad, metraje y cortes
  antes de integrar una repercusión económica.
- **Entrada:** origen de línea/detalle, artículo, acabado, tonalidad, metraje del
  detalle, cantidades, corte y largos explícitos; contexto y reglas condicionales.
- **Salida:** grupos completos o bloqueo; selección identificada, inactiva,
  sin coincidencia, inválida o ambigua. Sin importes ni escrituras.
- **Aceptación:** los casos discriminantes siguientes y ausencia de mutación;
  pruebas del núcleo, tipos, arquitectura y revisión independiente.
- **Protegidos:** otros módulos, snapshots, cargos, banco histórico, G6, originales,
  credenciales, migraciones históricas y datos reales.
- **Límites:** no adaptar producción/presupuestos, no expandir acabados dependientes,
  no elegir proveedor/coste, no calcular precio ni reparto monetario.

## Fuentes y decisiones propias

La [extracción diferencial](EXTRACCION-DIFERENCIAL-CLONERSOFT-2026-10-13.md)
y `output/clonersoft-20261013/fuentes/RESUMEN-REDACTADO.md:69–79` acreditan
agrupación artículo/acabado/tonalidad, metraje × cantidad principal, cantidades
de cortes y largo de artículo distinto de cero o estándar cuando es cero.
La selección estática ordena prioridades de mayor a menor y toma la primera
regla coincidente. Los filtros estructura/familia/serie son conjuntivos;
listas `;`, minúsculas y pertenencia exacta, sin recortar espacios. La familia
ausente incumple solo cuando se filtra por familia.

La coordenada privada de selección es `GetAcabadosDespunte` `0x06000191`,
con selector de prioridad `0x06001078`. Su artefacto existente se reutiliza;
no se incorpora código, CIL, binarios ni recursos propietarios al repositorio.

Son decisiones técnicas de contención de Aluminior: bloquear empates en la
prioridad ganadora, orígenes duplicados, largos incompatibles dentro del grupo,
identidades ausentes, cantidades fraccionarias/no finitas, productos de
cantidades fuera de Int32 y
datos físicos insuficientes. No se atribuyen esos bloqueos al original.
La conversión fraccionaria de `Convert.ToInt32` queda fuera de este lote.
El metraje explícito cero conserva su significado; ausencia no se vuelve cero.
La activación condicional ausente conserva el defecto falso; su estado inactivo
no afirma que el despunte global esté desactivado.

## Casos de aceptación fijados antes de construir

| Entrada sintética | Resultado esperado |
|---|---|
| Mismo artículo/acabado, distinta tonalidad | Dos grupos |
| Mismo artículo/tonalidad, distinto acabado | Dos grupos |
| Metraje detalle 2,4; principal 3; detalle 2 | 7,2 m y seis cortes; no multiplicar otra vez por detalle |
| Metrajes 2,4 × 3 y 1,1 × 2, mismo grupo | 9,4 m |
| Largo artículo 6400; estándar 6000 | 6400 mm |
| Largo artículo 0; estándar 6000 | 6000 mm |
| Largo artículo 0 y estándar ausente | Bloqueo |
| Origen repetido, metraje ausente o no finito | Bloqueo, sin grupos parciales completos |
| Estructuras E1;E2, familia F1, serie S1; entrada e2/f1/s1 | Coincide |
| Misma entrada, serie S2 | No coincide |
| Estructuras E1; E2; entrada E2 | No coincide con el término que conserva espacio |
| Sin restricciones y familia ausente | Coincide |
| Filtro de familia F1 y familia ausente | No coincide |
| Reglas coincidentes, prioridades 2 y 9 | Regla 9 |
| Empate en la prioridad ganadora | Ambiguo, no elegir por orden del array |
| Sin coincidencia | Lista vacía identificada como ausencia de regla |
| Configuración de acabados de regla ausente/vacía | Bloqueo |
| Repetir entradas sin modificarlas | Misma salida, sin acumulación ni mutación |

## Verificación de la base integrada

`npm run test:ci`: 1.890 correctas y una omisión previa condicionada al CSV
privado (850 core, 56 DB, 112 ETL y 872 web). Tipos de paquetes, E2E y scripts
correctos. Arquitectura: 851 archivos, cero infracciones. Scripts: 123 Vitest
y 119 node:test correctos. Diez recorridos E2E correctos, escritorio 1440×900
y móvil 390×844: alta, copia, decimales, PDF y teclado.

Revisión independiente: dos fallos de cotas, una corrección y gate determinista.
Medición antes del arreglo: dos fallos de fixture incompleta, quince del adaptador
CSV con fixture explícita y dos de cotas. No se debilitaron aserciones.
Logs privados en `output/clonersoft-implementacion-20261013/`.
`packages/db` no cambia respecto de la base; ninguna migración nueva o remota.

## Implementación y gate local E1

`prepararDespunteCatalogo` y `seleccionarDespunteCondicional` viven en
`packages/core/src/produccion/despunte-catalogo/`, con pruebas contiguas y
exportación pública desde `@aluminior/core/produccion`. El metraje entra/sale
como texto decimal, usando la aritmética pura ya existente y conservando toda
la escala; no se convierte a coma flotante ni se fija a céntimos.

Gate ejecutado por el arquitecto: `npm run test:ci`, 1.957 correctas y una
omisión previa por CSV privado: 917 core, 56 DB, 112 ETL, 872 web.
Son 67 pruebas nuevas E1. `npm run typecheck` correcto y arquitectura:
855 archivos, 411 módulos, cero infracciones. Los recorridos E2E 10/10 y
los 242 tests de scripts pertenecen al cierre inmediatamente anterior de
la integración; E1 no modifica web, DB, scripts o interacción.

Revisión descontaminada: artefacto, contrato y evidencia; 20 comprobaciones
puras independientes correctas, sin defecto funcional reproducido. Se reforzó
la aserción de conservación de ambos pares línea/detalle, sin cambiar el código
ni reducir la cobertura. Una ronda, una corrección de la prueba y gate focal.
Logs privados: `output/clonersoft-implementacion-20261013/`.

El lote cierra solamente este contrato puro. No hubo recorrido humano nuevo
en Productor ni pantalla nueva para E1; su aceptación integral permanece
pendiente. No se preparó/aplicó migración, cargó dato comercial o desplegó.

Coste del lote: dos funciones pequeñas, cuatro archivos más dos exports,
sin migración ni mantenimiento de infraestructura adicional. La validación
incluye 67 casos nuevos y gates/revisión descritos. No se estima importe total
en euros o rentabilidad sin tarifa de desarrollo y sin uso operativo del adaptador;
el riesgo económico sigue concentrado en el llamador aún sin demostrar.

## Continuidad económica

No repetir A–F/G1–G5, C1, M0, cargas, A3/A4 ni la integración ya cerrada.
G6-incidencia y su autorización de modificación permanecen protegidos.
Los snapshots actuales carecen de tonalidad y metraje valorado explícitos;
la función nueva necesita un contrato de adaptador antes de conectarse.
La repetición de la función pura no prueba persistencia del cargo.

El siguiente paso E1 es localizar el controlador que acepta «Repartir entre
las líneas»: qué filas selecciona, qué base usa, cómo intervienen descuentos
y cantidades y dónde retira el cargo anterior, redondea y persiste.
Mientras falte ese enlace, no activar el cargo ni certificar ausencia de
doble cómputo entre GRUPO, componentes y detalles comerciales.

### Investigación dirigida de esta entrega

Se reutilizaron 30 inventarios y 137.441 aristas de llamadas, sin encontrar
un llamador externo de `CalculaDespunte` dentro de ese corpus. Es una ausencia
acotada, no prueba de que el programa carezca de llamador.
Se verificó el helper general de redondeos con escalas separadas de precio,
línea e importe total. Falta el enlace con E1: no fija su política de redondeo.

El candidato nativo `aluminioApp.exe`, SHA-256
`f7c49752d6c00e61d7a0f56dd4c0347a79b8da1bec26a020321d3ca353e3809b`,
conservó su huella antes/después. Sus literales UTF-16 localizan
`VPresupDespunte.cmAceptar_Click` en offset de archivo 3.599.072 y
`VPresupDespunte.FinalCalculo` en 3.599.008. Son nombres candidatos, no
referencias de llamada ni funciones analizadas. La búsqueda dirigida REA quedó
esperando el análisis automático inicial de Ghidra y se canceló al alcanzar
el límite de la unidad. Sesión cerrada: `open:false`, `analysis_run:null`.
No se ejecutó Productor, instaló proveedor ni modificó G6.

Siguiente estático exacto: referencias del handler `cmAceptar_Click` y
`FinalCalculo`, con una sesión de análisis acotada preparada antes de depender
de sus resultados. No repetir los inventarios ni la búsqueda general.
