# Teacher Chat UI — Hitesh / Piyush persona chat

Drop-in frontend for a Next.js (App Router) + TypeScript + shadcn/ui project.
No backend logic included — `lib/send-message.ts` is the single seam where
you wire up the real LLM call.

## 1. Install shadcn components used here

```bash
npx shadcn@latest add button avatar textarea scroll-area separator sheet
```

Also install icons and class helpers if not already present:

```bash
npm install lucide-react clsx tailwind-merge
```

## 2. Copy files into your project

```
app/globals.css        → replace your existing theme file (or merge the CSS vars)
app/page.tsx           → renders <ChatScreen />
components/chat/*      → all chat UI components
hooks/use-chat-store.ts→ conversation state (per-persona chats, active chat, typing)
lib/types.ts           → shared types
lib/personas.ts        → Hitesh & Piyush profile data + avatars
lib/send-message.ts    → replace the mock body with your real API call
lib/utils.ts           → cn() helper (skip if you already have one)
```

Add real avatar images at `public/personas/hitesh.png` and
`public/personas/piyush.png` (falls back to initials if missing).

## 3. Wire the real AI backend

Everything in the UI calls `sendMessage(personaId, history)` from
`lib/send-message.ts`. Replace the mock block inside that function with a
`fetch("/api/chat", ...)` call (or your existing backend) and return
`{ content: string }`. No other file needs to change.

## What's included

- **Two personas, one shell** — sidebar cards switch between Hitesh Choudhary
  and Piyush Garg; each gets its own accent color (orange / teal) carried
  through avatars, message bubbles, and status pill so it's obvious who
  you're talking to at a glance.
- **Multiple conversations** — "New chat" starts a fresh thread per persona;
  history list on the left, auto-titled from the first message.
- **Typing indicator** — animated three-dot bubble while waiting on a
  response.
- **Image attachments** — attach up to 4 images per message, with preview
  and remove-before-send; images render inline in the sent message.
- **Responsive** — persistent sidebar on desktop, slide-over sheet on
  mobile; chat column scales down to phone widths without breaking.
- **Color theme** — background `#F4F2F2`, Hitesh accent `#FF9E20`, Piyush
  accent `#215E61`, ink `#1D2128`, defined once in `app/globals.css` as CSS
  variables (`--hitesh`, `--piyush`, etc.) so both light and dark mode work.

## Extending

- New persona: add an entry to `PERSONAS` in `lib/personas.ts` and a color
  pair in `globals.css` — the sidebar, header, and bubbles all read from
  that map, no component changes needed.
- Streaming responses: swap the `await sendMessage(...)` in
  `hooks/use-chat-store.ts` for a stream reader that appends chunks to the
  assistant message as they arrive.
- Persistence: the store is a single `useReducer` — swap `initState`/`dispatch`
  for a fetch from your DB and matching mutation calls without touching the UI.
