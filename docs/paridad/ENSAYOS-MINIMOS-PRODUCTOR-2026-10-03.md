# Ensayos mínimos pendientes de Productor

03/10/2026. Derivados de la [matriz de cobertura](MATRIZ-COBERTURA-PRODUCTOR-2026-10-03.md)
y del último relevo. Estado de esta entrega del 03/10: sin nuevos resultados
confirmados de E1–E7. Los estados vigentes se consultan exclusivamente en el
[roadmap operativo](../../ROADMAP-PARIDAD-PRODUCTOR.md); las tablas siguientes
conservan el detalle de preparación, no una segunda lista de tareas actual.
Se conserva el trabajo visual en su conversación; este documento prepara
comparaciones que distingan hipótesis y evita repetir pruebas por dibujo.


## Registro común y criterio de cierre

Solo documentos nuevos en PRUEBAS ALUMINIOR - 2026 [0017], tarifa 1;
0016/0015 en consulta. Antes de actuar, coordinar con la conversación de ensayos
y observar estado actual. Nunca reutilizar coordenadas/handles anteriores.

Registrar versión/empresa, identificador privado, modelo/serie, cantidad,
medidas económicas/cotas/dibujo, acabados principal y accesorios, vidrio y
espesor, opciones guardadas, accesorios, horas, comisión/despunte/descuentos
iniciales. Mantener constantes todas las entradas salvo el control ensayado.
Un valor no visible queda «no observado», nunca cero supuesto.

En cada estado capturar despiece completo: artículo, función, acabado, cantidad,
cortes, unidad, metraje, PVP e importe; padre unitario/total y neto separado del
IVA. Guardar/reabrir cuando se ensaye persistencia. Capturas, documentos y
identificadores en carpeta privada; el informe publicable usa códigos de ensayo
y regla demostrada, sin exportar datos empresariales.

Cerrar una regla solo si se identifican la fuente/selección y una comparación
discriminante; después fixture sintética, módulo responsable y nueva medición
sin perder igualdades ni cambiar exclusiones. Estos ensayos no autorizan una
regla canónica basada solo en hipótesis.

## Primera tanda: E1–E7

| Prioridad / ensayo | Entrada que fija el relevo | Comparación mínima | Resultado que decide la regla | Estado |
|---|---|---|---|---|
| 1 · E1 Despunte | C2 GMC400 1500×1150 y 1200×1150, cantidad 1 | G1–G5 verificados; variante1207 generó error y tercer GRUPO, sin recálculo; G6-incidencia conservada | Autorización para retirar solo tercer GRUPO y verificar edición de segunda sin alta, después precisión | [Evidencia](EVIDENCIA-E1-DESPUNTE-2026-10-04.md) y roadmap; no repetir A–F/G1–G5 |
| 2 · E2 Unión material de otra serie | Seleccionar caso de los ocho GRUPO pendientes desde diagnóstico privado; reproducir en documento nuevo | Mismos módulos con unión material observada; no sustituir por U | Código/serie/acabado efectivos de unión, grosor, longitud, extremos y despiece | Pendiente; entradas completas aún por recuperar |
| 3 · E3 Comisión | 2O ELEGANTPVC 1200×1200, L | 0, −10 y +10 con Sumar Comisión; distinguir crear línea después del gasto de cambiar gasto con línea guardada | Precio/Subtotal/Importe Comisión, piezas inalteradas o no, orden de redondeo y recálculo | Pendiente; seis residuos de céntimos comunicados, sin sumar a E1/E2 |
| 4 · E4 Tapajunta inferior | 1P 867×2098, GMT004; serie/acabado por confirmar con operador | Inferior SI/NO, sin cambiar cajón/ala/lados restantes | TAPIZ/TAPDE/TAP: cantidades y cortes; L+CAJ+ala frente a L+CAJ+2·ala | Pendiente; no elegir serie arbitrariamente |
| 5 · E5 Compacto | 2O ancho 2100, COM009, cajón 185, alto final ventana 2140; serie/acabado por confirmar | Estado base completo, luego solo medida adyacente si aún hace falta distinguir redondeo | Medidas de hueco/ventana/accesorio, COMPVAL, 4,93/4,94, múltiplos/mínimo e importe | Pendiente; 2325×2140 citado en otro relevo requiere identificar a qué elemento pertenece |
| 6 · E6 Acristalamiento | 2O ELEGANTPVC; mismo vidrio/espesor y acabado | Opción inicial, 2 y 3; una sola alternativa cambiada | Nombre/posición, nTAcris, TablaHojas/Fijos, junquillos/juntas y cortes | Pendiente; banco solo conserva 0/1 |
| 7 · E7 Fracciones | GRUPO C2 970×439,5 y C2 970×1999,5; plano/serie/uniones por fijar | Introducción, valoración, guardado y reapertura; registrar dibujo aparte | Conservación de 0,5 en medidas económicas y cortes; origen entrada/reparto | Contraste Productor pendiente; A4/0030 ya conserva exteriores decimales en web publicada. No repetir su implementación ni confundir el caso A4 sin serie con esta receta |

