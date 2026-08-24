import { useEffect, useMemo, useState } from 'react'
import { Deck } from './components/Deck'
import { LessonView } from './components/LessonView'
import { Roadmap } from './components/Roadmap'
import { SettingsDialog } from './components/SettingsDialog'
import { TutorPanel } from './components/TutorPanel'
import { getTrack, tracks } from './data'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useProgress } from './hooks/useProgress'
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Provider, type Settings } from './lib/db'
import type { TrackId } from './types'

type View = { screen: 'roadmap' } | { screen: 'lesson'; moduleId: string } | { screen: 'deck'; moduleId: string }

export default function App() {
  const [view, setView] = useState<View>({ screen: 'roadmap' })
  const [cardIndex, setCardIndex] = useState(0)
  const [trackId, setTrackId] = useState<TrackId>('devops')
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)

  const { known, markKnown, markRepeat, resetModule } = useProgress()
  const { online, checking, recheck } = useOnlineStatus()

  useEffect(() => {
    void loadSettings().then(setSettings)
  }, [])

  const track = useMemo(() => getTrack(trackId), [trackId])
  const trackModules = track.modules

  const activeModule = useMemo(() => {
    if (view.screen === 'roadmap') return null
    return trackModules.find((m) => m.id === view.moduleId) ?? null
  }, [view, trackModules])

  const activeCard =
    view.screen === 'deck' && activeModule ? activeModule.cards[cardIndex] ?? null : null

  const doneTotal = useMemo(
    () => trackModules.reduce((sum, m) => sum + m.cards.filter((c) => known.has(c.id)).length, 0),
    [known, trackModules]
  )
  const overallPercent = track.totalCards > 0 ? Math.round((doneTotal / track.totalCards) * 100) : 0

  const openModule = (moduleId: string) => {
    setCardIndex(0)
    setView({ screen: 'lesson', moduleId })
  }

  const startDeck = (moduleId: string) => {
    const module = trackModules.find((m) => m.id === moduleId)
    const firstUnknown = module?.cards.findIndex((c) => !known.has(c.id)) ?? 0
    setCardIndex(firstUnknown > 0 ? firstUnknown : 0)
    setView({ screen: 'deck', moduleId })
  }

  const persistSettings = (next: Settings) => {
    setSettings(next)
    void saveSettings(next)
    setSettingsOpen(false)
  }

  const switchProvider = (p: Provider) => {
    const next = { ...settings, provider: p }
    setSettings(next)
    void saveSettings(next)
  }

  const switchTrack = (id: TrackId) => {
    setTrackId(id)
    setView({ screen: 'roadmap' })
  }

  const tutor = (
    <TutorPanel
      online={online}
      checking={checking}
      settings={settings}
      card={activeCard}
      module={activeModule}
      onRecheck={() => void recheck()}
      onOpenSettings={() => setSettingsOpen(true)}
      onSwitchProvider={switchProvider}
    />
  )

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            className="flex items-center gap-2 font-display text-sm font-bold text-slate-100"
            onClick={() => setView({ screen: 'roadmap' })}
          >
            <span className="font-mono text-agent">&gt;_</span> DevOps Deck
          </button>

          <div className="ml-4 hidden flex-1 items-center gap-3 sm:flex">
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal to-agent transition-[width] duration-300"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs text-slate-500">
              {doneTotal}/{track.totalCards}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span
              className={`font-mono text-[11px] ${online ? 'text-teal' : 'text-amber'}`}
              title={online ? 'сеть доступна' : 'офлайн-режим обучения'}
            >
              {checking ? '…' : online ? 'online' : 'offline'}
            </span>
            <button
              type="button"
              className="btn px-3 py-1.5 text-xs"
              onClick={() => setSettingsOpen(true)}
            >
              Настройки
            </button>
          </div>
        </div>

        <div className="h-1 w-full bg-black/40 sm:hidden">
          <div
            className="h-full bg-gradient-to-r from-teal to-agent transition-[width] duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 pb-24 lg:pb-6">
        <main className="min-w-0 flex-1">
          {view.screen === 'roadmap' && (
            <Roadmap
              key={trackId}
              track={track}
              tracks={tracks}
              known={known}
              onOpen={openModule}
              onSwitchTrack={switchTrack}
            />
          )}

          {view.screen === 'lesson' && activeModule && (
            <LessonView
              module={activeModule}
              done={activeModule.cards.filter((c) => known.has(c.id)).length}
              onStart={() => startDeck(activeModule.id)}
              onBack={() => setView({ screen: 'roadmap' })}
              onReset={() => resetModule(activeModule.cards.map((c) => c.id))}
            />
          )}

          {view.screen === 'deck' && activeModule && (
            <Deck
              module={activeModule}
              index={Math.min(cardIndex, activeModule.cards.length - 1)}
              known={known}
              onIndexChange={setCardIndex}
              onKnow={markKnown}
              onRepeat={markRepeat}
              onBack={() => setView({ screen: 'lesson', moduleId: activeModule.id })}
            />
          )}
        </main>

        <aside className="hidden w-[340px] shrink-0 lg:block">
          <div className="panel sticky top-20 h-[calc(100vh-6.5rem)] overflow-hidden">{tutor}</div>
        </aside>
      </div>

      <button
        type="button"
        className="btn fixed bottom-4 right-4 z-40 border-agent/50 bg-panel text-agent shadow-xl lg:hidden"
        onClick={() => setTutorOpen(true)}
      >
        <span className="h-2 w-2 rounded-full bg-agent" /> ИИ-наставник
      </button>

      {tutorOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 lg:hidden" onClick={() => setTutorOpen(false)}>
          <div
            className="h-[78vh] w-full animate-sheetUp rounded-t-2xl border-t border-border bg-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-center py-2">
              <span className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="h-[calc(78vh-28px)]">{tutor}</div>
          </div>
        </div>
      )}

      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        onSave={persistSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
