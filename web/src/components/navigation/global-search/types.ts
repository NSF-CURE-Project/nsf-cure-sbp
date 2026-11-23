export type SearchResultKind =
  | "quick"
  | "recent"
  | "topic"
  | "lesson"
  | "chapter"
  | "class"
  | "page"
  | "practice"
  | "action";

export type SearchResultItem = {
  id: string;
  title: string;
  href: string;
  kind: SearchResultKind;
  subtitle?: string;
  badge?: string;
  keywords?: string[];
};

export type SearchSection = {
  id: string;
  label: string;
  items: SearchResultItem[];
};

export type SuggestResponse = {
  results: SearchResultItem[];
  error?: string;
};
