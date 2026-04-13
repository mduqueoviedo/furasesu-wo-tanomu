import { describe, it, expect } from "vitest";
import {
  getLessonIdsUpTo,
  filterVocabByTopics,
  buildStudyProfile,
} from "../buildProfile";
import type { VocabEntry } from "../types";

// Helper to build minimal VocabEntry fixtures
const makeVocab = (id: string, ...topics: string[]): VocabEntry => ({
  id,
  kanji: "",
  kana: "",
  es: "",
  tema: topics,
  nivel: "N5",
  leccionLibro: "N5-L01",
});

describe("getLessonIdsUpTo", () => {
  it("includes the target lesson itself", () => {
    const result = getLessonIdsUpTo("N5-L05");
    expect(result).toContain("N5-L05");
  });

  it("includes lessons before the target", () => {
    const result = getLessonIdsUpTo("N5-L05");
    expect(result).toContain("N5-L01");
    expect(result).toContain("N5-L02");
  });

  it("excludes lessons after the target", () => {
    const result = getLessonIdsUpTo("N5-L05");
    expect(result).not.toContain("N5-L09");
    expect(result).not.toContain("N5-L15");
  });

  it("returns only the target when it is the first lesson", () => {
    const result = getLessonIdsUpTo("N5-L01");
    expect(result).toContain("N5-L01");
    expect(result).not.toContain("N5-L02");
  });

  it("returns an empty array for an ID lower than all known lessons", () => {
    // "N1-L00" is lexicographically below all existing IDs ("N4-*", "N5-*")
    const result = getLessonIdsUpTo("N1-L00");
    expect(result).toHaveLength(0);
  });
});

describe("filterVocabByTopics", () => {
  it("returns all vocab when topics list is empty", () => {
    const vocab = [makeVocab("a", "comida"), makeVocab("b", "casa")];
    expect(filterVocabByTopics(vocab, [])).toHaveLength(2);
  });

  it("filters to only entries that match the selected topic", () => {
    const vocab = [
      makeVocab("a", "comida"),
      makeVocab("b", "casa"),
      makeVocab("c", "comida", "casa"),
    ];
    const result = filterVocabByTopics(vocab, ["comida"]);
    expect(result.map((v) => v.id)).toEqual(["a", "c"]);
  });

  it("returns entries matching any of multiple selected topics", () => {
    const vocab = [
      makeVocab("a", "comida"),
      makeVocab("b", "casa"),
      makeVocab("c", "trabajo"),
    ];
    const result = filterVocabByTopics(vocab, ["comida", "trabajo"]);
    expect(result.map((v) => v.id)).toEqual(["a", "c"]);
  });

  it("returns an empty array when no entry matches the selected topic", () => {
    const vocab = [makeVocab("a", "comida"), makeVocab("b", "casa")];
    expect(filterVocabByTopics(vocab, ["gente"])).toHaveLength(0);
  });
});

describe("buildStudyProfile", () => {
  it("returns a profile with the correct lessonTarget", () => {
    const profile = buildStudyProfile("N5-L05");
    expect(profile.lessonTarget).toBe("N5-L05");
  });

  it("returns arrays for grammarList, vocabList, and kanjiList", () => {
    const profile = buildStudyProfile("N5-L05");
    expect(Array.isArray(profile.grammarList)).toBe(true);
    expect(Array.isArray(profile.vocabList)).toBe(true);
    expect(Array.isArray(profile.kanjiList)).toBe(true);
  });

  it("accumulates more entries when the target lesson is later", () => {
    const profileL01 = buildStudyProfile("N5-L01");
    const profileL12 = buildStudyProfile("N5-L12");
    expect(profileL12.grammarList.length).toBeGreaterThanOrEqual(
      profileL01.grammarList.length,
    );
    expect(profileL12.vocabList.length).toBeGreaterThanOrEqual(
      profileL01.vocabList.length,
    );
  });

  it("returns empty lists for an unknown lesson ID", () => {
    const profile = buildStudyProfile("N1-L00");
    expect(profile.grammarList).toHaveLength(0);
    expect(profile.vocabList).toHaveLength(0);
    expect(profile.kanjiList).toHaveLength(0);
  });
});
