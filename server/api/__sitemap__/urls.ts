import artworkData from '~/content/artworks/index.json'
import newsData from '~/content/news/index.json'
import siteData from '~/content/site.json'
import type { ArtworkBase, NewsBase, SiteConfig } from '~/types/content'

export default defineSitemapEventHandler(() => {
  const site = siteData as SiteConfig
  const paths = [...site.menu.map(item => item.path), ...(artworkData.artworks as ArtworkBase[]).filter(item => item.published).map(item => `/artworks/${item.slug}`), ...(newsData.items as NewsBase[]).filter(item => item.published).map(item => `/news/${item.slug}`)]
  return paths.flatMap(path => site.availableLocales.map(locale => ({ loc: locale === site.defaultLocale ? path : `/${locale}${path === '/' ? '' : path}` })))
})
