'use client'

import React, { useMemo, useState } from 'react'
import { useField } from '@payloadcms/ui'

const API_PATH = '/api/classrooms/regenerate-code'

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export default function ClassroomJoinCodeField() {
  const { value: idValue } = useField<string | number | null>({ path: 'id' })
  const { value: joinCode, setValue: setJoinCode } = useField<string>({ path: 'joinCode' })
  const { value: joinCodeLength } = useField<number>({ path: 'joinCodeLength' })
  const { value: joinCodeDurationHours } = useField<number>({ path: 'joinCodeDurationHours' })
  const { value: joinCodeExpiresAt, setValue: setJoinCodeExpiresAt } = useField<string>({
    path: 'joinCodeExpiresAt',
  })
  const { setValue: setJoinCodeLastRotatedAt } = useField<string>({
    path: 'joinCodeLastRotatedAt',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState('')

  const canRegenerate = Boolean(idValue)
  const lengthValue = useMemo(() => toNumber(joinCodeLength, 6), [joinCodeLength])
  const durationValue = useMemo(
    () => toNumber(joinCodeDurationHours, 168),
    [joinCodeDurationHours],
  )

  const onRegenerate = async () => {
    if (!canRegenerate) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch(API_PATH, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId: idValue,
          length: lengthValue,
          durationHours: durationValue,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message ?? 'Unable to regenerate join code.')
      }

      const data = (await res.json()) as {
        joinCode?: string
        classroom?: { joinCodeExpiresAt?: string; joinCodeLastRotatedAt?: string }
      }

      if (data.joinCode) {
        setJoinCode(data.joinCode)
      }
      if (data.classroom?.joinCodeExpiresAt) {
        setJoinCodeExpiresAt(data.classroom.joinCodeExpiresAt)
      }
      if (data.classroom?.joinCodeLastRotatedAt) {
        setJoinCodeLastRotatedAt(data.classroom.joinCodeLastRotatedAt)
      }

      setStatus('success')
      setMessage('Join code regenerated.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to regenerate join code.')
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: 'var(--cpp-muted)', marginBottom: 6 }}>
        Regenerate join code using the current length and duration settings.
      </div>
      <button
        type="button"
        onClick={onRegenerate}
        disabled={!canRegenerate || status === 'loading'}
        className="btn btn--style-secondary"
      >
        {status === 'loading' ? 'Regenerating…' : 'Regenerate join code'}
      </button>
      {joinCode ? (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--cpp-muted)' }}>
          Current code: <strong style={{ color: 'var(--cpp-ink)' }}>{joinCode}</strong>
          {joinCodeExpiresAt ? (
            <span>
              {' '}
              · Expires{' '}
              <strong style={{ color: 'var(--cpp-ink)' }}>
                {new Date(joinCodeExpiresAt).toLocaleString()}
              </strong>
            </span>
          ) : null}
        </div>
      ) : null}
      {message ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: status === 'error' ? '#dc2626' : 'var(--cpp-muted)',
          }}
        >
          {message}
        </div>
      ) : null}
    </div>
  )
}
