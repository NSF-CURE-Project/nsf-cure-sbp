import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const cookiePrefix = process.env.PAYLOAD_COOKIE_PREFIX ?? 'payload'
const tokenName = `${cookiePrefix}-token`
const legacyTokenName = 'payload-token'

const clearCookie = (res: NextResponse, name: string) => {
  res.cookies.set({
    name,
    value: '',
    maxAge: 0,
    path: '/',
  })
}

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url))
  clearCookie(res, tokenName)
  if (tokenName !== legacyTokenName) {
    clearCookie(res, legacyTokenName)
  }
  return res
}
