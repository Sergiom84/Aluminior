/** Nombre ASCII seguro para Content-Disposition, conservando serie/número/revisión. */
export function nombreArchivoPresupuestoPdf(serie: string, numero: number, revision: number): string {
  return `presupuesto-${encodeURIComponent(serie)}-${numero}-revision-${revision}.pdf`
}
