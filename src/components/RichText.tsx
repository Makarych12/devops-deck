import { Fragment, type ReactNode } from 'react'
import { Term } from './Term'

const TERM_RE = /\{\{term:([^}]+)\}\}/g

export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  TERM_RE.lastIndex = 0
  while ((match = TERM_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>)
    }
    nodes.push(<Term key={key++} term={match[1]} />)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>)
  }

  return <>{nodes}</>
}
