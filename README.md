# Mentor Persona Chat — Hitesh Sir & Piyush Sir

A chat app where you talk to AI personas of two Indian coding mentors, **Hitesh Choudhary** and **Piyush Garg**. The replies use their tone, their Hinglish and their kind of advice.

It is more than a system prompt that says "pretend to be X". Each reply is grounded in:

1. a hand-written **persona profile** (traits, style, catchphrases, rules, example replies), and
2. a **RAG memory**: real past question→reply pairs from the mentor, retrieved by semantic search for every message.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Anthropic Claude (replies) · OpenAI embeddings (retrieval)

---

## Features

- **Two mentors, one UI.** Switch between Hitesh and Piyush from the sidebar. Each has its own avatar and profile.
- **Multiple conversations per mentor.** Start a new chat, revisit old ones, and get titles generated automatically from the first message.
- **In-character replies.** Retrieval-augmented prompting is driven by real Q&A data.
- **Structured output.** Claude returns JSON (`text` or `code`), so the UI can render normal messages as Markdown (GFM) and code as syntax-highlighted blocks.
- **Typing indicator** while a reply is generated.
- **Local persistence.** Chats are saved in the browser's `localStorage` and need no database.

---

## How a message flows

```
Browser (use-chat-store.ts)
  │  POST /api/teacher  { mentorId, message, history }
  ▼
1. Embed the message           → OpenAI text-embedding-3-small (1536-dim)
2. Vector search               → cosine similarity against src/knowledge/<mentor>/embeddings.json
                                  top 10 matches, similarity ≥ 0.2
3. Look up the matched Q&A     → src/knowledge/<mentor>/persona.json
4. Build the system prompt     → persona profile (src/data/mentors.ts) + retrieved examples + rules
5. Call Claude                 → claude-haiku-4-5, JSON-schema output
  ▼
{ reply: { type: "text" | "code", content, language? } }  → rendered as a chat bubble
```

Reply schema:

```json
{ "type": "text", "content": "Hanji! JavaScript se start karo..." }
{ "type": "code", "language": "javascript", "content": "console.log('hello')" }
```

### Knowledge base

| Mentor | Q&A pairs (`persona.json`) | Vectors (`embeddings.json`) |
|---|---|---|
| `hitesh` | 2,148 | 2,148 × 1536 |
| `piyush` | 376 | 376 × 1536 |

The embeddings are precomputed with `text-embedding-3-small`. Search runs in memory, with no vector database.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                        # Renders <ChatApp />
│   ├── layout.tsx, globals.css
│   └── api/
│       ├── teacher/route.ts            # POST — the RAG + Claude chat endpoint
│       ├── teacher/[teacherId]/route.ts# GET  — echoes teacherId (stub)
│       ├── teacher/replay/route.ts     # GET  — placeholder
│       └── auth/login/route.ts         # GET  — placeholder
├── components/
│   ├── chat-ui/                        # chat-app, header, composer, conversation-list,
│   │                                   # icon-rail, message-bubble
│   └── ui/                             # shadcn/ui primitives
├── data/mentors.ts                     # Mentor types + persona profiles
├── knowledge/<mentor>/                 # persona.json + embeddings.json
├── hooks/use-chat-store.ts             # Conversations, sending, localStorage
├── utils/
│   ├── chat/
│   │   ├── convertTextToVectorEmbeding.ts
│   │   ├── vectorEmbeddingSearch.ts
│   │   ├── cosineSimilarity.ts
│   │   ├── getRetrievedKnowledge.ts
│   │   └── buildSystemPrompt.ts
│   ├── asyncHandler.ts, errorHandler.ts, ApiError.ts, ApiResponse.ts
├── lib/openAi.ts                       # OpenAI client + EMBEDDING_MODEL
├── config/config.ts                    # Validates required env vars
└── learn/                              # Prompting notes / SDK experiments (not used by the app)

public/mentors/                         # Mentor avatar images
```

---

## Getting started

**Prerequisites:** Node.js 20+ and [pnpm](https://pnpm.io/). npm or yarn also work.

```bash
# 1. Install dependencies
pnpm install

# 2. Create your env file from the template
cp env.example .env

# 3. Fill in the keys (see below), then start the dev server
pnpm dev
```

Open <http://localhost:3000>.

### Environment variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Embeddings for retrieval |
| `ANTHROPIC_API_KEY` | Claude chat replies |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT secrets for the planned auth. Generate with `openssl rand -base64 32` |
| `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY` | e.g. `1d`, `10d` |

`.env*` is gitignored. Never commit real keys.

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | Run ESLint |

---

## Adding a new mentor

1. Add an entry to `mentors` in `src/data/mentors.ts`, following the `Mentor` interface (profile, personality, principles, examples, expertise, social, rag, additionalBehaviour).
2. Put an avatar in `public/mentors/` and reference it in `profile.avatar`.
3. Create `src/knowledge/<id>/persona.json`. Its shape is `{ "<id>": { "question": "...", "reply": "..." } }`.
4. Create `src/knowledge/<id>/embeddings.json` with the **same keys**, embedded with `text-embedding-3-small`:
   ```json
   { "model": "text-embedding-3-small", "dimension": 1536, "createdAt": "...", "total": 0,
     "vectors": { "<id>": [0.012, ...] } }
   ```

---

## Current limitations

- Chat history lives only in the browser, so it is lost if the browser data is cleared and does not sync across devices.
- `/api/auth/login`, `/api/teacher/replay` and `/api/teacher/[teacherId]` are stubs. JWT auth is not implemented yet.
- Replies are not streamed. The UI waits for the full response.
- `embeddings.json` is read from disk on every request. Caching it in memory would make requests faster.
- The `rag.topK` field in `mentors.ts` is not used yet. Search uses a fixed `topK = 10`.

## Ideas for next steps

- Stream Claude responses to the UI.
- Store conversations in a database behind real auth.
- Cache embeddings in memory or move them to a vector store.
- Add a script that generates `embeddings.json` from `persona.json`.

---

> The personas are AI imitations made for learning. They are not affiliated with or endorsed by Hitesh Choudhary or Piyush Garg.
