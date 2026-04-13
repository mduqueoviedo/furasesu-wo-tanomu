const DATA_VERSION = 1;

export function getDataVersion(): number {
  return DATA_VERSION;
}

/**
 * Builds a cache key for a generation request.
 * Example:
 * jp:sentences:v1:lesson=N4-L04:topics=casa,comida:count=10:model=gemini-flash-lite-latest
 */
export function buildCacheKey(options: {
  lessonTarget: string;
  topics: string[];
  sentenceCount: number;
  modelName: string;
}): string {
  const { lessonTarget, topics, sentenceCount, modelName } = options;

  const normalizedTopics =
    topics && topics.length > 0 ? [...topics].sort().join(",") : "ALL";

  return [
    "jp",
    "sentences",
    `v${DATA_VERSION}`,
    `lesson=${lessonTarget}`,
    `topics=${normalizedTopics}`,
    `count=${sentenceCount}`,
    `model=${modelName}`,
  ].join(":");
}
