"use client";

import { useState } from "react";

type QuestionResponse = {
  role: string;
  level: string;
  questions: string[];
  source: string;
};

export default function SpeakTest() {
  const [question, setQuestion] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);

  async function loadQuestion() {
    setLoading(true);
    setError("");
    setQuestion("");

    try {
      const res = await fetch("http://localhost:8000/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Frontend Developer",
          level: "Entry-level",
        }),
      });

      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }

      const data: QuestionResponse = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions returned");
      }

      setQuestion(data.questions[0]);
      setSource(data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function speak() {
    if (!question) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface p-8">
      <h1 className="font-display text-3xl font-bold text-primary mb-6">
        Speak Test
      </h1>

      <div className="space-y-4 max-w-2xl">
        <button
          onClick={loadQuestion}
          disabled={loading}
          className="bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Question"}
        </button>

        {error && (
          <p className="text-error font-mono text-sm">Error: {error}</p>
        )}

        {question && (
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <p className="font-mono text-xs text-on-surface-variant mb-2">
              Question 1 of 5 · source: {source}
            </p>
            <p className="font-body text-lg leading-relaxed">{question}</p>

            <div className="mt-6 flex gap-3">
              {!speaking ? (
                <button
                  onClick={speak}
                  className="bg-secondary text-[#00354a] font-semibold px-6 py-3 rounded"
                >
                  ▶ Play
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  className="bg-error text-[#690005] font-semibold px-6 py-3 rounded"
                >
                  ■ Stop
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}