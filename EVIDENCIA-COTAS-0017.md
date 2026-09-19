# B2: observación parcial de cotas (19/09/2026)

Productor 0017, consulta sin guardar. Capturas ignoradas en
output/evidencia-manos-20260919/2O-FIJO-{ficha,diseno,cota}.png.

## 2O+ FIJO
- Ficha: familia 003 VENTANAS ABATIBLES, descripción 2 hojas + fijo oscilo.
- Medida inicial Diseño V3: 1200 x 1200 (Aluminior todavía 1200 x 1500).
- Marco Normal > Trav. Marco (de abajo); hueco superior con Sep. Hojas
  (Trav. Invisible) y dos Hoja (2 H.Dcha.Oscilo.); hueco inferior Vidrio.
- Bisagras exteriores; una manilla solo en hoja derecha junto al encuentro.
  Izquierda abatible, derecha oscilobatiente. Aluminior tiene ambas oscilo
  y dos manillas: discrepancia conocida, fuera del alcance B1 ya delegado.
- Selección del travesaño en el dibujo, pestaña Posición:
  Horizontal (Abajo), Cota Variable seleccionada, Nombre FIJO INFERIOR,
  Símbolo FI, Cota por Defecto 300 mm. Los campos deshabilitados de Cota Fija
  y Fija desde elemento Exterior también muestran 300: NO son la regla activa.
- No se cambió ningún valor ni se aceptó/guardó el catálogo.

Falta otra medida en una línea de prueba, comprobar referencia geométrica del
valor FI y editar FI de forma controlada. No implementar proporcionalidad ni
cota fija por observar solamente la forma inicial. Los demás cinco casos B2
siguen pendientes de consulta conjunta y segundo tamaño.

CHM §5.1.2.2.1.1.2.4, 5_1_2_2_1_1_2_4_propiedades_de.htm: cota fija respecto
al exterior del elemento contenedor y eje del travesaño; opción separada desde
el elemento exterior máximo. Cota variable dispone de nombre/símbolo/default;
equidistantes no implica igualdad de huecos libres. La proyección concreta de
los perfiles debe contrastarse en Productor, no deducirse del helper visual.
