const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '..', 'src', 'data')
const dir = path.join(base, 'modules')

const mods = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .sort((a, b) => a.order - b.order)

const glossary = JSON.parse(fs.readFileSync(path.join(base, 'glossary.json'), 'utf8'))
const keys = new Set(Object.keys(glossary).map((k) => k.toLowerCase()))

let errors = 0
const fail = (msg) => {
  console.error('ERROR:', msg)
  errors++
}

console.log(`modules ${mods.length}, cards ${mods.reduce((s, m) => s + m.cards.length, 0)}`)
for (const m of mods) {
  console.log(`${String(m.order).padStart(2)} ${m.id.padEnd(10)} ${String(m.cards.length).padStart(3)} карточек`)
}

const seen = { id: new Set(), order: new Set(), card: new Set() }
for (const m of mods) {
  if (seen.id.has(m.id)) fail(`дубликат module id: ${m.id}`)
  if (seen.order.has(m.order)) fail(`дубликат order: ${m.order}`)
  seen.id.add(m.id)
  seen.order.add(m.order)
  if (!m.title || !m.lesson || !/^#[0-9A-Fa-f]{6}$/.test(m.color)) fail(`некорректные поля модуля ${m.id}`)

  for (const c of m.cards) {
    if (seen.card.has(c.id)) fail(`дубликат card id: ${c.id}`)
    seen.card.add(c.id)
    if (!c.question || !c.answer || !c.example) fail(`пустое поле в карточке ${c.id}`)
    for (const match of c.answer.matchAll(/\{\{term:([^}]+)\}\}/g)) {
      if (!keys.has(match[1].toLowerCase())) fail(`термин без глоссария: "${match[1]}" (${c.id})`)
    }
  }
}

console.log(`glossary ${Object.keys(glossary).length} терминов`)
if (errors > 0) {
  console.error(`\nпроверка не пройдена: ${errors} ошибок`)
  process.exit(1)
}
console.log('\nпроверка пройдена')
