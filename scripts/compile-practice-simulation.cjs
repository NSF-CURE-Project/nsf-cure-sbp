const { createHash } = require('node:crypto')
const { JSDOM } = require('../payload-cms/node_modules/jsdom')

// Native mounts share the website's origin. Only these exact source packages
// are promoted from the sandbox. Changed packages keep the sandbox fallback.
const reviewed = {
  interactiveCantileverpointload: 'c1c47b8b53a3bb1fe7665b3e2ce6073de98f5ce62fe59366fec57df9d0ab57ee',
  interactiveCantileverpointloadany: '46277c6dc545b5f89210727c24e85c6d2d254424bd17a9a4f8e7daecfe73eb40',
  interactiveCantileverudl: '5f60295d83ce2aabf377198f527bd1260e9e87ac581ca2dd3ff0dadecce20e51',
  interactivePointload: '7e4eea65558d9890f25b2f70f97b90b5b88c23cb4dcf08544914428872b3f230',
  interactiveTwopointloads: '08559f84886b902824c1c600c50faaa3fadf00e2a0ab01661e5f632bde6d0b3b',
  interactiveUdl: 'f2c6c8f5c85c74ef11c33a9ff65b57d7819cda167a73d0532a2dd6ec5b62a303',
  interactiveBallonanincline: 'c3968f3418916a4a5d27d20032c7c7c5dd4b4932bd20cbdf62599ad40d53f048',
  interactiveWeighthangingfromcables: '7ca2716a86efb8dcc7c95331e34b148fe88360659409e740f530b6ab13ad4168',
  interactiveWeighthangingfrompulley: 'b717244037ec4788377ded6e3df674931efb51131bdcb5593d9e91560190c886',
}

const replace = (source, old, next) => {
  if (!source.includes(old)) throw Error(`Simulation adapter could not find ${old}`)
  return source.replace(old, () => next)
}

const random = `
  let randomState;
  let currentSeed;
  function resetRandom(seed, level) {
    currentSeed = seed;
    randomState = parseInt(seed.slice(0, 8), 16) >>> 0;
    onVariant?.(seed, level);
  }
  function random() {
    let next = (randomState = (randomState + 0x6d2b79f5) | 0);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  }
`

function beam(source) {
  const modern = source.includes('const CASE =')
  const fields = source.match(/const FIELDS = (?:CASE\.fields;|\[[\s\S]*?\n\];)/)?.[0]
  if (!fields) throw Error('Missing beam fields')
  const grade = `
    if (gradeResponses) {
      resetRandom(seed);
      const problem = generateProblem();
      const diagrams = ${modern ? 'CASE.expected(problem)' : '{ shear: expectedShear(problem), moment: expectedMoment(problem) }'};
      const results = FIELDS.map((field) => {
        const response = gradeResponses.values?.[field.id];
        const entered = typeof response === "string" && response.trim() !== "" && Number.isFinite(Number(response));
        const expected = problem[field.key];
        return { name: field.id, entered, correct: entered && checkNumber(response, expected, field.abs) === "ok", expected };
      });
      for (const name of ["shear", "moment"]) {
        const expected = diagrams[name];
        const segments = gradeResponses[name] ?? [];
        const comparison = ${modern ? '{ required: expected.required.map(toPolyline), optional: expected.optional.map(toPolyline) }' : 'expected'};
        results.push({ name, entered: segments.length > 0, correct: gradeDiagram(segments, comparison).ok });
      }
      return { parameters: problem, results };
    }
  `
  let script = replace(source, fields, '')
  script = replace(script, 'const el = {', `${fields}\n${grade}\nconst el = {`)
  script = script.replace(/const urlParams =[^\n]+\nconst rng =[^\n]+/, 'const rng = random;')
  script = replace(script, 'function newProblem() {', `function newProblem() {
    resetRandom(currentSeed ? newSeed() : seed);
    lastKey = null;`)
  script = replace(script,
    'document.getElementById("btnCheck").addEventListener("click", runCheck);',
    `document.getElementById("btnCheck").addEventListener("click", () => {
      runCheck();
      onAttempt?.(currentSeed, {
        values: Object.fromEntries(FIELDS.map((field) => [field.id, document.getElementById("in-" + field.id).value])),
        shear: shearEditor.segments,
        moment: momentEditor.segments,
      });
    });`)
  return script.slice(0, script.indexOf('window.__quiz ='))
}

