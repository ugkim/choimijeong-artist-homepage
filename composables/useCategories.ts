import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode, LocalizedCategory } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const config = bundles.ko.site.settings

export function useCategories() {
  const { locale } = useLocale()
  const categories = computed<LocalizedCategory[]>(() => {
    const selected = bundles[locale.value] ?? bundles[config.defaultLocale]
    return selected.categories.filter(item => item.published).sort((a, b) => a.order - b.order) as LocalizedCategory[]
  })
  const categoryName = (id: string): string => categories.value.find(item => item.id === id)?.name ?? id
  return { categories, categoryName }
}
