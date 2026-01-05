import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/account/', '/auth/'], // Protege áreas privadas
    },
    sitemap: 'https://vidiooh.com/sitemap.xml',
  }
}