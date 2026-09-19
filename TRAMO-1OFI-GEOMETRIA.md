# Tramo 1OFI: resolver puro de FI

## Objetivo

Añadir a `@aluminior/core/estructuras` un resolver puro y exclusivo de `1OFI`.
Recibe ancho y alto exteriores del marco contenedor y un valor FI explícito,
todos en milímetros. No aplica defaults, no redondea y no realiza E/S.

## Contrato

`resolverGeometriaFi1Ofi(anchoMm, altoMm, fiMm)` acepta entradas `unknown` para
rechazar sin coerción valores ausentes, `null`, cadenas, infinitos y dimensiones
no positivas.

El resultado es discriminado por `valido`:

- válido: conserva las dimensiones exteriores, declara origen arriba-izquierda,
  devuelve `ejeY = altoMm - fiMm` y expresa que FI se mide desde el exterior
  inferior del marco contenedor hasta el eje horizontal del travesaño;
- inválido: devuelve un motivo estable, sin coordenadas parciales.

FI debe cumplir `0 < fiMm < altoMm`. Es coherencia matemática del modelo, no un
límite de fabricación observado en Productor.

## Fuera de alcance

No se modifican plantillas, proporciones, `distribuirComposicion`, configuración
v1, persistencia, web, PDF, despiece, vidrio, cortes, valoración ni defaults de
alta. Tampoco se incorpora `FIJO SUPERIOR` ni se generaliza FI a otras estructuras.
