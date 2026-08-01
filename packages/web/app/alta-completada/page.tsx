export default function AltaCompletadaPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--al-page)' }}
    >
      <section
        className="w-full max-w-md rounded-lg border p-8"
        style={{
          background: 'var(--al-surface)',
          borderColor: 'var(--al-border)',
          boxShadow: 'var(--al-shadow-lg)',
        }}
      >
        <h1 className="text-xl font-semibold tracking-tight">Has sido dado de alta</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--al-text-muted)' }}>
          Ya puedes cerrar esta ventana e iniciar sesión en Aluminior con tus credenciales.
        </p>
      </section>
    </main>
  )
}
