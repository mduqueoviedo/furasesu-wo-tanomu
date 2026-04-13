import type { GeneratedSentence } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""; // empty string => same domain

export async function callModel(options: {
  prompt: string;
  sentenceCount: number;
  lessonTarget: string;
  topics: string[];
}): Promise<GeneratedSentence[]> {
  const { prompt, sentenceCount, lessonTarget, topics } = options;

  const url = `${API_BASE_URL}/api/generate`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      sentenceCount,
      lessonTarget,
      topics,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("API error:", response.status, text);
    throw new Error(`API error: ${response.status}`);
  }

  const data = (await response.json()) as { sentences: GeneratedSentence[] };

  if (!Array.isArray(data.sentences)) {
    throw new Error("Invalid response format from API");
  }

  return data.sentences;
}
