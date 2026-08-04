import artworkData from './content/artworks/index.json'
import newsData from './content/news/index.json'
import siteData from './content/site.json'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'
const contentPaths = [
  ...siteData.menu.map(item => item.path),
  ...artworkData.artworks.filter(item => item.published).map(item => `/artworks/${item.slug}`),
  ...newsData.items.filter(item => item.published).map(item => `/news/${item.slug}`)
]
const prerenderRoutes = contentPaths.flatMap(path =>
  siteData.availableLocales.map(locale => locale === siteData.defaultLocale ? path : `/${locale}${path === '/' ? '' : path}`)
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  css: ['~/styles/main.scss'],
  components: [{ path: '~/components', pathPrefix: false }],
  modules: ['@nuxtjs/robots', '@nuxtjs/sitemap'],
  nitro: { preset: 'static', prerender: { crawlLinks: true, concurrency: 1, routes: prerenderRoutes } },
  site: { url: siteUrl },
  typescript: { strict: true, typeCheck: true },
  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#f5f2ec' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500&family=Prata&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: { siteUrl }
  },
  sitemap: { sources: ['/api/__sitemap__/urls'] },
  robots: { disallow: ['/admin/'] }
})
