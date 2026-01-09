import type { PayloadRequest } from 'payload'

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const accountsMeHandler = async (req: PayloadRequest) => {
  const user = req.user
  if (!user || user.collection !== 'accounts') {
    return jsonResponse({ message: 'Unauthorized' }, 401)
  }

  return jsonResponse(
    {
      user,
      collection: 'accounts',
    },
    200,
  )
}
