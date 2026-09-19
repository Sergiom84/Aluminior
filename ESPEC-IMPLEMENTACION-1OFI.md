# Especificacion minima de implementacion 1OFI

## Alcance minimo

Incorporar para la estructura `1OFI` una unica cota geometrica editable,
`FIJO INFERIOR` (`FI`), medida en milimetros desde el exterior inferior del marco
contenedor hasta el eje del travesano horizontal. La geometria resuelta debe ser
la unica fuente para editor web, dibujo de linea y PDF.

El alta de una configuracion nueva usa `FI=300 mm`. Cambiar FI conserva el alto
exterior del modulo y reparte el interior: aumenta el fijo inferior y reduce la
hoja superior. El valor observado y dejado en la prueba es `400 mm` para un
modulo de `900 x 1800 mm`.

Quedan fuera de este alcance:

- valorar o recalcular precios;
- generar despiece o formulas de corte en Aluminior;
- activar otras estructuras o generalizar el simbolo `FI`;
- aplicar `FIJO SUPERIOR`, limites o correcciones automaticas no observadas;
- migraciones remotas o revaloracion de lineas existentes.

## Hechos y limites

- Productor conserva `1OFI` a `900 x 1800`, serie `GMA65OPT`, vidrio `L33I`,
  `FIJO SUPERIOR=300` y `FIJO INFERIOR=400` tras grabar, cerrar y reabrir el
  presupuesto `260494`.
- `1OFI` tambien se observo a `900 x 1500` con FI=300. Al pasar a alto 1800, FI
  permanecio en 300; no es una proporcion del alto.
- Al cambiar FI de 300 a 400, el fijo inferior crece y la hoja superior decrece.
- Propiedades muestra un travesano `Horizontal (Abajo)`, `Cota Variable`, nombre
  `FIJO INFERIOR`, simbolo `FI`, perfil `GM16197L`.
- La ayuda define la referencia ordinaria desde el exterior del elemento que
  contiene el travesano hasta su eje. La opcion distinta `Fija desde elemento
  Exterior` no esta activa.
- `FIJO SUPERIOR` se persiste y aparece en la descripcion, pero no se ha demostrado
  que gobierne ningun divisor de `1OFI`; no debe entrar en la geometria.
- No se han observado minimo, maximo ni comportamiento de una medida inviable.
  La validacion debe rechazar estados geometricamente imposibles, sin inventar un
  umbral de Productor ni corregir silenciosamente el valor.
- El error reproducible de opciones impide validar el precio `633,07 EUR` y que
  el despiece consultado sea un contrato calculable por Aluminior.

## Archivos y modulos afectados comprobados

### Dominio y configuracion

- `packages/core/src/estructuras/diseno.ts`: `PlantillaDiseno`,
  `distribuirComposicion` y `plantillaDiseno`. La plantilla `1OFI` no debe seguir
  dependiendo de pesos proporcionales cuando existe una cota persistida.
- Nuevo modulo cohesivo junto a estructuras, por ejemplo
  `packages/core/src/estructuras/cotas-diseno.ts`: tipos de cota y funcion pura
  que resuelva coordenadas fisicas en milimetros. Debe expresar eje, lado de
  origen, contenedor, valor y referencia al eje del separador.
- `packages/core/src/estructuras/cerramiento.ts`:
  `VERSION_CONFIGURACION_CERRAMIENTO`, `ModuloCerramiento`, creacion,
  actualizacion y validacion. Una nueva version debe persistir FI por modulo; la
  ausencia no equivale a cero.
- `packages/core/src/estructuras/diseno-catalogo.ts`: ya maneja `tipoCota` y
  `cota`, pero documenta que proyecta TipoCota=1 a proporcion. No convertir esa
  proyeccion catalogada en formula de fabricacion ni usarla para sobrescribir un
  override persistido.

### Persistencia y casos de uso

- `packages/db/src/schema/lineas.ts`: `lineasEstructura` y
  `lineasCerramiento` son los limites actuales de persistencia de linea. Definir
  primero si el editor escribe `ESTRUCTURA`, `CERRAMIENTO` o ambos; la operacion
  debe ser atomica con la configuracion de linea.
- `packages/db/src/schema/despiece.ts`: `estructuraCotas` y
  `estructuraDisenoNodos` son catalogo/importacion, no el estado editable de una
  linea. No guardar aqui el override del presupuesto.