function freeBody(source) {
  let script = source.replace(/^([\s\S]*?)\(function \(\) \{/, '$1').replace(/\}\)\(\);\s*$/, '')
  script = script.replaceAll('Math.random', 'random')
  script = replace(script, 'const svg =', `
    if (gradeResponses) {
      const level = Object.hasOwn(LEVELS, gradeResponses.level) ? gradeResponses.level : "easy";
      resetRandom(seed, level);
      const problem = makeProblem(level, null);
      const cfg = LEVELS[level];
      const drawn = gradeResponses.drawn ?? {};
      const results = [];
      for (const name of [...cfg.present, ...(cfg.compIds ?? [])]) {
        const angle = drawn[name]?.angle;
        const expected = forceSpec(problem, name).angle;
        const entered = Number.isFinite(angle);
        results.push({ name, entered, correct: entered && Math.abs(angDiff(angle, expected)) <= TOL_DIR, expected });
      }
      for (const name of cfg.palette.filter((name) => !cfg.present.includes(name))) {
        if (Number.isFinite(drawn[name]?.angle)) results.push({ name, entered: true, correct: false });
      }
      for (const { id, ref } of problem.resolve ?? cfg.resolve) {
        const expected = expectedComponents(problem, id, ref);
        const values = gradeResponses.components?.[id] ?? {};
        const check = (key, target, angle = false) => {
          const value = values[key];
          const entered = typeof value === "string" && value !== "" && (!angle || Number.isFinite(Number(value)));
          results.push({ name: id + "." + key, entered, expected: target,
            correct: entered && (angle ? Math.abs(Number(value) - target) <= TOL_ANGLE : value === target) });
        };
        if (ref === "both") {
          check("angleV", expected.alphaV, true);
          check("angleH", expected.alphaH, true);
          for (const component of ["x", "y"]) {
            const key = component + "Axis";
            const axis = values[key];
            const entered = axis === "vertical" || axis === "horizontal";
            results.push({ name: id + "." + key, entered, correct: entered });
            check(component + "Fn", entered ? fnFor(component, axis) : null);
            check(component + "Dir", expected[component + "Dir"]);
          }
        } else {
          check("angle", expected.alpha, true);
          for (const key of ["xFn", "xDir", "yFn", "yDir"]) check(key, expected[key]);
        }
      }
      return { parameters: problem, results };
    }
    const svg =`)
  // The grading branch needs the helper initialized before its early return.
  const fnFor = script.match(/const fnFor = [^\n]+/)?.[0]
  if (!fnFor) throw Error('Missing FBD helper')
  script = replace(script, fnFor, '')
  script = replace(script, 'if (gradeResponses) {', `${fnFor}\n    if (gradeResponses) {`)
  script = replace(script, 'function startProblem(level) {', `function startProblem(level) {
    resetRandom(currentSeed ? newSeed() : seed, level);
    state.problem = null;`)
  script = script.replace("startProblem('easy');", 'startProblem(initialLevel);')
  const capture = `
    function submit(step) {
      const components = {};
      for (const card of document.querySelectorAll(".comp-card[data-force]")) {
        components[card.dataset.force] = Object.fromEntries(
          Array.from(card.querySelectorAll("[data-k]"), (field) => [field.dataset.k, field.value])
        );
      }
      onAttempt?.(currentSeed, { step, level: state.level, drawn: state.drawn, components });
    }
  `
  for (const [selector, callback, step] of [['#check1', 'checkStep1', 'forces'], ['#checkc', 'checkComps', 'components'], ['#check2', 'checkStep2', 'resolve']]) {
    script = replace(script, `$('${selector}').addEventListener('click', ${callback});`,
      `$('${selector}').addEventListener('click', () => { ${callback}(); submit("${step}"); });`)
  }
  return capture + script
}

function compileSimulation(folderName, read) {
  if (!Object.hasOwn(reviewed, folderName)) return null
  const files = ['question.html', 'script.js', 'style.css'].map((name) => [name, read(name)])
  const hash = createHash('sha256').update(JSON.stringify(files)).digest('hex')
  if (hash !== reviewed[folderName]) return null
  const [[, html], [, source], [, css]] = files
  const dom = new JSDOM(html)
  try {
    const document = dom.window.document
    document.querySelectorAll('script, h1').forEach((node) => node.remove())
    const code = `export default function runSimulation({ document, localStorage, seed, newSeed, initialLevel = "easy", onAttempt, onVariant, gradeResponses }) {
${random}
${source.includes('const LEVELS =') ? freeBody(source.replaceAll('\r\n', '\n')) : beam(source.replaceAll('\r\n', '\n'))}
}\n`
    return {
      version: createHash('sha256').update(hash).update(code).digest('hex').slice(0, 20),
      html: document.body.innerHTML.trim(),
      css: css.replaceAll(':root', '.simulation-body').replace(/\bbody\s*\{/g, '.simulation-body {'),
      code,
    }
  } finally {
    dom.window.close()
  }
}

module.exports = { compileSimulation }
