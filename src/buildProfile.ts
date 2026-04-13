import vocabulario from "./data/vocabulario.json";
import gramatica from "./data/gramatica.json";
import kanji from "./data/kanji.json";
import lecciones from "./data/lecciones.json";

import type {
  VocabEntry,
  GrammarEntry,
  KanjiEntry,
  LessonsMap,
  StudyProfile,
} from "./types";

const vocabData = vocabulario as VocabEntry[];
const grammarData = gramatica as GrammarEntry[];
const kanjiData = kanji as KanjiEntry[];
const lessonsData = lecciones as LessonsMap;

// NOTE: this assumes lesson IDs can be compared as strings ("N4-L04", etc.)
// A custom sort order could be implemented for finer control, but this works for now.
export function getLessonIdsUpTo(targetLessonId: string): string[] {
  return Object.keys(lessonsData).filter((id) => id <= targetLessonId);
}

export function buildStudyProfile(lessonTarget: string): StudyProfile {
  const lessonIds = getLessonIdsUpTo(lessonTarget);

  const grammarIds = new Set<string>();
  const vocabIds = new Set<string>();
  const kanjiIds = new Set<string>();

  for (const id of lessonIds) {
    const lesson = lessonsData[id];
    if (!lesson) continue;

    lesson.gramatica.forEach((g) => grammarIds.add(g));
    lesson.vocabulario.forEach((v) => vocabIds.add(v));
    lesson.kanji.forEach((k) => kanjiIds.add(k));
  }

  const grammarList = grammarData.filter((g) => grammarIds.has(g.id));
  const vocabList = vocabData.filter((v) => vocabIds.has(v.id));
  const kanjiList = kanjiData.filter((k) => kanjiIds.has(k.id));

  return {
    lessonTarget,
    grammarList,
    vocabList,
    kanjiList,
  };
}

export function filterVocabByTopics(
  vocabList: VocabEntry[],
  selectedTopics: string[],
): VocabEntry[] {
  if (selectedTopics.length === 0) return vocabList;
  return vocabList.filter((v) =>
    v.tema.some((t) => selectedTopics.includes(t)),
  );
}
