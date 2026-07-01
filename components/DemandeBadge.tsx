type Statut = 'en_attente' | 'validee' | 'rejetee'

const CONFIG: Record<Statut, { label: string; bg: string; text: string }> = {
  en_attente: { label: 'En attente',  bg: 'bg-amber-100',  text: 'text-amber-700' },
  validee:    { label: 'Validee',     bg: 'bg-green-100',  text: 'text-green-700' },
  rejetee:    { label: 'Rejetee',     bg: 'bg-red-100',    text: 'text-red-700'   },
}

export default function DemandeBadge({ statut }: { statut: string }) {
  const cfg = CONFIG[statut as Statut] ?? { label: statut, bg: 'bg-slate-100', text: 'text-slate-600' }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}
