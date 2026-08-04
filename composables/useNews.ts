import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode, LocalizedNewsItem } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const config = bundles.ko.site.settings

export function useNews() {
  const { locale } = useLocale()
  const content = computed(() => (bundles[locale.value] ?? bundles[config.defaultLocale]).news)
  const items = computed<LocalizedNewsItem[]>(() => {
    return content.value.items.filter(item => item.published).sort((a, b) => a.order - b.order)
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
