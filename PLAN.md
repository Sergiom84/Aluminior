# Plan — Reconstrucción de Aluminior

Fecha: 18 de julio de 2026
Situación: cliente/empresa usuaria de Productor Aluminio (GAIA Servicios Informáticos SL).
Objetivo: software propio, con los datos reales, usable en producción.

---

## 0. Hechos verificados (no suposiciones)

| Hecho | Valor | Cómo se verificó |
|---|---|---|
| Instalación original | 24,4 GB, 205.300 archivos | inventario Codex |
| Paquete de investigación | 941 archivos, 817,5 MB | medido |
| ...de los cuales instaladores viejos | 582,7 MB (71%) | medido |
| **`.mdb` en el paquete** | **0** | medido — el paquete NO contiene datos ni esquema |
| Informes Crystal Reports | 291 `.rpt`, 38,5 MB | medido |
| Manual de usuario | CHM, 10,7 MB | medido |
| Bases activas | `EMP0001..EMP0016\aluminio.mdb`, 57–446 MB | medido |
| **Tablas por empresa** | **830** | leído de EMP0003 |
| **Tablas CON datos** | **154 (18,5%)** | contado fila a fila |
| Lectura de MDB | ACE OLEDB 12.0 y 16.0, 64 bits | verificado |
| Git | `C:\Program Files\Git\cmd` en PATH de máquina | verificado |

**Conclusión sobre el paquete de Codex:** el inventario y el informe de arquitectura son correctos y útiles.
Pero como base para reconstruir, está incompleto: le falta lo único imprescindible (esquema y datos)
y el 71% de su peso es lastre. Los activos que sí valen son los 291 `.rpt` y el manual CHM.

---

## 1. Marco legal — la vía que seguimos

- **Los datos son tuyos.** Clientes, obras, artículos, series, presupuestos, costes. Extraerlos y
  migrarlos es tu derecho como titular. Sin discusión.
- **El software es de GAIA.** No se descompilan sus ensamblados ni se copia su código.
- **Vía elegida (sala limpia):** reconstruimos a partir de (a) el esquema de datos, que describe
  *tu negocio*; (b) los `.rpt`, que contienen SQL contra tus tablas; (c) el manual de usuario;
  (d) observación de la aplicación en uso. Replicamos *qué hace*, no *cómo está escrito*.
- Mantener la licencia de GAIA viva durante toda la transición. Es la red de seguridad y la
  referencia de contraste.

---

## 2. Realismo sobre el alcance

Alcance pedido: núcleo + producción + facturación legal (VeriFactu / TicketBAI / SII).

Eso no es una v1. Es un ERP sectorial completo. Secuencia realista:

| Hito | Contenido | Estimación |
|---|---|---|
| **H1 — Catálogo** | Series, perfiles, acabados, artículos, tarifas, costes | 4–6 semanas |
| **H2 — Comercial** | Clientes, obras, presupuestos, generación de equipamiento nuevo | 6–8 semanas |
| **H3 — Uso real en paralelo** | Se usa junto al original, se contrastan resultados | continuo |
| **H4 — Producción** | Despiece, órdenes, stock, optimización de corte 1D/2D | 3–4 meses |
| **H5 — Facturación legal** | VeriFactu / TicketBAI / SII | 2–3 meses + certificación |

Nota sobre H5: VeriFactu ya está en vigor. Es un módulo con requisitos legales estrictos
(registro de facturación encadenado, hash, firma, remisión a AEAT). Se construye **aislado**,
al final, y probablemente convenga integrar una solución certificada en lugar de escribirla.
Hasta entonces se sigue facturando con el sistema actual. Esto no es opcional: facturar con
software propio no conforme es un riesgo sancionable.

**Recomendación:** congelar el objetivo en H1+H2 y no comprometerse con H4/H5 hasta tener
H1+H2 funcionando con datos reales.

---

## 3. Fase 0 — Paquete portátil (esta semana)

