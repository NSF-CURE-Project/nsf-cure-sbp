import React from 'react'

export const metadata = {
  title: {
    default: 'NSF CURE SBP',
    template: '%s | NSF CURE SBP',
  },
  description: 'NSF CURE SBP learning platform.',
}

type FrontendLayoutProps = {
  children: React.ReactNode
}

export default function FrontendLayout({ children }: FrontendLayoutProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f6f8fb' }}>{children}</body>
    </html>
  )
}
