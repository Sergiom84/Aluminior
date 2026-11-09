# Contexto operativo de Aluminior

Hechos estables que Sergio no debería tener que repetir en cada conversación.
Actualizado el 09/11/2026. Los secretos nunca van aquí: solo dónde están.

## Quién usa la app y cómo llega el feedback

- **Usuario real:** el tío de Sergio (titular de ALUMINIOS LARA SLU, «Javi» en el
  tutorial). Prueba la app publicada y le cuenta a Sergio lo que falla o no entiende.
- **Flujo habitual:** Sergio pasa esa lista a un agente (Grok, Codex, Claude…), que
  implementa en `main`; Render despliega solo. Después se pide a Claude revisar
  **como si fuera el tío**: abrir la app publicada, repetir cada queja y confirmarla
  o desmentirla con evidencia.
- **Presupuestos de prueba del tío:** obras con textos de relleno (p. ej. 260022
  «defef», cliente 00429). Se pueden reabrir y volver a guardar para comprobar
  un arreglo; no borrar sin preguntar.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| App publicada | `https://aluminior.onrender.com` (presupuestos: `/dashboard/presupuestos`). Sergio suele dejarla abierta y con sesión en el navegador interno. |
| Despliegue | Render, servicio `Aluminior` (`srv-d9dprl741pts73dlrpd0`), autodeploy de `main`. Ver despliegues con `RENDER_API` del `.env`. |
| Base de datos | Supabase `Aluminior` (ref `cwtyrpqwdbfylqdlydez`). `DATABASE_URL` en `.env`. Se pausa por inactividad. |
| Ficha de accesos | July: `July_unificada\context\access\aluminior.md` (o `/july`). |
| Productor original | `C:\Users\sergi\Desktop\MIX\Productor\Aluminio` (en el portátil; `C:\Productor\Aluminio` es una junction a esa carpeta). |
| Datos válidos de Productor | Solo `EMP0016`. Las demás `EMP00XX` son años anteriores de facturación y no sirven de referencia. |
| MDB de EMP0016 | `aluminio.mdb` es la **activa**: no tocar. Leer solo una copia de `Anterior.mdb` con `ReadOnly=1` (ODBC de Access en PowerShell de 64 bits). |

## Reglas que se repiten

- Producción tiene datos de prueba y del tío: lectura libre; escribir solo como lo
  haría el operador desde la app y dejándolo dicho en el informe.
- Una línea guardada conserva su valoración: si un arreglo cambia el cálculo, las
  líneas antiguas siguen «sin valorar» hasta que alguien las reabre y guarda.
- Estado del trabajo: [ESTADO-ACTUAL.md](ESTADO-ACTUAL.md). Orden de tareas:
  [roadmap](../ROADMAP-PARIDAD-PRODUCTOR.md). Diseñador: [guía](paridad/GUIA-DISENADOR-PRODUCTOR.md).
