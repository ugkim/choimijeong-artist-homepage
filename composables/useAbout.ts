import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const siteConfig = bundles.ko.site.settings
const aboutConfig = bundles[siteConfig.defaultLocale].about.settings

export function useAbout() {
  const { locale } = useLocale()
  const { artworks } = useArtworks()
  const content = computed(() => (bundles[locale.value] ?? bundles[siteConfig.defaultLocale]).about.content)
  const featuredArtwork = computed(() => aboutConfig.featuredArtworkId
    ? artworks.value.find(item => item.id === aboutConfig.featuredArtworkId) ?? null
    : null)
  return { config: aboutConfig, content, featuredArtwork }
}
