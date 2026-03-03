import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

type LexicalTextNode = {
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  type: 'text'
  version: 1
}

type LexicalParagraphNode = {
  children: LexicalTextNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  textFormat: number
  textStyle: string
  type: 'paragraph'
  version: 1
}

type LexicalHeadingNode = {
  children: LexicalTextNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  tag: 'h1' | 'h2' | 'h3' | 'h4'
  type: 'heading'
  version: 1
}

type LexicalListItemNode = {
  children: LexicalParagraphNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  type: 'listitem'
  value: number
  version: 1
}

type LexicalListNode = {
  children: LexicalListItemNode[]
  direction: 'ltr' | null
  format: ''
  indent: number
  listType: 'bullet' | 'number'
  start: number
  tag: 'ul' | 'ol'
  type: 'list'
  version: 1
}

type LexicalNode = LexicalParagraphNode | LexicalHeadingNode | LexicalListNode

type LexicalDocument = {
  root: {
    children: LexicalNode[]
    direction: 'ltr' | null
    format: ''
    indent: number
    type: 'root'
    version: 1
  }
}

const createTextNode = (text: string): LexicalTextNode => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const createParagraphNode = (text: string): LexicalParagraphNode => ({
  children: [createTextNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  type: 'paragraph',
  version: 1,
})

const createHeadingNode = (
  text: string,
  tag: 'h1' | 'h2' | 'h3' | 'h4',
): LexicalHeadingNode => ({
  children: [createTextNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  type: 'heading',
  version: 1,
})

const createListNode = (
  items: string[],
  listType: 'bullet' | 'number',
): LexicalListNode => ({
  children: items.map((item, index) => ({
    children: [createParagraphNode(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'listitem',
    value: index + 1,
    version: 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType,
  start: 1,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  type: 'list',
  version: 1,
})

const cleanupInlineMarkdown = (value: string) =>
  value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()

const toHeadingTag = (level: number): 'h1' | 'h2' | 'h3' | 'h4' => {
  if (level <= 1) return 'h1'
  if (level === 2) return 'h2'
  if (level === 3) return 'h3'
  return 'h4'
}

const parseMarkdownToLexical = (markdown: string): LexicalDocument => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const nodes: LexicalNode[] = []
  const paragraphLines: string[] = []

  const flushParagraph = () => {
    if (!paragraphLines.length) return
    const text = cleanupInlineMarkdown(paragraphLines.join(' ').replace(/\s+/g, ' '))
    if (text) {
      nodes.push(createParagraphNode(text))
    }
    paragraphLines.length = 0
  }

  let index = 0
  while (index < lines.length) {
    const rawLine = lines[index] ?? ''
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      flushParagraph()
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      flushParagraph()
      const blockLines: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] ?? '').trim().startsWith('```')) {
        blockLines.push(lines[index] ?? '')
        index += 1
      }
      const codeText = blockLines.join('\n').trim()
      if (codeText) {
        nodes.push(createParagraphNode(codeText))
      }
      if (index < lines.length && (lines[index] ?? '').trim().startsWith('```')) {
        index += 1
      }
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      const level = headingMatch[1].length
      const headingText = cleanupInlineMarkdown(headingMatch[2] ?? '')
      if (headingText) {
        nodes.push(createHeadingNode(headingText, toHeadingTag(level)))
      }
      index += 1
      continue
    }

    if (trimmed.startsWith('- ')) {
      flushParagraph()
      const items: string[] = []
      let pointer = index
      while (pointer < lines.length) {
        const next = (lines[pointer] ?? '').trim()
        if (!next.startsWith('- ')) break
        const text = cleanupInlineMarkdown(next.slice(2))
        if (text) items.push(text)
        pointer += 1
      }
      if (items.length) {
        nodes.push(createListNode(items, 'bullet'))
      }
      index = pointer
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph()
      const items: string[] = []
      let pointer = index
      while (pointer < lines.length) {
        const next = (lines[pointer] ?? '').trim()
        const orderedMatch = next.match(/^\d+\.\s+(.+)$/)
        if (!orderedMatch) break
        const text = cleanupInlineMarkdown(orderedMatch[1] ?? '')
        if (text) items.push(text)
        pointer += 1
      }
      if (items.length) {
        nodes.push(createListNode(items, 'number'))
      }
      index = pointer
      continue
    }

    paragraphLines.push(trimmed)
    index += 1
  }

  flushParagraph()

  return {
    root: {
      children: nodes,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

const resolveHandbookPath = () => {
  const filename = fileURLToPath(import.meta.url)
  const dirname = path.dirname(filename)
  return path.resolve(dirname, '..', '..', 'docs', 'staff', 'payload-admin-handbook.md')
}

const extractTitle = (markdown: string) => {
  const firstHeading = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '))
  if (!firstHeading) return 'NSF CURE Admin Help'
  return cleanupInlineMarkdown(firstHeading.replace(/^#\s+/, '')) || 'NSF CURE Admin Help'
}

async function syncAdminHelpFromHandbook() {
  const payload = await getPayload({ config: configPromise })
  const handbookPath = resolveHandbookPath()
  const markdown = await fs.readFile(handbookPath, 'utf8')
  const title = extractTitle(markdown)
  const body = parseMarkdownToLexical(markdown)

  await payload.updateGlobal({
    slug: 'admin-help',
    data: { title, body },
    draft: true,
  })

  await payload.updateGlobal({
    slug: 'admin-help',
    data: { title, body },
    draft: false,
  })

  payload.logger.info(`Updated admin-help from handbook: ${handbookPath}`)
}

await syncAdminHelpFromHandbook()
