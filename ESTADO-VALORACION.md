# Aluminior — Estado de la valoración (resumen ejecutivo)

_Fecha: 2026-07-22 · Cierre del frente de precio (anexos T.52–T.59)_

## En una frase

La valoración de presupuestos pasó de **0 presupuestos valorados** a un **motor de
precio validado que reconstruye ~70,5 % del € de cliente al ±1 %**, con la
infraestructura de despliegue lista y la única pieza pendiente siendo un dato de
negocio: la tarifa vigente 2026.

## Cómo valora (el modelo, verificado)

El precio de cada línea es un lookup de tarifa, no un cálculo:

> **ImporteTotal = PVP(artículo, acabado, tarifa) × Metraje × Cdad**

La identidad `ImporteTotal = Precio × Metraje` se cumple en el **100 %** de las líneas
del histórico (verificado de forma independiente), sin descuentos por línea. El precio
unitario coincide al céntimo con `ArticulosPVP` en el 96,1 % de los componentes.

## Cobertura (histórico, ±1 %)

| Nivel | € denominador | ±1 % | ±5 % |
|---|---:|---:|---:|
| Componente de despiece | 1.026.934 € | 90,5 % | 93,1 % |
| Ventana (padre = Σ hijas × Cdad) | 1.295.946 € | 73,9 % | 81,3 % |
| **Cliente (sin doble conteo)** | **1.490.444 €** | **70,5 %** | **76,9 %** |

Solo el **0,3 %** del € de cliente no tiene ni precio candidato.

## Por qué no es el 100 % (y por qué es correcto)

El ~30 % restante **no es un fallo del modelo**, está atribuido con números:

- **~12 % colocación/varios manual** — entrada del usuario (mano de obra de colocación),
  "sin valorar" por diseño. Confirmado en T.55/T.32.
- **~7,5 % ajuste comercial por presupuesto** — un factor uniforme que el comercial
  aplicaba pero el ERP viejo **no guardaba** en ninguna columna (T.58). No reconstruible
  del histórico; recuperable solo hacia delante (ver decisión 3).
- **Resto**: precios manuales de ventana (`PVPManualSN`) y el desfase por ser precios
  históricos de 2024, no de 2026.

Dos frentes previos (despiece topológico T.24–T.52; residuo de escuadra/tramo T.49–T.53)
quedaron cerrados como **bloqueo por datos** —el despiece por unidad física no se persiste
en el sistema, confirmado en la MDB viva—, no por falta de modelo.

## Infraestructura lista para desplegar

- **Tabla `articulos_pvp`** (histórica: tarifas 1/2/3) + **tabla `tarifas`** (migración
  aplicada, aditiva, trazabilidad de vigencia).
- **Cargador de tarifa** seguro: dry-run por defecto, tarifas históricas protegidas,
  aditivo, idempotente, reversible. El swap 2026 = cargar una tarifa nueva; `acciones.ts`
  ya lee el precio por esa clave, cero cambios de lógica.
- **Guarda "todo o sin valorar"** cableada y bajo test: una línea sin precio queda
  "sin valorar" (nunca 0, nunca un total parcial). 46 tests en verde.

## Las decisiones (tuyas)

1. **[HECHA]** Aplicar la migración `tarifas`.
2. **Conseguir la tarifa 2026 real** — el lever nº 1. Sube la exactitud del ~70 % sin
   tocar código (hoy limitado por precios de 2024).
3. **(Opcional, hacia delante)** Que la app capture el "ajuste comercial por presupuesto"
   como campo → +~8 pp de cobertura (~78 %). Es producto/UI, no análisis; solo aplica al
   cotizar con la app, no reconstruye el histórico.

## Límite honesto

El motor de precio está tan completo como el histórico permite. Subir más la cobertura
no es cuestión de mejor modelo, sino de dato: la tarifa vigente (exactitud) y la captura
del ajuste comercial (cobertura). Ambas son acciones, no mediciones.
