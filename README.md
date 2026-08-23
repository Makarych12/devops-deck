# DevOps Deck

Офлайн-первое PWA для изучения DevOps с нуля: уроки простыми словами, интерактивные карточки
с 3D-флипом, локальный прогресс и опциональный ИИ-наставник.

## Что внутри

- **17 модулей, 281 карточка**: intro, linux, bash, net, git, docker, cicd, cloud, terraform, ansible, k8s, helm, db, web, obs, sre, sec
- **Полный офлайн**: весь учебный контент — статический JSON в бандле, приложение precache'ится Workbox
- **Прогресс в IndexedDB** (`idb`): «знаю»/«повторить» пишутся мгновенно, переживают перезагрузку без сети
- **Тултипы по терминам**: локальный глоссарий (`src/data/glossary.json`), работают всегда офлайн
- **ИИ-наставник (online-only)**: прямой fetch к Anthropic API из браузера, только если есть сеть и ваш ключ

## Запуск

```bash
npm install
npm run dev            # http://localhost:5173
npm run build && npm run preview   # прод-сборка + сервис-воркер
```

Service worker собирается только в прод-сборке, поэтому офлайн проверяйте через `preview`.

## Проверка офлайна

1. `npm run build && npm run preview`, открыть страницу, дать ей загрузиться.
2. DevTools → Network → Offline (или отключить Wi-Fi).
3. Перезагрузить страницу: roadmap, уроки, карточки, тултипы и прогресс работают.
4. Панель ИИ автоматически показывает баннер «офлайн-режим» с кнопкой «Повторить проверку».
5. Включить сеть обратно — панель ИИ возвращается сама (события `online`/`offline` + перепроверка раз в 30 с).

## ИИ-наставник

- Ключ вводится в «Настройки» и хранится **только в браузере** (IndexedDB), никуда не отправляется,
  кроме прямых запросов на `https://api.anthropic.com/v1/messages`.
- Запрос уходит с заголовком `anthropic-dangerous-direct-browser-access: true` (нужен для CORS из браузера),
  `max_tokens: 1000`, system-промт наставника и контекст текущей карточки.
- Модель по умолчанию — `claude-sonnet-4-5`, её можно поменять в настройках, если в вашем аккаунте
  доступно другое имя модели.
- Доступность сети определяется не только `navigator.onLine`, но и HEAD-пингом с таймаутом 2.5 с
  (`src/lib/network.ts`), иначе «wifi без интернета» ломал бы UI.

## Структура

```
src/
  data/modules/   по одному JSON на модуль (00-intro.json ... 16-sec.json)
  data/           glossary.json, index.ts (загружает модули через import.meta.glob)
  lib/            db.ts (idb), network.ts (пинг), anthropic.ts (клиент API)
  hooks/          useProgress.ts, useOnlineStatus.ts
  components/     Roadmap, LessonView, Deck, Flashcard, Term, RichText, TutorPanel, SettingsDialog
```

Термины в поле `answer` размечаются маркером `{{term:Термин}}` и рендерятся компонентом `Term`
с точечным подчёркиванием и тултипом из глоссария.

## Добавление контента

Создайте файл `src/data/modules/NN-<id>.json` с одним объектом по схеме `Module` из `src/types.ts`
(`id`, `title`, `order`, `lesson`, `color`, `cards[]`) — он подхватится автоматически через
`import.meta.glob` и появится в roadmap; прогресс и офлайн-кеш работают без дополнительных действий.

Проверка целостности контента (дубликаты id, пустые поля, термины без глоссария):

```bash
npm run check:content
```
