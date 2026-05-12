import path from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(projectRoot, '..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: workspaceRoot,
  // The Payload admin UI lives at /admin; redirect the bare admin host
  // root so visiting https://admin.cppsbp.org/ lands on the login page.
  redirects: async () => [
    {
      source: '/',
      destination: '/admin',
      permanent: false,
    },
  ],
  // HSTS only in production. In dev the admin host (admin.sbp.local) is
  // served over HTTP, and emitting HSTS poisons the browser's cache so any
  // later http://*.sbp.local load (live-preview iframe to the web app) is
  // rejected as "refused to connect" until the cache is cleared.
  headers: async () =>
    process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/:path*',
            headers: [
              {
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              },
            ],
          },
        ]
      : [],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
