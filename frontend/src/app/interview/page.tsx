"use client";

import { useEffect, useRef, useState } from "react";

type QuestionResponse = {
  role: string;
  level: string;
  questions: string[];
  source: string;
};

type ScoreResult = {
  relevance: number;
  technical_depth: number;
  structure: number;
  clarity: number;
  confidence: number;
  strengths: string[];
  improvements: string[];
};

type AnswerRecord = {
  question: string;
  transcript: string;
  score?: ScoreResult;
};

type Stage = "setup" | "interview" | "summary";

const DIMENSIONS: { key: keyof ScoreResult; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "technical_depth", label: "Technical Depth" },
  { key: "structure", label: "Structure" },
  { key: "clarity", label: "Clarity" },
  { key: "confidence", label: "Confidence" },
];

export default function Interview() {
  const [stage, setStage] = useState<Stage>("setup");
  const [role, setRole] = useState("Frontend Developer");
  const [level, setLevel] = useState("Entry-level");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function loadDevices() {
      try {
        await navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((s) => s.getTracks().forEach((t) => t.stop()));
        const list = await navigator.mediaDevices.enumerateDevices();
        const mics = list.filter((d) => d.kind === "audioinput");
        setDevices(mics);
        if (mics.length && !selectedDeviceId) setSelectedDeviceId(mics[0].deviceId);
      } catch {
        // ignore
      }
    }
    loadDevices();
  }, []);

  async function startInterview() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data: QuestionResponse = await res.json();
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers([]);
      setTranscript("");
      setScore(null);
      setStage("interview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setLoading(false);
    }
  }

  function speakCurrentQuestion() {
    if (!questions[currentIndex]) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(questions[currentIndex]);
    u.lang = "en-US";
    u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  async function startRecording() {
    setError("");
    setTranscript("");
    setScore(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("Blob size:", blob.size, "bytes");
        if (blob.size < 5000) {
          setError(`Recording too small (${blob.size} bytes). Speak louder or pick another mic.`);
          return;
        }

        setTranscribing(true);
        try {
          // 1. Send audio to Next.js API route → Groq Whisper
          const form = new FormData();
          form.append("audio", blob, "answer.webm");
          const tRes = await fetch("/api/transcribe", {
            method: "POST",
            body: form,
          });
          if (!tRes.ok) throw new Error(`Transcribe returned ${tRes.status}`);
          const tData = await tRes.json();
          setTranscript(tData.transcript || "(empty)");

          // 2. Send transcript to Next.js API route → Groq LLM
          setTranscribing(false);
          setScoring(true);
          const sRes = await fetch("/api/score-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: questions[currentIndex],
              answer: tData.transcript,
              role,
              level,
            }),
          });
          if (!sRes.ok) throw new Error(`Scoring returned ${sRes.status}`);
          const sData: ScoreResult = await sRes.json();
          setScore(sData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Transcription or scoring failed");
        } finally {
          setTranscribing(false);
          setScoring(false);
        }
      };

      recorder.start(100);
      setRecording(true);
    } catch {
      setError("Could not access microphone");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function saveAnswerAndNext() {
    const updated = [
      ...answers,
      {
        question: questions[currentIndex],
        transcript: transcript || "(no answer)",
        score: score ?? undefined,
      },
    ];
    setAnswers(updated);
    setTranscript("");
    setScore(null);

    if (currentIndex + 1 >= questions.length) {
      setStage("summary");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  // ---------- Setup screen ----------
    if (stage === "setup") {
    return (
      <main className="min-h-screen bg-surface text-on-surface p-8 animate-fade-in-up flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-primary mb-2">
              Start a Mock Interview
            </h1>
            <p className="font-body text-on-surface-variant">
              Configure your AI interview session.
            </p>
          </div>

          <div className="surface-elevated p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Role
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                >
                  <option>Frontend Developer</option>
                  <option>Data Analyst</option>
                </select>
              </label>

              <label className="block">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Level
                </span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="input-field"
                >
                  <option>Entry-level</option>
                  <option>Mid-level</option>
                  <option>Senior</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant block mb-2">
                Microphone
              </span>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="input-field"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="text-error font-mono text-sm">{error}</p>}

            <div className="pt-4 border-t border-outline-variant/50">
              <button
                onClick={startInterview}
                disabled={loading}
                className="btn-primary bg-primary text-[#1000a9] w-full font-semibold px-6 py-4 rounded disabled:opacity-50 text-lg"
              >
                {loading ? "Loading..." : "Start Interview →"}
              </button>
              <p className="font-mono text-xs text-on-surface-variant mt-4 text-center">
                Note: In the deployed version, audio is processed by Groq&apos;s API.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Interview screen ----------
  if (stage === "interview") {
    return (
      <main className="min-h-screen bg-surface text-on-surface p-8 animate-fade-in-up">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-2xl font-bold text-primary">
              Question {currentIndex + 1} of {questions.length}
            </h1>
            <span className="font-mono text-xs text-on-surface-variant">
              {role} · {level}
            </span>
          </div>

          <div className="w-full h-1 bg-surface-container-highest rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="surface-elevated p-6">
            <p className="font-mono text-xs text-on-surface-variant mb-2">Question</p>
            <p className="font-body text-xl leading-relaxed">{questions[currentIndex]}</p>
            <div className="mt-6 flex gap-3">
              {!speaking ? (
                <button
                  onClick={speakCurrentQuestion}
                  className="btn-secondary bg-secondary text-[#00354a] font-semibold px-5 py-2 rounded"
                >
                  ▶ Read Aloud
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  className="btn-danger bg-error text-[#690005] font-semibold px-5 py-2 rounded"
                >
                  ■ Stop
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={transcribing || scoring}
                className="btn-danger bg-error text-[#690005] font-semibold px-6 py-3 rounded disabled:opacity-50"
              >
                ● Record Answer
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="btn-secondary bg-secondary text-[#00354a] font-semibold px-6 py-3 rounded"
              >
                ■ Stop
              </button>
            )}
          </div>

          {error && <p className="text-error font-mono text-sm">{error}</p>}

          {transcribing && (
            <p className="font-mono text-sm text-on-surface-variant">Uploading and transcribing...</p>
          )}

          {scoring && (
            <p className="font-mono text-sm text-on-surface-variant">
              Scoring your answer...
            </p>
          )}

          {transcript && (
            <div className="surface-elevated-low p-6">
              <p className="font-mono text-xs text-on-surface-variant mb-2">Your Answer</p>
              <p className="font-body text-base leading-relaxed">{transcript}</p>
            </div>
          )}

          {score && (
            <div className="surface-elevated p-6 space-y-4">
              <p className="font-mono text-xs text-on-surface-variant">Scores</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {DIMENSIONS.map((d) => (
                  <div key={d.key} className="surface-elevated-low p-3">
                    <p className="font-mono text-xs text-on-surface-variant mb-1">{d.label}</p>
                    <p className="font-display text-2xl font-bold text-primary">
                      {(score[d.key] as number) ?? "–"}
                    </p>
                  </div>
                ))}
              </div>

              {score.strengths?.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-tertiary mb-1">Strengths</p>
                  <ul className="font-body text-sm list-disc list-inside space-y-1">
                    {score.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {score.improvements?.length > 0 && (
                <div>
                  <p className="font-mono text-xs text-error mb-1">Improvements</p>
                  <ul className="font-body text-sm list-disc list-inside space-y-1">
                    {score.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {transcript && !scoring && (
            <button
              onClick={saveAnswerAndNext}
              className="btn-primary bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded"
            >
              {currentIndex + 1 >= questions.length ? "Finish Interview" : "Next Question →"}
            </button>
          )}
        </div>
      </main>
    );
  }

  // ---------- Summary screen ----------
  const scored = answers.filter((a) => a.score);
  const avg = (key: keyof ScoreResult) =>
    scored.length
      ? (
          scored.reduce((sum, a) => sum + ((a.score?.[key] as number) || 0), 0) /
          scored.length
        ).toFixed(1)
      : "–";

  return (
    <main className="min-h-screen bg-surface text-on-surface p-8 animate-fade-in-up">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-primary">Interview Complete</h1>
        <p className="font-body text-on-surface-variant">
          {role} · {level} · {answers.length} questions answered
        </p>

        {scored.length > 0 && (
          <div className="surface-elevated p-6">
            <p className="font-mono text-xs text-on-surface-variant mb-3">Average Scores</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {DIMENSIONS.map((d) => (
                <div key={d.key} className="surface-elevated-low p-3">
                  <p className="font-mono text-xs text-on-surface-variant mb-1">{d.label}</p>
                  <p className="font-display text-2xl font-bold text-primary">{avg(d.key)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {answers.map((a, i) => (
            <div key={i} className="surface-elevated p-6">
              <p className="font-mono text-xs text-on-surface-variant mb-2">Q{i + 1}</p>
              <p className="font-body text-base mb-3">{a.question}</p>
              <p className="font-mono text-xs text-on-surface-variant mb-1">Your answer</p>
              <p className="font-body text-base leading-relaxed mb-3">{a.transcript}</p>

              {a.score && (
                <div className="flex gap-3 flex-wrap font-mono text-xs">
                  {DIMENSIONS.map((d) => (
                    <span key={d.key} className="text-on-surface-variant">
                      {d.label}: <span className="text-primary">{a.score?.[d.key]}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setStage("setup");
            setAnswers([]);
            setQuestions([]);
          }}
          className="btn-primary bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded"
        >
          Start New Interview
        </button>
      </div>
    </main>
  );
}