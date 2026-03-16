const getWebBaseUrl = () =>
  process.env.WEB_PUBLIC_URL ?? process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'

const getSupportEmail = () => process.env.SUPPORT_EMAIL ?? 'sbp-support@cpp.edu'

const buildSupportLine = () =>
  `If you need help, contact support at ${getSupportEmail()}.`

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const truncateForPreheader = (value: string, maxLength = 90) => {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`
}

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
  const supportEmail = getSupportEmail()

  const text = `${intro}\n\n${actionLabel}: ${actionUrl}\n\nThis link expires in ${expiresIn}.\n\n${securityText}${supportLine}`

  const safeHeading = escapeHtml(heading)
  const safeIntro = escapeHtml(intro)
  const safeActionLabel = escapeHtml(actionLabel)
  const safeActionUrl = escapeHtml(actionUrl)
  const safeExpiresIn = escapeHtml(expiresIn)
  const safeSecurityNote = securityNote ? escapeHtml(securityNote) : ''
  const safeSupportLine = escapeHtml(supportLine)
  const safeSupportEmail = escapeHtml(supportEmail)
  const safePreheader = escapeHtml(truncateForPreheader(intro))

  const html = `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f4f5f7;">
    <span style="font-size:1px;color:#ffffff;max-height:0;overflow:hidden;mso-hide:all;display:none;line-height:1px;opacity:0;">${safePreheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f5f7" style="background-color:#f4f5f7;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
            <tr>
              <td bgcolor="#0f172a" style="background-color:#0f172a;padding:16px 20px;border-radius:8px 8px 0 0;">
                <div style="font-family:Arial,sans-serif;font-size:20px;line-height:1.2;font-weight:700;color:#ffffff;">NSF CURE SBP</div>
                <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.4;color:#cbd5e1;margin-top:4px;">Summer Bridge Program</div>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background-color:#ffffff;padding:16px;border-radius:0 0 8px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:22px;line-height:1.35;font-weight:700;color:#111827;margin:0;padding:0 0 12px 0;">${safeHeading}</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#374151;padding:0 0 16px 0;">${safeIntro}</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 0 16px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeActionUrl}" style="height:44px;v-text-anchor:middle;width:260px;" arcsize="10%" stroke="f" fillcolor="#0f172a">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;">${safeActionLabel}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a href="${safeActionUrl}" style="display:block;width:100%;max-width:320px;background-color:#0f172a;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:700;line-height:1.2;padding:12px 24px;border-radius:6px;text-align:center;margin:0 auto;">${safeActionLabel}</a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;padding:0 0 4px 0;">If the button does not work, copy and paste this URL into your browser:</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;word-break:break-all;padding:0 0 16px 0;">${safeActionUrl}</td>
                  </tr>
                  <tr>
                    <td bgcolor="#fffbeb" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 12px;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#92400e;">This link expires in ${safeExpiresIn}.</td>
                  </tr>
                  ${safeSecurityNote ? `<tr><td style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b7280;padding:14px 0 0 0;">${safeSecurityNote}</td></tr>` : ''}
                  <tr>
                    <td bgcolor="#f8fafc" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 12px 0 12px;font-family:Arial,sans-serif;">
                      <div style="font-size:13px;line-height:1.5;color:#6b7280;">${safeSupportLine.replace(safeSupportEmail, `<a href="mailto:${safeSupportEmail}" style="color:#334155;text-decoration:underline;">${safeSupportEmail}</a>`)}</div>
                      <div style="font-size:12px;line-height:1.5;color:#94a3b8;margin-top:6px;">Supported by NSF Award #2318158 · Cal Poly Pomona</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `

  return { text, html }
}
