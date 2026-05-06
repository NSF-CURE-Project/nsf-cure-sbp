import type { PayloadHandler } from 'payload'

const HEARTBEAT_INTERVAL_SEC = 60
const MIN_INTERVAL_SEC = 20
const MAX_INTERVAL_SEC = 120

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const accountsHeartbeatHandler: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const now = new Date()
  const account = await req.payload
    .findByID({
      collection: 'accounts',
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!account) return jsonResponse({ error: 'Account not found' }, 404)

  const previousActive = typeof (account as { totalActiveSeconds?: number }).totalActiveSeconds === 'number'
    ? (account as { totalActiveSeconds?: number }).totalActiveSeconds!
    : 0
  const previousSeen = (account as { lastSeenAt?: string | null }).lastSeenAt
  const previousSeenDate = previousSeen ? new Date(previousSeen) : null

  // Increment by the elapsed time since last heartbeat, clamped to a sane window.
  // This keeps the counter honest if the client misses a beat or fires too eagerly.
  let increment = HEARTBEAT_INTERVAL_SEC
  if (previousSeenDate && !Number.isNaN(previousSeenDate.getTime())) {
    const elapsedSec = Math.round((now.getTime() - previousSeenDate.getTime()) / 1000)
    if (elapsedSec >= MIN_INTERVAL_SEC && elapsedSec <= MAX_INTERVAL_SEC) {
      increment = elapsedSec
    } else if (elapsedSec < MIN_INTERVAL_SEC) {
      // Client is pinging too fast — don't double-count.
      return jsonResponse({
        ok: true,
        skipped: true,
        totalActiveSeconds: previousActive,
        lastSeenAt: previousSeen,
      })
    } else {
      // Long gap (tab was inactive, network hiccup, etc.) — only credit one interval.
      increment = HEARTBEAT_INTERVAL_SEC
    }
  }

  await req.payload.update({
    collection: 'accounts',
    id: req.user.id,
    data: {
      lastSeenAt: now.toISOString(),
      totalActiveSeconds: previousActive + increment,
    },
    overrideAccess: true,
  })

  return jsonResponse({
    ok: true,
    incrementedSec: increment,
    totalActiveSeconds: previousActive + increment,
    lastSeenAt: now.toISOString(),
  })
}
