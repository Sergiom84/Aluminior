# Medidas exteriores, recorridos CI y ficha July — 09/10/2026

Estado: A4 implementado/verificado localmente; 0030 pendiente remota. A5 recorrido
de navegador verificado localmente y en GitHub Actions.
D1 ficha de acceso reconciliada localmente. Trabajo desde origin/main `18701a4`
en `codex/medidas-decimales-ci`, commit `e7aed24`; main principal con cambios ajenos intacto.
[CI 37971854995](https://github.com/Sergiom84/Aluminior/actions/runs/37971854995):
correcta sobre ese commit, seis recorridos en Linux/Postgres nuevo, typecheck
del harness y artefactos publicados. Sin secretos de producción.

## Alcance y evidencia

Sergio pidió continuar los puntos resolubles desde Mac. A4 corresponde a F07/F08
y propuesta 3 de la auditoría del 09/10; A5 a propuesta 6. La conservación de
fracciones ya está acreditada en configuraciones históricas y core; no se
infiere ninguna regla económica ni se cierra la observación E7 en Productor.
E1 continúa condicionado al ensayo Windows y su autorización pendiente.

La causa de F08 eran las columnas integer de `lineas.ancho_mm`/`alto_mm`.
0030 las amplía a double precision, misma representación numérica que TypeScript
y el JSON del configurador. Conserva todos los valores int4 existentes, nulos
y números fraccionarios sin imponer una escala que redondee silenciosamente.
No cambia cálculos económicos, tarifas, catálogo ni snapshots históricos.
La validación de estructura individual conserva rango técnico y finitud y
admite fracciones; su input usa step=any. GRUPO deriva las medidas en servidor
como antes y deja de rechazarlas por no ser enteras.

## Verificación local

- Reproducción previa: tres regresiones rojas (ancho, alto y entrada individual).
- Suite web: 757 pruebas correctas; BD: 56. Typechecks de cuatro paquetes y
  harness E2E; arquitectura sin infracciones; build Next correcto.
- SQL real de 0030 sobre tabla temporal: int4 máximo, enteros y nulos intactos;
  970.25, 439.5, 1999.5 y 1000/3 vuelven con su representación numérica original.
- Servicios reales y PostgreSQL en rollback: alta 970.25×439.5, edición
  970.25×1999.5, copia de revisión, JSON y modelo PDF conservados. Precio
  permanece nulo cuando faltan materiales; nunca se inventa cero.
- Seis recorridos Playwright correctos: escritorio 1440×900 y móvil 390×844;
  alta y ambas copias tras pérdida HTTP postcommit; recarga y teclado;
  guardado/recarga/edición/PDF de GRUPO decimal; latencia/fallo/reintento de
  catálogo y estructura individual decimal. Sin overflow exterior.
- La descarga PDF comprueba estado, MIME y cabecera. La integración comprueba
  dimensiones del modelo PDF; esto no es nueva aceptación comercial Productor.
- [Harness y ejecución](../../e2e/README.md). La build se repitió sola tras una
  colisión inicial con `next dev` en `.next`; la ejecución final fue correcta.

## Publicación pendiente: alcance y reversión

0030 no está aplicada en Supabase. Antes de publicar, autorizar específicamente
la ampliación de las dos columnas remotas y el despliegue. Preparación:

1. Confirmar destino `cwtyrpqwdbfylqdlydez`, journal hasta 0029 y sólo 0030 pendiente.
2. Respaldo privado verificable y huellas de documentos/líneas/satélites; breve
   ventana sin escrituras durante el cambio de tipo y renovación de conexiones.
3. Aplicar el SQL y su entrada de journal en una transacción, con lock_timeout
   y statement_timeout; confirmar tipos, huellas, RLS y permisos conservados.
4. Reiniciar/desplegar la app para renovar conexiones y consultas preparadas.
   Cambiar un tipo puede invalidar planes preparados antiguos: ocurrió en la
   prueba DDL local; ésta usa prepare=false deliberadamente. No esconder el
   requisito de reconexión en producción.
5. Comprobar Render live en el commit correcto y repetir con documento sintético
   autorizado alta/recarga/copia/PDF con fracción; conservar los anteriores.

Reversión preferente: volver al código anterior conservando columnas ampliadas.
No convertir a integer si hay fracciones: perdería medidas. La app anterior
rechaza nuevos exteriores fraccionarios, pero las filas decimales existentes
requieren atención al editar; no afirmar equivalencia funcional del rollback.
Antes de uso decimal, revertir DDL sólo con autorización y prueba de integridad.

## D1: ficha de acceso July

Actualizado `July_unificada/context/access/aluminior.md`: Render y conexión
Postgres comprobados el 09/10 durante A3; 30 migraciones, último deploy a06cd4f,
respaldo y herramientas Mac, punteros seguros y distinción de evidencia recibida
del motor frente a comprobación directa. Retirada la instrucción caducada de
reconectar GitHub/Render. Auth del 29/09 e historia de hashes conservadas con fecha.
Actualización local: no acredita sync ni recepción en Windows. Sin secretos.

Estado y siguiente paso los gobierna el [roadmap](../../ROADMAP-PARIDAD-PRODUCTOR.md).
No repetir A3, A4 local ni D1. La publicación A4 requiere el alcance anterior;
E1/E7 y aceptación comercial PDF siguen separados.
