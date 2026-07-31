# Teacher Persona Chat — Talk to "Hitesh Sir" & "Piyush Sir"

This is a chat app where you can message AI versions of two well-known Indian coding
YouTubers/mentors — **Hitesh Choudhary** and **Piyush Garg** — and get replies that
actually sound like them: same tone, same Hinglish, same catchphrases, even the same
kind of advice they'd really give a student.

It's not a generic "AI assistant with a name slapped on it." The app is built so the
model replies *in character* — using real personality data and real past
question-answer pairs from these mentors — instead of just a system prompt that says
"pretend to be X."

Built with **Next.js 16** (App Router) + **TypeScript**, styled with **shadcn/ui** +
Tailwind, and powered by **Anthropic's Claude** for the actual replies and **OpenAI's
embedding model** for understanding what you're asking.

---

## 1. What it feels like to use

1. You open the app and pick a mentor — Hitesh or Piyush — from the sidebar.
2. You type a question, like a normal chat app (WhatsApp / ChatGPT style UI).
3. The mentor "thinks" (a typing indicator shows up) for a second or two.
4. A reply comes back in their voice — Hinglish, casual, sometimes a bit teasing,
   sometimes motivational — not a robotic "As an AI language model..." answer.
5. Your conversations are saved per-mentor, so you can start new chats, switch
   between mentors, and pick up old conversations later.

Right now chat history is saved in your **browser's local storage** — there's no
database yet, so it lives only on the device/browser you used.

---

## 2. The big idea: how does it "sound like" a real person?

This is the interesting part, and it's basically a **RAG pipeline** (Retrieval
Augmented Generation) combined with a very detailed **persona profile**. In plain
English: instead of just telling the AI "act like Hitesh," the app gives it three
layers of real material every single time you send a message:

| Layer | What it is | Where it comes from |
|---|---|---|
| **1. Personality profile** | Traits, speaking style, catchphrases, rules ("never encourage piracy," "keep answers short," etc.), sample intros, sample replies | `src/data/mentors.ts` — hand-written for each mentor |
| **2. Long-term memory (RAG)** | Thousands of *real* question → reply pairs (like actual YouTube comment replies) turned into searchable "embeddings" | `src/knowledge/<mentor>/persona.json` + `embeddings.json` (2,000+ real Q&A pairs per mentor) |
| **3. Conversation history** | The messages you've already exchanged in this chat | Sent from the browser along with your new message |

All three get stitched together into one big instruction sheet (a "system prompt")
that's sent to Claude right before it answers you. That's the trick — the model
isn't guessing what Hitesh sounds like from general internet knowledge, it's being
shown dozens of things Hitesh has *actually said* that are relevant to your exact
question.

---

## 3. What actually happens behind the scenes (step by step)

Here's the full journey of a single message, from the moment you hit send:

```
 You type: "Sir, should I learn Python or JavaScript first?"
        │
        ▼
 1. Frontend (React) sends your message + chat history
    to the backend →  POST /api/teacher
        │
        ▼
 2. Your text is converted into a "vector embedding"
    (a list of ~1500 numbers that represents the MEANING
    of your sentence, not just the words)
    → uses OpenAI's text-embedding-3-small model
        │
        ▼
 3. That number-vector is compared against ~2,000 real
    past Q&As stored for that mentor, using a formula
    called "cosine similarity" (measures how close two
    meanings are)
    → the 10 most relevant real past answers are pulled out
        │
        ▼
 4. Those matching Q&As, plus the mentor's personality
    profile, plus your chat history, get assembled into
    one big system prompt: "You ARE Hitesh Choudhary,
    talk like this, here's how you've answered similar
    questions before, stay in character..."
        │
        ▼
 5. Everything is sent to Claude (Anthropic's AI model)
    → Claude generates a reply, formatted as structured
      JSON (either plain text or a code snippet)
        │
        ▼
 6. The JSON reply is sent back to your browser and shown
    as a chat bubble, exactly like a normal message
```

### Why "vector embeddings"? (in plain words)

Think of an embedding as turning a sentence into a point on a map. Sentences with
similar *meaning* land close together on that map, even if they use totally
different words. So if you ask *"Should I learn Python or JS first?"*, the app can
find an old real reply to *"Sir kya pehle python sikhna chahiye?"* even though the
wording is different — because the underlying meaning is the same. That's what
lets the mentor "remember" thousands of real answers without literally re-reading
all of them every time.

### Why structured JSON output?

Claude is asked to always reply in a strict shape:

```json
{ "type": "text", "content": "Hanji! Bilkul, JavaScript se start karo..." }
```
or
```json
{ "type": "code", "language": "javascript", "content": "console.log('hello')" }
```

This is what lets the chat UI decide whether to show a normal message bubble or a
syntax-highlighted code block — the frontend doesn't have to guess.

---

## 4. Project structure (map of the codebase)

