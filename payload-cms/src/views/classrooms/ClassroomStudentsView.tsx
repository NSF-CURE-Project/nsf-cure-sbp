'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

export type ClassroomStudentRow = {
  membershipId: string
  studentId: string | null
  studentName: string
  studentEmail: string | null
  joinedAt: string | null
  completedLessons: number
  totalLessons: number
  completionRate: number
  lastActivityAt: string | null
}

type SortKey = 'name' | 'joined' | 'completion' | 'activity'
type SortDir = 'asc' | 'desc'

const styles = `
  .csv-shell { display: grid; gap: 12px; padding: 8px 0 0; }
  .csv-topbar { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: flex-end; }
  .csv-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12px; color: var(--cpp-muted); }
  .csv-breadcrumb a { color: #1553cf; text-decoration: none; font-weight: 700; }
  .csv-breadcrumb a:hover { text-decoration: underline; }
  .csv-title { margin: 4px 0 0; font-size: 24px; line-height: 1.15; color: var(--cpp-ink); letter-spacing: -0.01em; }
  .csv-subtitle { margin: 4px 0 0; font-size: 12.5px; color: var(--cpp-muted); }
  .csv-actions { display: flex; gap: 8px; }
  .csv-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; padding: 7px 12px; border-radius: 8px; border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg); color: var(--cpp-ink); cursor: pointer; text-decoration: none; }
  .csv-btn:hover { border-color: rgba(21,83,207,0.40); color: #1553cf; }
  .csv-stats { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
  .csv-stat { border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg); border-radius: 10px; padding: 10px 12px; }
  .csv-stat__eyebrow { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.7px; color: var(--cpp-muted); font-weight: 800; }
  .csv-stat__value { font-size: 22px; font-weight: 900; color: var(--cpp-ink); margin-top: 4px; letter-spacing: -0.01em; }
  .csv-stat__detail { font-size: 11.5px; color: var(--cpp-muted); margin-top: 2px; }
  .csv-toolbar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between; align-items: center; }
  .csv-search { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg); border-radius: 8px; min-width: 240px; flex: 1 1 240px; }
  .csv-search input { border: none; outline: none; background: transparent; flex: 1; font-size: 12.5px; color: var(--cpp-ink); }
  .csv-count { font-size: 11.5px; color: var(--cpp-muted); font-weight: 700; }
  .csv-table-wrap { border: 1px solid var(--admin-surface-border); background: var(--admin-panel-bg); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 0 rgba(18, 65, 147, 0.06); }
  table.csv-table { width: 100%; border-collapse: collapse; }
  table.csv-table thead th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.7px; color: var(--cpp-muted); padding: 12px 14px; background: var(--admin-panel-bg-muted); border-bottom: 1px solid var(--admin-surface-border); user-select: none; }
  table.csv-table thead th button { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 800; }
  table.csv-table thead th button:hover { color: #1553cf; }
  table.csv-table tbody tr { border-top: 1px solid rgba(18, 65, 147, 0.06); cursor: pointer; transition: background 100ms ease; }
  table.csv-table tbody tr:hover { background: rgba(21, 83, 207, 0.04); }
  table.csv-table td { padding: 12px 14px; vertical-align: middle; font-size: 12.5px; color: var(--cpp-ink); }
  .csv-student { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .csv-student__name { font-weight: 800; color: var(--cpp-ink); }
  .csv-student__email { font-size: 11.5px; color: var(--cpp-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px; }
  .csv-progress { display: flex; align-items: center; gap: 8px; min-width: 160px; }
  .csv-progress__track { flex: 1; height: 6px; border-radius: 999px; background: rgba(21,83,207,0.10); overflow: hidden; }
  .csv-progress__fill { height: 100%; background: #1553cf; border-radius: 999px; }
  .csv-progress__label { font-size: 11.5px; color: var(--cpp-muted); font-weight: 700; white-space: nowrap; }
  .csv-empty { padding: 28px 16px; text-align: center; }
  .csv-empty__title { font-size: 14px; font-weight: 800; color: var(--cpp-ink); }
  .csv-empty__hint { font-size: 12.5px; color: var(--cpp-muted); margin-top: 4px; }
  .csv-remove { all: unset; cursor: pointer; font-size: 11.5px; font-weight: 700; color: #b91c1c; padding: 4px 8px; border: 1px solid rgba(220,38,38,0.20); background: rgba(239,68,68,0.06); border-radius: 999px; }
  .csv-remove:hover { background: rgba(239,68,68,0.12); }
  .csv-remove:disabled { opacity: 0.5; cursor: progress; }
  .csv-cell-actions { text-align: right; }
`

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

