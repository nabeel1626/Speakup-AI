"use client";

import { useEffect, useRef, useState } from "react";

type QuestionResponse = {
  role: string;
  level: string;
  questions: string[];
  source: string;
};

export default function RecordTest() {
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [level, setLevel] = useState(0); // mic level 0-100

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Load available mics after permission is granted
  useEffect(() => {
    async function loadDevices() {
      try {
        // Need permission first to see device labels
        await navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
          s.getTracks().forEach((t) => t.stop());
        });
        const list = await navigator.mediaDevices.enumerateDevices();
        const mics = list.filter((d) => d.kind === "audioinput");
        setDevices(mics);
        if (mics.length && !selectedDeviceId) {
          setSelectedDeviceId(mics[0].deviceId);
        }
      } catch {
        setError("Could not list microphones. Check browser permission.");
      }
    }
    loadDevices();
  }, []);

  // Live mic level meter
  function startLevelMeter(stream: MediaStream) {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setLevel(Math.min(100, Math.round(avg * 2)));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopLevelMeter() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  }

  async function loadQuestion() {
    setError("");
    setQuestion("");
    try {
      const res = await fetch("http://localhost:8000/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Frontend Developer", level: "Entry-level" }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data: QuestionResponse = await res.json();
      setQuestion(data.questions[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function startRecording() {
    setError("");
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
      });
      streamRef.current = stream;
      startLevelMeter(stream);

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
        stopLevelMeter();

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("Blob size:", blob.size, "bytes");

        if (blob.size < 5000) {
          setError(
            `Recording too small (${blob.size} bytes). Your mic is not capturing audio. Try another device.`
          );
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
    } catch (err) {
      setError("Could not access microphone: " + (err instanceof Error ? err.message : "unknown"));
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface p-8">
      <h1 className="font-display text-3xl font-bold text-primary mb-6">
        Record Test
      </h1>

      <div className="space-y-4 max-w-2xl">
        {/* Mic selector */}
        <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
          <label className="font-mono text-xs text-on-surface-variant block mb-2">
            Microphone
          </label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            disabled={recording}
            className="bg-surface text-on-surface border border-outline-variant rounded px-3 py-2 w-full"
          >
            {devices.length === 0 && <option>No microphones found</option>}
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
              </option>
            ))}
          </select>

          {/* Level meter */}
          <div className="mt-3">
            <div className="font-mono text-xs text-on-surface-variant mb-1">
              Level: {level}%
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded overflow-hidden">
              <div
                className="h-full bg-secondary transition-all"
                style={{ width: `${level}%` }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={loadQuestion}
          className="bg-primary text-[#1000a9] font-semibold px-6 py-3 rounded"
        >
          Load Question
        </button>

        {error && <p className="text-error font-mono text-sm">{error}</p>}

        {question && (
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <p className="font-mono text-xs text-on-surface-variant mb-2">
              Question
            </p>
            <p className="font-body text-lg leading-relaxed">{question}</p>
          </div>
        )}

        {question && (
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
        )}

        {transcribing && (
          <p className="font-mono text-sm text-on-surface-variant">
            Transcribing with Whisper...
          </p>
        )}

        {transcript && (
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
            <p className="font-mono text-xs text-on-surface-variant mb-2">
              Transcript
            </p>
            <p className="font-body text-base leading-relaxed">{transcript}</p>
          </div>
        )}
      </div>
    </main>
  );
}