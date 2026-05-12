// Block model for the custom lesson editor. Mirrors the persisted shape of
// the lesson's `layout` array (defined by `lessonBlocks` in
// payload-cms/src/blocks/pageBlocks.ts).
//
// Coverage status (Stages 0–2):
//   * sectionTitle ✓ all fields
//   * videoBlock — url + caption ✓; `video` upload field deferred (media
//     picker is a separate scope; authors can attach uploads later from the
//     lesson edit view).
//   * buttonBlock ✓ all fields
//   * listBlock ✓ all fields
//   * stepsList ✓ heading + description (rich text per step)
//   * textSection ✓ all fields including rich-text body
//   * richTextBlock ✓ all fields
//   * quizBlock — quiz pick + flags ✓; relies on existing /api/quizzes
//
// Skipped/optional fields are simply absent from the POST body; the lesson
// schema marks them as optional, so a partial layout still validates
// server-side.

export type ListStyle = 'unordered' | 'ordered'
export type HeadingSize = 'sm' | 'md' | 'lg'

import type { SerializedEditorState } from 'lexical'

// Lexical EditorState JSON — matches the shape Payload's richText fields
// store in `jsonb` columns (root + nested nodes, version-tagged).
export type LexicalRichText = SerializedEditorState | null

export type SectionTitleData = {
  blockType: 'sectionTitle'
  title: string
  subtitle?: string
  size?: HeadingSize
}

export type VideoBlockData = {
  blockType: 'videoBlock'
  // `video` is a relationship to the `media` collection. Either an uploaded
  // file or an external `url` (or both) can drive playback on the public side.
  video?: string | number | null
  url?: string
  caption?: string
}

export type ButtonBlockData = {
  blockType: 'buttonBlock'
  label: string
  href: string
}

export type ListItemData = { text?: string }
export type ListBlockData = {
  blockType: 'listBlock'
  title?: string
  listStyle?: ListStyle
  items?: ListItemData[]
}

export type StepData = { heading: string; description?: LexicalRichText }
export type StepsListBlockData = {
  blockType: 'stepsList'
  title?: string
  steps?: StepData[]
}

export type TextSectionData = {
  blockType: 'textSection'
  title?: string
  subtitle?: string
  size?: HeadingSize
  body?: LexicalRichText
}

export type RichTextBlockData = {
  blockType: 'richTextBlock'
  body: LexicalRichText
}

export type QuizBlockData = {
  blockType: 'quizBlock'
  title?: string
  quiz: string | number | null
  showTitle?: boolean
  showAnswers?: boolean
  maxAttempts?: number | null
  timeLimitSec?: number | null
}

export type ProblemSetBlockData = {
  blockType: 'problemSetBlock'
  title?: string
  problemSet: string | number | null
  showTitle?: boolean
  showAnswers?: boolean
  maxAttempts?: number | null
}

// Opaque carrier for block types the custom editor doesn't (yet) know how to
// render. On hydrate we stash the raw record here; on serialize we expand it
// back to its original shape. The discriminator `__passthrough` is what makes
// the union ranking work — the real `blockType` lives in `data.blockType`.
export type PassthroughBlockData = {
  blockType: '__passthrough'
  // Frozen copy of the original block, including its own `blockType`.
  data: Record<string, unknown>
}

export type ScaffoldBlockData =
  | SectionTitleData
  | VideoBlockData
  | ButtonBlockData
  | ListBlockData
  | StepsListBlockData
  | TextSectionData
  | RichTextBlockData
  | QuizBlockData
  | ProblemSetBlockData
  | PassthroughBlockData

// In-memory block: a Stage-1 block payload plus a stable client-side key
// used for React identity and dnd-kit reorder. `_key` is stripped before
// the layout is sent to Payload.
export type ScaffoldBlock = ScaffoldBlockData & { _key: string }

export type BlockTypeSlug = ScaffoldBlockData['blockType']
// Subset of slugs the user can pick from the add-block menu. Passthrough
// blocks are only created via hydration of existing lessons, never user
// action.
export type AuthorableBlockTypeSlug = Exclude<BlockTypeSlug, '__passthrough'>

