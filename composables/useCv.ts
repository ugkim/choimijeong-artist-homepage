import cvData from '~/content/cv/index.json'
import koCvData from '~/content/locales/ko/cv.json'
import enCvData from '~/content/locales/en/cv.json'
import siteData from '~/content/site.json'
import type { CvConfig, CvEntryTranslation, CvSectionTranslation, LocaleCode, LocalizedCv, LocalizedCvSection, SiteConfig } from '~/types/content'

const cvConfig = cvData as CvConfig
const siteConfig = siteData as SiteConfig
const translations: Record<LocaleCode, LocalizedCv> = { ko: koCvData as LocalizedCv, en: enCvData as LocalizedCv }

export function useCv() {
  const { locale } = useLocale()
  const content = computed(() => translations[locale.value] ?? translations[siteConfig.defaultLocale])
  const fallback = translations[siteConfig.defaultLocale]
  const sections = computed<LocalizedCvSection[]>(() => {
    const sectionMap = new Map<string, CvSectionTranslation>(content.value.sections.map(item => [item.id, item]))
    const fallbackSectionMap = new Map<string, CvSectionTranslation>(fallback.sections.map(item => [item.id, item]))
    const entryMap = new Map<string, CvEntryTranslation>(content.value.entries.map(item => [item.id, item]))
    const fallbackEntryMap = new Map<string, CvEntryTranslation>(fallback.entries.map(item => [item.id, item]))
    return cvConfig.sections.filter(item => item.published).sort((a, b) => a.order - b.order).flatMap(baseSection => {
      const sectionTranslation = sectionMap.get(baseSection.id) ?? fallbackSectionMap.get(baseSection.id)
      if (!sectionTranslation) return []
      const entries = cvConfig.entries.filter(item => item.published && item.sectionId === baseSection.id).flatMap(baseEntry => {
        const translation = entryMap.get(baseEntry.id) ?? fallbackEntryMap.get(baseEntry.id)
        return translation ? [{ ...baseEntry, ...translation }] : []
      }).sort((a, b) => {
        if (a.year === null && b.year === null) return a.order - b.order
        if (a.year === null) return 1
        if (b.year === null) return -1
        const byYear = siteConfig.cvPage.sortDirection === 'desc' ? b.year - a.year : a.year - b.year
        return byYear || a.order - b.order
      })
      return [{ ...baseSection, ...sectionTranslation, entries }]
    })
  })
  const pdfUrl = computed(() => {
    if (!siteConfig.cvPage.showPdfDownload) return null
    return cvConfig.pdf[locale.value]?.trim() || cvConfig.pdf[siteConfig.defaultLocale]?.trim() || null
  })
  return { content, sections, pdfUrl }
}
