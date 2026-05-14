'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  createClientFeature,
  toolbarFeatureButtonsGroupWithItems,
} from '@payloadcms/richtext-lexical/client'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  TextNode,
} from '@payloadcms/richtext-lexical/lexical'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { MathNode, $createMathNode } from './MathNode'
import MathPromptDialog from './MathPromptDialog'

// Module-level bridge between the imperative toolbar callback (outside any
// React tree) and the modal host mounted by MathPlugin. The host registers a
// concrete opener on mount; `openMathPrompt` awaits the next resolution.
type MathPromptOpener = (defaultValue: string) => Promise<string | null>
let registeredOpener: MathPromptOpener | null = null

const registerMathPromptOpener = (fn: MathPromptOpener | null) => {
  registeredOpener = fn
}

const openMathPrompt = async (defaultValue: string): Promise<string | null> => {
  if (registeredOpener) return registeredOpener(defaultValue)
  // MathPlugin should always be mounted alongside the toolbar — if for some
  // reason the host hasn't registered yet, silently skip rather than
  // falling back to a native browser prompt. The user can retry once the
  // editor finishes hydrating.
  return null
}

const DOLLAR_PLACEHOLDER = '__DOLLAR__PLACEHOLDER__'
const MATH_REGEX = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g

const splitMathTokens = (value: string) => {
  const safeValue = value.replace(/\\\$/g, DOLLAR_PLACEHOLDER)
  const tokens: Array<{ type: 'text' | 'math'; value: string; display?: boolean }> = []
  let lastIndex = 0

  for (const match of safeValue.matchAll(MATH_REGEX)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      tokens.push({ type: 'text', value: safeValue.slice(lastIndex, index) })
    }
    const displayValue = match[1]
    const inlineValue = match[2]
    tokens.push({
      type: 'math',
      value: (displayValue ?? inlineValue ?? '').trim(),
      display: Boolean(displayValue),
    })
    lastIndex = index + match[0].length
  }

  if (lastIndex < safeValue.length) {
    tokens.push({ type: 'text', value: safeValue.slice(lastIndex) })
  }

  return tokens.map((token) => ({
    ...token,
    value: token.value.replaceAll(DOLLAR_PLACEHOLDER, '$'),
  }))
}

const cloneTextNode = (node: TextNode, text: string) => {
  const next = $createTextNode(text)
  next.setFormat(node.getFormat())
  next.setStyle(node.getStyle())
  next.setDetail(node.getDetail())
  return next
}

const replaceWithNodes = (
  node: TextNode,
  nodes: Array<TextNode | ReturnType<typeof $createMathNode>>,
) => {
  if (!nodes.length) return
  nodes.forEach((nextNode, index) => {
    if (index === 0) {
      node.replace(nextNode)
    } else {
      nodes[index - 1].insertAfter(nextNode)
    }
  })
}

const MathPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const [promptState, setPromptState] = useState<{
    defaultValue: string
    resolve: (value: string | null) => void
  } | null>(null)

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      if (!node.isSimpleText()) return
      if (!node.getTextContent().includes('$')) return
      if (node.hasFormat('code')) return

      const parent = node.getParent()
      if (!parent || parent.getType() === 'code') return

      const tokens = splitMathTokens(node.getTextContent())
      if (!tokens.some((token) => token.type === 'math')) return

      const nextNodes: Array<TextNode | ReturnType<typeof $createMathNode>> = []
      for (const token of tokens) {
        if (!token.value) continue
        if (token.type === 'math') {
          nextNodes.push($createMathNode(token.value, Boolean(token.display)))
          continue
        }
        nextNodes.push(cloneTextNode(node, token.value))
      }

      replaceWithNodes(node, nextNodes)
    })
  }, [editor])

  // Register/unregister the opener so the toolbar action can await this
  // host's modal instead of falling back to window.prompt.
  const opener = useCallback<MathPromptOpener>(
    (defaultValue) =>
      new Promise<string | null>((resolve) => {
        setPromptState({ defaultValue, resolve })
      }),
    [],
  )
  useEffect(() => {
    registerMathPromptOpener(opener)
    return () => registerMathPromptOpener(null)
  }, [opener])

  const handleSubmit = (latex: string) => {
    promptState?.resolve(latex)
    setPromptState(null)
  }
  const handleCancel = () => {
    promptState?.resolve(null)
    setPromptState(null)
  }

  return (
    <MathPromptDialog
      open={promptState !== null}
      defaultValue={promptState?.defaultValue ?? ''}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

const MathIcon = () => <span style={{ fontWeight: 700, fontSize: 12 }}>Math</span>

const insertMathFromPrompt = async (editor: {
  update: (cb: () => void) => void
  getEditorState: () => { read: (cb: () => void) => void }
}) => {
  let selectionText = ''
  editor.getEditorState().read(() => {
    const selection = $getSelection()
    selectionText = $isRangeSelection(selection) ? selection.getTextContent() : ''
  })
  const rawInput = await openMathPrompt(selectionText)
  if (!rawInput) return

  let latex = rawInput.trim()
  let displayMode = false

  if (latex.startsWith('$$') && latex.endsWith('$$')) {
    displayMode = true
    latex = latex.slice(2, -2).trim()
  } else if (latex.startsWith('$') && latex.endsWith('$')) {
    latex = latex.slice(1, -1).trim()
  }

  if (!latex) return

  editor.update(() => {
    const currentSelection = $getSelection()
    if (!$isRangeSelection(currentSelection)) return
    currentSelection.insertNodes([$createMathNode(latex, displayMode)])
  })
}

export const MathFeatureClient = createClientFeature({
  nodes: [MathNode],
  plugins: [
    {
      Component: MathPlugin,
      position: 'normal',
    },
  ],
  toolbarFixed: {
    groups: [
      toolbarFeatureButtonsGroupWithItems([
        {
          ChildComponent: MathIcon,
          key: 'math',
          label: 'Math',
          onSelect: ({ editor }) => {
            void insertMathFromPrompt(editor)
          },
        },
      ]),
    ],
  },
  toolbarInline: {
    groups: [
      toolbarFeatureButtonsGroupWithItems([
        {
          ChildComponent: MathIcon,
          key: 'math',
          label: 'Math',
          onSelect: ({ editor }) => {
            void insertMathFromPrompt(editor)
          },
        },
      ]),
    ],
  },
})
