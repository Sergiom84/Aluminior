# B1: corrección conjunta de manos y manillas

## Base y contexto
Repositorio vigente C:/Users/laral/Documents/Aluminior, rama
feat/cerramientos-editor-linea. Base de implementación dca402fb986b93533c54f12b9cba3d4c7dff080c,
descendiente de a77abc3, edfc346, f4ca3a6 y3bbe321. Tarea GPT-5.6 Sol
01a0ba1f-1b04-70e2-9c52-3b05b74904cc, worktree
C:/Users/laral/Documents/Aluminior-worktrees/manos-manillas-0017,
rama codex/manos-manillas-0017. El proyecto guardado de Codex apunta a una
copia OneDrive anterior: no usarla para implementación o integración.

Leer AGENTS.md, CLAUDE.md, EVIDENCIA-MANOS-0017.md y EVIDENCIA-COTAS-0017.md.
La especificación inicial se amplió con evidencia directa durante la tarea,
antes de su cierre. Este texto consolida las adendas comunicadas a Sol.

## Evidencia final de manos
Lados en la vista predeterminada mostrada por Productor, no una afirmación de
perspectiva de cámara. No se ha probado apertura Exterior.

| Caso | Hojas móviles, izquierda a derecha | Manillas |
| --- | --- | --- |
| 1OD | oscilo, bisagra derecha | izquierda |
| 1OI | oscilo, bisagra izquierda | derecha |
| 2 | abatible izquierda / abatible derecha | solo hoja derecha, al encuentro |
| 2O | abatible izquierda / oscilo derecha | solo hoja derecha, al encuentro |
| 1OFI | oscilo, bisagra izquierda | derecha |
| 2O+ FIJO | abatible izquierda / oscilo derecha | solo hoja derecha, al encuentro |
| 1O1FL | oscilo, bisagra derecha; fijo a su derecha | izquierda |

Las otras siete plantillas conservan su aspecto físico anterior: cuatro fijos;
1O2FL bisagra derecha;1O+1F+1O y1O+2F+1O bisagras izquierda/derecha y dos manillas.
Esto es regresión conservadora, no certificación de paridad de esos casos.

## Alcance y propiedad
Sol posee solo modelo visual de core y consumidores web/PDF:
- packages/core/src/estructuras/diseno.ts, diseno-catalogo.ts, index.ts,
  nuevo helper pequeño de geometría de apertura y pruebas locales relacionadas.
- packages/web/app/dashboard/presupuestos/[id]/_components/dibujo-estructura.tsx
  y módulos/tests locales cohesivos.
- packages/web/app/dashboard/presupuestos/[id]/pdf/geometria-cerramiento.ts,
  dibujo-cerramiento.tsx y pruebas relacionadas.
- Controles de catálogo afectados por semántica de etiquetas, sin borrar
  diferencias geométricas pendientes ni ampliar las 14 estructuras operativas.
Arquitecto posee evidencias/relevo/especificación y control exclusivo del escritorio.
No DB, acciones de presupuesto, precios, motor, migraciones, secretos, cargas,
push, merge o integración propia. No leer/copiar env.example ni .env.
No cambiar package*.json. Dependencias propias con resolución de core al worktree.

## Contrato técnico
1. Sufijo de AperturaVisual = lado físico de bisagras. Helper puro público
   compartido por web/PDF para lados y trazos; sin duplicar inversión local.
2. Modelar presencia de manilla explícitamente por hueco, compatible por defecto
   con las otras plantillas. No inferirla del id/código en renderer ni de división
   invisible. Fijo siempre sin accesorios. Propagar y tipar en HuecoColocado.
3. Corregir los siete casos de tabla simultáneamente en modelo/web/PDF. Ajustar
   etiquetas de restantes plantillas para conservar dibujo físico anterior.
4. Generador experimental: tipos5/6 derecha/izquierda; pares7/8 bisagras exteriores.
   No generalizar supresión de manilla de parejas a candidatas no observadas.
   Las firmas actuales del control omiten manilla: documentar límite; una firma
   coincidente NO demuestra igualdad visual completa ni habilita candidatas.
5. PDF incluye bisagras y manilla sobre borde de hoja, nunca dentro del vidrio;
   tamaños gráficos limitados por hueco pequeño. Triángulos usan rect de vidrio.
   Web compacta puede seguir omitiendo accesorios con triángulos correctos.
6. No cambiar medidas/proporciones/cotas, interacción, selección, teclado,
   textos, estados ni layout. No microcopy de ayuda ni afirmaciones de paridad.
7. Configuraciones v1 se reconstruyen corregidas; decisión retrospectiva explícita,
   sin migración/escritura ni revisión económica. PDF ya emitidos no se reescriben.

## Pruebas y aceptación
- Expected independiente de coordenadas físicas de siete casos; conteo y lado
  de manillas, triángulos oscilo por hoja, fijos sin herrajes.
- Regresión de otras siete plantillas: lados, geometría interior, proporciones,
  medidas y separadores preservados. No calcular expected con el mismo helper.
- Render real web SVG y PDF o árbol real de primitivas, además del helper.
  Probar accesorios sobre hoja, atributo transmitido y ausencia de inversión.
- JSON v1 literal antiguo sigue válido, conserva medidas/configuración serializada;
  snapshot económico y persistencia no cambian.
- Golden del generador actualizados por evidencia, sin falsear diferencias
  restantes ni omisión de manillas en firmas.
- Tests relevantes core/web, typechecks ambos y git diff --check. Tests visuales
  web con configuración unitaria local sin globalSetup de migración PostgreSQL.
- Artefactos sintéticos locales de web escritorio/móvil y PDF. El arquitecto
  revisa en navegador y renderiza PDF; Sol no controla UI ni inicia otra web3001.
- Entrega commit local limpio, resultados, artefactos ignorados y límites;
  responsable revisa diff/pruebas y devuelve correcciones antes de integrar.

## Límites que deben permanecer visibles
Productor:1OFI900x1500,1O1FL1200x1200,2O+ FIJO1200x1200. Aluminior conserva en
B1 sus medidas800x1500,1100x1200,1200x1500 respectivamente; las cotas FI/F300
son variables observadas, falta segundo tamaño. No declarar equivalencia integral.
No activar candidatas por dibujo. Despiece, tarifa, vidrio, herraje y precio
siguen sujetos a su propia evidencia; los888 casos permanecen pendientes.
