# C2: catálogo visual y recorrido local

27/09/2026. Base `60d050b`, rama `feat/motor-catalogo-completo`.

## Contrato

Habilitar C2 en su categoría existente, con dos hojas correderas iguales,
separación invisible, selección, medidas, guardado y reapertura. Mantener el
dibujo coherente en miniatura, lienzo y PDF. El dibujo es una representación
operativa: no expresa solapes, carriles ni medidas de fabricación.

## Evidencia de Productor

- `export_datos/EMP0016/Estructuras.csv`: C2, familia 001, descripción
  VENTANA CORREDERA DE DOS HOJAS, tamaño inicial 1200 × 1200.
- `EstructurasDiseño.csv`, solo filas de catálogo sin `TipoDoc`: ocho nodos,
  marco NOR, división VI invisible equidistante en dos huecos, dos hojas
  TipoHoja 10, nHoja 1/2, un vidrio por hoja. No se usan diseños de facturas.
- [Observación del operador](../fase-4/01-evidencia-actualizar-y-diseno-v3.md):
  C2 en el configurador y árbol Marco Normal → Sep. Hojas (Trav. Invisible)
  → Hueco → Hoja (2 H.Corr.) → Vidrio.
- La representación nueva usa flechas horizontales para el desplazamiento
  de las hojas. No dibuja bisagras ni deduce accesorios de fabricación.

El comando independiente de lectura `node --import tsx
scripts/verificar-catalogo-visual-c2.mjs` contrasta composición, categoría,
dimensiones y descripción y devuelve los hashes de ambas fuentes. Resultado
guardado en `output/playwright/c2/catalogo.json`.

## Implementación

Se añade una plantilla aprobada al catálogo estático. Los códigos siguen
siendo opacos; no se habilitan otros modelos por contener la letra C.
El generador conservador reconoce también esta forma de ocho nodos de la
familia 001, con hojas 10/1 y 10/2 ordenadas y dos vidrios simples. Rechaza
otros árboles, variantes y familias; no amplía cobertura por semejanza del código.
La geometría compartida distingue deslizamiento de bisagras, y los dibujos
web/PDF omiten bisagras para esas aperturas. Se conservan estilos existentes.

## Verificación y límites

Pruebas focales ejecutadas: 41 de core y 35 de web/PDF. Al retirar únicamente
la geometría de corredera fallan dos pruebas; restaurada, las tres pruebas
nuevas de core pasan. El ensayo causal está en `output/c2-causal.log`.

Navegador local `127.0.0.1:3002`, PostgreSQL efímero `aluminior_real_test`:
presupuesto sintético nuevo sin cliente real. C2 se selecciona desde el
escaparate y se coloca en el lienzo mediante botón. Selección del vidrio con
Enter y foco visible verificada. Sin overflow global a 320, 390 y 1440 px,
incluido reduced motion. Capturas en `output/playwright/c2/`.

El recorrido expuso una diferencia entre estructura simple y GRUPO:
el configurador sin selector de herrajes enviaba una selección vacía, que
anulaba opciones por defecto. El cierre de continuación documenta la
corrección y el resultado del recorrido repetido con el árbol final.

La comparación con Productor usa las fuentes copiadas y la observación
anterior del operador. No se ejecutó el legacy ni se obtuvo una nueva prueba
de sus atajos, arrastre o tiempos. No acredita paridad integral de taller.
