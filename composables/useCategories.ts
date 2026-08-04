import categoryBaseData from '~/content/artworks/categories.json'
import koCategoryData from '~/content/locales/ko/categories.json'
import enCategoryData from '~/content/locales/en/categories.json'
import siteData from '~/content/site.json'
import type { CategoryBase, CategoryTranslation, LocaleCode, LocalizedCategory, SiteConfig } from '~/types/content'

interface CategoryBaseCollection { categories: CategoryBase[] }
interface CategoryTranslationCollection { categories: CategoryTranslation[] }

const baseCollection = categoryBaseData as CategoryBaseCollection
const config = siteData as SiteConfig
const translations: Record<LocaleCode, CategoryTranslationCollection> = {
  ko: koCategoryData as CategoryTranslationCollection,
  en: enCategoryData as CategoryTranslationCollection
}

export function useCategories() {
  const { locale } = useLocale()
  const categories = computed<LocalizedCategory[]>(() => {
    const selected = translations[locale.value] ?? translations[config.defaultLocale]
    const fallback = translations[config.defaultLocale]
    const selectedMap = new Map(selected.categories.map(item => [item.id, item]))
    const fallbackMap = new Map(fallback.categories.map(item => [item.id, item]))
    return baseCollection.categories.filter(item => item.published).sort((a, b) => a.order - b.order).flatMap((base): LocalizedCategory[] => {
      const translation = selectedMap.get(base.id) ?? fallbackMap.get(base.id)
      if (!selectedMap.has(base.id) && import.meta.dev) console.warn(`[content] Missing ${locale.value} category translation: ${base.id}; using ${config.defaultLocale}.`)
      return translation ? [{ ...base, ...translation }] : []
    })
  })
  const categoryName = (id: string): string => categories.value.find(item => item.id === id)?.name ?? id
  return { categories, categoryName }
}
