'use client'

export function BuscarUniones({ q }: { q: string }) {
  return <form onKeyDown={evento => {
    if (evento.key === 'F5') { evento.preventDefault(); document.getElementById('buscar-union')?.focus() }
  }}>
    <label>Buscar
      <input id="buscar-union" name="q" defaultValue={q} className="ml-2 rounded-md border px-3 py-2 text-sm"
        style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
    </label>
    <button type="submit" className="ml-2 rounded-md border px-3 py-2 text-sm">F5</button>
  </form>
}
