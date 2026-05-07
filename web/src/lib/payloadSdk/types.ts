/** Generic shape of a Payload "find" response */
export type PayloadFindResult<T> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
};

/** Class = your "Classes" collection */
export type ClassDoc = {
  id: string | number;
  title: string;
  description?: string;
  slug: string;
  order?: number | null;
  // When depth > 0, this will be populated
  chapters?: ChapterDoc[] | string[];
};

/** Chapter = your "Chapters" collection */
export type ChapterDoc = {
  id: string | number;
  title: string;
  slug: string;
  chapterNumber?: number | null;
  objective?: unknown;
  // Relationship back to class
  class?: ClassDoc | string | number;
  // When depth > 0, populated
  lessons?: LessonDoc[] | string[];
};

/** Lesson = your "Lessons" collection */
export type LessonDoc = {
  id: string | number;
  title: string;
  slug: string;
  order?: number | null;
  layout?: PageLayoutBlock[];
  assessment?: {
    quiz?: QuizDoc | string | number;
    showAnswers?: boolean;
    maxAttempts?: number | null;
    timeLimitSec?: number | null;
  };
  class?: ClassDoc | string | number;
  chapter?: ChapterDoc | string | number;
  updatedAt?: string;
  createdAt?: string;
};

export type HeroBlock = {
  id?: string;
  blockType: "heroBlock";
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export type SectionTitleBlock = {
  id?: string;
  blockType: "sectionTitle";
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
};

export type SectionBlock = {
  id?: string;
  blockType: "sectionBlock";
  title?: string;
  text?: unknown;
  size?: "sm" | "md" | "lg";
};

export type RichTextBlock = {
  id?: string;
  blockType: "richTextBlock";
  body?: unknown;
};

export type TextSectionBlock = {
  id?: string;
  blockType: "textSection";
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  body?: unknown;
};

export type TextBlock = {
  id?: string;
  blockType: "textBlock";
  text?: string;
};

export type VideoBlock = {
  id?: string;
  blockType: "videoBlock";
  video?: unknown; // upload relation; expect .url
  url?: string;
  caption?: string;
};

export type ListBlockItem = {
  id?: string;
  text?: string;
};

export type ListBlock = {
  id?: string;
  blockType: "listBlock";
  title?: string;
  listStyle?: "unordered" | "ordered";
  items?: ListBlockItem[];
};

export type StepsListItem = {
  id?: string;
  heading?: string;
  description?: unknown;
};

export type StepsListBlock = {
  id?: string;
  blockType: "stepsList";
  title?: string;
  steps?: StepsListItem[];
};

export type ButtonBlock = {
  id?: string;
  blockType: "buttonBlock";
  label?: string;
  href?: string;
};

export type ResourceItem = {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
};

export type ResourcesListBlock = {
  id?: string;
  blockType: "resourcesList";
  title?: string;
  description?: string;
  resources?: ResourceItem[];
};

export type ContactPerson = {
  id?: string;
  name?: string;
  title?: string;
  phone?: string;
  email?: string;
  category?: "staff" | "technical" | string;
  photo?: unknown;
};

export type ContactsListBlock = {
  id?: string;
  blockType: "contactsList";
  title?: string;
  description?: string;
  groupByCategory?: boolean;
  contacts?: ContactPerson[];
};

export type QuizQuestionOption = {
  id?: string;
  label?: string;
  isCorrect?: boolean;
};

export type QuizQuestionDoc = {
  id: string | number;
  title?: string;
  prompt?: unknown;
  questionType?: "single-select" | "multi-select" | "true-false" | "short-text" | "numeric" | string;
  options?: QuizQuestionOption[];
  trueFalseAnswer?: boolean;
  acceptedAnswers?: unknown;
  textMatchMode?: "exact" | "normalized" | string;
  numericCorrectValue?: number | null;
  numericTolerance?: number | null;
  numericUnit?: string | null;
  explanation?: unknown;
  attachments?: unknown;
  topic?: string;
  tags?: string[];
  difficulty?: string;
};

export type QuizDoc = {
  id: string | number;
  title?: string;
  description?: string;
  questions?: (QuizQuestionDoc | string | number)[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  scoring?: "per-question" | "all-or-nothing" | "partial";
  timeLimitSec?: number | null;
  course?: ClassDoc | string | number;
  chapter?: ChapterDoc | string | number;
  tags?: string[];
  difficulty?: "intro" | "easy" | "medium" | "hard" | string;
};

export type QuizBlock = {
  id?: string;
  blockType: "quizBlock";
  title?: string;
  quiz?: QuizDoc | string | number;
  showTitle?: boolean;
  showAnswers?: boolean;
  maxAttempts?: number | null;
  timeLimitSec?: number | null;
};

export type FBDData = {
  type: "fbd";
  body: {
    shape: "rect" | "circle" | "polygon";
    label?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: [number, number][];
  };
  forces: {
    id: string;
    label: string;
    origin: [number, number];
    angle: number;
    magnitude: number;
    color?: string;
  }[];
  dimensions?: {
    from: [number, number];
    to: [number, number];
    label: string;
  }[];
  angles?: {
    vertex: [number, number];
    from: number;
    to: number;
    label: string;
  }[];
};

export type TrussData = {
  type: "truss";
  nodes: {
    id: string;
    x: number;
    y: number;
    support?: "pin" | "roller" | "fixed" | null;
  }[];
  members: { from: string; to: string; id?: string }[];
  loads: { node: string; angle: number; magnitude: number; label?: string }[];
};

export type BeamData = {
  type: "beam";
  length: number;
  scale: number;
  supports: { x: number; type: "pin" | "roller" | "fixed" }[];
  distributedLoads?: {
    xStart: number;
    xEnd: number;
    wStart: number;
    wEnd: number;
    label?: string;
  }[];
  pointLoads?: {
    x: number;
    magnitude: number;
    angle: number;
    label?: string;
  }[];
  moments?: { x: number; value: number; label?: string }[];
  dimensions?: boolean;
};

export type MomentDiagramData = {
  type: "moment-diagram";
  length: number;
  scale: number;
  yScale: number;
  points: { x: number; M: number }[];
  labels?: { x: number; label: string }[];
};

export type EngineeringFigureData =
  | FBDData
  | TrussData
  | BeamData
  | MomentDiagramData;

export type EngineeringFigureDoc = {
  id: string | number;
  title?: string;
  type: EngineeringFigureData["type"];
  description?: string;
  figureData: EngineeringFigureData;
  width?: number;
  height?: number;
  axes?: {
    show?: boolean;
    x?: number;
    y?: number;
    length?: number;
    xLabel?: string;
    yLabel?: string;
  };
};

export type ProblemPart = {
  id?: string;
  label: string;
  prompt?: unknown;
  unit?: string;
  partType?: "numeric" | "symbolic";
  correctAnswer?: number;
  correctAnswerExpression?: string;
  tolerance?: number;
  toleranceType?: "absolute" | "relative";
  significantFigures?: number | null;
  scoringMode?: "threshold" | "linear-decay" | "stepped";
  scoringSteps?: { id?: string; errorBound: number; score: number }[];
  symbolicAnswer?: string;
  symbolicVariables?: {
    id?: string;
    variable: string;
    testMin?: number;
    testMax?: number;
  }[];
  symbolicTolerance?: number;
  explanation?: unknown;
};

export type ProblemResultPlotSegment = {
  id?: string;
  xStart: string;
  xEnd: string;
  formula: string;
};

export type ProblemResultPlotCriticalPoint = {
  id?: string;
  x: string;
  label?: string;
};

export type ProblemResultPlot = {
  id?: string;
  plotType: "shear" | "moment" | "deflection" | "custom";
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xMin?: number;
  xMax?: string;
  segments?: ProblemResultPlotSegment[];
  criticalPoints?: ProblemResultPlotCriticalPoint[];
};

export type ProblemVariantValue = {
  key: string;
  label: string;
  unit?: string | null;
  value: number;
};

export type ProblemDoc = {
  id: string | number;
  title?: string;
  prompt?: unknown;
  difficulty?: "intro" | "easy" | "medium" | "hard" | string;
  topic?: string;
  tags?: string[];
  variant?: {
    seed: string;
    signature: string;
    parameters: ProblemVariantValue[];
    derived: ProblemVariantValue[];
  };
  parts?: ProblemPart[];
};

export type ProblemSetDoc = {
  id: string | number;
  title?: string;
  description?: string;
  problems?: (ProblemDoc | string | number)[];
  showAnswers?: boolean;
  maxAttempts?: number | null;
  shuffleProblems?: boolean;
};

export type ProblemAttemptPartAnswer = {
  id?: string;
  partIndex: number;
  studentAnswer?: number | null;
  studentExpression?: string | null;
  isCorrect?: boolean;
  score?: number;
};

export type ProblemAttemptAnswer = {
  id?: string;
  problem: ProblemDoc | string | number;
  parts?: ProblemAttemptPartAnswer[];
};

export type ProblemAttemptDoc = {
  id: string | number;
  problemSet: ProblemSetDoc | string | number;
  lesson?: LessonDoc | string | number;
  user?: string | number | { id?: string | number };
  startedAt?: string;
  completedAt?: string;
  durationSec?: number | null;
  answers?: ProblemAttemptAnswer[];
  score?: number | null;
  maxScore?: number | null;
  correctCount?: number | null;
};

export type ProblemSetBlock = {
  id?: string;
  blockType: "problemSetBlock";
  title?: string;
  problemSet?: ProblemSetDoc | string | number;
  showTitle?: boolean;
  maxAttempts?: number | null;
  showAnswers?: boolean;
};

export type PageLayoutBlock =
  | HeroBlock
  | SectionTitleBlock
  | SectionBlock
  | RichTextBlock
  | TextSectionBlock
  | TextBlock
  | VideoBlock
  | ListBlock
  | StepsListBlock
  | ButtonBlock
  | ResourcesListBlock
  | ContactsListBlock
  | QuizBlock
  | ProblemSetBlock;

export type LessonBlock = PageLayoutBlock;
