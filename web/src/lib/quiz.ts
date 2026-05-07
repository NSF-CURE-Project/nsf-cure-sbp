import type { QuizDoc, QuizQuestionDoc, QuizQuestionOption } from "@/lib/payloadSdk/types";

export type QuizQuestionType =
  | "single-select"
  | "multi-select"
  | "true-false"
  | "short-text"
  | "numeric";

export type QuizResponseValue = {
  selectedOptionIds: string[];
  textAnswer: string;
  numericAnswer: string;
};

export type NormalizedOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type NormalizedQuestion = {
  id: string;
  title?: string;
  prompt?: unknown;
  questionType: QuizQuestionType;
  options: NormalizedOption[];
  explanation?: unknown;
  attachments?: unknown;
  acceptedAnswers: string[];
  textMatchMode: "exact" | "normalized";
  numericCorrectValue?: number | null;
  numericTolerance?: number | null;
  numericUnit?: string | null;
};

export const normalizeWhitespace = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const normalizeFreeText = (value: string) =>
  normalizeWhitespace(value).toLowerCase();

export const getQuestionType = (
  question: QuizQuestionDoc
): QuizQuestionType => {
  const type = question.questionType;
  if (
    type === "single-select" ||
    type === "multi-select" ||
    type === "true-false" ||
    type === "short-text" ||
    type === "numeric"
  ) {
    return type;
  }
  const options = Array.isArray(question.options) ? question.options : [];
  const correctCount = options.filter((option) => option?.isCorrect).length;
  return correctCount > 1 ? "multi-select" : "single-select";
};

export const getChoiceOptions = (question: QuizQuestionDoc): NormalizedOption[] => {
  const questionType = getQuestionType(question);
  if (questionType === "true-false") {
    const correctIsTrue = Boolean(question.trueFalseAnswer);
    return [
      { id: "true", label: "True", isCorrect: correctIsTrue },
      { id: "false", label: "False", isCorrect: !correctIsTrue },
    ];
  }

  const options = Array.isArray(question.options) ? question.options : [];
  return options
    .map((opt, index) => {
      const option = opt as QuizQuestionOption;
      const id = option.id ? String(option.id) : `${question.id}-${index}`;
      return {
        id,
        label:
          typeof option.label === "string" && option.label.trim()
            ? option.label
            : "Untitled option",
        isCorrect: Boolean(option.isCorrect),
      };
    })
    .filter((option) => option.id);
};

export const parseAcceptedAnswers = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const normalizeQuestion = (question: QuizQuestionDoc): NormalizedQuestion => ({
  id: String(question.id),
  title: question.title,
  prompt: question.prompt,
  questionType: getQuestionType(question),
  options: getChoiceOptions(question),
  explanation: question.explanation,
  attachments: question.attachments,
  acceptedAnswers: parseAcceptedAnswers(question.acceptedAnswers),
  textMatchMode: question.textMatchMode === "exact" ? "exact" : "normalized",
  numericCorrectValue:
    typeof question.numericCorrectValue === "number"
      ? question.numericCorrectValue
      : null,
  numericTolerance:
    typeof question.numericTolerance === "number" ? question.numericTolerance : null,
  numericUnit:
    typeof question.numericUnit === "string" ? question.numericUnit : null,
});

const parseNumeric = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const isQuestionAnswered = (
  question: NormalizedQuestion,
  response?: QuizResponseValue
) => {
  if (!response) return false;
  if (
    question.questionType === "single-select" ||
    question.questionType === "multi-select" ||
    question.questionType === "true-false"
  ) {
    return response.selectedOptionIds.length > 0;
  }
  if (question.questionType === "short-text") {
    return response.textAnswer.trim().length > 0;
  }
  return response.numericAnswer.trim().length > 0;
};

export const gradeQuestionResponse = (
  scoring: NonNullable<QuizDoc["scoring"]>,
  question: NormalizedQuestion,
  response?: QuizResponseValue
) => {
  const answer = response ?? {
    selectedOptionIds: [],
    textAnswer: "",
    numericAnswer: "",
  };

  if (
    question.questionType === "single-select" ||
    question.questionType === "multi-select" ||
    question.questionType === "true-false"
  ) {
    const correctIds = question.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);
    const selectedIds = answer.selectedOptionIds;
    const correctSet = new Set(correctIds);
    const selectedSet = new Set(selectedIds);
    const exactMatch =
      correctIds.length > 0 &&
      correctIds.length === selectedSet.size &&
      correctIds.every((id) => selectedSet.has(id));

    if (scoring === "partial" && question.questionType === "multi-select") {
      if (!correctIds.length) return { score: 0, isCorrect: false };
      const correctSelected = selectedIds.filter((id) => correctSet.has(id)).length;
      const incorrectSelected = selectedIds.filter((id) => !correctSet.has(id)).length;
      const raw = (correctSelected - incorrectSelected) / correctIds.length;
      const score = Math.max(0, Math.min(1, raw));
      return { score, isCorrect: score === 1 };
    }

    return { score: exactMatch ? 1 : 0, isCorrect: exactMatch };
  }

  if (question.questionType === "short-text") {
    const trimmed = answer.textAnswer.trim();
    const normalized =
      question.textMatchMode === "exact"
        ? trimmed
        : normalizeFreeText(trimmed);
    const matched = question.acceptedAnswers.some((candidate) =>
      (question.textMatchMode === "exact"
        ? candidate.trim()
        : normalizeFreeText(candidate)) === normalized
    );
    return { score: matched ? 1 : 0, isCorrect: matched };
  }

  const numericAnswer = parseNumeric(answer.numericAnswer);
  const correctValue = question.numericCorrectValue;
  const tolerance = Math.max(0, question.numericTolerance ?? 0);
  const matched =
    numericAnswer != null &&
    correctValue != null &&
    Math.abs(numericAnswer - correctValue) <= tolerance;
  return { score: matched ? 1 : 0, isCorrect: matched };
};
