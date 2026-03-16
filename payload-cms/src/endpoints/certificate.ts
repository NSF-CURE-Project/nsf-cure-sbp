import type { PayloadHandler } from 'payload'

const jsonError = (error: string, status: number) =>
  Response.json(
    {
      error,
    },
    { status },
  )

const resolveClassroomId = (req: Parameters<PayloadHandler>[0]): string => {
  const routeParams = (req as { routeParams?: Record<string, unknown> }).routeParams
  const direct = routeParams?.classroomId
  if (typeof direct === 'string' || typeof direct === 'number') return String(direct)

  const rawUrl = typeof req.url === 'string' ? req.url : ''
  if (!rawUrl) return ''

  try {
    const pathname = new URL(rawUrl, 'http://localhost').pathname
    const match = pathname.match(/\/classrooms\/([^/]+)\/certificate$/)
    return match?.[1] ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

const formatIssueDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)

const getId = (value: unknown): string => {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | number }).id
    return id != null ? String(id) : ''
  }
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

export const certificateHandler: PayloadHandler = async (req) => {
  if (req.user?.collection !== 'accounts') {
    return jsonError('Unauthorized', 401)
  }

  const classroomId = resolveClassroomId(req)
  if (!classroomId) return jsonError('Invalid classroom id', 400)

  const membershipForClassroom = await req.payload.find({
    collection: 'classroom-memberships',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      classroom: { equals: classroomId },
    },
  })
  if ((membershipForClassroom.docs ?? []).length === 0) {
    return jsonError('Enrollment not found', 404)
  }

  const membershipResult = await req.payload.find({
    collection: 'classroom-memberships',
    depth: 2,
    limit: 1,
    overrideAccess: true,
    where: {
      classroom: { equals: classroomId },
      student: { equals: req.user.id },
    },
  })
  const membership = membershipResult.docs?.[0] as
    | {
        completionRate?: number | null
        classroom?: { class?: { title?: string } | string | number } | string | number
      }
    | undefined
  if (!membership) return jsonError('Forbidden', 403)

  const completionRate = membership.completionRate ?? 0
  if (completionRate < 1) return jsonError('Class not yet complete', 403)

  const account = await req.payload.findByID({
    collection: 'accounts',
    id: req.user.id,
    depth: 0,
    overrideAccess: true,
  })
  const fullName =
    typeof (account as { fullName?: unknown }).fullName === 'string'
      ? ((account as { fullName?: string }).fullName ?? '').trim()
      : ''

  let classTitle = 'Class'
  const classroomValue = membership.classroom
  if (typeof classroomValue === 'object' && classroomValue !== null && 'class' in classroomValue) {
    const classValue = (classroomValue as { class?: unknown }).class
    if (typeof classValue === 'object' && classValue !== null && 'title' in classValue) {
      classTitle = (classValue as { title?: string }).title ?? classTitle
    } else {
      const classId = getId(classValue)
      if (classId) {
        const classDoc = await req.payload.findByID({
          collection: 'classes',
          id: classId,
          depth: 0,
          overrideAccess: true,
        })
        if (typeof (classDoc as { title?: unknown }).title === 'string') {
          classTitle = (classDoc as { title?: string }).title ?? classTitle
        }
      }
    }
  }

  const [{ renderToBuffer }, { CertificateDocument }, React] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../utils/CertificateDocument'),
    import('react'),
  ])

  const certificate = React.createElement(CertificateDocument, {
      fullName: fullName || 'Student',
      className: classTitle,
      issueDate: formatIssueDate(new Date()),
    }) as never

  const pdf = await renderToBuffer(certificate)

  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="certificate.pdf"',
      'Cache-Control': 'private, no-store, max-age=0',
    },
  })
}
