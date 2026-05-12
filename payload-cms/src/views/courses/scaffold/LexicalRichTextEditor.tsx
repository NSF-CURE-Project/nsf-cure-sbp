'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text'
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { $setBlocksType } from '@lexical/selection'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  type EditorState,
  type LexicalEditor,
} from 'lexical'

// Payload stores richText as a plain Lexical EditorState JSON dump:
//   { root: { type: 'root', children: [...], version: 1, ... } }
// EditorState.toJSON() emits exactly this shape, so we can hand Payload our
// output verbatim and it'll round-trip through its own editor unchanged.
export type LexicalRichTextValue = ReturnType<EditorState['toJSON']>

type LexicalRichTextEditorProps = {
  value: LexicalRichTextValue | null
  onChange: (value: LexicalRichTextValue) => void
  placeholder?: string
  minHeight?: number
}

const editorTheme = {
  paragraph: 'cw-rt__paragraph',
  heading: {
    h1: 'cw-rt__h1',
    h2: 'cw-rt__h2',
    h3: 'cw-rt__h3',
  },
  list: {
    ul: 'cw-rt__ul',
    ol: 'cw-rt__ol',
    listitem: 'cw-rt__li',
  },
  link: 'cw-rt__link',
  text: {
    bold: 'cw-rt__bold',
    italic: 'cw-rt__italic',
    underline: 'cw-rt__underline',
  },
}

function Toolbar() {
  const [editor] = useLexicalComposerContext()

  const wrap = (action: (selection: ReturnType<typeof $getSelection>) => void) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) action(selection)
    })
  }

  return (
    <div className="cw-rt__toolbar">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }}
        title="Bold (Ctrl+B)"
        className="cw-rt__btn"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }}
        title="Italic (Ctrl+I)"
        className="cw-rt__btn"
      >
        <em>I</em>
      </button>
      <span className="cw-rt__sep" aria-hidden />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          wrap(() => $setBlocksType($getSelection(), () => $createHeadingNode('h2')))
        }}
        title="Heading"
        className="cw-rt__btn"
      >
        H
      </button>
      <span className="cw-rt__sep" aria-hidden />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }}
        title="Bullet list"
        className="cw-rt__btn"
      >
        •
      </button>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }}
        title="Numbered list"
        className="cw-rt__btn"
      >
        1.
      </button>
    </div>
  )
}

// Hydrate the editor when an external `value` change replaces the document
// (e.g. switching blocks). We avoid setting state when the change came from
// the editor itself by comparing against the last value we emitted.
function ExternalValuePlugin({
  value,
  lastEmittedRef,
}: {
  value: LexicalRichTextValue | null
  lastEmittedRef: React.MutableRefObject<string | null>
}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!value) return
    const serialized = JSON.stringify(value)
    if (serialized === lastEmittedRef.current) return
    try {
      const newState = editor.parseEditorState(serialized)
      editor.setEditorState(newState)
    } catch {
      // Bad state JSON — leave the editor as-is rather than crash.
    }
  }, [editor, value, lastEmittedRef])
  return null
}

export default function LexicalRichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing…',
  minHeight = 120,
}: LexicalRichTextEditorProps) {
  const lastEmittedRef = useRef<string | null>(value ? JSON.stringify(value) : null)

  const handleChange = useCallback(
    (state: EditorState) => {
      // Skip the empty initial state; Payload accepts null/undefined for
      // optional richText fields.
      const json = state.toJSON()
      lastEmittedRef.current = JSON.stringify(json)
      onChange(json)
    },
    [onChange],
  )

  const initialConfig = {
    namespace: 'lesson-scaffold-richtext',
    editorState: value ? JSON.stringify(value) : null,
    theme: editorTheme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => {
      // Surface in dev; silent in prod.
      if (process.env.NODE_ENV !== 'production') console.warn('Lexical error', error)
    },
  }

  return (
    <div className="cw-rt" style={{ minHeight }}>
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="cw-rt__surface" style={{ minHeight: minHeight - 36 }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="cw-rt__editable"
                aria-placeholder={placeholder}
                placeholder={
                  // Visual-only fallback. aria-placeholder above carries the
                  // accessible version, so hide this from screen readers.
                  <div className="cw-rt__placeholder" aria-hidden="true">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        <ExternalValuePlugin value={value} lastEmittedRef={lastEmittedRef} />
      </LexicalComposer>
    </div>
  )
}