- `packages/web/app/dashboard/presupuestos/_lib/cerramientos/alta-cerramiento.ts`:
  `prepararAltaCerramiento` debe aceptar/defaultar FI sin valorar datos ausentes.
- `packages/web/app/dashboard/presupuestos/_lib/cerramientos/persistir-cerramiento.ts`
  y `editar-cerramiento.ts`: guardar y recuperar la configuracion versionada sin
  revaloracion economica implicita.

### Representacion

- `packages/web/app/dashboard/presupuestos/[id]/_components/dibujo-estructura.tsx`:
  consumir geometria ya resuelta; no calcular FI a partir de pixeles.
- `packages/web/app/dashboard/presupuestos/[id]/pdf/geometria-cerramiento.ts`:
  consumir el mismo resultado puro que web.
- `packages/web/app/dashboard/presupuestos/[id]/pdf/cerramiento-pdf.ts`:
  ampliar `identidad` para que el snapshot incluya la cota persistida y no pueda
  emparejarse con otra geometria.

## Tratamiento de configuraciones existentes

- Mantener lectura de configuraciones v1 sin inventar `FI=0`.
- No reescribir ni revalorar lineas existentes durante la lectura.
- Para una v1 de `1OFI`, el adaptador puede conservar temporalmente el dibujo
  legado y marcar la cota como ausente, o migrar a `FI=300` solo mediante una
  accion explicita de edicion/guardado. La decision debe quedar visible en el
  resultado, no escondida en el renderer.
- Nuevas altas de `1OFI` escriben la nueva version con `FI=300`; ediciones guardan
  exactamente el override introducido.

## Pruebas necesarias y criterios de aceptacion

1. Core: `1OFI 900x1500 FI=300` y `900x1800 FI=300` mantienen 300 mm desde el
   exterior inferior del marco al eje; no escalan proporcionalmente.
2. Core: `900x1800 FI=400` mueve el eje 100 mm, aumenta el fijo y reduce la hoja
   sin cambiar las medidas exteriores.
3. Core: valor ausente, no finito, negativo o geometricamente imposible no se
   convierte en cero ni se corrige silenciosamente.
4. Persistencia: alta, cierre/reapertura y edicion conservan FI, serie, vidrio y
   version; una escritura fallida no deja estado parcial.
5. Compatibilidad: una v1 se lee sin revaloracion ni mutacion; su estado de cota
   ausente es distinguible de FI=0 y FI=300.
6. Web/PDF: ambos usan la misma geometria fisica y coinciden para FI=300 y 400;
   el grosor grafico del travesano no cambia la cota.
7. Identidad: un snapshot con FI distinto se rechaza aunque coincidan codigo y
   medidas exteriores.
8. Regresion: manos, bisagras y manilla verificadas en B1 no cambian.
9. Valoracion: mientras no exista contrato economico verificado, el resultado
   permanece incompleto/no valorado; nunca se emite un cero ficticio.

Pruebas existentes a ampliar: `diseno.test.ts`, `cerramiento.test.ts`,
`dibujo-estructura.test.tsx`, `geometria-cerramiento.test.ts`,
`cerramiento-pdf.test.ts`, `alta-cerramiento.test.ts` y
`editar-cerramiento.integracion.test.ts`.

## Separacion de responsabilidades

- **Geometria:** milimetros, contenedor, lado, eje y validacion; solo core puro.
- **Representacion:** transforma la geometria a coordenadas web/PDF y aplica
  grosor visual sin alterar medidas fisicas.
- **Despiece:** formulas de perfiles, cortes, vidrio y herrajes; queda fuera hasta
  disponer de contrato demostrado. El despiece Productor FI=400 es evidencia de
  comparacion, no una formula inferida.
- **Valoracion:** precios, mano de obra y estado valorado/incompleto; queda fuera
  mientras persista el error de `OpcionesSeleccionadas`.

## Preguntas pendientes exactas

- ¿Que valores minimo y maximo acepta Productor para FI en `1OFI`, y como informa
  un valor que deja huecos fisicamente inviables?
- ¿`FIJO SUPERIOR` es un residuo descriptivo o gobierna alguna variante de
  `1OFI` no observada?
- ¿Que despiece y precio produce una instalacion Productor sin el fallo de
  `SessionFactory`, y que filas cambian exclusivamente entre FI=300 y FI=400?