### 3a. Paquete depurado → git (~60 MB)

```
Aluminior/
├─ esquema/              # DDL de las 830 tablas + relaciones + índices (SQL)
├─ esquema/con_datos/    # subconjunto: las 154 tablas vivas, documentadas
├─ rpt/                  # 291 Crystal Reports + SQL extraído de cada uno
├─ docs/                 # manual CHM + capturas de flujos
├─ inventarios/          # los CSV de Codex (25,8 MB)
└─ INFORME_TECNICO.md
```

### 3b. Datos reales → disco externo, fuera de git (~3–4 GB)

Las 16 `aluminio.mdb` + `InfoSeries.mdb`, comprimidas. Cifradas si salen del edificio.
Nunca en OneDrive ni en el repositorio.

### 3c. Higiene

- `git init` + `.gitignore` que bloquea `*.mdb`, binarios de GAIA y secretos. **Hecho.**
- El repositorio vive dentro de OneDrive: aceptable con el `.gitignore` puesto, pero
  conviene un remoto privado real (GitHub privado) como copia auténtica.

---

## 4. Fase 1 — Entender los datos (semanas 1–3)

1. **Volcar el esquema completo** de una copia de cada MDB (nunca de la activa).
2. **Descartar las 676 tablas vacías.** Quedan 154. Ese es el sistema real.
3. **Extraer el SQL de los 291 `.rpt`.** Cada informe revela qué tablas se unen y con qué
   claves. Es la mejor documentación de lógica de negocio que existe aquí.
4. **Reconstruir las relaciones** entre las 154 tablas vivas → diagrama entidad-relación.
5. **Auditoría visual:** ejecutar Productor Aluminio y grabar los flujos clave
   (alta de cliente, alta de serie, presupuesto completo, generación de equipamiento).
   Cada pantalla se mapea contra las tablas que toca.

Entregable: diccionario de datos + ERD + catálogo de reglas de negocio observadas.

---

## 5. Fase 2 — Base de datos nueva (semanas 3–5)

- Destino: **PostgreSQL** (o SQL Server si prefieres seguir en stack Microsoft).
- Esquema nuevo, normalizado y en castellano coherente — no una copia literal de Access.
- **ETL idempotente y repetible** MDB → nueva BD. Se ejecuta muchas veces, no una.
- **Validación por conteo y por suma:** cada migración compara nº de filas y totales
  monetarios contra el origen. Si no cuadra, falla.

## 6. Fase 3 — Aplicación (semanas 5+)

Propuesta de stack, abierta a discusión:

| Capa | Elección | Motivo |
|---|---|---|
| Backend | .NET 8 + EF Core | Estás en Windows; ecosistema maduro; futuro largo |
| Frontend | Blazor o React | Web = sin instalación en cada puesto, multipuesto real |
| BD | PostgreSQL | Sin límite de 2 GB, concurrencia real, gratis |
| Informes | QuestPDF / Reportes propios | Sustituye Crystal Reports de 32 bits |

Orden de construcción: catálogo → clientes → presupuestos → equipamiento nuevo.
Cada módulo se valida contra el original con los mismos datos de entrada.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Subestimar 830 tablas | Ya reducidas a 154 reales. Revalidar en la EMP grande (EMP0009). |
| Lógica de negocio oculta en el binario | Los `.rpt` + observación + entrevistas a usuarios |
| Facturación legal no conforme | No facturar con lo nuevo hasta H5 certificado |
| Fuga de datos de clientes | `.gitignore`, cifrado en tránsito, nada en OneDrive |
| Proyecto que nunca termina | Congelar alcance en H1+H2. Uso en paralelo desde el mes 3 |

---

## 8. Siguiente paso concreto

Ejecutar Fase 0 completa:
1. Volcar esquema de las 16 MDB (sobre copias).
2. Extraer SQL de los 291 `.rpt`.
3. Montar el paquete depurado de ~60 MB.
4. Primer commit.
