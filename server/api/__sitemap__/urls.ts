import defaultData from '~/content/data/ko.json'
import type { LocaleBundle } from '~/types/content'

export default defineSitemapEventHandler(() => {
  const data = defaultData as LocaleBundle
  const site = data.site.settings
  const paths = [...site.menu.map(item => item.path), ...data.artworks.filter(item => item.published).map(item => `/artworks/${item.slug}`), ...data.news.items.filter(item => item.published).map(item => `/news/${item.slug}`)]
  return paths.flatMap(path => site.availableLocales.map(locale => ({ loc: locale === site.defaultLocale ? path : `/${locale}${path === '/' ? '' : path}` })))
})
