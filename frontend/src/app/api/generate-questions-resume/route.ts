import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("resume") as File;
    const role = form.get("role") as string;
    const level = form.get("level") as string;

    if (!file || !role || !level) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = require("pdf-parse");
    const data = await pdf(buffer);
    const resumeText = data.text.substring(0, 3000);

    const SYSTEM_PROMPT = `You are an expert technical interviewer. Based on the candidate's resume and target role, generate exactly 5 interview questions.
Role: ${role}
Level: ${level}
Resume: ${resumeText}

Return ONLY a JSON object with the shape: {"questions": ["q1", "q2", "q3", "q4", "q5"]}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      }),
    });

    if (!res.ok) throw new Error("Groq failed");

    const json = await res.json();
    const result = JSON.parse(json.choices[0].message.content);

    return NextResponse.json({
      role,
      level,
      questions: result.questions,
      source: "resume",
    });
  } catch (error) {
    console.error("Resume question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}