import { PayloadRichText } from "@/components/ui/payloadRichText";

import { QuestionStatusBadge } from "@/components/questions/QuestionStatusBadge";

type QuestionThreadCardProps = {
  question: {
    id: string;
    title: string;
    status?: "open" | "answered" | "resolved" | string | null;
    body?: string | null;
    createdAt?: string | null;
    answers?: {
      body?: unknown;
      createdAt?: string | null;
    }[];
  };
};

const toLexicalText = (text: string) => ({
  root: {
    type: "root",
    version: 1,
    format: "",
    indent: 0,
    direction: null,
    children: [
      {
        type: "paragraph",
        version: 1,
        format: "",
        indent: 0,
        direction: null,
        textFormat: 0,
        textStyle: "",
        children: [
          {
            type: "text",
            version: 1,
            text,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
    ],
  },
});

const formatDateTime = (value?: string | null) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export function QuestionThreadCard({ question }: QuestionThreadCardProps) {
  return (
    <article className="rounded-xl border border-border/60 bg-card/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{question.title}</h2>
        <QuestionStatusBadge status={question.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Asked {formatDateTime(question.createdAt)}
      </p>

      <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Question
        </p>
        <PayloadRichText
          content={
            toLexicalText(question.body?.trim() || "No question body provided.") as unknown as
              Parameters<typeof PayloadRichText>[0]["content"]
          }
          className="prose prose-invert max-w-none text-sm text-foreground"
        />
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Staff answers
        </p>
        {(question.answers ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff answers yet.</p>
        ) : (
          (question.answers ?? []).map((answer, index) => (
            <div
              key={`${question.id}-answer-${index}`}
              className="rounded-lg border border-border/60 bg-background/60 p-4"
            >
              <p className="mb-2 text-xs text-muted-foreground">
                {formatDateTime(answer.createdAt)}
              </p>
              <PayloadRichText
                content={
                  answer.body as unknown as Parameters<typeof PayloadRichText>[0]["content"]
                }
                className="prose prose-invert max-w-none text-sm text-foreground"
              />
            </div>
          ))
        )}
      </div>
    </article>
  );
}
