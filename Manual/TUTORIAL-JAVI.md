# Aluminior: tutorial para empezar a probar

Hola, Javi. Esto es la versión web del programa de presupuestos, hecha a imagen de
Productor. Aquí tienes los pasos básicos, cada uno con su foto y debajo lo que hay
que hacer. La idea es que lo pruebes como harías un presupuesto de verdad y me
digas qué falta, qué sobra o qué no cuadra con Productor.

**Dónde entrar:** https://aluminior.onrender.com con el usuario y la contraseña que
te paso aparte.

**Paciencia al principio:** el servidor es gratuito y, si lleva rato sin usarse,
tarda unos segundos en despertar. Si un botón pone «Creando…» o «Añadiendo…»,
espera sin volver a pulsar.

**Arriba siempre tienes la misma barra:** Inicio, Artículos, Clientes, Estructuras,
Presupuestos, Producción, Compras e Informes.

---

## 1. Clientes

![Listado de clientes](img/01-lista-clientes.jpg)

Entra en **Clientes**. Ves todos los clientes importados de Productor. Para buscar
uno, escribe parte del nombre, el código, el NIF o la población y pulsa **Buscar**.

![Formulario de cliente nuevo](img/02-cliente-formulario.jpg)

Para crear uno, pulsa **Nuevo cliente**. Solo son obligatorios el **Código** (ya
viene propuesto el siguiente libre) y el **Nombre o razón social**. Lo demás
(NIF, dirección, teléfono, correo, tarifa…) es opcional.

![Cliente creado en el listado](img/03-cliente-creado-en-lista.jpg)

Pulsa **Crear cliente** y vuelves al listado con el cliente ya dado de alta.

---

## 2. Empezar un presupuesto

![Listado de presupuestos](img/04-lista-presupuestos.jpg)

Entra en **Presupuestos**. Cada fila es un presupuesto con su número, fecha,
cliente, obra, estado y total. Si pone **«sin valorar»** es que falta algún precio:
el programa nunca se inventa un 0. Pulsa **Nuevo**.

![Buscar cliente](img/05-presupuesto-buscar-cliente.jpg)

En **Cliente** puedes escribir el código o trozos del nombre en cualquier orden
(por ejemplo `garcia prueba`). Elige la fila que quieras. El cliente es opcional:
si no está dado de alta, déjalo vacío.

![Cabecera del presupuesto](img/06-presupuesto-cabecera.jpg)

Rellena **Nombre** (el que quieras que salga) y **Obra**. Serie, número, estado y
tarifa se ponen solos. Pulsa **Aceptar y continuar**.

![Configurador vacío](img/07-presupuesto-configurador-vacio.jpg)

Se abre el **configurador de cerramientos**, que es donde se dibujan las ventanas,
como el diseñador de Productor. Arriba tienes **Editar cabecera**, **Emitir** (el
PDF), **Aceptar** y **Cerrar**.

---

## 3. Dibujar una ventana

![Ventana colocada](img/08-ventana-colocada.jpg)

Abajo está el escaparate por familias (correderas, abatibles, oscilobatientes,
fijos…). Pulsa un modelo, por ejemplo **C2**, y luego **Colocar C2**. También puedes
pulsar el **+** del lienzo y elegirla en la ventana que se abre.

![Panel del elemento y datos de la línea](img/24-panel-elemento-en-fila.jpg)

Al pulsar sobre una ventana, debajo del dibujo aparece su ficha en una sola fila:
qué modelo es, su posición en el dibujo (se calcula sola), **Ancho** y **Alto**, y
los botones **Mover elemento**, **Convertir en hueco** y **Eliminar elemento**.

Más abajo están los datos de toda la línea: **Ubicación**, **Serie**, **Vidrio**,
**Acristalamiento**, **Acabado**, **Cdad.**, **Horas de fabricación** y **Horas de
colocación**.

Si hay varias ventanas en el conjunto, cada una tiene además **Perfiles del
elemento** y **Vidrio del elemento**. Sirven para que una ventana lleve una serie o
un cristal distinto del general. Si los dejas en «General», usa lo de la línea.

**Importante:** cuando cambies el ancho o el alto, pulsa **Actualizar** (el botón
azul) o la tecla **Intro**. Hasta entonces el cambio no se aplica.

Elige la **Serie**. La lista solo enseña las series que sirven para ese modelo y
ese vidrio. Por ejemplo, para una corredera con doble cristal sale `GMC800D` y no
`GMC800`.

![Aviso de que falta el vidrio](img/10-aviso-falta-vidrio.jpg)

Si te falta algún dato (serie, vidrio o acabado), al aceptar te avisa de qué falta
y no guarda nada.

![Buscar vidrio](img/11-buscar-vidrio.jpg)

Pulsa **Buscar** junto a Vidrio, escribe parte del código o de la descripción (por
ejemplo `V420`) y pulsa **Elegir** en la fila que quieras.

Pulsa **Aceptar**. La ventana entra en la tabla de abajo con su descripción, medidas
y precio. Para cambiar algo después, pulsa **Editar** en esa línea. Mientras editas
una línea, el configurador de arriba se esconde para que no haya dos a la vez.

---

## 4. Varias ventanas juntas y la unión

![Dos ventanas con la unión sin configurar](img/18-dos-ventanas-union-sin-configurar.jpg)

