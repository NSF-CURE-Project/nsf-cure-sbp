# Practice fidelity (SharePoint lock)

Goal: after UI redesigns, interactive and numeric practice problems still behave
exactly as they did when imported from SharePoint.

## Shell vs engine

| Layer | Paths | May change in redesigns? |
| --- | --- | --- |
| **Engine** | `web/src/lib/practice/**/*.generated.*`, `payload-cms/src/practice/**/*.generated.*`, `scripts/practice-engine.mjs`, importer/compiler | **No** — only via intentional re-import |
| **Shell** | `web/src/app/(public)/practice/**`, `PracticeLibrary`, beam workspace CSS/enhancers | **Yes** — layout, chrome, progress UI |

Rules:

1. Redesign PRs edit shell files only.
2. Engine file hash changes fail CI (`verify-practice-fidelity.cjs verify`).
3. Shell files must not rewrite generators or embed answer math (`check-boundary`).

## Version bump discipline

Each numeric/simulation problem stores a content `version` digest from the
importer (`scripts/import-practice-problems.cjs`). That digest covers parts,
prompt, solution, generator, and engine source (or simulation script/CSS).

- **Cosmetic shell change** → versions stay the same; golden manifest stays the same.
- **Intentional SharePoint / generator change** → re-run the importer, review
  changed versions, then run `node scripts/verify-practice-fidelity.cjs write-manifest`.
- In-flight student attempts with an old version get a refresh/conflict from
  `/api/practice-attempts/record` (`409` when versions disagree).

Never hand-edit `version` fields without regenerating engines from SharePoint.

## CI gates

Workflow: `.github/workflows/practice-fidelity.yml`

1. Boundary + golden manifest verify
2. Import-drift against `fixtures/practice/NSF_CURE_Website_Problems.zip`
3. Numeric golden seed tests (73 problems × fixed seeds)
4. Simulation grade + DOM mount tests
5. Playwright smoke: open each of the 9 sims with a fixed variant and click Check

## Local commands

```sh
# Lock current engines
node scripts/verify-practice-fidelity.cjs write-manifest

# Verify engines + shell boundary
node scripts/verify-practice-fidelity.cjs verify

# Re-import SharePoint ZIP into temp dirs and compare versions
node scripts/verify-practice-fidelity.cjs import-drift

# Unit goldens
cd payload-cms && pnpm test:unit:node

# Browser smoke (requires web build with ENABLE_PRACTICE_LIBRARY=true)
cd web && ENABLE_PRACTICE_LIBRARY=true pnpm build && pnpm exec playwright test
```
