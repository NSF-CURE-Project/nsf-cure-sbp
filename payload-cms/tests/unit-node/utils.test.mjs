import assert from 'node:assert/strict'
import { describe, it, afterEach } from 'node:test'

import { ensureUniqueSlug, slugify } from '../../src/utils/slug.ts'
import { generateUniqueJoinCode } from '../../src/utils/joinCode.ts'
import { getReportingSummary, reportRowsToCsv } from '../../src/utils/analyticsSummary.ts'
import { buildEmailConfirmation, hashEmailToken } from '../../src/utils/emailConfirmation.ts'
import { buildAuthEmail, buildResetPasswordUrl } from '../../src/utils/authEmails.ts'

describe('slug utilities', () => {
  it('slugify normalizes text and strips symbols', () => {
    assert.equal(slugify('  Hello, World!  '), 'hello-world')
    assert.equal(slugify('A---B___C'), 'a-b-c')
    assert.equal(slugify('***'), 'untitled')
  })

  it('ensureUniqueSlug appends incrementing suffixes until unique', async () => {
    const calls = []
    const req = {
      payload: {
        find: async (args) => {
          calls.push(args)
          if (calls.length <= 2) return { totalDocs: 1 }
          return { totalDocs: 0 }
        },
      },
    }

    const slug = await ensureUniqueSlug({ base: 'intro', collection: 'pages', req, id: '123' })
    assert.equal(slug, 'intro-3')
    assert.equal(calls[0].where.slug.equals, 'intro')
    assert.equal(calls[1].where.slug.equals, 'intro-2')
    assert.equal(calls[0].where.id.not_equals, '123')
  })

  it('ensureUniqueSlug returns base when request payload is unavailable', async () => {
    const slug = await ensureUniqueSlug({ base: 'already-good', collection: 'pages' })
    assert.equal(slug, 'already-good')
  })

  it('ensureUniqueSlug preserves additional where constraints', async () => {
    const req = {
      payload: {
        find: async ({ where }) => {
          assert.equal(where.class.equals, 'class-1')
          return { totalDocs: 0 }
        },
      },
    }

    const slug = await ensureUniqueSlug({
      base: 'chapter-1',
      collection: 'chapters',
      req,
      where: {
        class: { equals: 'class-1' },
      },
    })

    assert.equal(slug, 'chapter-1')
  })
})

describe('joinCode utilities', () => {
  it('returns code for first non-colliding candidate', async () => {
    const payload = {
      find: async () => {
        payload.calls += 1
        if (payload.calls === 1) return { docs: [{ id: 'taken' }] }
        return { docs: [] }
      },
      calls: 0,
    }

    const code = await generateUniqueJoinCode(payload, 6)
    assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/)
    assert.equal(payload.calls, 2)
  })

  it('throws after max retries', async () => {
    const payload = {
      calls: 0,
      find: async () => {
        payload.calls += 1
        return { docs: [{ id: 'taken' }] }
      },
    }

    await assert.rejects(
      generateUniqueJoinCode(payload, 6),
      /Unable to generate a unique join code\./,
    )
    assert.equal(payload.calls, 16)
  })

  it('respects custom code length parameter', async () => {
    const payload = {
      find: async () => ({ docs: [] }),
    }
    const code = await generateUniqueJoinCode(payload, 8)
    assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/)
  })
})

describe('analytics summary utilities', () => {
  it('escapes CSV fields', () => {
    const csv = reportRowsToCsv(
      [
        { name: 'Alice', note: 'Simple' },
        { name: 'Bob, Jr.', note: 'He said "hi"\nthen left' },
      ],
      ['name', 'note'],
    )
    assert.equal(csv, 'name,note\nAlice,Simple\n"Bob, Jr.","He said ""hi""\nthen left"')
  })

  it('aggregates reporting summary fields', async () => {
    const payload = {
      async find({ collection }) {
        if (collection === 'classes') {
          return { docs: [{ id: 'class-1', title: 'Biology 101' }, { id: 'class-2', title: '' }], hasNextPage: false }
        }
        if (collection === 'chapters') {
          return { docs: [{ id: 'chapter-1', title: 'Cells' }, { id: 'chapter-2' }], hasNextPage: false }
        }
        if (collection === 'lesson-progress') {
          return {
            docs: [
              { class: 'class-1', chapter: 'chapter-1', user: 'u1', completed: true, updatedAt: '2026-01-06T10:00:00.000Z' },
              { class: 'class-1', chapter: 'chapter-1', user: 'u2', completed: false, updatedAt: '2026-01-08T12:00:00.000Z' },
              { class: 'class-2', chapter: 'chapter-2', user: 'u1', completed: true, updatedAt: '2026-01-13T11:00:00.000Z' },
            ],
            hasNextPage: false,
          }
        }
        if (collection === 'quiz-attempts') {
          return { docs: [{ score: 55, maxScore: 100 }, { score: 0.74 }, { score: '95', maxScore: '100' }], hasNextPage: false }
        }
        throw new Error(`Unexpected collection: ${collection}`)
      },
    }

    const summary = await getReportingSummary(payload)
    assert.equal(summary.classCompletion[0].id, 'class-2')
    assert.equal(summary.chapterCompletion[0].id, 'chapter-2')
    assert.deepEqual(summary.quizMasteryDistribution.map((x) => [x.label, x.count]), [
      ['0-59%', 1],
      ['60-69%', 0],
      ['70-79%', 1],
      ['80-89%', 0],
      ['90-100%', 1],
    ])
    assert.deepEqual(summary.weeklyEngagement, [
      { weekStart: '2026-01-05', activeStudents: 2, weekOverWeekChange: null },
      { weekStart: '2026-01-12', activeStudents: 1, weekOverWeekChange: -0.5 },
    ])
  })

  it('handles pagination and week-over-week zero baseline safely', async () => {
    const payload = {
      async find({ collection, page }) {
        if (collection === 'classes') {
          return {
            docs: page === 1 ? [{ id: 'class-1', title: 'Bio' }] : [{ id: 'class-2', title: 'Chem' }],
            hasNextPage: page === 1,
          }
        }
        if (collection === 'chapters') {
          return { docs: [], hasNextPage: false }
        }
        if (collection === 'lesson-progress') {
          return {
            docs:
              page === 1
                ? [{ class: 'class-1', user: 'u1', completed: true, updatedAt: '2026-01-06T00:00:00.000Z' }]
                : [{ class: 'class-2', user: 'u2', completed: false, updatedAt: 'invalid-date' }],
            hasNextPage: page === 1,
          }
        }
        if (collection === 'quiz-attempts') {
          return {
            docs: [
              { score: -10, maxScore: 100 },
              { score: 200, maxScore: 100 },
              { score: 'not-a-number' },
            ],
            hasNextPage: false,
          }
        }
        throw new Error(`Unexpected collection: ${collection}`)
      },
    }

    const summary = await getReportingSummary(payload)
    assert.equal(summary.classCompletion.length, 2)
    assert.equal(summary.classCompletion[0].completionRate, 1)
    assert.equal(summary.classCompletion[1].completionRate, 0)
    assert.deepEqual(summary.weeklyEngagement, [
      { weekStart: '2026-01-05', activeStudents: 1, weekOverWeekChange: null },
    ])
    assert.deepEqual(summary.quizMasteryDistribution.map((x) => x.count), [1, 0, 0, 0, 1])
  })
})



