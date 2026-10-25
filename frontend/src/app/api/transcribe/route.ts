import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "../rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!checkRateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  try {
    const form = await req.formData();
    const file = form.get("audio") as File;
    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const groqForm = new FormData();
    groqForm.append("file", file);
    groqForm.append("model", "whisper-large-v3");
    groqForm.append("response_format", "json");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: groqForm,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq Whisper error:", errorText);
      return NextResponse.json({ error: "Transcription failed" }, { status: res.status });
    }

    const data = await res.json();
    const rawText = (data.text || "").trim();

    // Reject empty, tiny, or clearly hallucinated transcripts
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const lettersOnly = rawText.replace(/[^a-zA-Z]/g, "");

    if (!rawText || wordCount < 3 || lettersOnly.length < 5) {
      return NextResponse.json(
        { error: "We couldn't hear you clearly. Please try again and speak for at least 3 seconds." },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript: rawText });
  } catch (error) {
    console.error("Transcribe route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}