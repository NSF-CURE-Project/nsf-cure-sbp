import { describe, expect, it } from 'vitest'

import {
  buildPlotLabelOptions,
  coercePlotWizardReference,
  validatePlotXMax,
  validateResultPlotCriticalPoints,
  validateResultPlotSegments,
} from '@/lib/problemSet/resultPlotValidation'

describe('resultPlotValidation', () => {
  it('sanitizes human-readable part labels into safe references for the plot wizard', () => {
    const options = buildPlotLabelOptions(['Reaction at A', 'M_max', '2P'])

    expect(options).toEqual([
      {
        rawLabel: 'Reaction at A',
        reference: 'Reaction_at_A',
        sanitized: true,
      },
      {
        rawLabel: 'M_max',
        reference: 'M_max',
        sanitized: false,
      },
      {
        rawLabel: '2P',
        reference: '_2P',
        sanitized: true,
      },
    ])
    expect(coercePlotWizardReference('Reaction at A', options)).toBe('Reaction_at_A')
    expect(coercePlotWizardReference('M_max', options)).toBe('M_max')
    expect(coercePlotWizardReference('L / 2', options)).toBe('L / 2')
  })

  it('rejects invalid plot expressions', () => {
    expect(validatePlotXMax('L + 2')).toBe(true)
    expect(validatePlotXMax('L + )')).toContain('xMax')
    expect(
      validateResultPlotSegments({
        plotType: 'moment',
        segments: [{ xStart: '0', xEnd: 'L', formula: 'Ra * (x - )' }],
      }),
    ).toContain('Segment 1 formula')
    expect(validateResultPlotCriticalPoints([{ x: 'L / 2' }])).toBe(true)
    expect(validateResultPlotCriticalPoints([{ x: 'L / )' }])).toContain('Critical point 1 x')
  })

  it('blocks placeholder zero-formula deflection plots', () => {
    expect(
      validateResultPlotSegments({
        plotType: 'deflection',
        segments: [{ xStart: '0', xEnd: 'L', formula: '0' }],
      }),
    ).toContain('Deflection plots cannot use the placeholder zero formula')

    expect(
      validateResultPlotSegments({
        plotType: 'deflection',
        segments: [{ xStart: '0', xEnd: 'L', formula: '(P * x) / (6 * E * I)' }],
      }),
    ).toBe(true)
  })
})
