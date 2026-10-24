import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a strict but fair interview evaluator.
Score the candidate's answer on a 1-5 integer scale across five dimensions:
- relevance: did the answer address the question?
- technical_depth: correct concepts, examples, tradeoffs
- structure: logical flow, clear sequencing
- clarity: concise, understandable language
- confidence: decisive, no excessive hedging

Also provide 2-3 strengths and 2-3 improvements, one short sentence each.

CRITICAL: If ANY dimension score is 1 or 2, generate a "follow_up_question" that probes deeper into that specific weakness. If all scores are 3 or higher, set "follow_up_question" to null.

Return ONLY valid JSON with exactly this shape:
{
  "relevance": <1-5>,
  "technical_depth": <1-5>,
  "structure": <1-5>,
  "clarity": <1-5>,
  "confidence": <1-5>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "follow_up_question": "string or null"
}`;

export async function POST(req: Request) {
  try {
    const { question, answer, role, level } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ error: "Missing question or answer" }, { status: 400 });
    }

    const userPrompt = `Role: ${role}\nLevel: ${level}\nQuestion: ${question}\nCandidate answer: ${answer}\n\nReturn JSON only.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Groq scoring error:", errorText);
      return NextResponse.json({ error: "Scoring failed" }, { status: res.status });
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Score route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
