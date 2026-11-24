import FaqPage from '@/views/faq/FaqPage'

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions for the NSF CURE SBP learning platform.',
  alternates: {
    canonical: 'https://www.cppsbp.org/faq',
  },
  openGraph: {
    title: 'FAQ | NSF CURE SBP',
    description: 'Frequently asked questions for the NSF CURE SBP learning platform.',
    url: 'https://www.cppsbp.org/faq',
    siteName: 'NSF CURE SBP',
    type: 'website',
  },
}

export default function Page() {
  return <FaqPage />
}
