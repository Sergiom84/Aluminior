import { PLANTILLAS_DISENO } from './catalogo.ts'
import type { PlantillaDiseno } from './tipos.ts'

/**
 * Catálogo de diseño disponible: las plantillas verificadas a mano más las
 * generadas desde el catálogo importado. Una plantilla verificada nunca se
 * sustituye por una generada con el mismo código.
 *
 * El servidor registra lo leído de la base y el navegador lo recibe ya
 * generado; ambos deben registrarlo antes de validar o dibujar
 * configuraciones que usen estructuras del catálogo ampliado.
 */
const normalizar = (codigo: string) => codigo.trim().toUpperCase()

const VERIFICADAS = new Map(PLANTILLAS_DISENO.map((plantilla) => [plantilla.codigo, plantilla]))
let ampliadas = new Map<string, PlantillaDiseno>()
let disponibles: readonly PlantillaDiseno[] = PLANTILLAS_DISENO

/** Sustituye el catálogo ampliado completo; las verificadas se conservan. */
export function registrarCatalogoDiseno(plantillas: readonly PlantillaDiseno[]): void {
  const siguiente = new Map<string, PlantillaDiseno>()
  for (const plantilla of plantillas) {
    const codigo = normalizar(plantilla.codigo)
    if (!VERIFICADAS.has(codigo) && !siguiente.has(codigo)) siguiente.set(codigo, plantilla)
  }
  ampliadas = siguiente
  disponibles = [...PLANTILLAS_DISENO, ...siguiente.values()]
}

export function plantillaDiseno(codigo: string): PlantillaDiseno | null {
  const normalizado = normalizar(codigo)
  return VERIFICADAS.get(normalizado) ?? ampliadas.get(normalizado) ?? null
}

export function plantillasDisponibles(): readonly PlantillaDiseno[] {
  return disponibles
}

export function plantillaVerificada(codigo: string): boolean {
  return VERIFICADAS.has(normalizar(codigo))
}
