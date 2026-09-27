# Inventario reproducible del catálogo completo

Fecha: 27/09/2026. Unidad de fase 8; no habilita modelos por sí misma.

## Contrato antes de implementación

- Resultado exacto: matriz local por fuente, familia y modelo con árbol,
  componentes observados, traducción, habilitación, edición, persistencia,
  valoración y bloqueo comprobable. Incluir familias sin modelos y auxiliares.
- Destinatario y motivo: dirección técnica; ordenar las unidades verificables
  sin confundir candidatos visuales con catálogo operativo o fabricación.
- Éxito medible: contabilizar todas las filas de las tres tablas, separar
  diseños de documento, detectar nodos de catálogo sin ficha y conservar
  procedencia con SHA-256. Cada fila recibe estado y motivos.
- Alcance autorizado: lectura de exportaciones de catálogo y metadatos de la
  instalación; implementación en `scripts/catalogo-completo/`.
- Fuera de alcance: nuevas extracciones MDB, UI, valoración económica, DB,
  migraciones, importadores, suites globales y navegador.
- Ficheros protegidos: originales, MDB activas, exportaciones y código ajeno.
- Comprobaciones obligatorias: fixtures sintéticos, pruebas causales medidas,
  ejecución local contra CSV y comprobación de destino ignorado por Git.
- Acciones que requieren autorización: ninguna adicional dentro del contrato;
  push, publicación y cambios remotos siguen fuera del encargo.

## Medición ejecutada

Una exportación completa descubierta: `export_datos/EMP0016`. **541 modelos,
393 con árbol, 148 sin árbol y 5597 nodos de catálogo.** De las 9089 filas de
`EstructurasDiseño`, 3492 pertenecen a documentos y se excluyen. No hay nodos
de catálogo cuyo código carezca de ficha en Estructuras.

`FamiliasEstr` contiene 36 familias declaradas, incluidas seis sin modelos.
Se conserva además el grupo sin familia: 37 filas de clasificación; 31 tienen
modelos. La enumeración se obtiene de los datos, nunca de una lista de tipos.

El generador de `b454919`, ejecutado desde copias de su código bajo output,
reproduce **47 candidatas y 15 plantillas**. Tras los cambios simultáneos de
las otras unidades de fase 8, la medición da **53 candidatas y 21 plantillas**.
Permanecen **14 uniones** habilitadas por su vía propia. Estos recuentos
describen presencia en código y traducción; no prueban valoración ni taller.

| Familia | Modelos | Con árbol | Candidatas actuales | Plantillas actuales |
|---|---:|---:|---:|---:|
| 001 | 20 | 20 | 4 | 1 |
| 002 | 15 | 15 | 0 | 0 |
| 003 | 42 | 42 | 18 | 4 |
| 004 | 31 | 31 | 0 | 0 |
| 005 | 8 | 8 | 7 | 7 |
| 006 | 42 | 41 | 0 | 0 |
| 007 | 75 | 75 | 0 | 0 |
| 008 | 8 | 0 | 0 | 0 |
| 009 | 6 | 5 | 3 | 3 |
| 010 | 25 | 25 | 0 | 0 |
| 011 | 11 | 11 | 0 | 0 |
| 012 | 11 | 11 | 0 | 0 |
| 013 | 21 | 21 | 0 | 0 |
| 014 | 12 | 12 | 0 | 0 |
| 015 | 2 | 2 | 0 | 0 |
| 016 | 6 | 6 | 0 | 0 |
| 017 | 6 | 6 | 0 | 0 |
| 018 | 6 | 6 | 0 | 0 |
| 019 | 4 | 4 | 0 | 0 |
| 020 | 40 | 40 | 21 | 6 |
| 021 | 12 | 12 | 0 | 0 |
| 100 | 17 | 0 | 0 | 0 |
| 101 | 4 | 0 | 0 | 0 |
| 102 | 24 | 0 | 0 | 0 |
| 103 | 52 | 0 | 0 | 0 |
| 106 | 6 | 0 | 0 | 0 |
| 107 | 7 | 0 | 0 | 0 |
| 111 | 1 | 0 | 0 | 0 |
| 112 | 6 | 0 | 0 | 0 |
| 113 | 17 | 0 | 0 | 0 |
| Sin familia | 4 | 0 | 0 | 0 |

