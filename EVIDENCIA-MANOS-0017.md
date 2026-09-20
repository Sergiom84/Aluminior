# Evidencia B1: manos y manillas (19/09/2026)

> Revisión documental 20/09/2026: **Evidencia fechada**. Sustenta B1; vistas/aperturas no observadas siguen abiertas.
> Para continuar: [estado actual](docs/ESTADO-ACTUAL.md). Este registro no activa trabajo ni permisos de sesiones anteriores.

## Fuente y condiciones
Observación directa del responsable en Productor abierto, empresa visible
PRUEBAS ALUMINIOR - 2026 [0017], sesión continuada por el usuario.
Consulta de fichas y Diseño V3, salida por X del título sin Aceptar ni guardar.
Capturas locales ignoradas: output/evidencia-manos-20260919/.
La descripción se refiere a la vista predeterminada mostrada, no a perspectiva
interior/exterior de cámara, que no ha quedado establecida.

| Caso | Medida Productor | Bisagras | Manilla | Apertura visible |
| --- | --- | --- | --- | --- |
| 1OD | 800 x 1200 | derecha | izquierda | oscilo |
| 1OI | 800 x 1200 | izquierda | derecha | oscilo |
| 2 | 1200 x 1200 | extremos exteriores de ambas hojas | una, hoja derecha al encuentro | ambas abatibles |
| 2O | 1200 x 1200 | extremos exteriores de ambas hojas | una, hoja derecha al encuentro | izquierda abatible, derecha oscilo |
| 1OFI | 900 x 1500 | izquierda | derecha | oscilo sobre fijo inferior |
| 2O+ FIJO | 1200 x 1200 | extremos exteriores de ambas hojas | una, hoja derecha al encuentro | izquierda abatible, derecha oscilo; fijo inferior |
| 1O1FL | 1200 x 1200 | derecha de la hoja | izquierda de la hoja | hoja oscilo a la izquierda del fijo |

## Literales y trazabilidad
- 1OD/1OI: fichas MANO DERECHA/IZQUIERDA; árbol Hoja (1 H.Oscilo. Dchas.)
  / Hoja (1 H.Oscilo. Izdas.). Capturas 1OD-ficha/diseno,1OI-ficha/diseno.
- 2: dos Hoja (2 H.Abat.) bajo Sep. Hojas (Trav. Invisible), Hueco intermedio.
  Capturas02-pareja-general,02-hoja-primera,02-hoja-primera-avanzada:
  el prefijo02 del archivo no es el código de estructura, que es2.
- 2O: dos Hoja (2 H.Dcha.Oscilo.), misma organización del árbol. Capturas
  2O-ficha/diseno. Triángulo adicional de oscilo solo en hoja derecha.
- 1OFI: Hoja (1 H.Oscilo. Izdas.) sobre fijo; capturas1OFI-ficha/diseno/cota.
- 2O+ FIJO: dos Hoja (2 H.Dcha.Oscilo.) sobre fijo;2O-FIJO-ficha/diseno/cota.
- 1O1FL: Hoja (1 H.Oscilo. Dchas.), fijo a su derecha;1O1FL-ficha/diseno/cota.
Los triángulos laterales tienen su vértice en el lado opuesto a bisagras.

En2, seleccionar primera hoja ilumina izquierda; Principal muestra Apertura
Interior y Avanzada Tipo de Apertura1+1. No se deduce cámara interior ni se
extrapola apertura Exterior. Manilla visible no demuestra las reglas completas
de hoja activa o herraje del despiece.
CHM worddocuments_configuracindefijosdecorredera1.htm (§5.1.2.2.1.1.2.3)
documenta Interior/Exterior, Tipo Apertura y numeración izquierda a derecha,
pero no define explícitamente perspectiva. No convertir esa hipótesis en regla.

## Decisión de implementación
Sufijo de AperturaVisual expresará lado físico de bisagra en la vista dibujada.
Corregir los siete casos observados con geometría común web/PDF y manilla por
hueco. Las otras siete plantillas conservan físico previo; no se certifican.
Generador experimental mantiene reservas, no se activan estructuras.

Las configuraciones v1 guardan código/medidas, no árbol visual. Se corrige su
representación al reconstruir, sin migraciones ni escritura ni revisión de
importes. No versionar el dibujo erróneo ni reescribir PDF emitidos.

Medidas/proporciones/cotas permanecen fuera de B1, incluidas discrepancias en
1OFI,1O1FL,2O+ FIJO y la previa1O2FL. Consultar EVIDENCIA-COTAS-0017.md.
No es certificación de despiece, herrajes, precio o uso real completo.