Con una ventana puesta, pulsa el **+** de la derecha o el de abajo para añadir otra
pegada. En la lista de la derecha aparece una fila roja **UNION NO CONFIG.**: entre
dos ventanas siempre hay una unión que elegir, como en Productor.

![Elegir la unión](img/19-elegir-union-nueva.jpg)

Pulsa esa fila roja. Abajo eliges la **Unión** en el desplegable (sale su dibujo) y
pulsas **Actualizar**. Al aceptar, todo el conjunto se guarda como una sola línea
**GRUPO**.

![Presupuesto con el grupo](img/20-presupuesto-con-union.jpg)

Así queda el GRUPO en la tabla, con el despiece calculado.

---

## 5. Mover una ventana ya colocada

![Elegir dónde mover](img/26-mover-destinos.jpg)

Selecciona la ventana y pulsa **Mover elemento**. Aparecen unos **puntos verdes**:
son los sitios donde puede ir (a la derecha o debajo de otra). Pulsa uno y la ventana
se mueve allí. También puedes **arrastrarla** con el ratón hasta un punto verde.

![Aviso al mover con cambios sin aplicar](img/25-aviso-mover-pendiente.jpg)

Si has escrito medidas y no has pulsado **Actualizar**, no te deja mover y te avisa
en rojo. Pulsa **Actualizar** (o **Descartar cambios**) y vuelve a intentarlo.

Si te equivocas, tienes **Deshacer** y **Rehacer** en la barra del configurador
(o Ctrl+Z y Ctrl+Y).

---

## 6. Hueco para viga, muro o pared

![Elemento convertido en hueco](img/27-convertir-en-hueco.jpg)

Es lo que en Productor haces con el cartabón y «invisible». Pon un fijo con la
medida del hueco, selecciónalo y pulsa **Convertir en hueco**. Queda en blanco con
un borde discontinuo: ocupa su sitio y cuenta en las medidas del conjunto y en las
uniones de sus lados, pero **vale 0 €** y no lleva despiece. Para quitarlo, pulsa
**Volver a ventana**.

![Línea con el hueco](img/28-linea-con-hueco.jpg)

En la descripción del GRUPO sale como «FIJO DE 1 HUECO DE MEDIDAS…», igual que en
Productor. En el dibujo de la línea y en el PDF no se pinta.

---

## 7. Mosquiteras y artículos sueltos

![Mosquiteras dentro de Cerramiento](img/23-mosquiteras-en-cerramiento.jpg)

En el escaparate hay una familia **Mosquiteras** (enrollable, corredera, corredera
con tirador y plisada). Pulsa el modelo, escribe ancho, alto, cantidad y acabado y
pulsa **Añadir mosquitera**. Entra como una línea aparte.

![Artículo suelto valorado](img/13-articulo-valorado.jpg)

Para cualquier otro artículo usa la pestaña **Artículos**: escribe el código, el
acabado, las medidas y la cantidad y pulsa **Aceptar**. Si tiene precio por medidas,
lo calcula solo.

---

## 8. Total y PDF

![Presupuesto con total](img/21-presupuesto-valorado-total.jpg)

Cuando todas las líneas tienen precio, abajo salen la base, el IVA y el total. Si
alguna línea está «sin valorar», el total no aparece hasta resolverla.

![PDF del presupuesto](img/22-pdf-presupuesto.jpg)

Pulsa **Emitir** para sacar el PDF, listo para imprimir o mandar.

---

## 9. Uniones propias (Artículos → Uniones)

![Listado de uniones](img/14-lista-uniones.jpg)

En **Artículos → Uniones** tienes el catálogo de uniones. Pulsa **Nueva** para crear
una.

![Formulario de unión nueva](img/15-union-nueva-formulario.jpg)

Rellena código, descripción, el perfil que usa (el precio sale de su €/m), grosor,
L1, L2 y tipo. Si solo vale para algunas series, marca **Series específicas** y
elígelas.

![Imagen y precio de la unión](img/16-union-imagen-precio.jpg)

Elige un dibujo del catálogo o sube una imagen propia. Abajo ves el precio calculado.

![Unión guardada](img/17-union-guardada.jpg)

Pulsa **Aceptar F9** y queda guardada, lista para usarla en los presupuestos.

---

## Qué significan los avisos en naranja

- **«sin valorar»**: falta algún precio o dato. No es un 0. El texto de debajo dice
  qué falta (por ejemplo, que esa serie no admite ese vidrio).
- **«Valorado con avisos»**: el precio está calculado, pero hay algo a revisar.
  Por ejemplo: «vidrio de 28 mm por encima del rango de doble acristalamiento de la
  serie» quiere decir que ese cristal es más grueso de lo que admite la serie;
  cambia a un vidrio más fino o a una serie que lo admita.

---

## Qué te pido

1. Haz dos o tres presupuestos reales que ya tengas hechos en Productor.
2. Compara medidas, descripción y precio con los de Productor.
3. Apunta lo que no cuadre, lo que te cueste encontrar o lo que eches de menos, y
   si puedes, mándame una foto de la pantalla.

Usa clientes y presupuestos de prueba con un nombre que se reconozca (por ejemplo
«PRUEBA JAVI») para poder borrarlos luego.
