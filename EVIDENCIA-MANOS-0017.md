# Evidencia B1: manos y manillas (19/09/2026)

Base a77abc3 en feat/cerramientos-editor-linea. Observación directa del responsable,
Productor abierto en PRUEBAS ALUMINIOR - 2026 [0017], sesión continuada por el usuario.
Consulta de fichas y Diseño V3; salida por X del título, sin Aceptar ni guardar.
Capturas locales ignoradas: output/evidencia-manos-20260919/.

| Caso | Medida inicial | Bisagras en pantalla | Manilla en pantalla | Apertura visible |
| --- | --- | --- | --- | --- |
| 1OD | 800 x 1200 | derecha | izquierda | oscilobatiente |
| 1OI | 800 x 1200 | izquierda | derecha | oscilobatiente |
| 2 | 1200 x 1200 | extremos exteriores de ambas hojas | una, hoja derecha junto al encuentro | ambas abatibles |
| 2O | 1200 x 1200 | extremos exteriores de ambas hojas | una, hoja derecha junto al encuentro | izquierda abatible, derecha oscilobatiente |

Fichas 1OD/1OI dicen MANO DERECHA/IZQUIERDA respectivamente. Árbol:
Hoja (1 H.Oscilo. Dchas.) / Hoja (1 H.Oscilo. Izdas.).
2: dos Hoja (2 H.Abat.) bajo Sep. Hojas (Trav. Invisible), con Hueco intermedio.
2O: dos Hoja (2 H.Dcha.Oscilo.), misma organización del árbol.
Los triángulos laterales tienen el vértice opuesto a bisagras. El triángulo
adicional de oscilo aparece solo en la hoja derecha de 2O.

En 2, seleccionar la primera hoja ilumina la izquierda: Principal muestra
Apertura Interior y Avanzada Tipo de Apertura 1 + 1. No se deduce de ello que
la cámara sea interior. Esta evidencia describe la vista predeterminada mostrada;
no se observó un cambio de vista ni se probó apertura Exterior. Hoja con manilla
no demuestra por sí sola todas las reglas de hoja activa o herraje del despiece.

Capturas: 1OD-ficha, 1OD-diseno, 1OI-ficha, 1OI-diseno, 2O-ficha, 2O-diseno.
Los ficheros 02-pareja-general, 02-hoja-primera y 02-hoja-primera-avanzada
corresponden al código 2 (el prefijo 02 es solo el nombre de captura).

CHM: worddocuments_configuracindefijosdecorredera1.htm (§5.1.2.2.1.1.2.3)
documenta Interior/Exterior, Tipo Apertura y numeración izquierda a derecha.
No define explícitamente la perspectiva de cámara. No delegar esa hipótesis.

## Decisión técnica
El sufijo izquierda/derecha de AperturaVisual expresará lado físico de bisagra
en la vista representada. El renderer actual lo invierte. Corregir 1OD/1OI y
conservar el aspecto físico previo del resto cambiando coordinadamente sus
etiquetas; 2/2O además tendrán manilla explícita solo en la hoja derecha.
No extender ausencia de manilla a otras composiciones sin evidencia.
Una función pura común gobernará lados y trazos para web/PDF.

Las configuraciones v1 guardadas contienen código/medidas, no el árbol visual.
Decisión: corregir retrospectivamente su representación al reconstruirla,
sin migraciones ni escritura documental ni modificación de importes. No añadir
versionado de dibujos erróneos. Los PDF ya emitidos no se reescriben.
No es certificación de cortes, herrajes o precio. Persistencia, motor material,
valoración y las 14 estructuras operativas se conservan.

## Pendiente separado
Cotas de las seis combinaciones y segundo tamaño; dimensiones 1O2FL 1300 frente
1400 siguen pendientes. No modificar medidas/proporciones en este cambio.
La unión de herrajes, C2 y las 888 comparaciones siguen pendientes.
