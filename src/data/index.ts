import type { Glossary, Module, Track, TrackId } from '../types'
import glossaryJson from './glossary.json'

function collect(files: Record<string, { default: Module }>): Module[] {
  return Object.values(files)
    .map((file) => file.default)
    .sort((a, b) => a.order - b.order)
}

const devopsModules = collect(
  import.meta.glob<{ default: Module }>('./modules/*.json', { eager: true })
)
const englishModules = collect(
  import.meta.glob<{ default: Module }>('./english/*.json', { eager: true })
)

const countCards = (list: Module[]) => list.reduce((sum, m) => sum + m.cards.length, 0)

export const tracks: Track[] = [
  {
    id: 'devops',
    title: 'DevOps с нуля',
    subtitle: 'инфраструктура, контейнеры, пайплайны и эксплуатация',
    accent: '#4FD1A5',
    modules: devopsModules,
    totalCards: countCards(devopsModules)
  },
  {
    id: 'english',
    title: 'English for IT',
    subtitle: 'лексика, фразы и грамматика для работы в англоязычной команде',
    accent: '#7DA9F2',
    modules: englishModules,
    totalCards: countCards(englishModules)
  }
]

export function getTrack(id: TrackId): Track {
  return tracks.find((track) => track.id === id) ?? tracks[0]
}

export const modules = devopsModules

export const glossary: Glossary = glossaryJson as Glossary

const glossaryIndex = new Map<string, string>(
  Object.entries(glossary).map(([term, def]) => [term.toLowerCase(), def])
)

export function lookupTerm(term: string): string | undefined {
  return glossaryIndex.get(term.trim().toLowerCase())
}

export const totalCards = countCards(devopsModules)
