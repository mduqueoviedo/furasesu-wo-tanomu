import type {
  StudyProfile,
  GrammarEntry,
  VocabEntry,
  KanjiEntry,
} from "./types";

function formatGrammarList(grammarList: GrammarEntry[]): string {
  if (grammarList.length === 0) {
    return "- (No se ha definido gramática, no introduzcas estructuras avanzadas)\n";
  }

  return grammarList
    .map(
      (g) =>
        `- ${g.label} (ID: ${g.id})\n` +
        `  Ejemplo: ${g.ejemploJa} → ${g.ejemploEs}`,
    )
    .join("\n");
}

function formatVocabList(vocabList: VocabEntry[]): string {
  if (vocabList.length === 0) {
    return "- (No hay vocabulario definido, no introduzcas palabras nuevas)\n";
  }

  return vocabList
    .map((v) => `- ${v.es} (JA: ${v.kanji} / ${v.kana}, ID: ${v.id})`)
    .join("\n");
}

function formatKanjiList(kanjiList: KanjiEntry[]): string {
  if (kanjiList.length === 0) {
    return "- (No se especifican kanji estudiados)\n";
  }

  return kanjiList
    .map(
      (k) =>
        `- ${k.kanji} ` +
        `(lecturas ON: ${k.lecturasOn.join(", ") || "-"}, ` +
        `KUN: ${k.lecturasKun.join(", ") || "-"}, ` +
        `significados: ${k.significadosEs.join(", ") || "-"})`,
    )
    .join("\n");
}

export function buildSpanishPrompt(
  profile: StudyProfile,
  sentenceCount: number,
): string {
  const grammarText = formatGrammarList(profile.grammarList);
  const vocabText = formatVocabList(profile.vocabList);
  const kanjiText = formatKanjiList(profile.kanjiList);

  const prompt = `
Eres un generador de frases para un estudiante de japonés de nivel entre N5 y N4.

El estudiante solo debe enfrentarse a frases que pueda traducir usando:

1) Estos patrones gramaticales (no uses otros patrones más avanzados que no estén listados):

${grammarText}

2) Este vocabulario disponible (no introduzcas palabras nuevas difíciles; si necesitas introducir alguna palabra nueva muy básica, hazlo de forma excepcional):

${vocabText}

3) Estos kanji estudiados hasta ahora (prioriza su uso cuando sea posible, pero no es obligatorio en todas las frases):

${kanjiText}

Tarea:

Genera ${sentenceCount} frases EN ESPAÑOL (español de España) que cumplan:

- Dificultad acorde a un estudiante que domina solo los patrones y el vocabulario listados arriba.
- Cada frase debe poder traducirse al japonés usando únicamente esos recursos.
- Varía los temas (casa, trabajo, comida, vida diaria, etc.) dentro de lo posible con el vocabulario dado.
- Cuando tenga sentido, formula frases que al traducirse al japonés puedan incluir palabras con los kanji estudiados.

Devuelve la respuesta EXCLUSIVAMENTE en formato JSON con este esquema:

[
  {
    "es": "Frase en español",
    "ja": "Frase en japonés usando solo la gramática y vocabulario indicados",
    "romaji": "Transcripción en romaji",
    "gramaticaUsada": ["idDePatron1", "idDePatron2"],
    "vocabUsado": ["idDeVocab1", "idDeVocab2"],
    "kanjiUsados": ["食", "家"]
  },
  ...
]

No añadas comentarios ni texto fuera de ese JSON.
`.trim();

  return prompt;
}
