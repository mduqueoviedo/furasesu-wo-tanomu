import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildCacheKey, getDataVersion } from "../src/cache";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { StoredGeneration } from "../src/types";

interface GeneratedSentence {
  es: string;
  ja: string;
  romaji: string;
  gramaticaUsada: string[];
  vocabUsado: string[];
  kanjiUsados: string[];
}

const MAX_SENTENCES = 15;
const MAX_PROMPT_CHARS = 8000;

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not set. /api/generate will fail until it is configured.",
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!apiKey || !genAI) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { prompt, sentenceCount, lessonTarget, topics } = req.body ?? {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res
        .status(400)
        .json({ error: "Missing 'prompt' in request body" });
    }

    if (typeof lessonTarget !== "string" || !lessonTarget.trim()) {
      return res
        .status(400)
        .json({ error: "Missing 'lessonTarget' in request body" });
    }

    const topicsArray: string[] = Array.isArray(topics)
      ? topics.map((t: unknown) => String(t))
      : [];

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res
        .status(400)
        .json({ error: "Missing 'prompt' in request body" });
    }

    const rawCount =
      typeof sentenceCount === "number" && sentenceCount > 0
        ? sentenceCount
        : 10;

    const count = Math.min(rawCount, MAX_SENTENCES);

    const cacheKey = buildCacheKey({
      lessonTarget,
      topics: topicsArray,
      sentenceCount: count,
      modelName,
    });

    console.log("DEBUG cacheKey:", cacheKey);

    const model = genAI.getGenerativeModel({ model: modelName });

    // Limit prompt size
    const safePrompt =
      prompt.length > MAX_PROMPT_CHARS
        ? prompt.slice(0, MAX_PROMPT_CHARS) +
          "\n\n[Nota: el contenido ha sido truncado para ajustarse a la longitud máxima. Sigue las instrucciones con la información disponible.]"
        : prompt;

    const result = await model.generateContent(safePrompt);

    const response = result.response;
    const text = response.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini. Raw text:", text);
      return res.status(500).json({
        error: "Model did not return valid JSON",
        raw: text,
      });
    }

    if (!Array.isArray(parsed)) {
      console.error("Gemini JSON is not an array:", parsed);
      return res.status(500).json({
        error: "Model JSON is not an array",
        raw: parsed,
      });
    }

    const sentences = parsed as GeneratedSentence[];
    const limitedSentences = sentences.slice(0, count);

    const stored: StoredGeneration = {
      meta: {
        lessonTarget,
        topics: topicsArray,
        sentenceCount: limitedSentences.length,
        createdAt: new Date().toISOString(),
        model: modelName,
        dataVersion: getDataVersion(),
      },
      sentences: limitedSentences,
    };

    console.log("DEBUG storedGeneration meta:", stored.meta);

    // Aquí en el futuro haremos: await setToCache(cacheKey, stored);

    return res.status(200).json({ sentences: stored.sentences });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
