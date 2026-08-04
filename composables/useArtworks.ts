import koData from '~/content/data/ko.json'
import enData from '~/content/data/en.json'
import type { LocaleBundle, LocaleCode, LocalizedArtwork } from '~/types/content'

const bundles: Record<LocaleCode, LocaleBundle> = { ko: koData as LocaleBundle, en: enData as LocaleBundle }
const config = bundles.ko.site.settings

export function useArtworks() {
  const { locale } = useLocale()
  const artworks = computed<LocalizedArtwork[]>(() => {
    const selected = bundles[locale.value] ?? bundles[config.defaultLocale]
    return selected.artworks.filter(item => item.published).sort((a, b) => a.order - b.order) as LocalizedArtwork[]
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
