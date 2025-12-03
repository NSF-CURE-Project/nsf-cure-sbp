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
  objective?: any;
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
  textContent?: any; // Payload richText
  video?: any;
  problemSets?: any[];
  class?: ClassDoc | string | number;
  chapter?: ChapterDoc | string | number;
  updatedAt?: string;
  createdAt?: string;
};
