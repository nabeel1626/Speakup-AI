import { NextResponse } from "next/server";

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
  try {
    const { role, level } = await req.json();

    // Get the fallback questions based on role and level
    const questions = FALLBACK_QUESTIONS[role]?.[level];

    if (!questions) {
      return NextResponse.json(
        { error: "Invalid role or level" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      role,
      level,
      questions,
      source: "fallback",
    });
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
