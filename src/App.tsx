import { useState } from "react";
import { buildStudyProfile, filterVocabByTopics } from "./buildProfile";
import { buildSpanishPrompt } from "./buildPrompt";
import { callModel } from "./modelClient";
import type { GeneratedSentence } from "./types";

function App() {
  const [lessonTarget, setLessonTarget] = useState("N4-L04");
  const [topics, setTopics] = useState<string[]>([]);
  const [sentenceCount, setSentenceCount] = useState(10);
  const [promptPreview, setPromptPreview] = useState<string>("");
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableTopics = ["comida", "casa", "trabajo", "gente"];

  const handleTopicToggle = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    setSentences([]);
    setIsLoading(true);

    try {
      const baseProfile = buildStudyProfile(lessonTarget);
      const filteredVocab = filterVocabByTopics(baseProfile.vocabList, topics);

      const profile = {
        ...baseProfile,
        vocabList: filteredVocab,
      };

      const prompt = buildSpanishPrompt(profile, sentenceCount);
      setPromptPreview(prompt);

      // Call the model (currently using the real API endpoint)
      const result = await callModel({
        prompt,
        sentenceCount,
        lessonTarget,
        topics,
      });

      setSentences(result);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        "Se ha producido un error al generar las frases. Revisa la lección objetivo y los datos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            furasu-wo-tanomu · Generador de frases
          </h1>
          <span className="text-xs text-slate-500">
            Código en inglés · Prompts en español
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr),minmax(0,1.5fr)]">
          {/* Controls panel */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
            <h2 className="text-lg font-semibold mb-2">Configuración</h2>

            {/* Target lesson */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Lección objetivo (libro)
              </label>
              <input
                type="text"
                value={lessonTarget}
                onChange={(e) => setLessonTarget(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: N4-L04"
              />
              <p className="text-xs text-slate-500">
                Ejemplo: N5-L12, N5-L15, N4-L04…
              </p>
            </div>

            {/* Topics */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Temas de vocabulario
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => {
                  const active = topics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTopicToggle(topic)}
                      className={
                        "px-2 py-1 rounded-full text-xs border transition " +
                        (active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200")
                      }
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Si no seleccionas ninguno, se usarán todos los temas
                disponibles.
              </p>
            </div>

            {/* Number of sentences */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Número de frases a generar
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={sentenceCount}
                onChange={(e) =>
                  setSentenceCount(
                    isNaN(Number(e.target.value)) ? 0 : Number(e.target.value),
                  )
                }
                className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Generar prompt
            </button>
          </section>

          {/* Result panel */}
          <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Resultado</h2>
            <p className="text-xs text-slate-500">
              Primero se muestra el prompt en castellano. Debajo verás las
              frases generadas (por ahora simuladas, luego vendrán del modelo
              real).
            </p>

            {/* Generated prompt */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Prompt generado</h3>
              <div className="max-h-64 overflow-auto border border-slate-200 rounded-md bg-slate-50 p-3 text-xs font-mono whitespace-pre-wrap">
                {promptPreview || "Todavía no se ha generado ningún prompt."}
              </div>
            </div>

            {/* Loading / error state */}
            {isLoading && (
              <div className="text-xs text-blue-600">
                Generando frases… (simulado de momento)
              </div>
            )}

            {errorMsg && <div className="text-xs text-red-600">{errorMsg}</div>}

            {/* Generated sentences */}
            <div>
              <h3 className="text-sm font-semibold mb-1">Frases generadas</h3>
              {sentences.length === 0 && !isLoading && !errorMsg && (
                <p className="text-xs text-slate-500">
                  Aún no hay frases generadas.
                </p>
              )}

              {sentences.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {sentences.map((s, idx) => (
                    <li
                      key={idx}
                      className="border border-slate-200 rounded-md p-2 bg-slate-50"
                    >
                      <div className="font-medium text-slate-800">
                        {idx + 1}. {s.es}
                      </div>
                      <div className="text-slate-700 text-sm mt-1">
                        <span className="font-semibold">JA: </span>
                        {s.ja}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        <span className="font-semibold">romaji: </span>
                        {s.romaji}
                      </div>
                      <div className="text-slate-400 text-[10px] mt-1">
                        <span className="font-semibold">gramática: </span>
                        {s.gramaticaUsada.join(", ") || "-"}
                        {" · "}
                        <span className="font-semibold">vocab: </span>
                        {s.vocabUsado.join(", ") || "-"}
                        {" · "}
                        <span className="font-semibold">kanji: </span>
                        {s.kanjiUsados.join(", ") || "-"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
