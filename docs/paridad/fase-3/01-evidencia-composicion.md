# Fase 3 — evidencia de composición e inserción

> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites.

Fecha: 25/09/2026. Observación directa autorizada por el usuario en Productor,
empresa **PRUEBAS ALUMINIOR [0017]**, presupuesto 260497 (vacío al empezar).
El configurador se cerró sin Aceptar en todos los ensayos: el documento sigue
sin líneas. No se tocó la 0016.

Acceso: Presupuestos (lista, «Nuevo» = F7) → Editar → doble clic en la zona
de líneas → Edición de Línea con Estructuras / Artículos / Cerramiento →
Cerramiento abre «Diseño de Cerramientos V2.1» con el lienzo vacío.

## Pantalla

- Barra superior: Aceptar, ojo (vuelve al catálogo), rectángulos (panel de
  propiedades), tres botones más, **Ancho × Alto global** y coordenadas del
  cursor en mm; lupas de zoom a la derecha.
- Derecha: lista de elementos y uniones, por índice de inserción:
  `0 - 2 de 1200 x 1200`, `1 - 1 de 800 x 1200`, `2 - *(UNION NO CONFIG.)`.
  Las uniones sin configurar llevan icono rojo; el icono distingue horizontal/vertical.
- Abajo, modo catálogo: lista de familias (orden de `FamiliasEstr.OrdenEsc`) y
  miniaturas paginadas de cuatro en cuatro (`Pág`, `Total`, `<<`, `>>`).
  Ventanas abatibles: 11 páginas, coherente con las 42 estructuras de la familia 003.
  La ayuda emergente de la miniatura es `DESCRIPCIÓN [CÓDIGO]`.
- Abajo, modo propiedades: pestañas Elemento seleccionado, Unión, Módulo,
  Propiedades del Cerramiento, Tapajuntas. Seleccionar un elemento o una unión
  en el lienzo o en la lista cambia a propiedades y a su pestaña.

## Inserción (confirmado)

| Paso | Resultado visible |
|---|---|
| Arrastrar `2` al lienzo vacío | Un elemento 1200 × 1200 |
| Arrastrar `1`: aparecen **dos puntos verdes**, esquina superior derecha e inferior izquierda | — |
| Soltar en la inferior izquierda | `1` debajo, alineado a la izquierda, 800 × 1200; global **1200 × 2420**; unión 2 horizontal sin configurar |
| Arrastrar otra vez | Puntos en la superior derecha de 0 y de 1 y en la inferior izquierda de 1; no en la inferior izquierda de 0 (ocupada) |
| Soltar a la derecha de 1 | Elemento 3 a la derecha de 1; global **1620 × 2420**; una sola unión nueva (vertical, 4) |
| Soltar sobre el interior de 0 | Se añade en el anclaje libre más próximo (derecha de 0), no sustituye; global 2020 × 2420 |
| Soltar lejos de cualquier punto | No inserta nada |
| Clic (sin arrastre) en una miniatura, con o sin elemento seleccionado | No inserta ni sustituye; solo ayuda emergente |

Reglas que se derivan: cada elemento ofrece un anclaje a la derecha (alineado
arriba) y otro debajo (alineado a la izquierda); un anclaje usado deja de
ofrecerse. No se observó comprobación de solapes con otros elementos: se
mostró el anclaje inferior de un elemento aunque otro ocupaba ese espacio.

## Uniones al insertar

La unión nueva no tiene código (`*(UNION NO CONFIG.)`), **grosor 20** y
longitud igual al lado del elemento de anclaje: la unión 2 bajo un 1200 × 1200
mide 1200 aunque el elemento inferior tenga 800. Los globales 2420 y 1620
confirman los 20 mm. El elemento nuevo conserva la medida de su plantilla
(800 × 1200 para `1`); no hereda la del vecino.

## Propiedades vistas

- Elemento: Estructura y descripción, Posición X/Y (atenuadas: calculadas),
  Ancho, Alto, PERFILES, VIDRIO, Acabado, Aca. Acc., Actualizar, papelera,
  Actualizar todos los elementos.
- Unión: código, lupa, descripción, ojo, acabados, «Longitud de la unión Manual»,
  Longitud, Grosor, Tipo de Unión, Actualizar todas las uniones, Actualizar.
- Módulo: Nº Módulo, Ancho × Alto (1 · 1200 × 2420 en el ensayo), Referencia (Tipo).
  Semántica de «módulo» no resuelta: **hipótesis**.
- Propiedades del Cerramiento: Código, Cantidad, Referencia (Tipo), Descripción,
  Descripción Manual, Insertar Descripción Automática, Horas adicionales de
  Fabricación y Colocación.

## Eliminación (observada una vez, no concluyente)

La papelera pide confirmar «¿Desea eliminar el Elemento seleccionado?». Con los
elementos 0, 1 (debajo de 0), 3 (derecha de 1) y 5 (derecha de 0), eliminar 1
dejó solo el 0: desaparecieron también 3, que dependía de 1, y 5, que no.
Después el configurador dejó de aceptar arrastres. Se interpreta como posible
truncado por orden de inserción o defecto; no se reproduce.

Aluminior elimina el elemento y los que dependen de él, y enseña el número
antes de confirmar. Es una desviación deliberada y queda documentada.

## Uso real y manejo del arrastre (26/09/2026)

Indicación del usuario, operador habitual: en la práctica los elementos de un
cerramiento se componen **a los lados**; un elemento debajo de otro es muy
improbable. El anclaje inferior existe, pero la composición por defecto que
conviene facilitar es la lateral.

Para que el elemento quede alineado a la derecha y no se coloque debajo, hay
que soltarlo acercándose al punto verde **por el margen superior**: Productor
elige el anclaje más próximo y, si el cursor llega desde abajo, gana el
inferior. En un ensayo del 26/09 un C3 soltado cerca de la esquina superior
derecha se colocó debajo del elemento 1.

Otros hechos del ensayo:
- Eliminar un elemento sin dependientes (el C3 de debajo) borró solo ese
  elemento y devolvió el global de 3020 × 2420 a 2420 × 1200.
- La vista se reencuadra al empezar el arrastre, así que el punto verde cambia
  de sitio respecto a la vista previa.
- Tras varias inserciones el diseñador dejó de aceptar arrastres (la lectura de
  mm del cursor se quedó fija). Cerrar con la X (descarta) y reabrir lo resuelve.
