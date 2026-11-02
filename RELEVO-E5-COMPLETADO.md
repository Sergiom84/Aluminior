# Relevo de tarea E5 rematada y siguientes pasos

> **Fecha:** 02/11/2026  
> **Rama:** `feat/e5-compacto-cerramiento`  
> **Estado:** E5 implementado y verificado en motor, banco de contraste, regresión local y mediciones reales masivas. Documentación actualizada y sincronizada.

---

## 1. Resumen de lo realizado en E5

### Alcance completado:
1. **Modelado de persiana por módulo en cerramientos:**
   - Creado `packages/core/src/estructuras/compacto-cerramiento.ts`:
     - Tipos `CompactoModulo`: `{ estructuraCodigo, altoCajonMm, acabadoCodigo?, opciones?, alturaTotalMm?, vueloIzquierdoMm?, vueloDerechoMm?, posicionGuiaCentralMm?, descuentoVerticalMm? }`.
     - Guarda pura `compactoModuloValido(valor)`.
     - Resolutor puro `compactoEfectivoModulo(modulo, cerramiento)`: hereda acabado de accesorios o general de la carpintería, y opciones por defecto (`['G1O0']` sin guía central).
   - Ampliado `packages/core/src/estructuras/cerramiento.ts` (`ModuloCerramiento.compacto?: CompactoModulo`) en v3.
   - Validado en `packages/core/src/estructuras/validar-configuracion-cerramiento.ts` (solo en v3; 100 % compatible hacia atrás con snapshots v1, v2 y v3 sin persiana).
   - Exportado en `packages/core/src/estructuras/index.ts`.
2. **Despiece de compacto con fijos inferiores/superiores:**
   - `packages/core/src/despiece/linea-catalogo/tipos.ts`: añadido `alturaTotalMm?: number` a `CompactoLineaCatalogo`.
   - `packages/core/src/despiece/linea-catalogo/compacto.ts`: cuando el compacto cubre fijos además de la ventana, la fórmula de largo de persiana usa `L = compacto.alturaTotalMm ?? (ventana.altoMm + compacto.altoCajonMm)`.
3. **Servicio web de valoración:**
   - `packages/web/app/dashboard/presupuestos/_lib/cerramientos/valorar-cerramiento.ts` transmite `compacto: compactoEfectivoModulo(m, entrada)` tanto a la geometría como a cada módulo evaluado en `valorarEstructura` en lugar de `compacto: null`.
4. **Banco de contraste masivo:**
   - `scripts/lib/banco-contraste/geometria.ts` (`compactoDeModulo`): mapea `VAccesorios` (`FamiliaAcc === '100'`) a su módulo mediante `nModulo` (1-based en `mods`), transmitiendo estructura, opciones, vuelos y `alturaTotalMm`.
   - `scripts/lib/banco-contraste/servicio-web.ts`: permite compactos de línea en cerramientos `GRUPO`.
   - `scripts/lib/contraste-presupuestos/variantes.ts`: transmite persianas y sus piezas para valorar el conjunto completo.
   - `scripts/lib/contraste-presupuestos/casos-regresion.json`: actualizado `regresion-06` (Doc 946) con accesorios y opciones reales de recogedor. Pasa de `difiere` (`compacto`) a **coincidir al céntimo** (1.410,08 €).

---

## 2. Resultados de medición y verificación

### En la empresa activa 2026 (`EMP0016`):
- La causa de discrepancia `compacto` **se desplomó de 43 GRUPO (103.672 €) a solo 11 GRUPO (27.909,76 €)**.
- **Más de 75.000 € y 32 GRUPO resueltos**.
- **Diagnóstico de los 11 GRUPO restantes con causa `compacto`:**
  - Se inspeccionaron sus elementos uno a uno: ninguno falla por un compacto `COM*` sin modelar.
  - El 100 % de los casos reales de persiana `COM*` en la 0016 están completamente resueltos y valorados.
  - Los 11 casos restantes tienen tubos de remate (`FamiliaAcc: '112'`, `GMTUB*`) o mosquiteras (`FamiliaAcc: '101'`, `PSM001`) en elementos individuales, los cuales devuelven `accesorio-de-linea-no-representable` y se clasificaban históricamente en `MAPA` bajo la etiqueta `compacto`.

### En los demás ejercicios:
- **0015 (2025):** Los casos con causa `compacto` bajan a solo **2 GRUPO** (2.311,30 €).
- **0017 (pruebas):** Coinciden **28** al céntimo, difieren **38**, sin valorar **140**.
- **Agregado 2023–2026:** Los casos con causa `compacto` bajan de 235 a **171 GRUPO**.

### Batería de tests:
- Tests de `@aluminior/core`: 702 pasados (100 %).
- Regresión local con 9 GRUPO reales anonimizados (`regresion-local.test.ts` con `ALUMINIOR_CONTRASTE_LOCAL=1`): 100 % pasando (todos los casos reales coinciden exactamente).
- Tests de `scripts/`: 100 % pasando.
- Typecheck (`npm run typecheck`): 100 % pasando en todos los paquetes.
- Chequeo de arquitectura (`npm run check:architecture`): 820 archivos; 406 módulos; 0 infracciones.

---

## 3. Próximo paso según el Roadmap (`ROADMAP-PARIDAD-PRODUCTOR.md`)

Con GR1 y E5 finalizados y verificados, las siguientes tareas de paridad por orden de prioridad son:

1. **E2 — Unión material de otra serie en GRUPO:**
   - 39 GRUPO y 107.164 € en 2026 (138 GRUPO en 2023–2026).
   - Resolver la valoración de uniones con la serie de sus elementos colindantes cuando en el mismo GRUPO conviven varias series (ej. corredera y abatible).
2. **E6 — Acristalamiento alternativo y vidrio por elemento:**
   - 23 GRUPO y 69.635 € en 2026 (115 GRUPO en 2023–2026).
   - Mezcla de vidrio simple y doble por elemento en el mismo cerramiento.
3. **UI del configurador web para cotas y persianas:**
   - Exponer campos en `MedidasElemento` para editar `FI`, `FS` o `TD` cuando la estructura lo requiera (más allá de `1OFI`).
   - Permitir asignar compacto/cajón a los módulos en el diseñador de cerramientos.

---

## 4. Prompt para iniciar la siguiente conversación

Copia y pega el siguiente bloque al abrir una nueva conversación:

```markdown
Hola, vengo de la conversación anterior donde completamos y rematamos la tarea E5 en la rama feat/e5-compacto-cerramiento.

Revisa RELEVO-E5-COMPLETADO.md, ROADMAP-PARIDAD-PRODUCTOR.md y docs/ESTADO-ACTUAL.md para ver el estado actual.

Todo el banco de pruebas, core, banco de contraste y regresión local están limpios y pasando los tests al 100%.

Procedemos con el siguiente paso: abordemos la tarea E2 (conjuntos de varias series en GRUPO) o la UI del configurador web para cotas/persianas.
```
