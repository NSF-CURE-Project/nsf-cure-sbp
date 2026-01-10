import crypto from 'crypto'
import type { Payload } from 'payload'

const DEFAULT_LENGTH = 6
const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const generateJoinCode = (length = DEFAULT_LENGTH) => {
  let value = ''
  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, JOIN_CODE_ALPHABET.length)
    value += JOIN_CODE_ALPHABET[index]
  }
  return value
}

type FindablePayload = Payload

export const generateUniqueJoinCode = async (
  payload: FindablePayload,
  length = DEFAULT_LENGTH,
) => {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const code = generateJoinCode(length)
    const existing = await payload.find({
      collection: 'classrooms',
      limit: 1,
      depth: 0,
      where: {
        joinCode: {
          equals: code,
        },
      },
    })
    if (!existing?.docs?.length) {
      return code
    }
  }

  throw new Error('Unable to generate a unique join code.')
}
