import type { Track, TrackId } from '../types'

type RoadmapProps = {
  track: Track
  tracks: Track[]
  known: Set<string>
  onOpen: (moduleId: string) => void
  onSwitchTrack: (id: TrackId) => void
}

export function Roadmap({ track, tracks, known, onOpen, onSwitchTrack }: RoadmapProps) {
  const modules = track.modules
  return (
    <div className="animate-fadeInUp space-y-3">
      <div className="mb-2 flex gap-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSwitchTrack(t.id)}
            className={`btn ${track.id === t.id ? 'border-agent/50 text-agent' : ''}`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100" style={{ color: track.accent }}>
          {track.title}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {track.subtitle} · {modules.length} модулей · {track.totalCards} карточек · работает офлайн
        </p>
      </div>

      {modules.map((module, index) => {
        const done = module.cards.filter((card) => known.has(card.id)).length
        const total = module.cards.length
        const complete = done === total
        const percent = Math.round((done / total) * 100)

        return (
          <button
            key={module.id}
            type="button"
            onClick={() => onOpen(module.id)}
            className="panel group flex w-full items-center gap-4 p-4 text-left transition-colors
                       duration-150 hover:border-slate-600 hover:bg-white/[0.03]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-agent/60"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono
                         text-sm"
              style={{
                borderColor: `${module.color}55`,
                color: module.color,
                background: `${module.color}12`
              }}
            >
              {complete ? '✓' : index}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="truncate text-base font-medium text-slate-100">{module.title}</h2>
                <span className="ml-auto shrink-0 font-mono text-xs text-slate-500">
                  {done}/{total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${percent}%`, background: module.color }}
                />
              </div>
            </div>

            <span className="shrink-0 font-mono text-slate-600 transition-transform duration-150 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        )
      })}
    </div>
  )
}
