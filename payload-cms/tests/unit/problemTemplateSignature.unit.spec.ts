import { afterEach, describe, expect, it } from 'vitest'

import {
  signProblemTemplateVariant,
  verifyProblemTemplateVariantSignature,
} from '@/lib/problemSet/problemTemplateSignature'

const ORIGINAL_PAYLOAD_SECRET = process.env.PAYLOAD_SECRET
const ORIGINAL_TEMPLATE_SECRET = process.env.PROBLEM_TEMPLATE_SIGNING_SECRET

afterEach(() => {
  if (ORIGINAL_PAYLOAD_SECRET == null) delete process.env.PAYLOAD_SECRET
  else process.env.PAYLOAD_SECRET = ORIGINAL_PAYLOAD_SECRET

  if (ORIGINAL_TEMPLATE_SECRET == null) delete process.env.PROBLEM_TEMPLATE_SIGNING_SECRET
  else process.env.PROBLEM_TEMPLATE_SIGNING_SECRET = ORIGINAL_TEMPLATE_SECRET
})

describe('problemTemplateSignature', () => {
  it('fails closed when no signing secret is configured', () => {
    delete process.env.PROBLEM_TEMPLATE_SIGNING_SECRET
    delete process.env.PAYLOAD_SECRET

    const signature = signProblemTemplateVariant('problem-1', 'seed-1')
    expect(signature).toBe('')
    expect(
      verifyProblemTemplateVariantSignature({
        problemId: 'problem-1',
        seed: 'seed-1',
        signature: 'deadbeef',
      }),
    ).toBe(false)
  })

  it('verifies only matching signatures when secret is configured', () => {
    process.env.PROBLEM_TEMPLATE_SIGNING_SECRET = 'test-signing-secret'

    const signature = signProblemTemplateVariant('problem-42', 'seed-abc')
    expect(signature).toMatch(/^[a-f0-9]{64}$/)
    expect(
      verifyProblemTemplateVariantSignature({
        problemId: 'problem-42',
        seed: 'seed-abc',
        signature,
      }),
    ).toBe(true)
    expect(
      verifyProblemTemplateVariantSignature({
        problemId: 'problem-42',
        seed: 'seed-tampered',
        signature,
      }),
    ).toBe(false)
  })
})
