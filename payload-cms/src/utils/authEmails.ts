const getWebBaseUrl = () =>
  process.env.WEB_PUBLIC_URL ?? process.env.WEB_PREVIEW_URL ?? 'http://localhost:3001'

const getServerBaseUrl = () =>
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  process.env.PAYLOAD_INTERNAL_URL ??
  process.env.PAYLOAD_PUBLIC_URL ??
  'http://localhost:3000'

const getSupportEmail = () => process.env.SUPPORT_EMAIL ?? 'sbp-support@cpp.edu'

const getBrandName = () => process.env.EMAIL_BRAND_NAME ?? 'NSF CURE SBP'
const getProgramName = () => process.env.EMAIL_PROGRAM_NAME ?? 'NSF CURE Summer Bridge Program'
const getAwardLabel = () => process.env.EMAIL_AWARD_LABEL ?? 'Supported by NSF Award #2318158'

const getLogoUrl = () =>
  process.env.EMAIL_LOGO_URL ??
  `${getServerBaseUrl().replace(/\/+$/, '')}/assets/logos/sbp_admin_logo.png`

const getFooterLinks = () => {
  const webBase = getWebBaseUrl().replace(/\/+$/, '')
  return {
    website: `${webBase}`,
    learning: `${webBase}/learning`,
    contact: `${webBase}/contact-us`,
  }
}

const buildSupportLine = () => `If you need help, contact support at ${getSupportEmail()}.`

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

type BrandedAuthEmailArgs = {
  heading: string
  actionLabel: string
  actionUrl: string
  expiresIn?: string
  intro: string
  securityNote?: string
}

export const buildAuthEmail = ({
  heading,
  actionLabel,
  actionUrl,
  expiresIn = '24 hours',
  intro,
  securityNote,
}: BrandedAuthEmailArgs) => {
  const supportLine = buildSupportLine()
  const supportEmail = getSupportEmail()
  const brandName = getBrandName()
  const programName = getProgramName()
  const awardLabel = getAwardLabel()
  const logoUrl = getLogoUrl()
  const links = getFooterLinks()
  const nowYear = String(new Date().getUTCFullYear())
  const securityText = securityNote ? `${securityNote}\n\n` : ''

  const text = `${brandName}\n${programName}\n\n${heading}\n\n${intro}\n\n${actionLabel}: ${actionUrl}\n\nThis link expires in ${expiresIn}.\n\n${securityText}${supportLine}\n\nWebsite: ${links.website}\nLearning portal: ${links.learning}\nContact: ${links.contact}\n\n${awardLabel}`

  const safeHeading = escapeHtml(heading)
  const safeIntro = escapeHtml(intro)
  const safeActionLabel = escapeHtml(actionLabel)
  const safeActionUrl = escapeHtml(actionUrl)
  const safeExpiresIn = escapeHtml(expiresIn)
  const safeSecurityNote = securityNote ? escapeHtml(securityNote) : ''
  const safeSupportLine = escapeHtml(supportLine)
  const safeSupportEmail = escapeHtml(supportEmail)
  const safePreheader = escapeHtml(truncateForPreheader(intro))
  const safeBrandName = escapeHtml(brandName)
  const safeProgramName = escapeHtml(programName)
  const safeAwardLabel = escapeHtml(awardLabel)
  const safeLogoUrl = escapeHtml(logoUrl)
  const safeWebsiteUrl = escapeHtml(links.website)
  const safeLearningUrl = escapeHtml(links.learning)
  const safeContactUrl = escapeHtml(links.contact)
  const safeYear = escapeHtml(nowYear)

  const html = `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#eef2f7;">
    <span style="font-size:1px;color:#ffffff;max-height:0;overflow:hidden;mso-hide:all;display:none;line-height:1px;opacity:0;">${safePreheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef2f7" style="background-color:#eef2f7;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;">
            <tr>
              <td style="padding:0 0 12px 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.4;color:#64748b;text-align:center;">
                Transactional email from ${safeBrandName}
              </td>
            </tr>
            <tr>
              <td bgcolor="#07152d" style="background-color:#07152d;padding:18px 22px;border-radius:10px 10px 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="72" valign="middle" style="padding-right:14px;">
                      <img src="${safeLogoUrl}" width="64" alt="${safeBrandName} logo" style="display:block;width:64px;height:auto;border:0;outline:none;text-decoration:none;" />
                    </td>
                    <td valign="middle">
                      <div style="font-family:Arial,sans-serif;font-size:22px;line-height:1.2;font-weight:700;color:#ffffff;">${safeBrandName}</div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.4;color:#c7d2fe;margin-top:3px;">${safeProgramName}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background-color:#ffffff;padding:22px;border-radius:0 0 10px 10px;border:1px solid #dbe4ef;border-top:none;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:26px;line-height:1.25;font-weight:700;color:#0f172a;margin:0;padding:0 0 12px 0;">${safeHeading}</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:16px;line-height:1.65;color:#334155;padding:0 0 18px 0;">${safeIntro}</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 0 18px 0;">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeActionUrl}" style="height:46px;v-text-anchor:middle;width:280px;" arcsize="8%" stroke="f" fillcolor="#0f4c81">
                        <w:anchorlock/>
                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;">${safeActionLabel}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a href="${safeActionUrl}" style="display:block;width:100%;max-width:320px;background-color:#0f4c81;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;padding:13px 24px;border-radius:6px;text-align:center;margin:0 auto;">${safeActionLabel}</a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #d9e2ec;border-radius:8px;padding:12px 14px;font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#475569;">
                      <div style="font-weight:700;color:#334155;margin-bottom:4px;">Security details</div>
                      <div>This link expires in ${safeExpiresIn}.</div>
                      ${safeSecurityNote ? `<div style="margin-top:8px;">${safeSecurityNote}</div>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#64748b;padding:14px 0 6px 0;">If the button does not work, copy and paste this URL into your browser:</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;line-height:1.55;color:#334155;word-break:break-all;padding:0 0 14px 0;">${safeActionUrl}</td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;padding-top:14px;font-family:Arial,sans-serif;">
                      <div style="font-size:13px;line-height:1.5;color:#64748b;">${safeSupportLine.replace(
                        safeSupportEmail,
                        `<a href="mailto:${safeSupportEmail}" style="color:#0f4c81;text-decoration:underline;">${safeSupportEmail}</a>`,
                      )}</div>
                      <div style="font-size:12px;line-height:1.5;color:#94a3b8;margin-top:8px;">
                        <a href="${safeWebsiteUrl}" style="color:#64748b;text-decoration:underline;">Website</a> ·
                        <a href="${safeLearningUrl}" style="color:#64748b;text-decoration:underline;">Learning Portal</a> ·
                        <a href="${safeContactUrl}" style="color:#64748b;text-decoration:underline;">Contact</a>
                      </div>
                      <div style="font-size:12px;line-height:1.45;color:#94a3b8;margin-top:8px;">${safeAwardLabel} · Cal Poly Pomona · © ${safeYear} ${safeBrandName}</div>
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
