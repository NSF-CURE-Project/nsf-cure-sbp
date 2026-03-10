const getWebBaseUrl = () =>
  process.env.WEB_PUBLIC_URL ?? process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'

const getSupportEmail = () => process.env.SUPPORT_EMAIL ?? 'sbp-support@cpp.edu'

const buildSupportLine = () =>
  `If you need help, contact support at ${getSupportEmail()}.`

export const buildResetPasswordUrl = (token: string) =>
  `${getWebBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`

export const buildAuthEmail = ({
  heading,
  actionLabel,
  actionUrl,
  expiresIn = '24 hours',
  intro,
  securityNote,
}: {
  heading: string
  actionLabel: string
  actionUrl: string
  expiresIn?: string
  intro: string
  securityNote?: string
}) => {
  const securityText = securityNote ? `${securityNote}\n\n` : ''
  const supportLine = buildSupportLine()

  const text = `${intro}\n\n${actionLabel}: ${actionUrl}\n\nThis link expires in ${expiresIn}.\n\n${securityText}${supportLine}`

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin-bottom:8px">${heading}</h2>
      <p>${intro}</p>
      <p>
        <a href="${actionUrl}" style="display:inline-block;background:#111827;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none">${actionLabel}</a>
      </p>
      <p style="font-size:13px;color:#4b5563">If the button does not work, copy and paste this URL into your browser:</p>
      <p style="font-size:13px;word-break:break-all">${actionUrl}</p>
      <p style="font-size:13px;color:#4b5563">This link expires in ${expiresIn}.</p>
      ${securityNote ? `<p style="font-size:13px;color:#4b5563">${securityNote}</p>` : ''}
      <p style="font-size:13px;color:#4b5563">${supportLine}</p>
    </div>
  `

  return { text, html }
}
