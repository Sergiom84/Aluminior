# Geometría y evidencias

## Contrato de coordenadas

El dominio produce rectángulos en milímetros con origen superior izquierdo. Los módulos se alinean arriba, que es el comportamiento previo de Aluminior/PDF pendiente de contraste nativo. El ancho contractual suma módulos y grosores de unión; el alto contractual es el máximo de módulos. `altoVisibleMm` añade únicamente la longitud máxima de unión para evitar recortes.

La proyección calcula `min(anchoDisponible/anchoMm, altoDisponible/altoVisibleMm)`. Ese factor se aplica sin mínimos visuales ni clamps a X, Y, ancho y alto de cada rectángulo. Las zonas interactivas permanecen asociadas a la geometría; no cambian datos de fabricación.

## Casos comprobados

| Caso | Resultado |
|---|---|
| 5×1200 + 300 + 100 + 4×60 | 6640×1020 |
| 300 frente a 1200 | razón 0,25 antes y después de proyectar |
| 100 frente a 60 | razón 5/3 antes y después de proyectar |
| Unión 1600 con módulos 1020 | visible 1600; contractual 1020 |
| Orden X | 0, 1300, 2560, 3820, 4180, 5440 |
| PDF | 14 pruebas del adaptador correctas |

## Observación UI actual

Documento local sintético `QA-269901`, línea `GRUPO`: la recarga reconstruyó seis módulos, fijo cuarto, U1 PSU001/100×1020 y U2–U5 GMU038/60×1020. El árbol accesible identifica por separado los seis módulos y cinco uniones. Las capturas de la sesión a 1440×900, 1024×768 y 375×812 mostraron el SVG dentro del lienzo y, en móvil, desplazamiento interno de la tabla sin overflow horizontal del documento.

Los artefactos visuales de Productor no se modificaron ni se copiaron. La observación nativa se completó posteriormente con un presupuesto limpio para el cliente de prueba `SHL`.

## Procedimiento para repetir la observación en Productor

### Regla de ventana

Mantener **siempre Productor maximizado** antes de observar o accionar la interfaz. No calcular coordenadas ni pulsar botones mientras la ventana esté restaurada, parcialmente oculta o cambiando de tamaño. Si la aplicación deja de estar maximizada, maximizarla, obtener una captura nueva y sólo entonces continuar. Esto permite ver simultáneamente la barra de acciones, el lienzo, la galería y el panel de propiedades, y evita utilizar coordenadas correspondientes a otro tamaño de ventana.

### Crear un caso limpio

1. Crear un presupuesto nuevo en vez de reutilizar uno que ya contenga líneas o datos de producción.
2. En **Cliente**, escribir `SHL` y pulsar **Aceptar**.
3. Pulsar **Cerramientos** para abrir `Diseño de Cerramientos V2.1`.
4. Comprobar que se ven la lista de familias a la izquierda, la galería inferior, el lienzo central y el área lateral de propiedades.

### Insertar una ventana

1. Seleccionar en la lista inferior izquierda la familia requerida, por ejemplo **VENTANAS CORREDERAS 90°**.
2. Localizar el modelo en la galería inferior, por ejemplo la corredera de dos hojas.
3. **Arrastrar el modelo desde la galería hasta el centro del lienzo.** Un clic o un doble clic sobre la miniatura no inserta el cerramiento.
4. Verificar la geometría generada y las medidas superiores. En el caso observado, Productor creó una corredera de dos hojas de `1200 × 1200`.
5. Pulsar **Aceptar** en la barra superior para validar la composición y desplegar las propiedades del elemento.
6. Si aparece el aviso `Datos incompletos para el Elemento`, pulsar **Aceptar** en el aviso. Productor exige informar **Serie/Perfiles**, **Vidrio** y **Acabado** y después pulsar **Actualizar** antes de finalizar la línea.
7. No inventar valores comerciales durante una observación de paridad. Detenerse en el panel de propiedades si no se conocen los valores correctos.

### Abrir una línea ya creada

1. Seleccionar la línea del presupuesto y pulsar **Editar**.
2. En una línea ya generada, la opción **Cerramiento** puede estar deshabilitada.
3. Pulsar el icono del **cartabón** para abrir las propiedades del cerramiento.

### Disciplina de automatización

- Obtener una captura nueva inmediatamente antes de cada acción y usar únicamente coordenadas de esa captura.
- Ejecutar una acción cada vez y volver a observar el resultado.
- Si Productor muestra `No responde` después de **Aceptar**, esperar a que finalice el cálculo antes de volver a pulsar. En la observación realizada tardó aproximadamente 12 segundos y después mostró el aviso de datos incompletos.
- No reutilizar coordenadas después de maximizar, restaurar, mover o redimensionar la ventana.
- Si el usuario está interactuando con la aplicación, volver a observar antes de continuar.
