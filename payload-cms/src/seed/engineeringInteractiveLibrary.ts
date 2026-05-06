import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import type { EngineeringFigure, Problem, ProblemSet } from '../payload-types'
import seedStaticsFundamentalsExample from './staticsFundamentalsExample'

type LegacyProblemSeedData = Record<string, unknown>

const LIBRARY_SET_1 = 'Engineering Problem Library — Common Statics I'
const LIBRARY_SET_2 = 'Engineering Problem Library — Common Statics II'
const LIBRARY_SET_3 = 'Engineering Problem Library — Common Statics III'
const LIBRARY_SET_MECH = 'Engineering Problem Library — Mechanics of Materials'
const LIBRARY_MASTER_SET = 'Engineering Problem Library — Master Collection'

const FIGURE_TITLES = {
  udlBeam: 'Engineering Library — Simply Supported Beam with UDL',
  eccentricBeam: 'Engineering Library — Simply Supported Beam with Eccentric Point Load',
  cantileverUdl: 'Engineering Library — Cantilever with Uniform Load',
  triangularUdlBeam: 'Engineering Library — Simply Supported Beam with Triangular Load',
  combinedBeam: 'Engineering Library — Beam with UDL, Point Load, and Applied Moment',
  ringForces: 'Engineering Library — Ring with Three Forces',
  inclinedMoment: 'Engineering Library — Inclined Force and Moment Arm',
  trussJoint: 'Engineering Library — Triangular Truss Joint C',
  partialUdlBeam: 'Engineering Library — Beam with Partial UDL Segment',
  axialBar: 'Engineering Library — Axial Bar in Tension',
  bendingSection: 'Engineering Library — Rectangular Beam Section',
  shaftTorsion: 'Engineering Library — Solid Shaft in Torsion',
} as const

const PROBLEM_TITLES = {
  udlBeam: 'Common Statics — Reactions and Max Moment for UDL Beam',
  eccentricBeam: 'Common Statics — Reactions for Eccentric Point Load',
  cantileverUdl: 'Common Statics — Cantilever UDL Reactions',
  triangularUdlBeam: 'Common Statics — Triangular Load Beam Reactions and Peak Moment',
  combinedBeam: 'Common Statics — Combined Loading Beam Equilibrium',
  ringForces: 'Common Statics — Resultant of Three Concurrent Forces',
  inclinedMoment: 'Common Statics — Moment About a Point from Inclined Force',
  trussJoint: 'Common Statics — Truss Joint C Equilibrium',
  partialUdlBeam: 'Common Statics — Equivalent Load of Partial UDL',
  axialStressStrain: 'Mechanics — Axial Stress and Strain in a Bar',
  axialDeformation: 'Mechanics — Axial Deformation of a Prismatic Bar',
  steppedBar: 'Mechanics — Stepped Bar Stress and Elongation',
  bendingStress: 'Mechanics — Bending Stress in a Rectangular Section',
  torsionStress: 'Mechanics — Torsional Shear Stress in Circular Shaft',
  torsionTwist: 'Mechanics — Torsional Shear and Angle of Twist',
} as const

const ensureNumericId = (value: unknown, label: string): number => {
  const maybeId =
    typeof value === 'object' && value !== null && 'id' in value
      ? (value as { id?: unknown }).id
      : value

  const asNumber =
    typeof maybeId === 'number'
      ? maybeId
      : typeof maybeId === 'string'
        ? Number.parseInt(maybeId, 10)
        : Number.NaN

  if (!Number.isFinite(asNumber)) {
    throw new Error(`Expected numeric ${label} id but received ${String(maybeId)}`)
  }

  return asNumber
}

const richText = (text: string): Problem['prompt'] => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            text,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr',
  },
})

