// Run from the repository root: node scripts/import-practice-problems.cjs <extracted folder>
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const ts = require('../payload-cms/node_modules/typescript')
const { JSDOM } = require('../payload-cms/node_modules/jsdom')
const { compileSimulation } = require('./compile-practice-simulation.cjs')

if (!process.argv[2]) throw Error('Pass the extracted NSF_CURE_Website_Problems folder')
const root = path.resolve(process.argv[2])
const web = path.resolve(__dirname, '../web')
const engine = fs.readFileSync(path.join(__dirname, 'practice-engine.mjs'), 'utf8')
const digest = (value) => createHash('sha256').update(value).digest('hex').slice(0, 20)
const own = (name) => !['__proto__', 'prototype', 'constructor'].includes(name)
const mathMethods = new Set(['abs', 'asin', 'atan', 'cos', 'pow', 'round', 'sin', 'sqrt', 'tan'])
const operators = new Set(['+', '-', '*', '/', '**', '>'])

// Emit only the arithmetic subset used by the source packages. Never load or
// evaluate the supplied server.js, including its imports and top-level calls.
function compile(source) {
  const file = ts.createSourceFile('server.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  if (file.parseDiagnostics.length) throw Error('Invalid generator JavaScript')
  const fn = file.statements.filter(ts.isVariableStatement)
    .flatMap((s) => [...s.declarationList.declarations])
    .find((d) => d.name.getText() === 'generate')?.initializer
  if (!fn || !ts.isArrowFunction(fn) || fn.parameters.length || !ts.isBlock(fn.body)) {
    throw Error('Expected a parameterless generate function')
  }
  const locals = new Set()
  function collect(node) {
    if (ts.isBinaryExpression(node) && node.operatorToken.getText() === '=' && ts.isIdentifier(node.left)) {
      locals.add(node.left.text)
    }
    ts.forEachChild(node, collect)
  }
  collect(fn.body)
  const variable = (name) => {
    if (!locals.has(name)) throw Error(`Unknown generator variable: ${name}`)
    return `v[${JSON.stringify(name)}]`
  }
  const key = (name) => {
    if (!own(name)) throw Error('Unsupported property')
    return JSON.stringify(name)
  }
  function expression(node) {
    if (ts.isIdentifier(node)) return variable(node.text)
    if (ts.isStringLiteral(node)) return JSON.stringify(node.text)
    if (ts.isNumericLiteral(node)) return JSON.stringify(Number(node.text))
    if (ts.isParenthesizedExpression(node)) return `(${expression(node.expression)})`
    if (ts.isPrefixUnaryExpression(node) && [ts.SyntaxKind.MinusToken, ts.SyntaxKind.PlusToken].includes(node.operator)) {
      return `(${node.operator === ts.SyntaxKind.MinusToken ? '-' : '+'}${expression(node.operand)})`
    }
    if (ts.isArrayLiteralExpression(node)) return `[${node.elements.map(expression).join(',')}]`
    if (ts.isObjectLiteralExpression(node)) return `{${node.properties.map((p) => {
      if (ts.isShorthandPropertyAssignment(p)) return `${key(p.name.text)}:${variable(p.name.text)}`
      if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) {
        return `${key(p.name.text)}:${expression(p.initializer)}`
      }
      throw Error('Unsupported object property')
    }).join(',')}}`
    if (ts.isBinaryExpression(node) && operators.has(node.operatorToken.getText())) {
      return `(${expression(node.left)} ${node.operatorToken.getText()} ${expression(node.right)})`
    }
    if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.text
      if (['math.pi', 'Math.PI'].includes(node.getText())) return 'Math.PI'
      return `read(${expression(node.expression)},${key(name)})`
    }
    if (ts.isElementAccessExpression(node)) {
      return `read(${expression(node.expression)},${expression(node.argumentExpression)})`
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const target = node.expression.expression.getText()
      const method = node.expression.name.text
      const args = node.arguments.map(expression).join(',')
      if (target === 'math' && ['pickRandom', 'randomInt', 'round'].includes(method)) return `math.${method}(${args})`
      if (['math', 'Math'].includes(target) && mathMethods.has(method)) return `Math.${method}(${args})`
    }
    throw Error(`Unsupported expression: ${node.getText().slice(0, 100)}`)
  }
  function statement(node) {
    if (ts.isBlock(node)) return `{${node.statements.map(statement).join('\n')}}`
    if (ts.isIfStatement(node)) {
      return `if (${expression(node.expression)}) {${statement(node.thenStatement)}}${node.elseStatement ? ` else {${statement(node.elseStatement)}}` : ''}`
    }
    if (ts.isReturnStatement(node) && node.expression) return `return ${expression(node.expression)};`
    if (ts.isExpressionStatement(node)) {
      const expr = node.expression
      if (ts.isCallExpression(expr) && expr.expression.getText() === 'console.log') return ''
      if (ts.isBinaryExpression(expr) && expr.operatorToken.getText() === '=' && ts.isIdentifier(expr.left)) {
        return `${variable(expr.left.text)} = ${expression(expr.right)};`
      }
    }
    throw Error(`Unsupported statement: ${node.getText().slice(0, 100)}`)
  }
  return `(math, read) => { const v = Object.create(null);\n${fn.body.statements.map(statement).join('\n')}\n}`
}

