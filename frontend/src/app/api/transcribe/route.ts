import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
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
    return NextResponse.json({ transcript: data.text });
  } catch (error) {
    console.error("Transcribe route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}