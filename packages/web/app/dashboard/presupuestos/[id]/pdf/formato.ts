export const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
export const fmtFecha = (fecha: string | null) => fecha ? new Date(fecha).toLocaleDateString('es-ES') : ''
