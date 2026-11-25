#!/usr/bin/env node
/**
 * Practice fidelity lock against the archived SharePoint import.
 *
 * Usage:
 *   node scripts/verify-practice-fidelity.cjs write-manifest
 *   node scripts/verify-practice-fidelity.cjs verify
 *   node scripts/verify-practice-fidelity.cjs import-drift
 *   node scripts/verify-practice-fidelity.cjs check-boundary
 *
 * import-drift extracts fixtures/practice/NSF_CURE_Website_Problems.zip (or
 * SHAREPOINT_PRACTICE_ROOT) and re-runs the importer into a temp directory,
 * then compares behavior-critical outputs to the committed library.
 */
const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const { spawnSync } = require('node:child_process')
const os = require('node:os')

const root = path.resolve(__dirname, '..')
const fixtureZip = path.join(root, 'fixtures/practice/NSF_CURE_Website_Problems.zip')
const manifestPath = path.join(root, 'fixtures/practice/golden-manifest.json')

/** Files that encode SharePoint behavior (engines). UI chrome must not change these. */
const ENGINE_GLOBS = [
  'web/src/lib/practice/catalog.generated.json',
  'web/src/lib/practice/engine.generated.mjs',
  'web/src/lib/practice/generators.generated.mjs',
  'web/src/lib/practice/numeric.generated.json',
  'web/src/lib/practice/simulations/loaders.generated.mjs',
  'web/src/lib/practice/simulations/metadata.generated.json',
  'payload-cms/src/practice/numeric.generated.json',
  'payload-cms/src/practice/engine.generated.mjs',
  'payload-cms/src/practice/generators.generated.mjs',
  'payload-cms/src/practice/simulations/loaders.generated.mjs',
  'payload-cms/src/practice/simulations/metadata.generated.json',
]

const ENGINE_SIM_PATTERN = /\/simulations\/[0-9a-f]{20}\.generated\.mjs$/

/** Redesign-safe shell files — must not rewrite generators. */
const SHELL_FILES = [
  'web/src/app/(public)/practice/[id]/enhanceBeamWorkspace.ts',
  'web/src/app/(public)/practice/[id]/beamWorkspaceStyles.ts',
  'web/src/app/(public)/practice/[id]/beamWorkspace.css',
  'web/src/app/(public)/practice/[id]/NativeSimulation.tsx',
  'web/src/app/(public)/practice/[id]/PracticeForm.tsx',
  'web/src/app/(public)/practice/[id]/SimulationFrame.tsx',
  'web/src/components/practice/PracticeLibrary.tsx',
]

function sha256File(filePath) {
  const hash = createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('hex')
}

function listEngineFiles() {
  const files = new Set(ENGINE_GLOBS.map((rel) => path.join(root, rel)).filter((p) => fs.existsSync(p)))
  for (const dir of [
    path.join(root, 'web/src/lib/practice/simulations'),
    path.join(root, 'payload-cms/src/practice/simulations'),
  ]) {
    if (!fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      if (ENGINE_SIM_PATTERN.test(full.replace(/\\/g, '/'))) files.add(full)
    }
  }
  return [...files].sort()
}

function buildManifest() {
  const files = {}
  for (const full of listEngineFiles()) {
    const rel = path.relative(root, full).replace(/\\/g, '/')
    files[rel] = sha256File(full)
  }
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'web/src/lib/practice/catalog.generated.json'), 'utf8'))
  const problems = catalog.problems.map(({ id, version, title, parts }) => ({
    id,
    version,
    title,
    kind: parts ? 'numeric' : 'simulation',
    partCount: parts?.length ?? 0,
  }))
  return {
    generatedAt: new Date().toISOString(),
    sourceArchive: 'fixtures/practice/NSF_CURE_Website_Problems.zip',
    problemCount: problems.length,
    problems,
    files,
  }
}

function writeManifest() {
  const manifest = buildManifest()
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log(JSON.stringify({
    wrote: path.relative(root, manifestPath),
    files: Object.keys(manifest.files).length,
    problems: manifest.problemCount,
  }, null, 2))
}

