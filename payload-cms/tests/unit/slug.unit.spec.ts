import { describe, expect, it, vi } from 'vitest'

import { ensureUniqueSlug, slugify } from '@/utils/slug'

describe('slug utilities', () => {
  it('slugify normalizes text and strips symbols', () => {
    expect(slugify('  Hello, World!  ')).toBe('hello-world')
    expect(slugify('A---B___C')).toBe('a-b-c')
  })

  it('slugify falls back to untitled when empty', () => {
    expect(slugify('***')).toBe('untitled')
  })

  it('ensureUniqueSlug returns base when no request payload is available', async () => {
    await expect(
      ensureUniqueSlug({
        base: 'intro',
        collection: 'pages',
      }),
    ).resolves.toBe('intro')
  })

  it('ensureUniqueSlug appends incrementing suffixes until unique', async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ totalDocs: 1 })
      .mockResolvedValueOnce({ totalDocs: 1 })
      .mockResolvedValueOnce({ totalDocs: 0 })

    const req = {
      payload: {
        find,
      },
    }

    await expect(
      ensureUniqueSlug({
        base: 'intro',
        collection: 'pages',
        req: req as never,
        id: '123',
      }),
    ).resolves.toBe('intro-3')

    expect(find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          slug: { equals: 'intro' },
          id: { not_equals: '123' },
        }),
      }),
    )
    expect(find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({ slug: { equals: 'intro-2' } }),
      }),
    )
  })
})