Las seis familias vacías son `*`, 104, 105, 108, 109 y 110. En 103 se cuentan
las 14 uniones separadamente de las plantillas de ventanas.

## Procedencia y límites de versión

Cada fuente registra SHA-256, tamaño y mtime de sus tablas; su identidad es el
hash de las tres huellas principales. Las exportaciones de otras carpetas se
mantienen separadas aunque compartan códigos. El ejercicio 2026 de EMP0016
procede del relevo documental; **mtime no acredita fecha de extracción ni
versión del programa**. No se presenta esta exportación como la más reciente.

| Tabla | SHA-256 |
|---|---|
| FamiliasEstr | `429c262d35dd62cf3afd6ef6f13144f1ec0918e8defae1a2eebe93eff17b493c` |
| Estructuras | `df2652e43d38dce3305ed9ca9e873a1f43f8daa0bc7a30e287180cce57b60884` |
| EstructurasDiseño | `43d678147d10370f384831688193ea387cfda0be801500fa2f9076cb3e5a9993` |

Se inventariaron **65 MDB únicamente por metadatos** en
`C:/Users/sergi/Desktop/MIX/Productor/Aluminio`, frente a las 68 del informe
histórico. No se han abierto ni calculado hashes de estas MDB. Los años
rotulados en `Copias de Seguridad` y la versión de carpeta de instalación se
guardan separadamente de mtime. Faltan comparación de contenido y extracción
desde copias verificadas para acreditar qué catálogo añade cada biblioteca,
año o actualización. La diferencia de recuento no prueba pérdida de datos.

## Matriz y fuentes relacionadas

`output/catalogo-completo/matriz.json` contiene una fila por registro, incluidos
auxiliares y códigos duplicados si existen. Conserva componentes observados,
bloqueos exactos del traductor, vía de habilitación, disponibilidad de edición
y persistencia, y evidencia individual distinta de la mera disponibilidad.
Fabricación permanece no acreditada. La evidencia opcional exige identidad
de fuente coincidente; una prueba no se propaga por familia o código.

El antecedente C2 de fase 7/13 se registra con su alcance y límite: no incluía
hash de los CSV, por lo que no se reasigna automáticamente a otra exportación.
Esto no invalida su recorrido anterior. Las verificaciones de esta fase se
documentan en las unidades operativas del lote.

Las relaciones técnicas incluyen 383 líneas, 2134 asociaciones de series,
660 filas auxiliares y 430 opciones. `EstructurasArticulos` es mixta:
**15263 filas de catálogo y 12689 documentales excluidas, 27952 en total**.
Los conteos por modelo usan únicamente catálogo, sin adoptar despieces
históricos como entradas. La presencia de filas relacionadas no acredita que
sus reglas estén interpretadas ni que el precio esté completo.

## Verificación y revisión independiente

17 pruebas sintéticas aprobadas, sin omisiones. Cubren fuentes diferentes,
familias vacías/desconocidas, auxiliares, identidad ambigua, separación de
documentos, procedencia y la distinción entre dibujo y capacidad operativa.

La primera revisión detectó contaminación documental en el recuento auxiliar
de EstructurasArticulos y columnas de variantes no exigidas por el lector.
Corregido en una ronda: se separan las filas documentales, se exige TipoDoc en
la tabla mixta y todos los campos empleados por las guardas del lector de
diseño. Una exportación incompleta falla explícitamente; no acredita ausencia
de curvas, omisiones de perfil u otras variantes.

Pruebas causales medidas, restaurando los archivos antes del gate:

- Retirar exclusión documental del diseño: 1 fallo.
- Omitir modelos sin árbol: 4 fallos.
- Retirar identidad de fuente para aplicar evidencia: 1 fallo.
- Retirar exclusión documental de artículos: 1 fallo.
- Retirar requisitos de columnas de variantes: 5 fallos.

Logs bajo `output/catalogo-completo/causal-*.log`; restaurado final: 17/17.
`git check-ignore` confirma que matriz y resumen no se versionan. Los hashes
de procedencia incluyen el traductor, sus módulos, catálogo, lector CSV y
scripts de inventario. No se ejecutó DB, build, suite global ni navegador en
esta unidad; corresponden al gate coordinado del lote.

