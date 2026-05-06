import { getPayload, type Payload } from "payload";
import configPromise from "@payload-config";
import type { EngineeringFigure, Problem, ProblemSet } from "../payload-types";

type LegacyProblemSeedData = Record<string, unknown>;

const EXAMPLE_FIGURE_TITLE = "Statics Fundamentals — Simply Supported Beam FBD";
const EXAMPLE_PROBLEM_TITLE = "Statics Fundamentals — Reactions of a Simply Supported Beam";
const CANTILEVER_FIGURE_TITLE = "Statics Fundamentals — Cantilever Beam Tip Load";
const CANTILEVER_PROBLEM_TITLE = "Statics Fundamentals — Cantilever Support Reactions";
const RESULTANT_FIGURE_TITLE = "Statics Fundamentals — Inclined Forces on a Ring";
const RESULTANT_PROBLEM_TITLE = "Statics Fundamentals — Resultant Force Components";
const TRUSS_FIGURE_TITLE = "Statics Fundamentals — Triangular Truss Joint Loads";
const TRUSS_PROBLEM_TITLE = "Statics Fundamentals — Truss Joint Equilibrium";
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

  const data: LegacyProblemSeedData = {
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

async function upsertCantileverFigure(payload: Payload) {
  const existing = await payload.find({
    collection: "engineering-figures",
    where: { title: { equals: CANTILEVER_FIGURE_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: Partial<EngineeringFigure> = {
    title: CANTILEVER_FIGURE_TITLE,
    type: "beam" as const,
    description: "Cantilever beam with downward tip load and fixed-end support at A.",
    width: 680,
    height: 400,
    figureData: {
      type: "beam",
      length: 5,
      scale: 80,
      supports: [{ x: 0, type: "fixed" }],
      pointLoads: [{ x: 5, magnitude: 18, angle: 270, label: "P = 18 kN" }],
      moments: [{ x: 0, value: 90, label: "M_A" }],
      dimensions: true,
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

async function upsertResultantFigure(payload: Payload) {
  const existing = await payload.find({
    collection: "engineering-figures",
    where: { title: { equals: RESULTANT_FIGURE_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: Partial<EngineeringFigure> = {
    title: RESULTANT_FIGURE_TITLE,
    type: "fbd" as const,
    description: "Two inclined forces applied to a ring at O.",
    width: 680,
    height: 400,
    figureData: {
      type: "fbd",
      body: {
        shape: "circle",
        label: "O",
        x: 320,
        y: 200,
        radius: 16,
      },
      forces: [
        { id: "F1", label: "F1 = 10 kN", origin: [320, 200], angle: 30, magnitude: 1.2, color: "#2563eb" },
        { id: "F2", label: "F2 = 8 kN", origin: [320, 200], angle: 150, magnitude: 1, color: "#ef4444" },
      ],
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

async function upsertTrussFigure(payload: Payload) {
  const existing = await payload.find({
    collection: "engineering-figures",
    where: { title: { equals: TRUSS_FIGURE_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: Partial<EngineeringFigure> = {
    title: TRUSS_FIGURE_TITLE,
    type: "truss" as const,
    description: "Symmetric triangular truss with vertical load at apex joint C.",
    width: 680,
    height: 420,
    figureData: {
      type: "truss",
      nodes: [
        { id: "A", x: 180, y: 300, support: "pin" },
        { id: "B", x: 500, y: 300, support: "roller" },
        { id: "C", x: 340, y: 140 },
      ],
      members: [
        { from: "A", to: "C" },
        { from: "C", to: "B" },
        { from: "A", to: "B" },
      ],
      loads: [{ node: "C", angle: 270, magnitude: 12, label: "P = 12 kN" }],
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

async function upsertCantileverProblem(payload: Payload, figureId: number) {
  const existing = await payload.find({
    collection: "problems",
    where: { title: { equals: CANTILEVER_PROBLEM_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: LegacyProblemSeedData = {
    title: CANTILEVER_PROBLEM_TITLE,
    prompt: richText(
      "A cantilever beam of length L = 5 m carries a downward tip load P = 18 kN. Determine the vertical reaction and fixed-end moment at support A."
    ),
    figure: figureId,
    difficulty: "easy",
    topic: "statics",
    tags: ["cantilever", "support-reaction", "moment-equilibrium"],
    parts: [
      {
        label: "V_A",
        prompt: richText("Compute the vertical reaction at A (kN)."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: 18,
        tolerance: 0.02,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("From ΣFy = 0, the support must provide +18 kN."),
      },
      {
        label: "M_A",
        prompt: richText("Compute the fixed-end moment magnitude at A (kN·m)."),
        unit: "kN·m",
        partType: "numeric",
        correctAnswer: 90,
        tolerance: 0.02,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("From ΣM_A = 0, M_A = P·L = 18×5 = 90 kN·m."),
      },
      {
        label: "M_expr",
        prompt: richText("Enter the symbolic expression for fixed-end moment in terms of P and L."),
        partType: "symbolic",
        symbolicAnswer: "P * L",
        symbolicVariables: [
          { variable: "P", testMin: 2, testMax: 25 },
          { variable: "L", testMin: 1, testMax: 10 },
        ],
        symbolicTolerance: 0.000001,
        explanation: richText("For a tip load on a cantilever, the fixed-end moment is P times span length."),
      },
      {
        label: "FBD",
        prompt: richText("Place the downward tip load and the support moment arrow at A."),
        partType: "fbd-draw",
        fbdRubric: {
          requiredForces: [
            { id: "P", label: "P", correctAngle: 270, angleTolerance: 10 },
          ],
          requiredMoments: [
            { id: "MA", label: "M_A", direction: "ccw", magnitudeRequired: false },
          ],
          forbiddenForces: 1,
        } as never,
        explanation: richText("A correct sketch includes the downward tip load and counteracting support moment."),
      },
    ],
    resultPlots: [
      {
        plotType: "shear",
        title: "Cantilever Shear V(x)",
        xLabel: "x (m)",
        yLabel: "V (kN)",
        xMin: 0,
        xMax: "5",
        segments: [{ xStart: "0", xEnd: "5", formula: "-18" }],
      },
      {
        plotType: "moment",
        title: "Cantilever Moment M(x)",
        xLabel: "x (m)",
        yLabel: "M (kN·m)",
        xMin: 0,
        xMax: "5",
        segments: [{ xStart: "0", xEnd: "5", formula: "-18 * (5 - x)" }],
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

async function upsertResultantProblem(payload: Payload, figureId: number) {
  const existing = await payload.find({
    collection: "problems",
    where: { title: { equals: RESULTANT_PROBLEM_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: LegacyProblemSeedData = {
    title: RESULTANT_PROBLEM_TITLE,
    prompt: richText(
      "Two forces act at a ring: F1 = 10 kN at 30° and F2 = 8 kN at 150° measured from +x. Compute the resultant components."
    ),
    figure: figureId,
    difficulty: "easy",
    topic: "statics",
    tags: ["vector-components", "resultant", "equilibrium"],
    parts: [
      {
        label: "R_x",
        prompt: richText("Find resultant horizontal component R_x (kN)."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: 1.7320508075688772,
        tolerance: 0.02,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("R_x = 10cos30° + 8cos150° = 1.732 kN."),
      },
      {
        label: "R_y",
        prompt: richText("Find resultant vertical component R_y (kN)."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: 9,
        tolerance: 0.02,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("R_y = 10sin30° + 8sin150° = 9.0 kN."),
      },
      {
        label: "R_mag_expr",
        prompt: richText("Enter a symbolic expression for |R| in terms of R_x and R_y."),
        partType: "symbolic",
        symbolicAnswer: "sqrt(R_x^2 + R_y^2)",
        symbolicVariables: [
          { variable: "R_x", testMin: -20, testMax: 20 },
          { variable: "R_y", testMin: -20, testMax: 20 },
        ],
        symbolicTolerance: 0.000001,
        explanation: richText("Use Euclidean norm for resultant magnitude."),
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

async function upsertTrussProblem(payload: Payload, figureId: number) {
  const existing = await payload.find({
    collection: "problems",
    where: { title: { equals: TRUSS_PROBLEM_TITLE } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const data: LegacyProblemSeedData = {
    title: TRUSS_PROBLEM_TITLE,
    prompt: richText(
      "For the symmetric triangular truss with apex load P = 12 kN, estimate support reactions and determine force in member AC using joint equilibrium."
    ),
    figure: figureId,
    difficulty: "medium",
    topic: "statics",
    tags: ["truss", "method-of-joints", "reactions"],
    parts: [
      {
        label: "A_y",
        prompt: richText("Find vertical reaction at support A (kN)."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: 6,
        tolerance: 0.03,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("Symmetry gives equal vertical reactions: A_y = B_y = 6 kN."),
      },
      {
        label: "F_AC",
        prompt: richText("Given member AC is at 45°, find axial force in AC (kN, tension positive)."),
        unit: "kN",
        partType: "numeric",
        correctAnswer: -8.48528137423857,
        tolerance: 0.03,
        toleranceType: "relative",
        scoringMode: "linear-decay",
        explanation: richText("At joint C: 2F_AC sin45° = 12, so F_AC = -8.49 kN (compression)."),
      },
      {
        label: "F_expr",
        prompt: richText("Enter expression for |F_AC| in terms of P for 45° member angle."),
        partType: "symbolic",
        symbolicAnswer: "P / (2 * sin(pi / 4))",
        symbolicVariables: [{ variable: "P", testMin: 2, testMax: 40 }],
        symbolicTolerance: 0.000001,
        explanation: richText("From joint C vertical equilibrium."),
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

async function upsertProblemSet(payload: Payload, problemIds: number[]) {
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
      "Canonical starter set for introductory statics: beam reactions, cantilever support effects, vector resultants, and truss joint equilibrium.",
    problems: problemIds,
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

  const baseFigure = await upsertEngineeringFigure(payload);
  const cantileverFigure = await upsertCantileverFigure(payload);
  const resultantFigure = await upsertResultantFigure(payload);
  const trussFigure = await upsertTrussFigure(payload);

  const baseFigureId = ensureNumericId(baseFigure, "engineering-figure");
  const cantileverFigureId = ensureNumericId(cantileverFigure, "engineering-figure");
  const resultantFigureId = ensureNumericId(resultantFigure, "engineering-figure");
  const trussFigureId = ensureNumericId(trussFigure, "engineering-figure");

  const baseProblem = await upsertProblem(payload, baseFigureId);
  const cantileverProblem = await upsertCantileverProblem(payload, cantileverFigureId);
  const resultantProblem = await upsertResultantProblem(payload, resultantFigureId);
  const trussProblem = await upsertTrussProblem(payload, trussFigureId);

  const problemIds = [
    ensureNumericId(baseProblem, "problem"),
    ensureNumericId(cantileverProblem, "problem"),
    ensureNumericId(resultantProblem, "problem"),
    ensureNumericId(trussProblem, "problem"),
  ];

  const problemSet = await upsertProblemSet(payload, problemIds);
  const problemSetId = ensureNumericId(problemSet, "problem-set");

  payload.logger.info(
    `Seed complete: figures=${[baseFigureId, cantileverFigureId, resultantFigureId, trussFigureId].join(",")}, problems=${problemIds.join(",")}, problemSet=${problemSetId}`
  );
}

const shouldRunAsScript = process.argv[1]?.includes("staticsFundamentalsExample.ts");

if (shouldRunAsScript) {
  const payload = await getPayload({ config: configPromise });
  await seedStaticsFundamentalsExample(payload);
}
