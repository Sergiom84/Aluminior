/**
 * Opciones de compacto (COM001-COM017) de EstructurasOpcGrupos y
 * EstructurasOpcOpciones, EMP0016. La tabla cargada en la base que usa
 * la web está vacía: sin estas predeterminadas el despiece no decide la
 * guía y deja toda la ventana sin valorar.
 */
export interface OpcionCatalogoCompacto {
  opcion: number
  texto: string
  predeterminada: boolean
}
export interface GrupoCatalogoCompacto {
  grupo: number
  titulo: string
  opciones: readonly OpcionCatalogoCompacto[]
}
export const CATALOGO_OPCIONES_COMPACTO: Readonly<Record<string, readonly GrupoCatalogoCompacto[]>> = {
  COM001: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM002: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM003: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM004: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM005: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM006: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM007: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM008: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM009: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM010: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM011: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM012: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 2,40m2) (Seguridad 1,20m2) ILMO 6/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 4,40m2) (Seguridad 1,70m2) ILMO 10/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 6,60m2) (Seguridad 2,60m2) ILMO 15/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 2,40m2) (Seguridad 1,40m2) OXIMO IO 6/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 4,40m2) (Seguridad 1,70m2) OXIMO IO 10/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 6,60m2) (Seguridad 2,60m2) OXIMO IO 15/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM013: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 8,80m2) (Seguridad 3,50m2) ILMO 20/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 13m2) (Seguridad 5,30m2) ILMO 30/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 15,40m2) (Seguridad 6,20m2) ILMO 35/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 8,80m2) (Seguridad 3,50m2) OXIMO IO 20/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 13m2) (Seguridad 5,30m2) OXIMO IO 30/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 18m2) (Seguridad 7,10m2) OXIMO IO 40/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM014: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 8,80m2) (Seguridad 3,50m2) ILMO 20/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 13m2) (Seguridad 5,30m2) ILMO 30/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 15,40m2) (Seguridad 6,20m2) ILMO 35/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 8,80m2) (Seguridad 3,50m2) OXIMO IO 20/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 13m2) (Seguridad 5,30m2) OXIMO IO 30/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 18m2) (Seguridad 7,10m2) OXIMO IO 40/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM015: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 8,80m2) (Seguridad 3,50m2) ILMO 20/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 13m2) (Seguridad 5,30m2) ILMO 30/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 15,40m2) (Seguridad 6,20m2) ILMO 35/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 8,80m2) (Seguridad 3,50m2) OXIMO IO 20/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 13m2) (Seguridad 5,30m2) OXIMO IO 30/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 18m2) (Seguridad 7,10m2) OXIMO IO 40/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM016: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [{ opcion: 0, texto: "Recogedor", predeterminada: true }, { opcion: 2, texto: "MOTOR + PULSADOR (Termica 8,80m2) (Seguridad 3,50m2) ILMO 20/17", predeterminada: false }, { opcion: 3, texto: "MOTOR + PULSADOR (Termica 13m2) (Seguridad 5,30m2) ILMO 30/17", predeterminada: false }, { opcion: 4, texto: "MOTOR + PULSADOR (Termica 15,40m2) (Seguridad 6,20m2) ILMO 35/17", predeterminada: false }, { opcion: 5, texto: "MOTOR VIA RADIO (Termica 8,80m2) (Seguridad 3,50m2) OXIMO IO 20/17", predeterminada: false }, { opcion: 6, texto: "MOTOR VIA RADIO (Termica 13m2) (Seguridad 5,30m2) OXIMO IO 30/17", predeterminada: false }, { opcion: 7, texto: "MOTOR VIA RADIO (Termica 18m2) (Seguridad 7,10m2) OXIMO IO 40/17", predeterminada: false }] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
  COM017: [
    { grupo: 1, titulo: "Guía Central", opciones: [{ opcion: 0, texto: "NO", predeterminada: true }, { opcion: 1, texto: "SI", predeterminada: false }] },
    { grupo: 2, titulo: "Rec.Vuelo Izda.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 3, titulo: "Rec.Vuelo Dcha.", opciones: [{ opcion: 1, texto: "SI", predeterminada: false }, { opcion: 2, texto: "NO", predeterminada: true }] },
    { grupo: 10, titulo: "Accionamiento", opciones: [] },
    { grupo: 14, titulo: "Salida Accionamiento", opciones: [] },
    { grupo: 50, titulo: "Cajón Despiece", opciones: [] },
  ],
}
