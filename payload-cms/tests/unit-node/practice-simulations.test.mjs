import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import loaders from '../../src/practice/simulations/loaders.generated.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const metadata = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, 'web/src/lib/practice/simulations/metadata.generated.json'),
    'utf8',
  ),
)

const seed = '002c2020-fefe-4fed-98ab-12345678abcd'
const BEAM_IDS = [
  '45206ba973d67862d4f9',
  '93ea300617e378ccd77a',
  '9ce536f917aeddd5b90f',
  'e51a15f4858a558412fb',
  '724f068d8751f2759b93',
  '9881bac7ff1a176d2eee',
]
const FBD_IDS = [
  'e9ec8c282fd1e1deb8c6',
  'd4b360a30a97dd5c13b4',
  'e344d1d649dddd4fd7c3',
]

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

test('beam simulations reject deliberately wrong numeric answers', async () => {
  for (const id of BEAM_IDS) {
    const { default: grade } = await loaders[id]()
    const { results } = grade({ seed, gradeResponses: { values: {}, shear: [], moment: [] } })
    const numeric = results.filter((result) => result.expected != null && Number.isFinite(result.expected))
    if (!numeric.length) continue
    const values = Object.fromEntries(
      numeric.map(({ name, expected }) => [name, String(expected === 0 ? 1 : expected * 3)]),
    )
    const graded = grade({ seed, gradeResponses: { values, shear: [], moment: [] } })
    const checked = graded.results.filter((result) => result.entered)
    assert(checked.length > 0, id)
    assert(checked.some((result) => !result.correct), `${id} should mark wrong answers incorrect`)
  }
})

test('each simulation mounts into a DOM shell and exposes check controls', async () => {
  assert.equal(Object.keys(metadata).length, 9)
  for (const id of [...BEAM_IDS, ...FBD_IDS]) {
    const meta = metadata[id]
    assert.ok(meta?.html, id)
    const load = loaders[id]
    const { default: run } = await load()
    const dom = new JSDOM(`<!doctype html><html><body><div id="host"></div></body></html>`, {
      url: 'https://example.test/practice',
      pretendToBeVisual: true,
    })
    const { document } = dom.window
    const host = document.getElementById('host')
    const style = document.createElement('style')
    style.textContent = meta.css || ''
    const body = document.createElement('div')
    body.className = 'simulation-body'
    body.innerHTML = meta.html
    host.append(style, body)

    let attempts = 0
    run({
      document: {
        getElementById: document.getElementById.bind(document),
        querySelector: document.querySelector.bind(document),
        querySelectorAll: document.querySelectorAll.bind(document),
        createElement: document.createElement.bind(document),
        createElementNS: document.createElementNS.bind(document),
        createTextNode: document.createTextNode.bind(document),
        documentElement: body,
      },
      localStorage: { setItem() {}, getItem() { return null } },
      seed,
      newSeed: () => 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      initialLevel: 'easy',
      onAttempt() { attempts += 1 },
      onVariant() {},
    })

    const check =
      document.getElementById('btnCheck') ||
      body.querySelector('button.primary, button#btnCheck, [data-action="check"]')
    assert.ok(check, `${id} missing check control after mount`)
    // Trigger a check when the original UI exposes the button.
    if (typeof check.click === 'function') check.click()
    dom.window.close()
  }
})
