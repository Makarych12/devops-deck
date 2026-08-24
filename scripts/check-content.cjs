const fs = require('fs')
const path = require('path')

const base = path.join(__dirname, '..', 'src', 'data')

function loadModules(subdir) {
  const dir = path.join(base, subdir)
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .sort((a, b) => a.order - b.order)
}

const devopsMods = loadModules('modules')
const englishMods = loadModules('english')
const mods = [...devopsMods, ...englishMods]

const glossary = JSON.parse(fs.readFileSync(path.join(base, 'glossary.json'), 'utf8'))
const keys = new Set(Object.keys(glossary).map((k) => k.toLowerCase()))

let errors = 0
const fail = (msg) => {
  console.error('ERROR:', msg)
  errors++
}

console.log(`DevOps: ${devopsMods.length} модулей, ${devopsMods.reduce((s, m) => s + m.cards.length, 0)} карточек`)
for (const m of devopsMods) {
  console.log(`  ${String(m.order).padStart(2)} ${m.id.padEnd(14)} ${String(m.cards.length).padStart(3)} карточек`)
}
console.log(`English: ${englishMods.length} модулей, ${englishMods.reduce((s, m) => s + m.cards.length, 0)} карточек`)
for (const m of englishMods) {
  console.log(`  ${String(m.order).padStart(2)} ${m.id.padEnd(14)} ${String(m.cards.length).padStart(3)} карточек`)
}
console.log(`Total: ${mods.length} модулей, ${mods.reduce((s, m) => s + m.cards.length, 0)} карточек`)

const seen = { id: new Set(), card: new Set() }
for (const m of mods) {
  if (seen.id.has(m.id)) fail(`дубликат module id: ${m.id}`)
  seen.id.add(m.id)
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