```
src/
├── app/
│   ├── page.tsx                     # Main chat page
│   ├── api/
│   │   ├── teacher/route.ts         # ⭐ The core chat endpoint (the flow above lives here)
│   │   ├── teacher/[teacherId]/     # Fetch info about one mentor
│   │   ├── teacher/replay/          # (placeholder, not wired up yet)
│   │   └── auth/login/              # (placeholder, not wired up yet)
│
├── components/
│   ├── chat-ui/                     # Sidebar, message bubbles, composer, header
│   └── ui/                          # Reusable shadcn/ui building blocks
│
├── data/
│   └── mentors.ts                   # Personality profile for each mentor (the "character sheet")
│
├── knowledge/
│   ├── hitesh/  → persona.json + embeddings.json   # 2,148 real Q&A pairs + their vectors
│   └── piyush/  → persona.json + embeddings.json   # same idea for Piyush
│
├── utils/chat/
│   ├── convertTextToVectorEmbeding.ts   # Step 2 — turn your message into numbers
│   ├── vectorEmbeddingSearch.ts         # Step 3 — find the closest matches
│   ├── cosineSimilarity.ts              # The math behind "how similar are two meanings"
│   ├── getRetrievedKnowledge.ts         # Turns matches back into readable Q&A text
│   └── buildSystemPrompt.ts             # Step 4 — assembles the full instruction sheet
│
├── lib/
│   └── openAi.ts                    # OpenAI client setup (used only for embeddings)
│
├── hooks/
│   └── use-chat-store.ts            # Frontend state: conversations, sending, localStorage
│
└── config/
    └── config.ts                    # Makes sure required .env variables are set
```

---

## 5. Tech stack, in one line each

- **Next.js 16 (App Router)** — the web framework; pages *and* backend API routes live in the same project.
- **TypeScript** — JavaScript with type-checking, so bugs get caught earlier.
- **shadcn/ui + Tailwind CSS** — the visual components (buttons, avatars, chat sheet) and styling.
- **Anthropic Claude (`claude-haiku-4-5`)** — the model that actually writes the mentor's reply.
- **OpenAI (`text-embedding-3-small`)** — used only to turn text into vectors for the "memory search"; it does not write any replies.
- **JWT (jsonwebtoken)** — set up for login/auth tokens, though the login route itself is currently just a placeholder.

---

## 6. Running it yourself

```bash
# 1. Install dependencies
pnpm install        # (or npm install / yarn install)

# 2. Add your own API keys — see the security note below first
cp .env.example .env    # if you don't have one, just create .env

# 3. Start the dev server
pnpm dev

# 4. Open the app
http://localhost:3000
```

You'll need your own keys for:
- `OPENAI_API_KEY` — used for embeddings (search)
- `ANTHROPIC_API_KEY` — used for the actual chat replies
- `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` — any random strong string, e.g. generate with `openssl rand -base64 32`
- `ACCESS_TOKEN_EXPIRY` / `REFRESH_TOKEN_EXPIRY` — e.g. `1d`, `10d`

---

## 7. ⚠️ Important security note — please read this

The `.env` file that came inside this project **already has real, working API keys
for both OpenAI and Anthropic committed inside it.** That means anyone who has this
project folder can see and use those keys (and get billed to whoever owns them).

Please do this immediately:
1. **Rotate/revoke both keys right now** from the OpenAI and Anthropic dashboards —
   treat them as already compromised.
2. Generate fresh keys and put them in a **new, local-only `.env`** file.
3. Make sure `.env` is listed in `.gitignore` (it already is here, good) — but note
   that being *gitignored* doesn't undo a key that was already shared in a zip file
   or a repo history. Rotation is the only real fix.

This isn't a flaw in how the app works — it's just that secret keys accidentally
ended up inside a file that got shared. Worth double-checking before you push this
anywhere public.

---

## 8. A few honest notes on the current state of the project

Since this is a learning/class project, a few things are still rough edges rather
than finished features — good to know before you dig in further:

- **`/api/teacher/replay`** and **`/api/auth/login`** are placeholder endpoints —
  they return a success message but don't do real work yet.
- **Chat history lives only in the browser** (localStorage) — there's no database,
  so clearing browser data or switching devices loses your conversations.
- **`src/learn/`** is a scratchpad folder the author used while experimenting with
  the OpenAI SDK — it's not part of the running app.
- Only two mentors exist today (Hitesh, Piyush), but the data structure in
  `mentors.ts` is written so adding a third is just adding one more object to that
  file plus a `knowledge/<newMentor>/` folder.

---

## 9. How to extend it

- **Add a new mentor:** duplicate the shape of one entry in `src/data/mentors.ts`,
  write their personality/rules/examples, then add a matching
  `src/knowledge/<id>/persona.json` + `embeddings.json` pair (real Q&A data +
  vectors) so their "memory" search works too.
- **Make replies stream in word-by-word:** swap the single `await` call in
  `use-chat-store.ts`'s `handleSend` for a streaming reader, and update
  `/api/teacher/route.ts` to stream from Claude instead of waiting for the full
  reply.
- **Add a real database:** replace the `localStorage` read/write in
  `use-chat-store.ts` with API calls, so conversations survive across devices.

---

That's the whole picture: a chat UI on top of a small but genuinely clever
retrieval system that gives the AI real, specific examples of how each mentor
talks — instead of just telling it to "act like" them.