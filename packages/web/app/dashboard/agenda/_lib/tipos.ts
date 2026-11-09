export interface EventoVista {
  id: string
  titulo: string
  dia: string
  horaInicio: string
  horaFin: string
  observaciones: string | null
}

export interface NotaVista {
  id: string
  texto: string
  observaciones: string | null
  urgencia: number
  hecha: boolean
  creadoEn: string
}
