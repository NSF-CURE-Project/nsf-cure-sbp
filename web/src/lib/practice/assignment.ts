export type PracticeAssignment = { lessonId: number; assignmentKey: string; problemId: string };

export const practiceUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
