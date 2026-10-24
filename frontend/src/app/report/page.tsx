"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const DIMENSIONS = [
  { key: "relevance", label: "Relevance" },
  { key: "technical_depth", label: "Technical Depth" },
  { key: "structure", label: "Structure" },
  { key: "clarity", label: "Clarity" },
  { key: "confidence", label: "Confidence" },
];

function ReportContent() {
  const searchParams = useSearchParams();
  const dataString = searchParams.get("data");

  if (!dataString) {
    return <div className="p-8 text-error">No report data found.</div>;
  }

  let reportData;
  try {
    reportData = JSON.parse(decodeURIComponent(dataString));
  } catch {
    return <div className="p-8 text-error">Invalid report data.</div>;
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface p-8 animate-fade-in-up">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-3xl font-bold text-primary">
          Shared Interview Report
        </h1>
        <p className="font-mono text-sm text-on-surface-variant">
          {reportData.role} · {reportData.level} · {reportData.answers.length} questions
        </p>

        <div className="space-y-4">
          {reportData.answers.map((a: any, i: number) => (
            <div key={i} className="surface-elevated p-6">
              <p className="font-mono text-xs text-on-surface-variant mb-2">Q{i + 1}</p>
              <p className="font-body text-base mb-3">{a.question}</p>
              <p className="font-body text-sm text-on-surface-variant italic mb-3">
                &quot;{a.transcript}&quot;
              </p>

              {a.score && (
                <div className="flex gap-3 flex-wrap font-mono text-xs">
                  {DIMENSIONS.map((d) => (
                    <span
                      key={d.key}
                      className="bg-surface-container-low px-2 py-1 rounded"
                    >
                      {d.label}:{" "}
                      <span className="text-primary font-bold">
                        {a.score[d.key]}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading report...</div>}>
      <ReportContent />
    </Suspense>
  );
}