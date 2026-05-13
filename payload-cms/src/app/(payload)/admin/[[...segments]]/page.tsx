/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
/* NOTE: the generateMetadata export below was rewritten once to call our
 * own helper (src/lib/adminMetadata.ts) instead of Payload's
 * generatePageMetadata directly, so the "Admin" tab-title override lives
 * in a stable file. Re-apply this single-line swap if Payload regenerates
 * this file. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage } from '@payloadcms/next/views'
import { generateAdminPageMetadata } from '@/lib/adminMetadata'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = (args: Args): Promise<Metadata> =>
  generateAdminPageMetadata(args)

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
