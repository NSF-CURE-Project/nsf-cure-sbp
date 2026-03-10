import { describe, expect, it, vi } from 'vitest'

import { generateUniqueJoinCode } from '@/utils/joinCode'

describe('generateUniqueJoinCode', () => {
  it('returns a non-colliding code', async () => {
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [{ id: 'taken' }] })
        .mockResolvedValueOnce({ docs: [] }),
    }

    const code = await generateUniqueJoinCode(payload as never, 6)

    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    expect(payload.find).toHaveBeenCalledTimes(2)
  })

  it('throws after maximum retries', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [{ id: 'taken' }] }),
    }

    await expect(generateUniqueJoinCode(payload as never, 6)).rejects.toThrow(
      'Unable to generate a unique join code.',
    )
    expect(payload.find).toHaveBeenCalledTimes(16)
  })
})
