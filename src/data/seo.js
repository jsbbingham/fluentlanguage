// Per-route SEO metadata — single source of truth for titles, descriptions,
// and canonical paths. Consumed by <Seo> on each page. The prerender step
// (scripts/prerender.mjs) snapshots each route after these are applied, so
// the values here end up in the static HTML crawlers see.

export const ORIGIN = 'https://www.fluentlanguage.net'

export const PAGE_SEO = {
  home: {
    path: '/',
    title: 'Isela Bingham | Spanish-English Interpreter & Translator in Stockton, CA',
    description:
      'Spanish–English interpreter and document translator in Stockton, CA. 20+ years serving legal, medical, and educational organizations across California.',
  },
  about: {
    path: '/about',
    title: 'About Isela Bingham — Spanish-English Interpreter, Stockton, CA',
    description:
      "20+ years of Spanish–English interpretation and translation experience — workers' compensation, healthcare, and IEP/education settings across California.",
  },
  reviews: {
    path: '/reviews',
    title: 'Client Reviews — Isela Bingham, Spanish-English Interpreter',
    description:
      "Read client reviews of Isela Bingham's Spanish–English interpretation and document translation services, and share your own experience.",
  },
  contact: {
    path: '/contact',
    title: 'Contact Isela Bingham — Translation & Interpretation Quotes',
    description:
      'Request a quote for Spanish–English document translation or interpretation. Based in Stockton, CA — responses within 24–48 hours.',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy — FluentLanguage.net',
    description:
      'How FluentLanguage.net collects, uses, and protects personal information submitted through the contact and review forms, including CCPA/CPRA rights for California residents.',
  },
  disclaimer: {
    path: '/disclaimer',
    title: 'Disclaimer — FluentLanguage.net',
    description:
      'Service terms and liability disclaimer for the Spanish–English translation and interpretation services provided by Isela Bingham through FluentLanguage.net.',
  },
  notFound: {
    path: '/',
    title: 'Page Not Found — FluentLanguage.net',
    description: "The page you're looking for doesn't exist or may have moved.",
    robots: 'noindex, follow',
  },
}
