export type Level = "N5" | "N4" | "N3" | "N2" | "N1";

export interface VocabEntry {
  id: string;
  kanji: string;
  kana: string;
  romaji?: string;
  es: string; // significado en español
  tema: string[]; // temas de vocabulario
  nivel: Level;
  leccionLibro: string; // Ej: "N5-L12"
  notas?: string;
}

export interface GrammarEntry {
  id: string;
  label: string;
  descripcionEs: string;
  ejemploJa: string;
  ejemploEs: string;
  nivel: Level;
  leccionLibro: string;
  tags: string[];
  comentarios?: string;
}

export interface KanjiExampleWord {
  vocabId: string;
  kanjiForma: string;
  es: string;
}

export interface KanjiEntry {
  id: string;
  kanji: string;
  lecturasOn: string[];
  lecturasKun: string[];
  significadosEs: string[];
  nivel: Level;
  leccionLibro: string;
  palabrasEjemplo: KanjiExampleWord[];
}

export interface LessonEntry {
  titulo: string;
  nivel: Level;
  gramatica: string[]; // IDs de gramática
  vocabulario: string[]; // IDs de vocabulario
  kanji: string[]; // IDs de kanji
}

export type LessonsMap = Record<string, LessonEntry>;

export interface StudyProfile {
  lessonTarget: string; // Ej: "N4-L04"
  grammarList: GrammarEntry[];
  vocabList: VocabEntry[];
  kanjiList: KanjiEntry[];
}

export interface GeneratedSentence {
  es: string;
  ja: string;
  romaji: string;
  gramaticaUsada: string[];
  vocabUsado: string[];
  kanjiUsados: string[];
}

export interface GenerationMeta {
  lessonTarget: string;
  topics: string[];
  sentenceCount: number;
  createdAt: string; // ISO date
  model: string; // gemini-flash-lite-latest
  dataVersion: number; // data struct version
}

export interface StoredGeneration {
  meta: GenerationMeta;
  sentences: GeneratedSentence[];
}