export const BLOCK_TYPE_LABELS: Record<BlockTypeSlug, string> = {
  sectionTitle: 'Section title',
  videoBlock: 'Video',
  buttonBlock: 'Button',
  listBlock: 'List',
  stepsList: 'Steps',
  textSection: 'Text section',
  richTextBlock: 'Rich text',
  quizBlock: 'Quiz',
  problemSetBlock: 'Problem set',
  __passthrough: 'Unsupported',
}

const newKey = () => `blk-${Math.random().toString(36).slice(2, 10)}`

export const emptyBlockFor = (type: AuthorableBlockTypeSlug): ScaffoldBlock => {
  switch (type) {
    case 'sectionTitle':
      return { _key: newKey(), blockType: 'sectionTitle', title: '', size: 'md' }
    case 'videoBlock':
      return { _key: newKey(), blockType: 'videoBlock' }
    case 'buttonBlock':
      return { _key: newKey(), blockType: 'buttonBlock', label: '', href: '' }
    case 'listBlock':
      return {
        _key: newKey(),
        blockType: 'listBlock',
        listStyle: 'unordered',
        items: [{ text: '' }],
      }
    case 'stepsList':
      return { _key: newKey(), blockType: 'stepsList', steps: [{ heading: '' }] }
    case 'textSection':
      return { _key: newKey(), blockType: 'textSection', size: 'md' }
    case 'richTextBlock':
      return { _key: newKey(), blockType: 'richTextBlock', body: null }
    case 'quizBlock':
      return {
        _key: newKey(),
        blockType: 'quizBlock',
        quiz: null,
        showTitle: true,
        showAnswers: true,
      }
    case 'problemSetBlock':
      return {
        _key: newKey(),
        blockType: 'problemSetBlock',
        problemSet: null,
        showTitle: true,
        showAnswers: true,
      }
  }
}

// Coerce a relationship id value to the form Payload's validator accepts.
// Postgres collections use integer ids; the `isValidID` helper rejects
// numeric strings (same gotcha bit `courses-order-api`'s `relId`).
const toRelId = (value: unknown): number | string | null => {
  if (value == null) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (typeof value === 'string') return value
  return null
}

// Strip the `_key` from each block and normalize any embedded relationship
// ids before sending to Payload. Passthrough blocks expand back into their
// original record verbatim so we don't lose data on edit-save round-trips.
export const toPersistedLayout = (blocks: ScaffoldBlock[]): Record<string, unknown>[] =>
  blocks.map((block) => {
    const { _key: _ignored, ...rest } = block
    if (rest.blockType === '__passthrough') {
      return { ...rest.data }
    }
    if (rest.blockType === 'quizBlock') {
      return { ...rest, quiz: toRelId(rest.quiz) }
    }
    if (rest.blockType === 'problemSetBlock') {
      return { ...rest, problemSet: toRelId(rest.problemSet) }
    }
    if (rest.blockType === 'videoBlock' && rest.video != null) {
      return { ...rest, video: toRelId(rest.video) }
    }
    return rest as Record<string, unknown>
  })

// Extract an id from a relationship value that may be a primitive id or a
// populated document (depth>0 hydration returns the full doc).
const extractRelId = (value: unknown): string | number | null => {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const inner = (value as { id?: unknown }).id
    return typeof inner === 'string' || typeof inner === 'number' ? inner : null
  }
  return null
}

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback
const asOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined
const asSize = (value: unknown): HeadingSize | undefined => {
  if (value === 'sm' || value === 'md' || value === 'lg') return value
  return undefined
}
const asListStyle = (value: unknown): ListStyle | undefined => {
  if (value === 'unordered' || value === 'ordered') return value
  return undefined
}
const asBoolean = (value: unknown, fallback?: boolean): boolean | undefined => {
  if (typeof value === 'boolean') return value
  return fallback
}
const asNumberOrNull = (value: unknown): number | null => {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return null
}
const asRichText = (value: unknown): LexicalRichText => {
  if (
    value &&
    typeof value === 'object' &&
    'root' in (value as object)
  ) {
    return value as LexicalRichText
  }
  return null
}

