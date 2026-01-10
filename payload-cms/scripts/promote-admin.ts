import type { Payload } from 'payload'

const readArgValue = (flag: string, args: string[]) => {
  const index = args.indexOf(flag)
  if (index === -1) return null
  const value = args[index + 1]
  return value && !value.startsWith('-') ? value : null
}

const resolveEmail = () => {
  const args = process.argv.slice(2)
  const email =
    readArgValue('--email', args) ??
    readArgValue('-e', args) ??
    args.find((value) => value.includes('@')) ??
    null
  return email?.trim() || null
}

export default async function promoteAdmin(payload: Payload) {
  const email = resolveEmail()

  if (!email) {
    payload.logger.error('Provide an email via --email (e.g. --email aaokonkwo@cpp.edu).')
    return
  }

  const res = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })

  const user = res.docs[0] as { id?: string | number; role?: string } | undefined

  if (!user?.id) {
    payload.logger.error(`No admin user found with email "${email}".`)
    return
  }

  if (user.role === 'admin') {
    payload.logger.info(`User "${email}" is already an admin.`)
    return
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { role: 'admin' },
  })

  payload.logger.info(`Updated "${email}" to admin.`)
}
