const BLOG = require('./blog.config')

/**
 * 通常没啥用，sitemap交给 /pages/sitemap.xml.js 动态生成
 */
const defaultUrl = 'https://notion-repo.local'
const resolvedUrl =
  BLOG.LINK && typeof BLOG.LINK === 'string' && BLOG.LINK.trim().startsWith('http')
    ? BLOG.LINK.trim()
    : defaultUrl

module.exports = {
  siteUrl: resolvedUrl,
  changefreq: 'daily',
  priority: 0.7,
  generateRobotsTxt: false,
  sitemapSize: 7000
  // ...other options
  // https://github.com/iamvishnusankar/next-sitemap#configuration-options
}
