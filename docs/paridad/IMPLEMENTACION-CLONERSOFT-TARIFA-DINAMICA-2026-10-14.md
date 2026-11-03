# Tarifa dinámica: selección de registro, sin activación

14/10/2026. Unidad local del [encargo ClonerSoft](ENCARGO-IMPLEMENTACION-CLONERSOFT-2026-10-13.md).
Estado y orden en el [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
La selección de un registro no acredita un precio, tarifa activa ni aceptación Productor.

## Contrato fijado antes de implementar

- **Resultado exacto:** seleccionar un registro mediante las cuatro búsquedas estáticas demostradas; conservar ausencia, ambigüedad e invalidez explícitas.
- **Destinatario y motivo:** motor de precios; preparar una pieza independiente mientras el cargo monetario E1 permanece sin contrato completo.
- **Éxito medible:** precedencia de las cuatro búsquedas, fronteras inclusivas, decimales exactos, claves, ausencia, empate y no mutación comprobados con datos sintéticos; tipos, arquitectura y revisión independiente.
- **Alcance autorizado:** función pura en `core/precios/tarifa-dinamica/`, pruebas contiguas y exportación pública. Contexto y grupo aplicable llegan explícitos; catálogo completo por clave, sin preseleccionar el registro ganador.
- **Fuera de alcance:** activación global/cliente/artículo, resolución de grupo, precios, descuentos, incrementos, fórmulas, redondeo comercial, adaptadores, UI y persistencia.
- **Ficheros o sistemas protegidos:** preparación física E1, cálculo ordinario y dimensional, WIP, originales, G6, datos comerciales y migraciones históricas.
- **Comprobaciones obligatorias:** pruebas focales y de paquetes, tipos, arquitectura, revisión independiente y diff sin datos privados.
- **Acciones que requieren autorización:** ejecución Productor, cambios de datos reales, operaciones remotas y publicación/despliegue; ninguna necesaria para esta unidad.

## Fuente y mapa de evidencia

Se reutiliza `output/clonersoft-20261013/coste-tarifa.md:44–57` y sus
artefactos privados, sin nuevas extracciones ni mezcla con el export de datos.
Fuente: `gaProductorBLLestructuras.dll`, SHA-256
`71033e88beb210d575fae9969edf0543fabc2ac839e60e5f789c0880eaa67f8f`,
MVID `8b553fe1-3736-453a-b409-ecd0326c1546`.
Selector `getPrecioParaGrupo`, token `0x0600068c`, cuerpo de 591 instrucciones,
2.426 bytes, offset 153.680, SHA-256 IL
`212a4e6ca922eb9e995734775c496c708a739ee1623be7a6e6199187a6a324bf`.
Evidencia REA de origen
`ev_79920f09d39f5897ac2db1ba3645e196c9ee1b22a566acd401d6d4effe4803ef`.
No se incorpora código, CIL o recursos propietarios a Git.

| Búsqueda | Comportamiento demostrado | Coordenada privada |
|---|---|---|
| 1 | Cliente/grupo/tipo/tamaño exactos y tramo inclusivo de metraje | IL 630/635 |
| 2 | Mismas claves y tamaño exacto, ambos límites cero | IL 654–1241 |
| 3 | Cliente/grupo/tipo exactos, tamaño `*` y tramo inclusivo | IL 1249–1267 y 1285–1844 |
| 4 | Mismas claves, tamaño `*`, ambos límites cero | IL 1865–2412 |

Cada búsqueda ocurre cuando la anterior no encontró registro. En metraje cero,
un tramo 0/0 también satisface la primera búsqueda inclusiva: no se elimina
artificialmente de esa etapa. No hay normalización de claves demostrada.

El original toma la primera fila; no hay desempate fiable para solapamientos.
Es decisión de contención de Aluminior bloquear varias candidatas en la etapa
ganadora, sin caer a una etapa inferior. También se bloquean entradas inválidas,
intervalos invertidos e identidades repetidas en el subconjunto relevante.
Las filas de otras claves/tamaños no participan. Ningún dato ausente se convierte
en un precio cero: esta función ni recibe ni calcula precio.

## Aceptación

Cuatro precedencias y sus caídas; extremos inferior/superior y fracciones
decimales más precisas que coma flotante; 0/0 y metraje cero; igualdad exacta
de claves; ausencia; duplicados y solapamientos en etapa ganadora; datos
inválidos; independencia del orden cuando existe un ganador único; repetición,
entradas congeladas y copia de salida. Pruebas sintéticas, sin datos comerciales.

## Implementación y evidencia ejecutada

`seleccionarRegistroTarifaDinamica`, tipos y pruebas contiguas viven en
`packages/core/src/precios/tarifa-dinamica/`; entrada pública
`@aluminior/core/precios`. Reutiliza comparación decimal exacta, sin introducir
redondeo. La salida copia únicamente criterios, aunque un registro recibido
incluya campos económicos adicionales.

Gate del arquitecto: `npm run test:ci`, 2.004 pruebas correctas y una omisión
previa por CSV privado: 964 core, 56 DB, 112 ETL, 872 web. De ellas, 47 nuevas
de esta unidad. `npm run typecheck` correcto; arquitectura: 859 archivos,
414 módulos y cero infracciones. El primer intento encontró PostgreSQL local
detenido; se arrancó el contenedor de pruebas y se repitió el gate completo,
sin cambiar tests ni destinos. No se preparó/aplicó migración de producto.

Revisión independiente descontaminada, una ronda sin corrección necesaria:
47 focales, tipos core y oráculo BigInt propio con 12.000 catálogos sintéticos,
60.128 comprobaciones. El arquitecto reprodujo ese oráculo y la sensibilidad
en copias privadas: base 47/47; invertir precedencia produce ocho fallos;
excluir extremos produce cinco. Es sensibilidad medida, sin atribuir un bug
previo ni cobertura exhaustiva. Los originales compartidos permanecen intactos.

Logs, manifest y reproducción:
`output/clonersoft-implementacion-20261013/tarifa-dinamica-20261014/`,
`aluminior-clonersoft-20261014-gate-final.log`, `aluminior-clonersoft-20261014-tipos.log`
y `revision-20261014.md` en la misma raíz privada. Los documentos públicos
conservan el contrato y el resultado; esos artefactos ignorados no viajan por Git.

Unidad especificada, implementada y verificada localmente; aceptación de tarifa
activa Productor, publicación Git, recepción en otros equipos y despliegue
pendientes por separado. No cambia ningún recorrido UI, presupuesto o fabricación.
Coste de mantenimiento: una función pura, tipos y entrada pública, sin nueva
infraestructura ni dependencia de runtime. Rentabilidad económica no cuantificada
sin tarifa de desarrollo y uso operativo del adaptador; el riesgo permanece
en activar reglas que todavía carecen de contrato.

## Límites y continuidad

Las diez tablas TarDin vacías de la copia y los flags cero del export anterior
son fuentes distintas. No aportan un caso positivo de tarifa activa.
La unidad no resuelve el grupo aplicable ni autoriza a activar el motor.
El siguiente trabajo de tarifa dinámica exige grupo, habilitación, fórmula,
redondeo y caso positivo verificable; E1 conserva la prioridad del roadmap.
