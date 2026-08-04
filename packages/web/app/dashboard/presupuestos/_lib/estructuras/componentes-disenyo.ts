/**
 * Identidades de `DisComponente` que el sistema trata de forma especial.
 *
 * Son datos, no reglas: la clasificación que los usa vive en
 * `resolucion-perfiles.ts`. Están aquí porque los necesitan dos frentes —la
 * resolución de perfiles y la vía del acristalamiento— y tenerlos declarados en
 * cada uno era la forma rápida de que dejaran de coincidir.
 *
 * Extraídos de `acciones.ts` en T.69.4 SIN cambiar ningún código de la lista.
 */

/**
 * `DisComponente` de la ranura de CRISTAL. No la resuelve la serie: la elige
 * el usuario y se valora por la vía del acristalamiento (anexo J, paso 4).
 */
export const COMPONENTE_CRISTAL = '1'

/**
 * Herraje/asociado por `componente_disenyo` (anexo T.27).
 *
 * La heurística de `funcion` (`inf*`/`Acc*`) captura los asociados de mano de
 * obra e informes, pero deja fuera compases, mecanismos, cremonas y correderas,
 * que llevan `funcion` HV/HH igual que una hoja de perfil y por eso se colaban
 * en el bucket de PERFIL (inflando el aviso "N ranuras de perfil que la serie no
 * resuelve" con herraje que NUNCA se resuelve por ConjuntosLin). Es el mismo
 * defecto que T.22 corrigió para el cristal (componente '1').
 *
 * No hay señal estructural limpia en la plantilla que los separe (medido en
 * T.24–T.26 y en scripts/medir-criterio-herraje.mjs): StFabricadoSN, AsociadoA,
 * NoComputarCosteSN y Seccion son constantes en herraje Y en perfil; `funcion`
 * HV/HH solapa; y "artículo genérico" o "no resuelve por la cadena"
 * clasificarían como herraje cualquier perfil no resuelto —que es justo el hueco
 * que no se debe ocultar—. Por eso se hardcodea la lista medida: HERRAJE =
 * componente cuyas piezas de instancia son TODAS Articulo=0 en el oráculo (se
 * valoran por el frente de asociados, anexo S, no por perfil). La regla es
 * ADITIVA a la heurística de `funcion`: solo mueve herraje de perfil→asociado,
 * nunca a la inversa, así que no puede enmascarar un hueco de perfil real (un
 * código fuera de la lista sigue cayendo al aviso ruidoso de perfil: falla en la
 * dirección segura).
 *
 * Marcados (†) los de muestra fina (≤6 piezas en el oráculo): confianza menor,
 * pero coherentes con su familia (los OB, los EK…).
 */
export const COMPONENTES_HERRAJE = new Set<string>([
  // correderas
  '222', '223', '224', '225', '226', '227', '228', '229',
  // oscilobatiente (compás/mecanismo/cremona)
  'OBC', 'OBCR', 'OBM', 'OBP', 'OBPH',
  // proyectante
  'PRC', 'PRPH', 'PRPV',
  // eje / kit (EKEE†, EKEF†)
  'EKCC', 'EKEE', 'EKEF',
  // herrajes de hoja / cierres / mecanismos varios
  '39', '50', '51', '52', '53', '55', '56', '57', '58', '58R', '59',
  '71', '130', '133', '134', 'EHC', 'EHH', 'EHF', 'EHFH', 'EMBF',
  'CHC', 'CHH', 'JA', 'JB', 'JD', 'JI',
  // muestra fina (†, ≤6 piezas): 30, 116, 135, 139, 143, 51MA, EHF, EHFH, EKEE, EKEF
  '30', '116', '135', '139', '143', '51MA',
])
