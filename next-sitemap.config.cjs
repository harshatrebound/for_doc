/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://sportsorthopedics.in',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/admin/*', '/server-sitemap.xml'],
  additionalPaths: async (config) => {
    // You can add additional paths that might not be detected automatically
    return [
      // Any manual URLs you want to ensure are in the sitemap
    ]
  },
  robotsTxtOptions: {
    additionalSitemaps: [
      // If you have any additional sitemaps
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/admin'],
      },
    ],
  },
} 