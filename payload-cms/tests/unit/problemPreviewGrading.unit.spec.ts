import { describe, expect, it } from 'vitest'

import {
  buildPreviewCanonicalParts,
  buildPreviewSubmittedParts,
  normalizePreviewPartType,
} from '@/lib/problemSet/problemPreviewGrading'

describe('problemPreviewGrading', () => {
  it('normalizes preview part types', () => {
    expect(normalizePreviewPartType('numeric')).toBe('numeric')
    expect(normalizePreviewPartType('symbolic')).toBe('symbolic')
    expect(normalizePreviewPartType('fbd-draw')).toBe('fbd-draw')
    expect(normalizePreviewPartType('other')).toBe('numeric')
    expect(normalizePreviewPartType(undefined)).toBe('numeric')
  })

  it('builds canonical parts with template-aware numeric and symbolic mappings', () => {
    const result = buildPreviewCanonicalParts({
      parts: [
        {
          partType: 'numeric',
          correctAnswer: 10,
          correctAnswerExpression: '2 + 3',
          tolerance: 0.1,
          toleranceType: 'absolute',
        },
        {
          partType: 'symbolic',
          symbolicAnswer: 'x + y',
          symbolicVariables: [
            { variable: 'x', testMin: 1, testMax: 9 },
            { variable: 'y', testMin: 2, testMax: 3 },
          ],
          symbolicTolerance: 0.0001,
        },
      ],
      templateScope: { x: 7 },
    })

    expect(result[0]?.correctAnswer).toBe(5)
    expect(result[0]?.tolerance).toBe(0.1)
    expect(result[1]?.symbolicAnswer).toBe('x + y')
    expect(result[1]?.symbolicVariables).toEqual([
      { variable: 'x', testMin: 7, testMax: 7 },
      { variable: 'y', testMin: 2, testMax: 3 },
    ])
  })

  it('builds submitted parts for numeric, symbolic, and fbd-draw paths', () => {
    const submitted = buildPreviewSubmittedParts({
      parts: [
        { partType: 'numeric' },
        { partType: 'symbolic' },
        { partType: 'fbd-draw' },
      ],
      studentInputs: {
        0: ' 12.5 ',
        1: ' x + y ',
      },
      fbdInputs: {
        2: {
          forces: [{ id: 'F1', label: 'F1', angle: 30, magnitude: 1.2 }],
          moments: [{ id: 'M1', label: 'M1', direction: 'ccw', magnitude: 0.8 }],
        },
      },
    })

    expect(submitted[0]).toEqual({
      partIndex: 0,
      studentAnswer: 12.5,
      studentExpression: null,
      placedForces: null,
    })
    expect(submitted[1]).toEqual({
      partIndex: 1,
      studentAnswer: null,
      studentExpression: 'x + y',
      placedForces: null,
    })
    expect(submitted[2]).toEqual({
      partIndex: 2,
      studentAnswer: null,
      studentExpression: null,
      placedForces: {
        forces: [
          {
            id: 'F1',
            label: 'F1',
            origin: [0, 0],
            angle: 30,
            magnitude: 1.2,
          },
        ],
        moments: [
          {
            id: 'M1',
            label: 'M1',
            direction: 'ccw',
            x: 0,
            y: 0,
            magnitude: 0.8,
          },
        ],
      },
    })
  })

  it('returns null numeric answer when input is not parseable', () => {
    const submitted = buildPreviewSubmittedParts({
      parts: [{ partType: 'numeric' }],
      studentInputs: { 0: 'not-a-number' },
      fbdInputs: {},
    })

    expect(submitted[0]?.studentAnswer).toBeNull()
  })
})
