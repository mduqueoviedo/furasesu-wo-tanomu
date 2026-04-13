import { describe, it, expect } from "vitest";
import { buildSpanishPrompt } from "../buildPrompt";
import type { StudyProfile, GrammarEntry } from "../types";

const emptyProfile: StudyProfile = {
  lessonTarget: "N5-L01",
  grammarList: [],
  vocabList: [],
  kanjiList: [],
};

const sampleGrammar: GrammarEntry = {
  id: "desu_copula_basica",
  label: "です (desu)",
  descripcionEs: "Cópula básica — equivale a 'ser/estar'",
  ejemploJa: "私は学生です。",
  ejemploEs: "Soy estudiante.",
  nivel: "N5",
  leccionLibro: "N5-L01",
  tags: [],
};

describe("buildSpanishPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildSpanishPrompt(emptyProfile, 5);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("includes the requested sentence count", () => {
    const prompt = buildSpanishPrompt(emptyProfile, 7);
    expect(prompt).toContain("7");
  });

  it("includes all expected JSON field names in the schema", () => {
    const prompt = buildSpanishPrompt(emptyProfile, 5);
    expect(prompt).toContain('"es"');
    expect(prompt).toContain('"ja"');
    expect(prompt).toContain('"romaji"');
    expect(prompt).toContain('"gramaticaUsada"');
    expect(prompt).toContain('"vocabUsado"');
    expect(prompt).toContain('"kanjiUsados"');
  });

  it("includes grammar entry ID and label when grammar is provided", () => {
    const profile: StudyProfile = {
      ...emptyProfile,
      grammarList: [sampleGrammar],
    };
    const prompt = buildSpanishPrompt(profile, 5);
    expect(prompt).toContain("desu_copula_basica");
    expect(prompt).toContain("です (desu)");
  });

  it("includes vocab entry when vocab is provided", () => {
    const profile: StudyProfile = {
      ...emptyProfile,
      vocabList: [
        {
          id: "v_taberu",
          kanji: "食べる",
          kana: "たべる",
          es: "comer",
          tema: ["comida"],
          nivel: "N5",
          leccionLibro: "N5-L01",
        },
      ],
    };
    const prompt = buildSpanishPrompt(profile, 5);
    expect(prompt).toContain("食べる");
    expect(prompt).toContain("comer");
  });

  it("produces different prompts for different sentence counts", () => {
    const p3 = buildSpanishPrompt(emptyProfile, 3);
    const p10 = buildSpanishPrompt(emptyProfile, 10);
    expect(p3).not.toBe(p10);
  });
});