function* files(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* files(filename)
    if (entry.isFile() && entry.name === 'question.html') yield filename
  }
}

const output = path.join(web, 'src/lib/practice')
const mediaDir = path.join(web, 'public/practice-diagrams')
const media = new Map()
const problems = []
const generators = []
const simulations = new Map()
const rejected = []
// These two template keys differ from the keys in their source generators.
const answerAliases = {
  'Mechanics_of_materials_problems/Chapter 1 & 2_Stress and Strain/stressAndStrain1/stressAndStrain1': { sigma: 'stress' },
  'Static_problems/Chapter 6_ Structural Analysis/UCR_ Method of joints_4/Method_of_joints_4': { DB: 'BD' },
}

for (const filename of files(root)) {
  const dir = path.dirname(filename)
  const relative = path.relative(root, dir).split(path.sep)
  const [subject, chapter] = relative
  const id = digest(relative.join('/'))
  const read = (name) => fs.readFileSync(path.join(dir, name), 'utf8')
  const exists = (name) => fs.existsSync(path.join(dir, name))
  const question = read('question.html')
  const dom = new JSDOM(question)
  try {
    const { document } = dom.window
    const title = (exists('info.json') ? JSON.parse(read('info.json')).title : null)
      || document.querySelector('h1')?.textContent || path.basename(dir)
    const item = { id, title: title.trim(), subject, chapter, source: relative.join('/') }
    const inputs = [...document.querySelectorAll('pl-number-input, pl-number-input-fixed')]
    if (!inputs.length && exists('script.js')) {
      // The iframe has an opaque origin and a CSP that prevents network access.
      for (const script of document.querySelectorAll('script[src]')) {
        if (script.getAttribute('src') !== 'script.js') throw Error('Unsupported simulation script')
        script.removeAttribute('src')
        script.textContent = read('script.js').replace(/<\/script/gi, '<\\/script')
      }
      for (const link of document.querySelectorAll('link[rel=stylesheet]')) {
        const name = link.getAttribute('href')
        if (!/^[\w-]+\.css$/.test(name) || !exists(name)) throw Error('Missing simulation stylesheet')
        const style = document.createElement('style')
        style.textContent = read(name).replace(/<\/style/gi, '<\\/style')
        link.replaceWith(style)
      }
      const csp = document.createElement('meta')
      csp.httpEquiv = 'Content-Security-Policy'
      csp.content = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"
      document.head.prepend(csp)
      const native = compileSimulation(path.basename(dir), read)
      if (native) simulations.set(id, native)
      problems.push({ ...item, simulation: dom.serialize(), ...(native ? { version: native.version } : {}) })
      continue
    }
    if (!inputs.length) throw Error('No numeric answer fields')
    const parts = inputs.map((input, index) => {
      const name = input.getAttribute('answers-name')
      const digits = Number(input.getAttribute('digits'))
      const fixed = input.getAttribute('correct-answer-fixed')
      if (!name || !Number.isInteger(digits) || digits < 1 || digits > 15 || input.getAttribute('comparison') !== 'sigfig') {
        throw Error(`Unsupported numeric input at part ${index + 1}`)
      }
      const placeholder = document.createElement('div')
      placeholder.setAttribute('data-practice-part', String(index))
      input.replaceWith(placeholder)
      return {
        name: answerAliases[item.source]?.[name] ?? name,
        digits,
        label: input.getAttribute('label') || name,
        ...(fixed == null ? {} : { fixed: Number(fixed) }),
      }
    })
    function convertHtml(body) {
      for (const figure of body.querySelectorAll('pl-figure')) {
        const name = figure.getAttribute('filename') ?? figure.getAttribute('file-name')
        if (!name || path.basename(name) !== name || !/\.png$/i.test(name)) throw Error('Unsupported diagram reference')
        const actual = fs.readdirSync(dir).find((file) => file.toLowerCase() === name.toLowerCase())
        if (!actual) throw Error(`Missing diagram: ${name}`)
        const bytes = fs.readFileSync(path.join(dir, actual))
        const target = `${digest(bytes)}.png`
        const image = body.ownerDocument.createElement('img')
        image.src = `/practice-diagrams/${target}`
        image.alt = figure.getAttribute('alt') || `Diagram for ${title}`
        figure.replaceWith(image)
        media.set(target, bytes)
      }
      for (const hint of body.querySelectorAll('pl-hint')) {
        const details = body.ownerDocument.createElement('details')
        const summary = body.ownerDocument.createElement('summary')
        summary.textContent = `Hint ${hint.getAttribute('level') || ''}`.trim()
        details.append(summary, ...hint.childNodes)
        hint.replaceWith(details)
      }
      for (const panel of body.querySelectorAll('pl-question-panel, pl-solution-panel')) panel.replaceWith(...panel.childNodes)
      return body.innerHTML.trim()
    }
    const solutionDom = exists('solution.html') ? new JSDOM(read('solution.html')) : null
    try {
      const prompt = convertHtml(document.body)
      const solution = solutionDom ? convertHtml(solutionDom.window.document.body) : ''
      const generator = exists('server.js') ? compile(read('server.js')) : null
      if (!generator && parts.some((part) => part.fixed == null)) throw Error('Missing numeric answer generator')
      const version = digest(JSON.stringify([parts, prompt, solution, generator, engine]))
      problems.push({ ...item, parts, prompt, solution, version })
      if (generator) generators.push(`${JSON.stringify(id)}: ${generator}`)
    } finally {
      solutionDom?.window.close()
    }
  } catch (error) {
    rejected.push({ source: relative.join('/'), reason: error.message })
  } finally {
    dom.window.close()
  }
}

