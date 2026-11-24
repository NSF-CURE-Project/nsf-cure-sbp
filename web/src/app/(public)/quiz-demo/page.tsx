import { notFound } from "next/navigation";

import { QuizFormatsDemoClient } from "@/components/quiz/QuizFormatsDemoClient";

export default function QuizDemoPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <QuizFormatsDemoClient />;
}
