/** Reglas de nombre de dibujo sin E/S: se usan también en el navegador. */
const NOMBRE = /^[^\/:*?"<>|]{1,80}\.(bmp|png|jpe?g|webp)$/i

export function nombreDibujoValido(archivo: string) {
  return NOMBRE.test(archivo) && !archivo.includes('..')
}

export function esDibujoUnion(nombre: string) {
  return /^(GMU\d+|PSU\d+|U)\.bmp$/i.test(nombre)
}
