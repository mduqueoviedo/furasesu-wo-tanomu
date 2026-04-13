# furasesu-wo-tanomu — Japanese sentence generator

A web app that generates Japanese practice sentences tailored to a learner's current study level. Given a target lesson (e.g. `N4-L04`), it builds a study profile from local data (grammar patterns, vocabulary, kanji) and sends a Spanish-language prompt to the Gemini API. The model returns sentences in Spanish together with their Japanese translation, romaji, and metadata about which grammar points and vocabulary were used.

## Tech stack

- **React 19** + **TypeScript** — frontend UI
- **Vite** — dev server and build tool
- **Tailwind CSS** — styling
- **Google Gemini** (`@google/generative-ai`) — sentence generation
- **Vercel** — serverless API route (`/api/generate`) and hosting

## Project structure

```
src/
  buildProfile.ts   – builds a study profile from lesson data files
  buildPrompt.ts    – formats the Spanish prompt sent to Gemini
  modelClient.ts    – calls /api/generate and returns parsed sentences
  App.tsx           – main UI (lesson selector, topic filters, results)
  data/             – JSON files: lessons, grammar, vocabulary, kanji
api/
  generate.ts       – Vercel serverless function; forwards prompt to Gemini
```

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Add a `.env.local` file (or pull from Vercel):
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-1.5-flash   # optional, this is the default
   ```

3. Start the dev server:
   ```bash
   pnpm dev
   ```

## Usage

1. Enter a **target lesson** (e.g. `N5-L12`, `N4-L04`). The app loads all grammar, vocabulary, and kanji studied up to that lesson.
2. Optionally select one or more **vocabulary topics** (food, home, work, people) to filter the word list.
3. Set the **number of sentences** to generate (1–15).
4. Click **Generar prompt** — the app calls the API and displays the sentences with their Japanese translation, romaji, and which grammar/vocab/kanji each one uses.

## Deployment

Deploy to Vercel. Set the `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) environment variables in the project settings.
