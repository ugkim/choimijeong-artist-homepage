import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode, LocalizedCvSection } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const siteConfig = bundles.ko.site.settings

export function useCv() {
  const { locale } = useLocale()
  const selected = computed(() => bundles[locale.value] ?? bundles[siteConfig.defaultLocale])
  const content = computed(() => selected.value.cv)
  const sections = computed<LocalizedCvSection[]>(() => {
    return content.value.sections.filter(item => item.published).sort((a, b) => a.order - b.order).map(section => {
      const entries = content.value.entries.filter(item => item.published && item.sectionId === section.id).sort((a, b) => {
        if (a.year === null && b.year === null) return a.order - b.order
        if (a.year === null) return 1
        if (b.year === null) return -1
        const byYear = siteConfig.cvPage.sortDirection === 'desc' ? b.year - a.year : a.year - b.year
        return byYear || a.order - b.order
      })
      return { ...section, entries }
    })
  })
  const pdfUrl = computed(() => {
    if (!siteConfig.cvPage.showPdfDownload) return null
    return content.value.pdf[locale.value]?.trim() || content.value.pdf[siteConfig.defaultLocale]?.trim() || null
  })
  return { content, sections, pdfUrl }
}
