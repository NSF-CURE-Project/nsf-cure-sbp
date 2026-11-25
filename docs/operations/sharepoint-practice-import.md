# SharePoint Practice Problem Import

On November 23, 2026, we imported **82 activities** from the CPP SharePoint folder `NSF_CURE_Website_Problems` into the NSF CURE Summer Bridge Program website. The import covers both source folders and all 82 `question.html` packages. The library was verified locally at `/practice` and still requires a production rollout.

## What we imported

| Course | Single-part numeric | Multipart numeric | Interactive simulations | Total activities | Numeric answer fields | Source solutions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Statics | 8 | 31 | 9 | 48 | 152 | 35 |
| Mechanics of Materials | 12 | 22 | 0 | 34 | 69 | 34 |
| **Total** | **20** | **53** | **9** | **82** | **221** | **69** |

Each numeric problem counts once, regardless of its number of answer fields or generated variants. The 73 numeric problems use 72 source generators and one fixed-answer package. The site includes 76 unique PNG assets after deduplication.

### Statics

| SharePoint chapter or review | Numeric problems | Simulations | Total | Answer fields |
| --- | ---: | ---: | ---: | ---: |
| Chapter 2 · Force Vectors | 4 | 0 | 4 | 10 |
| Chapter 3 · Equilibrium of a Particle | 3 | 0 | 3 | 6 |
| Chapter 4 · Force System Resultants | 1 | 0 | 1 | 1 |
| Chapter 5 · Equilibrium of a Rigid Body | 4 | 0 | 4 | 18 |
| Chapter 6 · Structural Analysis | 4 | 0 | 4 | 43 |
| Chapter 7 · Internal Forces | 5 | 6 | 11 | 18 |
| Chapters 9.1 and 10.1–10.4 · Centroids and Moment of Inertia | 10 | 0 | 10 | 22 |
| Review 1 · Free Body Diagram Review | 0 | 3 | 3 | 0 |
| Review 2 · Trigonometry Review | 8 | 0 | 8 | 34 |
| **Statics total** | **39** | **9** | **48** | **152** |

### Mechanics of Materials

| SharePoint chapter | Numeric problems | Answer fields |
| --- | ---: | ---: |
| Chapters 1 and 2 · Stress and Strain | 2 | 4 |
| Chapter 3 · Mechanical Properties of Materials | 2 | 3 |
| Chapter 4 · Axial Load | 4 | 5 |
| Chapter 5 · Torsion | 6 | 11 |
| Chapter 6 · Flexural Bending | 4 | 6 |
| Chapter 7 · Transverse Shear | 4 | 6 |
| Chapter 8 · Combined Loading | 4 | 7 |
| Chapter 9 · Stress Transformations | 4 | 16 |
| Chapter 13 · Buckling of Column | 4 | 11 |
| **Mechanics of Materials total** | **34** | **69** |

## How to repeat the import

1. Open `NSF_CURE_Website_Problems` in SharePoint and choose **Download** at the folder root. Extract the ZIP, keeping the course, chapter, and problem folders intact. The extracted root should directly contain `Static_problems` and `Mechanics_of_materials_problems`.
2. From the repository root, run the importer with the extracted folder path. Use the repository’s Node version and install the dependencies in `payload-cms/` first if this is a fresh checkout.

   ```sh
   node scripts/import-practice-problems.cjs "/path/to/NSF_CURE_Website_Problems"
   ```

3. Check the importer’s totals and any rejected packages. The importer reads the HTML templates, metadata, diagrams, and solutions, then translates the supported arithmetic from each source generator. It writes the catalog and compiled generators under `web/src/lib/practice/` and the diagrams under `web/public/practice-diagrams/`. It stops before replacing the library if any package is rejected. The first import corrected two answer-key mismatches, `sigma` to `stress` in Stress and Strain and `DB` to `BD` in Method of Joints.
4. Run the web app with `pnpm dev` from `web/` and open `/practice`. Confirm both course lists and the expected counts. Spot-check a multipart problem by generating a new variant, refreshing the same variant, and submitting a mix of correct and incorrect answers. Check a solution with a diagram and interact with a simulation. The practice routes use the generated files directly and require no Payload CMS import or database migration.
5. For production, deploy the generated files with the web app and set `ENABLE_PRACTICE_LIBRARY=true` for the web service. Confirm **Learning → Engineering Practice** and `/practice` after deployment.

## Time required

| Step | Time for the November 23 import |
| --- | --- |
| SharePoint ZIP download, about 12.3 MB | **1 minute 52 seconds**, from the local download file timestamps |
| First-time implementation, source fixes, and final import | **About 9 minutes elapsed** from the completed download to final catalog generation, based on file timestamps |
| Importer rerun after extraction | **About 1 second**, measured with dependencies already installed |
| First local request to `/practice` | **About 7 seconds** after the development server was ready, including route compilation |

The first implementation was a one-time cost. For another similarly sized archive with the same structure, budget **15–30 minutes** for downloading, extracting, running the importer, reconciling counts, and spot-checking the local site. This estimate assumes dependencies are installed and the packages pass validation. Reviewing every activity, fixing source defects, and waiting for production deployment are separate from that estimate.

Automated checks covered 10,950 generated instances and per-field grading for all 73 numeric problems. The local catalog returned HTTP 200 and displayed both courses. The interactive simulations still need a browser interaction check before rollout.

## Fidelity lock (do not skip after redesigns)

The SharePoint ZIP is archived at [`fixtures/practice/NSF_CURE_Website_Problems.zip`](../../fixtures/practice/NSF_CURE_Website_Problems.zip). After any import or engine change:

1. `node scripts/verify-practice-fidelity.cjs write-manifest`
2. Confirm CI workflow **Practice Fidelity** is green

See [`practice-fidelity.md`](./practice-fidelity.md) for shell vs engine rules and version bump discipline.
