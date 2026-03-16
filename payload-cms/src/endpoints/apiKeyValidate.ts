import type { PayloadHandler } from 'payload'

import { authenticateApiKey } from '../middleware/apiKeyAuth'

export const apiKeyValidateHandler: PayloadHandler = async (req) => {
  const auth = await authenticateApiKey(req)
  if (!auth) {
    return Response.json({ valid: false }, { status: 401 })
  }

  return Response.json({
    valid: true,
    scopes: auth.scopes,
    owner: {
      name: auth.owner.name,
      email: auth.owner.email,
    },
  })
}