// Hydrate Payload's persisted layout (as fetched via /api/lessons or the
// local API at depth>=1) back into the editor's ScaffoldBlock[] shape.
// Unknown / unsupported block types are dropped — the user can re-add them
// from the picker, and the editor will round-trip the supported ones.
export const fromPersistedLayout = (
  layout: unknown,
): ScaffoldBlock[] => {
  if (!Array.isArray(layout)) return []
  const newKey = () => `blk-${Math.random().toString(36).slice(2, 10)}`
  const out: ScaffoldBlock[] = []
  for (const raw of layout) {
    if (!raw || typeof raw !== 'object') continue
    const block = raw as Record<string, unknown>
    const blockType = block.blockType
    switch (blockType) {
      case 'sectionTitle':
        out.push({
          _key: newKey(),
          blockType: 'sectionTitle',
          title: asString(block.title),
          subtitle: asOptionalString(block.subtitle),
          size: asSize(block.size),
        })
        break
      case 'videoBlock':
        out.push({
          _key: newKey(),
          blockType: 'videoBlock',
          video: extractRelId(block.video),
          url: asOptionalString(block.url),
          caption: asOptionalString(block.caption),
        })
        break
      case 'buttonBlock':
        out.push({
          _key: newKey(),
          blockType: 'buttonBlock',
          label: asString(block.label),
          href: asString(block.href),
        })
        break
      case 'listBlock': {
        const items = Array.isArray(block.items)
          ? (block.items as Array<Record<string, unknown>>).map((it) => ({
              text: asOptionalString(it.text),
            }))
          : []
        out.push({
          _key: newKey(),
          blockType: 'listBlock',
          title: asOptionalString(block.title),
          listStyle: asListStyle(block.listStyle),
          items: items.length > 0 ? items : [{ text: '' }],
        })
        break
      }
      case 'stepsList': {
        const steps = Array.isArray(block.steps)
          ? (block.steps as Array<Record<string, unknown>>).map((step) => ({
              heading: asString(step.heading),
              description: asRichText(step.description),
            }))
          : []
        out.push({
          _key: newKey(),
          blockType: 'stepsList',
          title: asOptionalString(block.title),
          steps: steps.length > 0 ? steps : [{ heading: '' }],
        })
        break
      }
      case 'textSection':
        out.push({
          _key: newKey(),
          blockType: 'textSection',
          title: asOptionalString(block.title),
          subtitle: asOptionalString(block.subtitle),
          size: asSize(block.size),
          body: asRichText(block.body),
        })
        break
      case 'richTextBlock':
        out.push({
          _key: newKey(),
          blockType: 'richTextBlock',
          body: asRichText(block.body),
        })
        break
      case 'quizBlock':
        out.push({
          _key: newKey(),
          blockType: 'quizBlock',
          title: asOptionalString(block.title),
          quiz: extractRelId(block.quiz),
          showTitle: asBoolean(block.showTitle, true),
          showAnswers: asBoolean(block.showAnswers, true),
          maxAttempts: asNumberOrNull(block.maxAttempts),
          timeLimitSec: asNumberOrNull(block.timeLimitSec),
        })
        break
      case 'problemSetBlock':
        out.push({
          _key: newKey(),
          blockType: 'problemSetBlock',
          title: asOptionalString(block.title),
          problemSet: extractRelId(block.problemSet),
          showTitle: asBoolean(block.showTitle, true),
          showAnswers: asBoolean(block.showAnswers, true),
          maxAttempts: asNumberOrNull(block.maxAttempts),
        })
        break
      // Unknown block type — keep as opaque passthrough so we don't lose
      // it on edit-save. The editor renders a read-only chip; the data
      // round-trips verbatim.
      default:
        out.push({ _key: newKey(), blockType: '__passthrough', data: block })
        break
    }
  }
  return out
}
