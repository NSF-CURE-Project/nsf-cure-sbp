import type { Lesson, User } from '@/payload-types'
import type { Payload, Where } from 'payload'
import catalog from '../../practice/catalog.generated.json'

const titles = new Map(catalog.map((item) => [item.id, item.title]))

export async function LessonPracticeProgress({ payload, lesson, courseId, actor }: {
  payload: Payload
  lesson: Lesson
  courseId: number
  actor: Pick<User, 'id' | 'role'>
}) {
  if (!lesson.layout?.some((block) => block.blockType === 'practiceProblem')) return null
  if (!['admin', 'staff', 'professor'].includes(actor.role ?? '')) return null

  const scope: Where[] = [{ lesson: { equals: lesson.id } }]
  if (actor.role === 'professor') {
    const lessonCourse = typeof lesson.chapter === 'object' ? lesson.chapter.class : null
    const actualCourseId = typeof lessonCourse === 'object' ? lessonCourse?.id : lessonCourse
    if (actualCourseId !== courseId) return null
    const classrooms = await payload.find({
      collection: 'classrooms', depth: 0, pagination: false,
      where: { and: [{ class: { equals: courseId } }, { professor: { equals: actor.id } }] },
    })
    if (!classrooms.docs.length) return null
    const members = await payload.find({
      collection: 'classroom-memberships', depth: 0, pagination: false,
      where: { classroom: { in: classrooms.docs.map(({ id }) => id) } },
    })
    const learners = [...new Set(members.docs.map(({ student }) => typeof student === 'object' ? student?.id : student)
      .filter((id): id is number => typeof id === 'number'))]
    if (!learners.length) return null
    scope.push({ learner: { in: learners } })
  }

  const { docs } = await payload.find({
    collection: 'practice-attempts', where: { and: scope }, depth: 1,
    pagination: false, sort: '-createdAt', overrideAccess: true,
  })
  const summary = new Map<string, {
    learner: string; title: string; count: number; completion: boolean; best: number | null
  }>()
  for (const row of docs) {
    const learnerId = typeof row.learner === 'object' ? row.learner.id : row.learner
    const key = `${learnerId}:${row.assignmentKey}`
    const current = summary.get(key) ?? {
      learner: typeof row.learner === 'object' && row.learner.fullName ? row.learner.fullName : `Student ${learnerId}`,
      title: titles.get(row.problemId) ?? 'Archived problem',
      count: 0, completion: false, best: null,
    }
    if (row.submitted) current.count += 1
    current.completion ||= Boolean(row.completed)
    if (row.score != null && row.maxScore) current.best = Math.max(current.best ?? 0, Math.round(100 * row.score / row.maxScore))
    summary.set(key, current)
  }

  return (
    <section aria-labelledby="practice-progress-heading" style={{ marginTop: 32 }}>
      <h2 id="practice-progress-heading">Practice progress</h2>
      {summary.size ? (
        <div style={{ overflowX: 'auto' }}>
          <table cellPadding={8} style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead><tr><th>Student</th><th>Problem</th><th>Status</th><th>Attempts</th><th>Best score</th></tr></thead>
            <tbody>
              {[...summary].map(([key, row]) => (
                <tr key={key}>
                  <td>{row.learner}</td><td>{row.title}</td>
                  <td>{row.completion ? 'Completed' : row.count ? 'Attempted' : 'Opened'}</td>
                  <td>{row.count}</td><td>{row.best == null ? '—' : `${row.best}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p>No students have opened an assigned practice problem yet.</p>}
    </section>
  )
}
