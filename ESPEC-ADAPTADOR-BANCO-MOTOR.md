# A: contrato local del adaptador de diagnóstico del motor

## Contexto y base comprobada
19/09/2026. Repositorio vigente: C:/Users/laral/Documents/Aluminior.
Rama feat/cerramientos-editor-linea, base edfc346bace77a7b14fa1b0ed0c5b3b1f76650db,
descendiente de f4ca3a6 y 3bbe321. La copia OneDrive es anterior y no se modifica.
env.example es ajeno, no leer/copiar/versionar. Los datos reales y output quedan fuera de Git.
El usuario ha autorizado una tarea nueva GPT-5.6 Sol, aislada, para implementar lo definido.
No autoriza cargas remotas, merge a main, Productor ni cambios de dominio inferidos.

Leer AGENTS.md, CLAUDE.md, RELEVO-SIGUIENTE-SESION.md apartado A,
BANCO-COMPARACION-PRECIOS.md y arquitectura §6. Antes de código, comprobar HEAD
contra el commit que contiene esta especificación (indicado en el mensaje de tarea).

## Evidencia y límites
- scripts/lib/banco-precios.mjs conserva el banco v1 y compararCaso. La firma
  de componentes incluye precio, descuentos y banderas: no separa material/precio.
- calcularDespiece y valorarDespiece son APIs públicas de core. La valoración
  agrupa por artículo; no permite repartir importes por hija histórica.
- materiales-estructura.ts pasa siempre resolver de rebajes y trata UD sin fórmula
  como unidad, no como perfil incalculable. No omitir resolver de rebajes.
- resolverPvpCatalogo distingue RESUELTO, SIN_PRECIO y AMBIGUO.
- Los 888 casos reales siguen sin vidrio/tarifa/modo plenamente verificados.
  Ninguno se convierte en comparable por esta entrega.
- Investigación A: las cuatro muestras del contraejemplo GMA65OHS/3HO declaran
  DisEspecificoSN=True. El banco de candidatas no contiene 3HO. No inferir
  comportamiento de plantilla ni regla de herraje a partir de esas muestras.

## Objetivo acotado
Añadir un adaptador PURO de diagnóstico local con entradas preparadas explícitas
y fixtures sintéticos. Ejecutar realmente core para cortes e importe de materiales.
No reproduce aún toda la valoración web ni certifica paridad Productor.
No crear CLI que recorra los casos reales, no modificar sus motivos ni regenerar banco.

## Propiedad de archivos
Sol: crear exclusivamente scripts/lib/banco-motor/ (tipos, validación, ejecución,
proyección/comparación física, index público) y scripts/banco-motor.test.ts.
Puede añadir scripts/tsconfig.banco-motor.json para comprobación estricta.
Responsable principal: esta especificación y documentos de evidencia/relevo.
No tocar core/web/db/etl, migraciones, package*.json, banco v1 ni otros scripts.
Importar core por @aluminior/core/despiece y @aluminior/core/precios.
Archivos cohesivos, preferiblemente menos de 250 líneas; dividir responsabilidades.

## Contrato
Exportar ejecutarDiagnosticoMotor y compararMateriales (nombres equivalentes documentados
son aceptables). Tipos explícitos, sin any. Sin I/O, SQL, red, entorno o imports de web.

Entrada preparada distinta del banco bruto:
- Configuración técnica original conservada: código, las cuatro posiciones de serie,
  dos acabados, medidas mm, cantidad comercial, opciones, acristalamiento y ajustes;
  no deducir serie operativa por primera posición ni perder otras posiciones.
- Contexto material: serie resuelta explícita, plantilla de artículos reales,
  cotas explícitas, metadatos ML/UD, tabla de rebajes por artículo/función/fórmula/serie,
  y referencias de procedencia no vacías. Alcance siempre "materiales-parciales".
- Declaración expresa de diseño específico no reconstruido, herraje desconocido,
  vidrio/superficie requerido y ajustes manuales: bloquean entrada en esta versión.
  Ausencia de declaración/configuración también bloquea; nunca asumir false/0.
