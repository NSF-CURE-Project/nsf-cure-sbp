/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { cookies } from 'next/headers'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = async ({ children }: Args) => {
  const cookieStore = await cookies()
  const storedTheme =
    cookieStore.get('payload-admin-theme')?.value ?? cookieStore.get('payload-theme')?.value
  const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : undefined

  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
      htmlProps={
        theme ? ({ 'data-theme': theme } as React.HtmlHTMLAttributes<HTMLHtmlElement>) : undefined
      }
    >
      {children}
    </RootLayout>
  )
}

export default Layout
