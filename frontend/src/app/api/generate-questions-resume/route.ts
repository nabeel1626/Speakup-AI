import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "../rate-limit";
import mammoth from "mammoth";

export const runtime = "nodejs";
export const maxDuration = 60;

const FALLBACK_QUESTIONS: Record<string, Record<string, string[]>> = {
  "Frontend Developer": {
    "Entry-level": [
      "How do semantic HTML elements help make a page accessible?",
      "When would you use CSS Grid instead of Flexbox?",
      "How would you make a button respond to a user's click in JavaScript?",
      "What steps would you take to make a form usable on a phone?",
      "How would you check that a page looks correct in more than one browser?",
    ],
    "Mid-level": [
      "How would you diagnose an interaction that feels slow in a React application?",
      "How do you decide where component state should live?",
      "How would you test an accessible form with loading and error states?",
      "When would code splitting improve a frontend application's performance?",
      "How would you investigate a layout that breaks at a particular viewport?",
    ],
    "Senior": [
      "How would you set frontend architecture boundaries for a growing product?",
      "How would you prioritize performance work across a large application?",
      "How would you establish accessibility practices across several teams?",
      "How would you evaluate a migration from a legacy frontend platform?",
      "How would you help a team resolve disagreement about a frontend tradeoff?",
    ],
  },
  "Data Analyst": {
    "Entry-level": [
      "How would you use a SQL query to find duplicate customer records?",
      "What is the difference between an inner join and a left join?",
      "How would you explain the conversion rate for an online signup flow?",
      "What would you check before calculating an average from a dataset?",
      "How would you summarize a simple chart for a nontechnical teammate?",
    ],
    "Mid-level": [
      "How would you investigate a sudden week-over-week change in a key metric?",
      "How do you validate that a SQL join has not duplicated observations?",
      "How would you define a useful retention metric for a product team?",
      "How would you compare outcomes between two groups while checking assumptions?",
      "How would you communicate an analysis with meaningful uncertainty?",
    ],
    "Senior": [
      "How would you assess whether a campaign caused a change in conversion?",
      "How would you establish trusted metric definitions across an organization?",
      "How would you prioritize analysis when several teams have urgent questions?",
      "How would you guide a team away from a misleading but popular metric?",
      "How would you present conflicting evidence to leaders making a decision?",
    ],
  },
};

export async function POST(req: Request) {
  if (!checkRateLimit(getClientIp(req), 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  let role = "Frontend Developer";
  let level = "Entry-level";

  try {
    const form = await req.formData();
    const file = form.get("resume") as File;
    role = (form.get("role") as string) || role;
    level = (form.get("level") as string) || level;

    // Validate the file
    if (!file || !role || !level) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Check by extension instead of relying solely on strict MIME types
    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf") || file.type === "application/pdf";
    const isDocx = fileName.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: "Resume must be a PDF or Word document" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Resume too large (max 5 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = "";

    // Extract text based on file type
    if (isPdf) {
      const pdf = require("pdf-parse");
      const data = await pdf(buffer);
      resumeText = data.text;
    } else if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    }

    resumeText = resumeText.substring(0, 3000); // Limit to 3000 chars for the prompt

    if (!resumeText || resumeText.length < 50) {
      throw new Error("Resume text too short to parse");
    }

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

    if (!result.questions || result.questions.length < 3) {
      throw new Error("Not enough questions generated");
    }

    return NextResponse.json({
      role,
      level,
      questions: result.questions,
      source: "resume",
    });
  } catch (error) {
    console.error("Resume question generation error, using fallback:", error);

    // Fall back to static questions
    const fallback = FALLBACK_QUESTIONS[role]?.[level] || FALLBACK_QUESTIONS["Frontend Developer"]["Entry-level"];
    return NextResponse.json({
      role,
      level,
      questions: fallback,
      source: "fallback",
    });
  }
}