E1 necesita longitudes comerciales, unidad/precio de compra, barras pedidas,
metros necesarios/sobrantes, saneamiento inicial/final, disco, retales y modo
Barras Completas o Longitud Aprovechable General/Por Perfil. Si esos valores no
están disponibles, no atribuir el importe al sobrante por parecido.
Su ejecución concreta está en [PASO-E1-DESPUNTE](PASO-E1-DESPUNTE.md).
Ya se contrastaron el manual y costes guardados en la entrega E1 del 04/10;
no repetir esa investigación ni mezclar su copia Windows con el banco del Mac.
Las dos líneas idénticas pueden necesitar una comparación adicional de
importes diferentes para discriminar la base del reparto.

E2 se selecciona por la causa privada `serie-de-union-no-representable`,
revisando el subgrupo de ocho referido en la iteración 13; hay once avisos de
esa causa en el diagnóstico general, no son once casos nuevos de aquella tanda.
No abrir/modificar el documento comercial original ni inferir serie por aspecto.

E3 precisa la suma base y todas las filas del despiece, no solo el total.
Comparar las hipótesis redondear cada pieza, cada fila y la línea completa con
los mismos PVP actuales. Si los tres métodos predicen lo mismo, elegir un caso
fronterizo de céntimos desde el diagnóstico; no modificar precios para fabricarlo.
Anotar si la edición aplica inmediatamente, al recalcular, al crear o al abrir.

E4 precisa ala y lados activos reales, compacto/cajón/vuelos/descuentos.
Las medidas del relevo no bastan para deducir sus cortes ni una serie compatible.

E5 precisa vuelos, guía central/posición, paños, accionamiento, G1/G10,
acabados de lamas/guías/accesorios, largo/ancho de COMPVAL y minutos MOCOMP.
El caso base discrimina la medida; una medida adyacente solo se añade si sus
predicciones separan mínimo/múltiplo/redondeo. No convertir «alto final de
ventana» en alto de hueco sin observar el campo.

E6 conserva hoja/fijo, galce, descuentos y vidrio. Registrar las opciones 1/2/3
antes de generalizar a 4/5. La UI web que lista cinco opciones y el adaptador
histórico que solo traduce 0/1 tienen alcances distintos.

E7 conserva medidas económicas originales, coordenadas, cotas y unión con
máxima precisión disponible; una medida del dibujo diferente no acredita
pérdida de fracción. Solo ensayar reparto además de entrada si explica el origen.

## Segunda tanda: solo tras consultar catálogo y diagnósticos

| Ensayo | Selección mínima de casos | Qué distingue | Condición para hacerlo |
|---|---|---|---|
| E8 Herraje/opciones | ELEGANTPVC 3HO o 2O+1OFI; límite real de ConjuntosAsoc del grupo de hoja | Tramo por corte de hoja frente a dimensión exterior; defecto frente a opción guardada | Encontrar primero regla aplicable y t en el catálogo; cortes t−0,5 / t / t+0,5, obteniendo medidas exteriores válidas mediante referencias, no pasando t como ancho exterior |
| E9 Referencias/división | C2 GMC400 o el par con corte distinto del informe; misma instancia | REF antes/después del descuento, cotas FI/FD/TD/F o grupo adicional | Aislar primero la fila y su cadena; el viejo 498/498 de cortes observados demuestra dependencia, no predicción autónoma |
| E10 Acabado efectivo | Un artículo con selección universal y otro con PVP específico en 2O ELEGANTPVC | Acabado de pieza, selector y acabado de tarifa; explicar UNI frente a L | Consultar ArticulosPVP/selector sin editar catálogo; confirmar equivalencia solo con evidencia de ambos ámbitos |
| E11 Mínimos/múltiplos/espesor | Artículo/tabla real afectado; mismas opciones | Rama inferior/exacta/superior del límite, medida facturable frente a corte | Extraer límite y tipo de unidad vigentes; en ML con mínimo/múltiplo no asumir regla M2; espesor de acristalamiento requiere vidrio compatible |

Los límites t deben salir de la fuente real. Primero ejecutar las comparaciones
automáticas de las líneas existentes; la visión se reserva a una ambigüedad que
no pueda decidir catálogo/CHM/despiece guardado. Una única prueba por modelo no
valida todos sus tramos, manos, espesores ni combinaciones.

## Entrega de evidencia de cada ensayo

Usar tabla de estados A/B/C con entrada exacta, captura privada, PVP vigente,
salida y diferencia; registrar controles no observados y cambios automáticos.
Anotar hipótesis antes de medir y decidir después «demostrada», «refutada» o
«no discriminante». Para extracción de 0017 esperar copia estable verificada;
el lector vigente exige Anterior.mdb y no autoriza leer una base activa cambiándole
el nombre. Preparar una frontera de importación específica si llega esa copia.

No afirmar resultados nuevos ni aumentar el 400/523 por planificar ensayos.
La aceptación de la web publicada (valorar, guardar, recargar, PDF) sigue en
su lista propia y no es una prueba del despiece de Productor.
