import crypto from 'crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildEmailConfirmation, hashEmailToken } from '@/utils/emailConfirmation'

describe('email confirmation utilities', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    delete process.env.WEB_PUBLIC_URL
    delete process.env.WEB_PREVIEW_URL
  })

  it('hashEmailToken creates a deterministic SHA256 hash', () => {
    expect(hashEmailToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('buildEmailConfirmation uses WEB_PUBLIC_URL when available', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const tokenBytes = Buffer.from('f'.repeat(64), 'hex')
    vi.spyOn(crypto, 'randomBytes').mockReturnValue(tokenBytes)

    process.env.WEB_PUBLIC_URL = 'https://app.example.com'

    const result = buildEmailConfirmation()

    expect(result.token).toBe('f'.repeat(64))
    expect(result.confirmUrl).toBe(`https://app.example.com/confirm-email?token=${result.token}`)
    expect(result.expiresAt).toBe('2026-01-02T00:00:00.000Z')
    expect(result.tokenHash).toBe(hashEmailToken(result.token))
  })

  it('buildEmailConfirmation falls back to preview URL then localhost', () => {
    const tokenBytes = Buffer.from('a'.repeat(64), 'hex')
    vi.spyOn(crypto, 'randomBytes').mockReturnValue(tokenBytes)

    process.env.WEB_PREVIEW_URL = 'https://preview.example.com'
    const previewResult = buildEmailConfirmation()
    expect(previewResult.confirmUrl).toContain('https://preview.example.com/confirm-email?token=')

    delete process.env.WEB_PREVIEW_URL
    const localhostResult = buildEmailConfirmation()
    expect(localhostResult.confirmUrl).toContain('http://localhost:3001/confirm-email?token=')
  })
})
