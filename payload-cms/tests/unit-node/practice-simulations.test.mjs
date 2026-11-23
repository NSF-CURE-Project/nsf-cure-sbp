import assert from 'node:assert/strict'
import test from 'node:test'
import loaders from '../../src/practice/simulations/loaders.generated.mjs'

const seed = '002c2020-fefe-4fed-98ab-12345678abcd'

test('each native simulation regenerates its variant and grades empty work on the server', async () => {
  assert.equal(Object.keys(loaders).length, 9)
  for (const load of Object.values(loaders)) {
    const { default: grade } = await load()
    const responses = { values: {}, shear: [], moment: [], level: 'hard', drawn: {}, components: {} }
    const variant = grade({ seed, gradeResponses: responses })
    assert.deepEqual(variant, grade({ seed, gradeResponses: responses }))
    assert(variant.results.length > 0)
    assert(variant.results.every(({ entered, correct }) => !entered && !correct))
  }
})

test('cantilever pilot grades its numeric answers and full shear and moment diagrams', async () => {
  const { default: grade } = await loaders['45206ba973d67862d4f9']()
  const { parameters: problem, results } = grade({
    seed, gradeResponses: { values: {}, shear: [], moment: [] },
  })
  const shearRow = -problem.P / problem.stepV
  const momentRow = -problem.P * problem.L / problem.stepM
  const graded = grade({ seed, gradeResponses: {
    values: Object.fromEntries(results.slice(0, 4).map(({ name, expected }) => [name, String(expected)])),
    shear: [
      { type: 'vertical', c1: 0, r1: 0, c2: 0, r2: shearRow },
      { type: 'horizontal', c1: 0, r1: shearRow, c2: problem.L, r2: shearRow },
      { type: 'vertical', c1: problem.L, r1: shearRow, c2: problem.L, r2: 0 },
    ],
    moment: [{ type: 'diagonal', c1: 0, r1: 0, c2: problem.L, r2: momentRow }],
  } })
  assert.equal(graded.results.length, 6)
  assert(graded.results.every(({ entered, correct }) => entered && correct))
})
