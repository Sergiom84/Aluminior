# Aplicación explícita de medidas y unión PSU001

Fecha: 20/09/2026. Continuación autorizada después del
[registro del operador](OBSERVACION-PRODUCTOR-2026-09-20.md).

## Cambio implementado

- Ancho, alto y FI del elemento se editan como borrador. Actualizar valida y
  aplica solo el elemento seleccionado; el dibujo y las dimensiones enviadas
  al presupuesto conservan los últimos valores aplicados mientras se escribe.
- Código, longitud y grosor de unión siguen el mismo ciclo independiente.
  Elegir PSU001 carga 2 mm, conforme a E08; su grosor se muestra de solo lectura
  conforme al relato del operador. Su longitud sigue siendo editable.
- Las configuraciones históricas conservan su grosor persistido, incluso si
  PSU001 estaba guardada con 100 mm. No hay migración ni normalización al abrir.
- Hay aviso de cambios pendientes y posibilidad de descartarlos. Aceptar/Guardar
  y las operaciones estructurales quedan bloqueados mientras existan borradores,
  para evitar guardar valores anteriores o perderlos al sustituir un elemento.
  Este bloqueo y Descartar cambios son salvaguardas de Aluminior, no observación
  de controles equivalentes en Productor.
- La selección de otro módulo conserva el borrador asociado a su identidad.
  Aplicar medidas inválidas conserva el dibujo y muestra el error.

El diseñador delega en MedidasElemento, EditorUnion y useBorradoresCerramiento.
No se añaden consultas ni persistencia a componentes o acciones de servidor.

## Evidencia y alcance

| Decisión | Fuente | Límite |
|---|---|---|
| Aplicación explícita | Relato del usuario y E04/E08 | En este cambio cubre medidas/FI y propiedades de unión; materiales siguen pendientes. |
| PSU001 con grosor 2 | E08 | Corrige el valor predeterminado, no demuestra la fórmula completa del ancho global de Productor. |
| Solo longitud editable para PSU001 | Relato del usuario | No se generaliza la restricción a otras referencias. |
| Mantener datos históricos | Contrato de persistencia de Aluminior | Los 100/60 mm de la fixture anterior siguen siendo datos sintéticos. |

Continúan pendientes el catálogo completo, arrastre e inserción, materiales por
módulo, búsquedas de perfiles/vidrios, acceso contextual de uniones, actualización
colectiva, doble acristalamiento y contraste del recorrido de pago.
No se ha inventado la semántica de Actualizar todos a partir del botón visible.

## Verificación

- Web: 10 pruebas correctas (disenador-estructura y use-borradores-cerramiento).
  Incluyen aislamiento de borradores, inmutabilidad, valores inválidos, FI,
  grosor observado y conservación del grosor histórico.
- Core: 107 pruebas correctas de configuración, diseño, geometría y resultados.
- TypeScript web correcto; auditoría de arquitectura: 573 archivos,
  295 módulos, cero infracciones. Diff comprobado.
- Navegador local, presupuesto sintético QA-F1/269902: ancho 1200 → 1300
  queda pendiente con guardado bloqueado y lienzo sin cambios. Actualizar con
  Enter modifica el ancho total 6640 → 6740 y habilita el guardado.
- Ancho 0 rechazado; Descartar restaura la medida aplicada.
- Unión 2: GMU038 → PSU001 muestra grosor 2 de solo lectura; hasta Actualizar
  conserva el lienzo anterior, y al aplicar pasa de 6740 a 6682 según el modelo
  vigente de Aluminior. Unión 1 histórica sigue mostrando 100 de solo lectura.
- Inspección visual de controles en escritorio 1440 × 900 y móvil 375 × 812.
  En móvil, clientWidth/scrollWidth de página son 360/360; el editor conserva
  desplazamientos internos. Esto no cierra ergonomía móvil ni paridad integral.
- Cancelar devuelve al presupuesto de referencia con 6640 × 1020 y 554,08
  de base, sin guardar los cambios de la comprobación. No se operó Productor.

Las pruebas usan la base local protegida por urlDePruebasValidada y sus
migraciones existentes; no se modificaron migraciones ni se accedió a Supabase.
Las capturas de Productor siguen fuera de Git. env.example queda ajeno al cambio.

## Estado de fases

Fase 1 conserva su aceptación técnica local. Fase 2 tiene una corrección
concreta respaldada por evidencia, pero no se declara cerrada: faltan las medidas
finales de cada módulo y cada unión del caso 6300 × 1200 y su comparación
reproducible. Tampoco se declara paridad económica con los 3150,44 de Productor.
