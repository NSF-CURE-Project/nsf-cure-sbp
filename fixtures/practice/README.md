# Practice fidelity fixtures

## SharePoint archive

`NSF_CURE_Website_Problems.zip` is the frozen SharePoint download used as the
behavioral source of truth for Engineering Practice.

Re-import (writes into the repo practice libraries):

```sh
unzip -q fixtures/practice/NSF_CURE_Website_Problems.zip -d /tmp
node scripts/import-practice-problems.cjs /tmp/NSF_CURE_Website_Problems
node scripts/verify-practice-fidelity.cjs write-manifest
```

Drift check without touching committed files (uses temp outputs):

```sh
node scripts/verify-practice-fidelity.cjs import-drift
```

Or point at an extracted folder:

```sh
SHAREPOINT_PRACTICE_ROOT=/path/to/NSF_CURE_Website_Problems \
  node scripts/verify-practice-fidelity.cjs import-drift
```

## Golden manifest

`golden-manifest.json` locks SHA-256 hashes of engine files (`*.generated.*`)
and per-problem `version` digests. UI redesigns must not change it. Intentional
SharePoint re-imports must update versions, then regenerate the manifest.
