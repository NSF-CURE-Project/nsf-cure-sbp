import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { generateNumeric, matchesSignificantFigures, parseResponse } from '../../src/practice/engine.generated.mjs'

const catalog = JSON.parse(
  fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/practice/numeric.generated.json'),
    'utf8',
  ),
)

/** Fixed seeds used as golden locks against SharePoint-imported generators. */
const GOLDEN_SEEDS = [
  '002c2020-fefe-4fed-98ab-12345678abcd',
  '11111111-2222-4333-8444-555555555555',
  'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
]

test('every numeric problem generates finite answers for golden seeds', () => {
  assert.equal(catalog.length, 73)
  for (const problem of catalog) {
    for (const seed of GOLDEN_SEEDS) {
      const { values } = generateNumeric(problem.id, problem.parts, seed)
      assert.equal(values.length, problem.parts.length, problem.id)
      assert(
        values.every(Number.isFinite),
        `${problem.id} seed ${seed} produced non-finite values: ${values}`,
      )
      for (const [index, part] of problem.parts.entries()) {
        const expected = values[index]
        const asText = expected.toPrecision(part.digits)
        const parsed = parseResponse(asText)
        assert.notEqual(parsed, null, `${problem.id} part ${part.name}`)
        assert(
          matchesSignificantFigures(parsed, expected, part.digits),
          `${problem.id} part ${part.name} failed sig-fig round-trip`,
        )
      }
    }
  }
})

test('numeric generation is deterministic for the same seed', () => {
  const problem = catalog[0]
  const seed = GOLDEN_SEEDS[0]
  const first = generateNumeric(problem.id, problem.parts, seed)
  const second = generateNumeric(problem.id, problem.parts, seed)
  assert.deepEqual(first.values, second.values)
  assert.deepEqual(first.data.params, second.data.params)
})

test('wrong answers do not match significant figures on golden seeds', () => {
  for (const problem of catalog.slice(0, 20)) {
    const { values } = generateNumeric(problem.id, problem.parts, GOLDEN_SEEDS[0])
    for (const [index, part] of problem.parts.entries()) {
      const expected = values[index]
      const wrong = expected === 0 ? 1 : expected * 2
      assert.equal(
        matchesSignificantFigures(wrong, expected, part.digits),
        false,
        `${problem.id} ${part.name}`,
      )
    }
  }
})