## Reproducir y continuar

Adenda de contrato, evidencia operativa: admitir un JSON local explícito por
fuente exacta y modelo; validar referencias a pruebas existentes y conservar
su alcance. Separar dibujo, edición y persistencia de valoración bloqueada o
incompleta. Rechazar fuentes/códigos ajenos y afirmaciones de fabricación o
verificación económica independiente que este esquema no acredita. La carga
de evidencia no ejecuta de nuevo las pruebas ni modifica el catálogo operativo.

Implementado `--evidencias`: identifica la fuente mediante el valor exacto
`fuentes[0].fuente.id` del resumen, admite solo códigos conocidos y sin
ambigüedad, y rechaza duplicados. Registra hash del JSON y de cada archivo de
prueba. Las rutas se resuelven desde la raíz del repositorio; deben ser archivos
locales existentes y no vacíos. Las capacidades no presentes en la evidencia
de otro modelo conservan su estado sin verificar.

Formato exacto, con una entrada por modelo y el alcance real de los casos:

```json
{
  "version": 1,
  "fuenteId": "COPIAR_IDENTIDAD_EXACTA_DEL_RESUMEN",
  "modelos": [
    {
      "codigo": "03H",
      "alcance": "Medidas y configuraciones concretas verificadas en QA",
      "dibujo": {
        "estado": "verificado-en-casos",
        "pruebas": ["output/ruta-real/dibujo.json"]
      },
      "edicion": {
        "estado": "verificado-en-casos",
        "pruebas": ["output/ruta-real/edicion.json"]
      },
      "persistencia": {
        "estado": "verificado-en-casos",
        "pruebas": ["output/ruta-real/reapertura.json"]
      },
      "valoracion": {
        "estado": "bloqueada",
        "contraste": "mismo-motor",
        "pruebas": ["output/ruta-real/valoracion.json"],
        "bloqueos": ["Motivo concreto observado"]
      },
      "fabricacion": false
    }
  ]
}
```

El esquema no admite campos adicionales. Dibujo, edición y persistencia
admiten `sin-verificar` o `verificado-en-casos`; el segundo exige pruebas.
Valoración admite `sin-verificar`, `bloqueada` e `incompleta`; las dos últimas
exigen motivos y pruebas. El contraste admite `ninguno` o `mismo-motor`.
Comparar CSV y DB con el mismo motor no se marca como prueba independiente.
Fabricación exige `false`; este registro no certifica fabricación ni precio
independiente. Incluso con prueba positiva, la matriz mantiene su alcance
de casos concretos y separa disponibilidad del código de evidencia ejecutada.

Pruebas tras esta ampliación: **27/27**, incluidas diez del nuevo lector.
Causal anular la carga: **8 fallos de 10**; retirar la guarda de fabricación:
**1 fallo de 10**. Restauración final: **27/27**. Logs en
`output/catalogo-completo/causal-evidencias-*.log` y
`output/catalogo-completo/evidencias-restaurado.log`.

```powershell
node --import tsx --test scripts/catalogo-completo/*.test.mjs
node --import tsx scripts/catalogo-completo/inventario.mjs
# Con evidencia operativa real preparada por el responsable de QA:
node --import tsx scripts/catalogo-completo/inventario.mjs --evidencias output/ruta-real/evidencias.json
git check-ignore output/catalogo-completo/matriz.json output/catalogo-completo/resumen.json
```

Sin argumentos se recorren `export_datos` y `output` buscando las tres tablas.
Se pueden pasar carpetas CSV explícitas. `PRODUCTOR_INVENTARIO_RUTA` permite
elegir otra raíz de instalación para metadatos; nunca abre sus MDB.

- **Ahora:** verificar operativamente las seis nuevas plantillas de fijos;
  mantener pendientes las correderas cotadas hasta consumir cotaFija al editar;
  investigar reglas de componentes con el detalle de bloqueos de la matriz.
- **Después:** comparar bibliotecas/años mediante copias verificadas y completar
  configuración propia de auxiliares; no forzarlos a ser ventanas.
- **Experimental:** nuevas hojas, marcos, curvas o nodos especiales sin semántica
  contrastada. Nombre y código no bastan para activarlos.
