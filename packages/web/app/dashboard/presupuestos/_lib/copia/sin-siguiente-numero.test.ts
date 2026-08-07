/**
 * Guarda de ausencia (T.71.2): `EntradaCopia.siguienteNumero` ya no existe.
 * `copiarPresupuesto` reserva el número dentro de su propia transacción con
 * `_lib/numeracion/`, y ya no depende de un número que alguien calculó antes
 * de abrirla.
 *
 * Barre los ficheros REALES del directorio en vez de comprobar uno a mano:
 * si mañana aparece otro fichero que reintroduce el símbolo, esta prueba lo
 * ve sin que nadie tenga que acordarse de añadirlo a una lista.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('EntradaCopia ya no depende de siguienteNumero', () => {
  it('ningún fichero de _lib/copia lo referencia, salvo el preview puro documentado', () => {
    const dir = fileURLToPath(new URL('.', import.meta.url))
    const archivos = readdirSync(dir).filter((f) => f.endsWith('.ts'))
    // Confirma que el barrido examinó ficheros reales, no una lista vacía.
    expect(archivos.length).toBeGreaterThan(5)

    // `destino-documento.ts` conserva `ContextoNumeracion.siguienteNumero`
    // para un preview NO transaccional (ver su comentario): es la única
    // excepción documentada. `copiar-presupuesto.ts` y todo lo demás no debe
    // volver a depender de él.
    const excepcionesDocumentadas = new Set([
      'destino-documento.ts', 'destino-documento.test.ts',
      'sin-siguiente-numero.test.ts', // esta prueba menciona el símbolo por su propio nombre
    ])
    const conSimbolo = archivos
      .filter((f) => !excepcionesDocumentadas.has(f))
      .filter((f) => readFileSync(`${dir}/${f}`, 'utf8').includes('siguienteNumero'))

    expect(conSimbolo).toEqual([])
  })
})
