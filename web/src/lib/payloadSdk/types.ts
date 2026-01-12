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
  options?: QuizQuestionOption[];
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

export type PageLayoutBlock =
  | HeroBlock
  | SectionTitleBlock
  | SectionBlock
  | RichTextBlock
  | TextBlock
  | VideoBlock
  | ListBlock
  | StepsListBlock
  | ButtonBlock
  | ResourcesListBlock
  | ContactsListBlock
  | QuizBlock;

export type LessonBlock = PageLayoutBlock;
