'use client'

import React, { useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

const maskApiKey = (value: string) => {
  if (value.length <= 4) return value
  return `${'•'.repeat(Math.max(8, value.length - 4))}${value.slice(-4)}`
}

export default function ApiKeyDisplay() {
  const { value: idValue } = useField<string | number | null>({ path: 'id' })
  const { value: keyValue } = useField<string | null>({ path: 'key' })
  const [copied, setCopied] = useState(false)

  const isNewDoc = !idValue
  const apiKey = typeof keyValue === 'string' ? keyValue : ''
  const displayValue = useMemo(() => {
    if (!apiKey) return ''
    return isNewDoc ? apiKey : maskApiKey(apiKey)
  }, [apiKey, isNewDoc])

  const handleCopy = async () => {
    if (!apiKey) return
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  if (!displayValue) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginBottom: 6 }}>
        {isNewDoc
          ? 'Copy and store this API key securely. It will be masked after this creation flow.'
          : 'API key is masked after creation.'}
      </div>
      <div
        style={{
          fontSize: 12,
          fontFamily: 'monospace',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
          wordBreak: 'break-all',
        }}
      >
        {displayValue}
      </div>
      <button
        type="button"
        className="btn btn--style-secondary"
        style={{ marginTop: 8 }}
        onClick={() => void handleCopy()}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
