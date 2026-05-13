import type { Metadata } from 'next'
import config from '@payload-config'
import { generatePageMetadata as payloadGeneratePageMetadata } from '@payloadcms/next/views'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

// Forces every admin tab title to a constant "Admin" instead of Payload's
// default `${segment} ${titleSuffix}` (which produced "Login Admin",
// "Dashboard Admin", etc.). Imported by the auto-generated admin page so
// the override survives regeneration of that file.
export const generateAdminPageMetadata = async (args: Args): Promise<Metadata> => {
  const meta = await payloadGeneratePageMetadata({ config, ...args })
  return { ...meta, title: 'Admin' }
}
