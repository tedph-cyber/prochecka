import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prochecka.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/callback', '/docs', '/lib', '/hooks'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