async function upsertFigure(payload: Payload, title: string, data: Partial<EngineeringFigure>) {
  const existing = await payload.find({
    collection: 'engineering-figures',
    where: { title: { equals: title } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (!existing.docs.length) {
    return payload.create({
      collection: 'engineering-figures',
      data: { title, ...data },
      depth: 0,
      overrideAccess: true,
    } as never)
  }

  return payload.update({
    collection: 'engineering-figures',
    id: existing.docs[0].id,
    data: { title, ...data },
    depth: 0,
    overrideAccess: true,
  } as never)
}

async function upsertProblem(payload: Payload, title: string, data: LegacyProblemSeedData) {
  const existing = await payload.find({
    collection: 'problems',
    where: { title: { equals: title } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (!existing.docs.length) {
    return payload.create({
      collection: 'problems',
      data: { title, ...data },
      depth: 0,
      overrideAccess: true,
    } as never)
  }

  return payload.update({
    collection: 'problems',
    id: existing.docs[0].id,
    data: { title, ...data },
    depth: 0,
    overrideAccess: true,
  } as never)
}

async function upsertProblemSet(payload: Payload, title: string, problemIds: number[]) {
  const existing = await payload.find({
    collection: 'problem-sets',
    where: { title: { equals: title } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const data: Partial<ProblemSet> = {
    title,
    description:
      'Curated interactive statics practice set seeded for the student-facing problem set block workflow.',
    problems: problemIds,
    showAnswers: true,
    maxAttempts: 8,
    shuffleProblems: false,
  }

  if (!existing.docs.length) {
    return payload.create({
      collection: 'problem-sets',
      data,
      depth: 0,
      overrideAccess: true,
    } as never)
  }

  return payload.update({
    collection: 'problem-sets',
    id: existing.docs[0].id,
    data,
    depth: 0,
    overrideAccess: true,
  } as never)
}

export default async function seedEngineeringInteractiveLibrary(payload: Payload) {
  payload.logger.info('Seeding common interactive engineering problem library...')

  await seedStaticsFundamentalsExample(payload)

  const udlBeamFigure = await upsertFigure(payload, FIGURE_TITLES.udlBeam, {
    type: 'beam',
    description: 'Simply supported beam with full-span uniformly distributed load.',
    width: 680,
    height: 400,
    figureData: {
      type: 'beam',
      length: 6,
      scale: 75,
      supports: [
        { x: 0, type: 'pin' },
        { x: 6, type: 'roller' },
      ],
      distributedLoads: [{ xStart: 0, xEnd: 6, wStart: 4, wEnd: 4, label: 'w = 4 kN/m' }],
      dimensions: true,
    },
  })

  const eccentricBeamFigure = await upsertFigure(payload, FIGURE_TITLES.eccentricBeam, {
    type: 'beam',
    description: 'Simply supported beam with eccentric downward point load.',
    width: 680,
    height: 400,
    figureData: {
      type: 'beam',
      length: 8,
      scale: 60,
      supports: [
        { x: 0, type: 'pin' },
        { x: 8, type: 'roller' },
      ],
      pointLoads: [{ x: 3, magnitude: 20, angle: 270, label: 'P = 20 kN' }],
      dimensions: true,
    },
  })

  const cantileverUdlFigure = await upsertFigure(payload, FIGURE_TITLES.cantileverUdl, {
    type: 'beam',
    description: 'Cantilever beam with full-length uniformly distributed load.',
    width: 680,
    height: 400,
    figureData: {
      type: 'beam',
      length: 4,
      scale: 90,
      supports: [{ x: 0, type: 'fixed' }],
      distributedLoads: [{ xStart: 0, xEnd: 4, wStart: 3, wEnd: 3, label: 'w = 3 kN/m' }],
      moments: [{ x: 0, value: 24, label: 'M_A' }],
      dimensions: true,
    },
  })

  const triangularUdlBeamFigure = await upsertFigure(payload, FIGURE_TITLES.triangularUdlBeam, {
    type: 'beam',
    description:
      'Simply supported beam with linearly varying load from 0 to 6 kN/m over full span.',
    width: 680,
    height: 400,
    figureData: {
      type: 'beam',
      length: 6,
      scale: 75,
      supports: [
        { x: 0, type: 'pin' },
        { x: 6, type: 'roller' },
      ],
      distributedLoads: [{ xStart: 0, xEnd: 6, wStart: 0, wEnd: 6, label: 'w(x): 0 → 6 kN/m' }],
      dimensions: true,
    },
  })

  const combinedBeamFigure = await upsertFigure(payload, FIGURE_TITLES.combinedBeam, {
    type: 'beam',
    description: 'Simply supported beam with UDL, eccentric point load, and an applied couple.',
    width: 700,
    height: 420,
    figureData: {
      type: 'beam',
      length: 9,
      scale: 60,
      supports: [
        { x: 0, type: 'pin' },
        { x: 9, type: 'roller' },
      ],
      distributedLoads: [{ xStart: 0, xEnd: 9, wStart: 3, wEnd: 3, label: 'w = 3 kN/m' }],
      pointLoads: [{ x: 2, magnitude: 18, angle: 270, label: 'P = 18 kN' }],
      moments: [{ x: 6, value: 12, label: 'M0 = +12 kN·m (CCW)' }],
      dimensions: true,
    },
  })

  const ringForcesFigure = await upsertFigure(payload, FIGURE_TITLES.ringForces, {
    type: 'fbd',
    description: 'Three concurrent forces applied at point O.',
    width: 680,
    height: 400,
    figureData: {
      type: 'fbd',
      body: { shape: 'circle', x: 330, y: 200, radius: 18, label: 'O' },
      forces: [
        {
          id: 'F1',
          label: 'F1 = 7',
          origin: [330, 200],
          angle: 20,
          magnitude: 1.1,
          color: '#2563eb',
        },
        {
          id: 'F2',
          label: 'F2 = 9',
          origin: [330, 200],
          angle: 140,
          magnitude: 1.2,
          color: '#ef4444',
        },
        {
          id: 'F3',
          label: 'F3 = 5',
          origin: [330, 200],
          angle: 270,
          magnitude: 0.9,
          color: '#16a34a',
        },
      ],
    },
  })

  const inclinedMomentFigure = await upsertFigure(payload, FIGURE_TITLES.inclinedMoment, {
    type: 'fbd',
    description: 'Point A with inclined force F at distance r from point O.',
    width: 680,
    height: 420,
    figureData: {
      type: 'fbd',
      body: { shape: 'rect', x: 260, y: 180, width: 130, height: 50, label: 'Link OA' },
      forces: [
        { id: 'F', label: 'F', origin: [390, 180], angle: 120, magnitude: 1.2, color: '#ef4444' },
      ],
      dimensions: [{ from: [270, 260], to: [390, 260], label: 'r = 2.5 m' }],
    },
  })

  const trussJointFigure = await upsertFigure(payload, FIGURE_TITLES.trussJoint, {
    type: 'truss',
    description: 'Triangular truss with vertical load at apex C.',
    width: 680,
    height: 420,
    figureData: {
      type: 'truss',
      nodes: [
        { id: 'A', x: 180, y: 300, support: 'pin' },
        { id: 'B', x: 500, y: 300, support: 'roller' },
        { id: 'C', x: 340, y: 140 },
      ],
      members: [
        { from: 'A', to: 'C' },
        { from: 'C', to: 'B' },
        { from: 'A', to: 'B' },
      ],
      loads: [{ node: 'C', angle: 270, magnitude: 10, label: 'P = 10 kN' }],
    },
  })

  const partialUdlBeamFigure = await upsertFigure(payload, FIGURE_TITLES.partialUdlBeam, {
    type: 'beam',
    description:
      'Simply supported beam with a partial uniformly distributed load over the middle span.',
    width: 680,
    height: 400,
    figureData: {
      type: 'beam',
      length: 10,
      scale: 50,
      supports: [
        { x: 0, type: 'pin' },
        { x: 10, type: 'roller' },
      ],
      distributedLoads: [{ xStart: 2, xEnd: 6, wStart: 5, wEnd: 5, label: 'w = 5 kN/m' }],
      dimensions: true,
    },
  })

  const axialBarFigure = await upsertFigure(payload, FIGURE_TITLES.axialBar, {
    type: 'fbd',
    description: 'Prismatic axial bar under tensile load P.',
    width: 680,
    height: 360,
    figureData: {
      type: 'fbd',
      body: { shape: 'rect', x: 180, y: 170, width: 300, height: 36, label: 'Bar' },
      forces: [
        { id: 'P1', label: 'P', origin: [180, 188], angle: 180, magnitude: 1.1, color: '#ef4444' },
        { id: 'P2', label: 'P', origin: [480, 188], angle: 0, magnitude: 1.1, color: '#2563eb' },
      ],
      dimensions: [{ from: [180, 250], to: [480, 250], label: 'L' }],
    },
  })

  const bendingSectionFigure = await upsertFigure(payload, FIGURE_TITLES.bendingSection, {
    type: 'fbd',
    description: 'Rectangular section in pure bending with neutral axis reference.',
    width: 620,
    height: 380,
    figureData: {
      type: 'fbd',
      body: { shape: 'rect', x: 240, y: 120, width: 120, height: 180, label: 'b × h section' },
      forces: [
        { id: 'M', label: 'M', origin: [300, 100], angle: 90, magnitude: 0.9, color: '#7c3aed' },
      ],
      dimensions: [
        { from: [240, 320], to: [360, 320], label: 'b = 80 mm' },
        { from: [380, 120], to: [380, 300], label: 'h = 160 mm' },
      ],
    },
  })

  const shaftTorsionFigure = await upsertFigure(payload, FIGURE_TITLES.shaftTorsion, {
    type: 'fbd',
    description: 'Solid circular shaft under equal and opposite torques at ends.',
    width: 680,
    height: 380,
    figureData: {
      type: 'fbd',
      body: { shape: 'rect', x: 170, y: 160, width: 340, height: 50, label: 'Solid shaft (d)' },
      forces: [
        { id: 'T1', label: 'T', origin: [170, 185], angle: 180, magnitude: 1.0, color: '#2563eb' },
        { id: 'T2', label: 'T', origin: [510, 185], angle: 0, magnitude: 1.0, color: '#ef4444' },
      ],
      dimensions: [{ from: [170, 250], to: [510, 250], label: 'L' }],
    },
  })

  const udlBeamFigureId = ensureNumericId(udlBeamFigure, 'figure')
  const eccentricBeamFigureId = ensureNumericId(eccentricBeamFigure, 'figure')
  const cantileverUdlFigureId = ensureNumericId(cantileverUdlFigure, 'figure')
  const triangularUdlBeamFigureId = ensureNumericId(triangularUdlBeamFigure, 'figure')
  const combinedBeamFigureId = ensureNumericId(combinedBeamFigure, 'figure')
  const ringForcesFigureId = ensureNumericId(ringForcesFigure, 'figure')
  const inclinedMomentFigureId = ensureNumericId(inclinedMomentFigure, 'figure')
  const trussJointFigureId = ensureNumericId(trussJointFigure, 'figure')
  const partialUdlBeamFigureId = ensureNumericId(partialUdlBeamFigure, 'figure')
  const axialBarFigureId = ensureNumericId(axialBarFigure, 'figure')
  const bendingSectionFigureId = ensureNumericId(bendingSectionFigure, 'figure')
  const shaftTorsionFigureId = ensureNumericId(shaftTorsionFigure, 'figure')

  const udlBeamProblem = await upsertProblem(payload, PROBLEM_TITLES.udlBeam, {
    prompt: richText(
      'A simply supported beam of span L = 6 m carries a full-span UDL w = 4 kN/m. Determine reactions and max bending moment.',
    ),
    figure: udlBeamFigureId,
    difficulty: 'easy',
    topic: 'statics',
    tags: ['beam', 'udl', 'shear', 'moment'],
    parts: [
      {
        label: 'R_A',
        prompt: richText('Compute reaction at A (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 12,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'R_B',
        prompt: richText('Compute reaction at B (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 12,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'M_max_expr',
        prompt: richText('Enter expression for max moment in terms of w and L.'),
        partType: 'symbolic',
        symbolicAnswer: 'w * L^2 / 8',
        symbolicVariables: [
          { variable: 'w', testMin: 1, testMax: 12 },
          { variable: 'L', testMin: 1, testMax: 20 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
    resultPlots: [
      {
        plotType: 'shear',
        title: 'UDL Shear',
        xLabel: 'x (m)',
        yLabel: 'V (kN)',
        xMin: 0,
        xMax: '6',
        segments: [{ xStart: '0', xEnd: '6', formula: 'R_A - 4 * x' }],
      },
    ],
  })

  const eccentricBeamProblem = await upsertProblem(payload, PROBLEM_TITLES.eccentricBeam, {
    prompt: richText(
      'A simply supported beam has span L = 8 m with point load P = 20 kN at a = 3 m from support A. Solve reactions.',
    ),
    figure: eccentricBeamFigureId,
    difficulty: 'easy',
    topic: 'statics',
    tags: ['beam', 'point-load', 'reactions'],
    parts: [
      {
        label: 'R_A',
        prompt: richText('Reaction at A (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 12.5,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'R_B',
        prompt: richText('Reaction at B (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 7.5,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'R_B_expr',
        prompt: richText('Enter expression for R_B in terms of P, a, and L.'),
        partType: 'symbolic',
        symbolicAnswer: 'P * a / L',
        symbolicVariables: [
          { variable: 'P', testMin: 2, testMax: 50 },
          { variable: 'a', testMin: 1, testMax: 10 },
          { variable: 'L', testMin: 2, testMax: 20 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const cantileverUdlProblem = await upsertProblem(payload, PROBLEM_TITLES.cantileverUdl, {
    prompt: richText(
      'A cantilever beam with L = 4 m carries a full-span UDL w = 3 kN/m. Determine support shear and fixed-end moment.',
    ),
    figure: cantileverUdlFigureId,
    difficulty: 'easy',
    topic: 'statics',
    tags: ['cantilever', 'udl', 'moment'],
    parts: [
      {
        label: 'V_A',
        prompt: richText('Support shear at A (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 12,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'M_A',
        prompt: richText('Fixed-end moment magnitude at A (kN·m).'),
        unit: 'kN·m',
        partType: 'numeric',
        correctAnswer: 24,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'FBD',
        prompt: richText('Draw the downward equivalent load and the support moment direction.'),
        partType: 'fbd-draw',
        fbdRubric: {
          requiredForces: [{ id: 'w', label: 'w', correctAngle: 270, angleTolerance: 15 }],
          requiredMoments: [{ id: 'MA', label: 'M_A', direction: 'ccw', magnitudeRequired: false }],
          forbiddenForces: 1,
        } as never,
      },
    ],
  })

  const triangularUdlBeamProblem = await upsertProblem(payload, PROBLEM_TITLES.triangularUdlBeam, {
    prompt: richText(
      'A simply supported beam has L = 6 m with triangular load intensity varying from 0 at A to 6 kN/m at B. Determine reactions, location of zero shear, and peak moment.',
    ),
    figure: triangularUdlBeamFigureId,
    difficulty: 'hard',
    topic: 'statics',
    tags: ['beam', 'triangular-load', 'shear', 'moment', 'equilibrium'],
    parts: [
      {
        label: 'R_A',
        prompt: richText('Compute reaction at A (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 6,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'R_B',
        prompt: richText('Compute reaction at B (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 12,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'x_V0',
        prompt: richText('Compute x where V(x)=0 measured from A (m).'),
        unit: 'm',
        partType: 'numeric',
        correctAnswer: 3.4641016151377544,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'M_max',
        prompt: richText('Compute the peak bending moment M_max (kN·m).'),
        unit: 'kN·m',
        partType: 'numeric',
        correctAnswer: 13.856406460551021,
        tolerance: 0.025,
        toleranceType: 'relative',
      },
      {
        label: 'W_tri_expr',
        prompt: richText(
          'Enter symbolic expression for triangular-load resultant W in terms of w_max and L.',
        ),
        partType: 'symbolic',
        symbolicAnswer: 'w_max * L / 2',
        symbolicVariables: [
          { variable: 'w_max', testMin: 1, testMax: 20 },
          { variable: 'L', testMin: 1, testMax: 20 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
    resultPlots: [
      {
        plotType: 'shear',
        title: 'Triangular Load Shear',
        xLabel: 'x (m)',
        yLabel: 'V (kN)',
        xMin: 0,
        xMax: '6',
        segments: [{ xStart: '0', xEnd: '6', formula: '6 - x^2/2' }],
      },
      {
        plotType: 'moment',
        title: 'Triangular Load Moment',
        xLabel: 'x (m)',
        yLabel: 'M (kN·m)',
        xMin: 0,
        xMax: '6',
        segments: [{ xStart: '0', xEnd: '6', formula: '6*x - x^3/6' }],
      },
    ],
  })

  const combinedBeamProblem = await upsertProblem(payload, PROBLEM_TITLES.combinedBeam, {
    prompt: richText(
      'A simply supported beam with span L = 9 m carries w = 3 kN/m over the full span, a point load P = 18 kN at x = 2 m, and an applied CCW couple M0 = 12 kN·m at x = 6 m. Determine support reactions.',
    ),
    figure: combinedBeamFigureId,
    difficulty: 'hard',
    topic: 'statics',
    tags: ['beam', 'equilibrium', 'combined-loading', 'applied-moment'],
    parts: [
      {
        label: 'R_A',
        prompt: richText('Compute reaction at A (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 28.833333333333332,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'R_B',
        prompt: richText('Compute reaction at B (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 16.166666666666668,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'RB_expr',
        prompt: richText(
          'Enter symbolic expression for R_B in terms of w, L, P, a, and M0 (CCW positive).',
        ),
        partType: 'symbolic',
        symbolicAnswer: 'w*L/2 + P*a/L - M0/L',
        symbolicVariables: [
          { variable: 'w', testMin: 1, testMax: 20 },
          { variable: 'L', testMin: 2, testMax: 20 },
          { variable: 'P', testMin: 1, testMax: 60 },
          { variable: 'a', testMin: 0.5, testMax: 12 },
          { variable: 'M0', testMin: -60, testMax: 60 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const ringForcesProblem = await upsertProblem(payload, PROBLEM_TITLES.ringForces, {
    prompt: richText(
      'Forces F1 = 7 kN at 20°, F2 = 9 kN at 140°, and F3 = 5 kN downward act at O. Compute resultant components.',
    ),
    figure: ringForcesFigureId,
    difficulty: 'medium',
    topic: 'statics',
    tags: ['resultant', 'components', 'vectors'],
    parts: [
      {
        label: 'R_x',
        prompt: richText('Compute R_x (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: -0.9800149580352212,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'R_y',
        prompt: richText('Compute R_y (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 0.0332747743229686,
        tolerance: 0.05,
        toleranceType: 'relative',
      },
      {
        label: 'R_expr',
        prompt: richText('Enter expression for resultant magnitude using components.'),
        partType: 'symbolic',
        symbolicAnswer: 'sqrt(R_x^2 + R_y^2)',
        symbolicVariables: [
          { variable: 'R_x', testMin: -20, testMax: 20 },
          { variable: 'R_y', testMin: -20, testMax: 20 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const inclinedMomentProblem = await upsertProblem(payload, PROBLEM_TITLES.inclinedMoment, {
    prompt: richText(
      'A force F = 14 kN acts at 120° at point A, with OA = 2.5 m along +x from O. Compute scalar moment magnitude about O.',
    ),
    figure: inclinedMomentFigureId,
    difficulty: 'medium',
    topic: 'statics',
    tags: ['moment', 'cross-product', 'inclined-force'],
    parts: [
      {
        label: 'M_O',
        prompt: richText('Compute |M_O| (kN·m).'),
        unit: 'kN·m',
        partType: 'numeric',
        correctAnswer: 30.31088913245535,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'M_expr',
        prompt: richText('Enter expression for moment magnitude in terms of r, F, and theta.'),
        partType: 'symbolic',
        symbolicAnswer: 'r * F * sin(theta)',
        symbolicVariables: [
          { variable: 'r', testMin: 0.5, testMax: 10 },
          { variable: 'F', testMin: 2, testMax: 30 },
          { variable: 'theta', testMin: 0.1, testMax: 3.0 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const trussJointProblem = await upsertProblem(payload, PROBLEM_TITLES.trussJoint, {
    prompt: richText(
      'For the symmetric triangular truss with apex load P = 10 kN, find vertical reaction at A and member force AC (45°).',
    ),
    figure: trussJointFigureId,
    difficulty: 'medium',
    topic: 'statics',
    tags: ['truss', 'method-of-joints'],
    parts: [
      {
        label: 'A_y',
        prompt: richText('Compute A_y (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 5,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'F_AC',
        prompt: richText('Compute member AC force (kN, tension positive).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: -7.0710678118654755,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'F_expr',
        prompt: richText('Enter expression for |F_AC| in terms of P at 45°.'),
        partType: 'symbolic',
        symbolicAnswer: 'P / (2 * sin(pi / 4))',
        symbolicVariables: [{ variable: 'P', testMin: 2, testMax: 40 }],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const partialUdlProblem = await upsertProblem(payload, PROBLEM_TITLES.partialUdlBeam, {
    prompt: richText(
      'A simply supported beam has L = 10 m and a UDL of w = 5 kN/m acting from x = 2 m to x = 6 m. Determine equivalent load location and support reactions.',
    ),
    figure: partialUdlBeamFigureId,
    difficulty: 'medium',
    topic: 'statics',
    tags: ['partial-udl', 'equivalent-load', 'reactions'],
    parts: [
      {
        label: 'W_eq',
        prompt: richText('Compute equivalent resultant load W_eq (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 20,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'x_bar',
        prompt: richText('Compute location of equivalent load from A, x̄ (m).'),
        unit: 'm',
        partType: 'numeric',
        correctAnswer: 4,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'R_A',
        prompt: richText('Compute reaction at A (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 12,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'R_B',
        prompt: richText('Compute reaction at B (kN).'),
        unit: 'kN',
        partType: 'numeric',
        correctAnswer: 8,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'W_expr',
        prompt: richText(
          'Enter expression for equivalent load in terms of w, a, and b (loaded from a to b).',
        ),
        partType: 'symbolic',
        symbolicAnswer: 'w * (b - a)',
        symbolicVariables: [
          { variable: 'w', testMin: 1, testMax: 15 },
          { variable: 'a', testMin: 0, testMax: 6 },
          { variable: 'b', testMin: 1, testMax: 10 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const axialStressStrainProblem = await upsertProblem(payload, PROBLEM_TITLES.axialStressStrain, {
    prompt: richText(
      'A steel bar carries P = 50 kN in tension with area A = 1000 mm² and E = 200 GPa. Compute stress and strain.',
    ),
    figure: axialBarFigureId,
    difficulty: 'intro',
    topic: 'mechanics-of-materials',
    tags: ['axial-stress', 'strain', 'hookes-law'],
    parts: [
      {
        label: 'sigma',
        prompt: richText('Compute normal stress σ (MPa).'),
        unit: 'MPa',
        partType: 'numeric',
        correctAnswer: 50,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'epsilon',
        prompt: richText('Compute strain ε (dimensionless).'),
        partType: 'numeric',
        correctAnswer: 0.00025,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'sigma_expr',
        prompt: richText('Enter symbolic expression for stress in terms of P and A.'),
        partType: 'symbolic',
        symbolicAnswer: 'P / A',
        symbolicVariables: [
          { variable: 'P', testMin: 1000, testMax: 100000 },
          { variable: 'A', testMin: 100, testMax: 2000 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const axialDeformationProblem = await upsertProblem(payload, PROBLEM_TITLES.axialDeformation, {
    prompt: richText(
      'A prismatic bar has P = 30 kN, L = 2000 mm, A = 600 mm², and E = 200000 MPa. Compute axial deformation.',
    ),
    figure: axialBarFigureId,
    difficulty: 'easy',
    topic: 'mechanics-of-materials',
    tags: ['axial-deformation', 'elasticity', 'bars'],
    parts: [
      {
        label: 'delta',
        prompt: richText('Compute elongation δ (mm).'),
        unit: 'mm',
        partType: 'numeric',
        correctAnswer: 0.5,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'delta_expr',
        prompt: richText('Enter expression for elongation in terms of P, L, A, and E.'),
        partType: 'symbolic',
        symbolicAnswer: 'P * L / (A * E)',
        symbolicVariables: [
          { variable: 'P', testMin: 1000, testMax: 100000 },
          { variable: 'L', testMin: 100, testMax: 5000 },
          { variable: 'A', testMin: 100, testMax: 2000 },
          { variable: 'E', testMin: 50000, testMax: 250000 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const steppedBarProblem = await upsertProblem(payload, PROBLEM_TITLES.steppedBar, {
    prompt: richText(
      'A stepped steel bar carries P = 60 kN. Segment 1 has L1 = 1000 mm, A1 = 800 mm². Segment 2 has L2 = 1500 mm, A2 = 500 mm². Use E = 200000 MPa. Compute stresses and total elongation.',
    ),
    figure: axialBarFigureId,
    difficulty: 'hard',
    topic: 'mechanics-of-materials',
    tags: ['stepped-bar', 'axial-stress', 'deformation', 'hookes-law'],
    parts: [
      {
        label: 'sigma_1',
        prompt: richText('Compute segment-1 stress σ1 (MPa).'),
        unit: 'MPa',
        partType: 'numeric',
        correctAnswer: 75,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'sigma_2',
        prompt: richText('Compute segment-2 stress σ2 (MPa).'),
        unit: 'MPa',
        partType: 'numeric',
        correctAnswer: 120,
        tolerance: 0.02,
        toleranceType: 'relative',
      },
      {
        label: 'delta_total',
        prompt: richText('Compute total elongation δ_total (mm).'),
        unit: 'mm',
        partType: 'numeric',
        correctAnswer: 1.275,
        tolerance: 0.025,
        toleranceType: 'relative',
      },
      {
        label: 'delta_expr',
        prompt: richText(
          'Enter symbolic expression for total elongation in terms of P, E, L1, A1, L2, and A2.',
        ),
        partType: 'symbolic',
        symbolicAnswer: 'P / E * (L1 / A1 + L2 / A2)',
        symbolicVariables: [
          { variable: 'P', testMin: 1000, testMax: 120000 },
          { variable: 'E', testMin: 50000, testMax: 250000 },
          { variable: 'L1', testMin: 100, testMax: 5000 },
          { variable: 'A1', testMin: 100, testMax: 3000 },
          { variable: 'L2', testMin: 100, testMax: 5000 },
          { variable: 'A2', testMin: 100, testMax: 3000 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const bendingStressProblem = await upsertProblem(payload, PROBLEM_TITLES.bendingStress, {
    prompt: richText(
      'A rectangular section has b = 80 mm, h = 160 mm, and bending moment M = 12 kN·m. Compute maximum bending stress.',
    ),
    figure: bendingSectionFigureId,
    difficulty: 'medium',
    topic: 'mechanics-of-materials',
    tags: ['bending-stress', 'section-modulus', 'flexure'],
    parts: [
      {
        label: 'I',
        prompt: richText('Compute second moment of area I (mm⁴).'),
        unit: 'mm⁴',
        partType: 'numeric',
        correctAnswer: 27306666.666666668,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'sigma_max',
        prompt: richText('Compute max bending stress σ_max (MPa).'),
        unit: 'MPa',
        partType: 'numeric',
        correctAnswer: 35.15625,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'I_expr',
        prompt: richText('Enter symbolic expression for I of a rectangle.'),
        partType: 'symbolic',
        symbolicAnswer: 'b * h^3 / 12',
        symbolicVariables: [
          { variable: 'b', testMin: 10, testMax: 300 },
          { variable: 'h', testMin: 10, testMax: 400 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const torsionStressProblem = await upsertProblem(payload, PROBLEM_TITLES.torsionStress, {
    prompt: richText(
      'A solid circular shaft has diameter d = 40 mm and torque T = 2 kN·m. Compute maximum torsional shear stress.',
    ),
    difficulty: 'medium',
    topic: 'mechanics-of-materials',
    tags: ['torsion', 'shaft', 'shear-stress'],
    parts: [
      {
        label: 'tau_max',
        prompt: richText('Compute τ_max (MPa).'),
        unit: 'MPa',
        partType: 'numeric',
        correctAnswer: 159.15494309189535,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'tau_expr',
        prompt: richText('Enter symbolic expression for τ_max of a solid circular shaft.'),
        partType: 'symbolic',
        symbolicAnswer: '16 * T / (pi * d^3)',
        symbolicVariables: [
          { variable: 'T', testMin: 100000, testMax: 5000000 },
          { variable: 'd', testMin: 10, testMax: 150 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const torsionTwistProblem = await upsertProblem(payload, PROBLEM_TITLES.torsionTwist, {
    prompt: richText(
      'A solid circular shaft has d = 45 mm, L = 1.8 m, torque T = 1.5 kN·m, and shear modulus G = 77 GPa. Compute max shear stress and angle of twist.',
    ),
    figure: shaftTorsionFigureId,
    difficulty: 'hard',
    topic: 'mechanics-of-materials',
    tags: ['torsion', 'angle-of-twist', 'shaft', 'polar-moment'],
    parts: [
      {
        label: 'J',
        prompt: richText('Compute polar moment J (mm⁴).'),
        unit: 'mm⁴',
        partType: 'numeric',
        correctAnswer: 402577.91797270766,
        tolerance: 0.025,
        toleranceType: 'relative',
      },
      {
        label: 'tau_max',
        prompt: richText('Compute τ_max (MPa).'),
        unit: 'MPa',
        partType: 'numeric',
        correctAnswer: 83.83470253400247,
        tolerance: 0.025,
        toleranceType: 'relative',
      },
      {
        label: 'theta_deg',
        prompt: richText('Compute angle of twist θ (degrees).'),
        unit: 'deg',
        partType: 'numeric',
        correctAnswer: 4.9905190981122605,
        tolerance: 0.03,
        toleranceType: 'relative',
      },
      {
        label: 'tau_expr',
        prompt: richText('Enter symbolic expression for τ_max of a solid circular shaft.'),
        partType: 'symbolic',
        symbolicAnswer: '16 * T / (pi * d^3)',
        symbolicVariables: [
          { variable: 'T', testMin: 100000, testMax: 6000000 },
          { variable: 'd', testMin: 10, testMax: 150 },
        ],
        symbolicTolerance: 0.000001,
      },
      {
        label: 'theta_expr',
        prompt: richText('Enter symbolic expression for angle of twist θ in radians.'),
        partType: 'symbolic',
        symbolicAnswer: 'T * L / (J * G)',
        symbolicVariables: [
          { variable: 'T', testMin: 100000, testMax: 6000000 },
          { variable: 'L', testMin: 100, testMax: 5000 },
          { variable: 'J', testMin: 10000, testMax: 900000 },
          { variable: 'G', testMin: 10000, testMax: 120000 },
        ],
        symbolicTolerance: 0.000001,
      },
    ],
  })

  const staticsSet1Ids = [
    ensureNumericId(udlBeamProblem, 'problem'),
    ensureNumericId(eccentricBeamProblem, 'problem'),
    ensureNumericId(cantileverUdlProblem, 'problem'),
  ]
  const staticsSet2Ids = [
    ensureNumericId(ringForcesProblem, 'problem'),
    ensureNumericId(inclinedMomentProblem, 'problem'),
    ensureNumericId(trussJointProblem, 'problem'),
  ]
  const staticsSet3Ids = [
    ensureNumericId(partialUdlProblem, 'problem'),
    ensureNumericId(triangularUdlBeamProblem, 'problem'),
    ensureNumericId(combinedBeamProblem, 'problem'),
  ]
  const mechanicsSetIds = [
    ensureNumericId(axialStressStrainProblem, 'problem'),
    ensureNumericId(axialDeformationProblem, 'problem'),
    ensureNumericId(steppedBarProblem, 'problem'),
    ensureNumericId(bendingStressProblem, 'problem'),
    ensureNumericId(torsionStressProblem, 'problem'),
    ensureNumericId(torsionTwistProblem, 'problem'),
  ]

  const allProblemIds = [
    ...staticsSet1Ids,
    ...staticsSet2Ids,
    ...staticsSet3Ids,
    ...mechanicsSetIds,
  ]

  const set1 = await upsertProblemSet(payload, LIBRARY_SET_1, staticsSet1Ids)
  const set2 = await upsertProblemSet(payload, LIBRARY_SET_2, staticsSet2Ids)
  const set3 = await upsertProblemSet(payload, LIBRARY_SET_3, staticsSet3Ids)
  const mechanicsSet = await upsertProblemSet(payload, LIBRARY_SET_MECH, mechanicsSetIds)
  const masterSet = await upsertProblemSet(payload, LIBRARY_MASTER_SET, allProblemIds)

  payload.logger.info(
    `Engineering library seeded: set1=${ensureNumericId(
      set1,
      'problem-set',
    )}, set2=${ensureNumericId(set2, 'problem-set')}, set3=${ensureNumericId(
      set3,
      'problem-set',
    )}, mechanics=${ensureNumericId(mechanicsSet, 'problem-set')}, master=${ensureNumericId(
      masterSet,
      'problem-set',
    )}, problems=${allProblemIds.join(',')}`,
  )
}

const shouldRunAsScript = process.argv[1]?.includes('engineeringInteractiveLibrary.ts')

if (shouldRunAsScript) {
  const payload = await getPayload({ config: configPromise })
  await seedEngineeringInteractiveLibrary(payload)
}
