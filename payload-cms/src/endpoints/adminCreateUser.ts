import type { PayloadHandler, PayloadRequest } from 'payload'

type CreateUserBody = {
  email?: unknown
  password?: unknown
  firstName?: unknown
  lastName?: unknown
  role?: unknown
}

const ALLOWED_ROLES = new Set(['admin', 'staff', 'professor'])

const jsonError = (error: string, status: number) =>
  Response.json(
    {
      error,
    },
    { status },
  )

const isAdminUser = (req: PayloadRequest) =>
  req.user?.collection === 'users' && req.user?.role === 'admin'

const getBody = (req: PayloadRequest): CreateUserBody =>
  req.body && typeof req.body === 'object' ? (req.body as CreateUserBody) : {}

const normalizeRequiredString = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

const normalizeRole = (value: unknown): 'admin' | 'staff' | 'professor' => {
  if (typeof value !== 'string') return 'staff'
  const role = value.trim()
  return role === 'admin' || role === 'professor' || role === 'staff' ? role : 'staff'
}

export const adminCreateUserHandler: PayloadHandler = async (req) => {
  if (!isAdminUser(req)) return jsonError('Forbidden', 403)

  const body = getBody(req)
  const email = normalizeRequiredString(body.email).toLowerCase()
  const password = normalizeRequiredString(body.password)
  const firstName = normalizeOptionalString(body.firstName)
  const lastName = normalizeOptionalString(body.lastName)
  const role = normalizeRole(body.role)

  if (!email) return jsonError('Email is required.', 400)
  if (!password) return jsonError('Password is required.', 400)
  if (password.length < 8) return jsonError('Password must be at least 8 characters.', 400)
  if (!ALLOWED_ROLES.has(role)) return jsonError('Invalid role.', 400)

  const existing = await req.payload.find({
    collection: 'users',
    where: {
      email: { equals: email },
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if ((existing.totalDocs ?? 0) > 0) {
    return jsonError('A user with that email already exists.', 409)
  }

  const created = await req.payload.create({
    collection: 'users',
    data: {
      email,
      password,
      firstName,
      lastName,
      role,
    },
    overrideAccess: true,
  })

  return Response.json(
    {
      user: {
        id: created.id,
        email: created.email,
        role: created.role,
        firstName: created.firstName ?? null,
        lastName: created.lastName ?? null,
      },
    },
    { status: 201 },
  )
}