if (!problems.length) throw Error('No supported practice packages found')
if (rejected.length) {
  console.error(JSON.stringify(rejected, null, 2))
  throw Error('Resolve rejected packages before replacing the practice library')
}
fs.mkdirSync(output, { recursive: true })
fs.mkdirSync(mediaDir, { recursive: true })
for (const [name, bytes] of media) fs.writeFileSync(path.join(mediaDir, name), bytes)
fs.writeFileSync(path.join(output, 'catalog.generated.json'), JSON.stringify({ problems }, null, 2) + '\n')
fs.writeFileSync(path.join(output, 'titles.generated.json'), JSON.stringify(Object.fromEntries(
  problems.map(({ id, title }) => [id, title]),
), null, 2) + '\n')
const cmsOutput = path.resolve(__dirname, '../payload-cms/src/practice')
fs.mkdirSync(cmsOutput, { recursive: true })
fs.writeFileSync(path.join(cmsOutput, 'catalog.generated.json'), JSON.stringify(problems.map(({ id, title, subject, chapter, parts }) => ({
  id, title, subject, chapter, kind: parts ? 'numeric' : 'simulation',
})), null, 2) + '\n')
fs.writeFileSync(path.join(cmsOutput, 'numeric.generated.json'), JSON.stringify(problems
  .filter((item) => item.parts)
  .map(({ id, version, parts }) => ({ id, version, parts })), null, 2) + '\n')
for (const destination of [output, cmsOutput]) {
  fs.writeFileSync(path.join(destination, 'generators.generated.mjs'), `// Generated by scripts/import-practice-problems.cjs\nexport default {\n${generators.join(',\n')}\n}\n`)
  fs.writeFileSync(path.join(destination, 'engine.generated.mjs'), engine)
  const simulationDir = path.join(destination, 'simulations')
  fs.mkdirSync(simulationDir, { recursive: true })
  const entries = [...simulations].map(([id, { code }]) => {
    fs.writeFileSync(path.join(simulationDir, `${id}.generated.mjs`), code)
    return `  "${id}": () => import("./${id}.generated.mjs"),`
  })
  fs.writeFileSync(path.join(simulationDir, 'loaders.generated.mjs'), `export default {\n${entries.join('\n')}\n}\n`)
  fs.writeFileSync(path.join(simulationDir, 'metadata.generated.json'), JSON.stringify(Object.fromEntries(
    [...simulations].map(([id, { version, html, css }]) => [id, destination === output ? { version, html, css } : { version }]),
  ), null, 2) + '\n')
}
console.log(JSON.stringify({ imported: problems.length, generators: generators.length, nativeSimulations: simulations.size, diagrams: media.size, rejected }, null, 2))
