import type { PayloadHandler } from 'payload'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })

const buildFormat = (
  id: string,
  label: string,
  description: string,
  quiz: Record<string, unknown>,
) => ({
  id,
  label,
  description,
  quiz,
})

export const demoQuizFormatsHandler: PayloadHandler = async () => {
  return jsonResponse({
    formats: [
      buildFormat(
        'single-select',
        'Single Select',
        'One correct answer. Good for standard multiple-choice comprehension checks.',
        {
          id: 'demo-quiz-single-select',
          title: 'Single-Select Demo Quiz',
          description: 'Staff demo: learners choose one correct option.',
          scoring: 'per-question',
          questions: [
            {
              id: 'demo-question-single-select',
              title: 'Identify the vector quantity',
              prompt:
                'Which of the following quantities includes both magnitude and direction?',
              questionType: 'single-select',
              options: [
                { id: 'single-1', label: 'Mass', isCorrect: false },
                { id: 'single-2', label: 'Force', isCorrect: true },
                { id: 'single-3', label: 'Temperature', isCorrect: false },
                { id: 'single-4', label: 'Energy', isCorrect: false },
              ],
              explanation:
                'Force is a vector quantity because it has both magnitude and direction.',
            },
          ],
        },
      ),
      buildFormat(
        'multi-select',
        'Multi Select',
        'More than one correct answer. Useful for “select all that apply” assessments.',
        {
          id: 'demo-quiz-multi-select',
          title: 'Multi-Select Demo Quiz',
          description: 'Staff demo: learners can select multiple correct options.',
          scoring: 'partial',
          questions: [
            {
              id: 'demo-question-multi-select',
              title: 'Select equilibrium conditions',
              prompt: 'Which statements must be true for a rigid body in static equilibrium?',
              questionType: 'multi-select',
              options: [
                { id: 'multi-1', label: 'Sum of forces equals zero', isCorrect: true },
                { id: 'multi-2', label: 'Sum of moments equals zero', isCorrect: true },
                { id: 'multi-3', label: 'Acceleration is increasing', isCorrect: false },
                { id: 'multi-4', label: 'Net torque is nonzero', isCorrect: false },
              ],
              explanation:
                'Static equilibrium requires both translational equilibrium and rotational equilibrium.',
            },
          ],
        },
      ),
      buildFormat(
        'true-false',
        'True / False',
        'Binary response format for quick concept checks.',
        {
          id: 'demo-quiz-true-false',
          title: 'True / False Demo Quiz',
          description: 'Staff demo: a specialized two-choice quiz format.',
          scoring: 'per-question',
          questions: [
            {
              id: 'demo-question-true-false',
              title: 'Newton’s third law',
              prompt:
                'True or false: Action-reaction force pairs act on two different objects.',
              questionType: 'true-false',
              trueFalseAnswer: true,
              explanation:
                'The equal and opposite forces in a third-law pair always act on different bodies.',
            },
          ],
        },
      ),
      buildFormat(
        'short-text',
        'Short Text',
        'Learners type a short free-response answer checked against accepted responses.',
        {
          id: 'demo-quiz-short-text',
          title: 'Short-Text Demo Quiz',
          description: 'Staff demo: accepts a short typed response.',
          scoring: 'per-question',
          questions: [
            {
              id: 'demo-question-short-text',
              title: 'Name the law',
              prompt:
                'What principle states that the algebraic sum of moments about any point is zero for a body in equilibrium?',
              questionType: 'short-text',
              acceptedAnswers: ['principle of moments', 'moment equilibrium'],
              textMatchMode: 'normalized',
              explanation:
                'This is typically referred to as the principle of moments, or moment equilibrium.',
            },
          ],
        },
      ),
      buildFormat(
        'numeric',
        'Numeric',
        'Learners enter a number and can be graded with a tolerance.',
        {
          id: 'demo-quiz-numeric',
          title: 'Numeric Demo Quiz',
          description: 'Staff demo: numeric entry with tolerance.',
          scoring: 'per-question',
          questions: [
            {
              id: 'demo-question-numeric',
              title: 'Solve for the resultant',
              prompt:
                'Two perpendicular forces of 3 N and 4 N act on a particle. Enter the magnitude of the resultant.',
              questionType: 'numeric',
              numericCorrectValue: 5,
              numericTolerance: 0.05,
              numericUnit: 'N',
              explanation:
                'Using the Pythagorean theorem, the resultant magnitude is 5 N.',
            },
          ],
        },
      ),
    ],
  })
}