- Contexto precio opcional: tarifa identificada, fecha de referencia y vigencia
  explícita válida para esa fecha, modo "despiece", acabado aplicado identificado,
  filas PVP por artículo y tarifa. No usar tarifa 1 por defecto ni otra vigencia.
  Sin contexto de precio puede calcularse material, con importe null.

Salida:
- Entrada/procedencia inalteradas, alcance limitado, materiales y precio independientes.
- Materiales: piezas del motor, incidencias y avisos preservados; estado incompleto
  si faltan cotas/cortes/reglas. UD sin fórmula permitido conforme al caso web;
  UD con fórmula fallida queda incompleto. No borrar incidencias de perfiles.
- Precio: solo importe de materiales por UNA composición, no precio comercial ni
  importe de la línea histórica. Cantidad comercial permanece trazada, no multiplicar
  silenciosamente ni exponer un total comercial. Null si falta precio, es ambiguo,
  hay material incompleto, desbordamiento, contexto inválido o campo no soportado.
- Separar avisos de reglas de rebaje no exactas; nunca declarar certificación.
  Una suma parcial del motor no es importe válido.
- Paridad comercial no verificada en TODOS los resultados.

Validar antes de delegar al core: dimensiones y cantidad finitas positivas;
cantidades de plantilla explícitas finitas positivas (evitar default 1);
cotas finitas y no permitir redefinir A/L; catálogo no ambiguo por código;
metrajes ML/UD solamente; mínimos/múltiplos explícitos null o finitos no negativos;
plantilla no vacía; rechazar rangos condicionales activos porque su semántica
no está verificada; rebajes no negativos finitos con muestras válidas y claves únicas.
Pasar siempre callback rebaje: sin regla HV/HH devuelve null, nunca cero.
Validar precios no negativos finitos; resolver PVP con API existente y conservar
ambigüedad/ausencia. Validar resultados finitos también, no solo entradas.
No normalizar números españoles aquí: son entradas normalizadas tipadas.

## Comparación física parcial
Comparar resultados preparados del mismo contrato, no traducir hijas históricas
sin evidencia de mapeo. Exigir configuración/contexto material idénticos
(sin depender del orden de claves); cambios económicos no cambian igualdad física.
Material incompleto/entrada distinta produce estado explícito no comparable.
Comparar multiconjunto de artículo, función, cantidad, largoMm, tipo de corte,
ángulos; devolver piezas faltantes/sobrantes con multiplicidad y cambios concretos.
Explicitar campos excluidos (ancho, acabado por pieza, vidrio, herraje íntegro,
metraje facturado, precios) y advertir que igualdad parcial no es despiece completo igual.
No fabricar valores de campos ausentes ni reutilizar componentes históricos como cálculo.

## Aceptación y pruebas
Fixtures 100% ficticios, sin catálogo real:
1. ML con mínimo/múltiplo + UD sin fórmula: cortes/importe esperado independiente
   a mano y cantidad comercial 2 sin confundir unidad y línea.
2. Sin tarifa/contexto, precio ausente o ambiguo: cortes conservados e importe null.
3. Cota ausente y rebaje HV/HH ausente: incompleto; rebaje exacto modifica corte.
4. Rebaje no exacto conserva aviso, sin afirmar paridad.
5. Reordenar piezas mantiene igualdad; duplicar o cambiar cantidad/corte/ángulo difiere.
6. Cambiar únicamente PVP no afecta comparación física; configuración distinta bloquea.
7. Diseño específico pendiente, herraje desconocido, vidrio, ajustes, rangos y
   valores no finitos/negativos/contextos inválidos quedan bloqueados.
8. Entradas congeladas no se mutan. No alterar banco v1 ni motivos de casos.
9. Comprobar cero tratado como precio explícito válido, no como sustituto de ausente.
Ejecutar node --import tsx --test scripts/banco-motor.test.ts scripts/banco-precios.test.mjs.
Typecheck estricto del nuevo TS (config acotada) y npm run -w @aluminior/core typecheck.
Revisar git diff --check y status. No repetir suite/UI porque no cambia flujo operativo.
Entregar commit local, archivos, resultados y límites; no push, merge ni cherry-pick.
El arquitecto revisa diff/pruebas y pide correcciones antes de integrar en rama feature.
