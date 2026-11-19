export const courseLevels = ["easy", "medium", "challenging"] as const;
export type CourseLevel = typeof courseLevels[number];

export type LevelScore = { bestScore: number | null; attempts: number; active: boolean };
export function lessonScores(rows: { difficulty: string; best: unknown; submitted: unknown; active: unknown }[]) {
  const scores: Record<CourseLevel, LevelScore> = {
    easy: { bestScore: null, attempts: 0, active: false },
    medium: { bestScore: null, attempts: 0, active: false },
    challenging: { bestScore: null, attempts: 0, active: false },
  };
  for (const level of courseLevels) {
    const row = rows.find(item => item.difficulty === level);
    if (row) scores[level] = {
      bestScore: row.best == null ? null : Number(row.best),
      attempts: Number(row.submitted) || 0,
      active: Number(row.active) > 0,
    };
  }
  return scores;
}

export function courseOverview<T extends { completed: boolean; unlocked: boolean; standard: boolean }>(lessons: T[]) {
  const total = lessons.length;
  const completed = lessons.filter(lesson => lesson.completed).length;
  return {
    total, completed,
    percentage: total ? Math.floor(completed / total * 100) : 0,
    courseComplete: total > 0 && completed === total && lessons.every(lesson => lesson.standard),
    nextLesson: lessons.find(lesson => lesson.unlocked && !lesson.completed) ?? null,
  };
}