describe('auth email template utilities', () => {
  it('buildResetPasswordUrl URL-encodes token values', () => {
    process.env.WEB_PUBLIC_URL = 'https://app.example.com'
    const url = buildResetPasswordUrl('a+b/c?d=e')
    assert.equal(url, 'https://app.example.com/reset-password?token=a%2Bb%2Fc%3Fd%3De')
    delete process.env.WEB_PUBLIC_URL
  })

  it('buildAuthEmail returns matching text and html content', () => {
    process.env.SUPPORT_EMAIL = 'help@example.com'

    const message = buildAuthEmail({
      heading: 'Confirm your account',
      intro: 'Please confirm your account.',
      actionLabel: 'Confirm account',
      actionUrl: 'https://app.example.com/confirm?token=123',
      expiresIn: '48 hours',
      securityNote: 'If this was not you, ignore this email.',
    })

    assert.match(message.text, /Confirm account: https:\/\/app\.example\.com\/confirm\?token=123/)
    assert.match(message.text, /expires in 48 hours\./)
    assert.match(message.text, /If this was not you, ignore this email\./)
    assert.match(message.text, /contact support at help@example\.com\./)
    assert.match(message.html, /<h2[^>]*>Confirm your account<\/h2>/)
    assert.match(message.html, /href="https:\/\/app\.example\.com\/confirm\?token=123"/)
    assert.match(message.html, /This link expires in 48 hours\./)
    assert.match(message.html, /If this was not you, ignore this email\./)
    assert.match(message.html, /contact support at help@example\.com\./)

    delete process.env.SUPPORT_EMAIL
  })
})
describe('email confirmation utilities', () => {
  const prevPublic = process.env.WEB_PUBLIC_URL
  const prevPreview = process.env.WEB_PREVIEW_URL

  afterEach(() => {
    if (prevPublic === undefined) delete process.env.WEB_PUBLIC_URL
    else process.env.WEB_PUBLIC_URL = prevPublic
    if (prevPreview === undefined) delete process.env.WEB_PREVIEW_URL
    else process.env.WEB_PREVIEW_URL = prevPreview
  })

  it('hashEmailToken is deterministic', () => {
    assert.equal(
      hashEmailToken('abc'),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('buildEmailConfirmation honors URL fallback order', () => {
    process.env.WEB_PUBLIC_URL = 'https://app.example.com'
    const fromPublic = buildEmailConfirmation()
    assert.match(fromPublic.confirmUrl, /^https:\/\/app\.example\.com\/confirm-email\?token=[a-f0-9]{64}$/)

    delete process.env.WEB_PUBLIC_URL
    process.env.WEB_PREVIEW_URL = 'https://preview.example.com'
    const fromPreview = buildEmailConfirmation()
    assert.match(fromPreview.confirmUrl, /^https:\/\/preview\.example\.com\/confirm-email\?token=[a-f0-9]{64}$/)

    delete process.env.WEB_PREVIEW_URL
    const fromLocal = buildEmailConfirmation()
    assert.match(fromLocal.confirmUrl, /^http:\/\/localhost:3001\/confirm-email\?token=[a-f0-9]{64}$/)
  })

  it('buildEmailConfirmation sets expiry roughly 24h in future', () => {
    const now = Date.now()
    const { expiresAt } = buildEmailConfirmation()
    const delta = new Date(expiresAt).getTime() - now
    assert.ok(delta > 23.5 * 60 * 60 * 1000)
    assert.ok(delta < 24.5 * 60 * 60 * 1000)
  })

  it('prefers WEB_PUBLIC_URL over WEB_PREVIEW_URL when both are set', () => {
    process.env.WEB_PUBLIC_URL = 'https://public.example.com'
    process.env.WEB_PREVIEW_URL = 'https://preview.example.com'

    const result = buildEmailConfirmation()
    assert.match(
      result.confirmUrl,
      /^https:\/\/public\.example\.com\/confirm-email\?token=[a-f0-9]{64}$/,
    )
    assert.match(result.tokenHash, /^[a-f0-9]{64}$/)
  })
})
