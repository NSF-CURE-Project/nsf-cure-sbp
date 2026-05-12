import { describe, expect, it } from 'vitest'
import {
  fromPersistedLayout,
  toPersistedLayout,
  type ScaffoldBlock,
} from '@/views/courses/scaffold/types'

// Minimal but representative Lexical EditorState for richText round-trips.
const richText = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
        textStyle: '',
        textFormat: 0,
        children: [
          {
            mode: 'normal',
            text: 'Hello',
            type: 'text',
            style: '',
            detail: 0,
            format: 0,
            version: 1,
          },
        ],
      },
    ],
  },
} as unknown as ReturnType<typeof structuredClone>

// Strip the `_key` from each block — the field is purely client-side so two
// round-trips would compare unequal even when the content is identical.
const stripKeys = (blocks: ScaffoldBlock[]) =>
  blocks.map(({ _key: _ignored, ...rest }) => rest)

describe('lesson scaffold layout — hydration round-trip', () => {
  it('preserves sectionTitle fields', () => {
    const persisted = [
      { blockType: 'sectionTitle', title: 'Intro', subtitle: 'Setup', size: 'lg' },
    ]
    expect(toPersistedLayout(fromPersistedLayout(persisted))).toEqual(persisted)
  })

  it('preserves videoBlock fields (url + caption + uploaded media id)', () => {
    const persisted = [
      {
        blockType: 'videoBlock',
        url: 'https://example.com/v.mp4',
        caption: 'Lecture',
        video: 42, // already a numeric id
      },
    ]
    expect(toPersistedLayout(fromPersistedLayout(persisted))).toEqual(persisted)
  })

  it('extracts ids from populated relationships and writes back as numbers', () => {
    const persisted = [
      {
        blockType: 'quizBlock',
        title: 'Check your understanding',
        quiz: { id: 7, title: 'Some quiz' }, // depth>=1 hydrates the doc
        showTitle: true,
        showAnswers: false,
        maxAttempts: 3,
        timeLimitSec: null,
      },
    ]
    const out = toPersistedLayout(fromPersistedLayout(persisted))
    expect(out[0]).toMatchObject({
      blockType: 'quizBlock',
      title: 'Check your understanding',
      quiz: 7, // stripped to id
      showTitle: true,
      showAnswers: false,
      maxAttempts: 3,
      timeLimitSec: null,
    })
  })

  it('coerces numeric-string relationship ids to numbers on save', () => {
    const persisted = [
      {
        blockType: 'problemSetBlock',
        problemSet: '12', // stored as string somehow (e.g. from a stale form)
        showTitle: true,
        showAnswers: true,
        maxAttempts: 5,
      },
    ]
    const out = toPersistedLayout(fromPersistedLayout(persisted))
    expect(out[0]).toMatchObject({
      blockType: 'problemSetBlock',
      problemSet: 12,
      maxAttempts: 5,
    })
  })

  it('round-trips listBlock items', () => {
    const persisted = [
      {
        blockType: 'listBlock',
        title: 'Steps',
        listStyle: 'ordered',
        items: [{ text: 'one' }, { text: 'two' }, { text: 'three' }],
      },
    ]
    expect(toPersistedLayout(fromPersistedLayout(persisted))).toEqual(persisted)
  })

  it('round-trips stepsList with rich-text descriptions', () => {
    // A step with no description hydrates to `description: null` (the editor
    // uses null as the empty-rich-text sentinel); a Save round-trip puts it
    // back as null. Equivalent for the Lexical renderer, just explicit.
    const persisted = [
      {
        blockType: 'stepsList',
        title: 'How it works',
        steps: [
          { heading: 'First', description: richText },
          { heading: 'Second', description: null },
        ],
      },
    ]
    const hydrated = fromPersistedLayout(persisted)
    const back = toPersistedLayout(hydrated)
    expect(JSON.parse(JSON.stringify(back))).toEqual(
      JSON.parse(JSON.stringify(persisted)),
    )
  })

  it('preserves rich text in textSection.body and richTextBlock.body', () => {
    const persisted = [
      {
        blockType: 'textSection',
        title: 'Concept',
        subtitle: 'Sub',
        size: 'md',
        body: richText,
      },
      { blockType: 'richTextBlock', body: richText },
    ]
    const back = toPersistedLayout(fromPersistedLayout(persisted))
    expect(JSON.parse(JSON.stringify(back))).toEqual(
      JSON.parse(JSON.stringify(persisted)),
    )
  })

  it('preserves unknown block types verbatim via passthrough', () => {
    const persisted = [
      {
        blockType: 'someFutureBlock',
        weirdField: 'value',
        nested: { a: 1, b: [true, null, 'x'] },
      },
    ]
    const hydrated = fromPersistedLayout(persisted)
    // The passthrough block isn't editable, but the hydrate→serialize cycle
    // must round-trip the raw data exactly.
    expect(hydrated[0].blockType).toBe('__passthrough')
    expect(toPersistedLayout(hydrated)).toEqual(persisted)
  })

  it('strips _key when serializing', () => {
    const blocks: ScaffoldBlock[] = [
      { _key: 'blk-xyz', blockType: 'buttonBlock', label: 'Click', href: '/x' },
    ]
    const out = toPersistedLayout(blocks)
    expect(out[0]).not.toHaveProperty('_key')
    expect(out[0]).toEqual({ blockType: 'buttonBlock', label: 'Click', href: '/x' })
  })

  it('round-trips a mixed layout in order', () => {
    // Hydration normalizes optional numeric fields to `null` so the editor can
    // distinguish "cleared" from "untouched" — round-trip stable as long as we
    // express that in the expected shape too.
    const persisted = [
      { blockType: 'sectionTitle', title: 'A', size: 'sm' },
      { blockType: 'buttonBlock', label: 'Go', href: '/go' },
      { blockType: 'richTextBlock', body: richText },
      {
        blockType: 'quizBlock',
        quiz: 9,
        showTitle: true,
        showAnswers: true,
        maxAttempts: null,
        timeLimitSec: null,
      },
    ]
    const hydrated = fromPersistedLayout(persisted)
    expect(stripKeys(hydrated).map((b) => b.blockType)).toEqual([
      'sectionTitle',
      'buttonBlock',
      'richTextBlock',
      'quizBlock',
    ])
    const back = toPersistedLayout(hydrated)
    expect(JSON.parse(JSON.stringify(back))).toEqual(
      JSON.parse(JSON.stringify(persisted)),
    )
  })
})