const formatRelative = (value: string | null) => {
  if (!value) return 'No activity yet'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No activity yet'
  const diffMs = Date.now() - parsed.getTime()
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  if (days === 0) return 'Active today'
  if (days === 1) return 'Active yesterday'
  if (days < 7) return `Active ${days}d ago`
  if (days < 30) return `Active ${Math.floor(days / 7)}w ago`
  return `Inactive ${Math.floor(days / 30)}mo`
}

const formatPercent = (rate: number) => {
  if (!Number.isFinite(rate)) return '—'
  const percent = rate <= 1 ? rate * 100 : rate
  return `${Math.round(percent)}%`
}

const SortArrow = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span aria-hidden style={{ fontSize: 10, opacity: active ? 1 : 0.35 }}>
    {dir === 'asc' ? '▲' : '▼'}
  </span>
)

type Props = {
  classroomId: string
  classroomTitle: string
  courseTitle: string | null
  active: boolean
  rows: ClassroomStudentRow[]
}

export default function ClassroomStudentsView({
  classroomId,
  classroomTitle,
  courseTitle,
  active,
  rows: initialRows,
}: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('joined')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const matching = term
      ? rows.filter(
          (row) =>
            row.studentName.toLowerCase().includes(term) ||
            (row.studentEmail?.toLowerCase().includes(term) ?? false),
        )
      : rows

    const sorted = [...matching].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = a.studentName.localeCompare(b.studentName)
      } else if (sortKey === 'joined') {
        const aMs = a.joinedAt ? new Date(a.joinedAt).getTime() : 0
        const bMs = b.joinedAt ? new Date(b.joinedAt).getTime() : 0
        cmp = aMs - bMs
      } else if (sortKey === 'completion') {
        cmp = a.completionRate - b.completionRate
      } else if (sortKey === 'activity') {
        const aMs = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
        const bMs = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
        cmp = aMs - bMs
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [rows, search, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const lastJoined = useMemo(() => {
    let latest: string | null = null
    for (const row of rows) {
      if (!row.joinedAt) continue
      if (!latest || new Date(row.joinedAt).getTime() > new Date(latest).getTime()) {
        latest = row.joinedAt
      }
    }
    return latest
  }, [rows])

  const averageCompletion = useMemo(() => {
    if (!rows.length) return null
    const sum = rows.reduce((acc, row) => acc + (row.completionRate ?? 0), 0)
    return sum / rows.length
  }, [rows])

  const activeStudents = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return rows.filter((row) => {
      if (!row.lastActivityAt) return false
      return new Date(row.lastActivityAt).getTime() >= cutoff
    }).length
  }, [rows])

  const studentPath = (studentId: string | null) =>
    studentId ? `/admin/student-performance/${studentId}` : null

  const goToStudent = (studentId: string | null) => {
    const path = studentPath(studentId)
    if (path) router.push(path)
  }

  const handleRemove = async (membershipId: string, studentName: string) => {
    if (typeof window !== 'undefined') {
      const ok = window.confirm(
        `Remove ${studentName} from ${classroomTitle}? They can rejoin with the active join code.`,
      )
      if (!ok) return
    }
    setError(null)
    setRemovingId(membershipId)
    try {
      const response = await fetch(`/api/classroom-memberships/${membershipId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { errors?: { message?: string }[] } | null
        const message = body?.errors?.[0]?.message ?? 'Unable to remove this student.'
        throw new Error(message)
      }
      setRows((prev) => prev.filter((row) => row.membershipId !== membershipId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove this student.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="csv-shell">
      <style>{styles}</style>

      <div className="csv-topbar">
        <div>
          <div className="csv-breadcrumb">
            <Link href="/admin/classrooms">Classrooms</Link>
            <span aria-hidden>›</span>
            <Link href={`/admin/classrooms/${classroomId}`}>{classroomTitle}</Link>
            <span aria-hidden>›</span>
            <span>Students</span>
          </div>
          <h1 className="csv-title">Manage students</h1>
          <p className="csv-subtitle">
            {courseTitle ? `${courseTitle} · ` : ''}
            {active ? 'Active classroom' : 'Archived classroom'} · Roster auto-updates as learners join.
          </p>
        </div>
        <div className="csv-actions">
          <Link href={`/admin/classrooms/${classroomId}`} className="csv-btn">
            ← Back to classroom
          </Link>
        </div>
      </div>

      <div className="csv-stats">
        <div className="csv-stat">
          <div className="csv-stat__eyebrow">Enrolled</div>
          <div className="csv-stat__value">{rows.length}</div>
          <div className="csv-stat__detail">{activeStudents} active in last 30 days</div>
        </div>
        <div className="csv-stat">
          <div className="csv-stat__eyebrow">Avg completion</div>
          <div className="csv-stat__value">
            {averageCompletion == null ? '—' : formatPercent(averageCompletion)}
          </div>
          <div className="csv-stat__detail">Across lessons started by enrolled students.</div>
        </div>
        <div className="csv-stat">
          <div className="csv-stat__eyebrow">Last joined</div>
          <div className="csv-stat__value" style={{ fontSize: 16 }}>{formatDate(lastJoined)}</div>
          <div className="csv-stat__detail">Most recent enrollment via join code.</div>
        </div>
      </div>

      <div className="csv-toolbar">
        <label className="csv-search">
          <span aria-hidden style={{ fontSize: 13, color: 'var(--cpp-muted)' }}>⌕</span>
          <input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="csv-count">
          {filtered.length} of {rows.length} student{rows.length === 1 ? '' : 's'}
        </span>
      </div>

      {error ? (
        <div
          style={{
            border: '1px solid rgba(220,38,38,0.28)',
            background: 'rgba(239,68,68,0.08)',
            color: '#b91c1c',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="csv-table-wrap">
        {rows.length === 0 ? (
          <div className="csv-empty">
            <div className="csv-empty__title">No students enrolled yet</div>
            <div className="csv-empty__hint">
              Share the join code from the classroom page — students will appear here as they join.
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="csv-empty">
            <div className="csv-empty__title">No students match “{search.trim()}”</div>
            <div className="csv-empty__hint">Clear the search to see the full roster.</div>
          </div>
        ) : (
          <table className="csv-table">
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => toggleSort('name')}>
                    Student <SortArrow active={sortKey === 'name'} dir={sortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort('joined')}>
                    Joined <SortArrow active={sortKey === 'joined'} dir={sortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort('completion')}>
                    Completion <SortArrow active={sortKey === 'completion'} dir={sortDir} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => toggleSort('activity')}>
                    Last activity <SortArrow active={sortKey === 'activity'} dir={sortDir} />
                  </button>
                </th>
                <th className="csv-cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const completionPercent = Math.max(
                  0,
                  Math.min(
                    100,
                    row.completionRate <= 1 ? row.completionRate * 100 : row.completionRate,
                  ),
                )
                const navigable = Boolean(row.studentId)
                return (
                  <tr
                    key={row.membershipId}
                    role={navigable ? 'link' : undefined}
                    aria-label={navigable ? `View ${row.studentName} analytics` : undefined}
                    onClick={() => goToStudent(row.studentId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        goToStudent(row.studentId)
                      }
                    }}
                    tabIndex={navigable ? 0 : -1}
                    style={navigable ? undefined : { cursor: 'default' }}
                  >
                    <td>
                      <div className="csv-student">
                        <span className="csv-student__name">{row.studentName}</span>
                        <span className="csv-student__email">
                          {row.studentEmail ?? 'No email on file'}
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(row.joinedAt)}</td>
                    <td>
                      <div className="csv-progress">
                        <div className="csv-progress__track">
                          <div
                            className="csv-progress__fill"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                        <span className="csv-progress__label">
                          {Math.round(completionPercent)}% · {row.completedLessons}/{row.totalLessons}
                        </span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div>{formatRelative(row.lastActivityAt)}</div>
                      <div style={{ fontSize: 11, color: 'var(--cpp-muted)' }}>
                        {formatDate(row.lastActivityAt)}
                      </div>
                    </td>
                    <td className="csv-cell-actions" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="csv-remove"
                        onClick={() => handleRemove(row.membershipId, row.studentName)}
                        disabled={removingId === row.membershipId}
                      >
                        {removingId === row.membershipId ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
