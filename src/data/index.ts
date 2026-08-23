import type { Glossary, Module } from '../types'
import glossaryJson from './glossary.json'

const moduleFiles = import.meta.glob<{ default: Module }>('./modules/*.json', { eager: true })

export const modules: Module[] = Object.values(moduleFiles)
  .map((file) => file.default)
  .sort((a, b) => a.order - b.order)

export const glossary: Glossary = glossaryJson as Glossary

const glossaryIndex = new Map<string, string>(
  Object.entries(glossary).map(([term, def]) => [term.toLowerCase(), def])
)

export function lookupTerm(term: string): string | undefined {
  return glossaryIndex.get(term.trim().toLowerCase())
}

export const totalCards = modules.reduce((sum, m) => sum + m.cards.length, 0)
