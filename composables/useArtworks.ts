import artworkBaseData from '~/content/artworks/index.json'
import koArtworkData from '~/content/locales/ko/artworks.json'
import enArtworkData from '~/content/locales/en/artworks.json'
import siteData from '~/content/site.json'
import type { ArtworkBase, ArtworkTranslation, LocaleCode, LocalizedArtwork, SiteConfig } from '~/types/content'

interface ArtworkBaseCollection { artworks: ArtworkBase[] }
interface ArtworkTranslationCollection { artworks: ArtworkTranslation[] }
const baseCollection = artworkBaseData as ArtworkBaseCollection
const config = siteData as SiteConfig
const translations: Record<LocaleCode, ArtworkTranslationCollection> = {
  ko: koArtworkData as ArtworkTranslationCollection,
  en: enArtworkData as ArtworkTranslationCollection
}

export function useArtworks() {
  const { locale } = useLocale()
  const artworks = computed<LocalizedArtwork[]>(() => {
    const selected = translations[locale.value] ?? translations[config.defaultLocale]
    const fallback = translations[config.defaultLocale]
    const selectedMap = new Map(selected.artworks.map(item => [item.id, item]))
    const fallbackMap = new Map(fallback.artworks.map(item => [item.id, item]))
    return baseCollection.artworks.filter(item => item.published).sort((a, b) => a.order - b.order).flatMap((base): LocalizedArtwork[] => {
      const localized = selectedMap.get(base.id)
      const fallbackTranslation = fallbackMap.get(base.id)
      if (!localized && import.meta.dev) console.warn(`[content] Missing ${locale.value} translation for artwork id: ${base.id}; using ${config.defaultLocale}.`)
      const translation = localized ?? fallbackTranslation
      if (!translation) {
        if (import.meta.dev) console.warn(`[content] Artwork id ${base.id} has no default translation and was omitted.`)
        return []
      }
      return [{ ...base, ...translation }]
    })
  })
  const featuredArtworks = computed(() => artworks.value.filter(item => item.featured))
  const heroArtwork = computed(() => {
    const selected = config.heroArtworkId ? featuredArtworks.value.find(item => item.id === config.heroArtworkId) : undefined
    return selected ?? featuredArtworks.value[0] ?? null
  })
  const featuredWithoutHero = computed(() => featuredArtworks.value.filter(item => item.id !== heroArtwork.value?.id).slice(0, 4))
  const getArtworkBySlug = (slug: string): LocalizedArtwork | null => artworks.value.find(item => item.slug === slug) ?? null
  const getAdjacentArtworks = (slug: string): { previous: LocalizedArtwork | null; next: LocalizedArtwork | null } => {
    const index = artworks.value.findIndex(item => item.slug === slug)
    return {
      previous: index > 0 ? artworks.value[index - 1] ?? null : null,
      next: index >= 0 && index < artworks.value.length - 1 ? artworks.value[index + 1] ?? null : null
    }
  }
  return { artworks, featuredArtworks, heroArtwork, featuredWithoutHero, getArtworkBySlug, getAdjacentArtworks }
}
