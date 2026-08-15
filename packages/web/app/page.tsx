import { redirect } from 'next/navigation'

/** Entrada de la aplicación: lleva directamente a la superficie operativa. */
export default function Inicio() {
  redirect('/dashboard/presupuestos')
}
