import type { PayloadRequest } from 'payload'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const logoutAllSessionsHandler = async (req: PayloadRequest) => {
  if (req.user?.collection !== 'accounts') {
    return jsonResponse({ message: 'Not authorized.' }, 403)
  }

  await req.payload.update({
    collection: 'accounts',
    id: req.user.id,
    data: {
      sessions: [],
    },
    overrideAccess: true,
  })

  return jsonResponse({ message: 'All sessions logged out.' }, 200)
}
