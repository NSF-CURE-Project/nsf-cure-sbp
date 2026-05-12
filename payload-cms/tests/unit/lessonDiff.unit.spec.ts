import { describe, expect, it } from 'vitest'
import {
  describeChange,
  diffLessonLayouts,
} from '@/views/courses/scaffold/lessonDiff'

// A minimal Lexical-style rich text node so we can exercise text extraction.
const rich = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text }],
      },
    ],
  },
})

describe('diffLessonLayouts', () => {
  it('returns no changes when both snapshots are identical', () => {
    const layout = [
      { blockType: 'sectionTitle', title: 'Intro', size: 'md' },
      { blockType: 'richTextBlock', body: rich('Hello world') },
    ]
    const diff = diffLessonLayouts(
      { title: 'Lesson 1', layout },
      { title: 'Lesson 1', layout },
    )
    expect(diff.changes).toEqual([])
    expect(diff.headline).toMatch(/no changes/i)
  })

  it('detects a title change', () => {
    const diff = diffLessonLayouts(
      { title: 'Old', layout: [] },
      { title: 'New', layout: [] },
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({ kind: 'title', from: 'Old', to: 'New' })
    expect(describeChange(diff.changes[0])).toMatch(/Old.*New/)
  })

  it('detects an added block at the tail', () => {
    const prev = [{ blockType: 'sectionTitle', title: 'A' }]
    const next = [
      { blockType: 'sectionTitle', title: 'A' },
      { blockType: 'richTextBlock', body: rich('') },
    ]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({ kind: 'block-added', index: 1 })
  })

  it('detects a removed block at the tail', () => {
    const prev = [
      { blockType: 'sectionTitle', title: 'A' },
      { blockType: 'buttonBlock', label: 'Go', href: '/x' },
    ]
    const next = [{ blockType: 'sectionTitle', title: 'A' }]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({ kind: 'block-removed', index: 1 })
  })

  it('flags a block-type swap at the same position', () => {
    const prev = [{ blockType: 'sectionTitle', title: 'A' }]
    const next = [{ blockType: 'buttonBlock', label: 'A', href: '/' }]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes[0]).toMatchObject({ kind: 'block-type-changed', index: 0 })
  })

  it('detects quiz relationship change as a field-level diff', () => {
    const prev = [{ blockType: 'quizBlock', quiz: 1, showTitle: true }]
    const next = [{ blockType: 'quizBlock', quiz: 2, showTitle: true }]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({
      kind: 'block-field',
      index: 0,
      summary: 'Quiz selection changed',
    })
  })

  it('normalizes relationship ids across string/number/object shapes', () => {
    const prev = [{ blockType: 'quizBlock', quiz: 7 }]
    const next = [{ blockType: 'quizBlock', quiz: { id: '7', title: 'whatever' } }]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toEqual([])
  })

  it('detects rich-text body edits by comparing extracted text', () => {
    const prev = [{ blockType: 'richTextBlock', body: rich('Once upon a time') }]
    const next = [{ blockType: 'richTextBlock', body: rich('Once upon a midnight') }]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({ summary: 'Body text edited' })
  })

  it('ignores cosmetic rich-text changes that produce the same extracted text', () => {
    const prev = [{ blockType: 'richTextBlock', body: rich('Hello') }]
    // Same visible text but with an extra wrapping node — should still match.
    const next = [
      {
        blockType: 'richTextBlock',
        body: {
          root: {
            children: [
              { type: 'paragraph', children: [{ type: 'text', text: 'Hello' }] },
            ],
          },
        },
      },
    ]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toEqual([])
  })

  it('summarizes list item count changes', () => {
    const prev = [{ blockType: 'listBlock', items: [{ text: 'a' }, { text: 'b' }] }]
    const next = [
      { blockType: 'listBlock', items: [{ text: 'a' }, { text: 'b' }, { text: 'c' }] },
    ]
    const diff = diffLessonLayouts(
      { title: 'L', layout: prev },
      { title: 'L', layout: next },
    )
    expect(diff.changes).toHaveLength(1)
    expect(diff.changes[0]).toMatchObject({ summary: 'Items: 2 → 3' })
  })

  it('describes changes as human-readable one-liners', () => {
    const diff = diffLessonLayouts(
      { title: 'L', layout: [{ blockType: 'sectionTitle', title: 'A' }] },
      {
        title: 'L',
        layout: [
          { blockType: 'sectionTitle', title: 'A' },
          { blockType: 'richTextBlock', body: rich('Hi') },
        ],
      },
    )
    expect(describeChange(diff.changes[0])).toBe('Added Rich text (block #2)')
  })
})
