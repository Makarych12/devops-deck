# DevOps Deck

Офлайн-первое PWA для изучения DevOps и English for IT: уроки простыми словами, интерактивные карточки
с 3D-флипом, копируемые команды, локальный прогресс и опциональный ИИ-наставник (Gemini / OpenRouter).

## Что внутри

- **2 трека, 27 модулей, 409 карточек**:
  - **DevOps** (17 модулей, 281 карточка): intro, linux, bash, net, git, docker, cicd, cloud, terraform, ansible, k8s, helm, db, web, obs, sre, sec
  - **English for IT** (10 модулей, 128 карточек): core vocab, verbs, standup, chat, meetings, emails, code review, interviews, incidents, negotiation
- **Копируемые команды**: клик по строке кода копирует её, кнопка «копировать всё» — весь блок
- **Полный офлайн**: весь учебный контент — статический JSON в бандле, приложение precache'ится Workbox
- **Прогресс в IndexedDB** (`idb`): «знаю»/«повторить» пишутся мгновенно, переживают перезагрузку без сети
- **Тултипы по терминам**: локальный глоссарий (`src/data/glossary.json`), работают всегда офлайн
- **ИИ-наставник (online-only)**: Gemini API или OpenRouter — на выбор, с переключением между провайдерами

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

- Поддерживаются два провайдера: **Google Gemini** и **OpenRouter**. Переключение — прямо в панели наставника.
- Ключи вводятся в «Настройки» и хранятся **только в браузере** (IndexedDB), никуда не отправляются,
  кроме прямых запросов к API выбранного провайдера.
- Gemini: бесплатный ключ через [Google AI Studio](https://aistudio.google.com). Модель по умолчанию — `gemini-2.0-flash`.
- OpenRouter: ключ через [openrouter.ai](https://openrouter.ai), доступы сотни моделей. Модель по умолчанию — `google/gemini-2.0-flash-exp:free`.
- Модели можно поменять в настройках под свой аккаунт.
- Доступность сети определяется не только `navigator.onLine`, но и HEAD-пингом с таймаутом 2.5 с
  (`src/lib/network.ts`), иначе «wifi без интернета» ломал бы UI.

## Структура

```
src/
  data/modules/   DevOps: по одному JSON на модуль (00-intro.json ... 16-sec.json)
  data/english/   English for IT: по одному JSON на модуль (00-core.json ... 09-negotiation.json)
  data/           glossary.json, index.ts (загружает треки через import.meta.glob)
  lib/            db.ts (idb), network.ts (пинг), ai.ts (Gemini / OpenRouter клиент)
  hooks/          useProgress.ts, useOnlineStatus.ts
  components/     Roadmap, LessonView, Deck, Flashcard, CodeBlock, Term, RichText, TutorPanel, SettingsDialog
```

Термины в поле `answer` размечаются маркером `{{term:Термин}}` и рендерятся компонентом `Term`
с точечным подчёркиванием и тултипом из глоссария.

## Добавление контента

Создайте файл `src/data/modules/NN-<id>.json` (DevOps) или `src/data/english/NN-<id>.json` (English)
с одним объектом по схеме `Module` из `src/types.ts`
(`id`, `title`, `order`, `lesson`, `color`, `cards[]`) — он подхватится автоматически через
`import.meta.glob` и появится в roadmap соответствующего трека; прогресс и офлайн-кеш работают без дополнительных действий.

Проверка целостности контента (дубликаты id, пустые поля, термины без глоссария):

```bash
npm run check:content
```
