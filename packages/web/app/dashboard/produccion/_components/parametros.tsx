export interface ConsultaParametros { barra?: string; kerf?: string; inicial?: string; final?: string }
export function FormularioParametros({ consulta }: { consulta: ConsultaParametros }) {
  return <form className="my-4 flex flex-wrap items-end gap-3 rounded-md border p-3" style={{ borderColor: 'var(--al-border)' }}>
    {([['barra', 'Barra (mm)', '6000'], ['kerf', 'Kerf (mm)', '0'],
      ['inicial', 'Saneamiento inicial (mm)', '0'], ['final', 'Saneamiento final (mm)', '0']] as const).map(([nombre, etiqueta, defecto]) =>
      <label key={nombre} className="text-sm"><span className="mb-1 block">{etiqueta}</span>
        <input name={nombre} defaultValue={consulta[nombre] ?? defecto} type="number" step="any" min={nombre === 'barra' ? '0.001' : '0'} required
          className="w-40 max-w-full rounded border px-3 py-2" style={{ background: 'var(--al-surface)', borderColor: 'var(--al-border-strong)' }} />
      </label>)}
    <button type="submit" className="rounded px-4 py-2 text-sm" style={{ background: 'var(--al-accent)', color: 'var(--al-accent-contrast)' }}>Recalcular</button>
  </form>
}
