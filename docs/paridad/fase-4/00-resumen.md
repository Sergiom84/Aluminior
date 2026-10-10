# Fase 4 — materiales por elemento y aplicación colectiva

> Estado operativo: [ESTADO-ACTUAL.md](../../ESTADO-ACTUAL.md). Las observaciones y verificaciones de este documento conservan su fecha y sus límites. El orden y estado de tareas pertenece al [roadmap vigente](../../../ROADMAP-PARIDAD-PRODUCTOR.md); sus encargos, permisos y pendientes fechados no se reactivan.

Fecha: 25/09/2026.

## Evidencia

Productor no pudo observarse: al abrirlo mostró «Error de Licencia. Quedan
237 segundos para el Cierre de la aplicación». Solo se cerró el aviso; no se
tocó la protección. El 260497 de la 0017 no tenía cambios pendientes.

El manual (`Aluminio.chm`, «Diseño de Modelos de Cerramientos») confirma
Escaparate/Propiedades, doble clic para propiedades y que Actualizar graba el
elemento; la sección «Valoración de Cerramientos» está «EN CONSTRUCCIÓN».

Datos propios de la empresa (exportación EMP0016, solo lectura):
`VCerramientosLin.nLinEstr` enlaza cada elemento con su línea de estructura, y
`VDatosLinEstr` guarda por línea pares `FamiliaN/ConjuntoN` (001 PERFILES →
serie; 050 VIDRIOS → vidrio; 051 guías de persiana). En los 175 cerramientos de
presupuesto con dos o más elementos:

| Campo | Cerramientos con valores distintos entre elementos |
|---|---:|
| Perfiles (familia 001) | 64 |
| Vidrios (familia 050) | 55 |
| Guías de persiana (051) | 10 |
| Acabado de la línea | 0 |

Ejemplos: ventanas ELEGANTPVC con fijos GMA350; correderas GMC400 con fijos
GMA350. Las 585 uniones: 428 verticales y 157 horizontales; ninguna con
longitud manual; códigos PSU001, U, PSU006, GMU038, GMU040, GMU039 y PSU008.

## Implementado

- `materiales-cerramiento.ts` (core): excepciones opcionales por elemento
  (`serieCodigo`, `vidrioCodigo`), solo en v3. Sin excepción el elemento hereda
  el general de la línea; cambiar el general no pisa una excepción; vaciar el
  campo vuelve a heredar. Acabado general, conforme a los datos.
- Modelos iguales = misma estructura de catálogo (código verificado).
- Valoración por elemento con su serie y vidrio efectivos; el snapshot ya
  guardaba ambos por origen, así que no cambia su contrato.
- Configurador: PERFILES (lista de series, primera opción «General · X») y
  VIDRIO (vacío muestra el general) en Elemento seleccionado, aplicados con
  Actualizar como las medidas.
- Mejora autorizada: «Aplicar a modelos iguales (N)» aplica el borrador
  (medidas y materiales) a los elementos de la misma estructura tras confirmar
  con su número e índices. Es todo o nada: si una medida no vale para uno, no
  cambia ninguno.

## Sin implementar por falta de evidencia

- «Actualizar todos los elementos» de Productor: copia las medidas a todos los
  elementos, también de otro modelo (ver `01-evidencia-actualizar-y-diseno-v3.md`);
  si copia materiales sigue siendo hipótesis. No se replica: se mantiene
  «Aplicar a modelos iguales».
- Guías de persiana por elemento (familia 051) y demás familias.
- Vuelta a «Genérico» observada en Productor: aquí se representa con el campo vacío.

## Verificación

- Core: 5 pruebas nuevas (A1/A2 iguales y B1 distinto, cambio individual,
  colectivo exacto, excepción frente a cambio del general, vuelta a heredar,
  validación de versiones). Web: 3 pruebas del borrador colectivo.
- Navegador (base local con catálogo real): 2O + 2O + 0 con GMA350 en los 2O
  mediante modelos iguales; confirmación «2 elementos 2O (0, 1)»; guardado;
  snapshot con GMA350/GMA350/ELEGANTPVC por origen; reapertura con las mismas
  excepciones y la herencia del fijo.
