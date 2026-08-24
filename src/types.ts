export type Card = {
  id: string
  question: string
  answer: string
  example: string
}

export type Module = {
  id: string
  title: string
  order: number
  lesson: string
  color: string
  cards: Card[]
}

export type TrackId = 'devops' | 'english'

export type Track = {
  id: TrackId
  title: string
  subtitle: string
  accent: string
  modules: Module[]
  totalCards: number
}

export type Glossary = Record<string, string>
