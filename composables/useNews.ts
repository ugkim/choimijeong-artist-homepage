import newsData from '~/content/news/index.json'
import koNewsData from '~/content/locales/ko/news.json'
import enNewsData from '~/content/locales/en/news.json'
import siteData from '~/content/site.json'
import type { LocaleCode, LocalizedNews, LocalizedNewsItem, NewsBase, NewsItemTranslation, SiteConfig } from '~/types/content'

const baseItems = (newsData as { items: NewsBase[] }).items
const config = siteData as SiteConfig
const translations: Record<LocaleCode, LocalizedNews> = { ko: koNewsData as LocalizedNews, en: enNewsData as LocalizedNews }

export function useNews() {
  const { locale } = useLocale()
  const content = computed(() => translations[locale.value] ?? translations[config.defaultLocale])
  const fallback = translations[config.defaultLocale]
  const items = computed<LocalizedNewsItem[]>(() => {
    const selectedMap = new Map<string, NewsItemTranslation>(content.value.items.map(item => [item.id, item]))
    const fallbackMap = new Map<string, NewsItemTranslation>(fallback.items.map(item => [item.id, item]))
    return baseItems.filter(item => item.published).sort((a, b) => a.order - b.order).flatMap(base => {
      const translated = selectedMap.get(base.id) ?? fallbackMap.get(base.id)
      return translated ? [{ ...base, ...translated }] : []
    })
  })
  const categories = computed(() => content.value.categories)
  const getBySlug = (slug: string) => items.value.find(item => item.slug === slug) ?? null
  const getAdjacent = (slug: string) => {
    const index = items.value.findIndex(item => item.slug === slug)
    return { previous: index > 0 ? items.value[index - 1] ?? null : null, next: index >= 0 && index < items.value.length - 1 ? items.value[index + 1] ?? null : null }
  }
  const categoryName = (id: string) => categories.value.find(item => item.id === id)?.name ?? id
  const dateFormatter = computed(() => new Intl.DateTimeFormat(locale.value === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
  const formatDate = (value: string) => dateFormatter.value.format(new Date(`${value}T00:00:00`))
  const formatPeriod = (start: string, end: string | null) => end ? `${formatDate(start)} — ${formatDate(end)}` : formatDate(start)
  return { content, items, categories, getBySlug, getAdjacent, categoryName, formatDate, formatPeriod }
}
