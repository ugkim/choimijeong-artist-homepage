import aboutData from '~/content/about/index.json'
import koAboutData from '~/content/locales/ko/about.json'
import enAboutData from '~/content/locales/en/about.json'
import siteData from '~/content/site.json'
import type { AboutConfig, LocaleCode, LocalizedAbout, SiteConfig } from '~/types/content'

const aboutConfig = aboutData as AboutConfig
const siteConfig = siteData as SiteConfig
const translations: Record<LocaleCode, LocalizedAbout> = {
  ko: koAboutData as LocalizedAbout,
  en: enAboutData as LocalizedAbout
}

export function useAbout() {
  const { locale } = useLocale()
  const { artworks } = useArtworks()
  const content = computed(() => translations[locale.value] ?? translations[siteConfig.defaultLocale])
  const featuredArtwork = computed(() => aboutConfig.featuredArtworkId
    ? artworks.value.find(item => item.id === aboutConfig.featuredArtworkId) ?? null
    : null)
  return { config: aboutConfig, content, featuredArtwork }
}