function verifyManifest() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing golden manifest. Run: node scripts/verify-practice-fidelity.cjs write-manifest`)
  }
  const expected = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const actual = buildManifest()
  const missing = []
  const changed = []
  const extra = []
  for (const [rel, hash] of Object.entries(expected.files)) {
    if (!actual.files[rel]) missing.push(rel)
    else if (actual.files[rel] !== hash) changed.push(rel)
  }
  for (const rel of Object.keys(actual.files)) {
    if (!expected.files[rel]) extra.push(rel)
  }
  const versionDrift = []
  const expectedById = new Map(expected.problems.map((p) => [p.id, p]))
  for (const problem of actual.problems) {
    const prev = expectedById.get(problem.id)
    if (!prev) {
      versionDrift.push({ id: problem.id, reason: 'new-problem' })
      continue
    }
    if (prev.version !== problem.version) {
      versionDrift.push({
        id: problem.id,
        title: problem.title,
        reason: 'version-changed',
        from: prev.version,
        to: problem.version,
      })
    }
  }
  if (missing.length || changed.length || extra.length) {
    console.error(JSON.stringify({ ok: false, missing, changed, extra, versionDrift }, null, 2))
    throw new Error(
      'Practice engine files drifted from the golden manifest. ' +
        'If this is an intentional SharePoint re-import, bump/review versions and run write-manifest. ' +
        'UI-only redesigns must not change engine files.',
    )
  }
  console.log(JSON.stringify({
    ok: true,
    files: Object.keys(actual.files).length,
    problems: actual.problemCount,
    versionDrift,
  }, null, 2))
  if (versionDrift.length) {
    throw new Error(
      'Problem versions changed without a matching golden-manifest update. ' +
        'Re-import intentionally, then run write-manifest after reviewing version bumps.',
    )
  }
}

function checkBoundary() {
  const violations = []
  for (const rel of SHELL_FILES) {
    const full = path.join(root, rel)
    if (!fs.existsSync(full)) continue
    const text = fs.readFileSync(full, 'utf8')
    if (/\.generated\.mjs/.test(text) && /writeFileSync|fs\.write|generators\.generated/.test(text)) {
      violations.push({ file: rel, reason: 'shell file appears to rewrite generated engines' })
    }
    // Shell may import loaders for runtime, but must not embed generator math.
    if (/math\.pickRandom|correct_answers\s*=/.test(text)) {
      violations.push({ file: rel, reason: 'shell file looks like it embeds generator logic' })
    }
  }
  if (violations.length) {
    console.error(JSON.stringify({ ok: false, violations }, null, 2))
    throw new Error('Shell/engine boundary violated')
  }
  console.log(JSON.stringify({
    ok: true,
    shellFilesChecked: SHELL_FILES.filter((rel) => fs.existsSync(path.join(root, rel))).length,
    engineFiles: listEngineFiles().length,
    rule: 'Redesigns may edit shell files; engine *.generated.* require intentional re-import + write-manifest',
  }, null, 2))
}

function resolveSharePointRoot() {
  if (process.env.SHAREPOINT_PRACTICE_ROOT) {
    return path.resolve(process.env.SHAREPOINT_PRACTICE_ROOT)
  }
  if (!fs.existsSync(fixtureZip)) {
    throw new Error(`Missing archive at ${fixtureZip}`)
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sbp-practice-'))
  const extract = spawnSync('unzip', ['-q', '-o', fixtureZip, '-d', tmp], { encoding: 'utf8' })
  if (extract.status !== 0) {
    throw new Error(`Failed to extract SharePoint archive: ${extract.stderr || extract.stdout}`)
  }
  const candidates = [
    path.join(tmp, 'NSF_CURE_Website_Problems'),
    tmp,
  ]
  for (const candidate of candidates) {
    if (
      fs.existsSync(path.join(candidate, 'Static_problems')) ||
      fs.existsSync(path.join(candidate, 'Mechanics_of_materials_problems'))
    ) {
      return candidate
    }
  }
  // ZIP may nest one extra folder
  for (const name of fs.readdirSync(tmp)) {
    const nested = path.join(tmp, name)
    if (fs.existsSync(path.join(nested, 'Static_problems'))) return nested
  }
  throw new Error('Could not locate Static_problems inside extracted archive')
}

function importDrift() {
  const sourceRoot = resolveSharePointRoot()
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'sbp-practice-out-'))
  const webOut = path.join(out, 'web-practice')
  const cmsOut = path.join(out, 'cms-practice')
  const mediaOut = path.join(out, 'practice-diagrams')
  fs.mkdirSync(webOut, { recursive: true })
  fs.mkdirSync(cmsOut, { recursive: true })
  fs.mkdirSync(mediaOut, { recursive: true })

  const result = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/import-practice-problems.cjs'), sourceRoot],
    {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PRACTICE_WEB_OUTPUT: webOut,
        PRACTICE_CMS_OUTPUT: cmsOut,
        PRACTICE_MEDIA_DIR: mediaOut,
      },
    },
  )
  if (result.status !== 0) {
    throw new Error(`Importer failed:\n${result.stdout}\n${result.stderr}`)
  }

  const committed = JSON.parse(
    fs.readFileSync(path.join(root, 'web/src/lib/practice/catalog.generated.json'), 'utf8'),
  )
  const fresh = JSON.parse(fs.readFileSync(path.join(webOut, 'catalog.generated.json'), 'utf8'))
  const beforeById = new Map(committed.problems.map((p) => [p.id, p]))
  const afterById = new Map(fresh.problems.map((p) => [p.id, p]))
  const mismatches = []
  if (committed.problems.length !== fresh.problems.length) {
    mismatches.push({
      reason: 'count',
      before: committed.problems.length,
      after: fresh.problems.length,
    })
  }
  for (const [id, prev] of beforeById) {
    const next = afterById.get(id)
    if (!next) {
      mismatches.push({ id, reason: 'missing-after-reimport' })
      continue
    }
    if (prev.version !== next.version) {
      mismatches.push({
        id,
        title: prev.title,
        reason: 'version',
        before: prev.version,
        after: next.version,
      })
    }
  }
  for (const id of afterById.keys()) {
    if (!beforeById.has(id)) mismatches.push({ id, reason: 'new-after-reimport' })
  }

  // Engine file hashes for generators / sims must match committed copies.
  for (const name of ['engine.generated.mjs', 'generators.generated.mjs']) {
    const a = sha256File(path.join(root, 'web/src/lib/practice', name))
    const b = sha256File(path.join(webOut, name))
    if (a !== b) mismatches.push({ reason: 'file-hash', file: name })
  }

  if (mismatches.length) {
    console.error(JSON.stringify({ ok: false, mismatches, importer: result.stdout }, null, 2))
    throw new Error(
      'Re-import from archived SharePoint ZIP drifted from the committed practice library. ' +
        'Restore intentional changes via import + write-manifest, or fix the archive.',
    )
  }
  console.log(JSON.stringify({
    ok: true,
    problems: fresh.problems.length,
    source: sourceRoot,
    note: 'Committed library matches re-import from archived SharePoint ZIP',
  }, null, 2))
}

const command = process.argv[2] || 'verify'
if (command === 'write-manifest') writeManifest()
else if (command === 'verify') {
  checkBoundary()
  verifyManifest()
}
else if (command === 'import-drift') importDrift()
else if (command === 'check-boundary') checkBoundary()
else throw new Error(`Unknown command: ${command}`)
