import { getPayload, type Payload } from "payload";
import configPromise from "@payload-config";
import type { EngineeringFigure, Problem, ProblemSet } from "../payload-types";

const EXAMPLE_FIGURE_TITLE = "Statics Fundamentals — Simply Supported Beam FBD";
const EXAMPLE_PROBLEM_TITLE = "Statics Fundamentals — Reactions of a Simply Supported Beam";
const EXAMPLE_SET_TITLE = "Statics Fundamentals — Beam Equilibrium Starter";

const ensureNumericId = (value: unknown, label: string): number => {
  const maybeId =
    typeof value === "object" && value !== null && "id" in value
      ? (value as { id?: unknown }).id
      : value;

  const asNumber =
    typeof maybeId === "number"
      ? maybeId
      : typeof maybeId === "string"
      ? Number.parseInt(maybeId, 10)
      : Number.NaN;

  if (!Number.isFinite(asNumber)) {
    throw new Error(`Expected numeric ${label} id but received ${String(maybeId)}`);
  }

  return asNumber;
};

const richText = (text: string): Problem["prompt"] => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        children: [
          {
            type: "text",
            text,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
        direction: "ltr",
        textFormat: 0,
        textStyle: "",
      },
    ],
    direction: "ltr",
  },
});

async function upsertEngineeringFigure(payload: Payload) {
  const existing = await payload.find({
    collection: "engineering-figures",
    where: { title: { equals: EXAMPLE_FIGURE_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: Partial<EngineeringFigure> = {
    title: EXAMPLE_FIGURE_TITLE,
    type: "fbd" as const,
    description:
      "Beam free-body diagram with support reactions at A and B and a centered downward point load P.",
    width: 680,
    height: 400,
    figureData: {
      type: "fbd",
      body: {
        shape: "rect",
        label: "Beam AB",
        x: 140,
        y: 190,
        width: 400,
        height: 24,
      },
      forces: [
        { id: "Ra", label: "R_A", origin: [160, 214], angle: 90, magnitude: 1, color: "#2563eb" },
        { id: "P", label: "P", origin: [340, 190], angle: 270, magnitude: 1, color: "#ef4444" },
        { id: "Rb", label: "R_B", origin: [520, 214], angle: 90, magnitude: 1, color: "#16a34a" },
      ],
      dimensions: [{ from: [160, 270], to: [520, 270], label: "L = 8 m" }],
    },
  };

  if (!existing.docs.length) {
    return payload.create({
      collection: "engineering-figures",
      data,
      depth: 0,
      overrideAccess: true,
    } as never);
  }

  return payload.update({
    collection: "engineering-figures",
    id: existing.docs[0].id,
    data,
    depth: 0,
    overrideAccess: true,
  } as never);
}

async function upsertProblem(payload: Payload, figureId: number) {
  const existing = await payload.find({
    collection: "problems",
    where: { title: { equals: EXAMPLE_PROBLEM_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: Partial<Problem> = {
    title: EXAMPLE_PROBLEM_TITLE,
    prompt: richText(
      "A simply supported beam has span L = 8 m and a downward point load P = 12 kN at midspan. Compute support reactions and identify the fundamental shear diagram shape."
    ),
    figure: figureId,
    difficulty: "intro",
    topic: "statics",
    tags: ["equilibrium", "beam", "support-reactions", "fundamentals"],
    parts: [
      {
        label: "Ra",
        prompt: richText("Find the vertical reaction at support A in kN."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: 6,
        tolerance: 0.03,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("By symmetry and sum of moments, R_A = R_B = P/2 = 6 kN."),
      },
      {
        label: "Rb",
        prompt: richText("Find the vertical reaction at support B in kN."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: 6,
        tolerance: 0.03,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("For this centered load case, R_B equals R_A."),
      },
      {
        label: "Rexpr",
        prompt: richText("Enter an expression for each reaction in terms of P."),
        partType: "symbolic",
        symbolicAnswer: "P / 2",
        symbolicVariables: [{ variable: "P", testMin: 2, testMax: 50 }],
        symbolicTolerance: 0.000001,
        explanation: richText("Each reaction equals half the centered point load."),
      },
      {
        label: "FBD",
        prompt: richText(
          "Draw the three main forces on the beam FBD: upward reactions at A and B, and the downward point load at midspan."
        ),
        partType: "fbd-draw",
        fbdRubric: {
          requiredForces: [
            { id: "Ra", label: "R_A", correctAngle: 90, angleTolerance: 10 },
            { id: "P", label: "P", correctAngle: 270, angleTolerance: 10 },
            { id: "Rb", label: "R_B", correctAngle: 90, angleTolerance: 10 },
          ],
          forbiddenForces: 1,
        },
        explanation: richText(
          "A correct FBD includes two upward support reactions and one downward applied load."
        ),
      },
    ],
    resultPlots: [
      {
        plotType: "shear",
        title: "Student Shear Diagram V(x)",
        xLabel: "x (m)",
        yLabel: "V (kN)",
        xMin: 0,
        xMax: "8",
        segments: [
          { xStart: "0", xEnd: "4", formula: "Ra" },
          { xStart: "4", xEnd: "8", formula: "Ra - 12" },
        ],
        criticalPoints: [
          { x: "4", label: "Load at midspan" },
          { x: "8", label: "Support B" },
        ],
      },
      {
        plotType: "moment",
        title: "Student Moment Diagram M(x)",
        xLabel: "x (m)",
        yLabel: "M (kN·m)",
        xMin: 0,
        xMax: "8",
        segments: [
          { xStart: "0", xEnd: "4", formula: "Ra * x" },
          { xStart: "4", xEnd: "8", formula: "Ra * x - 12 * (x - 4)" },
        ],
        criticalPoints: [{ x: "4", label: "Maximum moment location" }],
      },
    ],
  };

  if (!existing.docs.length) {
    return payload.create({
      collection: "problems",
      data,
      depth: 0,
      overrideAccess: true,
    } as never);
  }

  return payload.update({
    collection: "problems",
    id: existing.docs[0].id,
    data,
    depth: 0,
    overrideAccess: true,
  } as never);
}

async function upsertProblemSet(payload: Payload, problemId: number) {
  const existing = await payload.find({
    collection: "problem-sets",
    where: { title: { equals: EXAMPLE_SET_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: Partial<ProblemSet> = {
    title: EXAMPLE_SET_TITLE,
    description:
      "Canonical starter set for introductory statics: beam equilibrium, reaction forces, symbolic relation, FBD quality, and post-submit shear/moment feedback.",
    problems: [problemId],
    showAnswers: true,
    maxAttempts: 5,
    shuffleProblems: false,
  };

  if (!existing.docs.length) {
    return payload.create({
      collection: "problem-sets",
      data,
      depth: 0,
      overrideAccess: true,
    } as never);
  }

  return payload.update({
    collection: "problem-sets",
    id: existing.docs[0].id,
    data,
    depth: 0,
    overrideAccess: true,
  } as never);
}

export default async function seedStaticsFundamentalsExample(payload: Payload) {
  payload.logger.info("Seeding statics fundamentals example problem set...");

  const figure = await upsertEngineeringFigure(payload);
  const figureId = ensureNumericId(figure, "engineering-figure");
  const problem = await upsertProblem(payload, figureId);
  const problemId = ensureNumericId(problem, "problem");
  const problemSet = await upsertProblemSet(payload, problemId);
  const problemSetId = ensureNumericId(problemSet, "problem-set");

  payload.logger.info(
    `Seed complete: figure=${figureId}, problem=${problemId}, problemSet=${problemSetId}`
  );
}

const shouldRunAsScript = process.argv[1]?.includes("staticsFundamentalsExample.ts");

if (shouldRunAsScript) {
  const payload = await getPayload({ config: configPromise });
  await seedStaticsFundamentalsExample(payload);
}
