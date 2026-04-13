import { describe, it, expect } from "vitest";
import { buildCacheKey, getDataVersion } from "../cache";

describe("getDataVersion", () => {
  it("returns a positive integer", () => {
    const v = getDataVersion();
    expect(typeof v).toBe("number");
    expect(v).toBeGreaterThan(0);
    expect(Number.isInteger(v)).toBe(true);
  });
});

describe("buildCacheKey", () => {
  const base = {
    lessonTarget: "N4-L04",
    topics: ["comida", "casa"],
    sentenceCount: 10,
    modelName: "gemini-1.5-flash",
  };

  it("returns a non-empty string", () => {
    expect(typeof buildCacheKey(base)).toBe("string");
    expect(buildCacheKey(base).length).toBeGreaterThan(0);
  });

  it("includes the lesson target", () => {
    expect(buildCacheKey(base)).toContain("lesson=N4-L04");
  });

  it("includes the sentence count", () => {
    expect(buildCacheKey(base)).toContain("count=10");
  });

  it("includes the model name", () => {
    expect(buildCacheKey(base)).toContain("gemini-1.5-flash");
  });

  it("includes the data version prefix", () => {
    const v = getDataVersion();
    expect(buildCacheKey(base)).toContain(`v${v}`);
  });

  it("sorts topics so key is order-independent", () => {
    const keyA = buildCacheKey({ ...base, topics: ["comida", "casa"] });
    const keyB = buildCacheKey({ ...base, topics: ["casa", "comida"] });
    expect(keyA).toBe(keyB);
  });

  it("uses ALL when topics is empty", () => {
    expect(buildCacheKey({ ...base, topics: [] })).toContain("topics=ALL");
  });

  it("produces different keys for different lesson targets", () => {
    const keyA = buildCacheKey({ ...base, lessonTarget: "N5-L01" });
    const keyB = buildCacheKey({ ...base, lessonTarget: "N4-L04" });
    expect(keyA).not.toBe(keyB);
  });

  it("produces different keys for different sentence counts", () => {
    const key5 = buildCacheKey({ ...base, sentenceCount: 5 });
    const key10 = buildCacheKey({ ...base, sentenceCount: 10 });
    expect(key5).not.toBe(key10);
  });

  it("produces different keys for different topic sets", () => {
    const keyA = buildCacheKey({ ...base, topics: ["comida"] });
    const keyB = buildCacheKey({ ...base, topics: ["casa"] });
    expect(keyA).not.toBe(keyB);
  });
});
