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

export type Glossary = Record<string, string>
