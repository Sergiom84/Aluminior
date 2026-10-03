# Fase 4 — evidencia: actualizaciones colectivas, uniones y Diseño V3

> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites.

Fecha: 26–27/09/2026. Observación en **PRUEBAS ALUMINIOR [0017]**, realizada a
mano por el usuario con capturas; el 260497 daba fallo y se usaron el 260498 y
el 260499 (cliente 00535). No se tocó la 0016. Acceso a la edición de línea:
botón **+ verde** de Operaciones sobre la Línea → Edición de Línea → Cerramiento.

## Composición del ensayo

C2 · C2 · C3 · C2 en horizontal (dos correderas de dos hojas, una de tres y
otra de dos). En el elemento 0 se fijaron Ancho 1000, Alto 1000, PERFILES
GMC400 y VIDRIO V410ACGF, y se pulsó «Actualizar todos los elementos».

## «Actualizar todos los elementos»

Posiciones X resultantes, de izquierda a derecha: 0, 1001, 2001 y 3002. La
separación de unos 1000 mm también en el C3 (antes 1800) indica que **las medidas
se copian a todos los elementos, sin distinguir el modelo**. El dibujo lo
confirma: los cuatro quedan del mismo tamaño.

- Confirmado: copia Ancho y Alto a todos, incluido un modelo distinto.
- **Hipótesis**: si copia también PERFILES, VIDRIO y acabados. No se capturó el
  panel de los demás elementos.

Aluminior mantiene «Aplicar a modelos iguales (N)» como mejora autorizada y no
replica la copia indiscriminada: pasar la medida de una corredera de dos hojas
a una de tres rara vez es lo que se quiere. Es una desviación consciente.

## Uniones

- Pestaña Unión: Unión (código con lupa), descripción desplegable, ojo,
  Acabado (dos campos), «Longitud de la unión Manual», Longitud (1200), Grosor
  (20, **no editable**), Tipo de Unión (dos iconos), «Actualizar todas las
  uniones» y «Actualizar».
- La lupa abre «Búsqueda de Estructuras» con: GMU038 TUBO 60x60, GMU039 TUBO 40x40,
  GMU040 TUBO 40x60 (Dto: 40), GMU041 TUBO 40x60 (Dto: 60), PSU001–PSU005 H UNION
  PARA COMPACTOS (100/120/90 mm, RPT), PSU006–PSU009 ESQUINERO PARA COMPACTO
  (RPT, con suplemento) y U SIN UNION.
- El grosor sale del catálogo, no del usuario. En `Estructuras.UnionGrosor`
  (EMP0016): GMU038/041 = 60, GMU039/040 = 40, PSU001–005 = 2, **PSU006–009 = 0**,
  U = 1. Las 585 uniones reales coinciden sin excepción con esos valores.
- Tras «Actualizar todas las uniones» la unión «desapareció» de las juntas y ya
  no se podía seleccionar. Es coherente con un código de grosor 1 o 2 mm
  (U o PSU): la junta queda demasiado fina para hacer clic en ella. Las
  posiciones 1001/2001/3002 encajan con uniones de 1 mm. **Hipótesis** sobre el
  código exacto elegido.

Consecuencia para la fase 6: Aluminior valida `grosorMm > 0`
(`validar-configuracion-cerramiento.ts`), pero los esquineros tienen grosor 0 en
el catálogo real (121 uniones PSU006 y 2 PSU008). Hay que admitir 0 para los
esquineros (UnionTipo 4) y tomar siempre el grosor del catálogo.

## Grabación y línea resultante

Con serie, acabado y unión indicados, Productor ya permite grabar. Línea
resultante en el 260499: `GRUPO`, descripción
«VENTANA CORREDERA DE DOS HOJAS DE MEDIDAS : 1.200,0 x 1.200,0 / EN COLOR L.
BLANCO / SERIE 400 EUR / DOBLE ACRISTALAMIENTO 4/10 ARGON/CLIMAGUARD PREMIUM 6»,
Acabado UNI, Cdad 1,00, Ancho 5.400, Alto 1.200, Precio 1.197,93, total con IVA
1.449,50. Se ve un triángulo rojo de aviso junto a HUECO y en la barra superior
(significado sin determinar). La descripción usa las medidas del primer
elemento, no las globales. 5.400 = 1200 + 1200 + 1800 + 1200 exactos: en ese
grabado las uniones no suman ancho (**hipótesis**: esquinero de grosor 0 o
suma sin uniones).

## Diseño V3 (botón cartabón del elemento)

Abre el diseño interior del elemento en una ventana «Diseño V3»:
- Barra: Aceptar, grabar, X roja, recuadro, varita, **igualado horizontal de
  vidrios**, **igualado vertical de vidrios**, arco (**Curvas y Formas**:
  arco de medio punto, rebajado, carpanel 2R y 3R, recta, ojo de buey y forma
  inclinada; valoración de curvado, material y montaje/fabricación; altura en
  centro, radio y centro x/y; Hi/Li/Hd/Ld para la forma inclinada) y **Más
  opciones** (Fijos de Corredera, Ruptura para crear cerramiento, Anular altura
  manilla en el centro).
- Fijos de Corredera: marco superior/inferior con fijo incorporado, perfiles
  (GM487 CERCO FIJO 28 MM, GM492 FIJO CLIP 17 MM), fijo independiente con
  macho/hembra por lado.
- Derecha, pestaña Elementos: árbol Marco Normal → Sep. Hojas (Trav. Invisible)
  → Hueco → Hoja (2 H.Corr.) → Vidrio, dos veces.
- Pestaña Escaparate: Marco, 1 Hoja, 2 Hojas, 3 y 4 Hojas, Más Hojas,
  Plegables, Superficies y Accesorios. Marco muestra Ancho, Alto, Perfiles,
  Vidrio, Acabado y Accesorio.
- Propiedades según el nodo:
  - Marco: Principal (Tipo Marco Normal/Solape/3 Carriles (C)/M.L. con Guías (C),
    perfiles Sup GM440, Inf GM455, Iz/De GM443, tipo de corte por esquina con
    «Iguales») y Avanzada.
  - Hoja: Principal (Tipo Hoja, Hoja Inferior/Zócalo/Marco abierto, Apertura,
    perfiles GM451/GM449/GM450, tipo de corte), Accesorios (manillas, cerraduras,
    tiradores de corredera, por hoja) y Avanzada (Corredera, Pasiva, Elevable,
    Fija; Nudo Central; Altura Manilla; hojas inferior, superior, izquierda y derecha).
  - Vidrio: Vidrio, Acabado y «Genérico».
- Pie: Cursor, Recalcular Dimensiones, Propiedades Estructura y Mostrar/Ocultar
  Propiedades.

Este editor interior pertenece a las fases 5 (vidrio, huecos y travesaños) y
posteriores; aquí solo queda registrado.

## Pendiente

- Pestaña Módulo y regla de eliminación con dependientes: no se ensayaron en
  esta sesión.
- Qué campos, además de las medidas, copia «Actualizar todos los elementos».
- Significado del triángulo rojo de aviso.
