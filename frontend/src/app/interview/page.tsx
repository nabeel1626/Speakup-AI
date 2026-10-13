"use client";

import { useEffect, useRef, useState } from "react";

type QuestionResponse = {
  role: string;
  level: string;
  questions: string[];
  source: string;
};

type AnswerRecord = {
  question: string;
  transcript: string;
};

type Stage = "setup" | "interview" | "summary";

export default function Interview() {
  const [stage, setStage] = useState<Stage>("setup");
  const [role, setRole] = useState("Frontend Developer");
  const [level, setLevel] = useState("Entry-level");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
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
        // ignore — user will see permission error when recording
      }
    }
    loadDevices();
  }, []);

  async function startInterview() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/generate-questions", {
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
          const form = new FormData();
          form.append("audio", blob, "answer.webm");
          const res = await fetch("http://localhost:8000/api/transcribe", {
            method: "POST",
            body: form,
          });
          if (!res.ok) throw new Error(`Transcribe returned ${res.status}`);
          const data = await res.json();
          setTranscript(data.transcript || "(empty)");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Transcription failed");
        } finally {
          setTranscribing(false);
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
      { question: questions[currentIndex], transcript: transcript || "(no answer)" },
    ];
    setAnswers(updated);
    setTranscript("");

    if (currentIndex + 1 >= questions.length) {
      setStage("summary");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  // --- Screens ---

  if (stage === "setup") {
    return (
      <main className="min-h-screen bg-surface text-on-surface p-8">
        <h1 className="font-display text-3xl font-bold text-primary mb-6">
          Start a Mock Interview
        </h1>
        <div className="space-y-4 max-w-xl">
          <label className="block">
            <span className="font-mono text-xs text-on-surface-variant block mb-1">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded px-3 py-2 w-full text-on-surface"
            >
              <option>Frontend Developer</option>
              <option>Data Analyst</option>
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-xs text-on-surface-variant block mb-1">Level</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded px-3 py-2 w-full text-on-surface"
            >
              <option>Entry-level</option>
              <option>Mid-level</option>
              <option>Senior</option>
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-xs text-on-surface-variant block mb-1">Microphone</span>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-surface-container border border-outline-variant rounded px-3 py-2 w-full text-on-surface"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-error font-mono text-sm">{error}</p>}

          <button
            onClick={startInterview}
            disabled={loading}
            className="bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded disabled:opacity-50"
          >
            {loading ? "Loading..." : "Start Interview"}
          </button>
        </div>
      </main>
    );
  }

  if (stage === "interview") {
    return (
      <main className="min-h-screen bg-surface text-on-surface p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-2xl font-bold text-primary">
              Question {currentIndex + 1} of {questions.length}
            </h1>
            <span className="font-mono text-xs text-on-surface-variant">
              {role} · {level}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-surface-container-highest rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <p className="font-mono text-xs text-on-surface-variant mb-2">Question</p>
            <p className="font-body text-xl leading-relaxed">{questions[currentIndex]}</p>
            <div className="mt-6 flex gap-3">
              {!speaking ? (
                <button
                  onClick={speakCurrentQuestion}
                  className="bg-secondary text-[#00354a] font-semibold px-5 py-2 rounded"
                >
                  ▶ Read Aloud
                </button>
              ) : (
                <button
                  onClick={stopSpeaking}
                  className="bg-error text-[#690005] font-semibold px-5 py-2 rounded"
                >
                  ■ Stop
                </button>
              )}
            </div>
          </div>

          {/* Record controls */}
          <div className="flex gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                disabled={transcribing}
                className="bg-error text-[#690005] font-semibold px-6 py-3 rounded disabled:opacity-50"
              >
                ● Record Answer
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-secondary text-[#00354a] font-semibold px-6 py-3 rounded"
              >
                ■ Stop
              </button>
            )}
          </div>

          {error && <p className="text-error font-mono text-sm">{error}</p>}

          {transcribing && (
            <p className="font-mono text-sm text-on-surface-variant">Transcribing...</p>
          )}

          {transcript && (
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
              <p className="font-mono text-xs text-on-surface-variant mb-2">Your Answer</p>
              <p className="font-body text-base leading-relaxed">{transcript}</p>
            </div>
          )}

          {transcript && (
            <button
              onClick={saveAnswerAndNext}
              className="bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded"
            >
              {currentIndex + 1 >= questions.length ? "Finish Interview" : "Next Question →"}
            </button>
          )}
        </div>
      </main>
    );
  }

  // Summary
  return (
    <main className="min-h-screen bg-surface text-on-surface p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-primary">Interview Complete</h1>
        <p className="font-body text-on-surface-variant">
          {role} · {level} · {answers.length} questions answered
        </p>

        <div className="space-y-4">
          {answers.map((a, i) => (
            <div
              key={i}
              className="bg-surface-container border border-outline-variant rounded-lg p-6"
            >
              <p className="font-mono text-xs text-on-surface-variant mb-2">
                Q{i + 1}
              </p>
              <p className="font-body text-base mb-3">{a.question}</p>
              <p className="font-mono text-xs text-on-surface-variant mb-1">
                Your answer
              </p>
              <p className="font-body text-base leading-relaxed">{a.transcript}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setStage("setup");
            setAnswers([]);
            setQuestions([]);
          }}
          className="bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded"
        >
          Start New Interview
        </button>
      </div>
    </main>
  );
}